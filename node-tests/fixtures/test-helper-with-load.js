import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import loadEmberExam from 'ember-exam/test-support/load';
import { setupEmberOnerrorValidation } from 'ember-qunit';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

loadEmberExam();
setupEmberOnerrorValidation();

start();
