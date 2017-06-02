import getTestLoader from './-private/get-test-loader';
import patchTestLoader from './-private/patch-test-loader';
import patchTestemOutput from './-private/patch-testem-output';

let loaded = false;

export default function loadEmberExam() {
  if (loaded) {
    return;
  }

  loaded = true;

  const TestLoader = getTestLoader();
  patchTestLoader(TestLoader);

  if (window.Testem) {
    patchTestemOutput(TestLoader);
  }
}
