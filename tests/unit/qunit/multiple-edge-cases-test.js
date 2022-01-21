import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

if (macroCondition(dependencySatisfies('ember-qunit', '*'))) {
  let { module, test } = importSync('qunit').default;

  module('Qunit | #3: Module With Multiple Edge Case Tests');

  test('#1 RegExp test', function (assert) {
    assert.ok(/derp/.test('derp'));
  });
}
