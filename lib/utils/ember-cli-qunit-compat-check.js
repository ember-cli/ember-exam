'use strict';

var VersionChecker = require('ember-cli-version-checker');

module.exports = function emberCliQunitCompatCheck(addon) {
  var checker = new VersionChecker(addon);
  var dep = checker.for('ember-cli-qunit', 'npm');

  if (dep.isAbove('4.0.0')) {
    console.error('\x1b[31m', '\nERROR: ember-exam@0.6.3 is not compatible with ember-cli-qunit versions >= 4.0.0. Please upgrade to ember-exam@0.7.0 or higher. See http://bit.ly/2yqVGDC for more info.\n', '\x1b[0m');
  }
};
