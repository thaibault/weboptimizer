// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'

import {expect, test} from '@jest/globals'

import stylelintConfigurator from '../stylelintConfigurator'

test('stylelintConfigurator', ():void =>
    expect(stylelintConfigurator).toBeTruthy()
)
