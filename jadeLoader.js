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
module.exports = function(source:string) {
    if (this.cacheable)
        this.cacheable()
    const query = Helper.extendObject(true, {
        moduleAliases: [], knownExtensions: ['.jade', '.html', '.js', '.css'],
        context: './'
    }, this.options.jade || {}, loaderUtils.parseQuery(this.query))
    const compile = (template, options = query.compiler) => (locals = {}) => {
        options = Helper.extendObject(true, {
            filename: template, doctype: 'html',
            compileDebug: this.debug || false
        }, options)
        let templateFunction
        if (options.isString) {
            delete options.isString
            templateFunction = jade.compile(template, options)
        } else
            templateFunction = jade.compileFile(template, options)
        return templateFunction(Helper.extendObject(true, {
            require: request => {
                let template = request.replace(/^(.+)\?[^?]+$/, '$1')
                const queryMatch = request.match(/^.+\?([^?]+)$/, '$1')
                let nestedLocals = {}
                if (queryMatch)
                    nestedLocals = (new global.Function(
                        'request', 'template', 'source', 'compile', 'locals',
                        `return ${queryMatch[1]}`
                    ))(request, template, source, compile, locals)
                const options = Helper.extendObject(true, {
                    encoding: 'utf-8'
                }, nestedLocals.options || {})
                if (options.isString)
                    return template
                template = Helper.determineModulePath(
                    template, query.moduleAliases, query.knownExtensions,
                    query.context)
                this.addDependency(template)
                if (queryMatch || template.endsWith('.less'))
                    return compile(template, options)(nestedLocals)
                return fileSystem.readFileSync(template, options)
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
