import { module, test } from 'qunit';

module('Module With Infinite Loop');

test('Infinite loop test #1', function (assert) {
  assert.expect(1);
  let condition = true;
  while (condition) {
    condition = condition || true;
  }
  assert.ok(true);
});
