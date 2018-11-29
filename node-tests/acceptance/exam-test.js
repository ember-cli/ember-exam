'use strict';

const assert = require('assert');
const rimraf = require('rimraf');
const execa = require('execa');

function assertExpectRejection() {
  assert.ok(false, 'Expected promise to reject, but it fullfilled');
}

function getNumberOfTests(str) {
  const match = str.match(/# tests ([0-9]+)/);
  return match && parseInt(match[1], 10);
}

const TOTAL_NUM_TESTS = 56; // Total Number of tests without the global "Ember.onerror validation tests"

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

  function assertPartitions(output, good, bad) {
    good.forEach(function(partition) {
      assert.ok(output.includes('Exam Partition ' + partition + ' '), 'output has Partition ' + partition);
    });

    (bad || []).forEach(function(partition) {
      assert.ok(!output.includes('Exam Partition ' + partition + ' '), 'output does not have Partition ' + partition);
    });
  }

  function assertAllPartitions(output) {
    assertPartitions(output, [1, 2, 3]);
    assert.equal(getNumberOfTests(output), getTotalNumberOfTests(output), 'ran all of the tests in the suite');
  }

  function assertSomePartitions(output, good, bad) {
    assertPartitions(output, good, bad);
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
        return execa('ember', ['exam', '--split', '3', '--partition', '1', '--partition', '3', '--path', 'acceptance-dist']).then(child => {
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
        return execa('ember', ['exam', '--split', '3', '--parallel', '--path', 'acceptance-dist']).then(child => {
          assertAllPartitions(child.stdout);
        });
      });

      it('runs multiple specified partitions in parallel', function() {
        return execa('ember', ['exam', '--split', '3', '--parallel', '--partition', '1', '--partition', '3', '--path', 'acceptance-dist']).then(child => {
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
});
