import EmberRouter from '@ember/router';
import config from 'vite-with-compat/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {});
