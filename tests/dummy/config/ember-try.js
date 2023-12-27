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
      mochaScenario({
        name: 'ember-default-with-mocha',
      }),
      embroiderSafe(),
      embroiderSafe(
        mochaScenario({
          name: 'embroider-safe-with-mocha',
        }),
      ),
      embroiderOptimized(),
      embroiderOptimized(
        mochaScenario({
          name: 'embroider-optimized-with-mocha',
        }),
      ),
    ],
  };
};
