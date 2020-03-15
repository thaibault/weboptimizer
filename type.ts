#!/usr/bin/env nodedd
// -*- coding: utf-8 -*-
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
import {Mapping, PlainObject, ProcedureFunction} from 'clientnode/type'
// endregion
// region exports
// / region generic
export type Browser = {
    debug:boolean;
    domContentLoaded:boolean;
    DOM:null|Object;
    initialized:boolean;
    instance:null|Object;
    window:null|Window;
    windowLoaded:boolean;
}
export type PackageConfiguration = {
    name:string;
    version:string;
}
export type PackageDescriptor = {
    configuration:PackageConfiguration;
    filePath:string;
}
export type Replacement = ((
    substring:string, ...parameter:Array<any>
) => string)|string
export type Replacements = {[key:string]:Replacement}
export type Resolvable = {
    [TYPE in '__evaluate__'|'__execute__'|string]:any|Resolvable|string
}
// / endregion
// / region injection
export type ExternalAliases = {[key:string]:{[key:string]:Function|string}}
export type ExternalInjection = string|((
    context:string, request:string, callback:ProcedureFunction
) => void)|RegExp|Array<ExternalInjection>
export type GivenInjection =
    Function|string|Array<string>|{[key:string]:string|Array<string>}
export type NormalizedGivenInjection = {[key:string]:Array<string>}
export type GivenInjectionConfiguration = {
    autoExclude:Array<string>;
    entry:GivenInjection;
    external:GivenInjection;
}
export type InjectionConfiguration = {
    autoExclude:Array<string>;
    chunks:PlainObject;
    dllChunkNames:Array<string>;
    entry:{
        given:GivenInjection;
        normalized:NormalizedGivenInjection;
    };
    external:{
        aliases:ExternalAliases;
        implicit:{
            pattern:{
                exclude:Array<RegExp|string>;
                include:Array<RegExp|string>;
            };
        };
        modules:ExternalInjection;
    };
    externalAliases:Mapping;
    ignorePattern:Array<string>;
    implicitExternalExcludePattern:Array<RegExp|string>;
    implicitExternalIncludePattern:Array<RegExp|string>;
}
// / endregion
// / region configuration
// // region path
export type AssetPath = {
    base:string;
    cascadingStyleSheet:string;
    data:string;
    font:string;
    image:string;
    javaScript:string;
    template:string;
}
export type Path = {
    apiDocumentation:string;
    base:string;
    configuration:{
        javaScript:string;
        json:string;
        typeScript:string;
    };
    context:string;
    ignore:Array<string>;
    source:{
        asset:AssetPath;
        base:string;
    };
    target:{
        asset:AssetPath;
        base:string;
        manifest:string;
        public:string;
    };
    tidyUp:Array<string>;
    tidyUpOnClear:Array<string>;
}
// // endregion
// // region build
export type BuildConfigurationItem = {
    extension:string;
    outputExtension:string;
    filePathPattern:string;
}
export type BuildConfiguration = {[key:string]:BuildConfigurationItem}
// // endregion
// // region loader
export type AdditionalLoaderConfiguration = {
    exclude?:string;
    include?:string;
    test:string;
    use:string;
}
export type AdditionalLoaderConfigurations = {
    post:Array<AdditionalLoaderConfiguration>;
    pre:Array<AdditionalLoaderConfiguration>;
}
export type AdditionalLoader = {
    post:Array<string>;
    pre:Array<string>;
}
export type WebpackLoader = {
    loader:string;
    options?:PlainObject;
}
export type LoaderConfiguration = WebpackLoader & {
    additional:AdditionalLoader;
    exclude:string;
    include:string;
    regularExpression:string;
}
export type WebpackLoaderConfiguration = {
    exclude:WebpackLoaderIndicator;
    include:WebpackLoaderIndicator;
    test:RegExp;
    use:Array<WebpackLoader>|WebpackLoader;
}
export type WebpackLoaderIndicator =
    Array<WebpackLoaderIndicator>|Function|string
// // endregion
export type AssetPositionPattern = {[key:string]:'body'|'head'|'in'|string}|null
export type AssetInPlaceInjectionResult = {
    content:string;
    filePathsToRemove:Array<string>;
}
export type Command = {
    arguments:Array<string>;
    command:string;
    indicator?:string;
}

export type NodeEnvironment = {'#':string;[key:string]:boolean|string}
export type PluginConfiguration = {
    name:{
        initializer:string;
        module:string;
    };
    parameter:Array<any>;
}
export type DefaultConfiguration = {
    contextType:string;
    debug:boolean;
    dllManifestFilePaths:Array<string>;
    document:PlainObject;
    encoding:string;
    givenCommandLineArguments:Array<string>;
    library:boolean;
    nodeEnvironment:NodeEnvironment;
    path:Resolvable;
    plugins:Array<PluginConfiguration>;
    test:PlainObject;
    'test:browser':PlainObject;
}
/* eslint-disable max-len */
export type ExportFormat = 'amd'|'amd-require'|'assign'|'global'|'jsonp'|'var'|'this'|'commonjs'|'commonjs2'|'umd';
/* eslint-enable max-len */
export type HTMLConfiguration = {
    filename:string;
    template:{
        filePath:string;
        options?:PlainObject;
        postCompileSteps:number;
        request:string|string;
        use:Array<WebpackLoader>|WebpackLoader;
    };
}
export type MetaConfiguration = {
    default:DefaultConfiguration;
    debug:Resolvable;
    library:Resolvable;
}
export type ResolvedBuildConfigurationItem = {
    filePaths:Array<string>;
    extension:string;
    outputExtension:string;
    filePathPattern:string;
}
export type Extensions = {
    file:{
        external:Array<string>;
        internal:Array<string>;
    };
    module:Array<string>;
}
export type SpecificExtensions = {
    file:Array<string>;
    module:Array<string>;
}
export type ResolvedConfiguration = {
    assetPattern:{
        [key:string]:{
            excludeFilePathRegularExpression:string;
            pattern:string;
        }
    };
    buildContext:{
        definitions:PlainObject;
        types:BuildConfiguration;
    };
    cache:{
        main:boolean;
        unsafe:boolean;
    };
    commandLine:{
        build:Command;
        document:Command;
        lint:Command;
        serve:Command;
        test:Command;
        'test:browser':Command;
        'check:types':Command;
    };
    contextType:string;
    debug:boolean;
    development:{
        openBrowser:PlainObject;
        server:PlainObject;
        tool:false|string;
    };
    dllManifestFilePaths:Array<string>;
    document:PlainObject;
    encoding:string;
    exportFormat:{
        external:ExportFormat;
        self:ExportFormat;
    };
    extensions:Extensions;
    favicon:{
        logo:string;
        [key:string]:any;
    };
    files:{
        additionalPaths:Array<string>;
        compose:{
            cascadingStyleSheet:string;
            image:string;
            javaScript:string;
        };
        defaultHTML:HTMLConfiguration;
        html:Array<HTMLConfiguration>;
    };
    givenCommandLineArguments:Array<string>;
    hashAlgorithm:string;
    injection:InjectionConfiguration;
    inPlace:{
        cascadingStyleSheet:{[key:string]:'body'|'head'|'in'|string};
        externalLibrary:{
            normal:boolean;
            dynamic:boolean;
        };
        javaScript:{[key:string]:'body'|'head'|'in'|string};
        otherMaximumFileSizeLimitInByte:number;
    };
    library:boolean;
    libraryName:string;
    loader:{
        aliases:Mapping;
        directoryNames:Array<string>;
        extensions:{
            file:Array<string>;
            module:Array<string>;
        };
    };
    module:{
        additional:AdditionalLoaderConfigurations;
        aliases:Mapping;
        cascadingStyleSheet:LoaderConfiguration;
        directoryNames:Array<string>;
        html:LoaderConfiguration;
        locations:{
            directoryPaths:Array<string>;
            filePaths:Array<string>;
        };
        optimizer:{
            babelMinify?:{
                bundle?:{
                    plugin?:PlainObject;
                    transform?:PlainObject;
                };
                module?:PlainObject;
            };
            cssnano:PlainObject;
            data:LoaderConfiguration;
            font:{
                eot:LoaderConfiguration;
                svg:LoaderConfiguration;
                ttf:LoaderConfiguration;
                woff:LoaderConfiguration;
            };
            htmlMinifier?:PlainObject;
            image:{
                additional:AdditionalLoader;
                content:PlainObject;
                exclude:string;
                file:PlainObject;
                loader:string;
            };
            minimize:boolean;
            minimizer:Array<PlainObject>;
        };
        preprocessor:{
            cascadingStyleSheet:WebpackLoader & {
                additional:{
                    plugins:AdditionalLoader;
                    post:Array<string>;
                    pre:Array<string>;
                };
                postcssPresetEnv:PlainObject;
            };
            ejs:LoaderConfiguration;
            html:LoaderConfiguration;
            javaScript:LoaderConfiguration;
            json:{
                exclude:string;
                loader:string;
            };
        };
        provide:{[key:string]:string};
        replacements:{
            context:Array<Array<string>>;
            normal:Replacements;
        };
        skipParseRegularExpressions:RegExp|Array<RegExp>;
        style:WebpackLoader;
    };
    name:string;
    needed:{[key:string]:boolean};
    nodeEnvironment:NodeEnvironment;
    offline:PlainObject & {excludes:Array<string>};
    package:{
        aliasPropertyNames:Array<string>;
        main:{
            fileNames:Array<string>;
            propertyNames:Array<string>;
        };
    };
    path:Path;
    performanceHints:{hints:false|string;};
    plugins:Array<PluginConfiguration>;
    showConfiguration:boolean;
    stylelint:PlainObject;
    /* eslint-disable max-len */
    targetTechnology:'web'|'webworker'|'node'|'async-node'|'node-webkit'|'electron'|'electron-renderer';
    /* eslint-enable max-len */
    test:PlainObject;
    'test:browser':PlainObject;
    webpack:WebpackConfiguration;
}
export type ResolvedBuildConfiguration = Array<ResolvedBuildConfigurationItem>
export type WebpackConfiguration = {
    cache:boolean;
    context:string;
    devtool:false|string;
    devServer:PlainObject;
    // region input
    entry:PlainObject;
    externals:ExternalInjection;
    resolve:{
        alias:Mapping;
        extensions:Array<string>;
        moduleExtensions:Array<string>;
        modules:Array<string>;
        unsafeCache:boolean;
        aliasFields:Array<string>;
        mainFields:Array<string>;
        mainFiles:Array<string>;
    };
    resolveLoader:{
        alias:Mapping;
        extensions:Array<string>;
        moduleExtensions:Array<string>;
        modules:Array<string>;
        aliasFields:Array<string>;
        mainFields:Array<string>;
        mainFiles:Array<string>;
    };
    // endregion
    // region output
    output:{
        filename:string;
        hashFunction:string;
        library:string;
        libraryTarget:string;
        path:string;
        publicPath:string;
        umdNamedDefine:boolean;
    };
    target:string;
    // endregion
    module:{
        noParse?:RegExp|Array<RegExp>;
        rules:Array<PlainObject>;
    };
    performance:{
        hints:false|string;
    };
    plugins:Array<PlainObject>;
    replaceWebOptimizer:WebpackConfiguration;
}
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion