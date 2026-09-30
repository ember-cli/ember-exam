'use strict';

const assert = require('assert');
const fixturify = require('fixturify');
const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const readTestemConfig = require('../../../lib/utils/config-reader');

const fixturifyDir = 'tmp/fixture';
const HAS_ESM_REQUIRE = semver.gte(process.version, '22.12.0');
const HAS_STRIP_TYPES = semver.gte(process.version, '23.6.0');

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

  // Fixtures use pure-JS syntax that is also valid TypeScript.
  // nyc's monkey-patching of Module._compile prevents Node from stripping types.
  // A fixture with real type annotations would fail under coverage even though it loads cleanly outside nyc.
  // These tests cover extension routing and ESM default unwrap. Type stripping is Node's job.
  (HAS_ESM_REQUIRE ? describe : describe.skip)(
    'ESM configs (Node >= 22.12)',
    function () {
      it('reads a specified `.mjs` file and returns the ESM default export', function () {
        fixturify.writeSync(fixturifyDir, {
          'testem.mjs-file.mjs': "export default { foo: 'bar' };\n",
        });
        assert.deepEqual(
          readTestemConfig(path.join(fixturifyDir, 'testem.mjs-file.mjs'), [])
            .foo,
          'bar',
        );
      });
    },
  );

  (HAS_STRIP_TYPES ? describe : describe.skip)(
    'TypeScript configs (Node >= 23.6)',
    function () {
      it('reads a specified `.ts` file and returns the ESM default export', function () {
        fixturify.writeSync(fixturifyDir, {
          'testem.ts-file.ts': "export default { foo: 'bar' };\n",
        });
        assert.deepEqual(
          readTestemConfig(path.join(fixturifyDir, 'testem.ts-file.ts'), [])
            .foo,
          'bar',
        );
      });

      it('reads a specified `.mts` file and returns the ESM default export', function () {
        fixturify.writeSync(fixturifyDir, {
          'testem.mts-file.mts': "export default { foo: 'bar' };\n",
        });
        assert.deepEqual(
          readTestemConfig(path.join(fixturifyDir, 'testem.mts-file.mts'), [])
            .foo,
          'bar',
        );
      });

      it('reads a specified `.cts` file (CommonJS with types) and returns module.exports as-is', function () {
        fixturify.writeSync(fixturifyDir, {
          'testem.cts-file.cts': "module.exports = { foo: 'bar' };\n",
        });
        assert.deepEqual(
          readTestemConfig(path.join(fixturifyDir, 'testem.cts-file.cts'), [])
            .foo,
          'bar',
        );
      });
    },
  );
});
