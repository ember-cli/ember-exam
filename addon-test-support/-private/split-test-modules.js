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

export default function splitTestModules(modules, split, partitions) {
  if (split < 1) {
    throw new Error('You must specify a split greater than 0');
  }

  const lintTestGroups = filterIntoGroups(modules, isLintTest, split);
  const otherTestGroups = filterIntoGroups(modules, isNotLintTest, split);
  const tests = [];

  for (let i = 0; i < partitions.length; i++) {
    const partition = parseInt(partitions[i], 10);
    if (isNaN(partition)) {
      throw new Error('You must specify numbers for partition (you specified \'' + partitions + '\')');
    }

    if (split < partition) {
      throw new Error('You must specify partitions numbered less than or equal to your split value of ' + split);
    } else  if (partition < 1) {
      throw new Error('You must specify partitions numbered greater than 0');
    }

    const group = partition - 1;
    tests.push(...lintTestGroups[group], ...otherTestGroups[group]);
  }

  return tests;
}
