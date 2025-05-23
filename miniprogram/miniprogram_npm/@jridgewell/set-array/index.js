module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1744256979539, function(require, module, exports) {
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.setArray = {}));
})(this, (function (exports) { 

    /**
     * SetArray acts like a `Set` (allowing only one occurrence of a string `key`), but provides the
     * index of the `key` in the backing array.
     *
     * This is designed to allow synchronizing a second array with the contents of the backing array,
     * like how in a sourcemap `sourcesContent[i]` is the source content associated with `source[i]`,
     * and there are never duplicates.
     */
    class SetArray {
        constructor() {
            this._indexes = { __proto__: null };
            this.array = [];
        }
    }
    /**
     * Typescript doesn't allow friend access to private fields, so this just casts the set into a type
     * with public access modifiers.
     */
    function cast(set) {
        return set;
    }
    /**
     * Gets the index associated with `key` in the backing array, if it is already present.
     */
    function get(setarr, key) {
        return cast(setarr)._indexes[key];
    }
    /**
     * Puts `key` into the backing array, if it is not already present. Returns
     * the index of the `key` in the backing array.
     */
    function put(setarr, key) {
        // The key may or may not be present. If it is present, it's a number.
        const index = get(setarr, key);
        if (index !== undefined)
            return index;
        const { array, _indexes: indexes } = cast(setarr);
        const length = array.push(key);
        return (indexes[key] = length - 1);
    }
    /**
     * Pops the last added item out of the SetArray.
     */
    function pop(setarr) {
        const { array, _indexes: indexes } = cast(setarr);
        if (array.length === 0)
            return;
        const last = array.pop();
        indexes[last] = undefined;
    }
    /**
     * Removes the key, if it exists in the set.
     */
    function remove(setarr, key) {
        const index = get(setarr, key);
        if (index === undefined)
            return;
        const { array, _indexes: indexes } = cast(setarr);
        for (let i = index + 1; i < array.length; i++) {
            const k = array[i];
            array[i - 1] = k;
            indexes[k]--;
        }
        indexes[key] = undefined;
        array.pop();
    }

    exports.SetArray = SetArray;
    exports.get = get;
    exports.pop = pop;
    exports.put = put;
    exports.remove = remove;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=set-array.umd.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1744256979539);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map