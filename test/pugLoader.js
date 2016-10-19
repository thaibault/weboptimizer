#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as QUnit from 'qunit-cli'
import Tools from 'clientnode'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import pugLoader from '../pugLoader.compiled'
// endregion
QUnit.module('pugLoader')
QUnit.load()
//  region mockup
const context:{
    addDependency:() => void;
    options:{pug?:{
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
    debug: true,
    loaders: [],
    loaderIndex: 0
}
// endregion
// region tests
QUnit.test('loader', (assert:Object):void => {
    assert.strictEqual(pugLoader.call(context, 'a'), '<a></a>')
    const complexContext = Tools.extendObject(true, {}, context, {
        cacheable: ():void => {},
        options: {pug: {
            locals: {test: 'hans'},
            compiler: {pretty: true}
        }}
    })
    assert.strictEqual(pugLoader.call(
        complexContext, 'a #{test}'
    ), '<a>hans</a>')
    assert.strictEqual(pugLoader.call(
        complexContext, `a\n!= require('a test?{options: {isString: true}}')`
    ), '<a></a><a>test</a>')
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
