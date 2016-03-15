#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'

// region imports
import * as configuration from './configurator.compiled'
import path from 'path'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
const plugins = require('webpack-load-plugins')()
plugins.HTML = plugins.html
// endregion
// region initialisation
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
module.exports = {
    context: __dirname,
    debug: true,
    devtool: configuration.developmentTool,
    devserver: configuration.developmentServer,
    // region input
    resolve: {
        root: [__dirname],
        extensions: configuration.knownExtensions,
        alias: {
            'qunit.js': 'qunitjs/qunit/qunit.js',
            'qunit.css': 'qunitjs/qunit/qunit.css'
        }
    },
    entry: ['qunit.js', 'qunit.css'],
    // endregion
    // region output
    output: {
        path: __dirname,
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
    plugins: [new plugins.HTML({
        debug: true,
        template:
        `html?${global.JSON.stringify({attrs: 'img:src link:href'})}!` +
        `jade-html?${global.JSON.stringify({pretty: true, debug: true})}!` +
        `${__dirname}index.jade`})]
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
