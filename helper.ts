// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module helper */
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import Tools, {currentRequire} from 'clientnode'
import {Encoding, File, Mapping, PlainObject} from 'clientnode/type'
import {existsSync, readFileSync} from 'fs'
import {
    basename, dirname, extname, join, normalize, resolve, sep, relative
} from 'path'

import {
    BuildConfiguration,
    Extensions,
    GivenInjection,
    GivenInjectionConfiguration,
    NormalizedGivenInjection,
    PathConfiguration,
    PackageConfiguration,
    PackageDescriptor,
    Replacements,
    ResolvedBuildConfiguration,
    ResolvedBuildConfigurationItem,
    SpecificExtensions
} from './type'
// endregion
// region constants
export const KNOWN_FILE_EXTENSIONS:Array<string> = [
    'js', 'ts',
    'json',
    'css',
    'eot',
    'gif',
    'html',
    'ico',
    'jpg',
    'png',
    'ejs',
    'svg',
    'ttf',
    'woff', '.woff2'
]
// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
export class Helper {
    // region boolean
    /**
     * Determines whether given file path is within given list of file
     * locations.
     * @param this - Indicates an unbound method.
     * @param filePath - Path to file to check.
     * @param locationsToCheck - Locations to take into account.
     *
     * @returns Value "true" if given file path is within one of given
     * locations or "false" otherwise.
     */
    static isFilePathInLocation(
        this:void, filePath:string, locationsToCheck:Array<string>
    ):boolean {
        for (const pathToCheck of locationsToCheck)
            if (resolve(filePath).startsWith(resolve(pathToCheck)))
                return true

        return false
    }
    // endregion
    // region string
    /**
     * Strips loader informations form given module request including loader
     * prefix and query parameter.
     * @param this - Indicates an unbound method.
     * @param moduleID - Module request to strip.
     *
     * @returns Given module id stripped.
     */
    static stripLoader(this:void, moduleID:string):string {
        const moduleIDWithoutLoader:string = moduleID
            .substring(moduleID.lastIndexOf('!') + 1)
            .replace(/\.webpack\[.+\/.+\]$/, '')

        return moduleIDWithoutLoader.includes('?') ?
            moduleIDWithoutLoader.substring(
                0, moduleIDWithoutLoader.indexOf('?')
            ) :
            moduleIDWithoutLoader
    }
    // endregion
    // region array
    /**
     * Converts given list of path to a normalized list with unique values.
     * @param this - Indicates an unbound method.
     * @param paths - File paths.
     *
     * @returns The given file path list with normalized unique values.
     */
    static normalizePaths(this:void, paths:Array<string>):Array<string> {
        return Array.from(new Set(paths.map((givenPath:string):string => {
            givenPath = normalize(givenPath)

            if (givenPath.endsWith('/'))
                return givenPath.substring(0, givenPath.length - 1)

            return givenPath
        })))
    }
    // endregion
    // region file handler
    /**
     * Applies file path/name placeholder replacements with given bundle
     * associated informations.
     * @param this - Indicates an unbound method.
     * @param template - File path to process placeholder in.
     * @param scope - Scope to use for processing.
     *
     * @returns Processed file path.
     */
    static renderFilePathTemplate(
        this:void, template:string, scope:Mapping<number|string> = {}
    ):string {
        scope = {
            '[chunkhash]': '.__dummy__',
            '[contenthash]': '.__dummy__',
            '[fullhash]': '.__dummy__',
            '[id]': '.__dummy__',
            '[name]': '.__dummy__',
            ...scope
        }

        let filePath:string = template
        for (const [placeholderName, value] of Object.entries(scope))
            filePath = filePath.replace(
                new RegExp(
                    Tools.stringEscapeRegularExpressions(placeholderName), 'g'
                ),
                `${value}`
            )

        return filePath
    }
    /**
     * Converts given request to a resolved request with given context
     * embedded.
     * @param this - Indicates an unbound method.
     * @param request - Request to determine.
     * @param context - Context of given request to resolve relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param relativeModuleLocations - List of relative directory paths to
     * search for modules in.
     *
     * @returns A new resolved request.
     */
    static applyContext(
        this:void,
        request:string,
        context = './',
        referencePath = './',
        aliases:Mapping = {},
        moduleReplacements:Replacements = {},
        relativeModuleLocations:Array<string> = ['node_modules']
    ):false|string {
        referencePath = resolve(referencePath)
        if (request.startsWith('./') && resolve(context) !== referencePath) {
            request = resolve(context, request)

            for (const modulePath of relativeModuleLocations) {
                const pathPrefix:string = resolve(referencePath, modulePath)

                if (request.startsWith(pathPrefix)) {
                    request = request.substring(pathPrefix.length)
                    if (request.startsWith('/'))
                        request = request.substring(1)

                    return Helper.applyModuleReplacements(
                        Helper.applyAliases(
                            request.substring(request.lastIndexOf('!') + 1),
                            aliases
                        ),
                        moduleReplacements
                    )
                }
            }

            if (request.startsWith(referencePath)) {
                request = request.substring(referencePath.length)
                if (request.startsWith('/'))
                    request = request.substring(1)

                return Helper.applyModuleReplacements(
                    Helper.applyAliases(
                        request.substring(request.lastIndexOf('!') + 1),
                        aliases
                    ),
                    moduleReplacements
                )
            }
        }

        return request
    }
    /**
     * Check if given request points to an external dependency not maintained
     * by current package context.
     * @param this - Indicates an unbound method.
     * @param request - Request to determine.
     * @param context - Context of current project.
     * @param requestContext - Context of given request to resolve relative to.
     * @param normalizedGivenInjection - Mapping of chunk names to modules
     * which should be injected.
     * @param relativeExternalModuleLocations - Array of paths where external
     * modules take place.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param includePattern - Array of regular expressions to explicitly mark
     * as external dependency.
     * @param excludePattern - Array of regular expressions to explicitly mark
     * as internal dependency.
     * @param inPlaceNormalLibrary - Indicates whether normal libraries should
     * be external or not.
     * @param inPlaceDynamicLibrary - Indicates whether requests with
     * integrated loader configurations should be marked as external or not.
     * @param encoding - Encoding for file names to use during file traversing.
     *
     * @returns A new resolved request indicating whether given request is an
     * external one.
     */
    static determineExternalRequest(
        this:void,
        request:string,
        context = './',
        requestContext = './',
        normalizedGivenInjection:NormalizedGivenInjection = {},
        relativeExternalModuleLocations:Array<string> = ['node_modules'],
        aliases:Mapping = {},
        moduleReplacements:Replacements = {},
        extensions:Extensions = {file: {
            external: ['.compiled.js', '.js', '.json'],
            internal: KNOWN_FILE_EXTENSIONS.map((suffix:string):string =>
                `.${suffix}`
            )
        }},
        referencePath = './',
        pathsToIgnore:Array<string> = ['.git'],
        relativeModuleLocations:Array<string> = ['node_modules'],
        packageEntryFileNames:Array<string> = ['index', 'main'],
        packageMainPropertyNames:Array<string> = ['main', 'module'],
        packageAliasPropertyNames:Array<string> = [],
        includePattern:Array<string|RegExp> = [],
        excludePattern:Array<string|RegExp> = [],
        inPlaceNormalLibrary = false,
        inPlaceDynamicLibrary = true,
        encoding:Encoding = 'utf-8'
    ):null|string {
        context = resolve(context)
        requestContext = resolve(requestContext)
        referencePath = resolve(referencePath)
        // NOTE: We apply alias on externals additionally.
        const resolvedRequest:false|string = Helper.applyModuleReplacements(
            Helper.applyAliases(
                request.substring(request.lastIndexOf('!') + 1), aliases
            ),
            moduleReplacements
        )
        if (
            resolvedRequest === false ||
            Tools.isAnyMatching(resolvedRequest, excludePattern)
        )
            return null
        /*
            NOTE: Aliases and module replacements doesn't have to be forwarded
            since we pass an already resolved request.
        */
        const filePath:null|string = Helper.determineModuleFilePath(
            resolvedRequest,
            {},
            {},
            {file: extensions.file.external},
            context,
            requestContext,
            pathsToIgnore,
            relativeModuleLocations,
            packageEntryFileNames,
            packageMainPropertyNames,
            packageAliasPropertyNames,
            encoding
        )
        /*
            NOTE: We mark dependencies as external if there file couldn't be
            resolved or are specified to be external explicitly.
        */
        if (
            !(filePath || inPlaceNormalLibrary) ||
            Tools.isAnyMatching(resolvedRequest, includePattern)
        )
            return (
                Helper.applyContext(
                    resolvedRequest,
                    requestContext,
                    referencePath,
                    aliases,
                    moduleReplacements,
                    relativeModuleLocations
                ) ||
                null
            )

        for (const chunk of Object.values(normalizedGivenInjection))
            for (const moduleID of chunk)
                if (Helper.determineModuleFilePath(
                    moduleID,
                    aliases,
                    moduleReplacements,
                    {file: extensions.file.internal},
                    context,
                    requestContext,
                    pathsToIgnore,
                    relativeModuleLocations,
                    packageEntryFileNames,
                    packageMainPropertyNames,
                    packageAliasPropertyNames,
                    encoding
                ) === filePath)
                    return null

        const parts:Array<string> = context.split('/')
        const externalModuleLocations:Array<string> = []
        while (parts.length > 0) {
            for (const relativePath of relativeExternalModuleLocations)
                externalModuleLocations.push(
                    join('/', parts.join('/'), relativePath)
                )

            parts.splice(-1, 1)
        }
        /*
            NOTE: We mark dependencies as external if they does not contain a
            loader in their request and aren't part of the current main package
            or have a file extension other than javaScript aware.
        */
        if (
            !inPlaceNormalLibrary &&
            (
                extensions.file.external.length === 0 ||
                filePath &&
                extensions.file.external.includes(extname(filePath)) ||
                !filePath && extensions.file.external.includes('')
            ) &&
            !(inPlaceDynamicLibrary && request.includes('!')) &&
            (
                !filePath && inPlaceDynamicLibrary ||
                filePath &&
                (
                    !filePath.startsWith(context) ||
                    Helper.isFilePathInLocation(
                        filePath, externalModuleLocations
                    )
                )
            )
        )
            return (
                Helper.applyContext(
                    resolvedRequest,
                    requestContext,
                    referencePath,
                    aliases,
                    moduleReplacements,
                    relativeModuleLocations
                ) ||
                null
            )

        return null
    }
    /**
     * Determines asset type of given file.
     * @param this - Indicates an unbound method.
     * @param filePath - Path to file to analyse.
     * @param buildConfiguration - Meta informations for available asset
     * types.
     * @param paths - List of paths to search if given path doesn't reference
     * a file directly.
     *
     * @returns Determined file type or "null" of given file couldn't be
     * determined.
     */
    static determineAssetType(
        this:void,
        filePath:string,
        buildConfiguration:BuildConfiguration,
        paths:PathConfiguration
    ):null|string {
        let result:null|string = null
        for (const type in buildConfiguration)
            if (
                extname(filePath) === `.${buildConfiguration[type].extension}`
            ) {
                result = type

                break
            }
        if (!result)
            for (const type of [paths.source, paths.target])
                for (const [assetType, assetConfiguration] of Object.entries(
                    type.asset
                ))
                    if (
                        assetType !== 'base' &&
                        assetConfiguration &&
                        filePath.startsWith(assetConfiguration as string)
                    )
                        return assetType

        return result
    }
    /**
     * Adds a property with a stored array of all matching file paths, which
     * matches each build configuration in given entry path and converts given
     * build configuration into a sorted array were javaScript files takes
     * precedence.
     * @param this - Indicates an unbound method.
     * @param configuration - Given build configurations.
     * @param entryPath - Path to analyse nested structure.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param mainFileBasenames - File basenames to sort into the front.
     *
     * @returns Converted build configuration.
     */
    static resolveBuildConfigurationFilePaths(
        this:void,
        configuration:BuildConfiguration,
        entryPath = './',
        pathsToIgnore:Array<string> = ['.git'],
        mainFileBasenames:Array<string> = ['index', 'main']
    ):ResolvedBuildConfiguration {
        const buildConfiguration:ResolvedBuildConfiguration = []

        for (const value of Object.values(configuration)) {
            const newItem:ResolvedBuildConfigurationItem = Tools.extend<
                ResolvedBuildConfigurationItem
            >(true, {filePaths: []}, value)

            for (const file of Tools.walkDirectoryRecursivelySync(
                entryPath,
                (file:File):false|void => {
                    if (Helper.isFilePathInLocation(
                        file.path, pathsToIgnore
                    ))
                        return false
                }
            ))
                if (
                    file.stats?.isFile() &&
                    file.path.endsWith(`.${newItem.extension}`) &&
                    !(
                        newItem.ignoredExtension &&
                        file.path.endsWith(`.${newItem.ignoredExtension}`)
                    ) &&
                    !(new RegExp(newItem.filePathPattern)).test(file.path)
                )
                    newItem.filePaths.push(file.path)

            newItem.filePaths.sort((
                firstFilePath:string, secondFilePath:string
            ):number => {
                if (mainFileBasenames.includes(basename(
                    firstFilePath, extname(firstFilePath)
                ))) {
                    if (mainFileBasenames.includes(basename(
                        secondFilePath, extname(secondFilePath)
                    )))
                        return 0
                } else if (mainFileBasenames.includes(basename(
                    secondFilePath, extname(secondFilePath)
                )))
                    return 1

                return 0
            })

            buildConfiguration.push(newItem)
        }

        return buildConfiguration.sort((
            first:ResolvedBuildConfigurationItem,
            second:ResolvedBuildConfigurationItem
        ):number => {
            if (first.outputExtension !== second.outputExtension) {
                if (first.outputExtension === 'js')
                    return -1

                if (second.outputExtension === 'js')
                    return 1

                return first.outputExtension < second.outputExtension ? -1 : 1
            }

            return 0
        })
    }
    /**
     * Determines all file and directory paths related to given internal
     * modules as array.
     * @param this - Indicates an unbound method.
     * @param givenInjection - List of module ids or module file paths.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of module replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to resolve relative to.
     * @param referencePath - Path to search for local modules.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - File name encoding to use during file traversing.
     *
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */
    static determineModuleLocations(
        this:void,
        givenInjection:GivenInjection,
        aliases:Mapping = {},
        moduleReplacements:Replacements = {},
        extensions:SpecificExtensions = {
            file: KNOWN_FILE_EXTENSIONS.map((suffix:string):string =>
                `.${suffix}`
            )
        },
        context = './',
        referencePath = '',
        pathsToIgnore:Array<string> = ['.git'],
        relativeModuleLocations:Array<string> = ['node_modules'],
        packageEntryFileNames:Array<string> = [
            '__package__', '', 'index', 'main'
        ],
        packageMainPropertyNames:Array<string> = ['main', 'module'],
        packageAliasPropertyNames:Array<string> = [],
        encoding:Encoding = 'utf-8'
    ):{
        directoryPaths:Array<string>
        filePaths:Array<string>
    } {
        const filePaths:Array<string> = []
        const directoryPaths:Array<string> = []
        const normalizedGivenInjection:NormalizedGivenInjection =
            Helper.resolveModulesInFolders(
                Helper.normalizeGivenInjection(givenInjection),
                aliases,
                moduleReplacements,
                context,
                referencePath,
                pathsToIgnore
            )

        for (const chunk of Object.values(normalizedGivenInjection))
            for (const moduleID of chunk) {
                const filePath:null|string = Helper.determineModuleFilePath(
                    moduleID,
                    aliases,
                    moduleReplacements,
                    extensions,
                    context,
                    referencePath,
                    pathsToIgnore,
                    relativeModuleLocations,
                    packageEntryFileNames,
                    packageMainPropertyNames,
                    packageAliasPropertyNames,
                    encoding
                )

                if (filePath) {
                    filePaths.push(filePath)
                    const directoryPath:string = dirname(filePath)
                    if (!directoryPaths.includes(directoryPath))
                        directoryPaths.push(directoryPath)
                }
            }

        return {filePaths, directoryPaths}
    }
    /**
     * Determines a list of concrete file paths for given module id pointing to
     * a folder which isn't a package.
     * @param this - Indicates an unbound method.
     * @param normalizedGivenInjection - Injection data structure of modules
     * with folder references to resolve.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     *
     * @returns Given injections with resolved folder pointing modules.
     */
    static resolveModulesInFolders(
        this:void,
        normalizedGivenInjection:NormalizedGivenInjection,
        aliases:Mapping = {},
        moduleReplacements:Replacements = {},
        context = './',
        referencePath = '',
        pathsToIgnore:Array<string> = ['.git']
    ):NormalizedGivenInjection {
        if (referencePath.startsWith('/'))
            referencePath = relative(context, referencePath)
        for (const chunk of Object.values(normalizedGivenInjection)) {
            let index = 0
            for (const moduleID of chunk) {
                const resolvedModuleID:false|string =
                    Helper.applyModuleReplacements(
                        Helper.applyAliases(
                            Helper.stripLoader(moduleID), aliases
                        ),
                        moduleReplacements
                    )
                if (resolvedModuleID === false) {
                    chunk.splice(index, 1)

                    continue
                }

                const resolvedPath:string =
                    resolve(referencePath, resolvedModuleID)

                if (Tools.isDirectorySync(resolvedPath)) {
                    chunk.splice(index, 1)

                    for (const file of Tools.walkDirectoryRecursivelySync(
                        resolvedPath,
                        (file:File):false|undefined => {
                            if (Helper.isFilePathInLocation(
                                file.path, pathsToIgnore
                            ))
                                return false
                        }
                    ))
                        if (file.stats?.isFile())
                            chunk.push(
                                './' +
                                relative(
                                    referencePath,
                                    resolve(resolvedPath, file.path)
                                )
                            )
                } else if (
                    resolvedModuleID.startsWith('./') &&
                    !resolvedModuleID.startsWith(
                        `./${relative(context, referencePath)}`
                    )
                )
                    chunk[index] = `./${relative(context, resolvedPath)}`
                index += 1
            }
        }

        return normalizedGivenInjection
    }
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param this - Indicates an unbound method.
     * @param givenInjection - Given entry injection to normalize.
     *
     * @returns Normalized representation of given entry injection.
     */
    static normalizeGivenInjection(
        this:void, givenInjection:GivenInjection
    ):NormalizedGivenInjection {
        let result:NormalizedGivenInjection = {}
        if (Array.isArray(givenInjection))
            result = {index: givenInjection}
        else if (typeof givenInjection === 'string')
            result = {index: [givenInjection]}
        else if (Tools.isPlainObject(givenInjection)) {
            let hasContent = false
            const chunkNamesToDelete:Array<string> = []
            for (const [chunkName, chunk] of Object.entries(givenInjection))
                if (Array.isArray(chunk))
                    if (chunk.length > 0) {
                        hasContent = true
                        result[chunkName] = chunk
                    } else
                        chunkNamesToDelete.push(chunkName)
                else {
                    hasContent = true
                    result[chunkName] = [chunk]
                }
            if (hasContent)
                for (const chunkName of chunkNamesToDelete)
                    delete result[chunkName]
            else
                result = {index: []}
        }

        return result
    }
    /**
     * Determines all concrete file paths for given injection which are marked
     * with the "__auto__" indicator.
     * @param this - Indicates an unbound method.
     * @param givenInjection - Given entry and external injection to take
     * into account.
     * @param buildConfigurations - Resolved build configuration.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to use as starting point.
     * @param referencePath - Reference path from where local files should be
     * resolved.
     * @param pathsToIgnore - Paths which marks location to ignore.
     *
     * @returns Given injection with resolved marked indicators.
     */
    static resolveAutoInjection<T extends GivenInjectionConfiguration>(
        this:void,
        givenInjection:T,
        buildConfigurations:ResolvedBuildConfiguration,
        aliases:Mapping = {},
        moduleReplacements:Replacements = {},
        extensions:Extensions = {file: {
            external: ['compiled.js', '.js', '.json'],
            internal: KNOWN_FILE_EXTENSIONS.map((suffix:string):string =>
                `.${suffix}`
            )
        }},
        context = './',
        referencePath = '',
        pathsToIgnore:Array<string> = ['.git']
    ):T {
        const injection:T = Tools.copy(givenInjection)
        const moduleFilePathsToExclude:Array<string> =
            Helper.determineModuleLocations(
                givenInjection.autoExclude,
                aliases,
                moduleReplacements,
                {file: extensions.file.internal},
                context,
                referencePath,
                pathsToIgnore
            ).filePaths

        for (const name of ['entry', 'external'] as const) {
            const injectionType:GivenInjection = injection[name]
            /* eslint-disable curly */
            if (Tools.isPlainObject(injectionType)) {
                for (let [chunkName, chunk] of Object.entries(injectionType))
                    if (chunk === '__auto__') {
                        chunk = injectionType[chunkName] = []
                        const modules:Mapping = Helper.getAutoInjection(
                            buildConfigurations,
                            moduleFilePathsToExclude,
                            referencePath
                        )
                        for (const subChunk of Object.values(modules))
                            chunk.push(subChunk)
                        /*
                            Reverse array to let javaScript and main files be
                            the last ones to export them rather.
                        */
                        chunk.reverse()
                    }
            } else if (injectionType === '__auto__')
            /* eslint-enable curly */
                (
                    injection[name as keyof GivenInjectionConfiguration] as
                        Mapping
                ) = Helper.getAutoInjection(
                                buildConfigurations,
                                moduleFilePathsToExclude,
                                context
                            )
        }

        return injection
    }
    /**
     * Determines all module file paths.
     * @param this - Indicates an unbound method.
     * @param buildConfigurations - Resolved build configuration.
     * @param moduleFilePathsToExclude - A list of modules file paths to
     * exclude (specified by path or id) or a mapping from chunk names to
     * module ids.
     * @param context - File path to use as starting point.
     *
     * @returns All determined module file paths.
     */
    static getAutoInjection(
        this:void,
        buildConfigurations:ResolvedBuildConfiguration,
        moduleFilePathsToExclude:Array<string>,
        context:string
    ):Mapping {
        const result:Mapping = {}
        const injectedModuleIDs:Mapping<Array<string>> = {}

        for (const buildConfiguration of buildConfigurations) {
            if (!injectedModuleIDs[buildConfiguration.outputExtension])
                injectedModuleIDs[buildConfiguration.outputExtension] = []

            for (const moduleFilePath of buildConfiguration.filePaths)
                if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                    const relativeModuleFilePath =
                        `./${relative(context, moduleFilePath)}`
                    const directoryPath:string =
                        dirname(relativeModuleFilePath)
                    const baseName:string = basename(
                        relativeModuleFilePath,
                        `.${buildConfiguration.extension}`
                    )

                    let moduleID:string = baseName
                    if (directoryPath !== '.')
                        moduleID = join(directoryPath, baseName)

                    /*
                        Ensure that each output type has only one source
                        representation.
                    */
                    if (!injectedModuleIDs[
                        buildConfiguration.outputExtension
                    ].includes(moduleID)) {
                        /*
                            Ensure that same module ids and different output
                            types can be distinguished by their extension
                            (JavaScript-Modules remains without extension since
                            they will be handled first because the build
                            configurations are expected to be sorted in this
                            context).
                        */
                        if (Object.prototype.hasOwnProperty.call(
                            result, moduleID
                        ))
                            result[relativeModuleFilePath] =
                                relativeModuleFilePath
                        else
                            result[moduleID] = relativeModuleFilePath

                        injectedModuleIDs[
                            buildConfiguration.outputExtension
                        ].push(moduleID)
                    }
                }
        }

        return result
    }
    // TODO test
    /**
     * Determines a resolved module file path in given package path.
     * @param this - Indicates an unbound method.
     * @param packagePath - Path to package to resolve in.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - Encoding to use for file names during file traversing.
     *
     * @returns Path if found and / or additional package aliases to consider.
     */
    static determineModuleFilePathInPackage(
        this:void,
        packagePath:string,
        packageMainPropertyNames:Array<string> = ['main'],
        packageAliasPropertyNames:Array<string> = [],
        encoding:Encoding = 'utf-8'
    ):{
        fileName:null|string
        packageAliases:Mapping|null
    } {
        const result:{
            fileName:null|string
            packageAliases:Mapping|null
        } = {
            fileName: null,
            packageAliases: null
        }
        if (Tools.isDirectorySync(packagePath)) {
            const pathToPackageJSON:string =
                resolve(packagePath, 'package.json')
            if (Tools.isFileSync(pathToPackageJSON)) {
                let localConfiguration:PlainObject = {}
                try {
                    localConfiguration = JSON.parse(
                        readFileSync(pathToPackageJSON, {encoding})
                    ) as PlainObject
                } catch (error) {
                    console.warn(
                        `Package configuration file "${pathToPackageJSON}" ` +
                        `could not parsed: ${Tools.represent(error)}`
                    )
                }
                for (const propertyName of packageMainPropertyNames)
                    if (
                        Object.prototype.hasOwnProperty.call(
                            localConfiguration, propertyName
                        ) &&
                        typeof localConfiguration[propertyName] === 'string' &&
                        localConfiguration[propertyName]
                    ) {
                        result.fileName = localConfiguration[
                            propertyName
                        ] as string
                        break
                    }
                for (const propertyName of packageAliasPropertyNames)
                    if (
                        Object.prototype.hasOwnProperty.call(
                            localConfiguration, propertyName
                        ) &&
                        Tools.isPlainObject(localConfiguration[propertyName])
                    ) {
                        result.packageAliases = localConfiguration[
                            propertyName
                        ] as Mapping
                        break
                    }
            }
        }
        return result
    }
    /**
     * Determines a concrete file path for given module id.
     * @param this - Indicates an unbound method.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - Encoding to use for file names during file traversing.
     *
     * @returns File path or given module id if determinations has failed or
     * wasn't necessary.
     */
    static determineModuleFilePath(
        this:void,
        moduleID:false|string,
        aliases:Mapping = {},
        moduleReplacements:Replacements = {},
        extensions:SpecificExtensions = {
            file: KNOWN_FILE_EXTENSIONS.map((suffix:string):string =>
                `.${suffix}`
            )
        },
        context = './',
        referencePath = '',
        pathsToIgnore:Array<string> = ['.git'],
        relativeModuleLocations:Array<string> = ['node_modules'],
        packageEntryFileNames:Array<string> = ['index'],
        packageMainPropertyNames:Array<string> = ['main'],
        packageAliasPropertyNames:Array<string> = [],
        encoding:Encoding = 'utf-8'
    ):null|string {
        if (!moduleID)
            return null

        moduleID = Helper.applyModuleReplacements(
            Helper.applyAliases(Helper.stripLoader(moduleID), aliases),
            moduleReplacements
        )
        if (!moduleID)
            return null

        let moduleFilePath:string = moduleID
        if (moduleFilePath.startsWith('./'))
            moduleFilePath = join(referencePath, moduleFilePath)

        const moduleLocations = [referencePath].concat(
            relativeModuleLocations.map((filePath:string):string =>
                resolve(context, filePath)
            )
        )

        const parts = context.split('/')
        parts.splice(-1, 1)
        while (parts.length > 0) {
            for (const relativePath of relativeModuleLocations)
                moduleLocations.push(join('/', parts.join('/'), relativePath))

            parts.splice(-1, 1)
        }

        for (const moduleLocation of [referencePath].concat(moduleLocations))
            for (let fileName of ['', '__package__'].concat(
                packageEntryFileNames
            ))
                for (const fileExtension of [''].concat(extensions.file)) {
                    let currentModuleFilePath:string
                    if (moduleFilePath.startsWith('/'))
                        currentModuleFilePath = resolve(moduleFilePath)
                    else
                        currentModuleFilePath =
                            resolve(moduleLocation, moduleFilePath)

                    let packageAliases:Mapping = {}
                    if (fileName === '__package__') {
                        const result:{
                            fileName:null|string
                            packageAliases:Mapping|null
                        } = Helper.determineModuleFilePathInPackage(
                            currentModuleFilePath,
                            packageMainPropertyNames,
                            packageAliasPropertyNames,
                            encoding
                        )
                        if (result.fileName)
                            fileName = result.fileName
                        if (result.packageAliases)
                            packageAliases = result.packageAliases

                        if (fileName === '__package__')
                            continue
                    }

                    const resolvedFileName:false|string =
                        Helper.applyModuleReplacements(
                            Helper.applyAliases(fileName, packageAliases),
                            moduleReplacements
                        )
                    if (resolvedFileName === false)
                        continue

                    if (resolvedFileName)
                        currentModuleFilePath = resolve(
                            currentModuleFilePath,
                            `${resolvedFileName}${fileExtension}`
                        )
                    else
                        currentModuleFilePath +=
                            `${resolvedFileName}${fileExtension}`

                    if (Helper.isFilePathInLocation(
                        currentModuleFilePath, pathsToIgnore
                    ))
                        continue

                    if (Tools.isFileSync(currentModuleFilePath))
                        return currentModuleFilePath
                }

        return null
    }
    // endregion
    /**
     * Determines a concrete file path for given module id.
     * @param this - Indicates an unbound method.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     *
     * @returns The alias applied given module id.
     */
    static applyAliases(this:void, moduleID:string, aliases:Mapping):string {
        for (const [name, alias] of Object.entries(aliases))
            if (name.endsWith('$')) {
                if (moduleID === name.substring(0, name.length - 1))
                    moduleID = alias
            } else if (typeof moduleID === 'string')
                moduleID = moduleID.replace(name, alias)

        return moduleID
    }
    /**
     * Determines a concrete file path for given module id.
     * @param this - Indicates an unbound method.
     * @param moduleID - Module id to determine.
     * @param replacements - Mapping of regular expressions to their
     * corresponding replacements.
     *
     * @returns The replacement applied given module id.
     */
    static applyModuleReplacements(
        this:void, moduleID:false|string, replacements:Replacements
    ):false|string {
        if (moduleID === false)
            return moduleID

        for (const [search, replacement] of Object.entries(replacements))
            moduleID = moduleID.replace(new RegExp(search), replacement)

        return moduleID
    }
    /**
     * Determines the nearest package configuration file from given file path.
     * @param this - Indicates an unbound method.
     * @param start - Reference location to search from.
     * @param fileName - Package configuration file name.
     *
     * @returns Determined file path.
     */
    static findPackageDescriptorFilePath(
        this:void, start:Array<string>|string, fileName = 'package.json'
    ):null|string {
        if (typeof start === 'string') {
            if (!start.endsWith(sep))
                start += sep
            start = start.split(sep)
        }
        if (!start.length)
            return null

        start.pop()
        const result:string = resolve(start.join(sep), fileName)
        try {
            if (existsSync(result))
                return result
        /* eslint-disable no-empty */
        } catch (error) {}
        /* eslint-enable no-empty */

        return Helper.findPackageDescriptorFilePath(start, fileName)
    }
    /**
     * Determines the nearest package configuration from given module file
     * path.
     * @param this - Indicates an unbound method.
     * @param modulePath - Module path to take as reference location (leaf in
     * tree).
     * @param fileName - Package configuration file name.
     *
     * @returns A object containing found parsed configuration an their
     * corresponding file path.
     */
    static getClosestPackageDescriptor(
        this:void, modulePath:string, fileName = 'package.json'
    ):null|PackageDescriptor {
        const filePath:null|string = Helper.findPackageDescriptorFilePath(
            modulePath, fileName)
        if (!filePath)
            return null

        const configuration:PackageConfiguration =
            currentRequire!(filePath) as PackageConfiguration
        /*
            If the package.json does not have a name property, try again from
            one level higher.
        */
        if (!configuration.name)
            return Helper.getClosestPackageDescriptor(
                resolve(dirname(filePath), '..'), fileName
            )

        if (!configuration.version)
            configuration.version = 'not set'

        return {configuration, filePath}
    }
}
export default Helper
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
