// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module jestEnvironmentBrowser */
'use strict'
/* !
    region header
    [Project page](https://torben.website/webOptimizer)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
/**
 * Implements the default browser environment to run script context in.
 */
export class BrowserEnvironment {
    /**
     * @returns Nothing.
     */
    setup():Promise<void> {
        return Promise.resolve()
    }
    /**
     * @returns Nothing.
     */
    teardown():void {
        return
    }
    /**
     * @returns Null.
     */
    runScript():null {
        return null
    }
}

export default BrowserEnvironment
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
