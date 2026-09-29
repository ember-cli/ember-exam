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

// require(esm) is stable in Node 22.12.
const ESM_REQUIRE_MIN_NODE = '22.12.0';
// TypeScript strip-types is on by default in Node 23.6.
// Node 22.6 to 23.5 also strips types with --experimental-strip-types.
const STRIP_TYPES_MIN_NODE = '23.6.0';

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
 * Always supported: `js`, `cjs`, `json`, `yaml`.
 * Node 22.12+ (require(esm) is stable): `mjs`.
 * Node 23.6+ (TypeScript strip-types on by default): `ts`, `mts`, `cts`.
 *
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
        return require(file);
      case 'mjs': {
        if (!semver.gte(process.version, ESM_REQUIRE_MIN_NODE)) {
          throw new Error(
            `Loading a .mjs testem config requires Node ${ESM_REQUIRE_MIN_NODE} or newer. Currently running ${process.version}.`,
          );
        }
        return _unwrapEsmDefault(require(file));
      }
      case 'ts':
      case 'mts':
      case 'cts': {
        if (!semver.gte(process.version, STRIP_TYPES_MIN_NODE)) {
          throw new Error(
            `Loading a .${fileType} testem config requires Node ${STRIP_TYPES_MIN_NODE} or newer. Currently running ${process.version}. Older Node (22.6+) also works if --experimental-strip-types is passed.`,
          );
        }
        return _unwrapEsmDefault(require(file));
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

// require(esm) returns a Module namespace with a `default` property.
// Unwrap it so the caller sees the same shape as require('./testem.js').
// Plain CJS returned from a `.cts` file has neither marker and passes through.
function _unwrapEsmDefault(mod) {
  return mod && mod.__esModule && 'default' in mod ? mod.default : mod;
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
