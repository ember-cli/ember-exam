import { setResolver } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import start from 'ember-exam/test-support/start';
import { setupEmberOnerrorValidation } from 'ember-qunit';

setupEmberOnerrorValidation();

QUnit.moduleStart(({ name }) => console.group(name));
QUnit.testStart(({ name }) => console.group(name));
QUnit.testDone(() => console.groupEnd());
QUnit.moduleDone(() => console.groupEnd());


setResolver(resolver);
start();
