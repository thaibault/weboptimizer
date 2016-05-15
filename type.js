#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import path from 'path'
// endregion
// region exports
// / region generic
export type GetterFunction = (keyOrValue:any) => any
export type SetterFunction = (key:any, value:any) => any
export type ProcedureFunction = () => ?null
export type PlainObject = {[key:string]:any}
// / endregion
// / region injection
export type NormalizedInternalInjection = {[key:string]:Array<string>}
export type InternalInjection =
    string|Array<string>|{[key:string]:string|Array<string>}
export type ExternalInjection = string|((
    context:string, request:string, callback:ProcedureFunction
) => ?null)|RegExp|Array<ExternalInjection>
export type Injection = {
    internal:InternalInjection;
    external:ExternalInjection
}
// / endregion
// / region configuration
export type BuildConfigurationItem = {
    extension:string;
    outputExtension:string;
    fileNamePattern:string
}
export type ResolvedBuildConfigurationItem = {
    filePaths:Array<string>;
    extension:string;
    outputExtension:string;
    fileNamePattern:string
}
export type BuildConfiguration = {[key:string]:BuildConfigurationItem}
export type ResolvedBuildConfiguration = Array<ResolvedBuildConfigurationItem>
export type Paths = {
    apiDocumentation:string;
    asset:{
        cascadingStyleSheet:string;
        coffeeScript:string;
        data:string;
        font:string;
        image:string;
        javaScript:string;
        less:string;
        publicTarget:string;
        sass:string;
        scss:string;
        source:string;
        target:string;
        template:string;
    };
    context:string;
    ignore:Array<string>;
    manifest:string;
    source:string;
    target:string;
    tidyUp:Array<string>
}
export type DefaultConfiguration = {
    debug:boolean;
    path:{context:string}
}
export type MetaConfiguration = {
    default:DefaultConfiguration;
    debug:PlainObject;
    library:PlainObject
}
export type HTMLConfiguration = {
    template:string|String;
    filename:string
}
export type ResolvedConfiguration = {
    name:string;
    givenCommandLineArguments:Array<string>;

    debug:boolean;
    library:boolean;

    exportFormat:'var'|'this'|'commonjs'|'commonjs2'|'amd'|'umd';
    files:{
        cascadingStyleSheet:string;
        html:Array<HTMLConfiguration>;
        javaScript:string;
    };
    injection:Injection;
    inPlace:{
        cascadingStyleSheet:boolean;
        externalLibrary:boolean;
        javaScript:boolean;
        otherMaximumFileSizeLimitInByte:number
    };
    knownExtensions:Array<string>;
    module:{
        additionalAliases:PlainObject;
        aliases:PlainObject;
        cascadingStyleSheet:PlainObject;
        html:PlainObject;
        optimizer:{
            data:PlainObject;
            font:{
                eot:PlainObject;
                woff:PlainObject;
                ttf:PlainObject;
                svg:PlainObject
            };
            htmlMinifier:PlainObject;
            image:{file:PlainObject};
            uglifyJS:PlainObject
        };
        preprocessor:{
            pug:PlainObject;
            less:PlainObject;
            modernJavaScript:PlainObject;
            sass:PlainObject;
            scss:PlainObject
        };
        style:PlainObject
    };
    offline:{excludes:Array<string>};
    path:Paths;
    /* eslint-disable max-len */
    target:'web'|'webworker'|'node'|'async-node'|'node-webkit'|'electron'|'electron-renderer';
    /* eslint-enable max-len */

    assetPattern:{[key:string]:string};
    build:PlainObject;
    commandLine:{
        build:string;
        document:string;
        lint:string;
        serve:string;
        test:string;
        testInBrowser:string
    };
    development:{
        openBrowser:PlainObject;
        server:PlainObject;
        tool:PlainObject
    };
    hashAlgorithm:string;
    loader:PlainObject;

    document:PlainObject;

    test:PlainObject;

    testInBrowser:{injection:Injection}
}
// / endregion
// / region specific callbacks
export type ErrorHandlerFunction = (error:?Error) => ?Error
export type EvaluationFunction = (
    self:?PlainObject, webOptimizerPath:string, currentPath:string,
    path:typeof path
) => any
export type TraverseFilesCallbackFunction = (
    filePath:string, stat:Object
) => ?boolean
export type PromiseCallbackFunction = (reason:any) => ?Promise
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
