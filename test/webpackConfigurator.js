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
import type {WebpackConfiguration} from '../type'
import webpack from 'webpack'
// endregion
QUnit.module('webpackConfigurator')
QUnit.load()
// region tests
QUnit.test('webpackConfigurator', (assert:Object):void => {
    const webpackConfiguration:WebpackConfiguration = require(
        '../webpackConfigurator.compiled'
    ).default
    assert.ok(webpackConfiguration.entry.index.includes('./index.js'))
    webpackConfiguration.output.path = __dirname
    webpackConfiguration.output.filename = 'dummy.compiled.js'
    assert.strictEqual(typeof webpack(webpackConfiguration), 'object')
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
