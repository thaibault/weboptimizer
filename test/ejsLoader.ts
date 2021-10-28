// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import {LoaderContext} from 'webpack'

import ejsLoader, {LoaderConfiguration} from '../ejsLoader'
// endregion
// region mockup
const context:LoaderContext<LoaderConfiguration> = {
    debug: false,
    loaders: [],
    resourcePath: '',
    query: ''
} as unknown as LoaderContext<LoaderConfiguration>
// endregion
describe('ejsLoader', ():void => {
    // region tests
    test('loader', ():void => {
        expect(ejsLoader.call(context, '<a></a>')).toStrictEqual('<a></a>')
        const complexContext:LoaderContext<LoaderConfiguration> = Tools.extend(
            true,
            Tools.copy(context),
            {
                cacheable: Tools.noop,
                getOptions: function():LoaderConfiguration {
                    return this.query
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
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
