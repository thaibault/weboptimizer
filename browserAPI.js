// #!/usr/bin/env node
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
import type {
    Browser,
    DomNode,
    OnDomContentLoadedListenerFunction,
    Window
} from './type'
 // endregion
// region declaration
declare var TARGET:string
declare var window:Window
// endregion
// region constants
const onDomContentLoadedListener:Array<OnDomContentLoadedListenerFunction> = []
// endregion
// region functions
let windowWithLoadedDomContent:?Browser = null
const onDomContentLoaded:Function = (window:Window, metaDOM:?Object):void => {
    windowWithLoadedDomContent = {window, metaDOM}
    for (
        const callback:OnDomContentLoadedListenerFunction of
        onDomContentLoadedListener
    )
        callback({window, metaDOM}, false)
}
const registerOnDomContentLoaded:Function = (
    window:Window, metaDOM:?Object = null
):void =>
    window.document.addEventListener('DOMContentLoaded', ():void =>
        onDomContentLoaded(window, metaDOM))
// endregion
// region ensure presence of common browser environment
if (typeof TARGET === 'undefined' || TARGET === 'node') {
    // region mock browser environment
    const fileSystem:Object = require('fs')
    const path:Object = require('path')
    const metaDOM:Object = require('jsdom')
    metaDOM.env({
        created: (error:?Error, window:Object):void => {
            if (error)
                throw error
            else
                registerOnDomContentLoaded(window, metaDOM)
        },
        features: {
            FetchExternalResources: [
                'script', 'frame', 'iframe', 'link', 'img'
            ],
            ProcessExternalResources: ['script'],
            SkipExternalResources: false
        },
        html: `
            <!doctype html>
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <!--Prevent browser caching-->
                        <meta http-equiv="cache-control" content="no-cache">
                        <meta http-equiv="expires" content="0">
                        <meta http-equiv="pragma" content="no-cache">
                        <title>test</title>
                        <link
                            href="/node_modules/qunitjs/qunit/qunit.css"
                            rel="stylesheet" type="text/css"
                        >
                    </head>
                <body>
                    <div id="qunit"></div>
                    <div id="qunit-fixture"></div>
                </body>
            </html>
        `,
        resourceLoader: (
            resource:{
                element:DomNode;
                url:{[key:string]:string};
                cookie:string;
                baseUrl:string;
                defaultFetch:(callback:(
                    error:?Error, body:string
                ) => void) => void
            }, callback:(error:?Error, body:string) => void
        ):void => {
            if (resource.url.host === 'localhost')
                return callback(null, fileSystem.readFileSync(path.join(
                    process.cwd(), resource.url.pathname
                ), {encoding: 'utf-8'}))
            return resource.defaultFetch(callback)
        },
        url: 'http://localhost',
        virtualConsole: metaDOM.createVirtualConsole().sendTo(console)
    })
    // endregion
} else
    registerOnDomContentLoaded(window)
// endregion
export default (callback:OnDomContentLoadedListenerFunction):void => {
    if (windowWithLoadedDomContent)
        callback(windowWithLoadedDomContent, true)
    else
        onDomContentLoadedListener.push(callback)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
