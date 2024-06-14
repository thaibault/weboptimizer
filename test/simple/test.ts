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
