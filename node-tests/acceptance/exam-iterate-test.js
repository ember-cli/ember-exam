'use strict';

const assert = require('assert');
const { rimrafSync } = require('rimraf');
const fs = require('fs-extra');
const path = require('path');

function assertExpectRejection() {
  assert.ok(false, 'Expected promise to reject, but it fullfilled');
}

async function execa(command, args) {
  const { execa: originalExeca } = await import('execa');
  return originalExeca(command, args);
}

describe('Acceptance | Exam Iterate Command', function () {
  this.timeout(300000);

  it('should build the app, test it a number of times, and clean it up', function () {
    return execa('ember', ['exam:iterate', '2']).then((child) => {
      const stdout = child.stdout;
      assert.ok(
        stdout.includes('Building app for test iterations.'),
        'Logged building message from command',
      );
      assert.ok(
        stdout.includes('Built project successfully.'),
        'Built successfully according to Ember-CLI',
      );

      assert.ok(
        stdout.includes('Running iteration #1.'),
        'Logs first iteration',
      );
      assert.ok(
        stdout.includes('Running iteration #2.'),
        'Logs second iteration',
      );

      const seedRE = /Randomizing tests with seed: (.*)/g;

      const firstSeed = seedRE.exec(stdout)[1];
      const secondSeed = seedRE.exec(stdout)[1];

      assert.ok(firstSeed, 'first seed exists');
      assert.ok(secondSeed, 'second seed exists');
      assert.notEqual(
        firstSeed,
        secondSeed,
        'the first and second seeds are not the same',
      );

      assert.ok(
        stdout.includes('Cleaning up test iterations.'),
        'Logged cleaning up message from command',
      );
      assert.throws(
        () => fs.accessSync('iteration-dist', fs.F_OK),
        'iteration-dist is cleaned up',
      );
    });
  });

  it('should test the app with additional options passed in and catch failure cases', function () {
    const execution = execa('ember', [
      'exam:iterate',
      '2',
      '--options',
      '--parallel',
    ]);
    return execution.then(assertExpectRejection, (error) => {
      const splitErrorRE =
        /You must specify the `split` option in order to run your tests in parallel./g;

      assert.ok(
        splitErrorRE.test(error.stderr),
        'expected stderr to contain the appropriate error message',
      );
      assert.strictEqual(error.exitCode, 1);
      assert.strictEqual(error.failed, true);
      assert.strictEqual(error.killed, false);
    });
  });

  describe('building', function () {
    const buildDir = path.join(process.cwd(), 'dist');

    afterEach(() => rimrafSync(buildDir));

    it('should not build the app or clean it up, but use an existing build to test', function () {
      return execa('ember', ['build']).then(() => {
        execa('ember', ['exam:iterate', '2', '--path', 'dist']).then(
          (child) => {
            const stdout = child.stdout;

            assert.ok(
              !stdout.includes('Building app for test iterations.'),
              'No logged building message from command',
            );
            assert.ok(
              !stdout.includes('Built project successfully.'),
              'Not built successfully according to Ember-CLI',
            );

            assert.ok(
              stdout.includes('Running iteration #1.'),
              'Logs first iteration',
            );
            assert.ok(
              stdout.includes('Running iteration #2.'),
              'Logs second iteration',
            );

            const seedRE = /Randomizing tests with seed: (.*)/g;

            const firstSeed = seedRE.exec(stdout)[1];
            const secondSeed = seedRE.exec(stdout)[1];

            assert.ok(firstSeed, 'first seed exists');
            assert.ok(secondSeed, 'second seed exists');
            assert.notEqual(
              firstSeed,
              secondSeed,
              'the first and second seeds are not the same',
            );

            assert.ok(
              !stdout.includes('Cleaning up test iterations.'),
              'No logged cleaning up message from command',
            );
            assert.throws(
              () => fs.accessSync('iteration-dist', fs.F_OK),
              'iteration-dist is non-existent',
            );

            assert.doesNotThrow(
              () => fs.accessSync(buildDir, fs.F_OK),
              'dist is not cleaned up',
            );
          },
        );
      });
    });
  });

  describe('Exit Code', function () {
    const destPath = path.join(
      __dirname,
      '..',
      '..',
      'tests',
      'unit',
      'failing-test.js',
    );

    beforeEach(function () {
      const failingTestPath = path.join(
        __dirname,
        '..',
        'fixtures',
        'failure.js',
      );
      fs.copySync(failingTestPath, destPath);
    });

    afterEach(function () {
      fs.removeSync(destPath);
    });

    it('should have an exitCode of 1 when a test fails', function () {
      return execa('ember', ['exam:iterate', '1']).then(
        assertExpectRejection,
        (error) => {
          assert.strictEqual(error.exitCode, 1);
          assert.strictEqual(error.killed, false);
        },
      );
    });
  });
});
