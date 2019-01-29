import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';
import weightTestModules from './weight-test-modules';
import { TestLoader } from 'ember-qunit/test-loader';
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
    const loadBalance = this._urlParams.loadBalance;
    let partitions = this._urlParams.partition;
    let split = parseInt(this._urlParams.split, 10);

    split = isNaN(split) ? 1 : split;

    if (partitions === undefined) {
      partitions = [1];
    } else if (!Array.isArray(partitions)) {
      partitions = [partitions];
    }

    super.loadModules();

    if (loadBalance) {
      this.setupLoadBalanceHandlers();
      this._testModules = splitTestModules(
        weightTestModules(this._testModules),
        split,
        partitions
        );
      this._testem.emit('testem:set-modules-queue', this._testModules);
    } else {
      this._testModules = splitTestModules(this._testModules, split, partitions);
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
   * setupLoadBalanceHandlers() registers QUnit callbacks neeeded for the load-balance option.
   */
  setupLoadBalanceHandlers() {
    // this handler sets up testem event handlers to load a test module. The cleanup of handlers
    // ensures each event will only envoke one handler.
    // if no cleanup was done, multiple handlers will be envoked for a single event, causing
    // multiple get-next-test-module events, leading to uneven load balancing
    const nextModuleHandler = (resolve , reject) => {
      const getTestModule = (moduleName) => {
        try {
          this.loadIndividualModule(moduleName);

          // if no tests were added, request the next module
          if (this._qunit.config.queue.length === 0) {
            this._testem.emit('testem:get-next-test-module');
          } else {
            // `removeEventCallbacks` removes if the event queue contains the same callback for
            // an event.
            this._testem.removeEventCallbacks('testem:next-module-response', getTestModule);
            this._testem.removeEventCallbacks('testem:module-queue-complete', moduleComplete);
            resolve();
          }
        } catch (err) {
          reject(err);
        }
      }
      const moduleComplete = () => {
        this._testem.removeEventCallbacks('testem:next-module-response', getTestModule);
        resolve();
      }

      this._testem.on('testem:next-module-response', getTestModule);
      this._testem.on('testem:module-queue-complete', moduleComplete);
      this._testem.emit('testem:get-next-test-module');
    }

    this._qunit.begin(() => {
      return new self.Promise(nextModuleHandler);
    });

    this._qunit.moduleDone(() =>{
      return new self.Promise(nextModuleHandler);
    });
  }
}
