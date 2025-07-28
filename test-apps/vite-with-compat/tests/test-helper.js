import Application from 'vite-with-compat/app';
import config from 'vite-with-compat/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as startEmberExam } from 'ember-exam/test-support';

export async function start({ availableModules }) {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);

  await startEmberExam({ availableModules });
}
