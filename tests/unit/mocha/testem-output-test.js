import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';
import * as TestemOutput from 'ember-exam/test-support/-private/patch-testem-output';

if (macroCondition(dependencySatisfies('ember-mocha', '*'))) {
  let { describe, it } = importSync('mocha');
  let { expect } = importSync('chai');

  describe('Unit | Mocha | patch-testem-output', () => {
    describe('`preserveTestName` is passed', () => {
      it('does not add partition number to test name when `split` is passed', function () {
        expect(
          TestemOutput.updateTestName(
            new Map().set('split', 2).set('preserveTestName', true),
            'test_module | test_name'
          )
        ).to.equal('test_module | test_name');
      });

      it('does not add partition number to test name when `split` and `partition` are passed', function () {
        expect(
          TestemOutput.updateTestName(
            new Map()
              .set('split', 2)
              .set('partition', 2)
              .set('preserveTestName', true),
            'test_module | test_name'
          )
        ).to.equal('test_module | test_name');
      });

      it('does not add browser number to test name when `loadBalance` and `browser` are passed', function () {
        expect(
          TestemOutput.updateTestName(
            new Map()
              .set('loadBalance', 2)
              .set('browser', 1)
              .set('preserveTestName', true),
            'test_module | test_name'
          )
        ).to.equal('test_module | test_name');
      });

      it('does not add partition number, browser number to test name when `split`, `partition`, `browser`, and `loadBalance` are  passed', function () {
        expect(
          TestemOutput.updateTestName(
            new Map()
              .set('split', 2)
              .set('partition', 2)
              .set('browser', 1)
              .set('loadBalance', 2)
              .set('preserveTestName', true),
            'test_module | test_name'
          )
        ).to.equal('test_module | test_name');
      });
    });
    describe('`preserveTestName` is not passed', () => {
      it('add partition number to test name when `split` is passed', function () {
        expect(
          TestemOutput.updateTestName(
            new Map().set('split', 2),
            'test_module | test_name'
          )
        ).to.equal('Exam Partition 1 - test_module | test_name');
      });

      it('add partition number to test name when `split` and `partition` are passed', function () {
        expect(
          TestemOutput.updateTestName(
            new Map().set('split', 2).set('partition', 2),
            'test_module | test_name'
          )
        ).to.equal('Exam Partition 2 - test_module | test_name');
      });

      it('add browser number to test name when `loadBalance` and `browser` are passed', function () {
        expect(
          TestemOutput.updateTestName(
            new Map().set('loadBalance', 2).set('browser', 1),
            'test_module | test_name'
          )
        ).to.equal('Browser Id 1 - test_module | test_name');
      });

      it('add partition number, browser number to test name when `split`, `partition`, `browser`, and `loadBalance` are  passed', function () {
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
  });
}
