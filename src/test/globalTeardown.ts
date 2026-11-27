// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module globalTeardown */
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 4.0 international license.
    See https://creativecommons.org/licenses/by/4.0/deed.de
    endregion
*/
import {rm} from 'fs/promises'
import {resolve} from 'path'

/*
    NOTE: Test fixture projects get their own dependencies installed via
    "build:copy-test-artifacts" (reinstalled on every test run anyway). Left in
    place, babel's "build:plain" has to check all of their ~90k files against
    its configuration which slows down every following build by minutes.
*/
export const FIXTURE_PROJECT_NAMES = ['scss', 'simple']
/**
 * Removes test fixture dependencies after all tests have finished.
 * @param globalConfiguration - Jest's global configuration.
 * @param globalConfiguration.rootDir - Project root to resolve fixtures from.
 * @returns A promise resolving when all fixture dependencies are removed.
 */
export default async (
    {rootDir}: {rootDir: string}
): Promise<void> => {
    for (const name of FIXTURE_PROJECT_NAMES)
        await rm(
            resolve(rootDir, 'src/test', name, 'node_modules'),
            {force: true, recursive: true}
        )
}
