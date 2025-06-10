// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'

import {expect, test} from '@jest/globals'

import getInitializedBrowser, {browser} from '../browser'

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
    const promise = new Promise<void>(
        (resolve: () => void, reject: (error: unknown) => void
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
                reject(error)
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
