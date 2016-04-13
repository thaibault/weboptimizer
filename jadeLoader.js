#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
import * as fileSystem from 'fs'
import * as jade from 'jade'
import * as loaderUtils from 'loader-utils'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import helper from './helper.compiled'
// endregion
module.exports = function(source) {
    if (this.cacheable)
        this.cacheable()
    const query = extend(true, this.options.jade || {}, loaderUtils.parseQuery(
        this.query))
    const locals = query.locals || {}
    delete query.locals
    const compile = (template, options = query) => {
        return locals => {
            options = extend(true, {
                filename: template, doctype: 'html',
                compileDebug: this.debug || false,
                cache: true
            }, options)
            let templateFunction
            if (options.isString)
                templateFunction = jade.compile(template, options)
            else
                templateFunction = jade.compileFile(template, options)
            return templateFunction(extend(true, {require: request => {
                let template = request.replace(/^(.+)\?[^?]+$/, '$1')
                const queryMatch = request.match(/^.+\?([^?]+)$/, '$1')
                let nestedLocals = {}
                if (queryMatch)
                    nestedLocals = (new global.Function(
                        'request', 'template', 'source', 'locals',
                        `return ${queryMatch[1]}`
                    ))(request, template, source, locals)
                const options = extend(true, {
                    encoding: 'utf-8'
                }, nestedLocals.options || {})
                if (options.isString)
                    return template
                template = helper.determineModulePath(template)
                this.addDependency(template)
                if (queryMatch || template.endsWith('.less'))
                    return compile(template, options)(nestedLocals)
                return fileSystem.readFileSync(template, options)
            }}, locals))
        }
    }
    return compile(source, {
        isString: true,
        filename: loaderUtils.getRemainingRequest(this).replace(/^!/, '')
    })(locals)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
