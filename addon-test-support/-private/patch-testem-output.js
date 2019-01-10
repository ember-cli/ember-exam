/* globals Testem */

/**
 * Returns a modified test name including browser or partition information
 *
 * @param {Object} urlParams
 * @param {string} testName
 * @returns {string} testName
 */
function updateTestName(urlParams, testName) {
  const split = urlParams.split;
  const loadBalance = urlParams.loadBalance;

  const partition = urlParams.partition || 1;
  const browser = urlParams.browser || 1;

  if (split && loadBalance) {
    testName = `Exam Partition ${partition} - Browser Id ${browser} - ${testName}`
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
 * @param {Object} urlParams
 */
function patchTestemOutput(urlParams) {
  Testem.on('test-result', (test) => {
    test.name = updateTestName(urlParams, test.name);
  });
}

export default {
  updateTestName,
  patchTestemOutput
};
