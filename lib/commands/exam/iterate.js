'use strict';

module.exports = {
  name: 'exam:iterate',

  description:
    "Runs your app's test suite in a random order for a number of iterations with the 'exam' command.",

  works: 'insideProject',

  anonymousOptions: ['<iterations>'],

  availableOptions: [
    {
      name: 'options',
      type: String,
      default: '',
      description: 'A string of options to passthrough to the exam command',
    },
    {
      name: 'path',
      type: String,
      default: '',
      description: 'The output path of a previous build to run tests against',
    },
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
  async run(commandOptions, anonymousOptions) {
    const needsBuild = !commandOptions.path;

    if (needsBuild) {
      await this._buildForTests();
    } else {
      this._outputDir = commandOptions.path;
    }

    const numIterations = parseInt(anonymousOptions[0], 10);
    const options = commandOptions.options;
    const results = await this._runIterations(numIterations, options);

    if (needsBuild) {
      await this._cleanupBuild();
    }

    await this._write(results.toString(), true);
  },

  /**
   * Writes out a line with a standard color, unless specifically turned off.
   *
   * @param {String} input
   * @param {Boolean} noColor
   */
  async _write(input, noColor) {
    if (!noColor) {
      const chalk = (await import('chalk')).default;
      input = chalk.blue(input);
    }

    console.info(input); // eslint-disable-line no-console
  },

  /**
   * Builds the application into a special output directory to run the tests
   * against repeatedly without rebuilding.
   */
  async _buildForTests() {
    await this._write('\nBuilding app for test iterations.');
    const { execa } = await import('execa');
    await execa(
      './node_modules/.bin/ember',
      ['build', '--output-path', `${this._outputDir}`],
      { stdio: 'inherit' },
    );
  },

  /**
   * Cleans up the build artifacts used for the test iterations.
   */
  async _cleanupBuild() {
    await this._write('\nCleaning up test iterations.\n');
    const { execa } = await import('execa');
    await execa('rm', ['-rf', `${this._outputDir}`]);
  },

  /**
   * Runs iterations of the test suite and returns a table to display the
   * results.
   *
   * @param {Number} numIterations
   * @param {String} options
   * @return {Table} results
   */
  async _runIterations(numIterations, options) {
    const chalk = (await import('chalk')).default;
    const Table = require('cli-table3');

    const results = new Table({
      head: [
        chalk.blue('Iteration'),
        chalk.blue('Seed'),
        chalk.blue('Exit Code'),
        chalk.blue('Command'),
      ],
    });

    for (let i = 0; i < numIterations; i++) {
      await this._write('\nRunning iteration #' + (i + 1) + '.');
      const result = await this._runTests(options);
      results.push([i].concat(result));
    }

    await this._write('\nRan ' + numIterations + ' iterations.');

    return results;
  },

  /**
   * Runs the test suite in a random order while allowing additional options.
   * Returns an array representing a row in the result table for _runIterations.
   *
   * @param {String} options
   * @return {Array} results
   */
  async _runTests(options) {
    const chalk = (await import('chalk')).default;
    const execSync = require('child_process').execSync;

    const seed = Math.random().toString(36).slice(2);
    const command =
      './node_modules/.bin/ember exam --random ' +
      seed +
      ' --path ' +
      this._outputDir +
      ' ' +
      options;
    let exitCode;

    try {
      execSync(command, { stdio: 'inherit' });
      exitCode = 0;
    } catch (error) {
      await this._write('Returned non-zero exit code with error: ' + error);
      exitCode = 1;
      process.exitCode = 1;
    }

    const color = exitCode ? chalk.red : chalk.green;
    return [color(seed), color(exitCode), color(command)];
  },
};
