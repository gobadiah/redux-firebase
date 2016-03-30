import { fromJS } from 'immutable';

import {
  SIGNED_UP_TYPE,
  ANONYMOUS_VALUE_TYPE,
  toRef
} from './constants';

import _destroy from './destroy';
import _update  from './update';

export default (schemas, toState) => {
  const result = {
    crud: {}
  };

  const sign_out = () => (dispatch, getState) => {
    toRef(toState(getState())).unauth();
  };
  result.sign_out = sign_out;

  const sign_up = args => (dispatch, getState) => {
    const firebase = toRef(toState(getState()));
    return firebase.createUser(args)
    .then(() => {
      dispatch({
        type: SIGNED_UP_TYPE
      });
      return firebase.authWithPassword(args);
    });
  };
  result.sign_up = sign_up;

  const sign_in = args => (dispatch, getState) => {
    const firebase = toRef(toState(getState()));
    return firebase.authWithPassword(args);
  };
  result.sign_in = sign_in;

  const isAuthed = state => !!toState(state).getIn(['firebase', 'auth']);
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
    let create = (data) => (dispatch, getState) => {
      const payload = {};
      const ref     = toRef(toState(getState())).child(key).push();
      payload[key + '/' + ref.key()] = Object.assign({}, base_object, data, { id: ref.key() });
      for (let field in schema.relationships()) {
        let relation = schema.relation(field);
        if (relation.type == 'BELONGS_TO') {
          if (data.hasOwnProperty(field) && data[field]) {
            payload[relation.schema.key() + '/' + data[field] + '/' + relation.inverse_of + '/' + ref.key()] = true;
          }
        }
      }
      if (isAuthed(getState()) && toState(getState()).getIn(['firebase', 'connected_once'])) {
        toRef(toState(getState())).update(payload);
      } else {
        dispatch({
          type: ANONYMOUS_VALUE_TYPE,
          payload
        });
      }
    };

    const destroy = id => (dispatch, getState) => {
      const payload = _destroy(schemas, toState(getState()).get('entities'), key, id);
      const ref     = toRef(toState(getState()));
      if (isAuthed(getState()) && toState(getState()).getIn(['firebase', 'connected_once'])) {
        ref.update(payload);
      } else {
        dispatch({
          type: ANONYMOUS_VALUE_TYPE,
          payload
        });
      }
    };

    const update = (data) => (dispatch, getState) => {
      const payload = _update(schemas, toState(getState()).get('entities'), key, data);
      const final_payload = {};
      for (let key in payload) {
        const value = payload[key];
        const path = key.split('/');
        try {
          final_payload[key] = toState(getState()).getIn(['entities', ...path]).mergeDeep(fromJS(value)).toJS();
        } catch (error) {
          final_payload[key] = value;
        }
      }
      if (isAuthed(getState()) && toState(getState()).getIn(['firebase', 'connected_once'])) {
        toRef(toState(getState())).update(final_payload);
      } else {
        dispatch({
          type: ANONYMOUS_VALUE_TYPE,
          payload: final_payload
        });
      }
    };

    Object.assign(result.crud, { [key]: { create, update, destroy } });
  }
  return result;
}
