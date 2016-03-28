import { fromJS }     from 'immutable';

import Schema         from '../../src/schema';
import createReducer  from '../../src/reducer';

const users = new Schema('users');
const shoes = new Schema('shoes');
users.hasMany(shoes, 'shoes', 'owner');

export const ENDPOINT = 'ws://localhost.firebaseio.test:5000';

export const schemas = {
  users,
  shoes
};

export const entities = fromJS({
  users: {
    one: {
      id: 'one',
      shoes: {
        a: true,
        b: true
      }
    },
    two: {
      id: 'two',
      shoes: {
        c: true
      },
      name: 'Alfred'
    }
  },
  shoes: {
    a: {
      id: 'a',
      brand: 'Puma',
      owner: 'one'
    },
    b: {
      id: 'b',
      brand: 'Tennis',
      owner: 'one'
    },
    c: {
      id: 'c',
      brand: 'Basket',
      owner: 'two'
    }
  }
});
