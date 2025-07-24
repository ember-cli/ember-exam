# Randomization Iterator

Randomization can be helpful for identifying non-atomic or order-dependent tests. To that end, Ember Exam provides an iterator to make it easy to test lots of variations in your test suite order quickly.

```bash
ember exam:iterate <num>
```

This command will build your application once, and then run the test suite with the `random` option for the specified number of iterations. You can optionally skip the build by using a previous build via the `path` option:

```bash
ember exam:iterate <num> --path <build-path>
```

Finally, you can pass additional options through to the exam command used to run the tests via the `options` flag:

```bash
ember exam:iterate <num> --options <options>
```

The `options` should be a string matching what you would use via the CLI.

