#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import Tools from 'clientnode'
import registerTest from 'clientnode/test.compiled'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import ejsLoader from '../ejsLoader.compiled'
// endregion
registerTest(function():void {
    this.module('ejsLoader')
    //  region mockup
    const context:{
        addDependency:() => void;
        options:{ejs?:{
            locals?:Object;
            compiler?:Object
        }};
        query:string;
        debug:boolean;
        loaders:Array<Object>;
        loaderIndex:number
    } = {
        addDependency: ():void => {},
        options: {},
        query: '',
        debug: false,
        loaders: [],
        loaderIndex: 0
    }
    // endregion
    // region tests
    this.test('loader', (assert:Object):void => {
        assert.strictEqual(ejsLoader.call(context, '<a></a>'), '<a></a>')
        const complexContext = Tools.extendObject(true, {}, context, {
            cacheable: ():void => {}, query: {
                locals: {test: 'hans'},
                compiler: {pretty: true}
            }
        })
        assert.strictEqual(ejsLoader.call(
            complexContext, '<a><%- test %></a>'
        ), '<a>hans</a>')
        assert.strictEqual(ejsLoader.call(
            complexContext,
            `<a></a><%- include('<a>test</a>?{options: {isString: true}}') %>`
        ), '<a></a><a>test</a>')
        complexContext.query.compileSteps = 0
        assert.strictEqual(
            ejsLoader.call(complexContext, '<a></a>'), '<a></a>')
        complexContext.query.compileSteps = 1
        assert.ok(ejsLoader.call(complexContext, '<a></a>').startsWith(
            `'use strict';\nmodule.exports=`))
        complexContext.query.compileSteps = 2
        assert.strictEqual(
            ejsLoader.call(complexContext, '<a></a>'), '<a></a>')
        complexContext.query.compileSteps = 3
        assert.ok(ejsLoader.call(complexContext, '<a></a>').startsWith(
            `'use strict';\nmodule.exports=`))
    })
    // endregion
}, ['plain'])
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
