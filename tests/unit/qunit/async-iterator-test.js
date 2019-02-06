/* globals Testem */

import AsyncIterator from 'ember-exam/test-support/-private/async-iterator';
import { module, test } from 'qunit';


module('Unit | async-iterator', () => {
  test('should instantiate', function(assert) {
    const testem = Testem;
    let iteratorOfPromises = new AsyncIterator(testem, {
      request: 'should-instantiate-request',
      response: 'should-instantiate-response'
    });

    assert.deepEqual(iteratorOfPromises.done, false);
    assert.deepEqual(typeof(iteratorOfPromises.next), 'function');
    assert.deepEqual(typeof(iteratorOfPromises.dispose), 'function');
  });

  test('should get the value from response.', async function(assert) {
    const testem = Testem;
    testem.on('get-value-request', () => {
      testem.emit('get-value-response', {
        done: false,
        value: 'a'
      });
    });

    const iteratorOfPromises = new AsyncIterator(testem, {
      request: 'get-value-request',
      response: 'get-value-response'
    });

    const step = await iteratorOfPromises.next();
    assert.deepEqual('a', step.value);
  });

  test('should iterate promises until there is no response.', async function(assert) {
    const testem = Testem;
    const responses = ['a', 'b', 'c'];

    testem.on('next-module-request-test', () => {
      testem.emit('next-module-response-test', {
        done: responses.length === 0,
        value: responses.shift()
      });
    });

    const iteratorOfPromises = new AsyncIterator(testem, {
      request: 'next-module-request-test',
      response: 'next-module-response-test'
    });

    let step = await iteratorOfPromises.next();
    let values = [];

    while(!step.done) {
      values.push(step.value);
      step = await iteratorOfPromises.next();
    }

    assert.deepEqual(values, ['a', 'b', 'c']);
  });

  test('should return false after disposing', async function(assert) {
    const iteratorOfPromises = new AsyncIterator({on: () => {}, removeEventCallbacks: () => {}}, {
      request: 'should-return-false-request',
      response: 'should-return-false-response'
    });

    iteratorOfPromises.dispose();

    assert.deepEqual(iteratorOfPromises.done, true);
  });

  test('should dispose after iteration.', async function(assert) {
    const testem = Testem;
    const responses = ['a', 'b', 'c'];

    testem.on('should-dispose-request', () => {
      testem.emit('should-dispose-response', {
        done: responses.length === 0,
        value: responses.shift()
      });
    });

    const iteratorOfPromises = new AsyncIterator(testem, {
      request: 'should-dispose-request',
      response: 'should-dispose-response'
    });

    let step = await iteratorOfPromises.next();

    while(!step.done) {
      step = await iteratorOfPromises.next();
    }

    assert.deepEqual(iteratorOfPromises.done, true);
  });

  test('should throw an error if handleResponse is invoked while not waiting for a response', function(assert){
    const iteratorOfPromises = new AsyncIterator({on: () => {}}, {
      request: 'should-throw-an-error-request',
      response: 'should-throw-an-error-response'
    });

    assert.throws(() => iteratorOfPromises.handleResponse({}), /Was not expecting a response, but got a response/);
  });
});