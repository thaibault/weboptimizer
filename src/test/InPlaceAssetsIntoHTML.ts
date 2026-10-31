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
import type HtmlWebpackPlugin from 'html-webpack-plugin'
import type {Compiler} from 'webpack'

import type {
    InPlaceAssetsIntoHTMLOptions, WebpackAssets, WebpackBaseAssets
} from '../type'

import {describe, expect, test} from '@jest/globals'

import InPlaceAssetsIntoHTML from '../plugins/InPlaceAssetsIntoHTML'
// endregion
// region mockup
type TagObject = HtmlWebpackPlugin.HtmlTagObject

const createTag = (
    tagName: string, attributes: TagObject['attributes']
): TagObject => ({
    attributes,
    meta: {plugin: 'html-webpack-plugin'},
    tagName,
    voidTag: false
})
/**
 * Applies the plugin to a stubbed compiler and runs both html plugin hooks.
 * @param options - Plugin options.
 * @param tags - Tags to process.
 * @param tags.bodyTags - Tags to process in body.
 * @param tags.headTags - Tags to process in head.
 * @param publicPath - Public path configured in the compiler.
 * @returns Processed tags and remaining compilation assets.
 */
const run = (
    options: Partial<InPlaceAssetsIntoHTMLOptions>,
    {bodyTags = [], headTags = []}: {
        bodyTags?: Array<TagObject>, headTags?: Array<TagObject>
    },
    publicPath = ''
): {assetNames: Array<string>, tags: WebpackAssets} => {
    const assets: Mapping<{source: () => string}> = {
        'a.js': {source: () => 'window.a = 1'},
        'b.js': {source: () => 'window.b = 1'}
    }
    let alterAssetTagGroups: (assets: WebpackAssets) => WebpackAssets =
        (assets: WebpackAssets): WebpackAssets => assets
    let afterEmit: (asset: WebpackBaseAssets) => WebpackBaseAssets =
        (asset: WebpackBaseAssets): WebpackBaseAssets => asset

    new InPlaceAssetsIntoHTML({
        cascadingStyleSheet: null,
        javaScript: null,
        ...options,
        htmlPlugin: {
            getHooks: () => ({
                alterAssetTagGroups: {
                    tap: (
                        name: string, callback: typeof alterAssetTagGroups
                    ): void => {
                        alterAssetTagGroups = callback
                    }
                },
                afterEmit: {
                    tap: (name: string, callback: typeof afterEmit): void => {
                        afterEmit = callback
                    }
                }
            })
        } as unknown as typeof HtmlWebpackPlugin
    }).apply({
        hooks: {
            compilation: {
                tap: (
                    name: string, callback: (compilation: object) => void
                ): void => {
                    callback({assets})
                }
            }
        },
        options: {output: {publicPath}}
    } as unknown as Compiler)

    const tags = alterAssetTagGroups(
        {bodyTags, headTags} as unknown as WebpackAssets
    )
    afterEmit({} as WebpackBaseAssets)

    return {assetNames: Object.keys(assets), tags}
}
// endregion
// region tests
describe('InPlaceAssetsIntoHTML', (): void => {
    test('leaves tags untouched without configuration', () => {
        const tag = createTag('script', {src: 'a.js'})

        expect(run({}, {headTags: [tag]})).toStrictEqual({
            assetNames: ['a.js', 'b.js'],
            tags: {bodyTags: [], headTags: [tag]}
        })
    })
    test('in places matching scripts', () => {
        const {assetNames, tags} = run(
            {javaScript: {body: [/^b/], head: 'a.js'}},
            {
                bodyTags: [
                    createTag('script', {defer: true, src: 'a.js'}),
                    createTag('script', {defer: true, src: 'b.js'})
                ],
                headTags: [
                    createTag('script', {src: 'a.js'}),
                    createTag('script', {src: 'not-existing.js'}),
                    createTag('meta', {charset: 'utf-8'})
                ]
            }
        )

        expect(tags.headTags[0]).toStrictEqual({
            ...createTag('script', {}),
            innerHTML: 'window.a = 1'
        })
        // NOTE: Only existing assets can be in placed.
        expect(tags.headTags[1].attributes.src).toStrictEqual('not-existing.js')
        expect(tags.headTags[2].tagName).toStrictEqual('meta')
        // NOTE: Patterns are configured per location.
        expect(tags.bodyTags[0].attributes.src).toStrictEqual('a.js')
        expect(tags.bodyTags[1]).toStrictEqual({
            ...createTag('script', {defer: true}),
            innerHTML: 'window.b = 1'
        })
        // NOTE: In placed assets are not emitted anymore.
        expect(assetNames).toStrictEqual([])
    })
    test('respects public path', () => {
        for (const publicPath of ['/public', '/public/']) {
            const {assetNames, tags} = run(
                {javaScript: {head: 'a.js'}},
                {headTags: [createTag('script', {src: '/public/a.js'})]},
                publicPath
            )

            expect(tags.headTags[0].innerHTML).toStrictEqual('window.a = 1')
            expect(assetNames).toStrictEqual(['b.js'])
        }
    })
})
// endregion
