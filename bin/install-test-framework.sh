#!/bin/bash
set -ev
if [ "${TEST_FRAMEWORK}" = "ember-mocha" ]; then
  yarn remove ember-qunit 2>/dev/null && echo "n" | ember install ember-mocha || true
fi
