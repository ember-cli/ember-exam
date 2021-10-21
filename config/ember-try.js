'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');
const mergeWith = require('lodash.mergewith');

function mochaScenario(scenario = {}) {
  return mergeWith({}, scenario, {
    devDependencies: {
      'chai-dom': '*',
      'ember-cli-chai': '*',
      'ember-mocha': '*',
      'ember-qunit': null,
    },
  });
}

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
        name: 'ember-lts-3.12',
        npm: {
          devDependencies: {
            'ember-source': '~3.12.0',
          },
        },
      },
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
          },
        },
      },
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
          },
        },
      },
      mochaScenario({
        name: 'ember-default-with-mocha',
      }),
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
          ember: {
            edition: 'classic',
          },
        },
      },
      embroiderSafe(),
      embroiderSafe(
        mochaScenario({
          name: 'embroider-safe-with-mocha',
        })
      ),
      embroiderOptimized(),
      embroiderOptimized(
        mochaScenario({
          name: 'embroider-optimized-with-mocha',
        })
      ),
      {
        name: 'ember-qunit-4',
        npm: {
          devDependencies: {
            'ember-qunit': '^4.6.0',
          },
        },
      },
    ],
  };
};
