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
    if ('cachable' in this && this.cacheable) this.cacheable();
    const query = _clientnode2.default.convertSubstringInPlainObject(_clientnode2.default.extendObject(true, {
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
    const compile = (template, options = query.compiler, compileSteps = 2) => (locals = {}) => {
        options = _clientnode2.default.extendObject(true, { filename: template }, options);
        const require = (request, nestedLocals = {}) => {
            const template = request.replace(/^(.+)\?[^?]+$/, '$1');
            const queryMatch = request.match(/^[^?]+\?(.+)$/);
            if (queryMatch) {
                const evaluationFunction = (request, template, source, compile, locals) => new Function('request', 'template', 'source', 'compile', 'locals', `return ${queryMatch[1]}`)(request, template, source, compile, locals);
                nestedLocals = _clientnode2.default.extendObject(true, nestedLocals, evaluationFunction(request, template, source, compile, locals));
            }
            let nestedOptions = _clientnode2.default.copyLimitedRecursively(options);
            delete nestedOptions.client;
            nestedOptions = _clientnode2.default.extendObject(true, { encoding: _configurator2.default.encoding }, nestedOptions, nestedLocals.options || {});
            if (nestedOptions.isString) return compile(template, nestedOptions)(nestedLocals);
            const templateFilePath = _helper2.default.determineModuleFilePath(template, query.module.aliases, query.module.replacements, query.extensions, query.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore, _configurator2.default.module.directoryNames, _configurator2.default.package.main.fileNames, _configurator2.default.package.main.propertyNames, _configurator2.default.package.aliasPropertyNames, _configurator2.default.encoding);
            if (templateFilePath) {
                if ('query' in this) this.addDependency(templateFilePath);
                /*
                    NOTE: If there aren't any locals options or variables and
                    file doesn't seem to be an ejs template we simply load
                    included file content.
                */
                if (queryMatch || templateFilePath.endsWith('.ejs')) return compile(templateFilePath, nestedOptions)(nestedLocals);
                // IgnoreTypeCheck
                return fileSystem.readFileSync(templateFilePath, nestedOptions);
            }
            throw new Error(`Given template file "${template}" couldn't be resolved.`);
        };
        const compressHTML = content => query.compress.html ? (0, _htmlMinifier.minify)(content, _clientnode2.default.extendObject(true, {
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
        let remainingSteps = compileSteps;
        let result = template;
        let isString = options.isString;
        delete options.isString;
        while (remainingSteps > 0) {
            if (typeof result === 'string') {
                const filePath = isString && options.filename || result;
                if (filePath && _path2.default.extname(filePath) === '.js') result = eval('require')(filePath);else {
                    if (!isString) {
                        let encoding = _configurator2.default.encoding;
                        if ('encoding' in options) encoding = options.encoding;
                        result = fileSystem.readFileSync(result, { encoding });
                    }
                    if (remainingSteps === 1) result = compressHTML(result);
                    result = ejs.compile(result, options);
                }
            } else result = compressHTML(result(_clientnode2.default.extendObject(true, {
                configuration: _configurator2.default, Helper: _helper2.default, include: require, require, Tools: _clientnode2.default
            }, locals)));
            remainingSteps -= 1;
        }
        if (Boolean(compileSteps % 2)) return `'use strict';\n` + (0, _babelCore.transform)(`module.exports = ${result.toString()};`, {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVqc0xvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUFXQTs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7SUFBWSxHOztBQUNaOztJQUFZLFU7O0FBQ1o7O0FBQ0E7O0lBQVksVzs7QUFDWjs7OztBQU1BOzs7O0FBQ0E7Ozs7Ozs7O0FBTkE7QUFDQSxJQUFJO0FBQ0EsWUFBUSw2QkFBUjtBQUNILENBRkQsQ0FFRSxPQUFPLEtBQVAsRUFBYyxDQUFFO0FBVWxCOztBQU5BO0FBQ0E7QUFNQSxPQUFPLE9BQVAsR0FBaUIsVUFBUyxNQUFULEVBQStCO0FBQzVDLFFBQUksY0FBYyxJQUFkLElBQXNCLEtBQUssU0FBL0IsRUFDSSxLQUFLLFNBQUw7QUFDSixVQUFNLFFBQWUscUJBQU0sNkJBQU4sQ0FDakIscUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QjtBQUNyQixrQkFBVTtBQUNOLGtCQUFNLEVBREE7QUFFTix3QkFBWTtBQUZOLFNBRFc7QUFLckIsaUJBQVMsSUFMWTtBQU1yQixvQkFBWTtBQUNSLGtCQUFNO0FBQ0YsMEJBQVUsQ0FBQyxLQUFELENBRFI7QUFFRiwwQkFBVSxDQUNOLEtBRE0sRUFDQyxNQURELEVBQ1MsTUFEVCxFQUNpQixNQURqQixFQUN5QixNQUR6QixFQUNpQyxNQURqQyxFQUN5QyxNQUR6QyxFQUVOLE9BRk0sRUFFRyxPQUZILEVBRVksTUFGWixFQUVvQixNQUZwQixFQUU0QixPQUY1QjtBQUZSLGFBREUsRUFPTCxRQUFRO0FBUEgsU0FOUztBQWVyQixnQkFBUTtBQUNKLHFCQUFTLEVBREw7QUFFSiwwQkFBYztBQUZWLFNBZmE7QUFtQnJCLHNCQUFjO0FBbkJPLEtBQXpCLEVBb0JHLEtBQUssT0FBTCxJQUFnQixFQXBCbkIsRUFvQnVCLFdBQVcsSUFBWCxHQUFrQixZQUFZLFVBQVosQ0FDckMsSUFEcUMsS0FFcEMsRUFGa0IsR0FFYixFQXRCVixDQURpQixFQXdCakIsUUF4QmlCLEVBd0JQLEdBeEJPLENBQXJCO0FBeUJBLFVBQU0sVUFBMEIsQ0FDNUIsUUFENEIsRUFDWCxVQUFpQixNQUFNLFFBRFosRUFFNUIsZUFBc0IsQ0FGTSxLQUdWLENBQUMsU0FBZ0IsRUFBakIsS0FBK0I7QUFDakQsa0JBQVUscUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QixFQUFDLFVBQVUsUUFBWCxFQUF6QixFQUErQyxPQUEvQyxDQUFWO0FBQ0EsY0FBTSxVQUFtQixDQUNyQixPQURxQixFQUNMLGVBQXNCLEVBRGpCLEtBRWI7QUFDUixrQkFBTSxXQUFrQixRQUFRLE9BQVIsQ0FBZ0IsZUFBaEIsRUFBaUMsSUFBakMsQ0FBeEI7QUFDQSxrQkFBTSxhQUE0QixRQUFRLEtBQVIsQ0FBYyxlQUFkLENBQWxDO0FBQ0EsZ0JBQUksVUFBSixFQUFnQjtBQUNaLHNCQUFNLHFCQUFxQixDQUN2QixPQUR1QixFQUNQLFFBRE8sRUFDVSxNQURWLEVBRXZCLE9BRnVCLEVBRUUsTUFGRixLQUlmLElBQUksUUFBSixDQUNSLFNBRFEsRUFDRyxVQURILEVBQ2UsUUFEZixFQUN5QixTQUR6QixFQUNvQyxRQURwQyxFQUVQLFVBQVMsV0FBVyxDQUFYLENBQWMsRUFGaEIsRUFHVixPQUhVLEVBR0QsUUFIQyxFQUdTLE1BSFQsRUFHaUIsT0FIakIsRUFHMEIsTUFIMUIsQ0FKWjtBQVFBLCtCQUFlLHFCQUFNLFlBQU4sQ0FDWCxJQURXLEVBQ0wsWUFESyxFQUNTLG1CQUNoQixPQURnQixFQUNQLFFBRE8sRUFDRyxNQURILEVBQ1csT0FEWCxFQUNvQixNQURwQixDQURULENBQWY7QUFHSDtBQUNELGdCQUFJLGdCQUF1QixxQkFBTSxzQkFBTixDQUE2QixPQUE3QixDQUEzQjtBQUNBLG1CQUFPLGNBQWMsTUFBckI7QUFDQSw0QkFBZ0IscUJBQU0sWUFBTixDQUNaLElBRFksRUFDTixFQUFDLFVBQVUsdUJBQWMsUUFBekIsRUFETSxFQUM4QixhQUQ5QixFQUVaLGFBQWEsT0FBYixJQUF3QixFQUZaLENBQWhCO0FBR0EsZ0JBQUksY0FBYyxRQUFsQixFQUNJLE9BQU8sUUFBUSxRQUFSLEVBQWtCLGFBQWxCLEVBQWlDLFlBQWpDLENBQVA7QUFDSixrQkFBTSxtQkFDRixpQkFBTyx1QkFBUCxDQUNJLFFBREosRUFDYyxNQUFNLE1BQU4sQ0FBYSxPQUQzQixFQUVJLE1BQU0sTUFBTixDQUFhLFlBRmpCLEVBRStCLE1BQU0sVUFGckMsRUFHSSxNQUFNLE9BSFYsRUFHbUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxJQUhuRCxFQUlJLHVCQUFjLElBQWQsQ0FBbUIsTUFKdkIsRUFLSSx1QkFBYyxNQUFkLENBQXFCLGNBTHpCLEVBTUksdUJBQWMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixTQU4vQixFQU9JLHVCQUFjLE9BQWQsQ0FBc0IsSUFBdEIsQ0FBMkIsYUFQL0IsRUFRSSx1QkFBYyxPQUFkLENBQXNCLGtCQVIxQixFQVNJLHVCQUFjLFFBVGxCLENBREo7QUFXQSxnQkFBSSxnQkFBSixFQUFzQjtBQUNsQixvQkFBSSxXQUFXLElBQWYsRUFDSSxLQUFLLGFBQUwsQ0FBbUIsZ0JBQW5CO0FBQ0o7Ozs7O0FBS0Esb0JBQUksY0FBYyxpQkFBaUIsUUFBakIsQ0FBMEIsTUFBMUIsQ0FBbEIsRUFDSSxPQUFPLFFBQVEsZ0JBQVIsRUFBMEIsYUFBMUIsRUFDSCxZQURHLENBQVA7QUFFSjtBQUNBLHVCQUFPLFdBQVcsWUFBWCxDQUF3QixnQkFBeEIsRUFBMEMsYUFBMUMsQ0FBUDtBQUNIO0FBQ0Qsa0JBQU0sSUFBSSxLQUFKLENBQ0Qsd0JBQXVCLFFBQVMseUJBRC9CLENBQU47QUFFSCxTQXBERDtBQXFEQSxjQUFNLGVBQXlCLE9BQUQsSUFDMUIsTUFBTSxRQUFOLENBQWUsSUFBZixHQUFzQiwwQkFBVyxPQUFYLEVBQW9CLHFCQUFNLFlBQU4sQ0FDdEMsSUFEc0MsRUFDaEM7QUFDRiwyQkFBZSxJQURiO0FBRUYseUNBQTZCLElBRjNCO0FBR0YsZ0NBQW9CLElBSGxCO0FBSUYsa0NBQXNCLElBSnBCO0FBS0YsdUJBQVcsSUFMVDtBQU1GLHNCQUFVLElBTlI7QUFPRiw0QkFBZ0IsQ0FDWixrQkFEWSxFQUNRLDRCQURSLENBUGQ7QUFVRixtQ0FBdUIsSUFWckI7QUFXRiw0QkFBZ0IsSUFYZDtBQVlGLHVDQUEyQixJQVp6QjtBQWFGLHdDQUE0QixJQWIxQjtBQWNGLDJDQUErQixJQWQ3QjtBQWVGLDRCQUFnQixJQWZkO0FBZ0JGLDJCQUFlLElBaEJiO0FBaUJGO0FBQ0EsaUNBQXFCLElBbEJuQjtBQW1CRiw2QkFBaUI7QUFuQmYsU0FEZ0MsRUFxQm5DLE1BQU0sUUFBTixDQUFlLElBckJvQixDQUFwQixDQUF0QixHQXFCK0IsT0F0Qm5DO0FBdUJBLFlBQUksaUJBQXdCLFlBQTVCO0FBQ0EsWUFBSSxTQUFpQyxRQUFyQztBQUNBLFlBQUksV0FBbUIsUUFBUSxRQUEvQjtBQUNBLGVBQU8sUUFBUSxRQUFmO0FBQ0EsZUFBTyxpQkFBaUIsQ0FBeEIsRUFBMkI7QUFDdkIsZ0JBQUksT0FBTyxNQUFQLEtBQWtCLFFBQXRCLEVBQWdDO0FBQzVCLHNCQUFNLFdBQW1CLFlBQVksUUFBUSxRQUFwQixJQUFnQyxNQUF6RDtBQUNBLG9CQUFJLFlBQVksZUFBSyxPQUFMLENBQWEsUUFBYixNQUEyQixLQUEzQyxFQUNJLFNBQVMsS0FBSyxTQUFMLEVBQWdCLFFBQWhCLENBQVQsQ0FESixLQUVLO0FBQ0Qsd0JBQUksQ0FBQyxRQUFMLEVBQWU7QUFDWCw0QkFBSSxXQUFrQix1QkFBYyxRQUFwQztBQUNBLDRCQUFJLGNBQWMsT0FBbEIsRUFDSSxXQUFXLFFBQVEsUUFBbkI7QUFDSixpQ0FBUyxXQUFXLFlBQVgsQ0FBd0IsTUFBeEIsRUFBZ0MsRUFBQyxRQUFELEVBQWhDLENBQVQ7QUFDSDtBQUNELHdCQUFJLG1CQUFtQixDQUF2QixFQUNJLFNBQVMsYUFBYSxNQUFiLENBQVQ7QUFDSiw2QkFBUyxJQUFJLE9BQUosQ0FBWSxNQUFaLEVBQW9CLE9BQXBCLENBQVQ7QUFDSDtBQUNKLGFBZkQsTUFnQkksU0FBUyxhQUFhLE9BQU8scUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QjtBQUNsRCxxREFEa0QsRUFDbkMsd0JBRG1DLEVBQzNCLFNBQVMsT0FEa0IsRUFDVCxPQURTLEVBQ0E7QUFEQSxhQUF6QixFQUUxQixNQUYwQixDQUFQLENBQWIsQ0FBVDtBQUdKLDhCQUFrQixDQUFsQjtBQUNIO0FBQ0QsWUFBSSxRQUFRLGVBQWUsQ0FBdkIsQ0FBSixFQUNJLE9BQVEsaUJBQUQsR0FBb0IsMEJBQ3RCLG9CQUFtQixPQUFPLFFBQVAsRUFBa0IsR0FEZixFQUNtQjtBQUN0QyxpQkFBSyxLQURpQztBQUV0QyxxQkFBUyxLQUY2QjtBQUd0QyxzQkFBVSxDQUFDLFFBQVEsTUFBTSxRQUFOLENBQWUsVUFBdkIsQ0FIMkI7QUFJdEMscUJBQVMsUUFBUSxNQUFNLFFBQU4sQ0FBZSxVQUF2QixDQUo2QjtBQUt0QyxzQkFBVSxRQUFRLFFBQVIsSUFBb0IsU0FMUTtBQU10QyxzQkFBVSxRQUFRLE1BQU0sUUFBTixDQUFlLFVBQXZCLENBTjRCO0FBT3RDLHFCQUFTLG9DQVA2QjtBQVF0QyxxQkFBUyxNQUFNLFFBQU4sQ0FBZSxVQUFmLEdBQTRCLENBQUMsOEJBQ2YsTUFBTSxRQUFOLENBQWUsVUFEQSxDQUFELENBQTVCLEdBRUosRUFWaUM7QUFXdEMsd0JBQVksS0FYMEI7QUFZdEMsd0JBQVk7QUFaMEIsU0FEbkIsRUFjcEIsSUFkUDtBQWVKO0FBQ0EsZUFBTyxNQUFQO0FBQ0gsS0E3SEQ7QUE4SEEsV0FBTyxRQUFRLE1BQVIsRUFBZ0I7QUFDbkIsZ0JBQVEsUUFBUSxNQUFNLFlBQU4sR0FBcUIsQ0FBN0IsQ0FEVztBQUVuQixzQkFBYyxLQUFLLEtBQUwsSUFBYyxLQUZUO0FBR25CLGVBQU8sS0FBSyxLQUFMLElBQWMsS0FIRjtBQUluQixrQkFBVSxXQUFXLElBQVgsR0FBa0IsWUFBWSxtQkFBWixDQUN4QixJQUR3QixFQUUxQixPQUYwQixDQUVsQixJQUZrQixFQUVaLEVBRlksQ0FBbEIsR0FFWSxLQUFLLFFBQUwsSUFBaUIsSUFOcEI7QUFPbkIsa0JBQVU7QUFQUyxLQUFoQixFQVFKLE1BQU0sWUFSRixFQVFnQixNQUFNLE1BQU4sSUFBZ0IsRUFSaEMsQ0FBUDtBQVNILENBbktEO0FBb0tBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImVqc0xvYWRlci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB7dHJhbnNmb3JtIGFzIGJhYmVsVHJhbnNmb3JtfSBmcm9tICdiYWJlbC1jb3JlJ1xuaW1wb3J0IGJhYmVsTWluaWZ5UHJlc2V0IGZyb20gJ2JhYmVsLXByZXNldC1taW5pZnknXG5pbXBvcnQgdHJhbnNmb3JtV2l0aCBmcm9tICdiYWJlbC1wbHVnaW4tdHJhbnNmb3JtLXdpdGgnXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCAqIGFzIGVqcyBmcm9tICdlanMnXG5pbXBvcnQgKiBhcyBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHttaW5pZnkgYXMgbWluaWZ5SFRNTH0gZnJvbSAnaHRtbC1taW5pZmllcidcbmltcG9ydCAqIGFzIGxvYWRlclV0aWxzIGZyb20gJ2xvYWRlci11dGlscydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB0eXBlc1xudHlwZSBUZW1wbGF0ZUZ1bmN0aW9uID0gKGxvY2FsczpPYmplY3QpID0+IHN0cmluZ1xudHlwZSBDb21waWxlRnVuY3Rpb24gPSAoXG4gICAgdGVtcGxhdGU6c3RyaW5nLCBvcHRpb25zOk9iamVjdCwgY29tcGlsZVN0ZXBzPzpudW1iZXJcbikgPT4gVGVtcGxhdGVGdW5jdGlvblxuLy8gZW5kcmVnaW9uXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNvdXJjZTpzdHJpbmcpOnN0cmluZyB7XG4gICAgaWYgKCdjYWNoYWJsZScgaW4gdGhpcyAmJiB0aGlzLmNhY2hlYWJsZSlcbiAgICAgICAgdGhpcy5jYWNoZWFibGUoKVxuICAgIGNvbnN0IHF1ZXJ5Ok9iamVjdCA9IFRvb2xzLmNvbnZlcnRTdWJzdHJpbmdJblBsYWluT2JqZWN0KFxuICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge1xuICAgICAgICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgICAgICAgICBodG1sOiB7fSxcbiAgICAgICAgICAgICAgICBqYXZhU2NyaXB0OiB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRleHQ6ICcuLycsXG4gICAgICAgICAgICBleHRlbnNpb25zOiB7XG4gICAgICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgICAgICBleHRlcm5hbDogWycuanMnXSxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWw6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICcuanMnLCAnLmNzcycsICcuc3ZnJywgJy5wbmcnLCAnLmpwZycsICcuZ2lmJywgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJy5odG1sJywgJy5qc29uJywgJy5lb3QnLCAnLnR0ZicsICcud29mZidcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sIG1vZHVsZTogW11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgICAgICBhbGlhc2VzOiB7fSxcbiAgICAgICAgICAgICAgICByZXBsYWNlbWVudHM6IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29tcGlsZVN0ZXBzOiAyXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucyB8fCB7fSwgJ3F1ZXJ5JyBpbiB0aGlzID8gbG9hZGVyVXRpbHMuZ2V0T3B0aW9ucyhcbiAgICAgICAgICAgIHRoaXNcbiAgICAgICAgKSB8fCB7fSA6IHt9KSxcbiAgICAgICAgLyMlJSUjL2csICchJylcbiAgICBjb25zdCBjb21waWxlOkNvbXBpbGVGdW5jdGlvbiA9IChcbiAgICAgICAgdGVtcGxhdGU6c3RyaW5nLCBvcHRpb25zOk9iamVjdCA9IHF1ZXJ5LmNvbXBpbGVyLFxuICAgICAgICBjb21waWxlU3RlcHM6bnVtYmVyID0gMlxuICAgICk6VGVtcGxhdGVGdW5jdGlvbiA9PiAobG9jYWxzOk9iamVjdCA9IHt9KTpzdHJpbmcgPT4ge1xuICAgICAgICBvcHRpb25zID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtmaWxlbmFtZTogdGVtcGxhdGV9LCBvcHRpb25zKVxuICAgICAgICBjb25zdCByZXF1aXJlOkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgcmVxdWVzdDpzdHJpbmcsIG5lc3RlZExvY2FsczpPYmplY3QgPSB7fVxuICAgICAgICApOnN0cmluZyA9PiB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZTpzdHJpbmcgPSByZXF1ZXN0LnJlcGxhY2UoL14oLispXFw/W14/XSskLywgJyQxJylcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5TWF0Y2g6P0FycmF5PHN0cmluZz4gPSByZXF1ZXN0Lm1hdGNoKC9eW14/XStcXD8oLispJC8pXG4gICAgICAgICAgICBpZiAocXVlcnlNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdDpzdHJpbmcsIHRlbXBsYXRlOnN0cmluZywgc291cmNlOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZTpDb21waWxlRnVuY3Rpb24sIGxvY2FsczpPYmplY3RcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICApOk9iamVjdCA9PiBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICdyZXF1ZXN0JywgJ3RlbXBsYXRlJywgJ3NvdXJjZScsICdjb21waWxlJywgJ2xvY2FscycsXG4gICAgICAgICAgICAgICAgICAgIGByZXR1cm4gJHtxdWVyeU1hdGNoWzFdfWBcbiAgICAgICAgICAgICAgICApKHJlcXVlc3QsIHRlbXBsYXRlLCBzb3VyY2UsIGNvbXBpbGUsIGxvY2FscylcbiAgICAgICAgICAgICAgICBuZXN0ZWRMb2NhbHMgPSBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIHRydWUsIG5lc3RlZExvY2FscywgZXZhbHVhdGlvbkZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCwgdGVtcGxhdGUsIHNvdXJjZSwgY29tcGlsZSwgbG9jYWxzKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBuZXN0ZWRPcHRpb25zOk9iamVjdCA9IFRvb2xzLmNvcHlMaW1pdGVkUmVjdXJzaXZlbHkob3B0aW9ucylcbiAgICAgICAgICAgIGRlbGV0ZSBuZXN0ZWRPcHRpb25zLmNsaWVudFxuICAgICAgICAgICAgbmVzdGVkT3B0aW9ucyA9IFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgICAgICB0cnVlLCB7ZW5jb2Rpbmc6IGNvbmZpZ3VyYXRpb24uZW5jb2Rpbmd9LCBuZXN0ZWRPcHRpb25zLFxuICAgICAgICAgICAgICAgIG5lc3RlZExvY2Fscy5vcHRpb25zIHx8IHt9KVxuICAgICAgICAgICAgaWYgKG5lc3RlZE9wdGlvbnMuaXNTdHJpbmcpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGUodGVtcGxhdGUsIG5lc3RlZE9wdGlvbnMpKG5lc3RlZExvY2FscylcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlRmlsZVBhdGg6P3N0cmluZyA9XG4gICAgICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZSwgcXVlcnkubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5Lm1vZHVsZS5yZXBsYWNlbWVudHMsIHF1ZXJ5LmV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmNvbnRleHQsIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZylcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZUZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCdxdWVyeScgaW4gdGhpcylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGREZXBlbmRlbmN5KHRlbXBsYXRlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogSWYgdGhlcmUgYXJlbid0IGFueSBsb2NhbHMgb3B0aW9ucyBvciB2YXJpYWJsZXMgYW5kXG4gICAgICAgICAgICAgICAgICAgIGZpbGUgZG9lc24ndCBzZWVtIHRvIGJlIGFuIGVqcyB0ZW1wbGF0ZSB3ZSBzaW1wbHkgbG9hZFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlZCBmaWxlIGNvbnRlbnQuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAocXVlcnlNYXRjaCB8fCB0ZW1wbGF0ZUZpbGVQYXRoLmVuZHNXaXRoKCcuZWpzJykpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlKHRlbXBsYXRlRmlsZVBhdGgsIG5lc3RlZE9wdGlvbnMpKFxuICAgICAgICAgICAgICAgICAgICAgICAgbmVzdGVkTG9jYWxzKVxuICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyh0ZW1wbGF0ZUZpbGVQYXRoLCBuZXN0ZWRPcHRpb25zKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBHaXZlbiB0ZW1wbGF0ZSBmaWxlIFwiJHt0ZW1wbGF0ZX1cIiBjb3VsZG4ndCBiZSByZXNvbHZlZC5gKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbXByZXNzSFRNTDpGdW5jdGlvbiA9IChjb250ZW50OnN0cmluZyk6c3RyaW5nID0+XG4gICAgICAgICAgICBxdWVyeS5jb21wcmVzcy5odG1sID8gbWluaWZ5SFRNTChjb250ZW50LCBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICAgICAgdHJ1ZSwge1xuICAgICAgICAgICAgICAgICAgICBjYXNlU2Vuc2l0aXZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZUlubGluZVRhZ1doaXRlc3BhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlV2hpdGVzcGFjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29uc2VydmF0aXZlQ29sbGFwc2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbmlmeUNTUzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWluaWZ5SlM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NTY3JpcHRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAndGV4dC9uZy10ZW1wbGF0ZScsICd0ZXh0L3gtaGFuZGxlYmFycy10ZW1wbGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXR0cmlidXRlUXVvdGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVDb21tZW50czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlUmVkdW5kYW50QXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlU2NyaXB0VHlwZUF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVN0eWxlTGlua1R5cGVBdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzb3J0QXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc29ydENsYXNzTmFtZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogQXZvaWRzIHdoaXRlc3BhY2UgYXJvdW5kIHBsYWNlaG9sZGVyIGluIHRhZ3MuXG4gICAgICAgICAgICAgICAgICAgIHRyaW1DdXN0b21GcmFnbWVudHM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHVzZVNob3J0RG9jdHlwZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sIHF1ZXJ5LmNvbXByZXNzLmh0bWwpKSA6IGNvbnRlbnRcbiAgICAgICAgbGV0IHJlbWFpbmluZ1N0ZXBzOm51bWJlciA9IGNvbXBpbGVTdGVwc1xuICAgICAgICBsZXQgcmVzdWx0OlRlbXBsYXRlRnVuY3Rpb258c3RyaW5nID0gdGVtcGxhdGVcbiAgICAgICAgbGV0IGlzU3RyaW5nOmJvb2xlYW4gPSBvcHRpb25zLmlzU3RyaW5nXG4gICAgICAgIGRlbGV0ZSBvcHRpb25zLmlzU3RyaW5nXG4gICAgICAgIHdoaWxlIChyZW1haW5pbmdTdGVwcyA+IDApIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBpc1N0cmluZyAmJiBvcHRpb25zLmZpbGVuYW1lIHx8IHJlc3VsdFxuICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aCAmJiBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpID09PSAnLmpzJylcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZXZhbCgncmVxdWlyZScpKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW5jb2Rpbmc6c3RyaW5nID0gY29uZmlndXJhdGlvbi5lbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdlbmNvZGluZycgaW4gb3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZyA9IG9wdGlvbnMuZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKHJlc3VsdCwge2VuY29kaW5nfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nU3RlcHMgPT09IDEpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBjb21wcmVzc0hUTUwocmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBlanMuY29tcGlsZShyZXN1bHQsIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY29tcHJlc3NIVE1MKHJlc3VsdChUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge1xuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLCBIZWxwZXIsIGluY2x1ZGU6IHJlcXVpcmUsIHJlcXVpcmUsIFRvb2xzXG4gICAgICAgICAgICAgICAgfSwgbG9jYWxzKSkpXG4gICAgICAgICAgICByZW1haW5pbmdTdGVwcyAtPSAxXG4gICAgICAgIH1cbiAgICAgICAgaWYgKEJvb2xlYW4oY29tcGlsZVN0ZXBzICUgMikpXG4gICAgICAgICAgICByZXR1cm4gYCd1c2Ugc3RyaWN0JztcXG5gICsgYmFiZWxUcmFuc2Zvcm0oXG4gICAgICAgICAgICAgICAgYG1vZHVsZS5leHBvcnRzID0gJHtyZXN1bHQudG9TdHJpbmcoKX07YCwge1xuICAgICAgICAgICAgICAgICAgICBhc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudHM6ICFCb29sZWFuKHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgICAgICBjb21wYWN0OiBCb29sZWFuKHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogb3B0aW9ucy5maWxlbmFtZSB8fCAndW5rbm93bicsXG4gICAgICAgICAgICAgICAgICAgIG1pbmlmaWVkOiBCb29sZWFuKHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5zOiBbdHJhbnNmb3JtV2l0aF0sXG4gICAgICAgICAgICAgICAgICAgIHByZXNldHM6IHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHQgPyBbW1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFiZWxNaW5pZnlQcmVzZXQsIHF1ZXJ5LmNvbXByZXNzLmphdmFTY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgXV0gOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgc291cmNlTWFwczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZVR5cGU6ICdzY3JpcHQnXG4gICAgICAgICAgICAgICAgfSkuY29kZVxuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZShzb3VyY2UsIHtcbiAgICAgICAgY2xpZW50OiBCb29sZWFuKHF1ZXJ5LmNvbXBpbGVTdGVwcyAlIDIpLFxuICAgICAgICBjb21waWxlRGVidWc6IHRoaXMuZGVidWcgfHwgZmFsc2UsXG4gICAgICAgIGRlYnVnOiB0aGlzLmRlYnVnIHx8IGZhbHNlLFxuICAgICAgICBmaWxlbmFtZTogJ3F1ZXJ5JyBpbiB0aGlzID8gbG9hZGVyVXRpbHMuZ2V0UmVtYWluaW5nUmVxdWVzdChcbiAgICAgICAgICAgIHRoaXNcbiAgICAgICAgKS5yZXBsYWNlKC9eIS8sICcnKSA6IHRoaXMuZmlsZW5hbWUgfHwgbnVsbCxcbiAgICAgICAgaXNTdHJpbmc6IHRydWVcbiAgICB9LCBxdWVyeS5jb21waWxlU3RlcHMpKHF1ZXJ5LmxvY2FscyB8fCB7fSlcbn1cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19