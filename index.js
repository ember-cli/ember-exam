/* jshint node: true */

'use strict';

var Commands = require('./lib/commands');

module.exports = {
  name: 'ember-exam',

  includedCommands: function() {
    return Commands;
  },

  included: function(app) {
    app.import('vendor/ember-exam/test-loader.js', { type: 'test' });
  }
};
