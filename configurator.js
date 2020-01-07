#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict';
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.resolvedConfiguration = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _clientnode = _interopRequireDefault(require("clientnode"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _helper = _interopRequireDefault(require("./helper"));

var _package = require("./package");

// NOTE: "{configuration as metaConfiguration}" would result in a read only
// variable named "metaConfiguration".
var metaConfiguration = _package.configuration;
/*
    To assume to go two folder up from this file until there is no
    "node_modules" parent folder is usually resilient again dealing with
    projects where current working directory isn't the projects directory and
    this library is located as a nested dependency.
*/

metaConfiguration["default"].path.context = __dirname;
metaConfiguration["default"].contextType = 'main';

while (true) {
  metaConfiguration["default"].path.context = _path["default"].resolve(metaConfiguration["default"].path.context, '../../');
  if (_path["default"].basename(_path["default"].dirname(metaConfiguration["default"].path.context)) !== 'node_modules') break;
}

if (_path["default"].basename(_path["default"].dirname(process.cwd())) === 'node_modules' || _path["default"].basename(_path["default"].dirname(process.cwd())) === '.staging' && _path["default"].basename(_path["default"].dirname(_path["default"].dirname(process.cwd()))) === 'node_modules') {
  /*
      NOTE: If we are dealing was a dependency project use current directory
      as context.
  */
  metaConfiguration["default"].path.context = process.cwd();
  metaConfiguration["default"].contextType = 'dependency';
} else
  /*
      NOTE: If the current working directory references this file via a
      linked "node_modules" folder using current working directory as context
      is a better assumption than two folders up the hierarchy.
  */
  try {
    if (_fs["default"].lstatSync(_path["default"].join(process.cwd(), 'node_modules')).isSymbolicLink()) metaConfiguration["default"].path.context = process.cwd();
  } catch (error) {// continue regardless of error
  }

var specificConfiguration;

try {
  /* eslint-disable no-eval */
  specificConfiguration = eval('require')(_path["default"].join(metaConfiguration["default"].path.context, 'package'));
  /* eslint-enable no-eval */
} catch (error) {
  specificConfiguration = {
    name: 'mockup'
  };
  metaConfiguration["default"].path.context = process.cwd();
}

var name = specificConfiguration.name;
specificConfiguration = specificConfiguration.webOptimizer || {};
specificConfiguration.name = name; // endregion
// region determine debug mode
// NOTE: Given node command line arguments results in "npm_config_*"
// environment variables.

var debug = metaConfiguration["default"].debug;
if (typeof specificConfiguration.debug === 'boolean') debug = specificConfiguration.debug;else if (process.env.npm_config_dev === 'true' || ['debug', 'dev', 'development'].includes(process.env.NODE_ENV)) debug = true;
if (debug) process.env.NODE_ENV = 'development'; // endregion
// region loading default configuration

metaConfiguration["default"].path.context += '/'; // Merges final default configuration object depending on given target
// environment.

var libraryConfiguration = metaConfiguration.library;
var configuration;
if (debug) configuration = _clientnode["default"].extend(true, _clientnode["default"].modifyObject(metaConfiguration["default"], metaConfiguration.debug), metaConfiguration.debug);else configuration = metaConfiguration["default"];
configuration.debug = debug;
if ((0, _typeof2["default"])(configuration.library) === 'object') _clientnode["default"].extend(true, _clientnode["default"].modifyObject(libraryConfiguration, configuration.library), configuration.library);
if ('library' in specificConfiguration && specificConfiguration.library === true || ('library' in specificConfiguration && specificConfiguration.library === undefined || !('library' in specificConfiguration)) && configuration.library) configuration = _clientnode["default"].extend(true, _clientnode["default"].modifyObject(configuration, libraryConfiguration), libraryConfiguration); // endregion
// region merging and evaluating task specific and dynamic configurations
// / region load additional dynamically given configuration

var count = 0;
var filePath = null;

while (true) {
  var newFilePath = configuration.path.context + ".dynamicConfiguration-".concat(count, ".json");
  if (!_clientnode["default"].isFileSync(newFilePath)) break;
  filePath = newFilePath;
  count += 1;
}

var runtimeInformation = {
  givenCommandLineArguments: process.argv
};

if (filePath) {
  runtimeInformation = JSON.parse(_fs["default"].readFileSync(filePath, {
    encoding: configuration.encoding
  }));

  _fs["default"].unlink(filePath, function (error) {
    if (error) throw error;
  });
} // // region task specific configuration
// /// region apply task type specific configuration


var taskTypes = ['build', 'debug', 'document', 'serve', 'test', 'test:browser'];

if (runtimeInformation.givenCommandLineArguments.length > 2) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = taskTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var type = _step.value;

      if (runtimeInformation.givenCommandLineArguments[2] === type || debug && type == 'debug') {
        for (var _i = 0, _arr = [configuration, specificConfiguration]; _i < _arr.length; _i++) {
          var configurationTarget = _arr[_i];
          if ((0, _typeof2["default"])(configurationTarget[type]) === 'object') _clientnode["default"].extend(true, _clientnode["default"].modifyObject(configurationTarget, configurationTarget[type]), configurationTarget[type]);
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
} // /// endregion
// /// region clear task type specific configurations


for (var _i2 = 0, _taskTypes = taskTypes; _i2 < _taskTypes.length; _i2++) {
  var _type3 = _taskTypes[_i2];

  for (var _i3 = 0, _arr2 = [configuration, specificConfiguration]; _i3 < _arr2.length; _i3++) {
    var _configurationTarget = _arr2[_i3];
    if (Object.prototype.hasOwnProperty.call(_configurationTarget, _type3) && (0, _typeof2["default"])(_configurationTarget[_type3]) === 'object') delete _configurationTarget[_type3];
  }
} // /// endregion
// // endregion
// / endregion


_clientnode["default"].extend(true, _clientnode["default"].modifyObject(_clientnode["default"].modifyObject(configuration, specificConfiguration), runtimeInformation), specificConfiguration, runtimeInformation);

var result = null;
if (runtimeInformation.givenCommandLineArguments.length > 3) result = _clientnode["default"].stringParseEncodedObject(runtimeInformation.givenCommandLineArguments[runtimeInformation.givenCommandLineArguments.length - 1], configuration, 'configuration');

if ((0, _typeof2["default"])(result) === 'object' && result !== null) {
  if (Object.prototype.hasOwnProperty.call(result, '__reference__')) {
    var referenceNames = [].concat(result.__reference__);
    delete result.__reference__;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = referenceNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _name = _step2.value;

        _clientnode["default"].extend(true, result, configuration[_name]);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  _clientnode["default"].extend(true, _clientnode["default"].modifyObject(configuration, result), result);
} // Removing comments (default key name to delete is "#").


configuration = _clientnode["default"].removeKeys(configuration); // endregion
// / region determine existing pre compiled dll manifests file paths

configuration.dllManifestFilePaths = [];

if (_clientnode["default"].isDirectorySync(configuration.path.target.base)) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = _fs["default"].readdirSync(configuration.path.target.base)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var fileName = _step3.value;
      if (/^.*\.dll-manifest\.json$/.exec(fileName)) configuration.dllManifestFilePaths.push(_path["default"].resolve(configuration.path.target.base, fileName));
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
        _iterator3["return"]();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
} // / endregion
// / region build absolute paths


configuration.path.base = _path["default"].resolve(configuration.path.context, configuration.path.base);

for (var key in configuration.path) {
  if (Object.prototype.hasOwnProperty.call(configuration.path, key) && key !== 'base' && typeof configuration.path[key] === 'string') configuration.path[key] = _path["default"].resolve(configuration.path.base, configuration.path[key]) + '/';else if (key !== 'configuration' && _clientnode["default"].isPlainObject(configuration.path[key])) {
    configuration.path[key].base = _path["default"].resolve(configuration.path.base, configuration.path[key].base);

    for (var subKey in configuration.path[key]) {
      if (Object.prototype.hasOwnProperty.call(configuration.path[key], subKey) && !['base', 'public'].includes(subKey) && typeof configuration.path[key][subKey] === 'string') configuration.path[key][subKey] = _path["default"].resolve(configuration.path[key].base, configuration.path[key][subKey]) + '/';else if (_clientnode["default"].isPlainObject(configuration.path[key][subKey])) {
        configuration.path[key][subKey].base = _path["default"].resolve(configuration.path[key].base, configuration.path[key][subKey].base);

        for (var subSubKey in configuration.path[key][subKey]) {
          if (Object.prototype.hasOwnProperty.call(configuration.path[key][subKey], subSubKey) && subSubKey !== 'base' && typeof configuration.path[key][subKey][subSubKey] === 'string') configuration.path[key][subKey][subSubKey] = _path["default"].resolve(configuration.path[key][subKey].base, configuration.path[key][subKey][subSubKey]) + '/';
        }
      }
    }
  }
} // / endregion


var now = new Date();

var resolvedConfiguration = _clientnode["default"].evaluateDynamicDataStructure(configuration, {
  currentPath: process.cwd(),
  fileSystem: _fs["default"],
  Helper: _helper["default"],
  isDLLUseful: 2 < configuration.givenCommandLineArguments.length && (['build:dll', 'watch:dll'].includes(configuration.givenCommandLineArguments[2]) || configuration.dllManifestFilePaths.length && ['build', 'serve', 'test:browser'].includes(configuration.givenCommandLineArguments[2])),
  path: _path["default"],

  /* eslint-disable no-eval */
  require: eval('require'),

  /* eslint-enable no-eval */
  Tools: _clientnode["default"],
  webOptimizerPath: __dirname,
  now: now,
  nowUTCTimestamp: _clientnode["default"].numberGetUTCTimestamp(now)
}); // region consolidate file specific build configuration
// Apply default file level build configurations to all file type specific
// ones.


exports.resolvedConfiguration = resolvedConfiguration;
var defaultConfiguration = resolvedConfiguration.buildContext.types["default"];
delete resolvedConfiguration.buildContext.types["default"];

for (var _type in resolvedConfiguration.buildContext.types) {
  if (Object.prototype.hasOwnProperty.call(resolvedConfiguration.buildContext.types, _type)) resolvedConfiguration.buildContext.types[_type] = _clientnode["default"].extend(true, {}, defaultConfiguration, _clientnode["default"].extend(true, {
    extension: _type
  }, resolvedConfiguration.buildContext.types[_type], {
    type: _type
  }));
} // endregion
// region resolve module location and determine which asset types are needed


resolvedConfiguration.module.locations = _helper["default"].determineModuleLocations(resolvedConfiguration.injection.entry, resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, {
  file: resolvedConfiguration.extensions.file.internal,
  module: resolvedConfiguration.extensions.module
}, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base);
resolvedConfiguration.injection = _helper["default"].resolveInjection(resolvedConfiguration.injection, _helper["default"].resolveBuildConfigurationFilePaths(resolvedConfiguration.buildContext.types, resolvedConfiguration.path.source.asset.base, _helper["default"].normalizePaths(resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
  return _path["default"].resolve(resolvedConfiguration.path.context, filePath);
}).filter(function (filePath) {
  return !resolvedConfiguration.path.context.startsWith(filePath);
})), resolvedConfiguration["package"].main.fileNames), resolvedConfiguration.injection.autoExclude, resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.extensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore);
resolvedConfiguration.injection.entry = {
  given: resolvedConfiguration.injection.entry,
  normalized: _helper["default"].resolveModulesInFolders(_helper["default"].normalizeEntryInjection(resolvedConfiguration.injection.entry), resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
    return _path["default"].resolve(resolvedConfiguration.path.context, filePath);
  }).filter(function (filePath) {
    return !resolvedConfiguration.path.context.startsWith(filePath);
  }))
};
resolvedConfiguration.needed = {
  javaScript: configuration.debug && ['serve', 'test:browser'].includes(resolvedConfiguration.givenCommandLineArguments[2])
};

for (var chunkName in resolvedConfiguration.injection.entry.normalized) {
  if (Object.prototype.hasOwnProperty.call(resolvedConfiguration.injection.entry.normalized, chunkName)) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = resolvedConfiguration.injection.entry.normalized[chunkName][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var moduleID = _step4.value;

        var _filePath = _helper["default"].determineModuleFilePath(moduleID, resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, {
          file: resolvedConfiguration.extensions.file.internal,
          module: resolvedConfiguration.extensions.module
        }, resolvedConfiguration.path.context,
        /*
            NOTE: We doesn't use
            "resolvedConfiguration.path.source.asset.base" because we
            have already resolve all module ids.
        */
        './', resolvedConfiguration.path.ignore, resolvedConfiguration.module.directoryNames, resolvedConfiguration["package"].main.fileNames, resolvedConfiguration["package"].main.propertyNames, resolvedConfiguration["package"].aliasPropertyNames, resolvedConfiguration.encoding);

        var _type2 = null;
        if (_filePath) _type2 = _helper["default"].determineAssetType(_filePath, resolvedConfiguration.buildContext.types, resolvedConfiguration.path);else throw new Error("Given request \"".concat(moduleID, "\" couldn't be resolved."));
        if (_type2) resolvedConfiguration.needed[_type2] = true;
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
          _iterator4["return"]();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }
} // endregion
// region adding special aliases
// NOTE: This alias couldn't be set in the "package.json" file since this would
// result in an endless loop.


resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader = '';
var _iteratorNormalCompletion5 = true;
var _didIteratorError5 = false;
var _iteratorError5 = undefined;

try {
  for (var _iterator5 = resolvedConfiguration.files.defaultHTML.template.use[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
    var loader = _step5.value;
    if (resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader) resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += '!';
    resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += loader.loader;
    if (loader.options) resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += '?' + _clientnode["default"].convertCircularObjectToJSON(loader.options);
  }
} catch (err) {
  _didIteratorError5 = true;
  _iteratorError5 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
      _iterator5["return"]();
    }
  } finally {
    if (_didIteratorError5) {
      throw _iteratorError5;
    }
  }
}

resolvedConfiguration.module.aliases.webOptimizerDefaultTemplateFilePath$ = resolvedConfiguration.files.defaultHTML.template.filePath; // endregion
// region apply html webpack plugin workarounds

/*
    NOTE: Provides a workaround to handle a bug with chained loader
    configurations.
*/

var _iteratorNormalCompletion6 = true;
var _didIteratorError6 = false;
var _iteratorError6 = undefined;

try {
  for (var _iterator6 = resolvedConfiguration.files.html[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
    var htmlConfiguration = _step6.value;

    _clientnode["default"].extend(true, htmlConfiguration, resolvedConfiguration.files.defaultHTML);

    htmlConfiguration.template.request = htmlConfiguration.template.filePath;

    if (htmlConfiguration.template.filePath !== resolvedConfiguration.files.defaultHTML.template.filePath && htmlConfiguration.template.options) {
      var requestString = new String(htmlConfiguration.template.request + _clientnode["default"].convertCircularObjectToJSON(htmlConfiguration.template.options));
      /* eslint-disable @typescript-eslint/unbound-method */

      requestString.replace = function (value) {
        return function () {
          return value;
        };
      }(htmlConfiguration.template.filePath);
      /* eslint-enable @typescript-eslint/unbound-method */


      htmlConfiguration.template.request = requestString;
    }
  } // endregion

} catch (err) {
  _didIteratorError6 = true;
  _iteratorError6 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
      _iterator6["return"]();
    }
  } finally {
    if (_didIteratorError6) {
      throw _iteratorError6;
    }
  }
}

var _default = resolvedConfiguration; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

exports["default"] = _default;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQTRCLFdBQTVCLENBQXdDLFFBQXhDLENBQWlELFFBRHJELEMsQ0FFQTtBQUNBOztBQUNBOzs7Ozs7Ozs7O0FBSUEsd0JBQWdDLHFCQUFxQixDQUFDLEtBQXRCLENBQTRCLElBQTVELG1JQUFrRTtBQUFBLFFBQXZELGlCQUF1RDs7QUFDOUQsMkJBQU0sTUFBTixDQUNJLElBREosRUFDVSxpQkFEVixFQUM2QixxQkFBcUIsQ0FBQyxLQUF0QixDQUE0QixXQUR6RDs7QUFFQSxJQUFBLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLE9BQTNCLEdBQXFDLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLFFBQWhFOztBQUNBLFFBQ0ksaUJBQWlCLENBQUMsUUFBbEIsQ0FBMkIsUUFBM0IsS0FDSSxxQkFBcUIsQ0FBQyxLQUF0QixDQUE0QixXQUE1QixDQUF3QyxRQUF4QyxDQUFpRCxRQURyRCxJQUVBLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLE9BSC9CLEVBSUU7QUFDRSxVQUFNLGFBQW9CLEdBQUcsSUFBSSxNQUFKLENBQ3pCLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLE9BQTNCLEdBQ0EsdUJBQU0sMkJBQU4sQ0FDSSxpQkFBaUIsQ0FBQyxRQUFsQixDQUEyQixPQUQvQixDQUZ5QixDQUE3QjtBQU1BOztBQUNBLE1BQUEsYUFBYSxDQUFDLE9BQWQsR0FDSSxVQUFDLEtBQUQ7QUFBQSxlQUEyQjtBQUFBLGlCQUFhLEtBQWI7QUFBQSxTQUEzQjtBQUFBLE9BRG9CLENBRXRCLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLFFBRkwsQ0FBeEI7QUFHQTs7O0FBQ0EsTUFBQSxpQkFBaUIsQ0FBQyxRQUFsQixDQUEyQixPQUEzQixHQUFxQyxhQUFyQztBQUNIO0FBQ0osRyxDQUNEOzs7Ozs7Ozs7Ozs7Ozs7OztlQUNlLHFCLEVBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29uZmlndXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zXG4gICAgbmFtaW5nIDMuMCB1bnBvcnRlZCBsaWNlbnNlLlxuICAgIFNlZSBodHRwczovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzLCB7UGxhaW5PYmplY3R9IGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXInXG4vLyBOT1RFOiBcIntjb25maWd1cmF0aW9uIGFzIG1ldGFDb25maWd1cmF0aW9ufVwiIHdvdWxkIHJlc3VsdCBpbiBhIHJlYWQgb25seVxuLy8gdmFyaWFibGUgbmFtZWQgXCJtZXRhQ29uZmlndXJhdGlvblwiLlxuaW1wb3J0IHtjb25maWd1cmF0aW9uIGFzIGdpdmVuTWV0YUNvbmZpZ3VyYXRpb259IGZyb20gJy4vcGFja2FnZSdcbmltcG9ydCB7XG4gICAgRGVmYXVsdENvbmZpZ3VyYXRpb24sXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBIVE1MQ29uZmlndXJhdGlvbixcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgTWV0YUNvbmZpZ3VyYXRpb24sXG4gICAgUmVzb2x2ZWRDb25maWd1cmF0aW9uXG59IGZyb20gJy4vdHlwZSdcbmNvbnN0IG1ldGFDb25maWd1cmF0aW9uOk1ldGFDb25maWd1cmF0aW9uID0gZ2l2ZW5NZXRhQ29uZmlndXJhdGlvblxuLypcbiAgICBUbyBhc3N1bWUgdG8gZ28gdHdvIGZvbGRlciB1cCBmcm9tIHRoaXMgZmlsZSB1bnRpbCB0aGVyZSBpcyBub1xuICAgIFwibm9kZV9tb2R1bGVzXCIgcGFyZW50IGZvbGRlciBpcyB1c3VhbGx5IHJlc2lsaWVudCBhZ2FpbiBkZWFsaW5nIHdpdGhcbiAgICBwcm9qZWN0cyB3aGVyZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGlzbid0IHRoZSBwcm9qZWN0cyBkaXJlY3RvcnkgYW5kXG4gICAgdGhpcyBsaWJyYXJ5IGlzIGxvY2F0ZWQgYXMgYSBuZXN0ZWQgZGVwZW5kZW5jeS5cbiovXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IF9fZGlybmFtZVxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdtYWluJ1xud2hpbGUgKHRydWUpIHtcbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICcuLi8uLi8nKVxuICAgIGlmIChwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHRcbiAgICApKSAhPT0gJ25vZGVfbW9kdWxlcycpXG4gICAgICAgIGJyZWFrXG59XG5pZiAoXG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpID09PSAnbm9kZV9tb2R1bGVzJyB8fFxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSA9PT0gJy5zdGFnaW5nJyAmJlxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkpID09PSAnbm9kZV9tb2R1bGVzJ1xuKSB7XG4gICAgLypcbiAgICAgICAgTk9URTogSWYgd2UgYXJlIGRlYWxpbmcgd2FzIGEgZGVwZW5kZW5jeSBwcm9qZWN0IHVzZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgICAgICBhcyBjb250ZXh0LlxuICAgICovXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdkZXBlbmRlbmN5J1xufSBlbHNlXG4gICAgLypcbiAgICAgICAgTk9URTogSWYgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgcmVmZXJlbmNlcyB0aGlzIGZpbGUgdmlhIGFcbiAgICAgICAgbGlua2VkIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyIHVzaW5nIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgYXMgY29udGV4dFxuICAgICAgICBpcyBhIGJldHRlciBhc3N1bXB0aW9uIHRoYW4gdHdvIGZvbGRlcnMgdXAgdGhlIGhpZXJhcmNoeS5cbiAgICAqL1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGZpbGVTeXN0ZW0ubHN0YXRTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbm9kZV9tb2R1bGVzJykpXG4gICAgICAgICAgICAgICAgLmlzU3ltYm9saWNMaW5rKClcbiAgICAgICAgKVxuICAgICAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gY29udGludWUgcmVnYXJkbGVzcyBvZiBlcnJvclxuICAgIH1cbmxldCBzcGVjaWZpY0NvbmZpZ3VyYXRpb246UGxhaW5PYmplY3RcbnRyeSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tZXZhbCAqL1xuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbiA9IGV2YWwoJ3JlcXVpcmUnKShwYXRoLmpvaW4oXG4gICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0LCAncGFja2FnZScpKVxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tZXZhbCAqL1xufSBjYXRjaCAoZXJyb3IpIHtcbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSB7bmFtZTogJ21vY2t1cCd9XG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG59XG5jb25zdCBuYW1lOnN0cmluZyA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi5uYW1lXG5zcGVjaWZpY0NvbmZpZ3VyYXRpb24gPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24ud2ViT3B0aW1pemVyIHx8IHt9XG5zcGVjaWZpY0NvbmZpZ3VyYXRpb24ubmFtZSA9IG5hbWVcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGRldGVybWluZSBkZWJ1ZyBtb2RlXG4vLyBOT1RFOiBHaXZlbiBub2RlIGNvbW1hbmQgbGluZSBhcmd1bWVudHMgcmVzdWx0cyBpbiBcIm5wbV9jb25maWdfKlwiXG4vLyBlbnZpcm9ubWVudCB2YXJpYWJsZXMuXG5sZXQgZGVidWc6Ym9vbGVhbiA9IG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQuZGVidWdcbmlmICh0eXBlb2Ygc3BlY2lmaWNDb25maWd1cmF0aW9uLmRlYnVnID09PSAnYm9vbGVhbicpXG4gICAgZGVidWcgPSBzcGVjaWZpY0NvbmZpZ3VyYXRpb24uZGVidWdcbmVsc2UgaWYgKFxuICAgIHByb2Nlc3MuZW52Lm5wbV9jb25maWdfZGV2ID09PSAndHJ1ZScgfHxcbiAgICBbJ2RlYnVnJywgJ2RldicsICdkZXZlbG9wbWVudCddLmluY2x1ZGVzKHByb2Nlc3MuZW52Lk5PREVfRU5WKVxuKVxuICAgIGRlYnVnID0gdHJ1ZVxuaWYgKGRlYnVnKVxuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID0gJ2RldmVsb3BtZW50J1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbG9hZGluZyBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cbm1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ICs9ICcvJ1xuLy8gTWVyZ2VzIGZpbmFsIGRlZmF1bHQgY29uZmlndXJhdGlvbiBvYmplY3QgZGVwZW5kaW5nIG9uIGdpdmVuIHRhcmdldFxuLy8gZW52aXJvbm1lbnQuXG5jb25zdCBsaWJyYXJ5Q29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IG1ldGFDb25maWd1cmF0aW9uLmxpYnJhcnlcbmxldCBjb25maWd1cmF0aW9uOkRlZmF1bHRDb25maWd1cmF0aW9uXG5pZiAoZGVidWcpXG4gICAgY29uZmlndXJhdGlvbiA9IFRvb2xzLmV4dGVuZChcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgVG9vbHMubW9kaWZ5T2JqZWN0KG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQsIG1ldGFDb25maWd1cmF0aW9uLmRlYnVnKSxcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVidWdcbiAgICApXG5lbHNlXG4gICAgY29uZmlndXJhdGlvbiA9IG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHRcbmNvbmZpZ3VyYXRpb24uZGVidWcgPSBkZWJ1Z1xuaWYgKHR5cGVvZiBjb25maWd1cmF0aW9uLmxpYnJhcnkgPT09ICdvYmplY3QnKVxuICAgIFRvb2xzLmV4dGVuZChcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgVG9vbHMubW9kaWZ5T2JqZWN0KGxpYnJhcnlDb25maWd1cmF0aW9uLCBjb25maWd1cmF0aW9uLmxpYnJhcnkpLFxuICAgICAgICBjb25maWd1cmF0aW9uLmxpYnJhcnlcbiAgICApXG5pZiAoXG4gICAgJ2xpYnJhcnknIGluIHNwZWNpZmljQ29uZmlndXJhdGlvbiAmJlxuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSB0cnVlIHx8XG4gICAgKFxuICAgICAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbi5saWJyYXJ5ID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgISgnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uKVxuICAgICkgJiZcbiAgICBjb25maWd1cmF0aW9uLmxpYnJhcnlcbilcbiAgICBjb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kKFxuICAgICAgICB0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoY29uZmlndXJhdGlvbiwgbGlicmFyeUNvbmZpZ3VyYXRpb24pLFxuICAgICAgICBsaWJyYXJ5Q29uZmlndXJhdGlvblxuICAgIClcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIG1lcmdpbmcgYW5kIGV2YWx1YXRpbmcgdGFzayBzcGVjaWZpYyBhbmQgZHluYW1pYyBjb25maWd1cmF0aW9uc1xuLy8gLyByZWdpb24gbG9hZCBhZGRpdGlvbmFsIGR5bmFtaWNhbGx5IGdpdmVuIGNvbmZpZ3VyYXRpb25cbmxldCBjb3VudCA9IDBcbmxldCBmaWxlUGF0aDpudWxsfHN0cmluZyA9IG51bGxcbndoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgbmV3RmlsZVBhdGg6c3RyaW5nID0gY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQgK1xuICAgICAgICBgLmR5bmFtaWNDb25maWd1cmF0aW9uLSR7Y291bnR9Lmpzb25gXG4gICAgaWYgKCFUb29scy5pc0ZpbGVTeW5jKG5ld0ZpbGVQYXRoKSlcbiAgICAgICAgYnJlYWtcbiAgICBmaWxlUGF0aCA9IG5ld0ZpbGVQYXRoXG4gICAgY291bnQgKz0gMVxufVxubGV0IHJ1bnRpbWVJbmZvcm1hdGlvbjpQbGFpbk9iamVjdCA9IHtnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOiBwcm9jZXNzLmFyZ3Z9XG5pZiAoZmlsZVBhdGgpIHtcbiAgICBydW50aW1lSW5mb3JtYXRpb24gPSBKU09OLnBhcnNlKGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKFxuICAgICAgICBmaWxlUGF0aCwge2VuY29kaW5nOiBjb25maWd1cmF0aW9uLmVuY29kaW5nfVxuICAgICkpXG4gICAgZmlsZVN5c3RlbS51bmxpbmsoZmlsZVBhdGgsIChlcnJvcjpFcnJvcnxudWxsKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxufVxuLy8gLy8gcmVnaW9uIHRhc2sgc3BlY2lmaWMgY29uZmlndXJhdGlvblxuLy8gLy8vIHJlZ2lvbiBhcHBseSB0YXNrIHR5cGUgc3BlY2lmaWMgY29uZmlndXJhdGlvblxuY29uc3QgdGFza1R5cGVzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgJ2J1aWxkJywgJ2RlYnVnJywgJ2RvY3VtZW50JywgJ3NlcnZlJywgJ3Rlc3QnLCAndGVzdDpicm93c2VyJ11cbmlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKVxuICAgIGZvciAoY29uc3QgdHlwZSBvZiB0YXNrVHlwZXMpXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSB0eXBlIHx8XG4gICAgICAgICAgICBkZWJ1ZyAmJlxuICAgICAgICAgICAgdHlwZSA9PSAnZGVidWcnXG4gICAgICAgIClcbiAgICAgICAgICAgIGZvciAoY29uc3QgY29uZmlndXJhdGlvblRhcmdldCBvZiBbXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgc3BlY2lmaWNDb25maWd1cmF0aW9uXG4gICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlndXJhdGlvblRhcmdldFt0eXBlXSA9PT0gJ29iamVjdCcpXG4gICAgICAgICAgICAgICAgICAgIFRvb2xzLmV4dGVuZChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBUb29scy5tb2RpZnlPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblRhcmdldCwgY29uZmlndXJhdGlvblRhcmdldFt0eXBlXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uVGFyZ2V0W3R5cGVdXG4gICAgICAgICAgICAgICAgICAgIClcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gY2xlYXIgdGFzayB0eXBlIHNwZWNpZmljIGNvbmZpZ3VyYXRpb25zXG5mb3IgKGNvbnN0IHR5cGUgb2YgdGFza1R5cGVzKVxuICAgIGZvciAoY29uc3QgY29uZmlndXJhdGlvblRhcmdldCBvZiBbY29uZmlndXJhdGlvbiwgc3BlY2lmaWNDb25maWd1cmF0aW9uXSlcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbmZpZ3VyYXRpb25UYXJnZXQsIHR5cGUpICYmXG4gICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvblRhcmdldFt0eXBlXSA9PT0gJ29iamVjdCdcbiAgICAgICAgKVxuICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb25UYXJnZXRbdHlwZV1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLyBlbmRyZWdpb25cblRvb2xzLmV4dGVuZChcbiAgICB0cnVlLFxuICAgIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgVG9vbHMubW9kaWZ5T2JqZWN0KGNvbmZpZ3VyYXRpb24sIHNwZWNpZmljQ29uZmlndXJhdGlvbiksXG4gICAgICAgIHJ1bnRpbWVJbmZvcm1hdGlvbiksXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLFxuICAgIHJ1bnRpbWVJbmZvcm1hdGlvblxuKVxubGV0IHJlc3VsdDpudWxsfFBsYWluT2JqZWN0ID0gbnVsbFxuaWYgKHJ1bnRpbWVJbmZvcm1hdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDMpXG4gICAgcmVzdWx0ID0gVG9vbHMuc3RyaW5nUGFyc2VFbmNvZGVkT2JqZWN0KFxuICAgICAgICBydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1tydW50aW1lSW5mb3JtYXRpb25cbiAgICAgICAgICAgIC5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAtIDFdLFxuICAgICAgICBjb25maWd1cmF0aW9uLCAnY29uZmlndXJhdGlvbicpXG5pZiAodHlwZW9mIHJlc3VsdCA9PT0gJ29iamVjdCcgJiYgcmVzdWx0ICE9PSBudWxsKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHQsICdfX3JlZmVyZW5jZV9fJykpIHtcbiAgICAgICAgY29uc3QgcmVmZXJlbmNlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdLmNvbmNhdChyZXN1bHQuX19yZWZlcmVuY2VfXylcbiAgICAgICAgZGVsZXRlIHJlc3VsdC5fX3JlZmVyZW5jZV9fXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiByZWZlcmVuY2VOYW1lcylcbiAgICAgICAgICAgIFRvb2xzLmV4dGVuZCh0cnVlLCByZXN1bHQsIGNvbmZpZ3VyYXRpb25bbmFtZV0pXG4gICAgfVxuICAgIFRvb2xzLmV4dGVuZCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoY29uZmlndXJhdGlvbiwgcmVzdWx0KSwgcmVzdWx0KVxufVxuLy8gUmVtb3ZpbmcgY29tbWVudHMgKGRlZmF1bHQga2V5IG5hbWUgdG8gZGVsZXRlIGlzIFwiI1wiKS5cbmNvbmZpZ3VyYXRpb24gPSBUb29scy5yZW1vdmVLZXlzKGNvbmZpZ3VyYXRpb24pXG4vLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGRldGVybWluZSBleGlzdGluZyBwcmUgY29tcGlsZWQgZGxsIG1hbmlmZXN0cyBmaWxlIHBhdGhzXG5jb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzID0gW11cbmlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMoY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKSlcbiAgICBmb3IgKGNvbnN0IGZpbGVOYW1lIG9mIGZpbGVTeXN0ZW0ucmVhZGRpclN5bmMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZVxuICAgICkpXG4gICAgICAgIGlmICgvXi4qXFwuZGxsLW1hbmlmZXN0XFwuanNvbiQvLmV4ZWMoZmlsZU5hbWUpKVxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5wdXNoKHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIGZpbGVOYW1lKSlcbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBidWlsZCBhYnNvbHV0ZSBwYXRoc1xuY29uZmlndXJhdGlvbi5wYXRoLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlKVxuZm9yIChjb25zdCBrZXkgaW4gY29uZmlndXJhdGlvbi5wYXRoKVxuICAgIGlmIChcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbmZpZ3VyYXRpb24ucGF0aCwga2V5KSAmJlxuICAgICAgICBrZXkgIT09ICdiYXNlJyAmJlxuICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPT09ICdzdHJpbmcnXG4gICAgKVxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlLCBjb25maWd1cmF0aW9uLnBhdGhba2V5XVxuICAgICAgICApICsgJy8nXG4gICAgZWxzZSBpZiAoXG4gICAgICAgIGtleSAhPT0gJ2NvbmZpZ3VyYXRpb24nICYmXG4gICAgICAgIFRvb2xzLmlzUGxhaW5PYmplY3QoY29uZmlndXJhdGlvbi5wYXRoW2tleV0pXG4gICAgKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSlcbiAgICAgICAgZm9yIChjb25zdCBzdWJLZXkgaW4gY29uZmlndXJhdGlvbi5wYXRoW2tleV0pXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XSwgc3ViS2V5KSAmJlxuICAgICAgICAgICAgICAgICFbJ2Jhc2UnLCAncHVibGljJ10uaW5jbHVkZXMoc3ViS2V5KSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1cbiAgICAgICAgICAgICAgICApICsgJy8nXG4gICAgICAgICAgICBlbHNlIGlmIChUb29scy5pc1BsYWluT2JqZWN0KGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0pKSB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5iYXNlID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmJhc2UpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJTdWJLZXkgaW4gY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0sIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViU3ViS2V5ICE9PSAnYmFzZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtzdWJTdWJLZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtzdWJTdWJLZXldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICcvJ1xuICAgICAgICAgICAgfVxuICAgIH1cbi8vIC8gZW5kcmVnaW9uXG5jb25zdCBub3c6RGF0ZSA9IG5ldyBEYXRlKClcbmV4cG9ydCBjb25zdCByZXNvbHZlZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRDb25maWd1cmF0aW9uID1cbiAgICBUb29scy5ldmFsdWF0ZUR5bmFtaWNEYXRhU3RydWN0dXJlKFxuICAgICAgICBjb25maWd1cmF0aW9uLFxuICAgICAgICB7XG4gICAgICAgICAgICBjdXJyZW50UGF0aDogcHJvY2Vzcy5jd2QoKSxcbiAgICAgICAgICAgIGZpbGVTeXN0ZW0sXG4gICAgICAgICAgICBIZWxwZXIsXG4gICAgICAgICAgICBpc0RMTFVzZWZ1bDpcbiAgICAgICAgICAgICAgICAyIDwgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgWydidWlsZDpkbGwnLCAnd2F0Y2g6ZGxsJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pIHx8XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZGxsTWFuaWZlc3RGaWxlUGF0aHMubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgIFsnYnVpbGQnLCAnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBwYXRoLFxuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tZXZhbCAqL1xuICAgICAgICAgICAgcmVxdWlyZTogZXZhbCgncmVxdWlyZScpLFxuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBuby1ldmFsICovXG4gICAgICAgICAgICBUb29scyxcbiAgICAgICAgICAgIHdlYk9wdGltaXplclBhdGg6IF9fZGlybmFtZSxcbiAgICAgICAgICAgIG5vdyxcbiAgICAgICAgICAgIG5vd1VUQ1RpbWVzdGFtcDogVG9vbHMubnVtYmVyR2V0VVRDVGltZXN0YW1wKG5vdylcbiAgICAgICAgfVxuICAgIClcbi8vIHJlZ2lvbiBjb25zb2xpZGF0ZSBmaWxlIHNwZWNpZmljIGJ1aWxkIGNvbmZpZ3VyYXRpb25cbi8vIEFwcGx5IGRlZmF1bHQgZmlsZSBsZXZlbCBidWlsZCBjb25maWd1cmF0aW9ucyB0byBhbGwgZmlsZSB0eXBlIHNwZWNpZmljXG4vLyBvbmVzLlxuY29uc3QgZGVmYXVsdENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPVxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXMuZGVmYXVsdFxuZGVsZXRlIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXMuZGVmYXVsdFxuZm9yIChjb25zdCB0eXBlIGluIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXMpXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlcywgdHlwZVxuICAgICkpXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXNbdHlwZV0gPSBUb29scy5leHRlbmQoXG4gICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICBkZWZhdWx0Q29uZmlndXJhdGlvbixcbiAgICAgICAgICAgIFRvb2xzLmV4dGVuZChcbiAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgIHtleHRlbnNpb246IHR5cGV9LFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXNbdHlwZV0sXG4gICAgICAgICAgICAgICAge3R5cGV9XG4gICAgICAgICAgICApXG4gICAgICAgIClcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHJlc29sdmUgbW9kdWxlIGxvY2F0aW9uIGFuZCBkZXRlcm1pbmUgd2hpY2ggYXNzZXQgdHlwZXMgYXJlIG5lZWRlZFxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnksXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICB7XG4gICAgICAgIGZpbGU6IHJlc29sdmVkQ29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW50ZXJuYWwsXG4gICAgICAgIG1vZHVsZTogcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMubW9kdWxlXG4gICAgfSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlXG4pXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uID0gSGVscGVyLnJlc29sdmVJbmplY3Rpb24oXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbixcbiAgICBIZWxwZXIucmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlcyxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgIEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUocmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgIXJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aClcbiAgICAgICAgICAgIClcbiAgICAgICAgKSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXNcbiAgICApLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uYXV0b0V4Y2x1ZGUsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucyxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZVxuKVxucmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeSA9IHtcbiAgICBnaXZlbjogcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeSxcbiAgICBub3JtYWxpemVkOiBIZWxwZXIucmVzb2x2ZU1vZHVsZXNJbkZvbGRlcnMoXG4gICAgICAgIEhlbHBlci5ub3JtYWxpemVFbnRyeUluamVjdGlvbihyZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5KSxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+XG4gICAgICAgICAgICBwYXRoLnJlc29sdmUocmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpXG4gICAgICAgIClcbiAgICApXG59XG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkID0ge1xuICAgIGphdmFTY3JpcHQ6XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZGVidWcgJiZcbiAgICAgICAgWydzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgIClcbn1cbmZvciAoY29uc3QgY2h1bmtOYW1lIGluIHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZClcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQsIGNodW5rTmFtZVxuICAgICkpXG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBtb2R1bGVJRCBvZlxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpudWxsfHN0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbCxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogV2UgZG9lc24ndCB1c2VcbiAgICAgICAgICAgICAgICAgICAgXCJyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZVwiIGJlY2F1c2Ugd2VcbiAgICAgICAgICAgICAgICAgICAgaGF2ZSBhbHJlYWR5IHJlc29sdmUgYWxsIG1vZHVsZSBpZHMuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAnLi8nLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmVuY29kaW5nXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBsZXQgdHlwZTpudWxsfHN0cmluZyA9IG51bGxcbiAgICAgICAgICAgIGlmIChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICB0eXBlID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgYEdpdmVuIHJlcXVlc3QgXCIke21vZHVsZUlEfVwiIGNvdWxkbid0IGJlIHJlc29sdmVkLmApXG4gICAgICAgICAgICBpZiAodHlwZSlcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkW3R5cGVdID0gdHJ1ZVxuICAgICAgICB9XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhZGRpbmcgc3BlY2lhbCBhbGlhc2VzXG4vLyBOT1RFOiBUaGlzIGFsaWFzIGNvdWxkbid0IGJlIHNldCBpbiB0aGUgXCJwYWNrYWdlLmpzb25cIiBmaWxlIHNpbmNlIHRoaXMgd291bGRcbi8vIHJlc3VsdCBpbiBhbiBlbmRsZXNzIGxvb3AuXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXMud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciA9ICcnXG5mb3IgKGNvbnN0IGxvYWRlciBvZiByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUudXNlKSB7XG4gICAgaWYgKFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyXG4gICAgKVxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyICs9ICchJ1xuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlc1xuICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciArPSBsb2FkZXIubG9hZGVyXG4gICAgaWYgKGxvYWRlci5vcHRpb25zKVxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgICAgIC53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyICs9ICc/JyArXG4gICAgICAgICAgICAgICAgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKGxvYWRlci5vcHRpb25zKVxufVxucmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVQYXRoJCA9XG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBhcHBseSBodG1sIHdlYnBhY2sgcGx1Z2luIHdvcmthcm91bmRzXG4vKlxuICAgIE5PVEU6IFByb3ZpZGVzIGEgd29ya2Fyb3VuZCB0byBoYW5kbGUgYSBidWcgd2l0aCBjaGFpbmVkIGxvYWRlclxuICAgIGNvbmZpZ3VyYXRpb25zLlxuKi9cbmZvciAoY29uc3QgaHRtbENvbmZpZ3VyYXRpb24gb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmh0bWwpIHtcbiAgICBUb29scy5leHRlbmQoXG4gICAgICAgIHRydWUsIGh0bWxDb25maWd1cmF0aW9uLCByZXNvbHZlZENvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwpXG4gICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdCA9IGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoXG4gICAgaWYgKFxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aCAhPT1cbiAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS5maWxlUGF0aCAmJlxuICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5vcHRpb25zXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RTdHJpbmc6c3RyaW5nID0gbmV3IFN0cmluZyhcbiAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3QgK1xuICAgICAgICAgICAgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLm9wdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvdW5ib3VuZC1tZXRob2QgKi9cbiAgICAgICAgcmVxdWVzdFN0cmluZy5yZXBsYWNlID0gKFxuICAgICAgICAgICAgKHZhbHVlOnN0cmluZyk6RnVuY3Rpb24gPT4gKCk6c3RyaW5nID0+IHZhbHVlXG4gICAgICAgICkoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L3VuYm91bmQtbWV0aG9kICovXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3QgPSByZXF1ZXN0U3RyaW5nXG4gICAgfVxufVxuLy8gZW5kcmVnaW9uXG5leHBvcnQgZGVmYXVsdCByZXNvbHZlZENvbmZpZ3VyYXRpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19