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
import {Compilation, Compiler} from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

import {
    InPlaceAssetConfiguration,
    InPlaceAssetsIntoHTMLOptions,
    WebpackAssets,
    WebpackBaseAssets
} from '../type'
// endregion

export class InPlaceAssetsIntoHTML {
    private defaultOptions:Partial<InPlaceAssetsIntoHTMLOptions> = {}
    private options:InPlaceAssetsIntoHTMLOptions

    constructor(options:Partial<InPlaceAssetsIntoHTMLOptions> = {}) {
        this.options = {...this.defaultOptions, ...options} as
            InPlaceAssetsIntoHTMLOptions
    }

    apply(compiler:Compiler):void {
        let publicPath:string =
            compiler.options.output.publicPath as string || ''
        if (publicPath && !publicPath.endsWith('/'))
            publicPath += '/'

        compiler.hooks.compilation.tap(
            'inPlaceHTMLAssets',
            (compilation:Compilation):void => {
                const hooks:HtmlWebpackPlugin.Hooks =
                    this.options.htmlPlugin.getHooks(compilation)
                const inPlacedAssetNames:Array<string> = []

                hooks.alterAssetTagGroups.tap(
                    'inPlaceHTMLAssets',
                    (assets:WebpackAssets):WebpackAssets => {
                        const inPlace = (
                            type:keyof InPlaceAssetConfiguration,
                            tag:HtmlWebpackPlugin.HtmlTagObject
                        ):HtmlWebpackPlugin.HtmlTagObject => {
                            let settings:InPlaceAssetConfiguration|undefined
                            let url:boolean|null|string|undefined = false
                            if (tag.tagName === 'script') {
                                settings = this.options.javaScript
                                url = tag.attributes.src
                            } else if (tag.tagName === 'style') {
                                settings = this.options.cascadingStyleSheet
                                url = tag.attributes.href
                            }
                            if (!(url && typeof url === 'string'))
                                return tag

                            const name:string =
                                publicPath ? url.replace(publicPath, '') : url

                            if (
                                compilation.assets[name] &&
                                settings![type] &&
                                ([] as Array<RegExp|string>)
                                    .concat(
                                        settings![type] as Array<RegExp|string>
                                    )
                                    .some((pattern:RegExp|string):boolean =>
                                        (new RegExp(pattern)).test(name)
                                    )
                            ) {
                                const newAttributes:HtmlWebpackPlugin.HtmlTagObject[
                                    'attributes'
                                    ] = {...tag.attributes}
                                delete newAttributes.href
                                delete newAttributes.src

                                inPlacedAssetNames.push(name)

                                return {
                                    ...tag,
                                    attributes: newAttributes,
                                    innerHTML:
                                        compilation.assets[name].source() as
                                            string,
                                    tagName: 'script'
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
                    (asset:WebpackBaseAssets):WebpackBaseAssets => {
                        for (const name of inPlacedAssetNames)
                            delete compilation.assets[name]

                        return asset
                    }
                )
            })
    }
}

export default InPlaceAssetsIntoHTML
