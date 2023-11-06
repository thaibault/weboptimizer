// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module type */
'use strict';

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
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskTypes = exports.SubConfigurationTypes = void 0;
// endregion
// region exports
/// region generic
/// endregion
/// region injection
/// endregion
/// region configuration
//// region path
//// endregion
//// region build
var SubConfigurationTypes = exports.SubConfigurationTypes = ['debug', 'document', 'test', 'test:browser'];
var TaskTypes = exports.TaskTypes = ['build', 'serve'].concat(SubConfigurationTypes);
//// endregion
//// region loader

//// endregion

/* eslint-disable max-len */

/* eslint-enable max-len */

/// endregion
// NOTE: Not yet defined in webpack types.

// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
