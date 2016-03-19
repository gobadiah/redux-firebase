import { fromJS } from 'immutable';

import {
  CREATE_TYPE,
  CREATE_FAILURE,
  UPDATE_TYPE,
  SIGNED_UP_TYPE,
  ANONYMOUS_VALUE_TYPE,
  DESTROY_TYPE,
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

export default (schemas, toEntities, toFirebase = state => state.auth.get('firebase')) => {
  const result = {};
  const isAuthed = state => !!state.auth.get('auth');
  const update_generic = payload => (dispatch, getState) => {
    console.log('update_generic =', payload);
    if (isAuthed(getState())) {
      toFirebase(getState()).update(payload)
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
      const ref     = toFirebase(getState()).child(key).push();
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
        toFirebase(getState()).update(payload)
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
      const to_destroy = _destroy(schemas, toEntities(getState()), key, id);
      const ref        = toFirebase(getState());
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
      const payload = _update(schemas, toEntities(getState()), key, data);
      console.log('data is', data);
      const final_payload = {};
      for (let key in payload) {
        const value = payload[key];
        const path = key.split('/');
        // final_payload[key] = Object.assign({}, getState().app.getIn(['entities', ...path]).toJS(), value);
        final_payload[key] = getState().app.getIn(['entities', ...path]).mergeDeep(fromJS(value)).toJS();
        console.log('value is', value);
        console.log('then ', final_payload[key]);
      }
      console.log('update payload =', payload);
      console.log('final  payload =', final_payload);
      if (isAuthed(getState())) {
        toFirebase(getState()).update(final_payload)
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
          payload
        });
      }
    };

    Object.assign(result, { [key]: { create, update, destroy } });
  }
  return result;
}
