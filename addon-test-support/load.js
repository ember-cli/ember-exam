import getTestLoader from './-private/get-test-loader';
import patchTestLoader from './-private/patch-test-loader';
import patchTestemOutput from './-private/patch-testem-output';

let loaded = false;

const ALREADY_LOADED = 1;
const LOAD_SUCCESS = 0;

export default function loadEmberExam() {
  if (loaded) {
    return ALREADY_LOADED;
  }

  loaded = true;

  const TestLoader = getTestLoader();
  patchTestLoader(TestLoader);

  if (window.Testem) {
    patchTestemOutput(TestLoader);
  }

  return LOAD_SUCCESS;
}
