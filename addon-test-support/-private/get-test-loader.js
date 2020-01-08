/* globals require, requirejs */

/**
 * Returns ember-exam-qunit-test-loader or ember-exam-mocha-test-loader
 *
 * @export
 * @function getTestLoader
 * @return {Object}
 */
export default function getTestLoader() {
  if (requirejs.entries['ember-qunit/test-loader']) {
    const EmberExamQUnitTestLoader = require('./ember-exam-qunit-test-loader');
    return EmberExamQUnitTestLoader['default'];
  } else if (requirejs.entries['ember-mocha/test-loader']) {
    const EmberExamMochaTestLoader = require('./ember-exam-mocha-test-loader');
    return EmberExamMochaTestLoader['default'];
  }

  throw new Error(
    'Unable to find a suitable test loader. You should ensure that one of `ember-qunit` or `ember-mocha` are added as dependencies.'
  );
}
