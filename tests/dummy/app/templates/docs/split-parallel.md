# Split Test Parallelization

```bash
ember exam --split=<num> --parallel
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
