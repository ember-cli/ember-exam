import { dependencySatisfies, macroCondition, importSync } from '@embroider/macros';

/**
 * Returns ember-exam-qunit-test-loader or ember-exam-mocha-test-loader
 *
 * @export
 * @function getTestLoader
 * @return {Object}
 */
export default function getTestLoader() {
  if (macroCondition(dependencySatisfies('ember-mocha', '*'))){
    const EmberExamMochaTestLoader = importSync('./ember-exam-mocha-test-loader');
    return EmberExamMochaTestLoader['default'];
  } else if (macroCondition(dependencySatisfies('ember-qunit', '*'))){
    const EmberExamQUnitTestLoader = importSync('./ember-exam-qunit-test-loader');
    return EmberExamQUnitTestLoader['default'];
  }

  throw new Error(
    'Unable to find a suitable test loader. You should ensure that one of `ember-qunit` or `ember-mocha` are added as dependencies.'
  );
}
