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

import webpackConfigurator from '../webpackConfigurator.compiled'
// endregion
QUnit.module('webpackConfigurator')
QUnit.load()
// region tests
QUnit.test('webpackConfigurator', (assert:Object):void => {
    // TODO
    assert.strictEqual(true, true)
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
