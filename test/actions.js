import chai, { expect } from 'chai';
import { Map }          from 'immutable';
import {
  schemas,
  entities,
  ENDPOINT
}  from './fixtures';
import createActions    from '../src/actions';
import createReducer    from '../src/reducer';
import {
  ANONYMOUS_VALUE_TYPE,
  CONNECTED_TYPE,
  SIGNED_IN_TYPE,
  SIGNED_UP_TYPE
} from '../src/constants';
chai.config.truncateThreshold = 0;

describe('actions', () => {
  const reducer = createReducer(schemas, ENDPOINT);
  const initialState = reducer();
  const actions = createActions(schemas, state => state);
  let state;
  beforeEach(() => {
    state = initialState.setIn(['firebase', 'ref'], {
      unauth: sinon.spy(),
      createUser: sinon.stub(),
      authWithPassword: sinon.stub(),
      child: sinon.stub(),
      update: sinon.stub(),
      off: sinon.spy(),
      root: () => ({ child: () => ({ off: sinon.spy() }) })
    });
  });

  describe('sign_out', () => {
    it('should call unauth', () => {
      actions.sign_out()(null, () => state);
      expect(state.getIn(['firebase', 'ref']).unauth.calledOnce).to.be.true;
    });
  });

  describe('sign_up', () => {
    it('should call createUser and dispatch a SIGNED_UP action', done => {
      const dispatch = sinon.spy();
      const createUser = state.getIn(['firebase', 'ref']).createUser;
      const authWithPassword = state.getIn(['firebase', 'ref']).authWithPassword;
      const args = {
        email: 'testing@buildmyapp.com',
        password: 'my_password'
      };
      createUser.withArgs(args).returns(new Promise((resolve, reject) => resolve()));
      authWithPassword.withArgs(args).returns(new Promise((resolve, reject) => resolve()));
      actions.sign_up(args)(dispatch, () => state)
      .then(() => {
        expect(dispatch.withArgs({
          type: SIGNED_UP_TYPE
        }).calledOnce).to.be.true;
        expect(createUser.withArgs(args).calledOnce).to.be.true;
        expect(authWithPassword.withArgs(args).calledOnce).to.be.true;
        done();
      });
    });
  });

  describe('sign_in', () => {
    it('should call authWithPassword', () => {
      const args = {
        email: 'testing@buildmyapp.com',
        password: 'my_password'
      };
      actions.sign_in(args)(null, () => state);
      expect(state.getIn(['firebase', 'ref']).authWithPassword.calledOnce).to.be.true;
    });
  });

  describe('create action', () => {
    it('should be created', () => {
      let { create } = actions.crud.users;
      let data = {
        name: 'Arnaud'
      };
      const push = sinon.stub().returns({ key: () => 1 });
      state.getIn(['firebase', 'ref']).child.returns({ push });
      const dispatch = sinon.spy();
      create(data)(dispatch, () => state);
      expect(push.calledOnce).to.be.true;
      expect(dispatch.withArgs({
        type: ANONYMOUS_VALUE_TYPE,
        payload: {
          'users/1': Object.assign({}, { id: 1, shoes: {} }, data)
        }
      }).calledOnce).to.be.true;
    });

    it('should be created with authed', () => {
      let data = {
        name: 'Arnaud'
      };
      let { create } = actions.crud.users;
      let payload = {
        uid: 'my_uid'
      };
      state = state.setIn(['firebase', 'auth'], payload);
      let action = {
        type: CONNECTED_TYPE
      };
      state = reducer(state, action);
      const push = sinon.stub().returns({ key: () => 1 });
      const update = state.getIn(['firebase', 'ref']).update;
      state.getIn(['firebase', 'ref']).child.returns({ push });
      const dispatch = sinon.spy();
      create(data)(dispatch, () => state);
      expect(push.calledOnce).to.be.true;
      expect(update.calledOnce).to.be.true;
    });
  });

  describe('update', () => {
    it('should be created', () => {
      state = state.setIn('entities', entities);
      let { update } = actions.crud.users;
      let data = {
        id: 'one',
        name: 'Bertrand'
      };
      const dispatch = sinon.spy();
      update(data)(dispatch, () => state);
      expect(dispatch.withArgs({
        type: ANONYMOUS_VALUE_TYPE,
        payload: {
          'users/one': {
            id: 'one',
            name: 'Bertrand'
          }
        }
      }).calledOnce).to.be.true;
    });

    it('should be created when authed', () => {
      state = state.set('entities', entities)
      .setIn(['firebase', 'connected'], true)
      .setIn(['firebase', 'connected_once'], true)
      .setIn(['firebase', 'auth'], Map({ uid: 'my_uid' }));
      let { update } = actions.crud.users;
      let data = {
        id: 'one',
        name: 'Bertrand'
      };
      update(data)(null, () => state);
      const foo = state.getIn(['firebase', 'ref']).update;
      expect(foo.withArgs({
        'users/one': Object.assign({}, data, { shoes: { a: true, b: true } })
      }).calledOnce).to.be.true;
    });
  });

  describe('destroy', () => {
    it('should be created', () => {
      state = state.set('entities', entities);
      let { destroy } = actions.crud.users;
      const dispatch = sinon.spy();
      destroy('one')(dispatch, () => state);
      expect(dispatch.withArgs({
        type: ANONYMOUS_VALUE_TYPE,
        payload: {
          'users/one': null,
          'shoes/a': null,
          'shoes/b': null
        }
      }).calledOnce).to.be.true;
    });

    it('should be destroyed when authed', () => {
      state = state.set('entities', entities)
      .setIn(['firebase', 'connected'], true)
      .setIn(['firebase', 'connected_once'], true)
      .setIn(['firebase', 'auth'], Map({ uid: 'my_uid' }));
      let { destroy } = actions.crud.users;
      destroy('one')(null, () => state);
      const foo = state.getIn(['firebase', 'ref']).update;
      expect(foo.withArgs({
        'users/one': null,
        'shoes/a': null,
        'shoes/b': null
      }).calledOnce).to.be.true;
    });
  });
});
