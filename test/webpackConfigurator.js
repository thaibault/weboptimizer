#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import webpack from 'webpack'

import type {WebpackConfiguration} from '../type'
// endregion
test('webpackConfigurator', ():void => {
    const webpackConfiguration:WebpackConfiguration = require(
        '../webpackConfigurator.compiled'
    ).default
    expect(webpackConfiguration.entry.index.includes('./index.js'))
        .toBeTruthy()
    webpackConfiguration.output.path = __dirname
    webpackConfiguration.output.filename = 'dummy.compiled.js'
    expect(webpack(webpackConfiguration)).toBeInstanceOf(Object)
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
