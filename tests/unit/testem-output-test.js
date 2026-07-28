import * as TestemOutput from 'ember-exam/test-support/-private/patch-testem-output';
import { module, test } from 'qunit';

module('Unit | patch-testem-output', function () {
  module('`preserveTestName` is passed', function () {
    test('does not add partition number to test name when `split` is passed', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map().set('split', 2).set('preserveTestName', true),
          'test_module | test_name',
        ),
        'test_module | test_name',
      );
    });

    test('does not add partition number to test name when `split` and `partition` are passed', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map()
            .set('split', 2)
            .set('partition', 2)
            .set('preserveTestName', true),
          'test_module | test_name',
        ),
        'test_module | test_name',
      );
    });

    test('does not add browser number to test name when `loadBalance` and `browser` are passed', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map()
            .set('loadBalance', 2)
            .set('browser', 1)
            .set('preserveTestName', true),
          'test_module | test_name',
        ),
        'test_module | test_name',
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
          'test_module | test_name',
        ),
        'test_module | test_name',
      );
    });
  });

  module('`preserveTestName` is not passed', function () {
    test('adds partition number to test name when `split` is passed', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map().set('split', 2),
          'test_module | test_name',
        ),
        'Exam Partition 1 - test_module | test_name',
      );
    });

    test('adds partition number to test name when `split` and `partition` are passed', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map().set('split', 2).set('partition', 2),
          'test_module | test_name',
        ),
        'Exam Partition 2 - test_module | test_name',
      );
    });

    test('adds browser number to test name when `loadBalance` and `browser` are passed', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map().set('loadBalance', 2).set('browser', 1),
          'test_module | test_name',
        ),
        'Browser Id 1 - test_module | test_name',
      );
    });

    test('adds partition number, browser number to test name when `split`, `partition`, `browser`, and `loadBalance` are  passed', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map()
            .set('split', 2)
            .set('partition', 2)
            .set('browser', 1)
            .set('loadBalance', 2),
          'test_module | test_name',
        ),
        'Exam Partition 2 - Browser Id 1 - test_module | test_name',
      );
    });

    test('does not add partition number again when the test name already contains it', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map().set('split', 2).set('partition', 2),
          'Exam Partition 2 - test_module | test_name',
        ),
        'Exam Partition 2 - test_module | test_name',
      );
    });

    test('does not add browser number again when the test name already contains it', function (assert) {
      assert.deepEqual(
        TestemOutput.updateTestName(
          new Map().set('loadBalance', 2).set('browser', 1),
          'Browser Id 1 - test_module | test_name',
        ),
        'Browser Id 1 - test_module | test_name',
      );
    });
  });

  module('patchTestemOutput', function (hooks) {
    let originalTestem;
    let handlers;

    hooks.beforeEach(function () {
      originalTestem = window.Testem;
      handlers = new Map();
      window.Testem = {
        on(event, callback) {
          handlers.set(event, callback);
        },
      };
    });

    hooks.afterEach(function () {
      window.Testem = originalTestem;
    });

    test('updates the test name when a test starts and when it completes', function (assert) {
      TestemOutput.patchTestemOutput(new Map().set('split', 2));

      const test = { name: 'test_module | test_name' };
      handlers.get('tests-start')(test);
      assert.deepEqual(test.name, 'Exam Partition 1 - test_module | test_name');

      handlers.get('test-result')(test);
      assert.deepEqual(test.name, 'Exam Partition 1 - test_module | test_name');
    });

    test('handles tests-start events without a test name', function (assert) {
      TestemOutput.patchTestemOutput(new Map().set('split', 2));

      const test = {};
      handlers.get('tests-start')(test);
      assert.deepEqual(test.name, undefined);
    });
  });
});
