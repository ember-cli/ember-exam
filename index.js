/* eslint-env node */

'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands() {
    return require('./lib/commands');
  },
};
