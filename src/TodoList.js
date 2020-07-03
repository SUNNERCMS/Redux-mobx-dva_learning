import React, { Component } from 'react';
import store from './store';
import TodoListUI from './TodoListUI';
import { 
    changeInputValueAction, 
    addInputValueAction,
    deleteItemAction,
    getTodoList
} from './store/actionCreators.js';

class TodoList extends Component {
    constructor(props) {
        super(props);
        //store.getState();获取到数据仓库中的数据对象
        this.state = store.getState();
        //订阅Redux的状态,当状态改变时，执行相应函数
        store.subscribe(this.storeChange);
    }

    // 输入框内容改变事件处理函数，改变之后发生动作，来改变store仓库中数据
    //改变store数据的唯一途径：通过dispatch进行action驱动
    //action为动作说明对象：动作类型+动作数据
    intputOnchange = (e) => {
        const action = changeInputValueAction(e.target.value);
        store.dispatch(action);
    }

    //store数据仓库改变时，获取仓库数据，对该组件进行setState触发render渲染
    storeChange = () => {
        this.setState(store.getState());
    }

    //增加按钮点击事件，触发动作之后根据动作类型在reducer中将input改变的最新值，添加到list中，来驱动列表更新
    addInputValue = () => {
        const action = addInputValueAction();
        store.dispatch(action)
    }

    //删除列表某一项
    deleteItem = (index) => {
        const action = deleteItemAction(index);
        store.dispatch(action)

    }

    // //获取列表数据
    // requestListData = () => {
    //     axios.get("https://mock.yonyoucloud.com/mock/10365/reactdemo/todolist")
    //     .then(res => {
    //         const action = getListAction(res.data.data.list);
    //         store.dispatch(action);
    //     });
    // }

    componentDidMount() {
        // this.requestListData();
        const action = getTodoList();
        //使用redux-thunk,在dispathc分发action到reducer之前，进行了axios请求
        store.dispatch(action);
    }


    render() { 
        const {
            inputValue,  
            list
        } = this.state;
        return <TodoListUI
                    inputValue={inputValue}
                    list={list}
                    intputOnchange={this.intputOnchange}
                    addInputValue={this.addInputValue}
                    deleteItem={this.deleteItem}
                />
    }
}
export default TodoList;