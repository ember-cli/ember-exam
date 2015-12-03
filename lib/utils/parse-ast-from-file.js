'use strict';

var fs = require('fs');
var recast = require('recast');

module.exports = function parseASTFromFile(path) {
  var file = fs.readFileSync(path, { encoding: 'utf-8' });
  return recast.parse(file);
};
