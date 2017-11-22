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
exports.Helper = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _jsdom = require('jsdom');

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path3 = require('path');

var _path4 = _interopRequireDefault(_path3);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}

// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
var Helper = exports.Helper = function () {
    function Helper() {
        (0, _classCallCheck3.default)(this, Helper);
    }

    (0, _createClass3.default)(Helper, null, [{
        key: 'isFilePathInLocation',

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
                for (var _iterator = (0, _getIterator3.default)(locationsToCheck), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var pathToCheck = _step.value;

                    if (_path4.default.resolve(filePath).startsWith(_path4.default.resolve(pathToCheck))) return true;
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

            return false;
        }
        // endregion
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
        key: 'inPlaceCSSAndJavaScriptAssetReferences',
        value: function inPlaceCSSAndJavaScriptAssetReferences(content, cascadingStyleSheetPattern, javaScriptPattern, basePath, cascadingStyleSheetChunkNameTemplate, javaScriptChunkNameTemplate, assets) {
            /*
                NOTE: We have to translate template delimiter to html compatible
                sequences and translate it back later to avoid unexpected escape
                sequences in resulting html.
            */
            return new _promise2.default(function (resolve, reject) {
                var window = void 0;
                try {
                    window = new _jsdom.JSDOM(content.replace(/<%/g, '##+#+#+##').replace(/%>/g, '##-#-#-##')).window;
                } catch (error) {
                    return reject(error);
                }
                var filePathsToRemove = [];
                if (cascadingStyleSheetPattern) for (var pattern in cascadingStyleSheetPattern) {
                    if (!cascadingStyleSheetPattern.hasOwnProperty(pattern)) continue;
                    var selector = '[href*=".css"]';
                    if (pattern !== '*') selector = '[href="' + _path4.default.relative(basePath, Helper.renderFilePathTemplate(cascadingStyleSheetChunkNameTemplate, {
                        '[contenthash]': '',
                        '[id]': pattern,
                        '[name]': pattern
                    })) + '"]';
                    var domNodes = window.document.querySelectorAll('link' + selector);
                    if (domNodes.length) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = (0, _getIterator3.default)(domNodes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var domNode = _step2.value;

                                var inPlaceDomNode = window.document.createElement('style');
                                var _path = domNode.attributes.href.value.replace(/&.*/g, '');
                                if (!assets.hasOwnProperty(_path)) continue;
                                inPlaceDomNode.textContent = assets[_path].source();
                                if (cascadingStyleSheetPattern[pattern] === 'body') window.document.body.appendChild(inPlaceDomNode);else if (cascadingStyleSheetPattern[pattern] === 'in') domNode.parentNode.insertBefore(inPlaceDomNode, domNode);else if (cascadingStyleSheetPattern[pattern] === 'head') window.document.head.appendChild(inPlaceDomNode);
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
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    } else console.warn('No referenced cascading style sheet file in ' + 'resulting markup found with selector: link' + selector);
                }
                if (javaScriptPattern) for (var _pattern in javaScriptPattern) {
                    if (!javaScriptPattern.hasOwnProperty(_pattern)) continue;
                    var _selector = '[href*=".js"]';
                    if (_pattern !== '*') _selector = '[src^="' + _path4.default.relative(basePath, Helper.renderFilePathTemplate(javaScriptChunkNameTemplate, {
                        '[hash]': '',
                        '[id]': _pattern,
                        '[name]': _pattern
                    }) + '"]');
                    var _domNodes = window.document.querySelectorAll('script' + _selector);
                    if (_domNodes.length) {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = (0, _getIterator3.default)(_domNodes), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var _domNode = _step3.value;

                                var _inPlaceDomNode = window.document.createElement('script');
                                var _path2 = _domNode.attributes.src.value.replace(/&.*/g, '');
                                if (!assets.hasOwnProperty(_path2)) continue;
                                _inPlaceDomNode.textContent = assets[_path2].source();
                                if (javaScriptPattern[_pattern] === 'body') window.document.body.appendChild(_inPlaceDomNode);else if (javaScriptPattern[_pattern] === 'in') _domNode.parentNode.insertBefore(_inPlaceDomNode, _domNode);else if (javaScriptPattern[_pattern] === 'head') window.document.head.appendChild(_inPlaceDomNode);
                                _domNode.parentNode.removeChild(_domNode);
                                /*
                                    NOTE: This doesn't prevent webpack from
                                    creating this file if present in another chunk
                                    so removing it (and a potential source map
                                    file) later in the "done" hook.
                                */
                                filePathsToRemove.push(Helper.stripLoader(_path2));
                                delete assets[_path2];
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }
                    } else console.warn('No referenced javaScript file in resulting ' + ('markup found with selector: script' + _selector));
                }
                resolve({
                    content: content.replace(/^(\s*<!doctype [^>]+?>\s*)[\s\S]*$/i, '$1') + window.document.documentElement.outerHTML.replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>'),
                    filePathsToRemove: filePathsToRemove
                });
            });
        }
        /**
         * Strips loader informations form given module request including loader
         * prefix and query parameter.
         * @param moduleID - Module request to strip.
         * @returns Given module id stripped.
         */

    }, {
        key: 'stripLoader',
        value: function stripLoader(moduleID) {
            moduleID = moduleID.toString();
            var moduleIDWithoutLoader = moduleID.substring(moduleID.lastIndexOf('!') + 1);
            return moduleIDWithoutLoader.includes('?') ? moduleIDWithoutLoader.substring(0, moduleIDWithoutLoader.indexOf('?')) : moduleIDWithoutLoader;
        }
        // endregion
        // region array
        /**
         * Converts given list of path to a normalized list with unique values.
         * @param paths - File paths.
         * @returns The given file path list with normalized unique values.
         */

    }, {
        key: 'normalizePaths',
        value: function normalizePaths(paths) {
            return (0, _from2.default)(new _set2.default(paths.map(function (givenPath) {
                givenPath = _path4.default.normalize(givenPath);
                if (givenPath.endsWith('/')) return givenPath.substring(0, givenPath.length - 1);
                return givenPath;
            })));
        }
        // endregion
        // region file handler
        /**
         * Applies file path/name placeholder replacements with given bundle
         * associated informations.
         * @param filePathTemplate - File path to process placeholder in.
         * @param informations - Scope to use for processing.
         * @returns Processed file path.
         */

    }, {
        key: 'renderFilePathTemplate',
        value: function renderFilePathTemplate(filePathTemplate) {
            var informations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
                '[name]': '.__dummy__', '[id]': '.__dummy__',
                '[hash]': '.__dummy__'
            };

            var filePath = filePathTemplate;
            for (var placeholderName in informations) {
                if (informations.hasOwnProperty(placeholderName)) filePath = filePath.replace(new RegExp(_clientnode2.default.stringEscapeRegularExpressions(placeholderName), 'g'), informations[placeholderName]);
            }return filePath;
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
         * @param relativeModuleFilePaths - List of relative file path to search
         * for modules in.
         * @returns A new resolved request.
         */

    }, {
        key: 'applyContext',
        value: function applyContext(request) {
            var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
            var referencePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : './';
            var aliases = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var moduleReplacements = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
            var relativeModuleFilePaths = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : ['node_modules'];

            referencePath = _path4.default.resolve(referencePath);
            if (request.startsWith('./') && _path4.default.resolve(context) !== referencePath) {
                request = _path4.default.resolve(context, request);
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = (0, _getIterator3.default)(relativeModuleFilePaths), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var modulePath = _step4.value;

                        var pathPrefix = _path4.default.resolve(referencePath, modulePath);
                        if (request.startsWith(pathPrefix)) {
                            request = request.substring(pathPrefix.length);
                            if (request.startsWith('/')) request = request.substring(1);
                            return Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
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
         * @param normalizedInternalInjection - Mapping of chunk names to modules
         * which should be injected.
         * @param externalModuleLocations - Array if paths where external modules
         * take place.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of replacements to take into
         * account.
         * @param extensions - List of file and module extensions to take into
         * account.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - List of relative file path to search
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
        key: 'determineExternalRequest',
        value: function determineExternalRequest(request) {
            var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
            var requestContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : './';
            var normalizedInternalInjection = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var externalModuleLocations = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ['node_modules'];
            var aliases = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
            var moduleReplacements = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
            var extensions = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : {
                file: {
                    external: ['.js'],
                    internal: ['.js', '.json', '.css', '.eot', '.gif', '.html', '.ico', '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2']
                }, module: []
            };
            var referencePath = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : './';
            var pathsToIgnore = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['.git'];
            var relativeModuleFilePaths = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : ['node_modules'];
            var packageEntryFileNames = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : ['index', 'main'];
            var packageMainPropertyNames = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : ['main', 'module'];
            var packageAliasPropertyNames = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : [];
            var includePattern = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : [];
            var excludePattern = arguments.length > 15 && arguments[15] !== undefined ? arguments[15] : [];
            var inPlaceNormalLibrary = arguments.length > 16 && arguments[16] !== undefined ? arguments[16] : false;
            var inPlaceDynamicLibrary = arguments.length > 17 && arguments[17] !== undefined ? arguments[17] : true;
            var encoding = arguments.length > 18 && arguments[18] !== undefined ? arguments[18] : 'utf-8';

            context = _path4.default.resolve(context);
            requestContext = _path4.default.resolve(requestContext);
            referencePath = _path4.default.resolve(referencePath);
            // NOTE: We apply alias on externals additionally.
            var resolvedRequest = Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
            /*
                NOTE: Aliases and module replacements doesn't have to be forwarded
                since we pass an already resolved request.
            */
            var filePath = Helper.determineModuleFilePath(resolvedRequest, {}, {}, extensions, context, requestContext, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
            /*
                NOTE: We mark dependencies as external if there file couldn't be
                resolved or are specified to be external explicitly.
            */
            if (!(filePath || inPlaceNormalLibrary) || _clientnode2.default.isAnyMatching(resolvedRequest, includePattern)) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleFilePaths);
            if (_clientnode2.default.isAnyMatching(resolvedRequest, excludePattern)) return null;
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var moduleID = _step5.value;

                            if (Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, requestContext, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding) === filePath) return null;
                        }
                    } catch (err) {
                        _didIteratorError5 = true;
                        _iteratorError5 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                _iterator5.return();
                            }
                        } finally {
                            if (_didIteratorError5) {
                                throw _iteratorError5;
                            }
                        }
                    }
                }
            } /*
                  NOTE: We mark dependencies as external if they does not contain a
                  loader in their request and aren't part of the current main package
                  or have a file extension other than javaScript aware.
              */
            if (!inPlaceNormalLibrary && (extensions.file.external.length === 0 || filePath && extensions.file.external.includes(_path4.default.extname(filePath)) || !filePath && extensions.file.external.includes('')) && !(inPlaceDynamicLibrary && request.includes('!')) && (!filePath && inPlaceDynamicLibrary || filePath && (!filePath.startsWith(context) || Helper.isFilePathInLocation(filePath, externalModuleLocations)))) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleFilePaths);
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
        key: 'determineAssetType',
        value: function determineAssetType(filePath, buildConfiguration, paths) {
            var result = null;
            for (var type in buildConfiguration) {
                if (_path4.default.extname(filePath) === '.' + buildConfiguration[type].extension) {
                    result = type;
                    break;
                }
            }if (!result) {
                var _arr = ['source', 'target'];

                for (var _i = 0; _i < _arr.length; _i++) {
                    var _type = _arr[_i];
                    for (var assetType in paths[_type].asset) {
                        if (paths[_type].asset.hasOwnProperty(assetType) && assetType !== 'base' && paths[_type].asset[assetType] && filePath.startsWith(paths[_type].asset[assetType])) return assetType;
                    }
                }
            }return result;
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
        key: 'resolveBuildConfigurationFilePaths',
        value: function resolveBuildConfigurationFilePaths(configuration) {
            var entryPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';
            var pathsToIgnore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['.git'];
            var mainFileBasenames = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : ['index', 'main'];

            var buildConfiguration = [];
            for (var type in configuration) {
                if (configuration.hasOwnProperty(type)) {
                    var newItem = _clientnode2.default.extendObject(true, { filePaths: [] }, configuration[type]);
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = (0, _getIterator3.default)(_clientnode2.default.walkDirectoryRecursivelySync(entryPath, function (file) {
                            if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
                        })), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var file = _step6.value;

                            if (file.stat.isFile() && _path4.default.extname(file.path).substring(1) === newItem.extension && !new RegExp(newItem.filePathPattern).test(file.path)) newItem.filePaths.push(file.path);
                        }
                    } catch (err) {
                        _didIteratorError6 = true;
                        _iteratorError6 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                _iterator6.return();
                            }
                        } finally {
                            if (_didIteratorError6) {
                                throw _iteratorError6;
                            }
                        }
                    }

                    newItem.filePaths.sort(function (firstFilePath, secondFilePath) {
                        if (mainFileBasenames.includes(_path4.default.basename(firstFilePath, _path4.default.extname(firstFilePath)))) {
                            if (mainFileBasenames.includes(_path4.default.basename(secondFilePath, _path4.default.extname(secondFilePath)))) return 0;
                        } else if (mainFileBasenames.includes(_path4.default.basename(secondFilePath, _path4.default.extname(secondFilePath)))) return 1;
                        return 0;
                    });
                    buildConfiguration.push(newItem);
                }
            }return buildConfiguration.sort(function (first, second) {
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
         * @param internalInjection - List of module ids or module file paths.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of module replacements to take into
         * account.
         * @param extensions - List of file and module extensions to take into
         * account.
         * @param context - File path to resolve relative to.
         * @param referencePath - Path to search for local modules.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - List of relative file path to search
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
        key: 'determineModuleLocations',
        value: function determineModuleLocations(internalInjection) {
            var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var extensions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
                file: {
                    external: ['.js'],
                    internal: ['.js', '.json', '.css', '.eot', '.gif', '.html', '.ico', '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2']
                }, module: []
            };
            var context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : './';
            var referencePath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
            var pathsToIgnore = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : ['.git'];
            var relativeModuleFilePaths = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : ['', 'node_modules', '../'];
            var packageEntryFileNames = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['__package__', '', 'index', 'main'];
            var packageMainPropertyNames = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['main', 'module'];
            var packageAliasPropertyNames = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];
            var encoding = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 'utf-8';

            var filePaths = [];
            var directoryPaths = [];
            var normalizedInternalInjection = Helper.resolveModulesInFolders(Helper.normalizeInternalInjection(internalInjection), aliases, moduleReplacements, context, referencePath, pathsToIgnore);
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var moduleID = _step7.value;

                            var filePath = Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, referencePath, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
                            if (filePath) {
                                filePaths.push(filePath);
                                var directoryPath = _path4.default.dirname(filePath);
                                if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
                            }
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                _iterator7.return();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }
                }
            }return { filePaths: filePaths, directoryPaths: directoryPaths };
        }
        /**
         * Determines a list of concrete file paths for given module id pointing to
         * a folder which isn't a package.
         * @param normalizedInternalInjection - Injection data structure of
         * modules with folder references to resolve.
         * @param aliases - Mapping of aliases to take into account.
         * @param moduleReplacements - Mapping of replacements to take into
         * account.
         * @param context - File path to determine relative to.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @returns Given injections with resolved folder pointing modules.
         */

    }, {
        key: 'resolveModulesInFolders',
        value: function resolveModulesInFolders(normalizedInternalInjection) {
            var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : './';
            var referencePath = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
            var pathsToIgnore = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : ['.git'];

            if (referencePath.startsWith('/')) referencePath = _path4.default.relative(context, referencePath);
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var index = 0;
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var moduleID = _step8.value;

                            moduleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);
                            var resolvedPath = _path4.default.resolve(referencePath, moduleID);
                            if (_clientnode2.default.isDirectorySync(resolvedPath)) {
                                normalizedInternalInjection[chunkName].splice(index, 1);
                                var _iteratorNormalCompletion9 = true;
                                var _didIteratorError9 = false;
                                var _iteratorError9 = undefined;

                                try {
                                    for (var _iterator9 = (0, _getIterator3.default)(_clientnode2.default.walkDirectoryRecursivelySync(resolvedPath, function (file) {
                                        if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
                                    })), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                        var file = _step9.value;

                                        if (file.stat.isFile()) normalizedInternalInjection[chunkName].push('./' + _path4.default.relative(referencePath, _path4.default.resolve(resolvedPath, file.path)));
                                    }
                                } catch (err) {
                                    _didIteratorError9 = true;
                                    _iteratorError9 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                            _iterator9.return();
                                        }
                                    } finally {
                                        if (_didIteratorError9) {
                                            throw _iteratorError9;
                                        }
                                    }
                                }
                            } else if (moduleID.startsWith('./') && !moduleID.startsWith('./' + _path4.default.relative(context, referencePath))) normalizedInternalInjection[chunkName][index] = './' + _path4.default.relative(context, resolvedPath);
                            index += 1;
                        }
                    } catch (err) {
                        _didIteratorError8 = true;
                        _iteratorError8 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                _iterator8.return();
                            }
                        } finally {
                            if (_didIteratorError8) {
                                throw _iteratorError8;
                            }
                        }
                    }
                }
            }return normalizedInternalInjection;
        }
        /**
         * Every injection definition type can be represented as plain object
         * (mapping from chunk name to array of module ids). This method converts
         * each representation into the normalized plain object notation.
         * @param internalInjection - Given internal injection to normalize.
         * @returns Normalized representation of given internal injection.
         */

    }, {
        key: 'normalizeInternalInjection',
        value: function normalizeInternalInjection(internalInjection) {
            var result = {};
            if (internalInjection instanceof Object && _clientnode2.default.isPlainObject(internalInjection)) {
                var hasContent = false;
                var chunkNamesToDelete = [];
                for (var chunkName in internalInjection) {
                    if (internalInjection.hasOwnProperty(chunkName)) if (Array.isArray(internalInjection[chunkName])) {
                        if (internalInjection[chunkName].length > 0) {
                            hasContent = true;
                            result[chunkName] = internalInjection[chunkName];
                        } else chunkNamesToDelete.push(chunkName);
                    } else {
                        hasContent = true;
                        result[chunkName] = [internalInjection[chunkName]];
                    }
                }if (hasContent) {
                    var _iteratorNormalCompletion10 = true;
                    var _didIteratorError10 = false;
                    var _iteratorError10 = undefined;

                    try {
                        for (var _iterator10 = (0, _getIterator3.default)(chunkNamesToDelete), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                            var _chunkName = _step10.value;

                            delete result[_chunkName];
                        }
                    } catch (err) {
                        _didIteratorError10 = true;
                        _iteratorError10 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                _iterator10.return();
                            }
                        } finally {
                            if (_didIteratorError10) {
                                throw _iteratorError10;
                            }
                        }
                    }
                } else result = { index: [] };
            } else if (typeof internalInjection === 'string') result = { index: [internalInjection] };else if (Array.isArray(internalInjection)) result = { index: internalInjection };
            return result;
        }
        /**
         * Determines all concrete file paths for given injection which are marked
         * with the "__auto__" indicator.
         * @param givenInjection - Given internal and external injection to take
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
        key: 'resolveInjection',
        value: function resolveInjection(givenInjection, buildConfigurations, modulesToExclude) {
            var aliases = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var moduleReplacements = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
            var extensions = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
                file: {
                    external: ['.js'],
                    internal: ['.js', '.json', '.css', '.eot', '.gif', '.html', '.ico', '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2']
                }, module: []
            };
            var context = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : './';
            var referencePath = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '';
            var pathsToIgnore = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['.git'];

            var injection = _clientnode2.default.extendObject(true, {}, givenInjection);
            var moduleFilePathsToExclude = Helper.determineModuleLocations(modulesToExclude, aliases, moduleReplacements, extensions, context, referencePath, pathsToIgnore).filePaths;
            var _arr2 = ['internal', 'external'];
            for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                var type = _arr2[_i2];
                /* eslint-disable curly */
                if ((0, _typeof3.default)(injection[type]) === 'object') {
                    for (var chunkName in injection[type]) {
                        if (injection[type][chunkName] === '__auto__') {
                            injection[type][chunkName] = [];
                            var modules = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, referencePath);
                            for (var subChunkName in modules) {
                                if (modules.hasOwnProperty(subChunkName)) injection[type][chunkName].push(modules[subChunkName]);
                            } /*
                                  Reverse array to let javaScript and main files be
                                  the last ones to export them rather.
                              */
                            injection[type][chunkName].reverse();
                        }
                    }
                } else if (injection[type] === '__auto__')
                    /* eslint-enable curly */
                    injection[type] = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
            }return injection;
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
        key: 'getAutoChunk',
        value: function getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context) {
            var result = {};
            var injectedModuleIDs = {};
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = (0, _getIterator3.default)(buildConfigurations), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var buildConfiguration = _step11.value;

                    if (!injectedModuleIDs[buildConfiguration.outputExtension]) injectedModuleIDs[buildConfiguration.outputExtension] = [];
                    var _iteratorNormalCompletion12 = true;
                    var _didIteratorError12 = false;
                    var _iteratorError12 = undefined;

                    try {
                        for (var _iterator12 = (0, _getIterator3.default)(buildConfiguration.filePaths), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                            var moduleFilePath = _step12.value;

                            if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                                var relativeModuleFilePath = './' + _path4.default.relative(context, moduleFilePath);
                                var directoryPath = _path4.default.dirname(relativeModuleFilePath);
                                var baseName = _path4.default.basename(relativeModuleFilePath, '.' + buildConfiguration.extension);
                                var moduleID = baseName;
                                if (directoryPath !== '.') moduleID = _path4.default.join(directoryPath, baseName);
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
                            if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                _iterator12.return();
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
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
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
         * @param relativeModuleFilePaths - List of relative file path to search
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
        key: 'determineModuleFilePath',
        value: function determineModuleFilePath(moduleID) {
            var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var moduleReplacements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var extensions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
                file: {
                    external: ['.js'],
                    internal: ['.js', '.json', '.css', '.eot', '.gif', '.html', '.ico', '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2']
                }, module: []
            };
            var context = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : './';
            var referencePath = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';
            var pathsToIgnore = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : ['.git'];
            var relativeModuleFilePaths = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : ['node_modules'];
            var packageEntryFileNames = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : ['index'];
            var packageMainPropertyNames = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : ['main'];
            var packageAliasPropertyNames = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : [];
            var encoding = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 'utf-8';

            moduleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);
            if (!moduleID) return null;
            var moduleFilePath = moduleID;
            if (moduleFilePath.startsWith('./')) moduleFilePath = _path4.default.join(referencePath, moduleFilePath);
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = (0, _getIterator3.default)([referencePath].concat(relativeModuleFilePaths.map(function (filePath) {
                    return _path4.default.resolve(context, filePath);
                }))), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var moduleLocation = _step13.value;
                    var _iteratorNormalCompletion14 = true;
                    var _didIteratorError14 = false;
                    var _iteratorError14 = undefined;

                    try {
                        for (var _iterator14 = (0, _getIterator3.default)(['', '__package__'].concat(packageEntryFileNames)), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                            var fileName = _step14.value;
                            var _iteratorNormalCompletion15 = true;
                            var _didIteratorError15 = false;
                            var _iteratorError15 = undefined;

                            try {
                                for (var _iterator15 = (0, _getIterator3.default)(extensions.module.concat([''])), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                                    var moduleExtension = _step15.value;
                                    var _iteratorNormalCompletion16 = true;
                                    var _didIteratorError16 = false;
                                    var _iteratorError16 = undefined;

                                    try {
                                        for (var _iterator16 = (0, _getIterator3.default)([''].concat(extensions.file.internal)), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                                            var fileExtension = _step16.value;

                                            var currentModuleFilePath = void 0;
                                            if (moduleFilePath.startsWith('/')) currentModuleFilePath = _path4.default.resolve(moduleFilePath);else currentModuleFilePath = _path4.default.resolve(moduleLocation, moduleFilePath);
                                            var packageAliases = {};
                                            if (fileName === '__package__') {
                                                if (_clientnode2.default.isDirectorySync(currentModuleFilePath)) {
                                                    var pathToPackageJSON = _path4.default.resolve(currentModuleFilePath, 'package.json');
                                                    if (_clientnode2.default.isFileSync(pathToPackageJSON)) {
                                                        var localConfiguration = {};
                                                        try {
                                                            localConfiguration = JSON.parse(fileSystem.readFileSync(pathToPackageJSON, { encoding: encoding }));
                                                        } catch (error) {}
                                                        var _iteratorNormalCompletion17 = true;
                                                        var _didIteratorError17 = false;
                                                        var _iteratorError17 = undefined;

                                                        try {
                                                            for (var _iterator17 = (0, _getIterator3.default)(packageMainPropertyNames), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                                                                var propertyName = _step17.value;

                                                                if (localConfiguration.hasOwnProperty(propertyName) && typeof localConfiguration[propertyName] === 'string' && localConfiguration[propertyName]) {
                                                                    fileName = localConfiguration[propertyName];
                                                                    break;
                                                                }
                                                            }
                                                        } catch (err) {
                                                            _didIteratorError17 = true;
                                                            _iteratorError17 = err;
                                                        } finally {
                                                            try {
                                                                if (!_iteratorNormalCompletion17 && _iterator17.return) {
                                                                    _iterator17.return();
                                                                }
                                                            } finally {
                                                                if (_didIteratorError17) {
                                                                    throw _iteratorError17;
                                                                }
                                                            }
                                                        }

                                                        var _iteratorNormalCompletion18 = true;
                                                        var _didIteratorError18 = false;
                                                        var _iteratorError18 = undefined;

                                                        try {
                                                            for (var _iterator18 = (0, _getIterator3.default)(packageAliasPropertyNames), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                                                                var _propertyName = _step18.value;

                                                                if (localConfiguration.hasOwnProperty(_propertyName) && (0, _typeof3.default)(localConfiguration[_propertyName]) === 'object') {
                                                                    packageAliases = localConfiguration[_propertyName];
                                                                    break;
                                                                }
                                                            }
                                                        } catch (err) {
                                                            _didIteratorError18 = true;
                                                            _iteratorError18 = err;
                                                        } finally {
                                                            try {
                                                                if (!_iteratorNormalCompletion18 && _iterator18.return) {
                                                                    _iterator18.return();
                                                                }
                                                            } finally {
                                                                if (_didIteratorError18) {
                                                                    throw _iteratorError18;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                if (fileName === '__package__') continue;
                                            }
                                            fileName = Helper.applyModuleReplacements(Helper.applyAliases(fileName, packageAliases), moduleReplacements);
                                            if (fileName) currentModuleFilePath = _path4.default.resolve(currentModuleFilePath, '' + fileName + moduleExtension + fileExtension);else currentModuleFilePath += '' + fileName + moduleExtension + fileExtension;
                                            if (Helper.isFilePathInLocation(currentModuleFilePath, pathsToIgnore)) continue;
                                            if (_clientnode2.default.isFileSync(currentModuleFilePath)) return currentModuleFilePath;
                                        }
                                    } catch (err) {
                                        _didIteratorError16 = true;
                                        _iteratorError16 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                                _iterator16.return();
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
                                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                        _iterator15.return();
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
                            if (!_iteratorNormalCompletion14 && _iterator14.return) {
                                _iterator14.return();
                            }
                        } finally {
                            if (_didIteratorError14) {
                                throw _iteratorError14;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
                        _iterator13.return();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            return null;
        }
        // endregion
        /**
         * Determines a concrete file path for given module id.
         * @param moduleID - Module id to determine.
         * @param aliases - Mapping of aliases to take into account.
         * @returns The alias applied given module id.
         */

    }, {
        key: 'applyAliases',
        value: function applyAliases(moduleID, aliases) {
            for (var alias in aliases) {
                if (alias.endsWith('$')) {
                    if (moduleID === alias.substring(0, alias.length - 1)) moduleID = aliases[alias];
                } else moduleID = moduleID.replace(alias, aliases[alias]);
            }return moduleID;
        }
        /**
         * Determines a concrete file path for given module id.
         * @param moduleID - Module id to determine.
         * @param replacements - Mapping of regular expressions to their
         * corresponding replacements.
         * @returns The replacement applied given module id.
         */

    }, {
        key: 'applyModuleReplacements',
        value: function applyModuleReplacements(moduleID, replacements) {
            for (var replacement in replacements) {
                if (replacements.hasOwnProperty(replacement)) moduleID = moduleID.replace(new RegExp(replacement), replacements[replacement]);
            }return moduleID;
        }
    }]);
    return Helper;
}();

exports.default = Helper;
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFOLENBQWdCLENBQWhCLEVBQW1CLE1BQU0sTUFBTixHQUFlLENBQWxDLENBQWpCLEVBQ0ksV0FBVyxRQUFRLEtBQVIsQ0FBWDtBQUNQLGlCQUhELE1BSUksV0FBVyxTQUFTLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0IsUUFBUSxLQUFSLENBQXhCLENBQVg7QUFMUixhQU1BLE9BQU8sUUFBUDtBQUNIO0FBQ0Q7Ozs7Ozs7Ozs7Z0RBUUksUSxFQUFpQixZLEVBQ1o7QUFDTCxpQkFBSyxJQUFNLFdBQVgsSUFBaUMsWUFBakM7QUFDSSxvQkFBSSxhQUFhLGNBQWIsQ0FBNEIsV0FBNUIsQ0FBSixFQUNJLFdBQVcsU0FBUyxPQUFULENBQ1AsSUFBSSxNQUFKLENBQVcsV0FBWCxDQURPLEVBQ2tCLGFBQWEsV0FBYixDQURsQixDQUFYO0FBRlIsYUFJQSxPQUFPLFFBQVA7QUFDSDs7Ozs7a0JBRVUsTTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiaGVscGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHR5cGUge0RvbU5vZGV9IGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB0eXBlIHtGaWxlLCBQbGFpbk9iamVjdCwgV2luZG93fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHtKU0RPTSBhcyBET019IGZyb20gJ2pzZG9tJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuXG5pbXBvcnQgdHlwZSB7XG4gICAgQnVpbGRDb25maWd1cmF0aW9uLFxuICAgIEV4dGVuc2lvbnMsXG4gICAgSW5qZWN0aW9uLFxuICAgIEludGVybmFsSW5qZWN0aW9uLFxuICAgIE5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbixcbiAgICBQYXRoLFxuICAgIFJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uLFxuICAgIFJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbVxufSBmcm9tICcuL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBtZXRob2RzXG4vKipcbiAqIFByb3ZpZGVzIGEgY2xhc3Mgb2Ygc3RhdGljIG1ldGhvZHMgd2l0aCBnZW5lcmljIHVzZSBjYXNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEhlbHBlciB7XG4gICAgLy8gcmVnaW9uIGJvb2xlYW5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgZ2l2ZW4gZmlsZSBwYXRoIGlzIHdpdGhpbiBnaXZlbiBsaXN0IG9mIGZpbGVcbiAgICAgKiBsb2NhdGlvbnMuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIC0gUGF0aCB0byBmaWxlIHRvIGNoZWNrLlxuICAgICAqIEBwYXJhbSBsb2NhdGlvbnNUb0NoZWNrIC0gTG9jYXRpb25zIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEByZXR1cm5zIFZhbHVlIFwidHJ1ZVwiIGlmIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gb25lIG9mIGdpdmVuXG4gICAgICogbG9jYXRpb25zIG9yIFwiZmFsc2VcIiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgc3RhdGljIGlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIGxvY2F0aW9uc1RvQ2hlY2s6QXJyYXk8c3RyaW5nPlxuICAgICk6Ym9vbGVhbiB7XG4gICAgICAgIGZvciAoY29uc3QgcGF0aFRvQ2hlY2s6c3RyaW5nIG9mIGxvY2F0aW9uc1RvQ2hlY2spXG4gICAgICAgICAgICBpZiAocGF0aC5yZXNvbHZlKGZpbGVQYXRoKS5zdGFydHNXaXRoKHBhdGgucmVzb2x2ZShwYXRoVG9DaGVjaykpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gc3RyaW5nXG4gICAgLyoqXG4gICAgICogSW4gcGxhY2VzIGVhY2ggbWF0Y2hpbmcgY2FzY2FkaW5nIHN0eWxlIHNoZWV0IG9yIGphdmFTY3JpcHQgZmlsZVxuICAgICAqIHJlZmVyZW5jZS5cbiAgICAgKiBAcGFyYW0gY29udGVudCAtIE1hcmt1cCBjb250ZW50IHRvIHByb2Nlc3MuXG4gICAgICogQHBhcmFtIGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuIC0gUGF0dGVybiB0byBtYXRjaCBjYXNjYWRpbmcgc3R5bGVcbiAgICAgKiBzaGVldCBhc3NldCByZWZlcmVuY2VzIGFnYWluLlxuICAgICAqIEBwYXJhbSBqYXZhU2NyaXB0UGF0dGVybiAtIFBhdHRlcm4gdG8gbWF0Y2ggamF2YVNjcmlwdCBhc3NldCByZWZlcmVuY2VzXG4gICAgICogYWdhaW4uXG4gICAgICogQHBhcmFtIGJhc2VQYXRoIC0gQmFzZSBwYXRoIHRvIHVzZSBhcyBwcmVmaXggZm9yIGZpbGUgcmVmZXJlbmNlcy5cbiAgICAgKiBAcGFyYW0gY2FzY2FkaW5nU3R5bGVTaGVldENodW5rTmFtZVRlbXBsYXRlIC0gQ2FzY2FkaW5nIHN0eWxlIHNoZWV0XG4gICAgICogY2h1bmsgbmFtZSB0ZW1wbGF0ZSB0byB1c2UgZm9yIGFzc2V0IG1hdGNoaW5nLlxuICAgICAqIEBwYXJhbSBqYXZhU2NyaXB0Q2h1bmtOYW1lVGVtcGxhdGUgLSBKYXZhU2NyaXB0IGNodW5rIG5hbWUgdGVtcGxhdGUgdG9cbiAgICAgKiB1c2UgZm9yIGFzc2V0IG1hdGNoaW5nLlxuICAgICAqIEBwYXJhbSBhc3NldHMgLSBNYXBwaW5nIG9mIGFzc2V0IGZpbGUgcGF0aHMgdG8gdGhlaXIgY29udGVudC5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBhbiB0cmFuc2Zvcm1lZCBtYXJrdXAuXG4gICAgICovXG4gICAgc3RhdGljIGluUGxhY2VDU1NBbmRKYXZhU2NyaXB0QXNzZXRSZWZlcmVuY2VzKFxuICAgICAgICBjb250ZW50OnN0cmluZyxcbiAgICAgICAgY2FzY2FkaW5nU3R5bGVTaGVldFBhdHRlcm46P3tba2V5OnN0cmluZ106J2JvZHknfCdoZWFkJ3wnaW4nfSxcbiAgICAgICAgamF2YVNjcmlwdFBhdHRlcm46P3tba2V5OnN0cmluZ106J2JvZHknfCdoZWFkJ3wnaW4nfSwgYmFzZVBhdGg6c3RyaW5nLFxuICAgICAgICBjYXNjYWRpbmdTdHlsZVNoZWV0Q2h1bmtOYW1lVGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBqYXZhU2NyaXB0Q2h1bmtOYW1lVGVtcGxhdGU6c3RyaW5nLCBhc3NldHM6e1trZXk6c3RyaW5nXTpPYmplY3R9XG4gICAgKTpQcm9taXNlPHtjb250ZW50OnN0cmluZztmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+O30+IHtcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gdHJhbnNsYXRlIHRlbXBsYXRlIGRlbGltaXRlciB0byBodG1sIGNvbXBhdGlibGVcbiAgICAgICAgICAgIHNlcXVlbmNlcyBhbmQgdHJhbnNsYXRlIGl0IGJhY2sgbGF0ZXIgdG8gYXZvaWQgdW5leHBlY3RlZCBlc2NhcGVcbiAgICAgICAgICAgIHNlcXVlbmNlcyBpbiByZXN1bHRpbmcgaHRtbC5cbiAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgbGV0IHdpbmRvdzpXaW5kb3dcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgd2luZG93ID0gKG5ldyBET00oY29udGVudC5yZXBsYWNlKC88JS9nLCAnIyMrIysjKyMjJykucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLyU+L2csICcjIy0jLSMtIyMnXG4gICAgICAgICAgICAgICAgKSkpLndpbmRvd1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgICAgICBpZiAoY2FzY2FkaW5nU3R5bGVTaGVldFBhdHRlcm4pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuOnN0cmluZyBpbiBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuLmhhc093blByb3BlcnR5KHBhdHRlcm4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yOnN0cmluZyA9ICdbaHJlZio9XCIuY3NzXCJdJ1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0dGVybiAhPT0gJyonKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnW2hyZWY9XCInICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCwgSGVscGVyLnJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tjb250ZW50aGFzaF0nOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbaWRdJzogcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbbmFtZV0nOiBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSArICdcIl0nXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGVzOkFycmF5PERvbU5vZGU+ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBsaW5rJHtzZWxlY3Rvcn1gKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tTm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBkb21Ob2RlOkRvbU5vZGUgb2YgZG9tTm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpblBsYWNlRG9tTm9kZTpEb21Ob2RlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoOnN0cmluZyA9IGRvbU5vZGUuYXR0cmlidXRlcy5ocmVmLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8mLiovZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFhc3NldHMuaGFzT3duUHJvcGVydHkocGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUudGV4dENvbnRlbnQgPSBhc3NldHNbcGF0aF0uc291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FzY2FkaW5nU3R5bGVTaGVldFBhdHRlcm5bcGF0dGVybl0gPT09ICdib2R5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gPT09ICdpbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gPT09ICdoZWFkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBUaGlzIGRvZXNuJ3QgcHJldmVudCB3ZWJwYWNrIGZyb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpbmcgdGhpcyBmaWxlIGlmIHByZXNlbnQgaW4gYW5vdGhlciBjaHVua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyByZW1vdmluZyBpdCAoYW5kIGEgcG90ZW50aWFsIHNvdXJjZSBtYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSkgbGF0ZXIgaW4gdGhlIFwiZG9uZVwiIGhvb2suXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZS5wdXNoKEhlbHBlci5zdHJpcExvYWRlcihwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXNzZXRzW3BhdGhdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTm8gcmVmZXJlbmNlZCBjYXNjYWRpbmcgc3R5bGUgc2hlZXQgZmlsZSBpbiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVzdWx0aW5nIG1hcmt1cCBmb3VuZCB3aXRoIHNlbGVjdG9yOiBsaW5rJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGphdmFTY3JpcHRQYXR0ZXJuKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcGF0dGVybjpzdHJpbmcgaW4gamF2YVNjcmlwdFBhdHRlcm4pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFqYXZhU2NyaXB0UGF0dGVybi5oYXNPd25Qcm9wZXJ0eShwYXR0ZXJuKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RvcjpzdHJpbmcgPSAnW2hyZWYqPVwiLmpzXCJdJ1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0dGVybiAhPT0gJyonKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSAnW3NyY149XCInICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCwgSGVscGVyLnJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGphdmFTY3JpcHRDaHVua05hbWVUZW1wbGF0ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1toYXNoXSc6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tpZF0nOiBwYXR0ZXJuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tuYW1lXSc6IHBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9tTm9kZXM6QXJyYXk8RG9tTm9kZT4gPVxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYHNjcmlwdCR7c2VsZWN0b3J9YClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbU5vZGVzLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZG9tTm9kZTpEb21Ob2RlIG9mIGRvbU5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5QbGFjZURvbU5vZGU6RG9tTm9kZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGg6c3RyaW5nID0gZG9tTm9kZS5hdHRyaWJ1dGVzLnNyYy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJi4qL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXNzZXRzLmhhc093blByb3BlcnR5KHBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLnRleHRDb250ZW50ID0gYXNzZXRzW3BhdGhdLnNvdXJjZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGphdmFTY3JpcHRQYXR0ZXJuW3BhdHRlcm5dID09PSAnYm9keScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoamF2YVNjcmlwdFBhdHRlcm5bcGF0dGVybl0gPT09ICdpbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChqYXZhU2NyaXB0UGF0dGVybltwYXR0ZXJuXSA9PT0gJ2hlYWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IFRoaXMgZG9lc24ndCBwcmV2ZW50IHdlYnBhY2sgZnJvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGluZyB0aGlzIGZpbGUgaWYgcHJlc2VudCBpbiBhbm90aGVyIGNodW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvIHJlbW92aW5nIGl0IChhbmQgYSBwb3RlbnRpYWwgc291cmNlIG1hcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlKSBsYXRlciBpbiB0aGUgXCJkb25lXCIgaG9vay5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoc1RvUmVtb3ZlLnB1c2goSGVscGVyLnN0cmlwTG9hZGVyKHBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhc3NldHNbcGF0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdObyByZWZlcmVuY2VkIGphdmFTY3JpcHQgZmlsZSBpbiByZXN1bHRpbmcgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYG1hcmt1cCBmb3VuZCB3aXRoIHNlbGVjdG9yOiBzY3JpcHQke3NlbGVjdG9yfWApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXihcXHMqPCFkb2N0eXBlIFtePl0rPz5cXHMqKVtcXHNcXFNdKiQvaSwgJyQxJ1xuICAgICAgICAgICAgICAgICkgKyB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvIyNcXCsjXFwrI1xcKyMjL2csICc8JSdcbiAgICAgICAgICAgICAgICApLnJlcGxhY2UoLyMjLSMtIy0jIy9nLCAnJT4nKSxcbiAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RyaXBzIGxvYWRlciBpbmZvcm1hdGlvbnMgZm9ybSBnaXZlbiBtb2R1bGUgcmVxdWVzdCBpbmNsdWRpbmcgbG9hZGVyXG4gICAgICogcHJlZml4IGFuZCBxdWVyeSBwYXJhbWV0ZXIuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIHJlcXVlc3QgdG8gc3RyaXAuXG4gICAgICogQHJldHVybnMgR2l2ZW4gbW9kdWxlIGlkIHN0cmlwcGVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBzdHJpcExvYWRlcihtb2R1bGVJRDpzdHJpbmd8U3RyaW5nKTpzdHJpbmcge1xuICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnRvU3RyaW5nKClcbiAgICAgICAgY29uc3QgbW9kdWxlSURXaXRob3V0TG9hZGVyOnN0cmluZyA9IG1vZHVsZUlELnN1YnN0cmluZyhcbiAgICAgICAgICAgIG1vZHVsZUlELmxhc3RJbmRleE9mKCchJykgKyAxKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURXaXRob3V0TG9hZGVyLmluY2x1ZGVzKFxuICAgICAgICAgICAgJz8nXG4gICAgICAgICkgPyBtb2R1bGVJRFdpdGhvdXRMb2FkZXIuc3Vic3RyaW5nKDAsIG1vZHVsZUlEV2l0aG91dExvYWRlci5pbmRleE9mKFxuICAgICAgICAgICAgICAgICc/J1xuICAgICAgICAgICAgKSkgOiBtb2R1bGVJRFdpdGhvdXRMb2FkZXJcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGFycmF5XG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZ2l2ZW4gbGlzdCBvZiBwYXRoIHRvIGEgbm9ybWFsaXplZCBsaXN0IHdpdGggdW5pcXVlIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHMgLSBGaWxlIHBhdGhzLlxuICAgICAqIEByZXR1cm5zIFRoZSBnaXZlbiBmaWxlIHBhdGggbGlzdCB3aXRoIG5vcm1hbGl6ZWQgdW5pcXVlIHZhbHVlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgbm9ybWFsaXplUGF0aHMocGF0aHM6QXJyYXk8c3RyaW5nPik6QXJyYXk8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQocGF0aHMubWFwKChnaXZlblBhdGg6c3RyaW5nKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgZ2l2ZW5QYXRoID0gcGF0aC5ub3JtYWxpemUoZ2l2ZW5QYXRoKVxuICAgICAgICAgICAgaWYgKGdpdmVuUGF0aC5lbmRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgIHJldHVybiBnaXZlblBhdGguc3Vic3RyaW5nKDAsIGdpdmVuUGF0aC5sZW5ndGggLSAxKVxuICAgICAgICAgICAgcmV0dXJuIGdpdmVuUGF0aFxuICAgICAgICB9KSkpXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBmaWxlIGhhbmRsZXJcbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGZpbGUgcGF0aC9uYW1lIHBsYWNlaG9sZGVyIHJlcGxhY2VtZW50cyB3aXRoIGdpdmVuIGJ1bmRsZVxuICAgICAqIGFzc29jaWF0ZWQgaW5mb3JtYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aFRlbXBsYXRlIC0gRmlsZSBwYXRoIHRvIHByb2Nlc3MgcGxhY2Vob2xkZXIgaW4uXG4gICAgICogQHBhcmFtIGluZm9ybWF0aW9ucyAtIFNjb3BlIHRvIHVzZSBmb3IgcHJvY2Vzc2luZy5cbiAgICAgKiBAcmV0dXJucyBQcm9jZXNzZWQgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICBmaWxlUGF0aFRlbXBsYXRlOnN0cmluZywgaW5mb3JtYXRpb25zOntba2V5OnN0cmluZ106c3RyaW5nfSA9IHtcbiAgICAgICAgICAgICdbbmFtZV0nOiAnLl9fZHVtbXlfXycsICdbaWRdJzogJy5fX2R1bW15X18nLFxuICAgICAgICAgICAgJ1toYXNoXSc6ICcuX19kdW1teV9fJ1xuICAgICAgICB9XG4gICAgKTpzdHJpbmcge1xuICAgICAgICBsZXQgZmlsZVBhdGg6c3RyaW5nID0gZmlsZVBhdGhUZW1wbGF0ZVxuICAgICAgICBmb3IgKGNvbnN0IHBsYWNlaG9sZGVyTmFtZTpzdHJpbmcgaW4gaW5mb3JtYXRpb25zKVxuICAgICAgICAgICAgaWYgKGluZm9ybWF0aW9ucy5oYXNPd25Qcm9wZXJ0eShwbGFjZWhvbGRlck5hbWUpKVxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGgucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMocGxhY2Vob2xkZXJOYW1lKSwgJ2cnXG4gICAgICAgICAgICAgICAgKSwgaW5mb3JtYXRpb25zW3BsYWNlaG9sZGVyTmFtZV0pXG4gICAgICAgIHJldHVybiBmaWxlUGF0aFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBnaXZlbiByZXF1ZXN0IHRvIGEgcmVzb2x2ZWQgcmVxdWVzdCB3aXRoIGdpdmVuIGNvbnRleHRcbiAgICAgKiBlbWJlZGRlZC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdCAtIFJlcXVlc3QgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gQ29udGV4dCBvZiBnaXZlbiByZXF1ZXN0IHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcmV0dXJucyBBIG5ldyByZXNvbHZlZCByZXF1ZXN0LlxuICAgICAqL1xuICAgIHN0YXRpYyBhcHBseUNvbnRleHQoXG4gICAgICAgIHJlcXVlc3Q6c3RyaW5nLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LCBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ11cbiAgICApOnN0cmluZyB7XG4gICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlc29sdmUocmVmZXJlbmNlUGF0aClcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLi8nKSAmJiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb250ZXh0XG4gICAgICAgICkgIT09IHJlZmVyZW5jZVBhdGgpIHtcbiAgICAgICAgICAgIHJlcXVlc3QgPSBwYXRoLnJlc29sdmUoY29udGV4dCwgcmVxdWVzdClcbiAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlUGF0aDpzdHJpbmcgb2YgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4OnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgbW9kdWxlUGF0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKHBhdGhQcmVmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhwYXRoUHJlZml4Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3Quc3Vic3RyaW5nKHJlcXVlc3QubGFzdEluZGV4T2YoJyEnKSArIDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlc1xuICAgICAgICAgICAgICAgICAgICApLCBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aChyZWZlcmVuY2VQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhyZWZlcmVuY2VQYXRoLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5zdWJzdHJpbmcocmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMSksIGFsaWFzZXNcbiAgICAgICAgICAgICAgICApLCBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcXVlc3RcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgZ2l2ZW4gcmVxdWVzdCBwb2ludHMgdG8gYW4gZXh0ZXJuYWwgZGVwZW5kZW5jeSBub3QgbWFpbnRhaW5lZFxuICAgICAqIGJ5IGN1cnJlbnQgcGFja2FnZSBjb250ZXh0LlxuICAgICAqIEBwYXJhbSByZXF1ZXN0IC0gUmVxdWVzdCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBDb250ZXh0IG9mIGN1cnJlbnQgcHJvamVjdC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdENvbnRleHQgLSBDb250ZXh0IG9mIGdpdmVuIHJlcXVlc3QgdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uIC0gTWFwcGluZyBvZiBjaHVuayBuYW1lcyB0byBtb2R1bGVzXG4gICAgICogd2hpY2ggc2hvdWxkIGJlIGluamVjdGVkLlxuICAgICAqIEBwYXJhbSBleHRlcm5hbE1vZHVsZUxvY2F0aW9ucyAtIEFycmF5IGlmIHBhdGhzIHdoZXJlIGV4dGVybmFsIG1vZHVsZXNcbiAgICAgKiB0YWtlIHBsYWNlLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBpbmNsdWRlUGF0dGVybiAtIEFycmF5IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZXhwbGljaXRseSBtYXJrXG4gICAgICogYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAgKiBAcGFyYW0gZXhjbHVkZVBhdHRlcm4gLSBBcnJheSBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIGV4cGxpY2l0bHkgbWFya1xuICAgICAqIGFzIGludGVybmFsIGRlcGVuZGVuY3kuXG4gICAgICogQHBhcmFtIGluUGxhY2VOb3JtYWxMaWJyYXJ5IC0gSW5kaWNhdGVzIHdoZXRoZXIgbm9ybWFsIGxpYnJhcmllcyBzaG91bGRcbiAgICAgKiBiZSBleHRlcm5hbCBvciBub3QuXG4gICAgICogQHBhcmFtIGluUGxhY2VEeW5hbWljTGlicmFyeSAtIEluZGljYXRlcyB3aGV0aGVyIHJlcXVlc3RzIHdpdGhcbiAgICAgKiBpbnRlZ3JhdGVkIGxvYWRlciBjb25maWd1cmF0aW9ucyBzaG91bGQgYmUgbWFya2VkIGFzIGV4dGVybmFsIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgLSBFbmNvZGluZyBmb3IgZmlsZSBuYW1lcyB0byB1c2UgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBBIG5ldyByZXNvbHZlZCByZXF1ZXN0IGluZGljYXRpbmcgd2hldGhlciBnaXZlbiByZXF1ZXN0IGlzIGFuXG4gICAgICogZXh0ZXJuYWwgb25lLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgIHJlcXVlc3Q6c3RyaW5nLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlcXVlc3RDb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbjpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPSB7fSxcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSwgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGV4dGVuc2lvbnM6RXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGU6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWycuanMnXSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAnLmpzJywgJy5qc29uJywgJy5jc3MnLCAnLmVvdCcsICcuZ2lmJywgJy5odG1sJywgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgICAnLmpwZycsICcucG5nJywgJy5lanMnLCAnLnN2ZycsICcudHRmJywgJy53b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LCBtb2R1bGU6IFtdXG4gICAgICAgIH0sIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJy4vJywgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnaW5kZXgnLCAnbWFpbiddLFxuICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnbWFpbicsICdtb2R1bGUnXSxcbiAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gW10sXG4gICAgICAgIGluY2x1ZGVQYXR0ZXJuOkFycmF5PHN0cmluZ3xSZWdFeHA+ID0gW10sXG4gICAgICAgIGV4Y2x1ZGVQYXR0ZXJuOkFycmF5PHN0cmluZ3xSZWdFeHA+ID0gW10sXG4gICAgICAgIGluUGxhY2VOb3JtYWxMaWJyYXJ5OmJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgaW5QbGFjZUR5bmFtaWNMaWJyYXJ5OmJvb2xlYW4gPSB0cnVlLFxuICAgICAgICBlbmNvZGluZzpzdHJpbmcgPSAndXRmLTgnXG4gICAgKTo/c3RyaW5nIHtcbiAgICAgICAgY29udGV4dCA9IHBhdGgucmVzb2x2ZShjb250ZXh0KVxuICAgICAgICByZXF1ZXN0Q29udGV4dCA9IHBhdGgucmVzb2x2ZShyZXF1ZXN0Q29udGV4dClcbiAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVzb2x2ZShyZWZlcmVuY2VQYXRoKVxuICAgICAgICAvLyBOT1RFOiBXZSBhcHBseSBhbGlhcyBvbiBleHRlcm5hbHMgYWRkaXRpb25hbGx5LlxuICAgICAgICBsZXQgcmVzb2x2ZWRSZXF1ZXN0OnN0cmluZyA9IEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMocmVxdWVzdC5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMVxuICAgICAgICAgICAgKSwgYWxpYXNlcyksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IEFsaWFzZXMgYW5kIG1vZHVsZSByZXBsYWNlbWVudHMgZG9lc24ndCBoYXZlIHRvIGJlIGZvcndhcmRlZFxuICAgICAgICAgICAgc2luY2Ugd2UgcGFzcyBhbiBhbHJlYWR5IHJlc29sdmVkIHJlcXVlc3QuXG4gICAgICAgICovXG4gICAgICAgIGxldCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCB7fSwge30sIGV4dGVuc2lvbnMsIGNvbnRleHQsIHJlcXVlc3RDb250ZXh0LFxuICAgICAgICAgICAgcGF0aHNUb0lnbm9yZSwgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMsIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcywgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcywgZW5jb2RpbmcpXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBtYXJrIGRlcGVuZGVuY2llcyBhcyBleHRlcm5hbCBpZiB0aGVyZSBmaWxlIGNvdWxkbid0IGJlXG4gICAgICAgICAgICByZXNvbHZlZCBvciBhcmUgc3BlY2lmaWVkIHRvIGJlIGV4dGVybmFsIGV4cGxpY2l0bHkuXG4gICAgICAgICovXG4gICAgICAgIGlmICghKGZpbGVQYXRoIHx8IGluUGxhY2VOb3JtYWxMaWJyYXJ5KSB8fCBUb29scy5pc0FueU1hdGNoaW5nKFxuICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCBpbmNsdWRlUGF0dGVyblxuICAgICAgICApKVxuICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseUNvbnRleHQoXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCByZXF1ZXN0Q29udGV4dCwgcmVmZXJlbmNlUGF0aCxcbiAgICAgICAgICAgICAgICBhbGlhc2VzLCBtb2R1bGVSZXBsYWNlbWVudHMsIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzKVxuICAgICAgICBpZiAoVG9vbHMuaXNBbnlNYXRjaGluZyhyZXNvbHZlZFJlcXVlc3QsIGV4Y2x1ZGVQYXR0ZXJuKSlcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2Ygbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uW1xuICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQsIGFsaWFzZXMsIG1vZHVsZVJlcGxhY2VtZW50cywgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIHJlcXVlc3RDb250ZXh0LCBwYXRoc1RvSWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMsIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcywgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nXG4gICAgICAgICAgICAgICAgICAgICkgPT09IGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIG1hcmsgZGVwZW5kZW5jaWVzIGFzIGV4dGVybmFsIGlmIHRoZXkgZG9lcyBub3QgY29udGFpbiBhXG4gICAgICAgICAgICBsb2FkZXIgaW4gdGhlaXIgcmVxdWVzdCBhbmQgYXJlbid0IHBhcnQgb2YgdGhlIGN1cnJlbnQgbWFpbiBwYWNrYWdlXG4gICAgICAgICAgICBvciBoYXZlIGEgZmlsZSBleHRlbnNpb24gb3RoZXIgdGhhbiBqYXZhU2NyaXB0IGF3YXJlLlxuICAgICAgICAqL1xuICAgICAgICBpZiAoIWluUGxhY2VOb3JtYWxMaWJyYXJ5ICYmIChcbiAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5sZW5ndGggPT09IDAgfHwgZmlsZVBhdGggJiZcbiAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5pbmNsdWRlcyhwYXRoLmV4dG5hbWUoZmlsZVBhdGgpKSB8fFxuICAgICAgICAgICAgIWZpbGVQYXRoICYmIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5pbmNsdWRlcygnJylcbiAgICAgICAgKSAmJiAhKGluUGxhY2VEeW5hbWljTGlicmFyeSAmJiByZXF1ZXN0LmluY2x1ZGVzKCchJykpICYmIChcbiAgICAgICAgICAgICAgICAhZmlsZVBhdGggJiYgaW5QbGFjZUR5bmFtaWNMaWJyYXJ5IHx8IGZpbGVQYXRoICYmIChcbiAgICAgICAgICAgICAgICAgICAgIWZpbGVQYXRoLnN0YXJ0c1dpdGgoY29udGV4dCkgfHxcbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseUNvbnRleHQoXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCByZXF1ZXN0Q29udGV4dCwgcmVmZXJlbmNlUGF0aCwgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzKVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFzc2V0IHR5cGUgb2YgZ2l2ZW4gZmlsZS5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gYW5hbHlzZS5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9uIC0gTWV0YSBpbmZvcm1hdGlvbnMgZm9yIGF2YWlsYWJsZSBhc3NldFxuICAgICAqIHR5cGVzLlxuICAgICAqIEBwYXJhbSBwYXRocyAtIExpc3Qgb2YgcGF0aHMgdG8gc2VhcmNoIGlmIGdpdmVuIHBhdGggZG9lc24ndCByZWZlcmVuY2VcbiAgICAgKiBhIGZpbGUgZGlyZWN0bHkuXG4gICAgICogQHJldHVybnMgRGV0ZXJtaW5lZCBmaWxlIHR5cGUgb3IgXCJudWxsXCIgb2YgZ2l2ZW4gZmlsZSBjb3VsZG4ndCBiZVxuICAgICAqIGRldGVybWluZWQuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBidWlsZENvbmZpZ3VyYXRpb246QnVpbGRDb25maWd1cmF0aW9uLCBwYXRoczpQYXRoXG4gICAgKTo/c3RyaW5nIHtcbiAgICAgICAgbGV0IHJlc3VsdDo/c3RyaW5nID0gbnVsbFxuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIGJ1aWxkQ29uZmlndXJhdGlvbilcbiAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoXG4gICAgICAgICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgICAgICkgPT09IGAuJHtidWlsZENvbmZpZ3VyYXRpb25bdHlwZV0uZXh0ZW5zaW9ufWApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0eXBlXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnc291cmNlJywgJ3RhcmdldCddKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXRUeXBlOnN0cmluZyBpbiBwYXRoc1t0eXBlXS5hc3NldClcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aHNbdHlwZV0uYXNzZXQuaGFzT3duUHJvcGVydHkoYXNzZXRUeXBlKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlICE9PSAnYmFzZScgJiYgcGF0aHNbdHlwZV0uYXNzZXRbYXNzZXRUeXBlXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGguc3RhcnRzV2l0aChwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzZXRUeXBlXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHByb3BlcnR5IHdpdGggYSBzdG9yZWQgYXJyYXkgb2YgYWxsIG1hdGNoaW5nIGZpbGUgcGF0aHMsIHdoaWNoXG4gICAgICogbWF0Y2hlcyBlYWNoIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW4gZ2l2ZW4gZW50cnkgcGF0aCBhbmQgY29udmVydHMgZ2l2ZW5cbiAgICAgKiBidWlsZCBjb25maWd1cmF0aW9uIGludG8gYSBzb3J0ZWQgYXJyYXkgd2VyZSBqYXZhU2NyaXB0IGZpbGVzIHRha2VzXG4gICAgICogcHJlY2VkZW5jZS5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiAtIEdpdmVuIGJ1aWxkIGNvbmZpZ3VyYXRpb25zLlxuICAgICAqIEBwYXJhbSBlbnRyeVBhdGggLSBQYXRoIHRvIGFuYWx5c2UgbmVzdGVkIHN0cnVjdHVyZS5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gbWFpbkZpbGVCYXNlbmFtZXMgLSBGaWxlIGJhc2VuYW1lcyB0byBzb3J0IGludG8gdGhlIGZyb250LlxuICAgICAqIEByZXR1cm5zIENvbnZlcnRlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICBjb25maWd1cmF0aW9uOkJ1aWxkQ29uZmlndXJhdGlvbiwgZW50cnlQYXRoOnN0cmluZyA9ICcuLycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICBtYWluRmlsZUJhc2VuYW1lczpBcnJheTxzdHJpbmc+ID0gWydpbmRleCcsICdtYWluJ11cbiAgICApOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uIHtcbiAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uID0gW11cbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiBjb25maWd1cmF0aW9uKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSA9XG4gICAgICAgICAgICAgICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7ZmlsZVBhdGhzOiBbXX0sIGNvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGU6RmlsZSBvZiBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKFxuICAgICAgICAgICAgICAgICAgICBlbnRyeVBhdGgsIChmaWxlOkZpbGUpOj9mYWxzZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuc3RhdC5pc0ZpbGUoKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKGZpbGUucGF0aCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICkgPT09IG5ld0l0ZW0uZXh0ZW5zaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhKG5ldyBSZWdFeHAobmV3SXRlbS5maWxlUGF0aFBhdHRlcm4pKS50ZXN0KGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5maWxlUGF0aHMucHVzaChmaWxlLnBhdGgpXG4gICAgICAgICAgICAgICAgbmV3SXRlbS5maWxlUGF0aHMuc29ydCgoXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0RmlsZVBhdGg6c3RyaW5nLCBzZWNvbmRGaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICApOm51bWJlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RGaWxlUGF0aCwgcGF0aC5leHRuYW1lKGZpcnN0RmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbkZpbGVCYXNlbmFtZXMuaW5jbHVkZXMocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRGaWxlUGF0aCwgcGF0aC5leHRuYW1lKHNlY29uZEZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kRmlsZVBhdGgsIHBhdGguZXh0bmFtZShzZWNvbmRGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLnB1c2gobmV3SXRlbSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1aWxkQ29uZmlndXJhdGlvbi5zb3J0KChcbiAgICAgICAgICAgIGZpcnN0OlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSxcbiAgICAgICAgICAgIHNlY29uZDpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbiAgICAgICAgKTpudW1iZXIgPT4ge1xuICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiAhPT0gc2Vjb25kLm91dHB1dEV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgICAgIGlmIChzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIHJldHVybiBmaXJzdC5vdXRwdXRFeHRlbnNpb24gPCBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID8gLTEgOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9KVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBmaWxlIGFuZCBkaXJlY3RvcnkgcGF0aHMgcmVsYXRlZCB0byBnaXZlbiBpbnRlcm5hbFxuICAgICAqIG1vZHVsZXMgYXMgYXJyYXkuXG4gICAgICogQHBhcmFtIGludGVybmFsSW5qZWN0aW9uIC0gTGlzdCBvZiBtb2R1bGUgaWRzIG9yIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIG1vZHVsZSByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byBzZWFyY2ggZm9yIGxvY2FsIG1vZHVsZXMuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBlbmNvZGluZyAtIEZpbGUgbmFtZSBlbmNvZGluZyB0byB1c2UgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBhIGZpbGUgcGF0aCBhbmQgZGlyZWN0b3J5IHBhdGgga2V5IG1hcHBpbmcgdG9cbiAgICAgKiBjb3JyZXNwb25kaW5nIGxpc3Qgb2YgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb24sIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sIGV4dGVuc2lvbnM6RXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGU6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWycuanMnXSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAnLmpzJywgJy5qc29uJywgJy5jc3MnLCAnLmVvdCcsICcuZ2lmJywgJy5odG1sJywgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgICAnLmpwZycsICcucG5nJywgJy5lanMnLCAnLnN2ZycsICcudHRmJywgJy53b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LCBtb2R1bGU6IFtdXG4gICAgICAgIH0sIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbJycsICdub2RlX21vZHVsZXMnLCAnLi4vJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJ19fcGFja2FnZV9fJywgJycsICdpbmRleCcsICdtYWluJ10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJywgJ21vZHVsZSddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgZW5jb2Rpbmc6c3RyaW5nID0gJ3V0Zi04J1xuICAgICk6e2ZpbGVQYXRoczpBcnJheTxzdHJpbmc+O2RpcmVjdG9yeVBhdGhzOkFycmF5PHN0cmluZz59IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiA9XG4gICAgICAgICAgICBIZWxwZXIucmVzb2x2ZU1vZHVsZXNJbkZvbGRlcnMoXG4gICAgICAgICAgICAgICAgSGVscGVyLm5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKGludGVybmFsSW5qZWN0aW9uKSxcbiAgICAgICAgICAgICAgICBhbGlhc2VzLCBtb2R1bGVSZXBsYWNlbWVudHMsIGNvbnRleHQsIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICAgICAgcGF0aHNUb0lnbm9yZSlcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELCBhbGlhc2VzLCBtb2R1bGVSZXBsYWNlbWVudHMsIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCByZWZlcmVuY2VQYXRoLCBwYXRoc1RvSWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMsIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcywgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aDpzdHJpbmcgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRpcmVjdG9yeVBhdGhzLmluY2x1ZGVzKGRpcmVjdG9yeVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeVBhdGhzLnB1c2goZGlyZWN0b3J5UGF0aClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtmaWxlUGF0aHMsIGRpcmVjdG9yeVBhdGhzfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgbGlzdCBvZiBjb25jcmV0ZSBmaWxlIHBhdGhzIGZvciBnaXZlbiBtb2R1bGUgaWQgcG9pbnRpbmcgdG9cbiAgICAgKiBhIGZvbGRlciB3aGljaCBpc24ndCBhIHBhY2thZ2UuXG4gICAgICogQHBhcmFtIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiAtIEluamVjdGlvbiBkYXRhIHN0cnVjdHVyZSBvZlxuICAgICAqIG1vZHVsZXMgd2l0aCBmb2xkZXIgcmVmZXJlbmNlcyB0byByZXNvbHZlLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIGRldGVybWluZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGluamVjdGlvbnMgd2l0aCByZXNvbHZlZCBmb2xkZXIgcG9pbnRpbmcgbW9kdWxlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZU1vZHVsZXNJbkZvbGRlcnMoXG4gICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbjpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24sXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSwgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiB7XG4gICAgICAgIGlmIChyZWZlcmVuY2VQYXRoLnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRFxuICAgICAgICAgICAgICAgICAgICAgICAgKSwgYWxpYXNlcyksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsIG1vZHVsZUlEKVxuICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKHJlc29sdmVkUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTpGaWxlIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhyZXNvbHZlZFBhdGgsIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTpGaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTo/ZmFsc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlLnN0YXQuaXNGaWxlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVkUGF0aCwgZmlsZS5wYXRoKSkpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRC5zdGFydHNXaXRoKCcuLycpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhbW9kdWxlSUQuc3RhcnRzV2l0aCgnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCByZWZlcmVuY2VQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXVtpbmRleF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAuLyR7cGF0aC5yZWxhdGl2ZShjb250ZXh0LCByZXNvbHZlZFBhdGgpfWBcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvblxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFdmVyeSBpbmplY3Rpb24gZGVmaW5pdGlvbiB0eXBlIGNhbiBiZSByZXByZXNlbnRlZCBhcyBwbGFpbiBvYmplY3RcbiAgICAgKiAobWFwcGluZyBmcm9tIGNodW5rIG5hbWUgdG8gYXJyYXkgb2YgbW9kdWxlIGlkcykuIFRoaXMgbWV0aG9kIGNvbnZlcnRzXG4gICAgICogZWFjaCByZXByZXNlbnRhdGlvbiBpbnRvIHRoZSBub3JtYWxpemVkIHBsYWluIG9iamVjdCBub3RhdGlvbi5cbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxJbmplY3Rpb24gLSBHaXZlbiBpbnRlcm5hbCBpbmplY3Rpb24gdG8gbm9ybWFsaXplLlxuICAgICAqIEByZXR1cm5zIE5vcm1hbGl6ZWQgcmVwcmVzZW50YXRpb24gb2YgZ2l2ZW4gaW50ZXJuYWwgaW5qZWN0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb25cbiAgICApOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiB7XG4gICAgICAgIGxldCByZXN1bHQ6Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID0ge31cbiAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uIGluc3RhbmNlb2YgT2JqZWN0ICYmIFRvb2xzLmlzUGxhaW5PYmplY3QoXG4gICAgICAgICAgICBpbnRlcm5hbEluamVjdGlvblxuICAgICAgICApKSB7XG4gICAgICAgICAgICBsZXQgaGFzQ29udGVudDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgICAgIGNvbnN0IGNodW5rTmFtZXNUb0RlbGV0ZTpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBpbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2h1bmtOYW1lXSA9IGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZXNUb0RlbGV0ZS5wdXNoKGNodW5rTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBbaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0NvbnRlbnQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIG9mIGNodW5rTmFtZXNUb0RlbGV0ZSlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJlc3VsdFtjaHVua05hbWVdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbXX1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW50ZXJuYWxJbmplY3Rpb24gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbaW50ZXJuYWxJbmplY3Rpb25dfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGludGVybmFsSW5qZWN0aW9uKSlcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogaW50ZXJuYWxJbmplY3Rpb259XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgY29uY3JldGUgZmlsZSBwYXRocyBmb3IgZ2l2ZW4gaW5qZWN0aW9uIHdoaWNoIGFyZSBtYXJrZWRcbiAgICAgKiB3aXRoIHRoZSBcIl9fYXV0b19fXCIgaW5kaWNhdG9yLlxuICAgICAqIEBwYXJhbSBnaXZlbkluamVjdGlvbiAtIEdpdmVuIGludGVybmFsIGFuZCBleHRlcm5hbCBpbmplY3Rpb24gdG8gdGFrZVxuICAgICAqIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9ucyAtIFJlc29sdmVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIG1vZHVsZXNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyB0byBleGNsdWRlIChzcGVjaWZpZWQgYnlcbiAgICAgKiBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0byBtb2R1bGUgaWRzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFJlZmVyZW5jZSBwYXRoIGZyb20gd2hlcmUgbG9jYWwgZmlsZXMgc2hvdWxkIGJlXG4gICAgICogcmVzb2x2ZWQuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9uIHdpdGggcmVzb2x2ZWQgbWFya2VkIGluZGljYXRvcnMuXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVJbmplY3Rpb24oXG4gICAgICAgIGdpdmVuSW5qZWN0aW9uOkluamVjdGlvbixcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlc1RvRXhjbHVkZTpJbnRlcm5hbEluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LCBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5qcyddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBbXG4gICAgICAgICAgICAgICAgICAgICcuanMnLCAnLmpzb24nLCAnLmNzcycsICcuZW90JywgJy5naWYnLCAnLmh0bWwnLCAnLmljbycsXG4gICAgICAgICAgICAgICAgICAgICcuanBnJywgJy5wbmcnLCAnLmVqcycsICcuc3ZnJywgJy50dGYnLCAnLndvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIG1vZHVsZTogW11cbiAgICAgICAgfSwgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXVxuICAgICk6SW5qZWN0aW9uIHtcbiAgICAgICAgY29uc3QgaW5qZWN0aW9uOkluamVjdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgIHRydWUsIHt9LCBnaXZlbkluamVjdGlvbilcbiAgICAgICAgY29uc3QgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgICAgICAgICBtb2R1bGVzVG9FeGNsdWRlLCBhbGlhc2VzLCBtb2R1bGVSZXBsYWNlbWVudHMsIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgY29udGV4dCwgcmVmZXJlbmNlUGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgKS5maWxlUGF0aHNcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2ludGVybmFsJywgJ2V4dGVybmFsJ10pXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBjdXJseSAqL1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmplY3Rpb25bdHlwZV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGluamVjdGlvblt0eXBlXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID09PSAnX19hdXRvX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXSA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVzOntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBba2V5OnN0cmluZ106c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViQ2h1bmtOYW1lOnN0cmluZyBpbiBtb2R1bGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGVzLmhhc093blByb3BlcnR5KHN1YkNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzW3N1YkNodW5rTmFtZV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldmVyc2UgYXJyYXkgdG8gbGV0IGphdmFTY3JpcHQgYW5kIG1haW4gZmlsZXMgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgbGFzdCBvbmVzIHRvIGV4cG9ydCB0aGVtIHJhdGhlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXS5yZXZlcnNlKClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmplY3Rpb25bdHlwZV0gPT09ICdfX2F1dG9fXycpXG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGN1cmx5ICovXG4gICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9ucywgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLCBjb250ZXh0KVxuICAgICAgICByZXR1cm4gaW5qZWN0aW9uXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgZmlsZSBwYXRocyB0b1xuICAgICAqIGV4Y2x1ZGUgKHNwZWNpZmllZCBieSBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0b1xuICAgICAqIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEByZXR1cm5zIEFsbCBkZXRlcm1pbmVkIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRBdXRvQ2h1bmsoXG4gICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZTpBcnJheTxzdHJpbmc+LCBjb250ZXh0OnN0cmluZ1xuICAgICk6e1trZXk6c3RyaW5nXTpzdHJpbmd9IHtcbiAgICAgICAgY29uc3QgcmVzdWx0Ontba2V5OnN0cmluZ106c3RyaW5nfSA9IHt9XG4gICAgICAgIGNvbnN0IGluamVjdGVkTW9kdWxlSURzOntba2V5OnN0cmluZ106QXJyYXk8c3RyaW5nPn0gPSB7fVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSBvZlxuICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uc1xuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmICghaW5qZWN0ZWRNb2R1bGVJRHNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0pXG4gICAgICAgICAgICAgICAgaW5qZWN0ZWRNb2R1bGVJRHNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0gPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVGaWxlUGF0aDpzdHJpbmcgb2YgYnVpbGRDb25maWd1cmF0aW9uLmZpbGVQYXRocylcbiAgICAgICAgICAgICAgICBpZiAoIW1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZS5pbmNsdWRlcyhtb2R1bGVGaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aDpzdHJpbmcgPSAnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoOnN0cmluZyA9IHBhdGguZGlybmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VOYW1lOnN0cmluZyA9IHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYC4ke2J1aWxkQ29uZmlndXJhdGlvbi5leHRlbnNpb259YClcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZHVsZUlEOnN0cmluZyA9IGJhc2VOYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3RvcnlQYXRoICE9PSAnLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IHBhdGguam9pbihkaXJlY3RvcnlQYXRoLCBiYXNlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IGVhY2ggb3V0cHV0IHR5cGUgaGFzIG9ubHkgb25lIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5qZWN0ZWRNb2R1bGVJRHNbXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgIF0uaW5jbHVkZXMobW9kdWxlSUQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IHNhbWUgbW9kdWxlIGlkcyBhbmQgZGlmZmVyZW50IG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVzIGNhbiBiZSBkaXN0aW5ndWlzaGVkIGJ5IHRoZWlyIGV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChKYXZhU2NyaXB0LU1vZHVsZXMgcmVtYWlucyB3aXRob3V0IGV4dGVuc2lvbiBzaW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZXkgd2lsbCBiZSBoYW5kbGVkIGZpcnN0IGJlY2F1c2UgdGhlIGJ1aWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgYXJlIGV4cGVjdGVkIHRvIGJlIHNvcnRlZCBpbiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCkuXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShtb2R1bGVJRCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3JlbGF0aXZlTW9kdWxlRmlsZVBhdGhdID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFttb2R1bGVJRF0gPSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RlZE1vZHVsZUlEc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBdLnB1c2gobW9kdWxlSUQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byBkZXRlcm1pbmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUVudHJ5RmlsZU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGVudHJ5IGZpbGUgbmFtZXMgdG9cbiAgICAgKiBzZWFyY2ggZm9yLiBUaGUgbWFnaWMgbmFtZSBcIl9fcGFja2FnZV9fXCIgd2lsbCBzZWFyY2ggZm9yIGFuIGFwcHJlY2lhdGVcbiAgICAgKiBlbnRyeSBpbiBhIFwicGFja2FnZS5qc29uXCIgZmlsZS5cbiAgICAgKiBAcGFyYW0gcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgbWFpbiBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSByZXByZXNlbnRpbmcgZW50cnkgbW9kdWxlIGRlZmluaXRpb25zLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgYWxpYXMgcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2Ugc3BlY2lmaWMgbW9kdWxlIGFsaWFzZXMuXG4gICAgICogQHBhcmFtIGVuY29kaW5nIC0gRW5jb2RpbmcgdG8gdXNlIGZvciBmaWxlIG5hbWVzIGR1cmluZyBmaWxlIHRyYXZlcnNpbmcuXG4gICAgICogQHJldHVybnMgRmlsZSBwYXRoIG9yIGdpdmVuIG1vZHVsZSBpZCBpZiBkZXRlcm1pbmF0aW9ucyBoYXMgZmFpbGVkIG9yXG4gICAgICogd2Fzbid0IG5lY2Vzc2FyeS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgIG1vZHVsZUlEOnN0cmluZywgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSwgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5qcyddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBbXG4gICAgICAgICAgICAgICAgICAgICcuanMnLCAnLmpzb24nLCAnLmNzcycsICcuZW90JywgJy5naWYnLCAnLmh0bWwnLCAnLmljbycsXG4gICAgICAgICAgICAgICAgICAgICcuanBnJywgJy5wbmcnLCAnLmVqcycsICcuc3ZnJywgJy50dGYnLCAnLndvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIG1vZHVsZTogW11cbiAgICAgICAgfSwgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gWydpbmRleCddLFxuICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnbWFpbiddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgZW5jb2Rpbmc6c3RyaW5nID0gJ3V0Zi04J1xuICAgICk6P3N0cmluZyB7XG4gICAgICAgIG1vZHVsZUlEID0gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIobW9kdWxlSUQpLCBhbGlhc2VzXG4gICAgICAgICksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgaWYgKCFtb2R1bGVJRClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGxldCBtb2R1bGVGaWxlUGF0aDpzdHJpbmcgPSBtb2R1bGVJRFxuICAgICAgICBpZiAobW9kdWxlRmlsZVBhdGguc3RhcnRzV2l0aCgnLi8nKSlcbiAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoID0gcGF0aC5qb2luKHJlZmVyZW5jZVBhdGgsIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUxvY2F0aW9uOnN0cmluZyBvZiBbcmVmZXJlbmNlUGF0aF0uY29uY2F0KFxuICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShjb250ZXh0LCBmaWxlUGF0aCkpXG4gICAgICAgICkpXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlTmFtZTpzdHJpbmcgb2YgWycnLCAnX19wYWNrYWdlX18nXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzXG4gICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlRXh0ZW5zaW9uOnN0cmluZyBvZiBleHRlbnNpb25zLm1vZHVsZS5jb25jYXQoW1xuICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVFeHRlbnNpb246c3RyaW5nIG9mIFsnJ10uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5maWxlLmludGVybmFsXG4gICAgICAgICAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50TW9kdWxlRmlsZVBhdGg6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlRmlsZVBhdGguc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVMb2NhdGlvbiwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFja2FnZUFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoVG9QYWNrYWdlSlNPTjpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGgsICdwYWNrYWdlLmpzb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhwYXRoVG9QYWNrYWdlSlNPTikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2NhbENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb24gPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhUb1BhY2thZ2VKU09OLCB7ZW5jb2Rpbmd9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWU6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJiB0eXBlb2YgbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbltwcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZUFsaWFzZXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmFwcGx5QWxpYXNlcyhmaWxlTmFtZSwgcGFja2FnZUFsaWFzZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZmlsZU5hbWV9JHttb2R1bGVFeHRlbnNpb259JHtmaWxlRXh0ZW5zaW9ufWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoICs9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2ZpbGVOYW1lfSR7bW9kdWxlRXh0ZW5zaW9ufSR7ZmlsZUV4dGVuc2lvbn1gXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoY3VycmVudE1vZHVsZUZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudE1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHJldHVybnMgVGhlIGFsaWFzIGFwcGxpZWQgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhcHBseUFsaWFzZXMobW9kdWxlSUQ6c3RyaW5nLCBhbGlhc2VzOlBsYWluT2JqZWN0KTpzdHJpbmcge1xuICAgICAgICBmb3IgKGNvbnN0IGFsaWFzOnN0cmluZyBpbiBhbGlhc2VzKVxuICAgICAgICAgICAgaWYgKGFsaWFzLmVuZHNXaXRoKCckJykpIHtcbiAgICAgICAgICAgICAgICBpZiAobW9kdWxlSUQgPT09IGFsaWFzLnN1YnN0cmluZygwLCBhbGlhcy5sZW5ndGggLSAxKSlcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBhbGlhc2VzW2FsaWFzXVxuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBtb2R1bGVJRC5yZXBsYWNlKGFsaWFzLCBhbGlhc2VzW2FsaWFzXSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSByZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gdGhlaXJcbiAgICAgKiBjb3JyZXNwb25kaW5nIHJlcGxhY2VtZW50cy5cbiAgICAgKiBAcmV0dXJucyBUaGUgcmVwbGFjZW1lbnQgYXBwbGllZCBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICBtb2R1bGVJRDpzdHJpbmcsIHJlcGxhY2VtZW50czpQbGFpbk9iamVjdFxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgZm9yIChjb25zdCByZXBsYWNlbWVudDpzdHJpbmcgaW4gcmVwbGFjZW1lbnRzKVxuICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50cy5oYXNPd25Qcm9wZXJ0eShyZXBsYWNlbWVudCkpXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBtb2R1bGVJRC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKHJlcGxhY2VtZW50KSwgcmVwbGFjZW1lbnRzW3JlcGxhY2VtZW50XSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEXG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgSGVscGVyXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19