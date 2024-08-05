// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module webpackConfigurator */
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
import {$Global, globalContext} from 'clientnode'
import {TextEncoder, TextDecoder} from 'util'
// endregion
;(globalContext as $Global & {TextEncoder:typeof TextEncoder}).TextEncoder =
    TextEncoder
;(globalContext as $Global & {TextDecoder:typeof TextDecoder}).TextDecoder =
    TextDecoder
try {
    if ((eval('require') as typeof require)('jest-canvas-mock'))
        console.info('Canvas mocking module loaded.')
/* eslint-disable @typescript-eslint/no-unused-vars */
} catch (error) {
/* eslint-enable @typescript-eslint/no-unused-vars */
    // Do nothing.
}
