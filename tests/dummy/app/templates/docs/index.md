# Quickstart

## Installation

Installation is as easy as running:

```bash
ember install ember-exam
```

## Usage

Using Ember Exam is fairly straightforward as it extends directly from the default Ember-CLI `test` command. So, by default, it will work exactly the same as `ember test`.

```bash
ember exam
ember exam --filter='acceptance'
ember exam --server
ember exam --load-balance --parallel=1
```

A value to an option can be passed with either `=` or a space.

```bash
# A value of filter is acceptance
ember exam --filter 'acceptance'

# A value of parallel is 2
ember exam --load-balance --parallel=2 --server --no-launch

# If a `=` is not used to pass a value to an option that requires a value, it will take anything passed after a space as it's value
# In this instance, the value of parallel is --server
ember exam --load-balance --parallel --server --no-launch
```

The idea is that you should be able to replace `ember test` with `ember exam` and never look back.

However, to get the unique features of Ember Exam (described in-depth below), you will need to import `addon-test-support/start.js` to invoke the `start` function. The start function creates an instance of EmberExamTestLoader, loads tests, and invokes start function from either `Ember-Qunit` or `Ember-Mocha`. This is done usually from within `test-helper.js` and should replace the use of `start()` from `Ember-Qunit` or `Ember-Mocha`.

```js
// test-helper.js
import start from 'ember-exam/test-support/start';

// start() triggers qunit or mocha start after instantiating either qunit or mocha test-loader instance and loading test modules.
start();
```

### Version < `2.1.0`

Starting with version `2.1.0`, Ember-exam's `start()` function must be invoked explicitly to use ember-exam's functionalities. Prior to this release, Ember Exam must be loaded by importing `addon-test-support/load.js` and calling `loadEmberExam`. Ember-Exam's `start()` function ensures tests are loaded at the right places and unifies to set up for both `ember-qunit` and `ember-mocha`. If you are using ember-exam version < `2.1.0` make sure to invoke `loadEmberExam()`.

```js
// test-helper.js
import loadEmberExam from 'ember-exam/test-support/load';

loadEmberExam();
```
