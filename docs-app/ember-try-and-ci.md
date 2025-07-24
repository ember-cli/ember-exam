### Ember Try & CI Integration

Integrating ember-exam with [ember-try](https://github.com/ember-cli/ember-try) is remarkably easy. Define a [`command` in your `ember-try.js` config](https://github.com/ember-cli/ember-try#configuration-files) that leverages the `exam` command:

```js
// config/ember-try.js
module.exports = {
  command: 'ember exam --split 3 --parallel',
  // ...
};
```

Using [environmental variables](https://nodejs.org/api/process.html#process_process_env) gives you flexibility in how you run your tests. For instance, you could distribute your tests across processes instead of parallelizing them by specifying a `PARTITION` variable in your process environment and then consuming it like so:

```js
module.exports = {
  command: 'ember exam --split 20 --partition ' + process.env.PARTITION,
  // ...
};
```

If you are working with [Travis CI](https://travis-ci.org/) then you can also easily set up seeded-random runs based on PR numbers. Similar to the following:

```js
const command = ['ember', 'exam', '--random'];
const pr = process.env.TRAVIS_PULL_REQUEST;

if (pr) {
  command.push(pr);
}

module.exports = {
  command: command.join(' '),
  // ...
};
```

You can refer to [Travis' default environment variables](https://docs.travis-ci.com/user/environment-variables/#Default-Environment-Variables) to see what else you could possibly leverage for your test setup.
