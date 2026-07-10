// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

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

import {describe, expect, test} from '@jest/globals'
import {copy, extend, NOOP} from 'clientnode'

import ejsLoader from '../ejsLoader'
// endregion
// region mockup
let lastResult = ''
const context: LoaderContext<LoaderConfiguration> = {
    async: (_error: Error | null, result: string) => {
        lastResult = result
    },
    debug: false,
    loaders: [],
    resourcePath: '',
    query: ''
} as unknown as LoaderContext<LoaderConfiguration>
// endregion
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
                locals: {test: 'hans'}
            }
        }
    )

    await ejsLoader.call(complexContext, '<a><%- _.test %></a>')
    expect(lastResult).toStrictEqual('<a>hans</a>')

    await ejsLoader.call(
        complexContext,
        '<a></a>' +
        `<%- _.include('<a>test</a>?{options: {isString: true}}') %>`
    )
    expect(lastResult).toStrictEqual('<a></a><a>test</a>')

    ;(complexContext.query as LoaderConfiguration).compileSteps = 0
    await ejsLoader.call(complexContext, '<a></a>')
    expect(lastResult).toStrictEqual('<a></a>')

    ;(complexContext.query as LoaderConfiguration).compileSteps = 1
    await ejsLoader.call(complexContext, '<a></a>')
    expect(lastResult.startsWith(`'use strict';\nmodule.exports=`))
        .toStrictEqual(true)

    ;(complexContext.query as LoaderConfiguration).compileSteps = 2
    await ejsLoader.call(complexContext, '<a></a>')
    expect(lastResult).toStrictEqual('<a></a>')

    ;(complexContext.query as LoaderConfiguration).compileSteps = 3
    await ejsLoader.call(complexContext, '<a></a>')
    expect(lastResult.startsWith(`'use strict';\nmodule.exports=`))
        .toStrictEqual(true)
})
// endregion
