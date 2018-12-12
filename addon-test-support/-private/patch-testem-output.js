/* globals Testem */

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

function patchTestemOutput(urlParams) {
  Testem.on('test-result', (test) => {
    test.name = updateTestName(urlParams, test.name);
  });
}

export default {
  updateTestName,
  patchTestemOutput
};
