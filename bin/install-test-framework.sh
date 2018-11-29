#!/bin/bash
set -ev
if [ "${TEST_FRAMEWORK}" = "ember-cli-mocha" ]; then
  yarn remove ember-qunit
  echo "n" | ember install ember-cli-mocha@0.14.4 @ember/jquery && ember feature:enable jquery-integration
fi
