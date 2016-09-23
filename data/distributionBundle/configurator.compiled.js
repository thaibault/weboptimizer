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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
var metaConfiguration = _package.configuration;
/*
    To assume to go two folder up from this file until there is no
    "node_modules" parent folder  is usually resilient again dealing with
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
    // IgnoreTypeCheck
    specificConfiguration = require(_path2.default.join(metaConfiguration.default.path.context, 'package'));
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
if (specificConfiguration.debug !== undefined) debug = specificConfiguration.debug;
if (process.env.npm_config_production) debug = false;else if (process.env.npm_config_debug) debug = true;
metaConfiguration.default.path.context += '/';
// Merges final default configuration object depending on given target
// environment.
var libraryConfiguration = metaConfiguration.library;
var configuration = void 0;
if (debug) configuration = _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(metaConfiguration.default, metaConfiguration.debug), metaConfiguration.debug);else configuration = metaConfiguration.default;
configuration.debug = debug;
if (_typeof(configuration.library) === 'object') _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(libraryConfiguration, configuration.library), configuration.library);
if ('library' in specificConfiguration &&
// IgnoreTypeCheck
specificConfiguration.library === true || ('library' in specificConfiguration && specificConfiguration.library === undefined || !('library' in specificConfiguration)) && configuration.library) configuration = _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, libraryConfiguration), libraryConfiguration);
// endregion
// region merging and evaluating default, test, specific and dynamic settings
// / region load additional dynamically given configuration
var count = 0;
var filePath = null;
while (true) {
    var newFilePath = configuration.path.context + ('.dynamicConfiguration-' + count + '.json');
    if (!_helper2.default.isFileSync(newFilePath)) break;
    filePath = newFilePath;
    count += 1;
}
var runtimeInformation = {
    givenCommandLineArguments: process.argv
};
if (filePath) {
    runtimeInformation = JSON.parse(fileSystem.readFileSync(filePath, {
        encoding: 'utf-8' }));
    fileSystem.unlink(filePath, function (error) {
        if (error) throw error;
    });
}
if (runtimeInformation.givenCommandLineArguments.length > 2)
    // region apply documentation configuration
    if (runtimeInformation.givenCommandLineArguments[2] === 'document') _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, configuration.document), configuration.document);
    // endregion
    // region apply test configuration
    else if (runtimeInformation.givenCommandLineArguments[2] === 'testInBrowser') _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, configuration.testInBrowser), configuration.testInBrowser);else if (runtimeInformation.givenCommandLineArguments[2] === 'test') _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, configuration.test), configuration.test);
// endregion
// / endregion
_clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(_clientnode2.default.modifyObject(configuration, specificConfiguration), runtimeInformation), specificConfiguration, runtimeInformation);
var result = null;
if (runtimeInformation.givenCommandLineArguments.length > 3) result = _helper2.default.parseEncodedObject(runtimeInformation.givenCommandLineArguments[runtimeInformation.givenCommandLineArguments.length - 1], configuration, 'configuration');
if (_clientnode2.default.isPlainObject(result)) _clientnode2.default.extendObject(true, _clientnode2.default.modifyObject(configuration, result), result);
// / region determine existing pre compiled dll manifests file paths
configuration.dllManifestFilePaths = [];
if (_helper2.default.isDirectorySync(configuration.path.target.base)) fileSystem.readdirSync(configuration.path.target.base).forEach(function (fileName) {
    if (fileName.match(/^.*\.dll-manifest\.json$/)) configuration.dllManifestFilePaths.push(_path2.default.resolve(configuration.path.target.base, fileName));
});
// / endregion
// / region define dynamic resolve parameter
var parameterDescription = ['self', 'webOptimizerPath', 'currentPath', 'path', 'helper', 'tools'];
var parameter = [configuration, __dirname, process.cwd(), _path2.default, _helper2.default, _clientnode2.default];
// / endregion
// / region build absolute paths
configuration.path.base = _path2.default.resolve(configuration.path.context, _clientnode2.default.resolveDynamicDataStructure(configuration.path.base, parameterDescription, parameter, false));
for (var key in configuration.path) {
    if (configuration.path.hasOwnProperty(key) && key !== 'base' && typeof configuration.path[key] === 'string') configuration.path[key] = _path2.default.resolve(configuration.path.base, _clientnode2.default.resolveDynamicDataStructure(configuration.path[key], parameterDescription, parameter, false)) + '/';else {
        configuration.path[key] = _clientnode2.default.resolveDynamicDataStructure(configuration.path[key], parameterDescription, parameter, false);
        if (_clientnode2.default.isPlainObject(configuration.path[key])) {
            configuration.path[key].base = _path2.default.resolve(configuration.path.base, configuration.path[key].base);
            for (var subKey in configuration.path[key]) {
                if (configuration.path[key].hasOwnProperty(subKey) && !['base', 'public'].includes(subKey) && typeof configuration.path[key][subKey] === 'string') configuration.path[key][subKey] = _path2.default.resolve(configuration.path[key].base, _clientnode2.default.resolveDynamicDataStructure(configuration.path[key][subKey], parameterDescription, parameter, false)) + '/';else {
                    configuration.path[key][subKey] = _clientnode2.default.resolveDynamicDataStructure(configuration.path[key][subKey], parameterDescription, parameter, false);
                    if (_clientnode2.default.isPlainObject(configuration.path[key][subKey])) {
                        configuration.path[key][subKey].base = _path2.default.resolve(configuration.path[key].base, configuration.path[key][subKey].base);
                        for (var subSubKey in configuration.path[key][subKey]) {
                            if (configuration.path[key][subKey].hasOwnProperty(subSubKey) && subSubKey !== 'base' && typeof configuration.path[key][subKey][subSubKey] === 'string') configuration.path[key][subKey][subSubKey] = _path2.default.resolve(configuration.path[key][subKey].base, _clientnode2.default.resolveDynamicDataStructure(configuration.path[key][subKey][subSubKey], parameterDescription, parameter, false)) + '/';
                        }
                    }
                }
            }
        }
    }
} // / endregion
var resolvedConfiguration = _clientnode2.default.unwrapProxy(_clientnode2.default.resolveDynamicDataStructure(_clientnode2.default.resolveDynamicDataStructure(configuration, parameterDescription, parameter), parameterDescription, parameter, true));
// endregion
// region consolidate file specific build configuration
// Apply default file level build configurations to all file type specific
// ones.
var defaultConfiguration = resolvedConfiguration.build.types.default;
delete resolvedConfiguration.build.types.default;
for (var type in resolvedConfiguration.build.types) {
    if (resolvedConfiguration.build.types.hasOwnProperty(type)) resolvedConfiguration.build.types[type] = _clientnode2.default.extendObject(true, {}, defaultConfiguration, _clientnode2.default.extendObject(true, { extension: type }, resolvedConfiguration.build.types[type], { type: type }));
} // endregion
// region resolve module location and which asset types are needed
resolvedConfiguration.module.locations = _helper2.default.determineModuleLocations(resolvedConfiguration.injection.internal, resolvedConfiguration.module.aliases, resolvedConfiguration.extensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base);
resolvedConfiguration.injection = _helper2.default.resolveInjection(resolvedConfiguration.injection, _helper2.default.resolveBuildConfigurationFilePaths(resolvedConfiguration.build.types, resolvedConfiguration.path.source.asset.base, _helper2.default.normalizePaths(resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
    return _path2.default.resolve(resolvedConfiguration.path.context, filePath);
}).filter(function (filePath) {
    return !resolvedConfiguration.path.context.startsWith(filePath);
}))), resolvedConfiguration.injection.autoExclude, resolvedConfiguration.module.aliases, resolvedConfiguration.extensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore);
resolvedConfiguration.injection.internal = {
    given: resolvedConfiguration.injection.internal,
    normalized: _helper2.default.resolveModulesInFolders(
    // IgnoreTypeCheck
    _helper2.default.normalizeInternalInjection(resolvedConfiguration.injection.internal), resolvedConfiguration.module.aliases, resolvedConfiguration.extensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
        return _path2.default.resolve(resolvedConfiguration.path.context, filePath);
    }).filter(function (filePath) {
        return !resolvedConfiguration.path.context.startsWith(filePath);
    })) };
resolvedConfiguration.needed = { javaScript: configuration.debug && ['serve', 'testInBrowser'].includes(resolvedConfiguration.givenCommandLineArguments[2]) };
for (var chunkName in resolvedConfiguration.injection.internal.normalized) {
    if (resolvedConfiguration.injection.internal.normalized.hasOwnProperty(chunkName)) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = resolvedConfiguration.injection.internal.normalized[chunkName][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _moduleID = _step.value;

                var _filePath = _helper2.default.determineModuleFilePath(_moduleID, resolvedConfiguration.module.aliases, resolvedConfiguration.extensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore, resolvedConfiguration.module.directoryNames, resolvedConfiguration.package.main.fileNames, resolvedConfiguration.package.main.propertyNames, resolvedConfiguration.package.aliasPropertyNames);
                var _type = void 0;
                if (_filePath) _type = _helper2.default.determineAssetType(_filePath, resolvedConfiguration.build.types, resolvedConfiguration.path);else throw new Error('Given request "' + _moduleID + '" couldn\'t be resolved.');
                if (_type) resolvedConfiguration.needed[_type] = true;
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
} // endregion
// region adding special aliases
// NOTE: This alias couldn't be set in the "package.json" file since this would
// result in an endless loop.
resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader = resolvedConfiguration.files.defaultHTML.template.substring(0, resolvedConfiguration.files.defaultHTML.template.lastIndexOf('!'));
resolvedConfiguration.module.aliases.webOptimizerDefaultTemplateFilePath$ = _helper2.default.stripLoader(resolvedConfiguration.files.defaultHTML.template);
// endregion
// region apply webpack html plugin workaround
/*
    NOTE: Provides a workaround to handle a bug with chained loader
    configurations.
*/
var _iteratorNormalCompletion2 = true;
var _didIteratorError2 = false;
var _iteratorError2 = undefined;

try {
    for (var _iterator2 = resolvedConfiguration.files.html[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var htmlConfiguration = _step2.value;

        _clientnode2.default.extendObject(true, htmlConfiguration, resolvedConfiguration.files.defaultHTML);
        if (typeof htmlConfiguration.template === 'string' && htmlConfiguration.template.includes('!') && htmlConfiguration.template !== resolvedConfiguration.files.defaultHTML.template) {
            var newTemplateString = new String(htmlConfiguration.template);
            newTemplateString.replace = function (string) {
                return function (_search, _replacement) {
                    return string;
                };
            }(htmlConfiguration.template);
            htmlConfiguration.template = newTemplateString;
        }
    }
    // endregion
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

exports.default = resolvedConfiguration;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,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QUFHQSxzQkFBc0IsTUFBdEIsQ0FBNkIsT0FBN0IsQ0FBcUMsb0NBQXJDLEdBQ0ksaUJBQU8sV0FBUCxDQUFtQixzQkFBc0IsS0FBdEIsQ0FBNEIsV0FBNUIsQ0FBd0MsUUFBM0QsQ0FESjtBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FBSUEsMEJBQytDLHNCQUFzQixLQUF0QixDQUE0QixJQUQzRSxtSUFFRTtBQUFBLFlBRE0saUJBQ047O0FBQ0UsNkJBQU0sWUFBTixDQUNJLElBREosRUFDVSxpQkFEVixFQUM2QixzQkFBc0IsS0FBdEIsQ0FBNEIsV0FEekQ7QUFFQSxZQUNJLE9BQU8sa0JBQWtCLFFBQXpCLEtBQXNDLFFBQXRDLElBQ0Esa0JBQWtCLFFBQWxCLENBQTJCLFFBQTNCLENBQW9DLEdBQXBDLENBREEsSUFFQSxrQkFBa0IsUUFBbEIsS0FDSSxzQkFBc0IsS0FBdEIsQ0FBNEIsV0FBNUIsQ0FBd0MsUUFKaEQsRUFLRTtBQUNFLGdCQUFNLG9CQUEyQixJQUFJLE1BQUosQ0FBVyxrQkFBa0IsUUFBN0IsQ0FBakM7QUFDQSw4QkFBa0IsT0FBbEIsR0FBNkIsVUFBQyxNQUFEO0FBQUEsdUJBQTRCLFVBQ3JELE9BRHFELEVBQzlCLFlBRDhCO0FBQUEsMkJBSTdDLE1BSjZDO0FBQUEsaUJBQTVCO0FBQUEsYUFBRCxDQUlSLGtCQUFrQixRQUpWLENBQTVCO0FBS0EsOEJBQWtCLFFBQWxCLEdBQTZCLGlCQUE3QjtBQUNIO0FBQ0o7QUFDRDs7Ozs7Ozs7Ozs7Ozs7OztrQkFDZSxxQjtBQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvbmZpZ3VyYXRvci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcbi8vIE5PVEU6IFwie2NvbmZpZ3VyYXRpb24gYXMgbWV0YUNvbmZpZ3VyYXRpb259XCIgd291bGQgcmVzdWx0IGluIGEgcmVhZCBvbmx5XG4vLyB2YXJpYWJsZSBuYW1lZCBcIm1ldGFDb25maWd1cmF0aW9uXCIuXG5pbXBvcnQge2NvbmZpZ3VyYXRpb24gYXMgZ2l2ZW5NZXRhQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9wYWNrYWdlJ1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCB0eXBlIHtcbiAgICBEZWZhdWx0Q29uZmlndXJhdGlvbiwgSFRNTENvbmZpZ3VyYXRpb24sIE1ldGFDb25maWd1cmF0aW9uLCBQbGFpbk9iamVjdCxcbiAgICBSZXNvbHZlZENvbmZpZ3VyYXRpb25cbn0gZnJvbSAnLi90eXBlJ1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xubGV0IG1ldGFDb25maWd1cmF0aW9uOk1ldGFDb25maWd1cmF0aW9uID0gZ2l2ZW5NZXRhQ29uZmlndXJhdGlvblxuLypcbiAgICBUbyBhc3N1bWUgdG8gZ28gdHdvIGZvbGRlciB1cCBmcm9tIHRoaXMgZmlsZSB1bnRpbCB0aGVyZSBpcyBub1xuICAgIFwibm9kZV9tb2R1bGVzXCIgcGFyZW50IGZvbGRlciAgaXMgdXN1YWxseSByZXNpbGllbnQgYWdhaW4gZGVhbGluZyB3aXRoXG4gICAgcHJvamVjdHMgd2hlcmUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBpc24ndCB0aGUgcHJvamVjdHMgZGlyZWN0b3J5IGFuZFxuICAgIHRoaXMgbGlicmFyeSBpcyBsb2NhdGVkIGFzIGEgbmVzdGVkIGRlcGVuZGVuY3kuXG4qL1xubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBfX2Rpcm5hbWVcbm1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQuY29udGV4dFR5cGUgPSAnbWFpbidcbndoaWxlICh0cnVlKSB7XG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0LCAnLi4vLi4vJylcbiAgICBpZiAocGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUoXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0XG4gICAgKSkgIT09ICdub2RlX21vZHVsZXMnKVxuICAgICAgICBicmVha1xufVxuaWYgKFxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSA9PT0gJ25vZGVfbW9kdWxlcycgfHxcbiAgICBwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkgPT09ICcuc3RhZ2luZycgJiZcbiAgICBwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpKSA9PT0gJ25vZGVfbW9kdWxlcydcbikge1xuICAgIC8qXG4gICAgICAgIE5PVEU6IElmIHdlIGFyZSBkZWFsaW5nIHdhcyBhIGRlcGVuZGVuY3kgcHJvamVjdCB1c2UgY3VycmVudCBkaXJlY3RvcnlcbiAgICAgICAgYXMgY29udGV4dC5cbiAgICAqL1xuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQuY29udGV4dFR5cGUgPSAnZGVwZW5kZW5jeSdcbn0gZWxzZVxuICAgIC8qXG4gICAgICAgIE5PVEU6IElmIHRoZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IHJlZmVyZW5jZXMgdGhpcyBmaWxlIHZpYSBhXG4gICAgICAgIGxpbmtlZCBcIm5vZGVfbW9kdWxlc1wiIGZvbGRlciB1c2luZyBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGFzIGNvbnRleHRcbiAgICAgICAgaXMgYSBiZXR0ZXIgYXNzdW1wdGlvbiB0aGFuIHR3byBmb2xkZXJzIHVwIHRoZSBoaWVyYXJjaHkuXG4gICAgKi9cbiAgICB0cnkge1xuICAgICAgICBpZiAoZmlsZVN5c3RlbS5sc3RhdFN5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKFxuICAgICAgICApLCAnbm9kZV9tb2R1bGVzJykpLmlzU3ltYm9saWNMaW5rKCkpXG4gICAgICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbiAgICB9IGNhdGNoIChlcnJvcikge31cbmxldCBzcGVjaWZpY0NvbmZpZ3VyYXRpb246UGxhaW5PYmplY3RcbnRyeSB7XG4gICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uID0gcmVxdWlyZShwYXRoLmpvaW4oXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0LCAncGFja2FnZScpKVxufSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSB7bmFtZTogJ21vY2t1cCd9XG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG59XG5jb25zdCBuYW1lOnN0cmluZyA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi5uYW1lXG5zcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ud2ViT3B0aW1pemVyIHx8IHt9XG5zcGVjaWZpY0NvbmZpZ3VyYXRpb24ubmFtZSA9IG5hbWVcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGxvYWRpbmcgZGVmYXVsdCBjb25maWd1cmF0aW9uXG4vLyBOT1RFOiBHaXZlbiBub2RlIGNvbW1hbmQgbGluZSBhcmd1bWVudHMgcmVzdWx0cyBpbiBcIm5wbV9jb25maWdfKlwiXG4vLyBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG5sZXQgZGVidWc6Ym9vbGVhbiA9IG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQuZGVidWdcbmlmIChzcGVjaWZpY0NvbmZpZ3VyYXRpb24uZGVidWcgIT09IHVuZGVmaW5lZClcbiAgICBkZWJ1ZyA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi5kZWJ1Z1xuaWYgKHByb2Nlc3MuZW52Lm5wbV9jb25maWdfcHJvZHVjdGlvbilcbiAgICBkZWJ1ZyA9IGZhbHNlXG5lbHNlIGlmIChwcm9jZXNzLmVudi5ucG1fY29uZmlnX2RlYnVnKVxuICAgIGRlYnVnID0gdHJ1ZVxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgKz0gJy8nXG4vLyBNZXJnZXMgZmluYWwgZGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdCBkZXBlbmRpbmcgb24gZ2l2ZW4gdGFyZ2V0XG4vLyBlbnZpcm9ubWVudC5cbmNvbnN0IGxpYnJhcnlDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0gbWV0YUNvbmZpZ3VyYXRpb24ubGlicmFyeVxubGV0IGNvbmZpZ3VyYXRpb246RGVmYXVsdENvbmZpZ3VyYXRpb25cbmlmIChkZWJ1ZylcbiAgICBjb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdCwgbWV0YUNvbmZpZ3VyYXRpb24uZGVidWdcbiAgICApLCBtZXRhQ29uZmlndXJhdGlvbi5kZWJ1ZylcbmVsc2VcbiAgICBjb25maWd1cmF0aW9uID0gbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdFxuY29uZmlndXJhdGlvbi5kZWJ1ZyA9IGRlYnVnXG5pZiAodHlwZW9mIGNvbmZpZ3VyYXRpb24ubGlicmFyeSA9PT0gJ29iamVjdCcpXG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgbGlicmFyeUNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb24ubGlicmFyeVxuICAgICksIGNvbmZpZ3VyYXRpb24ubGlicmFyeSlcbmlmIChcbiAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLmxpYnJhcnkgPT09IHRydWUgfHwgKFxuICAgICAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgISgnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uKVxuICAgICkgJiYgY29uZmlndXJhdGlvbi5saWJyYXJ5XG4pXG4gICAgY29uZmlndXJhdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24sIGxpYnJhcnlDb25maWd1cmF0aW9uXG4gICAgKSwgbGlicmFyeUNvbmZpZ3VyYXRpb24pXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBtZXJnaW5nIGFuZCBldmFsdWF0aW5nIGRlZmF1bHQsIHRlc3QsIHNwZWNpZmljIGFuZCBkeW5hbWljIHNldHRpbmdzXG4vLyAvIHJlZ2lvbiBsb2FkIGFkZGl0aW9uYWwgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvblxubGV0IGNvdW50Om51bWJlciA9IDBcbmxldCBmaWxlUGF0aDo/c3RyaW5nID0gbnVsbFxud2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCBuZXdGaWxlUGF0aDpzdHJpbmcgPSBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCArXG4gICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmBcbiAgICBpZiAoIUhlbHBlci5pc0ZpbGVTeW5jKG5ld0ZpbGVQYXRoKSlcbiAgICAgICAgYnJlYWtcbiAgICBmaWxlUGF0aCA9IG5ld0ZpbGVQYXRoXG4gICAgY291bnQgKz0gMVxufVxubGV0IHJ1bnRpbWVJbmZvcm1hdGlvbjpQbGFpbk9iamVjdCA9IHtcbiAgICBnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOiBwcm9jZXNzLmFyZ3Zcbn1cbmlmIChmaWxlUGF0aCkge1xuICAgIHJ1bnRpbWVJbmZvcm1hdGlvbiA9IEpTT04ucGFyc2UoZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIHtcbiAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCd9KSlcbiAgICBmaWxlU3lzdGVtLnVubGluayhmaWxlUGF0aCwgKGVycm9yOj9FcnJvcik6dm9pZCA9PiB7XG4gICAgICAgIGlmIChlcnJvcilcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbn1cbmlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKVxuICAgIC8vIHJlZ2lvbiBhcHBseSBkb2N1bWVudGF0aW9uIGNvbmZpZ3VyYXRpb25cbiAgICBpZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdkb2N1bWVudCcpXG4gICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLCBjb25maWd1cmF0aW9uLmRvY3VtZW50XG4gICAgICAgICksIGNvbmZpZ3VyYXRpb24uZG9jdW1lbnQpXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGFwcGx5IHRlc3QgY29uZmlndXJhdGlvblxuICAgIGVsc2UgaWYgKFxuICAgICAgICBydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ3Rlc3RJbkJyb3dzZXInXG4gICAgKVxuICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgY29uZmlndXJhdGlvbi50ZXN0SW5Ccm93c2VyXG4gICAgICAgICksIGNvbmZpZ3VyYXRpb24udGVzdEluQnJvd3NlcilcbiAgICBlbHNlIGlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ3Rlc3QnKVxuICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgY29uZmlndXJhdGlvbi50ZXN0XG4gICAgICAgICksIGNvbmZpZ3VyYXRpb24udGVzdClcbiAgICAvLyBlbmRyZWdpb25cbi8vIC8gZW5kcmVnaW9uXG5Ub29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICBjb25maWd1cmF0aW9uLCBzcGVjaWZpY0NvbmZpZ3VyYXRpb25cbiksIHJ1bnRpbWVJbmZvcm1hdGlvbiksIHNwZWNpZmljQ29uZmlndXJhdGlvbiwgcnVudGltZUluZm9ybWF0aW9uKVxubGV0IHJlc3VsdDo/UGxhaW5PYmplY3QgPSBudWxsXG5pZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoID4gMylcbiAgICByZXN1bHQgPSBIZWxwZXIucGFyc2VFbmNvZGVkT2JqZWN0KFxuICAgICAgICBydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1tydW50aW1lSW5mb3JtYXRpb25cbiAgICAgICAgICAgIC5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAtIDFdLFxuICAgICAgICBjb25maWd1cmF0aW9uLCAnY29uZmlndXJhdGlvbicpXG5pZiAoVG9vbHMuaXNQbGFpbk9iamVjdChyZXN1bHQpKVxuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoY29uZmlndXJhdGlvbiwgcmVzdWx0KSwgcmVzdWx0KVxuLy8gLyByZWdpb24gZGV0ZXJtaW5lIGV4aXN0aW5nIHByZSBjb21waWxlZCBkbGwgbWFuaWZlc3RzIGZpbGUgcGF0aHNcbmNvbmZpZ3VyYXRpb24uZGxsTWFuaWZlc3RGaWxlUGF0aHMgPSBbXVxuaWYgKEhlbHBlci5pc0RpcmVjdG9yeVN5bmMoY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKSlcbiAgICBmaWxlU3lzdGVtLnJlYWRkaXJTeW5jKGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSkuZm9yRWFjaCgoXG4gICAgICAgIGZpbGVOYW1lOnN0cmluZ1xuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGlmIChmaWxlTmFtZS5tYXRjaCgvXi4qXFwuZGxsLW1hbmlmZXN0XFwuanNvbiQvKSlcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZGxsTWFuaWZlc3RGaWxlUGF0aHMucHVzaChwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCBmaWxlTmFtZSkpXG4gICAgfSlcbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBkZWZpbmUgZHluYW1pYyByZXNvbHZlIHBhcmFtZXRlclxuY29uc3QgcGFyYW1ldGVyRGVzY3JpcHRpb246QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAnc2VsZicsICd3ZWJPcHRpbWl6ZXJQYXRoJywgJ2N1cnJlbnRQYXRoJywgJ3BhdGgnLCAnaGVscGVyJywgJ3Rvb2xzJ11cbmNvbnN0IHBhcmFtZXRlcjpBcnJheTxhbnk+ID0gW1xuICAgIGNvbmZpZ3VyYXRpb24sIF9fZGlybmFtZSwgcHJvY2Vzcy5jd2QoKSwgcGF0aCwgSGVscGVyLCBUb29sc11cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBidWlsZCBhYnNvbHV0ZSBwYXRoc1xuY29uZmlndXJhdGlvbi5wYXRoLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIFRvb2xzLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsIGZhbHNlKSlcbmZvciAoY29uc3Qga2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGgpXG4gICAgaWYgKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09ICdiYXNlJyAmJlxuICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPT09ICdzdHJpbmcnXG4gICAgKVxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlLCBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0sIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAgICAgZmFsc2UpXG4gICAgICAgICkgKyAnLydcbiAgICBlbHNlIHtcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPSBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XSwgcGFyYW1ldGVyRGVzY3JpcHRpb24sIHBhcmFtZXRlciwgZmFsc2UpXG4gICAgICAgIGlmIChUb29scy5pc1BsYWluT2JqZWN0KGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldKSkge1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSlcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XSlcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmhhc093blByb3BlcnR5KHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIVsnYmFzZScsICdwdWJsaWMnXS5pbmNsdWRlcyhzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNQbGFpbk9iamVjdChjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5iYXNlID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5iYXNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJTdWJLZXk6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJLZXldXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiYgc3ViU3ViS2V5ICE9PSAnYmFzZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViU3ViS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJy8nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4vLyAvIGVuZHJlZ2lvblxuY29uc3QgcmVzb2x2ZWRDb25maWd1cmF0aW9uOlJlc29sdmVkQ29uZmlndXJhdGlvbiA9IFRvb2xzLnVud3JhcFByb3h5KFxuICAgIFRvb2xzLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24sIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXJcbiAgICApLCBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyLCB0cnVlKSlcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGNvbnNvbGlkYXRlIGZpbGUgc3BlY2lmaWMgYnVpbGQgY29uZmlndXJhdGlvblxuLy8gQXBwbHkgZGVmYXVsdCBmaWxlIGxldmVsIGJ1aWxkIGNvbmZpZ3VyYXRpb25zIHRvIGFsbCBmaWxlIHR5cGUgc3BlY2lmaWNcbi8vIG9uZXMuXG5jb25zdCBkZWZhdWx0Q29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9XG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmRlZmF1bHRcbmRlbGV0ZSByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMuZGVmYXVsdFxuZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMpXG4gICAgaWYgKHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSlcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW3R5cGVdID0gVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtcbiAgICAgICAgfSwgZGVmYXVsdENvbmZpZ3VyYXRpb24sIFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgIHRydWUsIHtleHRlbnNpb246IHR5cGV9LCByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNbdHlwZV0sXG4gICAgICAgICAgICB7dHlwZX0pXG4gICAgICAgIClcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHJlc29sdmUgbW9kdWxlIGxvY2F0aW9uIGFuZCB3aGljaCBhc3NldCB0eXBlcyBhcmUgbmVlZGVkXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UpXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uID0gSGVscGVyLnJlc29sdmVJbmplY3Rpb24oXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbiwgSGVscGVyLnJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC50eXBlcyxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgIEhlbHBlci5ub3JtYWxpemVQYXRocyhyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAhcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpXG4gICAgKSwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5hdXRvRXhjbHVkZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUpXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsID0ge1xuICAgIGdpdmVuOiByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLFxuICAgIG5vcm1hbGl6ZWQ6IEhlbHBlci5yZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgIEhlbHBlci5ub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWxcbiAgICAgICAgKSwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucyxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSl9XG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkID0ge2phdmFTY3JpcHQ6IGNvbmZpZ3VyYXRpb24uZGVidWcgJiYgW1xuICAgICdzZXJ2ZScsICd0ZXN0SW5Ccm93c2VyJ1xuXS5pbmNsdWRlcyhyZXNvbHZlZENvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSl9XG5mb3IgKFxuICAgIGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW5cbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRcbilcbiAgICBpZiAocmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICBjaHVua05hbWVcbiAgICApKVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQsIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMpXG4gICAgICAgICAgICBsZXQgdHlwZTo/c3RyaW5nXG4gICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgdHlwZSA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEdpdmVuIHJlcXVlc3QgXCIke21vZHVsZUlEfVwiIGNvdWxkbid0IGJlIHJlc29sdmVkLmApXG4gICAgICAgICAgICBpZiAodHlwZSlcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkW3R5cGVdID0gdHJ1ZVxuICAgICAgICB9XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhZGRpbmcgc3BlY2lhbCBhbGlhc2VzXG4vLyBOT1RFOiBUaGlzIGFsaWFzIGNvdWxkbid0IGJlIHNldCBpbiB0aGUgXCJwYWNrYWdlLmpzb25cIiBmaWxlIHNpbmNlIHRoaXMgd291bGRcbi8vIHJlc3VsdCBpbiBhbiBlbmRsZXNzIGxvb3AuXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciA9XG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLnN1YnN0cmluZyhcbiAgICAgICAgMCwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmxhc3RJbmRleE9mKCchJykpXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZVBhdGgkID1cbiAgICBIZWxwZXIuc3RyaXBMb2FkZXIocmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gYXBwbHkgd2VicGFjayBodG1sIHBsdWdpbiB3b3JrYXJvdW5kXG4vKlxuICAgIE5PVEU6IFByb3ZpZGVzIGEgd29ya2Fyb3VuZCB0byBoYW5kbGUgYSBidWcgd2l0aCBjaGFpbmVkIGxvYWRlclxuICAgIGNvbmZpZ3VyYXRpb25zLlxuKi9cbmZvciAoXG4gICAgbGV0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5odG1sXG4pIHtcbiAgICBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgIHRydWUsIGh0bWxDb25maWd1cmF0aW9uLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwpXG4gICAgaWYgKFxuICAgICAgICB0eXBlb2YgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUgPT09ICdzdHJpbmcnICYmXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmluY2x1ZGVzKCchJykgJiZcbiAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUgIT09XG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGVcbiAgICApIHtcbiAgICAgICAgY29uc3QgbmV3VGVtcGxhdGVTdHJpbmc6T2JqZWN0ID0gbmV3IFN0cmluZyhodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZSlcbiAgICAgICAgbmV3VGVtcGxhdGVTdHJpbmcucmVwbGFjZSA9ICgoc3RyaW5nOnN0cmluZyk6RnVuY3Rpb24gPT4gKFxuICAgICAgICAgICAgX3NlYXJjaDpSZWdFeHB8c3RyaW5nLCBfcmVwbGFjZW1lbnQ6c3RyaW5nfChcbiAgICAgICAgICAgICAgICAuLi5tYXRjaGVzOkFycmF5PHN0cmluZz5cbiAgICAgICAgICAgICkgPT4gc3RyaW5nXG4gICAgICAgICk6c3RyaW5nID0+IHN0cmluZykoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUpXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlID0gbmV3VGVtcGxhdGVTdHJpbmdcbiAgICB9XG59XG4vLyBlbmRyZWdpb25cbmV4cG9ydCBkZWZhdWx0IHJlc29sdmVkQ29uZmlndXJhdGlvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=