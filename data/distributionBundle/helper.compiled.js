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
                    if (pattern !== '*') selector = '[' + assetType.attributeName + '="' + _path3.default.relative(basePath, Helper.renderFilePathTemplate(assetType.template, (_Helper$renderFilePat = {}, (0, _defineProperty3.default)(_Helper$renderFilePat, '[' + assetType.hash + ']', ''), (0, _defineProperty3.default)(_Helper$renderFilePat, '[id]', pattern), (0, _defineProperty3.default)(_Helper$renderFilePat, '[name]', pattern), _Helper$renderFilePat))) + '"]';
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUhKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUpKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVRNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBbUdOLG1CQUFPLElBQVA7QUFDSDtBQUNEO0FBQ0E7Ozs7Ozs7OztxQ0FNb0IsUSxFQUFpQixPLEVBQTRCO0FBQzdELGlCQUFLLElBQU0sS0FBWCxJQUEyQixPQUEzQjtBQUNJLG9CQUFJLE1BQU0sUUFBTixDQUFlLEdBQWYsQ0FBSixFQUF5QjtBQUNyQix3QkFBSSxhQUFhLE1BQU0sU0FBTixDQUFnQixDQUFoQixFQUFtQixNQUFNLE1BQU4sR0FBZSxDQUFsQyxDQUFqQixFQUNJLFdBQVcsUUFBUSxLQUFSLENBQVg7QUFDUCxpQkFIRCxNQUlJLFdBQVcsU0FBUyxPQUFULENBQWlCLEtBQWpCLEVBQXdCLFFBQVEsS0FBUixDQUF4QixDQUFYO0FBTFIsYUFNQSxPQUFPLFFBQVA7QUFDSDtBQUNEOzs7Ozs7Ozs7O2dEQVFJLFEsRUFBaUIsWSxFQUNaO0FBQ0wsaUJBQUssSUFBTSxXQUFYLElBQWlDLFlBQWpDO0FBQ0ksb0JBQUksYUFBYSxjQUFiLENBQTRCLFdBQTVCLENBQUosRUFDSSxXQUFXLFNBQVMsT0FBVCxDQUNQLElBQUksTUFBSixDQUFXLFdBQVgsQ0FETyxFQUNrQixhQUFhLFdBQWIsQ0FEbEIsQ0FBWDtBQUZSLGFBSUEsT0FBTyxRQUFQO0FBQ0g7Ozs7O2tCQUVVLE07QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImhlbHBlci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB0eXBlIHtEb21Ob2RlfSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgdHlwZSB7RmlsZSwgUGxhaW5PYmplY3QsIFdpbmRvd30gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB7SlNET00gYXMgRE9NfSBmcm9tICdqc2RvbSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IHR5cGUge1xuICAgIEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBFeHRlbnNpb25zLFxuICAgIEluamVjdGlvbixcbiAgICBJbnRlcm5hbEluamVjdGlvbixcbiAgICBOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24sXG4gICAgUGF0aCxcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbn0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbWV0aG9kc1xuLyoqXG4gKiBQcm92aWRlcyBhIGNsYXNzIG9mIHN0YXRpYyBtZXRob2RzIHdpdGggZ2VuZXJpYyB1c2UgY2FzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWxwZXIge1xuICAgIC8vIHJlZ2lvbiBib29sZWFuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gZ2l2ZW4gbGlzdCBvZiBmaWxlXG4gICAgICogbG9jYXRpb25zLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0gbG9jYXRpb25zVG9DaGVjayAtIExvY2F0aW9ucyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBWYWx1ZSBcInRydWVcIiBpZiBnaXZlbiBmaWxlIHBhdGggaXMgd2l0aGluIG9uZSBvZiBnaXZlblxuICAgICAqIGxvY2F0aW9ucyBvciBcImZhbHNlXCIgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBsb2NhdGlvbnNUb0NoZWNrOkFycmF5PHN0cmluZz5cbiAgICApOmJvb2xlYW4ge1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGhUb0NoZWNrOnN0cmluZyBvZiBsb2NhdGlvbnNUb0NoZWNrKVxuICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShmaWxlUGF0aCkuc3RhcnRzV2l0aChwYXRoLnJlc29sdmUocGF0aFRvQ2hlY2spKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHN0cmluZ1xuICAgIC8qKlxuICAgICAqIEluIHBsYWNlcyBlYWNoIG1hdGNoaW5nIGNhc2NhZGluZyBzdHlsZSBzaGVldCBvciBqYXZhU2NyaXB0IGZpbGVcbiAgICAgKiByZWZlcmVuY2UuXG4gICAgICogQHBhcmFtIGNvbnRlbnQgLSBNYXJrdXAgY29udGVudCB0byBwcm9jZXNzLlxuICAgICAqIEBwYXJhbSBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybiAtIFBhdHRlcm4gdG8gbWF0Y2ggY2FzY2FkaW5nIHN0eWxlXG4gICAgICogc2hlZXQgYXNzZXQgcmVmZXJlbmNlcyBhZ2Fpbi5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdFBhdHRlcm4gLSBQYXR0ZXJuIHRvIG1hdGNoIGphdmFTY3JpcHQgYXNzZXQgcmVmZXJlbmNlc1xuICAgICAqIGFnYWluLlxuICAgICAqIEBwYXJhbSBiYXNlUGF0aCAtIEJhc2UgcGF0aCB0byB1c2UgYXMgcHJlZml4IGZvciBmaWxlIHJlZmVyZW5jZXMuXG4gICAgICogQHBhcmFtIGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZSAtIENhc2NhZGluZyBzdHlsZSBzaGVldFxuICAgICAqIGNodW5rIG5hbWUgdGVtcGxhdGUgdG8gdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlIC0gSmF2YVNjcmlwdCBjaHVuayBuYW1lIHRlbXBsYXRlIHRvXG4gICAgICogdXNlIGZvciBhc3NldCBtYXRjaGluZy5cbiAgICAgKiBAcGFyYW0gYXNzZXRzIC0gTWFwcGluZyBvZiBhc3NldCBmaWxlIHBhdGhzIHRvIHRoZWlyIGNvbnRlbnQuXG4gICAgICogQHJldHVybnMgR2l2ZW4gYW4gdHJhbnNmb3JtZWQgbWFya3VwLlxuICAgICAqL1xuICAgIHN0YXRpYyBpblBsYWNlQ1NTQW5kSmF2YVNjcmlwdEFzc2V0UmVmZXJlbmNlcyhcbiAgICAgICAgY29udGVudDpzdHJpbmcsXG4gICAgICAgIGNhc2NhZGluZ1N0eWxlU2hlZXRQYXR0ZXJuOj97W2tleTpzdHJpbmddOidib2R5J3wnaGVhZCd8J2luJ3xzdHJpbmd9LFxuICAgICAgICBqYXZhU2NyaXB0UGF0dGVybjo/e1trZXk6c3RyaW5nXTonYm9keSd8J2hlYWQnfCdpbid8c3RyaW5nfSxcbiAgICAgICAgYmFzZVBhdGg6c3RyaW5nLFxuICAgICAgICBjYXNjYWRpbmdTdHlsZVNoZWV0Q2h1bmtOYW1lVGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBqYXZhU2NyaXB0Q2h1bmtOYW1lVGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBhc3NldHM6e1trZXk6c3RyaW5nXTpPYmplY3R9XG4gICAgKTp7XG4gICAgICAgIGNvbnRlbnQ6c3RyaW5nO1xuICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+O1xuICAgIH0ge1xuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byBwcmV2ZW50IGNyZWF0aW5nIG5hdGl2ZSBcInN0eWxlXCIgZG9tIG5vZGVzIHRvXG4gICAgICAgICAgICBwcmV2ZW50IGpzZG9tIGZyb20gcGFyc2luZyB0aGUgZW50aXJlIGNhc2NhZGluZyBzdHlsZSBzaGVldC4gV2hpY2hcbiAgICAgICAgICAgIGlzIGVycm9yIHBydW5lIGFuZCB2ZXJ5IHJlc291cmNlIGludGVuc2l2ZS5cbiAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3R5bGVDb250ZW50czpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgIC8oPHN0eWxlW14+XSo+KShbXFxzXFxTXSo/KSg8XFwvc3R5bGVbXj5dKj4pL2dpLCAoXG4gICAgICAgICAgICAgICAgbWF0Y2g6c3RyaW5nLFxuICAgICAgICAgICAgICAgIHN0YXJ0VGFnOnN0cmluZyxcbiAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZyxcbiAgICAgICAgICAgICAgICBlbmRUYWc6c3RyaW5nXG4gICAgICAgICAgICApOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgc3R5bGVDb250ZW50cy5wdXNoKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3N0YXJ0VGFnfSR7ZW5kVGFnfWBcbiAgICAgICAgICAgIH0pXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHRyYW5zbGF0ZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgdG8gaHRtbCBjb21wYXRpYmxlXG4gICAgICAgICAgICBzZXF1ZW5jZXMgYW5kIHRyYW5zbGF0ZSBpdCBiYWNrIGxhdGVyIHRvIGF2b2lkIHVuZXhwZWN0ZWQgZXNjYXBlXG4gICAgICAgICAgICBzZXF1ZW5jZXMgaW4gcmVzdWx0aW5nIGh0bWwuXG4gICAgICAgICovXG4gICAgICAgIGNvbnN0IHdpbmRvdzpXaW5kb3cgPSAobmV3IERPTShcbiAgICAgICAgICAgIGNvbnRlbnRcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvPCUvZywgJyMjKyMrIysjIycpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyU+L2csICcjIy0jLSMtIyMnKVxuICAgICAgICApKS53aW5kb3dcbiAgICAgICAgY29uc3QgaW5QbGFjZVN0eWxlQ29udGVudHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBmb3IgKGNvbnN0IGFzc2V0VHlwZTpQbGFpbk9iamVjdCBvZiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlTmFtZTogJ2hyZWYnLFxuICAgICAgICAgICAgICAgIGhhc2g6ICdjb250ZW50aGFzaCcsXG4gICAgICAgICAgICAgICAgbGlua1RhZ05hbWU6ICdsaW5rJyxcbiAgICAgICAgICAgICAgICBwYXR0ZXJuOiBjYXNjYWRpbmdTdHlsZVNoZWV0UGF0dGVybixcbiAgICAgICAgICAgICAgICBzZWxlY3RvcjogJ1tocmVmKj1cIi5jc3NcIl0nLFxuICAgICAgICAgICAgICAgIHRhZ05hbWU6ICdzdHlsZScsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IGNhc2NhZGluZ1N0eWxlU2hlZXRDaHVua05hbWVUZW1wbGF0ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVOYW1lOiAnc3JjJyxcbiAgICAgICAgICAgICAgICBoYXNoOiAnaGFzaCcsXG4gICAgICAgICAgICAgICAgbGlua1RhZ05hbWU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgICAgIHBhdHRlcm46IGphdmFTY3JpcHRQYXR0ZXJuLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yOiAnW2hyZWYqPVwiLmpzXCJdJyxcbiAgICAgICAgICAgICAgICB0YWdOYW1lOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogamF2YVNjcmlwdENodW5rTmFtZVRlbXBsYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIF0pXG4gICAgICAgICAgICBpZiAoYXNzZXRUeXBlLnBhdHRlcm4pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXR0ZXJuOnN0cmluZyBpbiBhc3NldFR5cGUucGF0dGVybikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFzc2V0VHlwZS5wYXR0ZXJuLmhhc093blByb3BlcnR5KHBhdHRlcm4pKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yOnN0cmluZyA9IGFzc2V0VHlwZS5zZWxlY3RvclxuICAgICAgICAgICAgICAgICAgICBpZiAocGF0dGVybiAhPT0gJyonKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBgWyR7YXNzZXRUeXBlLmF0dHJpYnV0ZU5hbWV9PVwiYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGgsIEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlLnRlbXBsYXRlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2BbJHthc3NldFR5cGUuaGFzaH1dYF06ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbaWRdJzogcGF0dGVybixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW25hbWVdJzogcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSArICdcIl0nXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGVzOkFycmF5PERvbU5vZGU+ID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS5saW5rVGFnTmFtZX0ke3NlbGVjdG9yfWApXG4gICAgICAgICAgICAgICAgICAgIGlmIChkb21Ob2Rlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZiBkb21Ob2Rlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGg6c3RyaW5nID0gZG9tTm9kZS5hdHRyaWJ1dGVzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUuYXR0cmlidXRlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0udmFsdWUucmVwbGFjZSgvJi4qL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghYXNzZXRzLmhhc093blByb3BlcnR5KHBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluUGxhY2VEb21Ob2RlOkRvbU5vZGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZS50YWdOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhc3NldFR5cGUudGFnTmFtZSA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnd2Vib3B0aW1pemVyaW5wbGFjZScsICd0cnVlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZVN0eWxlQ29udGVudHMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0c1twYXRoXS5zb3VyY2UoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUudGV4dENvbnRlbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRzW3BhdGhdLnNvdXJjZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFzc2V0VHlwZS5wYXR0ZXJuW3BhdHRlcm5dID09PSAnYm9keScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5QbGFjZURvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoYXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl0gPT09ICdpbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChhc3NldFR5cGUucGF0dGVybltwYXR0ZXJuXSA9PT0gJ2hlYWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWd1bGFyRXhwcmVzc2lvblBhdHRlcm46c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcoYWZ0ZXJ8YmVmb3JlfGluKTooLispJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRjaDpBcnJheTxzdHJpbmc+ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAocmVndWxhckV4cHJlc3Npb25QYXR0ZXJuKS5leGVjKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZS5wYXR0ZXJuW3BhdHRlcm5dKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdHaXZlbiBpbiBwbGFjZSBzcGVjaWZpY2F0aW9uIFwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7YXNzZXRUeXBlLnBhdHRlcm5bcGF0dGVybl19XCIgZm9yIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2Fzc2V0VHlwZS50YWdOYW1lfSBkb2VzIG5vdCBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2F0aXNmeSB0aGUgc3BlY2lmaWVkIHBhdHRlcm4gXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtyZWd1bGFyRXhwcmVzc2lvblBhdHRlcm59XCIuYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9tTm9kZTpEb21Ob2RlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKG1hdGNoWzJdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRvbU5vZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFNwZWNpZmllZCBkb20gbm9kZSBcIiR7bWF0Y2hbMl19XCIgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvdWxkIG5vdCBiZSBmb3VuZCB0byBpbiBwbGFjZSBcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3BhdHRlcm59XCIuYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoWzFdID09PSAnaW4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5hcHBlbmRDaGlsZChpblBsYWNlRG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobWF0Y2hbMV0gPT09ICdiZWZvcmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5wYXJlbnROb2RlLmluc2VydEFmdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLCBkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBUaGlzIGRvZXNuJ3QgcHJldmVudCB3ZWJwYWNrIGZyb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpbmcgdGhpcyBmaWxlIGlmIHByZXNlbnQgaW4gYW5vdGhlciBjaHVua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyByZW1vdmluZyBpdCAoYW5kIGEgcG90ZW50aWFsIHNvdXJjZSBtYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSkgbGF0ZXIgaW4gdGhlIFwiZG9uZVwiIGhvb2suXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZS5wdXNoKEhlbHBlci5zdHJpcExvYWRlcihwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXNzZXRzW3BhdGhdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgTm8gcmVmZXJlbmNlZCAke2Fzc2V0VHlwZS50YWdOYW1lfSBmaWxlIGluIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdyZXN1bHRpbmcgbWFya3VwIGZvdW5kIHdpdGggc2VsZWN0b3I6IFwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7YXNzZXRUeXBlLmxpbmtUYWdOYW1lfSR7YXNzZXRUeXBlLnNlbGVjdG9yfVwiYClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIC8vIE5PVEU6IFdlIGhhdmUgdG8gcmVzdG9yZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgYW5kIHN0eWxlIGNvbnRlbnRzLlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY29udGVudDogY29udGVudFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXihcXHMqPCFkb2N0eXBlIFtePl0rPz5cXHMqKVtcXHNcXFNdKiQvaSwgJyQxJ1xuICAgICAgICAgICAgICAgICkgKyB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8jI1xcKyNcXCsjXFwrIyMvZywgJzwlJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyMtIy0jLSMjL2csICclPicpXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg8c3R5bGVbXj5dKj4pW1xcc1xcU10qPyg8XFwvc3R5bGVbXj5dKj4pL2dpLCAoXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBlbmRUYWc6c3RyaW5nXG4gICAgICAgICAgICAgICAgKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRUYWcuaW5jbHVkZXMoJyB3ZWJvcHRpbWl6ZXJpbnBsYWNlPVwidHJ1ZVwiJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhcnRUYWcucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHdlYm9wdGltaXplcmlucGxhY2U9XCJ0cnVlXCInLCAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSArIGAke2luUGxhY2VTdHlsZUNvbnRlbnRzLnNoaWZ0KCl9JHtlbmRUYWd9YFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7c3RhcnRUYWd9JHtzdHlsZUNvbnRlbnRzLnNoaWZ0KCl9JHtlbmRUYWd9YFxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmVcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdHJpcHMgbG9hZGVyIGluZm9ybWF0aW9ucyBmb3JtIGdpdmVuIG1vZHVsZSByZXF1ZXN0IGluY2x1ZGluZyBsb2FkZXJcbiAgICAgKiBwcmVmaXggYW5kIHF1ZXJ5IHBhcmFtZXRlci5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgcmVxdWVzdCB0byBzdHJpcC5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBtb2R1bGUgaWQgc3RyaXBwZWQuXG4gICAgICovXG4gICAgc3RhdGljIHN0cmlwTG9hZGVyKG1vZHVsZUlEOnN0cmluZ3xTdHJpbmcpOnN0cmluZyB7XG4gICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQudG9TdHJpbmcoKVxuICAgICAgICBjb25zdCBtb2R1bGVJRFdpdGhvdXRMb2FkZXI6c3RyaW5nID0gbW9kdWxlSUQuc3Vic3RyaW5nKFxuICAgICAgICAgICAgbW9kdWxlSUQubGFzdEluZGV4T2YoJyEnKSArIDEpXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFdpdGhvdXRMb2FkZXIuaW5jbHVkZXMoXG4gICAgICAgICAgICAnPydcbiAgICAgICAgKSA/IG1vZHVsZUlEV2l0aG91dExvYWRlci5zdWJzdHJpbmcoMCwgbW9kdWxlSURXaXRob3V0TG9hZGVyLmluZGV4T2YoXG4gICAgICAgICAgICAgICAgJz8nXG4gICAgICAgICAgICApKSA6IG1vZHVsZUlEV2l0aG91dExvYWRlclxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gYXJyYXlcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBnaXZlbiBsaXN0IG9mIHBhdGggdG8gYSBub3JtYWxpemVkIGxpc3Qgd2l0aCB1bmlxdWUgdmFsdWVzLlxuICAgICAqIEBwYXJhbSBwYXRocyAtIEZpbGUgcGF0aHMuXG4gICAgICogQHJldHVybnMgVGhlIGdpdmVuIGZpbGUgcGF0aCBsaXN0IHdpdGggbm9ybWFsaXplZCB1bmlxdWUgdmFsdWVzLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVQYXRocyhwYXRoczpBcnJheTxzdHJpbmc+KTpBcnJheTxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChwYXRocy5tYXAoKGdpdmVuUGF0aDpzdHJpbmcpOnN0cmluZyA9PiB7XG4gICAgICAgICAgICBnaXZlblBhdGggPSBwYXRoLm5vcm1hbGl6ZShnaXZlblBhdGgpXG4gICAgICAgICAgICBpZiAoZ2l2ZW5QYXRoLmVuZHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGdpdmVuUGF0aC5zdWJzdHJpbmcoMCwgZ2l2ZW5QYXRoLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICByZXR1cm4gZ2l2ZW5QYXRoXG4gICAgICAgIH0pKSlcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGZpbGUgaGFuZGxlclxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgZmlsZSBwYXRoL25hbWUgcGxhY2Vob2xkZXIgcmVwbGFjZW1lbnRzIHdpdGggZ2l2ZW4gYnVuZGxlXG4gICAgICogYXNzb2NpYXRlZCBpbmZvcm1hdGlvbnMuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoVGVtcGxhdGUgLSBGaWxlIHBhdGggdG8gcHJvY2VzcyBwbGFjZWhvbGRlciBpbi5cbiAgICAgKiBAcGFyYW0gaW5mb3JtYXRpb25zIC0gU2NvcGUgdG8gdXNlIGZvciBwcm9jZXNzaW5nLlxuICAgICAqIEByZXR1cm5zIFByb2Nlc3NlZCBmaWxlIHBhdGguXG4gICAgICovXG4gICAgc3RhdGljIHJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgIGZpbGVQYXRoVGVtcGxhdGU6c3RyaW5nLCBpbmZvcm1hdGlvbnM6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xuICAgICAgICAgICAgJ1tuYW1lXSc6ICcuX19kdW1teV9fJywgJ1tpZF0nOiAnLl9fZHVtbXlfXycsXG4gICAgICAgICAgICAnW2hhc2hdJzogJy5fX2R1bW15X18nXG4gICAgICAgIH1cbiAgICApOnN0cmluZyB7XG4gICAgICAgIGxldCBmaWxlUGF0aDpzdHJpbmcgPSBmaWxlUGF0aFRlbXBsYXRlXG4gICAgICAgIGZvciAoY29uc3QgcGxhY2Vob2xkZXJOYW1lOnN0cmluZyBpbiBpbmZvcm1hdGlvbnMpXG4gICAgICAgICAgICBpZiAoaW5mb3JtYXRpb25zLmhhc093blByb3BlcnR5KHBsYWNlaG9sZGVyTmFtZSkpXG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhwbGFjZWhvbGRlck5hbWUpLCAnZydcbiAgICAgICAgICAgICAgICApLCBpbmZvcm1hdGlvbnNbcGxhY2Vob2xkZXJOYW1lXSlcbiAgICAgICAgcmV0dXJuIGZpbGVQYXRoXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGdpdmVuIHJlcXVlc3QgdG8gYSByZXNvbHZlZCByZXF1ZXN0IHdpdGggZ2l2ZW4gY29udGV4dFxuICAgICAqIGVtYmVkZGVkLlxuICAgICAqIEBwYXJhbSByZXF1ZXN0IC0gUmVxdWVzdCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBDb250ZXh0IG9mIGdpdmVuIHJlcXVlc3QgdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocyAtIExpc3Qgb2YgcmVsYXRpdmUgZmlsZSBwYXRoIHRvIHNlYXJjaFxuICAgICAqIGZvciBtb2R1bGVzIGluLlxuICAgICAqIEByZXR1cm5zIEEgbmV3IHJlc29sdmVkIHJlcXVlc3QuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5Q29udGV4dChcbiAgICAgICAgcmVxdWVzdDpzdHJpbmcsIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnLi8nLFxuICAgICAgICBhbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sIG1vZHVsZVJlcGxhY2VtZW50czpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXVxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgcmVmZXJlbmNlUGF0aCA9IHBhdGgucmVzb2x2ZShyZWZlcmVuY2VQYXRoKVxuICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcuLycpICYmIHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIGNvbnRleHRcbiAgICAgICAgKSAhPT0gcmVmZXJlbmNlUGF0aCkge1xuICAgICAgICAgICAgcmVxdWVzdCA9IHBhdGgucmVzb2x2ZShjb250ZXh0LCByZXF1ZXN0KVxuICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVQYXRoOnN0cmluZyBvZiByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBtb2R1bGVQYXRoKVxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgocGF0aFByZWZpeCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKHBhdGhQcmVmaXgubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhIZWxwZXIuYXBwbHlBbGlhc2VzKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5zdWJzdHJpbmcocmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlhc2VzXG4gICAgICAgICAgICAgICAgICAgICksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKHJlZmVyZW5jZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKHJlZmVyZW5jZVBhdGgubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5hcHBseU1vZHVsZVJlcGxhY2VtZW50cyhIZWxwZXIuYXBwbHlBbGlhc2VzKFxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LnN1YnN0cmluZyhyZXF1ZXN0Lmxhc3RJbmRleE9mKCchJykgKyAxKSwgYWxpYXNlc1xuICAgICAgICAgICAgICAgICksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVxdWVzdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBnaXZlbiByZXF1ZXN0IHBvaW50cyB0byBhbiBleHRlcm5hbCBkZXBlbmRlbmN5IG5vdCBtYWludGFpbmVkXG4gICAgICogYnkgY3VycmVudCBwYWNrYWdlIGNvbnRleHQuXG4gICAgICogQHBhcmFtIHJlcXVlc3QgLSBSZXF1ZXN0IHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIENvbnRleHQgb2YgY3VycmVudCBwcm9qZWN0LlxuICAgICAqIEBwYXJhbSByZXF1ZXN0Q29udGV4dCAtIENvbnRleHQgb2YgZ2l2ZW4gcmVxdWVzdCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24gLSBNYXBwaW5nIG9mIGNodW5rIG5hbWVzIHRvIG1vZHVsZXNcbiAgICAgKiB3aGljaCBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gICAgICogQHBhcmFtIGV4dGVybmFsTW9kdWxlTG9jYXRpb25zIC0gQXJyYXkgaWYgcGF0aHMgd2hlcmUgZXh0ZXJuYWwgbW9kdWxlc1xuICAgICAqIHRha2UgcGxhY2UuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIG1vZHVsZVJlcGxhY2VtZW50cyAtIE1hcHBpbmcgb2YgcmVwbGFjZW1lbnRzIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbnMgLSBMaXN0IG9mIGZpbGUgYW5kIG1vZHVsZSBleHRlbnNpb25zIHRvIHRha2UgaW50b1xuICAgICAqIGFjY291bnQuXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUVudHJ5RmlsZU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGVudHJ5IGZpbGUgbmFtZXMgdG9cbiAgICAgKiBzZWFyY2ggZm9yLiBUaGUgbWFnaWMgbmFtZSBcIl9fcGFja2FnZV9fXCIgd2lsbCBzZWFyY2ggZm9yIGFuIGFwcHJlY2lhdGVcbiAgICAgKiBlbnRyeSBpbiBhIFwicGFja2FnZS5qc29uXCIgZmlsZS5cbiAgICAgKiBAcGFyYW0gcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgbWFpbiBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSByZXByZXNlbnRpbmcgZW50cnkgbW9kdWxlIGRlZmluaXRpb25zLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgYWxpYXMgcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2Ugc3BlY2lmaWMgbW9kdWxlIGFsaWFzZXMuXG4gICAgICogQHBhcmFtIGluY2x1ZGVQYXR0ZXJuIC0gQXJyYXkgb2YgcmVndWxhciBleHByZXNzaW9ucyB0byBleHBsaWNpdGx5IG1hcmtcbiAgICAgKiBhcyBleHRlcm5hbCBkZXBlbmRlbmN5LlxuICAgICAqIEBwYXJhbSBleGNsdWRlUGF0dGVybiAtIEFycmF5IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gZXhwbGljaXRseSBtYXJrXG4gICAgICogYXMgaW50ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAgKiBAcGFyYW0gaW5QbGFjZU5vcm1hbExpYnJhcnkgLSBJbmRpY2F0ZXMgd2hldGhlciBub3JtYWwgbGlicmFyaWVzIHNob3VsZFxuICAgICAqIGJlIGV4dGVybmFsIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0gaW5QbGFjZUR5bmFtaWNMaWJyYXJ5IC0gSW5kaWNhdGVzIHdoZXRoZXIgcmVxdWVzdHMgd2l0aFxuICAgICAqIGludGVncmF0ZWQgbG9hZGVyIGNvbmZpZ3VyYXRpb25zIHNob3VsZCBiZSBtYXJrZWQgYXMgZXh0ZXJuYWwgb3Igbm90LlxuICAgICAqIEBwYXJhbSBlbmNvZGluZyAtIEVuY29kaW5nIGZvciBmaWxlIG5hbWVzIHRvIHVzZSBkdXJpbmcgZmlsZSB0cmF2ZXJzaW5nLlxuICAgICAqIEByZXR1cm5zIEEgbmV3IHJlc29sdmVkIHJlcXVlc3QgaW5kaWNhdGluZyB3aGV0aGVyIGdpdmVuIHJlcXVlc3QgaXMgYW5cbiAgICAgKiBleHRlcm5hbCBvbmUuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZUV4dGVybmFsUmVxdWVzdChcbiAgICAgICAgcmVxdWVzdDpzdHJpbmcsIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVxdWVzdENvbnRleHQ6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiA9IHt9LFxuICAgICAgICBleHRlcm5hbE1vZHVsZUxvY2F0aW9uczpBcnJheTxzdHJpbmc+ID0gWydub2RlX21vZHVsZXMnXSxcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LCBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5qcyddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBbXG4gICAgICAgICAgICAgICAgICAgICcuanMnLCAnLmpzb24nLCAnLmNzcycsICcuZW90JywgJy5naWYnLCAnLmh0bWwnLCAnLmljbycsXG4gICAgICAgICAgICAgICAgICAgICcuanBnJywgJy5wbmcnLCAnLmVqcycsICcuc3ZnJywgJy50dGYnLCAnLndvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIG1vZHVsZTogW11cbiAgICAgICAgfSwgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnLi8nLCBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gWydpbmRleCcsICdtYWluJ10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJywgJ21vZHVsZSddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgaW5jbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgZXhjbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgaW5QbGFjZU5vcm1hbExpYnJhcnk6Ym9vbGVhbiA9IGZhbHNlLFxuICAgICAgICBpblBsYWNlRHluYW1pY0xpYnJhcnk6Ym9vbGVhbiA9IHRydWUsXG4gICAgICAgIGVuY29kaW5nOnN0cmluZyA9ICd1dGYtOCdcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBjb250ZXh0ID0gcGF0aC5yZXNvbHZlKGNvbnRleHQpXG4gICAgICAgIHJlcXVlc3RDb250ZXh0ID0gcGF0aC5yZXNvbHZlKHJlcXVlc3RDb250ZXh0KVxuICAgICAgICByZWZlcmVuY2VQYXRoID0gcGF0aC5yZXNvbHZlKHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIC8vIE5PVEU6IFdlIGFwcGx5IGFsaWFzIG9uIGV4dGVybmFscyBhZGRpdGlvbmFsbHkuXG4gICAgICAgIGxldCByZXNvbHZlZFJlcXVlc3Q6c3RyaW5nID0gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICAgICAgSGVscGVyLmFwcGx5QWxpYXNlcyhyZXF1ZXN0LnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lmxhc3RJbmRleE9mKCchJykgKyAxXG4gICAgICAgICAgICApLCBhbGlhc2VzKSwgbW9kdWxlUmVwbGFjZW1lbnRzKVxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogQWxpYXNlcyBhbmQgbW9kdWxlIHJlcGxhY2VtZW50cyBkb2Vzbid0IGhhdmUgdG8gYmUgZm9yd2FyZGVkXG4gICAgICAgICAgICBzaW5jZSB3ZSBwYXNzIGFuIGFscmVhZHkgcmVzb2x2ZWQgcmVxdWVzdC5cbiAgICAgICAgKi9cbiAgICAgICAgbGV0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsIHt9LCB7fSwgZXh0ZW5zaW9ucywgY29udGV4dCwgcmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgICBwYXRoc1RvSWdub3JlLCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocywgcGFja2FnZUVudHJ5RmlsZU5hbWVzLFxuICAgICAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzLCBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzLCBlbmNvZGluZylcbiAgICAgICAgaWYgKFRvb2xzLmlzQW55TWF0Y2hpbmcocmVzb2x2ZWRSZXF1ZXN0LCBleGNsdWRlUGF0dGVybikpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgbWFyayBkZXBlbmRlbmNpZXMgYXMgZXh0ZXJuYWwgaWYgdGhlcmUgZmlsZSBjb3VsZG4ndCBiZVxuICAgICAgICAgICAgcmVzb2x2ZWQgb3IgYXJlIHNwZWNpZmllZCB0byBiZSBleHRlcm5hbCBleHBsaWNpdGx5LlxuICAgICAgICAqL1xuICAgICAgICBpZiAoIShmaWxlUGF0aCB8fCBpblBsYWNlTm9ybWFsTGlicmFyeSkgfHwgVG9vbHMuaXNBbnlNYXRjaGluZyhcbiAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwgaW5jbHVkZVBhdHRlcm5cbiAgICAgICAgKSlcbiAgICAgICAgICAgIHJldHVybiBIZWxwZXIuYXBwbHlDb250ZXh0KFxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwgcmVxdWVzdENvbnRleHQsIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICAgICAgYWxpYXNlcywgbW9kdWxlUmVwbGFjZW1lbnRzLCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocylcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCwgYWxpYXNlcywgbW9kdWxlUmVwbGFjZW1lbnRzLCBleHRlbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCwgcmVxdWVzdENvbnRleHQsIHBhdGhzVG9JZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocywgcGFja2FnZUVudHJ5RmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzLCBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgKSA9PT0gZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogV2UgbWFyayBkZXBlbmRlbmNpZXMgYXMgZXh0ZXJuYWwgaWYgdGhleSBkb2VzIG5vdCBjb250YWluIGFcbiAgICAgICAgICAgIGxvYWRlciBpbiB0aGVpciByZXF1ZXN0IGFuZCBhcmVuJ3QgcGFydCBvZiB0aGUgY3VycmVudCBtYWluIHBhY2thZ2VcbiAgICAgICAgICAgIG9yIGhhdmUgYSBmaWxlIGV4dGVuc2lvbiBvdGhlciB0aGFuIGphdmFTY3JpcHQgYXdhcmUuXG4gICAgICAgICovXG4gICAgICAgIGlmICghaW5QbGFjZU5vcm1hbExpYnJhcnkgJiYgKFxuICAgICAgICAgICAgZXh0ZW5zaW9ucy5maWxlLmV4dGVybmFsLmxlbmd0aCA9PT0gMCB8fCBmaWxlUGF0aCAmJlxuICAgICAgICAgICAgZXh0ZW5zaW9ucy5maWxlLmV4dGVybmFsLmluY2x1ZGVzKHBhdGguZXh0bmFtZShmaWxlUGF0aCkpIHx8XG4gICAgICAgICAgICAhZmlsZVBhdGggJiYgZXh0ZW5zaW9ucy5maWxlLmV4dGVybmFsLmluY2x1ZGVzKCcnKVxuICAgICAgICApICYmICEoaW5QbGFjZUR5bmFtaWNMaWJyYXJ5ICYmIHJlcXVlc3QuaW5jbHVkZXMoJyEnKSkgJiYgKFxuICAgICAgICAgICAgICAgICFmaWxlUGF0aCAmJiBpblBsYWNlRHluYW1pY0xpYnJhcnkgfHwgZmlsZVBhdGggJiYgKFxuICAgICAgICAgICAgICAgICAgICAhZmlsZVBhdGguc3RhcnRzV2l0aChjb250ZXh0KSB8fFxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwgZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnMpKVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gSGVscGVyLmFwcGx5Q29udGV4dChcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsIHJlcXVlc3RDb250ZXh0LCByZWZlcmVuY2VQYXRoLCBhbGlhc2VzLFxuICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cywgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMpXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYXNzZXQgdHlwZSBvZiBnaXZlbiBmaWxlLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBhbmFseXNlLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb24gLSBNZXRhIGluZm9ybWF0aW9ucyBmb3IgYXZhaWxhYmxlIGFzc2V0XG4gICAgICogdHlwZXMuXG4gICAgICogQHBhcmFtIHBhdGhzIC0gTGlzdCBvZiBwYXRocyB0byBzZWFyY2ggaWYgZ2l2ZW4gcGF0aCBkb2Vzbid0IHJlZmVyZW5jZVxuICAgICAqIGEgZmlsZSBkaXJlY3RseS5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIGZpbGUgdHlwZSBvciBcIm51bGxcIiBvZiBnaXZlbiBmaWxlIGNvdWxkbid0IGJlXG4gICAgICogZGV0ZXJtaW5lZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIGJ1aWxkQ29uZmlndXJhdGlvbjpCdWlsZENvbmZpZ3VyYXRpb24sIHBhdGhzOlBhdGhcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBsZXQgcmVzdWx0Oj9zdHJpbmcgPSBudWxsXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gYnVpbGRDb25maWd1cmF0aW9uKVxuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShcbiAgICAgICAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICAgICAgKSA9PT0gYC4ke2J1aWxkQ29uZmlndXJhdGlvblt0eXBlXS5leHRlbnNpb259YCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHR5cGVcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydzb3VyY2UnLCAndGFyZ2V0J10pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFR5cGU6c3RyaW5nIGluIHBhdGhzW3R5cGVdLmFzc2V0KVxuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoc1t0eXBlXS5hc3NldC5oYXNPd25Qcm9wZXJ0eShhc3NldFR5cGUpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUgIT09ICdiYXNlJyAmJiBwYXRoc1t0eXBlXS5hc3NldFthc3NldFR5cGVdICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aC5zdGFydHNXaXRoKHBhdGhzW3R5cGVdLmFzc2V0W2Fzc2V0VHlwZV0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NldFR5cGVcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgcHJvcGVydHkgd2l0aCBhIHN0b3JlZCBhcnJheSBvZiBhbGwgbWF0Y2hpbmcgZmlsZSBwYXRocywgd2hpY2hcbiAgICAgKiBtYXRjaGVzIGVhY2ggYnVpbGQgY29uZmlndXJhdGlvbiBpbiBnaXZlbiBlbnRyeSBwYXRoIGFuZCBjb252ZXJ0cyBnaXZlblxuICAgICAqIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW50byBhIHNvcnRlZCBhcnJheSB3ZXJlIGphdmFTY3JpcHQgZmlsZXMgdGFrZXNcbiAgICAgKiBwcmVjZWRlbmNlLlxuICAgICAqIEBwYXJhbSBjb25maWd1cmF0aW9uIC0gR2l2ZW4gYnVpbGQgY29uZmlndXJhdGlvbnMuXG4gICAgICogQHBhcmFtIGVudHJ5UGF0aCAtIFBhdGggdG8gYW5hbHlzZSBuZXN0ZWQgc3RydWN0dXJlLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSBtYWluRmlsZUJhc2VuYW1lcyAtIEZpbGUgYmFzZW5hbWVzIHRvIHNvcnQgaW50byB0aGUgZnJvbnQuXG4gICAgICogQHJldHVybnMgQ29udmVydGVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb246QnVpbGRDb25maWd1cmF0aW9uLCBlbnRyeVBhdGg6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIG1haW5GaWxlQmFzZW5hbWVzOkFycmF5PHN0cmluZz4gPSBbJ2luZGV4JywgJ21haW4nXVxuICAgICk6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24ge1xuICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24gPSBbXVxuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW06UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtID1cbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtmaWxlUGF0aHM6IFtdfSwgY29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVdKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZTpGaWxlIG9mIFRvb2xzLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoXG4gICAgICAgICAgICAgICAgICAgIGVudHJ5UGF0aCwgKGZpbGU6RmlsZSk6P2ZhbHNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cy5pc0ZpbGUoKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKGZpbGUucGF0aCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICkgPT09IG5ld0l0ZW0uZXh0ZW5zaW9uICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhKG5ldyBSZWdFeHAobmV3SXRlbS5maWxlUGF0aFBhdHRlcm4pKS50ZXN0KGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbS5maWxlUGF0aHMucHVzaChmaWxlLnBhdGgpXG4gICAgICAgICAgICAgICAgbmV3SXRlbS5maWxlUGF0aHMuc29ydCgoXG4gICAgICAgICAgICAgICAgICAgIGZpcnN0RmlsZVBhdGg6c3RyaW5nLCBzZWNvbmRGaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICApOm51bWJlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RGaWxlUGF0aCwgcGF0aC5leHRuYW1lKGZpcnN0RmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFpbkZpbGVCYXNlbmFtZXMuaW5jbHVkZXMocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRGaWxlUGF0aCwgcGF0aC5leHRuYW1lKHNlY29uZEZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtYWluRmlsZUJhc2VuYW1lcy5pbmNsdWRlcyhwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kRmlsZVBhdGgsIHBhdGguZXh0bmFtZShzZWNvbmRGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLnB1c2gobmV3SXRlbSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1aWxkQ29uZmlndXJhdGlvbi5zb3J0KChcbiAgICAgICAgICAgIGZpcnN0OlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSxcbiAgICAgICAgICAgIHNlY29uZDpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbiAgICAgICAgKTpudW1iZXIgPT4ge1xuICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiAhPT0gc2Vjb25kLm91dHB1dEV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgICAgIGlmIChzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIHJldHVybiBmaXJzdC5vdXRwdXRFeHRlbnNpb24gPCBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID8gLTEgOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9KVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBmaWxlIGFuZCBkaXJlY3RvcnkgcGF0aHMgcmVsYXRlZCB0byBnaXZlbiBpbnRlcm5hbFxuICAgICAqIG1vZHVsZXMgYXMgYXJyYXkuXG4gICAgICogQHBhcmFtIGludGVybmFsSW5qZWN0aW9uIC0gTGlzdCBvZiBtb2R1bGUgaWRzIG9yIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIG1vZHVsZSByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byByZXNvbHZlIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSByZWZlcmVuY2VQYXRoIC0gUGF0aCB0byBzZWFyY2ggZm9yIGxvY2FsIG1vZHVsZXMuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHBhcmFtIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIG1haW4gcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2UgcmVwcmVzZW50aW5nIGVudHJ5IG1vZHVsZSBkZWZpbml0aW9ucy5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBmaWxlIGFsaWFzIHByb3BlcnR5XG4gICAgICogbmFtZXMgdG8gc2VhcmNoIGZvciBwYWNrYWdlIHNwZWNpZmljIG1vZHVsZSBhbGlhc2VzLlxuICAgICAqIEBwYXJhbSBlbmNvZGluZyAtIEZpbGUgbmFtZSBlbmNvZGluZyB0byB1c2UgZHVyaW5nIGZpbGUgdHJhdmVyc2luZy5cbiAgICAgKiBAcmV0dXJucyBPYmplY3Qgd2l0aCBhIGZpbGUgcGF0aCBhbmQgZGlyZWN0b3J5IHBhdGgga2V5IG1hcHBpbmcgdG9cbiAgICAgKiBjb3JyZXNwb25kaW5nIGxpc3Qgb2YgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb24sIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sIGV4dGVuc2lvbnM6RXh0ZW5zaW9ucyA9IHtcbiAgICAgICAgICAgIGZpbGU6IHtcbiAgICAgICAgICAgICAgICBleHRlcm5hbDogWycuanMnXSxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbDogW1xuICAgICAgICAgICAgICAgICAgICAnLmpzJywgJy5qc29uJywgJy5jc3MnLCAnLmVvdCcsICcuZ2lmJywgJy5odG1sJywgJy5pY28nLFxuICAgICAgICAgICAgICAgICAgICAnLmpwZycsICcucG5nJywgJy5lanMnLCAnLnN2ZycsICcudHRmJywgJy53b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LCBtb2R1bGU6IFtdXG4gICAgICAgIH0sIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbJycsICdub2RlX21vZHVsZXMnLCAnLi4vJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJ19fcGFja2FnZV9fJywgJycsICdpbmRleCcsICdtYWluJ10sXG4gICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lczpBcnJheTxzdHJpbmc+ID0gWydtYWluJywgJ21vZHVsZSddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgZW5jb2Rpbmc6c3RyaW5nID0gJ3V0Zi04J1xuICAgICk6e2ZpbGVQYXRoczpBcnJheTxzdHJpbmc+O2RpcmVjdG9yeVBhdGhzOkFycmF5PHN0cmluZz59IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29uc3Qgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiA9XG4gICAgICAgICAgICBIZWxwZXIucmVzb2x2ZU1vZHVsZXNJbkZvbGRlcnMoXG4gICAgICAgICAgICAgICAgSGVscGVyLm5vcm1hbGl6ZUludGVybmFsSW5qZWN0aW9uKGludGVybmFsSW5qZWN0aW9uKSxcbiAgICAgICAgICAgICAgICBhbGlhc2VzLCBtb2R1bGVSZXBsYWNlbWVudHMsIGNvbnRleHQsIHJlZmVyZW5jZVBhdGgsXG4gICAgICAgICAgICAgICAgcGF0aHNUb0lnbm9yZSlcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELCBhbGlhc2VzLCBtb2R1bGVSZXBsYWNlbWVudHMsIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCByZWZlcmVuY2VQYXRoLCBwYXRoc1RvSWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMsIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VNYWluUHJvcGVydHlOYW1lcywgcGFja2FnZUFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlyZWN0b3J5UGF0aDpzdHJpbmcgPSBwYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRpcmVjdG9yeVBhdGhzLmluY2x1ZGVzKGRpcmVjdG9yeVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeVBhdGhzLnB1c2goZGlyZWN0b3J5UGF0aClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtmaWxlUGF0aHMsIGRpcmVjdG9yeVBhdGhzfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgbGlzdCBvZiBjb25jcmV0ZSBmaWxlIHBhdGhzIGZvciBnaXZlbiBtb2R1bGUgaWQgcG9pbnRpbmcgdG9cbiAgICAgKiBhIGZvbGRlciB3aGljaCBpc24ndCBhIHBhY2thZ2UuXG4gICAgICogQHBhcmFtIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiAtIEluamVjdGlvbiBkYXRhIHN0cnVjdHVyZSBvZlxuICAgICAqIG1vZHVsZXMgd2l0aCBmb2xkZXIgcmVmZXJlbmNlcyB0byByZXNvbHZlLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIGRldGVybWluZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gcmVzb2x2ZSBsb2NhbCBtb2R1bGVzIHJlbGF0aXZlIHRvLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGluamVjdGlvbnMgd2l0aCByZXNvbHZlZCBmb2xkZXIgcG9pbnRpbmcgbW9kdWxlcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVzb2x2ZU1vZHVsZXNJbkZvbGRlcnMoXG4gICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbjpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24sXG4gICAgICAgIGFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSwgbW9kdWxlUmVwbGFjZW1lbnRzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J11cbiAgICApOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiB7XG4gICAgICAgIGlmIChyZWZlcmVuY2VQYXRoLnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHJlZmVyZW5jZVBhdGgpXG4gICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICBpZiAobm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAobGV0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuYXBwbHlBbGlhc2VzKEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRFxuICAgICAgICAgICAgICAgICAgICAgICAgKSwgYWxpYXNlcyksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZVBhdGgsIG1vZHVsZUlEKVxuICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKHJlc29sdmVkUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTpGaWxlIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhyZXNvbHZlZFBhdGgsIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTpGaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTo/ZmFsc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlLnN0YXRzICYmIGZpbGUuc3RhdHMuaXNGaWxlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVkUGF0aCwgZmlsZS5wYXRoKSkpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRC5zdGFydHNXaXRoKCcuLycpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhbW9kdWxlSUQuc3RhcnRzV2l0aCgnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCByZWZlcmVuY2VQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXVtpbmRleF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAuLyR7cGF0aC5yZWxhdGl2ZShjb250ZXh0LCByZXNvbHZlZFBhdGgpfWBcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvblxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFdmVyeSBpbmplY3Rpb24gZGVmaW5pdGlvbiB0eXBlIGNhbiBiZSByZXByZXNlbnRlZCBhcyBwbGFpbiBvYmplY3RcbiAgICAgKiAobWFwcGluZyBmcm9tIGNodW5rIG5hbWUgdG8gYXJyYXkgb2YgbW9kdWxlIGlkcykuIFRoaXMgbWV0aG9kIGNvbnZlcnRzXG4gICAgICogZWFjaCByZXByZXNlbnRhdGlvbiBpbnRvIHRoZSBub3JtYWxpemVkIHBsYWluIG9iamVjdCBub3RhdGlvbi5cbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxJbmplY3Rpb24gLSBHaXZlbiBpbnRlcm5hbCBpbmplY3Rpb24gdG8gbm9ybWFsaXplLlxuICAgICAqIEByZXR1cm5zIE5vcm1hbGl6ZWQgcmVwcmVzZW50YXRpb24gb2YgZ2l2ZW4gaW50ZXJuYWwgaW5qZWN0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb25cbiAgICApOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiB7XG4gICAgICAgIGxldCByZXN1bHQ6Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID0ge31cbiAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uIGluc3RhbmNlb2YgT2JqZWN0ICYmIFRvb2xzLmlzUGxhaW5PYmplY3QoXG4gICAgICAgICAgICBpbnRlcm5hbEluamVjdGlvblxuICAgICAgICApKSB7XG4gICAgICAgICAgICBsZXQgaGFzQ29udGVudDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgICAgIGNvbnN0IGNodW5rTmFtZXNUb0RlbGV0ZTpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBpbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbY2h1bmtOYW1lXSA9IGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZXNUb0RlbGV0ZS5wdXNoKGNodW5rTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDb250ZW50ID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBbaW50ZXJuYWxJbmplY3Rpb25bY2h1bmtOYW1lXV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0NvbnRlbnQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIG9mIGNodW5rTmFtZXNUb0RlbGV0ZSlcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHJlc3VsdFtjaHVua05hbWVdXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbXX1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW50ZXJuYWxJbmplY3Rpb24gPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgcmVzdWx0ID0ge2luZGV4OiBbaW50ZXJuYWxJbmplY3Rpb25dfVxuICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGludGVybmFsSW5qZWN0aW9uKSlcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogaW50ZXJuYWxJbmplY3Rpb259XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgY29uY3JldGUgZmlsZSBwYXRocyBmb3IgZ2l2ZW4gaW5qZWN0aW9uIHdoaWNoIGFyZSBtYXJrZWRcbiAgICAgKiB3aXRoIHRoZSBcIl9fYXV0b19fXCIgaW5kaWNhdG9yLlxuICAgICAqIEBwYXJhbSBnaXZlbkluamVjdGlvbiAtIEdpdmVuIGludGVybmFsIGFuZCBleHRlcm5hbCBpbmplY3Rpb24gdG8gdGFrZVxuICAgICAqIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9ucyAtIFJlc29sdmVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIG1vZHVsZXNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyB0byBleGNsdWRlIChzcGVjaWZpZWQgYnlcbiAgICAgKiBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0byBtb2R1bGUgaWRzLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBtb2R1bGVSZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlcGxhY2VtZW50cyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBleHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGFuZCBtb2R1bGUgZXh0ZW5zaW9ucyB0byB0YWtlIGludG9cbiAgICAgKiBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFJlZmVyZW5jZSBwYXRoIGZyb20gd2hlcmUgbG9jYWwgZmlsZXMgc2hvdWxkIGJlXG4gICAgICogcmVzb2x2ZWQuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9uIHdpdGggcmVzb2x2ZWQgbWFya2VkIGluZGljYXRvcnMuXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVJbmplY3Rpb24oXG4gICAgICAgIGdpdmVuSW5qZWN0aW9uOkluamVjdGlvbixcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlc1RvRXhjbHVkZTpJbnRlcm5hbEluamVjdGlvbixcbiAgICAgICAgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LCBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSxcbiAgICAgICAgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5qcyddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBbXG4gICAgICAgICAgICAgICAgICAgICcuanMnLCAnLmpzb24nLCAnLmNzcycsICcuZW90JywgJy5naWYnLCAnLmh0bWwnLCAnLmljbycsXG4gICAgICAgICAgICAgICAgICAgICcuanBnJywgJy5wbmcnLCAnLmVqcycsICcuc3ZnJywgJy50dGYnLCAnLndvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIG1vZHVsZTogW11cbiAgICAgICAgfSwgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXVxuICAgICk6SW5qZWN0aW9uIHtcbiAgICAgICAgY29uc3QgaW5qZWN0aW9uOkluamVjdGlvbiA9IFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgIHRydWUsIHt9LCBnaXZlbkluamVjdGlvbilcbiAgICAgICAgY29uc3QgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgICAgICAgICBtb2R1bGVzVG9FeGNsdWRlLCBhbGlhc2VzLCBtb2R1bGVSZXBsYWNlbWVudHMsIGV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgY29udGV4dCwgcmVmZXJlbmNlUGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgKS5maWxlUGF0aHNcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2ludGVybmFsJywgJ2V4dGVybmFsJ10pXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBjdXJseSAqL1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmplY3Rpb25bdHlwZV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGluamVjdGlvblt0eXBlXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID09PSAnX19hdXRvX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXSA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVzOntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBba2V5OnN0cmluZ106c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViQ2h1bmtOYW1lOnN0cmluZyBpbiBtb2R1bGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGVzLmhhc093blByb3BlcnR5KHN1YkNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzW3N1YkNodW5rTmFtZV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJldmVyc2UgYXJyYXkgdG8gbGV0IGphdmFTY3JpcHQgYW5kIG1haW4gZmlsZXMgYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgbGFzdCBvbmVzIHRvIGV4cG9ydCB0aGVtIHJhdGhlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXS5yZXZlcnNlKClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmplY3Rpb25bdHlwZV0gPT09ICdfX2F1dG9fXycpXG4gICAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGN1cmx5ICovXG4gICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9ucywgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLCBjb250ZXh0KVxuICAgICAgICByZXR1cm4gaW5qZWN0aW9uXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqIEBwYXJhbSBidWlsZENvbmZpZ3VyYXRpb25zIC0gUmVzb2x2ZWQgYnVpbGQgY29uZmlndXJhdGlvbi5cbiAgICAgKiBAcGFyYW0gbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgZmlsZSBwYXRocyB0b1xuICAgICAqIGV4Y2x1ZGUgKHNwZWNpZmllZCBieSBwYXRoIG9yIGlkKSBvciBhIG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lcyB0b1xuICAgICAqIG1vZHVsZSBpZHMuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gdXNlIGFzIHN0YXJ0aW5nIHBvaW50LlxuICAgICAqIEByZXR1cm5zIEFsbCBkZXRlcm1pbmVkIG1vZHVsZSBmaWxlIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRBdXRvQ2h1bmsoXG4gICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZTpBcnJheTxzdHJpbmc+LCBjb250ZXh0OnN0cmluZ1xuICAgICk6e1trZXk6c3RyaW5nXTpzdHJpbmd9IHtcbiAgICAgICAgY29uc3QgcmVzdWx0Ontba2V5OnN0cmluZ106c3RyaW5nfSA9IHt9XG4gICAgICAgIGNvbnN0IGluamVjdGVkTW9kdWxlSURzOntba2V5OnN0cmluZ106QXJyYXk8c3RyaW5nPn0gPSB7fVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSBvZlxuICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uc1xuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmICghaW5qZWN0ZWRNb2R1bGVJRHNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0pXG4gICAgICAgICAgICAgICAgaW5qZWN0ZWRNb2R1bGVJRHNbYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvbl0gPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVGaWxlUGF0aDpzdHJpbmcgb2YgYnVpbGRDb25maWd1cmF0aW9uLmZpbGVQYXRocylcbiAgICAgICAgICAgICAgICBpZiAoIW1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZS5pbmNsdWRlcyhtb2R1bGVGaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aDpzdHJpbmcgPSAnLi8nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoOnN0cmluZyA9IHBhdGguZGlybmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhc2VOYW1lOnN0cmluZyA9IHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYC4ke2J1aWxkQ29uZmlndXJhdGlvbi5leHRlbnNpb259YClcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZHVsZUlEOnN0cmluZyA9IGJhc2VOYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3RvcnlQYXRoICE9PSAnLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IHBhdGguam9pbihkaXJlY3RvcnlQYXRoLCBiYXNlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IGVhY2ggb3V0cHV0IHR5cGUgaGFzIG9ubHkgb25lIHNvdXJjZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVwcmVzZW50YXRpb24uXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5qZWN0ZWRNb2R1bGVJRHNbXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgIF0uaW5jbHVkZXMobW9kdWxlSUQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuc3VyZSB0aGF0IHNhbWUgbW9kdWxlIGlkcyBhbmQgZGlmZmVyZW50IG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVzIGNhbiBiZSBkaXN0aW5ndWlzaGVkIGJ5IHRoZWlyIGV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChKYXZhU2NyaXB0LU1vZHVsZXMgcmVtYWlucyB3aXRob3V0IGV4dGVuc2lvbiBzaW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZXkgd2lsbCBiZSBoYW5kbGVkIGZpcnN0IGJlY2F1c2UgdGhlIGJ1aWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgYXJlIGV4cGVjdGVkIHRvIGJlIHNvcnRlZCBpbiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCkuXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5oYXNPd25Qcm9wZXJ0eShtb2R1bGVJRCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3JlbGF0aXZlTW9kdWxlRmlsZVBhdGhdID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFttb2R1bGVJRF0gPSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3RlZE1vZHVsZUlEc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBdLnB1c2gobW9kdWxlSUQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlUmVwbGFjZW1lbnRzIC0gTWFwcGluZyBvZiByZXBsYWNlbWVudHMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBhbmQgbW9kdWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvXG4gICAgICogYWNjb3VudC5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byBkZXRlcm1pbmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUVudHJ5RmlsZU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGVudHJ5IGZpbGUgbmFtZXMgdG9cbiAgICAgKiBzZWFyY2ggZm9yLiBUaGUgbWFnaWMgbmFtZSBcIl9fcGFja2FnZV9fXCIgd2lsbCBzZWFyY2ggZm9yIGFuIGFwcHJlY2lhdGVcbiAgICAgKiBlbnRyeSBpbiBhIFwicGFja2FnZS5qc29uXCIgZmlsZS5cbiAgICAgKiBAcGFyYW0gcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgbWFpbiBwcm9wZXJ0eVxuICAgICAqIG5hbWVzIHRvIHNlYXJjaCBmb3IgcGFja2FnZSByZXByZXNlbnRpbmcgZW50cnkgbW9kdWxlIGRlZmluaXRpb25zLlxuICAgICAqIEBwYXJhbSBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGZpbGUgYWxpYXMgcHJvcGVydHlcbiAgICAgKiBuYW1lcyB0byBzZWFyY2ggZm9yIHBhY2thZ2Ugc3BlY2lmaWMgbW9kdWxlIGFsaWFzZXMuXG4gICAgICogQHBhcmFtIGVuY29kaW5nIC0gRW5jb2RpbmcgdG8gdXNlIGZvciBmaWxlIG5hbWVzIGR1cmluZyBmaWxlIHRyYXZlcnNpbmcuXG4gICAgICogQHJldHVybnMgRmlsZSBwYXRoIG9yIGdpdmVuIG1vZHVsZSBpZCBpZiBkZXRlcm1pbmF0aW9ucyBoYXMgZmFpbGVkIG9yXG4gICAgICogd2Fzbid0IG5lY2Vzc2FyeS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgIG1vZHVsZUlEOnN0cmluZywgYWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBtb2R1bGVSZXBsYWNlbWVudHM6UGxhaW5PYmplY3QgPSB7fSwgZXh0ZW5zaW9uczpFeHRlbnNpb25zID0ge1xuICAgICAgICAgICAgZmlsZToge1xuICAgICAgICAgICAgICAgIGV4dGVybmFsOiBbJy5qcyddLFxuICAgICAgICAgICAgICAgIGludGVybmFsOiBbXG4gICAgICAgICAgICAgICAgICAgICcuanMnLCAnLmpzb24nLCAnLmNzcycsICcuZW90JywgJy5naWYnLCAnLmh0bWwnLCAnLmljbycsXG4gICAgICAgICAgICAgICAgICAgICcuanBnJywgJy5wbmcnLCAnLmVqcycsICcuc3ZnJywgJy50dGYnLCAnLndvZmYnLCAnLndvZmYyJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIG1vZHVsZTogW11cbiAgICAgICAgfSwgY29udGV4dDpzdHJpbmcgPSAnLi8nLCByZWZlcmVuY2VQYXRoOnN0cmluZyA9ICcnLFxuICAgICAgICBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnbm9kZV9tb2R1bGVzJ10sXG4gICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lczpBcnJheTxzdHJpbmc+ID0gWydpbmRleCddLFxuICAgICAgICBwYWNrYWdlTWFpblByb3BlcnR5TmFtZXM6QXJyYXk8c3RyaW5nPiA9IFsnbWFpbiddLFxuICAgICAgICBwYWNrYWdlQWxpYXNQcm9wZXJ0eU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXSxcbiAgICAgICAgZW5jb2Rpbmc6c3RyaW5nID0gJ3V0Zi04J1xuICAgICk6P3N0cmluZyB7XG4gICAgICAgIG1vZHVsZUlEID0gSGVscGVyLmFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKEhlbHBlci5hcHBseUFsaWFzZXMoXG4gICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIobW9kdWxlSUQpLCBhbGlhc2VzXG4gICAgICAgICksIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgaWYgKCFtb2R1bGVJRClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGxldCBtb2R1bGVGaWxlUGF0aDpzdHJpbmcgPSBtb2R1bGVJRFxuICAgICAgICBpZiAobW9kdWxlRmlsZVBhdGguc3RhcnRzV2l0aCgnLi8nKSlcbiAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoID0gcGF0aC5qb2luKHJlZmVyZW5jZVBhdGgsIG1vZHVsZUZpbGVQYXRoKVxuICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUxvY2F0aW9uOnN0cmluZyBvZiBbcmVmZXJlbmNlUGF0aF0uY29uY2F0KFxuICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShjb250ZXh0LCBmaWxlUGF0aCkpXG4gICAgICAgICkpXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlTmFtZTpzdHJpbmcgb2YgWycnLCAnX19wYWNrYWdlX18nXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzXG4gICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlRXh0ZW5zaW9uOnN0cmluZyBvZiBleHRlbnNpb25zLm1vZHVsZS5jb25jYXQoW1xuICAgICAgICAgICAgICAgICAgICAnJ1xuICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVFeHRlbnNpb246c3RyaW5nIG9mIFsnJ10uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5maWxlLmludGVybmFsXG4gICAgICAgICAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50TW9kdWxlRmlsZVBhdGg6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kdWxlRmlsZVBhdGguc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVMb2NhdGlvbiwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGFja2FnZUFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoVG9QYWNrYWdlSlNPTjpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGgsICdwYWNrYWdlLmpzb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhwYXRoVG9QYWNrYWdlSlNPTikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2NhbENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb24gPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhUb1BhY2thZ2VKU09OLCB7ZW5jb2Rpbmd9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWU6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZU1haW5Qcm9wZXJ0eU5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbENvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJiB0eXBlb2YgbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbltwcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lID0gbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VBbGlhc1Byb3BlcnR5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsQ29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBsb2NhbENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZUFsaWFzZXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lID09PSAnX19wYWNrYWdlX18nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBIZWxwZXIuYXBwbHlNb2R1bGVSZXBsYWNlbWVudHMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmFwcGx5QWxpYXNlcyhmaWxlTmFtZSwgcGFja2FnZUFsaWFzZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVJlcGxhY2VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50TW9kdWxlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7ZmlsZU5hbWV9JHttb2R1bGVFeHRlbnNpb259JHtmaWxlRXh0ZW5zaW9ufWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE1vZHVsZUZpbGVQYXRoICs9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2ZpbGVOYW1lfSR7bW9kdWxlRXh0ZW5zaW9ufSR7ZmlsZUV4dGVuc2lvbn1gXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNb2R1bGVGaWxlUGF0aCwgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoY3VycmVudE1vZHVsZUZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudE1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIGFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHJldHVybnMgVGhlIGFsaWFzIGFwcGxpZWQgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqL1xuICAgIHN0YXRpYyBhcHBseUFsaWFzZXMobW9kdWxlSUQ6c3RyaW5nLCBhbGlhc2VzOlBsYWluT2JqZWN0KTpzdHJpbmcge1xuICAgICAgICBmb3IgKGNvbnN0IGFsaWFzOnN0cmluZyBpbiBhbGlhc2VzKVxuICAgICAgICAgICAgaWYgKGFsaWFzLmVuZHNXaXRoKCckJykpIHtcbiAgICAgICAgICAgICAgICBpZiAobW9kdWxlSUQgPT09IGFsaWFzLnN1YnN0cmluZygwLCBhbGlhcy5sZW5ndGggLSAxKSlcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBhbGlhc2VzW2FsaWFzXVxuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBtb2R1bGVJRC5yZXBsYWNlKGFsaWFzLCBhbGlhc2VzW2FsaWFzXSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSByZXBsYWNlbWVudHMgLSBNYXBwaW5nIG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdG8gdGhlaXJcbiAgICAgKiBjb3JyZXNwb25kaW5nIHJlcGxhY2VtZW50cy5cbiAgICAgKiBAcmV0dXJucyBUaGUgcmVwbGFjZW1lbnQgYXBwbGllZCBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5TW9kdWxlUmVwbGFjZW1lbnRzKFxuICAgICAgICBtb2R1bGVJRDpzdHJpbmcsIHJlcGxhY2VtZW50czpQbGFpbk9iamVjdFxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgZm9yIChjb25zdCByZXBsYWNlbWVudDpzdHJpbmcgaW4gcmVwbGFjZW1lbnRzKVxuICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50cy5oYXNPd25Qcm9wZXJ0eShyZXBsYWNlbWVudCkpXG4gICAgICAgICAgICAgICAgbW9kdWxlSUQgPSBtb2R1bGVJRC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKHJlcGxhY2VtZW50KSwgcmVwbGFjZW1lbnRzW3JlcGxhY2VtZW50XSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUlEXG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgSGVscGVyXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19