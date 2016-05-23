'use strict';

var TestCommand = require('ember-cli/lib/commands/test');

var TestsOptionsValidator = require('../utils/tests-options-validator');

function addToQuery(query, param, value) {
  if (!value) {
    return query;
  }

  var queryAddParam = query ? query + '&' + param : param;

  return value !== true ?
    queryAddParam + '=' + value :
    queryAddParam;
}

function addToUrl(url, param, value) {
  var urlParts = url.split('?');
  var base = urlParts[0];
  var query = urlParts[1];

  return base + '?' + addToQuery(query, param, value);
}

module.exports = TestCommand.extend({
  name: 'exam',

  description: 'Runs your app\'s test suite with more options than \'test\'.',

  works: 'insideProject',

  availableOptions: [
    { name: 'split',        type: Number,                  description: 'A number of files to split your tests across.' },
    { name: 'partition',    type: Number,                  description: 'The number of the partition to run after splitting.' },
    { name: 'weighted',     type: Boolean,                 description: 'Weights the type of tests to help equal splits.' },
    { name: 'parallel',     type: Boolean, default: false, description: 'Runs your split tests on parallel child processes.' },
    { name: 'random',       type: String,  default: false, description: 'Randomizes your modules and tests while running your test suite.' },
  ].concat(TestCommand.prototype.availableOptions),

  utils: {
    Validator: TestsOptionsValidator
  },

  /**
   * Validates the command options and then runs the original test command.
   *
   * @override
   */
  run: function(commandOptions) {
    this.validator = new this.utils.Validator(commandOptions);

    if (this.validator.shouldSplit) {
      commandOptions.query = addToQuery(commandOptions.query, '_split', commandOptions.split);
      commandOptions.query = addToQuery(commandOptions.query, '_partition', commandOptions.partition);
      commandOptions.query = addToQuery(commandOptions.query, '_weighted', commandOptions.weighted);
    }

    if (this.validator.shouldRandomize) {
      commandOptions.query = this._randomize(commandOptions.random, commandOptions.query);
    }

    return this._super.run.apply(this, arguments);
  },

  /**
   * Adds a `seed` param to the `query` to support randomization through QUnit.
   *
   * @param {Object} commandOptions
   * @return {Void}
   */
  _randomize: function(random, query) {
    var seed = random !== '' ? random : Math.random().toString(36).slice(2);

    this.ui.writeLine('Randomizing test with seed: ' + seed);

    return addToQuery(query, 'seed', seed);
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
      var baseUrl = config.testPage || 'tests/index.html?hidepassed';
      var splitUrl = addToUrl(baseUrl, '_split', count);

      config.testPage = [];

      for (var i = 0; i < count; i++) {
        var url = addToUrl(splitUrl, '_partition', i + 1);
        config.testPage.push(url);
      }
    }

    return config;
  }
});
