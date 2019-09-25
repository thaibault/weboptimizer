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
     * @param filePathTemplate - File path to process placeholder in.
     * @param informations - Scope to use for processing.
     * @returns Processed file path.
     */

  }, {
    key: "renderFilePathTemplate",
    value: function renderFilePathTemplate(filePathTemplate) {
      var informations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        '[hash]': '.__dummy__',
        '[id]': '.__dummy__',
        '[name]': '.__dummy__'
      };
      var filePath = filePathTemplate;

      for (var placeholderName in informations) {
        if (informations.hasOwnProperty(placeholderName)) filePath = filePath.replace(new RegExp(_clientnode["default"].stringEscapeRegularExpressions(placeholderName), 'g'), informations[placeholderName]);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TixDQUFXLGtCQUFLLEdBQWhCLENBRGtCLEVBQ0ksUUFESixDQUF0Qjs7QUFFQSxVQUFJO0FBQ0EsWUFBSSxlQUFXLFVBQVgsQ0FBc0IsTUFBdEIsQ0FBSixFQUNJLE9BQU8sTUFBUDtBQUNQLE9BSEQsQ0FHRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUNsQixhQUFPLE1BQU0sQ0FBQyw2QkFBUCxDQUFxQyxLQUFyQyxFQUE0QyxRQUE1QyxDQUFQO0FBQ0g7QUFDRDs7Ozs7Ozs7Ozs7O2dEQVVJLFUsRUFDZTtBQUFBLFVBREksUUFDSix1RUFEc0IsY0FDdEI7QUFDZixVQUFNLFFBQW9CLEdBQUcsTUFBTSxDQUFDLDZCQUFQLENBQ3pCLFVBRHlCLEVBQ2IsUUFEYSxDQUE3QjtBQUVBLFVBQUksQ0FBQyxRQUFMLEVBQ0ksT0FBTyxJQUFQO0FBQ0osVUFBTSxhQUF5QixHQUFHLElBQUksQ0FBQyxTQUFELENBQUosQ0FBZ0IsUUFBaEIsQ0FBbEM7QUFDQTs7Ozs7QUFJQSxVQUFJLENBQUMsYUFBYSxDQUFDLElBQW5CLEVBQ0ksT0FBTyxNQUFNLENBQUMsMkJBQVAsQ0FDSCxrQkFBSyxPQUFMLENBQWEsa0JBQUssT0FBTCxDQUFhLFFBQWIsQ0FBYixFQUFxQyxJQUFyQyxDQURHLEVBQ3lDLFFBRHpDLENBQVA7QUFFSixhQUFPO0FBQUMsUUFBQSxhQUFhLEVBQWIsYUFBRDtBQUFnQixRQUFBLFFBQVEsRUFBUjtBQUFoQixPQUFQO0FBQ0g7Ozs7OztlQUVVLE0sRUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImhlbHBlci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnNcbiAgICBuYW1pbmcgMy4wIHVucG9ydGVkIGxpY2Vuc2UuXG4gICAgU2VlIGh0dHBzOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgdHlwZSB7RG9tTm9kZX0gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHR5cGUge0ZpbGUsIFBsYWluT2JqZWN0LCBXaW5kb3d9IGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQge0pTRE9NIGFzIERPTX0gZnJvbSAnanNkb20nXG5pbXBvcnQgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCB0eXBlIHtcbiAgICBCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgRXh0ZW5zaW9ucyxcbiAgICBJbmplY3Rpb24sXG4gICAgRW50cnlJbmplY3Rpb24sXG4gICAgTm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uLFxuICAgIFBhdGgsXG4gICAgUmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgUmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtXG59IGZyb20gJy4vdHlwZSdcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIG1ldGhvZHNcbi8qKlxuICogUHJvdmlkZXMgYSBjbGFzcyBvZiBzdGF0aWMgbWV0aG9kcyB3aXRoIGdlbmVyaWMgdXNlIGNhc2VzLlxuICovXG5leHBvcnQgY2xhc3MgSGVscGVyIHtcbiAgICAvLyByZWdpb24gYm9vbGVhblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIGdpdmVuIGxpc3Qgb2YgZmlsZVxuICAgICAqIGxvY2F0aW9ucy5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gY2hlY2suXG4gICAgICogQHBhcmFtIGxvY2F0aW9uc1RvQ2hlY2sgLSBMb2NhdGlvbnMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHJldHVybnMgVmFsdWUgXCJ0cnVlXCIgaWYgZ2l2ZW4gZmlsZSBwYXRoIGlzIHdpdGhpbiBvbmUgb2YgZ2l2ZW5cbiAgICAgKiBsb2NhdGlvbnMgb3IgXCJmYWxzZVwiIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgIGZpbGVQYXRoOnN0cmluZywgbG9jYXRpb25zVG9DaGVjazpBcnJheTxzdHJpbmc+XG4gICAgKTpib29sZWFuIHtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoVG9DaGVjazpzdHJpbmcgb2YgbG9jYXRpb25zVG9DaGVjaylcbiAgICAgICAgICAgIGlmIChwYXRoLnJlc29sdmUoZmlsZVBhdGgpLnN0YXJ0c1dpdGgocGF0aC5yZXNvbHZlKHBhdGhUb0NoZWNrKSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBzdHJpbmdcbiAgICAvKipcbiAgICAgKiBJbiBwbGFjZXMgZWFjaCBtYXRjaGluZyBjYXNjYWRpbmcgc3R5bGUgc2hlZXQgb3IgamF2YVNjcmlwdCBmaWxlXG4gICAgICogcmVmZXJlbmNlLlxuICAgICAqIEBwYXJhbSBjb250ZW50IC0gTWFya3VwIGNvbnRlbnQgdG8gcHJvY2Vzcy5cbiAgICAgKiBAcGFyYW0gY2FzY2FkaW5nU3R5bGVTaGVldFBhdHRlcm4gLSBQYXR0ZXJuIHRvIG1hdGNoIGNhc2NhZGluZyBzdHlsZVxuICAgICAqIHNoZWV0IGFzc2V0IHJlZmVyZW5jZXMgYWdhaW4uXG4gICAgICogQHBhcmFtIGphdmFTY3JpcHRQYXR0ZXJuIC0gUGF0dGVybiB0byBtYXRjaCBqYXZhU2NyaXB0IGFzc2V0IHJlZmVyZW5jZXNcbiAgICAgKiBhZ2Fpbi5cbiAgICAgKiBAcGFyYW0gYmFzZVBhdGggLSBCYXNlIHBhdGggdG8gdXNlIGFzIHByZWZpeCBmb3IgZmlsZSByZWZlcmVuY2VzLlxuICAgICAqIEBwYXJhbSBjYXNjYWRpbmdTdHlsZVNoZWV0Q2h1bmtOYW1lVGVtcGxhdGUgLSBDYXNjYWRpbmcgc3R5bGUgc2hlZXRcbiAgICAgKiBjaHVuayBuYW1lIHRlbXBsYXRlIHRvIHVzZSBmb3IgYXNzZXQgbWF0Y2hpbmcuXG4gICAgICogQHBhcmFtIGphdmFTY3JpcHRDaHVua05hbWVUZW1wbGF0ZSAtIEphdmFTY3JpcHQgY2h1bmsgbmFtZSB0ZW1wbGF0ZSB0b1xuICAgICAqIHVzZSBmb3IgYXNzZXQgbWF0Y2hpbmcuXG4gICAgICogQHBhcmFtIGFzc2V0cyAtIE1hcHBpbmcgb2YgYXNzZXQgZmlsZSBwYXRocyB0byB0aGVpciBjb250ZW50LlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGFuIHRyYW5zZm9ybWVkIG1hcmt1cC5cbiAgICAgKi9cbiAgICBzdGF0aWMgaW5QbGFjZUNTU0FuZEphdmFTY3JpcHRBc3NldFJlZmVyZW5jZXMoXG4gICAgICAgIGNvbnRlbnQ6c3RyaW5nLFxuICAgICAgICBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybjo/e1trZXk6c3RyaW5nXTonYm9keSd8J2hlYWQnfCdpbid8c3RyaW5nfSxcbiAgICAgICAgamF2YVNjcmlwdFBhdHRlcm46P3tba2V5OnN0cmluZ106J2JvZHknfCdoZWFkJ3wnaW4nfHN0cmluZ30sXG4gICAgICAgIGJhc2VQYXRoOnN0cmluZyxcbiAgICAgICAgY2FzY2FkaW5nU3R5bGVTaGVldENodW5rTmFtZVRlbXBsYXRlOnN0cmluZyxcbiAgICAgICAgamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlOnN0cmluZyxcbiAgICAgICAgYXNzZXRzOntba2V5OnN0cmluZ106T2JqZWN0fVxuICAgICk6e1xuICAgICAgICBjb250ZW50OnN0cmluZztcbiAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPjtcbiAgICB9IHtcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gcHJldmVudCBjcmVhdGluZyBuYXRpdmUgXCJzdHlsZVwiIGRvbSBub2RlcyB0b1xuICAgICAgICAgICAgcHJldmVudCBqc2RvbSBmcm9tIHBhcnNpbmcgdGhlIGVudGlyZSBjYXNjYWRpbmcgc3R5bGUgc2hlZXQuIFdoaWNoXG4gICAgICAgICAgICBpcyBlcnJvciBwcnVuZSBhbmQgdmVyeSByZXNvdXJjZSBpbnRlbnNpdmUuXG4gICAgICAgICovXG4gICAgICAgIGNvbnN0IHN0eWxlQ29udGVudHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoXG4gICAgICAgICAgICAvKDxzdHlsZVtePl0qPikoW1xcc1xcU10qPykoPFxcL3N0eWxlW14+XSo+KS9naSwgKFxuICAgICAgICAgICAgICAgIG1hdGNoOnN0cmluZyxcbiAgICAgICAgICAgICAgICBzdGFydFRhZzpzdHJpbmcsXG4gICAgICAgICAgICAgICAgY29udGVudDpzdHJpbmcsXG4gICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgIHN0eWxlQ29udGVudHMucHVzaChjb250ZW50KVxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtzdGFydFRhZ30ke2VuZFRhZ31gXG4gICAgICAgICAgICB9KVxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byB0cmFuc2xhdGUgdGVtcGxhdGUgZGVsaW1pdGVyIHRvIGh0bWwgY29tcGF0aWJsZVxuICAgICAgICAgICAgc2VxdWVuY2VzIGFuZCB0cmFuc2xhdGUgaXQgYmFjayBsYXRlciB0byBhdm9pZCB1bmV4cGVjdGVkIGVzY2FwZVxuICAgICAgICAgICAgc2VxdWVuY2VzIGluIHJlc3VsdGluZyBodG1sLlxuICAgICAgICAqL1xuICAgICAgICBjb25zdCB3aW5kb3c6V2luZG93ID0gKG5ldyBET00oXG4gICAgICAgICAgICBjb250ZW50XG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwlL2csICcjIysjKyMrIyMnKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8lPi9nLCAnIyMtIy0jLSMjJylcbiAgICAgICAgKSkud2luZG93XG4gICAgICAgIGNvbnN0IGluUGxhY2VTdHlsZUNvbnRlbnRzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgZm9yIChjb25zdCBhc3NldFR5cGU6UGxhaW5PYmplY3Qgb2YgW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWU6ICdocmVmJyxcbiAgICAgICAgICAgICAgICBoYXNoOiAnaGFzaCcsXG4gICAgICAgICAgICAgICAgbGlua1RhZ05hbWU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybixcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogJ1tocmVmKj1cIi5jc3NcIl0nLFxuICAgICAgICAgICAgICAgIHRhZ05hbWU6ICdzdHlsZScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVOYW1lOiAnc3JjJyxcbiAgICAgICAgICAgICAgICBoYXNoOiAnaGFzaCcsXG4gICAgICAgICAgICAgICAgbGlua1RhZ05hbWU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgICAgIHBhdHRlcm46IGphdmFTY3JpcHRQYXR0ZXJuLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiAnW2hyZWYqPVwiLmpzXCJdJyxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIF0pXG4gICAgICAgICAgICBpZiAoYXNzZXRUeXBlLnBhdHRlcm4pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuOnN0cmluZyBpbiBhc3NldFR5cGUucGF0dGVybikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2V0VHlwZS5wYXR0ZXJuLmhhc093blByb3BlcnR5KHBhdHRlcm4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yOnN0cmluZyA9IGFzc2V0VHlwZS5zZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICBpZiAocGF0dGVybiAhPT0gJyonKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7YXNzZXRUeXBlLmF0dHJpYnV0ZU5hbWV9Xj1cImAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoLCBIZWxwZXIucmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZS50ZW1wbGF0ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtgWyR7YXNzZXRUeXBlLmhhc2h9XWBdOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW2lkXSc6IHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tuYW1lXSc6IHBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkgKyAnXCJdJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21Ob2RlczpBcnJheTxEb21Ob2RlPiA9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHthc3NldFR5cGUubGlua1RhZ05hbWV9JHtzZWxlY3Rvcn1gKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tTm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBkb21Ob2RlOkRvbU5vZGUgb2YgZG9tTm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoOnN0cmluZyA9IGRvbU5vZGUuYXR0cmlidXRlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlLmF0dHJpYnV0ZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLnZhbHVlLnJlcGxhY2UoLyYuKi9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2V0cy5oYXNPd25Qcm9wZXJ0eShwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpblBsYWNlRG9tTm9kZTpEb21Ob2RlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUudGFnTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXRUeXBlLnRhZ05hbWUgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3dlYm9wdGltaXplcmlucGxhY2UnLCAndHJ1ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VTdHlsZUNvbnRlbnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldHNbcGF0aF0uc291cmNlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLnRleHRDb250ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0c1twYXRoXS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhc3NldFR5cGUucGF0dGVybltwYXR0ZXJuXSA9PT0gJ2JvZHknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFzc2V0VHlwZS5wYXR0ZXJuW3BhdHRlcm5dID09PSAnaW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl0gPT09ICdoZWFkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVndWxhckV4cHJlc3Npb25QYXR0ZXJuOnN0cmluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnKGFmdGVyfGJlZm9yZXxpbik6KC4rKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVzdE1hdGNoOj9BcnJheTxzdHJpbmc+ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAocmVndWxhckV4cHJlc3Npb25QYXR0ZXJuKS5leGVjKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZS5wYXR0ZXJuW3BhdHRlcm5dKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2g6QXJyYXk8c3RyaW5nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGVzdE1hdGNoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSB0ZXN0TWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdHaXZlbiBpbiBwbGFjZSBzcGVjaWZpY2F0aW9uIFwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7YXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl19XCIgZm9yIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS50YWdOYW1lfSBkb2VzIG5vdCBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2F0aXNmeSB0aGUgc3BlY2lmaWVkIHBhdHRlcm4gXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtyZWd1bGFyRXhwcmVzc2lvblBhdHRlcm59XCIuYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21Ob2RlOkRvbU5vZGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IobWF0Y2hbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgU3BlY2lmaWVkIGRvbSBub2RlIFwiJHttYXRjaFsyXX1cIiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY291bGQgbm90IGJlIGZvdW5kIHRvIGluIHBsYWNlIFwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7cGF0dGVybn1cIi5gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2hbMV0gPT09ICdpbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLmFwcGVuZENoaWxkKGluUGxhY2VEb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChtYXRjaFsxXSA9PT0gJ2JlZm9yZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLCBkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QWZ0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IFRoaXMgZG9lc24ndCBwcmV2ZW50IHdlYnBhY2sgZnJvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGluZyB0aGlzIGZpbGUgaWYgcHJlc2VudCBpbiBhbm90aGVyIGNodW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvIHJlbW92aW5nIGl0IChhbmQgYSBwb3RlbnRpYWwgc291cmNlIG1hcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlKSBsYXRlciBpbiB0aGUgXCJkb25lXCIgaG9vay5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoc1RvUmVtb3ZlLnB1c2goSGVscGVyLnN0cmlwTG9hZGVyKHBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhc3NldHNbcGF0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBObyByZWZlcmVuY2VkICR7YXNzZXRUeXBlLnRhZ05hbWV9IGZpbGUgaW4gYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Jlc3VsdGluZyBtYXJrdXAgZm91bmQgd2l0aCBzZWxlY3RvcjogXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHthc3NldFR5cGUubGlua1RhZ05hbWV9JHthc3NldFR5cGUuc2VsZWN0b3J9XCJgXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAvLyBOT1RFOiBXZSBoYXZlIHRvIHJlc3RvcmUgdGVtcGxhdGUgZGVsaW1pdGVyIGFuZCBzdHlsZSBjb250ZW50cy5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRcbiAgICAgICAgICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL14oXFxzKjwhZG9jdHlwZSBbXj5dKz8+XFxzKilbXFxzXFxTXSokL2ksICckMSdcbiAgICAgICAgICAgICAgICApICsgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUxcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyNcXCsjXFwrI1xcKyMjL2csICc8JScpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyMjLSMtIy0jIy9nLCAnJT4nKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPHN0eWxlW14+XSo+KVtcXHNcXFNdKj8oPFxcL3N0eWxlW14+XSo+KS9naSwgKFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGFnOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgICAgICk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0VGFnLmluY2x1ZGVzKCcgd2Vib3B0aW1pemVyaW5wbGFjZT1cInRydWVcIicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRhZy5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHdlYm9wdGltaXplcmlucGxhY2U9XCJ0cnVlXCInLCAnJykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2luUGxhY2VTdHlsZUNvbnRlbnRzLnNoaWZ0KCl9JHtlbmRUYWd9YFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7c3RhcnRUYWd9JHtzdHlsZUNvbnRlbnRzLnNoaWZ0KCl9JHtlbmRUYWd9YFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmVcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdHJpcHMgbG9hZGVyIGluZm9ybWF0aW9ucyBmb3JtIGdpdmVuIG1vZHVsZSByZXF1ZXN0IGluY2x1ZGluZyBsb2FkZXJcbiAgICAgKiBwcmVmaXggYW5kIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgcmVxdWVzdCB0byBzdHJpcC5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBtb2R1bGUgaWQgc3RyaXBwZWQuXG4gICAgICovXG4gICAgc3RhdGljIHN0cmlwTG9hZGVyKG1vZHVsZUlEOnN0cmluZ3xTdHJpbmcpOnN0cmluZyB7XG4gICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQudG9TdHJpbmcoKVxuICAgICAgICBjb25zdCBtb2R1bGVJRFdpdGhvdXRMb2FkZXI6c3RyaW5nID0gbW9kdWxlSUQuc3Vic3RyaW5nKFxuICAgICAgICAgICAgbW9kdWxlSUQubGFzdEluZGV4T2YoJyEnKSArIDEpXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFdpdGhvdXRMb2FkZXIuaW5jbHVkZXMoXG4gICAgICAgICAgICAnPydcbiAgICAgICAgKSA/IG1vZHVsZUlEV2l0aG91dExvYWRlci5zdWJzdHJpbmcoMCwgbW9kdWxlSURXaXRob3V0TG9hZGVyLmluZGV4T2YoXG4gICAgICAgICAgICAgICAgJz8nXG4gICAgICAgICAgICApKSA6IG1vZHVsZUlEV2l0aG91dExvYWRlclxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gYXJyYXlcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBnaXZlbiBsaXN0IG9mIHBhdGggdG8gYSBub3JtYWxpemVkIGxpc3Qgd2l0aCB1bmlxdWUgdmFsdWVzLlxuICAgICAqIEBwYXJhbSBwYXRocyAtIEZpbGUgcGF0aHMuXG4gICAgICogQHJldHVybnMgVGhlIGdpdmVuIGZpbGUgcGF0aCBsaXN0IHdpdGggbm9ybWFsaXplZCB1bmlxdWUgdmFsdWVzLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVQYXRocyhwYXRoczpBcnJheTxzdHJpbmc+KTpBcnJheTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChwYXRocy5tYXAoKGdpdmVuUGF0aDpzdHJpbmcpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICBnaXZlblBhdGggPSBwYXRoLm5vcm1hbGl6ZShnaXZlblBhdGgpXG4gICAgICAgICAgICBpZiAoZ2l2ZW5QYXRoLmVuZHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdpdmVuUGF0aC5zdWJzdHJpbmcoMCwgZ2l2ZW5QYXRoLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICByZXR1cm4gZ2l2ZW5QYXRoXG4gICAgICAgIH0pKSlcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGZpbGUgaGFuZGxlclxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgZmlsZSBwYXRoL25hbWUgcGxhY2Vob2xkZXIgcmVwbGFjZW1lbnRzIHdpdGggZ2l2ZW4gYnVuZGxlXG4gICAgICogYXNzb2NpYXRlZCBpbmZvcm1hdGlvbnMuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoVGVtcGxhdGUgLSBGaWxlIHBhdGggdG8gcHJvY2VzcyBwbGFjZWhvbGRlciBpbi5cbiAgICAgKiBAcGFyYW0gaW5mb3JtYXRpb25zIC0gU2NvcGUgdG8gdXNlIGZvciBwcm9jZXNzaW5nLlxuICAgICAqIEByZXR1cm5zIFByb2Nlc3NlZCBmaWxlIHBhdGguXG4gICAgICovXG4gICAgc3RhdGljIHJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgIGZpbGVQYXRoVGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBpbmZvcm1hdGlvbnM6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xuICAgICAgICAgICAgJ1toYXNoXSc6ICcuX19kdW1teV9fJyxcbiAgICAgICAgICAgICdbaWRdJzogJy5fX2R1bW15X18nLFxuICAgICAgICAgICAgJ1tuYW1lXSc6ICcuX19kdW1teV9fJ1xuICAgICAgICB9XG4gICAgKTpzdHJpbmcge1xuICAgICAgICBsZXQgZmlsZVBhdGg6c3RyaW5nID0gZmlsZVBhdGhUZW1wbGF0ZVxuICAgICAgICBmb3IgKGNvbnN0IHBsYWNlaG9sZGVyTmFtZTpzdHJpbmcgaW4gaW5mb3JtYXRpb25zKVxuICAgICAgICAgICAgaWYgKGluZm9ybWF0aW9ucy5oYXNPd25Qcm9wZXJ0eShwbGFjZWhvbGRlck5hbWUpKVxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGgucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhwbGFjZWhvbGRlck5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2cnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGluZm9ybWF0aW9uc1twbGFjZWhvbGRlck5hbWVdXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICByZXR1cm4gZmlsZVBhdGhcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZ2l2ZW4gcmVxdWVzdCB0byBhIHJlc29sdmVkIHJlcXVlc3Qgd2l0aCBnaXZlbiBjb250ZXh0XG4gICAgICogZW1iZWRkZWQuXG4gICAgICogQHBhcmFtIHJlcXVlc3QgLSBSZXF1ZXN0IHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIENvbnRleHQgb2YgZ2l2ZW4gcmVxdWVzdCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zIC0gTGlzdCBvZiByZWxhdGl2ZSBkaXJlY3RvcnkgcGF0aHMgdG9cbiAgICAgKiBzZWFyY2ggZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHJldHVybnMgQSBuZXcgcmVzb2x2ZWQgcmVxdWVzdC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlDb250ZXh0KFxuICAgICAgICByZXF1ZXN0OnN0cmluZyxcbiAgICAgICAgY29udGV4dDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcuLycsXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddXG4gICAgKTpzdHJpbmcge1xuICAgICAgICByZWZlcmVuY2VQYXRoID0gcGF0aC5yZXNvbHZlKHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHJlcXVlc3Quc3RhcnRzV2l0aCgnLi8nKSAmJlxuICAgICAgICAgICAgcGF0aC5yZXNvbHZlKGNvbnRleHQpICE9PSByZWZlcmVuY2VQYXRoXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmVxdWVzdCA9IHBhdGgucmVzb2x2ZShjb250ZXh0LCByZXF1ZXN0KVxuICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVQYXRoOnN0cmluZyBvZiByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBtb2R1bGVQYXRoKVxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgocGF0aFByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKHBhdGhQcmVmaXgubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5zdWJzdHJpbmcocmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50c1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aChyZWZlcmVuY2VQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhyZWZlcmVuY2VQYXRoLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LnN1YnN0cmluZyhyZXF1ZXN0Lmxhc3RJbmRleE9mKCchJykgKyAxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXF1ZXN0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGdpdmVuIHJlcXVlc3QgcG9pbnRzIHRvIGFuIGV4dGVybmFsIGRlcGVuZGVuY3kgbm90IG1haW50YWluZWRcbiAgICAgKiBieSBjdXJyZW50IHBhY2thZ2UgY29udGV4dC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdCAtIFJlcXVlc3QgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gQ29udGV4dCBvZiBjdXJyZW50IHByb2plY3QuXG4gICAgICogQHBhcmFtIHJlcXVlc3RDb250ZXh0IC0gQ29udGV4dCBvZiBnaXZlbiByZXF1ZXN0IHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbiAtIE1hcHBpbmcgb2YgY2h1bmsgbmFtZXMgdG8gbW9kdWxlc1xuICAgICAqIHdoaWNoIHNob3VsZCBiZSBpbmplY3RlZC5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVFeHRlcm5hbE1vZHVsZUxvY2F0aW9ucyAtIEFycmF5IG9mIHBhdGhzIHdoZXJlIGV4dGVybmFsXG4gICAgICogbW9kdWxlcyB0YWtlIHBsYWNlLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBpbmNsdWRlUGF0dGVybiAtIEFycmF5IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZXhwbGljaXRseSBtYXJrXG4gICAgICogYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAgKiBAcGFyYW0gZXhjbHVkZVBhdHRlcm4gLSBBcnJheSBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIGV4cGxpY2l0bHkgbWFya1xuICAgICAqIGFzIGludGVybmFsIGRlcGVuZGVuY3kuXG4gICAgICogQHBhcmFtIGluUGxhY2VOb3JtYWxMaWJyYXJ5IC0gSW5kaWNhdGVzIHdoZXRoZXIgbm9ybWFsIGxpYnJhcmllcyBzaG91bGRcbiAgICAgKiBiZSBleHRlcm5hbCBvciBub3QuXG4gICAgICogQHBhcmFtIGluUGxhY2VEeW5hbWljTGlicmFyeSAtIEluZGljYXRlcyB3aGV0aGVyIHJlcXVlc3RzIHdpdGhcbiAgICAgKiBpbnRlZ3JhdGVkIGxvYWRlciBjb25maWd1cmF0aW9ucyBzaG91bGQgYmUgbWFya2VkIGFzIGV4dGVybmFsIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgLSBFbmNvZGluZyBmb3IgZmlsZSBuYW1lcyB0byB1c2UgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBBIG5ldyByZXNvbHZlZCByZXF1ZXN0IGluZGljYXRpbmcgd2hldGhlciBnaXZlbiByZXF1ZXN0IGlzIGFuXG4gICAgICogZXh0ZXJuYWwgb25lLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgIHJlcXVlc3Q6c3RyaW5nLFxuICAgICAgICBjb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIHJlcXVlc3RDb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbjpOb3JtYWxpemVkRW50cnlJbmplY3Rpb24gPSB7fSxcbiAgICAgICAgcmVsYXRpdmVFeHRlcm5hbE1vZHVsZUxvY2F0aW9uczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5jb21waWxlZC5qcycsICcuanMnLCAnLmpzb24nXSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAnanMnLFxuICAgICAgICAgICAgICAgICAgICAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgICdjc3MnLFxuICAgICAgICAgICAgICAgICAgICAnZW90JyxcbiAgICAgICAgICAgICAgICAgICAgJ2dpZicsXG4gICAgICAgICAgICAgICAgICAgICdodG1sJyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljbycsXG4gICAgICAgICAgICAgICAgICAgICdqcGcnLFxuICAgICAgICAgICAgICAgICAgICAncG5nJyxcbiAgICAgICAgICAgICAgICAgICAgJ2VqcycsXG4gICAgICAgICAgICAgICAgICAgICdzdmcnLFxuICAgICAgICAgICAgICAgICAgICAndHRmJyxcbiAgICAgICAgICAgICAgICAgICAgJ3dvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgICAgIF0ubWFwKChzdWZmaXg6c3RyaW5nKTpzdHJpbmcgPT4gYC4ke3N1ZmZpeH1gKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1vZHVsZTogW11cbiAgICAgICAgfSxcbiAgICAgICAgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gWydpbmRleCcsICdtYWluJ10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJywgJ21vZHVsZSddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgaW5jbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgZXhjbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgaW5QbGFjZU5vcm1hbExpYnJhcnk6Ym9vbGVhbiA9IGZhbHNlLFxuICAgICAgICBpblBsYWNlRHluYW1pY0xpYnJhcnk6Ym9vbGVhbiA9IHRydWUsXG4gICAgICAgIGVuY29kaW5nOnN0cmluZyA9ICd1dGYtOCdcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBjb250ZXh0ID0gcGF0aC5yZXNvbHZlKGNvbnRleHQpXG4gICAgICAgIHJlcXVlc3RDb250ZXh0ID0gcGF0aC5yZXNvbHZlKHJlcXVlc3RDb250ZXh0KVxuICAgICAgICByZWZlcmVuY2VQYXRoID0gcGF0aC5yZXNvbHZlKHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIC8vIE5PVEU6IFdlIGFwcGx5IGFsaWFzIG9uIGV4dGVybmFscyBhZGRpdGlvbmFsbHkuXG4gICAgICAgIGNvbnN0IHJlc29sdmVkUmVxdWVzdDpzdHJpbmcgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKFxuICAgICAgICAgICAgICAgIHJlcXVlc3Quc3Vic3RyaW5nKHJlcXVlc3QubGFzdEluZGV4T2YoJyEnKSArIDEpLCBhbGlhc2VzKSxcbiAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50c1xuICAgICAgICApXG4gICAgICAgIGlmIChUb29scy5pc0FueU1hdGNoaW5nKHJlc29sdmVkUmVxdWVzdCwgZXhjbHVkZVBhdHRlcm4pKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IEFsaWFzZXMgYW5kIG1vZHVsZSByZXBsYWNlbWVudHMgZG9lc24ndCBoYXZlIHRvIGJlIGZvcndhcmRlZFxuICAgICAgICAgICAgc2luY2Ugd2UgcGFzcyBhbiBhbHJlYWR5IHJlc29sdmVkIHJlcXVlc3QuXG4gICAgICAgICovXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge2ZpbGU6IGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbCwgbW9kdWxlOiBleHRlbnNpb25zLm1vZHVsZX0sXG4gICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgcmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgICBwYXRoc1RvSWdub3JlLFxuICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnMsXG4gICAgICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXMsXG4gICAgICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgZW5jb2RpbmdcbiAgICAgICAgKVxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgbWFyayBkZXBlbmRlbmNpZXMgYXMgZXh0ZXJuYWwgaWYgdGhlcmUgZmlsZSBjb3VsZG4ndCBiZVxuICAgICAgICAgICAgcmVzb2x2ZWQgb3IgYXJlIHNwZWNpZmllZCB0byBiZSBleHRlcm5hbCBleHBsaWNpdGx5LlxuICAgICAgICAqL1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhKGZpbGVQYXRoIHx8IGluUGxhY2VOb3JtYWxMaWJyYXJ5KSB8fFxuICAgICAgICAgICAgVG9vbHMuaXNBbnlNYXRjaGluZyhyZXNvbHZlZFJlcXVlc3QsIGluY2x1ZGVQYXR0ZXJuKVxuICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gSGVscGVyLmFwcGx5Q29udGV4dChcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsXG4gICAgICAgICAgICAgICAgcmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICBhbGlhc2VzLFxuICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cyxcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9uc1xuICAgICAgICAgICAgKVxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uKVxuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBleHRlbnNpb25zLmZpbGUuaW50ZXJuYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBleHRlbnNpb25zLm1vZHVsZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0Q29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzVG9JZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICApID09PSBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGNvbnN0IHBhcnRzID0gY29udGV4dC5zcGxpdCgnLycpXG4gICAgICAgIGNvbnN0IGV4dGVybmFsTW9kdWxlTG9jYXRpb25zID0gW11cbiAgICAgICAgd2hpbGUgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVsYXRpdmVQYXRoOnN0cmluZyBvZiByZWxhdGl2ZUV4dGVybmFsTW9kdWxlTG9jYXRpb25zKVxuICAgICAgICAgICAgICAgIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zLnB1c2gocGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAnLycsIHBhcnRzLmpvaW4oJy8nKSwgcmVsYXRpdmVQYXRoKSlcbiAgICAgICAgICAgIHBhcnRzLnNwbGljZSgtMSwgMSlcbiAgICAgICAgfVxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgbWFyayBkZXBlbmRlbmNpZXMgYXMgZXh0ZXJuYWwgaWYgdGhleSBkb2VzIG5vdCBjb250YWluIGFcbiAgICAgICAgICAgIGxvYWRlciBpbiB0aGVpciByZXF1ZXN0IGFuZCBhcmVuJ3QgcGFydCBvZiB0aGUgY3VycmVudCBtYWluIHBhY2thZ2VcbiAgICAgICAgICAgIG9yIGhhdmUgYSBmaWxlIGV4dGVuc2lvbiBvdGhlciB0aGFuIGphdmFTY3JpcHQgYXdhcmUuXG4gICAgICAgICovXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICFpblBsYWNlTm9ybWFsTGlicmFyeSAmJlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCAmJlxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5pbmNsdWRlcyhwYXRoLmV4dG5hbWUoZmlsZVBhdGgpKSB8fFxuICAgICAgICAgICAgICAgICFmaWxlUGF0aCAmJlxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5pbmNsdWRlcygnJylcbiAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICEoaW5QbGFjZUR5bmFtaWNMaWJyYXJ5ICYmIHJlcXVlc3QuaW5jbHVkZXMoJyEnKSkgJiZcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAhZmlsZVBhdGggJiZcbiAgICAgICAgICAgICAgICBpblBsYWNlRHluYW1pY0xpYnJhcnkgfHxcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCAmJlxuICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgIWZpbGVQYXRoLnN0YXJ0c1dpdGgoY29udGV4dCkgfHxcbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseUNvbnRleHQoXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LFxuICAgICAgICAgICAgICAgIHJlcXVlc3RDb250ZXh0LFxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsXG4gICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhc3NldCB0eXBlIG9mIGdpdmVuIGZpbGUuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIC0gUGF0aCB0byBmaWxlIHRvIGFuYWx5c2UuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbiAtIE1ldGEgaW5mb3JtYXRpb25zIGZvciBhdmFpbGFibGUgYXNzZXRcbiAgICAgKiB0eXBlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHMgLSBMaXN0IG9mIHBhdGhzIHRvIHNlYXJjaCBpZiBnaXZlbiBwYXRoIGRvZXNuJ3QgcmVmZXJlbmNlXG4gICAgICogYSBmaWxlIGRpcmVjdGx5LlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgZmlsZSB0eXBlIG9yIFwibnVsbFwiIG9mIGdpdmVuIGZpbGUgY291bGRuJ3QgYmVcbiAgICAgKiBkZXRlcm1pbmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgIGZpbGVQYXRoOnN0cmluZywgYnVpbGRDb25maWd1cmF0aW9uOkJ1aWxkQ29uZmlndXJhdGlvbiwgcGF0aHM6UGF0aFxuICAgICk6P3N0cmluZyB7XG4gICAgICAgIGxldCByZXN1bHQ6P3N0cmluZyA9IG51bGxcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiBidWlsZENvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT1cbiAgICAgICAgICAgICAgICBgLiR7YnVpbGRDb25maWd1cmF0aW9uW3R5cGVdLmV4dGVuc2lvbn1gXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0eXBlXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnc291cmNlJywgJ3RhcmdldCddKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXRUeXBlOnN0cmluZyBpbiBwYXRoc1t0eXBlXS5hc3NldClcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aHNbdHlwZV0uYXNzZXQuaGFzT3duUHJvcGVydHkoYXNzZXRUeXBlKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlICE9PSAnYmFzZScgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzW3R5cGVdLmFzc2V0W2Fzc2V0VHlwZV0gJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLnN0YXJ0c1dpdGgocGF0aHNbdHlwZV0uYXNzZXRbYXNzZXRUeXBlXSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0VHlwZVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBwcm9wZXJ0eSB3aXRoIGEgc3RvcmVkIGFycmF5IG9mIGFsbCBtYXRjaGluZyBmaWxlIHBhdGhzLCB3aGljaFxuICAgICAqIG1hdGNoZXMgZWFjaCBidWlsZCBjb25maWd1cmF0aW9uIGluIGdpdmVuIGVudHJ5IHBhdGggYW5kIGNvbnZlcnRzIGdpdmVuXG4gICAgICogYnVpbGQgY29uZmlndXJhdGlvbiBpbnRvIGEgc29ydGVkIGFycmF5IHdlcmUgamF2YVNjcmlwdCBmaWxlcyB0YWtlc1xuICAgICAqIHByZWNlZGVuY2UuXG4gICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb24gLSBHaXZlbiBidWlsZCBjb25maWd1cmF0aW9ucy5cbiAgICAgKiBAcGFyYW0gZW50cnlQYXRoIC0gUGF0aCB0byBhbmFseXNlIG5lc3RlZCBzdHJ1Y3R1cmUuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIG1haW5GaWxlQmFzZW5hbWVzIC0gRmlsZSBiYXNlbmFtZXMgdG8gc29ydCBpbnRvIHRoZSBmcm9udC5cbiAgICAgKiBAcmV0dXJucyBDb252ZXJ0ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUJ1aWxkQ29uZmlndXJhdGlvbkZpbGVQYXRocyhcbiAgICAgICAgY29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIGVudHJ5UGF0aDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgbWFpbkZpbGVCYXNlbmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnaW5kZXgnLCAnbWFpbiddXG4gICAgKTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiB7XG4gICAgICAgIGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbjpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9IFtdXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbilcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0gPVxuICAgICAgICAgICAgICAgICAgICBUb29scy5leHRlbmQodHJ1ZSwge2ZpbGVQYXRoczogW119LCBjb25maWd1cmF0aW9uW3R5cGVdKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZTpGaWxlIG9mIFRvb2xzLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoXG4gICAgICAgICAgICAgICAgICAgIGVudHJ5UGF0aCwgKGZpbGU6RmlsZSk6P2ZhbHNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cy5pc0ZpbGUoKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKGZpbGUucGF0aCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICkgPT09IG5ld0l0ZW0uZXh0ZW5zaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhKG5ldyBSZWdFeHAobmV3SXRlbS5maWxlUGF0aFBhdHRlcm4pKS50ZXN0KGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5maWxlUGF0aHMucHVzaChmaWxlLnBhdGgpXG4gICAgICAgICAgICAgICAgbmV3SXRlbS5maWxlUGF0aHMuc29ydCgoXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0RmlsZVBhdGg6c3RyaW5nLCBzZWNvbmRGaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICApOm51bWJlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RGaWxlUGF0aCwgcGF0aC5leHRuYW1lKGZpcnN0RmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbkZpbGVCYXNlbmFtZXMuaW5jbHVkZXMocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRGaWxlUGF0aCwgcGF0aC5leHRuYW1lKHNlY29uZEZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kRmlsZVBhdGgsIHBhdGguZXh0bmFtZShzZWNvbmRGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLnB1c2gobmV3SXRlbSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1aWxkQ29uZmlndXJhdGlvbi5zb3J0KChcbiAgICAgICAgICAgIGZpcnN0OlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSxcbiAgICAgICAgICAgIHNlY29uZDpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbiAgICAgICAgKTpudW1iZXIgPT4ge1xuICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiAhPT0gc2Vjb25kLm91dHB1dEV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgICAgIGlmIChzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIHJldHVybiBmaXJzdC5vdXRwdXRFeHRlbnNpb24gPCBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID8gLTEgOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9KVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBmaWxlIGFuZCBkaXJlY3RvcnkgcGF0aHMgcmVsYXRlZCB0byBnaXZlbiBpbnRlcm5hbFxuICAgICAqIG1vZHVsZXMgYXMgYXJyYXkuXG4gICAgICogQHBhcmFtIGVudHJ5SW5qZWN0aW9uIC0gTGlzdCBvZiBtb2R1bGUgaWRzIG9yIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIG1vZHVsZSByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byBzZWFyY2ggZm9yIGxvY2FsIG1vZHVsZXMuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBlbmNvZGluZyAtIEZpbGUgbmFtZSBlbmNvZGluZyB0byB1c2UgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBhIGZpbGUgcGF0aCBhbmQgZGlyZWN0b3J5IHBhdGgga2V5IG1hcHBpbmcgdG9cbiAgICAgKiBjb3JyZXNwb25kaW5nIGxpc3Qgb2YgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgZW50cnlJbmplY3Rpb246RW50cnlJbmplY3Rpb24sXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGV4dGVuc2lvbnM6UGxhaW5PYmplY3QgPSB7XG4gICAgICAgICAgICBmaWxlOiBbXG4gICAgICAgICAgICAgICAgJ2pzJyxcbiAgICAgICAgICAgICAgICAnanNvbicsXG4gICAgICAgICAgICAgICAgJ2NzcycsXG4gICAgICAgICAgICAgICAgJ2VvdCcsXG4gICAgICAgICAgICAgICAgJ2dpZicsXG4gICAgICAgICAgICAgICAgJ2h0bWwnLFxuICAgICAgICAgICAgICAgICdpY28nLFxuICAgICAgICAgICAgICAgICdqcGcnLFxuICAgICAgICAgICAgICAgICdwbmcnLFxuICAgICAgICAgICAgICAgICdlanMnLFxuICAgICAgICAgICAgICAgICdzdmcnLFxuICAgICAgICAgICAgICAgICd0dGYnLFxuICAgICAgICAgICAgICAgICd3b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgIF0ubWFwKChzdWZmaXg6c3RyaW5nKTpzdHJpbmcgPT4gYC4ke3N1ZmZpeH1gKSxcbiAgICAgICAgICAgIG1vZHVsZTogW11cbiAgICAgICAgfSxcbiAgICAgICAgY29udGV4dDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVMb2NhdGlvbnM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJ19fcGFja2FnZV9fJywgJycsICdpbmRleCcsICdtYWluJ1xuICAgICAgICBdLFxuICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnbWFpbicsICdtb2R1bGUnXSxcbiAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gW10sXG4gICAgICAgIGVuY29kaW5nOnN0cmluZyA9ICd1dGYtOCdcbiAgICApOntmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPjtkaXJlY3RvcnlQYXRoczpBcnJheTxzdHJpbmc+fSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbjpOb3JtYWxpemVkRW50cnlJbmplY3Rpb24gPVxuICAgICAgICAgICAgSGVscGVyLnJlc29sdmVNb2R1bGVzSW5Gb2xkZXJzKFxuICAgICAgICAgICAgICAgIEhlbHBlci5ub3JtYWxpemVFbnRyeUluamVjdGlvbihlbnRyeUluamVjdGlvbiksXG4gICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsXG4gICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLFxuICAgICAgICAgICAgICAgIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgIClcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkRW50cnlJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkRW50cnlJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzVG9JZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoOnN0cmluZyA9IHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZGlyZWN0b3J5UGF0aHMuaW5jbHVkZXMoZGlyZWN0b3J5UGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5UGF0aHMucHVzaChkaXJlY3RvcnlQYXRoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4ge2ZpbGVQYXRocywgZGlyZWN0b3J5UGF0aHN9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBsaXN0IG9mIGNvbmNyZXRlIGZpbGUgcGF0aHMgZm9yIGdpdmVuIG1vZHVsZSBpZCBwb2ludGluZyB0b1xuICAgICAqIGEgZm9sZGVyIHdoaWNoIGlzbid0IGEgcGFja2FnZS5cbiAgICAgKiBAcGFyYW0gbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uIC0gSW5qZWN0aW9uIGRhdGEgc3RydWN0dXJlIG9mIG1vZHVsZXNcbiAgICAgKiB3aXRoIGZvbGRlciByZWZlcmVuY2VzIHRvIHJlc29sdmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9ucyB3aXRoIHJlc29sdmVkIGZvbGRlciBwb2ludGluZyBtb2R1bGVzLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlTW9kdWxlc0luRm9sZGVycyhcbiAgICAgICAgbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uOk5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgY29udGV4dDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXVxuICAgICk6Tm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uIHtcbiAgICAgICAgaWYgKHJlZmVyZW5jZVBhdGguc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVsYXRpdmUoY29udGV4dCwgcmVmZXJlbmNlUGF0aClcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkRW50cnlJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSkge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoSGVscGVyLnN0cmlwTG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBhbGlhc2VzKSwgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNvbHZlZFBhdGg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgbW9kdWxlSUQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMocmVzb2x2ZWRQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uW2NodW5rTmFtZV0uc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlOkZpbGUgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKHJlc29sdmVkUGF0aCwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOkZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOj9mYWxzZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnBhdGgsIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUuc3RhdHMgJiYgZmlsZS5zdGF0cy5pc0ZpbGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uW2NodW5rTmFtZV0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuLycgKyBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsIHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRQYXRoLCBmaWxlLnBhdGgpKSlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELnN0YXJ0c1dpdGgoJy4vJykgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICFtb2R1bGVJRC5zdGFydHNXaXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAuLyR7cGF0aC5yZWxhdGl2ZShjb250ZXh0LCByZWZlcmVuY2VQYXRoKX1gXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRFbnRyeUluamVjdGlvbltjaHVua05hbWVdW2luZGV4XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYC4vJHtwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHJlc29sdmVkUGF0aCl9YFxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uXG4gICAgfVxuICAgIC8qKlxuICAgICAqIEV2ZXJ5IGluamVjdGlvbiBkZWZpbml0aW9uIHR5cGUgY2FuIGJlIHJlcHJlc2VudGVkIGFzIHBsYWluIG9iamVjdFxuICAgICAqIChtYXBwaW5nIGZyb20gY2h1bmsgbmFtZSB0byBhcnJheSBvZiBtb2R1bGUgaWRzKS4gVGhpcyBtZXRob2QgY29udmVydHNcbiAgICAgKiBlYWNoIHJlcHJlc2VudGF0aW9uIGludG8gdGhlIG5vcm1hbGl6ZWQgcGxhaW4gb2JqZWN0IG5vdGF0aW9uLlxuICAgICAqIEBwYXJhbSBlbnRyeUluamVjdGlvbiAtIEdpdmVuIGVudHJ5IGluamVjdGlvbiB0byBub3JtYWxpemUuXG4gICAgICogQHJldHVybnMgTm9ybWFsaXplZCByZXByZXNlbnRhdGlvbiBvZiBnaXZlbiBlbnRyeSBpbmplY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIG5vcm1hbGl6ZUVudHJ5SW5qZWN0aW9uKFxuICAgICAgICBlbnRyeUluamVjdGlvbjpFbnRyeUluamVjdGlvblxuICAgICk6Tm9ybWFsaXplZEVudHJ5SW5qZWN0aW9uIHtcbiAgICAgICAgbGV0IHJlc3VsdDpOb3JtYWxpemVkRW50cnlJbmplY3Rpb24gPSB7fVxuICAgICAgICBpZiAoVG9vbHMuaXNGdW5jdGlvbihlbnRyeUluamVjdGlvbikpXG4gICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgIGVudHJ5SW5qZWN0aW9uID0gZW50cnlJbmplY3Rpb24oKVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbnRyeUluamVjdGlvbikpXG4gICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IGVudHJ5SW5qZWN0aW9ufVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZW50cnlJbmplY3Rpb24gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbZW50cnlJbmplY3Rpb25dfVxuICAgICAgICBlbHNlIGlmIChUb29scy5pc1BsYWluT2JqZWN0KGVudHJ5SW5qZWN0aW9uKSkge1xuICAgICAgICAgICAgbGV0IGhhc0NvbnRlbnQ6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgICAgICBjb25zdCBjaHVua05hbWVzVG9EZWxldGU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gZW50cnlJbmplY3Rpb24pXG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5SW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGVudHJ5SW5qZWN0aW9uW2NodW5rTmFtZV0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudHJ5SW5qZWN0aW9uW2NodW5rTmFtZV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBlbnRyeUluamVjdGlvbltjaHVua05hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVzVG9EZWxldGUucHVzaChjaHVua05hbWUpXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjaHVua05hbWVdID0gW2VudHJ5SW5qZWN0aW9uW2NodW5rTmFtZV1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoYXNDb250ZW50KVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBvZiBjaHVua05hbWVzVG9EZWxldGUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogW119XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBjb25jcmV0ZSBmaWxlIHBhdGhzIGZvciBnaXZlbiBpbmplY3Rpb24gd2hpY2ggYXJlIG1hcmtlZFxuICAgICAqIHdpdGggdGhlIFwiX19hdXRvX19cIiBpbmRpY2F0b3IuXG4gICAgICogQHBhcmFtIGdpdmVuSW5qZWN0aW9uIC0gR2l2ZW4gZW50cnkgYW5kIGV4dGVybmFsIGluamVjdGlvbiB0byB0YWtlXG4gICAgICogaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlc1RvRXhjbHVkZSAtIEEgbGlzdCBvZiBtb2R1bGVzIHRvIGV4Y2x1ZGUgKHNwZWNpZmllZCBieVxuICAgICAqIHBhdGggb3IgaWQpIG9yIGEgbWFwcGluZyBmcm9tIGNodW5rIG5hbWVzIHRvIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUmVmZXJlbmNlIHBhdGggZnJvbSB3aGVyZSBsb2NhbCBmaWxlcyBzaG91bGQgYmVcbiAgICAgKiByZXNvbHZlZC5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBpbmplY3Rpb24gd2l0aCByZXNvbHZlZCBtYXJrZWQgaW5kaWNhdG9ycy5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZUluamVjdGlvbihcbiAgICAgICAgZ2l2ZW5JbmplY3Rpb246SW5qZWN0aW9uLFxuICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uLFxuICAgICAgICBtb2R1bGVzVG9FeGNsdWRlOkVudHJ5SW5qZWN0aW9uLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBleHRlbnNpb25zOkV4dGVuc2lvbnMgPSB7XG4gICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnY29tcGlsZWQuanMnLCAnLmpzJywgJy5qc29uJ10sXG4gICAgICAgICAgICAgICAgaW50ZXJuYWw6IFtcbiAgICAgICAgICAgICAgICAgICAgJ2pzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2pzb24nLFxuICAgICAgICAgICAgICAgICAgICAnY3NzJyxcbiAgICAgICAgICAgICAgICAgICAgJ2VvdCcsXG4gICAgICAgICAgICAgICAgICAgICdnaWYnLFxuICAgICAgICAgICAgICAgICAgICAnaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICdpY28nLFxuICAgICAgICAgICAgICAgICAgICAnanBnJyxcbiAgICAgICAgICAgICAgICAgICAgJ3BuZycsXG4gICAgICAgICAgICAgICAgICAgICdlanMnLFxuICAgICAgICAgICAgICAgICAgICAnc3ZnJyxcbiAgICAgICAgICAgICAgICAgICAgJ3R0ZicsXG4gICAgICAgICAgICAgICAgICAgICd3b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgICAgICBdLm1hcCgoc3VmZml4OnN0cmluZyk6c3RyaW5nID0+IGAuJHtzdWZmaXh9YClcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtb2R1bGU6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOkluamVjdGlvbiB7XG4gICAgICAgIGNvbnN0IGluamVjdGlvbjpJbmplY3Rpb24gPSBUb29scy5leHRlbmQodHJ1ZSwge30sIGdpdmVuSW5qZWN0aW9uKVxuICAgICAgICBjb25zdCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGU6QXJyYXk8c3RyaW5nPiA9XG4gICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgIG1vZHVsZXNUb0V4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsXG4gICAgICAgICAgICAgICAge2ZpbGU6IGV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbCwgbW9kdWxlOiBleHRlbnNpb25zLm1vZHVsZX0sXG4gICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLFxuICAgICAgICAgICAgICAgIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICkuZmlsZVBhdGhzXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydlbnRyeScsICdleHRlcm5hbCddKVxuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY3VybHkgKi9cbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5qZWN0aW9uW3R5cGVdID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBpbmplY3Rpb25bdHlwZV0pXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXSA9PT0gJ19fYXV0b19fJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0gPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kdWxlczp7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2tleTpzdHJpbmddOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IEhlbHBlci5nZXRBdXRvQ2h1bmsoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJDaHVua05hbWU6c3RyaW5nIGluIG1vZHVsZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZXMuaGFzT3duUHJvcGVydHkoc3ViQ2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXNbc3ViQ2h1bmtOYW1lXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV2ZXJzZSBhcnJheSB0byBsZXQgamF2YVNjcmlwdCBhbmQgbWFpbiBmaWxlcyBiZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBsYXN0IG9uZXMgdG8gZXhwb3J0IHRoZW0gcmF0aGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluamVjdGlvblt0eXBlXSA9PT0gJ19fYXV0b19fJylcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgY3VybHkgKi9cbiAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsIGNvbnRleHQpXG4gICAgICAgIHJldHVybiBpbmplY3Rpb25cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbnMgLSBSZXNvbHZlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqIEBwYXJhbSBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyBmaWxlIHBhdGhzIHRvXG4gICAgICogZXhjbHVkZSAoc3BlY2lmaWVkIGJ5IHBhdGggb3IgaWQpIG9yIGEgbWFwcGluZyBmcm9tIGNodW5rIG5hbWVzIHRvXG4gICAgICogbW9kdWxlIGlkcy5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byB1c2UgYXMgc3RhcnRpbmcgcG9pbnQuXG4gICAgICogQHJldHVybnMgQWxsIGRldGVybWluZWQgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGdldEF1dG9DaHVuayhcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4sXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nXG4gICAgKTp7W2tleTpzdHJpbmddOnN0cmluZ30ge1xuICAgICAgICBjb25zdCByZXN1bHQ6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge31cbiAgICAgICAgY29uc3QgaW5qZWN0ZWRNb2R1bGVJRHM6e1trZXk6c3RyaW5nXTpBcnJheTxzdHJpbmc+fSA9IHt9XG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtIG9mXG4gICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zXG4gICAgICAgICkge1xuICAgICAgICAgICAgaWYgKCFpbmplY3RlZE1vZHVsZUlEc1tidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXSlcbiAgICAgICAgICAgICAgICBpbmplY3RlZE1vZHVsZUlEc1tidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXSA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyBvZiBidWlsZENvbmZpZ3VyYXRpb24uZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgIGlmICghbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLmluY2x1ZGVzKG1vZHVsZUZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoOnN0cmluZyA9ICcuLycgKyBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGg6c3RyaW5nID0gcGF0aC5kaXJuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzZU5hbWU6c3RyaW5nID0gcGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBgLiR7YnVpbGRDb25maWd1cmF0aW9uLmV4dGVuc2lvbn1gKVxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kdWxlSUQ6c3RyaW5nID0gYmFzZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpcmVjdG9yeVBhdGggIT09ICcuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gcGF0aC5qb2luKGRpcmVjdG9yeVBhdGgsIGJhc2VOYW1lKVxuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgRW5zdXJlIHRoYXQgZWFjaCBvdXRwdXQgdHlwZSBoYXMgb25seSBvbmUgc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmplY3RlZE1vZHVsZUlEc1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgXS5pbmNsdWRlcyhtb2R1bGVJRCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRW5zdXJlIHRoYXQgc2FtZSBtb2R1bGUgaWRzIGFuZCBkaWZmZXJlbnQgb3V0cHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZXMgY2FuIGJlIGRpc3Rpbmd1aXNoZWQgYnkgdGhlaXIgZXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKEphdmFTY3JpcHQtTW9kdWxlcyByZW1haW5zIHdpdGhvdXQgZXh0ZW5zaW9uIHNpbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhleSB3aWxsIGJlIGhhbmRsZWQgZmlyc3QgYmVjYXVzZSB0aGUgYnVpbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9ucyBhcmUgZXhwZWN0ZWQgdG8gYmUgc29ydGVkIGluIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0KS5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmhhc093blByb3BlcnR5KG1vZHVsZUlEKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcmVsYXRpdmVNb2R1bGVGaWxlUGF0aF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W21vZHVsZUlEXSA9IHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGVkTW9kdWxlSURzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIF0ucHVzaChtb2R1bGVJRClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIGRldGVybWluZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucyAtIExpc3Qgb2YgcmVsYXRpdmUgZmlsZSBwYXRoIHRvIHNlYXJjaFxuICAgICAqIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlRW50cnlGaWxlTmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZW50cnkgZmlsZSBuYW1lcyB0b1xuICAgICAqIHNlYXJjaCBmb3IuIFRoZSBtYWdpYyBuYW1lIFwiX19wYWNrYWdlX19cIiB3aWxsIHNlYXJjaCBmb3IgYW4gYXBwcmVjaWF0ZVxuICAgICAqIGVudHJ5IGluIGEgXCJwYWNrYWdlLmpzb25cIiBmaWxlLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBtYWluIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHJlcHJlc2VudGluZyBlbnRyeSBtb2R1bGUgZGVmaW5pdGlvbnMuXG4gICAgICogQHBhcmFtIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBhbGlhcyBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSBzcGVjaWZpYyBtb2R1bGUgYWxpYXNlcy5cbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgLSBFbmNvZGluZyB0byB1c2UgZm9yIGZpbGUgbmFtZXMgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBGaWxlIHBhdGggb3IgZ2l2ZW4gbW9kdWxlIGlkIGlmIGRldGVybWluYXRpb25zIGhhcyBmYWlsZWQgb3JcbiAgICAgKiB3YXNuJ3QgbmVjZXNzYXJ5LlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgbW9kdWxlSUQ6c3RyaW5nLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBleHRlbnNpb25zOlBsYWluT2JqZWN0ID0ge1xuICAgICAgICAgICAgZmlsZTogW1xuICAgICAgICAgICAgICAgICdqcycsXG4gICAgICAgICAgICAgICAgJ2pzb24nLFxuICAgICAgICAgICAgICAgICdjc3MnLFxuICAgICAgICAgICAgICAgICdlb3QnLFxuICAgICAgICAgICAgICAgICdnaWYnLFxuICAgICAgICAgICAgICAgICdodG1sJyxcbiAgICAgICAgICAgICAgICAnaWNvJyxcbiAgICAgICAgICAgICAgICAnanBnJyxcbiAgICAgICAgICAgICAgICAncG5nJyxcbiAgICAgICAgICAgICAgICAnZWpzJyxcbiAgICAgICAgICAgICAgICAnc3ZnJyxcbiAgICAgICAgICAgICAgICAndHRmJyxcbiAgICAgICAgICAgICAgICAnd29mZicsICcud29mZjInXG4gICAgICAgICAgICBdLm1hcCgoc3VmZml4OnN0cmluZyk6c3RyaW5nID0+IGAuJHtzdWZmaXh9YCksXG4gICAgICAgICAgICBtb2R1bGU6IFtdXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnaW5kZXgnXSxcbiAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ21haW4nXSxcbiAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gW10sXG4gICAgICAgIGVuY29kaW5nOnN0cmluZyA9ICd1dGYtOCdcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBtb2R1bGVJRCA9IEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoSGVscGVyLnN0cmlwTG9hZGVyKG1vZHVsZUlEKSwgYWxpYXNlcyksXG4gICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgIGlmICghbW9kdWxlSUQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBsZXQgbW9kdWxlRmlsZVBhdGg6c3RyaW5nID0gbW9kdWxlSURcbiAgICAgICAgaWYgKG1vZHVsZUZpbGVQYXRoLnN0YXJ0c1dpdGgoJy4vJykpXG4gICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCA9IHBhdGguam9pbihyZWZlcmVuY2VQYXRoLCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgY29uc3QgbW9kdWxlTG9jYXRpb25zID0gW3JlZmVyZW5jZVBhdGhdLmNvbmNhdChcbiAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlTG9jYXRpb25zLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoY29udGV4dCwgZmlsZVBhdGgpKVxuICAgICAgICApXG4gICAgICAgIGNvbnN0IHBhcnRzID0gY29udGV4dC5zcGxpdCgnLycpXG4gICAgICAgIHBhcnRzLnNwbGljZSgtMSwgMSlcbiAgICAgICAgd2hpbGUgKHBhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVsYXRpdmVQYXRoOnN0cmluZyBvZiByZWxhdGl2ZU1vZHVsZUxvY2F0aW9ucylcbiAgICAgICAgICAgICAgICBtb2R1bGVMb2NhdGlvbnMucHVzaChwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICcvJywgcGFydHMuam9pbignLycpLCByZWxhdGl2ZVBhdGgpKVxuICAgICAgICAgICAgcGFydHMuc3BsaWNlKC0xLCAxKVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbW9kdWxlTG9jYXRpb246c3RyaW5nIG9mIFtyZWZlcmVuY2VQYXRoXS5jb25jYXQoXG4gICAgICAgICAgICBtb2R1bGVMb2NhdGlvbnNcbiAgICAgICAgKSlcbiAgICAgICAgICAgIGZvciAobGV0IGZpbGVOYW1lOnN0cmluZyBvZiBbJycsICdfX3BhY2thZ2VfXyddLmNvbmNhdChcbiAgICAgICAgICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXNcbiAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kdWxlRXh0ZW5zaW9uOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLm1vZHVsZS5jb25jYXQoWycnXSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZUV4dGVuc2lvbjpzdHJpbmcgb2YgWycnXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zLmZpbGVcbiAgICAgICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnJlbnRNb2R1bGVGaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGVGaWxlUGF0aC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUxvY2F0aW9uLCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwYWNrYWdlQWxpYXNlczpQbGFpbk9iamVjdCA9IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgPT09ICdfX3BhY2thZ2VfXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKGN1cnJlbnRNb2R1bGVGaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aFRvUGFja2FnZUpTT046c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoLCAncGFja2FnZS5qc29uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMocGF0aFRvUGFja2FnZUpTT04pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9jYWxDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoVG9QYWNrYWdlSlNPTiwge2VuY29kaW5nfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb25bcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5TmFtZTpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gPT09ICdvYmplY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc2VzID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ19fcGFja2FnZV9fJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoZmlsZU5hbWUsIHBhY2thZ2VBbGlhc2VzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2ZpbGVOYW1lfSR7bW9kdWxlRXh0ZW5zaW9ufSR7ZmlsZUV4dGVuc2lvbn1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCArPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtmaWxlTmFtZX0ke21vZHVsZUV4dGVuc2lvbn0ke2ZpbGVFeHRlbnNpb259YFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGgsIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKGN1cnJlbnRNb2R1bGVGaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEByZXR1cm5zIFRoZSBhbGlhcyBhcHBsaWVkIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlBbGlhc2VzKG1vZHVsZUlEOnN0cmluZywgYWxpYXNlczpQbGFpbk9iamVjdCk6c3RyaW5nIHtcbiAgICAgICAgZm9yIChjb25zdCBhbGlhczpzdHJpbmcgaW4gYWxpYXNlcylcbiAgICAgICAgICAgIGlmIChhbGlhcy5lbmRzV2l0aCgnJCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZUlEID09PSBhbGlhcy5zdWJzdHJpbmcoMCwgYWxpYXMubGVuZ3RoIC0gMSkpXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gYWxpYXNlc1thbGlhc11cbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQucmVwbGFjZShhbGlhcywgYWxpYXNlc1thbGlhc10pXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gcmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIHRoZWlyXG4gICAgICogY29ycmVzcG9uZGluZyByZXBsYWNlbWVudHMuXG4gICAgICogQHJldHVybnMgVGhlIHJlcGxhY2VtZW50IGFwcGxpZWQgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgbW9kdWxlSUQ6c3RyaW5nLCByZXBsYWNlbWVudHM6UGxhaW5PYmplY3RcbiAgICApOnN0cmluZyB7XG4gICAgICAgIGZvciAoY29uc3QgcmVwbGFjZW1lbnQ6c3RyaW5nIGluIHJlcGxhY2VtZW50cylcbiAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudHMuaGFzT3duUHJvcGVydHkocmVwbGFjZW1lbnQpKVxuICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlZ0V4cChyZXBsYWNlbWVudCksIHJlcGxhY2VtZW50c1tyZXBsYWNlbWVudF0pXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSBuZWFyZXN0IHBhY2thZ2UgY29uZmlndXJhdGlvbiBmaWxlIGZyb20gZ2l2ZW4gZmlsZSBwYXRoLlxuICAgICAqIEBwYXJhbSBzdGFydCAtIFJlZmVyZW5jZSBsb2NhdGlvbiB0byBzZWFyY2ggZnJvbS5cbiAgICAgKiBAcGFyYW0gZmlsZU5hbWUgLSBQYWNrYWdlIGNvbmZpZ3VyYXRpb24gZmlsZSBuYW1lLlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBmaW5kUGFja2FnZURlc2NyaXB0b3JGaWxlUGF0aChcbiAgICAgICAgc3RhcnQ6QXJyYXk8c3RyaW5nPnxzdHJpbmcsIGZpbGVOYW1lOnN0cmluZyA9ICdwYWNrYWdlLmpzb24nXG4gICAgKTpudWxsfHN0cmluZyB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRbc3RhcnQubGVuZ3RoIC0gMV0gIT09IHBhdGguc2VwKVxuICAgICAgICAgICAgICAgIHN0YXJ0ICs9IHBhdGguc2VwXG4gICAgICAgICAgICBzdGFydCA9IHN0YXJ0LnNwbGl0KHBhdGguc2VwKVxuICAgICAgICB9XG4gICAgICAgIGlmICghc3RhcnQubGVuZ3RoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgc3RhcnQucG9wKClcbiAgICAgICAgY29uc3QgcmVzdWx0OnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIHN0YXJ0LmpvaW4ocGF0aC5zZXApLCBmaWxlTmFtZSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtLmV4aXN0c1N5bmMocmVzdWx0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICByZXR1cm4gSGVscGVyLmZpbmRQYWNrYWdlRGVzY3JpcHRvckZpbGVQYXRoKHN0YXJ0LCBmaWxlTmFtZSlcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgbmVhcmVzdCBwYWNrYWdlIGNvbmZpZ3VyYXRpb24gZnJvbSBnaXZlbiBtb2R1bGUgZmlsZVxuICAgICAqIHBhdGguXG4gICAgICogQHBhcmFtIG1vZHVsZVBhdGggLSBNb2R1bGUgcGF0aCB0byB0YWtlIGFzIHJlZmVyZW5jZSBsb2NhdGlvbiAobGVhZiBpblxuICAgICAqIHRyZWUpLlxuICAgICAqIEBwYXJhbSBmaWxlTmFtZSAtIFBhY2thZ2UgY29uZmlndXJhdGlvbiBmaWxlIG5hbWUuXG4gICAgICogQHJldHVybnMgQSBvYmplY3QgY29udGFpbmluZyBmb3VuZCBwYXJzZWQgY29uZmlndXJhdGlvbiBhbiB0aGVpclxuICAgICAqIGNvcnJlc3BvbmRpbmcgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRDbG9zZXN0UGFja2FnZURlc2NyaXB0b3IoXG4gICAgICAgIG1vZHVsZVBhdGg6c3RyaW5nLCBmaWxlTmFtZTpzdHJpbmcgPSAncGFja2FnZS5qc29uJ1xuICAgICk6bnVsbHxQbGFpbk9iamVjdCB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoOm51bGx8c3RyaW5nID0gSGVscGVyLmZpbmRQYWNrYWdlRGVzY3JpcHRvckZpbGVQYXRoKFxuICAgICAgICAgICAgbW9kdWxlUGF0aCwgZmlsZU5hbWUpXG4gICAgICAgIGlmICghZmlsZVBhdGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBjb25zdCBjb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0gZXZhbCgncmVxdWlyZScpKGZpbGVQYXRoKVxuICAgICAgICAvKlxuICAgICAgICAgICAgSWYgdGhlIHBhY2thZ2UuanNvbiBkb2VzIG5vdCBoYXZlIGEgbmFtZSBwcm9wZXJ0eSwgdHJ5IGFnYWluIGZyb21cbiAgICAgICAgICAgIG9uZSBsZXZlbCBoaWdoZXIuXG4gICAgICAgICovXG4gICAgICAgIGlmICghY29uZmlndXJhdGlvbi5uYW1lKVxuICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5nZXRDbG9zZXN0UGFja2FnZURlc2NyaXB0b3IoXG4gICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShmaWxlUGF0aCksICcuLicpLCBmaWxlTmFtZSlcbiAgICAgICAgcmV0dXJuIHtjb25maWd1cmF0aW9uLCBmaWxlUGF0aH1cbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBIZWxwZXJcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=