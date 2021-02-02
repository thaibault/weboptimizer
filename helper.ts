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
import Tools from 'clientnode'
import {Encoding, File, Mapping, PlainObject} from 'clientnode/type'
import {DOMWindow, JSDOM as DOM} from 'jsdom'
import fileSystem from 'fs'
import path from 'path'

import {
    AssetPathConfiguration,
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
     * @param filePath - Path to file to check.
     * @param locationsToCheck - Locations to take into account.
     * @returns Value "true" if given file path is within one of given
     * locations or "false" otherwise.
     */
    static isFilePathInLocation(
        filePath:string, locationsToCheck:Array<string>
    ):boolean {
        for (const pathToCheck of locationsToCheck)
            if (path.resolve(filePath).startsWith(path.resolve(pathToCheck)))
                return true
        return false
    }
    // endregion
    // region string
    /**
     * Strips loader informations form given module request including loader
     * prefix and query parameter.
     * @param moduleID - Module request to strip.
     * @returns Given module id stripped.
     */
    static stripLoader(moduleID:string):string {
        const moduleIDWithoutLoader:string =
            moduleID.substring(moduleID.lastIndexOf('!') + 1)
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
     * @param paths - File paths.
     * @returns The given file path list with normalized unique values.
     */
    static normalizePaths(paths:Array<string>):Array<string> {
        return Array.from(new Set(paths.map((givenPath:string):string => {
            givenPath = path.normalize(givenPath)
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
     * @param template - File path to process placeholder in.
     * @param scope - Scope to use for processing.
     * @returns Processed file path.
     */
    static renderFilePathTemplate(
        template:string, scope:Mapping<number|string> = {}
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
        for (const placeholderName in scope)
            if (Object.prototype.hasOwnProperty.call(scope, placeholderName))
                filePath = filePath.replace(
                    new RegExp(
                        Tools.stringEscapeRegularExpressions(placeholderName),
                        'g'
                    ),
                    `${scope[placeholderName]}`
                )
        return filePath
    }
    /**
     * Converts given request to a resolved request with given context
     * embedded.
     * @param request - Request to determine.
     * @param context - Context of given request to resolve relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param relativeModuleLocations - List of relative directory paths to
     * search for modules in.
     * @returns A new resolved request.
     */
    static applyContext(
        request:string,
        context = './',
        referencePath = './',
        aliases:Mapping = {},
        moduleReplacements:Replacements = {},
        relativeModuleLocations:Array<string> = ['node_modules']
    ):false|string {
        referencePath = path.resolve(referencePath)
        if (
            request.startsWith('./') && path.resolve(context) !== referencePath
        ) {
            request = path.resolve(context, request)
            for (const modulePath of relativeModuleLocations) {
                const pathPrefix:string =
                    path.resolve(referencePath, modulePath)
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
     *
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
        context = path.resolve(context)
        requestContext = path.resolve(requestContext)
        referencePath = path.resolve(referencePath)
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
        for (const chunkName in normalizedGivenInjection)
            if (Object.prototype.hasOwnProperty.call(
                normalizedGivenInjection, chunkName
            ))
                for (const moduleID of normalizedGivenInjection[chunkName])
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
                    path.join('/', parts.join('/'), relativePath)
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
                extensions.file.external.includes(path.extname(filePath)) ||
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
     * @param filePath - Path to file to analyse.
     * @param buildConfiguration - Meta informations for available asset
     * types.
     * @param paths - List of paths to search if given path doesn't reference
     * a file directly.
     * @returns Determined file type or "null" of given file couldn't be
     * determined.
     */
    static determineAssetType(
        filePath:string,
        buildConfiguration:BuildConfiguration,
        paths:PathConfiguration
    ):null|string {
        let result:null|string = null
        for (const type in buildConfiguration)
            if (
                path.extname(filePath) ===
                `.${buildConfiguration[type].extension}`
            ) {
                result = type
                break
            }
        if (!result)
            for (const type of [paths.source, paths.target])
                for (const assetType in type.asset)
                    if (
                        Object.prototype.hasOwnProperty.call(
                            type.asset, assetType
                        ) &&
                        assetType !== 'base' &&
                        type.asset[
                            assetType as keyof AssetPathConfiguration
                        ] &&
                        filePath.startsWith(
                            type.asset[
                                assetType as keyof AssetPathConfiguration
                            ]
                        )
                    )
                        return assetType
        return result
    }
    /**
     * Adds a property with a stored array of all matching file paths, which
     * matches each build configuration in given entry path and converts given
     * build configuration into a sorted array were javaScript files takes
     * precedence.
     * @param configuration - Given build configurations.
     * @param entryPath - Path to analyse nested structure.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param mainFileBasenames - File basenames to sort into the front.
     * @returns Converted build configuration.
     */
    static resolveBuildConfigurationFilePaths(
        configuration:BuildConfiguration,
        entryPath = './',
        pathsToIgnore:Array<string> = ['.git'],
        mainFileBasenames:Array<string> = ['index', 'main']
    ):ResolvedBuildConfiguration {
        const buildConfiguration:ResolvedBuildConfiguration = []
        for (const type in configuration)
            if (Object.prototype.hasOwnProperty.call(configuration, type)) {
                const newItem:ResolvedBuildConfigurationItem =
                    Tools.extend(true, {filePaths: []}, configuration[type])
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
                        path.extname(file.path).endsWith(newItem.extension) &&
                        !(new RegExp(newItem.filePathPattern)).test(file.path)
                    )
                        newItem.filePaths.push(file.path)
                newItem.filePaths.sort((
                    firstFilePath:string, secondFilePath:string
                ):number => {
                    if (mainFileBasenames.includes(path.basename(
                        firstFilePath, path.extname(firstFilePath)
                    ))) {
                        if (mainFileBasenames.includes(path.basename(
                            secondFilePath, path.extname(secondFilePath)
                        )))
                            return 0
                    } else if (mainFileBasenames.includes(path.basename(
                        secondFilePath, path.extname(secondFilePath)
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
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */
    static determineModuleLocations(
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
        for (const chunkName in normalizedGivenInjection)
            if (Object.prototype.hasOwnProperty.call(
                normalizedGivenInjection, chunkName
            ))
                for (const moduleID of normalizedGivenInjection[chunkName]) {
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
                        const directoryPath:string = path.dirname(filePath)
                        if (!directoryPaths.includes(directoryPath))
                            directoryPaths.push(directoryPath)
                    }
                }
        return {filePaths, directoryPaths}
    }
    /**
     * Determines a list of concrete file paths for given module id pointing to
     * a folder which isn't a package.
     * @param normalizedGivenInjection - Injection data structure of modules
     * with folder references to resolve.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @returns Given injections with resolved folder pointing modules.
     */
    static resolveModulesInFolders(
        normalizedGivenInjection:NormalizedGivenInjection,
        aliases:Mapping = {},
        moduleReplacements:Replacements = {},
        context = './',
        referencePath = '',
        pathsToIgnore:Array<string> = ['.git']
    ):NormalizedGivenInjection {
        if (referencePath.startsWith('/'))
            referencePath = path.relative(context, referencePath)
        for (const chunkName in normalizedGivenInjection)
            if (Object.prototype.hasOwnProperty.call(
                normalizedGivenInjection, chunkName
            )) {
                let index = 0
                for (let moduleID of normalizedGivenInjection[chunkName]) {
                    const resolvedModuleID:false|string =
                        Helper.applyModuleReplacements(
                            Helper.applyAliases(
                                Helper.stripLoader(moduleID), aliases
                            ),
                            moduleReplacements
                        )
                    if (resolvedModuleID === false) {
                        normalizedGivenInjection[chunkName].splice(index, 1)
                        continue
                    }

                    const resolvedPath:string =
                        path.resolve(referencePath, resolvedModuleID)

                    if (Tools.isDirectorySync(resolvedPath)) {
                        normalizedGivenInjection[chunkName].splice(index, 1)
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
                                normalizedGivenInjection[chunkName].push(
                                    './' +
                                    path.relative(
                                        referencePath,
                                        path.resolve(resolvedPath, file.path)
                                    )
                                )
                    } else if (
                        resolvedModuleID.startsWith('./') &&
                        !resolvedModuleID.startsWith(
                            `./${path.relative(context, referencePath)}`
                        )
                    )
                        normalizedGivenInjection[chunkName][index] =
                            `./${path.relative(context, resolvedPath)}`
                    index += 1
                }
            }
        return normalizedGivenInjection
    }
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param givenInjection - Given entry injection to normalize.
     * @returns Normalized representation of given entry injection.
     */
    static normalizeGivenInjection(
        givenInjection:GivenInjection
    ):NormalizedGivenInjection {
        let result:NormalizedGivenInjection = {}
        if (Array.isArray(givenInjection))
            result = {index: givenInjection}
        else if (typeof givenInjection === 'string')
            result = {index: [givenInjection]}
        else if (Tools.isPlainObject(givenInjection)) {
            let hasContent = false
            const chunkNamesToDelete:Array<string> = []
            for (const chunkName in givenInjection)
                if (Object.prototype.hasOwnProperty.call(
                    givenInjection, chunkName
                ))
                    if (Array.isArray(givenInjection[chunkName]))
                        if (givenInjection[chunkName].length > 0) {
                            hasContent = true
                            result[chunkName] =
                                givenInjection[chunkName] as Array<string>
                        } else
                            chunkNamesToDelete.push(chunkName)
                    else {
                        hasContent = true
                        result[chunkName] = [
                            givenInjection[chunkName] as string
                        ]
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
     * @returns Given injection with resolved marked indicators.
     */
    static resolveAutoInjection<T extends GivenInjectionConfiguration>(
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
        for (const name of ['entry', 'external']) {
            const injectionType:GivenInjection =
                injection[name as keyof GivenInjectionConfiguration]
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
                        for (const subChunkName in modules)
                            if (Object.prototype.hasOwnProperty.call(
                                modules, subChunkName
                            ))
                                chunk.push(modules[subChunkName])
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
                    buildConfigurations, moduleFilePathsToExclude, context
                )
        }
        return injection
    }
    /**
     * Determines all module file paths.
     * @param buildConfigurations - Resolved build configuration.
     * @param moduleFilePathsToExclude - A list of modules file paths to
     * exclude (specified by path or id) or a mapping from chunk names to
     * module ids.
     * @param context - File path to use as starting point.
     * @returns All determined module file paths.
     */
    static getAutoInjection(
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
                        `./${path.relative(context, moduleFilePath)}`
                    const directoryPath:string = path.dirname(
                        relativeModuleFilePath)
                    const baseName:string = path.basename(
                        relativeModuleFilePath,
                        `.${buildConfiguration.extension}`
                    )
                    let moduleID:string = baseName
                    if (directoryPath !== '.')
                        moduleID = path.join(directoryPath, baseName)
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
     * @param packagePath - Path to package to resolve in.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - Encoding to use for file names during file traversing.
     * @returns Path if found and / or additional package aliases to consider.
     */
    static determineModuleFilePathInPackage(
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
                path.resolve(packagePath, 'package.json')
            if (Tools.isFileSync(pathToPackageJSON)) {
                let localConfiguration:PlainObject = {}
                try {
                    localConfiguration = JSON.parse(
                        fileSystem.readFileSync(pathToPackageJSON, {encoding}))
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
     * @returns File path or given module id if determinations has failed or
     * wasn't necessary.
     */
    static determineModuleFilePath(
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
            moduleFilePath = path.join(referencePath, moduleFilePath)
        const moduleLocations = [referencePath].concat(
            relativeModuleLocations.map((filePath:string):string =>
                path.resolve(context, filePath)
            )
        )
        const parts = context.split('/')
        parts.splice(-1, 1)
        while (parts.length > 0) {
            for (const relativePath of relativeModuleLocations)
                moduleLocations.push(path.join(
                    '/', parts.join('/'), relativePath
                ))
            parts.splice(-1, 1)
        }
        for (const moduleLocation of [referencePath].concat(moduleLocations))
            for (let fileName of ['', '__package__'].concat(
                packageEntryFileNames
            ))
                for (const fileExtension of [''].concat(extensions.file)) {
                    let currentModuleFilePath:string
                    if (moduleFilePath.startsWith('/'))
                        currentModuleFilePath = path.resolve(moduleFilePath)
                    else
                        currentModuleFilePath = path.resolve(
                            moduleLocation, moduleFilePath
                        )
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
                        currentModuleFilePath = path.resolve(
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
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @returns The alias applied given module id.
     */
    static applyAliases(moduleID:string, aliases:Mapping):string {
        for (const alias in aliases)
            if (Object.prototype.hasOwnProperty.call(aliases, alias))
                if (alias.endsWith('$')) {
                    if (moduleID === alias.substring(0, alias.length - 1))
                        moduleID = aliases[alias]
                } else if (typeof moduleID === 'string')
                    moduleID = moduleID.replace(alias, aliases[alias])
        return moduleID
    }
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param replacements - Mapping of regular expressions to their
     * corresponding replacements.
     * @returns The replacement applied given module id.
     */
    static applyModuleReplacements(
        moduleID:false|string, replacements:Replacements
    ):false|string {
        if (moduleID === false)
            return moduleID
        for (const replacement in replacements)
            if (Object.prototype.hasOwnProperty.call(
                replacements, replacement
            ))
                moduleID = moduleID.replace(
                    // @ts-ignore: https://github.com/microsoft/TypeScript/
                    // issues/22378
                    new RegExp(replacement), replacements[replacement]
                )
        return moduleID
    }
    /**
     * Determines the nearest package configuration file from given file path.
     * @param start - Reference location to search from.
     * @param fileName - Package configuration file name.
     * @returns Determined file path.
     */
    static findPackageDescriptorFilePath(
        start:Array<string>|string, fileName = 'package.json'
    ):null|string {
        if (typeof start === 'string') {
            if (!start.endsWith(path.sep))
                start += path.sep
            start = start.split(path.sep)
        }
        if (!start.length)
            return null
        start.pop()
        const result:string = path.resolve(
            start.join(path.sep), fileName)
        try {
            if (fileSystem.existsSync(result))
                return result
        /* eslint-disable no-empty */
        } catch (error) {}
        /* eslint-enable no-empty */
        return Helper.findPackageDescriptorFilePath(start, fileName)
    }
    /**
     * Determines the nearest package configuration from given module file
     * path.
     * @param modulePath - Module path to take as reference location (leaf in
     * tree).
     * @param fileName - Package configuration file name.
     * @returns A object containing found parsed configuration an their
     * corresponding file path.
     */
    static getClosestPackageDescriptor(
        modulePath:string, fileName = 'package.json'
    ):null|PackageDescriptor {
        const filePath:null|string = Helper.findPackageDescriptorFilePath(
            modulePath, fileName)
        if (!filePath)
            return null
        const configuration:PackageConfiguration = eval('require')(filePath)
        /*
            If the package.json does not have a name property, try again from
            one level higher.
        */
        if (!configuration.name)
            return Helper.getClosestPackageDescriptor(
                path.resolve(path.dirname(filePath), '..'), fileName
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
