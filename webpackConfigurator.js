#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as fileSystem from 'fs'
import * as dom from 'jsdom'
import path from 'path'
import {sync as removeDirectoryRecursivelySync} from 'rimraf'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import webpack from 'webpack'
const plugins = module.require('webpack-load-plugins')()
plugins.HTML = plugins.html
plugins.ExtractText = plugins.extractText
import {RawSource as WebpackRawSource} from 'webpack-sources'
plugins.Offline = module.require('offline-plugin')

import type {
    ExternalInjection, HTMLConfiguration, InternalInjection,
    NormalizedInternalInjection, ProcedureFunction
} from './type'
import configuration from './configurator.compiled'
import Helper from './helper.compiled'

// / region monkey patches
// Monkey-Patch html loader to retrieve html loader options since the
// "webpack-html-plugin" doesn't preserve the original loader interface.
import htmlLoaderModuleBackup from 'html-loader'
require.cache[require.resolve('html-loader')].exports = function():any {
    Helper.extendObject(true, this.options, module, this.options)
    return htmlLoaderModuleBackup.apply(this, arguments)
}
// Monkey-Patch loader-utils to define which url is a local request.
import loaderUtilsModuleBackup from 'loader-utils'
const loaderUtilsIsUrlRequestBackup:(url:string) => boolean =
    loaderUtilsModuleBackup.isUrlRequest
require.cache[require.resolve('loader-utils')].exports.isUrlRequest = function(
    url:string
):boolean {
    if (url.match(/^[a-z]+:.+/))
        return false
    return loaderUtilsIsUrlRequestBackup.apply(
        loaderUtilsModuleBackup, arguments)
}
// / endregion
// endregion
// region initialisation
// / region pre processing
// // region plugins
const pluginInstances:Array<Object> = []
for (const htmlConfiguration:HTMLConfiguration of configuration.files.html)
    try {
        fileSystem.accessSync(htmlConfiguration.template.substring(
            htmlConfiguration.template.lastIndexOf('!') + 1), fileSystem.F_OK)
        pluginInstances.push(new plugins.HTML(htmlConfiguration))
    } catch (error) {}
// provide an offline manifest
if (configuration.offline) {
    if (!configuration.offline.excludes)
        configuration.offline.excludes = []
    if (configuration.inPlace.cascadingStyleSheet)
        configuration.offline.excludes.push(
            `${configuration.path.asset.cascadingStyleSheet}*.css?` +
            `${configuration.hashAlgorithm}=*`)
    if (configuration.inPlace.javaScript)
        configuration.offline.excludes.push(
            `${configuration.path.asset.javaScript}*.js?` +
            `${configuration.hashAlgorithm}=*`)
    pluginInstances.push(new plugins.Offline(configuration.offline))
}
if ((
    !configuration.library ||
    configuration.givenCommandLineArguments[2] === 'test'
) && configuration.development.openBrowser)
    pluginInstances.push(new plugins.openBrowser(
        configuration.development.openBrowser))
// // endregion
// // region modules/assets
Helper.extendObject(
    configuration.module.aliases, configuration.module.additionalAliases)
const moduleLocations:{[key:string]:Array<string>} =
    Helper.determineModuleLocations(
        configuration.injection.internal, configuration.module.aliases,
        configuration.knownExtensions, configuration.path.context,
        configuration.path.ignore)
let injection:{internal:InternalInjection; external:ExternalInjection}
let fallbackModuleDirectoryPaths:Array<string> = []
if (configuration.givenCommandLineArguments[2] === 'test') {
    fallbackModuleDirectoryPaths = moduleLocations.directoryPaths
    injection = {internal: moduleLocations.filePaths, external: []}
} else {
    pluginInstances.push(new plugins.ExtractText(
        configuration.files.cascadingStyleSheet, {
            allChunks: true, disable: !configuration.files.cascadingStyleSheet}
    ))
    // Optimizes webpack output
    if (configuration.module.optimizer.uglifyJS)
        pluginInstances.push(new webpack.optimize.UglifyJsPlugin(
            configuration.module.optimizer.uglifyJS))
    // // region in-place configured assets in the main html file
    if (!process.argv[1].endsWith('/webpack-dev-server'))
        pluginInstances.push({apply: (compiler:Object) => {
            compiler.plugin('emit', (
                compilation:Object, callback:ProcedureFunction
            ) => {
                if (
                    configuration.inPlace.cascadingStyleSheet ||
                    configuration.inPlace.javaScript
                )
                    dom.env(compilation.assets[configuration.files.html[
                        0
                    ].filename].source(), (error:?Error, window:Object) => {
                        if (configuration.inPlace.cascadingStyleSheet) {
                            const urlPrefix:string = configuration.files
                                .cascadingStyleSheet.replace(
                                    '[contenthash]', '')
                            const domNode:Object =
                                window.document.querySelector(
                                    `link[href^="${urlPrefix}"]`)
                            if (domNode) {
                                let asset:string
                                for (asset in compilation.assets)
                                    if (asset.startsWith(urlPrefix))
                                        break
                                const inPlaceDomNode:Object =
                                    window.document.createElement('style')
                                inPlaceDomNode.textContent =
                                    compilation.assets[asset].source()
                                domNode.parentNode.insertBefore(
                                    inPlaceDomNode, domNode)
                                domNode.parentNode.removeChild(domNode)
                                /*
                                    NOTE: This doesn't prevent webpack from
                                    creating this file if present in another
                                    chunk so removing it (and a potential
                                    source map file) later in the "done" hook.
                                */
                                delete compilation.assets[asset]
                            } else
                                console.warn(
                                    'No referenced cascading style sheet ' +
                                    'file in resulting markup found with ' +
                                    `selector: link[href^="${urlPrefix}"]`)
                        }
                        if (configuration.inPlace.javaScript) {
                            const urlPrefix:string =
                                configuration.files.javaScript.replace(
                                    '[hash]', '')
                            const domNode:Object =
                                window.document.querySelector(
                                    `script[src^="${urlPrefix}"]`)
                            if (domNode) {
                                let asset:string
                                for (asset in compilation.assets)
                                    if (asset.startsWith(urlPrefix))
                                        break
                                domNode.textContent = compilation.assets[
                                    asset
                                ].source()
                                domNode.removeAttribute('src')
                                /*
                                    NOTE: This doesn't prevent webpack from
                                    creating this file if present in another
                                    chunk so removing it (and a potential
                                    source map file) later in the "done" hook.
                                */
                                delete compilation.assets[asset]
                            } else
                                console.warn(
                                    'No referenced javaScript file in ' +
                                    'resulting markup found with selector: ' +
                                    `script[src^="${urlPrefix}"]`)
                        }
                        compilation.assets[configuration.files.html[
                            0
                        ].filename] = new WebpackRawSource(
                            compilation.assets[configuration.files.html[
                                0
                            ].filename].source().replace(
                                /^(\s*<!doctype[^>]+?>\s*)[\s\S]*$/i, '$1'
                            ) + window.document.documentElement.outerHTML)
                        callback()
                    })
                else
                    callback()
            })
            compiler.plugin('after-emit', (
                compilation:Object, callback:ProcedureFunction
            ) => {
                if (configuration.inPlace.cascadingStyleSheet)
                    removeDirectoryRecursivelySync(path.join(
                        configuration.path.asset.target,
                        configuration.path.asset.cascadingStyleSheet
                    ), {glob: false})
                if (configuration.inPlace.javaScript) {
                    const assetFilePath = path.join(
                        configuration.path.asset.target,
                        configuration.files.javaScript.replace(
                            `?${configuration.hashAlgorithm}=[hash]`, ''))
                    for (const filePath:string of [
                        assetFilePath, `${assetFilePath}.map`
                    ])
                        try {
                            fileSystem.unlinkSync(filePath)
                        } catch (error) {}
                    const javaScriptPath:string = path.join(
                        configuration.path.asset.target,
                        configuration.path.asset.javaScript)
                    if (fileSystem.readdirSync(javaScriptPath).length === 0)
                        fileSystem.rmdirSync(javaScriptPath)
                }
                callback()
            })
        }})
    // // endregion
    injection = Helper.resolveInjection(
        configuration.injection, Helper.resolveBuildConfigurationFilePaths(
            configuration.build, configuration.path.asset.source,
            configuration.path.context, configuration.path.ignore
        ), configuration.test.injection.internal, configuration.module.aliases,
        configuration.knownExtensions, configuration.path.context,
        configuration.path.ignore)
    let javaScriptNeeded:boolean = false
    const normalizedInternalInjection:NormalizedInternalInjection =
        Helper.normalizeInternalInjection(injection.internal)
    for (const chunkName:string in normalizedInternalInjection)
        if (normalizedInternalInjection.hasOwnProperty(chunkName))
            for (const moduleID:string of normalizedInternalInjection[
                chunkName
            ]) {
                const type:?string = Helper.determineAssetType(
                    Helper.determineModuleFilePath(moduleID),
                    configuration.build, configuration.path)
                if (type && configuration.build[type] && configuration.build[
                    type
                ].outputExtension === 'js') {
                    javaScriptNeeded = true
                    break
                }
            }
    if (!javaScriptNeeded)
        configuration.files.javaScript = path.join(
            configuration.path.asset.javaScript, '.__dummy__.compiled.js')
    if (!configuration.inPlace.externalLibrary)
        /*
            We only want to process modules from local context in library mode,
            since a concrete project using this library should combine all
            assets (and deduplicate them) for optimal bundling results.
            NOTE: Only native javaScript and json modules will be marked as
            external dependency.
        */
        injection.external = (
            context:string, request:string, callback:ProcedureFunction
        ):?null => {
            const filePath:string = Helper.determineModuleFilePath(
                request.substring(request.lastIndexOf('!') + 1),
                configuration.module.aliases, configuration.knownExtensions,
                context)
            if (filePath.endsWith('.js') || filePath.endsWith('.json')) {
                if (Array.isArray(injection.internal)) {
                    for (const internalModule:string of injection.internal)
                        if (Helper.determineModuleFilePath(
                            internalModule, configuration.module.aliases,
                            configuration.knownExtensions, context
                        ) === filePath)
                            return callback()
                    return callback(null, `umd ${request}`)
                }
                if (injection.internal instanceof Map) {
                    for (const chunkName:string in injection.internal)
                        if (Helper.determineModuleFilePath(
                            injection.internal[chunkName],
                            configuration.module.aliases,
                            configuration.knownExtensions, context
                        ) === filePath)
                            return callback()
                    return callback(null, `umd ${request}`)
                }
                console.log(filePath, configuration.path.ignore)
                if (Helper.isFilePathInLocation(
                    filePath, configuration.path.ignore
                ))
                    return callback(null, `umd ${request}`)
            }
            return callback()
        }
}
// // endregion
// / endregion
// / region loader
let imageLoader:string = 'url?' + JSON.stringify(
    configuration.module.optimizer.image.file)
if (configuration.module.optimizer.image.content)
    imageLoader += '!image?' + JSON.stringify(
        configuration.module.optimizer.image.content)
const loader:{
    preprocessor:{
        less:string;
        sass:string;
        scss:string;
        babel:string;
        coffee:string;
        pug:string;
        literateCoffee:string
    };
    html:string;
    cascadingStyleSheet:string;
    style:string;
    postprocessor:{
        image:string;
        font:{
            eot:string;
            woff:string;
            ttf:string;
            svg:string
        };
        data:string
    }
} = {
    preprocessor: {
        less: `less?${JSON.stringify(configuration.module.preprocessor.less)}`,
        sass: `sass?${JSON.stringify(configuration.module.preprocessor.sass)}`,
        scss: `sass?${JSON.stringify(configuration.module.preprocessor.scss)}`,
        babel: 'babel?' + JSON.stringify(
            configuration.module.preprocessor.modernJavaScript),
        coffee: 'coffee',
        pug: `pug?${JSON.stringify(configuration.module.preprocessor.pug)}`,
        literateCoffee: 'coffee?literate'
    },
    html: `html?${JSON.stringify(configuration.module.html)}`,
    cascadingStyleSheet: 'css?' + JSON.stringify(
        configuration.module.cascadingStyleSheet),
    style: `style?${JSON.stringify(configuration.module.style)}`,
    postprocessor: {
        image: imageLoader,
        font: {
            eot: 'url?' + JSON.stringify(
                configuration.module.optimizer.font.eot),
            woff: 'url?' + JSON.stringify(
                configuration.module.optimizer.font.woff),
            ttf: 'url?' + JSON.stringify(
                configuration.module.optimizer.font.ttf),
            svg: 'url?' + JSON.stringify(
                configuration.module.optimizer.font.svg)
        },
        data: `url?${JSON.stringify(configuration.module.optimizer.data)}`
    }
}
// / endregion
// endregion
// region configuration
export default {
    context: configuration.path.context,
    debug: configuration.debug,
    devtool: configuration.development.tool,
    devserver: configuration.development.server,
    // region input
    resolveLoader: configuration.loader,
    resolve: {
        root: [(configuration.path.asset.source: string)],
        fallback: fallbackModuleDirectoryPaths,
        extensions: configuration.knownExtensions,
        alias: configuration.module.aliases
    },
    entry: injection.internal, externals: injection.external,
    // endregion
    // region output
    output: {
        path: configuration.path.asset.target,
        // publicPath: configuration.path.asset.publicTarget,
        filename: configuration.files.javaScript,
        pathinfo: configuration.debug,
        hashFunction: configuration.hashAlgorithm,
        libraryTarget: 'umd',
        umdNamedDefine: configuration.name,
        library: configuration.name
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
                    configuration.path.asset.javaScript
                )].concat(moduleLocations.directoryPaths),
                exclude: (filePath:string):boolean =>
                    Helper.isFilePathInLocation(
                        filePath, configuration.path.ignore)
            }, {
                test: /\.coffee$/,
                loader: loader.preprocessor.coffee,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript
                )].concat(moduleLocations.directoryPaths)
            }, {
                test: /\.(?:coffee\.md|litcoffee)$/,
                loader: loader.preprocessor.literateCoffee,
                include: [path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.coffeeScript
                )].concat(moduleLocations.directoryPaths)
            },
            // endregion
            // region html (templates)
            {
                test: /\.pug$/,
                loader:
                    `file?name=${configuration.path.asset.template}` +
                    `[name].html?${configuration.hashAlgorithm}=[hash]!` +
                    `extract!${loader.html}!${loader.preprocessor.pug}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.template),
                exclude: configuration.files.html.map((
                    htmlConfiguration:HTMLConfiguration
                ):string => htmlConfiguration.template.substring(
                    htmlConfiguration.template.lastIndexOf('!') + 1))
            }
            // endregion
        ],
        loaders: [
            // Loads dependencies.
            // region style
            {
                test: /\.less$/,
                loader: plugins.extractText.extract(
                    loader.style,
                    `${loader.cascadingStyleSheet}!${loader.preprocessor.less}`
                )
            }, {
                test: /\.sass$/,
                loader: plugins.extractText.extract(
                    loader.style,
                    `${loader.cascadingStyleSheet}!${loader.preprocessor.sass}`
                )
            }, {
                test: /\.scss$/,
                loader: plugins.extractText.extract(
                    loader.style,
                    `${loader.cascadingStyleSheet}!${loader.preprocessor.scss}`
                )
            }, {
                test: /\.css$/,
                loader: plugins.extractText.extract(
                    loader.style, loader.cascadingStyleSheet)
            },
            // endregion
            // region html (templates)
            {
                test: /\.html$/,
                loader:
                    `file?name=${configuration.path.asset.template}` +
                    `[name].[ext]?${configuration.hashAlgorithm}=[hash]!` +
                    `extract!${loader.html}`,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.template),
                exclude: configuration.files.html.map((
                    htmlConfiguration:HTMLConfiguration
                ):string => htmlConfiguration.template.substring(
                    htmlConfiguration.template.lastIndexOf('!') + 1))
            }
            // endregion
        ],
        postLoaders: [
            // Optimize loaded assets.
            // region font
            {
                test: /\.eot(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.eot
            }, {test: /\.woff2?$/, loader: loader.postprocessor.font.woff}, {
                test: /\.ttf(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.ttf
            }, {
                test: /\.svg(?:\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.svg
            },
            // endregion
            // region image
            {
                test: /\.(?:png|jpg|ico|gif)$/,
                loader: loader.postprocessor.image
            },
            // endregion
            // region data
            {
                test: /.+/,
                loader: loader.postprocessor.data,
                include: path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.data),
                exclude: (filePath:string):boolean =>
                    configuration.knownExtensions.indexOf(
                        path.extname(filePath)
                    ) !== -1
            }
            // endregion
        ]
    },
    plugins: pluginInstances,
    // Let the "html-loader" access full html minifier processing
    // configuration.
    html: configuration.module.optimizer.htmlMinifier,
    pug: configuration.module.preprocessor.pug
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
