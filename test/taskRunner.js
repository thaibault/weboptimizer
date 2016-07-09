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
QUnit.module('taskRunner')
QUnit.load()
// region tests
QUnit.test('taskRunner', (assert:Object):void => {
    assert.deepEqual(require('../taskRunner.compiled'), {})
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
