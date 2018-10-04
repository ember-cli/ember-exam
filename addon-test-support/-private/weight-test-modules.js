const TEST_TYPE_WEIGHT = {jshint:1, eslint:1, unit:10, integration:20, acceptance:150};
const DEFAULT_WEIGHT = 50;

/**
* Return the weight for a given module name, a file path to the module
* Ember tests consist of Acceptance, Integration, Unit, and lint tests. In general, acceptance takes
* longest time to execute, followed by integration and unit.
* The weight assigned to a module corresponds to its test type execution speed, with slowest being the highest in weight.
* If the test type is not identifiable from the modulePath, weight default to 50 (ordered after acceptance, but before integration)
*
* @param {*} modulePath File path to a module
 */
function getWeight(modulePath) {
  const [, key] = /\/(jshint|unit|integration|acceptance)\//.exec(modulePath) || [];
  return TEST_TYPE_WEIGHT[key] || DEFAULT_WEIGHT;
}

export default function weightTestModules(modules) {
  const groups = {};

  modules.forEach(function(module) {
    const moduleWeight = getWeight(module);

    if (!groups[moduleWeight]) {
      groups[moduleWeight] = [];
    }
    groups[moduleWeight].push(module);
  });

  // returns modules sorted by weight and alphabetically within its weighted groups
  return Object.keys(groups)
    .sort(function(a, b){return b-a})
    .reduce(function(accumulatedArray, weight) {
      const sortedModuleArr = groups[weight].sort();
      return accumulatedArray.concat(sortedModuleArr);
    }, []);
}
