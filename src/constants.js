import _ from 'lodash';
_.mixin(require('lodash-inflection'));

const PREFIX = '@APP/REDUX_FIREBASE/';
const actionType = (key, action) => PREFIX + _.singularize(key).toUpperCase() + '/' + action;
const actions = ['CREATE', 'CREATE_FAILURE', 'UPDATE', 'UPDATE_FAILURE', 'DESTROY', 'DESTROY_FAILURE', 'CHILD_ADDED', 'CHILD_CHANGED', 'CHILD_REMOVED'];
const module = {};
for (let action of actions) {
  const re = new RegExp(PREFIX + '.*/' + action + '$');
  module[action] =  s => re.test(s);
  module[action + '_TYPE'] = key => actionType(key, action);
}
export const CREATE             = module['CREATE'];
export const CREATE_TYPE        = module['CREATE_TYPE'];
export const CREATE_FAILURE     = module['CREATE_FAILURE']
export const UPDATE             = module['UPDATE'];
export const UPDATE_TYPE        = module['UPDATE_TYPE'];
export const UPDATE_FAILURE     = module['UPDATE_FAILURE'];
export const DESTROY            = module['DESTROY'];
export const DESTROY_TYPE       = module['DESTROY_TYPE'];
export const DESTROY_FAILURE    = module['DESTROY_FAILURE'];
export const CHILD_ADDED        = module['CHILD_ADDED'];
export const CHILD_ADDED_TYPE   = module['CHILD_ADDED_TYPE'];
export const CHILD_CHANGED      = module['CHILD_CHANGED'];
export const CHILD_CHANGED_TYPE = module['CHILD_CHANGED_TYPE'];
export const CHILD_REMOVED      = module['CHILD_REMOVED'];
export const CHILD_REMOVED_TYPE = module['CHILD_REMOVED_TYPE'];

export const VALUE_TYPE = PREFIX + 'VALUE';
export const VALUE = s => s == VALUE_TYPE;
export const ANONYMOUS_VALUE_TYPE = PREFIX + 'ANONYMOUS_VALUE';
export const ANONYMOUS_VALUE = s => s == ANONYMOUS_VALUE_TYPE;

export const SIGNED_UP_TYPE = PREFIX + 'AUTH/SIGNED_UP';
export const SIGNED_UP = s => s == SIGNED_UP_TYPE;

export const SIGNED_IN_TYPE = PREFIX + 'AUTH/SIGNED_IN';
export const SIGNED_IN = s => s == SIGNED_IN_TYPE;

export const SIGNED_OUT_TYPE = PREFIX + 'AUTH/SIGNED_OUT';
export const SIGNED_OUT = s => s == SIGNED_OUT_TYPE;

export const CONNECTED_TYPE = PREFIX + 'CONNECTED';
export const CONNECTED = s => s == CONNECTED_TYPE;

export const DISCONNECTED_TYPE = PREFIX + 'DISCONNECTED';
export const DISCONNECTED = s => s == DISCONNECTED_TYPE;

export const toRef = state => state.getIn(['firebase', 'ref']);
