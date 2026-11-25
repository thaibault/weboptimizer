// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 4.0 international license.
    See https://creativecommons.org/licenses/by/4.0/deed.de
    endregion
*/
// region imports
import type {Configuration, RuleSetRule, Stats} from 'webpack'

import {afterAll, beforeAll, describe, expect, test} from '@jest/globals'
import {mkdtemp, readFile, rm, writeFile} from 'fs/promises'
import {tmpdir} from 'os'
import {join, resolve} from 'path'
import webpack from 'webpack'

import {
    ABSOLUTE_PUBLIC_PATH,
    AUTO_PUBLIC_PATH,
    determineContent,
    determineExecutionPublicPath,
    removeMarkers
} from '../extractLoader'
// endregion
// region mockup
const LOADER_PATH = resolve(import.meta.dirname, '../extractLoader.js')
const NODE_MODULES_PATH = resolve(import.meta.dirname, '../../node_modules')

let directoryPath = ''
/**
 * Compiles an entry importing given file with given rule applied.
 * @param fileName - Name of the file to import.
 * @param rule - Rule to apply to the imported file.
 * @param output - Additional output options.
 * @returns Compilation statistics and generated main bundle.
 */
const compile = (
    fileName: string,
    rule: RuleSetRule,
    output: Configuration['output'] = {}
): Promise<{bundle: string, stats: Stats}> =>
    new Promise((resolvePromise, reject) => {
        const outputPath = join(directoryPath, 'out', fileName)

        webpack(
            {
                context: directoryPath,
                entry: `./${fileName}.entry.js`,
                mode: 'production',
                module: {
                    rules: [
                        {test: /\.png$/, type: 'asset/resource'},
                        {...rule, test: new RegExp(`${fileName}$`)}
                    ]
                },
                optimization: {minimize: false},
                output: {path: outputPath, ...output},
                resolve: {modules: [NODE_MODULES_PATH]},
                resolveLoader: {modules: [NODE_MODULES_PATH]}
            },
            (error: Error | null, stats?: Stats) => {
                if (error || !stats) {
                    reject(error ?? new Error('Missing statistics.'))

                    return
                }

                readFile(join(outputPath, 'main.js'), {encoding: 'utf8'})
                    .then((bundle: string) => {
                        resolvePromise({bundle, stats})
                    })
                    .catch(() => {
                        resolvePromise({bundle: '', stats})
                    })
            }
        )
    })
// endregion
// region tests
describe('extractLoader', (): void => {
    beforeAll(async (): Promise<void> => {
        directoryPath = await mkdtemp(join(tmpdir(), 'weboptimizer-extract-'))

        await writeFile(join(directoryPath, 'image.png'), 'PNG')
        for (const fileName of ['auto.html', 'resource.html', 'source.html'])
            await Promise.all([
                writeFile(
                    join(directoryPath, `${fileName}.entry.js`),
                    `import value from './${fileName}'\n` +
                    'console.log("result:", value)'
                ),
                writeFile(
                    join(directoryPath, fileName),
                    '<p>content<img src="./image.png"></p>'
                )
            ])
    })

    afterAll(async (): Promise<void> => {
        await rm(directoryPath, {force: true, recursive: true})
    })

    test('determineContent', (): void => {
        expect(determineContent('a')).toStrictEqual('a')
        expect(determineContent({default: 'b'})).toStrictEqual('b')
        expect(() => determineContent({default: 1})).toThrow('number')
        expect(() => determineContent(null)).toThrow('object')
    })
    test('emits extracted html as resource', async (): Promise<void> => {
        const {bundle, stats} = await compile(
            'resource.html',
            {
                generator: {filename: 'template/[name][ext]'},
                type: 'asset/resource',
                use: [LOADER_PATH, 'html-loader']
            },
            {publicPath: '/static/'}
        )

        expect(stats.toJson({all: false, errors: true}).errors)
            .toStrictEqual([])
        expect(bundle).toContain('template/resource.html')

        const html = await readFile(
            join(directoryPath, 'out/resource.html/template/resource.html'),
            {encoding: 'utf8'}
        )
        expect(html).toMatch(
            /^<p>content<img src="\/static\/[^"]+\.png"><\/p>$/
        )
    })
    test('exports extracted html as source', async (): Promise<void> => {
        const {bundle, stats} = await compile(
            'source.html',
            {
                type: 'asset/source',
                use: [
                    {loader: LOADER_PATH, options: {publicPath: '/given/'}},
                    'html-loader'
                ]
            }
        )

        expect(stats.toJson({all: false, errors: true}).errors)
            .toStrictEqual([])
        expect(bundle).toMatch(
            /<p>content<img src=\\?"\/given\/[^"\\]+\.png\\?"><\/p>/
        )
    })
    test('resolves automatic public path', async (): Promise<void> => {
        const {stats} = await compile(
            'auto.html',
            {
                generator: {filename: 'nested/template/[name][ext]'},
                type: 'asset/resource',
                use: [
                    {
                        loader: LOADER_PATH,
                        options: {outputDirectory: 'nested/template'}
                    },
                    'html-loader'
                ]
            }
        )

        expect(stats.toJson({all: false, errors: true}).errors)
            .toStrictEqual([])

        const html = await readFile(
            join(directoryPath, 'out/auto.html/nested/template/auto.html'),
            {encoding: 'utf8'}
        )
        expect(html).toMatch(/^<p>content<img src="\.\.\/\.\.\/[^"/]+\.png">/)
    })
    test('removeMarkers', (): void => {
        expect(removeMarkers(`${ABSOLUTE_PUBLIC_PATH}a.png`)).toStrictEqual(
            'a.png'
        )
        expect(removeMarkers(`${AUTO_PUBLIC_PATH}a.png`, 'b/c'))
            .toStrictEqual('../../a.png')
        expect(determineExecutionPublicPath('../'))
            .not.toContain('..')
        expect(removeMarkers(determineExecutionPublicPath('../') + 'a.png'))
            .toStrictEqual('../a.png')
    })
})
// endregion
