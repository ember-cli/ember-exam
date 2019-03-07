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
    const browserModuleMap = new Map();
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
   * @param {string} noExecutionFile
   */
  setModuleQueue(browserId, modules, loadBalance, replayExecution) {
    const replayExecutionMap = this.stateManager.getReplayExecutionMap();

    if (replayExecution) {
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
   * @param {string} noExecutionFile
   */
  nextModuleResponse(browserId, socket, loadBalance, noExecutionFile) {
    const moduleQueue = this.stateManager.getSharedModuleQueue() || this.stateManager.getBrowserModuleQueue(browserId);
    if (!moduleQueue) {
      throw new Error('No moduleQueue was set.');
    }

    const moduleName = moduleQueue.shift();
    socket.emit('testem:next-module-response', { done: !moduleQueue.length && !moduleName, value: moduleName });

    if (moduleName) {
      // Keep track of the modules executed per browserId when running test suite with load-balance.
      // In replay-execution mode, we are already running a predefined set of modules, so no need
      // to save this again
      if (!noExecutionFile && loadBalance) {
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
   * @param {Object} ui
   * @param {boolean} loadBalance
   * @param {string} fileName
   * @param {string} noExecutionFile
   */
  completedBrowsersHandler(browserCount, ui, loadBalance, fileName, noExecutionFile) {
    let browsersCompleted = false;

    this.stateManager.incrementCompletedBrowsers();
    if (this.stateManager.completedBrowsers() === browserCount) {
      if (!noExecutionFile && loadBalance) {
        const moduleMapJson = {
          numberOfBrowsers: browserCount,
          failedBrowsers: this.stateManager.getFailedBrowsers(),
          executionMapping: (() => {
            let executionMapping  = Object.create(null);
            for (const [browserId, moduleList] of this.stateManager.getModuleMap()) {
              executionMapping[browserId] = moduleList;
            }

            return executionMapping;
          })()
        };

        const testExecutionPath = path.join(this.root, fileName);
        try {
          fs.writeJsonSync(testExecutionPath, moduleMapJson);
          ui.writeLine(`\nThis execution was recorded at ${fileName}`);
        } catch (err) {
          err.file = err.file || testExecutionPath;
          throw err;
        }
      }

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
