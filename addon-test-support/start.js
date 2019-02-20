/* globals require */

import emberExam from 'ember-exam/test-support/load';

/**
 * Ember-exam's own start function to set up EmberExamTestLoader and disable `loadTest` to enable load-balancing
 * @param {*} qunitOptions
 */
export default function start(qunitOptions) {
	const framework = require.has('ember-qunit') ? 'qunit' : 'mocha';
	const modifiedOptions = qunitOptions || Object.create(null);
	modifiedOptions.loadTests = false;

	emberExam.loadEmberExam();
	emberExam.loadTests();

	if (framework === 'qunit') {
		require(`ember-${framework}`).start(modifiedOptions);
	}
}