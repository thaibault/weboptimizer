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
var resolvedConfiguration = _clientnode2.default.evaluateDynamicDataStructure(configuration, {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUQzRSxpSEFFRTtBQUFBLFlBRE0saUJBQ047O0FBQ0UsNkJBQU0sWUFBTixDQUNJLElBREosRUFDVSxpQkFEVixFQUM2QixzQkFBc0IsS0FBdEIsQ0FBNEIsV0FEekQ7QUFFQSwwQkFBa0IsUUFBbEIsQ0FBMkIsT0FBM0IsR0FBcUMsa0JBQWtCLFFBQWxCLENBQTJCLFFBQWhFO0FBQ0EsWUFDSSxrQkFBa0IsUUFBbEIsQ0FBMkIsUUFBM0IsS0FDSSxzQkFBc0IsS0FBdEIsQ0FBNEIsV0FBNUIsQ0FBd0MsUUFBeEMsQ0FBaUQsUUFEckQsSUFFQSxrQkFBa0IsUUFBbEIsQ0FBMkIsT0FIL0IsRUFJRTtBQUNFLGdCQUFNLGdCQUF1QixJQUFJLE1BQUosQ0FDekIsa0JBQWtCLFFBQWxCLENBQTJCLE9BQTNCLEdBQ0EscUJBQU0sMkJBQU4sQ0FDSSxrQkFBa0IsUUFBbEIsQ0FBMkIsT0FEL0IsQ0FGeUIsQ0FBN0I7QUFJQSwwQkFBYyxPQUFkLEdBQXlCLFVBQUMsTUFBRDtBQUFBLHVCQUE0QixVQUNqRCxPQURpRCxFQUMxQixZQUQwQjtBQUFBLDJCQUl6QyxNQUp5QztBQUFBLGlCQUE1QjtBQUFBLGFBQUQsQ0FJSixrQkFBa0IsUUFBbEIsQ0FBMkIsUUFKdkIsQ0FBeEI7QUFLQSw4QkFBa0IsUUFBbEIsQ0FBMkIsT0FBM0IsR0FBcUMsYUFBckM7QUFDSDtBQUNKO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBQ2UscUI7QUFDZjtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB0eXBlIHtQbGFpbk9iamVjdH0gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcbi8vIE5PVEU6IFwie2NvbmZpZ3VyYXRpb24gYXMgbWV0YUNvbmZpZ3VyYXRpb259XCIgd291bGQgcmVzdWx0IGluIGEgcmVhZCBvbmx5XG4vLyB2YXJpYWJsZSBuYW1lZCBcIm1ldGFDb25maWd1cmF0aW9uXCIuXG5pbXBvcnQge2NvbmZpZ3VyYXRpb24gYXMgZ2l2ZW5NZXRhQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9wYWNrYWdlJ1xuaW1wb3J0IHR5cGUge1xuICAgIERlZmF1bHRDb25maWd1cmF0aW9uLFxuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgSFRNTENvbmZpZ3VyYXRpb24sXG4gICAgSW50ZXJuYWxJbmplY3Rpb24sXG4gICAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIE1ldGFDb25maWd1cmF0aW9uLFxuICAgIFJlc29sdmVkQ29uZmlndXJhdGlvblxufSBmcm9tICcuL3R5cGUnXG5sZXQgbWV0YUNvbmZpZ3VyYXRpb246TWV0YUNvbmZpZ3VyYXRpb24gPSBnaXZlbk1ldGFDb25maWd1cmF0aW9uXG4vKlxuICAgIFRvIGFzc3VtZSB0byBnbyB0d28gZm9sZGVyIHVwIGZyb20gdGhpcyBmaWxlIHVudGlsIHRoZXJlIGlzIG5vXG4gICAgXCJub2RlX21vZHVsZXNcIiBwYXJlbnQgZm9sZGVyIGlzIHVzdWFsbHkgcmVzaWxpZW50IGFnYWluIGRlYWxpbmcgd2l0aFxuICAgIHByb2plY3RzIHdoZXJlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgaXNuJ3QgdGhlIHByb2plY3RzIGRpcmVjdG9yeSBhbmRcbiAgICB0aGlzIGxpYnJhcnkgaXMgbG9jYXRlZCBhcyBhIG5lc3RlZCBkZXBlbmRlbmN5LlxuKi9cbm1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gX19kaXJuYW1lXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmNvbnRleHRUeXBlID0gJ21haW4nXG53aGlsZSAodHJ1ZSkge1xuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCwgJy4uLy4uLycpXG4gICAgaWYgKHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dFxuICAgICkpICE9PSAnbm9kZV9tb2R1bGVzJylcbiAgICAgICAgYnJlYWtcbn1cbmlmIChcbiAgICBwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkgPT09ICdub2RlX21vZHVsZXMnIHx8XG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpID09PSAnLnN0YWdpbmcnICYmXG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSkgPT09ICdub2RlX21vZHVsZXMnXG4pIHtcbiAgICAvKlxuICAgICAgICBOT1RFOiBJZiB3ZSBhcmUgZGVhbGluZyB3YXMgYSBkZXBlbmRlbmN5IHByb2plY3QgdXNlIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgICAgIGFzIGNvbnRleHQuXG4gICAgKi9cbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmNvbnRleHRUeXBlID0gJ2RlcGVuZGVuY3knXG59IGVsc2VcbiAgICAvKlxuICAgICAgICBOT1RFOiBJZiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSByZWZlcmVuY2VzIHRoaXMgZmlsZSB2aWEgYVxuICAgICAgICBsaW5rZWQgXCJub2RlX21vZHVsZXNcIiBmb2xkZXIgdXNpbmcgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBhcyBjb250ZXh0XG4gICAgICAgIGlzIGEgYmV0dGVyIGFzc3VtcHRpb24gdGhhbiB0d28gZm9sZGVycyB1cCB0aGUgaGllcmFyY2h5LlxuICAgICovXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGZpbGVTeXN0ZW0ubHN0YXRTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZChcbiAgICAgICAgKSwgJ25vZGVfbW9kdWxlcycpKS5pc1N5bWJvbGljTGluaygpKVxuICAgICAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5sZXQgc3BlY2lmaWNDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0XG50cnkge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWV2YWwgKi9cbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSBldmFsKCdyZXF1aXJlJykocGF0aC5qb2luKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCwgJ3BhY2thZ2UnKSlcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWV2YWwgKi9cbn0gY2F0Y2ggKGVycm9yKSB7XG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uID0ge25hbWU6ICdtb2NrdXAnfVxuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxufVxuY29uc3QgbmFtZTpzdHJpbmcgPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ubmFtZVxuc3BlY2lmaWNDb25maWd1cmF0aW9uID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLndlYk9wdGltaXplciB8fCB7fVxuc3BlY2lmaWNDb25maWd1cmF0aW9uLm5hbWUgPSBuYW1lXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBsb2FkaW5nIGRlZmF1bHQgY29uZmlndXJhdGlvblxuLy8gTk9URTogR2l2ZW4gbm9kZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzIHJlc3VsdHMgaW4gXCJucG1fY29uZmlnXypcIlxuLy8gZW52aXJvbm1lbnQgdmFyaWFibGVzLlxubGV0IGRlYnVnOmJvb2xlYW4gPSBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmRlYnVnXG5pZiAoc3BlY2lmaWNDb25maWd1cmF0aW9uLmRlYnVnICE9PSB1bmRlZmluZWQpXG4gICAgZGVidWcgPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24uZGVidWdcbmVsc2UgaWYgKHByb2Nlc3MuZW52Lm5wbV9jb25maWdfZGV2ID09PSAndHJ1ZScpXG4gICAgZGVidWcgPSB0cnVlXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCArPSAnLydcbi8vIE1lcmdlcyBmaW5hbCBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IGRlcGVuZGluZyBvbiBnaXZlbiB0YXJnZXRcbi8vIGVudmlyb25tZW50LlxuY29uc3QgbGlicmFyeUNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSBtZXRhQ29uZmlndXJhdGlvbi5saWJyYXJ5XG5sZXQgY29uZmlndXJhdGlvbjpEZWZhdWx0Q29uZmlndXJhdGlvblxuaWYgKGRlYnVnKVxuICAgIGNvbmZpZ3VyYXRpb24gPSBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LCBtZXRhQ29uZmlndXJhdGlvbi5kZWJ1Z1xuICAgICksIG1ldGFDb25maWd1cmF0aW9uLmRlYnVnKVxuZWxzZVxuICAgIGNvbmZpZ3VyYXRpb24gPSBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0XG5jb25maWd1cmF0aW9uLmRlYnVnID0gZGVidWdcbmlmICh0eXBlb2YgY29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSAnb2JqZWN0JylcbiAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICBsaWJyYXJ5Q29uZmlndXJhdGlvbiwgY29uZmlndXJhdGlvbi5saWJyYXJ5XG4gICAgKSwgY29uZmlndXJhdGlvbi5saWJyYXJ5KVxuaWYgKFxuICAgICdsaWJyYXJ5JyBpbiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gJiZcbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ubGlicmFyeSA9PT0gdHJ1ZSB8fCAoXG4gICAgICAgICdsaWJyYXJ5JyBpbiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gJiZcbiAgICAgICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLmxpYnJhcnkgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAhKCdsaWJyYXJ5JyBpbiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24pXG4gICAgKSAmJiBjb25maWd1cmF0aW9uLmxpYnJhcnlcbilcbiAgICBjb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgY29uZmlndXJhdGlvbiwgbGlicmFyeUNvbmZpZ3VyYXRpb25cbiAgICApLCBsaWJyYXJ5Q29uZmlndXJhdGlvbilcbi8vIGVuZHJlZ2lvblxuLypcbiAgICByZWdpb24gbWVyZ2luZyBhbmQgZXZhbHVhdGluZyBkZWZhdWx0LCB0ZXN0LCBkb2N1bWVudCwgc3BlY2lmaWMgYW5kIGR5bmFtaWNcbiAgICBzZXR0aW5nc1xuKi9cbi8vIC8gcmVnaW9uIGxvYWQgYWRkaXRpb25hbCBkeW5hbWljYWxseSBnaXZlbiBjb25maWd1cmF0aW9uXG5sZXQgY291bnQ6bnVtYmVyID0gMFxubGV0IGZpbGVQYXRoOj9zdHJpbmcgPSBudWxsXG53aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IG5ld0ZpbGVQYXRoOnN0cmluZyA9IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0ICtcbiAgICAgICAgYC5keW5hbWljQ29uZmlndXJhdGlvbi0ke2NvdW50fS5qc29uYFxuICAgIGlmICghVG9vbHMuaXNGaWxlU3luYyhuZXdGaWxlUGF0aCkpXG4gICAgICAgIGJyZWFrXG4gICAgZmlsZVBhdGggPSBuZXdGaWxlUGF0aFxuICAgIGNvdW50ICs9IDFcbn1cbmxldCBydW50aW1lSW5mb3JtYXRpb246UGxhaW5PYmplY3QgPSB7XG4gICAgZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50czogcHJvY2Vzcy5hcmd2XG59XG5pZiAoZmlsZVBhdGgpIHtcbiAgICBydW50aW1lSW5mb3JtYXRpb24gPSBKU09OLnBhcnNlKGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCB7XG4gICAgICAgIGVuY29kaW5nOiAoY29uZmlndXJhdGlvbi5lbmNvZGluZzpzdHJpbmcpfSkpXG4gICAgZmlsZVN5c3RlbS51bmxpbmsoZmlsZVBhdGgsIChlcnJvcjo/RXJyb3IpOnZvaWQgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgIH0pXG59XG4vLyAvLyByZWdpb24gYXBwbHkgdXNlIGNhc2Ugc3BlY2lmaWMgY29uZmlndXJhdGlvblxuaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDIpXG4gICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2RvY3VtZW50JywgJ3Rlc3QnLCAndGVzdDpicm93c2VyJ10pXG4gICAgICAgIGlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gdHlwZSlcbiAgICAgICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgY29uZmlndXJhdGlvblt0eXBlXVxuICAgICAgICAgICAgKSwgY29uZmlndXJhdGlvblt0eXBlXSlcbi8vIC8vIGVuZHJlZ2lvblxuZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2RvY3VtZW50JywgJ3Rlc3QnLCAndGVzdDpCcm93c2VyJ10pXG4gICAgZGVsZXRlIGNvbmZpZ3VyYXRpb25bdHlwZV1cbi8vIC8gZW5kcmVnaW9uXG5Ub29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICBjb25maWd1cmF0aW9uLCBzcGVjaWZpY0NvbmZpZ3VyYXRpb25cbiksIHJ1bnRpbWVJbmZvcm1hdGlvbiksIHNwZWNpZmljQ29uZmlndXJhdGlvbiwgcnVudGltZUluZm9ybWF0aW9uKVxubGV0IHJlc3VsdDo/UGxhaW5PYmplY3QgPSBudWxsXG5pZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoID4gMylcbiAgICByZXN1bHQgPSBUb29scy5zdHJpbmdQYXJzZUVuY29kZWRPYmplY3QoXG4gICAgICAgIHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzW3J1bnRpbWVJbmZvcm1hdGlvblxuICAgICAgICAgICAgLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoIC0gMV0sXG4gICAgICAgIGNvbmZpZ3VyYXRpb24sICdjb25maWd1cmF0aW9uJylcbmlmIChUb29scy5pc1BsYWluT2JqZWN0KHJlc3VsdCkpXG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChjb25maWd1cmF0aW9uLCByZXN1bHQpLCByZXN1bHQpXG4vLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGRldGVybWluZSBleGlzdGluZyBwcmUgY29tcGlsZWQgZGxsIG1hbmlmZXN0cyBmaWxlIHBhdGhzXG5jb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzID0gW11cbmlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMoY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKSlcbiAgICBmb3IgKGNvbnN0IGZpbGVOYW1lOnN0cmluZyBvZiBmaWxlU3lzdGVtLnJlYWRkaXJTeW5jKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2VcbiAgICApKVxuICAgICAgICBpZiAoZmlsZU5hbWUubWF0Y2goL14uKlxcLmRsbC1tYW5pZmVzdFxcLmpzb24kLykpXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLnB1c2gocGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwgZmlsZU5hbWUpKVxuLy8gLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGJ1aWxkIGFic29sdXRlIHBhdGhzXG5jb25maWd1cmF0aW9uLnBhdGguYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UpXG5mb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoKVxuICAgIGlmIChcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9PSAnYmFzZScgJiZcbiAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldID09PSAnc3RyaW5nJ1xuICAgIClcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV1cbiAgICAgICAgKSArICcvJ1xuICAgIGVsc2UgaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QoY29uZmlndXJhdGlvbi5wYXRoW2tleV0pKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSlcbiAgICAgICAgZm9yIChjb25zdCBzdWJLZXk6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldKVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmhhc093blByb3BlcnR5KHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICAhWydiYXNlJywgJ3B1YmxpYyddLmluY2x1ZGVzKHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldXG4gICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNQbGFpbk9iamVjdChjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5iYXNlKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViU3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldKVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICApICYmIHN1YlN1YktleSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViU3ViS2V5XG4gICAgICAgICAgICAgICAgICAgIF0gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtzdWJTdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtzdWJTdWJLZXldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgfVxuICAgIH1cbi8vIC8gZW5kcmVnaW9uXG5jb25zdCBub3c6RGF0ZSA9IG5ldyBEYXRlKClcbmNvbnN0IHJlc29sdmVkQ29uZmlndXJhdGlvbjpSZXNvbHZlZENvbmZpZ3VyYXRpb24gPVxuICAgIFRvb2xzLmV2YWx1YXRlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoY29uZmlndXJhdGlvbiwge1xuICAgICAgICBjdXJyZW50UGF0aDogcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgZmlsZVN5c3RlbSxcbiAgICAgICAgSGVscGVyLFxuICAgICAgICBwYXRoLFxuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1ldmFsICovXG4gICAgICAgIHJlcXVpcmU6IGV2YWwoJ3JlcXVpcmUnKSxcbiAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1ldmFsICovXG4gICAgICAgIFRvb2xzLFxuICAgICAgICB3ZWJPcHRpbWl6ZXJQYXRoOiBfX2Rpcm5hbWUsXG4gICAgICAgIG5vdyxcbiAgICAgICAgbm93VVRDVGltZXN0YW1wOiBUb29scy5udW1iZXJHZXRVVENUaW1lc3RhbXAobm93KVxuICAgIH0pXG4vLyByZWdpb24gY29uc29saWRhdGUgZmlsZSBzcGVjaWZpYyBidWlsZCBjb25maWd1cmF0aW9uXG4vLyBBcHBseSBkZWZhdWx0IGZpbGUgbGV2ZWwgYnVpbGQgY29uZmlndXJhdGlvbnMgdG8gYWxsIGZpbGUgdHlwZSBzcGVjaWZpY1xuLy8gb25lcy5cbmNvbnN0IGRlZmF1bHRDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID1cbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMuZGVmYXVsdFxuZGVsZXRlIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcy5kZWZhdWx0XG5mb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcylcbiAgICBpZiAocmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmhhc093blByb3BlcnR5KHR5cGUpKVxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNbdHlwZV0gPSBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge1xuICAgICAgICB9LCBkZWZhdWx0Q29uZmlndXJhdGlvbiwgVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgdHJ1ZSwge2V4dGVuc2lvbjogdHlwZX0sIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlc1t0eXBlXSxcbiAgICAgICAgICAgIHt0eXBlfSkpXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiByZXNvbHZlIG1vZHVsZSBsb2NhdGlvbiBhbmQgZGV0ZXJtaW5lIHdoaWNoIGFzc2V0IHR5cGVzIGFyZSBuZWVkZWRcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUubG9jYXRpb25zID0gSGVscGVyLmRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UpXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uID0gSGVscGVyLnJlc29sdmVJbmplY3Rpb24oXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbiwgSGVscGVyLnJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcyxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgIEhlbHBlci5ub3JtYWxpemVQYXRocyhyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAhcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lc1xuICAgICksIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uYXV0b0V4Y2x1ZGUsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucyxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSlcbmNvbnN0IGludGVybmFsSW5qZWN0aW9uOmFueSA9IHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWxcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwgPSB7XG4gICAgZ2l2ZW46IHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwsXG4gICAgbm9ybWFsaXplZDogSGVscGVyLnJlc29sdmVNb2R1bGVzSW5Gb2xkZXJzKFxuICAgICAgICBIZWxwZXIubm9ybWFsaXplSW50ZXJuYWxJbmplY3Rpb24oaW50ZXJuYWxJbmplY3Rpb24pLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSl9XG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkID0ge2phdmFTY3JpcHQ6IGNvbmZpZ3VyYXRpb24uZGVidWcgJiYgW1xuICAgICdzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXG5dLmluY2x1ZGVzKHJlc29sdmVkQ29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKX1cbmZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsXG4gICAgLm5vcm1hbGl6ZWRcbilcbiAgICBpZiAocmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICBjaHVua05hbWVcbiAgICApKVxuICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsXG4gICAgICAgICAgICAubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IFdlIGRvZXNuJ3QgdXNlXG4gICAgICAgICAgICAgICAgICAgIFwicmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2VcIiBiZWNhdXNlIHdlXG4gICAgICAgICAgICAgICAgICAgIGhhdmUgYWxyZWFkeSByZXNvbHZlIGFsbCBtb2R1bGUgaWRzLlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgJy4vJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5lbmNvZGluZylcbiAgICAgICAgICAgIGxldCB0eXBlOj9zdHJpbmdcbiAgICAgICAgICAgIGlmIChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICB0eXBlID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgR2l2ZW4gcmVxdWVzdCBcIiR7bW9kdWxlSUR9XCIgY291bGRuJ3QgYmUgcmVzb2x2ZWQuYClcbiAgICAgICAgICAgIGlmICh0eXBlKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5uZWVkZWRbdHlwZV0gPSB0cnVlXG4gICAgICAgIH1cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGFkZGluZyBzcGVjaWFsIGFsaWFzZXNcbi8vIE5PVEU6IFRoaXMgYWxpYXMgY291bGRuJ3QgYmUgc2V0IGluIHRoZSBcInBhY2thZ2UuanNvblwiIGZpbGUgc2luY2UgdGhpcyB3b3VsZFxuLy8gcmVzdWx0IGluIGFuIGVuZGxlc3MgbG9vcC5cbnJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlcy53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyID0gJydcbmZvciAoY29uc3QgbG9hZGVyOlBsYWluT2JqZWN0IG9mIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgIC50ZW1wbGF0ZS51c2Vcbikge1xuICAgIGlmIChcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzXG4gICAgICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlclxuICAgIClcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzXG4gICAgICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciArPSAnISdcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXIgKz0gbG9hZGVyLmxvYWRlclxuICAgIGlmIChsb2FkZXIub3B0aW9ucylcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzXG4gICAgICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciArPSAnPycgK1xuICAgICAgICAgICAgICAgIFRvb2xzLmNvbnZlcnRDaXJjdWxhck9iamVjdFRvSlNPTihsb2FkZXIub3B0aW9ucylcbn1cbnJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcy53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlUGF0aCQgPVxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS5maWxlUGF0aFxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gYXBwbHkgaHRtbCB3ZWJwYWNrIHBsdWdpbiB3b3JrYXJvdW5kc1xuLypcbiAgICBOT1RFOiBQcm92aWRlcyBhIHdvcmthcm91bmQgdG8gaGFuZGxlIGEgYnVnIHdpdGggY2hhaW5lZCBsb2FkZXJcbiAgICBjb25maWd1cmF0aW9ucy5cbiovXG5mb3IgKFxuICAgIGxldCBodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbiBvZiByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbFxuKSB7XG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICB0cnVlLCBodG1sQ29uZmlndXJhdGlvbiwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MKVxuICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3QgPSBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aFxuICAgIGlmIChcbiAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGggIT09XG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUuZmlsZVBhdGggJiZcbiAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUub3B0aW9uc1xuICAgICkge1xuICAgICAgICBjb25zdCByZXF1ZXN0U3RyaW5nOk9iamVjdCA9IG5ldyBTdHJpbmcoXG4gICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5yZXF1ZXN0ICtcbiAgICAgICAgICAgIFRvb2xzLmNvbnZlcnRDaXJjdWxhck9iamVjdFRvSlNPTihcbiAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5vcHRpb25zKSlcbiAgICAgICAgcmVxdWVzdFN0cmluZy5yZXBsYWNlID0gKChzdHJpbmc6c3RyaW5nKTpGdW5jdGlvbiA9PiAoXG4gICAgICAgICAgICBfc2VhcmNoOlJlZ0V4cHxzdHJpbmcsIF9yZXBsYWNlbWVudDpzdHJpbmd8KFxuICAgICAgICAgICAgICAgIC4uLm1hdGNoZXM6QXJyYXk8c3RyaW5nPlxuICAgICAgICAgICAgKSA9PiBzdHJpbmdcbiAgICAgICAgKTpzdHJpbmcgPT4gc3RyaW5nKShodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aClcbiAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdCA9IHJlcXVlc3RTdHJpbmdcbiAgICB9XG59XG4vLyBlbmRyZWdpb25cbmV4cG9ydCBkZWZhdWx0IHJlc29sdmVkQ29uZmlndXJhdGlvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=