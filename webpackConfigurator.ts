#!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module webpackConfigurator */
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import Tools from 'clientnode'
import {Mapping, PlainObject, ProcedureFunction} from 'clientnode/type'
/* eslint-disable no-empty,@typescript-eslint/no-var-requires */
let postcssCSSnano:Function = Tools.noop
try {
    postcssCSSnano = require('cssnano')
} catch (error) {}
/* eslint-enable no-empty,@typescript-eslint/no-var-requires */
import HtmlWebpackPlugin from 'html-webpack-plugin'
import {JSDOM as DOM} from 'jsdom'
import {promises as fileSystem} from 'fs'
import path from 'path'
/* eslint-disable no-empty,@typescript-eslint/no-var-requires */
let postcssFontPath:Function = Tools.noop
try {
    postcssFontPath = require('postcss-fontpath')
} catch (error) {}
let postcssImport:Function = Tools.noop
try {
    postcssImport = require('postcss-import')
} catch (error) {}
let postcssSprites:Function = Tools.noop
try {
    postcssSprites = require('postcss-sprites')
} catch (error) {}
let postcssURL:Function = Tools.noop
try {
    postcssURL = require('postcss-url')
} catch (error) {}
/* eslint-enable no-empty,@typescript-eslint/no-var-requires */
import util from 'util'
import webpack, {
    Compiler,
    Compilation,
    ContextReplacementPlugin,
    DefinePlugin,
    DllPlugin,
    DllReferencePlugin,
    IgnorePlugin,
    NormalModuleReplacementPlugin,
    ProvidePlugin
} from 'webpack'
import {RawSource as WebpackRawSource} from 'webpack-sources'

const pluginNameResourceMapping:Mapping = {
    HTML: 'html-webpack-plugin',
    MiniCSSExtract: 'mini-css-extract-plugin',
    AddAssetHTMLPlugin: 'add-asset-html-webpack-plugin',
    OpenBrowser: 'open-browser-webpack-plugin',
    Favicon: 'favicons-webpack-plugin',
    Imagemin: 'imagemin-webpack-plugin',
    Offline: 'offline-plugin'
}
const plugins:Record<string, any> = {}
for (const name in pluginNameResourceMapping)
    if (Object.prototype.hasOwnProperty.call(pluginNameResourceMapping, name))
        try {
            plugins[name] = require(pluginNameResourceMapping[name])
        } catch (error) {
            console.debug(`Optional webpack plugin "${name}" not available.`)
        }
if (plugins.Imagemin)
    plugins.Imagemin = plugins.Imagemin.default

import ejsLoader, {
    LoaderConfiguration as EJSLoaderConfiguration
} from './ejsLoader'
/* eslint-disable no-unused-vars */
import {
    AdditionalLoaderConfiguration,
    AssetPathConfiguration,
    HTMLConfiguration,
    HTMLWebpackPluginAssetTagGroupsData,
    HTMLWebpackPluginBeforeEmitData,
    InPlaceConfiguration,
    PackageDescriptor,
    WebpackConfiguration,
    WebpackLoader,
    WebpackLoaderConfiguration
} from './type'
/* eslint-enable no-unused-vars */
import configuration from './configurator'
import Helper from './helper'
// / region monkey patches
// Monkey-Patch html loader to retrieve html loader options since the
// "webpack-html-plugin" doesn't preserve the original loader interface.
import htmlLoaderModuleBackup from 'html-loader'
if (require.cache && require.resolve('html-loader') in require.cache)
    (require.cache[require.resolve('html-loader')] as NodeModule).exports =
        function<A, B>(this:WebpackLoader, ...parameter:Array<A>):B {
            Tools.extend(true, this.options, module, this.options)
            return htmlLoaderModuleBackup.call(this, ...parameter)
        }
// Monkey-Patch loader-utils to define which url is a local request.
import loaderUtilsModuleBackup from 'loader-utils'
const loaderUtilsIsUrlRequestBackup:(
    url:string, ...parameter:Array<any>
) => boolean = loaderUtilsModuleBackup.isUrlRequest
if (require.cache && require.resolve('loader-utils') in require.cache)
    (require.cache[require.resolve('loader-utils')] as NodeModule)
        .exports
        .isUrlRequest =
            (url:string, ...parameter:Array<any>):boolean => {
                if (/^[a-z]+:.+/.exec(url))
                    return false
                return loaderUtilsIsUrlRequestBackup.call(
                    loaderUtilsModuleBackup, url, ...parameter
                )
            }
// / endregion
// endregion
// region initialisation
// / region determine library name
let libraryName:string
if (configuration.libraryName)
    libraryName = configuration.libraryName
else if (Object.keys(configuration.injection.entry.normalized).length > 1)
    libraryName = '[name]'
else {
    libraryName = configuration.name
    if (['assign', 'global', 'this', 'var', 'window'].includes(
        configuration.exportFormat.self
    ))
        libraryName = Tools.stringConvertToValidVariableName(libraryName)
}
// / endregion
// / region plugins
const pluginInstances:Array<Record<string, any>> = []
// // region define modules to ignore
for (const ignorePattern of configuration.injection.ignorePattern)
    pluginInstances.push(new IgnorePlugin(ignorePattern))
// // endregion
// // region define modules to replace
for (const source in configuration.module.replacements.normal)
    if (Object.prototype.hasOwnProperty.call(
        configuration.module.replacements.normal, source
    )) {
        const search = new RegExp(source)
        pluginInstances.push(new NormalModuleReplacementPlugin(
            search,
            (resource:{request:string}):void => {
                resource.request = resource.request.replace(
                    // @ts-ignore: https://github.com/microsoft/TypeScript/
                    // issues/22378
                    search, configuration.module.replacements.normal[source]
                )
            }
        ))
    }
// // endregion
// // region generate html file
let htmlAvailable = false
if (configuration.givenCommandLineArguments[2] !== 'build:dll')
    for (const htmlConfiguration of configuration.files.html)
        if (Tools.isFileSync(htmlConfiguration.template.filePath)) {
            pluginInstances.push(new plugins.HTML(Tools.extend(
                {},
                htmlConfiguration,
                {template: htmlConfiguration.template.request}
            )))
            htmlAvailable = true
        }
// // endregion
// // region generate favicons
if (
    htmlAvailable &&
    configuration.favicon &&
    plugins.Favicon &&
    Tools.isFileSync(configuration.favicon.logo)
)
    pluginInstances.push(new plugins.Favicon(configuration.favicon))
// // endregion
// // region provide offline functionality
if (htmlAvailable && configuration.offline && plugins.Offline) {
    if (!['serve', 'test:browser'].includes(
        configuration.givenCommandLineArguments[2]
    ))
        for (const [name, extension] of Object.entries({
            cascadingStyleSheet: 'css',
            javaScript: 'js'
        })) {
            const type:keyof InPlaceConfiguration =
                name as keyof InPlaceConfiguration
            if (configuration.inPlace[type]) {
                const matches:Array<string> = Object.keys(
                    configuration.inPlace[type])
                for (const name of matches)
                    configuration.offline.excludes.push(
                        path.relative(
                            configuration.path.target.base,
                            configuration.path.target.asset[
                                type as keyof AssetPathConfiguration
                            ]
                        ) +
                        `${name}.${extension}?${configuration.hashAlgorithm}=*`
                    )
            }
        }
    pluginInstances.push(new plugins.Offline(configuration.offline))
}
// // endregion
// // region opens browser automatically
if (
    configuration.development.openBrowser &&
    (
        htmlAvailable &&
        ['serve', 'test:browser'].includes(
            configuration.givenCommandLineArguments[2]
        )
    )
)
    pluginInstances.push(new plugins.OpenBrowser(
        configuration.development.openBrowser))
// // endregion
// // region provide build environment
if (configuration.buildContext.definitions)
    pluginInstances.push(
        new DefinePlugin(configuration.buildContext.definitions)
    )
if (configuration.module.provide)
    pluginInstances.push(new ProvidePlugin(configuration.module.provide))
// // endregion
// // region modules/assets
// /// region apply module pattern
pluginInstances.push({apply: (compiler:Record<string, any>):void => {
    compiler.hooks.emit.tap(
        'applyModulePattern',
        (compilation:Record<string, any>):void => {
            for (const request in compilation.assets)
                if (Object.prototype.hasOwnProperty.call(
                    compilation.assets, request
                )) {
                    const filePath:string = request.replace(/\?[^?]+$/, '')
                    const type:null|string = Helper.determineAssetType(
                        filePath,
                        configuration.buildContext.types,
                        configuration.path
                    )
                    if (
                        type &&
                        configuration.assetPattern[type] &&
                        (new RegExp(
                            configuration.assetPattern[type]
                                .includeFilePathRegularExpression
                        )).test(filePath) &&
                        !(new RegExp(
                            configuration.assetPattern[type]
                                .excludeFilePathRegularExpression
                        )).test(filePath)
                    ) {
                        const source:string =
                            compilation.assets[request].source()
                        if (typeof source === 'string')
                            compilation.assets[request] = new WebpackRawSource(
                                configuration.assetPattern[type].pattern
                                    .replace(
                                        /\{1\}/g, source.replace(/\$/g, '$$$')
                                    )
                            )
                    }
                }
        }
    )
}})
// /// endregion
// /// region in-place configured assets in the main html file
if (
    htmlAvailable &&
    !['serve', 'test:browser'].includes(
        configuration.givenCommandLineArguments[2]
    )
)
    pluginInstances.push({apply: (compiler:Record<string, any>):void => {
        const filePathsToRemove:Array<string> = []
        compiler.hooks.compilation.tap('inPlaceHTMLAssets', (
            compilation:Record<string, any>
        ):void =>
            compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
                'inPlaceHTMLAssets',
                (data:{html:string}, callback:Function):void => {
                    if (
                        configuration.inPlace.cascadingStyleSheet &&
                        Object.keys(
                            configuration.inPlace.cascadingStyleSheet
                        ).length ||
                        configuration.inPlace.javaScript &&
                        Object.keys(configuration.inPlace.javaScript).length
                    )
                        try {
                            const result:{
                                content:string
                                filePathsToRemove:Array<string>
                            } = Helper.inPlaceCSSAndJavaScriptAssetReferences(
                                data.html,
                                configuration.inPlace.cascadingStyleSheet,
                                configuration.inPlace.javaScript,
                                configuration.path.target.base,
                                configuration.files.compose
                                    .cascadingStyleSheet,
                                configuration.files.compose.javaScript,
                                compilation.assets
                            )
                            data.html = result.content
                            filePathsToRemove.concat(result.filePathsToRemove)
                        } catch (error) {
                            return callback(error, data)
                        }
                    callback(null, data)
                }))
        compiler.hooks.afterEmit.tapAsync(
            'removeInPlaceHTMLAssetFiles', async (
                data:Record<string, any>, callback:ProcedureFunction
            ):Promise<void> => {
                let promises:Array<Promise<void>> = []
                for (const path of filePathsToRemove)
                    if (await Tools.isFile(path))
                        promises.push(fileSystem.unlink(path).catch(
                            console.error
                        ))
                await Promise.all(promises)
                promises = []
                for (const type of [
                    configuration.path.target.asset.javaScript,
                    configuration.path.target.asset.cascadingStyleSheet
                ])
                    promises.push(
                        fileSystem.readdir(
                            type, {encoding: configuration.encoding}
                        )
                            .then(async (
                                files:Array<Buffer>|Array<string>
                            ):Promise<void> => {
                                if (files.length === 0)
                                    await fileSystem.rmdir(type)
                            })
                    )
                await Promise.all(promises)
                callback()
            })
    }})
// /// endregion
// /// region remove chunks if a corresponding dll package exists
if (configuration.givenCommandLineArguments[2] !== 'build:dll')
    for (const chunkName in configuration.injection.entry.normalized)
        if (Object.prototype.hasOwnProperty.call(
            configuration.injection.entry.normalized, chunkName
        )) {
            const manifestFilePath:string =
                `${configuration.path.target.base}/${chunkName}.` +
                `dll-manifest.json`
            if (configuration.dllManifestFilePaths.includes(
                manifestFilePath
            )) {
                delete configuration.injection.entry.normalized[chunkName]
                const filePath:string = Helper.renderFilePathTemplate(
                    Helper.stripLoader(configuration.files.compose.javaScript),
                    {'[name]': chunkName}
                )
                pluginInstances.push(new plugins.AddAssetHTMLPlugin({
                    filepath: filePath,
                    hash: true,
                    includeSourcemap: Tools.isFileSync(`${filePath}.map`)
                }))
                pluginInstances.push(new DllReferencePlugin({
                    context: configuration.path.context,
                    manifest: require(manifestFilePath)
                }))
            }
        }
// /// endregion
// /// region mark empty javaScript modules as dummy
if (!(
    configuration.needed.javaScript ||
    configuration.needed.javaScriptExtension ||
    configuration.needed.typeScript ||
    configuration.needed.typeScriptExtension
))
    configuration.files.compose.javaScript = path.resolve(
        configuration.path.target.asset.javaScript, '.__dummy__.compiled.js'
    )
// /// endregion
// /// region extract cascading style sheets
if (configuration.files.compose.cascadingStyleSheet && plugins.MiniCSSExtract)
    pluginInstances.push(new plugins.MiniCSSExtract({
        chunks: '[name].css',
        filename: path.relative(
            configuration.path.target.base,
            configuration.files.compose.cascadingStyleSheet)
    }))
// /// endregion
// /// region performs implicit external logic
if (configuration.injection.external.modules === '__implicit__')
    /*
        We only want to process modules from local context in library mode,
        since a concrete project using this library should combine all assets
        (and de-duplicate them) for optimal bundling results.
        NOTE: Only native java script and json modules will be marked as
        external dependency.
    */
    configuration.injection.external.modules = (
        context:string, request:string, callback:Function
    ):void => {
        request = request.replace(/^!+/, '')
        if (request.startsWith('/'))
            request = path.relative(configuration.path.context, request)
        for (const filePath of configuration.module.directoryNames)
            if (request.startsWith(filePath)) {
                request = request.substring(filePath.length)
                if (request.startsWith('/'))
                    request = request.substring(1)
                break
            }
        // region pattern based aliasing
        const filePath:null|string = Helper.determineModuleFilePath(
            request,
            {},
            {},
            {file: configuration.extensions.file.external},
            configuration.path.context,
            context,
            configuration.path.ignore,
            configuration.module.directoryNames,
            configuration.package.main.fileNames,
            configuration.package.main.propertyNames,
            configuration.package.aliasPropertyNames,
            configuration.encoding
        )
        if (filePath)
            for (const pattern in configuration.injection.external.aliases)
                if (
                    Object.prototype.hasOwnProperty.call(
                        configuration.injection.external.aliases, pattern
                    ) &&
                    pattern.startsWith('^')
                ) {
                    const regularExpression = new RegExp(pattern)
                    if (regularExpression.test(filePath)) {
                        let match = false
                        const targetConfiguration =
                            configuration.injection.external.aliases[pattern]
                        if (typeof targetConfiguration !== 'string')
                            break
                        const replacementRegularExpression = new RegExp(
                            Object.keys(targetConfiguration)[0])
                        let target:string = targetConfiguration[
                            Object.keys(targetConfiguration)[0]
                        ]
                        if (target.startsWith('?')) {
                            target = target.substring(1)
                            const aliasedRequest:string = request.replace(
                                replacementRegularExpression, target)
                            if (aliasedRequest !== request)
                                match = Boolean(Helper.determineModuleFilePath(
                                    aliasedRequest,
                                    {},
                                    {},
                                    {
                                        file: configuration.extensions.file
                                            .external
                                    },
                                    configuration.path.context,
                                    context,
                                    configuration.path.ignore,
                                    configuration.module.directoryNames,
                                    configuration.package.main.fileNames,
                                    configuration.package.main.propertyNames,
                                    configuration.package.aliasPropertyNames,
                                    configuration.encoding
                                ))
                        } else
                            match = true
                        if (match) {
                            request = request.replace(
                                replacementRegularExpression, target)
                            break
                        }
                    }
                }
        // endregion
        const resolvedRequest:null|string = Helper.determineExternalRequest(
            request,
            configuration.path.context,
            context,
            configuration.injection.entry.normalized,
            configuration.module.directoryNames,
            configuration.module.aliases,
            configuration.module.replacements.normal,
            configuration.extensions,
            configuration.path.source.asset.base,
            configuration.path.ignore,
            configuration.module.directoryNames,
            configuration.package.main.fileNames,
            configuration.package.main.propertyNames,
            configuration.package.aliasPropertyNames,
            configuration.injection.external.implicit.pattern.include,
            configuration.injection.external.implicit.pattern.exclude,
            configuration.inPlace.externalLibrary.normal,
            configuration.inPlace.externalLibrary.dynamic,
            configuration.encoding
        )
        if (resolvedRequest) {
            const keys:Array<string> = [
                'amd', 'commonjs', 'commonjs2', 'root']
            let result:PlainObject|string = resolvedRequest
            if (Object.prototype.hasOwnProperty.call(
                configuration.injection.external.aliases, request
            )) {
                // region normal alias replacement
                result = {default: request}
                if (
                    typeof configuration.injection.external.aliases[
                        request
                    ] === 'string'
                )
                    for (const key of keys)
                        result[key] = configuration.injection.external.aliases[
                            request
                        ] as unknown as string
                else if (
                    typeof configuration.injection.external.aliases[
                        request
                    ] === 'function'
                )
                    for (const key of keys)
                        result[key] = (
                            configuration.injection.external.aliases[
                                request
                            ] as unknown as Function
                        )(request, key)
                else if (
                    configuration.injection.external.aliases[
                        request
                    ] !== null &&
                    typeof configuration.injection.external.aliases[
                        request
                    ] === 'object'
                )
                    Tools.extend(
                        result,
                        configuration.injection.external.aliases[request])
                if (Object.prototype.hasOwnProperty.call(result, 'default'))
                    for (const key of keys)
                        if (!Object.prototype.hasOwnProperty.call(result, key))
                            result[key] = result.default
                // endregion
            }
            if (
                typeof result !== 'string' &&
                Object.prototype.hasOwnProperty.call(result, 'root')
            )
                result.root = ([] as Array<string>)
                    .concat(result.root as Array<string>)
                    .map((name:string):string =>
                        Tools.stringConvertToValidVariableName(name)
                    )
            const exportFormat:string = (
                configuration.exportFormat.external ||
                configuration.exportFormat.self
            )
            return callback(
                null,
                exportFormat === 'umd' || typeof result === 'string' ?
                    result :
                    result[exportFormat],
                exportFormat
            )
        }
        return callback()
    }
// /// endregion
// /// region build dll packages
if (configuration.givenCommandLineArguments[2] === 'build:dll') {
    let dllChunkExists = false
    for (const chunkName in configuration.injection.entry.normalized)
        if (Object.prototype.hasOwnProperty.call(
            configuration.injection.entry.normalized, chunkName
        ))
            if (configuration.injection.dllChunkNames.includes(chunkName))
                dllChunkExists = true
            else
                delete configuration.injection.entry.normalized[chunkName]
    if (dllChunkExists) {
        libraryName = '[name]DLLPackage'
        pluginInstances.push(new DllPlugin({
            path: `${configuration.path.target.base}/[name].dll-manifest.json`,
            name: libraryName
        }))
    } else
        console.warn('No dll chunk id found.')
}
// /// endregion
// // endregion
// // region apply final dom/javaScript/cascadingStyleSheet modifications/fixes
if (htmlAvailable)
    pluginInstances.push({apply: (
        compiler:Compiler
    ):void => compiler.hooks.compilation.tap('WebOptimizer', (
        compilation:Compilation
    ):void => {
        plugins.HTML.getHooks(compilation).alterAssetTagGroups.tapAsync(
            'WebOptimizerRemoveDummyHTMLTags',
            (
                data:HTMLWebpackPluginAssetTagGroupsData, callback:Function
            ):void => {
                for (const tags of [data.bodyTags, data.headTags]) {
                    let index = 0
                    for (const tag of tags) {
                        if (/^\.__dummy__(\..*)?$/.test(path.basename((
                            tag.attributes.src || tag.attributes.href || ''
                        ) as string)))
                            tags.splice(index, 1)
                        index += 1
                    }
                }
                const assets:Array<string> = JSON.parse(
                    (data.plugin as unknown as {assetJson:string}).assetJson
                )
                let index = 0
                for (const assetRequest of assets) {
                    if (/^\.__dummy__(\..*)?$/.test(path.basename(
                        assetRequest
                    )))
                        assets.splice(index, 1)
                    index += 1
                }
                (data.plugin as unknown as {assetJson:string}).assetJson =
                    JSON.stringify(assets)
                callback(null, data)
            }
        )
        plugins.HTML.getHooks(compilation).beforeEmit.tapAsync(
            'WebOptimizerPostProcessHTML',
            (data:HTMLWebpackPluginBeforeEmitData, callback:Function):void => {
                /*
                    NOTE: We have to prevent creating native "style" dom nodes
                    to prevent jsdom from parsing the entire cascading style
                    sheet. Which is error prune and very resource intensive.
                */
                const styleContents:Array<string> = []
                data.html = data.html.replace(
                    /(<style[^>]*>)([\s\S]*?)(<\/style[^>]*>)/gi,
                    (
                        match:string,
                        startTag:string,
                        content:string,
                        endTag:string
                    ):string => {
                        styleContents.push(content)
                        return `${startTag}${endTag}`
                    })
                let dom:DOM
                try {
                    /*
                        NOTE: We have to translate template delimiter to html
                        compatible sequences and translate it back later to
                        avoid unexpected escape sequences in resulting html.
                    */
                    dom = new DOM(
                        data.html
                            .replace(/<%/g, '##+#+#+##')
                            .replace(/%>/g, '##-#-#-##')
                    )
                } catch (error) {
                    return callback(error, data)
                }
                const linkables:Mapping = {link: 'href', script: 'src'}
                for (const tagName in linkables)
                    if (Object.prototype.hasOwnProperty.call(
                        linkables, tagName
                    ))
                        for (
                            const domNode of
                            Array.from(dom.window.document.querySelectorAll(
                                `${tagName}[${linkables[tagName]}*="?` +
                                `${configuration.hashAlgorithm}="]`
                            ))
                        )
                            /*
                                NOTE: Removing symbols after a "&" in hash
                                string is necessary to match the generated
                                request strings in offline plugin.
                            */
                            domNode.setAttribute(
                                linkables[tagName],
                                // @ts-ignore: Typescripts wrongly considers
                                // "null".
                                domNode
                                    .getAttribute(linkables[tagName])
                                    .replace(
                                        new RegExp(
                                            '(\\?' +
                                            `${configuration.hashAlgorithm}=` +
                                            '[^&]+).*$'
                                        ),
                                        '$1'
                                    )
                            )
                /*
                    NOTE: We have to restore template delimiter and style
                    contents.
                */
                data.html = dom.serialize()
                    .replace(/##\+#\+#\+##/g, '<%')
                    .replace(/##-#-#-##/g, '%>')
                    .replace(
                        /(<style[^>]*>)[\s\S]*?(<\/style[^>]*>)/gi,
                        (
                            match:string,
                            startTag:string,
                            endTag:string
                        ):string =>
                            `${startTag}${styleContents.shift()}${endTag}`
                    )
                // region post compilation
                for (const htmlFileSpecification of configuration.files.html)
                    if (htmlFileSpecification.filename === (
                        data.plugin as
                            unknown as
                            {options: HtmlWebpackPlugin.ProcessedOptions}
                    ).options.filename) {
                        for (
                            const loaderConfiguration of Array.isArray(
                                htmlFileSpecification.template.use
                            ) ?
                                htmlFileSpecification.template.use :
                                [htmlFileSpecification.template.use]
                        )
                            if (
                                loaderConfiguration.options?.compileSteps &&
                                typeof loaderConfiguration.options
                                    .compileSteps === 'number'
                            )
                                data.html = ejsLoader.bind(
                                    Tools.extend(
                                        true,
                                        {},
                                        {options:
                                            loaderConfiguration.options || {}
                                        },
                                        {options: {
                                            compileSteps:
                                                htmlFileSpecification.template
                                                    .postCompileSteps
                                        }}
                                    )
                                )(data.html)
                        break
                    }
                // endregion
                callback(null, data)
            }
        )
    })})
// // endregion
// // region add automatic image compression
// NOTE: This plugin should be loaded at last to ensure that all emitted images
// ran through.
if (plugins.Imagemin)
    pluginInstances.push(new plugins.Imagemin(
        configuration.module.optimizer.image.content))
// // endregion
// // region context replacements
for (const contextReplacement of configuration.module.replacements.context)
    pluginInstances.push(new ContextReplacementPlugin(...(
        contextReplacement.map((value:string):any => (new Function(
            'configuration', '__dirname', '__filename', `return ${value}`
        ))(configuration, __dirname, __filename))
    ) as [string, string]))
// // endregion
// // region consolidate duplicated module requests
pluginInstances.push(new NormalModuleReplacementPlugin(
    /((?:^|\/)node_modules\/.+){2}/,
    (resource:{
        request:string
        resource:string
    }):void => {
        const targetName:'request'|'resource' = resource.request ?
            'request' :
            'resource'
        const targetPath:string = resource[targetName]
        if (Tools.isFileSync(targetPath)) {
            const packageDescriptor:null|PackageDescriptor =
                Helper.getClosestPackageDescriptor(targetPath)
            if (packageDescriptor) {
                const pathPrefixes:null|RegExpMatchArray = targetPath.match(
                    /((?:^|.*?\/)node_modules\/)/g
                )
                if (pathPrefixes === null)
                    return
                // Avoid finding the same artefact.
                pathPrefixes.pop()
                let index = 0
                for (const pathPrefix of pathPrefixes) {
                    if (index > 0)
                        pathPrefixes[index] = path.resolve(
                            pathPrefixes[index - 1], pathPrefix)
                    index += 1
                }
                const pathSuffix:string = targetPath.replace(
                    /(?:^|.*\/)node_modules\/(.+$)/, '$1')
                let redundantRequest:null|PlainObject = null
                for (const pathPrefix of pathPrefixes) {
                    const alternateTargetPath:string = path.resolve(
                        pathPrefix, pathSuffix)
                    if (Tools.isFileSync(alternateTargetPath)) {
                        const otherPackageDescriptor:null|PackageDescriptor =
                            Helper.getClosestPackageDescriptor(
                                alternateTargetPath)
                        if (otherPackageDescriptor)
                            if (
                                packageDescriptor.configuration.version ===
                                otherPackageDescriptor.configuration.version
                            ) {
                                console.info(
                                    'Consolidate module request "' +
                                    `${targetPath}" to "` +
                                    `${alternateTargetPath}".`
                                )
                                resource[targetName] = alternateTargetPath
                                return
                            } else
                                redundantRequest = {
                                    path: alternateTargetPath,
                                    version:
                                        otherPackageDescriptor.configuration
                                            .version
                                }
                    }
                }
                if (redundantRequest)
                    console.warn(
                        'Including different versions of same package "' +
                        `${packageDescriptor.configuration.name}". Module "` +
                        `${targetPath}" (version ` +
                        `${packageDescriptor.configuration.version}) has ` +
                        `redundancies with "${redundantRequest.path}" (` +
                        `version ${redundantRequest.version}).`
                    )
            }
        }
    }
))
// // endregion
// / endregion
// / region loader helper
const isFilePathInDependencies:Function = (filePath:string):boolean => {
    filePath = Helper.stripLoader(filePath)
    return Helper.isFilePathInLocation(
        filePath,
        configuration.path.ignore.concat(
            configuration.module.directoryNames,
            configuration.loader.directoryNames
        ).map((filePath:string):string => path.resolve(
            configuration.path.context, filePath)
        ).filter((filePath:string):boolean =>
            !configuration.path.context.startsWith(filePath)
        )
    )
}
const loader:Record<string, any> = {}
const scope:Record<string, any> = {
    configuration,
    isFilePathInDependencies,
    loader,
    require: eval('require')
}
const evaluate = (
    object:any, filePath:string = configuration.path.context
):any =>
    typeof object === 'string' ?
        (new Function('filePath', ...Object.keys(scope), `return ${object}`))(
            filePath, ...Object.values(scope)
        ) :
        object
const evaluateMapper = (value:any):any => evaluate(value)
const evaluateAdditionalLoaderConfiguration = (
    loaderConfiguration:AdditionalLoaderConfiguration
):WebpackLoaderConfiguration => ({
    exclude: (filePath:string):boolean =>
        evaluate(loaderConfiguration.exclude || 'false', filePath),
    include:
        loaderConfiguration.include &&
        evaluate(loaderConfiguration.include) ||
        configuration.path.source.base,
    test: new RegExp(evaluate(loaderConfiguration.test)),
    use: evaluate(loaderConfiguration.use)
})
const includingPaths:Array<string> =
    Helper.normalizePaths([configuration.path.source.asset.javaScript].concat(
        configuration.module.locations.directoryPaths
    ))
Tools.extend(loader, {
    // Convert to compatible native web types.
    // region generic template
    ejs: {
        exclude: (filePath:string):boolean =>
            Helper.normalizePaths(
                configuration.files.html
                    .concat(configuration.files.defaultHTML)
                    .map((htmlConfiguration:HTMLConfiguration):string =>
                        htmlConfiguration.template.filePath
                    )
            ).includes(filePath) ||
            (configuration.module.preprocessor.ejs.exclude === null) ?
                false :
                evaluate(
                    configuration.module.preprocessor.ejs.exclude, filePath
                ),
        include: includingPaths,
        test: /^(?!.+\.html\.ejs$).+\.ejs$/i,
        use: configuration.module.preprocessor.ejs.additional.pre
            .map(evaluateMapper)
            .concat(
                {
                    loader: 'file?name=[path][name]' +
                        (
                            (
                                Tools.isPlainObject(
                                    configuration.module.preprocessor.ejs
                                        .options
                                ) ?
                                    configuration.module.preprocessor.ejs
                                        .options as EJSLoaderConfiguration :
                                    {compileSteps: 2}
                            ).compileSteps % 2 ? '.js' : ''
                        ) +
                        `?${configuration.hashAlgorithm}=[chunkhash]`
                },
                {loader: 'extract'},
                {
                    loader: configuration.module.preprocessor.ejs.loader,
                    options: configuration.module.preprocessor.ejs.options || {}
                },
                configuration.module.preprocessor.ejs.additional.post
                    .map(evaluateMapper)
            )
    },
    // endregion
    // region script
    script: {
        exclude: (filePath:string):boolean =>
            evaluate(
                configuration.module.preprocessor.javaScript.exclude, filePath
            ),
        include: (filePath:string):boolean => {
            const result:any =
                evaluate(
                    configuration.module.preprocessor.javaScript.include,
                    filePath
                )
            if ([null, undefined].includes(result)) {
                for (const includePath of includingPaths)
                    if (filePath.startsWith(includePath))
                        return true
                return false
            }
            return Boolean(result)
        },
        test: new RegExp(
            configuration.module.preprocessor.javaScript.regularExpression, 'i'
        ),
        use: configuration.module.preprocessor.javaScript.additional.pre.map(
            evaluateMapper
        ).concat(
            {
                loader: configuration.module.preprocessor.javaScript.loader,
                options:
                    configuration.module.preprocessor.javaScript.options || {}
            },
            configuration.module.preprocessor.javaScript.additional.post
                .map(evaluateMapper)
        )
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
            exclude:
                (filePath:string):boolean => Helper.normalizePaths(
                    configuration.files.html.concat(
                        configuration.files.defaultHTML
                    ).map((htmlConfiguration:HTMLConfiguration):string =>
                        htmlConfiguration.template.filePath)
                ).includes(filePath) ||
                ((configuration.module.preprocessor.html.exclude === null) ?
                    false :
                    evaluate(
                        configuration.module.preprocessor.html.exclude,
                        filePath
                    )
                ),
            include: configuration.path.source.asset.template,
            test: /\.html\.ejs(?:\?.*)?$/i,
            use: configuration.module.preprocessor.html.additional.pre.map(
                evaluateMapper
            ).concat(
                {
                    loader:
                        'file?name=' +
                        path.join(
                            path.relative(
                                configuration.path.target.asset.base,
                                configuration.path.target.asset.template
                            ),
                            '[name]' +
                            (
                                (
                                    Tools.isPlainObject(
                                        configuration.module.preprocessor.html
                                            .options
                                    ) ?
                                        configuration.module.preprocessor.html
                                            .options as EJSLoaderConfiguration :
                                        {compileSteps: 2}
                                ).compileSteps % 2 ?
                                    '.js' :
                                    ''
                            ) +
                            `?${configuration.hashAlgorithm}=[chunkhash]`
                        )
                },
                (
                    (
                        Tools.isPlainObject(
                            configuration.module.preprocessor.html.options
                        ) ?
                            configuration.module.preprocessor.html.options as
                                EJSLoaderConfiguration :
                            {compileSteps: 2}
                    ).compileSteps % 2 ?
                        [] :
                        [
                            {loader: 'extract'},
                            {
                                loader: configuration.module.html.loader,
                                options:
                                    configuration.module.html.options || {}
                            }
                        ]
                ),
                {
                    loader: configuration.module.preprocessor.html.loader,
                    options:
                        configuration.module.preprocessor.html.options || {}
                },
                configuration.module.preprocessor.html.additional.post.map(
                    evaluateMapper
                )
            )
        },
        html: {
            exclude: (filePath:string):boolean =>
                Helper.normalizePaths(
                    configuration.files.html.concat(
                        configuration.files.defaultHTML
                    ).map((htmlConfiguration:HTMLConfiguration):string =>
                        htmlConfiguration.template.filePath)
                ).includes(filePath) ||
                (
                    (configuration.module.html.exclude === null) ?
                        true :
                        evaluate(configuration.module.html.exclude, filePath)
                ),
            include: configuration.path.source.asset.template,
            test: /\.html(?:\?.*)?$/i,
            use: configuration.module.html.additional.pre.map(evaluateMapper)
                .concat(
                {
                    loader:
                       'file?name=' +
                        path.join(
                            path.relative(
                                configuration.path.target.base,
                                configuration.path.target.asset.template
                            ),
                            `[name].[ext]?${configuration.hashAlgorithm}=` +
                            '[chunkhash]'
                        )
                },
                {loader: 'extract'},
                {
                    loader: configuration.module.html.loader,
                    options: configuration.module.html.options || {}
                },
                configuration.module.html.additional.post.map(evaluateMapper)
            )
        }
    },
    // endregion
    // Load dependencies.
    // region style
    style: {
        exclude: (filePath:string):boolean =>
            (configuration.module.cascadingStyleSheet.exclude === null) ?
                isFilePathInDependencies(filePath) :
                evaluate(
                    configuration.module.cascadingStyleSheet.exclude,
                    filePath
                ),
        include: includingPaths,
        test: /\.s?css(?:\?.*)?$/i,
        use:
            configuration.module.preprocessor.cascadingStyleSheet.additional
                .pre
                .map(evaluateMapper)
                .concat(
                    {
                        loader: configuration.module.style.loader,
                        options: configuration.module.style.options || {}
                    },
                    {
                        loader:
                            configuration.module.cascadingStyleSheet.loader,
                        options:
                            configuration.module.cascadingStyleSheet.options ||
                            {}
                    },
                    {
                        loader:
                            configuration.module.preprocessor
                                .cascadingStyleSheet.loader,
                        options: Tools.extend(true, {postcssOptions: {
                            plugins: [
                                postcssImport({
                                    addDependencyTo: webpack,
                                    root: configuration.path.context
                                })
                            ].concat(
                                configuration.module.preprocessor
                                    .cascadingStyleSheet.additional.plugins.pre
                                    .map(evaluateMapper),
                                /*
                                    NOTE: Checking path doesn't work if fonts
                                    are referenced in libraries provided in
                                    another location than the project itself
                                    like the "node_modules" folder.
                                */
                                postcssFontPath({
                                    checkPath: false,
                                    formats: [
                                        {type: 'woff2', ext: 'woff2'},
                                        {type: 'woff', ext: 'woff'}
                                    ]
                                }),
                                postcssURL({url: 'rebase'}),
                                postcssSprites({
                                    filterBy: ():Promise<void> =>
                                        new Promise((
                                            resolve:Function, reject:Function
                                        ):void => (
                                            configuration.files.compose.image ?
                                                resolve :
                                                reject
                                        )()),
                                    hooks: {onSaveSpritesheet: (
                                        image:Record<string, any>
                                    ):string =>
                                        path.join(
                                            image.spritePath,
                                            path.relative(
                                                configuration.path.target.asset
                                                    .image,
                                                configuration.files.compose
                                                    .image
                                            )
                                        )
                                    },
                                    stylesheetPath:
                                        configuration.path.source.asset
                                            .cascadingStyleSheet,
                                    spritePath:
                                        configuration.path.source.asset.image
                                }),
                                configuration.module.preprocessor
                                    .cascadingStyleSheet.additional.plugins
                                    .post
                                    .map(evaluateMapper),
                                configuration.module.optimizer.cssnano ?
                                    postcssCSSnano(
                                        configuration.module.optimizer.cssnano
                                    ) :
                                    []
                            )
                        }},
                        configuration.module.preprocessor.cascadingStyleSheet
                            .options || {})
                    },
                    configuration.module.preprocessor.cascadingStyleSheet
                        .additional.post
                        .map(evaluateMapper)
                )
    },
    // endregion
    // Optimize loaded assets.
    // region font
    font: {
        eot: {
            exclude: (filePath:string):boolean =>
                (configuration.module.optimizer.font.eot.exclude === null) ?
                    false :
                    evaluate(
                        configuration.module.optimizer.font.eot.exclude,
                        filePath
                    ),
            test: /\.eot(?:\?.*)?$/i,
            use: configuration.module.optimizer.font.eot.additional.pre.map(
                evaluateMapper
            ).concat(
                {
                    loader: configuration.module.optimizer.font.eot.loader,
                    options: configuration.module.optimizer.font.eot.options ||
                        {}
                },
                configuration.module.optimizer.font.eot.additional.post
                    .map(evaluateMapper)
            )
        },
        svg: {
            exclude: (filePath:string):boolean =>
                (configuration.module.optimizer.font.svg.exclude === null) ?
                    false :
                    evaluate(
                        configuration.module.optimizer.font.svg.exclude,
                        filePath
                    ),
            test: /\.svg(?:\?.*)?$/i,
            use: configuration.module.optimizer.font.svg.additional.pre.map(
                evaluateMapper
            ).concat(
                {
                    loader: configuration.module.optimizer.font.svg.loader,
                    options: configuration.module.optimizer.font.svg.options ||
                        {}
                },
                configuration.module.optimizer.font.svg.additional.post
                    .map(evaluateMapper)
            )
        },
        ttf: {
            exclude: (filePath:string):boolean =>
                (configuration.module.optimizer.font.ttf.exclude === null) ?
                    false :
                    evaluate(
                        configuration.module.optimizer.font.ttf.exclude,
                        filePath
                    ),
            test: /\.ttf(?:\?.*)?$/i,
            use: configuration.module.optimizer.font.ttf.additional.pre.map(
                evaluateMapper
            ).concat(
                {
                    loader: configuration.module.optimizer.font.ttf.loader,
                    options: configuration.module.optimizer.font.ttf.options ||
                        {}
                },
                configuration.module.optimizer.font.ttf.additional.post
                    .map(evaluateMapper)
            )
        },
        woff: {
            exclude: (filePath:string):boolean =>
                (configuration.module.optimizer.font.woff.exclude === null) ?
                    false :
                    evaluate(
                        configuration.module.optimizer.font.woff.exclude,
                        filePath
                    ),
            test: /\.woff2?(?:\?.*)?$/i,
            use: configuration.module.optimizer.font.woff.additional.pre
                .map(evaluateMapper)
                .concat(
                    {
                        loader: configuration.module.optimizer.font.woff.loader,
                        options:
                            configuration.module.optimizer.font.woff.options || {}
                    },
                    configuration.module.optimizer.font.woff.additional.post
                        .map(evaluateMapper)
                )
        }
    },
    // endregion
    // region image
    image: {
        exclude: (filePath:string):boolean =>
            (configuration.module.optimizer.image.exclude === null) ?
                isFilePathInDependencies(filePath) :
                evaluate(
                    configuration.module.optimizer.image.exclude, filePath
                ),
        include: configuration.path.source.asset.image,
        test: /\.(?:png|jpg|ico|gif)(?:\?.*)?$/i,
        use: configuration.module.optimizer.image.additional.pre.map(
            evaluateMapper
        ).concat(
            {
                loader: configuration.module.optimizer.image.loader,
                options: configuration.module.optimizer.image.file || {}
            },
            configuration.module.optimizer.image.additional.post
                .map(evaluateMapper)
        )
    },
    // endregion
    // region data
    data: {
        exclude: (filePath:string):boolean =>
            configuration.extensions.file.internal.includes(
                path.extname(Helper.stripLoader(filePath))
            ) ||
            (
                (configuration.module.optimizer.data.exclude === null) ?
                    isFilePathInDependencies(filePath) :
                    evaluate(
                        configuration.module.optimizer.data.exclude, filePath
                    )
            ),
        test: /.+/,
        use: configuration.module.optimizer.data.additional.pre.map(
            evaluateMapper
        ).concat(
            {
                loader: configuration.module.optimizer.data.loader,
                options: configuration.module.optimizer.data.options || {}
            },
            configuration.module.optimizer.data.additional.post
                .map(evaluateMapper)
        )
    }
    // endregion
})
if (
    configuration.files.compose.cascadingStyleSheet && plugins.MiniCSSExtract
) {
    /*
        NOTE: We have to remove the client side javascript hmr style loader
        first.
    */
    loader.style.use.shift()
    loader.style.use.unshift(plugins.MiniCSSExtract.loader)
}
// / endregion
// endregion
for (const pluginConfiguration of configuration.plugins)
    pluginInstances.push(new (eval('require')(pluginConfiguration.name.module)[
        pluginConfiguration.name.initializer
    ])(...pluginConfiguration.parameter))
// region configuration
let customConfiguration:PlainObject = {}
if (configuration.path.configuration?.json)
    try {
        require.resolve(configuration.path.configuration.json)
        try {
            customConfiguration = require(
                configuration.path.configuration.json
            )
        } catch (error) {
            console.debug(
                'Importing provided json webpack configuration file path ' +
                `under "${configuration.path.configuration.json}" failed: ` +
                Tools.represent(error)
            )
        }
    } catch (error) {
        console.debug(
            'Optional configuration file "' +
            `${configuration.path.configuration.json}" not available.`
        )
    }
export let webpackConfiguration:WebpackConfiguration = Tools.extend(
    true,
    {
        bail: true,
        context: configuration.path.context,
        devtool: configuration.development.tool,
        devServer: configuration.development.server,
        // region input
        entry: configuration.injection.entry.normalized,
        externals: configuration.injection.external.modules,
        resolve: {
            alias: configuration.module.aliases,
            aliasFields: configuration.package.aliasPropertyNames,
            extensions: configuration.extensions.file.internal,
            mainFields: configuration.package.main.propertyNames,
            mainFiles: configuration.package.main.fileNames,
            modules: Helper.normalizePaths(
                configuration.module.directoryNames
            ),
            symlinks: false,
            unsafeCache: Boolean(configuration.cache?.unsafe)
        },
        resolveLoader: {
            alias: configuration.loader.aliases,
            aliasFields: configuration.package.aliasPropertyNames,
            extensions: configuration.loader.extensions.file,
            mainFields: configuration.package.main.propertyNames,
            mainFiles: configuration.package.main.fileNames,
            modules: configuration.loader.directoryNames,
            symlinks: false
        },
        // endregion
        // region output
        output: {
            filename: path.relative(
                configuration.path.target.base,
                configuration.files.compose.javaScript
            ),
            hashFunction: configuration.hashAlgorithm,
            library: libraryName,
            libraryTarget: (
                configuration.givenCommandLineArguments[2] === 'build:dll'
            ) ? 'var' : configuration.exportFormat.self,
            path: configuration.path.target.base,
            publicPath: configuration.path.target.public,
            umdNamedDefine: true
        },
        performance: configuration.performanceHints,
        target: configuration.targetTechnology,
        // endregion
        mode: configuration.debug ? 'development' : 'production',
        module: {
            rules: configuration.module.additional.pre.map(
                evaluateAdditionalLoaderConfiguration
            ).concat(
                loader.ejs,
                loader.script,
                loader.html.main, loader.html.ejs, loader.html.html,
                loader.style,
                loader.font.eot, loader.font.svg, loader.font.ttf,
                loader.font.woff,
                loader.image,
                loader.data,
                configuration.module.additional.post.map(
                    evaluateAdditionalLoaderConfiguration)
            )
        },
        node: configuration.nodeEnvironment,
        optimization: {
            minimize: configuration.module.optimizer.minimize,
            minimizer: configuration.module.optimizer.minimizer,
            // region common chunks
            splitChunks: (
                !configuration.injection.chunks ||
                configuration.targetTechnology !== 'web' ||
                ['build:dll', 'test'].includes(
                    configuration.givenCommandLineArguments[2]
                )
            ) ?
                {
                    cacheGroups: {
                        default: false,
                        vendors: false
                    }
                } : Tools.extend(
                    true,
                    {
                        chunks: 'all',
                        cacheGroups: {
                            vendors: {
                                chunks: (
                                    module:Record<string, any>
                                ):boolean => {
                                    if (
                                        typeof configuration.inPlace
                                            .javaScript ===
                                        'object' &&
                                        configuration.inPlace.javaScript !==
                                            null
                                    )
                                        for (const name of Object.keys(
                                            configuration.inPlace.javaScript
                                        ))
                                            if (
                                                name === '*' ||
                                                name === module.name
                                            )
                                                return false
                                    return true
                                },
                                priority: -10,
                                reuseExistingChunk: true,
                                test: /[\\/]node_modules[\\/]/
                            }
                        }
                    },
                    configuration.injection.chunks
                )
            // endregion
        },
        plugins: pluginInstances
    },
    configuration.cache?.main ? {cache: configuration.cache.main} : {},
    configuration.webpack,
    customConfiguration
)
if (
    !Array.isArray(configuration.module.skipParseRegularExpressions) ||
    configuration.module.skipParseRegularExpressions.length
)
    webpackConfiguration.module.noParse =
        configuration.module.skipParseRegularExpressions
if (configuration.path.configuration?.javaScript)
    try {
        require.resolve(configuration.path.configuration.javaScript)
        let result:PlainObject|undefined
        try {
            result = require(configuration.path.configuration.javaScript)
        } catch (error) {
            console.debug(
                'Failed to load given JavaScript configuration file path "' +
                `${configuration.path.configuration.javaScript}": ` +
                Tools.represent(error)
            )
        }
        if (Tools.isPlainObject(result))
            if (Object.prototype.hasOwnProperty.call(
                result, 'replaceWebOptimizer'
            ))
                webpackConfiguration =
                    result.replaceWebOptimizer as
                        unknown as
                        WebpackConfiguration
            else
                Tools.extend(true, webpackConfiguration, result)
    } catch (error) {
        console.debug(
            'Optional configuration file script "' +
            `${configuration.path.configuration.javaScript}" not available.`
        )
    }
if (configuration.showConfiguration) {
    console.info(
        'Using internal configuration:',
        util.inspect(configuration, {depth: null})
    )
    console.info('-----------------------------------------------------------')
    console.info(
        'Using webpack configuration:',
        util.inspect(webpackConfiguration, {depth: null})
    )
}
// endregion
export default webpackConfiguration
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
