/* globals require */

import resolver from './helpers/resolver';

const framework = require.has('ember-qunit') ? 'qunit' : 'mocha';
const oppositeFramework = !require.has('ember-qunit') ? 'qunit' : 'mocha';

Object.keys(require.entries).forEach((entry) => {
  if (entry.indexOf(oppositeFramework) !== -1) {
    delete require.entries[entry];
  }
});

require(`ember-${framework}`).default.setResolver(resolver);
