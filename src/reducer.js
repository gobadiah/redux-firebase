import {
  Map,
  fromJS
} from 'immutable';

import {
  ANONYMOUS_VALUE,
  CONNECTED,
  TAKE_SNAPSHOT,
  RESET_ENTITIES,
  DISCONNECTED,
  VALUE
} from './constants';

export default schemas => {
  let initialState = Map({ entities: Map() });
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
      return state.set('connected', true);
    } else if (DISCONNECTED(action.type)) {
      return state.set('connected', false);
    } else if (TAKE_SNAPSHOT(action.type)) {
      if (!state.has('snapshot')) {
        return state.set('snapshot', state.get('entities'));
      }
      return state;
    } else if (RESET_ENTITIES(action.type)) {
      return state.set('entities', initialState.get('entities'));
    }
    return state;
  }
};
