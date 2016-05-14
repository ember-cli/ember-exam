'use strict';

var TestCommand = require('ember-cli/lib/commands/test');

var TestsProcessor = require('../utils/tests-processor');
var TestsOptionsValidator = require('../utils/tests-options-validator');

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
    { name: 'testem-root',  type: String,  default: '',    description: 'The path relative to the output directory from which to start Testem.' }
  ].concat(TestCommand.prototype.availableOptions),

  utils: {
    Processor: TestsProcessor,
    Validator: TestsOptionsValidator
  },

  /**
   * Validates the command options and then runs the original test command.
   *
   * @override
   */
  run: function(commandOptions) {
    this.validator = new this.utils.Validator(commandOptions);

    if (this.validator.needsAST) {
      this._patchBuildTask();

      // If we're running specific file of tests, add it to the query.
      var splitFile = commandOptions.splitFile;
      if (this.validator.shouldSplit && splitFile) {
        var query = commandOptions.query;
        commandOptions.query = query ? query + '&splitFile=' + splitFile : 'splitFile=' + splitFile;
      }
    }

    if (this.validator.shouldRandomize) {
      this._randomize(commandOptions);
    }

    return this._super.run.apply(this, arguments);
  },

  /**
   * Adds a `seed` param to the `query` to support randomization through QUnit.
   *
   * @param {Object} commandOptions
   * @return {Void}
   */
  _randomize: function(commandOptions) {
    var random = commandOptions.random;
    var query = commandOptions.query;
    var seed = random !== '' ? random : Math.random().toString(36).slice(2);
    var seedQuery = 'seed=' + seed;

    this.ui.writeLine('Randomizing test with seed: ' + seed);

    commandOptions.query = query ? query + '&' + seedQuery : seedQuery;
  },

  /**
   * Customizes the Testem config to have multiple test pages if attempting to
   * run in parallel. It is important that the user specifies the number of
   * launchers to run in parallel in their testem.json config.
   *
   * @override
   */
  _generateCustomConfigs: function(commandOptions) {
    var config = this._super._generateCustomConfigs.apply(this, arguments);

    if (this.validator.shouldParallelize) {
      var count = commandOptions.split;
      var baseUrl = 'tests/index.html?hidepassed&splitFile=';
      var testPage = config.testPage;
      var containsQueryString;
      var testPageJoinChar;

      if (testPage) {
        containsQueryString = testPage.indexOf('?') > -1;
        testPageJoinChar = containsQueryString ? '&' : '?';
        baseUrl = testPage + testPageJoinChar + 'splitFile='
      }

      config.testPage = [];

      for (var i = 0; i < count; i++) {
        config.testPage.push(baseUrl + (i + 1));
      }
    }

    return config;
  },

  /**
   * Patches the Build task so that it performs any needed transforms on the Tests
   * AST after the build has finished.
   *
   * @private
   * @return {Void}
   */
  _patchBuildTask: function() {
    var validator = this.validator;
    var BuildTask = this.tasks.Build;
    var Processor = this.utils.Processor;

    var BuildTask$run = BuildTask.prototype.run;
    BuildTask.prototype.run = function(options) {
      validator.options.outputPath = options.outputPath;

      return BuildTask$run.apply(this, arguments).then(function() {
        return new Processor(validator).write();
      });
    };
  }
});
