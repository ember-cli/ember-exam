v1.0.0 / 2017-11-02
==================

  * Remove auto-loading functionality
  * Update readme to better emphasize explicit loading

v0.8.1 / 2017-10-08
==================

  * Warn when auto-loading (deprecation)
  * Remove `#` from test output.

v0.8.0 / 2017-10-04
==================

  * Removed EMBER_TRY_SCENARIO's from .travis.yml file
  * Fix ESLint warning
  * Fix mocha integration
  * Revert `npm install` command in .travis.yml
  * Upgrade all dependencies version
  * Upgrade Ember CLI to version 2.15 and align with default blueprint

v0.7.2 / 2017-10-01
==================

  * fixes #109 - use local ember

v0.7.1 / 2017-09-14
==================

  * Make notes about turning on parallelization more visible
  * Move note on >= 0.7.0 into installation section
  * Add installation instructions
  * Remove jQuery usage
  * Specify when to call loadEmberExam when using ember-cli-qunit@4
  * fix version range
  * Add release process notes

v0.7.0 / 2017-06-01
==================

  * Document load API for version 0.7.0
  * Fix eslint errors for node-land code
  * Refactor core functionality
  * Extract TestLoader mods into utility function
  * Simplify and revamp code coverage
  * Fix tests from ESLint migration
  * Replace JSHint with ESLint
  * Tweak CI configs
  * Change ember try:one -> ember try:each
  * Remove Node 0.12 from Travis
  * Add Node LTS versions 4.x, 6.x, and stable to Travis

v0.6.2 / 2017-04-09
==================

  * Downgrade split < 2 error to warning
  * Fix mocha test commands


v0.6.1 / 2017-03-25
===================

  * Ensure iterate exits with proper code
  * Add Ember Exam video link to Readme
  * Add note about using random with a seed
  * Fix seed logging message for random option

v0.6.0 / 2016-11-27
===================

  * Close code coverage gap
  * Update README to include Mocha info
  * Add framework-specific logic
  * Run both Mocha and QUnit tests in CI
  * Add tests for ember-cli-mocha
  * Remove moduleForAcceptance
  * Move QUnit-based tests to sub-directory
  * Remove reliance on QUnit for handling url params

v0.5.3 / 2016-11-19
===================

  * Fixed issue with using a single partition with a double digit

v0.5.2 / 2016-11-15
===================

  * Support specifying multiple partitions (#63)

v0.5.1 / 2016-11-14
===================

  * move rimraf to dependencies from devDependencies
  * Add note about test splitting balancing

v0.5.0 / 2016-08-14
===================

  * Document randomization-iterator
  * Add tests for randomization-iterator
  * Rename main acceptance test to be semantic
  * Introduce exam:iterate command
  * Tighten up npmignore
  * Clarify README typos
  * Increase mass threshold for code climate
  * Improve acceptance test coverage
  * Improve advanced configuration section of readme

v0.4.6 / 2016-08-07
===================

  * Don't run Travis on non-master branches
  * Read in testem config for constructing test page urls

v0.4.5 / 2016-08-03
===================

  * Fix node tests after core-object changes
  * Fix tests of ember-exam in 2.7
  * Upgrade all deps to align with Ember 2.7.0.
  * Temporarily undocument `--weighted`.
  * Setup and document ember-try integration

v0.4.4 / 2016-06-21
===================

  * Remove unused dependencies
  * Make codeclimate and eslint configs local
  * Make requires lazy where possible
  * Remove unused Array utilities
  * Add CodeClimate badges to README
  * Setup Istanbul code coverage for node code
  * Fix issues found via CodeClimate
  * Fix Travis badge to point to master
  * Add additional badges to README

v0.4.3 / 2016-06-05
===================

  * Add Acceptance test for Testem output
  * Add partition number to Testem output only when applicable
  * Handle _split and _partition params as strings
  * Fix typo, partition -> _partition

v0.4.2 / 2016-06-02
===================

  * Introduce tests for TestLoader
  * Add useful errors to TestLoader
  * Don't fail when lint tests are disabled

v0.4.1 / 2016-05-24
===================

  * Fix super callbacks context

v0.4.0 / 2016-05-24
===================

  * Remove AST manipulations and refine API
