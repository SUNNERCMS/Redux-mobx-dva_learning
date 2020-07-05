//管理业务逻辑
//mySaga来作为入口函数。在入口函数中捕获传递过来的action类型，根据类型不同调用不同的方法。

import { takeEvery, put } from 'redux-saga/effects';
import { GET_MY_LIST } from './actionType';
import { getListAction } from './actionCreators.js';
import axios from 'axios'

function* mySaga() {
  //等待捕获action
  yield takeEvery(GET_MY_LIST, getList);
}

function* getList() {
  const res = yield axios.get("https://mock.yonyoucloud.com/mock/10365/reactdemo/todolist");
  const action = getListAction(res.data.data.list);
  yield put(action);
}

export default mySaga