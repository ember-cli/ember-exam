/* globals require */

import { setResolver } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import start from 'ember-exam/test-support/start';
import { macroCondition, dependencySatisfies } from '@embroider/macros';

const oppositeFramework = macroCondition(
  dependencySatisfies('ember-qunit', '*'),
)
  ? 'mocha'
  : 'qunit';

Object.keys(require.entries).forEach((entry) => {
  if (entry.indexOf(oppositeFramework) !== -1) {
    delete require.entries[entry];
  }
});

setResolver(resolver);
start();
