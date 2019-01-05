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
}

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
      this.testemEvents.setModuleQueue(1, this.moduleQueue, true, false, 'ci');

      assert.deepEqual(this.testemEvents.stateManager.getSharedModuleQueue(), this.moduleQueue);
    });

    it('ignore subsequent setModuleQueue if moduleQueue is already set for load-balance mode', function() {
      const anotherModuleQueue = ['a', 'b', 'c'];
      this.testemEvents.setModuleQueue(1, this.moduleQueue, true, false, 'ci');
      this.testemEvents.setModuleQueue(2, anotherModuleQueue, true, false, 'ci');

      assert.deepEqual(this.testemEvents.stateManager.getSharedModuleQueue(), this.moduleQueue);
    });

    it('set browserModuleQueue for replay-execution mode', function() {
      this.testemEvents.setReplayExecutionMap(testExecutionJsonPath, [1]);
      this.testemEvents.setModuleQueue(1, this.moduleQueue, false, true, 'ci');

      assert.deepEqual(this.testemEvents.stateManager.getBrowserModuleQueue(1), testExecutionJson.executionMapping[1]);
    });

    it('set browserModuleQueue for replay-execution mode when replay-browser is undefined', function() {
      this.testemEvents.setReplayExecutionMap(testExecutionJsonPath);
      this.testemEvents.setModuleQueue(1, this.moduleQueue, false, true, 'ci');

      assert.deepEqual(this.testemEvents.stateManager.getBrowserModuleQueue(1), testExecutionJson.executionMapping[1]);
    });

    it('throws error if ReplayExecutionMap is not set when setting browserModuleQueue for replay-execution mode', function() {
      assert.throws(() => this.testemEvents.setModuleQueue(1, this.moduleQueue, false, true, 'ci'), /No replay execution map was set on the stateManager/, 'Error is thrown');
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
      reset: function () {
        this.events.length = 0;
      }
    };

    afterEach(function() {
      socket.reset();
    });

    it('should fire next-module-response event and save the moduleName to stateManager.moduleMap when load-balance is true', function() {
      this.testemEvents.stateManager.setSharedModuleQueue(this.moduleQueue);
      this.testemEvents.nextModuleResponse(1, socket, true, 'ci');

      assert.deepEqual(socket.events, ['testem:next-module-response', 'foo'], 'testem:next-module-response event was emitted with payload foo');
      assert.deepEqual((this.testemEvents.stateManager.getModuleMap())[1], ['foo'], 'module was correctly saved to the moduleMap');
    });

    it('should fire module-queue-complete event when load-balance is true', function() {
      this.testemEvents.stateManager.setSharedModuleQueue([]);
      this.testemEvents.nextModuleResponse(1, socket, true, 'ci');

      assert.deepEqual(socket.events, ['testem:module-queue-complete'], 'testem:module-queue-complete event was emitted');
      assert.deepEqual(this.testemEvents.stateManager.getModuleMap(), Object.create(null), 'moduleMap should be in its initial state');
    });

    it('should fire next-module-response event when replayExecution is true', function() {
      this.testemEvents.stateManager.setBrowserModuleQueue(this.moduleQueue, 1);
      this.testemEvents.nextModuleResponse(1, socket, false, 'ci');

      assert.deepEqual(socket.events, ['testem:next-module-response', 'foo'], 'testem:next-module-response event was emitted with payload foo');
      assert.deepEqual(this.testemEvents.stateManager.getModuleMap(), Object.create(null), 'moduleMap should be in its initial state');
    });

    it('should fire module-queue-complete event when replayExecution is true', function() {
      this.testemEvents.stateManager.setBrowserModuleQueue([], 1);
      this.testemEvents.nextModuleResponse(1, socket, false, 'ci');

      assert.deepEqual(socket.events, ['testem:module-queue-complete'], 'testem:module-queue-complete event was emitted');
      assert.deepEqual(this.testemEvents.stateManager.getModuleMap(), Object.create(null), 'moduleMap should be in its initial state');
    });

    it('should fire next-module-response event when appMode is dev', function() {
      this.testemEvents.stateManager.setBrowserModuleQueue(this.moduleQueue, 1);
      this.testemEvents.nextModuleResponse(1, socket, false, 'dev');

      assert.deepEqual(socket.events, ['testem:next-module-response', 'foo'], 'testem:next-module-response event was emitted with payload foo');
      assert.deepEqual(this.testemEvents.stateManager.getModuleMap(), Object.create(null), 'moduleMap should be in its initial state');
    });

    it('should throw error if no moduleQueues were set', function() {
      assert.throws(() => this.testemEvents.nextModuleResponse(1, socket, false, 'dev'), /No moduleQueue was set/, 'No moduleQueue error was thrown');
    });
  });

  describe('recoredFailedBrowserId', function() {
    it('record new browserId if test failed', function() {
      this.testemEvents.recoredFailedBrowserId(1, { failed: true });

      assert.deepEqual(this.testemEvents.stateManager.getFailedBrowsers(), [1], 'failed browserId 1 is correctly recorded');
    });

    it('does not record browserId that has already been recorded', function() {
      this.testemEvents.recoredFailedBrowserId(1, { failed: true });
      this.testemEvents.recoredFailedBrowserId(1, { failed: true });

      assert.deepEqual(this.testemEvents.stateManager.getFailedBrowsers(), [1], 'failed browserId 1 is correctly recorded only once');
    });


    it('does not record browserId if test passed', function() {
      this.testemEvents.recoredFailedBrowserId(1, { passed: true });

      assert.deepEqual(this.testemEvents.stateManager.getFailedBrowsers(), [], 'browserId does not get recorded for passed test');
    });


    it('does not record browserId if test is skipped', function() {
      this.testemEvents.recoredFailedBrowserId(1, { skipped: true });

      assert.deepEqual(this.testemEvents.stateManager.getFailedBrowsers(), [], 'browserId does not get recorded for skipped test');
    });
  });

  describe('completedBrowsersHandler', function() {
    it('should increment completedBrowsers only when completedBrowsers is less than browserCount', function() {
      this.testemEvents.completedBrowsersHandler(2, true, 'test-execution.json', 'ci');

      assert.equal(this.testemEvents.stateManager.completedBrowsers(), 1, 'completedBrowsers was incremented');
    });

    it('should write test-execution file and cleanup state when completedBrowsers equals browserCount and load-balance is true', function() {
      this.testemEvents.stateManager.addToModuleMap('a', 1)
      this.testemEvents.completedBrowsersHandler(1, true, 'test-execution.json', 'ci');

      const actual = fs.readFileSync(
        path.join(fixtureDir, 'test-execution.json')
      );

      assert.deepEqual(JSON.parse(actual), {
        numberOfBrowsers: 1,
        failedBrowsers:[],
        executionMapping:{
          1:['a']
        }
      });
    });

    it('should increment completedBrowsers when load-balance is false', function() {
      this.testemEvents.completedBrowsersHandler(2, false, 'test-execution.json', 'ci');

      assert.equal(this.testemEvents.stateManager.completedBrowsers(), 1, 'completedBrowsers was incremented');
    });
  });
});
