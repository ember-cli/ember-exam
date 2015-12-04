var assert = require('assert');

var ArrayUtils = require('../../../lib/utils/array');

describe('ArrayUtils', function() {
  describe('randomize', function() {
    it('should randomize an array with a passed in seed', function() {
      var array = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 0 ];
      var seed = ArrayUtils.randomize(array, 10);

      assert.deepEqual(array, [ 3, 1, 2, 5, 7, 4, 8, 0, 9, 6 ]);
      assert.equal(seed, 10);
    });

    it('should randomize an array with a generated seed', function() {
      var array = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 0 ];
      var seed = ArrayUtils.randomize(array);

      assert.equal(typeof seed === 'number', true);
    });
  });

  describe('split', function() {
    it('should generate equal sized arrays with a nice fraction', function() {
      var array = [ 'a', 'b' ];
      var splits = ArrayUtils.split(array, 2);

      assert.equal(splits[0].length, 1);
      assert.equal(splits[1].length, 1);

      array = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ];
      splits = ArrayUtils.split(array, 3);

      assert.equal(splits[0].length, 3);
      assert.equal(splits[1].length, 3);
      assert.equal(splits[2].length, 3);
    });

    it('should generate roughly equal sized arrays with a poor fraction', function() {
      var array = [ 'a', 'b', 'c' ];
      var splits = ArrayUtils.split(array, 2);

      assert.equal(splits[0].length, 2);
      assert.equal(splits[1].length, 1);

      array = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ];
      splits = ArrayUtils.split(array, 3);

      assert.equal(splits[0].length, 3);
      assert.equal(splits[1].length, 2);
      assert.equal(splits[2].length, 2);
    });
  });

  describe('weightedSplit', function() {
    it('should attempt to split an array such that all columns are similar weight', function() {
      var array = [
        { weight: 150 },
        { weight: 20 },
        { weight: 100 },
        { weight: 10 },
        { weight: 20 },
        { weight: 10 },
        { weight: 1 },
        { weight: 100 }
      ];

      var splits = ArrayUtils.weightedSplit(array, 2);

      var expectedOne = [
        { weight: 150 },
        { weight: 10 }
      ];
      var expectedTwo = [
        { weight: 20 },
        { weight: 100 },
        { weight: 10 },
        { weight: 20 },
        { weight: 1 },
        { weight: 100 }
      ];

      assert.deepEqual(splits, [ expectedOne, expectedTwo ]);

      var array = [
        { weight: 100 },
        { weight: 10 },
        { weight: 100 }
      ];

      var splits = ArrayUtils.weightedSplit(array, 2);

      var expectedOne = [
        { weight: 100 }
      ];
      var expectedTwo = [
        { weight: 10 },
        { weight: 100 }
      ];

      assert.deepEqual(splits, [ expectedOne, expectedTwo ]);
    });
  });

  describe('moveElement', function() {
    it('should properly rearrange elements in place', function() {
      var array = [ 'a', 'b', 'c' ];

      ArrayUtils.moveElement(array, 1, 0);

      assert.equal(array.length, 3);
      assert.equal(array[0], 'b');
      assert.equal(array[1], 'a');

      ArrayUtils.moveElement(array, 0, 2);

      assert.equal(array.length, 3);
      assert.equal(array[0], 'a');
      assert.equal(array[1], 'c');
      assert.equal(array[2], 'b');
    });
  });
});