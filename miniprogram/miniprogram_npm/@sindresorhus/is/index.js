module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1744256979576, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const toString = Object.prototype.toString;
const isOfType = (type) => (value) => typeof value === type; // tslint:disable-line:strict-type-predicates
const getObjectType = (value) => {
    const objectName = toString.call(value).slice(8, -1);
    if (objectName) {
        return objectName;
    }
    return null;
};
const isObjectOfType = (typeName) => (value) => {
    return getObjectType(value) === typeName;
};
function is(value) {
    if (value === null) {
        return "null" /* null */;
    }
    if (value === true || value === false) {
        return "boolean" /* boolean */;
    }
    const type = typeof value;
    if (type === 'undefined') {
        return "undefined" /* undefined */;
    }
    if (type === 'string') {
        return "string" /* string */;
    }
    if (type === 'number') {
        return "number" /* number */;
    }
    if (type === 'symbol') {
        return "symbol" /* symbol */;
    }
    if (is.function_(value)) {
        return "Function" /* Function */;
    }
    if (Array.isArray(value)) {
        return "Array" /* Array */;
    }
    if (Buffer.isBuffer(value)) {
        return "Buffer" /* Buffer */;
    }
    const tagType = getObjectType(value);
    if (tagType) {
        return tagType;
    }
    if (value instanceof String || value instanceof Boolean || value instanceof Number) {
        throw new TypeError('Please don\'t use object wrappers for primitive types');
    }
    return "Object" /* Object */;
}
(function (is) {
    const isObject = (value) => typeof value === 'object';
    // tslint:disable:variable-name
    is.undefined = isOfType('undefined');
    is.string = isOfType('string');
    is.number = isOfType('number');
    is.function_ = isOfType('function');
    is.null_ = (value) => value === null;
    is.class_ = (value) => is.function_(value) && value.toString().startsWith('class ');
    is.boolean = (value) => value === true || value === false;
    // tslint:enable:variable-name
    is.symbol = isOfType('symbol');
    is.array = Array.isArray;
    is.buffer = Buffer.isBuffer;
    is.nullOrUndefined = (value) => is.null_(value) || is.undefined(value);
    is.object = (value) => !is.nullOrUndefined(value) && (is.function_(value) || isObject(value));
    is.iterable = (value) => !is.nullOrUndefined(value) && is.function_(value[Symbol.iterator]);
    is.generator = (value) => is.iterable(value) && is.function_(value.next) && is.function_(value.throw);
    is.nativePromise = isObjectOfType("Promise" /* Promise */);
    const hasPromiseAPI = (value) => !is.null_(value) &&
        isObject(value) &&
        is.function_(value.then) &&
        is.function_(value.catch);
    is.promise = (value) => is.nativePromise(value) || hasPromiseAPI(value);
    // TODO: Change to use `isObjectOfType` once Node.js 6 or higher is targeted
    const isFunctionOfType = (type) => (value) => is.function_(value) && is.function_(value.constructor) && value.constructor.name === type;
    is.generatorFunction = isFunctionOfType('GeneratorFunction');
    is.asyncFunction = isFunctionOfType('AsyncFunction');
    is.boundFunction = (value) => is.function_(value) && !value.hasOwnProperty('prototype');
    is.regExp = isObjectOfType("RegExp" /* RegExp */);
    is.date = isObjectOfType("Date" /* Date */);
    is.error = isObjectOfType("Error" /* Error */);
    is.map = isObjectOfType("Map" /* Map */);
    is.set = isObjectOfType("Set" /* Set */);
    is.weakMap = isObjectOfType("WeakMap" /* WeakMap */);
    is.weakSet = isObjectOfType("WeakSet" /* WeakSet */);
    is.int8Array = isObjectOfType("Int8Array" /* Int8Array */);
    is.uint8Array = isObjectOfType("Uint8Array" /* Uint8Array */);
    is.uint8ClampedArray = isObjectOfType("Uint8ClampedArray" /* Uint8ClampedArray */);
    is.int16Array = isObjectOfType("Int16Array" /* Int16Array */);
    is.uint16Array = isObjectOfType("Uint16Array" /* Uint16Array */);
    is.int32Array = isObjectOfType("Int32Array" /* Int32Array */);
    is.uint32Array = isObjectOfType("Uint32Array" /* Uint32Array */);
    is.float32Array = isObjectOfType("Float32Array" /* Float32Array */);
    is.float64Array = isObjectOfType("Float64Array" /* Float64Array */);
    is.arrayBuffer = isObjectOfType("ArrayBuffer" /* ArrayBuffer */);
    is.sharedArrayBuffer = isObjectOfType("SharedArrayBuffer" /* SharedArrayBuffer */);
    is.dataView = isObjectOfType("DataView" /* DataView */);
    // TODO: Remove `object` checks when targeting ES2015 or higher
    // See `Notes`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
    is.directInstanceOf = (instance, klass) => is.object(instance) && is.object(klass) && Object.getPrototypeOf(instance) === klass.prototype;
    is.truthy = (value) => Boolean(value);
    is.falsy = (value) => !value;
    is.nan = (value) => Number.isNaN(value);
    const primitiveTypes = new Set([
        'undefined',
        'string',
        'number',
        'boolean',
        'symbol'
    ]);
    is.primitive = (value) => is.null_(value) || primitiveTypes.has(typeof value);
    is.integer = (value) => Number.isInteger(value);
    is.safeInteger = (value) => Number.isSafeInteger(value);
    is.plainObject = (value) => {
        // From: https://github.com/sindresorhus/is-plain-obj/blob/master/index.js
        let prototype;
        return getObjectType(value) === "Object" /* Object */ &&
            (prototype = Object.getPrototypeOf(value), prototype === null || // tslint:disable-line:ban-comma-operator
                prototype === Object.getPrototypeOf({}));
    };
    const typedArrayTypes = new Set([
        "Int8Array" /* Int8Array */,
        "Uint8Array" /* Uint8Array */,
        "Uint8ClampedArray" /* Uint8ClampedArray */,
        "Int16Array" /* Int16Array */,
        "Uint16Array" /* Uint16Array */,
        "Int32Array" /* Int32Array */,
        "Uint32Array" /* Uint32Array */,
        "Float32Array" /* Float32Array */,
        "Float64Array" /* Float64Array */
    ]);
    is.typedArray = (value) => {
        const objectType = getObjectType(value);
        if (objectType === null) {
            return false;
        }
        return typedArrayTypes.has(objectType);
    };
    const isValidLength = (value) => is.safeInteger(value) && value > -1;
    is.arrayLike = (value) => !is.nullOrUndefined(value) && !is.function_(value) && isValidLength(value.length);
    is.inRange = (value, range) => {
        if (is.number(range)) {
            return value >= Math.min(0, range) && value <= Math.max(range, 0);
        }
        if (is.array(range) && range.length === 2) {
            // TODO: Use spread operator here when targeting Node.js 6 or higher
            return value >= Math.min.apply(null, range) && value <= Math.max.apply(null, range);
        }
        throw new TypeError(`Invalid range: ${util.inspect(range)}`);
    };
    const NODE_TYPE_ELEMENT = 1;
    const DOM_PROPERTIES_TO_CHECK = [
        'innerHTML',
        'ownerDocument',
        'style',
        'attributes',
        'nodeValue'
    ];
    is.domElement = (value) => is.object(value) && value.nodeType === NODE_TYPE_ELEMENT && is.string(value.nodeName) &&
        !is.plainObject(value) && DOM_PROPERTIES_TO_CHECK.every(property => property in value);
    is.nodeStream = (value) => !is.nullOrUndefined(value) && isObject(value) && is.function_(value.pipe);
    is.infinite = (value) => value === Infinity || value === -Infinity;
    const isAbsoluteMod2 = (value) => (rem) => is.integer(rem) && Math.abs(rem % 2) === value;
    is.even = isAbsoluteMod2(0);
    is.odd = isAbsoluteMod2(1);
    const isWhiteSpaceString = (value) => is.string(value) && /\S/.test(value) === false;
    const isEmptyStringOrArray = (value) => (is.string(value) || is.array(value)) && value.length === 0;
    const isEmptyObject = (value) => !is.map(value) && !is.set(value) && is.object(value) && Object.keys(value).length === 0;
    const isEmptyMapOrSet = (value) => (is.map(value) || is.set(value)) && value.size === 0;
    is.empty = (value) => is.falsy(value) || isEmptyStringOrArray(value) || isEmptyObject(value) || isEmptyMapOrSet(value);
    is.emptyOrWhitespace = (value) => is.empty(value) || isWhiteSpaceString(value);
    const predicateOnArray = (method, predicate, args) => {
        // `args` is the calling function's "arguments object".
        // We have to do it this way to keep node v4 support.
        // So here we convert it to an array and slice off the first item.
        const values = Array.prototype.slice.call(args, 1);
        if (is.function_(predicate) === false) {
            throw new TypeError(`Invalid predicate: ${util.inspect(predicate)}`);
        }
        if (values.length === 0) {
            throw new TypeError('Invalid number of values');
        }
        return method.call(values, predicate);
    };
    function any(predicate) {
        return predicateOnArray(Array.prototype.some, predicate, arguments);
    }
    is.any = any;
    function all(predicate) {
        return predicateOnArray(Array.prototype.every, predicate, arguments);
    }
    is.all = all;
    // tslint:enable:only-arrow-functions no-function-expression
})(is || (is = {}));
// Some few keywords are reserved, but we'll populate them for Node.js users
// See https://github.com/Microsoft/TypeScript/issues/2536
Object.defineProperties(is, {
    class: {
        value: is.class_
    },
    function: {
        value: is.function_
    },
    null: {
        value: is.null_
    }
});
exports.default = is;
// For CommonJS default export support
module.exports = is;
module.exports.default = is;

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1744256979576);
})()
//miniprogram-npm-outsideDeps=["util"]
//# sourceMappingURL=index.js.map