'use strict';

const readTestExecutionJsonFile= require('./test-execution-json-reader');
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

function getNumberOfBrowser(fileName) {
  const executionJson = readTestExecutionJsonFile(fileName);
  return executionJson.numberOfBrowsers;
}

/**
 * Validates the specified replay-browser
 *
 * @param {*} replayBrowser
 * @param {*} replayExecution
 */
function validateReplayBrowser(replayBrowser, replayExecution) {
  const numberOfBrowsers = getNumberOfBrowser(replayExecution);

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
  const sorted = arr.slice().sort()
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] === sorted[i + 1]) {
      const errorMsg = `You cannot specify the same ${typeOfValue} value twice. ${sorted[i]} is repeated.`;
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
    this.validatedOption = Object.create(null);
  }

  /**
   * Determines if we should split the tests file and validates associated options
   * (`split`, `partition`, `weighted`).
   *
   * @public
   * @type {Boolean}
   */
  get shouldSplit() {
    if (!this.validatedOption.shouldSplit) {
      const options = this.options;
      let split = options.split;

      if (typeof split !== 'undefined' && split < 2) {
        // eslint-disable-next-line no-console
        console.warn('You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `--split`.');
        split = 1;
      }

      if (typeof split !== 'undefined' && typeof this.options.replayBrowser !== 'undefined') {
        throw new Error('You must not use the `replay-browser` option with the `split` option.');
      }

      if (typeof split !== 'undefined' && this.options.replayExecution) {
        throw new Error('You must not use the `replay-execution` option with the `split` option.');
      }

      const partitions = options.partition;

      if (typeof partitions !== 'undefined') {
        validatePartitions(partitions, split);
      }

      this.validatedOption.shouldSplit = !!split;
    }

    return this.validatedOption.shouldSplit;
  }


  /**
   * Determines if we should randomize the tests and validates associated options
   * (`random`).
   *
   * @public
   * @type {Boolean}
   */
  get shouldRandomize() {
    if (!this.validatedOption.shouldRandomize) {
      const shouldRandomize = (typeof this.options.random === 'string');

      if (shouldRandomize && this.framework === 'mocha') {
        // eslint-disable-next-line no-console
        console.warn('Mocha does not currently support randomizing test order, so tests will run in normal order. Please see https://github.com/mochajs/mocha/issues/902 for more info.');
      }

      this.validatedOption.shouldRandomize = shouldRandomize;
    }

    return this.validatedOption.shouldRandomize;
  }

  /**
   * Determines if we should run split tests in parallel and validates associated
   * options (`parallel`).
   *
   * @public
   * @type {Boolean}
   */
  get shouldParallelize() {
    if (!this.validatedOption.shouldParallelize) {
      const parallel = this.options.parallel;

      if (!parallel) {
        this.validatedOption.shouldParallelize = false;
      } else {
        if (typeof this.options.replayBrowser !== 'undefined') {
          throw new Error('You must not use the `replay-browser` option with the `parallel` option.');
        }

        if (this.options.replayExecution) {
          throw new Error('You must not use the `replay-execution` option with the `parallel` option.');
        }

        if (typeof this.options.loadBalance !== 'undefined') {
          throw new Error('You must not use the `load-balance` option with the `parallel` option.');
        }

        if (!this.shouldSplit) {
          throw new Error('You must specify the `split` option in order to run your tests in parallel.');
        }

        this.validatedOption.shouldParallelize = true;
      }

    }

    return this.validatedOption.shouldParallelize;
  }

  get shouldLoadBalance() {
    if (!this.validatedOption.loadBalance) {
      let loadBalance = this.options.loadBalance;

      if (typeof loadBalance == 'undefined') {
        this.validatedOption.loadBalance = false;
        return this.validatedOption.loadBalance;
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

      if (typeof this.options.replayBrowser !== 'undefined') {
        throw new Error('You must not use the `replay-browser` option with the `load-balance` option.');
      }

      if (this.options.replayExecution) {
        throw new Error('You must not use the `replay-execution` option with the `load-balance` option.');
      }

      this.validatedOption.loadBalance = true;
    }

    return this.validatedOption.loadBalance;
  }

  /**
   * Determines if we should replay execution for reproduction.
   * options (`replay-execution`).
   *
   * @public
   * @type {Boolean}
   */
  get shouldReplayExecution() {
    if (!this.validatedOption.replayExecution) {
      const replayBrowser = this.options.replayBrowser;
      const replayExecution = this.options.replayExecution;

      if (!replayExecution) {
        this.validatedOption.shouldReplayExecution = false;
        return this.validatedOption.shouldReplayExecution;
      }

      if (!replayBrowser) {
        throw new Error('You must specify the `replay-browser` option in order to use `replay-execution` option.');
      }

      validateReplayBrowser(replayBrowser, replayExecution, this.options);

      this.validatedOption.replayExecution = true;
    }

    return this.validatedOption.replayExecution;
  }
};
