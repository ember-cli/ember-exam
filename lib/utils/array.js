'use strict';

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

/**
 * Splits an array into n number of group according to a weight specified on
 * each element.
 * @param {Array} array
 * @param {Number} n
 * @return {Array}
 */
function weightedArraySplit(array, n) {
  var length = array.length;
  var weights = [];
  var groups = [];
  var i = 0;

  while (i < length) {
    var item = array[i];

    if (i < n) {
      // Initialize each group with their first item
      groups[i] = [ item ];
      weights[i] = item.weight;
    } else {
      // Add the next item to the array with the least weight
      var min = minIndex(weights);
      groups[min].push(item);
      weights[min] += item.weight;
    }

    i++;
  }

  return groups;
}

/**
 * Returns the index of the minimum value in the array.
 * @param {Array} array
 * @return {Number}
 */
function minIndex(array) {
  return array.reduce(function(min, value, index, arr) {
    return value < arr[min] ? index : min;
  }, 0);
}

/**
 * Moves an array's element from one index to another in-place.
 * @param {Array} array
 * @param {Number} from
 * @param {Number} to
 * @return {Void}
 */
function moveArrayElement(array, from, to) {
  array.splice(to, 0, array.splice(from, 1)[0]);
}

module.exports = {
  split: splitArray,
  moveElement: moveArrayElement,
  weightedSplit: weightedArraySplit
};
