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
path.walkDirectoryRecursivelySync = (directoryPath, callback=(
    filePath, stat
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
const moduleDirectories = []
for (let module of configuration.test.modules) {
    let stat = fileSystem.statSync(module)
    if (stat.isDirectory()) {
        moduleDirectories.push(path.resolve(module))
        path.walkDirectoryRecursivelySync(module, (filePath) => {
            modules.push(filePath)
        })
    } else {
        moduleDirectories.push(path.dirname(path.resolve(module)))
        modules.push(module)
    }
}
configuration.test.modules = modules
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
    context: __dirname,
    debug: true,
    devtool: configuration.developmentTool,
    devserver: configuration.developmentServer,
    // region input
    resolve: {
        root: [__dirname],
        extensions: configuration.knownExtensions,
        alias: configuration.test.moduleAliases
    },
    entry: configuration.test.modules,
    // endregion
    // region output
    output: {
        path: __dirname,
        filename: configuration.files.javaScript,
        pathinfo: false,
        hashFunction: configuration.hashAlgorithm
    },
    externals: {'qunit.js': 'qunit'},
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
            },
            // endregion
            // region html
            {
                test: /\.jade$/,
                loader: 'file?name=template/[name].html?' +
                    `${configuration.hashAlgorithm}=[hash]!extract!` +
                    `${loader.html}!${loader.preprocessor.jade}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.template)
            }
            // endregion
        ],
        loaders: [
            // Loads dependencies.
            // region html
            {
                test: /\.html$/,
                loader: 'file?name=template/[name].[ext]?' +
                    `${configuration.hashAlgorithm}=[hash]!extract!` +
                    loader.html,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.template)
            },
            // endregion
            // region cascadingStyleSheet
            {test: /\.css$/, loader: loader.cascadingStyleSheet}
            // endregion
        ]
    },
    plugins: [new plugins.HTML({
        debug: true, inject: 'head', minify: false, hash: true,
        /*
            NOTE: Provides a workaround to handle a bug with changed loader
            configurations (which we need here). Simple solution would be:

            `html?${global.JSON.stringify({attrs: 'img:src link:href'})}!` +
            `jade-html?${global.JSON.stringify({pretty: true, debug: true})}!` +
            `${__dirname}/test.jade`
        */
        template: (() => {
            const string = new global.String('html?' + global.JSON.stringify({
                attrs: 'img:src link:href'
            }) + '!jade-html?' +
            `${global.JSON.stringify({pretty: true, debug: true})}!` +
            `${__dirname}/test.jade`)
            const nativeReplaceFunction = string.replace
            string.replace = () => {
                string.replace = nativeReplaceFunction
                return string
            }
            return string
        })(),
        favicon: `${configuration.path.asset.source}${configuration.path.asset.image}favicon.ico`
    })]
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
