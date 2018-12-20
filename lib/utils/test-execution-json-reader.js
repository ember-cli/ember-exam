const { readFileByType } = require('./config-reader');

let executionModuleMap = null;

module.exports = function readTestExecutionJsonFile(fileName) {
  if (executionModuleMap !== null) {
    return executionModuleMap;
  }

  try {
    // Read the replay execution json file.
    executionModuleMap = readFileByType(fileName);
  } catch (err) {
    const errorMessage = `Failed to read ember-exam replay file: ${fileName} ` + err.message;
    throw new Error(errorMessage);
  }

  return executionModuleMap;
}
