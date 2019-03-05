'use strict';

const assert = require('assert');
const sinon = require('sinon');
const {
  combineOptionValueIntoArray,
  getBrowserId,
  getCustomBaseUrl,
  getMultipleTestPages,
  getTestUrlFromTestemConfig
} = require('../../../lib/utils/test-page-helper');

describe('TestPageHelper', function() {
  describe('combineOptionValueIntoArray', function() {
    it('should return empty array when no optionValue specified', function() {
      assert.deepEqual(combineOptionValueIntoArray(), []);
    });

    it('should have a specified option number when the option is number', function() {
      assert.deepEqual(combineOptionValueIntoArray(3), [3]);
    });

    it('should have a number of array when a specified option is string', function() {
      assert.deepEqual(combineOptionValueIntoArray('2,3'), [2, 3]);
    });

    it('should have a numbe of array when a specified option is a combination of number and string ', function() {
      assert.deepEqual(combineOptionValueIntoArray([1, '2,3']), [1, 2, 3]);
    });

    it('should have a sequence number of array when a specified option is in range', function() {
      assert.deepEqual(combineOptionValueIntoArray('1..5'), [1, 2, 3, 4, 5]);
    });

    it('should have a number of array when a specified option is a combination of number and string in range', function() {
      assert.deepEqual(combineOptionValueIntoArray([1, '3..6']), [1, 3, 4, 5, 6]);
    });
  });

  describe('getBrowserId', function() {
    it('should return the correct browserId', function() {
      assert.equal(getBrowserId('browser=1'), 1);
    });

    it('should return 0 if no browser param is found in the test page', function() {
      assert.throws(() => {
        getBrowserId('partitionCount=2&&partition=1');
      }, /Browser Id can't be found./);
    });
  });

  describe('getTestUrlFromTestemConfig', function() {
    it('should have a default test page with no config file', function() {
      const testPage = getTestUrlFromTestemConfig('');

      assert.deepEqual(testPage, 'tests/index.html?hidepassed');
    });

    it('should have a default test page with no test-page specified in a testem config file', function() {
      const warnStub = sinon.stub(console, 'warn');
      const testPage = getTestUrlFromTestemConfig('testem.no-test-page.js');

      assert.deepEqual(testPage, 'tests/index.html?hidepassed');

      sinon.assert.calledOnce(warnStub);
      sinon.assert.calledWithExactly(
        warnStub,
        'No test_page value found in the config. Defaulting to "tests/index.html?hidepassed"'
      );

      warnStub.restore();
    });

    it('should have multiple test pages specified in testem config file with test-page specified in the file', function() {
      const testPages = getTestUrlFromTestemConfig(
        'testem.multiple-test-page.js'
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar'
      ]);
    });
  });

  describe('getCustomBaseUrl', function() {
    it('should add `partitionCount` when `partition-count` option is used', function() {
      const appendedUrl = getCustomBaseUrl(
        { partitionCount: 3 },
        'tests/index.html?hidepassed'
      );

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&partitionCount=3');
    });

    it('should add `partitionCount` when `partition-count` and `parallel` option are used', function() {
      const appendedUrl = getCustomBaseUrl(
        { partitionCount: 5, parallel: true },
        'tests/index.html?hidepassed'
      );

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed&partitionCount=5');
    });

    it('should add `partitionCount` and `partition`when `partitionCount`, `partition`, and `browserCount` options are used.', function() {
      const appendedUrl = getCustomBaseUrl(
        { partitionCount: 5, partition: [1, 2, 3], browserCount: 1 },
        'tests/index.html?hidepassed'
      );

      assert.deepEqual(
        appendedUrl,
        'tests/index.html?hidepassed&partitionCount=5&partition=1&partition=2&partition=3'
      );
    });

    it('should not add any params when `replay-execution` and `replay-browser` are used', function() {
      const appendedUrl = getCustomBaseUrl(
        {
          replayExecution: 'test-execution-0000000.json',
          replayBrowser: [1, 2]
        },
        'tests/index.html?hidepassed'
      );

      assert.deepEqual(appendedUrl, 'tests/index.html?hidepassed');
    });

    it('should add `partitionCount` to multiple test pages when `partitionCount` option is used', function() {
      const appendedUrl = getCustomBaseUrl({ partitionCount: 3 }, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar'
      ]);

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp&partitionCount=3',
        'tests/index.html?hidepassed&foo=bar&partitionCount=3'
      ]);
    });

    it('should add `partitionCount` when `partitionCount` to multiple test pages and `parallel` option are used', function() {
      const appendedUrl = getCustomBaseUrl({ partitionCount: 5, parallel: true }, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar'
      ]);

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp&partitionCount=5',
        'tests/index.html?hidepassed&foo=bar&partitionCount=5'
      ]);
    });

    it('should not add any params to multiple test pages when `browser-count` option is used', function() {
      const appendedUrl = getCustomBaseUrl({ browserCount: 2 }, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar'
      ]);

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar'
      ]);
    });

    it('should add `partitionCount`, and `partition` to multiple test pages when `partition-count`, `browser-count`, and `partition` are used.', function() {
      const appendedUrl = getCustomBaseUrl(
        { partitionCount: 5, partition: [1, 2, 3], browserCount: 2 },
        [
          'tests/index.html?hidepassed&derp=herp',
          'tests/index.html?hidepassed&foo=bar'
        ]
      );

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp&partitionCount=5&partition=1&partition=2&partition=3',
        'tests/index.html?hidepassed&foo=bar&partitionCount=5&partition=1&partition=2&partition=3'
      ]);
    });

    it('should not add any params to multiple test pages when `replay-execution` and `replay-browser` are used', function() {
      const appendedUrl = getCustomBaseUrl(
        {
          replayExecution: 'test-execution-0000000.json',
          replayBrowser: [1, 2]
        },
        [
          'tests/index.html?hidepassed&derp=herp',
          'tests/index.html?hidepassed&foo=bar'
        ]
      );

      assert.deepEqual(appendedUrl, [
        'tests/index.html?hidepassed&derp=herp',
        'tests/index.html?hidepassed&foo=bar'
      ]);
    });
  });

  describe('getMultipleTestPages', function() {
    it('should have multiple test pages with no partitions specified', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { parallel: true, partitionCount: 2 }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&partitionCount=2&partition=1',
        'tests/index.html?hidepassed&partitionCount=2&partition=2'
      ]);
    });

    it('should have multiple test pages with specified partitions', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { parallel: true, partitionCount: 4, partition: [3, 4] }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&partitionCount=4&partition=3',
        'tests/index.html?hidepassed&partitionCount=4&partition=4'
      ]);
    });

    it('should have multiple test pages for each test_page in the config file with no partitions specified', function() {
      const testPages = getMultipleTestPages(
        { configFile: 'testem.multiple-test-page.js' },
        { parallel: true, partitionCount: 2 }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&derp=herp&partitionCount=2&partition=1',
        'tests/index.html?hidepassed&derp=herp&partitionCount=2&partition=2',
        'tests/index.html?hidepassed&foo=bar&partitionCount=2&partition=1',
        'tests/index.html?hidepassed&foo=bar&partitionCount=2&partition=2'
      ]);
    });

    it('should have multiple test pages for each test_page in the config file with partitions specified', function() {
      const testPages = getMultipleTestPages(
        { configFile: 'testem.multiple-test-page.js' },
        { parallel: true, partitionCount: 4, partition: [3, 4] }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&derp=herp&partitionCount=4&partition=3',
        'tests/index.html?hidepassed&derp=herp&partitionCount=4&partition=4',
        'tests/index.html?hidepassed&foo=bar&partitionCount=4&partition=3',
        'tests/index.html?hidepassed&foo=bar&partitionCount=4&partition=4'
      ]);
    });

    it('should have a test page with `browser` param with specified number of browser', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { browserCount: 1 }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&browser=1'
      ]);
    });

    it('should have a test page with `partitionCount` and `browser` with splitting when specified number of browser', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { browserCount: 1, partitionCount: 2 }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&partitionCount=2&browser=1'
      ]);
    });

    it('should have multiple test pages with specificed number of browsers, no specified partitions and no splitting', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { browserCount: 2 }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&browser=1',
        'tests/index.html?hidepassed&browser=2'
      ]);
    });

    it('should have multiple test pages with `browserCount`, `partitionCount`, and `partition` specified', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { browserCount: 2, partitionCount: 3, partition: [2, 3] }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&partitionCount=3&partition=2&partition=3&browser=1',
        'tests/index.html?hidepassed&partitionCount=3&partition=2&partition=3&browser=2'
      ]);
    });

    it('should have multiple test pages for each test_page in the config file with partitions specified and browser Ids', function() {
      const testPages = getMultipleTestPages(
        { configFile: 'testem.multiple-test-page.js' },
        { browserCount: 1, partitionCount: 4, partition: [3, 4] }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&derp=herp&partitionCount=4&partition=3&partition=4&browser=1',
        'tests/index.html?hidepassed&foo=bar&partitionCount=4&partition=3&partition=4&browser=1'
      ]);
    });

    it('should have multiple test pages with test replay execution', function() {
      const testPages = getMultipleTestPages(
        { testPage: 'tests/index.html?hidepassed' },
        { replayExecution: 'abc.json', replayBrowser: [2] }
      );

      assert.deepEqual(testPages, [
        'tests/index.html?hidepassed&browser=2'
      ]);
    });
  });
});
