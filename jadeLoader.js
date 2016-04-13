#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
import * as jade from 'jade'
import * as jadeLoader from 'jade-loader'
import * as loaderUtils from 'loader-utils'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
// endregion
module.exports = function(source) {
    if (this.cacheable)
        this.cacheable()
    const query = extend(true, this.options.jade || {}, loaderUtils.parseQuery(
        this.query))
    const request = loaderUtils.getRemainingRequest(this).replace(/^!/, '')
    const locals = query.locals || {}
    delete query.locals
    const compile = (filePath=request, options=query) => {
        return locals => {
            return jade.compile(source, extend(true, {
                filename: filePath, doctype: 'html',
                compileDebug: this.debug || false
            }, options))(extend(true, {require: request => {
                this.resolve(this.context, request, (error, result) => {
                    if (!error)
                        this.addDependency(result)
                    if (result.endsWith('.jade'))
                        return compile(result)
                    return result
                })
                // TODO
                return 'TEST'
            }}))
        }
    }
    return compile()(locals)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
