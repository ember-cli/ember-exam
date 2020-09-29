import { module, test } from 'qunit';

module('Qunit | #3: Module With Multiple Edge Case Tests');

test('#1 RegExp test', function(assert) {
  assert.ok(/derp/.test('derp'));
});
