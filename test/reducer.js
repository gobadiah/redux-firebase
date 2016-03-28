import { fromJS, Map }  from 'immutable';
import chai, { expect } from 'chai';
import {
  schemas,
  entities,
  ENDPOINT
}  from './fixtures';
import {
  actions,
  sign_in,
  sign_out
}                       from '../src/actions';
import createReducer    from '../src/reducer';
import {
  ANONYMOUS_VALUE_TYPE,
  CONNECTED_TYPE,
  DISCONNECTED_TYPE,
  SIGNED_IN_TYPE,
  SIGNED_OUT_TYPE,
  SIGNED_UP_TYPE,
  VALUE_TYPE
} from '../src/constants';
chai.config.truncateThreshold = 0;

describe('reducer', () => {
  const reducer = createReducer(schemas, ENDPOINT);
  const initialState = reducer();
  const entities = {
    users: {
      two: {
        shoes: {
          three: true
        }
      }
    },
    shoes: {
      three: {
        brand: 'Peugeot',
        owner: 'two'
      }
    }
  };
  it('should create an initial state', () => {
    expect(initialState.get('entities').toJS()).to.eql({
      users: {},
      shoes: {}
    });

    expect(initialState.get('firebase').delete('ref').toJS()).to.eql({
      auth: null,
      connected: false,
      connected_once: false,
      signed_up: false
    });
  });

  it('should add a firebase object when not present', () => {
    const new_state = reducer(initialState.delete('firebase'));
    expect(new_state.has('firebase')).to.be.true;
  });

  it('should update entities with VALUE actions', () => {
    const entities = {
      users: {
        two: {
          shoes: {
            three: true
          }
        }
      },
      shoes: {
        three: {
          brand: 'Peugeot',
          owner: 'two'
        }
      }
    };
    const action = {
      type: VALUE_TYPE,
      payload: entities
    };
    const new_state = reducer(initialState, action);
    expect(new_state.get('entities').toJS()).to.eql(entities);
  });

  it('should add default keys when no payload in VALUE', () => {
    const action = {
      type: VALUE_TYPE
    };
    const new_state = reducer(initialState, action);
    expect(new_state.get('entities').toJS()).to.eql({
      users: {},
      shoes: {}
    });
  });

  it('should update entities and delete snapshot', () => {
    const old_state = initialState.set('snapshot', initialState.get('entities'));
    const action = {
      type: VALUE_TYPE,
      payload: entities
    };
    const new_state = reducer(initialState, action);
    expect(new_state.get('entities').toJS()).to.eql(entities);
    expect(new_state.get('snapshot')).to.eql(null);
  });

  it('should update entities with ANONYMOUS_VALUE actions', () => {
    const action = {
      type: ANONYMOUS_VALUE_TYPE,
      payload: {
        'users/one': null,
        'users/two/shoes': { three: true },
        'shoes/a': null,
        'shoes/b': null,
        'shoes/c': null,
        'shoes/three': { brand: 'Peugeot', owner: 'two' },
        'planes/one': true
      }
    };
    const new_state = reducer(initialState, action);
    expect(new_state.get('entities').toJS()).to.eql(Object.assign({}, { planes: { one: true } }, entities));
  });

  it('should set connected to true for CONNECTED actions', () => {
    const action = {
      type: CONNECTED_TYPE
    };
    const new_state = reducer(initialState, action);
    expect(new_state.getIn(['firebase', 'connected'])).to.be.true;
    expect(new_state.getIn(['firebase', 'connected_once'])).to.be.true;
  });

  it('should set connected to false for DISCONNECTED actions', () => {
    const action = {
      type: CONNECTED_TYPE
    };
    let new_state = reducer(initialState, action);
    expect(new_state.getIn(['firebase', 'connected'])).to.be.true;
    expect(new_state.getIn(['firebase', 'connected_once'])).to.be.true;
    const action2 = {
      type: DISCONNECTED_TYPE
    };
    new_state = reducer(new_state, action2);
    expect(new_state.getIn(['firebase', 'connected'])).to.be.false;
    expect(new_state.getIn(['firebase', 'connected_once'])).to.be.true;
  });

  it('should handle SIGNED_OUT', () => {
    const action = {
      type: SIGNED_OUT_TYPE
    };
    let new_state = reducer(initialState, action);
    expect(new_state.getIn(['firebase', 'auth'])).to.be.null;
  });

  it('should handle SIGNED_OUT after signed_in', () => {
    let action = {
      type: SIGNED_IN_TYPE,
      payload: {
        uid: 'my_uid'
      }
    };
    let new_state = reducer(initialState, action);
    expect(new_state.getIn(['firebase', 'auth']).toJS()).to.eql({
      uid: 'my_uid'
    });
    action = {
      type: SIGNED_OUT_TYPE
    };
    new_state = reducer(new_state, action);
    expect(new_state.getIn(['firebase', 'auth'])).to.be.null;
  });

  it('should handle SIGN_IN', () => {
    const action = {
      type: SIGNED_IN_TYPE,
      payload: {
        uid: 'my_uid'
      }
    };
    const new_state = reducer(initialState, action);
    expect(new_state.getIn(['firebase', 'auth']).toJS()).to.eql({
      uid: 'my_uid'
    });
  });

  it('should delete snapshot if authed_in, connected and receiving value', () => {
    let action = {
      type: SIGNED_IN_TYPE,
      payload: {
        uid: 'my_uid'
      }
    };
    let new_state = reducer(initialState.set('snapshot', initialState.get('entities')), action);
    action = {
      type: CONNECTED_TYPE
    };
    new_state = reducer(new_state, action);
    action = {
      type: VALUE_TYPE
    };
    new_state = reducer(new_state, action);
    expect(new_state.get('snapshot')).to.be.null;
  });

  it('should take a snapshot of entities if disconnecting while being authed', () => {
    let action = {
      type: SIGNED_IN_TYPE,
      payload: {
        uid: 'my_uid'
      }
    };
    let new_state = reducer(initialState, action);
    action = {
      type: CONNECTED_TYPE
    };
    new_state = reducer(new_state, action);
    action = {
      type: DISCONNECTED_TYPE
    };
    new_state = reducer(new_state, action);
    expect(new_state.get('snapshot').toJS()).to.eql(initialState.get('entities').toJS());
  });

  it('should do nothing if authed in when uid is already there', () => {
    let action = {
      type: SIGNED_IN_TYPE,
      payload: {
        uid: 'my_uid'
      }
    };
    let new_state = reducer(initialState, action);
    action = {
      type: SIGNED_IN_TYPE,
      payload: {
        uid: 'my_uid'
      }
    };
    new_state = reducer(new_state, action);
    expect(new_state.getIn(['firebase', 'auth']).toJS()).to.eql({
      uid: 'my_uid'
    });
  });

  it('should mark signed_up when .. signed up', () => {
    let action = {
      type: SIGNED_UP_TYPE
    };
    let new_state = reducer(initialState, action);
    expect(new_state.getIn(['firebase', 'signed_up'])).to.be.true;
  });

  it('should return current state if action not handled', () => {
    let action = {
      type: 'UNKNOWN_ACTION'
    };
    let new_state = reducer(initialState, action);
    expect(new_state.toJS()).to.eql(initialState.toJS());
  });
});
