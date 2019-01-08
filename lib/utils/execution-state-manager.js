'use strict';

/**
 * A class to store the state of an execution.
 *
 * @class ExecutionStateManager
 */
class ExecutionStateManager {
  constructor() {
    this.initializeStates();
  }

  initializeStates() {
    // A map of browerId to test modules executed on that browser read from test-execution.json.
    this._replayExecutionMap = null;

    // A map of browerId to test modules executed for the current test execution.
    this._browserToModuleMap = Object.create(null);

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
   * @returns {String}
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
   * @param {Number} browserId
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
   * @param {Array<String>} moduleQueue
   * @param {Number} browserId
   */
  setBrowserModuleQueue(moduleQueue, browserId) {
    if (!this._browserModuleQueue) {
      this._browserModuleQueue = Object.create(null);
    }
    this._browserModuleQueue[browserId] = moduleQueue;
  }

  /**
   * Gets the next module from the module array of browserId
   *
   * @param {Number} browserId
   * @returns {String}
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
   * @returns {Array<Number>}
   */
  getFailedBrowsers() {
    return this._failedBrowsers;
  }

  /**
   * Returns the whether or not the browserId is contained in the failBrowsers array.
   *
   * @param {Number} browserId
   * @returns {Boolean}
   */
  containsFailedBrowser(browserId) {
    return this._failedBrowsers.includes(browserId);
  }

  /**
   * Add a new browserId to the failedBrowser array.
   *
   * @param {Number} browserId
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
   * @param {String} moduleName
   * @param {Number} browserId
   */
  addToModuleMap(moduleName, browserId) {
    if (!this._browserToModuleMap[browserId]) {
      this._browserToModuleMap[browserId] = [];
    }
    this._browserToModuleMap[browserId].push(moduleName);
  }

  /**
   * Returns the number of completed browsers
   *
   * @returns {Number}
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

  cleanUpStates() {
    this.initializeStates();
  }
}

module.exports = ExecutionStateManager;