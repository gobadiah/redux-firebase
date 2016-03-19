import _          from 'lodash';
import { fromJS } from 'immutable';
import {
  VALUE,
  DISCONNECTED,
  TAKE_SNAPSHOT_TYPE,
  CONNECTED_TYPE,
  RESET_ENTITIES_TYPE,
  DISCONNECTED_TYPE,
  SIGNED_UP,
  SIGNED_IN_TYPE,
  SIGNED_OUT,
  SIGNED_OUT_TYPE,
  VALUE_TYPE
} from './constants';
import diff   from 'immutablediff';
import patch  from 'immutablepatch';

export default schemas => {
  let count = 0;
  const createListeners = (store, ref) => {
    ref.onValueCallback = data => store.dispatch({
      type: VALUE_TYPE,
      payload: data.val()
    });
    ref.on('value', ref.onValueCallback);
    ref.onAuthCallback = userData => {
      if (userData) {
        store.dispatch({
          type: SIGNED_IN_TYPE,
          payload: userData
        });
      } else {
        store.dispatch({
          type: SIGNED_OUT_TYPE
        });
      }
    };
    ref.onAuth(ref.onAuthCallback);
    ref.onConnectedCallback = snap => {
      if (snap.val()) {
        store.dispatch({
          type: CONNECTED_TYPE
        });
      } else {
        store.dispatch({
          type: DISCONNECTED_TYPE
        });
      }
    }
    ref.root().child('.info/connected').on('value', ref.onConnectedCallback);
    count += 1;
  }
  const check = (store, firebase) => {
    if (!firebase.listening) {
      firebase.listening = true;
      createListeners(store, firebase);
    }
  };
  let hasJustSignedUp = false;
  return store => next => action => {
    if (VALUE(action.type) && store.getState().app.get('snapshot') && store.getState().app.get('connected')) {
      const server    = fromJS(action.payload || {});
      const current   = store.getState().app.get('entities');
      const snapshot  = store.getState().app.get('snapshot');
      const diff1 = diff(snapshot, current);
      const diff2 = diff(snapshot, server);
      let final_diff = diff2;
      diff1.forEach(val => {
        const path  = val.get('path');
        console.log('Looking up for path', path);
        let ok = true;
        diff2.forEach(ser => {
          const path_ser = ser.get('path');
          if (path.startsWith(path_ser) || path_ser.startsWith(path)) {
            console.log(' -- CONFLICTS with', path_ser);
            ok = false;
            return false;
          } else {
            console.log(' -- ok', path_ser);
          }
        });
        if (ok) {
          final_diff = final_diff.insert(0, val);
        }
      });
      console.log('Snapshot ... Final', final_diff);
      const final_state = patch(snapshot, final_diff);
      console.log('Final state', final_state.toJS());
      if (diff(server, final_state).count() > 0) {
        store.getState().auth.get('firebase').set(final_state.toJS());
        return;
      }
    } else if (VALUE(action.type) && hasJustSignedUp) {
      const firebase = store.getState().auth.get('firebase');
      hasJustSignedUp = false;
      firebase.set(store.getState().app.get('entities').toJS());
      return;
    } else if (DISCONNECTED(action.type)) {
      if (store.getState().auth.get('auth')) {
        store.dispatch({
          type: TAKE_SNAPSHOT_TYPE
        });
      }
    } else if (SIGNED_OUT(action.type) && store.getState().auth.get('auth')) {
      store.dispatch({
        type: RESET_ENTITIES_TYPE
      });
    } else if (SIGNED_UP(action.type)) {
      hasJustSignedUp = true;
    }
    const result = next(action);
    const firebase = store.getState().auth.get('firebase');
    check(store, firebase);
    return result;
  };
};
