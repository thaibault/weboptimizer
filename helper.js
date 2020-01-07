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
exports["default"] = exports.Helper = exports.KNOWN_FILE_EXTENSIONS = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _clientnode = _interopRequireDefault(require("clientnode"));

var _jsdom = require("jsdom");

var _fs = _interopRequireDefault(require("fs"));

var _path2 = _interopRequireDefault(require("path"));

var KNOWN_FILE_EXTENSIONS = ['js', 'ts', 'json', 'css', 'eot', 'gif', 'html', 'ico', 'jpg', 'png', 'ejs', 'svg', 'ttf', 'woff', '.woff2']; // endregion
// region methods

/**
 * Provides a class of static methods with generic use cases.
 */

exports.KNOWN_FILE_EXTENSIONS = KNOWN_FILE_EXTENSIONS;

var Helper =
/*#__PURE__*/
function () {
  function Helper() {
    (0, _classCallCheck2["default"])(this, Helper);
  }

  (0, _createClass2["default"])(Helper, null, [{
    key: "isFilePathInLocation",
    // region boolean

    /**
     * Determines whether given file path is within given list of file
     * locations.
     * @param filePath - Path to file to check.
     * @param locationsToCheck - Locations to take into account.
     * @returns Value "true" if given file path is within one of given
     * locations or "false" otherwise.
     */
    value: function isFilePathInLocation(filePath, locationsToCheck) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = locationsToCheck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var pathToCheck = _step.value;
          if (_path2["default"].resolve(filePath).startsWith(_path2["default"].resolve(pathToCheck))) return true;
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

      return false;
    } // endregion
    // region string

    /**
     * In places each matching cascading style sheet or javaScript file
     * reference.
     * @param content - Markup content to process.
     * @param cascadingStyleSheetPattern - Pattern to match cascading style
     * sheet asset references again.
     * @param javaScriptPattern - Pattern to match javaScript asset references
     * again.
     * @param basePath - Base path to use as prefix for file references.
     * @param cascadingStyleSheetChunkNameTemplate - Cascading style sheet
     * chunk name template to use for asset matching.
     * @param javaScriptChunkNameTemplate - JavaScript chunk name template to
     * use for asset matching.
     * @param assets - Mapping of asset file paths to their content.
     * @returns Given an transformed markup.
     */

  }, {
    key: "inPlaceCSSAndJavaScriptAssetReferences",
    value: function inPlaceCSSAndJavaScriptAssetReferences(content, cascadingStyleSheetPattern, javaScriptPattern, basePath, cascadingStyleSheetChunkNameTemplate, javaScriptChunkNameTemplate, assets) {
      /*
          NOTE: We have to prevent creating native "style" dom nodes to
          prevent jsdom from parsing the entire cascading style sheet. Which
          is error prune and very resource intensive.
      */
      var styleContents = [];
      content = content.replace(/(<style[^>]*>)([\s\S]*?)(<\/style[^>]*>)/gi, function (match, startTag, content, endTag) {
        styleContents.push(content);
        return "".concat(startTag).concat(endTag);
      });
      /*
          NOTE: We have to translate template delimiter to html compatible
          sequences and translate it back later to avoid unexpected escape
          sequences in resulting html.
      */

      var window = new _jsdom.JSDOM(content.replace(/<%/g, '##+#+#+##').replace(/%>/g, '##-#-#-##')).window;
      var inPlaceStyleContents = [];
      var filePathsToRemove = [];

      for (var _i = 0, _arr = [{
        attributeName: 'href',
        hash: 'hash',
        linkTagName: 'link',
        pattern: cascadingStyleSheetPattern,
        selector: '[href*=".css"]',
        tagName: 'style',
        template: cascadingStyleSheetChunkNameTemplate
      }, {
        attributeName: 'src',
        hash: 'hash',
        linkTagName: 'script',
        pattern: javaScriptPattern,
        selector: '[href*=".js"]',
        tagName: 'script',
        template: javaScriptChunkNameTemplate
      }]; _i < _arr.length; _i++) {
        var assetType = _arr[_i];
        if (assetType.pattern) for (var pattern in assetType.pattern) {
          var _Helper$renderFilePat;

          if (!Object.prototype.hasOwnProperty.call(assetType.pattern, pattern)) continue;
          var selector = assetType.selector;
          if (pattern !== '*') selector = "[".concat(assetType.attributeName, "^=\"") + _path2["default"].relative(basePath, Helper.renderFilePathTemplate(assetType.template, (_Helper$renderFilePat = {}, (0, _defineProperty2["default"])(_Helper$renderFilePat, "[".concat(assetType.hash, "]"), ''), (0, _defineProperty2["default"])(_Helper$renderFilePat, '[id]', pattern), (0, _defineProperty2["default"])(_Helper$renderFilePat, '[name]', pattern), _Helper$renderFilePat))) + '"]';
          var domNodes = window.document.querySelectorAll("".concat(assetType.linkTagName).concat(selector));

          if (domNodes.length) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = domNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var domNode = _step2.value;

                var _path = domNode.attributes[assetType.attributeName].value.replace(/&.*/g, '');

                if (!Object.prototype.hasOwnProperty.call(assets, _path)) continue;
                var inPlaceDomNode = window.document.createElement(assetType.tagName);

                if (assetType.tagName === 'style') {
                  inPlaceDomNode.setAttribute('weboptimizerinplace', 'true');
                  inPlaceStyleContents.push(assets[_path].source());
                } else inPlaceDomNode.textContent = assets[_path].source();

                if (assetType.pattern[pattern] === 'body') window.document.body.appendChild(inPlaceDomNode);else if (assetType.pattern[pattern] === 'in') domNode.parentNode.insertBefore(inPlaceDomNode, domNode);else if (assetType.pattern[pattern] === 'head') window.document.head.appendChild(inPlaceDomNode);else {
                  var regularExpressionPattern = '(after|before|in):(.+)';
                  var testMatch = new RegExp(regularExpressionPattern).exec(assetType.pattern[pattern]);
                  var match = void 0;
                  if (testMatch) match = testMatch;else throw new Error('Given in place specification "' + "".concat(assetType.pattern[pattern], "\" for ") + "".concat(assetType.tagName, " does not ") + 'satisfy the specified pattern "' + "".concat(regularExpressionPattern, "\"."));

                  var _domNode = window.document.querySelector(match[2]);

                  if (!_domNode) throw new Error("Specified dom node \"".concat(match[2], "\" ") + 'could not be found to in place "' + "".concat(pattern, "\"."));
                  if (match[1] === 'in') _domNode.appendChild(inPlaceDomNode);else if (match[1] === 'before') _domNode.parentNode.insertBefore(inPlaceDomNode, _domNode);else _domNode.parentNode.insertAfter(inPlaceDomNode, _domNode);
                }
                domNode.parentNode.removeChild(domNode);
                /*
                    NOTE: This doesn't prevent webpack from
                    creating this file if present in another chunk
                    so removing it (and a potential source map
                    file) later in the "done" hook.
                */

                filePathsToRemove.push(Helper.stripLoader(_path));
                delete assets[_path];
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
          } else console.warn("No referenced ".concat(assetType.tagName, " file in ") + 'resulting markup found with selector: "' + "".concat(assetType.linkTagName).concat(assetType.selector, "\""));
        }
      } // NOTE: We have to restore template delimiter and style contents.


      return {
        content: content.replace(/^(\s*<!doctype [^>]+?>\s*)[\s\S]*$/i, '$1') + window.document.documentElement.outerHTML.replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>').replace(/(<style[^>]*>)[\s\S]*?(<\/style[^>]*>)/gi, function (match, startTag, endTag) {
          if (startTag.includes(' weboptimizerinplace="true"')) return startTag.replace(' weboptimizerinplace="true"', '') + "".concat(inPlaceStyleContents.shift()).concat(endTag);
          return "".concat(startTag).concat(styleContents.shift()).concat(endTag);
        }),
        filePathsToRemove: filePathsToRemove
      };
    }
    /**
     * Strips loader informations form given module request including loader
     * prefix and query parameter.
     * @param moduleID - Module request to strip.
     * @returns Given module id stripped.
     */

  }, {
    key: "stripLoader",
    value: function stripLoader(moduleID) {
      moduleID = moduleID.toString();
      var moduleIDWithoutLoader = moduleID.substring(moduleID.lastIndexOf('!') + 1);
      return moduleIDWithoutLoader.includes('?') ? moduleIDWithoutLoader.substring(0, moduleIDWithoutLoader.indexOf('?')) : moduleIDWithoutLoader;
    } // endregion
    // region array

    /**
     * Converts given list of path to a normalized list with unique values.
     * @param paths - File paths.
     * @returns The given file path list with normalized unique values.
     */

  }, {
    key: "normalizePaths",
    value: function normalizePaths(paths) {
      return Array.from(new Set(paths.map(function (givenPath) {
        givenPath = _path2["default"].normalize(givenPath);
        if (givenPath.endsWith('/')) return givenPath.substring(0, givenPath.length - 1);
        return givenPath;
      })));
    } // endregion
    // region file handler

    /**
     * Applies file path/name placeholder replacements with given bundle
     * associated informations.
     * @param template - File path to process placeholder in.
     * @param scope - Scope to use for processing.
     * @returns Processed file path.
     */

  }, {
    key: "renderFilePathTemplate",
    value: function renderFilePathTemplate(template) {
      var scope = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      scope = _clientnode["default"].extend({
        '[hash]': '.__dummy__',
        '[id]': '.__dummy__',
        '[name]': '.__dummy__'
      }, scope);
      var filePath = template;

      for (var placeholderName in scope) {
        if (Object.prototype.hasOwnProperty.call(scope, placeholderName)) filePath = filePath.replace(new RegExp(_clientnode["default"].stringEscapeRegularExpressions(placeholderName), 'g'), scope[placeholderName]);
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
      referencePath = _path2["default"].resolve(referencePath);

      if (request.startsWith('./') && _path2["default"].resolve(context) !== referencePath) {
        request = _path2["default"].resolve(context, request);
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = relativeModuleLocations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var modulePath = _step3.value;

            var pathPrefix = _path2["default"].resolve(referencePath, modulePath);

            if (request.startsWith(pathPrefix)) {
              request = request.substring(pathPrefix.length);
              if (request.startsWith('/')) request = request.substring(1);
              return Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
            }
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
     * @param normalizedEntryInjection - Mapping of chunk names to modules
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
     * @returns A new resolved request indicating whether given request is an
     * external one.
     */

  }, {
    key: "determineExternalRequest",
    value: function determineExternalRequest(request) {
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
      var requestContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : './';
      var normalizedEntryInjection = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var relativeExternalModuleLocations = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ['node_modules'];
      var aliases = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      var moduleReplacements = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
      var extensions = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : {
        file: {
          external: ['.compiled.js', '.js', '.json'],
          internal: KNOWN_FILE_EXTENSIONS.map(function (suffix) {
            return ".".concat(suffix);
          })
        },
        module: []
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
      context = _path2["default"].resolve(context);
      requestContext = _path2["default"].resolve(requestContext);
      referencePath = _path2["default"].resolve(referencePath); // NOTE: We apply alias on externals additionally.

      var resolvedRequest = Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
      if (_clientnode["default"].isAnyMatching(resolvedRequest, excludePattern)) return null;
      /*
          NOTE: Aliases and module replacements doesn't have to be forwarded
          since we pass an already resolved request.
      */

      var filePath = Helper.determineModuleFilePath(resolvedRequest, {}, {}, {
        file: extensions.file.external,
        module: extensions.module
      }, context, requestContext, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
      /*
          NOTE: We mark dependencies as external if there file couldn't be
          resolved or are specified to be external explicitly.
      */

      if (!(filePath || inPlaceNormalLibrary) || _clientnode["default"].isAnyMatching(resolvedRequest, includePattern)) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleLocations);

      for (var chunkName in normalizedEntryInjection) {
        if (Object.prototype.hasOwnProperty.call(normalizedEntryInjection, chunkName)) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = normalizedEntryInjection[chunkName][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var moduleID = _step4.value;
              if (Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, {
                file: extensions.file.internal,
                module: extensions.module
              }, context, requestContext, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding) === filePath) return null;
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
      }

      var parts = context.split('/');
      var externalModuleLocations = [];

      while (parts.length > 0) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = relativeExternalModuleLocations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var relativePath = _step5.value;
            externalModuleLocations.push(_path2["default"].join('/', parts.join('/'), relativePath));
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

        parts.splice(-1, 1);
      }
      /*
          NOTE: We mark dependencies as external if they does not contain a
          loader in their request and aren't part of the current main package
          or have a file extension other than javaScript aware.
      */


      if (!inPlaceNormalLibrary && (extensions.file.external.length === 0 || filePath && extensions.file.external.includes(_path2["default"].extname(filePath)) || !filePath && extensions.file.external.includes('')) && !(inPlaceDynamicLibrary && request.includes('!')) && (!filePath && inPlaceDynamicLibrary || filePath && (!filePath.startsWith(context) || Helper.isFilePathInLocation(filePath, externalModuleLocations)))) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleLocations);
      return null;
    }
    /**
     * Determines asset type of given file.
     * @param filePath - Path to file to analyse.
     * @param buildConfiguration - Meta informations for available asset
     * types.
     * @param paths - List of paths to search if given path doesn't reference
     * a file directly.
     * @returns Determined file type or "null" of given file couldn't be
     * determined.
     */

  }, {
    key: "determineAssetType",
    value: function determineAssetType(filePath, buildConfiguration, paths) {
      var result = null;

      for (var type in buildConfiguration) {
        if (_path2["default"].extname(filePath) === ".".concat(buildConfiguration[type].extension)) {
          result = type;
          break;
        }
      }

      if (!result) {
        for (var _i2 = 0, _arr2 = ['source', 'target']; _i2 < _arr2.length; _i2++) {
          var _type = _arr2[_i2];

          for (var assetType in paths[_type].asset) {
            if (Object.prototype.hasOwnProperty.call(paths[_type].asset, assetType) && assetType !== 'base' && paths[_type].asset[assetType] && filePath.startsWith(paths[_type].asset[assetType])) return assetType;
          }
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
     * @returns Converted build configuration.
     */

  }, {
    key: "resolveBuildConfigurationFilePaths",
    value: function resolveBuildConfigurationFilePaths(configuration) {
      var entryPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
      var pathsToIgnore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['.git'];
      var mainFileBasenames = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ['index', 'main'];
      var buildConfiguration = [];

      for (var type in configuration) {
        if (Object.prototype.hasOwnProperty.call(configuration, type)) {
          var newItem = _clientnode["default"].extend(true, {
            filePaths: []
          }, configuration[type]);

          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = _clientnode["default"].walkDirectoryRecursivelySync(entryPath, function (file) {
              if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
            })[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var file = _step6.value;
              if (file.stats && file.stats.isFile() && _path2["default"].extname(file.path).substring(1) === newItem.extension && !new RegExp(newItem.filePathPattern).test(file.path)) newItem.filePaths.push(file.path);
            }
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

          newItem.filePaths.sort(function (firstFilePath, secondFilePath) {
            if (mainFileBasenames.includes(_path2["default"].basename(firstFilePath, _path2["default"].extname(firstFilePath)))) {
              if (mainFileBasenames.includes(_path2["default"].basename(secondFilePath, _path2["default"].extname(secondFilePath)))) return 0;
            } else if (mainFileBasenames.includes(_path2["default"].basename(secondFilePath, _path2["default"].extname(secondFilePath)))) return 1;

            return 0;
          });
          buildConfiguration.push(newItem);
        }
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
     * @param entryInjection - List of module ids or module file paths.
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
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */

  }, {
    key: "determineModuleLocations",
    value: function determineModuleLocations(entryInjection) {
      var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var extensions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
        file: KNOWN_FILE_EXTENSIONS.map(function (suffix) {
          return ".".concat(suffix);
        }),
        module: []
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
      var normalizedEntryInjection = Helper.resolveModulesInFolders(Helper.normalizeEntryInjection(entryInjection), aliases, moduleReplacements, context, referencePath, pathsToIgnore);

      for (var chunkName in normalizedEntryInjection) {
        if (Object.prototype.hasOwnProperty.call(normalizedEntryInjection, chunkName)) {
          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = normalizedEntryInjection[chunkName][Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var moduleID = _step7.value;
              var filePath = Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, referencePath, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);

              if (filePath) {
                filePaths.push(filePath);

                var directoryPath = _path2["default"].dirname(filePath);

                if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
              }
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
                _iterator7["return"]();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }
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
     * @param normalizedEntryInjection - Injection data structure of modules
     * with folder references to resolve.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @returns Given injections with resolved folder pointing modules.
     */

  }, {
    key: "resolveModulesInFolders",
    value: function resolveModulesInFolders(normalizedEntryInjection) {
      var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : './';
      var referencePath = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
      var pathsToIgnore = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : ['.git'];
      if (referencePath.startsWith('/')) referencePath = _path2["default"].relative(context, referencePath);

      for (var chunkName in normalizedEntryInjection) {
        if (Object.prototype.hasOwnProperty.call(normalizedEntryInjection, chunkName)) {
          var index = 0;
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = normalizedEntryInjection[chunkName][Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var moduleID = _step8.value;
              moduleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);

              var resolvedPath = _path2["default"].resolve(referencePath, moduleID);

              if (_clientnode["default"].isDirectorySync(resolvedPath)) {
                normalizedEntryInjection[chunkName].splice(index, 1);
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                  for (var _iterator9 = _clientnode["default"].walkDirectoryRecursivelySync(resolvedPath, function (file) {
                    if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
                  })[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var file = _step9.value;
                    if (file.stats && file.stats.isFile()) normalizedEntryInjection[chunkName].push('./' + _path2["default"].relative(referencePath, _path2["default"].resolve(resolvedPath, file.path)));
                  }
                } catch (err) {
                  _didIteratorError9 = true;
                  _iteratorError9 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                      _iterator9["return"]();
                    }
                  } finally {
                    if (_didIteratorError9) {
                      throw _iteratorError9;
                    }
                  }
                }
              } else if (moduleID.startsWith('./') && !moduleID.startsWith("./".concat(_path2["default"].relative(context, referencePath)))) normalizedEntryInjection[chunkName][index] = "./".concat(_path2["default"].relative(context, resolvedPath));

              index += 1;
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                _iterator8["return"]();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }
      }

      return normalizedEntryInjection;
    }
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param entryInjection - Given entry injection to normalize.
     * @returns Normalized representation of given entry injection.
     */

  }, {
    key: "normalizeEntryInjection",
    value: function normalizeEntryInjection(entryInjection) {
      var result = {};
      if (_clientnode["default"].isFunction(entryInjection)) entryInjection = entryInjection();
      if (Array.isArray(entryInjection)) result = {
        index: entryInjection
      };else if (typeof entryInjection === 'string') result = {
        index: [entryInjection]
      };else if (_clientnode["default"].isPlainObject(entryInjection)) {
        var hasContent = false;
        var chunkNamesToDelete = [];

        for (var chunkName in entryInjection) {
          if (Object.prototype.hasOwnProperty.call(entryInjection, chunkName)) if (Array.isArray(entryInjection[chunkName])) {
            if (entryInjection[chunkName].length > 0) {
              hasContent = true;
              result[chunkName] = entryInjection[chunkName];
            } else chunkNamesToDelete.push(chunkName);
          } else {
            hasContent = true;
            result[chunkName] = [entryInjection[chunkName]];
          }
        }

        if (hasContent) {
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = chunkNamesToDelete[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var _chunkName = _step10.value;
              delete result[_chunkName];
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
                _iterator10["return"]();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
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
     * @param modulesToExclude - A list of modules to exclude (specified by
     * path or id) or a mapping from chunk names to module ids.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to use as starting point.
     * @param referencePath - Reference path from where local files should be
     * resolved.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @returns Given injection with resolved marked indicators.
     */

  }, {
    key: "resolveInjection",
    value: function resolveInjection(givenInjection, buildConfigurations, modulesToExclude) {
      var aliases = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var moduleReplacements = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      var extensions = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
        file: {
          external: ['compiled.js', '.js', '.json'],
          internal: KNOWN_FILE_EXTENSIONS.map(function (suffix) {
            return ".".concat(suffix);
          })
        },
        module: []
      };
      var context = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : './';
      var referencePath = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '';
      var pathsToIgnore = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['.git'];

      var injection = _clientnode["default"].extend(true, {}, givenInjection);

      var moduleFilePathsToExclude = Helper.determineModuleLocations(modulesToExclude, aliases, moduleReplacements, {
        file: extensions.file.internal,
        module: extensions.module
      }, context, referencePath, pathsToIgnore).filePaths;

      for (var _i3 = 0, _arr3 = ['entry', 'external']; _i3 < _arr3.length; _i3++) {
        var type = _arr3[_i3];

        /* eslint-disable curly */
        if ((0, _typeof2["default"])(injection[type]) === 'object') {
          for (var chunkName in injection[type]) {
            if (injection[type][chunkName] === '__auto__') {
              injection[type][chunkName] = [];
              var modules = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, referencePath);

              for (var subChunkName in modules) {
                if (Object.prototype.hasOwnProperty.call(modules, subChunkName)) injection[type][chunkName].push(modules[subChunkName]);
              }
              /*
                  Reverse array to let javaScript and main files be
                  the last ones to export them rather.
              */


              injection[type][chunkName].reverse();
            }
          }
        } else if (injection[type] === '__auto__')
          /* eslint-enable curly */
          injection[type] = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
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
     * @returns All determined module file paths.
     */

  }, {
    key: "getAutoChunk",
    value: function getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context) {
      var result = {};
      var injectedModuleIDs = {};
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = buildConfigurations[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var buildConfiguration = _step11.value;
          if (!injectedModuleIDs[buildConfiguration.outputExtension]) injectedModuleIDs[buildConfiguration.outputExtension] = [];
          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = buildConfiguration.filePaths[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var moduleFilePath = _step12.value;

              if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                var relativeModuleFilePath = './' + _path2["default"].relative(context, moduleFilePath);

                var directoryPath = _path2["default"].dirname(relativeModuleFilePath);

                var baseName = _path2["default"].basename(relativeModuleFilePath, ".".concat(buildConfiguration.extension));

                var moduleID = baseName;
                if (directoryPath !== '.') moduleID = _path2["default"].join(directoryPath, baseName);
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
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
                _iterator12["return"]();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
            _iterator11["return"]();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
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
        }),
        module: []
      };
      var context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : './';
      var referencePath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
      var pathsToIgnore = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : ['.git'];
      var relativeModuleLocations = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : ['node_modules'];
      var packageEntryFileNames = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['index'];
      var packageMainPropertyNames = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['main'];
      var packageAliasPropertyNames = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];
      var encoding = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 'utf-8';
      moduleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);
      if (!moduleID) return null;
      var moduleFilePath = moduleID;
      if (moduleFilePath.startsWith('./')) moduleFilePath = _path2["default"].join(referencePath, moduleFilePath);
      var moduleLocations = [referencePath].concat(relativeModuleLocations.map(function (filePath) {
        return _path2["default"].resolve(context, filePath);
      }));
      var parts = context.split('/');
      parts.splice(-1, 1);

      while (parts.length > 0) {
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = relativeModuleLocations[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var relativePath = _step13.value;
            moduleLocations.push(_path2["default"].join('/', parts.join('/'), relativePath));
          }
        } catch (err) {
          _didIteratorError13 = true;
          _iteratorError13 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
              _iterator13["return"]();
            }
          } finally {
            if (_didIteratorError13) {
              throw _iteratorError13;
            }
          }
        }

        parts.splice(-1, 1);
      }

      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = [referencePath].concat(moduleLocations)[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var moduleLocation = _step14.value;
          var _iteratorNormalCompletion15 = true;
          var _didIteratorError15 = false;
          var _iteratorError15 = undefined;

          try {
            for (var _iterator15 = ['', '__package__'].concat(packageEntryFileNames)[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
              var fileName = _step15.value;
              var _iteratorNormalCompletion16 = true;
              var _didIteratorError16 = false;
              var _iteratorError16 = undefined;

              try {
                for (var _iterator16 = extensions.module.concat([''])[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                  var moduleExtension = _step16.value;
                  var _iteratorNormalCompletion17 = true;
                  var _didIteratorError17 = false;
                  var _iteratorError17 = undefined;

                  try {
                    for (var _iterator17 = [''].concat(extensions.file)[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                      var fileExtension = _step17.value;
                      var currentModuleFilePath = void 0;
                      if (moduleFilePath.startsWith('/')) currentModuleFilePath = _path2["default"].resolve(moduleFilePath);else currentModuleFilePath = _path2["default"].resolve(moduleLocation, moduleFilePath);
                      var packageAliases = {};

                      if (fileName === '__package__') {
                        if (_clientnode["default"].isDirectorySync(currentModuleFilePath)) {
                          var pathToPackageJSON = _path2["default"].resolve(currentModuleFilePath, 'package.json');

                          if (_clientnode["default"].isFileSync(pathToPackageJSON)) {
                            var localConfiguration = {};

                            try {
                              localConfiguration = JSON.parse(_fs["default"].readFileSync(pathToPackageJSON, {
                                encoding: encoding
                              }));
                            } catch (error) {}

                            var _iteratorNormalCompletion18 = true;
                            var _didIteratorError18 = false;
                            var _iteratorError18 = undefined;

                            try {
                              for (var _iterator18 = packageMainPropertyNames[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                                var propertyName = _step18.value;

                                if (Object.prototype.hasOwnProperty.call(localConfiguration, propertyName) && typeof localConfiguration[propertyName] === 'string' && localConfiguration[propertyName]) {
                                  fileName = localConfiguration[propertyName];
                                  break;
                                }
                              }
                            } catch (err) {
                              _didIteratorError18 = true;
                              _iteratorError18 = err;
                            } finally {
                              try {
                                if (!_iteratorNormalCompletion18 && _iterator18["return"] != null) {
                                  _iterator18["return"]();
                                }
                              } finally {
                                if (_didIteratorError18) {
                                  throw _iteratorError18;
                                }
                              }
                            }

                            var _iteratorNormalCompletion19 = true;
                            var _didIteratorError19 = false;
                            var _iteratorError19 = undefined;

                            try {
                              for (var _iterator19 = packageAliasPropertyNames[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                                var _propertyName = _step19.value;

                                if (Object.prototype.hasOwnProperty.call(localConfiguration, _propertyName) && (0, _typeof2["default"])(localConfiguration[_propertyName]) === 'object') {
                                  packageAliases = localConfiguration[_propertyName];
                                  break;
                                }
                              }
                            } catch (err) {
                              _didIteratorError19 = true;
                              _iteratorError19 = err;
                            } finally {
                              try {
                                if (!_iteratorNormalCompletion19 && _iterator19["return"] != null) {
                                  _iterator19["return"]();
                                }
                              } finally {
                                if (_didIteratorError19) {
                                  throw _iteratorError19;
                                }
                              }
                            }
                          }
                        }

                        if (fileName === '__package__') continue;
                      }

                      fileName = Helper.applyModuleReplacements(Helper.applyAliases(fileName, packageAliases), moduleReplacements);
                      if (fileName) currentModuleFilePath = _path2["default"].resolve(currentModuleFilePath, "".concat(fileName).concat(moduleExtension).concat(fileExtension));else currentModuleFilePath += "".concat(fileName).concat(moduleExtension).concat(fileExtension);
                      if (Helper.isFilePathInLocation(currentModuleFilePath, pathsToIgnore)) continue;
                      if (_clientnode["default"].isFileSync(currentModuleFilePath)) return currentModuleFilePath;
                    }
                  } catch (err) {
                    _didIteratorError17 = true;
                    _iteratorError17 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion17 && _iterator17["return"] != null) {
                        _iterator17["return"]();
                      }
                    } finally {
                      if (_didIteratorError17) {
                        throw _iteratorError17;
                      }
                    }
                  }
                }
              } catch (err) {
                _didIteratorError16 = true;
                _iteratorError16 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion16 && _iterator16["return"] != null) {
                    _iterator16["return"]();
                  }
                } finally {
                  if (_didIteratorError16) {
                    throw _iteratorError16;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError15 = true;
            _iteratorError15 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion15 && _iterator15["return"] != null) {
                _iterator15["return"]();
              }
            } finally {
              if (_didIteratorError15) {
                throw _iteratorError15;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14["return"] != null) {
            _iterator14["return"]();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }

      return null;
    } // endregion

    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @returns The alias applied given module id.
     */

  }, {
    key: "applyAliases",
    value: function applyAliases(moduleID, aliases) {
      for (var alias in aliases) {
        if (alias.endsWith('$')) {
          if (moduleID === alias.substring(0, alias.length - 1)) moduleID = aliases[alias];
        } else moduleID = moduleID.replace(alias, aliases[alias]);
      }

      return moduleID;
    }
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param replacements - Mapping of regular expressions to their
     * corresponding replacements.
     * @returns The replacement applied given module id.
     */

  }, {
    key: "applyModuleReplacements",
    value: function applyModuleReplacements(moduleID, replacements) {
      for (var replacement in replacements) {
        if (Object.prototype.hasOwnProperty.call(replacements, replacement)) moduleID = moduleID.replace(new RegExp(replacement), replacements[replacement]);
      }

      return moduleID;
    }
    /**
     * Determines the nearest package configuration file from given file path.
     * @param start - Reference location to search from.
     * @param fileName - Package configuration file name.
     * @returns Determined file path.
     */

  }, {
    key: "findPackageDescriptorFilePath",
    value: function findPackageDescriptorFilePath(start) {
      var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'package.json';

      if (typeof start === 'string') {
        if (start[start.length - 1] !== _path2["default"].sep) start += _path2["default"].sep;
        start = start.split(_path2["default"].sep);
      }

      if (!start.length) return null;
      start.pop();

      var result = _path2["default"].resolve(start.join(_path2["default"].sep), fileName);

      try {
        if (_fs["default"].existsSync(result)) return result;
      } catch (error) {}

      return Helper.findPackageDescriptorFilePath(start, fileName);
    }
    /**
     * Determines the nearest package configuration from given module file
     * path.
     * @param modulePath - Module path to take as reference location (leaf in
     * tree).
     * @param fileName - Package configuration file name.
     * @returns A object containing found parsed configuration an their
     * corresponding file path.
     */

  }, {
    key: "getClosestPackageDescriptor",
    value: function getClosestPackageDescriptor(modulePath) {
      var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'package.json';
      var filePath = Helper.findPackageDescriptorFilePath(modulePath, fileName);
      if (!filePath) return null;
      var configuration = eval('require')(filePath);
      /*
          If the package.json does not have a name property, try again from
          one level higher.
      */

      if (!configuration.name) return Helper.getClosestPackageDescriptor(_path2["default"].resolve(_path2["default"].dirname(filePath), '..'), fileName);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUssQ0FBQyxLQUFOLENBQVksa0JBQUssR0FBakIsQ0FBUjtBQUNIOztBQUNELFVBQUksQ0FBQyxLQUFLLENBQUMsTUFBWCxFQUNJLE9BQU8sSUFBUDtBQUNKLE1BQUEsS0FBSyxDQUFDLEdBQU47O0FBQ0EsVUFBTSxNQUFhLEdBQUcsa0JBQUssT0FBTCxDQUNsQixLQUFLLENBQUMsSUFBTixDQUFXLGtCQUFLLEdBQWhCLENBRGtCLEVBQ0ksUUFESixDQUF0Qjs7QUFFQSxVQUFJO0FBQ0EsWUFBSSxlQUFXLFVBQVgsQ0FBc0IsTUFBdEIsQ0FBSixFQUNJLE9BQU8sTUFBUDtBQUNQLE9BSEQsQ0FHRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUNsQixhQUFPLE1BQU0sQ0FBQyw2QkFBUCxDQUFxQyxLQUFyQyxFQUE0QyxRQUE1QyxDQUFQO0FBQ0g7QUFDRDs7Ozs7Ozs7Ozs7O2dEQVVJLFUsRUFDZTtBQUFBLFVBREksUUFDSix1RUFEZSxjQUNmO0FBQ2YsVUFBTSxRQUFvQixHQUFHLE1BQU0sQ0FBQyw2QkFBUCxDQUN6QixVQUR5QixFQUNiLFFBRGEsQ0FBN0I7QUFFQSxVQUFJLENBQUMsUUFBTCxFQUNJLE9BQU8sSUFBUDtBQUNKLFVBQU0sYUFBeUIsR0FBRyxJQUFJLENBQUMsU0FBRCxDQUFKLENBQWdCLFFBQWhCLENBQWxDO0FBQ0E7Ozs7O0FBSUEsVUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFuQixFQUNJLE9BQU8sTUFBTSxDQUFDLDJCQUFQLENBQ0gsa0JBQUssT0FBTCxDQUFhLGtCQUFLLE9BQUwsQ0FBYSxRQUFiLENBQWIsRUFBcUMsSUFBckMsQ0FERyxFQUN5QyxRQUR6QyxDQUFQO0FBRUosYUFBTztBQUFDLFFBQUEsYUFBYSxFQUFiLGFBQUQ7QUFBZ0IsUUFBQSxRQUFRLEVBQVI7QUFBaEIsT0FBUDtBQUNIOzs7Ozs7ZUFFVSxNLEVBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJoZWxwZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnNcbiAgICBuYW1pbmcgMy4wIHVucG9ydGVkIGxpY2Vuc2UuXG4gICAgU2VlIGh0dHBzOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgVG9vbHMsIHtEb21Ob2RlLCBGaWxlLCBQbGFpbk9iamVjdCwgV2luZG93fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHtKU0RPTSBhcyBET019IGZyb20gJ2pzZG9tJ1xuaW1wb3J0IGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5pbXBvcnQge1xuICAgIEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBFeHRlbnNpb25zLFxuICAgIEluamVjdGlvbixcbiAgICBFbnRyeUluamVjdGlvbixcbiAgICBOb3JtYWxpemVkRW50cnlJbmplY3Rpb24sXG4gICAgUGF0aCxcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbn0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gY29uc3RhbnRzXG5leHBvcnQgY29uc3QgS05PV05fRklMRV9FWFRFTlNJT05TOkFycmF5PHN0cmluZz4gPSBbXG4gICAgJ2pzJywgJ3RzJyxcbiAgICAnanNvbicsXG4gICAgJ2NzcycsXG4gICAgJ2VvdCcsXG4gICAgJ2dpZicsXG4gICAgJ2h0bWwnLFxuICAgICdpY28nLFxuICAgICdqcGcnLFxuICAgICdwbmcnLFxuICAgICdlanMnLFxuICAgICdzdmcnLFxuICAgICd0dGYnLFxuICAgICd3b2ZmJywgJy53b2ZmMidcbl1cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIG1ldGhvZHNcbi8qKlxuICogUHJvdmlkZXMgYSBjbGFzcyBvZiBzdGF0aWMgbWV0aG9kcyB3aXRoIGdlbmVyaWMgdXNlIGNhc2VzLlxuICovXG5leHBvcnQgY2xhc3MgSGVscGVyIHtcbiAgICAvLyByZWdpb24gYm9vbGVhblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIGdpdmVuIGxpc3Qgb2YgZmlsZVxuICAgICAqIGxvY2F0aW9ucy5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gY2hlY2suXG4gICAgICogQHBhcmFtIGxvY2F0aW9uc1RvQ2hlY2sgLSBMb2NhdGlvbnMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHJldHVybnMgVmFsdWUgXCJ0cnVlXCIgaWYgZ2l2ZW4gZmlsZSBwYXRoIGlzIHdpdGhpbiBvbmUgb2YgZ2l2ZW5cbiAgICAgKiBsb2NhdGlvbnMgb3IgXCJmYWxzZVwiIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgIGZpbGVQYXRoOnN0cmluZywgbG9jYXRpb25zVG9DaGVjazpBcnJheTxzdHJpbmc+XG4gICAgKTpib29sZWFuIHtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoVG9DaGVjayBvZiBsb2NhdGlvbnNUb0NoZWNrKVxuICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShmaWxlUGF0aCkuc3RhcnRzV2l0aChwYXRoLnJlc29sdmUocGF0aFRvQ2hlY2spKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHN0cmluZ1xuICAgIC8qKlxuICAgICAqIEluIHBsYWNlcyBlYWNoIG1hdGNoaW5nIGNhc2NhZGluZyBzdHlsZSBzaGVldCBvciBqYXZhU2NyaXB0IGZpbGVcbiAgICAgKiByZWZlcmVuY2UuXG4gICAgICogQHBhcmFtIGNvbnRlbnQgLSBNYXJrdXAgY29udGVudCB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybiAtIFBhdHRlcm4gdG8gbWF0Y2ggY2FzY2FkaW5nIHN0eWxlXG4gICAgICogc2hlZXQgYXNzZXQgcmVmZXJlbmNlcyBhZ2Fpbi5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdFBhdHRlcm4gLSBQYXR0ZXJuIHRvIG1hdGNoIGphdmFTY3JpcHQgYXNzZXQgcmVmZXJlbmNlc1xuICAgICAqIGFnYWluLlxuICAgICAqIEBwYXJhbSBiYXNlUGF0aCAtIEJhc2UgcGF0aCB0byB1c2UgYXMgcHJlZml4IGZvciBmaWxlIHJlZmVyZW5jZXMuXG4gICAgICogQHBhcmFtIGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZSAtIENhc2NhZGluZyBzdHlsZSBzaGVldFxuICAgICAqIGNodW5rIG5hbWUgdGVtcGxhdGUgdG8gdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlIC0gSmF2YVNjcmlwdCBjaHVuayBuYW1lIHRlbXBsYXRlIHRvXG4gICAgICogdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gYXNzZXRzIC0gTWFwcGluZyBvZiBhc3NldCBmaWxlIHBhdGhzIHRvIHRoZWlyIGNvbnRlbnQuXG4gICAgICogQHJldHVybnMgR2l2ZW4gYW4gdHJhbnNmb3JtZWQgbWFya3VwLlxuICAgICAqL1xuICAgIHN0YXRpYyBpblBsYWNlQ1NTQW5kSmF2YVNjcmlwdEFzc2V0UmVmZXJlbmNlcyhcbiAgICAgICAgY29udGVudDpzdHJpbmcsXG4gICAgICAgIGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuOntba2V5OnN0cmluZ106J2JvZHknfCdoZWFkJ3wnaW4nfHN0cmluZ30sXG4gICAgICAgIGphdmFTY3JpcHRQYXR0ZXJuOntba2V5OnN0cmluZ106J2JvZHknfCdoZWFkJ3wnaW4nfHN0cmluZ30sXG4gICAgICAgIGJhc2VQYXRoOnN0cmluZyxcbiAgICAgICAgY2FzY2FkaW5nU3R5bGVTaGVldENodW5rTmFtZVRlbXBsYXRlOnN0cmluZyxcbiAgICAgICAgamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlOnN0cmluZyxcbiAgICAgICAgYXNzZXRzOntba2V5OnN0cmluZ106UmVjb3JkPHN0cmluZywgYW55Pn1cbiAgICApOntcbiAgICAgICAgY29udGVudDpzdHJpbmc7XG4gICAgICAgIGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz47XG4gICAgfSB7XG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHByZXZlbnQgY3JlYXRpbmcgbmF0aXZlIFwic3R5bGVcIiBkb20gbm9kZXMgdG9cbiAgICAgICAgICAgIHByZXZlbnQganNkb20gZnJvbSBwYXJzaW5nIHRoZSBlbnRpcmUgY2FzY2FkaW5nIHN0eWxlIHNoZWV0LiBXaGljaFxuICAgICAgICAgICAgaXMgZXJyb3IgcHJ1bmUgYW5kIHZlcnkgcmVzb3VyY2UgaW50ZW5zaXZlLlxuICAgICAgICAqL1xuICAgICAgICBjb25zdCBzdHlsZUNvbnRlbnRzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKFxuICAgICAgICAgICAgLyg8c3R5bGVbXj5dKj4pKFtcXHNcXFNdKj8pKDxcXC9zdHlsZVtePl0qPikvZ2ksIChcbiAgICAgICAgICAgICAgICBtYXRjaDpzdHJpbmcsXG4gICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6c3RyaW5nLFxuICAgICAgICAgICAgICAgIGVuZFRhZzpzdHJpbmdcbiAgICAgICAgICAgICk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICBzdHlsZUNvbnRlbnRzLnB1c2goY29udGVudClcbiAgICAgICAgICAgICAgICByZXR1cm4gYCR7c3RhcnRUYWd9JHtlbmRUYWd9YFxuICAgICAgICAgICAgfSlcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gdHJhbnNsYXRlIHRlbXBsYXRlIGRlbGltaXRlciB0byBodG1sIGNvbXBhdGlibGVcbiAgICAgICAgICAgIHNlcXVlbmNlcyBhbmQgdHJhbnNsYXRlIGl0IGJhY2sgbGF0ZXIgdG8gYXZvaWQgdW5leHBlY3RlZCBlc2NhcGVcbiAgICAgICAgICAgIHNlcXVlbmNlcyBpbiByZXN1bHRpbmcgaHRtbC5cbiAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgd2luZG93OldpbmRvdyA9IChuZXcgRE9NKFxuICAgICAgICAgICAgY29udGVudFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88JS9nLCAnIyMrIysjKyMjJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvJT4vZywgJyMjLSMtIy0jIycpXG4gICAgICAgICkpLndpbmRvd1xuICAgICAgICBjb25zdCBpblBsYWNlU3R5bGVDb250ZW50czpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29uc3QgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGZvciAoY29uc3QgYXNzZXRUeXBlIG9mIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVOYW1lOiAnaHJlZicsXG4gICAgICAgICAgICAgICAgaGFzaDogJ2hhc2gnLFxuICAgICAgICAgICAgICAgIGxpbmtUYWdOYW1lOiAnbGluaycsXG4gICAgICAgICAgICAgICAgcGF0dGVybjogY2FzY2FkaW5nU3R5bGVTaGVldFBhdHRlcm4sXG4gICAgICAgICAgICAgICAgc2VsZWN0b3I6ICdbaHJlZio9XCIuY3NzXCJdJyxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAnc3R5bGUnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjYXNjYWRpbmdTdHlsZVNoZWV0Q2h1bmtOYW1lVGVtcGxhdGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlTmFtZTogJ3NyYycsXG4gICAgICAgICAgICAgICAgaGFzaDogJ2hhc2gnLFxuICAgICAgICAgICAgICAgIGxpbmtUYWdOYW1lOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiBqYXZhU2NyaXB0UGF0dGVybixcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogJ1tocmVmKj1cIi5qc1wiXScsXG4gICAgICAgICAgICAgICAgdGFnTmFtZTogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IGphdmFTY3JpcHRDaHVua05hbWVUZW1wbGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICBdKVxuICAgICAgICAgICAgaWYgKGFzc2V0VHlwZS5wYXR0ZXJuKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBpbiBhc3NldFR5cGUucGF0dGVybikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZS5wYXR0ZXJuLCBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3I6c3RyaW5nID0gYXNzZXRUeXBlLnNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuICE9PSAnKicpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IGBbJHthc3NldFR5cGUuYXR0cmlidXRlTmFtZX1ePVwiYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGgsIEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlLnRlbXBsYXRlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2BbJHthc3NldFR5cGUuaGFzaH1dYF06ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbaWRdJzogcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW25hbWVdJzogcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSArICdcIl0nXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGVzOkFycmF5PERvbU5vZGU+ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS5saW5rVGFnTmFtZX0ke3NlbGVjdG9yfWApXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21Ob2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRvbU5vZGUgb2YgZG9tTm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoOnN0cmluZyA9IGRvbU5vZGUuYXR0cmlidXRlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlLmF0dHJpYnV0ZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLnZhbHVlLnJlcGxhY2UoLyYuKi9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRzLCBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpblBsYWNlRG9tTm9kZTpEb21Ob2RlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUudGFnTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXRUeXBlLnRhZ05hbWUgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3dlYm9wdGltaXplcmlucGxhY2UnLCAndHJ1ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VTdHlsZUNvbnRlbnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldHNbcGF0aF0uc291cmNlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLnRleHRDb250ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0c1twYXRoXS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhc3NldFR5cGUucGF0dGVybltwYXR0ZXJuXSA9PT0gJ2JvZHknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFzc2V0VHlwZS5wYXR0ZXJuW3BhdHRlcm5dID09PSAnaW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl0gPT09ICdoZWFkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVndWxhckV4cHJlc3Npb25QYXR0ZXJuID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcoYWZ0ZXJ8YmVmb3JlfGluKTooLispJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXN0TWF0Y2g6QXJyYXk8c3RyaW5nPnxudWxsID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChuZXcgUmVnRXhwKHJlZ3VsYXJFeHByZXNzaW9uUGF0dGVybikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmV4ZWMoYXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaDpBcnJheTxzdHJpbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXN0TWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IHRlc3RNYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0dpdmVuIGluIHBsYWNlIHNwZWNpZmljYXRpb24gXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHthc3NldFR5cGUucGF0dGVybltwYXR0ZXJuXX1cIiBmb3IgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7YXNzZXRUeXBlLnRhZ05hbWV9IGRvZXMgbm90IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzYXRpc2Z5IHRoZSBzcGVjaWZpZWQgcGF0dGVybiBcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3JlZ3VsYXJFeHByZXNzaW9uUGF0dGVybn1cIi5gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihtYXRjaFsyXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBTcGVjaWZpZWQgZG9tIG5vZGUgXCIke21hdGNoWzJdfVwiIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb3VsZCBub3QgYmUgZm91bmQgdG8gaW4gcGxhY2UgXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtwYXR0ZXJufVwiLmApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaFsxXSA9PT0gJ2luJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuYXBwZW5kQ2hpbGQoaW5QbGFjZURvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1hdGNoWzFdID09PSAnYmVmb3JlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRBZnRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogVGhpcyBkb2Vzbid0IHByZXZlbnQgd2VicGFjayBmcm9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW5nIHRoaXMgZmlsZSBpZiBwcmVzZW50IGluIGFub3RoZXIgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc28gcmVtb3ZpbmcgaXQgKGFuZCBhIHBvdGVudGlhbCBzb3VyY2UgbWFwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUpIGxhdGVyIGluIHRoZSBcImRvbmVcIiBob29rLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmUucHVzaChIZWxwZXIuc3RyaXBMb2FkZXIocGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFzc2V0c1twYXRoXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYE5vIHJlZmVyZW5jZWQgJHthc3NldFR5cGUudGFnTmFtZX0gZmlsZSBpbiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVzdWx0aW5nIG1hcmt1cCBmb3VuZCB3aXRoIHNlbGVjdG9yOiBcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS5saW5rVGFnTmFtZX0ke2Fzc2V0VHlwZS5zZWxlY3Rvcn1cImBcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIC8vIE5PVEU6IFdlIGhhdmUgdG8gcmVzdG9yZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgYW5kIHN0eWxlIGNvbnRlbnRzLlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGVudDogY29udGVudFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXihcXHMqPCFkb2N0eXBlIFtePl0rPz5cXHMqKVtcXHNcXFNdKiQvaSwgJyQxJ1xuICAgICAgICAgICAgICAgICkgKyB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8jI1xcKyNcXCsjXFwrIyMvZywgJzwlJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyMtIy0jLSMjL2csICclPicpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg8c3R5bGVbXj5dKj4pW1xcc1xcU10qPyg8XFwvc3R5bGVbXj5dKj4pL2dpLCAoXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBlbmRUYWc6c3RyaW5nXG4gICAgICAgICAgICAgICAgKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRUYWcuaW5jbHVkZXMoJyB3ZWJvcHRpbWl6ZXJpbnBsYWNlPVwidHJ1ZVwiJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGFnLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgd2Vib3B0aW1pemVyaW5wbGFjZT1cInRydWVcIicsICcnKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aW5QbGFjZVN0eWxlQ29udGVudHMuc2hpZnQoKX0ke2VuZFRhZ31gXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtzdGFydFRhZ30ke3N0eWxlQ29udGVudHMuc2hpZnQoKX0ke2VuZFRhZ31gXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0cmlwcyBsb2FkZXIgaW5mb3JtYXRpb25zIGZvcm0gZ2l2ZW4gbW9kdWxlIHJlcXVlc3QgaW5jbHVkaW5nIGxvYWRlclxuICAgICAqIHByZWZpeCBhbmQgcXVlcnkgcGFyYW1ldGVyLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSByZXF1ZXN0IHRvIHN0cmlwLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIG1vZHVsZSBpZCBzdHJpcHBlZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc3RyaXBMb2FkZXIobW9kdWxlSUQ6c3RyaW5nfHN0cmluZyk6c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBtb2R1bGVJRC50b1N0cmluZygpXG4gICAgICAgIGNvbnN0IG1vZHVsZUlEV2l0aG91dExvYWRlcjpzdHJpbmcgPSBtb2R1bGVJRC5zdWJzdHJpbmcoXG4gICAgICAgICAgICBtb2R1bGVJRC5sYXN0SW5kZXhPZignIScpICsgMSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEV2l0aG91dExvYWRlci5pbmNsdWRlcygnPycpID9cbiAgICAgICAgICAgIG1vZHVsZUlEV2l0aG91dExvYWRlci5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgMCwgbW9kdWxlSURXaXRob3V0TG9hZGVyLmluZGV4T2YoJz8nKSkgOlxuICAgICAgICAgICAgbW9kdWxlSURXaXRob3V0TG9hZGVyXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBhcnJheVxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGdpdmVuIGxpc3Qgb2YgcGF0aCB0byBhIG5vcm1hbGl6ZWQgbGlzdCB3aXRoIHVuaXF1ZSB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHBhdGhzIC0gRmlsZSBwYXRocy5cbiAgICAgKiBAcmV0dXJucyBUaGUgZ2l2ZW4gZmlsZSBwYXRoIGxpc3Qgd2l0aCBub3JtYWxpemVkIHVuaXF1ZSB2YWx1ZXMuXG4gICAgICovXG4gICAgc3RhdGljIG5vcm1hbGl6ZVBhdGhzKHBhdGhzOkFycmF5PHN0cmluZz4pOkFycmF5PHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHBhdGhzLm1hcCgoZ2l2ZW5QYXRoOnN0cmluZyk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgIGdpdmVuUGF0aCA9IHBhdGgubm9ybWFsaXplKGdpdmVuUGF0aClcbiAgICAgICAgICAgIGlmIChnaXZlblBhdGguZW5kc1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2l2ZW5QYXRoLnN1YnN0cmluZygwLCBnaXZlblBhdGgubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIHJldHVybiBnaXZlblBhdGhcbiAgICAgICAgfSkpKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZmlsZSBoYW5kbGVyXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBmaWxlIHBhdGgvbmFtZSBwbGFjZWhvbGRlciByZXBsYWNlbWVudHMgd2l0aCBnaXZlbiBidW5kbGVcbiAgICAgKiBhc3NvY2lhdGVkIGluZm9ybWF0aW9ucy5cbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUgLSBGaWxlIHBhdGggdG8gcHJvY2VzcyBwbGFjZWhvbGRlciBpbi5cbiAgICAgKiBAcGFyYW0gc2NvcGUgLSBTY29wZSB0byB1c2UgZm9yIHByb2Nlc3NpbmcuXG4gICAgICogQHJldHVybnMgUHJvY2Vzc2VkIGZpbGUgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgdGVtcGxhdGU6c3RyaW5nLCBzY29wZTp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7fVxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgc2NvcGUgPSBUb29scy5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ1toYXNoXSc6ICcuX19kdW1teV9fJyxcbiAgICAgICAgICAgICAgICAnW2lkXSc6ICcuX19kdW1teV9fJyxcbiAgICAgICAgICAgICAgICAnW25hbWVdJzogJy5fX2R1bW15X18nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2NvcGUpXG4gICAgICAgIGxldCBmaWxlUGF0aDpzdHJpbmcgPSB0ZW1wbGF0ZVxuICAgICAgICBmb3IgKGNvbnN0IHBsYWNlaG9sZGVyTmFtZSBpbiBzY29wZSlcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc2NvcGUsIHBsYWNlaG9sZGVyTmFtZSkpXG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKHBsYWNlaG9sZGVyTmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnZydcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVbcGxhY2Vob2xkZXJOYW1lXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgcmV0dXJuIGZpbGVQYXRoXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGdpdmVuIHJlcXVlc3QgdG8gYSByZXNvbHZlZCByZXF1ZXN0IHdpdGggZ2l2ZW4gY29udGV4dFxuICAgICAqIGVtYmVkZGVkLlxuICAgICAqIEBwYXJhbSByZXF1ZXN0IC0gUmVxdWVzdCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBDb250ZXh0IG9mIGdpdmVuIHJlcXVlc3QgdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyAtIExpc3Qgb2YgcmVsYXRpdmUgZGlyZWN0b3J5IHBhdGhzIHRvXG4gICAgICogc2VhcmNoIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEByZXR1cm5zIEEgbmV3IHJlc29sdmVkIHJlcXVlc3QuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5Q29udGV4dChcbiAgICAgICAgcmVxdWVzdDpzdHJpbmcsXG4gICAgICAgIGNvbnRleHQgPSAnLi8nLFxuICAgICAgICByZWZlcmVuY2VQYXRoID0gJy4vJyxcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ11cbiAgICApOnN0cmluZyB7XG4gICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlc29sdmUocmVmZXJlbmNlUGF0aClcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgcmVxdWVzdC5zdGFydHNXaXRoKCcuLycpICYmXG4gICAgICAgICAgICBwYXRoLnJlc29sdmUoY29udGV4dCkgIT09IHJlZmVyZW5jZVBhdGhcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXF1ZXN0ID0gcGF0aC5yZXNvbHZlKGNvbnRleHQsIHJlcXVlc3QpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZVBhdGggb2YgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4OnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgbW9kdWxlUGF0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKHBhdGhQcmVmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhwYXRoUHJlZml4Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3Quc3Vic3RyaW5nKHJlcXVlc3QubGFzdEluZGV4T2YoJyEnKSArIDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgocmVmZXJlbmNlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcocmVmZXJlbmNlUGF0aC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5zdWJzdHJpbmcocmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlhc2VzXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50c1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVxdWVzdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBnaXZlbiByZXF1ZXN0IHBvaW50cyB0byBhbiBleHRlcm5hbCBkZXBlbmRlbmN5IG5vdCBtYWludGFpbmVkXG4gICAgICogYnkgY3VycmVudCBwYWNrYWdlIGNvbnRleHQuXG4gICAgICogQHBhcmFtIHJlcXVlc3QgLSBSZXF1ZXN0IHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIENvbnRleHQgb2YgY3VycmVudCBwcm9qZWN0LlxuICAgICAqIEBwYXJhbSByZXF1ZXN0Q29udGV4dCAtIENvbnRleHQgb2YgZ2l2ZW4gcmVxdWVzdCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBub3JtYWxpemVkRW50cnlJbmplY3Rpb24gLSBNYXBwaW5nIG9mIGNodW5rIG5hbWVzIHRvIG1vZHVsZXNcbiAgICAgKiB3aGljaCBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlRXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnMgLSBBcnJheSBvZiBwYXRocyB3aGVyZSBleHRlcm5hbFxuICAgICAqIG1vZHVsZXMgdGFrZSBwbGFjZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyAtIExpc3Qgb2YgcmVsYXRpdmUgZmlsZSBwYXRoIHRvIHNlYXJjaFxuICAgICAqIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlRW50cnlGaWxlTmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZW50cnkgZmlsZSBuYW1lcyB0b1xuICAgICAqIHNlYXJjaCBmb3IuIFRoZSBtYWdpYyBuYW1lIFwiX19wYWNrYWdlX19cIiB3aWxsIHNlYXJjaCBmb3IgYW4gYXBwcmVjaWF0ZVxuICAgICAqIGVudHJ5IGluIGEgXCJwYWNrYWdlLmpzb25cIiBmaWxlLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBtYWluIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHJlcHJlc2VudGluZyBlbnRyeSBtb2R1bGUgZGVmaW5pdGlvbnMuXG4gICAgICogQHBhcmFtIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBhbGlhcyBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSBzcGVjaWZpYyBtb2R1bGUgYWxpYXNlcy5cbiAgICAgKiBAcGFyYW0gaW5jbHVkZVBhdHRlcm4gLSBBcnJheSBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIGV4cGxpY2l0bHkgbWFya1xuICAgICAqIGFzIGV4dGVybmFsIGRlcGVuZGVuY3kuXG4gICAgICogQHBhcmFtIGV4Y2x1ZGVQYXR0ZXJuIC0gQXJyYXkgb2YgcmVndWxhciBleHByZXNzaW9ucyB0byBleHBsaWNpdGx5IG1hcmtcbiAgICAgKiBhcyBpbnRlcm5hbCBkZXBlbmRlbmN5LlxuICAgICAqIEBwYXJhbSBpblBsYWNlTm9ybWFsTGlicmFyeSAtIEluZGljYXRlcyB3aGV0aGVyIG5vcm1hbCBsaWJyYXJpZXMgc2hvdWxkXG4gICAgICogYmUgZXh0ZXJuYWwgb3Igbm90LlxuICAgICAqIEBwYXJhbSBpblBsYWNlRHluYW1pY0xpYnJhcnkgLSBJbmRpY2F0ZXMgd2hldGhlciByZXF1ZXN0cyB3aXRoXG4gICAgICogaW50ZWdyYXRlZCBsb2FkZXIgY29uZmlndXJhdGlvbnMgc2hvdWxkIGJlIG1hcmtlZCBhcyBleHRlcm5hbCBvciBub3QuXG4gICAgICogQHBhcmFtIGVuY29kaW5nIC0gRW5jb2RpbmcgZm9yIGZpbGUgbmFtZXMgdG8gdXNlIGR1cmluZyBmaWxlIHRyYXZlcnNpbmcuXG4gICAgICogQHJldHVybnMgQSBuZXcgcmVzb2x2ZWQgcmVxdWVzdCBpbmRpY2F0aW5nIHdoZXRoZXIgZ2l2ZW4gcmVxdWVzdCBpcyBhblxuICAgICAqIGV4dGVybmFsIG9uZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lRXh0ZXJuYWxSZXF1ZXN0KFxuICAgICAgICByZXF1ZXN0OnN0cmluZyxcbiAgICAgICAgY29udGV4dCA9ICcuLycsXG4gICAgICAgIHJlcXVlc3RDb250ZXh0ID0gJy4vJyxcbiAgICAgICAgbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uOk5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbiA9IHt9LFxuICAgICAgICByZWxhdGl2ZUV4dGVybmFsTW9kdWxlTG9jYXRpb25zOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBleHRlbnNpb25zOkV4dGVuc2lvbnMgPSB7XG4gICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnLmNvbXBpbGVkLmpzJywgJy5qcycsICcuanNvbiddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBLTk9XTl9GSUxFX0VYVEVOU0lPTlMubWFwKChzdWZmaXg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgYC4ke3N1ZmZpeH1gXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZTogW11cbiAgICAgICAgfSxcbiAgICAgICAgcmVmZXJlbmNlUGF0aCA9ICcuLycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9uczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4JywgJ21haW4nXSxcbiAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ21haW4nLCAnbW9kdWxlJ10sXG4gICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgICAgICBpbmNsdWRlUGF0dGVybjpBcnJheTxzdHJpbmd8UmVnRXhwPiA9IFtdLFxuICAgICAgICBleGNsdWRlUGF0dGVybjpBcnJheTxzdHJpbmd8UmVnRXhwPiA9IFtdLFxuICAgICAgICBpblBsYWNlTm9ybWFsTGlicmFyeSA9IGZhbHNlLFxuICAgICAgICBpblBsYWNlRHluYW1pY0xpYnJhcnkgPSB0cnVlLFxuICAgICAgICBlbmNvZGluZyA9ICd1dGYtOCdcbiAgICApOm51bGx8c3RyaW5nIHtcbiAgICAgICAgY29udGV4dCA9IHBhdGgucmVzb2x2ZShjb250ZXh0KVxuICAgICAgICByZXF1ZXN0Q29udGV4dCA9IHBhdGgucmVzb2x2ZShyZXF1ZXN0Q29udGV4dClcbiAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVzb2x2ZShyZWZlcmVuY2VQYXRoKVxuICAgICAgICAvLyBOT1RFOiBXZSBhcHBseSBhbGlhcyBvbiBleHRlcm5hbHMgYWRkaXRpb25hbGx5LlxuICAgICAgICBjb25zdCByZXNvbHZlZFJlcXVlc3Q6c3RyaW5nID0gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICAgICAgSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnN1YnN0cmluZyhyZXF1ZXN0Lmxhc3RJbmRleE9mKCchJykgKyAxKSwgYWxpYXNlcyksXG4gICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHNcbiAgICAgICAgKVxuICAgICAgICBpZiAoVG9vbHMuaXNBbnlNYXRjaGluZyhyZXNvbHZlZFJlcXVlc3QsIGV4Y2x1ZGVQYXR0ZXJuKSlcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBBbGlhc2VzIGFuZCBtb2R1bGUgcmVwbGFjZW1lbnRzIGRvZXNuJ3QgaGF2ZSB0byBiZSBmb3J3YXJkZWRcbiAgICAgICAgICAgIHNpbmNlIHdlIHBhc3MgYW4gYWxyZWFkeSByZXNvbHZlZCByZXF1ZXN0LlxuICAgICAgICAqL1xuICAgICAgICBjb25zdCBmaWxlUGF0aDpudWxsfHN0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCxcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7ZmlsZTogZXh0ZW5zaW9ucy5maWxlLmV4dGVybmFsLCBtb2R1bGU6IGV4dGVuc2lvbnMubW9kdWxlfSxcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICByZXF1ZXN0Q29udGV4dCxcbiAgICAgICAgICAgIHBhdGhzVG9JZ25vcmUsXG4gICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyxcbiAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBlbmNvZGluZ1xuICAgICAgICApXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBtYXJrIGRlcGVuZGVuY2llcyBhcyBleHRlcm5hbCBpZiB0aGVyZSBmaWxlIGNvdWxkbid0IGJlXG4gICAgICAgICAgICByZXNvbHZlZCBvciBhcmUgc3BlY2lmaWVkIHRvIGJlIGV4dGVybmFsIGV4cGxpY2l0bHkuXG4gICAgICAgICovXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICEoZmlsZVBhdGggfHwgaW5QbGFjZU5vcm1hbExpYnJhcnkpIHx8XG4gICAgICAgICAgICBUb29scy5pc0FueU1hdGNoaW5nKHJlc29sdmVkUmVxdWVzdCwgaW5jbHVkZVBhdHRlcm4pXG4gICAgICAgIClcbiAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlDb250ZXh0KFxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCxcbiAgICAgICAgICAgICAgICByZXF1ZXN0Q29udGV4dCxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLFxuICAgICAgICAgICAgICAgIGFsaWFzZXMsXG4gICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzLFxuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zXG4gICAgICAgICAgICApXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lIGluIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uLCBjaHVua05hbWVcbiAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRCBvZiBub3JtYWxpemVkRW50cnlJbmplY3Rpb25bY2h1bmtOYW1lXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBleHRlbnNpb25zLmZpbGUuaW50ZXJuYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBleHRlbnNpb25zLm1vZHVsZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Q29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzVG9JZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICApID09PSBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGNvbnN0IHBhcnRzID0gY29udGV4dC5zcGxpdCgnLycpXG4gICAgICAgIGNvbnN0IGV4dGVybmFsTW9kdWxlTG9jYXRpb25zID0gW11cbiAgICAgICAgd2hpbGUgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVsYXRpdmVQYXRoIG9mIHJlbGF0aXZlRXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnMpXG4gICAgICAgICAgICAgICAgZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnMucHVzaChwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICcvJywgcGFydHMuam9pbignLycpLCByZWxhdGl2ZVBhdGhcbiAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgcGFydHMuc3BsaWNlKC0xLCAxKVxuICAgICAgICB9XG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBtYXJrIGRlcGVuZGVuY2llcyBhcyBleHRlcm5hbCBpZiB0aGV5IGRvZXMgbm90IGNvbnRhaW4gYVxuICAgICAgICAgICAgbG9hZGVyIGluIHRoZWlyIHJlcXVlc3QgYW5kIGFyZW4ndCBwYXJ0IG9mIHRoZSBjdXJyZW50IG1haW4gcGFja2FnZVxuICAgICAgICAgICAgb3IgaGF2ZSBhIGZpbGUgZXh0ZW5zaW9uIG90aGVyIHRoYW4gamF2YVNjcmlwdCBhd2FyZS5cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIWluUGxhY2VOb3JtYWxMaWJyYXJ5ICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5maWxlLmV4dGVybmFsLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoICYmXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5maWxlLmV4dGVybmFsLmluY2x1ZGVzKHBhdGguZXh0bmFtZShmaWxlUGF0aCkpIHx8XG4gICAgICAgICAgICAgICAgIWZpbGVQYXRoICYmXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5maWxlLmV4dGVybmFsLmluY2x1ZGVzKCcnKVxuICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgIShpblBsYWNlRHluYW1pY0xpYnJhcnkgJiYgcmVxdWVzdC5pbmNsdWRlcygnIScpKSAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICFmaWxlUGF0aCAmJlxuICAgICAgICAgICAgICAgIGluUGxhY2VEeW5hbWljTGlicmFyeSB8fFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoICYmXG4gICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAhZmlsZVBhdGguc3RhcnRzV2l0aChjb250ZXh0KSB8fFxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwgZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnMpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gSGVscGVyLmFwcGx5Q29udGV4dChcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsXG4gICAgICAgICAgICAgICAgcmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICBhbGlhc2VzLFxuICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cyxcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9uc1xuICAgICAgICAgICAgKVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFzc2V0IHR5cGUgb2YgZ2l2ZW4gZmlsZS5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gYW5hbHlzZS5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9uIC0gTWV0YSBpbmZvcm1hdGlvbnMgZm9yIGF2YWlsYWJsZSBhc3NldFxuICAgICAqIHR5cGVzLlxuICAgICAqIEBwYXJhbSBwYXRocyAtIExpc3Qgb2YgcGF0aHMgdG8gc2VhcmNoIGlmIGdpdmVuIHBhdGggZG9lc24ndCByZWZlcmVuY2VcbiAgICAgKiBhIGZpbGUgZGlyZWN0bHkuXG4gICAgICogQHJldHVybnMgRGV0ZXJtaW5lZCBmaWxlIHR5cGUgb3IgXCJudWxsXCIgb2YgZ2l2ZW4gZmlsZSBjb3VsZG4ndCBiZVxuICAgICAqIGRldGVybWluZWQuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBidWlsZENvbmZpZ3VyYXRpb246QnVpbGRDb25maWd1cmF0aW9uLCBwYXRoczpQYXRoXG4gICAgKTpudWxsfHN0cmluZyB7XG4gICAgICAgIGxldCByZXN1bHQ6bnVsbHxzdHJpbmcgPSBudWxsXG4gICAgICAgIGZvciAoY29uc3QgdHlwZSBpbiBidWlsZENvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT1cbiAgICAgICAgICAgICAgICBgLiR7YnVpbGRDb25maWd1cmF0aW9uW3R5cGVdLmV4dGVuc2lvbn1gXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0eXBlXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGUgb2YgWydzb3VyY2UnLCAndGFyZ2V0J10pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFR5cGUgaW4gcGF0aHNbdHlwZV0uYXNzZXQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoc1t0eXBlXS5hc3NldCwgYXNzZXRUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUgIT09ICdiYXNlJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aHNbdHlwZV0uYXNzZXRbYXNzZXRUeXBlXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGguc3RhcnRzV2l0aChwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzZXRUeXBlXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHByb3BlcnR5IHdpdGggYSBzdG9yZWQgYXJyYXkgb2YgYWxsIG1hdGNoaW5nIGZpbGUgcGF0aHMsIHdoaWNoXG4gICAgICogbWF0Y2hlcyBlYWNoIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW4gZ2l2ZW4gZW50cnkgcGF0aCBhbmQgY29udmVydHMgZ2l2ZW5cbiAgICAgKiBidWlsZCBjb25maWd1cmF0aW9uIGludG8gYSBzb3J0ZWQgYXJyYXkgd2VyZSBqYXZhU2NyaXB0IGZpbGVzIHRha2VzXG4gICAgICogcHJlY2VkZW5jZS5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiAtIEdpdmVuIGJ1aWxkIGNvbmZpZ3VyYXRpb25zLlxuICAgICAqIEBwYXJhbSBlbnRyeVBhdGggLSBQYXRoIHRvIGFuYWx5c2UgbmVzdGVkIHN0cnVjdHVyZS5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gbWFpbkZpbGVCYXNlbmFtZXMgLSBGaWxlIGJhc2VuYW1lcyB0byBzb3J0IGludG8gdGhlIGZyb250LlxuICAgICAqIEByZXR1cm5zIENvbnZlcnRlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICBjb25maWd1cmF0aW9uOkJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgZW50cnlQYXRoID0gJy4vJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIG1haW5GaWxlQmFzZW5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4JywgJ21haW4nXVxuICAgICk6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24ge1xuICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24gPSBbXVxuICAgICAgICBmb3IgKGNvbnN0IHR5cGUgaW4gY29uZmlndXJhdGlvbilcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29uZmlndXJhdGlvbiwgdHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSA9XG4gICAgICAgICAgICAgICAgICAgIFRvb2xzLmV4dGVuZCh0cnVlLCB7ZmlsZVBhdGhzOiBbXX0sIGNvbmZpZ3VyYXRpb25bdHlwZV0pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIFRvb2xzLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoXG4gICAgICAgICAgICAgICAgICAgIGVudHJ5UGF0aCwgKGZpbGU6RmlsZSk6ZmFsc2V8dW5kZWZpbmVkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cy5pc0ZpbGUoKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKGZpbGUucGF0aCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICkgPT09IG5ld0l0ZW0uZXh0ZW5zaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhKG5ldyBSZWdFeHAobmV3SXRlbS5maWxlUGF0aFBhdHRlcm4pKS50ZXN0KGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5maWxlUGF0aHMucHVzaChmaWxlLnBhdGgpXG4gICAgICAgICAgICAgICAgbmV3SXRlbS5maWxlUGF0aHMuc29ydCgoXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0RmlsZVBhdGg6c3RyaW5nLCBzZWNvbmRGaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICApOm51bWJlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RGaWxlUGF0aCwgcGF0aC5leHRuYW1lKGZpcnN0RmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbkZpbGVCYXNlbmFtZXMuaW5jbHVkZXMocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRGaWxlUGF0aCwgcGF0aC5leHRuYW1lKHNlY29uZEZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kRmlsZVBhdGgsIHBhdGguZXh0bmFtZShzZWNvbmRGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLnB1c2gobmV3SXRlbSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1aWxkQ29uZmlndXJhdGlvbi5zb3J0KChcbiAgICAgICAgICAgIGZpcnN0OlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSxcbiAgICAgICAgICAgIHNlY29uZDpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbiAgICAgICAgKTpudW1iZXIgPT4ge1xuICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiAhPT0gc2Vjb25kLm91dHB1dEV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgICAgIGlmIChzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIHJldHVybiBmaXJzdC5vdXRwdXRFeHRlbnNpb24gPCBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID8gLTEgOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9KVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBmaWxlIGFuZCBkaXJlY3RvcnkgcGF0aHMgcmVsYXRlZCB0byBnaXZlbiBpbnRlcm5hbFxuICAgICAqIG1vZHVsZXMgYXMgYXJyYXkuXG4gICAgICogQHBhcmFtIGVudHJ5SW5qZWN0aW9uIC0gTGlzdCBvZiBtb2R1bGUgaWRzIG9yIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIG1vZHVsZSByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byBzZWFyY2ggZm9yIGxvY2FsIG1vZHVsZXMuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBlbmNvZGluZyAtIEZpbGUgbmFtZSBlbmNvZGluZyB0byB1c2UgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBhIGZpbGUgcGF0aCBhbmQgZGlyZWN0b3J5IHBhdGgga2V5IG1hcHBpbmcgdG9cbiAgICAgKiBjb3JyZXNwb25kaW5nIGxpc3Qgb2YgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgZW50cnlJbmplY3Rpb246RW50cnlJbmplY3Rpb24sXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGV4dGVuc2lvbnM6UGxhaW5PYmplY3QgPSB7XG4gICAgICAgICAgICBmaWxlOiBLTk9XTl9GSUxFX0VYVEVOU0lPTlMubWFwKChzdWZmaXg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICBgLiR7c3VmZml4fWBcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBtb2R1bGU6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRleHQgPSAnLi8nLFxuICAgICAgICByZWZlcmVuY2VQYXRoID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9uczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnX19wYWNrYWdlX18nLCAnJywgJ2luZGV4JywgJ21haW4nXG4gICAgICAgIF0sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJywgJ21vZHVsZSddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgZW5jb2RpbmcgPSAndXRmLTgnXG4gICAgKTp7ZmlsZVBhdGhzOkFycmF5PHN0cmluZz47ZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPn0ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGhzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBub3JtYWxpemVkRW50cnlJbmplY3Rpb246Tm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uID1cbiAgICAgICAgICAgIEhlbHBlci5yZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgICAgICAgICBIZWxwZXIubm9ybWFsaXplRW50cnlJbmplY3Rpb24oZW50cnlJbmplY3Rpb24pLFxuICAgICAgICAgICAgICAgIGFsaWFzZXMsXG4gICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzLFxuICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICApXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lIGluIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uLCBjaHVua05hbWVcbiAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRCBvZiBub3JtYWxpemVkRW50cnlJbmplY3Rpb25bY2h1bmtOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpudWxsfHN0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzVG9JZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoOnN0cmluZyA9IHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGlyZWN0b3J5UGF0aHMuaW5jbHVkZXMoZGlyZWN0b3J5UGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5UGF0aHMucHVzaChkaXJlY3RvcnlQYXRoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2ZpbGVQYXRocywgZGlyZWN0b3J5UGF0aHN9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBsaXN0IG9mIGNvbmNyZXRlIGZpbGUgcGF0aHMgZm9yIGdpdmVuIG1vZHVsZSBpZCBwb2ludGluZyB0b1xuICAgICAqIGEgZm9sZGVyIHdoaWNoIGlzbid0IGEgcGFja2FnZS5cbiAgICAgKiBAcGFyYW0gbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uIC0gSW5qZWN0aW9uIGRhdGEgc3RydWN0dXJlIG9mIG1vZHVsZXNcbiAgICAgKiB3aXRoIGZvbGRlciByZWZlcmVuY2VzIHRvIHJlc29sdmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9ucyB3aXRoIHJlc29sdmVkIGZvbGRlciBwb2ludGluZyBtb2R1bGVzLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uOk5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgY29udGV4dCA9ICcuLycsXG4gICAgICAgIHJlZmVyZW5jZVBhdGggPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOk5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbiB7XG4gICAgICAgIGlmIChyZWZlcmVuY2VQYXRoLnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lIGluIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uLCBjaHVua05hbWVcbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbW9kdWxlSUQgb2Ygbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uW2NodW5rTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRFxuICAgICAgICAgICAgICAgICAgICAgICAgKSwgYWxpYXNlcyksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsIG1vZHVsZUlEKVxuICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKHJlc29sdmVkUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbltjaHVua05hbWVdLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVkUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZmlsZTpGaWxlKTpmYWxzZXx1bmRlZmluZWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlLnN0YXRzICYmIGZpbGUuc3RhdHMuaXNGaWxlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbltjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVkUGF0aCwgZmlsZS5wYXRoKSkpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRC5zdGFydHNXaXRoKCcuLycpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhbW9kdWxlSUQuc3RhcnRzV2l0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLi8ke3BhdGgucmVsYXRpdmUoY29udGV4dCwgcmVmZXJlbmNlUGF0aCl9YFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkRW50cnlJbmplY3Rpb25bY2h1bmtOYW1lXVtpbmRleF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAuLyR7cGF0aC5yZWxhdGl2ZShjb250ZXh0LCByZXNvbHZlZFBhdGgpfWBcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvblxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFdmVyeSBpbmplY3Rpb24gZGVmaW5pdGlvbiB0eXBlIGNhbiBiZSByZXByZXNlbnRlZCBhcyBwbGFpbiBvYmplY3RcbiAgICAgKiAobWFwcGluZyBmcm9tIGNodW5rIG5hbWUgdG8gYXJyYXkgb2YgbW9kdWxlIGlkcykuIFRoaXMgbWV0aG9kIGNvbnZlcnRzXG4gICAgICogZWFjaCByZXByZXNlbnRhdGlvbiBpbnRvIHRoZSBub3JtYWxpemVkIHBsYWluIG9iamVjdCBub3RhdGlvbi5cbiAgICAgKiBAcGFyYW0gZW50cnlJbmplY3Rpb24gLSBHaXZlbiBlbnRyeSBpbmplY3Rpb24gdG8gbm9ybWFsaXplLlxuICAgICAqIEByZXR1cm5zIE5vcm1hbGl6ZWQgcmVwcmVzZW50YXRpb24gb2YgZ2l2ZW4gZW50cnkgaW5qZWN0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVFbnRyeUluamVjdGlvbihcbiAgICAgICAgZW50cnlJbmplY3Rpb246RW50cnlJbmplY3Rpb25cbiAgICApOk5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbiB7XG4gICAgICAgIGxldCByZXN1bHQ6Tm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uID0ge31cbiAgICAgICAgaWYgKFRvb2xzLmlzRnVuY3Rpb24oZW50cnlJbmplY3Rpb24pKVxuICAgICAgICAgICAgZW50cnlJbmplY3Rpb24gPSBlbnRyeUluamVjdGlvbigpXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVudHJ5SW5qZWN0aW9uKSlcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogZW50cnlJbmplY3Rpb259XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBlbnRyeUluamVjdGlvbiA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IFtlbnRyeUluamVjdGlvbl19XG4gICAgICAgIGVsc2UgaWYgKFRvb2xzLmlzUGxhaW5PYmplY3QoZW50cnlJbmplY3Rpb24pKSB7XG4gICAgICAgICAgICBsZXQgaGFzQ29udGVudCA9IGZhbHNlXG4gICAgICAgICAgICBjb25zdCBjaHVua05hbWVzVG9EZWxldGU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZSBpbiBlbnRyeUluamVjdGlvbilcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICBlbnRyeUluamVjdGlvbiwgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZW50cnlJbmplY3Rpb25bY2h1bmtOYW1lXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnlJbmplY3Rpb25bY2h1bmtOYW1lXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2h1bmtOYW1lXSA9IGVudHJ5SW5qZWN0aW9uW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZXNUb0RlbGV0ZS5wdXNoKGNodW5rTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBbZW50cnlJbmplY3Rpb25bY2h1bmtOYW1lXV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0NvbnRlbnQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWUgb2YgY2h1bmtOYW1lc1RvRGVsZXRlKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0W2NodW5rTmFtZV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IFtdfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgY29uY3JldGUgZmlsZSBwYXRocyBmb3IgZ2l2ZW4gaW5qZWN0aW9uIHdoaWNoIGFyZSBtYXJrZWRcbiAgICAgKiB3aXRoIHRoZSBcIl9fYXV0b19fXCIgaW5kaWNhdG9yLlxuICAgICAqIEBwYXJhbSBnaXZlbkluamVjdGlvbiAtIEdpdmVuIGVudHJ5IGFuZCBleHRlcm5hbCBpbmplY3Rpb24gdG8gdGFrZVxuICAgICAqIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9ucyAtIFJlc29sdmVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIG1vZHVsZXNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyB0byBleGNsdWRlIChzcGVjaWZpZWQgYnlcbiAgICAgKiBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0byBtb2R1bGUgaWRzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFJlZmVyZW5jZSBwYXRoIGZyb20gd2hlcmUgbG9jYWwgZmlsZXMgc2hvdWxkIGJlXG4gICAgICogcmVzb2x2ZWQuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9uIHdpdGggcmVzb2x2ZWQgbWFya2VkIGluZGljYXRvcnMuXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVJbmplY3Rpb24oXG4gICAgICAgIGdpdmVuSW5qZWN0aW9uOkluamVjdGlvbixcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlc1RvRXhjbHVkZTpFbnRyeUluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJ2NvbXBpbGVkLmpzJywgJy5qcycsICcuanNvbiddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBLTk9XTl9GSUxFX0VYVEVOU0lPTlMubWFwKChzdWZmaXg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgYC4ke3N1ZmZpeH1gXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZTogW11cbiAgICAgICAgfSxcbiAgICAgICAgY29udGV4dCA9ICcuLycsXG4gICAgICAgIHJlZmVyZW5jZVBhdGggPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOkluamVjdGlvbiB7XG4gICAgICAgIGNvbnN0IGluamVjdGlvbjpJbmplY3Rpb24gPSBUb29scy5leHRlbmQodHJ1ZSwge30sIGdpdmVuSW5qZWN0aW9uKVxuICAgICAgICBjb25zdCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGU6QXJyYXk8c3RyaW5nPiA9XG4gICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgIG1vZHVsZXNUb0V4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsXG4gICAgICAgICAgICAgICAge2ZpbGU6IGV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbCwgbW9kdWxlOiBleHRlbnNpb25zLm1vZHVsZX0sXG4gICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLFxuICAgICAgICAgICAgICAgIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICkuZmlsZVBhdGhzXG4gICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ2VudHJ5JywgJ2V4dGVybmFsJ10pXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBjdXJseSAqL1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmplY3Rpb25bdHlwZV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWUgaW4gaW5qZWN0aW9uW3R5cGVdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0gPT09ICdfX2F1dG9fXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZXM6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YkNodW5rTmFtZSBpbiBtb2R1bGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXMsIHN1YkNodW5rTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzW3N1YkNodW5rTmFtZV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldmVyc2UgYXJyYXkgdG8gbGV0IGphdmFTY3JpcHQgYW5kIG1haW4gZmlsZXMgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgbGFzdCBvbmVzIHRvIGV4cG9ydCB0aGVtIHJhdGhlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXS5yZXZlcnNlKClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmplY3Rpb25bdHlwZV0gPT09ICdfX2F1dG9fXycpXG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGN1cmx5ICovXG4gICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9ucywgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLCBjb250ZXh0KVxuICAgICAgICByZXR1cm4gaW5qZWN0aW9uXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgZmlsZSBwYXRocyB0b1xuICAgICAqIGV4Y2x1ZGUgKHNwZWNpZmllZCBieSBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0b1xuICAgICAqIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEByZXR1cm5zIEFsbCBkZXRlcm1pbmVkIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRBdXRvQ2h1bmsoXG4gICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZTpBcnJheTxzdHJpbmc+LFxuICAgICAgICBjb250ZXh0OnN0cmluZ1xuICAgICk6e1trZXk6c3RyaW5nXTpzdHJpbmd9IHtcbiAgICAgICAgY29uc3QgcmVzdWx0Ontba2V5OnN0cmluZ106c3RyaW5nfSA9IHt9XG4gICAgICAgIGNvbnN0IGluamVjdGVkTW9kdWxlSURzOntba2V5OnN0cmluZ106QXJyYXk8c3RyaW5nPn0gPSB7fVxuICAgICAgICBmb3IgKGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbiBvZiBidWlsZENvbmZpZ3VyYXRpb25zKSB7XG4gICAgICAgICAgICBpZiAoIWluamVjdGVkTW9kdWxlSURzW2J1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25dKVxuICAgICAgICAgICAgICAgIGluamVjdGVkTW9kdWxlSURzW2J1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25dID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlRmlsZVBhdGggb2YgYnVpbGRDb25maWd1cmF0aW9uLmZpbGVQYXRocylcbiAgICAgICAgICAgICAgICBpZiAoIW1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZS5pbmNsdWRlcyhtb2R1bGVGaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aDpzdHJpbmcgPSAnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoOnN0cmluZyA9IHBhdGguZGlybmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VOYW1lOnN0cmluZyA9IHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYC4ke2J1aWxkQ29uZmlndXJhdGlvbi5leHRlbnNpb259YClcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZHVsZUlEOnN0cmluZyA9IGJhc2VOYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3RvcnlQYXRoICE9PSAnLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IHBhdGguam9pbihkaXJlY3RvcnlQYXRoLCBiYXNlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IGVhY2ggb3V0cHV0IHR5cGUgaGFzIG9ubHkgb25lIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5qZWN0ZWRNb2R1bGVJRHNbXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgIF0uaW5jbHVkZXMobW9kdWxlSUQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IHNhbWUgbW9kdWxlIGlkcyBhbmQgZGlmZmVyZW50IG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVzIGNhbiBiZSBkaXN0aW5ndWlzaGVkIGJ5IHRoZWlyIGV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChKYXZhU2NyaXB0LU1vZHVsZXMgcmVtYWlucyB3aXRob3V0IGV4dGVuc2lvbiBzaW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZXkgd2lsbCBiZSBoYW5kbGVkIGZpcnN0IGJlY2F1c2UgdGhlIGJ1aWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgYXJlIGV4cGVjdGVkIHRvIGJlIHNvcnRlZCBpbiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCkuXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQsIG1vZHVsZUlEXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtyZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbbW9kdWxlSURdID0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0ZWRNb2R1bGVJRHNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgXS5wdXNoKG1vZHVsZUlEKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBlbmNvZGluZyAtIEVuY29kaW5nIHRvIHVzZSBmb3IgZmlsZSBuYW1lcyBkdXJpbmcgZmlsZSB0cmF2ZXJzaW5nLlxuICAgICAqIEByZXR1cm5zIEZpbGUgcGF0aCBvciBnaXZlbiBtb2R1bGUgaWQgaWYgZGV0ZXJtaW5hdGlvbnMgaGFzIGZhaWxlZCBvclxuICAgICAqIHdhc24ndCBuZWNlc3NhcnkuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICBtb2R1bGVJRDpzdHJpbmcsXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGV4dGVuc2lvbnM6UGxhaW5PYmplY3QgPSB7XG4gICAgICAgICAgICBmaWxlOiBLTk9XTl9GSUxFX0VYVEVOU0lPTlMubWFwKChzdWZmaXg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICBgLiR7c3VmZml4fWBcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBtb2R1bGU6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRleHQgPSAnLi8nLFxuICAgICAgICByZWZlcmVuY2VQYXRoID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9uczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4J10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJ10sXG4gICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgICAgICBlbmNvZGluZyA9ICd1dGYtOCdcbiAgICApOm51bGx8c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKEhlbHBlci5zdHJpcExvYWRlcihtb2R1bGVJRCksIGFsaWFzZXMpLFxuICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICBpZiAoIW1vZHVsZUlEKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgbGV0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyA9IG1vZHVsZUlEXG4gICAgICAgIGlmIChtb2R1bGVGaWxlUGF0aC5zdGFydHNXaXRoKCcuLycpKVxuICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGggPSBwYXRoLmpvaW4ocmVmZXJlbmNlUGF0aCwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgIGNvbnN0IG1vZHVsZUxvY2F0aW9ucyA9IFtyZWZlcmVuY2VQYXRoXS5jb25jYXQoXG4gICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucy5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQsIGZpbGVQYXRoKSlcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBwYXJ0cyA9IGNvbnRleHQuc3BsaXQoJy8nKVxuICAgICAgICBwYXJ0cy5zcGxpY2UoLTEsIDEpXG4gICAgICAgIHdoaWxlIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlbGF0aXZlUGF0aCBvZiByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucylcbiAgICAgICAgICAgICAgICBtb2R1bGVMb2NhdGlvbnMucHVzaChwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICcvJywgcGFydHMuam9pbignLycpLCByZWxhdGl2ZVBhdGgpKVxuICAgICAgICAgICAgcGFydHMuc3BsaWNlKC0xLCAxKVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbW9kdWxlTG9jYXRpb24gb2YgW3JlZmVyZW5jZVBhdGhdLmNvbmNhdChtb2R1bGVMb2NhdGlvbnMpKVxuICAgICAgICAgICAgZm9yIChsZXQgZmlsZU5hbWUgb2YgWycnLCAnX19wYWNrYWdlX18nXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzXG4gICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlRXh0ZW5zaW9uIG9mIGV4dGVuc2lvbnMubW9kdWxlLmNvbmNhdChbJyddKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlRXh0ZW5zaW9uIG9mIFsnJ10uY29uY2F0KGV4dGVuc2lvbnMuZmlsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50TW9kdWxlRmlsZVBhdGg6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlRmlsZVBhdGguc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVMb2NhdGlvbiwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFja2FnZUFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhjdXJyZW50TW9kdWxlRmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhUb1BhY2thZ2VKU09OOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCwgJ3BhY2thZ2UuanNvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKHBhdGhUb1BhY2thZ2VKU09OKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2FsQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFRvUGFja2FnZUpTT04sIHtlbmNvZGluZ30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5TmFtZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb25bcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5TmFtZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZUFsaWFzZXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmFwcGx5QWxpYXNlcyhmaWxlTmFtZSwgcGFja2FnZUFsaWFzZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZmlsZU5hbWV9JHttb2R1bGVFeHRlbnNpb259JHtmaWxlRXh0ZW5zaW9ufWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoICs9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2ZpbGVOYW1lfSR7bW9kdWxlRXh0ZW5zaW9ufSR7ZmlsZUV4dGVuc2lvbn1gXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoY3VycmVudE1vZHVsZUZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudE1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHJldHVybnMgVGhlIGFsaWFzIGFwcGxpZWQgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhcHBseUFsaWFzZXMobW9kdWxlSUQ6c3RyaW5nLCBhbGlhc2VzOlBsYWluT2JqZWN0KTpzdHJpbmcge1xuICAgICAgICBmb3IgKGNvbnN0IGFsaWFzIGluIGFsaWFzZXMpXG4gICAgICAgICAgICBpZiAoYWxpYXMuZW5kc1dpdGgoJyQnKSkge1xuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVJRCA9PT0gYWxpYXMuc3Vic3RyaW5nKDAsIGFsaWFzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IGFsaWFzZXNbYWxpYXNdXG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoYWxpYXMsIGFsaWFzZXNbYWxpYXNdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIHJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVndWxhciBleHByZXNzaW9ucyB0byB0aGVpclxuICAgICAqIGNvcnJlc3BvbmRpbmcgcmVwbGFjZW1lbnRzLlxuICAgICAqIEByZXR1cm5zIFRoZSByZXBsYWNlbWVudCBhcHBsaWVkIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgIG1vZHVsZUlEOnN0cmluZywgcmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0XG4gICAgKTpzdHJpbmcge1xuICAgICAgICBmb3IgKGNvbnN0IHJlcGxhY2VtZW50IGluIHJlcGxhY2VtZW50cylcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRzLCByZXBsYWNlbWVudFxuICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAocmVwbGFjZW1lbnQpLCByZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgbmVhcmVzdCBwYWNrYWdlIGNvbmZpZ3VyYXRpb24gZmlsZSBmcm9tIGdpdmVuIGZpbGUgcGF0aC5cbiAgICAgKiBAcGFyYW0gc3RhcnQgLSBSZWZlcmVuY2UgbG9jYXRpb24gdG8gc2VhcmNoIGZyb20uXG4gICAgICogQHBhcmFtIGZpbGVOYW1lIC0gUGFja2FnZSBjb25maWd1cmF0aW9uIGZpbGUgbmFtZS5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIGZpbGUgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZFBhY2thZ2VEZXNjcmlwdG9yRmlsZVBhdGgoXG4gICAgICAgIHN0YXJ0OkFycmF5PHN0cmluZz58c3RyaW5nLCBmaWxlTmFtZSA9ICdwYWNrYWdlLmpzb24nXG4gICAgKTpudWxsfHN0cmluZyB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRbc3RhcnQubGVuZ3RoIC0gMV0gIT09IHBhdGguc2VwKVxuICAgICAgICAgICAgICAgIHN0YXJ0ICs9IHBhdGguc2VwXG4gICAgICAgICAgICBzdGFydCA9IHN0YXJ0LnNwbGl0KHBhdGguc2VwKVxuICAgICAgICB9XG4gICAgICAgIGlmICghc3RhcnQubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgc3RhcnQucG9wKClcbiAgICAgICAgY29uc3QgcmVzdWx0OnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIHN0YXJ0LmpvaW4ocGF0aC5zZXApLCBmaWxlTmFtZSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtLmV4aXN0c1N5bmMocmVzdWx0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICByZXR1cm4gSGVscGVyLmZpbmRQYWNrYWdlRGVzY3JpcHRvckZpbGVQYXRoKHN0YXJ0LCBmaWxlTmFtZSlcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgbmVhcmVzdCBwYWNrYWdlIGNvbmZpZ3VyYXRpb24gZnJvbSBnaXZlbiBtb2R1bGUgZmlsZVxuICAgICAqIHBhdGguXG4gICAgICogQHBhcmFtIG1vZHVsZVBhdGggLSBNb2R1bGUgcGF0aCB0byB0YWtlIGFzIHJlZmVyZW5jZSBsb2NhdGlvbiAobGVhZiBpblxuICAgICAqIHRyZWUpLlxuICAgICAqIEBwYXJhbSBmaWxlTmFtZSAtIFBhY2thZ2UgY29uZmlndXJhdGlvbiBmaWxlIG5hbWUuXG4gICAgICogQHJldHVybnMgQSBvYmplY3QgY29udGFpbmluZyBmb3VuZCBwYXJzZWQgY29uZmlndXJhdGlvbiBhbiB0aGVpclxuICAgICAqIGNvcnJlc3BvbmRpbmcgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRDbG9zZXN0UGFja2FnZURlc2NyaXB0b3IoXG4gICAgICAgIG1vZHVsZVBhdGg6c3RyaW5nLCBmaWxlTmFtZSA9ICdwYWNrYWdlLmpzb24nXG4gICAgKTpudWxsfFBsYWluT2JqZWN0IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGg6bnVsbHxzdHJpbmcgPSBIZWxwZXIuZmluZFBhY2thZ2VEZXNjcmlwdG9yRmlsZVBhdGgoXG4gICAgICAgICAgICBtb2R1bGVQYXRoLCBmaWxlTmFtZSlcbiAgICAgICAgaWYgKCFmaWxlUGF0aClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGNvbnN0IGNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSBldmFsKCdyZXF1aXJlJykoZmlsZVBhdGgpXG4gICAgICAgIC8qXG4gICAgICAgICAgICBJZiB0aGUgcGFja2FnZS5qc29uIGRvZXMgbm90IGhhdmUgYSBuYW1lIHByb3BlcnR5LCB0cnkgYWdhaW4gZnJvbVxuICAgICAgICAgICAgb25lIGxldmVsIGhpZ2hlci5cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKCFjb25maWd1cmF0aW9uLm5hbWUpXG4gICAgICAgICAgICByZXR1cm4gSGVscGVyLmdldENsb3Nlc3RQYWNrYWdlRGVzY3JpcHRvcihcbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSwgJy4uJyksIGZpbGVOYW1lKVxuICAgICAgICByZXR1cm4ge2NvbmZpZ3VyYXRpb24sIGZpbGVQYXRofVxuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEhlbHBlclxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==