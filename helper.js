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
    BuildConfiguration, GetterFunction, SetterFunction,
    ResolvedBuildConfiguration, EvaluationFunction, Injects, Paths,
    TraverseFilesCallbackFunction, Mapping
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
    /**
     * Checks weather given object is a plain native object.
     * @param object - Object to check.
     * @returns Value "true" if given object is a plain javaScript object and
     * "false" otherwise.
     */
    static isObject(object:mixed):boolean {
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
     * Converts given plain object and all nested found objects to
     * corresponding map.
     * @param object - Object to convert to.
     * @param deep - Indicates whether to perform a recursive conversion.
     * @returns Given object as map.
     */
    static convertPlainObjectToMap<Value>(
        object:Value, deep:boolean = true
    ):Value|Mapping {
        if (typeof object === 'object' && Helper.isObject(object)) {
            const newObject:Mapping = new Map()
            for (const key:string in object)
                if (object.hasOwnProperty(key)) {
                    if (deep)
                        object[key] = Helper.convertPlainObjectToMap(
                            object[key], deep)
                    newObject.set(key, object[key])
                }
            return newObject
        }
        if (deep)
            if (Array.isArray(object)) {
                let index:number = 0
                for (const value:Object of object) {
                    object[index] = Helper.convertPlainObjectToMap(value, deep)
                    index += 1
                }
            } else if (object instanceof Map) {
                for (const [key:mixed, value:mixed] of object)
                    object.set(key, Helper.convertPlainObjectToMap(
                        value, deep))
            }
        return object
    }
    /**
     * Converts given map and all nested found maps objects to corresponding
     * object.
     * @param object - Map to convert to.
     * @param deep - Indicates whether to perform a recursive conversion.
     * @returns Given map as object.
     */
    static convertMapToPlainObject<Value>(
        object:Value, deep:boolean = true
    ):Value|Mapping {
        if (object instanceof Map) {
            const newObject:Mapping = {}
            for (let [key:any, value:mixed] of object) {
                if (deep)
                    value = Helper.convertMapToPlainObject(value, deep)
                newObject[`${key}`] = value
            }
            return newObject
        }
        if (deep)
            if (typeof object === 'object' && Helper.isObject(object)) {
                for (const key:string in object)
                    if (object.hasOwnProperty(key))
                        object[key] = Helper.convertMapToPlainObject(
                            object[key], deep)
            } else if (Array.isArray(object)) {
                let index:number = 0
                for (const value:mixed of object) {
                    object[index] = Helper.convertMapToPlainObject(value, deep)
                    index += 1
                }
            }
        return object
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
            if (typeof object === 'object' && Helper.isObject(object)) {
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
                Array.isArray(value) || Helper.isObject(value) ||
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
                    ) ? Helper.addDynamicGetterAndSetter(
                        targetValue
                    ) : Helper.addDynamicGetterAndSetter(new Map())
                else
                    clone = targetValue && Helper.isObject(
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
                    for (const [key:string, value] of source) {
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
        ):any => {}
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
     * @param buildConfigurations - Meta informations for available asset
     * types.
     * @param paths - List of paths to search if given path doesn't reference
     * a file directly.
     * @returns Determined file type or "null" of given file couldn't be
     * determined.
     */
    static determineAssetType(
        filePath:string, buildConfigurations:BuildConfiguration, paths:Paths
    ):?string {
        let result:?string = null
        for (const [type:string, buildConfiguration:{
            [key:string]:string
        }] of buildConfigurations)
            if (path.extname(
                filePath
            ) === `.${buildConfiguration.extension}`) {
                result = type
                break
            }
        if (!result)
            for (const type:string of ['source', 'target'])
                for (const [assetType:string, filePath:string] of paths.asset)
                    if (filePath.startsWith(path.join(paths[type], filePath)))
                        return assetType
        return result
    }
    /**
     * Adds a property with a stored array of all matching file paths, which
     * matches each build configuration in given entry path and converts given
     * build configuration into a sorted array were javaScript files takes
     * precedence.
     * @param configurations - Given build configurations.
     * @param entryPath - Path to analyse nested structure.
     * @param context - Path to set paths relative to and determine relative
     * ignored paths to.
     * @param pathsToIgnore - List of paths to ignore.
     * @returns Converted build configuration.
     */
    static resolveBuildConfigurationFilePaths(
        configurations:BuildConfiguration, entryPath:string = './',
        context:string = './', pathsToIgnore:Array<string> = ['.git']
    ):ResolvedBuildConfiguration {
        const buildConfigurations:Array<Object> = []
        let index:number = 0
        for (
            const [type:string, configuration:{[key:string]:string}] of
            configurations
        ) {
            buildConfigurations.push(Helper.extendObject(
                true, Helper.convertPlainObjectToMap({filePaths: [
                ]}), configuration))
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
     * @param internals - List of moduleIDs or module file paths.
     * @param knownExtensions - List of file extensions to take into account.
     * @param context - File path to resolve relative to.
     * @param pathsToIgnore - List of file path to ignore.
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */
    static determineModuleLocations(
        internals:Mapping|Array<string>,
        knownExtensions:Array<string> = ['.js'], context:string = './',
        pathsToIgnore:Array<string> = ['.git']
    ):{[key:string]:Array<string>} {
        const filePaths:Array<string> = []
        const directoryPaths:Array<string> = []
        if (internals instanceof Map) {
            const newInternals:Array<string> = []
            for (const [key:string, internal:string] of internals)
                newInternals.push(internal)
            internals = newInternals
        }
        for (const module:string of internals) {
            let filePath:string = path.resolve(
                `${module}${knownExtensions[0]}`)
            let stat:?Object
            for (const extension:string of knownExtensions) {
                filePath = path.resolve(`${module}${extension}`)
                try {
                    stat = fileSystem.statSync(filePath)
                    break
                } catch (error) {}
            }
            if (!stat)
                continue
            let pathToAdd:string
            if (stat && stat.isDirectory()) {
                pathToAdd = `${path.resolve(module)}/`
                Helper.walkDirectoryRecursivelySync(module, (
                    subFilePath:string
                ):?boolean => {
                    for (const pathToIgnore:string of pathsToIgnore)
                        if (subFilePath.startsWith(path.resolve(
                            context, pathToIgnore
                        )))
                            return false
                    filePaths.push(subFilePath)
                })
            } else {
                pathToAdd = `${path.resolve(path.dirname(module))}/`
                filePaths.push(filePath)
            }
            if (directoryPaths.indexOf(pathToAdd) === -1)
                directoryPaths.push(pathToAdd)
        }
        return Helper.convertPlainObjectToMap({filePaths, directoryPaths})
    }
    /**
     * Determines all concrete file paths for given injects which are marked
     * with the "__auto__" indicator.
     * @param givenInjects - Given internal and external injects to take into
     * account.
     * @param buildConfigurations - Resolved build configuration.
     * @param modulesToExclude - A list of modules to exclude (specified by
     * path or id) or a mapping from chunk names to module ids.
     * @param knownExtensions - File extensions to take into account.
     * @param context - File path to use as starting point.
     * @param pathsToIgnore - Paths which marks location to ignore (Relative
     * paths are resolved relatively to given context.).
     * @returns Given injects with resolved marked indicators.
     */
    static resolveInjects(
        givenInjects:Injects, buildConfigurations:ResolvedBuildConfiguration,
        modulesToExclude:Mapping|Array<string>,
        knownExtensions:Array<string> = [
            '.js', '.css', '.svg', '.html'
        ], context:string = './', pathsToIgnore:Array<string> = ['.git']
    ):Injects {
        // TODO Copy
        const injects:Injects = givenInjects
        const moduleFilePathsToExclude:Array<string> =
            Helper.determineModuleLocations(
                modulesToExclude, knownExtensions, context, pathsToIgnore
            ).filePaths
        for (const type:string of ['internal', 'external'])
            if (givenInjects[type] === '__auto__') {
                injects[type] = Helper.convertPlainObjectToMap({})
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
                                if (injects[type][baseName])
                                    injects[type][path.relative(
                                        context, moduleFilePath
                                    )] = moduleFilePath
                                else
                                    injects[type][baseName] = moduleFilePath
                                injectedBaseNames[
                                    buildConfiguration.outputExtension
                                ].push(baseName)
                            }
                        }
                }
            }
        return injects
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
        object:any, configuration:?Mapping = null, deep:boolean = true,
        evaluationIndicatorKey:string = '__execute__'
    ):any {
        if (configuration === null && typeof object === 'object')
            configuration = object
        if (configuration && !configuration.__target__)
            Helper.addDynamicGetterAndSetter(
                configuration, (value:any):any => Helper.resolveMapping(
                    value, configuration, false))
        if (object instanceof Map)
            for (const [key:string, value:mixed] of object)
                if (key === evaluationIndicatorKey) {
                    const evaluationFunction:EvaluationFunction = new Function(
                        'self', 'resolve', 'webOptimizerPath',
                        'currentPath', 'path', `return ${value}`)
                    return Helper.resolveMapping(evaluationFunction(
                        configuration, (
                            object:any,
                            subConfiguration:?Mapping = configuration,
                            deep:boolean = false,
                            subEvaluationIndicatorKey:string =
                                evaluationIndicatorKey
                        ):any => Helper.resolveMapping(
                            object, subConfiguration, deep,
                            subEvaluationIndicatorKey
                        ), __dirname, process.cwd(), path
                    ), configuration)
                } else if (deep)
                    object[key] = Helper.resolveMapping(value, configuration)
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
    static determineModulePath(
        moduleID:string, moduleAliases:{
            [key:string]:Function&string
        } = Helper.convertPlainObjectToMap({}),
        knownExtensions:Array<string> = ['.js'], context:string = './'
    ):string {
        for (const [search:string, replacement:string] of moduleAliases)
            moduleID = moduleID.replace(search, replacement)
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
                                    const localConfiguration:Mapping =
                                    Helper.convertPlainObjectToMap(
                                        JSON.parse(fileSystem.readFileSync(
                                            pathToPackageJSON, {
                                                encoding: 'utf-8'})))
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
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
