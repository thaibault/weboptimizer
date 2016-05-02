#!/usr/bin/env node
// @flow
// -*- coding: utf-8 -*-
'use strict'
export type InternalInject = string|Array<string>|{[key:string]:string}
export type ExternalInject = string|Function|RegExp|Array<ExternalInject>
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
