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
/* eslint-disable no-unused-vars */
import type {Browser, DomNode, Window} from './type'
/* eslint-enable no-unused-vars */
 // endregion
// region declaration
declare var TARGET:string
declare var window:Window
// endregion
// region variables
const onCreatedListener:Array<Function> = []
let browser:Browser
// endregion
// region ensure presence of common browser environment
if (typeof TARGET === 'undefined' || TARGET === 'node') {
    // region mock browser environment
    const path:Object = require('path')
    const metaDOM:Object = require('jsdom')
    const virtualConsole:Object = metaDOM.createVirtualConsole().sendTo(
        console, {omitJsdomErrors: true})
    virtualConsole.on('jsdomError', (error):void => {
        if (error.type === 'resource loading')
            console.warn(
                `Loading resource "${resource.url.href}" failed: ${error}.`)
        else
            console.error(error.stack, error.detail)
    })
    metaDOM.env({
        created: (error:?Error, window:Object):void => {
            browser = {debug: false, metaDOM, window}
            if (error)
                throw error
            else
                for (const callback:Function of onCreatedListener)
                    callback(browser, false)
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
                url:{
                    hostname:string;
                    host:string;
                    port:?string;
                    protocol:string;
                    href:string;
                    path:string;
                    pathname:string;
                };
                cookie:string;
                baseUrl:string;
                defaultFetch:(callback:(
                    error:?Error, body:string
                ) => void) => void
            }, callback:(error:?Error, body:string) => void
        ):void => {
            if (resource.url.hostname === 'localhost') {
                resource.url.host = resource.url.hostname = ''
                resource.url.port = null
                resource.url.protocol = 'file:'
                resource.url.href = resource.url.href.replace(
                    /^[a-zA-Z]+:\/\/localhost(?::[0-9]+)?/,
                    `file://${process.cwd()}`)
                resource.url.path = resource.url.pathname = path.join(
                    process.cwd(), resource.url.path)
            }
            if (browser.debug)
                console.info(`Load resource "${resource.url.href}".`)
            return resource.defaultFetch(callback)
        },
        url: 'http://localhost',
        virtualConsole
    })
    // endregion
} else {
    browser = {debug: false, metaDOM: null, window}
    for (const callback:Function of onCreatedListener)
        callback(browser, false)
}
// endregion
export default (callback:Function):?number =>
    (browser) ? callback(browser, true) : onCreatedListener.push(callback)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
