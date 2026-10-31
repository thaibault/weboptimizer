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
import type {LoaderContext} from 'webpack'

import type {LoaderConfiguration} from '../ejsLoader'

import {beforeAll, expect, test} from '@jest/globals'
import {copy, extend, NOOP} from 'clientnode'
import {resolve} from 'path'

import getConfiguration from '../configurator'
import ejsLoader from '../ejsLoader'
// endregion
// region mockup
let lastResult = ''
const context: LoaderContext<LoaderConfiguration> = {
    async: () => (error: Error | null, result: string) => {
        if (error)
            throw error

        lastResult = result
    },
    debug: false,
    loaders: [],
    resourcePath: '',
    query: ''
} as unknown as LoaderContext<LoaderConfiguration>
// NOTE: Fixtures are not compiled into "dist".
const TEMPLATE_PATH = resolve(import.meta.dirname, '../../src/test/template')
/**
 * Runs the loader with given source and collects all reported outcomes.
 * @param source - Template to transform.
 * @param query - Loader configuration to use.
 * @returns Reported error, result and added dependencies.
 */
const run = async (
    source: string, query: Partial<LoaderConfiguration> = {}
): Promise<{
    dependencies: Array<string>
    error: Error | null
    result: null | string
}> => {
    const outcome: Awaited<ReturnType<typeof run>> =
        {dependencies: [], error: null, result: null}

    await ejsLoader.call(
        {
            addDependency: (filePath: string): void => {
                outcome.dependencies.push(filePath)
            },
            async: () => (error: Error | null, result?: string) => {
                outcome.error = error
                outcome.result = result ?? null
            },
            getOptions: (): Partial<LoaderConfiguration> => query,
            resourcePath: ''
        } as unknown as LoaderContext<LoaderConfiguration>,
        source
    )

    return outcome
}
// endregion
/*
    NOTE: We need to pre-cache the configuration to avoid exceeding timeout in
    following tests.
*/
beforeAll(() => getConfiguration())
// region tests
test('ejsLoader', async (): Promise<void> => {
    await ejsLoader.call(context, '<a></a>')
    expect(lastResult).toStrictEqual('<a></a>')

    const complexContext: LoaderContext<LoaderConfiguration> = extend(
        true,
        copy(context),
        {
            cacheable: NOOP,
            getOptions: function(): LoaderConfiguration {
                return this.query as LoaderConfiguration
            },
            query: {
                compiler: {strict: true},
                locals: {test: 'hans'},
                pathsToIgnore: ['node_modules']
            }
        }
    )

    await ejsLoader.call(complexContext, '<a><%- _.test %></a>')
    expect(lastResult).toStrictEqual('<a>hans</a>')

    await ejsLoader.call(
        complexContext,
        '<a></a>' +
        `<%- await _.include('<a>test</a>?{options: {isString: true}}') %>`
    )
    expect(lastResult).toStrictEqual('<a></a><a>test</a>')

    ;(complexContext.query as LoaderConfiguration).compileSteps = 0
    await ejsLoader.call(complexContext, '<a></a>')
    expect(lastResult).toStrictEqual('<a></a>')

    ;(complexContext.query as LoaderConfiguration).compileSteps = 1
    await ejsLoader.call(complexContext, '<a></a>')
    expect(lastResult.startsWith(`'use strict';\nexport default `))
        .toStrictEqual(true)

    ;(complexContext.query as LoaderConfiguration).compileSteps = 2
    await ejsLoader.call(complexContext, '<a></a>')
    expect(lastResult).toStrictEqual('<a></a>')

    ;(complexContext.query as LoaderConfiguration).compileSteps = 3
    await ejsLoader.call(complexContext, '<a></a>')
    expect(lastResult.startsWith(`'use strict';\nexport default `))
        .toStrictEqual(true)
})
test('ejsLoader includes files', async (): Promise<void> => {
    const plainFilePath = resolve(TEMPLATE_PATH, 'plain.html')
    // NOTE: Non templates are included as they are.
    let outcome = await run(`<a><%- await _.include('${plainFilePath}') %></a>`)
    expect(outcome.error).toStrictEqual(null)
    expect(outcome.result).toStrictEqual(
        '<a><b>plain <%- _.notEvaluated %></b></a>'
    )
    expect(outcome.dependencies).toStrictEqual([plainFilePath])

    const nestedFilePath = resolve(TEMPLATE_PATH, 'nested.ejs')
    outcome = await run(
        `<a><%- await _.include('${nestedFilePath}?{name: "hans"}') %></a>`
    )
    expect(outcome.error).toStrictEqual(null)
    expect(outcome.result).toStrictEqual('<a><i>hans</i></a>')
    expect(outcome.dependencies).toStrictEqual([nestedFilePath])
})
test('ejsLoader reports errors', async (): Promise<void> => {
    let outcome = await run(`<%- await _.include('not/existing.html') %>`)
    expect(outcome.error).toBeInstanceOf(Error)
    expect(outcome.error?.message).toContain('not/existing.html')
    expect(outcome.result).toStrictEqual(null)

    outcome = await run('<% if ( %>')
    expect(outcome.error).toBeInstanceOf(Error)
    expect(outcome.result).toStrictEqual(null)
})
test('ejsLoader processing workaround', async (): Promise<void> => {
    expect((await run(
        '<script processing-workaround><%- "a" %></script>' +
        `<script processing-workaround=''>b</script>`
    )).result).toStrictEqual('ab')
    expect((await run(
        '<script processing--workaround>a</script>'
    )).result).toStrictEqual('<script processing-workaround>a</script>')
})
// endregion
