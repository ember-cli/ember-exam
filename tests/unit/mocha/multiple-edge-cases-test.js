import { describe, it } from 'mocha';

describe('#3: Module With Multiple Edge Case Tests', function() {
  it('#1 RegExp test', function() {
    expect(/derp/.test('derp')).to.be.ok;
  });
});
