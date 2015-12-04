var assert = require('assert');
var RSVP = require('rsvp');
var MockProject = require('ember-cli/tests/helpers/mock-project');
var Task = require('ember-cli/lib/models/task');

var ExamCommand = require('../../../lib/commands/exam');
var TestsProcessor = require('../../../lib/utils/tests-processor');

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
});
