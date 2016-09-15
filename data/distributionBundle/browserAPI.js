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
import type {BrowserAPI, DomNode, Window} from './type'
/* eslint-enable no-unused-vars */
 // endregion
// region declaration
declare var NAME:string
declare var TARGET_TECHNOLOGY:string
declare var window:Window
// endregion
// region variables
const onCreatedListener:Array<Function> = []
let browserAPI:BrowserAPI
// endregion
// region ensure presence of common browser environment
if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') {
    // region mock browser environment
    const path:Object = require('path')
    const metaDOM:Object = require('jsdom')
    const virtualConsole:Object = metaDOM.createVirtualConsole().sendTo(
        console, {omitJsdomErrors: true})
    virtualConsole.on('jsdomError', (error:Error):void => {
        if (!browserAPI.debug && [
            'XMLHttpRequest', 'resource loading'
        // IgnoreTypeCheck
        ].includes(error.type))
            console.warn(`Loading resource failed: ${error.toString()}.`)
        else
            // IgnoreTypeCheck
            console.error(error.stack, error.detail)
    })
    let template:string
    if (typeof NAME === 'undefined' || NAME === 'webOptimizer')
        template = require('pug').compileFile(path.join(
            __dirname, 'index.pug'
        ), {pretty: true})({configuration: {
            name: 'test', givenCommandLineArguments: []
        }})
    else
        // IgnoreTypeCheck
        template = require('webOptimizerDefaultTemplateFilePath')
    metaDOM.env({
        created: (error:?Error, window:Object):void => {
            browserAPI = {
                debug: false, domContentLoaded: false, metaDOM, window,
                windowLoaded: false}
            browserAPI.window.document.addEventListener('DOMContentLoaded', (
            ):void => {
                browserAPI.domContentLoaded = true
            })
            if (error)
                throw error
            else
                for (const callback:Function of onCreatedListener)
                    callback(browserAPI, false)
        },
        features: {
            FetchExternalResources: [
                'script', 'frame', 'iframe', 'link', 'img'
            ],
            ProcessExternalResources: ['script'],
            SkipExternalResources: false
        },
        html: template,
        onload: ():void => {
            browserAPI.domContentLoaded = true
            browserAPI.windowLoaded = true
        },
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
            if (browserAPI.debug)
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
    browserAPI = {
        debug: false, domContentLoaded: false, metaDOM: null, window,
        windowLoaded: false}
    window.document.addEventListener('DOMContentLoaded', ():void => {
        browserAPI.domContentLoaded = true
        for (const callback:Function of onCreatedListener)
            callback(browserAPI, false)
    })
    window.addEventListener('load', ():void => {
        browserAPI.windowLoaded = true
    })
}
// endregion
export default (callback:Function, clear:boolean = true):any => {
    // region initialize global context
    /*
        NOTE: We have to define window globally before anything is loaded to
        ensure that all future instances share the same window object.
    */
    if (clear && typeof global !== 'undefined' && global !== browserAPI.window)
        global.window = browserAPI.window
    // endregion
    if (
        typeof TARGET_TECHNOLOGY === 'undefined' ||
        TARGET_TECHNOLOGY === 'node'
    )
        return (browserAPI) ? callback(
            browserAPI, true
        ) : onCreatedListener.push(callback)
    return (browserAPI.domContentLoaded) ? callback(
        browserAPI, true
    ) : onCreatedListener.push(callback)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
