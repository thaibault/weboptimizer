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
import type {DomNode} from 'clientnode'
import Tools from 'clientnode'
import type {File, PlainObject, Window} from 'clientnode'
import {JSDOM as DOM} from 'jsdom'
import * as fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import type {
    BuildConfiguration,
    Extensions,
    Injection,
    InternalInjection,
    NormalizedInternalInjection,
    Path,
    ResolvedBuildConfiguration,
    ResolvedBuildConfigurationItem
} from './type'
// endregion
// region methods
/**
 * Provides a class of static methods with generic use cases.
 */
export default class Helper {
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
        for (const pathToCheck:string of locationsToCheck)
            if (path.resolve(filePath).startsWith(path.resolve(pathToCheck)))
                return true
        return false
    }
    // endregion
    // region string
    /**
     * In places each matching cascading style sheet or javaScript file
     * reference.
     * @param content - Markup content to process.
     * @param cascadingStyleSheetPattern - Pattern to match cascading style
     * sheet asset references again.
     * @param javaScriptPattern - Pattern to match javaScript asset references
     * again.
     * @param basePath - Base path to use as prefix for file references.
     * @param cascadingStyleSheetChunkNameTemplate - Cascading style sheet
     * chunk name template to use for asset matching.
     * @param javaScriptChunkNameTemplate - JavaScript chunk name template to
     * use for asset matching.
     * @param assets - Mapping of asset file paths to their content.
     * @returns Given an transformed markup.
     */
    static inPlaceCSSAndJavaScriptAssetReferences(
        content:string,
        cascadingStyleSheetPattern:?{[key:string]:'body'|'head'|'in'},
        javaScriptPattern:?{[key:string]:'body'|'head'|'in'}, basePath:string,
        cascadingStyleSheetChunkNameTemplate:string,
        javaScriptChunkNameTemplate:string, assets:{[key:string]:Object}
    ):Promise<{content:string;filePathsToRemove:Array<string>;}> {
        /*
            NOTE: We have to translate template delimiter to html compatible
            sequences and translate it back later to avoid unexpected escape
            sequences in resulting html.
        */
        return new Promise((
            resolve:Function, reject:Function
        ):void => {
            let window:Window
            try {
                window = (new DOM(content.replace(/<%/g, '##+#+#+##').replace(
                    /%>/g, '##-#-#-##'
                ))).window
            } catch (error) {
                return reject(error)
            }
            const filePathsToRemove:Array<string> = []
            if (cascadingStyleSheetPattern)
                for (const pattern:string in cascadingStyleSheetPattern) {
                    if (!cascadingStyleSheetPattern.hasOwnProperty(pattern))
                        continue
                    let selector:string = '[href*=".css"]'
                    if (pattern !== '*')
                        selector = '[href="' + path.relative(
                            basePath, Helper.renderFilePathTemplate(
                                cascadingStyleSheetChunkNameTemplate, {
                                    '[contenthash]': '',
                                    '[id]': pattern,
                                    '[name]': pattern
                                }
                            )) + '"]'
                    const domNodes:Array<DomNode> =
                        window.document.querySelectorAll(`link${selector}`)
                    if (domNodes.length)
                        for (const domNode:DomNode of domNodes) {
                            const inPlaceDomNode:DomNode =
                                window.document.createElement('style')
                            const path:string = domNode.attributes.href.value
                                .replace(/&.*/g, '')
                            if (!assets.hasOwnProperty(path))
                                continue
                            inPlaceDomNode.textContent = assets[path].source()
                            if (cascadingStyleSheetPattern[pattern] === 'body')
                                window.document.body.appendChild(
                                    inPlaceDomNode)
                            else if (cascadingStyleSheetPattern[
                                pattern
                            ] === 'in')
                                domNode.parentNode.insertBefore(
                                    inPlaceDomNode, domNode)
                            else if (cascadingStyleSheetPattern[
                                pattern
                            ] === 'head')
                                window.document.head.appendChild(
                                    inPlaceDomNode)
                            domNode.parentNode.removeChild(domNode)
                            /*
                                NOTE: This doesn't prevent webpack from
                                creating this file if present in another chunk
                                so removing it (and a potential source map
                                file) later in the "done" hook.
                            */
                            filePathsToRemove.push(Helper.stripLoader(path))
                            delete assets[path]
                        }
                    else
                        console.warn(
                            'No referenced cascading style sheet file in ' +
                            'resulting markup found with selector: link' +
                            selector)
                }
            if (javaScriptPattern)
                for (const pattern:string in javaScriptPattern) {
                    if (!javaScriptPattern.hasOwnProperty(pattern))
                        continue
                    let selector:string = '[href*=".js"]'
                    if (pattern !== '*')
                        selector = '[src^="' + path.relative(
                            basePath, Helper.renderFilePathTemplate(
                                javaScriptChunkNameTemplate, {
                                    '[hash]': '',
                                    '[id]': pattern,
                                    '[name]': pattern
                                }
                            ) + '"]')
                    const domNodes:Array<DomNode> =
                        window.document.querySelectorAll(`script${selector}`)
                    if (domNodes.length)
                        for (const domNode:DomNode of domNodes) {
                            const inPlaceDomNode:DomNode =
                                window.document.createElement('script')
                            const path:string = domNode.attributes.src.value
                                .replace(/&.*/g, '')
                            if (!assets.hasOwnProperty(path))
                                continue
                            inPlaceDomNode.textContent = assets[path].source()
                            if (javaScriptPattern[pattern] === 'body')
                                window.document.body.appendChild(
                                    inPlaceDomNode)
                            else if (javaScriptPattern[pattern] === 'in')
                                domNode.parentNode.insertBefore(
                                    inPlaceDomNode, domNode)
                            else if (javaScriptPattern[pattern] === 'head')
                                window.document.head.appendChild(
                                    inPlaceDomNode)
                            domNode.parentNode.removeChild(domNode)
                            /*
                                NOTE: This doesn't prevent webpack from
                                creating this file if present in another chunk
                                so removing it (and a potential source map
                                file) later in the "done" hook.
                            */
                            filePathsToRemove.push(Helper.stripLoader(path))
                            delete assets[path]
                        }
                    else
                        console.warn(
                            'No referenced javaScript file in resulting ' +
                            `markup found with selector: script${selector}`)
                }
            resolve({
                content: content.replace(
                    /^(\s*<!doctype [^>]+?>\s*)[\s\S]*$/i, '$1'
                ) + window.document.documentElement.outerHTML.replace(
                    /##\+#\+#\+##/g, '<%'
                ).replace(/##-#-#-##/g, '%>'),
                filePathsToRemove
            })
        })
    }
    /**
     * Strips loader informations form given module request including loader
     * prefix and query parameter.
     * @param moduleID - Module request to strip.
     * @returns Given module id stripped.
     */
    static stripLoader(moduleID:string|String):string {
        moduleID = moduleID.toString()
        const moduleIDWithoutLoader:string = moduleID.substring(
            moduleID.lastIndexOf('!') + 1)
        return moduleIDWithoutLoader.includes(
            '?'
        ) ? moduleIDWithoutLoader.substring(0, moduleIDWithoutLoader.indexOf(
                '?'
            )) : moduleIDWithoutLoader
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
     * @param filePathTemplate - File path to process placeholder in.
     * @param informations - Scope to use for processing.
     * @returns Processed file path.
     */
    static renderFilePathTemplate(
        filePathTemplate:string, informations:{[key:string]:string} = {
            '[name]': '.__dummy__', '[id]': '.__dummy__',
            '[hash]': '.__dummy__'
        }
    ):string {
        let filePath:string = filePathTemplate
        for (const placeholderName:string in informations)
            if (informations.hasOwnProperty(placeholderName))
                filePath = filePath.replace(new RegExp(
                    Tools.stringEscapeRegularExpressions(placeholderName), 'g'
                ), informations[placeholderName])
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
     * @param relativeModuleFilePaths - List of relative file path to search
     * for modules in.
     * @returns A new resolved request.
     */
    static applyContext(
        request:string, context:string = './', referencePath:string = './',
        aliases:PlainObject = {}, moduleReplacements:PlainObject = {},
        relativeModuleFilePaths:Array<string> = ['node_modules']
    ):string {
        referencePath = path.resolve(referencePath)
        if (request.startsWith('./') && path.resolve(
            context
        ) !== referencePath) {
            request = path.resolve(context, request)
            for (const modulePath:string of relativeModuleFilePaths) {
                const pathPrefix:string = path.resolve(
                    referencePath, modulePath)
                if (request.startsWith(pathPrefix)) {
                    request = request.substring(pathPrefix.length)
                    if (request.startsWith('/'))
                        request = request.substring(1)
                    return Helper.applyModuleReplacements(Helper.applyAliases(
                        request.substring(request.lastIndexOf('!') + 1),
                        aliases
                    ), moduleReplacements)
                }
            }
            if (request.startsWith(referencePath)) {
                request = request.substring(referencePath.length)
                if (request.startsWith('/'))
                    request = request.substring(1)
                return Helper.applyModuleReplacements(Helper.applyAliases(
                    request.substring(request.lastIndexOf('!') + 1), aliases
                ), moduleReplacements)
            }
        }
        return request
    }
    /**
     * Check if given request points to an external dependency not maintained
     * by current package context.
     * @param request - Request to determine.
     * @param context - Context of current project.
     * @param requestContext - Context of given request to resolve relative to.
     * @param normalizedInternalInjection - Mapping of chunk names to modules
     * which should be injected.
     * @param externalModuleLocations - Array if paths where external modules
     * take place.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleFilePaths - List of relative file path to search
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
     * @returns A new resolved request indicating whether given request is an
     * external one.
     */
    static determineExternalRequest(
        request:string, context:string = './', requestContext:string = './',
        normalizedInternalInjection:NormalizedInternalInjection = {},
        externalModuleLocations:Array<string> = ['node_modules'],
        aliases:PlainObject = {}, moduleReplacements:PlainObject = {},
        extensions:Extensions = {
            file: {
                external: ['.js'],
                internal: [
                    '.js', '.json', '.css', '.eot', '.gif', '.html', '.ico',
                    '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2'
                ]
            }, module: []
        }, referencePath:string = './', pathsToIgnore:Array<string> = ['.git'],
        relativeModuleFilePaths:Array<string> = ['node_modules'],
        packageEntryFileNames:Array<string> = ['index', 'main'],
        packageMainPropertyNames:Array<string> = ['main', 'module'],
        packageAliasPropertyNames:Array<string> = [],
        includePattern:Array<string|RegExp> = [],
        excludePattern:Array<string|RegExp> = [],
        inPlaceNormalLibrary:boolean = false,
        inPlaceDynamicLibrary:boolean = true,
        encoding:string = 'utf-8'
    ):?string {
        context = path.resolve(context)
        requestContext = path.resolve(requestContext)
        referencePath = path.resolve(referencePath)
        // NOTE: We apply alias on externals additionally.
        let resolvedRequest:string = Helper.applyModuleReplacements(
            Helper.applyAliases(request.substring(
                request.lastIndexOf('!') + 1
            ), aliases), moduleReplacements)
        /*
            NOTE: Aliases and module replacements doesn't have to be forwarded
            since we pass an already resolved request.
        */
        let filePath:?string = Helper.determineModuleFilePath(
            resolvedRequest, {}, {}, extensions, context, requestContext,
            pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames,
            packageMainPropertyNames, packageAliasPropertyNames, encoding)
        /*
            NOTE: We mark dependencies as external if there file couldn't be
            resolved or are specified to be external explicitly.
        */
        if (!(filePath || inPlaceNormalLibrary) || Tools.isAnyMatching(
            resolvedRequest, includePattern
        ))
            return Helper.applyContext(
                resolvedRequest, requestContext, referencePath,
                aliases, moduleReplacements, relativeModuleFilePaths)
        if (Tools.isAnyMatching(resolvedRequest, excludePattern))
            return null
        for (const chunkName:string in normalizedInternalInjection)
            if (normalizedInternalInjection.hasOwnProperty(chunkName))
                for (const moduleID:string of normalizedInternalInjection[
                    chunkName
                ])
                    if (Helper.determineModuleFilePath(
                        moduleID, aliases, moduleReplacements, extensions,
                        context, requestContext, pathsToIgnore,
                        relativeModuleFilePaths, packageEntryFileNames,
                        packageMainPropertyNames, packageAliasPropertyNames,
                        encoding
                    ) === filePath)
                        return null
        /*
            NOTE: We mark dependencies as external if they does not contain a
            loader in their request and aren't part of the current main package
            or have a file extension other than javaScript aware.
        */
        if (!inPlaceNormalLibrary && (
            extensions.file.external.length === 0 || filePath &&
            extensions.file.external.includes(path.extname(filePath)) ||
            !filePath && extensions.file.external.includes('')
        ) && !(inPlaceDynamicLibrary && request.includes('!')) && (
                !filePath && inPlaceDynamicLibrary || filePath && (
                    !filePath.startsWith(context) ||
                    Helper.isFilePathInLocation(
                        filePath, externalModuleLocations))
            )
        )
            return Helper.applyContext(
                resolvedRequest, requestContext, referencePath, aliases,
                moduleReplacements, relativeModuleFilePaths)
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
        filePath:string, buildConfiguration:BuildConfiguration, paths:Path
    ):?string {
        let result:?string = null
        for (const type:string in buildConfiguration)
            if (path.extname(
                filePath
            ) === `.${buildConfiguration[type].extension}`) {
                result = type
                break
            }
        if (!result)
            for (const type:string of ['source', 'target'])
                for (const assetType:string in paths[type].asset)
                    if (
                        paths[type].asset.hasOwnProperty(assetType) &&
                        assetType !== 'base' && paths[type].asset[assetType] &&
                        filePath.startsWith(paths[type].asset[assetType])
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
        configuration:BuildConfiguration, entryPath:string = './',
        pathsToIgnore:Array<string> = ['.git'],
        mainFileBasenames:Array<string> = ['index', 'main']
    ):ResolvedBuildConfiguration {
        const buildConfiguration:ResolvedBuildConfiguration = []
        for (const type:string in configuration)
            if (configuration.hasOwnProperty(type)) {
                const newItem:ResolvedBuildConfigurationItem =
                    Tools.extendObject(true, {filePaths: []}, configuration[
                        type])
                for (const file:File of Tools.walkDirectoryRecursivelySync(
                    entryPath, (file:File):?false => {
                        if (Helper.isFilePathInLocation(
                            file.path, pathsToIgnore
                        ))
                            return false
                    }
                ))
                    if (
                        file.stat.isFile() &&
                        path.extname(file.path).substring(
                            1
                        ) === newItem.extension &&
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
     * @param internalInjection - List of module ids or module file paths.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of module replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to resolve relative to.
     * @param referencePath - Path to search for local modules.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleFilePaths - List of relative file path to search
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
        internalInjection:InternalInjection, aliases:PlainObject = {},
        moduleReplacements:PlainObject = {}, extensions:Extensions = {
            file: {
                external: ['.js'],
                internal: [
                    '.js', '.json', '.css', '.eot', '.gif', '.html', '.ico',
                    '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2'
                ]
            }, module: []
        }, context:string = './', referencePath:string = '',
        pathsToIgnore:Array<string> = ['.git'],
        relativeModuleFilePaths:Array<string> = ['', 'node_modules', '../'],
        packageEntryFileNames:Array<string> = [
            '__package__', '', 'index', 'main'],
        packageMainPropertyNames:Array<string> = ['main', 'module'],
        packageAliasPropertyNames:Array<string> = [],
        encoding:string = 'utf-8'
    ):{filePaths:Array<string>;directoryPaths:Array<string>} {
        const filePaths:Array<string> = []
        const directoryPaths:Array<string> = []
        const normalizedInternalInjection:NormalizedInternalInjection =
            Helper.resolveModulesInFolders(
                Helper.normalizeInternalInjection(internalInjection),
                aliases, moduleReplacements, context, referencePath,
                pathsToIgnore)
        for (const chunkName:string in normalizedInternalInjection)
            if (normalizedInternalInjection.hasOwnProperty(chunkName))
                for (const moduleID:string of normalizedInternalInjection[
                    chunkName
                ]) {
                    const filePath:?string = Helper.determineModuleFilePath(
                        moduleID, aliases, moduleReplacements, extensions,
                        context, referencePath, pathsToIgnore,
                        relativeModuleFilePaths, packageEntryFileNames,
                        packageMainPropertyNames, packageAliasPropertyNames,
                        encoding)
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
     * @param normalizedInternalInjection - Injection data structure of
     * modules with folder references to resolve.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @returns Given injections with resolved folder pointing modules.
     */
    static resolveModulesInFolders(
        normalizedInternalInjection:NormalizedInternalInjection,
        aliases:PlainObject = {}, moduleReplacements:PlainObject = {},
        context:string = './', referencePath:string = '',
        pathsToIgnore:Array<string> = ['.git']
    ):NormalizedInternalInjection {
        if (referencePath.startsWith('/'))
            referencePath = path.relative(context, referencePath)
        for (const chunkName:string in normalizedInternalInjection)
            if (normalizedInternalInjection.hasOwnProperty(chunkName)) {
                let index:number = 0
                for (let moduleID:string of normalizedInternalInjection[
                    chunkName
                ]) {
                    moduleID = Helper.applyModuleReplacements(
                        Helper.applyAliases(Helper.stripLoader(
                            moduleID
                        ), aliases), moduleReplacements)
                    const resolvedPath:string = path.resolve(
                        referencePath, moduleID)
                    if (Tools.isDirectorySync(resolvedPath)) {
                        normalizedInternalInjection[chunkName].splice(index, 1)
                        for (
                            const file:File of
                            Tools.walkDirectoryRecursivelySync(resolvedPath, (
                                file:File
                            ):?false => {
                                if (Helper.isFilePathInLocation(
                                    file.path, pathsToIgnore
                                ))
                                    return false
                            })
                        )
                            if (file.stat.isFile())
                                normalizedInternalInjection[chunkName].push(
                                    './' + path.relative(
                                        referencePath, path.resolve(
                                            resolvedPath, file.path)))
                    } else if (
                        moduleID.startsWith('./') &&
                        !moduleID.startsWith('./' + path.relative(
                            context, referencePath
                        ))
                    )
                        normalizedInternalInjection[chunkName][index] =
                            `./${path.relative(context, resolvedPath)}`
                    index += 1
                }
            }
        return normalizedInternalInjection
    }
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param internalInjection - Given internal injection to normalize.
     * @returns Normalized representation of given internal injection.
     */
    static normalizeInternalInjection(
        internalInjection:InternalInjection
    ):NormalizedInternalInjection {
        let result:NormalizedInternalInjection = {}
        if (internalInjection instanceof Object && Tools.isPlainObject(
            internalInjection
        )) {
            let hasContent:boolean = false
            const chunkNamesToDelete:Array<string> = []
            for (const chunkName:string in internalInjection)
                if (internalInjection.hasOwnProperty(chunkName))
                    if (Array.isArray(internalInjection[chunkName]))
                        if (internalInjection[chunkName].length > 0) {
                            hasContent = true
                            result[chunkName] = internalInjection[chunkName]
                        } else
                            chunkNamesToDelete.push(chunkName)
                    else {
                        hasContent = true
                        result[chunkName] = [internalInjection[chunkName]]
                    }
            if (hasContent)
                for (const chunkName:string of chunkNamesToDelete)
                    delete result[chunkName]
            else
                result = {index: []}
        } else if (typeof internalInjection === 'string')
            result = {index: [internalInjection]}
        else if (Array.isArray(internalInjection))
            result = {index: internalInjection}
        return result
    }
    /**
     * Determines all concrete file paths for given injection which are marked
     * with the "__auto__" indicator.
     * @param givenInjection - Given internal and external injection to take
     * into account.
     * @param buildConfigurations - Resolved build configuration.
     * @param modulesToExclude - A list of modules to exclude (specified by
     * path or id) or a mapping from chunk names to module ids.
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
    static resolveInjection(
        givenInjection:Injection,
        buildConfigurations:ResolvedBuildConfiguration,
        modulesToExclude:InternalInjection,
        aliases:PlainObject = {}, moduleReplacements:PlainObject = {},
        extensions:Extensions = {
            file: {
                external: ['.js'],
                internal: [
                    '.js', '.json', '.css', '.eot', '.gif', '.html', '.ico',
                    '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2'
                ]
            }, module: []
        }, context:string = './', referencePath:string = '',
        pathsToIgnore:Array<string> = ['.git']
    ):Injection {
        const injection:Injection = Tools.extendObject(
            true, {}, givenInjection)
        const moduleFilePathsToExclude:Array<string> =
            Helper.determineModuleLocations(
                modulesToExclude, aliases, moduleReplacements, extensions,
                context, referencePath, pathsToIgnore
            ).filePaths
        for (const type:string of ['internal', 'external'])
            /* eslint-disable curly */
            if (typeof injection[type] === 'object') {
                for (const chunkName:string in injection[type])
                    if (injection[type][chunkName] === '__auto__') {
                        injection[type][chunkName] = []
                        const modules:{
                            [key:string]:string
                        } = Helper.getAutoChunk(
                            buildConfigurations, moduleFilePathsToExclude,
                            referencePath)
                        for (const subChunkName:string in modules)
                            if (modules.hasOwnProperty(subChunkName))
                                injection[type][chunkName].push(
                                    modules[subChunkName])
                        /*
                            Reverse array to let javaScript and main files be
                            the last ones to export them rather.
                        */
                        injection[type][chunkName].reverse()
                    }
            } else if (injection[type] === '__auto__')
            /* eslint-enable curly */
                injection[type] = Helper.getAutoChunk(
                    buildConfigurations, moduleFilePathsToExclude, context)
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
    static getAutoChunk(
        buildConfigurations:ResolvedBuildConfiguration,
        moduleFilePathsToExclude:Array<string>, context:string
    ):{[key:string]:string} {
        const result:{[key:string]:string} = {}
        const injectedModuleIDs:{[key:string]:Array<string>} = {}
        for (
            const buildConfiguration:ResolvedBuildConfigurationItem of
            buildConfigurations
        ) {
            if (!injectedModuleIDs[buildConfiguration.outputExtension])
                injectedModuleIDs[buildConfiguration.outputExtension] = []
            for (const moduleFilePath:string of buildConfiguration.filePaths)
                if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                    const relativeModuleFilePath:string = './' + path.relative(
                        context, moduleFilePath)
                    const directoryPath:string = path.dirname(
                        relativeModuleFilePath)
                    const baseName:string = path.basename(
                        relativeModuleFilePath,
                        `.${buildConfiguration.extension}`)
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
                        if (result.hasOwnProperty(moduleID))
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
     * @param relativeModuleFilePaths - List of relative file path to search
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
        moduleID:string, aliases:PlainObject = {},
        moduleReplacements:PlainObject = {}, extensions:Extensions = {
            file: {
                external: ['.js'],
                internal: [
                    '.js', '.json', '.css', '.eot', '.gif', '.html', '.ico',
                    '.jpg', '.png', '.ejs', '.svg', '.ttf', '.woff', '.woff2'
                ]
            }, module: []
        }, context:string = './', referencePath:string = '',
        pathsToIgnore:Array<string> = ['.git'],
        relativeModuleFilePaths:Array<string> = ['node_modules'],
        packageEntryFileNames:Array<string> = ['index'],
        packageMainPropertyNames:Array<string> = ['main'],
        packageAliasPropertyNames:Array<string> = [],
        encoding:string = 'utf-8'
    ):?string {
        moduleID = Helper.applyModuleReplacements(Helper.applyAliases(
            Helper.stripLoader(moduleID), aliases
        ), moduleReplacements)
        if (!moduleID)
            return null
        let moduleFilePath:string = moduleID
        if (moduleFilePath.startsWith('./'))
            moduleFilePath = path.join(referencePath, moduleFilePath)
        for (const moduleLocation:string of [referencePath].concat(
            relativeModuleFilePaths.map((filePath:string):string =>
                path.resolve(context, filePath))
        ))
            for (let fileName:string of ['', '__package__'].concat(
                packageEntryFileNames
            ))
                for (const moduleExtension:string of extensions.module.concat([
                    ''
                ]))
                    for (const fileExtension:string of [''].concat(
                        extensions.file.internal
                    )) {
                        let currentModuleFilePath:string
                        if (moduleFilePath.startsWith('/'))
                            currentModuleFilePath = path.resolve(
                                moduleFilePath)
                        else
                            currentModuleFilePath = path.resolve(
                                moduleLocation, moduleFilePath)
                        let packageAliases:PlainObject = {}
                        if (fileName === '__package__') {
                            if (Tools.isDirectorySync(
                                currentModuleFilePath
                            )) {
                                const pathToPackageJSON:string = path.resolve(
                                    currentModuleFilePath, 'package.json')
                                if (Tools.isFileSync(pathToPackageJSON)) {
                                    let localConfiguration:PlainObject = {}
                                    try {
                                        localConfiguration = JSON.parse(
                                            fileSystem.readFileSync(
                                                pathToPackageJSON, {encoding}))
                                    } catch (error) {}
                                    for (
                                        const propertyName:string of
                                        packageMainPropertyNames
                                    )
                                        if (
                                            localConfiguration.hasOwnProperty(
                                                propertyName
                                            ) && typeof localConfiguration[
                                                propertyName
                                            ] === 'string' &&
                                            localConfiguration[propertyName]
                                        ) {
                                            fileName = localConfiguration[
                                                propertyName]
                                            break
                                        }
                                    for (
                                        const propertyName:string of
                                        packageAliasPropertyNames
                                    )
                                        if (
                                            localConfiguration.hasOwnProperty(
                                                propertyName
                                            ) &&
                                            typeof localConfiguration[
                                                propertyName
                                            ] === 'object'
                                        ) {
                                            packageAliases =
                                                localConfiguration[
                                                    propertyName]
                                            break
                                        }
                                }
                            }
                            if (fileName === '__package__')
                                continue
                        }
                        fileName = Helper.applyModuleReplacements(
                            Helper.applyAliases(fileName, packageAliases),
                            moduleReplacements)
                        if (fileName)
                            currentModuleFilePath = path.resolve(
                                currentModuleFilePath,
                                `${fileName}${moduleExtension}${fileExtension}`
                            )
                        else
                            currentModuleFilePath +=
                                `${fileName}${moduleExtension}${fileExtension}`
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
    static applyAliases(moduleID:string, aliases:PlainObject):string {
        for (const alias:string in aliases)
            if (alias.endsWith('$')) {
                if (moduleID === alias.substring(0, alias.length - 1))
                    moduleID = aliases[alias]
            } else
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
        moduleID:string, replacements:PlainObject
    ):string {
        for (const replacement:string in replacements)
            if (replacements.hasOwnProperty(replacement))
                moduleID = moduleID.replace(
                    new RegExp(replacement), replacements[replacement])
        return moduleID
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
