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

    // An array keeping the module execution details
    this._moduleMetadata = [];

    // An array keeping the browserId of a browser with failing test
    this._failedBrowsers = [];
    this._completedBrowsers = new Map();

    // An array of modules to load balance against browsers. This is used by `--load-balance`
    this._testModuleQueue = null;

    // A map of browserId to an array of test modules. This is used by `--replay-execution`
    this._replayExecutionModuleQueue = null;
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
   * Returns the testModuleQueue
   *
   * @returns {Object}
   */
  getTestModuleQueue() {
    return this._testModuleQueue;
  }

  /**
   * Sets the shared module queue.
   *
   * @param {Object} moduleQueue
   */
  setTestModuleQueue(moduleQueue) {
    this._testModuleQueue = moduleQueue;
  }

  /**
   * Gets the next module from the shared module queue
   *
   * @returns {string}
   */
  getNextModuleTestModuleQueue() {
    if (this._testModuleQueue) {
      return this._testModuleQueue.shift();
    }
    return null;
  }

  /**
   * Returns the array of modules belonging to browserId
   *
   * @param {number} browserId
   * @returns {Array<number>}
   */
  getReplayExecutionModuleQueue(browserId) {
    if (this._replayExecutionModuleQueue) {
      return this._replayExecutionModuleQueue.get(browserId);
    }
    return null;
  }

  /**
   * Sets the array of modules in browser module queue for browserId
   *
   * @param {Array<string>} moduleQueue
   * @param {number} browserId
   */
  setReplayExecutionModuleQueue(moduleQueue, browserId) {
    if (!this._replayExecutionModuleQueue) {
      this._replayExecutionModuleQueue = new Map();
    }
    this._replayExecutionModuleQueue.set(browserId, moduleQueue.slice());
  }

  /**
   * Gets the next module from the module array of browserId
   *
   * @param {number} browserId
   * @returns {string}
   */
  getNextModuleReplayExecutionModuleQueue(browserId) {
    if (this._replayExecutionModuleQueue && this._replayExecutionModuleQueue.get(browserId)) {
      return this._replayExecutionModuleQueue.get(browserId).shift();
    }
    return null;
  }

  /**
   * Returns the TestModuleQueue
   *
   * @returns {Set<number>}
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
   * Returns an array of modules run details
   *
   * @returns {Array}
   */
  getModuleMetadata() {
    return this._moduleMetadata;
  }

  /**
   * Pushes the moduleName into the moduleArray of browserId
   *
   * @param {string} moduleName
   * @param {number} browserId
   */
  addModuleNameToReplayExecutionMap(moduleName, browserId) {
    let browserModuleList = this._browserToModuleMap.get(browserId);
    if (Array.isArray(browserModuleList)) {
      browserModuleList.push(moduleName);
    } else {
      browserModuleList = [moduleName];
    }
    this._browserToModuleMap.set(browserId, browserModuleList);
  }

  /**
   * Pushes the module detail into the moduleMetadata array
   *
   * @param {*} metaData
   */
  addToModuleMetadata(metaData) {
    return this._moduleMetadata.push(metaData);
  }

  /**
   * Returns the number of completed browsers
   *
   * @returns {number}
   */
  getCompletedBrowser() {
    return this._completedBrowsers.size;
  }

  /**
   * Book keep the browser id that has completed
   *
   * @param {number} browserId
   */
  incrementCompletedBrowsers(browserId) {
    this._completedBrowsers.set(browserId, true);
  }
}

module.exports = ExecutionStateManager;
