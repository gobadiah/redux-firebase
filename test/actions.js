import chai, { expect } from 'chai';
chai.config.truncateThreshold = 0;

import Schema   from '../src/schema';
import actions  from '../src/actions';
import {
  CREATE_TYPE,
  UPDATE_TYPE,
  DESTROY_TYPE
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
      type: CREATE_TYPE('users'),
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
      type: CREATE_TYPE('shoes'),
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
      type: DESTROY_TYPE('users'),
      payload: 1,
      meta: {
        key: 'users'
      }
    });

    const updateUserAction = result['users'].update({ id: 1, age: 26 });
    expect(updateUserAction).to.eql({
      type: UPDATE_TYPE('users'),
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
