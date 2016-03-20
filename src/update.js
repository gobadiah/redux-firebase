export default (schemas, entities, key, data) => {
  if (!data.hasOwnProperty('id')) {
    return {};
  }
  const id      = data.id;
  const result  = {};
  const schema  = schemas[key];
  const entity = entities.getIn([key, id]);
  result[key + '/' + id] = data;
  for (let field in schema.relationships()) {
    const relation = schema.relation(field);
    if (!data.hasOwnProperty(field)) {
      continue;
    }
    if (relation.type == 'HAS_MANY') {
      throw new Error('Updating a one to many relationships is not supported. Update the many to one instead');
    } else if (relation.type == 'BELONGS_TO') {
      if (entity.get(field) == data[field]) {
        continue;
      }
      if (entity.get(field)) {
        const to_remove = relation.schema.key() + '/' + entity.get(field) + '/' + relation.inverse_of + '/' + id;
        result[to_remove] = null;
      }
      if (data[field]) {
        const to_add = relation.schema.key() + '/' + data[field] + '/' + relation.inverse_of + '/' + id;
        result[to_add] = true;
      }
    }
  }
  return result;
};
