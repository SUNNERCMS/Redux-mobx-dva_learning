import React, { Component } from 'react';
// import store from './store';
import TodoListUI from './TodoListUI';
import { connect } from 'react-redux';
import { 
    changeInputValueAction, 
    addInputValueAction,
    deleteItemAction,
    getMyListAction
} from './store/actionCreators.js';

class TodoList extends Component {

    componentDidMount() {
      this.props.getMyList();
    }

    render() { 
        const {
            inputValue,  
            list,
            intputOnchange,
            addInputValue,
            deleteItem
        } = this.props;
        return <TodoListUI
                  inputValue={inputValue}
                  list={list}
                  intputOnchange={intputOnchange}
                  addInputValue={addInputValue}
                  deleteItem={deleteItem}
                />
    }
}

//映射关系就是把原来的state,（也即是原本通过store.getState()来获取仓库中数据）映射成组件中的props属性
const stateToProps = (state) => {
  return {
    inputValue: state.todoListReducer.inputValue,
    list: state.todoListReducer.list
  }
}
const dispatchToProps = (dispatch) => {
  return {
    // 输入框内容改变事件处理函数，
    intputOnchange(e){
        const action = changeInputValueAction(e.target.value);
        dispatch(action);
    },
    //增加按钮点击事件，触发动作之后根据动作类型在reducer中将input改变的最新值，添加到list中，来驱动列表更新
    addInputValue(){
        const action = addInputValueAction();
        dispatch(action)
    },
    //删除列表某一项
    deleteItem(index){
        const action = deleteItemAction(index);
        dispatch(action)
    },
    //获取列表数据
    getMyList() {
        const action = getMyListAction();
        dispatch(action);
    }
  }
}

export default connect(stateToProps,dispatchToProps)(TodoList);