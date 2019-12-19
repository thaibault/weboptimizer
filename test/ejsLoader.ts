#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'

import ejsLoader from '../ejsLoader.compiled'
// endregion
// region declarations
declare var describe:Function
declare var expect:Function
declare var test:Function
// endregion
// region mockup
const context:{
    addDependency:() => void;
    query:string;
    debug:boolean;
    loaders:Array<Object>;
    loaderIndex:number
} = {
    addDependency: ():void => {},
    query: '',
    debug: false,
    loaders: [],
    loaderIndex: 0
}
// endregion
describe('ejsLoader', ():void => {
    // region tests
    test('loader', ():void => {
        expect(ejsLoader.call(context, '<a></a>')).toStrictEqual('<a></a>')
        const complexContext = Tools.extend(
            true,
            {},
            context, {
                cacheable: ():void => {},
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
