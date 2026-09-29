'use strict';

const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');
const semver = require('semver');
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

// Node 22.12 unflagged require(esm), and Node 22.6 added native TypeScript
// strip-types (on by default on 23.6). Together these let a synchronous
// require(...) load .mjs / .ts / .mts / .cts modules without introducing an
// async read path.
const REQUIRE_ESM_MIN_NODE = '22.12.0';

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
 * extension. Supported types are `js`, `cjs`, `json`, and `yaml`. On Node
 * 22.12 or newer, `mjs`, `ts`, `mts`, and `cts` are also supported via
 * Node's synchronous require(esm); the `.ts` variants additionally rely on
 * Node's native --experimental-strip-types (on by default on Node 23.6+).
 * Top-level `await` in an ESM config is not supported: it will throw
 * ERR_REQUIRE_ASYNC_MODULE.
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
        return require(file);
      case 'mjs':
      case 'ts':
      case 'mts':
      case 'cts': {
        if (!semver.gte(process.version, REQUIRE_ESM_MIN_NODE)) {
          throw new Error(
            `Loading a .${fileType} testem config requires Node ${REQUIRE_ESM_MIN_NODE} or newer (currently running ${process.version}).`,
          );
        }
        const mod = require(file);
        // require(esm) returns a Module namespace object with a `default`
        // property; unwrap it so the caller sees the same shape as it would
        // from require('./testem.js'). Plain CJS (.cts written as CommonJS)
        // has neither marker and is returned as-is.
        return mod && mod.__esModule && 'default' in mod ? mod.default : mod;
      }
      case 'json':
        return fs.readJsonSync(file);
      case 'yaml':
        return yaml.load(fs.readFileSync(file));
      default:
        throw new Error(`Unrecognized file extension for: ${file}`);
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
