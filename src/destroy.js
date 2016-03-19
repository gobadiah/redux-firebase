const destroy = (schemas, entities, key, id, result = []) => {
  const path  = key + '/' + id;
  if (result.indexOf(path) >= 0) {
    return result;
  }
  result.push(path);
  const schema = schemas[key];
  const entity = entities.getIn([key, id]);
  for (let field in schema.relationships()) {
    if (!entity.has(field)) {
      continue;
    }
    const relation = schema.relation(field);
    if (relation.type == 'HAS_MANY') {
      entity.get(field).forEach((v, id) => destroy(schemas, entities, relation.schema.key(), id, result));
    } else if (relation.type == 'BELONGS_TO') {
      result.push(relation.schema.key() + '/' + entity.get(field) + '/' + relation.inverse_of + '/' + id);
    }
  }
  return result;
};

export default destroy;
