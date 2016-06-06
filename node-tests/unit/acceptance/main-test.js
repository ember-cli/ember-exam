var assert = require('assert');
var exec = require('child_process').exec;

function contains(str, value) {
  return str.indexOf(value) !== -1;
}

describe('Acceptance', function() {
  it('Testem augments output with partition number', function(done) {
    this.timeout(300000);
    exec('ember exam --split 3 --partition 2', function(_, stdout) {
      assert.ok(contains(stdout, 'Exam Partition #2'));
      done();
    });
  });

  it('Testem does not augment output when there is no partition', function(done) {
    this.timeout(300000);
    exec('ember exam', function(_, stdout) {
      assert.ok(!contains(stdout, 'Exam Partition'));
      done();
    });
  });
});
