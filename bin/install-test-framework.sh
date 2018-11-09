#!/bin/bash
set -ev
if [ "${TEST_FRAMEWORK}" = "ember-cli-mocha" ]; then
  npm uninstall --save-dev ember-qunit
  echo "n" | ember install ember-cli-mocha@0.14.4
fi
