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
// NOTE: "{configuration as currentConfiguration}" would result in a read only
// variable.
import {configuration} from './package'
let currentConfiguration:Map = Helper.addDynamicGetterAndSetter(
    Helper.convertPlainObjectToMapRecursivly(configuration))
currentConfiguration.default.path.context = path.resolve(__dirname, '../../')
if (
    path.basename(path.dirname(process.cwd())) === 'node_modules' ||
    path.basename(path.dirname(process.cwd())) === '.staging' &&
    path.basename(path.dirname(path.dirname(process.cwd()))) === 'node_modules'
)
    currentConfiguration.default.path.context = process.cwd()
let specificConfiguration = Helper.addDynamicGetterAndSetter(
    Helper.convertPlainObjectToMapRecursivly(module.require(path.join(
        currentConfiguration.default.path.context, 'package'))))
const name = specificConfiguration.name
specificConfiguration = specificConfiguration.webOptimizer ||
    Helper.convertPlainObjectToMapRecursivly({})
specificConfiguration.name = name
// endregion
// region loading default configuration
// NOTE: Given node command line arguments results in "npm_config_*"
// environment variables.
var debug = currentConfiguration.default.debug
if (specificConfiguration.debug !== undefined)
    debug = specificConfiguration.debug
if (global.process.env.npm_config_production)
    debug = false
else if (global.process.env.npm_config_debug)
    debug = true
currentConfiguration.default.path.context += '/'
// Merges final default configuration object depending on given target
// environment.
const libraryConfiguration = currentConfiguration.library
if (debug)
    currentConfiguration = Helper.extendObject(
        true, currentConfiguration.default, currentConfiguration.debug)
else
    currentConfiguration = currentConfiguration.default
if (
    specificConfiguration.library === true ||
    specificConfiguration.library === undefined &&
    currentConfiguration.library
)
    currentConfiguration = Helper.extendObject(
        true, currentConfiguration, libraryConfiguration)
// endregion
// region merging and evaluating default, test, dynamic and specific configs
// Merges project specific configurations with default ones.
currentConfiguration = Helper.extendObject(
    true, currentConfiguration, specificConfiguration)
currentConfiguration.debug = debug
// region load additional dynamically given configuration
let count = 0
let filePath = null
while (true) {
    const newFilePath = currentConfiguration.path.context +
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
    const runtimeInformation = Helper.convertPlainObjectToMapRecursivly(
        global.JSON.parse(fileSystem.readFileSync(filePath, {
            encoding: 'utf-8'})))
    // region apply test configuration
    if (
        runtimeInformation.givenCommandLineArguments.length > 2 &&
        runtimeInformation.givenCommandLineArguments[2] === 'test'
    )
        Helper.extendObject(
            true, currentConfiguration, currentConfiguration.test)
    // endregion
    Helper.extendObject(true, currentConfiguration, runtimeInformation)
    let result = null
    try {
        result = (new global.Function(
            'configuration', 'return ' +
            runtimeInformation.givenCommandLineArguments[runtimeInformation
                .givenCommandLineArguments.length - 1]
        ))(currentConfiguration)
    } catch (error) {}
    if (
        result !== null && typeof result === 'object' && !global.Array.isArray(
            result
        ) && global.Object.prototype.toString.call(
            result
        ) === '[object Object]'
    )
        Helper.extendObject(true, currentConfiguration, result)
}
// endregion
// / region build absolute paths
for (const pathConfiguration of [
    currentConfiguration.path, currentConfiguration.path.asset
])
    for (const key of ['source', 'target'])
        if (pathConfiguration[key]) {
            pathConfiguration[key] = path.resolve(
                currentConfiguration.path.context, Helper.resolve(
                    pathConfiguration[key], currentConfiguration)
            ) + '/'
        }
// / endregion
currentConfiguration = Helper.resolve(currentConfiguration)
// endregion
// region consolidate file specific build configuration
// Apply default file level build configurations to all file type specific
// ones.
const defaultConfiguration = currentConfiguration.build.default
delete currentConfiguration.build.default
for (const [type, buildConfiguration] of currentConfiguration.build)
    currentConfiguration.build[type] = Helper.extendObject(
        true, Helper.convertPlainObjectToMapRecursivly({}),
        defaultConfiguration, Helper.extendObject(
            true, Helper.convertPlainObjectToMapRecursivly({extension: type}),
            buildConfiguration, Helper.convertPlainObjectToMapRecursivly({
                type})))
// endregion
// region apply webpack html plugin workaround
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations.
*/
let index = 0
for (const html of currentConfiguration.files.html) {
    if (
        html.template.indexOf('!') !== -1 && typeof html.template !== 'object'
    ) {
        const templateRequestBackup = html.template
        currentConfiguration.files.html[index].template = new global.String(
            html.template)
        currentConfiguration.files.html[index].template.replace = (
            string => () => string
        )(templateRequestBackup)
    }
    index += 1
}
// endregion
export default currentConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
