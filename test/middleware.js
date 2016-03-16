import chai, { expect } from 'chai';
chai.config.truncateThreshold = 0;

import Schema           from '../src/schema';
import actions          from '../src/actions';
import {
  actionType,
  prefixes
} from '../src/constants';
import createMiddleware from '../src/middleware';

describe('middleware', () => {
  const users = new Schema('users');
  const shoes = new Schema('shoes');
  users.hasMany(shoes, 'shoes', 'owner');

  const schemas = {
    users,
    shoes
  };

  it('should create a middleware', () => {
    const middleware = createMiddleware(schemas);
  });
});
