export default (schemas, toState) => {
  const computeObject = (entities, key, id) => {
    const schema  = schemas[key];
    let object    = entities.getIn([key, id]);
    for (let field in schema.relationships()) {
      const relation = schema.relation(field);
      if (relation.type == 'HAS_MANY' && object.has(field)) {
        object = object.update(field, value => value.map((v, id) => computeObject(entities, relation.schema.key(), id)));
      }
    }
    return object;
  };
  const computeList = (entities, key) => {
    return entities.get(key).map((v, id) => computeObject(entities, key, id));
  };
  let result = {};
  for (let key in schemas) {
    Object.assign(result, { [key]: { all: state => computeList(toState(state).get('entities'), key), one: id => state => computeObject(toState(state).get('entities'), key, id) }});
  }
  return result;
}
