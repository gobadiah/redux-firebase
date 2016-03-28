import Firebase from 'firebase';
import {
  Map,
  fromJS
} from 'immutable';

import {
  ANONYMOUS_VALUE,
  CONNECTED,
  DISCONNECTED,
  SIGNED_IN,
  SIGNED_OUT,
  SIGNED_UP,
  VALUE
} from './constants';

export default (schemas, endpoint) => {
  let initialState = Map({
    entities: Map(),
    firebase: Map({
      auth: null,
      connected: false,
      connected_once: false,
      ref: new Firebase(endpoint),
      signed_up: false
    }),
    snapshot: null
  });
  for (let key in schemas) {
    initialState = initialState.setIn(['entities', key], Map());
  }
  return (state = initialState, action) => {
    if (!state.get('firebase')) {
      state = state.set('firebase', initialState.get('firebase'));
    }
    if (!action || !action.type) {
      return state;
    }
    if (VALUE(action.type)) {
      let new_state = state.set('entities', fromJS(action.payload || {}));
      for (let key in schemas) {
        if (!new_state.hasIn(['entities', key])) {
          new_state = new_state.setIn(['entities', key], Map());
        }
      }
      if (state.getIn(['firebase', 'connected'])) {
        return new_state.set('snapshot', null);
      }
      return new_state;
    } else if (ANONYMOUS_VALUE(action.type)) {
      for (let key in action.payload) {
        const path = key.split('/');
        let value = action.payload[key];
        if (value == null) {
          state = state.deleteIn(['entities', ...path]);
        } else if (typeof(value) === 'object') {
          state = state.updateIn(['entities', ...path], () => fromJS(value));
        } else {
          state = state.updateIn(['entities', ...path], () => value);
        }
      }
      return state;
    } else if (CONNECTED(action.type)) {
      return state.setIn(['firebase', 'connected'], true).setIn(['firebase', 'connected_once'], true);
    } else if (DISCONNECTED(action.type)) {
      if (state.getIn(['firebase', 'auth']) && !state.get('snapshot')) {
        state = state.set('snapshot', state.get('entities'));
      }
      return state.setIn(['firebase', 'connected'], false);
    } else if (SIGNED_OUT(action.type)) {
      if (!state.getIn(['firebase', 'auth'])) {
        return state;
      }
      let ref = state.getIn(['firebase', 'ref']);
      ref.off();
      ref.root().child('.info/connected').off();
      return initialState;
    } else if (SIGNED_IN(action.type)) {
      if (state.getIn(['firebase', 'auth']) && state.getIn(['firebase', 'auth', 'uid']) == action.payload.uid) {
        return state;
      }
      let ref = state.getIn(['firebase', 'ref']);
      ref.off();
      ref.root().child('.info/connected').off();
      ref = new Firebase(endpoint + '/users/' + action.payload.uid);
      return state.setIn(['firebase', 'auth'], fromJS(action.payload))
                  .setIn(['firebase', 'ref'], ref);
    } else if (SIGNED_UP(action.type)) {
      return state.setIn(['firebase', 'signed_up'], true);
    }
    return state;
  }
};
