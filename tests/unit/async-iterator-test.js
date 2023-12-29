import AsyncIterator from 'ember-exam/test-support/-private/async-iterator';
import { module, test } from 'qunit';

module('Unit | async-iterator', function (hooks) {
  hooks.beforeEach(function () {
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
      removeEventCallbacks: () => {},
    };
  });

  test('should instantiate', function (assert) {
    let iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
    });

    assert.false(iteratorOfPromises.done);
    assert.deepEqual(typeof iteratorOfPromises.next, 'function');
    assert.deepEqual(typeof iteratorOfPromises.dispose, 'function');
  });

  test('should get the value from response.', function (assert) {
    const done = assert.async();
    this.testem.on('next-module-request', () => {
      this.testem.emit('next-module-response', {
        done: false,
        value: 'a',
      });
    });

    const iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
    });

    iteratorOfPromises.next().then((result) => {
      assert.deepEqual(result.value, 'a');
      done();
    });
  });

  test('should iterate promises until there is no response.', function (assert) {
    const done = assert.async();
    const testem = this.testem;
    const responses = ['a', 'b', 'c'];

    testem.on('next-module-request', () => {
      testem.emit('next-module-response', {
        done: responses.length === 0,
        value: responses.shift(),
      });
    });

    const iteratorOfPromises = new AsyncIterator(testem, {
      request: 'next-module-request',
      response: 'next-module-response',
    });

    let values = [];

    iteratorOfPromises
      .next()
      .then((res) => {
        values.push(res.value);
        return iteratorOfPromises.next();
      })
      .then((res) => {
        values.push(res.value);
        return iteratorOfPromises.next();
      })
      .then((res) => {
        values.push(res.value);
        assert.deepEqual(values, ['a', 'b', 'c']);
        done();
      });
  });

  test('should return false after disposing', function (assert) {
    const iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
    });

    iteratorOfPromises.dispose();

    assert.true(iteratorOfPromises.done);
  });

  test('should dispose after iteration.', function (assert) {
    const done = assert.async();
    const testem = this.testem;
    const responses = ['a', 'b', 'c'];

    testem.on('next-module-request', () => {
      testem.emit('next-module-response', {
        done: responses.length === 0,
        value: responses.shift(),
      });
    });

    const iteratorOfPromises = new AsyncIterator(testem, {
      request: 'next-module-request',
      response: 'next-module-response',
    });

    iteratorOfPromises
      .next()
      .then((res) => {
        assert.false(res.done);
        return iteratorOfPromises.next();
      })
      .then((res) => {
        assert.false(res.done);
        return iteratorOfPromises.next();
      })
      .then((res) => {
        assert.false(res.done);
        return iteratorOfPromises.next();
      })
      .then((res) => {
        assert.true(res.done);
        done();
      });
  });

  test('should resolve with iterator finishing if request is not handled within 2s', function (assert) {
    const done = assert.async();
    const iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
      timeout: 2,
    });

    return iteratorOfPromises.next().then((res) => {
      assert.true(res.done);
      done();
    });
  });

  test('should resolve a timeout error if request is not handled within 2s when emberExamExitOnError is true', function (assert) {
    const done = assert.async();
    const iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
      timeout: 2,
      emberExamExitOnError: true,
    });

    return iteratorOfPromises.next().then(
      () => {
        assert.ok(false, 'Promise should not resolve, expecting reject');
        done();
      },
      (err) => {
        assert.deepEqual(
          err.message,
          'EmberExam: Promise timed out after 2 s while waiting for response for next-module-request',
        );
        done();
      },
    );
  });

  test('should throw an error if handleResponse is invoked while not waiting for a response', function (assert) {
    const iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
    });

    assert.throws(
      () => iteratorOfPromises.handleResponse({}),
      /Was not expecting a response, but got a response/,
    );
  });
});
