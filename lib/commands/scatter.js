'use strict';

module.exports = {
  name: 'test:scatter',

  description: 'Scatter tests across multiple, potentially random files to allow distributed and/or parallelized testing.',

  works: 'insideProject',

  anonymousOptions: [
    '<num-of-files>'
  ],

  availableOptions: [
    { name: 'batch', type: Number },
    { name: 'random', type: Boolean, default: false },
    { name: 'seed', type: Number },
    { name: 'parallel', type: Boolean, default: false }
  ],

  run: function(commandOptions, rawArgs) {
    var numFiles = parseInt(rawArgs[0], 10);

    console.log(commandOptions, rawArgs);

    // Random setup
    var useRandom = commandOptions.random;
    var seed = commandOptions.seed;

    if (seed && !useRandom) {
      throw new Error('You specified a \'seed\' value but are not using \'random\' as well.');
    }
  }
};
