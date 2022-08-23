import * as TestemOutput from 'ember-exam/test-support/-private/patch-testem-output';
import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

if (macroCondition(dependencySatisfies('ember-qunit', '*'))) {
  let { module, test } = importSync('qunit').default;

  module('Unit | Qunit | patch-testem-output', () => {
    module('`preserveTestName` is passed', () => {
      test('does not add partition number to test name when `split` is passed', function (assert) {
        assert.deepEqual(
          TestemOutput.updateTestName(
            new Map().set('split', 2).set('preserveTestName', true),
            'test_module | test_name'
          ),
          'test_module | test_name'
        );
      });

      test('does not add partition number to test name when `split` and `partition` are passed', function (assert) {
        assert.deepEqual(
          TestemOutput.updateTestName(
            new Map()
              .set('split', 2)
              .set('partition', 2)
              .set('preserveTestName', true),
            'test_module | test_name'
          ),
          'test_module | test_name'
        );
      });

      test('does not add browser number to test name when `loadBalance` and `browser` are passed', function (assert) {
        assert.deepEqual(
          TestemOutput.updateTestName(
            new Map()
              .set('loadBalance', 2)
              .set('browser', 1)
              .set('preserveTestName', true),
            'test_module | test_name'
          ),
          'test_module | test_name'
        );
      });

      test('does not add partition number, browser number to test name when `split`, `partition`, `browser`, and `loadBalance` are  passed', function (assert) {
        assert.deepEqual(
          TestemOutput.updateTestName(
            new Map()
              .set('split', 2)
              .set('partition', 2)
              .set('browser', 1)
              .set('loadBalance', 2)
              .set('preserveTestName', true),
            'test_module | test_name'
          ),
          'test_module | test_name'
        );
      });
    });
    module('`preserveTestName` is not passed', () => {
      test('add partition number to test name when `split` is passed', function (assert) {
        assert.deepEqual(
          TestemOutput.updateTestName(
            new Map().set('split', 2),
            'test_module | test_name'
          ),
          'Exam Partition 1 - test_module | test_name'
        );
      });

      test('add partition number to test name when `split` and `partition` are passed', function (assert) {
        assert.deepEqual(
          TestemOutput.updateTestName(
            new Map().set('split', 2).set('partition', 2),
            'test_module | test_name'
          ),
          'Exam Partition 2 - test_module | test_name'
        );
      });

      test('add browser number to test name when `loadBalance` and `browser` are passed', function (assert) {
        assert.deepEqual(
          TestemOutput.updateTestName(
            new Map().set('loadBalance', 2).set('browser', 1),
            'test_module | test_name'
          ),
          'Browser Id 1 - test_module | test_name'
        );
      });

      test('add partition number, browser number to test name when `split`, `partition`, `browser`, and `loadBalance` are  passed', function (assert) {
        assert.deepEqual(
          TestemOutput.updateTestName(
            new Map()
              .set('split', 2)
              .set('partition', 2)
              .set('browser', 1)
              .set('loadBalance', 2),
            'test_module | test_name'
          ),
          'Exam Partition 2 - Browser Id 1 - test_module | test_name'
        );
      });
    });
  });
}
