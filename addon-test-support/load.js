import getTestLoader from './-private/get-test-loader';
import patchTestemOutput from './-private/patch-testem-output';
import patchTestLoader from './-private/patch-test-loader';
import qunit from 'qunit';
import { loadTests, start as qunitStart } from 'ember-cli-qunit';

let loaded = false;

const ALREADY_LOADED = 1;
const LOAD_SUCCESS = 0;

export default function loadEmberExam() {
  if (loaded) {
    return ALREADY_LOADED;
  }

  loaded = true;

  const TestLoader = getTestLoader();
  patchTestLoader(TestLoader);

  if (window.Testem) {
    patchTestemOutput(TestLoader);
  }

  return LOAD_SUCCESS;
}

export function start() {
  loadTests();

  let urlParams = qunit.urlParams;
  let totalPartitions = parseInt(urlParams._split) || 1;
  let partitions = urlParams._partition;
  
  if (partitions === undefined) {
    partitions = [1];
  } else if (!Array.isArray(partitions)) {
    partitions = [partitions];
  }
  
  partitions = partitions.map(function(num) {
    return +num;
  });
  
  if (totalPartitions > 0) {
    let testIds = qunit.config.modules.reduce(function(tests, m) {
      return tests.concat(m.tests);
    }, []).map(function(test) { return test.testId }).sort();
  
    qunit.config.testId = [];
    for (let i = 0; i < testIds.length; ++i) {
      let testPartition = (i % totalPartitions) + 1;
      if (partitions.includes(testPartition)) {
        qunit.config.testId.push(testIds[i]);
      }
    }
  
    // refill the queue
    qunit.config.queue = [];
    loadTests();
  }
  
  qunitStart({ loadTests: false });
}
