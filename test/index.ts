// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {resolve} from 'path'
import {spawnSync as spawnChildProcessSync} from 'child_process'

import main from '../index'
// endregion
/*
    NOTE: Theses tasks can take lot longer than 5 seconds (default
    configuration).
*/
jest.setTimeout(60 * 1000)

for (const folder of ['simple'/*, 'scss'*/])
    test.each(
        ['clear', 'check:types', 'lint', 'build', 'clear', 'test']
    )(`index (${folder}:%s)`, async (command:string):Promise<void> => {
        console.log('A TODO', folder, command)
        try {
            await main(
                resolve(__dirname, folder),
                resolve(__dirname, folder),
                ['yarn', 'weboptimizer', command],
                resolve(__dirname, folder, 'node_modules', 'weboptimizer')
            )
            console.log('B', folder, command)
            expect(true).toBeTruthy()
        } catch (error) {
            console.error(error)
            console.log('D', folder, command)
        }
        console.log('E', folder, command)
    })
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
