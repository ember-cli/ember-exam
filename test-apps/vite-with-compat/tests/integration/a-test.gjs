import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';

module('Suite A', function (hooks) {
  setupRenderingTest(hooks);

  test('a', async function (assert) {
    await render(<template>a</template>);

    assert.dom().hasText('a');
  });

  test('b', async function (assert) {
    await render(<template>b</template>);

    assert.dom().hasText('c');
  });

  test('c', async function (assert) {
    await render(<template>c</template>);

    assert.dom().hasText('c');
  });
});
