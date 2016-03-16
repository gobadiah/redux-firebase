import { Map }    from 'immutable';

import { regex }  from './constants';

export default schemas => {
  let initialState = Map();
  for (let key in schemas) {
    initialState = initialState.set(key, Map());
  }
  return (state = initialState, action) => {
    if (regex.CREATE_PREFIX.test(action.type)) {
      console.log('Reducer create');
    } else if (regex.UPDATE_PREFIX.test(action.type)) {
      console.log('Reducer update');
    } else if (regex.DESTROY_PREFIX.test(action.type)) {
      console.log('Reducer destroy');
    }
    return state;
  }
};
