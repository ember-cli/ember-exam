
const { readTestemConfig } = require('../utils/config-reader');
const { addToUrl } = require('./query-helper');

/**
 * Generates multiple test pages: for a given baseUrl, it appends the partition numbers
 * or the browserId each page is running as query params.
 *
 * @param {String} customBaseUrl
 * @param {String} appendingParam
 * @param {Array<Number} browserIds
 * @return {Array<String>} testPages
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
 * Creates an array starting from start to end.
 * e.g. if browserCount is 3, the returned array is [1, 2, 3]
 *..
 * @param {Number} len
 * @return {Array}
 */
function _getFilledArray(start, end) {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) =>   i + Number(start));
}

/**
 * Add paramater such as split, loadbalance or partition to a base url if options are valid.
 *
 * @param {*} baseUrl
 */
function _appendParamToBaseUrl(commandOptions, baseUrl) {
  if (commandOptions.parallel || commandOptions.split) {
    baseUrl = addToUrl(baseUrl, 'split', commandOptions.split);
  }
  // `loadBalance` is added to url when running replay-execution in order to emit `set-module-queue` in patch-test-loader.
  if (commandOptions.loadBalance || commandOptions.replayExecution) {
    const partitions = commandOptions.partition;
    baseUrl = addToUrl(baseUrl, 'loadBalance', true)
    if (partitions) {
      for (let i = 0; i < partitions.length; i++) {
        baseUrl = addToUrl(baseUrl, 'partition', partitions[i]);
      }
    }
  }

  return baseUrl;
}

/**
 * Generates an array by parsing a given string optionValue as an optionValue can be in a string form of '1,2'
 * or '2..5', where an input '2..5' indicates a number sequence starting from 2 to 5.
 *
 * @param {*} optionValue
 */
function _formatStringOptionValue(optionValue) {
  if (optionValue.indexOf('..') > 0) {
    const arr = optionValue.split('..')
    return _getFilledArray(arr.shift(), arr.pop());
  } else {
    return optionValue.split(',');
  }
}

/**
 * Returns an array converted from a string.
 * e.g. '1, 2, 3' => [1, 2, 3] and '1, 2, [3, 4]' => [1, 2, 3, 4]
 *
 * @param {*} optionValue
 */
function convertOptionValueToArray(optionValue) {
  if (typeof optionValue === 'undefined' || typeof optionValue === 'number') {
    return optionValue;
  }

  let optionArray = [];
  if (typeof optionValue === 'string') {
    optionArray = _formatStringOptionValue(optionValue);
  }
  if (Array.isArray(optionValue)) {
    optionValue.forEach((element) => {
      if (typeof element === 'string') {
        Array.prototype.push.apply(optionArray, _formatStringOptionValue(element));
      } else {
        optionArray.push(element);
      }
    });
  }

  return optionArray;
}

/**
 * Gets a test url in testem config to modify the url in order to generate multiple test pages
 *
 * @param {*} configFile
 */
function getTestUrlFromTestemConfig(configFile) {
  // Attempt to read in the testem config and use the test_page definition
  const testemConfig = readTestemConfig(configFile);
  let testPage = testemConfig && testemConfig.test_page;

  // If there is no test_page to use as the testPage, we warn that we're using
  // a default value
  if (!testPage) {
    // eslint-disable-next-line no-console
    console.warn('No test_page value found in the config. Defaulting to "tests/index.html?hidepassed"');
    testPage = 'tests/index.html?hidepassed';
  }

  // Get the testPage from the generated config or the Testem config and
  // use it as the baseUrl to customize for the parallelized test pages or test load balancing
  return testPage;
}

/**
 * Creates an array of custom base urls by appending options that are specified
 *
 * @param {*} commandOptions
 * @param {*} baseUrl
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
 * @param {*} config
 * @param {*} commandOptions
 */
function getMultipleTestPages(config,  commandOptions) {
  let testPages = Object.create(null);
  let browserIds = commandOptions.partition;
  let appendingParam = 'partition';

	if (commandOptions.parallel && !browserIds) {
    browserIds = _getFilledArray(1, commandOptions.split);
	} else if (commandOptions.loadBalance) {
		appendingParam = 'browser';
		browserIds = _getFilledArray(1, commandOptions.loadBalance);
	} else if (commandOptions.replayExecution) {
		appendingParam = 'browser';
		browserIds = commandOptions.replayBrowser;
  }

  const baseUrl = config.testPage || getTestUrlFromTestemConfig(commandOptions.configFile);
  const customBaseUrl = getCustomBaseUrl(commandOptions, baseUrl);

  if (Array.isArray(customBaseUrl)) {
    testPages = customBaseUrl.reduce(function(testPages, customBaseUrl) {
    return testPages.concat(_generateTestPages(customBaseUrl, appendingParam, browserIds));
    }, []);
  } else {
    testPages = _generateTestPages(customBaseUrl, appendingParam, browserIds);
  }

  return testPages;
}

module.exports = {
  convertOptionValueToArray,
  getTestUrlFromTestemConfig,
  getCustomBaseUrl,
  getMultipleTestPages
}
