'use strict';

var RSVP = require('rsvp');
var recast = require('recast');
var path = require('path');
var fs = require('fs');

var ArrayUtils = require('./array');
var parseASTFromFile = require('./parse-ast-from-file');

function isTestHelper(name) {
  return (~name.indexOf('tests/helpers') || ~name.indexOf('test-helper')) && !~name.indexOf('jshint');
}

function moduleIsTestHelper(module) {
  var moduleName = module.expression.arguments[0].value;
  return moduleName && isTestHelper(moduleName);
}

function moduleIsNotTestHelper(module) {
  return !moduleIsTestHelper(module);
}

/**
 * Processes a compiled tests file according to options passed into a validator.
 *
 * @class TestsProcessor
 * @param {TestsOptionsValidator}
 */
function TestsProcessor(validator) {
  this.options = validator.options;

  // Grab the tests file and parse it into an AST
  this.testsFilePath = path.resolve(this.options.outputPath, 'assets/tests.js');
  this.ast = parseASTFromFile(this.testsFilePath);

  this._divideAST();

  this._processAST(validator);
}

/**
 * Divides the AST body into 3 distinct sections:
 * 1. The require statement needed to run a test file
 * 2. The test helper modules
 * 3. The test modules
 */
TestsProcessor.prototype._divideAST = function() {
  var body = this.ast.program.body;

  // We extract the require statement since it needs to be at the bottom of
  // every test group file
  this.requireStatement = body.pop();

  // Extract test helper modules. We know a test helper module if it lives in
  // `tests/helpers` and is not a jshint module. We also special case
  // `tests/test-helper` since it should be in each batch of tests.
  this.testHelperModules = body.filter(moduleIsTestHelper);
  this.testModules = body.filter(moduleIsNotTestHelper);
};

TestsProcessor.prototype._processAST = function(validator) {
  if (validator.shouldFilter) { this.filter(); }
  if (validator.shouldRandomize) { this.randomize(); }
  if (validator.shouldSplit) { this.split(); }
};

TestsProcessor.prototype.filter = function() {
  console.info('TODO: Support filtering');
};

/**
 * Randomizes the order of tests and modules.
 *
 * @public
 * @return {Void}
 */
TestsProcessor.prototype.randomize = function() {
  ArrayUtils.randomize(this.testModules, this.options.seed);

  if (this.options.random === 'modules') { return; }

  console.info('TODO: Randomize individual tests after modules');
};

/**
 * Splits the test modules into a number of roughly equal-sized groups.
 *
 * @public
 * @return {Void}
 */
TestsProcessor.prototype.split = function() {
  this.testGroups = ArrayUtils.split(this.testModules, this.options.split);
};

TestsProcessor.prototype.write = function() {
  var ast = this.ast;
  var testHelperModules = this.testHelperModules;
  var requireStatement = this.requireStatement;
  var outputPath = this.options.outputPath;

  function writeTestFile(body, fileName) {
    ast.program.body = body;

    // Add the test helpers at the beginning of the batch
    ast.program.body.unshift.apply(ast.program.body, testHelperModules);

    // Add the test-helper require statement at the end of the batch
    ast.program.body.push(requireStatement);

    var filePath = path.resolve(outputPath, 'assets', fileName);

    fs.writeFileSync(filePath, recast.print(ast).code);
  }

  if (this.testGroups) {
    // Write the groups to files
    this.testGroups.forEach(function(group, idx) {
      writeTestFile(group, 'tests-' + (idx + 1) + '.js')
    });

    // Overwrite the tests.js file with our custom loader
    var testLoaderFile = fs.readFileSync(path.resolve('lib/tests.js'), { encoding: 'utf-8' });
    fs.writeFileSync(this.testsFilePath, testLoaderFile);
  } else {
    writeTestFile(this.testModules, 'tests.js');
  }

  return RSVP.Promise.resolve();
};

module.exports = TestsProcessor;
