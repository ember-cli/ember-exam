import weightTestModules from 'ember-exam/test-support/-private/weight-test-modules';
import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

if (macroCondition(dependencySatisfies('ember-qunit', '*'))) {
  let { module, test } = importSync('qunit').default;

  module('Unit | Qunit | weight-test-modules', () => {
    test('should sort a list of file paths by weight', function (assert) {
      const listOfModules = [
        '/acceptance/test-1-test',
        '/unit/test-1-test',
        '/integration/test-1-test',
        'test-1-test',
      ];

      assert.deepEqual(
        [
          '/acceptance/test-1-test',
          'test-1-test',
          '/integration/test-1-test',
          '/unit/test-1-test',
        ],
        weightTestModules(listOfModules),
      );
    });

    test('should sort a list of file paths by weight and alphbetical order', function (assert) {
      const listOfModules = [
        'test-b-test',
        'test-a-test',
        '/integration/test-b-test',
        '/integration/test-a-test',
        '/unit/test-b-test',
        '/acceptance/test-b-test',
        '/acceptance/test-a-test',
        '/unit/test-a-test',
      ];

      assert.deepEqual(
        [
          '/acceptance/test-a-test',
          '/acceptance/test-b-test',
          'test-a-test',
          'test-b-test',
          '/integration/test-a-test',
          '/integration/test-b-test',
          '/unit/test-a-test',
          '/unit/test-b-test',
        ],
        weightTestModules(listOfModules),
      );
    });
  });
}
