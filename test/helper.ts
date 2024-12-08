// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {describe, expect, test} from '@jest/globals'
import {
    currentRequire, FirstParameter, testEach, testEachAgainstSameExpectation
} from 'clientnode'
import {resolve} from 'path'

import {
    BuildConfiguration, PackageConfiguration, PathConfiguration, Replacements
} from '../type'
import {
    applyAliases,
    applyContext,
    applyModuleReplacements,
    determineAssetType,
    determineExternalRequest,
    determineModuleFilePath,
    determineModuleLocations,
    findPackageDescriptorFilePath,
    getAutoInjection,
    getClosestPackageDescriptor,
    isFilePathInLocation,
    stripLoader,
    normalizeGivenInjection,
    normalizePaths,
    renderFilePathTemplate,
    resolveAutoInjection,
    resolveBuildConfigurationFilePaths,
    resolveModulesInFolders
} from '../helper'
// endregion
// region mockup
const buildConfiguration: BuildConfiguration = {
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
describe('helper', (): void => {
    // region tests
    /// region boolean
    testEach<typeof isFilePathInLocation>(
        'isFilePathInLocation',
        isFilePathInLocation,

        [true, './', ['./']],
        [true, './', ['../']],
        [false, '../', ['./']]
    )
    /// endregion
    /// region string
    testEach<typeof stripLoader>(
        'stripLoader',
        stripLoader,

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
    testEach<typeof normalizePaths>(
        'normalizePaths',
        normalizePaths,

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
    testEach<typeof renderFilePathTemplate>(
        'renderFilePathTemplate',
        renderFilePathTemplate,

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
    testEach<typeof applyContext>(
        'applyContext',
        applyContext,

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
    testEach<typeof determineExternalRequest>(
        'determineExternalRequest',
        determineExternalRequest,

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
            expected: ReturnType<typeof determineAssetType>,
            parameter: FirstParameter<typeof determineAssetType>
        ): void => {
            const paths: PathConfiguration = {
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
                tidyUpGlobs: [],
                tidyUpOnClear: [],
                tidyUpOnClearGlobs: []
            }

            expect(
                determineAssetType(parameter, buildConfiguration, paths)
            ).toStrictEqual(expected)
        }
    )
    test('resolveBuildConfigurationFilePaths', (): void => {
        expect(resolveBuildConfigurationFilePaths({})).toStrictEqual([])
        expect(resolveBuildConfigurationFilePaths(
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
    testEach<typeof determineModuleLocations>(
        'determineModuleLocations',
        determineModuleLocations,

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
    testEach<typeof resolveModulesInFolders>(
        'resolveModulesInFolders',
        resolveModulesInFolders,

        [{}, {}], [{index: []}, {index: []}]
    )
    test('resolveModulesInFolders', () => {
        expect(resolveModulesInFolders({a: [__dirname]}).a)
            .toContain('./test/helper.ts')
    })
    testEach<typeof normalizeGivenInjection>(
        'normalizeGivenInjection',
        normalizeGivenInjection,

        [{index: []}, []],
        [{index: []}, {}],
        [{index: ['example']}, 'example'],
        [{index: ['example']}, ['example']],
        [{a: ['example']}, {a: 'example'}],
        [{a: ['example']}, {a: ['example']}],
        [{a: ['example']}, {a: ['example'], b: []}],
        [{index: []}, {a: [], b: []}]
    )
    testEach<typeof resolveAutoInjection>(
        'resolveAutoInjection',
        resolveAutoInjection,

        [
            {autoExclude: {paths: [], pattern: []}, entry: [], external: {}},
            {autoExclude: {paths: [], pattern: []}, entry: [], external: {}},
            resolveBuildConfigurationFilePaths(
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
            {
                autoExclude: {paths: [], pattern: []},
                entry: 'a.js',
                external: []
            },
            {
                autoExclude: {paths: [], pattern: []},
                entry: 'a.js',
                external: []
            },
            resolveBuildConfigurationFilePaths(
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
            {autoExclude: {paths: [], pattern: []}, entry: ['a'], external: []},
            {autoExclude: {paths: [], pattern: []}, entry: ['a'], external: []},
            resolveBuildConfigurationFilePaths(
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
            {autoExclude: {paths: [], pattern: []}, entry: {}, external: []},
            {
                autoExclude: {paths: [], pattern: []},
                entry: '__auto__',
                external: []
            },
            resolveBuildConfigurationFilePaths(
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
            {
                autoExclude: {paths: [], pattern: []},
                entry: {index: []},
                external: []
            },
            {
                autoExclude: {paths: [], pattern: []},
                entry: {index: '__auto__'},
                external: []
            },
            resolveBuildConfigurationFilePaths(
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
    test('getAutoInjection', () => {
        expect(getAutoInjection(
            resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            [],
            [/.*\/\.git\/.*/, '/.*\\/node_modules/.*\\/'],
            './'
        )).toStrictEqual({})
    })
    testEach<typeof determineModuleFilePath>(
        'determineModuleFilePath',
        determineModuleFilePath,

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
    testEach<typeof applyAliases>(
        'applyAliases',
        applyAliases,

        ['', '', {}],
        ['', '', {a: 'b'}],
        ['a', 'a', {}],
        ['b', 'a', {a: 'b'}],
        ['b', 'a', {a$: 'b'}],
        ['aa', 'aa', {a$: 'b'}],
        ['bbb', 'bba', {a: 'b'}],
        ['helper', 'helper', {}]
    )
    testEach<typeof applyModuleReplacements>(
        'applyModuleReplacements',
        applyModuleReplacements,

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
        typeof findPackageDescriptorFilePath
    >(
        'findPackageDescriptorFilePath',
        findPackageDescriptorFilePath,
        resolve(__dirname, '../package.json'),

        ['./', 'package.json'],
        ['../', 'package.json']
    )
    test.each([['./'], ['../']])(
        `getClosestPackageDescriptor('%s') === {configuration: ...}`,
        (modulePath: string): void => {
            const filePath: string = resolve(__dirname, '../package.json')
            expect(getClosestPackageDescriptor(modulePath, filePath))
                .toStrictEqual(
                    {
                        configuration: (
                            currentRequire ? currentRequire(filePath) : {}
                        ) as PackageConfiguration,
                        filePath
                    }
                )
        }
    )
    // endregion
})
