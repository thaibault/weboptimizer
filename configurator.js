#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'

// region imports
import extend from 'extend'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import {configuration} from './package'
import path from 'path'
const specificConfiguration = require('../../package').webOptimizer || {}
// endregion
let currentConfiguration = configuration
// region helper functions
const isObject = object => {
    // Checks if given entity is a object.
    return (
        object !== null && typeof object === 'object' &&
        global.Object.getPrototypeOf(object) === global.Object.prototype)
}
const isFunction = object => {
    // Checks if given entity is a function.
    return object && {}.toString.call(object) === '[object Function]'
}
const resolve = object => {
    // Processes all dynamically linked values in given object.
    if (global.Array.isArray(object)) {
        let index = 0
        for (let value of object) {
            object[index] = resolve(value)
            index += 1
        }
    } else if (isObject(object))
        for (let key in object) {
            if (key === '__execute__')
                return resolve(new global.Function(
                    'global', 'self', 'webOptimizerPath', 'currentPath',
                    `return ${object[key]}`
                )(global, currentConfiguration, __dirname, global.process.cwd(
                )))
            object[key] = resolve(object[key])
        }
    return object
}
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

    `html?${global.JSON.stringify({attrs: 'img:src link:href'})}!jade-html?` +
    `${global.JSON.stringify({pretty: true, debug: true})}!${__dirname}/` +
    'test.jade'
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
            pathConfiguration[key] = path.resolve(__dirname, '../../', resolve(
                pathConfiguration[key])
            ) + '/'
currentConfiguration = resolve(currentConfiguration)
if (isFunction(currentConfiguration.files.html[0].template))
    currentConfiguration.files.html[0].template =
        currentConfiguration.files.html[0].template()
if (isFunction(currentConfiguration.test.template))
    currentConfiguration.test.template = currentConfiguration.test.template()
// endregion
export default currentConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
