import { convertFilePathToModulePath, filterTestModules } from 'ember-exam/test-support/-private/filter-test-modules';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';

describe('Unit | filter-test-modules', () => {
  describe('convertFilePathToModulePath', () => {
    it('should return an input string without file extension when the input contains file extension', () => {
      expect(convertFilePathToModulePath('/tests/integration/foo.js')).to.equal(
        '/tests/integration/foo'
      );
    });

    it(`should return an input string without file extension when the input doesn't contain file extension`, () => {
      expect(convertFilePathToModulePath('/tests/integration/foo')).to.equal(
        '/tests/integration/foo'
      );
    });

    it('should return an input string after `tests` when the input is a full test file path', () => {
      expect(convertFilePathToModulePath('dummy/tests/integration/foo.js')).to.equal(
        '/tests/integration/foo'
      );
    });
  });

  describe('modulePath', function() {
    beforeEach(function() {
      this.modules = [
        'foo-test',
        'foo-test.jshint',
        'bar-test',
        'bar-test.jshint',
      ];
    });

    afterEach(function() {
      this.modules = [];
    });

    it('should return a list of jshint tests', () => {
      expect(filterTestModules(this.modules, 'jshint')).to.deep.equal([
        'foo-test.jshint',
        'bar-test.jshint'
      ]);
    });

    it('should return an empty list when there is no match', () => {
      expect(filterTestModules(this.modules, 'no-match')).to.deep.equal([]);
    });

    it('should return a list of tests matched with a regular expression', () => {
      expect(filterTestModules(this.modules, '/jshint/')).to.deep.equal([
        'foo-test.jshint',
        'bar-test.jshint'
      ]);
    });

    it('should return a list of tests matched with a regular expression that excluses jshint', () => {
      expect(filterTestModules(this.modules, '!/jshint/')).to.deep.equal([
        'foo-test',
        'bar-test'
      ]);
    });

    it('should return a list of tests matches with a list of string options', () => {
      expect(filterTestModules(this.modules, 'foo, bar')).to.deep.equal([
        'foo-test',
        'foo-test.jshint',
        'bar-test',
        'bar-test.jshint'
      ]);
    });

    it('should return a list of unique tests matches when options are repeated', () => {
      expect(filterTestModules(this.modules, 'foo, foo')).to.deep.equal([
        'foo-test',
        'foo-test.jshint'
      ]);
    });
  });

  describe('filePath', function() {
    beforeEach(function() {
      this.modules = [
        'dummy/tests/integration/foo-test',
        'dummy/tests/unit/foo-test',
        'dummy/tests/unit/bar-test'
      ];
    });

    afterEach(function() {
      this.modules = [];
    });

    it('should return a test module matches with full test file path', () => {
      expect(filterTestModules(this.modules, null, 'app/tests/integration/foo-test.js')).to.deep.equal([
        'dummy/tests/integration/foo-test'
      ]);
    });

    it('should return a test module matches with relative test file path', () => {
      expect(filterTestModules(this.modules, null, '/tests/unit/foo-test')).to.deep.equal([
        'dummy/tests/unit/foo-test'
      ]);
    });

    it('should return a test module matched with test file path with wildcard', () => {
      expect(filterTestModules(this.modules, null, '/unit/*')).to.deep.equal([
        'dummy/tests/unit/foo-test',
        'dummy/tests/unit/bar-test'
      ]);
    });

    it('should return a test module matched with test file path with wildcard', () => {
      expect(filterTestModules(this.modules, null, '/tests/*/foo*')).to.deep.equal([
        'dummy/tests/integration/foo-test',
        'dummy/tests/unit/foo-test'
      ]);
    });

    it('should return a list of tests matched with a regular expression', () => {
      expect(filterTestModules(this.modules, null, 'no-match')).to.deep.equal([
      ]);
    });

    it('should return a list of tests matches with a list of string options', () => {
      expect(filterTestModules(this.modules, null, '/tests/integration/*, dummy/tests/unit/foo-test')).to.deep.equal([
        'dummy/tests/integration/foo-test',
        'dummy/tests/unit/foo-test'
      ]);
    });

    it('should return a list of unique tests matches when options are repeated', () => {
      expect(filterTestModules(this.modules, null, 'app/tests/unit/bar-test.js, /tests/unit/*')).to.deep.equal([
        'dummy/tests/unit/bar-test',
        'dummy/tests/unit/foo-test'
      ]);
    });
  });
});