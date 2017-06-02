'use strict';

var fs = require('fs-extra');
var path = require('path');
var TestCommand = require('ember-cli/lib/commands/test');
var debug = require('debug')('exam');

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
    { name: 'partition',    type: [Array, Number],         description: 'The number of the partition(s) to run after splitting.' },
    { name: 'weighted',     type: Boolean,                 description: 'Weights the type of tests to help equal splits.' },
    { name: 'parallel',     type: Boolean, default: false, description: 'Runs your split tests on parallel child processes.' },
    { name: 'random',       type: String,  default: false, description: 'Randomizes your modules and tests while running your test suite.' }
  ].concat(TestCommand.prototype.availableOptions),

  /**
   * Creates an options validator object.
   *
   * @private
   * @param {Object} options
   * @return {TestOptionsValidator}
   */
  _createValidator: function(options) {
    var Validator = require('../utils/tests-options-validator');
    return new Validator(options, this._getTestFramework());
  },

  /**
   * Gets the name of the test framework being used by the project.
   *
   * @private
   * @return {String}
   */
  _getTestFramework: function() {
    var pkg = this.project.pkg;
    var dependencies = pkg.dependencies || {};
    var devDependencies = pkg.devDependencies || {};

    if (dependencies['ember-cli-mocha'] || devDependencies['ember-cli-mocha']) {
      return 'mocha';
    } else {
      return 'qunit';
    }
  },

  /**
   * Validates the command options and then runs the original test command.
   *
   * @override
   */
  run: function(commandOptions) {
    this.validator = this._createValidator(commandOptions);

    if (this.validator.shouldSplit) {
      commandOptions.query = addToQuery(commandOptions.query, '_split', commandOptions.split);

      // Ignore the partition option when paralleling (we'll fill it in later)
      if (!this.validator.shouldParallelize) {
        var partitions = commandOptions.partition;
        if (partitions) {
          for (var i = 0; i < partitions.length; i++) {
            commandOptions.query = addToQuery(commandOptions.query, '_partition', partitions[i]);
          }
        }
      }

      commandOptions.query = addToQuery(commandOptions.query, '_weighted', commandOptions.weighted);
    }

    if (this.validator.shouldRandomize) {
      commandOptions.query = this._randomize(commandOptions.random, commandOptions.query);
    }

    return this._super.run.apply(this, arguments);
  },

  /**
   * Adds a `seed` param to the `query` to support randomization. Currently
   * only works with QUnit.
   *
   * @param {Object} commandOptions
   * @return {Void}
   */
  _randomize: function(random, query) {
    var seed = random !== '' ? random : Math.random().toString(36).slice(2);

    this.ui.writeLine('Randomizing tests with seed: ' + seed);

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
      // Get the testPage from the generated config or the Testem config and
      // use it as the baseUrl for the parallelized test pages
      var baseUrl = config.testPage || this._getTestPage(commandOptions.configFile);
      var count = commandOptions.split;
      var partitions = commandOptions.partition;

      if (!partitions) {
        partitions = [];
        for (var i = 0; i < commandOptions.split; i++) {
          partitions.push(i + 1);
        }
      }

      if (Array.isArray(baseUrl)) {
        var command = this;
        config.testPage = baseUrl.reduce(function(testPages, baseUrl) {
          return testPages.concat(command._generateTestPages(baseUrl, partitions, count));
        }, []);
      } else {
        config.testPage = this._generateTestPages(baseUrl, partitions, count);
      }
    }

    return config;
  },

  /**
   * Gets the test page specified by the application's Testem config.
   *
   * @param {String} [configFile] - Path to the config file to use
   * @return {String} testPage
   */
  _getTestPage: function(configFile) {
    // Attempt to read in the testem config and use the test_page definition
    var testemConfig = this._readTestemConfig(configFile);
    var testPage = testemConfig && testemConfig.test_page;

    // If there is no test_page to use as the testPage, we warn that we're using
    // a default value
    if (!testPage) {
      // eslint-disable-next-line no-console
      console.warn('No test_page value found in the config. Defaulting to "tests/index.html?hidepassed"');
      testPage = 'tests/index.html?hidepassed';
    }

    return testPage;
  },

  /**
   * Generates the test pages to use for parallel runs. For a given baseUrl,
   * it appends the total split count and the partition numbers each page is
   * running as query params.
   *
   * @param {String} baseUrl
   * @param {Array<Number>} partitions
   * @param {Number} count
   * @return {Array<String>} testPages
   */
  _generateTestPages: function(baseUrl, partitions, count) {
    var splitUrl = addToUrl(baseUrl, '_split', count);
    var testPages = [];

    for (var i = 0; i < partitions.length; i++) {
      var url = addToUrl(splitUrl, '_partition', partitions[i]);
      testPages.push(url);
    }

    return testPages;
  },

  /**
   * Gets the application's testem config by trying a custom file first and then
   * defaulting to either `testem.js` or `testem.json`.
   *
   * @param {String} file
   * @return {Object} config
   */
  _readTestemConfig: function(file) {
    var potentialFiles = [
      'testem.js',
      'testem.json'
    ];

    if (file) {
      potentialFiles.unshift(file);
    }

    var configFile = this._findValidFile(potentialFiles);

    return configFile && this._readFileByType(configFile);
  },

  /**
   * Given an array of file paths, returns the first one that exists and is
   * accessible. Paths are relative to the process' cwd.
   *
   * @param {Array<String>} files
   * @return {String} file
   */
  _findValidFile: function(files) {
    for (var i = 0; i < files.length; i++) {
      var file = path.join(process.cwd(), files[i]);
      try {
        fs.accessSync(file, fs.F_OK);
        return file;
      } catch (error) {
        debug('Failed to find ' + file + ' due to error: ' + error);
        continue;
      }
    }
  },

  /**
   * Reads in a given file according to it's "type" as determined by file
   * extension. Supported types are `js` and `json`.
   *
   * @param {String} file
   * @return {Object} fileContents
   */
  _readFileByType: function(file) {
    var fileType = file.split('.').pop();
    switch (fileType) {
      case 'js':
        return require(file);
      case 'json':
        return fs.readJsonSync(file);
    }
  }
});
