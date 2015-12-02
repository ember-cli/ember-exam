var RSVP = require('rsvp');
var recast = require('recast');
var path = require('path');
var fs = require('fs');

var ArrayUtils = require('./array');
var parseASTFromFile = require('./parse-ast-from-file');

function moduleIsTestHelper(module) {
  var moduleName = module.expression.arguments[0].value;
  return moduleName &&
         !~moduleName.indexOf('jshint') &&
         (~moduleName.indexOf('tests/helpers') ||
          ~moduleName.indexOf('test-helper'));
}

module.exports = function splitTests(options) {
  if (!options.needsAST) {
    return RSVP.Promise.resolve();
  }

  var outputPath = options.outputPath;

  // Grab the tests file and parse it into an AST
  var testsFilePath = path.resolve(outputPath, 'assets/tests.js');
  var ast = parseASTFromFile(testsFilePath);

  // We extract the require statement since it needs to be at the bottom of
  // every test group file
  var requireStatement = ast.program.body.pop();
  var testModules = ast.program.body;

  // Extract test helper modules. We know a test helper module if it lives in
  // `tests/helpers` and is not a jshint module. We also special case
  // `tests/test-helper` since it should be in each batch of tests.
  var testHelperModules = testModules.filter(moduleIsTestHelper);

  // (optional) Randomize the order of the test modules
  options.random && ArrayUtils.randomize(testModules, options.seed);

  // Split the test modules into a specific number of groups
  var testGroups = ArrayUtils.split(testModules, options.split);

  // Write the groups to files
  testGroups.forEach(function(group, idx) {
    ast.program.body = group;

    // Add the test helpers at the beginning of the batch
    ast.program.body.unshift.apply(ast.program.body, testHelperModules);

    // Add the test-helper require statement at the end of the batch
    ast.program.body.push(requireStatement);

    var fileName = 'tests-' + (idx + 1) + '.js';
    var filePath = path.resolve(outputPath, 'assets', fileName);

    fs.writeFileSync(filePath, recast.print(ast).code);
  });

  // Overwrite the tests.js file with our custom loader
  var testLoaderFile = fs.readFileSync(path.resolve('lib/tests.js'), { encoding: 'utf-8' });
  fs.writeFileSync(testsFilePath, testLoaderFile);

  return RSVP.Promise.resolve();
};
