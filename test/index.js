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
import main from '../index.compiled'
// endregion
QUnit.module('index')
QUnit.load()
// region tests
QUnit.test('main', async (assert:Object):Promise<void> => {
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
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
