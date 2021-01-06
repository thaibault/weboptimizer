#!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module weboptimizer */
'use strict'
/* !
    region header
    [Project page](https://torben.website/webOptimizer)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {
    ChildProcess,
    CommonSpawnOptions,
    exec as execChildProcess,
    ExecOptions,
    spawn as spawnChildProcess
} from 'child_process'
import Tools, {CloseEventNames} from 'clientnode'
import {
    EvaluationResult,
    File,
    PlainObject,
    ProcedureFunction,
    ProcessCloseCallback,
    ProcessErrorCallback,
    ProcessHandler
} from 'clientnode/type'
import synchronousFileSystem from 'fs'
import {promises as fileSystem} from 'fs'
import path from 'path'
import removeDirectoryRecursively from 'rimraf'

import configuration from './configurator'
import Helper from './helper'
import {
    Command,
    CommandLineArguments,
    GivenInjection,
    ResolvedConfiguration,
    ResolvedBuildConfiguration,
    ResolvedBuildConfigurationItem
} from './type'
// endregion
type PathModule = typeof path
// NOTE: Environment variables can only be strings.
process.env.UV_THREADPOOL_SIZE = '128'
/**
 * Main entry point.
 * @returns Nothing.
 */
const main = async ():Promise<void> => {
    try {
        // region controller
        const processOptions:ExecOptions = {
            cwd: configuration.path.context,
            env: process.env
        }
        const childProcessOptions:CommonSpawnOptions = {
            shell: true,
            stdio: 'inherit',
            ...processOptions
        }
        const childProcesses:Array<ChildProcess> = []
        const processPromises:Array<Promise<Array<ChildProcess>>> = []
        const possibleArguments:Array<string> = [
            'build',
            'clear',
            'document',
            'lint',
            'preinstall',
            'serve',
            'test',
            'test:browser',
            'check:types'
        ]
        const closeEventHandlers:Array<Function> = []
        if (configuration.givenCommandLineArguments.length > 2) {
            // region temporary save dynamically given configurations
            // NOTE: We need a copy of given arguments array.
            const dynamicConfiguration:PlainObject = {
                givenCommandLineArguments:
                    configuration.givenCommandLineArguments.slice()
            }
            if (
                configuration.givenCommandLineArguments.length > 3 &&
                Tools.stringParseEncodedObject(
                    configuration.givenCommandLineArguments[
                        configuration.givenCommandLineArguments.length - 1
                    ],
                    configuration,
                    'configuration'
                )
            )
                configuration.givenCommandLineArguments.pop()
            let count = 0
            let filePath:string = path.resolve(
                configuration.path.context,
                `.dynamicConfiguration-${count}.json`
            )
            while (true) {
                filePath = path.resolve(
                    configuration.path.context,
                    `.dynamicConfiguration-${count}.json`
                )
                if (!(await Tools.isFile(filePath)))
                    break
                count += 1
            }
            await fileSystem.writeFile(
                filePath, JSON.stringify(dynamicConfiguration))
            const additionalArguments:Array<string> = process.argv.splice(3)
            // / region register exit handler to tidy up
            closeEventHandlers.push((error:Error):void => {
                // NOTE: Close handler have to be synchronous.
                if (Tools.isFileSync(filePath))
                    synchronousFileSystem.unlinkSync(filePath)
                if (error)
                    throw error
            })
            // / endregion
            // endregion
            // region handle clear
            /*
                NOTE: Some tasks could depend on previously created artefacts
                packages so a preceding clear should not be performed in that
                cases.
                NOTE: If we have a dependency cycle we need to preserve files
                during pre-install phase.
            */
            if (
                ![
                    'build', 'preinstall', 'serve', 'test', 'test:browser'
                ].includes(configuration.givenCommandLineArguments[2]) &&
                possibleArguments.includes(
                    configuration.givenCommandLineArguments[2]
                )
            ) {
                if (
                    path.resolve(configuration.path.target.base) ===
                    path.resolve(configuration.path.context)
                ) {
                    // Removes all compiled files.
                    await Tools.walkDirectoryRecursively(
                        configuration.path.target.base,
                        async (file:File):Promise<false|undefined> => {
                            if (Helper.isFilePathInLocation(
                                file.path,
                                configuration.path.ignore
                                    .concat(
                                        configuration.module.directoryNames,
                                        configuration.loader.directoryNames
                                    )
                                    .map((filePath:string):string =>
                                        path.resolve(
                                            configuration.path.context,
                                            filePath
                                        )
                                    )
                                    .filter((filePath:string):boolean =>
                                        !configuration.path.context.startsWith(
                                            filePath
                                        )
                                    )
                            ))
                                return false
                            for (
                                const type in configuration.buildContext.types
                            )
                                if (new RegExp(
                                    configuration.buildContext.types[
                                        type
                                    ].filePathPattern
                                ).test(file.path)) {
                                    if (file.stats?.isDirectory()) {
                                        await new Promise((
                                            resolve:Function, reject:Function
                                        ):void => removeDirectoryRecursively(
                                            file.path,
                                            {glob: false},
                                            (error:Error):void =>
                                                error ?
                                                    reject(error) :
                                                    resolve()
                                        ))
                                        return false
                                    }
                                    await fileSystem.unlink(file.path)
                                    break
                                }
                        }
                    )
                    for (
                        const file of (
                            await Tools.walkDirectoryRecursively(
                                configuration.path.target.base,
                                ():false => false,
                                configuration.encoding
                            )
                        )
                    )
                        if (file.name.startsWith('npm-debug'))
                            await fileSystem.unlink(file.path)
                } else
                    await new Promise((
                        resolve:Function, reject:Function
                    ):void => removeDirectoryRecursively(
                        configuration.path.target.base,
                        {glob: false},
                        (error:Error):void => error ? reject(error) : resolve()
                    ))
                if (
                    await Tools.isDirectory(
                        configuration.path.apiDocumentation)
                )
                    await new Promise((
                        resolve:Function, reject:Function
                    ):void =>
                        removeDirectoryRecursively(
                            configuration.path.apiDocumentation,
                            {glob: false},
                            (error:Error):void =>
                                error ? reject(error) : resolve()
                        )
                    )
                for (const filePath of configuration.path.tidyUpOnClear)
                    if (filePath)
                        if (Tools.isFileSync(filePath))
                            // NOTE: Close handler have to be synchronous.
                            synchronousFileSystem.unlinkSync(filePath)
                        else if (Tools.isDirectorySync(filePath))
                            removeDirectoryRecursively.sync(
                                filePath, {glob: false})
            }
            // endregion
            // region handle build
            const buildConfigurations:ResolvedBuildConfiguration =
                Helper.resolveBuildConfigurationFilePaths(
                    configuration.buildContext.types,
                    configuration.path.source.asset.base,
                    configuration.path.ignore.concat(
                        configuration.module.directoryNames,
                        configuration.loader.directoryNames
                    ).map((filePath:string):string =>
                        path.resolve(configuration.path.context, filePath)
                    ).filter((filePath:string):boolean =>
                        !configuration.path.context.startsWith(filePath)
                    ),
                    configuration.package.main.fileNames
                )
            if (['build', 'document', 'test'].includes(
                process.argv[2]
            )) {
                let tidiedUp = false
                const tidyUp:Function = ():void => {
                    /*
                        Determines all none javaScript entities which have been
                        emitted as single module to remove.
                    */
                    if (tidiedUp)
                        return
                    tidiedUp = true
                    for (
                        const chunkName in
                        configuration.injection.entry.normalized
                    )
                        if (Object.prototype.hasOwnProperty.call(
                            configuration.injection.entry.normalized, chunkName
                        ))
                            for (const moduleID of
                                configuration.injection.entry.normalized[
                                    chunkName]
                            ) {
                                const filePath:null|string =
                                    Helper.determineModuleFilePath(
                                        moduleID,
                                        configuration.module.aliases,
                                        configuration.module.replacements
                                            .normal,
                                        {
                                            file: configuration.extensions.file
                                                .internal
                                        },
                                        configuration.path.context,
                                        configuration.path.source.asset.base,
                                        configuration.path.ignore,
                                        configuration.module.directoryNames,
                                        configuration.package.main.fileNames,
                                        configuration.package.main
                                            .propertyNames,
                                        configuration.package
                                            .aliasPropertyNames,
                                        configuration.encoding
                                    )
                                let type:null|string = null
                                if (filePath)
                                    type = Helper.determineAssetType(
                                        filePath,
                                        configuration.buildContext.types,
                                        configuration.path
                                    )
                                if (
                                    typeof type === 'string' &&
                                    configuration.buildContext.types[type]
                                ) {
                                    const filePath:string =
                                        Helper.renderFilePathTemplate(
                                            Helper.stripLoader(
                                                configuration.files.compose
                                                    .javaScript
                                            ),
                                            {'[name]': chunkName}
                                        )
                                    /*
                                        NOTE: Close handler have to be
                                        synchronous.
                                    */
                                    if (
                                        configuration.buildContext.types[
                                            type
                                        ].outputExtension === 'js' &&
                                        Tools.isFileSync(filePath)
                                    )
                                        synchronousFileSystem.chmodSync(
                                            filePath, '755'
                                        )
                                }
                            }
                    for (const filePath of configuration.path.tidyUp)
                        if (filePath)
                            if (Tools.isFileSync(filePath))
                                // NOTE: Close handler have to be synchronous.
                                synchronousFileSystem.unlinkSync(filePath)
                            else if (Tools.isDirectorySync(filePath))
                                removeDirectoryRecursively.sync(
                                    filePath, {glob: false})
                }
                closeEventHandlers.push(tidyUp)
                /*
                    Triggers complete asset compiling and bundles them into the
                    final productive output.
                */
                processPromises.push(new Promise<Array<ChildProcess>>((
                    resolve:Function, reject:Function
                ):Array<ChildProcess> => {
                    const commandLineArguments:Array<string> = (
                        configuration.commandLine.build.arguments || []
                    ).concat(additionalArguments)
                    console.info(
                        'Running "' +
                        (
                            `${configuration.commandLine.build.command} ` +
                            commandLineArguments.join(' ')
                        ).trim() +
                        '"'
                    )
                    const childProcess:ChildProcess = spawnChildProcess(
                        configuration.commandLine.build.command,
                        commandLineArguments,
                        childProcessOptions
                    )
                    const copyAdditionalFilesAndTidyUp:ProcedureFunction = (
                        ...parameter:Array<any>
                    ):void => {
                        for (
                            const filePath of
                            configuration.files.additionalPaths
                        ) {
                            const sourcePath:string = path.join(
                                configuration.path.source.base, filePath)
                            const targetPath:string = path.join(
                                configuration.path.target.base, filePath)
                            // NOTE: Close handler have to be synchronous.
                            if (Tools.isDirectorySync(sourcePath)) {
                                if (Tools.isDirectorySync(targetPath))
                                    removeDirectoryRecursively.sync(
                                        targetPath, {glob: false})
                                Tools.copyDirectoryRecursiveSync(
                                    sourcePath, targetPath)
                            } else if (Tools.isFileSync(sourcePath))
                                Tools.copyFileSync(sourcePath, targetPath)
                        }
                        tidyUp(...parameter)
                    }
                    const closeHandler:ProcessHandler =
                        Tools.getProcessCloseHandler(
                            resolve as ProcessCloseCallback,
                            reject as ProcessErrorCallback,
                            null,
                            process.argv[2] === 'build' ?
                                copyAdditionalFilesAndTidyUp :
                                tidyUp
                        )
                    for (const closeEventName of CloseEventNames)
                        childProcess.on(closeEventName, closeHandler)
                    childProcesses.push(childProcess)
                    return childProcesses
                }))
            // endregion
            // region handle pre-install
            } else if (
                configuration.library &&
                configuration.givenCommandLineArguments[2] === 'preinstall'
            ) {
                // Perform all file specific preprocessing stuff.
                let testModuleFilePaths:Array<string> = []
                if (
                    Tools.isPlainObject(
                        configuration['test:browser'].injection
                    ) &&
                    configuration['test:browser'].injection.entry
                )
                    testModuleFilePaths = Helper.determineModuleLocations(
                        configuration['test:browser'].injection.entry as
                            GivenInjection,
                        configuration.module.aliases,
                        configuration.module.replacements.normal,
                        {file: configuration.extensions.file.internal},
                        configuration.path.context,
                        configuration.path.source.asset.base,
                        configuration.path.ignore
                    ).filePaths
                for (const buildConfiguration of buildConfigurations) {
                    const expression:string = (buildConfiguration[
                        configuration.givenCommandLineArguments[2] as keyof
                            ResolvedBuildConfigurationItem
                    ] as string).trim()
                    for (const filePath of buildConfiguration.filePaths)
                        if (!testModuleFilePaths.includes(filePath)) {
                            type buildConfigItem =
                                ResolvedBuildConfigurationItem
                            const evaluated:EvaluationResult =
                                Tools.stringEvaluate(
                                    `\`${expression}\``,
                                    {
                                        global,
                                        self: configuration,
                                        buildConfiguration,
                                        path,
                                        additionalArguments,
                                        filePath
                                    }
                                )
                            if (evaluated.error)
                                throw new Error(
                                    'Error occurred during processing given ' +
                                    `command: ${evaluated.error}`
                                )
                            console.info(`Running "${evaluated.result}"`)
                            processPromises.push(
                                new Promise<Array<ChildProcess>>((
                                    resolve:Function, reject:Function
                                ):Array<ChildProcess> => [
                                    Tools.handleChildProcess(
                                        execChildProcess(
                                            evaluated.result,
                                            {
                                                encoding:
                                                    configuration.encoding,
                                                ...processOptions
                                            },
                                            (error:Error|null):void =>
                                                error ?
                                                    reject(error) :
                                                    resolve()
                                        )
                                    )
                                ])
                            )
                        }
                }
            }
            // endregion
            // region handle remaining tasks
            const handleTask = (type:keyof CommandLineArguments):void => {
                const tasks:Array<Command> =
                    Array.isArray(configuration.commandLine[type]) ?
                        (configuration.commandLine[type] as Array<Command>) :
                        [configuration.commandLine[type] as Command]
                for (const task of tasks) {
                    const evaluated:EvaluationResult = Tools.stringEvaluate(
                        (
                            Object.prototype.hasOwnProperty.call(
                                task, 'indicator'
                            ) ? task.indicator as string : 'true'
                        ),
                        {global, self: configuration, path}
                    )
                    if (evaluated.error)
                        throw new Error(
                            'Error occurred during processing given task: ' +
                            evaluated.error
                        )
                    if (evaluated.result)
                        processPromises.push(new Promise<Array<ChildProcess>>((
                            resolve:Function, reject:Function
                        ):Array<ChildProcess> => {
                            const commandLineArguments:Array<string> = (
                                task.arguments || []
                            ).concat(additionalArguments)
                            console.info(
                                'Running "' +
                                (
                                    `${task.command} ` +
                                    commandLineArguments.join(' ')
                                ).trim() +
                                '"'
                            )
                            const childProcess:ChildProcess =
                                spawnChildProcess(
                                    task.command,
                                    commandLineArguments,
                                    childProcessOptions
                                )
                            const closeHandler:ProcessHandler =
                                Tools.getProcessCloseHandler(
                                    resolve as ProcessCloseCallback,
                                    reject as ProcessErrorCallback
                                )
                            for (const closeEventName of CloseEventNames)
                                childProcess.on(closeEventName, closeHandler)
                            childProcesses.push(childProcess)
                            return childProcesses
                        }))
                }
            }
            // / region a-/synchronous
            if (['document', 'test'].includes(
                configuration.givenCommandLineArguments[2]
            )) {
                await Promise.all(processPromises)
                handleTask(
                    configuration.givenCommandLineArguments[2] as keyof
                        CommandLineArguments)
            } else if ([
                'check:types', 'lint', 'serve', 'test:browser'
            ].includes(configuration.givenCommandLineArguments[2]))
                handleTask(
                    configuration.givenCommandLineArguments[2] as
                        keyof CommandLineArguments
                )
            // / endregion
            // endregion
        }
        let finished = false
        const closeHandler:ProcessHandler = (...parameter:Array<any>):void => {
            if (!finished)
                for (const closeEventHandler of closeEventHandlers)
                    closeEventHandler(...parameter)
            finished = true
        }
        for (const closeEventName of CloseEventNames)
            // @ts-ignore: Accepts only "NodeSignals" but other strings are
            // available.
            process.on(closeEventName, closeHandler)
        if (
            require.main === module &&
            (
                configuration.givenCommandLineArguments.length < 3 ||
                !possibleArguments.includes(
                    configuration.givenCommandLineArguments[2]
                )
            )
        )
            console.info(
                `Give one of "${possibleArguments.join('", "')}" as command ` +
                'line argument. You can provide a json string as second ' +
                'parameter to dynamically overwrite some configurations.\n'
            )
        // endregion
        // region forward nested return codes
        try {
            await Promise.all(processPromises)
        } catch (error) {
            process.exit(error.returnCode)
        }
        // endregion
    } catch (error) {
        if (configuration.debug)
            throw error
        else
            console.error(error)
    }
}
if (require.main === module)
    main()
export default main
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
