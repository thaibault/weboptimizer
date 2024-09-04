// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'

import {expect, test} from '@jest/globals'
import {Mapping, NOOP} from 'clientnode'
import webpack from 'webpack'

import {WebpackConfiguration} from '../type'

// Suppress log output.
console.debug = NOOP

test('webpackConfigurator', async (): Promise<void> => {
    const webpackConfiguration: WebpackConfiguration = (await import(
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
