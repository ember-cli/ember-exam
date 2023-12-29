'use strict';

const fs = require('fs-extra');
const readTestemConfig = require('../utils/config-reader');
const { addToUrl } = require('./query-helper');

/**
 * Add paramater such as split, loadbalance or partition to a base url if options are valid.
 *
 * @param {Object} commandOptions
 * @param {string} baseUrl
 * @return {string} baseUrl
 */
function _appendParamToBaseUrl(commandOptions, baseUrl) {
  if (commandOptions.parallel || commandOptions.split) {
    baseUrl = addToUrl(baseUrl, 'split', commandOptions.split);
  }
  // `loadBalance` is added to url when running replay-execution in order to emit `set-module-queue` in patch-test-loader.
  if (commandOptions.loadBalance || commandOptions.replayExecution) {
    const partitions = commandOptions.partition;
    baseUrl = addToUrl(baseUrl, 'loadBalance', true);
    if (partitions) {
      for (let i = 0; i < partitions.length; i++) {
        baseUrl = addToUrl(baseUrl, 'partition', partitions[i]);
      }
    }
  }

  return baseUrl;
}

/**
 * Generates an array by parsing optionValue. optionValue can be in a string form of '1,2', '3..5'
 * or '1,3..5' where '3..5' indicates a number sequence starting from 2 to 5.
 *
 * @param {string} optionValue
 * @return {Array<number>}
 */
function _formatStringOptionValue(optionValue) {
  let valueArray = [];

  optionValue.split(',').forEach(function (val) {
    if (val.indexOf('..') > 0) {
      const arr = val.split('..');
      const filledArray = _getFilledArray(arr.shift(), arr.pop());
      valueArray = valueArray.concat(filledArray);
    } else {
      valueArray.push(val);
    }
  });

  return valueArray;
}

/**
 * Generates multiple test pages: for a given baseUrl, it appends the partition numbers
 * or the browserId each page is running as query params.
 *
 * @param {string} customBaseUrl
 * @param {string} appendingParam
 * @param {Array<number} browserIds
 * @return {Array<string>} testPages
 */
function _generateTestPages(customBaseUrl, appendingParam, browserIds) {
  const testPages = [];
  for (let i = 0; i < browserIds.length; i++) {
    const url = addToUrl(customBaseUrl, appendingParam, browserIds[i]);
    testPages.push(url);
  }

  return testPages;
}

/**
 * Creates an array of numbers between the range of start to end.
 *
 * @param {number} start
 * @param {number} end
 * @return {Array}
 */
function _getFilledArray(start, end) {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => i + Number(start));
}

/**
 * returns the failed browsers from the test execution json defined in executionJsonPath
 * other wise return an array of 1 to number of browsers spawned during the execution
 *
 * @param {string} executionJsonPath
 * @return {Array<number>} testPages
 */
function _getReplayBrowsers(executionJsonPath) {
  const executionJson = fs.readJsonSync(executionJsonPath);

  if (executionJson.failedBrowsers.length > 0) {
    return executionJson.failedBrowsers;
  }
  return _getFilledArray(1, executionJson.numberOfBrowsers);
}

/**
 * Returns an array populated with numeric values represented by the optionValue.
 * e.g. [1, '2,3'] => [1, 2, 3], [1, '3..6'] => [1, 3, 4, 5, 6]
 *
 * @param {*} optionValue
 * @return {Array<number}
 */
function combineOptionValueIntoArray(optionValue) {
  if (!optionValue) return [];

  let optionArray = Array.isArray(optionValue) ? optionValue : [optionValue];

  return optionArray.reduce((result, element) => {
    if (typeof element === 'string') {
      return result.concat(_formatStringOptionValue(element));
    }
    return result.concat(element);
  }, []);
}

/**
 * Returns the browserId of launcher
 *
 * @param {Object} launcher
 * @return {string}
 */
function getBrowserId(launcher) {
  try {
    const testPage = launcher.settings.test_page;
    const browserIdMatch = /browser=\s*([0-9]*)/.exec(testPage);

    if (Array.isArray(browserIdMatch) !== null && browserIdMatch !== null) {
      return browserIdMatch[1];
    }
  } catch (err) {
    const errMsg = `${err.message} \n${
      err.stack
    } \nLauncher Settings: ${JSON.stringify(launcher.settings, null, 2)}`;
    console.warn(errMsg);
  }
  return 0;
}

/**
 * Gets a test url in testem config to modify the url in order to generate multiple test pages
 *
 * @param {Object} configFile
 * @return {string} testPage
 */
function getTestUrlFromTestemConfig(configFile) {
  // Attempt to read in the testem config and use the test_page definition
  const testemConfig = readTestemConfig(configFile);
  let testPage = testemConfig && testemConfig.test_page;

  // If there is no test_page to use as the testPage, we warn that we're using
  // a default value
  if (!testPage) {
    // eslint-disable-next-line no-console
    console.warn(
      'No test_page value found in the config. Defaulting to "tests/index.html?hidepassed"',
    );
    testPage = 'tests/index.html?hidepassed';
  }

  // Get the testPage from the generated config or the Testem config and
  // use it as the baseUrl to customize for the parallelized test pages or test load balancing
  return testPage;
}

/**
 * Creates an array of custom base urls by appending options that are specified
 *
 * @param {Object} commandOptions
 * @param {*} baseUrl
 * @return {string}
 */
function getCustomBaseUrl(commandOptions, baseUrl) {
  if (Array.isArray(baseUrl)) {
    return baseUrl.map((currentUrl) => {
      return _appendParamToBaseUrl(commandOptions, currentUrl);
    });
  } else {
    return _appendParamToBaseUrl(commandOptions, baseUrl);
  }
}

/**
 * Ember-exam allows serving multiple browsers to run test suite. In order to acheive that test_page in testem config
 * has to be set with an array of multiple urls reflecting to command passed.
 *
 * @param {Object} config
 * @param {Object} commandOptions
 * @return {Array<string>} testPages
 */
function getMultipleTestPages(config, commandOptions) {
  let testPages = Object.create(null);
  let browserIds = combineOptionValueIntoArray(commandOptions.partition);
  let appendingParam = 'partition';

  if (commandOptions.loadBalance) {
    appendingParam = 'browser';
    browserIds = _getFilledArray(1, commandOptions.parallel);
  } else if (commandOptions.parallel === 1 && browserIds.length === 0) {
    browserIds = _getFilledArray(1, commandOptions.split);
  } else if (commandOptions.replayExecution) {
    appendingParam = 'browser';
    browserIds = combineOptionValueIntoArray(commandOptions.replayBrowser);
    if (browserIds.length === 0) {
      browserIds = _getReplayBrowsers(commandOptions.replayExecution);
    }
  }

  const baseUrl =
    config.testPage || getTestUrlFromTestemConfig(config.configFile);
  const customBaseUrl = getCustomBaseUrl(commandOptions, baseUrl);

  if (Array.isArray(customBaseUrl)) {
    testPages = customBaseUrl.reduce(function (testPages, customBaseUrl) {
      return testPages.concat(
        _generateTestPages(customBaseUrl, appendingParam, browserIds),
      );
    }, []);
  } else {
    testPages = _generateTestPages(customBaseUrl, appendingParam, browserIds);
  }

  return testPages;
}

module.exports = {
  combineOptionValueIntoArray,
  getBrowserId,
  getCustomBaseUrl,
  getMultipleTestPages,
  getTestUrlFromTestemConfig,
};
