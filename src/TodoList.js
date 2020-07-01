import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { Input, Button, List } from 'antd';
import store from './store';
import { 
    changeInputValueAction, 
    addInputValueAction,
    deleteItemAction
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


    render() { 
        const {
            inputValue,  
            list
        } = this.state;
        return ( 
            <div style={{margin:'10px'}}>
                <div>
                    <Input 
                        placeholder={inputValue}
                        style={{ width:'250px', marginRight:'10px'}}
                        onChange={this.intputOnchange}
                    />
                    <Button 
                        type="primary"
                        onClick={this.addInputValue}
                    >
                        增加{inputValue}
                    </Button>
                </div>
                <div style={{margin:'10px',width:'300px'}}>
                    <List
                        bordered
                        dataSource={list}
                        renderItem={
                            (item, index) => (
                                <List.Item onClick={this.deleteItem.bind(this,index)}>{item}</List.Item>
                            )}
                    />    
                </div>
            </div>
         );
    }
}
export default TodoList;