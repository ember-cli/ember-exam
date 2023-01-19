import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function () {
  docsRoute(this, function () {
    this.route('randomization');
    this.route('randomization-iterator');
    this.route('module-metadata');
    this.route('splitting');
    this.route('split-parallel');
    this.route('filtering');
    this.route('load-balancing');
    this.route('preserve-test-name');

    this.route('ember-try-and-ci');
    this.route('test-suite-segmentation');
  });

  this.route('not-found', { path: '/*path' });
});

export default Router;
