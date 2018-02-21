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

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

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

                    if (_path3.default.resolve(filePath).startsWith(_path3.default.resolve(pathToCheck))) return true;
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
                NOTE: We have to prevent creating native "style" dom nodes to
                prevent jsdom from parsing the entire cascading style sheet. Which
                is error prune and very resource intensive.
            */
            var styleContents = [];
            content = content.replace(/(<style[^>]*>)([\s\S]*?)(<\/style[^>]*>)/gi, function (match, startTag, content, endTag) {
                styleContents.push(content);
                return '' + startTag + endTag;
            });
            /*
                NOTE: We have to translate template delimiter to html compatible
                sequences and translate it back later to avoid unexpected escape
                sequences in resulting html.
            */
            var window = new _jsdom.JSDOM(content.replace(/<%/g, '##+#+#+##').replace(/%>/g, '##-#-#-##')).window;
            var inPlaceStyleContents = [];
            var filePathsToRemove = [];
            var _arr = [{
                attributeName: 'href',
                hash: 'contenthash',
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
            }];
            for (var _i = 0; _i < _arr.length; _i++) {
                var assetType = _arr[_i];
                if (assetType.pattern) for (var pattern in assetType.pattern) {
                    var _Helper$renderFilePat;

                    if (!assetType.pattern.hasOwnProperty(pattern)) continue;
                    var selector = assetType.selector;
                    if (pattern !== '*') selector = '[' + assetType.attributeName + '^="' + _path3.default.relative(basePath, Helper.renderFilePathTemplate(assetType.template, (_Helper$renderFilePat = {}, (0, _defineProperty3.default)(_Helper$renderFilePat, '[' + assetType.hash + ']', ''), (0, _defineProperty3.default)(_Helper$renderFilePat, '[id]', pattern), (0, _defineProperty3.default)(_Helper$renderFilePat, '[name]', pattern), _Helper$renderFilePat))) + '"]';
                    var domNodes = window.document.querySelectorAll('' + assetType.linkTagName + selector);
                    if (domNodes.length) {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = (0, _getIterator3.default)(domNodes), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
                                    var match = new RegExp(regularExpressionPattern).exec(assetType.pattern[pattern]);
                                    if (!match) throw new Error('Given in place specification "' + (assetType.pattern[pattern] + '" for ') + (assetType.tagName + ' does not ') + 'satisfy the specified pattern "' + (regularExpressionPattern + '".'));
                                    var _domNode = window.document.querySelector(match[2]);
                                    if (!_domNode) throw new Error('Specified dom node "' + match[2] + '" ' + 'could not be found to in place "' + (pattern + '".'));
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
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    } else console.warn('No referenced ' + assetType.tagName + ' file in ' + 'resulting markup found with selector: "' + ('' + assetType.linkTagName + assetType.selector + '"'));
                }
            } // NOTE: We have to restore template delimiter and style contents.
            return {
                content: content.replace(/^(\s*<!doctype [^>]+?>\s*)[\s\S]*$/i, '$1') + window.document.documentElement.outerHTML.replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>').replace(/(<style[^>]*>)[\s\S]*?(<\/style[^>]*>)/gi, function (match, startTag, endTag) {
                    if (startTag.includes(' weboptimizerinplace="true"')) return startTag.replace(' weboptimizerinplace="true"', '') + ('' + inPlaceStyleContents.shift() + endTag);
                    return '' + startTag + styleContents.shift() + endTag;
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
                givenPath = _path3.default.normalize(givenPath);
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

            referencePath = _path3.default.resolve(referencePath);
            if (request.startsWith('./') && _path3.default.resolve(context) !== referencePath) {
                request = _path3.default.resolve(context, request);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = (0, _getIterator3.default)(relativeModuleFilePaths), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var modulePath = _step3.value;

                        var pathPrefix = _path3.default.resolve(referencePath, modulePath);
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
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
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

            context = _path3.default.resolve(context);
            requestContext = _path3.default.resolve(requestContext);
            referencePath = _path3.default.resolve(referencePath);
            // NOTE: We apply alias on externals additionally.
            var resolvedRequest = Helper.applyModuleReplacements(Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
            /*
                NOTE: Aliases and module replacements doesn't have to be forwarded
                since we pass an already resolved request.
            */
            var filePath = Helper.determineModuleFilePath(resolvedRequest, {}, {}, extensions, context, requestContext, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
            if (_clientnode2.default.isAnyMatching(resolvedRequest, excludePattern)) return null;
            /*
                NOTE: We mark dependencies as external if there file couldn't be
                resolved or are specified to be external explicitly.
            */
            if (!(filePath || inPlaceNormalLibrary) || _clientnode2.default.isAnyMatching(resolvedRequest, includePattern)) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleFilePaths);
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var moduleID = _step4.value;

                            if (Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, requestContext, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding) === filePath) return null;
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
                }
            } /*
                  NOTE: We mark dependencies as external if they does not contain a
                  loader in their request and aren't part of the current main package
                  or have a file extension other than javaScript aware.
              */
            if (!inPlaceNormalLibrary && (extensions.file.external.length === 0 || filePath && extensions.file.external.includes(_path3.default.extname(filePath)) || !filePath && extensions.file.external.includes('')) && !(inPlaceDynamicLibrary && request.includes('!')) && (!filePath && inPlaceDynamicLibrary || filePath && (!filePath.startsWith(context) || Helper.isFilePathInLocation(filePath, externalModuleLocations)))) return Helper.applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleFilePaths);
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
                if (_path3.default.extname(filePath) === '.' + buildConfiguration[type].extension) {
                    result = type;
                    break;
                }
            }if (!result) {
                var _arr2 = ['source', 'target'];

                for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                    var _type = _arr2[_i2];
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
                    var _iteratorNormalCompletion5 = true;
                    var _didIteratorError5 = false;
                    var _iteratorError5 = undefined;

                    try {
                        for (var _iterator5 = (0, _getIterator3.default)(_clientnode2.default.walkDirectoryRecursivelySync(entryPath, function (file) {
                            if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
                        })), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            var file = _step5.value;

                            if (file.stats && file.stats.isFile() && _path3.default.extname(file.path).substring(1) === newItem.extension && !new RegExp(newItem.filePathPattern).test(file.path)) newItem.filePaths.push(file.path);
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

                    newItem.filePaths.sort(function (firstFilePath, secondFilePath) {
                        if (mainFileBasenames.includes(_path3.default.basename(firstFilePath, _path3.default.extname(firstFilePath)))) {
                            if (mainFileBasenames.includes(_path3.default.basename(secondFilePath, _path3.default.extname(secondFilePath)))) return 0;
                        } else if (mainFileBasenames.includes(_path3.default.basename(secondFilePath, _path3.default.extname(secondFilePath)))) return 1;
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
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var moduleID = _step6.value;

                            var filePath = Helper.determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, referencePath, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
                            if (filePath) {
                                filePaths.push(filePath);
                                var directoryPath = _path3.default.dirname(filePath);
                                if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
                            }
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

            if (referencePath.startsWith('/')) referencePath = _path3.default.relative(context, referencePath);
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var index = 0;
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = (0, _getIterator3.default)(normalizedInternalInjection[chunkName]), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var moduleID = _step7.value;

                            moduleID = Helper.applyModuleReplacements(Helper.applyAliases(Helper.stripLoader(moduleID), aliases), moduleReplacements);
                            var resolvedPath = _path3.default.resolve(referencePath, moduleID);
                            if (_clientnode2.default.isDirectorySync(resolvedPath)) {
                                normalizedInternalInjection[chunkName].splice(index, 1);
                                var _iteratorNormalCompletion8 = true;
                                var _didIteratorError8 = false;
                                var _iteratorError8 = undefined;

                                try {
                                    for (var _iterator8 = (0, _getIterator3.default)(_clientnode2.default.walkDirectoryRecursivelySync(resolvedPath, function (file) {
                                        if (Helper.isFilePathInLocation(file.path, pathsToIgnore)) return false;
                                    })), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                        var file = _step8.value;

                                        if (file.stats && file.stats.isFile()) normalizedInternalInjection[chunkName].push('./' + _path3.default.relative(referencePath, _path3.default.resolve(resolvedPath, file.path)));
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
                            } else if (moduleID.startsWith('./') && !moduleID.startsWith('./' + _path3.default.relative(context, referencePath))) normalizedInternalInjection[chunkName][index] = './' + _path3.default.relative(context, resolvedPath);
                            index += 1;
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
                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        for (var _iterator9 = (0, _getIterator3.default)(chunkNamesToDelete), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            var _chunkName = _step9.value;

                            delete result[_chunkName];
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
            var _arr3 = ['internal', 'external'];
            for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
                var type = _arr3[_i3];
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
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
                for (var _iterator10 = (0, _getIterator3.default)(buildConfigurations), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                    var buildConfiguration = _step10.value;

                    if (!injectedModuleIDs[buildConfiguration.outputExtension]) injectedModuleIDs[buildConfiguration.outputExtension] = [];
                    var _iteratorNormalCompletion11 = true;
                    var _didIteratorError11 = false;
                    var _iteratorError11 = undefined;

                    try {
                        for (var _iterator11 = (0, _getIterator3.default)(buildConfiguration.filePaths), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                            var moduleFilePath = _step11.value;

                            if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                                var relativeModuleFilePath = './' + _path3.default.relative(context, moduleFilePath);
                                var directoryPath = _path3.default.dirname(relativeModuleFilePath);
                                var baseName = _path3.default.basename(relativeModuleFilePath, '.' + buildConfiguration.extension);
                                var moduleID = baseName;
                                if (directoryPath !== '.') moduleID = _path3.default.join(directoryPath, baseName);
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
            if (moduleFilePath.startsWith('./')) moduleFilePath = _path3.default.join(referencePath, moduleFilePath);
            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = (0, _getIterator3.default)([referencePath].concat(relativeModuleFilePaths.map(function (filePath) {
                    return _path3.default.resolve(context, filePath);
                }))), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    var moduleLocation = _step12.value;
                    var _iteratorNormalCompletion13 = true;
                    var _didIteratorError13 = false;
                    var _iteratorError13 = undefined;

                    try {
                        for (var _iterator13 = (0, _getIterator3.default)(['', '__package__'].concat(packageEntryFileNames)), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                            var fileName = _step13.value;
                            var _iteratorNormalCompletion14 = true;
                            var _didIteratorError14 = false;
                            var _iteratorError14 = undefined;

                            try {
                                for (var _iterator14 = (0, _getIterator3.default)(extensions.module.concat([''])), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                                    var moduleExtension = _step14.value;
                                    var _iteratorNormalCompletion15 = true;
                                    var _didIteratorError15 = false;
                                    var _iteratorError15 = undefined;

                                    try {
                                        for (var _iterator15 = (0, _getIterator3.default)([''].concat(extensions.file.internal)), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                                            var fileExtension = _step15.value;

                                            var currentModuleFilePath = void 0;
                                            if (moduleFilePath.startsWith('/')) currentModuleFilePath = _path3.default.resolve(moduleFilePath);else currentModuleFilePath = _path3.default.resolve(moduleLocation, moduleFilePath);
                                            var packageAliases = {};
                                            if (fileName === '__package__') {
                                                if (_clientnode2.default.isDirectorySync(currentModuleFilePath)) {
                                                    var pathToPackageJSON = _path3.default.resolve(currentModuleFilePath, 'package.json');
                                                    if (_clientnode2.default.isFileSync(pathToPackageJSON)) {
                                                        var localConfiguration = {};
                                                        try {
                                                            localConfiguration = JSON.parse(fileSystem.readFileSync(pathToPackageJSON, { encoding: encoding }));
                                                        } catch (error) {}
                                                        var _iteratorNormalCompletion16 = true;
                                                        var _didIteratorError16 = false;
                                                        var _iteratorError16 = undefined;

                                                        try {
                                                            for (var _iterator16 = (0, _getIterator3.default)(packageMainPropertyNames), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                                                                var propertyName = _step16.value;

                                                                if (localConfiguration.hasOwnProperty(propertyName) && typeof localConfiguration[propertyName] === 'string' && localConfiguration[propertyName]) {
                                                                    fileName = localConfiguration[propertyName];
                                                                    break;
                                                                }
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

                                                        var _iteratorNormalCompletion17 = true;
                                                        var _didIteratorError17 = false;
                                                        var _iteratorError17 = undefined;

                                                        try {
                                                            for (var _iterator17 = (0, _getIterator3.default)(packageAliasPropertyNames), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                                                                var _propertyName = _step17.value;

                                                                if (localConfiguration.hasOwnProperty(_propertyName) && (0, _typeof3.default)(localConfiguration[_propertyName]) === 'object') {
                                                                    packageAliases = localConfiguration[_propertyName];
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
                                                    }
                                                }
                                                if (fileName === '__package__') continue;
                                            }
                                            fileName = Helper.applyModuleReplacements(Helper.applyAliases(fileName, packageAliases), moduleReplacements);
                                            if (fileName) currentModuleFilePath = _path3.default.resolve(currentModuleFilePath, '' + fileName + moduleExtension + fileExtension);else currentModuleFilePath += '' + fileName + moduleExtension + fileExtension;
                                            if (Helper.isFilePathInLocation(currentModuleFilePath, pathsToIgnore)) continue;
                                            if (_clientnode2.default.isFileSync(currentModuleFilePath)) return currentModuleFilePath;
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUhKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUpKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVRNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBbUdOLG1CQUFPLElBQVA7QUFDSDtBQUNEO0FBQ0E7Ozs7Ozs7OztxQ0FNb0IsUSxFQUFpQixPLEVBQTRCO0FBQzdELGlCQUFLLElBQU0sS0FBWCxJQUEyQixPQUEzQjtBQUNJLG9CQUFJLE1BQU0sUUFBTixDQUFlLEdBQWYsQ0FBSixFQUF5QjtBQUNyQix3QkFBSSxhQUFhLE1BQU0sU0FBTixDQUFnQixDQUFoQixFQUFtQixNQUFNLE1BQU4sR0FBZSxDQUFsQyxDQUFqQixFQUNJLFdBQVcsUUFBUSxLQUFSLENBQVg7QUFDUCxpQkFIRCxNQUlJLFdBQVcsU0FBUyxPQUFULENBQWlCLEtBQWpCLEVBQXdCLFFBQVEsS0FBUixDQUF4QixDQUFYO0FBTFIsYUFNQSxPQUFPLFFBQVA7QUFDSDtBQUNEOzs7Ozs7Ozs7O2dEQVFJLFEsRUFBaUIsWSxFQUNaO0FBQ0wsaUJBQUssSUFBTSxXQUFYLElBQWlDLFlBQWpDO0FBQ0ksb0JBQUksYUFBYSxjQUFiLENBQTRCLFdBQTVCLENBQUosRUFDSSxXQUFXLFNBQVMsT0FBVCxDQUNQLElBQUksTUFBSixDQUFXLFdBQVgsQ0FETyxFQUNrQixhQUFhLFdBQWIsQ0FEbEIsQ0FBWDtBQUZSLGFBSUEsT0FBTyxRQUFQO0FBQ0g7Ozs7O2tCQUVVLE07QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImhlbHBlci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB0eXBlIHtEb21Ob2RlfSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgdHlwZSB7RmlsZSwgUGxhaW5PYmplY3QsIFdpbmRvd30gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB7SlNET00gYXMgRE9NfSBmcm9tICdqc2RvbSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IHR5cGUge1xuICAgIEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBFeHRlbnNpb25zLFxuICAgIEluamVjdGlvbixcbiAgICBJbnRlcm5hbEluamVjdGlvbixcbiAgICBOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24sXG4gICAgUGF0aCxcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbn0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbWV0aG9kc1xuLyoqXG4gKiBQcm92aWRlcyBhIGNsYXNzIG9mIHN0YXRpYyBtZXRob2RzIHdpdGggZ2VuZXJpYyB1c2UgY2FzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWxwZXIge1xuICAgIC8vIHJlZ2lvbiBib29sZWFuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gZ2l2ZW4gbGlzdCBvZiBmaWxlXG4gICAgICogbG9jYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0gbG9jYXRpb25zVG9DaGVjayAtIExvY2F0aW9ucyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBWYWx1ZSBcInRydWVcIiBpZiBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIG9uZSBvZiBnaXZlblxuICAgICAqIGxvY2F0aW9ucyBvciBcImZhbHNlXCIgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBsb2NhdGlvbnNUb0NoZWNrOkFycmF5PHN0cmluZz5cbiAgICApOmJvb2xlYW4ge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGhUb0NoZWNrOnN0cmluZyBvZiBsb2NhdGlvbnNUb0NoZWNrKVxuICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShmaWxlUGF0aCkuc3RhcnRzV2l0aChwYXRoLnJlc29sdmUocGF0aFRvQ2hlY2spKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHN0cmluZ1xuICAgIC8qKlxuICAgICAqIEluIHBsYWNlcyBlYWNoIG1hdGNoaW5nIGNhc2NhZGluZyBzdHlsZSBzaGVldCBvciBqYXZhU2NyaXB0IGZpbGVcbiAgICAgKiByZWZlcmVuY2UuXG4gICAgICogQHBhcmFtIGNvbnRlbnQgLSBNYXJrdXAgY29udGVudCB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybiAtIFBhdHRlcm4gdG8gbWF0Y2ggY2FzY2FkaW5nIHN0eWxlXG4gICAgICogc2hlZXQgYXNzZXQgcmVmZXJlbmNlcyBhZ2Fpbi5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdFBhdHRlcm4gLSBQYXR0ZXJuIHRvIG1hdGNoIGphdmFTY3JpcHQgYXNzZXQgcmVmZXJlbmNlc1xuICAgICAqIGFnYWluLlxuICAgICAqIEBwYXJhbSBiYXNlUGF0aCAtIEJhc2UgcGF0aCB0byB1c2UgYXMgcHJlZml4IGZvciBmaWxlIHJlZmVyZW5jZXMuXG4gICAgICogQHBhcmFtIGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZSAtIENhc2NhZGluZyBzdHlsZSBzaGVldFxuICAgICAqIGNodW5rIG5hbWUgdGVtcGxhdGUgdG8gdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlIC0gSmF2YVNjcmlwdCBjaHVuayBuYW1lIHRlbXBsYXRlIHRvXG4gICAgICogdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gYXNzZXRzIC0gTWFwcGluZyBvZiBhc3NldCBmaWxlIHBhdGhzIHRvIHRoZWlyIGNvbnRlbnQuXG4gICAgICogQHJldHVybnMgR2l2ZW4gYW4gdHJhbnNmb3JtZWQgbWFya3VwLlxuICAgICAqL1xuICAgIHN0YXRpYyBpblBsYWNlQ1NTQW5kSmF2YVNjcmlwdEFzc2V0UmVmZXJlbmNlcyhcbiAgICAgICAgY29udGVudDpzdHJpbmcsXG4gICAgICAgIGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuOj97W2tleTpzdHJpbmddOidib2R5J3wnaGVhZCd8J2luJ3xzdHJpbmd9LFxuICAgICAgICBqYXZhU2NyaXB0UGF0dGVybjo/e1trZXk6c3RyaW5nXTonYm9keSd8J2hlYWQnfCdpbid8c3RyaW5nfSxcbiAgICAgICAgYmFzZVBhdGg6c3RyaW5nLFxuICAgICAgICBjYXNjYWRpbmdTdHlsZVNoZWV0Q2h1bmtOYW1lVGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBqYXZhU2NyaXB0Q2h1bmtOYW1lVGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBhc3NldHM6e1trZXk6c3RyaW5nXTpPYmplY3R9XG4gICAgKTp7XG4gICAgICAgIGNvbnRlbnQ6c3RyaW5nO1xuICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+O1xuICAgIH0ge1xuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byBwcmV2ZW50IGNyZWF0aW5nIG5hdGl2ZSBcInN0eWxlXCIgZG9tIG5vZGVzIHRvXG4gICAgICAgICAgICBwcmV2ZW50IGpzZG9tIGZyb20gcGFyc2luZyB0aGUgZW50aXJlIGNhc2NhZGluZyBzdHlsZSBzaGVldC4gV2hpY2hcbiAgICAgICAgICAgIGlzIGVycm9yIHBydW5lIGFuZCB2ZXJ5IHJlc291cmNlIGludGVuc2l2ZS5cbiAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3R5bGVDb250ZW50czpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgIC8oPHN0eWxlW14+XSo+KShbXFxzXFxTXSo/KSg8XFwvc3R5bGVbXj5dKj4pL2dpLCAoXG4gICAgICAgICAgICAgICAgbWF0Y2g6c3RyaW5nLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGFnOnN0cmluZyxcbiAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZyxcbiAgICAgICAgICAgICAgICBlbmRUYWc6c3RyaW5nXG4gICAgICAgICAgICApOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgc3R5bGVDb250ZW50cy5wdXNoKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3N0YXJ0VGFnfSR7ZW5kVGFnfWBcbiAgICAgICAgICAgIH0pXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHRyYW5zbGF0ZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgdG8gaHRtbCBjb21wYXRpYmxlXG4gICAgICAgICAgICBzZXF1ZW5jZXMgYW5kIHRyYW5zbGF0ZSBpdCBiYWNrIGxhdGVyIHRvIGF2b2lkIHVuZXhwZWN0ZWQgZXNjYXBlXG4gICAgICAgICAgICBzZXF1ZW5jZXMgaW4gcmVzdWx0aW5nIGh0bWwuXG4gICAgICAgICovXG4gICAgICAgIGNvbnN0IHdpbmRvdzpXaW5kb3cgPSAobmV3IERPTShcbiAgICAgICAgICAgIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvPCUvZywgJyMjKyMrIysjIycpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyU+L2csICcjIy0jLSMtIyMnKVxuICAgICAgICApKS53aW5kb3dcbiAgICAgICAgY29uc3QgaW5QbGFjZVN0eWxlQ29udGVudHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBmb3IgKGNvbnN0IGFzc2V0VHlwZTpQbGFpbk9iamVjdCBvZiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlTmFtZTogJ2hyZWYnLFxuICAgICAgICAgICAgICAgIGhhc2g6ICdjb250ZW50aGFzaCcsXG4gICAgICAgICAgICAgICAgbGlua1RhZ05hbWU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybixcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogJ1tocmVmKj1cIi5jc3NcIl0nLFxuICAgICAgICAgICAgICAgIHRhZ05hbWU6ICdzdHlsZScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVOYW1lOiAnc3JjJyxcbiAgICAgICAgICAgICAgICBoYXNoOiAnaGFzaCcsXG4gICAgICAgICAgICAgICAgbGlua1RhZ05hbWU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgICAgIHBhdHRlcm46IGphdmFTY3JpcHRQYXR0ZXJuLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiAnW2hyZWYqPVwiLmpzXCJdJyxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIF0pXG4gICAgICAgICAgICBpZiAoYXNzZXRUeXBlLnBhdHRlcm4pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuOnN0cmluZyBpbiBhc3NldFR5cGUucGF0dGVybikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2V0VHlwZS5wYXR0ZXJuLmhhc093blByb3BlcnR5KHBhdHRlcm4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yOnN0cmluZyA9IGFzc2V0VHlwZS5zZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICBpZiAocGF0dGVybiAhPT0gJyonKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7YXNzZXRUeXBlLmF0dHJpYnV0ZU5hbWV9Xj1cImAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoLCBIZWxwZXIucmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZS50ZW1wbGF0ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtgWyR7YXNzZXRUeXBlLmhhc2h9XWBdOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW2lkXSc6IHBhdHRlcm4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tuYW1lXSc6IHBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkgKyAnXCJdJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21Ob2RlczpBcnJheTxEb21Ob2RlPiA9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHthc3NldFR5cGUubGlua1RhZ05hbWV9JHtzZWxlY3Rvcn1gKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tTm9kZXMubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBkb21Ob2RlOkRvbU5vZGUgb2YgZG9tTm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoOnN0cmluZyA9IGRvbU5vZGUuYXR0cmlidXRlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlLmF0dHJpYnV0ZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLnZhbHVlLnJlcGxhY2UoLyYuKi9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2V0cy5oYXNPd25Qcm9wZXJ0eShwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpblBsYWNlRG9tTm9kZTpEb21Ob2RlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUudGFnTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXRUeXBlLnRhZ05hbWUgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3dlYm9wdGltaXplcmlucGxhY2UnLCAndHJ1ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VTdHlsZUNvbnRlbnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldHNbcGF0aF0uc291cmNlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLnRleHRDb250ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0c1twYXRoXS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhc3NldFR5cGUucGF0dGVybltwYXR0ZXJuXSA9PT0gJ2JvZHknKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFzc2V0VHlwZS5wYXR0ZXJuW3BhdHRlcm5dID09PSAnaW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl0gPT09ICdoZWFkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVndWxhckV4cHJlc3Npb25QYXR0ZXJuOnN0cmluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnKGFmdGVyfGJlZm9yZXxpbik6KC4rKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2g6QXJyYXk8c3RyaW5nPiA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKHJlZ3VsYXJFeHByZXNzaW9uUGF0dGVybikuZXhlYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUucGF0dGVybltwYXR0ZXJuXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnR2l2ZW4gaW4gcGxhY2Ugc3BlY2lmaWNhdGlvbiBcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS5wYXR0ZXJuW3BhdHRlcm5dfVwiIGZvciBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHthc3NldFR5cGUudGFnTmFtZX0gZG9lcyBub3QgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NhdGlzZnkgdGhlIHNwZWNpZmllZCBwYXR0ZXJuIFwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7cmVndWxhckV4cHJlc3Npb25QYXR0ZXJufVwiLmApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihtYXRjaFsyXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBTcGVjaWZpZWQgZG9tIG5vZGUgXCIke21hdGNoWzJdfVwiIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb3VsZCBub3QgYmUgZm91bmQgdG8gaW4gcGxhY2UgXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtwYXR0ZXJufVwiLmApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaFsxXSA9PT0gJ2luJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuYXBwZW5kQ2hpbGQoaW5QbGFjZURvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1hdGNoWzFdID09PSAnYmVmb3JlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUsIGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRBZnRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogVGhpcyBkb2Vzbid0IHByZXZlbnQgd2VicGFjayBmcm9tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0aW5nIHRoaXMgZmlsZSBpZiBwcmVzZW50IGluIGFub3RoZXIgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc28gcmVtb3ZpbmcgaXQgKGFuZCBhIHBvdGVudGlhbCBzb3VyY2UgbWFwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUpIGxhdGVyIGluIHRoZSBcImRvbmVcIiBob29rLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmUucHVzaChIZWxwZXIuc3RyaXBMb2FkZXIocGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGFzc2V0c1twYXRoXVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYE5vIHJlZmVyZW5jZWQgJHthc3NldFR5cGUudGFnTmFtZX0gZmlsZSBpbiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVzdWx0aW5nIG1hcmt1cCBmb3VuZCB3aXRoIHNlbGVjdG9yOiBcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS5saW5rVGFnTmFtZX0ke2Fzc2V0VHlwZS5zZWxlY3Rvcn1cImApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAvLyBOT1RFOiBXZSBoYXZlIHRvIHJlc3RvcmUgdGVtcGxhdGUgZGVsaW1pdGVyIGFuZCBzdHlsZSBjb250ZW50cy5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRcbiAgICAgICAgICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL14oXFxzKjwhZG9jdHlwZSBbXj5dKz8+XFxzKilbXFxzXFxTXSokL2ksICckMSdcbiAgICAgICAgICAgICAgICApICsgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUxcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyNcXCsjXFwrI1xcKyMjL2csICc8JScpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyMjLSMtIy0jIy9nLCAnJT4nKVxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPHN0eWxlW14+XSo+KVtcXHNcXFNdKj8oPFxcL3N0eWxlW14+XSo+KS9naSwgKFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0VGFnOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgICAgICk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0VGFnLmluY2x1ZGVzKCcgd2Vib3B0aW1pemVyaW5wbGFjZT1cInRydWVcIicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXJ0VGFnLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyB3ZWJvcHRpbWl6ZXJpbnBsYWNlPVwidHJ1ZVwiJywgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICkgKyBgJHtpblBsYWNlU3R5bGVDb250ZW50cy5zaGlmdCgpfSR7ZW5kVGFnfWBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3N0YXJ0VGFnfSR7c3R5bGVDb250ZW50cy5zaGlmdCgpfSR7ZW5kVGFnfWBcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGZpbGVQYXRoc1RvUmVtb3ZlXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU3RyaXBzIGxvYWRlciBpbmZvcm1hdGlvbnMgZm9ybSBnaXZlbiBtb2R1bGUgcmVxdWVzdCBpbmNsdWRpbmcgbG9hZGVyXG4gICAgICogcHJlZml4IGFuZCBxdWVyeSBwYXJhbWV0ZXIuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIHJlcXVlc3QgdG8gc3RyaXAuXG4gICAgICogQHJldHVybnMgR2l2ZW4gbW9kdWxlIGlkIHN0cmlwcGVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBzdHJpcExvYWRlcihtb2R1bGVJRDpzdHJpbmd8U3RyaW5nKTpzdHJpbmcge1xuICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnRvU3RyaW5nKClcbiAgICAgICAgY29uc3QgbW9kdWxlSURXaXRob3V0TG9hZGVyOnN0cmluZyA9IG1vZHVsZUlELnN1YnN0cmluZyhcbiAgICAgICAgICAgIG1vZHVsZUlELmxhc3RJbmRleE9mKCchJykgKyAxKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURXaXRob3V0TG9hZGVyLmluY2x1ZGVzKFxuICAgICAgICAgICAgJz8nXG4gICAgICAgICkgPyBtb2R1bGVJRFdpdGhvdXRMb2FkZXIuc3Vic3RyaW5nKDAsIG1vZHVsZUlEV2l0aG91dExvYWRlci5pbmRleE9mKFxuICAgICAgICAgICAgICAgICc/J1xuICAgICAgICAgICAgKSkgOiBtb2R1bGVJRFdpdGhvdXRMb2FkZXJcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGFycmF5XG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZ2l2ZW4gbGlzdCBvZiBwYXRoIHRvIGEgbm9ybWFsaXplZCBsaXN0IHdpdGggdW5pcXVlIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHMgLSBGaWxlIHBhdGhzLlxuICAgICAqIEByZXR1cm5zIFRoZSBnaXZlbiBmaWxlIHBhdGggbGlzdCB3aXRoIG5vcm1hbGl6ZWQgdW5pcXVlIHZhbHVlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgbm9ybWFsaXplUGF0aHMocGF0aHM6QXJyYXk8c3RyaW5nPik6QXJyYXk8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQocGF0aHMubWFwKChnaXZlblBhdGg6c3RyaW5nKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgZ2l2ZW5QYXRoID0gcGF0aC5ub3JtYWxpemUoZ2l2ZW5QYXRoKVxuICAgICAgICAgICAgaWYgKGdpdmVuUGF0aC5lbmRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgIHJldHVybiBnaXZlblBhdGguc3Vic3RyaW5nKDAsIGdpdmVuUGF0aC5sZW5ndGggLSAxKVxuICAgICAgICAgICAgcmV0dXJuIGdpdmVuUGF0aFxuICAgICAgICB9KSkpXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBmaWxlIGhhbmRsZXJcbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGZpbGUgcGF0aC9uYW1lIHBsYWNlaG9sZGVyIHJlcGxhY2VtZW50cyB3aXRoIGdpdmVuIGJ1bmRsZVxuICAgICAqIGFzc29jaWF0ZWQgaW5mb3JtYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aFRlbXBsYXRlIC0gRmlsZSBwYXRoIHRvIHByb2Nlc3MgcGxhY2Vob2xkZXIgaW4uXG4gICAgICogQHBhcmFtIGluZm9ybWF0aW9ucyAtIFNjb3BlIHRvIHVzZSBmb3IgcHJvY2Vzc2luZy5cbiAgICAgKiBAcmV0dXJucyBQcm9jZXNzZWQgZmlsZSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyByZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICBmaWxlUGF0aFRlbXBsYXRlOnN0cmluZywgaW5mb3JtYXRpb25zOntba2V5OnN0cmluZ106c3RyaW5nfSA9IHtcbiAgICAgICAgICAgICdbbmFtZV0nOiAnLl9fZHVtbXlfXycsICdbaWRdJzogJy5fX2R1bW15X18nLFxuICAgICAgICAgICAgJ1toYXNoXSc6ICcuX19kdW1teV9fJ1xuICAgICAgICB9XG4gICAgKTpzdHJpbmcge1xuICAgICAgICBsZXQgZmlsZVBhdGg6c3RyaW5nID0gZmlsZVBhdGhUZW1wbGF0ZVxuICAgICAgICBmb3IgKGNvbnN0IHBsYWNlaG9sZGVyTmFtZTpzdHJpbmcgaW4gaW5mb3JtYXRpb25zKVxuICAgICAgICAgICAgaWYgKGluZm9ybWF0aW9ucy5oYXNPd25Qcm9wZXJ0eShwbGFjZWhvbGRlck5hbWUpKVxuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gZmlsZVBhdGgucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMocGxhY2Vob2xkZXJOYW1lKSwgJ2cnXG4gICAgICAgICAgICAgICAgKSwgaW5mb3JtYXRpb25zW3BsYWNlaG9sZGVyTmFtZV0pXG4gICAgICAgIHJldHVybiBmaWxlUGF0aFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBnaXZlbiByZXF1ZXN0IHRvIGEgcmVzb2x2ZWQgcmVxdWVzdCB3aXRoIGdpdmVuIGNvbnRleHRcbiAgICAgKiBlbWJlZGRlZC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdCAtIFJlcXVlc3QgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gQ29udGV4dCBvZiBnaXZlbiByZXF1ZXN0IHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcmV0dXJucyBBIG5ldyByZXNvbHZlZCByZXF1ZXN0LlxuICAgICAqL1xuICAgIHN0YXRpYyBhcHBseUNvbnRleHQoXG4gICAgICAgIHJlcXVlc3Q6c3RyaW5nLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LCBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ11cbiAgICApOnN0cmluZyB7XG4gICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlc29sdmUocmVmZXJlbmNlUGF0aClcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLi8nKSAmJiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb250ZXh0XG4gICAgICAgICkgIT09IHJlZmVyZW5jZVBhdGgpIHtcbiAgICAgICAgICAgIHJlcXVlc3QgPSBwYXRoLnJlc29sdmUoY29udGV4dCwgcmVxdWVzdClcbiAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlUGF0aDpzdHJpbmcgb2YgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4OnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgbW9kdWxlUGF0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKHBhdGhQcmVmaXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhwYXRoUHJlZml4Lmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3Quc3Vic3RyaW5nKHJlcXVlc3QubGFzdEluZGV4T2YoJyEnKSArIDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlc1xuICAgICAgICAgICAgICAgICAgICApLCBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aChyZWZlcmVuY2VQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhyZWZlcmVuY2VQYXRoLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5zdWJzdHJpbmcocmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMSksIGFsaWFzZXNcbiAgICAgICAgICAgICAgICApLCBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcXVlc3RcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgZ2l2ZW4gcmVxdWVzdCBwb2ludHMgdG8gYW4gZXh0ZXJuYWwgZGVwZW5kZW5jeSBub3QgbWFpbnRhaW5lZFxuICAgICAqIGJ5IGN1cnJlbnQgcGFja2FnZSBjb250ZXh0LlxuICAgICAqIEBwYXJhbSByZXF1ZXN0IC0gUmVxdWVzdCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBDb250ZXh0IG9mIGN1cnJlbnQgcHJvamVjdC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdENvbnRleHQgLSBDb250ZXh0IG9mIGdpdmVuIHJlcXVlc3QgdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uIC0gTWFwcGluZyBvZiBjaHVuayBuYW1lcyB0byBtb2R1bGVzXG4gICAgICogd2hpY2ggc2hvdWxkIGJlIGluamVjdGVkLlxuICAgICAqIEBwYXJhbSBleHRlcm5hbE1vZHVsZUxvY2F0aW9ucyAtIEFycmF5IGlmIHBhdGhzIHdoZXJlIGV4dGVybmFsIG1vZHVsZXNcbiAgICAgKiB0YWtlIHBsYWNlLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBpbmNsdWRlUGF0dGVybiAtIEFycmF5IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZXhwbGljaXRseSBtYXJrXG4gICAgICogYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAgKiBAcGFyYW0gZXhjbHVkZVBhdHRlcm4gLSBBcnJheSBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIGV4cGxpY2l0bHkgbWFya1xuICAgICAqIGFzIGludGVybmFsIGRlcGVuZGVuY3kuXG4gICAgICogQHBhcmFtIGluUGxhY2VOb3JtYWxMaWJyYXJ5IC0gSW5kaWNhdGVzIHdoZXRoZXIgbm9ybWFsIGxpYnJhcmllcyBzaG91bGRcbiAgICAgKiBiZSBleHRlcm5hbCBvciBub3QuXG4gICAgICogQHBhcmFtIGluUGxhY2VEeW5hbWljTGlicmFyeSAtIEluZGljYXRlcyB3aGV0aGVyIHJlcXVlc3RzIHdpdGhcbiAgICAgKiBpbnRlZ3JhdGVkIGxvYWRlciBjb25maWd1cmF0aW9ucyBzaG91bGQgYmUgbWFya2VkIGFzIGV4dGVybmFsIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgLSBFbmNvZGluZyBmb3IgZmlsZSBuYW1lcyB0byB1c2UgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBBIG5ldyByZXNvbHZlZCByZXF1ZXN0IGluZGljYXRpbmcgd2hldGhlciBnaXZlbiByZXF1ZXN0IGlzIGFuXG4gICAgICogZXh0ZXJuYWwgb25lLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgIHJlcXVlc3Q6c3RyaW5nLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlcXVlc3RDb250ZXh0OnN0cmluZyA9ICcuLycsXG4gICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbjpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPSB7fSxcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSwgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGV4dGVuc2lvbnM6RXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGU6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWycuanMnXSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAnLmpzJywgJy5qc29uJywgJy5jc3MnLCAnLmVvdCcsICcuZ2lmJywgJy5odG1sJywgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgICAnLmpwZycsICcucG5nJywgJy5lanMnLCAnLnN2ZycsICcudHRmJywgJy53b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LCBtb2R1bGU6IFtdXG4gICAgICAgIH0sIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJy4vJywgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnaW5kZXgnLCAnbWFpbiddLFxuICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnbWFpbicsICdtb2R1bGUnXSxcbiAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gW10sXG4gICAgICAgIGluY2x1ZGVQYXR0ZXJuOkFycmF5PHN0cmluZ3xSZWdFeHA+ID0gW10sXG4gICAgICAgIGV4Y2x1ZGVQYXR0ZXJuOkFycmF5PHN0cmluZ3xSZWdFeHA+ID0gW10sXG4gICAgICAgIGluUGxhY2VOb3JtYWxMaWJyYXJ5OmJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgaW5QbGFjZUR5bmFtaWNMaWJyYXJ5OmJvb2xlYW4gPSB0cnVlLFxuICAgICAgICBlbmNvZGluZzpzdHJpbmcgPSAndXRmLTgnXG4gICAgKTo/c3RyaW5nIHtcbiAgICAgICAgY29udGV4dCA9IHBhdGgucmVzb2x2ZShjb250ZXh0KVxuICAgICAgICByZXF1ZXN0Q29udGV4dCA9IHBhdGgucmVzb2x2ZShyZXF1ZXN0Q29udGV4dClcbiAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVzb2x2ZShyZWZlcmVuY2VQYXRoKVxuICAgICAgICAvLyBOT1RFOiBXZSBhcHBseSBhbGlhcyBvbiBleHRlcm5hbHMgYWRkaXRpb25hbGx5LlxuICAgICAgICBsZXQgcmVzb2x2ZWRSZXF1ZXN0OnN0cmluZyA9IEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMocmVxdWVzdC5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMVxuICAgICAgICAgICAgKSwgYWxpYXNlcyksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IEFsaWFzZXMgYW5kIG1vZHVsZSByZXBsYWNlbWVudHMgZG9lc24ndCBoYXZlIHRvIGJlIGZvcndhcmRlZFxuICAgICAgICAgICAgc2luY2Ugd2UgcGFzcyBhbiBhbHJlYWR5IHJlc29sdmVkIHJlcXVlc3QuXG4gICAgICAgICovXG4gICAgICAgIGxldCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCB7fSwge30sIGV4dGVuc2lvbnMsIGNvbnRleHQsIHJlcXVlc3RDb250ZXh0LFxuICAgICAgICAgICAgcGF0aHNUb0lnbm9yZSwgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMsIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcywgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcywgZW5jb2RpbmcpXG4gICAgICAgIGlmIChUb29scy5pc0FueU1hdGNoaW5nKHJlc29sdmVkUmVxdWVzdCwgZXhjbHVkZVBhdHRlcm4pKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIG1hcmsgZGVwZW5kZW5jaWVzIGFzIGV4dGVybmFsIGlmIHRoZXJlIGZpbGUgY291bGRuJ3QgYmVcbiAgICAgICAgICAgIHJlc29sdmVkIG9yIGFyZSBzcGVjaWZpZWQgdG8gYmUgZXh0ZXJuYWwgZXhwbGljaXRseS5cbiAgICAgICAgKi9cbiAgICAgICAgaWYgKCEoZmlsZVBhdGggfHwgaW5QbGFjZU5vcm1hbExpYnJhcnkpIHx8IFRvb2xzLmlzQW55TWF0Y2hpbmcoXG4gICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsIGluY2x1ZGVQYXR0ZXJuXG4gICAgICAgICkpXG4gICAgICAgICAgICByZXR1cm4gSGVscGVyLmFwcGx5Q29udGV4dChcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsIHJlcXVlc3RDb250ZXh0LCByZWZlcmVuY2VQYXRoLFxuICAgICAgICAgICAgICAgIGFsaWFzZXMsIG1vZHVsZVJlcGxhY2VtZW50cywgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMpXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2Ygbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uW1xuICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQsIGFsaWFzZXMsIG1vZHVsZVJlcGxhY2VtZW50cywgZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIHJlcXVlc3RDb250ZXh0LCBwYXRoc1RvSWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMsIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcywgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nXG4gICAgICAgICAgICAgICAgICAgICkgPT09IGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIG1hcmsgZGVwZW5kZW5jaWVzIGFzIGV4dGVybmFsIGlmIHRoZXkgZG9lcyBub3QgY29udGFpbiBhXG4gICAgICAgICAgICBsb2FkZXIgaW4gdGhlaXIgcmVxdWVzdCBhbmQgYXJlbid0IHBhcnQgb2YgdGhlIGN1cnJlbnQgbWFpbiBwYWNrYWdlXG4gICAgICAgICAgICBvciBoYXZlIGEgZmlsZSBleHRlbnNpb24gb3RoZXIgdGhhbiBqYXZhU2NyaXB0IGF3YXJlLlxuICAgICAgICAqL1xuICAgICAgICBpZiAoIWluUGxhY2VOb3JtYWxMaWJyYXJ5ICYmIChcbiAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5sZW5ndGggPT09IDAgfHwgZmlsZVBhdGggJiZcbiAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5pbmNsdWRlcyhwYXRoLmV4dG5hbWUoZmlsZVBhdGgpKSB8fFxuICAgICAgICAgICAgIWZpbGVQYXRoICYmIGV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbC5pbmNsdWRlcygnJylcbiAgICAgICAgKSAmJiAhKGluUGxhY2VEeW5hbWljTGlicmFyeSAmJiByZXF1ZXN0LmluY2x1ZGVzKCchJykpICYmIChcbiAgICAgICAgICAgICAgICAhZmlsZVBhdGggJiYgaW5QbGFjZUR5bmFtaWNMaWJyYXJ5IHx8IGZpbGVQYXRoICYmIChcbiAgICAgICAgICAgICAgICAgICAgIWZpbGVQYXRoLnN0YXJ0c1dpdGgoY29udGV4dCkgfHxcbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zKSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseUNvbnRleHQoXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCByZXF1ZXN0Q29udGV4dCwgcmVmZXJlbmNlUGF0aCwgYWxpYXNlcyxcbiAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMsIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzKVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFzc2V0IHR5cGUgb2YgZ2l2ZW4gZmlsZS5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUgdG8gYW5hbHlzZS5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9uIC0gTWV0YSBpbmZvcm1hdGlvbnMgZm9yIGF2YWlsYWJsZSBhc3NldFxuICAgICAqIHR5cGVzLlxuICAgICAqIEBwYXJhbSBwYXRocyAtIExpc3Qgb2YgcGF0aHMgdG8gc2VhcmNoIGlmIGdpdmVuIHBhdGggZG9lc24ndCByZWZlcmVuY2VcbiAgICAgKiBhIGZpbGUgZGlyZWN0bHkuXG4gICAgICogQHJldHVybnMgRGV0ZXJtaW5lZCBmaWxlIHR5cGUgb3IgXCJudWxsXCIgb2YgZ2l2ZW4gZmlsZSBjb3VsZG4ndCBiZVxuICAgICAqIGRldGVybWluZWQuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBidWlsZENvbmZpZ3VyYXRpb246QnVpbGRDb25maWd1cmF0aW9uLCBwYXRoczpQYXRoXG4gICAgKTo/c3RyaW5nIHtcbiAgICAgICAgbGV0IHJlc3VsdDo/c3RyaW5nID0gbnVsbFxuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIGJ1aWxkQ29uZmlndXJhdGlvbilcbiAgICAgICAgICAgIGlmIChwYXRoLmV4dG5hbWUoXG4gICAgICAgICAgICAgICAgZmlsZVBhdGhcbiAgICAgICAgICAgICkgPT09IGAuJHtidWlsZENvbmZpZ3VyYXRpb25bdHlwZV0uZXh0ZW5zaW9ufWApIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0eXBlXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXN1bHQpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnc291cmNlJywgJ3RhcmdldCddKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXRUeXBlOnN0cmluZyBpbiBwYXRoc1t0eXBlXS5hc3NldClcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aHNbdHlwZV0uYXNzZXQuaGFzT3duUHJvcGVydHkoYXNzZXRUeXBlKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlICE9PSAnYmFzZScgJiYgcGF0aHNbdHlwZV0uYXNzZXRbYXNzZXRUeXBlXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGguc3RhcnRzV2l0aChwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXNzZXRUeXBlXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkcyBhIHByb3BlcnR5IHdpdGggYSBzdG9yZWQgYXJyYXkgb2YgYWxsIG1hdGNoaW5nIGZpbGUgcGF0aHMsIHdoaWNoXG4gICAgICogbWF0Y2hlcyBlYWNoIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW4gZ2l2ZW4gZW50cnkgcGF0aCBhbmQgY29udmVydHMgZ2l2ZW5cbiAgICAgKiBidWlsZCBjb25maWd1cmF0aW9uIGludG8gYSBzb3J0ZWQgYXJyYXkgd2VyZSBqYXZhU2NyaXB0IGZpbGVzIHRha2VzXG4gICAgICogcHJlY2VkZW5jZS5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiAtIEdpdmVuIGJ1aWxkIGNvbmZpZ3VyYXRpb25zLlxuICAgICAqIEBwYXJhbSBlbnRyeVBhdGggLSBQYXRoIHRvIGFuYWx5c2UgbmVzdGVkIHN0cnVjdHVyZS5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gbWFpbkZpbGVCYXNlbmFtZXMgLSBGaWxlIGJhc2VuYW1lcyB0byBzb3J0IGludG8gdGhlIGZyb250LlxuICAgICAqIEByZXR1cm5zIENvbnZlcnRlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICBjb25maWd1cmF0aW9uOkJ1aWxkQ29uZmlndXJhdGlvbiwgZW50cnlQYXRoOnN0cmluZyA9ICcuLycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICBtYWluRmlsZUJhc2VuYW1lczpBcnJheTxzdHJpbmc+ID0gWydpbmRleCcsICdtYWluJ11cbiAgICApOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uIHtcbiAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uID0gW11cbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiBjb25maWd1cmF0aW9uKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSA9XG4gICAgICAgICAgICAgICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7ZmlsZVBhdGhzOiBbXX0sIGNvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGU6RmlsZSBvZiBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKFxuICAgICAgICAgICAgICAgICAgICBlbnRyeVBhdGgsIChmaWxlOkZpbGUpOj9mYWxzZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuc3RhdHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuc3RhdHMuaXNGaWxlKCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguZXh0bmFtZShmaWxlLnBhdGgpLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgICAgICAgICApID09PSBuZXdJdGVtLmV4dGVuc2lvbiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIShuZXcgUmVnRXhwKG5ld0l0ZW0uZmlsZVBhdGhQYXR0ZXJuKSkudGVzdChmaWxlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmlsZVBhdGhzLnB1c2goZmlsZS5wYXRoKVxuICAgICAgICAgICAgICAgIG5ld0l0ZW0uZmlsZVBhdGhzLnNvcnQoKFxuICAgICAgICAgICAgICAgICAgICBmaXJzdEZpbGVQYXRoOnN0cmluZywgc2Vjb25kRmlsZVBhdGg6c3RyaW5nXG4gICAgICAgICAgICAgICAgKTpudW1iZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWFpbkZpbGVCYXNlbmFtZXMuaW5jbHVkZXMocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0RmlsZVBhdGgsIHBhdGguZXh0bmFtZShmaXJzdEZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICApKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1haW5GaWxlQmFzZW5hbWVzLmluY2x1ZGVzKHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kRmlsZVBhdGgsIHBhdGguZXh0bmFtZShzZWNvbmRGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAwXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWFpbkZpbGVCYXNlbmFtZXMuaW5jbHVkZXMocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZEZpbGVQYXRoLCBwYXRoLmV4dG5hbWUoc2Vjb25kRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5wdXNoKG5ld0l0ZW0pXG4gICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWlsZENvbmZpZ3VyYXRpb24uc29ydCgoXG4gICAgICAgICAgICBmaXJzdDpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0sXG4gICAgICAgICAgICBzZWNvbmQ6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtXG4gICAgICAgICk6bnVtYmVyID0+IHtcbiAgICAgICAgICAgIGlmIChmaXJzdC5vdXRwdXRFeHRlbnNpb24gIT09IHNlY29uZC5vdXRwdXRFeHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3Qub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgICAgICBpZiAoc2Vjb25kLm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3Qub3V0cHV0RXh0ZW5zaW9uIDwgc2Vjb25kLm91dHB1dEV4dGVuc2lvbiA/IC0xIDogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfSlcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgZmlsZSBhbmQgZGlyZWN0b3J5IHBhdGhzIHJlbGF0ZWQgdG8gZ2l2ZW4gaW50ZXJuYWxcbiAgICAgKiBtb2R1bGVzIGFzIGFycmF5LlxuICAgICAqIEBwYXJhbSBpbnRlcm5hbEluamVjdGlvbiAtIExpc3Qgb2YgbW9kdWxlIGlkcyBvciBtb2R1bGUgZmlsZSBwYXRocy5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiBtb2R1bGUgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gc2VhcmNoIGZvciBsb2NhbCBtb2R1bGVzLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocyAtIExpc3Qgb2YgcmVsYXRpdmUgZmlsZSBwYXRoIHRvIHNlYXJjaFxuICAgICAqIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlRW50cnlGaWxlTmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZW50cnkgZmlsZSBuYW1lcyB0b1xuICAgICAqIHNlYXJjaCBmb3IuIFRoZSBtYWdpYyBuYW1lIFwiX19wYWNrYWdlX19cIiB3aWxsIHNlYXJjaCBmb3IgYW4gYXBwcmVjaWF0ZVxuICAgICAqIGVudHJ5IGluIGEgXCJwYWNrYWdlLmpzb25cIiBmaWxlLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBtYWluIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHJlcHJlc2VudGluZyBlbnRyeSBtb2R1bGUgZGVmaW5pdGlvbnMuXG4gICAgICogQHBhcmFtIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMgLSBMaXN0IG9mIHBhY2thZ2UgZmlsZSBhbGlhcyBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSBzcGVjaWZpYyBtb2R1bGUgYWxpYXNlcy5cbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgLSBGaWxlIG5hbWUgZW5jb2RpbmcgdG8gdXNlIGR1cmluZyBmaWxlIHRyYXZlcnNpbmcuXG4gICAgICogQHJldHVybnMgT2JqZWN0IHdpdGggYSBmaWxlIHBhdGggYW5kIGRpcmVjdG9yeSBwYXRoIGtleSBtYXBwaW5nIHRvXG4gICAgICogY29ycmVzcG9uZGluZyBsaXN0IG9mIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgICAgIGludGVybmFsSW5qZWN0aW9uOkludGVybmFsSW5qZWN0aW9uLCBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LCBleHRlbnNpb25zOkV4dGVuc2lvbnMgPSB7XG4gICAgICAgICAgICBmaWxlOiB7XG4gICAgICAgICAgICAgICAgZXh0ZXJuYWw6IFsnLmpzJ10sXG4gICAgICAgICAgICAgICAgaW50ZXJuYWw6IFtcbiAgICAgICAgICAgICAgICAgICAgJy5qcycsICcuanNvbicsICcuY3NzJywgJy5lb3QnLCAnLmdpZicsICcuaHRtbCcsICcuaWNvJyxcbiAgICAgICAgICAgICAgICAgICAgJy5qcGcnLCAnLnBuZycsICcuZWpzJywgJy5zdmcnLCAnLnR0ZicsICcud29mZicsICcud29mZjInXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwgbW9kdWxlOiBbXVxuICAgICAgICB9LCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWycnLCAnbm9kZV9tb2R1bGVzJywgJy4uLyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICdfX3BhY2thZ2VfXycsICcnLCAnaW5kZXgnLCAnbWFpbiddLFxuICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnbWFpbicsICdtb2R1bGUnXSxcbiAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gW10sXG4gICAgICAgIGVuY29kaW5nOnN0cmluZyA9ICd1dGYtOCdcbiAgICApOntmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPjtkaXJlY3RvcnlQYXRoczpBcnJheTxzdHJpbmc+fSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbjpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gPVxuICAgICAgICAgICAgSGVscGVyLnJlc29sdmVNb2R1bGVzSW5Gb2xkZXJzKFxuICAgICAgICAgICAgICAgIEhlbHBlci5ub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihpbnRlcm5hbEluamVjdGlvbiksXG4gICAgICAgICAgICAgICAgYWxpYXNlcywgbW9kdWxlUmVwbGFjZW1lbnRzLCBjb250ZXh0LCByZWZlcmVuY2VQYXRoLFxuICAgICAgICAgICAgICAgIHBhdGhzVG9JZ25vcmUpXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2Ygbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uW1xuICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCwgYWxpYXNlcywgbW9kdWxlUmVwbGFjZW1lbnRzLCBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgcmVmZXJlbmNlUGF0aCwgcGF0aHNUb0lnbm9yZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzLCBwYWNrYWdlRW50cnlGaWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXMsIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGluZylcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHMucHVzaChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGg6c3RyaW5nID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkaXJlY3RvcnlQYXRocy5pbmNsdWRlcyhkaXJlY3RvcnlQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RvcnlQYXRocy5wdXNoKGRpcmVjdG9yeVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiB7ZmlsZVBhdGhzLCBkaXJlY3RvcnlQYXRoc31cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGxpc3Qgb2YgY29uY3JldGUgZmlsZSBwYXRocyBmb3IgZ2l2ZW4gbW9kdWxlIGlkIHBvaW50aW5nIHRvXG4gICAgICogYSBmb2xkZXIgd2hpY2ggaXNuJ3QgYSBwYWNrYWdlLlxuICAgICAqIEBwYXJhbSBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gLSBJbmplY3Rpb24gZGF0YSBzdHJ1Y3R1cmUgb2ZcbiAgICAgKiBtb2R1bGVzIHdpdGggZm9sZGVyIHJlZmVyZW5jZXMgdG8gcmVzb2x2ZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byBkZXRlcm1pbmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBpbmplY3Rpb25zIHdpdGggcmVzb2x2ZWQgZm9sZGVyIHBvaW50aW5nIG1vZHVsZXMuXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVNb2R1bGVzSW5Gb2xkZXJzKFxuICAgICAgICBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb246Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddXG4gICAgKTpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24ge1xuICAgICAgICBpZiAocmVmZXJlbmNlUGF0aC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICByZWZlcmVuY2VQYXRoID0gcGF0aC5yZWxhdGl2ZShjb250ZXh0LCByZWZlcmVuY2VQYXRoKVxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKSB7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4Om51bWJlciA9IDBcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBtb2R1bGVJRDpzdHJpbmcgb2Ygbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uW1xuICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmFwcGx5QWxpYXNlcyhIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSURcbiAgICAgICAgICAgICAgICAgICAgICAgICksIGFsaWFzZXMpLCBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkUGF0aDpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBtb2R1bGVJRClcbiAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhyZXNvbHZlZFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6RmlsZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMocmVzb2x2ZWRQYXRoLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6RmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6P2ZhbHNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZS5zdGF0cyAmJiBmaWxlLnN0YXRzLmlzRmlsZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy4vJyArIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aCwgcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFBhdGgsIGZpbGUucGF0aCkpKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQuc3RhcnRzV2l0aCgnLi8nKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIW1vZHVsZUlELnN0YXJ0c1dpdGgoJy4vJyArIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgcmVmZXJlbmNlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV1baW5kZXhdID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLi8ke3BhdGgucmVsYXRpdmUoY29udGV4dCwgcmVzb2x2ZWRQYXRoKX1gXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25cbiAgICB9XG4gICAgLyoqXG4gICAgICogRXZlcnkgaW5qZWN0aW9uIGRlZmluaXRpb24gdHlwZSBjYW4gYmUgcmVwcmVzZW50ZWQgYXMgcGxhaW4gb2JqZWN0XG4gICAgICogKG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lIHRvIGFycmF5IG9mIG1vZHVsZSBpZHMpLiBUaGlzIG1ldGhvZCBjb252ZXJ0c1xuICAgICAqIGVhY2ggcmVwcmVzZW50YXRpb24gaW50byB0aGUgbm9ybWFsaXplZCBwbGFpbiBvYmplY3Qgbm90YXRpb24uXG4gICAgICogQHBhcmFtIGludGVybmFsSW5qZWN0aW9uIC0gR2l2ZW4gaW50ZXJuYWwgaW5qZWN0aW9uIHRvIG5vcm1hbGl6ZS5cbiAgICAgKiBAcmV0dXJucyBOb3JtYWxpemVkIHJlcHJlc2VudGF0aW9uIG9mIGdpdmVuIGludGVybmFsIGluamVjdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgbm9ybWFsaXplSW50ZXJuYWxJbmplY3Rpb24oXG4gICAgICAgIGludGVybmFsSW5qZWN0aW9uOkludGVybmFsSW5qZWN0aW9uXG4gICAgKTpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24ge1xuICAgICAgICBsZXQgcmVzdWx0Ok5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiA9IHt9XG4gICAgICAgIGlmIChpbnRlcm5hbEluamVjdGlvbiBpbnN0YW5jZW9mIE9iamVjdCAmJiBUb29scy5pc1BsYWluT2JqZWN0KFxuICAgICAgICAgICAgaW50ZXJuYWxJbmplY3Rpb25cbiAgICAgICAgKSkge1xuICAgICAgICAgICAgbGV0IGhhc0NvbnRlbnQ6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgICAgICBjb25zdCBjaHVua05hbWVzVG9EZWxldGU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gaW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVzVG9EZWxldGUucHVzaChjaHVua05hbWUpXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjaHVua05hbWVdID0gW2ludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoYXNDb250ZW50KVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBvZiBjaHVua05hbWVzVG9EZWxldGUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogW119XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGludGVybmFsSW5qZWN0aW9uID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogW2ludGVybmFsSW5qZWN0aW9uXX1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpbnRlcm5hbEluamVjdGlvbikpXG4gICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IGludGVybmFsSW5qZWN0aW9ufVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIGNvbmNyZXRlIGZpbGUgcGF0aHMgZm9yIGdpdmVuIGluamVjdGlvbiB3aGljaCBhcmUgbWFya2VkXG4gICAgICogd2l0aCB0aGUgXCJfX2F1dG9fX1wiIGluZGljYXRvci5cbiAgICAgKiBAcGFyYW0gZ2l2ZW5JbmplY3Rpb24gLSBHaXZlbiBpbnRlcm5hbCBhbmQgZXh0ZXJuYWwgaW5qZWN0aW9uIHRvIHRha2VcbiAgICAgKiBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbnMgLSBSZXNvbHZlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqIEBwYXJhbSBtb2R1bGVzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgdG8gZXhjbHVkZSAoc3BlY2lmaWVkIGJ5XG4gICAgICogcGF0aCBvciBpZCkgb3IgYSBtYXBwaW5nIGZyb20gY2h1bmsgbmFtZXMgdG8gbW9kdWxlIGlkcy5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byB1c2UgYXMgc3RhcnRpbmcgcG9pbnQuXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBSZWZlcmVuY2UgcGF0aCBmcm9tIHdoZXJlIGxvY2FsIGZpbGVzIHNob3VsZCBiZVxuICAgICAqIHJlc29sdmVkLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGluamVjdGlvbiB3aXRoIHJlc29sdmVkIG1hcmtlZCBpbmRpY2F0b3JzLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlSW5qZWN0aW9uKFxuICAgICAgICBnaXZlbkluamVjdGlvbjpJbmplY3Rpb24sXG4gICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIG1vZHVsZXNUb0V4Y2x1ZGU6SW50ZXJuYWxJbmplY3Rpb24sXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSwgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGV4dGVuc2lvbnM6RXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGU6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWycuanMnXSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAnLmpzJywgJy5qc29uJywgJy5jc3MnLCAnLmVvdCcsICcuZ2lmJywgJy5odG1sJywgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgICAnLmpwZycsICcucG5nJywgJy5lanMnLCAnLnN2ZycsICcudHRmJywgJy53b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LCBtb2R1bGU6IFtdXG4gICAgICAgIH0sIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOkluamVjdGlvbiB7XG4gICAgICAgIGNvbnN0IGluamVjdGlvbjpJbmplY3Rpb24gPSBUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICB0cnVlLCB7fSwgZ2l2ZW5JbmplY3Rpb24pXG4gICAgICAgIGNvbnN0IG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZTpBcnJheTxzdHJpbmc+ID1cbiAgICAgICAgICAgIEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgICAgICAgICAgICAgbW9kdWxlc1RvRXhjbHVkZSwgYWxpYXNlcywgbW9kdWxlUmVwbGFjZW1lbnRzLCBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIGNvbnRleHQsIHJlZmVyZW5jZVBhdGgsIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICkuZmlsZVBhdGhzXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydpbnRlcm5hbCcsICdleHRlcm5hbCddKVxuICAgICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY3VybHkgKi9cbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5qZWN0aW9uW3R5cGVdID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBpbmplY3Rpb25bdHlwZV0pXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXSA9PT0gJ19fYXV0b19fJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0gPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kdWxlczp7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2tleTpzdHJpbmddOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IEhlbHBlci5nZXRBdXRvQ2h1bmsoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9ucywgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1YkNodW5rTmFtZTpzdHJpbmcgaW4gbW9kdWxlcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlcy5oYXNPd25Qcm9wZXJ0eShzdWJDaHVua05hbWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXS5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlc1tzdWJDaHVua05hbWVdKVxuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZXZlcnNlIGFycmF5IHRvIGxldCBqYXZhU2NyaXB0IGFuZCBtYWluIGZpbGVzIGJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGxhc3Qgb25lcyB0byBleHBvcnQgdGhlbSByYXRoZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0ucmV2ZXJzZSgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5qZWN0aW9uW3R5cGVdID09PSAnX19hdXRvX18nKVxuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBjdXJseSAqL1xuICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXSA9IEhlbHBlci5nZXRBdXRvQ2h1bmsoXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnMsIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZSwgY29udGV4dClcbiAgICAgICAgcmV0dXJuIGluamVjdGlvblxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBtb2R1bGUgZmlsZSBwYXRocy5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9ucyAtIFJlc29sdmVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZSAtIEEgbGlzdCBvZiBtb2R1bGVzIGZpbGUgcGF0aHMgdG9cbiAgICAgKiBleGNsdWRlIChzcGVjaWZpZWQgYnkgcGF0aCBvciBpZCkgb3IgYSBtYXBwaW5nIGZyb20gY2h1bmsgbmFtZXMgdG9cbiAgICAgKiBtb2R1bGUgaWRzLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcmV0dXJucyBBbGwgZGV0ZXJtaW5lZCBtb2R1bGUgZmlsZSBwYXRocy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0QXV0b0NodW5rKFxuICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uLFxuICAgICAgICBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGU6QXJyYXk8c3RyaW5nPiwgY29udGV4dDpzdHJpbmdcbiAgICApOntba2V5OnN0cmluZ106c3RyaW5nfSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdDp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7fVxuICAgICAgICBjb25zdCBpbmplY3RlZE1vZHVsZUlEczp7W2tleTpzdHJpbmddOkFycmF5PHN0cmluZz59ID0ge31cbiAgICAgICAgZm9yIChcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbjpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0gb2ZcbiAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnNcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAoIWluamVjdGVkTW9kdWxlSURzW2J1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25dKVxuICAgICAgICAgICAgICAgIGluamVjdGVkTW9kdWxlSURzW2J1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25dID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlRmlsZVBhdGg6c3RyaW5nIG9mIGJ1aWxkQ29uZmlndXJhdGlvbi5maWxlUGF0aHMpXG4gICAgICAgICAgICAgICAgaWYgKCFtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUuaW5jbHVkZXMobW9kdWxlRmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlTW9kdWxlRmlsZVBhdGg6c3RyaW5nID0gJy4vJyArIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aDpzdHJpbmcgPSBwYXRoLmRpcm5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXNlTmFtZTpzdHJpbmcgPSBwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGAuJHtidWlsZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ufWApXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb2R1bGVJRDpzdHJpbmcgPSBiYXNlTmFtZVxuICAgICAgICAgICAgICAgICAgICBpZiAoZGlyZWN0b3J5UGF0aCAhPT0gJy4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBwYXRoLmpvaW4oZGlyZWN0b3J5UGF0aCwgYmFzZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICBFbnN1cmUgdGhhdCBlYWNoIG91dHB1dCB0eXBlIGhhcyBvbmx5IG9uZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWluamVjdGVkTW9kdWxlSURzW1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICBdLmluY2x1ZGVzKG1vZHVsZUlEKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBFbnN1cmUgdGhhdCBzYW1lIG1vZHVsZSBpZHMgYW5kIGRpZmZlcmVudCBvdXRwdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlcyBjYW4gYmUgZGlzdGluZ3Vpc2hlZCBieSB0aGVpciBleHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoSmF2YVNjcmlwdC1Nb2R1bGVzIHJlbWFpbnMgd2l0aG91dCBleHRlbnNpb24gc2luY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGV5IHdpbGwgYmUgaGFuZGxlZCBmaXJzdCBiZWNhdXNlIHRoZSBidWlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zIGFyZSBleHBlY3RlZCB0byBiZSBzb3J0ZWQgaW4gdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQpLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuaGFzT3duUHJvcGVydHkobW9kdWxlSUQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtyZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbbW9kdWxlSURdID0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0ZWRNb2R1bGVJRHNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgXS5wdXNoKG1vZHVsZUlEKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gZGV0ZXJtaW5lIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byByZXNvbHZlIGxvY2FsIG1vZHVsZXMgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBlbmNvZGluZyAtIEVuY29kaW5nIHRvIHVzZSBmb3IgZmlsZSBuYW1lcyBkdXJpbmcgZmlsZSB0cmF2ZXJzaW5nLlxuICAgICAqIEByZXR1cm5zIEZpbGUgcGF0aCBvciBnaXZlbiBtb2R1bGUgaWQgaWYgZGV0ZXJtaW5hdGlvbnMgaGFzIGZhaWxlZCBvclxuICAgICAqIHdhc24ndCBuZWNlc3NhcnkuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICBtb2R1bGVJRDpzdHJpbmcsIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sIGV4dGVuc2lvbnM6RXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGU6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWycuanMnXSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAnLmpzJywgJy5qc29uJywgJy5jc3MnLCAnLmVvdCcsICcuZ2lmJywgJy5odG1sJywgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgICAnLmpwZycsICcucG5nJywgJy5lanMnLCAnLnN2ZycsICcudHRmJywgJy53b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LCBtb2R1bGU6IFtdXG4gICAgICAgIH0sIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnaW5kZXgnXSxcbiAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ21haW4nXSxcbiAgICAgICAgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gW10sXG4gICAgICAgIGVuY29kaW5nOnN0cmluZyA9ICd1dGYtOCdcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBtb2R1bGVJRCA9IEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhIZWxwZXIuYXBwbHlBbGlhc2VzKFxuICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKG1vZHVsZUlEKSwgYWxpYXNlc1xuICAgICAgICApLCBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgIGlmICghbW9kdWxlSUQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBsZXQgbW9kdWxlRmlsZVBhdGg6c3RyaW5nID0gbW9kdWxlSURcbiAgICAgICAgaWYgKG1vZHVsZUZpbGVQYXRoLnN0YXJ0c1dpdGgoJy4vJykpXG4gICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCA9IHBhdGguam9pbihyZWZlcmVuY2VQYXRoLCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgZm9yIChjb25zdCBtb2R1bGVMb2NhdGlvbjpzdHJpbmcgb2YgW3JlZmVyZW5jZVBhdGhdLmNvbmNhdChcbiAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICBwYXRoLnJlc29sdmUoY29udGV4dCwgZmlsZVBhdGgpKVxuICAgICAgICApKVxuICAgICAgICAgICAgZm9yIChsZXQgZmlsZU5hbWU6c3RyaW5nIG9mIFsnJywgJ19fcGFja2FnZV9fJ10uY29uY2F0KFxuICAgICAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lc1xuICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUV4dGVuc2lvbjpzdHJpbmcgb2YgZXh0ZW5zaW9ucy5tb2R1bGUuY29uY2F0KFtcbiAgICAgICAgICAgICAgICAgICAgJydcbiAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlRXh0ZW5zaW9uOnN0cmluZyBvZiBbJyddLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbFxuICAgICAgICAgICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudE1vZHVsZUZpbGVQYXRoOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZUZpbGVQYXRoLnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlTG9jYXRpb24sIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBhY2thZ2VBbGlhc2VzOlBsYWluT2JqZWN0ID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ19fcGFja2FnZV9fJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aFRvUGFja2FnZUpTT046c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoLCAncGFja2FnZS5qc29uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMocGF0aFRvUGFja2FnZUpTT04pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbG9jYWxDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS5yZWFkRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoVG9QYWNrYWdlSlNPTiwge2VuY29kaW5nfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiYgdHlwZW9mIGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb25bcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZSA9IGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5TmFtZTpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gPT09ICdvYmplY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc2VzID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ19fcGFja2FnZV9fJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5hcHBseUFsaWFzZXMoZmlsZU5hbWUsIHBhY2thZ2VBbGlhc2VzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2ZpbGVOYW1lfSR7bW9kdWxlRXh0ZW5zaW9ufSR7ZmlsZUV4dGVuc2lvbn1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCArPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtmaWxlTmFtZX0ke21vZHVsZUV4dGVuc2lvbn0ke2ZpbGVFeHRlbnNpb259YFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGgsIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKGN1cnJlbnRNb2R1bGVGaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEByZXR1cm5zIFRoZSBhbGlhcyBhcHBsaWVkIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlBbGlhc2VzKG1vZHVsZUlEOnN0cmluZywgYWxpYXNlczpQbGFpbk9iamVjdCk6c3RyaW5nIHtcbiAgICAgICAgZm9yIChjb25zdCBhbGlhczpzdHJpbmcgaW4gYWxpYXNlcylcbiAgICAgICAgICAgIGlmIChhbGlhcy5lbmRzV2l0aCgnJCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZUlEID09PSBhbGlhcy5zdWJzdHJpbmcoMCwgYWxpYXMubGVuZ3RoIC0gMSkpXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gYWxpYXNlc1thbGlhc11cbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQucmVwbGFjZShhbGlhcywgYWxpYXNlc1thbGlhc10pXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gcmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIHRoZWlyXG4gICAgICogY29ycmVzcG9uZGluZyByZXBsYWNlbWVudHMuXG4gICAgICogQHJldHVybnMgVGhlIHJlcGxhY2VtZW50IGFwcGxpZWQgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhcHBseU1vZHVsZVJlcGxhY2VtZW50cyhcbiAgICAgICAgbW9kdWxlSUQ6c3RyaW5nLCByZXBsYWNlbWVudHM6UGxhaW5PYmplY3RcbiAgICApOnN0cmluZyB7XG4gICAgICAgIGZvciAoY29uc3QgcmVwbGFjZW1lbnQ6c3RyaW5nIGluIHJlcGxhY2VtZW50cylcbiAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudHMuaGFzT3duUHJvcGVydHkocmVwbGFjZW1lbnQpKVxuICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlZ0V4cChyZXBsYWNlbWVudCksIHJlcGxhY2VtZW50c1tyZXBsYWNlbWVudF0pXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFxuICAgIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEhlbHBlclxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==