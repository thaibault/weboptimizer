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
    external:ExternalInjection;
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
    fileNamePattern:string
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
    fileNamePattern:string
}
export type ResolvedConfiguration = {
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
    knownExtensions:Array<string>;
    libraryName:string;
    loader:{
        aliases:Array<string>;
        directories:Array<string>;
        extensions:Array<string>;
    };
    module:{
        aliases:PlainObject;
        cascadingStyleSheet:string;
        directories:Array<string>;
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
        skipParseRegularExpression:RegExp|Array<RegExp>;
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
    build:PlainObject;
    buildDefinition:PlainObject;
    commandLine:{
        build:Command;
        document:Command;
        lint:Command;
        serve:Command;
        test:Command;
        testInBrowser:Command,
        typeCheck:Command
    };
    development:{
        openBrowser:PlainObject;
        server:PlainObject;
        tool:PlainObject
    };
    hashAlgorithm:string;
    loader:{
        aliases:PlainObject;
        extensions:Array<string>;
        directories:Array<string>;
    };
    stylelint:PlainObject;

    document:PlainObject;

    test:PlainObject;

    testInBrowser:PlainObject
}
export type ResolvedBuildConfiguration = Array<ResolvedBuildConfigurationItem>
// TODO
export type WebpackConfiguration = Object
// / endregion
// / region specific callbacks
export type PromiseCallbackFunction = (reason:any) => ?Promise<any>
export type TraverseFilesCallbackFunction = (
    filePath:string, stat:Object
) => ?boolean
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
