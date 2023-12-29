# Randomization

```bash
ember exam --random[=<seed>]
```

The `random` option allows you to randomize the order in which your tests run. You can optionally specify a "seed" value from which to randomize your tests in order to reproduce results. The seed can be any string value. Regardless of whether you specify a seed or not, Ember Exam will log the seed value used for the randomization at the beginning of the test run:

```bash
ember exam --random
Randomizing tests with seed: liv5d1ixkco6qlatl6o7mbo6r

ember exam --random=this_is1337
Randomizing tests with seed: this_is1337
```

If you use `random` without specifying a seed, it must be the last argument you pass. Otherwise, Ember Exam will attempt to interpret any following arguments as the seed value. In other words:

```bash
# don't do this
ember exam --random --split=2
Randomizing tests with seed: --split=2 # this is not what we wanted

# do this instead
ember exam --split=2 --random
Randomizing tests with seed: hwr74nkk55vzpvi
```

_Note: You must be using QUnit version `1.23.0` or greater for this feature to work properly.
