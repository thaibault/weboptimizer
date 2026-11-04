// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {Mapping} from 'clientnode'
import type {Compiler} from 'webpack'

import {describe, expect, test} from '@jest/globals'

import RemoveStyleOnlyScripts, {EXTRACTED_STYLE_MODULE_TYPE} from
    '../plugins/RemoveStyleOnlyScripts'
// endregion
// region mockup
const LOADER = '/mini-css-extract-plugin/dist/loader.js'

interface ChunkMock {
    files: Set<string>
    groupsIterable: Array<EntrypointMock>
    isInGroup: (group: EntrypointMock) => boolean
    isOnlyInitial: () => boolean
    modules: Array<object>
}
interface EntrypointMock {
    chunks: Array<ChunkMock>
    getRuntimeChunk: () => ChunkMock
}

const styleModule = {
    exports: [], loaders: [{loader: LOADER}], type: 'javascript/auto'
}
const styleModuleWithLocals = {...styleModule, exports: ['default']}
const extractedModule = {type: EXTRACTED_STYLE_MODULE_TYPE}
const scriptModule = {loaders: [], type: 'javascript/auto'}

/**
 * Creates a chunk living in its own entrypoint.
 * @param name - Chunk name to derive file names from.
 * @param modules - Modules contained in chunk.
 * @param initial - Indicates whether chunk is an initial one.
 * @returns Chunk mock.
 */
const createChunk = (
    name: string, modules: Array<object>, initial = true
): ChunkMock => {
    const chunk: ChunkMock = {
        files: new Set([`${name}.css`, `${name}.js`]),
        groupsIterable: [],
        isInGroup: (group: EntrypointMock): boolean =>
            chunk.groupsIterable.includes(group),
        isOnlyInitial: (): boolean => initial,
        modules
    }
    chunk.groupsIterable.push({chunks: [chunk], getRuntimeChunk: () => chunk})

    return chunk
}
/**
 * Applies the plugin to a stubbed compiler and runs its asset processing.
 * @param chunks - Chunks to process.
 * @returns Remaining compilation asset names.
 */
const run = (chunks: Array<ChunkMock>): Array<string> => {
    const assets: Mapping<true> = {}
    for (const chunk of chunks)
        for (const file of chunk.files)
            assets[file] = true

    const compilation = {
        assets,
        chunkGraph: {
            getChunkModulesIterable: (chunk: ChunkMock) => chunk.modules,
            getNumberOfChunkModules: (chunk: ChunkMock) => chunk.modules.length
        },
        chunks,
        moduleGraph: {
            getProvidedExports: (module: {exports?: Array<string>}) =>
                module.exports ?? null
        },
        deleteAsset: (file: string): void => {
            delete assets[file]
        },
        entrypoints: new Map(chunks.flatMap((chunk: ChunkMock) =>
            chunk.groupsIterable.map((entrypoint: EntrypointMock) =>
                [entrypoint, entrypoint]
            )
        )),
        hooks: {processAssets: {tap: (
            options: object, callback: () => void
        ): void => {
            callback()
        }}}
    }

    new RemoveStyleOnlyScripts({loader: LOADER}).apply({
        hooks: {thisCompilation: {tap: (
            name: string, callback: (compilation: object) => void
        ): void => {
            callback(compilation)
        }}},
        webpack: {Compilation: {PROCESS_ASSETS_STAGE_OPTIMIZE: 100}}
    } as unknown as Compiler)

    return Object.keys(assets)
}
// endregion
// region tests
describe('RemoveStyleOnlyScripts', (): void => {
    test('removes scripts of style only chunks', () => {
        const styles = createChunk('styles', [styleModule, extractedModule])

        expect(run([createChunk('index', [scriptModule]), styles]))
            .toStrictEqual(['index.css', 'index.js', 'styles.css'])
        expect(Array.from(styles.files)).toStrictEqual(['styles.css'])
    })
    test('keeps scripts of mixed chunks', () => {
        expect(run([createChunk('index', [scriptModule, styleModule])]))
            .toStrictEqual(['index.css', 'index.js'])
    })
    test('keeps scripts of style sheet modules exporting class names', () => {
        expect(run([createChunk('index', [styleModuleWithLocals])]))
            .toStrictEqual(['index.css', 'index.js'])
    })
    test('keeps scripts of empty chunks', () => {
        expect(run([createChunk('index', [])]))
            .toStrictEqual(['index.css', 'index.js'])
    })
    test('keeps scripts of asynchronous chunks', () => {
        expect(run([createChunk('lazy', [styleModule], false)]))
            .toStrictEqual(['lazy.css', 'lazy.js'])
    })
    test('keeps scripts of split chunks', () => {
        const styles = createChunk('styles', [styleModule])
        const vendor = createChunk('vendor', [styleModule])
        styles.groupsIterable[0].chunks.push(vendor)

        expect(run([styles, vendor])).toStrictEqual(
            ['styles.css', 'styles.js', 'vendor.css']
        )
    })
    test('keeps scripts of chunks hosting other runtimes', () => {
        const styles = createChunk('styles', [styleModule])
        const index = createChunk('index', [scriptModule])
        index.groupsIterable[0].getRuntimeChunk = () => styles

        expect(run([styles, index])).toStrictEqual(
            ['styles.css', 'styles.js', 'index.css', 'index.js']
        )
    })
})
// endregion
