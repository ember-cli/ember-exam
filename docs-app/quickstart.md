# Quickstart

## Installation

Installation is as easy as running:

```bash
npm add --save-dev ember-exam
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


## Setup

### With Vite


Update your test-helper.js or test-helper.ts, to have add the ember-exam `start` function:
```diff
  // ...
  import { setApplication } from '@ember/test-helpers';
  import { setup } from 'qunit-dom';
- import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
+ import { setupEmberOnerrorValidation } from 'ember-qunit';
+ import { start as startEmberExam } from 'ember-exam/test-support';

- export function start() {
+ export async function start({ availableModules }) {
    setApplication(Application.create(config.APP));

    setup(QUnit.assert);
    setupEmberOnerrorValidation();

-   qunitStart();
+   // Options passed to `start` will be passed-through to ember-qunit
+   await startEmberExam({ availableModules });
  }
```

Then, update your tests/index.html to pass availableModules to start:
```html
<script type="module">
  import { start } from './test-helper.js';

  const availableModules = {
    ...import.meta.glob('./application/**/*-test.{js,ts,gjs,gts}'),
    ...import.meta.glob('./rendering/**/*-test.{js,ts,gjs,gts}'),
    ...import.meta.glob('./unit/**/*-test.{js,ts,gjs,gts}'),
  };

	start({ availableModules });
</script>
```

 We need to tell vite to build the app before telling ember/exam to run tests on that output.

Testing development:
```bash 
NODE_ENV=development vite build --mode development
ember exam --path dist --config-file ./testem.cjs
```

Testing production:
```bash
vite build --mode test
ember exam --path dist --config-file ./testem.cjs
```

> [!NOTE]
> Specifying the `--path` is important because otherwise ember-cli will try to build your vite app, and it will error. 

> [!NOTE]
> Specifying the `--config-path` is important because ember-cli (what backs ember-exam) doesn't know about cjs files. 


### broccoli / ember-cli 


To get the unique features of Ember Exam (described in-depth below), you will need to **replace** the use of `start()` from `ember-qunit` in `test-helper.js` with `start()` from `ember-exam`:

```js
// test-helper.js
- import { start, setupEmberOnerrorValidation } from 'ember-qunit';
+ import { setupEmberOnerrorValidation } from 'ember-qunit';
+ import { start } from 'ember-exam/test-support';

// Options passed to `start` will be passed-through to ember-qunit
start();
```

### Version < `3.0.0`

Prior to `2.1.0`, Ember Exam must be loaded by importing `addon-test-support/load.js` and calling `loadEmberExam`:

```js
// test-helper.js
import loadEmberExam from 'ember-exam/test-support/load';

loadEmberExam();
```
