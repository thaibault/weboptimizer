// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {describe, expect, test} from '@jest/globals'
import {currentRequire} from 'clientnode'
import {testEach, testEachAgainstSameExpectation} from 'clientnode/testHelper'
import {FirstParameter} from 'clientnode/type'
import {resolve} from 'path'

import {
    BuildConfiguration, PackageConfiguration, PathConfiguration, Replacements
} from '../type'
import Helper from '../helper'
// endregion
// region mockup
const buildConfiguration:BuildConfiguration = {
    example: {
        extension: 'example',
        filePathPattern: '',
        ignoredExtension: '',
        outputExtension: 'example'
    },
    javaScript: {
        extension: 'js',
        filePathPattern: '',
        ignoredExtension: '',
        outputExtension: 'js'
    },
    other: {
        extension: 'other',
        filePathPattern: '',
        ignoredExtension: '',
        outputExtension: 'other'
    }
}
// endregion
describe('helper', ():void => {
    // region tests
    /// region boolean
    testEach<typeof Helper.isFilePathInLocation>(
        'isFilePathInLocation',
        Helper.isFilePathInLocation,

        [true, './', ['./']],
        [true, './', ['../']],
        [false, '../', ['./']]
    )
    /// endregion
    /// region string
    testEach<typeof Helper.stripLoader>(
        'stripLoader',
        Helper.stripLoader,

        ['', ''],
        ['a', 'a'],
        ['b', 'a!b'],
        ['c', 'aa!b!c'],
        ['c', 'aa!b!c'],
        ['c', 'c?a'],
        ['c', 'aa!b!c?a'],
        ['c', 'aa!b!c?abb?'],
        ['c', 'aa!b!c?abb?a'],
        ['moduleName', 'imports?$=library!moduleName']
    )
    /// endregion
    /// region array
    testEach<typeof Helper.normalizePaths>(
        'normalizePaths',
        Helper.normalizePaths,

        [[], []],
        [['a'], ['a']],
        [['a'], ['a/']],
        [['a'], ['a/', 'a']],
        [['a'], ['a/', 'a/']],
        [['a', 'b'], ['a/', 'a/', 'b/']],
        [['a', 'b'], ['a/', 'a/', 'b']],
        [['a', 'b', '.'], ['a/', 'a/', 'b', '', '.']]
    )
    /// endregion
    /// region file handler
    testEach<typeof Helper.renderFilePathTemplate>(
        'renderFilePathTemplate',
        Helper.renderFilePathTemplate,

        ['', '', {}],
        ['a', 'a', {}],
        ['path', 'path', {}],
        ['a.__dummy__b', 'a[name]b', {}],
        ['a.__dummy__b.__dummy__', 'a[name]b[name]', {}],
        ['a.__dummy__b.__dummy__', 'a[id]b[chunkhash]', {}],
        ['a1b2', 'a[id]b[chunkhash]', {'[id]': 1, '[chunkhash]': 2}],
        [
            'a[id]b[chunkhash]',
            'a[id]b[chunkhash]',
            {'[id]': '[id]', '[chunkhash]': '[chunkhash]'}
        ]
    )
    testEach<typeof Helper.applyContext>(
        'applyContext',
        Helper.applyContext,

        ['', ''],
        ['a', 'a'],
        ['a', 'a', './'],
        ['./a', './a', './'],
        ['./a', './a', './', './'],
        ['a/a', './a', './a', './'],
        ['./a', './a', './a', './a'],
        ['./a', './a', './a', './a', {a: 'b'}],
        ['b/a', './a', './a/a', './', {a: 'b'}, {}, ['a']]
    )
    testEach<typeof Helper.determineExternalRequest>(
        'determineExternalRequest',
        Helper.determineExternalRequest,

        [null, ''],
        ['a', 'a'],
        ['path', 'path'],
        [null, './helper'],
        [null, './helper', './'],
        [null, './helper', '../'],
        ['./helper', './helper', './a'],
        [null, './helper', './', './'],
        ['a/a', './a', './', './node_modules/a'],
        ['a', './', './', 'a'],
        ['path', 'path', './', './', {}, []],
        ['./main.js', 'path', './', './', {}, [], {path: './main.js'}],
        ['main.js', 'path', './', './', {}, [], {path: 'main.js'}],
        [null, 'path', './', './', {}, [], {path: './helper.ts'}],
        ['webpack', 'webpack'],
        ['webpack', 'a', './', './', {}, ['node_modules'], {a$: 'webpack'}],
        [
            null,
            'a',
            './',
            './',
            {a: ['webpack']},
            ['node_modules'],
            {a$: 'webpack'}
        ],
        [
            'webpack',
            'a',
            '../',
            './',
            {a: ['not_webpack']},
            ['node_modules'],
            {a$: 'webpack'},
            {},
            {file: {external: [], internal: []}}
        ],
        [
            'webpack',
            'a',
            '../',
            './',
            {a: ['webpack']},
            ['node_modules'],
            {a$: 'webpack'},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['./']
        ],
        [
            null,
            'a',
            './',
            './',
            {a: ['webpack']},
            ['node_modules'],
            {a$: 'webpack'},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['.git']
        ],
        [
            'webpack',
            'a',
            './',
            './',
            {a: ['webpack']},
            ['node_modules'],
            {a$: 'webpack'},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['.git'],
            [],
            [],
            [],
            [],
            ['webpack']
        ],
        [
            'webpack',
            'webpack',
            './',
            '../',
            {},
            ['node_modules'],
            {},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['.git'],
            ['node_modules'],
            ['main'],
            ['main'],
            [],
            [],
            []
        ],
        [
            'webpack',
            'webpack',
            './',
            '../',
            {},
            ['node_modules'],
            {},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['.git'],
            ['node_modules'],
            ['main'],
            ['main'],
            [],
            [],
            [],
            false
        ],
        [
            null,
            'webpack',
            './',
            '../',
            {},
            ['node_modules'],
            {},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['.git'],
            ['node_modules'],
            ['main'],
            ['main'],
            [],
            [],
            [],
            true
        ],
        [
            null,
            'a!webpack',
            './',
            '../',
            {},
            ['node_modules'],
            {},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['.git'],
            ['node_modules'],
            ['main'],
            ['main'],
            [],
            [],
            [],
            false
        ],
        [
            null,
            'a!webpack',
            './',
            '../',
            {},
            ['node_modules'],
            {},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['.git'],
            ['node_modules'],
            ['main'],
            ['main'],
            [],
            [],
            [],
            false,
            true
        ],
        [
            'webpack',
            'a!webpack',
            './',
            '../',
            {},
            ['node_modules'],
            {},
            {},
            {file: {external: ['.js'], internal: ['.js']}},
            './',
            ['.git'],
            ['node_modules'],
            ['main'],
            ['main'],
            [],
            [],
            [],
            false,
            false
        ],
        [
            null,
            'a!webpack',
            './',
            '../',
            {},
            ['node_modules'],
            {},
            {},
            {file: {external: ['.eot'], internal: ['.js']}},
            './',
            ['.git'],
            ['node_modules'],
            ['main'],
            ['main'],
            [],
            [],
            [],
            false,
            false
        ]
    )
    test.each([[null, './'], ['javaScript', 'a.js'], [null, 'a.css']])(
        `%p === determineAssetType('%s')`,
        (
            expected:ReturnType<typeof Helper.determineAssetType>,
            parameter:FirstParameter<typeof Helper.determineAssetType>
        ):void => {
            const paths:PathConfiguration = {
                apiDocumentation: '',
                base: '',
                configuration: {javaScript: '', json: '', typeScript: ''},
                context: '',
                ignore: [],
                source: {
                    asset: {
                        base: '',
                        cascadingStyleSheet: '',
                        data: '',
                        font: '',
                        image: '',
                        javaScript: '',
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
                        template: ''
                    },
                    base: '',
                    manifest: '',
                    public: ''
                },
                tidyUp: [],
                tidyUpGlobs: {
                    options: {},
                    pattern: []
                },
                tidyUpOnClear: [],
                tidyUpOnClearGlobs: {
                    options: {},
                    pattern: []
                }
            }

            expect(
                Helper.determineAssetType(parameter, buildConfiguration, paths)
            ).toStrictEqual(expected)
        }
    )
    test('resolveBuildConfigurationFilePaths', ():void => {
        expect(Helper.resolveBuildConfigurationFilePaths({})).toStrictEqual([])
        expect(Helper.resolveBuildConfigurationFilePaths(
            buildConfiguration, './', ['.git', 'node_modules']
        )).toStrictEqual([
            {
                extension: 'js',
                filePathPattern: '',
                filePaths: [],
                ignoredExtension: '',
                outputExtension: 'js'
            },
            {
                extension: 'example',
                filePathPattern: '',
                filePaths: [],
                ignoredExtension: '',
                outputExtension: 'example'
            },
            {
                extension: 'other',
                filePathPattern: '',
                filePaths: [],
                ignoredExtension: '',
                outputExtension: 'other'
            }
        ])
    })
    testEach<typeof Helper.determineModuleLocations>(
        'determineModuleLocations',
        Helper.determineModuleLocations,

        [{filePaths: [], directoryPaths: []}, {}],
        [{filePaths: [], directoryPaths: []}, 'example'],
        [
            {
                directoryPaths: [resolve(__dirname, '../')],
                filePaths: [resolve(__dirname, '../helper.js')]
            },
            'helper'
        ],
        [{filePaths: [], directoryPaths: []}, {example: 'example'}],
        [
            {
                directoryPaths: [resolve(__dirname, '../')],
                filePaths: [resolve(__dirname, '../helper.js')]
            },
            {example: 'helper'}
        ],
        [
            {
                directoryPaths: [resolve(__dirname, '../')],
                filePaths: [resolve(__dirname, '../', 'helper.ts')]
            },
            {helper: ['helper.ts']}
        ]
    )
    testEach<typeof Helper.resolveModulesInFolders>(
        'resolveModulesInFolders',
        Helper.resolveModulesInFolders,

        [{}, {}], [{index: []}, {index: []}]
    )
    test('resolveModulesInFolders', ():void =>
        expect(Helper.resolveModulesInFolders({a: [__dirname]}).a)
            .toContain('./test/helper.ts')
    )
    testEach<typeof Helper.normalizeGivenInjection>(
        'normalizeGivenInjection',
        Helper.normalizeGivenInjection,

        [{index: []}, []],
        [{index: []}, {}],
        [{index: ['example']}, 'example'],
        [{index: ['example']}, ['example']],
        [{a: ['example']}, {a: 'example'}],
        [{a: ['example']}, {a: ['example']}],
        [{a: ['example']}, {a: ['example'], b: []}],
        [{index: []}, {a: [], b: []}]
    )
    testEach<typeof Helper.resolveAutoInjection>(
        'resolveAutoInjection',
        Helper.resolveAutoInjection,

        [
            {autoExclude: [], entry: [], external: {}},
            {autoExclude: [], entry: [], external: {}},
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}},
            './',
            '',
            ['.git', 'node_modules']
        ],
        [
            {autoExclude: [], entry: 'a.js', external: []},
            {autoExclude: [], entry: 'a.js', external: []},
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}},
            './',
            '',
            ['.git', 'node_modules']
        ],
        [
            {autoExclude: [], entry: ['a'], external: []},
            {autoExclude: [], entry: ['a'], external: []},
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}},
            './',
            '',
            ['.git', 'node_modules']
        ],
        [
            {autoExclude: [], entry: {}, external: []},
            {autoExclude: [], entry: '__auto__', external: []},
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}},
            './',
            '',
            ['.git', 'node_modules']
        ],
        [
            {autoExclude: [], entry: {index: []}, external: []},
            {autoExclude: [], entry: {index: '__auto__'}, external: []},
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}},
            './',
            '',
            ['.git', 'node_modules']
        ]
    )
    test('getAutoInjection', ():void =>
        expect(Helper.getAutoInjection(
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            ['.git', 'node_modules'],
            './'
        )).toStrictEqual({})
    )
    testEach<typeof Helper.determineModuleFilePath>(
        'determineModuleFilePath',
        Helper.determineModuleFilePath,

        [null, ''],
        [null, 'a', {}, {}, {file: []}, './', '', []],
        [null, 'a', {a: 'b'}, {}, {file: []}, './', '', []],
        [null, 'bba', {a: 'b'}, {}, {file: []}, './', '', []],
        [resolve('helper.js'), 'helper'],
        [null, 'helper', {}, {}, {file: []}, './', '', []],
        [null, './helper', {}, {}, {file: ['.ts']}, '', 'a', []],
        [resolve('helper.ts'), 'helper', {}, {}, {file: ['.ts']}, './', './']
    )
    /// endregion
    testEach<typeof Helper.applyAliases>(
        'applyAliases',
        Helper.applyAliases,

        ['', '', {}],
        ['', '', {a: 'b'}],
        ['a', 'a', {}],
        ['b', 'a', {a: 'b'}],
        ['b', 'a', {a$: 'b'}],
        ['aa', 'aa', {a$: 'b'}],
        ['bbb', 'bba', {a: 'b'}],
        ['helper', 'helper', {}]
    )
    testEach<typeof Helper.applyModuleReplacements>(
        'applyModuleReplacements',
        Helper.applyModuleReplacements,

        ['', '', {}],
        ['', '', {a: 'b'} as unknown as Replacements],
        ['a', 'a', {}],
        ['b', 'a', {a: 'b'} as unknown as Replacements],
        ['b', 'a', {a$: 'b'} as unknown as Replacements],
        ['b', 'a', {'^a$': 'b'} as unknown as Replacements],
        ['ba', 'aa', {a: 'b'} as unknown as Replacements],
        ['helper', 'helper', {}]
    )
    testEachAgainstSameExpectation<
        typeof Helper.findPackageDescriptorFilePath
    >(
        'findPackageDescriptorFilePath',
        Helper.findPackageDescriptorFilePath,
        resolve(__dirname, '../package.json'),

        ['./', 'package.json'],
        ['../', 'package.json']
    )
    test.each([['./'], ['../']])(
        `getClosestPackageDescriptor('%s') === {configuration: ...}`,
        (modulePath:string):void => {
            const filePath:string = resolve(__dirname, '../package.json')
            expect(Helper.getClosestPackageDescriptor(modulePath, filePath))
                .toStrictEqual(
                    {
                        configuration: currentRequire!(filePath) as
                            PackageConfiguration,
                        filePath
                    }
                )
        }
    )
    // endregion
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
