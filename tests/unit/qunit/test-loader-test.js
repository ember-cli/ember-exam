import EmberExamTestLoader from 'ember-exam/test-support/-private/ember-exam-qunit-test-loader';
import QUnit, { module, test } from 'qunit';

module('Unit | test-loader', {
  beforeEach() {
    this.originalRequire = window.require;
    this.requiredModules = [];
    window.require = name => {
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
      'test-4-test.jshint': true
    };
    this.testem = {
      eventQueue: new Array(),
      emit: function(event) {
        this.eventQueue.push(event);
      },
      on: () => {}
    };
    this.qunit = {
      config: {
        queue: []
      },
      begin: () => {},
      moduleDone: () => {}
    };
  },

  afterEach() {
    window.require = this.originalRequire;
  }
});

test('loads all test modules by default', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map(),
    this.qunit
  );
  testLoader.loadModules();

  assert.deepEqual(this.requiredModules, [
    'test-1-test.jshint',
    'test-2-test.jshint',
    'test-3-test.jshint',
    'test-4-test.jshint',
    'test-1-test',
    'test-2-test',
    'test-3-test',
    'test-4-test'
  ]);
});

test('loads modules from a specified partition', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partition', 3).set('partitionCount', 4),
    this.qunit
  );
  testLoader.loadModules();

  assert.deepEqual(this.requiredModules, ['test-3-test.jshint', 'test-3-test']);
});

test('loads modules from multiple specified partitions', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partition', [1, 3]).set('partitionCount', 4),
    this.qunit
  );
  testLoader.loadModules();

  assert.deepEqual(this.requiredModules, [
    'test-1-test.jshint',
    'test-1-test',
    'test-3-test.jshint',
    'test-3-test'
  ]);
});

test('loads modules from the first partition by default', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partitionCount', 4),
    this.qunit
  );
  testLoader.loadModules();

  assert.deepEqual(this.requiredModules, ['test-1-test.jshint', 'test-1-test']);
});

test('handles params as strings', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partition', 3).set('partitionCount', 4),
    this.qunit
  );
  testLoader.loadModules();

  assert.deepEqual(this.requiredModules, ['test-3-test.jshint', 'test-3-test']);
});

test('throws an error if splitting by partition-count less than one', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partitionCount', 0),
    this.qunit
  );

  assert.throws(() => {
    testLoader.loadModules();
  }, /You must specify a partition-count greater than 0/);
});

test('throws an error if partition isn\'t a number', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partitionCountt', 2).set('partition', 'foo'),
    this.qunit
  );

  assert.throws(() => {
    testLoader.loadModules();
  }, /You must specify numbers for partition \(you specified 'foo'\)/);
});

test('throws an error if partition isn\'t a number with multiple partitions', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partitionCount', 2).set('partition', [1, 'foo']),
    this.qunit
  );

  assert.throws(() => {
    testLoader.loadModules();
  }, /You must specify numbers for partition \(you specified '1,foo'\)/);
});

test('throws an error if loading partition greater than partition-count number', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partitionCount', 2).set('partition', 3),
    this.qunit
  );

  assert.throws(() => {
    testLoader.loadModules();
  }, /You must specify partitions numbered less than or equal to your partition-count value/);
});

test('throws an error if loading partition greater than partition-count number with multiple partitions', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partitionCount', 2).set('partition', [2, 3]),
    this.qunit
  );

  assert.throws(() => {
    testLoader.loadModules();
  }, /You must specify partitions numbered less than or equal to your partition-count value/);
});

test('throws an error if loading partition less than one', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partitionCount', 2).set('partition', 0),
    this.qunit
  );

  assert.throws(() => {
    testLoader.loadModules();
  }, /You must specify partitions numbered greater than 0/);
});

test('load works without lint tests', function(assert) {
  QUnit.urlParams.nolint = true;
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partition', 4).set('partitionCount', 4),
    this.qunit
  );

  testLoader.loadModules();

  assert.deepEqual(this.requiredModules, ['test-4-test']);

  QUnit.urlParams.nolint = false;
});

test('load works without non-lint tests', function(assert) {
  window.requirejs.entries = {
    'test-1-test.jshint': true,
    'test-2-test.jshint': true,
    'test-3-test.jshint': true,
    'test-4-test.jshint': true
  };

  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partition', 4).set('partitionCount', 4),
    this.qunit
  );

  testLoader.loadModules();

  assert.deepEqual(this.requiredModules, ['test-4-test.jshint']);
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
    'test-10-test': true
  };

  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('partition', '10').set('partitionCount', 10),
    this.qunit
  );

  testLoader.loadModules();

  assert.deepEqual(this.requiredModules, ['test-10-test']);
});

test('emit then `set-modules-queue` event when browser param is passed', function(assert) {
  const testLoader = new EmberExamTestLoader(
    this.testem,
    new Map().set('browser', 1),
    this.qunit
  );

  testLoader.loadModules();

  assert.deepEqual(
    this.testem.eventQueue,
    ['testem:set-modules-queue'],
    'testem:set-modules-queue event was fired'
  );
});
