import chai, { expect }       from 'chai';
import { schemas, entities }  from './fixtures';
import update                 from '../src/update';
chai.config.truncateThreshold = 0;

describe('update', () => {
  it('should handle an update without relationship', () => {
    const result = update(schemas, entities, 'shoes', { id: 'c', name: 'my shoes', owner: 'two' });
    expect(result).to.eql({
      'shoes/c': {
        id: 'c',
        owner: 'two',
        name: 'my shoes'
      }
    });
  });

  it('should handle updating a belongs to relationship', () => {
    const result = update(schemas, entities, 'shoes', { id: 'c', name: 'my shoes', owner: 'one' });
    expect(result).to.eql({
      'shoes/c': {
        id: 'c',
        owner: 'one',
        name: 'my shoes'
      },
      'users/one/shoes/c': true,
      'users/two/shoes/c': null
    });
  });

  it('should return an empty object is there is no id in data', () => {
    const result = update(schemas, entities, 'shoes', { name: 'friend shoes' });
    expect(result).to.eql({
    });
  });

  it('should throw when modifying HAS_MANY relationships', () => {
    const foo = () => update(schemas, entities, 'users', { id: 'one', shoes: { 'a': true } });
    expect(foo).to.throw(Error);
  });

  it('should not update if the id does not exist', () => {
    const result = update(schemas, entities, 'shoes', { id: 'c', owner: 'unknown' });
    expect(result).to.eql({
      'shoes/c': { id: 'c' }
    });
  });

  it('should set to null the relations', () => {
    const result = update(schemas, entities, 'shoes', { id: 'c', owner: null });
    expect(result).to.eql({
      'shoes/c': { id: 'c', owner: null },
      'users/two/shoes/c': null
    });
  });
});
