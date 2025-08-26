import Application from 'embroider3-webpack/app';
import config from 'embroider3-webpack/config/environment';
import { setApplication } from '@ember/test-helpers';
import { setupEmberOnerrorValidation } from 'ember-qunit';
import { start as startEmberExam } from 'ember-exam/test-support';

setApplication(Application.create(config.APP));
setupEmberOnerrorValidation();
startEmberExam();
