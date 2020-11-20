// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import configuration from '../configurator'
// endregion
test('configurator', ():void =>
    expect(configuration.name).toStrictEqual('mockup')
)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
