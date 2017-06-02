import TestLoader from 'ember-cli-test-loader/test-support/index';
import QUnit, { module, test } from 'qunit';

module('Unit | test-loader', {
  beforeEach() {
    this.originalRequire = window.require;
    this.requiredModules = [];
    window.require = (name) => {
      this.requiredModules.push(name);
    };

    window.requirejs.entries = {
      'test-1-test': true,
      'test-1-test.jshint': true,
      'test-2-test': true,
      'test-2-test.jshint': true,
      'test-3-test': true,
      'test-3-test.jshint': true,
      'test-4-test': true,
      'test-4-test.jshint': true,
    };

    this.originalURLParams = TestLoader._urlParams;
  },

  afterEach() {
    TestLoader._urlParams = this.originalURLParams;
    window.require = this.originalRequire;
  }
});

test('loads all test modules by default', function(assert) {
  TestLoader._urlParams = {};

  TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-1-test.jshint',
    'test-2-test.jshint',
    'test-3-test.jshint',
    'test-4-test.jshint',
    'test-1-test',
    'test-2-test',
    'test-3-test',
    'test-4-test',
  ]);
});

test('loads modules from a specified partition', function(assert) {
  TestLoader._urlParams = {
    _partition: 3,
    _split: 4,
  };

  TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-3-test.jshint',
    'test-3-test',
  ]);
});

test('loads modules from multiple specified partitions', function(assert) {
  TestLoader._urlParams = {
    _partition: [1, 3],
    _split: 4,
  };

  TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-1-test.jshint',
    'test-1-test',
    'test-3-test.jshint',
    'test-3-test',
  ]);
});

test('loads modules from the first partition by default', function(assert) {
  TestLoader._urlParams = {
    _split: 4,
  };

  TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-1-test.jshint',
    'test-1-test',
  ]);
});

test('handles params as strings', function(assert) {
  TestLoader._urlParams = {
    _partition: '3',
    _split: '4',
  };

  TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-3-test.jshint',
    'test-3-test',
  ]);
});

test('throws an error if splitting less than one', function(assert) {
  TestLoader._urlParams = {
    _split: 0,
  };

  assert.throws(() => {
    TestLoader.load();
  }, /You must specify a split greater than 0/);
});

test('throws an error if partition isn\'t a number', function(assert) {
  TestLoader._urlParams = {
    _split: 2,
    _partition: 'foo',
  };

  assert.throws(() => {
    TestLoader.load();
  }, /You must specify numbers for partition \(you specified 'foo'\)/);
});

test('throws an error if partition isn\'t a number with multiple partitions', function(assert) {
  TestLoader._urlParams = {
    _split: 2,
    _partition: [1, 'foo'],
  };

  assert.throws(() => {
    TestLoader.load();
  }, /You must specify numbers for partition \(you specified '1,foo'\)/);
});

test('throws an error if loading partition greater than split number', function(assert) {
  TestLoader._urlParams = {
    _split: 2,
    _partition: 3,
  };

  assert.throws(() => {
    TestLoader.load();
  }, /You must specify partitions numbered less than or equal to your split value/);
});

test('throws an error if loading partition greater than split number with multiple partitions', function(assert) {
  TestLoader._urlParams = {
    _split: 2,
    _partition: [2, 3],
  };

  assert.throws(() => {
    TestLoader.load();
  }, /You must specify partitions numbered less than or equal to your split value/);
});

test('throws an error if loading partition less than one', function(assert) {
  TestLoader._urlParams = {
    _split: 2,
    _partition: 0,
  };

  assert.throws(() => {
    TestLoader.load();
  }, /You must specify partitions numbered greater than 0/);
});

test('load works without lint tests', function(assert) {
  QUnit.urlParams.nolint = true;
  TestLoader._urlParams = {
    _partition: 4,
    _split: 4,
  };

  TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-4-test',
  ]);

  QUnit.urlParams.nolint = false;
});

test('load works without non-lint tests', function(assert) {
  window.requirejs.entries = {
    'test-1-test.jshint': true,
    'test-2-test.jshint': true,
    'test-3-test.jshint': true,
    'test-4-test.jshint': true,
  };

  TestLoader._urlParams = {
    _partition: 4,
    _split: 4,
  };

  TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-4-test.jshint',
  ]);
});

test('load works with a double-digit single partition', function(assert) {
  window.requirejs.entries = {
    'test-1-test': true,
    'test-2-test': true,
    'test-3-test': true,
    'test-4-test': true,
    'test-5-test': true,
    'test-6-test': true,
    'test-7-test': true,
    'test-8-test': true,
    'test-9-test': true,
    'test-10-test': true,
  };

  TestLoader._urlParams = {
    _partition: '10',
    _split: 10,
  };

  TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-10-test',
  ]);
});
