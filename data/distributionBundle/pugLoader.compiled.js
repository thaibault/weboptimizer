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

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _pug = require('pug');

var pug = _interopRequireWildcard(_pug);

var _loaderUtils = require('loader-utils');

var loaderUtils = _interopRequireWildcard(_loaderUtils);

var _configurator = require('./configurator.compiled');

var _configurator2 = _interopRequireDefault(_configurator);

var _helper = require('./helper.compiled');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}
// endregion

// endregion
// region types
module.exports = function (source) {
    if (this.cacheable) this.cacheable();
    const query = _helper2.default.convertSubstringInPlainObject(_helper2.default.extendObject(true, {
        moduleAliases: [],
        knownExtensions: ['.pug', '.html', '.js', '.css'],
        context: './'
    }, this.options.pug || {}, loaderUtils.parseQuery(this.query)), /#%%%#/g, '!');
    const compile = (template, options = query.compiler) => (locals = {}) => {
        options = _helper2.default.extendObject(true, {
            filename: template, doctype: 'html',
            compileDebug: this.debug || false
        }, options);
        let templateFunction;
        if (options.isString) {
            delete options.isString;
            templateFunction = pug.compile(template, options);
        } else templateFunction = pug.compileFile(template, options);
        return templateFunction(_helper2.default.extendObject(true, {
            configuration: _configurator2.default, require: request => {
                const template = request.replace(/^(.+)\?[^?]+$/, '$1');
                const queryMatch = request.match(/^[^?]+\?(.+)$/, '$1');
                let nestedLocals = {};
                if (queryMatch) {
                    const evaluationFunction = (request, template, source, compile, locals) =>
                    // IgnoreTypeCheck
                    new Function('request', 'template', 'source', 'compile', 'locals', `return ${ queryMatch[1] }`)(request, template, source, compile, locals);
                    nestedLocals = evaluationFunction(request, template, source, compile, locals);
                }
                const options = _helper2.default.extendObject(true, {
                    encoding: 'utf-8'
                }, nestedLocals.options || {});
                if (options.isString) return compile(template, options)(nestedLocals);
                const templateFilePath = _helper2.default.determineModuleFilePath(template, query.moduleAliases, query.knownExtensions, query.context);
                this.addDependency(templateFilePath);
                if (queryMatch || templateFilePath.endsWith('.pug')) return compile(templateFilePath, options)(nestedLocals);
                return fileSystem.readFileSync(templateFilePath, options);
            } }, locals));
    };
    return compile(source, _helper2.default.extendObject(true, {
        isString: true,
        filename: loaderUtils.getRemainingRequest(this).replace(/^!/, '')
    }, query.compiler || {}))(query.locals || {});
};
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,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QUFLLGFBQUwsQ0FBbUIsZ0JBQW5CO0FBQ0Esb0JBQUksY0FBYyxpQkFBaUIsUUFBakIsQ0FBMEIsTUFBMUIsQ0FBbEIsRUFDSSxPQUFPLFFBQVEsZ0JBQVIsRUFBMEIsT0FBMUIsRUFBbUMsWUFBbkMsQ0FBUDtBQUNKLHVCQUFPLFdBQVcsWUFBWCxDQUF3QixnQkFBeEIsRUFBMEMsT0FBMUMsQ0FBUDtBQUNILGFBL0I2QyxFQUExQixFQStCaEIsTUEvQmdCLENBQWpCLENBQVA7QUFnQ0gsS0E3Q0Q7QUE4Q0EsV0FBTyxRQUFRLE1BQVIsRUFBZ0IsaUJBQU8sWUFBUCxDQUFvQixJQUFwQixFQUEwQjtBQUM3QyxrQkFBVSxJQURtQztBQUU3QyxrQkFBVSxZQUFZLG1CQUFaLENBQWdDLElBQWhDLEVBQXNDLE9BQXRDLENBQThDLElBQTlDLEVBQW9ELEVBQXBEO0FBRm1DLEtBQTFCLEVBR3BCLE1BQU0sUUFBTixJQUFrQixFQUhFLENBQWhCLEVBR21CLE1BQU0sTUFBTixJQUFnQixFQUhuQyxDQUFQO0FBSUgsQ0E1REQ7QUE2REE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicHVnTG9hZGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgKiBhcyBwdWcgZnJvbSAncHVnJ1xuaW1wb3J0ICogYXMgbG9hZGVyVXRpbHMgZnJvbSAnbG9hZGVyLXV0aWxzJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IGNvbmZpZ3VyYXRpb24gZnJvbSAnLi9jb25maWd1cmF0b3IuY29tcGlsZWQnXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gdHlwZXNcbnR5cGUgVGVtcGxhdGVGdW5jdGlvbiA9IChsb2NhbHM6T2JqZWN0KSA9PiBzdHJpbmdcbnR5cGUgQ29tcGlsZUZ1bmN0aW9uID0gKHRlbXBsYXRlOnN0cmluZywgb3B0aW9uczpPYmplY3QpID0+IFRlbXBsYXRlRnVuY3Rpb25cbi8vIGVuZHJlZ2lvblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzb3VyY2U6c3RyaW5nKTpzdHJpbmcge1xuICAgIGlmICh0aGlzLmNhY2hlYWJsZSlcbiAgICAgICAgdGhpcy5jYWNoZWFibGUoKVxuICAgIGNvbnN0IHF1ZXJ5Ok9iamVjdCA9IEhlbHBlci5jb252ZXJ0U3Vic3RyaW5nSW5QbGFpbk9iamVjdChcbiAgICAgICAgSGVscGVyLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICBtb2R1bGVBbGlhc2VzOiBbXSxcbiAgICAgICAgICAgIGtub3duRXh0ZW5zaW9uczogWycucHVnJywgJy5odG1sJywgJy5qcycsICcuY3NzJ10sXG4gICAgICAgICAgICBjb250ZXh0OiAnLi8nXG4gICAgICAgIH0sIHRoaXMub3B0aW9ucy5wdWcgfHwge30sIGxvYWRlclV0aWxzLnBhcnNlUXVlcnkodGhpcy5xdWVyeSkpLFxuICAgICAgICAvIyUlJSMvZywgJyEnKVxuICAgIGNvbnN0IGNvbXBpbGU6Q29tcGlsZUZ1bmN0aW9uID0gKFxuICAgICAgICB0ZW1wbGF0ZTpzdHJpbmcsIG9wdGlvbnM6T2JqZWN0ID0gcXVlcnkuY29tcGlsZXJcbiAgICApOlRlbXBsYXRlRnVuY3Rpb24gPT4gKGxvY2FsczpPYmplY3QgPSB7fSk6c3RyaW5nID0+IHtcbiAgICAgICAgb3B0aW9ucyA9IEhlbHBlci5leHRlbmRPYmplY3QodHJ1ZSwge1xuICAgICAgICAgICAgZmlsZW5hbWU6IHRlbXBsYXRlLCBkb2N0eXBlOiAnaHRtbCcsXG4gICAgICAgICAgICBjb21waWxlRGVidWc6IHRoaXMuZGVidWcgfHwgZmFsc2VcbiAgICAgICAgfSwgb3B0aW9ucylcbiAgICAgICAgbGV0IHRlbXBsYXRlRnVuY3Rpb246VGVtcGxhdGVGdW5jdGlvblxuICAgICAgICBpZiAob3B0aW9ucy5pc1N0cmluZykge1xuICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuaXNTdHJpbmdcbiAgICAgICAgICAgIHRlbXBsYXRlRnVuY3Rpb24gPSBwdWcuY29tcGlsZSh0ZW1wbGF0ZSwgb3B0aW9ucylcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICB0ZW1wbGF0ZUZ1bmN0aW9uID0gcHVnLmNvbXBpbGVGaWxlKHRlbXBsYXRlLCBvcHRpb25zKVxuICAgICAgICByZXR1cm4gdGVtcGxhdGVGdW5jdGlvbihIZWxwZXIuZXh0ZW5kT2JqZWN0KHRydWUsIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sIHJlcXVpcmU6IChyZXF1ZXN0OnN0cmluZyk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZTpzdHJpbmcgPSByZXF1ZXN0LnJlcGxhY2UoL14oLispXFw/W14/XSskLywgJyQxJylcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeU1hdGNoOj9BcnJheTxzdHJpbmc+ID0gcmVxdWVzdC5tYXRjaChcbiAgICAgICAgICAgICAgICAgICAgL15bXj9dK1xcPyguKykkLywgJyQxJylcbiAgICAgICAgICAgICAgICBsZXQgbmVzdGVkTG9jYWxzOk9iamVjdCA9IHt9XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5TWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZhbHVhdGlvbkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdDpzdHJpbmcsIHRlbXBsYXRlOnN0cmluZywgc291cmNlOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGU6Q29tcGlsZUZ1bmN0aW9uLCBsb2NhbHM6T2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICk6T2JqZWN0ID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVxdWVzdCcsICd0ZW1wbGF0ZScsICdzb3VyY2UnLCAnY29tcGlsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2xvY2FscycsIGByZXR1cm4gJHtxdWVyeU1hdGNoWzFdfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICkocmVxdWVzdCwgdGVtcGxhdGUsIHNvdXJjZSwgY29tcGlsZSwgbG9jYWxzKVxuICAgICAgICAgICAgICAgICAgICBuZXN0ZWRMb2NhbHMgPSBldmFsdWF0aW9uRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LCB0ZW1wbGF0ZSwgc291cmNlLCBjb21waWxlLCBsb2NhbHMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnM6T2JqZWN0ID0gSGVscGVyLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmLTgnXG4gICAgICAgICAgICAgICAgfSwgbmVzdGVkTG9jYWxzLm9wdGlvbnMgfHwge30pXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuaXNTdHJpbmcpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21waWxlKHRlbXBsYXRlLCBvcHRpb25zKShuZXN0ZWRMb2NhbHMpXG4gICAgICAgICAgICAgICAgY29uc3QgdGVtcGxhdGVGaWxlUGF0aDpzdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlLCBxdWVyeS5tb2R1bGVBbGlhc2VzLCBxdWVyeS5rbm93bkV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5LmNvbnRleHQpXG4gICAgICAgICAgICAgICAgdGhpcy5hZGREZXBlbmRlbmN5KHRlbXBsYXRlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5TWF0Y2ggfHwgdGVtcGxhdGVGaWxlUGF0aC5lbmRzV2l0aCgnLnB1ZycpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGlsZSh0ZW1wbGF0ZUZpbGVQYXRoLCBvcHRpb25zKShuZXN0ZWRMb2NhbHMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKHRlbXBsYXRlRmlsZVBhdGgsIG9wdGlvbnMpXG4gICAgICAgICAgICB9fSwgbG9jYWxzKSlcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBpbGUoc291cmNlLCBIZWxwZXIuZXh0ZW5kT2JqZWN0KHRydWUsIHtcbiAgICAgICAgaXNTdHJpbmc6IHRydWUsXG4gICAgICAgIGZpbGVuYW1lOiBsb2FkZXJVdGlscy5nZXRSZW1haW5pbmdSZXF1ZXN0KHRoaXMpLnJlcGxhY2UoL14hLywgJycpXG4gICAgfSwgcXVlcnkuY29tcGlsZXIgfHwge30pKShxdWVyeS5sb2NhbHMgfHwge30pXG59XG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==