#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import browserAPI from '../browserAPI.compiled'
import type {Browser} from '../type'
// endregion
QUnit.module('browserAPI')
browserAPI((browser:Browser):void => {
    QUnit.load()
    // region tests
    QUnit.test('browserAPI', (assert:Object):void => {
        browserAPI((browser:Browser, alreadyLoaded:boolean):void => assert.ok(
            alreadyLoaded))
        assert.ok(browser.window.hasOwnProperty('document'))
        assert.ok(browser.window.document.hasOwnProperty('location'))
        assert.ok(
            browser.window.document.querySelector('body') instanceof Object)
    })
    // endregion
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
