import chai, { expect }       from 'chai';
import { fromJS }             from 'immutable';
import { schemas, entities }  from './fixtures';
import Schema                 from '../src/schema';
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

  it('should construct right payload when destroying a nullify dependency', () => {
    const users = new Schema('users');
    const cars  = new Schema('cars');
    users.hasMany(cars, 'cars', 'owner', { dependent: 'nullify' });
    const schemas = {
      users,
      cars
    };
    const entities = fromJS({
      users: {
        one: {
          id: 'one',
          cars: {
            car: true
          }
        }
      },
      cars: {
        car: {
          owner: 'one'
        }
      }
    });
    const result = destroy(schemas, entities, 'users', 'one');
    expect(result).to.eql({
      'users/one': null,
      'cars/car/owner': null
    });
  });
});
