/* globals require */

import resolver from './helpers/resolver';
import loadEmberExam from 'ember-exam/test-support/load';

const framework = require.has('ember-qunit') ? 'qunit' : 'mocha';
const oppositeFramework = !require.has('ember-qunit') ? 'qunit' : 'mocha';

Object.keys(require.entries).forEach((entry) => {
  if (entry.indexOf(oppositeFramework) !== -1) {
    delete require.entries[entry];
  }
});

require(`ember-${framework}`).default.setResolver(resolver);
loadEmberExam();

// ember-qunit >= v3 support
if (framework === 'qunit') {
  // Use string literal to prevent Babel to transpile this into ES6 import
  // that would break when tests run with Mocha framework.
  // In ember-qunit 3.4.0, this new check was added: https://github.com/emberjs/ember-qunit/commit/a7e93c4b4b535dae62fed992b46c00b62bfc83f4
	// which adds this Ember.onerror validation test. As this is a test suite for the tests, it's not needed to run ember.OnerrorValidation tests.
  require(`ember-${framework}`).start({ setupEmberOnerrorValidation: false });
}
