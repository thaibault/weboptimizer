#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
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
import {ChildProcess} from 'child_process'
import * as fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import type {
    BuildConfiguration, EvaluationFunction, GetterFunction, Injection,
    InternalInjection, NormalizedInternalInjection, Paths, PlainObject,
    ResolvedBuildConfiguration, ResolvedBuildConfigurationItem, SetterFunction,
    TraverseFilesCallbackFunction
} from './type'
// endregion
// region declarations
// NOTE: This declaration isn't needed if flow knows javaScript's native
// "Proxy" in future.
declare class Proxy {
    constructor(object:any, handler:Object):any
}
// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
export default class Helper {
    static specialRegexSequences:Array<string> = [
        '-', '[', ']', '(', ')', '^', '$', '*', '+', '.', '{', '}'];
    // region boolean
    /**
     * Checks weather one of the given pattern matches given string.
     * @param target - Target to check in pattern for.
     * @param pattern - List of pattern to check for.
     * @returns Value "true" if given object is matches by at leas one of the
     * given pattern and "false" otherwise.
     */
    static isAnyMatching(target:string, pattern:Array<string|RegExp>):boolean {
        for (const currentPattern:RegExp|string of pattern)
            if (typeof currentPattern === 'string') {
                if (currentPattern === target)
                    return true
            } else if (currentPattern.test(target))
                return true
        return false
    }
    /**
     * Checks weather given object is a plain native object.
     * @param object - Object to check.
     * @returns Value "true" if given object is a plain javaScript object and
     * "false" otherwise.
     */
    static isPlainObject(object:mixed):boolean {
        return (
            typeof object === 'object' && object !== null &&
            Object.getPrototypeOf(object) === Object.prototype)
    }
    /**
     * Checks weather given object is a function.
     * @param object - Object to check.
     * @returns Value "true" if given object is a function and "false"
     * otherwise.
     */
    static isFunction(object:mixed):boolean {
        return Boolean(object) && {}.toString.call(
            object
        ) === '[object Function]'
    }
    /**
     * Determines whether given file path is within given list of file
     * locations.
     * @param filePath - Path to file to check.
     * @param locationsToCheck - Locations to take into account.
     * @returns Value "true" if given file path is within one of given
     * locations or "false" otherwise.
     */
    static isFilePathInLocation(
        filePath:string, locationsToCheck:Array<string>
    ):boolean {
        for (const pathToCheck:string of locationsToCheck)
            if (path.resolve(filePath).startsWith(path.resolve(pathToCheck)))
                return true
        return false
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
    static convertCircularObjectToJSON(
        object:Object, determineCicularReferenceValue:((
            key:string, value:any, seendObjects:Array<any>
        ) => any) = ():string => '__circularReference__',
        numberOfSpaces:number = 0
    ):string {
        const seenObjects:Array<any> = []
        return JSON.stringify(object, (key:string, value:any):any => {
            if (typeof value === 'object' && value !== null) {
                if (seenObjects.includes(value))
                    return determineCicularReferenceValue(
                        key, value, seenObjects)
                seenObjects.push(value)
                return value
            }
            return value
        }, numberOfSpaces)
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
    static parseEncodedObject(
        serializedObject:string, scope:Object = {}, name:string = 'scope'
    ):?PlainObject {
        if (!serializedObject.startsWith('{'))
            serializedObject = Buffer.from(
                serializedObject, 'base64'
            ).toString('utf8')
        try {
            // IgnoreTypeCheck
            return new Function(name, `return ${serializedObject}`)(scope)
        } catch (error) {}
        return null
    }
    /**
     * Replaces given pattern in each value in given object recursively with
     * given string replacement.
     * @param object - Object to convert substrings in.
     * @param pattern - Regular expression to replace.
     * @param replacement - String to use as replacement for found patterns.
     * @returns Converted object with replaced patterns.
     */
    static convertSubstringInPlainObject(
        object:PlainObject, pattern:RegExp, replacement:string
    ):PlainObject {
        for (const key:string in object)
            if (object.hasOwnProperty(key))
                if (Helper.isPlainObject(object[key]))
                    object[key] = Helper.convertSubstringInPlainObject(
                        object[key], pattern, replacement)
                else if (typeof object[key] === 'string')
                    object[key] = object[key].replace(pattern, replacement)
        return object
    }
    /**
     * Extends given target object with given sources object. As target and
     * sources many expandable types are allowed but target and sources have to
     * to come from the same type.
     * @param targetOrDeepIndicator - Maybe the target or deep indicator.
     * @param _targetAndOrSources - Target and at least one source object.
     * @returns Returns given target extended with all given sources.
     */
    static extendObject(
        targetOrDeepIndicator:boolean|any, ..._targetAndOrSources:Array<any>
    ):any {
        let index:number = 1
        let deep:boolean = false
        let target:mixed
        if (typeof targetOrDeepIndicator === 'boolean') {
            // Handle a deep copy situation and skip deep indicator and target.
            deep = targetOrDeepIndicator
            target = arguments[index]
            index = 2
        } else
            target = targetOrDeepIndicator
        const mergeValue = (key:string, value:any, targetValue:any):any => {
            if (value === targetValue)
                return targetValue
            // Recurse if we're merging plain objects or maps.
            if (deep && value && (
                Helper.isPlainObject(value) || value instanceof Map
            )) {
                let clone:any
                if (value instanceof Map)
                    clone = targetValue && (
                        targetValue instanceof Map
                    ) ? targetValue : new Map()
                else
                    clone = targetValue && Helper.isPlainObject(
                        targetValue
                    ) ? targetValue : {}
                return Helper.extendObject(deep, clone, value)
            }
            return value
        }
        while (index < arguments.length) {
            const source:any = arguments[index]
            let targetType:string = typeof target
            let sourceType:string = typeof source
            if (target instanceof Map)
                targetType += ' Map'
            if (source instanceof Map)
                sourceType += ' Map'
            if (targetType === sourceType && target !== source)
                if (target instanceof Map && source instanceof Map)
                    for (const [key:string, value:any] of source)
                        target.set(key, mergeValue(key, value, target.get(
                            key)))
                else if (Helper.isPlainObject(target) && Helper.isPlainObject(
                    source
                )) {
                    for (const key:string in source)
                        if (source.hasOwnProperty(key))
                            target[key] = mergeValue(
                                key, source[key], target[key])
                } else
                    target = source
            else
                target = source
            index += 1
        }
        return target
    }
    /**
     * Removes a proxies from given data structure recursivley.
     * @param object - Object to proxy.
     * @param seenObjects - Tracks all already processed obejcts to avoid
     * endless loops (usually only needed for internal prupose).
     * @returns Returns given object unwrapped from a dynamic proxy.
     */
    static unwrapProxy(object:any, seenObjects:Array<any> = []):any {
        if (object !== null && typeof object === 'object') {
            while (object.__target__)
                object = object.__target__
            const index:number = seenObjects.indexOf(object)
            if (index !== -1)
                return seenObjects[index]
            seenObjects.push(object)
            if (Array.isArray(object)) {
                let index:number = 0
                for (const value:mixed of object) {
                    object[index] = Helper.unwrapProxy(value, seenObjects)
                    index += 1
                }
            } else if (object instanceof Map)
                for (const [key:mixed, value:mixed] of object)
                    object.set(key, Helper.unwrapProxy(value, seenObjects))
            else
                for (const key:string in object)
                    if (object.hasOwnProperty(key))
                        object[key] = Helper.unwrapProxy(
                            object[key], seenObjects)
        }
        return object
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
    static addDynamicGetterAndSetter<Value>(
        object:Value, getterWrapper:GetterFunction = (value:any):any => value,
        setterWrapper:SetterFunction = (key:any, value:any):any => value,
        getterMethodName:string = '[]', setterMethodName:string = '[]',
        containesMethodName:string = 'hasOwnProperty', deep:boolean = true,
        typesToExtend:Array<mixed> = [Object]
    ):Value {
        if (deep)
            if (object instanceof Map)
                for (const [key:mixed, value:mixed] of object)
                    object.set(key, Helper.addDynamicGetterAndSetter(
                        value, getterWrapper, setterWrapper, getterMethodName,
                        setterMethodName, containesMethodName, deep,
                        typesToExtend))
            else if (typeof object === 'object' && object !== null) {
                for (const key:string in object)
                    if (object.hasOwnProperty(key))
                        object[key] = Helper.addDynamicGetterAndSetter(
                            object[key], getterWrapper, setterWrapper,
                            getterMethodName, setterMethodName,
                            containesMethodName, deep, typesToExtend)
            } else if (Array.isArray(object)) {
                let index:number = 0
                for (const value:mixed of object) {
                    object[index] = Helper.addDynamicGetterAndSetter(
                        value, getterWrapper, setterWrapper, getterMethodName,
                        setterMethodName, containesMethodName, deep,
                        typesToExtend)
                    index += 1
                }
            }
        for (const type:mixed of typesToExtend)
            if (object instanceof type) {
                if (object.__target__)
                    return object
                const handler:{
                    has?:(target:Object, name:string) => boolean;
                    get?:(target:Object, name:string) => any;
                    set?:(target:Object, name:string) => any
                } = {}
                if (containesMethodName)
                    handler.has = (target:Object, name:string):boolean => {
                        if (containesMethodName === '[]')
                            return name in target
                        return target[containesMethodName](name)
                    }
                if (containesMethodName && getterMethodName)
                    handler.get = (target:Object, name:string):any => {
                        if (name === '__target__')
                            return target
                        if (typeof target[name] === 'function')
                            return target[name].bind(target)
                        if (target[containesMethodName](name)) {
                            if (getterMethodName === '[]')
                                return getterWrapper(target[name])
                            return getterWrapper(target[getterMethodName](
                                name))
                        }
                        return target[name]
                    }
                if (setterMethodName)
                    handler.set = (
                        target:Object, name:string, value:any
                    ):void => {
                        if (setterMethodName === '[]')
                            target[name] = setterWrapper(name, value)
                        else
                            target[setterMethodName](name, setterWrapper(
                                name, value))
                    }
                return new Proxy(object, handler)
            }
        return object
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
    static resolveDynamicDataStructure(
        object:any, configuration:?PlainObject = null, deep:boolean = true,
        evaluationIndicatorKey:string = '__evaluate__',
        executionIndicatorKey:string = '__execute__',
        configurationKeyName:string = 'self'
    ):any {
        if (object === null || typeof object !== 'object')
            return object
        if (configuration === null)
            configuration = object
        if (deep && configuration && !configuration.__target__)
            configuration = Helper.addDynamicGetterAndSetter(
                configuration, ((value:any):any =>
                    Helper.resolveDynamicDataStructure(
                        value, configuration, false, evaluationIndicatorKey,
                        executionIndicatorKey, configurationKeyName)
                ), (key:any, value:any):any => value, '[]', '')
        if (Array.isArray(object) && deep) {
            let index:number = 0
            for (const value:mixed of object) {
                object[index] = Helper.resolveDynamicDataStructure(
                    value, configuration, deep, evaluationIndicatorKey,
                    executionIndicatorKey, configurationKeyName)
                index += 1
            }
        } else
            for (const key:string in object)
                if (object.hasOwnProperty(key))
                    if ([
                        evaluationIndicatorKey, executionIndicatorKey
                    ].includes(key))
                        try {
                            const evaluationFunction:EvaluationFunction =
                                new Function(
                                    configurationKeyName, 'webOptimizerPath',
                                    'currentPath', 'path', 'helper', ((
                                        key === evaluationIndicatorKey
                                    ) ? 'return ' : '') + object[key])
                            return Helper.resolveDynamicDataStructure(
                                evaluationFunction(
                                    configuration, __dirname, process.cwd(),
                                    path, Helper
                                ), configuration, false,
                                evaluationIndicatorKey,
                                executionIndicatorKey,
                                configurationKeyName)
                        } catch (error) {
                            throw Error(
                                'Error during ' + (
                                    key === evaluationIndicatorKey ?
                                        'executing' : 'evaluating'
                                ) + ` "${object[key]}": ${error}`)
                        }
                    else if (deep)
                        object[key] = Helper.resolveDynamicDataStructure(
                            object[key], configuration, deep,
                            evaluationIndicatorKey, executionIndicatorKey,
                            configurationKeyName)
        return object
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
    static convertToValidRegularExpressionString(
        value:string, excludeSymbols:Array<string> = []
    ):string {
        // NOTE: This is only for performance improvements.
        if (value.length === 1 && !Helper.specialRegexSequences.includes(
            value
        ))
            return value
        // The escape sequence must also be escaped; but at first.
        if (!excludeSymbols.includes('\\'))
            value.replace(/\\/g, '\\\\')
        for (const replace:string of Helper.specialRegexSequences)
            if (!excludeSymbols.includes(replace))
                value = value.replace(
                    new RegExp(`\\${replace}`, 'g'), `\\${replace}`)
        return value
    }
    /**
     * Translates given name into a valid javaScript one.
     * @param name - Name to convert.
     * @param allowedSymbols - String of symbols which should be allowed within
     * a variable name (not the first character).
     * @returns Converted name is returned.
     */
    static convertToValidVariableName(
        name:string, allowedSymbols:string = '0-9a-zA-Z_$'
    ):string {
        return name.toString().replace(/^[^a-zA-Z_$]+/, '').replace(
            new RegExp(`[^${allowedSymbols}]+([a-zA-Z0-9])`, 'g'), (
                fullMatch:string, firstLetter:string
            ):string => firstLetter.toUpperCase())
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
    static getProcessCloseHandler(
        resolve:Function, reject:Function, reason:any = null,
        callback:Function = ():void => {}
    ):((returnCode:?number) => void) {
        let finished:boolean = false
        return (returnCode:?number):void => {
            if (!finished)
                if (typeof returnCode !== 'number' || returnCode === 0) {
                    callback()
                    resolve(reason)
                } else {
                    const error:Error = new Error(
                        `Task exited with error code ${returnCode}`)
                    // IgnoreTypeCheck
                    error.returnCode = returnCode
                    reject(error)
                }
            finished = true
        }
    }
    /**
     * Forwards given child process communication channels to corresponding
     * current process communication channels.
     * @param childProcess - Child process meta data.
     * @returns Given child process meta data.
     */
    static handleChildProcess(childProcess:ChildProcess):ChildProcess {
        childProcess.stdout.pipe(process.stdout)
        childProcess.stderr.pipe(process.stderr)
        childProcess.on('close', (returnCode:number):void => {
            if (returnCode !== 0)
                console.error(`Task exited with error code ${returnCode}`)
        })
        return childProcess
    }
    // endregion
    // region file handler
    /**
     * Checks if given path points to a valid file.
     * @param filePath - Path to file.
     * @returns A boolean which indicates file existents.
     */
    static isFileSync(filePath:string):boolean {
        try {
            fileSystem.accessSync(filePath, fileSystem.F_OK)
            return true
        } catch (error) {
            return false
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
    static walkDirectoryRecursivelySync(
        directoryPath:string, callback:TraverseFilesCallbackFunction = (
            _filePath:string, _stat:Object
        ):?boolean => true
    ):TraverseFilesCallbackFunction {
        fileSystem.readdirSync(directoryPath).forEach((
            fileName:string
        ):void => {
            const filePath:string = path.resolve(directoryPath, fileName)
            const stat:Object = fileSystem.statSync(filePath)
            if (callback(filePath, stat) !== false && stat && stat.isDirectory(
            ))
                Helper.walkDirectoryRecursivelySync(filePath, callback)
        })
        return callback
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
    static copyFileSync(sourcePath:string, targetPath:string):string {
        /*
            NOTE: If target path references a directory a new file with the
            same name will be created.
        */
        try {
            if (fileSystem.lstatSync(targetPath).isDirectory())
                targetPath = path.join(targetPath, path.basename(sourcePath))
        } catch (error) {}
        fileSystem.writeFileSync(targetPath, fileSystem.readFileSync(
            sourcePath))
        return targetPath
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
    static copyDirectoryRecursiveSync(
        sourcePath:string, targetPath:string
    ):string {
        try {
            // Check if folder needs to be created or integrated.
            if (fileSystem.lstatSync(targetPath).isDirectory())
                targetPath = path.join(targetPath, path.basename(sourcePath))
        } catch (error) {}
        fileSystem.mkdirSync(targetPath)
        Helper.walkDirectoryRecursivelySync(sourcePath, (
            currentSourcePath:string, stat:Object
        ):void => {
            const currentTargetPath:string = path.join(
                targetPath, currentSourcePath.substring(sourcePath.length))
            if (stat.isDirectory())
                fileSystem.mkdirSync(currentTargetPath)
            else
                Helper.copyFileSync(currentSourcePath, currentTargetPath)
        })
        return targetPath
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
    static determineAssetType(
        filePath:string, buildConfiguration:BuildConfiguration, paths:Paths
    ):?string {
        let result:?string = null
        for (const type:string in buildConfiguration)
            if (path.extname(
                filePath
            ) === `.${buildConfiguration[type].extension}`) {
                result = type
                break
            }
        if (!result)
            for (const type:string of ['source', 'target'])
                for (const assetType:string in paths.asset)
                    if (paths.asset[assetType].startsWith(path.join(
                        paths[type], paths.asset[assetType]
                    )))
                        return assetType
        return result
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
    static resolveBuildConfigurationFilePaths(
        configuration:BuildConfiguration, entryPath:string = './',
        pathsToIgnore:Array<string> = ['.git']
    ):ResolvedBuildConfiguration {
        const buildConfiguration:ResolvedBuildConfiguration = []
        let index:number = 0
        for (const type:string in configuration)
            if (configuration.hasOwnProperty(type)) {
                const newItem:ResolvedBuildConfigurationItem =
                    Helper.extendObject(true, {filePaths: []}, configuration[
                        type])
                Helper.walkDirectoryRecursivelySync(entryPath, ((
                    index:number,
                    buildConfigurationItem:ResolvedBuildConfigurationItem
                ):TraverseFilesCallbackFunction => (
                    filePath:string, stat:Object
                ):?boolean => {
                    if (Helper.isFilePathInLocation(filePath, pathsToIgnore))
                        return false
                    if (stat.isFile() && path.extname(filePath).substring(
                        1
                    ) === buildConfigurationItem.extension && !(new RegExp(
                        buildConfigurationItem.fileNamePattern
                    )).test(filePath))
                        buildConfigurationItem.filePaths.push(filePath)
                })(index, newItem))
                buildConfiguration.push(newItem)
                index += 1
            }
        return buildConfiguration.sort((
            first:ResolvedBuildConfigurationItem,
            second:ResolvedBuildConfigurationItem
        ):number => {
            if (first.outputExtension !== second.outputExtension) {
                if (first.outputExtension === 'js')
                    return -1
                if (second.outputExtension === 'js')
                    return 1
                return first.outputExtension < second.outputExtension ? -1 : 1
            }
            return 0
        })
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
    static determineModuleLocations(
        internalInjection:InternalInjection, moduleAliases:PlainObject = {},
        knownExtensions:Array<string> = ['.js'], context:string = './',
        referencePath:string = '', pathsToIgnore:Array<string> = ['.git'],
        relativeModuleFilePaths:Array<string> = ['', 'node_modules', '../'],
        packageEntryFileNames:Array<string> = [
            '__package__', '', 'index', 'main']
    ):{filePaths:Array<string>;directoryPaths:Array<string>} {
        const filePaths:Array<string> = []
        const directoryPaths:Array<string> = []
        const normalizedInternalInjection:NormalizedInternalInjection =
            Helper.normalizeInternalInjection(internalInjection)
        for (const chunkName:string in normalizedInternalInjection)
            if (normalizedInternalInjection.hasOwnProperty(chunkName))
                for (const moduleID:string of normalizedInternalInjection[
                    chunkName
                ]) {
                    const filePath:string = Helper.determineModuleFilePath(
                        moduleID, moduleAliases, knownExtensions, context,
                        referencePath, pathsToIgnore, relativeModuleFilePaths,
                        packageEntryFileNames)
                    filePaths.push(filePath)
                    const directoryPath:string = path.dirname(filePath)
                    if (!directoryPaths.includes(directoryPath))
                        directoryPaths.push(directoryPath)
                }
        return {filePaths, directoryPaths}
    }
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param internalInjection - Given internal injection to normalize.
     * @returns Normalized representation of given internal injection.
     */
    static normalizeInternalInjection(
        internalInjection:InternalInjection
    ):NormalizedInternalInjection {
        let result:NormalizedInternalInjection = {}
        if (internalInjection instanceof Object && Helper.isPlainObject(
            internalInjection
        )) {
            let hasContent:boolean = false
            const chunkNamesToDelete:Array<string> = []
            for (const chunkName:string in internalInjection)
                if (internalInjection.hasOwnProperty(chunkName))
                    if (Array.isArray(internalInjection[chunkName]))
                        if (internalInjection[chunkName].length > 0) {
                            hasContent = true
                            result[chunkName] = internalInjection[chunkName]
                        } else
                            chunkNamesToDelete.push(chunkName)
                    else {
                        hasContent = true
                        result[chunkName] = [internalInjection[chunkName]]
                    }
            if (hasContent)
                for (const chunkName:string of chunkNamesToDelete)
                    delete result[chunkName]
            else
                result = {index: []}
        } else if (typeof internalInjection === 'string')
            result = {index: [internalInjection]}
        else if (Array.isArray(internalInjection))
            result = {index: internalInjection}
        return result
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
    static resolveInjection(
        givenInjection:Injection,
        buildConfigurations:ResolvedBuildConfiguration,
        modulesToExclude:InternalInjection,
        moduleAliases:PlainObject = {}, knownExtensions:Array<string> = [
            '.js', '.css', '.svg', '.html'
        ], context:string = './', referencePath:string = '',
        pathsToIgnore:Array<string> = ['.git']
    ):Injection {
        const injection:Injection = Helper.extendObject(
            true, {}, givenInjection)
        const moduleFilePathsToExclude:Array<string> =
            Helper.determineModuleLocations(
                modulesToExclude, moduleAliases, knownExtensions, context,
                referencePath, pathsToIgnore
            ).filePaths
        for (const type:string of ['internal', 'external'])
            /* eslint-disable curly */
            if (typeof injection[type] === 'object') {
                for (const chunkName:string in injection[type])
                    if (injection[type][chunkName] === '__auto__') {
                        injection[type][chunkName] = []
                        const modules:{
                            [key:string]:string
                        } = Helper.getAutoChunk(
                            buildConfigurations, moduleFilePathsToExclude,
                            context)
                        for (const subChunkName:string in modules)
                            if (modules.hasOwnProperty(subChunkName))
                                injection[type][chunkName].push(
                                    modules[subChunkName])
                    }
            } else if (injection[type] === '__auto__')
            /* eslint-enable curly */
                injection[type] = Helper.getAutoChunk(
                    buildConfigurations, moduleFilePathsToExclude, context)
        return injection
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
    static getAutoChunk(
        buildConfigurations:ResolvedBuildConfiguration,
        moduleFilePathsToExclude:Array<string>, context:string
    ):{[key:string]:string} {
        const result:{[key:string]:string} = {}
        const injectedBaseNames:{[key:string]:Array<string>} = {}
        for (
            const buildConfiguration:ResolvedBuildConfigurationItem of
            buildConfigurations
        ) {
            if (!injectedBaseNames[buildConfiguration.outputExtension])
                injectedBaseNames[buildConfiguration.outputExtension] = []
            for (const moduleFilePath:string of buildConfiguration.filePaths)
                if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                    const baseName:string = path.basename(
                        moduleFilePath, `.${buildConfiguration.extension}`)
                    /*
                        Ensure that each output type has only one source
                        representation.
                    */
                    if (!injectedBaseNames[
                        buildConfiguration.outputExtension
                    ].includes(baseName)) {
                        /*
                            Ensure that if same basenames and different output
                            types can be distinguished by their extension
                            (JavaScript-Modules remains without extension since
                            they will be handled first because the build
                            configurations are expected to be sorted in this
                            context).
                        */
                        if (result[baseName])
                            result[path.relative(
                                context, moduleFilePath
                            )] = moduleFilePath
                        else
                            result[baseName] = moduleFilePath
                        injectedBaseNames[
                            buildConfiguration.outputExtension
                        ].push(baseName)
                    }
                }
        }
        return result
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
    static determineModuleFilePath(
        moduleID:string, moduleAliases:PlainObject = {},
        knownExtensions:Array<string> = ['.js'], context:string = './',
        referencePath:string = '', pathsToIgnore:Array<string> = ['.git'],
        relativeModuleFilePaths:Array<string> = ['node_modules', '../'],
        packageEntryFileNames:Array<string> = [
            '__package__', '', 'index', 'main']
    ):string {
        moduleID = Helper.applyAliases(moduleID, moduleAliases)
        if (referencePath.startsWith('/'))
            referencePath = path.relative(context, referencePath)
        for (const moduleLocation:string of [referencePath].concat(
            relativeModuleFilePaths
        ))
            for (let fileName:string of packageEntryFileNames)
                for (const extension:string of knownExtensions) {
                    let moduleFilePath:string = moduleID
                    if (!moduleFilePath.startsWith('/'))
                        moduleFilePath = path.join(
                            context, moduleLocation, moduleFilePath)
                    if (fileName === '__package__') {
                        try {
                            if (fileSystem.statSync(
                                moduleFilePath
                            ).isDirectory()) {
                                const pathToPackageJSON:string = path.join(
                                    moduleFilePath, 'package.json')
                                if (fileSystem.statSync(
                                    pathToPackageJSON
                                ).isFile()) {
                                    const localConfiguration:PlainObject =
                                        JSON.parse(fileSystem.readFileSync(
                                            pathToPackageJSON, {
                                                encoding: 'utf-8'}))
                                    if (localConfiguration.main)
                                        fileName = localConfiguration.main
                                }
                            }
                        } catch (error) {}
                        if (fileName === '__package__')
                            continue
                    }
                    moduleFilePath = path.join(moduleFilePath, fileName)
                    moduleFilePath += extension
                    if (Helper.isFilePathInLocation(
                        moduleFilePath, pathsToIgnore
                    ))
                        continue
                    try {
                        if (fileSystem.statSync(moduleFilePath).isFile())
                            return moduleFilePath
                    } catch (error) {}
                }
        return moduleID
    }
    // endregion
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @returns The alias applied given module id.
     */
    static applyAliases(moduleID:string, aliases:PlainObject):string {
        for (const alias:string in aliases)
            if (alias.endsWith('$')) {
                if (moduleID === alias.substring(0, alias.length - 1))
                    moduleID = aliases[alias]
            } else
                moduleID = moduleID.replace(alias, aliases[alias])
        return moduleID
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
