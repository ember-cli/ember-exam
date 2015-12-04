'use strict';

var TestCommand = require('ember-cli/lib/commands/test');

var TestsProcessor = require('../utils/tests-processor');
var TestsOptionsValidator = require('../utils/tests-options-validator');

/**
 * Patches the Build task so that it performs any needed transforms on the Tests
 * AST after the build has finished.
 *
 * @param {TestsOptionsValidator} validator
 * @return {Void}
 */
function patchBuildTask(BuildTask, validator) {
  var BuildTask$run = BuildTask.prototype.run;
  BuildTask.prototype.run = function(options) {
    validator.options.outputPath = options.outputPath;

    return BuildTask$run.apply(this, arguments).then(function() {
      return new TestsProcessor(validator).write();
    });
  }
}

module.exports = TestCommand.extend({
  name: 'exam',

  description: 'Runs your app\'s test suite with more options than \'test\'.',

  works: 'insideProject',

  availableOptions: [
    { name: 'split',        type: Number,                  description: 'A number of files to split your tests across.' },
    { name: 'split-file',   type: Number,                  description: 'The number of the file to run after splitting.' },
    { name: 'weighted',     type: Boolean,                 description: 'Weights the type of tests to help equal splits.' },
    { name: 'parallel',     type: Boolean, default: false, description: 'Runs your split tests on parallel child processes.' },

    { name: 'random',       type: String,  default: false, description: 'Randomizes your modules and tests before running your test suite.' },
    { name: 'seed',         type: Number,                  description: 'A starting value from which to randomize your tests.' },

    { name: 'hard-filter',  type: String,                  description: 'Filters your test build to only load and parse those tests you are running.' },
    { name: 'regex-filter', type: String,                  description: 'Filters your test build on a regex value.' }
  ].concat(TestCommand.prototype.availableOptions),

  /**
   * Validates the command options and then runs the original test command.
   *
   * @override
   */
  run: function(commandOptions) {
    this.validator = new TestsOptionsValidator(commandOptions);

    if (this.validator.needsAST) {
      patchBuildTask(this.tasks.Build, this.validator);

      // If we're running specific file of tests, add it to the query.
      var splitFile = commandOptions.splitFile;
      if (this.validator.shouldSplit && splitFile) {
        var query = commandOptions.query;
        commandOptions.query = query ? query + '&splitFile=' + splitFile : 'splitFile=' + splitFile;
      }
    }

    return this._super.run.apply(this, arguments);
  }
});
