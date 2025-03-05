# Ember Exam
![Build Status](https://github.com/ember-cli/ember-exam/actions/workflows/ci.yml/badge.svg?event=push)
[![NPM Version](https://badge.fury.io/js/ember-exam.svg)](https://badge.fury.io/js/ember-exam)
[![Ember Observer Score](https://emberobserver.com/badges/ember-exam.svg)](https://emberobserver.com/addons/ember-exam)

Ember Exam is an addon to allow you more control over how you run your tests when used in conjunction with [ember-qunit](https://github.com/emberjs/ember-qunit). It provides the ability to randomize, split, parallelize, and load-balance your test suite by adding a more robust CLI command.

It started as a way to help reduce flaky tests and encourage healthy test driven development. It's like [Head & Shoulders](http://www.headandshoulders.com/) for your tests!

[![Introduction to Ember Exam](https://cloud.githubusercontent.com/assets/2922250/22800360/157ad67c-eed7-11e6-8d33-d2c59238c7f1.png)](https://embermap.com/video/ember-exam)

The [documentation website](https://ember-cli.github.io/ember-exam/) contains examples and API information.

## Table of Contents

- [Compatibility](#compatibility)
- [Installation](#installation)
- [How To Use](#how-to-use)
  * [Version < `3.0.0`](#version--300)
  * [Randomization](#randomization)
    + [Randomization Iterator](#randomization-iterator)
  * [Splitting](#splitting)
    + [Split Test Parallelization](#split-test-parallelization)
  * [Test Load Balancing](#test-load-balancing)
      - [Test Failure Reproduction](#test-failure-reproduction)
  * [Preserve Test Name](#preserve-test-name)
- [Advanced Configuration](#advanced-configuration)
  * [Ember Try & CI Integration](#ember-try--ci-integration)
  * [Test Suite Segmentation](#test-suite-segmentation)

## Compatibility

* Ember.js v4.8 or above
* Ember CLI v4.8 or above
* Node.js v18 or above

## Installation

Installation is as easy as running:

```bash
$ npm install --save-dev ember-exam
```

## How To Use

Using Ember Exam is fairly straightforward as it extends directly from the default Ember-CLI `test` command. So, by default, it will work exactly the same as `ember test`.

```bash
$ ember exam
$ ember exam --filter='acceptance'
$ ember exam --server
$ ember exam --load-balance --parallel=1
```

For more information and examples, please visit the [documentation website](https://ember-cli.github.io/ember-exam/).
```bash
# A value of filter is acceptance
$ ember exam --filter 'acceptance'

# A value of parallel is 2
$ ember exam --load-balance --parallel=2 --server

# If a `=` is not used to pass a value to an option that requires a value, it will take anything passed after a space as it's value
# In this instance, the value of parallel is --server
$ ember exam --load-balance --parallel --server
```

The idea is that you can replace `ember test` with `ember exam` and never look back.

To get the unique features of Ember Exam (described in-depth below), you will need to **replace** the use of `start()` from `ember-qunit` in `test-helper.js` with `start()` from `ember-exam`:

```js
// test-helper.js
import { start } from 'ember-exam/test-support';

// Options passed to `start` will be passed-through to ember-qunit
start();
```

## How to use with Vite

All of the above applies, but we need to tell vite to build the app before telling ember/exam to run tests on that output.

Update your test-helper.js or test-helper.ts, to have add the ember-exam `start` function:
```diff
  // ...
  import { setApplication } from '@ember/test-helpers';
  import { setup } from 'qunit-dom';
- import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
+ import { setupEmberOnerrorValidation } from 'ember-qunit';
+ import { start as startEmberExam } from 'ember-exam/test-support';

  export function start() {
    setApplication(Application.create(config.APP));

    setup(QUnit.assert);
    setupEmberOnerrorValidation();

-   qunitStart();
+   // Options passed to `start` will be passed-through to ember-qunit
+   startEmberExam();
  }
```

Testing development:
```bash 
NODE_ENV=development vite build --mode test
ember exam --path dist
```

Testing production:
```bash
vite build --mode test
ember exam --path dist
```

### Version < `3.0.0`


Prior to `2.1.0`, Ember Exam must be loaded by importing `addon-test-support/load.js` and calling `loadEmberExam`:

```js
// test-helper.js
import loadEmberExam from 'ember-exam/test-support/load';

loadEmberExam();

```

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

_Note: You must be using QUnit version `1.23.0` or greater for this feature to work properly.

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

### Generating Module Metadata File For Test Execution

```bash
$ ember exam --write-module-metadata-file
$ ember exam --wmmf
```

The `--write-module-metadata-file`, `wmmf` as an alias, allows you to generate a module metadata file after a test run. The file provides metadata about the test modules executed.

It creates a json file, `module-metadata-<timestamp>.json`, which contains an array of elements representing metadata of modules executed by sorted by ascending order:
```json
[
  {
    "moduleName": "Module-name",
    "total": "Total number of tests in the module",
    "passed": "A number of passed tests in the module",
    "failed": "A number of failed tests in the module",
    "skipped": "A number of skipped tests in the module",
    "duration": "ms in Total duration to execute the module",
    "failedTests": "A list of failed tests"
  }
]
```

and it looks something like below:
```json
[
  {
    "moduleName": "Slowest-module",
    "total": 12,
    "passed": 9,
    "failed": 1,
    "skipped": 2,
    "duration": 153,
    "failedTests": ["failed-test-1"]
  },
  {
    "moduleName": "Fastest-module",
    "total": 2,
    "passed": 1,
    "failed": 0,
    "skipped": 0,
    "duration": 123,
    "failedTests": []
  }
]
```


### Splitting

```bash
$ ember exam --split=<num>
```

The `split` option allows you to specify the number of partitions greater than one to spread your tests across. Ember Exam will then proceed to run the first batch of tests.

```bash
$ ember exam --split=<num> --partition=<num>
```

The `partition` option allows you to specify which test group to run after using the `split` option. It is one-indexed, so if you specify a split of 3, the last group you could run is 3 as well. You can also run multiple partitions, e.g.:

```bash
$ ember exam --split=4 --partition=1 --partition=2
```

_Note: Ember Exam splits tests by modifying the ember-qunit's `TestLoader` to bucket each test file into a partition, where each partition has an even number of test files. This makes it possible to have unbalanced partitions. To run your tests with balanced partitions, consider using `--load-balance`. For more info, see [_Test Load Balancing_](#test-load-balancing).

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
ember exam --split=3 --partition=1,2 --parallel
```

```bash
# container 2
ember exam --split=3 --partition=3 --parallel
```

**Note 1**: _Ember Exam will respect the `parallel` setting of your [Testem config file](https://github.com/testem/testem/blob/master/docs/config_file.md#config-level-options) while running tests in parallel. The default value for `parallel` in Testem is 1, which means you'll need a non-default value to actually see parallel behavior._

**Note 2**: _Ember Exam sets `process.env.EMBER_EXAM_SPLIT_COUNT` for convenience. You can use this in your Testem file._

**Note 3**: _You must be using Testem version `1.5.0` or greater for this feature to work properly._

### Filtering

Ember Exam provides options to filter test suites by two types - module path and test file path.

```bash
$ ember exam --module-path=<module-path>
```

The `module-path` option allows you to filter module paths by a given value. Module paths are mapped by test files and they are generated during `ember build`. After the build, `tests.js` file is created and it resides under <build-directory>/assets. The file is combined of all tests in an application and it has a form of `define("<module-path>", others..`.

The value for `module-path` can have either string or regular expression, for instance:

```bash
# When module path value is string. This will run all modules which match with the passed value
$ ember exam --module-path='dummy/tests/helpers/module-for-acceptance'

# When module path value is regex. This will run all modules which have `dummy` in it
$ ember exam --module-path='!/dummy/'
```

The `file-path` option is to filter tests by *test file path*. The test file path is a location of the test file in a file system. You can specify `file-path` to a location of specific test file path or you can use wildcards in paths to target multiple test files.

```bash
# This will run tests that are defined in `/my-application/tests/unit/my-test.js`
$ ember exam --file-path='/my-application/tests/unit/my-test.js'

# This will run all test files that are under `/my-application/tests/unit/`
$ ember exam --file-path='/my-application/tests/unit/*.js'
```

### Test Load Balancing

```bash
$ ember exam --parallel=<num> --load-balance
```

The `load-balance` option allows you to load balance test files against multiple browsers. It will order the test files by test types, e.g. acceptance | integration | unit, and load balance the ordered test files between the browsers dynamically rather than statically.
**Note:** parallel must be used along with load-balance to specify a number of browser(s)

The `load-balance` option was added to version 1.1 to address execution performance when running against a large test suite.

Web browsers and the testem server communicate via promise in order to send and receive test file. The promise timeout value is set to 15 seconds, and is configurable by adding `asyncTimeout=[timeout]` as a querystring param in the test URL or adding to the `test_page` option in the testem config.
For example, if you specify `load-balance` and `parallel` equals 3, then three browser instances will be created and the output will look something like:

```bash
# ember exam --parallel=3 --load-balance
ok 1 Chrome 66.0 - Browser Id 1 - some test
ok 2 Chrome 66.0 - Browser Id 2 - some another test
ok 3 Chrome 66.0 - Browser Id 3 - some the other test
```

You can also specify the `split` and `partition` options with `load-balance` to load a portion of test modules on multiple CI containers.

```bash
$ ember exam --split=<num> --partition=<num> --parallel=<num> --load-balance
```

This command will split test files and load-balance tests from the specified partition across the browsers. For example `ember exam --split=2 --partition=1 --parallel=3 --load-balance`, the complete list of test files are split into two halves. With the first half of the list load balanced against three browsers. The output will look something like below:

```bash
# ember exam --split=2 --partition=1 --parallel=3 --load-balance
ok 1 Chrome 66.0 - Exam Partition 1 - browser Id 1 - some test
ok 2 Chrome 66.0 - Exam Partition 1 - browser Id 2 - another test
ok 3 Chrome 66.0 - Exam Partition 1 - browser Id 3 - some the other test
```


**Important information on Load Balancing**

1. The `--load-balance` option is currently only supported in CI mode and for that reason no-launch cannot be used with load-balance.
2. You must be using `ember-cli` version 3.2.0 or greater for load balancing and test failure reproduction features to work properly.
3. You must be using `ember-qunit` version 4.1.1 or greater for this feature to work properly.
4. You must be using `qunit` version 2.13.0 or greater for this feature to work properly.

##### Test Failure Reproduction

Due to the dynamic nature of the load-balance option, test file execution order can vary between runs. In order to reproduce a past test execution, the execution must be recorded via passing --write-execution-file or --wef, which allows generating a JSON file that enables rerunning the past test execution. The option is only allowed when load-balance is passed.

```bash
# The command will load in test balanced mode with <num> of browser(s). After the test suite execution, it will generate a test-execution json file.
$ ember exam --parallel=<num> --load-balance --wef
$ ember exam --parallel=<num> --load-balance --write-execution-file
```

The file is stored in the root directory and the naming structure is `test-execution-<timestamp>.json`.
To replay the test execution for particular browser(s), do the following:

```bash
# The command will read a test execution file specified for `replay-execution` and execute a browser Id(s) from `replay-browser`
$ ember exam --replay-execution=[string] --replay-browser=[num]
```

`replay-execution` allows you to specify a path to the json file to run execution against and `replay-browser` is to specify browser ID(s) to execute.

```bash
# The command will read test-execution-000000.json and load the list of modules mapped to browserId 1
$ ember exam --replay-execution=test-execution-000000.json --replay-browser=1
```

The above command will read `test-execution-000000.json` and load the list of modules which is mapped by browser ID #1.

`replay-browser` can be an array of browser IDs. For instance `--replay-browser=1,2` will start two browsers and execute a list of modules which were previously run by browsers #1 and #2.

```bash
# The command will read test-execution-000000.json and load the list of module mapped to browserId 1 and 2
$ ember exam --replay-execution=test-execution-000000.json --replay-browser=1,2
```

When `replay-browser` value is not specified it will execute browserId(s) read from `failedBrowser` in the test execution file.

```bash
# The command will read test-execution-000000.json and load the list of modules mapped to browserIds from failedBrowser in the json file.
$ ember exam --replay-execution=test-execution-000000.json
```

When `replay-browser` value is not specified and there is no value for `failedBrowser` in the json file it will rerun all list of modules.

```bash
# The command will read test-execution-000000.json and load the list of module mapped to all browserIds when failedBrowser is none in the json file
$ ember exam --replay-execution=test-execution-000000.json
```

**Important information on `--replay-execution` and `--replay-browser`**

1. You must be using `ember-cli` version 3.2.0 or greater for load-balnce and test failure reproduction features to work properly.
2. You must be using `ember-qunit` version 4.1.1 or greater for this feature to work properly.
3. You must be using `qunit` version 2.8.0 or greater for this feature to work properly.

#### Preserve Test Name

When using `--split` and/or `--load-balance` the output will look something like:

```bash
# ember exam --split=2 --partition=1 --parallel=3 --load-balance
ok 1 Chrome 66.0 - Exam Partition 1 - browser Id 1 - some test
ok 2 Chrome 66.0 - Exam Partition 1 - browser Id 2 - another test
ok 3 Chrome 66.0 - Exam Partition 1 - browser Id 3 - some the other test
```
However, if you change the amount of parallelization, or randomize across partitions, the output will change for the same test, which may be an issue if you are tracking test insights over time.

```bash
# ember exam --split=2 --partition=1 --parallel=2 --load-balance
ok 1 Chrome 66.0 - Exam Partition 1 - browser Id 2 - some test
ok 2 Chrome 66.0 - Exam Partition 1 - browser Id 1 - another test
ok 3 Chrome 66.0 - Exam Partition 1 - browser Id 2 - some the other test
```
You can add `--preserve-test-name` to remove the dynamic segments of the output (partition and browser) to ensure the output test names are always the same.

```bash
# ember exam --split=2 --partition=1 --parallel=3 --load-balance --preserve-test-name
ok 1 Chrome 66.0 - some test
ok 2 Chrome 66.0 - another test
ok 3 Chrome 66.0 - some the other test
```

## Advanced Configuration

Ember Exam does its best to allow you to run your test suite in a way that is effective for your individual needs. To that end, there are lots of advanced ways to configure your setup by integrating with other aspects of the Ember testing environment. The following sections will cover a few of the more common scenarios.

### Ember Try & CI Integration

Integrating ember-exam with [ember-try](https://github.com/ember-cli/ember-try) is remarkably easy. Define a [`command` in your `ember-try.js` config](https://github.com/ember-cli/ember-try#configuration-files) that leverages the `exam` command:

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
const command = [ 'ember', 'exam', '--random' ];
const pr = process.env.TRAVIS_PULL_REQUEST;

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
