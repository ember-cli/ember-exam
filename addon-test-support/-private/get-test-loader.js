/* globals require, requirejs */

export default function getTestLoader() {
  let testLoaderModulePath = 'ember-qunit/test-loader';

  if (!requirejs.entries[testLoaderModulePath]) {
    testLoaderModulePath = 'ember-mocha/test-loader';
  }

  const TestLoaderModule = require(testLoaderModulePath);
  return TestLoaderModule['TestLoader'];
}