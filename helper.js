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
import {ChildProcess} from 'child_process'
import Tools from 'clientnode'
import * as fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import type {
    BuildConfiguration, Injection, InternalInjection,
    NormalizedInternalInjection, Path, PlainObject, ResolvedBuildConfiguration,
    ResolvedBuildConfigurationItem, TraverseFilesCallbackFunction
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
    // region data
    /**
     * Converts given serialized, base64 encoded or file path given object into
     * a native javaScript one if possible.
     * @param serializedObject - Object as string.
     * @param scope - An optional scope which will be used to evaluate given
     * object in.
     * @param name - The name under given scope will be available.
     * @returns The parsed object if possible and null otherwise.
     */
    static parseEncodedObject(
        serializedObject:string, scope:Object = {}, name:string = 'scope'
    ):?PlainObject {
        if (serializedObject.endsWith('.json') && Helper.isFileSync(
            serializedObject
        ))
            serializedObject = fileSystem.readFileSync(serializedObject, {
                encoding: 'utf-8'})
        if (!serializedObject.startsWith('{'))
            serializedObject = Buffer.from(
                serializedObject, 'base64'
            ).toString('utf8')
        try {
            // IgnoreTypeCheck
            return new Function(name, `return ${serializedObject}`)(scope)
        } catch (error) {}
        return null
    }
    // endregion
    // region process handler
    /**
     * Generates a one shot close handler which triggers given promise methods.
     * If a reason is provided it will be given as resolve target. An Error
     * will be generated if return code is not zero. The generated Error has
     * a property "returnCode" which provides corresponding process return
     * code.
     * @param resolve - Promise's resolve function.
     * @param reject - Promise's reject function.
     * @param reason - Promise target if process has a zero return code.
     * @param callback - Optional function to call of process has successfully
     * finished.
     * @returns Process close handler function.
     */
    static getProcessCloseHandler(
        resolve:Function, reject:Function, reason:any = null,
        callback:Function = ():void => {}
    ):((returnCode:?number) => void) {
        let finished:boolean = false
        return (returnCode:?number):void => {
            if (!finished)
                if (typeof returnCode !== 'number' || returnCode === 0) {
                    callback()
                    resolve(reason)
                } else {
                    const error:Error = new Error(
                        `Task exited with error code ${returnCode}`)
                    // IgnoreTypeCheck
                    error.returnCode = returnCode
                    reject(error)
                }
            finished = true
        }
    }
    /**
     * Forwards given child process communication channels to corresponding
     * current process communication channels.
     * @param childProcess - Child process meta data.
     * @returns Given child process meta data.
     */
    static handleChildProcess(childProcess:ChildProcess):ChildProcess {
        childProcess.stdout.pipe(process.stdout)
        childProcess.stderr.pipe(process.stderr)
        childProcess.on('close', (returnCode:number):void => {
            if (returnCode !== 0)
                console.error(`Task exited with error code ${returnCode}`)
        })
        return childProcess
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
                    Tools.stringConvertToValidRegularExpression(
                        placeholderName
                    ), 'g'
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
     * @param relativeModuleFilePaths - List of relative file path to search
     * for modules in.
     * @returns A new resolved request.
     */
    static applyContext(
        request:string, context:string = './', referencePath:string = './',
        aliases:PlainObject = {},
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
                    return Helper.applyAliases(request.substring(
                        request.lastIndexOf('!') + 1
                    ), aliases)
                }
            }
            if (request.startsWith(referencePath)) {
                request = request.substring(referencePath.length)
                if (request.startsWith('/'))
                    request = request.substring(1)
                return Helper.applyAliases(request.substring(
                    request.lastIndexOf('!') + 1
                ), aliases)
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
     * @param externalHandableFileExtensions - File extensions which should be
     * able to be handled by the external module bundler. If array is empty
     * every extension will be assumed to be supported.
     * @returns A new resolved request indicating whether given request is an
     * external one.
     */
    static determineExternalRequest(
        request:string, context:string = './', requestContext:string = './',
        normalizedInternalInjection:NormalizedInternalInjection = {},
        externalModuleLocations:Array<string> = ['node_modules'],
        aliases:PlainObject = {},
        extensions:{file:Array<string>;module:Array<string>} = {
            file: [
                '.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html',
                '.json', '.eot', '.ttf', '.woff'
            ], module: []
        }, referencePath:string = './', pathsToIgnore:Array<string> = ['.git'],
        relativeModuleFilePaths:Array<string> = ['node_modules'],
        packageEntryFileNames:Array<string> = ['index', 'main'],
        packageMainPropertyNames:Array<string> = ['main', 'module'],
        packageAliasPropertyNames:Array<string> = [],
        includePattern:Array<string|RegExp> = [],
        excludePattern:Array<string|RegExp> = [],
        inPlaceNormalLibrary:boolean = false,
        inPlaceDynamicLibrary:boolean = true,
        externalHandableFileExtensions:Array<string> = [
            '.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html',
            '.json', '.eot', '.ttf', '.woff'
        ]
    ):?string {
        context = path.resolve(context)
        requestContext = path.resolve(requestContext)
        referencePath = path.resolve(referencePath)
        // NOTE: We apply alias on externals additionally.
        let resolvedRequest:string = Helper.applyAliases(
            request.substring(request.lastIndexOf('!') + 1), aliases)
        /*
            NOTE: Aliases doesn't have to be forwarded since we pass an already
            resolved request.
        */
        let filePath:?string = Helper.determineModuleFilePath(
            resolvedRequest, {}, extensions, requestContext, referencePath,
            pathsToIgnore, relativeModuleFilePaths, packageEntryFileNames,
            packageMainPropertyNames, packageAliasPropertyNames)
        /*
            NOTE: We mark dependencies as external if there file couldn't be
            resolved or are specified to be external explicitly.
        */
        if (!(filePath || inPlaceNormalLibrary) || Tools.isAnyMatching(
            resolvedRequest, includePattern
        ))
            return Helper.applyContext(
                resolvedRequest, requestContext, referencePath,
                aliases, relativeModuleFilePaths)
        if (Tools.isAnyMatching(resolvedRequest, excludePattern))
            return null
        for (const chunkName:string in normalizedInternalInjection)
            if (normalizedInternalInjection.hasOwnProperty(chunkName))
                for (const moduleID:string of normalizedInternalInjection[
                    chunkName
                ])
                    if (Helper.determineModuleFilePath(
                        moduleID, aliases, extensions, context, referencePath,
                        pathsToIgnore, relativeModuleFilePaths,
                        packageEntryFileNames, packageMainPropertyNames,
                        packageAliasPropertyNames
                    ) === filePath)
                        return null
        /*
            NOTE: We mark dependencies as external if they does not contain a
            loader in their request and aren't part of the current main package
            or have a file extension other than javaScript aware.
        */
        if (!inPlaceNormalLibrary && (
            externalHandableFileExtensions.length === 0 || filePath &&
            externalHandableFileExtensions.includes(path.extname(filePath)) ||
            !filePath && externalHandableFileExtensions.includes('')
        ) && !(inPlaceDynamicLibrary && request.includes('!')) && (
            !filePath && inPlaceDynamicLibrary || filePath && (
            !filePath.startsWith(context) || Helper.isFilePathInLocation(
                filePath, externalModuleLocations))
        ))
            return Helper.applyContext(
                resolvedRequest, requestContext, referencePath,
                aliases, relativeModuleFilePaths)
        return null
    }
    /**
     * Checks if given path points to a valid directory.
     * @param filePath - Path to directory.
     * @returns A boolean which indicates directory existents.
     */
    static isDirectorySync(filePath:string):boolean {
        try {
            return fileSystem.statSync(filePath).isDirectory()
        } catch (error) {
            return false
        }
    }
    /**
     * Checks if given path points to a valid file.
     * @param filePath - Path to file.
     * @returns A boolean which indicates file existents.
     */
    static isFileSync(filePath:string):boolean {
        try {
            return fileSystem.statSync(filePath).isFile()
        } catch (error) {
            return false
        }
    }
    /**
     * Iterates through given directory structure recursively and calls given
     * callback for each found file. Callback gets file path and corresponding
     * stat object as argument.
     * @param directoryPath - Path to directory structure to traverse.
     * @param callback - Function to invoke for each traversed file.
     * @returns Given callback function.
     */
    static walkDirectoryRecursivelySync(
        directoryPath:string, callback:TraverseFilesCallbackFunction = (
            _filePath:string, _stat:Object
        ):?boolean => true
    ):TraverseFilesCallbackFunction {
        fileSystem.readdirSync(directoryPath).forEach((
            fileName:string
        ):void => {
            const filePath:string = path.resolve(directoryPath, fileName)
            const stat:Object = fileSystem.statSync(filePath)
            if (callback(filePath, stat) !== false && stat && stat.isDirectory(
            ))
                Helper.walkDirectoryRecursivelySync(filePath, callback)
        })
        return callback
    }
    /**
     * Copies given source file via path to given target directory location
     * with same target name as source file has or copy to given complete
     * target file path.
     * @param sourcePath - Path to file to copy.
     * @param targetPath - Target directory or complete file location to copy
     * to.
     * @returns Determined target file path.
     */
    static copyFileSync(sourcePath:string, targetPath:string):string {
        /*
            NOTE: If target path references a directory a new file with the
            same name will be created.
        */
        if (Helper.isDirectorySync(targetPath))
            targetPath = path.resolve(targetPath, path.basename(sourcePath))
        fileSystem.writeFileSync(targetPath, fileSystem.readFileSync(
            sourcePath))
        return targetPath
    }
    /**
     * Copies given source directory via path to given target directory
     * location with same target name as source file has or copy to given
     * complete target directory path.
     * @param sourcePath - Path to directory to copy.
     * @param targetPath - Target directory or complete directory location to
     * copy in.
     * @returns Determined target directory path.
     */
    static copyDirectoryRecursiveSync(
        sourcePath:string, targetPath:string
    ):string {
        // Check if folder needs to be created or integrated.
        if (Helper.isDirectorySync(targetPath))
            targetPath = path.resolve(targetPath, path.basename(
                sourcePath))
        fileSystem.mkdirSync(targetPath)
        Helper.walkDirectoryRecursivelySync(sourcePath, (
            currentSourcePath:string, stat:Object
        ):void => {
            const currentTargetPath:string = path.join(
                targetPath, currentSourcePath.substring(sourcePath.length))
            if (stat.isDirectory())
                fileSystem.mkdirSync(currentTargetPath)
            else
                Helper.copyFileSync(currentSourcePath, currentTargetPath)
        })
        return targetPath
    }
    /**
     * Determines a asset type if given file.
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
                    if (paths[type].asset.hasOwnProperty(
                        assetType
                    ) && assetType !== 'base' &&
                    paths[type].asset[assetType] && filePath.startsWith(
                        paths[type].asset[assetType]
                    ))
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
     * @returns Converted build configuration.
     */
    static resolveBuildConfigurationFilePaths(
        configuration:BuildConfiguration, entryPath:string = './',
        pathsToIgnore:Array<string> = ['.git']
    ):ResolvedBuildConfiguration {
        const buildConfiguration:ResolvedBuildConfiguration = []
        let index:number = 0
        for (const type:string in configuration)
            if (configuration.hasOwnProperty(type)) {
                const newItem:ResolvedBuildConfigurationItem =
                    Tools.extendObject(true, {filePaths: []}, configuration[
                        type])
                Helper.walkDirectoryRecursivelySync(entryPath, ((
                    index:number,
                    buildConfigurationItem:ResolvedBuildConfigurationItem
                ):TraverseFilesCallbackFunction => (
                    filePath:string, stat:Object
                ):?boolean => {
                    if (Helper.isFilePathInLocation(filePath, pathsToIgnore))
                        return false
                    if (stat.isFile() && path.extname(filePath).substring(
                        1
                    ) === buildConfigurationItem.extension && !(new RegExp(
                        buildConfigurationItem.filePathPattern
                    )).test(filePath))
                        buildConfigurationItem.filePaths.push(filePath)
                })(index, newItem))
                buildConfiguration.push(newItem)
                index += 1
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
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */
    static determineModuleLocations(
        internalInjection:InternalInjection, aliases:PlainObject = {},
        extensions:{file:Array<string>;module:Array<string>} = {
            file: [
                '.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html',
                '.json', '.eot', '.ttf', '.woff'
            ], module: []
        }, context:string = './', referencePath:string = '',
        pathsToIgnore:Array<string> = ['.git'],
        relativeModuleFilePaths:Array<string> = ['', 'node_modules', '../'],
        packageEntryFileNames:Array<string> = [
            '__package__', '', 'index', 'main'],
        packageMainPropertyNames:Array<string> = ['main', 'module'],
        packageAliasPropertyNames:Array<string> = []
    ):{filePaths:Array<string>;directoryPaths:Array<string>} {
        const filePaths:Array<string> = []
        const directoryPaths:Array<string> = []
        const normalizedInternalInjection:NormalizedInternalInjection =
            Helper.normalizeInternalInjection(internalInjection)
        for (const chunkName:string in normalizedInternalInjection)
            if (normalizedInternalInjection.hasOwnProperty(chunkName))
                for (const moduleID:string of normalizedInternalInjection[
                    chunkName
                ]) {
                    const filePath:?string = Helper.determineModuleFilePath(
                        moduleID, aliases, extensions, context, referencePath,
                        pathsToIgnore, relativeModuleFilePaths,
                        packageEntryFileNames, packageMainPropertyNames,
                        packageAliasPropertyNames)
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
     * Determines a list of concrete file paths for given module id pointing
     * to a folder which isn't a package.
     * @param normalizedInternalInjection - Injection data structure of
     * modules with folder references to resolve.
     * @param aliases - Mapping of aliases to take into account.
     * @param extensions - List of file and module extensions.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @returns Given injections with resolved folder pointing modules.
     */
    static resolveModulesInFolders(
        normalizedInternalInjection:NormalizedInternalInjection,
        aliases:PlainObject = {},
        extensions:{file:Array<string>;module:Array<string>} = {
            file: [
                '.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html',
                '.json', '.eot', '.ttf', '.woff'
            ], module: []
        }, context:string = './', referencePath:string = '',
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
                    moduleID = Helper.applyAliases(
                        Helper.stripLoader(moduleID), aliases)
                    const directoryPath:string = path.resolve(
                        referencePath, moduleID)
                    if (Helper.isDirectorySync(directoryPath)) {
                        normalizedInternalInjection[chunkName].splice(index, 1)
                        Helper.walkDirectoryRecursivelySync(directoryPath, (
                            filePath:string, stat:Object
                        ):?false => {
                            if (Helper.isFilePathInLocation(
                                path.resolve(directoryPath, filePath),
                                pathsToIgnore
                            ))
                                return false
                            if (stat.isFile())
                                normalizedInternalInjection[chunkName].push(
                                    path.relative(referencePath, path.resolve(
                                        directoryPath, filePath)))
                        })
                    }
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
        aliases:PlainObject = {},
        extensions:{file:Array<string>;module:Array<string>} = {
            file: [
                '.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html',
                '.json', '.eot', '.ttf', '.woff'
            ], module: []
        }, context:string = './', referencePath:string = '',
        pathsToIgnore:Array<string> = ['.git']
    ):Injection {
        const injection:Injection = Tools.extendObject(
            true, {}, givenInjection)
        const moduleFilePathsToExclude:Array<string> =
            Helper.determineModuleLocations(
                modulesToExclude, aliases, extensions, context, referencePath,
                pathsToIgnore
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
                            Reverse array to let javaScript files be the last
                            ones to export them rather.
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
        const injectedBaseNames:{[key:string]:Array<string>} = {}
        for (
            const buildConfiguration:ResolvedBuildConfigurationItem of
            buildConfigurations
        ) {
            if (!injectedBaseNames[buildConfiguration.outputExtension])
                injectedBaseNames[buildConfiguration.outputExtension] = []
            for (const moduleFilePath:string of buildConfiguration.filePaths)
                if (!moduleFilePathsToExclude.includes(moduleFilePath)) {
                    const relativeModuleFilePath:string = path.relative(
                        context, moduleFilePath)
                    const baseName:string = path.basename(
                        relativeModuleFilePath,
                        `.${buildConfiguration.extension}`)
                    /*
                        Ensure that each output type has only one source
                        representation.
                    */
                    if (!injectedBaseNames[
                        buildConfiguration.outputExtension
                    ].includes(baseName)) {
                        /*
                            Ensure that same basenames and different output
                            types can be distinguished by their extension
                            (JavaScript-Modules remains without extension since
                            they will be handled first because the build
                            configurations are expected to be sorted in this
                            context).
                        */
                        if (result[baseName])
                            result[relativeModuleFilePath] =
                                relativeModuleFilePath
                        else
                            result[baseName] = relativeModuleFilePath
                        injectedBaseNames[
                            buildConfiguration.outputExtension
                        ].push(baseName)
                    }
                }
        }
        return result
    }
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
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
     * @returns File path or given module id if determinations has failed or
     * wasn't necessary.
     */
    static determineModuleFilePath(
        moduleID:string, aliases:PlainObject = {},
        extensions:{file:Array<string>;module:Array<string>} = {
            file: [
                '.js', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html',
                '.json', '.eot', '.ttf', '.woff'
            ], module: []
        }, context:string = './', referencePath:string = '',
        pathsToIgnore:Array<string> = ['.git'],
        relativeModuleFilePaths:Array<string> = ['node_modules'],
        packageEntryFileNames:Array<string> = ['index'],
        packageMainPropertyNames:Array<string> = ['main'],
        packageAliasPropertyNames:Array<string> = []
    ):?string {
        moduleID = Helper.applyAliases(Helper.stripLoader(moduleID), aliases)
        if (!moduleID)
            return null
        let moduleFilePath:string = moduleID
        if (moduleFilePath.startsWith('./'))
            moduleFilePath = path.join(context, moduleFilePath)
        for (const moduleLocation:string of [referencePath].concat(
            relativeModuleFilePaths.map((filePath:string):string =>
                path.resolve(referencePath, filePath))
        ))
            for (let fileName:string of ['', '__package__'].concat(
                packageEntryFileNames
            ))
                for (const moduleExtension:string of extensions.module.concat([
                    ''
                ]))
                    for (const fileExtension:string of [''].concat(
                        extensions.file
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
                            if (Helper.isDirectorySync(
                                currentModuleFilePath
                            )) {
                                const pathToPackageJSON:string = path.resolve(
                                    currentModuleFilePath, 'package.json')
                                if (Helper.isFileSync(pathToPackageJSON)) {
                                    let localConfiguration:PlainObject = {}
                                    try {
                                        localConfiguration = JSON.parse(
                                            fileSystem.readFileSync(
                                                pathToPackageJSON, {
                                                    encoding: 'utf-8'}))
                                    } catch (error) {}
                                    for (
                                        const propertyName:string of
                                        packageMainPropertyNames
                                    )
                                        if (localConfiguration.hasOwnProperty(
                                            propertyName
                                        ) && typeof localConfiguration[
                                            propertyName
                                        ] === 'string' && localConfiguration[
                                            propertyName
                                        ]) {
                                            fileName = localConfiguration[
                                                propertyName]
                                            break
                                        }
                                    for (
                                        const propertyName:string of
                                        packageAliasPropertyNames
                                    )
                                        if (localConfiguration.hasOwnProperty(
                                            propertyName
                                        ) && typeof localConfiguration[
                                            propertyName
                                        ] === 'object') {
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
                        fileName = Helper.applyAliases(
                            fileName, packageAliases)
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
                        if (Helper.isFileSync(currentModuleFilePath))
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
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
