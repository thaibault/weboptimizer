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
// region exports
// / region generic
// // region browser
export type DomNode = any
export type Location = {
    hash:string;
    search:string;
    pathname:string;
    port:string;
    hostname:string;
    host:string;
    protocol:string;
    origin:string;
    href:string;
    username:string;
    password:string;
    assign:Function;
    reload:Function;
    replace:Function;
    toString:() => string
}
export type Storage = {
    getItem(key:string):any;
    setItem(key:string, value:any):void;
    removeItem(key:string, value:any):void;
}
export type Window = {
    addEventListener:(type:string, callback:Function) => void;
    document:Object;
    location:Location;
    localStorage:Storage;
    sessionStorage:Storage;
    close:() => void;
}
// // endregion
export type BrowserAPI = {
    debug:boolean;
    domContentLoaded:boolean;
    metaDOM:?Object;
    window:Window;
    windowLoaded:boolean;
}
export type PlainObject = {[key:string]:any}
export type ProcedureFunction = () => void
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
    library:boolean;
    path:Path;
    test:Object;
    testInBrowser:Object
}
export type ExportFormat = 'var'|'this'|'commonjs'|'commonjs2'|'amd'|'umd';
export type HTMLConfiguration = {
    template:string|String;
    filename:string
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
    file:Array<string>;
    module:Array<string>;
}
export type ResolvedConfiguration = {
    cache:{
        main:boolean;
        unsafe:boolean;
    };
    contextType:string;
    dllManifestFilePaths:Array<string>;
    givenCommandLineArguments:Array<string>;
    name:string;
    needed:{[key:string]:boolean};

    debug:boolean;
    library:boolean;

    exportFormat:{
        external:ExportFormat;
        self:ExportFormat;
    };
    favicon:{
        logo:string;
        [key:string]:any
    };
    files:{
        compose:{
            cascadingStyleSheet:string;
            image:string;
            javaScript:string;
        };
        additionalPaths:Array<string>;
        defaultHTML:HTMLConfiguration;
        html:Array<HTMLConfiguration>;
    };
    injection:PlainObject;
    inPlace:{
        cascadingStyleSheet:boolean;
        externalLibrary:{
            normal:boolean;
            dynamic:boolean;
        };
        javaScript:boolean;
        otherMaximumFileSizeLimitInByte:number
    };
    package:{
        main:{
            propertyNames:Array<string>;
            fileNames:Array<string>;
        };
        aliasPropertyNames:Array<string>
    };
    extensions:Extensions;
    libraryName:string;
    loader:{
        aliases:Array<string>;
        directoryNames:Array<string>;
        extensions:Extensions;
    };
    module:{
        aliases:PlainObject;
        cascadingStyleSheet:string;
        directoryNames:Array<string>;
        html:PlainObject;
        locations:{[key:string]:Array<string>};
        optimizer:{
            data:PlainObject;
            font:{
                eot:PlainObject;
                woff:PlainObject;
                ttf:PlainObject;
                svg:PlainObject
            };
            htmlMinifier:PlainObject;
            image:{
                content:PlainObject;
                file:PlainObject
            };
            uglifyJS:PlainObject
        };
        preprocessor:{
            cascadingStyleSheet:string;
            pug:PlainObject;
            less:PlainObject;
            babel:PlainObject;
            sass:PlainObject;
            scss:PlainObject
        };
        provide:{[key:string]:string};
        style:PlainObject;
        skipParseRegularExpressions:RegExp|Array<RegExp>;
    };
    offline:{excludes:Array<string>};
    path:Path;
    /* eslint-disable max-len */
    targetTechnology:'web'|'webworker'|'node'|'async-node'|'node-webkit'|'electron'|'electron-renderer';
    /* eslint-enable max-len */

    assetPattern:{[key:string]:{
        excludeFilePathRegularExpression:string;
        pattern:string
    }};
    build:{
        definitions:PlainObject;
        types:PlainObject;
    };
    commandLine:{
        build:Command;
        document:Command;
        lint:Command;
        serve:Command;
        test:Command;
        testInBrowser:Command;
        typeCheck:Command;
    };
    development:{
        openBrowser:PlainObject;
        server:PlainObject;
        tool:false|string;
    };
    hashAlgorithm:string;
    loader:{
        aliases:PlainObject;
        extensions:Extensions;
        directoryNames:Array<string>;
    };
    stylelint:PlainObject;

    document:PlainObject;

    test:PlainObject;

    testInBrowser:PlainObject
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
        noParse:RegExp|Array<RegExp>;
        loaders:Array<PlainObject>;
    },
    plugins:Array<Object>;
}
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
