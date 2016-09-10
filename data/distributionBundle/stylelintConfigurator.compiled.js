#!/usr/bin/env node


// -*- coding: utf-8 -*-
'use strict';
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
// NOTE: Only needed for debugging this file.

var _configurator = require('./configurator.compiled');

var _configurator2 = _interopRequireDefault(_configurator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

try {
    require('source-map-support/register');
} catch (error) {}

// endregion
module.exports = _configurator2.default.stylelint;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlbGludENvbmZpZ3VyYXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUFXQTtBQUNBOztBQUtBOzs7Ozs7QUFKQSxJQUFJO0FBQ0EsWUFBUSw2QkFBUjtBQUNILENBRkQsQ0FFRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUdsQjtBQUNBLE9BQU8sT0FBUCxHQUFpQix1QkFBYyxTQUEvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InN0eWxlbGludENvbmZpZ3VyYXRvci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbi8vIGVuZHJlZ2lvblxubW9kdWxlLmV4cG9ydHMgPSBjb25maWd1cmF0aW9uLnN0eWxlbGludFxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=