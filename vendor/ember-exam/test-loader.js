/* globals require */
document.addEventListener('DOMContentLoaded', function() {
  if (!require('ember-exam/test-support/load').default()) {
    console.warn('DEPRECATION: ember-exam was auto-loaded on DOMContentLoaded. This method of loading is not recommended and will be removed in the next release. Use the `loadEmberExam` method instead. See http://bit.ly/2yqVGDC for more info.');
  }
});
