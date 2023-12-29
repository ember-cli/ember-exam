# Splitting

```bash
ember exam --split=<num>
```

The `split` option allows you to specify the number of partitions greater than one to spread your tests across. Ember Exam will then proceed to run the first batch of tests.

```bash
ember exam --split=<num> --partition=<num>
```

The `partition` option allows you to specify which test group to run after using the `split` option. It is one-indexed, so if you specify a split of 3, the last group you could run is 3 as well. You can also run multiple partitions, e.g.:

```bash
ember exam --split=4 --partition=1 --partition=2
```

_Note: Ember Exam splits tests by modifying the ember-qunit's `TestLoader` to bucket each test file into a partition, where each partition has an even number of test files. This makes it possible to have unbalanced partitions. To run your tests with balanced partitions, consider using `--load-balance`. For more info, see [_Test Load Balancing_](#test-load-balancing).
