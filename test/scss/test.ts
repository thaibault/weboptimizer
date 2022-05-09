// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {expect, test} from '@jest/globals'

import main from './index'
// endregion
test('index', ():void => {
    expect(main()).toBeUndefined()
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
