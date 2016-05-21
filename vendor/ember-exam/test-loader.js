/* globals jQuery, QUnit, require, requirejs */

jQuery(document).ready(function() {
  var params = QUnit.urlParams;
  var split = params.split;
  var file = params.splitFile;

  if (!split || !file) {
    return;
  }

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

  function splitTestModules(modules) {
    var length = modules.length;
    var groups = [];

    for (var i = 0; i < length; i++) {
      if (i < split) {
        groups[i] = [];
      }

      groups[i % split].push(modules[i]);
    }

    return groups[file-1];
  }
});
