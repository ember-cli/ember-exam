'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

const command = [
  'ember',
  'exam',
  '--split',
  '3',
  '--parallel',
  '1',
  '--random',
  process.env.TRAVIS_PULL_REQUEST,
]
  .filter(Boolean)
  .join(' ');

// Ember 7+ publishes ember-source as a v2 addon without AMD/vendor bundles,
// so the release/beta/canary scenarios need newer build tooling than this
// repo's defaults. See https://deprecations.emberjs.com/id/using-amd-bundles
const ember7Tooling = {
  'ember-cli': '^6.11.1',
  'ember-cli-htmlbars': '^7.0.1',
  '@ember/test-helpers': '^5.4.3',
  'ember-resolver': '^13.2.0',
  'ember-qunit': '^9.1.0',
  '@glimmer/component': '^2.0.0',
};

module.exports = async function () {
  return {
    command,
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            ...ember7Tooling,
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
            ...ember7Tooling,
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
            ...ember7Tooling,
          },
        },
      },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
