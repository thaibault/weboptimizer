#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import registerTest from 'clientnode/test.compiled'
// endregion
registerTest(function():void {
    this.module('configurator')
    // region tests
    this.test('main', (assert:Object):void => assert.strictEqual(
        require('../configurator.compiled').default.name, 'mockup'))
    // endregion
}, ['plain'])
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
