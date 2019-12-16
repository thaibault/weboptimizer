#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import path from 'path'
import type {PlainObject} from 'clientnode'

import type {
    BuildConfiguration,
    EntryInjection,
    Extensions,
    Injection,
    NormalizedEntryInjection,
    Path,
    ResolvedBuildConfiguration
} from '../type'
import Helper from '../helper.compiled'
// endregion
// region declarations
declare var describe:Function
declare var expect:Function
declare var test:Function
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
        `.isFilePathInLocation('%s', '%s', %p)`,
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
            '',
            null,
            null,
            '',
            '',
            '',
            {},
            {
                content: '<html><head></head><body></body></html>',
                filePathsToRemove: []
            }
        ],
        [
            '<!doctype html><html><head></head><body></body></html>',
            null,
            null,
            '',
            '',
            '',
            {},
            {
                content:
                    '<!doctype html><html><head></head><body></body></html>',
                filePathsToRemove: []
            }
        ]
    ])(
        `
            .inPlaceCSSAndJavaScriptAssetReferences(
                '%s', '%s', '%s', '%s', '%s', '%s', %p)
        `,
        (...parameter:Array<any>):void => {
            const expected:any = parameter.pop()
            expect(Helper.inPlaceCSSAndJavaScriptAssetReferences(...parameter))
                .toStrictEqual(expected)
        }
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
        `.stripLoader('%s', '%s')`,
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
        `.normalizePaths(...parameter)`,
        (...parameter:Array<string>):void => {
            const expected:string = parameter.pop()
            expect(Helper.normalizePaths(...parameter)).toStrictEqual(expected)
        }
    )
    // / endregion
    // / region file handler
    test.each([
        ['', {}, ''],
        ['a', {}, 'a'],
        ['path', {}, 'path'],
        ['a[name]b', {}, 'a.__dummy__b'],
        ['a[name]b[name]', {}, 'a.__dummy__b.__dummy__'],
        ['a[id]b[hash]', {}, 'a.__dummy__b.__dummy__'],
        ['a[id]b[hash]', {'[id]': 1, '[hash]': 2}, 'a1b2'],
        ['a[id]b[hash]', {'[id]': '[id]', '[hash]': '[hash]'}, 'a[id]b[hash]']
    ])(
        `.renderFilePathTemplate('%s', %p)`,
        (template:string, scope:{[key:string]:string}, expected:string):void =>
            expect(Helper.renderFilePathTemplate(template, scope))
                .toStrictEqual(expected)
    )
    test.each([
        ['', ''],
        ['a', 'a'],
        ['a', './', 'a'],
        ['./a', './', './a'],
        ['./a', './', './', './a'],
        ['./a', './a', './', 'a/a'],
        ['./a', './a', './a', './a'],
        ['./a', './a', './a', {a: 'b'}, './a'],
        ['./a', './a/a', './', {a: 'b'}, {}, ['a'], 'b/a']
    ])(`.applyContext(...parameter)`, (...parameter:Array<any>):void => {
        const expected:string = parameter.pop()
        expect(Helper.applyContext(...parameter)).toStrictEqual(expected)
    })
    test.each([
        ['', ''],
        ['a', 'a'],
        ['path', 'path'],
        ['./helper', null],
        ['./helper', './', null],
        ['./helper', '../', null],
        ['./helper', './a', './helper'],
        ['./helper', './', './', null],
        ['./a', './', './node_modules/a', 'a/a'],
        ['a', './', './', 'a'],
        ['path', './', './', {}, [], 'path'],
        ['path', './', './', {}, [], {path: './main.js'}, './main.js'],
        ['path', './', './', {}, [], {path: 'main.js'}, 'main.js'],
        ['path', './', './', {}, [], {path: './helper.js'}, null],
        ['webpack', 'webpack'],
        ['a', './', './', {}, ['node_modules'], {a$: 'webpack'}, 'webpack'],
        [
            'a',
            './',
            './',
            {a: ['webpack']},
            ['node_modules'],
            {a$: 'webpack'},
            null
        ],
        [
            'a',
            '../',
            './',
            {a: ['not_webpack']},
            ['node_modules'],
            {a$: 'webpack'},
            {},
            {file: {external: [], internal: []}, module: []},
            'webpack'
        ],
        [
            'a',
            '../',
            './',
            {a: ['webpack']},
            ['node_modules'],
            {a$: 'webpack'},
            {},
            {file: {external: ['.js'], internal: ['.js']}, module: []},
            './',
            ['./'],
            'webpack'
        ],
        [
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
            null
        ],
        [
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
            ['webpack'],
            'webpack'
        ],
        [
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
            'webpack'
        ],
        [
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
            false,
            'webpack'
        ],
        [
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
            true,
            null
        ],
        [
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
            null
        ],
        [
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
            true,
            null
        ],
        [
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
            false,
            'webpack'
        ],
        [
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
            false,
            null
        ]
    ])(
        `.determineExternalRequest(...parameter)`,
        (...parameter:Array<any>):void => {
            const expected:null|string = parameter.pop()
            expect(Helper.determineExternalRequest(...parameter))
                .toStrictEqual(expected)
        }
    )
    test.each([['./', null], ['a.js', 'javaScript'], ['a.css', null]])(
        `.determineAssetType('%s', %p, %p)`,
        (filePath:string, expected:null|string):void => {
            const paths:Path = {
                apiDocumentation: '',
                base: '',
                configuration: {
                    javaScript: null
                },
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
                filePaths: [
                    path.resolve(__dirname, '../helper.js')],
                directoryPaths: [path.resolve(__dirname, '../')]
            }
        ],
        [{example: 'example'}, {filePaths: [], directoryPaths: []}],
        [
            {example: 'helper'},
            {
                filePaths: [path.resolve(__dirname, '../helper.js')],
                directoryPaths: [path.resolve(__dirname, '../')]
            }
        ],
        [
            {helper: ['helper.js']},
            {
                filePaths: [path.resolve(__dirname, '../', 'helper.js')],
                directoryPaths: [path.resolve(__dirname, '../')]
            }
        ]
    ])(
        '.determineModuleLocations(%p)',
        (
            entryInjection:EntryInjection,
            expected:{filePaths:Array<string>;directoryPaths:Array<string>}
        ):void =>
            expect(Helper.determineModuleLocations(entryInjection))
                .toStrictEqual(expected)
    )
    test.each([[{}, {}], [{index: []}, {index: []}]])(
        '.resolveModulesInFolders(%p)',
        (
            normalizedEntryInjection:NormalizedEntryInjection,
            expected:NormalizedEntryInjection
        ):void =>
            expect(Helper.resolveModulesInFolders(normalizedEntryInjection))
                .toStrictEqual(expected)
    )
    test('resolveModulesInFolders', ():void =>
        expect(Helper.resolveModulesInFolders({a: [__dirname]}).a)
            .toContain('./test/helper.js')
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
        '.normalizeEntryInjection(%p)',
        (
            entryInjection:EntryInjection, expected:NormalizedEntryInjection
        ):void =>
            expect(Helper.normalizeEntryInjection(entryInjection))
                .toStrictEqual(expected)
    )
    test.each([
        [
            {
                chunks: [],
                dllChunkNames: [],
                entry: [],
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            [],
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules'],
            {
                chunks: [],
                dllChunkNames: [],
                entry: [],
                external: []
            }
        ],
        [
            {
                chunks: [],
                dllChunkNames: [],
                entry: 'a.js',
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            [],
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules'],
            {
                chunks: [],
                dllChunkNames: [],
                entry: 'a.js',
                external: []
            }
        ],
        [
            {
                chunks: [],
                dllChunkNames: [],
                entry: ['a'],
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            [],
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules'],
            {
                chunks: [],
                dllChunkNames: [],
                entry: ['a'],
                external: []
            }
        ],
        [
            {
                chunks: [],
                dllChunkNames: [],
                entry: '__auto__',
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            [],
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules'],
            {
                chunks: [],
                dllChunkNames: [],
                entry: {},
                external: []
            }
        ],
        [
            {
                chunks: [],
                dllChunkNames: [],
                entry: {index: '__auto__'},
                external: []
            },
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            [],
            {},
            {},
            {file: {external: [], internal: []}, module: []},
            './',
            '',
            ['.git', 'node_modules'],
            {
                chunks: [],
                external: [],
                entry: {index: []},
                dllChunkNames: []
            }
        ]
    ])(
        '.resolveInjection(%p, %p, %p, %p, %p, %p, %s, %s, %p, %p)',
        (
            givenInjection:Injection,
            buildConfigurations:ResolvedBuildConfiguration,
            modulesToExclude:EntryInjection,
            aliases:PlainObject,
            moduleReplacements:PlainObject,
            extensions:Extensions,
            context:string,
            referencePath:string,
            pathsToIgnore:Array<string>,
            expected:Injection
        ):void => expect(Helper.resolveInjection(
            givenInjection,
            buildConfigurations,
            modulesToExclude,
            aliases,
            moduleReplacements,
            extensions,
            context,
            referencePath,
            pathsToIgnore
        )).toStrictEqual(expected)
    )
    test('getAutoChunk', ():void =>
        expect(Helper.getAutoChunk(
            Helper.resolveBuildConfigurationFilePaths(
                buildConfiguration, './', ['.git', 'node_modules']
            ),
            ['.git', 'node_modules'],
            './'
        )).toStrictEqual({})
    )
    test.each([
        ['', null],
        ['a', {}, {}, {file: [], module: []}, './', '', [], null],
        ['a', {a: 'b'}, {}, {file: [], module: []}, './', '', [], null],
        [
            'bba',
            {a: 'b'},
            {},
            {file: [], module: []},
            './',
            '',
            [],
            null
        ],
        ['helper', 'helper.js'],
        ['helper', {}, {}, {file: [], module: []}, './', '', [], null],
        [
            './helper',
            {},
            {},
            {file: ['.js'], module: []},
            '',
            'a',
            [],
            null
        ],
        [
            'helper',
            {},
            {},
            {file: ['.js'], module: []},
            './',
            './',
            'helper.js'
        ]
    ])(
        '.determineModuleFilePath(...parameter)',
        (...parameter:Array<any>):void => {
            const expected:null|string = parameter.pop()
            let result:null|string = Helper.determineModuleFilePath(
                ...parameter)
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
        `.applyAliases('%s', %p)`,
        (moduleID:string, aliases:PlainObject, expected:string):void =>
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
        `.applyModuleReplacements('%s', %p)`,
        (moduleID:string, replacements:PlainObject, expected:string):void =>
            expect(Helper.applyModuleReplacements(moduleID, replacements))
                .toStrictEqual(expected)
    )
    test.each([
        ['./', 'package.json'],
        ['./', 'index.js'],
        ['../', 'package.json'],
        ['../', 'index.js']
    ])(
        `.findPackageDescriptorFilePath('%s', '%s')`,
        (start:string, fileName:string):void =>
            expect(Helper.findPackageDescriptorFilePath(start, fileName))
                .toStrictEqual(path.resolve(__dirname, '../', fileName))
    )
    test.each([['./'], ['../']])(
        `.getClosestPackageDescriptor('%s')`,
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
