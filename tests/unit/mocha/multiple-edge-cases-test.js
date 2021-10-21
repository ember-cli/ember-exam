import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

if (macroCondition(dependencySatisfies('ember-mocha', '*'))) {
  let { describe, it } = importSync('mocha');
  let { expect } = importSync('chai');

  describe('Mocha | #3: Module With Multiple Edge Case Tests', function () {
    it('#1 RegExp test', function () {
      expect(/derp/.test('derp')).to.be.ok;
    });
  });
}
