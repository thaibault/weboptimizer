#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import {loader} from 'webpack'

import ejsLoader from '../ejsLoader'
// endregion
// region mockup
const context:loader.LoaderContext = {
    debug: false,
    loaders: [],
    resourcePath: '',
    query: ''
} as unknown as loader.LoaderContext
// endregion
describe('ejsLoader', ():void => {
    // region tests
    test('loader', ():void => {
        expect(ejsLoader.call(context, '<a></a>')).toStrictEqual('<a></a>')
        const complexContext:loader.LoaderContext = Tools.extend(
            true,
            {},
            context,
            {
                cacheable: Tools.noop,
                query: {
                    locals: {test: 'hans'},
                    compiler: {pretty: true}
                }
            }
        )
        expect(ejsLoader.call(complexContext, '<a><%- test %></a>'))
            .toStrictEqual('<a>hans</a>')
        expect(ejsLoader.call(
            complexContext,
            `<a></a><%- include('<a>test</a>?{options: {isString: true}}') %>`
        )).toStrictEqual('<a></a><a>test</a>')
        complexContext.query.compileSteps = 0
        expect(ejsLoader.call(complexContext, '<a></a>'))
            .toStrictEqual('<a></a>')
        complexContext.query.compileSteps = 1
        expect(
            ejsLoader.call(complexContext, '<a></a>')
                .startsWith(`'use strict';\nmodule.exports=`)
        ).toStrictEqual(true)
        complexContext.query.compileSteps = 2
        expect(ejsLoader.call(complexContext, '<a></a>'))
            .toStrictEqual('<a></a>')
        complexContext.query.compileSteps = 3
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
