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
exports["default"] = exports.Helper = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _clientnode = _interopRequireDefault(require("clientnode"));

var _jsdom = require("jsdom");

var _fs = _interopRequireDefault(require("fs"));

var _path2 = _interopRequireDefault(require("path"));

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

          if (!assetType.pattern.hasOwnProperty(pattern)) continue;
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

                if (!assets.hasOwnProperty(_path)) continue;
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
        if (scope.hasOwnProperty(placeholderName)) filePath = filePath.replace(new RegExp(_clientnode["default"].stringEscapeRegularExpressions(placeholderName), 'g'), scope[placeholderName]);
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
          internal: ['js', 'json', 'css', 'eot', 'gif', 'html', 'ico', 'jpg', 'png', 'ejs', 'svg', 'ttf', 'woff', '.woff2'].map(function (suffix) {
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
        if (normalizedEntryInjection.hasOwnProperty(chunkName)) {
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
            if (paths[_type].asset.hasOwnProperty(assetType) && assetType !== 'base' && paths[_type].asset[assetType] && filePath.startsWith(paths[_type].asset[assetType])) return assetType;
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
        if (configuration.hasOwnProperty(type)) {
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
        file: ['js', 'json', 'css', 'eot', 'gif', 'html', 'ico', 'jpg', 'png', 'ejs', 'svg', 'ttf', 'woff', '.woff2'].map(function (suffix) {
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
        if (normalizedEntryInjection.hasOwnProperty(chunkName)) {
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
        if (normalizedEntryInjection.hasOwnProperty(chunkName)) {
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
      if (_clientnode["default"].isFunction(entryInjection)) // IgnoreTypeCheck
        entryInjection = entryInjection();
      if (Array.isArray(entryInjection)) result = {
        index: entryInjection
      };else if (typeof entryInjection === 'string') result = {
        index: [entryInjection]
      };else if (_clientnode["default"].isPlainObject(entryInjection)) {
        var hasContent = false;
        var chunkNamesToDelete = [];

        for (var chunkName in entryInjection) {
          if (entryInjection.hasOwnProperty(chunkName)) if (Array.isArray(entryInjection[chunkName])) {
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
          internal: ['js', 'json', 'css', 'eot', 'gif', 'html', 'ico', 'jpg', 'png', 'ejs', 'svg', 'ttf', 'woff', '.woff2'].map(function (suffix) {
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
                if (modules.hasOwnProperty(subChunkName)) injection[type][chunkName].push(modules[subChunkName]);
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
                  if (result.hasOwnProperty(moduleID)) result[relativeModuleFilePath] = relativeModuleFilePath;else result[moduleID] = relativeModuleFilePath;
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
        file: ['js', 'json', 'css', 'eot', 'gif', 'html', 'ico', 'jpg', 'png', 'ejs', 'svg', 'ttf', 'woff', '.woff2'].map(function (suffix) {
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

                                if (localConfiguration.hasOwnProperty(propertyName) && typeof localConfiguration[propertyName] === 'string' && localConfiguration[propertyName]) {
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

                                if (localConfiguration.hasOwnProperty(_propertyName) && (0, _typeof2["default"])(localConfiguration[_propertyName]) === 'object') {
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
        if (replacements.hasOwnProperty(replacement)) moduleID = moduleID.replace(new RegExp(replacement), replacements[replacement]);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QWEsR0FBRyxrQkFBSyxPQUFMLENBQ2xCLEtBQUssQ0FBQyxJQUFOLENBQVcsa0JBQUssR0FBaEIsQ0FEa0IsRUFDSSxRQURKLENBQXRCOztBQUVBLFVBQUk7QUFDQSxZQUFJLGVBQVcsVUFBWCxDQUFzQixNQUF0QixDQUFKLEVBQ0ksT0FBTyxNQUFQO0FBQ1AsT0FIRCxDQUdFLE9BQU8sS0FBUCxFQUFjLENBQUU7O0FBQ2xCLGFBQU8sTUFBTSxDQUFDLDZCQUFQLENBQXFDLEtBQXJDLEVBQTRDLFFBQTVDLENBQVA7QUFDSDtBQUNEOzs7Ozs7Ozs7Ozs7Z0RBVUksVSxFQUNlO0FBQUEsVUFESSxRQUNKLHVFQURzQixjQUN0QjtBQUNmLFVBQU0sUUFBb0IsR0FBRyxNQUFNLENBQUMsNkJBQVAsQ0FDekIsVUFEeUIsRUFDYixRQURhLENBQTdCO0FBRUEsVUFBSSxDQUFDLFFBQUwsRUFDSSxPQUFPLElBQVA7QUFDSixVQUFNLGFBQXlCLEdBQUcsSUFBSSxDQUFDLFNBQUQsQ0FBSixDQUFnQixRQUFoQixDQUFsQztBQUNBOzs7OztBQUlBLFVBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsRUFDSSxPQUFPLE1BQU0sQ0FBQywyQkFBUCxDQUNILGtCQUFLLE9BQUwsQ0FBYSxrQkFBSyxPQUFMLENBQWEsUUFBYixDQUFiLEVBQXFDLElBQXJDLENBREcsRUFDeUMsUUFEekMsQ0FBUDtBQUVKLGFBQU87QUFBQyxRQUFBLGFBQWEsRUFBYixhQUFEO0FBQWdCLFFBQUEsUUFBUSxFQUFSO0FBQWhCLE9BQVA7QUFDSDs7Ozs7O2VBRVUsTSxFQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiaGVscGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9uc1xuICAgIG5hbWluZyAzLjAgdW5wb3J0ZWQgbGljZW5zZS5cbiAgICBTZWUgaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB0eXBlIHtEb21Ob2RlfSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgdHlwZSB7RmlsZSwgUGxhaW5PYmplY3QsIFdpbmRvd30gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB7SlNET00gYXMgRE9NfSBmcm9tICdqc2RvbSdcbmltcG9ydCBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuaW1wb3J0IHR5cGUge1xuICAgIEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBFeHRlbnNpb25zLFxuICAgIEluamVjdGlvbixcbiAgICBFbnRyeUluamVjdGlvbixcbiAgICBOb3JtYWxpemVkRW50cnlJbmplY3Rpb24sXG4gICAgUGF0aCxcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbn0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbWV0aG9kc1xuLyoqXG4gKiBQcm92aWRlcyBhIGNsYXNzIG9mIHN0YXRpYyBtZXRob2RzIHdpdGggZ2VuZXJpYyB1c2UgY2FzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWxwZXIge1xuICAgIC8vIHJlZ2lvbiBib29sZWFuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gZ2l2ZW4gbGlzdCBvZiBmaWxlXG4gICAgICogbG9jYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0gbG9jYXRpb25zVG9DaGVjayAtIExvY2F0aW9ucyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBWYWx1ZSBcInRydWVcIiBpZiBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIG9uZSBvZiBnaXZlblxuICAgICAqIGxvY2F0aW9ucyBvciBcImZhbHNlXCIgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBsb2NhdGlvbnNUb0NoZWNrOkFycmF5PHN0cmluZz5cbiAgICApOmJvb2xlYW4ge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGhUb0NoZWNrOnN0cmluZyBvZiBsb2NhdGlvbnNUb0NoZWNrKVxuICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShmaWxlUGF0aCkuc3RhcnRzV2l0aChwYXRoLnJlc29sdmUocGF0aFRvQ2hlY2spKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHN0cmluZ1xuICAgIC8qKlxuICAgICAqIEluIHBsYWNlcyBlYWNoIG1hdGNoaW5nIGNhc2NhZGluZyBzdHlsZSBzaGVldCBvciBqYXZhU2NyaXB0IGZpbGVcbiAgICAgKiByZWZlcmVuY2UuXG4gICAgICogQHBhcmFtIGNvbnRlbnQgLSBNYXJrdXAgY29udGVudCB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybiAtIFBhdHRlcm4gdG8gbWF0Y2ggY2FzY2FkaW5nIHN0eWxlXG4gICAgICogc2hlZXQgYXNzZXQgcmVmZXJlbmNlcyBhZ2Fpbi5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdFBhdHRlcm4gLSBQYXR0ZXJuIHRvIG1hdGNoIGphdmFTY3JpcHQgYXNzZXQgcmVmZXJlbmNlc1xuICAgICAqIGFnYWluLlxuICAgICAqIEBwYXJhbSBiYXNlUGF0aCAtIEJhc2UgcGF0aCB0byB1c2UgYXMgcHJlZml4IGZvciBmaWxlIHJlZmVyZW5jZXMuXG4gICAgICogQHBhcmFtIGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZSAtIENhc2NhZGluZyBzdHlsZSBzaGVldFxuICAgICAqIGNodW5rIG5hbWUgdGVtcGxhdGUgdG8gdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlIC0gSmF2YVNjcmlwdCBjaHVuayBuYW1lIHRlbXBsYXRlIHRvXG4gICAgICogdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gYXNzZXRzIC0gTWFwcGluZyBvZiBhc3NldCBmaWxlIHBhdGhzIHRvIHRoZWlyIGNvbnRlbnQuXG4gICAgICogQHJldHVybnMgR2l2ZW4gYW4gdHJhbnNmb3JtZWQgbWFya3VwLlxuICAgICAqL1xuICAgIHN0YXRpYyBpblBsYWNlQ1NTQW5kSmF2YVNjcmlwdEFzc2V0UmVmZXJlbmNlcyhcbiAgICAgICAgY29udGVudDpzdHJpbmcsXG4gICAgICAgIGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuOj97W2tleTpzdHJpbmddOidib2R5J3wnaGVhZCd8J2luJ3xzdHJpbmd9LFxuICAgICAgICBqYXZhU2NyaXB0UGF0dGVybjo/e1trZXk6c3RyaW5nXTonYm9keSd8J2hlYWQnfCdpbid8c3RyaW5nfSxcbiAgICAgICAgYmFzZVBhdGg6c3RyaW5nLFxuICAgICAgICBjYXNjYWRpbmdTdHlsZVNoZWV0Q2h1bmtOYW1lVGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBqYXZhU2NyaXB0Q2h1bmtOYW1lVGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBhc3NldHM6e1trZXk6c3RyaW5nXTpPYmplY3R9XG4gICAgKTp7XG4gICAgICAgIGNvbnRlbnQ6c3RyaW5nO1xuICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+O1xuICAgIH0ge1xuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byBwcmV2ZW50IGNyZWF0aW5nIG5hdGl2ZSBcInN0eWxlXCIgZG9tIG5vZGVzIHRvXG4gICAgICAgICAgICBwcmV2ZW50IGpzZG9tIGZyb20gcGFyc2luZyB0aGUgZW50aXJlIGNhc2NhZGluZyBzdHlsZSBzaGVldC4gV2hpY2hcbiAgICAgICAgICAgIGlzIGVycm9yIHBydW5lIGFuZCB2ZXJ5IHJlc291cmNlIGludGVuc2l2ZS5cbiAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3R5bGVDb250ZW50czpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgIC8oPHN0eWxlW14+XSo+KShbXFxzXFxTXSo/KSg8XFwvc3R5bGVbXj5dKj4pL2dpLCAoXG4gICAgICAgICAgICAgICAgbWF0Y2g6c3RyaW5nLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGFnOnN0cmluZyxcbiAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZyxcbiAgICAgICAgICAgICAgICBlbmRUYWc6c3RyaW5nXG4gICAgICAgICAgICApOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgc3R5bGVDb250ZW50cy5wdXNoKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3N0YXJ0VGFnfSR7ZW5kVGFnfWBcbiAgICAgICAgICAgIH0pXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHRyYW5zbGF0ZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgdG8gaHRtbCBjb21wYXRpYmxlXG4gICAgICAgICAgICBzZXF1ZW5jZXMgYW5kIHRyYW5zbGF0ZSBpdCBiYWNrIGxhdGVyIHRvIGF2b2lkIHVuZXhwZWN0ZWQgZXNjYXBlXG4gICAgICAgICAgICBzZXF1ZW5jZXMgaW4gcmVzdWx0aW5nIGh0bWwuXG4gICAgICAgICovXG4gICAgICAgIGNvbnN0IHdpbmRvdzpXaW5kb3cgPSAobmV3IERPTShcbiAgICAgICAgICAgIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvPCUvZywgJyMjKyMrIysjIycpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyU+L2csICcjIy0jLSMtIyMnKVxuICAgICAgICApKS53aW5kb3dcbiAgICAgICAgY29uc3QgaW5QbGFjZVN0eWxlQ29udGVudHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBmb3IgKGNvbnN0IGFzc2V0VHlwZTpQbGFpbk9iamVjdCBvZiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlTmFtZTogJ2hyZWYnLFxuICAgICAgICAgICAgICAgIGhhc2g6ICdoYXNoJyxcbiAgICAgICAgICAgICAgICBsaW5rVGFnTmFtZTogJ2xpbmsnLFxuICAgICAgICAgICAgICAgIHBhdHRlcm46IGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiAnW2hyZWYqPVwiLmNzc1wiXScsXG4gICAgICAgICAgICAgICAgdGFnTmFtZTogJ3N0eWxlJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogY2FzY2FkaW5nU3R5bGVTaGVldENodW5rTmFtZVRlbXBsYXRlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU6ICdzcmMnLFxuICAgICAgICAgICAgICAgIGhhc2g6ICdoYXNoJyxcbiAgICAgICAgICAgICAgICBsaW5rVGFnTmFtZTogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgICAgcGF0dGVybjogamF2YVNjcmlwdFBhdHRlcm4sXG4gICAgICAgICAgICAgICAgc2VsZWN0b3I6ICdbaHJlZio9XCIuanNcIl0nLFxuICAgICAgICAgICAgICAgIHRhZ05hbWU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBqYXZhU2NyaXB0Q2h1bmtOYW1lVGVtcGxhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSlcbiAgICAgICAgICAgIGlmIChhc3NldFR5cGUucGF0dGVybilcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm46c3RyaW5nIGluIGFzc2V0VHlwZS5wYXR0ZXJuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXNzZXRUeXBlLnBhdHRlcm4uaGFzT3duUHJvcGVydHkocGF0dGVybikpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3I6c3RyaW5nID0gYXNzZXRUeXBlLnNlbGVjdG9yXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXR0ZXJuICE9PSAnKicpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IGBbJHthc3NldFR5cGUuYXR0cmlidXRlTmFtZX1ePVwiYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGgsIEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlLnRlbXBsYXRlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2BbJHthc3NldFR5cGUuaGFzaH1dYF06ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbaWRdJzogcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW25hbWVdJzogcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSArICdcIl0nXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGVzOkFycmF5PERvbU5vZGU+ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS5saW5rVGFnTmFtZX0ke3NlbGVjdG9yfWApXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21Ob2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZiBkb21Ob2Rlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGg6c3RyaW5nID0gZG9tTm9kZS5hdHRyaWJ1dGVzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUuYXR0cmlidXRlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0udmFsdWUucmVwbGFjZSgvJi4qL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXNzZXRzLmhhc093blByb3BlcnR5KHBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluUGxhY2VEb21Ob2RlOkRvbU5vZGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZS50YWdOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhc3NldFR5cGUudGFnTmFtZSA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2Vib3B0aW1pemVyaW5wbGFjZScsICd0cnVlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZVN0eWxlQ29udGVudHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0c1twYXRoXS5zb3VyY2UoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUudGV4dENvbnRlbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRzW3BhdGhdLnNvdXJjZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0VHlwZS5wYXR0ZXJuW3BhdHRlcm5dID09PSAnYm9keScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl0gPT09ICdpbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhc3NldFR5cGUucGF0dGVybltwYXR0ZXJuXSA9PT0gJ2hlYWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWd1bGFyRXhwcmVzc2lvblBhdHRlcm46c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcoYWZ0ZXJ8YmVmb3JlfGluKTooLispJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXN0TWF0Y2g6P0FycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFJlZ0V4cChyZWd1bGFyRXhwcmVzc2lvblBhdHRlcm4pLmV4ZWMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaDpBcnJheTxzdHJpbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZXN0TWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IHRlc3RNYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0dpdmVuIGluIHBsYWNlIHNwZWNpZmljYXRpb24gXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHthc3NldFR5cGUucGF0dGVybltwYXR0ZXJuXX1cIiBmb3IgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7YXNzZXRUeXBlLnRhZ05hbWV9IGRvZXMgbm90IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzYXRpc2Z5IHRoZSBzcGVjaWZpZWQgcGF0dGVybiBcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3JlZ3VsYXJFeHByZXNzaW9uUGF0dGVybn1cIi5gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihtYXRjaFsyXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBTcGVjaWZpZWQgZG9tIG5vZGUgXCIke21hdGNoWzJdfVwiIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb3VsZCBub3QgYmUgZm91bmQgdG8gaW4gcGxhY2UgXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtwYXR0ZXJufVwiLmApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaFsxXSA9PT0gJ2luJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuYXBwZW5kQ2hpbGQoaW5QbGFjZURvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1hdGNoWzFdID09PSAnYmVmb3JlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRBZnRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogVGhpcyBkb2Vzbid0IHByZXZlbnQgd2VicGFjayBmcm9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW5nIHRoaXMgZmlsZSBpZiBwcmVzZW50IGluIGFub3RoZXIgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc28gcmVtb3ZpbmcgaXQgKGFuZCBhIHBvdGVudGlhbCBzb3VyY2UgbWFwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUpIGxhdGVyIGluIHRoZSBcImRvbmVcIiBob29rLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmUucHVzaChIZWxwZXIuc3RyaXBMb2FkZXIocGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFzc2V0c1twYXRoXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYE5vIHJlZmVyZW5jZWQgJHthc3NldFR5cGUudGFnTmFtZX0gZmlsZSBpbiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVzdWx0aW5nIG1hcmt1cCBmb3VuZCB3aXRoIHNlbGVjdG9yOiBcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS5saW5rVGFnTmFtZX0ke2Fzc2V0VHlwZS5zZWxlY3Rvcn1cImBcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIC8vIE5PVEU6IFdlIGhhdmUgdG8gcmVzdG9yZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgYW5kIHN0eWxlIGNvbnRlbnRzLlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGVudDogY29udGVudFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXihcXHMqPCFkb2N0eXBlIFtePl0rPz5cXHMqKVtcXHNcXFNdKiQvaSwgJyQxJ1xuICAgICAgICAgICAgICAgICkgKyB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8jI1xcKyNcXCsjXFwrIyMvZywgJzwlJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyMtIy0jLSMjL2csICclPicpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg8c3R5bGVbXj5dKj4pW1xcc1xcU10qPyg8XFwvc3R5bGVbXj5dKj4pL2dpLCAoXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBlbmRUYWc6c3RyaW5nXG4gICAgICAgICAgICAgICAgKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRUYWcuaW5jbHVkZXMoJyB3ZWJvcHRpbWl6ZXJpbnBsYWNlPVwidHJ1ZVwiJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGFnLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgd2Vib3B0aW1pemVyaW5wbGFjZT1cInRydWVcIicsICcnKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aW5QbGFjZVN0eWxlQ29udGVudHMuc2hpZnQoKX0ke2VuZFRhZ31gXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtzdGFydFRhZ30ke3N0eWxlQ29udGVudHMuc2hpZnQoKX0ke2VuZFRhZ31gXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFN0cmlwcyBsb2FkZXIgaW5mb3JtYXRpb25zIGZvcm0gZ2l2ZW4gbW9kdWxlIHJlcXVlc3QgaW5jbHVkaW5nIGxvYWRlclxuICAgICAqIHByZWZpeCBhbmQgcXVlcnkgcGFyYW1ldGVyLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSByZXF1ZXN0IHRvIHN0cmlwLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIG1vZHVsZSBpZCBzdHJpcHBlZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgc3RyaXBMb2FkZXIobW9kdWxlSUQ6c3RyaW5nfFN0cmluZyk6c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBtb2R1bGVJRC50b1N0cmluZygpXG4gICAgICAgIGNvbnN0IG1vZHVsZUlEV2l0aG91dExvYWRlcjpzdHJpbmcgPSBtb2R1bGVJRC5zdWJzdHJpbmcoXG4gICAgICAgICAgICBtb2R1bGVJRC5sYXN0SW5kZXhPZignIScpICsgMSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEV2l0aG91dExvYWRlci5pbmNsdWRlcygnPycpID9cbiAgICAgICAgICAgIG1vZHVsZUlEV2l0aG91dExvYWRlci5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgMCwgbW9kdWxlSURXaXRob3V0TG9hZGVyLmluZGV4T2YoJz8nKSkgOlxuICAgICAgICAgICAgbW9kdWxlSURXaXRob3V0TG9hZGVyXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBhcnJheVxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGdpdmVuIGxpc3Qgb2YgcGF0aCB0byBhIG5vcm1hbGl6ZWQgbGlzdCB3aXRoIHVuaXF1ZSB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHBhdGhzIC0gRmlsZSBwYXRocy5cbiAgICAgKiBAcmV0dXJucyBUaGUgZ2l2ZW4gZmlsZSBwYXRoIGxpc3Qgd2l0aCBub3JtYWxpemVkIHVuaXF1ZSB2YWx1ZXMuXG4gICAgICovXG4gICAgc3RhdGljIG5vcm1hbGl6ZVBhdGhzKHBhdGhzOkFycmF5PHN0cmluZz4pOkFycmF5PHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHBhdGhzLm1hcCgoZ2l2ZW5QYXRoOnN0cmluZyk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgIGdpdmVuUGF0aCA9IHBhdGgubm9ybWFsaXplKGdpdmVuUGF0aClcbiAgICAgICAgICAgIGlmIChnaXZlblBhdGguZW5kc1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2l2ZW5QYXRoLnN1YnN0cmluZygwLCBnaXZlblBhdGgubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIHJldHVybiBnaXZlblBhdGhcbiAgICAgICAgfSkpKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZmlsZSBoYW5kbGVyXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBmaWxlIHBhdGgvbmFtZSBwbGFjZWhvbGRlciByZXBsYWNlbWVudHMgd2l0aCBnaXZlbiBidW5kbGVcbiAgICAgKiBhc3NvY2lhdGVkIGluZm9ybWF0aW9ucy5cbiAgICAgKiBAcGFyYW0gdGVtcGxhdGUgLSBGaWxlIHBhdGggdG8gcHJvY2VzcyBwbGFjZWhvbGRlciBpbi5cbiAgICAgKiBAcGFyYW0gc2NvcGUgLSBTY29wZSB0byB1c2UgZm9yIHByb2Nlc3NpbmcuXG4gICAgICogQHJldHVybnMgUHJvY2Vzc2VkIGZpbGUgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgdGVtcGxhdGU6c3RyaW5nLCBzY29wZTp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7fVxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgc2NvcGUgPSBUb29scy5leHRlbmQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgJ1toYXNoXSc6ICcuX19kdW1teV9fJyxcbiAgICAgICAgICAgICAgICAnW2lkXSc6ICcuX19kdW1teV9fJyxcbiAgICAgICAgICAgICAgICAnW25hbWVdJzogJy5fX2R1bW15X18nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2NvcGUpXG4gICAgICAgIGxldCBmaWxlUGF0aDpzdHJpbmcgPSB0ZW1wbGF0ZVxuICAgICAgICBmb3IgKGNvbnN0IHBsYWNlaG9sZGVyTmFtZTpzdHJpbmcgaW4gc2NvcGUpXG4gICAgICAgICAgICBpZiAoc2NvcGUuaGFzT3duUHJvcGVydHkocGxhY2Vob2xkZXJOYW1lKSlcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMocGxhY2Vob2xkZXJOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdnJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBzY29wZVtwbGFjZWhvbGRlck5hbWVdXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICByZXR1cm4gZmlsZVBhdGhcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZ2l2ZW4gcmVxdWVzdCB0byBhIHJlc29sdmVkIHJlcXVlc3Qgd2l0aCBnaXZlbiBjb250ZXh0XG4gICAgICogZW1iZWRkZWQuXG4gICAgICogQHBhcmFtIHJlcXVlc3QgLSBSZXF1ZXN0IHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIENvbnRleHQgb2YgZ2l2ZW4gcmVxdWVzdCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zIC0gTGlzdCBvZiByZWxhdGl2ZSBkaXJlY3RvcnkgcGF0aHMgdG9cbiAgICAgKiBzZWFyY2ggZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHJldHVybnMgQSBuZXcgcmVzb2x2ZWQgcmVxdWVzdC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlDb250ZXh0KFxuICAgICAgICByZXF1ZXN0OnN0cmluZyxcbiAgICAgICAgY29udGV4dDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcuLycsXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddXG4gICAgKTpzdHJpbmcge1xuICAgICAgICByZWZlcmVuY2VQYXRoID0gcGF0aC5yZXNvbHZlKHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHJlcXVlc3Quc3RhcnRzV2l0aCgnLi8nKSAmJlxuICAgICAgICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQpICE9PSByZWZlcmVuY2VQYXRoXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmVxdWVzdCA9IHBhdGgucmVzb2x2ZShjb250ZXh0LCByZXF1ZXN0KVxuICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVQYXRoOnN0cmluZyBvZiByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBtb2R1bGVQYXRoKVxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgocGF0aFByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKHBhdGhQcmVmaXgubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5zdWJzdHJpbmcocmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50c1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aChyZWZlcmVuY2VQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhyZWZlcmVuY2VQYXRoLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LnN1YnN0cmluZyhyZXF1ZXN0Lmxhc3RJbmRleE9mKCchJykgKyAxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXF1ZXN0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGdpdmVuIHJlcXVlc3QgcG9pbnRzIHRvIGFuIGV4dGVybmFsIGRlcGVuZGVuY3kgbm90IG1haW50YWluZWRcbiAgICAgKiBieSBjdXJyZW50IHBhY2thZ2UgY29udGV4dC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdCAtIFJlcXVlc3QgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gQ29udGV4dCBvZiBjdXJyZW50IHByb2plY3QuXG4gICAgICogQHBhcmFtIHJlcXVlc3RDb250ZXh0IC0gQ29udGV4dCBvZiBnaXZlbiByZXF1ZXN0IHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbiAtIE1hcHBpbmcgb2YgY2h1bmsgbmFtZXMgdG8gbW9kdWxlc1xuICAgICAqIHdoaWNoIHNob3VsZCBiZSBpbmplY3RlZC5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVFeHRlcm5hbE1vZHVsZUxvY2F0aW9ucyAtIEFycmF5IG9mIHBhdGhzIHdoZXJlIGV4dGVybmFsXG4gICAgICogbW9kdWxlcyB0YWtlIHBsYWNlLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBpbmNsdWRlUGF0dGVybiAtIEFycmF5IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZXhwbGljaXRseSBtYXJrXG4gICAgICogYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAgKiBAcGFyYW0gZXhjbHVkZVBhdHRlcm4gLSBBcnJheSBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIGV4cGxpY2l0bHkgbWFya1xuICAgICAqIGFzIGludGVybmFsIGRlcGVuZGVuY3kuXG4gICAgICogQHBhcmFtIGluUGxhY2VOb3JtYWxMaWJyYXJ5IC0gSW5kaWNhdGVzIHdoZXRoZXIgbm9ybWFsIGxpYnJhcmllcyBzaG91bGRcbiAgICAgKiBiZSBleHRlcm5hbCBvciBub3QuXG4gICAgICogQHBhcmFtIGluUGxhY2VEeW5hbWljTGlicmFyeSAtIEluZGljYXRlcyB3aGV0aGVyIHJlcXVlc3RzIHdpdGhcbiAgICAgKiBpbnRlZ3JhdGVkIGxvYWRlciBjb25maWd1cmF0aW9ucyBzaG91bGQgYmUgbWFya2VkIGFzIGV4dGVybmFsIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgLSBFbmNvZGluZyBmb3IgZmlsZSBuYW1lcyB0byB1c2UgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBBIG5ldyByZXNvbHZlZCByZXF1ZXN0IGluZGljYXRpbmcgd2hldGhlciBnaXZlbiByZXF1ZXN0IGlzIGFuXG4gICAgICogZXh0ZXJuYWwgb25lLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgIHJlcXVlc3Q6c3RyaW5nLFxuICAgICAgICBjb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIHJlcXVlc3RDb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbjpOb3JtYWxpemVkRW50cnlJbmplY3Rpb24gPSB7fSxcbiAgICAgICAgcmVsYXRpdmVFeHRlcm5hbE1vZHVsZUxvY2F0aW9uczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5jb21waWxlZC5qcycsICcuanMnLCAnLmpzb24nXSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAnanMnLFxuICAgICAgICAgICAgICAgICAgICAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgICdjc3MnLFxuICAgICAgICAgICAgICAgICAgICAnZW90JyxcbiAgICAgICAgICAgICAgICAgICAgJ2dpZicsXG4gICAgICAgICAgICAgICAgICAgICdodG1sJyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljbycsXG4gICAgICAgICAgICAgICAgICAgICdqcGcnLFxuICAgICAgICAgICAgICAgICAgICAncG5nJyxcbiAgICAgICAgICAgICAgICAgICAgJ2VqcycsXG4gICAgICAgICAgICAgICAgICAgICdzdmcnLFxuICAgICAgICAgICAgICAgICAgICAndHRmJyxcbiAgICAgICAgICAgICAgICAgICAgJ3dvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgICAgIF0ubWFwKChzdWZmaXg6c3RyaW5nKTpzdHJpbmcgPT4gYC4ke3N1ZmZpeH1gKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZTogW11cbiAgICAgICAgfSxcbiAgICAgICAgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gWydpbmRleCcsICdtYWluJ10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJywgJ21vZHVsZSddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgaW5jbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgZXhjbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgaW5QbGFjZU5vcm1hbExpYnJhcnk6Ym9vbGVhbiA9IGZhbHNlLFxuICAgICAgICBpblBsYWNlRHluYW1pY0xpYnJhcnk6Ym9vbGVhbiA9IHRydWUsXG4gICAgICAgIGVuY29kaW5nOnN0cmluZyA9ICd1dGYtOCdcbiAgICApOm51bGx8c3RyaW5nIHtcbiAgICAgICAgY29udGV4dCA9IHBhdGgucmVzb2x2ZShjb250ZXh0KVxuICAgICAgICByZXF1ZXN0Q29udGV4dCA9IHBhdGgucmVzb2x2ZShyZXF1ZXN0Q29udGV4dClcbiAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVzb2x2ZShyZWZlcmVuY2VQYXRoKVxuICAgICAgICAvLyBOT1RFOiBXZSBhcHBseSBhbGlhcyBvbiBleHRlcm5hbHMgYWRkaXRpb25hbGx5LlxuICAgICAgICBjb25zdCByZXNvbHZlZFJlcXVlc3Q6c3RyaW5nID0gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICAgICAgSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnN1YnN0cmluZyhyZXF1ZXN0Lmxhc3RJbmRleE9mKCchJykgKyAxKSwgYWxpYXNlcyksXG4gICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHNcbiAgICAgICAgKVxuICAgICAgICBpZiAoVG9vbHMuaXNBbnlNYXRjaGluZyhyZXNvbHZlZFJlcXVlc3QsIGV4Y2x1ZGVQYXR0ZXJuKSlcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBBbGlhc2VzIGFuZCBtb2R1bGUgcmVwbGFjZW1lbnRzIGRvZXNuJ3QgaGF2ZSB0byBiZSBmb3J3YXJkZWRcbiAgICAgICAgICAgIHNpbmNlIHdlIHBhc3MgYW4gYWxyZWFkeSByZXNvbHZlZCByZXF1ZXN0LlxuICAgICAgICAqL1xuICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHtmaWxlOiBleHRlbnNpb25zLmZpbGUuZXh0ZXJuYWwsIG1vZHVsZTogZXh0ZW5zaW9ucy5tb2R1bGV9LFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIHJlcXVlc3RDb250ZXh0LFxuICAgICAgICAgICAgcGF0aHNUb0lnbm9yZSxcbiAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zLFxuICAgICAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzLFxuICAgICAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGVuY29kaW5nXG4gICAgICAgIClcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIG1hcmsgZGVwZW5kZW5jaWVzIGFzIGV4dGVybmFsIGlmIHRoZXJlIGZpbGUgY291bGRuJ3QgYmVcbiAgICAgICAgICAgIHJlc29sdmVkIG9yIGFyZSBzcGVjaWZpZWQgdG8gYmUgZXh0ZXJuYWwgZXhwbGljaXRseS5cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIShmaWxlUGF0aCB8fCBpblBsYWNlTm9ybWFsTGlicmFyeSkgfHxcbiAgICAgICAgICAgIFRvb2xzLmlzQW55TWF0Y2hpbmcocmVzb2x2ZWRSZXF1ZXN0LCBpbmNsdWRlUGF0dGVybilcbiAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseUNvbnRleHQoXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LFxuICAgICAgICAgICAgICAgIHJlcXVlc3RDb250ZXh0LFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsXG4gICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkRW50cnlJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkRW50cnlJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZTogZXh0ZW5zaW9ucy5tb2R1bGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgKSA9PT0gZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBjb25zdCBwYXJ0cyA9IGNvbnRleHQuc3BsaXQoJy8nKVxuICAgICAgICBjb25zdCBleHRlcm5hbE1vZHVsZUxvY2F0aW9ucyA9IFtdXG4gICAgICAgIHdoaWxlIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlbGF0aXZlUGF0aDpzdHJpbmcgb2YgcmVsYXRpdmVFeHRlcm5hbE1vZHVsZUxvY2F0aW9ucylcbiAgICAgICAgICAgICAgICBleHRlcm5hbE1vZHVsZUxvY2F0aW9ucy5wdXNoKHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgJy8nLCBwYXJ0cy5qb2luKCcvJyksIHJlbGF0aXZlUGF0aCkpXG4gICAgICAgICAgICBwYXJ0cy5zcGxpY2UoLTEsIDEpXG4gICAgICAgIH1cbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIG1hcmsgZGVwZW5kZW5jaWVzIGFzIGV4dGVybmFsIGlmIHRoZXkgZG9lcyBub3QgY29udGFpbiBhXG4gICAgICAgICAgICBsb2FkZXIgaW4gdGhlaXIgcmVxdWVzdCBhbmQgYXJlbid0IHBhcnQgb2YgdGhlIGN1cnJlbnQgbWFpbiBwYWNrYWdlXG4gICAgICAgICAgICBvciBoYXZlIGEgZmlsZSBleHRlbnNpb24gb3RoZXIgdGhhbiBqYXZhU2NyaXB0IGF3YXJlLlxuICAgICAgICAqL1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhaW5QbGFjZU5vcm1hbExpYnJhcnkgJiZcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLmZpbGUuZXh0ZXJuYWwubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgZmlsZVBhdGggJiZcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLmZpbGUuZXh0ZXJuYWwuaW5jbHVkZXMocGF0aC5leHRuYW1lKGZpbGVQYXRoKSkgfHxcbiAgICAgICAgICAgICAgICAhZmlsZVBhdGggJiZcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLmZpbGUuZXh0ZXJuYWwuaW5jbHVkZXMoJycpXG4gICAgICAgICAgICApICYmXG4gICAgICAgICAgICAhKGluUGxhY2VEeW5hbWljTGlicmFyeSAmJiByZXF1ZXN0LmluY2x1ZGVzKCchJykpICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgIWZpbGVQYXRoICYmXG4gICAgICAgICAgICAgICAgaW5QbGFjZUR5bmFtaWNMaWJyYXJ5IHx8XG4gICAgICAgICAgICAgICAgZmlsZVBhdGggJiZcbiAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICFmaWxlUGF0aC5zdGFydHNXaXRoKGNvbnRleHQpIHx8XG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCBleHRlcm5hbE1vZHVsZUxvY2F0aW9ucylcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlDb250ZXh0KFxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCxcbiAgICAgICAgICAgICAgICByZXF1ZXN0Q29udGV4dCxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLFxuICAgICAgICAgICAgICAgIGFsaWFzZXMsXG4gICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzLFxuICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zXG4gICAgICAgICAgICApXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYXNzZXQgdHlwZSBvZiBnaXZlbiBmaWxlLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBhbmFseXNlLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb24gLSBNZXRhIGluZm9ybWF0aW9ucyBmb3IgYXZhaWxhYmxlIGFzc2V0XG4gICAgICogdHlwZXMuXG4gICAgICogQHBhcmFtIHBhdGhzIC0gTGlzdCBvZiBwYXRocyB0byBzZWFyY2ggaWYgZ2l2ZW4gcGF0aCBkb2Vzbid0IHJlZmVyZW5jZVxuICAgICAqIGEgZmlsZSBkaXJlY3RseS5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIGZpbGUgdHlwZSBvciBcIm51bGxcIiBvZiBnaXZlbiBmaWxlIGNvdWxkbid0IGJlXG4gICAgICogZGV0ZXJtaW5lZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIGJ1aWxkQ29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sIHBhdGhzOlBhdGhcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBsZXQgcmVzdWx0Oj9zdHJpbmcgPSBudWxsXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gYnVpbGRDb25maWd1cmF0aW9uKVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHBhdGguZXh0bmFtZShmaWxlUGF0aCkgPT09XG4gICAgICAgICAgICAgICAgYC4ke2J1aWxkQ29uZmlndXJhdGlvblt0eXBlXS5leHRlbnNpb259YFxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHlwZVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIGlmICghcmVzdWx0KVxuICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ3NvdXJjZScsICd0YXJnZXQnXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0VHlwZTpzdHJpbmcgaW4gcGF0aHNbdHlwZV0uYXNzZXQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzW3R5cGVdLmFzc2V0Lmhhc093blByb3BlcnR5KGFzc2V0VHlwZSkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aC5zdGFydHNXaXRoKHBhdGhzW3R5cGVdLmFzc2V0W2Fzc2V0VHlwZV0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NldFR5cGVcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgcHJvcGVydHkgd2l0aCBhIHN0b3JlZCBhcnJheSBvZiBhbGwgbWF0Y2hpbmcgZmlsZSBwYXRocywgd2hpY2hcbiAgICAgKiBtYXRjaGVzIGVhY2ggYnVpbGQgY29uZmlndXJhdGlvbiBpbiBnaXZlbiBlbnRyeSBwYXRoIGFuZCBjb252ZXJ0cyBnaXZlblxuICAgICAqIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW50byBhIHNvcnRlZCBhcnJheSB3ZXJlIGphdmFTY3JpcHQgZmlsZXMgdGFrZXNcbiAgICAgKiBwcmVjZWRlbmNlLlxuICAgICAqIEBwYXJhbSBjb25maWd1cmF0aW9uIC0gR2l2ZW4gYnVpbGQgY29uZmlndXJhdGlvbnMuXG4gICAgICogQHBhcmFtIGVudHJ5UGF0aCAtIFBhdGggdG8gYW5hbHlzZSBuZXN0ZWQgc3RydWN0dXJlLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSBtYWluRmlsZUJhc2VuYW1lcyAtIEZpbGUgYmFzZW5hbWVzIHRvIHNvcnQgaW50byB0aGUgZnJvbnQuXG4gICAgICogQHJldHVybnMgQ29udmVydGVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb246QnVpbGRDb25maWd1cmF0aW9uLFxuICAgICAgICBlbnRyeVBhdGg6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIG1haW5GaWxlQmFzZW5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4JywgJ21haW4nXVxuICAgICk6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24ge1xuICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24gPSBbXVxuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW06UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtID1cbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kKHRydWUsIHtmaWxlUGF0aHM6IFtdfSwgY29uZmlndXJhdGlvblt0eXBlXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGU6RmlsZSBvZiBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKFxuICAgICAgICAgICAgICAgICAgICBlbnRyeVBhdGgsIChmaWxlOkZpbGUpOj9mYWxzZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuc3RhdHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuc3RhdHMuaXNGaWxlKCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguZXh0bmFtZShmaWxlLnBhdGgpLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgICAgICAgICApID09PSBuZXdJdGVtLmV4dGVuc2lvbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIShuZXcgUmVnRXhwKG5ld0l0ZW0uZmlsZVBhdGhQYXR0ZXJuKSkudGVzdChmaWxlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmlsZVBhdGhzLnB1c2goZmlsZS5wYXRoKVxuICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmlsZVBhdGhzLnNvcnQoKFxuICAgICAgICAgICAgICAgICAgICBmaXJzdEZpbGVQYXRoOnN0cmluZywgc2Vjb25kRmlsZVBhdGg6c3RyaW5nXG4gICAgICAgICAgICAgICAgKTpudW1iZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWFpbkZpbGVCYXNlbmFtZXMuaW5jbHVkZXMocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0RmlsZVBhdGgsIHBhdGguZXh0bmFtZShmaXJzdEZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICApKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5GaWxlQmFzZW5hbWVzLmluY2x1ZGVzKHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kRmlsZVBhdGgsIHBhdGguZXh0bmFtZShzZWNvbmRGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWFpbkZpbGVCYXNlbmFtZXMuaW5jbHVkZXMocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZEZpbGVQYXRoLCBwYXRoLmV4dG5hbWUoc2Vjb25kRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5wdXNoKG5ld0l0ZW0pXG4gICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWlsZENvbmZpZ3VyYXRpb24uc29ydCgoXG4gICAgICAgICAgICBmaXJzdDpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0sXG4gICAgICAgICAgICBzZWNvbmQ6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtXG4gICAgICAgICk6bnVtYmVyID0+IHtcbiAgICAgICAgICAgIGlmIChmaXJzdC5vdXRwdXRFeHRlbnNpb24gIT09IHNlY29uZC5vdXRwdXRFeHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3Qub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgICAgICBpZiAoc2Vjb25kLm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3Qub3V0cHV0RXh0ZW5zaW9uIDwgc2Vjb25kLm91dHB1dEV4dGVuc2lvbiA/IC0xIDogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfSlcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgZmlsZSBhbmQgZGlyZWN0b3J5IHBhdGhzIHJlbGF0ZWQgdG8gZ2l2ZW4gaW50ZXJuYWxcbiAgICAgKiBtb2R1bGVzIGFzIGFycmF5LlxuICAgICAqIEBwYXJhbSBlbnRyeUluamVjdGlvbiAtIExpc3Qgb2YgbW9kdWxlIGlkcyBvciBtb2R1bGUgZmlsZSBwYXRocy5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiBtb2R1bGUgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gc2VhcmNoIGZvciBsb2NhbCBtb2R1bGVzLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyAtIExpc3Qgb2YgcmVsYXRpdmUgZmlsZSBwYXRoIHRvIHNlYXJjaFxuICAgICAqIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlRW50cnlGaWxlTmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZW50cnkgZmlsZSBuYW1lcyB0b1xuICAgICAqIHNlYXJjaCBmb3IuIFRoZSBtYWdpYyBuYW1lIFwiX19wYWNrYWdlX19cIiB3aWxsIHNlYXJjaCBmb3IgYW4gYXBwcmVjaWF0ZVxuICAgICAqIGVudHJ5IGluIGEgXCJwYWNrYWdlLmpzb25cIiBmaWxlLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBtYWluIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHJlcHJlc2VudGluZyBlbnRyeSBtb2R1bGUgZGVmaW5pdGlvbnMuXG4gICAgICogQHBhcmFtIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBhbGlhcyBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSBzcGVjaWZpYyBtb2R1bGUgYWxpYXNlcy5cbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgLSBGaWxlIG5hbWUgZW5jb2RpbmcgdG8gdXNlIGR1cmluZyBmaWxlIHRyYXZlcnNpbmcuXG4gICAgICogQHJldHVybnMgT2JqZWN0IHdpdGggYSBmaWxlIHBhdGggYW5kIGRpcmVjdG9yeSBwYXRoIGtleSBtYXBwaW5nIHRvXG4gICAgICogY29ycmVzcG9uZGluZyBsaXN0IG9mIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgICAgIGVudHJ5SW5qZWN0aW9uOkVudHJ5SW5qZWN0aW9uLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBleHRlbnNpb25zOlBsYWluT2JqZWN0ID0ge1xuICAgICAgICAgICAgZmlsZTogW1xuICAgICAgICAgICAgICAgICdqcycsXG4gICAgICAgICAgICAgICAgJ2pzb24nLFxuICAgICAgICAgICAgICAgICdjc3MnLFxuICAgICAgICAgICAgICAgICdlb3QnLFxuICAgICAgICAgICAgICAgICdnaWYnLFxuICAgICAgICAgICAgICAgICdodG1sJyxcbiAgICAgICAgICAgICAgICAnaWNvJyxcbiAgICAgICAgICAgICAgICAnanBnJyxcbiAgICAgICAgICAgICAgICAncG5nJyxcbiAgICAgICAgICAgICAgICAnZWpzJyxcbiAgICAgICAgICAgICAgICAnc3ZnJyxcbiAgICAgICAgICAgICAgICAndHRmJyxcbiAgICAgICAgICAgICAgICAnd29mZicsICcud29mZjInXG4gICAgICAgICAgICBdLm1hcCgoc3VmZml4OnN0cmluZyk6c3RyaW5nID0+IGAuJHtzdWZmaXh9YCksXG4gICAgICAgICAgICBtb2R1bGU6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICdfX3BhY2thZ2VfXycsICcnLCAnaW5kZXgnLCAnbWFpbidcbiAgICAgICAgXSxcbiAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ21haW4nLCAnbW9kdWxlJ10sXG4gICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgICAgICBlbmNvZGluZzpzdHJpbmcgPSAndXRmLTgnXG4gICAgKTp7ZmlsZVBhdGhzOkFycmF5PHN0cmluZz47ZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPn0ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGhzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBub3JtYWxpemVkRW50cnlJbmplY3Rpb246Tm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uID1cbiAgICAgICAgICAgIEhlbHBlci5yZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgICAgICAgICBIZWxwZXIubm9ybWFsaXplRW50cnlJbmplY3Rpb24oZW50cnlJbmplY3Rpb24pLFxuICAgICAgICAgICAgICAgIGFsaWFzZXMsXG4gICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzLFxuICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICApXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkRW50cnlJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2Ygbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uW1xuICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aDpzdHJpbmcgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRpcmVjdG9yeVBhdGhzLmluY2x1ZGVzKGRpcmVjdG9yeVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeVBhdGhzLnB1c2goZGlyZWN0b3J5UGF0aClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtmaWxlUGF0aHMsIGRpcmVjdG9yeVBhdGhzfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgbGlzdCBvZiBjb25jcmV0ZSBmaWxlIHBhdGhzIGZvciBnaXZlbiBtb2R1bGUgaWQgcG9pbnRpbmcgdG9cbiAgICAgKiBhIGZvbGRlciB3aGljaCBpc24ndCBhIHBhY2thZ2UuXG4gICAgICogQHBhcmFtIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbiAtIEluamVjdGlvbiBkYXRhIHN0cnVjdHVyZSBvZiBtb2R1bGVzXG4gICAgICogd2l0aCBmb2xkZXIgcmVmZXJlbmNlcyB0byByZXNvbHZlLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIGRldGVybWluZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGluamVjdGlvbnMgd2l0aCByZXNvbHZlZCBmb2xkZXIgcG9pbnRpbmcgbW9kdWxlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZU1vZHVsZXNJbkZvbGRlcnMoXG4gICAgICAgIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbjpOb3JtYWxpemVkRW50cnlJbmplY3Rpb24sXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOk5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbiB7XG4gICAgICAgIGlmIChyZWZlcmVuY2VQYXRoLnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkRW50cnlJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkRW50cnlJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRFxuICAgICAgICAgICAgICAgICAgICAgICAgKSwgYWxpYXNlcyksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsIG1vZHVsZUlEKVxuICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKHJlc29sdmVkUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbltjaHVua05hbWVdLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTpGaWxlIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhyZXNvbHZlZFBhdGgsIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTpGaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTo/ZmFsc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlLnN0YXRzICYmIGZpbGUuc3RhdHMuaXNGaWxlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbltjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVkUGF0aCwgZmlsZS5wYXRoKSkpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRC5zdGFydHNXaXRoKCcuLycpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhbW9kdWxlSUQuc3RhcnRzV2l0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLi8ke3BhdGgucmVsYXRpdmUoY29udGV4dCwgcmVmZXJlbmNlUGF0aCl9YFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkRW50cnlJbmplY3Rpb25bY2h1bmtOYW1lXVtpbmRleF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAuLyR7cGF0aC5yZWxhdGl2ZShjb250ZXh0LCByZXNvbHZlZFBhdGgpfWBcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvblxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFdmVyeSBpbmplY3Rpb24gZGVmaW5pdGlvbiB0eXBlIGNhbiBiZSByZXByZXNlbnRlZCBhcyBwbGFpbiBvYmplY3RcbiAgICAgKiAobWFwcGluZyBmcm9tIGNodW5rIG5hbWUgdG8gYXJyYXkgb2YgbW9kdWxlIGlkcykuIFRoaXMgbWV0aG9kIGNvbnZlcnRzXG4gICAgICogZWFjaCByZXByZXNlbnRhdGlvbiBpbnRvIHRoZSBub3JtYWxpemVkIHBsYWluIG9iamVjdCBub3RhdGlvbi5cbiAgICAgKiBAcGFyYW0gZW50cnlJbmplY3Rpb24gLSBHaXZlbiBlbnRyeSBpbmplY3Rpb24gdG8gbm9ybWFsaXplLlxuICAgICAqIEByZXR1cm5zIE5vcm1hbGl6ZWQgcmVwcmVzZW50YXRpb24gb2YgZ2l2ZW4gZW50cnkgaW5qZWN0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVFbnRyeUluamVjdGlvbihcbiAgICAgICAgZW50cnlJbmplY3Rpb246RW50cnlJbmplY3Rpb25cbiAgICApOk5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbiB7XG4gICAgICAgIGxldCByZXN1bHQ6Tm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uID0ge31cbiAgICAgICAgaWYgKFRvb2xzLmlzRnVuY3Rpb24oZW50cnlJbmplY3Rpb24pKVxuICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICBlbnRyeUluamVjdGlvbiA9IGVudHJ5SW5qZWN0aW9uKClcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZW50cnlJbmplY3Rpb24pKVxuICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBlbnRyeUluamVjdGlvbn1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGVudHJ5SW5qZWN0aW9uID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogW2VudHJ5SW5qZWN0aW9uXX1cbiAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNQbGFpbk9iamVjdChlbnRyeUluamVjdGlvbikpIHtcbiAgICAgICAgICAgIGxldCBoYXNDb250ZW50OmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICAgICAgY29uc3QgY2h1bmtOYW1lc1RvRGVsZXRlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGVudHJ5SW5qZWN0aW9uKVxuICAgICAgICAgICAgICAgIGlmIChlbnRyeUluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbnRyeUluamVjdGlvbltjaHVua05hbWVdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeUluamVjdGlvbltjaHVua05hbWVdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjaHVua05hbWVdID0gZW50cnlJbmplY3Rpb25bY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lc1RvRGVsZXRlLnB1c2goY2h1bmtOYW1lKVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2h1bmtOYW1lXSA9IFtlbnRyeUluamVjdGlvbltjaHVua05hbWVdXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGFzQ29udGVudClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgb2YgY2h1bmtOYW1lc1RvRGVsZXRlKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcmVzdWx0W2NodW5rTmFtZV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IFtdfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgY29uY3JldGUgZmlsZSBwYXRocyBmb3IgZ2l2ZW4gaW5qZWN0aW9uIHdoaWNoIGFyZSBtYXJrZWRcbiAgICAgKiB3aXRoIHRoZSBcIl9fYXV0b19fXCIgaW5kaWNhdG9yLlxuICAgICAqIEBwYXJhbSBnaXZlbkluamVjdGlvbiAtIEdpdmVuIGVudHJ5IGFuZCBleHRlcm5hbCBpbmplY3Rpb24gdG8gdGFrZVxuICAgICAqIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9ucyAtIFJlc29sdmVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIG1vZHVsZXNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyB0byBleGNsdWRlIChzcGVjaWZpZWQgYnlcbiAgICAgKiBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0byBtb2R1bGUgaWRzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFJlZmVyZW5jZSBwYXRoIGZyb20gd2hlcmUgbG9jYWwgZmlsZXMgc2hvdWxkIGJlXG4gICAgICogcmVzb2x2ZWQuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9uIHdpdGggcmVzb2x2ZWQgbWFya2VkIGluZGljYXRvcnMuXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVJbmplY3Rpb24oXG4gICAgICAgIGdpdmVuSW5qZWN0aW9uOkluamVjdGlvbixcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlc1RvRXhjbHVkZTpFbnRyeUluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJ2NvbXBpbGVkLmpzJywgJy5qcycsICcuanNvbiddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBbXG4gICAgICAgICAgICAgICAgICAgICdqcycsXG4gICAgICAgICAgICAgICAgICAgICdqc29uJyxcbiAgICAgICAgICAgICAgICAgICAgJ2NzcycsXG4gICAgICAgICAgICAgICAgICAgICdlb3QnLFxuICAgICAgICAgICAgICAgICAgICAnZ2lmJyxcbiAgICAgICAgICAgICAgICAgICAgJ2h0bWwnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvJyxcbiAgICAgICAgICAgICAgICAgICAgJ2pwZycsXG4gICAgICAgICAgICAgICAgICAgICdwbmcnLFxuICAgICAgICAgICAgICAgICAgICAnZWpzJyxcbiAgICAgICAgICAgICAgICAgICAgJ3N2ZycsXG4gICAgICAgICAgICAgICAgICAgICd0dGYnLFxuICAgICAgICAgICAgICAgICAgICAnd29mZicsICcud29mZjInXG4gICAgICAgICAgICAgICAgXS5tYXAoKHN1ZmZpeDpzdHJpbmcpOnN0cmluZyA9PiBgLiR7c3VmZml4fWApXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbW9kdWxlOiBbXVxuICAgICAgICB9LFxuICAgICAgICBjb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddXG4gICAgKTpJbmplY3Rpb24ge1xuICAgICAgICBjb25zdCBpbmplY3Rpb246SW5qZWN0aW9uID0gVG9vbHMuZXh0ZW5kKHRydWUsIHt9LCBnaXZlbkluamVjdGlvbilcbiAgICAgICAgY29uc3QgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgICAgICAgICBtb2R1bGVzVG9FeGNsdWRlLFxuICAgICAgICAgICAgICAgIGFsaWFzZXMsXG4gICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzLFxuICAgICAgICAgICAgICAgIHtmaWxlOiBleHRlbnNpb25zLmZpbGUuaW50ZXJuYWwsIG1vZHVsZTogZXh0ZW5zaW9ucy5tb2R1bGV9LFxuICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICApLmZpbGVQYXRoc1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnZW50cnknLCAnZXh0ZXJuYWwnXSlcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGN1cmx5ICovXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluamVjdGlvblt0eXBlXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gaW5qZWN0aW9uW3R5cGVdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0gPT09ICdfX2F1dG9fXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZXM6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtrZXk6c3RyaW5nXTpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViQ2h1bmtOYW1lOnN0cmluZyBpbiBtb2R1bGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGVzLmhhc093blByb3BlcnR5KHN1YkNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzW3N1YkNodW5rTmFtZV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldmVyc2UgYXJyYXkgdG8gbGV0IGphdmFTY3JpcHQgYW5kIG1haW4gZmlsZXMgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgbGFzdCBvbmVzIHRvIGV4cG9ydCB0aGVtIHJhdGhlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXS5yZXZlcnNlKClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmplY3Rpb25bdHlwZV0gPT09ICdfX2F1dG9fXycpXG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGN1cmx5ICovXG4gICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9ucywgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLCBjb250ZXh0KVxuICAgICAgICByZXR1cm4gaW5qZWN0aW9uXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgZmlsZSBwYXRocyB0b1xuICAgICAqIGV4Y2x1ZGUgKHNwZWNpZmllZCBieSBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0b1xuICAgICAqIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEByZXR1cm5zIEFsbCBkZXRlcm1pbmVkIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRBdXRvQ2h1bmsoXG4gICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZTpBcnJheTxzdHJpbmc+LFxuICAgICAgICBjb250ZXh0OnN0cmluZ1xuICAgICk6e1trZXk6c3RyaW5nXTpzdHJpbmd9IHtcbiAgICAgICAgY29uc3QgcmVzdWx0Ontba2V5OnN0cmluZ106c3RyaW5nfSA9IHt9XG4gICAgICAgIGNvbnN0IGluamVjdGVkTW9kdWxlSURzOntba2V5OnN0cmluZ106QXJyYXk8c3RyaW5nPn0gPSB7fVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSBvZlxuICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uc1xuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmICghaW5qZWN0ZWRNb2R1bGVJRHNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0pXG4gICAgICAgICAgICAgICAgaW5qZWN0ZWRNb2R1bGVJRHNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0gPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVGaWxlUGF0aDpzdHJpbmcgb2YgYnVpbGRDb25maWd1cmF0aW9uLmZpbGVQYXRocylcbiAgICAgICAgICAgICAgICBpZiAoIW1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZS5pbmNsdWRlcyhtb2R1bGVGaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aDpzdHJpbmcgPSAnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoOnN0cmluZyA9IHBhdGguZGlybmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VOYW1lOnN0cmluZyA9IHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYC4ke2J1aWxkQ29uZmlndXJhdGlvbi5leHRlbnNpb259YClcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZHVsZUlEOnN0cmluZyA9IGJhc2VOYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3RvcnlQYXRoICE9PSAnLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IHBhdGguam9pbihkaXJlY3RvcnlQYXRoLCBiYXNlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IGVhY2ggb3V0cHV0IHR5cGUgaGFzIG9ubHkgb25lIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5qZWN0ZWRNb2R1bGVJRHNbXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgIF0uaW5jbHVkZXMobW9kdWxlSUQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IHNhbWUgbW9kdWxlIGlkcyBhbmQgZGlmZmVyZW50IG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVzIGNhbiBiZSBkaXN0aW5ndWlzaGVkIGJ5IHRoZWlyIGV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChKYXZhU2NyaXB0LU1vZHVsZXMgcmVtYWlucyB3aXRob3V0IGV4dGVuc2lvbiBzaW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZXkgd2lsbCBiZSBoYW5kbGVkIGZpcnN0IGJlY2F1c2UgdGhlIGJ1aWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgYXJlIGV4cGVjdGVkIHRvIGJlIHNvcnRlZCBpbiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCkuXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShtb2R1bGVJRCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3JlbGF0aXZlTW9kdWxlRmlsZVBhdGhdID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFttb2R1bGVJRF0gPSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RlZE1vZHVsZUlEc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBdLnB1c2gobW9kdWxlSUQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byBkZXRlcm1pbmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUVudHJ5RmlsZU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGVudHJ5IGZpbGUgbmFtZXMgdG9cbiAgICAgKiBzZWFyY2ggZm9yLiBUaGUgbWFnaWMgbmFtZSBcIl9fcGFja2FnZV9fXCIgd2lsbCBzZWFyY2ggZm9yIGFuIGFwcHJlY2lhdGVcbiAgICAgKiBlbnRyeSBpbiBhIFwicGFja2FnZS5qc29uXCIgZmlsZS5cbiAgICAgKiBAcGFyYW0gcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgbWFpbiBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSByZXByZXNlbnRpbmcgZW50cnkgbW9kdWxlIGRlZmluaXRpb25zLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgYWxpYXMgcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2Ugc3BlY2lmaWMgbW9kdWxlIGFsaWFzZXMuXG4gICAgICogQHBhcmFtIGVuY29kaW5nIC0gRW5jb2RpbmcgdG8gdXNlIGZvciBmaWxlIG5hbWVzIGR1cmluZyBmaWxlIHRyYXZlcnNpbmcuXG4gICAgICogQHJldHVybnMgRmlsZSBwYXRoIG9yIGdpdmVuIG1vZHVsZSBpZCBpZiBkZXRlcm1pbmF0aW9ucyBoYXMgZmFpbGVkIG9yXG4gICAgICogd2Fzbid0IG5lY2Vzc2FyeS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgIG1vZHVsZUlEOnN0cmluZyxcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczpQbGFpbk9iamVjdCA9IHtcbiAgICAgICAgICAgIGZpbGU6IFtcbiAgICAgICAgICAgICAgICAnanMnLFxuICAgICAgICAgICAgICAgICdqc29uJyxcbiAgICAgICAgICAgICAgICAnY3NzJyxcbiAgICAgICAgICAgICAgICAnZW90JyxcbiAgICAgICAgICAgICAgICAnZ2lmJyxcbiAgICAgICAgICAgICAgICAnaHRtbCcsXG4gICAgICAgICAgICAgICAgJ2ljbycsXG4gICAgICAgICAgICAgICAgJ2pwZycsXG4gICAgICAgICAgICAgICAgJ3BuZycsXG4gICAgICAgICAgICAgICAgJ2VqcycsXG4gICAgICAgICAgICAgICAgJ3N2ZycsXG4gICAgICAgICAgICAgICAgJ3R0ZicsXG4gICAgICAgICAgICAgICAgJ3dvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgXS5tYXAoKHN1ZmZpeDpzdHJpbmcpOnN0cmluZyA9PiBgLiR7c3VmZml4fWApLFxuICAgICAgICAgICAgbW9kdWxlOiBbXVxuICAgICAgICB9LFxuICAgICAgICBjb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9uczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4J10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJ10sXG4gICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtdLFxuICAgICAgICBlbmNvZGluZzpzdHJpbmcgPSAndXRmLTgnXG4gICAgKTo/c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKEhlbHBlci5zdHJpcExvYWRlcihtb2R1bGVJRCksIGFsaWFzZXMpLFxuICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICBpZiAoIW1vZHVsZUlEKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgbGV0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyA9IG1vZHVsZUlEXG4gICAgICAgIGlmIChtb2R1bGVGaWxlUGF0aC5zdGFydHNXaXRoKCcuLycpKVxuICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGggPSBwYXRoLmpvaW4ocmVmZXJlbmNlUGF0aCwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgIGNvbnN0IG1vZHVsZUxvY2F0aW9ucyA9IFtyZWZlcmVuY2VQYXRoXS5jb25jYXQoXG4gICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucy5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQsIGZpbGVQYXRoKSlcbiAgICAgICAgKVxuICAgICAgICBjb25zdCBwYXJ0cyA9IGNvbnRleHQuc3BsaXQoJy8nKVxuICAgICAgICBwYXJ0cy5zcGxpY2UoLTEsIDEpXG4gICAgICAgIHdoaWxlIChwYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlbGF0aXZlUGF0aDpzdHJpbmcgb2YgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnMpXG4gICAgICAgICAgICAgICAgbW9kdWxlTG9jYXRpb25zLnB1c2gocGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAnLycsIHBhcnRzLmpvaW4oJy8nKSwgcmVsYXRpdmVQYXRoKSlcbiAgICAgICAgICAgIHBhcnRzLnNwbGljZSgtMSwgMSlcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUxvY2F0aW9uOnN0cmluZyBvZiBbcmVmZXJlbmNlUGF0aF0uY29uY2F0KFxuICAgICAgICAgICAgbW9kdWxlTG9jYXRpb25zXG4gICAgICAgICkpXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlTmFtZTpzdHJpbmcgb2YgWycnLCAnX19wYWNrYWdlX18nXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzXG4gICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZUV4dGVuc2lvbjpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5tb2R1bGUuY29uY2F0KFsnJ10pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVFeHRlbnNpb246c3RyaW5nIG9mIFsnJ10uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5maWxlXG4gICAgICAgICAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50TW9kdWxlRmlsZVBhdGg6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlRmlsZVBhdGguc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVMb2NhdGlvbiwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFja2FnZUFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhjdXJyZW50TW9kdWxlRmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhUb1BhY2thZ2VKU09OOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCwgJ3BhY2thZ2UuanNvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKHBhdGhUb1BhY2thZ2VKU09OKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvY2FsQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFRvUGFja2FnZUpTT04sIHtlbmNvZGluZ30pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5TmFtZTpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uW3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWU6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdID09PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlQWxpYXNlcyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgPT09ICdfX3BhY2thZ2VfXycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKGZpbGVOYW1lLCBwYWNrYWdlQWxpYXNlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtmaWxlTmFtZX0ke21vZHVsZUV4dGVuc2lvbn0ke2ZpbGVFeHRlbnNpb259YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggKz1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZmlsZU5hbWV9JHttb2R1bGVFeHRlbnNpb259JHtmaWxlRXh0ZW5zaW9ufWBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhjdXJyZW50TW9kdWxlRmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50TW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBUaGUgYWxpYXMgYXBwbGllZCBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5QWxpYXNlcyhtb2R1bGVJRDpzdHJpbmcsIGFsaWFzZXM6UGxhaW5PYmplY3QpOnN0cmluZyB7XG4gICAgICAgIGZvciAoY29uc3QgYWxpYXM6c3RyaW5nIGluIGFsaWFzZXMpXG4gICAgICAgICAgICBpZiAoYWxpYXMuZW5kc1dpdGgoJyQnKSkge1xuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVJRCA9PT0gYWxpYXMuc3Vic3RyaW5nKDAsIGFsaWFzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IGFsaWFzZXNbYWxpYXNdXG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoYWxpYXMsIGFsaWFzZXNbYWxpYXNdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIHJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVndWxhciBleHByZXNzaW9ucyB0byB0aGVpclxuICAgICAqIGNvcnJlc3BvbmRpbmcgcmVwbGFjZW1lbnRzLlxuICAgICAqIEByZXR1cm5zIFRoZSByZXBsYWNlbWVudCBhcHBsaWVkIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgIG1vZHVsZUlEOnN0cmluZywgcmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0XG4gICAgKTpzdHJpbmcge1xuICAgICAgICBmb3IgKGNvbnN0IHJlcGxhY2VtZW50OnN0cmluZyBpbiByZXBsYWNlbWVudHMpXG4gICAgICAgICAgICBpZiAocmVwbGFjZW1lbnRzLmhhc093blByb3BlcnR5KHJlcGxhY2VtZW50KSlcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAocmVwbGFjZW1lbnQpLCByZXBsYWNlbWVudHNbcmVwbGFjZW1lbnRdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgbmVhcmVzdCBwYWNrYWdlIGNvbmZpZ3VyYXRpb24gZmlsZSBmcm9tIGdpdmVuIGZpbGUgcGF0aC5cbiAgICAgKiBAcGFyYW0gc3RhcnQgLSBSZWZlcmVuY2UgbG9jYXRpb24gdG8gc2VhcmNoIGZyb20uXG4gICAgICogQHBhcmFtIGZpbGVOYW1lIC0gUGFja2FnZSBjb25maWd1cmF0aW9uIGZpbGUgbmFtZS5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIGZpbGUgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZmluZFBhY2thZ2VEZXNjcmlwdG9yRmlsZVBhdGgoXG4gICAgICAgIHN0YXJ0OkFycmF5PHN0cmluZz58c3RyaW5nLCBmaWxlTmFtZTpzdHJpbmcgPSAncGFja2FnZS5qc29uJ1xuICAgICk6bnVsbHxzdHJpbmcge1xuICAgICAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKHN0YXJ0W3N0YXJ0Lmxlbmd0aCAtIDFdICE9PSBwYXRoLnNlcClcbiAgICAgICAgICAgICAgICBzdGFydCArPSBwYXRoLnNlcFxuICAgICAgICAgICAgc3RhcnQgPSBzdGFydC5zcGxpdChwYXRoLnNlcClcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXN0YXJ0Lmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIHN0YXJ0LnBvcCgpXG4gICAgICAgIGNvbnN0IHJlc3VsdDpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBzdGFydC5qb2luKHBhdGguc2VwKSwgZmlsZU5hbWUpXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5leGlzdHNTeW5jKHJlc3VsdCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgcmV0dXJuIEhlbHBlci5maW5kUGFja2FnZURlc2NyaXB0b3JGaWxlUGF0aChzdGFydCwgZmlsZU5hbWUpXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgdGhlIG5lYXJlc3QgcGFja2FnZSBjb25maWd1cmF0aW9uIGZyb20gZ2l2ZW4gbW9kdWxlIGZpbGVcbiAgICAgKiBwYXRoLlxuICAgICAqIEBwYXJhbSBtb2R1bGVQYXRoIC0gTW9kdWxlIHBhdGggdG8gdGFrZSBhcyByZWZlcmVuY2UgbG9jYXRpb24gKGxlYWYgaW5cbiAgICAgKiB0cmVlKS5cbiAgICAgKiBAcGFyYW0gZmlsZU5hbWUgLSBQYWNrYWdlIGNvbmZpZ3VyYXRpb24gZmlsZSBuYW1lLlxuICAgICAqIEByZXR1cm5zIEEgb2JqZWN0IGNvbnRhaW5pbmcgZm91bmQgcGFyc2VkIGNvbmZpZ3VyYXRpb24gYW4gdGhlaXJcbiAgICAgKiBjb3JyZXNwb25kaW5nIGZpbGUgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0Q2xvc2VzdFBhY2thZ2VEZXNjcmlwdG9yKFxuICAgICAgICBtb2R1bGVQYXRoOnN0cmluZywgZmlsZU5hbWU6c3RyaW5nID0gJ3BhY2thZ2UuanNvbidcbiAgICApOm51bGx8UGxhaW5PYmplY3Qge1xuICAgICAgICBjb25zdCBmaWxlUGF0aDpudWxsfHN0cmluZyA9IEhlbHBlci5maW5kUGFja2FnZURlc2NyaXB0b3JGaWxlUGF0aChcbiAgICAgICAgICAgIG1vZHVsZVBhdGgsIGZpbGVOYW1lKVxuICAgICAgICBpZiAoIWZpbGVQYXRoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgY29uc3QgY29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IGV2YWwoJ3JlcXVpcmUnKShmaWxlUGF0aClcbiAgICAgICAgLypcbiAgICAgICAgICAgIElmIHRoZSBwYWNrYWdlLmpzb24gZG9lcyBub3QgaGF2ZSBhIG5hbWUgcHJvcGVydHksIHRyeSBhZ2FpbiBmcm9tXG4gICAgICAgICAgICBvbmUgbGV2ZWwgaGlnaGVyLlxuICAgICAgICAqL1xuICAgICAgICBpZiAoIWNvbmZpZ3VyYXRpb24ubmFtZSlcbiAgICAgICAgICAgIHJldHVybiBIZWxwZXIuZ2V0Q2xvc2VzdFBhY2thZ2VEZXNjcmlwdG9yKFxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCAnLi4nKSwgZmlsZU5hbWUpXG4gICAgICAgIHJldHVybiB7Y29uZmlndXJhdGlvbiwgZmlsZVBhdGh9XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgSGVscGVyXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19