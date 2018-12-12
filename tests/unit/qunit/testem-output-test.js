import { module, test } from 'qunit';
import TestemOutput from 'ember-exam/test-support/-private/patch-testem-output';

module('Unit | patch-testem-output', () => {
  test('add partition number to test name when `split` is passed', function(assert) {
    assert.deepEqual(
      'Exam Partition 1 - test_module | test_name',
      TestemOutput.updateTestName({split: 2}, 'test_module | test_name'));
  });

  test('add partition number to test name when `split` and `partition` are passed', function(assert) {
    assert.deepEqual(
      'Exam Partition 2 - test_module | test_name',
      TestemOutput.updateTestName({split: 2, partition: 2}, 'test_module | test_name'));
  });

  test('add browser number to test name when `loadBalance` and `browser` are passed', function(assert) {
    assert.deepEqual(
      'Browser Id 1 - test_module | test_name',
      TestemOutput.updateTestName({loadBalance: 2, browser: 1}, 'test_module | test_name'));
  });

  test('add partition number, browser number to test name when `split`, `partition`, `browser`, and `loadBalance` are  passed', function(assert) {
    assert.deepEqual(
      'Exam Partition 2 - Browser Id 1 - test_module | test_name',
      TestemOutput.updateTestName({split: 2, partition: 2, browser:1, loadBalance: 2}, 'test_module | test_name'));
  });
});
