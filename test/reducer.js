import chai, { expect }       from 'chai';
import { schemas, entities }  from './fixtures';
import actions                from '../src/actions';
import createMiddleware       from '../src/middleware';
import createReducer          from '../src/reducer';
chai.config.truncateThreshold = 0;

describe('reducer', () => {
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

  });
});
