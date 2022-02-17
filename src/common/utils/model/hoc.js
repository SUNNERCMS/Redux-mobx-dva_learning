/*
 * @Author: chengxiao01
 * @Date: 2022-01-19 01:32:01
 * @LastEditTime: 2022-01-19 21:19:33
 * @LastEditors: chengxiao01
 * @FilePath: /fe-mall-pc/packages/common/src/utils/model/hoc.js
 */
import React, {useReducer} from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {ReactReduxContext} from 'react-redux';
import {get, mapValues} from 'lodash';

import {Provider} from 'react-redux';

/**
 * 获取useReducer高阶组件工厂函数
 * @param {function} reducer
 * @param {object} initialState
 * @param {object} actionCreators
 * @returns 使用useReducer实现数据管理的高阶组件
 */

export const hooksHocFactory = (reducer, initialState, actionCreators) => WrapperComponent => props => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const newActionProps = mapValues(actionCreators,
        actionCreator => field => actionCreator(field)(dispatch, state)
    );
    return (
        <WrapperComponent
            {...props}
            {...newActionProps}
            {...state}
        >
            {props.children}
        </WrapperComponent>
    );
};

/**
 * 默认的动态注入reducer高阶组件，要求store上实现injectReducer的方法，提供动态注入异步reducer能力
 * @param {object} 要注入的key和reducer
 * @returns 返回动态注入reducer高阶组件
 */
export const defaultInjectReducer = ({key, reducer} = {}) => WrappedComponent => {
    class ReducerInjector extends React.Component {
        static displayName = `withReducer(${WrappedComponent.displayName
            || WrappedComponent.name
            || 'Component'})`;
        constructor(props, context) {
            super(props, context);
            const injectReducer = get(context, 'store.injectReducer');
            key && injectReducer && injectReducer(key, reducer);
        }
        static WrappedComponent = WrappedComponent;
        static contextType = ReactReduxContext;
        render() {
            return <WrappedComponent {...this.props} />;
        }
    }
    return hoistNonReactStatics(ReducerInjector, WrappedComponent);
};


/**
 * 默认的动态注入reducer高阶组件，要求store上实现injectReducer的方法，提供动态注入异步reducer能力
 * @param {object} 要注入的key和reducer
 * @returns 返回动态注入reducer高阶组件
 */
export const withProvider = WrappedComponent => props => {
    const {store, ...otherProps} = props;
    return (
        <Provider store={store}>
            <WrappedComponent {...otherProps}/>
        </Provider>
    );
};