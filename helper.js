#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {ChildProcess} from 'child_process'
import * as fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import type {
    BuildConfiguration, EvaluationFunction, GetterFunction, Injection,
    InternalInjection, NormalizedInternalInjection, Paths, PlainObject,
    SetterFunction, TraverseFilesCallbackFunction
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
    // region boolean
    /**
     * Checks weather given object is a plain native object.
     * @param object - Object to check.
     * @returns Value "true" if given object is a plain javaScript object and
     * "false" otherwise.
     */
    static isPlainObject(object:mixed):boolean {
        return (
            object !== null && typeof object === 'object' &&
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
    /**
     * Extends given target object with given sources object. As target and
     * sources many expandable types are allowed but target and sources have to
     * to come from the same type.
     * @param targetOrDeepIndicator - Maybe the target or deep indicator.
     * @param ..._targetAndOrSources - Target and at least one source object.
     * @returns Returns given target extended with all given sources.
     */
    static extendObject(
        targetOrDeepIndicator:boolean|any,
        ..._targetAndOrSources:Array<any>
    ):any {
        let index:number = 1
        let deep:boolean = false
        let target:mixed
        if (typeof targetOrDeepIndicator === 'boolean') {
            // Handle a deep copy situation and skip deep indicator and target.
            deep = targetOrDeepIndicator
            target = arguments[1]
            index = 2
        } else
            target = targetOrDeepIndicator
        const mergeValue = (key:string, value:any, targetValue:any):any => {
            // Recurse if we're merging plain objects or arrays.
            if (deep && value && (
                Array.isArray(value) || Helper.isPlainObject(value) ||
                value instanceof Map
            )) {
                let clone
                if (Array.isArray(value))
                    clone = targetValue && Array.isArray(
                        targetValue
                    ) ? targetValue : []
                else if (value instanceof Map)
                    clone = targetValue && (
                        targetValue instanceof Map
                    ) ? targetValue : new Map()
                else
                    clone = targetValue && Helper.isPlainObject(
                        targetValue
                    ) ? targetValue : {}
                // Never move original objects, clone them.
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
            if (targetType !== sourceType)
                throw Error(
                    `Can't merge given target type "${targetType}" with ` +
                    `given source type "${sourceType}" (${index}. argument).`)
            // Only deal with non-null/undefined values.
            if (!(source === null || source === undefined))
                if (target instanceof Map && source instanceof Map)
                    for (const [key:string, value:any] of source) {
                        const newValue = mergeValue(
                            key, value, target.get(key))
                        // Don't bring in undefined values.
                        if (typeof newValue !== 'undefined')
                            target.set(key, newValue)
                    }
                else if (target instanceof Object && source instanceof Object)
                    for (const key:string in source)
                        if (source.hasOwnProperty(key)) {
                            const newValue = mergeValue(
                                key, source[key], target[key])
                            // Don't bring in undefined values.
                            if (typeof newValue !== 'undefined')
                                target[key] = newValue
                        }
            index += 1
        }
        return target
    }
    /**
     * Forwards given child process communication channels to corresponding
     * current process communication channels.
     * @param childProcess - Child process meta data.
     * @returns Given child process meta data.
     */
    static handleChildProcess(childProcess:ChildProcess):ChildProcess {
        childProcess.stdout.on('data', (data:string):any =>
            process.stdout.write(data))
        childProcess.stderr.on('data', (data:string):any =>
            process.stderr.write(data))
        childProcess.on('close', (returnCode:number):any => {
            if (returnCode !== 0)
                console.error(`Task exited with error code ${returnCode}`)
        })
        return childProcess
    }
    /**
     * Iterates through given directory structure recursively and calls given
     * callback for each found file. Callback gets file path and corresponding
     * stat object as argument.
     * @param directoryPath - Path to directory structure to traverse.
     * @callback callback - Function to invoke for each traversed file.
     * @returns Given callback function.
     */
    static walkDirectoryRecursivelySync(
        directoryPath:string, callback:TraverseFilesCallbackFunction = (
            _filePath:string, _stat:Object
        ):?boolean => true
    ):TraverseFilesCallbackFunction {
        fileSystem.readdirSync(directoryPath).forEach((fileName:string) => {
            const filePath:string = path.resolve(directoryPath, fileName)
            const stat:Object = fileSystem.statSync(filePath)
            if (callback(filePath, stat) !== false && stat && stat.isDirectory(
            ))
                Helper.walkDirectoryRecursivelySync(filePath, callback)
        })
        return callback
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
        filePath:string, buildConfiguration:PlainObject, paths:Paths
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
     * @param context - Path to set paths relative to and determine relative
     * ignored paths to.
     * @param pathsToIgnore - Paths which marks location to ignore (Relative
     * paths are resolved relatively to given context.).
     * @returns Converted build configuration.
     */
    static resolveBuildConfigurationFilePaths(
        configuration:PlainObject, entryPath:string = './',
        context:string = './', pathsToIgnore:Array<string> = ['.git']
    ):BuildConfiguration {
        const buildConfigurations:Array<Object> = []
        let index:number = 0
        for (const type:string in configuration) {
            buildConfigurations.push(Helper.extendObject(
                true, {filePaths: []}, configuration[type]))
            Helper.walkDirectoryRecursivelySync(entryPath, (
                filePath:string, stat:Object
            ):?boolean => {
                for (const pathToIgnore:string of pathsToIgnore)
                    if (filePath.startsWith(path.resolve(
                        context, pathToIgnore
                    )))
                        return false
                if (stat.isFile() && path.extname(filePath).substring(
                    1
                ) === buildConfigurations[
                    buildConfigurations.length - 1
                ].extension && !(new RegExp(
                    buildConfigurations[
                        buildConfigurations.length - 1
                    ].fileNamePattern
                )).test(filePath))
                    buildConfigurations[index].filePaths.push(filePath)
            })
            index += 1
        }
        return buildConfigurations.sort((
            first:{[key:string]:string}, second:{[key:string]:string}
        ):number => {
            if (first.outputExtension !== second.outputExtension) {
                if (first.outputExtension === 'js')
                    return -1
                if (second.outputExtension === 'js')
                    return 1
            }
            return 0
        })
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
    static determineModuleLocations(
        internalInjection:InternalInjection, moduleAliases:PlainObject = {},
        knownExtensions:Array<string> = ['.js'], context:string = './'
    ):{[key:string]:Array<string>} {
        const filePaths:Array<string> = []
        const directoryPaths:Array<string> = []
        const normalizedInternalInjection:NormalizedInternalInjection =
            Helper.normalizeInternalInjection(
                internalInjection)
        for (const chunkName:string in normalizedInternalInjection)
            for (const moduleID:string of normalizedInternalInjection[
                chunkName
            ]) {
                const filePath:string = Helper.determineModuleFilePath(
                    moduleID, moduleAliases, knownExtensions, context)
                filePaths.push(filePath)
                const directoryPath:string = path.dirname(filePath)
                if (directoryPaths.indexOf(directoryPath) === -1)
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
        ))
            for (const chunkName:string in internalInjection)
                if (typeof internalInjection[chunkName] === 'string')
                    result[chunkName] = [internalInjection[chunkName]]
                else
                    result[chunkName] = internalInjection[chunkName]
        else if (typeof internalInjection === 'string')
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
     * @param pathsToIgnore - Paths which marks location to ignore (Relative
     * paths are resolved relatively to given context.).
     * @returns Given injection with resolved marked indicators.
     */
    static resolveInjection(
        givenInjection:Injection, buildConfigurations:BuildConfiguration,
        modulesToExclude:InternalInjection,
        moduleAliases:PlainObject = {}, knownExtensions:Array<string> = [
            '.js', '.css', '.svg', '.html'
        ], context:string = './', pathsToIgnore:Array<string> = ['.git']
    ):Injection {
        const injection:Injection = Helper.extendObject(
            true, {}, givenInjection)
        const moduleFilePathsToExclude:Array<string> =
            Helper.determineModuleLocations(
                modulesToExclude, moduleAliases, knownExtensions, context,
                pathsToIgnore
            ).filePaths
        for (const type:string of ['internal', 'external'])
            if (givenInjection[type] === '__auto__') {
                injection[type] = {}
                const injectedBaseNames:{[key:string]:Array<string>} = {}
                for (const buildConfiguration:{
                    filePaths:Array<string>;
                    outputExtension:string;
                    extension:string
                } of buildConfigurations) {
                    if (!injectedBaseNames[buildConfiguration.outputExtension])
                        injectedBaseNames[
                            buildConfiguration.outputExtension
                        ] = []
                    for (
                        const moduleFilePath:string of
                        buildConfiguration.filePaths
                    )
                        if (moduleFilePathsToExclude.indexOf(
                            moduleFilePath
                        ) === -1) {
                            const baseName:string = path.basename(
                                moduleFilePath,
                                `.${buildConfiguration.extension}`)
                            /*
                                Ensure that each output type has only one
                                source representation.
                            */
                            if (injectedBaseNames[
                                buildConfiguration.outputExtension
                            ].indexOf(baseName) === -1) {
                                /*
                                    Ensure that if same basenames and different
                                    output types can be distinguished by their
                                    extension (JavaScript-Modules remains
                                    without extension since they will be
                                    handled first because the build
                                    configurations are expected to be sorted in
                                    this context).
                                */
                                if (injection[type][baseName])
                                    injection[type][path.relative(
                                        context, moduleFilePath
                                    )] = moduleFilePath
                                else
                                    injection[type][baseName] = moduleFilePath
                                injectedBaseNames[
                                    buildConfiguration.outputExtension
                                ].push(baseName)
                            }
                        }
                }
            }
        return injection
    }
    /**
     * Adds dynamic getter and setter to any given data structure such as maps.
     * @param object - Object to proxy.
     * @callback getterWrapper - Function to wrap each property get.
     * @callback setterWrapper - Function to wrap each property set.
     * @param typesToExtend - Types which should be extended (Checks are
     * performed via "value instanceof type".).
     * @param deep - Indicates to perform a deep wrapping of specified types.
     * performed via "value instanceof type".).
     * @param containesMethodName - Method name to indicate if a key is stored
     * in given data structure.
     * @param getterMethodName - Method name to get a stored value by key.
     * @param setterMethodName - Method name to set a stored value by key.
     * @returns Returns given object wrapped with a dynamic getter proxy.
     */
    static addDynamicGetterAndSetter<Value>(
        object:Value, getterWrapper:GetterFunction = (key:any):any => key,
        setterWrapper:SetterFunction = (key:any, value:any):any => value,
        typesToExtend:Array<mixed> = [Map], deep:boolean = true,
        containesMethodName:string = 'has', getterMethodName:string = 'get',
        setterMethodName:string = 'set',
    ):Value {
        if (deep)
            if (typeof object === 'object' && Helper.isPlainObject(object)) {
                for (const key:string in object)
                    if (object.hasOwnProperty(key))
                        object[key] = Helper.addDynamicGetterAndSetter(
                            object[key], getterWrapper, setterWrapper,
                            typesToExtend, deep, containesMethodName,
                            getterMethodName, setterMethodName)
            } else if (object instanceof Map)
                for (const [key:mixed, value:mixed] of object)
                    object.set(key, Helper.addDynamicGetterAndSetter(
                        value, getterWrapper, setterWrapper, typesToExtend,
                        deep, containesMethodName, getterMethodName,
                        setterMethodName))
            else if (Array.isArray(object)) {
                let index:number = 0
                for (const value:mixed of object) {
                    object[index] = Helper.addDynamicGetterAndSetter(
                        value, getterWrapper, setterWrapper, typesToExtend,
                        deep, containesMethodName, getterMethodName,
                        setterMethodName)
                    index += 1
                }
            }
        for (const type:mixed of typesToExtend)
            if (object instanceof type) {
                if (object.__target__)
                    return object
                return new Proxy(object, {
                    get: (target:Object, name:string):any => {
                        if (name === '__target__')
                            return target
                        if (typeof target[name] === 'function')
                            return target[name].bind(target)
                        if (target[containesMethodName](name))
                            return getterWrapper(target[getterMethodName](
                                name))
                        return target[name]
                    },
                    set: (target:Object, name:string, value:any):any =>
                        target[setterMethodName](name, setterWrapper((
                            name, value)))
                })
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
     * @returns Evaluated given mapping.
     */
    static resolveMapping(
        object:any, configuration:?PlainObject = null, deep:boolean = true,
        evaluationIndicatorKey:string = '__execute__'
    ):any {
        if (configuration === null && typeof object === 'object')
            configuration = object
        if (configuration && !configuration.__target__)
            Helper.addDynamicGetterAndSetter(
                configuration, (value:any):any => Helper.resolveMapping(
                    value, configuration, false))
        if (Helper.isPlainObject(object))
            for (const key:string in object)
                if (key === evaluationIndicatorKey) {
                    const evaluationFunction:EvaluationFunction = new Function(
                        'self', 'webOptimizerPath', 'currentPath', 'path',
                        `return ${object[key]}`)
                    return Helper.resolveMapping(evaluationFunction(
                        configuration, __dirname, process.cwd(), path
                    ), configuration)
                } else if (deep)
                    object[key] = Helper.resolveMapping(
                        object[key], configuration)
        else if (deep && Array.isArray(object)) {
            let index:number = 0
            for (const value:mixed of object) {
                object[index] = Helper.resolveMapping(value, configuration)
                index += 1
            }
        }
        return object
    }
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param moduleAliases - Mapping of aliases to take into account.
     * @param knownExtensions - List of known extensions.
     * @param context - File path to determine relative to.
     * @returns File path or given module id if determinations has failed or
     * wasn't necessary.
     */
    static determineModuleFilePath(
        moduleID:string, moduleAliases:PlainObject = {},
        knownExtensions:Array<string> = ['.js'], context:string = './'
    ):string {
        for (const search:string in moduleAliases)
            moduleID = moduleID.replace(search, moduleAliases[search])
        for (const moduleLocation:string of ['', 'node_modules', '../'])
            for (let fileName:string of ['__package__', '', 'index', 'main'])
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
                    try {
                        if (fileSystem.statSync(moduleFilePath).isFile())
                            return moduleFilePath
                    } catch (error) {}
                }
        return moduleID
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
