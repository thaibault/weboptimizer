// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'

import {expect, test} from '@jest/globals'

import loadConfiguration from '../configurator'

test('loadConfiguration', () => {
    expect(loadConfiguration()).toHaveProperty('name', 'mockup')
})
