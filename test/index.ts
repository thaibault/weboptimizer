// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {resolve} from 'path'

import main from '../index'
// endregion
test('index', ():void => {
    void expect(main()).resolves.toBeUndefined()

    void expect(main(resolve(__dirname, 'simple'))).resolves.toBeUndefined()
    void expect(main(resolve(__dirname, 'scss'))).resolves.toBeUndefined()
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
