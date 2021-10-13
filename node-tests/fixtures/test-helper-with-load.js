/* eslint-disable ember/no-test-support-import */
import { setResolver } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import loadEmberExam from 'ember-exam/test-support/load';

const framework = require.has('ember-qunit') ? 'qunit' : 'mocha';
const oppositeFramework = !require.has('ember-qunit') ? 'qunit' : 'mocha';

Object.keys(require.entries).forEach((entry) => {
  if (entry.indexOf(oppositeFramework) !== -1) {
    delete require.entries[entry];
  }
});

setResolver(resolver);

loadEmberExam();

// ember-qunit >= v3 support
if (framework === 'qunit') {
  // Use string literal to prevent Babel to transpile this into ES6 import
  // that would break when tests run with Mocha framework.
  require(`ember-${framework}`).start();
}
