// #!/usr/bin/env node
// -*- coding: utf-8 -*-
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
exports["default"] = exports.createBrowserAPI = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// endregion
// region variables
var onCreatedListener = [];
var browserAPI; // endregion
// region ensure presence of common browser environment

if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') {
  // region mock browser environment
  var path = require('path');

  var _require = require('jsdom'),
      JSDOM = _require.JSDOM,
      VirtualConsole = _require.VirtualConsole;

  var virtualConsole = new VirtualConsole();

  for (var _i = 0, _arr = ['assert', 'dir', 'info', 'log', 'time', 'timeEnd', 'trace', 'warn']; _i < _arr.length; _i++) {
    var name = _arr[_i];
    virtualConsole.on(name, console[name].bind(console));
  }

  virtualConsole.on('error', function (error) {
    if (!browserAPI.debug && ['XMLHttpRequest', 'resource loading' // IgnoreTypeCheck
    ].includes(error.type)) console.warn("Loading resource failed: ".concat(error.toString(), "."));else // IgnoreTypeCheck
      console.error(error.stack, error.detail);
  });

  var render = function render(template) {
    var window = new JSDOM(template, {
      resources: 'usable',
      runScripts: 'dangerously',
      url: 'http://localhost',
      virtualConsole: virtualConsole
    }).window;
    browserAPI = {
      debug: false,
      domContentLoaded: false,
      DOM: JSDOM,
      window: window,
      windowLoaded: false
    };
    window.addEventListener('load', function () {
      // NOTE: Maybe we have miss the "DOMContentLoaded" event.
      browserAPI.domContentLoaded = true;
      browserAPI.windowLoaded = true;
    });
    window.document.addEventListener('DOMContentLoaded', function () {
      browserAPI.domContentLoaded = true;
    });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = onCreatedListener[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var callback = _step.value;
        callback(browserAPI, false);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return window;
  };

  if (typeof NAME === 'undefined' || NAME === 'webOptimizer') {
    var filePath = path.join(__dirname, 'index.html.ejs');
    /*
        NOTE: We load dependencies now to avoid having file imports after
        test runner has finished to isolate the environment.
    */

    var ejsLoader = require('./ejsLoader.compiled.js');

    require('fs').readFile(filePath, {
      encoding: 'utf-8'
    }, function (error, content) {
      if (error) throw error;
      render(ejsLoader.bind({
        filename: filePath
      })(content));
    });
  } else // IgnoreTypeCheck
    render(require('webOptimizerDefaultTemplateFilePath')); // endregion

} else {
  browserAPI = {
    debug: false,
    domContentLoaded: false,
    DOM: null,
    window: window,
    windowLoaded: false
  };
  window.document.addEventListener('DOMContentLoaded', function () {
    browserAPI.domContentLoaded = true;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = onCreatedListener[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var callback = _step2.value;
        callback(browserAPI, false);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
          _iterator2["return"]();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });
  window.addEventListener('load', function () {
    browserAPI.windowLoaded = true;
  });
} // endregion

/**
 * Provides a generic browser api in node or web contexts.
 * @param replaceWindow - Indicates whether a potential existing window object
 * should be replaced or not.
 * @returns Determined environment.
 */


var createBrowserAPI =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee() {
    var replaceWindow,
        resolvePromise,
        promise,
        wrappedCallback,
        _args = arguments;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            replaceWindow = _args.length > 0 && _args[0] !== undefined ? _args[0] : true;
            promise = new Promise(function (resolve) {
              resolvePromise = resolve;
            });
            /*
                NOTE: We have to define window globally before anything is loaded to
                ensure that all future instances share the same window object.
            */

            wrappedCallback = function wrappedCallback() {
              if (replaceWindow && typeof global !== 'undefined' && global !== browserAPI.window) global.window = browserAPI.window;
              resolvePromise(browserAPI);
            };

            if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') browserAPI ? wrappedCallback(browserAPI, true) : onCreatedListener.push(wrappedCallback);else browserAPI.domContentLoaded ? wrappedCallback(browserAPI, true) : onCreatedListener.push(wrappedCallback);
            return _context.abrupt("return", promise);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function createBrowserAPI() {
    return _ref.apply(this, arguments);
  };
}();

exports.createBrowserAPI = createBrowserAPI;
var _default = createBrowserAPI; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

exports["default"] = _default;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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OztBQUFBLGtCQUFoQixnQkFBZ0I7QUFBQTtBQUFBO0FBQUEsR0FBdEI7OztlQWlDUSxnQixFQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJyb3dzZXJBUEkuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAjIS91c3IvYmluL2VudiBub2RlXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zXG4gICAgbmFtaW5nIDMuMCB1bnBvcnRlZCBsaWNlbnNlLlxuICAgIFNlZSBodHRwczovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHR5cGUge1dpbmRvd30gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB0eXBlIHtCcm93c2VyQVBJfSBmcm9tICcuL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBkZWNsYXJhdGlvblxuZGVjbGFyZSB2YXIgTkFNRTpzdHJpbmdcbmRlY2xhcmUgdmFyIFRBUkdFVF9URUNITk9MT0dZOnN0cmluZ1xuZGVjbGFyZSB2YXIgd2luZG93OldpbmRvd1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gdmFyaWFibGVzXG5jb25zdCBvbkNyZWF0ZWRMaXN0ZW5lcjpBcnJheTxGdW5jdGlvbj4gPSBbXVxubGV0IGJyb3dzZXJBUEk6QnJvd3NlckFQSVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gZW5zdXJlIHByZXNlbmNlIG9mIGNvbW1vbiBicm93c2VyIGVudmlyb25tZW50XG5pZiAodHlwZW9mIFRBUkdFVF9URUNITk9MT0dZID09PSAndW5kZWZpbmVkJyB8fCBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ25vZGUnKSB7XG4gICAgLy8gcmVnaW9uIG1vY2sgYnJvd3NlciBlbnZpcm9ubWVudFxuICAgIGNvbnN0IHBhdGg6T2JqZWN0ID0gcmVxdWlyZSgncGF0aCcpXG4gICAgY29uc3Qge0pTRE9NLCBWaXJ0dWFsQ29uc29sZX0gPSByZXF1aXJlKCdqc2RvbScpXG4gICAgY29uc3QgdmlydHVhbENvbnNvbGU6T2JqZWN0ID0gbmV3IFZpcnR1YWxDb25zb2xlKClcbiAgICBmb3IgKGNvbnN0IG5hbWU6c3RyaW5nIG9mIFtcbiAgICAgICAgJ2Fzc2VydCcsICdkaXInLCAnaW5mbycsICdsb2cnLCAndGltZScsICd0aW1lRW5kJywgJ3RyYWNlJywgJ3dhcm4nXG4gICAgXSlcbiAgICAgICAgdmlydHVhbENvbnNvbGUub24obmFtZSwgY29uc29sZVtuYW1lXS5iaW5kKGNvbnNvbGUpKVxuICAgIHZpcnR1YWxDb25zb2xlLm9uKCdlcnJvcicsIChlcnJvcjpFcnJvcik6dm9pZCA9PiB7XG4gICAgICAgIGlmICghYnJvd3NlckFQSS5kZWJ1ZyAmJiBbXG4gICAgICAgICAgICAnWE1MSHR0cFJlcXVlc3QnLCAncmVzb3VyY2UgbG9hZGluZydcbiAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgIF0uaW5jbHVkZXMoZXJyb3IudHlwZSkpXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYExvYWRpbmcgcmVzb3VyY2UgZmFpbGVkOiAke2Vycm9yLnRvU3RyaW5nKCl9LmApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvci5zdGFjaywgZXJyb3IuZGV0YWlsKVxuICAgIH0pXG4gICAgY29uc3QgcmVuZGVyOkZ1bmN0aW9uID0gKHRlbXBsYXRlOnN0cmluZyk6V2luZG93ID0+IHtcbiAgICAgICAgY29uc3Qgd2luZG93OldpbmRvdyA9IChuZXcgSlNET00odGVtcGxhdGUsIHtcbiAgICAgICAgICAgIHJlc291cmNlczogJ3VzYWJsZScsXG4gICAgICAgICAgICBydW5TY3JpcHRzOiAnZGFuZ2Vyb3VzbHknLFxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdCcsXG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZVxuICAgICAgICB9KSkud2luZG93XG4gICAgICAgIGJyb3dzZXJBUEkgPSB7XG4gICAgICAgICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgICAgICAgICBkb21Db250ZW50TG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIERPTTogSlNET00sXG4gICAgICAgICAgICB3aW5kb3csXG4gICAgICAgICAgICB3aW5kb3dMb2FkZWQ6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKTp2b2lkID0+IHtcbiAgICAgICAgICAgIC8vIE5PVEU6IE1heWJlIHdlIGhhdmUgbWlzcyB0aGUgXCJET01Db250ZW50TG9hZGVkXCIgZXZlbnQuXG4gICAgICAgICAgICBicm93c2VyQVBJLmRvbUNvbnRlbnRMb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICBicm93c2VyQVBJLndpbmRvd0xvYWRlZCA9IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgd2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGJyb3dzZXJBUEkuZG9tQ29udGVudExvYWRlZCA9IHRydWVcbiAgICAgICAgfSlcbiAgICAgICAgZm9yIChjb25zdCBjYWxsYmFjazpGdW5jdGlvbiBvZiBvbkNyZWF0ZWRMaXN0ZW5lcilcbiAgICAgICAgICAgIGNhbGxiYWNrKGJyb3dzZXJBUEksIGZhbHNlKVxuICAgICAgICByZXR1cm4gd2luZG93XG4gICAgfVxuICAgIGlmICh0eXBlb2YgTkFNRSA9PT0gJ3VuZGVmaW5lZCcgfHwgTkFNRSA9PT0gJ3dlYk9wdGltaXplcicpIHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2luZGV4Lmh0bWwuZWpzJylcbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFdlIGxvYWQgZGVwZW5kZW5jaWVzIG5vdyB0byBhdm9pZCBoYXZpbmcgZmlsZSBpbXBvcnRzIGFmdGVyXG4gICAgICAgICAgICB0ZXN0IHJ1bm5lciBoYXMgZmluaXNoZWQgdG8gaXNvbGF0ZSB0aGUgZW52aXJvbm1lbnQuXG4gICAgICAgICovXG4gICAgICAgIGNvbnN0IGVqc0xvYWRlciA9IHJlcXVpcmUoJy4vZWpzTG9hZGVyLmNvbXBpbGVkLmpzJylcbiAgICAgICAgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZShcbiAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAge2VuY29kaW5nOiAndXRmLTgnfSxcbiAgICAgICAgICAgIChlcnJvcjo/RXJyb3IsIGNvbnRlbnQ6c3RyaW5nKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgICAgICAgICAgcmVuZGVyKGVqc0xvYWRlci5iaW5kKFxuICAgICAgICAgICAgICAgICAgICB7ZmlsZW5hbWU6IGZpbGVQYXRofVxuICAgICAgICAgICAgICAgICkoY29udGVudCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICB9IGVsc2VcbiAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgIHJlbmRlcihyZXF1aXJlKCd3ZWJPcHRpbWl6ZXJEZWZhdWx0VGVtcGxhdGVGaWxlUGF0aCcpKVxuICAgIC8vIGVuZHJlZ2lvblxufSBlbHNlIHtcbiAgICBicm93c2VyQVBJID0ge1xuICAgICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgICAgIGRvbUNvbnRlbnRMb2FkZWQ6IGZhbHNlLFxuICAgICAgICBET006IG51bGwsXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93TG9hZGVkOiBmYWxzZVxuICAgIH1cbiAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpOnZvaWQgPT4ge1xuICAgICAgICBicm93c2VyQVBJLmRvbUNvbnRlbnRMb2FkZWQgPSB0cnVlXG4gICAgICAgIGZvciAoY29uc3QgY2FsbGJhY2s6RnVuY3Rpb24gb2Ygb25DcmVhdGVkTGlzdGVuZXIpXG4gICAgICAgICAgICBjYWxsYmFjayhicm93c2VyQVBJLCBmYWxzZSlcbiAgICB9KVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCk6dm9pZCA9PiB7XG4gICAgICAgIGJyb3dzZXJBUEkud2luZG93TG9hZGVkID0gdHJ1ZVxuICAgIH0pXG59XG4vLyBlbmRyZWdpb25cbi8qKlxuICogUHJvdmlkZXMgYSBnZW5lcmljIGJyb3dzZXIgYXBpIGluIG5vZGUgb3Igd2ViIGNvbnRleHRzLlxuICogQHBhcmFtIHJlcGxhY2VXaW5kb3cgLSBJbmRpY2F0ZXMgd2hldGhlciBhIHBvdGVudGlhbCBleGlzdGluZyB3aW5kb3cgb2JqZWN0XG4gKiBzaG91bGQgYmUgcmVwbGFjZWQgb3Igbm90LlxuICogQHJldHVybnMgRGV0ZXJtaW5lZCBlbnZpcm9ubWVudC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNyZWF0ZUJyb3dzZXJBUEkgPSBhc3luYyAoXG4gICAgcmVwbGFjZVdpbmRvdzpib29sZWFuID0gdHJ1ZVxuKTpQcm9taXNlPE9iamVjdD4gPT4ge1xuICAgIGxldCByZXNvbHZlUHJvbWlzZTpGdW5jdGlvblxuICAgIGNvbnN0IHByb21pc2U6UHJvbWlzZTxPYmplY3Q+ID0gbmV3IFByb21pc2UoKHJlc29sdmU6RnVuY3Rpb24pOnZvaWQgPT4ge1xuICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmVcbiAgICB9KVxuICAgIC8qXG4gICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gZGVmaW5lIHdpbmRvdyBnbG9iYWxseSBiZWZvcmUgYW55dGhpbmcgaXMgbG9hZGVkIHRvXG4gICAgICAgIGVuc3VyZSB0aGF0IGFsbCBmdXR1cmUgaW5zdGFuY2VzIHNoYXJlIHRoZSBzYW1lIHdpbmRvdyBvYmplY3QuXG4gICAgKi9cbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2s6RnVuY3Rpb24gPSAoLi4ucGFyYW1ldGVyOkFycmF5PGFueT4pOnZvaWQgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICByZXBsYWNlV2luZG93ICYmXG4gICAgICAgICAgICB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgICAgICAgZ2xvYmFsICE9PSBicm93c2VyQVBJLndpbmRvd1xuICAgICAgICApXG4gICAgICAgICAgICBnbG9iYWwud2luZG93ID0gYnJvd3NlckFQSS53aW5kb3dcbiAgICAgICAgcmVzb2x2ZVByb21pc2UoYnJvd3NlckFQSSlcbiAgICB9XG4gICAgaWYgKFxuICAgICAgICB0eXBlb2YgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIFRBUkdFVF9URUNITk9MT0dZID09PSAnbm9kZSdcbiAgICApXG4gICAgICAgIGJyb3dzZXJBUEkgP1xuICAgICAgICAgICAgd3JhcHBlZENhbGxiYWNrKGJyb3dzZXJBUEksIHRydWUpIDpcbiAgICAgICAgICAgIG9uQ3JlYXRlZExpc3RlbmVyLnB1c2god3JhcHBlZENhbGxiYWNrKVxuICAgIGVsc2VcbiAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID9cbiAgICAgICAgICAgIHdyYXBwZWRDYWxsYmFjayhicm93c2VyQVBJLCB0cnVlKSA6XG4gICAgICAgICAgICBvbkNyZWF0ZWRMaXN0ZW5lci5wdXNoKHdyYXBwZWRDYWxsYmFjaylcbiAgICByZXR1cm4gcHJvbWlzZVxufVxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQnJvd3NlckFQSVxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=