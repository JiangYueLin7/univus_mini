module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1744256979658, function(require, module, exports) {


var isGlob = require('is-glob');
var pathPosixDirname = require('path').posix.dirname;
var isWin32 = require('os').platform() === 'win32';

var slash = '/';
var backslash = /\\/g;
var escaped = /\\([!*?|[\](){}])/g;

/**
 * @param {string} str
 * @param {Object} opts
 * @param {boolean} [opts.flipBackslashes=true]
 */
module.exports = function globParent(str, opts) {
  var options = Object.assign({ flipBackslashes: true }, opts);

  // flip windows path separators
  if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
    str = str.replace(backslash, slash);
  }

  // special case for strings ending in enclosure containing path separator
  if (isEnclosure(str)) {
    str += slash;
  }

  // preserves full path in case of trailing path separator
  str += 'a';

  // remove path parts that are globby
  do {
    str = pathPosixDirname(str);
  } while (isGlobby(str));

  // remove escape chars and return result
  return str.replace(escaped, '$1');
};

function isEnclosure(str) {
  var lastChar = str.slice(-1);

  var enclosureStart;
  switch (lastChar) {
    case '}':
      enclosureStart = '{';
      break;
    case ']':
      enclosureStart = '[';
      break;
    default:
      return false;
  }

  var foundIndex = str.indexOf(enclosureStart);
  if (foundIndex < 0) {
    return false;
  }

  return str.slice(foundIndex + 1, -1).includes(slash);
}

function isGlobby(str) {
  if (/\([^()]+$/.test(str)) {
    return true;
  }
  if (str[0] === '{' || str[0] === '[') {
    return true;
  }
  if (/[^\\][{[]/.test(str)) {
    return true;
  }
  return isGlob(str);
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1744256979658);
})()
//miniprogram-npm-outsideDeps=["is-glob","path","os"]
//# sourceMappingURL=index.js.map