/* globals Testem */

// Add the partition number for better debugging when reading the reporter
export default function patchTestemOutput(TestLoader) {
  Testem.on('test-result', function prependPartition(test) {
    const urlParams = TestLoader._urlParams;
    const split = urlParams._split;

    if (split) {
      const partition = urlParams._partition || 1;
      test.name = `Exam Partition ${partition} - ${test.name}`;
    }
  });
}
