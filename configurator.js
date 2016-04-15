#!/usr/bin/env node
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

import helper from './helper.compiled'
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
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations (which we need here). Simple solution would be:

    ...,
    template: {
        "__execute__": 'html?' +
            `${global.JSON.stringify(currentConfiguration.html)}!jade?` +
            `${global.JSON.stringify(currentConfiguration.jade)}!` +
            `${currentConfiguration.path.source}index.jade`
    },
    ...

    or for testing:

    ...,
    template: {
        "__execute__": `html?${global.JSON.stringify(self.html)}!jade?` +
            `${global.JSON.stringify(self.preprocessor.jade)}!` +
            `${webOptimizerPath}/test.jade`
    },
    ...

    NOTE: We can't use this since placing in-place would be impossible so.
    favicon: `${currentConfiguration.path.asset.image}favicon.ico`,
    NOTE: We can't use this since the file would have to be available before
    building.
    manifest: currentConfiguration.preprocessor.jade.includeManifest
*/
currentConfiguration.default.files.html[0].template = (() => {
    let string = 'html?' + global.JSON.stringify(currentConfiguration.html) +
        '!jade?' +
        `${global.JSON.stringify(currentConfiguration.preprocessor.jade)}!`
    if (
        currentConfiguration.givenCommandLineArguments &&
        2 < currentConfiguration.givenCommandLineArguments.length &&
        currentConfiguration.givenCommandLineArguments[2] === 'test'
    )
        string += `${currentConfiguration.path.source}index.jade`
    else
        string += `${__dirname}/test.jade`
    string = new global.String(string)
    const nativeReplaceFunction = string.replace
    string.replace = () => {
        string.replace = nativeReplaceFunction
        return string
    }
    return string
})
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
// region merging and evaluating default and specific configuration
// Merges project specific configurations with default ones.
currentConfiguration = extend(
    true, currentConfiguration, specificConfiguration)
currentConfiguration.debug = debug
for (let pathConfiguration of [
    currentConfiguration.path, currentConfiguration.path.asset
])
    for (let key of ['source', 'target'])
        if (pathConfiguration[key])
            pathConfiguration[key] = path.resolve(
                currentConfiguration.path.context, helper.resolve(
                    pathConfiguration[key], currentConfiguration)
            ) + '/'
currentConfiguration = helper.resolve(
    currentConfiguration, currentConfiguration)
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
    extend(true, currentConfiguration, global.JSON.parse(
        fileSystem.readFileSync(filePath, {encoding: 'utf-8'})))
    currentConfiguration = helper.resolve(
        currentConfiguration, currentConfiguration)
}
// endregion
// region apply test configuration
if (
    currentConfiguration.givenCommandLineArguments &&
    2 < currentConfiguration.givenCommandLineArguments.length &&
    currentConfiguration.givenCommandLineArguments[2] === 'test'
)
    extend(true, currentConfiguration, currentConfiguration.test)
// endregion
// region apply webpack html plugin workaround
if (helper.isFunction(currentConfiguration.files.html[0].template))
    currentConfiguration.files.html[0].template =
        currentConfiguration.files.html[0].template()
// endregion
export default currentConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
