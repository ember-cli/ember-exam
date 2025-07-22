const path = require('path');
const assert = require('assert');

const { rimrafSync } = require('rimraf');
const {
  ROOT,
  execa,
  getNumberOfTests,
  applyFixture,
} = require('../../helpers.js');

const DIR = path.resolve(ROOT, 'test-apps/vite-with-compat');
const TEST_OUTPUT_DIR = 'dist-acceptance';

describe('Command | exam | vite | eager', function () {
  this.timeout(300000);

  before(function () {
    // Cleanup any previous runs
    rimrafSync(TEST_OUTPUT_DIR);

    applyFixture({
      fixture: 'vite-eager-test-load.html',
      to: path.join(DIR, 'tests/index.html'),
    });

    // Build the app
    return execa('pnpm', ['build:tests', '--outDir', TEST_OUTPUT_DIR], {
      cwd: DIR,
    });
  });

  after(function () {
    rimrafSync(TEST_OUTPUT_DIR);
  });

  describe('split', function () {
    // NOTE: Parallel can't work, because we end up running all tests, due to them all being loaded
    describe('parallel', function () {
      it('has no shared tests between partitions', async function () {
        let resultA = await execa(
          'ember',
          [
            'exam',
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

        assert.strictEqual(getNumberOfTests(resultA.stdout), 6);
        assert.strictEqual(resultA.stdout.includes('Suite A'), true);
        assert.strictEqual(resultA.stdout.includes('Suite B'), false);

        // Duplicate
        assert.strictEqual(getNumberOfTests(resultB.stdout), 6);
        assert.strictEqual(resultB.stdout.includes('Suite B'), true);
        assert.strictEqual(resultB.stdout.includes('Suite A'), false);
      });
    });
  });
});
