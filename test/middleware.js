import chai, { expect } from 'chai';
import { Map }          from 'immutable';
import createMiddleware from '../src/middleware';
import createReducer    from '../src/reducer';
import {
  entities,
  schemas,
  ENDPOINT
} from './fixtures';
import {
  CONNECTED_TYPE,
  SIGNED_UP_TYPE,
  VALUE_TYPE
} from '../src/constants';
chai.config.truncateThreshold = 0;

describe('middleware', () => {
  let state, store, next, ref, onConnect;
  const reducer       = createReducer(schemas, ENDPOINT);
  const middleware    = createMiddleware(schemas, state => state);
  const initialState  = reducer();

  beforeEach(() => {
    onConnect = sinon.spy();
    ref = {
      set: sinon.spy(),
      on: sinon.spy(),
      onAuth: sinon.spy(),
      root: () => ({ child: () => ({ on: onConnect }) })
    };
    state = initialState.setIn(['firebase', 'ref'], ref);
    store = {
      dispatch: sinon.spy(),
      getState: () => state
    };
    next = sinon.spy();
  });

  it('should place listeners on ref', () => {
    const action = {
      type: 'UNKNOWN_TYPE'
    };
    middleware(store)(next)(action);
    expect(ref.on.calledOnce).to.be.true;
    expect(ref.onAuth.calledOnce).to.be.true;
    expect(onConnect.calledOnce).to.be.true;
  });

  it('should handle new value after sign_up', () => {
    state = state.set('entities', entities);
    let action = {
      type: SIGNED_UP_TYPE
    };
    middleware(store)(next)(action);
    action = {
      type: CONNECTED_TYPE
    };
    middleware(store)(next)(action);
    action = {
      type: VALUE_TYPE,
      payload: {
      }
    };
    middleware(store)(next)(action);
    expect(ref.set.withArgs(entities.toJS()).calledOnce).to.be.true;
  });

  it('should handle when there is a snapshot of the database and VALUE action, NO difference', () => {
    state = state.set('entities', entities)
    .set('snapshot', entities)
    .setIn(['firebase', 'connected'], true);
    let action = {
      type: VALUE_TYPE,
      payload: entities.toJS()
    };
    middleware(store)(next)(action);
    expect(ref.set.called).to.be.false;
    expect(next.calledOnce).to.be.true;
  });

  it('should handle when there is a snapshot of the database and VALUE action, OK difference', () => {
    state = state.set('entities', entities.setIn(['users', 'elf'], Map({ id: 'elf', name: 'Gabrielle' })))
    .set('snapshot', entities)
    .setIn(['firebase', 'connected'], true);
    let action = {
      type: VALUE_TYPE,
      payload: entities.setIn(['users', 'pour'], Map({ id: 'pour', name: 'Alfred' })).toJS()
    };
    middleware(store)(next)(action);
    expect(ref.set.called).to.be.true;
    expect(next.calledOnce).to.be.false;
  });

  it('should handle when there is a snapshot of the database and VALUE action, Conflict', () => {
    state = state.set('entities', entities.setIn(['users', 'elf'], Map({ id: 'elf', name: 'Gabrielle' })))
    .set('snapshot', entities)
    .setIn(['firebase', 'connected'], true);
    let action = {
      type: VALUE_TYPE,
      payload: entities.setIn(['users', 'elf'], Map({ id: 'elf', name: 'Alfred' })).toJS()
    };
    middleware(store)(next)(action);
    expect(ref.set.called).to.be.false;
    expect(next.calledOnce).to.be.true;
  });

  it('should handle when there is a snapshot of the database and VALUE action, OK server empty', () => {
    state = state.set('entities', entities.setIn(['users', 'elf'], Map({ id: 'elf', name: 'Gabrielle' })))
    .set('snapshot', entities)
    .setIn(['firebase', 'connected'], true);
    let action = {
      type: VALUE_TYPE
    };
    middleware(store)(next)(action);
    expect(ref.set.called).to.be.false;
    expect(next.calledOnce).to.be.true;
  });
});
