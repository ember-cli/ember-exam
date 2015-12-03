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
 * Based on the options, determines if we will need to construct an AST for the
 * tests at the end of the build.
 *
 * @public
 * @type {Boolean}
 */
Object.defineProperty(TestsOptionsValidator.prototype, 'needsAST', {
  get: function _getNeedsAST() {
    return this.shouldSplit || this.shouldRandomize || this.shouldFilter;
  }
});

/**
 * Determines if we should split the tests file and validates associated options
 * (`split`, `split-file` and `parallel`).
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

    var splitFile = options.splitFile;

    if (typeof splitFile !== 'undefined') {
      if (!split) {
        throw new Error('You must specify a \'split\' value in order to use \'split-file\'.');
      }

      if (splitFile < 1) {
        throw new Error('Split files are one-indexed, so you must specify a split-file greater than or equal to 1.');
      }

      if (splitFile > split) {
        throw new Error('You must specify a \'split-file\' value that is less than or equal to your \'split\' value.');
      }
    }

    if (!!options.parallel) {
      throw new Error('Sorry, the \'parallel\' option is not yet supported. Pull requests welcome!');
    }

    return !!split;
  }
});

/**
 * Determines if we should randomize the tests and validates associated options
 * (`random` and `seed`).
 *
 * @public
 * @type {Boolean}
 */
Object.defineProperty(TestsOptionsValidator.prototype, 'shouldRandomize', {
  get: function _getShouldRandomize() {
    var options = this.options;
    var random = options.random = options.random === '' ? 'tests' : options.random;

    if (random && random !== 'tests' && random !== 'modules') {
      throw new Error('Valid options for \'random\' are \'tests\', \'modules\', or nothing.');
    }

    var seed = options.seed;

    if (!random && typeof seed !== 'undefined') {
      throw new Error('You specified a \'seed\' value but are not using \'random\' as well.');
    }

    return !!random;
  }
});

/**
 * Determines if we should filter the tests and validates associated options
 * (`hard-filter` and `regex-filter`).
 *
 * @public
 * @type {Boolean}
 */
Object.defineProperty(TestsOptionsValidator.prototype, 'shouldFilter', {
  get: function _getShouldFilter() {
    var options = this.options;
    return !!options.hardFilter || !!options.regexFilter;
  }
});

module.exports = TestsOptionsValidator;
