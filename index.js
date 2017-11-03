/* eslint-env node */

'use strict';

module.exports = {
  name: 'ember-exam',

  includedCommands: function() {
    return require('./lib/commands');
  }
};
