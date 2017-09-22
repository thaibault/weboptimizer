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
import BabelMinifyPlugin from 'babili-webpack-plugin'
import Tools from 'clientnode'
/* eslint-disable no-unused-vars */
import type {DomNode, PlainObject, ProcedureFunction, Window} from 'clientnode'
/* eslint-enable no-unused-vars */
import {JSDOM as DOM} from 'jsdom'
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

import ejsLoader from './ejsLoader.compiled'
import type {HTMLConfiguration, WebpackConfiguration} from './type'
import configuration from './configurator.compiled'
import Helper from './helper.compiled'

// / region monkey patches
// Monkey-Patch html loader to retrieve html loader options since the
// "webpack-html-plugin" doesn't preserve the original loader interface.
import htmlLoaderModuleBackup from 'html-loader'
require.cache[require.resolve('html-loader')].exports = function(
    ...parameter:Array<any>
):any {
    Tools.extendObject(true, this.options, module, this.options)
    return htmlLoaderModuleBackup.call(this, ...parameter)
}
// Monkey-Patch loader-utils to define which url is a local request.
import loaderUtilsModuleBackup from 'loader-utils'
const loaderUtilsIsUrlRequestBackup:(url:string) => boolean =
    loaderUtilsModuleBackup.isUrlRequest
require.cache[require.resolve('loader-utils')].exports.isUrlRequest = (
    url:string, ...additionalParameter:Array<any>
):boolean => {
    if (url.match(/^[a-z]+:.+/))
        return false
    return loaderUtilsIsUrlRequestBackup.apply(
        loaderUtilsModuleBackup, [url].concat(additionalParameter))
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
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(true)
]
if (configuration.debug)
    pluginInstances.push(new webpack.NamedModulesPlugin())
// // region define modules to ignore
for (const ignorePattern:string of configuration.injection.ignorePattern)
    pluginInstances.push(new webpack.IgnorePlugin(new RegExp(ignorePattern)))
// // endregion
// // region define modules to replace
for (const source:string in configuration.module.replacements.normal)
    if (configuration.module.replacements.normal.hasOwnProperty(source))
        pluginInstances.push(new webpack.NormalModuleReplacementPlugin(
            new RegExp(source),
            configuration.module.replacements.normal[source]))
// // endregion
// // region generate html file
let htmlAvailable:boolean = false
if (configuration.givenCommandLineArguments[2] !== 'build:dll')
    for (let htmlConfiguration:HTMLConfiguration of configuration.files.html)
        if (Tools.isFileSync(htmlConfiguration.template.filePath)) {
            pluginInstances.push(new plugins.HTML(Tools.extendObject(
                {}, htmlConfiguration, {
                    template: htmlConfiguration.template.request})))
            htmlAvailable = true
        }
// // endregion
// // region generate favicons
if (htmlAvailable && configuration.favicon && Tools.isFileSync(
    configuration.favicon.logo
))
    pluginInstances.push(new plugins.Favicon(configuration.favicon))
// // endregion
// // region provide offline functionality
if (htmlAvailable && configuration.offline) {
    if (!['serve', 'test:browser'].includes(
        configuration.givenCommandLineArguments[2]
    ))
        for (const type:PlainObject of [
            ['cascadingStyleSheet', 'css'],
            ['javaScript', 'js']
        ])
            if (configuration.inPlace[type[0]]) {
                const matches:Array<string> = Object.keys(
                    configuration.inPlace[type[0]])
                for (const name:string of matches)
                    configuration.offline.excludes.push(path.relative(
                        configuration.path.target.base,
                        configuration.path.target.asset[type[0]]
                    ) + `${name}.${type[1]}?${configuration.hashAlgorithm}=*`)
            }
    pluginInstances.push(new plugins.Offline(configuration.offline))
}
// // endregion
// // region opens browser automatically
if (configuration.development.openBrowser && (htmlAvailable && [
    'serve', 'test:browser'
].includes(configuration.givenCommandLineArguments[2])))
    pluginInstances.push(new plugins.OpenBrowser(
        configuration.development.openBrowser))
// // endregion
// // region provide build environment
if (configuration.build.definitions)
    pluginInstances.push(new webpack.DefinePlugin(
        configuration.build.definitions))
if (configuration.module.provide)
    pluginInstances.push(new webpack.ProvidePlugin(
        configuration.module.provide))
// // endregion
// // region modules/assets
// /// region perform javaScript minification/optimisation
if (configuration.module.optimizer.babelMinify)
    pluginInstances.push(new BabelMinifyPlugin(
        configuration.module.optimizer.babelMinify))
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
                    filePath, configuration.build.types, configuration.path)
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
if (htmlAvailable && !['serve', 'test:browser'].includes(
    configuration.givenCommandLineArguments[2]
))
    pluginInstances.push({apply: (compiler:Object):void => {
        const filePathsToRemove:Array<string> = []
        compiler.plugin('compilation', (compilation:Object):void =>
            compilation.plugin(
                'html-webpack-plugin-after-html-processing', async (
                    htmlPluginData:PlainObject, callback:ProcedureFunction
                ):Promise<void> => {
                    if (
                        configuration.inPlace.cascadingStyleSheet &&
                        Object.keys(
                            configuration.inPlace.cascadingStyleSheet
                        ).length || configuration.inPlace.javaScript &&
                        Object.keys(configuration.inPlace.javaScript).length
                    )
                        try {
                            const result:{
                                content:string, filePathsToRemove:Array<string>
                            } = await
                                Helper.inPlaceCSSAndJavaScriptAssetReferences(
                                    htmlPluginData.html,
                                    configuration.inPlace.cascadingStyleSheet,
                                    configuration.inPlace.javaScript,
                                    configuration.path.target.base,
                                    configuration.files.compose
                                        .cascadingStyleSheet,
                                    configuration.files.compose.javaScript,
                                    compilation.assets)
                            htmlPluginData.html = result.content
                            filePathsToRemove.concat(result.filePathsToRemove)
                        } catch (error) {
                            return callback(error, htmlPluginData)
                        }
                    callback(null, htmlPluginData)
                }))
        compiler.plugin('after-emit', async (
            compilation:Object, callback:ProcedureFunction
        ):Promise<void> => {
            let promises:Array<Promise<void>> = []
            for (const path:string of filePathsToRemove)
                if (await Tools.isFile(path))
                    promises.push(new Promise((resolve:Function):void =>
                        fileSystem.unlink(path, (error:?Error):void => {
                            if (error)
                                console.error(error)
                            resolve()
                        })))
            await Promise.all(promises)
            promises = []
            for (const type:string of [
                'javaScript', 'cascadingStyleSheet'
            ])
                promises.push(new Promise((
                    resolve:Function, reject:Function
                /*
                    NOTE: Workaround since flow misses the three parameter
                    "readdir" signature.
                */
                ):void => (fileSystem.readdir:Function)(
                    configuration.path.target.asset[type],
                    configuration.encoding,
                    (error:?Error, files:Array<string>):void => {
                        if (error) {
                            reject(error)
                            return
                        }
                        if (files.length === 0)
                            fileSystem.rmdir(
                                configuration.path.target.asset[type], (
                                    error:?Error
                                ):void => error ? reject(error) : resolve())
                        else
                            resolve()
                    })))
            await Promise.all(promises)
            callback()
        })
    }})
// /// endregion
// /// region remove chunks if a corresponding dll package exists
if (configuration.givenCommandLineArguments[2] !== 'build:dll')
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
                    includeSourcemap: Tools.isFileSync(`${filePath}.map`)
                }))
                pluginInstances.push(new webpack.DllReferencePlugin({
                    context: configuration.path.context, manifest: require(
                        manifestFilePath)}))
            }
        }
// /// endregion
// /// region generate common chunks
if (configuration.givenCommandLineArguments[2] !== 'build:dll')
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
if (configuration.files.compose.cascadingStyleSheet)
    pluginInstances.push(new plugins.ExtractText({
        allChunks: true, filename: path.relative(
            configuration.path.target.base,
            configuration.files.compose.cascadingStyleSheet)
    }))
// /// endregion
// /// region performs implicit external logic
if (configuration.injection.external.modules === '__implicit__')
    /*
        We only want to process modules from local context in library mode,
        since a concrete project using this library should combine all assets
        (and deduplicate them) for optimal bundling results. NOTE: Only native
        javaScript and json modules will be marked as external dependency.
    */
    configuration.injection.external.modules = (
        context:string, request:string, callback:ProcedureFunction
    ):void => {
        request = request.replace(/^!+/, '')
        if (request.startsWith('/'))
            request = path.relative(configuration.path.context, request)
        for (
            const filePath:string of
            configuration.module.directoryNames.concat(
                configuration.loader.directoryNames)
        )
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
                configuration.module.directoryNames,
                configuration.loader.directoryNames
            ).map((filePath:string):string => path.resolve(
                configuration.path.context, filePath
            )).filter((filePath:string):boolean =>
                !configuration.path.context.startsWith(filePath)
            ), configuration.module.aliases,
            configuration.module.replacements.normal, configuration.extensions,
            configuration.path.source.asset.base, configuration.path.ignore,
            configuration.module.directoryNames,
            configuration.package.main.fileNames,
            configuration.package.main.propertyNames,
            configuration.package.aliasPropertyNames,
            configuration.injection.external.implicit.pattern.include,
            configuration.injection.external.implicit.pattern.exclude,
            configuration.inPlace.externalLibrary.normal,
            configuration.inPlace.externalLibrary.dynamic,
            configuration.encoding)
        if (resolvedRequest) {
            if (['var', 'umd'].includes(
                configuration.exportFormat.external
            ) && request in configuration.injection.external.aliases)
                resolvedRequest = configuration.injection.external.aliases[
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
if (configuration.givenCommandLineArguments[2] === 'build:dll') {
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
pluginInstances.push({apply: (compiler:Object):void => compiler.plugin(
    'compilation', (compilation:Object):void => {
        compilation.plugin('html-webpack-plugin-alter-asset-tags', (
            htmlPluginData:PlainObject, callback:ProcedureFunction
        ):void => {
            for (const tags:Array<PlainObject> of [
                htmlPluginData.body, htmlPluginData.head
            ]) {
                let index:number = 0
                for (const tag:PlainObject of tags) {
                    if (/^\.__dummy__(\..*)?$/.test(path.basename(
                        tag.attributes.src || tag.attributes.href || ''
                    )))
                        tags.splice(index, 1)
                    index += 1
                }
            }
            const assets:Array<string> = JSON.parse(
                htmlPluginData.plugin.assetJson)
            let index:number = 0
            for (const assetRequest:string of assets) {
                if (/^\.__dummy__(\..*)?$/.test(path.basename(assetRequest)))
                    assets.splice(index, 1)
                index += 1
            }
            htmlPluginData.plugin.assetJson = JSON.stringify(assets)
            callback(null, htmlPluginData)
        })
        compilation.plugin('html-webpack-plugin-after-html-processing', (
            htmlPluginData:PlainObject, callback:ProcedureFunction
        ):Window => {
            let window:Window
            try {
                window = (new DOM(htmlPluginData.html.replace(
                    /<%/g, '##+#+#+##'
                ).replace(/%>/g, '##-#-#-##'))).window
            } catch (error) {
                return callback(error, htmlPluginData)
            }
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
                        /*
                            NOTE: Removing symbols after a "&" in hash string
                            is necessary to match the generated request strings
                            in offline plugin.
                        */
                        domNode.setAttribute(
                            linkables[tagName],
                            domNode.getAttribute(
                                linkables[tagName]
                            ).replace(new RegExp(
                                `(\\?${configuration.hashAlgorithm}=` +
                                '[^&]+).*$'
                            ), '$1'))
            htmlPluginData.html = htmlPluginData.html.replace(
                /^(\s*<!doctype [^>]+?>\s*)[\s\S]*$/i, '$1'
            ) + window.document.documentElement.outerHTML.replace(
                    /##\+#\+#\+##/g, '<%'
                ).replace(/##-#-#-##/g, '%>')
            //  region post compilation
            for (
                const htmlFileSpecification:PlainObject of
                configuration.files.html
            )
                if (
                    htmlFileSpecification.filename ===
                    htmlPluginData.plugin.options.filename
                ) {
                    for (
                        const loaderConfiguration:PlainObject of
                        htmlFileSpecification.template.use
                    )
                        if (
                            loaderConfiguration.hasOwnProperty('options') &&
                            loaderConfiguration.options.hasOwnProperty(
                                'compileSteps'
                            ) &&
                            typeof loaderConfiguration.options.compileSteps
                                === 'number'
                        )
                            htmlPluginData.html = ejsLoader.bind(
                                Tools.extendObject(true, {}, {
                                    options: loaderConfiguration.options
                                }, {options: {
                                    compileSteps: htmlFileSpecification
                                        .template.postCompileSteps
                                }}))(htmlPluginData.html)
                    break
                }
            // endregion
            callback(null, htmlPluginData)
        })
    })})
/*
    NOTE: The umd module export doesn't handle cases where the package name
    doesn't match exported library name. This post processing fixes this issue.
*/
if (configuration.exportFormat.external.startsWith('umd'))
    pluginInstances.push({apply: (compiler:Object):void => compiler.plugin(
        'emit', (compilation:Object, callback:ProcedureFunction):void => {
            const bundleName:string = (
                typeof libraryName === 'string'
            ) ? libraryName : libraryName[0]
            for (const assetRequest:string in compilation.assets)
                if (
                    compilation.assets.hasOwnProperty(assetRequest) &&
                    assetRequest.replace(/([^?]+)\?.*$/, '$1').endsWith(
                        configuration.build.types.javaScript.outputExtension
                    )
                ) {
                    let source:string =
                        compilation.assets[assetRequest].source()
                    if (typeof source === 'string') {
                        for (
                            const replacement:string in
                            configuration.injection.external.aliases
                        )
                            if (configuration.injection.external.aliases
                                .hasOwnProperty(replacement)
                            )
                                source = source.replace(new RegExp(
                                    '(require\\()"' +
                                    Tools.stringEscapeRegularExpressions(
                                        configuration.injection.external
                                            .aliases[replacement]
                                    ) + '"(\\))', 'g'
                                ), `$1'${replacement}'$2`).replace(
                                    new RegExp('(define\\("' +
                                        Tools.stringEscapeRegularExpressions(
                                            bundleName
                                        ) + '", \\[.*)"' +
                                        Tools.stringEscapeRegularExpressions(
                                            configuration.injection.external
                                                .aliases[replacement]
                                        ) + '"(.*\\], factory\\);)'
                                    ), `$1'${replacement}'$2`)
                        source = source.replace(new RegExp(
                            '(root\\[)"' +
                            Tools.stringEscapeRegularExpressions(
                                bundleName
                            ) + '"(\\] = )'
                        ), `$1'` + Tools.stringConvertToValidVariableName(
                            bundleName
                        ) + `'$2`)
                        compilation.assets[assetRequest] =
                            new WebpackRawSource(source)
                    }
                }
            callback()
        })})
// // endregion
// // region add automatic image compression
// NOTE: This plugin should be loaded at last to ensure that all emitted images
// ran through.
pluginInstances.push(new plugins.Imagemin(
    configuration.module.optimizer.image.content))
// // endregion
// // region context replacements
for (
    const contextReplacement:Array<string> of
    configuration.module.replacements.context
)
    pluginInstances.push(new webpack.ContextReplacementPlugin(
        ...contextReplacement.map((value:string):any => (new Function(
            'configuration', '__dirname', '__filename', `return ${value}`
        // IgnoreTypeCheck
        ))(configuration, __dirname, __filename))))
// // endregion
// / endregion
// / region loader helper
const rejectFilePathInDependencies:Function = (filePath:string):boolean => {
    filePath = Helper.stripLoader(filePath)
    return Helper.isFilePathInLocation(
        filePath, configuration.path.ignore.concat(
            configuration.module.directoryNames,
            configuration.loader.directoryNames
        ).map((filePath:string):string => path.resolve(
            configuration.path.context, filePath)
        ).filter((filePath:string):boolean =>
            !configuration.path.context.startsWith(filePath)))
}
const loader:Object = {}
const evaluate:Function = (code:string, filePath:string):any => (new Function(
    'configuration', 'filePath', 'loader', 'rejectFilePathInDependencies',
    `return ${code}`
// IgnoreTypeCheck
))(configuration, filePath, loader, rejectFilePathInDependencies)
Tools.extendObject(loader, {
    // Convert to compatible native web types.
    // region generic template
    ejs: {
        exclude: (filePath:string):boolean => Helper.normalizePaths(
            configuration.files.html.concat(
                configuration.files.defaultHTML
            ).map((htmlConfiguration:HTMLConfiguration):string =>
                htmlConfiguration.template.filePath)
        ).includes(filePath) ||
            ((configuration.module.preprocessor.ejs.exclude === null) ? false :
                evaluate(
                    configuration.module.preprocessor.ejs.exclude, filePath)),
        include: Helper.normalizePaths([
            configuration.path.source.base
        ].concat(configuration.module.locations.directoryPaths)),
        test: /^(?!.+\.html\.ejs$).+\.ejs$/i,
        use: [
            {loader: 'file?name=[path][name]' + (Boolean(
                configuration.module.preprocessor.ejs.options.compileSteps % 2
            ) ? '.js' : '') + `?${configuration.hashAlgorithm}=[hash]`},
            {loader: 'extract'},
            {
                loader: configuration.module.preprocessor.ejs.loader,
                options: configuration.module.preprocessor.ejs.options
            }
        ].concat(configuration.module.preprocessor.ejs.additional.map(
            evaluate))
    },
    // endregion
    // region script
    script: {
        exclude: (filePath:string):boolean => (
            configuration.module.preprocessor.javaScript.exclude === null
        ) ? rejectFilePathInDependencies(filePath) :
            evaluate(
                configuration.module.preprocessor.javaScript.exclude, filePath
            ),
        include: Helper.normalizePaths([
            configuration.path.source.asset.javaScript
        ].concat(configuration.module.locations.directoryPaths)),
        test: /\.js(?:\?.*)?$/i,
        use: [{
            loader: configuration.module.preprocessor.javaScript
                .loader,
            options: configuration.module.preprocessor.javaScript
                .options
        }].concat(configuration.module.preprocessor.javaScript.additional.map(
            evaluate))
    },
    // endregion
    // region html template
    html: {
        // NOTE: This is only for the main entry template.
        main: {
            test: new RegExp('^' + Tools.stringEscapeRegularExpressions(
                configuration.files.defaultHTML.template.filePath
            ) + '(?:\\?.*)?$'),
            use: configuration.files.defaultHTML.template.use
        },
        ejs: {
            exclude: (filePath:string):boolean => Helper.normalizePaths(
                configuration.files.html.concat(
                    configuration.files.defaultHTML
                ).map((htmlConfiguration:HTMLConfiguration):string =>
                    htmlConfiguration.template.filePath)
            ).includes(filePath) ||
                ((configuration.module.preprocessor.html.exclude === null) ?
                    false : evaluate(
                        configuration.module.preprocessor.html.exclude,
                        filePath)),
            include: configuration.path.source.asset.template,
            test: /\.html\.ejs(?:\?.*)?$/i,
            use: [
                {loader: 'file?name=' + path.join(path.relative(
                    configuration.path.target.asset.base,
                    configuration.path.target.asset.template
                ), '[name]' + (Boolean(
                    configuration.module.preprocessor.html.options.compileSteps
                    % 2
                ) ? '.js' : '') + `?${configuration.hashAlgorithm}=[hash]`)}
            ].concat((Boolean(
                configuration.module.preprocessor.html.options.compileSteps % 2
            ) ? [] :
                [
                    {loader: 'extract'},
                    {
                        loader: configuration.module.html.loader,
                        options: configuration.module.html.options
                    }
                ]
            ), {
                loader: configuration.module.preprocessor.html.loader,
                options: configuration.module.preprocessor.html.options
            }).concat(configuration.module.preprocessor.html.additional.map(
                evaluate))
        },
        html: {
            exclude: (filePath:string):boolean => Helper.normalizePaths(
                configuration.files.html.concat(
                    configuration.files.defaultHTML
                ).map((htmlConfiguration:HTMLConfiguration):string =>
                    htmlConfiguration.template.filePath)
            ).includes(filePath) ||
                ((configuration.module.html.exclude === null) ? true :
                    evaluate(configuration.module.html.exclude, filePath)),
            include: configuration.path.source.asset.template,
            test: /\.html(?:\?.*)?$/i,
            use: [
                {loader: 'file?name=' + path.join(path.relative(
                    configuration.path.target.base,
                    configuration.path.target.asset.template
                ), `[name].[ext]?${configuration.hashAlgorithm}=[hash]`)},
                {loader: 'extract'},
                {
                    loader: configuration.module.html.loader,
                    options: configuration.module.html.options
                }
            ].concat(configuration.module.html.additional.map(evaluate))
        }
    },
    // endregion
    // Load dependencies.
    // region style
    style: {
        exclude: (filePath:string):boolean => (
            configuration.module.cascadingStyleSheet.exclude === null
        ) ? rejectFilePathInDependencies(filePath) :
            evaluate(
                configuration.module.cascadingStyleSheet.exclude, filePath),
        include: Helper.normalizePaths([
            configuration.path.source.asset.cascadingStyleSheet
        ].concat(configuration.module.locations.directoryPaths)),
        test: /\.s?css(?:\?.*)?$/i,
        use: [
            {
                loader: configuration.module.style.loader,
                options: configuration.module.style.options
            },
            {
                loader: configuration.module.cascadingStyleSheet.loader,
                options: configuration.module.cascadingStyleSheet.options
            },
            {
                loader: configuration.module.preprocessor.cascadingStyleSheet
                    .loader,
                options: Tools.extendObject(true, {
                    ident: 'postcss',
                    plugins: ():Array<Object> => [
                        postcssImport({
                            addDependencyTo: webpack,
                            root: configuration.path.context
                        }),
                        postcssCSSnext({browsers: '> 0%'}),
                        /*
                            NOTE: Checking path doesn't work if fonts are
                            referenced in libraries provided in another
                            location than the project itself like the
                            "node_modules" folder.
                        */
                        postcssFontPath({checkPath: false}),
                        postcssURL({url: 'rebase'}),
                        postcssSprites({
                            filterBy: ():Promise<null> => new Promise((
                                resolve:Function, reject:Function
                            ):Promise<null> => (
                                configuration.files.compose.image ? resolve :
                                reject
                            )()),
                            hooks: {onSaveSpritesheet: (image:Object):string =>
                                path.join(image.spritePath, path.relative(
                                    configuration.path.target.asset.image,
                                    configuration.files.compose.image))
                            },
                            stylesheetPath: configuration.path.source.asset
                                .cascadingStyleSheet,
                            spritePath: configuration.path.source.asset.image
                        })
                    ]
                },
                configuration.module.preprocessor.cascadingStyleSheet.options)
            }
        ].concat(
            configuration.module.preprocessor.cascadingStyleSheet.additional
                .map(evaluate))
    },
    // endregion
    // Optimize loaded assets.
    // region font
    font: {
        eot: {
            exclude: (filePath:string):boolean => (
                configuration.module.optimizer.font.eot.exclude === null
            ) ? false :
                evaluate(
                    configuration.module.optimizer.font.eot.exclude, filePath),
            include: configuration.path.base,
            test: /\.eot(?:\?.*)?$/i,
            use: [{
                loader: configuration.module.optimizer.font.eot.loader,
                options: configuration.module.optimizer.font.eot.options
            }].concat(configuration.module.optimizer.font.eot.additional.map(
                evaluate))
        },
        svg: {
            exclude: (filePath:string):boolean => (
                configuration.module.optimizer.font.svg.exclude === null
            ) ? false :
                evaluate(
                    configuration.module.optimizer.font.svg.exclude, filePath),
            include: configuration.path.base,
            test: /\.svg(?:\?.*)?$/i,
            use: [{
                loader: configuration.module.optimizer.font.svg.loader,
                options: configuration.module.optimizer.font.svg.options
            }].concat(configuration.module.optimizer.font.svg.additional.map(
                evaluate))
        },
        ttf: {
            exclude: (filePath:string):boolean => (
                configuration.module.optimizer.font.ttf.exclude === null
            ) ? false :
                evaluate(
                    configuration.module.optimizer.font.ttf.exclude, filePath),
            include: configuration.path.base,
            test: /\.ttf(?:\?.*)?$/i,
            use: [{
                loader: configuration.module.optimizer.font.ttf.loader,
                options: configuration.module.optimizer.font.ttf.options
            }].concat(configuration.module.optimizer.font.ttf.additional.map(
                evaluate))
        },
        woff: {
            exclude: (filePath:string):boolean => (
                configuration.module.optimizer.font.woff.exclude === null
            ) ? false :
                evaluate(
                    configuration.module.optimizer.font.woff.exclude, filePath
                ),
            include: configuration.path.base,
            test: /\.woff2?(?:\?.*)?$/i,
            use: [{
                loader: configuration.module.optimizer.font.woff.loader,
                options: configuration.module.optimizer.font.woff.options
            }].concat(configuration.module.optimizer.font.woff.additional.map(
                evaluate))
        }
    },
    // endregion
    // region image
    image: {
        exclude: (filePath:string):boolean => (
            configuration.module.optimizer.image.exclude === null
        ) ? rejectFilePathInDependencies(filePath) :
            evaluate(configuration.module.optimizer.image.exclude, filePath),
        include: configuration.path.source.asset.image,
        test: /\.(?:png|jpg|ico|gif)(?:\?.*)?$/i,
        use: [{
            loader: configuration.module.optimizer.image.loader,
            options: configuration.module.optimizer.image.file
        }].concat(configuration.module.optimizer.image.additional.map(
            evaluate))
    },
    // endregion
    // region data
    data: {
        exclude: (filePath:string):boolean =>
            configuration.extensions.file.internal.includes(
                path.extname(Helper.stripLoader(filePath))
            ) || ((
                configuration.module.optimizer.data.exclude === null
            ) ? rejectFilePathInDependencies(filePath) :
                evaluate(
                    configuration.module.optimizer.data.exclude, filePath)),
        include: configuration.path.source.asset.data,
        test: /.+/,
        use: [{
            loader: configuration.module.optimizer.data.loader,
            options: configuration.module.optimizer.data.options
        }].concat(configuration.module.optimizer.data.additional.map(evaluate))
    }
    // endregion
})
if (configuration.files.compose.cascadingStyleSheet) {
    loader.style.use.shift()
    loader.style.use = plugins.ExtractText.extract({use: loader.style.use})
}
// / endregion
// endregion
// region configuration
const webpackConfiguration:WebpackConfiguration = {
    bail: true,
    cache: configuration.cache.main,
    context: configuration.path.context,
    devtool: configuration.development.tool,
    devServer: configuration.development.server,
    // region input
    entry: configuration.injection.internal.normalized,
    externals: configuration.injection.external.modules,
    resolve: {
        alias: configuration.module.aliases,
        aliasFields: configuration.package.aliasPropertyNames,
        extensions: configuration.extensions.file.internal,
        mainFields: configuration.package.main.propertyNames,
        mainFiles: configuration.package.main.fileNames,
        moduleExtensions: configuration.extensions.module,
        modules: Helper.normalizePaths(configuration.module.directoryNames),
        unsafeCache: configuration.cache.unsafe
    },
    resolveLoader: {
        alias: configuration.loader.aliases,
        aliasFields: configuration.package.aliasPropertyNames,
        extensions: configuration.loader.extensions.file,
        mainFields: configuration.package.main.propertyNames,
        mainFiles: configuration.package.main.fileNames,
        moduleExtensions: configuration.loader.extensions.module,
        modules: configuration.loader.directoryNames
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
            configuration.givenCommandLineArguments[2] === 'build:dll'
        ) ? 'var' : configuration.exportFormat.self,
        path: configuration.path.target.base,
        publicPath: configuration.path.target.public,
        pathinfo: configuration.debug,
        umdNamedDefine: true
    },
    performance: configuration.performanceHints,
    target: configuration.targetTechnology,
    // endregion
    module: {
        rules: configuration.module.additional.map((
            loaderConfiguration:PlainObject
        ):PlainObject => {
            return {
                exclude: (filePath:string):boolean => evaluate(
                    loaderConfiguration.exclude || 'false', filePath),
                include: loaderConfiguration.include && evaluate(
                    loaderConfiguration.include, configuration.path.context
                ) || configuration.path.source.base,
                test: new RegExp(evaluate(
                    loaderConfiguration.test, configuration.path.context)),
                use: evaluate(loaderConfiguration.use)
            }
        }).concat([
            loader.ejs,
            loader.script,
            loader.html.main, loader.html.ejs, loader.html.html,
            loader.style,
            loader.font.eot, loader.font.svg, loader.font.ttf,
            loader.font.woff,
            loader.image,
            loader.data
        ])
    },
    node: configuration.nodeEnvironment,
    plugins: pluginInstances
}
if (
    !Array.isArray(configuration.module.skipParseRegularExpressions) ||
    configuration.module.skipParseRegularExpressions.length
)
    webpackConfiguration.module.noParse =
        configuration.module.skipParseRegularExpressions
if (configuration.showConfiguration) {
    console.info('Using internal configuration:', util.inspect(configuration, {
        depth: null}))
    console.info('-----------------------------------------------------------')
    console.info('Using webpack configuration:', util.inspect(
        webpackConfiguration, {depth: null}))
}
// endregion
export default webpackConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
