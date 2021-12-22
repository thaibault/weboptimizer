// #!/usr/bin/env babel-node
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
import Tools, {currentRequire, optionalRequire} from 'clientnode'
import {
    EvaluationResult, Mapping, PlainObject, Unpacked
} from 'clientnode/type'
const postcssCSSnano:null|typeof import('cssnano') =
    optionalRequire<typeof import('cssnano')>('cssnano')
import HTMLPlugin from 'html-webpack-plugin'
import {JSDOM as DOM} from 'jsdom'
import {extname, join, relative, resolve} from 'path'
import {Transformer as PostcssTransformer} from 'postcss'
const postcssFontpath =
    optionalRequire<typeof import('postcss-fontpath').default>(
        'postcss-fontpath'
    )
const postcssImport =
    optionalRequire<typeof import('postcss-import')>('postcss-import')
const postcssSprites =
    optionalRequire<typeof import('postcss-sprites').default>(
        'postcss-sprites'
    )
const postcssURL =
    optionalRequire<typeof import('postcss-url')>('postcss-url')
import util from 'util'
import {
    Chunk,
    Compiler,
    Compilation,
    ContextReplacementPlugin,
    DefinePlugin,
    HotModuleReplacementPlugin,
    IgnorePlugin,
    LoaderContext,
    NormalModuleReplacementPlugin,
    ProvidePlugin,
    RuleSetRule,
    sources
} from 'webpack'
import {RawSource as WebpackRawSource} from 'webpack-sources'
import {
    InjectManifestOptions as WorkboxInjectManifestOptions
} from 'workbox-webpack-plugin'

import loadConfiguration from './configurator'
import Helper from './helper'
import ejsLoader, {
    LoaderConfiguration as EJSLoaderConfiguration
} from './ejsLoader'
import {
    AdditionalLoaderConfiguration,
    AssetPathConfiguration,
    EvaluationScope,
    GenericLoader,
    HTMLConfiguration,
    HTMLWebpackPluginBeforeEmitData,
    IgnorePattern,
    InPlaceAssetConfiguration,
    InPlaceConfiguration,
    Loader,
    PackageDescriptor,
    RedundantRequest,
    ResolvedConfiguration,
    RuleSet,
    WebpackAssets,
    WebpackBaseAssets,
    WebpackConfiguration,
    WebpackExtendedResolveData,
    WebpackLoader,
    WebpackLoaderConfiguration,
    WebpackLoaderIndicator,
    WebpackPlugin,
    WebpackPlugins,
    WebpackResolveData
} from './type'

const pluginNameResourceMapping:Mapping = {
    HTML: 'html-webpack-plugin',
    MiniCSSExtract: 'mini-css-extract-plugin',
    Favicon: 'favicons-webpack-plugin',
    ImageMinimizer: 'image-minimizer-webpack-plugin',
    Offline: 'workbox-webpack-plugin',
    Terser: 'terser-webpack-plugin'
}

const plugins:WebpackPlugins = {}
for (const name in pluginNameResourceMapping)
    if (
        Object.prototype.hasOwnProperty.call(pluginNameResourceMapping, name)
    ) {
        const plugin:null|WebpackPlugin =
            optionalRequire(pluginNameResourceMapping[name])
        if (plugin)
            plugins[name] = plugin
        else
            console.debug(`Optional webpack plugin "${name}" not available.`)
    }
if (plugins.Offline) {
    plugins.GenerateServiceWorker = plugins.Offline.GenerateSW
    plugins.InjectManifest = plugins.Offline.InjectManifest
}
// endregion
const configuration:ResolvedConfiguration = loadConfiguration()
const module:ResolvedConfiguration['module'] = configuration.module
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
const pluginInstances:WebpackConfiguration['plugins'] = []
// // region define modules to ignore
for (const pattern of ([] as Array<IgnorePattern>).concat(
    configuration.injection.ignorePattern
)) {
    if (typeof (pattern as {contextRegExp:string}).contextRegExp === 'string')
        (pattern as {contextRegExp:RegExp}).contextRegExp =
            new RegExp((pattern as {contextRegExp:string}).contextRegExp)

    if (
        typeof (pattern as {resourceRegExp:string}).resourceRegExp ===
            'string'
    )
        (pattern as {resourceRegExp:RegExp}).resourceRegExp =
            new RegExp((pattern as {resourceRegExp:string}).resourceRegExp)

    pluginInstances.push(new IgnorePlugin(pattern as IgnorePlugin['options']))
}
// // endregion
// // region define modules to replace
for (const source in module.replacements.normal)
    if (Object.prototype.hasOwnProperty.call(
        module.replacements.normal, source
    )) {
        const search = new RegExp(source)
        pluginInstances.push(new NormalModuleReplacementPlugin(
            search,
            (resource:{request:string}):void => {
                resource.request = resource.request.replace(
                    search, module.replacements.normal[source]
                )
            }
        ))
    }
// // endregion
// // region generate html file
let htmlAvailable = false
for (const htmlConfiguration of configuration.files.html)
    if (Tools.isFileSync(htmlConfiguration.template.filePath)) {
        pluginInstances.push(new plugins.HTML!({
            ...htmlConfiguration,
            template: htmlConfiguration.template.request
        }))
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
                const matches:Array<string> =
                    Object.keys(configuration.inPlace[type])
                if (!Array.isArray(configuration.offline.common.excludeChunks))
                    configuration.offline.common.excludeChunks = []
                for (const name of matches)
                    configuration.offline.common.excludeChunks.push(
                        relative(
                            configuration.path.target.base,
                            configuration.path.target.asset[
                                type as keyof AssetPathConfiguration
                            ]
                        ) +
                        `${name}.${extension}?${configuration.hashAlgorithm}=*`
                    )
            }
        }

    if (
        ([] as Array<string>)
            .concat(configuration.offline.use)
            .includes('injectionManifest')
    )
        pluginInstances.push(new plugins.InjectManifest!(
            Tools.extend<WorkboxInjectManifestOptions>(
                true,
                configuration.offline.common,
                configuration.offline.injectionManifest
            )
        ))
    if (
        ([] as Array<string>)
            .concat(configuration.offline.use)
            .includes('generateServiceWorker')
    )
        pluginInstances.push(new plugins.GenerateServiceWorker!(Tools.extend(
            true,
            configuration.offline.common,
            configuration.offline.serviceWorker
        )))
}
// // endregion
// // region provide build environment
if (configuration.buildContext.definitions)
    pluginInstances.push(
        new DefinePlugin(configuration.buildContext.definitions)
    )
if (module.provide)
    pluginInstances.push(new ProvidePlugin(module.provide))
// // endregion
// // region modules/assets
// /// region apply module pattern
pluginInstances.push({apply: (compiler:Compiler):void => {
    compiler.hooks.emit.tap(
        'applyModulePattern',
        (compilation:Compilation):void => {
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
                        const source:Buffer|string =
                            compilation.assets[request].source()
                        if (typeof source === 'string')
                            compilation.assets[request] = new WebpackRawSource(
                                configuration.assetPattern[type].pattern
                                    .replace(
                                        /\{1\}/g, source.replace(/\$/g, '$$$')
                                    )
                            ) as unknown as sources.Source
                    }
                }
        }
    )
}})
// /// endregion
// /// region in-place configured assets in the main html file
/*
    TODO

    /
        NOTE: We have to translate template delimiter to html compatible
        sequences and translate it back later to avoid unexpected escape
        sequences in resulting html.
    /
    const window:DOMWindow = (new DOM(
        content
            .replace(/<%/g, '##+#+#+##')
            .replace(/%>/g, '##-#-#-##')
    )).window

    ->

    .replace(/##\+#\+#\+##/g, '<%')
    .replace(/##-#-#-##/g, '%>')
*/

if (
    htmlAvailable &&
    !['serve', 'test:browser']
        .includes(configuration.givenCommandLineArguments[2]) &&
    configuration.inPlace.cascadingStyleSheet &&
    Object.keys(configuration.inPlace.cascadingStyleSheet).length ||
    configuration.inPlace.javaScript &&
    Object.keys(configuration.inPlace.javaScript).length
)
    pluginInstances.push({apply: (compiler:Compiler):void => {
        let publicPath:string =
            compiler.options.output.publicPath as string || ''
        if (publicPath && !publicPath.endsWith('/'))
            publicPath += '/'

        compiler.hooks.compilation.tap(
            'inPlaceHTMLAssets',
            (compilation:Compilation):void => {
                const hooks:HTMLPlugin.Hooks =
                    plugins.HTML!.getHooks(compilation)
                const inPlacedAssetNames:Array<string> = []

                hooks.alterAssetTagGroups.tap(
                    'inPlaceHTMLAssets',
                    (assets:WebpackAssets):WebpackAssets => {
                        const inPlace = (
                            type:keyof InPlaceAssetConfiguration,
                            tag:HTMLPlugin.HtmlTagObject
                        ):HTMLPlugin.HtmlTagObject => {
                            let settings:InPlaceAssetConfiguration|undefined
                            let url:boolean|null|string|undefined = false
                            if (tag.tagName === 'script') {
                                settings = configuration.inPlace.javaScript
                                url = tag.attributes.src
                            } else if (tag.tagName === 'style') {
                                settings =
                                    configuration.inPlace.cascadingStyleSheet
                                url = tag.attributes.href
                            }
                            if (!(url && typeof url === 'string'))
                                return tag

                            const name:string =
                                publicPath ? url.replace(publicPath, '') : url

                            if (
                                compilation.assets[name] &&
                                settings![type] &&
                                ([] as Array<RegExp|string>)
                                    .concat(
                                        settings![type] as Array<RegExp|string>
                                    )
                                    .some((pattern:RegExp|string):boolean =>
                                        (new RegExp(pattern)).test(name)
                                    )
                            ) {
                                const newAttributes:HTMLPlugin.HtmlTagObject[
                                    'attributes'
                                ] = {...tag.attributes}
                                delete newAttributes.href
                                delete newAttributes.src

                                inPlacedAssetNames.push(name)
                                return {
                                    ...tag,
                                    attributes: newAttributes,
                                    innerHTML:
                                        compilation.assets[name].source() as
                                            string,
                                    tagName: 'script'
                                }
                            }

                            return tag
                        }
                        assets.headTags =
                            assets.headTags.map(inPlace.bind(this, 'head'))
                        assets.bodyTags =
                            assets.bodyTags.map(inPlace.bind(this, 'body'))

                        return assets
                    }
                )

                // NOTE: Avoid if you still want to emit the runtime chunks:
                hooks.afterEmit.tap(
                    'inPlaceHTMLAssets',
                    (asset:WebpackBaseAssets):WebpackBaseAssets => {
                        for (const name of inPlacedAssetNames)
                            delete compilation.assets[name]
                        return asset
                    }
                )
            }
        )
    }})
// /// endregion
// /// region mark empty javaScript modules as dummy
if (!(
    configuration.needed.javaScript ||
    configuration.needed.javaScriptExtension ||
    configuration.needed.typeScript ||
    configuration.needed.typeScriptExtension
))
    configuration.files.compose.javaScript = resolve(
        configuration.path.target.asset.javaScript, '.__dummy__.compiled.js'
    )
// /// endregion
// /// region extract cascading style sheets
if (configuration.files.compose.cascadingStyleSheet && plugins.MiniCSSExtract)
    pluginInstances.push(new plugins.MiniCSSExtract({
        filename: relative(
            configuration.path.target.base,
            configuration.files.compose.cascadingStyleSheet
        )
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
        {context, request},
        callback:(
            _error?:Error|undefined,
            _result?:Array<string>|boolean|string|Mapping<unknown>,
            _type?:string
        ) => void
    ):void => {
        if (typeof request !== 'string')
            return callback()

        request = request.replace(/^!+/, '')
        if (request.startsWith('/'))
            request = relative(configuration.path.context, request)

        for (const filePath of module.directoryNames)
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
            module.directoryNames,
            configuration.package.main.fileNames,
            configuration.package.main.propertyNames,
            configuration.package.aliasPropertyNames,
            configuration.encoding
        )

        if (filePath)
            for (const [pattern, targetConfiguration] of Object.entries(
                configuration.injection.external.aliases
            ))
                if (pattern.startsWith('^')) {
                    const regularExpression = new RegExp(pattern)
                    if (regularExpression.test(filePath)) {
                        let match = false

                        const firstKey:string =
                            Object.keys(targetConfiguration)[0]
                        let target:string =
                            (targetConfiguration as Mapping)[firstKey]

                        if (typeof target !== 'string')
                            break

                        const replacementRegularExpression =
                            new RegExp(firstKey)

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
                                    module.directoryNames,
                                    configuration.package.main.fileNames,
                                    configuration.package.main.propertyNames,
                                    configuration.package.aliasPropertyNames,
                                    configuration.encoding
                                ))
                        } else
                            match = true

                        if (match) {
                            request = request.replace(
                                replacementRegularExpression, target
                            )

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
            module.directoryNames,
            module.aliases,
            module.replacements.normal,
            configuration.extensions,
            configuration.path.source.asset.base,
            configuration.path.ignore,
            module.directoryNames,
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
            const keys:Array<string> = ['amd', 'commonjs', 'commonjs2', 'root']
            let result:(Mapping & {root?:Array<string>})|string =
                resolvedRequest
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
                            ] as (_request:string, _key:string) => string
                        )(request, key)
                else if (
                    configuration.injection.external.aliases[
                        request
                    ] !== null &&
                    typeof configuration.injection.external.aliases[
                        request
                    ] === 'object'
                )
                    Tools.extend<Mapping>(
                        result as Mapping,
                        configuration.injection.external.aliases[request] as
                            Mapping
                    )

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
                    .concat(result.root!)
                    .map((name:string):string =>
                        Tools.stringConvertToValidVariableName(name)
                    )
            const exportFormat:string = (
                configuration.exportFormat.external ||
                configuration.exportFormat.self
            )

            return callback(
                undefined,
                (
                    exportFormat === 'umd' || typeof result === 'string' ?
                        result :
                        result[exportFormat]
                ) as Array<string>|boolean|string|Mapping<unknown>,
                exportFormat
            )
        }

        return callback()
    }
// /// endregion
// // endregion
// // region apply final cascadingStyleSheet/dom/javaScript modifications/fixes
if (htmlAvailable)
    pluginInstances.push({apply: (
        compiler:Compiler
    ):void => compiler.hooks.compilation.tap('WebOptimizer', (
        compilation:Compilation
    ):void => {
        plugins.HTML!.getHooks(compilation).beforeEmit.tap(
            'WebOptimizerPostProcessHTML',
            (
                data:HTMLWebpackPluginBeforeEmitData
            ):HTMLWebpackPluginBeforeEmitData => {
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
                    return data
                }
                const linkables:Mapping = {link: 'href', script: 'src'}
                for (const tagName in linkables)
                    if (Object.prototype.hasOwnProperty.call(
                        linkables, tagName
                    ))
                        for (const domNode of Array.from<HTMLElement>(
                            dom.window.document.querySelectorAll<HTMLElement>(
                                `${tagName}[${linkables[tagName]}*="?` +
                                `${configuration.hashAlgorithm}="]`
                            )
                        ))
                            /*
                                NOTE: Removing symbols after a "&" in hash
                                string is necessary to match the generated
                                request strings in offline plugin.
                            */
                            domNode.setAttribute(
                                linkables[tagName],
                                domNode
                                    .getAttribute(linkables[tagName])!
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
                            match:string, startTag:string, endTag:string
                        ):string =>
                            `${startTag}${styleContents.shift() as string}` +
                            endTag
                    )
                // region post compilation
                for (const htmlFileSpecification of configuration.files.html)
                    if (htmlFileSpecification.filename === (
                        data.plugin as
                            unknown as
                            {options:HTMLPlugin.ProcessedOptions}
                    ).options.filename) {
                        for (const loaderConfiguration of (
                            [] as Array<WebpackLoader>
                        ).concat(htmlFileSpecification.template.use))
                            if (
                                loaderConfiguration.options?.compileSteps &&
                                typeof loaderConfiguration.options
                                    .compileSteps === 'number'
                            )
                                data.html = ejsLoader.bind({
                                    query: Tools.extend(
                                        true,
                                        loaderConfiguration.options || {},
                                        htmlFileSpecification.template
                                            .postCompileOptions
                                    )
                                } as LoaderContext<EJSLoaderConfiguration>)(
                                    data.html
                                )

                        break
                    }
                // endregion
                return data
            }
        )
    })})
// // endregion
// // region context replacements
for (const contextReplacement of module.replacements.context)
    pluginInstances.push(new ContextReplacementPlugin(...(
        contextReplacement.map((value:string):string => {
            const evaluated:EvaluationResult = Tools.stringEvaluate(
                value, {configuration, __dirname, __filename}
            )
            if (evaluated.error)
                throw new Error(
                    'Error occurred during processing given context ' +
                    `replacement: ${evaluated.error}`
                )

            return evaluated.result
        }) as [string, string]
    )))
// // endregion
// // region consolidate duplicated module requests
/*
    NOTE: Redundancies usually occur when symlinks aren't converted to their
    real paths since real paths can be de-duplicated by webpack but if two
    linked modules share the same transitive dependency webpack wont recognize
    them as same dependency.
*/
if (module.enforceDeduplication) {
    const absoluteContextPath:string = resolve(configuration.path.context)

    const consolidator = (result:WebpackExtendedResolveData):void => {
        const targetPath:string = result.createData.resource

        if (
            targetPath &&
            /((?:^|\/)node_modules\/.+)/.test(targetPath) &&
            (
                !targetPath.startsWith(absoluteContextPath) ||
                /((?:^|\/)node_modules\/.+){2}/.test(targetPath)
            ) &&
            Tools.isFileSync(targetPath)
        ) {
            const packageDescriptor:null|PackageDescriptor =
                Helper.getClosestPackageDescriptor(targetPath)
            if (packageDescriptor) {
                let pathPrefixes:Array<string>
                let pathSuffix:string
                if (targetPath.startsWith(absoluteContextPath)) {
                    const matches:null|RegExpMatchArray =
                        targetPath.match(/((?:^|.*?\/)node_modules\/)/g)
                    if (matches === null)
                        return

                    pathPrefixes = Array.from(matches)
                    /*
                        Remove last one to avoid replacing with the already set
                        path.
                    */
                    pathPrefixes.pop()
                    let index = 0
                    for (const pathPrefix of pathPrefixes) {
                        if (index > 0)
                            pathPrefixes[index] = resolve(
                                pathPrefixes[index - 1], pathPrefix
                            )

                        index += 1
                    }

                    pathSuffix = targetPath.replace(
                        /(?:^|.*\/)node_modules\/(.+$)/, '$1'
                    )
                } else {
                    pathPrefixes = [
                        resolve(absoluteContextPath, 'node_modules')
                    ]
                    // Find longest common prefix.
                    let index = 0
                    while (
                        index < absoluteContextPath.length &&
                        absoluteContextPath.charAt(index) ===
                            targetPath.charAt(index)
                    )
                        index += 1

                    pathSuffix = targetPath
                        .substring(index)
                        .replace(/^.*\/node_modules\//, '')
                }

                let redundantRequest:null|RedundantRequest = null
                for (const pathPrefix of pathPrefixes) {
                    const alternateTargetPath:string =
                        resolve(pathPrefix, pathSuffix)

                    if (Tools.isFileSync(alternateTargetPath)) {
                        const otherPackageDescriptor:null|PackageDescriptor =
                            Helper.getClosestPackageDescriptor(
                                alternateTargetPath
                            )
                        if (otherPackageDescriptor) {
                            if (
                                packageDescriptor.configuration.version ===
                                otherPackageDescriptor.configuration.version
                            ) {
                                console.info(
                                    '\nConsolidate module request "' +
                                    `${targetPath}" to "` +
                                    `${alternateTargetPath}".`
                                )
                                /*
                                    NOTE: Only overwriting
                                    "result.createData.resource" like
                                    implemented in
                                    "NormaleModuleReplacementPlugin" does
                                    not always work.
                                */
                                result.request =
                                result.createData.rawRequest =
                                result.createData.request =
                                result.createData.resource =
                                result.createData.userRequest =
                                    alternateTargetPath

                                return
                            }

                            redundantRequest = {
                                path: alternateTargetPath,
                                version:
                                    otherPackageDescriptor.configuration
                                        .version
                            }
                        }
                    }
                }
                if (redundantRequest)
                    console.warn(
                        '\nIncluding different versions of same package "' +
                        `${packageDescriptor.configuration.name}". Module "` +
                        `${targetPath}" (version ` +
                        `${packageDescriptor.configuration.version}) has ` +
                        `redundancies with "${redundantRequest.path}" (` +
                        `version ${redundantRequest.version}).`
                    )
            }
        }
    }
    pluginInstances.push({apply: (compiler:Compiler) =>
        compiler.hooks.normalModuleFactory.tap(
            'WebOptimizerModuleConsolidation',
            (nmf:ReturnType<Compiler['createNormalModuleFactory']>):void =>
                nmf.hooks.afterResolve.tap(
                    'WebOptimizerModuleConsolidation',
                    consolidator as (_result:WebpackResolveData) => void
                )
        )
    })
}
/*
new NormalModuleReplacementPlugin(
    /.+/,
    (result:{
        context:string
        createData:{resource:string}
        request:string
    }):void => {
        const isResource:boolean = Boolean(result.createData.resource)
        const targetPath:string = isResource ?
            result.createData.resource :
            resolve(result.context, result.request)
        if (
            targetPath &&
            /((?:^|\/)node_modules\/.+){2}/.test(targetPath) &&
            Tools.isFileSync(targetPath)
        ) {
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
                let index:number = 0
                for (const pathPrefix of pathPrefixes) {
                    if (index > 0)
                        pathPrefixes[index] =
                            resolve(pathPrefixes[index - 1], pathPrefix)
                    index += 1
                }
                const pathSuffix:string =
                    targetPath.replace(/(?:^|.*\/)node_modules\/(.+$)/, '$1')
                let redundantRequest:null|PlainObject = null
                for (const pathPrefix of pathPrefixes) {
                    const alternateTargetPath:string =
                        resolve(pathPrefix, pathSuffix)
                    if (Tools.isFileSync(alternateTargetPath)) {
                        const otherPackageDescriptor:null|PackageDescriptor =
                            Helper.getClosestPackageDescriptor(
                                alternateTargetPath
                            )
                        if (otherPackageDescriptor) {
                            if (
                                packageDescriptor.configuration.version ===
                                otherPackageDescriptor.configuration.version
                            ) {
                                console.info(
                                    '\nConsolidate module request "' +
                                    `${targetPath}" to "` +
                                    `${alternateTargetPath}".`
                                )
                                result.createData.resource =
                                    alternateTargetPath
                                result.request = alternateTargetPath
                                return
                            }
                            redundantRequest = {
                                path: alternateTargetPath,
                                version:
                                    otherPackageDescriptor.configuration
                                        .version
                            }
                        }
                    }
                }
                if (redundantRequest)
                    console.warn(
                        '\nIncluding different versions of same package "' +
                        `${packageDescriptor.configuration.name}". Module "` +
                        `${targetPath}" (version ` +
                        `${packageDescriptor.configuration.version}) has ` +
                        `redundancies with "${redundantRequest.path}" (` +
                        `version ${redundantRequest.version}).`
                    )
            }
        }
    }
))*/
// // endregion
// / endregion
// / region loader helper
const isFilePathInDependencies = (filePath:string):boolean => {
    filePath = Helper.stripLoader(filePath)

    return Helper.isFilePathInLocation(
        filePath,
        configuration.path.ignore
            .concat(module.directoryNames, configuration.loader.directoryNames)
            .map((filePath:string):string =>
                resolve(configuration.path.context, filePath)
            )
            .filter((filePath:string):boolean =>
                !configuration.path.context.startsWith(filePath)
            )
    )
}

const loader:Loader = {} as unknown as Loader

const scope:EvaluationScope = {
    configuration,
    isFilePathInDependencies,
    loader,
    require: eval('require') as typeof require
}

const evaluate = <T = unknown>(
    object:unknown, filePath:string = configuration.path.context
):T => {
    if (typeof object === 'string') {
        const evaluated:EvaluationResult<T> =
            Tools.stringEvaluate<T>(object, {filePath, ...scope})

        if (evaluated.error)
            throw new Error(
                'Error occurred during processing given expression: ' +
                evaluated.error
            )

        return evaluated.result
    }

    return object as T
}
const evaluateMapper = <T = unknown>(value:unknown):T => evaluate<T>(value)
const evaluateAdditionalLoaderConfiguration = (
    loaderConfiguration:AdditionalLoaderConfiguration
):WebpackLoaderConfiguration => ({
    exclude: (filePath:string):boolean =>
        Boolean(evaluate(loaderConfiguration.exclude, filePath)),
    include:
        loaderConfiguration.include &&
        evaluate<WebpackLoaderIndicator>(loaderConfiguration.include) ||
        configuration.path.source.base,
    test: new RegExp(evaluate<string>(loaderConfiguration.test)),
    use: evaluate<Array<WebpackLoader>|WebpackLoader>(loaderConfiguration.use)
})

const includingPaths:Array<string> =
    Helper.normalizePaths(
        [configuration.path.source.asset.javaScript]
            .concat(module.locations.directoryPaths)
    )

const cssUse:RuleSet = module.preprocessor.cascadingStyleSheet.additional.pre
    .map(evaluateMapper)
    .concat(
        {loader: module.style.loader, options: module.style.options || {}},
        {
            loader: module.cascadingStyleSheet.loader,
            options: module.cascadingStyleSheet.options || {}
        },
        module.preprocessor.cascadingStyleSheet.loader ?
            {
                loader: module.preprocessor.cascadingStyleSheet.loader,
                options: Tools.extend(
                    true,
                    optionalRequire('postcss') ?
                        {postcssOptions: {
                            /*
                                NOTE: Some plugins like "postcss-import" are
                                not yet ported to postcss 8. Let the final
                                consumer decide which distribution suites most.
                            */
                            plugins: ([] as Array<PostcssTransformer>).concat(
                                postcssImport ?
                                    postcssImport({
                                        root: configuration.path.context
                                    }) as unknown as PostcssTransformer :
                                    [],
                                module.preprocessor
                                    .cascadingStyleSheet.additional.plugins.pre
                                    .map(evaluateMapper) as
                                        Array<PostcssTransformer>,
                                /*
                                    NOTE: Checking path doesn't work if fonts
                                    are referenced in libraries provided in
                                    another location than the project itself
                                    like the "node_modules" folder.
                                */
                                postcssFontpath ?
                                    postcssFontpath({
                                        checkPath: false,
                                        formats: [
                                            {ext: 'woff2', type: 'woff2'},
                                            {ext: 'woff', type: 'woff'}
                                        ]
                                    }) :
                                    [],
                                postcssURL ?
                                    postcssURL({url: 'rebase'}) as
                                        unknown as
                                        PostcssTransformer :
                                    [],
                                postcssSprites ?
                                    postcssSprites({
                                        filterBy: ():Promise<void> =>
                                            new Promise<void>((
                                                resolve:() => void,
                                                reject:() => void
                                            ):void => (
                                                configuration.files.compose
                                                    .image ?
                                                    resolve :
                                                    reject
                                            )()),
                                        hooks: {
                                            onSaveSpritesheet: (
                                                image:Mapping
                                            ):string =>
                                                join(
                                                    image.spritePath,
                                                    relative(
                                                        configuration.path
                                                            .target.asset
                                                            .image,
                                                        configuration.files
                                                            .compose.image
                                                    )
                                                )
                                        },
                                        stylesheetPath:
                                            configuration.path.source.asset
                                                .cascadingStyleSheet,
                                        spritePath:
                                            configuration.path.source.asset
                                                .image
                                    }) :
                                    [],
                                module.preprocessor
                                    .cascadingStyleSheet.additional.plugins
                                    .post.map(evaluateMapper) as
                                        Array<PostcssTransformer>,
                                (module.optimizer.cssnano && postcssCSSnano) ?
                                    postcssCSSnano(
                                        module.optimizer.cssnano
                                    ) as unknown as PostcssTransformer :
                                    []
                            )
                        }} :
                        {},
                    module.preprocessor.cascadingStyleSheet.options || {}
                )} :
            [],
        module.preprocessor.cascadingStyleSheet.additional.post
            .map(evaluateMapper)
    ) as RuleSet

const genericLoader:GenericLoader = {
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
            (module.preprocessor.ejs.exclude === null) ?
                false :
                Boolean(evaluate(module.preprocessor.ejs.exclude, filePath)),
        include: includingPaths,
        test: /^(?!.+\.html\.ejs$).+\.ejs$/i,
        use: module.preprocessor.ejs.additional.pre
            .map(evaluateMapper)
            .concat(
                {
                    loader: 'file?name=[path][name]' +
                        (
                            (
                                Tools.isPlainObject(
                                    module.preprocessor.ejs.options
                                ) ?
                                    module.preprocessor.ejs.options as
                                        EJSLoaderConfiguration :
                                    {compileSteps: 2}
                            ).compileSteps % 2 ? '.js' : ''
                        ) +
                        `?${configuration.hashAlgorithm}=[chunkhash]`
                },
                {loader: 'extract'},
                {
                    loader: module.preprocessor.ejs.loader,
                    options: module.preprocessor.ejs.options || {}
                },
                module.preprocessor.ejs.additional.post.map(evaluateMapper)
            ) as RuleSet
    },
    // endregion
    // region script
    script: {
        exclude: (filePath:string):boolean =>
            Boolean(evaluate(
                module.preprocessor.javaScript.exclude, filePath
            )),
        include: (filePath:string):boolean => {
            const result:unknown =
                evaluate(module.preprocessor.javaScript.include, filePath)
            if ([null, undefined].includes(result as null)) {
                for (const includePath of includingPaths)
                    if (filePath.startsWith(includePath))
                        return true

                return false
            }

            return Boolean(result)
        },
        test: new RegExp(
            module.preprocessor.javaScript.regularExpression, 'i'
        ),
        use: module.preprocessor.javaScript.additional.pre
            .map(evaluateMapper)
            .concat(
                {
                    loader: module.preprocessor.javaScript.loader,
                    options: module.preprocessor.javaScript.options || {}
                },
                module.preprocessor.javaScript.additional.post
                    .map(evaluateMapper)
            ) as RuleSet
    },
    // endregion
    // region html template
    html: {
        // NOTE: This is only for the main entry template.
        main: {
            test: new RegExp(
                '^' +
                Tools.stringEscapeRegularExpressions(
                    configuration.files.defaultHTML.template.filePath
                ) +
                '(?:\\?.*)?$'
            ),
            use: configuration.files.defaultHTML.template.use
        },
        ejs: {
            exclude:
                (filePath:string):boolean => Helper.normalizePaths(
                    configuration.files.html
                        .concat(configuration.files.defaultHTML)
                        .map((htmlConfiguration:HTMLConfiguration):string =>
                            htmlConfiguration.template.filePath
                        )
                ).includes(filePath) ||
                ((module.preprocessor.html.exclude === null) ?
                    false :
                    Boolean(evaluate(
                        module.preprocessor.html.exclude, filePath
                    ))
                ),
            include: configuration.path.source.asset.template,
            test: /\.html\.ejs(?:\?.*)?$/i,
            use: module.preprocessor.html.additional.pre
                .map(evaluateMapper)
                .concat(
                    {
                        loader:
                            'file?name=' +
                            join(
                                relative(
                                    configuration.path.target.asset.base,
                                    configuration.path.target.asset.template
                                ),
                                '[name]' +
                                (
                                    (
                                        Tools.isPlainObject(
                                            module.preprocessor.html.options
                                        ) ?
                                            module.preprocessor.html.options as
                                                EJSLoaderConfiguration :
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
                                module.preprocessor.html.options
                            ) ?
                                module.preprocessor.html.options as
                                    EJSLoaderConfiguration :
                                {compileSteps: 2}
                        ).compileSteps % 2 ?
                            [] :
                            [
                                {loader: 'extract'},
                                {
                                    loader: module.html.loader,
                                    options: module.html.options || {}
                                }
                            ]
                    ),
                    {
                        loader: module.preprocessor.html.loader,
                        options: module.preprocessor.html.options || {}
                    },
                    module.preprocessor.html.additional.post
                        .map(evaluateMapper)
                ) as RuleSet
        },
        html: {
            exclude: (filePath:string):boolean =>
                Helper.normalizePaths(
                    configuration.files.html
                        .concat(configuration.files.defaultHTML)
                        .map((htmlConfiguration:HTMLConfiguration):string =>
                            htmlConfiguration.template.filePath
                        )
                ).includes(filePath) ||
                (
                    (module.html.exclude === null) ?
                        true :
                        Boolean(evaluate(module.html.exclude, filePath))
                ),
            include: configuration.path.source.asset.template,
            test: /\.html(?:\?.*)?$/i,
            use: module.html.additional.pre
                .map(evaluateMapper)
                .concat(
                    {
                        loader:
                           'file?name=' +
                            join(
                                relative(
                                    configuration.path.target.base,
                                    configuration.path.target.asset.template
                                ),
                                `[name][ext]?${configuration.hashAlgorithm}=` +
                                '[chunkhash]'
                            )
                    },
                    {loader: 'extract'},
                    {
                        loader: module.html.loader,
                        options: module.html.options || {}
                    },
                    module.html.additional.post.map(evaluateMapper)
                ) as RuleSet
        }
    },
    // endregion
    // Load dependencies.
    // region style
    style: {
        exclude: (filePath:string):boolean =>
            (module.cascadingStyleSheet.exclude === null) ?
                isFilePathInDependencies(filePath) :
                Boolean(evaluate(
                    module.cascadingStyleSheet.exclude, filePath
                )),
        include: (filePath:string):boolean => {
            const result:unknown = evaluate(
                module.cascadingStyleSheet.include, filePath
            )
            if ([null, undefined].includes(result as null)) {
                for (const includePath of includingPaths)
                    if (filePath.startsWith(includePath))
                        return true

                return false
            }

            return Boolean(result)
        },
        test: /\.s?css(?:\?.*)?$/i,
        use: cssUse
    },
    // endregion
    // Optimize loaded assets.
    // region font
    font: {
        eot: {
            exclude: (filePath:string):boolean =>
                (module.optimizer.font.eot.exclude === null) ?
                    false :
                    Boolean(evaluate(
                        module.optimizer.font.eot.exclude, filePath
                    )),
            generator: {
                filename:
                    join(
                        relative(
                            configuration.path.target.base,
                            configuration.path.target.asset.font
                        ),
                        '[name][ext]'
                    ) +
                    `?${configuration.hashAlgorithm}=[chunkhash]`
            },
            test: /\.eot(?:\?.*)?$/i,
            type: 'asset/resource',
            parser: {
                dataUrlCondition: {
                    maxSize:
                        configuration.inPlace.otherMaximumFileSizeLimitInByte
                }
            },
            use: module.optimizer.font.eot.loader.map(evaluateMapper) as
                RuleSet
        },
        svg: {
            exclude: (filePath:string):boolean =>
                (module.optimizer.font.svg.exclude === null) ?
                    false :
                    Boolean(evaluate(
                        module.optimizer.font.svg.exclude, filePath
                    )),
            include: configuration.path.source.asset.font,
            generator: {
                filename:
                    join(
                        relative(
                            configuration.path.target.base,
                            configuration.path.target.asset.font
                        ),
                        '[name][ext]'
                    ) +
                    `?${configuration.hashAlgorithm}=[chunkhash]`
            },
            mimetype: 'image/svg+xml',
            parser: {
                dataUrlCondition: {
                    maxSize:
                        configuration.inPlace.otherMaximumFileSizeLimitInByte
                }
            },
            test: /\.svg(?:\?.*)?$/i,
            type: 'asset/resource',
            use: module.optimizer.font.svg.loader.map(evaluateMapper) as
                RuleSet
        },
        ttf: {
            exclude: (filePath:string):boolean =>
                (module.optimizer.font.ttf.exclude === null) ?
                    false :
                    Boolean(evaluate(
                        module.optimizer.font.ttf.exclude, filePath
                    )),
            generator: {
                filename:
                    join(
                        relative(
                            configuration.path.target.base,
                            configuration.path.target.asset.font
                        ),
                        '[name][ext]'
                    ) +
                    `?${configuration.hashAlgorithm}=[chunkhash]`
            },
            test: /\.ttf(?:\?.*)?$/i,
            type: 'asset/resource',
            mimetype: 'application/octet-stream',
            parser: {
                dataUrlCondition: {
                    maxSize:
                        configuration.inPlace.otherMaximumFileSizeLimitInByte
                }
            },
            use: module.optimizer.font.ttf.loader.map(evaluateMapper) as
                RuleSet
        },
        woff: {
            exclude: (filePath:string):boolean =>
                (module.optimizer.font.woff.exclude === null) ?
                    false :
                    Boolean(evaluate(
                        module.optimizer.font.woff.exclude, filePath
                    )),
            generator: {
                filename:
                    join(
                        relative(
                            configuration.path.target.base,
                            configuration.path.target.asset.font
                        ),
                        '[name][ext]'
                    ) +
                    `?${configuration.hashAlgorithm}=[chunkhash]`
            },
            test: /\.woff2?(?:\?.*)?$/i,
            type: 'asset/resource',
            parser: {
                dataUrlCondition: {
                    maxSize:
                        configuration.inPlace.otherMaximumFileSizeLimitInByte
                }
            },
            use: module.optimizer.font.woff.loader.map(evaluateMapper) as
                RuleSet
        }
    },
    // endregion
    // region image
    image: {
        exclude: (filePath:string):boolean =>
            (module.optimizer.image.exclude === null) ?
                isFilePathInDependencies(filePath) :
                Boolean(evaluate(module.optimizer.image.exclude, filePath)),
        generator: {
            filename:
                join(
                    relative(
                        configuration.path.target.base,
                        configuration.path.target.asset.image
                    ),
                    '[name][ext]'
                ) +
                `?${configuration.hashAlgorithm}=[chunkhash]`
        },
        include: configuration.path.source.asset.image,
        test: /\.(?:gif|ico|jpg|png|svg)(?:\?.*)?$/i,
        type: 'asset/resource',
        parser: {
            dataUrlCondition: {
                maxSize: configuration.inPlace.otherMaximumFileSizeLimitInByte
            }
        },
        use: module.optimizer.image.loader.map(evaluateMapper) as RuleSet
    },
    // endregion
    // region data
    data: {
        exclude: (filePath:string):boolean => {
            if (typeof filePath !== 'string')
                return false

            return configuration.extensions.file.internal.includes(
                extname(Helper.stripLoader(filePath))
            ) ||
            (
                (module.optimizer.data.exclude === null) ?
                    isFilePathInDependencies(filePath) :
                    Boolean(evaluate(module.optimizer.data.exclude, filePath))
            )
        },
        generator: {
            filename:
                join(
                    relative(
                        configuration.path.target.base,
                        configuration.path.target.asset.data
                    ),
                    '[name][ext]'
                ) +
                `?${configuration.hashAlgorithm}=[chunkhash]`
        },
        test: /.+/,
        type: 'asset/resource',
        parser: {
            dataUrlCondition: {
                maxSize: configuration.inPlace.otherMaximumFileSizeLimitInByte
            }
        },
        use: module.optimizer.data.loader.map(evaluateMapper) as RuleSet
    }
    // endregion
}

Tools.extend(loader, genericLoader)

if (
    configuration.files.compose.cascadingStyleSheet && plugins.MiniCSSExtract
) {
    /*
        NOTE: We have to remove the client side javascript hmr style loader
        first.
    */
    loader.style.use.shift()
    loader.style.use.unshift({loader: plugins.MiniCSSExtract.loader})
}
// / endregion
// / region apply runtime dev helper
/*
    NOTE: Disable automatic injection to avoid injection in all chunks and as
    last module which would shadow main module (e.g. index).
    So we inject live reload and hot module replacement manually.
*/
if (
    htmlAvailable &&
    configuration.debug &&
    configuration.development.server.liveReload &&
    !configuration.injection.entry.normalized.developmentHandler &&
    ['serve', 'test:browser'].includes(
        configuration.givenCommandLineArguments[2]
    )
) {
    configuration.injection.entry.normalized.developmentHandler = [
        'webpack-dev-server/client/index.js?live-reload=true&hot=' +
        `${configuration.development.server.hot ? 'true' : 'false'}&http` +
        `${configuration.development.server.https ? 's' : ''}://` +
        `${configuration.development.server.host}:` +
        `${configuration.development.server.port}`
    ]

    if (configuration.development.server.hot) {
        configuration.injection.entry.normalized.developmentHandler
            .push('webpack/hot/dev-server.js')
        configuration.development.server.hot = false

        pluginInstances.push(new HotModuleReplacementPlugin())
    }
}
// / endregion
// endregion
// region plugins
for (const pluginConfiguration of configuration.plugins) {
    type Initializer = new (..._parameters:Array<unknown>) =>
        Unpacked<WebpackConfiguration['plugins']>

    const plugin:Mapping<Initializer>|null =
        optionalRequire(pluginConfiguration.name.module)
    if (plugin)
        pluginInstances.push(
            (new (plugin[pluginConfiguration.name.initializer])(
                ...pluginConfiguration.parameters
            ))!
        )
    else
        console.warn(
            `Configured plugin module "${pluginConfiguration.name.module}" ` +
            'could not be loaded.'
        )
}
// endregion
// region minimizer and image compression
// NOTE: This plugin should be loaded at last to ensure that all emitted images
// ran through.
if (!module.optimizer.minimizer) {
    module.optimizer.minimizer = []

    if (plugins.Terser)
        /*
            HTML-Templates shouldn't be transformed via terser to avoid html
            webpack plugin throwing to not get markup as intermediate result.
        */
        module.optimizer.minimizer.push(
            new plugins.Terser({
                exclude: /\\.html(?:\\.js)?(?:\\?.*)?$/,
                extractComments: false,
                parallel: true
            })
        )

    if (plugins.ImageMinimizer)
        module.optimizer.minimizer.push(new plugins.ImageMinimizer(
            Tools.extend(
                true,
                {
                    minimizer: {
                        implementation: plugins.ImageMinimizer.imageminMinify
                    }
                },
                module.optimizer.image.content
            )
        ))
}
// endregion
// region configuration
let customConfiguration:PlainObject = {}
if (configuration.path.configuration?.json)
    try {
        require.resolve(configuration.path.configuration.json)
        try {
            customConfiguration =
                currentRequire!(configuration.path.configuration.json) as
                    PlainObject
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

export let webpackConfiguration:WebpackConfiguration = Tools.extend<
    WebpackConfiguration
>(
    true,
    {
        bail: !configuration.givenCommandLineArguments.includes('--watch'),
        context: configuration.path.context,
        devtool: configuration.development.tool,
        devServer: configuration.development.server,
        experiments: {
            topLevelAwait: true
        },
        // region input
        entry: configuration.injection.entry.normalized,
        externals: configuration.injection.external.modules,
        resolve: {
            alias: module.aliases,
            aliasFields: configuration.package.aliasPropertyNames,
            extensions: configuration.extensions.file.internal,
            mainFields: configuration.package.main.propertyNames,
            mainFiles: configuration.package.main.fileNames,
            modules: Helper.normalizePaths(module.directoryNames),
            symlinks: module.resolveSymlinks,
            unsafeCache: Boolean(configuration.cache?.unsafe)
        },
        resolveLoader: {
            alias: configuration.loader.aliases,
            aliasFields: configuration.package.aliasPropertyNames,
            extensions: configuration.loader.extensions.file,
            mainFields: configuration.package.main.propertyNames,
            mainFiles: configuration.package.main.fileNames,
            modules: configuration.loader.directoryNames,
            symlinks: configuration.loader.resolveSymlinks
        },
        // endregion
        // region output
        output: {
            assetModuleFilename: join(
                relative(
                    configuration.path.target.base,
                    configuration.path.target.asset.base
                ),
                '[name][ext]'
            ) +
            `?${configuration.hashAlgorithm}=[chunkhash]`,
            filename: relative(
                configuration.path.target.base,
                configuration.files.compose.javaScript
            ),
            globalObject: configuration.exportFormat.globalObject,
            hashFunction: configuration.hashAlgorithm,
            library: {
                name: libraryName === '*' ? undefined : libraryName,
                type: configuration.exportFormat.self,
                umdNamedDefine: true
            },
            path: configuration.path.target.base,
            publicPath: configuration.path.target.public
        },
        performance: configuration.performanceHints,
        /*
            NOTE: Live-reload is not working if target technology is not set to
            "web". Webpack boilerplate code may not support target
            technologies.
        */
        target: configuration.targetTechnology.boilerplate,
        // endregion
        mode: configuration.debug ? 'development' : 'production',
        module: {
            rules: (
                module.additional.pre.map(
                    evaluateAdditionalLoaderConfiguration
                ) as Array<(RuleSetRule|'...')>
            ).concat(
                loader.ejs,

                loader.script,

                loader.html.main,
                loader.html.ejs,
                loader.html.html,

                loader.style,

                loader.font.eot,
                loader.font.svg,
                loader.font.ttf,
                loader.font.woff,

                loader.image,
                loader.data,

                module.additional.post
                    .map(evaluateAdditionalLoaderConfiguration)
            )
        },
        node: configuration.nodeEnvironment,
        optimization: {
            chunkIds: configuration.debug ? 'named' : 'total-size',
            moduleIds: configuration.debug ? 'named' : 'size',
            // region common chunks
            splitChunks: (
                !configuration.injection.chunks ||
                configuration.targetTechnology.payload === 'node' ||
                configuration.givenCommandLineArguments[2] === 'test'
            ) ?
                {
                    cacheGroups: {
                        default: false,
                        defaultVendors: false
                    }
                } :
                Tools.extend<NonNullable<
                    WebpackConfiguration['optimization']
                >['splitChunks']>(
                    true,
                    {
                        chunks: 'all',
                        cacheGroups: {
                            defaultVendors: {
                                chunks: (chunk:Chunk):boolean => {
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
                                                name === chunk.name
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
                ),
            // endregion
            ...Tools.mask(
                module.optimizer,
                {
                    exclude: {
                        babelMinify: true,
                        cssnano: true,
                        data: true,
                        font: true,
                        htmlMinifier: true,
                        image: true
                    }
                }
            )
        } as Partial<WebpackConfiguration['optimization']>,
        plugins: pluginInstances
    },
    configuration.cache?.main ? {cache: configuration.cache.main} : {},
    configuration.webpack,
    customConfiguration
)

if (configuration.nodeENV !== null)
    webpackConfiguration.optimization!.nodeEnv = configuration.nodeENV
if (
    !Array.isArray(module.skipParseRegularExpressions) ||
    module.skipParseRegularExpressions.length
)
    webpackConfiguration.module!.noParse = module.skipParseRegularExpressions

if (configuration.path.configuration?.javaScript)
    try {
        require.resolve(configuration.path.configuration.javaScript)

        const result:unknown =
            optionalRequire(configuration.path.configuration.javaScript)

        if (Tools.isPlainObject(result))
            if (Object.prototype.hasOwnProperty.call(
                result, 'replaceWebOptimizer'
            ))
                webpackConfiguration = result.replaceWebOptimizer as
                    unknown as
                    WebpackConfiguration
            else
                Tools.extend(true, webpackConfiguration, result)
        else
            console.debug(
                'Failed to load given JavaScript configuration file path "' +
                `${configuration.path.configuration.javaScript}".`
            )
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
