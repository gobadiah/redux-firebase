import chai, { expect } from 'chai';
chai.config.truncateThreshold = 0;

import Schema           from '../src/schema';
import actions          from '../src/actions';
import {
  actionType,
  prefixes
} from '../src/constants';
import createMiddleware from '../src/middleware';
import createReducer    from '../src/reducer';

describe('reducer', () => {
  const users = new Schema('users');
  const shoes = new Schema('shoes');
  users.hasMany(shoes, 'shoes', 'owner');

  const schemas = {
    users,
    shoes
  };

  it('should create a reducer', () => {
    const reducer = createReducer(schemas);
  });
});
