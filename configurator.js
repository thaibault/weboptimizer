#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
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
const specificConfiguration = module.require(path.join(
    currentConfiguration.default.path.context, 'package'
)).webOptimizer || {}
// endregion
// region loading default configuration
// NOTE: Given node command line arguments results in "npm_config_*"
// environment variables.
var debug = currentConfiguration.default.debug
if (typeof specificConfiguration.debug !== undefined)
    debug = specificConfiguration.debug
if (global.process.env.npm_config_production)
    debug = false
else if (global.process.env.npm_config_debug)
    debug = true
currentConfiguration.default.path.context += '/'
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations (which we need here). Simple solution would be:

    template: `html?${global.JSON.stringify(currentConfiguration.html)}!` +
        `jade-html?${global.JSON.stringify(currentConfiguration.jade)}!` +
        `${currentConfiguration.path.source}index.jade`

    NOTE: We can't use this since placing in-place would be impossible so.
    favicon: `${currentConfiguration.path.asset.image}favicon.ico`,
    NOTE: We can't use this since the file would have to be available before
    building.
    manifest: currentConfiguration.preprocessor.jade.includeManifest
*/
currentConfiguration.default.files.html[0].template = (() => {
    const string = new global.String('html?' + global.JSON.stringify(
        currentConfiguration.html
    ) + '!jade-html?' +
    `${global.JSON.stringify(currentConfiguration.preprocessor.jade)}!` +
    `${currentConfiguration.path.source}index.jade`)
    const nativeReplaceFunction = string.replace
    string.replace = () => {
        string.replace = nativeReplaceFunction
        return string
    }
    return string
})
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations (which we need here). Simple solution would be:

    `html?${global.JSON.stringify({attrs: 'img:src link:href'})}!` +
    `jade-html?${global.JSON.stringify({pretty: true, debug: true})}!` +
    `${__dirname}/test.jade`
*/
currentConfiguration.default.test.template = (() => {
    const string = new global.String('html?' + global.JSON.stringify({
        attrs: 'img:src link:href'
    }) + `!jade-html?${global.JSON.stringify({pretty: true, debug: true})}!` +
    `${__dirname}/test.jade`)
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
if (helper.isFunction(currentConfiguration.files.html[0].template))
    currentConfiguration.files.html[0].template =
        currentConfiguration.files.html[0].template()
if (helper.isFunction(currentConfiguration.test.template))
    currentConfiguration.test.template = currentConfiguration.test.template()
// endregion
export default currentConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
