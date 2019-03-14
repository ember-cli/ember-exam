import weightTestModules from 'ember-exam/test-support/-private/weight-test-modules';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('Unit | weight-test-modules', () => {
  it('should sort a list of file paths by weight', function() {
    const listOfModules = [
      '/eslint/test-1-test',
      '/acceptance/test-1-test',
      '/unit/test-1-test',
      '/integration/test-1-test',
      'test-1-test'
    ];

    expect(weightTestModules(listOfModules)).to.deep.equal([
      '/acceptance/test-1-test',
      'test-1-test',
      '/integration/test-1-test',
      '/unit/test-1-test',
      '/eslint/test-1-test'
    ]);
  });

  it('should sort a list of file paths by weight and alphbetical order', function() {
    const listOfModules = [
      'test-b-test',
      'test-a-test',
      '/eslint/test-b-test',
      '/integration/test-b-test',
      '/integration/test-a-test',
      '/unit/test-b-test',
      '/acceptance/test-b-test',
      '/acceptance/test-a-test',
      '/unit/test-a-test',
      '/eslint/test-a-test'
    ];

    expect(weightTestModules(listOfModules)).to.deep.equal([
      '/acceptance/test-a-test',
      '/acceptance/test-b-test',
      'test-a-test',
      'test-b-test',
      '/integration/test-a-test',
      '/integration/test-b-test',
      '/unit/test-a-test',
      '/unit/test-b-test',
      '/eslint/test-a-test',
      '/eslint/test-b-test'
    ]);
  });
});
