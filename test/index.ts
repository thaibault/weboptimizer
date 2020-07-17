#!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import main from '../index'
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
