// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import loadConfiguration from '../configurator'
// endregion
test('loadConfiguration', ():void =>
    expect(loadConfiguration()).toHaveProperty('name', 'mockup')
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
