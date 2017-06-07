/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-exam',

  includedCommands: function() {
    return require('./lib/commands');
  },

  included: function(app) {
    app.import('vendor/ember-exam/test-loader.js', { type: 'test' });
  }
};
