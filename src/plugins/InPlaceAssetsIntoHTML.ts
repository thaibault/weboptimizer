// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module InPlaceAssetsIntoHTML */
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
import type {Compilation, Compiler} from 'webpack'
import type {
    InPlaceAssetConfiguration,
    InPlaceAssetsIntoHTMLOptions,
    WebpackAssets,
    WebpackBaseAssets
} from '../type'

import HtmlWebpackPlugin from 'html-webpack-plugin'
// endregion

export class InPlaceAssetsIntoHTML {
    private defaultOptions: Partial<InPlaceAssetsIntoHTMLOptions> = {}
    private options: InPlaceAssetsIntoHTMLOptions

    constructor(options: Partial<InPlaceAssetsIntoHTMLOptions> = {}) {
        this.options = {...this.defaultOptions, ...options} as
            InPlaceAssetsIntoHTMLOptions
    }

    apply(compiler: Compiler): void {
        let publicPath: string =
            compiler.options.output.publicPath as string || ''
        /*
            NOTE: An automatically determined public path results in
            relative asset urls in generated html files.
        */
        if (publicPath === 'auto')
            publicPath = ''
        if (publicPath && !publicPath.endsWith('/'))
            publicPath += '/'

        compiler.hooks.compilation.tap(
            'inPlaceHTMLAssets',
            (compilation: Compilation): void => {
                const hooks: HtmlWebpackPlugin.Hooks =
                    this.options.htmlPlugin.getHooks(compilation)
                const inPlacedAssetNames: Array<string> = []

                hooks.alterAssetTagGroups.tap(
                    'inPlaceHTMLAssets',
                    (assets: WebpackAssets): WebpackAssets => {
                        const inPlace = (
                            type: keyof InPlaceAssetConfiguration,
                            tag: HtmlWebpackPlugin.HtmlTagObject
                        ): HtmlWebpackPlugin.HtmlTagObject => {
                            let settings: InPlaceAssetConfiguration | null =
                                null
                            let url: boolean | null | string | undefined =
                                false
                            let tagName = 'script'
                            if (tag.tagName === 'script') {
                                settings = this.options.javaScript
                                url = tag.attributes.src
                            } else if (
                                tag.tagName === 'link' &&
                                tag.attributes.rel === 'stylesheet'
                            ) {
                                /*
                                    NOTE: Style sheets are referenced via
                                    "link" tags and have to be in placed as
                                    "style" tags.
                                */
                                settings = this.options.cascadingStyleSheet
                                url = tag.attributes.href
                                tagName = 'style'
                            }
                            if (!(url && typeof url === 'string'))
                                return tag

                            const name: string =
                                publicPath ? url.replace(publicPath, '') : url

                            if (
                                Object.prototype.hasOwnProperty.call(
                                    compilation.assets, name
                                ) &&
                                settings &&
                                settings[type] &&
                                ([] as Array<RegExp | string>)
                                    .concat(
                                        settings[type] as Array<RegExp | string>
                                    )
                                    .some((pattern: RegExp | string): boolean =>
                                        (new RegExp(pattern)).test(name)
                                    )
                            ) {
                                const newAttributes: (
                                    HtmlWebpackPlugin.HtmlTagObject[
                                        'attributes'
                                    ]
                                ) = {...tag.attributes}
                                delete newAttributes.href
                                delete newAttributes.rel
                                delete newAttributes.src

                                inPlacedAssetNames.push(name)

                                return {
                                    ...tag,
                                    attributes: newAttributes,
                                    innerHTML:
                                        compilation.assets[name].source() as
                                            string,
                                    tagName,
                                    voidTag: false
                                }
                            }

                            return tag
                        }

                        assets.headTags =
                            assets.headTags.map(inPlace.bind(this, 'head'))
                        assets.bodyTags =
                            assets.bodyTags.map(inPlace.bind(this, 'body'))

                        return assets
                    }
                )

                // NOTE: Avoid if you still want to emit the runtime chunks:
                hooks.afterEmit.tap(
                    'inPlaceHTMLAssets',
                    (asset: WebpackBaseAssets): WebpackBaseAssets => {
                        for (const name of inPlacedAssetNames)
                            delete compilation.assets[name]

                        return asset
                    }
                )
            })
    }
}

export default InPlaceAssetsIntoHTML
