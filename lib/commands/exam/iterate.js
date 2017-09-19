'use strict';

module.exports = {
  name: 'exam:iterate',

  description: 'Runs your app\'s test suite in a random order for a number of iterations with the \'exam\' command.',

  works: 'insideProject',

  anonymousOptions: [
    '<iterations>'
  ],

  availableOptions: [
    { name: 'options', type: String, default: '', description: 'A string of options to passthrough to the exam command' },
    { name: 'path',    type: String, default: '', description: 'The output path of a previous build to run tests against' }
  ],

  /**
   * The output directory of the build used to run the test iterations.
   *
   * @type {String}
   */
  _outputDir: 'iteration-dist',

  /**
   * Runs `ember exam` with random seeds for a number of iterations. The results
   * of each run are displayed in a table at the end of the command. This is
   * useful for pre-emptively identifying flaky/non-atomic tests in an offline
   * job.
   *
   * @override
   */
  run: function(commandOptions, anonymousOptions) {
    var needsBuild = !commandOptions.path;

    if (needsBuild) {
      this._buildForTests();
    } else {
      this._outputDir = commandOptions.path;
    }

    var numIterations = parseInt(anonymousOptions[0], 10);
    var options = commandOptions.options;
    var results = this._runIterations(numIterations, options);

    if (needsBuild) {
      this._cleanupBuild();
    }

    this._write(results.toString(), true);
  },

  /**
   * Writes out a line with a standard color, unless specifically turned off.
   *
   * @param {String} input
   * @param {Boolean} noColor
   */
  _write: function(input, noColor) {
    if (!noColor) {
      var chalk = require('chalk');
      input = chalk.blue(input);
    }

    console.info(input); // eslint-disable-line no-console
  },

  /**
   * Builds the application into a special output directory to run the tests
   * against repeatedly without rebuilding.
   */
  _buildForTests: function() {
    var execSync = require('child_process').execSync;

    this._write('\nBuilding app for test iterations.');
    execSync('./node_modules/.bin/ember build --output-path ' + this._outputDir, { stdio: 'inherit' });
  },

  /**
   * Cleans up the build artifacts used for the test iterations.
   */
  _cleanupBuild: function() {
    var rimraf = require('rimraf');

    this._write('\nCleaning up test iterations.\n');
    rimraf.sync(this._outputDir);
  },

  /**
   * Runs iterations of the test suite and returns a table to display the
   * results.
   *
   * @param {Number} numIterations
   * @param {String} options
   * @return {Table} results
   */
  _runIterations: function(numIterations, options) {
    var chalk = require('chalk');
    var Table = require('cli-table2');

    var results = new Table({
      head: [
        chalk.blue('Iteration'),
        chalk.blue('Seed'),
        chalk.blue('Exit Code'),
        chalk.blue('Command')
      ]
    });

    for (var i = 0; i < numIterations; i++) {
      this._write('\nRunning iteration #' + (i + 1) + '.');
      results.push([i].concat(this._runTests(options)));
    }

    this._write('\nRan ' + numIterations + ' iterations.');

    return results;
  },

  /**
   * Runs the test suite in a random order while allowing additional options.
   * Returns an array representing a row in the result table for _runIterations.
   *
   * @param {String} options
   * @return {Array} results
   */
  _runTests: function(options) {
    var chalk = require('chalk');
    var execSync = require('child_process').execSync;

    var seed = Math.random().toString(36).slice(2);
    var command = './node_modules/.bin/ember exam --random ' + seed + ' --path ' + this._outputDir + ' ' + options;
    var exitCode;

    try {
      execSync(command, { stdio: 'inherit' });
      exitCode = 0;
    } catch (error) {
      this._write('Returned non-zero exit code with error: ' + error);
      exitCode = 1;
      process.exitCode = 1;
    }

    var color = exitCode ? chalk.red : chalk.green;
    return [
      color(seed),
      color(exitCode),
      color(command)
    ];
  }
};
