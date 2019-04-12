/* globals require */

import { getTestFramework } from './-private/get-test-loader';
import { loadEmberExam, loadTests } from 'ember-exam/test-support/load';

/**
 * Ember-exam's own start function to set up EmberExamTestLoader, load tests and calls start() from
 * ember-qunit or ember-mocha
 *
 * @param {*} qunitOptions
 */
export default function start(qunitOptions) {
  const modifiedOptions = qunitOptions || Object.create(null);
  modifiedOptions.loadTests = false;

  const testLoader = loadEmberExam();
  loadTests(testLoader);

  const emberTestFramework = require(getTestFramework());

  if (emberTestFramework.start) {
    emberTestFramework.start(modifiedOptions);
  }
}
