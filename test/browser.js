#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import getInitializedBrowser, {browser} from '../browser.compiled'
import type {Browser} from '../type'
// endregion
// region declarations
declare var expect:Function
declare var test:Function
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
    browser.window.addEventListener('load', (event:Object):void => {
        expect(event).toBeInstanceOf(Object)
        expect(browser.domContentLoaded).toStrictEqual(true)
        expect(browser.window.document.querySelector('body'))
            .toBeInstanceOf(Object)
        expect(browser.windowLoaded).toStrictEqual(true)
        done()
    })
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
