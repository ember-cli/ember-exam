'use strict';

const exam = require('../commands/exam');
const checkDevDependencies = require('../../index').checkDevDependencies();

/**
 * Validates the specified partitions
 *
 * @private
 * @param {Array} partitions
 * @param {Number} split
 */
function validatePartitions(partitions, split) {
  validatePartitionSplit(partitions, split);
  validateElementsUnique(partitions, 'partition');
}

/**
 * Validates the specified replay-browser
 *
 * @param {*} replayBrowser
 * @param {*} replayExecution
 */
function validateReplayBrowser(replayBrowser, replayExecution, options) {
  exam.prototype.executionMapping = exam.prototype.getExecutionMappingInstance(options);
  const numberOfBrowsers = exam.prototype.executionMapping.numberOfBrowsers;

  if (!replayExecution) {
    throw new Error('You must specify a file path when using the \'replay-browser\' option.');
  }

  for (const i in replayBrowser) {
    const browserId = replayBrowser[i]
    if (browserId < 1) {
      throw new Error('You must specify replay-browser values greater than or equal to 1.');
    }
    if (browserId > numberOfBrowsers) {
      throw new Error('You must specify replayBrowser value smaller than a number of browsers in the specified json file.');
    }
  }

  validateElementsUnique(replayBrowser, 'replayBrowser');
}

/**
 * Determines if the specified partitions value makes sense for a given split.
 *
 * @private
 * @param {Array} partitions
 * @param {Number} split
 */
function validatePartitionSplit(partitions, split) {
  if (!split) {
    throw new Error('You must specify a \'split\' value in order to use \'partition\'.');
  }

  for (let i = 0; i < partitions.length; i++) {
    const partition = partitions[i];
    if (partition < 1) {
      throw new Error('Split tests are one-indexed, so you must specify partition values greater than or equal to 1.');
    }
    if (partition > split) {
      throw new Error('You must specify \'partition\' values that are less than or equal to your \'split\' value.');
    }
  }
}

/**
 * Ensures that there is no value duplicated in a given array.
 *
 * @private
 * @param {Array} arr
 * @param {String} typeOfValue
 */
function validateElementsUnique(arr, typeOfValue) {
  arr = arr.sort();
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      const errorMsg = `You cannot specify the same ${typeOfValue} value twice. ${arr[i].toString()} is repeated.`;
      throw new Error(errorMsg);
    }
  }
}


/**
 * Performs logic related to validating command options for testing and
 * determining which functions to run on the tests.
 *
 * @class TestsOptionsValidator
 */

module.exports = class TestsOptionsValidator {
  constructor(options, framework) {
    this.options = options;
    this.framework = framework;
  }

  /**
   * Determines if we should split the tests file and validates associated options
   * (`split`, `partition`, `weighted`).
   *
   * @public
   * @type {Boolean}
   */
  get shouldSplit() {
    const options = this.options;
    let split = options.split;

    if (typeof split !== 'undefined' && split < 2) {
      // eslint-disable-next-line no-console
      console.warn('You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `--split`.');
      split = 1;
    }

    const partitions = options.partition;

    if (typeof partitions !== 'undefined') {
      validatePartitions(partitions, split);
    }

    return !!split;
  }


  /**
   * Determines if we should randomize the tests and validates associated options
   * (`random`).
   *
   * @public
   * @type {Boolean}
   */
  get shouldRandomize() {
    const shouldRandomize = (typeof this.options.random === 'string');

    if (shouldRandomize && this.framework === 'mocha') {
      // eslint-disable-next-line no-console
      console.warn('Mocha does not currently support randomizing test order, so tests will run in normal order. Please see https://github.com/mochajs/mocha/issues/902 for more info.');
    }

    return shouldRandomize;
  }

  /**
   * Determines if we should run split tests in parallel and validates associated
   * options (`parallel`).
   *
   * @public
   * @type {Boolean}
   */
  get shouldParallelize() {
    const parallel = this.options.parallel;

    if (!parallel) {
      return false;
    }

    if (typeof this.options.loadBalance !== 'undefined') {
      throw new Error('You must not use the `load-balance` option with the `parallel` option.');
    }

    if (!this.shouldSplit) {
      throw new Error('You must specify the `split` option in order to run your tests in parallel.');
    }

    return true;
  }

  get shouldLoadBalance() {
    let loadBalance = this.options.loadBalance;

    if (typeof loadBalance == 'undefined') {
      return false;
    }

    // It's required to use ember-cli version 3.2.0 or greater to support the `load-balance` feature.
    if (!checkDevDependencies) {
      throw new Error('You must be using ember-cli version 3.2.0 or greater for this feature to work properly.');
    }

    if (loadBalance < 1) {
      throw new Error('You must specify a load-balance value greater than or equal to 1.');
    }

    if (this.options.parallel) {
      throw new Error('You must not use the `parallel` option with the `load-balance` option.');
    }

    return true;
  }

  /**
   * Determines if we should replay execution for reproduction.
   * options (`replay-execution`).
   *
   * @public
   * @type {Boolean}
   */
  get shouldReplayExecution() {
    const replayBrowser = this.options.replayBrowser;
    const replayExecution = this.options.replayExecution;

    if (!replayExecution) {
      return false;
    }

    if (!replayBrowser) {
      throw new Error('You must specify the `replay-browser` option in order to use `replay-execution` option.');
    }

    validateReplayBrowser(replayBrowser, replayExecution, this.options);

    return true;
  }
};
