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

  describe('shouldSplit', function() {
    function shouldSplitThrows(options, message) {
      shouldThrow('Split', options, message);
    }

    function shouldSplitEqual(options, message) {
      shouldEqual('Split', options, message);
    }

    it('should throw an error if `split` is less than 2', function() {
      shouldSplitThrows({ split: 1 }, /You must specify a number of files greater than 1 to split your tests across/);
    });

    it('should throw an error if `partition` is used without `split`', function() {
      shouldSplitThrows({ partition: 1 }, /You must specify a 'split' value in order to use 'partition'/);
    });

    it('should throw an error if `partition` is less than 1', function() {
      shouldSplitThrows({ split: 2, partition: 0 }, /Split tests are one-indexed, so you must specify a partition greater than or equal to 1/);
    });

    it('should throw an error if `partition` is greater than `split`', function() {
      shouldSplitThrows({ split: 2, partition: 3 }, /You must specify a 'partition' value that is less than or equal to your 'split' value/);
    });

    it('should throw an error if `weighted` is being used without `split`', function() {
      shouldSplitThrows({ weighted: true }, /You used the 'weighted' option but are not splitting your tests/);
    });

    it('should return true if using `split`', function() {
      shouldSplitEqual({ split: 2 }, true);
    });

    it('should return true if using `split` and `partition`', function() {
      shouldSplitEqual({ split: 2, partition: 1 }, true);
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
  });

  describe('shouldParallelize', function() {
    it('should throw an error if `split` is not being used', function() {
      shouldThrow('Parallelize', { parallel: true }, /You must specify the `split` option in order to run your tests in parallel/);
    });

    it('should log a message about ignoring the `partition` option', function() {
      var lastLog = '';
      var originalLog = console.info;
      console.info = function(str) {
        lastLog = str;
      };

      var validator = new TestOptionsValidator({ split: 2, partition: 1, parallel: true });
      assert.equal(validator.shouldParallelize, true);
      assert.equal(lastLog, 'Ignoring `partition` option due to running split tests in parallel.');

      console.info = originalLog;
    });

    it('should return false', function() {
      shouldEqual('Parallelize', { parallel: false }, false);
    });

    it('should return true', function() {
      shouldEqual('Parallelize', { split: 2, parallel: true }, true);
    });
  });
});
