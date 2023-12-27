'use strict';

const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const debug = require('debug')('exam:config-reader');

const potentialConfigFiles = ['testem.js', 'testem.json'];

/**
 * Given an array of file paths, returns the first one that exists and is
 * accessible. Paths are relative to the process' cwd.
 *
 * @param {Array<string>} files
 * @return {string} file
 */
function _findValidFile(files) {
  for (let i = 0; i < files.length; i++) {
    // TODO: investigate this cwd() usually they are in-error...
    const file = path.join(process.cwd(), files[i]);
    try {
      fs.accessSync(file, fs.F_OK);
      return file;
    } catch (error) {
      debug(`Failed to find ${file} due to error: ${error}`);
      continue;
    }
  }
}

/**
 * Reads in a given file according to it's 'type' as determined by file
 * extension. Supported types are `js` and `json`.
 *
 * @param {string} file
 * @return {Object} fileContents
 */
function _readFileByType(file) {
  if (typeof file === 'string') {
    const fileType = file.split('.').pop();
    switch (fileType) {
      case 'js':
        return require(file);
      case 'json':
        return fs.readJsonSync(file);
      case 'yaml':
        return yaml.load(fs.readFileSync(file));
    }
  }
}

/**
 * Gets the application's testem config by trying a custom file first and then
 * defaulting to either `testem.js` or `testem.json`.
 *
 * @param {string} file
 * @param {Array<string>} potentialFiles
 * @return {Object} config
 */
module.exports = function readTestemConfig(
  file,
  potentialFiles = potentialConfigFiles,
) {
  if (file) {
    potentialFiles.unshift(file);
  }

  const configFile = _findValidFile(potentialFiles);

  return configFile && _readFileByType(configFile);
};
