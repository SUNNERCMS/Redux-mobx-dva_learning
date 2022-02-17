import { 
    COUNTER_1_COUNTER_1_COUNT_ADD,
    COUNTER_1_COUNTER_1_COUNT_SUB,
    COUNTER_1_COUNTER_3_COUNT_SUB,
    COUNTER_1_COUNTER_3_COUNT_ADD
  } from '../actionType.js';
  
  //默认数据,整个项目中需要管理的数据信息
  const defaultState = {
    count: 0,
    count3: 0
  } 
  
  
  export default (state = defaultState, action) => {
    if(action.type === COUNTER_1_COUNTER_1_COUNT_ADD) {
      let newState = JSON.parse(JSON.stringify(state));
      newState.count = newState.count + 1;
      return newState;
    }
    if(action.type === COUNTER_1_COUNTER_1_COUNT_SUB) {
      let newState = JSON.parse(JSON.stringify(state));
      newState.count = newState.count - 1;
      return newState;
    }
    if(action.type === COUNTER_1_COUNTER_3_COUNT_ADD) {
      let newState = JSON.parse(JSON.stringify(state));
      newState.count3 = newState.count3 + 1;
      return newState;
    }
    if(action.type === COUNTER_1_COUNTER_3_COUNT_SUB) {
      let newState = JSON.parse(JSON.stringify(state));
      newState.count3 = newState.count3 - 1;
      return newState;
    }
  
  
    return state
  }
  
  
  
  