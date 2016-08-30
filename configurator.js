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
import * as fileSystem from 'fs'
import path from 'path'

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import Helper from './helper.compiled'
// NOTE: "{configuration as metaConfiguration}" would result in a read only
// variable named "metaConfiguration".
import {configuration as givenMetaConfiguration} from './package'
/* eslint-disable no-unused-vars */
import type {
    DefaultConfiguration, HTMLConfiguration, MetaConfiguration, PlainObject,
    ResolvedConfiguration
} from './type'
/* eslint-enable no-unused-vars */
let metaConfiguration:MetaConfiguration = givenMetaConfiguration
/*
    To assume two folder up from this file is usually resilient again dealing
    with projects where current working directory isn't the projects directory.
*/
metaConfiguration.default.path.context = path.resolve(__dirname, '../../')
metaConfiguration.default.contextType = 'main'
if (
    path.basename(path.dirname(process.cwd())) === 'node_modules' ||
    path.basename(path.dirname(process.cwd())) === '.staging' &&
    path.basename(path.dirname(path.dirname(process.cwd()))) === 'node_modules'
) {
    /*
        NOTE: If we are dealing was a dependency project use current directory
        as context.
    */
    metaConfiguration.default.path.context = process.cwd()
    metaConfiguration.default.contextType = 'dependency'
} else
    /*
        NOTE: If the current working directory references this file via a
        linked "node_modules" folder using current working directory as context
        is a better assumption than two folders up the hierarchy.
    */
    try {
        if (fileSystem.lstatSync(path.join(process.cwd(
        ), 'node_modules')).isSymbolicLink())
            metaConfiguration.default.path.context = process.cwd()
    } catch (error) {}
let specificConfiguration:PlainObject
try {
    // IgnoreTypeCheck
    specificConfiguration = require(path.join(
        metaConfiguration.default.path.context, 'package'))
} catch (error) {
    specificConfiguration = {name: 'mockup'}
    metaConfiguration.default.path.context = process.cwd()
}
const name:string = specificConfiguration.name
specificConfiguration = specificConfiguration.webOptimizer || {}
specificConfiguration.name = name
// endregion
// region loading default configuration
// NOTE: Given node command line arguments results in "npm_config_*"
// environment variables.
let debug:boolean = metaConfiguration.default.debug
if (specificConfiguration.debug !== undefined)
    debug = specificConfiguration.debug
if (process.env.npm_config_production)
    debug = false
else if (process.env.npm_config_debug)
    debug = true
metaConfiguration.default.path.context += '/'
// Merges final default configuration object depending on given target
// environment.
const libraryConfiguration:PlainObject = metaConfiguration.library
let configuration:DefaultConfiguration
if (debug)
    configuration = Helper.extendObject(
        true, metaConfiguration.default, metaConfiguration.debug)
else
    configuration = metaConfiguration.default
configuration.debug = debug
if (typeof configuration.library === 'object')
    Helper.extendObject(true, libraryConfiguration, configuration.library)
if (
    specificConfiguration.library === true ||
    specificConfiguration.library === undefined && configuration.library
)
    configuration = Helper.extendObject(
        true, configuration, libraryConfiguration)
// endregion
// region merging and evaluating default, test, specific and dynamic settings
// / region load additional dynamically given configuration
let count:number = 0
let filePath:?string = null
while (true) {
    const newFilePath:string = configuration.path.context +
        `.dynamicConfiguration-${count}.json`
    if (!Helper.isFileSync(newFilePath))
        break
    filePath = newFilePath
    count += 1
}
let runtimeInformation:PlainObject = {
    givenCommandLineArguments: process.argv
}
if (filePath) {
    runtimeInformation = JSON.parse(fileSystem.readFileSync(filePath, {
        encoding: 'utf-8'}))
    fileSystem.unlink(filePath, (error:?Error):void => {
        if (error)
            throw error
    })
}
if (runtimeInformation.givenCommandLineArguments.length > 2)
    // region apply documentation configuration
    if (runtimeInformation.givenCommandLineArguments[2] === 'document')
        Helper.extendObject(true, configuration, configuration.document)
    // endregion
    // region apply test configuration
    else if (
        runtimeInformation.givenCommandLineArguments[2] === 'testInBrowser'
    )
        Helper.extendObject(true, configuration, configuration.testInBrowser)
    else if (runtimeInformation.givenCommandLineArguments[2] === 'test')
        Helper.extendObject(true, configuration, configuration.test)
    // endregion
// / endregion
Helper.extendObject(
    true, configuration, specificConfiguration, runtimeInformation)
let result:?PlainObject = null
if (runtimeInformation.givenCommandLineArguments.length > 3)
    result = Helper.parseEncodedObject(
        runtimeInformation.givenCommandLineArguments[runtimeInformation
            .givenCommandLineArguments.length - 1],
        configuration, 'configuration')
if (Helper.isPlainObject(result))
    Helper.extendObject(true, configuration, result)
// / region determine existing pre compiled dll manifests file paths
configuration.dllManifestFilePaths = []
let targetDirectory:?Object = null
try {
    targetDirectory = fileSystem.statSync(configuration.path.target.base)
} catch (error) {}
if (targetDirectory && targetDirectory.isDirectory())
    fileSystem.readdirSync(configuration.path.target.base).forEach((
        fileName:string
    ):void => {
        if (fileName.match(/^.*\.dll-manifest\.json$/))
            configuration.dllManifestFilePaths.push(path.resolve(
                configuration.path.target.base, fileName))
    })
// / endregion
// / region build absolute paths
configuration.path.base = path.resolve(
    configuration.path.context, Helper.resolveDynamicDataStructure(
        configuration.path.base, configuration, false))
for (const key:string in configuration.path)
    if (
        configuration.path.hasOwnProperty(key) && key !== 'base' &&
        typeof configuration.path[key] === 'string'
    )
        configuration.path[key] = path.resolve(
            configuration.path.base, Helper.resolveDynamicDataStructure(
                configuration.path[key], configuration, false)
        ) + '/'
    else {
        configuration.path[key] = Helper.resolveDynamicDataStructure(
            configuration.path[key], configuration, false)
        if (Helper.isPlainObject(configuration.path[key])) {
            configuration.path[key].base = path.resolve(
                configuration.path.base, configuration.path[key].base)
            for (const subKey:string in configuration.path[key])
                if (
                    configuration.path[key].hasOwnProperty(subKey) &&
                    !['base', 'public'].includes(subKey) &&
                    typeof configuration.path[key][subKey] === 'string'
                )
                    configuration.path[key][subKey] = path.resolve(
                        configuration.path[key].base,
                        Helper.resolveDynamicDataStructure(
                            configuration.path[key][subKey], configuration,
                            false)
                    ) + '/'
                else {
                    configuration.path[key][subKey] =
                        Helper.resolveDynamicDataStructure(
                            configuration.path[key][subKey], configuration,
                            false)
                    if (Helper.isPlainObject(configuration.path[key][subKey])) {
                        configuration.path[key][subKey].base = path.resolve(
                            configuration.path[key].base,
                            configuration.path[key][subKey].base)
                        for (
                            const subSubKey:string in configuration.path[key][
                                subKey]
                        )
                            if (configuration.path[key][subKey].hasOwnProperty(
                                subSubKey
                            ) && subSubKey !== 'base' &&
                            typeof configuration.path[key][subKey][
                                subSubKey
                            ] === 'string')
                                configuration.path[key][subKey][
                                    subSubKey
                                ] = path.resolve(
                                    configuration.path[key][subKey].base,
                                    Helper.resolveDynamicDataStructure(
                                        configuration.path[key][subKey][
                                            subSubKey],
                                        configuration, false)
                                ) + '/'
                    }
                }
        }
    }
// / endregion
const resolvedConfiguration:ResolvedConfiguration = Helper.unwrapProxy(
    Helper.resolveDynamicDataStructure(Helper.resolveDynamicDataStructure(
        configuration
    ), null, true, '__postEvaluate__', '__postExecute__'))
// endregion
// region consolidate file specific build configuration
// Apply default file level build configurations to all file type specific
// ones.
const defaultConfiguration:PlainObject = resolvedConfiguration.build.default
delete resolvedConfiguration.build.default
for (const type:string in resolvedConfiguration.build)
    if (resolvedConfiguration.build.hasOwnProperty(type))
        resolvedConfiguration.build[type] = Helper.extendObject(true, {
        }, defaultConfiguration, Helper.extendObject(
            true, {extension: type}, resolvedConfiguration.build[type], {type})
        )
// endregion
// region resolve module location and which asset types are needed
resolvedConfiguration.module.locations = Helper.determineModuleLocations(
    resolvedConfiguration.injection.internal,
    resolvedConfiguration.module.aliases,
    resolvedConfiguration.knownExtensions, resolvedConfiguration.path.context,
    resolvedConfiguration.path.source.asset.base)
resolvedConfiguration.injection = Helper.resolveInjection(
    resolvedConfiguration.injection, Helper.resolveBuildConfigurationFilePaths(
        resolvedConfiguration.build,
        resolvedConfiguration.path.source.asset.base,
        resolvedConfiguration.path.ignore
    ), resolvedConfiguration.testInBrowser.injection.internal,
    resolvedConfiguration.module.aliases,
    resolvedConfiguration.knownExtensions,
    resolvedConfiguration.path.context,
    resolvedConfiguration.path.source.asset.base,
    resolvedConfiguration.path.ignore)
resolvedConfiguration.injection.internal = {
    given: resolvedConfiguration.injection.internal,
    // IgnoreTypeCheck
    normalized: Helper.normalizeInternalInjection(
        resolvedConfiguration.injection.internal)}
resolvedConfiguration.needed = {javaScript: configuration.debug && [
    'serve', 'testInBrowser'
].includes(resolvedConfiguration.givenCommandLineArguments[2])}
for (
    const chunkName:string in
    resolvedConfiguration.injection.internal.normalized
)
    if (resolvedConfiguration.injection.internal.normalized.hasOwnProperty(
        chunkName
    ))
        for (
            const moduleID:string of
            resolvedConfiguration.injection.internal.normalized[chunkName]
        ) {
            const type:?string = Helper.determineAssetType(
                Helper.determineModuleFilePath(
                    moduleID, resolvedConfiguration.module.aliases,
                    resolvedConfiguration.knownExtensions,
                    resolvedConfiguration.path.context,
                    resolvedConfiguration.path.source.asset.base,
                    resolvedConfiguration.path.ignore
                ), resolvedConfiguration.build, resolvedConfiguration.path)
            if (type)
                resolvedConfiguration.needed[type] = true
        }
// endregion
// region adding special aliases
// NOTE: This alias couldn't be set in the "package.json" file since this would
// result in an endless loop.
const delimiterPosition:number =
    resolvedConfiguration.files.defaultHTML.template.lastIndexOf('!')
resolvedConfiguration.loader.aliases.webOptimizerDefaultTemplateFileLoader =
    resolvedConfiguration.files.defaultHTML.template.substring(
        0, delimiterPosition)
resolvedConfiguration.module.aliases.webOptimizerDefaultTemplateFilePath$ =
    resolvedConfiguration.files.defaultHTML.template.substring(
        delimiterPosition + 1)
// endregion
// region apply webpack html plugin workaround
/*
    NOTE: Provides a workaround to handle a bug with chained loader
    configurations.
*/
for (
    let htmlConfiguration:HTMLConfiguration of resolvedConfiguration.files.html
) {
    Helper.extendObject(
        true, htmlConfiguration, resolvedConfiguration.files.defaultHTML)
    if (
        typeof htmlConfiguration.template === 'string' &&
        htmlConfiguration.template.includes('!') &&
        htmlConfiguration.template !==
            resolvedConfiguration.files.defaultHTML.template
    ) {
        const newTemplateString:Object = new String(htmlConfiguration.template)
        newTemplateString.replace = ((string:string):Function => (
            _search:RegExp|string, _replacement:string|(
                ...matches:Array<string>
            ) => string
        ):string => string)(htmlConfiguration.template)
        htmlConfiguration.template = newTemplateString
    }
}
// endregion
export default resolvedConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
