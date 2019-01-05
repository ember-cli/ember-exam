'use strict';

const assert = require('assert');
const { convertOptionValueToArray, getTestUrlFromTestemConfig, getCustomBaseUrl, getMultipleTestPages } = require('../../../lib/utils/test-page-helper');

describe('TestPageHelper', function() {
  describe('convertOptionValueToArray', function() {
    it('should return empty array when no optionValue specified', function() {
      assert.deepEqual(convertOptionValueToArray(), []);
    });

    it('should have a specified option number when the option is number', function() {
      assert.deepEqual(convertOptionValueToArray(3), [3]);
    });

    it('should have a number of array when a specified option is string', function() {
      assert.deepEqual(convertOptionValueToArray('2,3'), [2, 3]);
    });

    it('should have a numbe of array when a specified option is a combination of number and string ', function() {
      assert.deepEqual(convertOptionValueToArray([1, '2,3']), [1, 2, 3]);
    });

    it('should have a sequence number of array when a specified option is in range', function() {
      assert.deepEqual(convertOptionValueToArray('1..5'), [1, 2, 3, 4, 5]);
    });

    it('should have a number of array when a specified option is a combination of number and string in range', function() {
      assert.deepEqual(convertOptionValueToArray([1, '3..6']), [1,3, 4, 5, 6]);
    });
  });

  describe('getTestUrlFromTestemConfig', function() {
    it('should have a default test page with no config file', function() {
      const testPage = getTestUrlFromTestemConfig('');

      assert.deepEqual(testPage, 'tests/index.html?hidepassed')
    });

    it('should have a default test page with no test-page specified in a testem config file', function() {
      const testPage = getTestUrlFromTestemConfig('testem.no-test-page.js');

      assert.deepEqual(testPage, 'tests/index.html?hidepassed')
    });

    it('should have multiple test pages specified in testem config file with test-page specified in the file', function() {
      const testPages = getTestUrlFromTestemConfig('testem.multiple-test-page.js');

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar'
      ]);
    })
  });

  describe('getCustomBaseUrl', function() {
    it('should add `split` when `split` option is used', function() {
      const appendedUrl = getCustomBaseUrl({ split: 3 }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&split=3');
    });

    it('should add `split` when `split` and `parallel` option are used', function() {
      const appendedUrl = getCustomBaseUrl({ split: 5, parallel: true }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&split=5');
    });

    it('should add `loadBalance` when `load-balance` option is used', function() {
      const appendedUrl = getCustomBaseUrl({ loadBalance: 2 }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&loadBalance');
    });

    it('should add `split`, `loadBalance`, and `partition` when `split`, `loadBalance`, and `partition` are used.', function() {
      const appendedUrl = getCustomBaseUrl({ split: 5, partition: [1,2,3], loadBalance: 2 }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&split=5&loadBalance&partition=1&partition=2&partition=3');
    });

    it('should add `loadBalance` when `replay-execution` and `replay-browser` are used', function() {
      const appendedUrl = getCustomBaseUrl({ replayExecution: 'test-execution-0000000.json', replayBrowser: [1, 2] }, 'tests/index.html?hidepassed');

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&loadBalance');
    });

    it('should add `split` to multiple test pages when `split` option is used', function() {
      const appendedUrl = getCustomBaseUrl({ split: 3 }, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar' ]);

      assert.deepEqual(appendedUrl, ['tests/index.html?hidepassed&derp=herp&split=3', 'tests/index.html?hidepassed&foo=bar&split=3']);
    });

    it('should add `split` when `split` to multiple test pages and `parallel` option are used', function() {
      const appendedUrl = getCustomBaseUrl({ split: 5, parallel: true }, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar' ]);

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp&split=5',
        'tests/index.html?hidepassed&foo=bar&split=5']);
    });

    it('should add `loadBalance` to multiple test pages when `load-balance` option is used', function() {
      const appendedUrl = getCustomBaseUrl({ loadBalance: 2 }, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar' ]);

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp&loadBalance',
        'tests/index.html?hidepassed&foo=bar&loadBalance' ]);
    });

    it('should add `split`, `loadBalance`, and `partition` to multiple test pages when `split`, `loadBalance`, and `partition` are used.', function() {
      const appendedUrl = getCustomBaseUrl({ split: 5, partition: [1,2,3], loadBalance: 2 }, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar' ]);

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp&split=5&loadBalance&partition=1&partition=2&partition=3',
        'tests/index.html?hidepassed&foo=bar&split=5&loadBalance&partition=1&partition=2&partition=3' ]);
    });

    it('should add `loadBalance` to multiple test pages when `replay-execution` and `replay-browser` are used', function() {
      const appendedUrl = getCustomBaseUrl({ replayExecution: 'test-execution-0000000.json', replayBrowser: [1, 2] }, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar' ]);

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp&loadBalance',
        'tests/index.html?hidepassed&foo=bar&loadBalance' ]);
    });
  });

  describe('getMultipleTestPages', function() {
    it('should have multiple test pages with no partitions specified', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { parallel: true,
          split: 2 });

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&split=2&partition=1',
        'tests/index.html?hidepassed&split=2&partition=2'
      ]);
    });

    it('should have multiple test pages with specified partitions', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { parallel: true,
          split: 4,
          partition: [3, 4]});

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&split=4&partition=3',
        'tests/index.html?hidepassed&split=4&partition=4'
      ]);
    });

    it('should have multiple test pages for each test_page in the config file with no partitions specified', function() {
      const testPages = getMultipleTestPages(
        { configFile: 'testem.multiple-test-page.js' },
        { parallel: true,
          split: 2 });

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&derp=herp&split=2&partition=1',
        'tests/index.html?hidepassed&derp=herp&split=2&partition=2',
        'tests/index.html?hidepassed&foo=bar&split=2&partition=1',
        'tests/index.html?hidepassed&foo=bar&split=2&partition=2'
      ]);
    });

    it('should have multiple test pages for each test_page in the config file with partitions specified', function() {
      const testPages = getMultipleTestPages(
        { configFile: 'testem.multiple-test-page.js' },
        { parallel: true,
          split: 4,
          partition: [3, 4] });

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&derp=herp&split=4&partition=3',
        'tests/index.html?hidepassed&derp=herp&split=4&partition=4',
        'tests/index.html?hidepassed&foo=bar&split=4&partition=3',
        'tests/index.html?hidepassed&foo=bar&split=4&partition=4'
      ]);
    });

    it('should have a test page with \'loadBalance\' when no specified number of browser', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { loadBalance: 1 });

      assert.deepEqual(testPages, ['tests/index.html?hidepassed&loadBalance&browser=1']);
    });

    it('should have multiple test page with \'loadBalance\' with splitting when no specified number of browser', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { loadBalance: 1,
          split: 2 });

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&split=2&loadBalance&browser=1'
      ]);
    });

    it('should have multiple test pages with test loading balanced, no specified partitions and no splitting', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { loadBalance: 2 });

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&loadBalance&browser=1',
        'tests/index.html?hidepassed&loadBalance&browser=2'
      ]);
    });

    it('should have multiple test pages with test loading balanced, no specified partitions and no splitting', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { loadBalance: 2,
          split: 3,
          partition: [2, 3] });

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&split=3&loadBalance&partition=2&partition=3&browser=1',
        'tests/index.html?hidepassed&split=3&loadBalance&partition=2&partition=3&browser=2'
      ]);
    });

    it('should have multiple test pages for each test_page in the config file with partitions specified and test loading balanced', function() {
      const testPages = getMultipleTestPages(
        { configFile: 'testem.multiple-test-page.js' },
        { loadBalance: 1,
          split: 4,
          partition: [3, 4] });

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&derp=herp&split=4&loadBalance&partition=3&partition=4&browser=1',
        'tests/index.html?hidepassed&foo=bar&split=4&loadBalance&partition=3&partition=4&browser=1'
      ]);
    });
  });
});
