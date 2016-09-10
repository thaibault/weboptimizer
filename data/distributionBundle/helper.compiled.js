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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}

// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
var Helper = function () {
    function Helper() {
        _classCallCheck(this, Helper);
    }

    _createClass(Helper, null, [{
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
                for (var _iterator = locationsToCheck[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var pathToCheck = _step.value;

                    if (_path2.default.resolve(filePath).startsWith(_path2.default.resolve(pathToCheck))) return true;
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
            return Array.from(new Set(paths.map(function (givenPath) {
                givenPath = _path2.default.normalize(givenPath);
                if (givenPath.endsWith('/')) return givenPath.substring(0, givenPath.length - 1);
                return givenPath;
            })));
        }
        // endregion
        // region data
        /**
         * Converts given serialized or base64 encoded string into a javaScript
         * one if possible.
         * @param serializedObject - Object as string.
         * @param scope - An optional scope which will be used to evaluate given
         * object in.
         * @param name - The name under given scope will be available.
         * @returns The parsed object if possible and null otherwise.
         */

    }, {
        key: 'parseEncodedObject',
        value: function parseEncodedObject(serializedObject) {
            var scope = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var name = arguments.length <= 2 || arguments[2] === undefined ? 'scope' : arguments[2];

            if (!serializedObject.startsWith('{')) serializedObject = Buffer.from(serializedObject, 'base64').toString('utf8');
            try {
                // IgnoreTypeCheck
                return new Function(name, 'return ' + serializedObject)(scope);
            } catch (error) {}
            return null;
        }
        // endregion
        // region process handler
        /**
         * Generates a one shot close handler which triggers given promise methods.
         * If a reason is provided it will be given as resolve target. An Error
         * will be generated if return code is not zero. The generated Error has
         * a property "returnCode" which provides corresponding process return
         * code.
         * @param resolve - Promise's resolve function.
         * @param reject - Promise's reject function.
         * @param reason - Promise target if process has a zero return code.
         * @param callback - Optional function to call of process has successfully
         * finished.
         * @returns Process close handler function.
         */

    }, {
        key: 'getProcessCloseHandler',
        value: function getProcessCloseHandler(resolve, reject) {
            var reason = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var callback = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];

            var finished = false;
            return function (returnCode) {
                if (!finished) if (typeof returnCode !== 'number' || returnCode === 0) {
                    callback();
                    resolve(reason);
                } else {
                    var error = new Error('Task exited with error code ' + returnCode);
                    // IgnoreTypeCheck
                    error.returnCode = returnCode;
                    reject(error);
                }
                finished = true;
            };
        }
        /**
         * Forwards given child process communication channels to corresponding
         * current process communication channels.
         * @param childProcess - Child process meta data.
         * @returns Given child process meta data.
         */

    }, {
        key: 'handleChildProcess',
        value: function handleChildProcess(childProcess) {
            childProcess.stdout.pipe(process.stdout);
            childProcess.stderr.pipe(process.stderr);
            childProcess.on('close', function (returnCode) {
                if (returnCode !== 0) console.error('Task exited with error code ' + returnCode);
            });
            return childProcess;
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
            var informations = arguments.length <= 1 || arguments[1] === undefined ? {
                '[name]': '.__dummy__', '[id]': '.__dummy__',
                '[hash]': '.__dummy__'
            } : arguments[1];

            var filePath = filePathTemplate;
            for (var placeholderName in informations) {
                if (informations.hasOwnProperty(placeholderName)) filePath = filePath.replace(new RegExp(_clientnode2.default.stringConvertToValidRegularExpression(placeholderName), 'g'), informations[placeholderName]);
            }return filePath;
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
         * @param moduleAliases - Mapping of aliases to take into account.
         * @param knownExtensions - List of file extensions to take into account.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param includePattern - Array of regular expressions to explicitly mark
         * as external dependency.
         * @param excludePattern - Array of regular expressions to explicitly mark
         * as internal dependency.
         * @param inPlaceNormalLibrary - Indicates whether normal libraries should
         * be external or not.
         * @param inPlaceDynamicLibrary - Indicates whether requests with
         * integrated loader configurations should be marked as external or not.
         * @param externalHandableFileExtensions - File extensions which should be
         * able to be handled by the external module bundler. If array is empty
         * every extension will be assumed to be supported.
         * @returns A new resolved request indicating whether given request is an
         * external one.
         */

    }, {
        key: 'determineExternalRequest',
        value: function determineExternalRequest(request) {
            var context = arguments.length <= 1 || arguments[1] === undefined ? './' : arguments[1];
            var requestContext = arguments.length <= 2 || arguments[2] === undefined ? './' : arguments[2];
            var normalizedInternalInjection = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
            var externalModuleLocations = arguments.length <= 4 || arguments[4] === undefined ? [_path2.default.resolve(__dirname, 'node_modules')] : arguments[4];
            var moduleAliases = arguments.length <= 5 || arguments[5] === undefined ? {} : arguments[5];
            var knownExtensions = arguments.length <= 6 || arguments[6] === undefined ? ['', '.js', '.css', '.svg', '.html', 'json'] : arguments[6];
            var referencePath = arguments.length <= 7 || arguments[7] === undefined ? './' : arguments[7];
            var pathsToIgnore = arguments.length <= 8 || arguments[8] === undefined ? ['.git'] : arguments[8];
            var includePattern = arguments.length <= 9 || arguments[9] === undefined ? [] : arguments[9];
            var excludePattern = arguments.length <= 10 || arguments[10] === undefined ? [] : arguments[10];
            var inPlaceNormalLibrary = arguments.length <= 11 || arguments[11] === undefined ? false : arguments[11];
            var inPlaceDynamicLibrary = arguments.length <= 12 || arguments[12] === undefined ? true : arguments[12];
            var externalHandableFileExtensions = arguments.length <= 13 || arguments[13] === undefined ? ['', '.js', '.node', '.json'] : arguments[13];

            context = _path2.default.resolve(context);
            requestContext = _path2.default.resolve(requestContext);
            referencePath = _path2.default.resolve(referencePath);
            // NOTE: We apply alias on externals additionally.
            var resolvedRequest = Helper.applyAliases(request.substring(request.lastIndexOf('!') + 1), moduleAliases);
            /*
                NOTE: Aliases doesn't have to be forwarded since we pass an already
                resolved request.
            */
            var filePath = Helper.determineModuleFilePath(resolvedRequest, {}, knownExtensions, requestContext, referencePath, pathsToIgnore);
            if (!(filePath || inPlaceNormalLibrary) || _clientnode2.default.isAnyMatching(resolvedRequest, includePattern)) return resolvedRequest;
            if (_clientnode2.default.isAnyMatching(resolvedRequest, excludePattern)) return null;
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = normalizedInternalInjection[chunkName][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _moduleID = _step2.value;

                            if (Helper.determineModuleFilePath(_moduleID, moduleAliases, knownExtensions, context, referencePath, pathsToIgnore) === filePath) return null;
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
                }
            } /*
                  NOTE: We mark dependencies as external if they does not contain a
                  loader in their request and aren't part of the current main package
                  or have a file extension other than javaScript aware.
              */
            if (!inPlaceNormalLibrary && (externalHandableFileExtensions.length === 0 || filePath && externalHandableFileExtensions.includes(_path2.default.extname(filePath)) || !filePath && externalHandableFileExtensions.includes('')) && !(inPlaceDynamicLibrary && request.includes('!')) && (!filePath && inPlaceDynamicLibrary || filePath && (!filePath.startsWith(context) || Helper.isFilePathInLocation(filePath, externalModuleLocations)))) return resolvedRequest;
            return null;
        }
        /**
         * Checks if given path points to a valid file.
         * @param filePath - Path to file.
         * @returns A boolean which indicates file existents.
         */

    }, {
        key: 'isFileSync',
        value: function isFileSync(filePath) {
            try {
                fileSystem.accessSync(filePath, fileSystem.F_OK);
                return true;
            } catch (error) {
                return false;
            }
        }
        /**
         * Iterates through given directory structure recursively and calls given
         * callback for each found file. Callback gets file path and corresponding
         * stat object as argument.
         * @param directoryPath - Path to directory structure to traverse.
         * @param callback - Function to invoke for each traversed file.
         * @returns Given callback function.
         */

    }, {
        key: 'walkDirectoryRecursivelySync',
        value: function walkDirectoryRecursivelySync(directoryPath) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function (_filePath, _stat) {
                return true;
            } : arguments[1];

            fileSystem.readdirSync(directoryPath).forEach(function (fileName) {
                var filePath = _path2.default.resolve(directoryPath, fileName);
                var stat = fileSystem.statSync(filePath);
                if (callback(filePath, stat) !== false && stat && stat.isDirectory()) Helper.walkDirectoryRecursivelySync(filePath, callback);
            });
            return callback;
        }
        /**
         * Copies given source file via path to given target directory location
         * with same target name as source file has or copy to given complete
         * target file path.
         * @param sourcePath - Path to file to copy.
         * @param targetPath - Target directory or complete file location to copy
         * to.
         * @returns Determined target file path.
         */

    }, {
        key: 'copyFileSync',
        value: function copyFileSync(sourcePath, targetPath) {
            /*
                NOTE: If target path references a directory a new file with the
                same name will be created.
            */
            try {
                if (fileSystem.lstatSync(targetPath).isDirectory()) targetPath = _path2.default.resolve(targetPath, _path2.default.basename(sourcePath));
            } catch (error) {}
            fileSystem.writeFileSync(targetPath, fileSystem.readFileSync(sourcePath));
            return targetPath;
        }
        /**
         * Copies given source directory via path to given target directory
         * location with same target name as source file has or copy to given
         * complete target directory path.
         * @param sourcePath - Path to directory to copy.
         * @param targetPath - Target directory or complete directory location to
         * copy in.
         * @returns Determined target directory path.
         */

    }, {
        key: 'copyDirectoryRecursiveSync',
        value: function copyDirectoryRecursiveSync(sourcePath, targetPath) {
            try {
                // Check if folder needs to be created or integrated.
                if (fileSystem.lstatSync(targetPath).isDirectory()) targetPath = _path2.default.resolve(targetPath, _path2.default.basename(sourcePath));
            } catch (error) {}
            fileSystem.mkdirSync(targetPath);
            Helper.walkDirectoryRecursivelySync(sourcePath, function (currentSourcePath, stat) {
                var currentTargetPath = _path2.default.join(targetPath, currentSourcePath.substring(sourcePath.length));
                if (stat.isDirectory()) fileSystem.mkdirSync(currentTargetPath);else Helper.copyFileSync(currentSourcePath, currentTargetPath);
            });
            return targetPath;
        }
        /**
         * Determines a asset type if given file.
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
                if (_path2.default.extname(filePath) === '.' + buildConfiguration[type].extension) {
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
         * @returns Converted build configuration.
         */

    }, {
        key: 'resolveBuildConfigurationFilePaths',
        value: function resolveBuildConfigurationFilePaths(configuration) {
            var entryPath = arguments.length <= 1 || arguments[1] === undefined ? './' : arguments[1];
            var pathsToIgnore = arguments.length <= 2 || arguments[2] === undefined ? ['.git'] : arguments[2];

            var buildConfiguration = [];
            var index = 0;
            for (var type in configuration) {
                if (configuration.hasOwnProperty(type)) {
                    var newItem = _clientnode2.default.extendObject(true, { filePaths: [] }, configuration[type]);
                    Helper.walkDirectoryRecursivelySync(entryPath, function (index, buildConfigurationItem) {
                        return function (filePath, stat) {
                            if (Helper.isFilePathInLocation(filePath, pathsToIgnore)) return false;
                            if (stat.isFile() && _path2.default.extname(filePath).substring(1) === buildConfigurationItem.extension && !new RegExp(buildConfigurationItem.fileNamePattern).test(filePath)) buildConfigurationItem.filePaths.push(filePath);
                        };
                    }(index, newItem));
                    buildConfiguration.push(newItem);
                    index += 1;
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
         * @param moduleAliases - Mapping of aliases to take into account.
         * @param knownExtensions - List of file extensions to take into account.
         * @param context - File path to resolve relative to.
         * @param referencePath - Path to search for local modules.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - Module file paths relatively to given
         * context.
         * @param packageEntryFileNames - Names of possible package entry files.
         * @returns Object with a file path and directory path key mapping to
         * corresponding list of paths.
         */

    }, {
        key: 'determineModuleLocations',
        value: function determineModuleLocations(internalInjection) {
            var moduleAliases = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var knownExtensions = arguments.length <= 2 || arguments[2] === undefined ? ['', '.js', '.css', '.svg', '.html', 'json'] : arguments[2];
            var context = arguments.length <= 3 || arguments[3] === undefined ? './' : arguments[3];
            var referencePath = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
            var pathsToIgnore = arguments.length <= 5 || arguments[5] === undefined ? ['.git'] : arguments[5];
            var relativeModuleFilePaths = arguments.length <= 6 || arguments[6] === undefined ? ['', 'node_modules', '../'] : arguments[6];
            var packageEntryFileNames = arguments.length <= 7 || arguments[7] === undefined ? ['__package__', '', 'index', 'main'] : arguments[7];

            var filePaths = [];
            var directoryPaths = [];
            var normalizedInternalInjection = Helper.normalizeInternalInjection(internalInjection);
            for (var chunkName in normalizedInternalInjection) {
                if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = normalizedInternalInjection[chunkName][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var _moduleID2 = _step3.value;

                            var filePath = Helper.determineModuleFilePath(_moduleID2, moduleAliases, knownExtensions, context, referencePath, pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames);
                            if (filePath) {
                                filePaths.push(filePath);
                                var directoryPath = _path2.default.dirname(filePath);
                                if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
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
                }
            }return { filePaths: filePaths, directoryPaths: directoryPaths };
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
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = chunkNamesToDelete[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var _chunkName = _step4.value;

                            delete result[_chunkName];
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
         * @param moduleAliases - Mapping of aliases to take into account.
         * @param knownExtensions - File extensions to take into account.
         * @param context - File path to use as starting point.
         * @param referencePath - Reference path from where local files should be
         * resolved.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @returns Given injection with resolved marked indicators.
         */

    }, {
        key: 'resolveInjection',
        value: function resolveInjection(givenInjection, buildConfigurations, modulesToExclude) {
            var moduleAliases = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
            var knownExtensions = arguments.length <= 4 || arguments[4] === undefined ? ['', '.js', '.css', '.svg', '.html', 'json'] : arguments[4];
            var context = arguments.length <= 5 || arguments[5] === undefined ? './' : arguments[5];
            var referencePath = arguments.length <= 6 || arguments[6] === undefined ? '' : arguments[6];
            var pathsToIgnore = arguments.length <= 7 || arguments[7] === undefined ? ['.git'] : arguments[7];

            var injection = _clientnode2.default.extendObject(true, {}, givenInjection);
            var moduleFilePathsToExclude = Helper.determineModuleLocations(modulesToExclude, moduleAliases, knownExtensions, context, referencePath, pathsToIgnore).filePaths;
            var _arr2 = ['internal', 'external'];
            for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
                var type = _arr2[_i2];
                /* eslint-disable curly */
                if (_typeof(injection[type]) === 'object') {
                    for (var chunkName in injection[type]) {
                        if (injection[type][chunkName] === '__auto__') {
                            injection[type][chunkName] = [];
                            var modules = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
                            for (var subChunkName in modules) {
                                if (modules.hasOwnProperty(subChunkName)) injection[type][chunkName].push(modules[subChunkName]);
                            } /*
                                  Reverse array to let javaScript files be the last
                                  ones to export them rather.
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
            var injectedBaseNames = {};
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = buildConfigurations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var buildConfiguration = _step5.value;

                    if (!injectedBaseNames[buildConfiguration.outputExtension]) injectedBaseNames[buildConfiguration.outputExtension] = [];
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        for (var _iterator6 = buildConfiguration.filePaths[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var moduleFilePath = _step6.value;

                            if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                                var relativeModuleFilePath = _path2.default.relative(context, moduleFilePath);
                                var baseName = _path2.default.basename(relativeModuleFilePath, '.' + buildConfiguration.extension);
                                /*
                                    Ensure that each output type has only one source
                                    representation.
                                */
                                if (!injectedBaseNames[buildConfiguration.outputExtension].includes(baseName)) {
                                    /*
                                        Ensure that same basenames and different output
                                        types can be distinguished by their extension
                                        (JavaScript-Modules remains without extension since
                                        they will be handled first because the build
                                        configurations are expected to be sorted in this
                                        context).
                                    */
                                    if (result[baseName]) result[relativeModuleFilePath] = relativeModuleFilePath;else result[baseName] = relativeModuleFilePath;
                                    injectedBaseNames[buildConfiguration.outputExtension].push(baseName);
                                }
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

            return result;
        }
        /**
         * Determines a concrete file path for given module id.
         * @param moduleID - Module id to determine.
         * @param moduleAliases - Mapping of aliases to take into account.
         * @param knownExtensions - List of known extensions.
         * @param context - File path to determine relative to.
         * @param referencePath - Path to resolve local modules relative to.
         * @param pathsToIgnore - Paths which marks location to ignore.
         * @param relativeModuleFilePaths - List of relative file path to search
         * for modules in.
         * @param packageEntryFileNames - List of package entry file names to
         * search for. The magic name "__package__" will search for an appreciate
         * entry in a "package.json" file.
         * @returns File path or given module id if determinations has failed or
         * wasn't necessary.
         */

    }, {
        key: 'determineModuleFilePath',
        value: function determineModuleFilePath(moduleID) {
            var moduleAliases = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var knownExtensions = arguments.length <= 2 || arguments[2] === undefined ? ['', '.js', '.css', '.svg', '.html', 'json'] : arguments[2];
            var context = arguments.length <= 3 || arguments[3] === undefined ? './' : arguments[3];
            var referencePath = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
            var pathsToIgnore = arguments.length <= 5 || arguments[5] === undefined ? ['.git'] : arguments[5];
            var relativeModuleFilePaths = arguments.length <= 6 || arguments[6] === undefined ? ['node_modules', '../'] : arguments[6];
            var packageEntryFileNames = arguments.length <= 7 || arguments[7] === undefined ? ['__package__', '', 'index', 'main'] : arguments[7];

            moduleID = Helper.applyAliases(Helper.stripLoader(moduleID), moduleAliases);
            if (!moduleID) return null;
            if (referencePath.startsWith('/')) referencePath = _path2.default.relative(context, referencePath);
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = [referencePath].concat(relativeModuleFilePaths)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var moduleLocation = _step7.value;
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = packageEntryFileNames[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var fileName = _step8.value;
                            var _iteratorNormalCompletion9 = true;
                            var _didIteratorError9 = false;
                            var _iteratorError9 = undefined;

                            try {
                                for (var _iterator9 = knownExtensions[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                    var extension = _step9.value;

                                    var moduleFilePath = moduleID;
                                    if (!moduleFilePath.startsWith('/')) moduleFilePath = _path2.default.resolve(context, moduleLocation, moduleFilePath);
                                    if (fileName === '__package__') {
                                        try {
                                            if (fileSystem.statSync(moduleFilePath).isDirectory()) {
                                                var pathToPackageJSON = _path2.default.resolve(moduleFilePath, 'package.json');
                                                if (fileSystem.statSync(pathToPackageJSON).isFile()) {
                                                    var localConfiguration = JSON.parse(fileSystem.readFileSync(pathToPackageJSON, {
                                                        encoding: 'utf-8' }));
                                                    if (localConfiguration.main) fileName = localConfiguration.main;
                                                }
                                            }
                                        } catch (error) {}
                                        if (fileName === '__package__') continue;
                                    }
                                    moduleFilePath = _path2.default.resolve(moduleFilePath, fileName);
                                    moduleFilePath += extension;
                                    if (Helper.isFilePathInLocation(moduleFilePath, pathsToIgnore)) continue;
                                    if (Helper.isFileSync(moduleFilePath)) return moduleFilePath;
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
    }]);

    return Helper;
}();
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion


exports.default = Helper;

//# sourceMappingURL=data:application/json;base64,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ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQge0NoaWxkUHJvY2Vzc30gZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuXG5pbXBvcnQgdHlwZSB7XG4gICAgQnVpbGRDb25maWd1cmF0aW9uLCBJbmplY3Rpb24sIEludGVybmFsSW5qZWN0aW9uLFxuICAgIE5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiwgUGF0aCwgUGxhaW5PYmplY3QsIFJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uLFxuICAgIFJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSwgVHJhdmVyc2VGaWxlc0NhbGxiYWNrRnVuY3Rpb25cbn0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbWV0aG9kc1xuLyoqXG4gKiBQcm92aWRlcyBhIGNsYXNzIG9mIHN0YXRpYyBtZXRob2RzIHdpdGggZ2VuZXJpYyB1c2UgY2FzZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlbHBlciB7XG4gICAgLy8gcmVnaW9uIGJvb2xlYW5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgZ2l2ZW4gZmlsZSBwYXRoIGlzIHdpdGhpbiBnaXZlbiBsaXN0IG9mIGZpbGVcbiAgICAgKiBsb2NhdGlvbnMuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIC0gUGF0aCB0byBmaWxlIHRvIGNoZWNrLlxuICAgICAqIEBwYXJhbSBsb2NhdGlvbnNUb0NoZWNrIC0gTG9jYXRpb25zIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEByZXR1cm5zIFZhbHVlIFwidHJ1ZVwiIGlmIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gb25lIG9mIGdpdmVuXG4gICAgICogbG9jYXRpb25zIG9yIFwiZmFsc2VcIiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgc3RhdGljIGlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIGxvY2F0aW9uc1RvQ2hlY2s6QXJyYXk8c3RyaW5nPlxuICAgICk6Ym9vbGVhbiB7XG4gICAgICAgIGZvciAoY29uc3QgcGF0aFRvQ2hlY2s6c3RyaW5nIG9mIGxvY2F0aW9uc1RvQ2hlY2spXG4gICAgICAgICAgICBpZiAocGF0aC5yZXNvbHZlKGZpbGVQYXRoKS5zdGFydHNXaXRoKHBhdGgucmVzb2x2ZShwYXRoVG9DaGVjaykpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gc3RyaW5nXG4gICAgLyoqXG4gICAgICogU3RyaXBzIGxvYWRlciBpbmZvcm1hdGlvbnMgZm9ybSBnaXZlbiBtb2R1bGUgcmVxdWVzdCBpbmNsdWRpbmcgbG9hZGVyXG4gICAgICogcHJlZml4IGFuZCBxdWVyeSBwYXJhbWV0ZXIuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIHJlcXVlc3QgdG8gc3RyaXAuXG4gICAgICogQHJldHVybnMgR2l2ZW4gbW9kdWxlIGlkIHN0cmlwcGVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBzdHJpcExvYWRlcihtb2R1bGVJRDpzdHJpbmd8U3RyaW5nKTpzdHJpbmcge1xuICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnRvU3RyaW5nKClcbiAgICAgICAgY29uc3QgbW9kdWxlSURXaXRob3V0TG9hZGVyOnN0cmluZyA9IG1vZHVsZUlELnN1YnN0cmluZyhcbiAgICAgICAgICAgIG1vZHVsZUlELmxhc3RJbmRleE9mKCchJykgKyAxKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURXaXRob3V0TG9hZGVyLmluY2x1ZGVzKFxuICAgICAgICAgICAgJz8nXG4gICAgICAgICkgPyBtb2R1bGVJRFdpdGhvdXRMb2FkZXIuc3Vic3RyaW5nKDAsIG1vZHVsZUlEV2l0aG91dExvYWRlci5pbmRleE9mKFxuICAgICAgICAgICAgJz8nXG4gICAgICAgICkpIDogbW9kdWxlSURXaXRob3V0TG9hZGVyXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBhcnJheVxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGdpdmVuIGxpc3Qgb2YgcGF0aCB0byBhIG5vcm1hbGl6ZWQgbGlzdCB3aXRoIHVuaXF1ZSB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHBhdGhzIC0gRmlsZSBwYXRocy5cbiAgICAgKiBAcmV0dXJucyBUaGUgZ2l2ZW4gZmlsZSBwYXRoIGxpc3Qgd2l0aCBub3JtYWxpemVkIHVuaXF1ZSB2YWx1ZXMuXG4gICAgICovXG4gICAgc3RhdGljIG5vcm1hbGl6ZVBhdGhzKHBhdGhzOkFycmF5PHN0cmluZz4pOkFycmF5PHN0cmluZz4ge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KHBhdGhzLm1hcCgoZ2l2ZW5QYXRoOnN0cmluZyk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgIGdpdmVuUGF0aCA9IHBhdGgubm9ybWFsaXplKGdpdmVuUGF0aClcbiAgICAgICAgICAgIGlmIChnaXZlblBhdGguZW5kc1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2l2ZW5QYXRoLnN1YnN0cmluZygwLCBnaXZlblBhdGgubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIHJldHVybiBnaXZlblBhdGhcbiAgICAgICAgfSkpKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZGF0YVxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGdpdmVuIHNlcmlhbGl6ZWQgb3IgYmFzZTY0IGVuY29kZWQgc3RyaW5nIGludG8gYSBqYXZhU2NyaXB0XG4gICAgICogb25lIGlmIHBvc3NpYmxlLlxuICAgICAqIEBwYXJhbSBzZXJpYWxpemVkT2JqZWN0IC0gT2JqZWN0IGFzIHN0cmluZy5cbiAgICAgKiBAcGFyYW0gc2NvcGUgLSBBbiBvcHRpb25hbCBzY29wZSB3aGljaCB3aWxsIGJlIHVzZWQgdG8gZXZhbHVhdGUgZ2l2ZW5cbiAgICAgKiBvYmplY3QgaW4uXG4gICAgICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSB1bmRlciBnaXZlbiBzY29wZSB3aWxsIGJlIGF2YWlsYWJsZS5cbiAgICAgKiBAcmV0dXJucyBUaGUgcGFyc2VkIG9iamVjdCBpZiBwb3NzaWJsZSBhbmQgbnVsbCBvdGhlcndpc2UuXG4gICAgICovXG4gICAgc3RhdGljIHBhcnNlRW5jb2RlZE9iamVjdChcbiAgICAgICAgc2VyaWFsaXplZE9iamVjdDpzdHJpbmcsIHNjb3BlOk9iamVjdCA9IHt9LCBuYW1lOnN0cmluZyA9ICdzY29wZSdcbiAgICApOj9QbGFpbk9iamVjdCB7XG4gICAgICAgIGlmICghc2VyaWFsaXplZE9iamVjdC5zdGFydHNXaXRoKCd7JykpXG4gICAgICAgICAgICBzZXJpYWxpemVkT2JqZWN0ID0gQnVmZmVyLmZyb20oXG4gICAgICAgICAgICAgICAgc2VyaWFsaXplZE9iamVjdCwgJ2Jhc2U2NCdcbiAgICAgICAgICAgICkudG9TdHJpbmcoJ3V0ZjgnKVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKG5hbWUsIGByZXR1cm4gJHtzZXJpYWxpemVkT2JqZWN0fWApKHNjb3BlKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHByb2Nlc3MgaGFuZGxlclxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBhIG9uZSBzaG90IGNsb3NlIGhhbmRsZXIgd2hpY2ggdHJpZ2dlcnMgZ2l2ZW4gcHJvbWlzZSBtZXRob2RzLlxuICAgICAqIElmIGEgcmVhc29uIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZ2l2ZW4gYXMgcmVzb2x2ZSB0YXJnZXQuIEFuIEVycm9yXG4gICAgICogd2lsbCBiZSBnZW5lcmF0ZWQgaWYgcmV0dXJuIGNvZGUgaXMgbm90IHplcm8uIFRoZSBnZW5lcmF0ZWQgRXJyb3IgaGFzXG4gICAgICogYSBwcm9wZXJ0eSBcInJldHVybkNvZGVcIiB3aGljaCBwcm92aWRlcyBjb3JyZXNwb25kaW5nIHByb2Nlc3MgcmV0dXJuXG4gICAgICogY29kZS5cbiAgICAgKiBAcGFyYW0gcmVzb2x2ZSAtIFByb21pc2UncyByZXNvbHZlIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSByZWplY3QgLSBQcm9taXNlJ3MgcmVqZWN0IGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSByZWFzb24gLSBQcm9taXNlIHRhcmdldCBpZiBwcm9jZXNzIGhhcyBhIHplcm8gcmV0dXJuIGNvZGUuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gT3B0aW9uYWwgZnVuY3Rpb24gdG8gY2FsbCBvZiBwcm9jZXNzIGhhcyBzdWNjZXNzZnVsbHlcbiAgICAgKiBmaW5pc2hlZC5cbiAgICAgKiBAcmV0dXJucyBQcm9jZXNzIGNsb3NlIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIGdldFByb2Nlc3NDbG9zZUhhbmRsZXIoXG4gICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvbiwgcmVhc29uOmFueSA9IG51bGwsXG4gICAgICAgIGNhbGxiYWNrOkZ1bmN0aW9uID0gKCk6dm9pZCA9PiB7fVxuICAgICk6KChyZXR1cm5Db2RlOj9udW1iZXIpID0+IHZvaWQpIHtcbiAgICAgICAgbGV0IGZpbmlzaGVkOmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICByZXR1cm4gKHJldHVybkNvZGU6P251bWJlcik6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpbmlzaGVkKVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmV0dXJuQ29kZSAhPT0gJ251bWJlcicgfHwgcmV0dXJuQ29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVhc29uKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yOkVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFRhc2sgZXhpdGVkIHdpdGggZXJyb3IgY29kZSAke3JldHVybkNvZGV9YClcbiAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgICAgIGVycm9yLnJldHVybkNvZGUgPSByZXR1cm5Db2RlXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5pc2hlZCA9IHRydWVcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBGb3J3YXJkcyBnaXZlbiBjaGlsZCBwcm9jZXNzIGNvbW11bmljYXRpb24gY2hhbm5lbHMgdG8gY29ycmVzcG9uZGluZ1xuICAgICAqIGN1cnJlbnQgcHJvY2VzcyBjb21tdW5pY2F0aW9uIGNoYW5uZWxzLlxuICAgICAqIEBwYXJhbSBjaGlsZFByb2Nlc3MgLSBDaGlsZCBwcm9jZXNzIG1ldGEgZGF0YS5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBjaGlsZCBwcm9jZXNzIG1ldGEgZGF0YS5cbiAgICAgKi9cbiAgICBzdGF0aWMgaGFuZGxlQ2hpbGRQcm9jZXNzKGNoaWxkUHJvY2VzczpDaGlsZFByb2Nlc3MpOkNoaWxkUHJvY2VzcyB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQucGlwZShwcm9jZXNzLnN0ZG91dClcbiAgICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5waXBlKHByb2Nlc3Muc3RkZXJyKVxuICAgICAgICBjaGlsZFByb2Nlc3Mub24oJ2Nsb3NlJywgKHJldHVybkNvZGU6bnVtYmVyKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGlmIChyZXR1cm5Db2RlICE9PSAwKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRhc2sgZXhpdGVkIHdpdGggZXJyb3IgY29kZSAke3JldHVybkNvZGV9YClcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGNoaWxkUHJvY2Vzc1xuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZmlsZSBoYW5kbGVyXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBmaWxlIHBhdGgvbmFtZSBwbGFjZWhvbGRlciByZXBsYWNlbWVudHMgd2l0aCBnaXZlbiBidW5kbGVcbiAgICAgKiBhc3NvY2lhdGVkIGluZm9ybWF0aW9ucy5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhUZW1wbGF0ZSAtIEZpbGUgcGF0aCB0byBwcm9jZXNzIHBsYWNlaG9sZGVyIGluLlxuICAgICAqIEBwYXJhbSBpbmZvcm1hdGlvbnMgLSBTY29wZSB0byB1c2UgZm9yIHByb2Nlc3NpbmcuXG4gICAgICogQHJldHVybnMgUHJvY2Vzc2VkIGZpbGUgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgcmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgZmlsZVBhdGhUZW1wbGF0ZTpzdHJpbmcsIGluZm9ybWF0aW9uczp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7XG4gICAgICAgICAgICAnW25hbWVdJzogJy5fX2R1bW15X18nLCAnW2lkXSc6ICcuX19kdW1teV9fJyxcbiAgICAgICAgICAgICdbaGFzaF0nOiAnLl9fZHVtbXlfXydcbiAgICAgICAgfVxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgbGV0IGZpbGVQYXRoOnN0cmluZyA9IGZpbGVQYXRoVGVtcGxhdGVcbiAgICAgICAgZm9yIChjb25zdCBwbGFjZWhvbGRlck5hbWU6c3RyaW5nIGluIGluZm9ybWF0aW9ucylcbiAgICAgICAgICAgIGlmIChpbmZvcm1hdGlvbnMuaGFzT3duUHJvcGVydHkocGxhY2Vob2xkZXJOYW1lKSlcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRSZWd1bGFyRXhwcmVzc2lvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyTmFtZVxuICAgICAgICAgICAgICAgICAgICApLCAnZydcbiAgICAgICAgICAgICAgICApLCBpbmZvcm1hdGlvbnNbcGxhY2Vob2xkZXJOYW1lXSlcbiAgICAgICAgcmV0dXJuIGZpbGVQYXRoXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGdpdmVuIHJlcXVlc3QgcG9pbnRzIHRvIGFuIGV4dGVybmFsIGRlcGVuZGVuY3kgbm90IG1haW50YWluZWRcbiAgICAgKiBieSBjdXJyZW50IHBhY2thZ2UgY29udGV4dC5cbiAgICAgKiBAcGFyYW0gcmVxdWVzdCAtIFJlcXVlc3QgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gQ29udGV4dCBvZiBjdXJyZW50IHByb2plY3QuXG4gICAgICogQHBhcmFtIHJlcXVlc3RDb250ZXh0IC0gQ29udGV4dCBvZiBnaXZlbiByZXF1ZXN0IHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiAtIE1hcHBpbmcgb2YgY2h1bmsgbmFtZXMgdG8gbW9kdWxlc1xuICAgICAqIHdoaWNoIHNob3VsZCBiZSBpbmplY3RlZC5cbiAgICAgKiBAcGFyYW0gZXh0ZXJuYWxNb2R1bGVMb2NhdGlvbnMgLSBBcnJheSBpZiBwYXRocyB3aGVyZSBleHRlcm5hbCBtb2R1bGVzXG4gICAgICogdGFrZSBwbGFjZS5cbiAgICAgKiBAcGFyYW0gbW9kdWxlQWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0ga25vd25FeHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gaW5jbHVkZVBhdHRlcm4gLSBBcnJheSBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRvIGV4cGxpY2l0bHkgbWFya1xuICAgICAqIGFzIGV4dGVybmFsIGRlcGVuZGVuY3kuXG4gICAgICogQHBhcmFtIGV4Y2x1ZGVQYXR0ZXJuIC0gQXJyYXkgb2YgcmVndWxhciBleHByZXNzaW9ucyB0byBleHBsaWNpdGx5IG1hcmtcbiAgICAgKiBhcyBpbnRlcm5hbCBkZXBlbmRlbmN5LlxuICAgICAqIEBwYXJhbSBpblBsYWNlTm9ybWFsTGlicmFyeSAtIEluZGljYXRlcyB3aGV0aGVyIG5vcm1hbCBsaWJyYXJpZXMgc2hvdWxkXG4gICAgICogYmUgZXh0ZXJuYWwgb3Igbm90LlxuICAgICAqIEBwYXJhbSBpblBsYWNlRHluYW1pY0xpYnJhcnkgLSBJbmRpY2F0ZXMgd2hldGhlciByZXF1ZXN0cyB3aXRoXG4gICAgICogaW50ZWdyYXRlZCBsb2FkZXIgY29uZmlndXJhdGlvbnMgc2hvdWxkIGJlIG1hcmtlZCBhcyBleHRlcm5hbCBvciBub3QuXG4gICAgICogQHBhcmFtIGV4dGVybmFsSGFuZGFibGVGaWxlRXh0ZW5zaW9ucyAtIEZpbGUgZXh0ZW5zaW9ucyB3aGljaCBzaG91bGQgYmVcbiAgICAgKiBhYmxlIHRvIGJlIGhhbmRsZWQgYnkgdGhlIGV4dGVybmFsIG1vZHVsZSBidW5kbGVyLiBJZiBhcnJheSBpcyBlbXB0eVxuICAgICAqIGV2ZXJ5IGV4dGVuc2lvbiB3aWxsIGJlIGFzc3VtZWQgdG8gYmUgc3VwcG9ydGVkLlxuICAgICAqIEByZXR1cm5zIEEgbmV3IHJlc29sdmVkIHJlcXVlc3QgaW5kaWNhdGluZyB3aGV0aGVyIGdpdmVuIHJlcXVlc3QgaXMgYW5cbiAgICAgKiBleHRlcm5hbCBvbmUuXG4gICAgICovXG4gICAgc3RhdGljIGRldGVybWluZUV4dGVybmFsUmVxdWVzdChcbiAgICAgICAgcmVxdWVzdDpzdHJpbmcsIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVxdWVzdENvbnRleHQ6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiA9IHt9LFxuICAgICAgICBleHRlcm5hbE1vZHVsZUxvY2F0aW9uczpBcnJheTxzdHJpbmc+ID0gW3BhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIF9fZGlybmFtZSwgJ25vZGVfbW9kdWxlcydcbiAgICAgICAgKV0sIG1vZHVsZUFsaWFzZXM6UGxhaW5PYmplY3QgPSB7fSwga25vd25FeHRlbnNpb25zOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnJywgJy5qcycsICcuY3NzJywgJy5zdmcnLCAnLmh0bWwnLCAnanNvbidcbiAgICAgICAgXSwgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnLi8nLCBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXSxcbiAgICAgICAgaW5jbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgZXhjbHVkZVBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4gPSBbXSxcbiAgICAgICAgaW5QbGFjZU5vcm1hbExpYnJhcnk6Ym9vbGVhbiA9IGZhbHNlLFxuICAgICAgICBpblBsYWNlRHluYW1pY0xpYnJhcnk6Ym9vbGVhbiA9IHRydWUsXG4gICAgICAgIGV4dGVybmFsSGFuZGFibGVGaWxlRXh0ZW5zaW9uczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJycsICcuanMnLCAnLm5vZGUnLCAnLmpzb24nXVxuICAgICk6P3N0cmluZyB7XG4gICAgICAgIGNvbnRleHQgPSBwYXRoLnJlc29sdmUoY29udGV4dClcbiAgICAgICAgcmVxdWVzdENvbnRleHQgPSBwYXRoLnJlc29sdmUocmVxdWVzdENvbnRleHQpXG4gICAgICAgIHJlZmVyZW5jZVBhdGggPSBwYXRoLnJlc29sdmUocmVmZXJlbmNlUGF0aClcbiAgICAgICAgLy8gTk9URTogV2UgYXBwbHkgYWxpYXMgb24gZXh0ZXJuYWxzIGFkZGl0aW9uYWxseS5cbiAgICAgICAgbGV0IHJlc29sdmVkUmVxdWVzdDpzdHJpbmcgPSBIZWxwZXIuYXBwbHlBbGlhc2VzKFxuICAgICAgICAgICAgcmVxdWVzdC5zdWJzdHJpbmcocmVxdWVzdC5sYXN0SW5kZXhPZignIScpICsgMSksIG1vZHVsZUFsaWFzZXMpXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBBbGlhc2VzIGRvZXNuJ3QgaGF2ZSB0byBiZSBmb3J3YXJkZWQgc2luY2Ugd2UgcGFzcyBhbiBhbHJlYWR5XG4gICAgICAgICAgICByZXNvbHZlZCByZXF1ZXN0LlxuICAgICAgICAqL1xuICAgICAgICBsZXQgZmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwge30sIGtub3duRXh0ZW5zaW9ucywgcmVxdWVzdENvbnRleHQsXG4gICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBwYXRoc1RvSWdub3JlKVxuICAgICAgICBpZiAoIShmaWxlUGF0aCB8fCBpblBsYWNlTm9ybWFsTGlicmFyeSkgfHwgVG9vbHMuaXNBbnlNYXRjaGluZyhcbiAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCwgaW5jbHVkZVBhdHRlcm5cbiAgICAgICAgKSlcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlZFJlcXVlc3RcbiAgICAgICAgaWYgKFRvb2xzLmlzQW55TWF0Y2hpbmcocmVzb2x2ZWRSZXF1ZXN0LCBleGNsdWRlUGF0dGVybikpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gbm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uKVxuICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbi5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbltcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELCBtb2R1bGVBbGlhc2VzLCBrbm93bkV4dGVuc2lvbnMsIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICAgICAgICAgICkgPT09IGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIG1hcmsgZGVwZW5kZW5jaWVzIGFzIGV4dGVybmFsIGlmIHRoZXkgZG9lcyBub3QgY29udGFpbiBhXG4gICAgICAgICAgICBsb2FkZXIgaW4gdGhlaXIgcmVxdWVzdCBhbmQgYXJlbid0IHBhcnQgb2YgdGhlIGN1cnJlbnQgbWFpbiBwYWNrYWdlXG4gICAgICAgICAgICBvciBoYXZlIGEgZmlsZSBleHRlbnNpb24gb3RoZXIgdGhhbiBqYXZhU2NyaXB0IGF3YXJlLlxuICAgICAgICAqL1xuICAgICAgICBpZiAoIWluUGxhY2VOb3JtYWxMaWJyYXJ5ICYmIChcbiAgICAgICAgICAgIGV4dGVybmFsSGFuZGFibGVGaWxlRXh0ZW5zaW9ucy5sZW5ndGggPT09IDAgfHwgZmlsZVBhdGggJiZcbiAgICAgICAgICAgIGV4dGVybmFsSGFuZGFibGVGaWxlRXh0ZW5zaW9ucy5pbmNsdWRlcyhwYXRoLmV4dG5hbWUoZmlsZVBhdGgpKSB8fFxuICAgICAgICAgICAgIWZpbGVQYXRoICYmIGV4dGVybmFsSGFuZGFibGVGaWxlRXh0ZW5zaW9ucy5pbmNsdWRlcygnJylcbiAgICAgICAgKSAmJiAhKGluUGxhY2VEeW5hbWljTGlicmFyeSAmJiByZXF1ZXN0LmluY2x1ZGVzKCchJykpICYmIChcbiAgICAgICAgICAgICFmaWxlUGF0aCAmJiBpblBsYWNlRHluYW1pY0xpYnJhcnkgfHwgZmlsZVBhdGggJiYgKFxuICAgICAgICAgICAgIWZpbGVQYXRoLnN0YXJ0c1dpdGgoY29udGV4dCkgfHwgSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoLCBleHRlcm5hbE1vZHVsZUxvY2F0aW9ucykpXG4gICAgICAgICkpXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZWRSZXF1ZXN0XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBnaXZlbiBwYXRoIHBvaW50cyB0byBhIHZhbGlkIGZpbGUuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIC0gUGF0aCB0byBmaWxlLlxuICAgICAqIEByZXR1cm5zIEEgYm9vbGVhbiB3aGljaCBpbmRpY2F0ZXMgZmlsZSBleGlzdGVudHMuXG4gICAgICovXG4gICAgc3RhdGljIGlzRmlsZVN5bmMoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbGVTeXN0ZW0uYWNjZXNzU3luYyhmaWxlUGF0aCwgZmlsZVN5c3RlbS5GX09LKVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEl0ZXJhdGVzIHRocm91Z2ggZ2l2ZW4gZGlyZWN0b3J5IHN0cnVjdHVyZSByZWN1cnNpdmVseSBhbmQgY2FsbHMgZ2l2ZW5cbiAgICAgKiBjYWxsYmFjayBmb3IgZWFjaCBmb3VuZCBmaWxlLiBDYWxsYmFjayBnZXRzIGZpbGUgcGF0aCBhbmQgY29ycmVzcG9uZGluZ1xuICAgICAqIHN0YXQgb2JqZWN0IGFzIGFyZ3VtZW50LlxuICAgICAqIEBwYXJhbSBkaXJlY3RvcnlQYXRoIC0gUGF0aCB0byBkaXJlY3Rvcnkgc3RydWN0dXJlIHRvIHRyYXZlcnNlLlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGludm9rZSBmb3IgZWFjaCB0cmF2ZXJzZWQgZmlsZS5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgd2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhcbiAgICAgICAgZGlyZWN0b3J5UGF0aDpzdHJpbmcsIGNhbGxiYWNrOlRyYXZlcnNlRmlsZXNDYWxsYmFja0Z1bmN0aW9uID0gKFxuICAgICAgICAgICAgX2ZpbGVQYXRoOnN0cmluZywgX3N0YXQ6T2JqZWN0XG4gICAgICAgICk6P2Jvb2xlYW4gPT4gdHJ1ZVxuICAgICk6VHJhdmVyc2VGaWxlc0NhbGxiYWNrRnVuY3Rpb24ge1xuICAgICAgICBmaWxlU3lzdGVtLnJlYWRkaXJTeW5jKGRpcmVjdG9yeVBhdGgpLmZvckVhY2goKFxuICAgICAgICAgICAgZmlsZU5hbWU6c3RyaW5nXG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSBwYXRoLnJlc29sdmUoZGlyZWN0b3J5UGF0aCwgZmlsZU5hbWUpXG4gICAgICAgICAgICBjb25zdCBzdGF0Ok9iamVjdCA9IGZpbGVTeXN0ZW0uc3RhdFN5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2soZmlsZVBhdGgsIHN0YXQpICE9PSBmYWxzZSAmJiBzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoXG4gICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgIEhlbHBlci53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKGZpbGVQYXRoLCBjYWxsYmFjaylcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvcGllcyBnaXZlbiBzb3VyY2UgZmlsZSB2aWEgcGF0aCB0byBnaXZlbiB0YXJnZXQgZGlyZWN0b3J5IGxvY2F0aW9uXG4gICAgICogd2l0aCBzYW1lIHRhcmdldCBuYW1lIGFzIHNvdXJjZSBmaWxlIGhhcyBvciBjb3B5IHRvIGdpdmVuIGNvbXBsZXRlXG4gICAgICogdGFyZ2V0IGZpbGUgcGF0aC5cbiAgICAgKiBAcGFyYW0gc291cmNlUGF0aCAtIFBhdGggdG8gZmlsZSB0byBjb3B5LlxuICAgICAqIEBwYXJhbSB0YXJnZXRQYXRoIC0gVGFyZ2V0IGRpcmVjdG9yeSBvciBjb21wbGV0ZSBmaWxlIGxvY2F0aW9uIHRvIGNvcHlcbiAgICAgKiB0by5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIHRhcmdldCBmaWxlIHBhdGguXG4gICAgICovXG4gICAgc3RhdGljIGNvcHlGaWxlU3luYyhzb3VyY2VQYXRoOnN0cmluZywgdGFyZ2V0UGF0aDpzdHJpbmcpOnN0cmluZyB7XG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBJZiB0YXJnZXQgcGF0aCByZWZlcmVuY2VzIGEgZGlyZWN0b3J5IGEgbmV3IGZpbGUgd2l0aCB0aGVcbiAgICAgICAgICAgIHNhbWUgbmFtZSB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgICAgICovXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5sc3RhdFN5bmModGFyZ2V0UGF0aCkuaXNEaXJlY3RvcnkoKSlcbiAgICAgICAgICAgICAgICB0YXJnZXRQYXRoID0gcGF0aC5yZXNvbHZlKHRhcmdldFBhdGgsIHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZVBhdGgpKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgZmlsZVN5c3RlbS53cml0ZUZpbGVTeW5jKHRhcmdldFBhdGgsIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKFxuICAgICAgICAgICAgc291cmNlUGF0aCkpXG4gICAgICAgIHJldHVybiB0YXJnZXRQYXRoXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvcGllcyBnaXZlbiBzb3VyY2UgZGlyZWN0b3J5IHZpYSBwYXRoIHRvIGdpdmVuIHRhcmdldCBkaXJlY3RvcnlcbiAgICAgKiBsb2NhdGlvbiB3aXRoIHNhbWUgdGFyZ2V0IG5hbWUgYXMgc291cmNlIGZpbGUgaGFzIG9yIGNvcHkgdG8gZ2l2ZW5cbiAgICAgKiBjb21wbGV0ZSB0YXJnZXQgZGlyZWN0b3J5IHBhdGguXG4gICAgICogQHBhcmFtIHNvdXJjZVBhdGggLSBQYXRoIHRvIGRpcmVjdG9yeSB0byBjb3B5LlxuICAgICAqIEBwYXJhbSB0YXJnZXRQYXRoIC0gVGFyZ2V0IGRpcmVjdG9yeSBvciBjb21wbGV0ZSBkaXJlY3RvcnkgbG9jYXRpb24gdG9cbiAgICAgKiBjb3B5IGluLlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgdGFyZ2V0IGRpcmVjdG9yeSBwYXRoLlxuICAgICAqL1xuICAgIHN0YXRpYyBjb3B5RGlyZWN0b3J5UmVjdXJzaXZlU3luYyhcbiAgICAgICAgc291cmNlUGF0aDpzdHJpbmcsIHRhcmdldFBhdGg6c3RyaW5nXG4gICAgKTpzdHJpbmcge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgZm9sZGVyIG5lZWRzIHRvIGJlIGNyZWF0ZWQgb3IgaW50ZWdyYXRlZC5cbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtLmxzdGF0U3luYyh0YXJnZXRQYXRoKS5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAgICAgIHRhcmdldFBhdGggPSBwYXRoLnJlc29sdmUodGFyZ2V0UGF0aCwgcGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgc291cmNlUGF0aCkpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICBmaWxlU3lzdGVtLm1rZGlyU3luYyh0YXJnZXRQYXRoKVxuICAgICAgICBIZWxwZXIud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhzb3VyY2VQYXRoLCAoXG4gICAgICAgICAgICBjdXJyZW50U291cmNlUGF0aDpzdHJpbmcsIHN0YXQ6T2JqZWN0XG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0UGF0aDpzdHJpbmcgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgdGFyZ2V0UGF0aCwgY3VycmVudFNvdXJjZVBhdGguc3Vic3RyaW5nKHNvdXJjZVBhdGgubGVuZ3RoKSlcbiAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICAgICAgZmlsZVN5c3RlbS5ta2RpclN5bmMoY3VycmVudFRhcmdldFBhdGgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgSGVscGVyLmNvcHlGaWxlU3luYyhjdXJyZW50U291cmNlUGF0aCwgY3VycmVudFRhcmdldFBhdGgpXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB0YXJnZXRQYXRoXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBhc3NldCB0eXBlIGlmIGdpdmVuIGZpbGUuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIC0gUGF0aCB0byBmaWxlIHRvIGFuYWx5c2UuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbiAtIE1ldGEgaW5mb3JtYXRpb25zIGZvciBhdmFpbGFibGUgYXNzZXRcbiAgICAgKiB0eXBlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHMgLSBMaXN0IG9mIHBhdGhzIHRvIHNlYXJjaCBpZiBnaXZlbiBwYXRoIGRvZXNuJ3QgcmVmZXJlbmNlXG4gICAgICogYSBmaWxlIGRpcmVjdGx5LlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgZmlsZSB0eXBlIG9yIFwibnVsbFwiIG9mIGdpdmVuIGZpbGUgY291bGRuJ3QgYmVcbiAgICAgKiBkZXRlcm1pbmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgIGZpbGVQYXRoOnN0cmluZywgYnVpbGRDb25maWd1cmF0aW9uOkJ1aWxkQ29uZmlndXJhdGlvbiwgcGF0aHM6UGF0aFxuICAgICk6P3N0cmluZyB7XG4gICAgICAgIGxldCByZXN1bHQ6P3N0cmluZyA9IG51bGxcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiBidWlsZENvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAocGF0aC5leHRuYW1lKFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoXG4gICAgICAgICAgICApID09PSBgLiR7YnVpbGRDb25maWd1cmF0aW9uW3R5cGVdLmV4dGVuc2lvbn1gKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdHlwZVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIGlmICghcmVzdWx0KVxuICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ3NvdXJjZScsICd0YXJnZXQnXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0VHlwZTpzdHJpbmcgaW4gcGF0aHNbdHlwZV0uYXNzZXQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXRoc1t0eXBlXS5hc3NldC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZVxuICAgICAgICAgICAgICAgICAgICApICYmIGFzc2V0VHlwZSAhPT0gJ2Jhc2UnICYmXG4gICAgICAgICAgICAgICAgICAgIHBhdGhzW3R5cGVdLmFzc2V0W2Fzc2V0VHlwZV0gJiYgZmlsZVBhdGguc3RhcnRzV2l0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzW3R5cGVdLmFzc2V0W2Fzc2V0VHlwZV1cbiAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhc3NldFR5cGVcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgcHJvcGVydHkgd2l0aCBhIHN0b3JlZCBhcnJheSBvZiBhbGwgbWF0Y2hpbmcgZmlsZSBwYXRocywgd2hpY2hcbiAgICAgKiBtYXRjaGVzIGVhY2ggYnVpbGQgY29uZmlndXJhdGlvbiBpbiBnaXZlbiBlbnRyeSBwYXRoIGFuZCBjb252ZXJ0cyBnaXZlblxuICAgICAqIGJ1aWxkIGNvbmZpZ3VyYXRpb24gaW50byBhIHNvcnRlZCBhcnJheSB3ZXJlIGphdmFTY3JpcHQgZmlsZXMgdGFrZXNcbiAgICAgKiBwcmVjZWRlbmNlLlxuICAgICAqIEBwYXJhbSBjb25maWd1cmF0aW9uIC0gR2l2ZW4gYnVpbGQgY29uZmlndXJhdGlvbnMuXG4gICAgICogQHBhcmFtIGVudHJ5UGF0aCAtIFBhdGggdG8gYW5hbHlzZSBuZXN0ZWQgc3RydWN0dXJlLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEByZXR1cm5zIENvbnZlcnRlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICBjb25maWd1cmF0aW9uOkJ1aWxkQ29uZmlndXJhdGlvbiwgZW50cnlQYXRoOnN0cmluZyA9ICcuLycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddXG4gICAgKTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiB7XG4gICAgICAgIGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbjpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9IFtdXG4gICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbilcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0gPVxuICAgICAgICAgICAgICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge2ZpbGVQYXRoczogW119LCBjb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZV0pXG4gICAgICAgICAgICAgICAgSGVscGVyLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoZW50cnlQYXRoLCAoKFxuICAgICAgICAgICAgICAgICAgICBpbmRleDpudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbkl0ZW06UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtXG4gICAgICAgICAgICAgICAgKTpUcmF2ZXJzZUZpbGVzQ2FsbGJhY2tGdW5jdGlvbiA9PiAoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOnN0cmluZywgc3RhdDpPYmplY3RcbiAgICAgICAgICAgICAgICApOj9ib29sZWFuID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihmaWxlUGF0aCwgcGF0aHNUb0lnbm9yZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXQuaXNGaWxlKCkgJiYgcGF0aC5leHRuYW1lKGZpbGVQYXRoKS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgICAgICkgPT09IGJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0uZXh0ZW5zaW9uICYmICEobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0uZmlsZU5hbWVQYXR0ZXJuXG4gICAgICAgICAgICAgICAgICAgICkpLnRlc3QoZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uSXRlbS5maWxlUGF0aHMucHVzaChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICB9KShpbmRleCwgbmV3SXRlbSkpXG4gICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLnB1c2gobmV3SXRlbSlcbiAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWlsZENvbmZpZ3VyYXRpb24uc29ydCgoXG4gICAgICAgICAgICBmaXJzdDpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0sXG4gICAgICAgICAgICBzZWNvbmQ6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtXG4gICAgICAgICk6bnVtYmVyID0+IHtcbiAgICAgICAgICAgIGlmIChmaXJzdC5vdXRwdXRFeHRlbnNpb24gIT09IHNlY29uZC5vdXRwdXRFeHRlbnNpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3Qub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgICAgICBpZiAoc2Vjb25kLm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3Qub3V0cHV0RXh0ZW5zaW9uIDwgc2Vjb25kLm91dHB1dEV4dGVuc2lvbiA/IC0xIDogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfSlcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgZmlsZSBhbmQgZGlyZWN0b3J5IHBhdGhzIHJlbGF0ZWQgdG8gZ2l2ZW4gaW50ZXJuYWxcbiAgICAgKiBtb2R1bGVzIGFzIGFycmF5LlxuICAgICAqIEBwYXJhbSBpbnRlcm5hbEluamVjdGlvbiAtIExpc3Qgb2YgbW9kdWxlIGlkcyBvciBtb2R1bGUgZmlsZSBwYXRocy5cbiAgICAgKiBAcGFyYW0gbW9kdWxlQWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0ga25vd25FeHRlbnNpb25zIC0gTGlzdCBvZiBmaWxlIGV4dGVuc2lvbnMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBGaWxlIHBhdGggdG8gcmVzb2x2ZSByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFBhdGggdG8gc2VhcmNoIGZvciBsb2NhbCBtb2R1bGVzLlxuICAgICAqIEBwYXJhbSBwYXRoc1RvSWdub3JlIC0gUGF0aHMgd2hpY2ggbWFya3MgbG9jYXRpb24gdG8gaWdub3JlLlxuICAgICAqIEBwYXJhbSByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocyAtIE1vZHVsZSBmaWxlIHBhdGhzIHJlbGF0aXZlbHkgdG8gZ2l2ZW5cbiAgICAgKiBjb250ZXh0LlxuICAgICAqIEBwYXJhbSBwYWNrYWdlRW50cnlGaWxlTmFtZXMgLSBOYW1lcyBvZiBwb3NzaWJsZSBwYWNrYWdlIGVudHJ5IGZpbGVzLlxuICAgICAqIEByZXR1cm5zIE9iamVjdCB3aXRoIGEgZmlsZSBwYXRoIGFuZCBkaXJlY3RvcnkgcGF0aCBrZXkgbWFwcGluZyB0b1xuICAgICAqIGNvcnJlc3BvbmRpbmcgbGlzdCBvZiBwYXRocy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICBpbnRlcm5hbEluamVjdGlvbjpJbnRlcm5hbEluamVjdGlvbiwgbW9kdWxlQWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBrbm93bkV4dGVuc2lvbnM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICcnLCAnLmpzJywgJy5jc3MnLCAnLnN2ZycsICcuaHRtbCcsICdqc29uJ1xuICAgICAgICBdLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddLFxuICAgICAgICByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID0gWycnLCAnbm9kZV9tb2R1bGVzJywgJy4uLyddLFxuICAgICAgICBwYWNrYWdlRW50cnlGaWxlTmFtZXM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICdfX3BhY2thZ2VfXycsICcnLCAnaW5kZXgnLCAnbWFpbiddXG4gICAgKTp7ZmlsZVBhdGhzOkFycmF5PHN0cmluZz47ZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPn0ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGhzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb246Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID1cbiAgICAgICAgICAgIEhlbHBlci5ub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihpbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELCBtb2R1bGVBbGlhc2VzLCBrbm93bkV4dGVuc2lvbnMsIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBwYXRoc1RvSWdub3JlLCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhY2thZ2VFbnRyeUZpbGVOYW1lcylcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHMucHVzaChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGg6c3RyaW5nID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFkaXJlY3RvcnlQYXRocy5pbmNsdWRlcyhkaXJlY3RvcnlQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RvcnlQYXRocy5wdXNoKGRpcmVjdG9yeVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiB7ZmlsZVBhdGhzLCBkaXJlY3RvcnlQYXRoc31cbiAgICB9XG4gICAgLyoqXG4gICAgICogRXZlcnkgaW5qZWN0aW9uIGRlZmluaXRpb24gdHlwZSBjYW4gYmUgcmVwcmVzZW50ZWQgYXMgcGxhaW4gb2JqZWN0XG4gICAgICogKG1hcHBpbmcgZnJvbSBjaHVuayBuYW1lIHRvIGFycmF5IG9mIG1vZHVsZSBpZHMpLiBUaGlzIG1ldGhvZCBjb252ZXJ0c1xuICAgICAqIGVhY2ggcmVwcmVzZW50YXRpb24gaW50byB0aGUgbm9ybWFsaXplZCBwbGFpbiBvYmplY3Qgbm90YXRpb24uXG4gICAgICogQHBhcmFtIGludGVybmFsSW5qZWN0aW9uIC0gR2l2ZW4gaW50ZXJuYWwgaW5qZWN0aW9uIHRvIG5vcm1hbGl6ZS5cbiAgICAgKiBAcmV0dXJucyBOb3JtYWxpemVkIHJlcHJlc2VudGF0aW9uIG9mIGdpdmVuIGludGVybmFsIGluamVjdGlvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgbm9ybWFsaXplSW50ZXJuYWxJbmplY3Rpb24oXG4gICAgICAgIGludGVybmFsSW5qZWN0aW9uOkludGVybmFsSW5qZWN0aW9uXG4gICAgKTpOb3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24ge1xuICAgICAgICBsZXQgcmVzdWx0Ok5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiA9IHt9XG4gICAgICAgIGlmIChpbnRlcm5hbEluamVjdGlvbiBpbnN0YW5jZW9mIE9iamVjdCAmJiBUb29scy5pc1BsYWluT2JqZWN0KFxuICAgICAgICAgICAgaW50ZXJuYWxJbmplY3Rpb25cbiAgICAgICAgKSkge1xuICAgICAgICAgICAgbGV0IGhhc0NvbnRlbnQ6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgICAgICBjb25zdCBjaHVua05hbWVzVG9EZWxldGU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gaW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVzVG9EZWxldGUucHVzaChjaHVua05hbWUpXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjaHVua05hbWVdID0gW2ludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoYXNDb250ZW50KVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBvZiBjaHVua05hbWVzVG9EZWxldGUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogW119XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGludGVybmFsSW5qZWN0aW9uID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogW2ludGVybmFsSW5qZWN0aW9uXX1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpbnRlcm5hbEluamVjdGlvbikpXG4gICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IGludGVybmFsSW5qZWN0aW9ufVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIGNvbmNyZXRlIGZpbGUgcGF0aHMgZm9yIGdpdmVuIGluamVjdGlvbiB3aGljaCBhcmUgbWFya2VkXG4gICAgICogd2l0aCB0aGUgXCJfX2F1dG9fX1wiIGluZGljYXRvci5cbiAgICAgKiBAcGFyYW0gZ2l2ZW5JbmplY3Rpb24gLSBHaXZlbiBpbnRlcm5hbCBhbmQgZXh0ZXJuYWwgaW5qZWN0aW9uIHRvIHRha2VcbiAgICAgKiBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbnMgLSBSZXNvbHZlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqIEBwYXJhbSBtb2R1bGVzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgdG8gZXhjbHVkZSAoc3BlY2lmaWVkIGJ5XG4gICAgICogcGF0aCBvciBpZCkgb3IgYSBtYXBwaW5nIGZyb20gY2h1bmsgbmFtZXMgdG8gbW9kdWxlIGlkcy5cbiAgICAgKiBAcGFyYW0gbW9kdWxlQWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0ga25vd25FeHRlbnNpb25zIC0gRmlsZSBleHRlbnNpb25zIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcGFyYW0gcmVmZXJlbmNlUGF0aCAtIFJlZmVyZW5jZSBwYXRoIGZyb20gd2hlcmUgbG9jYWwgZmlsZXMgc2hvdWxkIGJlXG4gICAgICogcmVzb2x2ZWQuXG4gICAgICogQHBhcmFtIHBhdGhzVG9JZ25vcmUgLSBQYXRocyB3aGljaCBtYXJrcyBsb2NhdGlvbiB0byBpZ25vcmUuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9uIHdpdGggcmVzb2x2ZWQgbWFya2VkIGluZGljYXRvcnMuXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVJbmplY3Rpb24oXG4gICAgICAgIGdpdmVuSW5qZWN0aW9uOkluamVjdGlvbixcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlc1RvRXhjbHVkZTpJbnRlcm5hbEluamVjdGlvbixcbiAgICAgICAgbW9kdWxlQWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LCBrbm93bkV4dGVuc2lvbnM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICcnLCAnLmpzJywgJy5jc3MnLCAnLnN2ZycsICcuaHRtbCcsICdqc29uJ1xuICAgICAgICBdLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHJlZmVyZW5jZVBhdGg6c3RyaW5nID0gJycsXG4gICAgICAgIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddXG4gICAgKTpJbmplY3Rpb24ge1xuICAgICAgICBjb25zdCBpbmplY3Rpb246SW5qZWN0aW9uID0gVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgdHJ1ZSwge30sIGdpdmVuSW5qZWN0aW9uKVxuICAgICAgICBjb25zdCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGU6QXJyYXk8c3RyaW5nPiA9XG4gICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgIG1vZHVsZXNUb0V4Y2x1ZGUsIG1vZHVsZUFsaWFzZXMsIGtub3duRXh0ZW5zaW9ucywgY29udGV4dCxcbiAgICAgICAgICAgICAgICByZWZlcmVuY2VQYXRoLCBwYXRoc1RvSWdub3JlXG4gICAgICAgICAgICApLmZpbGVQYXRoc1xuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnaW50ZXJuYWwnLCAnZXh0ZXJuYWwnXSlcbiAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGN1cmx5ICovXG4gICAgICAgICAgICBpZiAodHlwZW9mIGluamVjdGlvblt0eXBlXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gaW5qZWN0aW9uW3R5cGVdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0gPT09ICdfX2F1dG9fXycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZXM6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtrZXk6c3RyaW5nXTpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnMsIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJDaHVua05hbWU6c3RyaW5nIGluIG1vZHVsZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZHVsZXMuaGFzT3duUHJvcGVydHkoc3ViQ2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0aW9uW3R5cGVdW2NodW5rTmFtZV0ucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZXNbc3ViQ2h1bmtOYW1lXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmV2ZXJzZSBhcnJheSB0byBsZXQgamF2YVNjcmlwdCBmaWxlcyBiZSB0aGUgbGFzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uZXMgdG8gZXhwb3J0IHRoZW0gcmF0aGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGluamVjdGlvblt0eXBlXSA9PT0gJ19fYXV0b19fJylcbiAgICAgICAgICAgIC8qIGVzbGludC1lbmFibGUgY3VybHkgKi9cbiAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV0gPSBIZWxwZXIuZ2V0QXV0b0NodW5rKFxuICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsIGNvbnRleHQpXG4gICAgICAgIHJldHVybiBpbmplY3Rpb25cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhbGwgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbnMgLSBSZXNvbHZlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqIEBwYXJhbSBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUgLSBBIGxpc3Qgb2YgbW9kdWxlcyBmaWxlIHBhdGhzIHRvXG4gICAgICogZXhjbHVkZSAoc3BlY2lmaWVkIGJ5IHBhdGggb3IgaWQpIG9yIGEgbWFwcGluZyBmcm9tIGNodW5rIG5hbWVzIHRvXG4gICAgICogbW9kdWxlIGlkcy5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byB1c2UgYXMgc3RhcnRpbmcgcG9pbnQuXG4gICAgICogQHJldHVybnMgQWxsIGRldGVybWluZWQgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICovXG4gICAgc3RhdGljIGdldEF1dG9DaHVuayhcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4sIGNvbnRleHQ6c3RyaW5nXG4gICAgKTp7W2tleTpzdHJpbmddOnN0cmluZ30ge1xuICAgICAgICBjb25zdCByZXN1bHQ6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge31cbiAgICAgICAgY29uc3QgaW5qZWN0ZWRCYXNlTmFtZXM6e1trZXk6c3RyaW5nXTpBcnJheTxzdHJpbmc+fSA9IHt9XG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtIG9mXG4gICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zXG4gICAgICAgICkge1xuICAgICAgICAgICAgaWYgKCFpbmplY3RlZEJhc2VOYW1lc1tidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXSlcbiAgICAgICAgICAgICAgICBpbmplY3RlZEJhc2VOYW1lc1tidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXSA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyBvZiBidWlsZENvbmZpZ3VyYXRpb24uZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgIGlmICghbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLmluY2x1ZGVzKG1vZHVsZUZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWxhdGl2ZU1vZHVsZUZpbGVQYXRoOnN0cmluZyA9IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCBtb2R1bGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFzZU5hbWU6c3RyaW5nID0gcGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBgLiR7YnVpbGRDb25maWd1cmF0aW9uLmV4dGVuc2lvbn1gKVxuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgRW5zdXJlIHRoYXQgZWFjaCBvdXRwdXQgdHlwZSBoYXMgb25seSBvbmUgc291cmNlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpbmplY3RlZEJhc2VOYW1lc1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgXS5pbmNsdWRlcyhiYXNlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRW5zdXJlIHRoYXQgc2FtZSBiYXNlbmFtZXMgYW5kIGRpZmZlcmVudCBvdXRwdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlcyBjYW4gYmUgZGlzdGluZ3Vpc2hlZCBieSB0aGVpciBleHRlbnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoSmF2YVNjcmlwdC1Nb2R1bGVzIHJlbWFpbnMgd2l0aG91dCBleHRlbnNpb24gc2luY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGV5IHdpbGwgYmUgaGFuZGxlZCBmaXJzdCBiZWNhdXNlIHRoZSBidWlsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zIGFyZSBleHBlY3RlZCB0byBiZSBzb3J0ZWQgaW4gdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQpLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHRbYmFzZU5hbWVdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtyZWxhdGl2ZU1vZHVsZUZpbGVQYXRoXSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbYmFzZU5hbWVdID0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0ZWRCYXNlTmFtZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgXS5wdXNoKGJhc2VOYW1lKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIG1vZHVsZUFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGtub3duRXh0ZW5zaW9ucyAtIExpc3Qgb2Yga25vd24gZXh0ZW5zaW9ucy5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byBkZXRlcm1pbmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZVBhdGggLSBQYXRoIHRvIHJlc29sdmUgbG9jYWwgbW9kdWxlcyByZWxhdGl2ZSB0by5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZS5cbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHMgLSBMaXN0IG9mIHJlbGF0aXZlIGZpbGUgcGF0aCB0byBzZWFyY2hcbiAgICAgKiBmb3IgbW9kdWxlcyBpbi5cbiAgICAgKiBAcGFyYW0gcGFja2FnZUVudHJ5RmlsZU5hbWVzIC0gTGlzdCBvZiBwYWNrYWdlIGVudHJ5IGZpbGUgbmFtZXMgdG9cbiAgICAgKiBzZWFyY2ggZm9yLiBUaGUgbWFnaWMgbmFtZSBcIl9fcGFja2FnZV9fXCIgd2lsbCBzZWFyY2ggZm9yIGFuIGFwcHJlY2lhdGVcbiAgICAgKiBlbnRyeSBpbiBhIFwicGFja2FnZS5qc29uXCIgZmlsZS5cbiAgICAgKiBAcmV0dXJucyBGaWxlIHBhdGggb3IgZ2l2ZW4gbW9kdWxlIGlkIGlmIGRldGVybWluYXRpb25zIGhhcyBmYWlsZWQgb3JcbiAgICAgKiB3YXNuJ3QgbmVjZXNzYXJ5LlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgbW9kdWxlSUQ6c3RyaW5nLCBtb2R1bGVBbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGtub3duRXh0ZW5zaW9uczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJycsICcuanMnLCAnLmNzcycsICcuc3ZnJywgJy5odG1sJywgJ2pzb24nXG4gICAgICAgIF0sIGNvbnRleHQ6c3RyaW5nID0gJy4vJywgcmVmZXJlbmNlUGF0aDpzdHJpbmcgPSAnJyxcbiAgICAgICAgcGF0aHNUb0lnbm9yZTpBcnJheTxzdHJpbmc+ID0gWycuZ2l0J10sXG4gICAgICAgIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPSBbJ25vZGVfbW9kdWxlcycsICcuLi8nXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnX19wYWNrYWdlX18nLCAnJywgJ2luZGV4JywgJ21haW4nXVxuICAgICk6P3N0cmluZyB7XG4gICAgICAgIG1vZHVsZUlEID0gSGVscGVyLmFwcGx5QWxpYXNlcyhcbiAgICAgICAgICAgIEhlbHBlci5zdHJpcExvYWRlcihtb2R1bGVJRCksIG1vZHVsZUFsaWFzZXMpXG4gICAgICAgIGlmICghbW9kdWxlSUQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBpZiAocmVmZXJlbmNlUGF0aC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICByZWZlcmVuY2VQYXRoID0gcGF0aC5yZWxhdGl2ZShjb250ZXh0LCByZWZlcmVuY2VQYXRoKVxuICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUxvY2F0aW9uOnN0cmluZyBvZiBbcmVmZXJlbmNlUGF0aF0uY29uY2F0KFxuICAgICAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHNcbiAgICAgICAgKSlcbiAgICAgICAgICAgIGZvciAobGV0IGZpbGVOYW1lOnN0cmluZyBvZiBwYWNrYWdlRW50cnlGaWxlTmFtZXMpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBleHRlbnNpb246c3RyaW5nIG9mIGtub3duRXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kdWxlRmlsZVBhdGg6c3RyaW5nID0gbW9kdWxlSURcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtb2R1bGVGaWxlUGF0aC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCBtb2R1bGVMb2NhdGlvbiwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ19fcGFja2FnZV9fJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5zdGF0U3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aFRvUGFja2FnZUpTT046c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGgsICdwYWNrYWdlLmpzb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5zdGF0U3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhUb1BhY2thZ2VKU09OXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFRvUGFja2FnZUpTT04sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmLTgnfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxDb25maWd1cmF0aW9uLm1haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBsb2NhbENvbmZpZ3VyYXRpb24ubWFpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgPT09ICdfX3BhY2thZ2VfXycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShtb2R1bGVGaWxlUGF0aCwgZmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoICs9IGV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGgsIHBhdGhzVG9JZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlU3luYyhtb2R1bGVGaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBjb25jcmV0ZSBmaWxlIHBhdGggZm9yIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKiBAcGFyYW0gbW9kdWxlSUQgLSBNb2R1bGUgaWQgdG8gZGV0ZXJtaW5lLlxuICAgICAqIEBwYXJhbSBhbGlhc2VzIC0gTWFwcGluZyBvZiBhbGlhc2VzIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEByZXR1cm5zIFRoZSBhbGlhcyBhcHBsaWVkIGdpdmVuIG1vZHVsZSBpZC5cbiAgICAgKi9cbiAgICBzdGF0aWMgYXBwbHlBbGlhc2VzKG1vZHVsZUlEOnN0cmluZywgYWxpYXNlczpQbGFpbk9iamVjdCk6c3RyaW5nIHtcbiAgICAgICAgZm9yIChjb25zdCBhbGlhczpzdHJpbmcgaW4gYWxpYXNlcylcbiAgICAgICAgICAgIGlmIChhbGlhcy5lbmRzV2l0aCgnJCcpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1vZHVsZUlEID09PSBhbGlhcy5zdWJzdHJpbmcoMCwgYWxpYXMubGVuZ3RoIC0gMSkpXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gYWxpYXNlc1thbGlhc11cbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIG1vZHVsZUlEID0gbW9kdWxlSUQucmVwbGFjZShhbGlhcywgYWxpYXNlc1thbGlhc10pXG4gICAgICAgIHJldHVybiBtb2R1bGVJRFxuICAgIH1cbn1cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=