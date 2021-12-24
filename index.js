/* eslint-env node */

'use strict';

const VersionChecker = require('ember-cli-version-checker');

module.exports = {
  name: require('./package').name,

  includedCommands() {
    return require('./lib/commands');
  },

  init() {
    this._super.init.apply(this, arguments);
    let versionChecker = new VersionChecker(this.project);

    let options = {
      exclude: ['ember-mocha', 'mocha'],
    };

    const hasEmberMocha = versionChecker.for('ember-mocha').exists();

    if (hasEmberMocha) {
      // Exclude automatic import for ember-qunit and qunit when project use ember-mocha
      options.exclude.push('ember-qunit', 'qunit');
    } else {
      const hasMagicallyProvidedQUnit = versionChecker
        .for('ember-qunit')
        .lt('5.0.0-beta.1');

      // Ember-qunit < 5 provides an AMD shim for qunit but newer versions now use
      // ember-auto-import to include qunit. This means that qunit is no
      // longer available for addons (if the parent app is using ember-qunit > 5) to
      // directly import under embroider unless they are using ember-auto-import
      // themselves. This condidionally falls back to not using ember-auto-import
      // when the parent app is providing qunit because without this we would double
      // include qunit resulting in a runtime error (qunit detects if it as
      // already be added to the window object and errors if so).

      if (hasMagicallyProvidedQUnit) {
        options.exclude.push('qunit');
      }
    }

    this.options = this.options || {};
    this.options.autoImport = options;
  },
};
