// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module browser */
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
import {
    CONSOLE_METHODS, ProcedureFunction, SynchronousProcedureFunction, timeout
} from 'clientnode'
import {DOMWindow, VirtualConsole} from 'jsdom'
import {LoaderContext} from 'webpack'

import {LoaderConfiguration} from './ejsLoader'
import {Browser, InitializedBrowser} from './type'
// endregion
// region declaration
declare const NAME:string
declare const TARGET_TECHNOLOGY:string
//  endregion
//  region variables
const onCreatedListener:Array<ProcedureFunction> = []

export const browser:Browser = {
    debug: false,
    domContentLoaded: false,
    DOM: null,
    initialized: false,
    instance: null,
    window: null,
    windowLoaded: false
}
// endregion
// region ensure presence of common browser environment
if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node')
    /*
        NOTE: We use an asynchronous wrapper method to initialize
        "browser.initialized" at module loading time.
    */
    (async ():Promise<void> => {
        // region mock browser environment
        const [{JSDOM, VirtualConsole: VirtualConsoleImplementation}, path] =
            await Promise.all([import('jsdom'), import('path')])

        const virtualConsole:VirtualConsole =
            new VirtualConsoleImplementation()
        for (const name of CONSOLE_METHODS)
            virtualConsole.on(name, console[name].bind(console))
        virtualConsole.on(
            'error',
            (error:Error & {
                detail:string
                type:string
            }):void => {
                if (
                    !browser.debug &&
                    ['XMLHttpRequest', 'resource loading'].includes(error.type)
                )
                    console.warn(
                        `Loading resource failed: ${error.toString()}.`
                    )
                else
                    console.error(error.stack, error.detail)
            }
        )

        const render = (template:string):void => {
            browser.DOM = JSDOM
            browser.initialized = true
            browser.instance = new browser.DOM(
                template,
                {
                    beforeParse: (window:DOMWindow):void => {
                        // We want to use it in a polymorphic way.
                        browser.window =
                            global.window ?? window as unknown as Window

                        window.document.addEventListener(
                            'DOMContentLoaded',
                            () => {
                                /*
                                    Move template results into global
                                    pre-defined dom.
                                */
                                if (global.window)
                                    for (const type of [
                                        'head', 'body'
                                    ] as const)
                                        global.window.document[type]
                                            .innerHTML =
                                                window.document[type].innerHTML

                                browser.domContentLoaded = true
                            }
                        )
                        window.addEventListener('load', () => {
                            /*
                                NOTE: Maybe we have miss the "DOMContentLoaded"
                                event caused by a race condition.
                            */
                            browser.domContentLoaded =
                            browser.windowLoaded =
                                true
                        })

                        for (const callback of onCreatedListener)
                            (callback as SynchronousProcedureFunction)()
                    },
                    resources: 'usable',
                    runScripts: 'dangerously',
                    url: 'http://localhost',
                    virtualConsole
                }
            )
        }

        if (typeof NAME === 'undefined' || NAME === 'webOptimizer') {
            const filePath:string = path.join(__dirname, 'index.html.ejs')
            /*
                NOTE: We load dependencies now to avoid having file imports
                after test runner has finished to isolate the environment.
            */
            const ejsLoader = (await import('./ejsLoader')).default
            const content:string = await (await import('fs')).promises
                .readFile(filePath, {encoding: 'utf-8'})

            render(ejsLoader.bind(
                {resourcePath: filePath} as
                    unknown as
                    LoaderContext<LoaderConfiguration>
            )(content))
        } else
            render(
                await import('webOptimizerDefaultTemplateFilePath') as string
            )
        // endregion
    })().catch(console.error)
else {
    browser.initialized = true
    browser.window = window

    window.document.addEventListener('DOMContentLoaded', ():void => {
        browser.domContentLoaded = true
    })
    window.addEventListener('load', ():void => {
        browser.windowLoaded = true
    })

    void timeout(():void => {
        for (const callback of onCreatedListener)
            (callback as SynchronousProcedureFunction)()
    })
}
// endregion
/**
 * Provides a generic browser api in node or web contexts.
 * @param replaceWindow - Indicates whether a potential existing window object
 * should be replaced or not.
 * @returns Determined environment.
 */
export const getInitializedBrowser = async (
    replaceWindow = true
):Promise<InitializedBrowser> => {
    let resolvePromise:(_browser:InitializedBrowser) => void
    const promise = new Promise<InitializedBrowser>(
        (resolve:(_browser:InitializedBrowser) => void):void => {
            resolvePromise = resolve
        }
    )

    /*
        NOTE: We have to define window globally before anything is loaded to
        ensure that all future instances share the same window object.
    */
    const wrappedCallback = ():void => {
        if (
            replaceWindow &&
            typeof global !== 'undefined' &&
            (global as unknown as Window) !== browser.window
        )
            (global as unknown as {window:Window}).window =
                browser.window as Window

        resolvePromise(browser as InitializedBrowser)
    }

    if (browser.initialized)
        wrappedCallback()
    else
        onCreatedListener.push(wrappedCallback)

    return promise
}
export default getInitializedBrowser
