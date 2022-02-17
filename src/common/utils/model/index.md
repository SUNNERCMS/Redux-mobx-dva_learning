# Model

* 数据流规范器，规范、提效
* 支持redux和hooks，对于redux，自动生成actionType， actions， services，mapDispatchToProps，动态注入reducer，
* AOP嵌入埋点逻辑，避免埋点侵入业务

## 背景

reduxNormalizer1.0解决了一下问题：
项目中关于redux流的写法各式各样，新人上手成本较高，不易维护，可读性差；而且通常要维护多个文件，例如actionTypes，actions，services，reduxNormalizer能通过简单的配置自动生成这些对象，一个文件搞定redux流使用更简单

reduxNormalizer2.0主要改变
1. 解耦了埋点、api中间件
2. 支持了hooks方式，并推荐实际场景去使用
3. 解决了redux场景，不同组件间复用性的复用

## 规定state分成三层

* 业务模块：通常对应路由页面(nameSpace)
* 组件模块：对应一个组件/表单(component)
* 组件子项： 对应组件中的每一项子域(itemName)

## 函数参数说明

| 参数               | 说明                       | 类型     | 是否必填 | 默认值                  | 备注                                                                           |
| ------------------ | -------------------------- | -------- | -------- | ----------------------- | ------------------------------------------------------------------------------ |
| nameSpace          | reducer挂载的key值         | string   | 否       | ——                      | 必须全局唯一，相同的namespace会覆盖原有reducer，namespace有值则自动注入reducer |
| state              | initialState               | object   | 否       | ——                      | initialState的一种传入方式                                                     |
| reducers           | 详细参数见下面             | object   | 是       | ——                      | ——                                                                             |
| source/log         | 埋点的source               | string   | 是       | ——                      | ——                                                                             |
| mapStateToProps    | 自定义的mapStateToProps    | function | 否       | 会替换默认的            |
| mapDispatchToProps | 自定义的mapDispatchToProps | object   | 否       | 和自动生成的是merge关系 |
| hasPush            | 是否需要路由push函数       | boolean  | 否       | false                   | 为true时，会给组件生成push函数,                                                |

## 对象类型reducer，需要在state中相同的的key
reducer具体参数

| 参数            | 说明                                        | 类型            | 是否必填 | 默认值                            | 备注                                 |
| --------------- | ------------------------------------------- | --------------- | -------- | --------------------------------- | ------------------------------------ |
| items           | 组件中子域的reducer                         | object          | 否       |
| allOpt          | 组件层数据的处理                            | object          | 否       |
| endpoint        | api接口path                                 | string/function | 否       |                                   | 如果有endpoints 会自动生成aipReducer |
| normalizer      | api的接口相应数据转换函数                   | function        | 否       | noop                              |
| getParams       | api的入参构造函数                           | function        | 否       | noop                              |
| dispatchKey     | api类型的自定义的dispatch名称，默认驼峰命名 | string          | 否       | `${apiType}{key}`                 |                                      |
| itemDispatchKey | 子item自定义的dispatch名称                  | function        | 否       | `${on}${key}${itemName}${suffix}` |                                      |
| autoMsg         | 对于接口自动错误提示                        | Boolean         | 是       |


## 函数类型reducer为自定义reducer

直接在reducer中插入子reducer

## 函数返回值

* 返回reducer，hoc，mapDispatchToProps

    ```js
    {
        hoc: 高阶组件,
        reducer: 生成的reducer
    }
    ```


函数返回的高阶组件会代理组件的所有行为，会自动生成actionCreators，传到的视图组件上，方法名默认是驼峰命名，同时支持自定义


### 用法示例

```
import reduxNormalizer from 'src/common/reduxNormalizer';
import React, {useEffect, memo} from 'react';
import {GET_APP_LIST} from 'src/common/apis';

const source = 'testReduxNor2';
const Main = React.memo(props => {
    const {
        postFormItem,
        onFormItemAppInfoListChange,
        onFormItemSet
    } = props;
    useEffect(() => {
        postFormItem && postFormItem().then(res => {
            console.log(res, 'testReduxNor2: postFormItem');
        });
        onFormItemAppInfoListChange && onFormItemAppInfoListChange([{test: 'aaa'}]);
        onFormItemSet && onFormItemSet({
            appInfoList: [{appId: 5, subAppId: 1, appName: '综合电商'}],
            displayName: '王大爷'
        });
    }, []);
    return <div>Test RduxNormalizer2.0</div>;
});

const reducerName = 'formItem';

export default reduxNormalizer({
    namespace: 'testReduxNor2',
    state: {
        // 表单数据
        [reducerName]: {
            appInfoList: [],
            displayName: ''
        }
    },
    reducers: {
        [reducerName]: {
            endpoint: GET_APP_LIST,
            items: ['appInfoList],
            allOpt: {
                set: (_, payload) => payload
            }
        }
    },
    source
})(Main);

```

## Change Log

2020-08-07 20:05:52

* mixin类型reducer，的normalizer如果未返回某个字段，则request_success Action将不会改变该item的值

2020-08-10 10:56:01

* api类型reducer支持getParams参数
* api类型reducer: normalizer第二个参数传入getState

2020-08-11 17:19:57

* 改变内部遍历逻辑，遍历reducers，支持自定义的reducer混合
* 增加hasRoute参数，如果为true，可绑定push路由跳转公共方法，组件可直接使用

2020-08-19 13:50:36

* 修复set类型Action处理数据问题

2020-08-20 10:36:53

* 修复api请求success的merge问题

2020-09-15 20:28:40

* 增加custom类型reducer

2020-09-18 17:08:39

* 提供生成单个service的方法，供外部组件直接调用

2020-09-22 19:11:30

* 支持传入自定义的dispatchKey
* itemDispatchKey function
* api类型： dispatchKey： string

2020-09-22 21:51:26

* reducer支持custom类型
* initialState支持放入reducer中
* 改进initialState传入方式，支持在reducer中传入，且默认值为{}, 原写法仍旧支持

2020-09-23 20:34:19

* 1.getPrams从action中转移入service中处理
* 2.custom方式支持同一个itemName，不同后缀的reducer同时存在

2020-09-24 11:25:30

* api类型的reducer默认替换整个state，变更为遍历旧的state，然后用response有值的部分merge旧的state；同时支持getResponse函数，可以自定义reducer的处理逻辑；
* reducer增加statePath参数；使不同的接口，可以操作同一块state空间；

2020-12-09 17:30:00
- 无namespace参数情况下，新增actions返回值
- 在新旧redux流中互通action


2021-05-27 22:30:00
- 对应api、custom类型，增加allOpt配置，可以操作整个组件模块的数据；
- 主要改动点：更新custom的items的reducer，不再分子reducer，整个组件模块作为一整个reducer，所有的对item操作都是加上itemName，merge旧的state；



2022-01-17 22:30:00
- 支持useHooks：使用useReducer替代state管理组件内部数据
- 解耦seabed埋点中间件，api中间件
- 返回值中包含，mapDispatchToProps，方便不同组件间复用方法

