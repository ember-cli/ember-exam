import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('Mocha | #3: Module With Multiple Edge Case Tests', function() {
  it('#1 RegExp test', function() {
    expect(/derp/.test('derp')).to.be.ok;
  });
});
