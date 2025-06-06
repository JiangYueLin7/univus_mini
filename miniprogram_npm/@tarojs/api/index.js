module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1744256979588, function(require, module, exports) {


Object.defineProperty(exports, '__esModule', { value: true });

var runtime = require('@tarojs/runtime');
var shared = require('@tarojs/shared');

const ENV_TYPE = {
    WEAPP: 'WEAPP',
    SWAN: 'SWAN',
    ALIPAY: 'ALIPAY',
    TT: 'TT',
    QQ: 'QQ',
    JD: 'JD',
    WEB: 'WEB',
    RN: 'RN',
    HARMONY: 'HARMONY',
    QUICKAPP: 'QUICKAPP',
    HARMONYHYBRID: 'HARMONYHYBRID',
};
function getEnv() {
    if (process.env.TARO_ENV === 'weapp') {
        return ENV_TYPE.WEAPP;
    }
    else if (process.env.TARO_ENV === 'alipay') {
        return ENV_TYPE.ALIPAY;
    }
    else if (process.env.TARO_ENV === 'swan') {
        return ENV_TYPE.SWAN;
    }
    else if (process.env.TARO_ENV === 'tt') {
        return ENV_TYPE.TT;
    }
    else if (process.env.TARO_ENV === 'jd') {
        return ENV_TYPE.JD;
    }
    else if (process.env.TARO_ENV === 'qq') {
        return ENV_TYPE.QQ;
    }
    else if (process.env.TARO_ENV === 'harmony-hybrid') {
        return ENV_TYPE.HARMONYHYBRID;
    }
    else if (process.env.TARO_ENV === 'h5' || process.env.TARO_PLATFORM === 'web') {
        return ENV_TYPE.WEB;
    }
    else if (process.env.TARO_ENV === 'rn') {
        return ENV_TYPE.RN;
    }
    else if (process.env.TARO_ENV === 'harmony' || process.env.TARO_PLATFORM === 'harmony') {
        return ENV_TYPE.HARMONY;
    }
    else if (process.env.TARO_ENV === 'quickapp') {
        return ENV_TYPE.QUICKAPP;
    }
    else {
        return process.env.TARO_ENV || 'Unknown';
    }
}

class Chain {
    constructor(requestParams, interceptors, index) {
        this.index = index || 0;
        this.requestParams = requestParams || {};
        this.interceptors = interceptors || [];
    }
    proceed(requestParams = {}) {
        this.requestParams = requestParams;
        if (this.index >= this.interceptors.length) {
            throw new Error('chain 参数错误, 请勿直接修改 request.chain');
        }
        const nextInterceptor = this._getNextInterceptor();
        const nextChain = this._getNextChain();
        const p = nextInterceptor(nextChain);
        const res = p.catch(err => Promise.reject(err));
        Object.keys(p).forEach(k => shared.isFunction(p[k]) && (res[k] = p[k]));
        return res;
    }
    _getNextInterceptor() {
        return this.interceptors[this.index];
    }
    _getNextChain() {
        return new Chain(this.requestParams, this.interceptors, this.index + 1);
    }
}

class Link {
    constructor(interceptor) {
        this.taroInterceptor = interceptor;
        this.chain = new Chain();
    }
    request(requestParams) {
        const chain = this.chain;
        const taroInterceptor = this.taroInterceptor;
        chain.interceptors = chain.interceptors
            .filter(interceptor => interceptor !== taroInterceptor)
            .concat(taroInterceptor);
        return chain.proceed(Object.assign({}, requestParams));
    }
    addInterceptor(interceptor) {
        this.chain.interceptors.push(interceptor);
    }
    cleanInterceptors() {
        this.chain = new Chain();
    }
}
function interceptorify(promiseifyApi) {
    return new Link(function (chain) {
        return promiseifyApi(chain.requestParams);
    });
}

function timeoutInterceptor(chain) {
    const requestParams = chain.requestParams;
    let p;
    const res = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            clearTimeout(timeout);
            reject(new Error('网络链接超时,请稍后再试！'));
        }, (requestParams && requestParams.timeout) || 60000);
        p = chain.proceed(requestParams);
        p
            .then(res => {
            if (!timeout)
                return;
            clearTimeout(timeout);
            resolve(res);
        })
            .catch(err => {
            timeout && clearTimeout(timeout);
            reject(err);
        });
    });
    // @ts-ignore
    if (!shared.isUndefined(p) && shared.isFunction(p.abort))
        res.abort = p.abort;
    return res;
}
function logInterceptor(chain) {
    const requestParams = chain.requestParams;
    const { method, data, url } = requestParams;
    // eslint-disable-next-line no-console
    console.log(`http ${method || 'GET'} --> ${url} data: `, data);
    const p = chain.proceed(requestParams);
    const res = p
        .then(res => {
        // eslint-disable-next-line no-console
        console.log(`http <-- ${url} result:`, res);
        return res;
    });
    // @ts-ignore
    if (shared.isFunction(p.abort))
        res.abort = p.abort;
    return res;
}

var interceptors = /*#__PURE__*/Object.freeze({
    __proto__: null,
    logInterceptor: logInterceptor,
    timeoutInterceptor: timeoutInterceptor
});

function Behavior(options) {
    return options;
}
function getPreload(current) {
    return function (key, val) {
        current.preloadData = shared.isObject(key)
            ? key
            : {
                [key]: val
            };
    };
}
const defaultDesignWidth = 750;
const defaultDesignRatio = {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
};
const defaultBaseFontSize = 20;
const defaultUnitPrecision = 5;
const defaultTargetUnit = 'rpx';
function getInitPxTransform(taro) {
    return function (config) {
        const { designWidth = defaultDesignWidth, deviceRatio = defaultDesignRatio, baseFontSize = defaultBaseFontSize, targetUnit = defaultTargetUnit, unitPrecision = defaultUnitPrecision, } = config;
        taro.config = taro.config || {};
        taro.config.designWidth = designWidth;
        taro.config.deviceRatio = deviceRatio;
        taro.config.baseFontSize = baseFontSize;
        taro.config.targetUnit = targetUnit;
        taro.config.unitPrecision = unitPrecision;
    };
}
function getPxTransform(taro) {
    return function (size) {
        const config = taro.config || {};
        const baseFontSize = config.baseFontSize;
        const deviceRatio = config.deviceRatio || defaultDesignRatio;
        const designWidth = ((input = 0) => shared.isFunction(config.designWidth)
            ? config.designWidth(input)
            : config.designWidth || defaultDesignWidth)(size);
        if (!(designWidth in deviceRatio)) {
            throw new Error(`deviceRatio 配置中不存在 ${designWidth} 的设置！`);
        }
        const targetUnit = config.targetUnit || defaultTargetUnit;
        const unitPrecision = config.unitPrecision || defaultUnitPrecision;
        const formatSize = ~~size;
        let rootValue = 1 / deviceRatio[designWidth];
        switch (targetUnit) {
            case 'rem':
                rootValue *= baseFontSize * 2;
                break;
            case 'px':
                rootValue *= 2;
                break;
        }
        let val = formatSize / rootValue;
        if (unitPrecision >= 0 && unitPrecision <= 100) {
            val = Number(val.toFixed(unitPrecision));
        }
        return val + targetUnit;
    };
}

/* eslint-disable camelcase */
const Taro = {
    Behavior,
    getEnv,
    ENV_TYPE,
    Link,
    interceptors,
    Current: runtime.Current,
    getCurrentInstance: runtime.getCurrentInstance,
    options: runtime.options,
    nextTick: runtime.nextTick,
    eventCenter: runtime.eventCenter,
    Events: runtime.Events,
    getInitPxTransform,
    interceptorify
};
Taro.initPxTransform = getInitPxTransform(Taro);
Taro.preload = getPreload(runtime.Current);
Taro.pxTransform = getPxTransform(Taro);

exports.default = Taro;
//# sourceMappingURL=index.cjs.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1744256979588);
})()
//miniprogram-npm-outsideDeps=["@tarojs/runtime","@tarojs/shared"]
//# sourceMappingURL=index.js.map