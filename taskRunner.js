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
import type {
    BuildConfiguration, ExitHandlerFunction, NormalizedInternalInjection,
    PlainObject, ResolvedConfiguration
} from './type'
import Helper from './helper.compiled'
// endregion
// region controller
const childProcessOptions:Object = {cwd: configuration.path.context}
const childProcesses:Array<ChildProcess> = []
if (process.argv.length > 2) {
    // region temporary save dynamically given configurations
    // NOTE: We need a copy of given arguments array.
    let dynamicConfiguration:PlainObject = {
        givenCommandLineArguments: process.argv.slice()}
    if (process.argv.length > 3) {
        const evaluationFunction = (
            configuration:ResolvedConfiguration
        ):?PlainObject =>
            // IgnoreTypeCheck
            new Function(
                'configuration',
                `return ${process.argv[process.argv.length - 1]}`
            )(configuration)
        try {
            if (Helper.isPlainObject(evaluationFunction(configuration)))
                process.argv.pop()
        } catch (error) {}
    }
    let count:number = 0
    let filePath:string = `${configuration.path.context}.` +
        `dynamicConfiguration-${count}.json`
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
    fileSystem.writeFileSync(filePath, JSON.stringify(dynamicConfiguration))
    // / region register exit handler to tidy up
    const exitHandler:ExitHandlerFunction = function(error:?Error):?Error {
        try {
            fileSystem.unlinkSync(filePath)
        } catch (error) {}
        if (error)
            throw error
        process.exit()
        return error
    }
    process.on('exit', exitHandler)
    process.on('SIGINT', exitHandler)
    process.on('uncaughtException', exitHandler)
    // / endregion
    // endregion
    // region handle clear
    if (process.argv[2] === 'clear') {
        // Removes all compiled files.
        if (path.resolve(configuration.path.target) === path.resolve(
            configuration.path.context
        ))
            Helper.walkDirectoryRecursivelySync(configuration.path.target, (
                filePath:string, stat:Object
            ):?boolean => {
                if (Helper.isFilePathInLocation(
                    filePath, configuration.path.ignore
                ))
                    return false
                for (const type:string in configuration.build)
                    if (new RegExp(
                        configuration.build[type].fileNamePattern
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
    let additionalArguments:string = process.argv.splice(3).join("' '")
    if (additionalArguments)
        additionalArguments = `'${additionalArguments}'`
    // region handle build
    const buildConfigurations:BuildConfiguration =
        Helper.resolveBuildConfigurationFilePaths(
            configuration.build, configuration.path.asset.source,
            configuration.path.context, configuration.path.ignore)
    if (process.argv[2] === 'build')
        // Triggers complete asset compiling and bundles them into the final
        // productive output.
        childProcesses.push(run(
            `${configuration.commandLine.build} ${additionalArguments}`,
            childProcessOptions, (error:?Error) => {
                if (!error) {
                    // Determines all none javaScript entities which have been
                    // emitted as single javaScript module to remove.
                    const internalInjection:NormalizedInternalInjection =
                        Helper.normalizeInternalInjection(
                            Helper.resolveInjection(
                                configuration.injection, buildConfigurations,
                                configuration.test.injection.internal,
                                configuration.module.aliases,
                                configuration.knownExtensions,
                                configuration.path.context,
                                configuration.path.ignore
                            ).internal)
                    for (const chunkName:string in internalInjection)
                        if (internalInjection.hasOwnProperty(chunkName))
                            for (const moduleID:string of internalInjection[
                                chunkName
                            ]) {
                                const type:?string = Helper.determineAssetType(
                                    Helper.determineModuleFilePath(moduleID),
                                    configuration.build, configuration.path)
                                const filePath =
                                    configuration.files.javaScript.replace(
                                        '[name]', moduleID
                                    ).replace(/\?[^?]+/, '')
                                if (
                                    typeof type === 'string' &&
                                    configuration.build[type] &&
                                    configuration.build[
                                        type
                                    ].outputExtension !== 'js'
                                )
                                    for (const suffix:string of ['', '.map'])
                                        fileSystem.access(
                                            `${filePath}${suffix}`,
                                            fileSystem.F_OK, (
                                                error:?Error
                                            ) => {
                                                if (!error)
                                                    fileSystem.unlink(
                                                        filePath + suffix)
                                            })
                            }
                    for (const filePath:string of configuration.path.tidyUp)
                        fileSystem.access(filePath, fileSystem.F_OK, (
                            error:?Error
                        ) => {
                            if (!error)
                                fileSystem.unlink(filePath)
                        })
                }
            }))
    // endregion
    // region handle lint
    else if (process.argv[2] === 'lint')
        // Lints files with respect to given linting configuration.
        childProcesses.push(run(
            `${configuration.commandLine.lint} ${additionalArguments}`,
            childProcessOptions))
    // endregion
    // region handle test
    else if (process.argv[2] === 'test')
        // Runs all specified tests (typically in a real browser environment).
        childProcesses.push(run(
            `${configuration.commandLine.test} ${additionalArguments}`,
            childProcessOptions))
    // endregion
    // region handle preinstall
    else if (configuration.library && process.argv[2] === 'preinstall') {
        // Perform all file specific preprocessing stuff.
        const testModuleFilePaths:Array<string> =
            Helper.determineModuleLocations(
                configuration.test.injection.internal,
                configuration.module.aliases, configuration.knownExtensions,
                configuration.path.context, configuration.path.ignore
            ).filePaths
        for (const buildConfiguration of buildConfigurations)
            for (const filePath:string of buildConfiguration.filePaths)
                if (testModuleFilePaths.indexOf(filePath) === -1) {
                    const evaluationFunction = (
                        global:Object, self:PlainObject,
                        buildConfiguration:PlainObject, path:typeof path,
                        additionalArguments:string, filePath:string
                    ):string =>
                        // IgnoreTypeCheck
                        new Function(
                            'global', 'self', 'buildConfiguration', 'path',
                            'additionalArguments', 'filePath', 'return ' +
                            `\`${buildConfiguration[process.argv[2]]}\``
                        )(
                            global, self, buildConfiguration, path,
                            additionalArguments, filePath)
                    childProcesses.push(run(evaluationFunction(
                        global, configuration, buildConfiguration, path,
                        additionalArguments, filePath
                    ), childProcessOptions))
                }
    // endregion
    // region handle serve
    } else if (process.argv[2] === 'serve')
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
for (const childProcess:ChildProcess of childProcesses)
    Helper.handleChildProcess(childProcess)
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
