'use strict';

const iteratorCompleteResponse = { done: true, value: null };

/**
 * A class to iterate a sequencial set of asynchronous events.
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
    // Set a timeout value from either url parameter or default timeout value, 15 s.
    this._timeout = options.timeout || 15;
    this._browserId = options.browserId;
    this._emberExamExitOnError = options.emberExamExitOnError;

    testem.on(this._response, this._boundHandleResponse);
  }

  /**
   * Indicates whether the response queue is done or not.
   *
   * @method done
   * @return {bool} whether the response queue is done or not
   */
  get done() {
    return this._done;
  }

  /**
   * @method toString
   * @return {String} the stringified value of the iterator.
   */
  toString() {
    return `<AsyncIterator (request: ${this._request} response: ${this._response})>`;
  }

  /**
   * Handle a response when it's waiting for a response
   *
   * @method handleResponse
   * @param {*} response
   */
  handleResponse(response) {
    if (this._waiting === false) {
      throw new Error(
        `${this.toString()} Was not expecting a response, but got a response`,
      );
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
   * @method dispose
   */
  dispose() {
    this._done = true;
    this._testem.removeEventCallbacks(
      this._response,
      this._boundHandleResponse,
    );
  }

  /**
   * Emit the current request.
   *
   * @method _makeNextRequest
   */
  _makeNextRequest() {
    this._waiting = true;
    this._testem.emit(this._request, this._browserId);
  }

  /**
   * Set a timeout to reject a promise if it doesn't get response within the timeout threshold.
   *
   * @method _setTimeout
   * @param {*} resolve
   */
  _setTimeout(resolve, reject) {
    clearTimeout(this.timeout);
    this.timer = setTimeout(() => {
      if (!this._waiting) {
        return;
      }

      if (this._emberExamExitOnError) {
        let err = new Error(
          `EmberExam: Promise timed out after ${this._timeout} s while waiting for response for ${this._request}`,
        );
        reject(err);
      } else {
        // eslint-disable-next-line no-console
        console.error(
          `EmberExam: Promise timed out after ${this._timeout} s while waiting for response for ${this._request}. Closing browser to exit gracefully.`,
        );
        resolve(iteratorCompleteResponse);
      }
    }, this._timeout * 1000);
  }

  /**
   * Gets the next response from the request and resolve the promise.
   * if it's end of the iteration resolve the promise with done being true.
   *
   * @method next
   * @return {Promise}
   */
  next() {
    if (this._done) {
      return Promise.resolve(iteratorCompleteResponse);
    }
    if (this._current) {
      return this._current.promise;
    }

    let resolve, reject;
    let promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
      this._setTimeout(resolve, reject);
    });

    this._current = {
      resolve,
      reject,
      promise,
    };

    this._makeNextRequest();

    return promise;
  }
}
