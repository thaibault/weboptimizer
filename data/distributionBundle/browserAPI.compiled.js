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

// endregion
// region variables
const onCreatedListener = [];
// endregion
// region declaration

let browserAPI;
// endregion
// region ensure presence of common browser environment
if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') {
    // region mock browser environment
    const path = require('path');
    const { JSDOM, VirtualConsole } = require('jsdom');
    const virtualConsole = new VirtualConsole();
    for (const name of ['assert', 'dir', 'info', 'log', 'time', 'timeEnd', 'trace', 'warn']) virtualConsole.on(name, console[name].bind(console));
    virtualConsole.on('error', function (error) {
        if (!browserAPI.debug && ['XMLHttpRequest', 'resource loading'
        // IgnoreTypeCheck
        ].includes(error.type)) console.warn(`Loading resource failed: ${error.toString()}.`);else
            // IgnoreTypeCheck
            console.error(error.stack, error.detail);
    });
    const render = function render(template) {
        let window = new JSDOM(template, {
            resources: 'usable',
            runScripts: 'dangerously',
            url: 'http://localhost',
            virtualConsole
        }).window;
        browserAPI = {
            debug: false, domContentLoaded: false, DOM: JSDOM, window,
            windowLoaded: false };
        window.addEventListener('load', function () {
            // NOTE: Maybe we have miss the "DOMContentLoaded" event.
            browserAPI.domContentLoaded = true;
            browserAPI.windowLoaded = true;
        });
        window.document.addEventListener('DOMContentLoaded', function () {
            browserAPI.domContentLoaded = true;
        });
        for (const callback of onCreatedListener) callback(browserAPI, false);
        return window;
    };
    if (typeof NAME === 'undefined' || NAME === 'webOptimizer') {
        const filePath = path.join(__dirname, 'index.html.ejs');
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
        debug: false, domContentLoaded: false, DOM: null, window,
        windowLoaded: false };
    window.document.addEventListener('DOMContentLoaded', function () {
        browserAPI.domContentLoaded = true;
        for (const callback of onCreatedListener) callback(browserAPI, false);
    });
    window.addEventListener('load', function () {
        browserAPI.windowLoaded = true;
    });
}
// endregion

exports.default = function (callback, clear = true) {
    // region initialize global context
    const wrappedCallback = function wrappedCallback(...parameter) {
        if (clear && typeof global !== 'undefined' && global !== browserAPI.window) global.window = browserAPI.window;
        return callback(...parameter);
    };
    // endregion
    if (typeof TARGET_TECHNOLOGY === 'undefined' || TARGET_TECHNOLOGY === 'node') return browserAPI ? wrappedCallback(browserAPI, true) : onCreatedListener.push(wrappedCallback);
    return browserAPI.domContentLoaded ? wrappedCallback(browserAPI, true) : onCreatedListener.push(wrappedCallback);
};
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FEdkIsRUFDOEIsS0FBSyxJQURuQyxFQUN5QyxNQUR6QztBQUVULHNCQUFjLEtBRkwsRUFBYjtBQUdBLFdBQU8sUUFBUCxDQUFnQixnQkFBaEIsQ0FBaUMsa0JBQWpDLEVBQXFELFlBQVc7QUFDNUQsbUJBQVcsZ0JBQVgsR0FBOEIsSUFBOUI7QUFDQSxhQUFLLE1BQU0sUUFBWCxJQUFnQyxpQkFBaEMsRUFDSSxTQUFTLFVBQVQsRUFBcUIsS0FBckI7QUFDUCxLQUpEO0FBS0EsV0FBTyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxZQUFXO0FBQ3ZDLG1CQUFXLFlBQVgsR0FBMEIsSUFBMUI7QUFDSCxLQUZEO0FBR0g7QUFDRDs7a0JBQ2UsVUFBQyxRQUFELEVBQW9CLFFBQWdCLElBQXBDLEVBQWlEO0FBQzVEO0FBS0EsVUFBTSxrQkFBMkIsU0FBM0IsZUFBMkIsQ0FBQyxHQUFHLFNBQUosRUFBaUM7QUFDOUQsWUFDSSxTQUFTLE9BQU8sTUFBUCxLQUFrQixXQUEzQixJQUNBLFdBQVcsV0FBVyxNQUYxQixFQUlJLE9BQU8sTUFBUCxHQUFnQixXQUFXLE1BQTNCO0FBQ0osZUFBTyxTQUFTLEdBQUcsU0FBWixDQUFQO0FBQ0gsS0FQRDtBQVFBO0FBQ0EsUUFDSSxPQUFPLGlCQUFQLEtBQTZCLFdBQTdCLElBQ0Esc0JBQXNCLE1BRjFCLEVBSUksT0FBUSxVQUFELEdBQWUsZ0JBQ2xCLFVBRGtCLEVBQ04sSUFETSxDQUFmLEdBRUgsa0JBQWtCLElBQWxCLENBQXVCLGVBQXZCLENBRko7QUFHSixXQUFRLFdBQVcsZ0JBQVosR0FBZ0MsZ0JBQ25DLFVBRG1DLEVBQ3ZCLElBRHVCLENBQWhDLEdBRUgsa0JBQWtCLElBQWxCLENBQXVCLGVBQXZCLENBRko7QUFHSCxDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnJvd3NlckFQSS5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vICMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgdHlwZSB7V2luZG93fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHR5cGUge0Jyb3dzZXJBUEl9IGZyb20gJy4vdHlwZSdcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGRlY2xhcmF0aW9uXG5kZWNsYXJlIHZhciBOQU1FOnN0cmluZ1xuZGVjbGFyZSB2YXIgVEFSR0VUX1RFQ0hOT0xPR1k6c3RyaW5nXG5kZWNsYXJlIHZhciB3aW5kb3c6V2luZG93XG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2YXJpYWJsZXNcbmNvbnN0IG9uQ3JlYXRlZExpc3RlbmVyOkFycmF5PEZ1bmN0aW9uPiA9IFtdXG5sZXQgYnJvd3NlckFQSTpCcm93c2VyQVBJXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBlbnN1cmUgcHJlc2VuY2Ugb2YgY29tbW9uIGJyb3dzZXIgZW52aXJvbm1lbnRcbmlmICh0eXBlb2YgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICd1bmRlZmluZWQnIHx8IFRBUkdFVF9URUNITk9MT0dZID09PSAnbm9kZScpIHtcbiAgICAvLyByZWdpb24gbW9jayBicm93c2VyIGVudmlyb25tZW50XG4gICAgY29uc3QgcGF0aDpPYmplY3QgPSByZXF1aXJlKCdwYXRoJylcbiAgICBjb25zdCB7SlNET00sIFZpcnR1YWxDb25zb2xlfSA9IHJlcXVpcmUoJ2pzZG9tJylcbiAgICBjb25zdCB2aXJ0dWFsQ29uc29sZTpPYmplY3QgPSBuZXcgVmlydHVhbENvbnNvbGUoKVxuICAgIGZvciAoY29uc3QgbmFtZTpzdHJpbmcgb2YgW1xuICAgICAgICAnYXNzZXJ0JywgJ2RpcicsICdpbmZvJywgJ2xvZycsICd0aW1lJywgJ3RpbWVFbmQnLCAndHJhY2UnLCAnd2FybidcbiAgICBdKVxuICAgICAgICB2aXJ0dWFsQ29uc29sZS5vbihuYW1lLCBjb25zb2xlW25hbWVdLmJpbmQoY29uc29sZSkpXG4gICAgdmlydHVhbENvbnNvbGUub24oJ2Vycm9yJywgKGVycm9yOkVycm9yKTp2b2lkID0+IHtcbiAgICAgICAgaWYgKCFicm93c2VyQVBJLmRlYnVnICYmIFtcbiAgICAgICAgICAgICdYTUxIdHRwUmVxdWVzdCcsICdyZXNvdXJjZSBsb2FkaW5nJ1xuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgXS5pbmNsdWRlcyhlcnJvci50eXBlKSlcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgTG9hZGluZyByZXNvdXJjZSBmYWlsZWQ6ICR7ZXJyb3IudG9TdHJpbmcoKX0uYClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yLnN0YWNrLCBlcnJvci5kZXRhaWwpXG4gICAgfSlcbiAgICBjb25zdCByZW5kZXI6RnVuY3Rpb24gPSAodGVtcGxhdGU6c3RyaW5nKTpXaW5kb3cgPT4ge1xuICAgICAgICBsZXQgd2luZG93OldpbmRvdyA9IChuZXcgSlNET00odGVtcGxhdGUsIHtcbiAgICAgICAgICAgIHJlc291cmNlczogJ3VzYWJsZScsXG4gICAgICAgICAgICBydW5TY3JpcHRzOiAnZGFuZ2Vyb3VzbHknLFxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdCcsXG4gICAgICAgICAgICB2aXJ0dWFsQ29uc29sZVxuICAgICAgICB9KSkud2luZG93XG4gICAgICAgIGJyb3dzZXJBUEkgPSB7XG4gICAgICAgICAgICBkZWJ1ZzogZmFsc2UsIGRvbUNvbnRlbnRMb2FkZWQ6IGZhbHNlLCBET006IEpTRE9NLCB3aW5kb3csXG4gICAgICAgICAgICB3aW5kb3dMb2FkZWQ6IGZhbHNlfVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgLy8gTk9URTogTWF5YmUgd2UgaGF2ZSBtaXNzIHRoZSBcIkRPTUNvbnRlbnRMb2FkZWRcIiBldmVudC5cbiAgICAgICAgICAgIGJyb3dzZXJBUEkuZG9tQ29udGVudExvYWRlZCA9IHRydWVcbiAgICAgICAgICAgIGJyb3dzZXJBUEkud2luZG93TG9hZGVkID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkID0gdHJ1ZVxuICAgICAgICB9KVxuICAgICAgICBmb3IgKGNvbnN0IGNhbGxiYWNrOkZ1bmN0aW9uIG9mIG9uQ3JlYXRlZExpc3RlbmVyKVxuICAgICAgICAgICAgY2FsbGJhY2soYnJvd3NlckFQSSwgZmFsc2UpXG4gICAgICAgIHJldHVybiB3aW5kb3dcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBOQU1FID09PSAndW5kZWZpbmVkJyB8fCBOQU1FID09PSAnd2ViT3B0aW1pemVyJykge1xuICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnaW5kZXguaHRtbC5lanMnKVxuICAgICAgICByZXF1aXJlKCdmcycpLnJlYWRGaWxlKGZpbGVQYXRoLCB7ZW5jb2Rpbmc6ICd1dGYtOCd9LCAoXG4gICAgICAgICAgICBlcnJvcjo/RXJyb3IsIGNvbnRlbnQ6c3RyaW5nXG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgICAgIHJlbmRlcihyZXF1aXJlKCcuL2Vqc0xvYWRlci5jb21waWxlZCcpLmJpbmQoe2ZpbGVuYW1lOiBmaWxlUGF0aH0pKFxuICAgICAgICAgICAgICAgIGNvbnRlbnQpKVxuICAgICAgICB9KVxuICAgIH0gZWxzZVxuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgcmVuZGVyKHJlcXVpcmUoJ3dlYk9wdGltaXplckRlZmF1bHRUZW1wbGF0ZUZpbGVQYXRoJykpXG4gICAgLy8gZW5kcmVnaW9uXG59IGVsc2Uge1xuICAgIGJyb3dzZXJBUEkgPSB7XG4gICAgICAgIGRlYnVnOiBmYWxzZSwgZG9tQ29udGVudExvYWRlZDogZmFsc2UsIERPTTogbnVsbCwgd2luZG93LFxuICAgICAgICB3aW5kb3dMb2FkZWQ6IGZhbHNlfVxuICAgIHdpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCk6dm9pZCA9PiB7XG4gICAgICAgIGJyb3dzZXJBUEkuZG9tQ29udGVudExvYWRlZCA9IHRydWVcbiAgICAgICAgZm9yIChjb25zdCBjYWxsYmFjazpGdW5jdGlvbiBvZiBvbkNyZWF0ZWRMaXN0ZW5lcilcbiAgICAgICAgICAgIGNhbGxiYWNrKGJyb3dzZXJBUEksIGZhbHNlKVxuICAgIH0pXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKTp2b2lkID0+IHtcbiAgICAgICAgYnJvd3NlckFQSS53aW5kb3dMb2FkZWQgPSB0cnVlXG4gICAgfSlcbn1cbi8vIGVuZHJlZ2lvblxuZXhwb3J0IGRlZmF1bHQgKGNhbGxiYWNrOkZ1bmN0aW9uLCBjbGVhcjpib29sZWFuID0gdHJ1ZSk6YW55ID0+IHtcbiAgICAvLyByZWdpb24gaW5pdGlhbGl6ZSBnbG9iYWwgY29udGV4dFxuICAgIC8qXG4gICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gZGVmaW5lIHdpbmRvdyBnbG9iYWxseSBiZWZvcmUgYW55dGhpbmcgaXMgbG9hZGVkIHRvXG4gICAgICAgIGVuc3VyZSB0aGF0IGFsbCBmdXR1cmUgaW5zdGFuY2VzIHNoYXJlIHRoZSBzYW1lIHdpbmRvdyBvYmplY3QuXG4gICAgKi9cbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2s6RnVuY3Rpb24gPSAoLi4ucGFyYW1ldGVyOkFycmF5PGFueT4pOmFueSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGNsZWFyICYmIHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgICAgICBnbG9iYWwgIT09IGJyb3dzZXJBUEkud2luZG93XG4gICAgICAgIClcbiAgICAgICAgICAgIGdsb2JhbC53aW5kb3cgPSBicm93c2VyQVBJLndpbmRvd1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soLi4ucGFyYW1ldGVyKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBUQVJHRVRfVEVDSE5PTE9HWSA9PT0gJ3VuZGVmaW5lZCcgfHxcbiAgICAgICAgVEFSR0VUX1RFQ0hOT0xPR1kgPT09ICdub2RlJ1xuICAgIClcbiAgICAgICAgcmV0dXJuIChicm93c2VyQVBJKSA/IHdyYXBwZWRDYWxsYmFjayhcbiAgICAgICAgICAgIGJyb3dzZXJBUEksIHRydWVcbiAgICAgICAgKSA6IG9uQ3JlYXRlZExpc3RlbmVyLnB1c2god3JhcHBlZENhbGxiYWNrKVxuICAgIHJldHVybiAoYnJvd3NlckFQSS5kb21Db250ZW50TG9hZGVkKSA/IHdyYXBwZWRDYWxsYmFjayhcbiAgICAgICAgYnJvd3NlckFQSSwgdHJ1ZVxuICAgICkgOiBvbkNyZWF0ZWRMaXN0ZW5lci5wdXNoKHdyYXBwZWRDYWxsYmFjaylcbn1cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19