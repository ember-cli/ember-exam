'use strict';

const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const debug = require('debug')('exam:config-reader');

const potentialConfigFiles = [
  'testem.js',
  'testem.json',
  'testem.cjs',
  'testem.mjs',
  'testem.ts',
  'testem.mts',
  'testem.cts',
];

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
 * Reads in a given file according to its extension.
 *
 * Script files (`js`, `cjs`, `mjs`, `ts`, `mts`, `cts`) go through Node's `require`.
 * Node handles ESM and TypeScript loading itself.
 * Top-level `await` in an ESM config throws ERR_REQUIRE_ASYNC_MODULE.
 *
 * @param {string} file
 * @return {Object} fileContents
 */
function _readFileByType(file) {
  if (typeof file === 'string') {
    const fileType = file.split('.').pop();
    switch (fileType) {
      case 'js':
      case 'cjs':
      case 'mjs':
      case 'ts':
      case 'mts':
      case 'cts':
        return unwrapCompatModule(require(file));
      case 'json':
        return fs.readJsonSync(file);
      case 'yaml':
        return yaml.load(fs.readFileSync(file));
      default:
        throw new Error(`Unrecognized file extension for: ${file}`);
    }
  }
}

// Return the default export from a CJS-interop or ESM-namespace module.
// Plain CJS (no __esModule marker) passes through unchanged, so downstream
// callers keep seeing the shape they always got from require('./testem.js').
function unwrapCompatModule(mod) {
  if (!mod || typeof mod !== 'object' || !mod.__esModule) {
    return mod;
  }
  return 'default' in mod ? mod.default : mod;
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
