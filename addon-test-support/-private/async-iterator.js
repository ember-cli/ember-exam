'use strict';

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
    console.debug(`handleResponse ${response}`);

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
    console.debug(`makeRequest ${this._request}`);
    this._testem.emit(this._request);
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
    });

    // TODO: timeout?

    this._current = {
      resolve,
      reject,
      promise
    };

    this._makeNextRequest();

    return promise;
  }
}