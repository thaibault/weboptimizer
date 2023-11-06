rPath: webOptimizerPath,
      now: now,
      nowUTCTimestamp: _clientnode["default"].numberGetUTCTimestamp(now)
    });
    // endregion
    // region consolidate file specific build configuration
    // Apply default file level build configurations to all file type specific
    // ones.
    var defaultConfiguration = resolvedConfiguration.buildContext.types["default"];
    delete resolvedConfiguration.buildContext.types["default"];
    for (var _i5 = 0, _Object$entries4 = Object.entries(resolvedConfiguration.buildContext.types); _i5 < _Object$entries4.length; _i5++) {
      var _Object$entries4$_i = (0, _slicedToArray2["default"])(_Object$entries4[_i5], 2),
        _type = _Object$entries4$_i[0],
        _context = _Object$entries4$_i[1];
      resolvedConfiguration.buildContext.types[_type] = _clientnode["default"].extend(true, _clientnode["default"].copy(defaultConfiguration), _clientnode["default"].extend(true, {
        extension: _type
      }, _context, {
        type: _type
      }));
    }
    // endregion
    // region resolve module location and which asset types are needed
    resolvedConfiguration.module.locations = _helper["default"].determineModuleLocations(resolvedConfiguration.injection.entry.normalized, resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, {
      file: resolvedConfiguration.extensions.file.internal
    }, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base);
    resolvedConfiguration.injection = _helper["default"].resolveAutoInjection(resolvedConfiguration.injection, _helper["default"].resolveBuildConfigurationFilePaths(resolvedConfiguration.buildContext.types, resolvedConfiguration.path.source.asset.base, _helper["default"].normalizePaths(resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
      return (0, _path2.resolve)(resolvedConfiguration.path.context, filePath);
    }).filter(function (filePath) {
      return !resolvedConfiguration.path.context.startsWith(filePath);
    })), resolvedConfiguration["package"].main.fileNames), resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.extensions, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore);
    var givenInjection = resolvedConfiguration.injection.entry;
    resolvedConfiguration.injection.entry = {
      given: givenInjection,
      normalized: _helper["default"].resolveModulesInFolders(_helper["default"].normalizeGivenInjection(givenInjection), resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, resolvedConfiguration.path.context, resolvedConfiguration.path.source.asset.base, resolvedConfiguration.path.ignore.concat(resolvedConfiguration.module.directoryNames, resolvedConfiguration.loader.directoryNames).map(function (filePath) {
        return (0, _path2.resolve)(resolvedConfiguration.path.context, filePath);
      }).filter(function (filePath) {
        return !resolvedConfiguration.path.context.startsWith(filePath);
      }))
    };
    resolvedConfiguration.needed = {
      javaScript: configuration.debug && ['serve', 'test:browser'].includes(resolvedConfiguration.givenCommandLineArguments[2])
    };
    /// region determine which asset types are needed
    for (var _i6 = 0, _Object$values = Object.values(resolvedConfiguration.injection.entry.normalized); _i6 < _Object$values.length; _i6++) {
      var chunk = _Object$values[_i6];
      var _iterator4 = _createForOfIteratorHelper(chunk),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var moduleID = _step4.value;
          var _filePath = _helper["default"].determineModuleFilePath(moduleID, resolvedConfiguration.module.aliases, resolvedConfiguration.module.replacements.normal, {
            file: resolvedConfiguration.extensions.file.internal
          }, resolvedConfiguration.path.context,
          /*
              NOTE: We doesn't use
              "resolvedConfiguration.path.source.asset.base" because we
              already have resolved all module ids.
          */
          '', resolvedConfiguration.path.ignore, resolvedConfiguration.module.directoryNames, resolvedConfiguration["package"].main.fileNames, resolvedConfiguration["package"].main.propertyNames, resolvedConfiguration["package"].aliasPropertyNames, resolvedConfiguration.encoding);
          var _type2 = null;
          if (_filePath) _type2 = _helper["default"].determineAssetType(_filePath, resolvedConfiguration.buildContext.types, resolvedConfiguration.path);else throw new Error("Given request \"".concat(moduleID, "\" couldn't be resolved."));
          if (_type2) resolvedConfiguration.needed[_type2] = true;
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
    /// endregion
    // endregion
    // region adding special aliases
    /*
        NOTE: This alias couldn't be set in the "package.json" file since this
        would result in an endless loop.
    */
    resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader = '';
    var _iterator5 = _createForOfIteratorHelper(Array.isArray(resolvedConfiguration.files.defaultHTML.template.use) ? resolvedConfiguration.files.defaultHTML.template.use : [resolvedConfiguration.files.defaultHTML.template.use]),
      _step5;
    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var loader = _step5.value;
        if (resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader) resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += '!';
        resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += loader.loader;
        if (loader.options) resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader += '?' + _clientnode["default"].convertCircularObjectToJSON(loader.options);
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
    resolvedConfiguration.module.aliases.webOptimizerDefaultTemplateFilePath = resolvedConfiguration.files.defaultHTML.template.filePath;
    // endregion
    // region apply html webpack plugin workarounds
    /*
        NOTE: Provides a workaround to handle a bug with chained loader
        configurations.
    */
    var _iterator6 = _createForOfIteratorHelper(resolvedConfiguration.files.html),
      _step6;
    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
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
      }
      // endregion
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
    return resolvedConfiguration;
  }();
};
/**
 * Get cached or determined configuration object.
 * @returns Nothing.
 */
var get = exports.get = function get() {
  if (loadedConfiguration) return loadedConfiguration;
  exports.loadedConfiguration = loadedConfiguration = load();
  return loadedConfiguration;
};
var _default = exports["default"] = get; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module configurator */
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
var _typeof3 = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadedConfiguration = exports.load = exports.get = exports["default"] = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _clientnode = _interopRequireWildcard(require("clientnode"));
var _fs = _interopRequireWildcard(require("fs"));
var _path2 = _interopRequireWildcard(require("path"));
var _helper = _interopRequireDefault(require("./helper"));
var _package = _interopRequireWildcard(require("./package.json"));
var _type4 = require("./type");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof3(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// endregion
var loadedConfiguration = exports.loadedConfiguration = null;
/**
 * Main entry point to determine current configuration.
 * @param context - Location from where to build current application.
 * @param currentWorkingDirectory - Current working directory to use as
 * reference.
 * @param commandLineArguments - Arguments to take into account.
 * @param webOptimizerPath - Current optimizer context path.
 * @param environment - Environment variables to take into account.
 *
 * @returns Nothing.
 */
var load = exports.load = function load(context) {
  var currentWorkingDirectory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.cwd();
  var commandLineArguments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : process.argv;
  var webOptimizerPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : __dirname;
  var environment = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : eval('process.env');
  return function (_specificConfiguratio, _specificConfiguratio2, _specificConfiguratio3) {
    // region determine application context location
    if (context) _package.configuration["default"].path.context = context;else {
      /*
          To assume to go two folder up from this file until there is no
          "node_modules" parent folder is usually resilient again dealing
          with projects where current working directory isn't the projects
          directory and this library is located as a nested dependency.
      */
      _package.configuration["default"].path.context = webOptimizerPath;
      while (true) {
        _package.configuration["default"].path.context = (0, _path2.resolve)(_package.configuration["default"].path.context, '../../');
        if ((0, _path2.basename)((0, _path2.dirname)(_package.configuration["default"].path.context)) !== 'node_modules') break;
      }
      if ((0, _path2.basename)((0, _path2.dirname)(currentWorkingDirectory)) === 'node_modules' || (0, _path2.basename)((0, _path2.dirname)(currentWorkingDirectory)) === '.staging' && (0, _path2.basename)((0, _path2.dirname)((0, _path2.dirname)(currentWorkingDirectory))) === 'node_modules') {
        /*
            NOTE: If we are dealing was a dependency project use current
            directory as context.
        */
        _package.configuration["default"].path.context = currentWorkingDirectory;
        _package.configuration["default"].contextType = 'dependency';
      } else
        /*
            NOTE: If the current working directory references this file via
            a linked "node_modules" folder using current working directory
            as context is a better assumption than two folders up the
            hierarchy.
        */
        try {
          if ((0, _fs.lstatSync)((0, _path2.join)(currentWorkingDirectory, 'node_modules')).isSymbolicLink()) _package.configuration["default"].path.context = currentWorkingDirectory;
        } catch (error) {
          // Continue regardless of error.
        }
    }
    // endregion
    // region load application specific configuration
    var specificConfiguration = {};
    try {
      specificConfiguration = (0, _clientnode.currentRequire)((0, _path2.join)(_package.configuration["default"].path.context, 'package'));
    } catch (error) {
      _package.configuration["default"].path.context = currentWorkingDirectory;
    }
    // endregion
    // region determine application name and web optimizer configuration
    var name = typeof specificConfiguration.name === 'string' ? specificConfiguration.name : typeof ((_specificConfiguratio = specificConfiguration.webOptimizer) === null || _specificConfiguratio === void 0 ? void 0 : _specificConfiguratio.name) === 'string' ? (_specificConfiguratio2 = specificConfiguration.webOptimizer) === null || _specificConfiguratio2 === void 0 ? void 0 : _specificConfiguratio2.name : 'mockup';
    specificConfiguration = specificConfiguration.webOptimizer || {};
    specificConfiguration.name = name;
    // endregion
    // region determine debug mode
    // NOTE: Given node command line arguments results in "npm_config_*"
    // environment variables.
    var debug = _package.configuration["default"].debug;
    if (typeof specificConfiguration.debug === 'boolean') debug = specificConfiguration.debug;else if (environment.npm_config_dev === 'true' || typeof environment.NODE_ENV === 'string' && ['debug', 'dev', 'development'].includes(environment.NODE_ENV)) debug = true;
    if (debug) environment.NODE_ENV = 'development';
    // endregion
    // region loading default configuration
    _package.configuration["default"].path.context += '/';
    // Merges final default configuration object depending on given target
    // environment.
    var libraryConfiguration = _package.configuration.library;
    var configuration;
    if (debug) configuration = _clientnode["default"].extend(true, _clientnode["default"].modifyObject(_package.configuration["default"], _package.configuration.debug), _package.configuration.debug);else configuration = _package.configuration["default"];
    configuration.debug = debug;
    if ((0, _typeof2["default"])(configuration.library) === 'object') _clientnode["default"].extend(true, _clientnode["default"].modifyObject(libraryConfiguration, configuration.library), configuration.library);
    if (configuration.library && ((_specificConfiguratio3 = specificConfiguration) === null || _specificConfiguratio3 === void 0 ? void 0 : _specificConfiguratio3.library) !== false) configuration = _clientnode["default"].extend(true, _clientnode["default"].modifyObject(configuration, libraryConfiguration), libraryConfiguration);
    // endregion
    // region merging and evaluating task specific and dynamic configurations
    /// region load additional dynamically given configuration
    var count = 0;
    var filePath = null;
    while (true) {
      var newFilePath = "".concat(configuration.path.context, ".dynamicConfiguration-").concat(count, ".json");
      if (!_clientnode["default"].isFileSync(newFilePath)) break;
      filePath = newFilePath;
      count += 1;
    }
    var runtimeInformation = {
      givenCommandLineArguments: commandLineArguments
    };
    if (filePath) {
      var fileContent = (0, _fs.readFileSync)(filePath, {
        encoding: configuration.encoding
      });
      runtimeInformation = JSON.parse(fileContent);
      (0, _fs.unlinkSync)(filePath);
    }
    //// region task specific configuration
    ///// region apply task type specific configuration
    if (runtimeInformation.givenCommandLineArguments.length > 2) {
      var _iterator = _createForOfIteratorHelper(_type4.SubConfigurationTypes),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var type = _step.value;
          if (runtimeInformation.givenCommandLineArguments[2] === type || debug && type === 'debug' || type === 'test' && runtimeInformation.givenCommandLineArguments[2].startsWith('test:') && runtimeInformation.givenCommandLineArguments[2] !== 'test:browser') for (var _i = 0, _arr = [configuration, specificConfiguration]; _i < _arr.length; _i++) {
            var configurationTarget = _arr[_i];
            if (_clientnode["default"].isPlainObject(configurationTarget[type])) _clientnode["default"].extend(true, _clientnode["default"].modifyObject(configurationTarget, configurationTarget[type]), configurationTarget[type]);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    ///// endregion
    ///// region clear task type specific configurations
    var _iterator2 = _createForOfIteratorHelper(_type4.SubConfigurationTypes),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _type3 = _step2.value;
        for (var _i7 = 0, _arr2 = [configuration, specificConfiguration]; _i7 < _arr2.length; _i7++) {
          var _configurationTarget = _arr2[_i7];
          if (Object.prototype.hasOwnProperty.call(_configurationTarget, _type3) && (0, _typeof2["default"])(_configurationTarget[_type3]) === 'object') delete _configurationTarget[_type3];
        }
      }
      ///// endregion
      //// endregion
      /// endregion
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    _clientnode["default"].extend(true, _clientnode["default"].modifyObject(_clientnode["default"].modifyObject(configuration, specificConfiguration), runtimeInformation), specificConfiguration, runtimeInformation);
    var result = null;
    if (runtimeInformation.givenCommandLineArguments.length > 3) result = _clientnode["default"].stringParseEncodedObject(runtimeInformation.givenCommandLineArguments[runtimeInformation.givenCommandLineArguments.length - 1], configuration, 'configuration');
    if (result !== null && (0, _typeof2["default"])(result) === 'object') {
      if (Object.prototype.hasOwnProperty.call(result, '__reference__')) {
        var referenceNames = [].concat(result.__reference__);
        delete result.__reference__;
        var _iterator3 = _createForOfIteratorHelper(referenceNames),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _name = _step3.value;
            if (Object.prototype.hasOwnProperty.call(configuration, _name)) _clientnode["default"].extend(true, result, configuration[_name]);else if (_clientnode["default"].isFileSync(_name)) _clientnode["default"].extend(true, result, JSON.parse((0, _fs.readFileSync)(_name, configuration.encoding)));else console.warn("Given dynamic referenced configuration \"".concat(_name, "\" ") + 'could not be resolved.');
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
      _clientnode["default"].extend(true, _clientnode["default"].modifyObject(configuration, result), result);
    }
    // Removing comments (default key name to delete is "#").
    configuration = _clientnode["default"].removeKeyPrefixes(configuration);
    // endregion
    /// region build absolute paths
    configuration.path.base = (0, _path2.resolve)(configuration.path.context, configuration.path.base);
    for (var _i2 = 0, _Object$entries = Object.entries(configuration.path); _i2 < _Object$entries.length; _i2++) {
      var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i2], 2),
        key = _Object$entries$_i[0],
        _path = _Object$entries$_i[1];
      if (!['base', 'configuration'].includes(key)) if (typeof _path === 'string') configuration.path[key] = (0, _path2.resolve)(configuration.path.base, _path) + '/';else if (_clientnode["default"].isPlainObject(_path)) {
        if (Object.prototype.hasOwnProperty.call(_path, 'base')) configuration.path[key].base = (0, _path2.resolve)(configuration.path.base, _path.base);
        for (var _i3 = 0, _Object$entries2 = Object.entries(_path); _i3 < _Object$entries2.length; _i3++) {
          var _Object$entries2$_i = (0, _slicedToArray2["default"])(_Object$entries2[_i3], 2),
            subKey = _Object$entries2$_i[0],
            subPath = _Object$entries2$_i[1];
          if (!['base', 'public'].includes(subKey) && typeof subPath === 'string') _path[subKey] = (0, _path2.resolve)(_path.base, subPath) + '/';else if (subKey !== 'options' && _clientnode["default"].isPlainObject(subPath)) {
            subPath.base = (0, _path2.resolve)(_path.base, subPath.base);
            for (var _i4 = 0, _Object$entries3 = Object.entries(subPath); _i4 < _Object$entries3.length; _i4++) {
              var _Object$entries3$_i = (0, _slicedToArray2["default"])(_Object$entries3[_i4], 2),
                subSubKey = _Object$entries3$_i[0],
                subSubPath = _Object$entries3$_i[1];
              if (subSubKey !== 'base' && typeof subSubPath === 'string') subPath[subSubKey] = (0, _path2.resolve)(subPath.base, subSubPath) + '/';
            }
          }
        }
      }
    }
    /// endregion
    // region evaluate dynamic configuration structures
    var now = new Date();
    /*
        NOTE: The configuration is not yet fully resolved but will be
        transformed in place in the following lines of code.
    */
    var resolvedConfiguration = _clientnode["default"].evaluateDynamicData(configuration, {
      currentPath: currentWorkingDirectory,
      fileSystem: _fs["default"],
      Helper: _helper["default"],
      packageConfiguration: _package["default"],
      optionalRequire: _clientnode.optionalRequire,
      path: _path2["default"],
      require: _clientnode.currentRequire,
      Tools: _clientnode["default"],
      webOptimize