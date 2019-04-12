/* globals require */

const emberQunit = 'ember-qunit';
const emberMocha = 'ember-mocha';

/**
 * Returns the test framework being used
 */
export function getTestFramework() {
  if (require.has(emberQunit)){
    return emberQunit;
  } else if (require.has(emberMocha)){
    return emberMocha;
  }
  return;
}

/**
 * Returns ember-exam-qunit-test-loader or ember-exam-mocha-test-loader
 *
 * @export
 * @returns {Object}
 */
export function getTestLoader() {
  if (require.has(emberQunit)){
    const EmberExamQUnitTestLoader = require('./ember-exam-qunit-test-loader');
    return EmberExamQUnitTestLoader['default'];
  } else if (require.has(emberMocha)){
    const EmberExamMochaTestLoader = require('./ember-exam-mocha-test-loader');
      return EmberExamMochaTestLoader['default'];
  }

  throw new Error(
    'Unable to find a suitable test loader. You should ensure that one of `ember-qunit` or `ember-mocha` are added as dependencies.'
  );
}
