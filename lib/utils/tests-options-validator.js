'use strict';

const fs = require('fs-extra');
const checkDevDependencies = require('../../index').checkDevDependencies();

/**
 * Validates the specified partitions
 *
 * @private
 * @param {Array<Number>} partitions
 * @param {Number} split
 */
function validatePartitions(partitions, split) {
  validatePartitionSplit(partitions, split);
  validateElementsUnique(partitions, 'partition');
}

function getNumberOfBrowser(fileName) {
  const executionJson = fs.readJsonSync(fileName);
  return executionJson.numberOfBrowsers;
}

/**
 * Validates the specified replay-browser
 *
 * @param {String} replayExecution
 * @param {Array<Number>} replayBrowser
 */
function validateReplayBrowser(replayExecution, replayBrowser) {
  if (!replayExecution) {
    throw new Error(
      "You must specify a file path when using the 'replay-browser' option."
    );
  }

  const numberOfBrowsers = getNumberOfBrowser(replayExecution);

  for (const i in replayBrowser) {
    const browserId = replayBrowser[i];
    if (browserId < 1) {
      throw new Error(
        'You must specify replay-browser values greater than or equal to 1.'
      );
    }
    if (browserId > numberOfBrowsers) {
      throw new Error(
        'You must specify replayBrowser value smaller than a number of browsers in the specified json file.'
      );
    }
  }

  validateElementsUnique(replayBrowser, 'replayBrowser');
}

/**
 * Determines if the specified partitions value makes sense for a given split.
 *
 * @private
 * @param {Array<Number>} partitions
 * @param {Number} split
 */
function validatePartitionSplit(partitions, split) {
  if (!split) {
    throw new Error(
      "You must specify a 'split' value in order to use 'partition'."
    );
  }

  for (let i = 0; i < partitions.length; i++) {
    const partition = partitions[i];
    if (partition < 1) {
      throw new Error(
        'Split tests are one-indexed, so you must specify partition values greater than or equal to 1.'
      );
    }
    if (partition > split) {
      throw new Error(
        "You must specify 'partition' values that are less than or equal to your 'split' value."
      );
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
  const sorted = arr.slice().sort();
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] === sorted[i + 1]) {
      const errorMsg = `You cannot specify the same ${typeOfValue} value twice. ${
        sorted[i]
      } is repeated.`;
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
   * Validates the command and returns a map of the options and whether they are enabled or not.
   *
   * @public
   * @return {Object} Map of the options and whether they are enabled or not.
   */
  validateCommands() {
    const validatedOptions = Object.create(null);
    if (this.options.split || this.options.partition) {
      validatedOptions.split = this.validateSplit();
    }

    if (this.options.parallel) {
      validatedOptions.parallel = this.validateParallel();
    }

    // As random option can be an empty string it should check a type of random option rather than the option is not empty.
    if (typeof this.options.random !== 'undefined') {
      validatedOptions.random = this.validateRandom();
    }

    if (this.options.loadBalance) {
      validatedOptions.loadBalance = this.validateLoadBalance();
    }

    if (this.options.replayExecution || this.options.replayBrowser) {
      validatedOptions.replayExecution = this.validateReplayExecution();
    }

    return validatedOptions;
  }

  /**
   * Determines if we should split the tests file and validates associated options
   * (`split`, `partition`).
   *
   * @return {Boolean}
   */
  validateSplit() {
    const options = this.options;
    let split = options.split;

    if (typeof split !== 'undefined' && split < 2) {
      // eslint-disable-next-line no-console
      console.warn(
        'You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `--split`.'
      );
      split = 1;
    }

    if (
      typeof split !== 'undefined' &&
      typeof this.options.replayBrowser !== 'undefined'
    ) {
      throw new Error(
        'You must not use the `replay-browser` option with the `split` option.'
      );
    }

    if (typeof split !== 'undefined' && this.options.replayExecution) {
      throw new Error(
        'You must not use the `replay-execution` option with the `split` option.'
      );
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
   * @return {Boolean}
   */
  validateRandom() {
    const shouldRandomize = typeof this.options.random === 'string';

    if (shouldRandomize && this.framework === 'mocha') {
      // eslint-disable-next-line no-console
      console.warn(
        'Mocha does not currently support randomizing test order, so tests will run in normal order. Please see https://github.com/mochajs/mocha/issues/902 for more info.'
      );
    }

    return shouldRandomize;
  }

  /**
   * Determines if we should run split tests in parallel and validates associated
   * options (`parallel`).
   *
   * @return {Boolean}
   */
  validateParallel() {
    const parallel = this.options.parallel;

    if (!parallel) {
      return false;
    } else {
      if (typeof this.options.replayBrowser !== 'undefined') {
        throw new Error(
          'You must not use the `replay-browser` option with the `parallel` option.'
        );
      }

      if (this.options.replayExecution) {
        throw new Error(
          'You must not use the `replay-execution` option with the `parallel` option.'
        );
      }

      if (typeof this.options.loadBalance !== 'undefined') {
        throw new Error(
          'You must not use the `load-balance` option with the `parallel` option.'
        );
      }

      if (!this.validateSplit()) {
        throw new Error(
          'You must specify the `split` option in order to run your tests in parallel.'
        );
      }

      return true;
    }
  }

  /**
   * Determines if we should run tests in load balance mode.
   * options (`load-balance`).
   *
   * @return {Boolean}
   */
  validateLoadBalance() {
    let loadBalance = this.options.loadBalance;

    if (typeof loadBalance == 'undefined') {
      return false;
    }

    // It's required to use ember-cli version 3.2.0 or greater to support the `load-balance` feature.
    if (!checkDevDependencies) {
      throw new Error(
        'You must be using ember-cli version 3.2.0 or greater for this feature to work properly.'
      );
    }

    if (loadBalance < 1) {
      throw new Error(
        'You must specify a load-balance value greater than or equal to 1.'
      );
    }

    if (this.options.parallel) {
      throw new Error(
        'You must not use the `parallel` option with the `load-balance` option.'
      );
    }

    if (typeof this.options.replayBrowser !== 'undefined') {
      throw new Error(
        'You must not use the `replay-browser` option with the `load-balance` option.'
      );
    }

    if (this.options.replayExecution) {
      throw new Error(
        'You must not use the `replay-execution` option with the `load-balance` option.'
      );
    }

    return true;
  }

  /**
   * Determines if we should replay execution for reproduction.
   * options (`replay-execution`).
   *
   * @return {Boolean}
   */
  validateReplayExecution() {
    const replayBrowser = this.options.replayBrowser;
    const replayExecution = this.options.replayExecution;

    if (!replayExecution) {
      return false;
    }

    if (!replayBrowser) {
      throw new Error(
        'You must specify the `replay-browser` option in order to use `replay-execution` option.'
      );
    }

    validateReplayBrowser(replayExecution, replayBrowser, this.options);

    return true;
  }
};
