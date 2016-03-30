import { expect } from 'chai';

import Schema from '../src/schema';

describe('schema', () => {
  it('should instantiate a new schema', () => {
    const obj = new Schema('users');

    expect(obj.key()).to.eql('users');
  });

  it('should throw if there is no key', () => {
    const foo = () => new Schema();
    expect(foo).to.throw(Error);
  });

  it('should throw if the key is not a string', () => {
    const bar = () => new Schema(1);
    expect(bar).to.throw(Error);
  });

  it('should be able to define a one to many relationship', () => {
    const users = new Schema('users');
    const pants = new Schema('pants');

    users.hasMany(pants, 'private_pants', 'owner');
    let result = [];
    for (let field in users.relationships()) {
      result.push(field);
    }
    expect(result).to.eql(['private_pants']);

    result = [];
    for (let field in pants.relationships()) {
      result.push(field);
    }
    expect(result).to.eql(['owner']);

    expect(users.relation('private_pants').type).to.eql('HAS_MANY');
  });

  it('should be able to define nullify dependency', () => {
    const users = new Schema('users');
    const cars  = new Schema('cars');
    users.hasMany(cars, 'private_cars', 'owner', { dependent: 'nullify' });
  });
});
