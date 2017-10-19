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
            }, module: []
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUwsSUFBYyxLQUhGO0FBSW5CLGtCQUFVLFdBQVcsSUFBWCxHQUFrQixZQUFZLG1CQUFaLENBQ3hCLElBRHdCLEVBRTFCLE9BRjBCLENBRWxCLElBRmtCLEVBRVosRUFGWSxDQUFsQixHQUVZLEtBQUssUUFBTCxJQUFpQixJQU5wQjtBQU9uQixrQkFBVTtBQVBTLEtBQWhCLEVBUUosTUFBTSxZQVJGLEVBUWdCLE1BQU0sTUFBTixJQUFnQixFQVJoQyxDQUFQO0FBU0gsQ0FuS0Q7QUFvS0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZWpzTG9hZGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHt0cmFuc2Zvcm0gYXMgYmFiZWxUcmFuc2Zvcm19IGZyb20gJ2JhYmVsLWNvcmUnXG5pbXBvcnQgYmFiZWxNaW5pZnlQcmVzZXQgZnJvbSAnYmFiZWwtcHJlc2V0LW1pbmlmeSdcbmltcG9ydCB0cmFuc2Zvcm1XaXRoIGZyb20gJ2JhYmVsLXBsdWdpbi10cmFuc2Zvcm0td2l0aCdcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZWpzIGZyb20gJ2VqcydcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQge21pbmlmeSBhcyBtaW5pZnlIVE1MfSBmcm9tICdodG1sLW1pbmlmaWVyJ1xuaW1wb3J0ICogYXMgbG9hZGVyVXRpbHMgZnJvbSAnbG9hZGVyLXV0aWxzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbi8vIE5PVEU6IE9ubHkgbmVlZGVkIGZvciBkZWJ1Z2dpbmcgdGhpcyBmaWxlLlxudHJ5IHtcbiAgICByZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInKVxufSBjYXRjaCAoZXJyb3IpIHt9XG5cbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yLmNvbXBpbGVkJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHR5cGVzXG50eXBlIFRlbXBsYXRlRnVuY3Rpb24gPSAobG9jYWxzOk9iamVjdCkgPT4gc3RyaW5nXG50eXBlIENvbXBpbGVGdW5jdGlvbiA9IChcbiAgICB0ZW1wbGF0ZTpzdHJpbmcsIG9wdGlvbnM6T2JqZWN0LCBjb21waWxlU3RlcHM/Om51bWJlclxuKSA9PiBUZW1wbGF0ZUZ1bmN0aW9uXG4vLyBlbmRyZWdpb25cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc291cmNlOnN0cmluZyk6c3RyaW5nIHtcbiAgICBpZiAoJ2NhY2hhYmxlJyBpbiB0aGlzICYmIHRoaXMuY2FjaGVhYmxlKVxuICAgICAgICB0aGlzLmNhY2hlYWJsZSgpXG4gICAgY29uc3QgcXVlcnk6T2JqZWN0ID0gVG9vbHMuY29udmVydFN1YnN0cmluZ0luUGxhaW5PYmplY3QoXG4gICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgICAgICAgIGh0bWw6IHt9LFxuICAgICAgICAgICAgICAgIGphdmFTY3JpcHQ6IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udGV4dDogJy4vJyxcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5qcyddLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJy5qcycsICcuY3NzJywgJy5zdmcnLCAnLnBuZycsICcuanBnJywgJy5naWYnLCAnLmljbycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnLmh0bWwnLCAnLmpzb24nLCAnLmVvdCcsICcudHRmJywgJy53b2ZmJ1xuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSwgbW9kdWxlOiBbXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgICAgIGFsaWFzZXM6IHt9LFxuICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50czoge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zIHx8IHt9LCAncXVlcnknIGluIHRoaXMgPyBsb2FkZXJVdGlscy5nZXRPcHRpb25zKFxuICAgICAgICAgICAgdGhpc1xuICAgICAgICApIHx8IHt9IDoge30pLFxuICAgICAgICAvIyUlJSMvZywgJyEnKVxuICAgIGNvbnN0IGNvbXBpbGU6Q29tcGlsZUZ1bmN0aW9uID0gKFxuICAgICAgICB0ZW1wbGF0ZTpzdHJpbmcsIG9wdGlvbnM6T2JqZWN0ID0gcXVlcnkuY29tcGlsZXIsXG4gICAgICAgIGNvbXBpbGVTdGVwczpudW1iZXIgPSAyXG4gICAgKTpUZW1wbGF0ZUZ1bmN0aW9uID0+IChsb2NhbHM6T2JqZWN0ID0ge30pOnN0cmluZyA9PiB7XG4gICAgICAgIG9wdGlvbnMgPSBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge2ZpbGVuYW1lOiB0ZW1wbGF0ZX0sIG9wdGlvbnMpXG4gICAgICAgIGNvbnN0IHJlcXVpcmU6RnVuY3Rpb24gPSAoXG4gICAgICAgICAgICByZXF1ZXN0OnN0cmluZywgbmVzdGVkTG9jYWxzOk9iamVjdCA9IHt9XG4gICAgICAgICk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlOnN0cmluZyA9IHJlcXVlc3QucmVwbGFjZSgvXiguKylcXD9bXj9dKyQvLCAnJDEnKVxuICAgICAgICAgICAgY29uc3QgcXVlcnlNYXRjaDo/QXJyYXk8c3RyaW5nPiA9IHJlcXVlc3QubWF0Y2goL15bXj9dK1xcPyguKykkLylcbiAgICAgICAgICAgIGlmIChxdWVyeU1hdGNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZhbHVhdGlvbkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0OnN0cmluZywgdGVtcGxhdGU6c3RyaW5nLCBzb3VyY2U6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBjb21waWxlOkNvbXBpbGVGdW5jdGlvbiwgbG9jYWxzOk9iamVjdFxuICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgICk6T2JqZWN0ID0+IG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgJ3JlcXVlc3QnLCAndGVtcGxhdGUnLCAnc291cmNlJywgJ2NvbXBpbGUnLCAnbG9jYWxzJyxcbiAgICAgICAgICAgICAgICAgICAgYHJldHVybiAke3F1ZXJ5TWF0Y2hbMV19YFxuICAgICAgICAgICAgICAgICkocmVxdWVzdCwgdGVtcGxhdGUsIHNvdXJjZSwgY29tcGlsZSwgbG9jYWxzKVxuICAgICAgICAgICAgICAgIG5lc3RlZExvY2FscyA9IFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZSwgbmVzdGVkTG9jYWxzLCBldmFsdWF0aW9uRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LCB0ZW1wbGF0ZSwgc291cmNlLCBjb21waWxlLCBsb2NhbHMpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IG5lc3RlZE9wdGlvbnM6T2JqZWN0ID0gVG9vbHMuY29weUxpbWl0ZWRSZWN1cnNpdmVseShvcHRpb25zKVxuICAgICAgICAgICAgZGVsZXRlIG5lc3RlZE9wdGlvbnMuY2xpZW50XG4gICAgICAgICAgICBuZXN0ZWRPcHRpb25zID0gVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgICAgIHRydWUsIHtlbmNvZGluZzogY29uZmlndXJhdGlvbi5lbmNvZGluZ30sIG5lc3RlZE9wdGlvbnMsXG4gICAgICAgICAgICAgICAgbmVzdGVkTG9jYWxzLm9wdGlvbnMgfHwge30pXG4gICAgICAgICAgICBpZiAobmVzdGVkT3B0aW9ucy5pc1N0cmluZylcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZSh0ZW1wbGF0ZSwgbmVzdGVkT3B0aW9ucykobmVzdGVkTG9jYWxzKVxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGVGaWxlUGF0aDo/c3RyaW5nID1cbiAgICAgICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlLCBxdWVyeS5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgcXVlcnkubW9kdWxlLnJlcGxhY2VtZW50cywgcXVlcnkuZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgcXVlcnkuY29udGV4dCwgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nKVxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlRmlsZVBhdGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3F1ZXJ5JyBpbiB0aGlzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZERlcGVuZGVuY3kodGVtcGxhdGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBOT1RFOiBJZiB0aGVyZSBhcmVuJ3QgYW55IGxvY2FscyBvcHRpb25zIG9yIHZhcmlhYmxlcyBhbmRcbiAgICAgICAgICAgICAgICAgICAgZmlsZSBkb2Vzbid0IHNlZW0gdG8gYmUgYW4gZWpzIHRlbXBsYXRlIHdlIHNpbXBseSBsb2FkXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVkIGZpbGUgY29udGVudC5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChxdWVyeU1hdGNoIHx8IHRlbXBsYXRlRmlsZVBhdGguZW5kc1dpdGgoJy5lanMnKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGUodGVtcGxhdGVGaWxlUGF0aCwgbmVzdGVkT3B0aW9ucykoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWRMb2NhbHMpXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKHRlbXBsYXRlRmlsZVBhdGgsIG5lc3RlZE9wdGlvbnMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEdpdmVuIHRlbXBsYXRlIGZpbGUgXCIke3RlbXBsYXRlfVwiIGNvdWxkbid0IGJlIHJlc29sdmVkLmApXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29tcHJlc3NIVE1MOkZ1bmN0aW9uID0gKGNvbnRlbnQ6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgIHF1ZXJ5LmNvbXByZXNzLmh0bWwgPyBtaW5pZnlIVE1MKGNvbnRlbnQsIFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgICAgICB0cnVlLCB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2VTZW5zaXRpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlSW5saW5lVGFnV2hpdGVzcGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VXaGl0ZXNwYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb25zZXJ2YXRpdmVDb2xsYXBzZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluaWZ5Q1NTOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5pZnlKUzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1NjcmlwdHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICd0ZXh0L25nLXRlbXBsYXRlJywgJ3RleHQveC1oYW5kbGViYXJzLXRlbXBsYXRlJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVBdHRyaWJ1dGVRdW90ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUNvbW1lbnRzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVSZWR1bmRhbnRBdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVTY3JpcHRUeXBlQXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlU3R5bGVMaW5rVHlwZUF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNvcnRBdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzb3J0Q2xhc3NOYW1lOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBBdm9pZHMgd2hpdGVzcGFjZSBhcm91bmQgcGxhY2Vob2xkZXIgaW4gdGFncy5cbiAgICAgICAgICAgICAgICAgICAgdHJpbUN1c3RvbUZyYWdtZW50czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdXNlU2hvcnREb2N0eXBlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSwgcXVlcnkuY29tcHJlc3MuaHRtbCkpIDogY29udGVudFxuICAgICAgICBsZXQgcmVtYWluaW5nU3RlcHM6bnVtYmVyID0gY29tcGlsZVN0ZXBzXG4gICAgICAgIGxldCByZXN1bHQ6VGVtcGxhdGVGdW5jdGlvbnxzdHJpbmcgPSB0ZW1wbGF0ZVxuICAgICAgICBsZXQgaXNTdHJpbmc6Ym9vbGVhbiA9IG9wdGlvbnMuaXNTdHJpbmdcbiAgICAgICAgZGVsZXRlIG9wdGlvbnMuaXNTdHJpbmdcbiAgICAgICAgd2hpbGUgKHJlbWFpbmluZ1N0ZXBzID4gMCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9IGlzU3RyaW5nICYmIG9wdGlvbnMuZmlsZW5hbWUgfHwgcmVzdWx0XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoICYmIHBhdGguZXh0bmFtZShmaWxlUGF0aCkgPT09ICcuanMnKVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBldmFsKCdyZXF1aXJlJykoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbmNvZGluZzpzdHJpbmcgPSBjb25maWd1cmF0aW9uLmVuY29kaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoJ2VuY29kaW5nJyBpbiBvcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nID0gb3B0aW9ucy5lbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMocmVzdWx0LCB7ZW5jb2Rpbmd9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZW1haW5pbmdTdGVwcyA9PT0gMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNvbXByZXNzSFRNTChyZXN1bHQpXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGVqcy5jb21waWxlKHJlc3VsdCwgb3B0aW9ucylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjb21wcmVzc0hUTUwocmVzdWx0KFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sIEhlbHBlciwgaW5jbHVkZTogcmVxdWlyZSwgcmVxdWlyZSwgVG9vbHNcbiAgICAgICAgICAgICAgICB9LCBsb2NhbHMpKSlcbiAgICAgICAgICAgIHJlbWFpbmluZ1N0ZXBzIC09IDFcbiAgICAgICAgfVxuICAgICAgICBpZiAoQm9vbGVhbihjb21waWxlU3RlcHMgJSAyKSlcbiAgICAgICAgICAgIHJldHVybiBgJ3VzZSBzdHJpY3QnO1xcbmAgKyBiYWJlbFRyYW5zZm9ybShcbiAgICAgICAgICAgICAgICBgbW9kdWxlLmV4cG9ydHMgPSAke3Jlc3VsdC50b1N0cmluZygpfTtgLCB7XG4gICAgICAgICAgICAgICAgICAgIGFzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGJhYmVscmM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBjb21tZW50czogIUJvb2xlYW4ocXVlcnkuY29tcHJlc3MuamF2YVNjcmlwdCksXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhY3Q6IEJvb2xlYW4ocXVlcnkuY29tcHJlc3MuamF2YVNjcmlwdCksXG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBvcHRpb25zLmZpbGVuYW1lIHx8ICd1bmtub3duJyxcbiAgICAgICAgICAgICAgICAgICAgbWluaWZpZWQ6IEJvb2xlYW4ocXVlcnkuY29tcHJlc3MuamF2YVNjcmlwdCksXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbnM6IFt0cmFuc2Zvcm1XaXRoXSxcbiAgICAgICAgICAgICAgICAgICAgcHJlc2V0czogcXVlcnkuY29tcHJlc3MuamF2YVNjcmlwdCA/IFtbXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWJlbE1pbmlmeVByZXNldCwgcXVlcnkuY29tcHJlc3MuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICBdXSA6IFtdLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VNYXBzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlVHlwZTogJ3NjcmlwdCdcbiAgICAgICAgICAgICAgICB9KS5jb2RlXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIHJldHVybiBjb21waWxlKHNvdXJjZSwge1xuICAgICAgICBjbGllbnQ6IEJvb2xlYW4ocXVlcnkuY29tcGlsZVN0ZXBzICUgMiksXG4gICAgICAgIGNvbXBpbGVEZWJ1ZzogdGhpcy5kZWJ1ZyB8fCBmYWxzZSxcbiAgICAgICAgZGVidWc6IHRoaXMuZGVidWcgfHwgZmFsc2UsXG4gICAgICAgIGZpbGVuYW1lOiAncXVlcnknIGluIHRoaXMgPyBsb2FkZXJVdGlscy5nZXRSZW1haW5pbmdSZXF1ZXN0KFxuICAgICAgICAgICAgdGhpc1xuICAgICAgICApLnJlcGxhY2UoL14hLywgJycpIDogdGhpcy5maWxlbmFtZSB8fCBudWxsLFxuICAgICAgICBpc1N0cmluZzogdHJ1ZVxuICAgIH0sIHF1ZXJ5LmNvbXBpbGVTdGVwcykocXVlcnkubG9jYWxzIHx8IHt9KVxufVxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=