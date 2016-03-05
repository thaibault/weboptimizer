#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
const packageConfiguration = require('../../package.json').webOptimizer || {}
const extend = require('extend')
const path = require('path')
const webpack = require('webpack')
const WebpackOfflinePlugin = require('offline-plugin')
const plugins = require('webpack-load-plugins')()
plugins.offline = WebpackOfflinePlugin
// endregion
// region configuration
// NOTE: building context is this hierarchy up:
// "PROJECT/node_modules/webOptimizer"
__dirname = path.normalize(__dirname + '/../..')
for (let key of [
    'sourcePath', 'targetPath', 'sourceAssetPath', 'targetAssetPath'
])
    if(packageConfiguration[key])
        packageConfiguration[key] =  path.normalize(
            '../../' + packageConfiguration[key])

if (!!global.process.env.npm_config_production)
    var debug = false
else
    var debug = !!global.process.env.npm_config_debug ||
        packageConfiguration.debug || false
const hashAlgorithm = packageConfiguration.hashAlgorithm || 'md5'
// 256 KiloByte
const maximumInPlaceFileLimitInByte =
    packageConfiguration.maximumInPlaceFileLimitInByte || 262144
const html = packageConfiguration.html || {attrs: 'img:src link:href'}
const jade = packageConfiguration.jade || {
    pretty: debug, debug, includeManifest: !debug}
const sourcePath = packageConfiguration.sourcePath || __dirname + '/source/'
const targetPath = packageConfiguration.targetPath || __dirname + '/build/'
const sourceAssetPath =
    packageConfiguration.sourceAssetPath || sourcePath + 'asset/'
const targetAssetPath =
    packageConfiguration.targetAssetPath || targetPath + 'asset/'
const configuration = extend(true, {
    // region self referenced
    debug,
    sourcePath,
    targetPath,
    sourceAssetPath,
    targetAssetPath,
    hashAlgorithm,
    maximumInPlaceFileLimitInByte,
    // endregion
    developmentTool: debug ? '#source-map' : null,
    internalInjects: [],
    externalInjects: [],
    offline: debug ? null : {
        caches: 'all',
        scope: '/',
        updateStrategy: 'hash',
        version: 0,
        ServiceWorker: {output: 'javaScript/serviceWorker.js'},
        AppCache: {directory: '/'},
        excludes: ['*.map?' + hashAlgorithm + '=*']
    },
    files: {
        html: [
            {
                debug,
                /*
                    NOTE: Provides a workaround to handle a bug with changed
                    loader configurations (which we need here). Simple solution
                    would be:

                    template: 'html?' + JSON.stringify(html) + '!jade-html?' +
                        JSON.stringify(jade) + '!' + sourcePath + 'index.jade'
                */
                template: () => {
                    const string = new global.String('html?' + JSON.stringify(
                        html
                    ) + '!jade-html?' + JSON.stringify(jade) + '!' +
                    sourcePath + 'index.jade')
                    const nativeReplaceFunction = string.replace
                    string.replace = (search, replacement) => {
                        string.replace = nativeReplaceFunction
                        return string
                    }
                    return string
                }(),
                hash: true,
                // NOTE: Will be required to be in-placed:
                // favicon: sourceAssetPath + 'image/favicon.ico',
                filename: 'index.html',
                inject: 'body',
                minify: debug ? false : {collapseWhitespace: true}
            }
        ],
        cascadingStyleSheet: [
            'cascadingStyleSheet/main.css?' + hashAlgorithm + '=[contenthash]'
        ],
        javaScript: 'javaScript/main.js?' + hashAlgorithm + '=[hash]'
    },
    preprocessor: {
        jade,
        sass: {indentedSyntax: true},
        scss: {},
        modernJavaScript: {cacheDirectory: true, presets: ['es2015']},
    },

    html,
    cascadingStyleSheet: {},

    optimizer: {
        uglifyJS: debug ? null : {compress: {warnings: false}},
        image: {
            file: {
                limit: maximumInPlaceFileLimitInByte,
                name: 'image/[name].[ext]?' + hashAlgorithm + '=[hash]'
            },
            content: {
                optimizationLevel: 7,
                bypassOnDebug: debug,
                verbose: debug
            }
        },
        font: {
            eot: {
                limit: maximumInPlaceFileLimitInByte,
                name: 'font/[name].[ext]?' + hashAlgorithm + '=[hash]'
            },
            woff: {
                limit: maximumInPlaceFileLimitInByte,
                name: 'font/[name].[ext]?' + hashAlgorithm + '=[hash]'
            },
            ttf: {
                limit: maximumInPlaceFileLimitInByte,
                mimetype: 'application/octet-stream',
                name: 'font/[name].[ext]?' + hashAlgorithm + '=[hash]'
            },
            svg: {
                limit: maximumInPlaceFileLimitInByte,
                mimetype: 'image/svg+xml',
                name: 'font/[name].[ext]?' + hashAlgorithm + '=[hash]'
            }
        }
    }
}, packageConfiguration)
// endregion
// region initialisation
/// region configuration pre processing
let index = 0
for (let path of configuration.internalInjects) {
    configuration.internalInjects[index] = configuration.sourceAssetPath + path
    index += 1
}
configuration.plugins = []
for (let htmlOptions of configuration.files.html)
    configuration.plugins.push(new plugins.html(htmlOptions))
// Optimizes and bundles webpack output.
if (configuration.optimizer.uglifyJS)
    configuration.plugins.push(new webpack.optimize.UglifyJsPlugin(
        configuration.optimizer.uglifyJS))
if (configuration.offline)
    configuration.plugins.push(new plugins.offline(configuration.offline))
configuration.plugins.push({apply: (compiler) => {
    compiler.plugin('compilation', (compilation) => {
        compilation.plugin('html-webpack-plugin-before-html-processing', (
            htmlPluginData, callback
        ) => {
            // TODO inject css in head if configured.
            // htmlPluginData.html += 'TEST'
            callback()
        })
    })
}})
/// endregion
/// region loader
const loader = {
    preprocessor: {
        less: 'less?' + JSON.stringify(configuration.preprocessor.less),
        sass: 'sass?' + JSON.stringify(configuration.preprocessor.sass),
        scss: 'sass?' + JSON.stringify(configuration.preprocessor.scss),
        babel: 'babel?' + JSON.stringify(
            configuration.preprocessor.modernJavaScript
        ),
        coffee: 'coffee',
        jade: 'jade-html?' + JSON.stringify(configuration.preprocessor.jade),
        literateCoffee: 'coffee?literate'
    },
    html: 'html?' + JSON.stringify(configuration.html),
    cascadingStyleSheet: 'style-loader!css-loader?' + JSON.stringify(
        configuration.cascadingStyleSheet),
    postprocessor: {
        image: 'url?' + JSON.stringify(
            configuration.optimizer.image.file
        ) + '!image?' + JSON.stringify(configuration.optimizer.image.content),
        font: {
            eot: 'url?' + JSON.stringify(configuration.optimizer.font.eot),
            woff: 'url?' + JSON.stringify(configuration.optimizer.font.woff),
            ttf: 'url?' + JSON.stringify(configuration.optimizer.font.ttf),
            svg: 'url?' + JSON.stringify(configuration.optimizer.font.svg)
        }
    }
}
/// endregion
module.exports = {
    context: __dirname,
    debug: configuration.debug,
    devtool: configuration.developmentTool,
    devserver: {contentBase: configuration.sourcePath},
    // region input
    resolve: {
        root: [configuration.sourceAssetPath],
        extensions: [
            '',
            '.js', '.coffee', 'coffee.md', '.litcoffee',
            '.html', '.jade',
            '.css', '.scss', '.sass', '.less',
            '.png', '.jpg', '.ico', '.gif'
        ],
        alias: {
            jquery: 'jquery/src/jquery',
            angular: 'angular2',
            bootstrap: 'bootstrap/dist/css/bootstrap'
        }
    },
    entry: configuration.externalInjects.concat(configuration.internalInjects),
    // endregion
    // region output
    output: {
        path: configuration.targetPath,
        filename: configuration.files.javaScript,
        pathinfo: false,
        hashFunction: configuration.hashAlgorithm
    },
    // endregion
    module: {
        preLoaders: [
            // Convert to native web types.
            // region style
            {
                test: /\.less$/,
                loader: loader.cascadingStyleSheet + '!' +
                    loader.preprocessor.less,
                include: configuration.sourceAssetPath + 'less'
            },
            {
                test: /\.sass$/,
                loader: loader.cascadingStyleSheet + '!' +
                    loader.preprocessor.sass,
                include: configuration.sourceAssetPath + 'sass'
            },
            {
                test: /\.scss$/,
                loader: loader.cascadingStyleSheet + '!' +
                    loader.preprocessor.scss,
                include: configuration.sourceAssetPath + 'scss'
            },
            // endregion
            // region script
            {
                test: /\.js$/,
                loader: loader.preprocessor.babel,
                include: configuration.sourceAssetPath + 'javaScript'
            },
            {
                test: /\.coffee$/,
                loader: loader.preprocessor.coffee,
                include: configuration.sourceAssetPath + 'coffeeScript'
            },
            {
                test: /\.(coffee\.md|litcoffee)$/,
                loader: loader.preprocessor.literateCoffee,
                include: configuration.sourceAssetPath + 'coffeeScript'
            },
            // endregion
            // region html
            {
                test: /\.jade$/,
                loader: 'file?name=template/[name].html?' +
                    configuration.hashAlgorithm + '=[hash]!extract!' +
                    loader.html + '!' + loader.preprocessor.jade,
                include: configuration.sourceAssetPath + 'template'
            },
            // endregion
        ],
        loaders: [
            // Loads dependencies.
            // region html
            {
                test: /\.html$/,
                loader: 'file?name=template/[name].[ext]?' +
                    configuration.hashAlgorithm + '=[hash]!extract!' +
                    loader.html,
                include: configuration.sourceAssetPath + 'template'
            },
            // endregion
            // region cascadingStyleSheet
            {test: /\.css$/, loader: loader.cascadingStyleSheet}
            // endregion
        ],
        postLoaders: [
            // Optimize loaded assets.
            // region font
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.eot
            },
            {test: /\.(woff|woff2)$/, loader: loader.postprocessor.font.woff},
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.ttf
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: loader.postprocessor.font.svg
            },
            // endregion
            // region image
            {test: /\.(png|jpg|ico|gif)$/, loader: loader.postprocessor.image}
            // endregion
        ]
    },
    plugins: configuration.plugins
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
