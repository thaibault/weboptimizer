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
// region imports
import {afterAll, describe, expect, test} from '@jest/globals'
import {mkdtemp, readdir, rm, writeFile} from 'fs/promises'
import {tmpdir} from 'os'
import {join} from 'path'

import loadConfiguration, {load} from '../configurator'
// endregion
// region mockup
const PREVIOUS_WORKING_DIRECTORY = process.cwd()
const contextPaths: Array<string> = []
/**
 * Creates a minimal temporary project to load configurations from.
 * @returns Path to created project.
 */
const createContext = async (): Promise<string> => {
    const path = await mkdtemp(join(tmpdir(), 'weboptimizer-configurator-'))
    contextPaths.push(path)

    await writeFile(
        join(path, 'package.json'),
        JSON.stringify({
            name: 'mockup-context',
            webOptimizer: {
                givenValue: 'default',
                test: {givenValue: 'test'}
            }
        })
    )
    // NOTE: Default ("build") and "test" entries have to be resolvable.
    await writeFile(join(path, 'index.js'), '')
    await writeFile(join(path, 'test.js'), '')

    return path
}
/**
 * Loads configuration of given (or a newly created) project with given
 * command line arguments.
 * @param commandLineArguments - Arguments following the binary.
 * @param contextPath - Project to load.
 * @returns Value of the custom "givenValue" configuration property.
 */
const loadGivenValue = async (
    commandLineArguments: Array<string>, contextPath?: string
): Promise<unknown> => {
    contextPath = contextPath ?? await createContext()
    /*
        NOTE: Entries are resolved against the current working directory, so
        we have to switch into given project.
    */
    process.chdir(contextPath)

    return (await load(
        contextPath,
        contextPath,
        ['', '', ...commandLineArguments],
        undefined,
        {}
    ) as unknown as {givenValue: unknown}).givenValue
}
// endregion
afterAll(async (): Promise<void> => {
    process.chdir(PREVIOUS_WORKING_DIRECTORY)

    for (const path of contextPaths)
        await rm(path, {force: true, recursive: true})
})
// region tests
test('loadConfiguration', () =>
    expect(loadConfiguration()).resolves.toHaveProperty('name', 'mockup')
)
describe('load', (): void => {
    test.each([
        ['default', 'build'],
        ['test', 'test'],
        ['test', 'test:coverage'],
        // NOTE: Has its own sub configuration type.
        ['default', 'test:browser']
    ])(
        `%p === load(..., ['', '', '%s'])`,
        async (expected: string, task: string): Promise<void> => {
            await expect(loadGivenValue([task]))
                .resolves.toStrictEqual(expected)
        }
    )
    test('repeated loading of same project', async (): Promise<void> => {
        const contextPath = await createContext()

        await expect(loadGivenValue(['test'], contextPath))
            .resolves.toStrictEqual('test')
        await expect(loadGivenValue(['build'], contextPath))
            .resolves.toStrictEqual('default')
        await expect(loadGivenValue(['test'], contextPath))
            .resolves.toStrictEqual('test')
    })
    test('encoded configuration argument', async (): Promise<void> => {
        await expect(loadGivenValue(['build', `{givenValue: 'encoded'}`]))
            .resolves.toStrictEqual('encoded')
    })
    test('referenced configuration file', async (): Promise<void> => {
        const filePath = join(await createContext(), 'reference.json')
        await writeFile(filePath, JSON.stringify({givenValue: 'referenced'}))

        await expect(loadGivenValue(
            ['build', `{__reference__: ${JSON.stringify(filePath)}}`]
        )).resolves.toStrictEqual('referenced')
        // NOTE: Unresolvable references are ignored (with a warning).
        await expect(loadGivenValue(
            ['build', `{__reference__: 'not-existing.json'}`]
        )).resolves.toStrictEqual('default')
    })
    test('dynamic configuration file', async (): Promise<void> => {
        const contextPath = await createContext()
        await writeFile(
            join(contextPath, '.dynamicConfiguration-0.json'),
            JSON.stringify({givenCommandLineArguments: ['', '', 'test']})
        )

        // NOTE: Given file replaces given command line arguments.
        await expect(loadGivenValue(['build'], contextPath))
            .resolves.toStrictEqual('test')
        // NOTE: Given file is consumed.
        expect(await readdir(contextPath))
            .not.toContain('.dynamicConfiguration-0.json')
    })
})
// endregion
