// #!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {Window} from 'clientnode'
import type {BrowserAPI} from './type'
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
    const {JSDOM, VirtualConsole} = require('jsdom')
    const virtualConsole:Object = new VirtualConsole()
    for (const name:string of [
        'assert', 'dir', 'info', 'log', 'time', 'timeEnd', 'trace', 'warn'
    ])
        virtualConsole.on(name, console[name].bind(console))
    virtualConsole.on('error', (error:Error):void => {
        if (!browserAPI.debug && [
            'XMLHttpRequest', 'resource loading'
        // IgnoreTypeCheck
        ].includes(error.type))
            console.warn(`Loading resource failed: ${error.toString()}.`)
        else
            // IgnoreTypeCheck
            console.error(error.stack, error.detail)
    })
    const render:Function = (template:string):Window => {
        const window:Window = (new JSDOM(template, {
            resources: 'usable',
            runScripts: 'dangerously',
            url: 'http://localhost',
            virtualConsole
        })).window
        browserAPI = {
            debug: false, domContentLoaded: false, DOM: JSDOM, window,
            windowLoaded: false}
        window.addEventListener('load', ():void => {
            // NOTE: Maybe we have miss the "DOMContentLoaded" event.
            browserAPI.domContentLoaded = true
            browserAPI.windowLoaded = true
        })
        window.document.addEventListener('DOMContentLoaded', ():void => {
            browserAPI.domContentLoaded = true
        })
        for (const callback:Function of onCreatedListener)
            callback(browserAPI, false)
        return window
    }
    if (typeof NAME === 'undefined' || NAME === 'webOptimizer') {
        const filePath:string = path.join(__dirname, 'index.html.ejs')
        require('fs').readFile(
            filePath,
            {encoding: 'utf-8'},
            (error:?Error, content:string):void => {
                if (error)
                    throw error
                render(require('./ejsLoader.compiled').bind(
                    {filename: filePath}
                )(content))
            }
        )
    } else
        // IgnoreTypeCheck
        render(require('webOptimizerDefaultTemplateFilePath'))
    // endregion
} else {
    browserAPI = {
        debug: false, domContentLoaded: false, DOM: null, window,
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
/**
 * Provides a generic browser api in node or web contexts.
 * @param callback - Function to be called when environment is ready.
 * @param clear - Indicates whether a potential existign window object should
 * be replaced or not.
 * @returns Determined environment.
 */
export function createBrowserAPI(callback:Function, clear:boolean = true):any {
    // region initialize global context
    /*
        NOTE: We have to define window globally before anything is loaded to
        ensure that all future instances share the same window object.
    */
    const wrappedCallback:Function = (...parameter:Array<any>):any => {
        if (
            clear && typeof global !== 'undefined' &&
            global !== browserAPI.window
        )
            global.window = browserAPI.window
        return callback(...parameter)
    }
    // endregion
    if (
        typeof TARGET_TECHNOLOGY === 'undefined' ||
        TARGET_TECHNOLOGY === 'node'
    )
        return (browserAPI) ? wrappedCallback(
            browserAPI, true
        ) : onCreatedListener.push(wrappedCallback)
    return (browserAPI.domContentLoaded) ? wrappedCallback(
        browserAPI, true
    ) : onCreatedListener.push(wrappedCallback)
}
export default createBrowserAPI
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
