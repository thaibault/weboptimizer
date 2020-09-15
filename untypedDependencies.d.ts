// -*- coding: utf-8 -*-
/** @module untyptedDependencies */
declare module 'babel-preset-minify'
declare module 'html-loader'
declare module 'webOptimizerDefaultTemplateFilePath'
/*
    NOTE: We have to avoid importing this from "clientnode/type" to avoid a
    dependency cycle.
*/
type Mapping = {[key:string]:string}
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
