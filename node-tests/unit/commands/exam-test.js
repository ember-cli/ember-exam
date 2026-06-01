'use strict';

const assert = require('assert');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const Task = require('ember-cli/lib/models/task');
const RSVP = require('rsvp');
const sinon = require('sinon');

const ExamCommand = require('../../../lib/commands/exam');

describe('ExamCommand', function () {
  function createCommand() {
    const tasks = {
      Build: Task.extend(),
      Test: Task.extend(),
    };

    const project = new MockProject();

    project.isEmberCLIProject = function () {
      return true;
    };
    project.pkg = {
      devDependencies: {
        'ember-cli': '3.7.0',
      },
    };

    return new ExamCommand({
      project: project,
      tasks: tasks,
      ui: {
        writeLine: function () {},
      },
    });
  }

  describe('run', function () {
    let command;
    let called;

    beforeEach(function () {
      command = createCommand();

      called = {};

      command.tasks.Test.prototype.run = function (options) {
        called.testRun = true;
        called.testRunOptions = options;
        return RSVP.resolve();
      };

      command.tasks.Build.prototype.run = function () {
        called.buildRun = true;
        return RSVP.resolve();
      };
    });

    it('should defer to super with normal build task', function () {
      return command.run({}).then(function () {
        assert.strictEqual(called.testRun, true);
        assert.strictEqual(called.buildRun, true);
      });
    });

    it('should set `modulePath` in the query option', function () {
      return command.run({ modulePath: 'foo' }).then(function () {
        assert.strictEqual(called.testRunOptions.query, 'modulePath=foo');
      });
    });

    it('should set `partition` in the query option with one partition', function () {
      return command.run({ split: 2, partition: [2] }).then(function () {
        assert.strictEqual(called.testRunOptions.query, 'split=2&partition=2');
      });
    });

    it('should set `load-balance` in the query option', function () {
      return command.run({ loadBalance: true, parallel: 1 }).then(function () {
        assert.strictEqual(called.testRunOptions.query, 'loadBalance');
      });
    });

    it('should set `preserve-test-name` in the query option', function () {
      return command.run({ preserveTestName: true }).then(function () {
        assert.strictEqual(called.testRunOptions.query, 'preserveTestName');
      });
    });

    it('should set `partition` in the query option with multiple partitions', function () {
      return command.run({ split: 2, partition: [1, 2] }).then(function () {
        assert.strictEqual(
          called.testRunOptions.query,
          'split=2&partition=1&partition=2',
        );
      });
    });

    it('should append `partition` to the query option', function () {
      return command
        .run({ split: 2, partition: [2], query: 'someQuery=derp&hidepassed' })
        .then(function () {
          assert.strictEqual(
            called.testRunOptions.query,
            'someQuery=derp&hidepassed&split=2&partition=2',
          );
        });
    });

    it('should not append `partition` to the query option when parallelizing', function () {
      return command
        .run({ split: 2, partition: [1, 2], parallel: 1 })
        .then(function () {
          assert.strictEqual(called.testRunOptions.query, 'split=2');
        });
    });

    it('should not append `partition` to the query option when not parallelizing without partitions', function () {
      return command.run({ split: 2 }).then(function () {
        assert.strictEqual(called.testRunOptions.query, 'split=2');
      });
    });

    it('should set  `seed=1337` in the query option', function () {
      return command.run({ random: '1337' }).then(function () {
        assert.strictEqual(called.testRunOptions.query, 'seed=1337');
      });
    });

    it('should append `seed=1337` to the query option', function () {
      return command
        .run({ random: '1337', query: 'someQuery=derp&hidepassed' })
        .then(function () {
          assert.strictEqual(
            called.testRunOptions.query,
            'someQuery=derp&hidepassed&seed=1337',
          );
        });
    });

    it('should set `seed=random_seed` in the query option', function () {
      const randomStub = sinon.stub(Math, 'random').returns('  random_seed');
      return command.run({ random: '' }).then(function () {
        assert.strictEqual(called.testRunOptions.query, 'seed=random_seed');
        randomStub.restore();
      });
    });

    it('should set split env var', function () {
      return command.run({ split: 5 }).then(function () {
        assert.strictEqual(process.env.EMBER_EXAM_SPLIT_COUNT, '5');
      });
    });
  });

  describe('browser socket events', function () {
    function createRunner(launcherId) {
      return {
        finished: false,
        launcher: {
          id: launcherId,
          settings: { test_page: `browser=${launcherId}` },
        },
        finish() {
          if (this.finished) return;
          this.finished = true;
        },
      };
    }

    async function flushMicrotasks() {
      await Promise.resolve();
      await Promise.resolve();
    }

    beforeEach(function () {
      this.command = createCommand();
      this.command.commands = new Map([
        ['loadBalance', false],
        ['writeExecutionFile', false],
        ['writeModuleMetadataFile', false],
      ]);
      this.events = this.command._setupAndGetBrowserSocketEvents({
        testPage: ['page=1', 'page=2'],
      });
    });

    it('counts a browser once on after-tests-complete', function () {
      const runner = createRunner(1);
      this.events['tests-start'].call(runner);
      this.events['after-tests-complete'].call(runner);

      assert.strictEqual(
        this.command.testemEvents.stateManager.getCompletedBrowser(),
        1,
      );
    });

    it('does not double-count when finish() runs after after-tests-complete', async function () {
      const runner = createRunner(1);
      this.events['tests-start'].call(runner);
      this.events['after-tests-complete'].call(runner);
      runner.finish();
      await flushMicrotasks();

      assert.strictEqual(
        this.command.testemEvents.stateManager.getCompletedBrowser(),
        1,
      );
    });

    it('counts a browser when finish() fires without after-tests-complete', async function () {
      const runner = createRunner(1);
      this.events['tests-start'].call(runner);
      runner.finish();
      await flushMicrotasks();

      assert.strictEqual(
        this.command.testemEvents.stateManager.getCompletedBrowser(),
        1,
      );
    });

    it('counts only once across multiple finish() calls', async function () {
      const runner = createRunner(1);
      this.events['tests-start'].call(runner);
      runner.finish();
      await flushMicrotasks();
      runner.finish();
      await flushMicrotasks();

      assert.strictEqual(
        this.command.testemEvents.stateManager.getCompletedBrowser(),
        1,
      );
    });

    it('does not re-wrap finish on repeat tests-start', function () {
      const runner = createRunner(1);
      this.events['tests-start'].call(runner);
      const wrapped = runner.finish;
      this.events['tests-start'].call(runner);

      assert.strictEqual(runner.finish, wrapped);
    });

    it('registers no disconnect handler', function () {
      assert.strictEqual(this.events['disconnect'], undefined);
    });

    it('does not reset the module queue when one of two browsers finishes', async function () {
      const runner1 = createRunner(1);
      const runner2 = createRunner(2);
      this.events['tests-start'].call(runner1);
      this.events['tests-start'].call(runner2);
      this.command.testemEvents.stateManager.setTestModuleQueue(['foo', 'bar']);

      this.events['after-tests-complete'].call(runner2);
      runner2.finish();
      await flushMicrotasks();

      assert.deepEqual(
        this.command.testemEvents.stateManager.getTestModuleQueue(),
        ['foo', 'bar'],
      );
    });
  });
});
