#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'

// region imports
import extend from 'extend'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
export configuration = require('./package').configuration
import path from 'path'
const specificConfiguration = require('../../package').webOptimizer || {}
// endregion
// region helper functions
const isObject = object => {
    return (
        object !== null && typeof object === 'object' &&
        global.Object.getPrototypeOf(object) === global.Object.prototype)
}
const isFunction = object => {
    return object && {}.toString.call(object) === '[object Function]'
}
const resolve = object => {
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
                )(global, configuration, __dirname, global.process.cwd()))
            object[key] = resolve(object[key])
        }
    return object
}
// endregion
// region loading default configuration
// NOTE: Given node command line arguments results in "npm_config_*"
// environment variables.
var debug = configuration.default.debug
if (typeof specificConfiguration.debug !== undefined)
    debug = specificConfiguration.debug
if (global.process.env.npm_config_production)
    debug = false
else if (global.process.env.npm_config_debug)
    debug = true
if (debug)
    configuration = extend(true, configuration.default, configuration.debug)
else
    configuration = configuration.default
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations (which we need here). Simple solution would be:

    template: `html?${global.JSON.stringify(configuration.html)}!jade-html?` +
        `${global.JSON.stringify(configuration.jade)}!` +
        `${configuration.path.source}index.jade`

    NOTE: We can't use this since placing in-place would be impossible so.
    favicon: `${configuration.path.asset.source}image/favicon.ico`,
    NOTE: We can't use this since the file would have to be available before
    building.
    manifest: configuration.preprocessor.jade.includeManifest
*/
configuration.files.html[0].template = (() => {
    const string = new global.String('html?' + global.JSON.stringify(
        configuration.html
    ) + '!jade-html?' +
    `${global.JSON.stringify(configuration.preprocessor.jade)}!` +
    `${configuration.path.source}index.jade`)
    const nativeReplaceFunction = string.replace
    string.replace = () => {
        string.replace = nativeReplaceFunction
        return string
    }
    return string
})
// endregion
// region merging and evaluating default and specific configuration
configuration = extend(true, configuration, specificConfiguration)
configuration.debug = debug
for (let pathConfiguration of [configuration.path, configuration.path.asset])
    for (let key of ['source', 'target'])
        if (pathConfiguration[key])
            pathConfiguration[key] = path.resolve(__dirname, '../../', resolve(
                pathConfiguration[key])
            ) + '/'
configuration = resolve(configuration)
if (isFunction(configuration.files.html[0].template))
    configuration.files.html[0].template = configuration.files.html[0]
        .template()
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
