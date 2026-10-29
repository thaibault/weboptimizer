// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'

import {expect, test} from '@jest/globals'

import main from './index'

test('index', () => {
    main()
    expect(true).toStrictEqual(true)
})
