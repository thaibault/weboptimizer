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
/* eslint-disable no-unused-vars */

Object.defineProperty(exports, "__esModule", {
    value: true
});

// endregion
// region variables
var onCreatedListener = [];
/* eslint-enable no-unused-vars */
// endregion
// region declaration

var browserAPI = void 0;
// endregion
// region ensure presence of common browser environment
if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') {
    (function () {
        // region mock browser environment
        var path = require('path');
        var metaDOM = require('jsdom');
        var virtualConsole = metaDOM.createVirtualConsole().sendTo(console, { omitJsdomErrors: true });
        virtualConsole.on('jsdomError', function (error) {
            if (!browserAPI.debug && ['XMLHttpRequest', 'resource loading'
            // IgnoreTypeCheck
            ].includes(error.type)) console.warn('Loading resource failed: ' + error.toString() + '.');else
                // IgnoreTypeCheck
                console.error(error.stack, error.detail);
        });
        var template = void 0;
        if (typeof NAME === 'undefined' || NAME === 'webOptimizer') template = require('pug').compileFile(path.join(__dirname, 'index.pug'), { pretty: true })({ configuration: {
                name: 'test', givenCommandLineArguments: []
            } });else
            // IgnoreTypeCheck
            template = require('webOptimizerDefaultTemplateFilePath');
        metaDOM.env({
            created: function created(error, window) {
                browserAPI = {
                    debug: false, domContentLoaded: false, metaDOM: metaDOM, window: window,
                    windowLoaded: false };
                browserAPI.window.document.addEventListener('DOMContentLoaded', function () {
                    browserAPI.domContentLoaded = true;
                });
                if (error) throw error;else {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = onCreatedListener[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _callback = _step.value;

                            _callback(browserAPI, false);
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
                }
            },
            features: {
                FetchExternalResources: ['script', 'frame', 'iframe', 'link', 'img'],
                ProcessExternalResources: ['script'],
                SkipExternalResources: false
            },
            html: template,
            onload: function onload() {
                browserAPI.domContentLoaded = true;
                browserAPI.windowLoaded = true;
            },
            resourceLoader: function resourceLoader(resource, callback) {
                if (resource.url.hostname === 'localhost') {
                    resource.url.host = resource.url.hostname = '';
                    resource.url.port = null;
                    resource.url.protocol = 'file:';
                    resource.url.href = resource.url.href.replace(/^[a-zA-Z]+:\/\/localhost(?::[0-9]+)?/, 'file://' + process.cwd());
                    resource.url.path = resource.url.pathname = path.join(process.cwd(), resource.url.path);
                }
                if (browserAPI.debug) console.info('Load resource "' + resource.url.href + '".');
                return resource.defaultFetch(function (error) {
                    if (!error) callback.apply(this, arguments);
                });
            },
            url: 'http://localhost',
            virtualConsole: virtualConsole
        });
        // endregion
    })();
} else {
    browserAPI = {
        debug: false, domContentLoaded: false, metaDOM: null, window: window,
        windowLoaded: false };
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
    var clear = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    // region initialize global context
    /*
        NOTE: We have to define window globally before anything is loaded to
        ensure that all future instances share the same window object.
    */
    if (clear && typeof global !== 'undefined' && global !== browserAPI.window) global.window = browserAPI.window;
    // endregion
    if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') return browserAPI ? callback(browserAPI, true) : onCreatedListener.push(callback);
    return browserAPI.domContentLoaded ? callback(browserAPI, true) : onCreatedListener.push(callback);
};
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,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RCxLQUpEO0FBS0EsV0FBTyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxZQUFXO0FBQ3ZDLG1CQUFXLFlBQVgsR0FBMEIsSUFBMUI7QUFDSCxLQUZEO0FBR0g7QUFDRDs7a0JBQ2UsVUFBQyxRQUFELEVBQWlEO0FBQUEsUUFBN0IsS0FBNkIseURBQWIsSUFBYTs7QUFDNUQ7QUFDQTs7OztBQUlBLFFBQUksU0FBUyxPQUFPLE1BQVAsS0FBa0IsV0FBM0IsSUFBMEMsV0FBVyxXQUFXLE1BQXBFLEVBQ0ksT0FBTyxNQUFQLEdBQWdCLFdBQVcsTUFBM0I7QUFDSjtBQUNBLFFBQ0ksT0FBTyxpQkFBUCxLQUE2QixXQUE3QixJQUNBLHNCQUFzQixNQUYxQixFQUlJLE9BQVEsVUFBRCxHQUFlLFNBQ2xCLFVBRGtCLEVBQ04sSUFETSxDQUFmLEdBRUgsa0JBQWtCLElBQWxCLENBQXVCLFFBQXZCLENBRko7QUFHSixXQUFRLFdBQVcsZ0JBQVosR0FBZ0MsU0FDbkMsVUFEbUMsRUFDdkIsSUFEdUIsQ0FBaEMsR0FFSCxrQkFBa0IsSUFBbEIsQ0FBdUIsUUFBdkIsQ0FGSjtBQUdILEM7QUFDRDtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJicm93c2VyQVBJLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgdHlwZSB7QnJvd3NlckFQSSwgRG9tTm9kZSwgV2luZG93fSBmcm9tICcuL3R5cGUnXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4gLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gZGVjbGFyYXRpb25cbmRlY2xhcmUgdmFyIE5BTUU6c3RyaW5nXG5kZWNsYXJlIHZhciBUQVJHRVRfVEVDSE5PTE9HWTpzdHJpbmdcbmRlY2xhcmUgdmFyIHdpbmRvdzpXaW5kb3dcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHZhcmlhYmxlc1xuY29uc3Qgb25DcmVhdGVkTGlzdGVuZXI6QXJyYXk8RnVuY3Rpb24+ID0gW11cbmxldCBicm93c2VyQVBJOkJyb3dzZXJBUElcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGVuc3VyZSBwcmVzZW5jZSBvZiBjb21tb24gYnJvd3NlciBlbnZpcm9ubWVudFxuaWYgKHR5cGVvZiBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ3VuZGVmaW5lZCcgfHwgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICdub2RlJykge1xuICAgIC8vIHJlZ2lvbiBtb2NrIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAgICBjb25zdCBwYXRoOk9iamVjdCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIGNvbnN0IG1ldGFET006T2JqZWN0ID0gcmVxdWlyZSgnanNkb20nKVxuICAgIGNvbnN0IHZpcnR1YWxDb25zb2xlOk9iamVjdCA9IG1ldGFET00uY3JlYXRlVmlydHVhbENvbnNvbGUoKS5zZW5kVG8oXG4gICAgICAgIGNvbnNvbGUsIHtvbWl0SnNkb21FcnJvcnM6IHRydWV9KVxuICAgIHZpcnR1YWxDb25zb2xlLm9uKCdqc2RvbUVycm9yJywgKGVycm9yOkVycm9yKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKCFicm93c2VyQVBJLmRlYnVnICYmIFtcbiAgICAgICAgICAgICdYTUxIdHRwUmVxdWVzdCcsICdyZXNvdXJjZSBsb2FkaW5nJ1xuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgXS5pbmNsdWRlcyhlcnJvci50eXBlKSlcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTG9hZGluZyByZXNvdXJjZSBmYWlsZWQ6ICR7ZXJyb3IudG9TdHJpbmcoKX0uYClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrLCBlcnJvci5kZXRhaWwpXG4gICAgfSlcbiAgICBsZXQgdGVtcGxhdGU6c3RyaW5nXG4gICAgaWYgKHR5cGVvZiBOQU1FID09PSAndW5kZWZpbmVkJyB8fCBOQU1FID09PSAnd2ViT3B0aW1pemVyJylcbiAgICAgICAgdGVtcGxhdGUgPSByZXF1aXJlKCdwdWcnKS5jb21waWxlRmlsZShwYXRoLmpvaW4oXG4gICAgICAgICAgICBfX2Rpcm5hbWUsICdpbmRleC5wdWcnXG4gICAgICAgICksIHtwcmV0dHk6IHRydWV9KSh7Y29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgbmFtZTogJ3Rlc3QnLCBnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOiBbXVxuICAgICAgICB9fSlcbiAgICBlbHNlXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICB0ZW1wbGF0ZSA9IHJlcXVpcmUoJ3dlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVQYXRoJylcbiAgICBtZXRhRE9NLmVudih7XG4gICAgICAgIGNyZWF0ZWQ6IChlcnJvcjo/RXJyb3IsIHdpbmRvdzpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICAgICAgYnJvd3NlckFQSSA9IHtcbiAgICAgICAgICAgICAgICBkZWJ1ZzogZmFsc2UsIGRvbUNvbnRlbnRMb2FkZWQ6IGZhbHNlLCBtZXRhRE9NLCB3aW5kb3csXG4gICAgICAgICAgICAgICAgd2luZG93TG9hZGVkOiBmYWxzZX1cbiAgICAgICAgICAgIGJyb3dzZXJBUEkud2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoXG4gICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIGJyb3dzZXJBUEkuZG9tQ29udGVudExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrOkZ1bmN0aW9uIG9mIG9uQ3JlYXRlZExpc3RlbmVyKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhicm93c2VyQVBJLCBmYWxzZSlcbiAgICAgICAgfSxcbiAgICAgICAgZmVhdHVyZXM6IHtcbiAgICAgICAgICAgIEZldGNoRXh0ZXJuYWxSZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICAnc2NyaXB0JywgJ2ZyYW1lJywgJ2lmcmFtZScsICdsaW5rJywgJ2ltZydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXM6IFsnc2NyaXB0J10sXG4gICAgICAgICAgICBTa2lwRXh0ZXJuYWxSZXNvdXJjZXM6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGh0bWw6IHRlbXBsYXRlLFxuICAgICAgICBvbmxvYWQ6ICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgYnJvd3NlckFQSS53aW5kb3dMb2FkZWQgPSB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHJlc291cmNlTG9hZGVyOiAoXG4gICAgICAgICAgICByZXNvdXJjZTp7XG4gICAgICAgICAgICAgICAgZWxlbWVudDpEb21Ob2RlO1xuICAgICAgICAgICAgICAgIHVybDp7XG4gICAgICAgICAgICAgICAgICAgIGhvc3RuYW1lOnN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgaG9zdDpzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6P3N0cmluZztcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2w6c3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBocmVmOnN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgcGF0aDpzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIHBhdGhuYW1lOnN0cmluZztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvb2tpZTpzdHJpbmc7XG4gICAgICAgICAgICAgICAgYmFzZVVybDpzdHJpbmc7XG4gICAgICAgICAgICAgICAgZGVmYXVsdEZldGNoOihjYWxsYmFjazooXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvciwgYm9keTpzdHJpbmdcbiAgICAgICAgICAgICAgICApID0+IHZvaWQpID0+IHZvaWRcbiAgICAgICAgICAgIH0sIGNhbGxiYWNrOihlcnJvcjo/RXJyb3IsIGJvZHk6c3RyaW5nKSA9PiB2b2lkXG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAocmVzb3VyY2UudXJsLmhvc3RuYW1lID09PSAnbG9jYWxob3N0Jykge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLnVybC5ob3N0ID0gcmVzb3VyY2UudXJsLmhvc3RuYW1lID0gJydcbiAgICAgICAgICAgICAgICByZXNvdXJjZS51cmwucG9ydCA9IG51bGxcbiAgICAgICAgICAgICAgICByZXNvdXJjZS51cmwucHJvdG9jb2wgPSAnZmlsZTonXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UudXJsLmhyZWYgPSByZXNvdXJjZS51cmwuaHJlZi5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXlthLXpBLVpdKzpcXC9cXC9sb2NhbGhvc3QoPzo6WzAtOV0rKT8vLFxuICAgICAgICAgICAgICAgICAgICBgZmlsZTovLyR7cHJvY2Vzcy5jd2QoKX1gKVxuICAgICAgICAgICAgICAgIHJlc291cmNlLnVybC5wYXRoID0gcmVzb3VyY2UudXJsLnBhdGhuYW1lID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmN3ZCgpLCByZXNvdXJjZS51cmwucGF0aClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChicm93c2VyQVBJLmRlYnVnKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgTG9hZCByZXNvdXJjZSBcIiR7cmVzb3VyY2UudXJsLmhyZWZ9XCIuYClcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS5kZWZhdWx0RmV0Y2goZnVuY3Rpb24oZXJyb3I6P0Vycm9yKTp2b2lkIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0JyxcbiAgICAgICAgdmlydHVhbENvbnNvbGVcbiAgICB9KVxuICAgIC8vIGVuZHJlZ2lvblxufSBlbHNlIHtcbiAgICBicm93c2VyQVBJID0ge1xuICAgICAgICBkZWJ1ZzogZmFsc2UsIGRvbUNvbnRlbnRMb2FkZWQ6IGZhbHNlLCBtZXRhRE9NOiBudWxsLCB3aW5kb3csXG4gICAgICAgIHdpbmRvd0xvYWRlZDogZmFsc2V9XG4gICAgd2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKTp2b2lkID0+IHtcbiAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrOkZ1bmN0aW9uIG9mIG9uQ3JlYXRlZExpc3RlbmVyKVxuICAgICAgICAgICAgY2FsbGJhY2soYnJvd3NlckFQSSwgZmFsc2UpXG4gICAgfSlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpOnZvaWQgPT4ge1xuICAgICAgICBicm93c2VyQVBJLndpbmRvd0xvYWRlZCA9IHRydWVcbiAgICB9KVxufVxuLy8gZW5kcmVnaW9uXG5leHBvcnQgZGVmYXVsdCAoY2FsbGJhY2s6RnVuY3Rpb24sIGNsZWFyOmJvb2xlYW4gPSB0cnVlKTphbnkgPT4ge1xuICAgIC8vIHJlZ2lvbiBpbml0aWFsaXplIGdsb2JhbCBjb250ZXh0XG4gICAgLypcbiAgICAgICAgTk9URTogV2UgaGF2ZSB0byBkZWZpbmUgd2luZG93IGdsb2JhbGx5IGJlZm9yZSBhbnl0aGluZyBpcyBsb2FkZWQgdG9cbiAgICAgICAgZW5zdXJlIHRoYXQgYWxsIGZ1dHVyZSBpbnN0YW5jZXMgc2hhcmUgdGhlIHNhbWUgd2luZG93IG9iamVjdC5cbiAgICAqL1xuICAgIGlmIChjbGVhciAmJiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyAmJiBnbG9iYWwgIT09IGJyb3dzZXJBUEkud2luZG93KVxuICAgICAgICBnbG9iYWwud2luZG93ID0gYnJvd3NlckFQSS53aW5kb3dcbiAgICAvLyBlbmRyZWdpb25cbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICdub2RlJ1xuICAgIClcbiAgICAgICAgcmV0dXJuIChicm93c2VyQVBJKSA/IGNhbGxiYWNrKFxuICAgICAgICAgICAgYnJvd3NlckFQSSwgdHJ1ZVxuICAgICAgICApIDogb25DcmVhdGVkTGlzdGVuZXIucHVzaChjYWxsYmFjaylcbiAgICByZXR1cm4gKGJyb3dzZXJBUEkuZG9tQ29udGVudExvYWRlZCkgPyBjYWxsYmFjayhcbiAgICAgICAgYnJvd3NlckFQSSwgdHJ1ZVxuICAgICkgOiBvbkNyZWF0ZWRMaXN0ZW5lci5wdXNoKGNhbGxiYWNrKVxufVxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=