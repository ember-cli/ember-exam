'use strict';

const assert = require('assert');
const { addToQuery, addToUrl } = require('../../../lib/utils/query-helper');

describe('QueryHelper', function() {
  describe('addToQuery', function() {
    it('should add param when no query and value is true', function() {
      const validQuery = addToQuery(null, 'foo', true);

      assert.deepEqual(validQuery, 'foo')
    });

    it('should add param and value when no query and value is string', function() {
      const validQuery = addToQuery(null, 'foo', 'bar');

      assert.deepEqual(validQuery, 'foo=bar')
    });

    it('should add param to query when value is boolean', function() {
      const validQuery = addToQuery('foo', 'bar', true);

      assert.deepEqual(validQuery, 'foo&bar')
    });

    it('should add param and value to query when value is string', function() {
      const validQuery = addToQuery('foo', 'bar', 'baz');

      assert.deepEqual(validQuery, 'foo&bar=baz')
    });

    it('should not add param when value is false', function() {
      const validQuery = addToQuery('foo', 'bar', false);

      assert.deepEqual(validQuery, 'foo')
    });
  });

  describe('addToUrl', function() {
    it('should add param to url when value is true', function() {
      const url = addToUrl('tests/index.html?hidepassed', 'foo', true);

      assert.deepEqual(url, 'tests/index.html?hidepassed&foo');
    });

    it('should not add param to url when value is false', function() {
      const url = addToUrl('tests/index.html?hidepassed', 'foo', false);

      assert.deepEqual(url, 'tests/index.html?hidepassed');
    });

    it('should add param and value to url when value is string', function() {
      const url = addToUrl('tests/index.html?hidepassed', 'foo', 'bar');

      assert.deepEqual(url, 'tests/index.html?hidepassed&foo=bar')
    });
  });
});
