import React from 'react';
import ReactDOM from 'react-dom';
import TodoList from './TodoList';
import { Provider } from 'react-redux';
import store from './store/index';
import Counter1Wrapper from './example/reduxReUse';
// import {Counter2Wrapper, Counter1Wrapper} from './example/reduxReUse';

//声明一个App组件，然后这个组件用Provider进行包裹。
// <Provider>是一个提供器，只要使用了这个组件，组件里边的其它所有组件都可以使用store了，这也是React-redux的核心组件了
const App = (
  <Provider store = {store}>
    <TodoList/>
    <Counter1Wrapper />
    {/* <Counter2Wrapper /> */}
  </Provider>
)


ReactDOM.render(App, document.getElementById('root'));