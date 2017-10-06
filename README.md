# Ember Exam

[![Build Status](https://travis-ci.org/trentmwillis/ember-exam.svg?branch=master)](https://travis-ci.org/trentmwillis/ember-exam)
[![NPM Version](https://badge.fury.io/js/ember-exam.svg)](https://badge.fury.io/js/ember-exam)
[![Ember Observer Score](https://emberobserver.com/badges/ember-exam.svg)](https://emberobserver.com/addons/ember-exam)
[![Code Climate](https://codeclimate.com/github/trentmwillis/ember-exam/badges/gpa.svg)](https://codeclimate.com/github/trentmwillis/ember-exam)
[![Node Test Coverage](https://codeclimate.com/github/trentmwillis/ember-exam/badges/coverage.svg)](https://codeclimate.com/github/trentmwillis/ember-exam/coverage)

Ember Exam is an addon to allow you more control over how you run your tests when used in conjunction with [Ember CLI QUnit](https://github.com/ember-cli/ember-cli-qunit) or [Ember CLI Mocha](https://github.com/ember-cli/ember-cli-mocha). It provides the ability to randomize, split, and parallelize your test suite by adding a more robust CLI command.

It started as a way to help reduce flaky tests and encourage healthy test driven development. It's like [Head & Shoulders](http://www.headandshoulders.com/) for your tests!

[![Introduction to Ember Exam](https://cloud.githubusercontent.com/assets/2922250/22800360/157ad67c-eed7-11e6-8d33-d2c59238c7f1.png)](https://embermap.com/video/ember-exam)

## Installation

Installation is as easy as running:

```bash
$ ember install ember-exam
```

## How To Use

Using Ember Exam is fairly straightforward as it extends directly from the default Ember-CLI `test` command. So, by default, it will work exactly the same as `ember test`.

```bash
$ ember exam
$ ember exam --filter='acceptance'
$ ember exam --server
```

The idea is that you should be able to replace `ember test` with `ember exam` and never look back.

However, to get the unique features of Ember Exam (described in-depth below), you will need to load Ember Exam before your test suite runs. This is done by invoking the `loadEmberExam` function, usually from within `test-helper.js` but it can be done anywhere that executes prior to your tests loading.

```js
// test-helper.js
import loadEmberExam from 'ember-exam/test-support/load';

loadEmberExam();
```

If you are using `ember-cli-qunit@>=4`, you need to call `loadEmberExam` before the call to `start`.

### Version `>=0.7.0`

Starting with version `0.7.0`, Ember Exam must be loaded explicitly by calling `loadEmberExam`. Prior to this release, Ember Exam would load its functionality automatically when the document loaded. This change was made to remove some "magic" from the system and takes a cue from the [changes in `ember-cli-qunit@4`](https://github.com/ember-cli/ember-cli-qunit#upgrading). For more details on how to load Ember Exam, see the _How To Use_ section above.

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

If you use `random` without specifying a seed, it must be the last argument you pass. Otherwise, Ember Exam will attempt to interpret any following arguments as the seed value. In other words:

```bash
# don't do this
ember exam --random --split=2
Randomizing tests with seed: --split=2 # this is not what we wanted

# do this instead
ember exam --split=2 --random
Randomizing tests with seed: hwr74nkk55vzpvi
```

_Note: You must be using QUnit version `1.23.0` or greater for this feature to work properly. This feature is not currently supported by Mocha._

#### Randomization Iterator

Randomization can be helpful for identifying non-atomic or order-dependent tests. To that end, Ember Exam provides an iterator to make it easy to test lots of variations in your test suite order quickly.

```bash
$ ember exam:iterate <num>
```

This command will build your application once, and then run the test suite with the `random` option for the specified number of iterations. You can optionally skip the build by using a previous build via the `path` option:

```bash
$ ember exam:iterate <num> --path <build-path>
```

Finally, you can pass additional options through to the exam command used to run the tests via the `options` flag:

```bash
$ ember exam:iterate <num> --options <options>
```

The `options` should be a string matching what you would use via the CLI.

_Note: This feature is not currently supported by Mocha._

### Splitting

```bash
$ ember exam --split=<num>
```

The `split` option allows you to specify a number of partitions greater than one to spread your tests across. Ember Exam will then proceed to run the first batch of tests.

```bash
$ ember exam --split=<num> --partition=<num>
```

The `partition` option allows you to specify which test group to run after using the `split` option. It is one-indexed, so if you specify a split of 3, the last group you could run is 3 as well. You can also run multiple partitions, e.g.:

```bash
$ ember exam --split=4 --partition=1 --partition=2
```

_Note: Ember Exam splits test by modifying the Ember-CLI `TestLoader`, which means that tests are split up according to AMD modules, so it is possible to have unbalanced partitions. For more info, see [issue #60](https://github.com/trentmwillis/ember-exam/issues/60)._

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
ok 1 PhantomJS 1.9 - Exam Partition 1 - some test
ok 2 PhantomJS 1.9 - Exam Partition 3 - some other other test
ok 3 PhantomJS 1.9 - Exam Partition 2 - some other test
```

You can also combine the `parallel` option with the `partition` option to split tests, and then recombine partitions into parallel runs. This would, for example, allow you to run tests in multiple CI containers and have each CI container parallelize its list of tests.

For example, if you wanted to run your tests across two containers, but have one of them run twice as many tests as the other, and run them in parallel, you could do this:

```bash
# container 1
ember exam --split=3 --partition=1 --partition=2 --parallel
```

```bash
# container 2
ember exam --split=3 --partition=3
```

**Note 1**: _Ember Exam will respect the `parallel` setting of your [Testem config file](https://github.com/testem/testem/blob/master/docs/config_file.md#config-level-options) while running tests in parallel. The default value for `parallel` in Testem is 1, which means you'll need a non-default value to actually see parallel behavior._

**Note 2**: _You must be using Testem version `1.5.0` or greater for this feature to work properly._

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

If you are working with [Travis CI](https://travis-ci.org/) then you can also easily set up seeded-random runs based on PR numbers. Similar to the following:

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
