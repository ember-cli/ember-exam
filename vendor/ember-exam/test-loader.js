/* globals jQuery, Testem, require, requirejs */

jQuery(document).ready(function() {
  function getUrlParams() {
    var i, param, name, value;
    var urlParams = Object.create( null );
    var params = location.search.slice( 1 ).split( "&" );
    var length = params.length;

    for ( i = 0; i < length; i++ ) {
      if ( params[ i ] ) {
        param = params[ i ].split( "=" );
        name = decodeQueryParam( param[ 0 ] );

        // Allow just a key to turn on a flag, e.g., test.html?noglobals
        value = param.length === 1 ||
          decodeQueryParam( param.slice( 1 ).join( "=" ) );
        if ( name in urlParams ) {
          urlParams[ name ] = [].concat( urlParams[ name ], value );
        } else {
          urlParams[ name ] = value;
        }
      }
    }

    return urlParams;
  }

  function decodeQueryParam( param ) {
    return decodeURIComponent( param.replace( /\+/g, "%20" ) );
  }

  // Add the partition number(s) for better debugging when reading the reporter
  if (window.Testem) {
    Testem.on('test-result', function prependPartition(test) {
      var urlParams = TestLoader._urlParams;
      var split = urlParams._split;
      if (split) {
        test.name = 'Exam Partition #' + (urlParams._partition || 1) + ' - ' + test.name;
      }
    });
  }

  var testLoaderModulePath = 'ember-cli-test-loader/test-support/index';

  if (!requirejs.entries[testLoaderModulePath]) {
    testLoaderModulePath = 'ember-cli/test-loader';
  }

  var TestLoaderModule = require(testLoaderModulePath);
  var TestLoader = TestLoaderModule['default'];

  TestLoader._urlParams = getUrlParams();

  var _super = {
    require: TestLoader.prototype.require,
    unsee: TestLoader.prototype.unsee,
    loadModules: TestLoader.prototype.loadModules,
  };

  // "Require" the module by adding it to the array of test modules to load
  TestLoader.prototype.require = function _require(name) {
    this._testModules.push(name);
  };

  // Make unsee a no-op
  TestLoader.prototype.unsee = function _unsee() {};

  TestLoader.prototype.loadModules = function _loadSplitModules() {
    var urlParams = TestLoader._urlParams;
    var split = parseInt(urlParams._split, 10);
    var partitions = urlParams._partition;

    split = isNaN(split) ? 1 : split;

    if (partitions === undefined) {
      partitions = [1];
    } else if (!Array.isArray(partitions)) {
      partitions = [partitions];
    }

    var testLoader = this;

    testLoader._testModules = [];
    _super.loadModules.apply(testLoader, arguments);

    var splitModules = splitTestModules(testLoader._testModules, split, partitions);

    splitModules.forEach(function(moduleName) {
      _super.require.call(testLoader, moduleName);
      _super.unsee.call(testLoader, moduleName);
    });
  };

  function splitTestModules(modules, split, partitions) {
    if (split < 1) {
      throw new Error('You must specify a split greater than 0');
    }

    var lintTestGroups = filterIntoGroups(modules, isLintTest, split);
    var acceptanceTestGroups = filterIntoGroups(modules, isAcceptanceTest, split);
    var otherTestGroups = filterIntoGroups(modules, isOtherTest, split);
    var tests = [];

    for (var i = 0; i < partitions.length; i++) {
      var partition = parseInt(partitions[i], 10);
      if (isNaN(partition)) {
        throw new Error('You must specify numbers for partition (you specified \'' + partitions + '\')');
      }

      if (split < partition) {
        throw new Error('You must specify partitions numbered less than or equal to your split value of ' + split);
      } else  if (partition < 1) {
        throw new Error('You must specify partitions numbered greater than 0');
      }

      var group = partition - 1;
      tests = tests.concat(lintTestGroups[group], acceptanceTestGroups[group], otherTestGroups[group]);
    }

    return tests;
  }

  function isLintTest(name) {
    return name.match(/\.(jshint|(es)?lint-test)$/);
  }

  function isAcceptanceTest(name) {
    return !isLintTest(name) && name.match(/[^\/]acceptance\//);
  }

  function isOtherTest(name) {
    return !isLintTest(name) && !isAcceptanceTest(name);
  }

  function filterIntoGroups(arr, filter, numGroups) {
    var filtered = arr.filter(filter);
    var groups = createGroups(numGroups);

    for (var i = 0; i < filtered.length; i++) {
      groups[i % numGroups].push(filtered[i]);
    }

    return groups;
  }

  function createGroups(num) {
    var groups = new Array(num);

    for (var i = 0; i < num; i++) {
      groups[i] = [];
    }

    return groups;
  }
});
