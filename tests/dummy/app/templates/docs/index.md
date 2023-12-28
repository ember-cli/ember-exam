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

The idea is that you can replace `ember test` with `ember exam` and never look back.

To get the unique features of Ember Exam (described in-depth below), you will need to **replace** the use of `start()` from `ember-qunit` in `test-helper.js` with `start()` from `ember-exam`:

```js
// test-helper.js
import start from 'ember-exam/test-support/start';

// start() triggers qunit start after instantiating qunit test-loader instance and loading test modules.
start();
```

### Version < `3.0.0`

Prior to `2.1.0`, Ember Exam must be loaded by importing `addon-test-support/load.js` and calling `loadEmberExam`:

```js
// test-helper.js
import loadEmberExam from 'ember-exam/test-support/load';

loadEmberExam();
```
