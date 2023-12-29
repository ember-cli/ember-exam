### Generating Module Metadata File For Test Execution

```bash
$ ember exam --write-module-metadata-file
$ ember exam --wmmf
```

The `--write-module-metadata-file`, `wmmf` as an alias, allows you to generate a module metadata file after a test run. The module metadata file provides information about the test modules executed.

It creates a json file, `module-metadata-<timestamp>.json`, which contains an array of elements representing metadata of modules executed by sorted by ascending order:
```json
[
  {
    "moduleName": "Module-name",
    "total": "Total number of tests in the module",
    "passed": "A number of passed tests in the module",
    "failed": "A number of failed tests in the module",
    "skipped": "A number of skipped tests in the module",
    "duration": "(ms) duration to execute all tests within the module",
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

