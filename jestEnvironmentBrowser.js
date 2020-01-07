#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict';
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

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.BrowserEnvironment = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var BrowserEnvironment =
/*#__PURE__*/
function () {
  function BrowserEnvironment() {
    (0, _classCallCheck2["default"])(this, BrowserEnvironment);
  }

  (0, _createClass2["default"])(BrowserEnvironment, [{
    key: "setup",

    /**
     * @returns Nothing.
     */
    value: function setup() {
      return Promise.resolve();
    }
    /**
     * @returns Nothing.
     */

  }, {
    key: "teardown",
    value: function teardown() {}
    /**
     * @returns Null.
     */

  }, {
    key: "runScript",
    value: function runScript() {
      return null;
    }
  }]);
  return BrowserEnvironment;
}();

exports.BrowserEnvironment = BrowserEnvironment;
var _default = BrowserEnvironment; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

exports["default"] = _default;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImplc3RFbnZpcm9ubWVudEJyb3dzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQWNBOzs7Ozs7Ozs7Ozs7Ozs7SUFHYSxrQjs7Ozs7Ozs7OztBQUNUOzs7NEJBR1E7QUFDSixhQUFPLE9BQU8sQ0FBQyxPQUFSLEVBQVA7QUFDSDtBQUNEOzs7Ozs7K0JBR1csQ0FBRTtBQUNiOzs7Ozs7Z0NBR1k7QUFDUixhQUFPLElBQVA7QUFDSDs7Ozs7O2VBR1Usa0IsRUFDZjtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJqZXN0RW52aXJvbm1lbnRCcm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgW1Byb2plY3QgcGFnZV0oaHR0cHM6Ly90b3JiZW4ud2Vic2l0ZS93ZWJPcHRpbWl6ZXIpXG5cbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnNcbiAgICBuYW1pbmcgMy4wIHVucG9ydGVkIGxpY2Vuc2UuXG4gICAgU2VlIGh0dHBzOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgZGVmYXVsdCBicm93c2VyIGVudmlyb25tZW50IHRvIHJ1biBzY3JpcHQgY29udGV4dCBpbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEJyb3dzZXJFbnZpcm9ubWVudCB7XG4gICAgLyoqXG4gICAgICogQHJldHVybnMgTm90aGluZy5cbiAgICAgKi9cbiAgICBzZXR1cCgpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfVxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIE5vdGhpbmcuXG4gICAgICovXG4gICAgdGVhcmRvd24oKSB7fVxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIE51bGwuXG4gICAgICovXG4gICAgcnVuU2NyaXB0KCkge1xuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQnJvd3NlckVudmlyb25tZW50XG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==