#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import path from 'path'
// endregion
// region exports
// / region data structure
export type PlainObject = {[key:string]:any}
export type NormalizedInternalInjection = {[key:string]:Array<string>}
export type InternalInjection =
    string|Array<string>|{[key:string]:string|Array<string>}
export type ExternalInjection = string|Function|RegExp|Array<ExternalInjection>
export type Injection = {
    internal:InternalInjection;
    external:ExternalInjection
}
export type BuildConfiguration = Array<{
    filePaths: Array<string>;
    extension:string;
    outputExtension:string;
    [key:string]:any
}>
export type Paths = {
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
export type MetaConfiguration = {
    default:{
        debug:boolean;
        [key:string]:any
    };
    debug:PlainObject;
    library:PlainObject
}
export type HTMLConfiguration = {
    template:string|String;
    filename:string
}
export type ResolvedCongfiguration = {
    build:PlainObject;
    commandLine:{
        build:string;
        lint:string;
        serve:string;
        test:string
    };
    debug:boolean;
    development:{
        openBrowser:PlainObject;
        server:PlainObject;
        tool:PlainObject
    };
    files:{
        html:Array<HTMLConfiguration>;
        javaScript:string;
        cascadingStyleSheet:string
    };
    givenCommandLineArguments:Array<string>;
    hashAlgorithm:string;
    injection:Injection;
    inPlace:{
        cascadingStyleSheet:boolean;
        javaScript:boolean
    };
    knownExtensions:Array<string>;
    loader:PlainObject;
    module:{
        aliases:PlainObject;
        additionalAliases:PlainObject;
        cascadingStyleSheet:PlainObject;
        html:PlainObject;
        optimizer:{
            data:PlainObject;
            font:{
                eot:PlainObject;
                woff:PlainObject;
                woff2:PlainObject;
                ttf:PlainObject;
                svg:PlainObject
            };
            htmlMinifier:PlainObject;
            image:{file:PlainObject};
            uglifyJS:PlainObject
        };
        preprocessor:{
            jade:PlainObject;
            less:PlainObject;
            modernJavaScript:PlainObject;
            sass:PlainObject;
            scss:PlainObject
        };
        style:PlainObject
    };
    name:string;
    path:Paths;
    test:{injection:Injection}
}
// / endregion
// / region function signatures
export type ExitHandlerFunction = (error:?Error) => ?Error
export type EvaluationFunction = (
    self:?PlainObject, webOptimizerPath:string, currentPath:string,
    path:typeof path
) => any
export type GetterFunction = (keyOrValue:any) => any
export type SetterFunction = (key:any, value:any) => any
export type TraverseFilesCallbackFunction = (
    filePath:string, stat:Object
) => ?boolean
export type ProcedureFunction = () => ?null
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
