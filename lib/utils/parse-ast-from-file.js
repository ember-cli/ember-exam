'use strict';

var fs = require('fs');
var recast = require('recast');
var babel = require('babel-core');

module.exports = function parseASTFromFile(path) {
  var file = fs.readFileSync(path, { encoding: 'utf-8' });
  return recast.parse(file, {
    esprima: babel
  });
};
