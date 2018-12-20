'use strict';

const fs = require('fs-extra');
const { addToQuery } = require('../utils/query-helper');
const { convertOptionValueToArray, getMultipleTestPages } = require('../utils/test-page-helper');
const readTestExecutionJsonFile = require('../utils/test-execution-json-reader');
const TestCommand = require('ember-cli/lib/commands/test'); // eslint-disable-line node/no-unpublished-require
const TestServerTask = require('./task/test-server');
const TestTask = require('./task/test');

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
    { name: 'replay-browser',   type: [String, Number, Array],          description: 'The number of the browser(s) to run from a specified file path'}
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
   * Validates all commandOptions
   *
   * @param {*} commandOptions
   */
  _validateOptions(commandOptions) {
    this.validator = this._createValidator(commandOptions);

    if (commandOptions.split || commandOptions.partition) {
      this.validator.shouldSplit;
    }

    if (commandOptions.parallel) {
      this.validator.shouldParallelize;
    }

    // As random option can be an empty string it should check a type of random option rather than the option is not empty.
    if (typeof commandOptions.random !== 'undefined') {
      this.validator.shouldRandomize;
    }

    if (commandOptions.loadBalance) {
      this.validator.shouldLoadBalance;
    }

    if (commandOptions.replayExecution || commandOptions.replayExecution) {
      this.validator.shouldReplayExecution;
    }
  },

  /**
   * Validates the command options and then runs the original test command.
   *
   * @override
   */
  run(commandOptions) {
    this._validateOptions(commandOptions);

    // convert replayBrowser value to array
    commandOptions.replayBrowser = convertOptionValueToArray(commandOptions.replayBrowser);

    if (commandOptions.split) {
      commandOptions.query = addToQuery(commandOptions.query, 'split', commandOptions.split);

      process.env.EMBER_EXAM_SPLIT_COUNT = commandOptions.split;

      // Ignore the partition option when paralleling (we'll fill it in later)
      if (!commandOptions.parallel) {
        const partitions = commandOptions.partition;
        if (partitions) {
          for (let i = 0; i < partitions.length; i++) {
            commandOptions.query = addToQuery(commandOptions.query, 'partition', partitions[i]);
          }
        }
      }
    }

    if (commandOptions.loadBalance) {
      commandOptions.query = addToQuery(commandOptions.query, 'loadBalance', commandOptions.loadBalance);
    }

    if (typeof commandOptions.random !== 'undefined') {
      commandOptions.query = this._randomize(commandOptions.random, commandOptions.query);
    }

    return this._super.run.apply(this, arguments);
  },

  /**
   * Returns an execution mapping object that contains number of browsers and modules ran per browsers.
   *
   * @param {Object} option
   */
  getExecutionMappingInstance(executionFilePath, browserIdsToReplay) {

    const browserModuleMap = Object.create(null);
    const executionJson = readTestExecutionJsonFile(executionFilePath);

    browserIdsToReplay.forEach((browserId) => {
      //what if browserId is not in the test file?
      browserModuleMap[browserId] = executionJson.browserToModuleMap[browserId];
    })

    return browserModuleMap;
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

    if (!commandOptions.loadBalance && !commandOptions.parallel && !commandOptions.replayExecution) return config;

    config.testPage = getMultipleTestPages(config, commandOptions);

    if (commandOptions.loadBalance || commandOptions.replayExecution) {
      config.custom_browser_socket_events = this._addLoadBalancingBrowserSocketEvents(config);
      if (commandOptions.replayExecution) {
        const executionMapping = this.getExecutionMappingInstance(commandOptions.replayExecution, commandOptions.replayBrowser);
        config.browser_module_mapping = executionMapping.browserToModuleMap;
      }
    }

    return config;
  },

  /**
   * Adds additional event handlers to config to enable load balancing.
   *
   * @param {object} config
   * @return {object} events
   */
  _addLoadBalancingBrowserSocketEvents(config) {
    const events = config.custom_browser_socket_events || {};

    events['testem:set-modules-queue'] = function(modules) {
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

    events['testem:get-next-module'] = function() {
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
          const fileName = `test-execution-${new Date().toJSON().replace(/[:.]/g,'-')}.json`;
          const moduleMapJson = {
            numberOfBrowsers: browserCount,
            browserToModuleMap: proto.moduleMap
          };
          const testExecutionJson = JSON.stringify(moduleMapJson);
          try {
            fs.writeFileSync(fileName, testExecutionJson);
          } catch (err) {
            const errorMessage = `Failed to write a test execution json file: ${fileName} ` + err.message;
            throw new Error(errorMessage);
          }
        }
      }
    }

    return events;
  }
});
