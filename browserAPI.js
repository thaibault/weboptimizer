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
let initialized:boolean = false
// endregion
// region ensure presence of common browser environment
if (typeof TARGET === 'undefined' || TARGET === 'node') {
    // region mock browser environment
    const fileSystem:Object = require('fs')
    const path:Object = require('path')
    const metaDOM:Object = require('jsdom')
    const virtualConsole:Object = metaDOM.createVirtualConsole().sendTo(
        console, {omitJsdomErrors: true})
    virtualConsole.on('jsdomError', (error:Error):void => {
        // IgnoreTypeCheck
        if (error.type === 'resource loading')
            console.warn(`Loading resource failed: ${error.toString()}.`)
        else
            console.error(error)
    })
    let templateFilePath:string = path.join(__dirname, 'test.html')
    try {
        fileSystem.accessSync(templateFilePath, fileSystem.F_OK)
    } catch (error) {
        templateFilePath = path.join(
            process.cwd(), __dirname, 'node_modules/webOptimizer/test.html')
    }
    metaDOM.env({
        created: (error:?Error, window:Object):void => {
            browser = {debug: false, domContentLoaded: false, metaDOM, window}
            browser.window.document.addEventListener('DOMContentLoaded', (
            ):void => {
                browser.domContentLoaded = true
            })
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
        html: fileSystem.readFileSync(templateFilePath, {encoding: 'utf-8'}),
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
            return resource.defaultFetch(function(error:?Error):void {
                if (!error)
                    callback.apply(this, arguments)
            })
        },
        url: 'http://localhost',
        virtualConsole
    })
    // endregion
} else {
    browser = {debug: false, domContentLoaded: false, metaDOM: null, window}
    browser.window.document.addEventListener('DOMContentLoaded', (
    ):void => {
        browser.domContentLoaded = true
    })
}
// endregion
export default (callback:Function):any => {
    if (typeof TARGET === 'undefined' || TARGET === 'node')
        return (browser) ? callback(browser, true) : onCreatedListener.push(
            callback)
    const result:any = callback(browser, initialized)
    initialized = true
    return result
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
