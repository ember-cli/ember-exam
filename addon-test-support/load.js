import { patchTestemOutput } from './-private/patch-testem-output';
import getTestLoader from './-private/get-test-loader';

let loaded = false;

/**
 * Setup EmberExamTestLoader to enable ember exam functionalities
 *
 * @function loadEmberExam
 * @return {*} testLoader
 */
export default function loadEmberExam() {
  if (loaded) {
    // eslint-disable-next-line no-console
    console.warn('Attempted to load Ember Exam more than once.');
    return;
  }

  loaded = true;
  const EmberExamTestLoader = getTestLoader();
  const testLoader = new EmberExamTestLoader(window.Testem);

  if (window.Testem) {
    patchTestemOutput(testLoader.urlParams);
  }

  return testLoader;
}
