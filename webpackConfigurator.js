#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'

// region imports
import * as configuration from './configurator.compiled'
import * as fileSystem from 'fs'
import * as dom from 'jsdom'
import path from 'path'
fileSystem.removeDirectoryRecursivelySync = require('rimraf').sync
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import webpack from 'webpack'
const plugins = require('webpack-load-plugins')()
plugins.HTML = plugins.html
plugins.ExtractText = plugins.extractText
import {RawSource as WebpackRawSource} from 'webpack-sources'
plugins.Offline = require('offline-plugin')
// endregion
// region initialisation
// / region configuration pre processing
let index = 0
for (let path of configuration.internalInjects) {
    configuration.internalInjects[index] = configuration.path.asset.source +
        path
    index += 1
}
configuration.plugins = []
for (let htmlOptions of configuration.files.html)
    configuration.plugins.push(new plugins.HTML(htmlOptions))
// Optimizes and bundles webpack output.
if (configuration.optimizer.uglifyJS)
    configuration.plugins.push(new webpack.optimize.UglifyJsPlugin(
        configuration.optimizer.uglifyJS))
if (configuration.offline) {
    if (!configuration.offline.excludes)
        configuration.offline.excludes = []
    if (configuration.inPlace.cascadingStyleSheet)
        configuration.offline.excludes.push('*.css')
    if (configuration.inPlace.javaScript) {
        configuration.offline.excludes.push('*.js')
    configuration.plugins.push(new plugins.Offline(configuration.offline))
}
configuration.plugins.push(new plugins.ExtractText(
    configuration.files.cascadingStyleSheet))
// // region in-place configured assets in the main html file
if (!process.argv[1].endsWith('/webpack-dev-server'))
    configuration.plugins.push({apply: compiler => {
        compiler.plugin('emit', (compilation, callback) => {
            if (
                configuration.inPlace.cascadingStyleSheet ||
                configuration.inPlace.javaScript
            )
                dom.env(compilation.assets[configuration.files.html[
                    0
                ].filename].source(), (error, window) => {
                    if (configuration.inPlace.cascadingStyleSheet) {
                        const urlPrefix = configuration.files
                            .cascadingStyleSheet.replace('[contenthash]', '')
                        const domNode = window.document.querySelector(
                            `link[href^="${urlPrefix}"]`)
                        let asset
                        for (asset in compilation.assets)
                            if (asset.startsWith(urlPrefix))
                                break
                        const inPlaceDomNode = window.document.createElement(
                            'style')
                        inPlaceDomNode.textContent = compilation.assets[
                            asset
                        ].source()
                        domNode.parentNode.insertBefore(inPlaceDomNode, domNode)
                        domNode.parentNode.removeChild(domNode)
                        /*
                            NOTE: This doesn't prevent webpack from creating
                            this file if present in another chunk so removing
                            it (and a potential source map file) later in the
                            "done" hook.
                        */
                        delete compilation.assets[asset]
                    }
                    if (configuration.inPlace.javaScript) {
                        const urlPrefix = configuration.files.javaScript
                            .replace('[hash]', '')
                        const domNode = window.document.querySelector(
                            `script[src^="${urlPrefix}"]`)
                        let asset
                        for (asset in compilation.assets)
                            if (asset.startsWith(urlPrefix))
                                break
                        domNode.textContent = compilation.assets[asset].source()
                        domNode.removeAttribute('src')
                        /*
                            NOTE: This doesn't prevent webpack from creating
                            this file if present in another chunk so removing
                            it (and a potential source map file) later in the
                            "done" hook.
                        */
                        delete compilation.assets[asset]
                    }
                    compilation.assets[configuration.files.html[
                        0
                    ].filename] = new WebpackRawSource(
                        compilation.assets[configuration.files.html[
                            0
                        ].filename].source().replace(
                            /^(\s*<!doctype[^>]+>\s*).*/i, '$1'
                        ) + window.document.documentElement.outerHTML)
                    callback()
                })
        })
        compiler.plugin('after-emit', (compilation, callback) => {
            if (configuration.inPlace.cascadingStyleSheet)
                fileSystem.removeDirectoryRecursivelySync(path.join(
                    configuration.path.target, 'cascadingStyleSheet'
                ), {glob: false})
            if (configuration.inPlace.javaScript) {
                const assetFilePath = path.join(
                    configuration.path.target,
                    configuration.files.javaScript.replace(
                        `?${configuration.hashAlgorithm}=[hash]`, ''))
                for (let filePath of [assetFilePath, `${assetFilePath}.map`])
                    try {
                        fileSystem.unlinkSync(filePath)
                    } catch (error) {}
                let javaScriptPath = path.join(
                    configuration.path.target,
                    configuration.path.asset.javaScript)
                if (fileSystem.readdirSync(javaScriptPath).length === 0)
                    fileSystem.rmdirSync(javaScriptPath)
            }
            callback()
        })
    }})
// // endregion
// / endregion
// / region loader
const loader = {
    preprocessor: {
        less: `less?${JSON.stringify(configuration.preprocessor.less)}`,
        sass: `sass?${JSON.stringify(configuration.preprocessor.sass)}`,
        scss: `sass?${JSON.stringify(configuration.preprocessor.scss)}`,
        babel: 'babel?' + JSON.stringify(
            configuration.preprocessor.modernJavaScript
        ),
        coffee: 'coffee',
        jade: `jade-html?${JSON.stringify(configuration.preprocessor.jade)}`,
        literateCoffee: 'coffee?literate'
    },
    html: `html?${JSON.stringify(configuration.html)}`,
    cascadingStyleSheet: plugins.extractText.extract('css?' + JSON.stringify(
        configuration.cascadingStyleSheet)),
    postprocessor: {
        image: 'url?' + JSON.stringify(
            configuration.optimizer.image.file
        ) + `!image?${JSON.stringify(configuration.optimizer.image.content)}`,
        font: {
            eot: `url?${JSON.stringify(configuration.optimizer.font.eot)}`,
            woff: `url?${JSON.stringify(configuration.optimizer.font.woff)}`,
            ttf: `url?${JSON.stringify(configuration.optimizer.font.ttf)}`,
            svg: `url?${JSON.stringify(configuration.optimizer.font.svg)}`
        }
    }
}
// / endregion
module.exports = {
    // NOTE: building context is this hierarchy up:
    // "PROJECT/node_modules/webOptimizer"
    context: path.resolve(path.join(__dirname, '/../..')),
    debug: configuration.debug,
    devtool: configuration.developmentTool,
    devserver: configuration.developmentServer,
    // region input
    resolve: {
        root: [configuration.path.asset.source],
        extensions: configuration.knownExtensions,
        alias: configuration.moduleAliases
    },
    entry: configuration.externalInjects.concat(configuration.internalInjects),
    // endregion
    // region output
    output: {
        path: configuration.path.target,
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
                loader: `${loader.cascadingStyleSheet}!` +
                    loader.preprocessor.less,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.less)
            },
            {
                test: /\.sass$/,
                loader: `${loader.cascadingStyleSheet}!` +
                    loader.preprocessor.sass,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.sass)
            },
            {
                test: /\.scss$/,
                loader: `${loader.cascadingStyleSheet}!` +
                    loader.preprocessor.scss,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.scss)
            },
            // endregion
            // region script
            {
                test: /\.js$/,
                loader: loader.preprocessor.babel,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.javaScript)
            },
            {
                test: /\.coffee$/,
                loader: loader.preprocessor.coffee,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript)
            },
            {
                test: /\.(?:coffee\.md|litcoffee)$/,
                loader: loader.preprocessor.literateCoffee,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript)
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
        ],
        postLoaders: [
            // Optimize loaded assets.
            // region font
            {
                test: /\.eot(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.eot
            },
            {test: /\.woff2?$/, loader: loader.postprocessor.font.woff},
            {
                test: /\.ttf(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.ttf
            },
            {
                test: /\.svg(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.svg
            },
            // endregion
            // region image
            {test: /\.(?:png|jpg|ico|gif)$/, loader: loader.postprocessor.image}
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
