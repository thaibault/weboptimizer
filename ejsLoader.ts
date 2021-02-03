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
import Tools from 'clientnode'
import {EvaluationResult, Encoding, Mapping} from 'clientnode/type'
import ejs, {Options, TemplateFunction} from 'ejs'
import fileSystem from 'fs'
import {minify as minifyHTML} from 'html-minifier'
import {getOptions, getRemainingRequest} from 'loader-utils'
import path from 'path'

import configuration from './configurator'
import Helper from './helper'
import {Extensions, Replacements} from './type'
// endregion
// region types
export type CompilerOptions = Options & {
    encoding:Encoding
    isString?:boolean
}
export type CompileFunction = (
    template:string,
    options?:Partial<CompilerOptions>,
    compileSteps?:number
) => TemplateFunction
export type LoaderConfiguration = Mapping<unknown> & {
    compiler:CompilerOptions
    compileSteps:number
    compress:{
        html:Mapping<unknown>
        javaScript:Mapping<unknown>
    }
    context:string
    extensions:Extensions
    locals?:Mapping<unknown>
    module:{
        aliases:Mapping<string>
        replacements:Replacements
    }
}
// endregion
/**
 * Main transformation function.
 * @param this - Loader context.
 * @param source - Input string to transform.
 * @returns Transformed string.
 */
export default function(this:any, source:string):string {
    const givenOptions:LoaderConfiguration =
        Tools.convertSubstringInPlainObject(
            Tools.extend(
                true,
                {
                    compileSteps: 2,
                    compress: {
                        html: {},
                        javaScript: {}
                    },
                    context: './',
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
                        },
                        module: []
                    },
                    module: {
                        aliases: {},
                        replacements: {}
                    }
                },
                'query' in this ? getOptions(this) || {} : {}
            ),
            /#%%%#/g,
            '!'
        ) as LoaderConfiguration

    const compile:CompileFunction = (
        template:string,
        options:Partial<CompilerOptions> = givenOptions.compiler,
        compileSteps = 2
    ):TemplateFunction => (
        locals:Array<Array<string>>|Array<Mapping<unknown>>|Mapping<unknown> =
            {}
    ):string => {
        options = {filename: template, ...options}
        const givenLocals:Array<unknown> =
            ([] as Array<unknown>).concat(locals)

        const require:Function = (
            request:string, nestedLocals:Mapping<unknown> = {}
        ):string => {
            const template:string = request.replace(/^(.+)\?[^?]+$/, '$1')
            const queryMatch:Array<string>|null = /^[^?]+\?(.+)$/.exec(request)
            if (queryMatch) {
                const evaluated:EvaluationResult = Tools.stringEvaluate(
                    queryMatch[1], {compile, locals, request, source, template}
                )
                if (evaluated.error)
                    console.warn(
                        'Error occurred during processing given query: ' +
                        evaluated.error
                    )
                else
                    Tools.extend(true, nestedLocals, evaluated.result)
            }
            let nestedOptions:CompilerOptions =
                Tools.copy(options) as CompilerOptions
            delete nestedOptions.client
            nestedOptions = Tools.extend(
                true,
                {encoding: configuration.encoding},
                nestedOptions,
                nestedLocals.options || {},
                options
            )
            if (nestedOptions.isString)
                return compile(template, nestedOptions)(nestedLocals)
            const templateFilePath:null|string =
                Helper.determineModuleFilePath(
                    template,
                    givenOptions.module.aliases,
                    givenOptions.module.replacements,
                    {file: givenOptions.extensions.file.internal},
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
                if ('addDependency' in this)
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
                return fileSystem.readFileSync(
                    templateFilePath, {encoding: nestedOptions.encoding}
                ) as unknown as string
            }
            throw new Error(
                `Given template file "${template}" couldn't be resolved.`
            )
        }

        const compressHTML:Function = (content:string):string =>
            givenOptions.compress.html ?
                minifyHTML(
                    content,
                    Tools.extend(
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
                        givenOptions.compress.html
                    )
                ) :
                content

        let result:string|TemplateFunction = template
        const isString:boolean = Boolean(options.isString)
        delete options.isString

        let stepLocals:Array<string>|Mapping<unknown>
        let scope:Mapping<any>
        let originalScopeNames:Array<string>
        let scopeNames:Array<string>

        for (let step:number = 1; step <= compileSteps; step += 1) {
            // On every odd compile step we have to determine the environment.
            if (step % 2) {
                // region determine scope
                const localsIndex:number = Math.round(step / 2) - 1
                stepLocals = (localsIndex < givenLocals.length) ?
                    givenLocals[localsIndex] as
                        Array<string>|Mapping<unknown> :
                    {}
                scope = {}
                if (step < 3 && 1 < compileSteps)
                    scope = {
                        configuration,
                        Helper,
                        include: require,
                        require,
                        Tools,
                        ...(Array.isArray(stepLocals) ? {} : stepLocals)
                    }
                else if (!Array.isArray(stepLocals))
                    scope = stepLocals


                originalScopeNames =
                    Array.isArray(stepLocals) ? stepLocals : Object.keys(scope)
                scopeNames = originalScopeNames.map((name:string):string =>
                    Tools.stringConvertToValidVariableName(name)
                )
                // endregion
            }
            if (typeof result === 'string') {
                const filePath:string|undefined =
                    isString ? options.filename : result
                if (filePath && path.extname(filePath) === '.js')
                    result = eval('require')(filePath)
                else {
                    if (!isString) {
                        let encoding:Encoding = configuration.encoding
                        if (typeof options.encoding === 'string')
                            encoding = options.encoding
                        result = fileSystem.readFileSync(result, {encoding})
                    }
                    if (step === compileSteps)
                        result = compressHTML(result)

                    if (options.strict || !options._with)
                        // NOTE: Needed to manipulate code after compiling.
                        options.client = true

                    result = ejs.compile(result as string, options) as
                        TemplateFunction

                    /*
                        Provide all scope names when "_with" options isn't
                        enabled
                    */
                    if (options.strict || !options._with) {
                        let localsName:string = options.localsName || 'locals'
                        while (scopeNames!.includes(localsName))
                            localsName = `_${localsName}`
                        result = new Function(
                            ...scopeNames!,
                            localsName,
                            `return ${result.toString()}(` +
                            `${localsName},${localsName}.escapeFn,include,` +
                            `${localsName}.rethrow)`
                        ) as TemplateFunction
                    }
                }
            } else
                result = compressHTML(!options.strict && options._with ?
                    (result as Function)(
                        scope!, scope!.escapeFn, scope!.include
                    ) :
                    result(
                        /*
                            NOTE: We want to be ensure to have same ordering as
                            we have for the scope names and to call internal
                            registered getter by retrieving values. So simple
                            using "...Object.values(scope)" is not appreciate
                            here.
                        */
                        ...originalScopeNames!
                            .map((name:string):any => scope[name])
                            .concat(
                                !options.strict && options._with ? [] : scope!
                            )
                    )
                )
        }

        if (compileSteps % 2) {
            let code = `module.exports = ${result.toString()}`

            const processed:BabelFileResult|null = babelTransformSync(
                code,
                {
                    ast: false,
                    babelrc: false,
                    comments: !givenOptions.compress.javaScript,
                    compact: Boolean(givenOptions.compress.javaScript),
                    filename: options.filename || 'unknown',
                    minified: Boolean(givenOptions.compress.javaScript),
                    presets: givenOptions.compress.javaScript ?
                        [[
                            babelMinifyPreset, givenOptions.compress.javaScript
                        ]] :
                        [],
                    sourceMaps: false,
                    sourceType: 'script'
                }
            )
            if (typeof processed?.code === 'string')
                code = processed.code
            return `${options.strict ? "'use strict';\n" : ''}${code}`
        }

        if (typeof result === 'string') {
            result = result
                .replace(
                    new RegExp(
                        `<script +processing-workaround *` +
                        `(?:= *(?:" *"|' *') *)?>([\\s\\S]*?)</ *script *>`,
                        'ig'
                    ),
                    '$1'
                )
                .replace(
                    new RegExp(
                        `<script +processing(-+)-workaround *` +
                        `(?:= *(?:" *"|' *') *)?>([\\s\\S]*?)</ *script *>`,
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
            client: Boolean(givenOptions.compileSteps % 2),
            compileDebug: this.debug || false,
            debug: this.debug || false,
            filename:
                'remainingRequest' in this ?
                    getRemainingRequest(this).replace(/^!/, '') :
                    this.resourcePath || 'unknown',
            isString: true,
            localsName: 'scope'
        },
        givenOptions.compileSteps
    )(givenOptions.locals || {})
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
