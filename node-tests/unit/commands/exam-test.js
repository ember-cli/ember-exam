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

    it('should set split env var', function() {
      return command.run({ split: 5 }).then(function() {
        assert.equal(process.env.EMBER_EXAM_SPLIT_COUNT, '5');
      });
    });
  });

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
