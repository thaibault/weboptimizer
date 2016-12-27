#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import browserAPI from '../browserAPI.compiled'
import type {BrowserAPI} from '../type'
// endregion
browserAPI((api:BrowserAPI):void => {
    QUnit.module('browserAPI')
    QUnit.load()
    // region tests
    QUnit.test('browserAPI', (assert:Object):void => {
        browserAPI((api:BrowserAPI, alreadyCreated:boolean):void => assert.ok(
            alreadyCreated))
        assert.notOk(api.debug)
        assert.ok(api.window.hasOwnProperty('document'))
        assert.ok(api.window.document.hasOwnProperty('location'))
        assert.ok(api.window.document.querySelector('body') instanceof Object)
        const done:Function = assert.async()
        const timer:Promise<boolean> = Tools.timeout(done, 100)
        api.window.document.addEventListener('DOMContentLoaded', (
            event:Object
        ):void => {
            // IgnoreTypeCheck
            timer.clear()
            assert.ok(event)
            done()
        })
    })
    // endregion
}, false)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
