#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
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
import {transform as babelTransform} from 'babel-core'
import babelMinifyPreset from 'babel-preset-minify'
import transformWith from 'babel-plugin-transform-with'
import Tools from 'clientnode'
import ejs from 'ejs'
import fileSystem from 'fs'
import {minify as minifyHTML} from 'html-minifier'
import * as loaderUtils from 'loader-utils'
import path from 'path'

import configuration from './configurator.compiled'
import Helper from './helper.compiled'
// endregion
// region types
type TemplateFunction = (locals:Object) => string
type CompileFunction = (
    template:string, options:Object, compileSteps?:number
) => TemplateFunction
// endregion
module.exports = function(source:string):string {
    if ('cachable' in this && this.cacheable)
        this.cacheable()
    const query:Object = Tools.convertSubstringInPlainObject(
        Tools.extend(
            true,
            {
                compress: {
                    html: {},
                    javaScript: {}
                },
                context: './',
                extensions: {
                    file: [
                        '.js', '.json',
                        '.css',
                        '.svg', '.png', '.jpg', '.gif', '.ico',
                        '.html',
                        '.eot', '.ttf', '.woff', '.woff2'
                    ],
                    module: []
                },
                module: {
                    aliases: {},
                    replacements: {}
                },
                compileSteps: 2
            },
            this.options || {},
            'query' in this ? loaderUtils.getOptions(this) || {} : {}
        ),
        /#%%%#/g,
        '!'
    )
    const compile:CompileFunction = (
        template:string,
        options:Object = query.compiler,
        compileSteps:number = 2
    ):TemplateFunction => (locals:Object = {}):string => {
        options = Tools.extend(true, {filename: template}, options)
        const require:Function = (
            request:string, nestedLocals:Object = {}
        ):string => {
            const template:string = request.replace(/^(.+)\?[^?]+$/, '$1')
            const queryMatch:?Array<string> = request.match(/^[^?]+\?(.+)$/)
            if (queryMatch) {
                const evaluationFunction = (
                    request:string,
                    template:string, source:string,
                    compile:CompileFunction,
                    locals:Object
                // IgnoreTypeCheck
                ):Object => new Function(
                    'request',
                    'template',
                    'source',
                    'compile',
                    'locals',
                    `return ${queryMatch[1]}`
                )(request, template, source, compile, locals)
                nestedLocals = Tools.extend(
                    true,
                    nestedLocals,
                    evaluationFunction(
                        request, template, source, compile, locals))
            }
            let nestedOptions:Object = Tools.copy(options)
            delete nestedOptions.client
            nestedOptions = Tools.extend(
                true,
                {encoding: configuration.encoding},
                nestedOptions,
                nestedLocals.options || {}
            )
            if (nestedOptions.isString)
                return compile(template, nestedOptions)(nestedLocals)
            const templateFilePath:?string = Helper.determineModuleFilePath(
                template,
                query.module.aliases,
                query.module.replacements,
                {
                    file: query.extensions.file.internal,
                    module: query.extensions.module
                },
                query.context,
                configuration.path.source.asset.base,
                configuration.path.ignore,
                configuration.module.directoryNames,
                configuration.package.main.fileNames,
                configuration.package.main.propertyNames,
                configuration.package.aliasPropertyNames,
                configuration.encoding
            )
            if (templateFilePath) {
                if ('query' in this)
                    this.addDependency(templateFilePath)
                /*
                    NOTE: If there aren't any locals options or variables and
                    file doesn't seem to be an ejs template we simply load
                    included file content.
                */
                if (queryMatch || templateFilePath.endsWith('.ejs'))
                    return compile(templateFilePath, nestedOptions)(
                        nestedLocals)
                // IgnoreTypeCheck
                return fileSystem.readFileSync(templateFilePath, nestedOptions)
            }
            throw new Error(
                `Given template file "${template}" couldn't be resolved.`)
        }
        const compressHTML:Function = (content:string):string =>
            query.compress.html ? minifyHTML(content, Tools.extend(
                true,
                {
                    caseSensitive: true,
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    minifyCSS: true,
                    minifyJS: true,
                    processScripts: [
                        'text/ng-template', 'text/x-handlebars-template'
                    ],
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    sortAttributes: true,
                    sortClassName: true,
                    // NOTE: Avoids whitespace around placeholder in tags.
                    trimCustomFragments: true,
                    useShortDoctype: true
                },
                query.compress.html
            )) : content
        let remainingSteps:number = compileSteps
        let result:TemplateFunction|string = template
        const isString:boolean = options.isString
        delete options.isString
        while (remainingSteps > 0) {
            if (typeof result === 'string') {
                const filePath:?string = isString && options.filename || result
                if (filePath && path.extname(filePath) === '.js')
                    result = eval('require')(filePath)
                else {
                    if (!isString) {
                        let encoding:string = configuration.encoding
                        if ('encoding' in options)
                            encoding = options.encoding
                        result = fileSystem.readFileSync(result, {encoding})
                    }
                    if (remainingSteps === 1)
                        result = compressHTML(result)
                    result = ejs.compile(result, options)
                }
            } else
                result = compressHTML(result(Tools.extend(
                    true,
                    {configuration, Helper, include: require, require, Tools},
                    locals
                )))
            remainingSteps -= 1
        }
        if (Boolean(compileSteps % 2))
            return `'use strict';\n` + babelTransform(
                `module.exports = ${result.toString()};`, {
                    ast: false,
                    babelrc: false,
                    comments: !Boolean(query.compress.javaScript),
                    compact: Boolean(query.compress.javaScript),
                    filename: options.filename || 'unknown',
                    minified: Boolean(query.compress.javaScript),
                    plugins: [transformWith],
                    presets: query.compress.javaScript ? [[
                        babelMinifyPreset, query.compress.javaScript
                    ]] : [],
                    sourceMaps: false,
                    sourceType: 'script'
                }).code
        result = result
            .replace(new RegExp(
                `<script +processing-workaround *(?:= *(?:" *"|' *') *)?>` +
                '([\\s\\S]*?)</ *script *>', 'ig'
            ), '$1')
            .replace(new RegExp(
                `<script +processing(-+)-workaround *(?:= *(?:" *"|' *') *)?` +
                '>([\\s\\S]*?)</ *script *>',
                'ig'
            ), '<script processing$1workaround>$2</script>')
        // IgnoreTypeCheck
        return result
    }
    return compile(
        source,
        {
            client: Boolean(query.compileSteps % 2),
            compileDebug: this.debug || false,
            debug: this.debug || false,
            filename: 'query' in this ? loaderUtils.getRemainingRequest(
                this
            ).replace(/^!/, '') : this.filename || null,
            isString: true
        },
        query.compileSteps
    )(query.locals || {})
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
