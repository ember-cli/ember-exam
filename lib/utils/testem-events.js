'use strict';

const fs = require('fs-extra');
const path = require('path');
const ExecutionStateManager = require('./execution-state-manager');

/**
 * A class to coordinate testem events to enable load-balance functionality.
 *
 * @class TestemEvents
 */
class TestemEvents {
  constructor(root, appMode) {
    this.stateManager = new ExecutionStateManager();
    this.appMode = appMode;
    this.root = root;
  }

  setAppMode(appMode) {
    this.appMode = appMode;
  }

  /**
   * It reads the executionFilePath pointing to a test-execution json file and stores a
   * map of browserId to modules of only the browserIds passed for replay.
   *
   * @param {String} executionFilePath
   * @param {Array<Nummber>} browserIdsToReplay
   * @return {Object}
   */
  setReplayExecutionMap(executionFilePath, browserIdsToReplay) {
    const browserModuleMap = Object.create(null);
    let executionJson;

    try {
      executionJson = fs.readJsonSync(executionFilePath);
    } catch (err) {
      throw new Error(`Error reading reply execution JSON file - ${err}`);
    }

    browserIdsToReplay.forEach(browserId => {
      browserModuleMap[browserId] = executionJson.executionMapping[browserId];
    });

    this.stateManager.setReplayExecutionMap(browserModuleMap);
  }

  /**
   * Set the moduleQueue, a list of test modules to be passed to browsers to execute.
   *
   * @param {Number} browserId
   * @param {Array<String>} modules
   * @param {Boolean} loadBalance
   * @param {Boolean} replayExecution
   */
  setModuleQueue(browserId, modules, loadBalance, replayExecution) {
    const replayExecutionMap = this.stateManager.getReplayExecutionMap();

    if (this.appMode === 'ci' && replayExecution) {
      if (!replayExecutionMap) {
        throw new Error('No replay execution map was set on the stateManager.');
      } else if (!this.stateManager.getBrowserModuleQueue(browserId)) {
        // Only set the moduleQueue once, ignore repeated requests
        this.stateManager.setBrowserModuleQueue(
          replayExecutionMap[browserId],
          browserId
        );
      }
    } else if (loadBalance && !this.stateManager.getSharedModuleQueue()) {
      // Only set the moduleQueue once, ignore repeated requests
      this.stateManager.setSharedModuleQueue(modules);
    }
  }

  /**
   * Gets the next test module from the moduleQueue and emit back to the browser.
   * If moduleQueue is already empty, emit the module-queue-complete event,
   * signaling no more test module to run.
   *
   * @param {Number} browserId
   * @param {Object} socket
   * @param {Boolean} loadBalance
   */
  nextModuleResponse(browserId, socket, loadBalance) {
    let moduleName;
    if (this.stateManager.getSharedModuleQueue()) {
      moduleName = this.stateManager.getNextModuleSharedModuleQueue();
    } else if (this.stateManager.getBrowserModuleQueue(browserId)) {
      moduleName = this.stateManager.getNextModuleBrowserModuleQueue(browserId);
    } else {
      throw new Error('No moduleQueue was set.');
    }

    if (!moduleName) {
      socket.emit('testem:module-queue-complete');
    } else {
      socket.emit('testem:next-module-response', moduleName);

      // Keep track of the modules executed per browserId when appMode = ci and load-balance = true
      // In replay-execution mode, we are already running a predefined set of modules, so no need
      // to save this again
      if (this.appMode === 'ci' && loadBalance) {
        this.stateManager.addToModuleMap(moduleName, browserId);
      }
    }
  }

  /**
   * Record the failed browserId to the stateManager
   *
   * @param {Number} browserId
   * @param {Object} result
   */
  recoredFailedBrowserId(browserId, result) {
    if (result.failed) {
      if (browserId && !this.stateManager.containsFailedBrowser(browserId)) {
        this.stateManager.addFailedBrowsers(browserId);
      }
    }
  }

  /**
   * Keep track of the number of browsers that completed executing its tests.
   * When all browsers complete, write test-execution.json to disk and clean up the stateManager
   *
   * @param {Number} browserCount
   * @param {Boolean} loadBalance
   */
  completedBrowsersHandler(browserCount, loadBalance, fileName) {
    this.stateManager.incrementCompletedBrowsers();

    if (this.stateManager.completedBrowsers() == browserCount) {
      if (this.appMode === 'ci' && loadBalance) {
        const moduleMapJson = {
          numberOfBrowsers: browserCount,
          failedBrowsers: this.stateManager.getFailedBrowsers(),
          executionMapping: this.stateManager.getModuleMap()
        };

        const testExecutionPath = path.join(this.root, fileName);
        try {
          fs.writeJsonSync(testExecutionPath, moduleMapJson);
        } catch (err) {
          throw new Error(`Error writing ${testExecutionPath} - ${err}`);
        }
      }

      // Cleanup states from stateManager for --server mode, since a rerun of tests is triggered by
      // a browser refresh
      this.stateManager.cleanUpStates();
    }
  }
}

module.exports = TestemEvents;