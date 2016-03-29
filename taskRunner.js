#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import configuration from './configurator.compiled'
import {exec as run} from 'child_process'
import extend from 'extend'
import * as fileSystem from 'fs'
import path from 'path'
fileSystem.removeDirectoryRecursivelySync = require('rimraf').sync
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
// endregion
// region helper functions
const handleChildProcess = childProcess => {
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
}
path.walkDirectoryRecursivelySync = (directoryPath, callback = (
    /* filePath, stat */
) => {}) => {
    /*
        Iterates recursively through given directory structure and calls given
        callback for each found entity. If "false" is returned and current
        file is a directory deeper leaves aren't explored.
    */
    fileSystem.readdirSync(directoryPath).forEach(fileName => {
        const filePath = path.resolve(directoryPath, fileName)
        const stat = fileSystem.statSync(filePath)
        if (callback(filePath, stat) !== false && stat && stat.isDirectory())
            path.walkDirectoryRecursivelySync(filePath, callback)
    })
}
// endregion
// region controller
const childProcessOptions = {cwd: configuration.contextPath}
let childProcess = null
if (global.process.argv.length > 2) {
    // Apply default file level build configurations to all file type specific
    // ones.
    global.Object.keys(configuration.build).forEach(scriptType => {
        configuration.build[scriptType] = extend(
            true, {scriptType}, configuration.build.default,
            configuration.build[scriptType])
    })
    if (global.process.argv[2] === 'clear') {
        // Removes all compiled files.
        if (path.resolve(configuration.path.target) === path.resolve(
            configuration.contextPath
        ))
            path.walkDirectoryRecursivelySync(configuration.path.target, (
                filePath, stat
            ) => {
                for (let pathToIgnore of configuration.path.ignore)
                    if (filePath.startsWith(path.resolve(
                        configuration.contextPath, pathToIgnore
                    )))
                        return false
                global.Object.keys(configuration.build).forEach(scriptType => {
                    if (stat.isFile() && (new global.RegExp(
                        configuration.build[scriptType].buildFileNamePattern
                    )).test(filePath))
                        fileSystem.unlink(filePath)
                })
            })
        else
            fileSystem.removeDirectoryRecursivelySync(
                configuration.path.target, {glob: false})
        process.exit()
    }
    let additionalArguments = global.process.argv.splice(3).join(' ')
    if (configuration.library) {
        // Compile file specific since bundling is only needed in the final
        // full blown project (if configuration evaluates to "false").
        if (['preinstall', 'build'].indexOf(global.process.argv[2]) !== -1) {
            // Determines all files which should be preprocessed after using
            // them in production.
            let buildConfigurations = []
            let index = 0
            global.Object.keys(configuration.build).forEach(scriptType => {
                buildConfigurations.push(extend(
                    true, {filePaths: []}, configuration.build[scriptType]))
                path.walkDirectoryRecursivelySync(path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.javaScript
                ), (filePath, stat) => {
                    if (stat.isFile() && path.extname(filePath).substring(
                        1
                    ) === buildConfigurations[
                        buildConfigurations.length - 1
                    ].extension && !(new global.RegExp(
                        buildConfigurations[
                            buildConfigurations.length - 1
                        ].buildFileNamePattern
                    )).test(filePath)) {
                        for (let pathToIgnore of configuration.path.ignore)
                            if (filePath.startsWith(path.resolve(
                                configuration.contextPath, pathToIgnore
                            )))
                                return false
                        buildConfigurations[index].filePaths.push(filePath)
                    }
                })
                index += 1
            })
            /*
                NOTE: We have to loop twice since generated files from further
                loops shouldn't be taken into account in later loops.
            */
            childProcess = []
            // Perform all file specific preprocessing stuff.
            for (let buildConfiguration of buildConfigurations)
                for (let filePath of buildConfiguration.filePaths)
                    childProcess.push(run(new global.Function(
                        'global', 'self', 'buildConfiguration',
                        'webOptimizerPath', 'currentPath', 'contextPath',
                        'path', 'additionalArguments', 'filePath', 'return `' +
                        `${buildConfiguration[global.process.argv[2]]}\``
                    )(global, configuration, buildConfiguration, __dirname,
                    global.process.cwd(), configuration.contextPath, path,
                    additionalArguments, filePath), childProcessOptions))
        }
    } else
        if (global.process.argv[2] === 'build')
            // Triggers complete asset compiling and bundles them into the
            // final productive output.
            childProcess = run(
                `${configuration.commandLine.build} ${additionalArguments}`,
                childProcessOptions, error => {
                    if (!error) {
                        let manifestFilePath = path.join(
                            configuration.path.target, path.basename(
                                configuration.path.manifest, '.appcache'
                            ) + '.html')
                        fileSystem.access(
                            manifestFilePath, fileSystem.F_OK, error => {
                                if (!error)
                                    fileSystem.unlink(manifestFilePath)
                            })
                    }
                })
        else if (global.process.argv[2] === 'serve')
            // Provide a development environment where all assets are
            // dynamically bundled and updated on changes.
            childProcess = run(
                `${configuration.commandLine.serve} ${additionalArguments}`,
                childProcessOptions)
    if (global.process.argv[2] === 'lint')
        // Lints files with respect to given linting configuration.
        childProcess = run(
            `${configuration.commandLine.lint} ${additionalArguments}`,
            childProcessOptions)
    else if (global.process.argv[2] === 'test')
        // Runs all specified tests (typically in a real browser environment).
        childProcess = run(
            `${configuration.commandLine.test} ${additionalArguments}`,
            childProcessOptions)
}
if (childProcess === null) {
    // If no sub process could be started a message with all available
    // arguments is printed.
    if (configuration.library)
        console.log(
            'Give one of "build", "clear", "lint", "test" or "preinstall" as' +
            ' command line argument.\n')
    else
        console.log(
            'Give one of "build", "clear", "lint", "serve", "test" or ' +
            '"preinstall" as command line argument.\n')
    process.exit()
}
// endregion
// region trigger child process communication handler
if (global.Array.isArray(childProcess))
    for (let subChildProcess of childProcess)
        handleChildProcess(subChildProcess)
else
    handleChildProcess(childProcess)
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
