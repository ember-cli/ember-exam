'use strict';

const { addToQuery } = require('../utils/query-helper');
const {
  convertOptionValueToArray,
  getMultipleTestPages
} = require('../utils/test-page-helper');
const TestemEvents = require('../utils/testem-events');
const TestCommand = require('ember-cli/lib/commands/test'); // eslint-disable-line node/no-unpublished-require
const TestServerTask = require('./task/test-server');
const TestTask = require('./task/test');

module.exports = TestCommand.extend({
  name: 'exam',

  description: 'Runs your app\'s test suite with more options than \'test\'.',

  works: 'insideProject',

  availableOptions: [
    { name: 'split',            type: Number,                  description: 'A number of files to split your tests across.' },
    { name: 'partition',        type: [Array, Number, String], description: 'The number of the partition(s) to run after splitting.' },
    { name: 'parallel',         type: Number,                  description: 'Runs your split tests on parallel child processes.' },
    { name: 'load-balance',     type: Boolean, default: false, description: 'Load balance test modules. Test files will be sorted by weight from slowest (acceptance) to fastest (eslint).' },
    { name: 'random',           type: String,  default: false, description: 'Randomizes your modules and tests while running your test suite.' },
    { name: 'replay-execution', type: String,  default: false, description: 'A JSON file path which maps from browser number to a list of modules' },
    { name: 'replay-browser',   type: [Array, Number, String], description: 'The number of the browser(s) to run from a specified file path' },
    { name: 'execution-only',   type: Boolean, default: false, description: 'Disables writing a test-execution json file after running your test suite'}
  ].concat(TestCommand.prototype.availableOptions),

  init() {
    this._super(...arguments);
    this.tasks.Test = TestTask;
    this.tasks.TestServer = TestServerTask;
    this.testemEvents = new TestemEvents(this.project.root);
  },

  /**
   *  Validates commandOptions
   *
   * @private
   * @param {Object} commandOptions
   * @return {Object} A map of what switches are enabled
   */
  _validateOptions(commandOptions) {
    const Validator = require('../utils/tests-options-validator');
    const validator = new Validator(commandOptions, this._getTestFramework());
    return validator.validateCommands();
  },

  /**
   * Gets the name of the test framework being used by the project.
   *
   * @private
   * @return {string}
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
   * @param {Object} commandOptions
   * @override
   */
  run(commandOptions) {
    this.commands = this._validateOptions(commandOptions);

    // TODO: explore not mutating the commandOptions input
    if (commandOptions.split) {
      commandOptions.query = addToQuery(commandOptions.query, 'split', commandOptions.split);

      process.env.EMBER_EXAM_SPLIT_COUNT = commandOptions.split;

      // Ignore the partition option when paralleling (we'll fill it in later)
      if (!commandOptions.parallel && commandOptions.partition) {
        const partitions = convertOptionValueToArray(commandOptions.partition);
        if (partitions.length) {
          for (let i = 0; i < partitions.length; i++) {
            commandOptions.query = addToQuery(commandOptions.query, 'partition', partitions[i]);
          }
        }
      }
    }

    if (commandOptions.loadBalance) {
      commandOptions.query = addToQuery(commandOptions.query, 'loadBalance', commandOptions.loadBalance);
    }

    if (commandOptions.replayBrowser) {
      commandOptions.replayBrowser = convertOptionValueToArray(commandOptions.replayBrowser);
    }

    if (typeof commandOptions.random !== 'undefined') {
      commandOptions.query = this._randomize(commandOptions.random, commandOptions.query);
    }

    return this._super.run.apply(this, arguments);
  },

  /**
   * Adds a `seed` param to the `query` to support randomization. Currently
   * only works with QUnit.
   *
   * @param {string} random
   * @param {string} query
   * @return {string}
   */
  _randomize(random, query) {
    const seed = random !== '' ? random : Math.random().toString(36).slice(2);

    this.ui.writeLine('Randomizing tests with seed: ' + seed);

    return addToQuery(query, 'seed', seed);
  },

  /**
   * Customizes the Testem config to have multiple test pages if attempting to
   * run in parallel or load-balance. It is important that the user specifies
   * the number of launchers to run in parallel in their testem.json config.
   *
   * @param {Object} commandOptions
   * @override
   */
  _generateCustomConfigs(commandOptions) {
    const config = this._super._generateCustomConfigs.apply(this, arguments);

    if (!commandOptions.loadBalance && !commandOptions.replayExecution && !commandOptions.parallel) return config;

    config.testPage = getMultipleTestPages(config, commandOptions);

    if (commandOptions.loadBalance || commandOptions.replayExecution) {
      config.custom_browser_socket_events = this._addLoadBalancingBrowserSocketEvents(config);
      if (commandOptions.replayExecution) {
        this.testemEvents.setReplayExecutionMap(commandOptions.replayExecution, commandOptions.replayBrowser);
      }
    }

    return config;
  },

  /**
   * Adds additional event handlers which enables load balancing.
   *
   * @param {Object} config
   * @return {Object} events
   */
  _addLoadBalancingBrowserSocketEvents(config) {
    const commands = this.commands;
    const testemEvents = this.testemEvents;
    const ui = this.ui;
    const events = config.custom_browser_socket_events || {};
    const testExecutionFileName = `test-execution-${Date.now()}.json`;
    const getBrowserId = function(testPage) {
      const browserId = /browser=\s*([0-9]*)/.exec(testPage);

      if (Array.isArray(browserId) !== null) {
        return browserId[1];
      } else {
        throw new Error('Browser Id can\'t be found.');
      }
    }

    events['testem:set-modules-queue'] = function(modules) {
      const browserId = getBrowserId(this.launcher.settings.test_page);
      testemEvents.setModuleQueue(browserId, modules, commands.loadBalance, commands.replayExecution, commands.executionOnly);
    }

    events['testem:next-module-request'] = function() {
      const browserId = getBrowserId(this.launcher.settings.test_page);
      testemEvents.nextModuleResponse(browserId, this.socket, commands.loadBalance, commands.executionOnly);
    }

    events['test-result'] = function(result) {
      if (result.failed) {
        const browserId = getBrowserId(this.launcher.settings.test_page);
        testemEvents.recoredFailedBrowserId(browserId);
      }
    };

    if (commands.loadBalance) {
      // Makes sure if a browser crash happens, the browser id is still recoreded
      // Then write the test-execution file if all browser are completed
      const browserFailureHandler = function() {
        if (this.finished) { return; }

        const browserId = getBrowserId(this.launcher.settings.test_page);
        testemEvents.recoredFailedBrowserId(browserId);

        browserExitHandler();
      };

      const browserExitHandler = () => {
        const browserCount = Object.keys(config.testPage).length;

        if (testemEvents.completedBrowsersHandler(browserCount, commands.loadBalance, testExecutionFileName, commands.executionOnly)) {
          ui.writeLine(`\nThis execution was recorded at ${testExecutionFileName}`);
        }
      };

      let registerProcessOn = false;

      events['tests-start'] = function() {
        // 'tests-start' is emitted everytime a test starts.
        // To prevent from registering `processExit` and `processError` multiple times set a flag to check if callbacks are registered.
        if (!registerProcessOn) {
          this.process.on('processExit', browserFailureHandler.bind(this));
          this.process.on('processError', browserFailureHandler.bind(this));
          registerProcessOn = true;
        }
      }
      events['after-tests-complete'] = function() {
        browserExitHandler();
      }
      events['disconnect'] = browserFailureHandler;
    }

    return events;
  }
});
