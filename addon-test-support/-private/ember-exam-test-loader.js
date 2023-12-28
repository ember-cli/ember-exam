import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';
import weightTestModules from './weight-test-modules';
import { filterTestModules } from './filter-test-modules';
import { TestLoader } from 'ember-qunit/test-loader';
import AsyncIterator from './async-iterator';
import QUnit from 'qunit';

/**
 * EmberExamQUnitTestLoader allows delayed requiring of test modules to enable test load balancing
 * It extends ember-qunit/test-loader used by `ember test`, since it overrides moduleLoadFailure()
 * to log a test failure when a module fails to load
 * @class EmberExamQUnitTestLoader
 * @extends {TestLoader}
 */
export default class EmberExamTestLoader extends TestLoader {
  constructor(testem, urlParams, qunit = QUnit) {
    super();
    this._testModules = [];
    this._testem = testem;
    this._qunit = qunit;
    this._urlParams = urlParams || getUrlParams();
  }

  get urlParams() {
    return this._urlParams;
  }

  /**
   * ember-cli-test-loader instantiates a new TestLoader instance and calls loadModules.
   * EmberExamQUnitTestLoader does not support load() in favor of loadModules().
   *
   * @method load
   */
  static load() {
    throw new Error("`EmberExamQUnitTestLoader` doesn't support `load()`.");
  }

  /**
   * require() collects the full list of modules before requiring each module with
   * super.require(), instead of requiring and unseeing a module when each gets loaded.
   *
   * @method require
   * @param {string} moduleName
   */
  require(moduleName) {
    this._testModules.push(moduleName);
  }

  /**
   * Make unsee a no-op to avoid any unwanted resets
   *
   * @method unsee
   */
  unsee() {}

  /**
   * Loads the test modules depending on the urlParam
   *
   * @method loadModules
   */
  loadModules() {
    const loadBalance = this._urlParams.get('loadBalance');
    const browserId = this._urlParams.get('browser');
    const modulePath = this._urlParams.get('modulePath');
    const filePath = this._urlParams.get('filePath');
    let partitions = this._urlParams.get('partition');
    let split = parseInt(this._urlParams.get('split'), 10);

    split = isNaN(split) ? 1 : split;

    if (partitions === undefined) {
      partitions = [1];
    } else if (!Array.isArray(partitions)) {
      partitions = [partitions];
    }

    super.loadModules();
    this.setupModuleMetadataHandler();

    if (modulePath || filePath) {
      this._testModules = filterTestModules(
        this._testModules,
        modulePath,
        filePath,
      );
    }

    if (loadBalance && this._testem) {
      this.setupLoadBalanceHandlers();
      this._testModules = splitTestModules(
        weightTestModules(this._testModules),
        split,
        partitions,
      );
      this._testem.emit(
        'testem:set-modules-queue',
        this._testModules,
        browserId,
      );
    } else {
      this._testModules = splitTestModules(
        this._testModules,
        split,
        partitions,
      );
      this._testModules.forEach((moduleName) => {
        super.require(moduleName);
        super.unsee(moduleName);
      });
    }
  }

  /**
   * Allow loading one module at a time.
   *
   * @method loadIndividualModule
   * @param {string} moduleName
   */
  loadIndividualModule(moduleName) {
    if (moduleName === undefined) {
      throw new Error(
        'Failed to load a test module. `moduleName` is undefined in `loadIndividualModule`.',
      );
    }
    super.require(moduleName);
    super.unsee(moduleName);
  }

  /**
   * setupModuleMetadataHandler() register QUnit callback to enable generating module metadata file.
   *
   * @method setupModuleMetadataHandler
   */
  setupModuleMetadataHandler() {
    this._qunit.testDone((metadata) => {
      if (typeof this._testem !== 'undefined' && this._testem !== null) {
        // testem:test-done-metadata is sent to server to track test module details.
        // metadata contains name, module, failed, passed, total, duration, skipped, and todo.
        // https://api.qunitjs.com/callbacks/QUnit.testDone
        this._testem.emit('testem:test-done-metadata', metadata);
      }
    });
  }

  /**
   * setupLoadBalanceHandlers() registers QUnit callbacks needed for the load-balance option.
   *
   * @method setupLoadBalanceHandlers
   */
  setupLoadBalanceHandlers() {
    // nextModuleAsyncIterator handles the async testem events
    // it returns an element of {value: <moduleName>, done: boolean}
    const nextModuleAsyncIterator = new AsyncIterator(this._testem, {
      request: 'testem:next-module-request',
      response: 'testem:next-module-response',
      timeout: this._urlParams.get('asyncTimeout'),
      browserId: this._urlParams.get('browser'),
      emberExamExitOnError: this._urlParams.get('_emberExamExitOnError'),
    });

    const nextModuleHandler = () => {
      // if there are already tests queued up, don't request next module
      // this is possible if a test file has multiple qunit modules
      if (this._qunit.config.queue.length > 0) {
        return;
      }

      return nextModuleAsyncIterator
        .next()
        .then((response) => {
          if (!response.done) {
            const moduleName = response.value;
            this.loadIndividualModule(moduleName);

            // if no tests were added, request the next module
            if (this._qunit.config.queue.length === 0) {
              return nextModuleHandler();
            }
          }
        })
        .catch((e) => {
          if (
            typeof e === 'object' &&
            e !== null &&
            typeof e.message === 'string'
          ) {
            e.message = `EmberExam: Failed to get next test module: ${e.message}`;
          }
          throw new Error(`EmberExam: Failed to get next test module: ${e}`);
        });
    };

    // it registers qunit begin callback to ask for a next test moudle to execute when the test suite begins.
    // By default ember-qunit adds `Ember.onerror` test to a qunit processing queue and once the test is complete it execute _qunit.moduleDone callback.
    // However, when `setupEmberOnerrorValidation: false` is passed the test is disabled and _qunit.begin callback needs to request a next test module to run.
    this._qunit.begin(() => {
      return nextModuleHandler();
    });

    this._qunit.moduleDone(() => {
      return nextModuleHandler();
    });
  }
}
