#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {ChildProcess} from 'child_process'
import {Duplex as DuplexStream} from 'stream'
import * as qunit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import type {
    BuildConfiguration, ErrorHandlerFunction, Paths,
    TraverseFilesCallbackFunction
} from '../type'
import Helper from '../helper.compiled'
// endregion
qunit.module('helper')
qunit.load()
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
qunit.test('isPlainObject', ():void => {
    qunit.ok(Helper.isPlainObject({}))
    qunit.ok(Helper.isPlainObject({a: 1}))
    /* eslint-disable no-new-object */
    qunit.ok(Helper.isPlainObject(new Object()))
    /* eslint-enable no-new-object */

    qunit.notOk(Helper.isPlainObject(new String()))
    qunit.notOk(Helper.isPlainObject(Object))
    qunit.notOk(Helper.isPlainObject(null))
    qunit.notOk(Helper.isPlainObject(0))
    qunit.notOk(Helper.isPlainObject(1))
    qunit.notOk(Helper.isPlainObject(true))
    qunit.notOk(Helper.isPlainObject(undefined))
})
qunit.test('isFunction', ():void => {
    qunit.ok(Helper.isFunction(Object))
    qunit.ok(Helper.isFunction(new Function('return 1')))
    qunit.ok(Helper.isFunction(function():void {}))
    qunit.ok(Helper.isFunction(():void => {}))

    qunit.notOk(Helper.isFunction(null))
    qunit.notOk(Helper.isFunction(false))
    qunit.notOk(Helper.isFunction(0))
    qunit.notOk(Helper.isFunction(1))
    qunit.notOk(Helper.isFunction(undefined))
    qunit.notOk(Helper.isFunction({}))
    qunit.notOk(Helper.isFunction(new Boolean()))
})
qunit.test('isFilePathInLocation', ():void => {
    qunit.ok(Helper.isFilePathInLocation('./', ['./']))
    qunit.ok(Helper.isFilePathInLocation('./', ['../']))

    qunit.notOk(Helper.isFilePathInLocation('../', ['./']))
})
// / endregion
qunit.test('convertToValidVariableName', ():void => {
    qunit.strictEqual(Helper.convertToValidVariableName(''), '')
    qunit.strictEqual(Helper.convertToValidVariableName('a'), 'a')
    qunit.strictEqual(Helper.convertToValidVariableName('_a'), '_a')
    qunit.strictEqual(Helper.convertToValidVariableName('_a_a'), '_a_a')
    qunit.strictEqual(Helper.convertToValidVariableName('_a-a'), '_aA')
    qunit.strictEqual(Helper.convertToValidVariableName('-a-a'), 'aA')
    qunit.strictEqual(Helper.convertToValidVariableName('-a--a'), 'aA')
    qunit.strictEqual(Helper.convertToValidVariableName('--a--a'), 'aA')
})
qunit.test('extendObject', ():void => {
    qunit.deepEqual(Helper.extendObject({}), {})
    qunit.deepEqual(Helper.extendObject(true, {}), {})
    qunit.deepEqual(Helper.extendObject({a: 1}), {a: 1})
    qunit.deepEqual(Helper.extendObject({a: 1}, {a: 2}), {a: 2})
    qunit.deepEqual(Helper.extendObject({}, {a: 1}, {a: 2}), {a: 2})
    qunit.deepEqual(Helper.extendObject({}, {a: 1}, {a: 2}), {a: 2})
    qunit.deepEqual(Helper.extendObject(
        {a: 1, b: {a: 1}}, {a: 2, b: {b: 1}}
    ), {a: 2, b: {b: 1}})
    qunit.deepEqual(Helper.extendObject(
        true, {a: 1, b: {a: 1}}, {a: 2, b: {b: 1}}
    ), {a: 2, b: {a: 1, b: 1}})
    qunit.deepEqual(Helper.extendObject(
        true, {a: 1, b: {a: []}}, {a: 2, b: {b: 1}}
    ), {a: 2, b: {a: [], b: 1}})
    qunit.deepEqual(Helper.extendObject(
        true, {a: {a: [1, 2]}}, {a: {a: [3, 4]}}
    ), {a: {a: [3, 4]}})

    qunit.deepEqual(Helper.extendObject(new Map()), new Map())
    qunit.deepEqual(Helper.extendObject(true, new Map()), new Map())
    qunit.deepEqual(Helper.extendObject(
        new Map([['a', 1]])
    ), new Map([['a', 1]]))
    qunit.deepEqual(Helper.extendObject(
        new Map([['a', 1]]), new Map([['a', 2]])
    ), new Map([['a', 2]]))
    qunit.deepEqual(Helper.extendObject(
        new Map(), new Map([['a', 1]]), new Map([['a', 2]])
    ), new Map([['a', 2]]))
    qunit.deepEqual(Helper.extendObject(
        new Map(), new Map([['a', 1]]), new Map([['a', 2]])
    ), new Map([['a', 2]]))
    qunit.deepEqual(Helper.extendObject(
        new Map([['a', 1], ['b', new Map([['a', 1]])]]),
        new Map([['a', 2], ['b', new Map([['b', 1]])]])
    ), new Map([['a', 2], ['b', new Map([['b', 1]])]]))
    qunit.deepEqual(Helper.extendObject(
        true, new Map([['a', 1], ['b', new Map([['a', 1]])]]),
        new Map([['a', 2], ['b', new Map([['b', 1]])]])
    ), new Map([['a', 2], ['b', new Map([['a', 1], ['b', 1]])]]))
    qunit.deepEqual(Helper.extendObject(
        true, new Map([['a', 1], ['b', new Map([['a', []]])]]),
        new Map([['a', 2], ['b', new Map([['b', 1]])]])
    ), new Map([['a', 2], ['b', new Map([['a', []], ['b', 1]])]]))
    qunit.deepEqual(Helper.extendObject(
        true, new Map([['a', new Map([['a', [1, 2]]])]]),
        new Map([['a', new Map([['a', [3, 4]]])]])
    ), new Map([['a', new Map([['a', [3, 4]]])]]))
})
qunit.test('handleChildProcess', ():void => {
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
            chunk:Buffer|string, encoding:string,
            callback:ErrorHandlerFunction
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

    qunit.strictEqual(Helper.handleChildProcess(childProcess), childProcess)
})
qunit.test('walkDirectoryRecursivelySync', ():void => {
    const filePaths:Array<string> = []
    const callback:TraverseFilesCallbackFunction = (filePath:string):void => {
        filePaths.push(filePath)
        return false
    }
    Helper.walkDirectoryRecursivelySync('./', callback)
    qunit.ok(filePaths.length > 0)
})
qunit.test('determineAssetType', ():void => {
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

    qunit.strictEqual(Helper.determineAssetType(
        './', buildConfiguration, paths
    ), null)
    qunit.strictEqual(Helper.determineAssetType(
        'a.js', buildConfiguration, paths
    ), 'javaScript')
    qunit.strictEqual(Helper.determineAssetType(
        'a.css', buildConfiguration, paths
    ), null)
})
qunit.test('resolveBuildConfigurationFilePaths', ():void => {
    qunit.deepEqual(Helper.resolveBuildConfigurationFilePaths({}), [])
    qunit.deepEqual(Helper.resolveBuildConfigurationFilePaths(
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
qunit.test('determineModuleLocations', ():void => {
    qunit.deepEqual(Helper.determineModuleLocations({}), {
        filePaths: [],
        directoryPaths: []
    })
    qunit.deepEqual(Helper.determineModuleLocations('example'), {
        filePaths: ['example'],
        directoryPaths: ['.']
    })
    qunit.deepEqual(Helper.determineModuleLocations(['example']), {
        filePaths: ['example'],
        directoryPaths: ['.']
    })
    qunit.deepEqual(Helper.determineModuleLocations({example: 'example'}), {
        filePaths: ['example'],
        directoryPaths: ['.']
    })
    qunit.deepEqual(Helper.determineModuleLocations('helper'), {
        filePaths: ['helper.js'],
        directoryPaths: ['.']
    })
    qunit.deepEqual(Helper.determineModuleLocations({helper: ['helper']}), {
        filePaths: ['helper.js'],
        directoryPaths: ['.']
    })
})
qunit.test('normalizeInternalInjection', ():void => {
    qunit.deepEqual(Helper.normalizeInternalInjection([]), {index: []})
    qunit.deepEqual(Helper.normalizeInternalInjection({}), {index: []})
    qunit.deepEqual(Helper.normalizeInternalInjection('example'), {
        index: ['example']})
    qunit.deepEqual(Helper.normalizeInternalInjection(['example']), {
        index: ['example']})
    qunit.deepEqual(Helper.normalizeInternalInjection({a: 'example'}), {
        a: ['example']})
    qunit.deepEqual(Helper.normalizeInternalInjection({a: ['example']}), {
        a: ['example']})
    qunit.deepEqual(Helper.normalizeInternalInjection(
        {a: ['example'], b: []}
    ), {a: ['example']})
    qunit.deepEqual(Helper.normalizeInternalInjection({a: [], b: []}), {
        index: []})
})
qunit.test('resolveInjection', ():void => {
    qunit.deepEqual(Helper.resolveInjection(
        {internal: [], external: [], commonChunkIDs: [], dllChunkIDs: []},
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {internal: [], external: [], commonChunkIDs: [], dllChunkIDs: []})
    qunit.deepEqual(Helper.resolveInjection(
        {internal: 'a.js', external: [], commonChunkIDs: [], dllChunkIDs: []},
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {internal: 'a.js', external: [], commonChunkIDs: [], dllChunkIDs: []})
    qunit.deepEqual(Helper.resolveInjection(
        {internal: ['a'], external: [], commonChunkIDs: [], dllChunkIDs: []},
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {internal: ['a'], external: [], commonChunkIDs: [], dllChunkIDs: []})
    qunit.deepEqual(Helper.resolveInjection(
        {
            internal: '__auto__', external: [], commonChunkIDs: [],
            dllChunkIDs: []
        }, Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {internal: {}, external: [], commonChunkIDs: [], dllChunkIDs: []})
    qunit.deepEqual(Helper.resolveInjection(
        {
            internal: {index: '__auto__'}, external: [], commonChunkIDs: [],
            dllChunkIDs: []
        }, Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']
        ), [], {}, [], './', ['.git', 'node_modules']
    ), {
        internal: {index: {}}, external: [], commonChunkIDs: [],
        dllChunkIDs: []
    })
})
qunit.test('getAutoChunk', ():void => {
    qunit.deepEqual(Helper.getAutoChunk(
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', './', ['.git', 'node_modules']), [
                '.git', 'node_modules'
            ], './'
    ), {})
})
qunit.test('addDynamicGetterAndSetter', ():void => {
    qunit.strictEqual(Helper.addDynamicGetterAndSetter(null), null)
    qunit.strictEqual(Helper.addDynamicGetterAndSetter(true), true)
    qunit.notDeepEqual(Helper.addDynamicGetterAndSetter({}), {})
    qunit.ok(Helper.addDynamicGetterAndSetter({}).__target__ instanceof Object)
    qunit.deepEqual(Helper.addDynamicGetterAndSetter({}).__target__, {})
    const mockup = {}
    qunit.strictEqual(
        Helper.addDynamicGetterAndSetter(mockup).__target__, mockup)
    qunit.deepEqual(Helper.addDynamicGetterAndSetter({a: 1}, (value:any):any =>
        value + 2
    ).a, 3)
    qunit.deepEqual(Helper.addDynamicGetterAndSetter({a: {a: 1}}, (
        value:any
    ):any => (value instanceof Object) ? value : value + 2).a.a, 3)
    qunit.deepEqual(Helper.addDynamicGetterAndSetter({a: {a: [{a: 1}]}}, (
        value:any
    ):any => (value instanceof Object) ? value : value + 2).a.a[0].a, 3)
    qunit.deepEqual(Helper.addDynamicGetterAndSetter(
        {a: {a: 1}}, (value:any):any =>
            (value instanceof Object) ? value : value + 2,
        (key:any, value:any):any => value, '[]', '[]', 'hasOwnProperty', false
    ).a.a, 1)
    qunit.deepEqual(Helper.addDynamicGetterAndSetter(
        {a: 1}, (value:any):any =>
            (value instanceof Object) ? value : value + 2,
        (key:any, value:any):any => value, '[]', '[]', 'hasOwnProperty', false,
        []
    ).a, 1)
    // IgnoreTypeCheck
    qunit.deepEqual(Helper.addDynamicGetterAndSetter(
        {a: new Map([['a', 1]])}, (value:any):any =>
            (value instanceof Object) ? value : value + 2,
        (key:any, value:any):any => value, 'get', 'set', 'has', true, [Map]
    ).a.a, 3)
})
qunit.test('resolveDynamicDataStructure', ():void => {
    qunit.deepEqual(Helper.resolveDynamicDataStructure(null), null)
    qunit.deepEqual(Helper.resolveDynamicDataStructure(false), false)
    qunit.deepEqual(Helper.resolveDynamicDataStructure('1'), '1')
    qunit.deepEqual(Helper.resolveDynamicDataStructure(3), 3)
    qunit.deepEqual(Helper.resolveDynamicDataStructure({}), {})
    qunit.deepEqual(Helper.resolveDynamicDataStructure({__evaluate__: '1'}), 1)
    qunit.deepEqual(
        Helper.resolveDynamicDataStructure({__evaluate__: "'1'"}), '1')
    qunit.deepEqual(
        Helper.resolveDynamicDataStructure({a: {__evaluate__: "'a'"}}),
        {a: 'a'})
    qunit.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.a'}}, {a: 1}
    ), {a: 1})
    qunit.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.a'}}, {a: 1}, false
    ), {a: {__evaluate__: 'self.a'}})
    qunit.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.a'}}, {a: 1}, true, '__run__'
    ), {a: {__evaluate__: 'self.a'}})
    qunit.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__run__: 'self.a'}}, {a: 1}, true, '__run__'
    ), {a: 1})
    qunit.deepEqual(Helper.resolveDynamicDataStructure(
        {a: [{__run__: 'self.a'}]}, {a: 1}, true, '__run__'
    ), {a: [1]})
    qunit.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.b'}, b: 2}
    ), {a: 2, b: 2})
    qunit.deepEqual(Helper.resolveDynamicDataStructure(
        {a: {__evaluate__: 'self.b'}, b: {__evaluate__: 'self.c'}, c: 2}
    ), {a: 2, b: 2, c: 2})
    qunit.deepEqual(Helper.resolveDynamicDataStructure({a: {
        __execute__: 'return self.b'
    }, b: {__execute__: 'return self.c'}, c: 2
    }), {a: 2, b: 2, c: 2})
})
qunit.test('applyAliases', ():void => {
    qunit.strictEqual(Helper.applyAliases('', {}), '')
    qunit.strictEqual(Helper.applyAliases('', {a: 'b'}), '')
    qunit.strictEqual(Helper.applyAliases('a', {}), 'a')
    qunit.strictEqual(Helper.applyAliases('a', {a: 'b'}), 'b')
    qunit.strictEqual(Helper.applyAliases('a', {a$: 'b'}), 'b')
    qunit.strictEqual(Helper.applyAliases('aa', {a$: 'b'}), 'aa')
    qunit.strictEqual(Helper.applyAliases('bba', {a: 'b'}), 'bbb')
    qunit.strictEqual(Helper.applyAliases('helper', {}), 'helper')
})
qunit.test('determineModuleFilePath', ():void => {
    qunit.strictEqual(Helper.determineModuleFilePath('a'), 'a')
    qunit.strictEqual(Helper.determineModuleFilePath('a', {a: 'b'}), 'b')
    qunit.strictEqual(Helper.determineModuleFilePath('bba', {a: 'b'}), 'bbb')
    qunit.strictEqual(Helper.determineModuleFilePath('helper'), 'helper.js')
    qunit.strictEqual(
        Helper.determineModuleFilePath('helper', {}, []), 'helper')
    qunit.strictEqual(
        Helper.determineModuleFilePath('helper', {}, ['.js'], '../'), 'helper')
    qunit.strictEqual(
        Helper.determineModuleFilePath('helper', {}, ['.js'], './'),
        'helper.js')
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
