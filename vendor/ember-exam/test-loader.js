/* globals jQuery, QUnit, Testem, require, requirejs */

jQuery(document).ready(function() {
  // Add the partition number for better debugging when reading the reporter
  if (window.Testem) {
    Testem.on('test-result', function prependPartition(test) {
      var partition = QUnit.urlParams._partition;
      if (partition) {
        test.name = 'Exam Partition #' + QUnit.urlParams._partition + ' - ' + test.name;
      }
    });
  }

  var testLoaderModulePath = 'ember-cli-test-loader/test-support/index';

  if (!requirejs.entries[testLoaderModulePath]) {
    testLoaderModulePath = 'ember-cli/test-loader';
  }

  var TestLoaderModule = require(testLoaderModulePath);
  var TestLoader = TestLoaderModule['default'];

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
    var params = QUnit.urlParams;
    var split = parseInt(params._split, 10);
    var partition = parseInt(params._partition, 10);

    split = isNaN(split) ? 1 : split;
    partition = isNaN(partition) ? 1 : partition;

    var testLoader = this;

    testLoader._testModules = [];
    _super.loadModules.apply(testLoader, arguments);

    var splitModules = splitTestModules(testLoader._testModules, split, partition);

    splitModules.forEach(function(moduleName) {
      _super.require.call(testLoader, moduleName);
      _super.unsee.call(testLoader, moduleName);
    });
  };

  function splitTestModules(modules, split, partition) {
    if (split < 1) {
      throw new Error('You must specify a split greater than 0');
    } else if (split < partition) {
      throw new Error('You must specify a partition less than or equal to your split value of ' + split);
    } else  if (partition < 1) {
      throw new Error('You must specify a partition greater than 0');
    }

    var lintTestGroups = filterIntoGroups(modules, isLintTest, split);
    var otherTestGroups = filterIntoGroups(modules, isNotLintTest, split);
    var group = partition - 1;
    return lintTestGroups[group].concat(otherTestGroups[group]);
  }

  function isLintTest(name) {
    return name.match(/\.(jshint|(es)?lint-test)$/);
  }

  function isNotLintTest(name) {
    return !isLintTest(name);
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
