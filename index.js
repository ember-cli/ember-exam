/* eslint-env node */

'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands: function() {
    return require('./lib/commands');
  }
};
