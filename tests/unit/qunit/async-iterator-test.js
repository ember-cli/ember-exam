import AsyncIterator from 'ember-exam/test-support/-private/async-iterator';
import {
  module,
  test
} from 'qunit';


module('Unit | async-iterator', {
  beforeEach() {
    this.testem = {
      eventHandler: new Array(),
      emit: function (event) {
        const argsWithoutFirst = Array.prototype.slice.call(arguments, 1);
        if (this.eventHandler && this.eventHandler[event]) {
          let handlers = this.eventHandler[event];
          for (let i = 0; i < handlers.length; i++) {
            handlers[i].apply(this, argsWithoutFirst);
          }
        }
      },
      on: function (event, callBack) {
        if (!this.eventHandler) {
          this.eventHandler = {};
        }
        if (!this.eventHandler[event]) {
          this.eventHandler[event] = [];
        }
        this.eventHandler[event].push(callBack);
      },
      removeEventCallbacks: () => {}
    };
  }
});

test('should instantiate', function (assert) {
  let iteratorOfPromises = new AsyncIterator(this.testem, {
    request: 'next-module-request',
    response: 'next-module-response'
  });

  assert.deepEqual(iteratorOfPromises.done, false);
  assert.deepEqual(typeof (iteratorOfPromises.next), 'function');
  assert.deepEqual(typeof (iteratorOfPromises.dispose), 'function');
});

test('should get the value from response.', async function (assert) {
  this.testem.on('next-module-request', () => {
    this.testem.emit('next-module-response', {
      done: false,
      value: 'a'
    });
  });

  const iteratorOfPromises = new AsyncIterator(this.testem, {
    request: 'next-module-request',
    response: 'next-module-response'
  });

  const step = await iteratorOfPromises.next();
  assert.deepEqual('a', step.value);
});

test('should iterate promises until there is no response.', async function (assert) {
  const testem = this.testem;
  const responses = ['a', 'b', 'c'];

  testem.on('next-module-request', () => {
    testem.emit('next-module-response', {
      done: responses.length === 0,
      value: responses.shift()
    });
  });

  const iteratorOfPromises = new AsyncIterator(testem, {
    request: 'next-module-request',
    response: 'next-module-response'
  });

  let step = await iteratorOfPromises.next();
  let values = [];

  while (!step.done) {
    values.push(step.value);
    step = await iteratorOfPromises.next();
  }

  assert.deepEqual(values, ['a', 'b', 'c']);
});

test('should return false after disposing', async function (assert) {
  const iteratorOfPromises = new AsyncIterator(this.testem, {
    request: 'next-module-request',
    response: 'next-module-response'
  });

  iteratorOfPromises.dispose();

  assert.deepEqual(iteratorOfPromises.done, true);
});

test('should dispose after iteration.', async function (assert) {
  const testem = this.testem;
  const responses = ['a', 'b', 'c'];

  testem.on('next-module-request', () => {
    testem.emit('next-module-response', {
      done: responses.length === 0,
      value: responses.shift()
    });
  });

  const iteratorOfPromises = new AsyncIterator(testem, {
    request: 'next-module-request',
    response: 'next-module-response'
  });

  let step = await iteratorOfPromises.next();

  while (!step.done) {
    step = await iteratorOfPromises.next();
  }

  assert.deepEqual(iteratorOfPromises.done, true);
});

test('should throw a timout error if request is not handled within 2s', async function (assert) {
  const iteratorOfPromises = new AsyncIterator(this.testem, {
    request: 'next-module-request',
    response: 'next-module-response'
  });

  let errMessage;

  try {
    await iteratorOfPromises.next()
  } catch (err) {
    errMessage = err.message;
  }

  assert.deepEqual(
    errMessage,
    'EmberExam: Promise timed out after 2 s while waiting for response for next-module-request'
  );
});

test('should throw an error if handleResponse is invoked while not waiting for a response', function (assert) {
  const iteratorOfPromises = new AsyncIterator(this.testem, {
    request: 'next-module-request',
    response: 'next-module-response'
  });

  assert.throws(
    () => iteratorOfPromises.handleResponse({}),
    /Was not expecting a response, but got a response/
  );
});
