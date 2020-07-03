// action 生成文件，用来统一管理需要执行的动作action

import { 
  CHANGE_INPUT_VALUE, 
  ADD_INPUT_VALUE,
  DELETE_ITEM,
  GET_LIST
} from './actionType.js';

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