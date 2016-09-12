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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZ3VyYXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUFXQTs7Ozs7Ozs7QUFDQTs7OztBQUNBOztJQUFZLFU7O0FBQ1o7Ozs7QUFNQTs7OztBQUdBOzs7Ozs7QUFSQTtBQUNBLElBQUk7QUFDQSxZQUFRLDZCQUFSO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7QUFHbEI7QUFDQTs7QUFPQTs7QUFMQTtBQU1BLElBQUksMENBQUo7QUFDQTs7Ozs7O0FBTUEsa0JBQWtCLE9BQWxCLENBQTBCLElBQTFCLENBQStCLE9BQS9CLEdBQXlDLFNBQXpDO0FBQ0Esa0JBQWtCLE9BQWxCLENBQTBCLFdBQTFCLEdBQXdDLE1BQXhDO0FBQ0EsT0FBTyxJQUFQLEVBQWE7QUFDVCxzQkFBa0IsT0FBbEIsQ0FBMEIsSUFBMUIsQ0FBK0IsT0FBL0IsR0FBeUMsZUFBSyxPQUFMLENBQ3JDLGtCQUFrQixPQUFsQixDQUEwQixJQUExQixDQUErQixPQURNLEVBQ0csUUFESCxDQUF6QztBQUVBLFFBQUksZUFBSyxRQUFMLENBQWMsZUFBSyxPQUFMLENBQ2Qsa0JBQWtCLE9BQWxCLENBQTBCLElBQTFCLENBQStCLE9BRGpCLENBQWQsTUFFRyxjQUZQLEVBR0k7QUFDUDtBQUNELElBQ0ksZUFBSyxRQUFMLENBQWMsZUFBSyxPQUFMLENBQWEsUUFBUSxHQUFSLEVBQWIsQ0FBZCxNQUErQyxjQUEvQyxJQUNBLGVBQUssUUFBTCxDQUFjLGVBQUssT0FBTCxDQUFhLFFBQVEsR0FBUixFQUFiLENBQWQsTUFBK0MsVUFBL0MsSUFDQSxlQUFLLFFBQUwsQ0FBYyxlQUFLLE9BQUwsQ0FBYSxlQUFLLE9BQUwsQ0FBYSxRQUFRLEdBQVIsRUFBYixDQUFiLENBQWQsTUFBNkQsY0FIakUsRUFJRTtBQUNFOzs7O0FBSUEsc0JBQWtCLE9BQWxCLENBQTBCLElBQTFCLENBQStCLE9BQS9CLEdBQXlDLFFBQVEsR0FBUixFQUF6QztBQUNBLHNCQUFrQixPQUFsQixDQUEwQixXQUExQixHQUF3QyxZQUF4QztBQUNILENBWEQ7QUFZSTs7Ozs7QUFLQSxRQUFJO0FBQ0EsWUFBSSxXQUFXLFNBQVgsQ0FBcUIsZUFBSyxJQUFMLENBQVUsUUFBUSxHQUFSLEVBQVYsRUFDdEIsY0FEc0IsQ0FBckIsRUFDZ0IsY0FEaEIsRUFBSixFQUVJLGtCQUFrQixPQUFsQixDQUEwQixJQUExQixDQUErQixPQUEvQixHQUF5QyxRQUFRLEdBQVIsRUFBekM7QUFDUCxLQUpELENBSUUsT0FBTyxLQUFQLEVBQWMsQ0FBRTtBQUN0QixJQUFJLDhCQUFKO0FBQ0EsSUFBSTtBQUNBO0FBQ0EsNEJBQXdCLFFBQVEsZUFBSyxJQUFMLENBQzVCLGtCQUFrQixPQUFsQixDQUEwQixJQUExQixDQUErQixPQURILEVBQ1ksU0FEWixDQUFSLENBQXhCO0FBRUgsQ0FKRCxDQUlFLE9BQU8sS0FBUCxFQUFjO0FBQ1osNEJBQXdCLEVBQUMsTUFBTSxRQUFQLEVBQXhCO0FBQ0Esc0JBQWtCLE9BQWxCLENBQTBCLElBQTFCLENBQStCLE9BQS9CLEdBQXlDLFFBQVEsR0FBUixFQUF6QztBQUNIO0FBQ0QsSUFBTSxPQUFjLHNCQUFzQixJQUExQztBQUNBLHdCQUF3QixzQkFBc0IsWUFBdEIsSUFBc0MsRUFBOUQ7QUFDQSxzQkFBc0IsSUFBdEIsR0FBNkIsSUFBN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksUUFBZ0Isa0JBQWtCLE9BQWxCLENBQTBCLEtBQTlDO0FBQ0EsSUFBSSxzQkFBc0IsS0FBdEIsS0FBZ0MsU0FBcEMsRUFDSSxRQUFRLHNCQUFzQixLQUE5QjtBQUNKLElBQUksUUFBUSxHQUFSLENBQVkscUJBQWhCLEVBQ0ksUUFBUSxLQUFSLENBREosS0FFSyxJQUFJLFFBQVEsR0FBUixDQUFZLGdCQUFoQixFQUNELFFBQVEsSUFBUjtBQUNKLGtCQUFrQixPQUFsQixDQUEwQixJQUExQixDQUErQixPQUEvQixJQUEwQyxHQUExQztBQUNBO0FBQ0E7QUFDQSxJQUFNLHVCQUFtQyxrQkFBa0IsT0FBM0Q7QUFDQSxJQUFJLHNCQUFKO0FBQ0EsSUFBSSxLQUFKLEVBQ0ksZ0JBQWdCLHFCQUFNLFlBQU4sQ0FBbUIsSUFBbkIsRUFBeUIscUJBQU0sWUFBTixDQUNyQyxrQkFBa0IsT0FEbUIsRUFDVixrQkFBa0IsS0FEUixDQUF6QixFQUViLGtCQUFrQixLQUZMLENBQWhCLENBREosS0FLSSxnQkFBZ0Isa0JBQWtCLE9BQWxDO0FBQ0osY0FBYyxLQUFkLEdBQXNCLEtBQXRCO0FBQ0EsSUFBSSxRQUFPLGNBQWMsT0FBckIsTUFBaUMsUUFBckMsRUFDSSxxQkFBTSxZQUFOLENBQW1CLElBQW5CLEVBQXlCLHFCQUFNLFlBQU4sQ0FDckIsb0JBRHFCLEVBQ0MsY0FBYyxPQURmLENBQXpCLEVBRUcsY0FBYyxPQUZqQjtBQUdKLElBQ0ksYUFBYSxxQkFBYjtBQUNBO0FBQ0Esc0JBQXNCLE9BQXRCLEtBQWtDLElBRmxDLElBRTBDLENBQ3RDLGFBQWEscUJBQWIsSUFDQSxzQkFBc0IsT0FBdEIsS0FBa0MsU0FEbEMsSUFFQSxFQUFFLGFBQWEscUJBQWYsQ0FIc0MsS0FJckMsY0FBYyxPQVB2QixFQVNJLGdCQUFnQixxQkFBTSxZQUFOLENBQW1CLElBQW5CLEVBQXlCLHFCQUFNLFlBQU4sQ0FDckMsYUFEcUMsRUFDdEIsb0JBRHNCLENBQXpCLEVBRWIsb0JBRmEsQ0FBaEI7QUFHSjtBQUNBO0FBQ0E7QUFDQSxJQUFJLFFBQWUsQ0FBbkI7QUFDQSxJQUFJLFdBQW1CLElBQXZCO0FBQ0EsT0FBTyxJQUFQLEVBQWE7QUFDVCxRQUFNLGNBQXFCLGNBQWMsSUFBZCxDQUFtQixPQUFuQiwrQkFDRSxLQURGLFdBQTNCO0FBRUEsUUFBSSxDQUFDLGlCQUFPLFVBQVAsQ0FBa0IsV0FBbEIsQ0FBTCxFQUNJO0FBQ0osZUFBVyxXQUFYO0FBQ0EsYUFBUyxDQUFUO0FBQ0g7QUFDRCxJQUFJLHFCQUFpQztBQUNqQywrQkFBMkIsUUFBUTtBQURGLENBQXJDO0FBR0EsSUFBSSxRQUFKLEVBQWM7QUFDVix5QkFBcUIsS0FBSyxLQUFMLENBQVcsV0FBVyxZQUFYLENBQXdCLFFBQXhCLEVBQWtDO0FBQzlELGtCQUFVLE9BRG9ELEVBQWxDLENBQVgsQ0FBckI7QUFFQSxlQUFXLE1BQVgsQ0FBa0IsUUFBbEIsRUFBNEIsVUFBQyxLQUFELEVBQXVCO0FBQy9DLFlBQUksS0FBSixFQUNJLE1BQU0sS0FBTjtBQUNQLEtBSEQ7QUFJSDtBQUNELElBQUksbUJBQW1CLHlCQUFuQixDQUE2QyxNQUE3QyxHQUFzRCxDQUExRDtBQUNJO0FBQ0EsUUFBSSxtQkFBbUIseUJBQW5CLENBQTZDLENBQTdDLE1BQW9ELFVBQXhELEVBQ0kscUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QixxQkFBTSxZQUFOLENBQ3JCLGFBRHFCLEVBQ04sY0FBYyxRQURSLENBQXpCLEVBRUcsY0FBYyxRQUZqQjtBQUdKO0FBQ0E7QUFMQSxTQU1LLElBQ0QsbUJBQW1CLHlCQUFuQixDQUE2QyxDQUE3QyxNQUFvRCxlQURuRCxFQUdELHFCQUFNLFlBQU4sQ0FBbUIsSUFBbkIsRUFBeUIscUJBQU0sWUFBTixDQUNyQixhQURxQixFQUNOLGNBQWMsYUFEUixDQUF6QixFQUVHLGNBQWMsYUFGakIsRUFIQyxLQU1BLElBQUksbUJBQW1CLHlCQUFuQixDQUE2QyxDQUE3QyxNQUFvRCxNQUF4RCxFQUNELHFCQUFNLFlBQU4sQ0FBbUIsSUFBbkIsRUFBeUIscUJBQU0sWUFBTixDQUNyQixhQURxQixFQUNOLGNBQWMsSUFEUixDQUF6QixFQUVHLGNBQWMsSUFGakI7QUFHSjtBQUNKO0FBQ0EscUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QixxQkFBTSxZQUFOLENBQW1CLHFCQUFNLFlBQU4sQ0FDeEMsYUFEd0MsRUFDekIscUJBRHlCLENBQW5CLEVBRXRCLGtCQUZzQixDQUF6QixFQUV3QixxQkFGeEIsRUFFK0Msa0JBRi9DO0FBR0EsSUFBSSxTQUFzQixJQUExQjtBQUNBLElBQUksbUJBQW1CLHlCQUFuQixDQUE2QyxNQUE3QyxHQUFzRCxDQUExRCxFQUNJLFNBQVMsaUJBQU8sa0JBQVAsQ0FDTCxtQkFBbUIseUJBQW5CLENBQTZDLG1CQUN4Qyx5QkFEd0MsQ0FDZCxNQURjLEdBQ0wsQ0FEeEMsQ0FESyxFQUdMLGFBSEssRUFHVSxlQUhWLENBQVQ7QUFJSixJQUFJLHFCQUFNLGFBQU4sQ0FBb0IsTUFBcEIsQ0FBSixFQUNJLHFCQUFNLFlBQU4sQ0FBbUIsSUFBbkIsRUFBeUIscUJBQU0sWUFBTixDQUFtQixhQUFuQixFQUFrQyxNQUFsQyxDQUF6QixFQUFvRSxNQUFwRTtBQUNKO0FBQ0EsY0FBYyxvQkFBZCxHQUFxQyxFQUFyQztBQUNBLElBQUksa0JBQTBCLElBQTlCO0FBQ0EsSUFBSTtBQUNBLHNCQUFrQixXQUFXLFFBQVgsQ0FBb0IsY0FBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBQTlDLENBQWxCO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7QUFDbEIsSUFBSSxtQkFBbUIsZ0JBQWdCLFdBQWhCLEVBQXZCLEVBQ0ksV0FBVyxXQUFYLENBQXVCLGNBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQUFqRCxFQUF1RCxPQUF2RCxDQUErRCxVQUMzRCxRQUQyRCxFQUVyRDtBQUNOLFFBQUksU0FBUyxLQUFULENBQWUsMEJBQWYsQ0FBSixFQUNJLGNBQWMsb0JBQWQsQ0FBbUMsSUFBbkMsQ0FBd0MsZUFBSyxPQUFMLENBQ3BDLGNBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQURVLEVBQ0osUUFESSxDQUF4QztBQUVQLENBTkQ7QUFPSjtBQUNBO0FBQ0EsSUFBTSx1QkFBcUMsQ0FDdkMsTUFEdUMsRUFDL0Isa0JBRCtCLEVBQ1gsYUFEVyxFQUNJLE1BREosRUFDWSxRQURaLEVBQ3NCLE9BRHRCLENBQTNDO0FBRUEsSUFBTSxZQUF1QixDQUN6QixhQUR5QixFQUNWLFNBRFUsRUFDQyxRQUFRLEdBQVIsRUFERCx5REFBN0I7QUFFQTtBQUNBO0FBQ0EsY0FBYyxJQUFkLENBQW1CLElBQW5CLEdBQTBCLGVBQUssT0FBTCxDQUN0QixjQUFjLElBQWQsQ0FBbUIsT0FERyxFQUNNLHFCQUFNLDJCQUFOLENBQ3hCLGNBQWMsSUFBZCxDQUFtQixJQURLLEVBQ0Msb0JBREQsRUFDdUIsU0FEdkIsRUFDa0MsS0FEbEMsQ0FETixDQUExQjtBQUdBLEtBQUssSUFBTSxHQUFYLElBQXlCLGNBQWMsSUFBdkM7QUFDSSxRQUNJLGNBQWMsSUFBZCxDQUFtQixjQUFuQixDQUFrQyxHQUFsQyxLQUEwQyxRQUFRLE1BQWxELElBQ0EsT0FBTyxjQUFjLElBQWQsQ0FBbUIsR0FBbkIsQ0FBUCxLQUFtQyxRQUZ2QyxFQUlJLGNBQWMsSUFBZCxDQUFtQixHQUFuQixJQUEwQixlQUFLLE9BQUwsQ0FDdEIsY0FBYyxJQUFkLENBQW1CLElBREcsRUFDRyxxQkFBTSwyQkFBTixDQUNyQixjQUFjLElBQWQsQ0FBbUIsR0FBbkIsQ0FEcUIsRUFDSSxvQkFESixFQUMwQixTQUQxQixFQUVyQixLQUZxQixDQURILElBSXRCLEdBSkosQ0FKSixLQVNLO0FBQ0Qsc0JBQWMsSUFBZCxDQUFtQixHQUFuQixJQUEwQixxQkFBTSwyQkFBTixDQUN0QixjQUFjLElBQWQsQ0FBbUIsR0FBbkIsQ0FEc0IsRUFDRyxvQkFESCxFQUN5QixTQUR6QixFQUNvQyxLQURwQyxDQUExQjtBQUVBLFlBQUkscUJBQU0sYUFBTixDQUFvQixjQUFjLElBQWQsQ0FBbUIsR0FBbkIsQ0FBcEIsQ0FBSixFQUFrRDtBQUM5QywwQkFBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLElBQXhCLEdBQStCLGVBQUssT0FBTCxDQUMzQixjQUFjLElBQWQsQ0FBbUIsSUFEUSxFQUNGLGNBQWMsSUFBZCxDQUFtQixHQUFuQixFQUF3QixJQUR0QixDQUEvQjtBQUVBLGlCQUFLLElBQU0sTUFBWCxJQUE0QixjQUFjLElBQWQsQ0FBbUIsR0FBbkIsQ0FBNUI7QUFDSSxvQkFDSSxjQUFjLElBQWQsQ0FBbUIsR0FBbkIsRUFBd0IsY0FBeEIsQ0FBdUMsTUFBdkMsS0FDQSxDQUFDLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsUUFBbkIsQ0FBNEIsTUFBNUIsQ0FERCxJQUVBLE9BQU8sY0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLE1BQXhCLENBQVAsS0FBMkMsUUFIL0MsRUFLSSxjQUFjLElBQWQsQ0FBbUIsR0FBbkIsRUFBd0IsTUFBeEIsSUFBa0MsZUFBSyxPQUFMLENBQzlCLGNBQWMsSUFBZCxDQUFtQixHQUFuQixFQUF3QixJQURNLEVBRTlCLHFCQUFNLDJCQUFOLENBQ0ksY0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLE1BQXhCLENBREosRUFFSSxvQkFGSixFQUUwQixTQUYxQixFQUVxQyxLQUZyQyxDQUY4QixJQUs5QixHQUxKLENBTEosS0FXSztBQUNELGtDQUFjLElBQWQsQ0FBbUIsR0FBbkIsRUFBd0IsTUFBeEIsSUFDSSxxQkFBTSwyQkFBTixDQUNJLGNBQWMsSUFBZCxDQUFtQixHQUFuQixFQUF3QixNQUF4QixDQURKLEVBRUksb0JBRkosRUFFMEIsU0FGMUIsRUFFcUMsS0FGckMsQ0FESjtBQUlBLHdCQUFJLHFCQUFNLGFBQU4sQ0FBb0IsY0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLE1BQXhCLENBQXBCLENBQUosRUFBMEQ7QUFDdEQsc0NBQWMsSUFBZCxDQUFtQixHQUFuQixFQUF3QixNQUF4QixFQUFnQyxJQUFoQyxHQUF1QyxlQUFLLE9BQUwsQ0FDbkMsY0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLElBRFcsRUFFbkMsY0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLE1BQXhCLEVBQWdDLElBRkcsQ0FBdkM7QUFHQSw2QkFDSSxJQUFNLFNBRFYsSUFDOEIsY0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQ3RCLE1BRHNCLENBRDlCO0FBSUksZ0NBQUksY0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLE1BQXhCLEVBQWdDLGNBQWhDLENBQ0EsU0FEQSxLQUVDLGNBQWMsTUFGZixJQUdKLE9BQU8sY0FBYyxJQUFkLENBQW1CLEdBQW5CLEVBQXdCLE1BQXhCLEVBQ0gsU0FERyxDQUFQLEtBRU0sUUFMTixFQU1JLGNBQWMsSUFBZCxDQUFtQixHQUFuQixFQUF3QixNQUF4QixFQUNJLFNBREosSUFFSSxlQUFLLE9BQUwsQ0FDQSxjQUFjLElBQWQsQ0FBbUIsR0FBbkIsRUFBd0IsTUFBeEIsRUFBZ0MsSUFEaEMsRUFFQSxxQkFBTSwyQkFBTixDQUNJLGNBQWMsSUFBZCxDQUFtQixHQUFuQixFQUF3QixNQUF4QixFQUNJLFNBREosQ0FESixFQUdJLG9CQUhKLEVBRzBCLFNBSDFCLEVBR3FDLEtBSHJDLENBRkEsSUFNQSxHQVJKO0FBVlI7QUFtQkg7QUFDSjtBQXpDTDtBQTBDSDtBQUNKO0FBM0RMLEMsQ0E0REE7QUFDQSxJQUFNLHdCQUE4QyxxQkFBTSxXQUFOLENBQ2hELHFCQUFNLDJCQUFOLENBQWtDLHFCQUFNLDJCQUFOLENBQzlCLGFBRDhCLEVBQ2Ysb0JBRGUsRUFDTyxTQURQLENBQWxDLEVBRUcsb0JBRkgsRUFFeUIsU0FGekIsRUFFb0MsSUFGcEMsQ0FEZ0QsQ0FBcEQ7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU0sdUJBQW1DLHNCQUFzQixLQUF0QixDQUE0QixPQUFyRTtBQUNBLE9BQU8sc0JBQXNCLEtBQXRCLENBQTRCLE9BQW5DO0FBQ0EsS0FBSyxJQUFNLElBQVgsSUFBMEIsc0JBQXNCLEtBQWhEO0FBQ0ksUUFBSSxzQkFBc0IsS0FBdEIsQ0FBNEIsY0FBNUIsQ0FBMkMsSUFBM0MsQ0FBSixFQUNJLHNCQUFzQixLQUF0QixDQUE0QixJQUE1QixJQUFvQyxxQkFBTSxZQUFOLENBQW1CLElBQW5CLEVBQXlCLEVBQXpCLEVBQ2pDLG9CQURpQyxFQUNYLHFCQUFNLFlBQU4sQ0FDckIsSUFEcUIsRUFDZixFQUFDLFdBQVcsSUFBWixFQURlLEVBQ0ksc0JBQXNCLEtBQXRCLENBQTRCLElBQTVCLENBREosRUFDdUMsRUFBQyxVQUFELEVBRHZDLENBRFcsQ0FBcEM7QUFGUixDLENBTUE7QUFDQTtBQUNBLHNCQUFzQixNQUF0QixDQUE2QixTQUE3QixHQUF5QyxpQkFBTyx3QkFBUCxDQUNyQyxzQkFBc0IsU0FBdEIsQ0FBZ0MsUUFESyxFQUVyQyxzQkFBc0IsTUFBdEIsQ0FBNkIsT0FGUSxFQUdyQyxzQkFBc0IsZUFIZSxFQUdFLHNCQUFzQixJQUF0QixDQUEyQixPQUg3QixFQUlyQyxzQkFBc0IsSUFBdEIsQ0FBMkIsTUFBM0IsQ0FBa0MsS0FBbEMsQ0FBd0MsSUFKSCxDQUF6QztBQUtBLHNCQUFzQixTQUF0QixHQUFrQyxpQkFBTyxnQkFBUCxDQUM5QixzQkFBc0IsU0FEUSxFQUNHLGlCQUFPLGtDQUFQLENBQzdCLHNCQUFzQixLQURPLEVBRTdCLHNCQUFzQixJQUF0QixDQUEyQixNQUEzQixDQUFrQyxLQUFsQyxDQUF3QyxJQUZYLEVBRzdCLHNCQUFzQixJQUF0QixDQUEyQixNQUEzQixDQUFrQyxNQUFsQyxDQUNJLHNCQUFzQixNQUF0QixDQUE2QixXQURqQyxFQUVJLHNCQUFzQixNQUF0QixDQUE2QixXQUZqQyxFQUdFLEdBSEYsQ0FHTSxVQUFDLFFBQUQ7QUFBQSxXQUE0QixlQUFLLE9BQUwsQ0FDOUIsc0JBQXNCLElBQXRCLENBQTJCLE9BREcsRUFDTSxRQUROLENBQTVCO0FBQUEsQ0FITixFQUtFLE1BTEYsQ0FLUyxVQUFDLFFBQUQ7QUFBQSxXQUNMLENBQUMsc0JBQXNCLElBQXRCLENBQTJCLE9BQTNCLENBQW1DLFVBQW5DLENBQThDLFFBQTlDLENBREk7QUFBQSxDQUxULENBSDZCLENBREgsRUFXM0Isc0JBQXNCLFNBQXRCLENBQWdDLFdBWEwsRUFZOUIsc0JBQXNCLE1BQXRCLENBQTZCLE9BWkMsRUFhOUIsc0JBQXNCLGVBYlEsRUFjOUIsc0JBQXNCLElBQXRCLENBQTJCLE9BZEcsRUFlOUIsc0JBQXNCLElBQXRCLENBQTJCLE1BQTNCLENBQWtDLEtBQWxDLENBQXdDLElBZlYsRUFnQjlCLHNCQUFzQixJQUF0QixDQUEyQixNQWhCRyxDQUFsQztBQWlCQSxzQkFBc0IsU0FBdEIsQ0FBZ0MsUUFBaEMsR0FBMkM7QUFDdkMsV0FBTyxzQkFBc0IsU0FBdEIsQ0FBZ0MsUUFEQTtBQUV2QztBQUNBLGdCQUFZLGlCQUFPLDBCQUFQLENBQ1Isc0JBQXNCLFNBQXRCLENBQWdDLFFBRHhCLENBSDJCLEVBQTNDO0FBS0Esc0JBQXNCLE1BQXRCLEdBQStCLEVBQUMsWUFBWSxjQUFjLEtBQWQsSUFBdUIsQ0FDL0QsT0FEK0QsRUFDdEQsZUFEc0QsRUFFakUsUUFGaUUsQ0FFeEQsc0JBQXNCLHlCQUF0QixDQUFnRCxDQUFoRCxDQUZ3RCxDQUFwQyxFQUEvQjtBQUdBLEtBQ0ksSUFBTSxTQURWLElBRUksc0JBQXNCLFNBQXRCLENBQWdDLFFBQWhDLENBQXlDLFVBRjdDO0FBSUksUUFBSSxzQkFBc0IsU0FBdEIsQ0FBZ0MsUUFBaEMsQ0FBeUMsVUFBekMsQ0FBb0QsY0FBcEQsQ0FDQSxTQURBLENBQUo7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFHSSxpQ0FFSSxzQkFBc0IsU0FBdEIsQ0FBZ0MsUUFBaEMsQ0FBeUMsVUFBekMsQ0FBb0QsU0FBcEQsQ0FGSiw4SEFHRTtBQUFBLG9CQUZRLFNBRVI7O0FBQ0Usb0JBQU0sWUFBbUIsaUJBQU8sdUJBQVAsQ0FDckIsU0FEcUIsRUFDWCxzQkFBc0IsTUFBdEIsQ0FBNkIsT0FEbEIsRUFFckIsc0JBQXNCLGVBRkQsRUFHckIsc0JBQXNCLElBQXRCLENBQTJCLE9BSE4sRUFJckIsc0JBQXNCLElBQXRCLENBQTJCLE1BQTNCLENBQWtDLEtBQWxDLENBQXdDLElBSm5CLEVBS3JCLHNCQUFzQixJQUF0QixDQUEyQixNQUxOLENBQXpCO0FBTUEsb0JBQUksY0FBSjtBQUNBLG9CQUFJLFNBQUosRUFDSSxRQUFPLGlCQUFPLGtCQUFQLENBQ0gsU0FERyxFQUNPLHNCQUFzQixLQUQ3QixFQUVILHNCQUFzQixJQUZuQixDQUFQLENBREosS0FLSSxNQUFNLDBCQUNnQixTQURoQiw4QkFBTjtBQUVKLG9CQUFJLEtBQUosRUFDSSxzQkFBc0IsTUFBdEIsQ0FBNkIsS0FBN0IsSUFBcUMsSUFBckM7QUFDUDtBQXZCTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFKSixDLENBNEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE1BQXRCLENBQTZCLE9BQTdCLENBQXFDLHFDQUFyQyxHQUNJLHNCQUFzQixLQUF0QixDQUE0QixXQUE1QixDQUF3QyxRQUF4QyxDQUFpRCxTQUFqRCxDQUNJLENBREosRUFDTyxzQkFBc0IsS0FBdEIsQ0FBNEIsV0FBNUIsQ0FBd0MsUUFBeEMsQ0FBaUQsV0FBakQsQ0FBNkQsR0FBN0QsQ0FEUCxDQURKO0FBR0Esc0JBQXNCLE1BQXRCLENBQTZCLE9BQTdCLENBQXFDLG9DQUFyQyxHQUNJLGlCQUFPLFdBQVAsQ0FBbUIsc0JBQXNCLEtBQXRCLENBQTRCLFdBQTVCLENBQXdDLFFBQTNELENBREo7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQUlBLDBCQUMrQyxzQkFBc0IsS0FBdEIsQ0FBNEIsSUFEM0UsbUlBRUU7QUFBQSxZQURNLGlCQUNOOztBQUNFLDZCQUFNLFlBQU4sQ0FDSSxJQURKLEVBQ1UsaUJBRFYsRUFDNkIsc0JBQXNCLEtBQXRCLENBQTRCLFdBRHpEO0FBRUEsWUFDSSxPQUFPLGtCQUFrQixRQUF6QixLQUFzQyxRQUF0QyxJQUNBLGtCQUFrQixRQUFsQixDQUEyQixRQUEzQixDQUFvQyxHQUFwQyxDQURBLElBRUEsa0JBQWtCLFFBQWxCLEtBQ0ksc0JBQXNCLEtBQXRCLENBQTRCLFdBQTVCLENBQXdDLFFBSmhELEVBS0U7QUFDRSxnQkFBTSxvQkFBMkIsSUFBSSxNQUFKLENBQVcsa0JBQWtCLFFBQTdCLENBQWpDO0FBQ0EsOEJBQWtCLE9BQWxCLEdBQTZCLFVBQUMsTUFBRDtBQUFBLHVCQUE0QixVQUNyRCxPQURxRCxFQUM5QixZQUQ4QjtBQUFBLDJCQUk3QyxNQUo2QztBQUFBLGlCQUE1QjtBQUFBLGFBQUQsQ0FJUixrQkFBa0IsUUFKVixDQUE1QjtBQUtBLDhCQUFrQixRQUFsQixHQUE2QixpQkFBN0I7QUFDSDtBQUNKO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBQ2UscUI7QUFDZjtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgKiBhcyBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbi8vIE5PVEU6IE9ubHkgbmVlZGVkIGZvciBkZWJ1Z2dpbmcgdGhpcyBmaWxlLlxudHJ5IHtcbiAgICByZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInKVxufSBjYXRjaCAoZXJyb3IpIHt9XG5cbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG4vLyBOT1RFOiBcIntjb25maWd1cmF0aW9uIGFzIG1ldGFDb25maWd1cmF0aW9ufVwiIHdvdWxkIHJlc3VsdCBpbiBhIHJlYWQgb25seVxuLy8gdmFyaWFibGUgbmFtZWQgXCJtZXRhQ29uZmlndXJhdGlvblwiLlxuaW1wb3J0IHtjb25maWd1cmF0aW9uIGFzIGdpdmVuTWV0YUNvbmZpZ3VyYXRpb259IGZyb20gJy4vcGFja2FnZSdcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgdHlwZSB7XG4gICAgRGVmYXVsdENvbmZpZ3VyYXRpb24sIEhUTUxDb25maWd1cmF0aW9uLCBNZXRhQ29uZmlndXJhdGlvbiwgUGxhaW5PYmplY3QsXG4gICAgUmVzb2x2ZWRDb25maWd1cmF0aW9uXG59IGZyb20gJy4vdHlwZSdcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbmxldCBtZXRhQ29uZmlndXJhdGlvbjpNZXRhQ29uZmlndXJhdGlvbiA9IGdpdmVuTWV0YUNvbmZpZ3VyYXRpb25cbi8qXG4gICAgVG8gYXNzdW1lIHRvIGdvIHR3byBmb2xkZXIgdXAgZnJvbSB0aGlzIGZpbGUgdW50aWwgdGhlcmUgaXMgbm9cbiAgICBcIm5vZGVfbW9kdWxlc1wiIHBhcmVudCBmb2xkZXIgIGlzIHVzdWFsbHkgcmVzaWxpZW50IGFnYWluIGRlYWxpbmcgd2l0aFxuICAgIHByb2plY3RzIHdoZXJlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgaXNuJ3QgdGhlIHByb2plY3RzIGRpcmVjdG9yeSBhbmRcbiAgICB0aGlzIGxpYnJhcnkgaXMgbG9jYXRlZCBhcyBhIG5lc3RlZCBkZXBlbmRlbmN5LlxuKi9cbm1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gX19kaXJuYW1lXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmNvbnRleHRUeXBlID0gJ21haW4nXG53aGlsZSAodHJ1ZSkge1xuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCwgJy4uLy4uLycpXG4gICAgaWYgKHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dFxuICAgICkpICE9PSAnbm9kZV9tb2R1bGVzJylcbiAgICAgICAgYnJlYWtcbn1cbmlmIChcbiAgICBwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkgPT09ICdub2RlX21vZHVsZXMnIHx8XG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpID09PSAnLnN0YWdpbmcnICYmXG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSkgPT09ICdub2RlX21vZHVsZXMnXG4pIHtcbiAgICAvKlxuICAgICAgICBOT1RFOiBJZiB3ZSBhcmUgZGVhbGluZyB3YXMgYSBkZXBlbmRlbmN5IHByb2plY3QgdXNlIGN1cnJlbnQgZGlyZWN0b3J5XG4gICAgICAgIGFzIGNvbnRleHQuXG4gICAgKi9cbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmNvbnRleHRUeXBlID0gJ2RlcGVuZGVuY3knXG59IGVsc2VcbiAgICAvKlxuICAgICAgICBOT1RFOiBJZiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSByZWZlcmVuY2VzIHRoaXMgZmlsZSB2aWEgYVxuICAgICAgICBsaW5rZWQgXCJub2RlX21vZHVsZXNcIiBmb2xkZXIgdXNpbmcgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeSBhcyBjb250ZXh0XG4gICAgICAgIGlzIGEgYmV0dGVyIGFzc3VtcHRpb24gdGhhbiB0d28gZm9sZGVycyB1cCB0aGUgaGllcmFyY2h5LlxuICAgICovXG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKGZpbGVTeXN0ZW0ubHN0YXRTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZChcbiAgICAgICAgKSwgJ25vZGVfbW9kdWxlcycpKS5pc1N5bWJvbGljTGluaygpKVxuICAgICAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5sZXQgc3BlY2lmaWNDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0XG50cnkge1xuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHJlcXVpcmUocGF0aC5qb2luKFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCwgJ3BhY2thZ2UnKSlcbn0gY2F0Y2ggKGVycm9yKSB7XG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uID0ge25hbWU6ICdtb2NrdXAnfVxuICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxufVxuY29uc3QgbmFtZTpzdHJpbmcgPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ubmFtZVxuc3BlY2lmaWNDb25maWd1cmF0aW9uID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLndlYk9wdGltaXplciB8fCB7fVxuc3BlY2lmaWNDb25maWd1cmF0aW9uLm5hbWUgPSBuYW1lXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBsb2FkaW5nIGRlZmF1bHQgY29uZmlndXJhdGlvblxuLy8gTk9URTogR2l2ZW4gbm9kZSBjb21tYW5kIGxpbmUgYXJndW1lbnRzIHJlc3VsdHMgaW4gXCJucG1fY29uZmlnXypcIlxuLy8gZW52aXJvbm1lbnQgdmFyaWFibGVzLlxubGV0IGRlYnVnOmJvb2xlYW4gPSBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LmRlYnVnXG5pZiAoc3BlY2lmaWNDb25maWd1cmF0aW9uLmRlYnVnICE9PSB1bmRlZmluZWQpXG4gICAgZGVidWcgPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24uZGVidWdcbmlmIChwcm9jZXNzLmVudi5ucG1fY29uZmlnX3Byb2R1Y3Rpb24pXG4gICAgZGVidWcgPSBmYWxzZVxuZWxzZSBpZiAocHJvY2Vzcy5lbnYubnBtX2NvbmZpZ19kZWJ1ZylcbiAgICBkZWJ1ZyA9IHRydWVcbm1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ICs9ICcvJ1xuLy8gTWVyZ2VzIGZpbmFsIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgZGVwZW5kaW5nIG9uIGdpdmVuIHRhcmdldFxuLy8gZW52aXJvbm1lbnQuXG5jb25zdCBsaWJyYXJ5Q29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IG1ldGFDb25maWd1cmF0aW9uLmxpYnJhcnlcbmxldCBjb25maWd1cmF0aW9uOkRlZmF1bHRDb25maWd1cmF0aW9uXG5pZiAoZGVidWcpXG4gICAgY29uZmlndXJhdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQsIG1ldGFDb25maWd1cmF0aW9uLmRlYnVnXG4gICAgKSwgbWV0YUNvbmZpZ3VyYXRpb24uZGVidWcpXG5lbHNlXG4gICAgY29uZmlndXJhdGlvbiA9IG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHRcbmNvbmZpZ3VyYXRpb24uZGVidWcgPSBkZWJ1Z1xuaWYgKHR5cGVvZiBjb25maWd1cmF0aW9uLmxpYnJhcnkgPT09ICdvYmplY3QnKVxuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgIGxpYnJhcnlDb25maWd1cmF0aW9uLCBjb25maWd1cmF0aW9uLmxpYnJhcnlcbiAgICApLCBjb25maWd1cmF0aW9uLmxpYnJhcnkpXG5pZiAoXG4gICAgJ2xpYnJhcnknIGluIHNwZWNpZmljQ29uZmlndXJhdGlvbiAmJlxuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSB0cnVlIHx8IChcbiAgICAgICAgJ2xpYnJhcnknIGluIHNwZWNpZmljQ29uZmlndXJhdGlvbiAmJlxuICAgICAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ubGlicmFyeSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICEoJ2xpYnJhcnknIGluIHNwZWNpZmljQ29uZmlndXJhdGlvbilcbiAgICApICYmIGNvbmZpZ3VyYXRpb24ubGlicmFyeVxuKVxuICAgIGNvbmZpZ3VyYXRpb24gPSBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICBjb25maWd1cmF0aW9uLCBsaWJyYXJ5Q29uZmlndXJhdGlvblxuICAgICksIGxpYnJhcnlDb25maWd1cmF0aW9uKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbWVyZ2luZyBhbmQgZXZhbHVhdGluZyBkZWZhdWx0LCB0ZXN0LCBzcGVjaWZpYyBhbmQgZHluYW1pYyBzZXR0aW5nc1xuLy8gLyByZWdpb24gbG9hZCBhZGRpdGlvbmFsIGR5bmFtaWNhbGx5IGdpdmVuIGNvbmZpZ3VyYXRpb25cbmxldCBjb3VudDpudW1iZXIgPSAwXG5sZXQgZmlsZVBhdGg6P3N0cmluZyA9IG51bGxcbndoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgbmV3RmlsZVBhdGg6c3RyaW5nID0gY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQgK1xuICAgICAgICBgLmR5bmFtaWNDb25maWd1cmF0aW9uLSR7Y291bnR9Lmpzb25gXG4gICAgaWYgKCFIZWxwZXIuaXNGaWxlU3luYyhuZXdGaWxlUGF0aCkpXG4gICAgICAgIGJyZWFrXG4gICAgZmlsZVBhdGggPSBuZXdGaWxlUGF0aFxuICAgIGNvdW50ICs9IDFcbn1cbmxldCBydW50aW1lSW5mb3JtYXRpb246UGxhaW5PYmplY3QgPSB7XG4gICAgZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50czogcHJvY2Vzcy5hcmd2XG59XG5pZiAoZmlsZVBhdGgpIHtcbiAgICBydW50aW1lSW5mb3JtYXRpb24gPSBKU09OLnBhcnNlKGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCB7XG4gICAgICAgIGVuY29kaW5nOiAndXRmLTgnfSkpXG4gICAgZmlsZVN5c3RlbS51bmxpbmsoZmlsZVBhdGgsIChlcnJvcjo/RXJyb3IpOnZvaWQgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgIH0pXG59XG5pZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoID4gMilcbiAgICAvLyByZWdpb24gYXBwbHkgZG9jdW1lbnRhdGlvbiBjb25maWd1cmF0aW9uXG4gICAgaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAnZG9jdW1lbnQnKVxuICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgY29uZmlndXJhdGlvbi5kb2N1bWVudFxuICAgICAgICApLCBjb25maWd1cmF0aW9uLmRvY3VtZW50KVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBhcHBseSB0ZXN0IGNvbmZpZ3VyYXRpb25cbiAgICBlbHNlIGlmIChcbiAgICAgICAgcnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICd0ZXN0SW5Ccm93c2VyJ1xuICAgIClcbiAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb24udGVzdEluQnJvd3NlclxuICAgICAgICApLCBjb25maWd1cmF0aW9uLnRlc3RJbkJyb3dzZXIpXG4gICAgZWxzZSBpZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICd0ZXN0JylcbiAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb24udGVzdFxuICAgICAgICApLCBjb25maWd1cmF0aW9uLnRlc3QpXG4gICAgLy8gZW5kcmVnaW9uXG4vLyAvIGVuZHJlZ2lvblxuVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChUb29scy5tb2RpZnlPYmplY3QoXG4gICAgY29uZmlndXJhdGlvbiwgc3BlY2lmaWNDb25maWd1cmF0aW9uXG4pLCBydW50aW1lSW5mb3JtYXRpb24pLCBzcGVjaWZpY0NvbmZpZ3VyYXRpb24sIHJ1bnRpbWVJbmZvcm1hdGlvbilcbmxldCByZXN1bHQ6P1BsYWluT2JqZWN0ID0gbnVsbFxuaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDMpXG4gICAgcmVzdWx0ID0gSGVscGVyLnBhcnNlRW5jb2RlZE9iamVjdChcbiAgICAgICAgcnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbcnVudGltZUluZm9ybWF0aW9uXG4gICAgICAgICAgICAuZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggLSAxXSxcbiAgICAgICAgY29uZmlndXJhdGlvbiwgJ2NvbmZpZ3VyYXRpb24nKVxuaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QocmVzdWx0KSlcbiAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgVG9vbHMubW9kaWZ5T2JqZWN0KGNvbmZpZ3VyYXRpb24sIHJlc3VsdCksIHJlc3VsdClcbi8vIC8gcmVnaW9uIGRldGVybWluZSBleGlzdGluZyBwcmUgY29tcGlsZWQgZGxsIG1hbmlmZXN0cyBmaWxlIHBhdGhzXG5jb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzID0gW11cbmxldCB0YXJnZXREaXJlY3Rvcnk6P09iamVjdCA9IG51bGxcbnRyeSB7XG4gICAgdGFyZ2V0RGlyZWN0b3J5ID0gZmlsZVN5c3RlbS5zdGF0U3luYyhjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UpXG59IGNhdGNoIChlcnJvcikge31cbmlmICh0YXJnZXREaXJlY3RvcnkgJiYgdGFyZ2V0RGlyZWN0b3J5LmlzRGlyZWN0b3J5KCkpXG4gICAgZmlsZVN5c3RlbS5yZWFkZGlyU3luYyhjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UpLmZvckVhY2goKFxuICAgICAgICBmaWxlTmFtZTpzdHJpbmdcbiAgICApOnZvaWQgPT4ge1xuICAgICAgICBpZiAoZmlsZU5hbWUubWF0Y2goL14uKlxcLmRsbC1tYW5pZmVzdFxcLmpzb24kLykpXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLnB1c2gocGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwgZmlsZU5hbWUpKVxuICAgIH0pXG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gZGVmaW5lIGR5bmFtaWMgcmVzb2x2ZSBwYXJhbWV0ZXJcbmNvbnN0IHBhcmFtZXRlckRlc2NyaXB0aW9uOkFycmF5PHN0cmluZz4gPSBbXG4gICAgJ3NlbGYnLCAnd2ViT3B0aW1pemVyUGF0aCcsICdjdXJyZW50UGF0aCcsICdwYXRoJywgJ2hlbHBlcicsICd0b29scyddXG5jb25zdCBwYXJhbWV0ZXI6QXJyYXk8YW55PiA9IFtcbiAgICBjb25maWd1cmF0aW9uLCBfX2Rpcm5hbWUsIHByb2Nlc3MuY3dkKCksIHBhdGgsIEhlbHBlciwgVG9vbHNdXG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gYnVpbGQgYWJzb2x1dGUgcGF0aHNcbmNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlID0gcGF0aC5yZXNvbHZlKFxuICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlLCBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyLCBmYWxzZSkpXG5mb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoKVxuICAgIGlmIChcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmhhc093blByb3BlcnR5KGtleSkgJiYga2V5ICE9PSAnYmFzZScgJiZcbiAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldID09PSAnc3RyaW5nJ1xuICAgIClcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgVG9vbHMucmVzb2x2ZUR5bmFtaWNEYXRhU3RydWN0dXJlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLCBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyLFxuICAgICAgICAgICAgICAgIGZhbHNlKVxuICAgICAgICApICsgJy8nXG4gICAgZWxzZSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldID0gVG9vbHMucmVzb2x2ZUR5bmFtaWNEYXRhU3RydWN0dXJlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0sIHBhcmFtZXRlckRlc2NyaXB0aW9uLCBwYXJhbWV0ZXIsIGZhbHNlKVxuICAgICAgICBpZiAoVG9vbHMuaXNQbGFpbk9iamVjdChjb25maWd1cmF0aW9uLnBhdGhba2V5XSkpIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN1YktleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoW2tleV0pXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5oYXNPd25Qcm9wZXJ0eShzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgICAgICFbJ2Jhc2UnLCAncHVibGljJ10uaW5jbHVkZXMoc3ViS2V5KSAmJlxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMucmVzb2x2ZUR5bmFtaWNEYXRhU3RydWN0dXJlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVyRGVzY3JpcHRpb24sIHBhcmFtZXRlciwgZmFsc2UpXG4gICAgICAgICAgICAgICAgICAgICkgKyAnLydcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QoY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViU3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViS2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApICYmIHN1YlN1YktleSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViU3ViS2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ViU3ViS2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyLCBmYWxzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuLy8gLyBlbmRyZWdpb25cbmNvbnN0IHJlc29sdmVkQ29uZmlndXJhdGlvbjpSZXNvbHZlZENvbmZpZ3VyYXRpb24gPSBUb29scy51bndyYXBQcm94eShcbiAgICBUb29scy5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoVG9vbHMucmVzb2x2ZUR5bmFtaWNEYXRhU3RydWN0dXJlKFxuICAgICAgICBjb25maWd1cmF0aW9uLCBwYXJhbWV0ZXJEZXNjcmlwdGlvbiwgcGFyYW1ldGVyXG4gICAgKSwgcGFyYW1ldGVyRGVzY3JpcHRpb24sIHBhcmFtZXRlciwgdHJ1ZSkpXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBjb25zb2xpZGF0ZSBmaWxlIHNwZWNpZmljIGJ1aWxkIGNvbmZpZ3VyYXRpb25cbi8vIEFwcGx5IGRlZmF1bHQgZmlsZSBsZXZlbCBidWlsZCBjb25maWd1cmF0aW9ucyB0byBhbGwgZmlsZSB0eXBlIHNwZWNpZmljXG4vLyBvbmVzLlxuY29uc3QgZGVmYXVsdENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGQuZGVmYXVsdFxuZGVsZXRlIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZC5kZWZhdWx0XG5mb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZClcbiAgICBpZiAocmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLmhhc093blByb3BlcnR5KHR5cGUpKVxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGRbdHlwZV0gPSBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge1xuICAgICAgICB9LCBkZWZhdWx0Q29uZmlndXJhdGlvbiwgVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgdHJ1ZSwge2V4dGVuc2lvbjogdHlwZX0sIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZFt0eXBlXSwge3R5cGV9KVxuICAgICAgICApXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiByZXNvbHZlIG1vZHVsZSBsb2NhdGlvbiBhbmQgd2hpY2ggYXNzZXQgdHlwZXMgYXJlIG5lZWRlZFxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5rbm93bkV4dGVuc2lvbnMsIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UpXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uID0gSGVscGVyLnJlc29sdmVJbmplY3Rpb24oXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbiwgSGVscGVyLnJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZCxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yaWVzLFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3Rvcmllc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKVxuICAgICksIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uYXV0b0V4Y2x1ZGUsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5rbm93bkV4dGVuc2lvbnMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUpXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsID0ge1xuICAgIGdpdmVuOiByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLFxuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIG5vcm1hbGl6ZWQ6IEhlbHBlci5ub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbCl9XG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkID0ge2phdmFTY3JpcHQ6IGNvbmZpZ3VyYXRpb24uZGVidWcgJiYgW1xuICAgICdzZXJ2ZScsICd0ZXN0SW5Ccm93c2VyJ1xuXS5pbmNsdWRlcyhyZXNvbHZlZENvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSl9XG5mb3IgKFxuICAgIGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW5cbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRcbilcbiAgICBpZiAocmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICBjaHVua05hbWVcbiAgICApKVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQsIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ua25vd25FeHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguaWdub3JlKVxuICAgICAgICAgICAgbGV0IHR5cGU6P3N0cmluZ1xuICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIHR5cGUgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkLFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEdpdmVuIHJlcXVlc3QgXCIke21vZHVsZUlEfVwiIGNvdWxkbid0IGJlIHJlc29sdmVkLmApXG4gICAgICAgICAgICBpZiAodHlwZSlcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkW3R5cGVdID0gdHJ1ZVxuICAgICAgICB9XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhZGRpbmcgc3BlY2lhbCBhbGlhc2VzXG4vLyBOT1RFOiBUaGlzIGFsaWFzIGNvdWxkbid0IGJlIHNldCBpbiB0aGUgXCJwYWNrYWdlLmpzb25cIiBmaWxlIHNpbmNlIHRoaXMgd291bGRcbi8vIHJlc3VsdCBpbiBhbiBlbmRsZXNzIGxvb3AuXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciA9XG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLnN1YnN0cmluZyhcbiAgICAgICAgMCwgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmxhc3RJbmRleE9mKCchJykpXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZVBhdGgkID1cbiAgICBIZWxwZXIuc3RyaXBMb2FkZXIocmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gYXBwbHkgd2VicGFjayBodG1sIHBsdWdpbiB3b3JrYXJvdW5kXG4vKlxuICAgIE5PVEU6IFByb3ZpZGVzIGEgd29ya2Fyb3VuZCB0byBoYW5kbGUgYSBidWcgd2l0aCBjaGFpbmVkIGxvYWRlclxuICAgIGNvbmZpZ3VyYXRpb25zLlxuKi9cbmZvciAoXG4gICAgbGV0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5odG1sXG4pIHtcbiAgICBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgIHRydWUsIGh0bWxDb25maWd1cmF0aW9uLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwpXG4gICAgaWYgKFxuICAgICAgICB0eXBlb2YgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUgPT09ICdzdHJpbmcnICYmXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmluY2x1ZGVzKCchJykgJiZcbiAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUgIT09XG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGVcbiAgICApIHtcbiAgICAgICAgY29uc3QgbmV3VGVtcGxhdGVTdHJpbmc6T2JqZWN0ID0gbmV3IFN0cmluZyhodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZSlcbiAgICAgICAgbmV3VGVtcGxhdGVTdHJpbmcucmVwbGFjZSA9ICgoc3RyaW5nOnN0cmluZyk6RnVuY3Rpb24gPT4gKFxuICAgICAgICAgICAgX3NlYXJjaDpSZWdFeHB8c3RyaW5nLCBfcmVwbGFjZW1lbnQ6c3RyaW5nfChcbiAgICAgICAgICAgICAgICAuLi5tYXRjaGVzOkFycmF5PHN0cmluZz5cbiAgICAgICAgICAgICkgPT4gc3RyaW5nXG4gICAgICAgICk6c3RyaW5nID0+IHN0cmluZykoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUpXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlID0gbmV3VGVtcGxhdGVTdHJpbmdcbiAgICB9XG59XG4vLyBlbmRyZWdpb25cbmV4cG9ydCBkZWZhdWx0IHJlc29sdmVkQ29uZmlndXJhdGlvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=