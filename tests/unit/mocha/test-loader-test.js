import TestLoader from 'ember-cli-test-loader/test-support/index';
import { describe, it, beforeEach, afterEach } from 'mocha';

describe('Unit | test-loader', function() {
  beforeEach(function() {
    this.originalRequire = window.require;
    this.requiredModules = [];
    window.require = (name) => {
      this.requiredModules.push(name);
    };

    window.requirejs.entries = {
      'test-1-test': true,
      'test-1-test.jshint': true,
      'test-2-test': true,
      'test-2-test.jshint': true,
      'test-3-test': true,
      'test-3-test.jshint': true,
      'test-4-test': true,
      'test-4-test.jshint': true,
    };

    this.originalURLParams = TestLoader._urlParams;
  });

  afterEach(function() {
    TestLoader._urlParams = this.originalURLParams;
    window.require = this.originalRequire;
  });

  it('loads all test modules by default', function() {
    TestLoader._urlParams = {};

    TestLoader.load();

    expect(this.requiredModules).to.deep.equal([
      'test-1-test.jshint',
      'test-2-test.jshint',
      'test-3-test.jshint',
      'test-4-test.jshint',
      'test-1-test',
      'test-2-test',
      'test-3-test',
      'test-4-test',
    ]);
  });

  it('loads modules from a specified partition', function() {
    TestLoader._urlParams = {
      _partition: 3,
      _split: 4,
    };

    TestLoader.load();

    expect(this.requiredModules).to.deep.equal([
      'test-3-test.jshint',
      'test-3-test',
    ]);
  });

  it('loads modules from multiple specified partitions', function() {
    TestLoader._urlParams = {
      _partition: [1, 3],
      _split: 4,
    };

    TestLoader.load();

    expect(this.requiredModules).to.deep.equal([
      'test-1-test.jshint',
      'test-1-test',
      'test-3-test.jshint',
      'test-3-test',
    ]);
  });

  it('loads modules from the first partition by default', function() {
    TestLoader._urlParams = {
      _split: 4,
    };

    TestLoader.load();

    expect(this.requiredModules).to.deep.equal([
      'test-1-test.jshint',
      'test-1-test',
    ]);
  });

  it('handles params as strings', function() {
    TestLoader._urlParams = {
      _partition: '3',
      _split: '4',
    };

    TestLoader.load();

    expect(this.requiredModules).to.deep.equal([
      'test-3-test.jshint',
      'test-3-test',
    ]);
  });

  it('throws an error if splitting less than one', function() {
    TestLoader._urlParams = {
      _split: 0,
    };

    expect(() => {
      TestLoader.load();
    }).to.throw(/You must specify a split greater than 0/);
  });

  it('throws an error if partition isn\'t a number', function() {
    TestLoader._urlParams = {
      _split: 2,
      _partition: "foo",
    };

    expect(() => {
      TestLoader.load();
    }).to.throw(/You must specify numbers for partition \(you specified 'foo'\)/);
  });

  it('throws an error if partition isn\'t a number with multiple partitions', function() {
    TestLoader._urlParams = {
      _split: 2,
      _partition: [1, "foo"],
    };

    expect(() => {
      TestLoader.load();
    }).to.throw(/You must specify numbers for partition \(you specified '1,foo'\)/);
  });

  it('throws an error if loading partition greater than split number', function() {
    TestLoader._urlParams = {
      _split: 2,
      _partition: 3,
    };

    expect(() => {
      TestLoader.load();
    }).to.throw(/You must specify partitions numbered less than or equal to your split value/);
  });

  it('throws an error if loading partition greater than split number with multiple partitions', function() {
    TestLoader._urlParams = {
      _split: 2,
      _partition: [2, 3],
    };

    expect(() => {
      TestLoader.load();
    }).to.throw(/You must specify partitions numbered less than or equal to your split value/);
  });

  it('throws an error if loading partition less than one', function() {
    TestLoader._urlParams = {
      _split: 2,
      _partition: 0,
    };

    expect(() => {
      TestLoader.load();
    }).to.throw(/You must specify partitions numbered greater than 0/);
  });

  it('load works without lint tests', function() {
    TestLoader._urlParams = {
      nolint: true,
      _partition: 4,
      _split: 4,
    };

    TestLoader.load();

    // ember-cli-mocha doesn't support disabling linting by url param
    expect(this.requiredModules).to.deep.equal([
      'test-4-test.jshint',
      'test-4-test'
    ]);
  });

  it('load works without non-lint tests', function() {
    window.requirejs.entries = {
      'test-1-test.jshint': true,
      'test-2-test.jshint': true,
      'test-3-test.jshint': true,
      'test-4-test.jshint': true,
    };

    TestLoader._urlParams = {
      _partition: 4,
      _split: 4,
    };

    TestLoader.load();

    expect(this.requiredModules).to.deep.equal([
      'test-4-test.jshint',
    ]);
  });

  it('load works with a double-digit single partition', function() {
    window.requirejs.entries = {
      'test-1-test': true,
      'test-2-test': true,
      'test-3-test': true,
      'test-4-test': true,
      'test-5-test': true,
      'test-6-test': true,
      'test-7-test': true,
      'test-8-test': true,
      'test-9-test': true,
      'test-10-test': true,
    };

    TestLoader._urlParams = {
      _partition: '10',
      _split: 10,
    };

    TestLoader.load();

    expect(this.requiredModules).to.deep.equal([
      'test-10-test',
    ]);
  });
});

