### Filtering

Ember Exam provides options to filter test suites by two types - module path and test file path.

```bash
$ ember exam --module-path=<module-path>
```

#### For Vite Apps

The `file-path` option allows you to filter modules by the given relative path that is generated from `import.meta.glob(...)` in your `tests/index.html`.

```bash
# This will run tests that are defined in `/my-application/tests/unit/my-test.js`
$ ember exam --file-path='/my-application/tests/unit/my-test.js'

# This will run all test files that are under `/my-application/tests/unit/`
$ ember exam --file-path='/my-application/tests/unit/*.js'
```


#### For non-Vite Apps


The `module-path` option allows you to filter module paths by a given value. Module paths are mapped by test files and they are generated during `ember build`. After the build, `tests.js` file is created and it resides under [build-directory]/assets. 

The file is combined of all tests in an application and it has a form of `define("<module-path>", others..`.

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
