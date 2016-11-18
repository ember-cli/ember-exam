var assert = require('assert');
var exec = require('child_process').exec;
var rimraf = require('rimraf');

function contains(str, value) {
  return str.indexOf(value) !== -1;
}

function getNumberOfTests(str) {
  var match = str.match(/# tests ([0-9]+)/);
  return match ? parseInt(match[1], 10) : 0;
}

var TOTAL_NUM_TESTS = 45;

describe('Acceptance | Exam Command', function() {
  this.timeout(300000);

  before(function(done) {
    // Cleanup any previous runs
    rimraf.sync('acceptance-dist');

    // Build the app
    exec('ember build --output-path acceptance-dist', done);
  });

  after(function() {
    rimraf.sync('acceptance-dist');
  });

  function assertPartitions(output, good, bad) {
    good.forEach(function(partition) {
      assert.ok(contains(output, 'Exam Partition #' + partition + ' '), 'output has partition #' + partition);
    });

    (bad || []).forEach(function(partition) {
      assert.ok(!contains(output, 'Exam Partition #' + partition + ' '), 'output does not have partition #' + partition);
    });
  }

  function assertAllPartitions(output) {
    assertPartitions(output, [ 1, 2, 3 ]);
    assert.equal(getNumberOfTests(output), TOTAL_NUM_TESTS, 'ran all of the tests in the suite');
  }

  function assertSomePartitions(output, good, bad) {
    assertPartitions(output, good, bad);
    assert.ok(getNumberOfTests(output) < TOTAL_NUM_TESTS, 'did not run all of the tests in the suite');
  }

  it('runs all tests normally', function(done) {
    exec('ember exam --path acceptance-dist', function(_, stdout) {
      assert.ok(!contains(stdout, 'Exam Partition'), 'does not add any sort of partition info');
      assert.equal(getNumberOfTests(stdout), TOTAL_NUM_TESTS, 'ran all of the tests in the suite');
      done();
    });
  });

  describe('Split', function() {
    it('splits the test suite but only runs the first partition', function(done) {
      exec('ember exam --split 3 --path acceptance-dist', function(_, stdout) {
        assertSomePartitions(stdout, [ 1 ], [ 2, 3 ]);
        done();
      });
    });

    describe('Partition', function() {
      function execError(command, message, done) {
        exec(command, function(error) {
          assert.ok(contains(error.toString(), message), 'correct error was thrown');
          done();
        });
      }

      it('splits the test suite and runs a specified partition', function(done) {
        exec('ember exam --split 3 --partition 2 --path acceptance-dist', function(_, stdout) {
          assertSomePartitions(stdout, [ 2 ], [ 1, 3 ]);
          done();
        });
      });

      it('splits the test suite and runs multiple specified partitions', function(done) {
        exec('ember exam --split 3 --partition 1 --partition 3 --path acceptance-dist', function(_, stdout) {
          assertSomePartitions(stdout, [ '1,3' ], [ 1, 2, 3 ]);
          done();
        });
      });

      it('errors when running an invalid partition', function(done) {
        execError(
          'ember exam --split 3 --partition 4 --path acceptance-dist',
          'You must specify \'partition\' values that are less than or equal to your \'split\' value.',
          done
        );
      });

      it('errors when specifying a partition but no split count', function(done) {
        execError(
          'ember exam --partition 2 --path acceptance-dist',
          'You must specify a \'split\' value in order to use \'partition\'.',
          done
        );
      });
    });

    describe('Parallel', function() {
      it('runs multiple partitions in parallel', function(done) {
        exec('ember exam --split 3 --parallel --path acceptance-dist', function(_, stdout) {
          assertAllPartitions(stdout);
          done();
        });
      });

      it('runs multiple specified partitions in parallel', function(done) {
        exec('ember exam --split 3 --parallel --partition 1 --partition 3 --path acceptance-dist', function(_, stdout) {
          assertSomePartitions(stdout, [ 1, 3 ], [ 2 ]);
          done();
        });
      });
    });
  });

  describe('Random', function() {
    it('runs tests with the passed in seeds', function(done) {
      exec('ember exam --random 1337 --path acceptance-dist', function(_, stdout) {
        assert.ok(contains(stdout, 'Randomizing test with seed: 1337'), 'logged the seed value');
        assert.equal(getNumberOfTests(stdout), TOTAL_NUM_TESTS, 'ran all of the tests in the suite');
        done();
      });
    });
  });
});
