import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';
import weightTestModules from './weight-test-modules';
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
export default class EmberExamQUnitTestLoader extends TestLoader {
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
   */
  static load() {
    throw new Error('`EmberExamQUnitTestLoader` doesn\'t support `load()`.');
  }

  /**
   * require() collects the full list of modules before requiring each module with
   * super.require(), instead of requiring and unseeing a module when each gets loaded.
   *
   * @param {string} moduleName
   */
  require(moduleName) {
    this._testModules.push(moduleName);
  }

  /**
   * Make unsee a no-op to avoid any unwanted resets
   */
  unsee() {}

  /**
   * Loads the test modules depending on the urlParam
   */
  loadModules() {
    // if url params has browser key it's defaulting to load tests balance
    const browserId = this._urlParams.get('browser');
    let partitions = this._urlParams.get('partition');
    let partitionCount = parseInt(this._urlParams.get('partitionCount'), 10);

    partitionCount = isNaN(partitionCount) ? 1 : partitionCount;

    if (partitions === undefined) {
      partitions = [1];
    } else if (!Array.isArray(partitions)) {
      partitions = [partitions];
    }

    super.loadModules();

    if (browserId && this._testem) {
      this.setupLoadBalanceHandlers();
      this._testModules = splitTestModules(
        weightTestModules(this._testModules),
        partitionCount,
        partitions
      );
      this._testem.emit(
        'testem:set-modules-queue',
        this._testModules,
        browserId
      );
    } else {
      this._testModules = splitTestModules(
        this._testModules,
        partitionCount,
        partitions
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
   * @param {string} moduleName
   */
  loadIndividualModule(moduleName) {
    if (moduleName === undefined) {
      throw new Error(
        'Failed to load a test module. `moduleName` is undefined in `loadIndividualModule`.'
      );
    }
    super.require(moduleName);
    super.unsee(moduleName);
  }

  /**
   * setupLoadBalanceHandlers() registers QUnit callbacks needed for the load-balance option.
   */
  setupLoadBalanceHandlers() {
    // nextModuleAsyncIterator handles the async testem events
    // it returns an element of {value: <moduleName>, done: boolean}
    const nextModuleAsyncIterator = new AsyncIterator(this._testem, {
      request: 'testem:next-module-request',
      response: 'testem:next-module-response'
    });

    const nextModuleHandler = () => {
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
        }).catch(e => {
          if (typeof e === 'object' && e !== null && typeof e.message === 'string') {
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
