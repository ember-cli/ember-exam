'use strict';

const fs = require('fs-extra');
const path = require('path');
const ExecutionStateManager = require('./execution-state-manager');
const { getBrowserId } = require('../utils/test-page-helper');
const writeJsonToFile = require('./file-system-helper');

/**
 * Return sorted module metadata object by module duration.
 *
 * @param {Map} moduleMetadata
 */
function getSortedModuleMetaData(moduleMetadata) {
  return new Map(
    [...moduleMetadata.entries()].sort((a, b) => b[1].duration - a[1].duration),
  );
}

/**
 * A class to coordinate testem events to enable load-balance functionality.
 *
 * @class TestemEvents
 */
class TestemEvents {
  constructor(root) {
    this.stateManager = new ExecutionStateManager();
    this.root = root;
  }

  /**
   * Read the executionFilePath then:
   * if failed browsers are available, set the module map to the modules from the failed browsers.
   * else if replay-browser param is passed, set the module map specified browser id
   * else set module map to all the browser ran, effectively rerunning the same execution
   *
   * @param {string} executionFilePath
   * @param {Array<number>} browserIdsToReplay
   * @return {Object}
   */
  setReplayExecutionMap(executionFilePath, browserIdsToReplay) {
    const browserModuleMap = new Map();
    let executionJson;

    try {
      executionJson = fs.readJsonSync(executionFilePath);
    } catch (err) {
      throw new Error(`Error reading reply execution JSON file - ${err}`);
    }

    if (browserIdsToReplay && browserIdsToReplay.length > 0) {
      browserIdsToReplay.forEach((browserId) => {
        browserModuleMap.set(
          browserId.toString(),
          executionJson.executionMapping[browserId.toString()],
        );
      });
    } else if (executionJson.failedBrowsers.length > 0) {
      executionJson.failedBrowsers.forEach((browserId) => {
        browserModuleMap.set(
          browserId,
          executionJson.executionMapping[browserId],
        );
      });
    } else {
      for (
        let browserId = 1;
        browserId <= executionJson.numberOfBrowsers;
        browserId++
      ) {
        browserModuleMap.set(
          browserId.toString(),
          executionJson.executionMapping[browserId.toString()],
        );
      }
    }

    this.stateManager.setReplayExecutionMap(browserModuleMap);
  }

  /**
   * Set the moduleQueue, a list of test modules to be passed to browsers to execute.
   *
   * @param {number} browserId
   * @param {Array<string>} modules
   * @param {boolean} loadBalance
   * @param {boolean} replayExecution
   * @param {string} writeExecutionFile
   */
  setModuleQueue(browserId, modules, loadBalance, replayExecution) {
    const replayExecutionMap = this.stateManager.getReplayExecutionMap();

    if (replayExecution) {
      if (!replayExecutionMap) {
        throw new Error('No replay execution map was set on the stateManager.');
      } else if (!this.stateManager.getReplayExecutionModuleQueue(browserId)) {
        // Only set the moduleQueue once, ignore repeated requests
        this.stateManager.setReplayExecutionModuleQueue(
          replayExecutionMap.get(browserId),
          browserId,
        );
      }
    } else if (loadBalance && !this.stateManager.getTestModuleQueue()) {
      // Only set the moduleQueue once, ignore repeated requests
      this.stateManager.setTestModuleQueue(modules);
    }
  }

  /**
   * Gets the next test module from the moduleQueue and emit back to the browser.
   * If moduleQueue is already empty, emit the module-queue-complete event,
   * signaling no more test module to run.
   *
   * @param {number} browserId
   * @param {Object} socket
   * @param {boolean} loadBalance
   * @param {boolean} writeExecutionFile
   */
  nextModuleResponse(browserId, socket, writeExecutionFile) {
    const moduleQueue =
      this.stateManager.getTestModuleQueue() ||
      this.stateManager.getReplayExecutionModuleQueue(browserId);
    if (!moduleQueue) {
      throw new Error('No moduleQueue was set.');
    }

    const moduleName = moduleQueue.shift();
    socket.emit('testem:next-module-response', {
      done: !moduleQueue.length && !moduleName,
      value: moduleName,
    });

    // Keep track of the modules executed per browserId when running test suite with load-balance.
    // In replay-execution mode, we are already running a predefined set of modules, so no need
    // to save this again
    if (moduleName && writeExecutionFile) {
      this.stateManager.addModuleNameToReplayExecutionMap(
        moduleName,
        browserId,
      );
    }
  }

  /**
   * Record the launched browser id
   *
   * @param {number} browserId
   */
  recordStartedLauncherId(browserId) {
    this.stateManager.addToStartedLaunchers(browserId);
  }

  /**
   * Record the module run details to the stateManager
   *
   * @param {Object} metaData
   */
  recordModuleMetadata(metaData) {
    this.stateManager.addToModuleMetadata(metaData);
  }

  /**
   * Gets browser id of launcher and stores the browser id stateManager
   *
   * @param {Object} launcher
   * @param {Object} ui
   */
  recordFailedBrowserId(launcher, ui) {
    let browserId;
    try {
      browserId = getBrowserId(launcher);
    } catch (err) {
      ui.writeLine(err.message);
    }
    if (
      (browserId !== null || typeof browserId !== 'undefined') &&
      !this.stateManager.containsFailedBrowser(browserId)
    ) {
      this.stateManager.addFailedBrowsers(browserId);
    }
  }

  /**
   * Generates an object for test execution
   *
   * @param {number} browserCount
   */
  _generatesModuleMapJsonObject(browserCount) {
    return {
      numberOfBrowsers: browserCount,
      failedBrowsers: this.stateManager.getFailedBrowsers(),
      executionMapping: (() => {
        let executionMapping = Object.create(null);
        for (const [
          browserId,
          moduleList,
        ] of this.stateManager.getModuleMap()) {
          executionMapping[browserId] = moduleList;
        }

        return executionMapping;
      })(),
    };
  }

  /**
   * Keep track of the number of browsers that completed executing its tests.
   * When all browsers complete, write test-execution.json to disk and clean up the stateManager
   *
   * @param {number} browserCount
   * @param {number} launcherId
   * @param {Object} ui
   * @param {Object} commands
   * @param {Object} currentDate
   */
  completedBrowsersHandler(
    browserCount,
    launcherId,
    ui,
    commands,
    currentDate,
  ) {
    const browsersStarted = this.stateManager.getStartedLaunchers();
    let browsersCompleted = false;

    this.stateManager.incrementCompletedBrowsers(launcherId);
    const completedBrowser = this.stateManager.getCompletedBrowser();
    if (completedBrowser === browsersStarted.size) {
      if (commands.get('writeModuleMetadataFile')) {
        const moduleDetailFileName = path.join(
          this.root,
          `module-metadata-${currentDate}.json`,
        );
        const sortedModuleMetadata = getSortedModuleMetaData(
          this.stateManager.getModuleMetadata(),
        );

        writeJsonToFile(
          moduleDetailFileName,
          {
            requested: `${browserCount} browser(s)`,
            launched: `${browsersStarted.size} browser(s)`,
            modules: Array.from(sortedModuleMetadata.values()),
          },
          { spaces: 2 },
        );
        ui.writeLine(
          `\nExecution module details were recorded at ${moduleDetailFileName}`,
        );
      }

      if (commands.get('writeExecutionFile') && commands.get('loadBalance')) {
        const moduleMapJson = this._generatesModuleMapJsonObject(browserCount);
        const testExecutionPath = path.join(
          this.root,
          `test-execution-${currentDate}.json`,
        );

        writeJsonToFile(testExecutionPath, moduleMapJson, { spaces: 2 });
        ui.writeLine(`\nExecution was recorded at ${testExecutionPath}`);
      }

      ui.writeLine(
        `Out of requested ${browserCount} browser(s), ${browsersStarted.size} browser(s) was launched & completed.`,
      );

      if (browserCount !== browsersStarted.size) {
        ui.writeLine('Waiting for remaining browsers to exited.');
      }
    }

    if (completedBrowser === browserCount) {
      ui.writeLine('All browsers to exited.');
      // --server mode allows rerun of tests by refreshing the browser
      // replayExecutionMap should be reused so the test-execution json
      // does not need to be reread
      const replayExecutionMap = this.stateManager.getReplayExecutionMap();
      this.stateManager = new ExecutionStateManager(replayExecutionMap);
      browsersCompleted = true;
    }
    return browsersCompleted;
  }
}

module.exports = TestemEvents;
