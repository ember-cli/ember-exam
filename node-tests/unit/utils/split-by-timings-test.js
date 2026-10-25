'use strict';

const assert = require('assert');
const {
  estimateDurations,
  splitByTimings,
} = require('../../../lib/utils/split-by-timings');

describe('splitByTimings', function () {
  const timings = {
    'app/tests/acceptance/a-test': 10,
    'app/tests/acceptance/b-test': 8,
    'app/tests/acceptance/c-test': 6,
    'app/tests/integration/d-test': 4,
    'app/tests/unit/e-test': 2,
  };
  const modules = Object.keys(timings);

  it('splits modules into partitions of similar total duration', function () {
    assert.deepEqual(splitByTimings(modules, timings, 2, [1]), [
      'app/tests/acceptance/a-test',
      'app/tests/integration/d-test',
      'app/tests/unit/e-test',
    ]);
    assert.deepEqual(splitByTimings(modules, timings, 2, [2]), [
      'app/tests/acceptance/b-test',
      'app/tests/acceptance/c-test',
    ]);
  });

  it('puts every module in exactly one partition', function () {
    const partitions = [1, 2, 3].map((partition) =>
      splitByTimings(modules, timings, 3, [partition]),
    );

    assert.deepEqual(partitions.flat().sort(), [...modules].sort());
  });

  it('returns the modules of several partitions longest first', function () {
    assert.deepEqual(splitByTimings(modules, timings, 2, [2, 1]), [
      'app/tests/acceptance/a-test',
      'app/tests/acceptance/b-test',
      'app/tests/acceptance/c-test',
      'app/tests/integration/d-test',
      'app/tests/unit/e-test',
    ]);
  });

  it('splits the same way whatever order the modules come in', function () {
    const reversed = [...modules].reverse();

    assert.deepEqual(
      splitByTimings(reversed, timings, 2, [1]),
      splitByTimings(modules, timings, 2, [1]),
    );
  });

  it('splits modules with equal durations by name', function () {
    const sameTimings = { 'tests/b-test': 5, 'tests/a-test': 5 };

    assert.deepEqual(
      splitByTimings(Object.keys(sameTimings), sameTimings, 2, [1]),
      ['tests/a-test'],
    );
  });
});

describe('estimateDurations', function () {
  it('uses the recorded duration of a module', function () {
    const durations = estimateDurations(['tests/unit/a-test'], {
      'tests/unit/a-test': 7,
    });

    assert.strictEqual(durations.get('tests/unit/a-test'), 7);
  });

  it('expects an unrecorded module to take the median of its test type', function () {
    const durations = estimateDurations(
      [
        'tests/acceptance/a-test',
        'tests/acceptance/b-test',
        'tests/acceptance/c-test',
        'tests/unit/d-test',
        'tests/acceptance/new-test',
      ],
      {
        'tests/acceptance/a-test': 10,
        'tests/acceptance/b-test': 20,
        'tests/acceptance/c-test': 60,
        'tests/unit/d-test': 1,
      },
    );

    assert.strictEqual(durations.get('tests/acceptance/new-test'), 20);
  });

  it('expects an unrecorded module of an unrecorded type to take the median of all modules', function () {
    const durations = estimateDurations(
      [
        'tests/acceptance/a-test',
        'tests/unit/b-test',
        'tests/integration/new-test',
      ],
      { 'tests/acceptance/a-test': 10, 'tests/unit/b-test': 2 },
    );

    assert.strictEqual(durations.get('tests/integration/new-test'), 6);
  });

  it('expects modules to take no time when nothing was recorded', function () {
    const durations = estimateDurations(['tests/unit/a-test'], {});

    assert.strictEqual(durations.get('tests/unit/a-test'), 0);
  });
});
