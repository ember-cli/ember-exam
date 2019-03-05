import { describe, it } from 'mocha';
import { expect } from 'chai';
import TestemOutput from 'ember-exam/test-support/-private/patch-testem-output';

describe('Unit | patch-testem-output', () => {
  it('add partition number to test name when `partitionCount` is passed', function() {
    expect(
      TestemOutput.updateTestName(
        new Map().set('partitionCount', 2),
        'test_module | test_name'
      )
    ).to.deepEqual('Exam Partition 1 - test_module | test_name');
  });

  it('add partition number to test name when `partitionCount` and `partition` are passed', function() {
    expect(
      TestemOutput.updateTestName(
        new Map().set('partitionCount', 2).set('partition', 2),
        'test_module | test_name'
      )
    ).to.deepEqual('Exam Partition 2 - test_module | test_name');
  });

  it('add browser number to test name when `browser` is passed', function() {
    expect(
      TestemOutput.updateTestName(
        new Map().set('browser', 1),
        'test_module | test_name'
      )
    ).to.deepEqual('Browser Id 1 - test_module | test_name');
  });

  it('add partition number, browser number to test name when `partitionCount`, `partition` and `browser` are  passed', function() {
    expect(
      TestemOutput.updateTestName(
        new Map()
          .set('partitionCount', 2)
          .set('partition', 2)
          .set('browser', 1),
        'test_module | test_name'
      )
    ).to.deepEqual('Exam Partition 2 - Browser Id 1 - test_module | test_name');
  });
});
