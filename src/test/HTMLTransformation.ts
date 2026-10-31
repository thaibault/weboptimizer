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
import type {Compiler} from 'webpack'

import type {
    HTMLConfiguration,
    HTMLTransformationOptions,
    HTMLWebpackPluginBeforeEmitData
} from '../type'

import {beforeAll, describe, expect, test} from '@jest/globals'
import HtmlWebpackPlugin from 'html-webpack-plugin'

import getConfiguration from '../configurator'
import HTMLTransformation from '../plugins/HTMLTransformation'
// endregion
// region mockup
type Process = (
    data: HTMLWebpackPluginBeforeEmitData
) => Promise<HTMLWebpackPluginBeforeEmitData>

const process = (
    html: string,
    options: Partial<HTMLTransformationOptions> = {},
    filename = 'index.html'
): Promise<HTMLWebpackPluginBeforeEmitData> =>
    (new HTMLTransformation({hashAlgorithm: 'md5', files: [], ...options}) as
        unknown as
        {process: Process}
    ).process({
        html,
        outputName: filename,
        plugin: {options: {filename}} as unknown as HtmlWebpackPlugin
    })
// endregion
/*
    NOTE: We need to pre-cache the configuration to avoid exceeding timeout in
    following tests (post compilation runs the ejs loader).
*/
beforeAll(() => getConfiguration())
// region tests
describe('HTMLTransformation', (): void => {
    test('strips everything after hash query parameter', async () => {
        const {html} = await process(
            '<html><head>' +
            '<link href="a.css?md5=abc&b=c" rel="stylesheet">' +
            '<link href="b.css?b=c&d=e" rel="stylesheet">' +
            '</head><body>' +
            '<script src="a.js?md5=def&b=c"></script>' +
            '<script src="b.js?sha1=def&b=c"></script>' +
            '</body></html>'
        )

        expect(html).toContain('href="a.css?md5=abc"')
        expect(html).toContain('href="b.css?b=c&amp;d=e"')
        expect(html).toContain('src="a.js?md5=def"')
        expect(html).toContain('src="b.js?sha1=def&amp;b=c"')
    })
    test('respects configured hash algorithm', async () => {
        const {html} = await process(
            '<script src="a.js?sha1=def&b=c"></script>',
            {hashAlgorithm: 'sha1'}
        )

        expect(html).toContain('src="a.js?sha1=def"')
    })
    test('preserves style contents', async () => {
        const styles = [
            'a > b {color: red}</not-a-tag>',
            '@media (min-width: 1px) {a {content: "<%"}}'
        ]
        const {html} = await process(
            `<html><head><style>${styles[0]}</style></head>` +
            `<body><style type="text/css">${styles[1]}</style></body></html>`
        )

        expect(html).toContain(`<style>${styles[0]}</style>`)
        expect(html).toContain(`<style type="text/css">${styles[1]}</style>`)
    })
    test('preserves template delimiter', async () => {
        const {html} = await process(
            '<html><body><a title="<%- _.title %>"><% if (a) { %>b<% } %>' +
            '</a></body></html>'
        )

        expect(html).toContain('<a title="<%- _.title %>">')
        expect(html).toContain('<% if (a) { %>b<% } %>')
    })
    test('post compiles matching html files', async () => {
        const files: Array<HTMLConfiguration> = [{
            filename: 'index.html',
            template: {
                filePath: '',
                postCompileOptions: {locals: {test: 'hans'}},
                request: '',
                use: [{loader: 'ejs', options: {compileSteps: 2}}]
            }
        }]

        expect((await process(
            '<html><body><a><%- _.test %></a></body></html>', {files}
        )).html).toContain('<a>hans</a>')
        // Other files should not be touched.
        expect((await process(
            '<html><body><a><%- _.test %></a></body></html>',
            {files},
            'other.html'
        )).html).toContain('<a><%- _.test %></a>')
    })
    test('apply', () => {
        const tapped: Array<string> = []
        const compiler = {
            hooks: {
                compilation: {
                    tap: (name: string, callback: (value: object) => void) => {
                        tapped.push(name)
                        callback({})
                    }
                }
            }
        } as unknown as Compiler
        const htmlPlugin = {
            getHooks: () => ({
                beforeEmit: {
                    tapPromise: (name: string, callback: Process) => {
                        tapped.push(name)
                        expect(callback).toBeInstanceOf(Function)
                    }
                }
            })
        } as unknown as typeof HtmlWebpackPlugin

        new HTMLTransformation({htmlPlugin}).apply(compiler)

        expect(tapped)
            .toStrictEqual(['WebOptimizer', 'WebOptimizerPostProcessHTML'])
    })
})
// endregion
