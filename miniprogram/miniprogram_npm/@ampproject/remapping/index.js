module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1744256979660, function(require, module, exports) {
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@jridgewell/trace-mapping'), require('@jridgewell/gen-mapping')) :
    typeof define === 'function' && define.amd ? define(['@jridgewell/trace-mapping', '@jridgewell/gen-mapping'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.remapping = factory(global.traceMapping, global.genMapping));
})(this, (function (traceMapping, genMapping) { 

    const SOURCELESS_MAPPING = /* #__PURE__ */ SegmentObject('', -1, -1, '', null, false);
    const EMPTY_SOURCES = [];
    function SegmentObject(source, line, column, name, content, ignore) {
        return { source, line, column, name, content, ignore };
    }
    function Source(map, sources, source, content, ignore) {
        return {
            map,
            sources,
            source,
            content,
            ignore,
        };
    }
    /**
     * MapSource represents a single sourcemap, with the ability to trace mappings into its child nodes
     * (which may themselves be SourceMapTrees).
     */
    function MapSource(map, sources) {
        return Source(map, sources, '', null, false);
    }
    /**
     * A "leaf" node in the sourcemap tree, representing an original, unmodified source file. Recursive
     * segment tracing ends at the `OriginalSource`.
     */
    function OriginalSource(source, content, ignore) {
        return Source(null, EMPTY_SOURCES, source, content, ignore);
    }
    /**
     * traceMappings is only called on the root level SourceMapTree, and begins the process of
     * resolving each mapping in terms of the original source files.
     */
    function traceMappings(tree) {
        // TODO: Eventually support sourceRoot, which has to be removed because the sources are already
        // fully resolved. We'll need to make sources relative to the sourceRoot before adding them.
        const gen = new genMapping.GenMapping({ file: tree.map.file });
        const { sources: rootSources, map } = tree;
        const rootNames = map.names;
        const rootMappings = traceMapping.decodedMappings(map);
        for (let i = 0; i < rootMappings.length; i++) {
            const segments = rootMappings[i];
            for (let j = 0; j < segments.length; j++) {
                const segment = segments[j];
                const genCol = segment[0];
                let traced = SOURCELESS_MAPPING;
                // 1-length segments only move the current generated column, there's no source information
                // to gather from it.
                if (segment.length !== 1) {
                    const source = rootSources[segment[1]];
                    traced = originalPositionFor(source, segment[2], segment[3], segment.length === 5 ? rootNames[segment[4]] : '');
                    // If the trace is invalid, then the trace ran into a sourcemap that doesn't contain a
                    // respective segment into an original source.
                    if (traced == null)
                        continue;
                }
                const { column, line, name, content, source, ignore } = traced;
                genMapping.maybeAddSegment(gen, i, genCol, source, line, column, name);
                if (source && content != null)
                    genMapping.setSourceContent(gen, source, content);
                if (ignore)
                    genMapping.setIgnore(gen, source, true);
            }
        }
        return gen;
    }
    /**
     * originalPositionFor is only called on children SourceMapTrees. It recurses down into its own
     * child SourceMapTrees, until we find the original source map.
     */
    function originalPositionFor(source, line, column, name) {
        if (!source.map) {
            return SegmentObject(source.source, line, column, name, source.content, source.ignore);
        }
        const segment = traceMapping.traceSegment(source.map, line, column);
        // If we couldn't find a segment, then this doesn't exist in the sourcemap.
        if (segment == null)
            return null;
        // 1-length segments only move the current generated column, there's no source information
        // to gather from it.
        if (segment.length === 1)
            return SOURCELESS_MAPPING;
        return originalPositionFor(source.sources[segment[1]], segment[2], segment[3], segment.length === 5 ? source.map.names[segment[4]] : name);
    }

    function asArray(value) {
        if (Array.isArray(value))
            return value;
        return [value];
    }
    /**
     * Recursively builds a tree structure out of sourcemap files, with each node
     * being either an `OriginalSource` "leaf" or a `SourceMapTree` composed of
     * `OriginalSource`s and `SourceMapTree`s.
     *
     * Every sourcemap is composed of a collection of source files and mappings
     * into locations of those source files. When we generate a `SourceMapTree` for
     * the sourcemap, we attempt to load each source file's own sourcemap. If it
     * does not have an associated sourcemap, it is considered an original,
     * unmodified source file.
     */
    function buildSourceMapTree(input, loader) {
        const maps = asArray(input).map((m) => new traceMapping.TraceMap(m, ''));
        const map = maps.pop();
        for (let i = 0; i < maps.length; i++) {
            if (maps[i].sources.length > 1) {
                throw new Error(`Transformation map ${i} must have exactly one source file.\n` +
                    'Did you specify these with the most recent transformation maps first?');
            }
        }
        let tree = build(map, loader, '', 0);
        for (let i = maps.length - 1; i >= 0; i--) {
            tree = MapSource(maps[i], [tree]);
        }
        return tree;
    }
    function build(map, loader, importer, importerDepth) {
        const { resolvedSources, sourcesContent, ignoreList } = map;
        const depth = importerDepth + 1;
        const children = resolvedSources.map((sourceFile, i) => {
            // The loading context gives the loader more information about why this file is being loaded
            // (eg, from which importer). It also allows the loader to override the location of the loaded
            // sourcemap/original source, or to override the content in the sourcesContent field if it's
            // an unmodified source file.
            const ctx = {
                importer,
                depth,
                source: sourceFile || '',
                content: undefined,
                ignore: undefined,
            };
            // Use the provided loader callback to retrieve the file's sourcemap.
            // TODO: We should eventually support async loading of sourcemap files.
            const sourceMap = loader(ctx.source, ctx);
            const { source, content, ignore } = ctx;
            // If there is a sourcemap, then we need to recurse into it to load its source files.
            if (sourceMap)
                return build(new traceMapping.TraceMap(sourceMap, source), loader, source, depth);
            // Else, it's an unmodified source file.
            // The contents of this unmodified source file can be overridden via the loader context,
            // allowing it to be explicitly null or a string. If it remains undefined, we fall back to
            // the importing sourcemap's `sourcesContent` field.
            const sourceContent = content !== undefined ? content : sourcesContent ? sourcesContent[i] : null;
            const ignored = ignore !== undefined ? ignore : ignoreList ? ignoreList.includes(i) : false;
            return OriginalSource(source, sourceContent, ignored);
        });
        return MapSource(map, children);
    }

    /**
     * A SourceMap v3 compatible sourcemap, which only includes fields that were
     * provided to it.
     */
    class SourceMap {
        constructor(map, options) {
            const out = options.decodedMappings ? genMapping.toDecodedMap(map) : genMapping.toEncodedMap(map);
            this.version = out.version; // SourceMap spec says this should be first.
            this.file = out.file;
            this.mappings = out.mappings;
            this.names = out.names;
            this.ignoreList = out.ignoreList;
            this.sourceRoot = out.sourceRoot;
            this.sources = out.sources;
            if (!options.excludeContent) {
                this.sourcesContent = out.sourcesContent;
            }
        }
        toString() {
            return JSON.stringify(this);
        }
    }

    /**
     * Traces through all the mappings in the root sourcemap, through the sources
     * (and their sourcemaps), all the way back to the original source location.
     *
     * `loader` will be called every time we encounter a source file. If it returns
     * a sourcemap, we will recurse into that sourcemap to continue the trace. If
     * it returns a falsey value, that source file is treated as an original,
     * unmodified source file.
     *
     * Pass `excludeContent` to exclude any self-containing source file content
     * from the output sourcemap.
     *
     * Pass `decodedMappings` to receive a SourceMap with decoded (instead of
     * VLQ encoded) mappings.
     */
    function remapping(input, loader, options) {
        const opts = typeof options === 'object' ? options : { excludeContent: !!options, decodedMappings: false };
        const tree = buildSourceMapTree(input, loader);
        return new SourceMap(traceMappings(tree), opts);
    }

    return remapping;

}));
//# sourceMappingURL=remapping.umd.js.map

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1744256979660);
})()
//miniprogram-npm-outsideDeps=["@jridgewell/trace-mapping","@jridgewell/gen-mapping"]
//# sourceMappingURL=index.js.map