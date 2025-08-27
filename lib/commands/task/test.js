const TestTask = require('ember-cli/lib/tasks/test');

module.exports = TestTask.extend({
  transformOptions(options) {
    const transformOptions = this._super(...arguments);
    transformOptions.custom_browser_socket_events =
      options.custom_browser_socket_events;
    transformOptions.browser_module_mapping = options.browser_module_mapping;

    if (options.loadBalance) {
      /**
       * the parallel option is how testem knows to boot browsers simultaneously.
       * setting testPage to an array isn't enough.
       * default behavior is 1 browser at a time, which defeats the purpose of loadBalance.
       */
      transformOptions.parallel = options.testPage.length;
    }

    return transformOptions;
  },
});
