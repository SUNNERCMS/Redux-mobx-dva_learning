/*
 * @Author: chengxiao01
 * @Date: 2022-01-05 14:14:46
 * @LastEditTime: 2022-01-19 21:25:30
 * @LastEditors: chengxiao01
 * @FilePath: /fe-mall-pc/packages/common/src/utils/model/core.js
 */
import {compose, combineReducers, bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
    forOwn,
    kebabCase,
    isFunction,
    isString,
    isPlainObject,
    upperFirst,
    isEmpty,
    merge,
    get,
    isUndefined,
} from 'lodash';
import {
    apiReducerFactory,
    apiActionCreatorWithLogFactory,
    itemActionCreatorWithLogFactory,
    routePushActionCreatorWidthLog,
    itemReducerFactory,
    reducerUtil,
    allOptReducerFactory,
    allOptActionCreatorWithLogFactory,
    actionTypeProducer,
    postingReducerFactory,
    isApi,
    defaultReduxMapStateToProps,
    parseItemString,
} from './util';
import {
    API_TYPE_SUFFIX,
} from './config';
import {defaultInjectReducer, hooksHocFactory} from './hoc';

/**
 * 对于reducer进行处理，生成actionType，reducer，actionCreator
 * @param {object} params 需要的参数
 */
const reducerOptHandler = ({
    suffix = 'change',
    customReducer,
    namespace,
    reducerName,
    statePath,
    childState,
    newReducers,
    actionCreators,
    source,
    sendLog,
}) => {
    const target = `${kebabCase(reducerName)}-${kebabCase(suffix)}`;
    console.log('reducerOptHandler-----:', target);
    const actionType = actionTypeProducer(namespace, reducerName, suffix);
    const curSuffixReducer = allOptReducerFactory({
        actionType,
        initialState: childState,
        customReducer,
    });
    merge(newReducers, {
        [statePath]: curSuffixReducer,
    });
    const actionCreatorName = `on${upperFirst(reducerName)}${upperFirst(suffix)}`;
    actionCreators[actionCreatorName] = allOptActionCreatorWithLogFactory({
        actionType,
        source,
        target,
        sendLog,
    });
};

/**
 * 对于reducer中的allOpt进行处理，生成actionType，reducer，actionCreator
 * @param {object} params 需要的参数
 */
const allOptsHandler = ({
    allOpt,
    namespace,
    reducerName,
    statePath,
    childState,
    newReducers,
    actionCreators,
    source,
    sendLog,
}) => {
    forOwn(allOpt, (customReducer, suffix) => {
        reducerOptHandler({
            namespace,
            reducerName,
            customReducer,
            newReducers,
            childState,
            suffix,
            source,
            sendLog,
            actionCreators,
            statePath,
        });
    });
};

/**
 * 对于reducer中的api进行处理，生成actionType，reducer，actionCreator
 * @param {object} param0 需要的参数
 */
const apiHandler = ({
    namespace,
    reducerName,
    statePath,
    reducer,
    childState = null,
    newReducers,
    source,
    request,
    sendLog,
    actionCreators,
    useHooks,
}) => {
    const {
        endpoint,
        normalizer,
        errorNormalizer,
        hasLoading = true,
        getParams,
        dispatchKey = `post${upperFirst(reducerName)}`,
        autoMsg = true,
    } = reducer;
    const apiActionTypes = API_TYPE_SUFFIX.map(suffix => actionTypeProducer(namespace, reducerName, suffix));
    // 兼容旧的api: 'getResponse'
    const apiReducer = get(reducer, 'apiReducer') || get(reducer, 'getResponse');
    const [apiSuccessActionType] = apiActionTypes;
    const hasApi = isApi(endpoint);
    if (hasApi) {
        const newApiReducerMap = apiReducerFactory({
            initialState: childState,
            apiReducer,
            apiSuccessActionType,
        });
        merge(newReducers, {
            [statePath]: newApiReducerMap,
        });
    }
    if (hasLoading) {
        newReducers[`${statePath}IsPosting`] = postingReducerFactory(apiActionTypes);
    }
    const target = kebabCase(reducerName);
    console.log('api-----:', target);
    actionCreators[dispatchKey] = apiActionCreatorWithLogFactory({
        source,
        target,
        endpoint,
        normalizer,
        errorNormalizer,
        getParams,
        request,
        sendLog,
        apiActionTypes,
        autoMsg,
        useHooks,
    });
};

/**
 * 对于reducer中的items，生成actionType，reducer，actionCreator
 * @param {object} param0 需要的参数
 */
const itemsHandler = ({
    items,
    namespace,
    reducerName,
    statePath,
    childState,
    itemDispatchKey,
    newReducers,
    actionCreators,
    source,
    sendLog,
}) => {
    // 想要增加自定义的allOpt操作，必须修改当前子reducer处理机制，以整个statePath数据作为整体，每个action都是对整体的操作，
    forOwn(items, (customReducer, itemString) => {
        // items是字符串数组，可省略操作后缀，设置默认重置item项的reducer
        if (isString(customReducer)) {
            itemString = customReducer;
            customReducer = (_, payload) => payload;
        }
        const {itemName, suffix} = parseItemString(itemString);
        console.log('itemString-----:', itemString, itemName, suffix);

        const itemActionType = actionTypeProducer(namespace, reducerName, itemName, suffix);
        const target = `${kebabCase(itemName)}-${kebabCase(suffix)}`;
        console.log('itemsHandler-----:', target);

        const curSuffixReducer = itemReducerFactory({
            itemActionType,
            itemName,
            initialState: childState,
            customReducer,
        });
        merge(newReducers, {
            [statePath]: curSuffixReducer,
        });
        const customDispatchKey = isFunction(itemDispatchKey)
            ? itemDispatchKey(reducerName, itemName, suffix)
            : `on${upperFirst(reducerName)}${upperFirst(itemName)}${upperFirst(suffix)}`;
        actionCreators[customDispatchKey] = itemActionCreatorWithLogFactory({
            itemActionType,
            customReducer,
            source,
            target,
            sendLog,
        });
    });
};

/**
 * 处理单个reducer，分别处理allOpt，items，api等
 * @param {object} param0 需要的参数
 */
const reducerHandler = ({
    namespace,
    state,
    reducer,
    reducerName,
    newReducers,
    actionCreators,
    source,
    request,
    sendLog,
    useHooks,
}) => {
    if (isPlainObject(reducer)) {
        const {
            initialState,
            statePath = reducerName,
        } = reducer;
        const childState = initialState || get(state, statePath);
        const {
            items = {},
            endpoint,
            itemDispatchKey,
            allOpt = {},
        } = reducer;
        const hasAPi = isApi(endpoint);
        const commonParams = {
            namespace,
            reducerName,
            statePath,
            reducer,
            childState,
            newReducers,
            source,
            sendLog,
            actionCreators,
        };
        if (hasAPi) {
            apiHandler({
                ...commonParams,
                request,
                useHooks,
            });
        }
        if (isPlainObject(childState)) {
            itemsHandler({
                ...commonParams,
                items,
                hasAPi,
                itemDispatchKey,
            });
        }
        if (isPlainObject(allOpt) && !isEmpty(allOpt)) {
            allOptsHandler({
                ...commonParams,
                allOpt,
            });
        }
    }
    else if (isFunction(reducer)) {
        const childState = state[reducerName];
        if (!isUndefined(childState)) {
            reducerOptHandler({
                namespace,
                reducerName,
                customReducer: reducer,
                statePath: reducerName,
                newReducers,
                childState,
                source,
                sendLog,
                actionCreators,
            });
        }
        else {
            newReducers[reducerName] = reducer;
        }
    }
};

/**
 * reducers处理函数
 * @param {object} 请求方法，埋点方法等
 * @returns {object} reducer 和 原子actionCreators
 */
const reducersHandler = ({
    request,
    options,
    sendLog,
    updateRoute,
    useHooks,
}) => {
    const {
        namespace,
        state,
        reducers,
        hasPush = false,
    } = options;
    const actionCreators = {};
    const newReducers = {};
    // 兼容旧的api
    const source = options.source || options.log;
    if (isPlainObject(reducers)) {
        forOwn(reducers, (reducer, reducerName) => {
            reducerHandler({
                namespace,
                state,
                reducerName,
                reducer,
                newReducers,
                actionCreators,
                source,
                request,
                sendLog,
                useHooks,
            });
        });
        forOwn(newReducers, (handlers, statePath) => {
            // 合并reducer
            if (isPlainObject(handlers)) {
                // 不能用||
                newReducers[statePath] = reducerUtil(get(state, statePath, null), handlers);
            }
        });
    }
    if (hasPush) {
        actionCreators.push = routePushActionCreatorWidthLog({
            source,
            updateRoute,
        });
    }
    const reducer = isEmpty(newReducers) ? null : combineReducers(newReducers);
    return {
        reducer,
        actionCreators,
    };
};


/**
 * model工厂函数
 * @param {function} param.injectReducer 动态注入reducer的高阶组件
 * @param {function} param.updateRoute 更新路由的方法
 * @param {function} param.request 请求函数，默认使用fetch
 * @param {function} param.sendLog 发送埋点方法
 * @returns {object} 返回{hoc、reducers，mapDispatchToProps}
 */
const modelFactory = ({
    injectReducer = defaultInjectReducer,
    updateRoute,
    request,
    sendLog,
}) => options => {
    const {
        namespace,
        mapStateToProps = defaultReduxMapStateToProps(namespace),
        mapDispatchToProps = {},
        useHooks = false,
    } = options;
    const {reducer, actionCreators} = reducersHandler({
        request,
        sendLog,
        updateRoute,
        options,
        useHooks,
    });
    const finMapDispatchToProps = {
        ...mapDispatchToProps,
        ...actionCreators,
    };
    let hoc = null;
    if (useHooks) {
        hoc = hooksHocFactory(reducer, options.state, finMapDispatchToProps);
        return {hoc};
    }
    const withConnect = connect(mapStateToProps, dispatch => {
        return bindActionCreators(finMapDispatchToProps, dispatch);
    });
    // 有namespace的hoc处理，需要compose withReducer
    if (namespace && isString(namespace) && reducer) {
        const withReducer = injectReducer({key: namespace, reducer});
        hoc = compose(
            withReducer,
            withConnect
        );
    }
    else {
        hoc = withConnect;
    }
    return {
        hoc,
        reducer,
        mapDispatchToProps: finMapDispatchToProps,
    };
};

export default modelFactory;

