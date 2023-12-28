import { setResolver } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import loadEmberExam from 'ember-exam/test-support/load';
import { start } from 'ember-qunit';

setResolver(resolver);

loadEmberExam();

start();
