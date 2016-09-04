#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {ChildProcess} from 'child_process'
import {Duplex as DuplexStream} from 'stream'
import * as fileSystem from 'fs'
import path from 'path'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import type {
    BuildConfiguration, Path, TraverseFilesCallbackFunction
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
QUnit.test('isFilePathInLocation', (assert:Object):void => {
    for (const okArguments:Array<any> of [
        ['./', ['./']], ['./', ['../']]
    ])
        assert.ok(Helper.isFilePathInLocation.apply(Helper, okArguments))
    for (const notOkArguments:Array<any> of [['../', ['./']]])
        assert.notOk(Helper.isFilePathInLocation.apply(Helper, notOkArguments))
})
// / endregion
// / region string
QUnit.test('stripLoader', (assert:Object):void => {
    for (const test:Array<string> of [
        ['', ''],
        ['a', 'a'],
        ['a!b', 'b'],
        ['aa!b!c', 'c'],
        ['aa!b!c', 'c'],
        ['c?a', 'c'],
        ['aa!b!c?a', 'c'],
        ['aa!b!c?abb?', 'c'],
        ['aa!b!c?abb?a', 'c']
    ])
        assert.strictEqual(Helper.stripLoader(test[0]), test[1])
})
// / endregion
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
// region file handler
QUnit.test('determineExternalRequest', (assert:Object):void => {
    for (const test:Array<any> of [
        [[''], ''],
        [['a'], 'a'],
        [['path'], 'path'],
        [['./helper'], null],
        [['./helper', './'], null],
        [['./helper', '../'], null],
        [['./helper', './a'], './helper'],
        [['./helper', './', './a'], null],
        [['./a', './', './node_modules/a'], './a'],
        [['a', './', './'], 'a'],
        [['path', './', './', {}, []], 'path'],
        [['path', './', './', {}, [], {path: './index.js'}], './index.js'],
        [['path', './', './', {}, [], {path: 'index.js'}], 'index.js'],
        [['path', './', './', {}, [], {path: './helper.js'}], null],
        [['webpack'], 'webpack'],
        [['a', './', './', {}, [path.resolve(
            __dirname, '../node_modules'
        )], {a$: 'webpack'}], 'webpack'],
        [['a', './', './', {a: ['webpack']}, [path.resolve(
            __dirname, '../node_modules'
        )], {a$: 'webpack'}], null],
        [['a', './', './', {a: ['webpack']}, [path.resolve(
            __dirname, '../node_modules'
        )], {a$: 'webpack'}, []], 'webpack'],
        [['a', './', './', {a: ['webpack']}, [path.resolve(
            __dirname, '../node_modules'
        )], {a$: 'webpack'}, ['', '.js'], './', ['./']], 'webpack'],
        [['a', './', './', {a: ['webpack']}, [path.resolve(
            __dirname, '../node_modules'
        )], {a$: 'webpack'}, ['', '.js'], './', ['.git']], null],
        [
            ['a', './', './', {a: ['webpack']}, [path.resolve(
                __dirname, '../node_modules'
            )], {a$: 'webpack'}, ['', '.js'], './', ['.git'], ['webpack']],
            'webpack'
        ],
        [['webpack', './', './', {}, [path.resolve(
            __dirname, '../node_modules'
        )], {}, ['', '.js'], './', ['.git'], [], ['webpack']], null],
        [['webpack', './', './', {}, [path.resolve(
            __dirname, '../node_modules'
        )], {}, ['', '.js'], './', ['.git'], [], []], 'webpack'],
        [['webpack', './', './', {}, [path.resolve(
            __dirname, '../node_modules'
        )], {}, ['', '.js'], './', ['.git'], [], [], false], 'webpack'],
        [['webpack', './', './', {}, [path.resolve(
            __dirname, '../node_modules'
        )], {}, ['', '.js'], './', ['.git'], [], [], true], null],
        [['a!webpack', './', './', {}, [path.resolve(
            __dirname, '../node_modules'
        )], {}, ['', '.js'], './', ['.git'], [], [], false], null],
        [['a!webpack', './', './', {}, [path.resolve(
            __dirname, '../node_modules'
        )], {}, ['', '.js'], './', ['.git'], [], [], false, true], null],
        [['a!webpack', './', './', {}, [path.resolve(
            __dirname, '../node_modules'
        )], {}, ['', '.js'], './', ['.git'], [], [], false, false], 'webpack'],
        [
            ['a!webpack', './', './', {}, [path.resolve(
                __dirname, '../node_modules'
            )], {}, ['', '.js'], './', ['.git'], [], [], false, false, [
                '.ext'
            ]],
            null
        ]
    ])
        assert.strictEqual(
            Helper.determineExternalRequest.apply(Helper, test[0]), test[1])
})
QUnit.test('isFileSync', (assert:Object):void => {
    for (const filePath:string of [
        __filename,
        path.join(__dirname, path.basename(__filename))
    ])
        assert.ok(Helper.isFileSync(filePath))
})
QUnit.test('walkDirectoryRecursivelySync', (assert:Object):void => {
    const filePaths:Array<string> = []
    const callback:TraverseFilesCallbackFunction = (filePath:string):false => {
        filePaths.push(filePath)
        return false
    }
    Helper.walkDirectoryRecursivelySync('./', callback)
    assert.ok(filePaths.length > 0)
})
QUnit.test('copyFileSync', (assert:Object):void => {
    assert.ok(Helper.copyFileSync(
        path.join(__dirname, 'helper.js'),
        path.join(__dirname, 'test.compiled.js')
    ).endsWith('/test.compiled.js'))
    fileSystem.unlinkSync(path.join(__dirname, 'test.compiled.js'))
})
QUnit.test('copyDirectoryRecursiveSync', (assert:Object):void =>
    assert.ok(Helper.copyDirectoryRecursiveSync(
        __dirname, path.resolve(__dirname, '../test.compiled')
    ).endsWith('/test.compiled')))
QUnit.test('determineAssetType', (assert:Object):void => {
    const paths:Path = {
        apiDocumentation: '',
        base: '',
        context: '',
        source: {
            asset: {
                base: '',
                cascadingStyleSheet: '',
                data: '',
                font: '',
                image: '',
                javaScript: '',
                source: '',
                target: '',
                template: ''
            },
            base: ''
        },
        target: {
            asset: {
                base: '',
                cascadingStyleSheet: '',
                data: '',
                font: '',
                image: '',
                javaScript: '',
                source: '',
                target: '',
                template: ''
            },
            base: '',
            manifest: '',
            public: '',
            target: ''
        },
        ignore: [],
        tidyUp: []
    }
    for (const test:Array<any> of [
        [['./', buildConfiguration, paths], null],
        [['a.js', buildConfiguration, paths], 'javaScript'],
        [['a.css', buildConfiguration, paths], null]
    ])
        assert.strictEqual(
            Helper.determineAssetType.apply(Helper, test[0]), test[1])
})
QUnit.test('resolveBuildConfigurationFilePaths', (assert:Object):void => {
    assert.deepEqual(Helper.resolveBuildConfigurationFilePaths({}), [])
    assert.deepEqual(Helper.resolveBuildConfigurationFilePaths(
        buildConfiguration, './', ['.git', 'node_modules']
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
    for (const test:Array<any> of [
        [{}, {filePaths: [], directoryPaths: []}],
        ['example', {filePaths: [], directoryPaths: []}],
        [
            'helper', {
                filePaths: [path.resolve(__dirname, '../helper.js')],
                directoryPaths: [path.resolve(__dirname, '../')]}
        ],
        [{example: 'example'}, {filePaths: [], directoryPaths: []}],
        [{example: 'helper'}, {
            filePaths: [path.resolve(__dirname, '../helper.js')],
            directoryPaths: [path.resolve(__dirname, '../')]}
        ],
        [{helper: ['helper.js']}, {
            filePaths: [path.resolve(__dirname, '../', 'helper.js')],
            directoryPaths: [path.resolve(__dirname, '../')]
        }]
    ])
        assert.deepEqual(Helper.determineModuleLocations(test[0]), test[1])
})
QUnit.test('normalizeInternalInjection', (assert:Object):void => {
    for (const test:Array<any> of [
        [[], {index: []}],
        [{}, {index: []}],
        ['example', {index: ['example']}],
        [['example'], {index: ['example']}],
        [{a: 'example'}, {a: ['example']}],
        [{a: ['example']}, {a: ['example']}],
        [{a: ['example'], b: []}, {a: ['example']}],
        [{a: [], b: []}, {index: []}]
    ])
        assert.deepEqual(Helper.normalizeInternalInjection(test[0]), test[1])
})
QUnit.test('resolveInjection', (assert:Object):void => {
    for (const test:Array<any> of [
        [
            [
                {
                    internal: [], external: [], commonChunkIDs: [],
                    dllChunkIDs: []
                },
                Helper.resolveBuildConfigurationFilePaths(
                    buildConfiguration, './', ['.git', 'node_modules']
                ), [], {}, [], './', '', ['.git', 'node_modules']
            ],
            {internal: [], external: [], commonChunkIDs: [], dllChunkIDs: []}
        ],
        [
            [
                {
                    internal: 'a.js', external: [], commonChunkIDs: [],
                    dllChunkIDs: []
                },
                Helper.resolveBuildConfigurationFilePaths(
                    buildConfiguration, './', ['.git', 'node_modules']
                ), [], {}, [], './', '', ['.git', 'node_modules']
            ],
            {
                internal: 'a.js', external: [], commonChunkIDs: [],
                dllChunkIDs: []
            }
        ],
        [
            [
                {
                    internal: ['a'], external: [], commonChunkIDs: [],
                    dllChunkIDs: []
                },
                Helper.resolveBuildConfigurationFilePaths(
                    buildConfiguration, './', ['.git', 'node_modules']
                ), [], {}, [], './', '', ['.git', 'node_modules']
            ],
            {
                internal: ['a'], external: [], commonChunkIDs: [],
                dllChunkIDs: []
            }
        ],
        [
            [
                {
                    internal: '__auto__', external: [], commonChunkIDs: [],
                    dllChunkIDs: []
                },
                Helper.resolveBuildConfigurationFilePaths(
                    buildConfiguration, './', ['.git', 'node_modules']
                ), [], {}, [], './', '', ['.git', 'node_modules']
            ],
            {internal: {}, external: [], commonChunkIDs: [], dllChunkIDs: []}
        ],
        [
            [
                {
                    internal: {index: '__auto__'}, external: [],
                    commonChunkIDs: [], dllChunkIDs: []
                },
                Helper.resolveBuildConfigurationFilePaths(
                    buildConfiguration, './', ['.git', 'node_modules']
                ), [], {}, [], './', '', ['.git', 'node_modules']
            ],
            {
                internal: {index: []}, external: [], commonChunkIDs: [],
                dllChunkIDs: []
            }
        ]
    ])
        assert.deepEqual(
            Helper.resolveInjection.apply(Helper, test[0]), test[1])
})
QUnit.test('getAutoChunk', (assert:Object):void => {
    assert.deepEqual(Helper.getAutoChunk(
        Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', ['.git', 'node_modules']), [
                '.git', 'node_modules'
            ], './'
    ), {})
})
QUnit.test('determineModuleFilePath', (assert:Object):void => {
    for (const test:Array<any> of [
        [[''], null],
        [['a', {}, [], './', '', []], null],
        [['a', {a: 'b'}, [], './', '', []], null],
        [['bba', {a: 'b'}, [], './', '', []], null],
        [['helper'], 'helper.js'],
        [['helper', {}, [], './', '', []], null],
        [['helper', {}, ['.js'], '../', '', []], null],
        [['helper', {}, ['.js'], './'], 'helper.js']
    ]) {
        let result:?string = Helper.determineModuleFilePath.apply(
            Helper, test[0])
        if (result)
            result = path.basename(result)
        assert.strictEqual(result, test[1])
    }
})
// endregion
QUnit.test('applyAliases', (assert:Object):void => {
    for (const test:Array<any> of [
        ['', {}, ''],
        ['', {a: 'b'}, ''],
        ['a', {}, 'a'],
        ['a', {a: 'b'}, 'b'],
        ['a', {a$: 'b'}, 'b'],
        ['aa', {a$: 'b'}, 'aa'],
        ['bba', {a: 'b'}, 'bbb'],
        ['helper', {}, 'helper']
    ])
        assert.strictEqual(Helper.applyAliases(test[0], test[1]), test[2])
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
