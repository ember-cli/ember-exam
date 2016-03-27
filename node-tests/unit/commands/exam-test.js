var assert = require('assert');
var RSVP = require('rsvp');
var MockProject = require('ember-cli/tests/helpers/mock-project');
var Task = require('ember-cli/lib/models/task');

var ExamCommand = require('../../../lib/commands/exam');
var TestsProcessor = require('../../../lib/utils/tests-processor');
var TestOptionsValidator = require('../../../lib/utils/tests-options-validator');

describe('ExamCommand', function() {
  describe('run', function() {
    var command;
    var superCall;
    var originalBuildRun;

    beforeEach(function() {
      var tasks = {
        Build: Task.extend()
      };

      originalBuildRun = tasks.Build.prototype.run = function() {
        return RSVP.Promise.resolve();
      };

      var project = new MockProject();

      project.isEmberCLIProject = function() { return true; };

      command = new ExamCommand({
        project: project,
        tasks: tasks
      });

      superCall = { called: false };
      command._super.run = function(options) {
        superCall = {
          called: true,
          options: options
        }
      };
    });

    it('should defer to super with normal build task', function() {
      command.run({});

      assert.equal(originalBuildRun, command.tasks.Build.prototype.run);
      assert.equal(superCall.called, true);
    });

    it('should defer to super after patching the build task', function() {
      command.run({ split: 2 });

      assert.notEqual(originalBuildRun, command.tasks.Build.prototype.run);
      assert.equal(superCall.called, true);
    });

    it('should run a test processor after the build runs', function(done) {
      var processorCalled = false;

      command.utils.Processor = function ProcessorStub() {
        processorCalled = true;
        this.write = function() {
          return RSVP.Promise.resolve();
        };
      };

      command.run({ split: 2 });

      var build = new command.tasks.Build();
      build.run({ outputPath: 'dist' }).then(function() {
        assert.equal(processorCalled, true);
        done();
      });
    });

    it('should set \'splitFile\' to the query option', function() {
      command.run({ split: 2, splitFile: 2 });

      assert.equal(superCall.options.query, 'splitFile=2');
      assert.equal(superCall.called, true);
    });

    it('should append \'splitFile\' to the query option', function() {
      command.run({ split: 2, splitFile: 2, query: 'someQuery=derp&hidepassed' });

      assert.equal(superCall.options.query, 'someQuery=derp&hidepassed&splitFile=2');
      assert.equal(superCall.called, true);
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

    it('should have a null test page', function() {
      var config = generateConfig({});

      assert.deepEqual(config.testPage, undefined);
    });

    it('should modify the config to have multiple test pages', function() {
      var config = generateConfig({
        parallel: true,
        split: 2
      });

      assert.deepEqual(config.testPage, [
        "tests/index.html?hidepassed&splitFile=1",
        "tests/index.html?hidepassed&splitFile=2"
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
        "tests.html?foo=bar&splitFile=1",
        "tests.html?foo=bar&splitFile=2"
      ]);
    });
  })
});
