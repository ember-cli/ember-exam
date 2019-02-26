import getUrlParams from './get-url-params';
import splitTestModules from './split-test-modules';

export default function patchTestLoader(TestLoader) {
  TestLoader._urlParams = getUrlParams();
}
