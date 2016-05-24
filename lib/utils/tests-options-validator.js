'use strict';

/**
 * Performs logic related to validating command options for testing and
 * determining which functions to run on the tests.
 *
 * @class TestsOptionsValidator
 */
function TestsOptionsValidator(options) {
  this.options = options;
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
      throw new Error('You must specify a number of files greater than 1 to split your tests across.');
    }

    var partition = options.partition;

    if (typeof partition !== 'undefined') {
      if (!split) {
        throw new Error('You must specify a \'split\' value in order to use \'partition\'.');
      }

      if (partition < 1) {
        throw new Error('Split tests are one-indexed, so you must specify a partition greater than or equal to 1.');
      }

      if (partition > split) {
        throw new Error('You must specify a \'partition\' value that is less than or equal to your \'split\' value.');
      }
    }

    if (options.weighted && !split) {
      throw new Error('You used the \'weighted\' option but are not splitting your tests.');
    }

    return !!split;
  }
});

/**
 * Determines if we should randomize the tests and validates associated options
 * (`random`).
 *
 * @public
 * @type {Boolean}
 */
Object.defineProperty(TestsOptionsValidator.prototype, 'shouldRandomize', {
  get: function _getShouldRandomize() {
    return typeof this.options.random === 'string'
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

    if (typeof this.options.partition !== 'undefined') {
      console.warn('Ignoring `partition` option due to running split tests in parallel.');
    }

    return true;
  }
});

module.exports = TestsOptionsValidator;
