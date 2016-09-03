#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import path from 'path'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
// endregion
QUnit.module('webpackConfigurator')
QUnit.load()
// region tests
QUnit.test('webpackConfigurator', (assert:Object):void =>
    assert.ok(require(
        '../webpackConfigurator.compiled'
    ).default.entry.index.includes(path.relative(path.resolve(
        __filename, '../'
    ), __filename).replace(/\.compiled\.js$/, '.js'))))
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
