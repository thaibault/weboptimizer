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
export type InternalInjection = string|Array<string>|PlainObject
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
    source:string;
    target:string;
    asset:PlainObject;
    [key:string]:any;
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
    template:string;
    [key:string]:any
}
export type ResolvedCongfiguration = {
    debug:boolean;
    build:PlainObject;
    injection:Injection;
    path:Paths;
    files:{html:Array<HTMLConfiguration>}
    [key:string]:any
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
