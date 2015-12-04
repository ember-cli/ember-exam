var assert = require('assert');

var TestOptionsValidator = require('../../../lib/utils/tests-options-validator');

describe('TestOptionsValidator', function() {
  describe('needsAST', function() {
    it('returns true if shouldSplit is true', function() {
      var validator = new TestOptionsValidator({ split: 2 });
      assert.equal(validator.needsAST, true);
    });

    it('returns true if shouldRandomize is true', function() {
      var validator = new TestOptionsValidator({ random: '' });
      assert.equal(validator.needsAST, true);
    });

    it('returns true if shouldFilter is true', function() {
      var validator = new TestOptionsValidator({ distill: 'filter' });
      assert.equal(validator.needsAST, true);
    });

    it('returns true if shouldSplit and shouldRandomize are true', function() {
      var validator = new TestOptionsValidator({ split: 2, random: '' });
      assert.equal(validator.needsAST, true);
    });

    it('returns true if shouldSplit and shouldFilter are true', function() {
      var validator = new TestOptionsValidator({ split: 2, distill: 'filter' });
      assert.equal(validator.needsAST, true);
    });

    it('returns true if shouldRandomize and shouldFilter are true', function() {
      var validator = new TestOptionsValidator({ random: '', distill: 'filter' });
      assert.equal(validator.needsAST, true);
    });

    it('returns true if shouldSplit, shouldRandomize, and shouldFilter are true', function() {
      var validator = new TestOptionsValidator({ split: 2, random: '', distill: 'filter' });
      assert.equal(validator.needsAST, true);
    });

    it('returns false if shouldSplit, shouldRandomize, and shouldFilter are false', function() {
      var validator = new TestOptionsValidator({});
      assert.equal(validator.needsAST, false);
    });
  });

  describe('shouldSplit', function() {
    it('should throw an error if `split` is less than 2', function() {
      var validator = new TestOptionsValidator({ split: 1 });
      assert.throws(function() { validator.shouldSplit; }, /You must specify a number of files greater than 1 to split your tests across/);
    });

    it('should throw an error if `split-file` is used without `split`', function() {
      var validator = new TestOptionsValidator({ splitFile: 1 });
      assert.throws(function() { validator.shouldSplit; }, /You must specify a 'split' value in order to use 'split-file'/);
    });

    it('should throw an error if `split-file` is less than 1', function() {
      var validator = new TestOptionsValidator({ split: 2, splitFile: 0 });
      assert.throws(function() { validator.shouldSplit; }, /Split files are one-indexed, so you must specify a split-file greater than or equal to 1/);
    });

    it('should throw an error if `split-file` is greater than `split`', function() {
      var validator = new TestOptionsValidator({ split: 2, splitFile: 3 });
      assert.throws(function() { validator.shouldSplit; }, /You must specify a 'split-file' value that is less than or equal to your 'split' value/);
    });

    it('should throw an error if `weighted` is being used without `split`', function() {
      var validator = new TestOptionsValidator({ weighted: true });
      assert.throws(function() { validator.shouldSplit; }, /You used the 'weighted' option but are not splitting your tests/);
    });

    it('should throw an error if `parallel` is being used', function() {
      var validator = new TestOptionsValidator({ split: 2, parallel: true });
      assert.throws(function() { validator.shouldSplit; }, /Sorry, the 'parallel' option is not yet supported. Pull requests welcome/);
    });

    it('should return true if using `split`', function() {
      var validator = new TestOptionsValidator({ split: 2 });
      assert.equal(validator.shouldSplit, true);
    });

    it('should return true if using `split` and `split-file`', function() {
      var validator = new TestOptionsValidator({ split: 2, splitFile: 1 });
      assert.equal(validator.shouldSplit, true);
    });

    it('should return false if not using `split`', function() {
      var validator = new TestOptionsValidator({});
      assert.equal(validator.shouldSplit, false);
    });
  });

  describe('shouldRandomize', function() {
    it('should return true if `random` is set to \'tests\'', function() {
      var validator = new TestOptionsValidator({ random: 'tests' });
      assert.equal(validator.shouldRandomize, true);
    });

    it('should return true if `random` is set to \'modules\'', function() {
      var validator = new TestOptionsValidator({ random: 'modules' });
      assert.equal(validator.shouldRandomize, true);
    });

    it('should default `random` to \'modules\' if used without a value', function() {
      var validator = new TestOptionsValidator({ random: '' });
      assert.equal(validator.shouldRandomize, true);
      assert.equal(validator.options.random, 'modules');
    });

    it('should throw an error if `random` is a non-supported value', function() {
      var validator = new TestOptionsValidator({ random: 'herp' });
      assert.throws(function() { validator.shouldRandomize; }, /Valid options for 'random' are 'tests', 'modules', or nothing/);
    });

    it('should return true if `random` is used with `seed`', function() {
      var validator = new TestOptionsValidator({ random: '', seed: 10 });
      assert.equal(validator.shouldRandomize, true);
    });

    it('should throw an error if `seed` is used without `random`', function() {
      var validator = new TestOptionsValidator({ seed: 10 });
      assert.throws(function() { validator.shouldRandomize; }, /You specified a 'seed' value but are not using 'random' as well/);
    });

    it('should return false if `random` is not used', function() {
      var validator = new TestOptionsValidator({});
      assert.equal(validator.shouldRandomize, false);
    });
  });

  describe('shouldFilter', function() {
    it('should return true if using `distill`', function() {
      var validator = new TestOptionsValidator({ distill: '/some.*regex/' });
      assert.equal(validator.shouldFilter, true);
    });

    it('should throw an error if using `distill` with a falsy value', function() {
      var validator = new TestOptionsValidator({ distill: '' });
      assert.throws(function() { validator.shouldFilter; }, /You must specify either a normal string or a regex pattern for 'distill'/);
    });

    it('should return false if not using `distill`', function() {
      var validator = new TestOptionsValidator({});
      assert.equal(validator.shouldFilter, false);
    });
  });
});
