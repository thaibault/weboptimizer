#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {exec as run} from 'child_process'
import * as fileSystem from 'fs'
import path from 'path'
fileSystem.removeDirectoryRecursivelySync = module.require('rimraf').sync
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import configuration from './configurator.compiled'
import helper from './helper.compiled'
// endregion
// region controller
const childProcessOptions = {cwd: configuration.path.context}
let childProcess = null
if (global.process.argv.length > 2) {
    // region temporary save dynamically given configurations
    let additionalArguments
    if (global.process.argv.length > 3) {
        let dynamicConfiguration = null
        try {
            dynamicConfiguration = global.JSON.parse(
                global.process.argv[global.process.argv.length - 1])
        } catch (error) {}
        if (dynamicConfiguration) {
            additionalArguments = global.process.argv.splice(4).join(' ')
            let count = 0
            let filePath
            while (true) {
                filePath = configuration.path.context +
                    `.dynamicConfiguration-${count}.json`
                try {
                    fileSystem.accessSync(filePath, fileSystem.F_OK)
                } catch (error) {
                    break
                }
                count += 1
            }
            const temporaryFileDescriptor = fileSystem.openSync(filePath, 'w')
            fileSystem.writeSync(
                temporaryFileDescriptor,
                global.process.argv[global.process.argv.length - 1])
            fileSystem.closeSync(temporaryFileDescriptor)
            // region register exit handler to tidy up
            const exitHandler = () => {
                try {
                    fileSystem.unlinkSync(filePath)
                } catch (error) {}
                global.process.exit()
            }
            global.process.on('exit', exitHandler)
            global.process.on('SIGINT', exitHandler)
            global.process.on('uncaughtException', exitHandler)
            // endregion
        } else
            additionalArguments = global.process.argv.splice(3).join(' ')
    } else
        additionalArguments = global.process.argv.splice(3).join(' ')
    // endregion
    if (global.process.argv[2] === 'clear') {
        // Removes all compiled files.
        if (path.resolve(configuration.path.target) === path.resolve(
            configuration.path.context
        ))
            helper.walkDirectoryRecursivelySync(configuration.path.target, (
                filePath, stat
            ) => {
                for (let pathToIgnore of configuration.path.ignore)
                    if (filePath.startsWith(path.resolve(
                        configuration.path.context, pathToIgnore
                    )))
                        return false
                for (let type in configuration.build)
                    if (new global.RegExp(
                        configuration.build[type].fileNamePattern
                    ).test(filePath)) {
                        if (stat.isDirectory()) {
                            fileSystem.removeDirectoryRecursivelySync(
                                filePath, {glob: false})
                            return false
                        }
                        fileSystem.unlink(filePath)
                    }
            })
        else
            fileSystem.removeDirectoryRecursivelySync(
                configuration.path.target, {glob: false})
        process.exit()
    }
    let buildConfigurations = []
    if (configuration.library)
        buildConfigurations = helper.determineBuildConfigurations()
    if (global.process.argv[2] === 'build')
        // Triggers complete asset compiling and bundles them into the final
        // productive output.
        childProcess = run(
            `${configuration.commandLine.build} ${additionalArguments}`,
            childProcessOptions, error => {
                if (!error) {
                    // Determines all none javaScript entities which have been
                    // emitted as single javaScript module to remove.
                    let modulesToEmit = helper.determineInjects().internal
                    global.Object.keys(modulesToEmit).forEach(moduleID => {
                        const type = helper.determineAssetType(
                            modulesToEmit[moduleID])
                        const filePath =
                            configuration.files.javaScript.replace(
                                '[name]', moduleID
                            ).replace(/\?[^?]+/, '')
                        if (configuration.build[type] && configuration.build[
                            type
                        ].outputExtension !== 'js')
                            fileSystem.access(
                                filePath, fileSystem.F_OK, error => {
                                    if (!error)
                                        fileSystem.unlink(filePath)
                                })
                    })
                    for (let filePath of configuration.path.tidyUp)
                        fileSystem.access(
                            filePath, fileSystem.F_OK, error => {
                                if (!error)
                                    fileSystem.unlink(filePath)
                            })
                }
            })
    else if (global.process.argv[2] === 'lint')
        // Lints files with respect to given linting configuration.
        childProcess = run(
            `${configuration.commandLine.lint} ${additionalArguments}`,
            childProcessOptions)
    else if (global.process.argv[2] === 'test')
        // Runs all specified tests (typically in a real browser environment).
        childProcess = run(
            `${configuration.commandLine.test} ${additionalArguments}`,
            childProcessOptions)
    else if (
        configuration.library && global.process.argv[2] === 'preinstall'
    ) {
        childProcess = []
        // Perform all file specific preprocessing stuff.
        const testModuleFilePaths = helper.determineTestModules()[0]
        for (let buildConfiguration of buildConfigurations)
            for (let filePath of buildConfiguration.filePaths)
                if (testModuleFilePaths.indexOf(filePath) === -1)
                    childProcess.push(run(new global.Function(
                        'global', 'self', 'buildConfiguration',
                        'webOptimizerPath', 'currentPath', 'path',
                        'additionalArguments', 'filePath',
                        'return ' +
                        `\`${buildConfiguration[global.process.argv[2]]}\``
                    )(global, configuration, buildConfiguration, __dirname,
                    global.process.cwd(), path, additionalArguments, filePath
                    ), childProcessOptions))
    } else if (global.process.argv[2] === 'serve')
        // Provide a development environment where all assets are dynamically
        // bundled and updated on changes.
        childProcess = run(
            `${configuration.commandLine.serve} ${additionalArguments}`,
            childProcessOptions)
}
if (childProcess === null) {
    // If no sub process could be started a message with all available
    // arguments is printed.
    if (configuration.library)
        console.log(
            'Give one of "build", "clear", "lint", "test" or "preinstall" as' +
            ' command line argument. You can provide a json string as second' +
            ' parameter to dynamically overwrite some configurations.\n')
    else
        console.log(
            'Give one of "build", "clear", "lint", "test" or "serve" as ' +
            ' command line argument. You can provide a json string as second' +
            ' parameter to dynamically overwrite some configurations.\n')
    process.exit()
}
// endregion
// region trigger child process communication handler
if (global.Array.isArray(childProcess))
    for (let subChildProcess of childProcess)
        helper.handleChildProcess(subChildProcess)
else
    helper.handleChildProcess(childProcess)
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
