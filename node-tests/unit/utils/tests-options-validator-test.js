var assert = require('assert');

var TestOptionsValidator = require('../../../lib/utils/tests-options-validator');

describe('TestOptionsValidator', function() {
  function shouldThrow(prop, options, message) {
    var validator = new TestOptionsValidator(options);
    assert.throws(function() { return validator['should' + prop]; }, message);
  }

  function shouldEqual(prop, options, value) {
    var validator = new TestOptionsValidator(options);
    assert.equal(validator['should' + prop], value);
  }

  function shouldWarn(prop, options, value) {
    /* eslint-disable no-console */
    var originalWarn = console.warn;
    var warnCalled = 0;
    var warnMessage = '';
    console.warn = function(message) {
      warnCalled++;
      warnMessage = message;
    };

    var validator = new TestOptionsValidator(options, options.framework);
    assert.notEqual(validator['should' + prop], undefined);
    assert.equal(warnCalled, 1);
    assert.equal(warnMessage, value);

    console.warn = originalWarn;
    /* eslint-enable no-console */
  }

  describe('shouldSplit', function() {
    function shouldSplitThrows(options, message) {
      shouldThrow('Split', options, message);
    }

    function shouldSplitEqual(options, message) {
      shouldEqual('Split', options, message);
    }

    it('should log a warning if `split` is less than 2', function() {
      shouldWarn('Split', { split: 1 }, 'You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `--split`.');
    });

    it('should throw an error if `partition` is used without `split`', function() {
      shouldSplitThrows({ partition: [1] }, /You must specify a 'split' value in order to use 'partition'/);
    });

    it('should throw an error if `partition` contains a value less than 1', function() {
      shouldSplitThrows({ split: 2, partition: [1, 0] }, /Split tests are one-indexed, so you must specify partition values greater than or equal to 1./);
    });

    it('should throw an error if `partition` contains a value greater than `split`', function() {
      shouldSplitThrows({ split: 2, partition: [1, 3] }, /You must specify 'partition' values that are less than or equal to your 'split' value./);
    });

    it('should throw an error if `partition` contains duplicate values', function() {
      shouldSplitThrows({ split: 2, partition: [1, 2, 1] }, /You cannot specify the same partition twice./);
    });

    it('should throw an error if `weighted` is being used without `split`', function() {
      shouldSplitThrows({ weighted: true }, /You used the 'weighted' option but are not splitting your tests/);
    });

    it('should return true if using `split`', function() {
      shouldSplitEqual({ split: 2 }, true);
    });

    it('should return true if using `split` and `partition`', function() {
      shouldSplitEqual({ split: 2, partition: [1] }, true);
    });

    it('should return false if not using `split`', function() {
      shouldSplitEqual({}, false);
    });
  });

  describe('shouldRandomize', function() {
    function shouldRandomizeEqual(options, message) {
      shouldEqual('Randomize', options, message);
    }

    it('should return true if `random` is an empty string', function() {
      shouldRandomizeEqual({ random: '' }, true);
    });

    it('should return true if `random` is set to a string', function() {
      shouldRandomizeEqual({ random: '1337' }, true);
    });

    it('should return false if `random` is a non-string', function() {
      shouldRandomizeEqual({ random: true }, false);
    });

    it('should return false if `random` is not used', function() {
      shouldRandomizeEqual({}, false);
    });

    it('should warn that randomization is not supported in mocha', function() {
      shouldWarn('Randomize', { random: '', framework: 'mocha' }, 'Mocha does not currently support randomizing test order, so tests will run in normal order. Please see https://github.com/mochajs/mocha/issues/902 for more info.');
    });
  });

  describe('shouldParallelize', function() {
    it('should throw an error if `split` is not being used', function() {
      shouldThrow('Parallelize', { parallel: true }, /You must specify the `split` option in order to run your tests in parallel/);
    });

    it('should return false', function() {
      shouldEqual('Parallelize', { parallel: false }, false);
    });

    it('should return true', function() {
      shouldEqual('Parallelize', { split: 2, parallel: true }, true);
    });
  });
});
