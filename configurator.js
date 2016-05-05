#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import Helper from './helper.compiled'
// NOTE: "{configuration as metaConfiguration}" would result in a read only
// variable named "metaConfiguration".
import {configuration as givenMetaConfiguration} from './package'
import type {Mapping, MetaConfiguration, ResolvedCongfiguration} from
    './type'
let metaConfiguration:MetaConfiguration = Helper.addDynamicGetterAndSetter(
    Helper.convertPlainObjectToMap(givenMetaConfiguration))
metaConfiguration.default.path.context = path.resolve(__dirname, '../../')
if (
    path.basename(path.dirname(process.cwd())) === 'node_modules' ||
    path.basename(path.dirname(process.cwd())) === '.staging' &&
    path.basename(path.dirname(path.dirname(process.cwd()))) === 'node_modules'
)
    metaConfiguration.default.path.context = process.cwd()
let specificConfiguration:Mapping = Helper.addDynamicGetterAndSetter(
    Helper.convertPlainObjectToMap(module.require(path.join(
        metaConfiguration.default.path.context, 'package'))))
const name:string = specificConfiguration.name
specificConfiguration = specificConfiguration.webOptimizer ||
    Helper.convertPlainObjectToMap({})
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
const libraryConfiguration:{[key:string]:any} = metaConfiguration.library
let configuration:Mapping
if (debug)
    configuration = Helper.extendObject(
        true, metaConfiguration.default, metaConfiguration.debug)
else
    configuration = metaConfiguration.default
if (
    specificConfiguration.library === true ||
    specificConfiguration.library === undefined && configuration.library
)
    configuration = Helper.extendObject(
        true, configuration, libraryConfiguration)
// endregion
// region merging and evaluating default, test, dynamic and specific configs
// Merges project specific configurations with default ones.
configuration = Helper.extendObject(true, configuration, specificConfiguration)
configuration.debug = debug
// region load additional dynamically given configuration
let count:number = 0
let filePath:?string = null
while (true) {
    const newFilePath:string = configuration.path.context +
        `.dynamicConfiguration-${count}.json`
    try {
        fileSystem.accessSync(newFilePath, fileSystem.F_OK)
    } catch (error) {
        break
    }
    filePath = newFilePath
    count += 1
}
if (filePath) {
    const runtimeInformation:{[key:string]:any} =
        Helper.convertPlainObjectToMap(
            JSON.parse(fileSystem.readFileSync(filePath, {encoding: 'utf-8'})))
    // region apply test configuration
    if (
        runtimeInformation.givenCommandLineArguments.length > 2 &&
        runtimeInformation.givenCommandLineArguments[2] === 'test'
    )
        Helper.extendObject(true, configuration, configuration.test)
    // endregion
    Helper.extendObject(true, configuration, runtimeInformation)
    let result:any = null
    try {
        result = (new Function(
            'configuration', 'return ' +
            runtimeInformation.givenCommandLineArguments[runtimeInformation
                .givenCommandLineArguments.length - 1]
        ))(configuration)
    } catch (error) {}
    if (Helper.isObject(result))
        Helper.extendObject(true, configuration, result)
}
// endregion
// / region build absolute paths
for (const pathConfiguration:{[key:string]:{[key:string]:string}|string} of [
    configuration.path, configuration.path.asset
])
    for (const key:string of ['source', 'target'])
        if (pathConfiguration[key])
            pathConfiguration[key] = path.resolve(
                configuration.path.context, Helper.resolveMapping(
                    pathConfiguration[key], configuration)
            ) + '/'
// / endregion
const resolvedConfiguration:ResolvedCongfiguration =
    Helper.resolveMapping(configuration)
// endregion
// region consolidate file specific build configuration
// Apply default file level build configurations to all file type specific
// ones.
const defaultConfiguration:{[key:string]:any} =
    resolvedConfiguration.build.default
delete resolvedConfiguration.build.default
for (
    const [type:string, buildConfiguration:{[key:string]:any}] of
    resolvedConfiguration.build
)
    resolvedConfiguration.build[type] = Helper.extendObject(
        true, Helper.convertPlainObjectToMap({}),
        defaultConfiguration, Helper.extendObject(
            true, Helper.convertPlainObjectToMap({extension: type}),
            buildConfiguration, Helper.convertPlainObjectToMap({type})))
// endregion
// region apply webpack html plugin workaround
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations.
*/
let index:number = 0
for (const html:{[key:string]:any} of resolvedConfiguration.files.html) {
    if (
        html.template.indexOf('!') !== -1 && typeof html.template !== 'object'
    ) {
        const templateRequestBackup:string = html.template
        resolvedConfiguration.files.html[index].template = new String(
            html.template)
        resolvedConfiguration.files.html[index].template.replace = (
            (string:string):Function => (
                _search:RegExp|string, _replacement:string|Function
            ):string => string
        )(templateRequestBackup)
    }
    index += 1
}
// endregion
export default resolvedConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
