import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as TestemOutput from 'ember-exam/test-support/-private/patch-testem-output';

describe('Unit | Mocha | patch-testem-output', () => {
  it('add partition number to test name when `split` is passed', function() {
    expect(
      TestemOutput.updateTestName(
        new Map().set('split', 2),
        'test_module | test_name'
      )
    ).to.equal('Exam Partition 1 - test_module | test_name');
  });

  it('add partition number to test name when `split` and `partition` are passed', function() {
    expect(
      TestemOutput.updateTestName(
        new Map().set('split', 2).set('partition', 2),
        'test_module | test_name'
      )
    ).to.equal('Exam Partition 2 - test_module | test_name');
  });

  it('add browser number to test name when `loadBalance` and `browser` are passed', function() {
    expect(
      TestemOutput.updateTestName(
        new Map().set('loadBalance', 2).set('browser', 1),
        'test_module | test_name'
      )
    ).to.equal('Browser Id 1 - test_module | test_name');
  });

  it('add partition number, browser number to test name when `split`, `partition`, `browser`, and `loadBalance` are  passed', function() {
    expect(
      TestemOutput.updateTestName(
        new Map()
          .set('split', 2)
          .set('partition', 2)
          .set('browser', 1)
          .set('loadBalance', 2),
        'test_module | test_name'
      )
    ).to.equal('Exam Partition 2 - Browser Id 1 - test_module | test_name');
  });
});
