// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {Mapping} from 'clientnode'

import type {WebpackConfiguration} from '../type'

import {expect, test} from '@jest/globals'
import webpack from 'webpack'
// endregion
test('webpackConfigurator', async (): Promise<void> => {
    const webpackConfiguration: WebpackConfiguration = (await import(
        '../webpackConfigurator'
    )).default

    expect((webpackConfiguration.entry as Mapping).index)
        .toContain('./index.ts')

    if (!webpackConfiguration.output)
        webpackConfiguration.output = {}

    webpackConfiguration.output.path = import.meta.dirname
    webpackConfiguration.output.filename = 'dummy.compiled.js'
    expect(webpack(webpackConfiguration)).toBeInstanceOf(Object)
})
