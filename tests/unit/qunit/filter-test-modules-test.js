import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { convertFilePathToModulePath, filterTestModules } from 'ember-exam/test-support/-private/filter-test-modules';

module('Unit | filter-test-modules', function(hooks) {
  setupTest(hooks);

  module('covertFilePathToModulePath', function(hooks) {
    setupTest(hooks);

    test('should return an input string without file extension when the input contains file extension', function(assert) {
      assert.equal(convertFilePathToModulePath('/tests/integration/foo.js'), '/tests/integration/foo');
    });

    test(`should return an input string without file extension when the input doesn't contain file extension`, function(assert) {
      assert.equal(convertFilePathToModulePath('/tests/integration/foo'), '/tests/integration/foo');
    });

    test('should return an input string after `tests` when the input is a full test file path', function(assert) {
      assert.equal(convertFilePathToModulePath('dummy/tests/integration/foo.js'), '/tests/integration/foo');
    });
  }),

  module('modulePath', function(hooks) {
    setupTest(hooks);
    hooks.beforeEach(function() {
      this.modules = [
        'foo-test',
        'foo-test.jshint',
        'bar-test',
        'bar-test.jshint',
      ];
    });

    hooks.afterEach(function() {
      this.modules = [];
    });

    test('should return a list of jshint tests', function(assert) {
      assert.deepEqual(
        [
          'foo-test.jshint',
          'bar-test.jshint'
        ],
        filterTestModules(this.modules, 'jshint')
      );
    });

    test('should return an empty list when there is no match', function(assert) {
      assert.deepEqual(
        [], filterTestModules(this.modules, 'no-match')
      );
    });

    test('should return a list of tests matched with a regular expression', function(assert) {
      assert.deepEqual(
        [
          'foo-test.jshint',
          'bar-test.jshint'
        ],
        filterTestModules(this.modules, '/jshint/')
      );
    });

    test('should return a list of tests matched with a regular expression that excluse jshint', function(assert) {
      assert.deepEqual(
        [
          'foo-test',
          'bar-test'
        ], filterTestModules(this.modules, '!/jshint/')
      );
    });

    test('should return a list of tests matches with a list of string options', function(assert) {
      assert.deepEqual(
        [
          'foo-test',
          'foo-test.jshint',
          'bar-test',
          'bar-test.jshint'
        ], filterTestModules(this.modules, 'foo, bar')
      );
    });

    test('should return a list of unique tests matches when options are repeated', function(assert) {
      assert.deepEqual(
        [
          'foo-test',
          'foo-test.jshint'
        ], filterTestModules(this.modules, 'foo, foo')
      );
    });
  }),

  module('filePath', function(hooks) {
    setupTest(hooks);
    hooks.beforeEach(function() {
      this.modules = [
        'dummy/tests/integration/foo-test',
        'dummy/tests/unit/foo-test',
        'dummy/tests/unit/bar-test'
      ];
    });

    hooks.afterEach(function() {
      this.modules = [];
    });

    test('should return a test module matched with full test file path', function(assert) {
      assert.deepEqual(
        [
          'dummy/tests/integration/foo-test',
        ],
        filterTestModules(this.modules, null, 'app/tests/integration/foo-test.js')
      );
    });

    test('should return a test module matched with relative test file path', function(assert) {
      assert.deepEqual(
        [
          'dummy/tests/unit/foo-test'
        ],
        filterTestModules(this.modules, null, '/unit/foo-test')
      );
    });

    test('should return a test module matched with test file path with wildcard', function(assert) {
      assert.deepEqual(
        [
          'dummy/tests/unit/foo-test',
          'dummy/tests/unit/bar-test'
        ],
        filterTestModules(this.modules, null, '/unit/*')
      );
    });

    test('should return a test module matched with test file path with wildcard', function(assert) {
      assert.deepEqual(
        [
          'dummy/tests/integration/foo-test',
          'dummy/tests/unit/foo-test'
        ],
        filterTestModules(this.modules, null, '/tests/*/foo*')
      );
    });

    test('should return an empty list when there is no match', function(assert) {
      assert.deepEqual(
        [], filterTestModules(this.modules, null, 'no-match')
      );
    });

    test('should return a list of tests matches with a list of string options', function(assert) {
      assert.deepEqual(
        [
          'dummy/tests/integration/foo-test',
          'dummy/tests/unit/foo-test'
        ], filterTestModules(this.modules, null, '/tests/integration/*, dummy/tests/unit/foo-test')
      );
    });

    test('should return a list of unique tests matches when options are repeated', function(assert) {
      assert.deepEqual(
        [
          'dummy/tests/unit/bar-test',
          'dummy/tests/unit/foo-test'
        ], filterTestModules(this.modules, null, 'app/tests/unit/bar-test.js, /tests/unit/*')
      );
    });
  });
});
