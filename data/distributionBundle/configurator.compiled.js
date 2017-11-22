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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFEM0UsaUhBRUU7QUFBQSxZQURNLGlCQUNOOztBQUNFLDZCQUFNLFlBQU4sQ0FDSSxJQURKLEVBQ1UsaUJBRFYsRUFDNkIsc0JBQXNCLEtBQXRCLENBQTRCLFdBRHpEO0FBRUEsMEJBQWtCLFFBQWxCLENBQTJCLE9BQTNCLEdBQXFDLGtCQUFrQixRQUFsQixDQUEyQixRQUFoRTtBQUNBLFlBQ0ksa0JBQWtCLFFBQWxCLENBQTJCLFFBQTNCLEtBQ0ksc0JBQXNCLEtBQXRCLENBQTRCLFdBQTVCLENBQXdDLFFBQXhDLENBQWlELFFBRHJELElBRUEsa0JBQWtCLFFBQWxCLENBQTJCLE9BSC9CLEVBSUU7QUFDRSxnQkFBTSxnQkFBdUIsSUFBSSxNQUFKLENBQ3pCLGtCQUFrQixRQUFsQixDQUEyQixPQUEzQixHQUNBLHFCQUFNLDJCQUFOLENBQ0ksa0JBQWtCLFFBQWxCLENBQTJCLE9BRC9CLENBRnlCLENBQTdCO0FBSUEsMEJBQWMsT0FBZCxHQUF5QixVQUFDLE1BQUQ7QUFBQSx1QkFBNEIsVUFDakQsT0FEaUQsRUFDMUIsWUFEMEI7QUFBQSwyQkFJekMsTUFKeUM7QUFBQSxpQkFBNUI7QUFBQSxhQUFELENBSUosa0JBQWtCLFFBQWxCLENBQTJCLFFBSnZCLENBQXhCO0FBS0EsOEJBQWtCLFFBQWxCLENBQTJCLE9BQTNCLEdBQXFDLGFBQXJDO0FBQ0g7QUFDSjtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7O2tCQUNlLHFCO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29uZmlndXJhdG9yLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgdHlwZSB7UGxhaW5PYmplY3R9IGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgKiBhcyBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbi8vIE5PVEU6IE9ubHkgbmVlZGVkIGZvciBkZWJ1Z2dpbmcgdGhpcyBmaWxlLlxudHJ5IHtcbiAgICByZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInKVxufSBjYXRjaCAoZXJyb3IpIHt9XG5cbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG4vLyBOT1RFOiBcIntjb25maWd1cmF0aW9uIGFzIG1ldGFDb25maWd1cmF0aW9ufVwiIHdvdWxkIHJlc3VsdCBpbiBhIHJlYWQgb25seVxuLy8gdmFyaWFibGUgbmFtZWQgXCJtZXRhQ29uZmlndXJhdGlvblwiLlxuaW1wb3J0IHtjb25maWd1cmF0aW9uIGFzIGdpdmVuTWV0YUNvbmZpZ3VyYXRpb259IGZyb20gJy4vcGFja2FnZSdcbmltcG9ydCB0eXBlIHtcbiAgICBEZWZhdWx0Q29uZmlndXJhdGlvbixcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIEhUTUxDb25maWd1cmF0aW9uLFxuICAgIEludGVybmFsSW5qZWN0aW9uLFxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBNZXRhQ29uZmlndXJhdGlvbixcbiAgICBSZXNvbHZlZENvbmZpZ3VyYXRpb25cbn0gZnJvbSAnLi90eXBlJ1xubGV0IG1ldGFDb25maWd1cmF0aW9uOk1ldGFDb25maWd1cmF0aW9uID0gZ2l2ZW5NZXRhQ29uZmlndXJhdGlvblxuLypcbiAgICBUbyBhc3N1bWUgdG8gZ28gdHdvIGZvbGRlciB1cCBmcm9tIHRoaXMgZmlsZSB1bnRpbCB0aGVyZSBpcyBub1xuICAgIFwibm9kZV9tb2R1bGVzXCIgcGFyZW50IGZvbGRlciBpcyB1c3VhbGx5IHJlc2lsaWVudCBhZ2FpbiBkZWFsaW5nIHdpdGhcbiAgICBwcm9qZWN0cyB3aGVyZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGlzbid0IHRoZSBwcm9qZWN0cyBkaXJlY3RvcnkgYW5kXG4gICAgdGhpcyBsaWJyYXJ5IGlzIGxvY2F0ZWQgYXMgYSBuZXN0ZWQgZGVwZW5kZW5jeS5cbiovXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IF9fZGlybmFtZVxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdtYWluJ1xud2hpbGUgKHRydWUpIHtcbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICcuLi8uLi8nKVxuICAgIGlmIChwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHRcbiAgICApKSAhPT0gJ25vZGVfbW9kdWxlcycpXG4gICAgICAgIGJyZWFrXG59XG5pZiAoXG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpID09PSAnbm9kZV9tb2R1bGVzJyB8fFxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSA9PT0gJy5zdGFnaW5nJyAmJlxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkpID09PSAnbm9kZV9tb2R1bGVzJ1xuKSB7XG4gICAgLypcbiAgICAgICAgTk9URTogSWYgd2UgYXJlIGRlYWxpbmcgd2FzIGEgZGVwZW5kZW5jeSBwcm9qZWN0IHVzZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgICAgICBhcyBjb250ZXh0LlxuICAgICovXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdkZXBlbmRlbmN5J1xufSBlbHNlXG4gICAgLypcbiAgICAgICAgTk9URTogSWYgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgcmVmZXJlbmNlcyB0aGlzIGZpbGUgdmlhIGFcbiAgICAgICAgbGlua2VkIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyIHVzaW5nIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgYXMgY29udGV4dFxuICAgICAgICBpcyBhIGJldHRlciBhc3N1bXB0aW9uIHRoYW4gdHdvIGZvbGRlcnMgdXAgdGhlIGhpZXJhcmNoeS5cbiAgICAqL1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChmaWxlU3lzdGVtLmxzdGF0U3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoXG4gICAgICAgICksICdub2RlX21vZHVsZXMnKSkuaXNTeW1ib2xpY0xpbmsoKSlcbiAgICAgICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxubGV0IHNwZWNpZmljQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdFxudHJ5IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1ldmFsICovXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uID0gZXZhbCgncmVxdWlyZScpKHBhdGguam9pbihcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICdwYWNrYWdlJykpXG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1ldmFsICovXG59IGNhdGNoIChlcnJvcikge1xuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHtuYW1lOiAnbW9ja3VwJ31cbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbn1cbmNvbnN0IG5hbWU6c3RyaW5nID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLm5hbWVcbnNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi53ZWJPcHRpbWl6ZXIgfHwge31cbnNwZWNpZmljQ29uZmlndXJhdGlvbi5uYW1lID0gbmFtZVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbG9hZGluZyBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cbi8vIE5PVEU6IEdpdmVuIG5vZGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50cyByZXN1bHRzIGluIFwibnBtX2NvbmZpZ18qXCJcbi8vIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmxldCBkZWJ1Zzpib29sZWFuID0gbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5kZWJ1Z1xuaWYgKHNwZWNpZmljQ29uZmlndXJhdGlvbi5kZWJ1ZyAhPT0gdW5kZWZpbmVkKVxuICAgIGRlYnVnID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLmRlYnVnXG5lbHNlIGlmIChwcm9jZXNzLmVudi5ucG1fY29uZmlnX2RldiA9PT0gJ3RydWUnKVxuICAgIGRlYnVnID0gdHJ1ZVxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgKz0gJy8nXG4vLyBNZXJnZXMgZmluYWwgZGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdCBkZXBlbmRpbmcgb24gZ2l2ZW4gdGFyZ2V0XG4vLyBlbnZpcm9ubWVudC5cbmNvbnN0IGxpYnJhcnlDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0gbWV0YUNvbmZpZ3VyYXRpb24ubGlicmFyeVxubGV0IGNvbmZpZ3VyYXRpb246RGVmYXVsdENvbmZpZ3VyYXRpb25cbmlmIChkZWJ1ZylcbiAgICBjb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdCwgbWV0YUNvbmZpZ3VyYXRpb24uZGVidWdcbiAgICApLCBtZXRhQ29uZmlndXJhdGlvbi5kZWJ1ZylcbmVsc2VcbiAgICBjb25maWd1cmF0aW9uID0gbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdFxuY29uZmlndXJhdGlvbi5kZWJ1ZyA9IGRlYnVnXG5pZiAodHlwZW9mIGNvbmZpZ3VyYXRpb24ubGlicmFyeSA9PT0gJ29iamVjdCcpXG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgbGlicmFyeUNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb24ubGlicmFyeVxuICAgICksIGNvbmZpZ3VyYXRpb24ubGlicmFyeSlcbmlmIChcbiAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLmxpYnJhcnkgPT09IHRydWUgfHwgKFxuICAgICAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgISgnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uKVxuICAgICkgJiYgY29uZmlndXJhdGlvbi5saWJyYXJ5XG4pXG4gICAgY29uZmlndXJhdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24sIGxpYnJhcnlDb25maWd1cmF0aW9uXG4gICAgKSwgbGlicmFyeUNvbmZpZ3VyYXRpb24pXG4vLyBlbmRyZWdpb25cbi8qXG4gICAgcmVnaW9uIG1lcmdpbmcgYW5kIGV2YWx1YXRpbmcgZGVmYXVsdCwgdGVzdCwgZG9jdW1lbnQsIHNwZWNpZmljIGFuZCBkeW5hbWljXG4gICAgc2V0dGluZ3NcbiovXG4vLyAvIHJlZ2lvbiBsb2FkIGFkZGl0aW9uYWwgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvblxubGV0IGNvdW50Om51bWJlciA9IDBcbmxldCBmaWxlUGF0aDo/c3RyaW5nID0gbnVsbFxud2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCBuZXdGaWxlUGF0aDpzdHJpbmcgPSBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCArXG4gICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmBcbiAgICBpZiAoIVRvb2xzLmlzRmlsZVN5bmMobmV3RmlsZVBhdGgpKVxuICAgICAgICBicmVha1xuICAgIGZpbGVQYXRoID0gbmV3RmlsZVBhdGhcbiAgICBjb3VudCArPSAxXG59XG5sZXQgcnVudGltZUluZm9ybWF0aW9uOlBsYWluT2JqZWN0ID0ge1xuICAgIGdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHM6IHByb2Nlc3MuYXJndlxufVxuaWYgKGZpbGVQYXRoKSB7XG4gICAgcnVudGltZUluZm9ybWF0aW9uID0gSlNPTi5wYXJzZShmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge1xuICAgICAgICBlbmNvZGluZzogKGNvbmZpZ3VyYXRpb24uZW5jb2Rpbmc6c3RyaW5nKX0pKVxuICAgIGZpbGVTeXN0ZW0udW5saW5rKGZpbGVQYXRoLCAoZXJyb3I6P0Vycm9yKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxufVxuLy8gLy8gcmVnaW9uIGFwcGx5IHVzZSBjYXNlIHNwZWNpZmljIGNvbmZpZ3VyYXRpb25cbmlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKVxuICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydkb2N1bWVudCcsICd0ZXN0JywgJ3Rlc3Q6YnJvd3NlciddKVxuICAgICAgICBpZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09IHR5cGUpXG4gICAgICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb25bdHlwZV1cbiAgICAgICAgICAgICksIGNvbmZpZ3VyYXRpb25bdHlwZV0pXG4vLyAvLyBlbmRyZWdpb25cbmZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydkb2N1bWVudCcsICd0ZXN0JywgJ3Rlc3Q6QnJvd3NlciddKVxuICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uW3R5cGVdXG4vLyAvIGVuZHJlZ2lvblxuVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChUb29scy5tb2RpZnlPYmplY3QoXG4gICAgY29uZmlndXJhdGlvbiwgc3BlY2lmaWNDb25maWd1cmF0aW9uXG4pLCBydW50aW1lSW5mb3JtYXRpb24pLCBzcGVjaWZpY0NvbmZpZ3VyYXRpb24sIHJ1bnRpbWVJbmZvcm1hdGlvbilcbmxldCByZXN1bHQ6P1BsYWluT2JqZWN0ID0gbnVsbFxuaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDMpXG4gICAgcmVzdWx0ID0gVG9vbHMuc3RyaW5nUGFyc2VFbmNvZGVkT2JqZWN0KFxuICAgICAgICBydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1tydW50aW1lSW5mb3JtYXRpb25cbiAgICAgICAgICAgIC5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAtIDFdLFxuICAgICAgICBjb25maWd1cmF0aW9uLCAnY29uZmlndXJhdGlvbicpXG5pZiAoVG9vbHMuaXNQbGFpbk9iamVjdChyZXN1bHQpKVxuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoY29uZmlndXJhdGlvbiwgcmVzdWx0KSwgcmVzdWx0KVxuLy8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBkZXRlcm1pbmUgZXhpc3RpbmcgcHJlIGNvbXBpbGVkIGRsbCBtYW5pZmVzdHMgZmlsZSBwYXRoc1xuY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocyA9IFtdXG5pZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSkpXG4gICAgZm9yIChjb25zdCBmaWxlTmFtZTpzdHJpbmcgb2YgZmlsZVN5c3RlbS5yZWFkZGlyU3luYyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlXG4gICAgKSlcbiAgICAgICAgaWYgKGZpbGVOYW1lLm1hdGNoKC9eLipcXC5kbGwtbWFuaWZlc3RcXC5qc29uJC8pKVxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5wdXNoKHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIGZpbGVOYW1lKSlcbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBidWlsZCBhYnNvbHV0ZSBwYXRoc1xuY29uZmlndXJhdGlvbi5wYXRoLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlKVxuZm9yIChjb25zdCBrZXk6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICBpZiAoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XSA9PT0gJ3N0cmluZydcbiAgICApXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldXG4gICAgICAgICkgKyAnLydcbiAgICBlbHNlIGlmIChUb29scy5pc1BsYWluT2JqZWN0KGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldKSkge1xuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UpXG4gICAgICAgIGZvciAoY29uc3Qgc3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XSlcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5oYXNPd25Qcm9wZXJ0eShzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgIVsnYmFzZScsICdwdWJsaWMnXS5pbmNsdWRlcyhzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVxuICAgICAgICAgICAgICAgICkgKyAnLydcbiAgICAgICAgICAgIGVsc2UgaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QoY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSkpIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YlN1YktleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXlcbiAgICAgICAgICAgICAgICAgICAgKSAmJiBzdWJTdWJLZXkgIT09ICdiYXNlJyAmJlxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICBdID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bc3ViU3ViS2V5XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bc3ViU3ViS2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnLydcbiAgICAgICAgICAgIH1cbiAgICB9XG4vLyAvIGVuZHJlZ2lvblxuY29uc3Qgbm93OkRhdGUgPSBuZXcgRGF0ZSgpXG5leHBvcnQgY29uc3QgcmVzb2x2ZWRDb25maWd1cmF0aW9uOlJlc29sdmVkQ29uZmlndXJhdGlvbiA9XG4gICAgVG9vbHMuZXZhbHVhdGVEeW5hbWljRGF0YVN0cnVjdHVyZShjb25maWd1cmF0aW9uLCB7XG4gICAgICAgIGN1cnJlbnRQYXRoOiBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICBmaWxlU3lzdGVtLFxuICAgICAgICBIZWxwZXIsXG4gICAgICAgIHBhdGgsXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWV2YWwgKi9cbiAgICAgICAgcmVxdWlyZTogZXZhbCgncmVxdWlyZScpLFxuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWV2YWwgKi9cbiAgICAgICAgVG9vbHMsXG4gICAgICAgIHdlYk9wdGltaXplclBhdGg6IF9fZGlybmFtZSxcbiAgICAgICAgbm93LFxuICAgICAgICBub3dVVENUaW1lc3RhbXA6IFRvb2xzLm51bWJlckdldFVUQ1RpbWVzdGFtcChub3cpXG4gICAgfSlcbi8vIHJlZ2lvbiBjb25zb2xpZGF0ZSBmaWxlIHNwZWNpZmljIGJ1aWxkIGNvbmZpZ3VyYXRpb25cbi8vIEFwcGx5IGRlZmF1bHQgZmlsZSBsZXZlbCBidWlsZCBjb25maWd1cmF0aW9ucyB0byBhbGwgZmlsZSB0eXBlIHNwZWNpZmljXG4vLyBvbmVzLlxuY29uc3QgZGVmYXVsdENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPVxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcy5kZWZhdWx0XG5kZWxldGUgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmRlZmF1bHRcbmZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzKVxuICAgIGlmIChyZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMuaGFzT3duUHJvcGVydHkodHlwZSkpXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlc1t0eXBlXSA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgIH0sIGRlZmF1bHRDb25maWd1cmF0aW9uLCBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICB0cnVlLCB7ZXh0ZW5zaW9uOiB0eXBlfSwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW3R5cGVdLFxuICAgICAgICAgICAge3R5cGV9KSlcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHJlc29sdmUgbW9kdWxlIGxvY2F0aW9uIGFuZCBkZXRlcm1pbmUgd2hpY2ggYXNzZXQgdHlwZXMgYXJlIG5lZWRlZFxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucywgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSlcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24gPSBIZWxwZXIucmVzb2x2ZUluamVjdGlvbihcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLCBIZWxwZXIucmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgSGVscGVyLm5vcm1hbGl6ZVBhdGhzKHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSksXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzXG4gICAgKSwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5hdXRvRXhjbHVkZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlKVxuY29uc3QgaW50ZXJuYWxJbmplY3Rpb246YW55ID0gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbFxucmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCA9IHtcbiAgICBnaXZlbjogcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCxcbiAgICBub3JtYWxpemVkOiBIZWxwZXIucmVzb2x2ZU1vZHVsZXNJbkZvbGRlcnMoXG4gICAgICAgIEhlbHBlci5ub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihpbnRlcm5hbEluamVjdGlvbiksXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgIXJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpKX1cbnJlc29sdmVkQ29uZmlndXJhdGlvbi5uZWVkZWQgPSB7amF2YVNjcmlwdDogY29uZmlndXJhdGlvbi5kZWJ1ZyAmJiBbXG4gICAgJ3NlcnZlJywgJ3Rlc3Q6YnJvd3Nlcidcbl0uaW5jbHVkZXMocmVzb2x2ZWRDb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pfVxuZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWxcbiAgICAubm9ybWFsaXplZFxuKVxuICAgIGlmIChyZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgIGNodW5rTmFtZVxuICAgICkpXG4gICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWxcbiAgICAgICAgICAgIC5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgIG1vZHVsZUlELCByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogV2UgZG9lc24ndCB1c2VcbiAgICAgICAgICAgICAgICAgICAgXCJyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZVwiIGJlY2F1c2Ugd2VcbiAgICAgICAgICAgICAgICAgICAgaGF2ZSBhbHJlYWR5IHJlc29sdmUgYWxsIG1vZHVsZSBpZHMuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAnLi8nLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmVuY29kaW5nKVxuICAgICAgICAgICAgbGV0IHR5cGU6P3N0cmluZ1xuICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIHR5cGUgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBHaXZlbiByZXF1ZXN0IFwiJHttb2R1bGVJRH1cIiBjb3VsZG4ndCBiZSByZXNvbHZlZC5gKVxuICAgICAgICAgICAgaWYgKHR5cGUpXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm5lZWRlZFt0eXBlXSA9IHRydWVcbiAgICAgICAgfVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gYWRkaW5nIHNwZWNpYWwgYWxpYXNlc1xuLy8gTk9URTogVGhpcyBhbGlhcyBjb3VsZG4ndCBiZSBzZXQgaW4gdGhlIFwicGFja2FnZS5qc29uXCIgZmlsZSBzaW5jZSB0aGlzIHdvdWxkXG4vLyByZXN1bHQgaW4gYW4gZW5kbGVzcyBsb29wLlxucmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXIgPSAnJ1xuZm9yIChjb25zdCBsb2FkZXI6UGxhaW5PYmplY3Qgb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgLnRlbXBsYXRlLnVzZVxuKSB7XG4gICAgaWYgKFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyXG4gICAgKVxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyICs9ICchJ1xuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciArPSBsb2FkZXIubG9hZGVyXG4gICAgaWYgKGxvYWRlci5vcHRpb25zKVxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyICs9ICc/JyArXG4gICAgICAgICAgICAgICAgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKGxvYWRlci5vcHRpb25zKVxufVxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVQYXRoJCA9XG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhcHBseSBodG1sIHdlYnBhY2sgcGx1Z2luIHdvcmthcm91bmRzXG4vKlxuICAgIE5PVEU6IFByb3ZpZGVzIGEgd29ya2Fyb3VuZCB0byBoYW5kbGUgYSBidWcgd2l0aCBjaGFpbmVkIGxvYWRlclxuICAgIGNvbmZpZ3VyYXRpb25zLlxuKi9cbmZvciAoXG4gICAgbGV0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5odG1sXG4pIHtcbiAgICBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgIHRydWUsIGh0bWxDb25maWd1cmF0aW9uLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwpXG4gICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdCA9IGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoXG4gICAgaWYgKFxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aCAhPT1cbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS5maWxlUGF0aCAmJlxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5vcHRpb25zXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RTdHJpbmc6T2JqZWN0ID0gbmV3IFN0cmluZyhcbiAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3QgK1xuICAgICAgICAgICAgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLm9wdGlvbnMpKVxuICAgICAgICByZXF1ZXN0U3RyaW5nLnJlcGxhY2UgPSAoKHN0cmluZzpzdHJpbmcpOkZ1bmN0aW9uID0+IChcbiAgICAgICAgICAgIF9zZWFyY2g6UmVnRXhwfHN0cmluZywgX3JlcGxhY2VtZW50OnN0cmluZ3woXG4gICAgICAgICAgICAgICAgLi4ubWF0Y2hlczpBcnJheTxzdHJpbmc+XG4gICAgICAgICAgICApID0+IHN0cmluZ1xuICAgICAgICApOnN0cmluZyA9PiBzdHJpbmcpKGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5yZXF1ZXN0ID0gcmVxdWVzdFN0cmluZ1xuICAgIH1cbn1cbi8vIGVuZHJlZ2lvblxuZXhwb3J0IGRlZmF1bHQgcmVzb2x2ZWRDb25maWd1cmF0aW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==