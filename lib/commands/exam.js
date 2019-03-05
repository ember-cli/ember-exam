'use strict';

const { addToQuery } = require('../utils/query-helper');
const {
  combineOptionValueIntoArray,
  getBrowserId,
  getMultipleTestPages
} = require('../utils/test-page-helper');
const TestemEvents = require('../utils/testem-events');
const TestCommand = require('ember-cli/lib/commands/test'); // eslint-disable-line node/no-unpublished-require
const TestServerTask = require('./task/test-server');
const TestTask = require('./task/test');

module.exports = TestCommand.extend({
  name: 'exam',

  description: `Runs your app's test suite with more options than 'test'.`,

  works: 'insideProject',

  availableOptions: [
    {
      name: 'partition-count',
      type: Number,
      description: 'A number of files to split your tests across.'
    },
    {
      name: 'partition',
      type: [Array, Number, String],
      description: 'The number of the partition(s) to run after splitting.'
    },
    {
      name: 'parallel',
      type: Number,
      description: 'Runs your split tests on parallel child processes.'
    },
    {
      name: 'browser-count',
      type: Number,
      description:
        'The number of the browser(s) to run test suite with load balancing.'
    },
    {
      name: 'random',
      type: String,
      default: false,
      description:
        'Randomizes your modules and tests while running your test suite.'
    },
    {
      name: 'replay-execution',
      type: String,
      default: false,
      aliases: ['re'],
      description:
        'A JSON file path which maps from browser id(s) to a list of modules'
    },
    {
      name: 'replay-browser',
      type: [Array, Number, String],
      aliases: ['rb'],
      description: 'The browser id(s) to replay from the replay-execution file'
    },
    {
      name: 'write-execution-file',
      type: Boolean,
      default: false,
      aliases: ['wef'],
      description:
        'Allows writing a test-execution json file after running your test suite'
    }
  ].concat(TestCommand.prototype.availableOptions),

  init() {
    this._super(...arguments);
    this.tasks.Test = TestTask;
    this.tasks.TestServer = TestServerTask;
    this.testemEvents = new TestemEvents(this.project.root);
    this.emberCliVersion =
      this.project.pkg.devDependencies['ember-cli'] ||
      this.project.pkg.dependencies['ember-cli'];
  },

  /**
   * Validates commandOptions
   *
   * @private
   * @param {Object} commandOptions
   * @return {Object} A map of what switches are enabled
   */
  _validateOptions(commandOptions) {
    const Validator = require('../utils/tests-options-validator');
    const validator = new Validator(
      commandOptions,
      this._getTestFramework(),
      this.emberCliVersion
    );
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
    if (commandOptions.partitionCount) {
      commandOptions.query = addToQuery(
        commandOptions.query,
        'partitionCount',
        commandOptions.partitionCount
      );

      process.env.EMBER_EXAM_SPLIT_COUNT = commandOptions.partitionCount;

      // Ignore the partition option when paralleling (we'll fill it in later)
      if (!commandOptions.parallel && commandOptions.partition) {
        const partitions = combineOptionValueIntoArray(
          commandOptions.partition
        );
        for (let i = 0; i < partitions.length; i++) {
          commandOptions.query = addToQuery(
            commandOptions.query,
            'partition',
            partitions[i]
          );
        }
      }
    }

    if (commandOptions.replayBrowser) {
      commandOptions.replayBrowser = combineOptionValueIntoArray(
        commandOptions.replayBrowser
      );
    }

    if (typeof commandOptions.random !== 'undefined') {
      commandOptions.query = this._randomize(
        commandOptions.random,
        commandOptions.query
      );
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
    const seed =
      random !== ''
        ? random
        : Math.random()
            .toString(36)
            .slice(2);

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

    if (!commandOptions.browserCount && !commandOptions.replayExecution && !commandOptions.parallel )
      return config;

    config.testPage = getMultipleTestPages(config, commandOptions);

    if (commandOptions.browserCount || commandOptions.replayExecution) {
      config.custom_browser_socket_events = this._addLoadBalancingBrowserSocketEvents(
        config
      );
      if (commandOptions.replayExecution) {
        this.testemEvents.setReplayExecutionMap(
          commandOptions.replayExecution,
          commandOptions.replayBrowser
        );
      }
    }

    return config;
  },

  /**
   * Returns a object of event handlers which enables load balancing.
   * These event handlers will be registered on Testem's browserTestRunner socket instance
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
    const browserExitHandler = function() {
      const totalBrowserCount = Object.keys(config.testPage).length;
      testemEvents.completedBrowsersHandler(
        totalBrowserCount,
        ui,
        commands.get('browserCount'),
        testExecutionFileName,
        commands.get('writeExecutionFile')
      );
    };
    const browserFailureHandler = function() {
      if (this.finished) {
        return;
      } else if (commands.get('writeExecutionFile')) {
        const browserId = getBrowserId(this.launcher.settings.test_page);
        testemEvents.recoredFailedBrowserId(browserId);
      }

      browserExitHandler();
    };

    let init = false;

    events['tests-start'] = function() {
      if (!init) {
        this.process.on('processExit', browserFailureHandler.bind(this));
        this.process.on('processError', browserFailureHandler.bind(this));
        init = true;
      }
    };
    events['testem:set-modules-queue'] = function(modules, browserId) {
      testemEvents.setModuleQueue(
        browserId,
        modules,
        commands.get('browserCount'),
        commands.get('replayExecution')
      );
    };
    events['testem:next-module-request'] = function(browserId) {
      testemEvents.nextModuleResponse(
        browserId,
        this.socket,
        commands.get('writeExecutionFile')
      );
    };
    events['test-result'] = function(result) {
      if (result.failed && commands.get('writeExecutionFile')) {
        const browserId = getBrowserId(this.launcher.settings.test_page);
        testemEvents.recoredFailedBrowserId(browserId);
      }
    };
    events['after-tests-complete'] = browserExitHandler;
    events['disconnect'] = browserFailureHandler;

    return events;
  }
});
