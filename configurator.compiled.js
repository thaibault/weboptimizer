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

var _helper = _interopRequireDefault(require("./helper.compiled"));

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
  } catch (error) {}

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
    if (_configurationTarget.hasOwnProperty(_type3) && (0, _typeof2["default"])(_configurationTarget[_type3]) === 'object') delete _configurationTarget[_type3];
  }
} // /// endregion
// // endregion
// / endregion


_clientnode["default"].extend(true, _clientnode["default"].modifyObject(_clientnode["default"].modifyObject(configuration, specificConfiguration), runtimeInformation), specificConfiguration, runtimeInformation);

var result = null;
if (runtimeInformation.givenCommandLineArguments.length > 3) result = _clientnode["default"].stringParseEncodedObject(runtimeInformation.givenCommandLineArguments[runtimeInformation.givenCommandLineArguments.length - 1], configuration, 'configuration');

if ((0, _typeof2["default"])(result) === 'object' && result !== null) {
  if (result.hasOwnProperty('__reference__')) {
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
      if (fileName.match(/^.*\.dll-manifest\.json$/)) configuration.dllManifestFilePaths.push(_path["default"].resolve(configuration.path.target.base, fileName));
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
  if (configuration.path.hasOwnProperty(key) && key !== 'base' && typeof configuration.path[key] === 'string') configuration.path[key] = _path["default"].resolve(configuration.path.base, configuration.path[key]) + '/';else if (key !== 'configuration' && _clientnode["default"].isPlainObject(configuration.path[key])) {
    configuration.path[key].base = _path["default"].resolve(configuration.path.base, configuration.path[key].base);

    for (var subKey in configuration.path[key]) {
      if (configuration.path[key].hasOwnProperty(subKey) && !['base', 'public'].includes(subKey) && typeof configuration.path[key][subKey] === 'string') configuration.path[key][subKey] = _path["default"].resolve(configuration.path[key].base, configuration.path[key][subKey]) + '/';else if (_clientnode["default"].isPlainObject(configuration.path[key][subKey])) {
        configuration.path[key][subKey].base = _path["default"].resolve(configuration.path[key].base, configuration.path[key][subKey].base);

        for (var subSubKey in configuration.path[key][subKey]) {
          if (configuration.path[key][subKey].hasOwnProperty(subSubKey) && subSubKey !== 'base' && typeof configuration.path[key][subKey][subSubKey] === 'string') configuration.path[key][subKey][subSubKey] = _path["default"].resolve(configuration.path[key][subKey].base, configuration.path[key][subKey][subSubKey]) + '/';
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
  // IgnoreTypeCheck
  isDLLUseful: 2 < configuration.givenCommandLineArguments.length && (['build:dll', 'watch:dll'].includes( // IgnoreTypeCheck
  configuration.givenCommandLineArguments[2]) || configuration.dllManifestFilePaths.length && ['build', 'serve', 'test:browser'].includes( // IgnoreTypeCheck
  configuration.givenCommandLineArguments[2])),
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
  if (resolvedConfiguration.buildContext.types.hasOwnProperty(_type)) resolvedConfiguration.buildContext.types[_type] = _clientnode["default"].extend(true, {}, defaultConfiguration, _clientnode["default"].extend(true, {
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
var entryInjection = resolvedConfiguration.injection.entry;
resolvedConfiguration.injection.entry = {
  given: resolvedConfiguration.injection.entry,
  normalized: _helper["default"].resolveModulesInFolders(_helper["default"].normalizeEntryInjection(entryInjection), resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
    return _path["default"].resolve(resolvedConfiguration.path.context, filePath);
  }).filter(function (filePath) {
    return !resolvedConfiguration.path.context.startsWith(filePath);
  }))
};
resolvedConfiguration.needed = {
  javaScript: configuration.debug && ['serve', 'test:browser'].includes(resolvedConfiguration.givenCommandLineArguments[2])
};

for (var chunkName in resolvedConfiguration.injection.entry.normalized) {
  if (resolvedConfiguration.injection.entry.normalized.hasOwnProperty(chunkName)) {
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

        var _type2 = void 0;

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

      requestString.replace = function (string) {
        return function (_search, _replacement) {
          return string;
        };
      }(htmlConfiguration.template.filePath);

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUE0QixXQUR6RDs7QUFFQSxJQUFBLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLE9BQTNCLEdBQXFDLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLFFBQWhFOztBQUNBLFFBQ0ksaUJBQWlCLENBQUMsUUFBbEIsQ0FBMkIsUUFBM0IsS0FDSSxxQkFBcUIsQ0FBQyxLQUF0QixDQUE0QixXQUE1QixDQUF3QyxRQUF4QyxDQUFpRCxRQURyRCxJQUVBLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLE9BSC9CLEVBSUU7QUFDRSxVQUFNLGFBQW9CLEdBQUcsSUFBSSxNQUFKLENBQ3pCLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLE9BQTNCLEdBQ0EsdUJBQU0sMkJBQU4sQ0FDSSxpQkFBaUIsQ0FBQyxRQUFsQixDQUEyQixPQUQvQixDQUZ5QixDQUE3Qjs7QUFJQSxNQUFBLGFBQWEsQ0FBQyxPQUFkLEdBQXlCLFVBQUMsTUFBRDtBQUFBLGVBQTRCLFVBQ2pELE9BRGlELEVBQzFCLFlBRDBCO0FBQUEsaUJBSXpDLE1BSnlDO0FBQUEsU0FBNUI7QUFBQSxPQUFELENBSUosaUJBQWlCLENBQUMsUUFBbEIsQ0FBMkIsUUFKdkIsQ0FBeEI7O0FBS0EsTUFBQSxpQkFBaUIsQ0FBQyxRQUFsQixDQUEyQixPQUEzQixHQUFxQyxhQUFyQztBQUNIO0FBQ0osRyxDQUNEOzs7Ozs7Ozs7Ozs7Ozs7OztlQUNlLHFCLEVBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29uZmlndXJhdG9yLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9uc1xuICAgIG5hbWluZyAzLjAgdW5wb3J0ZWQgbGljZW5zZS5cbiAgICBTZWUgaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHR5cGUge1BsYWluT2JqZWN0fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuLy8gTk9URTogXCJ7Y29uZmlndXJhdGlvbiBhcyBtZXRhQ29uZmlndXJhdGlvbn1cIiB3b3VsZCByZXN1bHQgaW4gYSByZWFkIG9ubHlcbi8vIHZhcmlhYmxlIG5hbWVkIFwibWV0YUNvbmZpZ3VyYXRpb25cIi5cbmltcG9ydCB7Y29uZmlndXJhdGlvbiBhcyBnaXZlbk1ldGFDb25maWd1cmF0aW9ufSBmcm9tICcuL3BhY2thZ2UnXG5pbXBvcnQgdHlwZSB7XG4gICAgRGVmYXVsdENvbmZpZ3VyYXRpb24sXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBIVE1MQ29uZmlndXJhdGlvbixcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgTWV0YUNvbmZpZ3VyYXRpb24sXG4gICAgUmVzb2x2ZWRDb25maWd1cmF0aW9uXG59IGZyb20gJy4vdHlwZSdcbmNvbnN0IG1ldGFDb25maWd1cmF0aW9uOk1ldGFDb25maWd1cmF0aW9uID0gZ2l2ZW5NZXRhQ29uZmlndXJhdGlvblxuLypcbiAgICBUbyBhc3N1bWUgdG8gZ28gdHdvIGZvbGRlciB1cCBmcm9tIHRoaXMgZmlsZSB1bnRpbCB0aGVyZSBpcyBub1xuICAgIFwibm9kZV9tb2R1bGVzXCIgcGFyZW50IGZvbGRlciBpcyB1c3VhbGx5IHJlc2lsaWVudCBhZ2FpbiBkZWFsaW5nIHdpdGhcbiAgICBwcm9qZWN0cyB3aGVyZSBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5IGlzbid0IHRoZSBwcm9qZWN0cyBkaXJlY3RvcnkgYW5kXG4gICAgdGhpcyBsaWJyYXJ5IGlzIGxvY2F0ZWQgYXMgYSBuZXN0ZWQgZGVwZW5kZW5jeS5cbiovXG5tZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IF9fZGlybmFtZVxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdtYWluJ1xud2hpbGUgKHRydWUpIHtcbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICcuLi8uLi8nKVxuICAgIGlmIChwYXRoLmJhc2VuYW1lKHBhdGguZGlybmFtZShcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHRcbiAgICApKSAhPT0gJ25vZGVfbW9kdWxlcycpXG4gICAgICAgIGJyZWFrXG59XG5pZiAoXG4gICAgcGF0aC5iYXNlbmFtZShwYXRoLmRpcm5hbWUocHJvY2Vzcy5jd2QoKSkpID09PSAnbm9kZV9tb2R1bGVzJyB8fFxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHByb2Nlc3MuY3dkKCkpKSA9PT0gJy5zdGFnaW5nJyAmJlxuICAgIHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHBhdGguZGlybmFtZShwcm9jZXNzLmN3ZCgpKSkpID09PSAnbm9kZV9tb2R1bGVzJ1xuKSB7XG4gICAgLypcbiAgICAgICAgTk9URTogSWYgd2UgYXJlIGRlYWxpbmcgd2FzIGEgZGVwZW5kZW5jeSBwcm9qZWN0IHVzZSBjdXJyZW50IGRpcmVjdG9yeVxuICAgICAgICBhcyBjb250ZXh0LlxuICAgICovXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgPSBwcm9jZXNzLmN3ZCgpXG4gICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5jb250ZXh0VHlwZSA9ICdkZXBlbmRlbmN5J1xufSBlbHNlXG4gICAgLypcbiAgICAgICAgTk9URTogSWYgdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgcmVmZXJlbmNlcyB0aGlzIGZpbGUgdmlhIGFcbiAgICAgICAgbGlua2VkIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyIHVzaW5nIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkgYXMgY29udGV4dFxuICAgICAgICBpcyBhIGJldHRlciBhc3N1bXB0aW9uIHRoYW4gdHdvIGZvbGRlcnMgdXAgdGhlIGhpZXJhcmNoeS5cbiAgICAqL1xuICAgIHRyeSB7XG4gICAgICAgIGlmIChmaWxlU3lzdGVtLmxzdGF0U3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoXG4gICAgICAgICksICdub2RlX21vZHVsZXMnKSkuaXNTeW1ib2xpY0xpbmsoKSlcbiAgICAgICAgICAgIG1ldGFDb25maWd1cmF0aW9uLmRlZmF1bHQucGF0aC5jb250ZXh0ID0gcHJvY2Vzcy5jd2QoKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxubGV0IHNwZWNpZmljQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdFxudHJ5IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1ldmFsICovXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uID0gZXZhbCgncmVxdWlyZScpKHBhdGguam9pbihcbiAgICAgICAgbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQsICdwYWNrYWdlJykpXG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1ldmFsICovXG59IGNhdGNoIChlcnJvcikge1xuICAgIHNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHtuYW1lOiAnbW9ja3VwJ31cbiAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWZhdWx0LnBhdGguY29udGV4dCA9IHByb2Nlc3MuY3dkKClcbn1cbmNvbnN0IG5hbWU6c3RyaW5nID0gc3BlY2lmaWNDb25maWd1cmF0aW9uLm5hbWVcbnNwZWNpZmljQ29uZmlndXJhdGlvbiA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi53ZWJPcHRpbWl6ZXIgfHwge31cbnNwZWNpZmljQ29uZmlndXJhdGlvbi5uYW1lID0gbmFtZVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gZGV0ZXJtaW5lIGRlYnVnIG1vZGVcbi8vIE5PVEU6IEdpdmVuIG5vZGUgY29tbWFuZCBsaW5lIGFyZ3VtZW50cyByZXN1bHRzIGluIFwibnBtX2NvbmZpZ18qXCJcbi8vIGVudmlyb25tZW50IHZhcmlhYmxlcy5cbmxldCBkZWJ1Zzpib29sZWFuID0gbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5kZWJ1Z1xuaWYgKHR5cGVvZiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24uZGVidWcgPT09ICdib29sZWFuJylcbiAgICBkZWJ1ZyA9IHNwZWNpZmljQ29uZmlndXJhdGlvbi5kZWJ1Z1xuZWxzZSBpZiAoXG4gICAgcHJvY2Vzcy5lbnYubnBtX2NvbmZpZ19kZXYgPT09ICd0cnVlJyB8fFxuICAgIFsnZGVidWcnLCAnZGV2JywgJ2RldmVsb3BtZW50J10uaW5jbHVkZXMocHJvY2Vzcy5lbnYuTk9ERV9FTlYpXG4pXG4gICAgZGVidWcgPSB0cnVlXG5pZiAoZGVidWcpXG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPSAnZGV2ZWxvcG1lbnQnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBsb2FkaW5nIGRlZmF1bHQgY29uZmlndXJhdGlvblxubWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdC5wYXRoLmNvbnRleHQgKz0gJy8nXG4vLyBNZXJnZXMgZmluYWwgZGVmYXVsdCBjb25maWd1cmF0aW9uIG9iamVjdCBkZXBlbmRpbmcgb24gZ2l2ZW4gdGFyZ2V0XG4vLyBlbnZpcm9ubWVudC5cbmNvbnN0IGxpYnJhcnlDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0gbWV0YUNvbmZpZ3VyYXRpb24ubGlicmFyeVxubGV0IGNvbmZpZ3VyYXRpb246RGVmYXVsdENvbmZpZ3VyYXRpb25cbmlmIChkZWJ1ZylcbiAgICBjb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kKFxuICAgICAgICB0cnVlLFxuICAgICAgICBUb29scy5tb2RpZnlPYmplY3QobWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdCwgbWV0YUNvbmZpZ3VyYXRpb24uZGVidWcpLFxuICAgICAgICBtZXRhQ29uZmlndXJhdGlvbi5kZWJ1Z1xuICAgIClcbmVsc2VcbiAgICBjb25maWd1cmF0aW9uID0gbWV0YUNvbmZpZ3VyYXRpb24uZGVmYXVsdFxuY29uZmlndXJhdGlvbi5kZWJ1ZyA9IGRlYnVnXG5pZiAodHlwZW9mIGNvbmZpZ3VyYXRpb24ubGlicmFyeSA9PT0gJ29iamVjdCcpXG4gICAgVG9vbHMuZXh0ZW5kKFxuICAgICAgICB0cnVlLFxuICAgICAgICBUb29scy5tb2RpZnlPYmplY3QobGlicmFyeUNvbmZpZ3VyYXRpb24sIGNvbmZpZ3VyYXRpb24ubGlicmFyeSksXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubGlicmFyeVxuICAgIClcbmlmIChcbiAgICAnbGlicmFyeScgaW4gc3BlY2lmaWNDb25maWd1cmF0aW9uICYmXG4gICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLmxpYnJhcnkgPT09IHRydWUgfHxcbiAgICAoXG4gICAgICAgICdsaWJyYXJ5JyBpbiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24gJiZcbiAgICAgICAgc3BlY2lmaWNDb25maWd1cmF0aW9uLmxpYnJhcnkgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAhKCdsaWJyYXJ5JyBpbiBzcGVjaWZpY0NvbmZpZ3VyYXRpb24pXG4gICAgKSAmJlxuICAgIGNvbmZpZ3VyYXRpb24ubGlicmFyeVxuKVxuICAgIGNvbmZpZ3VyYXRpb24gPSBUb29scy5leHRlbmQoXG4gICAgICAgIHRydWUsIFRvb2xzLm1vZGlmeU9iamVjdChjb25maWd1cmF0aW9uLCBsaWJyYXJ5Q29uZmlndXJhdGlvbiksXG4gICAgICAgIGxpYnJhcnlDb25maWd1cmF0aW9uXG4gICAgKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbWVyZ2luZyBhbmQgZXZhbHVhdGluZyB0YXNrIHNwZWNpZmljIGFuZCBkeW5hbWljIGNvbmZpZ3VyYXRpb25zXG4vLyAvIHJlZ2lvbiBsb2FkIGFkZGl0aW9uYWwgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvblxubGV0IGNvdW50Om51bWJlciA9IDBcbmxldCBmaWxlUGF0aDo/c3RyaW5nID0gbnVsbFxud2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCBuZXdGaWxlUGF0aDpzdHJpbmcgPSBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCArXG4gICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmBcbiAgICBpZiAoIVRvb2xzLmlzRmlsZVN5bmMobmV3RmlsZVBhdGgpKVxuICAgICAgICBicmVha1xuICAgIGZpbGVQYXRoID0gbmV3RmlsZVBhdGhcbiAgICBjb3VudCArPSAxXG59XG5sZXQgcnVudGltZUluZm9ybWF0aW9uOlBsYWluT2JqZWN0ID0ge2dpdmVuQ29tbWFuZExpbmVBcmd1bWVudHM6IHByb2Nlc3MuYXJndn1cbmlmIChmaWxlUGF0aCkge1xuICAgIHJ1bnRpbWVJbmZvcm1hdGlvbiA9IEpTT04ucGFyc2UoZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIHtcbiAgICAgICAgZW5jb2Rpbmc6IChjb25maWd1cmF0aW9uLmVuY29kaW5nOnN0cmluZyl9KSlcbiAgICBmaWxlU3lzdGVtLnVubGluayhmaWxlUGF0aCwgKGVycm9yOj9FcnJvcik6dm9pZCA9PiB7XG4gICAgICAgIGlmIChlcnJvcilcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbn1cbi8vIC8vIHJlZ2lvbiB0YXNrIHNwZWNpZmljIGNvbmZpZ3VyYXRpb25cbi8vIC8vLyByZWdpb24gYXBwbHkgdGFzayB0eXBlIHNwZWNpZmljIGNvbmZpZ3VyYXRpb25cbmNvbnN0IHRhc2tUeXBlczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICdidWlsZCcsICdkZWJ1ZycsICdkb2N1bWVudCcsICdzZXJ2ZScsICd0ZXN0JywgJ3Rlc3Q6YnJvd3NlciddXG5pZiAocnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoID4gMilcbiAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIHRhc2tUeXBlcylcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgcnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09IHR5cGUgfHxcbiAgICAgICAgICAgIGRlYnVnICYmXG4gICAgICAgICAgICB0eXBlID09ICdkZWJ1ZydcbiAgICAgICAgKVxuICAgICAgICAgICAgZm9yIChjb25zdCBjb25maWd1cmF0aW9uVGFyZ2V0OlBsYWluT2JqZWN0IG9mIFtcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLCBzcGVjaWZpY0NvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25maWd1cmF0aW9uVGFyZ2V0W3R5cGVdID09PSAnb2JqZWN0JylcbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLm1vZGlmeU9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uVGFyZ2V0LCBjb25maWd1cmF0aW9uVGFyZ2V0W3R5cGVdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25UYXJnZXRbdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBjbGVhciB0YXNrIHR5cGUgc3BlY2lmaWMgY29uZmlndXJhdGlvbnNcbmZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgdGFza1R5cGVzKVxuICAgIGZvciAoY29uc3QgY29uZmlndXJhdGlvblRhcmdldDpQbGFpbk9iamVjdCBvZiBbXG4gICAgICAgIGNvbmZpZ3VyYXRpb24sIHNwZWNpZmljQ29uZmlndXJhdGlvblxuICAgIF0pXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25UYXJnZXQuaGFzT3duUHJvcGVydHkodHlwZSkgJiZcbiAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uVGFyZ2V0W3R5cGVdID09PSAnb2JqZWN0J1xuICAgICAgICApXG4gICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvblRhcmdldFt0eXBlXVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvIGVuZHJlZ2lvblxuVG9vbHMuZXh0ZW5kKFxuICAgIHRydWUsXG4gICAgVG9vbHMubW9kaWZ5T2JqZWN0KFxuICAgICAgICBUb29scy5tb2RpZnlPYmplY3QoY29uZmlndXJhdGlvbiwgc3BlY2lmaWNDb25maWd1cmF0aW9uKSxcbiAgICAgICAgcnVudGltZUluZm9ybWF0aW9uKSxcbiAgICBzcGVjaWZpY0NvbmZpZ3VyYXRpb24sXG4gICAgcnVudGltZUluZm9ybWF0aW9uXG4pXG5sZXQgcmVzdWx0Oj9QbGFpbk9iamVjdCA9IG51bGxcbmlmIChydW50aW1lSW5mb3JtYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAzKVxuICAgIHJlc3VsdCA9IFRvb2xzLnN0cmluZ1BhcnNlRW5jb2RlZE9iamVjdChcbiAgICAgICAgcnVudGltZUluZm9ybWF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbcnVudGltZUluZm9ybWF0aW9uXG4gICAgICAgICAgICAuZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggLSAxXSxcbiAgICAgICAgY29uZmlndXJhdGlvbiwgJ2NvbmZpZ3VyYXRpb24nKVxuaWYgKHR5cGVvZiByZXN1bHQgPT09ICdvYmplY3QnICYmIHJlc3VsdCAhPT0gbnVsbCkge1xuICAgIGlmIChyZXN1bHQuaGFzT3duUHJvcGVydHkoJ19fcmVmZXJlbmNlX18nKSkge1xuICAgICAgICBjb25zdCByZWZlcmVuY2VOYW1lczpBcnJheTxzdHJpbmc+ID0gW10uY29uY2F0KHJlc3VsdC5fX3JlZmVyZW5jZV9fKVxuICAgICAgICBkZWxldGUgcmVzdWx0Ll9fcmVmZXJlbmNlX19cbiAgICAgICAgZm9yIChjb25zdCBuYW1lOnN0cmluZyBvZiByZWZlcmVuY2VOYW1lcylcbiAgICAgICAgICAgIFRvb2xzLmV4dGVuZCh0cnVlLCByZXN1bHQsIGNvbmZpZ3VyYXRpb25bbmFtZV0pXG4gICAgfVxuICAgIFRvb2xzLmV4dGVuZCh0cnVlLCBUb29scy5tb2RpZnlPYmplY3QoY29uZmlndXJhdGlvbiwgcmVzdWx0KSwgcmVzdWx0KVxufVxuLy8gUmVtb3ZpbmcgY29tbWVudHMgKGRlZmF1bHQga2V5IG5hbWUgdG8gZGVsZXRlIGlzIFwiI1wiKS5cbmNvbmZpZ3VyYXRpb24gPSBUb29scy5yZW1vdmVLZXlzKGNvbmZpZ3VyYXRpb24pXG4vLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGRldGVybWluZSBleGlzdGluZyBwcmUgY29tcGlsZWQgZGxsIG1hbmlmZXN0cyBmaWxlIHBhdGhzXG5jb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzID0gW11cbmlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMoY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKSlcbiAgICBmb3IgKGNvbnN0IGZpbGVOYW1lOnN0cmluZyBvZiBmaWxlU3lzdGVtLnJlYWRkaXJTeW5jKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2VcbiAgICApKVxuICAgICAgICBpZiAoZmlsZU5hbWUubWF0Y2goL14uKlxcLmRsbC1tYW5pZmVzdFxcLmpzb24kLykpXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLnB1c2gocGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwgZmlsZU5hbWUpKVxuLy8gLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGJ1aWxkIGFic29sdXRlIHBhdGhzXG5jb25maWd1cmF0aW9uLnBhdGguYmFzZSA9IHBhdGgucmVzb2x2ZShcbiAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UpXG5mb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoKVxuICAgIGlmIChcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmhhc093blByb3BlcnR5KGtleSkgJiZcbiAgICAgICAga2V5ICE9PSAnYmFzZScgJiZcbiAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldID09PSAnc3RyaW5nJ1xuICAgIClcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoW2tleV1cbiAgICAgICAgKSArICcvJ1xuICAgIGVsc2UgaWYgKFxuICAgICAgICBrZXkgIT09ICdjb25maWd1cmF0aW9uJyAmJlxuICAgICAgICBUb29scy5pc1BsYWluT2JqZWN0KGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldKVxuICAgICkge1xuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5iYXNlID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UpXG4gICAgICAgIGZvciAoY29uc3Qgc3ViS2V5OnN0cmluZyBpbiBjb25maWd1cmF0aW9uLnBhdGhba2V5XSlcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XS5oYXNPd25Qcm9wZXJ0eShzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgIVsnYmFzZScsICdwdWJsaWMnXS5pbmNsdWRlcyhzdWJLZXkpICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV0uYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVxuICAgICAgICAgICAgICAgICkgKyAnLydcbiAgICAgICAgICAgIGVsc2UgaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QoY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSkpIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmJhc2UgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV0uYmFzZSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YlN1YktleTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XS5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YlN1YktleSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5wYXRoW2tleV1bc3ViS2V5XVtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJTdWJLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bc3ViU3ViS2V5XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGhba2V5XVtzdWJLZXldLmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFtrZXldW3N1YktleV1bc3ViU3ViS2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnLydcbiAgICAgICAgICAgIH1cbiAgICB9XG4vLyAvIGVuZHJlZ2lvblxuY29uc3Qgbm93OkRhdGUgPSBuZXcgRGF0ZSgpXG5leHBvcnQgY29uc3QgcmVzb2x2ZWRDb25maWd1cmF0aW9uOlJlc29sdmVkQ29uZmlndXJhdGlvbiA9XG4gICAgVG9vbHMuZXZhbHVhdGVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgY29uZmlndXJhdGlvbixcbiAgICAgICAge1xuICAgICAgICAgICAgY3VycmVudFBhdGg6IHByb2Nlc3MuY3dkKCksXG4gICAgICAgICAgICBmaWxlU3lzdGVtLFxuICAgICAgICAgICAgSGVscGVyLFxuICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICBpc0RMTFVzZWZ1bDpcbiAgICAgICAgICAgICAgICAyIDwgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgWydidWlsZDpkbGwnLCAnd2F0Y2g6ZGxsJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSkgfHxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAgICAgWydidWlsZCcsICdzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgcGF0aCxcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWV2YWwgKi9cbiAgICAgICAgICAgIHJlcXVpcmU6IGV2YWwoJ3JlcXVpcmUnKSxcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tZXZhbCAqL1xuICAgICAgICAgICAgVG9vbHMsXG4gICAgICAgICAgICB3ZWJPcHRpbWl6ZXJQYXRoOiBfX2Rpcm5hbWUsXG4gICAgICAgICAgICBub3csXG4gICAgICAgICAgICBub3dVVENUaW1lc3RhbXA6IFRvb2xzLm51bWJlckdldFVUQ1RpbWVzdGFtcChub3cpXG4gICAgICAgIH1cbiAgICApXG4vLyByZWdpb24gY29uc29saWRhdGUgZmlsZSBzcGVjaWZpYyBidWlsZCBjb25maWd1cmF0aW9uXG4vLyBBcHBseSBkZWZhdWx0IGZpbGUgbGV2ZWwgYnVpbGQgY29uZmlndXJhdGlvbnMgdG8gYWxsIGZpbGUgdHlwZSBzcGVjaWZpY1xuLy8gb25lcy5cbmNvbnN0IGRlZmF1bHRDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID1cbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzLmRlZmF1bHRcbmRlbGV0ZSByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzLmRlZmF1bHRcbmZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlcylcbiAgICBpZiAocmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSlcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlc1t0eXBlXSA9IFRvb2xzLmV4dGVuZChcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIGRlZmF1bHRDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAge2V4dGVuc2lvbjogdHlwZX0sXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlc1t0eXBlXSxcbiAgICAgICAgICAgICAgICB7dHlwZX1cbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gcmVzb2x2ZSBtb2R1bGUgbG9jYXRpb24gYW5kIGRldGVybWluZSB3aGljaCBhc3NldCB0eXBlcyBhcmUgbmVlZGVkXG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgIHtcbiAgICAgICAgZmlsZTogcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbCxcbiAgICAgICAgbW9kdWxlOiByZXNvbHZlZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGVcbiAgICB9LFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2VcbilcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24gPSBIZWxwZXIucmVzb2x2ZUluamVjdGlvbihcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLFxuICAgIEhlbHBlci5yZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgSGVscGVyLm5vcm1hbGl6ZVBhdGhzKHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSksXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzXG4gICAgKSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmF1dG9FeGNsdWRlLFxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmVcbilcbmNvbnN0IGVudHJ5SW5qZWN0aW9uOmFueSA9IHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnlcbnJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkgPSB7XG4gICAgZ2l2ZW46IHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnksXG4gICAgbm9ybWFsaXplZDogSGVscGVyLnJlc29sdmVNb2R1bGVzSW5Gb2xkZXJzKFxuICAgICAgICBIZWxwZXIubm9ybWFsaXplRW50cnlJbmplY3Rpb24oZW50cnlJbmplY3Rpb24pLFxuICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFyZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpXG4gICAgICAgIClcbiAgICApXG59XG5yZXNvbHZlZENvbmZpZ3VyYXRpb24ubmVlZGVkID0ge1xuICAgIGphdmFTY3JpcHQ6IGNvbmZpZ3VyYXRpb24uZGVidWcgJiYgWydzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICApXG59XG5mb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeVxuICAgIC5ub3JtYWxpemVkXG4pXG4gICAgaWYgKHJlc29sdmVkQ29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgY2h1bmtOYW1lXG4gICAgKSlcbiAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2YgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeVxuICAgICAgICAgICAgLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGU6IHJlc29sdmVkQ29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW50ZXJuYWwsXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZTogcmVzb2x2ZWRDb25maWd1cmF0aW9uLmV4dGVuc2lvbnMubW9kdWxlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IFdlIGRvZXNuJ3QgdXNlXG4gICAgICAgICAgICAgICAgICAgIFwicmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2VcIiBiZWNhdXNlIHdlXG4gICAgICAgICAgICAgICAgICAgIGhhdmUgYWxyZWFkeSByZXNvbHZlIGFsbCBtb2R1bGUgaWRzLlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgJy4vJyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5lbmNvZGluZ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgbGV0IHR5cGU6P3N0cmluZ1xuICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIHR5cGUgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlcyxcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLnBhdGhcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBgR2l2ZW4gcmVxdWVzdCBcIiR7bW9kdWxlSUR9XCIgY291bGRuJ3QgYmUgcmVzb2x2ZWQuYClcbiAgICAgICAgICAgIGlmICh0eXBlKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5uZWVkZWRbdHlwZV0gPSB0cnVlXG4gICAgICAgIH1cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGFkZGluZyBzcGVjaWFsIGFsaWFzZXNcbi8vIE5PVEU6IFRoaXMgYWxpYXMgY291bGRuJ3QgYmUgc2V0IGluIHRoZSBcInBhY2thZ2UuanNvblwiIGZpbGUgc2luY2UgdGhpcyB3b3VsZFxuLy8gcmVzdWx0IGluIGFuIGVuZGxlc3MgbG9vcC5cbnJlc29sdmVkQ29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlcy53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlTG9hZGVyID0gJydcbmZvciAoY29uc3QgbG9hZGVyOlBsYWluT2JqZWN0IG9mIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgIC50ZW1wbGF0ZS51c2Vcbikge1xuICAgIGlmIChcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzXG4gICAgICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlclxuICAgIClcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzXG4gICAgICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciArPSAnISdcbiAgICByZXNvbHZlZENvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXNcbiAgICAgICAgLndlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVMb2FkZXIgKz0gbG9hZGVyLmxvYWRlclxuICAgIGlmIChsb2FkZXIub3B0aW9ucylcbiAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzXG4gICAgICAgICAgICAud2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZUxvYWRlciArPSAnPycgK1xuICAgICAgICAgICAgICAgIFRvb2xzLmNvbnZlcnRDaXJjdWxhck9iamVjdFRvSlNPTihsb2FkZXIub3B0aW9ucylcbn1cbnJlc29sdmVkQ29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcy53ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlUGF0aCQgPVxuICAgIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS5maWxlUGF0aFxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gYXBwbHkgaHRtbCB3ZWJwYWNrIHBsdWdpbiB3b3JrYXJvdW5kc1xuLypcbiAgICBOT1RFOiBQcm92aWRlcyBhIHdvcmthcm91bmQgdG8gaGFuZGxlIGEgYnVnIHdpdGggY2hhaW5lZCBsb2FkZXJcbiAgICBjb25maWd1cmF0aW9ucy5cbiovXG5mb3IgKFxuICAgIGNvbnN0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mXG4gICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmh0bWxcbikge1xuICAgIFRvb2xzLmV4dGVuZChcbiAgICAgICAgdHJ1ZSwgaHRtbENvbmZpZ3VyYXRpb24sIHJlc29sdmVkQ29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTClcbiAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5yZXF1ZXN0ID0gaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGhcbiAgICBpZiAoXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoICE9PVxuICAgICAgICAgICAgcmVzb2x2ZWRDb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoICYmXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLm9wdGlvbnNcbiAgICApIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdFN0cmluZzpPYmplY3QgPSBuZXcgU3RyaW5nKFxuICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdCArXG4gICAgICAgICAgICBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUub3B0aW9ucykpXG4gICAgICAgIHJlcXVlc3RTdHJpbmcucmVwbGFjZSA9ICgoc3RyaW5nOnN0cmluZyk6RnVuY3Rpb24gPT4gKFxuICAgICAgICAgICAgX3NlYXJjaDpSZWdFeHB8c3RyaW5nLCBfcmVwbGFjZW1lbnQ6c3RyaW5nfChcbiAgICAgICAgICAgICAgICAuLi5tYXRjaGVzOkFycmF5PHN0cmluZz5cbiAgICAgICAgICAgICkgPT4gc3RyaW5nXG4gICAgICAgICk6c3RyaW5nID0+IHN0cmluZykoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3QgPSByZXF1ZXN0U3RyaW5nXG4gICAgfVxufVxuLy8gZW5kcmVnaW9uXG5leHBvcnQgZGVmYXVsdCByZXNvbHZlZENvbmZpZ3VyYXRpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19