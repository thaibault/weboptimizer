// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {expect, jest, test} from '@jest/globals'
import {spawnSync as spawnChildProcessSync} from 'child_process'
import {open} from 'fs/promises'
import {resolve} from 'path'
// endregion
/*
    NOTE: Theses tasks can take lot longer than 5 seconds (default
    configuration).
*/
jest.setTimeout(60 * 1000)

for (const folder of ['simple', 'scss']) {
    // Enforce test folder to be handled as dedicated projects via yarn.
    (await open(resolve(folder, 'yarn.lock'), 'w')).close()

    test.each(['check:types', 'lint', 'build', 'test'])(
        `index (${folder}:%s)`,
        (command:string):void => {
            for (const currentCommand of ['clear', command, 'clear'])
                expect(spawnChildProcessSync(
                    'yarn',
                    ['weboptimizer', currentCommand],
                    {
                        cwd: resolve(__dirname, folder),
                        env: process.env,
                        shell: true,
                        stdio: 'inherit'
                    }
                ).status).toStrictEqual(0)
        }
    )
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
