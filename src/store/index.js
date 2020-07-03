import { createStore, applyMiddleware, compose } from 'redux'; // 引入createStore方法,用来生成 Store
import reducer from './reducer.js';
import thunk from 'redux-thunk';

//创建增强函数，使得Redux Dev Tools插件和redux-thunk中间件都能使用
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}):compose
const enhancer = composeEnhancers(applyMiddleware(thunk))

// 创建数据存储仓库,createStore函数接受另一个函数作为参数，返回新生成的 Store 对象
const store = createStore(reducer, enhancer);


export default store;  //暴露出去


