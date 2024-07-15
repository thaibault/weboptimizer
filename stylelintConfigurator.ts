// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module stylelintConfigurator */
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
import getConfiguration from './configurator'
import {ResolvedConfiguration} from './type'
// endregion
const configuration:ResolvedConfiguration = getConfiguration()

module.exports = configuration.stylelint

export default module.exports
