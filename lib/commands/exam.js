'use strict';

const { addToQuery } = require('../utils/query-helper');
// npmlog is used to write to testem server logs and `--testem-debug` enables to save the log file.
const log = require('npmlog');
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
      name: 'split',
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
      type: [Number, String],
      description: 'Runs your split tests on parallel child processes.'
    },
    {
      name: 'load-balance',
      type: Boolean,
      default: false,
      description:
        'Load balance test modules. Test modules will be sorted by weight from slowest (acceptance) to fastest (eslint).'
    },
    {
      name: 'random',
      type: String,
      default: false,
      description:
        'Randomizes your modules and tests while running your test suite.'
    },
    {
      name: 'module-path',
      type: [String],
      aliases: ['mp'],
      description: 'Filters the list of modules to only those that matches by module paths, the value accepts either string or regex.'
    },
    {
      name: 'file-path',
      type: [String],
      aliases: ['fp'],
      description: 'Filters the list of modules to only those that matches by test file paths, the value accepts either string or regex.'
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
    },
    {
      name: 'write-module-metadata-file',
      type: Boolean,
      default: false,
      aliases: ['wmmf'],
      description:
        'Allows writing a module metadata json file after running your test suite'
    }
  ].concat(TestCommand.prototype.availableOptions),

  init() {
    this._super(...arguments);
    this.tasks.Test = TestTask;
    this.tasks.TestServer = TestServerTask;
    this.testemEvents = new TestemEvents(this.project.root);

    const pkg = this.project.pkg;
    const dependencies = pkg.dependencies || {};
    const devDependencies = pkg.devDependencies || {};

    this.emberCliVersion = devDependencies['ember-cli'] || dependencies['ember-cli'];
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

    if (dependencies['ember-mocha'] || devDependencies['ember-mocha']) {
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
      commandOptions.query = addToQuery(
        commandOptions.query,
        'split',
        commandOptions.split
      );

      process.env.EMBER_EXAM_SPLIT_COUNT = commandOptions.split;

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

    if (commandOptions.modulePath) {
      commandOptions.query = addToQuery(
        commandOptions.query,
        'modulePath',
        commandOptions.modulePath
      );
    }

    if (commandOptions.filePath) {
      commandOptions.query = addToQuery(
        commandOptions.query,
        'filePath',
        commandOptions.filePath
      );
    }

    if (commandOptions.loadBalance) {
      commandOptions.query = addToQuery(
        commandOptions.query,
        'loadBalance',
        commandOptions.loadBalance
      );
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
    let additionalEvents = this._setupAndGetBrowserSocketEvents(config);

    if (commandOptions.loadBalance || commandOptions.replayExecution) {
      const loadBalancingEvents = this._getLoadBalancingBrowserSocketEvents({
        isLoadBalance: this.commands.get('loadBalance'),
        isReplayExecution: this.commands.get('replayExecution'),
        isWriteExecutionFile: this.commands.get('writeExecutionFile')
      }, this.testemEvents );
      additionalEvents = Object.assign(additionalEvents, loadBalancingEvents);
    }

    config.custom_browser_socket_events = Object.assign(config.custom_browser_socket_events || {}, additionalEvents);

    if (!commandOptions.loadBalance && !commandOptions.replayExecution && !commandOptions.parallel )
      return config;

    config.testPage = getMultipleTestPages(config, commandOptions);

    if (commandOptions.replayExecution) {
      this.testemEvents.setReplayExecutionMap(
        commandOptions.replayExecution,
        commandOptions.replayBrowser
      );
    }

    return config;
  },

  /**
   * Returns an event object to enable to send and receive module metadata
   *
   * @param {Object} config
   */
  _setupAndGetBrowserSocketEvents(config) {
    const commands = this.commands;
    const testemEvents = this.testemEvents;
    const ui = this.ui;

    const browserExitHandler = function(failed = false) {

      const launcherId = this.launcher.id;
      if (!failed && commands.get('loadBalance')) {
        try {
          const browserId = getBrowserId(this.launcher);
          log.info(`Browser ${browserId} exiting. [ # of modules in current module queue ${testemEvents.stateManager.getTestModuleQueue().length} ]`);
        } catch (err) {
          const moduleQueueMessage = testemEvents.stateManager.getTestModuleQueue() === null ?
          'testModuleQueue is not set.' :
          `[ # of modules in current module queue ${testemEvents.stateManager.getTestModuleQueue().length} ]`;

          if (typeof err === 'object' && err !== null) {
            err.message = `${err.message} \n ${moduleQueueMessage}`;
            ui.writeLine(err.message);
          } else {
            throw new Error(moduleQueueMessage);
          }
        }
      }

      // config.testPage is undefined when parallization options are not used
      // Set browserCount default value to 1 to allow
      let browserCount = 1;
      // When using multiple browsers config.testPage is an array of test page urls.
      if (typeof config.testPage !== 'undefined') {
        browserCount = Object.keys(config.testPage).length;
      }

      testemEvents.completedBrowsersHandler(
        browserCount,
        launcherId,
        ui,
        commands,
        Date.now()
      );
    };

    const browserTerminationHandler = function() {
      // browserTerminationHandler is called for disconnect, processError or processExit events.
      // disconnect and processExit events is fired during global error and successful test runs.
      // On successful test runs, browserExitHandler should already be called. And is unnecessary
      // to call it again, so we should return. This is covered by this.finish = true
      // On global failure cases, it's possible that this.finish is also true. So we must check
      // the timers set by onProcessExit
      // https://github.com/testem/testem/blob/master/lib/runners/browser_test_runner.js#L266
      // or onProcessError in testem.
      // https://github.com/testem/testem/blob/master/lib/runners/browser_test_runner.js#L252
      // If either timers is set, we should record the failed browser and call browserExitHandler
      if (this.finished && (!this.onProcessExitTimer && !this.pendingTimer)) {
        return;
      }
      if (commands.get('writeExecutionFile')) {
        testemEvents.recordFailedBrowserId(this.launcher, ui);
      }

      browserExitHandler.call(this, true);
    };

    return this._getModuleMetadataAndBrowserExitSocketEvents(browserExitHandler, browserTerminationHandler);
  },

  /**
   * Add browser socket events are needed for both with load-balance and without load-balance
   *
   * @param {Object} browserExitHandler
   * @param {Object} browserTerminationHandler
   */
  _getModuleMetadataAndBrowserExitSocketEvents(browserExitHandler, browserTerminationHandler) {
    const events = {};
    const testemEvents = this.testemEvents;
    let init = false;

    events['tests-start'] = function() {
      if (!init) {
        // process object is instantiated only when browsers are launched by testem server.
        // 1. `ember test/exam` where browsers are instantiated by testem - process is available
        // 2. `ember test/exam --server` where browsers can be instantiated by testem or manually
        // - process is available only when browsers are instantiated by testem
        // 3. `ember test/exam --serve --no-launch` where browsers are instantiated manually - process is undefined
        // 4. `ember serve` where browsers are instantiated manually by developer - process is available.
        if (typeof this.process !== 'undefined' && this.process !== null) {
          this.process.on('processExit', browserTerminationHandler.bind(this));
          this.process.on('processError', browserTerminationHandler.bind(this));
        }
        init = true;
      }

      if (typeof this.launcher !== 'undefined' && this.launcher !== null) {
        testemEvents.recordStartedLauncherId(this.launcher.id);
      }
    };

    events['after-tests-complete'] = browserExitHandler;

    events['disconnect'] = function() {
      // To prevent handling exiting browser browser disconnects from errors `disconnect` callback's needed to be registered.
      browserTerminationHandler.bind(this)();
    }

    events['testem:test-done-metadata'] = (details) => {
      // Ensure module detail is available
      if (typeof details === 'object' && details !== null) {
       //store module name, test name, # of failed assertion, and duration.
        this.testemEvents.recordModuleMetadata(
          {
            moduleName: details.module,
            testName: details.name,
            passed: details.passed == details.total,
            failed: (details.failed > 0),
            skipped: details.skipped,
            duration: details.runtime
          }
        )
      }
    }

    return events;
  },

  /**
   * Return an event object which enables load balancing.
   * These event handlers will be registered on Testem's browserTestRunner socket instance
   *
   * @param {Object} commands
   * @param {Object} testemEvents
   */
  _getLoadBalancingBrowserSocketEvents({ isLoadBalance, isReplayExecution, isWriteExecutionFile } , testemEvents) {
    const events = {};
    const ui = this.ui;

    events['testem:set-modules-queue'] = function(modules, browserId) {
      testemEvents.setModuleQueue(
        browserId,
        modules,
        isLoadBalance,
        isReplayExecution
      );
    };
    events['testem:next-module-request'] = function(browserId) {
      testemEvents.nextModuleResponse(
        browserId,
        this.socket,
        isWriteExecutionFile
      );
    };
    events['test-result'] = function(result) {
      if (result.failed && isWriteExecutionFile) {
          testemEvents.recordFailedBrowserId(this.launcher, ui);
      }
    };

    return events;
  }
});
