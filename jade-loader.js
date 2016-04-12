#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// region imports
import extend from 'extend'
import * as jade from 'jade'
import * as loaderUtils from 'loader-utils'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
// endregion
/**
 * Provides a generic jade loader.
 * @param {string} source Jade content.
 * @return {string} The rendered html.
 */
export default function jadeLoader(source) {
    if (this.cacheable)
        this.cacheable(true)
    const query = loaderUtils.parseQuery(this.query)
    const request = loaderUtils.getRemainingRequest(this).replace(/^!/, '')
    const locals = query.locals
    delete query.locals
    return jade.compile(source, extend(true, {
        filename: request,
        doctype: 'html',
        compileDebug: this.debug || false
    }, query))(locals)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
