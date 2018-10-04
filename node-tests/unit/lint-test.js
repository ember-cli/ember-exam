'use strict';

const lint = require('mocha-eslint');

lint([
  'lib',
  'node-tests',
  'index.js'
]);
