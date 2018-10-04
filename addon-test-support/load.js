/* globals Testem */

import patchTestLoader from './-private/patch-test-loader';
import patchTestemOutput from './-private/patch-testem-output';
import getTestLoader from './-private/get-test-loader';

let loaded = false;
let testLoader;

function loadEmberExam() {
  if (loaded) {
    // eslint-disable-next-line no-console
    console.warn('Attempted to load Ember Exam more than once.');
    return;
  }

  loaded = true;

  const TestLoader = getTestLoader();
  patchTestLoader(TestLoader);

  if (window.Testem) {
    patchTestemOutput(TestLoader);
  }

  testLoader = new TestLoader();
}

// loadTests() is equivalent to ember-qunit's loadTest() except this does not create a new TestLoader instance
function loadTests() {
  if (testLoader === undefined) {
    new Error('testLoader is not defined. It must call `loadEmberExam()` before calling `loadTest()`.')
  }

  testLoader.loadModules();
}

// setupQUnitCallBacks() registers QUnit callbacks neeeded for the load-balance option.
function setupQUnitCallbacks(qunit) {
  if (!location.search.includes('loadBalance')) {
    return;
  }
  qunit.begin(function() {
    return new self.Promise(function(resolve) {
      Testem.on('testem:next-module-response', function getTestModule(moduleName) {
        if (moduleName !== undefined) {
          loadIndividualModule(moduleName);
        }

        // if no tests were added, request the next module
        if (qunit.config.queue.length === 0) {
          Testem.emit('get-next-module');
        } else {
          Testem.removeEventCallbacks('testem:next-module-response', getTestModule);
          resolve();
        }
      });
      Testem.emit('get-next-module');
    });
  });
  qunit.moduleDone(function() {
    return new self.Promise(function(resolve) {
      Testem.on('testem:next-module-response', function getTestModule(moduleName) {
        if (moduleName !== undefined) {
          loadIndividualModule(moduleName);
        }

        // if no tests were added, request the next module
        if (qunit.config.queue.length === 0) {
          Testem.emit('get-next-module');
        } else {
          // `removeCallback` removes if the event queue contains the same callback for an event.
          Testem.removeEventCallbacks('testem:next-module-response', getTestModule);
          Testem.removeEventCallbacks('testem:module-queue-complete', resolve);
          resolve();
        }
      });
      Testem.on('testem:module-queue-complete', resolve);
      Testem.emit('get-next-module');
    });
  });
}

// loadIndividualModule() executes loadIndividualModule() defined in patch-test-loader. It enables to load an AMD module one by one.
function loadIndividualModule(moduleName) {
  testLoader.loadIndividualModule(moduleName);
}

export default {
  loadEmberExam,
  loadTests,
  setupQUnitCallbacks,
  loadIndividualModule,
};
