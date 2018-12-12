'use strict';

const assert = require('assert');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const Task = require('ember-cli/lib/models/task');
const RSVP = require('rsvp');
const sinon = require('sinon');

const ExamCommand = require('../../../lib/commands/exam');
const TestOptionsValidator = require('../../../lib/utils/tests-options-validator');

describe('ExamCommand', function() {
  function createCommand() {
    const tasks = {
      Build: Task.extend(),
      Test: Task.extend()
    };

    const project = new MockProject();

    project.isEmberCLIProject = function() { return true; };

    return new ExamCommand({
      project: project,
      tasks: tasks,
      ui: {
        writeLine: function() {}
      }
    });
  }

  describe('run', function() {
    let command;
    let called;

    beforeEach(function() {
      command = createCommand();

      called = {};

      command.tasks.Test.prototype.run = function(options) {
        called.testRun = true;
        called.testRunOptions = options;
        return RSVP.resolve();
      };

      command.tasks.Build.prototype.run = function() {
        called.buildRun = true;
        return RSVP.resolve();
      };
    });

    it('should defer to super with normal build task', function() {
      return command.run({}).then(function() {
        assert.equal(called.testRun, true);
        assert.equal(called.buildRun, true);
      });
    });

    it('should set \'partition\' in the query option with one partition', function() {
      return command.run({ split: 2, partition: [2] }).then(function() {
        assert.equal(called.testRunOptions.query, 'split=2&partition=2');
      });
    });

    it('should set \'load-balance\' in the query option', function() {
      return command.run({ 'loadBalance': 1 }).then(function() {
        assert.equal(called.testRunOptions.query, 'loadBalance=1');
      });
    });

    it('should set \'partition\' in the query option with multiple partitions', function() {
      return command.run({ split: 2, partition: [1, 2] }).then(function() {
        assert.equal(called.testRunOptions.query, 'split=2&partition=1&partition=2');
      });
    });

    it('should append \'partition\' to the query option', function() {
      return command.run({ split: 2, partition: [2], query: 'someQuery=derp&hidepassed' }).then(function() {
        assert.equal(called.testRunOptions.query, 'someQuery=derp&hidepassed&split=2&partition=2');
      });
    });

    it('should not append \'partition\' to the query option when parallelizing', function() {
      return command.run({ split: 2, partition: [1, 2], parallel: true }).then(function() {
        assert.equal(called.testRunOptions.query, 'split=2');
      });
    });

    it('should not append \'partition\' to the query option when not parallelizing without partitions', function() {
      return command.run({ split: 2 }).then(function() {
        assert.equal(called.testRunOptions.query, 'split=2');
      });
    });

    it('should set \'seed=1337\' in the query option', function() {
      return command.run({ random: '1337' }).then(function() {
        assert.equal(called.testRunOptions.query, 'seed=1337');
      });
    });

    it('should append \'seed=1337\' to the query option', function() {
      return command.run({ random: '1337', query: 'someQuery=derp&hidepassed' }).then(function() {
        assert.equal(called.testRunOptions.query, 'someQuery=derp&hidepassed&seed=1337');
      });
    });

    it('should set \'seed=random_seed\' in the query option', function() {
      const randomStub = sinon.stub(Math, 'random').returns('  random_seed');
      return command.run({ random: '' }).then(function() {
        assert.equal(called.testRunOptions.query, 'seed=random_seed');
        randomStub.restore();
      });
    });
  });

  describe('_appendParamToBaseUrl', function() {
    function appendParamToBaseUrl(commandOptions, baseUrl) {
      const project = new MockProject();
      project.isEmberCLIProject = function() { return true; };

      const command = new ExamCommand({
        project: project,
        tasks: {}
      });

      command.validator = new TestOptionsValidator(commandOptions);

      return command._appendParamToBaseUrl(commandOptions, baseUrl);
    }

    it('should add `split` when `split` option is used.', function() {
      const appendedUrl = appendParamToBaseUrl({ split: 3 }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&split=3');
    });

    it('should add `split` when `split` and `parallel` option are used.', function() {
      const appendedUrl = appendParamToBaseUrl({ split: 5, parallel: true }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&split=5');
    });

    it('should add `loadBalance` when `load-balance` option is used.', function() {
      const appendedUrl = appendParamToBaseUrl({ loadBalance: 2 }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&loadBalance');
    });

    it('should add `split`, `loadBalance`, and `partition` when `split`, `loadBalance`, and `partition` are used.', function() {
      const appendedUrl = appendParamToBaseUrl({ split: 5, partition: [1,2,3], loadBalance: 2 }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&split=5&loadBalance&partition=1&partition=2&partition=3');
    });

    it('should add `loadBalance` when `replay-execution` and `replay-browser` are used.', function() {
      const appendedUrl = appendParamToBaseUrl({ replayExecution: 'test-execution-0000000.json', replayBrowser: [1, 2] }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&loadBalance');
    });
  })

  describe('_getCustomBaseUrl', function() {
    function getCustomBaseUrl(config, options) {
      const project = new MockProject();
      project.isEmberCLIProject = function() { return true; };

      const command = new ExamCommand({
        project: project,
        tasks: {}
      });

      command.validator = new TestOptionsValidator(options);

      return command._getCustomBaseUrl(config, options)
    }

    it('should add `loadBalance` to a base url with load-balance', function() {
      const baseUrl = getCustomBaseUrl({ testPage: 'tests/index.html?hidepassed' }, { loadBalance: 3 });

      assert.deepEqual(baseUrl, 'tests/index.html?hidepassed&loadBalance');
    });

    it('should add `split` to a base url with split and parallelizing.', function() {
      const baseUrl = getCustomBaseUrl({ testPage: 'tests/index.html?hidepassed' }, { parallel: true, split: 2 });

      assert.deepEqual(baseUrl, 'tests/index.html?hidepassed&split=2');
    });

    it('should add `split` and `loadBalance` to a base url with split and load-balance.', function() {
      const baseUrl = getCustomBaseUrl({ testPage: 'tests/index.html?hidepassed' }, { loadBalance: 3, split: 2 });

      assert.deepEqual(baseUrl, 'tests/index.html?hidepassed&split=2&loadBalance');
    });

    it('should add `split`, `loadBalance`, and `partitions` to a base url with split, partition, and load-balance', function() {
      const baseUrl = getCustomBaseUrl({ testPage: 'tests/index.html?hidepassed' }, { loadBalance: 3, split: 3, partition: [2, 3] });

      assert.deepEqual(baseUrl, 'tests/index.html?hidepassed&split=3&loadBalance&partition=2&partition=3');
    });

    it('should add `loadBalance` to a base url with replay-execution', function() {
      const baseUrl = getCustomBaseUrl({ testPage: 'tests/index.html?hidepassed' }, { replayExecution: 'test-execution-0000000.json', replayBrowser: [1, 2] });

      assert.deepEqual(baseUrl, 'tests/index.html?hidepassed&loadBalance');
    });
  })

  describe('_generateCustomConfigs', function() {
    function generateConfig(options) {
      const project = new MockProject();

      project.isEmberCLIProject = function() { return true; };

      const command = new ExamCommand({
        project: project,
        tasks: {}
      });

      command.validator = new TestOptionsValidator(options);

      return command._generateCustomConfigs(options);
    }

    it('should have a null test page when not parallelizing', function() {
      const config = generateConfig({});

      assert.deepEqual(config.testPage, undefined);
    });

    it('should modify the config to have multiple test pages with no partitions specified', function() {
      const config = generateConfig({
        parallel: true,
        split: 2
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&split=2&partition=1',
        'tests/index.html?hidepassed&split=2&partition=2'
      ]);
    });

    it('should modify the config to have multiple test pages with specified partitions', function() {
      const config = generateConfig({
        parallel: true,
        split: 4,
        partition: [3, 4]
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&split=4&partition=3',
        'tests/index.html?hidepassed&split=4&partition=4'
      ]);
    });

    it('should modify the config to have multiple test pages for each test_page in the config file with no partitions specified', function() {
      const config = generateConfig({
        parallel: true,
        split: 2,
        configFile: 'testem.multiple-test-page.js'
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&derp=herp&split=2&partition=1',
        'tests/index.html?hidepassed&derp=herp&split=2&partition=2',
        'tests/index.html?hidepassed&foo=bar&split=2&partition=1',
        'tests/index.html?hidepassed&foo=bar&split=2&partition=2'
      ]);
    });

    it('should modify the config to have multiple test pages for each test_page in the config file with partitions specified', function() {
      const config = generateConfig({
        parallel: true,
        split: 4,
        partition: [3, 4],
        configFile: 'testem.multiple-test-page.js'
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&derp=herp&split=4&partition=3',
        'tests/index.html?hidepassed&derp=herp&split=4&partition=4',
        'tests/index.html?hidepassed&foo=bar&split=4&partition=3',
        'tests/index.html?hidepassed&foo=bar&split=4&partition=4'
      ]);
    });

    it('should have a custom test page', function() {
      const config = generateConfig({
        query: 'foo=bar',
        'test-page': 'tests.html'
      });

      assert.equal(config.testPage, 'tests.html?foo=bar');
    });

    it('should modify the config to have a test page with \'loadBalance\' when no specified number of browser', function() {
      const config = generateConfig({
        'loadBalance': 1
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&loadBalance&browser=1'
      ])
    });

    it('should modify the config to have a test page with \'loadBalance\' with splitting when no specified number of browser', function() {
      const config = generateConfig({
        'loadBalance': 1,
        split: 2,
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&split=2&loadBalance&browser=1'
      ])
    });

    it('should modify the config to have multiple test pages with test loading balanced, no specified partitions and no splitting ', function(){
      const config = generateConfig({
        'loadBalance': 2,
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&loadBalance&browser=1',
        'tests/index.html?hidepassed&loadBalance&browser=2'
      ])
    });

    it('should modify the config to have multiple test pages with splitting when loading test load-balanced', function(){
      const config = generateConfig({
        'loadBalance': 2,
        split: 2,
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&split=2&loadBalance&browser=1',
        'tests/index.html?hidepassed&split=2&loadBalance&browser=2'
      ])
    });

    it('should modify the config to have multiple test pages with specified partitions when loading test balanced', function(){
      const config = generateConfig({
        'loadBalance': 2,
        split: 3,
        partition: [2, 3],
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&split=3&loadBalance&partition=2&partition=3&browser=1',
        'tests/index.html?hidepassed&split=3&loadBalance&partition=2&partition=3&browser=2'
      ])
    });

    it('should modify the config to have multiple test pages for each test_page in the config file with partitions specified and test loading balanced', function() {
      const config = generateConfig({
        'loadBalance': 1,
        split: 4,
        partition: [3, 4],
        configFile: 'testem.multiple-test-page.js'
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&derp=herp&split=4&loadBalance&partition=3&partition=4&browser=1',
        'tests/index.html?hidepassed&foo=bar&split=4&loadBalance&partition=3&partition=4&browser=1'
      ]);
    });

    it('should have a custom test page', function() {
      const config = generateConfig({
        query: 'foo=bar',
        'test-page': 'tests.html'
      });

      assert.equal(config.testPage, 'tests.html?foo=bar');
    });

    it('should modify the config to have multiple test pages with a custom base url', function() {
      const config = generateConfig({
        parallel: true,
        split: 2,
        query: 'foo=bar',
        'test-page': 'tests.html'
      });

      assert.deepEqual(config.testPage, [
        'tests.html?foo=bar&split=2&partition=1',
        'tests.html?foo=bar&split=2&partition=2'
      ]);
    });

    it('should warn if no test_page is defined but use a default', function() {
      const warnStub = sinon.stub(console, 'warn');

      const config = generateConfig({
        parallel: true,
        split: 2,
        configFile: 'testem.no-test-page.js'
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&split=2&partition=1',
        'tests/index.html?hidepassed&split=2&partition=2'
      ]);

      sinon.assert.calledOnce(warnStub);
      sinon.assert.calledWithExactly(warnStub, 'No test_page value found in the config. Defaulting to "tests/index.html?hidepassed"');

      warnStub.restore();
    });
  });

  describe('_getTestFramework', function() {
    let command;

    function assertFramework(command, name) {
      assert.equal(command._getTestFramework(), name);
    }

    beforeEach(function() {
      command = createCommand();
    });

    it('returns mocha if ember-cli-mocha is a dependency', function() {
      command.project.pkg.dependencies = {
        'ember-cli-mocha': '*'
      };
      assertFramework(command, 'mocha');
    });

    it('returns mocha if ember-cli-mocha is a dev-dependency', function() {
      command.project.pkg.devDependencies = {
        'ember-cli-mocha': '*'
      };
      assertFramework(command, 'mocha');
    });

    it('returns qunit if ember-cli-mocha is not a dependency of any kind', function() {
      command = createCommand();
      assertFramework(command, 'qunit');
    });
  });
});
