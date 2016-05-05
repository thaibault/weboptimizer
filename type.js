#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import path from 'path'
// endregion
// region exports
// / region data structure
export type InternalInjects = string|Array<string>|{[key:string]:string}
export type ExternalInjects = string|Function|RegExp|Array<ExternalInjects>
export type Mapping = {[key:string]:any}
export type Injects = {
    internal:InternalInjects;
    external:ExternalInjects
}
export type BuildConfiguration = {[key:string]:Function&{
    [key:string]:Function&string
}}
export type ResolvedBuildConfiguration = Array<{
    filePaths: Array<string>;
    extension:string;
    outputExtension:string;
    [key:string]:Function&string
}>
export type Paths = {
    source:string;
    target:string;
    asset:{[key:string]:Function&string};
    [key:string]:any;
}
export type MetaConfiguration = {
    default:{debug:boolean;[key:string]:any};
    debug:Mapping;
    library:Mapping
}
export type ResolvedCongfiguration = {
    debug:boolean;
    build:BuildConfiguration;
    injects:Injects;
    path:Paths;
    [key:string]:any
}
// / endregion
// / region function signatures
export type ExitFunction = (error:?Error) => ?Error
export type EvaluationFunction = (
    self:any,
    resolve:(
        object:any, configuration:?Mapping, deep:boolean,
        evaluationIndicatorKey:string
    ) => any,
    webOptimizerPath:string, currentPath:string, path:typeof path
) => any
export type GetterFunction = (keyOrValue:any) => any
export type SetterFunction = (key:any, value:any) => any
export type TraverseFilesCallbackFunction = (
    filePath:string, stat:Object
) => ?boolean
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
