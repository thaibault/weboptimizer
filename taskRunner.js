#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {exec as run, ChildProcess} from 'child_process'
import * as fileSystem from 'fs'
import path from 'path'
import {sync as removeDirectoryRecursivelySync} from 'rimraf'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import configuration from './configurator.compiled'
import Helper from './helper.compiled'
// endregion
// region controller
const childProcessOptions = {cwd: configuration.path.context}
const childProcesses:Array<ChildProcess> = []
if (global.process.argv.length > 2) {
    // region temporary save dynamically given configurations
    // NOTE: We need a copy of given arguments array.
    let dynamicConfiguration = {
        givenCommandLineArguments: global.process.argv.slice()}
    if (global.process.argv.length > 3)
        try {
            const result = (new global.Function(
                'configuration',
                `return ${global.process.argv[global.process.argv.length - 1]}`
            ))(configuration)
            if (
                result !== null && typeof result === 'object' &&
                !global.Array.isArray(result) &&
                global.Object.prototype.toString.call(
                    result
                ) === '[object Object]'
            )
                global.process.argv.pop()
        } catch (error) {}
    let count = 0
    let filePath = `${configuration.path.context}.dynamicConfiguration-` +
        `${count}.json`
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
    fileSystem.writeFileSync(filePath, global.JSON.stringify(
        dynamicConfiguration))
    // / region register exit handler to tidy up
    const exitHandler = function(error) {
        try {
            fileSystem.unlinkSync(filePath)
        } catch (error) {}
        if (error)
            throw error
        global.process.exit()
    }
    global.process.on('exit', exitHandler)
    global.process.on('SIGINT', exitHandler)
    global.process.on('uncaughtException', exitHandler)
    // / endregion
    // endregion
    // region handle clear
    if (global.process.argv[2] === 'clear') {
        // Removes all compiled files.
        if (path.resolve(configuration.path.target) === path.resolve(
            configuration.path.context
        ))
            Helper.walkDirectoryRecursivelySync(configuration.path.target, (
                filePath, stat
            ) => {
                if (Helper.isFilePathInLocation(
                    filePath, configuration.path.ignore
                ))
                    return false
                for (const [type, buildConfiguration] of configuration.build)
                    if (new global.RegExp(
                        buildConfiguration.fileNamePattern
                    ).test(filePath)) {
                        if (stat.isDirectory()) {
                            removeDirectoryRecursivelySync(filePath, {
                                glob: false})
                            return false
                        }
                        fileSystem.unlink(filePath)
                    }
            })
        else
            removeDirectoryRecursivelySync(configuration.path.target, {
                glob: false})
        process.exit()
    }
    // endregion
    let additionalArguments = global.process.argv.splice(3).join("' '")
    if (additionalArguments)
        additionalArguments = `'${additionalArguments}'`
    // region handle build
    const buildConfigurations = Helper.resolveBuildConfigurationFilePaths(
        configuration.build, configuration.path.asset.source,
        configuration.path.context, configuration.path.ignore)
    if (global.process.argv[2] === 'build')
        // Triggers complete asset compiling and bundles them into the final
        // productive output.
        childProcesses.push(run(
            `${configuration.commandLine.build} ${additionalArguments}`,
            childProcessOptions, error => {
                if (!error) {
                    // Determines all none javaScript entities which have been
                    // emitted as single javaScript module to remove.
                    const modulesToEmit = Helper.resolveInjects(
                        configuration.injects, buildConfigurations,
                        configuration.test.injects.internal,
                        configuration.knownExtensions,
                        configuration.path.context, configuration.path.ignore
                    ).internal
                    for (const [moduleID, moduleFilePath] of modulesToEmit) {
                        const type = Helper.determineAssetType(
                            moduleFilePath, configuration.build,
                            configuration.path)
                        const filePath =
                            configuration.files.javaScript.replace(
                                '[name]', moduleID
                            ).replace(/\?[^?]+/, '')
                        if (configuration.build[type] && configuration.build[
                            type
                        ].outputExtension !== 'js')
                            for (const suffix of ['', '.map'])
                                fileSystem.access(
                                    filePath + suffix, fileSystem.F_OK,
                                    error => {
                                        if (!error)
                                            fileSystem.unlink(
                                                filePath + suffix)
                                    })
                    }
                    for (const filePath of configuration.path.tidyUp)
                        fileSystem.access(
                            filePath, fileSystem.F_OK, error => {
                                if (!error)
                                    fileSystem.unlink(filePath)
                            })
                }
            }))
    // endregion
    // region handle lint
    else if (global.process.argv[2] === 'lint')
        // Lints files with respect to given linting configuration.
        childProcesses.push(run(
            `${configuration.commandLine.lint} ${additionalArguments}`,
            childProcessOptions))
    // endregion
    // region handle test
    else if (global.process.argv[2] === 'test')
        // Runs all specified tests (typically in a real browser environment).
        childProcesses.push(run(
            `${configuration.commandLine.test} ${additionalArguments}`,
            childProcessOptions))
    // endregion
    // region handle preinstall
    else if (
        configuration.library && global.process.argv[2] === 'preinstall'
    ) {
        // Perform all file specific preprocessing stuff.
        const testModuleFilePaths = Helper.determineModuleLocations(
            configuration.test.injects.internal, configuration.knownExtensions,
            configuration.path.context, configuration.path.ignore
        ).filePaths
        for (const buildConfiguration of buildConfigurations)
            for (const filePath of buildConfiguration.filePaths)
                if (testModuleFilePaths.indexOf(filePath) === -1)
                    childProcesses.push(run((new global.Function(
                        'global', 'self', 'buildConfiguration', 'path',
                        'additionalArguments', 'filePath', 'return ' +
                        `\`${buildConfiguration[global.process.argv[2]]}\``
                    ))(
                        global, configuration, buildConfiguration, path,
                        additionalArguments, filePath
                    ), childProcessOptions))
    // endregion
    // region handle serve
    } else if (global.process.argv[2] === 'serve')
        // Provide a development environment where all assets are dynamically
        // bundled and updated on changes.
        childProcesses.push(run(
            `${configuration.commandLine.serve} ${additionalArguments}`,
            childProcessOptions))
    // endregion
}
// / region handle child process interface
if (childProcesses.length === 0) {
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
// / endregion
// / region trigger child process communication handler
for (const childProcess of childProcesses)
    Helper.handleChildProcess(childProcess)
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
