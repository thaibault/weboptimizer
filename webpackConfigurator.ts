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
import {
    convertToValidVariableName,
    evaluate,
    EvaluationResult,
    escapeRegularExpressions,
    extend,
    isFileSync,
    isObject,
    isPlainObject,
    Mapping,
    mask,
    PlainObject,
    PositiveEvaluationResult,
    RecursivePartial,
    represent,
    Unpacked
} from 'clientnode'
import {
    PluginOptions as ImageMinimizerOptions
} from 'image-minimizer-webpack-plugin'
import {extname, join, relative, resolve} from 'path'
import {Transformer as PostcssTransformer} from 'postcss'
import PostcssNode from 'postcss/lib/node'
import util from 'util'
import {
    Chunk,
    Compiler,
    Compilation,
    ContextReplacementPlugin,
    DefinePlugin,
    HotModuleReplacementPlugin,
    IgnorePlugin,
    NormalModuleReplacementPlugin,
    ProvidePlugin,
    RuleSetRule,
    sources
} from 'webpack'
import {RawSource as WebpackRawSource} from 'webpack-sources'
import {
    InjectManifestOptions as WorkboxInjectManifestOptions
} from 'workbox-build'

import getConfiguration from './configurator'
import {LoaderConfiguration as EJSLoaderConfiguration} from './ejsLoader'
import {
    determineAssetType,
    determineExternalRequest,
    determineModuleFilePath,
    getClosestPackageDescriptor,
    isFilePathInLocation,
    normalizePaths,
    stripLoader
} from './helper'
import InPlaceAssetsIntoHTML from './plugins/InPlaceAssetsIntoHTML'
import HTMLTransformation from './plugins/HTMLTransformation'
import {
    AdditionalLoaderConfiguration,
    AssetPathConfiguration,
    EvaluationScope,
    GenericLoader,
    HTMLConfiguration,
    IgnorePattern,
    InPlaceConfiguration,
    Loader,
    PackageDescriptor,
    RedundantRequest,
    ResolvedConfiguration,
    RuleSet,
    WebpackConfiguration,
    WebpackExtendedResolveData,
    WebpackLoader,
    WebpackLoaderConfiguration,
    WebpackLoaderIndicator,
    WebpackPlugin,
    WebpackPlugins,
    WebpackResolveData
} from './type'
/// region optional imports
// NOTE: Has to be defined here to ensure to resolve from here.
const currentRequire: null | typeof require =
    /*
        typeof __non_webpack_require__ === 'function' ?
            __non_webpack_require__ :
    */
    eval(`typeof require === 'undefined' ? null : require`) as
        null | typeof require
export const optionalRequire = <T = unknown>(id: string): null | T => {
    try {
        return currentRequire ? currentRequire(id) as T : null
    } catch {
        return null
    }
}

const postcssCSSnano: null | typeof import('cssnano') =
    optionalRequire<typeof import('cssnano')>('cssnano')
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

type UpdateRule = (
    _node: PostcssNode, _token: PostcssNode, _image: Mapping<unknown>
) => void
const updateRule: undefined | UpdateRule =
    optionalRequire<{updateRule: UpdateRule}>(
        'postcss-sprites/lib/core'
    )?.updateRule

const postcssURL =
    optionalRequire<typeof import('postcss-url')>('postcss-url')
/// endregion
const pluginNameResourceMapping: Mapping = {
    Favicon: 'favicons-webpack-plugin',
    ImageMinimizer: 'image-minimizer-webpack-plugin',
    HTML: 'html-webpack-plugin',
    MiniCSSExtract: 'mini-css-extract-plugin',
    offline: 'workbox-webpack-plugin',
    Terser: 'terser-webpack-plugin'
}

const plugins: WebpackPlugins = {}

for (const [name, alias] of Object.entries(pluginNameResourceMapping)) {
    const plugin: null | WebpackPlugin = optionalRequire(alias)
    if (plugin)
        plugins[name] = plugin
    else
        console.debug(`Optional webpack plugin "${name}" not available.`)
}
// endregion
const configuration: ResolvedConfiguration = getConfiguration()
const module: ResolvedConfiguration['module'] = configuration.module
// region initialisation
/// region determine library name
let libraryName: Array<string> | string | undefined
if (configuration.libraryName)
    libraryName = configuration.libraryName
else if (Object.keys(configuration.injection.entry.normalized).length > 1)
    libraryName = '[name]'
else {
    libraryName = configuration.name
    if (['assign', 'global', 'this', 'var', 'window'].includes(
        configuration.exportFormat.self
    ))
        libraryName = convertToValidVariableName(libraryName)
}
if (libraryName === '*')
    libraryName = ['assign', 'global', 'this', 'var', 'window'].includes(
        configuration.exportFormat.self
    ) ?
        Object.keys(
            configuration.injection.entry.normalized
        ).map((name: string): string => convertToValidVariableName(name)) :
        undefined
/// endregion
/// region plugins
const pluginInstances: WebpackConfiguration['plugins'] = []
//// region define modules to ignore
for (const pattern of ([] as Array<IgnorePattern>).concat(
    configuration.injection.ignorePattern
)) {
    if (typeof (pattern as {contextRegExp: string}).contextRegExp === 'string')
        (pattern as {contextRegExp: RegExp}).contextRegExp =
            new RegExp((pattern as {contextRegExp: string}).contextRegExp)

    if (
        typeof (pattern as {resourceRegExp: string}).resourceRegExp ===
            'string'
    )
        (pattern as {resourceRegExp: RegExp}).resourceRegExp =
            new RegExp((pattern as {resourceRegExp: string}).resourceRegExp)

    pluginInstances.push(new IgnorePlugin(pattern as IgnorePlugin['options']))
}
//// endregion
//// region define modules to replace
for (const [source, replacement] of Object.entries(
    module.replacements.normal
)) {
    const search = new RegExp(source)

    pluginInstances.push(new NormalModuleReplacementPlugin(
        search,
        (resource: {request: string}): void => {
            resource.request = resource.request.replace(search, replacement)
        }
    ))
}
//// endregion
//// region generate html file
let htmlAvailable = false
if (plugins.HTML)
    for (const htmlConfiguration of configuration.files.html)
        if (isFileSync(htmlConfiguration.template.filePath)) {
            pluginInstances.push(new plugins.HTML({
                ...htmlConfiguration,
                template: htmlConfiguration.template.request
            }))
            htmlAvailable = true
        }
//// endregion
//// region generate favicons
if (
    htmlAvailable &&
    Object.prototype.hasOwnProperty.call(configuration, 'favicon') &&
    plugins.Favicon &&
    isFileSync(([] as Array<string>).concat(configuration.favicon.logo)[0])
)
    pluginInstances.push(new plugins.Favicon(configuration.favicon))
//// endregion
//// region provide offline functionality
if (
    htmlAvailable &&
    configuration.offline &&
    Object.prototype.hasOwnProperty.call(plugins, 'offline')
) {
    if (!['serve', 'test:browser'].includes(
        configuration.givenCommandLineArguments[2]
    ))
        for (const [name, extension] of Object.entries({
            cascadingStyleSheet: 'css',
            javaScript: 'js'
        })) {
            const type: keyof InPlaceConfiguration =
                name as keyof InPlaceConfiguration
            if (configuration.inPlace[type]) {
                const matches: Array<string> =
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

    if (plugins.offline) {
        if (
            ([] as Array<string>)
                .concat(configuration.offline.use)
                .includes('injectionManifest')
        )
            pluginInstances.push(new plugins.offline.InjectManifest(
                extend<WorkboxInjectManifestOptions>(
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
            pluginInstances.push(new plugins.offline.GenerateSW(extend(
                true,
                configuration.offline.common,
                configuration.offline.generateServiceWorker
            )))
    }
}
//// endregion
//// region provide build environment
if (Object.prototype.hasOwnProperty.call(
    configuration.buildContext, 'definitions'
))
    pluginInstances.push(
        new DefinePlugin(configuration.buildContext.definitions)
    )
if (module.provide)
    pluginInstances.push(new ProvidePlugin(module.provide))
//// endregion
//// region modules/assets
///// region apply module pattern
pluginInstances.push({apply: (compiler: Compiler): void => {
    const name = 'ApplyModulePattern'

    compiler.hooks.compilation.tap(
        name,
        (compilation: Compilation): void => {
            compilation.hooks.processAssets.tap(
                {
                    name,
                    additionalAssets: true,
                    stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
                },
                (assets): void => {
                    for (const [request, asset] of Object.entries(assets)) {
                        const filePath: string = request.replace(/\?[^?]+$/, '')
                        const type: null | string = determineAssetType(
                            filePath,
                            configuration.buildContext.types,
                            configuration.path
                        )

                        if (
                            type &&
                            Object.prototype.hasOwnProperty.call(
                                configuration.assetPattern, type
                            ) &&
                            (new RegExp(
                                configuration.assetPattern[type]
                                    .includeFilePathRegularExpression
                            )).test(filePath) &&
                            !(new RegExp(
                                configuration.assetPattern[type]
                                    .excludeFilePathRegularExpression
                            )).test(filePath)
                        ) {
                            const source: Buffer | string = asset.source()
                            if (typeof source === 'string')
                                compilation.assets[request] =
                                    new WebpackRawSource(
                                        configuration.assetPattern[type]
                                            .pattern.replace(
                                                /\{1\}/g,
                                                source.replace(/\$/g, '$$$')
                                            )
                                    ) as unknown as sources.Source
                        }
                    }
                }
            )
        }
    )
}})
///// endregion
///// region in-place configured assets in the main html file
/*
    TODO

    /
        NOTE: We have to translate template delimiter to html compatible
        sequences and translate it back later to avoid unexpected escape
        sequences in resulting html.
    /
    const window: DOMWindow = (new DOM(
        content
            .replace(/<%/g, '##+#+#+##')
            .replace(/%>/g, '##-#-#-##')
    )).window

    ->

    .replace(/##\+#\+#\+##/g, '<%')
    .replace(/##-#-#-##/g, '%>')
*/

if (
    plugins.HTML &&
    htmlAvailable &&
    !['serve', 'test:browser']
        .includes(configuration.givenCommandLineArguments[2]) &&
    configuration.inPlace.cascadingStyleSheet &&
    Object.keys(configuration.inPlace.cascadingStyleSheet).length ||
    configuration.inPlace.javaScript &&
    Object.keys(configuration.inPlace.javaScript).length
)
    pluginInstances.push(new InPlaceAssetsIntoHTML({
        cascadingStyleSheet: configuration.inPlace.cascadingStyleSheet,
        javaScript: configuration.inPlace.javaScript,
        htmlPlugin: plugins.HTML
    }))
///// endregion
///// region mark empty javaScript modules as dummy
if (!(
    configuration.needed.javaScript ||
    configuration.needed.javaScriptExtension ||
    configuration.needed.typeScript ||
    configuration.needed.typeScriptExtension
))
    configuration.files.compose.javaScript = resolve(
        configuration.path.target.asset.javaScript, '.__dummy__.compiled.js'
    )
///// endregion
///// region extract cascading style sheets
const cssOutputPath: string | ((_asset: unknown) => string) =
    configuration.files.compose.cascadingStyleSheet
if (cssOutputPath && plugins.MiniCSSExtract)
    pluginInstances.push(new plugins.MiniCSSExtract({
        filename: typeof cssOutputPath === 'string' ?
            relative(configuration.path.target.base, cssOutputPath) :
            cssOutputPath
    }))
///// endregion
///// region performs implicit external logic
if (configuration.injection.external.modules === '__implicit__')
    /*
        We only want to process modules from local context in library mode,
        since a concrete project using this library should combine all assets
        (and de-duplicate them) for optimal bundling results.
        NOTE: Only native javascript and json modules will be marked as
        external dependency.
    */
    configuration.injection.external.modules = (
        {context, request},
        callback: (
            error?: Error,
            result?: Array<string> | boolean | string | Mapping<unknown>,
            type?: string
        ) => void
    ): void => {
        if (typeof request !== 'string') {
            callback()
            return
        }

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
        const filePath: null | string = determineModuleFilePath(
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
                if (targetConfiguration && pattern.startsWith('^')) {
                    const regularExpression = new RegExp(pattern)
                    if (regularExpression.test(filePath)) {
                        let match = false

                        const firstKey = Object.keys(targetConfiguration)[0]
                        let target: string =
                            (targetConfiguration as Mapping)[firstKey]

                        if (typeof target !== 'string')
                            break

                        const replacementRegularExpression =
                            new RegExp(firstKey)

                        if (target.startsWith('?')) {
                            target = target.substring(1)

                            const aliasedRequest: string = request.replace(
                                replacementRegularExpression, target)

                            if (aliasedRequest !== request)
                                match = Boolean(determineModuleFilePath(
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
        const resolvedRequest: null | string = determineExternalRequest(
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
            const keys: Array<string> = ['amd', 'commonjs', 'commonjs2', 'root']
            let result: (Mapping & {root?: Array<string>}) | string =
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
                            ] as (_request: string, _key: string) => string
                        )(request, key)
                else if (isObject(configuration.injection.external.aliases[
                    request
                ]))
                    extend<Mapping>(
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
                Object.prototype.hasOwnProperty.call(result, 'root') &&
                Array.isArray(result.root)
            )
                result.root = ([] as Array<string>)
                    .concat(result.root)
                    .map((name: string): string =>
                        convertToValidVariableName(name)
                    )
            const exportFormat: string =
                Object.prototype.hasOwnProperty.call(
                    configuration.exportFormat, 'external'
                ) ?
                    configuration.exportFormat.external :
                    configuration.exportFormat.self

            callback(
                undefined,
                (
                    exportFormat === 'umd' || typeof result === 'string' ?
                        result :
                        result[exportFormat]
                ) as Array<string> | boolean | string | Mapping<unknown>,
                exportFormat
            )

            return
        }

        callback()
    }
///// endregion
//// endregion
//// region apply final html modifications/fixes
if (htmlAvailable && plugins.HTML)
    pluginInstances.push(new HTMLTransformation({
        hashAlgorithm: configuration.hashAlgorithm,
        htmlPlugin: plugins.HTML,
        files: configuration.files.html
    }))
//// endregion
//// region context replacements
for (const contextReplacement of module.replacements.context)
    pluginInstances.push(new ContextReplacementPlugin(...(
        contextReplacement.map((value: string): RegExp | string => {
            const evaluated: EvaluationResult<RegExp | string> =
                evaluate<RegExp | string>(
                    value, {configuration, __dirname, __filename}
                )

            if (evaluated.error)
                throw new Error(
                    'Error occurred during processing given context ' +
                    `replacement: ${evaluated.error}`
                )

            return (evaluated as PositiveEvaluationResult<RegExp | string>)
                .result
        }) as [RegExp, string]
    )))
//// endregion
//// region consolidate duplicated module requests
/*
    NOTE: Redundancies usually occur when symlinks aren't converted to their
    real paths since real paths can be de-duplicated by webpack but if two
    linked modules share the same transitive dependency webpack wont recognize
    them as same dependency.
*/
if (module.enforceDeduplication) {
    const absoluteContextPath: string = resolve(configuration.path.context)

    const consolidator = (result: WebpackExtendedResolveData): void => {
        const targetPath: string = result.createData.resource

        if (
            targetPath &&
            /((?: ^|\/)node_modules\/.+)/.test(targetPath) &&
            (
                !targetPath.startsWith(absoluteContextPath) ||
                /((?: ^|\/)node_modules\/.+){2}/.test(targetPath)
            ) &&
            isFileSync(targetPath)
        ) {
            const packageDescriptor: null | PackageDescriptor =
                getClosestPackageDescriptor(targetPath)
            if (packageDescriptor) {
                let pathPrefixes: Array<string>
                let pathSuffix: string
                if (targetPath.startsWith(absoluteContextPath)) {
                    const matches: null | RegExpMatchArray =
                        targetPath.match(/((?: ^|.*?\/)node_modules\/)/g)
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
                        /(?: ^|.*\/)node_modules\/(.+$)/, '$1'
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

                let redundantRequest: null | RedundantRequest = null
                for (const pathPrefix of pathPrefixes) {
                    const alternateTargetPath: string =
                        resolve(pathPrefix, pathSuffix)

                    if (isFileSync(alternateTargetPath)) {
                        const otherPackageDescriptor: null | PackageDescriptor =
                            getClosestPackageDescriptor(alternateTargetPath)
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

    pluginInstances.push({apply: (compiler: Compiler) => {
        compiler.hooks.normalModuleFactory.tap(
            'WebOptimizerModuleConsolidation',
            (nmf: ReturnType<Compiler['createNormalModuleFactory']>) => {
                nmf.hooks.afterResolve.tap(
                    'WebOptimizerModuleConsolidation',
                    consolidator as (_result: WebpackResolveData) => void
                )
            }
        )
    }})
}
/*
new NormalModuleReplacementPlugin(
    /.+/,
    (result: {
        context: string
        createData: {resource: string}
        request: string
    }): void => {
        const isResource: boolean = Boolean(result.createData.resource)
        const targetPath: string = isResource ?
            result.createData.resource :
            resolve(result.context, result.request)
        if (
            targetPath &&
            /((?: ^|\/)node_modules\/.+){2}/.test(targetPath) &&
            isFileSync(targetPath)
        ) {
            const packageDescriptor: null | PackageDescriptor =
                Helper.getClosestPackageDescriptor(targetPath)
            if (packageDescriptor) {
                const pathPrefixes: null | RegExpMatchArray = targetPath.match(
                    /((?: ^|.*?\/)node_modules\/)/g
                )
                if (pathPrefixes === null)
                    return
                // Avoid finding the same artefact.
                pathPrefixes.pop()
                let index: number = 0
                for (const pathPrefix of pathPrefixes) {
                    if (index > 0)
                        pathPrefixes[index] =
                            resolve(pathPrefixes[index - 1], pathPrefix)
                    index += 1
                }
                const pathSuffix: string =
                    targetPath.replace(/(?: ^|.*\/)node_modules\/(.+$)/, '$1')
                let redundantRequest: null | PlainObject = null
                for (const pathPrefix of pathPrefixes) {
                    const alternateTargetPath: string =
                        resolve(pathPrefix, pathSuffix)
                    if (isFileSync(alternateTargetPath)) {
                        const otherPackageDescriptor: null | PackageDescriptor =
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
//// endregion
/// endregion
/// region loader helper
const isFilePathInDependencies = (filePath: string): boolean => {
    filePath = stripLoader(filePath)

    return isFilePathInLocation(
        filePath,
        configuration.path.ignore
            .concat(module.directoryNames, configuration.loader.directoryNames)
            .map((filePath: string): string =>
                resolve(configuration.path.context, filePath)
            )
            .filter((filePath: string): boolean =>
                !configuration.path.context.startsWith(filePath)
            )
    )
}

const loader: Loader = {} as unknown as Loader

const scope: EvaluationScope = {
    configuration,
    isFilePathInDependencies,
    loader,
    require: currentRequire ?? require
}

const evaluateAnThrow = <T = unknown>(
    object: unknown, filePath: string = configuration.path.context
): T => {
    if (typeof object === 'string') {
        const evaluated: EvaluationResult<T> =
            evaluate<T>(object, {filePath, ...scope})

        if (evaluated.error)
            throw new Error(
                'Error occurred during processing given expression: ' +
                evaluated.error
            )

        return (evaluated as PositiveEvaluationResult<T>).result
    }

    return object as T
}
const evaluateMapper =
    <T = unknown>(value: unknown): T => evaluateAnThrow<T>(value)
const evaluateAdditionalLoaderConfiguration = (
    loaderConfiguration: AdditionalLoaderConfiguration
): WebpackLoaderConfiguration => ({
    exclude: (filePath: string): boolean =>
        evaluateAnThrow<boolean>(loaderConfiguration.exclude, filePath),
    include:
        loaderConfiguration.include &&
        evaluateAnThrow<WebpackLoaderIndicator>(loaderConfiguration.include) ||
        configuration.path.source.base,
    test: new RegExp(evaluateAnThrow<string>(loaderConfiguration.test)),
    use: evaluateAnThrow<Array<WebpackLoader> | WebpackLoader>(
        loaderConfiguration.use
    )
})

const getIncludingPaths = (path: string): Array<string> =>
    normalizePaths([path].concat(module.locations.directoryPaths))

const cssUse: RuleSet = module.preprocessor.cascadingStyleSheet.additional.pre
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
                options: extend(
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
                                        filterBy: (): Promise<void> =>
                                            new Promise<void>((
                                                resolve: () => void,
                                                reject: () => void
                                            ) => {
                                                (
                                                    configuration.files.compose
                                                        .image ?
                                                        resolve :
                                                        reject
                                                )()
                                            }),
                                        hooks: {
                                            onSaveSpritesheet: (
                                                image: Mapping<unknown>
                                            ): string =>
                                                join(
                                                    image.spritePath as string,
                                                    relative(
                                                        configuration.path
                                                            .target.asset
                                                            .image,
                                                        configuration.files
                                                            .compose.image
                                                    )
                                                ),
                                            /*
                                                Reset this token due to a
                                                sprite bug with
                                                "background-image" declaration
                                                which do not refer to an image
                                                (e.g. linear gradient instead).
                                            */
                                            onUpdateRule: (
                                                rule: PostcssNode,
                                                token: PostcssNode & {
                                                    text: string
                                                    value: string
                                                },
                                                image: Mapping<unknown>
                                            ) => {
                                                if (updateRule)
                                                    if (token.value.includes(
                                                        token.text
                                                    ))
                                                        updateRule(
                                                            rule, token, image
                                                        )
                                                    else
                                                        token.cloneAfter({
                                                            type: 'decl',
                                                            prop:
                                                                'background-' +
                                                                'image',
                                                            value: token.value
                                                        })
                                            }
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

const genericLoader: GenericLoader = {
    // Convert to compatible native web types.
    // region generic template
    ejs: {
        exclude: (filePath: string): boolean =>
            normalizePaths(
                configuration.files.html
                    .concat(configuration.files.defaultHTML)
                    .map((htmlConfiguration: HTMLConfiguration): string =>
                        htmlConfiguration.template.filePath
                    )
            ).includes(filePath) ||
            (module.preprocessor.ejs.exclude === null) ?
                false :
                evaluateAnThrow<boolean>(
                    module.preprocessor.ejs.exclude, filePath
                ),
        include: getIncludingPaths(configuration.path.source.asset.template),
        test: /^(?!.+\.html\.ejs$).+\.ejs$/i,
        use: module.preprocessor.ejs.additional.pre
            .map(evaluateMapper)
            .concat(
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
        exclude: (filePath: string): boolean =>
            evaluateAnThrow<boolean>(
                module.preprocessor.javaScript.exclude, filePath
            ),
        include: (filePath: string): boolean => {
            const result: unknown = evaluateAnThrow(
                module.preprocessor.javaScript.include, filePath
            )
            if ([null, undefined].includes(result as null)) {
                for (const includePath of getIncludingPaths(
                    configuration.path.source.asset.javaScript
                ))
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
                escapeRegularExpressions(
                    configuration.files.defaultHTML.template.filePath
                ) +
                '(?: \\?.*)?$'
            ),
            use: configuration.files.defaultHTML.template.use
        },
        ejs: {
            exclude:
                (filePath: string): boolean => normalizePaths(
                    configuration.files.html
                        .concat(configuration.files.defaultHTML)
                        .map((htmlConfiguration: HTMLConfiguration): string =>
                            htmlConfiguration.template.filePath
                        )
                ).includes(filePath) ||
                ((module.preprocessor.html.exclude === null) ?
                    false :
                    evaluateAnThrow<boolean>(
                        module.preprocessor.html.exclude, filePath
                    )
                ),
            include: configuration.path.source.asset.template,
            test: /\.html\.ejs(?: \?.*)?$/i,
            use: module.preprocessor.html.additional.pre
                .map(evaluateMapper)
                .concat(
                    /*
                        We might need to evaluate ejs before we are able to
                        parse html beforhand. If not we parse it as html
                        directly.
                    */
                    (
                        (
                            isPlainObject(module.preprocessor.html.options) ?
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
            exclude: (filePath: string): boolean =>
                normalizePaths(
                    configuration.files.html
                        .concat(configuration.files.defaultHTML)
                        .map((htmlConfiguration: HTMLConfiguration): string =>
                            htmlConfiguration.template.filePath
                        )
                ).includes(filePath) ||
                (
                    (module.html.exclude === null) ?
                        true :
                        evaluateAnThrow<boolean>(module.html.exclude, filePath)
                ),
            include: configuration.path.source.asset.template,
            test: /\.html(?: \?.*)?$/i,
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
                                '[contenthash]'
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
        exclude: (filePath: string): boolean =>
            (module.cascadingStyleSheet.exclude === null) ?
                isFilePathInDependencies(filePath) :
                evaluateAnThrow<boolean>(
                    module.cascadingStyleSheet.exclude, filePath
                ),
        include: (filePath: string): boolean => {
            const result: unknown = evaluateAnThrow(
                module.cascadingStyleSheet.include, filePath
            )
            if ([null, undefined].includes(result as null)) {
                for (const includePath of getIncludingPaths(
                    configuration.path.source.asset.cascadingStyleSheet
                ))
                    if (filePath.startsWith(includePath))
                        return true

                return false
            }

            return Boolean(result)
        },
        test: /\.s?css(?: \?.*)?$/i,
        use: cssUse
    },
    // endregion
    // Optimize loaded assets.
    // region font
    font: {
        eot: {
            exclude: (filePath: string): boolean =>
                (module.optimizer.font.eot.exclude === null) ?
                    false :
                    evaluateAnThrow<boolean>(
                        module.optimizer.font.eot.exclude, filePath
                    ),
            generator: {
                filename:
                    join(
                        relative(
                            configuration.path.target.base,
                            configuration.path.target.asset.font
                        ),
                        '[name][ext]'
                    ) +
                    `?${configuration.hashAlgorithm}=[contenthash]`
            },
            test: /\.eot(?: \?.*)?$/i,
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
            exclude: (filePath: string): boolean =>
                (module.optimizer.font.svg.exclude === null) ?
                    false :
                    evaluateAnThrow<boolean>(
                        module.optimizer.font.svg.exclude, filePath
                    ),
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
                    `?${configuration.hashAlgorithm}=[contenthash]`
            },
            mimetype: 'image/svg+xml',
            parser: {
                dataUrlCondition: {
                    maxSize:
                        configuration.inPlace.otherMaximumFileSizeLimitInByte
                }
            },
            test: /\.svg(?: \?.*)?$/i,
            type: 'asset/resource',
            use: module.optimizer.font.svg.loader.map(evaluateMapper) as
                RuleSet
        },
        ttf: {
            exclude: (filePath: string): boolean =>
                (module.optimizer.font.ttf.exclude === null) ?
                    false :
                    evaluateAnThrow<boolean>(
                        module.optimizer.font.ttf.exclude, filePath
                    ),
            generator: {
                filename:
                    join(
                        relative(
                            configuration.path.target.base,
                            configuration.path.target.asset.font
                        ),
                        '[name][ext]'
                    ) +
                    `?${configuration.hashAlgorithm}=[contenthash]`
            },
            test: /\.ttf(?: \?.*)?$/i,
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
            exclude: (filePath: string): boolean =>
                (module.optimizer.font.woff.exclude === null) ?
                    false :
                    evaluateAnThrow<boolean>(
                        module.optimizer.font.woff.exclude, filePath
                    ),
            generator: {
                filename:
                    join(
                        relative(
                            configuration.path.target.base,
                            configuration.path.target.asset.font
                        ),
                        '[name][ext]'
                    ) +
                    `?${configuration.hashAlgorithm}=[contenthash]`
            },
            test: /\.woff2?(?: \?.*)?$/i,
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
        exclude: (filePath: string): boolean =>
            (module.optimizer.image.exclude === null) ?
                isFilePathInDependencies(filePath) :
                evaluateAnThrow<boolean>(
                    module.optimizer.image.exclude, filePath
                ),
        generator: {
            filename:
                join(
                    relative(
                        configuration.path.target.base,
                        configuration.path.target.asset.image
                    ),
                    '[name][ext]'
                ) +
                `?${configuration.hashAlgorithm}=[contenthash]`
        },
        include: configuration.path.source.asset.image,
        test: /\.(?: gif|ico|jpg|png|svg)(?: \?.*)?$/i,
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
        exclude: (filePath: string): boolean => {
            if (typeof filePath !== 'string')
                return false

            return configuration.extensions.file.internal.includes(
                extname(stripLoader(filePath))
            ) ||
            (
                (module.optimizer.data.exclude === null) ?
                    isFilePathInDependencies(filePath) :
                    evaluateAnThrow<boolean>(
                        module.optimizer.data.exclude, filePath
                    )
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
                `?${configuration.hashAlgorithm}=[contenthash]`
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

extend(loader, genericLoader)

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
/// endregion
/// region apply runtime dev helper
/*
    NOTE: Disable automatic injection to avoid injection in all chunks and as
    last module which would shadow main module (e.g. index).
    So we inject live reload and hot module replacement manually.
*/
if (
    htmlAvailable &&
    configuration.debug &&
    configuration.development.server.liveReload &&
    !Object.prototype.hasOwnProperty.call(
        configuration.injection.entry.normalized, 'developmentHandler'
    ) &&
    (
        configuration.development.includeClient ||
        typeof configuration.development.includeClient !== 'boolean' &&
        ['serve', 'test:browser'].includes(
            configuration.givenCommandLineArguments[2]
        )
    )
) {
    configuration.injection.entry.normalized.developmentHandler = [
        'webpack-dev-server/client/index.js?' +
        'live-reload=true' +
        `&hot=${configuration.development.server.hot ? 'true' : 'false'}` +
        `&http${configuration.development.server.https ? 's' : ''}: //` +
        `${configuration.development.server.host}: ` +
        String(configuration.development.server.port)
    ]

    if (configuration.development.server.hot) {
        configuration.injection.entry.normalized.developmentHandler
            .push('webpack/hot/dev-server.js')
        configuration.development.server.hot = false

        pluginInstances.push(new HotModuleReplacementPlugin())
    }
}
/// endregion
// endregion
// region plugins
for (const pluginConfiguration of configuration.plugins) {
    type Initializer = new (..._parameters: Array<unknown>) =>
        Unpacked<WebpackConfiguration['plugins']>

    const plugin: Mapping<Initializer> | null =
        optionalRequire(pluginConfiguration.name.module)
    if (plugin)
        pluginInstances.push(
            (new (plugin[pluginConfiguration.name.initializer])(
                ...pluginConfiguration.parameters
            ))
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
                exclude: /\\.html(?: \\.js)?(?: \\?.*)?$/,
                extractComments: false,
                parallel: true
            })
        )

    if (plugins.ImageMinimizer)
        module.optimizer.minimizer.push(new plugins.ImageMinimizer(extend(
            true,
            {
                minimizer: {
                    implementation: plugins.ImageMinimizer.imageminMinify
                }
            } as ImageMinimizerOptions<unknown, unknown>,
            module.optimizer.image.content
        )))
}
// endregion
// region configuration
let customConfiguration: PlainObject = {}
if (configuration.path.configuration.json)
    try {
        require.resolve(configuration.path.configuration.json)
        try {
            customConfiguration = (currentRequire as typeof require)(
                configuration.path.configuration.json
            ) as PlainObject
        } catch (error) {
            console.debug(
                'Importing provided json webpack configuration file path ' +
                `under "${configuration.path.configuration.json}" failed: ` +
                represent(error)
            )
        }
    } catch {
        console.debug(
            'Optional configuration file "' +
            `${configuration.path.configuration.json}" not available.`
        )
    }

export let webpackConfiguration: WebpackConfiguration = extend<
    WebpackConfiguration
>(
    true,
    {
        bail: !configuration.givenCommandLineArguments.includes('--watch'),
        context: configuration.path.context,
        devtool: configuration.development.tool,
        devServer: configuration.development.server as
            WebpackConfiguration['devServer'],
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
            modules: normalizePaths(module.directoryNames),
            symlinks: module.resolveSymlinks,
            unsafeCache: Boolean(
                configuration.cache?.unsafe ??
                configuration.cache?.main
            )
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
                name: libraryName,
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
                ) as Array<(RuleSetRule | '...')>
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
            splitChunks: extend<NonNullable<
                WebpackConfiguration['optimization']
            >['splitChunks']>(
                true,
                (
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
                    {
                        chunks: 'all',
                        cacheGroups: {
                            defaultVendors: {
                                chunks: (chunk: Chunk): boolean => {
                                    if (configuration.inPlace.javaScript)
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
            ...mask(
                module.optimizer as unknown as Mapping<unknown>,
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
    if (typeof webpackConfiguration.optimization === 'object')
        webpackConfiguration.optimization.nodeEnv = configuration.nodeENV
    else
        webpackConfiguration.optimization = {nodeEnv: configuration.nodeENV}
if (
    !Array.isArray(module.skipParseRegularExpressions) ||
    module.skipParseRegularExpressions.length
)
    if (typeof webpackConfiguration.module === 'object')
        webpackConfiguration.module.noParse = module.skipParseRegularExpressions
    else
        webpackConfiguration.module = {
            noParse: module.skipParseRegularExpressions
        }

if (configuration.path.configuration.javaScript)
    try {
        require.resolve(configuration.path.configuration.javaScript)

        const result: unknown =
            optionalRequire(configuration.path.configuration.javaScript)

        if (isPlainObject(result))
            if (Object.prototype.hasOwnProperty.call(
                result, 'replaceWebOptimizer'
            ))
                webpackConfiguration = result.replaceWebOptimizer as
                    unknown as
                    WebpackConfiguration
            else
                extend(
                    true,
                    webpackConfiguration,
                    result as RecursivePartial<WebpackConfiguration>
                )
        else
            console.debug(
                'Failed to load given JavaScript configuration file path "' +
                `${configuration.path.configuration.javaScript}".`
            )
    } catch {
        console.debug(
            'Optional configuration file script "' +
            `${configuration.path.configuration.javaScript}" not available.`
        )
    }

if (configuration.showConfiguration) {
    console.info(
        'Using internal configuration: ',
        util.inspect(configuration, {depth: null})
    )
    console.info('-----------------------------------------------------------')
    console.info(
        'Using webpack configuration: ',
        util.inspect(webpackConfiguration, {depth: null})
    )
}
// endregion
export default webpackConfiguration
