/* eslint-env node */

'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands() {
    return require('./lib/commands');
  },

  init() {
    this._super.init.apply(this, arguments);

    this.options.autoImport = {
      exclude: ['ember-mocha', 'mocha'],
    };
  },
};
