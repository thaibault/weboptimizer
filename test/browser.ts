#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import getInitializedBrowser, {browser} from '../browser'
import {Browser} from '../type'
// endregion
// region declarations
declare const expect:Function
declare const test:Function
// endregion
test('browser', async (done:Function):Promise<void> => {
    expect(browser.debug).toStrictEqual(false)
    expect(browser.domContentLoaded).toStrictEqual(false)
    expect(browser.initialized).toStrictEqual(false)
    expect(browser.windowLoaded).toStrictEqual(false)
    const initializedBrowser:Browser = await getInitializedBrowser()
    expect(initializedBrowser).toStrictEqual(browser)
    expect(browser.initialized).toStrictEqual(true)
    expect(browser.window).toHaveProperty('document')
    expect(browser.window.document).toHaveProperty('location')
    const onWindowLoaded:Function = (event:Event):void => {
        expect(event).toBeInstanceOf(Object)
        expect(browser.domContentLoaded).toStrictEqual(true)
        expect(browser.window.document.querySelector('body'))
            .toBeInstanceOf(Object)
        expect(browser.windowLoaded).toStrictEqual(true)
        done()
    }
    if (browser.windowLoaded)
        onWindowLoaded({})
    else
        browser.window.addEventListener('load', onWindowLoaded)
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
