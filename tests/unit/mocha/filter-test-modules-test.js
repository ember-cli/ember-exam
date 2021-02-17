import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';
import { convertFilePathToModulePath, filterTestModules } from 'ember-exam/test-support/-private/filter-test-modules';

if (macroCondition(dependencySatisfies('ember-mocha', '*'))) {
  let { describe, it, beforeEach, afterEach } = importSync('mocha');
  let { expect } = importSync('chai');

  describe('Unit | Mocha | filter-test-modules', () => {
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

    describe('modulePath | Mocha', () => {
      let modules = [];

      beforeEach(() => {
        modules = [
          'foo-test',
          'foo-test.jshint',
          'bar-test',
          'bar-test.jshint',
        ];
      });

      afterEach(() => {
        modules = [];
      });

      it('should return a list of jshint tests', () => {
        expect(filterTestModules(modules, 'jshint')).to.deep.equal([
          'foo-test.jshint',
          'bar-test.jshint'
        ]);
      });

      it('should return an empty list when there is no match', () => {
        expect(() => {
          filterTestModules(modules, 'no-match');
        }).to.throw(/No tests matched with the filter:/);
      });

      it('should return a list of tests matched with a regular expression', () => {
        expect(filterTestModules(modules, '/jshint/')).to.deep.equal([
          'foo-test.jshint',
          'bar-test.jshint'
        ]);
      });

      it('should return a list of tests matched with a regular expression that excluses jshint', () => {
        expect(filterTestModules(modules, '!/jshint/')).to.deep.equal([
          'foo-test',
          'bar-test'
        ]);
      });

      it('should return a list of tests matches with a list of string options', () => {
        expect(filterTestModules(modules, 'foo, bar')).to.deep.equal([
          'foo-test',
          'foo-test.jshint',
          'bar-test',
          'bar-test.jshint'
        ]);
      });

      it('should return a list of unique tests matches when options are repeated', () => {
        expect(filterTestModules(modules, 'foo, foo')).to.deep.equal([
          'foo-test',
          'foo-test.jshint'
        ]);
      });
    });

    describe('filePath | Mocha', () => {
      let modules = [];

      beforeEach(() => {
        modules = [
          'dummy/tests/integration/foo-test',
          'dummy/tests/unit/foo-test',
          'dummy/tests/unit/bar-test'
        ];
      });

      afterEach(() => {
        modules = [];
      });

      it('should return a test module matches with full test file path', () => {
        expect(filterTestModules(modules, null, 'app/tests/integration/foo-test.js')).to.deep.equal([
          'dummy/tests/integration/foo-test'
        ]);
      });

      it('should return a test module matches with relative test file path', () => {
        expect(filterTestModules(modules, null, '/tests/unit/foo-test')).to.deep.equal([
          'dummy/tests/unit/foo-test'
        ]);
      });

      it('should return a test module matched with test file path with wildcard', () => {
        expect(filterTestModules(modules, null, '/unit/*')).to.deep.equal([
          'dummy/tests/unit/foo-test',
          'dummy/tests/unit/bar-test'
        ]);
      });

      it('should return a test module matched with test file path with wildcard', () => {
        expect(filterTestModules(modules, null, '/tests/*/foo*')).to.deep.equal([
          'dummy/tests/integration/foo-test',
          'dummy/tests/unit/foo-test'
        ]);
      });

      it('should return a list of tests matched with a regular expression', () => {
        expect(() => {
          filterTestModules(modules, null, 'no-match');
        }).to.throw(/No tests matched with the filter:/);
      });

      it('should return a list of tests matches with a list of string options', () => {
        expect(filterTestModules(modules, null, '/tests/integration/*, dummy/tests/unit/foo-test')).to.deep.equal([
          'dummy/tests/integration/foo-test',
          'dummy/tests/unit/foo-test'
        ]);
      });

      it('should return a list of unique tests matches when options are repeated', () => {
        expect(filterTestModules(modules, null, 'app/tests/unit/bar-test.js, /tests/unit/*')).to.deep.equal([
          'dummy/tests/unit/bar-test',
          'dummy/tests/unit/foo-test'
        ]);
      });
    });
  });
}

