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

exports.createBrowserAPI = createBrowserAPI;

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
/**
 * Provides a generic browser api in node or web contexts.
 * @param callback - Function to be called when environment is ready.
 * @param clear - Indicates whether a potential existign window object should
 * be replaced or not.
 * @returns Determined environment.
 */
function createBrowserAPI(callback) {
    var clear = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    // region initialize global context
    var wrappedCallback = function wrappedCallback() {
        if (clear && typeof global !== 'undefined' && global !== browserAPI.window) global.window = browserAPI.window;
        return callback.apply(undefined, arguments);
    };
    // endregion
    if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') return browserAPI ? wrappedCallback(browserAPI, true) : onCreatedListener.push(wrappedCallback);
    return browserAPI.domContentLoaded ? wrappedCallback(browserAPI, true) : onCreatedListener.push(wrappedCallback);
}
exports.default = createBrowserAPI;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LElBRE0sQ0FBZixHQUVILGtCQUFrQixJQUFsQixDQUF1QixlQUF2QixDQUZKO0FBR0osV0FBUSxXQUFXLGdCQUFaLEdBQWdDLGdCQUNuQyxVQURtQyxFQUN2QixJQUR1QixDQUFoQyxHQUVILGtCQUFrQixJQUFsQixDQUF1QixlQUF2QixDQUZKO0FBR0g7a0JBQ2MsZ0I7QUFDZjtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJicm93c2VyQVBJLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB0eXBlIHtXaW5kb3d9IGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgdHlwZSB7QnJvd3NlckFQSX0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gZGVjbGFyYXRpb25cbmRlY2xhcmUgdmFyIE5BTUU6c3RyaW5nXG5kZWNsYXJlIHZhciBUQVJHRVRfVEVDSE5PTE9HWTpzdHJpbmdcbmRlY2xhcmUgdmFyIHdpbmRvdzpXaW5kb3dcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHZhcmlhYmxlc1xuY29uc3Qgb25DcmVhdGVkTGlzdGVuZXI6QXJyYXk8RnVuY3Rpb24+ID0gW11cbmxldCBicm93c2VyQVBJOkJyb3dzZXJBUElcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGVuc3VyZSBwcmVzZW5jZSBvZiBjb21tb24gYnJvd3NlciBlbnZpcm9ubWVudFxuaWYgKHR5cGVvZiBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ3VuZGVmaW5lZCcgfHwgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICdub2RlJykge1xuICAgIC8vIHJlZ2lvbiBtb2NrIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAgICBjb25zdCBwYXRoOk9iamVjdCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIGNvbnN0IHtKU0RPTSwgVmlydHVhbENvbnNvbGV9ID0gcmVxdWlyZSgnanNkb20nKVxuICAgIGNvbnN0IHZpcnR1YWxDb25zb2xlOk9iamVjdCA9IG5ldyBWaXJ0dWFsQ29uc29sZSgpXG4gICAgZm9yIChjb25zdCBuYW1lOnN0cmluZyBvZiBbXG4gICAgICAgICdhc3NlcnQnLCAnZGlyJywgJ2luZm8nLCAnbG9nJywgJ3RpbWUnLCAndGltZUVuZCcsICd0cmFjZScsICd3YXJuJ1xuICAgIF0pXG4gICAgICAgIHZpcnR1YWxDb25zb2xlLm9uKG5hbWUsIGNvbnNvbGVbbmFtZV0uYmluZChjb25zb2xlKSlcbiAgICB2aXJ0dWFsQ29uc29sZS5vbignZXJyb3InLCAoZXJyb3I6RXJyb3IpOnZvaWQgPT4ge1xuICAgICAgICBpZiAoIWJyb3dzZXJBUEkuZGVidWcgJiYgW1xuICAgICAgICAgICAgJ1hNTEh0dHBSZXF1ZXN0JywgJ3Jlc291cmNlIGxvYWRpbmcnXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICBdLmluY2x1ZGVzKGVycm9yLnR5cGUpKVxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBMb2FkaW5nIHJlc291cmNlIGZhaWxlZDogJHtlcnJvci50b1N0cmluZygpfS5gKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3Iuc3RhY2ssIGVycm9yLmRldGFpbClcbiAgICB9KVxuICAgIGNvbnN0IHJlbmRlcjpGdW5jdGlvbiA9ICh0ZW1wbGF0ZTpzdHJpbmcpOldpbmRvdyA9PiB7XG4gICAgICAgIGxldCB3aW5kb3c6V2luZG93ID0gKG5ldyBKU0RPTSh0ZW1wbGF0ZSwge1xuICAgICAgICAgICAgcmVzb3VyY2VzOiAndXNhYmxlJyxcbiAgICAgICAgICAgIHJ1blNjcmlwdHM6ICdkYW5nZXJvdXNseScsXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0JyxcbiAgICAgICAgICAgIHZpcnR1YWxDb25zb2xlXG4gICAgICAgIH0pKS53aW5kb3dcbiAgICAgICAgYnJvd3NlckFQSSA9IHtcbiAgICAgICAgICAgIGRlYnVnOiBmYWxzZSwgZG9tQ29udGVudExvYWRlZDogZmFsc2UsIERPTTogSlNET00sIHdpbmRvdyxcbiAgICAgICAgICAgIHdpbmRvd0xvYWRlZDogZmFsc2V9XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCk6dm9pZCA9PiB7XG4gICAgICAgICAgICAvLyBOT1RFOiBNYXliZSB3ZSBoYXZlIG1pc3MgdGhlIFwiRE9NQ29udGVudExvYWRlZFwiIGV2ZW50LlxuICAgICAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgYnJvd3NlckFQSS53aW5kb3dMb2FkZWQgPSB0cnVlXG4gICAgICAgIH0pXG4gICAgICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCk6dm9pZCA9PiB7XG4gICAgICAgICAgICBicm93c2VyQVBJLmRvbUNvbnRlbnRMb2FkZWQgPSB0cnVlXG4gICAgICAgIH0pXG4gICAgICAgIGZvciAoY29uc3QgY2FsbGJhY2s6RnVuY3Rpb24gb2Ygb25DcmVhdGVkTGlzdGVuZXIpXG4gICAgICAgICAgICBjYWxsYmFjayhicm93c2VyQVBJLCBmYWxzZSlcbiAgICAgICAgcmV0dXJuIHdpbmRvd1xuICAgIH1cbiAgICBpZiAodHlwZW9mIE5BTUUgPT09ICd1bmRlZmluZWQnIHx8IE5BTUUgPT09ICd3ZWJPcHRpbWl6ZXInKSB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdpbmRleC5odG1sLmVqcycpXG4gICAgICAgIHJlcXVpcmUoJ2ZzJykucmVhZEZpbGUoZmlsZVBhdGgsIHtlbmNvZGluZzogJ3V0Zi04J30sIChcbiAgICAgICAgICAgIGVycm9yOj9FcnJvciwgY29udGVudDpzdHJpbmdcbiAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGlmIChlcnJvcilcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgICAgICAgcmVuZGVyKHJlcXVpcmUoJy4vZWpzTG9hZGVyLmNvbXBpbGVkJykuYmluZCh7ZmlsZW5hbWU6IGZpbGVQYXRofSkoXG4gICAgICAgICAgICAgICAgY29udGVudCkpXG4gICAgICAgIH0pXG4gICAgfSBlbHNlXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICByZW5kZXIocmVxdWlyZSgnd2ViT3B0aW1pemVyRGVmYXVsdFRlbXBsYXRlRmlsZVBhdGgnKSlcbiAgICAvLyBlbmRyZWdpb25cbn0gZWxzZSB7XG4gICAgYnJvd3NlckFQSSA9IHtcbiAgICAgICAgZGVidWc6IGZhbHNlLCBkb21Db250ZW50TG9hZGVkOiBmYWxzZSwgRE9NOiBudWxsLCB3aW5kb3csXG4gICAgICAgIHdpbmRvd0xvYWRlZDogZmFsc2V9XG4gICAgd2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKTp2b2lkID0+IHtcbiAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrOkZ1bmN0aW9uIG9mIG9uQ3JlYXRlZExpc3RlbmVyKVxuICAgICAgICAgICAgY2FsbGJhY2soYnJvd3NlckFQSSwgZmFsc2UpXG4gICAgfSlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpOnZvaWQgPT4ge1xuICAgICAgICBicm93c2VyQVBJLndpbmRvd0xvYWRlZCA9IHRydWVcbiAgICB9KVxufVxuLy8gZW5kcmVnaW9uXG4vKipcbiAqIFByb3ZpZGVzIGEgZ2VuZXJpYyBicm93c2VyIGFwaSBpbiBub2RlIG9yIHdlYiBjb250ZXh0cy5cbiAqIEBwYXJhbSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGVudmlyb25tZW50IGlzIHJlYWR5LlxuICogQHBhcmFtIGNsZWFyIC0gSW5kaWNhdGVzIHdoZXRoZXIgYSBwb3RlbnRpYWwgZXhpc3RpZ24gd2luZG93IG9iamVjdCBzaG91bGRcbiAqIGJlIHJlcGxhY2VkIG9yIG5vdC5cbiAqIEByZXR1cm5zIERldGVybWluZWQgZW52aXJvbm1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCcm93c2VyQVBJKGNhbGxiYWNrOkZ1bmN0aW9uLCBjbGVhcjpib29sZWFuID0gdHJ1ZSk6YW55IHtcbiAgICAvLyByZWdpb24gaW5pdGlhbGl6ZSBnbG9iYWwgY29udGV4dFxuICAgIC8qXG4gICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gZGVmaW5lIHdpbmRvdyBnbG9iYWxseSBiZWZvcmUgYW55dGhpbmcgaXMgbG9hZGVkIHRvXG4gICAgICAgIGVuc3VyZSB0aGF0IGFsbCBmdXR1cmUgaW5zdGFuY2VzIHNoYXJlIHRoZSBzYW1lIHdpbmRvdyBvYmplY3QuXG4gICAgKi9cbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2s6RnVuY3Rpb24gPSAoLi4ucGFyYW1ldGVyOkFycmF5PGFueT4pOmFueSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGNsZWFyICYmIHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICBnbG9iYWwgIT09IGJyb3dzZXJBUEkud2luZG93XG4gICAgICAgIClcbiAgICAgICAgICAgIGdsb2JhbC53aW5kb3cgPSBicm93c2VyQVBJLndpbmRvd1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soLi4ucGFyYW1ldGVyKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICdub2RlJ1xuICAgIClcbiAgICAgICAgcmV0dXJuIChicm93c2VyQVBJKSA/IHdyYXBwZWRDYWxsYmFjayhcbiAgICAgICAgICAgIGJyb3dzZXJBUEksIHRydWVcbiAgICAgICAgKSA6IG9uQ3JlYXRlZExpc3RlbmVyLnB1c2god3JhcHBlZENhbGxiYWNrKVxuICAgIHJldHVybiAoYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkKSA/IHdyYXBwZWRDYWxsYmFjayhcbiAgICAgICAgYnJvd3NlckFQSSwgdHJ1ZVxuICAgICkgOiBvbkNyZWF0ZWRMaXN0ZW5lci5wdXNoKHdyYXBwZWRDYWxsYmFjaylcbn1cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUJyb3dzZXJBUElcbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19