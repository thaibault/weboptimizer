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
    resolve: function(object, currentConfiguration = configuration) {
        // Processes all dynamically linked values in given object.
        if (global.Array.isArray(object)) {
            let index = 0
            for (let value of object) {
                object[index] = this.resolve(value, currentConfiguration)
                index += 1
            }
        } else if (this.isObject(object))
            for (let key in object) {
                if (key === '__execute__')
                    return this.resolve(new global.Function(
                        'global', 'self', 'webOptimizerPath', 'currentPath',
                        `return ${object[key]}`
                    )(
                        global, currentConfiguration, __dirname,
                        global.process.cwd()
                    ), currentConfiguration)
                object[key] = this.resolve(object[key], currentConfiguration)
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
    determineTestModules: function() {
        const filePaths = []
        const moduleDirectoryPaths = [configuration.path.asset.source]
        for (let module of configuration.test.modules) {
            let stat
            let filePath
            for (let extension of configuration.knownExtensions) {
                filePath = path.resolve(module + extension)
                try {
                    stat = fileSystem.statSync(filePath)
                    break
                } catch (error) {}
            }
            let pathToAdd
            if (stat.isDirectory()) {
                pathToAdd = `${path.resolve(module)}/`
                this.walkDirectoryRecursivelySync(module, subFilePath => {
                    for (let pathToIgnore of configuration.path.ignore)
                        if (subfilePath.startsWith(path.resolve(
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
    determineBuildConfigurations: function() {
        // Apply default file level build configurations to all file type specific
        // ones.
        let defaultConfiguration = configuration.build.default
        delete configuration.build.default
        global.Object.keys(configuration.build).forEach(type => {
            configuration.build[type] = extend(
                true, {extension: type}, defaultConfiguration,
                configuration.build[type], {type})
        })
        // Determines all files which should be preprocessed after using
        // them in production.
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
                    ].buildFileNamePattern
                )).test(filePath))
                    buildConfigurations[index].filePaths.push(filePath)
            })
            index += 1
        })
        return buildConfigurations
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
