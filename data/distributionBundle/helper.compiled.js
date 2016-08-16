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

var _child_process = require('child_process');

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}
// endregion
// region declarations
// NOTE: This declaration isn't needed if flow knows javaScript's native
// "Proxy" in future.

// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
class Helper {
    // region boolean
    /**
     * Checks weather one of the given pattern matches given string.
     * @param target - Target to check in pattern for.
     * @param pattern - List of pattern to check for.
     * @returns Value "true" if given object is matches by at leas one of the
     * given pattern and "false" otherwise.
     */
    static isAnyMatching(target, pattern) {
        for (const currentPattern of pattern) if (typeof currentPattern === 'string') {
            if (currentPattern === target) return true;
        } else if (currentPattern.test(target)) return true;
        return false;
    }
    /**
     * Checks weather given object is a plain native object.
     * @param object - Object to check.
     * @returns Value "true" if given object is a plain javaScript object and
     * "false" otherwise.
     */
    static isPlainObject(object) {
        return typeof object === 'object' && object !== null && Object.getPrototypeOf(object) === Object.prototype;
    }
    /**
     * Checks weather given object is a function.
     * @param object - Object to check.
     * @returns Value "true" if given object is a function and "false"
     * otherwise.
     */
    static isFunction(object) {
        return Boolean(object) && {}.toString.call(object) === '[object Function]';
    }
    /**
     * Determines whether given file path is within given list of file
     * locations.
     * @param filePath - Path to file to check.
     * @param locationsToCheck - Locations to take into account.
     * @returns Value "true" if given file path is within one of given
     * locations or "false" otherwise.
     */
    static isFilePathInLocation(filePath, locationsToCheck) {
        for (const pathToCheck of locationsToCheck) if (_path2.default.resolve(filePath).startsWith(_path2.default.resolve(pathToCheck))) return true;
        return false;
    }
    // endregion
    // region data handling
    /**
     * Converts given object into its serialized json representation by
     * replacing circular references with a given provided value.
     * @param object - Object to serialize.
     * @param determineCicularReferenceValue - Callback to create a fallback
     * value depending on given redundant value.
     * @param numberOfSpaces - Number of spaces to use for string formatting.
     */
    static convertCircularObjectToJSON(object, determineCicularReferenceValue = () => '__circularReference__', numberOfSpaces = 0) {
        const seenObjects = [];
        return JSON.stringify(object, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seenObjects.includes(value)) return determineCicularReferenceValue(key, value, seenObjects);
                seenObjects.push(value);
                return value;
            }
            return value;
        }, numberOfSpaces);
    }
    /**
     * Converts given serialized or base64 encoded string into a javaScript
     * one if possible.
     * @param serializedObject - Object as string.
     * @param scope - An optional scope which will be used to evaluate given
     * object in.
     * @param name - The name under given scope will be available.
     * @returns The parsed object if possible and null otherwise.
     */
    static parseEncodedObject(serializedObject, scope = {}, name = 'scope') {
        if (!serializedObject.startsWith('{')) serializedObject = Buffer.from(serializedObject, 'base64').toString('utf8');
        try {
            // IgnoreTypeCheck
            return new Function(name, `return ${ serializedObject }`)(scope);
        } catch (error) {}
        return null;
    }
    /**
     * Replaces given pattern in each value in given object recursively with
     * given string replacement.
     * @param object - Object to convert substrings in.
     * @param pattern - Regular expression to replace.
     * @param replacement - String to use as replacement for found patterns.
     * @returns Converted object with replaced patterns.
     */
    static convertSubstringInPlainObject(object, pattern, replacement) {
        for (const key in object) if (object.hasOwnProperty(key)) if (Helper.isPlainObject(object[key])) object[key] = Helper.convertSubstringInPlainObject(object[key], pattern, replacement);else if (typeof object[key] === 'string') object[key] = object[key].replace(pattern, replacement);
        return object;
    }
    /**
     * Extends given target object with given sources object. As target and
     * sources many expandable types are allowed but target and sources have to
     * to come from the same type.
     * @param targetOrDeepIndicator - Maybe the target or deep indicator.
     * @param _targetAndOrSources - Target and at least one source object.
     * @returns Returns given target extended with all given sources.
     */
    static extendObject(targetOrDeepIndicator, ..._targetAndOrSources) {
        let index = 1;
        let deep = false;
        let target;
        if (typeof targetOrDeepIndicator === 'boolean') {
            // Handle a deep copy situation and skip deep indicator and target.
            deep = targetOrDeepIndicator;
            target = arguments[index];
            index = 2;
        } else target = targetOrDeepIndicator;
        const mergeValue = (key, value, targetValue) => {
            if (value === targetValue) return targetValue;
            // Recurse if we're merging plain objects or maps.
            if (deep && value && (Helper.isPlainObject(value) || value instanceof Map)) {
                let clone;
                if (value instanceof Map) clone = targetValue && targetValue instanceof Map ? targetValue : new Map();else clone = targetValue && Helper.isPlainObject(targetValue) ? targetValue : {};
                return Helper.extendObject(deep, clone, value);
            }
            return value;
        };
        while (index < arguments.length) {
            const source = arguments[index];
            let targetType = typeof target;
            let sourceType = typeof source;
            if (target instanceof Map) targetType += ' Map';
            if (source instanceof Map) sourceType += ' Map';
            if (targetType === sourceType && target !== source) {
                if (target instanceof Map && source instanceof Map) for (const [key, value] of source) target.set(key, mergeValue(key, value, target.get(key)));else if (Helper.isPlainObject(target) && Helper.isPlainObject(source)) {
                    for (const key in source) if (source.hasOwnProperty(key)) target[key] = mergeValue(key, source[key], target[key]);
                } else target = source;
            } else target = source;
            index += 1;
        }
        return target;
    }
    /**
     * Removes a proxies from given data structure recursivley.
     * @param object - Object to proxy.
     * @param seenObjects - Tracks all already processed obejcts to avoid
     * endless loops (usually only needed for internal prupose).
     * @returns Returns given object unwrapped from a dynamic proxy.
     */
    static unwrapProxy(object, seenObjects = []) {
        if (object !== null && typeof object === 'object') {
            while (object.__target__) object = object.__target__;
            const index = seenObjects.indexOf(object);
            if (index !== -1) return seenObjects[index];
            seenObjects.push(object);
            if (Array.isArray(object)) {
                let index = 0;
                for (const value of object) {
                    object[index] = Helper.unwrapProxy(value, seenObjects);
                    index += 1;
                }
            } else if (object instanceof Map) for (const [key, value] of object) object.set(key, Helper.unwrapProxy(value, seenObjects));else for (const key in object) if (object.hasOwnProperty(key)) object[key] = Helper.unwrapProxy(object[key], seenObjects);
        }
        return object;
    }
    /**
     * Adds dynamic getter and setter to any given data structure such as maps.
     * @param object - Object to proxy.
     * @param getterWrapper - Function to wrap each property get.
     * @param setterWrapper - Function to wrap each property set.
     * @param getterMethodName - Method name to get a stored value by key.
     * @param setterMethodName - Method name to set a stored value by key.
     * @param containesMethodName - Method name to indicate if a key is stored
     * in given data structure.
     * @param deep - Indicates to perform a deep wrapping of specified types.
     * performed via "value instanceof type".).
     * @param typesToExtend - Types which should be extended (Checks are
     * performed via "value instanceof type".).
     * @returns Returns given object wrapped with a dynamic getter proxy.
     */
    static addDynamicGetterAndSetter(object, getterWrapper = value => value, setterWrapper = (key, value) => value, getterMethodName = '[]', setterMethodName = '[]', containesMethodName = 'hasOwnProperty', deep = true, typesToExtend = [Object]) {
        if (deep) if (object instanceof Map) for (const [key, value] of object) object.set(key, Helper.addDynamicGetterAndSetter(value, getterWrapper, setterWrapper, getterMethodName, setterMethodName, containesMethodName, deep, typesToExtend));else if (typeof object === 'object' && object !== null) {
            for (const key in object) if (object.hasOwnProperty(key)) object[key] = Helper.addDynamicGetterAndSetter(object[key], getterWrapper, setterWrapper, getterMethodName, setterMethodName, containesMethodName, deep, typesToExtend);
        } else if (Array.isArray(object)) {
            let index = 0;
            for (const value of object) {
                object[index] = Helper.addDynamicGetterAndSetter(value, getterWrapper, setterWrapper, getterMethodName, setterMethodName, containesMethodName, deep, typesToExtend);
                index += 1;
            }
        }
        for (const type of typesToExtend) if (object instanceof type) {
            if (object.__target__) return object;
            const handler = {};
            if (containesMethodName) handler.has = (target, name) => {
                if (containesMethodName === '[]') return name in target;
                return target[containesMethodName](name);
            };
            if (containesMethodName && getterMethodName) handler.get = (target, name) => {
                if (name === '__target__') return target;
                if (typeof target[name] === 'function') return target[name].bind(target);
                if (target[containesMethodName](name)) {
                    if (getterMethodName === '[]') return getterWrapper(target[name]);
                    return getterWrapper(target[getterMethodName](name));
                }
                return target[name];
            };
            if (setterMethodName) handler.set = (target, name, value) => {
                if (setterMethodName === '[]') target[name] = setterWrapper(name, value);else target[setterMethodName](name, setterWrapper(name, value));
            };
            return new Proxy(object, handler);
        }
        return object;
    }
    /**
     * Searches for nested mappings with given indicator key and resolves
     * marked values. Additionally all objects are wrapped with a proxy to
     * dynamically resolve nested properties.
     * @param object - Given mapping to resolve.
     * @param configuration - Configuration context to resolve marked values.
     * @param deep - Indicates weather to perform a recursive resolving.
     * @param evaluationIndicatorKey - Indicator property name to mark a value
     * to evaluate.
     * @param executionIndicatorKey - Indicator property name to mark a value
     * to evaluate.
     * @param configurationKeyName - Name under the given configuration name
     * should be provided to evaluation or execution contexts.
     * @returns Evaluated given mapping.
     */
    static resolveDynamicDataStructure(object, configuration = null, deep = true, evaluationIndicatorKey = '__evaluate__', executionIndicatorKey = '__execute__', configurationKeyName = 'self') {
        if (object === null || typeof object !== 'object') return object;
        if (configuration === null) configuration = object;
        if (deep && configuration && !configuration.__target__) configuration = Helper.addDynamicGetterAndSetter(configuration, value => Helper.resolveDynamicDataStructure(value, configuration, false, evaluationIndicatorKey, executionIndicatorKey, configurationKeyName), (key, value) => value, '[]', '');
        if (Array.isArray(object) && deep) {
            let index = 0;
            for (const value of object) {
                object[index] = Helper.resolveDynamicDataStructure(value, configuration, deep, evaluationIndicatorKey, executionIndicatorKey, configurationKeyName);
                index += 1;
            }
        } else for (const key in object) if (object.hasOwnProperty(key)) if ([evaluationIndicatorKey, executionIndicatorKey].includes(key)) try {
            const evaluationFunction = new Function(configurationKeyName, 'webOptimizerPath', 'currentPath', 'path', 'helper', (key === evaluationIndicatorKey ? 'return ' : '') + object[key]);
            return Helper.resolveDynamicDataStructure(evaluationFunction(configuration, __dirname, process.cwd(), _path2.default, Helper), configuration, false, evaluationIndicatorKey, executionIndicatorKey, configurationKeyName);
        } catch (error) {
            throw Error('Error during ' + (key === evaluationIndicatorKey ? 'executing' : 'evaluating') + ` "${ object[key] }": ${ error }`);
        } else if (deep) object[key] = Helper.resolveDynamicDataStructure(object[key], configuration, deep, evaluationIndicatorKey, executionIndicatorKey, configurationKeyName);
        return object;
    }
    // endregion
    // region string handling
    /**
     * Translates given string into the regular expression validated
     * representation.
     * @param value - String to convert.
     * @param excludeSymbols - Symbols not to escape.
     * @returns Converted string.
     */
    static convertToValidRegularExpressionString(value, excludeSymbols = []) {
        // NOTE: This is only for performance improvements.
        if (value.length === 1 && !Helper.specialRegexSequences.includes(value)) return value;
        // The escape sequence must also be escaped; but at first.
        if (!excludeSymbols.includes('\\')) value.replace(/\\/g, '\\\\');
        for (const replace of Helper.specialRegexSequences) if (!excludeSymbols.includes(replace)) value = value.replace(new RegExp(`\\${ replace }`, 'g'), `\\${ replace }`);
        return value;
    }
    /**
     * Translates given name into a valid javaScript one.
     * @param name - Name to convert.
     * @param allowedSymbols - String of symbols which should be allowed within
     * a variable name (not the first character).
     * @returns Converted name is returned.
     */
    static convertToValidVariableName(name, allowedSymbols = '0-9a-zA-Z_$') {
        return name.toString().replace(/^[^a-zA-Z_$]+/, '').replace(new RegExp(`[^${ allowedSymbols }]+([a-zA-Z0-9])`, 'g'), (fullMatch, firstLetter) => firstLetter.toUpperCase());
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
    static getProcessCloseHandler(resolve, reject, reason = null, callback = () => {}) {
        let finished = false;
        return returnCode => {
            if (!finished) if (typeof returnCode !== 'number' || returnCode === 0) {
                callback();
                resolve(reason);
            } else {
                const error = new Error(`Task exited with error code ${ returnCode }`);
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
    static handleChildProcess(childProcess) {
        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
        childProcess.on('close', returnCode => {
            if (returnCode !== 0) console.error(`Task exited with error code ${ returnCode }`);
        });
        return childProcess;
    }
    // endregion
    // region file handler
    /**
     * Checks if given path points to a valid file.
     * @param filePath - Path to file.
     * @returns A boolean which indicates file existents.
     */
    static isFileSync(filePath) {
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
    static walkDirectoryRecursivelySync(directoryPath, callback = (_filePath, _stat) => true) {
        fileSystem.readdirSync(directoryPath).forEach(fileName => {
            const filePath = _path2.default.resolve(directoryPath, fileName);
            const stat = fileSystem.statSync(filePath);
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
    static copyFileSync(sourcePath, targetPath) {
        /*
            NOTE: If target path references a directory a new file with the
            same name will be created.
        */
        try {
            if (fileSystem.lstatSync(targetPath).isDirectory()) targetPath = _path2.default.join(targetPath, _path2.default.basename(sourcePath));
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
    static copyDirectoryRecursiveSync(sourcePath, targetPath) {
        try {
            // Check if folder needs to be created or integrated.
            if (fileSystem.lstatSync(targetPath).isDirectory()) targetPath = _path2.default.join(targetPath, _path2.default.basename(sourcePath));
        } catch (error) {}
        fileSystem.mkdirSync(targetPath);
        Helper.walkDirectoryRecursivelySync(sourcePath, (currentSourcePath, stat) => {
            const currentTargetPath = _path2.default.join(targetPath, currentSourcePath.substring(sourcePath.length));
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
    static determineAssetType(filePath, buildConfiguration, paths) {
        let result = null;
        for (const type in buildConfiguration) if (_path2.default.extname(filePath) === `.${ buildConfiguration[type].extension }`) {
            result = type;
            break;
        }
        if (!result) for (const type of ['source', 'target']) for (const assetType in paths.asset) if (paths.asset[assetType].startsWith(_path2.default.join(paths[type], paths.asset[assetType]))) return assetType;
        return result;
    }
    /**
     * Adds a property with a stored array of all matching file paths, which
     * matches each build configuration in given entry path and converts given
     * build configuration into a sorted array were javaScript files takes
     * precedence.
     * @param configuration - Given build configurations.
     * @param entryPath - Path to analyse nested structure.
     * @param context - Path to set paths relative to and determine relative
     * ignored paths to.
     * @param pathsToIgnore - Paths which marks location to ignore (Relative
     * paths are resolved relatively to given context.).
     * @returns Converted build configuration.
     */
    static resolveBuildConfigurationFilePaths(configuration, entryPath = './', context = './', pathsToIgnore = ['.git']) {
        const buildConfiguration = [];
        let index = 0;
        for (const type in configuration) if (configuration.hasOwnProperty(type)) {
            const newItem = Helper.extendObject(true, { filePaths: [] }, configuration[type]);
            Helper.walkDirectoryRecursivelySync(entryPath, ((index, buildConfigurationItem) => (filePath, stat) => {
                if (Helper.isFilePathInLocation(filePath, pathsToIgnore)) return false;
                if (stat.isFile() && _path2.default.extname(filePath).substring(1) === buildConfigurationItem.extension && !new RegExp(buildConfigurationItem.fileNamePattern).test(filePath)) buildConfigurationItem.filePaths.push(filePath);
            })(index, newItem));
            buildConfiguration.push(newItem);
            index += 1;
        }
        return buildConfiguration.sort((first, second) => {
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
     * @param internalInjection - List of moduleIDs or module file paths.
     * @param moduleAliases - Mapping of aliases to take into account.
     * @param knownExtensions - List of file extensions to take into account.
     * @param context - File path to resolve relative to.
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */
    static determineModuleLocations(internalInjection, moduleAliases = {}, knownExtensions = ['.js'], context = './') {
        const filePaths = [];
        const directoryPaths = [];
        const normalizedInternalInjection = Helper.normalizeInternalInjection(internalInjection);
        for (const chunkName in normalizedInternalInjection) if (normalizedInternalInjection.hasOwnProperty(chunkName)) for (const moduleID of normalizedInternalInjection[chunkName]) {
            const filePath = Helper.determineModuleFilePath(moduleID, moduleAliases, knownExtensions, context);
            filePaths.push(filePath);
            const directoryPath = _path2.default.dirname(filePath);
            if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
        }
        return { filePaths, directoryPaths };
    }
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param internalInjection - Given internal injection to normalize.
     * @returns Normalized representation of given internal injection.
     */
    static normalizeInternalInjection(internalInjection) {
        let result = {};
        if (internalInjection instanceof Object && Helper.isPlainObject(internalInjection)) {
            let hasContent = false;
            const chunkNamesToDelete = [];
            for (const chunkName in internalInjection) if (internalInjection.hasOwnProperty(chunkName)) if (Array.isArray(internalInjection[chunkName])) {
                if (internalInjection[chunkName].length > 0) {
                    hasContent = true;
                    result[chunkName] = internalInjection[chunkName];
                } else chunkNamesToDelete.push(chunkName);
            } else {
                hasContent = true;
                result[chunkName] = [internalInjection[chunkName]];
            }
            if (hasContent) for (const chunkName of chunkNamesToDelete) delete result[chunkName];else result = { index: [] };
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
     * @param pathsToIgnore - Paths which marks location to ignore (Relative
     * paths are resolved relatively to given context.).
     * @returns Given injection with resolved marked indicators.
     */
    static resolveInjection(givenInjection, buildConfigurations, modulesToExclude, moduleAliases = {}, knownExtensions = ['.js', '.css', '.svg', '.html'], context = './', pathsToIgnore = ['.git']) {
        const injection = Helper.extendObject(true, {}, givenInjection);
        const moduleFilePathsToExclude = Helper.determineModuleLocations(modulesToExclude, moduleAliases, knownExtensions, context, pathsToIgnore).filePaths;
        for (const type of ['internal', 'external'])
        /* eslint-disable curly */
        if (typeof injection[type] === 'object') {
            for (const chunkName in injection[type]) if (injection[type][chunkName] === '__auto__') {
                injection[type][chunkName] = [];
                const modules = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
                for (const subChunkName in modules) if (modules.hasOwnProperty(subChunkName)) injection[type][chunkName].push(modules[subChunkName]);
            }
        } else if (injection[type] === '__auto__')
            /* eslint-enable curly */
            injection[type] = Helper.getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context);
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
    static getAutoChunk(buildConfigurations, moduleFilePathsToExclude, context) {
        const result = {};
        const injectedBaseNames = {};
        for (const buildConfiguration of buildConfigurations) {
            if (!injectedBaseNames[buildConfiguration.outputExtension]) injectedBaseNames[buildConfiguration.outputExtension] = [];
            for (const moduleFilePath of buildConfiguration.filePaths) if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                const baseName = _path2.default.basename(moduleFilePath, `.${ buildConfiguration.extension }`);
                /*
                    Ensure that each output type has only one source
                    representation.
                */
                if (!injectedBaseNames[buildConfiguration.outputExtension].includes(baseName)) {
                    /*
                        Ensure that if same basenames and different output
                        types can be distinguished by their extension
                        (JavaScript-Modules remains without extension since
                        they will be handled first because the build
                        configurations are expected to be sorted in this
                        context).
                    */
                    if (result[baseName]) result[_path2.default.relative(context, moduleFilePath)] = moduleFilePath;else result[baseName] = moduleFilePath;
                    injectedBaseNames[buildConfiguration.outputExtension].push(baseName);
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
     * @param relativeModuleFilePaths - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @returns File path or given module id if determinations has failed or
     * wasn't necessary.
     */
    static determineModuleFilePath(moduleID, moduleAliases = {}, knownExtensions = ['.js'], context = './', relativeModuleFilePaths = ['', 'node_modules', '../'], packageEntryFileNames = ['__package__', '', 'index', 'main']) {
        moduleID = Helper.applyAliases(moduleID, moduleAliases);
        for (const moduleLocation of relativeModuleFilePaths) for (let fileName of packageEntryFileNames) for (const extension of knownExtensions) {
            let moduleFilePath = moduleID;
            if (!moduleFilePath.startsWith('/')) moduleFilePath = _path2.default.join(context, moduleLocation, moduleFilePath);
            if (fileName === '__package__') {
                try {
                    if (fileSystem.statSync(moduleFilePath).isDirectory()) {
                        const pathToPackageJSON = _path2.default.join(moduleFilePath, 'package.json');
                        if (fileSystem.statSync(pathToPackageJSON).isFile()) {
                            const localConfiguration = JSON.parse(fileSystem.readFileSync(pathToPackageJSON, {
                                encoding: 'utf-8' }));
                            if (localConfiguration.main) fileName = localConfiguration.main;
                        }
                    }
                } catch (error) {}
                if (fileName === '__package__') continue;
            }
            moduleFilePath = _path2.default.join(moduleFilePath, fileName);
            moduleFilePath += extension;
            try {
                if (fileSystem.statSync(moduleFilePath).isFile()) return moduleFilePath;
            } catch (error) {}
        }
        return moduleID;
    }
    // endregion
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @returns The alias applied given module id.
     */
    static applyAliases(moduleID, aliases) {
        for (const alias in aliases) if (alias.endsWith('$')) {
            if (moduleID === alias.substring(0, alias.length - 1)) moduleID = aliases[alias];
        } else moduleID = moduleID.replace(alias, aliases[alias]);
        return moduleID;
    }
}
exports.default = Helper; // endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

Helper.specialRegexSequences = ['-', '[', ']', '(', ')', '^', '$', '*', '+', '.', '{', '}'];

//# sourceMappingURL=data:application/json;base64,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QWpCRCxDQWlCRSxPQUFPLEtBQVAsRUFBYyxDQUFFO0FBQ2xCLG9CQUFJLGFBQWEsYUFBakIsRUFDSTtBQUNQO0FBQ0QsNkJBQWlCLGVBQUssSUFBTCxDQUFVLGNBQVYsRUFBMEIsUUFBMUIsQ0FBakI7QUFDQSw4QkFBa0IsU0FBbEI7QUFDQSxnQkFBSTtBQUNBLG9CQUFJLFdBQVcsUUFBWCxDQUFvQixjQUFwQixFQUFvQyxNQUFwQyxFQUFKLEVBQ0ksT0FBTyxjQUFQO0FBQ1AsYUFIRCxDQUdFLE9BQU8sS0FBUCxFQUFjLENBQUU7QUFDckI7QUFDVCxlQUFPLFFBQVA7QUFDSDtBQUNEO0FBQ0E7Ozs7OztBQU1BLFdBQU8sWUFBUCxDQUFvQixRQUFwQixFQUFxQyxPQUFyQyxFQUFpRTtBQUM3RCxhQUFLLE1BQU0sS0FBWCxJQUEyQixPQUEzQixFQUNJLElBQUksTUFBTSxRQUFOLENBQWUsR0FBZixDQUFKLEVBQXlCO0FBQ3JCLGdCQUFJLGFBQWEsTUFBTSxTQUFOLENBQWdCLENBQWhCLEVBQW1CLE1BQU0sTUFBTixHQUFlLENBQWxDLENBQWpCLEVBQ0ksV0FBVyxRQUFRLEtBQVIsQ0FBWDtBQUNQLFNBSEQsTUFJSSxXQUFXLFNBQVMsT0FBVCxDQUFpQixLQUFqQixFQUF3QixRQUFRLEtBQVIsQ0FBeEIsQ0FBWDtBQUNSLGVBQU8sUUFBUDtBQUNIO0FBcDVCdUI7a0JBQVAsTSxFQXM1QnJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBMTVCcUIsTSxDQUNWLHFCLEdBQXNDLENBQ3pDLEdBRHlDLEVBQ3BDLEdBRG9DLEVBQy9CLEdBRCtCLEVBQzFCLEdBRDBCLEVBQ3JCLEdBRHFCLEVBQ2hCLEdBRGdCLEVBQ1gsR0FEVyxFQUNOLEdBRE0sRUFDRCxHQURDLEVBQ0ksR0FESixFQUNTLEdBRFQsRUFDYyxHQURkLEMiLCJmaWxlIjoiaGVscGVyLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB7Q2hpbGRQcm9jZXNzfSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuXG5pbXBvcnQgdHlwZSB7XG4gICAgQnVpbGRDb25maWd1cmF0aW9uLCBFdmFsdWF0aW9uRnVuY3Rpb24sIEdldHRlckZ1bmN0aW9uLCBJbmplY3Rpb24sXG4gICAgSW50ZXJuYWxJbmplY3Rpb24sIE5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiwgUGF0aHMsIFBsYWluT2JqZWN0LFxuICAgIFJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uLCBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0sIFNldHRlckZ1bmN0aW9uLFxuICAgIFRyYXZlcnNlRmlsZXNDYWxsYmFja0Z1bmN0aW9uXG59IGZyb20gJy4vdHlwZSdcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGRlY2xhcmF0aW9uc1xuLy8gTk9URTogVGhpcyBkZWNsYXJhdGlvbiBpc24ndCBuZWVkZWQgaWYgZmxvdyBrbm93cyBqYXZhU2NyaXB0J3MgbmF0aXZlXG4vLyBcIlByb3h5XCIgaW4gZnV0dXJlLlxuZGVjbGFyZSBjbGFzcyBQcm94eSB7XG4gICAgY29uc3RydWN0b3Iob2JqZWN0OmFueSwgaGFuZGxlcjpPYmplY3QpOmFueVxufVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gbWV0aG9kc1xuLyoqXG4gKiBQcm92aWRlcyBhIGNsYXNzIG9mIHN0YXRpYyBtZXRob2RzIHdpdGggZ2VuZXJpYyB1c2UgY2FzZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlbHBlciB7XG4gICAgc3RhdGljIHNwZWNpYWxSZWdleFNlcXVlbmNlczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAnLScsICdbJywgJ10nLCAnKCcsICcpJywgJ14nLCAnJCcsICcqJywgJysnLCAnLicsICd7JywgJ30nXTtcbiAgICAvLyByZWdpb24gYm9vbGVhblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3ZWF0aGVyIG9uZSBvZiB0aGUgZ2l2ZW4gcGF0dGVybiBtYXRjaGVzIGdpdmVuIHN0cmluZy5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0IC0gVGFyZ2V0IHRvIGNoZWNrIGluIHBhdHRlcm4gZm9yLlxuICAgICAqIEBwYXJhbSBwYXR0ZXJuIC0gTGlzdCBvZiBwYXR0ZXJuIHRvIGNoZWNrIGZvci5cbiAgICAgKiBAcmV0dXJucyBWYWx1ZSBcInRydWVcIiBpZiBnaXZlbiBvYmplY3QgaXMgbWF0Y2hlcyBieSBhdCBsZWFzIG9uZSBvZiB0aGVcbiAgICAgKiBnaXZlbiBwYXR0ZXJuIGFuZCBcImZhbHNlXCIgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBpc0FueU1hdGNoaW5nKHRhcmdldDpzdHJpbmcsIHBhdHRlcm46QXJyYXk8c3RyaW5nfFJlZ0V4cD4pOmJvb2xlYW4ge1xuICAgICAgICBmb3IgKGNvbnN0IGN1cnJlbnRQYXR0ZXJuOlJlZ0V4cHxzdHJpbmcgb2YgcGF0dGVybilcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudFBhdHRlcm4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRQYXR0ZXJuID09PSB0YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRQYXR0ZXJuLnRlc3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdlYXRoZXIgZ2l2ZW4gb2JqZWN0IGlzIGEgcGxhaW4gbmF0aXZlIG9iamVjdC5cbiAgICAgKiBAcGFyYW0gb2JqZWN0IC0gT2JqZWN0IHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIFZhbHVlIFwidHJ1ZVwiIGlmIGdpdmVuIG9iamVjdCBpcyBhIHBsYWluIGphdmFTY3JpcHQgb2JqZWN0IGFuZFxuICAgICAqIFwiZmFsc2VcIiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgc3RhdGljIGlzUGxhaW5PYmplY3Qob2JqZWN0Om1peGVkKTpib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdCAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCkgPT09IE9iamVjdC5wcm90b3R5cGUpXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3ZWF0aGVyIGdpdmVuIG9iamVjdCBpcyBhIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSBvYmplY3QgLSBPYmplY3QgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMgVmFsdWUgXCJ0cnVlXCIgaWYgZ2l2ZW4gb2JqZWN0IGlzIGEgZnVuY3Rpb24gYW5kIFwiZmFsc2VcIlxuICAgICAqIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNGdW5jdGlvbihvYmplY3Q6bWl4ZWQpOmJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gQm9vbGVhbihvYmplY3QpICYmIHt9LnRvU3RyaW5nLmNhbGwoXG4gICAgICAgICAgICBvYmplY3RcbiAgICAgICAgKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJ1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgZ2l2ZW4gZmlsZSBwYXRoIGlzIHdpdGhpbiBnaXZlbiBsaXN0IG9mIGZpbGVcbiAgICAgKiBsb2NhdGlvbnMuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIC0gUGF0aCB0byBmaWxlIHRvIGNoZWNrLlxuICAgICAqIEBwYXJhbSBsb2NhdGlvbnNUb0NoZWNrIC0gTG9jYXRpb25zIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEByZXR1cm5zIFZhbHVlIFwidHJ1ZVwiIGlmIGdpdmVuIGZpbGUgcGF0aCBpcyB3aXRoaW4gb25lIG9mIGdpdmVuXG4gICAgICogbG9jYXRpb25zIG9yIFwiZmFsc2VcIiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgc3RhdGljIGlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIGxvY2F0aW9uc1RvQ2hlY2s6QXJyYXk8c3RyaW5nPlxuICAgICk6Ym9vbGVhbiB7XG4gICAgICAgIGZvciAoY29uc3QgcGF0aFRvQ2hlY2s6c3RyaW5nIG9mIGxvY2F0aW9uc1RvQ2hlY2spXG4gICAgICAgICAgICBpZiAocGF0aC5yZXNvbHZlKGZpbGVQYXRoKS5zdGFydHNXaXRoKHBhdGgucmVzb2x2ZShwYXRoVG9DaGVjaykpKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZGF0YSBoYW5kbGluZ1xuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGdpdmVuIG9iamVjdCBpbnRvIGl0cyBzZXJpYWxpemVkIGpzb24gcmVwcmVzZW50YXRpb24gYnlcbiAgICAgKiByZXBsYWNpbmcgY2lyY3VsYXIgcmVmZXJlbmNlcyB3aXRoIGEgZ2l2ZW4gcHJvdmlkZWQgdmFsdWUuXG4gICAgICogQHBhcmFtIG9iamVjdCAtIE9iamVjdCB0byBzZXJpYWxpemUuXG4gICAgICogQHBhcmFtIGRldGVybWluZUNpY3VsYXJSZWZlcmVuY2VWYWx1ZSAtIENhbGxiYWNrIHRvIGNyZWF0ZSBhIGZhbGxiYWNrXG4gICAgICogdmFsdWUgZGVwZW5kaW5nIG9uIGdpdmVuIHJlZHVuZGFudCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0gbnVtYmVyT2ZTcGFjZXMgLSBOdW1iZXIgb2Ygc3BhY2VzIHRvIHVzZSBmb3Igc3RyaW5nIGZvcm1hdHRpbmcuXG4gICAgICovXG4gICAgc3RhdGljIGNvbnZlcnRDaXJjdWxhck9iamVjdFRvSlNPTihcbiAgICAgICAgb2JqZWN0Ok9iamVjdCwgZGV0ZXJtaW5lQ2ljdWxhclJlZmVyZW5jZVZhbHVlOigoXG4gICAgICAgICAgICBrZXk6c3RyaW5nLCB2YWx1ZTphbnksIHNlZW5kT2JqZWN0czpBcnJheTxhbnk+XG4gICAgICAgICkgPT4gYW55KSA9ICgpOnN0cmluZyA9PiAnX19jaXJjdWxhclJlZmVyZW5jZV9fJyxcbiAgICAgICAgbnVtYmVyT2ZTcGFjZXM6bnVtYmVyID0gMFxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgY29uc3Qgc2Vlbk9iamVjdHM6QXJyYXk8YW55PiA9IFtdXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmplY3QsIChrZXk6c3RyaW5nLCB2YWx1ZTphbnkpOmFueSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWVuT2JqZWN0cy5pbmNsdWRlcyh2YWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZXRlcm1pbmVDaWN1bGFyUmVmZXJlbmNlVmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXksIHZhbHVlLCBzZWVuT2JqZWN0cylcbiAgICAgICAgICAgICAgICBzZWVuT2JqZWN0cy5wdXNoKHZhbHVlKVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIH0sIG51bWJlck9mU3BhY2VzKVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBnaXZlbiBzZXJpYWxpemVkIG9yIGJhc2U2NCBlbmNvZGVkIHN0cmluZyBpbnRvIGEgamF2YVNjcmlwdFxuICAgICAqIG9uZSBpZiBwb3NzaWJsZS5cbiAgICAgKiBAcGFyYW0gc2VyaWFsaXplZE9iamVjdCAtIE9iamVjdCBhcyBzdHJpbmcuXG4gICAgICogQHBhcmFtIHNjb3BlIC0gQW4gb3B0aW9uYWwgc2NvcGUgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGV2YWx1YXRlIGdpdmVuXG4gICAgICogb2JqZWN0IGluLlxuICAgICAqIEBwYXJhbSBuYW1lIC0gVGhlIG5hbWUgdW5kZXIgZ2l2ZW4gc2NvcGUgd2lsbCBiZSBhdmFpbGFibGUuXG4gICAgICogQHJldHVybnMgVGhlIHBhcnNlZCBvYmplY3QgaWYgcG9zc2libGUgYW5kIG51bGwgb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBwYXJzZUVuY29kZWRPYmplY3QoXG4gICAgICAgIHNlcmlhbGl6ZWRPYmplY3Q6c3RyaW5nLCBzY29wZTpPYmplY3QgPSB7fSwgbmFtZTpzdHJpbmcgPSAnc2NvcGUnXG4gICAgKTo/UGxhaW5PYmplY3Qge1xuICAgICAgICBpZiAoIXNlcmlhbGl6ZWRPYmplY3Quc3RhcnRzV2l0aCgneycpKVxuICAgICAgICAgICAgc2VyaWFsaXplZE9iamVjdCA9IEJ1ZmZlci5mcm9tKFxuICAgICAgICAgICAgICAgIHNlcmlhbGl6ZWRPYmplY3QsICdiYXNlNjQnXG4gICAgICAgICAgICApLnRvU3RyaW5nKCd1dGY4JylcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBGdW5jdGlvbihuYW1lLCBgcmV0dXJuICR7c2VyaWFsaXplZE9iamVjdH1gKShzY29wZSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlcGxhY2VzIGdpdmVuIHBhdHRlcm4gaW4gZWFjaCB2YWx1ZSBpbiBnaXZlbiBvYmplY3QgcmVjdXJzaXZlbHkgd2l0aFxuICAgICAqIGdpdmVuIHN0cmluZyByZXBsYWNlbWVudC5cbiAgICAgKiBAcGFyYW0gb2JqZWN0IC0gT2JqZWN0IHRvIGNvbnZlcnQgc3Vic3RyaW5ncyBpbi5cbiAgICAgKiBAcGFyYW0gcGF0dGVybiAtIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byByZXBsYWNlLlxuICAgICAqIEBwYXJhbSByZXBsYWNlbWVudCAtIFN0cmluZyB0byB1c2UgYXMgcmVwbGFjZW1lbnQgZm9yIGZvdW5kIHBhdHRlcm5zLlxuICAgICAqIEByZXR1cm5zIENvbnZlcnRlZCBvYmplY3Qgd2l0aCByZXBsYWNlZCBwYXR0ZXJucy5cbiAgICAgKi9cbiAgICBzdGF0aWMgY29udmVydFN1YnN0cmluZ0luUGxhaW5PYmplY3QoXG4gICAgICAgIG9iamVjdDpQbGFpbk9iamVjdCwgcGF0dGVybjpSZWdFeHAsIHJlcGxhY2VtZW50OnN0cmluZ1xuICAgICk6UGxhaW5PYmplY3Qge1xuICAgICAgICBmb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gb2JqZWN0KVxuICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKVxuICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNQbGFpbk9iamVjdChvYmplY3Rba2V5XSkpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFtrZXldID0gSGVscGVyLmNvbnZlcnRTdWJzdHJpbmdJblBsYWluT2JqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0sIHBhdHRlcm4sIHJlcGxhY2VtZW50KVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBvYmplY3Rba2V5XSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFtrZXldID0gb2JqZWN0W2tleV0ucmVwbGFjZShwYXR0ZXJuLCByZXBsYWNlbWVudClcbiAgICAgICAgcmV0dXJuIG9iamVjdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHRlbmRzIGdpdmVuIHRhcmdldCBvYmplY3Qgd2l0aCBnaXZlbiBzb3VyY2VzIG9iamVjdC4gQXMgdGFyZ2V0IGFuZFxuICAgICAqIHNvdXJjZXMgbWFueSBleHBhbmRhYmxlIHR5cGVzIGFyZSBhbGxvd2VkIGJ1dCB0YXJnZXQgYW5kIHNvdXJjZXMgaGF2ZSB0b1xuICAgICAqIHRvIGNvbWUgZnJvbSB0aGUgc2FtZSB0eXBlLlxuICAgICAqIEBwYXJhbSB0YXJnZXRPckRlZXBJbmRpY2F0b3IgLSBNYXliZSB0aGUgdGFyZ2V0IG9yIGRlZXAgaW5kaWNhdG9yLlxuICAgICAqIEBwYXJhbSBfdGFyZ2V0QW5kT3JTb3VyY2VzIC0gVGFyZ2V0IGFuZCBhdCBsZWFzdCBvbmUgc291cmNlIG9iamVjdC5cbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIGdpdmVuIHRhcmdldCBleHRlbmRlZCB3aXRoIGFsbCBnaXZlbiBzb3VyY2VzLlxuICAgICAqL1xuICAgIHN0YXRpYyBleHRlbmRPYmplY3QoXG4gICAgICAgIHRhcmdldE9yRGVlcEluZGljYXRvcjpib29sZWFufGFueSwgLi4uX3RhcmdldEFuZE9yU291cmNlczpBcnJheTxhbnk+XG4gICAgKTphbnkge1xuICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMVxuICAgICAgICBsZXQgZGVlcDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgbGV0IHRhcmdldDptaXhlZFxuICAgICAgICBpZiAodHlwZW9mIHRhcmdldE9yRGVlcEluZGljYXRvciA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uIGFuZCBza2lwIGRlZXAgaW5kaWNhdG9yIGFuZCB0YXJnZXQuXG4gICAgICAgICAgICBkZWVwID0gdGFyZ2V0T3JEZWVwSW5kaWNhdG9yXG4gICAgICAgICAgICB0YXJnZXQgPSBhcmd1bWVudHNbaW5kZXhdXG4gICAgICAgICAgICBpbmRleCA9IDJcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXRPckRlZXBJbmRpY2F0b3JcbiAgICAgICAgY29uc3QgbWVyZ2VWYWx1ZSA9IChrZXk6c3RyaW5nLCB2YWx1ZTphbnksIHRhcmdldFZhbHVlOmFueSk6YW55ID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdGFyZ2V0VmFsdWUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFZhbHVlXG4gICAgICAgICAgICAvLyBSZWN1cnNlIGlmIHdlJ3JlIG1lcmdpbmcgcGxhaW4gb2JqZWN0cyBvciBtYXBzLlxuICAgICAgICAgICAgaWYgKGRlZXAgJiYgdmFsdWUgJiYgKFxuICAgICAgICAgICAgICAgIEhlbHBlci5pc1BsYWluT2JqZWN0KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIE1hcFxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIGxldCBjbG9uZTphbnlcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBNYXApXG4gICAgICAgICAgICAgICAgICAgIGNsb25lID0gdGFyZ2V0VmFsdWUgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFsdWUgaW5zdGFuY2VvZiBNYXBcbiAgICAgICAgICAgICAgICAgICAgKSA/IHRhcmdldFZhbHVlIDogbmV3IE1hcCgpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHRhcmdldFZhbHVlICYmIEhlbHBlci5pc1BsYWluT2JqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFsdWVcbiAgICAgICAgICAgICAgICAgICAgKSA/IHRhcmdldFZhbHVlIDoge31cbiAgICAgICAgICAgICAgICByZXR1cm4gSGVscGVyLmV4dGVuZE9iamVjdChkZWVwLCBjbG9uZSwgdmFsdWUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2U6YW55ID0gYXJndW1lbnRzW2luZGV4XVxuICAgICAgICAgICAgbGV0IHRhcmdldFR5cGU6c3RyaW5nID0gdHlwZW9mIHRhcmdldFxuICAgICAgICAgICAgbGV0IHNvdXJjZVR5cGU6c3RyaW5nID0gdHlwZW9mIHNvdXJjZVxuICAgICAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIE1hcClcbiAgICAgICAgICAgICAgICB0YXJnZXRUeXBlICs9ICcgTWFwJ1xuICAgICAgICAgICAgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIE1hcClcbiAgICAgICAgICAgICAgICBzb3VyY2VUeXBlICs9ICcgTWFwJ1xuICAgICAgICAgICAgaWYgKHRhcmdldFR5cGUgPT09IHNvdXJjZVR5cGUgJiYgdGFyZ2V0ICE9PSBzb3VyY2UpXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIE1hcCAmJiBzb3VyY2UgaW5zdGFuY2VvZiBNYXApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgW2tleTpzdHJpbmcsIHZhbHVlOmFueV0gb2Ygc291cmNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnNldChrZXksIG1lcmdlVmFsdWUoa2V5LCB2YWx1ZSwgdGFyZ2V0LmdldChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkpKSlcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChIZWxwZXIuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIEhlbHBlci5pc1BsYWluT2JqZWN0KFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VcbiAgICAgICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5OnN0cmluZyBpbiBzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGtleSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBtZXJnZVZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXksIHNvdXJjZVtrZXldLCB0YXJnZXRba2V5XSlcbiAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gc291cmNlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gc291cmNlXG4gICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgcHJveGllcyBmcm9tIGdpdmVuIGRhdGEgc3RydWN0dXJlIHJlY3Vyc2l2bGV5LlxuICAgICAqIEBwYXJhbSBvYmplY3QgLSBPYmplY3QgdG8gcHJveHkuXG4gICAgICogQHBhcmFtIHNlZW5PYmplY3RzIC0gVHJhY2tzIGFsbCBhbHJlYWR5IHByb2Nlc3NlZCBvYmVqY3RzIHRvIGF2b2lkXG4gICAgICogZW5kbGVzcyBsb29wcyAodXN1YWxseSBvbmx5IG5lZWRlZCBmb3IgaW50ZXJuYWwgcHJ1cG9zZSkuXG4gICAgICogQHJldHVybnMgUmV0dXJucyBnaXZlbiBvYmplY3QgdW53cmFwcGVkIGZyb20gYSBkeW5hbWljIHByb3h5LlxuICAgICAqL1xuICAgIHN0YXRpYyB1bndyYXBQcm94eShvYmplY3Q6YW55LCBzZWVuT2JqZWN0czpBcnJheTxhbnk+ID0gW10pOmFueSB7XG4gICAgICAgIGlmIChvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHdoaWxlIChvYmplY3QuX190YXJnZXRfXylcbiAgICAgICAgICAgICAgICBvYmplY3QgPSBvYmplY3QuX190YXJnZXRfX1xuICAgICAgICAgICAgY29uc3QgaW5kZXg6bnVtYmVyID0gc2Vlbk9iamVjdHMuaW5kZXhPZihvYmplY3QpXG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxuICAgICAgICAgICAgICAgIHJldHVybiBzZWVuT2JqZWN0c1tpbmRleF1cbiAgICAgICAgICAgIHNlZW5PYmplY3RzLnB1c2gob2JqZWN0KVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZTptaXhlZCBvZiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2luZGV4XSA9IEhlbHBlci51bndyYXBQcm94eSh2YWx1ZSwgc2Vlbk9iamVjdHMpXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9iamVjdCBpbnN0YW5jZW9mIE1hcClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXk6bWl4ZWQsIHZhbHVlOm1peGVkXSBvZiBvYmplY3QpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5zZXQoa2V5LCBIZWxwZXIudW53cmFwUHJveHkodmFsdWUsIHNlZW5PYmplY3RzKSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gb2JqZWN0KVxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IEhlbHBlci51bndyYXBQcm94eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSwgc2Vlbk9iamVjdHMpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iamVjdFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGRzIGR5bmFtaWMgZ2V0dGVyIGFuZCBzZXR0ZXIgdG8gYW55IGdpdmVuIGRhdGEgc3RydWN0dXJlIHN1Y2ggYXMgbWFwcy5cbiAgICAgKiBAcGFyYW0gb2JqZWN0IC0gT2JqZWN0IHRvIHByb3h5LlxuICAgICAqIEBwYXJhbSBnZXR0ZXJXcmFwcGVyIC0gRnVuY3Rpb24gdG8gd3JhcCBlYWNoIHByb3BlcnR5IGdldC5cbiAgICAgKiBAcGFyYW0gc2V0dGVyV3JhcHBlciAtIEZ1bmN0aW9uIHRvIHdyYXAgZWFjaCBwcm9wZXJ0eSBzZXQuXG4gICAgICogQHBhcmFtIGdldHRlck1ldGhvZE5hbWUgLSBNZXRob2QgbmFtZSB0byBnZXQgYSBzdG9yZWQgdmFsdWUgYnkga2V5LlxuICAgICAqIEBwYXJhbSBzZXR0ZXJNZXRob2ROYW1lIC0gTWV0aG9kIG5hbWUgdG8gc2V0IGEgc3RvcmVkIHZhbHVlIGJ5IGtleS5cbiAgICAgKiBAcGFyYW0gY29udGFpbmVzTWV0aG9kTmFtZSAtIE1ldGhvZCBuYW1lIHRvIGluZGljYXRlIGlmIGEga2V5IGlzIHN0b3JlZFxuICAgICAqIGluIGdpdmVuIGRhdGEgc3RydWN0dXJlLlxuICAgICAqIEBwYXJhbSBkZWVwIC0gSW5kaWNhdGVzIHRvIHBlcmZvcm0gYSBkZWVwIHdyYXBwaW5nIG9mIHNwZWNpZmllZCB0eXBlcy5cbiAgICAgKiBwZXJmb3JtZWQgdmlhIFwidmFsdWUgaW5zdGFuY2VvZiB0eXBlXCIuKS5cbiAgICAgKiBAcGFyYW0gdHlwZXNUb0V4dGVuZCAtIFR5cGVzIHdoaWNoIHNob3VsZCBiZSBleHRlbmRlZCAoQ2hlY2tzIGFyZVxuICAgICAqIHBlcmZvcm1lZCB2aWEgXCJ2YWx1ZSBpbnN0YW5jZW9mIHR5cGVcIi4pLlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgZ2l2ZW4gb2JqZWN0IHdyYXBwZWQgd2l0aCBhIGR5bmFtaWMgZ2V0dGVyIHByb3h5LlxuICAgICAqL1xuICAgIHN0YXRpYyBhZGREeW5hbWljR2V0dGVyQW5kU2V0dGVyPFZhbHVlPihcbiAgICAgICAgb2JqZWN0OlZhbHVlLCBnZXR0ZXJXcmFwcGVyOkdldHRlckZ1bmN0aW9uID0gKHZhbHVlOmFueSk6YW55ID0+IHZhbHVlLFxuICAgICAgICBzZXR0ZXJXcmFwcGVyOlNldHRlckZ1bmN0aW9uID0gKGtleTphbnksIHZhbHVlOmFueSk6YW55ID0+IHZhbHVlLFxuICAgICAgICBnZXR0ZXJNZXRob2ROYW1lOnN0cmluZyA9ICdbXScsIHNldHRlck1ldGhvZE5hbWU6c3RyaW5nID0gJ1tdJyxcbiAgICAgICAgY29udGFpbmVzTWV0aG9kTmFtZTpzdHJpbmcgPSAnaGFzT3duUHJvcGVydHknLCBkZWVwOmJvb2xlYW4gPSB0cnVlLFxuICAgICAgICB0eXBlc1RvRXh0ZW5kOkFycmF5PG1peGVkPiA9IFtPYmplY3RdXG4gICAgKTpWYWx1ZSB7XG4gICAgICAgIGlmIChkZWVwKVxuICAgICAgICAgICAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIE1hcClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXk6bWl4ZWQsIHZhbHVlOm1peGVkXSBvZiBvYmplY3QpXG4gICAgICAgICAgICAgICAgICAgIG9iamVjdC5zZXQoa2V5LCBIZWxwZXIuYWRkRHluYW1pY0dldHRlckFuZFNldHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLCBnZXR0ZXJXcmFwcGVyLCBzZXR0ZXJXcmFwcGVyLCBnZXR0ZXJNZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGVyTWV0aG9kTmFtZSwgY29udGFpbmVzTWV0aG9kTmFtZSwgZGVlcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVzVG9FeHRlbmQpKVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXk6c3RyaW5nIGluIG9iamVjdClcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0gPSBIZWxwZXIuYWRkRHluYW1pY0dldHRlckFuZFNldHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSwgZ2V0dGVyV3JhcHBlciwgc2V0dGVyV3JhcHBlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZXR0ZXJNZXRob2ROYW1lLCBzZXR0ZXJNZXRob2ROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lc01ldGhvZE5hbWUsIGRlZXAsIHR5cGVzVG9FeHRlbmQpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB2YWx1ZTptaXhlZCBvZiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2luZGV4XSA9IEhlbHBlci5hZGREeW5hbWljR2V0dGVyQW5kU2V0dGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsIGdldHRlcldyYXBwZXIsIHNldHRlcldyYXBwZXIsIGdldHRlck1ldGhvZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0ZXJNZXRob2ROYW1lLCBjb250YWluZXNNZXRob2ROYW1lLCBkZWVwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZXNUb0V4dGVuZClcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCB0eXBlOm1peGVkIG9mIHR5cGVzVG9FeHRlbmQpXG4gICAgICAgICAgICBpZiAob2JqZWN0IGluc3RhbmNlb2YgdHlwZSkge1xuICAgICAgICAgICAgICAgIGlmIChvYmplY3QuX190YXJnZXRfXylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdFxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXI6e1xuICAgICAgICAgICAgICAgICAgICBoYXM/Oih0YXJnZXQ6T2JqZWN0LCBuYW1lOnN0cmluZykgPT4gYm9vbGVhbjtcbiAgICAgICAgICAgICAgICAgICAgZ2V0PzoodGFyZ2V0Ok9iamVjdCwgbmFtZTpzdHJpbmcpID0+IGFueTtcbiAgICAgICAgICAgICAgICAgICAgc2V0PzoodGFyZ2V0Ok9iamVjdCwgbmFtZTpzdHJpbmcpID0+IGFueVxuICAgICAgICAgICAgICAgIH0gPSB7fVxuICAgICAgICAgICAgICAgIGlmIChjb250YWluZXNNZXRob2ROYW1lKVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmhhcyA9ICh0YXJnZXQ6T2JqZWN0LCBuYW1lOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udGFpbmVzTWV0aG9kTmFtZSA9PT0gJ1tdJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmFtZSBpbiB0YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbY29udGFpbmVzTWV0aG9kTmFtZV0obmFtZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb250YWluZXNNZXRob2ROYW1lICYmIGdldHRlck1ldGhvZE5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuZ2V0ID0gKHRhcmdldDpPYmplY3QsIG5hbWU6c3RyaW5nKTphbnkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUgPT09ICdfX3RhcmdldF9fJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRhcmdldFtuYW1lXSA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0W25hbWVdLmJpbmQodGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldFtjb250YWluZXNNZXRob2ROYW1lXShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChnZXR0ZXJNZXRob2ROYW1lID09PSAnW10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyV3JhcHBlcih0YXJnZXRbbmFtZV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlcldyYXBwZXIodGFyZ2V0W2dldHRlck1ldGhvZE5hbWVdKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbbmFtZV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzZXR0ZXJNZXRob2ROYW1lKVxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLnNldCA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldDpPYmplY3QsIG5hbWU6c3RyaW5nLCB2YWx1ZTphbnlcbiAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZXR0ZXJNZXRob2ROYW1lID09PSAnW10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSA9IHNldHRlcldyYXBwZXIobmFtZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W3NldHRlck1ldGhvZE5hbWVdKG5hbWUsIHNldHRlcldyYXBwZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsIHZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJveHkob2JqZWN0LCBoYW5kbGVyKVxuICAgICAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqZWN0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlYXJjaGVzIGZvciBuZXN0ZWQgbWFwcGluZ3Mgd2l0aCBnaXZlbiBpbmRpY2F0b3Iga2V5IGFuZCByZXNvbHZlc1xuICAgICAqIG1hcmtlZCB2YWx1ZXMuIEFkZGl0aW9uYWxseSBhbGwgb2JqZWN0cyBhcmUgd3JhcHBlZCB3aXRoIGEgcHJveHkgdG9cbiAgICAgKiBkeW5hbWljYWxseSByZXNvbHZlIG5lc3RlZCBwcm9wZXJ0aWVzLlxuICAgICAqIEBwYXJhbSBvYmplY3QgLSBHaXZlbiBtYXBwaW5nIHRvIHJlc29sdmUuXG4gICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb24gLSBDb25maWd1cmF0aW9uIGNvbnRleHQgdG8gcmVzb2x2ZSBtYXJrZWQgdmFsdWVzLlxuICAgICAqIEBwYXJhbSBkZWVwIC0gSW5kaWNhdGVzIHdlYXRoZXIgdG8gcGVyZm9ybSBhIHJlY3Vyc2l2ZSByZXNvbHZpbmcuXG4gICAgICogQHBhcmFtIGV2YWx1YXRpb25JbmRpY2F0b3JLZXkgLSBJbmRpY2F0b3IgcHJvcGVydHkgbmFtZSB0byBtYXJrIGEgdmFsdWVcbiAgICAgKiB0byBldmFsdWF0ZS5cbiAgICAgKiBAcGFyYW0gZXhlY3V0aW9uSW5kaWNhdG9yS2V5IC0gSW5kaWNhdG9yIHByb3BlcnR5IG5hbWUgdG8gbWFyayBhIHZhbHVlXG4gICAgICogdG8gZXZhbHVhdGUuXG4gICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb25LZXlOYW1lIC0gTmFtZSB1bmRlciB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBuYW1lXG4gICAgICogc2hvdWxkIGJlIHByb3ZpZGVkIHRvIGV2YWx1YXRpb24gb3IgZXhlY3V0aW9uIGNvbnRleHRzLlxuICAgICAqIEByZXR1cm5zIEV2YWx1YXRlZCBnaXZlbiBtYXBwaW5nLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgIG9iamVjdDphbnksIGNvbmZpZ3VyYXRpb246P1BsYWluT2JqZWN0ID0gbnVsbCwgZGVlcDpib29sZWFuID0gdHJ1ZSxcbiAgICAgICAgZXZhbHVhdGlvbkluZGljYXRvcktleTpzdHJpbmcgPSAnX19ldmFsdWF0ZV9fJyxcbiAgICAgICAgZXhlY3V0aW9uSW5kaWNhdG9yS2V5OnN0cmluZyA9ICdfX2V4ZWN1dGVfXycsXG4gICAgICAgIGNvbmZpZ3VyYXRpb25LZXlOYW1lOnN0cmluZyA9ICdzZWxmJ1xuICAgICk6YW55IHtcbiAgICAgICAgaWYgKG9iamVjdCA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0JylcbiAgICAgICAgICAgIHJldHVybiBvYmplY3RcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24gPT09IG51bGwpXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uID0gb2JqZWN0XG4gICAgICAgIGlmIChkZWVwICYmIGNvbmZpZ3VyYXRpb24gJiYgIWNvbmZpZ3VyYXRpb24uX190YXJnZXRfXylcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24gPSBIZWxwZXIuYWRkRHluYW1pY0dldHRlckFuZFNldHRlcihcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLCAoKHZhbHVlOmFueSk6YW55ID0+XG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSwgY29uZmlndXJhdGlvbiwgZmFsc2UsIGV2YWx1YXRpb25JbmRpY2F0b3JLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRpb25JbmRpY2F0b3JLZXksIGNvbmZpZ3VyYXRpb25LZXlOYW1lKVxuICAgICAgICAgICAgICAgICksIChrZXk6YW55LCB2YWx1ZTphbnkpOmFueSA9PiB2YWx1ZSwgJ1tdJywgJycpXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkgJiYgZGVlcCkge1xuICAgICAgICAgICAgbGV0IGluZGV4Om51bWJlciA9IDBcbiAgICAgICAgICAgIGZvciAoY29uc3QgdmFsdWU6bWl4ZWQgb2Ygb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgb2JqZWN0W2luZGV4XSA9IEhlbHBlci5yZXNvbHZlRHluYW1pY0RhdGFTdHJ1Y3R1cmUoXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLCBjb25maWd1cmF0aW9uLCBkZWVwLCBldmFsdWF0aW9uSW5kaWNhdG9yS2V5LFxuICAgICAgICAgICAgICAgICAgICBleGVjdXRpb25JbmRpY2F0b3JLZXksIGNvbmZpZ3VyYXRpb25LZXlOYW1lKVxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleTpzdHJpbmcgaW4gb2JqZWN0KVxuICAgICAgICAgICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2YWx1YXRpb25JbmRpY2F0b3JLZXksIGV4ZWN1dGlvbkluZGljYXRvcktleVxuICAgICAgICAgICAgICAgICAgICBdLmluY2x1ZGVzKGtleSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbjpFdmFsdWF0aW9uRnVuY3Rpb24gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uS2V5TmFtZSwgJ3dlYk9wdGltaXplclBhdGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2N1cnJlbnRQYXRoJywgJ3BhdGgnLCAnaGVscGVyJywgKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkgPT09IGV2YWx1YXRpb25JbmRpY2F0b3JLZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgPyAncmV0dXJuICcgOiAnJykgKyBvYmplY3Rba2V5XSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gSGVscGVyLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvbkZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgX19kaXJuYW1lLCBwcm9jZXNzLmN3ZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCwgSGVscGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIGNvbmZpZ3VyYXRpb24sIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmFsdWF0aW9uSW5kaWNhdG9yS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRpb25JbmRpY2F0b3JLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25LZXlOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Vycm9yIGR1cmluZyAnICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5ID09PSBldmFsdWF0aW9uSW5kaWNhdG9yS2V5ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZXhlY3V0aW5nJyA6ICdldmFsdWF0aW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgYCBcIiR7b2JqZWN0W2tleV19XCI6ICR7ZXJyb3J9YClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZGVlcClcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFtrZXldID0gSGVscGVyLnJlc29sdmVEeW5hbWljRGF0YVN0cnVjdHVyZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSwgY29uZmlndXJhdGlvbiwgZGVlcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmFsdWF0aW9uSW5kaWNhdG9yS2V5LCBleGVjdXRpb25JbmRpY2F0b3JLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbktleU5hbWUpXG4gICAgICAgIHJldHVybiBvYmplY3RcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHN0cmluZyBoYW5kbGluZ1xuICAgIC8qKlxuICAgICAqIFRyYW5zbGF0ZXMgZ2l2ZW4gc3RyaW5nIGludG8gdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB2YWxpZGF0ZWRcbiAgICAgKiByZXByZXNlbnRhdGlvbi5cbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBTdHJpbmcgdG8gY29udmVydC5cbiAgICAgKiBAcGFyYW0gZXhjbHVkZVN5bWJvbHMgLSBTeW1ib2xzIG5vdCB0byBlc2NhcGUuXG4gICAgICogQHJldHVybnMgQ29udmVydGVkIHN0cmluZy5cbiAgICAgKi9cbiAgICBzdGF0aWMgY29udmVydFRvVmFsaWRSZWd1bGFyRXhwcmVzc2lvblN0cmluZyhcbiAgICAgICAgdmFsdWU6c3RyaW5nLCBleGNsdWRlU3ltYm9sczpBcnJheTxzdHJpbmc+ID0gW11cbiAgICApOnN0cmluZyB7XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgb25seSBmb3IgcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnRzLlxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAxICYmICFIZWxwZXIuc3BlY2lhbFJlZ2V4U2VxdWVuY2VzLmluY2x1ZGVzKFxuICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgKSlcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZVxuICAgICAgICAvLyBUaGUgZXNjYXBlIHNlcXVlbmNlIG11c3QgYWxzbyBiZSBlc2NhcGVkOyBidXQgYXQgZmlyc3QuXG4gICAgICAgIGlmICghZXhjbHVkZVN5bWJvbHMuaW5jbHVkZXMoJ1xcXFwnKSlcbiAgICAgICAgICAgIHZhbHVlLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcbiAgICAgICAgZm9yIChjb25zdCByZXBsYWNlOnN0cmluZyBvZiBIZWxwZXIuc3BlY2lhbFJlZ2V4U2VxdWVuY2VzKVxuICAgICAgICAgICAgaWYgKCFleGNsdWRlU3ltYm9scy5pbmNsdWRlcyhyZXBsYWNlKSlcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoYFxcXFwke3JlcGxhY2V9YCwgJ2cnKSwgYFxcXFwke3JlcGxhY2V9YClcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyYW5zbGF0ZXMgZ2l2ZW4gbmFtZSBpbnRvIGEgdmFsaWQgamF2YVNjcmlwdCBvbmUuXG4gICAgICogQHBhcmFtIG5hbWUgLSBOYW1lIHRvIGNvbnZlcnQuXG4gICAgICogQHBhcmFtIGFsbG93ZWRTeW1ib2xzIC0gU3RyaW5nIG9mIHN5bWJvbHMgd2hpY2ggc2hvdWxkIGJlIGFsbG93ZWQgd2l0aGluXG4gICAgICogYSB2YXJpYWJsZSBuYW1lIChub3QgdGhlIGZpcnN0IGNoYXJhY3RlcikuXG4gICAgICogQHJldHVybnMgQ29udmVydGVkIG5hbWUgaXMgcmV0dXJuZWQuXG4gICAgICovXG4gICAgc3RhdGljIGNvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKFxuICAgICAgICBuYW1lOnN0cmluZywgYWxsb3dlZFN5bWJvbHM6c3RyaW5nID0gJzAtOWEtekEtWl8kJ1xuICAgICk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIG5hbWUudG9TdHJpbmcoKS5yZXBsYWNlKC9eW15hLXpBLVpfJF0rLywgJycpLnJlcGxhY2UoXG4gICAgICAgICAgICBuZXcgUmVnRXhwKGBbXiR7YWxsb3dlZFN5bWJvbHN9XSsoW2EtekEtWjAtOV0pYCwgJ2cnKSwgKFxuICAgICAgICAgICAgICAgIGZ1bGxNYXRjaDpzdHJpbmcsIGZpcnN0TGV0dGVyOnN0cmluZ1xuICAgICAgICAgICAgKTpzdHJpbmcgPT4gZmlyc3RMZXR0ZXIudG9VcHBlckNhc2UoKSlcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHByb2Nlc3MgaGFuZGxlclxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyBhIG9uZSBzaG90IGNsb3NlIGhhbmRsZXIgd2hpY2ggdHJpZ2dlcnMgZ2l2ZW4gcHJvbWlzZSBtZXRob2RzLlxuICAgICAqIElmIGEgcmVhc29uIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZ2l2ZW4gYXMgcmVzb2x2ZSB0YXJnZXQuIEFuIEVycm9yXG4gICAgICogd2lsbCBiZSBnZW5lcmF0ZWQgaWYgcmV0dXJuIGNvZGUgaXMgbm90IHplcm8uIFRoZSBnZW5lcmF0ZWQgRXJyb3IgaGFzXG4gICAgICogYSBwcm9wZXJ0eSBcInJldHVybkNvZGVcIiB3aGljaCBwcm92aWRlcyBjb3JyZXNwb25kaW5nIHByb2Nlc3MgcmV0dXJuXG4gICAgICogY29kZS5cbiAgICAgKiBAcGFyYW0gcmVzb2x2ZSAtIFByb21pc2UncyByZXNvbHZlIGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSByZWplY3QgLSBQcm9taXNlJ3MgcmVqZWN0IGZ1bmN0aW9uLlxuICAgICAqIEBwYXJhbSByZWFzb24gLSBQcm9taXNlIHRhcmdldCBpZiBwcm9jZXNzIGhhcyBhIHplcm8gcmV0dXJuIGNvZGUuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gT3B0aW9uYWwgZnVuY3Rpb24gdG8gY2FsbCBvZiBwcm9jZXNzIGhhcyBzdWNjZXNzZnVsbHlcbiAgICAgKiBmaW5pc2hlZC5cbiAgICAgKiBAcmV0dXJucyBQcm9jZXNzIGNsb3NlIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAgICovXG4gICAgc3RhdGljIGdldFByb2Nlc3NDbG9zZUhhbmRsZXIoXG4gICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvbiwgcmVhc29uOmFueSA9IG51bGwsXG4gICAgICAgIGNhbGxiYWNrOkZ1bmN0aW9uID0gKCk6dm9pZCA9PiB7fVxuICAgICk6KChyZXR1cm5Db2RlOj9udW1iZXIpID0+IHZvaWQpIHtcbiAgICAgICAgbGV0IGZpbmlzaGVkOmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICByZXR1cm4gKHJldHVybkNvZGU6P251bWJlcik6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpbmlzaGVkKVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmV0dXJuQ29kZSAhPT0gJ251bWJlcicgfHwgcmV0dXJuQ29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVhc29uKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yOkVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFRhc2sgZXhpdGVkIHdpdGggZXJyb3IgY29kZSAke3JldHVybkNvZGV9YClcbiAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgICAgIGVycm9yLnJldHVybkNvZGUgPSByZXR1cm5Db2RlXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5pc2hlZCA9IHRydWVcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBGb3J3YXJkcyBnaXZlbiBjaGlsZCBwcm9jZXNzIGNvbW11bmljYXRpb24gY2hhbm5lbHMgdG8gY29ycmVzcG9uZGluZ1xuICAgICAqIGN1cnJlbnQgcHJvY2VzcyBjb21tdW5pY2F0aW9uIGNoYW5uZWxzLlxuICAgICAqIEBwYXJhbSBjaGlsZFByb2Nlc3MgLSBDaGlsZCBwcm9jZXNzIG1ldGEgZGF0YS5cbiAgICAgKiBAcmV0dXJucyBHaXZlbiBjaGlsZCBwcm9jZXNzIG1ldGEgZGF0YS5cbiAgICAgKi9cbiAgICBzdGF0aWMgaGFuZGxlQ2hpbGRQcm9jZXNzKGNoaWxkUHJvY2VzczpDaGlsZFByb2Nlc3MpOkNoaWxkUHJvY2VzcyB7XG4gICAgICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQucGlwZShwcm9jZXNzLnN0ZG91dClcbiAgICAgICAgY2hpbGRQcm9jZXNzLnN0ZGVyci5waXBlKHByb2Nlc3Muc3RkZXJyKVxuICAgICAgICBjaGlsZFByb2Nlc3Mub24oJ2Nsb3NlJywgKHJldHVybkNvZGU6bnVtYmVyKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGlmIChyZXR1cm5Db2RlICE9PSAwKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFRhc2sgZXhpdGVkIHdpdGggZXJyb3IgY29kZSAke3JldHVybkNvZGV9YClcbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIGNoaWxkUHJvY2Vzc1xuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZmlsZSBoYW5kbGVyXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGdpdmVuIHBhdGggcG9pbnRzIHRvIGEgdmFsaWQgZmlsZS5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggLSBQYXRoIHRvIGZpbGUuXG4gICAgICogQHJldHVybnMgQSBib29sZWFuIHdoaWNoIGluZGljYXRlcyBmaWxlIGV4aXN0ZW50cy5cbiAgICAgKi9cbiAgICBzdGF0aWMgaXNGaWxlU3luYyhmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmlsZVN5c3RlbS5hY2Nlc3NTeW5jKGZpbGVQYXRoLCBmaWxlU3lzdGVtLkZfT0spXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSXRlcmF0ZXMgdGhyb3VnaCBnaXZlbiBkaXJlY3Rvcnkgc3RydWN0dXJlIHJlY3Vyc2l2ZWx5IGFuZCBjYWxscyBnaXZlblxuICAgICAqIGNhbGxiYWNrIGZvciBlYWNoIGZvdW5kIGZpbGUuIENhbGxiYWNrIGdldHMgZmlsZSBwYXRoIGFuZCBjb3JyZXNwb25kaW5nXG4gICAgICogc3RhdCBvYmplY3QgYXMgYXJndW1lbnQuXG4gICAgICogQHBhcmFtIGRpcmVjdG9yeVBhdGggLSBQYXRoIHRvIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgdG8gdHJhdmVyc2UuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gaW52b2tlIGZvciBlYWNoIHRyYXZlcnNlZCBmaWxlLlxuICAgICAqIEByZXR1cm5zIEdpdmVuIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyB3YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKFxuICAgICAgICBkaXJlY3RvcnlQYXRoOnN0cmluZywgY2FsbGJhY2s6VHJhdmVyc2VGaWxlc0NhbGxiYWNrRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICBfZmlsZVBhdGg6c3RyaW5nLCBfc3RhdDpPYmplY3RcbiAgICAgICAgKTo/Ym9vbGVhbiA9PiB0cnVlXG4gICAgKTpUcmF2ZXJzZUZpbGVzQ2FsbGJhY2tGdW5jdGlvbiB7XG4gICAgICAgIGZpbGVTeXN0ZW0ucmVhZGRpclN5bmMoZGlyZWN0b3J5UGF0aCkuZm9yRWFjaCgoXG4gICAgICAgICAgICBmaWxlTmFtZTpzdHJpbmdcbiAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IHBhdGgucmVzb2x2ZShkaXJlY3RvcnlQYXRoLCBmaWxlTmFtZSlcbiAgICAgICAgICAgIGNvbnN0IHN0YXQ6T2JqZWN0ID0gZmlsZVN5c3RlbS5zdGF0U3luYyhmaWxlUGF0aClcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayhmaWxlUGF0aCwgc3RhdCkgIT09IGZhbHNlICYmIHN0YXQgJiYgc3RhdC5pc0RpcmVjdG9yeShcbiAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgSGVscGVyLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoZmlsZVBhdGgsIGNhbGxiYWNrKVxuICAgICAgICB9KVxuICAgICAgICByZXR1cm4gY2FsbGJhY2tcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29waWVzIGdpdmVuIHNvdXJjZSBmaWxlIHZpYSBwYXRoIHRvIGdpdmVuIHRhcmdldCBkaXJlY3RvcnkgbG9jYXRpb25cbiAgICAgKiB3aXRoIHNhbWUgdGFyZ2V0IG5hbWUgYXMgc291cmNlIGZpbGUgaGFzIG9yIGNvcHkgdG8gZ2l2ZW4gY29tcGxldGVcbiAgICAgKiB0YXJnZXQgZmlsZSBwYXRoLlxuICAgICAqIEBwYXJhbSBzb3VyY2VQYXRoIC0gUGF0aCB0byBmaWxlIHRvIGNvcHkuXG4gICAgICogQHBhcmFtIHRhcmdldFBhdGggLSBUYXJnZXQgZGlyZWN0b3J5IG9yIGNvbXBsZXRlIGZpbGUgbG9jYXRpb24gdG8gY29weVxuICAgICAqIHRvLlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgdGFyZ2V0IGZpbGUgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgY29weUZpbGVTeW5jKHNvdXJjZVBhdGg6c3RyaW5nLCB0YXJnZXRQYXRoOnN0cmluZyk6c3RyaW5nIHtcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IElmIHRhcmdldCBwYXRoIHJlZmVyZW5jZXMgYSBkaXJlY3RvcnkgYSBuZXcgZmlsZSB3aXRoIHRoZVxuICAgICAgICAgICAgc2FtZSBuYW1lIHdpbGwgYmUgY3JlYXRlZC5cbiAgICAgICAgKi9cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtLmxzdGF0U3luYyh0YXJnZXRQYXRoKS5pc0RpcmVjdG9yeSgpKVxuICAgICAgICAgICAgICAgIHRhcmdldFBhdGggPSBwYXRoLmpvaW4odGFyZ2V0UGF0aCwgcGF0aC5iYXNlbmFtZShzb3VyY2VQYXRoKSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgIGZpbGVTeXN0ZW0ud3JpdGVGaWxlU3luYyh0YXJnZXRQYXRoLCBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgIHNvdXJjZVBhdGgpKVxuICAgICAgICByZXR1cm4gdGFyZ2V0UGF0aFxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgZ2l2ZW4gc291cmNlIGRpcmVjdG9yeSB2aWEgcGF0aCB0byBnaXZlbiB0YXJnZXQgZGlyZWN0b3J5XG4gICAgICogbG9jYXRpb24gd2l0aCBzYW1lIHRhcmdldCBuYW1lIGFzIHNvdXJjZSBmaWxlIGhhcyBvciBjb3B5IHRvIGdpdmVuXG4gICAgICogY29tcGxldGUgdGFyZ2V0IGRpcmVjdG9yeSBwYXRoLlxuICAgICAqIEBwYXJhbSBzb3VyY2VQYXRoIC0gUGF0aCB0byBkaXJlY3RvcnkgdG8gY29weS5cbiAgICAgKiBAcGFyYW0gdGFyZ2V0UGF0aCAtIFRhcmdldCBkaXJlY3Rvcnkgb3IgY29tcGxldGUgZGlyZWN0b3J5IGxvY2F0aW9uIHRvXG4gICAgICogY29weSBpbi5cbiAgICAgKiBAcmV0dXJucyBEZXRlcm1pbmVkIHRhcmdldCBkaXJlY3RvcnkgcGF0aC5cbiAgICAgKi9cbiAgICBzdGF0aWMgY29weURpcmVjdG9yeVJlY3Vyc2l2ZVN5bmMoXG4gICAgICAgIHNvdXJjZVBhdGg6c3RyaW5nLCB0YXJnZXRQYXRoOnN0cmluZ1xuICAgICk6c3RyaW5nIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGZvbGRlciBuZWVkcyB0byBiZSBjcmVhdGVkIG9yIGludGVncmF0ZWQuXG4gICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5sc3RhdFN5bmModGFyZ2V0UGF0aCkuaXNEaXJlY3RvcnkoKSlcbiAgICAgICAgICAgICAgICB0YXJnZXRQYXRoID0gcGF0aC5qb2luKHRhcmdldFBhdGgsIHBhdGguYmFzZW5hbWUoc291cmNlUGF0aCkpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICBmaWxlU3lzdGVtLm1rZGlyU3luYyh0YXJnZXRQYXRoKVxuICAgICAgICBIZWxwZXIud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhzb3VyY2VQYXRoLCAoXG4gICAgICAgICAgICBjdXJyZW50U291cmNlUGF0aDpzdHJpbmcsIHN0YXQ6T2JqZWN0XG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0UGF0aDpzdHJpbmcgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgdGFyZ2V0UGF0aCwgY3VycmVudFNvdXJjZVBhdGguc3Vic3RyaW5nKHNvdXJjZVBhdGgubGVuZ3RoKSlcbiAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICAgICAgZmlsZVN5c3RlbS5ta2RpclN5bmMoY3VycmVudFRhcmdldFBhdGgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgSGVscGVyLmNvcHlGaWxlU3luYyhjdXJyZW50U291cmNlUGF0aCwgY3VycmVudFRhcmdldFBhdGgpXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiB0YXJnZXRQYXRoXG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYSBhc3NldCB0eXBlIGlmIGdpdmVuIGZpbGUuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIC0gUGF0aCB0byBmaWxlIHRvIGFuYWx5c2UuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbiAtIE1ldGEgaW5mb3JtYXRpb25zIGZvciBhdmFpbGFibGUgYXNzZXRcbiAgICAgKiB0eXBlcy5cbiAgICAgKiBAcGFyYW0gcGF0aHMgLSBMaXN0IG9mIHBhdGhzIHRvIHNlYXJjaCBpZiBnaXZlbiBwYXRoIGRvZXNuJ3QgcmVmZXJlbmNlXG4gICAgICogYSBmaWxlIGRpcmVjdGx5LlxuICAgICAqIEByZXR1cm5zIERldGVybWluZWQgZmlsZSB0eXBlIG9yIFwibnVsbFwiIG9mIGdpdmVuIGZpbGUgY291bGRuJ3QgYmVcbiAgICAgKiBkZXRlcm1pbmVkLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgIGZpbGVQYXRoOnN0cmluZywgYnVpbGRDb25maWd1cmF0aW9uOkJ1aWxkQ29uZmlndXJhdGlvbiwgcGF0aHM6UGF0aHNcbiAgICApOj9zdHJpbmcge1xuICAgICAgICBsZXQgcmVzdWx0Oj9zdHJpbmcgPSBudWxsXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgaW4gYnVpbGRDb25maWd1cmF0aW9uKVxuICAgICAgICAgICAgaWYgKHBhdGguZXh0bmFtZShcbiAgICAgICAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICAgICAgKSA9PT0gYC4ke2J1aWxkQ29uZmlndXJhdGlvblt0eXBlXS5leHRlbnNpb259YCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHR5cGVcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3VsdClcbiAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgWydzb3VyY2UnLCAndGFyZ2V0J10pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFR5cGU6c3RyaW5nIGluIHBhdGhzLmFzc2V0KVxuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aHMuYXNzZXRbYXNzZXRUeXBlXS5zdGFydHNXaXRoKHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhzW3R5cGVdLCBwYXRocy5hc3NldFthc3NldFR5cGVdXG4gICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2V0VHlwZVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBwcm9wZXJ0eSB3aXRoIGEgc3RvcmVkIGFycmF5IG9mIGFsbCBtYXRjaGluZyBmaWxlIHBhdGhzLCB3aGljaFxuICAgICAqIG1hdGNoZXMgZWFjaCBidWlsZCBjb25maWd1cmF0aW9uIGluIGdpdmVuIGVudHJ5IHBhdGggYW5kIGNvbnZlcnRzIGdpdmVuXG4gICAgICogYnVpbGQgY29uZmlndXJhdGlvbiBpbnRvIGEgc29ydGVkIGFycmF5IHdlcmUgamF2YVNjcmlwdCBmaWxlcyB0YWtlc1xuICAgICAqIHByZWNlZGVuY2UuXG4gICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb24gLSBHaXZlbiBidWlsZCBjb25maWd1cmF0aW9ucy5cbiAgICAgKiBAcGFyYW0gZW50cnlQYXRoIC0gUGF0aCB0byBhbmFseXNlIG5lc3RlZCBzdHJ1Y3R1cmUuXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBQYXRoIHRvIHNldCBwYXRocyByZWxhdGl2ZSB0byBhbmQgZGV0ZXJtaW5lIHJlbGF0aXZlXG4gICAgICogaWdub3JlZCBwYXRocyB0by5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZSAoUmVsYXRpdmVcbiAgICAgKiBwYXRocyBhcmUgcmVzb2x2ZWQgcmVsYXRpdmVseSB0byBnaXZlbiBjb250ZXh0LikuXG4gICAgICogQHJldHVybnMgQ29udmVydGVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb246QnVpbGRDb25maWd1cmF0aW9uLCBlbnRyeVBhdGg6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgY29udGV4dDpzdHJpbmcgPSAnLi8nLCBwYXRoc1RvSWdub3JlOkFycmF5PHN0cmluZz4gPSBbJy5naXQnXVxuICAgICk6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24ge1xuICAgICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb246UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24gPSBbXVxuICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24pXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW06UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25JdGVtID1cbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLmV4dGVuZE9iamVjdCh0cnVlLCB7ZmlsZVBhdGhzOiBbXX0sIGNvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlXSlcbiAgICAgICAgICAgICAgICBIZWxwZXIud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhlbnRyeVBhdGgsICgoXG4gICAgICAgICAgICAgICAgICAgIGluZGV4Om51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uSXRlbTpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbiAgICAgICAgICAgICAgICApOlRyYXZlcnNlRmlsZXNDYWxsYmFja0Z1bmN0aW9uID0+IChcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBzdGF0Ok9iamVjdFxuICAgICAgICAgICAgICAgICk6P2Jvb2xlYW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKGZpbGVQYXRoLCBwYXRoc1RvSWdub3JlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdC5pc0ZpbGUoKSAmJiBwYXRoLmV4dG5hbWUoZmlsZVBhdGgpLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgKSA9PT0gYnVpbGRDb25maWd1cmF0aW9uSXRlbS5leHRlbnNpb24gJiYgIShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uSXRlbS5maWxlTmFtZVBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgKSkudGVzdChmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25JdGVtLmZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgIH0pKGluZGV4LCBuZXdJdGVtKSlcbiAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ucHVzaChuZXdJdGVtKVxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ1aWxkQ29uZmlndXJhdGlvbi5zb3J0KChcbiAgICAgICAgICAgIGZpcnN0OlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uSXRlbSxcbiAgICAgICAgICAgIHNlY29uZDpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW1cbiAgICAgICAgKTpudW1iZXIgPT4ge1xuICAgICAgICAgICAgaWYgKGZpcnN0Lm91dHB1dEV4dGVuc2lvbiAhPT0gc2Vjb25kLm91dHB1dEV4dGVuc2lvbikge1xuICAgICAgICAgICAgICAgIGlmIChmaXJzdC5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMVxuICAgICAgICAgICAgICAgIGlmIChzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIHJldHVybiBmaXJzdC5vdXRwdXRFeHRlbnNpb24gPCBzZWNvbmQub3V0cHV0RXh0ZW5zaW9uID8gLTEgOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9KVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBmaWxlIGFuZCBkaXJlY3RvcnkgcGF0aHMgcmVsYXRlZCB0byBnaXZlbiBpbnRlcm5hbFxuICAgICAqIG1vZHVsZXMgYXMgYXJyYXkuXG4gICAgICogQHBhcmFtIGludGVybmFsSW5qZWN0aW9uIC0gTGlzdCBvZiBtb2R1bGVJRHMgb3IgbW9kdWxlIGZpbGUgcGF0aHMuXG4gICAgICogQHBhcmFtIG1vZHVsZUFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGtub3duRXh0ZW5zaW9ucyAtIExpc3Qgb2YgZmlsZSBleHRlbnNpb25zIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHJlc29sdmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHJldHVybnMgT2JqZWN0IHdpdGggYSBmaWxlIHBhdGggYW5kIGRpcmVjdG9yeSBwYXRoIGtleSBtYXBwaW5nIHRvXG4gICAgICogY29ycmVzcG9uZGluZyBsaXN0IG9mIHBhdGhzLlxuICAgICAqL1xuICAgIHN0YXRpYyBkZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgICAgIGludGVybmFsSW5qZWN0aW9uOkludGVybmFsSW5qZWN0aW9uLCBtb2R1bGVBbGlhc2VzOlBsYWluT2JqZWN0ID0ge30sXG4gICAgICAgIGtub3duRXh0ZW5zaW9uczpBcnJheTxzdHJpbmc+ID0gWycuanMnXSwgY29udGV4dDpzdHJpbmcgPSAnLi8nXG4gICAgKTp7ZmlsZVBhdGhzOkFycmF5PHN0cmluZz47ZGlyZWN0b3J5UGF0aHM6QXJyYXk8c3RyaW5nPn0ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGhzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb25zdCBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb246Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID1cbiAgICAgICAgICAgIEhlbHBlci5ub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIG5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbilcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb24uaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZiBub3JtYWxpemVkSW50ZXJuYWxJbmplY3Rpb25bXG4gICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQsIG1vZHVsZUFsaWFzZXMsIGtub3duRXh0ZW5zaW9ucywgY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzLnB1c2goZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdG9yeVBhdGg6c3RyaW5nID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWRpcmVjdG9yeVBhdGhzLmluY2x1ZGVzKGRpcmVjdG9yeVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5UGF0aHMucHVzaChkaXJlY3RvcnlQYXRoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtmaWxlUGF0aHMsIGRpcmVjdG9yeVBhdGhzfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFdmVyeSBpbmplY3Rpb24gZGVmaW5pdGlvbiB0eXBlIGNhbiBiZSByZXByZXNlbnRlZCBhcyBwbGFpbiBvYmplY3RcbiAgICAgKiAobWFwcGluZyBmcm9tIGNodW5rIG5hbWUgdG8gYXJyYXkgb2YgbW9kdWxlIGlkcykuIFRoaXMgbWV0aG9kIGNvbnZlcnRzXG4gICAgICogZWFjaCByZXByZXNlbnRhdGlvbiBpbnRvIHRoZSBub3JtYWxpemVkIHBsYWluIG9iamVjdCBub3RhdGlvbi5cbiAgICAgKiBAcGFyYW0gaW50ZXJuYWxJbmplY3Rpb24gLSBHaXZlbiBpbnRlcm5hbCBpbmplY3Rpb24gdG8gbm9ybWFsaXplLlxuICAgICAqIEByZXR1cm5zIE5vcm1hbGl6ZWQgcmVwcmVzZW50YXRpb24gb2YgZ2l2ZW4gaW50ZXJuYWwgaW5qZWN0aW9uLlxuICAgICAqL1xuICAgIHN0YXRpYyBub3JtYWxpemVJbnRlcm5hbEluamVjdGlvbihcbiAgICAgICAgaW50ZXJuYWxJbmplY3Rpb246SW50ZXJuYWxJbmplY3Rpb25cbiAgICApOk5vcm1hbGl6ZWRJbnRlcm5hbEluamVjdGlvbiB7XG4gICAgICAgIGxldCByZXN1bHQ6Tm9ybWFsaXplZEludGVybmFsSW5qZWN0aW9uID0ge31cbiAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uIGluc3RhbmNlb2YgT2JqZWN0ICYmIEhlbHBlci5pc1BsYWluT2JqZWN0KFxuICAgICAgICAgICAgaW50ZXJuYWxJbmplY3Rpb25cbiAgICAgICAgKSkge1xuICAgICAgICAgICAgbGV0IGhhc0NvbnRlbnQ6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgICAgICBjb25zdCBjaHVua05hbWVzVG9EZWxldGU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gaW50ZXJuYWxJbmplY3Rpb24pXG4gICAgICAgICAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NvbnRlbnQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2NodW5rTmFtZV0gPSBpbnRlcm5hbEluamVjdGlvbltjaHVua05hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVzVG9EZWxldGUucHVzaChjaHVua05hbWUpXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ29udGVudCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtjaHVua05hbWVdID0gW2ludGVybmFsSW5qZWN0aW9uW2NodW5rTmFtZV1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoYXNDb250ZW50KVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBvZiBjaHVua05hbWVzVG9EZWxldGUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSByZXN1bHRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogW119XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGludGVybmFsSW5qZWN0aW9uID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgIHJlc3VsdCA9IHtpbmRleDogW2ludGVybmFsSW5qZWN0aW9uXX1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShpbnRlcm5hbEluamVjdGlvbikpXG4gICAgICAgICAgICByZXN1bHQgPSB7aW5kZXg6IGludGVybmFsSW5qZWN0aW9ufVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgYWxsIGNvbmNyZXRlIGZpbGUgcGF0aHMgZm9yIGdpdmVuIGluamVjdGlvbiB3aGljaCBhcmUgbWFya2VkXG4gICAgICogd2l0aCB0aGUgXCJfX2F1dG9fX1wiIGluZGljYXRvci5cbiAgICAgKiBAcGFyYW0gZ2l2ZW5JbmplY3Rpb24gLSBHaXZlbiBpbnRlcm5hbCBhbmQgZXh0ZXJuYWwgaW5qZWN0aW9uIHRvIHRha2VcbiAgICAgKiBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGJ1aWxkQ29uZmlndXJhdGlvbnMgLSBSZXNvbHZlZCBidWlsZCBjb25maWd1cmF0aW9uLlxuICAgICAqIEBwYXJhbSBtb2R1bGVzVG9FeGNsdWRlIC0gQSBsaXN0IG9mIG1vZHVsZXMgdG8gZXhjbHVkZSAoc3BlY2lmaWVkIGJ5XG4gICAgICogcGF0aCBvciBpZCkgb3IgYSBtYXBwaW5nIGZyb20gY2h1bmsgbmFtZXMgdG8gbW9kdWxlIGlkcy5cbiAgICAgKiBAcGFyYW0gbW9kdWxlQWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcGFyYW0ga25vd25FeHRlbnNpb25zIC0gRmlsZSBleHRlbnNpb25zIHRvIHRha2UgaW50byBhY2NvdW50LlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcGFyYW0gcGF0aHNUb0lnbm9yZSAtIFBhdGhzIHdoaWNoIG1hcmtzIGxvY2F0aW9uIHRvIGlnbm9yZSAoUmVsYXRpdmVcbiAgICAgKiBwYXRocyBhcmUgcmVzb2x2ZWQgcmVsYXRpdmVseSB0byBnaXZlbiBjb250ZXh0LikuXG4gICAgICogQHJldHVybnMgR2l2ZW4gaW5qZWN0aW9uIHdpdGggcmVzb2x2ZWQgbWFya2VkIGluZGljYXRvcnMuXG4gICAgICovXG4gICAgc3RhdGljIHJlc29sdmVJbmplY3Rpb24oXG4gICAgICAgIGdpdmVuSW5qZWN0aW9uOkluamVjdGlvbixcbiAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgbW9kdWxlc1RvRXhjbHVkZTpJbnRlcm5hbEluamVjdGlvbixcbiAgICAgICAgbW9kdWxlQWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LCBrbm93bkV4dGVuc2lvbnM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICcuanMnLCAnLmNzcycsICcuc3ZnJywgJy5odG1sJ1xuICAgICAgICBdLCBjb250ZXh0OnN0cmluZyA9ICcuLycsIHBhdGhzVG9JZ25vcmU6QXJyYXk8c3RyaW5nPiA9IFsnLmdpdCddXG4gICAgKTpJbmplY3Rpb24ge1xuICAgICAgICBjb25zdCBpbmplY3Rpb246SW5qZWN0aW9uID0gSGVscGVyLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgIHRydWUsIHt9LCBnaXZlbkluamVjdGlvbilcbiAgICAgICAgY29uc3QgbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlOkFycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgICAgICAgICBtb2R1bGVzVG9FeGNsdWRlLCBtb2R1bGVBbGlhc2VzLCBrbm93bkV4dGVuc2lvbnMsIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgcGF0aHNUb0lnbm9yZVxuICAgICAgICAgICAgKS5maWxlUGF0aHNcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2ludGVybmFsJywgJ2V4dGVybmFsJ10pXG4gICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBjdXJseSAqL1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmplY3Rpb25bdHlwZV0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGluamVjdGlvblt0eXBlXSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdID09PSAnX19hdXRvX18nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmplY3Rpb25bdHlwZV1bY2h1bmtOYW1lXSA9IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVzOntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBba2V5OnN0cmluZ106c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gSGVscGVyLmdldEF1dG9DaHVuayhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zLCBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ViQ2h1bmtOYW1lOnN0cmluZyBpbiBtb2R1bGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtb2R1bGVzLmhhc093blByb3BlcnR5KHN1YkNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXVtjaHVua05hbWVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVzW3N1YkNodW5rTmFtZV0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5qZWN0aW9uW3R5cGVdID09PSAnX19hdXRvX18nKVxuICAgICAgICAgICAgLyogZXNsaW50LWVuYWJsZSBjdXJseSAqL1xuICAgICAgICAgICAgICAgIGluamVjdGlvblt0eXBlXSA9IEhlbHBlci5nZXRBdXRvQ2h1bmsoXG4gICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnMsIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZSwgY29udGV4dClcbiAgICAgICAgcmV0dXJuIGluamVjdGlvblxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGFsbCBtb2R1bGUgZmlsZSBwYXRocy5cbiAgICAgKiBAcGFyYW0gYnVpbGRDb25maWd1cmF0aW9ucyAtIFJlc29sdmVkIGJ1aWxkIGNvbmZpZ3VyYXRpb24uXG4gICAgICogQHBhcmFtIG1vZHVsZUZpbGVQYXRoc1RvRXhjbHVkZSAtIEEgbGlzdCBvZiBtb2R1bGVzIGZpbGUgcGF0aHMgdG9cbiAgICAgKiBleGNsdWRlIChzcGVjaWZpZWQgYnkgcGF0aCBvciBpZCkgb3IgYSBtYXBwaW5nIGZyb20gY2h1bmsgbmFtZXMgdG9cbiAgICAgKiBtb2R1bGUgaWRzLlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gRmlsZSBwYXRoIHRvIHVzZSBhcyBzdGFydGluZyBwb2ludC5cbiAgICAgKiBAcmV0dXJucyBBbGwgZGV0ZXJtaW5lZCBtb2R1bGUgZmlsZSBwYXRocy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0QXV0b0NodW5rKFxuICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25zOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uLFxuICAgICAgICBtb2R1bGVGaWxlUGF0aHNUb0V4Y2x1ZGU6QXJyYXk8c3RyaW5nPiwgY29udGV4dDpzdHJpbmdcbiAgICApOntba2V5OnN0cmluZ106c3RyaW5nfSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdDp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7fVxuICAgICAgICBjb25zdCBpbmplY3RlZEJhc2VOYW1lczp7W2tleTpzdHJpbmddOkFycmF5PHN0cmluZz59ID0ge31cbiAgICAgICAgZm9yIChcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbjpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbkl0ZW0gb2ZcbiAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbnNcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAoIWluamVjdGVkQmFzZU5hbWVzW2J1aWxkQ29uZmlndXJhdGlvbi5vdXRwdXRFeHRlbnNpb25dKVxuICAgICAgICAgICAgICAgIGluamVjdGVkQmFzZU5hbWVzW1xuICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb24ub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgXSA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUZpbGVQYXRoOnN0cmluZyBvZiBidWlsZENvbmZpZ3VyYXRpb24uZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgIGlmICghbW9kdWxlRmlsZVBhdGhzVG9FeGNsdWRlLmluY2x1ZGVzKG1vZHVsZUZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXNlTmFtZTpzdHJpbmcgPSBwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGgsIGAuJHtidWlsZENvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ufWApXG4gICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICBFbnN1cmUgdGhhdCBlYWNoIG91dHB1dCB0eXBlIGhhcyBvbmx5IG9uZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWluamVjdGVkQmFzZU5hbWVzW1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICBdLmluY2x1ZGVzKGJhc2VOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBFbnN1cmUgdGhhdCBpZiBzYW1lIGJhc2VuYW1lcyBhbmQgZGlmZmVyZW50IG91dHB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVzIGNhbiBiZSBkaXN0aW5ndWlzaGVkIGJ5IHRoZWlyIGV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChKYXZhU2NyaXB0LU1vZHVsZXMgcmVtYWlucyB3aXRob3V0IGV4dGVuc2lvbiBzaW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZXkgd2lsbCBiZSBoYW5kbGVkIGZpcnN0IGJlY2F1c2UgdGhlIGJ1aWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbnMgYXJlIGV4cGVjdGVkIHRvIGJlIHNvcnRlZCBpbiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCkuXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdFtiYXNlTmFtZV0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3BhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsIG1vZHVsZUZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKV0gPSBtb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtiYXNlTmFtZV0gPSBtb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0ZWRCYXNlTmFtZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uLm91dHB1dEV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgXS5wdXNoKGJhc2VOYW1lKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBhIGNvbmNyZXRlIGZpbGUgcGF0aCBmb3IgZ2l2ZW4gbW9kdWxlIGlkLlxuICAgICAqIEBwYXJhbSBtb2R1bGVJRCAtIE1vZHVsZSBpZCB0byBkZXRlcm1pbmUuXG4gICAgICogQHBhcmFtIG1vZHVsZUFsaWFzZXMgLSBNYXBwaW5nIG9mIGFsaWFzZXMgdG8gdGFrZSBpbnRvIGFjY291bnQuXG4gICAgICogQHBhcmFtIGtub3duRXh0ZW5zaW9ucyAtIExpc3Qgb2Yga25vd24gZXh0ZW5zaW9ucy5cbiAgICAgKiBAcGFyYW0gY29udGV4dCAtIEZpbGUgcGF0aCB0byBkZXRlcm1pbmUgcmVsYXRpdmUgdG8uXG4gICAgICogQHBhcmFtIHJlbGF0aXZlTW9kdWxlRmlsZVBhdGhzIC0gTGlzdCBvZiByZWxhdGl2ZSBmaWxlIHBhdGggdG8gc2VhcmNoXG4gICAgICogZm9yIG1vZHVsZXMgaW4uXG4gICAgICogQHBhcmFtIHBhY2thZ2VFbnRyeUZpbGVOYW1lcyAtIExpc3Qgb2YgcGFja2FnZSBlbnRyeSBmaWxlIG5hbWVzIHRvXG4gICAgICogc2VhcmNoIGZvci4gVGhlIG1hZ2ljIG5hbWUgXCJfX3BhY2thZ2VfX1wiIHdpbGwgc2VhcmNoIGZvciBhbiBhcHByZWNpYXRlXG4gICAgICogZW50cnkgaW4gYSBcInBhY2thZ2UuanNvblwiIGZpbGUuXG4gICAgICogQHJldHVybnMgRmlsZSBwYXRoIG9yIGdpdmVuIG1vZHVsZSBpZCBpZiBkZXRlcm1pbmF0aW9ucyBoYXMgZmFpbGVkIG9yXG4gICAgICogd2Fzbid0IG5lY2Vzc2FyeS5cbiAgICAgKi9cbiAgICBzdGF0aWMgZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgIG1vZHVsZUlEOnN0cmluZywgbW9kdWxlQWxpYXNlczpQbGFpbk9iamVjdCA9IHt9LFxuICAgICAgICBrbm93bkV4dGVuc2lvbnM6QXJyYXk8c3RyaW5nPiA9IFsnLmpzJ10sIGNvbnRleHQ6c3RyaW5nID0gJy4vJyxcbiAgICAgICAgcmVsYXRpdmVNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9IFsnJywgJ25vZGVfbW9kdWxlcycsICcuLi8nXSxcbiAgICAgICAgcGFja2FnZUVudHJ5RmlsZU5hbWVzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnX19wYWNrYWdlX18nLCAnJywgJ2luZGV4JywgJ21haW4nXVxuICAgICk6c3RyaW5nIHtcbiAgICAgICAgbW9kdWxlSUQgPSBIZWxwZXIuYXBwbHlBbGlhc2VzKG1vZHVsZUlELCBtb2R1bGVBbGlhc2VzKVxuICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZUxvY2F0aW9uOnN0cmluZyBvZiByZWxhdGl2ZU1vZHVsZUZpbGVQYXRocylcbiAgICAgICAgICAgIGZvciAobGV0IGZpbGVOYW1lOnN0cmluZyBvZiBwYWNrYWdlRW50cnlGaWxlTmFtZXMpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBleHRlbnNpb246c3RyaW5nIG9mIGtub3duRXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kdWxlRmlsZVBhdGg6c3RyaW5nID0gbW9kdWxlSURcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtb2R1bGVGaWxlUGF0aC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LCBtb2R1bGVMb2NhdGlvbiwgbW9kdWxlRmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlTmFtZSA9PT0gJ19fcGFja2FnZV9fJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5zdGF0U3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aFRvUGFja2FnZUpTT046c3RyaW5nID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlRmlsZVBhdGgsICdwYWNrYWdlLmpzb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5zdGF0U3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhUb1BhY2thZ2VKU09OXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFRvUGFja2FnZUpTT04sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmLTgnfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxDb25maWd1cmF0aW9uLm1haW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUgPSBsb2NhbENvbmZpZ3VyYXRpb24ubWFpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUgPT09ICdfX3BhY2thZ2VfXycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVGaWxlUGF0aCA9IHBhdGguam9pbihtb2R1bGVGaWxlUGF0aCwgZmlsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgIG1vZHVsZUZpbGVQYXRoICs9IGV4dGVuc2lvblxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVTeXN0ZW0uc3RhdFN5bmMobW9kdWxlRmlsZVBhdGgpLmlzRmlsZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2R1bGVGaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiBtb2R1bGVJRFxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGEgY29uY3JldGUgZmlsZSBwYXRoIGZvciBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICogQHBhcmFtIG1vZHVsZUlEIC0gTW9kdWxlIGlkIHRvIGRldGVybWluZS5cbiAgICAgKiBAcGFyYW0gYWxpYXNlcyAtIE1hcHBpbmcgb2YgYWxpYXNlcyB0byB0YWtlIGludG8gYWNjb3VudC5cbiAgICAgKiBAcmV0dXJucyBUaGUgYWxpYXMgYXBwbGllZCBnaXZlbiBtb2R1bGUgaWQuXG4gICAgICovXG4gICAgc3RhdGljIGFwcGx5QWxpYXNlcyhtb2R1bGVJRDpzdHJpbmcsIGFsaWFzZXM6UGxhaW5PYmplY3QpOnN0cmluZyB7XG4gICAgICAgIGZvciAoY29uc3QgYWxpYXM6c3RyaW5nIGluIGFsaWFzZXMpXG4gICAgICAgICAgICBpZiAoYWxpYXMuZW5kc1dpdGgoJyQnKSkge1xuICAgICAgICAgICAgICAgIGlmIChtb2R1bGVJRCA9PT0gYWxpYXMuc3Vic3RyaW5nKDAsIGFsaWFzLmxlbmd0aCAtIDEpKVxuICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IGFsaWFzZXNbYWxpYXNdXG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBtb2R1bGVJRCA9IG1vZHVsZUlELnJlcGxhY2UoYWxpYXMsIGFsaWFzZXNbYWxpYXNdKVxuICAgICAgICByZXR1cm4gbW9kdWxlSURcbiAgICB9XG59XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19