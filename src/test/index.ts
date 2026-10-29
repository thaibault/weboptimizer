// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
import {expect, jest, test} from '@jest/globals'

import {spawnSync as spawnChildProcessSync} from 'child_process'
import {resolve} from 'path'

/*
    NOTE: These tasks can take lot longer than 5 seconds (default
    configuration).
*/
jest.setTimeout(60 * 1000)

for (const folder of ['simple', 'scss'])
    test.each(['check:types', 'lint', 'build', 'test'])(
        `index (${folder}: %s)`,
        (command: string): void => {
            for (const currentCommand of ['clear', command, 'clear'])
                expect(spawnChildProcessSync(
                    'yarn',
                    /*
                        NOTE: Yarn resolves "yarn weboptimizer" against the
                        installed (published) manifest's binary location
                        which may differ from the copied local build.
                    */
                    [
                        'node',
                        'node_modules/weboptimizer/dist/index.js',
                        currentCommand
                    ],
                    {
                        // NOTE: Fixtures are not compiled into "dist".
                        cwd: resolve(
                            import.meta.dirname, '../../src/test', folder
                        ),
                        env: process.env,
                        shell: true,
                        stdio: 'inherit'
                    }
                ).status).toStrictEqual(0)
        }
    )

