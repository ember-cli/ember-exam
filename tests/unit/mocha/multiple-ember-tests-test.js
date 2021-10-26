import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

if (macroCondition(dependencySatisfies('ember-mocha', '*'))) {
  let { describe, it } = importSync('mocha');
  let { expect } = importSync('chai');
  let { setupTest } = importSync('ember-mocha');

  describe('Mocha | #1: Module-For With Multiple Tests', function () {
    setupTest();

    it('#1', function () {
      expect(true).to.be.ok;
    });
    it('#2', function () {
      expect(true).to.be.ok;
    });
    it('#3', function () {
      expect(true).to.be.ok;
    });
    it('#4', function () {
      expect(true).to.be.ok;
    });
    it('#5', function () {
      expect(true).to.be.ok;
    });
    it('#6', function () {
      expect(true).to.be.ok;
    });
    it('#7', function () {
      expect(true).to.be.ok;
    });
    it('#8', function () {
      expect(true).to.be.ok;
    });
    it('#9', function () {
      expect(true).to.be.ok;
    });
  });
}
