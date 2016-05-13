#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as qunit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import Helper from '../helper.compiled'
import pugLoader from '../pugLoader.compiled'
// endregion
qunit.module('pugLoader')
qunit.load()
// region mockup
const context:{
    addDependency:() => ?null;
    options:{pug?:{
        locals?:Object;
        compiler?:Object
    }};
    query:string;
    debug:boolean;
    loaders:Array<Object>;
    loaderIndex:number
} = {
    addDependency: () => {},
    options: {},
    query: '',
    debug: true,
    loaders: [],
    loaderIndex: 0
}
// endregion
// region tests
qunit.test('loader', () => {
    qunit.strictEqual(pugLoader.call(context, 'a'), '<a></a>')
    const complexContext = Helper.extendObject(true, {}, context, {
        cacheable: () => {},
        options: {pug: {
            locals: {test: 'hans'},
            compiler: {pretty: true}
        }}
    })
    qunit.strictEqual(pugLoader.call(
        complexContext, 'a #{test}'
    ), '<a>hans</a>')
    qunit.strictEqual(pugLoader.call(
        complexContext, "a\n!= require('a test?{options: {isString: true}}')"
    ), '<a></a><a>test</a>')
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
