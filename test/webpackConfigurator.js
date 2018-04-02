#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import registerTest from 'clientnode/test.compiled'
import webpack from 'webpack'

import type {WebpackConfiguration} from '../type'
// endregion
registerTest(function():void {
    this.module('webpackConfigurator')
    // region tests
    this.test('webpackConfigurator', (assert:Object):void => {
        const webpackConfiguration:WebpackConfiguration = require(
            '../webpackConfigurator.compiled'
        ).default
        assert.ok(webpackConfiguration.entry.index.includes('./index.js'))
        webpackConfiguration.output.path = __dirname
        webpackConfiguration.output.filename = 'dummy.compiled.js'
        assert.strictEqual(typeof webpack(webpackConfiguration), 'object')
    })
    // endregion
}, ['plain'])
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
