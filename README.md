# Ember Exam

[![Build Status](https://travis-ci.org/trentmwillis/ember-exam.svg?branch=master)](https://travis-ci.org/trentmwillis/ember-exam)
[![NPM Version](https://badge.fury.io/js/ember-exam.svg)](https://badge.fury.io/js/ember-exam)
[![Ember Observer Score](https://emberobserver.com/badges/ember-exam.svg)](https://emberobserver.com/addons/ember-exam)
[![Code Climate](https://codeclimate.com/github/trentmwillis/ember-exam/badges/gpa.svg)](https://codeclimate.com/github/trentmwillis/ember-exam)
[![Node Test Coverage](https://codeclimate.com/github/trentmwillis/ember-exam/badges/coverage.svg)](https://codeclimate.com/github/trentmwillis/ember-exam/coverage)

Ember Exam is an addon to allow you more control over how you run your tests when used in conjunction with [Ember CLI QUnit](https://github.com/ember-cli/ember-cli-qunit). It provides the ability to randomize, split, and parallelize your test suite by adding a more robust CLI command.

It started as a way to help reduce flaky tests and encourage healthy test driven development. It's like [Head & Shoulders](http://www.headandshoulders.com/) for your tests!

## How To Use

Using Ember Exam is fairly straightforward as it extends directly from the default Ember-CLI `test` command. So, by default, it will work exactly the same as `ember test`.

```bash
$ ember exam
$ ember exam --filter='acceptance'
$ ember exam --server
```

 The idea is that you should be able to replace `ember test` with `ember exam` and never look back.

### Randomization

```bash
$ ember exam --random[=<seed>]
```

The `random` option allows you to randomize the order in which your tests run. You can optionally specify a "seed" value from which to randomize your tests in order to reproduce results. The seed can be any string value. Regardless of whether you specify a seed or not, Ember Exam will log the seed value used for the randomization at the beginning of the test run:

```bash
$ ember exam --random
$ Randomizing tests with seed: liv5d1ixkco6qlatl6o7mbo6r

$ ember exam --random=this_is1337
$ Randomizing tests with seed: this_is1337
```

_Note: You must be using QUnit version `1.23.0` or greater for this feature to work properly._

### Splitting

```bash
$ ember exam --split=<num>
```

The `split` option allows you to specify a number of partitions greater than one to spread your tests across. Ember Exam will then proceed to run the first batch of tests.

```bash
$ ember exam --split=<num> --partition=<num>
```

The `partition` option allows you to specify which test group to run after using the `split` option. It is one-indexed, so if you specifiy a split of 3, the last group you could run is 3 as well.

<!--```bash
$ ember exam --split=<num> --weighted
```

The `weighted` option splits tests by weighting them according to type; `acceptance` tests weigh more than `unit` tests weigh more than `jshint` tests. This helps make sure the various test groupings run in similar amounts of time. -->

#### Split Test Parallelization

```bash
$ ember exam --split=<num> --parallel
```

The `parallel` option allows you to run your split tests across multiple test pages in parallel in [Testem](https://github.com/testem/testem). It will use a separate browser instance for each group of tests. So, if you specify a split of 3, then 3 browser instances will be spawned with the output looking something like:

```bash
ok 1 PhantomJS 1.9 - Exam Partition #1 - some test
ok 2 PhantomJS 1.9 - Exam Partition #3 - some other other test
ok 3 PhantomJS 1.9 - Exam Partition #2 - some other test
```

Ember Exam will respect the `parallel` setting of your [Testem config file](https://github.com/testem/testem/blob/master/docs/config_file.md#config-level-options) while running tests in parallel. _Note that the default value for `parallel` in Testem is 1, which means you'll need a non-default value to actually see parallel behavior._

_Note: You must be using Testem version `1.5.0` or greater for this feature to work properly._

## Advanced Configuration

Ember Exam does its best to allow you to run your test suite in a way that is effective for your individual needs. To that end, there are lots of advanced ways to configure your setup by integrating with other aspects of the Ember testing environment. The following sections will cover a few of the more common scenarios.

### Ember Try & CI Integration

Integrating ember-exam with [ember-try](https://github.com/ember-cli/ember-try) is remarkably easy. Simply define a [`command` in your `ember-try.js` config](https://github.com/ember-cli/ember-try#configuration-files) that leverages the `exam` command:

```js
// config/ember-try.js
module.exports = {
  command: 'ember exam --split 3 --parallel',
  // ...
};
```

Using [environmental variables](https://nodejs.org/api/process.html#process_process_env) gives you flexibility in how you run your tests. For instance, you could distribute your tests across processes instead of parallelizing them by specifying a `PARTITION` variable in your process environment and then consuming it like so:

```js
module.exports = {
  command: 'ember exam --split 20 --partition ' + process.env.PARTITION,
  // ...
};
```

If you are working with [Travis CI](https://travis-ci.org/) then you can also easily set up seeded-random runs based on PRs. Similar to the following:

```js
var command = [ 'ember', 'exam', '--random' ];
var pr = process.env.TRAVIS_PULL_REQUEST;

if (pr) {
  command.push(pr);
}

module.exports = {
  command: command.join(' '),
  // ...
};
```

You can refer to [Travis' default environment variables](https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables) to see what else you could possibly leverage for your test setup.

### Test Suite Segmentation

Some test suites like to segment which tests run based on various facets such as type of test, feature being tested, and so on. This can be accomplished by leveraging Testem's ability to have multiple test pages:

```json
{
  "test_page": [
    "tests/index.html?filter=acceptance",
    "tests/index.html?filter=!acceptance"
  ]
}
```

You can use this feature in conjunction with Ember Exam's features, which will allow you to segment your test suite but still gain benefits from randomization and splitting.
