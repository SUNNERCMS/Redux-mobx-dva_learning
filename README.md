##### tag-v1: 基本的redux使用流程
1、store文件，用来生成store来作为数据仓库

> （1）引入createStore方法,用来生成 Store创建数据存储仓库
（2）createStore函数接受另一个函数作为参数，返回新生成的 Store 对象

- index.js
```js
import { createStore } from 'redux';
import reducer from './reducer.js';

const store = createStore(reducer); 

export default store;  //暴露出去
```
- reducer.js
```js
//默认数据,整个项目中需要管理的数据信息
const defaultState = {
  inputValue : 'Write Something!',
  list:[
      '早上4点起床，锻炼身体',
      '中午下班游泳一小时'
  ]
} 

export default (state = defaultState, action) => {
  return state
}
```
2、建立的组件，在组件中使用store中的数据
> 使用store仓库中的数据，需要先引入，再建立快照
如果想得到某个时点的数据，就要对 Store 生成快照。这种时点的数据集合，就叫做 State。当前时刻的 State，可以通过store.getState()拿到

```js
import React, { Component } from 'react';
import 'antd/dist/antd.css'
import { Input, Button, List } from 'antd'
import store from './store';

//将这里数据放到了仓库中管理
// const data=[
//     '早8点开晨会，分配今天的开发工作',
//     '早9点和项目经理作开发需求讨论会',
//     '晚5:30对今日代码进行review'
// ]

class TodoList extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = store.getState();
    // }

    render() { 
        const {
            inputValue,  
            list
        } = store.getState();
        return ( 
            <div style={{margin:'10px'}}>
                <div>
                    <Input placeholder={inputValue} style={{ width:'250px', marginRight:'10px'}}/>
                    <Button type="primary">增加</Button>
                </div>
                <div style={{margin:'10px',width:'300px'}}>
                    <List
                        bordered
                        dataSource={list}
                        renderItem={item=>(<List.Item>{item}</List.Item>)}
                    />    
                </div>
            </div>
         );
    }
}
export default TodoList;
```