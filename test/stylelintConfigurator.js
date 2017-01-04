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
// endregion
registerTest(function():void {
    this.module('stylelintConfigurator')
    // region tests
    this.test('stylelintConfigurator', (assert:Object):void => assert.ok(
        require('../stylelintConfigurator.compiled')))
    // endregion
}, ['plain'])
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
