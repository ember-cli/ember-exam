'use strict';

const fs = require('fs-extra');
const SilentError = require('silent-error');
const semver = require('semver');

/**
 * Validates the specified partitions
 *
 * @private
 * @param {Array<Number>} partitions
 * @param {Number} split
 */
function validatePartitions(partitions, split) {
  validatePartitionSplit(partitions, split);
  validateElementsUnique(partitions, 'partition');
}

/**
 * Returns thr number of browsers defined within the test execution file.
 *
 * @param {*} fileName
 */
function getNumberOfBrowser(fileName) {
  const executionJson = fs.readJsonSync(fileName);
  return executionJson.numberOfBrowsers;
}

/**
 * Validates the specified replay-browser
 *
 * @param {String} replayExecution
 * @param {Array<Number>} replayBrowser
 */
function validateReplayBrowser(replayExecution, replayBrowser) {
  if (!replayExecution) {
    throw new SilentError(
      'EmberExam: You must specify replay-execution when using the replay-browser option.'
    );
  }

  const numberOfBrowsers = getNumberOfBrowser(replayExecution);

  for (const i in replayBrowser) {
    const browserId = replayBrowser[i];
    if (browserId < 1) {
      throw new SilentError(
        'EmberExam: You must specify replay-browser values greater than or equal to 1.'
      );
    }
    if (browserId > numberOfBrowsers) {
      throw new SilentError(
        'EmberExam: You must specify replayBrowser value smaller than a number of browsers in the specified json file.'
      );
    }
  }

  validateElementsUnique(replayBrowser, 'replayBrowser');
}

/**
 * Determines if the specified partitions value makes sense for a given split.
 *
 * @private
 * @param {Array<Number>} partitions
 * @param {Number} split
 */
function validatePartitionSplit(partitions, split) {
  if (!split) {
    throw new SilentError(
      'EmberExam: You must specify a `split` value in order to use `partition`.'
    );
  }

  for (let i = 0; i < partitions.length; i++) {
    const partition = partitions[i];
    if (partition < 1) {
      throw new SilentError(
        'EmberExam: Split tests are one-indexed, so you must specify partition values greater than or equal to 1.'
      );
    }
    if (partition > split) {
      throw new SilentError(
        'EmberExam: You must specify `partition` values that are less than or equal to your `split` value.'
      );
    }
  }
}

/**
 * Ensures that there is no value duplicated in a given array.
 *
 * @private
 * @param {Array} arr
 * @param {String} typeOfValue
 */
function validateElementsUnique(arr, typeOfValue) {
  const sorted = arr.slice().sort();
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] === sorted[i + 1]) {
      const errorMsg = `EmberExam: You cannot specify the same ${typeOfValue} value twice. ${
        sorted[i]
      } is repeated.`;
      throw new SilentError(errorMsg);
    }
  }
}

/**
 * Performs logic related to validating command options for testing and
 * determining which functions to run on the tests.
 *
 * @class TestsOptionsValidator
 */
module.exports = class TestsOptionsValidator {
  constructor(options, framework, emberCliVersion) {
    this.options = options;
    this.framework = framework;
    this.emberCliVersion = emberCliVersion;
  }

  /**
   * Validates the command and returns a map of the options and whether they are enabled or not.
   *
   * @public
   * @return {Object} Map of the options and whether they are enabled or not.
   */
  validateCommands() {
    const validatedOptions = new Map();
    if (this.options.writeModuleMetadataFile) {
      validatedOptions.set(
        'writeModuleMetadataFile',
        true
      );
    }

    if (this.options.split || this.options.partition) {
      validatedOptions.set('split', this.validateSplit());
    }

    // The parallel option accepts a number, which can be 0
    if (typeof this.options.parallel !== 'undefined') {
      validatedOptions.set('parallel', this.validateParallel());
    }

    // As random option can be an empty string it should check a type of random option rather than the option is not empty.
    if (typeof this.options.random !== 'undefined') {
      validatedOptions.set('random', this.validateRandom());
    }

    if (typeof this.options.writeExecutionFile !== 'undefined') {
      validatedOptions.set(
        'writeExecutionFile',
        this.validateWriteExecutionFile()
      );
    }

    if (this.options.loadBalance) {
      validatedOptions.set('loadBalance', this.validateLoadBalance());
    }

    if (this.options.replayExecution || this.options.replayBrowser) {
      validatedOptions.set('replayExecution', this.validateReplayExecution());
    }

    return validatedOptions;
  }

  /**
   * Determines if we should split the tests file and validates associated options
   * (`split`, `partition`).
   *
   * @return {boolean}
   */
  validateSplit() {
    const options = this.options;
    let split = options.split;

    if (typeof split !== 'undefined' && split < 2) {
      // eslint-disable-next-line no-console
      console.warn(
        'You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `split`.'
      );
      split = 1;
    }

    if (
      typeof split !== 'undefined' &&
      typeof this.options.replayBrowser !== 'undefined'
    ) {
      throw new SilentError(
        'EmberExam: You must not use the `replay-browser` option with the `split` option.'
      );
    }

    if (typeof split !== 'undefined' && this.options.replayExecution) {
      throw new SilentError(
        'EmberExam: You must not use the `replay-execution` option with the `split` option.'
      );
    }

    const partitions = options.partition;

    if (typeof partitions !== 'undefined') {
      validatePartitions(partitions, split);
    }

    return !!split;
  }

  /**
   * Determines if we should randomize the tests and validates associated options
   * (`random`).
   *
   * @return {boolean}
   */
  validateRandom() {
    const shouldRandomize = typeof this.options.random === 'string';

    if (shouldRandomize && this.framework === 'mocha') {
      // eslint-disable-next-line no-console
      console.warn(
        'Mocha does not currently support randomizing test order, so tests will run in normal order. Please see https://github.com/mochajs/mocha/issues/902 for more info.'
      );
    }

    return shouldRandomize;
  }

  /**
   * Determines if a test execution json file should be written after running a test suite and validates associated
   *
   *  @return {boolean}
   */
  validateWriteExecutionFile() {
    if (!this.options.writeExecutionFile) {
      return false;
    }

    if (!this.options.loadBalance) {
      throw new SilentError(
        'EmberExam: You must run test suite with the `load-balance` option in order to use the `write-execution-file` option.'
      );
    } else if (this.options.launch === 'false') {
      //When `--no-launch` option is passed, a value for launch in testem config is set to be string false.
      throw new SilentError(
        'EmberExam: You must not use no-launch with write-execution-file option.'
      );
    }

    return true;
  }

  /**
   * Determines if we should run split tests in parallel and validates associated
   * options (`parallel`).
   *
   * @return {boolean}
   */
  validateParallel() {
    const parallelValue = parseInt(this.options.parallel, 10);

    if (isNaN(parallelValue)) {
      throw new SilentError(
        `EmberExam: You must specify a Numeric value to 'parallel'. Value passed: ${this.options.parallel}`
      );
    }
    this.options.parallel = parallelValue;

    if (typeof this.options.replayBrowser !== 'undefined') {
      throw new SilentError(
        'EmberExam: You must not use the `replay-browser` option with the `parallel` option.'
      );
    }

    if (this.options.replayExecution) {
      throw new SilentError(
        'EmberExam: You must not use the `replay-execution` option with the `parallel` option.'
      );
    }

    if (!this.options.loadBalance) {
      if (!this.options.split) {
        throw new SilentError(
          'EmberExam: You must specify the `split` option in order to run your tests in parallel.'
        );
      } else if (this.options.parallel !== 1) {
        throw new SilentError(
          'EmberExam: When used with `split` or `partition`, `parallel` does not accept a value other than 1.'
        );
      }
    }

    if (this.options.parallel < 1) {
      throw new SilentError(
        'EmberExam: You must specify a value greater than 1 to `parallel`.'
      );
    }

    return true;
  }

  /**
   * Determines if we should run tests in load balance mode.
   * options (`load-balance`).
   *
   * @return {boolean}
   */
  validateLoadBalance() {
    // It's required to use ember-cli version 3.2.0 or greater to support the `load-balance` feature.
    const emberCliVersionRange = semver.validRange(this.emberCliVersion);
    if (semver.gtr('3.2.0', emberCliVersionRange)) {
      throw new SilentError(
        'EmberExam: You must be using ember-cli version ^3.2.0 for this feature to work properly.'
      );
    }

    if (typeof this.options.replayBrowser !== 'undefined') {
      throw new SilentError(
        'EmberExam: You must not use the `replay-browser` option with the `load-balance` option.'
      );
    }

    if (this.options.replayExecution) {
      throw new SilentError(
        'EmberExam: You must not use the `replay-execution` option with the `load-balance` option.'
      );
    }

    //When `--no-launch` option is passed, a value for launch in testem config is set to be string false.
    if (this.options.launch === 'false') {
      throw new SilentError(
        'EmberExam: You must not use `no-launch` option with the `load-balance` option.'
      );
    }

    if (!this.options.parallel) {
      throw new SilentError(
        'EmberExam: You should specify the number of browsers to load-balance against using `parallel` when using `load-balance`.'
      );
    }

    return true;
  }

  /**
   * Determines if we should replay execution for reproduction.
   * options (`replay-execution`).
   *
   * @return {boolean}
   */
  validateReplayExecution() {
    const replayBrowser = this.options.replayBrowser;
    const replayExecution = this.options.replayExecution;

    if (!replayExecution) {
      return false;
    }

    if (this.options.launch === 'false') {
      throw new SilentError(
        'EmberExam: You must not use `no-launch` option with the `replay-execution` option.'
      );
    }

    if (replayBrowser) {
      validateReplayBrowser(replayExecution, replayBrowser, this.options);
    }

    return true;
  }
};
