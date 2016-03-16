import chai, { expect } from 'chai';
chai.config.truncateThreshold = 0;

import Schema   from '../src/schema';
import actions  from '../src/actions';
import {
  actionType,
  prefixes
} from '../src/constants';

describe('actions', () => {
  const users = new Schema('users');
  const shoes = new Schema('shoes');
  users.hasMany(shoes, 'shoes', 'owner');

  const schemas = {
    users,
    shoes
  };

  it('should create action creators', () => {
    const result = actions(schemas);
    const createUserAction = result['users'].create({ name: 'potatoe' });
    expect(createUserAction).to.eql({
      type: actionType(prefixes['CREATE_PREFIX'], 'users'),
      payload: {
        name: 'potatoe',
        shoes: {
        }
      },
      meta: {
        key: 'users'
      }
    });
    const createShoeAction = result['shoes'].create({ brand: 'a shoe brand' });
    expect(createShoeAction).to.eql({
      type: actionType(prefixes['CREATE_PREFIX'], 'shoes'),
      payload: {
        brand: 'a shoe brand',
        owner: null
      },
      meta: {
        key: 'shoes'
      }
    });

    const destroyUserAction = result['users'].destroy(1);
    expect(destroyUserAction).to.eql({
      type: actionType(prefixes['DESTROY_PREFIX'], 'users'),
      payload: 1,
      meta: {
        key: 'users'
      }
    });

    const updateUserAction = result['users'].update({ id: 1, age: 26 });
    expect(updateUserAction).to.eql({
      type: actionType(prefixes['UPDATE_PREFIX'], 'users'),
      payload: {
        id: 1,
        age: 26
      },
      meta: {
        key: 'users'
      }
    });
  });
});
