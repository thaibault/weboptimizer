// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module helper */
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
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.KNOWN_FILE_EXTENSIONS = exports.Helper = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _clientnode = _interopRequireWildcard(require("clientnode"));
var _fs = require("fs");
var _path = require("path");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
// endregion
// region constants
var KNOWN_FILE_EXTENSIONS = ['js', 'ts', 'json', 'css', 'eot', 'gif', 'html', 'ico', 'jpg', 'png', 'ejs', 'svg', 'ttf', 'woff', '.woff2'];
// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
exports.KNOWN_FILE_EXTENSIONS = KNOWN_FILE_EXTENSIONS;
var Helper = /*#__PURE__*/function () {
  function Helper() {
    (0, _classCallCheck2["default"])(this, Helper);
  }
  (0, _createClass2["default"])(Helper, null, [{
    key: "isFilePathInLocation",
    value:
    // region boolean
    /**
     * Determines whether given file path is within given list of file
     * locations.
     * @param filePath - Path to file to check.
     * @param locationsToCheck - Locations to take into account.
     *
     * @returns Value "true" if given file path is within one of given
     * locations or "false" otherwise.
     */
    function isFilePathInLocation(filePath, locationsToCheck) {
      var _iterator = _createForOfIteratorHelper(locationsToCheck),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pathToCheck = _step.value;
          if ((0, _path.resolve)(filePath).startsWith((0, _path.resolve)(pathToCheck))) return true;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return false;
    }
    // endregion
    // region string
    /**
     * Strips loader informations form given module request including loader
     * prefix and query parameter.
     * @param moduleID - Module request to strip.
     *
     * @returns Given module id stripped.
     */
  }, {
    key: "stripLoader",
    value: function stripLoader(moduleID) {
      var moduleIDWithoutLoader = moduleID.substring(moduleID.lastIndexOf('!') + 1).replace(/\.webpack\[.+\/.+\]$/, '');
      return moduleIDWithoutLoader.includes('?') ? moduleIDWithoutLoader.substring(0, moduleIDWithoutLoader.indexOf('?')) : moduleIDWithoutLoader;
    }
    // endregion
    // region array
    /**
     * Converts given list of path to a normalized list with unique values.
     * @param paths - File paths.
     *
     * @returns The given file path list with normalized unique values.
     */
  }, {
    key: "normalizePaths",
    value: function normalizePaths(paths) {
      return Array.from(new Set(paths.map(function (givenPath) {
        givenPath = (0, _path.normalize)(givenPath);
        if (givenPath.endsWith('/')) return givenPath.substring(0, givenPath.length - 1);
        return givenPath;
      })));
    }
    // endregion
    // region file handler
    /**
     * Applies file path/name placeholder replacements with given bundle
     * associated informations.
     * @param template - File path to process placeholder in.
     * @param scope - Scope to use for processing.
     *
     * @returns Processed file path.
     */
  }, {
    key: "renderFilePathTemplate",
    value: function renderFilePathTemplate(template) {
      var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      scope = _objectSpread({
        '[chunkhash]': '.__dummy__',
        '[contenthash]': '.__dummy__',
        '[fullhash]': '.__dummy__',
        '[id]': '.__dummy__',
        '[name]': '.__dummy__'
      }, scope);
      var filePath = template;
      for (var _i = 0, _Object$entries = Object.entries(scope); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
          placeholderName = _Object$entries$_i[0],
          value = _Object$entries$_i[1];
        filePath = filePath.replace(new RegExp(_clientnode["default"].stringEscapeRegularExpressions(placeholderName), 'g'), "".concat(value));
      }
      return filePath;
    }
    /**
     * Converts given request to a resolved request with given context
     * embedded.
     * @param request - Request to determine.
     * @param context - Context of given request to resolve relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param relativeModuleLocations - List of relative directory paths to
     * search for modules in.
     *
     * @returns A new resolved request.
     */
  }, {
    key: "applyContext",
    value: function applyContext(request) {
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
      var referencePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : './';
      var aliases = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var moduleReplacements = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      var relativeModuleLocations = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : ['node_modules'];
      referencePath = (0, _path.resolve)(referencePath);
      if (request.startsWith('./') && (0, _path.resolve)(context) !== referencePath) {
        request = (0, _path.resolve)(context, request);
        var _iterator2 = _createForOfIteratorHelper(relativeModuleLocations),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var modulePath = _step2.value;
            var pathPrefix = (0, _path.resolve)(referencePath, modulePath);
            if (request.startsWith(pathPrefix)) {
              request = request.substring(pathPrefix.length);
              if (request.startsWith('/')) request = request.substring(1);
              return Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        if (request.startsWith(referencePath)) {
          request = request.substring(referencePath.length);
          if (request.startsWith('/')) request = request.substring(1);
          return Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
        }
      }
      return request;
    }
    /**
     * Check if given request points to an external dependency not maintained
     * by current package context.
     * @param request - Request to determine.
     * @param context - Context of current project.
     * @param requestContext - Context of given request to resolve relative to.
     * @param normalizedGivenInjection - Mapping of chunk names to modules
     * which should be injected.
     * @param relativeExternalModuleLocations - Array of paths where external
     * modules take place.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param includePattern - Array of regular expressions to explicitly mark
     * as external dependency.
     * @param excludePattern - Array of regular expressions to explicitly mark
     * as internal dependency.
     * @param inPlaceNormalLibrary - Indicates whether normal libraries should
     * be external or not.
     * @param inPlaceDynamicLibrary - Indicates whether requests with
     * integrated loader configurations should be marked as external or not.
     * @param encoding - Encoding for file names to use during file traversing.
     *
     * @returns A new resolved request indicating whether given request is an
     * external one.
     */
  }, {
    key: "determineExternalRequest",
    value: function determineExternalRequest(request) {
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
      var requestContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : './';
      var normalizedGivenInjection = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var relativeExternalModuleLocations = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ['node_modules'];
      var aliases = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      var moduleReplacements = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
      var extensions = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : {
        file: {
          external: ['.compiled.js', '.js', '.json'],
          internal: KNOWN_FILE_EXTENSIONS.map(function (suffix) {
            return ".".concat(suffix);
          })
        }
      };
      var referencePath = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : './';
      var pathsToIgnore = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['.git'];
      var relativeModuleLocations = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : ['node_modules'];
      var packageEntryFileNames = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : ['index', 'main'];
      var packageMainPropertyNames = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : ['main', 'module'];
      var packageAliasPropertyNames = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : [];
      var includePattern = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : [];
      var excludePattern = arguments.length > 15 && arguments[15] !== undefined ? arguments[15] : [];
      var inPlaceNormalLibrary = arguments.length > 16 && arguments[16] !== undefined ? arguments[16] : false;
      var inPlaceDynamicLibrary = arguments.length > 17 && arguments[17] !== undefined ? arguments[17] : true;
      var encoding = arguments.length > 18 && arguments[18] !== undefined ? arguments[18] : 'utf-8';
      context = (0, _path.resolve)(context);
      requestContext = (0, _path.resolve)(requestContext);
      referencePath = (0, _path.resolve)(referencePath);
      // NOTE: We apply alias on externals additionally.
      var resolvedRequest = Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
      if (resolvedRequest === false || _clientnode["default"].isAnyMatching(resolvedRequest, excludePattern)) return null;
      /*
          NOTE: Aliases and module replacements doesn't have to be forwarded
          since we pass an already resolved request.
      */
      var filePath = Helper.determineModuleFilePath(resolvedRequest, {}, {}, {
        file: extensions.file.external
      }, context, requestContext, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
      /*
          NOTE: We mark dependencies as external if there file couldn't be
          resolved or are specified to be external explicitly.
      */
      if (!(filePath || inPlaceNormalLibrary) || _clientnode["default"].isAnyMatching(resolvedRequest, includePattern)) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleLocations) || null;
      for (var _i2 = 0, _Object$values = Object.values(normalizedGivenInjection); _i2 < _Object$values.length; _i2++) {
        var chunk = _Object$values[_i2];
        var _iterator3 = _createForOfIteratorHelper(chunk),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var moduleID = _step3.value;
            if (Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, {
              file: extensions.file.internal
            }, context, requestContext, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding) === filePath) return null;
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
      var parts = context.split('/');
      var externalModuleLocations = [];
      while (parts.length > 0) {
        var _iterator4 = _createForOfIteratorHelper(relativeExternalModuleLocations),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var relativePath = _step4.value;
            externalModuleLocations.push((0, _path.join)('/', parts.join('/'), relativePath));
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
        parts.splice(-1, 1);
      }
      /*
          NOTE: We mark dependencies as external if they does not contain a
          loader in their request and aren't part of the current main package
          or have a file extension other than javaScript aware.
      */
      if (!inPlaceNormalLibrary && (extensions.file.external.length === 0 || filePath && extensions.file.external.includes((0, _path.extname)(filePath)) || !filePath && extensions.file.external.includes('')) && !(inPlaceDynamicLibrary && request.includes('!')) && (!filePath && inPlaceDynamicLibrary || filePath && (!filePath.startsWith(context) || Helper.isFilePathInLocation(filePath, externalModuleLocations)))) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleLocations) || null;
      return null;
    }
    /**
     * Determines asset type of given file.
     * @param filePath - Path to file to analyse.
     * @param buildConfiguration - Meta informations for available asset
     * types.
     * @param paths - List of paths to search if given path doesn't reference
     * a file directly.
     *
     * @returns Determined file type or "null" of given file couldn't be
     * determined.
     */
  }, {
    key: "determineAssetType",
    value: function determineAssetType(filePath, buildConfiguration, paths) {
      var result = null;
      for (var type in buildConfiguration) {
        if ((0, _path.extname)(filePath) === ".".concat(buildConfiguration[type].extension)) {
          result = type;
          break;
        }
      }
      if (!result) for (var _i3 = 0, _arr = [paths.source, paths.target]; _i3 < _arr.length; _i3++) {
        var _type = _arr[_i3];
        for (var _i4 = 0, _Object$entries2 = Object.entries(_type.asset); _i4 < _Object$entries2.length; _i4++) {
          var _Object$entries2$_i = (0, _slicedToArray2["default"])(_Object$entries2[_i4], 2),
            assetType = _Object$entries2$_i[0],
            assetConfiguration = _Object$entries2$_i[1];
          if (assetType !== 'base' && assetConfiguration && filePath.startsWith(assetConfiguration)) return assetType;
        }
      }
      return result;
    }
    /**
     * Adds a property with a stored array of all matching file paths, which
     * matches each build configuration in given entry path and converts given
     * build configuration into a sorted array were javaScript files takes
     * precedence.
     * @param configuration - Given build configurations.
     * @param entryPath - Path to analyse nested structure.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param mainFileBasenames - File basenames to sort into the front.
     *
     * @returns Converted build configuration.
     */
  }, {
    key: "resolveBuildConfigurationFilePaths",
    value: function resolveBuildConfigurationFilePaths(configuration) {
      var entryPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
      var pathsToIgnore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['.git'];
      var mainFileBasenames = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ['index', 'main'];
      var buildConfiguration = [];
      for (var _i5 = 0, _Object$values2 = Object.values(configuration); _i5 < _Object$values2.length; _i5++) {
        var value = _Object$values2[_i5];
        var newItem = _clientnode["default"].extend(true, {
          filePaths: []
        }, value);
        var _iterator5 = _createForOfIteratorHelper(_clientnode["default"].walkDirectoryRecursivelySync(entryPath, function (file) {
            if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
          })),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var _file$stats;
            var file = _step5.value;
            if ((_file$stats = file.stats) !== null && _file$stats !== void 0 && _file$stats.isFile() && file.path.endsWith(".".concat(newItem.extension)) && !(newItem.ignoredExtension && file.path.endsWith(".".concat(newItem.ignoredExtension))) && !new RegExp(newItem.filePathPattern).test(file.path)) newItem.filePaths.push(file.path);
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
        newItem.filePaths.sort(function (firstFilePath, secondFilePath) {
          if (mainFileBasenames.includes((0, _path.basename)(firstFilePath, (0, _path.extname)(firstFilePath)))) {
            if (mainFileBasenames.includes((0, _path.basename)(secondFilePath, (0, _path.extname)(secondFilePath)))) return 0;
          } else if (mainFileBasenames.includes((0, _path.basename)(secondFilePath, (0, _path.extname)(secondFilePath)))) return 1;
          return 0;
        });
        buildConfiguration.push(newItem);
      }
      return buildConfiguration.sort(function (first, second) {
        if (first.outputExtension !== second.outputExtension) {
          if (first.outputExtension === 'js') return -1;
          if (second.outputExtension === 'js') return 1;
          return first.outputExtension < second.outputExtension ? -1 : 1;
        }
        return 0;
      });
    }
    /**
     * Determines all file and directory paths related to given internal
     * modules as array.
     * @param givenInjection - List of module ids or module file paths.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of module replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to resolve relative to.
     * @param referencePath - Path to search for local modules.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - File name encoding to use during file traversing.
     *
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */
  }, {
    key: "determineModuleLocations",
    value: function determineModuleLocations(givenInjection) {
      var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var extensions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
        file: KNOWN_FILE_EXTENSIONS.map(function (suffix) {
          return ".".concat(suffix);
        })
      };
      var context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : './';
      var referencePath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
      var pathsToIgnore = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : ['.git'];
      var relativeModuleLocations = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : ['node_modules'];
      var packageEntryFileNames = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['__package__', '', 'index', 'main'];
      var packageMainPropertyNames = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['main', 'module'];
      var packageAliasPropertyNames = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];
      var encoding = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 'utf-8';
      var filePaths = [];
      var directoryPaths = [];
      var normalizedGivenInjection = Helper.resolveModulesInFolders(Helper.normalizeGivenInjection(givenInjection), aliases, moduleReplacements, context, referencePath, pathsToIgnore);
      for (var _i6 = 0, _Object$values3 = Object.values(normalizedGivenInjection); _i6 < _Object$values3.length; _i6++) {
        var chunk = _Object$values3[_i6];
        var _iterator6 = _createForOfIteratorHelper(chunk),
          _step6;
        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var moduleID = _step6.value;
            var filePath = Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, referencePath, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
            if (filePath) {
              filePaths.push(filePath);
              var directoryPath = (0, _path.dirname)(filePath);
              if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
            }
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
      }
      return {
        filePaths: filePaths,
        directoryPaths: directoryPaths
      };
    }
    /**
     * Determines a list of concrete file paths for given module id pointing to
     * a folder which isn't a package.
     * @param normalizedGivenInjection - Injection data structure of modules
     * with folder references to resolve.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     *
     * @returns Given injections with resolved folder pointing modules.
     */
  }, {
    key: "resolveModulesInFolders",
    value: function resolveModulesInFolders(normalizedGivenInjection) {
      var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : './';
      var referencePath = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
      var pathsToIgnore = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : ['.git'];
      if (referencePath.startsWith('/')) referencePath = (0, _path.relative)(context, referencePath);
      for (var _i7 = 0, _Object$values4 = Object.values(normalizedGivenInjection); _i7 < _Object$values4.length; _i7++) {
        var chunk = _Object$values4[_i7];
        var index = 0;
        var _iterator7 = _createForOfIteratorHelper(chunk),
          _step7;
        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var moduleID = _step7.value;
            var resolvedModuleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);
            if (resolvedModuleID === false) {
              chunk.splice(index, 1);
              continue;
            }
            var resolvedPath = (0, _path.resolve)(referencePath, resolvedModuleID);
            if (_clientnode["default"].isDirectorySync(resolvedPath)) {
              chunk.splice(index, 1);
              var _iterator8 = _createForOfIteratorHelper(_clientnode["default"].walkDirectoryRecursivelySync(resolvedPath, function (file) {
                  if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
                })),
                _step8;
              try {
                for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                  var _file$stats2;
                  var file = _step8.value;
                  if ((_file$stats2 = file.stats) !== null && _file$stats2 !== void 0 && _file$stats2.isFile()) chunk.push('./' + (0, _path.relative)(context, (0, _path.resolve)(resolvedPath, file.path)));
                }
              } catch (err) {
                _iterator8.e(err);
              } finally {
                _iterator8.f();
              }
            } else if (resolvedModuleID.startsWith('./') && !resolvedModuleID.startsWith("./".concat((0, _path.relative)(context, referencePath)))) chunk[index] = "./".concat((0, _path.relative)(context, resolvedPath));
            index += 1;
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
      }
      return normalizedGivenInjection;
    }
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param givenInjection - Given entry injection to normalize.
     *
     * @returns Normalized representation of given entry injection.
     */
  }, {
    key: "normalizeGivenInjection",
    value: function normalizeGivenInjection(givenInjection) {
      var result = {};
      if (Array.isArray(givenInjection)) result = {
        index: givenInjection
      };else if (typeof givenInjection === 'string') result = {
        index: [givenInjection]
      };else if (_clientnode["default"].isPlainObject(givenInjection)) {
        var hasContent = false;
        var chunkNamesToDelete = [];
        for (var _i8 = 0, _Object$entries3 = Object.entries(givenInjection); _i8 < _Object$entries3.length; _i8++) {
          var _Object$entries3$_i = (0, _slicedToArray2["default"])(_Object$entries3[_i8], 2),
            chunkName = _Object$entries3$_i[0],
            chunk = _Object$entries3$_i[1];
          if (Array.isArray(chunk)) {
            if (chunk.length > 0) {
              hasContent = true;
              result[chunkName] = chunk;
            } else chunkNamesToDelete.push(chunkName);
          } else {
            hasContent = true;
            result[chunkName] = [chunk];
          }
        }
        if (hasContent) {
          var _iterator9 = _createForOfIteratorHelper(chunkNamesToDelete),
            _step9;
          try {
            for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
              var _chunkName = _step9.value;
              delete result[_chunkName];
            }
          } catch (err) {
            _iterator9.e(err);
          } finally {
            _iterator9.f();
          }
        } else result = {
          index: []
        };
      }
      return result;
    }
    /**
     * Determines all concrete file paths for given injection which are marked
     * with the "__auto__" indicator.
     * @param givenInjection - Given entry and external injection to take
     * into account.
     * @param buildConfigurations - Resolved build configuration.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to use as starting point.
     * @param referencePath - Reference path from where local files should be
     * resolved.
     * @param pathsToIgnore - Paths which marks location to ignore.
     *
     * @returns Given injection with resolved marked indicators.
     */
  }, {
    key: "resolveAutoInjection",
    value: function resolveAutoInjection(givenInjection, buildConfigurations) {
      var aliases = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var moduleReplacements = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var extensions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
        file: {
          external: ['compiled.js', '.js', '.json'],
          internal: KNOWN_FILE_EXTENSIONS.map(function (suffix) {
            return ".".concat(suffix);
          })
        }
      };
      var context = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : './';
      var referencePath = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : '';
      var pathsToIgnore = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : ['.git'];
      var injection = _clientnode["default"].copy(givenInjection);
      var moduleFilePathsToExclude = Helper.determineModuleLocations(givenInjection.autoExclude, aliases, moduleReplacements, {
        file: extensions.file.internal
      }, context, referencePath, pathsToIgnore).filePaths;
      var _iterator10 = _createForOfIteratorHelper(['entry', 'external']),
        _step10;
      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var name = _step10.value;
          var injectionType = injection[name];
          /* eslint-disable curly */
          if (_clientnode["default"].isPlainObject(injectionType)) {
            for (var _i9 = 0, _Object$entries4 = Object.entries(injectionType); _i9 < _Object$entries4.length; _i9++) {
              var _Object$entries4$_i = (0, _slicedToArray2["default"])(_Object$entries4[_i9], 2),
                chunkName = _Object$entries4$_i[0],
                chunk = _Object$entries4$_i[1];
              if (chunk === '__auto__') {
                chunk = injectionType[chunkName] = [];
                var modules = Helper.getAutoInjection(buildConfigurations, moduleFilePathsToExclude, referencePath);
                for (var _i10 = 0, _Object$values5 = Object.values(modules); _i10 < _Object$values5.length; _i10++) {
                  var subChunk = _Object$values5[_i10];
                  chunk.push(subChunk);
                }
                /*
                    Reverse array to let javaScript and main files be
                    the last ones to export them rather.
                */
                chunk.reverse();
              }
            }
          } else if (injectionType === '__auto__') /* eslint-enable curly */
            injection[name] = Helper.getAutoInjection(buildConfigurations, moduleFilePathsToExclude, referencePath);
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
      return injection;
    }
    /**
     * Determines all module file paths.
     * @param buildConfigurations - Resolved build configuration.
     * @param moduleFilePathsToExclude - A list of modules file paths to
     * exclude (specified by path or id) or a mapping from chunk names to
     * module ids.
     * @param context - File path to use as starting point.
     *
     * @returns All determined module file paths.
     */
  }, {
    key: "getAutoInjection",
    value: function getAutoInjection(buildConfigurations, moduleFilePathsToExclude, context) {
      var result = {};
      var injectedModuleIDs = {};
      var _iterator11 = _createForOfIteratorHelper(buildConfigurations),
        _step11;
      try {
        for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
          var buildConfiguration = _step11.value;
          if (!injectedModuleIDs[buildConfiguration.outputExtension]) injectedModuleIDs[buildConfiguration.outputExtension] = [];
          var _iterator12 = _createForOfIteratorHelper(buildConfiguration.filePaths),
            _step12;
          try {
            for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
              var moduleFilePath = _step12.value;
              if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                var relativeModuleFilePath = "./".concat((0, _path.relative)(context, moduleFilePath));
                var directoryPath = (0, _path.dirname)(relativeModuleFilePath);
                var baseName = (0, _path.basename)(relativeModuleFilePath, ".".concat(buildConfiguration.extension));
                var moduleID = baseName;
                if (directoryPath !== '.') moduleID = (0, _path.join)(directoryPath, baseName);

                /*
                    Ensure that each output type has only one source
                    representation.
                */
                if (!injectedModuleIDs[buildConfiguration.outputExtension].includes(moduleID)) {
                  /*
                      Ensure that same module ids and different output
                      types can be distinguished by their extension
                      (JavaScript-Modules remains without extension since
                      they will be handled first because the build
                      configurations are expected to be sorted in this
                      context).
                  */
                  if (Object.prototype.hasOwnProperty.call(result, moduleID)) result[relativeModuleFilePath] = relativeModuleFilePath;else result[moduleID] = relativeModuleFilePath;
                  injectedModuleIDs[buildConfiguration.outputExtension].push(moduleID);
                }
              }
            }
          } catch (err) {
            _iterator12.e(err);
          } finally {
            _iterator12.f();
          }
        }
      } catch (err) {
        _iterator11.e(err);
      } finally {
        _iterator11.f();
      }
      return result;
    }
    // TODO test
    /**
     * Determines a resolved module file path in given package path.
     * @param packagePath - Path to package to resolve in.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - Encoding to use for file names during file traversing.
     *
     * @returns Path if found and / or additional package aliases to consider.
     */
  }, {
    key: "determineModuleFilePathInPackage",
    value: function determineModuleFilePathInPackage(packagePath) {
      var packageMainPropertyNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['main'];
      var packageAliasPropertyNames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var encoding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'utf-8';
      var result = {
        fileName: null,
        packageAliases: null
      };
      if (_clientnode["default"].isDirectorySync(packagePath)) {
        var pathToPackageJSON = (0, _path.resolve)(packagePath, 'package.json');
        if (_clientnode["default"].isFileSync(pathToPackageJSON)) {
          var localConfiguration = {};
          try {
            localConfiguration = JSON.parse((0, _fs.readFileSync)(pathToPackageJSON, {
              encoding: encoding
            }));
          } catch (error) {
            console.warn("Package configuration file \"".concat(pathToPackageJSON, "\" ") + "could not parsed: ".concat(_clientnode["default"].represent(error)));
          }
          var _iterator13 = _createForOfIteratorHelper(packageMainPropertyNames),
            _step13;
          try {
            for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
              var propertyName = _step13.value;
              if (Object.prototype.hasOwnProperty.call(localConfiguration, propertyName) && typeof localConfiguration[propertyName] === 'string' && localConfiguration[propertyName]) {
                result.fileName = localConfiguration[propertyName];
                break;
              }
            }
          } catch (err) {
            _iterator13.e(err);
          } finally {
            _iterator13.f();
          }
          var _iterator14 = _createForOfIteratorHelper(packageAliasPropertyNames),
            _step14;
          try {
            for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
              var _propertyName = _step14.value;
              if (Object.prototype.hasOwnProperty.call(localConfiguration, _propertyName) && _clientnode["default"].isPlainObject(localConfiguration[_propertyName])) {
                result.packageAliases = localConfiguration[_propertyName];
                break;
              }
            }
          } catch (err) {
            _iterator14.e(err);
          } finally {
            _iterator14.f();
          }
        }
      }
      return result;
    }
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - Encoding to use for file names during file traversing.
     *
     * @returns File path or given module id if determinations has failed or
     * wasn't necessary.
     */
  }, {
    key: "determineModuleFilePath",
    value: function determineModuleFilePath(moduleID) {
      var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var extensions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
        file: KNOWN_FILE_EXTENSIONS.map(function (suffix) {
          return ".".concat(suffix);
        })
      };
      var context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : './';
      var referencePath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
      var pathsToIgnore = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : ['.git'];
      var relativeModuleLocations = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : ['node_modules'];
      var packageEntryFileNames = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['index'];
      var packageMainPropertyNames = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['main'];
      var packageAliasPropertyNames = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];
      var encoding = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 'utf-8';
      if (!moduleID) return null;
      moduleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);
      if (!moduleID) return null;
      var moduleFilePath = moduleID;
      if (moduleFilePath.startsWith('./')) moduleFilePath = (0, _path.join)(referencePath, moduleFilePath);
      var moduleLocations = [referencePath].concat(relativeModuleLocations.map(function (filePath) {
        return (0, _path.resolve)(context, filePath);
      }));
      var parts = context.split('/');
      parts.splice(-1, 1);
      while (parts.length > 0) {
        var _iterator15 = _createForOfIteratorHelper(relativeModuleLocations),
          _step15;
        try {
          for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
            var relativePath = _step15.value;
            moduleLocations.push((0, _path.join)('/', parts.join('/'), relativePath));
          }
        } catch (err) {
          _iterator15.e(err);
        } finally {
          _iterator15.f();
        }
        parts.splice(-1, 1);
      }
      var _iterator16 = _createForOfIteratorHelper([referencePath].concat(moduleLocations)),
        _step16;
      try {
        for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
          var moduleLocation = _step16.value;
          var _iterator17 = _createForOfIteratorHelper(['', '__package__'].concat(packageEntryFileNames)),
            _step17;
          try {
            for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
              var fileName = _step17.value;
              var _iterator18 = _createForOfIteratorHelper([''].concat(extensions.file)),
                _step18;
              try {
                for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
                  var fileExtension = _step18.value;
                  var currentModuleFilePath = void 0;
                  if (moduleFilePath.startsWith('/')) currentModuleFilePath = (0, _path.resolve)(moduleFilePath);else currentModuleFilePath = (0, _path.resolve)(moduleLocation, moduleFilePath);
                  var packageAliases = {};
                  if (fileName === '__package__') {
                    var result = Helper.determineModuleFilePathInPackage(currentModuleFilePath, packageMainPropertyNames, packageAliasPropertyNames, encoding);
                    if (result.fileName) fileName = result.fileName;
                    if (result.packageAliases) packageAliases = result.packageAliases;
                    if (fileName === '__package__') continue;
                  }
                  var resolvedFileName = Helper.applyModuleReplacements(Helper.applyAliases(fileName, packageAliases), moduleReplacements);
                  if (resolvedFileName === false) continue;
                  if (resolvedFileName) currentModuleFilePath = (0, _path.resolve)(currentModuleFilePath, "".concat(resolvedFileName).concat(fileExtension));else currentModuleFilePath += "".concat(resolvedFileName).concat(fileExtension);
                  if (Helper.isFilePathInLocation(currentModuleFilePath, pathsToIgnore)) continue;
                  if (_clientnode["default"].isFileSync(currentModuleFilePath)) return currentModuleFilePath;
                }
              } catch (err) {
                _iterator18.e(err);
              } finally {
                _iterator18.f();
              }
            }
          } catch (err) {
            _iterator17.e(err);
          } finally {
            _iterator17.f();
          }
        }
      } catch (err) {
        _iterator16.e(err);
      } finally {
        _iterator16.f();
      }
      return null;
    }
    // endregion
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     *
     * @returns The alias applied given module id.
     */
  }, {
    key: "applyAliases",
    value: function applyAliases(moduleID, aliases) {
      for (var _i11 = 0, _Object$entries5 = Object.entries(aliases); _i11 < _Object$entries5.length; _i11++) {
        var _Object$entries5$_i = (0, _slicedToArray2["default"])(_Object$entries5[_i11], 2),
          name = _Object$entries5$_i[0],
          alias = _Object$entries5$_i[1];
        if (name.endsWith('$')) {
          if (moduleID === name.substring(0, name.length - 1)) moduleID = alias;
        } else if (typeof moduleID === 'string') moduleID = moduleID.replace(name, alias);
      }
      return moduleID;
    }
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param replacements - Mapping of regular expressions to their
     * corresponding replacements.
     *
     * @returns The replacement applied given module id.
     */
  }, {
    key: "applyModuleReplacements",
    value: function applyModuleReplacements(moduleID, replacements) {
      if (moduleID === false) return moduleID;
      for (var _i12 = 0, _Object$entries6 = Object.entries(replacements); _i12 < _Object$entries6.length; _i12++) {
        var _Object$entries6$_i = (0, _slicedToArray2["default"])(_Object$entries6[_i12], 2),
          search = _Object$entries6$_i[0],
          replacement = _Object$entries6$_i[1];
        moduleID = moduleID.replace(new RegExp(search), replacement);
      }
      return moduleID;
    }
    /**
     * Determines the nearest package configuration file from given file path.
     * @param start - Reference location to search from.
     * @param fileName - Package configuration file name.
     *
     * @returns Determined file path.
     */
  }, {
    key: "findPackageDescriptorFilePath",
    value: function findPackageDescriptorFilePath(start) {
      var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'package.json';
      if (typeof start === 'string') {
        if (!start.endsWith(_path.sep)) start += _path.sep;
        start = start.split(_path.sep);
      }
      if (!start.length) return null;
      start.pop();
      var result = (0, _path.resolve)(start.join(_path.sep), fileName);
      try {
        if ((0, _fs.existsSync)(result)) return result;
        /* eslint-disable no-empty */
      } catch (error) {}
      /* eslint-enable no-empty */

      return Helper.findPackageDescriptorFilePath(start, fileName);
    }
    /**
     * Determines the nearest package configuration from given module file
     * path.
     * @param modulePath - Module path to take as reference location (leaf in
     * tree).
     * @param fileName - Package configuration file name.
     *
     * @returns A object containing found parsed configuration an their
     * corresponding file path.
     */
  }, {
    key: "getClosestPackageDescriptor",
    value: function getClosestPackageDescriptor(modulePath) {
      var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'package.json';
      var filePath = Helper.findPackageDescriptorFilePath(modulePath, fileName);
      if (!filePath) return null;
      var configuration = (0, _clientnode.currentRequire)(filePath);
      /*
          If the package.json does not have a name property, try again from
          one level higher.
      */
      if (!configuration.name) return Helper.getClosestPackageDescriptor((0, _path.resolve)((0, _path.dirname)(filePath), '..'), fileName);
      if (!configuration.version) configuration.version = 'not set';
      return {
        configuration: configuration,
        filePath: filePath
      };
    }
  }]);
  return Helper;
}();
exports.Helper = Helper;
var _default = Helper; // endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
exports["default"] = _default;
