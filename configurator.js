#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
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
let currentConfiguration = configuration
currentConfiguration.default.path.context = path.resolve(__dirname, '../../')
if (
    path.basename(path.dirname(process.cwd())) === 'node_modules' ||
    path.basename(path.dirname(process.cwd())) === '.staging' &&
    path.basename(path.dirname(path.dirname(process.cwd()))) === 'node_modules'
)
    currentConfiguration.default.path.context = process.cwd()
let specificConfiguration = module.require(path.join(
    currentConfiguration.default.path.context, 'package'
))
const name = specificConfiguration.name
specificConfiguration = specificConfiguration.webOptimizer || {}
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
    currentConfiguration = extend(
        true, currentConfiguration.default, currentConfiguration.debug)
else
    currentConfiguration = currentConfiguration.default
if (
    specificConfiguration.library === true ||
    specificConfiguration.library === undefined &&
    currentConfiguration.library
)
    currentConfiguration = extend(
        true, currentConfiguration, libraryConfiguration)
// endregion
// region merging and evaluating default, test, dynamic and specific configs
// Merges project specific configurations with default ones.
currentConfiguration = extend(
    true, currentConfiguration, specificConfiguration)
currentConfiguration.debug = debug
// region load additional dynamically given configuration
let count = 0
let filePath = null
while (true) {
    let newFilePath = currentConfiguration.path.context +
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
    const runtimeInformation = global.JSON.parse(
        fileSystem.readFileSync(filePath, {encoding: 'utf-8'}))
    // region apply test configuration
    if (
        runtimeInformation.givenCommandLineArguments.length > 2 &&
        runtimeInformation.givenCommandLineArguments[2] === 'test'
    )
        extend(true, currentConfiguration, currentConfiguration.test)
    // endregion
    extend(true, currentConfiguration, runtimeInformation)
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
        extend(true, currentConfiguration, result)
}
// endregion
// / region build absolute paths
for (let pathConfiguration of [
    currentConfiguration.path, currentConfiguration.path.asset
])
    for (let key of ['source', 'target'])
        if (pathConfiguration[key])
            pathConfiguration[key] = path.resolve(
                currentConfiguration.path.context, Helper.resolve(
                    pathConfiguration[key], currentConfiguration)
            ) + '/'
// / endregion
currentConfiguration = Helper.resolve(currentConfiguration)
// endregion
// region consolidate file specific build configuration
// Apply default file level build configurations to all file type specific
// ones.
const defaultConfiguration = currentConfiguration.build.default
delete currentConfiguration.build.default
global.Object.keys(currentConfiguration.build).forEach(type => {
    currentConfiguration.build[type] = extend(true, {
    }, defaultConfiguration, extend(true, {
        extension: type
    }, currentConfiguration.build[type], {type}))
})
// endregion
// region apply webpack html plugin workaround
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations.
*/
let index = 0
for (let html of currentConfiguration.files.html) {
    if (
        html.template.indexOf('!') !== -1 && typeof html.template !== 'object'
    ) {
        let templateRequestBackup = html.template
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
