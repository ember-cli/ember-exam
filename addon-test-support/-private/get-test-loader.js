/* globals require, requirejs */

/**
 * Returns ember-qunit or ember-mocha's test loader
 *
 * @export
 * @returns {Object}
 */
export default function getTestLoader() {
  let testLoaderModulePath = 'ember-qunit/test-loader';

  if (!requirejs.entries[testLoaderModulePath]) {
    testLoaderModulePath = 'ember-mocha/test-loader';
  }

  const TestLoaderModule = require(testLoaderModulePath);
  return TestLoaderModule['TestLoader'];
}