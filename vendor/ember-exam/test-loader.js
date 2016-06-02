/* globals jQuery, QUnit, require, requirejs */

jQuery(document).ready(function() {
  var params = QUnit.urlParams;
  var split = params._split;
  var partition = params._partition;

  if (!split) {
    return;
  }

  if (!partition) {
    partition = 1;
  }

  // Add the partition number for better debugging when reading the reporter
  Testem.on('test-result', function prependPartition(test) {
    test.name = 'Exam Partition #' + partition + ' - ' + test.name;
  });

  var TestLoaderModule = require('ember-cli/test-loader');
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
    var testLoader = this;

    testLoader._testModules = [];
    _super.loadModules.apply(testLoader, arguments);

    var splitModules = splitTestModules(testLoader._testModules);

    splitModules.forEach(function(moduleName) {
      _super.require.call(testLoader, moduleName);
      _super.unsee.call(testLoader, moduleName);
    });
  };

  function isLintTest(name) {
    return name.match(/\.(jshint|(es)?lint-test)$/);
  }

  function isNotLintTest(name) {
    return !isLintTest(name);
  }

  function createGroups(num) {
    var groups = new Array(num);
    for (var i = 0; i < num; i++) {
      groups[i] = [];
    }
    return groups;
  }

  function filterIntoGroups(arr, filter, numGroups) {
    var filtered = arr.filter(filter);
    var groups = createGroups(numGroups);

    for (var i = 0; i < filtered.length; i++) {
      groups[i % numGroups].push(filtered[i]);
    }

    return groups;
  }

  function splitTestModules(modules) {
    var lintTestGroups = filterIntoGroups(modules, isLintTest, split);
    var otherTestGroups = filterIntoGroups(modules, isNotLintTest, split);
    var group = partition - 1;
    return lintTestGroups[group].concat(otherTestGroups[group]);
  }
});
