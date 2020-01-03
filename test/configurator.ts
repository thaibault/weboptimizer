#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region declarations
declare const expect:Function
declare const test:Function
// endregion
test('configurator', async ():Promise<void> =>
    // @ts-ignore: Will be available at runtime.
    expect((await import('../configurator.compiled')).default.name)
        .toStrictEqual('mockup')
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
