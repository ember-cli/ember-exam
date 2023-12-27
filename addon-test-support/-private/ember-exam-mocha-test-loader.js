import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';
import { filterTestModules } from './filter-test-modules';
import { TestLoader } from 'ember-mocha/test-loader';

/**
 * EmberExamMochaTestLoader extends ember-mocha/test-loader used by `ember test`, since it
 * overrides moduleLoadFailure() to log a test failure when a module fails to load
 * @class EmberExamMochaTestLoader
 * @extends {TestLoader}
 */
export default class EmberExamMochaTestLoader extends TestLoader {
  constructor(testem, urlParams) {
    super();
    this._testModules = [];
    this._testem = testem;
    this._urlParams = urlParams || getUrlParams();
  }

  get urlParams() {
    return this._urlParams;
  }

  /**
   * Ember-cli-test-loader instantiates a new TestLoader instance and calls loadModules.
   * EmberExamMochaTestLoader does not support load() in favor of loadModules().
   *
   * @method load
   */
  static load() {
    throw new Error("`EmberExamMochaTestLoader` doesn't support `load()`.");
  }

  /**
   * require() collects the full list of modules before requiring each module with
   * super.require, instead of requiring and unseeing a module when each gets loaded.
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

    if (modulePath || filePath) {
      this._testModules = filterTestModules(
        this._testModules,
        modulePath,
        filePath,
      );
    }

    this._testModules = splitTestModules(this._testModules, split, partitions);
    this._testModules.forEach((moduleName) => {
      super.require(moduleName);
      super.unsee(moduleName);
    });
  }
}
