// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module type */
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
    AnyFunction,
    Encoding,
    Mapping,
    PlainObject,
    SecondParameter,
    UnknownFunction
} from 'clientnode/type'
import {FaviconOptions} from 'favicons'
import FaviconWebpackPlugin from 'favicons-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ImageMinimizerWebpackPlugin from 'image-minimizer-webpack-plugin'
import {JSDOM} from 'jsdom'
import MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import {Options as RemoveDirectoryRecursivelyOptions} from 'rimraf'
import {
    DefinePlugin as WebpackDefinePlugin,
    Configuration as BaseWebpackConfiguration,
    IgnorePlugin as WebpackIgnorePlugin,
    library as webpackLibrary,
    ModuleOptions as WebpackModuleOptions,
    RuleSetRule as WebpackRuleSetRule,
    RuleSetUseItem as WebpackRuleSetUseItem,
    WebpackOptionsNormalized
} from 'webpack'
import OfflinePlugin, {
    CommonOptions as WorkboxCommonOptions,
    GenerateSWOptions as WorkboxGenerateSWOptions,
    InjectManifestOptions as WorkboxInjectManifestOptions
} from 'workbox-webpack-plugin'
// endregion
// region exports
// / region generic
export interface Browser {
    debug:boolean
    domContentLoaded:boolean
    DOM:typeof JSDOM|null
    initialized:boolean
    instance:JSDOM|null
    window:null|Window
    windowLoaded:boolean
}
export interface InitializedBrowser extends Browser {
    DOM:typeof JSDOM
    instance:JSDOM
    window:Window
}

export interface PackageConfiguration {
    name:string
    version:string
}
export interface PackageDescriptor {
    configuration:PackageConfiguration
    filePath:string
}

export type Replacements = Mapping<SecondParameter<string['replace']>>

export type Resolvable = {
    // eslint-disable-next-line no-unused-vars
    [K in '__evaluate__'|'__execute__'|string]:Resolvable|string|unknown
}

export interface RedundantRequest {
    path:string
    version:string
}
// / endregion
// / region injection
export type ExternalAliases =
    Mapping<Mapping|string|((_request:string, _key:string) => string)>
export type GivenInjection =
    AnyFunction|string|Array<string>|Mapping<string|Array<string>>
export type NormalizedGivenInjection = Mapping<Array<string>>
export interface GivenInjectionConfiguration {
    autoExclude:Array<string>
    entry:GivenInjection
    external:GivenInjection
}
export type IgnorePattern =
    WebpackIgnorePlugin['options'] |
    {
        contextRegExp?:string
        resourceRegExp?:string
    }
export interface InjectionConfiguration {
    autoExclude:Array<string>
    chunks:NonNullable<BaseWebpackConfiguration['optimization']>['splitChunks']
    entry:{
        given:GivenInjection
        normalized:NormalizedGivenInjection
    }
    external:{
        aliases:ExternalAliases
        implicit:{
            pattern:{
                exclude:Array<RegExp|string>
                include:Array<RegExp|string>
            }
        }
        modules:BaseWebpackConfiguration['externals']
    }
    externalAliases:Mapping
    ignorePattern:Array<IgnorePattern>|IgnorePattern
    implicitExternalExcludePattern:Array<RegExp|string>
    implicitExternalIncludePattern:Array<RegExp|string>
}
// / endregion
// / region configuration
// // region path
export interface AssetPathConfiguration {
    base:string
    cascadingStyleSheet:string
    data:string
    font:string
    image:string
    javaScript:string
    template:string
}
export interface BasePathConfiguration {
    base:string
    context:string
    source:{
        asset:AssetPathConfiguration
        base:string
    }
    target:{
        asset:AssetPathConfiguration
        base:string
        manifest:string
        public:string
    }
}
export interface PathConfiguration extends BasePathConfiguration {
    apiDocumentation:string
    base:string
    configuration:{
        javaScript:string
        json:string
        typeScript:string
    }
    context:string
    ignore:Array<string>
    tidyUp:Array<string>
    tidyUpOnClear:Array<string>
    tidyUpOnClearGlobs:{
        options:RemoveDirectoryRecursivelyOptions
        pattern:Array<string>
    }
}
export type DefaultPathConfiguration = BasePathConfiguration & Resolvable
// // endregion
// // region build
export interface BuildConfigurationItem {
    extension:string
    ignoredExtension:string
    filePathPattern:string
    outputExtension:string
}
export type BuildConfiguration = Mapping<BuildConfigurationItem>
export const SubConfigurationTypes = [
    'debug', 'document', 'test', 'test:browser'
] as const
export const TaskTypes = ['build', 'serve', ...SubConfigurationTypes] as const
// // endregion
// // region loader
export type BooleanExpression = boolean|null|string
export interface AdditionalLoaderConfiguration {
    exclude?:BooleanExpression
    include?:BooleanExpression
    test:string
    use:Array<WebpackLoader>|WebpackLoader|string
}
export interface AdditionalLoaderConfigurations {
    post:Array<AdditionalLoaderConfiguration>
    pre:Array<AdditionalLoaderConfiguration>
}
export interface AdditionalLoader {
    post:Array<string>
    pre:Array<string>
}
export interface WebpackLoader {
    loader:string
    options?:Mapping<unknown>
}
export type ResourceLoaderConfiguration = WebpackLoader & {
    exclude:BooleanExpression
    include:BooleanExpression
    loader:Array<string>
    regularExpression:string
}
export interface LoaderConfiguration extends ResourceLoaderConfiguration {
    additional:AdditionalLoaderConfigurations
}
export interface WebpackLoaderConfiguration {
    exclude:WebpackLoaderIndicator
    include:WebpackLoaderIndicator
    test:RegExp
    use:Array<WebpackLoader>|WebpackLoader
}
export type WebpackLoaderIndicator = WebpackRuleSetRule['include']
// // endregion
export interface Command {
    arguments:Array<string>
    command:string
    indicator?:string
}
export interface CommandLineArguments {
    build:Command
    document:Array<Command>|Command
    lint:Array<Command>|Command
    serve:Array<Command>|Command
    test:Array<Command>|Command
    'test:browser':Array<Command>|Command
    'check:types':Array<Command>|Command
}
export type NodeEnvironment = BaseWebpackConfiguration['node'] & {'#':string}
export interface PluginConfiguration {
    name:{
        initializer:string
        module:string
    }
    parameters:Array<unknown>
}
export interface DefaultConfiguration {
    contextType:string
    debug:boolean
    document:PlainObject
    encoding:Encoding
    givenCommandLineArguments:Array<string>
    library:boolean
    nodeEnvironment:NodeEnvironment
    path:DefaultPathConfiguration
    plugins:Array<PluginConfiguration>
    test:PlainObject
    'test:browser':PlainObject
}
/* eslint-disable max-len */
export type ExportFormat = 'amd'|'amd-require'|'assign'|'global'|'jsonp'|'var'|'this'|'commonjs'|'commonjs2'|'umd'
/* eslint-enable max-len */
export interface HTMLConfiguration {
    filename:string
    template:{
        filePath:string
        options?:PlainObject
        postCompileOptions:PlainObject
        request:string|string
        use:Array<WebpackLoader>|WebpackLoader
    }
}
export interface MetaConfiguration {
    default:DefaultConfiguration
    debug:Resolvable
    library:Resolvable
}
export interface ResolvedBuildConfigurationItem extends BuildConfigurationItem {
    filePaths:Array<string>
    type:string
}
export interface Extensions {
    file:{
        external:Array<string>
        internal:Array<string>
    }
}
export interface SpecificExtensions {file:Array<string>}
export interface InPlaceAssetConfiguration {
    body?:Array<RegExp|string>|RegExp|string
    head?:Array<RegExp|string>|RegExp|string
}
export interface InPlaceConfiguration {
    cascadingStyleSheet:InPlaceAssetConfiguration
    externalLibrary:{
        normal:boolean
        dynamic:boolean
    }
    javaScript:InPlaceAssetConfiguration
    otherMaximumFileSizeLimitInByte:number
}
export interface ResolvedConfiguration {
    assetPattern:Mapping<{
        excludeFilePathRegularExpression:string
        includeFilePathRegularExpression:string
        pattern:string
    }>
    buildContext:{
        definitions:WebpackDefinePlugin['definitions']
        types:BuildConfiguration
    }
    cache?:{
        main?:WebpackOptionsNormalized['cache']
        unsafe?:WebpackModuleOptions['unsafeCache']
    }
    commandLine:CommandLineArguments
    contextType:string
    debug:boolean
    development:{
        server:WebpackOptionsNormalized['devServer'] & {
            /*
                NOTE: We need these values mandatory to inject development
                handler beforehand.
            */
            host:string
            https:boolean
            liveReload:boolean
            port:number
        }
        tool:WebpackOptionsNormalized['devtool']
    }
    document:PlainObject
    encoding:Encoding
    exportFormat:{
        external:ExportFormat
        globalObject:string
        self:ExportFormat
    }
    extensions:Extensions
    favicon:Mapping<FaviconOptions> & {logo:string}
    files:{
        additionalPaths:Array<string>
        compose:{
            cascadingStyleSheet:string
            image:string
            javaScript:string
        }
        defaultHTML:HTMLConfiguration
        html:Array<HTMLConfiguration>
    }
    givenCommandLineArguments:Array<string>
    hashAlgorithm:string
    injection:InjectionConfiguration
    inPlace:InPlaceConfiguration
    library:boolean
    libraryName:string
    loader:{
        aliases:Mapping
        directoryNames:Array<string>
        extensions:{
            file:Array<string>
        }
        resolveSymlinks:boolean
    }
    module:{
        additional:AdditionalLoaderConfigurations
        aliases:Mapping
        cascadingStyleSheet:ResourceLoaderConfiguration
        directoryNames:Array<string>
        enforceDeduplication:boolean
        html:LoaderConfiguration
        locations:{
            directoryPaths:Array<string>
            filePaths:Array<string>
        }
        optimizer:BaseWebpackConfiguration['optimization'] & {
            babelMinify?:{
                bundle?:{
                    plugin?:PlainObject
                    transform?:PlainObject
                }
                module?:PlainObject
            }
            cssnano:PlainObject
            data:ResourceLoaderConfiguration
            font:{
                eot:ResourceLoaderConfiguration
                svg:ResourceLoaderConfiguration
                ttf:ResourceLoaderConfiguration
                woff:ResourceLoaderConfiguration
            }
            htmlMinifier?:PlainObject
            image:{
                content:PlainObject
                exclude:string
                loader:Array<string>
            }
        }
        preprocessor:{
            cascadingStyleSheet:WebpackLoader & {
                additional:AdditionalLoader & {plugins:AdditionalLoader}
                postcssPresetEnv:PlainObject
            }
            ejs:LoaderConfiguration
            html:LoaderConfiguration
            javaScript:LoaderConfiguration
            json:{
                exclude:string
                loader:string
            }
        }
        provide:Mapping|null
        replacements:{
            context:Array<[string, string]>
            normal:Replacements
        }
        resolveSymlinks:boolean
        skipParseRegularExpressions:WebpackModuleOptions['noParse']
        style:WebpackLoader
    }
    name:string
    needed:Mapping<boolean>
    nodeENV:false|null|string
    nodeEnvironment:NodeEnvironment
    offline:{
        common:WorkboxCommonOptions
        injectionManifest:WorkboxInjectManifestOptions
        serviceWorker:WorkboxGenerateSWOptions
        use:'injectionManifest'|'serviceWorker'
    }
    package:{
        aliasPropertyNames:Array<string>
        main:{
            fileNames:Array<string>
            propertyNames:Array<string>
        }
    }
    path:PathConfiguration
    performanceHints:BaseWebpackConfiguration['performance']
    plugins:Array<PluginConfiguration>
    showConfiguration:boolean
    stylelint:PlainObject
    targetTechnology:{
        boilerplate:string
        payload:string
    }
    test:PlainObject
    'test:browser':PlainObject
    webpack:WebpackConfiguration
}
export type ResolvedBuildConfiguration = Array<ResolvedBuildConfigurationItem>
export type RuntimeInformation =
    PlainObject & {givenCommandLineArguments:Array<string>}
export interface WebpackConfiguration extends BaseWebpackConfiguration {
    devServer:Mapping<unknown>
    replaceWebOptimizer:WebpackConfiguration
}

export type RuleSet = Array<WebpackRuleSetUseItem>
export type RuleSetRule = WebpackRuleSetRule & {use:RuleSet}
export interface GenericLoader {
    ejs:RuleSetRule
    script:RuleSetRule
    html:{
        ejs:RuleSetRule
        html:RuleSetRule
        main:{
            test:RegExp
            use:Array<WebpackLoader>|WebpackLoader
        }
    }
    style:RuleSetRule
    font:{
        eot:RuleSetRule
        svg:RuleSetRule
        ttf:RuleSetRule
        woff:RuleSetRule
    }
    image:RuleSetRule
    data:RuleSetRule
}
export type Loader = GenericLoader & Mapping<WebpackRuleSetRule>
export interface EvaluationScope {
    configuration:ResolvedConfiguration
    isFilePathInDependencies:(_filePath:string) => boolean
    loader:Loader
    require:typeof require
}
// / endregion
// NOTE: Not yet defined in webpack types.
export interface WebpackBaseAssets {
    outputName:string
    plugin:HtmlWebpackPlugin
}
export interface WebpackAssets extends WebpackBaseAssets {
    bodyTags:HtmlWebpackPlugin.HtmlTagObject[]
    headTags:HtmlWebpackPlugin.HtmlTagObject[]
    outputName:string
    publicPath:string
    plugin:HtmlWebpackPlugin
}
export type WebpackPlugin =
    webpackLibrary.AbstractLibraryPlugin<unknown> & Mapping<unknown>
export type WebpackPlugins =
    Mapping<WebpackPlugin> &
    {
        Favicon?:typeof FaviconWebpackPlugin
        GenerateServiceWorker?:typeof OfflinePlugin.GenerateSW
        HTML?:typeof HtmlWebpackPlugin
        ImageMinimizer?:typeof ImageMinimizerWebpackPlugin
        InjectManifest?:typeof OfflinePlugin.InjectManifest
        Offline?:{
            GenerateSW:typeof OfflinePlugin.GenerateSW
            InjectManifest:typeof OfflinePlugin.InjectManifest
        }
        MiniCSSExtract?:typeof MiniCSSExtractPlugin
    }
export type WebpackResolveData =
    // NOTE: Hack to retrieve needed types.
    Parameters<WebpackIgnorePlugin['checkIgnore']>[0]
export type WebpackExtendedResolveData =
    WebpackResolveData &
    {
        createData:{
            rawRequest:string
            request:string
            resource:string
            userRequest:string
        }
    }

export interface HTMLWebpackPluginAssetTagGroupsData {
    bodyTags:HtmlWebpackPlugin.HtmlTagObject[]
    headTags:HtmlWebpackPlugin.HtmlTagObject[]
    outputName:string
    plugin:HtmlWebpackPlugin
}
export interface HTMLWebpackPluginBeforeEmitData {
    html:string
    outputName:string
    plugin:HtmlWebpackPlugin
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
