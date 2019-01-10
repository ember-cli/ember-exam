/* globals require, requirejs */

/**
 * Returns ember-exam-qunit-test-loader or ember-exam-mocha-test-loader
 *
 * @export
 * @returns {Object}
 */
export default function getTestLoader() {
  if (requirejs.entries['ember-qunit/test-loader']) {
    const TestLoaderModule = require('./ember-exam-qunit-test-loader');
    return TestLoaderModule['default'];
  } else if (requirejs.entries['ember-mocha/test-loader']) {
    const TestLoaderModule = require('./ember-exam-mocha-test-loader');
    return TestLoaderModule['default'];
  }

  throw new Error('Cannot find known test loader.');
}