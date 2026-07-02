// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {expect, test} from '@jest/globals'

import getInitializedBrowser, {browser} from '../browser'
// endregion
test('browser', async (): Promise<void> => {
    expect(browser.debug).toStrictEqual(false)
    expect(browser.domContentLoaded).toStrictEqual(false)
    expect(browser.initialized).toStrictEqual(false)
    expect(browser.windowLoaded).toStrictEqual(false)

    const initializedBrowser = await getInitializedBrowser()

    expect(initializedBrowser).toStrictEqual(browser)
    expect(browser.initialized).toStrictEqual(true)
    expect(browser.window).toHaveProperty('document')

    if (browser.window)
        expect(browser.window.document).toHaveProperty('location')

    let onWindowLoaded: (event: Event) => void = () => {
        // Do nothing.
    }
    const promise = new Promise<void>((
        resolve: () => void, reject: (error: Error) => void
    ) => {
        onWindowLoaded = (event: Event): void => {
            try {
                expect(event).toBeInstanceOf(Object)
                expect(browser.domContentLoaded).toStrictEqual(true)
                if (browser.window) {
                    const body = browser.window.document.querySelector('body')
                    expect(body !== null && typeof body === 'object')
                        .toStrictEqual(true)
                }
                expect(browser.windowLoaded).toStrictEqual(true)
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error(error as string)
                )
            }

            resolve()
        }
    })

    if (browser.windowLoaded)
        onWindowLoaded(new Event('load'))
    else if (browser.window)
        browser.window.addEventListener('load', onWindowLoaded)

    await promise
})
