/* globals Testem */

/**
 * Returns a modified test name including browser or partition information
 *
 * @param {Map} urlParams
 * @param {string} testName
 * @returns {string} testName
 */
export function updateTestName(urlParams, testName) {
  const partitionCount = urlParams.get('partitionCount');

  const partition = urlParams.get('partition') || 1;
  const browser = urlParams.get('browser');

  if (partitionCount && browser) {
    testName = `Exam Partition ${partition} - Browser Id ${browser} - ${testName}`
  } else if (partitionCount) {
    testName = `Exam Partition ${partition} - ${testName}`;
  } else if (browser) {
    testName = `Browser Id ${browser} - ${testName}`;
  }

  return testName;
}

/**
 * Setup testem test-result event to update the test name when a test completes
 *
 * @param {Map} urlParams
 */
export function patchTestemOutput(urlParams) {
  Testem.on('test-result', (test) => {
    test.name = updateTestName(urlParams, test.name);
  });
}
