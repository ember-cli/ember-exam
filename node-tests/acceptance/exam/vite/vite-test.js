const path = require('path');
const assert = require('assert');

const { rimrafSync } = require('rimraf');
const { ROOT, execa, getNumberOfTests } = require('../../helpers.js');

const DIR = path.resolve(ROOT, 'test-apps/vite-with-compat');
const TEST_OUTPUT_DIR = 'dist-acceptance';

describe('Command | exam | vite', function () {
  this.timeout(300000);

  before(function () {
    // Cleanup any previous runs
    rimrafSync(TEST_OUTPUT_DIR);

    // Build the app
    return execa('pnpm', ['build:tests', '--outDir', TEST_OUTPUT_DIR], {
      cwd: DIR,
    });
  });

  after(function () {
    rimrafSync(TEST_OUTPUT_DIR);
  });

  describe('without exam', function () {
    it('has passing tests with just testem', async function () {
      let result = await execa('testem', ['ci'], {
        cwd: DIR,
        env: {
          TESTEM_DIR: TEST_OUTPUT_DIR,
        },
      });

      assert.strictEqual(getNumberOfTests(result.stdout), 6);
      assert.strictEqual(result.stdout.includes('Suite A'), true);
      assert.strictEqual(result.stdout.includes('Suite B'), true);
    });
  });

  describe('split', function () {
    describe('parallel', function () {
      it('has no shared tests between partitions', async function () {
        let resultA = await execa(
          'ember',
          [
            'exam',
            '--test-port',
            '1337',
            '--split',
            '2',
            '--partition',
            '1',
            '--path',
            TEST_OUTPUT_DIR,
            '--parallel',
          ],
          { cwd: DIR },
        );

        let resultB = await execa(
          'ember',
          [
            'exam',
            '--test-port',
            '1338',
            '--split',
            '2',
            '--partition',
            '2',
            '--path',
            TEST_OUTPUT_DIR,
            '--parallel',
          ],
          { cwd: DIR },
        );

        assert.strictEqual(getNumberOfTests(resultA.stdout), 3);
        assert.strictEqual(resultA.stdout.includes('Suite A'), true);
        assert.strictEqual(resultA.stdout.includes('Suite B'), false);

        assert.strictEqual(getNumberOfTests(resultB.stdout), 3);
        assert.strictEqual(resultB.stdout.includes('Suite B'), true);
        assert.strictEqual(resultB.stdout.includes('Suite A'), false);
      });
    });
  });

  describe('loadBalance', function () {
    it('has no shared tests between partitions', async function () {
      let result = await execa(
        'ember',
        [
          'exam',
          '--test-port',
          '1339',
          '--load-balance',
          '--path',
          TEST_OUTPUT_DIR,
          '--parallel',
          '2',
        ],
        { cwd: DIR },
      );

      assert.strictEqual(getNumberOfTests(result.stdout), 6);
      assert.strictEqual(result.stdout.includes('Suite A'), true);
      assert.strictEqual(result.stdout.includes('Suite B'), true);
    });
  });
});
