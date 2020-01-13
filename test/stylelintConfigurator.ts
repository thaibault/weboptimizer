#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import stylelintConfigurator from '../stylelintConfigurator'
// endregion
test('stylelintConfigurator', ():void =>
    expect(stylelintConfigurator).toBeTruthy()
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
