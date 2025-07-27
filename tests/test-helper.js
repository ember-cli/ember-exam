import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start as startEmberExam } from 'ember-exam/test-support';
import { setupEmberOnerrorValidation } from 'ember-qunit';

setApplication(Application.create(config.APP));
setupEmberOnerrorValidation();
startEmberExam();
