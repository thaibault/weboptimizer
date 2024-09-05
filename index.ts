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
import {
    AnyFunction,
    CLOSE_EVENT_NAMES,
    copyDirectoryRecursiveSync,
    copyFileSync,
    evaluate,
    EvaluationResult,
    File,
    getProcessCloseHandler,
    handleChildProcess,
    isDirectory,
    isDirectorySync,
    isFile,
    isFileSync,
    isPlainObject,
    Mapping,
    MAXIMAL_NUMBER_OF_ITERATIONS,
    NOOP,
    parseEncodedObject,
    PlainObject,
    ProcedureFunction,
    ProcessCloseCallback,
    ProcessCloseReason,
    ProcessError,
    ProcessErrorCallback,
    ProcessHandler,
    walkDirectoryRecursively
} from 'clientnode'
import {chmodSync, unlinkSync} from 'fs'
import {writeFile, unlink} from 'fs/promises'
import {sync as globSync} from 'glob-all'
import path, {join, resolve} from 'path'
import {
    rimraf as removeDirectoryRecursively,
    sync as removeDirectoryRecursivelySync
} from 'rimraf'

import {load as loadConfiguration} from './configurator'
import {
    determineAssetType,
    determineModuleFilePath,
    determineModuleLocations,
    isFilePathInLocation,
    renderFilePathTemplate,
    resolveBuildConfigurationFilePaths,
    stripLoader
} from './helper'
import {
    Command,
    CommandLineArguments,
    GivenInjection,
    ResolvedBuildConfiguration,
    ResolvedBuildConfigurationItem,
    ResolvedConfiguration
} from './type'
// endregion
// NOTE: Environment variables can only be strings.
process.env.UV_THREADPOOL_SIZE = '128'
/**
 * Main entry point.
 * @param context - Location from where to build current application.
 * @param currentWorkingDirectory - Current working directory to use as
 * reference.
 * @param commandLineArguments - Arguments to take into account.
 * @param webOptimizerPath - Current optimizer context path.
 * @param environment - Environment variables to take into account.
 * @returns Nothing.
 */
const main = async (
    context?: string,
    currentWorkingDirectory: string = process.cwd(),
    commandLineArguments: Array<string> = process.argv,
    webOptimizerPath: string = __dirname,
    /*
        NOTE: We have to avoid that some pre-processor removes this
        assignment.
    */
    environment: NodeJS.ProcessEnv = eval('process.env') as NodeJS.ProcessEnv
): Promise<() => void> => {
    if (environment.PATH && !environment.PATH.includes(':node_modules/.bin'))
        environment.PATH += ':node_modules/.bin'
    else
        environment.PATH = 'node_modules/.bin'

    const configuration: ResolvedConfiguration = loadConfiguration(
        context,
        currentWorkingDirectory,
        commandLineArguments,
        webOptimizerPath,
        environment
    )

    let clear: () => void = NOOP() as () => void

    try {
        // region controller
        const processOptions: ExecOptions = {
            cwd: configuration.path.context,
            env: environment
        }
        const childProcessOptions: CommonSpawnOptions = {
            shell: true,
            stdio: 'inherit',
            ...processOptions
        }
        const childProcesses: Array<ChildProcess> = []
        const processPromises: Array<Promise<ProcessCloseReason>> = []
        const possibleArguments: Array<string> = [
            'build',
            'build:types',
            'clear',
            'document',
            'lint',
            'preinstall',
            'serve',
            'test',
            'test:browser',
            'test:coverage',
            'test:coverage:report',
            'check:types'
        ]
        const closeEventHandlers: Array<AnyFunction> = []
        if (configuration.givenCommandLineArguments.length > 2) {
            // region temporary save dynamically given configurations
            // NOTE: We need a copy of given arguments array.
            const dynamicConfiguration: PlainObject = {
                givenCommandLineArguments:
                    configuration.givenCommandLineArguments.slice()
            }
            if (
                configuration.givenCommandLineArguments.length > 3 &&
                parseEncodedObject(
                    configuration.givenCommandLineArguments[
                        configuration.givenCommandLineArguments.length - 1
                    ],
                    configuration as unknown as Mapping<unknown>,
                    'configuration'
                )
            )
                configuration.givenCommandLineArguments.pop()

            let count = 0
            let filePath: string = resolve(
                configuration.path.context,
                `.dynamicConfiguration-${String(count)}.json`
            )
            for (
                ;
                count < MAXIMAL_NUMBER_OF_ITERATIONS.value;
                count++
            ) {
                filePath = resolve(
                    configuration.path.context,
                    `.dynamicConfiguration-${String(count)}.json`
                )
                if (!(await isFile(filePath)))
                    break
            }
            await writeFile(filePath, JSON.stringify(dynamicConfiguration))

            const additionalArguments: Array<string> =
                commandLineArguments.splice(3)
            /// region register exit handler to tidy up
            clear = (error?: Error): void => {
                // NOTE: Close handler have to be synchronous.
                if (isFileSync(filePath))
                    unlinkSync(filePath)

                if (error)
                    throw error
            }
            closeEventHandlers.push(clear)
            /// endregion
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
                    'build',
                    'build:types',
                    'preinstall',
                    'serve',
                    'test',
                    'test:browser',
                    'test:coverage',
                    'test:coverage:report'
                ].includes(configuration.givenCommandLineArguments[2]) &&
                possibleArguments.includes(
                    configuration.givenCommandLineArguments[2]
                )
            ) {
                if (
                    resolve(configuration.path.target.base) ===
                    resolve(configuration.path.context)
                ) {
                    // Removes all compiled files.
                    await walkDirectoryRecursively(
                        configuration.path.target.base,
                        async (file: File): Promise<false|undefined> => {
                            if (isFilePathInLocation(
                                file.path,
                                configuration.path.ignore
                                    .concat(
                                        configuration.module.directoryNames,
                                        configuration.loader.directoryNames
                                    )
                                    .map((filePath: string): string =>
                                        resolve(
                                            configuration.path.context,
                                            filePath
                                        )
                                    )
                                    .filter((filePath: string): boolean =>
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
                                        await removeDirectoryRecursively(
                                            file.path
                                        )

                                        return false
                                    }

                                    await unlink(file.path)

                                    break
                                }
                        }
                    )

                    for (
                        const file of (
                            await walkDirectoryRecursively(
                                configuration.path.target.base,
                                () => false,
                                configuration.encoding
                            )
                        )
                    )
                        if (file.name.startsWith('npm-debug'))
                            await unlink(file.path)
                } else
                    await removeDirectoryRecursively(
                        configuration.path.target.base
                    )

                if (await isDirectory(
                    configuration.path.apiDocumentation
                ))
                    await removeDirectoryRecursively(
                        configuration.path.apiDocumentation
                    )

                for (const filePath of configuration.path.tidyUpOnClear)
                    if (filePath)
                        if (isFileSync(filePath))
                            // NOTE: Close handler have to be synchronous.
                            unlinkSync(filePath)
                        else if (isDirectorySync(filePath))
                            removeDirectoryRecursivelySync(filePath)

                removeDirectoryRecursivelySync(
                    globSync(configuration.path.tidyUpOnClearGlobs)
                )
            }
            // endregion
            // region handle build
            const buildConfigurations: ResolvedBuildConfiguration =
                resolveBuildConfigurationFilePaths(
                    configuration.buildContext.types,
                    configuration.path.source.asset.base,
                    configuration.path.ignore.concat(
                        configuration.module.directoryNames,
                        configuration.loader.directoryNames
                    ).map((filePath: string): string =>
                        resolve(configuration.path.context, filePath)
                    ).filter((filePath: string): boolean =>
                        !configuration.path.context.startsWith(filePath)
                    ),
                    configuration.package.main.fileNames
                )

            if ([
                'build',
                'document',
                'test',
                'test:coverage',
                'test:coverage:report'
            ].includes(commandLineArguments[2])) {
                let tidiedUp = false
                const tidyUp = (): void => {
                    /*
                        Determines all none javaScript entities which have been
                        emitted as single module to remove.
                    */
                    if (tidiedUp)
                        return

                    tidiedUp = true
                    for (const [chunkName, chunk] of Object.entries(
                        configuration.injection.entry.normalized
                    ))
                        for (const moduleID of chunk) {
                            const filePath: null|string =
                                determineModuleFilePath(
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

                            let type: null|string = null
                            if (filePath)
                                type = determineAssetType(
                                    filePath,
                                    configuration.buildContext.types,
                                    configuration.path
                                )

                            if (
                                typeof type === 'string' &&
                                Object.prototype.hasOwnProperty.call(
                                    configuration.buildContext.types, type
                                )
                            ) {
                                const filePath: string = renderFilePathTemplate(
                                    stripLoader(
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
                                    isFileSync(filePath)
                                )
                                    chmodSync(filePath, '755')
                            }
                        }

                    for (const filePath of configuration.path.tidyUp)
                        if (filePath)
                            if (isFileSync(filePath))
                                // NOTE: Close handler have to be synchronous.
                                unlinkSync(filePath)
                            else if (isDirectorySync(filePath))
                                removeDirectoryRecursivelySync(filePath)

                    removeDirectoryRecursivelySync(
                        globSync(configuration.path.tidyUpGlobs)
                    )
                }

                closeEventHandlers.push(tidyUp)

                /*
                    Triggers complete asset compiling and bundles them into the
                    final productive output.
                */
                processPromises.push(new Promise<ProcessCloseReason>((
                    resolve: ProcessCloseCallback, reject: ProcessErrorCallback
                ): Array<ChildProcess> => {
                    const commandLineArguments: Array<string> = (
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

                    /*
                        NOTE: Take current weboptimizer's dependencies into
                        account.
                    */
                    if (!childProcessOptions.env)
                        childProcessOptions.env = {}
                    if (typeof childProcessOptions.env.PATH !== 'string')
                        childProcessOptions.env.PATH = ''
                    childProcessOptions.env.PATH +=
                        `: ${webOptimizerPath}/node_modules/.bin`

                    const childProcess: ChildProcess = spawnChildProcess(
                        configuration.commandLine.build.command,
                        commandLineArguments,
                        childProcessOptions
                    )

                    const copyAdditionalFilesAndTidyUp: ProcedureFunction = (
                    ): void => {
                        for (
                            const filePath of
                            configuration.files.additionalPaths
                        ) {
                            const sourcePath: string =
                                join(configuration.path.source.base, filePath)
                            const targetPath: string =
                                join(configuration.path.target.base, filePath)

                            // NOTE: Close handler have to be synchronous.
                            if (isDirectorySync(sourcePath)) {
                                if (isDirectorySync(targetPath))
                                    removeDirectoryRecursivelySync(targetPath)

                                copyDirectoryRecursiveSync(
                                    sourcePath, targetPath
                                )
                            } else if (isFileSync(sourcePath))
                                copyFileSync(sourcePath, targetPath)
                        }

                        tidyUp()
                    }

                    const closeHandler: ProcessHandler = getProcessCloseHandler(
                        resolve,
                        reject,
                        null,
                        commandLineArguments[2] === 'build' ?
                            copyAdditionalFilesAndTidyUp :
                            tidyUp

                    )

                    for (const closeEventName of CLOSE_EVENT_NAMES)
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
                let testModuleFilePaths: Array<string> = []
                if (
                    isPlainObject(configuration['test:browser'].injection) &&
                    configuration['test:browser'].injection.entry
                )
                    testModuleFilePaths = determineModuleLocations(
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
                    const expression: string = (buildConfiguration[
                        configuration.givenCommandLineArguments[2] as keyof
                            ResolvedBuildConfigurationItem
                    ] as string).trim()
                    for (const filePath of buildConfiguration.filePaths)
                        if (!testModuleFilePaths.includes(filePath)) {
                            const evaluated: EvaluationResult = evaluate(
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
                                new Promise<ProcessCloseReason>((
                                    resolve: (_value: ProcessCloseReason) =>
                                        void,
                                    reject: (_reason: Error) => void
                                ): Array<ChildProcess> => [
                                    handleChildProcess(
                                        execChildProcess(
                                            evaluated.result,
                                            {
                                                encoding:
                                                    configuration.encoding,
                                                ...processOptions
                                            },
                                            (error: Error|null) => {
                                                if (error)
                                                    reject(error)
                                                else
                                                    resolve({
                                                        reason: 'Finished.',
                                                        parameters: []
                                                    })
                                            }
                                        )
                                    )
                                ])
                            )
                        }
                }
            }
            // endregion
            // region handle remaining tasks
            const handleTask = (type: keyof CommandLineArguments): void => {
                const tasks: Array<Command> =
                    Array.isArray(configuration.commandLine[type]) ?
                        configuration.commandLine[type] :
                        [configuration.commandLine[type]]
                for (const task of tasks) {
                    const evaluated: EvaluationResult = evaluate(
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
                        processPromises.push(new Promise<ProcessCloseReason>((
                            resolve: ProcessCloseCallback,
                            reject: ProcessErrorCallback
                        ): Array<ChildProcess> => {
                            const commandLineArguments: Array<string> = (
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

                            const childProcess: ChildProcess =
                                spawnChildProcess(
                                    task.command,
                                    commandLineArguments,
                                    childProcessOptions
                                )

                            const closeHandler: ProcessHandler =
                                getProcessCloseHandler(resolve, reject)

                            for (const closeEventName of CLOSE_EVENT_NAMES)
                                childProcess.on(closeEventName, closeHandler)
                            childProcesses.push(childProcess)

                            return childProcesses
                        }))
                }
            }
            /// region a-/synchronous
            if ([
                'document',
                'test',
                'test:coverage',
                'test:coverage:report'
            ].includes(
                configuration.givenCommandLineArguments[2]
            )) {
                await Promise.all(processPromises)

                handleTask(
                    configuration.givenCommandLineArguments[2] as keyof
                        CommandLineArguments
                )
            } else if ([
                'build:types',
                'check:types',
                'lint',
                'serve',
                'test:browser'
            ].includes(configuration.givenCommandLineArguments[2]))
                handleTask(
                    configuration.givenCommandLineArguments[2] as
                        keyof CommandLineArguments
                )
            /// endregion
            // endregion
        }
        let finished = false
        const closeHandler: ProcessHandler = (
            ...parameters: Array<unknown>
        ): void => {
            if (!finished)
                for (const closeEventHandler of closeEventHandlers)
                    closeEventHandler(...parameters)

            finished = true
        }
        for (const closeEventName of CLOSE_EVENT_NAMES)
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
            console.error(error)

            process.exit((error as ProcessError).returnCode)
        }
        // endregion
    } catch (error) {
        if (configuration.debug)
            throw error
        else
            console.error(error)
    }

    return clear
}

if (require.main === module)
    void main()

export default main
