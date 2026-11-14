import type { TestLoader } from 'ember-qunit/test-loader';

declare class EmberExamTestLoader extends TestLoader {}

export default function loadEmberExam(): EmberExamTestLoader;
