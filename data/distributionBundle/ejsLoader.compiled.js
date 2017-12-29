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

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}
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
                internal: ['.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.json', '.eot', '.ttf', '.woff']
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
                var nestedOptions = _clientnode2.default.copyLimitedRecursively(options);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LG1CQUFPLE1BQVA7QUFDSCxTQXZJK0I7QUFBQSxLQUFoQztBQXdJQSxXQUFPLFFBQVEsTUFBUixFQUFnQjtBQUNuQixnQkFBUSxRQUFRLE1BQU0sWUFBTixHQUFxQixDQUE3QixDQURXO0FBRW5CLHNCQUFjLEtBQUssS0FBTCxJQUFjLEtBRlQ7QUFHbkIsZUFBTyxLQUFLLEtBQUwsSUFBYyxLQUhGO0FBSW5CLGtCQUFVLFdBQVcsSUFBWCxHQUFrQixZQUFZLG1CQUFaLENBQ3hCLElBRHdCLEVBRTFCLE9BRjBCLENBRWxCLElBRmtCLEVBRVosRUFGWSxDQUFsQixHQUVZLEtBQUssUUFBTCxJQUFpQixJQU5wQjtBQU9uQixrQkFBVTtBQVBTLEtBQWhCLEVBUUosTUFBTSxZQVJGLEVBUWdCLE1BQU0sTUFBTixJQUFnQixFQVJoQyxDQUFQO0FBU0gsQ0E5S0Q7QUErS0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZWpzTG9hZGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHt0cmFuc2Zvcm0gYXMgYmFiZWxUcmFuc2Zvcm19IGZyb20gJ2JhYmVsLWNvcmUnXG5pbXBvcnQgYmFiZWxNaW5pZnlQcmVzZXQgZnJvbSAnYmFiZWwtcHJlc2V0LW1pbmlmeSdcbmltcG9ydCB0cmFuc2Zvcm1XaXRoIGZyb20gJ2JhYmVsLXBsdWdpbi10cmFuc2Zvcm0td2l0aCdcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZWpzIGZyb20gJ2VqcydcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQge21pbmlmeSBhcyBtaW5pZnlIVE1MfSBmcm9tICdodG1sLW1pbmlmaWVyJ1xuaW1wb3J0ICogYXMgbG9hZGVyVXRpbHMgZnJvbSAnbG9hZGVyLXV0aWxzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbi8vIE5PVEU6IE9ubHkgbmVlZGVkIGZvciBkZWJ1Z2dpbmcgdGhpcyBmaWxlLlxudHJ5IHtcbiAgICByZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInKVxufSBjYXRjaCAoZXJyb3IpIHt9XG5cbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yLmNvbXBpbGVkJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHR5cGVzXG50eXBlIFRlbXBsYXRlRnVuY3Rpb24gPSAobG9jYWxzOk9iamVjdCkgPT4gc3RyaW5nXG50eXBlIENvbXBpbGVGdW5jdGlvbiA9IChcbiAgICB0ZW1wbGF0ZTpzdHJpbmcsIG9wdGlvbnM6T2JqZWN0LCBjb21waWxlU3RlcHM/Om51bWJlclxuKSA9PiBUZW1wbGF0ZUZ1bmN0aW9uXG4vLyBlbmRyZWdpb25cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc291cmNlOnN0cmluZyk6c3RyaW5nIHtcbiAgICBpZiAoJ2NhY2hhYmxlJyBpbiB0aGlzICYmIHRoaXMuY2FjaGVhYmxlKVxuICAgICAgICB0aGlzLmNhY2hlYWJsZSgpXG4gICAgY29uc3QgcXVlcnk6T2JqZWN0ID0gVG9vbHMuY29udmVydFN1YnN0cmluZ0luUGxhaW5PYmplY3QoXG4gICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgICAgICAgIGh0bWw6IHt9LFxuICAgICAgICAgICAgICAgIGphdmFTY3JpcHQ6IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGV4dDogJy4vJyxcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5qcyddLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJy5qcycsICcuY3NzJywgJy5zdmcnLCAnLnBuZycsICcuanBnJywgJy5naWYnLCAnLmljbycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnLmh0bWwnLCAnLmpzb24nLCAnLmVvdCcsICcudHRmJywgJy53b2ZmJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtb2R1bGU6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICAgICAgYWxpYXNlczoge30sXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzOiB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICB9LCB0aGlzLm9wdGlvbnMgfHwge30sICdxdWVyeScgaW4gdGhpcyA/IGxvYWRlclV0aWxzLmdldE9wdGlvbnMoXG4gICAgICAgICAgICB0aGlzXG4gICAgICAgICkgfHwge30gOiB7fSksXG4gICAgICAgIC8jJSUlIy9nLCAnIScpXG4gICAgY29uc3QgY29tcGlsZTpDb21waWxlRnVuY3Rpb24gPSAoXG4gICAgICAgIHRlbXBsYXRlOnN0cmluZywgb3B0aW9uczpPYmplY3QgPSBxdWVyeS5jb21waWxlcixcbiAgICAgICAgY29tcGlsZVN0ZXBzOm51bWJlciA9IDJcbiAgICApOlRlbXBsYXRlRnVuY3Rpb24gPT4gKGxvY2FsczpPYmplY3QgPSB7fSk6c3RyaW5nID0+IHtcbiAgICAgICAgb3B0aW9ucyA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7ZmlsZW5hbWU6IHRlbXBsYXRlfSwgb3B0aW9ucylcbiAgICAgICAgY29uc3QgcmVxdWlyZTpGdW5jdGlvbiA9IChcbiAgICAgICAgICAgIHJlcXVlc3Q6c3RyaW5nLCBuZXN0ZWRMb2NhbHM6T2JqZWN0ID0ge31cbiAgICAgICAgKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGU6c3RyaW5nID0gcmVxdWVzdC5yZXBsYWNlKC9eKC4rKVxcP1teP10rJC8sICckMScpXG4gICAgICAgICAgICBjb25zdCBxdWVyeU1hdGNoOj9BcnJheTxzdHJpbmc+ID0gcmVxdWVzdC5tYXRjaCgvXlteP10rXFw/KC4rKSQvKVxuICAgICAgICAgICAgaWYgKHF1ZXJ5TWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3Q6c3RyaW5nLCB0ZW1wbGF0ZTpzdHJpbmcsIHNvdXJjZTpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGU6Q29tcGlsZUZ1bmN0aW9uLCBsb2NhbHM6T2JqZWN0XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgKTpPYmplY3QgPT4gbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAncmVxdWVzdCcsICd0ZW1wbGF0ZScsICdzb3VyY2UnLCAnY29tcGlsZScsICdsb2NhbHMnLFxuICAgICAgICAgICAgICAgICAgICBgcmV0dXJuICR7cXVlcnlNYXRjaFsxXX1gXG4gICAgICAgICAgICAgICAgKShyZXF1ZXN0LCB0ZW1wbGF0ZSwgc291cmNlLCBjb21waWxlLCBsb2NhbHMpXG4gICAgICAgICAgICAgICAgbmVzdGVkTG9jYWxzID0gVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgICAgICAgICB0cnVlLCBuZXN0ZWRMb2NhbHMsIGV2YWx1YXRpb25GdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QsIHRlbXBsYXRlLCBzb3VyY2UsIGNvbXBpbGUsIGxvY2FscykpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbmVzdGVkT3B0aW9uczpPYmplY3QgPSBUb29scy5jb3B5TGltaXRlZFJlY3Vyc2l2ZWx5KG9wdGlvbnMpXG4gICAgICAgICAgICBkZWxldGUgbmVzdGVkT3B0aW9ucy5jbGllbnRcbiAgICAgICAgICAgIG5lc3RlZE9wdGlvbnMgPSBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICAgICAgdHJ1ZSwge2VuY29kaW5nOiBjb25maWd1cmF0aW9uLmVuY29kaW5nfSwgbmVzdGVkT3B0aW9ucyxcbiAgICAgICAgICAgICAgICBuZXN0ZWRMb2NhbHMub3B0aW9ucyB8fCB7fSlcbiAgICAgICAgICAgIGlmIChuZXN0ZWRPcHRpb25zLmlzU3RyaW5nKVxuICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlKHRlbXBsYXRlLCBuZXN0ZWRPcHRpb25zKShuZXN0ZWRMb2NhbHMpXG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZUZpbGVQYXRoOj9zdHJpbmcgPVxuICAgICAgICAgICAgICAgIEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUsIHF1ZXJ5Lm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICAgICAgICAgICAgICBxdWVyeS5tb2R1bGUucmVwbGFjZW1lbnRzLCBxdWVyeS5leHRlbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICBxdWVyeS5jb250ZXh0LCBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmcpXG4gICAgICAgICAgICBpZiAodGVtcGxhdGVGaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgIGlmICgncXVlcnknIGluIHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRGVwZW5kZW5jeSh0ZW1wbGF0ZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IElmIHRoZXJlIGFyZW4ndCBhbnkgbG9jYWxzIG9wdGlvbnMgb3IgdmFyaWFibGVzIGFuZFxuICAgICAgICAgICAgICAgICAgICBmaWxlIGRvZXNuJ3Qgc2VlbSB0byBiZSBhbiBlanMgdGVtcGxhdGUgd2Ugc2ltcGx5IGxvYWRcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZWQgZmlsZSBjb250ZW50LlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5TWF0Y2ggfHwgdGVtcGxhdGVGaWxlUGF0aC5lbmRzV2l0aCgnLmVqcycpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZSh0ZW1wbGF0ZUZpbGVQYXRoLCBuZXN0ZWRPcHRpb25zKShcbiAgICAgICAgICAgICAgICAgICAgICAgIG5lc3RlZExvY2FscylcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmModGVtcGxhdGVGaWxlUGF0aCwgbmVzdGVkT3B0aW9ucylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgR2l2ZW4gdGVtcGxhdGUgZmlsZSBcIiR7dGVtcGxhdGV9XCIgY291bGRuJ3QgYmUgcmVzb2x2ZWQuYClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb21wcmVzc0hUTUw6RnVuY3Rpb24gPSAoY29udGVudDpzdHJpbmcpOnN0cmluZyA9PlxuICAgICAgICAgICAgcXVlcnkuY29tcHJlc3MuaHRtbCA/IG1pbmlmeUhUTUwoY29udGVudCwgVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgICAgIHRydWUsIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZVNlbnNpdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VJbmxpbmVUYWdXaGl0ZXNwYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZVdoaXRlc3BhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnNlcnZhdGl2ZUNvbGxhcHNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5pZnlDU1M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbmlmeUpTOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzU2NyaXB0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3RleHQvbmctdGVtcGxhdGUnLCAndGV4dC94LWhhbmRsZWJhcnMtdGVtcGxhdGUnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUF0dHJpYnV0ZVF1b3RlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQ29tbWVudHM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVJlZHVuZGFudEF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVNjcmlwdFR5cGVBdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVTdHlsZUxpbmtUeXBlQXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc29ydEF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNvcnRDbGFzc05hbWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IEF2b2lkcyB3aGl0ZXNwYWNlIGFyb3VuZCBwbGFjZWhvbGRlciBpbiB0YWdzLlxuICAgICAgICAgICAgICAgICAgICB0cmltQ3VzdG9tRnJhZ21lbnRzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB1c2VTaG9ydERvY3R5cGU6IHRydWVcbiAgICAgICAgICAgICAgICB9LCBxdWVyeS5jb21wcmVzcy5odG1sKSkgOiBjb250ZW50XG4gICAgICAgIGxldCByZW1haW5pbmdTdGVwczpudW1iZXIgPSBjb21waWxlU3RlcHNcbiAgICAgICAgbGV0IHJlc3VsdDpUZW1wbGF0ZUZ1bmN0aW9ufHN0cmluZyA9IHRlbXBsYXRlXG4gICAgICAgIGxldCBpc1N0cmluZzpib29sZWFuID0gb3B0aW9ucy5pc1N0cmluZ1xuICAgICAgICBkZWxldGUgb3B0aW9ucy5pc1N0cmluZ1xuICAgICAgICB3aGlsZSAocmVtYWluaW5nU3RlcHMgPiAwKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID0gaXNTdHJpbmcgJiYgb3B0aW9ucy5maWxlbmFtZSB8fCByZXN1bHRcbiAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGggJiYgcGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT0gJy5qcycpXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGV2YWwoJ3JlcXVpcmUnKShmaWxlUGF0aClcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1N0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVuY29kaW5nOnN0cmluZyA9IGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgnZW5jb2RpbmcnIGluIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RpbmcgPSBvcHRpb25zLmVuY29kaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhyZXN1bHQsIHtlbmNvZGluZ30pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ1N0ZXBzID09PSAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY29tcHJlc3NIVE1MKHJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZWpzLmNvbXBpbGUocmVzdWx0LCBvcHRpb25zKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNvbXByZXNzSFRNTChyZXN1bHQoVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgSGVscGVyLCBpbmNsdWRlOiByZXF1aXJlLCByZXF1aXJlLCBUb29sc1xuICAgICAgICAgICAgICAgIH0sIGxvY2FscykpKVxuICAgICAgICAgICAgcmVtYWluaW5nU3RlcHMgLT0gMVxuICAgICAgICB9XG4gICAgICAgIGlmIChCb29sZWFuKGNvbXBpbGVTdGVwcyAlIDIpKVxuICAgICAgICAgICAgcmV0dXJuIGAndXNlIHN0cmljdCc7XFxuYCArIGJhYmVsVHJhbnNmb3JtKFxuICAgICAgICAgICAgICAgIGBtb2R1bGUuZXhwb3J0cyA9ICR7cmVzdWx0LnRvU3RyaW5nKCl9O2AsIHtcbiAgICAgICAgICAgICAgICAgICAgYXN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYmFiZWxyYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzOiAhQm9vbGVhbihxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGFjdDogQm9vbGVhbihxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IG9wdGlvbnMuZmlsZW5hbWUgfHwgJ3Vua25vd24nLFxuICAgICAgICAgICAgICAgICAgICBtaW5pZmllZDogQm9vbGVhbihxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luczogW3RyYW5zZm9ybVdpdGhdLFxuICAgICAgICAgICAgICAgICAgICBwcmVzZXRzOiBxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0ID8gW1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhYmVsTWluaWZ5UHJlc2V0LCBxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgIF1dIDogW10sXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZU1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VUeXBlOiAnc2NyaXB0J1xuICAgICAgICAgICAgICAgIH0pLmNvZGVcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0XG4gICAgICAgICAgICAucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgIGA8c2NyaXB0ICtwcm9jZXNzaW5nLXdvcmthcm91bmQgKig/Oj0gKig/OlwiICpcInwnIConKSAqKT8+YCArXG4gICAgICAgICAgICAgICAgJyhbXFxcXHNcXFxcU10qPyk8LyAqc2NyaXB0ICo+JywgJ2lnJ1xuICAgICAgICAgICAgKSwgJyQxJylcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgYDxzY3JpcHQgK3Byb2Nlc3NpbmcoLSspLXdvcmthcm91bmQgKig/Oj0gKig/OlwiICpcInwnIConKSAqKT9gICtcbiAgICAgICAgICAgICAgICAnPihbXFxcXHNcXFxcU10qPyk8LyAqc2NyaXB0ICo+JyxcbiAgICAgICAgICAgICAgICAnaWcnXG4gICAgICAgICAgICApLCAnPHNjcmlwdCBwcm9jZXNzaW5nJDF3b3JrYXJvdW5kPiQyPC9zY3JpcHQ+JylcbiAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBpbGUoc291cmNlLCB7XG4gICAgICAgIGNsaWVudDogQm9vbGVhbihxdWVyeS5jb21waWxlU3RlcHMgJSAyKSxcbiAgICAgICAgY29tcGlsZURlYnVnOiB0aGlzLmRlYnVnIHx8IGZhbHNlLFxuICAgICAgICBkZWJ1ZzogdGhpcy5kZWJ1ZyB8fCBmYWxzZSxcbiAgICAgICAgZmlsZW5hbWU6ICdxdWVyeScgaW4gdGhpcyA/IGxvYWRlclV0aWxzLmdldFJlbWFpbmluZ1JlcXVlc3QoXG4gICAgICAgICAgICB0aGlzXG4gICAgICAgICkucmVwbGFjZSgvXiEvLCAnJykgOiB0aGlzLmZpbGVuYW1lIHx8IG51bGwsXG4gICAgICAgIGlzU3RyaW5nOiB0cnVlXG4gICAgfSwgcXVlcnkuY29tcGlsZVN0ZXBzKShxdWVyeS5sb2NhbHMgfHwge30pXG59XG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==