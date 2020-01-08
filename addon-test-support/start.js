/* globals require */

import loadEmberExam from 'ember-exam/test-support/load';

/**
 * Equivalent to ember-qunit or ember-mocha's loadTest() except this does not create a new TestLoader instance
 *
 * @function loadTests
 * @param {*} testLoader
 */
function loadTests(testLoader) {
  if (testLoader === undefined) {
    throw new Error(
      'A testLoader instance has not been created. You must call `loadEmberExam()` before calling `loadTest()`.'
    );
  }

  testLoader.loadModules();
}

/**
 * Ember-exam's own start function to set up EmberExamTestLoader, load tests and calls start() from
 * ember-qunit or ember-mocha
 *
 * @function start
 * @param {*} qunitOptions
 */
export default function start(qunitOptions) {
  const framework = require.has('ember-qunit') ? 'qunit' : 'mocha';
  const modifiedOptions = qunitOptions || Object.create(null);
  modifiedOptions.loadTests = false;

  const testLoader = loadEmberExam();
  loadTests(testLoader);

  const emberTestFramework = require(`ember-${framework}`);

  if (emberTestFramework.start) {
    emberTestFramework.start(modifiedOptions);
  }
}
