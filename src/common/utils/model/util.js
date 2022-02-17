/**
 * @file: redux流规范化，简化，提效
 * @Author: chengxiao01
 * @Date: 2020-08-03 20:29:52
 * @Last Modified by: chengxiao01
 * @Last Modified time: yyyy-09-dd 20:03:31
 * */

import {
    snakeCase,
    isFunction,
    has,
    words,
    lowerCase,
    mapValues,
    isString,
} from 'lodash';
import {push} from 'connected-react-router';
import {BT_EVENT_MAX_LENTH, FETCH_RESULT_TYPE, ITEM_ACTION_TYPE_MAP, ACTION_SPLIT_SIGN} from './config';

export const actionTypeProducer = (...args) => {
    return args.filter(arg => !!arg).map(arg => snakeCase(arg).toUpperCase()).join('_');
};

// 合并多个reducer的工具
export const reducerUtil = (initialState, handlers) => {
    return (state = initialState, action) => {
        if (has(handlers, action.type)) {
            const childReducer = handlers[action.type];
            if (isFunction(childReducer)) {
                return childReducer(state, action);
            }
        }
        return state;
    };
};

// allOpt的reducer工厂
export const allOptReducerFactory = ({
    actionType,
    initialState,
    customReducer,
}) => ({
    [actionType]: (state = initialState, action = {}) => {
        const {payload} = action;
        return customReducer(state, payload); ;
    },
});


// 单个item的reducer工厂
export const itemReducerFactory = ({
    itemActionType,
    itemName,
    initialState,
    customReducer,
}) => ({
    [itemActionType]: (state = initialState, actions = {}) => {
        const {payload} = actions;
        const childFieldValue = customReducer(state[itemName], payload);
        const newState = {
            ...state,
            [itemName]: childFieldValue,
        };
        return newState;
    },
});

// 默认api reducer
export const defaultApiReducer = res => res || null;

// 请求的reducer工厂
export const apiReducerFactory = ({
    initialState = '',
    apiReducer,
    apiSuccessActionType,
}) => ({
    [apiSuccessActionType]: (state = initialState, actions = {}) => {
        const {response} = actions;
        if (isFunction(apiReducer)) {
            return apiReducer(response, state);
        }
        return defaultApiReducer(response);
    },
});

// 请求loading的reducer工厂
export const postingReducerFactory = apiActionTypes => {
    const [
        requestAction,
        successAction,
        failureAction,
    ] = apiActionTypes;
    return {
        [requestAction]: () => true,
        [successAction]: () => false,
        [failureAction]: () => false,
    };
};

// allOpt的actionCreator工厂
export const allOptActionCreatorWithLogFactory = ({
    actionType,
    source,
    target,
    sendLog,
}) => {
    return field => (dispatch, getState) => {
        sendLog({source, target});
        dispatch({
            type: actionType,
            payload: field,
        });
    };
};


// item的actionCreator工厂
export const itemActionCreatorWithLogFactory = ({
    itemActionType,
    sendLog,
    source,
    target,
}) => {
    return field => (dispatch, getState) => {
        sendLog({source, target});
        dispatch({
            type: itemActionType,
            payload: field,
        });
    };
};

// 路由跳转函数的actionCreator工厂
export const routePushActionCreatorWidthLog = ({
    source,
    target,
    updateRoute = push,
    sendLog,
}) => {
    return field => (dispatch, getState) => {
        sendLog({source, target});
        dispatch(updateRoute(field));
    };
};

/**
 * 默认请求函数
 * @param {string} url
 * @param {object} 请求参数
 * @returns promise
 */
const defaultRequest = (url, params = {}) => fetch(url, {
    method: 'post',
    body: JSON.stringify(params),
});

/**
 * 获取fetch服务，使用hooks和redux有区别
 * @param {object} param0
 * @returns 返回请求的方法
 */
const getFetchService = ({
    request,
    url,
    params,
    sendLog,
    normalizer,
    errorNormalizer,
    dispatch,
    source,
    target,
    getState,
    apiActionTypes,
    useHooks,
}) => {
    const [requestType, successType, failureType] = apiActionTypes;
    dispatch({type: requestType, payload: params});
    const fetchService = request(url, params).then(data => {
        // 请求成功的埋点
        sendLog({source, target, fetchRes: FETCH_RESULT_TYPE.SUCCESS, params});
        const res = data;
        const response = isFunction(normalizer) ? normalizer(res, getState, params) : res;
        dispatch({response, type: successType});
        return response;
    }, (error = {}) => {
        // 请求失败的埋点
        sendLog({source, target, fetchRes: FETCH_RESULT_TYPE.FAILURE});
        const payload = isFunction(errorNormalizer) ? errorNormalizer(error, getState) : error;
        dispatch({type: failureType, error, payload});
        throw error;
    });
    if (useHooks) {
        return fetchService;
    }
    const action = (dispatch, getState) => {
        return fetchService;
    };
    return dispatch(action);
};

// 接口的actionCreator工厂
export const apiActionCreatorWithLogFactory = ({
    source,
    target,
    sendLog,
    autoMsg,
    endpoint,
    normalizer,
    errorNormalizer,
    getParams,
    request = defaultRequest,
    apiActionTypes,
    useHooks,
}) => {
    return field => (dispatch, getState) => {
        const finParams = isFunction(getParams) ? getParams(getState, field) : field;
        const url = isFunction(endpoint) ? endpoint(getState()) : endpoint;
        const fetchService = getFetchService({
            request,
            url,
            params: finParams,
            sendLog,
            normalizer,
            errorNormalizer,
            dispatch,
            source,
            target,
            getState,
            apiActionTypes,
            useHooks,
        });
        return fetchService;
    };

};

/**
 * 将log中的target转化成百度统计自定义事件标识符
 * @param {string} target log中的target字段
 * @param {number} length 生成的字符串的长度
 * @param {number} bit 截取每个单词的位数
 * @param {string} connSign 链接符号
 * @returns 自定义事件标识符的部分
 */
export const getWordsAbbr = ({
    target,
    length = BT_EVENT_MAX_LENTH,
    bit = 1,
    connSign = '_',
}) => {
    const eventId = snakeCase(target);
    // 如果字符串转为“_”格式后长于指定长度，则会截取每个单词的制定前bit位；
    if (eventId.length > length) {
        return words(target).map(wd => {
            const wdAbbr = wd.slice(0, bit);
            return lowerCase(wdAbbr);
        }).join(connSign).slice(0, length);
    }
    return eventId;
};


/**
 * 自定义的bindActionCreator
 * @param {object} mapDispatchToProps
 * @returns {function} 处理后的mapDispatchToProps
 */
export const customBindActionCreators = mapDispatchToProps => (dispatch, ownProps) =>
    mapValues(mapDispatchToProps, handler => (...args) => {
        if (typeof handler !== 'function') {
            return dispatch(handler);
        }
        const actionCreator = ownProps ? handler(ownProps, ...args) : handler(...args);
        dispatch(actionCreator);
    });

// 判断reducer中是否传了接口path
export const isApi = endpoint => isString(endpoint) || isFunction(endpoint);

// 默认的mapStateToProps
export const defaultReduxMapStateToProps = namespace => state => state[namespace];


/**
 * 解析遍历items是的key值
 * @param {string} itemString
 * @returns {object} itemName, suffix，子项的key和操作后缀
 */
export const parseItemString = itemString => {
    const isSlash = itemString.indexOf(ACTION_SPLIT_SIGN) > -1;
    const itemNameArr = itemString.split(ACTION_SPLIT_SIGN);
    const itemName = isSlash
        ? itemNameArr.shift()
        : itemString;
    const suffix = isSlash
        ? itemNameArr.pop()
        : ITEM_ACTION_TYPE_MAP.CHANGE;
    return {
        itemName,
        suffix,
    };
};

