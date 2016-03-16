import _  from 'lodash';

import { regex } from './constants';

export default schemas => {
  return store => next => action => {
    if (regex.CREATE_PREFIX.test(action.type)) {
      console.log('Middleware create');
    } else if (regex.UPDATE_PREFIX.test(action.type)) {
      console.log('Middleware update');
    } else if (regex.DESTROY_PREFIX.test(action.type)) {
      console.log('Middleware destroy');
    }
    return next(action);
  };
};
