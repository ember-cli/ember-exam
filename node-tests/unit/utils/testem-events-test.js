'use strict';

const assert = require('assert');
const fixturify = require('fixturify');
const fs = require('fs-extra');
const path = require('path');
const TestemEvents = require('../../../lib/utils/testem-events');

const fixtureDir = 'tmp/fixture';
const testExecutionJsonPath = path.join(fixtureDir, 'test-execution-123.json');
const testExecutionJson = {
  numberOfBrowsers: 1,
  failedBrowsers: [],
  executionMapping: {
    1: ['path/to/testmodule', 'path/to/another/testmodule'],
  },
};

describe('TestemEvents', function () {
  beforeEach(function () {
    fs.mkdirpSync(fixtureDir);
    this.testemEvents = new TestemEvents(fixtureDir);
    this.moduleQueue = ['foo', 'bar', 'baz', 'boo', 'far', 'faz'];
  });

  afterEach(function () {
    fs.removeSync(fixtureDir);
  });

  describe('setModuleQueue', function () {
    beforeEach(function () {
      fixturify.writeSync(fixtureDir, {
        'test-execution-123.json': JSON.stringify(testExecutionJson),
      });
    });

    it('set TestModuleQueue for load-balance mode', function () {
      this.testemEvents.setModuleQueue(1, this.moduleQueue, true, false);

      assert.deepEqual(
        this.testemEvents.stateManager.getTestModuleQueue(),
        this.moduleQueue,
      );
    });

    it('ignore subsequent setModuleQueue if moduleQueue is already set for load-balance mode', function () {
      const anotherModuleQueue = ['a', 'b', 'c'];
      this.testemEvents.setModuleQueue('1', this.moduleQueue, true, false);
      this.testemEvents.setModuleQueue('2', anotherModuleQueue, true, false);

      assert.deepEqual(
        this.testemEvents.stateManager.getTestModuleQueue(),
        this.moduleQueue,
      );
    });

    it('set replayExecutionModuleQueue for replay-execution mode', function () {
      this.testemEvents.setReplayExecutionMap(testExecutionJsonPath, ['1']);
      this.testemEvents.setModuleQueue('1', this.moduleQueue, false, true);

      assert.deepEqual(
        this.testemEvents.stateManager.getReplayExecutionModuleQueue('1'),
        testExecutionJson.executionMapping['1'],
      );
    });

    it('set replayExecutionModuleQueue for replay-execution mode when replay-browser is undefined', function () {
      this.testemEvents.setReplayExecutionMap(testExecutionJsonPath);
      this.testemEvents.setModuleQueue('1', this.moduleQueue, false, true);

      assert.deepEqual(
        this.testemEvents.stateManager.getReplayExecutionModuleQueue('1'),
        testExecutionJson.executionMapping['1'],
      );
    });

    it('throws error if ReplayExecutionMap is not set when setting replayExecutionModuleQueue for replay-execution mode', function () {
      assert.throws(
        () =>
          this.testemEvents.setModuleQueue(1, this.moduleQueue, false, true),
        /No replay execution map was set on the stateManager/,
        'Error is thrown',
      );
    });
  });

  describe('nextModuleResponse', function () {
    const socket = {
      events: [],
      emit: function (event, payload) {
        this.events.push(event);

        if (payload) {
          this.events.push(payload);
        }
      },
      reset: function () {
        this.events.length = 0;
      },
    };

    const fooResponse = {
      done: false,
      value: 'foo',
    };

    const emptyMap = new Map();

    afterEach(function () {
      socket.reset();
    });

    it('should fire next-module-response event and save the moduleName to stateManager.moduleMap when write-execution-file is true', function () {
      this.testemEvents.stateManager.setTestModuleQueue(this.moduleQueue);
      this.testemEvents.nextModuleResponse(1, socket, true);

      assert.deepEqual(
        socket.events,
        ['testem:next-module-response', fooResponse],
        'testem:next-module-response event was emitted with payload foo',
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap().values().next().value,
        ['foo'],
        'module was correctly saved to the moduleMap',
      );
    });

    it('should not save the moduleName to stateManager.moduleMap when write-execution-file is false', function () {
      this.testemEvents.stateManager.setReplayExecutionModuleQueue([], 1);
      this.testemEvents.nextModuleResponse(1, socket, false);

      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap(),
        emptyMap,
        'moduleMap should be in its initial state',
      );
    });

    it('should throw error if no moduleQueues were set', function () {
      assert.throws(
        () => this.testemEvents.nextModuleResponse(1, socket, false, 'dev'),
        /No moduleQueue was set/,
        'No moduleQueue error was thrown',
      );
    });
  });

  describe('recordFailedBrowserId', function () {
    const launcher = {
      settings: {
        test_page: 'browser=1',
      },
    };

    it('record new browserId if test failed', function () {
      this.testemEvents.recordFailedBrowserId(launcher, {});

      assert.deepEqual(
        this.testemEvents.stateManager.getFailedBrowsers(),
        [1],
        'failed browserId 1 is correctly recorded',
      );
    });

    it('does not record browserId that has already been recorded', function () {
      this.testemEvents.recordFailedBrowserId(launcher, {});
      this.testemEvents.recordFailedBrowserId(launcher, {});

      assert.deepEqual(
        this.testemEvents.stateManager.getFailedBrowsers(),
        [1],
        'failed browserId 1 is correctly recorded only once',
      );
    });
  });

  describe('completedBrowsersHandler', function () {
    const mockUi = {
      writeLine: () => {},
    };

    it('should increment completedBrowsers only when completedBrowsers is less than browserCount', function () {
      this.testemEvents.completedBrowsersHandler(
        2,
        1,
        mockUi,
        new Map([
          ['loadBalance', true],
          ['writeExecutionFile', false],
        ]),
        '0000',
      );

      assert.strictEqual(
        this.testemEvents.stateManager.getCompletedBrowser(),
        1,
        'completedBrowsers was incremented',
      );
    });

    it('should write test-execution file and cleanup state when completedBrowsers equals browserCount and load-balance is true', function () {
      this.testemEvents.stateManager.addModuleNameToReplayExecutionMap('a', 1);
      this.testemEvents.stateManager.addToStartedLaunchers(1010);

      this.testemEvents.completedBrowsersHandler(
        1,
        1,
        mockUi,
        new Map([
          ['loadBalance', true],
          ['writeExecutionFile', true],
        ]),
        '0000',
      );

      const actual = fs.readFileSync(
        path.join(fixtureDir, 'test-execution-0000.json'),
      );

      assert.deepEqual(JSON.parse(actual), {
        numberOfBrowsers: 1,
        failedBrowsers: [],
        executionMapping: {
          1: ['a'],
        },
      });
    });

    it('should write module-run-details file and cleanup state when completedBrowsers equals browserCount, load-balance is true, and write-execution-file is false', function () {
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test',
        passed: true,
        failed: false,
        skipped: false,
        duration: 1,
      });
      this.testemEvents.stateManager.addToStartedLaunchers(1010);

      this.testemEvents.completedBrowsersHandler(
        1,
        1,
        mockUi,
        new Map([
          ['loadBalance', true],
          ['writeModuleMetadataFile', true],
        ]),
        '0000',
      );

      const actual = fs.readFileSync(
        path.join(fixtureDir, 'module-metadata-0000.json'),
      );

      assert.deepEqual(JSON.parse(actual).modules, [
        {
          moduleName: 'a',
          total: 1,
          passed: 1,
          failed: 0,
          skipped: 0,
          duration: 1,
          failedTests: [],
        },
      ]);
    });

    it('should write module-run-details file with sorted by duration', function () {
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: false,
        duration: 1,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test 2',
        passed: false,
        failed: true,
        skipped: false,
        duration: 8,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'b',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: false,
        duration: 1,
      });

      this.testemEvents.stateManager.addToStartedLaunchers(1010);

      this.testemEvents.completedBrowsersHandler(
        1,
        1,
        mockUi,
        new Map([
          ['loadBalance', true],
          ['writeModuleMetadataFile', true],
        ]),
        '0000',
      );

      const actual = fs.readFileSync(
        path.join(fixtureDir, 'module-metadata-0000.json'),
      );

      assert.deepEqual(JSON.parse(actual).modules, [
        {
          moduleName: 'a',
          total: 2,
          passed: 1,
          failed: 1,
          skipped: 0,
          duration: 9,
          failedTests: ['test 2'],
        },
        {
          moduleName: 'b',
          total: 1,
          passed: 1,
          failed: 0,
          skipped: 0,
          duration: 1,
          failedTests: [],
        },
      ]);
    });

    it('should add skipped test number to write module-metadata-file with sorted by duration', function () {
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: true,
        duration: 0,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'a',
        testName: 'test 2',
        passed: false,
        failed: true,
        skipped: false,
        duration: 8,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'b',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: false,
        duration: 1,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'b',
        testName: 'test 1',
        passed: true,
        failed: false,
        skipped: false,
        duration: 0,
      });
      this.testemEvents.stateManager.addToModuleMetadata({
        moduleName: 'b',
        testName: 'test 1',
        paseed: true,
        failed: false,
        skipped: true,
        duration: 1,
      });

      this.testemEvents.stateManager.addToStartedLaunchers(1010);

      this.testemEvents.completedBrowsersHandler(
        1,
        1,
        mockUi,
        new Map([
          ['loadBalance', true],
          ['writeModuleMetadataFile', true],
        ]),
        '0000',
      );

      const actual = fs.readFileSync(
        path.join(fixtureDir, 'module-metadata-0000.json'),
      );

      assert.deepEqual(JSON.parse(actual).modules, [
        {
          moduleName: 'a',
          total: 2,
          passed: 0,
          failed: 1,
          skipped: 1,
          duration: 8,
          failedTests: ['test 2'],
        },
        {
          moduleName: 'b',
          total: 3,
          passed: 2,
          failed: 0,
          skipped: 1,
          duration: 2,
          failedTests: [],
        },
      ]);
    });

    it('should increment completedBrowsers when load-balance is false', function () {
      this.testemEvents.completedBrowsersHandler(
        2,
        1,
        mockUi,
        new Map([
          ['loadBalance', false],
          ['writeExecutionFile', false],
        ]),
        '0000',
      );

      assert.strictEqual(
        this.testemEvents.stateManager.getCompletedBrowser(),
        1,
        'completedBrowsers was incremented',
      );
    });

    it('should not clean up states from stateManager when test execution is not completed', function () {
      this.testemEvents.stateManager.addModuleNameToReplayExecutionMap('a', 1);
      this.testemEvents.stateManager.addModuleNameToReplayExecutionMap('b', 2);

      this.testemEvents.completedBrowsersHandler(
        2,
        1011,
        mockUi,
        new Map([['loadBalance', true]]),
        '0000',
      );

      assert.deepEqual(this.testemEvents.stateManager.getModuleMap().size, 2);
    });

    it('should clean up states from stateManager when test execution is completed', function () {
      const mockReplayExecutionMap = { 1: ['a'] };
      this.testemEvents.stateManager.addModuleNameToReplayExecutionMap('a', 1);
      this.testemEvents.stateManager.setReplayExecutionMap(
        mockReplayExecutionMap,
      );
      this.testemEvents.stateManager.addToStartedLaunchers(1010);

      this.testemEvents.completedBrowsersHandler(
        1,
        1010,
        mockUi,
        new Map([['loadBalance', true]]),
        '0000',
      );

      assert.deepEqual(this.testemEvents.stateManager.getModuleMap().size, 0);
      assert.deepEqual(
        this.testemEvents.stateManager.getTestModuleQueue(),
        null,
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getReplayExecutionModuleQueue(),
        null,
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getReplayExecutionMap(),
        mockReplayExecutionMap,
      );
    });

    it('should clean up states from stateManager when all launched browsers complete tests', function () {
      const mockReplayExecutionMap = { 1: ['a'] };
      this.testemEvents.stateManager.addModuleNameToReplayExecutionMap('a', 1);
      this.testemEvents.stateManager.setReplayExecutionMap(
        mockReplayExecutionMap,
      );
      this.testemEvents.stateManager.addToStartedLaunchers(1010);

      this.testemEvents.completedBrowsersHandler(
        1,
        1010,
        mockUi,
        new Map([['loadBalance', true]]),
        '0000',
      );

      assert.deepEqual(this.testemEvents.stateManager.getModuleMap().size, 0);
      assert.deepEqual(
        this.testemEvents.stateManager.getTestModuleQueue(),
        null,
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getReplayExecutionModuleQueue(),
        null,
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getReplayExecutionMap(),
        mockReplayExecutionMap,
      );
    });

    it('should clean up states from stateManager when all launched browsers exited', function () {
      this.testemEvents.stateManager.setTestModuleQueue([]);
      this.testemEvents.stateManager.addToStartedLaunchers(1010);
      this.testemEvents.stateManager.addToStartedLaunchers(1011);

      this.testemEvents.completedBrowsersHandler(
        2,
        1010,
        mockUi,
        new Map([['loadBalance', true]]),
        '0000',
      );

      assert.deepEqual(this.testemEvents.stateManager.getModuleMap().size, 0);
      assert.deepEqual(this.testemEvents.stateManager.getTestModuleQueue(), []);

      this.testemEvents.completedBrowsersHandler(
        2,
        1011,
        mockUi,
        new Map([['loadBalance', true]]),
        '0000',
      );

      assert.deepEqual(
        this.testemEvents.stateManager.getTestModuleQueue(),
        null,
      );
    });
  });
});
