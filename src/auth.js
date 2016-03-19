import { Map }  from 'immutable';
import Firebase from 'firebase';

import {
  SIGNED_IN,
  SIGNED_OUT
} from './constants';

export default endpoint => {
  const initialState = Map({
    firebase: new Firebase(endpoint),
    auth: null
  });

  return (state = initialState, action) => {
    if (SIGNED_IN(action.type)) {
      if (state.get('auth')) {
        return state;
      }
      const old = state.get('firebase');
      if (old.onAuthCallback) {
        old.offAuth(old.onAuthCallback);
      }
      if (old.onValueCallback) {
        old.off('value', old.onValueCallback);
      }
      if (old.onConnectedCallback) {
        old.root().child('.info/connected').off('value', old.onConnectedCallback);
      }
      return state.update('firebase', () => new Firebase(endpoint + '/users/' + action.payload.uid))
                  .update('auth',     () => Map(action.payload));
    } else if (SIGNED_OUT(action.type)) {
      if (!state.get('auth')) {
        return state;
      }
      const old = state.get('firebase');
      if (old.onAuthCallback) {
        old.offAuth(old.onAuthCallback);
      }
      if (old.onValueCallback) {
        old.off('value', old.onValueCallback);
      }
      if (old.onConnectedCallback) {
        old.root().child('.info/connected').off('value', old.onConnectedCallback);
      }
      return state.update('firebase', () => new Firebase(endpoint))
                  .update('auth',     () => null);
    }
    return state;
  };
};
