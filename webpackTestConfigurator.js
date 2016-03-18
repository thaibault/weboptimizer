#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'

// region imports
import configuration from './configurator.compiled'
import * as fileSystem from 'fs'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
const plugins = require('webpack-load-plugins')()
plugins.HTML = plugins.html
 // endregion
// region helper functions
path.walkDirectoryRecursivelySync = (directoryPath, callback = (
    /* filePath, stat */
) => {}) => {
    fileSystem.readdirSync(directoryPath).forEach(fileName => {
        const filePath = path.resolve(directoryPath, fileName)
        const stat = fileSystem.statSync(filePath)
        if (callback(filePath, stat) !== false && stat && stat.isDirectory())
            path.walkDirectoryRecursivelySync(filePath, callback)
    })
}
// endregion
// region initialisation
const modules = []
const moduleDirectories = [configuration.path.asset.source]
for (let module of configuration.test.modules) {
    let stat = fileSystem.statSync(module)
    let directoryToAdd
    if (stat.isDirectory()) {
        directoryToAdd = `${path.resolve(module)}/`
        path.walkDirectoryRecursivelySync(module, filePath => {
            modules.push(filePath)
        })
    } else {
        directoryToAdd = `${path.resolve(path.dirname(module))}/`
        modules.push(module)
    }
    if (moduleDirectories.indexOf(directoryToAdd) === -1)
        moduleDirectories.push(directoryToAdd)
}
configuration.test.modules = modules
let favicon = configuration.path.asset.source +
    `${configuration.path.asset.image}favicon.ico`
try {
    if (!fileSystem.statSync(favicon).isFile())
        favicon = null
} catch (error) {
    favicon = null
}
// / region loader
const loader = {
    preprocessor: {
        less: `less?${global.JSON.stringify(configuration.preprocessor.less)}`,
        sass: `sass?${global.JSON.stringify(configuration.preprocessor.sass)}`,
        scss: `sass?${global.JSON.stringify(configuration.preprocessor.scss)}`,
        babel: 'babel?' + global.JSON.stringify(
            configuration.preprocessor.modernJavaScript
        ),
        coffee: 'coffee',
        jade: 'jade-html?' +
            global.JSON.stringify(configuration.preprocessor.jade),
        literateCoffee: 'coffee?literate'
    },
    html: `html?${global.JSON.stringify(configuration.html)}`,
    cascadingStyleSheet: 'css?' + global.JSON.stringify(
        configuration.cascadingStyleSheet)
}
// / endregion
// endregion
// region configuration
export default {
    // NOTE: building context is this hierarchy up:
    // "PROJECT/node_modules/webOptimizer"
    context: path.resolve(__dirname, '../../'),
    debug: true,
    devtool: configuration.developmentTool,
    devserver: configuration.developmentServer,
    // region input
    resolve: {
        root: moduleDirectories,
        extensions: configuration.knownExtensions,
        alias: configuration.test.moduleAliases
    },
    entry: configuration.test.modules,
    // endregion
    // region output
    output: {
        path: path.resolve(__dirname, '../../'),
        filename: configuration.files.javaScript,
        pathinfo: false,
        hashFunction: configuration.hashAlgorithm
    },
    // endregion
    module: {
        preLoaders: [
            // Convert to native web types.
            // region script
            {
                test: /\.js$/,
                loader: loader.preprocessor.babel,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.javaScript)
                ].concat(moduleDirectories)
            },
            {
                test: /\.coffee$/,
                loader: loader.preprocessor.coffee,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript)
                ].concat(moduleDirectories)
            },
            {
                test: /\.(?:coffee\.md|litcoffee)$/,
                loader: loader.preprocessor.literateCoffee,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript)
                ].concat(moduleDirectories)
            }
            // endregion
        ],
        loaders: [
            // Loads dependencies.
            // region cascadingStyleSheet
            {test: /\.css$/, loader: loader.cascadingStyleSheet}
            // endregion
        ]
    },
    plugins: [new plugins.HTML({
        debug: true, minify: false, hash: true, favicon,
        template: configuration.test.template
    })]
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
