import { fromJS }             from 'immutable';
import chai, { expect }       from 'chai';
import { schemas, entities }  from './fixtures';
import createSelectors        from '../src/selectors';
chai.config.truncateThreshold = 0;

describe('selectors', () => {
  it('should create an all selectors', () => {
    const selectors = createSelectors(schemas, entities => entities);
    expect(selectors['users'].all(entities).toJS()).to.eql({
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
    const selectors = createSelectors(schemas, entities => entities);
    expect(selectors['users'].one('one')(entities).toJS()).to.eql({
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

