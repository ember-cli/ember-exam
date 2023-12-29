# Changelog



## v9.0.0 (2023-12-29)

#### :boom: Breaking Change
* [#1125](https://github.com/ember-cli/ember-exam/pull/1125) Update ember to 5.5, drop Nodes below 18, drop Mocha support ([@andreyfel](https://github.com/andreyfel))

#### :rocket: Enhancement
* [#963](https://github.com/ember-cli/ember-exam/pull/963) Add preserveTestName CLI flag to remove partition and browser ([@tasha-urbancic](https://github.com/tasha-urbancic))

#### :house: Internal
* [#1127](https://github.com/ember-cli/ember-exam/pull/1127) Run node tests in CI ([@andreyfel](https://github.com/andreyfel))

#### Committers: 2
- Andrey Fel ([@andreyfel](https://github.com/andreyfel))
- Natasha Urbancic ([@tasha-urbancic](https://github.com/tasha-urbancic))


## v8.0.0 (2022-01-25)

#### :boom: Breaking Change
* [#769](https://github.com/ember-cli/ember-exam/pull/769) Drop support for Ember 3.19 and below ([@Turbo87](https://github.com/Turbo87))

#### :house: Internal
* [#840](https://github.com/ember-cli/ember-exam/pull/840) Upgrade `@embroider/*` packages to 1.0.0 ([@SergeAstapov](https://github.com/SergeAstapov))
* [#745](https://github.com/ember-cli/ember-exam/pull/745) Upgrade eslint-plugin-ember from v8.9.1 to v10.5.8 ([@SergeAstapov](https://github.com/SergeAstapov))
* [#813](https://github.com/ember-cli/ember-exam/pull/813) Use `assert.strictEqual()` instead of `assert.equal()` ([@Turbo87](https://github.com/Turbo87))
* [#775](https://github.com/ember-cli/ember-exam/pull/775) Delete unused `herp-derp` component ([@Turbo87](https://github.com/Turbo87))
* [#774](https://github.com/ember-cli/ember-exam/pull/774) Migrate dummy app templates to use angle bracket invocation syntax ([@Turbo87](https://github.com/Turbo87))
* [#740](https://github.com/ember-cli/ember-exam/pull/740) CI: Enable Ember v4 scenarios again ([@Turbo87](https://github.com/Turbo87))
* [#768](https://github.com/ember-cli/ember-exam/pull/768) Upgrade `ember-cli-addon-docs` dependency ([@Turbo87](https://github.com/Turbo87))
* [#766](https://github.com/ember-cli/ember-exam/pull/766) CI: Disable failing `ember-release` scenario ([@Turbo87](https://github.com/Turbo87))
* [#748](https://github.com/ember-cli/ember-exam/pull/748) Add eslint-plugin-qunit per latest addon blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
* [#744](https://github.com/ember-cli/ember-exam/pull/744) Update npmignore file ([@Turbo87](https://github.com/Turbo87))

#### Committers: 3
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))
- Stephen Yeung ([@step2yeung](https://github.com/step2yeung))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))


## v7.0.1 (2021-11-02)
#### :bug: Bug Fix
* [#760](https://github.com/ember-cli/ember-exam/pull/760) Wait for all browser to completet beforer cleaning up StateManager([@step2yeung](https://github.com/step2yeung))
* [#750](https://github.com/ember-cli/ember-exam/pull/750) Ember exam failing when browser ID not found, return 0([@step2yeung](https://github.com/step2yeung))

#### :house: Internal
* [#748](https://github.com/ember-cli/ember-exam/pull/748) Add eslint-plugin-qunit per latest addon blueprint  internal ([@SergeAstapov](https://github.com/SergeAstapov))
* [#744](https://github.com/ember-cli/ember-exam/pull/744) Update npmignore file internal([@Turbo87](https://github.com/Turbo87))
#### Committers: 4

- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))
- Stephen Yeung ([@step2yeung](https://github.com/step2yeung))

## v7.0.0 (2021-10-22)

#### :boom: Breaking Change
* [#739](https://github.com/ember-cli/ember-exam/pull/739) Update `ember-auto-import` to v2.x ([@Turbo87](https://github.com/Turbo87))
* [#690](https://github.com/ember-cli/ember-exam/pull/690) Drop support for Node 10 and upgrade deps ([@nlfurniss](https://github.com/nlfurniss))

#### :bug: Bug Fix
* [#688](https://github.com/ember-cli/ember-exam/pull/688) Fix embroider tests ([@nlfurniss](https://github.com/nlfurniss))

#### :memo: Documentation
* [#687](https://github.com/ember-cli/ember-exam/pull/687) Update README.md: Fix typo in flag name ([@bantic](https://github.com/bantic))
* [#644](https://github.com/ember-cli/ember-exam/pull/644) Docs: Fix information on Load Balancing ([@brkn](https://github.com/brkn))

#### :house: Internal
* [#743](https://github.com/ember-cli/ember-exam/pull/743) CI: Add `release` workflow ([@Turbo87](https://github.com/Turbo87))
* [#737](https://github.com/ember-cli/ember-exam/pull/737) Use `prettier` to format JS files ([@Turbo87](https://github.com/Turbo87))
* [#736](https://github.com/ember-cli/ember-exam/pull/736) CI: Disable Ember.js v4 scenarios ([@Turbo87](https://github.com/Turbo87))
* [#689](https://github.com/ember-cli/ember-exam/pull/689) Set ember edition to Octane to quiet build logging ([@nlfurniss](https://github.com/nlfurniss))

#### Committers: 4
- Berkan Ünal ([@brkn](https://github.com/brkn))
- Cory Forsyth ([@bantic](https://github.com/bantic))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Tobias Bieniek ([@Turbo87](https://github.com/Turbo87))


## v6.1.0 (2021-02-17)

#### :rocket: Enhancement
* [#652](https://github.com/ember-cli/ember-exam/pull/652) Update to support `ember-qunit@5` ([@thoov](https://github.com/thoov))

#### Committers: 1
- Travis Hoover ([@thoov](https://github.com/thoov))


## v6.0.1 (2020-10-28)

#### :bug: Bug Fix
* [#617](https://github.com/ember-cli/ember-exam/pull/617) Update @embroider/macros to fix ember-qunit@5.0.0-beta support. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#618](https://github.com/ember-cli/ember-exam/pull/618) Swap to GitHub actions for CI. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v6.0.0 (2020-10-12)

#### :boom: Breaking Change
* [#615](https://github.com/ember-cli/ember-exam/pull/615) Drop Node 13 support. ([@rwjblue](https://github.com/rwjblue))
* [#600](https://github.com/ember-cli/ember-exam/pull/600) Drop Node 11 support. ([@thoov](https://github.com/thoov))

#### :rocket: Enhancement
* [#599](https://github.com/ember-cli/ember-exam/pull/599) Embroider support when `staticAddonTestSupportTrees` enabled ([@thoov](https://github.com/thoov))

#### :bug: Bug Fix
* [#410](https://github.com/ember-cli/ember-exam/pull/410) Fail if parallel is not a numeric value ([@step2yeung](https://github.com/step2yeung))

#### :memo: Documentation
* [#612](https://github.com/ember-cli/ember-exam/pull/612) Update README.md ([@jrowlingson](https://github.com/jrowlingson))
* [#588](https://github.com/ember-cli/ember-exam/pull/588) Add note about `--random` and `--load-balance` ([@kellyselden](https://github.com/kellyselden))

#### :house: Internal
* [#614](https://github.com/ember-cli/ember-exam/pull/614) Update release automation setup. ([@rwjblue](https://github.com/rwjblue))
* [#604](https://github.com/ember-cli/ember-exam/pull/604) Fixing bad yarn lock merge ([@thoov](https://github.com/thoov))
* [#600](https://github.com/ember-cli/ember-exam/pull/600) Fix test suite to run mocha variants during CI ([@thoov](https://github.com/thoov))

#### Committers: 6
- Jack Rowlingson ([@jrowlingson](https://github.com/jrowlingson))
- Kelly Selden ([@kellyselden](https://github.com/kellyselden))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Stephen Yeung ([@step2yeung](https://github.com/step2yeung))
- Travis Hoover ([@thoov](https://github.com/thoov))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


v5.0.1 / 2020-04-21
===================
* Bump fs-extra from 8.1.0 to 9.0.0 <dependabot[bot]>
* Bump sinon from 7.5.0 to 9.0.2 <dependabot[bot]>
* Bump cli-table3 from 0.5.1 to 0.6.0 <dependabot[bot]>
* Bump ember-resolver from 6.0.2 to 8.0.0 <dependabot[bot]>
* Bump ember-source from 3.17.2 to 3.18.0 <dependabot[bot]>
* Bump semver from 7.1.3 to 7.3.2 <dependabot[bot]>
* Bump eslint-plugin-node from 11.0.0 to 11.1.0 <dependabot[bot]>
* Bump semver from 7.1.3 to 7.3.2 <dependabot[bot]>
* Bump ember-template-lint from 2.4.1 to 2.5.2 <dependabot[bot]>
* Bump mocha from 7.1.0 to 7.1.1 <dependabot[bot]>
* Bump testdouble from 3.13.0 to 3.13.1 <dependabot[bot]>
* Bump nyc from 15.0.0 to 15.0.1 <dependabot[bot]>
* Bump ember-cli-htmlbars from 4.2.2 to 4.3.0 <dependabot[bot]>
* Bump ember-cli from 3.16.0 to 3.17.0 <dependabot[bot]>
* Bump ember-cli-babel from 7.18.0 to 7.19.0 <dependabot[bot]>
* Bump ember-source from 3.17.1 to 3.17.2 <dependabot[bot]>
* Bump ember-template-lint from 2.4.0 to 2.4.1  <dependabot[bot]>
* Bump ember-source from 3.17.0 to 3.17.1 <dependabot[bot]>
* Bump eslint-plugin-ember from 7.10.1 to 7.11.1 <dependabot[bot]>
* Bump eslint-plugin-ember from 7.9.0 to 7.10.1 <dependabot[bot]>
* Bump ember-template-lint from 2.3.0 to 2.4.0 <dependabot[bot]>


v5.0.0 / 2020-03-06
===================
* [Enhancement] Update docs for ember-cli-addon-docs (@choheekim)
* [Enhancement] Update node engine to be above 10 (@choheekim)
* [Enhancement] Enables to execute completeBrowserHandler() when there is browser(s) failed to attach to server (@choheekim)
* [Enhancement] _getTestFramework checks for ember-mocha package (@choheekim)
* [Enhancement] updating header comments to fix warnings during "ember build" (@dcombslinkedin)
* [BugFix] fix invalid ES module usage (@ef3)
* Bump ember-source from 3.16.3 to 3.17.0 <dependabot[bot]>
* Bump ember-template-lint from 1.14.0 to 2.3.0 <dependabot[bot]>
* Bump eslint-plugin-ember from 7.8.1 to 7.9.0 <dependabot[bot]>
* Bump testdouble from 3.12.5 to 3.13.0 <dependabot[bot]>
* Bump mocha from 7.0.1 to 7.1.0 <dependabot[bot]>
* Bump ember-template-lint from 1.13.2 to 1.14.0 <dependabot[bot]>
* Bump ember-source from 3.14.3 to 3.16.3 <dependabot[bot]>
* Bump semver from 7.1.2 to 7.1.3 <dependabot[bot]>
* Bump ember-cli from 3.15.2 to 3.16.0 <dependabot[bot]>
* Bump ember-cli-babel from 7.17.1 to 7.18.0 <dependabot[bot]>
* Bump eslint-plugin-ember from 7.7.2 to 7.8.1 <dependabot[bot]>
* Bump rimraf from 3.0.1 to 3.0.2 <dependabot[bot]>
* Bump ember-cli-babel from 7.14.1 to 7.17.1 <dependabot[bot]>
* Bump semver from 6.3.0 to 7.1.2 <dependabot[bot]>
* Bump mocha from 6.2.2 to 7.0.1 <dependabot[bot]>
* Bump ember-cli-babel from 7.13.2 to 7.14.1 <dependabot[bot]>
* Bump rimraf from 3.0.0 to 3.0.1 <dependabot[bot]>
* Bump ember-cli from 3.15.1 to 3.15.2 <dependabot[bot]>
* Bump ember-cli-addon-docs-yuidoc from 0.2.3 to 0.2.4 <dependabot[bot]>
* Bump ember-template-lint from 1.13.0 to 1.13.2 <dependabot[bot]>
* Bump ember-cli-htmlbars from 4.2.1 to 4.2.2 <dependabot[bot]>
* Bump ember-cli-htmlbars from 4.2.0 to 4.2.1 <dependabot[bot]>
* Bump eslint-plugin-node from 10.0.0 to 11.0.0 <dependabot[bot]>
* Bump nyc from 14.1.1 to 15.0.0 <dependabot[bot]>
* Bump ember-resolver from 6.0.0 to 6.0.1 <dependabot[bot]>
* Bump ember-template-lint from 1.11.1 to 1.12.1 <dependabot[bot]>
* Bump eslint-plugin-ember from 7.7.1 to 7.7.2 <dependabot[bot]>
* Bump ember-cli-babel from 7.13.0 to 7.13.2 <dependabot[bot]>
* Bump ember-cli-htmlbars from 4.1.0 to 4.2.0 <dependabot[bot]>
* Bump ember-try from 1.3.0 to 1.4.0 <dependabot[bot]>
* Bump ember-cli-htmlbars from 4.0.9 to 4.1.0 <dependabot[bot]>
* Bump ember-template-lint from 1.9.0 to 1.10.0 <dependabot[bot]>


v4.0.9 / 2019-12-05
===================
* [Enhancement] Add a number of total tests, failed tests, passed tests, and skipped tests to a module metadata file (@choheekim)
* [Enhancement] Update README.md corresponding to changes in the module metadata file contents (@choheekim)
* [BugFix] Update yarn.lock to use latest version of core-js-compat (v.3.4.7) (@choheekim)
* [BugFix] Fix process validation when registering callbacks for process.error & process.exit (@choheekim)
* Bump ember-template-lint from 1.6.0 to 1.6.1 <dependabot[bot]>
* Bump ember-qunit from 4.5.1 to 4.6.0 <dependabot[bot]>
* Bump eslint-plugin-ember from 7.2.0 to 7.3.0 <dependabot[bot]>
* Bump ember-load-initializers from 2.1.0 to 2.1.1 <dependabot[bot]>
* Bump ember-template-lint from 1.6.1 to 1.8.1 <dependabot[bot]>
* Bump ember-source from 3.13.3 to 3.14.1 <dependabot[bot]>
* Bump chalk from 2.4.2 to 3.0.0 <dependabot[bot]>
* Bump ember-export-application-global from 2.0.0 to 2.0.1 <dependabot[bot]>
* Bump ember-template-lint from 1.8.1 to 1.8.2 <dependabot[bot]>
* Bump ember-cli from 3.13.1 to 3.14.0 <dependabot[bot]>
* Bump ember-resolver from 5.3.0 to 6.0.0  <dependabot[bot]>
* Bump ember-cli-babel from 7.12.0 to 7.13.0 <dependabot[bot]>
* Bump execa from 3.3.0 to 3.4.0 <dependabot[bot]>
* Bump ember-source from 3.14.2 to 3.14.3 <dependabot[bot]>
* Bump ember-template-lint from 1.8.2 to 1.9.0 <dependabot[bot]>
* Bump ember-cli-htmlbars from 4.0.8 to 4.0.9 <dependabot[bot]>


v4.0.5 / 2019-10-25
===================
* [BugFix] Validate process object is defined when registering event callbacks for process.error & process.exit (@choheekim)
* [BugFix] Updates page title for dummy app to "Ember Exam" (@howie)
* Bump rimraf from 2.7.1 to 3.0.0 <dependabot[bot]>
* Bump ember-cli from 3.12.0 to 3.13.1 <dependabot[bot]>
* Bump ember-cli-deploy-build from 1.1.1 to 2.0.0 <dependabot[bot]>
* Bump mocha from 6.2.0 to 6.2.2 <dependabot[bot]>
* Bump ember-template-lint from 1.5.3 to 1.6.0 <dependabot[bot]>
* Bump ember-cli-babel from 7.11.1 to 7.12.0 <dependabot[bot]>
* Bump ember-cli-inject-live-reload from 2.0.1 to 2.0.2 <dependabot[bot]>
* Bump @ember/optional-features from 1.0.0 to 1.1.0  <dependabot[bot]>
* Bump ember-cli-addon-docs from 0.6.14 to 0.6.15 <dependabot[bot]>
* Bump ember-cli-htmlbars-inline-precompile from 2.1.0 to 3.0.1 <dependabot[bot]>
* Bump ember-source from 3.10.2 to 3.13.3 <dependabot[bot]>
* Bump eslint-plugin-node from 8.0.1 to 10.0.0  <dependabot[bot]>
* Bump @ember/optional-features from 0.7.0 to 1.0.0 <dependabot[bot]>
* Bump ember-cli-htmlbars from 3.1.0 to 4.0.8 <dependabot[bot]>
* Bump eslint-plugin-ember from 6.10.1 to 7.2.0 <dependabot[bot]>


v4.0.4 / 2019-09-30
===================
* [BugFix] Validate testem object is defined (@choheekim)
* Bump ember-cli-babel from 7.11.0 to 7.11.1 <dependabot[bot]>


v4.0.3 / 2019-09-24
===================
* [Feature] Introduce write-module-metadata-file (@choheekim)
* Bump ember-resolver from 5.2.1 to 5.3.0 <dependabot[bot]>


v4.0.2 / 2019-09-16
===================
* [BugFix] Ensure browserExitHandler is called for global errors (@step2yeung)
* Bump ember-cli-deploy-git from 1.3.3 to 1.3.4 <dependabot[bot]>


v4.0.1 / 2019-09-11
===================
* [Enhancement] Improve complete browser book keeping & improve request next module conditions (@step2yeung)
* Bump sinon from 7.4.0 to 7.4.2 <dependabot[bot]>


v4.0.0 / 2019-07-18
===================
* [Enhancement] Update to use node version >= 8 (@choheekim)
* [Enhancement] Throw error when there are no matching tests with a given input by file-path and module-path (@choheekim)
* [BugFix] Update yarn.lock to use v2.4.1 of ember-cli-addon-docs (@choheekim)
* Bump ember-source from 3.10.1 to 3.10.2 <dependabot[bot]>
* Bump eslint-plugin-ember from 6.6.0 to 6.7.0 <dependabot[bot]>
* Bump semver from 6.1.1 to 6.1.2 <dependabot[bot]>
* Bump testdouble from 3.12.0 to 3.12.2 <dependabot[bot]>


v3.0.3 / 2019-06-18
===================

* [Feature] Introduce module-path-filter and test-file-path-filter in ember-exam (@choheekim)
* Bump ember-source from 3.10.0 to 3.10.1 <dependabot[bot]>
* Bump rsvp from 4.8.4 to 4.8.5 <dependabot[bot]>
* Bump testdouble from 3.11.0 to 3.12.0 <dependabot[bot]>
* Bump ember-cli-addon-docs from 0.6.11 to 0.6.13 <dependabot[bot]>
* Bump ember-template-lint from 1.1.0 to 1.2.0 <dependabot[bot]>
* Bump eslint-plugin-ember from 6.5.1 to 6.6.0 <dependabot[bot]>
* Bump ember-cli-babel from 7.7.3 to 7.8.0 <dependabot[bot]>


v3.0.2 / 2019-06-03
===================

* [Enhancement] Update documentation (Add Table of Contents) (@Vasanth-freshworks)
* [Enhancement] Allow graceful exit when async iterator failes to get a module. Add emberExamExitOnError flag to hard fail (@step2yeung)
* [BugFix] Remove duplicate nav entry (@samselikoff)
* Bump ember-cli-addon-docs from 0.6.8 to 0.6.9 <dependabot[bot]>
* Bump mocha from 6.1.2 to 6.1.3 <dependabot[bot]>
* Bump ember-cli-addon-docs from 0.6.9 to 0.6.10 <dependabot[bot]>
* Bump sinon from 7.3.1 to 7.3.2 <dependabot[bot]>
* Bump eslint-plugin-ember from 6.3.0 to 6.4.1 <dependabot[bot]>
* Bump ember-source from 3.9.0 to 3.9.1 <dependabot[bot]>
* [Security] Bump jquery from 3.3.1 to 3.4.0 <dependabot[bot]>
* Bump nyc from 13.3.0 to 14.1.1 <dependabot[bot]>
* Bump ember-source from 3.9.1 to 3.10.0 <dependabot[bot]>
* Bump fs-extra from 7.0.1 to 8.0.1 <dependabot[bot]>
* Bump mocha from 6.1.3 to 6.1.4 <dependabot[bot]>
* Bump ember-cli-addon-docs from 0.6.10 to 0.6.11 <dependabot[bot]>
* Bump semver from 6.0.0 to 6.1.0 <dependabot[bot]>
* Bump eslint-plugin-ember from 6.4.1 to 6.5.0 <dependabot[bot]>
* Bump ember-try from 1.1.0 to 1.2.1 <dependabot[bot]>
* Bump semver from 6.1.0 to 6.1.1 <dependabot[bot]>
* Bump eslint-plugin-ember from 6.5.0 to 6.5.1 <dependabot[bot]>


v3.0.1 / 2019-04-09
===================

* [Enhancement] Update documentation (@step2yeung)


v3.0.0 / 2019-04-08
===================

* [Feature - Breaking] Introduce TestLoadBalancing (@choheekim) & (@step2yeung)

You will need to **replace** the use of `start()` from `Ember-Qunit` or `Ember-Mocha` in `test-helper.js` with `start()` from `ember-exam`:

```js
// test-helper.js
import start from 'ember-exam/test-support/start';

// Options passed to `start` will be passed-through to ember-qunit or ember-mocha
start();
```

This breaking change was motivated by wanting to remove the monkey-patching, of ember-qunit and ember-mocha's test-loader, ember exam was doing.

* [Bugfix] Ensure serialized test-execution browserId's are always treated as a string https://github.com/ember-cli/ember-exam/pull/233
* [Bugfix] fix breaking change: https://github.com/ember-cli/ember-exam/pull/242 (@step2yeung)
* [Enhancement] Prettify test-execution.json (@step2yeung)
* Bump ember-qunit from 4.4.0 to 4.4.1 (4 weeks ago) <dependabot[bot]>
* Bump ember-resolver from 5.1.2 to 5.1.3 (4 weeks ago) <dependabot[bot]>
* Bump testdouble from 3.10.0 to 3.11.0 (4 weeks ago) <dependabot[bot]>
* Bump ember-cli-babel from 7.4.3 to 7.5.0 (4 weeks ago) <dependabot[bot]>
* Bump ember-resolver from 5.1.1 to 5.1.2 (5 weeks ago) <dependabot[bot]>
* Bump mocha from 6.0.0 to 6.0.1 (5 weeks ago) <dependabot[bot]>
* Bump ember-cli-babel from 7.4.2 to 7.4.3 (5 weeks ago) <dependabot[bot]>
* Bump ember-qunit from 4.3.0 to 4.4.0 (5 weeks ago) <dependabot[bot]>
* Bump mocha from 5.2.0 to 6.0.0 (5 weeks ago) <dependabot[bot]>
* Bump ember-source from 3.7.3 to 3.8.0 (5 weeks ago) <dependabot[bot]>
* Bump sinon from 7.2.3 to 7.2.4 (5 weeks ago) <dependabot[bot]>
* Bump nyc from 13.2.0 to 13.3.0 (6 weeks ago) <dependabot[bot]>
* [Security] Bump handlebars from 4.0.12 to 4.1.0 (6 weeks ago) <dependabot[bot]>
* Bump ember-cli-babel from 7.4.1 to 7.4.2 (6 weeks ago) <dependabot[bot]>
* Bump ember-source from 3.7.2 to 3.7.3 (7 weeks ago) <dependabot[bot]>
* Bump ember-qunit from 4.2.0 to 4.3.0 (7 weeks ago) <dependabot[bot]>
* Bump nyc from 13.1.0 to 13.2.0 (7 weeks ago) <dependabot[bot]>
* Bump testdouble from 3.9.3 to 3.10.0 (7 weeks ago) <dependabot[bot]>
* Bump ember-cli-babel from 7.4.0 to 7.4.1 (8 weeks ago) <dependabot[bot]>
* Bump eslint-plugin-ember from 6.1.0 to 6.2.0 (8 weeks ago) <dependabot[bot]>


v2.1.5 / 2019-04-08
===================

* re-release 2.0.3 as 2.1.5, as 2.0.4...2.1.4 introduced a worth-while but unexpected breaking change. 2.0.4...2.1.4 will be re-released as 3.x


v2.1.4 / 2019-03-27
===================

* [Bugfix] Ensure serialized test-execution browserId's are always treated as a string https://github.com/ember-cli/ember-exam/pull/233

v2.1.3 / 2019-03-27
===================

* [Bugfix] fix breaking change: https://github.com/ember-cli/ember-exam/pull/242 (@step2yeung)
* [Enhancement] Prettify test-execution.json (@step2yeung)

v2.1.0 / 2019-03-27
===================

* [Feature] Introduce TestLoadBalancing <@choheekim> & <@step2yeung>
* Bump ember-qunit from 4.4.0 to 4.4.1 (4 weeks ago) <dependabot[bot]>
* Bump ember-resolver from 5.1.2 to 5.1.3 (4 weeks ago) <dependabot[bot]>
* Bump testdouble from 3.10.0 to 3.11.0 (4 weeks ago) <dependabot[bot]>
* Bump ember-cli-babel from 7.4.3 to 7.5.0 (4 weeks ago) <dependabot[bot]>
* Bump ember-resolver from 5.1.1 to 5.1.2 (5 weeks ago) <dependabot[bot]>
* Bump mocha from 6.0.0 to 6.0.1 (5 weeks ago) <dependabot[bot]>
* Bump ember-cli-babel from 7.4.2 to 7.4.3 (5 weeks ago) <dependabot[bot]>
* Bump ember-qunit from 4.3.0 to 4.4.0 (5 weeks ago) <dependabot[bot]>
* Bump mocha from 5.2.0 to 6.0.0 (5 weeks ago) <dependabot[bot]>
* Bump ember-source from 3.7.3 to 3.8.0 (5 weeks ago) <dependabot[bot]>
* Bump sinon from 7.2.3 to 7.2.4 (5 weeks ago) <dependabot[bot]>
* Bump nyc from 13.2.0 to 13.3.0 (6 weeks ago) <dependabot[bot]>
* [Security] Bump handlebars from 4.0.12 to 4.1.0 (6 weeks ago) <dependabot[bot]>
* Bump ember-cli-babel from 7.4.1 to 7.4.2 (6 weeks ago) <dependabot[bot]>
* Bump ember-source from 3.7.2 to 3.7.3 (7 weeks ago) <dependabot[bot]>
* Bump ember-qunit from 4.2.0 to 4.3.0 (7 weeks ago) <dependabot[bot]>
* Bump nyc from 13.1.0 to 13.2.0 (7 weeks ago) <dependabot[bot]>
* Bump testdouble from 3.9.3 to 3.10.0 (7 weeks ago) <dependabot[bot]>
* Bump ember-cli-babel from 7.4.0 to 7.4.1 (8 weeks ago) <dependabot[bot]>
* Bump eslint-plugin-ember from 6.1.0 to 6.2.0 (8 weeks ago) <dependabot[bot]>

v2.0.3 / 2019-01-22
===================

* ignore .nyc_output

v2.0.2 / 2019-01-22
===================

* Bump chalk from 2.4.1 to 2.4.2
* Bump debug from 4.1.0 to 4.1.1
* Bump ember-cli from 3.5.1 to 3.7.1
* Bump ember-cli-babel from 7.1.4 to 7.4.0
* Bump ember-cli-dependency-checker from 3.0.0 to 3.1.0
* Bump ember-cli-htmlbars-inline-precompile from 2.0.0 to 2.1.0
* Bump ember-qunit from 4.1.2 to 4.2.0
* Bump ember-source from 3.6.0 to 3.7.2
* Bump ember-template-lint from 0.8.23 to 1.1.0
* Bump eslint-plugin-ember from 6.0.1 to 6.1.0
* Bump eslint-plugin-node from 8.0.0 to 8.0.1
* Bump rimraf from 2.6.2 to 2.6.3
* Bump sinon from 7.1.1 to 7.2.3
* Bump testdouble from 3.9.1 to 3.9.3
* Run test:all to trigger ember & node test in ci, add missing single quote, and change number of tests running
* `setResolver()` from `@ember/test-helpers`

v2.0.1 / 2018-12-07
===================

  * ember-exam now sets `process.env.EMBER_EXAM_SPLIT_COUNT`, this allows testem scripts to pick up this configuration via `parallel: process.env.EMBER_EXAM_SPLIT_COUNT`

v2.0.0 / 2018-12-04
===================

  * Bump Node support to: ^6.14.0 || ^8.10.0 || >= 10.*
  * Update/Modernize all dependencies
  * Update/Modernize codebase
  * tranisition from ember-cli-qunit to ember-qunit

v1.0.0 / 2017-11-02
==================

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
