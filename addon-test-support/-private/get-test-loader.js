/* globals require, requirejs */

export default function getTestLoader() {
  let testLoaderModulePath = 'ember-cli-test-loader/test-support/index';

  if (!requirejs.entries[testLoaderModulePath]) {
    testLoaderModulePath = 'ember-cli/test-loader';
  }

  const TestLoaderModule = require(testLoaderModulePath);
  return TestLoaderModule['default'];
}
