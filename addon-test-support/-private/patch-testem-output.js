/* globals Testem */

/**
 * Returns a modified test name including browser or partition information
 *
 * @function updateTestName
 * @param {Map} urlParams
 * @param {string} testName
 * @return {string} testName
 */
export function updateTestName(urlParams, testName) {
  const split = urlParams.get('split');
  const loadBalance = urlParams.get('loadBalance');

  const partition = urlParams.get('partition') || 1;
  const browser = urlParams.get('browser') || 1;

  const preserveTestName = !!urlParams.get('preserveTestName');

  if (preserveTestName) {
    return testName;
  } else if (split && loadBalance) {
    testName = `Exam Partition ${partition} - Browser Id ${browser} - ${testName}`;
  } else if (split) {
    testName = `Exam Partition ${partition} - ${testName}`;
  } else if (loadBalance) {
    testName = `Browser Id ${browser} - ${testName}`;
  }

  return testName;
}

/**
 * Setup testem test-result event to update the test name when a test completes
 *
 * @function patchTestemOutput
 * @param {Map} urlParams
 */
export function patchTestemOutput(urlParams) {
  Testem.on('test-result', (test) => {
    test.name = updateTestName(urlParams, test.name);
  });
}
