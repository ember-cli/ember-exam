/* globals Testem */

// Add the partition number for better debugging when reading the reporter
export default function patchTestemOutput(TestLoader) {
  Testem.on('test-result', function prependPartition(test) {
    const urlParams = TestLoader._urlParams;
    const split = urlParams.split;
    const loadBalance = urlParams.loadBalance;

    const partition = urlParams.partition || 1;
    const browser = urlParams.browser || 1;

    if (split && loadBalance) {
      test.name = `Exam Partition ${partition} - Browser Id ${browser} - ${test.name}`
    } else if (split) {
      test.name = `Exam Partition ${partition} - ${test.name}`;
    } else if (loadBalance) {
      test.name = `Browser Id ${browser} - ${test.name}`;
    }
  });
}
