'use strict';

const assert = require('assert');
const readTestemConfig = require('../../../lib/utils/config-reader');

describe('ConfigReader | readTestemConfig', function() {
  it('should find `testem.js` file by default and return `true` when no file name and no potential files specified', function() {
    assert.ok(readTestemConfig());
  });

  it('should return `false` if file doesn\'t exsit when potential files are empty list', function() {
    assert.ok(!readTestemConfig('this-file-do-not-exsit.json', []));
  });

  it('should find `testem.js` file by default and return `true` when file specified doesn\'t exist', function() {
    assert.ok(readTestemConfig('this-file-do-not-exsit.json'));
  });

  it('should require a specified `js` file and return an object in the module when no potential files specified', function() {
    assert.deepEqual(readTestemConfig('testem.simple-test-page.js').foo, 'bar');
  });

  it('should require a specified `js` file and return an object in the module when the file exsits and potential files are empty list', function() {
    assert.deepEqual(readTestemConfig('testem.simple-test-page.js', []).foo, 'bar');
  });
});
