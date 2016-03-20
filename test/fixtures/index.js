import { fromJS } from 'immutable';
import Schema     from '../../src/schema';

const users = new Schema('users');
const shoes = new Schema('shoes');
users.hasMany(shoes, 'shoes', 'owner');

export const schemas = {
  users,
  shoes
};

export const entities = fromJS({
  users: {
    one: {
      shoes: {
        a: true,
        b: true
      }
    },
    two: {
      shoes: {
        c: true
      },
      name: 'Alfred'
    }
  },
  shoes: {
    a: {
      brand: 'Puma',
      owner: 'one'
    },
    b: {
      brand: 'Tennis',
      owner: 'one'
    },
    c: {
      brand: 'Basket',
      owner: 'two'
    }
  }
});
