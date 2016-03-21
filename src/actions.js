import { fromJS } from 'immutable';

import {
  CREATE_TYPE,
  CREATE_FAILURE,
  UPDATE_TYPE,
  SIGNED_UP_TYPE,
  ANONYMOUS_VALUE_TYPE,
  DESTROY_TYPE,
  toRef
} from './constants';

import _destroy from './destroy';
import _update  from './update';

export const sign_out = () => (dispatch, getState) => {
  getState().auth.get('firebase').unauth();
};

export const sign_up = args => (dispatch, getState) => {
  const firebase = getState().auth.get('firebase');
  return firebase.createUser(args)
  .then(() => {
    dispatch({
      type: SIGNED_UP_TYPE
    });
    return firebase.authWithPassword(args);
  });
};

export const sign_in = args => (dispatch, getState) => {
  const firebase = getState().auth.get('firebase');
  return firebase.authWithPassword(args);
};

export default (schemas, toState) => {
  const result = {};
  const isAuthed = state => !!toState(state).getIn(['firebase', 'auth']);
  const update_generic = payload => (dispatch, getState) => {
    if (isAuthed(getState())) {
      toRef(toState(getState())).update(payload)
      .catch(error => dispatch({
        type: 'FAILURE',
        payload: error,
        error: true
      }));
    } else {
      dispatch({
        type: ANONYMOUS_VALUE_TYPE,
        payload
      });
    }
  };
  result['update_generic'] = update_generic;
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
      if (isAuthed(getState())) {
        toRef(toState(getState())).update(payload)
        .catch(error => dispatch({
          type: CREATE_FAILURE(key),
          payload: error,
          error: true,
          meta: {
            key
          }
        }));
      } else {
        dispatch({
          type: ANONYMOUS_VALUE_TYPE,
          payload
        });
      }
    };

    const destroy = (id) => (dispatch, getState) => {
      const to_destroy = _destroy(schemas, toState(getState()).get('entities'), key, id);
      const ref        = toRef(toState(getState()));
      const payload    = {};
      for (let path of to_destroy) {
        payload[path]  = null;
      }
      if (isAuthed(getState())) {
        ref.update(payload)
        .catch(error => dispatch({
          type: DESTROY_FAILURE(key),
          payload: error,
          meta: {
            key
          }
        }));
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
        final_payload[key] = toState(getState()).getIn(['entities', ...path]).mergeDeep(fromJS(value)).toJS();
        console.log(final_payload[key]);
        console.log(toState(getState()).getIn(['entities', ...path]));
        console.log(value);
      }
      if (isAuthed(getState())) {
        toRef(toState(getState())).update(final_payload)
        .catch(error => dispatch({
          type: UPDATE_FAILURE(key),
          payload: error,
          error: true,
          meta: {
            key
          }
        }));
      } else {
        dispatch({
          type: ANONYMOUS_VALUE_TYPE,
          payload: final_payload
        });
      }
    };

    Object.assign(result, { [key]: { create, update, destroy } });
  }
  return result;
}
