import {
  Map,
  fromJS
} from 'immutable';

import {
  ANONYMOUS_VALUE,
  CONNECTED,
  DISCONNECTED,
  RESET_ENTITIES,
  SIGNED_IN,
  SIGNED_OUT,
  SIGNED_UP,
  TAKE_SNAPSHOT,
  VALUE
} from './constants';

export default (schemas, endpoint) => {
  let initialState = Map({
    entities: Map(),
    firebase: Map({
      auth: null,
      connected: false,
      ref: new Firebase(endpoint),
      signed_up: false,
    }),
    snapshot: null
  });
  for (let key in schemas) {
    initialState = initialState.setIn(['entities', key], Map());
  }
  return (state = initialState, action) => {
    if (!action || !action.type) {
      return state;
    }
    if (VALUE(action.type)) {
      let new_state = state.set('entities', fromJS(action.payload));
      for (let key in schemas) {
        if (!new_state.hasIn(['entities', key])) {
          new_state = new_state.setIn(['entities', key], Map());
        }
      }
      if (state.get('connected')) {
        return new_state.delete('snapshot');
      }
      return new_state;
    } else if (ANONYMOUS_VALUE(action.type)) {
      console.log('Reducer anonymous value', action.payload);
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
      return state.setIn(['firebase', 'connected'], true);
    } else if (DISCONNECTED(action.type)) {
      if (state.getIn(['firebase', 'auth']) && !state.get('snapshot')) {
        state = state.set('snapshot', state.get('entities'));
      }
      return state.set(['firebase', 'connected'], false);
    } else if (SIGNED_OUT(action.type)) {
      if (!state.getIn(['firebase', 'auth'])) {
        return state;
      }
      let ref = state.getIn(['firebase', 'ref']);
      ref.off();
      ref.root().child('.info/connected').off();
      return initialState;
    } else if (SIGNED_IN(action.type)) {
      console.log('Reducer signed_int', state.getIn(['firebase', 'auth']) ? state.getIn(['firebase', 'auth']) : null);
      if (state.get('auth') && state.getIn(['firebase', 'auth', 'uid']) == action.payload.uid) {
        return state;
      }
      let ref = state.getIn(['firebase', 'ref']);
      ref.off();
      ref.root().child('.info/connected').off();
      console.log(action.payload);
      ref = new Firebase(endpoint + '/users/' + action.payload.uid);
      return state.setIn(['firebase', 'auth'], fromJS(action.payload))
                  .setIn(['firebase', 'ref'], ref);
    } else if (SIGNED_UP(action.type)) {
      return state.setIn(['firebase', 'signed_up'], true);
    }
    return state;
  }
};
