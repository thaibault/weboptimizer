// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {resolve} from 'path'

import main from '../index'
// endregion
// TODO run yarn to ensure to have assets right there.
for (const folder of ['simple'/*, 'scss'*/])
    test.each(
        ['clear'/*, 'check:types', 'lint', 'build', 'clear', 'test', 'build'*/]
    )(`index (${folder}:%s)`, async (command:string):Promise<void> => {
        try {
            await main(
                resolve(__dirname, folder),
                resolve(__dirname, folder),
                ['yarn', 'weboptimizer', command]
            )
            expect(true).toBeTruthy()
        } catch (error) {
            console.error(error)
        }
    })
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
