#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import path from 'path'
import registerTest from 'clientnode/test.compiled'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}

import type {BuildConfiguration, Path} from '../type'
import Helper from '../helper.compiled'
// endregion
registerTest(function():void {
    this.module('helper')
    // region mockup
    const buildConfiguration:BuildConfiguration = {
        other: {
            extension: 'other',
            filePathPattern: '',
            outputExtension: 'other'
        },
        javaScript: {
            extension: 'js',
            filePathPattern: '',
            outputExtension: 'js'
        },
        example: {
            extension: 'example',
            filePathPattern: '',
            outputExtension: 'example'
        }
    }
    // endregion
    // region tests
    // / region boolean
    this.test('isFilePathInLocation', (assert:Object):void => {
        for (const test:Array<any> of [
            ['./', ['./']], ['./', ['../']]
        ])
            assert.ok(Helper.isFilePathInLocation(...test))
        for (const test:Array<any> of [['../', ['./']]])
            assert.notOk(Helper.isFilePathInLocation(...test))
    })
    // / endregion
    // / region string
    this.test('inPlaceCSSAndJavaScriptAssetReferences', async (
        assert:Object
    ):void => {
        const done:Function = assert.async()
        for (const test:Array<string> of [
            [['', null, null, '', '', '', {}], {
                content: '<html><head></head><body></body></html>',
                filePathsToRemove: []
            }],
            [[
                '<html><head></head><body></body></html>', null, null, '', '',
                '', {}
            ], {
                content: '<html><head></head><body></body></html>',
                filePathsToRemove: []
            }]
        ])
            assert.deepEqual(
                await Helper.inPlaceCSSAndJavaScriptAssetReferences(
                    ...test[0]
                ), test[1])
        done()
    })
    this.test('stripLoader', (assert:Object):void => {
        for (const test:Array<string> of [
            ['', ''],
            ['a', 'a'],
            ['a!b', 'b'],
            ['aa!b!c', 'c'],
            ['aa!b!c', 'c'],
            ['c?a', 'c'],
            ['aa!b!c?a', 'c'],
            ['aa!b!c?abb?', 'c'],
            ['aa!b!c?abb?a', 'c'],
            ['imports?$=library!moduleName', 'moduleName']
        ])
            assert.strictEqual(Helper.stripLoader(test[0]), test[1])
    })
    // / endregion
    // / region array
    this.test('normalizePaths', (assert:Object):void => {
        for (const test:Array<any> of [
            [[], []],
            [['a'], ['a']],
            [['a/'], ['a']],
            [['a/', 'a'], ['a']],
            [['a/', 'a/'], ['a']],
            [['a/', 'a/', 'b/'], ['a', 'b']],
            [['a/', 'a/', 'b'], ['a', 'b']],
            [['a/', 'a/', 'b', '', '.'], ['a', 'b', '.']]
        ])
            assert.deepEqual(Helper.normalizePaths(test[0]), test[1])
    })
    // / endregion
    // region file handler
    this.test('renderFilePathTemplate', (assert:Object):void => {
        for (const test:Array<any> of [
            [[''], ''],
            [['a'], 'a'],
            [['path'], 'path'],
            [['a[name]b'], 'a.__dummy__b'],
            [['a[name]b[name]'], 'a.__dummy__b.__dummy__'],
            [['a[id]b[hash]'], 'a.__dummy__b.__dummy__'],
            [['a[id]b[hash]', {'[id]': 1, '[hash]': 2}], 'a1b2'],
            [['a[id]b[hash]', {}], 'a[id]b[hash]']
        ])
            assert.strictEqual(
                Helper.renderFilePathTemplate(...test[0]), test[1])
    })
    this.test('applyContext', (assert:Object):void => {
        for (const test:Array<any> of [
            [[''], ''],
            [['a'], 'a'],
            [['a', './'], 'a'],
            [['./a', './'], './a'],
            [['./a', './', './'], './a'],
            [['./a', './a', './'], 'a/a'],
            [['./a', './a', './a'], './a'],
            [['./a', './a', './a', {a: 'b'}], './a'],
            [['./a', './a/a', './', {a: 'b'}, {}, ['a']], 'b/a']
        ])
            assert.strictEqual(Helper.applyContext(...test[0]), test[1])
    })
    this.test('determineExternalRequest', (assert:Object):void => {
        for (const test:Array<any> of [
            [[''], ''],
            [['a'], 'a'],
            [['path'], 'path'],
            [['./helper'], null],
            [['./helper', './'], null],
            [['./helper', '../'], null],
            [['./helper', './a'], './helper'],
            [['./helper', './', './'], null],
            [['./a', './', './node_modules/a'], 'a/a'],
            [['a', './', './'], 'a'],
            [['path', './', './', {}, []], 'path'],
            [['path', './', './', {}, [], {path: './main.js'}], './main.js'],
            [['path', './', './', {}, [], {path: 'main.js'}], 'main.js'],
            [['path', './', './', {}, [], {path: './helper.js'}], null],
            [['webpack'], 'webpack'],
            [
                ['a', './', './', {}, ['node_modules'], {a$: 'webpack'}],
                'webpack'
            ],
            [['a', './', './', {a: ['webpack']}, ['node_modules'], {
                a$: 'webpack'
            }], null],
            [[
                'a', '../', './', {a: ['not_webpack']}, ['node_modules'],
                {a$: 'webpack'}, {},
                {file: {external: [], internal: []}, module: []}
            ], 'webpack'],
            [[
                'a', '../', './', {a: ['webpack']}, ['node_modules'],
                {a$: 'webpack'}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['./']
            ], 'webpack'],
            [[
                'a', './', './', {a: ['webpack']}, ['node_modules'],
                {a$: 'webpack'}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['.git']
            ], null],
            [[
                'a', './', './', {a: ['webpack']}, ['node_modules'],
                {a$: 'webpack'}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['.git'], [], [], [], [], ['webpack']
            ], 'webpack'],
            [[
                'webpack', './', '../', {}, ['node_modules'], {}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['.git'], ['node_modules'], ['main'], ['main'], [], [],
                []
            ], 'webpack'],
            [[
                'webpack', './', '../', {}, ['node_modules'], {}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['.git'], ['node_modules'], ['main'], ['main'], [], [],
                [], false
            ], 'webpack'],
            [[
                'webpack', './', '../', {}, ['node_modules'], {}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['.git'], ['node_modules'], ['main'], ['main'], [], [],
                [], true
            ], null],
            [[
                'a!webpack', './', '../', {}, ['node_modules'], {}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['.git'], ['node_modules'], ['main'], ['main'], [], [],
                [], false
            ], null],
            [[
                'a!webpack', './', '../', {}, ['node_modules'], {}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['.git'], ['node_modules'], ['main'], ['main'], [], [],
                [], false, true
            ], null],
            [[
                'a!webpack', './', '../', {}, ['node_modules'], {}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', ['.git'], ['node_modules'], ['main'], ['main'], [], [],
                [], false, false
            ], 'webpack'],
            [[
                'a!webpack', './', '../', {}, ['node_modules'], {}, {},
                {file: {external: ['.eot'], internal: ['.js']}, module: []},
                './', ['.git'], ['node_modules'], ['main'], ['main'], [], [],
                [], false, false
            ], null]
        ])
            assert.strictEqual(
                Helper.determineExternalRequest(...test[0]), test[1])
    })
    this.test('determineAssetType', (assert:Object):void => {
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
            assert.strictEqual(Helper.determineAssetType(...test[0]), test[1])
    })
    this.test('resolveBuildConfigurationFilePaths', (assert:Object):void => {
        assert.deepEqual(Helper.resolveBuildConfigurationFilePaths({}), [])
        assert.deepEqual(Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', ['.git', 'node_modules']
        ), [
            {
                extension: 'js',
                filePathPattern: '',
                filePaths: [],
                outputExtension: 'js'
            }, {
                extension: 'example',
                filePathPattern: '',
                filePaths: [],
                outputExtension: 'example'
            }, {
                extension: 'other',
                filePathPattern: '',
                filePaths: [],
                outputExtension: 'other'
            }
        ])
    })
    this.test('determineModuleLocations', (assert:Object):void => {
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
    this.test('resolveModulesInFolders', (assert:Object):void => {
        for (const test:Array<any> of [
            [{}, {}],
            [{index: []}, {index: []}]
        ])
            assert.deepEqual(Helper.resolveModulesInFolders(test[0]), test[1])
        assert.ok(Helper.resolveModulesInFolders({a: [__dirname]}).a.includes(
            './test/helper.js'))
    })
    this.test('normalizeInternalInjection', (assert:Object):void => {
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
            assert.deepEqual(
                Helper.normalizeInternalInjection(test[0]), test[1])
    })
    this.test('resolveInjection', (assert:Object):void => {
        for (const test:Array<any> of [
            [
                [
                    {
                        internal: [], external: [], commonChunkIDs: [],
                        dllChunkIDs: []
                    },
                    Helper.resolveBuildConfigurationFilePaths(
                        buildConfiguration, './', ['.git', 'node_modules']
                    ), [], {}, {}, [], './', '', ['.git', 'node_modules']
                ],
                {
                    commonChunkIDs: [],
                    dllChunkIDs: [],
                    external: [],
                    internal: []
                }
            ],
            [
                [
                    {
                        commonChunkIDs: [],
                        dllChunkIDs: [],
                        external: [],
                        internal: 'a.js'
                    },
                    Helper.resolveBuildConfigurationFilePaths(
                        buildConfiguration, './', ['.git', 'node_modules']
                    ), [], {}, {}, [], './', '', ['.git', 'node_modules']
                ],
                {
                    internal: 'a.js', external: [], commonChunkIDs: [],
                    dllChunkIDs: []
                }
            ],
            [
                [
                    {
                        commonChunkIDs: [],
                        dllChunkIDs: [],
                        external: [],
                        internal: ['a']
                    },
                    Helper.resolveBuildConfigurationFilePaths(
                        buildConfiguration, './', ['.git', 'node_modules']
                    ), [], {}, {}, [], './', '', ['.git', 'node_modules']
                ],
                {
                    commonChunkIDs: [],
                    dllChunkIDs: [],
                    external: [],
                    internal: ['a']
                }
            ],
            [
                [
                    {
                        commonChunkIDs: [],
                        dllChunkIDs: [],
                        external: [],
                        internal: '__auto__'
                    },
                    Helper.resolveBuildConfigurationFilePaths(
                        buildConfiguration, './', ['.git', 'node_modules']
                    ), [], {}, {}, [], './', '', ['.git', 'node_modules']
                ],
                {
                    commonChunkIDs: [],
                    dllChunkIDs: [],
                    external: [],
                    internal: {}
                }
            ],
            [
                [
                    {
                        commonChunkIDs: [],
                        dllChunkIDs: [],
                        external: [],
                        internal: {index: '__auto__'}
                    },
                    Helper.resolveBuildConfigurationFilePaths(
                        buildConfiguration, './', ['.git', 'node_modules']
                    ), [], {}, {}, [], './', '', ['.git', 'node_modules']
                ],
                {
                    internal: {index: []}, external: [], commonChunkIDs: [],
                    dllChunkIDs: []
                }
            ]
        ])
            assert.deepEqual(Helper.resolveInjection(...test[0]), test[1])
    })
    this.test('getAutoChunk', (assert:Object):void => assert.deepEqual(
        Helper.getAutoChunk(Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', ['.git', 'node_modules']), [
                '.git', 'node_modules'
            ], './'
        ), {}))
    this.test('determineModuleFilePath', (assert:Object):void => {
        for (const test:Array<any> of [
            [[''], null],
            [['a', {}, {}, {file: [], module: []}, './', '', []], null],
            [['a', {a: 'b'}, {}, {file: [], module: []}, './', '', []], null],
            [['bba', {a: 'b'}, {}, {file: [], module: []}, './', '', []], null],
            [['helper'], 'helper.js'],
            [['helper', {}, {}, {file: [], module: []}, './', '', []], null],
            [[
                './helper', {}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []}, '',
                'a', []], null
            ],
            [[
                'helper', {}, {},
                {file: {external: ['.js'], internal: ['.js']}, module: []},
                './', './'
            ], 'helper.js']
        ]) {
            let result:?string = Helper.determineModuleFilePath(...test[0])
            if (result)
                result = path.basename(result)
            assert.strictEqual(result, test[1])
        }
    })
    // endregion
    this.test('applyAliases', (assert:Object):void => {
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
    this.test('applyModuleReplacements', (assert:Object):void => {
        for (const test:Array<any> of [
            ['', {}, ''],
            ['', {a: 'b'}, ''],
            ['a', {}, 'a'],
            ['a', {a: 'b'}, 'b'],
            ['a', {a$: 'b'}, 'b'],
            ['a', {'^a$': 'b'}, 'b'],
            ['aa', {a: 'b'}, 'ba'],
            ['helper', {}, 'helper']
        ])
            assert.strictEqual(
                Helper.applyModuleReplacements(test[0], test[1]), test[2])
    })
    // endregion
}, ['plain'])
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
