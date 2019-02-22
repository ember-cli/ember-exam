'use strict';

import getUrlParams from './get-url-params';

/**
 * A class to iterate a sequencial asynchrouse event.
 *
 * @class AsyncIterator
 */
export default class AsyncIterator {
  constructor(testem, options) {
    this._testem = testem;
    this._request = options.request;
    this._response = options.response;
    this._done = false;
    this._current = null;
    this._boundHandleResponse = this.handleResponse.bind(this);
    this._waiting = false;
    // Set a timeout value from either url parameter or default timeout value, 2 s.
    this._timeout = getUrlParams().asyncTimeout || 2;
    testem.on(this._response, this._boundHandleResponse);
  }

  /**
   * Return whether the response queue is done.
   */
  get done() {
    return this._done;
  }

  toString() {
    return `<AsyncIterator (request: ${this._request} response: ${this._response})>`;
  }

  /**
   * Handle a response when it's waiting for a response
   *
   * @param {*} response
   */
  handleResponse(response) {
    if (this._waiting === false) {
      throw new Error(this.toString() + ' Was not expecting a response, but got a response');
    } else {
      this._waiting = false;
    }

    try {
      if (response.done) {
        this.dispose();
      }
      this._current.resolve(response);
    } catch (e) {
      this._current.reject(e);
    } finally {
      this._current = null;

      if (this.timer) {
        clearTimeout(this.timer);
      }
    }
  }

  /**
   * Dispose when an iteration is finished.
   *
   */
  dispose() {
    this._done = true;
    this._testem.removeEventCallbacks(this._response, this._boundHandleResponse);
  }

  /**
   * Emit the current request.
   *
   */
  _makeNextRequest() {
    this._waiting = true;
    this._testem.emit(this._request);
  }

  /**
   * Set a timeout to reject a promise if it doesn't get response within the timeout threshold.
   *
   * @param {*} reject
   */
  _setTimeout(reject) {
    clearTimeout(this.timeout);
    this.timer = setTimeout(() => {
      if (!this._waiting) {
        return;
      }
      let err = new Error(`EmberExam: Promise timed out after ${this._timeout} s while waiting for response for ${this._request}`)
      reject(err);
    }, this._timeout * 1000);
  }

  /**
   * Gets the next response from the request and resolve the promise.
   * if it's end of the iteration resolve the promise with done being true.
   *
   */
  async next() {
    if (this._done)    { return Promise.resolve({ done: true, value: null }); }
    if (this._current) { return this._current.promise; }

    let resolve, reject;
    let promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
      this._setTimeout(reject);
    });

    this._current = {
      resolve,
      reject,
      promise
    };

    this._makeNextRequest();

    return promise;
  }
}