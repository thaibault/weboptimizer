// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import {Mapping} from 'clientnode/type'
import webpack from 'webpack'

import {WebpackConfiguration} from '../type'
// endregion
// Suppress log output.
console.debug = Tools.noop

test('webpackConfigurator', async ():Promise<void> => {
    const webpackConfiguration:WebpackConfiguration = (await import(
        '../webpackConfigurator'
    )).default

    expect((webpackConfiguration.entry as Mapping).index)
        .toContain('./index.ts')

    if (!webpackConfiguration.output)
        webpackConfiguration.output = {}

    webpackConfiguration.output.path = __dirname
    webpackConfiguration.output.filename = 'dummy.compiled.js'
    expect(webpack(webpackConfiguration)).toBeInstanceOf(Object)
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
