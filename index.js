/* eslint-env node */

'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands() {
    return require('./lib/commands');
  },

  checkDevDependencies() {
    const VersionChecker = require('ember-cli-version-checker');
    const checker = new VersionChecker(this);
    return checker.for('ember-cli', 'npm').gte('3.2.0');
  }
};
