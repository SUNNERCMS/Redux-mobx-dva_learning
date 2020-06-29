import { createStore } from 'redux'; // 引入createStore方法,用来生成 Store
import reducer from './reducer.js';

const store = createStore(reducer); // 创建数据存储仓库,createStore函数接受另一个函数作为参数，返回新生成的 Store 对象



export default store;  //暴露出去
