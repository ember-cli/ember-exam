# Preserve Test Name

When using `--split` and/or `--load-balance` the output will look something like:

```bash
# ember exam --split=2 --partition=1 --parallel=3 --load-balance
ok 1 Chrome 66.0 - Exam Partition 1 - browser Id 1 - some test
ok 2 Chrome 66.0 - Exam Partition 1 - browser Id 2 - another test
ok 3 Chrome 66.0 - Exam Partition 1 - browser Id 3 - some the other test
```
However, if you change the amount of parallelization, or randomize accross partitions, the output will change for the same test, which may be an issue if you are tracking test insights over time. 

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
