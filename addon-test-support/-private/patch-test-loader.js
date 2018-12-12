/* globals Testem */
import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';
import weightTestModules from './weight-test-modules';
import getTestLoader from './get-test-loader';

const TestLoader = getTestLoader();

TestLoader.prototype.actualRequire = TestLoader.prototype.require;
TestLoader.prototype.actualUnsee = TestLoader.prototype.unsee;

export default class EmberExamTestLoader extends TestLoader {

  constructor() {
    super();
    this._testModules = [];
    this._urlParams = getUrlParams();
  }

  get urlParams() {
    return this._urlParams;
  }

  static load() {
    throw new Error('`EmberExamTestLoader` doesn\'t support `load()`.');
  }

  // EmberExamTestLoader requires and unsees modules after splitting or sorting a list of modules instead of
  // requiring and unseeing as loading modules.
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
      this._testModules = weightTestModules(this._testModules);
    }

    this._testModules = splitTestModules(this._testModules, split, partitions);

    if (loadBalance) {
      Testem.emit('testem:set-modules-queue', this._testModules);
    } else {
      this._testModules.forEach((moduleName) => {
        this.actualRequire(moduleName);
        this.actualUnsee(moduleName);
      });
    }
  }

  // enables to load a module one at a time.
  loadIndividualModule(moduleName) {
    if (moduleName === undefined) {
      throw new Error('Failed to load a test module. `moduleName` is undefined in `loadIndividualModule`.')
    }
    this.actualRequire(moduleName);
    this.actualUnsee(moduleName);
  }
}
