'use strict';

/**
 * A class to store the state of an execution.
 *
 * @class ExecutionStateManager
 */
class ExecutionStateManager {
  constructor(replayExecutionMap) {
    // A map of browerId to test modules executed on that browser read from test-execution.json.
    this._replayExecutionMap = replayExecutionMap || null;

    // A map of browerId to test modules executed for the current test execution.
    this._browserToModuleMap = new Map();

    // An array keeping the browserId of a browser with failing test
    this._failedBrowsers = [];
    this._completedBrowsers = 0;

    // An array of modules to be load balanced to a number of browsers
    this._sharedModuleQueue = null;

    // A map of browserId to an array of modules to be passed to the browser
    this._browserModuleQueue = null;
  }

  /**
   * Returns the replayExecutionMap
   *
   * @returns {Object}
   */
  getReplayExecutionMap() {
    return this._replayExecutionMap;
  }

  /**
   * Sets the replayExecutionMap
   *
   * @param {Object} replayModuleMap
   */
  setReplayExecutionMap(replayModuleMap) {
    this._replayExecutionMap = replayModuleMap;
  }

  /**
   * Returns the SharedModuleQueue
   *
   * @returns {Object}
   */
  getSharedModuleQueue() {
    return this._sharedModuleQueue;
  }

  /**
   * Sets the shared module queue.
   *
   * @param {Object} moduleQueue
   */
  setSharedModuleQueue(moduleQueue) {
    this._sharedModuleQueue = moduleQueue;
  }

  /**
   * Gets the next module from the shared module queue
   *
   * @returns {string}
   */
  getNextModuleSharedModuleQueue() {
    if (this._sharedModuleQueue) {
      return this._sharedModuleQueue.shift();
    }
    return null;
  }

  /**
   * Returns the array of modules belonging to browserId
   *
   * @param {number} browserId
   * @returns {Object}
   */
  getBrowserModuleQueue(browserId) {
    if (this._browserModuleQueue) {
      return this._browserModuleQueue[browserId];
    }
    return null;
  }

  /**
   * Sets the array of modules in browser module queue for browserId
   *
   * @param {Array<string>} moduleQueue
   * @param {number} browserId
   */
  setBrowserModuleQueue(moduleQueue, browserId) {
    if (!this._browserModuleQueue) {
      this._browserModuleQueue = new Map();
    }
    this._browserModuleQueue[browserId] = moduleQueue.slice();
  }

  /**
   * Gets the next module from the module array of browserId
   *
   * @param {number} browserId
   * @returns {string}
   */
  getNextModuleBrowserModuleQueue(browserId) {
    if (this._browserModuleQueue && this._browserModuleQueue[browserId]) {
      return this._browserModuleQueue[browserId].shift();
    }
    return null;
  }

  /**
   * Returns the SharedModuleQueue
   *
   * @returns {Array<number>}
   */
  getFailedBrowsers() {
    return this._failedBrowsers;
  }

  /**
   * Returns the whether or not the browserId is contained in the failBrowsers array.
   *
   * @param {number} browserId
   * @returns {Boolean}
   */
  containsFailedBrowser(browserId) {
    return this._failedBrowsers.includes(browserId);
  }

  /**
   * Add a new browserId to the failedBrowser array.
   *
   * @param {number} browserId
   * @returns {Boolean}
   */
  addFailedBrowsers(browserId) {
    return this._failedBrowsers.push(browserId);
  }

  /**
   * Returns the a map of browserId to modules array
   *
   * @returns {Object}
   */
  getModuleMap() {
    return this._browserToModuleMap;
  }

  /**
   * Pushes the moduleName into the moduleArray of browserId
   *
   * @param {string} moduleName
   * @param {number} browserId
   */
  addToModuleMap(moduleName, browserId) {
    let browserModuleList = this._browserToModuleMap.get(browserId);
    if (Array.isArray(browserModuleList)) {
      browserModuleList.push(moduleName);
    } else {
      browserModuleList = [moduleName];
    }
    this._browserToModuleMap.set(browserId, browserModuleList);
  }

  /**
   * Returns the number of completed browsers
   *
   * @returns {number}
   */
  completedBrowsers() {
    return this._completedBrowsers;
  }

  /**
   * Increment the number of completed browsers
   */
  incrementCompletedBrowsers() {
    this._completedBrowsers = this._completedBrowsers + 1;
  }
}

module.exports = ExecutionStateManager;