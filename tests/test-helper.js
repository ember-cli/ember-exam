/* globals require */

import resolver from './helpers/resolver';
import { start } from 'ember-cli-qunit';
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
start();
