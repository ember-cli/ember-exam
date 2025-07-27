import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import loadEmberExam from 'ember-exam/test-support/load';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';

setApplication(Application.create(config.APP));
setupEmberOnerrorValidation();

loadEmberExam();

start();
