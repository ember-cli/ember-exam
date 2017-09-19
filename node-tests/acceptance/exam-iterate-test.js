var assert = require('assert');
var child_process = require('child_process');
var exec = child_process.exec;
var execSync = child_process.execSync;
var rimraf = require('rimraf');
var fs = require('fs-extra');
var path = require('path');

function contains(str, value) {
  return str.indexOf(value) !== -1;
}

describe('Acceptance | Exam Iterate Command', function() {
  this.timeout(300000);

  it('should build the app, test it a number of times, and clean it up', function(done) {
    exec('ember exam:iterate 2', function(_, stdout) {
      assert.ok(contains(stdout, 'Building app for test iterations.'), 'Logged building message from command');
      assert.ok(contains(stdout, 'Built project successfully.'), 'Built successfully according to Ember-CLI');

      assert.ok(contains(stdout, 'Running iteration #1.'), 'Logs first iteration');
      assert.ok(contains(stdout, 'Running iteration #2.'), 'Logs second iteration');

      var seedRE = /Randomizing tests with seed: (.*)/g;

      var firstSeed = seedRE.exec(stdout)[1];
      var secondSeed = seedRE.exec(stdout)[1];

      assert.ok(firstSeed, 'first seed exists');
      assert.ok(secondSeed, 'second seed exists');
      assert.notEqual(firstSeed, secondSeed, 'the first and second seeds are not the same');

      assert.ok(contains(stdout, 'Cleaning up test iterations.'), 'Logged cleaning up message from command');
      assert.throws(function() {
        fs.accessSync('iteration-dist', fs.F_OK);
      }, 'iteration-dist is cleaned up');

      done();
    });
  });

  it('should test the app with additional options passed in and catch failure cases', function(done) {
    exec('ember exam:iterate 2 --options "--parallel"', function(_, stdout, stderr) {
      var splitErrorRE = /Error: You must specify the `split` option in order to run your tests in parallel./g;
      var splitErrorMatches = stderr.match(splitErrorRE);
      assert.equal(splitErrorMatches && splitErrorMatches.length, 2, 'both commands errored from using parallel option');

      var nonZeroRE = /Returned non-zero exit code with error/g;
      var nonZeroMatches = stdout.match(nonZeroRE);
      assert.equal(nonZeroMatches && nonZeroMatches.length, 2, 'both commands logged non-zero exit codes');

      done();
    });
  });

  it('should not build the app or clean it up, but use an existing build to test', function(done) {
    var buildDir = path.join(process.cwd(), 'dist');

    rimraf.sync(buildDir);
    execSync('./node_modules/.bin/ember build');
    exec('ember exam:iterate 2 --path "dist"', function(_, stdout) {
      assert.ok(!contains(stdout, 'Building app for test iterations.'), 'No logged building message from command');
      assert.ok(!contains(stdout, 'Built project successfully.'), 'Not built successfully according to Ember-CLI');

      assert.ok(contains(stdout, 'Running iteration #1.'), 'Logs first iteration');
      assert.ok(contains(stdout, 'Running iteration #2.'), 'Logs second iteration');

      var seedRE = /Randomizing tests with seed: (.*)/g;

      var firstSeed = seedRE.exec(stdout)[1];
      var secondSeed = seedRE.exec(stdout)[1];

      assert.ok(firstSeed, 'first seed exists');
      assert.ok(secondSeed, 'second seed exists');
      assert.notEqual(firstSeed, secondSeed, 'the first and second seeds are not the same');

      assert.ok(!contains(stdout, 'Cleaning up test iterations.'), 'No logged cleaning up message from command');
      assert.throws(function() {
        fs.accessSync('iteration-dist', fs.F_OK);
      }, 'iteration-dist is non-existent');

      assert.doesNotThrow(function() {
        fs.accessSync(buildDir, fs.F_OK);
      }, 'dist is not cleaned up');

      rimraf.sync(buildDir);

      done();
    });
  });

  describe('Exit Code', function() {
    var destPath = path.join(__dirname, '..', '..', 'tests', 'unit', 'failing-test.js');

    beforeEach(function() {
      var failingTestPath = path.join(__dirname, '..', 'fixtures', 'failure.js');
      fs.copySync(failingTestPath, destPath);
    });

    afterEach(function() {
      fs.removeSync(destPath);
    });

    it('should have an exitCode of 1 when a test fails', function(done) {
      exec('ember exam:iterate 1', function(error) {
        assert.equal(error.code, 1);
        done();
      });
    });
  });
});
