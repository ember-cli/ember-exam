import AsyncIterator from 'ember-exam/test-support/-private/async-iterator';
import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

if (macroCondition(dependencySatisfies('ember-qunit', '*'))) {
  let { module, test } = importSync('qunit');

  module('Unit | Qunit | async-iterator', {
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
        removeEventCallbacks: () => {},
      };
    },
  });

  test('should instantiate', function (assert) {
    let iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
    });

    assert.deepEqual(iteratorOfPromises.done, false);
    assert.deepEqual(typeof iteratorOfPromises.next, 'function');
    assert.deepEqual(typeof iteratorOfPromises.dispose, 'function');
  });

  test('should get the value from response.', function (assert) {
    assert.expect(1);
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
      assert.deepEqual('a', result.value);
      done();
    });
  });

  test('should iterate promises until there is no response.', function (assert) {
    assert.expect(1);
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

    assert.deepEqual(iteratorOfPromises.done, true);
  });

  test('should dispose after iteration.', function (assert) {
    assert.expect(4);
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
        assert.deepEqual(res.done, false);
        return iteratorOfPromises.next();
      })
      .then((res) => {
        assert.deepEqual(res.done, false);
        return iteratorOfPromises.next();
      })
      .then((res) => {
        assert.deepEqual(res.done, false);
        return iteratorOfPromises.next();
      })
      .then((res) => {
        assert.deepEqual(res.done, true);
        done();
      });
  });

  test('should resolve with iterator finishing if request is not handled within 2s', function (assert) {
    assert.expect(1);
    const iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
      timeout: 2,
    });

    return iteratorOfPromises.next().then((res) => {
      assert.deepEqual(res.done, true);
    });
  });

  test('should resolve a timeout error if request is not handled within 2s when emberExamExitOnError is true', function (assert) {
    assert.expect(1);
    const iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
      timeout: 2,
      emberExamExitOnError: true,
    });

    return iteratorOfPromises.next().then(
      () => {
        assert.ok(false, 'Promise should not resolve, expecting reject');
      },
      (err) => {
        assert.deepEqual(
          err.message,
          'EmberExam: Promise timed out after 2 s while waiting for response for next-module-request'
        );
      }
    );
  });

  test('should throw an error if handleResponse is invoked while not waiting for a response', function (assert) {
    const iteratorOfPromises = new AsyncIterator(this.testem, {
      request: 'next-module-request',
      response: 'next-module-response',
    });

    assert.throws(
      () => iteratorOfPromises.handleResponse({}),
      /Was not expecting a response, but got a response/
    );
  });
}
