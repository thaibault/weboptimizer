// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module RemoveStyleOnlyScripts */
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
import type {Chunk, Compilation, Compiler, Module, NormalModule} from 'webpack'

import type {RemoveStyleOnlyScriptsOptions} from '../type'
// endregion

/**
 * Module type of modules representing extracted style sheets.
 */
export const EXTRACTED_STYLE_MODULE_TYPE = 'css/mini-extract'
/**
 * Removes java script files of initial chunks which only consist of style
 * sheets extracted into separate files like a dedicated "styles" entry. The
 * remaining java script file would be (nearly) empty and useless.
 */
export class RemoveStyleOnlyScripts {
    private defaultOptions: Partial<RemoveStyleOnlyScriptsOptions> = {
        javaScriptFilePattern: /\.[cm]?js(?:\?.*)?$/
    }
    private options: RemoveStyleOnlyScriptsOptions

    constructor(options: Partial<RemoveStyleOnlyScriptsOptions> = {}) {
        this.options = {...this.defaultOptions, ...options} as
            RemoveStyleOnlyScriptsOptions
    }
    /**
     * Determines whether given module is an extracted style sheet or its
     * empty java script counterpart created by the extraction loader.
     * NOTE: Style sheet modules export their class name mapping which has to
     * be kept.
     * @param module - Module to check.
     * @param compilation - Current compilation.
     * @returns Indicator.
     */
    isExtractedStyle(module: Module, compilation: Compilation): boolean {
        if (module.type === EXTRACTED_STYLE_MODULE_TYPE)
            return true

        const loaders = (module as Partial<NormalModule>).loaders
        if (!(
            Array.isArray(loaders) &&
            loaders.some(({loader}): boolean => loader === this.options.loader)
        ))
            return false

        const providedExports =
            compilation.moduleGraph.getProvidedExports(module)
        return Array.isArray(providedExports) && providedExports.length === 0
    }
    /**
     * Determines whether java script files of given chunk can be removed
     * safely.
     * NOTE: Asynchronous chunks are still needed to load their style sheets
     * and chunks hosting a runtime for other chunks are needed as well. Hot
     * module replacement adds client modules so affected chunks are kept.
     * @param chunk - Chunk to check.
     * @param compilation - Current compilation.
     * @returns Indicator.
     */
    isStyleOnly(chunk: Chunk, compilation: Compilation): boolean {
        if (!chunk.isOnlyInitial())
            return false

        for (const group of chunk.groupsIterable)
            if (group.chunks.length !== 1)
                return false

        for (const entrypoint of compilation.entrypoints.values())
            if (
                entrypoint.getRuntimeChunk() === chunk &&
                !chunk.isInGroup(entrypoint)
            )
                return false

        const {chunkGraph} = compilation
        if (chunkGraph.getNumberOfChunkModules(chunk) === 0)
            return false

        for (const module of chunkGraph.getChunkModulesIterable(chunk))
            if (!this.isExtractedStyle(module, compilation))
                return false

        return true
    }

    apply(compiler: Compiler): void {
        const name = 'RemoveStyleOnlyScripts'

        compiler.hooks.thisCompilation.tap(
            name,
            (compilation: Compilation): void => {
                compilation.hooks.processAssets.tap(
                    {
                        name,
                        /*
                            NOTE: Has to run before html plugins determine
                            their asset tags and source maps are generated.
                        */
                        stage: compiler.webpack.Compilation
                            .PROCESS_ASSETS_STAGE_OPTIMIZE
                    },
                    (): void => {
                        for (const chunk of compilation.chunks)
                            if (this.isStyleOnly(chunk, compilation))
                                for (const file of Array.from(chunk.files))
                                    if (
                                        this.options.javaScriptFilePattern
                                            .test(file)
                                    ) {
                                        chunk.files.delete(file)
                                        compilation.deleteAsset(file)
                                    }
                    }
                )
            }
        )
    }
}

export default RemoveStyleOnlyScripts
