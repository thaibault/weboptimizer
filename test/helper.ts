#!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import {Mapping} from 'clientnode/type'
import path from 'path'

import {
    AssetInPlaceInjectionResult,
    AssetPositionPatterns,
    BuildConfiguration,
    GivenInjection,
    GivenInjectionConfiguration,
    NormalizedGivenInjection,
    PathConfiguration,
    Replacements,
    ResolvedBuildConfiguration,
    WebpackAssets
} from '../type'
import Helper from '../helper'
// endregion
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
describe('helper', ():void => {
    // region tests
    // / region boolean
    test.each([
        ['./', ['./'], true],
        ['./', ['../'], true],
        ['../', ['./'], false]
    ])(
        `isFilePathInLocation('%s', %p) === %p`,
        (
            filePath:string, locationsToCheck:Array<string>, expected:boolean
        ):void =>
            expect(Helper.isFilePathInLocation(filePath, locationsToCheck))
                .toStrictEqual(expected)
    )
    // / endregion
    // / region string
    test.each([
        [
            {
                content: '<html><head></head><body></body></html>',
                filePathsToRemove: []
            },
            '',
            null,
            null,
            '',
            '',
            '',
            {}
        ],
        [
            {
                content:
                    '<!doctype html><html><head></head><body></body></html>',
                filePathsToRemove: []
            },
            '<!doctype html><html><head></head><body></body></html>',
            null,
            null,
            '',
            '',
            '',
            {}
        ]
    ])(
        `
            %p === inPlaceCSSAndJavaScriptAssetReferences(
                '%s', '%s', '%s', '%s', '%s', '%s', %p
            )
        `,
        (
            expected:AssetInPlaceInjectionResult,
            ...parameter:[
                string,
                null|AssetPositionPatterns,
                null|AssetPositionPatterns,
                string,
                string,
                string,
                WebpackAssets
            ]
        ):void =>
            expect(Helper.inPlaceCSSAndJavaScriptAssetReferences(...parameter))
                .toStrictEqual(expected)
    )
    test.each([
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
    ])(
        `stripLoader('%s') === '%s'`,
        (moduleID:string, expected:string):void =>
            expect(Helper.stripLoader(moduleID)).toStrictEqual(expected)
    )
    // / endregion
    // / region array
    test.each([
        [[], []],
        [['a'], ['a']],
        [['a/'], ['a']],
        [['a/', 'a'], ['a']],
        [['a/', 'a/'], ['a']],
        [['a/', 'a/', 'b/'], ['a', 'b']],
        [['a/', 'a/', 'b'], ['a', 'b']],
        [['a/', 'a/', 'b', '', '.'], ['a', 'b', '.']]
    ])(
        'normalizePaths(%p) === %p',
        (paths:Array<string>, expected:Array<string>):void =>
            expect(Helper.normalizePaths(paths)).toStrictEqual(expected)
    )
    // / endregion
    // / region file handler
    test.each([
        ['', {}, ''],
        ['a', {}, 'a'],
        ['path', {}, 'path'],
        ['a[name]b', {}, 'a.__dummy__b'],
        ['a[name]b[name]', {}, 'a.__dummy__b.__dummy__'],
        ['a[id]b[chunkhash]', {}, 'a.__dummy__b.__dummy__'],
        ['a[id]b[chunkhash]', {'[id]': 1, '[chunkhash]': 2}, 'a1b2'],
        [
            'a[id]b[chunkhash]',
            {'[id]': '[id]', '[chunkhash]': '[chunkhash]'}, 'a[id]b[chunkhash]'
        ]
    ])(
        `renderFilePathTemplate('%s', %p) === %p`,
        (
            template:string,
            scope:{[key:string]:number|string},
            expected:string
        ):void =>
            expect(Helper.renderFilePathTemplate(template, scope))
                .toStrictEqual(expected)
    )
    test.each([
        ['', ''],
        ['a', 'a'],
        ['a', 'a', './'],
        ['./a', './a', './'],
        ['./a', './a', './', './'],
        ['a/a', './a', './a', './'],
        ['./a', './a', './a', './a'],
        ['./a', './a', './a', './a', {a: 'b'}],
        ['b/a', './a', './a/a', './', {a: 'b'}, {}, ['a']]
    ])(
        `%p === applyContext('%s', ...%p)`,
        (expected:string, request:string, ...parameter:Array<any>):void =>
            expect(Helper.applyContext(request, ...parameter))
                .toStrictEqual(expected)
    )
    test.each([
        ['', ''],
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
            {file: {external: [], internal: []}, module: []}
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.js'], internal: ['.js']}, module: []},
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
            {file: {external: ['.eot'], internal: ['.js']}, module: []},
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
    ])(
        `%p === determineExternalRequest('%s', ...%p)`,
        (
            expected:null|string, request:string, ...parameter:Array<any>
        ):void =>
            expect(Helper.determineExternalRequest(request, ...parameter))
                .toStrictEqual(expected)
    )
    test.each([['./', null], ['a.js', 'javaScript'], ['a.css', null]])(
        `determineAssetType('%s') === %p`,
        (filePath:string, expected:null|string):void => {
            const paths:PathConfiguration = {
                apiDocumentation: '',
                base: '',
                configuration: {
                    javaScript: '',
                    json: '',
                    typeScript: ''
                },
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
                tidyUpOnClear: []
            }
            expect(
                Helper.determineAssetType(filePath, buildConfiguration, paths)
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
                outputExtension: 'js'
            },
            {
                extension: 'example',
                filePathPattern: '',
                filePaths: [],
                outputExtension: 'example'
            },
            {
                extension: 'other',
                filePathPattern: '',
                filePaths: [],
                outputExtension: 'other'
            }
        ])
    })
    test.each([
        [{}, {filePaths: [], directoryPaths: []}],
        ['example', {filePaths: [], directoryPaths: []}],
        [
            'helper',
            {
                directoryPaths: [path.resolve(__dirname, '../')],
                filePaths: [path.resolve(__dirname, '../helper.js')]
            }
        ],
        [{example: 'example'}, {filePaths: [], directoryPaths: []}],
        [
            {example: 'helper'},
            {
                directoryPaths: [path.resolve(__dirname, '../')],
                filePaths: [path.resolve(__dirname, '../helper.js')]
            }
        ],
        [
            {helper: ['helper.ts']},
            {
                directoryPaths: [path.resolve(__dirname, '../')],
                filePaths: [path.resolve(__dirname, '../', 'helper.ts')]
            }
        ]
    ])(
        'determineModuleLocations(%p) === %p',
        (
            givenInjection:GivenInjection,
            expected:{
                directoryPaths:Array<string>
                filePaths:Array<string>
            }
        ):void =>
            expect(Helper.determineModuleLocations(givenInjection))
                .toStrictEqual(expected)
    )
    test.each([[{}, {}], [{index: []}, {index: []}]])(
        'resolveModulesInFolders(%p) === %p',
        (
            normalizedGivenInjection:NormalizedGivenInjection,
            expected:NormalizedGivenInjection
        ):void =>
            expect(Helper.resolveModulesInFolders(normalizedGivenInjection))
                .toStrictEqual(expected)
    )
    test('resolveModulesInFolders', ():void =>
        expect(Helper.resolveModulesInFolders({a: [__dirname]}).a)
            .toContain('./test/helper.ts')
    )
    test.each([
        [[], {index: []}],
        [{}, {index: []}],
        ['example', {index: ['example']}],
        [['example'], {index: ['example']}],
        [{a: 'example'}, {a: ['example']}],
        [{a: ['example']}, {a: ['example']}],
        [{a: ['example'], b: []}, {a: ['example']}],
        [{a: [], b: []}, {index: []}]
    ])(
        'normalizeGivenInjection(%p) === %p',
        (
            givenInjection:GivenInjection, expected:NormalizedGivenInjection
        ):void =>
            expect(Helper.normalizeGivenInjection(givenInjection))
                .toStrictEqual(expected)
    )
    test.each([
        [
            {
                autoExclude: [],
                entry: [],
                external: {}
            },
            {
                autoExclude: [],
                entry: [],
                external: {}
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules']
        ],
        [
            {
                autoExclude: [],
                entry: 'a.js',
                external: []
            },
            {
                autoExclude: [],
                entry: 'a.js',
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules']
        ],
        [
            {
                autoExclude: [],
                entry: ['a'],
                external: []
            },
            {
                autoExclude: [],
                entry: ['a'],
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules']
        ],
        [
            {
                autoExclude: [],
                entry: {},
                external: []
            },
            {
                autoExclude: [],
                entry: '__auto__',
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules']
        ],
        [
            {
                autoExclude: [],
                entry: {index: []},
                external: []
            },
            {
                autoExclude: [],
                entry: {index: '__auto__'},
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules']
        ]
    ])(
        `%p === resolveAutoInjection(%p, %p, %p, ...%p)`,
        (
            expected:GivenInjectionConfiguration,
            givenInjection:GivenInjectionConfiguration,
            buildConfigurations:ResolvedBuildConfiguration,
            ...parameter:Array<any>
        ):void =>
            expect(
                Helper.resolveAutoInjection(
                    givenInjection,
                    buildConfigurations,
                    ...parameter
                )
            ).toStrictEqual(expected)
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
    test.each([
        [null, ''],
        [null, 'a', {}, {}, {file: [], module: []}, './', '', []],
        [null, 'a', {a: 'b'}, {}, {file: [], module: []}, './', '', []],
        [
            null,
            'bba',
            {a: 'b'},
            {},
            {file: [], module: []},
            './',
            '',
            []
        ],
        ['helper.js', 'helper'],
        [null, 'helper', {}, {}, {file: [], module: []}, './', '', []],
        [
            null,
            './helper',
            {},
            {},
            {file: ['.ts'], module: []},
            '',
            'a',
            []
        ],
        [
            'helper.ts',
            'helper',
            {},
            {},
            {file: ['.ts'], module: []},
            './',
            './'
        ]
    ])(
        `%p === determineModuleFilePath('%s', ...parameter)`,
        (
            expected:null|string,
            moduleName:string,
            ...parameter:Array<any>
        ):void => {
            let result:null|string = Helper.determineModuleFilePath(
                moduleName, ...parameter)
            if (result)
                result = path.basename(result)
            expect(result).toStrictEqual(expected)
        }
    )
    // / endregion
    test.each([
        ['', {}, ''],
        ['', {a: 'b'}, ''],
        ['a', {}, 'a'],
        ['a', {a: 'b'}, 'b'],
        ['a', {a$: 'b'}, 'b'],
        ['aa', {a$: 'b'}, 'aa'],
        ['bba', {a: 'b'}, 'bbb'],
        ['helper', {}, 'helper']
    ])(
        `applyAliases('%s', %p) === '%s'`,
        (moduleID:string, aliases:Mapping, expected:string):void =>
            expect(Helper.applyAliases(moduleID, aliases))
                .toStrictEqual(expected)
    )
    test.each([
        ['', {}, ''],
        ['', {a: 'b'}, ''],
        ['a', {}, 'a'],
        ['a', {a: 'b'}, 'b'],
        ['a', {a$: 'b'}, 'b'],
        ['a', {'^a$': 'b'}, 'b'],
        ['aa', {a: 'b'}, 'ba'],
        ['helper', {}, 'helper']
    ])(
        `applyModuleReplacements('%s', %p) === '%s'`,
        (moduleID:string, replacements:Replacements, expected:string):void =>
            expect(Helper.applyModuleReplacements(moduleID, replacements))
                .toStrictEqual(expected)
    )
    test.each([
        ['./', 'package.json'],
        ['./', 'index.ts'],
        ['../', 'package.json'],
        ['../', 'index.ts']
    ])(
        `findPackageDescriptorFilePath('%s', '%s') === "` +
        `${path.resolve(__dirname, '../')}..."`,
        (start:string, fileName:string):void =>
            expect(Helper.findPackageDescriptorFilePath(start, fileName))
                .toStrictEqual(path.resolve(__dirname, '../', fileName))
    )
    test.each([['./'], ['../']])(
        `getClosestPackageDescriptor('%s') === {configuration: ...}`,
        (modulePath:string):void => {
            const filePath:string = path.resolve(
                __dirname, '../', 'package.json')
            expect(Helper.getClosestPackageDescriptor(modulePath, filePath))
                .toStrictEqual(
                    {configuration: eval('require')(filePath), filePath}
                )
        }
    )
    // endregion
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
