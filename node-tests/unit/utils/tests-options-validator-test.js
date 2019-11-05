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
      case 'Split':
        return validator.validateSplit();
      case 'Random':
        return validator.validateRandom();
      case 'Parallel':
        return validator.validateParallel();
      case 'writeExecutionFile':
        return validator.validateWriteExecutionFile();
      case 'LoadBalance':
        return validator.validateLoadBalance();
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

  describe('shouldSplit', function() {
    function shouldSplitThrows(options, message) {
      shouldThrow('Split', options, message);
    }

    function shouldSplitEqual(options, message) {
      shouldEqual('Split', options, message);
    }

    it('should log a warning if `split` is less than 2', function() {
      shouldWarn(
        'Split',
        { split: 1 },
        'You should specify a number of files greater than 1 to split your tests across. Defaulting to 1 split which is the same as not using `split`.'
      );
    });

    it('should throw an error if `partition` is used without `split`', function() {
      shouldSplitThrows(
        { partition: [1] },
        /You must specify a `split` value in order to use `partition`/
      );
    });

    it('should throw an error if `partition` contains a value less than 1', function() {
      shouldSplitThrows(
        { split: 2, partition: [1, 0] },
        /Split tests are one-indexed, so you must specify partition values greater than or equal to 1./
      );
    });

    it('should throw an error if `partition` contains a value greater than `split`', function() {
      shouldSplitThrows(
        { split: 2, partition: [1, 3] },
        /You must specify `partition` values that are less than or equal to your `split` value./
      );
    });

    it('should throw an error if `partition` contains duplicate values', function() {
      shouldSplitThrows(
        { split: 2, partition: [1, 2, 1] },
        /You cannot specify the same partition value twice. 1 is repeated./
      );
    });

    it('should return true if using `split`', function() {
      shouldSplitEqual({ split: 2 }, true);
    });

    it('should return true if using `split` and `partition`', function() {
      shouldSplitEqual({ split: 2, partition: [1] }, true);
    });

    it('should return false if not using `split`', function() {
      shouldSplitEqual({}, false);
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
    it('should throw an error if `parallel` is not a numeric value', function() {
      shouldThrow(
        'Parallel',
        { parallel: '--reporter' },
        /EmberExam: You must specify a Numeric value to 'parallel'. Value passed: --reporter/
      );
    });

    it('should throw an error if `split` is not being used', function() {
      shouldThrow(
        'Parallel',
        { parallel: 1 },
        /You must specify the `split` option in order to run your tests in parallel/
      );
    });

    it('should throw an error if used with `replay-execution`', function() {
      shouldThrow(
        'Parallel',
        { replayExecution: 'abc', parallel: 1 },
        /You must not use the `replay-execution` option with the `parallel` option./
      );
    });

    it('should throw an error if used with `replay-browser`', function() {
      shouldThrow(
        'Parallel',
        { replayBrowser: 2, parallel: 1 },
        /You must not use the `replay-browser` option with the `parallel` option./
      );
    });

    it('should throw an error if parallel is > 1 when used with `split`', function() {
      shouldThrow(
        'Parallel',
        { split: 2, parallel: 2 },
        /When used with `split` or `partition`, `parallel` does not accept a value other than 1./
      );
    });

    it('should throw an error if 0 is passed while loadBalance is specified', function() {
      shouldThrow(
        'Parallel',
        { loadBalance: 2, parallel: 0 },
        /You must specify a value greater than 1 to `parallel`./
      );
    });

    it('should return true', function() {
      shouldEqual('Parallel', { split: 2, parallel: 1 }, true);
    });
  });

  describe('ShouldWriteExecutionFile', function() {
    it('should return false when not passed', function() {
      shouldEqual(
        'writeExecutionFile',
        {
          loadBalance: true,
          parallel: 2,
          launch: 'false'
        },
        false
      );
    });

    it('should throw an error if `write-execution-file` is used without `load-balance`', function() {
      shouldThrow(
        'writeExecutionFile',
        { writeExecutionFile: true },
        /You must run test suite with the `load-balance` option in order to use the `write-execution-file` option./
      );
    });

    it('should throw an error if `write-execution-file` is used without `load-balance`', function() {
      shouldThrow(
        'writeExecutionFile',
        {
          split: 2,
          partition: 1,
          writeExecutionFile: true
        },
        /You must run test suite with the `load-balance` option in order to use the `write-execution-file` option./
      );
    });

    it('should throw an error if `write-execution-file` is used without `load-balance`', function() {
      shouldThrow(
        'writeExecutionFile',
        {
          replayExecution: 'test-execution-0000000.json',
          replayBrowser: [1, 2],
          writeExecutionFile: true
        },
        /You must run test suite with the `load-balance` option in order to use the `write-execution-file` option./
      );
    });

    it('should throw an error if `write-execution-file` is used with `no-launch`', function() {
      shouldThrow(
        'writeExecutionFile',
        {
          loadBalance: true,
          parallel: 1,
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
          loadBalance: true,
          parallel: 2,
          writeExecutionFile: true
        },
        true
      );
    });
  });

  describe('shouldLoadBalance', function() {
    it('should throw an error if ember-cli version is below 3.2.0', function() {
      shouldThrow(
        'LoadBalance',
        { loadBalance: true, replayExecution: 'abc' },
        /You must be using ember-cli version \^3.2.0 for this feature to work properly./,
        '3.0.0'
      );
    });

    it('should throw an error if ember-cli version is ~3.1.0', function() {
      shouldThrow(
        'LoadBalance',
        { loadBalance: true, replayExecution: 'abc' },
        /You must be using ember-cli version \^3.2.0 for this feature to work properly./,
        '~3.1.0'
      );
    });

    it('should throw an error if `replayExecution` is passed', function() {
      shouldThrow(
        'LoadBalance',
        { loadBalance: true, replayExecution: 'abc' },
        /You must not use the `replay-execution` option with the `load-balance` option./
      );
    });

    it('should throw an error if `replayBrowser` is passed', function() {
      shouldThrow(
        'LoadBalance',
        { loadBalance: true, replayBrowser: 3 },
        /You must not use the `replay-browser` option with the `load-balance` option./
      );
    });

    it('should throw an error if `parallel` is not defined', function() {
      shouldThrow(
        'LoadBalance',
        { loadBalance: true },
        /You should specify the number of browsers to load-balance against using `parallel` when using `load-balance`./
      );
    });

    it('should throw an error if `parallel` has a value less than 1', function() {
      shouldThrow(
        'LoadBalance',
        { loadBalance: true, parallel: 0 },
        /You should specify the number of browsers to load-balance against using `parallel` when using `load-balance`./
      );
    });

    it('should throw an error if `no-launch` is passed', function() {
      shouldThrow(
        'LoadBalance',
        { loadBalance: true, parallel: 0, launch: 'false' },
        /You must not use `no-launch` option with the `load-balance` option./
      );
    });

    it('should return true', function() {
      shouldEqual('LoadBalance', { loadBalance: true, parallel: 3 }, true);
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
