#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {ChildProcess} from 'child_process'
import {Duplex as DuplexStream} from 'stream'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import type {
    BuildConfiguration, Paths, TraverseFilesCallbackFunction
} from '../type'
import Helper from '../helper.compiled'
// endregion
QUnit.module('helper')
QUnit.load()
// region mockups
const buildConfiguration:BuildConfiguration = {
    other: {
        extension: 'other',
        fileNamePattern: '',
        outputExtension: 'other'
    },
    javaScript: {
        extension: 'js',
        fileNamePattern: '',
        outputExtension: 'js'
    },
    example: {
        extension: 'example',
        fileNamePattern: '',
        outputExtension: 'example'
    }
}
// endregion
// region tests
// / region boolean
QUnit.test('isPlainObject', (assert:Object):void => {
    /* eslint-disable no-new-object */
    for (const okValue:any of [{}, {a: 1}, new Object()])
    /* eslint-enable no-new-object */
        assert.ok(Helper.isPlainObject(okValue))
    for (const notOkValue:any of [
        new String(), Object, null, 0, 1, true, undefined
    ])
        assert.notOk(Helper.isPlainObject(notOkValue))
})
QUnit.test('isFunction', (assert:Object):void => {
    for (const okValue:any of [
        Object, new Function('return 1'), function():void {}, ():void => {}
    ])
        assert.ok(Helper.isFunction(okValue))
    for (const notOkValue:any of [
        null, false, 0, 1, undefined, {}, new Boolean()
    ])
        assert.notOk(Helper.isFunction(notOkValue))
})
QUnit.test('isFilePathInLocation', (assert:Object):void => {
    for (const okArguments:Array<any> of [
        ['./', ['./']], ['./', ['../']]
    ])
        assert.ok(Helper.isFilePathInLocation.apply(this, okArguments))
    for (const notOkArguments:Array<any> of [['../', ['./']]])
        assert.notOk(Helper.isFilePathInLocation.apply(this, notOkArguments))
})
// / endregion
QUnit.test('convertToValidVariableName', (assert:Object):void => {
    for (const test:Array<string> of [
        ['', ''],
        ['a', 'a'],
        ['_a', '_a'],
        ['_a_a', '_a_a'],
        ['_a-a', '_aA'],
        ['-a-a', 'aA'],
        ['-a--a', 'aA'],
        ['--a--a', 'aA']
    ])
        assert.strictEqual(Helper.convertToValidVariableName(test[0]), test[1])
})
QUnit.test('extendObject', (assert:Object):void => {
    for (const test:any of [
        [[[]], []],
        [[{}], {}],
        [[{a: 1}], {a: 1}],
        [[{a: 1}, {a: 2}], {a: 2}],
        [[{}, {a: 1}, {a: 2}], {a: 2}],
        [[{}, {a: 1}, {a: 2}], {a: 2}],
        [[{a: 1, b: {a: 1}}, {a: 2, b: {b: 1}}], {a: 2, b: {b: 1}}],
        [[[1, 2], [1]], [1]],
        [[new Map()], new Map()],
        [[new Map([['a', 1]])], new Map([['a', 1]])],
        [[new Map([['a', 1]]), new Map([['a', 2]])], new Map([['a', 2]])],
        [
            [new Map(), new Map([['a', 1]]), new Map([['a', 2]])],
            new Map([['a', 2]])
        ],
        [
            [new Map(), new Map([['a', 1]]), new Map([['a', 2]])],
            new Map([['a', 2]])
        ],
        [
            [
                new Map([['a', 1], ['b', new Map([['a', 1]])]]),
                new Map([['a', 2], ['b', new Map([['b', 1]])]])
            ],
            new Map([['a', 2], ['b', new Map([['b', 1]])]])
        ],
        [[true, {}], {}],
        [
            [true, {a: 1, b: {a: 1}}, {a: 2, b: {b: 1}}],
            {a: 2, b: {a: 1, b: 1}}
        ],
        [
            [true, {a: 1, b: {a: []}}, {a: 2, b: {b: 1}}],
            {a: 2, b: {a: [], b: 1}}
        ],
        [[true, {a: {a: [1, 2]}}, {a: {a: [3, 4]}}], {a: {a: [3, 4]}}],
        [
            [true, {a: {a: [1, 2]}}, {a: {a: null}}],
            {a: {a: null}}
        ],
        [[true, {a: {a: [1, 2]}}, {a: true}], {a: true}],
        [[true, {a: {a: [1, 2]}}, false], false],
        [[true, {a: {a: [1, 2]}}, undefined], undefined],
        [[true, {a: 1}, {a: 2}, {a: 3}], {a: 3}],
        [[true, [1], [1, 2]], [1, 2]],
        [[true, [1, 2], [1]], [1]],
        [[true, new Map()], new Map()],
        [
            [
                true, new Map([['a', 1], ['b', new Map([['a', 1]])]]),
                new Map([['a', 2], ['b', new Map([['b', 1]])]])
            ],
            new Map([['a', 2], ['b', new Map([['a', 1], ['b', 1]])]])
        ],
        [
            [
                true, new Map([['a', 1], ['b', new Map([['a', []]])]]),
                new Map([['a', 2], ['b', new Map([['b', 1]])]])
            ],
            new Map([['a', 2], ['b', new Map([['a', []], ['b', 1]])]])
        ],
        [
            [
                true, new Map([['a', new Map([['a', [1, 2]]])]]),
                new Map([['a', new Map([['a', [3, 4]]])]])
            ],
            new Map([['a', new Map([['a', [3, 4]]])]])
        ]
    ])
        assert.deepEqual(
            Helper.extendObject.apply(this, test[0]), test[1])
    assert.strictEqual(Helper.extendObject([1, 2], undefined), undefined)
    assert.strictEqual(Helper.extendObject([1, 2], null), null)
    const target:Object = {a: [1, 2]}
    Helper.extendObject(true, target, {a: [3, 4]})
    assert.deepEqual(target, {a: [3, 4]})
})
// region process handler
QUnit.test('getProcessCloseHandler', (assert:Object):void =>
    assert.strictEqual(typeof Helper.getProcessCloseHandler(
        ():void => {}, ():void => {}
    ), 'function'))
QUnit.test('handleChildProcess', (assert:Object):void => {
    /**
     * A mockup duplex stream for mocking "stdout" and "strderr" process
     * connections.
     */
    class MockupDuplexStream extends DuplexStream {
        /**
         * Triggers if contents from current stream should be red.
         * @param size - Number of bytes to read asynchronously.
         * @returns Red data.
         */
        _read(size:number):string {
            return `${size}`
        }
        /**
         * Triggers if contents should be written on current stream.
         * @param chunk - The chunk to be written. Will always be a buffer
         * unless the "decodeStrings" option was set to "false".
         * @param encoding - Specifies encoding to be used as input data.
         * @param callback - Will be called if data has been written.
         * @returns Returns "true" if more data could be written and "false"
         * otherwise.
         */
        _write(
            chunk:Buffer|string, encoding:string, callback:Function
        ):boolean {
            callback(new Error('test'))
            return true
        }
    }
    const stdoutMockupDuplexStream:MockupDuplexStream =
        new MockupDuplexStream()
    const stderrMockupDuplexStream:MockupDuplexStream =
        new MockupDuplexStream()
    const childProcess:ChildProcess = new ChildProcess()
    childProcess.stdout = stdoutMockupDuplexStream
    childProcess.stderr = stderrMockupDuplexStream

    assert.strictEqual(Helper.handleChildProcess(childProcess), childProcess)
})
// endregion
QUnit.test('walkDirectoryRecursivelySync', (assert:Object):void => {
    const filePaths:Array<string> = []
    const callback:TraverseFilesCallbackFunction = (filePath:string):false => {
        filePaths.push(filePath)
        return false
    }
    Helper.walkDirectoryRecursivelySync('./', callback)
    assert.ok(filePaths.length > 0)
})
QUnit.test('determineAssetType', (assert:Object):void => {
    const paths:Paths = {
        apiDocumentation: '',
        asset: {
            cascadingStyleSheet: '',
            coffeeScript: '',
            data: '',
            font: '',
            image: '',
            javaScript: '',
            less: '',
            publicTarget: '',
            sass: '',
            scss: '',
            source: '',
            target: '',
            template: ''
        },
        context: '',
        ignore: [],
        manifest: '',
        source: '',
        target: '',
        tidyUp: []
    }
    // TODO make more generic with for loops and in all other test files in all
    // projects
    assert.strictEqual(Helper.determineAssetType(
        './', buildConfiguration, paths
    ), null)
    assert.strictEqual(Helper.determineAssetType(
        'a.js', buildConfiguration, paths
    ), 'javaScript')
    assert.strictEqual(Helper.determineAssetType(
        'a.css', buildConfiguration, paths
    ), null)
})
QUnit.test('resolveBuildConfigurationFilePaths', (assert:Object):void => {
    assert.deepEqual(Helper.resolveBuildConfigurationFilePaths({}), [])
    assert.deepEqual(Helper.resolveBuildConfigurationFilePaths(
        buildConfiguration, './', './', ['.git', 'node_modules']
    ), [
        {
            extension: 'js',
            fileNamePattern: '',
            filePaths: [],
            outputExtension: 'js'
        }, {
            extension: 'example',
            fileNamePattern: '',
            filePaths: [],
            outputExtension: 'example'
        }, {
            extension: 'other',
            fileNamePattern: '',
            filePaths: [],
            outputExtension: 'other'
        }
    ])
})
QUnit.test('determineModuleLocations', (assert:Object):void => {
    assert.deepEqual(Helper.determineModuleLocations({}), {
        filePaths: [],
        directoryPaths: []
    })
    assert.deepEqual(Helper.determineModuleLocations('example'), {
        filePaths: ['example'],
        directoryPaths: ['.']
    })
    assert.deepEqual(Helper.determineModuleLocations(['example']), {
        filePaths: ['example'],
        directoryPaths: ['.']
    })
    assert.deepEqual(Helper.determineModuleLocations({example: 'example'}), {
        filePaths: ['example'],
        directoryPaths: ['.']
    })
    assert.deepEqual(Helper.determineModuleLocations('helper'), {
        filePaths: ['helper.js'],
        directoryPaths: ['.']
    })
    assert.deepEqual(Helper.determineModuleLocations({helper: ['helper']}), {
        filePaths: ['helper.js'],
        directoryPaths: ['.']
    })
})
QUnit.test('normalizeInternalInjection', (assert:Object):void => {
    assert.deepEqual(Helper.normalizeInternalInjection([]), {index: []})
    assert.deepEqual(Helper.normalizeInternalInjection({}), {index: []})
    assert.deepEqual(Helper.normalizeInternalInjection('example'), {
        index: ['example']})
    assert.deepEqual(Helper.normalizeInternalInjection(['example']), {
        index: ['example']})
    assert.deepEqual(Helper.normalizeInternalInjection({a: 'example'}), {
        a: ['example']})
    assert.deepEqual(Helper.normalizeInternalInjection({a: ['example']}), {
        a: ['example']})
    assert.deepEqual(Helper.normalizeInternalInjection(
        {a: ['example'], b: []}
    ), {a: ['example']})
    assert.deepEqual(Helper.normalizeInternalInjection({a: [], b: []}), {
        index: []})
})
QUnit.test('resolveInjection', (assert:Object):void => {
    assert.deepEqual(Helper.resolveInjection(
        {internal: [], external: [], commonChunkIDs: [], dllChunkIDs: []},
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {internal: [], external: [], commonChunkIDs: [], dllChunkIDs: []})
    assert.deepEqual(Helper.resolveInjection(
        {internal: 'a.js', external: [], commonChunkIDs: [], dllChunkIDs: []},
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {internal: 'a.js', external: [], commonChunkIDs: [], dllChunkIDs: []})
    assert.deepEqual(Helper.resolveInjection(
        {internal: ['a'], external: [], commonChunkIDs: [], dllChunkIDs: []},
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {internal: ['a'], external: [], commonChunkIDs: [], dllChunkIDs: []})
    assert.deepEqual(Helper.resolveInjection(
        {
            internal: '__auto__', external: [], commonChunkIDs: [],
            dllChunkIDs: []
        }, Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {internal: {}, external: [], commonChunkIDs: [], dllChunkIDs: []})
    assert.deepEqual(Helper.resolveInjection(
        {
            internal: {index: '__auto__'}, external: [], commonChunkIDs: [],
            dllChunkIDs: []
        }, Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {
        internal: {index: []}, external: [], commonChunkIDs: [],
        dllChunkIDs: []
    })
})
QUnit.test('getAutoChunk', (assert:Object):void => {
    assert.deepEqual(Helper.getAutoChunk(
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']), [
                '.git', 'node_modules'
            ], './'
    ), {})
})
QUnit.test('addDynamicGetterAndSetter', (assert:Object):void => {
    assert.strictEqual(Helper.addDynamicGetterAndSetter(null), null)
    assert.strictEqual(Helper.addDynamicGetterAndSetter(true), true)
    assert.notDeepEqual(Helper.addDynamicGetterAndSetter({}), {})
    assert.ok(Helper.addDynamicGetterAndSetter({
    }).__target__ instanceof Object)
    assert.deepEqual(Helper.addDynamicGetterAndSetter({}).__target__, {})
    const mockup = {}
    assert.strictEqual(
        Helper.addDynamicGetterAndSetter(mockup).__target__, mockup)
    assert.deepEqual(Helper.addDynamicGetterAndSetter({a: 1}, (
        value:any
    ):any => value + 2).a, 3)
    assert.deepEqual(Helper.addDynamicGetterAndSetter({a: {a: 1}}, (
        value:any
    ):any => (value instanceof Object) ? value : value + 2).a.a, 3)
    assert.deepEqual(Helper.addDynamicGetterAndSetter({a: {a: [{a: 1}]}}, (
        value:any
    ):any => (value instanceof Object) ? value : value + 2).a.a[0].a, 3)
    assert.deepEqual(Helper.addDynamicGetterAndSetter(
        {a: {a: 1}}, (value:any):any =>
            (value instanceof Object) ? value : value + 2,
        (key:any, value:any):any => value, '[]', '[]', 'hasOwnProperty', false
    ).a.a, 1)
    assert.deepEqual(Helper.addDynamicGetterAndSetter(
        {a: 1}, (value:any):any =>
            (value instanceof Object) ? value : value + 2,
        (key:any, value:any):any => value, '[]', '[]', 'hasOwnProperty', false,
        []
    ).a, 1)
    // IgnoreTypeCheck
    assert.deepEqual(Helper.addDynamicGetterAndSetter(
        {a: new Map([['a', 1]])}, (value:any):any =>
            (value instanceof Object) ? value : value + 2,
        (key:any, value:any):any => value, 'get', 'set', 'has', true, [Map]
    ).a.a, 3)
})
QUnit.test('resolveDynamicDataStructure', (assert:Object):void => {
    assert.deepEqual(Helper.resolveDynamicDataStructure(null), null)
    assert.deepEqual(Helper.resolveDynamicDataStructure(false), false)
    assert.deepEqual(Helper.resolveDynamicDataStructure('1'), '1')
    assert.deepEqual(Helper.resolveDynamicDataStructure(3), 3)
    assert.deepEqual(Helper.resolveDynamicDataStructure({}), {})
    assert.deepEqual(
        Helper.resolveDynamicDataStructure({__evaluate__: '1'}), 1)
    assert.deepEqual(
        Helper.resolveDynamicDataStructure({__evaluate__: "'1'"}), '1')
    assert.deepEqual(
        Helper.resolveDynamicDataStructure({a: {__evaluate__: "'a'"}}),
        {a: 'a'})
    assert.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.a'}}, {a: 1}
    ), {a: 1})
    assert.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.a'}}, {a: 1}, false
    ), {a: {__evaluate__: 'self.a'}})
    assert.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.a'}}, {a: 1}, true, '__run__'
    ), {a: {__evaluate__: 'self.a'}})
    assert.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__run__: 'self.a'}}, {a: 1}, true, '__run__'
    ), {a: 1})
    assert.deepEqual(Helper.resolveDynamicDataStructure(
        {a: [{__run__: 'self.a'}]}, {a: 1}, true, '__run__'
    ), {a: [1]})
    assert.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.b'}, b: 2}
    ), {a: 2, b: 2})
    assert.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.b'}, b: {__evaluate__: 'self.c'}, c: 2}
    ), {a: 2, b: 2, c: 2})
    assert.deepEqual(Helper.resolveDynamicDataStructure({a: {
        __execute__: 'return self.b'
    }, b: {__execute__: 'return self.c'}, c: 2
    }), {a: 2, b: 2, c: 2})
})
QUnit.test('applyAliases', (assert:Object):void => {
    assert.strictEqual(Helper.applyAliases('', {}), '')
    assert.strictEqual(Helper.applyAliases('', {a: 'b'}), '')
    assert.strictEqual(Helper.applyAliases('a', {}), 'a')
    assert.strictEqual(Helper.applyAliases('a', {a: 'b'}), 'b')
    assert.strictEqual(Helper.applyAliases('a', {a$: 'b'}), 'b')
    assert.strictEqual(Helper.applyAliases('aa', {a$: 'b'}), 'aa')
    assert.strictEqual(Helper.applyAliases('bba', {a: 'b'}), 'bbb')
    assert.strictEqual(Helper.applyAliases('helper', {}), 'helper')
})
QUnit.test('determineModuleFilePath', (assert:Object):void => {
    assert.strictEqual(Helper.determineModuleFilePath('a'), 'a')
    assert.strictEqual(Helper.determineModuleFilePath('a', {a: 'b'}), 'b')
    assert.strictEqual(Helper.determineModuleFilePath('bba', {a: 'b'}), 'bbb')
    assert.strictEqual(Helper.determineModuleFilePath('helper'), 'helper.js')
    assert.strictEqual(
        Helper.determineModuleFilePath('helper', {}, []), 'helper')
    assert.strictEqual(
        Helper.determineModuleFilePath('helper', {}, ['.js'], '../'), 'helper')
    assert.strictEqual(
        Helper.determineModuleFilePath('helper', {}, ['.js'], './'),
        'helper.js')
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
