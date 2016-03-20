import { fromJS, Map }        from 'immutable';
import chai, { expect }       from 'chai';
import { schemas, entities }  from './fixtures';
import actions                from '../src/actions';
import createMiddleware       from '../src/middleware';
import createReducer          from '../src/reducer';
import {
  ANONYMOUS_VALUE_TYPE,
  CONNECTED_TYPE,
  DISCONNECTED_TYPE,
  RESET_ENTITIES_TYPE,
  TAKE_SNAPSHOT_TYPE,
  VALUE_TYPE
} from '../src/constants';
chai.config.truncateThreshold = 0;

describe('reducer', () => {
  const state = Map({
    entities
  });

  it('should create a reducer', () => {
    const reducer = createReducer(schemas);
    expect(reducer().toJS()).to.eql({
      entities: {
        users: {
        },
        shoes: {
        }
      }
    });
  });

  it('should handle value actions', () => {
    const reducer = createReducer(schemas);
    const action  = {
      type: VALUE_TYPE,
      payload: {
        users: {
          one: {
            name: 'Thomas'
          }
        }
      }
    };
    const new_state = reducer(state, action);
    expect(new_state.get('entities').toJS()).to.eql({
      users: {
        one: {
          name: 'Thomas'
        }
      },
      shoes: {
      }
    });
  });

  it('should handle anonymous value actions', () => {
    const reducer = createReducer(schemas);
    const action  = {
      type: ANONYMOUS_VALUE_TYPE,
      payload: {
        'users/one': {
          name: 'Barney',
          shoes: {
            a: true,
            b: true
          }
        }
      }
    };
    const new_state = reducer(state, action);
    expect(new_state.get('entities').toJS()).to.eql({
      users: {
        one: {
          name: 'Barney',
          shoes: {
            a: true,
            b: true
          }
        },
        two: {
          shoes: {
            c: true
          },
          name: 'Alfred'
        }
      },
      shoes: {
        a: {
          brand: 'Puma',
          owner: 'one'
        },
        b: {
          brand: 'Tennis',
          owner: 'one'
        },
        c: {
          brand: 'Basket',
          owner: 'two'
        }
      }
    });
  });

  it('should respond to CONNECTED actions', () => {
    const reducer = createReducer(schemas);
    const action  = {
      type: CONNECTED_TYPE
    };
    const new_state = reducer(state, action);
    expect(new_state.get('connected')).to.eql(true);
  });

  it('should respond to DISCONNECTED actions', () => {
    const reducer = createReducer(schemas);
    const action  = {
      type: DISCONNECTED_TYPE
    };
    const new_state = reducer(state, action);
    expect(new_state.get('connected')).to.eql(false);
  });

  it('should respond to TAKE_SNAPSHOT actions', () => {
    const reducer = createReducer(schemas);
    let action    = {
      type: TAKE_SNAPSHOT_TYPE
    };
    let new_state = reducer(state, action);
    expect(new_state.get('snapshot')).to.eql(state.get('entities'));
    action  = {
      type: ANONYMOUS_VALUE_TYPE,
      payload: {
        'users/one': {
          name: 'Barney',
          shoes: {
            a: true,
            b: true
          }
        }
      }
    };
    new_state = reducer(state, action);
    action  = {
      type: TAKE_SNAPSHOT_TYPE
    };
    new_state = reducer(state, action);
    expect(new_state.get('snapshot')).to.eql(state.get('entities'));
  });

  it('should respond to RESET_ENTITIES actions', () => {
    const reducer = createReducer(schemas);
    let action    = {
      type: CONNECTED_TYPE
    };
    let new_state = reducer(state, action);
    action  = {
      type: RESET_ENTITIES_TYPE,
    };
    new_state = reducer(state, action);
    expect(new_state.get('entities').toJS()).to.eql({
      users: {},
      shoes: {}
    });
  });
});
