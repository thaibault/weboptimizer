#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as qunit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import Helper from '../helper.compiled'
// endregion
qunit.module('helper')
qunit.load()
// region tests
// / boolean
qunit.test('isPlainObject', () => {
    qunit.ok(Helper.isPlainObject({}))
    qunit.ok(Helper.isPlainObject({a: 1}))
    /* eslint-disable no-new-object */
    qunit.ok(Helper.isPlainObject(new Object()))
    /* eslint-enable no-new-object */

    qunit.notOk(Helper.isPlainObject(new String()))
    qunit.notOk(Helper.isPlainObject(Object))
    qunit.notOk(Helper.isPlainObject(null))
    qunit.notOk(Helper.isPlainObject(0))
    qunit.notOk(Helper.isPlainObject(1))
    qunit.notOk(Helper.isPlainObject(true))
    qunit.notOk(Helper.isPlainObject(undefined))
})
qunit.test('isFunction', () => {
    qunit.ok(Helper.isFunction(Object))
    qunit.ok(Helper.isFunction(new Function('return 1')))
    qunit.ok(Helper.isFunction(function() {}))
    qunit.ok(Helper.isFunction(() => {}))

    qunit.notOk(Helper.isFunction(null))
    qunit.notOk(Helper.isFunction(false))
    qunit.notOk(Helper.isFunction(0))
    qunit.notOk(Helper.isFunction(1))
    qunit.notOk(Helper.isFunction(undefined))
    qunit.notOk(Helper.isFunction({}))
    qunit.notOk(Helper.isFunction(new Boolean()))
})
qunit.test('isFilePathInLocation', () => {
    qunit.ok(Helper.isFilePathInLocation('./', ['./']))
    qunit.ok(Helper.isFilePathInLocation('./', ['../']))

    qunit.notOk(Helper.isFilePathInLocation('../', ['./']))
})
// / endregion
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
