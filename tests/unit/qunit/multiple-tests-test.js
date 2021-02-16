import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';

if (macroCondition(dependencySatisfies('ember-qunit', '*'))) {
  let { module, test } = importSync('qunit');

  module('Qunit | #2: Module With Multiple Tests');

  test('#1', function(assert) {
    assert.ok(true);
  });
  test('#2', function(assert) {
    assert.ok(true);
  });
  test('#3', function(assert) {
    assert.ok(true);
  });
  test('#4', function(assert) {
    assert.ok(true);
  });
  test('#5', function(assert) {
    assert.ok(true);
  });
  test('#6', function(assert) {
    assert.ok(true);
  });
  test('#7', function(assert) {
    assert.ok(true);
  });
  test('#8', function(assert) {
    assert.ok(true);
  });
  test('#9', function(assert) {
    assert.ok(true);
  });
}
