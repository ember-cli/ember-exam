import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';

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
    let partitions = urlParams._partition;
    let split = parseInt(urlParams._split, 10);

    split = isNaN(split) ? 1 : split;

    if (partitions === undefined) {
      partitions = [1];
    } else if (!Array.isArray(partitions)) {
      partitions = [partitions];
    }

    const testLoader = this;

    testLoader._testModules = [];
    _super.loadModules.apply(testLoader, arguments);

    const splitModules = splitTestModules(testLoader._testModules, split, partitions);

    splitModules.forEach((modulePath) => {
      _super.require.call(testLoader, modulePath);
      _super.unsee.call(testLoader, modulePath);
    });
  };

  /**
   * Require and unsee a given module path in order to load the moudle path onto processingQueue
   * 
   * @param {String} modulePath 
   */
  TestLoader.prototype.loadIndividualModule = function _emberExamLoadIndividualModule(modulePath) {
    const testLoader = this;
    if (modulePath) {
      _super.require.call(testLoader, modulePath);
      _super.unsee.call(testLoader, modulePath);
      return modulePath;
    }
    return null;
  }
}
