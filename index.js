/* jshint node: true */

'use strict';

module.exports = {
  name: 'ember-exam',

  includedCommands: function() {
    return require('./lib/commands');
  }
};
