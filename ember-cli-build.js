'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    // Add options here
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  // Use embroider if it's present (it can get added by ember-try)
  if ('@embroider/core' in app.dependencies()) {
    /* eslint-disable node/no-missing-require, node/no-extraneous-require */
    const { Webpack } = require('@embroider/webpack');
    const { compatBuild } = require('@embroider/compat');
    /* eslint-enable node/no-missing-require, node/no-extraneous-require */
    let config = {};
    if (process.env.EMBER_TRY_SCENARIO === 'embroider-optimized') {
      config = {
        staticAddonTrees: true,
        staticAddonTestSupportTrees: true,
        staticHelpers: true,
        staticComponents: true,
      }
    }
    return compatBuild(app, Webpack, config);
  } else {
    return app.toTree();
  }
};
