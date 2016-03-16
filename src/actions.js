import { actionType, prefixes } from './constants';

export default (schemas) => {
  const result = {};
  for (let key in schemas) {
    let schema = schemas[key];
    const base_object = {};
    for (let subkey in schema.relationships()) {
      let relation = schema.relation(subkey);
      if (relation.type == 'BELONGS_TO') {
        Object.assign(base_object, { [relation.field]: null });
      } else if (relation.type == 'HAS_MANY') {
        Object.assign(base_object, { [relation.field]: {} });
      }
    }
    let create = (data) => {
      const action = {
        type: actionType(prefixes['CREATE_PREFIX'], key),
        payload: Object.assign({}, base_object, data),
        meta: {
          key
        }
      };
      return action;
    };

    const destroy = (id) => {
      const action = {
        type: actionType(prefixes['DESTROY_PREFIX'], key),
        payload: id,
        meta: {
          key
        }
      };
      return action;
    };

    const update = (data) => {
      const action = {
        type: actionType(prefixes['UPDATE_PREFIX'], key),
        payload: data,
        meta: {
          key
        }
      };
      return action;
    };

    Object.assign(result, { [key]: { create, update, destroy } });
  }
  return result;
}

