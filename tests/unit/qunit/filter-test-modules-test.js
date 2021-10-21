import {
  convertFilePathToModulePath,
  filterTestModules,
} from 'ember-exam/test-support/-private/filter-test-modules';
import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

if (macroCondition(dependencySatisfies('ember-qunit', '*'))) {
  let { module, test } = importSync('qunit');
  let { setupTest } = importSync('ember-qunit');

  module('Unit | Qunit | filter-test-modules', function () {
    module('covertFilePathToModulePath', function (hooks) {
      setupTest(hooks);

      test('should return an input string without file extension when the input contains file extension', function (assert) {
        assert.strictEqual(
          convertFilePathToModulePath('/tests/integration/foo.js'),
          '/tests/integration/foo'
        );
      });

      test(`should return an input string without file extension when the input doesn't contain file extension`, function (assert) {
        assert.strictEqual(
          convertFilePathToModulePath('/tests/integration/foo'),
          '/tests/integration/foo'
        );
      });

      test('should return an input string after `tests` when the input is a full test file path', function (assert) {
        assert.strictEqual(
          convertFilePathToModulePath('dummy/tests/integration/foo.js'),
          '/tests/integration/foo'
        );
      });
    }),
      module('modulePath | Qunit', function (hooks) {
        setupTest(hooks);
        hooks.beforeEach(function () {
          this.modules = [
            'foo-test',
            'foo-test.jshint',
            'bar-test',
            'bar-test.jshint',
          ];
        });

        hooks.afterEach(function () {
          this.modules = [];
        });

        test('should return a list of jshint tests', function (assert) {
          assert.deepEqual(
            ['foo-test.jshint', 'bar-test.jshint'],
            filterTestModules(this.modules, 'jshint')
          );
        });

        test('should return an empty list when there is no match', function (assert) {
          assert.throws(
            () => filterTestModules(this.modules, 'no-match'),
            /No tests matched with the filter:/
          );
        });

        test('should return a list of tests matched with a regular expression', function (assert) {
          assert.deepEqual(
            ['foo-test.jshint', 'bar-test.jshint'],
            filterTestModules(this.modules, '/jshint/')
          );
        });

        test('should return a list of tests matched with a regular expression that excluse jshint', function (assert) {
          assert.deepEqual(
            ['foo-test', 'bar-test'],
            filterTestModules(this.modules, '!/jshint/')
          );
        });

        test('should return a list of tests matches with a list of string options', function (assert) {
          assert.deepEqual(
            ['foo-test', 'foo-test.jshint', 'bar-test', 'bar-test.jshint'],
            filterTestModules(this.modules, 'foo, bar')
          );
        });

        test('should return a list of unique tests matches when options are repeated', function (assert) {
          assert.deepEqual(
            ['foo-test', 'foo-test.jshint'],
            filterTestModules(this.modules, 'foo, foo')
          );
        });
      }),
      module('filePath | Qunit', function (hooks) {
        setupTest(hooks);
        hooks.beforeEach(function () {
          this.modules = [
            'dummy/tests/integration/foo-test',
            'dummy/tests/unit/foo-test',
            'dummy/tests/unit/bar-test',
          ];
        });

        hooks.afterEach(function () {
          this.modules = [];
        });

        test('should return a test module matched with full test file path', function (assert) {
          assert.deepEqual(
            ['dummy/tests/integration/foo-test'],
            filterTestModules(
              this.modules,
              null,
              'app/tests/integration/foo-test.js'
            )
          );
        });

        test('should return a test module matched with relative test file path', function (assert) {
          assert.deepEqual(
            ['dummy/tests/unit/foo-test'],
            filterTestModules(this.modules, null, '/unit/foo-test')
          );
        });

        test('should return a test module matched with test folder path with wildcard', function (assert) {
          assert.deepEqual(
            ['dummy/tests/unit/foo-test', 'dummy/tests/unit/bar-test'],
            filterTestModules(this.modules, null, '/unit/*')
          );
        });

        test('should return a test module matched with test file path with wildcard', function (assert) {
          assert.deepEqual(
            ['dummy/tests/integration/foo-test', 'dummy/tests/unit/foo-test'],
            filterTestModules(this.modules, null, '/tests/*/foo*')
          );
        });

        test('should return an empty list when there is no match', function (assert) {
          assert.throws(
            () => filterTestModules(this.modules, null, 'no-match'),
            /No tests matched with the filter:/
          );
        });

        test('should return a list of tests matches with a list of string options', function (assert) {
          assert.deepEqual(
            ['dummy/tests/integration/foo-test', 'dummy/tests/unit/foo-test'],
            filterTestModules(
              this.modules,
              null,
              '/tests/integration/*, dummy/tests/unit/foo-test'
            )
          );
        });

        test('should return a list of unique tests matches when options are repeated', function (assert) {
          assert.deepEqual(
            ['dummy/tests/unit/bar-test', 'dummy/tests/unit/foo-test'],
            filterTestModules(
              this.modules,
              null,
              'app/tests/unit/bar-test.js, /tests/unit/*'
            )
          );
        });
      });
  });
}
