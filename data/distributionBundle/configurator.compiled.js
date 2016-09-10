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
if (debug) configuration = _clientnode2.default.extendObject(true, metaConfiguration.default, metaConfiguration.debug);else configuration = metaConfiguration.default;
configuration.debug = debug;
if (_typeof(configuration.library) === 'object') _clientnode2.default.extendObject(true, libraryConfiguration, configuration.library);
if ('library' in specificConfiguration &&
// IgnoreTypeCheck
specificConfiguration.library === true || ('library' in specificConfiguration && specificConfiguration.library === undefined || !('library' in specificConfiguration)) && configuration.library) configuration = _clientnode2.default.extendObject(true, configuration, libraryConfiguration);
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
    if (runtimeInformation.givenCommandLineArguments[2] === 'document') _clientnode2.default.extendObject(true, configuration, configuration.document);
    // endregion
    // region apply test configuration
    else if (runtimeInformation.givenCommandLineArguments[2] === 'testInBrowser') _clientnode2.default.extendObject(true, configuration, configuration.testInBrowser);else if (runtimeInformation.givenCommandLineArguments[2] === 'test') _clientnode2.default.extendObject(true, configuration, configuration.test);
// endregion
// / endregion
_clientnode2.default.extendObject(true, configuration, specificConfiguration, runtimeInformation);
var result = null;
if (runtimeInformation.givenCommandLineArguments.length > 3) result = _helper2.default.parseEncodedObject(runtimeInformation.givenCommandLineArguments[runtimeInformation.givenCommandLineArguments.length - 1], configuration, 'configuration');
if (_clientnode2.default.isPlainObject(result)) _clientnode2.default.extendObject(true, configuration, result);
// / region determine existing pre compiled dll manifests file paths
configuration.dllManifestFilePaths = [];
var targetDirectory = null;
try {
    targetDirectory = fileSystem.statSync(configuration.path.target.base);
} catch (error) {}
if (targetDirectory && targetDirectory.isDirectory()) fileSystem.readdirSync(configuration.path.target.base).forEach(function (fileName) {
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
var defaultConfiguration = resolvedConfiguration.build.default;
delete resolvedConfiguration.build.default;
for (var type in resolvedConfiguration.build) {
    if (resolvedConfiguration.build.hasOwnProperty(type)) resolvedConfiguration.build[type] = _clientnode2.default.extendObject(true, {}, defaultConfiguration, _clientnode2.default.extendObject(true, { extension: type }, resolvedConfiguration.build[type], { type: type }));
} // endregion
// region resolve module location and which asset types are needed
resolvedConfiguration.module.locations = _helper2.default.determineModuleLocations(resolvedConfiguration.injection.internal, resolvedConfiguration.module.aliases, resolvedConfiguration.knownExtensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base);
resolvedConfiguration.injection = _helper2.default.resolveInjection(resolvedConfiguration.injection, _helper2.default.resolveBuildConfigurationFilePaths(resolvedConfiguration.build, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directories, resolvedConfiguration.loader.directories).map(function (filePath) {
    return _path2.default.resolve(resolvedConfiguration.path.context, filePath);
}).filter(function (filePath) {
    return !resolvedConfiguration.path.context.startsWith(filePath);
})), resolvedConfiguration.injection.autoExclude, resolvedConfiguration.module.aliases, resolvedConfiguration.knownExtensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore);
resolvedConfiguration.injection.internal = {
    given: resolvedConfiguration.injection.internal,
    // IgnoreTypeCheck
    normalized: _helper2.default.normalizeInternalInjection(resolvedConfiguration.injection.internal) };
resolvedConfiguration.needed = { javaScript: configuration.debug && ['serve', 'testInBrowser'].includes(resolvedConfiguration.givenCommandLineArguments[2]) };
for (var chunkName in resolvedConfiguration.injection.internal.normalized) {
    if (resolvedConfiguration.injection.internal.normalized.hasOwnProperty(chunkName)) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = resolvedConfiguration.injection.internal.normalized[chunkName][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _moduleID = _step.value;

                var _filePath = _helper2.default.determineModuleFilePath(_moduleID, resolvedConfiguration.module.aliases, resolvedConfiguration.knownExtensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore);
                var _type = void 0;
                if (_filePath) _type = _helper2.default.determineAssetType(_filePath, resolvedConfiguration.build, resolvedConfiguration.path);else throw Error('Given request "' + _moduleID + '" couldn\'t be resolved.');
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

//# sourceMappingURL=data:application/json;base64,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QixXQUE1QixDQUF3QyxRQUEzRCxDQURKO0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7QUFJQSwwQkFDK0Msc0JBQXNCLEtBQXRCLENBQTRCLElBRDNFLG1JQUVFO0FBQUEsWUFETSxpQkFDTjs7QUFDRSw2QkFBTSxZQUFOLENBQ0ksSUFESixFQUNVLGlCQURWLEVBQzZCLHNCQUFzQixLQUF0QixDQUE0QixXQUR6RDtBQUVBLFlBQ0ksT0FBTyxrQkFBa0IsUUFBekIsS0FBc0MsUUFBdEMsSUFDQSxrQkFBa0IsUUFBbEIsQ0FBMkIsUUFBM0IsQ0FBb0MsR0FBcEMsQ0FEQSxJQUVBLGtCQUFrQixRQUFsQixLQUNJLHNCQUFzQixLQUF0QixDQUE0QixXQUE1QixDQUF3QyxRQUpoRCxFQUtFO0FBQ0UsZ0JBQU0sb0JBQTJCLElBQUksTUFBSixDQUFXLGtCQUFrQixRQUE3QixDQUFqQztBQUNBLDhCQUFrQixPQUFsQixHQUE2QixVQUFDLE1BQUQ7QUFBQSx1QkFBNEIsVUFDckQsT0FEcUQsRUFDOUIsWUFEOEI7QUFBQSwyQkFJN0MsTUFKNkM7QUFBQSxpQkFBNUI7QUFBQSxhQUFELENBSVIsa0JBQWtCLFFBSlYsQ0FBNUI7QUFLQSw4QkFBa0IsUUFBbEIsR0FBNkIsaUJBQTdCO0FBQ0g7QUFDSjtBQUNEOzs7Ozs7Ozs7Ozs7Ozs7O2tCQUNlLHFCO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29uZmlndXJhdG9yLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuLy8gTk9URTogXCJ7Y29uZmlndXJhdGlvbiBhcyBtZXRhQ29uZmlndXJhdGlvbn1cIiB3b3VsZCByZXN1bHQgaW4gYSByZWFkIG9ubHlcbi8vIHZhcmlhYmxlIG5hbWVkIFwibWV0YUNvbmZpZ3VyYXRpb25cIi5cbmltcG9ydCB7Y29uZmlndXJhdGlvbiBhcyBnaXZlbk1ldGFDb25maWd1cmF0aW9ufSBmcm9tICcuL3BhY2thZ2UnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IHR5cGUge1xuICAgIERlZmF1bHRDb25maWd1cmF0aW9uLCBIVE1MQ29uZmlndXJhdGlvbiwgTWV0YUNvbmZpZ3VyYXRpb24sIFBsYWluT2JqZWN0LFxuICAgIFJlc29sdmVkQ29uZmlndXJhdGlvblxufSBmcm9tICcuL3R5cGUnXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5sZXQgbWV0YUNvbmZpZ3VyYXRpb246TWV0YUNvbmZpZ3VyYXRpb24gPSBnaXZlbk1ldGFDb25maWd1cmF0aW9uXG4vKlxuICAgIFRvIGFzc3VtZSB0byBnbyB0d28gZm9sZGVyIHVwIGZyb20gdGhpcyBmaWxlIHVudGlsIHRoZXJlIGlzIG5vXG4gICAgXCJub2RlX21vZHVsZXNcIiBwYXJlbnQgZm9sZGVyICBpcyB1c3VhbGx5IHJlc2lsaWVudCBhZ2FpbiBkZWFsaW5nIHdpdGhcbiAgICBwcm9qZWN0cyB3aGVyZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGlzbid0IHRoZSBwcm9qZWN0cyBkaXJlY3RvcnkgYW5kXG4gICAgdGhpcyBsaWJyYXJ5IGlzIGxvY2F0ZWQgYXMgYSBuZXN0ZWQgZGVwZW5kZW5jeS5cbiovXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IF9fZGlybmFtZVxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdtYWluJ1xud2hpbGUgKHRydWUpIHtcbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICcuLi8uLi8nKVxuICAgIGlmIChwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHRcbiAgICApKSAhPT0gJ25vZGVfbW9kdWxlcycpXG4gICAgICAgIGJyZWFrXG59XG5pZiAoXG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpID09PSAnbm9kZV9tb2R1bGVzJyB8fFxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSA9PT0gJy5zdGFnaW5nJyAmJlxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkpID09PSAnbm9kZV9tb2R1bGVzJ1xuKSB7XG4gICAgLypcbiAgICAgICAgTk9URTogSWYgd2UgYXJlIGRlYWxpbmcgd2FzIGEgZGVwZW5kZW5jeSBwcm9qZWN0IHVzZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgICAgICBhcyBjb250ZXh0LlxuICAgICovXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdkZXBlbmRlbmN5J1xufSBlbHNlXG4gICAgLypcbiAgICAgICAgTk9URTogSWYgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgcmVmZXJlbmNlcyB0aGlzIGZpbGUgdmlhIGFcbiAgICAgICAgbGlua2VkIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyIHVzaW5nIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgYXMgY29udGV4dFxuICAgICAgICBpcyBhIGJldHRlciBhc3N1bXB0aW9uIHRoYW4gdHdvIGZvbGRlcnMgdXAgdGhlIGhpZXJhcmNoeS5cbiAgICAqL1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChmaWxlU3lzdGVtLmxzdGF0U3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoXG4gICAgICAgICksICdub2RlX21vZHVsZXMnKSkuaXNTeW1ib2xpY0xpbmsoKSlcbiAgICAgICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxubGV0IHNwZWNpZmljQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdFxudHJ5IHtcbiAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSByZXF1aXJlKHBhdGguam9pbihcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICdwYWNrYWdlJykpXG59IGNhdGNoIChlcnJvcikge1xuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHtuYW1lOiAnbW9ja3VwJ31cbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbn1cbmNvbnN0IG5hbWU6c3RyaW5nID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLm5hbWVcbnNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi53ZWJPcHRpbWl6ZXIgfHwge31cbnNwZWNpZmljQ29uZmlndXJhdGlvbi5uYW1lID0gbmFtZVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbG9hZGluZyBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cbi8vIE5PVEU6IEdpdmVuIG5vZGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50cyByZXN1bHRzIGluIFwibnBtX2NvbmZpZ18qXCJcbi8vIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmxldCBkZWJ1Zzpib29sZWFuID0gbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5kZWJ1Z1xuaWYgKHNwZWNpZmljQ29uZmlndXJhdGlvbi5kZWJ1ZyAhPT0gdW5kZWZpbmVkKVxuICAgIGRlYnVnID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLmRlYnVnXG5pZiAocHJvY2Vzcy5lbnYubnBtX2NvbmZpZ19wcm9kdWN0aW9uKVxuICAgIGRlYnVnID0gZmFsc2VcbmVsc2UgaWYgKHByb2Nlc3MuZW52Lm5wbV9jb25maWdfZGVidWcpXG4gICAgZGVidWcgPSB0cnVlXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCArPSAnLydcbi8vIE1lcmdlcyBmaW5hbCBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gb2JqZWN0IGRlcGVuZGluZyBvbiBnaXZlbiB0YXJnZXRcbi8vIGVudmlyb25tZW50LlxuY29uc3QgbGlicmFyeUNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSBtZXRhQ29uZmlndXJhdGlvbi5saWJyYXJ5XG5sZXQgY29uZmlndXJhdGlvbjpEZWZhdWx0Q29uZmlndXJhdGlvblxuaWYgKGRlYnVnKVxuICAgIGNvbmZpZ3VyYXRpb24gPSBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgIHRydWUsIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQsIG1ldGFDb25maWd1cmF0aW9uLmRlYnVnKVxuZWxzZVxuICAgIGNvbmZpZ3VyYXRpb24gPSBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0XG5jb25maWd1cmF0aW9uLmRlYnVnID0gZGVidWdcbmlmICh0eXBlb2YgY29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSAnb2JqZWN0JylcbiAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgbGlicmFyeUNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb24ubGlicmFyeSlcbmlmIChcbiAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLmxpYnJhcnkgPT09IHRydWUgfHwgKFxuICAgICAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgISgnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uKVxuICAgICkgJiYgY29uZmlndXJhdGlvbi5saWJyYXJ5XG4pXG4gICAgY29uZmlndXJhdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgdHJ1ZSwgY29uZmlndXJhdGlvbiwgbGlicmFyeUNvbmZpZ3VyYXRpb24pXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBtZXJnaW5nIGFuZCBldmFsdWF0aW5nIGRlZmF1bHQsIHRlc3QsIHNwZWNpZmljIGFuZCBkeW5hbWljIHNldHRpbmdzXG4vLyAvIHJlZ2lvbiBsb2FkIGFkZGl0aW9uYWwgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvblxubGV0IGNvdW50Om51bWJlciA9IDBcbmxldCBmaWxlUGF0aDo/c3RyaW5nID0gbnVsbFxud2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCBuZXdGaWxlUGF0aDpzdHJpbmcgPSBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCArXG4gICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmBcbiAgICBpZiAoIUhlbHBlci5pc0ZpbGVTeW5jKG5ld0ZpbGVQYXRoKSlcbiAgICAgICAgYnJlYWtcbiAgICBmaWxlUGF0aCA9IG5ld0ZpbGVQYXRoXG4gICAgY291bnQgKz0gMVxufVxubGV0IHJ1bnRpbWVJbmZvcm1hdGlvbjpQbGFpbk9iamVjdCA9IHtcbiAgICBnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOiBwcm9jZXNzLmFyZ3Zcbn1cbmlmIChmaWxlUGF0aCkge1xuICAgIHJ1bnRpbWVJbmZvcm1hdGlvbiA9IEpTT04ucGFyc2UoZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIHtcbiAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCd9KSlcbiAgICBmaWxlU3lzdGVtLnVubGluayhmaWxlUGF0aCwgKGVycm9yOj9FcnJvcik6dm9pZCA9PiB7XG4gICAgICAgIGlmIChlcnJvcilcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbn1cbmlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKVxuICAgIC8vIHJlZ2lvbiBhcHBseSBkb2N1bWVudGF0aW9uIGNvbmZpZ3VyYXRpb25cbiAgICBpZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdkb2N1bWVudCcpXG4gICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBjb25maWd1cmF0aW9uLCBjb25maWd1cmF0aW9uLmRvY3VtZW50KVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBhcHBseSB0ZXN0IGNvbmZpZ3VyYXRpb25cbiAgICBlbHNlIGlmIChcbiAgICAgICAgcnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICd0ZXN0SW5Ccm93c2VyJ1xuICAgIClcbiAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIGNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb24udGVzdEluQnJvd3NlcilcbiAgICBlbHNlIGlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ3Rlc3QnKVxuICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgY29uZmlndXJhdGlvbiwgY29uZmlndXJhdGlvbi50ZXN0KVxuICAgIC8vIGVuZHJlZ2lvblxuLy8gLyBlbmRyZWdpb25cblRvb2xzLmV4dGVuZE9iamVjdChcbiAgICB0cnVlLCBjb25maWd1cmF0aW9uLCBzcGVjaWZpY0NvbmZpZ3VyYXRpb24sIHJ1bnRpbWVJbmZvcm1hdGlvbilcbmxldCByZXN1bHQ6P1BsYWluT2JqZWN0ID0gbnVsbFxuaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDMpXG4gICAgcmVzdWx0ID0gSGVscGVyLnBhcnNlRW5jb2RlZE9iamVjdChcbiAgICAgICAgcnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbcnVudGltZUluZm9ybWF0aW9uXG4gICAgICAgICAgICAuZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggLSAxXSxcbiAgICAgICAgY29uZmlndXJhdGlvbiwgJ2NvbmZpZ3VyYXRpb24nKVxuaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QocmVzdWx0KSlcbiAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgY29uZmlndXJhdGlvbiwgcmVzdWx0KVxuLy8gLyByZWdpb24gZGV0ZXJtaW5lIGV4aXN0aW5nIHByZSBjb21waWxlZCBkbGwgbWFuaWZlc3RzIGZpbGUgcGF0aHNcbmNvbmZpZ3VyYXRpb24uZGxsTWFuaWZlc3RGaWxlUGF0aHMgPSBbXVxubGV0IHRhcmdldERpcmVjdG9yeTo/T2JqZWN0ID0gbnVsbFxudHJ5IHtcbiAgICB0YXJnZXREaXJlY3RvcnkgPSBmaWxlU3lzdGVtLnN0YXRTeW5jKGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSlcbn0gY2F0Y2ggKGVycm9yKSB7fVxuaWYgKHRhcmdldERpcmVjdG9yeSAmJiB0YXJnZXREaXJlY3RvcnkuaXNEaXJlY3RvcnkoKSlcbiAgICBmaWxlU3lzdGVtLnJlYWRkaXJTeW5jKGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSkuZm9yRWFjaCgoXG4gICAgICAgIGZpbGVOYW1lOnN0cmluZ1xuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGlmIChmaWxlTmFtZS5tYXRjaCgvXi4qXFwuZGxsLW1hbmlmZXN0XFwuanNvbiQvKSlcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZGxsTWFuaWZlc3RGaWxlUGF0aHMucHVzaChwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCBmaWxlTmFtZSkpXG4gICAgfSlcbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBkZWZpbmUgZHluYW1pYyByZXNvbHZlIHBhcmFtZXRlclxuY29uc3QgcGFyYW1ldGVyRGVzY3JpcHRpb246QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAnc2VsZicsICd3ZWJPcHRpbWl6ZXJQYXRoJywgJ2N1cnJlbnRQYXRoJywgJ3BhdGgnLCAnaGVscGVyJywgJ3Rvb2xzJ11cbmNvbnN0IHBhcmFtZXRlcjpBcnJheTxhbnk+ID0gW1xuICAgIGNvbmZpZ3VyYXRpb24sIF9fZGlybmFtZSwgcHJvY2Vzcy5jd2QoKSwgcGF0aCwgSGVscGVyLCBUb29sc11cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBidWlsZCBhYnNvbHV0ZSBwYXRoc1xuY29uZmlndXJhdGlvbi5wYXRoLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIFRvb2xzLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsIGZhbHNlKSlcbmZvciAoY29uc3Qga2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGgpXG4gICAgaWYgKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09ICdiYXNlJyAmJlxuICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPT09ICdzdHJpbmcnXG4gICAgKVxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlLCBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0sIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAgICAgZmFsc2UpXG4gICAgICAgICkgKyAnLydcbiAgICBlbHNlIHtcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPSBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XSwgcGFyYW1ldGVyRGVzY3JpcHRpb24sIHBhcmFtZXRlciwgZmFsc2UpXG4gICAgICAgIGlmIChUb29scy5pc1BsYWluT2JqZWN0KGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldKSkge1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSlcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XSlcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmhhc093blByb3BlcnR5KHN1YktleSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIVsnYmFzZScsICdwdWJsaWMnXS5pbmNsdWRlcyhzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNQbGFpbk9iamVjdChjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5iYXNlID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5iYXNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJTdWJLZXk6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJLZXldXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiYgc3ViU3ViS2V5ICE9PSAnYmFzZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViU3ViS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJy8nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4vLyAvIGVuZHJlZ2lvblxuY29uc3QgcmVzb2x2ZWRDb25maWd1cmF0aW9uOlJlc29sdmVkQ29uZmlndXJhdGlvbiA9IFRvb2xzLnVud3JhcFByb3h5KFxuICAgIFRvb2xzLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24sIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXJcbiAgICApLCBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyLCB0cnVlKSlcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGNvbnNvbGlkYXRlIGZpbGUgc3BlY2lmaWMgYnVpbGQgY29uZmlndXJhdGlvblxuLy8gQXBwbHkgZGVmYXVsdCBmaWxlIGxldmVsIGJ1aWxkIGNvbmZpZ3VyYXRpb25zIHRvIGFsbCBmaWxlIHR5cGUgc3BlY2lmaWNcbi8vIG9uZXMuXG5jb25zdCBkZWZhdWx0Q29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC5kZWZhdWx0XG5kZWxldGUgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLmRlZmF1bHRcbmZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkKVxuICAgIGlmIChyZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQuaGFzT3duUHJvcGVydHkodHlwZSkpXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZFt0eXBlXSA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgIH0sIGRlZmF1bHRDb25maWd1cmF0aW9uLCBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICB0cnVlLCB7ZXh0ZW5zaW9uOiB0eXBlfSwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkW3R5cGVdLCB7dHlwZX0pXG4gICAgICAgIClcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHJlc29sdmUgbW9kdWxlIGxvY2F0aW9uIGFuZCB3aGljaCBhc3NldCB0eXBlcyBhcmUgbmVlZGVkXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmtub3duRXh0ZW5zaW9ucywgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSlcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24gPSBIZWxwZXIucmVzb2x2ZUluamVjdGlvbihcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLCBIZWxwZXIucmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3JpZXMsXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yaWVzXG4gICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgIXJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpXG4gICAgKSwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5hdXRvRXhjbHVkZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmtub3duRXh0ZW5zaW9ucyxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSlcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwgPSB7XG4gICAgZ2l2ZW46IHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwsXG4gICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgbm9ybWFsaXplZDogSGVscGVyLm5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsKX1cbnJlc29sdmVkQ29uZmlndXJhdGlvbi5uZWVkZWQgPSB7amF2YVNjcmlwdDogY29uZmlndXJhdGlvbi5kZWJ1ZyAmJiBbXG4gICAgJ3NlcnZlJywgJ3Rlc3RJbkJyb3dzZXInXG5dLmluY2x1ZGVzKHJlc29sdmVkQ29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKX1cbmZvciAoXG4gICAgY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpblxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFxuKVxuICAgIGlmIChyZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgIGNodW5rTmFtZVxuICAgICkpXG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2ZcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5rbm93bkV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUpXG4gICAgICAgICAgICBsZXQgdHlwZTo/c3RyaW5nXG4gICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgdHlwZSA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgR2l2ZW4gcmVxdWVzdCBcIiR7bW9kdWxlSUR9XCIgY291bGRuJ3QgYmUgcmVzb2x2ZWQuYClcbiAgICAgICAgICAgIGlmICh0eXBlKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5uZWVkZWRbdHlwZV0gPSB0cnVlXG4gICAgICAgIH1cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGFkZGluZyBzcGVjaWFsIGFsaWFzZXNcbi8vIE5PVEU6IFRoaXMgYWxpYXMgY291bGRuJ3QgYmUgc2V0IGluIHRoZSBcInBhY2thZ2UuanNvblwiIGZpbGUgc2luY2UgdGhpcyB3b3VsZFxuLy8gcmVzdWx0IGluIGFuIGVuZGxlc3MgbG9vcC5cbnJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlcy53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyID1cbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUuc3Vic3RyaW5nKFxuICAgICAgICAwLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUubGFzdEluZGV4T2YoJyEnKSlcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcy53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlUGF0aCQgPVxuICAgIEhlbHBlci5zdHJpcExvYWRlcihyZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUpXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhcHBseSB3ZWJwYWNrIGh0bWwgcGx1Z2luIHdvcmthcm91bmRcbi8qXG4gICAgTk9URTogUHJvdmlkZXMgYSB3b3JrYXJvdW5kIHRvIGhhbmRsZSBhIGJ1ZyB3aXRoIGNoYWluZWQgbG9hZGVyXG4gICAgY29uZmlndXJhdGlvbnMuXG4qL1xuZm9yIChcbiAgICBsZXQgaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24gb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmh0bWxcbikge1xuICAgIFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgdHJ1ZSwgaHRtbENvbmZpZ3VyYXRpb24sIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTClcbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuaW5jbHVkZXMoJyEnKSAmJlxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZSAhPT1cbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZVxuICAgICkge1xuICAgICAgICBjb25zdCBuZXdUZW1wbGF0ZVN0cmluZzpPYmplY3QgPSBuZXcgU3RyaW5nKGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlKVxuICAgICAgICBuZXdUZW1wbGF0ZVN0cmluZy5yZXBsYWNlID0gKChzdHJpbmc6c3RyaW5nKTpGdW5jdGlvbiA9PiAoXG4gICAgICAgICAgICBfc2VhcmNoOlJlZ0V4cHxzdHJpbmcsIF9yZXBsYWNlbWVudDpzdHJpbmd8KFxuICAgICAgICAgICAgICAgIC4uLm1hdGNoZXM6QXJyYXk8c3RyaW5nPlxuICAgICAgICAgICAgKSA9PiBzdHJpbmdcbiAgICAgICAgKTpzdHJpbmcgPT4gc3RyaW5nKShodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZSlcbiAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUgPSBuZXdUZW1wbGF0ZVN0cmluZ1xuICAgIH1cbn1cbi8vIGVuZHJlZ2lvblxuZXhwb3J0IGRlZmF1bHQgcmVzb2x2ZWRDb25maWd1cmF0aW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==