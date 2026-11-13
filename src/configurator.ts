// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module configurator */
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 4.0 international license.
    See https://creativecommons.org/licenses/by/4.0/deed.de
    endregion
*/
// region imports
import type {
    Mapping, PlainObject, RecursiveAsyncEvaluateable, RecursiveEvaluateable
} from 'clientnode'

import type {
    DefaultConfiguration,
    GivenInjection,
    GivenInjectionConfiguration,
    InjectionConfiguration,
    ResolvedBuildConfigurationItem,
    ResolvedConfiguration,
    RuntimeInformation
} from './type'

import {
    convertCircularObjectToJSON,
    copy,
    evaluate,
    evaluateAsyncDynamicData,
    evaluateDynamicData,
    extend,
    getUTCTimestamp,
    importFilesystemAPI,
    isFile,
    isObject,
    isPlainObject,
    Logger,
    MAXIMAL_NUMBER_OF_ITERATIONS,
    modifyObject,
    optionalImport,
    parseEncodedObject,
    removeKeyPrefixes,
    UTILITY_SCOPE
} from 'clientnode'
import fileSystemSynchronous from 'fs'
import fileSystem, {lstat, readFile, unlink} from 'fs/promises'
import path, {basename, dirname, isAbsolute, join, resolve} from 'path'

import {
    determineAssetType,
    determineModuleFilePath,
    determineModuleLocations,
    resolveAutoInjection,
    resolveBuildConfigurationFilePaths,
    resolveModulesInFolders,
    normalizeGivenInjection,
    normalizePaths
} from './helper'
import packageConfiguration from '../package.json' with {type: 'json'}
import {SubConfigurationTypes} from './type'
// endregion
const {configuration: metaConfiguration} = packageConfiguration

/**
 * Determines whether given value has to be evaluated first.
 * @param value - Value to check.
 * @returns Indicates whether given value is a dynamic one.
 */
export const isDynamicValue = (value: unknown): boolean =>
    isPlainObject(value) &&
    ['__evaluate__', '__execute__'].some((name: string): boolean =>
        Object.prototype.hasOwnProperty.call(value, name)
    )
/**
 * Resolves given (nested) locations against their nearest "base" location
 * and adds a trailing slash to each of them. Dynamic "base" locations are
 * evaluated directly since other locations depend on them. Other dynamic
 * locations are skipped and registered to be resolved after their
 * evaluation.
 * @param locations - Locations to resolve in place.
 * @param parentBase - Absolute location to resolve given "base" against.
 * @param evaluateLocation - Evaluates a dynamic location.
 * @param deferredLocations - Collects dynamic locations to resolve later.
 * @param keys - Key path to given locations.
 * @param level - Nesting level of given locations.
 */
export const makeLocationsAbsolute = (
    locations: Mapping<unknown>,
    parentBase: string,
    evaluateLocation: (location: Mapping<unknown>) => string,
    deferredLocations: Array<{base: string, keys: Array<string>}> = [],
    keys: Array<string> = [],
    level = 1
): void => {
    if (isDynamicValue(locations.base))
        locations.base = evaluateLocation(locations.base as Mapping<unknown>)
    if (Object.prototype.hasOwnProperty.call(locations, 'base'))
        locations.base = resolve(parentBase, locations.base as string)

    const base: string = (locations.base as string | undefined) ?? parentBase
    const ignoredKeys: Array<string> =
        [[], ['configuration'], ['options', 'public'], []][level]

    for (const [key, location] of Object.entries(locations))
        if (key === 'base' || ignoredKeys.includes(key))
            continue
        else if (typeof location === 'string')
            locations[key] = resolve(base, location) + '/'
        else if (isDynamicValue(location))
            deferredLocations.push({base, keys: keys.concat(key)})
        else if (level < 3 && isPlainObject(location))
            makeLocationsAbsolute(
                location,
                base,
                evaluateLocation,
                deferredLocations,
                keys.concat(key),
                level + 1
            )
}

export let loadedConfiguration: null | ResolvedConfiguration = null
export const log = new Logger({name: 'weboptimizer.configurator'})

// Wait until optional filesystem modules have been loaded.
await importFilesystemAPI()

/**
 * Main entry point to determine current configuration.
 * @param context - Location from where to build current application.
 * @param currentWorkingDirectory - Current working directory to use as
 * reference.
 * @param commandLineArguments - Arguments to take into account.
 * @param webOptimizerPath - Current optimizer context path.
 * @param environment - Environment variables to take into account.
 * @returns Nothing.
 */
export const load = async (
    context?: string,
    currentWorkingDirectory: string = process.cwd(),
    commandLineArguments: Array<string> = process.argv,
    webOptimizerPath: string = resolve(import.meta.dirname, '..'),
    /*
        NOTE: We have to avoid that some pre-processor removes this
        assignment.
    */
    // eslint-disable-next-lien no-eval
    environment: NodeJS.ProcessEnv = eval('process.env') as NodeJS.ProcessEnv
): Promise<ResolvedConfiguration> => {
    // region determine application context location
    if (context)
        metaConfiguration.default.path.context = context
    else {
        /*
            To assume to go two folder up from this file until there is no
            "node_modules" parent folder is usually resilient again dealing
            with projects where current working directory isn't the projects
            directory and this library is located as a nested dependency.
        */
        metaConfiguration.default.path.context = webOptimizerPath
        for (
            let level = 0;
            level < MAXIMAL_NUMBER_OF_ITERATIONS.value;
            level++
        ) {
            metaConfiguration.default.path.context =
                resolve(metaConfiguration.default.path.context, '../../')
            if (
                basename(dirname(metaConfiguration.default.path.context)) !==
                    'node_modules'
            )
                break
        }
        if (
            basename(dirname(currentWorkingDirectory)) === 'node_modules' ||
            basename(dirname(currentWorkingDirectory)) === '.staging' &&
            basename(dirname(dirname(currentWorkingDirectory))) ===
                'node_modules'
        ) {
            /*
                NOTE: If we are dealing was a dependency project use current
                directory as context.
            */
            metaConfiguration.default.path.context = currentWorkingDirectory
            metaConfiguration.default.contextType = 'dependency'
        } else
            /*
                NOTE: If the current working directory references this file via
                a linked "node_modules" folder using current working directory
                as context is a better assumption than two folders up the
                hierarchy.
            */
            try {
                if ((await lstat(
                    join(currentWorkingDirectory, 'node_modules'))
                ).isSymbolicLink())
                    metaConfiguration.default.path.context =
                        currentWorkingDirectory
            } catch {
                // Continue regardless of error.
            }
    }
    // endregion
    // region load application specific configuration
    let specificConfiguration: PlainObject = {}
    try {
        /*
            NOTE: Imported modules are cached so we have to copy to avoid
            leaking task specific merges into subsequent loads.
        */
        specificConfiguration = copy((await optionalImport(
            join(
                metaConfiguration.default.path.context, 'package.json'
            ),
            {with: {type: 'json'}}
        ) as PlainObject).default as PlainObject)
    } catch {
        metaConfiguration.default.path.context = currentWorkingDirectory
    }
    // endregion
    // region determine application name and web optimizer configuration
    const name: string = typeof specificConfiguration.name === 'string' ?
        specificConfiguration.name :
        (
            typeof (
                specificConfiguration.webOptimizer as Mapping | undefined
            )?.name === 'string'
        ) ?
            (specificConfiguration.webOptimizer as Mapping | undefined)?.name as
                string :
            'mockup'
    specificConfiguration =
        (specificConfiguration.webOptimizer as PlainObject | undefined) || {}
    specificConfiguration.name = name
    // endregion
    // region load additional dynamically given configuration
    let count = 0
    let filePath: null | string = null
    for (
        let iteration = 0;
        iteration < MAXIMAL_NUMBER_OF_ITERATIONS.value;
        iteration++
    ) {
        const newFilePath =
            `${metaConfiguration.default.path.context}/.dynamicConfiguration-` +
            `${String(count)}.json`

        if (!await isFile(newFilePath))
            break

        filePath = newFilePath
        count += 1
    }

    let runtimeInformation: RuntimeInformation =
        {givenCommandLineArguments: commandLineArguments}
    if (filePath) {
        const fileContent: string = await readFile(
            filePath,
            {encoding: metaConfiguration.default.encoding as BufferEncoding}
        )
        runtimeInformation = JSON.parse(fileContent) as RuntimeInformation
        await unlink(filePath)
    }
    // endregion
    // region determine debug mode
    // NOTE: Given node command line arguments results in "npm_config_*"
    // environment variables.
    let debug: boolean = metaConfiguration.default.debug
    /*
        NOTE: A configuration given via command line can only be evaluated
        without any configuration scope this early.
    */
    const givenConfiguration: null | PlainObject =
        runtimeInformation.givenCommandLineArguments.length > 3 ?
            parseEncodedObject(
                runtimeInformation.givenCommandLineArguments[
                    runtimeInformation.givenCommandLineArguments.length - 1
                ],
                {},
                'configuration'
            ) :
            null
    if (typeof givenConfiguration?.debug === 'boolean')
        debug = givenConfiguration.debug
    else if (typeof specificConfiguration.debug === 'boolean')
        debug = specificConfiguration.debug
    else if (
        environment.npm_config_dev === 'true' ||
        typeof environment.NODE_ENV === 'string' &&
        ['debug', 'dev', 'development'].includes(environment.NODE_ENV)
    )
        debug = true
    if (debug)
        environment.NODE_ENV = 'development'
    // endregion
    // region loading default configuration
    metaConfiguration.default.path.context += '/'
    // Merges final default configuration object depending on given target
    // environment.
    const libraryConfiguration: PlainObject = metaConfiguration.library
    /*
        NOTE: We have to copy to avoid leaking debug specific modifications
        into subsequent loads.
    */
    let configuration: DefaultConfiguration =
        copy(metaConfiguration.default) as unknown as DefaultConfiguration
    if (debug) {
        const debugConfiguration: PlainObject = copy(metaConfiguration.debug)
        configuration = extend(
            true,
            modifyObject(configuration, debugConfiguration),
            debugConfiguration
        )
    }

    configuration.debug = debug
    if (typeof configuration.library === 'object')
        extend(
            true,
            modifyObject(libraryConfiguration, configuration.library),
            configuration.library
        )

    if (configuration.library && specificConfiguration.library !== false) {
        const modifiedConfiguration =
            modifyObject(configuration, libraryConfiguration)

        configuration = extend(
            true,
            /*
                NOTE: We have to copy both objects otherwise the
                substucture under "path" is not extended as expected.
            */
            copy(modifiedConfiguration),
            copy(libraryConfiguration)
        )
    }

    // endregion
    // region merging and evaluating task specific and dynamic configurations
    /// region task specific configuration
    //// region apply task type specific configuration
    if (runtimeInformation.givenCommandLineArguments.length > 2)
        for (const type of SubConfigurationTypes)
            if (
                runtimeInformation.givenCommandLineArguments[2] === type ||
                debug && type === 'debug' ||
                type === 'test' &&
                runtimeInformation.givenCommandLineArguments[2].startsWith(
                    'test:'
                ) &&
                runtimeInformation.givenCommandLineArguments[2] !==
                    'test:browser'
            )
                for (const configurationTarget of [
                    configuration, specificConfiguration
                ])
                    if (isPlainObject(configurationTarget[
                        type as keyof DefaultConfiguration
                    ]))
                        extend(
                            true,
                            modifyObject(
                                configurationTarget as DefaultConfiguration,
                                configurationTarget[type]
                            ),
                            configurationTarget[type] as PlainObject
                        )
    //// endregion
    //// region clear task type specific configurations
    for (const type of SubConfigurationTypes)
        for (const configurationTarget of [
            configuration, specificConfiguration
        ])
            if (
                Object.prototype.hasOwnProperty.call(
                    configurationTarget, type
                ) &&
                typeof configurationTarget[type] === 'object'
            )
                delete configurationTarget[type]
    //// endregion
    /// endregion
    extend(
        true,
        modifyObject(
            modifyObject(configuration, specificConfiguration),
            runtimeInformation
        ),
        specificConfiguration,
        runtimeInformation
    )

    let result: null | PlainObject = null
    if (runtimeInformation.givenCommandLineArguments.length > 3)
        result = parseEncodedObject(
            runtimeInformation.givenCommandLineArguments[
                runtimeInformation.givenCommandLineArguments.length - 1
            ],
            configuration as unknown as Mapping<unknown>,
            'configuration'
        )

    if (isObject(result)) {
        if (Object.prototype.hasOwnProperty.call(result, '__reference__')) {
            const referenceNames: Array<string> =
                ([] as Array<string>).concat(result.__reference__ as string)
            delete result.__reference__
            for (const name of referenceNames)
                if (Object.prototype.hasOwnProperty.call(configuration, name))
                    extend(
                        true,
                        result,
                        configuration[name as keyof DefaultConfiguration] as
                            PlainObject
                    )
                else if (await isFile(name))
                    extend(
                        true,
                        result,
                        JSON.parse(
                            await readFile(name, configuration.encoding)
                        ) as PlainObject
                    )
                else
                    void log.warn(
                        `Given dynamic referenced configuration "${name}"`,
                        'could not be resolved.'
                    )
        }

        extend(true, modifyObject(configuration, result), result)
    }
    // Removing comments (default key name to delete is "#").
    configuration = removeKeyPrefixes(configuration)
    // endregion
    // region evaluate dynamic configuration structures
    const now: Date = new Date()
    /*
        NOTE: The configuration is not yet fully resolved but will be
        transformed in place in the following lines of code.
    */
    const evaluationOptions = {
        scope: {
            ...UTILITY_SCOPE,
            currentPath: currentWorkingDirectory,
            fs: fileSystem,
            packageConfiguration,
            path,
            webOptimizerPath,
            now,
            nowUTCTimestamp: getUTCTimestamp(now)
        }
    }
    /// region build absolute paths
    /*
        NOTE: Dynamic "base" locations (e.g. given via "__evaluate__") are
        evaluated directly, all other dynamic locations are made absolute
        after the whole configuration has been evaluated.
    */
    const deferredLocations: Array<{base: string, keys: Array<string>}> = []
    makeLocationsAbsolute(
        configuration.path,
        configuration.path.context,
        (location: Mapping<unknown>): string => {
            const execute =
                Object.prototype.hasOwnProperty.call(location, '__execute__')
            const result = evaluate(
                location[execute ? '__execute__' : '__evaluate__'] as string,
                {
                    execute,
                    scope: {
                        ...evaluationOptions.scope,
                        fs: fileSystemSynchronous,
                        self: configuration
                    }
                }
            )

            if (result.error !== null)
                throw new Error(
                    'Given location could not be evaluated: ' + result.error
                )

            return result.result
        },
        deferredLocations
    )
    /// endregion
    const resolvedConfiguration =
        await evaluateAsyncDynamicData<ResolvedConfiguration>(
            evaluateDynamicData<ResolvedConfiguration>(
                configuration as
                    unknown as
                    RecursiveEvaluateable<ResolvedConfiguration>,
                {
                    ...evaluationOptions,
                    scope: {
                        ...evaluationOptions.scope,
                        fs: fileSystemSynchronous
                    }
                }
            ) as
                unknown as
                RecursiveAsyncEvaluateable<ResolvedConfiguration>,
            evaluationOptions
        )

    for (const {base, keys} of deferredLocations) {
        const locations = keys.slice(0, -1).reduce(
            (locations: Mapping<unknown>, key: string): Mapping<unknown> =>
                locations[key] as Mapping<unknown>,
            resolvedConfiguration.path as unknown as Mapping<unknown>
        )
        const key = keys[keys.length - 1]
        const location: unknown = locations[key]
        // NOTE: Evaluated absolute locations may point to files.
        if (typeof location === 'string' && !isAbsolute(location))
            locations[key] = resolve(base, location) + '/'
    }
    // endregion
    // region consolidate file specific build configuration
    // Apply default file level build configurations to all file type specific
    // ones.
    const defaultConfiguration: PlainObject =
        resolvedConfiguration.buildContext.types.default as
            unknown as
            PlainObject
    delete resolvedConfiguration.buildContext.types.default
    for (const [type, context] of Object.entries(
        resolvedConfiguration.buildContext.types
    ))
        resolvedConfiguration.buildContext.types[type] =
            extend<ResolvedBuildConfigurationItem>(
                true,
                copy(defaultConfiguration),
                extend<ResolvedBuildConfigurationItem>(
                    true, {extension: type}, context, {type}
                )
            )
    // endregion
    // region resolve module location and which asset types are needed
    resolvedConfiguration.module.locations = determineModuleLocations(
        resolvedConfiguration.injection.entry.normalized,
        resolvedConfiguration.module.aliases,
        resolvedConfiguration.module.replacements.normal,
        {file: resolvedConfiguration.extensions.file.internal},
        resolvedConfiguration.path.context,
        resolvedConfiguration.path.source.asset.base
    )

    resolvedConfiguration.injection = resolveAutoInjection(
        resolvedConfiguration.injection as
            unknown as
            GivenInjectionConfiguration,
        resolveBuildConfigurationFilePaths(
            resolvedConfiguration.buildContext.types,
            resolvedConfiguration.path.source.asset.base,
            normalizePaths(
                resolvedConfiguration.path.ignore.concat(
                    resolvedConfiguration.module.directoryNames,
                    resolvedConfiguration.loader.directoryNames
                ).map((filePath: string): string =>
                    resolve(resolvedConfiguration.path.context, filePath)
                ).filter((filePath: string): boolean =>
                    !resolvedConfiguration.path.context.startsWith(filePath)
                )
            ),
            resolvedConfiguration.package.main.fileNames
        ),
        resolvedConfiguration.module.aliases,
        resolvedConfiguration.module.replacements.normal,
        resolvedConfiguration.extensions,
        resolvedConfiguration.path.context,
        resolvedConfiguration.path.source.asset.base,
        resolvedConfiguration.path.ignore
    ) as unknown as InjectionConfiguration
    const givenInjection: GivenInjection =
        resolvedConfiguration.injection.entry as unknown as GivenInjection
    resolvedConfiguration.injection.entry = {
        given: givenInjection,
        normalized: resolveModulesInFolders(
            normalizeGivenInjection(givenInjection),
            resolvedConfiguration.module.aliases,
            resolvedConfiguration.module.replacements.normal,
            resolvedConfiguration.path.context,
            resolvedConfiguration.path.source.asset.base,
            resolvedConfiguration.path.ignore.concat(
                resolvedConfiguration.module.directoryNames,
                resolvedConfiguration.loader.directoryNames
            ).map((filePath: string): string =>
                resolve(resolvedConfiguration.path.context, filePath)
            ).filter((filePath: string): boolean =>
                !resolvedConfiguration.path.context.startsWith(filePath)
            )
        )
    }
    resolvedConfiguration.needed = {
        javaScript:
            configuration.debug &&
            ['serve', 'test:browser'].includes(
                resolvedConfiguration.givenCommandLineArguments[2]
            )
    }

    /// region determine which asset types are needed
    for (const chunk of Object.values(
        resolvedConfiguration.injection.entry.normalized
    ))
        for (const moduleID of chunk) {
            const filePath: null | string = determineModuleFilePath(
                moduleID,
                resolvedConfiguration.module.aliases,
                resolvedConfiguration.module.replacements.normal,
                {file: resolvedConfiguration.extensions.file.internal},
                resolvedConfiguration.path.context,
                /*
                    NOTE: We don't use
                    "resolvedConfiguration.path.source.asset.base" because we
                    already have resolved all module ids.
                */
                '',
                resolvedConfiguration.path.ignore,
                resolvedConfiguration.module.directoryNames,
                resolvedConfiguration.package.main.fileNames,
                resolvedConfiguration.package.main.propertyNames,
                resolvedConfiguration.package.aliasPropertyNames,
                resolvedConfiguration.encoding
            )

            let type: null | string | undefined
            if (filePath)
                type = determineAssetType(
                    filePath,
                    resolvedConfiguration.buildContext.types,
                    resolvedConfiguration.path
                )
            else
                throw new Error(
                    `Given request "${moduleID}" couldn't be resolved.`
                )

            if (type)
                resolvedConfiguration.needed[type] = true
        }
    /// endregion
    // endregion
    // region adding special aliases
    /*
        NOTE: This alias couldn't be set in the "package.json" file since this
        would result in an endless loop.
    */
    resolvedConfiguration.loader.aliases
        .webOptimizerDefaultTemplateFileLoader = ''
    for (const loader of Array.isArray(
        resolvedConfiguration.files.defaultHTML.template.use
    ) ?
        resolvedConfiguration.files.defaultHTML.template.use :
        [resolvedConfiguration.files.defaultHTML.template.use]
    ) {
        if (
            resolvedConfiguration.loader.aliases
                .webOptimizerDefaultTemplateFileLoader
        )
            resolvedConfiguration.loader.aliases
                .webOptimizerDefaultTemplateFileLoader += '!'
        resolvedConfiguration.loader.aliases
            .webOptimizerDefaultTemplateFileLoader += loader.loader
        if (loader.options)
            resolvedConfiguration.loader.aliases
                .webOptimizerDefaultTemplateFileLoader +=
                    '?' +
                    (convertCircularObjectToJSON(loader.options) as string)
    }
    resolvedConfiguration.module.aliases.webOptimizerDefaultTemplateFilePath =
        resolvedConfiguration.files.defaultHTML.template.filePath
    // endregion
    // region apply HTML webpack plugin workarounds
    /*
        NOTE: Provides a workaround to handle a bug with chained loader
        configurations.
    */
    for (const htmlConfiguration of resolvedConfiguration.files.html) {
        extend(true, htmlConfiguration, resolvedConfiguration.files.defaultHTML)
        htmlConfiguration.template.request = htmlConfiguration.template.filePath
        if (
            htmlConfiguration.template.filePath !==
                resolvedConfiguration.files.defaultHTML.template.filePath &&
            htmlConfiguration.template.options
        ) {
            const requestString: string = new String(
                htmlConfiguration.template.request +
                (convertCircularObjectToJSON(
                    htmlConfiguration.template.options
                ) as string)
            ) as string
            requestString.replace = ((value: string) => (): string => value)(
                htmlConfiguration.template.filePath
            )
            htmlConfiguration.template.request = requestString
        }
    }
    // endregion
    return resolvedConfiguration
}
/**
 * Get cached or determined configuration object.
 * @returns Nothing.
 */
export const get = async (): Promise<ResolvedConfiguration> => {
    if (!loadedConfiguration)
        loadedConfiguration = await load()

    return loadedConfiguration
}

export default get
