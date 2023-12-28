# Test Load Balancing

```bash
ember exam --parallel=<num> --load-balance
```

The `load-balance` option allows you to load balance test files against multiple browsers. It will order the test files by test types, e.g. acceptance | integration | unit, and load balance the ordered test files between the browsers dynamically rather than statically.
**Note:** parallel must be used along with load-balance to specify a number of browser(s)

The `load-balance` option was added to version 1.1 to address execution performance when running against a large test suite.

Web browsers and the testem server communicate via promise in order to send and receive a test file. The promise timeout value is set to be 2 seconds, and the timeout can be customized by adding asyncTimeout=[timeout] as a querystring param in the test URL or adding to a testem config.
For example, if you specify `load-balance` and `parallel` equals 3, then three browser instances will be created and the output will look something like:

```bash
# ember exam --parallel=3 --load-balance
ok 1 Chrome 66.0 - Browser Id 1 - some test
ok 2 Chrome 66.0 - Browser Id 2 - some another test
ok 3 Chrome 66.0 - Browser Id 3 - some the other test
```

You can also specify the `split` and `partition` options with `load-balance` to load a portion of test modules on multiple CI containers.

```bash
ember exam --split=<num> --partition=<num> --parallel=<num> --load-balance
```

This command will split test files and load-balance tests from the specified partition across the browsers. For example `ember exam --split=2 -partition=1 --parallel=3 --load-balance`, the complete list of test files are split into two halves. With the first half of the list load balanced against three browsers. The output will look something like below:

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

## Test Failure Reproduction

Due to the dynamic nature of the load-balance option, test file execution order can vary between runs. In order to reproduce a past test execution, the execution must be recorded via passing --write-execution-file or --wef, which allows generating a JSON file that enables rerunning the past test execution. The option is only allowed when load-balance is passed.

```bash
# The command will load in test balanced mode with <num> of browser(s). After the test suite execution, it will generate a test-execution json file.
ember exam --parallel=<num> --load-balance --wef
ember exam --parallel=<num> --load-balance --write-execution-file
```

The file is stored in the root directory and the naming structure is `test-execution-<timestamp>.json`.
To replay the test execution for particular browser(s), do the following:

```bash
# The command will read a test execution file specified for `replay-execution` and execute a browser Id(s) from `replay-browser`
ember exam --replay-execution=[string] --replay-browser=[num]
```

`replay-execution` allows you to specify a path to the json file to run execution against and `replay-browser` is to specify browser ID(s) to execute.

```bash
# The command will read test-execution-000000.json and load the list of modules mapped to browserId 1
ember exam --replay-execution=test-execution-000000.json --replay-browser=1
```

The above command will read `test-execution-000000.json` and load the list of modules which is mapped by browser ID #1.

`replay-browser` can be an array of browser IDs. For instance `--replay-browser=1,2` will start two browsers and execute a list of modules which were previously run by browsers #1 and #2.

```bash
# The command will read test-execution-000000.json and load the list of module mapped to browserId 1 and 2
ember exam --replay-execution=test-execution-000000.json --replay-browser=1,2
```

When `replay-browser` value is not specified it will execute browserId(s) read from `failedBrowser` in the test execution file.

```bash
# The command will read test-execution-000000.json and load the list of modules mapped to browserIds from failedBrowser in the json file.
ember exam --replay-execution=test-execution-000000.json
```

When `replay-browser` value is not specified and there is no value for `failedBrowser` in the json file it will rerun all list of modules.

```bash
# The command will read test-execution-000000.json and load the list of module mapped to all browserIds when failedBrowser is none in the json file
ember exam --replay-execution=test-execution-000000.json
```

**Important information on `--replay-execution` and `--replay-browser`**

1. You must be using `ember-cli` version 3.2.0 or greater for load-balnce and test failure reproduction features to work properly.
2. You must be using `ember-qunit` version 4.1.1 or greater for this feature to work properly.
3. You must be using `qunit` version 2.8.0 or greater for this feature to work properly.
