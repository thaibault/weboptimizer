#!/usr/bin/env node
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
// region functions
export default {
    isObject: object => {
        // Checks if given entity is a object.
        return (
            object !== null && typeof object === 'object' &&
            global.Object.getPrototypeOf(object) === global.Object.prototype)
    },
    isFunction: object => {
        // Checks if given entity is a function.
        return object && {}.toString.call(object) === '[object Function]'
    },
    resolve: function(object, configuration = null, initial = true) {
        // Processes all dynamically linked values in given object.
        if (!configuration)
            configuration = object
        if (initial) {
            const attachProxy = object => {
                for (let key in object)
                    if (this.isObject(object[key]))
                        attachProxy(object[key])
                // NOTE: Replace this return code with outcomment code and
                // remove all unneeded "resolve" calls in all potentially given
                // configurations if node or babel supports proxies.
                return object
                /*
                return new global.Proxy(object, {get: (target, name) => {
                    return this.resolve(
                        target[name], configuration, false)
                }})
                */
            }
            attachProxy(configuration)
        }
        if (global.Array.isArray(object)) {
            let index = 0
            for (let value of object) {
                object[index] = this.resolve(value, configuration, false)
                index += 1
            }
        } else if (this.isObject(object))
            for (let key in object) {
                if (key === '__execute__')
                    return this.resolve(new global.Function(
                        'global', 'self', 'resolve', 'webOptimizerPath',
                        'currentPath', 'path', `return ${object[key]}`
                    )(
                        global, configuration, (
                            propertyName, subConfiguration = configuration,
                            subInitial = false
                        ) => {
                            return this.resolve(
                                propertyName, subConfiguration, subInitial)
                        }, __dirname, global.process.cwd(), path
                    ), configuration, false)
                object[key] = this.resolve(
                    object[key], configuration, false)
            }
        return object
    },
    handleChildProcess: childProcess => {
        /*
            Forwards given child process communication channels to corresponding
            current process communication channels.
        */
        childProcess.stdout.on('data', data => {
            process.stdout.write(data)
        })
        childProcess.stderr.on('data', data => {
            process.stderr.write(data)
        })
        childProcess.on('close', returnCode => {
            if (returnCode !== 0)
                console.error(`Task exited with error code ${returnCode}`)
        })
    },
    walkDirectoryRecursivelySync: function(directoryPath, callback = (
        /* filePath, stat */
    ) => {}) {
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
                this.walkDirectoryRecursivelySync(filePath, callback)
        })
    },
    determineModuleLocations: function(
        internals, knownExtensions = ['.js'], context = './',
        pathsToIgnore = ['.git']
    ) {
        // Determines all script modules to use as injects.
        const filePaths = []
        const directoryPaths = []
        if (this.isObject(internals)) {
            let newInternals = []
            global.Object.keys(internals).forEach(key => {
                newInternals.push(internals[key])
            })
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
                this.walkDirectoryRecursivelySync(module, subFilePath => {
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
    },
    determineAssetType: (filePath, buildConfiguration, paths) => {
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
    },
    resolveBuildConfigurationFilePaths: function(
        configuration, entryPath = './', context = './',
        pathsToIgnore = ['.git']
    ) {
        /*
            Determines all files which should be taken into account before
            using them in production. The result is a list of build
            configurations taken from current configuration object. Each
            configuration has all related files saved as property. Result is
            sorted to prefer java script modules.
        */
        let buildConfigurations = []
        let index = 0
        global.Object.keys(configuration).forEach(type => {
            buildConfigurations.push(extend(
                true, {filePaths: []}, configuration[type]))
            this.walkDirectoryRecursivelySync(entryPath, (filePath, stat) => {
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
    },
    resolveInjects: function(
        givenInjects, buildConfiguration, modulesToExclude, knownExtensions = [
            '.js', '.css', '.svg', '.html'
        ], context = './', pathsToIgnore = ['.git']
    ) {
        // Determines all injects for current build.
        let injects = extend(true, {}, givenInjects)
        const moduleFilePathsToExclude = this.determineModuleLocations(
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
    },
    determineModulePath: (
        moduleID, moduleAliases = {}, knownExtensions = ['.js'], context = './'
    ) => {
        // Determines a module path for given module id synchronously.
        global.Object.keys(moduleAliases).forEach(search => {
            moduleID = moduleID.replace(search, moduleAliases[search])
        })
        for (let moduleLocation of ['', 'node_modules'])
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
                                    let mainField = global.JSON.parse(
                                        fileSystem.readFileSync(
                                            pathToPackageJSON, {
                                                encoding: 'utf-8'})
                                    ).main
                                    if (mainField)
                                        fileName = mainField
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
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
