'use strict';

/**
 * Performs logic related to validating command options for testing and
 * determining which functions to run on the tests.
 *
 * @class TestsOptionsValidator
 */
function TestsOptionsValidator(options, framework) {
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
Object.defineProperty(TestsOptionsValidator.prototype, 'shouldSplit', {
  get: function _getShouldSplit() {
    var options = this.options;
    var split = options.split;

    if (typeof split !== 'undefined' && split < 2) {
      // eslint-disable-next-line no-console
      console.warn('You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `--split`.');
      split = 1;
    }

    var partitions = options.partition;

    if (typeof partitions !== 'undefined') {
      validatePartitions(partitions, split);
    }

    if (options.weighted && !split) {
      throw new Error('You used the \'weighted\' option but are not splitting your tests.');
    }

    return !!split;
  }
});

/**
 * Validates the specified partitions
 *
 * @private
 * @param {Array} partitions
 * @param {Number} split
 */
function validatePartitions(partitions, split) {
  validatePartitionSplit(partitions, split);
  validatePartitionsUnique(partitions);
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

  for (var i = 0; i < partitions.length; i++) {
    var partition = partitions[i];
    if (partition < 1) {
      throw new Error('Split tests are one-indexed, so you must specify partition values greater than or equal to 1.');
    }

    if (partition > split) {
      throw new Error('You must specify \'partition\' values that are less than or equal to your \'split\' value.');
    }
  }
}

/**
 * Ensures that there is no partition listed twice
 *
 * @private
 * @param {Array} partitions
 */
function validatePartitionsUnique(partitions) {
  partitions = partitions.sort();
  for (var i = 0; i < partitions.length - 1; i++) {
    if (partitions[i] === partitions[i + 1]) {
      throw new Error('You cannot specify the same partition twice.');
    }
  }
}

/**
 * Determines if we should randomize the tests and validates associated options
 * (`random`).
 *
 * @public
 * @type {Boolean}
 */
Object.defineProperty(TestsOptionsValidator.prototype, 'shouldRandomize', {
  get: function _getShouldRandomize() {
    var shouldRandomize = (typeof this.options.random === 'string');

    if (shouldRandomize && this.framework === 'mocha') {
      // eslint-disable-next-line no-console
      console.warn('Mocha does not currently support randomizing test order, so tests will run in normal order. Please see https://github.com/mochajs/mocha/issues/902 for more info.');
    }

    return shouldRandomize;
  }
});

/**
 * Determines if we should run split tests in parallel and validates associated
 * options (`parallel`).
 *
 * @public
 * @type {Boolean}
 */
Object.defineProperty(TestsOptionsValidator.prototype, 'shouldParallelize', {
  get: function _getShouldParallelize() {
    var parallel = this.options.parallel;

    if (!parallel) {
      return false;
    }

    if (!this.shouldSplit) {
      throw new Error('You must specify the `split` option in order to run your tests in parallel.');
    }

    return true;
  }
});

module.exports = TestsOptionsValidator;
