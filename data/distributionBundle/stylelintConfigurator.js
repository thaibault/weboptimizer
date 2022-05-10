// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-

/** @module stylelintConfigurator */
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

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _configurator = _interopRequireDefault(require("./configurator"));

// endregion
var configuration = (0, _configurator["default"])();
module.exports = configuration.stylelint;
var _default = module.exports; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

exports["default"] = _default;
