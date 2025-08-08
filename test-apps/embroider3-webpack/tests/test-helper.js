import Application from 'embroider3-webpack/app';
import config from 'embroider3-webpack/config/environment';
import { setApplication } from '@ember/test-helpers';
import { setupEmberOnerrorValidation } from 'ember-qunit';
import { start as startEmberExam } from 'ember-exam/test-support';
import RSVP from 'rsvp';
// RSVP.configure('async', (callback, arg) => queueMicrotask(() => callback(arg)));
RSVP.configure('async', (callback, arg) => callback(arg));

setApplication(Application.create(config.APP));
setupEmberOnerrorValidation();
startEmberExam();
