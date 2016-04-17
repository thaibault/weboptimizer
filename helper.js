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

import configuration from './configurator.compiled'
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
    resolve: function(
        object, currentConfiguration = configuration, initial = true
    ) {
        // Processes all dynamically linked values in given object.
        if (initial) {
            const attachProxy = object => {
                for (let key in object)
                    if (this.isObject(object[key]))
                        attachProxy(object[key])
                return global.Proxy(object, {get: (target, name) => {
                    return this.resolve(
                        target[name], currentConfiguration, false)
                }})
            }
            attachProxy(currentConfiguration)
        }
        if (global.Array.isArray(object)) {
            let index = 0
            for (let value of object) {
                object[index] = this.resolve(
                    value, currentConfiguration, false)
                index += 1
            }
        } else if (this.isObject(object))
            for (let key in object) {
                if (key === '__execute__')
                    return this.resolve(new global.Function(
                        'global', 'self', 'resolve', 'webOptimizerPath',
                        'currentPath', 'path', `return ${object[key]}`
                    )(
                        global, currentConfiguration, this.resolve, __dirname,
                        global.process.cwd(), path
                    ), currentConfiguration, false)
                object[key] = this.resolve(
                    object[key], currentConfiguration, false)
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
        internals = configuration.injects.internal
    ) {
        // Determines all script modules to use as injects.
        const filePaths = []
        const moduleDirectoryPaths = [configuration.path.asset.source]
        for (let module of internals) {
            let stat
            let filePath
            for (let extension of configuration.knownExtensions) {
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
                    for (let pathToIgnore of configuration.path.ignore)
                        if (subFilePath.startsWith(path.resolve(
                            configuration.path.context, pathToIgnore
                        )))
                            return false
                    filePaths.push(subFilePath)
                })
            } else {
                pathToAdd = `${path.resolve(path.dirname(module))}/`
                filePaths.push(filePath)
            }
            if (moduleDirectoryPaths.indexOf(pathToAdd) === -1)
                moduleDirectoryPaths.push(pathToAdd)
        }
        return [filePaths, moduleDirectoryPaths]
    },
    determineAssetType: filePath => {
        // Determines file type of given file (by path).
        let result = null
        global.Object.keys(configuration.build).forEach(type => {
            if (path.extname(
                filePath
            ) === `.${configuration.build[type].extension}`) {
                result = type
                return false
            }
        })
        if (!result)
            for (let type of ['source', 'target'])
                for (let assetType in configuration.path.asset)
                    if (filePath.startsWith(path.join(
                            configuration.path[type],
                            configuration.path.asset[assetType]
                    )))
                        return assetType
        return result
    },
    determineBuildConfigurations: function() {
        /*
            Determines all files which should be taken into account before
            using them in production. The result is a list of build
            configurations taken from current configuration object. Each
            configuration has all related files saved as property. Result is
            sorted to prefer java script modules.
        */
        let buildConfigurations = []
        let index = 0
        global.Object.keys(configuration.build).forEach(type => {
            buildConfigurations.push(extend(
                true, {filePaths: []}, configuration.build[type]))
            this.walkDirectoryRecursivelySync(path.join(
                configuration.path.asset.source,
                configuration.path.asset.javaScript
            ), (filePath, stat) => {
                for (let pathToIgnore of configuration.path.ignore)
                    if (filePath.startsWith(path.resolve(
                        configuration.path.context, pathToIgnore
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
    determineInjects: function() {
        // Determines all injects for current build.
        const injects = extend(true, {}, configuration.injects)
        const testModuleFilePaths = this.determineModuleLocations(
            configuration.test.injects.internal
        )[0]
        for (let type of ['internal', 'external'])
            if (configuration[`${type}Injects`] === '__auto__') {
                injects[type] = {}
                let injectedBaseNames = {}
                for (
                    let buildConfiguration of
                    this.determineBuildConfigurations()
                ) {
                    if (!injectedBaseNames[buildConfiguration.outputExtension])
                        injectedBaseNames[
                            buildConfiguration.outputExtension
                        ] = []
                    for (let moduleFilePath of buildConfiguration.filePaths)
                        if (
                            testModuleFilePaths.indexOf(moduleFilePath) === -1
                        ) {
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
                                        configuration.path.context,
                                        moduleFilePath
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
    determineModulePath: moduleID => {
        // Determines a module path for given module id synchronously.
        global.Object.keys(configuration.moduleAliases).forEach(search => {
            moduleID = moduleID.replace(
                search, configuration.moduleAliases[search])
        })
        for (let moduleLocation of ['', 'node_modules'])
            for (let fileName of [null, '', 'index', 'main'])
                for (let extension of configuration.knownExtensions) {
                    let moduleFilePath = moduleID
                    if (!moduleFilePath.startsWith('/'))
                        moduleFilePath = path.join(
                            configuration.path.context, moduleLocation,
                            moduleFilePath)
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
