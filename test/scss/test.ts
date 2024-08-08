// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'

import {expect, test} from '@jest/globals'

import main from './index'

test('index', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(main()).toBeUndefined()
})
