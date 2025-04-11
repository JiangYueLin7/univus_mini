module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1744256979527, function(require, module, exports) {
/**
 * @filedescription Object Schema Package
 */

exports.ObjectSchema = require("./object-schema").ObjectSchema;
exports.MergeStrategy = require("./merge-strategy").MergeStrategy;
exports.ValidationStrategy = require("./validation-strategy").ValidationStrategy;

}, function(modId) {var map = {"./object-schema":1744256979528,"./merge-strategy":1744256979529,"./validation-strategy":1744256979530}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979528, function(require, module, exports) {
/**
 * @filedescription Object Schema
 */



//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

const { MergeStrategy } = require("./merge-strategy");
const { ValidationStrategy } = require("./validation-strategy");

//-----------------------------------------------------------------------------
// Private
//-----------------------------------------------------------------------------

const strategies = Symbol("strategies");
const requiredKeys = Symbol("requiredKeys");

/**
 * Validates a schema strategy.
 * @param {string} name The name of the key this strategy is for.
 * @param {Object} strategy The strategy for the object key.
 * @param {boolean} [strategy.required=true] Whether the key is required.
 * @param {string[]} [strategy.requires] Other keys that are required when
 *      this key is present.
 * @param {Function} strategy.merge A method to call when merging two objects
 *      with the same key.
 * @param {Function} strategy.validate A method to call when validating an
 *      object with the key.
 * @returns {void}
 * @throws {Error} When the strategy is missing a name.
 * @throws {Error} When the strategy is missing a merge() method.
 * @throws {Error} When the strategy is missing a validate() method.
 */
function validateDefinition(name, strategy) {

    let hasSchema = false;
    if (strategy.schema) {
        if (typeof strategy.schema === "object") {
            hasSchema = true;
        } else {
            throw new TypeError("Schema must be an object.");
        }
    }

    if (typeof strategy.merge === "string") {
        if (!(strategy.merge in MergeStrategy)) {
            throw new TypeError(`Definition for key "${name}" missing valid merge strategy.`);
        }
    } else if (!hasSchema && typeof strategy.merge !== "function") {
        throw new TypeError(`Definition for key "${name}" must have a merge property.`);
    }

    if (typeof strategy.validate === "string") {
        if (!(strategy.validate in ValidationStrategy)) {
            throw new TypeError(`Definition for key "${name}" missing valid validation strategy.`);
        }
    } else if (!hasSchema && typeof strategy.validate !== "function") {
        throw new TypeError(`Definition for key "${name}" must have a validate() method.`);
    }
}

//-----------------------------------------------------------------------------
// Errors
//-----------------------------------------------------------------------------

/**
 * Error when an unexpected key is found.
 */
class UnexpectedKeyError extends Error {

    /**
     * Creates a new instance.
     * @param {string} key The key that was unexpected. 
     */
    constructor(key) {
        super(`Unexpected key "${key}" found.`);
    }
}

/**
 * Error when a required key is missing.
 */
class MissingKeyError extends Error {

    /**
     * Creates a new instance.
     * @param {string} key The key that was missing. 
     */
    constructor(key) {
        super(`Missing required key "${key}".`);
    }
}

/**
 * Error when a key requires other keys that are missing.
 */
class MissingDependentKeysError extends Error {

    /**
     * Creates a new instance.
     * @param {string} key The key that was unexpected.
     * @param {Array<string>} requiredKeys The keys that are required.
     */
    constructor(key, requiredKeys) {
        super(`Key "${key}" requires keys "${requiredKeys.join("\", \"")}".`);
    }
}

/**
 * Wrapper error for errors occuring during a merge or validate operation.
 */
class WrapperError extends Error {

    /**
     * Creates a new instance.
     * @param {string} key The object key causing the error. 
     * @param {Error} source The source error. 
     */
    constructor(key, source) {
        super(`Key "${key}": ${source.message}`, { cause: source });

        // copy over custom properties that aren't represented
        for (const key of Object.keys(source)) {
            if (!(key in this)) {
                this[key] = source[key];
            }
        }
    }
}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

/**
 * Represents an object validation/merging schema.
 */
class ObjectSchema {

    /**
     * Creates a new instance.
     */
    constructor(definitions) {

        if (!definitions) {
            throw new Error("Schema definitions missing.");
        }

        /**
         * Track all strategies in the schema by key.
         * @type {Map}
         * @property strategies
         */
        this[strategies] = new Map();

        /**
         * Separately track any keys that are required for faster validation.
         * @type {Map}
         * @property requiredKeys
         */
        this[requiredKeys] = new Map();

        // add in all strategies
        for (const key of Object.keys(definitions)) {
            validateDefinition(key, definitions[key]);

            // normalize merge and validate methods if subschema is present
            if (typeof definitions[key].schema === "object") {
                const schema = new ObjectSchema(definitions[key].schema);
                definitions[key] = {
                    ...definitions[key],
                    merge(first = {}, second = {}) {
                        return schema.merge(first, second);
                    },
                    validate(value) {
                        ValidationStrategy.object(value);
                        schema.validate(value);
                    }
                };
            }

            // normalize the merge method in case there's a string
            if (typeof definitions[key].merge === "string") {
                definitions[key] = {
                    ...definitions[key],
                    merge: MergeStrategy[definitions[key].merge]
                };
            };

            // normalize the validate method in case there's a string
            if (typeof definitions[key].validate === "string") {
                definitions[key] = {
                    ...definitions[key],
                    validate: ValidationStrategy[definitions[key].validate]
                };
            };

            this[strategies].set(key, definitions[key]);

            if (definitions[key].required) {
                this[requiredKeys].set(key, definitions[key]);
            }
        }
    }

    /**
     * Determines if a strategy has been registered for the given object key.
     * @param {string} key The object key to find a strategy for.
     * @returns {boolean} True if the key has a strategy registered, false if not. 
     */
    hasKey(key) {
        return this[strategies].has(key);
    }

    /**
     * Merges objects together to create a new object comprised of the keys
     * of the all objects. Keys are merged based on the each key's merge
     * strategy.
     * @param {...Object} objects The objects to merge.
     * @returns {Object} A new object with a mix of all objects' keys.
     * @throws {Error} If any object is invalid.
     */
    merge(...objects) {

        // double check arguments
        if (objects.length < 2) {
            throw new TypeError("merge() requires at least two arguments.");
        }

        if (objects.some(object => (object == null || typeof object !== "object"))) {
            throw new TypeError("All arguments must be objects.");
        }

        return objects.reduce((result, object) => {
            
            this.validate(object);
            
            for (const [key, strategy] of this[strategies]) {
                try {
                    if (key in result || key in object) {
                        const value = strategy.merge.call(this, result[key], object[key]);
                        if (value !== undefined) {
                            result[key] = value;
                        }
                    }
                } catch (ex) {
                    throw new WrapperError(key, ex);
                }
            }
            return result;
        }, {});
    }

    /**
     * Validates an object's keys based on the validate strategy for each key.
     * @param {Object} object The object to validate.
     * @returns {void}
     * @throws {Error} When the object is invalid. 
     */
    validate(object) {

        // check existing keys first
        for (const key of Object.keys(object)) {

            // check to see if the key is defined
            if (!this.hasKey(key)) {
                throw new UnexpectedKeyError(key);
            }

            // validate existing keys
            const strategy = this[strategies].get(key);

            // first check to see if any other keys are required
            if (Array.isArray(strategy.requires)) {
                if (!strategy.requires.every(otherKey => otherKey in object)) {
                    throw new MissingDependentKeysError(key, strategy.requires);
                }
            }

            // now apply remaining validation strategy
            try {
                strategy.validate.call(strategy, object[key]);
            } catch (ex) {
                throw new WrapperError(key, ex);
            }
        }

        // ensure required keys aren't missing
        for (const [key] of this[requiredKeys]) {
            if (!(key in object)) {
                throw new MissingKeyError(key);
            }
        }

    }
}

exports.ObjectSchema = ObjectSchema;

}, function(modId) { var map = {"./merge-strategy":1744256979529,"./validation-strategy":1744256979530}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979529, function(require, module, exports) {
/**
 * @filedescription Merge Strategy
 */



//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

/**
 * Container class for several different merge strategies.
 */
class MergeStrategy {

    /**
     * Merges two keys by overwriting the first with the second.
     * @param {*} value1 The value from the first object key. 
     * @param {*} value2 The value from the second object key.
     * @returns {*} The second value.
     */
    static overwrite(value1, value2) {
        return value2;
    }

    /**
     * Merges two keys by replacing the first with the second only if the
     * second is defined.
     * @param {*} value1 The value from the first object key. 
     * @param {*} value2 The value from the second object key.
     * @returns {*} The second value if it is defined.
     */
    static replace(value1, value2) {
        if (typeof value2 !== "undefined") {
            return value2;
        }

        return value1;
    }

    /**
     * Merges two properties by assigning properties from the second to the first.
     * @param {*} value1 The value from the first object key.
     * @param {*} value2 The value from the second object key.
     * @returns {*} A new object containing properties from both value1 and
     *      value2.
     */
    static assign(value1, value2) {
        return Object.assign({}, value1, value2);
    }
}

exports.MergeStrategy = MergeStrategy;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979530, function(require, module, exports) {
/**
 * @filedescription Validation Strategy
 */



//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

/**
 * Container class for several different validation strategies.
 */
class ValidationStrategy {

    /**
     * Validates that a value is an array.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid. 
     */
    static array(value) {
        if (!Array.isArray(value)) {
            throw new TypeError("Expected an array.");
        }
    }

    /**
     * Validates that a value is a boolean.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid. 
     */
    static boolean(value) {
        if (typeof value !== "boolean") {
            throw new TypeError("Expected a Boolean.");
        }
    }

    /**
     * Validates that a value is a number.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid. 
     */
    static number(value) {
        if (typeof value !== "number") {
            throw new TypeError("Expected a number.");
        }
    }

    /**
     * Validates that a value is a object.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid. 
     */
    static object(value) {
        if (!value || typeof value !== "object") {
            throw new TypeError("Expected an object.");
        }
    }

    /**
     * Validates that a value is a object or null.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid. 
     */
    static "object?"(value) {
        if (typeof value !== "object") {
            throw new TypeError("Expected an object or null.");
        }
    }

    /**
     * Validates that a value is a string.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid. 
     */
    static string(value) {
        if (typeof value !== "string") {
            throw new TypeError("Expected a string.");
        }
    }

    /**
     * Validates that a value is a non-empty string.
     * @param {*} value The value to validate.
     * @returns {void}
     * @throws {TypeError} If the value is invalid. 
     */
    static "string!"(value) {
        if (typeof value !== "string" || value.length === 0) {
            throw new TypeError("Expected a non-empty string.");
        }
    }

}

exports.ValidationStrategy = ValidationStrategy;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1744256979527);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map