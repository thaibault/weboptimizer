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

var metaConfiguration = _package.configuration;
/*
    To assume to go two folder up from this file until there is no
    "node_modules" parent folder is usually resilient again dealing with
    projects where current working directory isn't the projects directory and
    this library is located as a nested dependency.
*/

// NOTE: "{configuration as metaConfiguration}" would result in a read only
// variable named "metaConfiguration".
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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MkJBQU4sQ0FDSSxrQkFBa0IsUUFBbEIsQ0FBMkIsT0FEL0IsQ0FGeUIsQ0FBN0I7QUFJQSwwQkFBYyxPQUFkLEdBQXlCLFVBQUMsTUFBRDtBQUFBLHVCQUE0QixVQUNqRCxPQURpRCxFQUMxQixZQUQwQjtBQUFBLDJCQUl6QyxNQUp5QztBQUFBLGlCQUE1QjtBQUFBLGFBQUQsQ0FJSixrQkFBa0IsUUFBbEIsQ0FBMkIsUUFKdkIsQ0FBeEI7QUFLQSw4QkFBa0IsUUFBbEIsQ0FBMkIsT0FBM0IsR0FBcUMsYUFBckM7QUFDSDtBQUNKO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBQ2UscUI7QUFDZjtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB0eXBlIHtQbGFpbk9iamVjdH0gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuLy8gTk9URTogXCJ7Y29uZmlndXJhdGlvbiBhcyBtZXRhQ29uZmlndXJhdGlvbn1cIiB3b3VsZCByZXN1bHQgaW4gYSByZWFkIG9ubHlcbi8vIHZhcmlhYmxlIG5hbWVkIFwibWV0YUNvbmZpZ3VyYXRpb25cIi5cbmltcG9ydCB7Y29uZmlndXJhdGlvbiBhcyBnaXZlbk1ldGFDb25maWd1cmF0aW9ufSBmcm9tICcuL3BhY2thZ2UnXG5pbXBvcnQgdHlwZSB7XG4gICAgRGVmYXVsdENvbmZpZ3VyYXRpb24sXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBIVE1MQ29uZmlndXJhdGlvbixcbiAgICBJbnRlcm5hbEluamVjdGlvbixcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgTWV0YUNvbmZpZ3VyYXRpb24sXG4gICAgUmVzb2x2ZWRDb25maWd1cmF0aW9uXG59IGZyb20gJy4vdHlwZSdcbmxldCBtZXRhQ29uZmlndXJhdGlvbjpNZXRhQ29uZmlndXJhdGlvbiA9IGdpdmVuTWV0YUNvbmZpZ3VyYXRpb25cbi8qXG4gICAgVG8gYXNzdW1lIHRvIGdvIHR3byBmb2xkZXIgdXAgZnJvbSB0aGlzIGZpbGUgdW50aWwgdGhlcmUgaXMgbm9cbiAgICBcIm5vZGVfbW9kdWxlc1wiIHBhcmVudCBmb2xkZXIgaXMgdXN1YWxseSByZXNpbGllbnQgYWdhaW4gZGVhbGluZyB3aXRoXG4gICAgcHJvamVjdHMgd2hlcmUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBpc24ndCB0aGUgcHJvamVjdHMgZGlyZWN0b3J5IGFuZFxuICAgIHRoaXMgbGlicmFyeSBpcyBsb2NhdGVkIGFzIGEgbmVzdGVkIGRlcGVuZGVuY3kuXG4qL1xubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBfX2Rpcm5hbWVcbm1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQuY29udGV4dFR5cGUgPSAnbWFpbidcbndoaWxlICh0cnVlKSB7XG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0LCAnLi4vLi4vJylcbiAgICBpZiAocGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUoXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0XG4gICAgKSkgIT09ICdub2RlX21vZHVsZXMnKVxuICAgICAgICBicmVha1xufVxuaWYgKFxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSA9PT0gJ25vZGVfbW9kdWxlcycgfHxcbiAgICBwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkgPT09ICcuc3RhZ2luZycgJiZcbiAgICBwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpKSA9PT0gJ25vZGVfbW9kdWxlcydcbikge1xuICAgIC8qXG4gICAgICAgIE5PVEU6IElmIHdlIGFyZSBkZWFsaW5nIHdhcyBhIGRlcGVuZGVuY3kgcHJvamVjdCB1c2UgY3VycmVudCBkaXJlY3RvcnlcbiAgICAgICAgYXMgY29udGV4dC5cbiAgICAqL1xuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQuY29udGV4dFR5cGUgPSAnZGVwZW5kZW5jeSdcbn0gZWxzZVxuICAgIC8qXG4gICAgICAgIE5PVEU6IElmIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHJlZmVyZW5jZXMgdGhpcyBmaWxlIHZpYSBhXG4gICAgICAgIGxpbmtlZCBcIm5vZGVfbW9kdWxlc1wiIGZvbGRlciB1c2luZyBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGFzIGNvbnRleHRcbiAgICAgICAgaXMgYSBiZXR0ZXIgYXNzdW1wdGlvbiB0aGFuIHR3byBmb2xkZXJzIHVwIHRoZSBoaWVyYXJjaHkuXG4gICAgKi9cbiAgICB0cnkge1xuICAgICAgICBpZiAoZmlsZVN5c3RlbS5sc3RhdFN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKFxuICAgICAgICApLCAnbm9kZV9tb2R1bGVzJykpLmlzU3ltYm9saWNMaW5rKCkpXG4gICAgICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbiAgICB9IGNhdGNoIChlcnJvcikge31cbmxldCBzcGVjaWZpY0NvbmZpZ3VyYXRpb246UGxhaW5PYmplY3RcbnRyeSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tZXZhbCAqL1xuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbiA9IGV2YWwoJ3JlcXVpcmUnKShwYXRoLmpvaW4oXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0LCAncGFja2FnZScpKVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tZXZhbCAqL1xufSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSB7bmFtZTogJ21vY2t1cCd9XG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG59XG5jb25zdCBuYW1lOnN0cmluZyA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi5uYW1lXG5zcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ud2ViT3B0aW1pemVyIHx8IHt9XG5zcGVjaWZpY0NvbmZpZ3VyYXRpb24ubmFtZSA9IG5hbWVcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGxvYWRpbmcgZGVmYXVsdCBjb25maWd1cmF0aW9uXG4vLyBOT1RFOiBHaXZlbiBub2RlIGNvbW1hbmQgbGluZSBhcmd1bWVudHMgcmVzdWx0cyBpbiBcIm5wbV9jb25maWdfKlwiXG4vLyBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG5sZXQgZGVidWc6Ym9vbGVhbiA9IG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQuZGVidWdcbmlmIChzcGVjaWZpY0NvbmZpZ3VyYXRpb24uZGVidWcgIT09IHVuZGVmaW5lZClcbiAgICBkZWJ1ZyA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi5kZWJ1Z1xuZWxzZSBpZiAocHJvY2Vzcy5lbnYubnBtX2NvbmZpZ19kZXYgPT09ICd0cnVlJylcbiAgICBkZWJ1ZyA9IHRydWVcbm1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ICs9ICcvJ1xuLy8gTWVyZ2VzIGZpbmFsIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgZGVwZW5kaW5nIG9uIGdpdmVuIHRhcmdldFxuLy8gZW52aXJvbm1lbnQuXG5jb25zdCBsaWJyYXJ5Q29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IG1ldGFDb25maWd1cmF0aW9uLmxpYnJhcnlcbmxldCBjb25maWd1cmF0aW9uOkRlZmF1bHRDb25maWd1cmF0aW9uXG5pZiAoZGVidWcpXG4gICAgY29uZmlndXJhdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQsIG1ldGFDb25maWd1cmF0aW9uLmRlYnVnXG4gICAgKSwgbWV0YUNvbmZpZ3VyYXRpb24uZGVidWcpXG5lbHNlXG4gICAgY29uZmlndXJhdGlvbiA9IG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHRcbmNvbmZpZ3VyYXRpb24uZGVidWcgPSBkZWJ1Z1xuaWYgKHR5cGVvZiBjb25maWd1cmF0aW9uLmxpYnJhcnkgPT09ICdvYmplY3QnKVxuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgIGxpYnJhcnlDb25maWd1cmF0aW9uLCBjb25maWd1cmF0aW9uLmxpYnJhcnlcbiAgICApLCBjb25maWd1cmF0aW9uLmxpYnJhcnkpXG5pZiAoXG4gICAgJ2xpYnJhcnknIGluIHNwZWNpZmljQ29uZmlndXJhdGlvbiAmJlxuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSB0cnVlIHx8IChcbiAgICAgICAgJ2xpYnJhcnknIGluIHNwZWNpZmljQ29uZmlndXJhdGlvbiAmJlxuICAgICAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ubGlicmFyeSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICEoJ2xpYnJhcnknIGluIHNwZWNpZmljQ29uZmlndXJhdGlvbilcbiAgICApICYmIGNvbmZpZ3VyYXRpb24ubGlicmFyeVxuKVxuICAgIGNvbmZpZ3VyYXRpb24gPSBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICBjb25maWd1cmF0aW9uLCBsaWJyYXJ5Q29uZmlndXJhdGlvblxuICAgICksIGxpYnJhcnlDb25maWd1cmF0aW9uKVxuLy8gZW5kcmVnaW9uXG4vKlxuICAgIHJlZ2lvbiBtZXJnaW5nIGFuZCBldmFsdWF0aW5nIGRlZmF1bHQsIHRlc3QsIGRvY3VtZW50LCBzcGVjaWZpYyBhbmQgZHluYW1pY1xuICAgIHNldHRpbmdzXG4qL1xuLy8gLyByZWdpb24gbG9hZCBhZGRpdGlvbmFsIGR5bmFtaWNhbGx5IGdpdmVuIGNvbmZpZ3VyYXRpb25cbmxldCBjb3VudDpudW1iZXIgPSAwXG5sZXQgZmlsZVBhdGg6P3N0cmluZyA9IG51bGxcbndoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgbmV3RmlsZVBhdGg6c3RyaW5nID0gY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQgK1xuICAgICAgICBgLmR5bmFtaWNDb25maWd1cmF0aW9uLSR7Y291bnR9Lmpzb25gXG4gICAgaWYgKCFUb29scy5pc0ZpbGVTeW5jKG5ld0ZpbGVQYXRoKSlcbiAgICAgICAgYnJlYWtcbiAgICBmaWxlUGF0aCA9IG5ld0ZpbGVQYXRoXG4gICAgY291bnQgKz0gMVxufVxubGV0IHJ1bnRpbWVJbmZvcm1hdGlvbjpQbGFpbk9iamVjdCA9IHtcbiAgICBnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOiBwcm9jZXNzLmFyZ3Zcbn1cbmlmIChmaWxlUGF0aCkge1xuICAgIHJ1bnRpbWVJbmZvcm1hdGlvbiA9IEpTT04ucGFyc2UoZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIHtcbiAgICAgICAgZW5jb2Rpbmc6IChjb25maWd1cmF0aW9uLmVuY29kaW5nOnN0cmluZyl9KSlcbiAgICBmaWxlU3lzdGVtLnVubGluayhmaWxlUGF0aCwgKGVycm9yOj9FcnJvcik6dm9pZCA9PiB7XG4gICAgICAgIGlmIChlcnJvcilcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbn1cbi8vIC8vIHJlZ2lvbiBhcHBseSB1c2UgY2FzZSBzcGVjaWZpYyBjb25maWd1cmF0aW9uXG5pZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoID4gMilcbiAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnZG9jdW1lbnQnLCAndGVzdCcsICd0ZXN0OmJyb3dzZXInXSlcbiAgICAgICAgaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSB0eXBlKVxuICAgICAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLCBjb25maWd1cmF0aW9uW3R5cGVdXG4gICAgICAgICAgICApLCBjb25maWd1cmF0aW9uW3R5cGVdKVxuLy8gLy8gZW5kcmVnaW9uXG5mb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnZG9jdW1lbnQnLCAndGVzdCcsICd0ZXN0OkJyb3dzZXInXSlcbiAgICBkZWxldGUgY29uZmlndXJhdGlvblt0eXBlXVxuLy8gLyBlbmRyZWdpb25cblRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgIGNvbmZpZ3VyYXRpb24sIHNwZWNpZmljQ29uZmlndXJhdGlvblxuKSwgcnVudGltZUluZm9ybWF0aW9uKSwgc3BlY2lmaWNDb25maWd1cmF0aW9uLCBydW50aW1lSW5mb3JtYXRpb24pXG5sZXQgcmVzdWx0Oj9QbGFpbk9iamVjdCA9IG51bGxcbmlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAzKVxuICAgIHJlc3VsdCA9IFRvb2xzLnN0cmluZ1BhcnNlRW5jb2RlZE9iamVjdChcbiAgICAgICAgcnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbcnVudGltZUluZm9ybWF0aW9uXG4gICAgICAgICAgICAuZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggLSAxXSxcbiAgICAgICAgY29uZmlndXJhdGlvbiwgJ2NvbmZpZ3VyYXRpb24nKVxuaWYgKHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnICYmIHJlc3VsdCAhPT0gbnVsbCkge1xuICAgIGlmIChyZXN1bHQuaGFzT3duUHJvcGVydHkoJ19fcmVmZXJlbmNlX18nKSkge1xuICAgICAgICBjb25zdCByZWZlcmVuY2VOYW1lczpBcnJheTxzdHJpbmc+ID0gW10uY29uY2F0KHJlc3VsdC5fX3JlZmVyZW5jZV9fKVxuICAgICAgICBkZWxldGUgcmVzdWx0Ll9fcmVmZXJlbmNlX19cbiAgICAgICAgZm9yIChjb25zdCBuYW1lOnN0cmluZyBvZiByZWZlcmVuY2VOYW1lcylcbiAgICAgICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCByZXN1bHQsIGNvbmZpZ3VyYXRpb25bbmFtZV0pXG4gICAgfVxuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoY29uZmlndXJhdGlvbiwgcmVzdWx0KSwgcmVzdWx0KVxufVxuLy8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBkZXRlcm1pbmUgZXhpc3RpbmcgcHJlIGNvbXBpbGVkIGRsbCBtYW5pZmVzdHMgZmlsZSBwYXRoc1xuY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocyA9IFtdXG5pZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSkpXG4gICAgZm9yIChjb25zdCBmaWxlTmFtZTpzdHJpbmcgb2YgZmlsZVN5c3RlbS5yZWFkZGlyU3luYyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlXG4gICAgKSlcbiAgICAgICAgaWYgKGZpbGVOYW1lLm1hdGNoKC9eLipcXC5kbGwtbWFuaWZlc3RcXC5qc29uJC8pKVxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5wdXNoKHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIGZpbGVOYW1lKSlcbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBidWlsZCBhYnNvbHV0ZSBwYXRoc1xuY29uZmlndXJhdGlvbi5wYXRoLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlKVxuZm9yIChjb25zdCBrZXk6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICBpZiAoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XSA9PT0gJ3N0cmluZydcbiAgICApXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldXG4gICAgICAgICkgKyAnLydcbiAgICBlbHNlIGlmIChUb29scy5pc1BsYWluT2JqZWN0KGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldKSkge1xuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UpXG4gICAgICAgIGZvciAoY29uc3Qgc3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XSlcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5oYXNPd25Qcm9wZXJ0eShzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgIVsnYmFzZScsICdwdWJsaWMnXS5pbmNsdWRlcyhzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVxuICAgICAgICAgICAgICAgICkgKyAnLydcbiAgICAgICAgICAgIGVsc2UgaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QoY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSkpIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YlN1YktleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXlcbiAgICAgICAgICAgICAgICAgICAgKSAmJiBzdWJTdWJLZXkgIT09ICdiYXNlJyAmJlxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICBdID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bc3ViU3ViS2V5XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bc3ViU3ViS2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnLydcbiAgICAgICAgICAgIH1cbiAgICB9XG4vLyAvIGVuZHJlZ2lvblxuY29uc3Qgbm93OkRhdGUgPSBuZXcgRGF0ZSgpXG5leHBvcnQgY29uc3QgcmVzb2x2ZWRDb25maWd1cmF0aW9uOlJlc29sdmVkQ29uZmlndXJhdGlvbiA9XG4gICAgVG9vbHMuZXZhbHVhdGVEeW5hbWljRGF0YVN0cnVjdHVyZShjb25maWd1cmF0aW9uLCB7XG4gICAgICAgIGN1cnJlbnRQYXRoOiBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICBmaWxlU3lzdGVtLFxuICAgICAgICBIZWxwZXIsXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICBpc0RMTFVzZWZ1bDogMiA8IGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggJiYgKFxuICAgICAgICAgICAgWydidWlsZDpkbGwnLCAnd2F0Y2g6ZGxsJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKSB8fFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5sZW5ndGggJiZcbiAgICAgICAgICAgIFsnYnVpbGQnLCAnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKSksXG4gICAgICAgIHBhdGgsXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWV2YWwgKi9cbiAgICAgICAgcmVxdWlyZTogZXZhbCgncmVxdWlyZScpLFxuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWV2YWwgKi9cbiAgICAgICAgVG9vbHMsXG4gICAgICAgIHdlYk9wdGltaXplclBhdGg6IF9fZGlybmFtZSxcbiAgICAgICAgbm93LFxuICAgICAgICBub3dVVENUaW1lc3RhbXA6IFRvb2xzLm51bWJlckdldFVUQ1RpbWVzdGFtcChub3cpXG4gICAgfSlcbi8vIHJlZ2lvbiBjb25zb2xpZGF0ZSBmaWxlIHNwZWNpZmljIGJ1aWxkIGNvbmZpZ3VyYXRpb25cbi8vIEFwcGx5IGRlZmF1bHQgZmlsZSBsZXZlbCBidWlsZCBjb25maWd1cmF0aW9ucyB0byBhbGwgZmlsZSB0eXBlIHNwZWNpZmljXG4vLyBvbmVzLlxuY29uc3QgZGVmYXVsdENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPVxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcy5kZWZhdWx0XG5kZWxldGUgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmRlZmF1bHRcbmZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzKVxuICAgIGlmIChyZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMuaGFzT3duUHJvcGVydHkodHlwZSkpXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlc1t0eXBlXSA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgIH0sIGRlZmF1bHRDb25maWd1cmF0aW9uLCBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICB0cnVlLCB7ZXh0ZW5zaW9uOiB0eXBlfSwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW3R5cGVdLFxuICAgICAgICAgICAge3R5cGV9KSlcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHJlc29sdmUgbW9kdWxlIGxvY2F0aW9uIGFuZCBkZXRlcm1pbmUgd2hpY2ggYXNzZXQgdHlwZXMgYXJlIG5lZWRlZFxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucywgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSlcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24gPSBIZWxwZXIucmVzb2x2ZUluamVjdGlvbihcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLCBIZWxwZXIucmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgSGVscGVyLm5vcm1hbGl6ZVBhdGhzKHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSksXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzXG4gICAgKSwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5hdXRvRXhjbHVkZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlKVxuY29uc3QgaW50ZXJuYWxJbmplY3Rpb246YW55ID0gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbFxucmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCA9IHtcbiAgICBnaXZlbjogcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCxcbiAgICBub3JtYWxpemVkOiBIZWxwZXIucmVzb2x2ZU1vZHVsZXNJbkZvbGRlcnMoXG4gICAgICAgIEhlbHBlci5ub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihpbnRlcm5hbEluamVjdGlvbiksXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgIXJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpKX1cbnJlc29sdmVkQ29uZmlndXJhdGlvbi5uZWVkZWQgPSB7amF2YVNjcmlwdDogY29uZmlndXJhdGlvbi5kZWJ1ZyAmJiBbXG4gICAgJ3NlcnZlJywgJ3Rlc3Q6YnJvd3Nlcidcbl0uaW5jbHVkZXMocmVzb2x2ZWRDb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pfVxuZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWxcbiAgICAubm9ybWFsaXplZFxuKVxuICAgIGlmIChyZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgIGNodW5rTmFtZVxuICAgICkpXG4gICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWxcbiAgICAgICAgICAgIC5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgIG1vZHVsZUlELCByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogV2UgZG9lc24ndCB1c2VcbiAgICAgICAgICAgICAgICAgICAgXCJyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZVwiIGJlY2F1c2Ugd2VcbiAgICAgICAgICAgICAgICAgICAgaGF2ZSBhbHJlYWR5IHJlc29sdmUgYWxsIG1vZHVsZSBpZHMuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAnLi8nLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmVuY29kaW5nKVxuICAgICAgICAgICAgbGV0IHR5cGU6P3N0cmluZ1xuICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIHR5cGUgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBHaXZlbiByZXF1ZXN0IFwiJHttb2R1bGVJRH1cIiBjb3VsZG4ndCBiZSByZXNvbHZlZC5gKVxuICAgICAgICAgICAgaWYgKHR5cGUpXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm5lZWRlZFt0eXBlXSA9IHRydWVcbiAgICAgICAgfVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gYWRkaW5nIHNwZWNpYWwgYWxpYXNlc1xuLy8gTk9URTogVGhpcyBhbGlhcyBjb3VsZG4ndCBiZSBzZXQgaW4gdGhlIFwicGFja2FnZS5qc29uXCIgZmlsZSBzaW5jZSB0aGlzIHdvdWxkXG4vLyByZXN1bHQgaW4gYW4gZW5kbGVzcyBsb29wLlxucmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXIgPSAnJ1xuZm9yIChjb25zdCBsb2FkZXI6UGxhaW5PYmplY3Qgb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgLnRlbXBsYXRlLnVzZVxuKSB7XG4gICAgaWYgKFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyXG4gICAgKVxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyICs9ICchJ1xuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciArPSBsb2FkZXIubG9hZGVyXG4gICAgaWYgKGxvYWRlci5vcHRpb25zKVxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyICs9ICc/JyArXG4gICAgICAgICAgICAgICAgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKGxvYWRlci5vcHRpb25zKVxufVxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVQYXRoJCA9XG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhcHBseSBodG1sIHdlYnBhY2sgcGx1Z2luIHdvcmthcm91bmRzXG4vKlxuICAgIE5PVEU6IFByb3ZpZGVzIGEgd29ya2Fyb3VuZCB0byBoYW5kbGUgYSBidWcgd2l0aCBjaGFpbmVkIGxvYWRlclxuICAgIGNvbmZpZ3VyYXRpb25zLlxuKi9cbmZvciAoXG4gICAgbGV0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5odG1sXG4pIHtcbiAgICBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgIHRydWUsIGh0bWxDb25maWd1cmF0aW9uLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwpXG4gICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdCA9IGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoXG4gICAgaWYgKFxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aCAhPT1cbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS5maWxlUGF0aCAmJlxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5vcHRpb25zXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RTdHJpbmc6T2JqZWN0ID0gbmV3IFN0cmluZyhcbiAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3QgK1xuICAgICAgICAgICAgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLm9wdGlvbnMpKVxuICAgICAgICByZXF1ZXN0U3RyaW5nLnJlcGxhY2UgPSAoKHN0cmluZzpzdHJpbmcpOkZ1bmN0aW9uID0+IChcbiAgICAgICAgICAgIF9zZWFyY2g6UmVnRXhwfHN0cmluZywgX3JlcGxhY2VtZW50OnN0cmluZ3woXG4gICAgICAgICAgICAgICAgLi4ubWF0Y2hlczpBcnJheTxzdHJpbmc+XG4gICAgICAgICAgICApID0+IHN0cmluZ1xuICAgICAgICApOnN0cmluZyA9PiBzdHJpbmcpKGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5yZXF1ZXN0ID0gcmVxdWVzdFN0cmluZ1xuICAgIH1cbn1cbi8vIGVuZHJlZ2lvblxuZXhwb3J0IGRlZmF1bHQgcmVzb2x2ZWRDb25maWd1cmF0aW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==