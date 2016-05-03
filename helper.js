#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import type {InternalInject, ExternalInject} from './type'
// endregion
// region declarations
// NOTE: This declaration isn't needed if flow knows javaScript's native
// "Proxy" in future.
declare class Proxy {
    constructor(object:any, handler:Object):any
}
declare function evaluationFunctionType(
    global:Object, self:{[key:string]:any},
    resolve:(object:any, configuration:any, direct:boolean) => any,
    webOptimizerPath:string, currentPath:string, path:typeof path
):string
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
    static extendObject(
        targetOrDeepIndicator:boolean|{[key:string]:any}
    ):{[key:string]:any} {
        let index:number = 1
        let deep:boolean = false
        let target:{[key:string]:any}
        if (typeof targetOrDeepIndicator === 'boolean') {
            // Handle a deep copy situation and skip deep indicator and target.
            deep = targetOrDeepIndicator
            target = arguments[1]
            index = 2
        } else
            target = targetOrDeepIndicator
        // TODO Use template instead of "any"
        const mergeValue = (key:string, value:any):any => {
            const targetValue = target[key]
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
            const currentObject = arguments[index]
            let targetType = typeof target
            let currentObjectType = typeof currentObject
            if (target instanceof Map)
                targetType += ' Map'
            if (currentObject instanceof Map)
                currentObjectType += ' Map'
            if (targetType !== currentObjectType)
                throw Error(
                    `Can't merge given target type "${targetType}" with ` +
                    `given source type "${currentObjectType}" (${index}. ` +
                    `argument).`)
            // Only deal with non-null/undefined values.
            if (currentObject != null)
                if (currentObject instanceof Map)
                    for (const [key, value] of currentObject) {
                        const newValue = mergeValue(key, value)
                        // Don't bring in undefined values.
                        if (typeof newValue !== 'undefined')
                            target.set(key, newValue)
                    }
                else
                    for (const key in currentObject)
                        if (currentObject.hasOwnProperty(key)) {
                            const newValue = mergeValue(
                                key, currentObject[key])
                            // Don't bring in undefined values.
                            if (typeof newValue !== 'undefined')
                                target[key] = newValue
                        }
            index += 1
        }
        return target
    }
    /**
     * Forwards given child process api to current process api.
     * @param childProcess - Child process meta data.
     * @returns Given child process meta data.
     */
    static handleChildProcess(childProcess) {
        /*
            Forwards given child process communication channels to corresponding
            current process communication channels.
        */
        childProcess.stdout.on('data', data => process.stdout.write(data))
        childProcess.stderr.on('data', data => process.stderr.write(data))
        childProcess.on('close', returnCode => {
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
     * @param callback - Function to invoke for each traversed file.
     * @returns Given callback function.
     */
    static walkDirectoryRecursivelySync(
        directoryPath:string, callback:((
            filePath:string, stat:Object
        ) => ?boolean) = (_filePath:string, _stat:Object) => {}
    ):((filePath:string, stat:Object) => ?boolean) {
        /*
            Iterates recursively through given directory structure and calls
            given callback for each found entity. If "false" is returned and
            current file is a directory deeper leaves aren't explored.
        */
        fileSystem.readdirSync(directoryPath).forEach(fileName => {
            const filePath = path.resolve(directoryPath, fileName)
            const stat = fileSystem.statSync(filePath)
            if (callback(filePath, stat) !== false && stat && stat.isDirectory(
            ))
                Helper.walkDirectoryRecursivelySync(filePath, callback)
        })
        return callback
    }
    /**
     * Determines a asset type if given file.
     * @param filePath - Path to file to analyse.
     * @param buildConfiguration - Meta informations for available asset types.
     * @param paths - List of paths to search if given path doesn't reference
     * a file directly.
     * @returns Determined file type or "null" of given file couldn't be
     * determined.
     */
    static determineAssetType(
        filePath:string, buildConfigurations, paths
    ):string|null {
        // Determines file type of given file (by path).
        let result = null
        for (const [type, buildConfiguration] of buildConfigurations)
            if (path.extname(
                filePath
            ) === `.${buildConfiguration.extension}`) {
                result = type
                break
            }
        if (!result)
            for (const type of ['source', 'target'])
                for (const [assetType, filePath] of paths.asset)
                    if (filePath.startsWith(path.join(paths[type], filePath)))
                        return assetType
        return result
    }
    static convertPlainObjectToMapRecursivly(
        object:Object, debug = false
    ):Object {
        if (Helper.isObject(object)) {
            const newObject = new Map()
            for (const key in object)
                if (object.hasOwnProperty(key))
                    newObject.set(
                        key, Helper.convertPlainObjectToMapRecursivly(
                            object[key]))
            return Helper.addDynamicGetterAndSetter(newObject)
        }
        if (Array.isArray(object)) {
            let index = 0
            for (const value of object) {
                object[index] = Helper.convertPlainObjectToMapRecursivly(value)
                index += 1
            }
        }
        return object
    }
    static convertMapToPlainObjectRecursivly(object:Object):Object {
        if (object instanceof Map) {
            const newObject = {}
            for (const [key, value] of object)
                newObject[key] = Helper.convertMapToPlainObjectRecursivly(
                    value)
            return newObject
        }
        if (Helper.isObject(object)) {
            for (const key in object)
                if (object.hasOwnProperty(key))
                    object[key] = Helper.convertMapToPlainObjectRecursivly(
                        object[key])
        } else if (Array.isArray(object)) {
            let index = 0
            for (const value of object) {
                object[index] = Helper.convertMapToPlainObjectRecursivly(value)
                index += 1
            }
        }
        return object
    }
    static addDynamicGetterAndSetter(
        object:Object, containesMethodName = 'has', getterMethodName = 'get',
        setterMethodName = 'set'
    ) {
        if (object.__target__)
            return object
        return new Proxy(object, {
            get: (target, name) => {
                if (name === '__target__')
                    return target
                if (typeof target[name] === 'function')
                    return target[name].bind(target)
                if (target[containesMethodName](name))
                    return target.get(name)
                return target[name]
            },
            set: (target, name, value) => target[setterMethodName](name, value)
        })
    }
    static resolveBuildConfigurationFilePaths(
        configurations, entryPath = './', context = './',
        pathsToIgnore = ['.git']
    ) {
        /*
            Determines all files which should be taken into account before
            using them in production. The result is a list of build
            configurations taken from current configuration object. Each
            configuration has all related files saved as property. Result is
            sorted to prefer javaScript modules.
        */
        const buildConfigurations = []
        let index = 0
        for (const [type, configuration] of configurations) {
            buildConfigurations.push(Helper.extendObject(
                true, Helper.convertPlainObjectToMapRecursivly({filePaths: [
                ]}), configuration))
            Helper.walkDirectoryRecursivelySync(entryPath, (
                filePath, stat
            ) => {
                for (const pathToIgnore of pathsToIgnore)
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
        return buildConfigurations.sort((first, second) => {
            if (first.outputExtension !== second.outputExtension) {
                if (first.outputExtension === 'js')
                    return -1
                if (second.outputExtension === 'js')
                    return 1
            }
            return 0
        })
    }
    static resolveInjects(
        givenInjects:{internal:InternalInject;external:ExternalInject},
        buildConfigurations, modulesToExclude:Array<string>,
        knownExtensions:Array<string> = [
            '.js', '.css', '.svg', '.html'
        ], context:string = './', pathsToIgnore:Array<string> = ['.git']
    ):{internal:InternalInject;external:ExternalInject} {
        // Determines all injects for current build.
        const injects = Helper.extendObject(
            true, Helper.convertPlainObjectToMapRecursivly({}), givenInjects)
        const moduleFilePathsToExclude = Helper.determineModuleLocations(
            modulesToExclude, knownExtensions, context, pathsToIgnore
        ).filePaths
        for (const type of ['internal', 'external'])
            if (givenInjects[type] === '__auto__') {
                injects[type] = Helper.convertPlainObjectToMapRecursivly({})
                const injectedBaseNames = {}
                for (const buildConfiguration of buildConfigurations) {
                    if (!injectedBaseNames[buildConfiguration.outputExtension])
                        injectedBaseNames[
                            buildConfiguration.outputExtension
                        ] = []
                    for (const moduleFilePath of buildConfiguration.filePaths)
                        if (moduleFilePathsToExclude.indexOf(
                            moduleFilePath
                        ) === -1) {
                            const baseName = path.basename(
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
    static determineModulePath(
        moduleID, moduleAliases = Helper.convertPlainObjectToMapRecursivly({}),
        knownExtensions = ['.js'], context = './'
    ) {
        // Determines a module path for given module id synchronously.
        for (const [search, replacement] of moduleAliases)
            moduleID = moduleID.replace(search, replacement)
        for (const moduleLocation of ['', 'node_modules', '../'])
            for (let fileName of [null, '', 'index', 'main'])
                for (const extension of knownExtensions) {
                    let moduleFilePath = moduleID
                    if (!moduleFilePath.startsWith('/'))
                        moduleFilePath = path.join(
                            context, moduleLocation, moduleFilePath)
                    if (fileName === null) {
                        try {
                            if (fileSystem.statSync(
                                moduleFilePath
                            ).isDirectory()) {
                                const pathToPackageJSON = path.join(
                                    moduleFilePath, 'package.json')
                                if (fileSystem.statSync(
                                    pathToPackageJSON
                                ).isFile()) {
                                    const localConfiguration =
                                    Helper.convertPlainObjectToMapRecursivly(
                                        JSON.parse(
                                            fileSystem.readFileSync(
                                                pathToPackageJSON, {
                                                    encoding: 'utf-8'})))
                                    if (localConfiguration.main)
                                        fileName = localConfiguration.main
                                }
                            }
                        } catch (error) {}
                        if (!fileName)
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
    static isFilePathInLocation(filePath, locationsToCheck) {
        // Returns "true" if given location is within given locations to
        // include.
        for (const pathToCheck of locationsToCheck)
            if (path.resolve(filePath).startsWith(path.resolve(pathToCheck)))
                return true
        return false
    }
    static resolve(
        object:any, configuration:any = null, direct:boolean = false
    ):any {
        // Processes all dynamically linked values in given object.
        if (!configuration)
            configuration = object
        if (!configuration.__initialized__) {
            configuration.__initialized__ = true
            const addProxy = object => {
                if (Array.isArray(object)) {
                    let index = 0
                    for (const value of object) {
                        object[index] = addProxy(value)
                        index += 1
                    }
                } else if (object instanceof Map) {
                    for (const [key, value] of object)
                        object[key] = addProxy(value)
                    return new Proxy(object, {get: (target, name) => {
                        if (name === '__target__')
                            return target
                        if (typeof target[name] === 'function')
                            return target[name].bind(target)
                        if (target.has(name)) {
                            target.set(name, Helper.resolve(target.get(
                                name
                            ), configuration, true))
                            return target.get(name)
                        }
                        return target[name]
                    }})
                }
                return object
            }
            addProxy(configuration)
        }
        if (object instanceof Map)
            for (const [key, value] of object) {
                if (key === '__execute__') {
                    const evaluationFunction:evaluationFunctionType =
                    new Function(
                        'global', 'self', 'resolve', 'webOptimizerPath',
                        'currentPath', 'path', `return ${value}`)
                    return Helper.resolve(evaluationFunction(
                        global, configuration, (
                            propertyName, subConfiguration = configuration,
                            subInitial = false
                        ) => Helper.resolve(
                            propertyName, subConfiguration, subInitial
                        ), __dirname, process.cwd(), path
                    ), configuration)
                } else if (!direct)
                    object[key] = Helper.resolve(value, configuration)
            }
        else if (!direct && Array.isArray(object)) {
            let index = 0
            for (const value of object) {
                object[index] = Helper.resolve(value, configuration)
                index += 1
            }
        }
        return object
    }
    static determineModuleLocations(
        internals, knownExtensions = ['.js'], context = './',
        pathsToIgnore = ['.git']
    ):{[key:string]:Array<string>} {
        // Determines all script modules to use as internal injects.
        const filePaths = []
        const directoryPaths = []
        if (internals instanceof Map) {
            const newInternals = []
            for (const [key, internal] of internals)
                newInternals.push(internal)
            internals = newInternals
        }
        for (const module of internals) {
            let filePath = path.resolve(`${module}${knownExtensions[0]}`)
            let stat
            for (const extension of knownExtensions) {
                filePath = path.resolve(`${module}${extension}`)
                try {
                    stat = fileSystem.statSync(filePath)
                    break
                } catch (error) {}
            }
            if (!stat)
                continue
            let pathToAdd
            if (stat.isDirectory()) {
                pathToAdd = `${path.resolve(module)}/`
                Helper.walkDirectoryRecursivelySync(module, subFilePath => {
                    for (const pathToIgnore of pathsToIgnore)
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
        return Helper.convertPlainObjectToMapRecursivly({
            filePaths, directoryPaths})
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
