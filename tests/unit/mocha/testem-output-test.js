import { describe, it } from 'mocha';
import { expect } from 'chai';
import TestemOutput from 'ember-exam/test-support/-private/patch-testem-output';

describe('Unit | patch-testem-output', () => {
  it('add partition number to test name when `split` is passed', function() {
    expect(TestemOutput.updateTestName({split: 2}, 'test_module | test_name'))
    .to.deepEqual('Exam Partition 1 - test_module | test_name');
  });

  it('add partition number to test name when `split` and `partition` are passed', function() {
    expect(TestemOutput.updateTestName({split: 2, partition: 2}, 'test_module | test_name'))
    .to.deepEqual('Exam Partition 2 - test_module | test_name');
  });

  it('add browser number to test name when `loadBalance` and `browser` are passed', function() {
    expect(TestemOutput.updateTestName({loadBalance: 2, browser: 1}, 'test_module | test_name'))
    .to.deepEqual('Browser Id 1 - test_module | test_name');
  });

  it('add partition number, browser number to test name when `split`, `partition`, `browser`, and `loadBalance` are  passed', function() {
    expect(TestemOutput.updateTestName({split: 2, partition: 2, browser:1, loadBalance: 2}, 'test_module | test_name'))
    .to.deepEqual('Exam Partition 2 - Browser Id 1 - test_module | test_name');
  });
});
