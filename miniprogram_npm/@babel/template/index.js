module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1744256979761, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.statements = exports.statement = exports.smart = exports.program = exports.expression = exports.default = void 0;
var formatters = require("./formatters.js");
var _builder = require("./builder.js");
const smart = exports.smart = (0, _builder.default)(formatters.smart);
const statement = exports.statement = (0, _builder.default)(formatters.statement);
const statements = exports.statements = (0, _builder.default)(formatters.statements);
const expression = exports.expression = (0, _builder.default)(formatters.expression);
const program = exports.program = (0, _builder.default)(formatters.program);
var _default = exports.default = Object.assign(smart.bind(undefined), {
  smart,
  statement,
  statements,
  expression,
  program,
  ast: smart.ast
});

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./formatters.js":1744256979762,"./builder.js":1744256979763}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979762, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.statements = exports.statement = exports.smart = exports.program = exports.expression = void 0;
var _t = require("@babel/types");
const {
  assertExpressionStatement
} = _t;
function makeStatementFormatter(fn) {
  return {
    code: str => `/* @babel/template */;\n${str}`,
    validate: () => {},
    unwrap: ast => {
      return fn(ast.program.body.slice(1));
    }
  };
}
const smart = exports.smart = makeStatementFormatter(body => {
  if (body.length > 1) {
    return body;
  } else {
    return body[0];
  }
});
const statements = exports.statements = makeStatementFormatter(body => body);
const statement = exports.statement = makeStatementFormatter(body => {
  if (body.length === 0) {
    throw new Error("Found nothing to return.");
  }
  if (body.length > 1) {
    throw new Error("Found multiple statements but wanted one");
  }
  return body[0];
});
const expression = exports.expression = {
  code: str => `(\n${str}\n)`,
  validate: ast => {
    if (ast.program.body.length > 1) {
      throw new Error("Found multiple statements but wanted one");
    }
    if (expression.unwrap(ast).start === 0) {
      throw new Error("Parse result included parens.");
    }
  },
  unwrap: ({
    program
  }) => {
    const [stmt] = program.body;
    assertExpressionStatement(stmt);
    return stmt.expression;
  }
};
const program = exports.program = {
  code: str => str,
  validate: () => {},
  unwrap: ast => ast.program
};

//# sourceMappingURL=formatters.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979763, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createTemplateBuilder;
var _options = require("./options.js");
var _string = require("./string.js");
var _literal = require("./literal.js");
const NO_PLACEHOLDER = (0, _options.validate)({
  placeholderPattern: false
});
function createTemplateBuilder(formatter, defaultOpts) {
  const templateFnCache = new WeakMap();
  const templateAstCache = new WeakMap();
  const cachedOpts = defaultOpts || (0, _options.validate)(null);
  return Object.assign((tpl, ...args) => {
    if (typeof tpl === "string") {
      if (args.length > 1) throw new Error("Unexpected extra params.");
      return extendedTrace((0, _string.default)(formatter, tpl, (0, _options.merge)(cachedOpts, (0, _options.validate)(args[0]))));
    } else if (Array.isArray(tpl)) {
      let builder = templateFnCache.get(tpl);
      if (!builder) {
        builder = (0, _literal.default)(formatter, tpl, cachedOpts);
        templateFnCache.set(tpl, builder);
      }
      return extendedTrace(builder(args));
    } else if (typeof tpl === "object" && tpl) {
      if (args.length > 0) throw new Error("Unexpected extra params.");
      return createTemplateBuilder(formatter, (0, _options.merge)(cachedOpts, (0, _options.validate)(tpl)));
    }
    throw new Error(`Unexpected template param ${typeof tpl}`);
  }, {
    ast: (tpl, ...args) => {
      if (typeof tpl === "string") {
        if (args.length > 1) throw new Error("Unexpected extra params.");
        return (0, _string.default)(formatter, tpl, (0, _options.merge)((0, _options.merge)(cachedOpts, (0, _options.validate)(args[0])), NO_PLACEHOLDER))();
      } else if (Array.isArray(tpl)) {
        let builder = templateAstCache.get(tpl);
        if (!builder) {
          builder = (0, _literal.default)(formatter, tpl, (0, _options.merge)(cachedOpts, NO_PLACEHOLDER));
          templateAstCache.set(tpl, builder);
        }
        return builder(args)();
      }
      throw new Error(`Unexpected template param ${typeof tpl}`);
    }
  });
}
function extendedTrace(fn) {
  let rootStack = "";
  try {
    throw new Error();
  } catch (error) {
    if (error.stack) {
      rootStack = error.stack.split("\n").slice(3).join("\n");
    }
  }
  return arg => {
    try {
      return fn(arg);
    } catch (err) {
      err.stack += `\n    =============\n${rootStack}`;
      throw err;
    }
  };
}

//# sourceMappingURL=builder.js.map

}, function(modId) { var map = {"./options.js":1744256979764,"./string.js":1744256979765,"./literal.js":1744256979768}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979764, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.merge = merge;
exports.normalizeReplacements = normalizeReplacements;
exports.validate = validate;
const _excluded = ["placeholderWhitelist", "placeholderPattern", "preserveComments", "syntacticPlaceholders"];
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function merge(a, b) {
  const {
    placeholderWhitelist = a.placeholderWhitelist,
    placeholderPattern = a.placeholderPattern,
    preserveComments = a.preserveComments,
    syntacticPlaceholders = a.syntacticPlaceholders
  } = b;
  return {
    parser: Object.assign({}, a.parser, b.parser),
    placeholderWhitelist,
    placeholderPattern,
    preserveComments,
    syntacticPlaceholders
  };
}
function validate(opts) {
  if (opts != null && typeof opts !== "object") {
    throw new Error("Unknown template options.");
  }
  const _ref = opts || {},
    {
      placeholderWhitelist,
      placeholderPattern,
      preserveComments,
      syntacticPlaceholders
    } = _ref,
    parser = _objectWithoutPropertiesLoose(_ref, _excluded);
  if (placeholderWhitelist != null && !(placeholderWhitelist instanceof Set)) {
    throw new Error("'.placeholderWhitelist' must be a Set, null, or undefined");
  }
  if (placeholderPattern != null && !(placeholderPattern instanceof RegExp) && placeholderPattern !== false) {
    throw new Error("'.placeholderPattern' must be a RegExp, false, null, or undefined");
  }
  if (preserveComments != null && typeof preserveComments !== "boolean") {
    throw new Error("'.preserveComments' must be a boolean, null, or undefined");
  }
  if (syntacticPlaceholders != null && typeof syntacticPlaceholders !== "boolean") {
    throw new Error("'.syntacticPlaceholders' must be a boolean, null, or undefined");
  }
  if (syntacticPlaceholders === true && (placeholderWhitelist != null || placeholderPattern != null)) {
    throw new Error("'.placeholderWhitelist' and '.placeholderPattern' aren't compatible" + " with '.syntacticPlaceholders: true'");
  }
  return {
    parser,
    placeholderWhitelist: placeholderWhitelist || undefined,
    placeholderPattern: placeholderPattern == null ? undefined : placeholderPattern,
    preserveComments: preserveComments == null ? undefined : preserveComments,
    syntacticPlaceholders: syntacticPlaceholders == null ? undefined : syntacticPlaceholders
  };
}
function normalizeReplacements(replacements) {
  if (Array.isArray(replacements)) {
    return replacements.reduce((acc, replacement, i) => {
      acc["$" + i] = replacement;
      return acc;
    }, {});
  } else if (typeof replacements === "object" || replacements == null) {
    return replacements || undefined;
  }
  throw new Error("Template replacements must be an array, object, null, or undefined");
}

//# sourceMappingURL=options.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979765, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = stringTemplate;
var _options = require("./options.js");
var _parse = require("./parse.js");
var _populate = require("./populate.js");
function stringTemplate(formatter, code, opts) {
  code = formatter.code(code);
  let metadata;
  return arg => {
    const replacements = (0, _options.normalizeReplacements)(arg);
    if (!metadata) metadata = (0, _parse.default)(formatter, code, opts);
    return formatter.unwrap((0, _populate.default)(metadata, replacements));
  };
}

//# sourceMappingURL=string.js.map

}, function(modId) { var map = {"./options.js":1744256979764,"./parse.js":1744256979766,"./populate.js":1744256979767}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979766, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAndBuildMetadata;
var _t = require("@babel/types");
var _parser = require("@babel/parser");
var _codeFrame = require("@babel/code-frame");
const {
  isCallExpression,
  isExpressionStatement,
  isFunction,
  isIdentifier,
  isJSXIdentifier,
  isNewExpression,
  isPlaceholder,
  isStatement,
  isStringLiteral,
  removePropertiesDeep,
  traverse
} = _t;
const PATTERN = /^[_$A-Z0-9]+$/;
function parseAndBuildMetadata(formatter, code, opts) {
  const {
    placeholderWhitelist,
    placeholderPattern,
    preserveComments,
    syntacticPlaceholders
  } = opts;
  const ast = parseWithCodeFrame(code, opts.parser, syntacticPlaceholders);
  removePropertiesDeep(ast, {
    preserveComments
  });
  formatter.validate(ast);
  const state = {
    syntactic: {
      placeholders: [],
      placeholderNames: new Set()
    },
    legacy: {
      placeholders: [],
      placeholderNames: new Set()
    },
    placeholderWhitelist,
    placeholderPattern,
    syntacticPlaceholders
  };
  traverse(ast, placeholderVisitorHandler, state);
  return Object.assign({
    ast
  }, state.syntactic.placeholders.length ? state.syntactic : state.legacy);
}
function placeholderVisitorHandler(node, ancestors, state) {
  var _state$placeholderWhi;
  let name;
  let hasSyntacticPlaceholders = state.syntactic.placeholders.length > 0;
  if (isPlaceholder(node)) {
    if (state.syntacticPlaceholders === false) {
      throw new Error("%%foo%%-style placeholders can't be used when " + "'.syntacticPlaceholders' is false.");
    }
    name = node.name.name;
    hasSyntacticPlaceholders = true;
  } else if (hasSyntacticPlaceholders || state.syntacticPlaceholders) {
    return;
  } else if (isIdentifier(node) || isJSXIdentifier(node)) {
    name = node.name;
  } else if (isStringLiteral(node)) {
    name = node.value;
  } else {
    return;
  }
  if (hasSyntacticPlaceholders && (state.placeholderPattern != null || state.placeholderWhitelist != null)) {
    throw new Error("'.placeholderWhitelist' and '.placeholderPattern' aren't compatible" + " with '.syntacticPlaceholders: true'");
  }
  if (!hasSyntacticPlaceholders && (state.placeholderPattern === false || !(state.placeholderPattern || PATTERN).test(name)) && !((_state$placeholderWhi = state.placeholderWhitelist) != null && _state$placeholderWhi.has(name))) {
    return;
  }
  ancestors = ancestors.slice();
  const {
    node: parent,
    key
  } = ancestors[ancestors.length - 1];
  let type;
  if (isStringLiteral(node) || isPlaceholder(node, {
    expectedNode: "StringLiteral"
  })) {
    type = "string";
  } else if (isNewExpression(parent) && key === "arguments" || isCallExpression(parent) && key === "arguments" || isFunction(parent) && key === "params") {
    type = "param";
  } else if (isExpressionStatement(parent) && !isPlaceholder(node)) {
    type = "statement";
    ancestors = ancestors.slice(0, -1);
  } else if (isStatement(node) && isPlaceholder(node)) {
    type = "statement";
  } else {
    type = "other";
  }
  const {
    placeholders,
    placeholderNames
  } = !hasSyntacticPlaceholders ? state.legacy : state.syntactic;
  placeholders.push({
    name,
    type,
    resolve: ast => resolveAncestors(ast, ancestors),
    isDuplicate: placeholderNames.has(name)
  });
  placeholderNames.add(name);
}
function resolveAncestors(ast, ancestors) {
  let parent = ast;
  for (let i = 0; i < ancestors.length - 1; i++) {
    const {
      key,
      index
    } = ancestors[i];
    if (index === undefined) {
      parent = parent[key];
    } else {
      parent = parent[key][index];
    }
  }
  const {
    key,
    index
  } = ancestors[ancestors.length - 1];
  return {
    parent,
    key,
    index
  };
}
function parseWithCodeFrame(code, parserOpts, syntacticPlaceholders) {
  const plugins = (parserOpts.plugins || []).slice();
  if (syntacticPlaceholders !== false) {
    plugins.push("placeholders");
  }
  parserOpts = Object.assign({
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: true,
    allowNewTargetOutsideFunction: true,
    allowSuperOutsideMethod: true,
    allowYieldOutsideFunction: true,
    sourceType: "module"
  }, parserOpts, {
    plugins
  });
  try {
    return (0, _parser.parse)(code, parserOpts);
  } catch (err) {
    const loc = err.loc;
    if (loc) {
      err.message += "\n" + (0, _codeFrame.codeFrameColumns)(code, {
        start: loc
      });
      err.code = "BABEL_TEMPLATE_PARSE_ERROR";
    }
    throw err;
  }
}

//# sourceMappingURL=parse.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979767, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = populatePlaceholders;
var _t = require("@babel/types");
const {
  blockStatement,
  cloneNode,
  emptyStatement,
  expressionStatement,
  identifier,
  isStatement,
  isStringLiteral,
  stringLiteral,
  validate
} = _t;
function populatePlaceholders(metadata, replacements) {
  const ast = cloneNode(metadata.ast);
  if (replacements) {
    metadata.placeholders.forEach(placeholder => {
      if (!hasOwnProperty.call(replacements, placeholder.name)) {
        const placeholderName = placeholder.name;
        throw new Error(`Error: No substitution given for "${placeholderName}". If this is not meant to be a
            placeholder you may want to consider passing one of the following options to @babel/template:
            - { placeholderPattern: false, placeholderWhitelist: new Set(['${placeholderName}'])}
            - { placeholderPattern: /^${placeholderName}$/ }`);
      }
    });
    Object.keys(replacements).forEach(key => {
      if (!metadata.placeholderNames.has(key)) {
        throw new Error(`Unknown substitution "${key}" given`);
      }
    });
  }
  metadata.placeholders.slice().reverse().forEach(placeholder => {
    try {
      applyReplacement(placeholder, ast, replacements && replacements[placeholder.name] || null);
    } catch (e) {
      e.message = `@babel/template placeholder "${placeholder.name}": ${e.message}`;
      throw e;
    }
  });
  return ast;
}
function applyReplacement(placeholder, ast, replacement) {
  if (placeholder.isDuplicate) {
    if (Array.isArray(replacement)) {
      replacement = replacement.map(node => cloneNode(node));
    } else if (typeof replacement === "object") {
      replacement = cloneNode(replacement);
    }
  }
  const {
    parent,
    key,
    index
  } = placeholder.resolve(ast);
  if (placeholder.type === "string") {
    if (typeof replacement === "string") {
      replacement = stringLiteral(replacement);
    }
    if (!replacement || !isStringLiteral(replacement)) {
      throw new Error("Expected string substitution");
    }
  } else if (placeholder.type === "statement") {
    if (index === undefined) {
      if (!replacement) {
        replacement = emptyStatement();
      } else if (Array.isArray(replacement)) {
        replacement = blockStatement(replacement);
      } else if (typeof replacement === "string") {
        replacement = expressionStatement(identifier(replacement));
      } else if (!isStatement(replacement)) {
        replacement = expressionStatement(replacement);
      }
    } else {
      if (replacement && !Array.isArray(replacement)) {
        if (typeof replacement === "string") {
          replacement = identifier(replacement);
        }
        if (!isStatement(replacement)) {
          replacement = expressionStatement(replacement);
        }
      }
    }
  } else if (placeholder.type === "param") {
    if (typeof replacement === "string") {
      replacement = identifier(replacement);
    }
    if (index === undefined) throw new Error("Assertion failure.");
  } else {
    if (typeof replacement === "string") {
      replacement = identifier(replacement);
    }
    if (Array.isArray(replacement)) {
      throw new Error("Cannot replace single expression with an array.");
    }
  }
  function set(parent, key, value) {
    const node = parent[key];
    parent[key] = value;
    if (node.type === "Identifier" || node.type === "Placeholder") {
      if (node.typeAnnotation) {
        value.typeAnnotation = node.typeAnnotation;
      }
      if (node.optional) {
        value.optional = node.optional;
      }
      if (node.decorators) {
        value.decorators = node.decorators;
      }
    }
  }
  if (index === undefined) {
    validate(parent, key, replacement);
    set(parent, key, replacement);
  } else {
    const items = parent[key].slice();
    if (placeholder.type === "statement" || placeholder.type === "param") {
      if (replacement == null) {
        items.splice(index, 1);
      } else if (Array.isArray(replacement)) {
        items.splice(index, 1, ...replacement);
      } else {
        set(items, index, replacement);
      }
    } else {
      set(items, index, replacement);
    }
    validate(parent, key, items);
    parent[key] = items;
  }
}

//# sourceMappingURL=populate.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979768, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = literalTemplate;
var _options = require("./options.js");
var _parse = require("./parse.js");
var _populate = require("./populate.js");
function literalTemplate(formatter, tpl, opts) {
  const {
    metadata,
    names
  } = buildLiteralData(formatter, tpl, opts);
  return arg => {
    const defaultReplacements = {};
    arg.forEach((replacement, i) => {
      defaultReplacements[names[i]] = replacement;
    });
    return arg => {
      const replacements = (0, _options.normalizeReplacements)(arg);
      if (replacements) {
        Object.keys(replacements).forEach(key => {
          if (hasOwnProperty.call(defaultReplacements, key)) {
            throw new Error("Unexpected replacement overlap.");
          }
        });
      }
      return formatter.unwrap((0, _populate.default)(metadata, replacements ? Object.assign(replacements, defaultReplacements) : defaultReplacements));
    };
  };
}
function buildLiteralData(formatter, tpl, opts) {
  let prefix = "BABEL_TPL$";
  const raw = tpl.join("");
  do {
    prefix = "$$" + prefix;
  } while (raw.includes(prefix));
  const {
    names,
    code
  } = buildTemplateCode(tpl, prefix);
  const metadata = (0, _parse.default)(formatter, formatter.code(code), {
    parser: opts.parser,
    placeholderWhitelist: new Set(names.concat(opts.placeholderWhitelist ? Array.from(opts.placeholderWhitelist) : [])),
    placeholderPattern: opts.placeholderPattern,
    preserveComments: opts.preserveComments,
    syntacticPlaceholders: opts.syntacticPlaceholders
  });
  return {
    metadata,
    names
  };
}
function buildTemplateCode(tpl, prefix) {
  const names = [];
  let code = tpl[0];
  for (let i = 1; i < tpl.length; i++) {
    const value = `${prefix}${i - 1}`;
    names.push(value);
    code += value + tpl[i];
  }
  return {
    names,
    code
  };
}

//# sourceMappingURL=literal.js.map

}, function(modId) { var map = {"./options.js":1744256979764,"./parse.js":1744256979766,"./populate.js":1744256979767}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1744256979761);
})()
//miniprogram-npm-outsideDeps=["@babel/types","@babel/parser","@babel/code-frame"]
//# sourceMappingURL=index.js.map