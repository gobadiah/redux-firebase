import chai, { expect }       from 'chai';
import { schemas, entities }  from './fixtures';
import update                 from '../src/update';
chai.config.truncateThreshold = 0;


describe('update', () => {
  it('should handle a non relationship update', () => {
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
});
