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
    "name": "Module-name",
    "total": "Total number of tests in the module",
    "runtime": "ms in Total duration to execute the module"
  }
]
```

and it looks something like below:
```json
[
  {
    "name": "Slowest Module",
    "total": 12,
    "runtime": 2159
  },
  {
    "name": "Fastest Module",
    "total": 9,
    "runtime": 125
  }
]
```

_Note: This feature is not currently supported by Mocha._
