import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';
import { describe, it } from 'mocha';

// get testLoader from 'ember-qunit/test-loader' once a new version get's released
import TestLoader from 'ember-cli-test-loader/test-support/index';

/**
 * EmberExamMochaTestLoader extends ember-cli-test-loader used by `ember test`
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
   */
  static load() {
    throw new Error('`EmberExamMochaTestLoader` doesn\'t support `load()`.');
  }

  /**
   * require() collects the full list of modules before requiring each module with
   * super.require, instead of requiring and unseeing a module when each gets loaded.
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
   * ensure a test failure is reported if a module cannot be loaded
   *
   * @param {string} moduleName
   * @param {error} error
   */
  moduleLoadFailure(moduleName, error) {
    describe('TestLoader Failures', function() {
      it(moduleName + ': could not be loaded', function() {
        throw error;
      });
    });
  }

  /**
   * Loads the test modules depending on the urlParam
   */
  loadModules() {
    let partitions = this._urlParams.get('partition');
    let split = parseInt(this._urlParams.get('split'), 10);

    split = isNaN(split) ? 1 : split;

    if (partitions === undefined) {
      partitions = [1];
    } else if (!Array.isArray(partitions)) {
      partitions = [partitions];
    }

    super.loadModules();

    this._testModules = splitTestModules(this._testModules, split, partitions);
    this._testModules.forEach((moduleName) => {
      super.require(moduleName);
      super.unsee(moduleName);
    });
  }
}
