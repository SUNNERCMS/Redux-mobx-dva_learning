#### tag-v1: 基本的redux使用流程
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

#### tag-v2: redux的基本完整流程-todolist示例
在v1版本上增加了，通过dispatch分发action给数据仓库store，改变数据的处理,详细代码及注释见v2。
相关代码如下：
```html
    <Input 
        placeholder={inputValue}
        style={{ width:'250px', marginRight:'10px'}}
        onChange={this.intputOnchange}
    />
```
```js
    // 输入框内容改变事件处理函数，改变之后发生动作，来改变store仓库中数据
    //改变store数据的唯一途径：通过dispatch进行action驱动
    //action为动作说明对象：动作类型+动作数据
    intputOnchange = (e) => {
        const action = {
            type: 'change_input_value',
            value: e.target.value
        };
        store.dispatch(action);
    }

//reducer.js文件
  if(action.type === "change_input_value") {
    //创建仓库数据副本，（记住：Reducer里只能接收state，不能改变state。） 
    let newState = JSON.parse(JSON.stringify(state));
    newState.inputValue = action.value;
    return newState;
  }

// Todolist.js
    //订阅Redux的状态,当状态改变时，执行相应函数
    store.subscribe(this.storeChange);

    //store数据仓库改变时，获取仓库数据，对该组件进行setState触发render渲染
    storeChange = () => {
        this.setState(store.getState());
    }
```

#### tag-v3: redux结构分层（action类型管理文件+action动作管理文件）
-  `actionType.js`文件用来统一管理action的类型，因为之前在reducer和需要dispatch action的地方均需要指明action的类型，并且二者保持一致，不便于管理维护。
- `actionCreators.js`文件，用来创建action对象，可以是函数形式返回一个包含类型和值的对象，用来生成需要的action对象，供dispatch传递给store仓库，来进行数据更新操作。  

相关代码如下：
```js
//统一用来管理action类型

export const CHANGE_INPUT_VALUE= 'change_input_value';
export const ADD_INPUT_VALUE= 'add_input_value';
export const DELETE_ITEM= 'delete_item'
```

```js
import { 
  CHANGE_INPUT_VALUE, 
  ADD_INPUT_VALUE,
  DELETE_ITEM
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

intputOnchange = (e) => {
    const action = changeInputValueAction(e.target.value);
    store.dispatch(action);
}
```

#### tag-v4: Todolist函数式组件拆分+axios请求与redux结合
- TodoList.js：处理业务逻辑，包括交互事件处理，数据请求，分发action等
- TodoListUI.js：函数式组件用来负责渲染界面展示  

axios请求与redux结合过程：  
1、声明axios获取数据更新到store的action类型
```js
export const GET_LIST= 'get_list'
```
2、创建action对象，用于dispatc分发给store
```js
// 将请求获取的列表数据更新到数据仓库
export const getListAction = (data) => ({
  type: GET_LIST,
  data
});
```
3、进行请求并执行分发dispatch，数据mock可以用easy-mock或者用友的yapi
```js
  //获取列表数据
    requestListData = () => {
        axios.get("https://mock.yonyoucloud.com/mock/10365/reactdemo/todolist")
        .then(res => {
            const action = getListAction(res.data.data.list);
            store.dispatch(action);
        });
    }
```

#### tag-v5: redux-thunk与reudx的结合使用
前言：在控制台调试这些仓库里的数据，需要使用Redux DevTools谷歌插件，在创建仓库时，进行判断是否有该插件，有的话就使用。  
```js
const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
```
> 问题：如果按照官方文档来写，直接把thunk放到createStore里的第二个参数就可以了，但以前我们配置了Redux Dev Tools，已经占用了第二个参数。    

官方文档给的方法:  
```js
const store = createStore(
    reducer,
    applyMiddleware(thunk)
) // 创建数据存储仓库
```
这样写是完全没有问题的，但是我们的Redux Dev Tools插件就不能使用了，如果想两个同时使用，需要使用增强函数。使用增加函数前需要先引入compose。

```js
import { createStore , applyMiddleware ,compose } from 'redux'  //  引入createStore方法
import reducer from './reducer'    
import thunk from 'redux-thunk'

const composeEnhancers =   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}):compose

const enhancer = composeEnhancers(applyMiddleware(thunk))

const store = createStore( reducer, enhancer) // 创建数据存储仓库
export default store   //暴露出去
```
(1)利用compose创造一个增强函数，就相当于建立了一个链式函数.(2)有了增强函数后，就可以把thunk加入进来了，这样两个函数就都会执行了。(3)这时候直接在createStore函数中的第二个参数，使用这个enhancer变量就可以了，相当于两个函数都执行了。也许你对增加函数还不能完全理解，其实你完全把这个想成固定代码，直接使用就好.

**redux-thunk与reudx的结合使用过程：**  
1、安装reudx-thunk `npm install --save redux-thunk`  
2、引用redux的applyMiddleware，来在redux中使用中间件 `applyMiddleware(thunk)`,并在创建函数时作为参数项注册，见上文前言。  
3、在Dispatch一个Action之后，到达reducer之前，可以使用中间件来进行日志记录、创建崩溃报告，调用异步接口等。  
4、将在组件执行的接口请求逻辑，转移到actionCreator.js文件中。  

> 以前actionCreators.js都是定义好的action，根本没办法写业务逻辑，
有了Redux-thunk之后，可以把TodoList.js中的componentDidMount业务逻辑放到这里来编写。
也就是把向后台请求数据的代码放到actionCreators.js文件里。
（以前的action是对象，现在的action可以是函数了，这就是redux-thunk带来的好处）

```js
//actionCreator.js
//获取列表数据（需要包含更新动作getListAction）
//这个函数可以直接传递dispatch进去，这是自动的，然后我们直接用dispatch(action)传递就好了
export const getTodoList = () => {
  return (dispatch) => {
    axios.get("https://mock.yonyoucloud.com/mock/10365/reactdemo/todolist")
    .then(res => {
        const action = getListAction(res.data.data.list);
        dispatch(action);
    });
  }
}
```
```js
//TodoList.js
    //获取列表数据
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
```

#### tag-v6: redux-saga与reudx的结合使用

> 安装reudx-saga `npm install --save redux-saga`  

1、在store中引入saga，并注册到创建的store仓库中，运行saga,运行的内容就是创建的saga文件，用来管理业务代码的文件
```js
import { createStore, applyMiddleware, compose } from 'redux'; // 引入createStore方法,用来生成 Store
import reducer from './reducer.js';
import mySagas from './sagas.js';
//引入redux的saga中间件，并创建
import createSageMiddleware from 'redux-saga';
const sagaMiddleware = createSageMiddleware();

//创建增强函数，使得Redux Dev Tools插件和redux-thunk中间件都能使用
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}):compose
const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware))

// 创建数据存储仓库,createStore函数接受另一个函数作为参数，返回新生成的 Store 对象
const store = createStore(reducer, enhancer);

//使用saga中间件来运行引入的mySagas,监听mySagas文件
sagaMiddleware.run(mySagas);

export default store;  //暴露出去
```
2、actionCreators.js文件中，增加用来获取列表动作的action，根据这个action类型到sagas.js文件中去查找真正用来处理业务请求的逻辑

```js
// saga-用来获取列表数据的动作
export const getMyListAction = () => ({
  type: GET_MY_LIST,
});
```
3、sagas.js文件，mySaga函数是入口文件，在store/index中由saga中间件运行 `sagaMiddleware.run(mySagas);`,用来捕获action,并根据类型调用相对应的处理函数
```js
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
  //调用aciont中的getListAction函数生成action，将请求获取的列表数据更新到数据仓库
  const action = getListAction(res.data.data.list);
  yield put(action);
}

export default mySaga
```
4、TodoList.js组件中调用actionCreators.js中的getMyListAction，用来发起获取列表数据的动作

```js
    componentDidMount() {
        const action = getMyListAction();
        store.dispatch(action);
    }
```
**tag-v5:redux-thunk和tag-v6:redux-saga的使用感受：**
*区别主要在于对副作用的管理上*  
（1）redux-thunk使得原本只能是对象的action可以是函数，用来处理一些异步请求的操作，actonCreators.js中既有对象的action，也有函数的action。  
（2）redux-saga可以使用saga中间件运行创建的saga.js文件，将actionCreators.js中函数形式的action（处理异步请求）放到来saga.js文件中，这样看来actionCreators.js中就全部是对象的action，saga.js中根据action的类型专门用来处理业务逻辑，再结合saga使用来ES6的Generator功能，让异步的流程更易于读取，写入和测试，结构也更加清晰
（3）在不引入中间件时，请求的逻辑处理直接放在了组件中，在请求函数中调用了数据更新action的动作。


