#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {
    ChildProcess, exec as execChildProcess, spawn as spawnChildProcess
} from 'child_process'
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
const childProcessOptions:Object = {
    cwd: configuration.path.context,
    env: process.env,
    shell: true,
    stdio: 'inherit'
}
const childProcesses:Array<ChildProcess> = []
const processPromises:Array<Promise> = []
if (configuration.givenCommandLineArguments.length > 2) {
    // region temporary save dynamically given configurations
    // NOTE: We need a copy of given arguments array.
    let dynamicConfiguration:PlainObject = {
        givenCommandLineArguments:
            configuration.givenCommandLineArguments.slice()}
    if (configuration.givenCommandLineArguments.length > 3) {
        const evaluationFunction = (
            configuration:ResolvedConfiguration
        ):?PlainObject =>
            // IgnoreTypeCheck
            new Function('configuration', 'return ' +
                configuration.givenCommandLineArguments[
                    configuration.givenCommandLineArguments.length - 1]
            )(configuration)
        try {
            if (Helper.isPlainObject(evaluationFunction(configuration)))
                configuration.givenCommandLineArguments.pop()
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
    if (configuration.givenCommandLineArguments[2] === 'clear') {
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
    const additionalArguments:Array<string> = process.argv.splice(3)
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
        ):number => childProcesses.push(spawnChildProcess(
            configuration.commandLine.build.command,
            (configuration.commandLine.build.arguments || []).concat(
                additionalArguments
            ), childProcessOptions, (error:?Error) => {
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
                                    configuration.build[type]
                                )
                                    if (configuration.build[
                                        type
                                    ].outputExtension === 'js')
                                        try {
                                            fileSystem.chmodSync(
                                                filePath, '755')
                                        } catch (error) {}
                                    else
                                        for (const suffix:string of [
                                            '', '.map'
                                        ])
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
    if (configuration.givenCommandLineArguments[2] === 'document')
        // Documents all specified api files.
        Promise.all(processPromises).then(():number =>
            processPromises.push(new Promise((
                resolve:PromiseCallbackFunction, reject:PromiseCallbackFunction
            ):number => childProcesses.push(spawnChildProcess(
                configuration.commandLine.document.command,
                (configuration.commandLine.document.arguments || []).concat(
                    additionalArguments
                ), childProcessOptions, (error:?Error) => {
                    if (error)
                        reject(error)
                    else
                        resolve()
                }))
            )))
    // endregion
    // region handle test
    else if (configuration.givenCommandLineArguments[2] === 'test')
        // Runs all specified tests (typically in a real browser environment).
        Promise.all(processPromises).then(():number =>
            processPromises.push(new Promise((
                resolve:PromiseCallbackFunction, reject:PromiseCallbackFunction
            ):ChildProcess => Helper.handleChildProcess(spawnChildProcess(
                configuration.commandLine.test.command,
                (configuration.commandLine.test.arguments || []).concat(
                    additionalArguments
                ), childProcessOptions, (error:?Error) => {
                    if (error)
                        reject(error)
                    else
                        resolve()
                })))))
    // endregion
    // region handle preinstall
    else if (
        configuration.library &&
        configuration.givenCommandLineArguments[2] === 'preinstall'
    ) {
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
                        additionalArguments:Array<string>, filePath:string
                    ):string =>
                        // IgnoreTypeCheck
                        new Function(
                            'global', 'self', 'buildConfiguration', 'path',
                            'additionalArguments', 'filePath', 'return `' +
                            buildConfiguration[
                                configuration.givenCommandLineArguments[2]
                            ] + '`'
                        )(
                            global, self, buildConfiguration, path,
                            additionalArguments, filePath)
                    processPromises.push(new Promise((
                        resolve:PromiseCallbackFunction,
                        reject:PromiseCallbackFunction
                    ):number => childProcesses.push(execChildProcess(
                        evaluationFunction(
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
    } else
        // region handle remaining tasks
        for (const type of ['lint', 'testInBrowser', 'typeCheck', 'serve'])
            if (configuration.givenCommandLineArguments[2] === type) {
                // Lints files with respect to given linting configuration.
                processPromises.push(new Promise((
                    resolve:PromiseCallbackFunction,
                    reject:PromiseCallbackFunction
                ):number => childProcesses.push(spawnChildProcess(
                    configuration.commandLine[type].command,
                    (configuration.commandLine[type].arguments || []).concat(
                        additionalArguments
                    ), childProcessOptions, (error:?Error) => {
                        if (error)
                            reject(error)
                        else
                            resolve()
                    }))))
                break
            }
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
