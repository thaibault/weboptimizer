// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module InPlaceAssetsIntoHTML */
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {copy, extend, Mapping} from 'clientnode'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import {JSDOM as DOM} from 'jsdom'
import {Compilation, Compiler, LoaderContext} from 'webpack'

import ejsLoader, {
    LoaderConfiguration as EJSLoaderConfiguration
} from '../ejsLoader'
import {
    HTMLTransformationOptions,
    HTMLWebpackPluginBeforeEmitData,
    WebpackLoader
} from '../type'
// endregion

export class HTMLTransformation {
    private defaultOptions: Partial<HTMLTransformationOptions> = {}
    private options: HTMLTransformationOptions

    constructor(options: Partial<HTMLTransformationOptions> = {}) {
        this.options = {...this.defaultOptions, ...options} as
            HTMLTransformationOptions
    }

    private process(
        data: HTMLWebpackPluginBeforeEmitData
    ): HTMLWebpackPluginBeforeEmitData {
        /*
            NOTE: We have to prevent creating native "style" dom nodes to
            prevent jsdom from parsing the entire cascading style sheet. Which
            is error prune and very resource intensive.
        */
        const styleContents: Array<string> = []
        data.html = data.html.replace(
            /(<style[^>]*>)([\s\S]*?)(<\/style[^>]*>)/gi,
            (
                match: string,
                startTag: string,
                content: string,
                endTag: string
            ): string => {
                styleContents.push(content)

                return `${startTag}${endTag}`
            }
        )

        let dom: DOM
        try {
            /*
                NOTE: We have to translate template delimiter to html
                compatible sequences and translate it back later to avoid
                unexpected escape sequences in resulting html.
            */
            dom = new DOM(
                data.html
                    .replace(/<%/g, '##+#+#+##')
                    .replace(/%>/g, '##-#-#-##')
            )
        } catch {
            return data
        }

        const linkables: Mapping = {
            link: 'href',
            script: 'src'
        }
        for (const [tagName, attributeName] of Object.entries(
            linkables
        ))
            for (const domNode of Array.from<HTMLElement>(
                dom.window.document.querySelectorAll<HTMLElement>(
                    `${tagName}[${attributeName}*="?` +
                    `${this.options.hashAlgorithm}="]`
                )
            )) {
                /*
                    NOTE: Removing symbols after a "&" in hash string is
                    necessary to match the generated request strings in offline
                    plugin.
                */
                const value = domNode.getAttribute(attributeName)
                if (value)
                    domNode.setAttribute(
                        attributeName,
                        value.replace(
                            new RegExp(
                                `(\\?${this.options.hashAlgorithm}=[^&]+).*$`
                            ),
                            '$1'
                        )
                    )
            }
        // NOTE: We have to restore template delimiter and style contents.
        data.html = dom.serialize()
            .replace(/##\+#\+#\+##/g, '<%')
            .replace(/##-#-#-##/g, '%>')
            .replace(
                /(<style[^>]*>)[\s\S]*?(<\/style[^>]*>)/gi,
                (
                    match: string, startTag: string, endTag: string
                ): string =>
                    `${startTag}${styleContents.shift() as string}${endTag}`
            )
        // region post compilation
        for (const htmlFileSpecification of this.options.files)
            if (htmlFileSpecification.filename === (
                data.plugin as
                    unknown as
                    {options: HtmlWebpackPlugin.ProcessedOptions}
            ).options.filename) {
                for (const loaderConfiguration of (
                    [] as Array<WebpackLoader>
                ).concat(htmlFileSpecification.template.use))
                    if (
                        loaderConfiguration.options?.compileSteps &&
                        typeof loaderConfiguration.options
                            .compileSteps === 'number'
                    )
                        data.html = ejsLoader.bind({
                            query: extend(
                                true,
                                Object.prototype.hasOwnProperty.call(
                                    loaderConfiguration, 'options'
                                ) ? copy(loaderConfiguration.options) : {},
                                htmlFileSpecification.template
                                    .postCompileOptions
                            )
                        } as LoaderContext<EJSLoaderConfiguration>)(data.html)

                break
            }
        // endregion
        return data
    }

    apply(compiler: Compiler): void {
        compiler.hooks.compilation.tap(
            'WebOptimizer',
            (compilation: Compilation): void => {
                this.options.htmlPlugin
                    .getHooks(compilation)
                    .beforeEmit.tap(
                        'WebOptimizerPostProcessHTML', this.process.bind(this)
                    )
            }
        )
    }
}

export default HTMLTransformation
