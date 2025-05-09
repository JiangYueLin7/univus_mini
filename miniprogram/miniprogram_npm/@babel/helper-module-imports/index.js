module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1744256979740, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ImportInjector", {
  enumerable: true,
  get: function () {
    return _importInjector.default;
  }
});
exports.addDefault = addDefault;
exports.addNamed = addNamed;
exports.addNamespace = addNamespace;
exports.addSideEffect = addSideEffect;
Object.defineProperty(exports, "isModule", {
  enumerable: true,
  get: function () {
    return _isModule.default;
  }
});
var _importInjector = require("./import-injector.js");
var _isModule = require("./is-module.js");
function addDefault(path, importedSource, opts) {
  return new _importInjector.default(path).addDefault(importedSource, opts);
}
function addNamed(path, name, importedSource, opts) {
  return new _importInjector.default(path).addNamed(name, importedSource, opts);
}
function addNamespace(path, importedSource, opts) {
  return new _importInjector.default(path).addNamespace(importedSource, opts);
}
function addSideEffect(path, importedSource, opts) {
  return new _importInjector.default(path).addSideEffect(importedSource, opts);
}

//# sourceMappingURL=index.js.map

}, function(modId) {var map = {"./import-injector.js":1744256979741,"./is-module.js":1744256979743}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979741, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _assert = require("assert");
var _t = require("@babel/types");
var _importBuilder = require("./import-builder.js");
var _isModule = require("./is-module.js");
const {
  identifier,
  importSpecifier,
  numericLiteral,
  sequenceExpression,
  isImportDeclaration
} = _t;
class ImportInjector {
  constructor(path, importedSource, opts) {
    this._defaultOpts = {
      importedSource: null,
      importedType: "commonjs",
      importedInterop: "babel",
      importingInterop: "babel",
      ensureLiveReference: false,
      ensureNoContext: false,
      importPosition: "before"
    };
    const programPath = path.find(p => p.isProgram());
    this._programPath = programPath;
    this._programScope = programPath.scope;
    this._hub = programPath.hub;
    this._defaultOpts = this._applyDefaults(importedSource, opts, true);
  }
  addDefault(importedSourceIn, opts) {
    return this.addNamed("default", importedSourceIn, opts);
  }
  addNamed(importName, importedSourceIn, opts) {
    _assert(typeof importName === "string");
    return this._generateImport(this._applyDefaults(importedSourceIn, opts), importName);
  }
  addNamespace(importedSourceIn, opts) {
    return this._generateImport(this._applyDefaults(importedSourceIn, opts), null);
  }
  addSideEffect(importedSourceIn, opts) {
    return this._generateImport(this._applyDefaults(importedSourceIn, opts), void 0);
  }
  _applyDefaults(importedSource, opts, isInit = false) {
    let newOpts;
    if (typeof importedSource === "string") {
      newOpts = Object.assign({}, this._defaultOpts, {
        importedSource
      }, opts);
    } else {
      _assert(!opts, "Unexpected secondary arguments.");
      newOpts = Object.assign({}, this._defaultOpts, importedSource);
    }
    if (!isInit && opts) {
      if (opts.nameHint !== undefined) newOpts.nameHint = opts.nameHint;
      if (opts.blockHoist !== undefined) newOpts.blockHoist = opts.blockHoist;
    }
    return newOpts;
  }
  _generateImport(opts, importName) {
    const isDefault = importName === "default";
    const isNamed = !!importName && !isDefault;
    const isNamespace = importName === null;
    const {
      importedSource,
      importedType,
      importedInterop,
      importingInterop,
      ensureLiveReference,
      ensureNoContext,
      nameHint,
      importPosition,
      blockHoist
    } = opts;
    let name = nameHint || importName;
    const isMod = (0, _isModule.default)(this._programPath);
    const isModuleForNode = isMod && importingInterop === "node";
    const isModuleForBabel = isMod && importingInterop === "babel";
    if (importPosition === "after" && !isMod) {
      throw new Error(`"importPosition": "after" is only supported in modules`);
    }
    const builder = new _importBuilder.default(importedSource, this._programScope, this._hub);
    if (importedType === "es6") {
      if (!isModuleForNode && !isModuleForBabel) {
        throw new Error("Cannot import an ES6 module from CommonJS");
      }
      builder.import();
      if (isNamespace) {
        builder.namespace(nameHint || importedSource);
      } else if (isDefault || isNamed) {
        builder.named(name, importName);
      }
    } else if (importedType !== "commonjs") {
      throw new Error(`Unexpected interopType "${importedType}"`);
    } else if (importedInterop === "babel") {
      if (isModuleForNode) {
        name = name !== "default" ? name : importedSource;
        const es6Default = `${importedSource}$es6Default`;
        builder.import();
        if (isNamespace) {
          builder.default(es6Default).var(name || importedSource).wildcardInterop();
        } else if (isDefault) {
          if (ensureLiveReference) {
            builder.default(es6Default).var(name || importedSource).defaultInterop().read("default");
          } else {
            builder.default(es6Default).var(name).defaultInterop().prop(importName);
          }
        } else if (isNamed) {
          builder.default(es6Default).read(importName);
        }
      } else if (isModuleForBabel) {
        builder.import();
        if (isNamespace) {
          builder.namespace(name || importedSource);
        } else if (isDefault || isNamed) {
          builder.named(name, importName);
        }
      } else {
        builder.require();
        if (isNamespace) {
          builder.var(name || importedSource).wildcardInterop();
        } else if ((isDefault || isNamed) && ensureLiveReference) {
          if (isDefault) {
            name = name !== "default" ? name : importedSource;
            builder.var(name).read(importName);
            builder.defaultInterop();
          } else {
            builder.var(importedSource).read(importName);
          }
        } else if (isDefault) {
          builder.var(name).defaultInterop().prop(importName);
        } else if (isNamed) {
          builder.var(name).prop(importName);
        }
      }
    } else if (importedInterop === "compiled") {
      if (isModuleForNode) {
        builder.import();
        if (isNamespace) {
          builder.default(name || importedSource);
        } else if (isDefault || isNamed) {
          builder.default(importedSource).read(name);
        }
      } else if (isModuleForBabel) {
        builder.import();
        if (isNamespace) {
          builder.namespace(name || importedSource);
        } else if (isDefault || isNamed) {
          builder.named(name, importName);
        }
      } else {
        builder.require();
        if (isNamespace) {
          builder.var(name || importedSource);
        } else if (isDefault || isNamed) {
          if (ensureLiveReference) {
            builder.var(importedSource).read(name);
          } else {
            builder.prop(importName).var(name);
          }
        }
      }
    } else if (importedInterop === "uncompiled") {
      if (isDefault && ensureLiveReference) {
        throw new Error("No live reference for commonjs default");
      }
      if (isModuleForNode) {
        builder.import();
        if (isNamespace) {
          builder.default(name || importedSource);
        } else if (isDefault) {
          builder.default(name);
        } else if (isNamed) {
          builder.default(importedSource).read(name);
        }
      } else if (isModuleForBabel) {
        builder.import();
        if (isNamespace) {
          builder.default(name || importedSource);
        } else if (isDefault) {
          builder.default(name);
        } else if (isNamed) {
          builder.named(name, importName);
        }
      } else {
        builder.require();
        if (isNamespace) {
          builder.var(name || importedSource);
        } else if (isDefault) {
          builder.var(name);
        } else if (isNamed) {
          if (ensureLiveReference) {
            builder.var(importedSource).read(name);
          } else {
            builder.var(name).prop(importName);
          }
        }
      }
    } else {
      throw new Error(`Unknown importedInterop "${importedInterop}".`);
    }
    const {
      statements,
      resultName
    } = builder.done();
    this._insertStatements(statements, importPosition, blockHoist);
    if ((isDefault || isNamed) && ensureNoContext && resultName.type !== "Identifier") {
      return sequenceExpression([numericLiteral(0), resultName]);
    }
    return resultName;
  }
  _insertStatements(statements, importPosition = "before", blockHoist = 3) {
    if (importPosition === "after") {
      if (this._insertStatementsAfter(statements)) return;
    } else {
      if (this._insertStatementsBefore(statements, blockHoist)) return;
    }
    this._programPath.unshiftContainer("body", statements);
  }
  _insertStatementsBefore(statements, blockHoist) {
    if (statements.length === 1 && isImportDeclaration(statements[0]) && isValueImport(statements[0])) {
      const firstImportDecl = this._programPath.get("body").find(p => {
        return p.isImportDeclaration() && isValueImport(p.node);
      });
      if ((firstImportDecl == null ? void 0 : firstImportDecl.node.source.value) === statements[0].source.value && maybeAppendImportSpecifiers(firstImportDecl.node, statements[0])) {
        return true;
      }
    }
    statements.forEach(node => {
      node._blockHoist = blockHoist;
    });
    const targetPath = this._programPath.get("body").find(p => {
      const val = p.node._blockHoist;
      return Number.isFinite(val) && val < 4;
    });
    if (targetPath) {
      targetPath.insertBefore(statements);
      return true;
    }
    return false;
  }
  _insertStatementsAfter(statements) {
    const statementsSet = new Set(statements);
    const importDeclarations = new Map();
    for (const statement of statements) {
      if (isImportDeclaration(statement) && isValueImport(statement)) {
        const source = statement.source.value;
        if (!importDeclarations.has(source)) importDeclarations.set(source, []);
        importDeclarations.get(source).push(statement);
      }
    }
    let lastImportPath = null;
    for (const bodyStmt of this._programPath.get("body")) {
      if (bodyStmt.isImportDeclaration() && isValueImport(bodyStmt.node)) {
        lastImportPath = bodyStmt;
        const source = bodyStmt.node.source.value;
        const newImports = importDeclarations.get(source);
        if (!newImports) continue;
        for (const decl of newImports) {
          if (!statementsSet.has(decl)) continue;
          if (maybeAppendImportSpecifiers(bodyStmt.node, decl)) {
            statementsSet.delete(decl);
          }
        }
      }
    }
    if (statementsSet.size === 0) return true;
    if (lastImportPath) lastImportPath.insertAfter(Array.from(statementsSet));
    return !!lastImportPath;
  }
}
exports.default = ImportInjector;
function isValueImport(node) {
  return node.importKind !== "type" && node.importKind !== "typeof";
}
function hasNamespaceImport(node) {
  return node.specifiers.length === 1 && node.specifiers[0].type === "ImportNamespaceSpecifier" || node.specifiers.length === 2 && node.specifiers[1].type === "ImportNamespaceSpecifier";
}
function hasDefaultImport(node) {
  return node.specifiers.length > 0 && node.specifiers[0].type === "ImportDefaultSpecifier";
}
function maybeAppendImportSpecifiers(target, source) {
  if (!target.specifiers.length) {
    target.specifiers = source.specifiers;
    return true;
  }
  if (!source.specifiers.length) return true;
  if (hasNamespaceImport(target) || hasNamespaceImport(source)) return false;
  if (hasDefaultImport(source)) {
    if (hasDefaultImport(target)) {
      source.specifiers[0] = importSpecifier(source.specifiers[0].local, identifier("default"));
    } else {
      target.specifiers.unshift(source.specifiers.shift());
    }
  }
  target.specifiers.push(...source.specifiers);
  return true;
}

//# sourceMappingURL=import-injector.js.map

}, function(modId) { var map = {"./import-builder.js":1744256979742,"./is-module.js":1744256979743}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979742, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _assert = require("assert");
var _t = require("@babel/types");
const {
  callExpression,
  cloneNode,
  expressionStatement,
  identifier,
  importDeclaration,
  importDefaultSpecifier,
  importNamespaceSpecifier,
  importSpecifier,
  memberExpression,
  stringLiteral,
  variableDeclaration,
  variableDeclarator
} = _t;
class ImportBuilder {
  constructor(importedSource, scope, hub) {
    this._statements = [];
    this._resultName = null;
    this._importedSource = void 0;
    this._scope = scope;
    this._hub = hub;
    this._importedSource = importedSource;
  }
  done() {
    return {
      statements: this._statements,
      resultName: this._resultName
    };
  }
  import() {
    this._statements.push(importDeclaration([], stringLiteral(this._importedSource)));
    return this;
  }
  require() {
    this._statements.push(expressionStatement(callExpression(identifier("require"), [stringLiteral(this._importedSource)])));
    return this;
  }
  namespace(name = "namespace") {
    const local = this._scope.generateUidIdentifier(name);
    const statement = this._statements[this._statements.length - 1];
    _assert(statement.type === "ImportDeclaration");
    _assert(statement.specifiers.length === 0);
    statement.specifiers = [importNamespaceSpecifier(local)];
    this._resultName = cloneNode(local);
    return this;
  }
  default(name) {
    const id = this._scope.generateUidIdentifier(name);
    const statement = this._statements[this._statements.length - 1];
    _assert(statement.type === "ImportDeclaration");
    _assert(statement.specifiers.length === 0);
    statement.specifiers = [importDefaultSpecifier(id)];
    this._resultName = cloneNode(id);
    return this;
  }
  named(name, importName) {
    if (importName === "default") return this.default(name);
    const id = this._scope.generateUidIdentifier(name);
    const statement = this._statements[this._statements.length - 1];
    _assert(statement.type === "ImportDeclaration");
    _assert(statement.specifiers.length === 0);
    statement.specifiers = [importSpecifier(id, identifier(importName))];
    this._resultName = cloneNode(id);
    return this;
  }
  var(name) {
    const id = this._scope.generateUidIdentifier(name);
    let statement = this._statements[this._statements.length - 1];
    if (statement.type !== "ExpressionStatement") {
      _assert(this._resultName);
      statement = expressionStatement(this._resultName);
      this._statements.push(statement);
    }
    this._statements[this._statements.length - 1] = variableDeclaration("var", [variableDeclarator(id, statement.expression)]);
    this._resultName = cloneNode(id);
    return this;
  }
  defaultInterop() {
    return this._interop(this._hub.addHelper("interopRequireDefault"));
  }
  wildcardInterop() {
    return this._interop(this._hub.addHelper("interopRequireWildcard"));
  }
  _interop(callee) {
    const statement = this._statements[this._statements.length - 1];
    if (statement.type === "ExpressionStatement") {
      statement.expression = callExpression(callee, [statement.expression]);
    } else if (statement.type === "VariableDeclaration") {
      _assert(statement.declarations.length === 1);
      statement.declarations[0].init = callExpression(callee, [statement.declarations[0].init]);
    } else {
      _assert.fail("Unexpected type.");
    }
    return this;
  }
  prop(name) {
    const statement = this._statements[this._statements.length - 1];
    if (statement.type === "ExpressionStatement") {
      statement.expression = memberExpression(statement.expression, identifier(name));
    } else if (statement.type === "VariableDeclaration") {
      _assert(statement.declarations.length === 1);
      statement.declarations[0].init = memberExpression(statement.declarations[0].init, identifier(name));
    } else {
      _assert.fail("Unexpected type:" + statement.type);
    }
    return this;
  }
  read(name) {
    this._resultName = memberExpression(this._resultName, identifier(name));
  }
}
exports.default = ImportBuilder;

//# sourceMappingURL=import-builder.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1744256979743, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isModule;
function isModule(path) {
  return path.node.sourceType === "module";
}

//# sourceMappingURL=is-module.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1744256979740);
})()
//miniprogram-npm-outsideDeps=["assert","@babel/types"]
//# sourceMappingURL=index.js.map