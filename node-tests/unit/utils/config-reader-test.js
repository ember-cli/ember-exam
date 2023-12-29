'use strict';

const assert = require('assert');
const fixturify = require('fixturify');
const fs = require('fs-extra');
const path = require('path');
const readTestemConfig = require('../../../lib/utils/config-reader');

const fixturifyDir = 'tmp/fixture';

describe('ConfigReader | readTestemConfig', function () {
  beforeEach(function () {
    fs.mkdirpSync(fixturifyDir);
    this.fixturifyContent = {
      foo: 'bar',
    };
  });

  afterEach(function () {
    fs.removeSync(fixturifyDir);
  });

  it('should find `testem.js` file by default and return `true` when no file name and no potential files specified', function () {
    fixturify.writeSync(fixturifyDir, {});
    assert.ok(readTestemConfig());
  });

  it("should return `false` if file doesn't exsit when potential files are empty list", function () {
    assert.ok(!readTestemConfig('this-file-do-not-exsit.json', []));
  });

  it("should find `testem.js` file by default and return `true` when file specified doesn't exist", function () {
    assert.ok(readTestemConfig('this-file-do-not-exsit.json'));
  });

  it('should require a specified `js` file and return an object in the module when no potential files specified', function () {
    assert.deepEqual(readTestemConfig('testem.simple-test-page.js').foo, 'bar');
  });

  it('should require a specified `js` file and return an object in the module when the file exsits and potential files are empty list', function () {
    assert.deepEqual(
      readTestemConfig('testem.simple-test-page.js', []).foo,
      'bar',
    );
  });

  it('should read a specified `json` file and return an object read from the file', function () {
    fixturify.writeSync(fixturifyDir, {
      'testem.json-file.json': JSON.stringify(this.fixturifyContent),
    });
    assert.deepEqual(
      readTestemConfig(path.join(fixturifyDir, 'testem.json-file.json'), [])
        .foo,
      'bar',
    );
  });

  it('should read a specified `yaml` file and return an object read from the file', function () {
    fixturify.writeSync(fixturifyDir, {
      'testem.yaml-file.yaml': JSON.stringify(this.fixturifyContent),
    });
    assert.deepEqual(
      readTestemConfig(path.join(fixturifyDir, 'testem.yaml-file.yaml'), [])
        .foo,
      'bar',
    );
  });
});
