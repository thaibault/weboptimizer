#!/usr/bin/env node


// -*- coding: utf-8 -*-
'use strict';
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports

var _babelCore = require('babel-core');

var _babelPresetMinify = require('babel-preset-minify');

var _babelPresetMinify2 = _interopRequireDefault(_babelPresetMinify);

var _babelPluginTransformWith = require('babel-plugin-transform-with');

var _babelPluginTransformWith2 = _interopRequireDefault(_babelPluginTransformWith);

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _ejs = require('ejs');

var ejs = _interopRequireWildcard(_ejs);

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _htmlMinifier = require('html-minifier');

var _loaderUtils = require('loader-utils');

var loaderUtils = _interopRequireWildcard(_loaderUtils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _configurator = require('./configurator.compiled');

var _configurator2 = _interopRequireDefault(_configurator);

var _helper = require('./helper.compiled');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// endregion

// endregion
// region types
module.exports = function (source) {
    var _this = this;

    if ('cachable' in this && this.cacheable) this.cacheable();
    var query = _clientnode2.default.convertSubstringInPlainObject(_clientnode2.default.extendObject(true, {
        compress: {
            html: {},
            javaScript: {}
        },
        context: './',
        extensions: {
            file: {
                external: ['.js'],
                internal: ['.js', '.json', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.eot', '.ttf', '.woff']
            },
            module: []
        },
        module: {
            aliases: {},
            replacements: {}
        },
        compileSteps: 2
    }, this.options || {}, 'query' in this ? loaderUtils.getOptions(this) || {} : {}), /#%%%#/g, '!');
    var compile = function compile(template) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : query.compiler;
        var compileSteps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
        return function () {
            var locals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            options = _clientnode2.default.extendObject(true, { filename: template }, options);
            var require = function require(request) {
                var nestedLocals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var template = request.replace(/^(.+)\?[^?]+$/, '$1');
                var queryMatch = request.match(/^[^?]+\?(.+)$/);
                if (queryMatch) {
                    var evaluationFunction = function evaluationFunction(request, template, source, compile, locals) {
                        return new Function('request', 'template', 'source', 'compile', 'locals', 'return ' + queryMatch[1])(request, template, source, compile, locals);
                    };
                    nestedLocals = _clientnode2.default.extendObject(true, nestedLocals, evaluationFunction(request, template, source, compile, locals));
                }
                var nestedOptions = _clientnode2.default.copy(options);
                delete nestedOptions.client;
                nestedOptions = _clientnode2.default.extendObject(true, { encoding: _configurator2.default.encoding }, nestedOptions, nestedLocals.options || {});
                if (nestedOptions.isString) return compile(template, nestedOptions)(nestedLocals);
                var templateFilePath = _helper2.default.determineModuleFilePath(template, query.module.aliases, query.module.replacements, query.extensions, query.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore, _configurator2.default.module.directoryNames, _configurator2.default.package.main.fileNames, _configurator2.default.package.main.propertyNames, _configurator2.default.package.aliasPropertyNames, _configurator2.default.encoding);
                if (templateFilePath) {
                    if ('query' in _this) _this.addDependency(templateFilePath);
                    /*
                        NOTE: If there aren't any locals options or variables and
                        file doesn't seem to be an ejs template we simply load
                        included file content.
                    */
                    if (queryMatch || templateFilePath.endsWith('.ejs')) return compile(templateFilePath, nestedOptions)(nestedLocals);
                    // IgnoreTypeCheck
                    return fileSystem.readFileSync(templateFilePath, nestedOptions);
                }
                throw new Error('Given template file "' + template + '" couldn\'t be resolved.');
            };
            var compressHTML = function compressHTML(content) {
                return query.compress.html ? (0, _htmlMinifier.minify)(content, _clientnode2.default.extendObject(true, {
                    caseSensitive: true,
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    minifyCSS: true,
                    minifyJS: true,
                    processScripts: ['text/ng-template', 'text/x-handlebars-template'],
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    sortAttributes: true,
                    sortClassName: true,
                    // NOTE: Avoids whitespace around placeholder in tags.
                    trimCustomFragments: true,
                    useShortDoctype: true
                }, query.compress.html)) : content;
            };
            var remainingSteps = compileSteps;
            var result = template;
            var isString = options.isString;
            delete options.isString;
            while (remainingSteps > 0) {
                if (typeof result === 'string') {
                    var filePath = isString && options.filename || result;
                    if (filePath && _path2.default.extname(filePath) === '.js') result = eval('require')(filePath);else {
                        if (!isString) {
                            var encoding = _configurator2.default.encoding;
                            if ('encoding' in options) encoding = options.encoding;
                            result = fileSystem.readFileSync(result, { encoding: encoding });
                        }
                        if (remainingSteps === 1) result = compressHTML(result);
                        result = ejs.compile(result, options);
                    }
                } else result = compressHTML(result(_clientnode2.default.extendObject(true, {
                    configuration: _configurator2.default, Helper: _helper2.default, include: require, require: require, Tools: _clientnode2.default
                }, locals)));
                remainingSteps -= 1;
            }
            if (Boolean(compileSteps % 2)) return '\'use strict\';\n' + (0, _babelCore.transform)('module.exports = ' + result.toString() + ';', {
                ast: false,
                babelrc: false,
                comments: !Boolean(query.compress.javaScript),
                compact: Boolean(query.compress.javaScript),
                filename: options.filename || 'unknown',
                minified: Boolean(query.compress.javaScript),
                plugins: [_babelPluginTransformWith2.default],
                presets: query.compress.javaScript ? [[_babelPresetMinify2.default, query.compress.javaScript]] : [],
                sourceMaps: false,
                sourceType: 'script'
            }).code;
            result = result.replace(new RegExp('<script +processing-workaround *(?:= *(?:" *"|\' *\') *)?>' + '([\\s\\S]*?)</ *script *>', 'ig'), '$1').replace(new RegExp('<script +processing(-+)-workaround *(?:= *(?:" *"|\' *\') *)?' + '>([\\s\\S]*?)</ *script *>', 'ig'), '<script processing$1workaround>$2</script>');
            // IgnoreTypeCheck
            return result;
        };
    };
    return compile(source, {
        client: Boolean(query.compileSteps % 2),
        compileDebug: this.debug || false,
        debug: this.debug || false,
        filename: 'query' in this ? loaderUtils.getRemainingRequest(this).replace(/^!/, '') : this.filename || null,
        isString: true
    }, query.compileSteps)(query.locals || {});
};
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QjtBQUNuQixnQkFBUSxRQUFRLE1BQU0sWUFBTixHQUFxQixDQUE3QixDQURXO0FBRW5CLHNCQUFjLEtBQUssS0FBTCxJQUFjLEtBRlQ7QUFHbkIsZUFBTyxLQUFLLEtBQUwsSUFBYyxLQUhGO0FBSW5CLGtCQUFVLFdBQVcsSUFBWCxHQUFrQixZQUFZLG1CQUFaLENBQ3hCLElBRHdCLEVBRTFCLE9BRjBCLENBRWxCLElBRmtCLEVBRVosRUFGWSxDQUFsQixHQUVZLEtBQUssUUFBTCxJQUFpQixJQU5wQjtBQU9uQixrQkFBVTtBQVBTLEtBQWhCLEVBUUosTUFBTSxZQVJGLEVBUWdCLE1BQU0sTUFBTixJQUFnQixFQVJoQyxDQUFQO0FBU0gsQ0FuTEQ7QUFvTEE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZWpzTG9hZGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHt0cmFuc2Zvcm0gYXMgYmFiZWxUcmFuc2Zvcm19IGZyb20gJ2JhYmVsLWNvcmUnXG5pbXBvcnQgYmFiZWxNaW5pZnlQcmVzZXQgZnJvbSAnYmFiZWwtcHJlc2V0LW1pbmlmeSdcbmltcG9ydCB0cmFuc2Zvcm1XaXRoIGZyb20gJ2JhYmVsLXBsdWdpbi10cmFuc2Zvcm0td2l0aCdcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZWpzIGZyb20gJ2VqcydcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQge21pbmlmeSBhcyBtaW5pZnlIVE1MfSBmcm9tICdodG1sLW1pbmlmaWVyJ1xuaW1wb3J0ICogYXMgbG9hZGVyVXRpbHMgZnJvbSAnbG9hZGVyLXV0aWxzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuaW1wb3J0IGNvbmZpZ3VyYXRpb24gZnJvbSAnLi9jb25maWd1cmF0b3IuY29tcGlsZWQnXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gdHlwZXNcbnR5cGUgVGVtcGxhdGVGdW5jdGlvbiA9IChsb2NhbHM6T2JqZWN0KSA9PiBzdHJpbmdcbnR5cGUgQ29tcGlsZUZ1bmN0aW9uID0gKFxuICAgIHRlbXBsYXRlOnN0cmluZywgb3B0aW9uczpPYmplY3QsIGNvbXBpbGVTdGVwcz86bnVtYmVyXG4pID0+IFRlbXBsYXRlRnVuY3Rpb25cbi8vIGVuZHJlZ2lvblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzb3VyY2U6c3RyaW5nKTpzdHJpbmcge1xuICAgIGlmICgnY2FjaGFibGUnIGluIHRoaXMgJiYgdGhpcy5jYWNoZWFibGUpXG4gICAgICAgIHRoaXMuY2FjaGVhYmxlKClcbiAgICBjb25zdCBxdWVyeTpPYmplY3QgPSBUb29scy5jb252ZXJ0U3Vic3RyaW5nSW5QbGFpbk9iamVjdChcbiAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgICAgICAgICAgICBodG1sOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgamF2YVNjcmlwdDoge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbnRleHQ6ICcuLycsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uczoge1xuICAgICAgICAgICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlcm5hbDogWycuanMnXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVybmFsOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5qcycsICcuanNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5jc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuc3ZnJywgJy5wbmcnLCAnLmpwZycsICcuZ2lmJywgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJy5lb3QnLCAnLnR0ZicsICcud29mZidcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudHM6IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgfHwge30sXG4gICAgICAgICAgICAncXVlcnknIGluIHRoaXMgPyBsb2FkZXJVdGlscy5nZXRPcHRpb25zKHRoaXMpIHx8IHt9IDoge31cbiAgICAgICAgKSwgLyMlJSUjL2csICchJylcbiAgICBjb25zdCBjb21waWxlOkNvbXBpbGVGdW5jdGlvbiA9IChcbiAgICAgICAgdGVtcGxhdGU6c3RyaW5nLCBvcHRpb25zOk9iamVjdCA9IHF1ZXJ5LmNvbXBpbGVyLFxuICAgICAgICBjb21waWxlU3RlcHM6bnVtYmVyID0gMlxuICAgICk6VGVtcGxhdGVGdW5jdGlvbiA9PiAobG9jYWxzOk9iamVjdCA9IHt9KTpzdHJpbmcgPT4ge1xuICAgICAgICBvcHRpb25zID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtmaWxlbmFtZTogdGVtcGxhdGV9LCBvcHRpb25zKVxuICAgICAgICBjb25zdCByZXF1aXJlOkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgcmVxdWVzdDpzdHJpbmcsIG5lc3RlZExvY2FsczpPYmplY3QgPSB7fVxuICAgICAgICApOnN0cmluZyA9PiB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZTpzdHJpbmcgPSByZXF1ZXN0LnJlcGxhY2UoL14oLispXFw/W14/XSskLywgJyQxJylcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5TWF0Y2g6P0FycmF5PHN0cmluZz4gPSByZXF1ZXN0Lm1hdGNoKC9eW14/XStcXD8oLispJC8pXG4gICAgICAgICAgICBpZiAocXVlcnlNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdDpzdHJpbmcsIHRlbXBsYXRlOnN0cmluZywgc291cmNlOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZTpDb21waWxlRnVuY3Rpb24sIGxvY2FsczpPYmplY3RcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICApOk9iamVjdCA9PiBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICdyZXF1ZXN0JywgJ3RlbXBsYXRlJywgJ3NvdXJjZScsICdjb21waWxlJywgJ2xvY2FscycsXG4gICAgICAgICAgICAgICAgICAgIGByZXR1cm4gJHtxdWVyeU1hdGNoWzFdfWBcbiAgICAgICAgICAgICAgICApKHJlcXVlc3QsIHRlbXBsYXRlLCBzb3VyY2UsIGNvbXBpbGUsIGxvY2FscylcbiAgICAgICAgICAgICAgICBuZXN0ZWRMb2NhbHMgPSBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHRydWUsIG5lc3RlZExvY2FscywgZXZhbHVhdGlvbkZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCwgdGVtcGxhdGUsIHNvdXJjZSwgY29tcGlsZSwgbG9jYWxzKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBuZXN0ZWRPcHRpb25zOk9iamVjdCA9IFRvb2xzLmNvcHkob3B0aW9ucylcbiAgICAgICAgICAgIGRlbGV0ZSBuZXN0ZWRPcHRpb25zLmNsaWVudFxuICAgICAgICAgICAgbmVzdGVkT3B0aW9ucyA9IFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgICAgICB0cnVlLCB7ZW5jb2Rpbmc6IGNvbmZpZ3VyYXRpb24uZW5jb2Rpbmd9LCBuZXN0ZWRPcHRpb25zLFxuICAgICAgICAgICAgICAgIG5lc3RlZExvY2Fscy5vcHRpb25zIHx8IHt9KVxuICAgICAgICAgICAgaWYgKG5lc3RlZE9wdGlvbnMuaXNTdHJpbmcpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGUodGVtcGxhdGUsIG5lc3RlZE9wdGlvbnMpKG5lc3RlZExvY2FscylcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlRmlsZVBhdGg6P3N0cmluZyA9XG4gICAgICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSwgcXVlcnkubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5Lm1vZHVsZS5yZXBsYWNlbWVudHMsIHF1ZXJ5LmV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmNvbnRleHQsIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZylcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZUZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdxdWVyeScgaW4gdGhpcylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGREZXBlbmRlbmN5KHRlbXBsYXRlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogSWYgdGhlcmUgYXJlbid0IGFueSBsb2NhbHMgb3B0aW9ucyBvciB2YXJpYWJsZXMgYW5kXG4gICAgICAgICAgICAgICAgICAgIGZpbGUgZG9lc24ndCBzZWVtIHRvIGJlIGFuIGVqcyB0ZW1wbGF0ZSB3ZSBzaW1wbHkgbG9hZFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlZCBmaWxlIGNvbnRlbnQuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAocXVlcnlNYXRjaCB8fCB0ZW1wbGF0ZUZpbGVQYXRoLmVuZHNXaXRoKCcuZWpzJykpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlKHRlbXBsYXRlRmlsZVBhdGgsIG5lc3RlZE9wdGlvbnMpKFxuICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGVkTG9jYWxzKVxuICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyh0ZW1wbGF0ZUZpbGVQYXRoLCBuZXN0ZWRPcHRpb25zKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBHaXZlbiB0ZW1wbGF0ZSBmaWxlIFwiJHt0ZW1wbGF0ZX1cIiBjb3VsZG4ndCBiZSByZXNvbHZlZC5gKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbXByZXNzSFRNTDpGdW5jdGlvbiA9IChjb250ZW50OnN0cmluZyk6c3RyaW5nID0+XG4gICAgICAgICAgICBxdWVyeS5jb21wcmVzcy5odG1sID8gbWluaWZ5SFRNTChjb250ZW50LCBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICAgICAgdHJ1ZSwge1xuICAgICAgICAgICAgICAgICAgICBjYXNlU2Vuc2l0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZUlubGluZVRhZ1doaXRlc3BhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlV2hpdGVzcGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29uc2VydmF0aXZlQ29sbGFwc2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbmlmeUNTUzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluaWZ5SlM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NTY3JpcHRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAndGV4dC9uZy10ZW1wbGF0ZScsICd0ZXh0L3gtaGFuZGxlYmFycy10ZW1wbGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXR0cmlidXRlUXVvdGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVDb21tZW50czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlUmVkdW5kYW50QXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlU2NyaXB0VHlwZUF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVN0eWxlTGlua1R5cGVBdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzb3J0QXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc29ydENsYXNzTmFtZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogQXZvaWRzIHdoaXRlc3BhY2UgYXJvdW5kIHBsYWNlaG9sZGVyIGluIHRhZ3MuXG4gICAgICAgICAgICAgICAgICAgIHRyaW1DdXN0b21GcmFnbWVudHM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHVzZVNob3J0RG9jdHlwZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sIHF1ZXJ5LmNvbXByZXNzLmh0bWwpKSA6IGNvbnRlbnRcbiAgICAgICAgbGV0IHJlbWFpbmluZ1N0ZXBzOm51bWJlciA9IGNvbXBpbGVTdGVwc1xuICAgICAgICBsZXQgcmVzdWx0OlRlbXBsYXRlRnVuY3Rpb258c3RyaW5nID0gdGVtcGxhdGVcbiAgICAgICAgbGV0IGlzU3RyaW5nOmJvb2xlYW4gPSBvcHRpb25zLmlzU3RyaW5nXG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLmlzU3RyaW5nXG4gICAgICAgIHdoaWxlIChyZW1haW5pbmdTdGVwcyA+IDApIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBpc1N0cmluZyAmJiBvcHRpb25zLmZpbGVuYW1lIHx8IHJlc3VsdFxuICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aCAmJiBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSAnLmpzJylcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZXZhbCgncmVxdWlyZScpKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW5jb2Rpbmc6c3RyaW5nID0gY29uZmlndXJhdGlvbi5lbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdlbmNvZGluZycgaW4gb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZyA9IG9wdGlvbnMuZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKHJlc3VsdCwge2VuY29kaW5nfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nU3RlcHMgPT09IDEpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBjb21wcmVzc0hUTUwocmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBlanMuY29tcGlsZShyZXN1bHQsIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY29tcHJlc3NIVE1MKHJlc3VsdChUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge1xuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLCBIZWxwZXIsIGluY2x1ZGU6IHJlcXVpcmUsIHJlcXVpcmUsIFRvb2xzXG4gICAgICAgICAgICAgICAgfSwgbG9jYWxzKSkpXG4gICAgICAgICAgICByZW1haW5pbmdTdGVwcyAtPSAxXG4gICAgICAgIH1cbiAgICAgICAgaWYgKEJvb2xlYW4oY29tcGlsZVN0ZXBzICUgMikpXG4gICAgICAgICAgICByZXR1cm4gYCd1c2Ugc3RyaWN0JztcXG5gICsgYmFiZWxUcmFuc2Zvcm0oXG4gICAgICAgICAgICAgICAgYG1vZHVsZS5leHBvcnRzID0gJHtyZXN1bHQudG9TdHJpbmcoKX07YCwge1xuICAgICAgICAgICAgICAgICAgICBhc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudHM6ICFCb29sZWFuKHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgICAgICBjb21wYWN0OiBCb29sZWFuKHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogb3B0aW9ucy5maWxlbmFtZSB8fCAndW5rbm93bicsXG4gICAgICAgICAgICAgICAgICAgIG1pbmlmaWVkOiBCb29sZWFuKHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5zOiBbdHJhbnNmb3JtV2l0aF0sXG4gICAgICAgICAgICAgICAgICAgIHByZXNldHM6IHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHQgPyBbW1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFiZWxNaW5pZnlQcmVzZXQsIHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgXV0gOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlTWFwczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZVR5cGU6ICdzY3JpcHQnXG4gICAgICAgICAgICAgICAgfSkuY29kZVxuICAgICAgICByZXN1bHQgPSByZXN1bHRcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgYDxzY3JpcHQgK3Byb2Nlc3Npbmctd29ya2Fyb3VuZCAqKD86PSAqKD86XCIgKlwifCcgKicpICopPz5gICtcbiAgICAgICAgICAgICAgICAnKFtcXFxcc1xcXFxTXSo/KTwvICpzY3JpcHQgKj4nLCAnaWcnXG4gICAgICAgICAgICApLCAnJDEnKVxuICAgICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICBgPHNjcmlwdCArcHJvY2Vzc2luZygtKyktd29ya2Fyb3VuZCAqKD86PSAqKD86XCIgKlwifCcgKicpICopP2AgK1xuICAgICAgICAgICAgICAgICc+KFtcXFxcc1xcXFxTXSo/KTwvICpzY3JpcHQgKj4nLFxuICAgICAgICAgICAgICAgICdpZydcbiAgICAgICAgICAgICksICc8c2NyaXB0IHByb2Nlc3NpbmckMXdvcmthcm91bmQ+JDI8L3NjcmlwdD4nKVxuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZShzb3VyY2UsIHtcbiAgICAgICAgY2xpZW50OiBCb29sZWFuKHF1ZXJ5LmNvbXBpbGVTdGVwcyAlIDIpLFxuICAgICAgICBjb21waWxlRGVidWc6IHRoaXMuZGVidWcgfHwgZmFsc2UsXG4gICAgICAgIGRlYnVnOiB0aGlzLmRlYnVnIHx8IGZhbHNlLFxuICAgICAgICBmaWxlbmFtZTogJ3F1ZXJ5JyBpbiB0aGlzID8gbG9hZGVyVXRpbHMuZ2V0UmVtYWluaW5nUmVxdWVzdChcbiAgICAgICAgICAgIHRoaXNcbiAgICAgICAgKS5yZXBsYWNlKC9eIS8sICcnKSA6IHRoaXMuZmlsZW5hbWUgfHwgbnVsbCxcbiAgICAgICAgaXNTdHJpbmc6IHRydWVcbiAgICB9LCBxdWVyeS5jb21waWxlU3RlcHMpKHF1ZXJ5LmxvY2FscyB8fCB7fSlcbn1cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19