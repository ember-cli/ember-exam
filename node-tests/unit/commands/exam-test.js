'use strict';

const assert = require('assert');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const Task = require('ember-cli/lib/models/task');
const RSVP = require('rsvp');
const sinon = require('sinon');

const ExamCommand = require('../../../lib/commands/exam');

describe('ExamCommand', function() {
  function createCommand() {
    const tasks = {
      Build: Task.extend(),
      Test: Task.extend()
    };

    const project = new MockProject();

    project.isEmberCLIProject = function() {
      return true;
    };
    project.pkg = {
      devDependencies: {
        'ember-cli': '3.7.0'
      }
    };

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

    it('should set `partition` in the query option with one partition', function() {
      return command.run({ partitionCount: 2, partition: [2] }).then(function() {
        assert.equal(called.testRunOptions.query, 'partitionCount=2&partition=2');
      });
    });

    it('should set `partition` in the query option with multiple partitions', function() {
      return command.run({ partitionCount: 2, partition: [1, 2] }).then(function() {
        assert.equal(
          called.testRunOptions.query,
          'partitionCount=2&partition=1&partition=2'
        );
      });
    });

    it('should append `partition` to the query option', function() {
      return command
        .run({ partitionCount: 2, partition: [2], query: 'someQuery=derp&hidepassed' })
        .then(function() {
          assert.equal(
            called.testRunOptions.query,
            'someQuery=derp&hidepassed&partitionCount=2&partition=2'
          );
        });
    });

    it('should not append `partition` to the query option when parallelizing', function() {
      return command
        .run({ partitionCount: 2, partition: [1, 2], parallel: true })
        .then(function() {
          assert.equal(called.testRunOptions.query, 'partitionCount=2');
        });
    });

    it('should not append `partition` to the query option when not parallelizing without partitions', function() {
      return command.run({ partitionCount: 2 }).then(function() {
        assert.equal(called.testRunOptions.query, 'partitionCount=2');
      });
    });

    it('should set  `seed=1337` in the query option', function() {
      return command.run({ random: '1337' }).then(function() {
        assert.equal(called.testRunOptions.query, 'seed=1337');
      });
    });

    it('should append `seed=1337` to the query option', function() {
      return command
        .run({ random: '1337', query: 'someQuery=derp&hidepassed' })
        .then(function() {
          assert.equal(
            called.testRunOptions.query,
            'someQuery=derp&hidepassed&seed=1337'
          );
        });
    });

    it('should set `seed=random_seed` in the query option', function() {
      const randomStub = sinon.stub(Math, 'random').returns('  random_seed');
      return command.run({ random: '' }).then(function() {
        assert.equal(called.testRunOptions.query, 'seed=random_seed');
        randomStub.restore();
      });
    });

    it('should set partitionCount env var', function() {
      return command.run({ partitionCount: 5 }).then(function() {
        assert.equal(process.env.EMBER_EXAM_SPLIT_COUNT, '5');
      });
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
