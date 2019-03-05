'use strict';

const assert = require('assert');
const fixturify = require('fixturify');
const fs = require('fs-extra');
const TestOptionsValidator = require('../../../lib/utils/tests-options-validator');
const TestExecutionJson = {
  numberOfBrowsers: 2,
  browserToModuleMap: {
    '1': ['/tests/integration/components/my-component-test'],
    '2': ['/tests/integration/components/navigating-component-test']
  }
};

describe('TestOptionsValidator', function() {
  function validateCommand(validator, cmd) {
    switch (cmd) {
      case 'PartitionCount':
        return validator.validatePartitionCount();
      case 'Random':
        return validator.validateRandom();
      case 'Parallel':
        return validator.validateParallel();
      case 'writeExecutionFile':
        return validator.validateWriteExecutionFile();
      case 'BrowserCount':
        return validator.validateBrowserCount();
      case 'ReplayExecution':
        return validator.validateReplayExecution();
      default:
        throw new Error('invalid command passed');
    }
  }

  function shouldThrow(cmd, options, message, emberCliVer = '3.7.0') {
    const validator = new TestOptionsValidator(
      options,
      options.framework,
      emberCliVer
    );
    assert.throws(() => validateCommand(validator, cmd), message);
  }

  function shouldEqual(cmd, options, value, emberCliVer = '3.7.0') {
    const validator = new TestOptionsValidator(
      options,
      options.framework,
      emberCliVer
    );
    assert.equal(validateCommand(validator, cmd), value);
  }

  function shouldWarn(cmd, options, value, emberCliVer = '3.7.0') {
    /* eslint-disable no-console */
    let originalWarn = console.warn;
    let warnCalled = 0;
    let warnMessage = '';
    console.warn = function(message) {
      warnCalled++;
      warnMessage = message;
    };

    const validator = new TestOptionsValidator(
      options,
      options.framework,
      emberCliVer
    );
    assert.notEqual(validateCommand(validator, cmd), undefined);
    assert.equal(warnCalled, 1);
    assert.equal(warnMessage, value);

    console.warn = originalWarn;
    /* eslint-enable no-console */
  }

  describe('shouldSplitByPartitionCount', function() {
    function shouldSplitByPartitionCountThrows(options, message) {
      shouldThrow('PartitionCount', options, message);
    }

    function shouldSplitByPartitionCountEqual(options, message) {
      shouldEqual('PartitionCount', options, message);
    }

    it('should log a warning if `partitionCount` is less than 2', function() {
      shouldWarn(
        'PartitionCount',
        { partitionCount: 1 },
        'You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 partition-count which is the same as not using `partition-count`.'
      );
    });

    it('should throw an error if `partition` is used without `partition-count`', function() {
      shouldSplitByPartitionCountThrows(
        { partition: [1] },
        /You must specify a `partition-count` value in order to use `partition`/
      );
    });

    it('should throw an error if `partition` contains a value less than 1', function() {
      shouldSplitByPartitionCountThrows(
        { partitionCount: 2, partition: [1, 0] },
        /Split tests are one-indexed, so you must specify partition values greater than or equal to 1./
      );
    });

    it('should throw an error if `partition` contains a value greater than `partition-count`', function() {
      shouldSplitByPartitionCountThrows(
        { partitionCount: 2, partition: [1, 3] },
        /You must specify `partition` values that are less than or equal to your `partition-count` value./
      );
    });

    it('should throw an error if `partition` contains duplicate values', function() {
      shouldSplitByPartitionCountThrows(
        { partitionCount: 2, partition: [1, 2, 1] },
        /You cannot specify the same partition value twice. 1 is repeated./
      );
    });

    it('should return true if using `partition-count`', function() {
      shouldSplitByPartitionCountEqual({ partitionCount: 2 }, true);
    });

    it('should return true if using `partition-count` and `partition`', function() {
      shouldSplitByPartitionCountEqual({ partitionCount: 2, partition: [1] }, true);
    });

    it('should return false if not using `partition-count`', function() {
      shouldSplitByPartitionCountEqual({}, false);
    });
  });

  describe('shouldRandomize', function() {
    function shouldRandomizeEqual(options, message) {
      shouldEqual('Random', options, message);
    }

    it('should return true if `random` is an empty string', function() {
      shouldRandomizeEqual({ random: '' }, true);
    });

    it('should return true if `random` is set to a string', function() {
      shouldRandomizeEqual({ random: '1337' }, true);
    });

    it('should return false if `random` is a non-string', function() {
      shouldRandomizeEqual({ random: true }, false);
    });

    it('should return false if `random` is not used', function() {
      shouldRandomizeEqual({}, false);
    });

    it('should warn that randomization is not supported in mocha', function() {
      shouldWarn(
        'Random',
        { random: '', framework: 'mocha' },
        'Mocha does not currently support randomizing test order, so tests will run in normal order. Please see https://github.com/mochajs/mocha/issues/902 for more info.'
      );
    });
  });

  describe('shouldParallelize', function() {
    it('should throw an error if `partition-count` is not being used', function() {
      shouldThrow(
        'Parallel',
        { parallel: true },
        /You must specify the `partition-count` option in order to run your tests in parallel/
      );
    });

    it('should throw an error if used with `replay-execution`', function() {
      shouldThrow(
        'Parallel',
        { replayExecution: 'abc', parallel: true },
        /You must not use the `replay-execution` option with the `parallel` option./
      );
    });

    it('should throw an error if used with `replay-browser`', function() {
      shouldThrow(
        'Parallel',
        { replayBrowser: 2, parallel: true },
        /You must not use the `replay-browser` option with the `parallel` option./
      );
    });

    it('should throw an error if used with `browser-count`', function() {
      shouldThrow('Parallel', { browserCount: 2, parallel: true }, /You must not use the `browser-count` option with the `parallel` option./);
    });

    it('should return true', function() {
      shouldEqual('Parallel', { partitionCount: 2, partition: 1, parallel: true }, true);
    });
  });

  describe('ShouldWriteExecutionFile', function() {
    it('should return false when not passed', function() {
      shouldEqual(
        'writeExecutionFile',
        {
          browser: 2,
          launch: 'false'
        },
        false
      );
    });

    it('should throw an error if `write-execution-file` is used without `browser-count`', function() {
      shouldThrow(
        'writeExecutionFile',
        { writeExecutionFile: true },
        /You must run test suite with the `browser-count` option in order to use the `write-execution-file` option./
      );
    });

    it('should throw an error if `write-execution-file` is used without `browser-count`', function() {
      shouldThrow(
        'writeExecutionFile',
        {
          partitionCount: 2,
          partition: 1,
          writeExecutionFile: true
        },
        /You must run test suite with the `browser-count` option in order to use the `write-execution-file` option./
      );
    });

    it('should throw an error if `write-execution-file` is used without `browser-count`', function() {
      shouldThrow(
        'writeExecutionFile',
        {
          replayExecution: 'test-execution-0000000.json',
          replayBrowser: [1, 2],
          writeExecutionFile: true
        },
        /You must run test suite with the `browser-count` option in order to use the `write-execution-file` option./
      );
    });

    it('should throw an error if `write-execution-file` is used with `no-launch`', function() {
      shouldThrow(
        'writeExecutionFile',
        {
          browserCount: 1,
          launch: 'false',
          writeExecutionFile: true
        },
        /You must not use no-launch with write-execution-file option./
      );
    });

    it('should return true', function() {
      shouldEqual(
        'writeExecutionFile',
        {
          browserCount: 2,
          parallel: 2,
          writeExecutionFile: true
        },
        true
      );
    });
  });

  describe('shouldBrowserCount', function() {
    it('should throw an error if ember-cli version is below 3.2.0', function() {
      shouldThrow(
        'BrowserCount',
        { browserCount: 1, replayExecution: 'abc' },
        /You must be using ember-cli version \^3.2.0 for this feature to work properly./,
        '3.0.0'
      );
    });

    it('should throw an error if ember-cli version is ~3.1.0', function() {
      shouldThrow(
        'BrowserCount',
        { browserCount: 2, replayExecution: 'abc' },
        /You must be using ember-cli version \^3.2.0 for this feature to work properly./,
        '~3.1.0'
      );
    });

    it('should throw an error if `replayExecution` is passed', function() {
      shouldThrow(
        'BrowserCount',
        { browserCount: 1, replayExecution: 'abc' },
        /You must not use the `replay-execution` option with the `browser-count` option./
      );
    });

    it('should throw an error if `replayBrowser` is passed', function() {
      shouldThrow(
        'BrowserCount',
        { browserCount: 1, replayBrowser: 3 },
        /You must not use the `replay-browser` option with the `browser-count` option./
      );
    });

    it('should throw an error if `parallel` is defined', function() {
      shouldThrow(
        'BrowserCount',
        { browserCount: 2, parallel: true },
        /You must not use the `parallel` option with the `browser-count` option./
      );
    });

    it('should throw an error if `browser-count` has a value less than 1', function() {
      shouldThrow(
        'BrowserCount',
        { browserCount: 0 },
        /You must specify a value greater than 1 to `browser-count`./
      );
    });

    it('should throw an error if `no-launch` is passed', function() {
      shouldThrow(
        'BrowserCount',
        { browserCount: 1, launch: 'false' },
        /You must not use `no-launch` option with the `browser-count` option./
      );
    });

    it('should return true', function() {
      shouldEqual('BrowserCount', { browserCount : 3 }, true);
    });
  });

  describe('shouldReplayExecution', function() {
    before(function() {
      fixturify.writeSync(process.cwd(), {
        'test-execution-0000000.json': JSON.stringify(TestExecutionJson)
      });
    });
    after(function() {
      fs.unlink('test-execution-0000000.json');
    });

    it('should throw an error if `replay-browser` contains a value less than 1', function() {
      shouldThrow(
        'ReplayExecution',
        {
          replayExecution: 'test-execution-0000000.json',
          replayBrowser: [1, 0]
        },
        /You must specify replay-browser values greater than or equal to 1./
      );
    });

    it('should throw an error if `replay-browser` contains duplicate values', function() {
      shouldThrow(
        'ReplayExecution',
        {
          replayExecution: 'test-execution-0000000.json',
          replayBrowser: [1, 2, 1]
        },
        /You cannot specify the same replayBrowser value twice. 1 is repeated./
      );
    });

    it('should throw an error if `replay-browser` contains an invalid browser number', function() {
      shouldThrow(
        'ReplayExecution',
        {
          replayExecution: 'test-execution-0000000.json',
          replayBrowser: [3, 1]
        },
        /You must specify replayBrowser value smaller than a number of browsers in the specified json file./
      );
    });

    it('should throw an error if `no-launch` is used with `replay-execution`.', function() {
      shouldThrow(
        'ReplayExecution',
        {
          replayExecution: 'test-execution-0000000.json',
          launch: 'false'
        },
        /You must not use `no-launch` option with the `replay-execution` option./
      );
    });

    it('should return true', function() {
      shouldEqual(
        'ReplayExecution',
        {
          replayExecution: 'test-execution-0000000.json',
          replayBrowser: [1, 2]
        },
        true
      );
    });
  });
});
