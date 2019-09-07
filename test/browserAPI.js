#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
//import registerTest from 'clientnode/test.compiled'

import browserAPI from '../browserAPI.compiled'
import type {BrowserAPI} from '../type'
// endregion
//registerTest(function():void {
const a = (b) => b()
//a(() =>
    test('browserAPI', async (done:Function):Promise<void> => {
        const api:BrowserAPI = browserAPI(
            expect(browserAPI.domContentLoaded).toBe(true)
                )
                done()
                /*
                assert.notOk(api.debug)
                assert.ok(api.window.hasOwnProperty('document'))
                assert.ok(api.window.document.hasOwnProperty('location'))
                assert.ok(
                    api.window.document.querySelector('body') instanceof
                    Object
                )
                const done:Function = assert.async()
                const timer:Promise<boolean> = Tools.timeout(done, 100)
                api.window.document.addEventListener(
                    'DOMContentLoaded',
                    (event:Object):void => {
                        // IgnoreTypeCheck
                        timer.clear()
                        assert.ok(event)
                        done()
                    }
                )
                */
            },
            false
        )
    )
///*}, 'plain'*/)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
