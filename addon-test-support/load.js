import TestemOutput from './-private/patch-testem-output';
import getTestLoader from './-private/get-test-loader';

let loaded = false;
let testLoader;

/**
 * Setup EmberExamTestLoader to enable ember exam functionalities
 */
function loadEmberExam() {
  if (loaded) {
    // eslint-disable-next-line no-console
    console.warn('Attempted to load Ember Exam more than once.');
    return;
  }

  loaded = true;
  const EmberExamTestLoader = getTestLoader();
  testLoader = new EmberExamTestLoader(window.Testem);

  if (window.Testem) {
    TestemOutput.patchTestemOutput(testLoader.urlParams);
  }
}

/**
 * Equivalent to ember-qunit or ember-mocha's loadTest() except this does not create a new TestLoader instance
 */
function loadTests() {
  if (testLoader === undefined) {
    throw new Error(
      'A testLoader instance has not been created. You must call `loadEmberExam()` before calling `loadTest()`.'
    );
  }

  testLoader.loadModules();
}

export default {
  loadEmberExam,
  loadTests
};