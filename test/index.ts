#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import main from '../index.compiled'
// endregion
// region declarations
declare var expect:Function
declare var test:Function
// endregion
test('index', async ():Promise<void> => {
    try {
        await main()
    } catch (error) {
        console.error(error)
    }
    expect(true).toBeTruthy()
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
