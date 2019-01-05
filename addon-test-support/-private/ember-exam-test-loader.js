import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';
import weightTestModules from './weight-test-modules';
import getTestLoader from './get-test-loader';

let TestLoader = getTestLoader();

TestLoader.prototype.actualRequire = TestLoader.prototype.require;
TestLoader.prototype.actualUnsee = TestLoader.prototype.unsee;

/**
 * EmberExamTestLoader allows delayed requiring of test modules to enable test load balancing
 * It extends ember-qunit or ember-mocha used by `ember test`, this is important since the
 * test-loader from each of these dependency overrides moduleLoadFailure to log a test
 * failure when a module fails to load
 * @class EmberExamTestLoader
 * @extends {TestLoader}
 */
export default class EmberExamTestLoader extends TestLoader {
  constructor(testem, urlParams) {
    super();
    this._testModules = [];
    this._testem = testem;
    this._urlParams = urlParams || getUrlParams();
  }

  get urlParams() {
    return this._urlParams;
  }

  // ember-cli-test-loader instanciates a new TestLoader instance and calls loadModules.
  // EmberExamTestLoader does not support load() in favor of loadModules().
  static load() {
    throw new Error('`EmberExamTestLoader` doesn\'t support `load()`.');
  }

  // EmberExamTestLoader collects the full list of modules before requiring each module with
  // actualRequire(), instead of requiring and unseeing a module when each gets loaded.
  require(moduleName) {
    this._testModules.push(moduleName);
  }

  unsee() {}

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
      this._testModules = splitTestModules(weightTestModules(this._testModules), split, partitions);
      this._testem.emit('testem:set-modules-queue', this._testModules);
    } else {
      this._testModules = splitTestModules(this._testModules, split, partitions);
      this._testModules.forEach((moduleName) => {
        this.actualRequire(moduleName);
        this.actualUnsee(moduleName);
      });
    }
  }

  // allow loading one module at a time.
  loadIndividualModule(moduleName) {
    if (moduleName === undefined) {
      throw new Error('Failed to load a test module. `moduleName` is undefined in `loadIndividualModule`.')
    }
    this.actualRequire(moduleName);
    this.actualUnsee(moduleName);
  }
}
