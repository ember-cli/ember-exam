/* eslint-env node */
var lint = require('mocha-eslint');

lint([
  'lib',
  'node-tests',
  'index.js'
]);
