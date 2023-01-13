// -*- coding: utf-8 -*-
/*
    NOTE: We have to avoid importing this from "clientnode/type" to avoid a
    dependency cycle.
*/
type Mapping<T = string> = {[key:string]:T}

interface PostcssTransformer {
    postcssPlugin: string
    postcssVersion: string

    (root:object, result:object):Promise<void>|void
}

/** @module declarations */
declare module 'babel-preset-minify'
declare module 'glob-all' {
    export default function(globs:Array<string>):Promise<Array<string>>
    export function sync(globs:Array<string>):Array<string>
}
declare module 'html-loader'
declare module 'postcss-fontpath' {
    export default function(options:Partial<{
        checkPath:boolean
        formats:Array<{
            ext:string
            type:string
        }>
    }>):PostcssTransformer
}
declare module 'postcss-sprites' {
    export default function(options:Partial<{
        filterBy:() => Promise<void>
        hooks:{
            onSaveSpritesheet:(_image:Mapping<unknown>) => string
            onUpdateRule:(
                _rule:PostcssNode, _token:PostcssNode, _image:Mapping<unknown>
            ) => void
        }
        spritePath:string
        stylesheetPath:null|string
        verbose:boolean
    }>):PostcssTransformer
}
declare module 'webOptimizerDefaultTemplateFilePath'
declare module 'svgo' {
    export type Options = any
}
declare module '*.module' {
    const classes:Mapping
    export default classes
}
declare module '*.module.css' {
    const classes:Mapping
    export default classes
}
declare module '*.module.scss' {
    const classes:Mapping
    export default classes
}
declare module '*.module.sass' {
    const classes:Mapping
    export default classes
}
declare module '*.module.less' {
    const classes:Mapping
    export default classes
}
declare module '*.module.styl' {
    const classes:Mapping
    export default classes
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
