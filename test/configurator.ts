#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
test('configurator', async ():Promise<void> =>
    expect((await import('../configurator')).default.name)
        .toStrictEqual('mockup')
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
