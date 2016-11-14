import QUnit, { module, test } from 'qunit';

module('Unit | test-loader', {
  beforeEach() {
    this.TestLoader = window.require('ember-cli-test-loader/test-support/index').default;
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

    this.originalURLParams = QUnit.urlParams;
  },

  afterEach() {
    QUnit.urlParams = this.originalURLParams;
    window.require = this.originalRequire;
  }
});

test('loads all test modules by default', function(assert) {
  QUnit.urlParams = {};

  this.TestLoader.load();

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
  QUnit.urlParams = {
    _partition: 3,
    _split: 4,
  };

  this.TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-3-test.jshint',
    'test-3-test',
  ]);
});

test('loads modules from multiple specified partitions', function(assert) {
  QUnit.urlParams = {
    _partition: [1, 3],
    _split: 4,
  };

  this.TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-1-test.jshint',
    'test-1-test',
    'test-3-test.jshint',
    'test-3-test',
  ]);
});

test('loads modules from the first partition by default', function(assert) {
  QUnit.urlParams = {
    _split: 4,
  };

  this.TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-1-test.jshint',
    'test-1-test',
  ]);
});

test('handles params as strings', function(assert) {
  QUnit.urlParams = {
    _partition: '3',
    _split: '4',
  };

  this.TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-3-test.jshint',
    'test-3-test',
  ]);
});

test('throws an error if splitting less than one', function(assert) {
  QUnit.urlParams = {
    _split: 0,
  };

  assert.throws(() => {
    this.TestLoader.load();
  }, /You must specify a split greater than 0/);
});

test('throws an error if partition isn\'t a number', function(assert) {
  QUnit.urlParams = {
    _split: 2,
    _partition: "foo",
  };

  assert.throws(() => {
    this.TestLoader.load();
  }, /You must specify numbers for partition \(you specified 'foo'\)/);
});

test('throws an error if partition isn\'t a number with multiple partitions', function(assert) {
  QUnit.urlParams = {
    _split: 2,
    _partition: [1, "foo"],
  };

  assert.throws(() => {
    this.TestLoader.load();
  }, /You must specify numbers for partition \(you specified '1,foo'\)/);
});

test('throws an error if loading partition greater than split number', function(assert) {
  QUnit.urlParams = {
    _split: 2,
    _partition: 3,
  };

  assert.throws(() => {
    this.TestLoader.load();
  }, /You must specify partitions numbered less than or equal to your split value/);
});

test('throws an error if loading partition greater than split number with multiple partitions', function(assert) {
  QUnit.urlParams = {
    _split: 2,
    _partition: [2, 3],
  };

  assert.throws(() => {
    this.TestLoader.load();
  }, /You must specify partitions numbered less than or equal to your split value/);
});

test('throws an error if loading partition less than one', function(assert) {
  QUnit.urlParams = {
    _split: 2,
    _partition: 0,
  };

  assert.throws(() => {
    this.TestLoader.load();
  }, /You must specify partitions numbered greater than 0/);
});

test('load works without lint tests', function(assert) {
  QUnit.urlParams = {
    nolint: true,
    _partition: 4,
    _split: 4,
  };

  this.TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-4-test',
  ]);
});

test('load works without non-lint tests', function(assert) {
  window.requirejs.entries = {
    'test-1-test.jshint': true,
    'test-2-test.jshint': true,
    'test-3-test.jshint': true,
    'test-4-test.jshint': true,
  };

  QUnit.urlParams = {
    _partition: 4,
    _split: 4,
  };

  this.TestLoader.load();

  assert.deepEqual(this.requiredModules, [
    'test-4-test.jshint',
  ]);
});
