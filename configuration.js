#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
let defaultConfiguration = require('defaultConfiguration.json')
const defaultDebugConfiguration = require('defaultDebugConfiguration.json')
const specificConfiguration = require('../../package.json').webOptimizer || {}
// endregion
// NOTE: Given node command line arguments results in "npm_config_*"
// environment variables.
if(!!global.process.env.npm_config_production)
    var debug = defaultConfiguration.debug
else
    var debug = !!global.process.env.npm_config_debug ||
        specificConfiguration.debug || defaultConfiguration.debug
if(debug)
    defaultConfiguration = extend(
        true, defaultConfiguration, defaultDebugConfiguration)
/*
    NOTE: Provides a workaround to handle a bug with changed loader
    configurations (which we need here). Simple solution would be:

    template: `html?${JSON.stringify(html)}!jade-html?` +
        `${JSON.stringify(jade)}!${sourcePath}index.jade`

    NOTE: We can't use this since placing in-place would be impossible so.
    favicon: `${sourceAssetPath}image/favicon.ico`,
    NOTE: We can't use this since the file would have to be available before
    building.
    manifest: packageConfiguration.jade.includeManifest
*/
defaultConfiguration.files.html[0].template = (() => {
    const string = new global.String('html?' + JSON.stringify(
        html
    ) + `!jade-html?${JSON.stringify(jade)}!${sourcePath}index.jade`)
    const nativeReplaceFunction = string.replace
    string.replace = (search, replacement) => {
        string.replace = nativeReplaceFunction
        return string
    }
    return string
})()
module.exports = extend(true, defaultConfiguration, specificConfiguration)
resolveConfiguration = (object) =>
    for(let key in object)
        if(key === '__execute__')
            return (new Function(
                'self', 'webOptimizerPath', `return ${object[key][subKey]}`
            ))(configuration, __dirname)
        if(typeof object[key] === 'object')
            object[key] = resolveConfiguration(object[key])
module.exports = resolveConfiguration(module.exports)
for (let key of [
    'sourcePath', 'targetPath', 'sourceAssetPath', 'targetAssetPath'
])
    if(module.exports[key])
        module.exports[key] =  path.normalize(path.join(
            `../../${module.exports[key]}`))
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
