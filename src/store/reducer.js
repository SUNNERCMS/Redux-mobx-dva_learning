import { 
  CHANGE_INPUT_VALUE, 
  ADD_INPUT_VALUE,
  DELETE_ITEM
} from './actionType.js';

//默认数据,整个项目中需要管理的数据信息
const defaultState = {
  inputValue : 'Write Something!',
  list:[
      '早上4点起床，锻炼身体',
      '中午下班游泳一小时'
  ]
} 

// state: 指的是原始仓库里的状态。
// action: 指的是action新传递的状态



export default (state = defaultState, action) => {
  if(action.type === CHANGE_INPUT_VALUE) {
    //创建仓库数据副本，（记住：Reducer里只能接收state，不能改变state。） 
    let newState = JSON.parse(JSON.stringify(state));
    newState.inputValue = action.value;
    return newState;
  }
  if(action.type === ADD_INPUT_VALUE) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.list.push(newState.inputValue);
    newState.inputValue = '';
    return newState;
  }
  if(action.type === DELETE_ITEM) {
    let newState = JSON.parse(JSON.stringify(state));
    newState.list.splice(action.index, 1);
    newState.inputValue = '';
    return newState;
  }
  return state
}



