#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
test('stylelintConfigurator', ():void =>
    expect(require('../stylelintConfigurator.compiled')).toBeTruthy()
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
