#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
import * as fileSystem from 'fs'
import path from 'path'
import * as jade from 'jade'
import * as loaderUtils from 'loader-utils'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}

import configuration from './configurator.compiled'
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
                const query = request.replace(/^.+\?([^?]+)$/, '$1')
                let locals = {}
                if (query)
                    locals = (new global.Function(
                        'request', 'template', `return ${query}`
                    ))(request, template)
                const options = extend(true, {
                    encoding: 'utf-8'
                }, locals.options || {})
                if (!options.isString) {
                    console.log()
                    console.log(template)
                    global.Object.keys(configuration.moduleAliases).forEach(
                        search => {
                            template = template.replace(
                                search, configuration.moduleAliases[search])
                        }
                    )
                    template = path.join(configuration.path.context, template)
                    for (let extension of configuration.knownExtensions)
                        try {
                            fileSystem.accessSync(
                                `template${extension}`, fileSystem.F_OK)
                            template += extension
                            break
                        } catch (error) {}
                    console.log(template)
                    console.log()
                    this.addDependency(template)
                }
                if (query || template.endsWith('.less'))
                    return compile(template, options)(locals)
                if (options.isString)
                    return template
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
