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
    const browserModuleMap = Object.create(null);
    let executionJson;

    try {
      executionJson = fs.readJsonSync(executionFilePath);
    } catch (err) {
      throw new Error(`Error reading reply execution JSON file - ${err}`);
    }

    if (browserIdsToReplay && browserIdsToReplay.length > 0) {
      browserIdsToReplay.forEach(browserId => {
        browserModuleMap[browserId] = executionJson.executionMapping[browserId];
      });
    } else if (executionJson.failedBrowsers.length > 0) {
      executionJson.failedBrowsers.forEach(browserId => {
        browserModuleMap[browserId] = executionJson.executionMapping[browserId];
      });
    } else {
      for (let browserId = 1; browserId <= executionJson.numberOfBrowsers; browserId++) {
        browserModuleMap[browserId] = executionJson.executionMapping[browserId];
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
   * @param {string} appMode
   */
  setModuleQueue(browserId, modules, loadBalance, replayExecution, appMode) {
    const replayExecutionMap = this.stateManager.getReplayExecutionMap();

    if (appMode === 'ci' && replayExecution) {
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
   * @param {number} browserId
   * @param {Object} socket
   * @param {boolean} loadBalance
   * @param {string} appMode
   */
  nextModuleResponse(browserId, socket, loadBalance, appMode) {
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
      if (appMode === 'ci' && loadBalance) {
        this.stateManager.addToModuleMap(moduleName, browserId);
      }
    }
  }

  /**
   * Record the failed browserId to the stateManager
   *
   * @param {number} browserId
   */
  recoredFailedBrowserId(browserId) {
    if (browserId && !this.stateManager.containsFailedBrowser(browserId)) {
      this.stateManager.addFailedBrowsers(browserId);
    }
  }

  /**
   * Keep track of the number of browsers that completed executing its tests.
   * When all browsers complete, write test-execution.json to disk and clean up the stateManager
   *
   * @param {number} browserCount
   * @param {boolean} loadBalance
   * @param {string} fileName
   * @param {string} appMode
   */
  completedBrowsersHandler(browserCount, loadBalance, fileName, appMode) {
    this.stateManager.incrementCompletedBrowsers();

    if (this.stateManager.completedBrowsers() == browserCount) {
      if (appMode === 'ci' && loadBalance) {
        const moduleMapJson = {
          numberOfBrowsers: browserCount,
          failedBrowsers: this.stateManager.getFailedBrowsers(),
          executionMapping: this.stateManager.getModuleMap()
        };

        const testExecutionPath = path.join(this.root, fileName);
        try {
          fs.writeJsonSync(testExecutionPath, moduleMapJson);
          return true;
        } catch (err) {
          err.file = err.file || testExecutionPath;
          throw err;
        }
      }

      // Cleanup states from stateManager for --server mode, since a rerun of tests is triggered by
      // a browser refresh
      this.stateManager.cleanUpStates();
    }
    return false;
  }
}

module.exports = TestemEvents;