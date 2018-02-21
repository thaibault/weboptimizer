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
if ((typeof result === 'undefined' ? 'undefined' : (0, _typeof3.default)(result)) === 'object' && result !== null) {
    if (result.hasOwnProperty('__reference__')) {
        var referenceNames = [].concat(result.__reference__);
        delete result.__reference__;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = (0, _getIterator3.default)(referenceNames), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _name = _step.value;

                _clientnode2.default.extendObject(true, result, configuration[_name]);
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
    }
    _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, result), result);
}
// endregion
// / region determine existing pre compiled dll manifests file paths
configuration.dllManifestFilePaths = [];
if (_clientnode2.default.isDirectorySync(configuration.path.target.base)) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(fileSystem.readdirSync(configuration.path.target.base)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var fileName = _step2.value;

            if (fileName.match(/^.*\.dll-manifest\.json$/)) configuration.dllManifestFilePaths.push(_path2.default.resolve(configuration.path.target.base, fileName));
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
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = (0, _getIterator3.default)(resolvedConfiguration.injection.internal.normalized[chunkName]), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var moduleID = _step3.value;

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
    }
} // endregion
// region adding special aliases
// NOTE: This alias couldn't be set in the "package.json" file since this would
// result in an endless loop.
resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader = '';
var _iteratorNormalCompletion4 = true;
var _didIteratorError4 = false;
var _iteratorError4 = undefined;

try {
    for (var _iterator4 = (0, _getIterator3.default)(resolvedConfiguration.files.defaultHTML.template.use), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var loader = _step4.value;

        if (resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader) resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += '!';
        resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += loader.loader;
        if (loader.options) resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += '?' + _clientnode2.default.convertCircularObjectToJSON(loader.options);
    }
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

resolvedConfiguration.module.aliases.webOptimizerDefaultTemplateFilePath$ = resolvedConfiguration.files.defaultHTML.template.filePath;
// endregion
// region apply html webpack plugin workarounds
/*
    NOTE: Provides a workaround to handle a bug with chained loader
    configurations.
*/
var _iteratorNormalCompletion5 = true;
var _didIteratorError5 = false;
var _iteratorError5 = undefined;

try {
    for (var _iterator5 = (0, _getIterator3.default)(resolvedConfiguration.files.html), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var htmlConfiguration = _step5.value;

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
    _didIteratorError5 = true;
    _iteratorError5 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
        }
    } finally {
        if (_didIteratorError5) {
            throw _iteratorError5;
        }
    }
}

exports.default = resolvedConfiguration;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QkFBdUIsSUFBSSxNQUFKLENBQ3pCLGtCQUFrQixRQUFsQixDQUEyQixPQUEzQixHQUNBLHFCQUFNLDJCQUFOLENBQ0ksa0JBQWtCLFFBQWxCLENBQTJCLE9BRC9CLENBRnlCLENBQTdCO0FBSUEsMEJBQWMsT0FBZCxHQUF5QixVQUFDLE1BQUQ7QUFBQSx1QkFBNEIsVUFDakQsT0FEaUQsRUFDMUIsWUFEMEI7QUFBQSwyQkFJekMsTUFKeUM7QUFBQSxpQkFBNUI7QUFBQSxhQUFELENBSUosa0JBQWtCLFFBQWxCLENBQTJCLFFBSnZCLENBQXhCO0FBS0EsOEJBQWtCLFFBQWxCLENBQTJCLE9BQTNCLEdBQXFDLGFBQXJDO0FBQ0g7QUFDSjtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7O2tCQUNlLHFCO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29uZmlndXJhdG9yLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgdHlwZSB7UGxhaW5PYmplY3R9IGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgKiBhcyBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbi8vIE5PVEU6IE9ubHkgbmVlZGVkIGZvciBkZWJ1Z2dpbmcgdGhpcyBmaWxlLlxudHJ5IHtcbiAgICByZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInKVxufSBjYXRjaCAoZXJyb3IpIHt9XG5cbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG4vLyBOT1RFOiBcIntjb25maWd1cmF0aW9uIGFzIG1ldGFDb25maWd1cmF0aW9ufVwiIHdvdWxkIHJlc3VsdCBpbiBhIHJlYWQgb25seVxuLy8gdmFyaWFibGUgbmFtZWQgXCJtZXRhQ29uZmlndXJhdGlvblwiLlxuaW1wb3J0IHtjb25maWd1cmF0aW9uIGFzIGdpdmVuTWV0YUNvbmZpZ3VyYXRpb259IGZyb20gJy4vcGFja2FnZSdcbmltcG9ydCB0eXBlIHtcbiAgICBEZWZhdWx0Q29uZmlndXJhdGlvbixcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIEhUTUxDb25maWd1cmF0aW9uLFxuICAgIEludGVybmFsSW5qZWN0aW9uLFxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBNZXRhQ29uZmlndXJhdGlvbixcbiAgICBSZXNvbHZlZENvbmZpZ3VyYXRpb25cbn0gZnJvbSAnLi90eXBlJ1xubGV0IG1ldGFDb25maWd1cmF0aW9uOk1ldGFDb25maWd1cmF0aW9uID0gZ2l2ZW5NZXRhQ29uZmlndXJhdGlvblxuLypcbiAgICBUbyBhc3N1bWUgdG8gZ28gdHdvIGZvbGRlciB1cCBmcm9tIHRoaXMgZmlsZSB1bnRpbCB0aGVyZSBpcyBub1xuICAgIFwibm9kZV9tb2R1bGVzXCIgcGFyZW50IGZvbGRlciBpcyB1c3VhbGx5IHJlc2lsaWVudCBhZ2FpbiBkZWFsaW5nIHdpdGhcbiAgICBwcm9qZWN0cyB3aGVyZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGlzbid0IHRoZSBwcm9qZWN0cyBkaXJlY3RvcnkgYW5kXG4gICAgdGhpcyBsaWJyYXJ5IGlzIGxvY2F0ZWQgYXMgYSBuZXN0ZWQgZGVwZW5kZW5jeS5cbiovXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IF9fZGlybmFtZVxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdtYWluJ1xud2hpbGUgKHRydWUpIHtcbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICcuLi8uLi8nKVxuICAgIGlmIChwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHRcbiAgICApKSAhPT0gJ25vZGVfbW9kdWxlcycpXG4gICAgICAgIGJyZWFrXG59XG5pZiAoXG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpID09PSAnbm9kZV9tb2R1bGVzJyB8fFxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSA9PT0gJy5zdGFnaW5nJyAmJlxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkpID09PSAnbm9kZV9tb2R1bGVzJ1xuKSB7XG4gICAgLypcbiAgICAgICAgTk9URTogSWYgd2UgYXJlIGRlYWxpbmcgd2FzIGEgZGVwZW5kZW5jeSBwcm9qZWN0IHVzZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgICAgICBhcyBjb250ZXh0LlxuICAgICovXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdkZXBlbmRlbmN5J1xufSBlbHNlXG4gICAgLypcbiAgICAgICAgTk9URTogSWYgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgcmVmZXJlbmNlcyB0aGlzIGZpbGUgdmlhIGFcbiAgICAgICAgbGlua2VkIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyIHVzaW5nIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgYXMgY29udGV4dFxuICAgICAgICBpcyBhIGJldHRlciBhc3N1bXB0aW9uIHRoYW4gdHdvIGZvbGRlcnMgdXAgdGhlIGhpZXJhcmNoeS5cbiAgICAqL1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChmaWxlU3lzdGVtLmxzdGF0U3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoXG4gICAgICAgICksICdub2RlX21vZHVsZXMnKSkuaXNTeW1ib2xpY0xpbmsoKSlcbiAgICAgICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxubGV0IHNwZWNpZmljQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdFxudHJ5IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1ldmFsICovXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uID0gZXZhbCgncmVxdWlyZScpKHBhdGguam9pbihcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICdwYWNrYWdlJykpXG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1ldmFsICovXG59IGNhdGNoIChlcnJvcikge1xuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHtuYW1lOiAnbW9ja3VwJ31cbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbn1cbmNvbnN0IG5hbWU6c3RyaW5nID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLm5hbWVcbnNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi53ZWJPcHRpbWl6ZXIgfHwge31cbnNwZWNpZmljQ29uZmlndXJhdGlvbi5uYW1lID0gbmFtZVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbG9hZGluZyBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cbi8vIE5PVEU6IEdpdmVuIG5vZGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50cyByZXN1bHRzIGluIFwibnBtX2NvbmZpZ18qXCJcbi8vIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmxldCBkZWJ1Zzpib29sZWFuID0gbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5kZWJ1Z1xuaWYgKHNwZWNpZmljQ29uZmlndXJhdGlvbi5kZWJ1ZyAhPT0gdW5kZWZpbmVkKVxuICAgIGRlYnVnID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLmRlYnVnXG5lbHNlIGlmIChwcm9jZXNzLmVudi5ucG1fY29uZmlnX2RldiA9PT0gJ3RydWUnKVxuICAgIGRlYnVnID0gdHJ1ZVxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgKz0gJy8nXG4vLyBNZXJnZXMgZmluYWwgZGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdCBkZXBlbmRpbmcgb24gZ2l2ZW4gdGFyZ2V0XG4vLyBlbnZpcm9ubWVudC5cbmNvbnN0IGxpYnJhcnlDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0gbWV0YUNvbmZpZ3VyYXRpb24ubGlicmFyeVxubGV0IGNvbmZpZ3VyYXRpb246RGVmYXVsdENvbmZpZ3VyYXRpb25cbmlmIChkZWJ1ZylcbiAgICBjb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdCwgbWV0YUNvbmZpZ3VyYXRpb24uZGVidWdcbiAgICApLCBtZXRhQ29uZmlndXJhdGlvbi5kZWJ1ZylcbmVsc2VcbiAgICBjb25maWd1cmF0aW9uID0gbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdFxuY29uZmlndXJhdGlvbi5kZWJ1ZyA9IGRlYnVnXG5pZiAodHlwZW9mIGNvbmZpZ3VyYXRpb24ubGlicmFyeSA9PT0gJ29iamVjdCcpXG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgbGlicmFyeUNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb24ubGlicmFyeVxuICAgICksIGNvbmZpZ3VyYXRpb24ubGlicmFyeSlcbmlmIChcbiAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLmxpYnJhcnkgPT09IHRydWUgfHwgKFxuICAgICAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgISgnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uKVxuICAgICkgJiYgY29uZmlndXJhdGlvbi5saWJyYXJ5XG4pXG4gICAgY29uZmlndXJhdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24sIGxpYnJhcnlDb25maWd1cmF0aW9uXG4gICAgKSwgbGlicmFyeUNvbmZpZ3VyYXRpb24pXG4vLyBlbmRyZWdpb25cbi8qXG4gICAgcmVnaW9uIG1lcmdpbmcgYW5kIGV2YWx1YXRpbmcgZGVmYXVsdCwgdGVzdCwgZG9jdW1lbnQsIHNwZWNpZmljIGFuZCBkeW5hbWljXG4gICAgc2V0dGluZ3NcbiovXG4vLyAvIHJlZ2lvbiBsb2FkIGFkZGl0aW9uYWwgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvblxubGV0IGNvdW50Om51bWJlciA9IDBcbmxldCBmaWxlUGF0aDo/c3RyaW5nID0gbnVsbFxud2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCBuZXdGaWxlUGF0aDpzdHJpbmcgPSBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCArXG4gICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmBcbiAgICBpZiAoIVRvb2xzLmlzRmlsZVN5bmMobmV3RmlsZVBhdGgpKVxuICAgICAgICBicmVha1xuICAgIGZpbGVQYXRoID0gbmV3RmlsZVBhdGhcbiAgICBjb3VudCArPSAxXG59XG5sZXQgcnVudGltZUluZm9ybWF0aW9uOlBsYWluT2JqZWN0ID0ge1xuICAgIGdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHM6IHByb2Nlc3MuYXJndlxufVxuaWYgKGZpbGVQYXRoKSB7XG4gICAgcnVudGltZUluZm9ybWF0aW9uID0gSlNPTi5wYXJzZShmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge1xuICAgICAgICBlbmNvZGluZzogKGNvbmZpZ3VyYXRpb24uZW5jb2Rpbmc6c3RyaW5nKX0pKVxuICAgIGZpbGVTeXN0ZW0udW5saW5rKGZpbGVQYXRoLCAoZXJyb3I6P0Vycm9yKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxufVxuLy8gLy8gcmVnaW9uIGFwcGx5IHVzZSBjYXNlIHNwZWNpZmljIGNvbmZpZ3VyYXRpb25cbmlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKVxuICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydkb2N1bWVudCcsICd0ZXN0JywgJ3Rlc3Q6YnJvd3NlciddKVxuICAgICAgICBpZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09IHR5cGUpXG4gICAgICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb25bdHlwZV1cbiAgICAgICAgICAgICksIGNvbmZpZ3VyYXRpb25bdHlwZV0pXG4vLyAvLyBlbmRyZWdpb25cbmZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydkb2N1bWVudCcsICd0ZXN0JywgJ3Rlc3Q6QnJvd3NlciddKVxuICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uW3R5cGVdXG4vLyAvIGVuZHJlZ2lvblxuVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChUb29scy5tb2RpZnlPYmplY3QoXG4gICAgY29uZmlndXJhdGlvbiwgc3BlY2lmaWNDb25maWd1cmF0aW9uXG4pLCBydW50aW1lSW5mb3JtYXRpb24pLCBzcGVjaWZpY0NvbmZpZ3VyYXRpb24sIHJ1bnRpbWVJbmZvcm1hdGlvbilcbmxldCByZXN1bHQ6P1BsYWluT2JqZWN0ID0gbnVsbFxuaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDMpXG4gICAgcmVzdWx0ID0gVG9vbHMuc3RyaW5nUGFyc2VFbmNvZGVkT2JqZWN0KFxuICAgICAgICBydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1tydW50aW1lSW5mb3JtYXRpb25cbiAgICAgICAgICAgIC5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAtIDFdLFxuICAgICAgICBjb25maWd1cmF0aW9uLCAnY29uZmlndXJhdGlvbicpXG5pZiAodHlwZW9mIHJlc3VsdCA9PT0gJ29iamVjdCcgJiYgcmVzdWx0ICE9PSBudWxsKSB7XG4gICAgaWYgKHJlc3VsdC5oYXNPd25Qcm9wZXJ0eSgnX19yZWZlcmVuY2VfXycpKSB7XG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXS5jb25jYXQocmVzdWx0Ll9fcmVmZXJlbmNlX18pXG4gICAgICAgIGRlbGV0ZSByZXN1bHQuX19yZWZlcmVuY2VfX1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWU6c3RyaW5nIG9mIHJlZmVyZW5jZU5hbWVzKVxuICAgICAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHJlc3VsdCwgY29uZmlndXJhdGlvbltuYW1lXSlcbiAgICB9XG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChjb25maWd1cmF0aW9uLCByZXN1bHQpLCByZXN1bHQpXG59XG4vLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGRldGVybWluZSBleGlzdGluZyBwcmUgY29tcGlsZWQgZGxsIG1hbmlmZXN0cyBmaWxlIHBhdGhzXG5jb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzID0gW11cbmlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMoY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKSlcbiAgICBmb3IgKGNvbnN0IGZpbGVOYW1lOnN0cmluZyBvZiBmaWxlU3lzdGVtLnJlYWRkaXJTeW5jKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2VcbiAgICApKVxuICAgICAgICBpZiAoZmlsZU5hbWUubWF0Y2goL14uKlxcLmRsbC1tYW5pZmVzdFxcLmpzb24kLykpXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLnB1c2gocGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwgZmlsZU5hbWUpKVxuLy8gLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGJ1aWxkIGFic29sdXRlIHBhdGhzXG5jb25maWd1cmF0aW9uLnBhdGguYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UpXG5mb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoKVxuICAgIGlmIChcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9PSAnYmFzZScgJiZcbiAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldID09PSAnc3RyaW5nJ1xuICAgIClcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV1cbiAgICAgICAgKSArICcvJ1xuICAgIGVsc2UgaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QoY29uZmlndXJhdGlvbi5wYXRoW2tleV0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSlcbiAgICAgICAgZm9yIChjb25zdCBzdWJLZXk6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldKVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmhhc093blByb3BlcnR5KHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICAhWydiYXNlJywgJ3B1YmxpYyddLmluY2x1ZGVzKHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldXG4gICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNQbGFpbk9iamVjdChjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5iYXNlKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViU3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldKVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICApICYmIHN1YlN1YktleSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtzdWJTdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtzdWJTdWJLZXldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgfVxuICAgIH1cbi8vIC8gZW5kcmVnaW9uXG5jb25zdCBub3c6RGF0ZSA9IG5ldyBEYXRlKClcbmV4cG9ydCBjb25zdCByZXNvbHZlZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRDb25maWd1cmF0aW9uID1cbiAgICBUb29scy5ldmFsdWF0ZUR5bmFtaWNEYXRhU3RydWN0dXJlKGNvbmZpZ3VyYXRpb24sIHtcbiAgICAgICAgY3VycmVudFBhdGg6IHByb2Nlc3MuY3dkKCksXG4gICAgICAgIGZpbGVTeXN0ZW0sXG4gICAgICAgIEhlbHBlcixcbiAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgIGlzRExMVXNlZnVsOiAyIDwgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAmJiAoXG4gICAgICAgICAgICBbJ2J1aWxkOmRsbCcsICd3YXRjaDpkbGwnXS5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pIHx8XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLmxlbmd0aCAmJlxuICAgICAgICAgICAgWydidWlsZCcsICdzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKSxcbiAgICAgICAgcGF0aCxcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tZXZhbCAqL1xuICAgICAgICByZXF1aXJlOiBldmFsKCdyZXF1aXJlJyksXG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tZXZhbCAqL1xuICAgICAgICBUb29scyxcbiAgICAgICAgd2ViT3B0aW1pemVyUGF0aDogX19kaXJuYW1lLFxuICAgICAgICBub3csXG4gICAgICAgIG5vd1VUQ1RpbWVzdGFtcDogVG9vbHMubnVtYmVyR2V0VVRDVGltZXN0YW1wKG5vdylcbiAgICB9KVxuLy8gcmVnaW9uIGNvbnNvbGlkYXRlIGZpbGUgc3BlY2lmaWMgYnVpbGQgY29uZmlndXJhdGlvblxuLy8gQXBwbHkgZGVmYXVsdCBmaWxlIGxldmVsIGJ1aWxkIGNvbmZpZ3VyYXRpb25zIHRvIGFsbCBmaWxlIHR5cGUgc3BlY2lmaWNcbi8vIG9uZXMuXG5jb25zdCBkZWZhdWx0Q29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9XG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmRlZmF1bHRcbmRlbGV0ZSByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMuZGVmYXVsdFxuZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMpXG4gICAgaWYgKHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSlcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW3R5cGVdID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtcbiAgICAgICAgfSwgZGVmYXVsdENvbmZpZ3VyYXRpb24sIFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgIHRydWUsIHtleHRlbnNpb246IHR5cGV9LCByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNbdHlwZV0sXG4gICAgICAgICAgICB7dHlwZX0pKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gcmVzb2x2ZSBtb2R1bGUgbG9jYXRpb24gYW5kIGRldGVybWluZSB3aGljaCBhc3NldCB0eXBlcyBhcmUgbmVlZGVkXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5leHRlbnNpb25zLCByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlKVxucmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbiA9IEhlbHBlci5yZXNvbHZlSW5qZWN0aW9uKFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24sIEhlbHBlci5yZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICBIZWxwZXIubm9ybWFsaXplUGF0aHMocmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgIXJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpKSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXNcbiAgICApLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmF1dG9FeGNsdWRlLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUpXG5jb25zdCBpbnRlcm5hbEluamVjdGlvbjphbnkgPSByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsID0ge1xuICAgIGdpdmVuOiByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLFxuICAgIG5vcm1hbGl6ZWQ6IEhlbHBlci5yZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgSGVscGVyLm5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKGludGVybmFsSW5qZWN0aW9uKSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAhcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpfVxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm5lZWRlZCA9IHtqYXZhU2NyaXB0OiBjb25maWd1cmF0aW9uLmRlYnVnICYmIFtcbiAgICAnc2VydmUnLCAndGVzdDpicm93c2VyJ1xuXS5pbmNsdWRlcyhyZXNvbHZlZENvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSl9XG5mb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbFxuICAgIC5ub3JtYWxpemVkXG4pXG4gICAgaWYgKHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgY2h1bmtOYW1lXG4gICAgKSlcbiAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbFxuICAgICAgICAgICAgLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQsIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBOT1RFOiBXZSBkb2Vzbid0IHVzZVxuICAgICAgICAgICAgICAgICAgICBcInJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlXCIgYmVjYXVzZSB3ZVxuICAgICAgICAgICAgICAgICAgICBoYXZlIGFscmVhZHkgcmVzb2x2ZSBhbGwgbW9kdWxlIGlkcy5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICcuLycsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZW5jb2RpbmcpXG4gICAgICAgICAgICBsZXQgdHlwZTo/c3RyaW5nXG4gICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgdHlwZSA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEdpdmVuIHJlcXVlc3QgXCIke21vZHVsZUlEfVwiIGNvdWxkbid0IGJlIHJlc29sdmVkLmApXG4gICAgICAgICAgICBpZiAodHlwZSlcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkW3R5cGVdID0gdHJ1ZVxuICAgICAgICB9XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhZGRpbmcgc3BlY2lhbCBhbGlhc2VzXG4vLyBOT1RFOiBUaGlzIGFsaWFzIGNvdWxkbid0IGJlIHNldCBpbiB0aGUgXCJwYWNrYWdlLmpzb25cIiBmaWxlIHNpbmNlIHRoaXMgd291bGRcbi8vIHJlc3VsdCBpbiBhbiBlbmRsZXNzIGxvb3AuXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciA9ICcnXG5mb3IgKGNvbnN0IGxvYWRlcjpQbGFpbk9iamVjdCBvZiByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAudGVtcGxhdGUudXNlXG4pIHtcbiAgICBpZiAoXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAgICAgLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXJcbiAgICApXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAgICAgLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXIgKz0gJyEnXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzXG4gICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyICs9IGxvYWRlci5sb2FkZXJcbiAgICBpZiAobG9hZGVyLm9wdGlvbnMpXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAgICAgLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXIgKz0gJz8nICtcbiAgICAgICAgICAgICAgICBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04obG9hZGVyLm9wdGlvbnMpXG59XG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZVBhdGgkID1cbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUuZmlsZVBhdGhcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGFwcGx5IGh0bWwgd2VicGFjayBwbHVnaW4gd29ya2Fyb3VuZHNcbi8qXG4gICAgTk9URTogUHJvdmlkZXMgYSB3b3JrYXJvdW5kIHRvIGhhbmRsZSBhIGJ1ZyB3aXRoIGNoYWluZWQgbG9hZGVyXG4gICAgY29uZmlndXJhdGlvbnMuXG4qL1xuZm9yIChcbiAgICBsZXQgaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24gb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmh0bWxcbikge1xuICAgIFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgdHJ1ZSwgaHRtbENvbmZpZ3VyYXRpb24sIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTClcbiAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5yZXF1ZXN0ID0gaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGhcbiAgICBpZiAoXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoICE9PVxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoICYmXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLm9wdGlvbnNcbiAgICApIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdFN0cmluZzpPYmplY3QgPSBuZXcgU3RyaW5nKFxuICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdCArXG4gICAgICAgICAgICBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUub3B0aW9ucykpXG4gICAgICAgIHJlcXVlc3RTdHJpbmcucmVwbGFjZSA9ICgoc3RyaW5nOnN0cmluZyk6RnVuY3Rpb24gPT4gKFxuICAgICAgICAgICAgX3NlYXJjaDpSZWdFeHB8c3RyaW5nLCBfcmVwbGFjZW1lbnQ6c3RyaW5nfChcbiAgICAgICAgICAgICAgICAuLi5tYXRjaGVzOkFycmF5PHN0cmluZz5cbiAgICAgICAgICAgICkgPT4gc3RyaW5nXG4gICAgICAgICk6c3RyaW5nID0+IHN0cmluZykoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3QgPSByZXF1ZXN0U3RyaW5nXG4gICAgfVxufVxuLy8gZW5kcmVnaW9uXG5leHBvcnQgZGVmYXVsdCByZXNvbHZlZENvbmZpZ3VyYXRpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19