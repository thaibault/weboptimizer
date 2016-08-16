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
const onCreatedListener = [];
/* eslint-enable no-unused-vars */
// endregion
// region declaration

let browserAPI;
// endregion
// region ensure presence of common browser environment
if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') {
    // region mock browser environment
    const path = require('path');
    const metaDOM = require('jsdom');
    const virtualConsole = metaDOM.createVirtualConsole().sendTo(console, { omitJsdomErrors: true });
    virtualConsole.on('jsdomError', error => {
        if (!browserAPI.debug && ['XMLHttpRequest', 'resource loading'
        // IgnoreTypeCheck
        ].includes(error.type)) console.warn(`Loading resource failed: ${ error.toString() }.`);else
            // IgnoreTypeCheck
            console.error(error.stack, error.detail);
    });
    let template;
    if (typeof NAME === 'undefined' || NAME === 'webOptimizer') template = require('pug').compileFile(path.join(__dirname, 'index.pug'), { pretty: true })({ configuration: {
            name: 'test', givenCommandLineArguments: []
        } });else
        // IgnoreTypeCheck
        template = require('webOptimizerDefaultTemplateFilePath');
    metaDOM.env({
        created: (error, window) => {
            browserAPI = {
                debug: false, domContentLoaded: false, metaDOM, window,
                windowLoaded: false };
            browserAPI.window.document.addEventListener('DOMContentLoaded', () => {
                browserAPI.domContentLoaded = true;
            });
            if (error) throw error;else for (const callback of onCreatedListener) callback(browserAPI, false);
        },
        features: {
            FetchExternalResources: ['script', 'frame', 'iframe', 'link', 'img'],
            ProcessExternalResources: ['script'],
            SkipExternalResources: false
        },
        html: template,
        onload: () => {
            browserAPI.domContentLoaded = true;
            browserAPI.windowLoaded = true;
        },
        resourceLoader: (resource, callback) => {
            if (resource.url.hostname === 'localhost') {
                resource.url.host = resource.url.hostname = '';
                resource.url.port = null;
                resource.url.protocol = 'file:';
                resource.url.href = resource.url.href.replace(/^[a-zA-Z]+:\/\/localhost(?::[0-9]+)?/, `file://${ process.cwd() }`);
                resource.url.path = resource.url.pathname = path.join(process.cwd(), resource.url.path);
            }
            if (browserAPI.debug) console.info(`Load resource "${ resource.url.href }".`);
            return resource.defaultFetch(function (error) {
                if (!error) callback.apply(this, arguments);
            });
        },
        url: 'http://localhost',
        virtualConsole
    });
    // endregion
} else {
        browserAPI = {
            debug: false, domContentLoaded: false, metaDOM: null, window,
            windowLoaded: false };
        window.document.addEventListener('DOMContentLoaded', () => {
            browserAPI.domContentLoaded = true;
            for (const callback of onCreatedListener) callback(browserAPI, false);
        });
        window.addEventListener('load', () => {
            browserAPI.windowLoaded = true;
        });
    }
// endregion

exports.default = (callback, clear = true) => {
    // region initialize global context
    /*
        NOTE: We have to define window globally before anything is loaded to
        ensure that all future instances share the same window object.
    */
    if (clear && typeof global !== 'undefined' && global !== browserAPI.window) {
        global.window = browserAPI.window;
        for (const key in browserAPI.window) if (browserAPI.window.hasOwnProperty(key) && !global.hasOwnProperty(key)) global[key] = browserAPI.window[key];
    }
    // endregion
    if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') return browserAPI ? callback(browserAPI, true) : onCreatedListener.push(callback);
    return browserAPI.domContentLoaded ? callback(browserAPI, true) : onCreatedListener.push(callback);
};
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,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RSxFQUVFO0FBQ0UsZUFBTyxNQUFQLEdBQWdCLFdBQVcsTUFBM0I7QUFDQSxhQUFLLE1BQU0sR0FBWCxJQUFrQixXQUFXLE1BQTdCLEVBQ0ksSUFBSSxXQUFXLE1BQVgsQ0FBa0IsY0FBbEIsQ0FDQSxHQURBLEtBRUMsQ0FBQyxPQUFPLGNBQVAsQ0FBc0IsR0FBdEIsQ0FGTixFQUdJLE9BQU8sR0FBUCxJQUFjLFdBQVcsTUFBWCxDQUFrQixHQUFsQixDQUFkO0FBQ1g7QUFDRDtBQUNBLFFBQ0ksT0FBTyxpQkFBUCxLQUE2QixXQUE3QixJQUNBLHNCQUFzQixNQUYxQixFQUlJLE9BQVEsVUFBRCxHQUFlLFNBQ2xCLFVBRGtCLEVBQ04sSUFETSxDQUFmLEdBRUgsa0JBQWtCLElBQWxCLENBQXVCLFFBQXZCLENBRko7QUFHSixXQUFRLFdBQVcsZ0JBQVosR0FBZ0MsU0FDbkMsVUFEbUMsRUFDdkIsSUFEdUIsQ0FBaEMsR0FFSCxrQkFBa0IsSUFBbEIsQ0FBdUIsUUFBdkIsQ0FGSjtBQUdILEM7QUFDRDtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJicm93c2VyQVBJLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgdHlwZSB7QnJvd3NlckFQSSwgRG9tTm9kZSwgV2luZG93fSBmcm9tICcuL3R5cGUnXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4gLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gZGVjbGFyYXRpb25cbmRlY2xhcmUgdmFyIE5BTUU6c3RyaW5nXG5kZWNsYXJlIHZhciBUQVJHRVRfVEVDSE5PTE9HWTpzdHJpbmdcbmRlY2xhcmUgdmFyIHdpbmRvdzpXaW5kb3dcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHZhcmlhYmxlc1xuY29uc3Qgb25DcmVhdGVkTGlzdGVuZXI6QXJyYXk8RnVuY3Rpb24+ID0gW11cbmxldCBicm93c2VyQVBJOkJyb3dzZXJBUElcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGVuc3VyZSBwcmVzZW5jZSBvZiBjb21tb24gYnJvd3NlciBlbnZpcm9ubWVudFxuaWYgKHR5cGVvZiBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ3VuZGVmaW5lZCcgfHwgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICdub2RlJykge1xuICAgIC8vIHJlZ2lvbiBtb2NrIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAgICBjb25zdCBwYXRoOk9iamVjdCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIGNvbnN0IG1ldGFET006T2JqZWN0ID0gcmVxdWlyZSgnanNkb20nKVxuICAgIGNvbnN0IHZpcnR1YWxDb25zb2xlOk9iamVjdCA9IG1ldGFET00uY3JlYXRlVmlydHVhbENvbnNvbGUoKS5zZW5kVG8oXG4gICAgICAgIGNvbnNvbGUsIHtvbWl0SnNkb21FcnJvcnM6IHRydWV9KVxuICAgIHZpcnR1YWxDb25zb2xlLm9uKCdqc2RvbUVycm9yJywgKGVycm9yOkVycm9yKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKCFicm93c2VyQVBJLmRlYnVnICYmIFtcbiAgICAgICAgICAgICdYTUxIdHRwUmVxdWVzdCcsICdyZXNvdXJjZSBsb2FkaW5nJ1xuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgXS5pbmNsdWRlcyhlcnJvci50eXBlKSlcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTG9hZGluZyByZXNvdXJjZSBmYWlsZWQ6ICR7ZXJyb3IudG9TdHJpbmcoKX0uYClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrLCBlcnJvci5kZXRhaWwpXG4gICAgfSlcbiAgICBsZXQgdGVtcGxhdGU6c3RyaW5nXG4gICAgaWYgKHR5cGVvZiBOQU1FID09PSAndW5kZWZpbmVkJyB8fCBOQU1FID09PSAnd2ViT3B0aW1pemVyJylcbiAgICAgICAgdGVtcGxhdGUgPSByZXF1aXJlKCdwdWcnKS5jb21waWxlRmlsZShwYXRoLmpvaW4oXG4gICAgICAgICAgICBfX2Rpcm5hbWUsICdpbmRleC5wdWcnXG4gICAgICAgICksIHtwcmV0dHk6IHRydWV9KSh7Y29uZmlndXJhdGlvbjoge1xuICAgICAgICAgICAgbmFtZTogJ3Rlc3QnLCBnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOiBbXVxuICAgICAgICB9fSlcbiAgICBlbHNlXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICB0ZW1wbGF0ZSA9IHJlcXVpcmUoJ3dlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVQYXRoJylcbiAgICBtZXRhRE9NLmVudih7XG4gICAgICAgIGNyZWF0ZWQ6IChlcnJvcjo/RXJyb3IsIHdpbmRvdzpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICAgICAgYnJvd3NlckFQSSA9IHtcbiAgICAgICAgICAgICAgICBkZWJ1ZzogZmFsc2UsIGRvbUNvbnRlbnRMb2FkZWQ6IGZhbHNlLCBtZXRhRE9NLCB3aW5kb3csXG4gICAgICAgICAgICAgICAgd2luZG93TG9hZGVkOiBmYWxzZX1cbiAgICAgICAgICAgIGJyb3dzZXJBUEkud2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoXG4gICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIGJyb3dzZXJBUEkuZG9tQ29udGVudExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrOkZ1bmN0aW9uIG9mIG9uQ3JlYXRlZExpc3RlbmVyKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhicm93c2VyQVBJLCBmYWxzZSlcbiAgICAgICAgfSxcbiAgICAgICAgZmVhdHVyZXM6IHtcbiAgICAgICAgICAgIEZldGNoRXh0ZXJuYWxSZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICAnc2NyaXB0JywgJ2ZyYW1lJywgJ2lmcmFtZScsICdsaW5rJywgJ2ltZydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBQcm9jZXNzRXh0ZXJuYWxSZXNvdXJjZXM6IFsnc2NyaXB0J10sXG4gICAgICAgICAgICBTa2lwRXh0ZXJuYWxSZXNvdXJjZXM6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGh0bWw6IHRlbXBsYXRlLFxuICAgICAgICBvbmxvYWQ6ICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgYnJvd3NlckFQSS53aW5kb3dMb2FkZWQgPSB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHJlc291cmNlTG9hZGVyOiAoXG4gICAgICAgICAgICByZXNvdXJjZTp7XG4gICAgICAgICAgICAgICAgZWxlbWVudDpEb21Ob2RlO1xuICAgICAgICAgICAgICAgIHVybDp7XG4gICAgICAgICAgICAgICAgICAgIGhvc3RuYW1lOnN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgaG9zdDpzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIHBvcnQ6P3N0cmluZztcbiAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2w6c3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICBocmVmOnN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgcGF0aDpzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIHBhdGhuYW1lOnN0cmluZztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvb2tpZTpzdHJpbmc7XG4gICAgICAgICAgICAgICAgYmFzZVVybDpzdHJpbmc7XG4gICAgICAgICAgICAgICAgZGVmYXVsdEZldGNoOihjYWxsYmFjazooXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvciwgYm9keTpzdHJpbmdcbiAgICAgICAgICAgICAgICApID0+IHZvaWQpID0+IHZvaWRcbiAgICAgICAgICAgIH0sIGNhbGxiYWNrOihlcnJvcjo/RXJyb3IsIGJvZHk6c3RyaW5nKSA9PiB2b2lkXG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAocmVzb3VyY2UudXJsLmhvc3RuYW1lID09PSAnbG9jYWxob3N0Jykge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLnVybC5ob3N0ID0gcmVzb3VyY2UudXJsLmhvc3RuYW1lID0gJydcbiAgICAgICAgICAgICAgICByZXNvdXJjZS51cmwucG9ydCA9IG51bGxcbiAgICAgICAgICAgICAgICByZXNvdXJjZS51cmwucHJvdG9jb2wgPSAnZmlsZTonXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UudXJsLmhyZWYgPSByZXNvdXJjZS51cmwuaHJlZi5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvXlthLXpBLVpdKzpcXC9cXC9sb2NhbGhvc3QoPzo6WzAtOV0rKT8vLFxuICAgICAgICAgICAgICAgICAgICBgZmlsZTovLyR7cHJvY2Vzcy5jd2QoKX1gKVxuICAgICAgICAgICAgICAgIHJlc291cmNlLnVybC5wYXRoID0gcmVzb3VyY2UudXJsLnBhdGhuYW1lID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmN3ZCgpLCByZXNvdXJjZS51cmwucGF0aClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChicm93c2VyQVBJLmRlYnVnKVxuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgTG9hZCByZXNvdXJjZSBcIiR7cmVzb3VyY2UudXJsLmhyZWZ9XCIuYClcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZS5kZWZhdWx0RmV0Y2goZnVuY3Rpb24oZXJyb3I6P0Vycm9yKTp2b2lkIHtcbiAgICAgICAgICAgICAgICBpZiAoIWVycm9yKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0JyxcbiAgICAgICAgdmlydHVhbENvbnNvbGVcbiAgICB9KVxuICAgIC8vIGVuZHJlZ2lvblxufSBlbHNlIHtcbiAgICBicm93c2VyQVBJID0ge1xuICAgICAgICBkZWJ1ZzogZmFsc2UsIGRvbUNvbnRlbnRMb2FkZWQ6IGZhbHNlLCBtZXRhRE9NOiBudWxsLCB3aW5kb3csXG4gICAgICAgIHdpbmRvd0xvYWRlZDogZmFsc2V9XG4gICAgd2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKTp2b2lkID0+IHtcbiAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrOkZ1bmN0aW9uIG9mIG9uQ3JlYXRlZExpc3RlbmVyKVxuICAgICAgICAgICAgY2FsbGJhY2soYnJvd3NlckFQSSwgZmFsc2UpXG4gICAgfSlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpOnZvaWQgPT4ge1xuICAgICAgICBicm93c2VyQVBJLndpbmRvd0xvYWRlZCA9IHRydWVcbiAgICB9KVxufVxuLy8gZW5kcmVnaW9uXG5leHBvcnQgZGVmYXVsdCAoY2FsbGJhY2s6RnVuY3Rpb24sIGNsZWFyOmJvb2xlYW4gPSB0cnVlKTphbnkgPT4ge1xuICAgIC8vIHJlZ2lvbiBpbml0aWFsaXplIGdsb2JhbCBjb250ZXh0XG4gICAgLypcbiAgICAgICAgTk9URTogV2UgaGF2ZSB0byBkZWZpbmUgd2luZG93IGdsb2JhbGx5IGJlZm9yZSBhbnl0aGluZyBpcyBsb2FkZWQgdG9cbiAgICAgICAgZW5zdXJlIHRoYXQgYWxsIGZ1dHVyZSBpbnN0YW5jZXMgc2hhcmUgdGhlIHNhbWUgd2luZG93IG9iamVjdC5cbiAgICAqL1xuICAgIGlmIChcbiAgICAgICAgY2xlYXIgJiYgdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgJiYgZ2xvYmFsICE9PSBicm93c2VyQVBJLndpbmRvd1xuICAgICkge1xuICAgICAgICBnbG9iYWwud2luZG93ID0gYnJvd3NlckFQSS53aW5kb3dcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gYnJvd3NlckFQSS53aW5kb3cpXG4gICAgICAgICAgICBpZiAoYnJvd3NlckFQSS53aW5kb3cuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAga2V5XG4gICAgICAgICAgICApICYmICFnbG9iYWwuaGFzT3duUHJvcGVydHkoa2V5KSlcbiAgICAgICAgICAgICAgICBnbG9iYWxba2V5XSA9IGJyb3dzZXJBUEkud2luZG93W2tleV1cbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG4gICAgaWYgKFxuICAgICAgICB0eXBlb2YgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgIFRBUkdFVF9URUNITk9MT0dZID09PSAnbm9kZSdcbiAgICApXG4gICAgICAgIHJldHVybiAoYnJvd3NlckFQSSkgPyBjYWxsYmFjayhcbiAgICAgICAgICAgIGJyb3dzZXJBUEksIHRydWVcbiAgICAgICAgKSA6IG9uQ3JlYXRlZExpc3RlbmVyLnB1c2goY2FsbGJhY2spXG4gICAgcmV0dXJuIChicm93c2VyQVBJLmRvbUNvbnRlbnRMb2FkZWQpID8gY2FsbGJhY2soXG4gICAgICAgIGJyb3dzZXJBUEksIHRydWVcbiAgICApIDogb25DcmVhdGVkTGlzdGVuZXIucHVzaChjYWxsYmFjaylcbn1cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19