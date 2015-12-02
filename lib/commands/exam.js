'use strict';

var TestCommand = require('ember-cli/lib/commands/test');
var BuildTask = require('ember-cli/lib/tasks/build');

var splitTests = require('../utils/split-tests');

var Exam = TestCommand.extend({
  name: 'exam',

  description: 'Runs your app\'s test suite with more options than \'test\'.',

  works: 'insideProject',

  availableOptions: [
    { name: 'split',        type: Number,                  description: 'A number of files to split your tests across.' },
    { name: 'split-file',   type: Number,                  description: 'The number of the file to run after splitting.' },
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
    this.validateOptions(commandOptions);

    if (commandOptions._needsAST) {
      var BuildTask$run = BuildTask.prototype.run;
      BuildTask.prototype.run = function(options) {
        return BuildTask$run.apply(this, arguments).then(function() {
          commandOptions.outputPath = options.outputPath;
          return splitTests(commandOptions);
        });
      }
    }

    return this._super.run.apply(this, arguments);
  },

  /**
   * Validates the arguments/options that the command was called with.
   *
   * @public
   * @param {Object} options
   * @return {Void}
   */
  validateOptions: function(options) {
    this._validateSplittingOptions(options);
    this._validateRandomizationOptions(options);

    options._needsAST = this._needsAST(options);
  },

  /**
   * Validates options passed in related to the `split`, `split-file` and
   * `parallel` options.
   *
   * @private
   * @param {Object} options
   * @return {Void}
   */
  _validateSplittingOptions: function(options) {
    var split = options.split;

    if (typeof split !== 'undefined' && split < 2) {
      throw new Error('You must specify a number of files greater than 1 to split your tests across.');
    }

    var splitFile = options.splitFile;

    if (splitFile) {
      if (split) {
        throw new Error('You must specify a \'split\' value in order to use \'split-file\'.');
      }

      if (splitFile < 1) {
        throw new Error('Split files are one-indexed, so you must specify a split-file greater than or equal to 1.');
      }

      if (splitFile > split) {
        throw new Error('You must specify a \'split-file\' value that is less than or equal to your \'split\' value.');
      }
    }

    if (!!options.parallel) {
      throw new Error('Sorry, the \'parallel\' option is not yet supported. Pull requests welcome!');
    }
  },

  /**
   * Validates options passed in related to the `random` and `seed` options.
   *
   * @private
   * @param {Object} options
   * @return {Void}
   */
  _validateRandomizationOptions: function(options) {
    var random = options.random = options.random === '' ? 'tests' : options.random;

    if (random && random !== 'tests' && random !== 'modules') {
      throw new Error('Valid options for \'random\' are \'tests\', \'modules\', or nothing.');
    }

    var seed = options.seed;

    if (!random && typeof seed !== 'undefined') {
      throw new Error('You specified a \'seed\' value but are not using \'random\' as well.');
    }
  },

  /**
   * Determines if we will need to construct an AST at the end of the build.
   *
   * @private
   * @param {Object} options
   * @return {Void}
   */
  _needsAST: function(options) {
    return !!(options.split || options.random || options.hardFilter || options.regexFilter);
  }
});

module.exports = Exam;
