'use strict';

const assert = require('assert');
const ExecutionStateManager = require('../../../lib/utils/execution-state-manager');

describe('ExecutionStateManager', function() {
  beforeEach(function() {
    this.stateManager = new ExecutionStateManager();
    this.moduleQueue = ['foo', 'bar', 'baz', 'boo', 'far', 'faz'];
  });

  describe('initializeStates', function() {
    it('initialize states', function() {
      assert.deepEqual(this.stateManager.getModuleMap().size, 0);
      assert.deepEqual(this.stateManager.getTestModuleQueue(), null);
      assert.deepEqual(this.stateManager.getReplayExecutionModuleQueue(), null);
    });
  });

  describe('moduleQueue', function() {
    it('is shared when no browserId passed to setModuleQueue', function() {
      this.stateManager.setTestModuleQueue(this.moduleQueue);

      assert.deepEqual(
        this.stateManager.getTestModuleQueue(),
        this.moduleQueue,
        'the correct moduleQueue was returned'
      );
    });

    it('returns the next module from the shared moduleQueue and state is preserved', function() {
      this.stateManager.setTestModuleQueue(this.moduleQueue);

      assert.equal(
        this.stateManager.getNextModuleTestModuleQueue(),
        'foo',
        'correctly returns the next module'
      );
      assert.deepEqual(
        this.stateManager.getTestModuleQueue(),
        ['bar', 'baz', 'boo', 'far', 'faz'],
        'the moduleQueue state was updated'
      );
    });

    it('get next module returns null if shared moduleQueue is not set', function() {
      assert.equal(
        this.stateManager.getNextModuleTestModuleQueue(),
        null,
        'returns null when moduleQueue has not been set'
      );
    });

    it('had different queue set when when browserId is specified', function() {
      const anotherQueue = ['1', '2', '3', '4'];
      this.stateManager.setReplayExecutionModuleQueue(this.moduleQueue, 1);
      this.stateManager.setReplayExecutionModuleQueue(anotherQueue, 2);

      assert.deepEqual(
        this.stateManager.getReplayExecutionModuleQueue(1),
        this.moduleQueue
      );
      assert.deepEqual(
        this.stateManager.getReplayExecutionModuleQueue(2),
        anotherQueue
      );
    });

    it('returns the next module from the browser specific moduleQueue and state is preserved', function() {
      this.stateManager.setReplayExecutionModuleQueue(this.moduleQueue, 1);

      assert.equal(
        this.stateManager.getNextModuleReplayExecutionModuleQueue(1),
        'foo',
        'correctly returns the next module'
      );
      assert.deepEqual(
        this.stateManager.getReplayExecutionModuleQueue(1),
        ['bar', 'baz', 'boo', 'far', 'faz'],
        'the moduleQueue state was updated'
      );
    });

    it('get next module returns null if browser moduleQueue is not set', function() {
      assert.equal(
        this.stateManager.getNextModuleReplayExecutionModuleQueue(1),
        null,
        'returns null when moduleQueue has not been set'
      );
    });
  });

  describe('completedBrowsers', function() {
    it('incrementCompletedBrowsers called for the same browserId will only be accounted once', function() {
      this.stateManager.incrementCompletedBrowsers(1);
      this.stateManager.incrementCompletedBrowsers(1);

      assert.deepEqual(this.stateManager.getCompletedBrowser(), 1);
    });
  });
});
