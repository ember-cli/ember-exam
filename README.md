# Ember Exam

Ember Exam is an addon to allow you more control over how you run your tests. It provides the ability to randomize, split, filter, and parallelize your test suite by adding a more robust CLI command.

## How To Use

Using Ember Exam is fairly straightforward as it extends directly from the default Ember-CLI `test` command. So, by default, it will work exactly the same as `ember test`:

```bash
$ ember exam // same thing as ember test
```

However, it adds additional options when running the command in non-serving mode.

## Splitting

```bash
$ ember exam --split=<num>
```

The `split` option allows you to specify a number of files greater than one to spread your tests across. Will proceed to run only the first bacth of tests.

```bash
$ ember exam --split=<num> --split-file=<num>
```

The `split-file` options allows you to specify which test file to run after using the `split` option. It is one-indexed, so if you specifiy a split of 3, the highest file you could run is 3 as well.

```bash
$ ember exam --split=<num> --parallel
```

The `parallel` option allows you to run your split tests across multiple child processes.

## Randomization

```bash
$ ember exam --random
```

The `random` option allows you to run your tests in a random order within their modules. This means that the modules will be randomly ordered and then the tests within them will be randomly ordered. You can also use `--random=tests` to get the same effect.

If you specify `--random=modules`, it will only randomize the test modules and leave the individual tests in place.

```bash
$ ember exam --random --seed=<num>
```

The `seed` option allows you to specify a starting value from which to randomize your test/module order. This allows reproduction of issues that occurred when running randomly. There are no bounds on what the seed value can be.

## Filtering

```bash
$ ember exam --hard-filter=<string>
```

The default `filter` option only applies a filter in browser that is used by QUnit; this means all your tests are still loaded and parsed, but only a subset are run.

The `hard-filter` option filters the tests after build so that your only load and parse those tests that are being run.

```bash
$ ember exam --regex-filter=<regex>
```

Similar to the `hard-filter` option, `regex-filter` allows you to filter the tests after build to only include those matching a regular expression.
