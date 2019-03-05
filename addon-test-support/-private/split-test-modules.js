function createGroups(num) {
  const groups = new Array(num);

  for (let i = 0; i < num; i++) {
    groups[i] = [];
  }

  return groups;
}

function filterIntoGroups(arr, filter, numGroups) {
  const filtered = arr.filter(filter);
  const groups = createGroups(numGroups);

  for (let i = 0; i < filtered.length; i++) {
    groups[i % numGroups].push(filtered[i]);
  }

  return groups;
}

function isLintTest(name) {
  return name.match(/\.(jshint|(es)?lint-test)$/);
}

function isNotLintTest(name) {
  return !isLintTest(name);
}

/**
 * splits the list of modules into unique subset of modules
 * return the subset indexed by the partition
 *
 * @export
 * @param {Array<string>} modules
 * @param {number} partitionCount
 * @param {number} partitions
 * @returns {Array<string>} tests
 */
export default function splitTestModules(modules, partitionCount, partitions) {
  if (partitionCount < 1) {
    throw new Error('You must specify a partition-count greater than 0');
  }

  const lintTestGroups = filterIntoGroups(modules, isLintTest, partitionCount);
  const otherTestGroups = filterIntoGroups(modules, isNotLintTest, partitionCount);
  const tests = [];

  for (let i = 0; i < partitions.length; i++) {
    const partition = parseInt(partitions[i], 10);
    if (isNaN(partition)) {
      throw new Error(
        'You must specify numbers for partition (you specified \'' +
          partitions +
          '\')'
      );
    }

    if (partitionCount < partition) {
      throw new Error('You must specify partitions numbered less than or equal to your partition-count value of ' + partitionCount);
    } else  if (partition < 1) {
      throw new Error('You must specify partitions numbered greater than 0');
    }

    const group = partition - 1;
    tests.push(...lintTestGroups[group], ...otherTestGroups[group]);
  }

  return tests;
}
