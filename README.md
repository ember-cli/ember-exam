# Ember Exam

[![Build Status](https://travis-ci.org/trentmwillis/ember-exam.svg)](https://travis-ci.org/trentmwillis/ember-exam)

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

```bash
$ ember exam --split=<num> --weighted
```

The `weighted` option splits tests by weighting them according to type; `acceptance` tests weigh more than `unit` tests weigh more than `jshint` tests. This helps make sure the various test groupings run in similar amounts of time.

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
