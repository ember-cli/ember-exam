'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  const self = defaults.project.findAddonByName('ember-exam');
  const autoImport = self.options.autoImport;
  let app = new EmberAddon(defaults, {
    autoImport
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app);
};
