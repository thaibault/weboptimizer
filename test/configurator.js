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
// endregion
QUnit.module('configurator')
QUnit.load()
// region tests
QUnit.test('configurator', (assert:Object):void => {
    assert.strictEqual(
        require('../configurator.compiled').default.name, 'mockup')
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
