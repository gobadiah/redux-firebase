const destroy = (schemas, entities, key, id, result = {}) => {
  const path  = key + '/' + id;
  if (path in result) {
    return result;
  }
  const to_remove = [];
  for (let _path in result) {
    if (_path.startsWith(path)) {
      to_remove.push(_path);
    } else if (path.startsWith(_path)) {
      return result;
    }
  }
  for (let _path of to_remove) {
    delete result[_path];
  }
  result[path] = null;
  const schema = schemas[key];
  const entity = entities.getIn([key, id]);
  for (let field in schema.relationships()) {
    if (!entity.has(field)) {
      continue;
    }
    const relation = schema.relation(field);
    if (relation.type == 'HAS_MANY') {
      if (relation.options.dependent == 'nullify') {
        entity.get(field).forEach((v, id) => {
          const to_add = relation.schema.key() + '/' + id + '/' + relation.inverse_of;
          let add = true;
          for (let _path in result) {
            if (to_add.startsWith(_path)) {
              add = false;
              break;
            }
          }
          if (add) {
            result[to_add] = null;
          }
        });
      } else {
        entity.get(field).forEach((v, id) => destroy(schemas, entities, relation.schema.key(), id, result));
      }
    } else if (relation.type == 'BELONGS_TO') {
      const to_add = relation.schema.key() + '/' + entity.get(field) + '/' + relation.inverse_of + '/' + id;
      let   add = true;
      for (let _path in result) {
        if (to_add.startsWith(_path)) {
          add = false;
          break;
        }
      }
      if (add) {
        result[to_add] = null;
      }
    }
  }
  return result;
};

export default destroy;
