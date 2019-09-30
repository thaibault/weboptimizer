#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
test('configurator', ():void =>
    expect(require('../configurator.compiled').default.name)
        .toStrictEqual('mockup')
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
