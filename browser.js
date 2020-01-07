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
exports["default"] = exports.getInitializedBrowser = exports.browser = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _clientnode = _interopRequireDefault(require("clientnode"));

// endregion
// region variables
var onCreatedListener = [];
var browser = {
  debug: false,
  domContentLoaded: false,
  DOM: null,
  initialized: false,
  instance: null,
  window: null,
  windowLoaded: false
}; // endregion
// region ensure presence of common browser environment

exports.browser = browser;
if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') // region mock browser environment
  Promise.all([Promise.resolve().then(function () {
    return (0, _interopRequireWildcard2["default"])(require('path'));
  }), Promise.resolve().then(function () {
    return (0, _interopRequireWildcard2["default"])(require('jsdom'));
  })]).then(function (_ref) {
    var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
        path = _ref2[0],
        _ref2$ = _ref2[1],
        JSDOM = _ref2$.JSDOM,
        VirtualConsole = _ref2$.VirtualConsole;

    var virtualConsole = new VirtualConsole();

    for (var _i = 0, _arr = ['assert', 'dir', 'info', 'log', 'time', 'timeEnd', 'trace', 'warn']; _i < _arr.length; _i++) {
      var name = _arr[_i];
      virtualConsole.on(name, console[name].bind(console));
    }

    virtualConsole.on('error', function (error) {
      if (!browser.debug && ['XMLHttpRequest', 'resource loading'].includes(error.type)) console.warn("Loading resource failed: ".concat(error.toString(), "."));else console.error(error.stack, error.detail);
    });

    var render = function render(template) {
      browser.DOM = JSDOM;
      browser.initialized = true;
      browser.instance = new JSDOM(template, {
        beforeParse: function beforeParse(window) {
          browser.window = window;
          window.document.addEventListener('DOMContentLoaded', function () {
            browser.domContentLoaded = true;
          });
          window.addEventListener('load', function () {
            /*
                NOTE: Maybe we have miss the "DOMContentLoaded"
                event caused by a race condition.
            */
            browser.domContentLoaded = browser.windowLoaded = true;
          });
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = onCreatedListener[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var callback = _step.value;
              callback();
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
        },
        resources: 'usable',
        runScripts: 'dangerously',
        url: 'http://localhost',
        virtualConsole: virtualConsole
      });
    };

    if (typeof NAME === 'undefined' || NAME === 'webOptimizer') {
      var filePath = path.join(__dirname, 'index.html.ejs');
      /*
          NOTE: We load dependencies now to avoid having file imports
          after test runner has finished to isolate the environment.
      */

      Promise.resolve().then(function () {
        return (0, _interopRequireWildcard2["default"])(require('./ejsLoader.js'));
      }).then(function (_ref3) {
        var ejsLoader = _ref3["default"];
        return require('fs').readFile(filePath, {
          encoding: 'utf-8'
        }, function (error, content) {
          if (error) throw error;
          render(ejsLoader.bind({
            filename: filePath
          })(content));
        });
      });
    } else // @ts-ignore: Will be available at runtime.
      Promise.resolve().then(function () {
        return (0, _interopRequireWildcard2["default"])(require('webOptimizerDefaultTemplateFilePath'));
      }).then(render);
  }); // endregion
else {
    browser.initialized = true;
    browser.window = window;
    window.document.addEventListener('DOMContentLoaded', function () {
      browser.domContentLoaded = true;
    });
    window.addEventListener('load', function () {
      browser.windowLoaded = true;
    });

    _clientnode["default"].timeout(function () {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = onCreatedListener[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var callback = _step2.value;
          callback();
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
  } // endregion

/**
 * Provides a generic browser api in node or web contexts.
 * @param replaceWindow - Indicates whether a potential existing window object
 * should be replaced or not.
 * @returns Determined environment.
 */

var getInitializedBrowser =
/*#__PURE__*/
function () {
  var _ref4 = (0, _asyncToGenerator2["default"])(
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
              if (replaceWindow && typeof global !== 'undefined' && global !== browser.window) // @ts-ignore: We modify again global object's specification.
                global.window = browser.window;
              resolvePromise(browser);
            };

            if (browser.initialized) wrappedCallback();else onCreatedListener.push(wrappedCallback);
            return _context.abrupt("return", promise);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getInitializedBrowser() {
    return _ref4.apply(this, arguments);
  };
}();

exports.getInitializedBrowser = getInitializedBrowser;
var _default = getInitializedBrowser; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

exports["default"] = _default;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFBQSxrQkFBckIscUJBQXFCO0FBQUE7QUFBQTtBQUFBLEdBQTNCOzs7ZUEyQlEscUIsRUFDZjtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJicm93c2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zXG4gICAgbmFtaW5nIDMuMCB1bnBvcnRlZCBsaWNlbnNlLlxuICAgIFNlZSBodHRwczovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzLCB7V2luZG93fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHtCcm93c2VyfSBmcm9tICcuL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBkZWNsYXJhdGlvblxuZGVjbGFyZSBjb25zdCBOQU1FOnN0cmluZ1xuZGVjbGFyZSBjb25zdCBUQVJHRVRfVEVDSE5PTE9HWTpzdHJpbmdcbmRlY2xhcmUgY29uc3Qgd2luZG93OldpbmRvd1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gdmFyaWFibGVzXG5jb25zdCBvbkNyZWF0ZWRMaXN0ZW5lcjpBcnJheTxGdW5jdGlvbj4gPSBbXVxuZXhwb3J0IGNvbnN0IGJyb3dzZXI6QnJvd3NlciA9IHtcbiAgICBkZWJ1ZzogZmFsc2UsXG4gICAgZG9tQ29udGVudExvYWRlZDogZmFsc2UsXG4gICAgRE9NOiBudWxsLFxuICAgIGluaXRpYWxpemVkOiBmYWxzZSxcbiAgICBpbnN0YW5jZTogbnVsbCxcbiAgICB3aW5kb3c6IG51bGwsXG4gICAgd2luZG93TG9hZGVkOiBmYWxzZVxufVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gZW5zdXJlIHByZXNlbmNlIG9mIGNvbW1vbiBicm93c2VyIGVudmlyb25tZW50XG5pZiAodHlwZW9mIFRBUkdFVF9URUNITk9MT0dZID09PSAndW5kZWZpbmVkJyB8fCBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ25vZGUnKVxuICAgIC8vIHJlZ2lvbiBtb2NrIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAgICBQcm9taXNlLmFsbChbaW1wb3J0KCdwYXRoJyksIGltcG9ydCgnanNkb20nKV0pLnRoZW4oKFxuICAgICAgICBbcGF0aCwge0pTRE9NLCBWaXJ0dWFsQ29uc29sZX1dXG4gICAgKTp2b2lkID0+IHtcbiAgICAgICAgY29uc3QgdmlydHVhbENvbnNvbGUgPSBuZXcgVmlydHVhbENvbnNvbGUoKVxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgW1xuICAgICAgICAgICAgJ2Fzc2VydCcsICdkaXInLCAnaW5mbycsICdsb2cnLCAndGltZScsICd0aW1lRW5kJywgJ3RyYWNlJywgJ3dhcm4nXG4gICAgICAgIF0pXG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbihuYW1lLCBjb25zb2xlW25hbWVdLmJpbmQoY29uc29sZSkpXG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKFxuICAgICAgICAgICAgJ2Vycm9yJyxcbiAgICAgICAgICAgIChlcnJvcjp7dHlwZTpzdHJpbmc7c3RhY2s6YW55O2RldGFpbDphbnl9KTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICFicm93c2VyLmRlYnVnICYmXG4gICAgICAgICAgICAgICAgICAgIFsnWE1MSHR0cFJlcXVlc3QnLCAncmVzb3VyY2UgbG9hZGluZyddLmluY2x1ZGVzKGVycm9yLnR5cGUpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYExvYWRpbmcgcmVzb3VyY2UgZmFpbGVkOiAke2Vycm9yLnRvU3RyaW5nKCl9LmApXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrLCBlcnJvci5kZXRhaWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgICAgY29uc3QgcmVuZGVyOkZ1bmN0aW9uID0gKHRlbXBsYXRlOnN0cmluZyk6dm9pZCA9PiB7XG4gICAgICAgICAgICBicm93c2VyLkRPTSA9IEpTRE9NXG4gICAgICAgICAgICBicm93c2VyLmluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgICAgICAgYnJvd3Nlci5pbnN0YW5jZSA9IG5ldyBKU0RPTSh0ZW1wbGF0ZSwge1xuICAgICAgICAgICAgICAgIGJlZm9yZVBhcnNlOiAod2luZG93OldpbmRvdyk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGJyb3dzZXIud2luZG93ID0gd2luZG93XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0RPTUNvbnRlbnRMb2FkZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgKCk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJvd3Nlci5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IE1heWJlIHdlIGhhdmUgbWlzcyB0aGUgXCJET01Db250ZW50TG9hZGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudCBjYXVzZWQgYnkgYSByYWNlIGNvbmRpdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBicm93c2VyLmRvbUNvbnRlbnRMb2FkZWQgPSBicm93c2VyLndpbmRvd0xvYWRlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiBvbkNyZWF0ZWRMaXN0ZW5lcilcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlc291cmNlczogJ3VzYWJsZScsXG4gICAgICAgICAgICAgICAgcnVuU2NyaXB0czogJ2Rhbmdlcm91c2x5JyxcbiAgICAgICAgICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0JyxcbiAgICAgICAgICAgICAgICB2aXJ0dWFsQ29uc29sZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIE5BTUUgPT09ICd1bmRlZmluZWQnIHx8IE5BTUUgPT09ICd3ZWJPcHRpbWl6ZXInKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnaW5kZXguaHRtbC5lanMnKVxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBOT1RFOiBXZSBsb2FkIGRlcGVuZGVuY2llcyBub3cgdG8gYXZvaWQgaGF2aW5nIGZpbGUgaW1wb3J0c1xuICAgICAgICAgICAgICAgIGFmdGVyIHRlc3QgcnVubmVyIGhhcyBmaW5pc2hlZCB0byBpc29sYXRlIHRoZSBlbnZpcm9ubWVudC5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpbXBvcnQoJy4vZWpzTG9hZGVyLmpzJykudGhlbigoe2RlZmF1bHQ6IGVqc0xvYWRlcn0pID0+XG4gICAgICAgICAgICAgICAgcmVxdWlyZSgnZnMnKS5yZWFkRmlsZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHtlbmNvZGluZzogJ3V0Zi04J30sXG4gICAgICAgICAgICAgICAgICAgIChlcnJvcjpFcnJvcnxudWxsLCBjb250ZW50OnN0cmluZyk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcihlanNMb2FkZXIuYmluZCh7ZmlsZW5hbWU6IGZpbGVQYXRofSkoY29udGVudCkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogV2lsbCBiZSBhdmFpbGFibGUgYXQgcnVudGltZS5cbiAgICAgICAgICAgIGltcG9ydCgnd2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZVBhdGgnKS50aGVuKHJlbmRlcilcbiAgICB9KVxuICAgIC8vIGVuZHJlZ2lvblxuZWxzZSB7XG4gICAgYnJvd3Nlci5pbml0aWFsaXplZCA9IHRydWVcbiAgICBicm93c2VyLndpbmRvdyA9IHdpbmRvd1xuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCk6dm9pZCA9PiB7XG4gICAgICAgIGJyb3dzZXIuZG9tQ29udGVudExvYWRlZCA9IHRydWVcbiAgICB9KVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCk6dm9pZCA9PiB7XG4gICAgICAgIGJyb3dzZXIud2luZG93TG9hZGVkID0gdHJ1ZVxuICAgIH0pXG4gICAgVG9vbHMudGltZW91dCgoKTp2b2lkID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBjYWxsYmFjayBvZiBvbkNyZWF0ZWRMaXN0ZW5lcilcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICB9KVxufVxuLy8gZW5kcmVnaW9uXG4vKipcbiAqIFByb3ZpZGVzIGEgZ2VuZXJpYyBicm93c2VyIGFwaSBpbiBub2RlIG9yIHdlYiBjb250ZXh0cy5cbiAqIEBwYXJhbSByZXBsYWNlV2luZG93IC0gSW5kaWNhdGVzIHdoZXRoZXIgYSBwb3RlbnRpYWwgZXhpc3Rpbmcgd2luZG93IG9iamVjdFxuICogc2hvdWxkIGJlIHJlcGxhY2VkIG9yIG5vdC5cbiAqIEByZXR1cm5zIERldGVybWluZWQgZW52aXJvbm1lbnQuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRJbml0aWFsaXplZEJyb3dzZXIgPSBhc3luYyAoXG4gICAgcmVwbGFjZVdpbmRvdyA9IHRydWVcbik6UHJvbWlzZTxCcm93c2VyPiA9PiB7XG4gICAgbGV0IHJlc29sdmVQcm9taXNlOkZ1bmN0aW9uXG4gICAgY29uc3QgcHJvbWlzZTpQcm9taXNlPEJyb3dzZXI+ID0gbmV3IFByb21pc2UoKHJlc29sdmU6RnVuY3Rpb24pOnZvaWQgPT4ge1xuICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmVcbiAgICB9KVxuICAgIC8qXG4gICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gZGVmaW5lIHdpbmRvdyBnbG9iYWxseSBiZWZvcmUgYW55dGhpbmcgaXMgbG9hZGVkIHRvXG4gICAgICAgIGVuc3VyZSB0aGF0IGFsbCBmdXR1cmUgaW5zdGFuY2VzIHNoYXJlIHRoZSBzYW1lIHdpbmRvdyBvYmplY3QuXG4gICAgKi9cbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2s6RnVuY3Rpb24gPSAoKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgcmVwbGFjZVdpbmRvdyAmJlxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgIGdsb2JhbCAhPT0gYnJvd3Nlci53aW5kb3dcbiAgICAgICAgKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZTogV2UgbW9kaWZ5IGFnYWluIGdsb2JhbCBvYmplY3QncyBzcGVjaWZpY2F0aW9uLlxuICAgICAgICAgICAgZ2xvYmFsLndpbmRvdyA9IGJyb3dzZXIud2luZG93XG4gICAgICAgIHJlc29sdmVQcm9taXNlKGJyb3dzZXIpXG4gICAgfVxuICAgIGlmIChicm93c2VyLmluaXRpYWxpemVkKVxuICAgICAgICB3cmFwcGVkQ2FsbGJhY2soKVxuICAgIGVsc2VcbiAgICAgICAgb25DcmVhdGVkTGlzdGVuZXIucHVzaCh3cmFwcGVkQ2FsbGJhY2spXG4gICAgcmV0dXJuIHByb21pc2Vcbn1cbmV4cG9ydCBkZWZhdWx0IGdldEluaXRpYWxpemVkQnJvd3NlclxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=