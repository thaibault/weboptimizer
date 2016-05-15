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
    ErrorHandlerFunction, NormalizedInternalInjection, PlainObject,
    PromiseCallbackFunction, ResolvedBuildConfiguration, ResolvedConfiguration
} from './type'
import Helper from './helper.compiled'
// endregion
// region controller
const childProcessOptions:Object = {cwd: configuration.path.context}
const childProcesses:Array<ChildProcess> = []
const processPromises:Array<Promise> = []
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
    const exitHandler:ErrorHandlerFunction = function(error:?Error):?Error {
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
                        fileSystem.unlinkSync(filePath)
                        break
                    }
            })
        else
            removeDirectoryRecursivelySync(configuration.path.target, {
                glob: false})
        try {
            removeDirectoryRecursivelySync(
                configuration.path.apiDocumentation, {glob: false})
        } catch (error) {}
        process.exit()
    }
    // endregion
    let additionalArguments:string = process.argv.splice(3).join("' '")
    if (additionalArguments)
        additionalArguments = `'${additionalArguments}'`
    // region handle build
    const buildConfigurations:ResolvedBuildConfiguration =
        Helper.resolveBuildConfigurationFilePaths(
            configuration.build, configuration.path.asset.source,
            configuration.path.context, configuration.path.ignore)
    if (['build', 'document', 'test'].includes(process.argv[2]))
        // Triggers complete asset compiling and bundles them into the final
        // productive output.
        processPromises.push(new Promise((
            resolve:PromiseCallbackFunction, reject:PromiseCallbackFunction
        ):number => childProcesses.push(run(
            `${configuration.commandLine.build} ${additionalArguments}`,
            childProcessOptions, (error:?Error) => {
                if (error)
                    reject(error)
                else {
                    /*
                        Determines all none javaScript entities which have been
                        emitted as single javaScript module to remove.
                    */
                    const internalInjection:NormalizedInternalInjection =
                        Helper.normalizeInternalInjection(
                            Helper.resolveInjection(
                                configuration.injection,
                                buildConfigurations,
                                configuration.testInBrowser.injection.internal,
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
                                const filePath:string =
                                    configuration.files.javaScript.replace(
                                        '[name]', path.join(path.relative(
                                            path.dirname(moduleID),
                                            configuration.path.context
                                        ), path.basename(moduleID))
                                    ).replace(/\?[^?]+$/, '')
                                if (
                                    typeof type === 'string' &&
                                    configuration.build[type] &&
                                    configuration.build[
                                        type
                                    ].outputExtension !== 'js'
                                )
                                    for (const suffix:string of ['', '.map'])
                                        try {
                                            fileSystem.unlinkSync(
                                                filePath + suffix)
                                        } catch (error) {}
                            }
                    for (
                        const filePath:string of configuration.path.tidyUp
                    )
                        try {
                            fileSystem.unlinkSync(filePath)
                        } catch (error) {}
                    resolve()
                }
            }))))
    // endregion
    // region handle api documentation generation
    if (process.argv[2] === 'document')
        // Documents all specified api files.
        Promise.all(processPromises).then(():number =>
            processPromises.push(new Promise((
                resolve:PromiseCallbackFunction, reject:PromiseCallbackFunction
            ):number => childProcesses.push(run(
                `${configuration.commandLine.document} ${additionalArguments}`,
                childProcessOptions, (error:?Error) => {
                    if (error)
                        reject(error)
                    else
                        resolve()
                }))
            )))
    // endregion
    // region handle lint
    else if (process.argv[2] === 'lint')
        // Lints files with respect to given linting configuration.
        processPromises.push(new Promise((
            resolve:PromiseCallbackFunction, reject:PromiseCallbackFunction
        ):number => childProcesses.push(run(
            `${configuration.commandLine.lint} ${additionalArguments}`,
            childProcessOptions, (error:?Error) => {
                if (error)
                    reject(error)
                else
                    resolve()
            }))))
    // endregion
    // region handle test
    else if (process.argv[2] === 'test')
        // Runs all specified tests (typically in a real browser environment).
        Promise.all(processPromises).then(():number =>
            processPromises.push(new Promise((
                resolve:PromiseCallbackFunction, reject:PromiseCallbackFunction
            ):number => childProcesses.push(run(
                `${configuration.commandLine.test} ${additionalArguments}`,
                childProcessOptions, (error:?Error) => {
                    if (error)
                        reject(error)
                    else
                        resolve()
                })))))
    // endregion
     // region handle test in browser
    else if (process.argv[2] === 'testInBrowser')
        // Runs all specified tests in a real browser environment.
        processPromises.push(new Promise((
            resolve:PromiseCallbackFunction, reject:PromiseCallbackFunction
        ):number => childProcesses.push(run(
            `${configuration.commandLine.testInBrowser} ` +
            additionalArguments, childProcessOptions, (error:?Error) => {
                if (error)
                    reject(error)
                else
                    resolve()
            }))))
    // endregion
    // region handle preinstall
    else if (configuration.library && process.argv[2] === 'preinstall') {
        // Perform all file specific preprocessing stuff.
        const testModuleFilePaths:Array<string> =
            Helper.determineModuleLocations(
                configuration.testInBrowser.injection.internal,
                configuration.module.aliases, configuration.knownExtensions,
                configuration.path.context, configuration.path.ignore
            ).filePaths
        for (const buildConfiguration of buildConfigurations)
            for (const filePath:string of buildConfiguration.filePaths)
                if (!testModuleFilePaths.includes(filePath)) {
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
                    processPromises.push(new Promise((
                        resolve:PromiseCallbackFunction,
                        reject:PromiseCallbackFunction
                    ):number => childProcesses.push(run(evaluationFunction(
                        global, configuration, buildConfiguration, path,
                        additionalArguments, filePath
                        ), childProcessOptions, (error:?Error) => {
                            if (error)
                                reject(error)
                            else
                                resolve()
                        }))))
                }
    // endregion
    // region handle serve
    } else if (process.argv[2] === 'serve')
        // Provide a development environment where all assets are dynamically
        // bundled and updated on changes.
        processPromises.push(new Promise((
            resolve:PromiseCallbackFunction, reject:PromiseCallbackFunction
        ):number => childProcesses.push(run(
            `${configuration.commandLine.serve} ${additionalArguments}`,
            childProcessOptions, (error:?Error) => {
                if (error)
                    reject(error)
                else
                    resolve()
            }))))
    // endregion
}
// / region handle child process interface
if (childProcesses.length === 0) {
    // If no sub process could be started a message with all available
    // arguments is printed.
    if (configuration.library)
        console.log(
            'Give one of "build", "clear", "document", "lint", "test", ' +
            '"testInBrowser" or "preinstall" as command line argument. You ' +
            'can provide a json string as second parameter to dynamically ' +
            'overwrite some configurations.\n')
    else
        console.log(
            'Give one of "build", "clear", "document", "lint", "test", ' +
            '"testInBrowser" or "serve" as command line argument. You can ' +
            'provide a json string as second parameter to dynamically ' +
            'overwrite some configurations.\n')
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
