#!/usr/bin/env node
// -*- coding: utf-8 -*-
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
    ChildProcess, exec as execChildProcess, spawn as spawnChildProcess
} from 'child_process'
import Tools, {File, PlainObject} from 'clientnode'
import synchronousFileSystem from 'fs'
import {promises as fileSystem} from 'fs'
import path from 'path'
import removeDirectoryRecursively from 'rimraf'

import configuration from './configurator.compiled'
import Helper from './helper.compiled'
import {ResolvedBuildConfiguration} from './type'
// endregion
// NOTE: Specifies number of allowed threads to spawn.
process.env.UV_THREADPOOL_SIZE = 128
/**
 * Main entry point.
 * @returns Nothing.
 */
const main = async ():Promise<void> => {
    try {
        // region controller
        const childProcessOptions:Object = {
            cwd: configuration.path.context,
            env: process.env,
            shell: true,
            stdio: 'inherit'
        }
        const childProcesses:Array<ChildProcess> = []
        const processPromises:Array<Promise<any>> = []
        const possibleArguments:Array<string> = [
            'build', 'build:dll',
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
                        configuration.givenCommandLineArguments.length - 1],
                    configuration, 'configuration')
            )
                configuration.givenCommandLineArguments.pop()
            let count:number = 0
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
                NOTE: Some tasks could depend on previously created dll
                packages so a clean should not be performed in that case.
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
                                file.path, configuration.path.ignore.concat(
                                    configuration.module.directoryNames,
                                    configuration.loader.directoryNames
                                ).map((filePath:string):string => path.resolve(
                                    configuration.path.context, filePath)
                                ).filter((filePath:string):boolean =>
                                    !configuration.path.context.startsWith(
                                        filePath))
                            ))
                                return false
                            for (
                                const type:string in
                                configuration.buildContext.types
                            )
                                if (new RegExp(
                                    configuration.buildContext.types[
                                        type
                                    ].filePathPattern
                                ).test(file.path)) {
                                    if (
                                        file.stats &&
                                        file.stats.isDirectory()
                                    ) {
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
                        const file:File of (
                            await Tools.walkDirectoryRecursively(
                                configuration.path.target.base,
                                ():false => false,
                                configuration.encoding
                            ))
                    )
                        if (
                            file.name.length > '.dll-manifest.json'.length &&
                            file.name.endsWith('.dll-manifest.json') ||
                            file.name.startsWith('npm-debug')
                        )
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
            if (['build', 'build:dll', 'document', 'test'].includes(
                process.argv[2]
            )) {
                let tidiedUp:boolean = false
                const tidyUp:Function = ():void => {
                    /*
                        Determines all none javaScript entities which have been
                        emitted as single module to remove.
                    */
                    if (tidiedUp)
                        return
                    tidiedUp = true
                    for (
                        const chunkName:string in
                        configuration.injection.entry.normalized
                    )
                        if (configuration.injection.entry.normalized
                            .hasOwnProperty(chunkName)
                        )
                            for (const moduleID:string of
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
                                                .internal,
                                            module: configuration.extensions
                                                .module
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
                                let type:string
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
                                            filePath, '755')
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
                processPromises.push(new Promise((
                    resolve:Function, reject:Function
                ):void => {
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
                    const copyAdditionalFilesAndTidyUp:Function = (
                        ...parameter:Array<any>
                    ):void => {
                        for (
                            const filePath:string of
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
                    const closeHandler:Function = Tools.getProcessCloseHandler(
                        resolve,
                        reject,
                        null,
                        (process.argv[2] === 'build') ?
                            copyAdditionalFilesAndTidyUp :
                            tidyUp
                    )
                    for (const closeEventName:string of Tools.closeEventNames)
                        childProcess.on(closeEventName, closeHandler)
                    childProcesses.push(childProcess)
                }))
            // endregion
            // region handle preinstall
            } else if (
                configuration.library &&
                configuration.givenCommandLineArguments[2] === 'preinstall'
            ) {
                // Perform all file specific preprocessing stuff.
                const testModuleFilePaths:Array<string> =
                    Helper.determineModuleLocations(
                        configuration['test:browser'].injection.entry,
                        configuration.module.aliases,
                        configuration.module.replacements.normal,
                        {
                            file: configuration.extensions.file.internal,
                            module: configuration.extensions.module
                        },
                        configuration.path.context,
                        configuration.path.source.asset.base,
                        configuration.path.ignore
                    ).filePaths
                for (const buildConfiguration of buildConfigurations)
                    for (const filePath:string of buildConfiguration.filePaths)
                        if (!testModuleFilePaths.includes(filePath)) {
                            const evaluationFunction = (
                                global:Object, self:PlainObject,
                                buildConfiguration:PlainObject,
                                path:typeof path,
                                additionalArguments:Array<string>,
                                filePath:string
                            ):string =>
                                new Function(
                                    'global', 'self', 'buildConfiguration',
                                    'path', 'additionalArguments', 'filePath',
                                    'return `' + buildConfiguration[
                                        configuration
                                            .givenCommandLineArguments[2]
                                    ].trim() + '`'
                                )(
                                    global, self, buildConfiguration, path,
                                    additionalArguments, filePath)
                            const command:string = evaluationFunction(
                                global, configuration, buildConfiguration,
                                path, additionalArguments, filePath)
                            console.info(`Running "${command}"`)
                            processPromises.push(new Promise((
                                resolve:Function, reject:Function
                            ):ChildProcess => Tools.handleChildProcess(
                                execChildProcess(
                                    command,
                                    childProcessOptions,
                                    (error:Error):void =>
                                        error ? reject(error) : resolve()
                                )
                            )))
                        }
            }
            // endregion
            // region handle remaining tasks
            const handleTask = (type:string):void => {
                let tasks:Array<Object>
                if (Array.isArray(configuration.commandLine[type]))
                    tasks = configuration.commandLine[type]
                else
                    tasks = [configuration.commandLine[type]]
                for (const task:Object of tasks) {
                    const evaluationFunction = (
                        global:Object, self:PlainObject, path:typeof path
                    ):boolean =>
                        new Function(
                            'global', 'self', 'path',
                            'return ' + (task.hasOwnProperty(
                                'indicator'
                            ) ? task.indicator : 'true')
                        )(global, self, path)
                    if (evaluationFunction(global, configuration, path))
                        processPromises.push(new Promise((
                            resolve:Function, reject:Function
                        ):void => {
                            const commandLineArguments:Array<string> = (
                                task.arguments || []
                            ).concat(additionalArguments)
                            console.info('Running "' + (
                                `${task.command} ` + commandLineArguments.join(
                                    ' ')
                            ).trim() + '"')
                            const childProcess:ChildProcess =
                                spawnChildProcess(
                                    task.command, commandLineArguments,
                                    childProcessOptions)
                            const closeHandler:Function =
                                Tools.getProcessCloseHandler(resolve, reject)
                            for (
                                const closeEventName:string of
                                Tools.closeEventNames
                            )
                                childProcess.on(closeEventName, closeHandler)
                            childProcesses.push(childProcess)
                        }))
                }
            }
            // / region a-/synchronous
            if (['document', 'test'].includes(
                configuration.givenCommandLineArguments[2]
            )) {
                await Promise.all(processPromises)
                handleTask(configuration.givenCommandLineArguments[2])
            } else if ([
                'check:types', 'lint', 'serve', 'test:browser'
            ].includes(configuration.givenCommandLineArguments[2]))
                handleTask(configuration.givenCommandLineArguments[2])
            // / endregion
            // endregion
        }
        let finished:boolean = false
        const closeHandler = (...parameter:Array<any>):void => {
            if (!finished)
                for (const closeEventHandler:Function of closeEventHandlers)
                    closeEventHandler(...parameter)
            finished = true
        }
        for (const closeEventName:string of Tools.closeEventNames)
            process.on(closeEventName, closeHandler)
        if (require.main === module && (
            configuration.givenCommandLineArguments.length < 3 ||
            !possibleArguments.includes(
                configuration.givenCommandLineArguments[2])
        ))
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
