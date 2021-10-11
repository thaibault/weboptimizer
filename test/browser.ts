// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'

import getInitializedBrowser, {browser} from '../browser'
import {Browser} from '../type'
// endregion
test('browser', (done):void => {
    expect(browser.debug).toStrictEqual(false)
    expect(browser.domContentLoaded).toStrictEqual(false)
    expect(browser.initialized).toStrictEqual(false)
    expect(browser.windowLoaded).toStrictEqual(false)

    getInitializedBrowser().then(
        (initializedBrowser:Browser):void => {
            expect(initializedBrowser).toStrictEqual(browser)
            expect(browser.initialized).toStrictEqual(true)
            expect(browser.window).toHaveProperty('document')

            if (browser.window)
                expect(browser.window.document).toHaveProperty('location')
            const onWindowLoaded = (event:Event):void => {
                expect(event).toBeInstanceOf(Object)
                expect(browser.domContentLoaded).toStrictEqual(true)
                if (browser.window)
                    expect(browser.window.document.querySelector('body'))
                        .toBeInstanceOf(Object)
                expect(browser.windowLoaded).toStrictEqual(true)

                done()
            }

            if (browser.windowLoaded)
                onWindowLoaded(new Event('load'))
            else if (browser.window)
                browser.window.addEventListener('load', onWindowLoaded)
            else
                done()
        },
        Tools.noop
    )
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
