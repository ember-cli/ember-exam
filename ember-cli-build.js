'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  const self = defaults.project.findAddonByName('ember-exam');
  const autoImport = self.options.autoImport;
  let app = new EmberAddon(defaults, {
    autoImport,
    babel: {
      plugins: [
        // ... any other plugins
        require.resolve('ember-concurrency/async-arrow-task-transform'),

        // NOTE: put any code coverage plugins last, after the transform.
      ],
    },
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {});
};
