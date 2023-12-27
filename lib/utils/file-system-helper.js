const fs = require('fs-extra');

/**
 * Creates a file with targetJsonObject
 *
 * @param {string} fileName
 * @param {Object} targetJsonObject
 * @param {Object} option
 */
module.exports = function writeJsonToFile(
  fileName,
  targetJsonObject,
  option = {},
) {
  try {
    fs.writeJsonSync(fileName, targetJsonObject, option);
  } catch (err) {
    if (typeof err === 'object' && err !== null) {
      err.file = err.file || fileName;
    }
    throw err;
  }
};
