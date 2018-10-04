/* eslint-env node */

'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands: function() {
    return require('./lib/commands');
  },

  checkDevDependencies: function() {
    const VersionChecker = require('ember-cli-version-checker');
    const checker = new VersionChecker(this);
    return checker.for('ember-cli', 'npm').gte('3.2.0');
  }
};
