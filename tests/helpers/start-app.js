import Application from '../../app';
import config from '../../config/environment';
import { run } from '@ember/runloop';

export default function startApp(attrs) {
  const attributes = Object.assign({}, config.APP, attrs); // use defaults, but you can override;

  return run(() => {
    const application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}
