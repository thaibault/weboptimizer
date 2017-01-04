#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import registerTest from 'clientnode/test.compiled'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import main from '../index.compiled'
// endregion
registerTest(function():void {
    this.module('index')
    // region tests
    this.test('main', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
        try {
            await main()
        } catch (error) {
            console.error(error)
        }
        assert.ok(true)
        done()
    })
    // endregion
}, ['plain'])
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
