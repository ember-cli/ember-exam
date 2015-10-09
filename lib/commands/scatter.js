'use strict';

var fs = require('fs');
var path = require('path');
var recast = require('recast');
var babel = require('babel-core');

function parseASTFromFile(path) {
  var file = fs.readFileSync(path, { encoding: 'utf-8' });
  return recast.parse(file, {
    esprima: babel
  })
}

function splitArray(arr, n) {
  var length = arr.length;
  var output = [];
  var i = 0;

  while (i < length) {
    var size = Math.ceil((length - i) / n--);
    output.push(arr.slice(i, i + size));
    i += size;
  }

  return output;
}

function generateSeed() {
  return Math.floor(Math.random() * 10000);
}

function randomNumberGenerator(seed) {
  return function _random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
}

module.exports = {
  name: 'test:scatter',

  description: 'Scatter tests across multiple, potentially random files to allow distributed and/or parallelized testing.',

  works: 'insideProject',

  anonymousOptions: [
    '<num-of-files>'
  ],

  availableOptions: [
    { name: 'batch',    type: Number                  },
    { name: 'random',   type: Boolean, default: false },
    { name: 'seed',     type: Number                  },
    { name: 'parallel', type: Boolean, default: false }
  ],

  run: function(commandOptions, rawArgs) {
    var options = this.validateOptions(commandOptions, rawArgs);

    var outputPath = options.outputPath = 'dist/scatter';

    return this.build(outputPath).then(function() {
      this.splitTests(options);
      return this.test();
    });
  },

  /**
   * Validates the arguments/options that the command was called with and
   * returns values that need to be used later.
   */
  validateOptions: function(commandOptions, rawArgs) {
    var numFiles = parseInt(rawArgs[0], 10);

    if (!numFiles) {
      throw new Error('You must specify a number of files to split your tests across.');
    } else if (numFiles < 2) {
      throw new Error('You must specify a number of files greater than 1 to split your tests across.');
    }

    // Random setup
    var useRandom = !!commandOptions.random;
    var seed = commandOptions.seed;

    if (seed && !useRandom) {
      throw new Error('You specified a \'seed\' value but are not using \'random\' as well.');
    }

    if (!!commandOptions.parallel) {
      throw new Error('The \'parallel\' option is not yet supported.')
    }

    return {
      numFiles: numFiles,
      useRandom: useRandom,
      seed: seed
    }
  },

  /**
   * Builds the basic application files
   */
  build: function(outputPath) {
    var buildOptions = {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    };

    var BuildTask = this.tasks.Build;
    var build = new BuildTask(buildOptions);

    return build.run({
      environment: 'test',
      outputPath: outputPath
    });
  },

  splitTests: function(options) {
    var outputPath = options.outputPath;

    // Grab the tests file and parse it into an AST
    var testsFilePath = path.resolve(outputPath, 'assets/tests.js');
    var ast = parseASTFromFile(testsFilePath);

    var requireStatement = ast.program.body.pop();
    var testModules = ast.program.body;

    // (optional) Randomize the order of the test modules
    options.useRandom && this.randomizeModules(testModules, options.seed);

    // Split the test modules into a specific number of groups
    var testGroups = splitArray(testModules, options.numFiles);

    // Write the groups to files
    testGroups.forEach(function(group, idx) {
      ast.program.body = group;
      ast.program.body.push(requireStatement);

      var fileName = 'tests-' + (idx + 1) + '.js';
      var filePath = path.resolve(outputPath, 'assets', fileName);

      fs.writeFileSync(filePath, recast.print(ast).code);
    });
  },

  randomizeModules: function(modules, seed) {
    if (typeof seed !== 'number') {
      seed = generateSeed();
    }

    console.info('Randomizing with seed:', seed);

    var randomNumber = randomNumberGenerator(seed);

    modules.sort(function() { return 0.5 - randomNumber(); });
  }
};
