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

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _loaderUtils = require('loader-utils');

var loaderUtils = _interopRequireWildcard(_loaderUtils);

var _pug = require('pug');

var pug = _interopRequireWildcard(_pug);

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

    if (this.cacheable) this.cacheable();
    var query = _clientnode2.default.convertSubstringInPlainObject(_clientnode2.default.extendObject(true, {
        moduleAliases: [],
        knownExtensions: ['.pug', '.html', '.js', '.css'],
        context: './'
    }, this.options.pug || {}, loaderUtils.parseQuery(this.query)), /#%%%#/g, '!');
    var compile = function compile(template) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? query.compiler : arguments[1];
        return function () {
            var locals = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            options = _clientnode2.default.extendObject(true, {
                filename: template, doctype: 'html',
                compileDebug: _this.debug || false
            }, options);
            var templateFunction = void 0;
            if (options.isString) {
                delete options.isString;
                templateFunction = pug.compile(template, options);
            } else templateFunction = pug.compileFile(template, options);
            return templateFunction(_clientnode2.default.extendObject(true, {
                configuration: _configurator2.default, require: function require(request) {
                    var template = request.replace(/^(.+)\?[^?]+$/, '$1');
                    var queryMatch = request.match(/^[^?]+\?(.+)$/, '$1');
                    var nestedLocals = {};
                    if (queryMatch) {
                        var evaluationFunction = function evaluationFunction(request, template, source, compile, locals
                        // IgnoreTypeCheck
                        ) {
                            return new Function('request', 'template', 'source', 'compile', 'locals', 'return ' + queryMatch[1])(request, template, source, compile, locals);
                        };
                        nestedLocals = evaluationFunction(request, template, source, compile, locals);
                    }
                    var options = _clientnode2.default.extendObject(true, {
                        encoding: 'utf-8'
                    }, nestedLocals.options || {});
                    if (options.isString) return compile(template, options)(nestedLocals);
                    var templateFilePath = _helper2.default.determineModuleFilePath(template, query.moduleAliases, query.knownExtensions, query.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore);
                    if (templateFilePath) {
                        _this.addDependency(templateFilePath);
                        if (queryMatch || templateFilePath.endsWith('.pug')) return compile(templateFilePath, options)(nestedLocals);
                        return fileSystem.readFileSync(templateFilePath, options);
                    }
                    throw Error('Given template file "' + template + '" couldn\'t be resolved.');
                } }, locals));
        };
    };
    return compile(source, _clientnode2.default.extendObject(true, {
        isString: true,
        filename: loaderUtils.getRemainingRequest(this).replace(/^!/, '')
    }, query.compiler || {}))(query.locals || {});
};
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,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RixpQkFBTyx1QkFBUCxDQUNJLFFBREosRUFDYyxNQUFNLGFBRHBCLEVBQ21DLE1BQU0sZUFEekMsRUFFSSxNQUFNLE9BRlYsRUFFbUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxJQUZuRCxFQUdJLHVCQUFjLElBQWQsQ0FBbUIsTUFIdkIsQ0FESjtBQUtBLHdCQUFJLGdCQUFKLEVBQXNCO0FBQ2xCLDhCQUFLLGFBQUwsQ0FBbUIsZ0JBQW5CO0FBQ0EsNEJBQUksY0FBYyxpQkFBaUIsUUFBakIsQ0FBMEIsTUFBMUIsQ0FBbEIsRUFDSSxPQUFPLFFBQVEsZ0JBQVIsRUFBMEIsT0FBMUIsRUFBbUMsWUFBbkMsQ0FBUDtBQUNKLCtCQUFPLFdBQVcsWUFBWCxDQUF3QixnQkFBeEIsRUFBMEMsT0FBMUMsQ0FBUDtBQUNIO0FBQ0QsMEJBQU0sZ0NBQ3NCLFFBRHRCLDhCQUFOO0FBRUgsaUJBckM0QyxFQUF6QixFQXFDaEIsTUFyQ2dCLENBQWpCLENBQVA7QUFzQ0gsU0FuRCtCO0FBQUEsS0FBaEM7QUFvREEsV0FBTyxRQUFRLE1BQVIsRUFBZ0IscUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QjtBQUM1QyxrQkFBVSxJQURrQztBQUU1QyxrQkFBVSxZQUFZLG1CQUFaLENBQWdDLElBQWhDLEVBQXNDLE9BQXRDLENBQThDLElBQTlDLEVBQW9ELEVBQXBEO0FBRmtDLEtBQXpCLEVBR3BCLE1BQU0sUUFBTixJQUFrQixFQUhFLENBQWhCLEVBR21CLE1BQU0sTUFBTixJQUFnQixFQUhuQyxDQUFQO0FBSUgsQ0FsRUQ7QUFtRUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicHVnTG9hZGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCAqIGFzIGxvYWRlclV0aWxzIGZyb20gJ2xvYWRlci11dGlscydcbmltcG9ydCAqIGFzIHB1ZyBmcm9tICdwdWcnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB0eXBlc1xudHlwZSBUZW1wbGF0ZUZ1bmN0aW9uID0gKGxvY2FsczpPYmplY3QpID0+IHN0cmluZ1xudHlwZSBDb21waWxlRnVuY3Rpb24gPSAodGVtcGxhdGU6c3RyaW5nLCBvcHRpb25zOk9iamVjdCkgPT4gVGVtcGxhdGVGdW5jdGlvblxuLy8gZW5kcmVnaW9uXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNvdXJjZTpzdHJpbmcpOnN0cmluZyB7XG4gICAgaWYgKHRoaXMuY2FjaGVhYmxlKVxuICAgICAgICB0aGlzLmNhY2hlYWJsZSgpXG4gICAgY29uc3QgcXVlcnk6T2JqZWN0ID0gVG9vbHMuY29udmVydFN1YnN0cmluZ0luUGxhaW5PYmplY3QoXG4gICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICBtb2R1bGVBbGlhc2VzOiBbXSxcbiAgICAgICAgICAgIGtub3duRXh0ZW5zaW9uczogWycucHVnJywgJy5odG1sJywgJy5qcycsICcuY3NzJ10sXG4gICAgICAgICAgICBjb250ZXh0OiAnLi8nXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5wdWcgfHwge30sIGxvYWRlclV0aWxzLnBhcnNlUXVlcnkodGhpcy5xdWVyeSkpLFxuICAgICAgICAvIyUlJSMvZywgJyEnKVxuICAgIGNvbnN0IGNvbXBpbGU6Q29tcGlsZUZ1bmN0aW9uID0gKFxuICAgICAgICB0ZW1wbGF0ZTpzdHJpbmcsIG9wdGlvbnM6T2JqZWN0ID0gcXVlcnkuY29tcGlsZXJcbiAgICApOlRlbXBsYXRlRnVuY3Rpb24gPT4gKGxvY2FsczpPYmplY3QgPSB7fSk6c3RyaW5nID0+IHtcbiAgICAgICAgb3B0aW9ucyA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICBmaWxlbmFtZTogdGVtcGxhdGUsIGRvY3R5cGU6ICdodG1sJyxcbiAgICAgICAgICAgIGNvbXBpbGVEZWJ1ZzogdGhpcy5kZWJ1ZyB8fCBmYWxzZVxuICAgICAgICB9LCBvcHRpb25zKVxuICAgICAgICBsZXQgdGVtcGxhdGVGdW5jdGlvbjpUZW1wbGF0ZUZ1bmN0aW9uXG4gICAgICAgIGlmIChvcHRpb25zLmlzU3RyaW5nKSB7XG4gICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5pc1N0cmluZ1xuICAgICAgICAgICAgdGVtcGxhdGVGdW5jdGlvbiA9IHB1Zy5jb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKVxuICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgIHRlbXBsYXRlRnVuY3Rpb24gPSBwdWcuY29tcGlsZUZpbGUodGVtcGxhdGUsIG9wdGlvbnMpXG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZUZ1bmN0aW9uKFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLCByZXF1aXJlOiAocmVxdWVzdDpzdHJpbmcpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcGxhdGU6c3RyaW5nID0gcmVxdWVzdC5yZXBsYWNlKC9eKC4rKVxcP1teP10rJC8sICckMScpXG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnlNYXRjaDo/QXJyYXk8c3RyaW5nPiA9IHJlcXVlc3QubWF0Y2goXG4gICAgICAgICAgICAgICAgICAgIC9eW14/XStcXD8oLispJC8sICckMScpXG4gICAgICAgICAgICAgICAgbGV0IG5lc3RlZExvY2FsczpPYmplY3QgPSB7fVxuICAgICAgICAgICAgICAgIGlmIChxdWVyeU1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3Q6c3RyaW5nLCB0ZW1wbGF0ZTpzdHJpbmcsIHNvdXJjZTpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlOkNvbXBpbGVGdW5jdGlvbiwgbG9jYWxzOk9iamVjdFxuICAgICAgICAgICAgICAgICAgICApOk9iamVjdCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JlcXVlc3QnLCAndGVtcGxhdGUnLCAnc291cmNlJywgJ2NvbXBpbGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdsb2NhbHMnLCBgcmV0dXJuICR7cXVlcnlNYXRjaFsxXX1gXG4gICAgICAgICAgICAgICAgICAgICAgICApKHJlcXVlc3QsIHRlbXBsYXRlLCBzb3VyY2UsIGNvbXBpbGUsIGxvY2FscylcbiAgICAgICAgICAgICAgICAgICAgbmVzdGVkTG9jYWxzID0gZXZhbHVhdGlvbkZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCwgdGVtcGxhdGUsIHNvdXJjZSwgY29tcGlsZSwgbG9jYWxzKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zOk9iamVjdCA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmLTgnXG4gICAgICAgICAgICAgICAgfSwgbmVzdGVkTG9jYWxzLm9wdGlvbnMgfHwge30pXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuaXNTdHJpbmcpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKShuZXN0ZWRMb2NhbHMpXG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcGxhdGVGaWxlUGF0aDo/c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGUsIHF1ZXJ5Lm1vZHVsZUFsaWFzZXMsIHF1ZXJ5Lmtub3duRXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmNvbnRleHQsIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUpXG4gICAgICAgICAgICAgICAgaWYgKHRlbXBsYXRlRmlsZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGREZXBlbmRlbmN5KHRlbXBsYXRlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeU1hdGNoIHx8IHRlbXBsYXRlRmlsZVBhdGguZW5kc1dpdGgoJy5wdWcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlKHRlbXBsYXRlRmlsZVBhdGgsIG9wdGlvbnMpKG5lc3RlZExvY2FscylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKHRlbXBsYXRlRmlsZVBhdGgsIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgR2l2ZW4gdGVtcGxhdGUgZmlsZSBcIiR7dGVtcGxhdGV9XCIgY291bGRuJ3QgYmUgcmVzb2x2ZWQuYClcbiAgICAgICAgICAgIH19LCBsb2NhbHMpKVxuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZShzb3VyY2UsIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgIGlzU3RyaW5nOiB0cnVlLFxuICAgICAgICBmaWxlbmFtZTogbG9hZGVyVXRpbHMuZ2V0UmVtYWluaW5nUmVxdWVzdCh0aGlzKS5yZXBsYWNlKC9eIS8sICcnKVxuICAgIH0sIHF1ZXJ5LmNvbXBpbGVyIHx8IHt9KSkocXVlcnkubG9jYWxzIHx8IHt9KVxufVxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=