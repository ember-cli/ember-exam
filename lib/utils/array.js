'use strict';

/**
 * Generates a random seed (just an integer), ranging from 0 to 10,000.
 * @return {Number}
 */
function _generateSeed() {
  return Math.floor(Math.random() * 10000);
}

/**
 * Creates a seeded random number generator. Very simplistic in implementation
 * but works for the purposes of randomizing order.
 * @param {Number} seed
 * @return {Function}
 */
function _randomNumberGenerator(seed) {
  /**
   * Returns a random number in the range of [0,1].
   * @return {Number}
   */
  return function _random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
}

/**
 * Randomly sorts an array in place. Can optionally provide a seed value to get
 * reproducible results.
 * @param {Array} array
 * @param {Number} seed
 * @return {Void}
 */
function randomizeArray(array, seed) {
  if (typeof seed !== 'number') {
    seed = _generateSeed();
  }

  console.info('Randomizing with seed:', seed);

  var randomNumber = _randomNumberGenerator(seed);

  array.sort(function() { return 0.5 - randomNumber(); });
}

/**
 * Splits an array into n number of roughly equal sized parts.
 * @param {Array} array
 * @param {Number} n
 * @return {Array}
 */
function splitArray(array, n) {
  var length = array.length;
  var output = [];
  var i = 0;

  while (i < length) {
    var size = Math.ceil((length - i) / n--);
    output.push(array.slice(i, i + size));
    i += size;
  }

  return output;
}


module.exports = {
  randomize: randomizeArray,
  split: splitArray
};
