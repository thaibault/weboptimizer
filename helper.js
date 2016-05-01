#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
import * as fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
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
            global.Object.getPrototypeOf(object) === global.Object.prototype)
    }
    /**
     * Checks weather given object is a function.
     * @param object - Object to check.
     * @returns Value "true" if given object is a function and "false"
     * otherwise.
     */
    static isFunction(object:mixed):boolean {
        return !!object && {}.toString.call(object) === '[object Function]'
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
        directoryPath:string, callback:Function = (/* filePath, stat */) => {}
    ):Function {
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
        filePath:string, buildConfiguration, paths
    ):string|null {
        // Determines file type of given file (by path).
        let result = null
        global.Object.keys(buildConfiguration).forEach(type => {
            if (path.extname(
                filePath
            ) === `.${buildConfiguration[type].extension}`) {
                result = type
                return false
            }
        })
        if (!result)
            for (let type of ['source', 'target'])
                for (let assetType in paths.asset)
                    if (filePath.startsWith(path.join(
                        paths[type], paths.asset[assetType]
                    )))
                        return assetType
        return result
    }
    static resolveBuildConfigurationFilePaths(
        configuration, entryPath = './', context = './',
        pathsToIgnore = ['.git']
    ) {
        /*
            Determines all files which should be taken into account before
            using them in production. The result is a list of build
            configurations taken from current configuration object. Each
            configuration has all related files saved as property. Result is
            sorted to prefer javaScript modules.
        */
        let buildConfigurations = []
        let index = 0
        global.Object.keys(configuration).forEach(type => {
            buildConfigurations.push(extend(
                true, {filePaths: []}, configuration[type]))
            Helper.walkDirectoryRecursivelySync(entryPath, (
                filePath, stat
            ) => {
                for (let pathToIgnore of pathsToIgnore)
                    if (filePath.startsWith(path.resolve(
                        context, pathToIgnore
                    )))
                        return false
                if (stat.isFile() && path.extname(filePath).substring(
                    1
                ) === buildConfigurations[
                    buildConfigurations.length - 1
                ].extension && !(new global.RegExp(
                    buildConfigurations[
                        buildConfigurations.length - 1
                    ].fileNamePattern
                )).test(filePath))
                    buildConfigurations[index].filePaths.push(filePath)
            })
            index += 1
        })
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
        givenInjects, buildConfiguration, modulesToExclude, knownExtensions = [
            '.js', '.css', '.svg', '.html'
        ], context = './', pathsToIgnore = ['.git']
    ) {
        // Determines all injects for current build.
        let injects = extend(true, {}, givenInjects)
        const moduleFilePathsToExclude = Helper.determineModuleLocations(
            modulesToExclude, knownExtensions, context, pathsToIgnore
        ).filePaths
        for (let type of ['internal', 'external'])
            if (givenInjects[type] === '__auto__') {
                injects[type] = {}
                let injectedBaseNames = {}
                for (let buildConfiguration of buildConfiguration) {
                    if (!injectedBaseNames[buildConfiguration.outputExtension])
                        injectedBaseNames[
                            buildConfiguration.outputExtension
                        ] = []
                    for (let moduleFilePath of buildConfiguration.filePaths)
                        if (moduleFilePathsToExclude.indexOf(
                            moduleFilePath
                        ) === -1) {
                            let baseName = path.basename(
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
        moduleID, moduleAliases = {}, knownExtensions = ['.js'], context = './'
    ) {
        // Determines a module path for given module id synchronously.
        global.Object.keys(moduleAliases).forEach(search => {
            moduleID = moduleID.replace(search, moduleAliases[search])
        })
        for (let moduleLocation of ['', 'node_modules', '../'])
            for (let fileName of [null, '', 'index', 'main'])
                for (let extension of knownExtensions) {
                    let moduleFilePath = moduleID
                    if (!moduleFilePath.startsWith('/'))
                        moduleFilePath = path.join(
                            context, moduleLocation, moduleFilePath)
                    if (fileName === null) {
                        try {
                            if (fileSystem.statSync(
                                moduleFilePath
                            ).isDirectory()) {
                                let pathToPackageJSON = path.join(
                                    moduleFilePath, 'package.json')
                                if (fileSystem.statSync(
                                    pathToPackageJSON
                                ).isFile()) {
                                    let localConfiguration = global.JSON.parse(
                                        fileSystem.readFileSync(
                                            pathToPackageJSON, {
                                                encoding: 'utf-8'}))
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
        for (let pathToCheck of locationsToCheck)
            if (path.resolve(filePath).startsWith(path.resolve(pathToCheck)))
                return true
        return false
    }
    static resolve(object, configuration = null, initial = true) {
        // Processes all dynamically linked values in given object.
        if (!configuration)
            configuration = object
        if (initial) {
            const attachProxy = object => {
                for (let key in object)
                    if (Helper.isObject(object[key]))
                        attachProxy(object[key])
                // NOTE: Replace this return code with outcomment code and
                // remove all unneeded "resolve" calls in all potentially given
                // configurations if node or babel supports proxies.
                return object
                /*
                return new global.Proxy(object, {get: (target, name) =>
                    Helper.resolve(target[name], configuration, false)
                })
                */
            }
            attachProxy(configuration)
        }
        if (global.Array.isArray(object)) {
            let index = 0
            for (let value of object) {
                object[index] = Helper.resolve(value, configuration, false)
                index += 1
            }
        } else if (Helper.isObject(object))
            for (let key in object) {
                if (key === '__execute__')
                    return Helper.resolve(new global.Function(
                        'global', 'self', 'resolve', 'webOptimizerPath',
                        'currentPath', 'path', `return ${object[key]}`
                    )(
                        global, configuration, (
                            propertyName, subConfiguration = configuration,
                            subInitial = false
                        ) => Helper.resolve(
                            propertyName, subConfiguration, subInitial
                        ), __dirname, global.process.cwd(), path
                    ), configuration, false)
                object[key] = Helper.resolve(object[key], configuration, false)
            }
        return object
    }
    static determineModuleLocations(
        internals, knownExtensions = ['.js'], context = './',
        pathsToIgnore = ['.git']
    ) {
        // Determines all script modules to use as internal injects.
        const filePaths = []
        const directoryPaths = []
        if (Helper.isObject(internals)) {
            let newInternals = []
            global.Object.keys(internals).forEach(key => newInternals.push(
                internals[key]))
            internals = newInternals
        }
        for (let module of internals) {
            let stat
            let filePath
            for (let extension of knownExtensions) {
                filePath = path.resolve(module + extension)
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
                    for (let pathToIgnore of pathsToIgnore)
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
        return {filePaths, directoryPaths}
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
