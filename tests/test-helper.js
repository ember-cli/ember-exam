import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { start as startEmberExam } from 'ember-exam/test-support';
import { setupEmberOnerrorValidation } from 'ember-qunit';

QUnit.moduleStart(({ name }) => console.group(name));
QUnit.testStart(({ name }) => console.group(name));
QUnit.testDone(() => console.groupEnd());
QUnit.moduleDone(() => console.groupEnd());

setApplication(Application.create(config.APP));
setupEmberOnerrorValidation();

startEmberExam();
