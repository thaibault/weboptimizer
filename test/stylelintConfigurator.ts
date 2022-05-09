// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {expect, test} from '@jest/globals'
import stylelintConfigurator from '../stylelintConfigurator'
// endregion
test('stylelintConfigurator', ():void =>
    expect(stylelintConfigurator).toBeTruthy()
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
