'use strict';

const fs = require('fs-extra');
const path = require('path');
const TestCommand = require('ember-cli/lib/commands/test'); // eslint-disable-line node/no-unpublished-require
const TestServerTask = require('./task/test-server');
const TestTask = require('./task/test');
const debug = require('debug')('exam');
const moment = require('moment');

const executionMapping = Object.create(null);

function addToQuery(query, param, value) {
  if (!value) {
    return query;
  }

  const queryAddParam = query ? query + '&' + param : param;

  return value !== true ?
    queryAddParam + '=' + value :
    queryAddParam;
}

function addToUrl(url, param, value) {
  const urlParts = url.split('?');
  const base = urlParts[0];
  const query = urlParts[1];

  return base + '?' + addToQuery(query, param, value);
}

module.exports = TestCommand.extend({
  name: 'exam',

  description: 'Runs your app\'s test suite with more options than \'test\'.',

  works: 'insideProject',

  availableOptions: [
    { name: 'split',        type: Number,                  description: 'A number of files to split your tests across.' },
    { name: 'partition',    type: [Array, Number],         description: 'The number of the partition(s) to run after splitting.' },
    { name: 'parallel',     type: Boolean, default: false, description: 'Runs your split tests on parallel child processes.' },
    { name: 'load-balance', type: Number,                  description: 'The number of browser(s) to load balance test files against. Test files will be sorted by weight from slowest (acceptance) to fastest (eslint).' },
    { name: 'random',       type: String,  default: false, description: 'Randomizes your modules and tests while running your test suite.' },
    { name: 'replay-execution', type: String,  default: false,  description: 'A JSON file path which maps from browser number to a list of modules'},
    { name: 'replay-browser',   type: [Array, Number],          description: 'The number of the browser(s) to run from a specified file path'}
  ].concat(TestCommand.prototype.availableOptions),

  init() {
    this._super(...arguments);
    this.tasks.Test = TestTask;
    this.tasks.TestServer = TestServerTask;
  },

  /**
   * Creates an options validator object.
   *
   * @private
   * @param {Object} options
   * @return {TestOptionsValidator}
   */
  _createValidator(options) {
    const Validator = require('../utils/tests-options-validator');
    return new Validator(options, this._getTestFramework());
  },

  /**
   * Gets the name of the test framework being used by the project.
   *
   * @private
   * @return {String}
   */
  _getTestFramework() {
    const pkg = this.project.pkg;
    const dependencies = pkg.dependencies || {};
    const devDependencies = pkg.devDependencies || {};

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
  run(commandOptions) {
    this.validator = this._createValidator(commandOptions);

    if (this.validator.shouldSplit) {
      commandOptions.query = addToQuery(commandOptions.query, 'split', commandOptions.split);

      process.env.EMBER_EXAM_SPLIT_COUNT = commandOptions.split;

      // Ignore the partition option when paralleling (we'll fill it in later)
      if (!this.validator.shouldParallelize) {
        const partitions = commandOptions.partition;
        if (partitions) {
          for (let i = 0; i < partitions.length; i++) {
            commandOptions.query = addToQuery(commandOptions.query, 'partition', partitions[i]);
          }
        }
      }
    }

    if (this.validator.shouldLoadBalance) {
      commandOptions.query = addToQuery(commandOptions.query, 'loadBalance', commandOptions.loadBalance);
    }

    if (this.validator.shouldRandomize) {
      commandOptions.query = this._randomize(commandOptions.random, commandOptions.query);
    }

    return this._super.run.apply(this, arguments);
  },

  /**
   * Returns an execution mapping object that contains number of browsers and modules ran per browsers.
   *
   * @param {Object} option
   */
  getExecutionMappingInstance(options) {
    if (executionMapping !== undefined && executionMapping.numberOfBrowsers !== undefined && executionMapping.browserToModuleMap !== undefined) {
      return executionMapping;
    }
    const executionFilePath = options.replayExecution;
    const browserIdsToReplay = options.replayBrowser;

    let testMapping = {};

    try {
      // Read the replay execution json file.
      const executionToReplay = fs.readFileSync(executionFilePath);
      testMapping = JSON.parse(executionToReplay);
    } catch (err) {
      throw new Error(`Error reading reply execution JSON file - ${err}`);
    }

    const browserModuleMapping = testMapping.executionMapping;

    executionMapping.numberOfBrowsers = testMapping.numberOfBrowsers;
    executionMapping.browserToModuleMap = ((browserIdsToReplay, browserModuleMapping) => {
      const browserModuleMap = {};

      for (let i = 0; i < browserIdsToReplay.length; i++) {
        const browserId = browserIdsToReplay[i];
        const listOfModules = browserModuleMapping[browserId];
        browserModuleMap[browserId] = listOfModules;
      }

      return browserModuleMap;
    })(browserIdsToReplay, browserModuleMapping);

    return executionMapping;
  },

  /**
   * Adds a `seed` param to the `query` to support randomization. Currently
   * only works with QUnit.
   *
   * @param {Object} commandOptions
   * @return {Void}
   */
  _randomize(random, query) {
    const seed = random !== '' ? random : Math.random().toString(36).slice(2);

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
  _generateCustomConfigs(commandOptions) {
    const config = this._super._generateCustomConfigs.apply(this, arguments);
    const customBaseUrl = this._getCustomBaseUrl(config, commandOptions);

    const shouldParallelize = this.validator.shouldParallelize;
    const shouldLoadBalance = this.validator.shouldLoadBalance;
    const shouldReplayExecution = this.validator.shouldReplayExecution;

    if (!shouldParallelize && !shouldLoadBalance && !shouldReplayExecution) {
      return config;
    }

    let browserIds = commandOptions.partition;
    let appendingParam = 'partition';

    if (shouldParallelize && !browserIds) {
      browserIds = [];
      for (let i = 0; i < commandOptions.split; i++) {
        browserIds.push(i + 1);
      }
    } else if (shouldLoadBalance) {
      config.custom_browser_socket_events = this._addLoadBalancingBrowserSocketEvents(config);

      const browserCount = commandOptions.loadBalance;
      appendingParam = 'browser';

      // Creates an array starting from 1 to browserCount. e.g. if browserCount is 3, the returned array is [1, 2, 3]
      browserIds = Array.from({length: browserCount}, (v,k) => k+1);
    } else if (shouldReplayExecution) {
      const executionMapping = this.getExecutionMappingInstance(commandOptions);
      config.custom_browser_socket_events = this._addLoadBalancingBrowserSocketEvents(config);
      config.browser_module_mapping = executionMapping.browserToModuleMap;

      appendingParam = 'browser';
      browserIds = commandOptions.replayBrowser;
    }

    if (Array.isArray(customBaseUrl)) {
      const command = this;
      config.testPage = customBaseUrl.reduce(function(testPages, customBaseUrl) {
        return testPages.concat(command._generateTestPages(customBaseUrl, appendingParam, browserIds));
      }, []);
    } else {
      config.testPage = this._generateTestPages(customBaseUrl, appendingParam, browserIds);
    }

    return config;
  },

  /**
   * Customizes the base url by specified test splitting options - parellel or loadBalance.
   *
   * @param {String} config
   * @param {Object} commandOptions
   * @return {Object}
   * @example tests/index.html?hidepassed&split=3 if parallel
   *          tests/index.html?hidepassed&split=3&loadBalance if load-balance
   *          tests/index.html?hidepassed&split=3&loadBalance&partition=1&partition=2 if load-balance and partitions are specified
   */
  _getCustomBaseUrl(config, commandOptions) {
    // Get the testPage from the generated config or the Testem config and
    // use it as the baseUrl to customize for the parallelized test pages or test load balancing
    const baseUrl = config.testPage || this._getTestPage(commandOptions.configFile);
    const splitCount = commandOptions.split;

    const command = this;

    const appendParamToBaseUrl = function(baseUrl) {
      if (command.validator.shouldParallelize || command.validator.shouldSplit) {
        baseUrl = addToUrl(baseUrl, 'split', splitCount);
      }
      // `loadBalance` is added to url when running replay-execution in order to emit `set-module-queue` in patch-test-loader.
      if (command.validator.shouldLoadBalance || command.validator.shouldReplayExecution) {
        baseUrl = addToUrl(baseUrl, 'loadBalance', true)

        const partitions = commandOptions.partition;
        if (partitions) {
          for (let i = 0; i < partitions.length; i++) {
            baseUrl = addToUrl(baseUrl, 'partition', partitions[i]);
          }
        }
      }

      return baseUrl;
    }

    if (Array.isArray(baseUrl)) {
      return baseUrl.map((currentUrl) => {
        return appendParamToBaseUrl(currentUrl);
      })
    } else {
      return appendParamToBaseUrl(baseUrl);
    }
  },

  /**
   * Gets the test page specified by the application's Testem config.
   *
   * @param {String} [configFile] - Path to the config file to use
   * @return {String} testPage
   */
  _getTestPage(configFile) {
    // Attempt to read in the testem config and use the test_page definition
    const testemConfig = this._readTestemConfig(configFile);
    let testPage = testemConfig && testemConfig.test_page;

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
   * Generates multiple test pages: for a given baseUrl, it appends the partition numbers
   * or the browserId each page is running as query params.
   *
   * @param {String} customBaseUrl
   * @param {String} appendingParam
   * @param {Array<Number} browserIds
   * @return {Array<String>} testPages
   */
  _generateTestPages(customBaseUrl, appendingParam, browserIds) {
    const testPages = [];
    for (let i = 0; i < browserIds.length; i++) {
      const url = addToUrl(customBaseUrl, appendingParam, browserIds[i]);
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
  _readTestemConfig(file) {
    const potentialFiles = [
      'testem.js',
      'testem.json'
    ];

    if (file) {
      potentialFiles.unshift(file);
    }

    const configFile = this._findValidFile(potentialFiles);

    return configFile && this._readFileByType(configFile);
  },

  /**
   * Given an array of file paths, returns the first one that exists and is
   * accessible. Paths are relative to the process' cwd.
   *
   * @param {Array<String>} files
   * @return {String} file
   */
  _findValidFile(files) {
    for (let i = 0; i < files.length; i++) {
      // TODO: investigate this cwd() usually they are in-error...
      const file = path.join(process.cwd(), files[i]);
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
  _readFileByType(file) {
    const fileType = file.split('.').pop();
    switch (fileType) {
      case 'js':
        return require(file);
      case 'json':
        return fs.readJsonSync(file);
    }
  },

  /**
   * Adds additional event handlers to config to enable load balancing.
   *
   * @param {object} config
   * @return {object} events
   */
  _addLoadBalancingBrowserSocketEvents(config) {
    const events = config.custom_browser_socket_events || {};

    events['set-modules-queue'] = function(modules) {
      // When `load-balance` option is valid we want to have one static list of modules on server side to send a module path to browsers.
      const proto = Object.getPrototypeOf(this);

      // browserModuleMapping is defined if `replay-execution` option is being used.
      const browserModuleMapping = this.config.progOptions.browser_module_mapping;

      // Updating browserModuleMapping which maps from browser ids to a list of AMD modules ran per the browser
      // is needed when running test suite in ci.
      if (this.config.appMode === 'ci' && browserModuleMapping && !this.moduleQueue) {
        const browserId = /browser=\s*([0-9]*)/.exec(this.launcher.settings.test_page)[1];

        if (browserId === undefined) {
          throw new Error('Browser Id can\'t be found.');
        }

        this.moduleQueue = browserModuleMapping[browserId];
      } else if (!proto.moduleQueue) {
        proto.moduleQueue = modules;
        proto.moduleMap = {};
      }
    }

    events['get-next-module'] = function() {
      const proto = Object.getPrototypeOf(this);
      const replayExecution = this.config.progOptions.browser_module_mapping;
      const moduleQueue = this.moduleQueue;
      const moduleName = moduleQueue.shift();

      if (!moduleName) {
        this.socket.emit('testem:module-queue-complete');
      } else {
        this.socket.emit('testem:next-module-response', moduleName);
        // keep track of the modules ran per browserId when appMode is ci and replayExecution flag is false
        if (this.config.appMode === 'ci' && !replayExecution) {
          const browserId = /browser=\s*([0-9]*)/.exec(this.launcher.settings.test_page)[1];

          if (browserId === undefined) {
            throw new Error('Browser Id can\'t be found.');
          }

          proto.moduleMap[browserId] = proto.moduleMap[browserId] || [];
          proto.moduleMap[browserId].push(moduleName);
        }
      }

    }

    if (this.validator.shouldReplayExecution) {
      return events;
    }

    // We only need to register `after-tests-complete` event to create json file when the test execution run is not for replay-execution.
    events['after-tests-complete'] = function() {
      const proto = Object.getPrototypeOf(this);
      const browserCount = Object.keys(config.testPage).length;
      // custom_browser_socket_events is set in config when _loadBalance is in test pages and browser_module_mapping is set when running `replay-execution`.
      const shouldLoadBalance = !!this.config.progOptions.custom_browser_socket_events && !this.config.progOptions.browser_module_mapping

      proto.finishedBrowsers = proto.finishedBrowsers ? proto.finishedBrowsers + 1 : 1;

      if (proto.finishedBrowsers == browserCount) {
        // Clean the moduleQueue and finishedBrowser. This guarantees new test run can set the moduleQueue. Otherwise, the server will return no more test to run.
        // TODO: Investigate not using proto
        delete proto.moduleQueue;
        delete proto.finishedBrowser;
        if (this.config.appMode === 'ci' && shouldLoadBalance) {
          const fileName = `test-execution-${moment().format('YYYY-MM-DD__HH-MM-SS')}.json`;
          const moduleMapJson = {
            numberOfBrowsers: browserCount,
            executionMapping: proto.moduleMap
          };
          const testExecutionJson = JSON.stringify(moduleMapJson);
          fs.writeFileSync(fileName, testExecutionJson, (err) => {
            if (err) throw err;
          });
        }
      }
    }

    return events;
  }
});
