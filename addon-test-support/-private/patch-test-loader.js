/* globals Testem */
import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';
import weightTestModules from './weight-test-modules';

export default function patchTestLoader(TestLoader) {
  TestLoader._urlParams = getUrlParams();

  const _super = {
    require: TestLoader.prototype.require,
    unsee: TestLoader.prototype.unsee,
    loadModules: TestLoader.prototype.loadModules,
  };

  // "Require" the module by adding it to the array of test modules to load
  TestLoader.prototype.require = function _emberExamRequire(name) {
    this._testModules.push(name);
  };

  // Make unsee a no-op to avoid any unwanted resets
  TestLoader.prototype.unsee = function _emberExamUnsee() {};

  TestLoader.prototype.loadModules = function _emberExamLoadModules() {
    const urlParams = TestLoader._urlParams;
    const loadBalance = urlParams.loadBalance;
    let partitions = urlParams.partition;
    let split = parseInt(urlParams.split, 10);

    split = isNaN(split) ? 1 : split;

    if (partitions === undefined) {
      partitions = [1];
    } else if (!Array.isArray(partitions)) {
      partitions = [partitions];
    }

    const testLoader = this;

    this.modules = testLoader._testModules = [];
    _super.loadModules.apply(testLoader, arguments);

    if (loadBalance) {
      this.modules = weightTestModules(this.modules);
    }

    this.modules = splitTestModules(this.modules, split, partitions);

    if (loadBalance) {
      Testem.emit('set-modules-queue', this.modules);
    } else {
      this.modules.forEach((moduleName) => {
        _super.require.call(testLoader, moduleName);
        _super.unsee.call(testLoader, moduleName);
      });
    }
  };

  TestLoader.prototype.loadIndividualModule = function _emberExamLoadIndividualModule(moduleName) {
    const testLoader = this;
    if (moduleName) {
      _super.require.call(testLoader, moduleName);
      _super.unsee.call(testLoader, moduleName);
      return moduleName;
    }
    return null;
  }
}