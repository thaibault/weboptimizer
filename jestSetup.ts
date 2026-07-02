// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module webpackConfigurator */
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
import {globalContext, optionalImport} from 'clientnode'
import {TextEncoder, TextDecoder} from 'util'

;(globalContext as typeof globalContext & {TextEncoder: typeof TextEncoder})
    .TextEncoder = TextEncoder
;(globalContext as typeof globalContext & {TextDecoder: typeof TextDecoder})
    .TextDecoder = TextDecoder

if (await optionalImport('jest-canvas-mock'))
    console.info('Canvas mocking module loaded.')
