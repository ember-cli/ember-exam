import { module, test } from 'qunit';
import TestemOutput from 'ember-exam/test-support/-private/patch-testem-output';

module('Unit | patch-testem-output', () => {
  test('add partition number to test name when `partitionCount` is passed', function(assert) {
    assert.deepEqual(
      'Exam Partition 1 - test_module | test_name',
      TestemOutput.updateTestName(
        new Map().set('partitionCount', 2),
        'test_module | test_name'
      )
    );
  });

  test('add partition number to test name when `partitionCount` and `partition` are passed', function(assert) {
    assert.deepEqual(
      'Exam Partition 2 - test_module | test_name',
      TestemOutput.updateTestName(
        new Map().set('partitionCount', 2).set('partition', 2),
        'test_module | test_name'
      )
    );
  });

  test('add browser number to test name when `browser` is passed', function(assert) {
    assert.deepEqual(
      'Browser Id 1 - test_module | test_name',
      TestemOutput.updateTestName(
        new Map().set('browser', 1),
        'test_module | test_name'
      )
    );
  });

  test('add partition number, browser number to test name when `partitionCount`, `partition`, and `browser` are  passed', function(assert) {
    assert.deepEqual(
      'Exam Partition 2 - Browser Id 1 - test_module | test_name',
      TestemOutput.updateTestName(
        new Map()
          .set('partitionCount', 2)
          .set('partition', 2)
          .set('browser', 1),
        'test_module | test_name'
      )
    );
  });
});
