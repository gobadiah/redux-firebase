class Schema {
  constructor(key) {
    if (!key) {
      throw new Error('key is mandatory for each schema');
    } else if (typeof(key) !== 'string') {
      throw new Error('key must be a string');
    }
    this._key           = key;
    this._relationships = {};
  }

  key() {
    return this._key;
  }

  relationships() {
    return this._relationships;
  }

  relation(field) {
    return this._relationships[field];
  }

  hasMany(schema, field, inverse_of, options) {
    this._define(schema, field, inverse_of, 'HAS_MANY', options);
    schema._define(this, inverse_of, field, 'BELONGS_TO');
    return this;
  }

  _define(schema, field, inverse_of, type, options) {
    if (!options) {
      options = {};
    }
    this._relationships[field] = { schema, field, inverse_of, type, options };
  }
}

export default Schema;
