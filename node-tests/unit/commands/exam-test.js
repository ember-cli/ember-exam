var assert = require('assert');
var MockProject = require('ember-cli/tests/helpers/mock-project');
var Task = require('ember-cli/lib/models/task');
var RSVP = require('rsvp');
var sinon = require('sinon');

var ExamCommand = require('../../../lib/commands/exam');
var TestOptionsValidator = require('../../../lib/utils/tests-options-validator');

describe('ExamCommand', function() {
  function createCommand() {
    var tasks = {
      Build: Task.extend(),
      Test: Task.extend()
    };

    var project = new MockProject();

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
    var command;
    var called;

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

    it('should set \'partition\' on the query option with one partition', function() {
      return command.run({ split: 2, partition: [2] }).then(function() {
        assert.equal(called.testRunOptions.query, '_split=2&_partition=2');
      });
    });

    it('should set \'partition\' on the query option with multiple partitions', function() {
      return command.run({ split: 2, partition: [1, 2] }).then(function() {
        assert.equal(called.testRunOptions.query, '_split=2&_partition=1&_partition=2');
      });
    });

    it('should append \'partition\' to the query option', function() {
      return command.run({ split: 2, partition: [2], query: 'someQuery=derp&hidepassed' }).then(function() {
        assert.equal(called.testRunOptions.query, 'someQuery=derp&hidepassed&_split=2&_partition=2');
      });
    });

    it('should not append \'partition\' to the query option when parallelizing', function() {
      return command.run({ split: 2, partition: [1, 2], parallel: true }).then(function() {
        assert.equal(called.testRunOptions.query, '_split=2');
      });
    });

    it('should not append \'partition\' to the query option when not parallelizing without partitions', function() {
      return command.run({ split: 2 }).then(function() {
        assert.equal(called.testRunOptions.query, '_split=2');
      });
    });

    it('should set \'seed=1337\' on the query option', function() {
      return command.run({ random: '1337' }).then(function() {
        assert.equal(called.testRunOptions.query, 'seed=1337');
      });
    });

    it('should append \'seed=1337\' to the query option', function() {
      return command.run({ random: '1337', query: 'someQuery=derp&hidepassed' }).then(function() {
        assert.equal(called.testRunOptions.query, 'someQuery=derp&hidepassed&seed=1337');
      });
    });

    it('should set \'seed=random_seed\' on the query option', function() {
      var randomStub = sinon.stub(Math, 'random').returns('  random_seed');
      return command.run({ random: '' }).then(function() {
        assert.equal(called.testRunOptions.query, 'seed=random_seed');
        randomStub.restore();
      });
    });

    it('should set \'weighted\' on the query option', function() {
      return command.run({ split: 2, partition: [2], weighted: true }).then(function() {
        assert.equal(called.testRunOptions.query, '_split=2&_partition=2&_weighted');
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
      var project = new MockProject();

      project.isEmberCLIProject = function() { return true; };

      var command = new ExamCommand({
        project: project
      });

      command.validator = new TestOptionsValidator(options);

      return command._generateCustomConfigs(options);
    }

    it('should have a null test page when not parallelizing', function() {
      var config = generateConfig({});

      assert.deepEqual(config.testPage, undefined);
    });

    it('should modify the config to have multiple test pages with no partitions specified', function() {
      var config = generateConfig({
        parallel: true,
        split: 2
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&_split=2&_partition=1',
        'tests/index.html?hidepassed&_split=2&_partition=2'
      ]);
    });

    it('should modify the config to have multiple test pages with specified partitions', function() {
      var config = generateConfig({
        parallel: true,
        split: 4,
        partition: [3, 4]
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&_split=4&_partition=3',
        'tests/index.html?hidepassed&_split=4&_partition=4'
      ]);
    });

    it('should modify the config to have multiple test pages for each test_page in the config file with no partitions specified', function() {
      var config = generateConfig({
        parallel: true,
        split: 2,
        configFile: 'testem.multiple-test-page.js'
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&derp=herp&_split=2&_partition=1',
        'tests/index.html?hidepassed&derp=herp&_split=2&_partition=2',
        'tests/index.html?hidepassed&foo=bar&_split=2&_partition=1',
        'tests/index.html?hidepassed&foo=bar&_split=2&_partition=2'
      ]);
    });

    it('should modify the config to have multiple test pages for each test_page in the config file with partitions specified', function() {
      var config = generateConfig({
        parallel: true,
        split: 4,
        partition: [3, 4],
        configFile: 'testem.multiple-test-page.js'
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&derp=herp&_split=4&_partition=3',
        'tests/index.html?hidepassed&derp=herp&_split=4&_partition=4',
        'tests/index.html?hidepassed&foo=bar&_split=4&_partition=3',
        'tests/index.html?hidepassed&foo=bar&_split=4&_partition=4'
      ]);
    });

    it('should have a custom test page', function() {
      var config = generateConfig({
        query: 'foo=bar',
        'test-page': 'tests.html'
      });

      assert.equal(config.testPage, 'tests.html?foo=bar');
    });

    it('should modify the config to have multiple test pages with a custom base url', function() {
      var config = generateConfig({
        parallel: true,
        split: 2,
        query: 'foo=bar',
        'test-page': 'tests.html'
      });

      assert.deepEqual(config.testPage, [
        'tests.html?foo=bar&_split=2&_partition=1',
        'tests.html?foo=bar&_split=2&_partition=2'
      ]);
    });

    it('should warn if no test_page is defined but use a default', function() {
      var warnStub = sinon.stub(console, 'warn');

      var config = generateConfig({
        parallel: true,
        split: 2,
        configFile: 'testem.no-test-page.js'
      });

      assert.deepEqual(config.testPage, [
        'tests/index.html?hidepassed&_split=2&_partition=1',
        'tests/index.html?hidepassed&_split=2&_partition=2'
      ]);

      sinon.assert.calledOnce(warnStub);
      sinon.assert.calledWithExactly(warnStub, 'No test_page value found in the config. Defaulting to "tests/index.html?hidepassed"');

      warnStub.restore();
    });
  });

  describe('_getTestFramework', function() {
    var command;

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
      var command = createCommand();
      assertFramework(command, 'qunit');
    });
  });
});
