import chai, { expect }       from 'chai';
import { schemas, entities }  from './fixtures';
import destroy                from '../src/destroy';
chai.config.truncateThreshold = 0;

describe('destroy', () => {
  it('should construct right payload when destroying the parent relationship', () => {
    const result = destroy(schemas, entities, 'users', 'one');
    expect(result).to.eql({
      'users/one': null,
      'shoes/a': null,
      'shoes/b': null
    });
  });

  it('should construct right payload when destroying the child', () => {
    const result = destroy(schemas, entities, 'shoes', 'a');
    expect(result).to.eql({
      'users/one/shoes/a': null,
      'shoes/a': null
    });
  });
});
