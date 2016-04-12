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
const plugins = module.require('webpack-load-plugins')()
plugins.HTML = plugins.html

import configuration from './configurator.compiled'
import helper from './helper.compiled'
 // endregion
// region initialisation
let testModuleFilePaths
let moduleDirectoryPaths
[testModuleFilePaths, moduleDirectoryPaths] = helper.determineTestModules()
let favicon = configuration.path.asset.source +
    `${configuration.path.asset.image}favicon.ico`
try {
    if (!fileSystem.statSync(favicon).isFile())
        favicon = null
} catch (error) {
    favicon = null
}
configuration.plugins = [new plugins.HTML({
    debug: true, minify: false, hash: true, favicon,
    template: configuration.test.template
})]
if (configuration.openBrowser)
    configuration.plugins.push(new plugins.openBrowser(
        configuration.openBrowser))
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
        jade: 'jade-html?' + global.JSON.stringify(
            configuration.preprocessor.jade),
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
    context: configuration.path.context,
    debug: true,
    devtool: configuration.developmentTool,
    devserver: configuration.developmentServer,
    // region input
    resolve: {
        root: moduleDirectoryPaths,
        extensions: configuration.knownExtensions,
        alias: extend(
            configuration.moduleAliases, configuration.test.moduleAliases)
    },
    entry: testModuleFilePaths,
    // endregion
    // region output
    output: {
        path: configuration.path.context,
        filename: configuration.files.javaScript,
        pathinfo: false,
        hashFunction: configuration.hashAlgorithm
    },
    // endregion
    module: {
        preLoaders: [
            // Convert to native web types.
            // region style
            {
                test: /\.less$/,
                loader: `${loader.less}!${loader.preprocessor.less}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.less)
            },
            {
                test: /\.sass$/,
                loader: `${loader.sass}!${loader.preprocessor.sass}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.sass)
            },
            {
                test: /\.scss$/,
                loader: `${loader.scss}!${loader.preprocessor.scss}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.scss)
            },
            // endregion
            // region script
            {
                test: /\.js$/,
                loader: loader.preprocessor.babel,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.javaScript)
                ].concat(moduleDirectoryPaths),
                exclude: filePath => {
                    for (let pathToIgnore of configuration.path.ignore)
                        if (filePath.startsWith(path.resolve(pathToIgnore)))
                            return true
                    return false
                }
            },
            {
                test: /\.coffee$/,
                loader: loader.preprocessor.coffee,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript)
                ].concat(moduleDirectoryPaths)
            },
            {
                test: /\.(?:coffee\.md|litcoffee)$/,
                loader: loader.preprocessor.literateCoffee,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript)
                ].concat(moduleDirectoryPaths)
            },
            // endregion
            // region html (templates)
            {
                test: /\.jade$/,
                loader:
                    `file?name=${configuration.path.asset.template}` +
                    `[name].html?${configuration.hashAlgorithm}=[hash]!` +
                    `extract!${loader.html}!${loader.preprocessor.jade}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.template),
                exclude: configuration.test.template.substring(
                    configuration.test.template.lastIndexOf('!') + 1)
            }
            // endregion
        ],
        loaders: [
            // Loads dependencies.
            // region html (templates)
            {
                test: /\.html$/,
                loader:
                    `file?name=${configuration.path.asset.template}` +
                    `[name].html?${configuration.hashAlgorithm}=[hash]!` +
                    `extract!${loader.html}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.template),
                exclude: configuration.test.template.substring(
                    configuration.test.template.lastIndexOf('!') + 1)
            },
            // endregion
            // region cascadingStyleSheet
            {test: /\.css$/, loader: loader.cascadingStyleSheet}
            // endregion
        ]
    },
    plugins: configuration.plugins
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
