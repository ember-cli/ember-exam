'use strict';

var RSVP = require('rsvp');
var recast = require('recast');
var path = require('path');
var fs = require('fs');

var ArrayUtils = require('./array');
var parseASTFromFile = require('./parse-ast-from-file');

var TEST_OBJECTS = [ 'QUnit', '_qunit', '_emberQunit' ];

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
 *
 * @private
 * @return {Void}
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

/**
 * Processes the Tests AST according to what the validator says should run.
 *
 * @private
 * @param {TestsOptionsValidator} validator
 * @return {Void}
 */
TestsProcessor.prototype._processAST = function(validator) {
  // Order is important here
  if (validator.shouldFilter) { this.filter(); }
  if (validator.shouldRandomize) { this.randomize(); }
  if (validator.shouldSplit) { this.split(); }
};

/**
 * Filters the tests and modules.
 *
 * @public
 * @return {Void}
 */
TestsProcessor.prototype.filter = function() {
  console.info('TODO: Support filtering. Pull requests welcome!');
};

/**
 * Randomizes the order of tests and modules.
 *
 * @public
 * @return {Void}
 */
TestsProcessor.prototype.randomize = function() {
  // Randomize the test modules
  var seed = ArrayUtils.randomize(this.testModules, this.options.seed);

  if (this.options.random === 'modules') {
    console.info('Randomized test modules with seed:', seed);
    return;
  }

  // Randomize the tests within each test module
  this.testModules.forEach(function(group) {
    var nodes = [];
    recast.visit(group, {
      visitMemberExpression: function(path) {
        // Unfortunately, the heuristic for determining if an expression is
        // actually a test is somewhat limited. We use the object and property
        // names to see if it is a test call or not.
        if (path.node.property.name === 'test' && TEST_OBJECTS.indexOf(path.node.object.name) !== -1) {
          // Find the closest parent that is the actual expression of this test
          var parent = path.parent;
          while (parent.node.type !== 'ExpressionStatement') {
            parent = parent.parent;
          }

          // Push the parent node into the nodes array
          nodes.push(parent.node);

          // Remove it from the AST
          parent.prune();
        }

        this.traverse(path);
      }
    });

    // Randomize the tests
    ArrayUtils.randomize(nodes, seed);

    // Get the body of the test module and concat the nodes back into it
    var body = group.expression.arguments[2].body;
    body.body = body.body.concat(nodes);
  });

  console.info('Randomized tests with seed:', seed);
};

/**
 * Splits the test modules into a number of roughly equal-sized groups.
 *
 * @public
 * @return {Void}
 */
TestsProcessor.prototype.split = function() {
  if (this.options.weighted) {
    // TODO: Improve weighting to take into account number of tests in module.
    this.testModules.forEach(function(module) {
      var name = module.expression.arguments[0].value;
      if (name.indexOf('jshint') !== -1) {
        module.weight = 1;
      } else if (name.indexOf('/unit/') !== -1) {
        module.weight = 10;
      } else if (name.indexOf('/integration/') !== -1) {
        module.weight = 20;
      } else if (name.indexOf('/acceptance/') !== -1) {
        module.weight = 150;
      } else {
        module.weight = 50;
      }
    });
    this.testGroups = ArrayUtils.weightedSplit(this.testModules, this.options.split);
  } else {
    this.testGroups = ArrayUtils.split(this.testModules, this.options.split);
  }
};

/**
 * Writes the processed Tests AST to a file or group of files depending on
 * the options provided.
 *
 * @public
 * @return {Promise}
 */
TestsProcessor.prototype.write = function() {
  if (this.testGroups) {
    // Write the groups to files
    this.testGroups.forEach(function(group, idx) {
      this._writeTestFile(group, 'tests-' + (idx + 1) + '.js')
    }, this);

    // Overwrite the tests.js file with our custom loader and the test helpers
    this.ast.program.body = this.testHelperModules;
    var testHelpers = recast.print(this.ast).code
    var testLoaderFile = fs.readFileSync(path.resolve(__dirname, '../tests.js'), { encoding: 'utf-8' });
    fs.writeFileSync(this.testsFilePath, testHelpers + '\n' + testLoaderFile);
  } else {
    var content = this.testHelperModules.concat(this.testModules);
    this._writeTestFile(content, 'tests.js');
  }

  return RSVP.Promise.resolve();
};

/**
 * Writes a test file with specific content and file name.
 *
 * @private
 * @param {AST} content
 * @param {String} name
 * @return {Void}
 */
TestsProcessor.prototype._writeTestFile = function(content, name) {
  var ast = this.ast;
  ast.program.body = content;

  // Add the test-helper require statement at the end of the batch
  ast.program.body.push(this.requireStatement);

  // Write the AST to a file
  var filePath = path.resolve(this.options.outputPath, 'assets', name);
  fs.writeFileSync(filePath, recast.print(ast).code);
};

module.exports = TestsProcessor;
