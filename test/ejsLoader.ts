// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'

import {describe, expect, test} from '@jest/globals'
import {copy, extend, NOOP} from 'clientnode'
import {LoaderContext} from 'webpack'

import ejsLoader, {LoaderConfiguration} from '../ejsLoader'

// region mockup
const context: LoaderContext<LoaderConfiguration> = {
    debug: false,
    loaders: [],
    resourcePath: '',
    query: ''
} as unknown as LoaderContext<LoaderConfiguration>
// endregion
describe('ejsLoader', (): void => {
    // region tests
    test('loader', (): void => {
        expect(ejsLoader.call(context, '<a></a>')).toStrictEqual('<a></a>')
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

        expect(ejsLoader.call(complexContext, '<a><%- test %></a>'))
            .toStrictEqual('<a>hans</a>')
        expect(ejsLoader.call(
            complexContext,
            `<a></a><%- include('<a>test</a>?{options: {isString: true}}') %>`
        )).toStrictEqual('<a></a><a>test</a>')
        ;(complexContext.query as LoaderConfiguration).compileSteps = 0
        expect(ejsLoader.call(complexContext, '<a></a>'))
            .toStrictEqual('<a></a>')
        ;(complexContext.query as LoaderConfiguration).compileSteps = 1
        expect(
            ejsLoader.call(complexContext, '<a></a>')
                .startsWith(`'use strict';\nmodule.exports=`)
        ).toStrictEqual(true)
        ;(complexContext.query as LoaderConfiguration).compileSteps = 2
        expect(ejsLoader.call(complexContext, '<a></a>'))
            .toStrictEqual('<a></a>')
        ;(complexContext.query as LoaderConfiguration).compileSteps = 3
        expect(
            ejsLoader.call(complexContext, '<a></a>')
                .startsWith(`'use strict';\nmodule.exports=`)
        ).toStrictEqual(true)
    })
    // endregion
})
