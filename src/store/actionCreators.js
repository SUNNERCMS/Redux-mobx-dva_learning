// action 生成文件，用来统一管理需要执行的动作action

import { 
  CHANGE_INPUT_VALUE, 
  ADD_INPUT_VALUE,
  DELETE_ITEM,
  GET_LIST,
  GET_MY_LIST,

  COUNTER_1_COUNTER_1_COUNT_ADD,
  COUNTER_1_COUNTER_1_COUNT_SUB,
  COUNTER_1_COUNTER_3_COUNT_SUB,
  COUNTER_1_COUNTER_3_COUNT_ADD
} from './actionType.js';
import axios from 'axios';



// 输入框内容改变处理动作
export const changeInputValueAction = (value) => ({
  type: CHANGE_INPUT_VALUE,
  value
});

// 增加按钮点击处理动作
export const addInputValueAction = () => ({
  type: ADD_INPUT_VALUE
});

// 删除列表某一项处理动作
export const deleteItemAction = (index) => ({
  type: DELETE_ITEM,
  index
});

// 将请求获取的列表数据更新到数据仓库
export const getListAction = (data) => ({
  type: GET_LIST,
  data
});


// saga-用来获取列表数据的动作
export const getMyListAction = () => ({
  type: GET_MY_LIST,
});

/*
以前actionCreators.js都是定义好的action，根本没办法写业务逻辑，
有了Redux-thunk之后，可以把TodoList.js中的componentDidMount业务逻辑放到这里来编写。
也就是把向后台请求数据的代码放到actionCreators.js文件里。
（以前的action是对象，现在的action可以是函数了，这就是redux-thunk带来的好处）
*/

//获取列表数据（需要包含更新动作getListAction）
//这个函数可以直接传递dispatch进去，这是自动的，然后我们直接用dispatch(action)传递就好了
export const getTodoList = () => {
  return (dispatch) => {
    axios.get("https://mock.yonyoucloud.com/mock/10365/reactdemo/todolist")
    .then(res => {
        const action = getListAction(res.data.data.list);
        dispatch(action);
    });
  }
}



// count计算器相关
export const onCounter1CountAdd = (data) => ({
  type: COUNTER_1_COUNTER_1_COUNT_ADD,
  data
});

export const onCounter1CountSub = (data) => ({
  type: COUNTER_1_COUNTER_1_COUNT_SUB,
  data
});

export const onCounter3CountAdd = (data) => ({
  type: COUNTER_1_COUNTER_3_COUNT_ADD,
  data
});

export const onCounter3CountSub = (data) => ({
  type: COUNTER_1_COUNTER_3_COUNT_SUB,
  data
});