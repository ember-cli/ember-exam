'use strict';

const TEST_TYPE_REGEX = /\/(unit|integration|acceptance)\//;

function getTestType(moduleName) {
  const [, type] = TEST_TYPE_REGEX.exec(moduleName) || [];
  return type || 'other';
}

function median(values) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function compareNames(a, b) {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

/**
 * Returns a map of module name to its expected duration. A module without a
 * recorded timing (e.g. a newly added file) is expected to take the median of
 * the recorded modules of the same test type, or of all recorded modules when
 * none of its type were recorded.
 *
 * @param {Array<string>} modules
 * @param {Object} timings Module name to duration in milliseconds
 * @return {Map<string, number>}
 */
function estimateDurations(modules, timings) {
  const recordedByType = new Map();
  const recorded = [];

  for (const moduleName of modules) {
    const duration = timings[moduleName];
    if (typeof duration === 'number') {
      const type = getTestType(moduleName);
      recordedByType.set(type, [...(recordedByType.get(type) || []), duration]);
      recorded.push(duration);
    }
  }

  const fallbackByType = new Map();
  for (const [type, durations] of recordedByType) {
    fallbackByType.set(type, median(durations));
  }
  const fallback = median(recorded);

  return new Map(
    modules.map((moduleName) => {
      const duration = timings[moduleName];
      if (typeof duration === 'number') {
        return [moduleName, duration];
      }
      const typeFallback = fallbackByType.get(getTestType(moduleName));
      return [
        moduleName,
        typeof typeFallback === 'number' ? typeFallback : fallback,
      ];
    }),
  );
}

/**
 * Splits modules into `split` groups of similar total duration: the longest
 * module goes first, each to the group with the least total so far. The result
 * only depends on its inputs, so every CI node computes the same groups.
 *
 * Returns the modules of the requested (one-indexed) partitions, longest first,
 * so the browsers sharing the queue don't finish on a long module.
 *
 * @param {Array<string>} modules
 * @param {Object} timings Module name to duration in milliseconds
 * @param {number} split
 * @param {Array<number>} partitions
 * @return {Array<string>}
 */
function splitByTimings(modules, timings, split, partitions) {
  const durations = estimateDurations(modules, timings);
  const byDuration = (a, b) =>
    durations.get(b) - durations.get(a) || compareNames(a, b);

  const groups = Array.from({ length: split }, () => ({
    total: 0,
    modules: [],
  }));

  for (const moduleName of [...new Set(modules)].sort(byDuration)) {
    let target = groups[0];
    for (const group of groups) {
      if (group.total < target.total) {
        target = group;
      }
    }
    target.modules.push(moduleName);
    target.total += durations.get(moduleName);
  }

  return partitions
    .flatMap((partition) => groups[partition - 1].modules)
    .sort(byDuration);
}

module.exports = { estimateDurations, splitByTimings };
