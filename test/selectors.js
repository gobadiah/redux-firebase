import { Map, fromJS }        from 'immutable';
import chai, { expect }       from 'chai';
import { schemas, entities }  from './fixtures';
import createSelectors        from '../src/selectors';
chai.config.truncateThreshold = 0;

describe('selectors', () => {
  const state = Map({
    entities
  });
  it('should create an all selectors', () => {
    const selectors = createSelectors(schemas, state => state);
    expect(selectors['users'].all(state).toJS()).to.eql({
      one: {
        shoes: {
          a: {
            brand: 'Puma',
            owner: 'one'
          },
          b: {
            brand: 'Tennis',
            owner: 'one'
          }
        }
      },
      two: {
        shoes: {
          c: {
            brand: 'Basket',
            owner: 'two'
          }
        },
        name: 'Alfred'
      }
    });
  });

  it('should create a on selector', () => {
    const selectors = createSelectors(schemas, state => state);
    expect(selectors['users'].one('one')(state).toJS()).to.eql({
      shoes: {
        a: {
          brand: 'Puma',
          owner: 'one'
        },
        b: {
          brand: 'Tennis',
          owner: 'one'
        }
      }
    });
  });
});

