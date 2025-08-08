import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';

console.log('Suite B is evaluated');

module('Suite B', function (hooks) {
  setupRenderingTest(hooks);

  test('a', async function (assert) {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    await render(<template>a</template>);

    assert.dom().hasText('a');
  });

  test('b', async function (assert) {
    await render(<template>b</template>);

    assert.dom().hasText('b');
  });

  test('c', async function (assert) {
    await render(<template>c</template>);

    assert.dom().hasText('c');
  });
});
