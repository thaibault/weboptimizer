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

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.resolvedConfiguration = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _helper = require('./helper.compiled');

var _helper2 = _interopRequireDefault(_helper);

var _package = require('./package');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}
// NOTE: "{configuration as metaConfiguration}" would result in a read only
// variable named "metaConfiguration".

var metaConfiguration = _package.configuration;
/*
    To assume to go two folder up from this file until there is no
    "node_modules" parent folder is usually resilient again dealing with
    projects where current working directory isn't the projects directory and
    this library is located as a nested dependency.
*/
metaConfiguration.default.path.context = __dirname;
metaConfiguration.default.contextType = 'main';
while (true) {
    metaConfiguration.default.path.context = _path2.default.resolve(metaConfiguration.default.path.context, '../../');
    if (_path2.default.basename(_path2.default.dirname(metaConfiguration.default.path.context)) !== 'node_modules') break;
}
if (_path2.default.basename(_path2.default.dirname(process.cwd())) === 'node_modules' || _path2.default.basename(_path2.default.dirname(process.cwd())) === '.staging' && _path2.default.basename(_path2.default.dirname(_path2.default.dirname(process.cwd()))) === 'node_modules') {
    /*
        NOTE: If we are dealing was a dependency project use current directory
        as context.
    */
    metaConfiguration.default.path.context = process.cwd();
    metaConfiguration.default.contextType = 'dependency';
} else
    /*
        NOTE: If the current working directory references this file via a
        linked "node_modules" folder using current working directory as context
        is a better assumption than two folders up the hierarchy.
    */
    try {
        if (fileSystem.lstatSync(_path2.default.join(process.cwd(), 'node_modules')).isSymbolicLink()) metaConfiguration.default.path.context = process.cwd();
    } catch (error) {}
var specificConfiguration = void 0;
try {
    /* eslint-disable no-eval */
    specificConfiguration = eval('require')(_path2.default.join(metaConfiguration.default.path.context, 'package'));
    /* eslint-enable no-eval */
} catch (error) {
    specificConfiguration = { name: 'mockup' };
    metaConfiguration.default.path.context = process.cwd();
}
var name = specificConfiguration.name;
specificConfiguration = specificConfiguration.webOptimizer || {};
specificConfiguration.name = name;
// endregion
// region loading default configuration
// NOTE: Given node command line arguments results in "npm_config_*"
// environment variables.
var debug = metaConfiguration.default.debug;
if (specificConfiguration.debug !== undefined) debug = specificConfiguration.debug;else if (process.env.npm_config_dev === 'true') debug = true;
metaConfiguration.default.path.context += '/';
// Merges final default configuration object depending on given target
// environment.
var libraryConfiguration = metaConfiguration.library;
var configuration = void 0;
if (debug) configuration = _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(metaConfiguration.default, metaConfiguration.debug), metaConfiguration.debug);else configuration = metaConfiguration.default;
configuration.debug = debug;
if ((0, _typeof3.default)(configuration.library) === 'object') _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(libraryConfiguration, configuration.library), configuration.library);
if ('library' in specificConfiguration && specificConfiguration.library === true || ('library' in specificConfiguration && specificConfiguration.library === undefined || !('library' in specificConfiguration)) && configuration.library) configuration = _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, libraryConfiguration), libraryConfiguration);
// endregion
/*
    region merging and evaluating default, test, document, specific and dynamic
    settings
*/
// / region load additional dynamically given configuration
var count = 0;
var filePath = null;
while (true) {
    var newFilePath = configuration.path.context + ('.dynamicConfiguration-' + count + '.json');
    if (!_clientnode2.default.isFileSync(newFilePath)) break;
    filePath = newFilePath;
    count += 1;
}
var runtimeInformation = {
    givenCommandLineArguments: process.argv
};
if (filePath) {
    runtimeInformation = JSON.parse(fileSystem.readFileSync(filePath, {
        encoding: configuration.encoding }));
    fileSystem.unlink(filePath, function (error) {
        if (error) throw error;
    });
}
// // region apply use case specific configuration
if (runtimeInformation.givenCommandLineArguments.length > 2) {
    var _arr = ['document', 'test', 'test:browser'];

    for (var _i = 0; _i < _arr.length; _i++) {
        var type = _arr[_i];
        if (runtimeInformation.givenCommandLineArguments[2] === type) _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, configuration[type]), configuration[type]);
    }
} // // endregion
var _arr2 = ['document', 'test', 'test:Browser'];
for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var _type = _arr2[_i2];
    delete configuration[_type];
} // / endregion
_clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(_clientnode2.default.modifyObject(configuration, specificConfiguration), runtimeInformation), specificConfiguration, runtimeInformation);
var result = null;
if (runtimeInformation.givenCommandLineArguments.length > 3) result = _clientnode2.default.stringParseEncodedObject(runtimeInformation.givenCommandLineArguments[runtimeInformation.givenCommandLineArguments.length - 1], configuration, 'configuration');
if (_clientnode2.default.isPlainObject(result)) _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, result), result);
// endregion
// / region determine existing pre compiled dll manifests file paths
configuration.dllManifestFilePaths = [];
if (_clientnode2.default.isDirectorySync(configuration.path.target.base)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(fileSystem.readdirSync(configuration.path.target.base)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var fileName = _step.value;

            if (fileName.match(/^.*\.dll-manifest\.json$/)) configuration.dllManifestFilePaths.push(_path2.default.resolve(configuration.path.target.base, fileName));
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
} // / endregion
// / region build absolute paths
configuration.path.base = _path2.default.resolve(configuration.path.context, configuration.path.base);
for (var key in configuration.path) {
    if (configuration.path.hasOwnProperty(key) && key !== 'base' && typeof configuration.path[key] === 'string') configuration.path[key] = _path2.default.resolve(configuration.path.base, configuration.path[key]) + '/';else if (_clientnode2.default.isPlainObject(configuration.path[key])) {
        configuration.path[key].base = _path2.default.resolve(configuration.path.base, configuration.path[key].base);
        for (var subKey in configuration.path[key]) {
            if (configuration.path[key].hasOwnProperty(subKey) && !['base', 'public'].includes(subKey) && typeof configuration.path[key][subKey] === 'string') configuration.path[key][subKey] = _path2.default.resolve(configuration.path[key].base, configuration.path[key][subKey]) + '/';else if (_clientnode2.default.isPlainObject(configuration.path[key][subKey])) {
                configuration.path[key][subKey].base = _path2.default.resolve(configuration.path[key].base, configuration.path[key][subKey].base);
                for (var subSubKey in configuration.path[key][subKey]) {
                    if (configuration.path[key][subKey].hasOwnProperty(subSubKey) && subSubKey !== 'base' && typeof configuration.path[key][subKey][subSubKey] === 'string') configuration.path[key][subKey][subSubKey] = _path2.default.resolve(configuration.path[key][subKey].base, configuration.path[key][subKey][subSubKey]) + '/';
                }
            }
        }
    }
} // / endregion
var now = new Date();
var resolvedConfiguration = exports.resolvedConfiguration = _clientnode2.default.evaluateDynamicDataStructure(configuration, {
    currentPath: process.cwd(),
    fileSystem: fileSystem,
    Helper: _helper2.default,
    // IgnoreTypeCheck
    isDLLUseful: 2 < configuration.givenCommandLineArguments.length && (['build:dll', 'watch:dll'].includes(
    // IgnoreTypeCheck
    configuration.givenCommandLineArguments[2]) || configuration.dllManifestFilePaths.length && ['build', 'serve', 'test:browser'].includes(
    // IgnoreTypeCheck
    configuration.givenCommandLineArguments[2])),
    path: _path2.default,
    /* eslint-disable no-eval */
    require: eval('require'),
    /* eslint-enable no-eval */
    Tools: _clientnode2.default,
    webOptimizerPath: __dirname,
    now: now,
    nowUTCTimestamp: _clientnode2.default.numberGetUTCTimestamp(now)
});
// region consolidate file specific build configuration
// Apply default file level build configurations to all file type specific
// ones.
var defaultConfiguration = resolvedConfiguration.build.types.default;
delete resolvedConfiguration.build.types.default;
for (var _type2 in resolvedConfiguration.build.types) {
    if (resolvedConfiguration.build.types.hasOwnProperty(_type2)) resolvedConfiguration.build.types[_type2] = _clientnode2.default.extendObject(true, {}, defaultConfiguration, _clientnode2.default.extendObject(true, { extension: _type2 }, resolvedConfiguration.build.types[_type2], { type: _type2 }));
} // endregion
// region resolve module location and determine which asset types are needed
resolvedConfiguration.module.locations = _helper2.default.determineModuleLocations(resolvedConfiguration.injection.internal, resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.extensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base);
resolvedConfiguration.injection = _helper2.default.resolveInjection(resolvedConfiguration.injection, _helper2.default.resolveBuildConfigurationFilePaths(resolvedConfiguration.build.types, resolvedConfiguration.path.source.asset.base, _helper2.default.normalizePaths(resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
    return _path2.default.resolve(resolvedConfiguration.path.context, filePath);
}).filter(function (filePath) {
    return !resolvedConfiguration.path.context.startsWith(filePath);
})), resolvedConfiguration.package.main.fileNames), resolvedConfiguration.injection.autoExclude, resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.extensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore);
var internalInjection = resolvedConfiguration.injection.internal;
resolvedConfiguration.injection.internal = {
    given: resolvedConfiguration.injection.internal,
    normalized: _helper2.default.resolveModulesInFolders(_helper2.default.normalizeInternalInjection(internalInjection), resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
        return _path2.default.resolve(resolvedConfiguration.path.context, filePath);
    }).filter(function (filePath) {
        return !resolvedConfiguration.path.context.startsWith(filePath);
    })) };
resolvedConfiguration.needed = { javaScript: configuration.debug && ['serve', 'test:browser'].includes(resolvedConfiguration.givenCommandLineArguments[2]) };
for (var chunkName in resolvedConfiguration.injection.internal.normalized) {
    if (resolvedConfiguration.injection.internal.normalized.hasOwnProperty(chunkName)) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = (0, _getIterator3.default)(resolvedConfiguration.injection.internal.normalized[chunkName]), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var moduleID = _step2.value;

                var _filePath = _helper2.default.determineModuleFilePath(moduleID, resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.extensions, resolvedConfiguration.path.context,
                /*
                    NOTE: We doesn't use
                    "resolvedConfiguration.path.source.asset.base" because we
                    have already resolve all module ids.
                */
                './', resolvedConfiguration.path.ignore, resolvedConfiguration.module.directoryNames, resolvedConfiguration.package.main.fileNames, resolvedConfiguration.package.main.propertyNames, resolvedConfiguration.package.aliasPropertyNames, resolvedConfiguration.encoding);
                var _type3 = void 0;
                if (_filePath) _type3 = _helper2.default.determineAssetType(_filePath, resolvedConfiguration.build.types, resolvedConfiguration.path);else throw new Error('Given request "' + moduleID + '" couldn\'t be resolved.');
                if (_type3) resolvedConfiguration.needed[_type3] = true;
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    }
} // endregion
// region adding special aliases
// NOTE: This alias couldn't be set in the "package.json" file since this would
// result in an endless loop.
resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader = '';
var _iteratorNormalCompletion3 = true;
var _didIteratorError3 = false;
var _iteratorError3 = undefined;

try {
    for (var _iterator3 = (0, _getIterator3.default)(resolvedConfiguration.files.defaultHTML.template.use), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var loader = _step3.value;

        if (resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader) resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += '!';
        resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += loader.loader;
        if (loader.options) resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += '?' + _clientnode2.default.convertCircularObjectToJSON(loader.options);
    }
} catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
        }
    } finally {
        if (_didIteratorError3) {
            throw _iteratorError3;
        }
    }
}

resolvedConfiguration.module.aliases.webOptimizerDefaultTemplateFilePath$ = resolvedConfiguration.files.defaultHTML.template.filePath;
// endregion
// region apply html webpack plugin workarounds
/*
    NOTE: Provides a workaround to handle a bug with chained loader
    configurations.
*/
var _iteratorNormalCompletion4 = true;
var _didIteratorError4 = false;
var _iteratorError4 = undefined;

try {
    for (var _iterator4 = (0, _getIterator3.default)(resolvedConfiguration.files.html), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var htmlConfiguration = _step4.value;

        _clientnode2.default.extendObject(true, htmlConfiguration, resolvedConfiguration.files.defaultHTML);
        htmlConfiguration.template.request = htmlConfiguration.template.filePath;
        if (htmlConfiguration.template.filePath !== resolvedConfiguration.files.defaultHTML.template.filePath && htmlConfiguration.template.options) {
            var requestString = new String(htmlConfiguration.template.request + _clientnode2.default.convertCircularObjectToJSON(htmlConfiguration.template.options));
            requestString.replace = function (string) {
                return function (_search, _replacement) {
                    return string;
                };
            }(htmlConfiguration.template.filePath);
            htmlConfiguration.template.request = requestString;
        }
    }
    // endregion
} catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
        }
    } finally {
        if (_didIteratorError4) {
            throw _iteratorError4;
        }
    }
}

exports.default = resolvedConfiguration;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QSIsImZpbGUiOiJjb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB0eXBlIHtQbGFpbk9iamVjdH0gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcbi8vIE5PVEU6IFwie2NvbmZpZ3VyYXRpb24gYXMgbWV0YUNvbmZpZ3VyYXRpb259XCIgd291bGQgcmVzdWx0IGluIGEgcmVhZCBvbmx5XG4vLyB2YXJpYWJsZSBuYW1lZCBcIm1ldGFDb25maWd1cmF0aW9uXCIuXG5pbXBvcnQge2NvbmZpZ3VyYXRpb24gYXMgZ2l2ZW5NZXRhQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9wYWNrYWdlJ1xuaW1wb3J0IHR5cGUge1xuICAgIERlZmF1bHRDb25maWd1cmF0aW9uLFxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgSFRNTENvbmZpZ3VyYXRpb24sXG4gICAgSW50ZXJuYWxJbmplY3Rpb24sXG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIE1ldGFDb25maWd1cmF0aW9uLFxuICAgIFJlc29sdmVkQ29uZmlndXJhdGlvblxufSBmcm9tICcuL3R5cGUnXG5sZXQgbWV0YUNvbmZpZ3VyYXRpb246TWV0YUNvbmZpZ3VyYXRpb24gPSBnaXZlbk1ldGFDb25maWd1cmF0aW9uXG4vKlxuICAgIFRvIGFzc3VtZSB0byBnbyB0d28gZm9sZGVyIHVwIGZyb20gdGhpcyBmaWxlIHVudGlsIHRoZXJlIGlzIG5vXG4gICAgXCJub2RlX21vZHVsZXNcIiBwYXJlbnQgZm9sZGVyIGlzIHVzdWFsbHkgcmVzaWxpZW50IGFnYWluIGRlYWxpbmcgd2l0aFxuICAgIHByb2plY3RzIHdoZXJlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgaXNuJ3QgdGhlIHByb2plY3RzIGRpcmVjdG9yeSBhbmRcbiAgICB0aGlzIGxpYnJhcnkgaXMgbG9jYXRlZCBhcyBhIG5lc3RlZCBkZXBlbmRlbmN5LlxuKi9cbm1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gX19kaXJuYW1lXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmNvbnRleHRUeXBlID0gJ21haW4nXG53aGlsZSAodHJ1ZSkge1xuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCwgJy4uLy4uLycpXG4gICAgaWYgKHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dFxuICAgICkpICE9PSAnbm9kZV9tb2R1bGVzJylcbiAgICAgICAgYnJlYWtcbn1cbmlmIChcbiAgICBwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkgPT09ICdub2RlX21vZHVsZXMnIHx8XG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpID09PSAnLnN0YWdpbmcnICYmXG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSkgPT09ICdub2RlX21vZHVsZXMnXG4pIHtcbiAgICAvKlxuICAgICAgICBOT1RFOiBJZiB3ZSBhcmUgZGVhbGluZyB3YXMgYSBkZXBlbmRlbmN5IHByb2plY3QgdXNlIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgICAgIGFzIGNvbnRleHQuXG4gICAgKi9cbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmNvbnRleHRUeXBlID0gJ2RlcGVuZGVuY3knXG59IGVsc2VcbiAgICAvKlxuICAgICAgICBOT1RFOiBJZiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSByZWZlcmVuY2VzIHRoaXMgZmlsZSB2aWEgYVxuICAgICAgICBsaW5rZWQgXCJub2RlX21vZHVsZXNcIiBmb2xkZXIgdXNpbmcgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBhcyBjb250ZXh0XG4gICAgICAgIGlzIGEgYmV0dGVyIGFzc3VtcHRpb24gdGhhbiB0d28gZm9sZGVycyB1cCB0aGUgaGllcmFyY2h5LlxuICAgICovXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGZpbGVTeXN0ZW0ubHN0YXRTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZChcbiAgICAgICAgKSwgJ25vZGVfbW9kdWxlcycpKS5pc1N5bWJvbGljTGluaygpKVxuICAgICAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5sZXQgc3BlY2lmaWNDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0XG50cnkge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWV2YWwgKi9cbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSBldmFsKCdyZXF1aXJlJykocGF0aC5qb2luKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCwgJ3BhY2thZ2UnKSlcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWV2YWwgKi9cbn0gY2F0Y2ggKGVycm9yKSB7XG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uID0ge25hbWU6ICdtb2NrdXAnfVxuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxufVxuY29uc3QgbmFtZTpzdHJpbmcgPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ubmFtZVxuc3BlY2lmaWNDb25maWd1cmF0aW9uID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLndlYk9wdGltaXplciB8fCB7fVxuc3BlY2lmaWNDb25maWd1cmF0aW9uLm5hbWUgPSBuYW1lXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBsb2FkaW5nIGRlZmF1bHQgY29uZmlndXJhdGlvblxuLy8gTk9URTogR2l2ZW4gbm9kZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzIHJlc3VsdHMgaW4gXCJucG1fY29uZmlnXypcIlxuLy8gZW52aXJvbm1lbnQgdmFyaWFibGVzLlxubGV0IGRlYnVnOmJvb2xlYW4gPSBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmRlYnVnXG5pZiAoc3BlY2lmaWNDb25maWd1cmF0aW9uLmRlYnVnICE9PSB1bmRlZmluZWQpXG4gICAgZGVidWcgPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24uZGVidWdcbmVsc2UgaWYgKHByb2Nlc3MuZW52Lm5wbV9jb25maWdfZGV2ID09PSAndHJ1ZScpXG4gICAgZGVidWcgPSB0cnVlXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCArPSAnLydcbi8vIE1lcmdlcyBmaW5hbCBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IGRlcGVuZGluZyBvbiBnaXZlbiB0YXJnZXRcbi8vIGVudmlyb25tZW50LlxuY29uc3QgbGlicmFyeUNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSBtZXRhQ29uZmlndXJhdGlvbi5saWJyYXJ5XG5sZXQgY29uZmlndXJhdGlvbjpEZWZhdWx0Q29uZmlndXJhdGlvblxuaWYgKGRlYnVnKVxuICAgIGNvbmZpZ3VyYXRpb24gPSBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LCBtZXRhQ29uZmlndXJhdGlvbi5kZWJ1Z1xuICAgICksIG1ldGFDb25maWd1cmF0aW9uLmRlYnVnKVxuZWxzZVxuICAgIGNvbmZpZ3VyYXRpb24gPSBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0XG5jb25maWd1cmF0aW9uLmRlYnVnID0gZGVidWdcbmlmICh0eXBlb2YgY29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSAnb2JqZWN0JylcbiAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICBsaWJyYXJ5Q29uZmlndXJhdGlvbiwgY29uZmlndXJhdGlvbi5saWJyYXJ5XG4gICAgKSwgY29uZmlndXJhdGlvbi5saWJyYXJ5KVxuaWYgKFxuICAgICdsaWJyYXJ5JyBpbiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gJiZcbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ubGlicmFyeSA9PT0gdHJ1ZSB8fCAoXG4gICAgICAgICdsaWJyYXJ5JyBpbiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gJiZcbiAgICAgICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLmxpYnJhcnkgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAhKCdsaWJyYXJ5JyBpbiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24pXG4gICAgKSAmJiBjb25maWd1cmF0aW9uLmxpYnJhcnlcbilcbiAgICBjb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgY29uZmlndXJhdGlvbiwgbGlicmFyeUNvbmZpZ3VyYXRpb25cbiAgICApLCBsaWJyYXJ5Q29uZmlndXJhdGlvbilcbi8vIGVuZHJlZ2lvblxuLypcbiAgICByZWdpb24gbWVyZ2luZyBhbmQgZXZhbHVhdGluZyBkZWZhdWx0LCB0ZXN0LCBkb2N1bWVudCwgc3BlY2lmaWMgYW5kIGR5bmFtaWNcbiAgICBzZXR0aW5nc1xuKi9cbi8vIC8gcmVnaW9uIGxvYWQgYWRkaXRpb25hbCBkeW5hbWljYWxseSBnaXZlbiBjb25maWd1cmF0aW9uXG5sZXQgY291bnQ6bnVtYmVyID0gMFxubGV0IGZpbGVQYXRoOj9zdHJpbmcgPSBudWxsXG53aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IG5ld0ZpbGVQYXRoOnN0cmluZyA9IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0ICtcbiAgICAgICAgYC5keW5hbWljQ29uZmlndXJhdGlvbi0ke2NvdW50fS5qc29uYFxuICAgIGlmICghVG9vbHMuaXNGaWxlU3luYyhuZXdGaWxlUGF0aCkpXG4gICAgICAgIGJyZWFrXG4gICAgZmlsZVBhdGggPSBuZXdGaWxlUGF0aFxuICAgIGNvdW50ICs9IDFcbn1cbmxldCBydW50aW1lSW5mb3JtYXRpb246UGxhaW5PYmplY3QgPSB7XG4gICAgZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50czogcHJvY2Vzcy5hcmd2XG59XG5pZiAoZmlsZVBhdGgpIHtcbiAgICBydW50aW1lSW5mb3JtYXRpb24gPSBKU09OLnBhcnNlKGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCB7XG4gICAgICAgIGVuY29kaW5nOiAoY29uZmlndXJhdGlvbi5lbmNvZGluZzpzdHJpbmcpfSkpXG4gICAgZmlsZVN5c3RlbS51bmxpbmsoZmlsZVBhdGgsIChlcnJvcjo/RXJyb3IpOnZvaWQgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgIH0pXG59XG4vLyAvLyByZWdpb24gYXBwbHkgdXNlIGNhc2Ugc3BlY2lmaWMgY29uZmlndXJhdGlvblxuaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDIpXG4gICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2RvY3VtZW50JywgJ3Rlc3QnLCAndGVzdDpicm93c2VyJ10pXG4gICAgICAgIGlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gdHlwZSlcbiAgICAgICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgY29uZmlndXJhdGlvblt0eXBlXVxuICAgICAgICAgICAgKSwgY29uZmlndXJhdGlvblt0eXBlXSlcbi8vIC8vIGVuZHJlZ2lvblxuZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2RvY3VtZW50JywgJ3Rlc3QnLCAndGVzdDpCcm93c2VyJ10pXG4gICAgZGVsZXRlIGNvbmZpZ3VyYXRpb25bdHlwZV1cbi8vIC8gZW5kcmVnaW9uXG5Ub29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICBjb25maWd1cmF0aW9uLCBzcGVjaWZpY0NvbmZpZ3VyYXRpb25cbiksIHJ1bnRpbWVJbmZvcm1hdGlvbiksIHNwZWNpZmljQ29uZmlndXJhdGlvbiwgcnVudGltZUluZm9ybWF0aW9uKVxubGV0IHJlc3VsdDo/UGxhaW5PYmplY3QgPSBudWxsXG5pZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoID4gMylcbiAgICByZXN1bHQgPSBUb29scy5zdHJpbmdQYXJzZUVuY29kZWRPYmplY3QoXG4gICAgICAgIHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzW3J1bnRpbWVJbmZvcm1hdGlvblxuICAgICAgICAgICAgLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoIC0gMV0sXG4gICAgICAgIGNvbmZpZ3VyYXRpb24sICdjb25maWd1cmF0aW9uJylcbmlmIChUb29scy5pc1BsYWluT2JqZWN0KHJlc3VsdCkpXG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChjb25maWd1cmF0aW9uLCByZXN1bHQpLCByZXN1bHQpXG4vLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGRldGVybWluZSBleGlzdGluZyBwcmUgY29tcGlsZWQgZGxsIG1hbmlmZXN0cyBmaWxlIHBhdGhzXG5jb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzID0gW11cbmlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMoY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKSlcbiAgICBmb3IgKGNvbnN0IGZpbGVOYW1lOnN0cmluZyBvZiBmaWxlU3lzdGVtLnJlYWRkaXJTeW5jKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2VcbiAgICApKVxuICAgICAgICBpZiAoZmlsZU5hbWUubWF0Y2goL14uKlxcLmRsbC1tYW5pZmVzdFxcLmpzb24kLykpXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLnB1c2gocGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwgZmlsZU5hbWUpKVxuLy8gLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGJ1aWxkIGFic29sdXRlIHBhdGhzXG5jb25maWd1cmF0aW9uLnBhdGguYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UpXG5mb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoKVxuICAgIGlmIChcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9PSAnYmFzZScgJiZcbiAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldID09PSAnc3RyaW5nJ1xuICAgIClcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV1cbiAgICAgICAgKSArICcvJ1xuICAgIGVsc2UgaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QoY29uZmlndXJhdGlvbi5wYXRoW2tleV0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSlcbiAgICAgICAgZm9yIChjb25zdCBzdWJLZXk6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldKVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmhhc093blByb3BlcnR5KHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICAhWydiYXNlJywgJ3B1YmxpYyddLmluY2x1ZGVzKHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldXG4gICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNQbGFpbk9iamVjdChjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5iYXNlKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViU3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldKVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICApICYmIHN1YlN1YktleSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtzdWJTdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtzdWJTdWJLZXldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgfVxuICAgIH1cbi8vIC8gZW5kcmVnaW9uXG5jb25zdCBub3c6RGF0ZSA9IG5ldyBEYXRlKClcbmV4cG9ydCBjb25zdCByZXNvbHZlZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRDb25maWd1cmF0aW9uID1cbiAgICBUb29scy5ldmFsdWF0ZUR5bmFtaWNEYXRhU3RydWN0dXJlKGNvbmZpZ3VyYXRpb24sIHtcbiAgICAgICAgY3VycmVudFBhdGg6IHByb2Nlc3MuY3dkKCksXG4gICAgICAgIGZpbGVTeXN0ZW0sXG4gICAgICAgIEhlbHBlcixcbiAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgIGlzRExMVXNlZnVsOiAyIDwgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAmJiAoXG4gICAgICAgICAgICBbJ2J1aWxkOmRsbCcsICd3YXRjaDpkbGwnXS5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pIHx8XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLmxlbmd0aCAmJlxuICAgICAgICAgICAgWydidWlsZCcsICdzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKSxcbiAgICAgICAgcGF0aCxcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tZXZhbCAqL1xuICAgICAgICByZXF1aXJlOiBldmFsKCdyZXF1aXJlJyksXG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tZXZhbCAqL1xuICAgICAgICBUb29scyxcbiAgICAgICAgd2ViT3B0aW1pemVyUGF0aDogX19kaXJuYW1lLFxuICAgICAgICBub3csXG4gICAgICAgIG5vd1VUQ1RpbWVzdGFtcDogVG9vbHMubnVtYmVyR2V0VVRDVGltZXN0YW1wKG5vdylcbiAgICB9KVxuLy8gcmVnaW9uIGNvbnNvbGlkYXRlIGZpbGUgc3BlY2lmaWMgYnVpbGQgY29uZmlndXJhdGlvblxuLy8gQXBwbHkgZGVmYXVsdCBmaWxlIGxldmVsIGJ1aWxkIGNvbmZpZ3VyYXRpb25zIHRvIGFsbCBmaWxlIHR5cGUgc3BlY2lmaWNcbi8vIG9uZXMuXG5jb25zdCBkZWZhdWx0Q29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9XG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmRlZmF1bHRcbmRlbGV0ZSByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMuZGVmYXVsdFxuZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMpXG4gICAgaWYgKHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSlcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW3R5cGVdID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtcbiAgICAgICAgfSwgZGVmYXVsdENvbmZpZ3VyYXRpb24sIFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgIHRydWUsIHtleHRlbnNpb246IHR5cGV9LCByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNbdHlwZV0sXG4gICAgICAgICAgICB7dHlwZX0pKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gcmVzb2x2ZSBtb2R1bGUgbG9jYXRpb24gYW5kIGRldGVybWluZSB3aGljaCBhc3NldCB0eXBlcyBhcmUgbmVlZGVkXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5leHRlbnNpb25zLCByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlKVxucmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbiA9IEhlbHBlci5yZXNvbHZlSW5qZWN0aW9uKFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24sIEhlbHBlci5yZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICBIZWxwZXIubm9ybWFsaXplUGF0aHMocmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgIXJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpKSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXNcbiAgICApLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmF1dG9FeGNsdWRlLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUpXG5jb25zdCBpbnRlcm5hbEluamVjdGlvbjphbnkgPSByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsID0ge1xuICAgIGdpdmVuOiByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLFxuICAgIG5vcm1hbGl6ZWQ6IEhlbHBlci5yZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgSGVscGVyLm5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKGludGVybmFsSW5qZWN0aW9uKSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAhcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpfVxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm5lZWRlZCA9IHtqYXZhU2NyaXB0OiBjb25maWd1cmF0aW9uLmRlYnVnICYmIFtcbiAgICAnc2VydmUnLCAndGVzdDpicm93c2VyJ1xuXS5pbmNsdWRlcyhyZXNvbHZlZENvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSl9XG5mb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbFxuICAgIC5ub3JtYWxpemVkXG4pXG4gICAgaWYgKHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgY2h1bmtOYW1lXG4gICAgKSlcbiAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbFxuICAgICAgICAgICAgLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQsIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBOT1RFOiBXZSBkb2Vzbid0IHVzZVxuICAgICAgICAgICAgICAgICAgICBcInJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlXCIgYmVjYXVzZSB3ZVxuICAgICAgICAgICAgICAgICAgICBoYXZlIGFscmVhZHkgcmVzb2x2ZSBhbGwgbW9kdWxlIGlkcy5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICcuLycsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZW5jb2RpbmcpXG4gICAgICAgICAgICBsZXQgdHlwZTo/c3RyaW5nXG4gICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgdHlwZSA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEdpdmVuIHJlcXVlc3QgXCIke21vZHVsZUlEfVwiIGNvdWxkbid0IGJlIHJlc29sdmVkLmApXG4gICAgICAgICAgICBpZiAodHlwZSlcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkW3R5cGVdID0gdHJ1ZVxuICAgICAgICB9XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhZGRpbmcgc3BlY2lhbCBhbGlhc2VzXG4vLyBOT1RFOiBUaGlzIGFsaWFzIGNvdWxkbid0IGJlIHNldCBpbiB0aGUgXCJwYWNrYWdlLmpzb25cIiBmaWxlIHNpbmNlIHRoaXMgd291bGRcbi8vIHJlc3VsdCBpbiBhbiBlbmRsZXNzIGxvb3AuXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciA9ICcnXG5mb3IgKGNvbnN0IGxvYWRlcjpQbGFpbk9iamVjdCBvZiByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAudGVtcGxhdGUudXNlXG4pIHtcbiAgICBpZiAoXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAgICAgLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXJcbiAgICApXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAgICAgLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXIgKz0gJyEnXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzXG4gICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyICs9IGxvYWRlci5sb2FkZXJcbiAgICBpZiAobG9hZGVyLm9wdGlvbnMpXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAgICAgLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXIgKz0gJz8nICtcbiAgICAgICAgICAgICAgICBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04obG9hZGVyLm9wdGlvbnMpXG59XG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZVBhdGgkID1cbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUuZmlsZVBhdGhcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGFwcGx5IGh0bWwgd2VicGFjayBwbHVnaW4gd29ya2Fyb3VuZHNcbi8qXG4gICAgTk9URTogUHJvdmlkZXMgYSB3b3JrYXJvdW5kIHRvIGhhbmRsZSBhIGJ1ZyB3aXRoIGNoYWluZWQgbG9hZGVyXG4gICAgY29uZmlndXJhdGlvbnMuXG4qL1xuZm9yIChcbiAgICBsZXQgaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24gb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmh0bWxcbikge1xuICAgIFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgdHJ1ZSwgaHRtbENvbmZpZ3VyYXRpb24sIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTClcbiAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5yZXF1ZXN0ID0gaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGhcbiAgICBpZiAoXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoICE9PVxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoICYmXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLm9wdGlvbnNcbiAgICApIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdFN0cmluZzpPYmplY3QgPSBuZXcgU3RyaW5nKFxuICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdCArXG4gICAgICAgICAgICBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUub3B0aW9ucykpXG4gICAgICAgIHJlcXVlc3RTdHJpbmcucmVwbGFjZSA9ICgoc3RyaW5nOnN0cmluZyk6RnVuY3Rpb24gPT4gKFxuICAgICAgICAgICAgX3NlYXJjaDpSZWdFeHB8c3RyaW5nLCBfcmVwbGFjZW1lbnQ6c3RyaW5nfChcbiAgICAgICAgICAgICAgICAuLi5tYXRjaGVzOkFycmF5PHN0cmluZz5cbiAgICAgICAgICAgICkgPT4gc3RyaW5nXG4gICAgICAgICk6c3RyaW5nID0+IHN0cmluZykoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3QgPSByZXF1ZXN0U3RyaW5nXG4gICAgfVxufVxuLy8gZW5kcmVnaW9uXG5leHBvcnQgZGVmYXVsdCByZXNvbHZlZENvbmZpZ3VyYXRpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19