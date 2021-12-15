'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

const MOCHA_DEPS = {
  'chai-dom': '*',
  'ember-cli-chai': '*',
  'ember-mocha': '*',
  'ember-qunit': null,
};

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

module.exports = async function () {
  return {
    command,
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            'ember-source': '~3.20.0',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      {
        name: 'ember-default-with-jquery',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^0.5.1',
            'ember-source': '^3.28.0',
          },
        },
      },
      {
        name: 'ember-default-with-mocha',
        npm: {
          devDependencies: { ...MOCHA_DEPS },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          devDependencies: {
            'ember-source': '^3.28.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      embroiderSafe(),
      embroiderSafe({
        name: 'embroider-safe-with-mocha',
        npm: {
          devDependencies: { ...MOCHA_DEPS },
        },
      }),
      embroiderOptimized(),
      embroiderOptimized({
        name: 'embroider-optimized-with-mocha',
        npm: {
          devDependencies: { ...MOCHA_DEPS },
        },
      }),
      {
        name: 'ember-qunit-4',
        npm: {
          devDependencies: {
            'ember-qunit': '^4.6.0',
            'ember-source': '^3.28.0',
          },
        },
      },
    ],
  };
};
