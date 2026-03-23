// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module ejsLoader */
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
import {
    BabelFileResult, transformSync as babelTransformSync
} from '@babel/core'
import babelMinifyPreset from 'babel-preset-minify'
import {
    convertSubstringInPlainObject,
    copy,
    currentRequire,
    evaluate,
    EvaluationResult,
    Encoding,
    extend,
    Mapping,
    RecursivePartial,
    UTILITY_SCOPE
} from 'clientnode'
import ejs, {Options, TemplateFunction as EJSTemplateFunction} from 'ejs'
import {readFileSync} from 'fs'
import {minify as minifyHTML} from 'html-minifier'
import {extname} from 'path'
import {LoaderContext} from 'webpack'

import getConfiguration from './configurator'
import {determineModuleFilePath} from './helper'
import {Extensions, Replacements, ResolvedConfiguration} from './type'
// endregion
// region types
export type TemplateFunction = EJSTemplateFunction
export type CompilerOptions =
    Options &
    {
        encoding: Encoding
        isString?: boolean
    }
export type CompileFunction =
    (
        template: string,
        options?: Partial<CompilerOptions>,
        compileSteps?: number
    ) => TemplateFunction
export type LoaderConfiguration =
    Mapping<unknown> &
    {
        compiler: Partial<CompilerOptions>
        compileSteps: number
        compress: {
            html: Mapping<unknown>
            javaScript: Mapping<unknown>
        }
        context: string
        debug: boolean
        extensions: Extensions
        locals?: Mapping<unknown>
        module: {
            aliases: Mapping
            replacements: Replacements
        }
    }
// endregion
const configuration: ResolvedConfiguration = getConfiguration()
/**
 * Main transformation function.
 * @param source - Input string to transform.
 * @returns Transformed string.
 */
export const loader = function(
    this: Partial<LoaderContext<LoaderConfiguration>>, source: string
): string {
    const givenOptions: RecursivePartial<LoaderConfiguration> =
        convertSubstringInPlainObject(
            extend<LoaderConfiguration>(
                true,
                {
                    compiler: {},
                    compileSteps: 2,
                    compress: {
                        html: {},
                        javaScript: {}
                    },
                    context: './',
                    debug: false,
                    extensions: {
                        file: {
                            external: [],
                            internal: [
                                '.js', '.json',
                                '.css',
                                '.svg', '.png', '.jpg', '.gif', '.ico',
                                '.html',
                                '.eot', '.ttf', '.woff', '.woff2'
                            ]
                        }
                    },
                    module: {
                        aliases: {},
                        replacements: {}
                    }
                },
                this.getOptions ?
                    this.getOptions() :
                    (
                        this.query as
                            RecursivePartial<LoaderConfiguration> | null
                    ) ?? {}
            ),
            /#%%%#/g,
            '!'
        )

    const compile: CompileFunction = (
        template: string,
        options = givenOptions.compiler,
        compileSteps = 2
    ): TemplateFunction => (
        locals:(
            Array<Array<string>> | Array<Mapping<unknown>> | Mapping<unknown>
        ) = {}
    ): string => {
        options = {filename: template, ...options}
        const givenLocals: Array<unknown> =
            ([] as Array<unknown>).concat(locals)

        const require = (
            request: string, nestedLocals: Mapping<unknown> = {}
        ): string => {
            const template: string = request.replace(/^(.+)\?[^?]+$/, '$1')
            const queryMatch: Array<string> | null =
                /^[^?]+\?(.+)$/.exec(request)

            if (queryMatch) {
                const evaluated: EvaluationResult<Mapping<unknown>> =
                    evaluate<Mapping<unknown>>(
                        queryMatch[1],
                        {compile, locals, request, source, template}
                    )
                if (evaluated.error)
                    console.warn(
                        'Error occurred during processing given query: ' +
                        evaluated.error
                    )
                else if (evaluated.result)
                    extend(true, nestedLocals, evaluated.result)
            }

            let nestedOptions = copy(options) as CompilerOptions

            delete nestedOptions.client

            nestedOptions = extend(
                true,
                {encoding: configuration.encoding},
                nestedOptions,
                nestedLocals.options as Partial<CompilerOptions> | undefined ||
                {},
                options ?? {}
            )

            if (nestedOptions.isString)
                return compile(template, nestedOptions)(nestedLocals)

            const templateFilePath: null | string = determineModuleFilePath(
                template,
                givenOptions.module?.aliases,
                givenOptions.module?.replacements,
                {file: givenOptions.extensions?.file.internal || []},
                givenOptions.context,
                configuration.path.source.asset.base,
                configuration.path.ignore,
                configuration.module.directoryNames,
                configuration.package.main.fileNames,
                configuration.package.main.propertyNames,
                configuration.package.aliasPropertyNames,
                configuration.encoding
            )

            if (templateFilePath) {
                if (this.addDependency)
                    this.addDependency(templateFilePath)
                /*
                    NOTE: If there aren't any locals options or variables and
                    file doesn't seem to be an ejs template we simply load
                    included file content.
                */
                if (queryMatch || templateFilePath.endsWith('.ejs'))
                    return compile(templateFilePath, nestedOptions)(
                        nestedLocals
                    )

                return readFileSync(
                    templateFilePath, {encoding: nestedOptions.encoding}
                )
            }

            throw new Error(
                `Given template file "${template}" couldn't be resolved.`
            )
        }

        const compressHTML = (content: string): string =>
            minifyHTML(
                content,
                extend(
                    true,
                    {
                        caseSensitive: true,
                        collapseInlineTagWhitespace: true,
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                        minifyCSS: true,
                        minifyJS: true,
                        processScripts: [
                            'text/ng-template',
                            'text/x-handlebars-template'
                        ],
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                        sortAttributes: true,
                        sortClassName: true,
                        /*
                            NOTE: Avoids whitespace around placeholder in
                            tags.
                        */
                        trimCustomFragments: true,
                        useShortDoctype: true
                    },
                    givenOptions.compress?.html || {}
                )
            )

        let result: string | TemplateFunction = template
        const isString = Boolean(options.isString)
        delete options.isString

        // NOTE: Needed to have standalone useable js code afterwards.
        if (compileSteps % 2)
            options.client = true

        let stepLocals: Array<string> | Mapping<unknown>
        let scope: Mapping<unknown> = {}

        for (let step = 1; step <= compileSteps; step += 1) {
            // On every odd compile step we have to determine the environment.
            if (step % 2) {
                // region determine scope
                const localsIndex: number = Math.round(step / 2) - 1
                stepLocals = (localsIndex < givenLocals.length) ?
                    givenLocals[localsIndex] as
                        Array<string> | Mapping<unknown> :
                    {}
                scope = {}
                if (step < 3 && 1 < compileSteps)
                    scope = {
                        ...UTILITY_SCOPE,
                        configuration,
                        include: require,
                        require,
                        ...(Array.isArray(stepLocals) ? {} : stepLocals)
                    }
                else if (!Array.isArray(stepLocals))
                    scope = stepLocals
                // endregion
            }

            if (typeof result === 'string') {
                const filePath: string | undefined =
                    isString ? options.filename : result
                if (filePath && extname(filePath) === '.js' && currentRequire)
                    result = currentRequire(filePath) as TemplateFunction
                else {
                    if (!isString) {
                        let encoding: Encoding = configuration.encoding
                        if (typeof options.encoding === 'string')
                            encoding = options.encoding
                        result = readFileSync(result, {encoding})
                    }
                    if (step === compileSteps && givenOptions.compress?.html)
                        result = compressHTML(result)

                    if (step === compileSteps && compileSteps % 2) {
                        /*
                            We have to use the templace class directly to get
                            the generated source code.
                         */
                        const templateInstance =
                            new ejs.Template(template, options)

                        templateInstance.compile()
                        const compiledSourceCode =
                            templateInstance.source

                        result = `
                            module.exports = function(
                                ${options.localsName as string}
                            ) {
                                var escapeFn = function(value) {
                                    return String(value)
                                        .replace(
                                            /[&<>"']/g,
                                            function(char) {
                                                return {
                                                    '&': '&amp;',
                                                    '<': '&lt;',
                                                    '>': '&gt;',
                                                    '"': '&quot;',
                                                    "'": "&#39;"
                                                }[char]
                                            }
                                        )
                                };
                                var include = function() {
                                    throw new Error('Include not implemented.')
                                };
                                var rethrow = function rethrow(
                                    err, str, flnm, lineno, esc
                                ) {
                                    var lines = str.split('\\n');
                                    var start = Math.max(lineno - 3, 0);
                                    var end = Math.min(lines.length, lineno + 3);
                                    var filename = esc(flnm);
                                    // Error context
                                    var context =
                                        lines.slice(start, end)
                                             .map(function (line, i) {
                                                 var curr = i + start + 1;
                                                 return (curr == lineno ? ' >> ' : '    ')
                                                     + curr
                                                     + '| '
                                                     + line;
                                                })
                                             .join('\\n');
                                    // Alter exception message
                                    err.path = filename;
                                    err.message = (filename || 'ejs') + ':'
                                        + lineno + '\\n'
                                        + context + '\\n\\n'
                                        + err.message;
                                    throw err;
                                };
                                ${compiledSourceCode}
                            };
                        `.trim()
                    } else
                        result = ejs.compile(result, options) as
                            EJSTemplateFunction
                }
            } else {
                result = result(scope)

                if (givenOptions.compress?.html)
                    result = compressHTML(result)
            }
        }

        if (compileSteps % 2) {
            const processed: BabelFileResult | null = babelTransformSync(
                result as string,
                {
                    ast: false,
                    babelrc: false,
                    comments: !givenOptions.compress?.javaScript,
                    compact: Boolean(givenOptions.compress?.javaScript),
                    filename: options.filename || 'unknown',
                    minified: Boolean(givenOptions.compress?.javaScript),
                    presets: givenOptions.compress?.javaScript ?
                        [[
                            babelMinifyPreset, givenOptions.compress.javaScript
                        ]] :
                        [],
                    sourceMaps: false,
                    sourceType: 'script'
                }
            )

            if (typeof processed?.code === 'string')
                result = processed.code

            return `${options.strict ? `'use strict';\n` : ''}${result}`
        }

        if (typeof result === 'string') {
            result = result
                .replace(
                    new RegExp(
                        `<script +processing-workaround *` +
                        `(?: = *(?: " *"|' *') *)?>([\\s\\S]*?)</ *script *>`,
                        'ig'
                    ),
                    '$1'
                )
                .replace(
                    new RegExp(
                        `<script +processing(-+)-workaround *` +
                        `(?: = *(?: " *"|' *') *)?>([\\s\\S]*?)</ *script *>`,
                        'ig'
                    ),
                    '<script processing$1workaround>$2</script>'
                )

            return result
        }

        return ''
    }

    return compile(
        source,
        {
            ...givenOptions.compiler,
            client: Boolean((givenOptions.compileSteps ?? 2) % 2),
            compileDebug: givenOptions.debug,
            debug: givenOptions.debug,
            filename: this.resourcePath || 'unknown',
            isString: true
        },
        givenOptions.compileSteps
    )(givenOptions.locals || {})
}

export default loader
