/* globals Testem */

import TestemOutput from './-private/patch-testem-output';
import EmberExamTestLoader from './-private/ember-exam-test-loader';

let loaded = false;
let testLoader;

function loadEmberExam() {
  if (loaded) {
    // eslint-disable-next-line no-console
    console.warn('Attempted to load Ember Exam more than once.');
    return;
  }

  loaded = true;

  testLoader = new EmberExamTestLoader(Testem);

  if (window.Testem) {
    TestemOutput.patchTestemOutput(testLoader.urlParams);
  }
}

// loadTests() is equivalent to ember-qunit's loadTest() except this does not create a new TestLoader instance
function loadTests() {
  if (testLoader === undefined) {
    throw new Error('testLoader is not defined. It must call `loadEmberExam()` before calling `loadTest()`.')
  }

  testLoader.loadModules();
}

// setupQUnitCallBacks() registers QUnit callbacks neeeded for the load-balance option.
function setupQUnitCallbacks(qunit) {
  if (!location.search.includes('loadBalance')) {
    return;
  }

  const nextModuleHandler = (resolve , reject) => {
    const moduleComplete = () => {
      Testem.removeEventCallbacks('testem:next-module-response', getTestModule);
      resolve();
    }
    const getTestModule = (moduleName) => {
      try {
        testLoader.loadIndividualModule(moduleName);

        // if no tests were added, request the next module
        if (qunit.config.queue.length === 0) {
          Testem.emit('testem:get-next-module');
        } else {
          // `removeEventCallbacks` removes if the event queue contains the same callback for an event.
          Testem.removeEventCallbacks('testem:next-module-response', getTestModule);
          Testem.removeEventCallbacks('testem:module-queue-complete', moduleComplete);
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    }

    Testem.on('testem:next-module-response', getTestModule);
    Testem.on('testem:module-queue-complete', moduleComplete);
    Testem.emit('testem:get-next-module');
  }

  qunit.begin(() => {
    return new self.Promise(nextModuleHandler);
  });

  qunit.moduleDone(() =>{
    return new self.Promise(nextModuleHandler);
  });
}

export default {
  loadEmberExam,
  loadTests,
  setupQUnitCallbacks
};