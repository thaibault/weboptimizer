// #!/usr/bin/env node

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

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// endregion
// region variables
var onCreatedListener = [];
// endregion
// region declaration

var browserAPI = void 0;
// endregion
// region ensure presence of common browser environment
if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') {
    // region mock browser environment
    var path = require('path');

    var _require = require('jsdom'),
        JSDOM = _require.JSDOM,
        VirtualConsole = _require.VirtualConsole;

    var virtualConsole = new VirtualConsole();
    var _arr = ['assert', 'dir', 'info', 'log', 'time', 'timeEnd', 'trace', 'warn'];
    for (var _i = 0; _i < _arr.length; _i++) {
        var name = _arr[_i];
        virtualConsole.on(name, console[name].bind(console));
    }virtualConsole.on('error', function (error) {
        if (!browserAPI.debug && ['XMLHttpRequest', 'resource loading'
        // IgnoreTypeCheck
        ].includes(error.type)) console.warn('Loading resource failed: ' + error.toString() + '.');else
            // IgnoreTypeCheck
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
            debug: false, domContentLoaded: false, DOM: JSDOM, window: window,
            windowLoaded: false };
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
            for (var _iterator = (0, _getIterator3.default)(onCreatedListener), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var callback = _step.value;

                callback(browserAPI, false);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
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
        require('fs').readFile(filePath, { encoding: 'utf-8' }, function (error, content) {
            if (error) throw error;
            render(require('./ejsLoader.compiled').bind({ filename: filePath })(content));
        });
    } else
        // IgnoreTypeCheck
        render(require('webOptimizerDefaultTemplateFilePath'));
    // endregion
} else {
    browserAPI = {
        debug: false, domContentLoaded: false, DOM: null, window: window,
        windowLoaded: false };
    window.document.addEventListener('DOMContentLoaded', function () {
        browserAPI.domContentLoaded = true;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = (0, _getIterator3.default)(onCreatedListener), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var callback = _step2.value;

                callback(browserAPI, false);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
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
}
// endregion

exports.default = function (callback) {
    var clear = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    // region initialize global context
    var wrappedCallback = function wrappedCallback() {
        if (clear && typeof global !== 'undefined' && global !== browserAPI.window) global.window = browserAPI.window;
        return callback.apply(undefined, arguments);
    };
    // endregion
    if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') return browserAPI ? wrappedCallback(browserAPI, true) : onCreatedListener.push(wrappedCallback);
    return browserAPI.domContentLoaded ? wrappedCallback(browserAPI, true) : onCreatedListener.push(wrappedCallback);
};
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJyb3dzZXJBUEkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQVdBOzs7Ozs7Ozs7Ozs7QUFRQTtBQUNBO0FBQ0EsSUFBTSxvQkFBb0MsRUFBMUM7QUFQQTtBQUNBOztBQU9BLElBQUksbUJBQUo7QUFDQTtBQUNBO0FBQ0EsSUFBSSxPQUFPLGlCQUFQLEtBQTZCLFdBQTdCLElBQTRDLHNCQUFzQixNQUF0RSxFQUE4RTtBQUMxRTtBQUNBLFFBQU0sT0FBYyxRQUFRLE1BQVIsQ0FBcEI7O0FBRjBFLG1CQUcxQyxRQUFRLE9BQVIsQ0FIMEM7QUFBQSxRQUduRSxLQUhtRSxZQUduRSxLQUhtRTtBQUFBLFFBRzVELGNBSDRELFlBRzVELGNBSDREOztBQUkxRSxRQUFNLGlCQUF3QixJQUFJLGNBQUosRUFBOUI7QUFKMEUsZUFLaEQsQ0FDdEIsUUFEc0IsRUFDWixLQURZLEVBQ0wsTUFESyxFQUNHLEtBREgsRUFDVSxNQURWLEVBQ2tCLFNBRGxCLEVBQzZCLE9BRDdCLEVBQ3NDLE1BRHRDLENBTGdEO0FBSzFFO0FBQUssWUFBTSxlQUFOO0FBR0QsdUJBQWUsRUFBZixDQUFrQixJQUFsQixFQUF3QixRQUFRLElBQVIsRUFBYyxJQUFkLENBQW1CLE9BQW5CLENBQXhCO0FBSEosS0FJQSxlQUFlLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsVUFBQyxLQUFELEVBQXNCO0FBQzdDLFlBQUksQ0FBQyxXQUFXLEtBQVosSUFBcUIsQ0FDckIsZ0JBRHFCLEVBQ0g7QUFDdEI7QUFGeUIsVUFHdkIsUUFIdUIsQ0FHZCxNQUFNLElBSFEsQ0FBekIsRUFJSSxRQUFRLElBQVIsK0JBQXlDLE1BQU0sUUFBTixFQUF6QyxRQUpKO0FBTUk7QUFDQSxvQkFBUSxLQUFSLENBQWMsTUFBTSxLQUFwQixFQUEyQixNQUFNLE1BQWpDO0FBQ1AsS0FURDtBQVVBLFFBQU0sU0FBa0IsU0FBbEIsTUFBa0IsQ0FBQyxRQUFELEVBQTRCO0FBQ2hELFlBQUksU0FBaUIsSUFBSSxLQUFKLENBQVUsUUFBVixFQUFvQjtBQUNyQyx1QkFBVyxRQUQwQjtBQUVyQyx3QkFBWSxhQUZ5QjtBQUdyQyxpQkFBSyxrQkFIZ0M7QUFJckM7QUFKcUMsU0FBcEIsQ0FBRCxDQUtoQixNQUxKO0FBTUEscUJBQWE7QUFDVCxtQkFBTyxLQURFLEVBQ0ssa0JBQWtCLEtBRHZCLEVBQzhCLEtBQUssS0FEbkMsRUFDMEMsY0FEMUM7QUFFVCwwQkFBYyxLQUZMLEVBQWI7QUFHQSxlQUFPLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQVc7QUFDdkM7QUFDQSx1QkFBVyxnQkFBWCxHQUE4QixJQUE5QjtBQUNBLHVCQUFXLFlBQVgsR0FBMEIsSUFBMUI7QUFDSCxTQUpEO0FBS0EsZUFBTyxRQUFQLENBQWdCLGdCQUFoQixDQUFpQyxrQkFBakMsRUFBcUQsWUFBVztBQUM1RCx1QkFBVyxnQkFBWCxHQUE4QixJQUE5QjtBQUNILFNBRkQ7QUFmZ0Q7QUFBQTtBQUFBOztBQUFBO0FBa0JoRCw0REFBZ0MsaUJBQWhDO0FBQUEsb0JBQVcsUUFBWDs7QUFDSSx5QkFBUyxVQUFULEVBQXFCLEtBQXJCO0FBREo7QUFsQmdEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBb0JoRCxlQUFPLE1BQVA7QUFDSCxLQXJCRDtBQXNCQSxRQUFJLE9BQU8sSUFBUCxLQUFnQixXQUFoQixJQUErQixTQUFTLGNBQTVDLEVBQTREO0FBQ3hELFlBQU0sV0FBa0IsS0FBSyxJQUFMLENBQVUsU0FBVixFQUFxQixnQkFBckIsQ0FBeEI7QUFDQSxnQkFBUSxJQUFSLEVBQWMsUUFBZCxDQUF1QixRQUF2QixFQUFpQyxFQUFDLFVBQVUsT0FBWCxFQUFqQyxFQUFzRCxVQUNsRCxLQURrRCxFQUNwQyxPQURvQyxFQUU1QztBQUNOLGdCQUFJLEtBQUosRUFDSSxNQUFNLEtBQU47QUFDSixtQkFBTyxRQUFRLHNCQUFSLEVBQWdDLElBQWhDLENBQXFDLEVBQUMsVUFBVSxRQUFYLEVBQXJDLEVBQ0gsT0FERyxDQUFQO0FBRUgsU0FQRDtBQVFILEtBVkQ7QUFXSTtBQUNBLGVBQU8sUUFBUSxxQ0FBUixDQUFQO0FBQ0o7QUFDSCxDQXZERCxNQXVETztBQUNILGlCQUFhO0FBQ1QsZUFBTyxLQURFLEVBQ0ssa0JBQWtCLEtBRHZCLEVBQzhCLEtBQUssSUFEbkMsRUFDeUMsY0FEekM7QUFFVCxzQkFBYyxLQUZMLEVBQWI7QUFHQSxXQUFPLFFBQVAsQ0FBZ0IsZ0JBQWhCLENBQWlDLGtCQUFqQyxFQUFxRCxZQUFXO0FBQzVELG1CQUFXLGdCQUFYLEdBQThCLElBQTlCO0FBRDREO0FBQUE7QUFBQTs7QUFBQTtBQUU1RCw2REFBZ0MsaUJBQWhDO0FBQUEsb0JBQVcsUUFBWDs7QUFDSSx5QkFBUyxVQUFULEVBQXFCLEtBQXJCO0FBREo7QUFGNEQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUkvRCxLQUpEO0FBS0EsV0FBTyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxZQUFXO0FBQ3ZDLG1CQUFXLFlBQVgsR0FBMEIsSUFBMUI7QUFDSCxLQUZEO0FBR0g7QUFDRDs7a0JBQ2UsVUFBQyxRQUFELEVBQWlEO0FBQUEsUUFBN0IsS0FBNkIsdUVBQWIsSUFBYTs7QUFDNUQ7QUFLQSxRQUFNLGtCQUEyQixTQUEzQixlQUEyQixHQUFpQztBQUM5RCxZQUNJLFNBQVMsT0FBTyxNQUFQLEtBQWtCLFdBQTNCLElBQ0EsV0FBVyxXQUFXLE1BRjFCLEVBSUksT0FBTyxNQUFQLEdBQWdCLFdBQVcsTUFBM0I7QUFDSixlQUFPLG9DQUFQO0FBQ0gsS0FQRDtBQVFBO0FBQ0EsUUFDSSxPQUFPLGlCQUFQLEtBQTZCLFdBQTdCLElBQ0Esc0JBQXNCLE1BRjFCLEVBSUksT0FBUSxVQUFELEdBQWUsZ0JBQ2xCLFVBRGtCLEVBQ04sSUFETSxDQUFmLEdBRUgsa0JBQWtCLElBQWxCLENBQXVCLGVBQXZCLENBRko7QUFHSixXQUFRLFdBQVcsZ0JBQVosR0FBZ0MsZ0JBQ25DLFVBRG1DLEVBQ3ZCLElBRHVCLENBQWhDLEdBRUgsa0JBQWtCLElBQWxCLENBQXVCLGVBQXZCLENBRko7QUFHSCxDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnJvd3NlckFQSS5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vICMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgdHlwZSB7V2luZG93fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHR5cGUge0Jyb3dzZXJBUEl9IGZyb20gJy4vdHlwZSdcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGRlY2xhcmF0aW9uXG5kZWNsYXJlIHZhciBOQU1FOnN0cmluZ1xuZGVjbGFyZSB2YXIgVEFSR0VUX1RFQ0hOT0xPR1k6c3RyaW5nXG5kZWNsYXJlIHZhciB3aW5kb3c6V2luZG93XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2YXJpYWJsZXNcbmNvbnN0IG9uQ3JlYXRlZExpc3RlbmVyOkFycmF5PEZ1bmN0aW9uPiA9IFtdXG5sZXQgYnJvd3NlckFQSTpCcm93c2VyQVBJXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBlbnN1cmUgcHJlc2VuY2Ugb2YgY29tbW9uIGJyb3dzZXIgZW52aXJvbm1lbnRcbmlmICh0eXBlb2YgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICd1bmRlZmluZWQnIHx8IFRBUkdFVF9URUNITk9MT0dZID09PSAnbm9kZScpIHtcbiAgICAvLyByZWdpb24gbW9jayBicm93c2VyIGVudmlyb25tZW50XG4gICAgY29uc3QgcGF0aDpPYmplY3QgPSByZXF1aXJlKCdwYXRoJylcbiAgICBjb25zdCB7SlNET00sIFZpcnR1YWxDb25zb2xlfSA9IHJlcXVpcmUoJ2pzZG9tJylcbiAgICBjb25zdCB2aXJ0dWFsQ29uc29sZTpPYmplY3QgPSBuZXcgVmlydHVhbENvbnNvbGUoKVxuICAgIGZvciAoY29uc3QgbmFtZTpzdHJpbmcgb2YgW1xuICAgICAgICAnYXNzZXJ0JywgJ2RpcicsICdpbmZvJywgJ2xvZycsICd0aW1lJywgJ3RpbWVFbmQnLCAndHJhY2UnLCAnd2FybidcbiAgICBdKVxuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbihuYW1lLCBjb25zb2xlW25hbWVdLmJpbmQoY29uc29sZSkpXG4gICAgdmlydHVhbENvbnNvbGUub24oJ2Vycm9yJywgKGVycm9yOkVycm9yKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKCFicm93c2VyQVBJLmRlYnVnICYmIFtcbiAgICAgICAgICAgICdYTUxIdHRwUmVxdWVzdCcsICdyZXNvdXJjZSBsb2FkaW5nJ1xuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgXS5pbmNsdWRlcyhlcnJvci50eXBlKSlcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTG9hZGluZyByZXNvdXJjZSBmYWlsZWQ6ICR7ZXJyb3IudG9TdHJpbmcoKX0uYClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrLCBlcnJvci5kZXRhaWwpXG4gICAgfSlcbiAgICBjb25zdCByZW5kZXI6RnVuY3Rpb24gPSAodGVtcGxhdGU6c3RyaW5nKTpXaW5kb3cgPT4ge1xuICAgICAgICBsZXQgd2luZG93OldpbmRvdyA9IChuZXcgSlNET00odGVtcGxhdGUsIHtcbiAgICAgICAgICAgIHJlc291cmNlczogJ3VzYWJsZScsXG4gICAgICAgICAgICBydW5TY3JpcHRzOiAnZGFuZ2Vyb3VzbHknLFxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdCcsXG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZVxuICAgICAgICB9KSkud2luZG93XG4gICAgICAgIGJyb3dzZXJBUEkgPSB7XG4gICAgICAgICAgICBkZWJ1ZzogZmFsc2UsIGRvbUNvbnRlbnRMb2FkZWQ6IGZhbHNlLCBET006IEpTRE9NLCB3aW5kb3csXG4gICAgICAgICAgICB3aW5kb3dMb2FkZWQ6IGZhbHNlfVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgLy8gTk9URTogTWF5YmUgd2UgaGF2ZSBtaXNzIHRoZSBcIkRPTUNvbnRlbnRMb2FkZWRcIiBldmVudC5cbiAgICAgICAgICAgIGJyb3dzZXJBUEkuZG9tQ29udGVudExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIGJyb3dzZXJBUEkud2luZG93TG9hZGVkID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrOkZ1bmN0aW9uIG9mIG9uQ3JlYXRlZExpc3RlbmVyKVxuICAgICAgICAgICAgY2FsbGJhY2soYnJvd3NlckFQSSwgZmFsc2UpXG4gICAgICAgIHJldHVybiB3aW5kb3dcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBOQU1FID09PSAndW5kZWZpbmVkJyB8fCBOQU1FID09PSAnd2ViT3B0aW1pemVyJykge1xuICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnaW5kZXguaHRtbC5lanMnKVxuICAgICAgICByZXF1aXJlKCdmcycpLnJlYWRGaWxlKGZpbGVQYXRoLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9LCAoXG4gICAgICAgICAgICBlcnJvcjo/RXJyb3IsIGNvbnRlbnQ6c3RyaW5nXG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgICAgIHJlbmRlcihyZXF1aXJlKCcuL2Vqc0xvYWRlci5jb21waWxlZCcpLmJpbmQoe2ZpbGVuYW1lOiBmaWxlUGF0aH0pKFxuICAgICAgICAgICAgICAgIGNvbnRlbnQpKVxuICAgICAgICB9KVxuICAgIH0gZWxzZVxuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgcmVuZGVyKHJlcXVpcmUoJ3dlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVQYXRoJykpXG4gICAgLy8gZW5kcmVnaW9uXG59IGVsc2Uge1xuICAgIGJyb3dzZXJBUEkgPSB7XG4gICAgICAgIGRlYnVnOiBmYWxzZSwgZG9tQ29udGVudExvYWRlZDogZmFsc2UsIERPTTogbnVsbCwgd2luZG93LFxuICAgICAgICB3aW5kb3dMb2FkZWQ6IGZhbHNlfVxuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCk6dm9pZCA9PiB7XG4gICAgICAgIGJyb3dzZXJBUEkuZG9tQ29udGVudExvYWRlZCA9IHRydWVcbiAgICAgICAgZm9yIChjb25zdCBjYWxsYmFjazpGdW5jdGlvbiBvZiBvbkNyZWF0ZWRMaXN0ZW5lcilcbiAgICAgICAgICAgIGNhbGxiYWNrKGJyb3dzZXJBUEksIGZhbHNlKVxuICAgIH0pXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKTp2b2lkID0+IHtcbiAgICAgICAgYnJvd3NlckFQSS53aW5kb3dMb2FkZWQgPSB0cnVlXG4gICAgfSlcbn1cbi8vIGVuZHJlZ2lvblxuZXhwb3J0IGRlZmF1bHQgKGNhbGxiYWNrOkZ1bmN0aW9uLCBjbGVhcjpib29sZWFuID0gdHJ1ZSk6YW55ID0+IHtcbiAgICAvLyByZWdpb24gaW5pdGlhbGl6ZSBnbG9iYWwgY29udGV4dFxuICAgIC8qXG4gICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gZGVmaW5lIHdpbmRvdyBnbG9iYWxseSBiZWZvcmUgYW55dGhpbmcgaXMgbG9hZGVkIHRvXG4gICAgICAgIGVuc3VyZSB0aGF0IGFsbCBmdXR1cmUgaW5zdGFuY2VzIHNoYXJlIHRoZSBzYW1lIHdpbmRvdyBvYmplY3QuXG4gICAgKi9cbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2s6RnVuY3Rpb24gPSAoLi4ucGFyYW1ldGVyOkFycmF5PGFueT4pOmFueSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGNsZWFyICYmIHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICBnbG9iYWwgIT09IGJyb3dzZXJBUEkud2luZG93XG4gICAgICAgIClcbiAgICAgICAgICAgIGdsb2JhbC53aW5kb3cgPSBicm93c2VyQVBJLndpbmRvd1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soLi4ucGFyYW1ldGVyKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICdub2RlJ1xuICAgIClcbiAgICAgICAgcmV0dXJuIChicm93c2VyQVBJKSA/IHdyYXBwZWRDYWxsYmFjayhcbiAgICAgICAgICAgIGJyb3dzZXJBUEksIHRydWVcbiAgICAgICAgKSA6IG9uQ3JlYXRlZExpc3RlbmVyLnB1c2god3JhcHBlZENhbGxiYWNrKVxuICAgIHJldHVybiAoYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkKSA/IHdyYXBwZWRDYWxsYmFjayhcbiAgICAgICAgYnJvd3NlckFQSSwgdHJ1ZVxuICAgICkgOiBvbkNyZWF0ZWRMaXN0ZW5lci5wdXNoKHdyYXBwZWRDYWxsYmFjaylcbn1cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19