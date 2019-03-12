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
    1: ['path/to/testmodule', 'path/to/another/testmodule']
  }
};

describe('TestemEvents', function() {
  beforeEach(function() {
    fs.mkdirpSync(fixtureDir);
    this.testemEvents = new TestemEvents(fixtureDir);
    this.moduleQueue = ['foo', 'bar', 'baz', 'boo', 'far', 'faz'];
  });

  afterEach(function() {
    fs.removeSync(fixtureDir);
  });

  describe('setModuleQueue', function() {
    beforeEach(function() {
      fixturify.writeSync(fixtureDir, {
        'test-execution-123.json': JSON.stringify(testExecutionJson)
      });
    });

    it('set sharedModuleQueue for load-balance mode', function() {
      this.testemEvents.setModuleQueue(1, this.moduleQueue, true, false);

      assert.deepEqual(
        this.testemEvents.stateManager.getSharedModuleQueue(),
        this.moduleQueue
      );
    });

    it('ignore subsequent setModuleQueue if moduleQueue is already set for load-balance mode', function() {
      const anotherModuleQueue = ['a', 'b', 'c'];
      this.testemEvents.setModuleQueue(1, this.moduleQueue, true, false);
      this.testemEvents.setModuleQueue(
        2,
        anotherModuleQueue,
        true,
        false
      );

      assert.deepEqual(
        this.testemEvents.stateManager.getSharedModuleQueue(),
        this.moduleQueue
      );
    });

    it('set browserModuleQueue for replay-execution mode', function() {
      this.testemEvents.setReplayExecutionMap(testExecutionJsonPath, [1]);
      this.testemEvents.setModuleQueue(1, this.moduleQueue, false, true);

      assert.deepEqual(
        this.testemEvents.stateManager.getBrowserModuleQueue(1),
        testExecutionJson.executionMapping[1]
      );
    });

    it('set browserModuleQueue for replay-execution mode when replay-browser is undefined', function() {
      this.testemEvents.setReplayExecutionMap(testExecutionJsonPath);
      this.testemEvents.setModuleQueue(1, this.moduleQueue, false, true);

      assert.deepEqual(
        this.testemEvents.stateManager.getBrowserModuleQueue(1),
        testExecutionJson.executionMapping[1]
      );
    });

    it('throws error if ReplayExecutionMap is not set when setting browserModuleQueue for replay-execution mode', function() {
      assert.throws(
        () =>
          this.testemEvents.setModuleQueue(
            1,
            this.moduleQueue,
            false,
            true
          ),
        /No replay execution map was set on the stateManager/,
        'Error is thrown'
      );
    });
  });

  describe('nextModuleResponse', function() {
    const socket = {
      events: [],
      emit: function(event, payload) {
        this.events.push(event);

        if (payload) {
          this.events.push(payload);
        }
      },
      reset: function() {
        this.events.length = 0;
      }
    };

    const fooResponse = {
      done: false,
      value: 'foo'
    };

    const doneResponse = {
      done: true,
      value: undefined
    };

    const emptyMap = new Map();

    afterEach(function() {
      socket.reset();
    });

    it('should fire next-module-response event and save the moduleName to stateManager.moduleMap when load-balance is true', function() {
      this.testemEvents.stateManager.setSharedModuleQueue(this.moduleQueue);
      this.testemEvents.nextModuleResponse(1, socket, true, true);

      assert.deepEqual(
        socket.events,
        ['testem:next-module-response', fooResponse],
        'testem:next-module-response event was emitted with payload foo'
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap().values().next().value,
        ['foo'],
        'module was correctly saved to the moduleMap'
      );
    });

    it('should fire module-queue-complete event when load-balance is true', function() {
      this.testemEvents.stateManager.setSharedModuleQueue([]);
      this.testemEvents.nextModuleResponse(1, socket, true, false);

      assert.deepEqual(
        socket.events,
        ['testem:next-module-response', doneResponse],
        'testem:module-queue-complete event was emitted'
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap(),
        emptyMap,
        'moduleMap should be in its initial state'
      );
    });

    it('should fire next-module-response event when replayExecution is true', function() {
      this.testemEvents.stateManager.setBrowserModuleQueue(this.moduleQueue, 1);
      this.testemEvents.nextModuleResponse(1, socket, false, false);

      assert.deepEqual(
        socket.events,
        ['testem:next-module-response', fooResponse],
        'testem:next-module-response event was emitted with payload foo'
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap(),
        emptyMap,
        'moduleMap should be in its initial state'
      );
    });

    it('should fire module-queue-complete event when replayExecution is true', function() {
      this.testemEvents.stateManager.setBrowserModuleQueue([], 1);
      this.testemEvents.nextModuleResponse(1, socket, false, false);

      assert.deepEqual(
        socket.events,
        ['testem:next-module-response', doneResponse],
        'testem:module-queue-complete event was emitted'
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap(),
        emptyMap,
        'moduleMap should be in its initial state'
      );
    });

    it('should fire next-module-response event when appMode is dev', function() {
      this.testemEvents.stateManager.setBrowserModuleQueue(this.moduleQueue, 1);
      this.testemEvents.nextModuleResponse(1, socket, false, 'dev');

      assert.deepEqual(
        socket.events,
        ['testem:next-module-response', fooResponse],
        'testem:next-module-response event was emitted with payload foo'
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap(),
        emptyMap,
        'moduleMap should be in its initial state'
      );
    });

    it('should throw error if no moduleQueues were set', function() {
      assert.throws(
        () => this.testemEvents.nextModuleResponse(1, socket, false, 'dev'),
        /No moduleQueue was set/,
        'No moduleQueue error was thrown'
      );
    });
  });

  describe('recoredFailedBrowserId', function() {
    it('record new browserId if test failed', function() {
      this.testemEvents.recoredFailedBrowserId(1);

      assert.deepEqual(
        this.testemEvents.stateManager.getFailedBrowsers(),
        [1],
        'failed browserId 1 is correctly recorded'
      );
    });

    it('does not record browserId that has already been recorded', function() {
      this.testemEvents.recoredFailedBrowserId(1);
      this.testemEvents.recoredFailedBrowserId(1);

      assert.deepEqual(
        this.testemEvents.stateManager.getFailedBrowsers(),
        [1],
        'failed browserId 1 is correctly recorded only once'
      );
    });
  });

  describe('completedBrowsersHandler', function() {
    const mockUi = {
      writeLine: () => {}
    };

    it('should increment completedBrowsers only when completedBrowsers is less than browserCount', function() {
      this.testemEvents.completedBrowsersHandler(
        2,
        mockUi,
        true,
        'test-execution.json',
        false
      );

      assert.equal(
        this.testemEvents.stateManager.completedBrowsers(),
        1,
        'completedBrowsers was incremented'
      );
    });

    it('should write test-execution file and cleanup state when completedBrowsers equals browserCount and load-balance is true', function() {
      this.testemEvents.stateManager.addToModuleMap('a', 1);
      this.testemEvents.completedBrowsersHandler(
        1,
        mockUi,
        true,
        'test-execution.json',
        true
      );

      const actual = fs.readFileSync(
        path.join(fixtureDir, 'test-execution.json')
      );

      assert.deepEqual(JSON.parse(actual), {
        numberOfBrowsers: 1,
        failedBrowsers: [],
        executionMapping: {
          1: ['a']
        }
      });
    });

    it('should increment completedBrowsers when load-balance is false', function() {
      this.testemEvents.completedBrowsersHandler(
        2,
        mockUi,
        false,
        'test-execution.json',
        false
      );

      assert.equal(
        this.testemEvents.stateManager.completedBrowsers(),
        1,
        'completedBrowsers was incremented'
      );
    });

    it('should not clean up states from stateManager when test execution is not completed', function() {
      this.testemEvents.stateManager.addToModuleMap('a', 1);
      this.testemEvents.stateManager.addToModuleMap('b', 2);

      this.testemEvents.completedBrowsersHandler(
        2,
        mockUi,
        true,
        'test-execution.json',
        false
      );

      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap().size,
        2
      );
    });

    it('should clean up states from stateManager when test execution is completed', function() {
      const mockReplayExecutionMap = { 1: ['a'] };
      this.testemEvents.stateManager.addToModuleMap('a', 1);
      this.testemEvents.stateManager.setReplayExecutionMap(mockReplayExecutionMap);
      this.testemEvents.completedBrowsersHandler(
        1,
        mockUi,
        true,
        'test-execution.json',
        false
      );

      assert.deepEqual(
        this.testemEvents.stateManager.getModuleMap().size,
        0
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getSharedModuleQueue(),
        null
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getBrowserModuleQueue(),
        null
      );
      assert.deepEqual(
        this.testemEvents.stateManager.getReplayExecutionMap(),
        mockReplayExecutionMap
      );
    });
  });
});
