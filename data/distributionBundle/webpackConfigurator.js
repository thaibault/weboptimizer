#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import Tools from 'clientnode'
import * as dom from 'jsdom'
import * as fileSystem from 'fs'
import path from 'path'
import postcssCSSnext from 'postcss-cssnext'
import postcssFontPath from 'postcss-fontpath'
import postcssImport from 'postcss-import'
import postcssSprites from 'postcss-sprites'
import postcssURL from 'postcss-url'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import util from 'util'
import webpack from 'webpack'
const plugins = require('webpack-load-plugins')()
import {RawSource as WebpackRawSource} from 'webpack-sources'

plugins.HTML = plugins.html
plugins.ExtractText = plugins.extractText
plugins.AddAssetHTMLPlugin = require('add-asset-html-webpack-plugin')
plugins.OpenBrowser = plugins.openBrowser
plugins.Favicon = require('favicons-webpack-plugin')
plugins.Imagemin = require('imagemin-webpack-plugin').default
plugins.Offline = require('offline-plugin')

import type {
    DomNode, HTMLConfiguration, ProcedureFunction, PromiseCallbackFunction,
    WebpackConfiguration, Window
} from './type'
import configuration from './configurator.compiled'
import Helper from './helper.compiled'

// / region monkey patches
// Monkey-Patch html loader to retrieve html loader options since the
// "webpack-html-plugin" doesn't preserve the original loader interface.
import htmlLoaderModuleBackup from 'html-loader'
require.cache[require.resolve('html-loader')].exports = function():any {
    Tools.extendObject(true, this.options, module, this.options)
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
// / region determine library name
let libraryName:string
if ('libraryName' in configuration && configuration.libraryName)
    libraryName = configuration.libraryName
else if (Object.keys(configuration.injection.internal.normalized).length > 1)
    libraryName = '[name]'
else {
    libraryName = configuration.name
    if (configuration.exportFormat.self === 'var')
        libraryName = Tools.stringConvertToValidVariableName(libraryName)
}
// / endregion
// / region plugins
const pluginInstances:Array<Object> = [
    new webpack.optimize.OccurrenceOrderPlugin(true)]
// // region define modules to ignore
for (const ignorePattern:string of configuration.injection.ignorePattern)
    pluginInstances.push(new webpack.IgnorePlugin(new RegExp(ignorePattern)))
// // endregion
// // region generate html file
let htmlAvailable:boolean = false
if (configuration.givenCommandLineArguments[2] !== 'buildDLL')
    for (let htmlConfiguration:HTMLConfiguration of configuration.files.html)
        if (Helper.isFileSync(htmlConfiguration.template.substring(
            htmlConfiguration.template.lastIndexOf('!') + 1
        ))) {
            if (
                htmlConfiguration.template ===
                configuration.files.defaultHTML.template
            )
                htmlConfiguration.template =
                    htmlConfiguration.template.substring(
                        htmlConfiguration.template.lastIndexOf('!') + 1)
            pluginInstances.push(new plugins.HTML(htmlConfiguration))
            htmlAvailable = true
        }
// // endregion
// // region generate favicons
if (htmlAvailable && configuration.favicon && Helper.isFileSync(
    configuration.favicon.logo
))
    pluginInstances.push(new plugins.Favicon(configuration.favicon))
// // endregion
// // region provide offline functionality
if (htmlAvailable && configuration.offline) {
    if (!['serve', 'testInBrowser'].includes(
        configuration.givenCommandLineArguments[2]
    )) {
        if (configuration.inPlace.cascadingStyleSheet)
            configuration.offline.excludes.push(path.relative(
                configuration.path.target.base,
                configuration.path.target.asset.cascadingStyleSheet
            ) + `*.css?${configuration.hashAlgorithm}=*`)
        if (configuration.inPlace.javaScript)
            configuration.offline.excludes.push(path.relative(
                configuration.path.target.base,
                configuration.path.target.asset.javaScript
            ) + `*.js?${configuration.hashAlgorithm}=*`)
    }
    pluginInstances.push(new plugins.Offline(configuration.offline))
}
// // endregion
// // region opens browser automatically
if (configuration.development.openBrowser && (htmlAvailable && [
    'serve', 'testInBrowser'
].includes(configuration.givenCommandLineArguments[2])))
    pluginInstances.push(new plugins.OpenBrowser(
        configuration.development.openBrowser))
// // endregion
// // region provide build environment
if (configuration.buildDefinition)
    pluginInstances.push(new webpack.DefinePlugin(
        configuration.buildDefinition))
if (configuration.module.provide)
    pluginInstances.push(new webpack.ProvidePlugin(
        configuration.module.provide))
// // endregion
// // region modules/assets
// /// region perform javaScript minification/optimisation
if (configuration.module.optimizer.uglifyJS)
    pluginInstances.push(new webpack.optimize.UglifyJsPlugin(
        configuration.module.optimizer.uglifyJS))
// /// endregion
// /// region apply module pattern
pluginInstances.push({apply: (compiler:Object):void => {
    compiler.plugin('emit', (
        compilation:Object, callback:ProcedureFunction
    ):void => {
        for (const request:string in compilation.assets)
            if (compilation.assets.hasOwnProperty(request)) {
                const filePath:string = request.replace(/\?[^?]+$/, '')
                const type:?string = Helper.determineAssetType(
                    filePath, configuration.build, configuration.path)
                if (type && configuration.assetPattern[type] && !(new RegExp(
                    configuration.assetPattern[type]
                        .excludeFilePathRegularExpression
                )).test(filePath)) {
                    const source:?string = compilation.assets[request].source()
                    if (typeof source === 'string')
                        compilation.assets[request] = new WebpackRawSource(
                            configuration.assetPattern[type].pattern.replace(
                                /\{1\}/g, source.replace(/\$/g, '$$$')))
                }
            }
        callback()
    })
}})
// /// endregion
// /// region in-place configured assets in the main html file
if (htmlAvailable && !['serve', 'testInBrowser'].includes(
    configuration.givenCommandLineArguments[2]
))
    pluginInstances.push({apply: (compiler:Object):void => {
        compiler.plugin('emit', (
            compilation:Object, callback:ProcedureFunction
        ):void => {
            if (configuration.files.html[0].filename in compilation.assets && (
                configuration.inPlace.cascadingStyleSheet ||
                configuration.inPlace.javaScript
            ))
                dom.env(compilation.assets[configuration.files.html[
                    0
                ].filename].source(), (error:?Error, window:Object):void => {
                    if (configuration.inPlace.cascadingStyleSheet) {
                        const urlPrefix:string = path.relative(
                            configuration.path.target.base,
                            configuration.files.compose.cascadingStyleSheet
                                .replace('[contenthash]', ''))
                        const domNode:DomNode = window.document.querySelector(
                            `link[href^="${urlPrefix}"]`)
                        if (domNode) {
                            let asset:string
                            for (asset in compilation.assets)
                                if (asset.startsWith(urlPrefix))
                                    break
                            const inPlaceDomNode:DomNode =
                                window.document.createElement('style')
                            inPlaceDomNode.textContent =
                                compilation.assets[asset].source()
                            domNode.parentNode.insertBefore(
                                inPlaceDomNode, domNode)
                            domNode.parentNode.removeChild(domNode)
                            /*
                                NOTE: This doesn't prevent webpack from
                                creating this file if present in another chunk
                                so removing it (and a potential source map
                                file) later in the "done" hook.
                            */
                            delete compilation.assets[asset]
                        } else
                            console.warn(
                                'No referenced cascading style sheet file in' +
                                ' resulting markup found with ' +
                                `selector: link[href^="${urlPrefix}"]`)
                    }
                    if (configuration.inPlace.javaScript) {
                        const urlPrefix:string = path.relative(
                            configuration.path.target.base,
                            configuration.files.compose.javaScript.replace(
                                '[hash]', ''))
                        const domNode:DomNode = window.document.querySelector(
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
                                creating this file if present in another chunk
                                so removing it (and a potential source map
                                file) later in the "done" hook.
                            */
                            delete compilation.assets[asset]
                        } else
                            console.warn(
                                'No referenced javaScript file in resulting ' +
                                'markup found with selector: ' +
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
        ):void => {
            if (configuration.files.html[0].filename in compilation.assets) {
                if (configuration.inPlace.cascadingStyleSheet) {
                    const assetFilePath = Helper.stripLoader(
                        configuration.files.compose.cascadingStyleSheet)
                    if (Helper.isFileSync(assetFilePath))
                        fileSystem.unlinkSync(assetFilePath)
                }
                if (configuration.inPlace.javaScript) {
                    const assetFilePathTemplate = Helper.stripLoader(
                        configuration.files.compose.javaScript)
                    for (
                        const chunkName:string in
                        configuration.injection.internal.normalized
                    )
                        if (configuration.injection.internal.normalized
                        .hasOwnProperty(chunkName)) {
                            const assetFilePath:string =
                            Helper.renderFilePathTemplate(
                                assetFilePathTemplate, {'[name]': chunkName})
                            if (Helper.isFileSync(assetFilePath))
                                fileSystem.unlinkSync(assetFilePath)
                        }
                }
                for (const type:string of [
                    'javaScript', 'cascadingStyleSheet'
                ])
                    if (fileSystem.readdirSync(
                        configuration.path.target.asset[type]
                    ).length === 0)
                        fileSystem.rmdirSync(
                            configuration.path.target.asset[type])
            }
            callback()
        })
    }})
// /// endregion
// /// region remove chunks if a corresponding dll package exists
if (configuration.givenCommandLineArguments[2] !== 'buildDLL')
    for (const chunkName:string in configuration.injection.internal.normalized)
        if (configuration.injection.internal.normalized.hasOwnProperty(
            chunkName
        )) {
            const manifestFilePath:string =
                `${configuration.path.target.base}/${chunkName}.` +
                `dll-manifest.json`
            if (configuration.dllManifestFilePaths.includes(
                manifestFilePath
            )) {
                delete configuration.injection.internal.normalized[chunkName]
                const filePath:string = Helper.renderFilePathTemplate(
                    Helper.stripLoader(
                        configuration.files.compose.javaScript
                    ), {'[name]': chunkName})
                pluginInstances.push(new plugins.AddAssetHTMLPlugin({
                    filepath: filePath,
                    hash: true,
                    includeSourcemap: Helper.isFileSync(`${filePath}.map`)
                }))
                pluginInstances.push(new webpack.DllReferencePlugin({
                    context: configuration.path.context, manifest: require(
                        manifestFilePath)}))
            }
        }
// /// endregion
// /// region generate common chunks
if (configuration.givenCommandLineArguments[2] !== 'buildDLL')
    for (const chunkName:string of configuration.injection.commonChunkIDs)
        if (configuration.injection.internal.normalized.hasOwnProperty(
            chunkName
        ))
            pluginInstances.push(new webpack.optimize.CommonsChunkPlugin({
                async: false,
                children: false,
                filename: path.relative(
                    configuration.path.target.base,
                    configuration.files.compose.javaScript),
                minChunks: Infinity,
                name: chunkName,
                minSize: 0
            }))
// /// endregion
// /// region mark empty javaScript modules as dummy
if (!configuration.needed.javaScript)
    configuration.files.compose.javaScript = path.resolve(
        configuration.path.target.asset.javaScript, '.__dummy__.compiled.js')
// /// endregion
// /// region extract cascading style sheets
pluginInstances.push(new plugins.ExtractText(
    configuration.files.compose.cascadingStyleSheet ? path.relative(
        configuration.path.target.base,
        configuration.files.compose.cascadingStyleSheet
    ) : configuration.path.target.base, {allChunks: true, disable:
        !configuration.files.compose.cascadingStyleSheet}))
// /// endregion
// /// region performs implicit external logic
if (configuration.injection.external === '__implicit__')
    /*
        We only want to process modules from local context in library mode,
        since a concrete project using this library should combine all assets
        (and deduplicate them) for optimal bundling results. NOTE: Only native
        javaScript and json modules will be marked as external dependency.
    */
    configuration.injection.external = (
        context:string, request:string, callback:ProcedureFunction
    ):void => {
        request = request.replace(/^!+/, '')
        if (request.startsWith('/'))
            request = path.relative(configuration.path.context, request)
        for (const filePath:string of configuration.module.directories.concat(
            configuration.loader.directories
        ))
            if (request.startsWith(filePath)) {
                request = request.substring(filePath.length)
                if (request.startsWith('/'))
                    request = request.substring(1)
                break
            }
        let resolvedRequest:?string = Helper.determineExternalRequest(
            request, configuration.path.context, context,
            configuration.injection.internal.normalized,
            configuration.path.ignore.concat(
                configuration.module.directories,
                configuration.loader.directories
            ).map((filePath:string):string => path.resolve(
                configuration.path.context, filePath
            )).filter((filePath:string):boolean =>
                !configuration.path.context.startsWith(filePath)
            ), configuration.module.aliases, configuration.knownExtensions,
            configuration.path.source.asset.base, configuration.path.ignore,
            configuration.injection.implicitExternalIncludePattern,
            configuration.injection.implicitExternalExcludePattern,
            configuration.inPlace.externalLibrary.normal,
            configuration.inPlace.externalLibrary.dynamic)
        if (resolvedRequest) {
            if (['var', 'umd'].includes(
                configuration.exportFormat.external
            ) && request in configuration.injection.externalAliases)
                resolvedRequest = configuration.injection.externalAliases[
                    request]
            if (configuration.exportFormat.external === 'var')
                resolvedRequest = Tools.stringConvertToValidVariableName(
                    resolvedRequest, '0-9a-zA-Z_$\\.')
            return callback(
                null, resolvedRequest, configuration.exportFormat.external)
        }
        return callback()
    }
// /// endregion
// /// region build dll packages
if (configuration.givenCommandLineArguments[2] === 'buildDLL') {
    let dllChunkIDExists:boolean = false
    for (const chunkName:string in configuration.injection.internal.normalized)
        if (configuration.injection.internal.normalized.hasOwnProperty(
            chunkName
        ))
            if (configuration.injection.dllChunkIDs.includes(chunkName))
                dllChunkIDExists = true
            else
                delete configuration.injection.internal.normalized[chunkName]
    if (dllChunkIDExists) {
        libraryName = '[name]DLLPackage'
        pluginInstances.push(new webpack.DllPlugin({
            path: `${configuration.path.target.base}/[name].dll-manifest.json`,
            name: libraryName
        }))
    } else
        console.warn('No dll chunk id found.')
}
// /// endregion
// // endregion
// // region apply final dom/javaScript modifications/fixes
pluginInstances.push({apply: (compiler:Object):void => {
    compiler.plugin('emit', (
        compilation:Object, callback:ProcedureFunction
    ):void => {
        const promises:Array<Promise<string>> = []
        /*
            NOTE: Removing symbols after a "&" in hash string is necessary to
            match the generated request strings in offline plugin.
        */
        for (const htmlConfiguration of configuration.files.html)
            if (htmlConfiguration.filename in compilation.assets)
                promises.push(new Promise((
                    resolve:PromiseCallbackFunction,
                    reject:PromiseCallbackFunction
                ):Window => dom.env(compilation.assets[
                    htmlConfiguration.filename
                ].source(), (error:?Error, window:Window):?Promise<string> => {
                    if (error)
                        return reject(error)
                    const linkables:{[key:string]:string} = {
                        script: 'src', link: 'href'}
                    for (const tagName:string in linkables)
                        if (linkables.hasOwnProperty(tagName))
                            for (
                                const domNode:DomNode of
                                window.document.querySelectorAll(
                                    `${tagName}[${linkables[tagName]}*="?` +
                                    `${configuration.hashAlgorithm}="]`)
                            )
                                domNode.setAttribute(
                                    linkables[tagName],
                                    domNode.getAttribute(
                                        linkables[tagName]
                                    ).replace(new RegExp(
                                        `(\\?${configuration.hashAlgorithm}=` +
                                        '[^&]+).*$'
                                    ), '$1'))
                    compilation.assets[htmlConfiguration.filename] =
                        new WebpackRawSource(compilation.assets[
                            htmlConfiguration.filename
                        ].source().replace(
                            /^(\s*<!doctype[^>]+?>\s*)[\s\S]*$/i, '$1'
                        ) + window.document.documentElement.outerHTML)
                    return resolve(
                        compilation.assets[htmlConfiguration.filename])
                })))
        if (!configuration.exportFormat.external.startsWith('umd')) {
            Promise.all(promises).then(():void => callback())
            return
        }
        const bundleName:string = (
            typeof libraryName === 'string'
        ) ? libraryName : libraryName[0]
        /*
            NOTE: The umd module export doesn't handle cases where the package
            name doesn't match exported library name. This post processing
            fixes this issue.
        */
        for (const assetRequest:string in compilation.assets)
            if (assetRequest.replace(/([^?]+)\?.*$/, '$1').endsWith(
                configuration.build.javaScript.outputExtension
            )) {
                let source:string = compilation.assets[assetRequest].source()
                if (typeof source === 'string') {
                    for (
                        const replacement:string in
                        configuration.injection.externalAliases
                    )
                        if (configuration.injection.externalAliases
                            .hasOwnProperty(replacement)
                        )
                            source = source.replace(new RegExp(
                                '(require\\()"' +
                                Tools.stringConvertToValidRegularExpression(
                                    configuration.injection.externalAliases[
                                        replacement]
                                ) + '"(\\))', 'g'
                            ), `$1'${replacement}'$2`).replace(new RegExp(
                                '(define\\("' +
                                Tools.stringConvertToValidRegularExpression(
                                    bundleName
                                ) + '", \\[.*)"' +
                                Tools.stringConvertToValidRegularExpression(
                                    configuration.injection.externalAliases[
                                        replacement]
                                ) + '"(.*\\], factory\\);)'
                            ), `$1'${replacement}'$2`)
                    source = source.replace(new RegExp(
                        '(root\\[)"' +
                        Tools.stringConvertToValidRegularExpression(
                            bundleName
                        ) + '"(\\] = )'
                    ), "$1'" +
                        Tools.stringConvertToValidVariableName(bundleName) +
                        "'$2"
                    )
                    compilation.assets[assetRequest] = new WebpackRawSource(
                        source)
                }
            }
        Promise.all(promises).then(():void => callback())
    })
}})
// // endregion
// // region add automatic image compression
// NOTE: This plugin should be loaded at last to ensure that all emitted images
// ran through.
pluginInstances.push(new plugins.Imagemin(
    configuration.module.optimizer.image.content))
// // endregion
// / endregion
// / region loader
let imageLoader:string = 'url?' + Tools.convertCircularObjectToJSON(
    configuration.module.optimizer.image.file)
const loader:{
    preprocessor:{
        cascadingStyleSheet:string;
        javaScript:string;
        pug:string;
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
        cascadingStyleSheet: 'postcss' +
            configuration.module.preprocessor.cascadingStyleSheet,
        javaScript: 'babel?' + Tools.convertCircularObjectToJSON(
            configuration.module.preprocessor.babel),
        pug: 'pug?' + Tools.convertCircularObjectToJSON(
            configuration.module.preprocessor.pug)
    },
    html: 'html?' + Tools.convertCircularObjectToJSON(
        configuration.module.html),
    cascadingStyleSheet: `css${configuration.module.cascadingStyleSheet}`,
    style: 'style?' + Tools.convertCircularObjectToJSON(
        configuration.module.style),
    postprocessor: {
        image: imageLoader,
        font: {
            eot: 'url?' + Tools.convertCircularObjectToJSON(
                configuration.module.optimizer.font.eot),
            woff: 'url?' + Tools.convertCircularObjectToJSON(
                configuration.module.optimizer.font.woff),
            ttf: 'url?' + Tools.convertCircularObjectToJSON(
                configuration.module.optimizer.font.ttf),
            svg: 'url?' + Tools.convertCircularObjectToJSON(
                configuration.module.optimizer.font.svg)
        },
        data: 'url?' + Tools.convertCircularObjectToJSON(
            configuration.module.optimizer.data)
    }
}
// / endregion
// endregion
// region configuration
const webpackConfiguration:WebpackConfiguration = {
    context: configuration.path.context,
    debug: configuration.debug,
    devtool: configuration.development.tool,
    devServer: configuration.development.server,
    // region input
    entry: configuration.injection.internal.normalized,
    externals: configuration.injection.external,
    resolveLoader: {
        alias: configuration.loader.aliases,
        extensions: configuration.loader.extensions,
        modulesDirectories: configuration.loader.directories
    },
    resolve: {
        alias: configuration.module.aliases,
        extensions: configuration.knownExtensions,
        root: [(configuration.path.source.asset.base:string)],
        modulesDirectories: configuration.module.directories
    },
    // endregion
    // region output
    output: {
        filename: path.relative(
            configuration.path.target.base,
            configuration.files.compose.javaScript),
        hashFunction: configuration.hashAlgorithm,
        library: libraryName,
        libraryTarget: (
            configuration.givenCommandLineArguments[2] === 'buildDLL'
        ) ? 'var' : configuration.exportFormat.self,
        path: configuration.path.target.base,
        publicPath: configuration.path.target.public,
        pathinfo: configuration.debug,
        umdNamedDefine: true
    },
    target: configuration.targetTechnology,
    // endregion
    module: {
        noParse: configuration.module.skipParseRegularExpression,
        preLoaders: [
            // Convert to native web types.
            // region script
            {
                test: /\.js(?:\?.*)?$/,
                loader: loader.preprocessor.javaScript,
                include: Helper.normalizePaths([
                    configuration.path.source.asset.javaScript].concat(
                        configuration.module.locations.directoryPaths)),
                exclude: (filePath:string):boolean => {
                    filePath = Helper.stripLoader(filePath)
                    return Helper.isFilePathInLocation(
                        filePath, configuration.path.ignore.concat(
                            configuration.module.directories,
                            configuration.loader.directories
                        ).map((filePath:string):string => path.resolve(
                            configuration.path.context, filePath)
                        ).filter((filePath:string):boolean =>
                            !configuration.path.context.startsWith(filePath)))
                }
            },
            // endregion
            // region html (templates)
            // NOTE: This is only for the main entry template.
            {
                test: new RegExp(
                    '^' + Tools.stringConvertToValidRegularExpression(
                        Helper.stripLoader(
                            configuration.files.defaultHTML.template)
                    ) + '(?:\\?.*)?$'),
                loader: configuration.files.defaultHTML.template.substring(
                    0, configuration.files.defaultHTML.template.lastIndexOf(
                        '!'))
            },
            {
                test: /\.pug(?:\?.*)?$/,
                loader:
                    'file?name=' + path.relative(
                        configuration.path.target.asset.base,
                        configuration.path.target.asset.template
                    ) + `[name].html?${configuration.hashAlgorithm}=[hash]!` +
                    `extract!${loader.html}!${loader.preprocessor.pug}`,
                include: configuration.path.source.asset.template,
                exclude: Helper.normalizePaths(configuration.files.html.concat(
                    configuration.files.defaultHTML
                ).map((htmlConfiguration:HTMLConfiguration):string =>
                    Helper.stripLoader(htmlConfiguration.template)))
            }
            // endregion
        ],
        loaders: [
            // Loads dependencies.
            // region style
            {
                test: /\.css(?:\?.*)?$/,
                loader: plugins.ExtractText.extract(
                    loader.style,
                    `${loader.cascadingStyleSheet}!` +
                    loader.preprocessor.cascadingStyleSheet),
                include: Helper.normalizePaths([
                    configuration.path.source.asset.cascadingStyleSheet
                ].concat(configuration.module.locations.directoryPaths)),
                exclude: (filePath:string):boolean => {
                    filePath = Helper.stripLoader(filePath)
                    return Helper.isFilePathInLocation(
                        filePath, configuration.path.ignore.concat(
                            configuration.module.directories,
                            configuration.loader.directories
                        ).map((filePath:string):string => path.resolve(
                            configuration.path.context, filePath
                        )).filter((filePath:string):boolean =>
                            !configuration.path.context.startsWith(filePath)))
                }
            },
            // endregion
            // region html (templates)
            {
                test: /\.html(?:\?.*)?$/,
                loader:
                    'file?name=' + path.relative(
                        configuration.path.target.base,
                        configuration.path.target.asset.template
                    ) + `[name].[ext]?${configuration.hashAlgorithm}=[hash]!` +
                    `extract!${loader.html}`,
                include: configuration.path.source.asset.template,
                exclude: Helper.normalizePaths(configuration.files.html.map((
                    htmlConfiguration:HTMLConfiguration
                ):string => Helper.stripLoader(htmlConfiguration.template)))
            }
            // endregion
        ],
        postLoaders: [
            // Optimize loaded assets.
            // region font
            {
                test: /\.eot(?:\?.*)?$/,
                loader: loader.postprocessor.font.eot
            }, {
                test: /\.woff2?(?:\?.*)?$/,
                loader: loader.postprocessor.font.woff
            }, {
                test: /\.ttf(?:\?.*)?$/,
                loader: loader.postprocessor.font.ttf
            }, {
                test: /\.svg(?:\?.*)?$/,
                loader: loader.postprocessor.font.svg
            },
            // endregion
            // region image
            {
                test: /\.(?:png|jpg|ico|gif)(?:\?.*)?$/,
                loader: loader.postprocessor.image
            },
            // endregion
            // region data
            {
                test: /.+/,
                loader: loader.postprocessor.data,
                include: configuration.path.source.asset.data,
                exclude: (filePath:string):boolean =>
                    configuration.knownExtensions.includes(path.extname(
                        Helper.stripLoader(filePath)))
            }
            // endregion
        ]
    },
    postcss: ():Array<Object> => [
        postcssImport({
            addDependencyTo: webpack,
            root: configuration.path.context
        }),
        /*
            NOTE: Checking path doesn't work if fonts are referenced in
            libraries provided in another location than the project itself like
            the node_modules folder.
        */
        postcssCSSnext({browsers: '> 0%'}),
        postcssFontPath({checkPath: false}),
        postcssURL({filter: '', maxSize: 0}),
        postcssSprites({
            filterBy: ():Promise<null> => new Promise((
                resolve:Function, reject:Function
            ):Promise<null> => (
                configuration.files.compose.image ? resolve : reject
            )()),
            hooks: {onSaveSpritesheet: (image:Object):string => path.join(
                image.spritePath, path.relative(
                    configuration.path.target.asset.image,
                    configuration.files.compose.image))},
            stylesheetPath:
                configuration.path.source.asset.cascadingStyleSheet,
            spritePath: configuration.path.source.asset.image
        })
    ],
    html: configuration.module.optimizer.htmlMinifier,
    // Let the "html-loader" access full html minifier processing
    // configuration.
    pug: configuration.module.preprocessor.pug,
    plugins: pluginInstances
}
if (configuration.debug)
    console.log('Using webpack configuration:', util.inspect(
        webpackConfiguration, {depth: null}))
// endregion
export default webpackConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
