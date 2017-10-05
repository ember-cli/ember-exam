/* jshint node: true */

'use strict';

module.exports = {
  name: 'ember-exam',

  includedCommands: function() {
    var emberCliQunitCompatCheck = require('./lib/utils/ember-cli-qunit-compat-check');
    emberCliQunitCompatCheck(this);

    return require('./lib/commands');
  },

  included: function(app) {
    app.import('vendor/ember-exam/test-loader.js', { type: 'test' });
  }
};
