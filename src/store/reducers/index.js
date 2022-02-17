import { combineReducers } from 'redux'
import countReducer from './countReducer';
import todoListReducer from './todoListReducer';

// combineReducers对象的key值，实际上就是redux store中的namespace空间名
// 相当于是给每个引入的reducer定义了一个名字
const reducer = combineReducers({
    countReducer,
    todoListReducer
})

export default reducer
