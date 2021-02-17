import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';
import EmberExamTestLoader from 'ember-exam/test-support/-private/ember-exam-mocha-test-loader';

if (macroCondition(dependencySatisfies('ember-mocha', '*'))) {
  let { describe, it, beforeEach, afterEach } = importSync('mocha');
  let { expect } = importSync('chai');

  describe('Unit | Mocha | test-loader', function() {
    beforeEach(function() {
      this.originalRequire = window.require;
      this.requiredModules = [];
      window.require = name => {
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
        'test-4-test.jshint': true
      };
      this.originalURLParams = EmberExamTestLoader._urlParams;
    });

    afterEach(function() {
      window.require = this.originalRequire;
    });

    it('loads all test modules by default', function() {
      const testLoader = new EmberExamTestLoader(this.testem, new Map());
      testLoader.loadModules();

      expect(this.requiredModules).to.deep.equal([
        'test-1-test.jshint',
        'test-2-test.jshint',
        'test-3-test.jshint',
        'test-4-test.jshint',
        'test-1-test',
        'test-2-test',
        'test-3-test',
        'test-4-test'
      ]);
    });

    it('loads modules from a specified partition', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('partition', 3).set('split', 4)
      );
      testLoader.loadModules();

      expect(this.requiredModules).to.deep.equal([
        'test-3-test.jshint',
        'test-3-test'
      ]);
    });

    it('loads modules from multiple specified partitions', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('partition', [1, 3]).set('split', 4)
      );
      testLoader.loadModules();

      expect(this.requiredModules).to.deep.equal([
        'test-1-test.jshint',
        'test-1-test',
        'test-3-test.jshint',
        'test-3-test'
      ]);
    });

    it('loads modules from the first partition by default', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('split', 4)
      );
      testLoader.loadModules();

      expect(this.requiredModules).to.deep.equal([
        'test-1-test.jshint',
        'test-1-test'
      ]);
    });

    it('handles params as strings', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('partition', '3').set('split', '4')
      );
      testLoader.loadModules();

      expect(this.requiredModules).to.deep.equal([
        'test-3-test.jshint',
        'test-3-test'
      ]);
    });

    it('throws an error if splitting less than one', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('split', 0)
      );

      expect(() => {
        testLoader.loadModules();
      }).to.throw(/You must specify a split greater than 0/);
    });

    it('throws an error if partition isn\'t a number', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('split', 2).set('partition', 'foo')
      );

      expect(() => {
        testLoader.loadModules();
      }).to.throw(
        /You must specify numbers for partition \(you specified 'foo'\)/
      );
    });

    it('throws an error if partition isn\'t a number with multiple partitions', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('split', 2).set('partition', [1, 'foo'])
      );

      expect(() => {
        testLoader.loadModules();
      }).to.throw(
        /You must specify numbers for partition \(you specified '1,foo'\)/
      );
    });

    it('throws an error if loading partition greater than split number', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('split', 2).set('partition', 3)
      );

      expect(() => {
        testLoader.loadModules();
      }).to.throw(
        /You must specify partitions numbered less than or equal to your split value/
      );
    });

    it('throws an error if loading partition greater than split number with multiple partitions', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('split', 2).set('partition', [2, 3])
      );

      expect(() => {
        testLoader.loadModules();
      }).to.throw(
        /You must specify partitions numbered less than or equal to your split value/
      );
    });

    it('throws an error if loading partition less than one', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('split', 2).set('partition', 0)
      );

      expect(() => {
        testLoader.loadModules();
      }).to.throw(/You must specify partitions numbered greater than 0/);
    });

    it('load works without lint tests', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map()
          .set('nolint', true)
          .set('partition', 4)
          .set('split', 4)
      );
      testLoader.loadModules();

      // ember-cli-mocha doesn't support disabling linting by url param
      expect(this.requiredModules).to.deep.equal([
        'test-4-test.jshint',
        'test-4-test'
      ]);
    });

    it('load works without non-lint tests', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('partition', 4).set('split', 4)
      );

      window.requirejs.entries = {
        'test-1-test.jshint': true,
        'test-2-test.jshint': true,
        'test-3-test.jshint': true,
        'test-4-test.jshint': true
      };

      testLoader.loadModules();

      expect(this.requiredModules).to.deep.equal(['test-4-test.jshint']);
    });

    it('load works with a double-digit single partition', function() {
      const testLoader = new EmberExamTestLoader(
        this.testem,
        new Map().set('partition', '10').set('split', 10)
      );

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
        'test-10-test': true
      };

      testLoader.loadModules();

      expect(this.requiredModules).to.deep.equal(['test-10-test']);
    });

    it('dummy test to even out the number of tests', function() {
      expect(true).to.be.ok;
    });
  });
}