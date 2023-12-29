// eslint-disable-next-line n/no-unpublished-require
const TestTask = require('ember-cli/lib/tasks/test');

module.exports = TestTask.extend({
  transformOptions(options) {
    const transformOptions = this._super(...arguments);
    transformOptions.custom_browser_socket_events =
      options.custom_browser_socket_events;
    transformOptions.browser_module_mapping = options.browser_module_mapping;

    return transformOptions;
  },
});
