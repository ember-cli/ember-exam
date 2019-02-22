'use strict';

const assert = require('assert');
const execa = require('execa');
const fixturify = require('fixturify');
const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');

function assertExpectRejection() {
  assert.ok(false, 'Expected promise to reject, but it fullfilled');
}

function getNumberOfTests(str) {
  const match = str.match(/# tests ([0-9]+)/);
  return match && parseInt(match[1], 10);
}

const TOTAL_NUM_TESTS = 47; // Total Number of tests without the global "Ember.onerror validation tests"

function getTotalNumberOfTests(output) {
  // In ember-qunit 3.4.0, this new check was added: https://github.com/emberjs/ember-qunit/commit/a7e93c4b4b535dae62fed992b46c00b62bfc83f4
  // which adds this Ember.onerror validation test.
  // As Ember.onerror validation test is added per browser the total number of tests executed should be the sum of TOTAL_NUM_TESTS defined and a number of browsers.
  const emberOnerror = output.match(/ember-qunit: Ember.onerror validation: Ember.onerror is functioning properly/g)
  return TOTAL_NUM_TESTS + (emberOnerror? emberOnerror.length : 0);
}

describe('Acceptance | Exam Command', function() {
  this.timeout(300000);

  before(function() {
    // Cleanup any previous runs
    rimraf.sync('acceptance-dist');

    // Build the app
    return execa('ember', ['build', '--output-path', 'acceptance-dist']);
  });

  after(function() {
    rimraf.sync('acceptance-dist');
  });

  function assertOutput(output, text, good, bad) {
    good.forEach(function(partition) {
      assert.ok(output.includes(`${text} ${partition} `), `output has ${text} ${partition}`);
    });

    (bad || []).forEach(function(partition) {
      assert.ok(!output.includes(`${text} ${partition} `), `output does not have ${text} ${partition}`);
    });
  }

  function assertAllPartitions(output) {
    assertOutput(output, 'Exam Partition', [1, 2, 3]);
    assert.equal(getNumberOfTests(output), getTotalNumberOfTests(output), 'ran all of the tests in the suite');
  }

  function assertSomePartitions(output, good, bad) {
    assertOutput(output, 'Exam Partition', good, bad);
    assert.ok(getNumberOfTests(output) < getTotalNumberOfTests(output), 'did not run all of the tests in the suite');
  }

  it('runs all tests normally', function() {
    return execa('ember', ['exam', '--path', 'acceptance-dist']).then(child => {
      const stdout = child.stdout;
      assert.ok(!stdout.includes('Exam Partition'), 'does not add any sort of partition info');
      assert.equal(getNumberOfTests(stdout), getTotalNumberOfTests(stdout), 'ran all of the tests in the suite');
    });
  });

  describe('Split', function() {
    it('splits the test suite but only runs the first partition', function() {
      return execa('ember', ['exam', '--split', '3', '--path', 'acceptance-dist']).then(child => {
        assertSomePartitions(child.stdout, [1], [2, 3]);
      });
    });

    describe('Partition', function() {
      it('splits the test suite and runs a specified partition', function() {
        return execa('ember', ['exam', '--split', '3', '--partition', '2', '--path', 'acceptance-dist']).then(child => {
          assertSomePartitions(child.stdout, [2], [1, 3]);
        });
      });

      it('splits the test suite and runs multiple specified partitions', function() {
        return execa('ember', ['exam', '--split', '3', '--partition', '1,3', '--path', 'acceptance-dist']).then(child => {
          assertSomePartitions(child.stdout, ['1,3'], [1, 2, 3]);
        });
      });

      it('errors when running an invalid partition', function() {
        return execa('ember', ['exam', '--split', '3','--partition', '4', '--path', 'acceptance-dist']).then(assertExpectRejection, error => {
          assert.ok(error.message.includes('You must specify \'partition\' values that are less than or equal to your \'split\' value.'));
        });
      });

      it('errors when specifying a partition but no split count', function() {
        return execa('ember', ['exam', '--partition', '2', '--path', 'acceptance-dist']).then(assertExpectRejection, error => {
          assert.ok(error.message.includes('You must specify a \'split\' value in order to use \'partition\'.'));
        });
      });
    });

    describe('Parallel', function() {
      it('runs multiple partitions in parallel', function() {
        return execa('ember', ['exam', '--path', 'acceptance-dist', '--split', '3', '--parallel']).then(child => {
          assertAllPartitions(child.stdout);
        });
      });

      it('runs multiple specified partitions in parallel', function() {
        return execa('ember', ['exam', '--split', '3', '--partition', '1,3', '--path', 'acceptance-dist', '--parallel']).then(child => {
          assertSomePartitions(child.stdout, [1, 3], [2]);
        });
      });
    });
  });

  describe('Random', function() {
    it('runs tests with the passed in seeds', function() {
      return execa('ember', ['exam', '--random', '1337', '--path', 'acceptance-dist']).then(child => {
        const stdout = child.stdout;
        assert.ok(stdout.includes('Randomizing tests with seed: 1337'), 'logged the seed value');
        assert.equal(getNumberOfTests(stdout), getTotalNumberOfTests(stdout), 'ran all of the tests in the suite');
      });
    });
  });

  describe('Load Balance', function() {
    const unlinkFiles = [];

    function assertTestExecutionJson(output) {
      let testExecutionJsonPath = path.join(process.cwd(), output.match(/test-execution-([0-9]*).json/g)[0]);
      assert.ok(fs.existsSync(testExecutionJsonPath), 'test execution json written to root');
      unlinkFiles.push(testExecutionJsonPath);
    }

    afterEach(() => {
      unlinkFiles.forEach((path) => {
        fs.unlinkSync(path);
      });

      unlinkFiles.length = 0;
    });

    it('errors if `--parallel` is not passed', function() {
      return execa('ember', ['exam', '--path', 'acceptance-dist', '--load-balance']).then(assertExpectRejection, error => {
        assert.ok(error.message.includes('You should specify the number of browsers to load-balance against using `parallel` when using `load-balance`.'));
      });
    });

    it('load balances the test suite with one browser', function() {
      return execa('ember', ['exam', '--path', 'acceptance-dist', '--load-balance', '--parallel']).then(child => {
        const output = child.stdout;
        assertTestExecutionJson(output);
        assertOutput(output, 'Browser Id', [1]);
        assert.equal(getNumberOfTests(output), getTotalNumberOfTests(output), 'ran all of the tests in the suite');
      });
    });

    it('load balances the test suite with 3 browsers', function() {
      return execa('ember', ['exam', '--path', 'acceptance-dist', '--load-balance', '--parallel', '3']).then(child => {
        const output = child.stdout;
        assertTestExecutionJson(output);
        assertOutput(output, 'Browser Id', [1, 2, 3]);
        assert.equal(getNumberOfTests(output), getTotalNumberOfTests(output), 'ran all of the tests in the suite');
      });
    });

    it('load balances partition 1\'s test suite with 3 browsers', function() {
      return execa('ember', ['exam', '--path', 'acceptance-dist', '--load-balance', '--split', '2', '--partition', '1', '--parallel', '3']).then(child => {
        const output = child.stdout;
        assertTestExecutionJson(output);
        assertOutput(output, 'Exam Partition', [1], [2]);
        assertOutput(output, 'Browser Id', [1, 2, 3]);
        assert.ok(getNumberOfTests(output) < getTotalNumberOfTests(output), 'did not run all of the tests in the suite');
      });
    });

    describe('Failure Cases', function() {
      const destPath = path.join(__dirname, '..', '..', 'tests', 'unit', 'browser-exit-test.js');
      beforeEach(function() {
        const failingTestPath = path.join(__dirname, '..', 'fixtures', 'browser-exit.js');
        fs.copySync(failingTestPath, destPath);
        return execa('ember', ['build', '--output-path', 'failure-dist']);
      });

      afterEach(function() {
        rimraf.sync('failure-dist');
        fs.removeSync(destPath);
      });

      it('should write test-execution json when browser exits', function() {
        return execa('ember', ['exam', '--path', 'failure-dist', '--load-balance', '--parallel', '2']).then(assertExpectRejection, error => {
          assert.ok(error.message.includes('Error: Browser exited on request from test driver'), `browser exited during the test execution:\n${error.message}`);
          assertTestExecutionJson(error.message);
        });
      });
    });
  });

  describe('Replay Execution', function() {
    let testExecutionJson = {}

    beforeEach(() => {
      testExecutionJson = {
        "numberOfBrowsers": 2,
        "failedBrowsers": [],
        "executionMapping": {
            "1": [
                "ember-test",
                "dummy/tests/unit/qunit/test-loader-test",
                "dummy/tests/unit/qunit/multiple-edge-cases-test",
                "dummy/tests/unit/qunit/multiple-ember-tests-test"
            ],
            "2": [
                "dummy/tests/unit/qunit/multiple-tests-test",
                "dummy/tests/unit/qunit/testem-output-test",
                "dummy/tests/unit/qunit/weight-test-modules-test"
            ]
        }
      };
    });

    afterEach(() => {
      fs.unlinkSync(path.join(process.cwd(), 'test-execution-123.json'));
    });

    it('replay only the failed browsers defined in failedBrowsers array', function() {
      testExecutionJson.failedBrowsers.push(1);
      fixturify.writeSync(process.cwd(), {
        'test-execution-123.json': JSON.stringify(testExecutionJson)
      });

      return execa('ember', ['exam', '--replay-execution', 'test-execution-123.json', '--path', 'acceptance-dist']).then(child => {
        const output = child.stdout;
        assert.equal(output.match(/test-execution-([0-9]*).json/g), null, 'no test execution json should be written');

        assertOutput(output, 'Browser Id', [1]);
        assert.equal(getNumberOfTests(output), 26, 'ran all of the tests for browser one');
      });
    });

    it('replay the full execution if failedBrowsers is empty', function() {
      fixturify.writeSync(process.cwd(), {
        'test-execution-123.json': JSON.stringify(testExecutionJson)
      });

      return execa('ember', ['exam', '--replay-execution', 'test-execution-123.json', '--path', 'acceptance-dist']).then(child => {
        const output = child.stdout;
        assert.equal(output.match(/test-execution-([0-9]*).json/g), null, 'no test execution json should be written');

        assertOutput(output, 'Browser Id', [1, 2]);
        assert.equal(getNumberOfTests(output), getTotalNumberOfTests(output), 'ran all of the tests in the suite');
      });
    });

    it('replay only the specified execution by --replay-browser', function() {
      fixturify.writeSync(process.cwd(), {
        'test-execution-123.json': JSON.stringify(testExecutionJson)
      });

      return execa('ember', ['exam', '--replay-execution', 'test-execution-123.json', '--replay-browser', '2', '--path', 'acceptance-dist']).then(child => {
        const output = child.stdout;
        assert.equal(output.match(/test-execution-([0-9]*).json/g), null, 'no test execution json should be written');

        assertOutput(output, 'Browser Id', [2]);
        assert.equal(getNumberOfTests(output), 16, 'ran all of the tests for browser two');
      });
    });
  });
});
