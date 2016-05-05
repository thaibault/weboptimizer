#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
// region imports
import * as fileSystem from 'fs'
import * as jade from 'jade'
import * as loaderUtils from 'loader-utils'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import Helper from './helper.compiled'
// endregion
// region declarations
declare function TemplateFunction(locals:Object):string
declare function CompileFunction(
    template:string, options:Object
):TemplateFunction
declare function EvaluationFunction(
    request:string, template:string, source:string, compile:CompileFunction,
    locals:Object
):Object
// endregion
module.exports = function(source:string):string {
    if (this.cacheable)
        this.cacheable()
    const query:Object = Helper.extendObject(true, {
        moduleAliases: [], knownExtensions: ['.jade', '.html', '.js', '.css'],
        context: './'
    }, this.options.jade || {}, loaderUtils.parseQuery(this.query))
    const compile:CompileFunction = (
        template:string, options:Object = query.compiler
    ):TemplateFunction => (locals:Object = {}):string => {
        options = Helper.extendObject(true, {
            filename: template, doctype: 'html',
            compileDebug: this.debug || false
        }, options)
        let templateFunction:TemplateFunction
        if (options.isString) {
            delete options.isString
            templateFunction = jade.compile(template, options)
        } else
            templateFunction = jade.compileFile(template, options)
        return templateFunction(Helper.extendObject(true, {
            require: (request:string):string => {
                const template:string = request.replace(/^(.+)\?[^?]+$/, '$1')
                const queryMatch:?Array<string> = request.match(
                    /^.+\?([^?]+)$/, '$1')
                let nestedLocals:Object = {}
                if (queryMatch) {
                    const evaluationFunction:EvaluationFunction = new Function(
                        'request', 'template', 'source', 'compile', 'locals',
                        `return ${queryMatch[1]}`)
                    nestedLocals = evaluationFunction(
                        request, template, source, compile, locals)
                }
                const options:Object = Helper.extendObject(true, {
                    encoding: 'utf-8'
                }, nestedLocals.options || {})
                if (options.isString)
                    return template
                const templateFilePath:string = Helper.determineModulePath(
                    template, Helper.convertPlainObjectToMap(
                        query.moduleAliases
                    ), query.knownExtensions, query.context)
                this.addDependency(templateFilePath)
                if (queryMatch || templateFilePath.endsWith('.less'))
                    return compile(templateFilePath, options)(nestedLocals)
                return fileSystem.readFileSync(templateFilePath, options)
            }}, locals))
    }
    return compile(source, Helper.extendObject(true, {
        isString: true,
        filename: loaderUtils.getRemainingRequest(this).replace(/^!/, '')
    }, query.compiler || {}))(query.locals || {})
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
