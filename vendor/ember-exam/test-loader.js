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
    this._testModules = [];

    _super.loadModules.apply(this, arguments);

    var splitModules = splitTestModules(this._testModules);

    splitModules.forEach(function(moduleName) {
      _super.require.call(this, moduleName);
      _super.unsee.call(this, moduleName);
    });
  };

  function isLintTest(name) {
    return name.match(/\.(jshint|(es)?lint-test)$/);
  }

  function isNotLintTest(name) {
    return !isLintTest(name);
  }

  function splitTestModules(modules) {
    var lintTests = modules.filter(isLintTest);
    var otherTests = modules.filter(isNotLintTest);
    var groups = [];

    for (var i = 0; i < lintTests.length; i++) {
      if (i < split) {
        groups[i] = [];
      }

      groups[i % split].push(lintTests[i]);
    }

    for (var i = 0; i < otherTests.length; i++) {
      groups[i % split].push(otherTests[i]);
    }

    return groups[partition-1];
  }
});
