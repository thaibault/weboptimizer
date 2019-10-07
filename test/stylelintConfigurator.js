#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region declarations
declare var expect:Function
declare var test:Function
// endregion
test('stylelintConfigurator', ():void =>
    expect(require('../stylelintConfigurator.compiled')).toBeTruthy()
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
