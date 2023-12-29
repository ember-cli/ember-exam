import { setResolver } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import start from 'ember-exam/test-support/start';

setResolver(resolver);
start();
