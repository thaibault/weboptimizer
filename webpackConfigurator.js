#!/usr/bin/env node
// -*- coding: utf-8 -*-
// TODO make all paths and names configurable.
// TODO ensure that after vanilla install/update postinstall with babel-cli dependency is working.
// TODO convert to es2015
'use strict'
// region imports
import * as dom from 'jsdom'
import * as fileSystem from 'fs'
fileSystem.removeDirectoryRecursivelySync = require('rimraf').sync
import * as configuration from './configurator.compiled'
import path from 'path'
const plugins = require('webpack-load-plugins')()
import webpack from 'webpack'
import {RawSource as WebpackRawSource} from 'webpack-sources'
plugins.offline = require('offline-plugin')
// endregion
// region initialisation
/// region configuration pre processing
// NOTE: building context is this hierarchy up:
// "PROJECT/node_modules/webOptimizer"
__dirname = path.resolve(path.join(__dirname, '/../..'))
let index = 0
for (let path of configuration.internalInjects) {
    configuration.internalInjects[index] = configuration.sourceAssetPath + path
    index += 1
}
configuration.plugins = []
for (let htmlOptions of configuration.files.html)
    configuration.plugins.push(new plugins.html(htmlOptions))
// Optimizes and bundles webpack output.
if (configuration.optimizer.uglifyJS)
    configuration.plugins.push(new webpack.optimize.UglifyJsPlugin(
        configuration.optimizer.uglifyJS))
if (configuration.offline)
    configuration.plugins.push(new plugins.offline(configuration.offline))
configuration.plugins.push(new plugins.extractText(
    configuration.files.cascadingStyleSheet))
//// region in-place configured assets in the main html file
if(!process.argv['1'].endsWith('/webpack-dev-server'))
    configuration.plugins.push({apply: (compiler) => {
        compiler.plugin('emit', (compilation, callback) => {
            if (
                configuration.inPlace.cascadingStyleSheet ||
                configuration.inPlace.javaScript
            )
                dom.env(compilation.assets['index.html'].source(), (
                    error, window
                ) => {
                    if (configuration.inPlace.cascadingStyleSheet) {
                        const urlPrefix = configuration.files
                            .cascadingStyleSheet.replace('[contenthash]', '')
                        const domNode = window.document.querySelector(
                            `link[href^="${urlPrefix}"]`)
                        for(var asset in compilation.assets)
                            if(asset.startsWith(urlPrefix))
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
                        const urlPrefix = configuration.files.javaScript.replace(
                            '[hash]', '')
                        const domNode = window.document.querySelector(
                            `script[src^="${urlPrefix}"]`)
                        for(var asset in compilation.assets)
                            if(asset.startsWith(urlPrefix))
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
                    compilation.assets['index.html'] = new WebpackRawSource(
                        compilation.assets['index.html'].source(
                        ).split('\n')[0] + (configuration.debug ? '\n' : '') +
                        window.document.documentElement.outerHTML)
                    callback()
                })
        })
        compiler.plugin('after-emit', (compilation, callback) => {
            if (configuration.inPlace.cascadingStyleSheet)
                fileSystem.removeDirectoryRecursivelySync(path.join(
                    configuration.targetPath, 'cascadingStyleSheet'
                ), {glob: false})
            if (configuration.inPlace.javaScript) {
                const assetFilePath = path.join(
                    configuration.targetPath,
                    configuration.files.javaScript.replace(
                        `?${configuration.hashAlgorithm}=[hash]`, ''))
                for(let filePath of [assetFilePath, `${assetFilePath}.map`])
                    try {
                        fileSystem.unlinkSync(filePath)
                    } catch(error) {}
                if(fileSystem.readdirSync(path.join(
                    configuration.targetPath, 'javaScript'
                )).length === 0)
                    fileSystem.rmdirSync(path.join(
                        configuration.targetPath, 'javaScript'))
            }
            callback()
        })
    }})
//// endregion
/// endregion
/// region loader
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
/// endregion
module.exports = {
    context: __dirname,
    debug: configuration.debug,
    devtool: configuration.developmentTool,
    devserver: configuration.developmentServer,
    // region input
    resolve: {
        root: [configuration.sourceAssetPath],
        extensions: [
            '',
            '.js', '.coffee', 'coffee.md', '.litcoffee',
            '.html', '.jade',
            '.css', '.scss', '.sass', '.less',
            '.png', '.jpg', '.ico', '.gif'
        ],
        alias: {
            jquery: 'jquery/src/jquery',
            angular: 'angular2',
            bootstrap: 'bootstrap/dist/css/bootstrap'
        }
    },
    entry: configuration.externalInjects.concat(configuration.internalInjects),
    // endregion
    // region output
    output: {
        path: configuration.targetPath,
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
                include: `${configuration.sourceAssetPath}less`
            },
            {
                test: /\.sass$/,
                loader: `${loader.cascadingStyleSheet}!` +
                    loader.preprocessor.sass,
                include: `${configuration.sourceAssetPath}sass`
            },
            {
                test: /\.scss$/,
                loader: `${loader.cascadingStyleSheet}!` +
                    loader.preprocessor.scss,
                include: `${configuration.sourceAssetPath}scss`
            },
            // endregion
            // region script
            {
                test: /\.js$/,
                loader: loader.preprocessor.babel,
                include: `${configuration.sourceAssetPath}javaScript`
            },
            {
                test: /\.coffee$/,
                loader: loader.preprocessor.coffee,
                include: `${configuration.sourceAssetPath}coffeeScript`
            },
            {
                test: /\.(coffee\.md|litcoffee)$/,
                loader: loader.preprocessor.literateCoffee,
                include: `${configuration.sourceAssetPath}coffeeScript`
            },
            // endregion
            // region html
            {
                test: /\.jade$/,
                loader: 'file?name=template/[name].html?' +
                    `${configuration.hashAlgorithm}=[hash]!extract!` +
                    `${loader.html}!${loader.preprocessor.jade}`,
                include: `${configuration.sourceAssetPath}template`
            },
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
                include: `${configuration.sourceAssetPath}template`
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
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.eot
            },
            {test: /\.(woff|woff2)$/, loader: loader.postprocessor.font.woff},
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.ttf
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.svg
            },
            // endregion
            // region image
            {test: /\.(png|jpg|ico|gif)$/, loader: loader.postprocessor.image}
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
