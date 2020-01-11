#!/bin/bash
set -ev
if [ "${TEST_FRAMEWORK}" = "ember-mocha" ]; then
  yarn remove ember-qunit
  echo "n" | ember install ember-mocha@0.16.0 @ember/jquery && ember feature:enable jquery-integration
fi
