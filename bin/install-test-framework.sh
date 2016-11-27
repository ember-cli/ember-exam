#!/bin/bash
set -ev
if [ "${TEST_FRAMEWORK}" = "ember-cli-mocha" ]; then
  npm uninstall --save-dev ember-cli-qunit
  yes n | ember install ember-cli-mocha@0.11.0
fi
