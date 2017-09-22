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
import type {PlainObject, ProcedureFunction, Window} from 'clientnode'
// endregion
// region exports
// / region generic
export type BrowserAPI = {
    debug:boolean;
    domContentLoaded:boolean;
    DOM:?Object;
    window:Window;
    windowLoaded:boolean;
}
// / endregion
// / region injection
export type ExternalInjection = string|((
    context:string, request:string, callback:ProcedureFunction
) => void)|RegExp|Array<ExternalInjection>
export type InternalInjection =
    string|Array<string>|{[key:string]:string|Array<string>}
export type NormalizedInternalInjection = {[key:string]:Array<string>}
export type Injection = {
    autoExclude:Array<string>;
    commonChunkIDs:Array<string>;
    dllChunkIDs:Array<string>;
    external:{
        aliases:PlainObject;
        implicit:{
            pattern:{
                exclude:Array<RegExp|string>;
                include:Array<RegExp|string>;
            };
        };
        modules:ExternalInjection;
    };
    externalAliases:PlainObject;
    ignorePattern:Array<string>;
    implicitExternalExcludePattern:Array<RegExp|string>;
    implicitExternalIncludePattern:Array<RegExp|string>;
    internal:{
        given:InternalInjection;
        normalized:NormalizedInternalInjection
    };
}
// / endregion
// / region configuration
export type AssetPath = {
    base:string;
    cascadingStyleSheet:string;
    data:string;
    font:string;
    image:string;
    javaScript:string;
    source:string;
    target:string;
    template:string;
}
export type BuildConfigurationItem = {
    extension:string;
    outputExtension:string;
    filePathPattern:string
}
export type BuildConfiguration = {[key:string]:BuildConfigurationItem}
export type Command = {
    arguments:Array<string>;
    command:string;
    indicator:?string;
}
export type Path = {
    apiDocumentation:string;
    base:string;
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
    tidyUp:Array<string>
}
export type DefaultConfiguration = {
    contextType:string;
    debug:boolean;
    dllManifestFilePaths:Array<any>;
    document:Object;
    encoding:string;
    library:boolean;
    nodeEnvironment:{[key:string]:boolean|'empty'|'mock'};
    path:Path;
    test:Object;
    'test:browser':Object
}
export type ExportFormat = 'var'|'this'|'commonjs'|'commonjs2'|'amd'|'umd';
export type HTMLConfiguration = {
    filename:string;
    template:{
        filePath:string;
        request:string|String;
        use:Array<{loader:string;options:Object}>;
    };
}
export type MetaConfiguration = {
    default:DefaultConfiguration;
    debug:PlainObject;
    library:PlainObject
}
export type ResolvedBuildConfigurationItem = {
    filePaths:Array<string>;
    extension:string;
    outputExtension:string;
    filePathPattern:string
}
export type Extensions = {
    file:{
        external:Array<string>;
        internal:Array<string>;
    };
    module:Array<string>;
}
export type LoaderConfiguration = {
    additional:Array<string>;
    exclude:string;
    include:string;
    loader:string;
    options:Object;
}
export type ResolvedConfiguration = {
    assetPattern:{[key:string]:{
        excludeFilePathRegularExpression:string;
        pattern:string
    }};
    build:{
        definitions:PlainObject;
        types:PlainObject;
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
        'check:type':Command;
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
    injection:PlainObject;
    inPlace:{
        cascadingStyleSheet:{[key:string]:'body'|'head'|'in'};
        externalLibrary:{
            normal:boolean;
            dynamic:boolean;
        };
        javaScript:{[key:string]:'body'|'head'|'in'};
        otherMaximumFileSizeLimitInByte:number;
    };
    library:boolean;
    libraryName:string;
    loader:{
        aliases:PlainObject;
        directoryNames:Array<string>;
        extensions:{
            file:Array<string>;
            module:Array<string>;
        };
    };
    module:{
        additional:Array<PlainObject>;
        aliases:PlainObject;
        cascadingStyleSheet:LoaderConfiguration;
        directoryNames:Array<string>;
        html:LoaderConfiguration;
        locations:{filePaths:Array<string>;directoryPaths:Array<string>};
        optimizer:{
            data:LoaderConfiguration;
            font:{
                eot:LoaderConfiguration;
                svg:LoaderConfiguration;
                ttf:LoaderConfiguration;
                woff:LoaderConfiguration;
            };
            htmlMinifier:PlainObject;
            image:{
                additional:Array<string>;
                content:PlainObject;
                exclude:string;
                file:PlainObject;
                loader:string;
            };
            babelMinify:PlainObject
        };
        preprocessor:{
            cascadingStyleSheet:{
                additional:Array<string>;
                loader:string;
                options:Object;
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
            normal:{[key:string]:Function|string};
        };
        skipParseRegularExpressions:RegExp|Array<RegExp>;
        style:PlainObject;
    };
    name:string;
    needed:{[key:string]:boolean};
    nodeEnvironment:{[key:string]:boolean|'empty'|'mock'};
    offline:PlainObject;
    package:{
        aliasPropertyNames:Array<string>;
        main:{
            fileNames:Array<string>;
            propertyNames:Array<string>;
        };
    };
    path:Path;
    performanceHints:{
        hints:false|string;
    };
    showConfiguration:boolean;
    stylelint:PlainObject;
    /* eslint-disable max-len */
    targetTechnology:'web'|'webworker'|'node'|'async-node'|'node-webkit'|'electron'|'electron-renderer';
    /* eslint-enable max-len */
    test:PlainObject;
    'test:browser':PlainObject
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
        alias:PlainObject;
        extensions:Array<string>;
        moduleExtensions:Array<string>;
        modules:Array<string>;
        unsafeCache:boolean;
        aliasFields:Array<string>;
        mainFields:Array<string>;
        mainFiles:Array<string>;
    },
    resolveLoader:{
        alias:PlainObject;
        extensions:Array<string>;
        moduleExtensions:Array<string>;
        modules:Array<string>;
        aliasFields:Array<string>;
        mainFields:Array<string>;
        mainFiles:Array<string>;
    },
    // endregion
    // region output
    output:{
        filename:string;
        hashFunction:string;
        library:string;
        libraryTarget:string;
        path:string;
        publicPath:string;
        pathinfo:boolean;
        umdNamedDefine:boolean;
    },
    target:string;
    // endregion
    module:{
        noParse?:RegExp|Array<RegExp>;
        rules:Array<PlainObject>;
    },
    performance:{
        hints:false|string;
    };
    plugins:Array<Object>;
}
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
