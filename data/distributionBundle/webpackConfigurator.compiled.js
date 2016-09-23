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

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _jsdom = require('jsdom');

var dom = _interopRequireWildcard(_jsdom);

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _postcssCssnext = require('postcss-cssnext');

var _postcssCssnext2 = _interopRequireDefault(_postcssCssnext);

var _postcssFontpath = require('postcss-fontpath');

var _postcssFontpath2 = _interopRequireDefault(_postcssFontpath);

var _postcssImport = require('postcss-import');

var _postcssImport2 = _interopRequireDefault(_postcssImport);

var _postcssSprites = require('postcss-sprites');

var _postcssSprites2 = _interopRequireDefault(_postcssSprites);

var _postcssUrl = require('postcss-url');

var _postcssUrl2 = _interopRequireDefault(_postcssUrl);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackSources = require('webpack-sources');

var _configurator = require('./configurator.compiled');

var _configurator2 = _interopRequireDefault(_configurator);

var _helper = require('./helper.compiled');

var _helper2 = _interopRequireDefault(_helper);

var _htmlLoader = require('html-loader');

var _htmlLoader2 = _interopRequireDefault(_htmlLoader);

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}
var plugins = require('webpack-load-plugins')();


plugins.HTML = plugins.html;
plugins.ExtractText = plugins.extractText;
plugins.AddAssetHTMLPlugin = require('add-asset-html-webpack-plugin');
plugins.OpenBrowser = plugins.openBrowser;
plugins.Favicon = require('favicons-webpack-plugin');
plugins.Imagemin = require('imagemin-webpack-plugin').default;
plugins.Offline = require('offline-plugin');

// / region monkey patches
// Monkey-Patch html loader to retrieve html loader options since the
// "webpack-html-plugin" doesn't preserve the original loader interface.

require.cache[require.resolve('html-loader')].exports = function () {
    _clientnode2.default.extendObject(true, this.options, module, this.options);
    return _htmlLoader2.default.apply(this, arguments);
};
// Monkey-Patch loader-utils to define which url is a local request.

var loaderUtilsIsUrlRequestBackup = _loaderUtils2.default.isUrlRequest;
require.cache[require.resolve('loader-utils')].exports.isUrlRequest = function (url) {
    if (url.match(/^[a-z]+:.+/)) return false;
    return loaderUtilsIsUrlRequestBackup.apply(_loaderUtils2.default, arguments);
};
// / endregion
// endregion
// region initialisation
// / region determine library name
var libraryName = void 0;
if ('libraryName' in _configurator2.default && _configurator2.default.libraryName) libraryName = _configurator2.default.libraryName;else if (Object.keys(_configurator2.default.injection.internal.normalized).length > 1) libraryName = '[name]';else {
    libraryName = _configurator2.default.name;
    if (_configurator2.default.exportFormat.self === 'var') libraryName = _clientnode2.default.stringConvertToValidVariableName(libraryName);
}
// / endregion
// / region plugins
var pluginInstances = [new _webpack2.default.optimize.OccurrenceOrderPlugin(true)];
// // region define modules to ignore
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = _configurator2.default.injection.ignorePattern[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var ignorePattern = _step.value;

        pluginInstances.push(new _webpack2.default.IgnorePlugin(new RegExp(ignorePattern)));
    } // // endregion
    // // region generate html file
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

var htmlAvailable = false;
if (_configurator2.default.givenCommandLineArguments[2] !== 'buildDLL') {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = _configurator2.default.files.html[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _htmlConfiguration = _step2.value;

            if (_helper2.default.isFileSync(_htmlConfiguration.template.substring(_htmlConfiguration.template.lastIndexOf('!') + 1))) {
                if (_htmlConfiguration.template === _configurator2.default.files.defaultHTML.template) _htmlConfiguration.template = _htmlConfiguration.template.substring(_htmlConfiguration.template.lastIndexOf('!') + 1);
                pluginInstances.push(new plugins.HTML(_htmlConfiguration));
                htmlAvailable = true;
            }
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
} // // endregion
// // region generate favicons
if (htmlAvailable && _configurator2.default.favicon && _helper2.default.isFileSync(_configurator2.default.favicon.logo)) pluginInstances.push(new plugins.Favicon(_configurator2.default.favicon));
// // endregion
// // region provide offline functionality
if (htmlAvailable && _configurator2.default.offline) {
    if (!['serve', 'testInBrowser'].includes(_configurator2.default.givenCommandLineArguments[2])) {
        if (_configurator2.default.inPlace.cascadingStyleSheet) _configurator2.default.offline.excludes.push(_path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.path.target.asset.cascadingStyleSheet) + ('*.css?' + _configurator2.default.hashAlgorithm + '=*'));
        if (_configurator2.default.inPlace.javaScript) _configurator2.default.offline.excludes.push(_path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.path.target.asset.javaScript) + ('*.js?' + _configurator2.default.hashAlgorithm + '=*'));
    }
    pluginInstances.push(new plugins.Offline(_configurator2.default.offline));
}
// // endregion
// // region opens browser automatically
if (_configurator2.default.development.openBrowser && htmlAvailable && ['serve', 'testInBrowser'].includes(_configurator2.default.givenCommandLineArguments[2])) pluginInstances.push(new plugins.OpenBrowser(_configurator2.default.development.openBrowser));
// // endregion
// // region provide build environment
if (_configurator2.default.build.definitions) pluginInstances.push(new _webpack2.default.DefinePlugin(_configurator2.default.build.definitions));
if (_configurator2.default.module.provide) pluginInstances.push(new _webpack2.default.ProvidePlugin(_configurator2.default.module.provide));
// // endregion
// // region modules/assets
// /// region perform javaScript minification/optimisation
if (_configurator2.default.module.optimizer.uglifyJS) pluginInstances.push(new _webpack2.default.optimize.UglifyJsPlugin(_configurator2.default.module.optimizer.uglifyJS));
// /// endregion
// /// region apply module pattern
pluginInstances.push({ apply: function apply(compiler) {
        compiler.plugin('emit', function (compilation, callback) {
            for (var request in compilation.assets) {
                if (compilation.assets.hasOwnProperty(request)) {
                    var filePath = request.replace(/\?[^?]+$/, '');
                    var type = _helper2.default.determineAssetType(filePath, _configurator2.default.build.types, _configurator2.default.path);
                    if (type && _configurator2.default.assetPattern[type] && !new RegExp(_configurator2.default.assetPattern[type].excludeFilePathRegularExpression).test(filePath)) {
                        var source = compilation.assets[request].source();
                        if (typeof source === 'string') compilation.assets[request] = new _webpackSources.RawSource(_configurator2.default.assetPattern[type].pattern.replace(/\{1\}/g, source.replace(/\$/g, '$$$')));
                    }
                }
            }callback();
        });
    } });
// /// endregion
// /// region in-place configured assets in the main html file
if (htmlAvailable && !['serve', 'testInBrowser'].includes(_configurator2.default.givenCommandLineArguments[2])) pluginInstances.push({ apply: function apply(compiler) {
        compiler.plugin('emit', function (compilation, callback) {
            if (_configurator2.default.files.html[0].filename in compilation.assets && (_configurator2.default.inPlace.cascadingStyleSheet || _configurator2.default.inPlace.javaScript)) dom.env(compilation.assets[_configurator2.default.files.html[0].filename].source(), function (error, window) {
                if (_configurator2.default.inPlace.cascadingStyleSheet) {
                    var urlPrefix = _path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.cascadingStyleSheet.replace('[contenthash]', ''));
                    var domNode = window.document.querySelector('link[href^="' + urlPrefix + '"]');
                    if (domNode) {
                        var asset = void 0;
                        for (asset in compilation.assets) {
                            if (asset.startsWith(urlPrefix)) break;
                        }var inPlaceDomNode = window.document.createElement('style');
                        inPlaceDomNode.textContent = compilation.assets[asset].source();
                        domNode.parentNode.insertBefore(inPlaceDomNode, domNode);
                        domNode.parentNode.removeChild(domNode);
                        /*
                            NOTE: This doesn't prevent webpack from
                            creating this file if present in another chunk
                            so removing it (and a potential source map
                            file) later in the "done" hook.
                        */
                        delete compilation.assets[asset];
                    } else console.warn('No referenced cascading style sheet file in' + ' resulting markup found with ' + ('selector: link[href^="' + urlPrefix + '"]'));
                }
                if (_configurator2.default.inPlace.javaScript) {
                    var _urlPrefix = _path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.javaScript.replace('[hash]', ''));
                    var _domNode = window.document.querySelector('script[src^="' + _urlPrefix + '"]');
                    if (_domNode) {
                        var _asset = void 0;
                        for (_asset in compilation.assets) {
                            if (_asset.startsWith(_urlPrefix)) break;
                        }_domNode.textContent = compilation.assets[_asset].source();
                        _domNode.removeAttribute('src');
                        /*
                            NOTE: This doesn't prevent webpack from
                            creating this file if present in another chunk
                            so removing it (and a potential source map
                            file) later in the "done" hook.
                        */
                        delete compilation.assets[_asset];
                    } else console.warn('No referenced javaScript file in resulting ' + 'markup found with selector: ' + ('script[src^="' + _urlPrefix + '"]'));
                }
                compilation.assets[_configurator2.default.files.html[0].filename] = new _webpackSources.RawSource(compilation.assets[_configurator2.default.files.html[0].filename].source().replace(/^(\s*<!doctype[^>]+?>\s*)[\s\S]*$/i, '$1') + window.document.documentElement.outerHTML);
                callback();
            });else callback();
        });
        compiler.plugin('after-emit', function (compilation, callback) {
            if (_configurator2.default.files.html[0].filename in compilation.assets) {
                if (_configurator2.default.inPlace.cascadingStyleSheet) {
                    var assetFilePath = _helper2.default.stripLoader(_configurator2.default.files.compose.cascadingStyleSheet);
                    if (_helper2.default.isFileSync(assetFilePath)) fileSystem.unlinkSync(assetFilePath);
                }
                if (_configurator2.default.inPlace.javaScript) {
                    var assetFilePathTemplate = _helper2.default.stripLoader(_configurator2.default.files.compose.javaScript);
                    for (var chunkName in _configurator2.default.injection.internal.normalized) {
                        if (_configurator2.default.injection.internal.normalized.hasOwnProperty(chunkName)) {
                            var _assetFilePath = _helper2.default.renderFilePathTemplate(assetFilePathTemplate, { '[name]': chunkName });
                            if (_helper2.default.isFileSync(_assetFilePath)) fileSystem.unlinkSync(_assetFilePath);
                        }
                    }
                }
                var _arr = ['javaScript', 'cascadingStyleSheet'];
                for (var _i = 0; _i < _arr.length; _i++) {
                    var type = _arr[_i];
                    if (fileSystem.readdirSync(_configurator2.default.path.target.asset[type]).length === 0) fileSystem.rmdirSync(_configurator2.default.path.target.asset[type]);
                }
            }
            callback();
        });
    } });
// /// endregion
// /// region remove chunks if a corresponding dll package exists
if (_configurator2.default.givenCommandLineArguments[2] !== 'buildDLL') for (var chunkName in _configurator2.default.injection.internal.normalized) {
    if (_configurator2.default.injection.internal.normalized.hasOwnProperty(chunkName)) {
        var manifestFilePath = _configurator2.default.path.target.base + '/' + chunkName + '.' + 'dll-manifest.json';
        if (_configurator2.default.dllManifestFilePaths.includes(manifestFilePath)) {
            delete _configurator2.default.injection.internal.normalized[chunkName];
            var filePath = _helper2.default.renderFilePathTemplate(_helper2.default.stripLoader(_configurator2.default.files.compose.javaScript), { '[name]': chunkName });
            pluginInstances.push(new plugins.AddAssetHTMLPlugin({
                filepath: filePath,
                hash: true,
                includeSourcemap: _helper2.default.isFileSync(filePath + '.map')
            }));
            pluginInstances.push(new _webpack2.default.DllReferencePlugin({
                context: _configurator2.default.path.context, manifest: require(manifestFilePath) }));
        }
    }
} // /// endregion
// /// region generate common chunks
if (_configurator2.default.givenCommandLineArguments[2] !== 'buildDLL') {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = _configurator2.default.injection.commonChunkIDs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _chunkName = _step3.value;

            if (_configurator2.default.injection.internal.normalized.hasOwnProperty(_chunkName)) pluginInstances.push(new _webpack2.default.optimize.CommonsChunkPlugin({
                async: false,
                children: false,
                filename: _path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.javaScript),
                minChunks: Infinity,
                name: _chunkName,
                minSize: 0
            }));
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }
} // /// endregion
// /// region mark empty javaScript modules as dummy
if (!_configurator2.default.needed.javaScript) _configurator2.default.files.compose.javaScript = _path2.default.resolve(_configurator2.default.path.target.asset.javaScript, '.__dummy__.compiled.js');
// /// endregion
// /// region extract cascading style sheets
pluginInstances.push(new plugins.ExtractText({
    allChunks: true, disable: !_configurator2.default.files.compose.cascadingStyleSheet,
    filename: _configurator2.default.files.compose.cascadingStyleSheet ? _path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.cascadingStyleSheet) : _configurator2.default.path.target.base }));
// /// endregion
// /// region performs implicit external logic
if (_configurator2.default.injection.external.modules === '__implicit__')
    /*
        We only want to process modules from local context in library mode,
        since a concrete project using this library should combine all assets
        (and deduplicate them) for optimal bundling results. NOTE: Only native
        javaScript and json modules will be marked as external dependency.
    */
    _configurator2.default.injection.external.modules = function (context, request, callback) {
        request = request.replace(/^!+/, '');
        if (request.startsWith('/')) request = _path2.default.relative(_configurator2.default.path.context, request);
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = _configurator2.default.module.directoryNames.concat(_configurator2.default.loader.directoryNames)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var _filePath = _step4.value;

                if (request.startsWith(_filePath)) {
                    request = request.substring(_filePath.length);
                    if (request.startsWith('/')) request = request.substring(1);
                    break;
                }
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        var resolvedRequest = _helper2.default.determineExternalRequest(request, _configurator2.default.path.context, context, _configurator2.default.injection.internal.normalized, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
            return _path2.default.resolve(_configurator2.default.path.context, filePath);
        }).filter(function (filePath) {
            return !_configurator2.default.path.context.startsWith(filePath);
        }), _configurator2.default.module.aliases, _configurator2.default.extensions, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore, _configurator2.default.module.directoryNames, _configurator2.default.package.main.fileNames, _configurator2.default.package.main.propertyNames, _configurator2.default.package.aliasPropertyNames, _configurator2.default.injection.external.implicit.pattern.include, _configurator2.default.injection.external.implicit.pattern.exclude, _configurator2.default.inPlace.externalLibrary.normal, _configurator2.default.inPlace.externalLibrary.dynamic);
        if (resolvedRequest) {
            if (['var', 'umd'].includes(_configurator2.default.exportFormat.external) && request in _configurator2.default.injection.external.aliases) resolvedRequest = _configurator2.default.injection.external.aliases[request];
            if (_configurator2.default.exportFormat.external === 'var') resolvedRequest = _clientnode2.default.stringConvertToValidVariableName(resolvedRequest, '0-9a-zA-Z_$\\.');
            return callback(null, resolvedRequest, _configurator2.default.exportFormat.external);
        }
        return callback();
    };
// /// endregion
// /// region build dll packages
if (_configurator2.default.givenCommandLineArguments[2] === 'buildDLL') {
    var dllChunkIDExists = false;
    for (var _chunkName2 in _configurator2.default.injection.internal.normalized) {
        if (_configurator2.default.injection.internal.normalized.hasOwnProperty(_chunkName2)) if (_configurator2.default.injection.dllChunkIDs.includes(_chunkName2)) dllChunkIDExists = true;else delete _configurator2.default.injection.internal.normalized[_chunkName2];
    }if (dllChunkIDExists) {
        libraryName = '[name]DLLPackage';
        pluginInstances.push(new _webpack2.default.DllPlugin({
            path: _configurator2.default.path.target.base + '/[name].dll-manifest.json',
            name: libraryName
        }));
    } else console.warn('No dll chunk id found.');
}
// /// endregion
// // endregion
// // region apply final dom/javaScript modifications/fixes
pluginInstances.push({ apply: function apply(compiler) {
        compiler.plugin('emit', function (compilation, callback) {
            var promises = [];
            /*
                NOTE: Removing symbols after a "&" in hash string is necessary to
                match the generated request strings in offline plugin.
            */
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                var _loop = function _loop() {
                    var htmlConfiguration = _step5.value;

                    if (htmlConfiguration.filename in compilation.assets) promises.push(new Promise(function (resolve, reject) {
                        return dom.env(compilation.assets[htmlConfiguration.filename].source(), function (error, window) {
                            if (error) return reject(error);
                            var linkables = {
                                script: 'src', link: 'href' };
                            for (var tagName in linkables) {
                                if (linkables.hasOwnProperty(tagName)) {
                                    var _iteratorNormalCompletion6 = true;
                                    var _didIteratorError6 = false;
                                    var _iteratorError6 = undefined;

                                    try {
                                        for (var _iterator6 = window.document.querySelectorAll(tagName + '[' + linkables[tagName] + '*="?' + (_configurator2.default.hashAlgorithm + '="]'))[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                            var _domNode2 = _step6.value;

                                            _domNode2.setAttribute(linkables[tagName], _domNode2.getAttribute(linkables[tagName]).replace(new RegExp('(\\?' + _configurator2.default.hashAlgorithm + '=' + '[^&]+).*$'), '$1'));
                                        }
                                    } catch (err) {
                                        _didIteratorError6 = true;
                                        _iteratorError6 = err;
                                    } finally {
                                        try {
                                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                                _iterator6.return();
                                            }
                                        } finally {
                                            if (_didIteratorError6) {
                                                throw _iteratorError6;
                                            }
                                        }
                                    }
                                }
                            }compilation.assets[htmlConfiguration.filename] = new _webpackSources.RawSource(compilation.assets[htmlConfiguration.filename].source().replace(/^(\s*<!doctype[^>]+?>\s*)[\s\S]*$/i, '$1') + window.document.documentElement.outerHTML);
                            return resolve(compilation.assets[htmlConfiguration.filename]);
                        });
                    }));
                };

                for (var _iterator5 = _configurator2.default.files.html[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            if (!_configurator2.default.exportFormat.external.startsWith('umd')) {
                Promise.all(promises).then(function () {
                    return callback();
                });
                return;
            }
            var bundleName = typeof libraryName === 'string' ? libraryName : libraryName[0];
            /*
                NOTE: The umd module export doesn't handle cases where the package
                name doesn't match exported library name. This post processing
                fixes this issue.
            */
            for (var assetRequest in compilation.assets) {
                if (assetRequest.replace(/([^?]+)\?.*$/, '$1').endsWith(_configurator2.default.build.types.javaScript.outputExtension)) {
                    var source = compilation.assets[assetRequest].source();
                    if (typeof source === 'string') {
                        for (var replacement in _configurator2.default.injection.external.aliases) {
                            if (_configurator2.default.injection.external.aliases.hasOwnProperty(replacement)) source = source.replace(new RegExp('(require\\()"' + _clientnode2.default.stringConvertToValidRegularExpression(_configurator2.default.injection.external.aliases[replacement]) + '"(\\))', 'g'), '$1\'' + replacement + '\'$2').replace(new RegExp('(define\\("' + _clientnode2.default.stringConvertToValidRegularExpression(bundleName) + '", \\[.*)"' + _clientnode2.default.stringConvertToValidRegularExpression(_configurator2.default.injection.external.aliases[replacement]) + '"(.*\\], factory\\);)'), '$1\'' + replacement + '\'$2');
                        }source = source.replace(new RegExp('(root\\[)"' + _clientnode2.default.stringConvertToValidRegularExpression(bundleName) + '"(\\] = )'), "$1'" + _clientnode2.default.stringConvertToValidVariableName(bundleName) + "'$2");
                        compilation.assets[assetRequest] = new _webpackSources.RawSource(source);
                    }
                }
            }Promise.all(promises).then(function () {
                return callback();
            });
        });
    } });
// // endregion
// // region add automatic image compression
// NOTE: This plugin should be loaded at last to ensure that all emitted images
// ran through.
pluginInstances.push(new plugins.Imagemin(_configurator2.default.module.optimizer.image.content));
// // endregion
// / endregion
// / region loader
var imageLoader = 'url?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.optimizer.image.file);
var loader = {
    preprocessor: {
        cascadingStyleSheet: 'postcss' + _configurator2.default.module.preprocessor.cascadingStyleSheet,
        javaScript: 'babel?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.preprocessor.babel),
        pug: 'pug?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.preprocessor.pug)
    },
    html: 'html?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.html),
    cascadingStyleSheet: 'css' + _configurator2.default.module.cascadingStyleSheet,
    style: 'style?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.style),
    postprocessor: {
        image: imageLoader,
        font: {
            eot: 'url?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.optimizer.font.eot),
            woff: 'url?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.optimizer.font.woff),
            ttf: 'url?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.optimizer.font.ttf),
            svg: 'url?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.optimizer.font.svg)
        },
        data: 'url?' + _clientnode2.default.convertCircularObjectToJSON(_configurator2.default.module.optimizer.data)
    }
};
// / endregion
// endregion
// region configuration
var webpackConfiguration = {
    cache: _configurator2.default.cache.main,
    context: _configurator2.default.path.context,
    devtool: _configurator2.default.development.tool,
    devServer: _configurator2.default.development.server,
    // region input
    entry: _configurator2.default.injection.internal.normalized,
    externals: _configurator2.default.injection.external.modules,
    resolve: {
        alias: _configurator2.default.module.aliases,
        extensions: _configurator2.default.extensions.file,
        moduleExtensions: _configurator2.default.extensions.module,
        modules: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.base].concat(_configurator2.default.module.directoryNames)),
        unsafeCache: _configurator2.default.cache.unsafe,
        aliasFields: _configurator2.default.package.aliasPropertyNames,
        mainFields: _configurator2.default.package.main.propertyNames,
        mainFiles: _configurator2.default.package.main.fileNames
    },
    resolveLoader: {
        alias: _configurator2.default.loader.aliases,
        extensions: _configurator2.default.loader.extensions.file,
        moduleExtensions: _configurator2.default.loader.extensions.module,
        modules: _configurator2.default.loader.directoryNames,
        aliasFields: _configurator2.default.package.aliasPropertyNames,
        mainFields: _configurator2.default.package.main.propertyNames,
        mainFiles: _configurator2.default.package.main.fileNames
    },
    // endregion
    // region output
    output: {
        filename: _path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.javaScript),
        hashFunction: _configurator2.default.hashAlgorithm,
        library: libraryName,
        libraryTarget: _configurator2.default.givenCommandLineArguments[2] === 'buildDLL' ? 'var' : _configurator2.default.exportFormat.self,
        path: _configurator2.default.path.target.base,
        publicPath: _configurator2.default.path.target.public,
        pathinfo: _configurator2.default.debug,
        umdNamedDefine: true
    },
    target: _configurator2.default.targetTechnology,
    // endregion
    module: {
        noParse: _configurator2.default.module.skipParseRegularExpressions,
        loaders: [
        // Convert to native web types.
        // region script
        {
            test: /\.js(?:\?.*)?$/,
            loader: loader.preprocessor.javaScript,
            include: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.javaScript].concat(_configurator2.default.module.locations.directoryPaths)),
            exclude: function exclude(filePath) {
                filePath = _helper2.default.stripLoader(filePath);
                return _helper2.default.isFilePathInLocation(filePath, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
                    return _path2.default.resolve(_configurator2.default.path.context, filePath);
                }).filter(function (filePath) {
                    return !_configurator2.default.path.context.startsWith(filePath);
                }));
            }
        },
        // endregion
        // region html (templates)
        // NOTE: This is only for the main entry template.
        {
            test: new RegExp('^' + _clientnode2.default.stringConvertToValidRegularExpression(_helper2.default.stripLoader(_configurator2.default.files.defaultHTML.template)) + '(?:\\?.*)?$'),
            loader: _configurator2.default.files.defaultHTML.template.substring(0, _configurator2.default.files.defaultHTML.template.lastIndexOf('!'))
        }, {
            test: /\.pug(?:\?.*)?$/,
            loader: 'file?name=' + _path2.default.relative(_configurator2.default.path.target.asset.base, _configurator2.default.path.target.asset.template) + ('[name].html?' + _configurator2.default.hashAlgorithm + '=[hash]!') + ('extract!' + loader.html + '!' + loader.preprocessor.pug),
            include: _configurator2.default.path.source.asset.template,
            exclude: _helper2.default.normalizePaths(_configurator2.default.files.html.concat(_configurator2.default.files.defaultHTML).map(function (htmlConfiguration) {
                return _helper2.default.stripLoader(htmlConfiguration.template);
            }))
        },
        // endregion
        // Loads dependencies.
        // region style
        {
            test: /\.css(?:\?.*)?$/,
            loader: plugins.ExtractText.extract({
                fallbackLoader: loader.style,
                loader: loader.cascadingStyleSheet + '!' + loader.preprocessor.cascadingStyleSheet
            }),
            include: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.cascadingStyleSheet].concat(_configurator2.default.module.locations.directoryPaths)),
            exclude: function exclude(filePath) {
                filePath = _helper2.default.stripLoader(filePath);
                return _helper2.default.isFilePathInLocation(filePath, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
                    return _path2.default.resolve(_configurator2.default.path.context, filePath);
                }).filter(function (filePath) {
                    return !_configurator2.default.path.context.startsWith(filePath);
                }));
            }
        },
        // endregion
        // region html (templates)
        {
            test: /\.html(?:\?.*)?$/,
            loader: 'file?name=' + _path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.path.target.asset.template) + ('[name].[ext]?' + _configurator2.default.hashAlgorithm + '=[hash]!') + ('extract!' + loader.html),
            include: _configurator2.default.path.source.asset.template,
            exclude: _helper2.default.normalizePaths(_configurator2.default.files.html.map(function (htmlConfiguration) {
                return _helper2.default.stripLoader(htmlConfiguration.template);
            }))
        },
        // endregion
        // Optimize loaded assets.
        // region font
        {
            test: /\.eot(?:\?.*)?$/,
            loader: loader.postprocessor.font.eot
        }, {
            test: /\.woff2?(?:\?.*)?$/,
            loader: loader.postprocessor.font.woff
        }, {
            test: /\.ttf(?:\?.*)?$/,
            loader: loader.postprocessor.font.ttf
        }, {
            test: /\.svg(?:\?.*)?$/,
            loader: loader.postprocessor.font.svg
        },
        // endregion
        // region image
        {
            test: /\.(?:png|jpg|ico|gif)(?:\?.*)?$/,
            loader: loader.postprocessor.image
        },
        // endregion
        // region data
        {
            test: /.+/,
            loader: loader.postprocessor.data,
            include: _configurator2.default.path.source.asset.data,
            exclude: function exclude(filePath) {
                return _configurator2.default.extensions.file.includes(_path2.default.extname(_helper2.default.stripLoader(filePath)));
            }
        }
        // endregion
        ]
    },
    plugins: pluginInstances.concat(new _webpack2.default.LoaderOptionsPlugin({
        // Let the "html-loader" access full html minifier processing
        // configuration.
        html: _configurator2.default.module.optimizer.htmlMinifier,
        postcss: function postcss() {
            return [(0, _postcssImport2.default)({
                addDependencyTo: _webpack2.default,
                root: _configurator2.default.path.context
            }),
            /*
                NOTE: Checking path doesn't work if fonts are referenced in
                libraries provided in another location than the project itself
                like the node_modules folder.
            */
            (0, _postcssCssnext2.default)({ browsers: '> 0%' }), (0, _postcssFontpath2.default)({ checkPath: false }), (0, _postcssUrl2.default)({ filter: '', maxSize: 0 }), (0, _postcssSprites2.default)({
                filterBy: function filterBy() {
                    return new Promise(function (resolve, reject) {
                        return (_configurator2.default.files.compose.image ? resolve : reject)();
                    });
                },
                hooks: { onSaveSpritesheet: function onSaveSpritesheet(image) {
                        return _path2.default.join(image.spritePath, _path2.default.relative(_configurator2.default.path.target.asset.image, _configurator2.default.files.compose.image));
                    } },
                stylesheetPath: _configurator2.default.path.source.asset.cascadingStyleSheet,
                spritePath: _configurator2.default.path.source.asset.image
            })];
        },
        pug: _configurator2.default.module.preprocessor.pug
    }))
};
if (_configurator2.default.debug) console.log('Using webpack configuration:', _util2.default.inspect(webpackConfiguration, { depth: null }));
// endregion
exports.default = webpackConfiguration;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0E7Ozs7OztBQUNBOzs7O0FBQ0E7O0lBQVksRzs7QUFDWjs7SUFBWSxVOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUtBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFjQTs7OztBQUNBOzs7O0FBS0E7Ozs7QUFNQTs7Ozs7Ozs7QUFqQ0E7QUFDQSxJQUFJO0FBQ0EsWUFBUSw2QkFBUjtBQUNILENBRkQsQ0FFRSxPQUFPLEtBQVAsRUFBYyxDQUFFO0FBR2xCLElBQU0sVUFBVSxRQUFRLHNCQUFSLEdBQWhCOzs7QUFHQSxRQUFRLElBQVIsR0FBZSxRQUFRLElBQXZCO0FBQ0EsUUFBUSxXQUFSLEdBQXNCLFFBQVEsV0FBOUI7QUFDQSxRQUFRLGtCQUFSLEdBQTZCLFFBQVEsK0JBQVIsQ0FBN0I7QUFDQSxRQUFRLFdBQVIsR0FBc0IsUUFBUSxXQUE5QjtBQUNBLFFBQVEsT0FBUixHQUFrQixRQUFRLHlCQUFSLENBQWxCO0FBQ0EsUUFBUSxRQUFSLEdBQW1CLFFBQVEseUJBQVIsRUFBbUMsT0FBdEQ7QUFDQSxRQUFRLE9BQVIsR0FBa0IsUUFBUSxnQkFBUixDQUFsQjs7QUFTQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxLQUFSLENBQWMsUUFBUSxPQUFSLENBQWdCLGFBQWhCLENBQWQsRUFBOEMsT0FBOUMsR0FBd0QsWUFBZTtBQUNuRSx5QkFBTSxZQUFOLENBQW1CLElBQW5CLEVBQXlCLEtBQUssT0FBOUIsRUFBdUMsTUFBdkMsRUFBK0MsS0FBSyxPQUFwRDtBQUNBLFdBQU8scUJBQXVCLEtBQXZCLENBQTZCLElBQTdCLEVBQW1DLFNBQW5DLENBQVA7QUFDSCxDQUhEO0FBSUE7O0FBRUEsSUFBTSxnQ0FDRixzQkFBd0IsWUFENUI7QUFFQSxRQUFRLEtBQVIsQ0FBYyxRQUFRLE9BQVIsQ0FB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LHFCQUFaLENBQXBCO0FBQUEsaUJBREM7QUFNWCx1QkFBTyxFQUFDLG1CQUFtQiwyQkFBQyxLQUFEO0FBQUEsK0JBQXlCLGVBQUssSUFBTCxDQUNoRCxNQUFNLFVBRDBDLEVBQzlCLGVBQUssUUFBTCxDQUNkLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsS0FEbEIsRUFFZCx1QkFBYyxLQUFkLENBQW9CLE9BQXBCLENBQTRCLEtBRmQsQ0FEOEIsQ0FBekI7QUFBQSxxQkFBcEIsRUFOSTtBQVVYLGdDQUNJLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsbUJBWHpCO0FBWVgsNEJBQVksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQztBQVpqQyxhQUFmLENBYnlCLENBQXBCO0FBQUEsU0FKbUQ7QUFnQzVELGFBQUssdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQztBQWhDcUIsS0FBaEMsQ0FBdkI7QUE1S3FDLENBQWxEO0FBK01BLElBQUksdUJBQWMsS0FBbEIsRUFDSSxRQUFRLEdBQVIsQ0FBWSw4QkFBWixFQUE0QyxlQUFLLE9BQUwsQ0FDeEMsb0JBRHdDLEVBQ2xCLEVBQUMsT0FBTyxJQUFSLEVBRGtCLENBQTVDO0FBRUo7a0JBQ2Usb0I7QUFDZjtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJ3ZWJwYWNrQ29uZmlndXJhdG9yLmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZG9tIGZyb20gJ2pzZG9tJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcG9zdGNzc0NTU25leHQgZnJvbSAncG9zdGNzcy1jc3NuZXh0J1xuaW1wb3J0IHBvc3Rjc3NGb250UGF0aCBmcm9tICdwb3N0Y3NzLWZvbnRwYXRoJ1xuaW1wb3J0IHBvc3Rjc3NJbXBvcnQgZnJvbSAncG9zdGNzcy1pbXBvcnQnXG5pbXBvcnQgcG9zdGNzc1Nwcml0ZXMgZnJvbSAncG9zdGNzcy1zcHJpdGVzJ1xuaW1wb3J0IHBvc3Rjc3NVUkwgZnJvbSAncG9zdGNzcy11cmwnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCB3ZWJwYWNrIGZyb20gJ3dlYnBhY2snXG5jb25zdCBwbHVnaW5zID0gcmVxdWlyZSgnd2VicGFjay1sb2FkLXBsdWdpbnMnKSgpXG5pbXBvcnQge1Jhd1NvdXJjZSBhcyBXZWJwYWNrUmF3U291cmNlfSBmcm9tICd3ZWJwYWNrLXNvdXJjZXMnXG5cbnBsdWdpbnMuSFRNTCA9IHBsdWdpbnMuaHRtbFxucGx1Z2lucy5FeHRyYWN0VGV4dCA9IHBsdWdpbnMuZXh0cmFjdFRleHRcbnBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luID0gcmVxdWlyZSgnYWRkLWFzc2V0LWh0bWwtd2VicGFjay1wbHVnaW4nKVxucGx1Z2lucy5PcGVuQnJvd3NlciA9IHBsdWdpbnMub3BlbkJyb3dzZXJcbnBsdWdpbnMuRmF2aWNvbiA9IHJlcXVpcmUoJ2Zhdmljb25zLXdlYnBhY2stcGx1Z2luJylcbnBsdWdpbnMuSW1hZ2VtaW4gPSByZXF1aXJlKCdpbWFnZW1pbi13ZWJwYWNrLXBsdWdpbicpLmRlZmF1bHRcbnBsdWdpbnMuT2ZmbGluZSA9IHJlcXVpcmUoJ29mZmxpbmUtcGx1Z2luJylcblxuaW1wb3J0IHR5cGUge1xuICAgIERvbU5vZGUsIEhUTUxDb25maWd1cmF0aW9uLCBQcm9jZWR1cmVGdW5jdGlvbiwgUHJvbWlzZUNhbGxiYWNrRnVuY3Rpb24sXG4gICAgV2VicGFja0NvbmZpZ3VyYXRpb24sIFdpbmRvd1xufSBmcm9tICcuL3R5cGUnXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG5cbi8vIC8gcmVnaW9uIG1vbmtleSBwYXRjaGVzXG4vLyBNb25rZXktUGF0Y2ggaHRtbCBsb2FkZXIgdG8gcmV0cmlldmUgaHRtbCBsb2FkZXIgb3B0aW9ucyBzaW5jZSB0aGVcbi8vIFwid2VicGFjay1odG1sLXBsdWdpblwiIGRvZXNuJ3QgcHJlc2VydmUgdGhlIG9yaWdpbmFsIGxvYWRlciBpbnRlcmZhY2UuXG5pbXBvcnQgaHRtbExvYWRlck1vZHVsZUJhY2t1cCBmcm9tICdodG1sLWxvYWRlcidcbnJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKCdodG1sLWxvYWRlcicpXS5leHBvcnRzID0gZnVuY3Rpb24oKTphbnkge1xuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB0aGlzLm9wdGlvbnMsIG1vZHVsZSwgdGhpcy5vcHRpb25zKVxuICAgIHJldHVybiBodG1sTG9hZGVyTW9kdWxlQmFja3VwLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cbi8vIE1vbmtleS1QYXRjaCBsb2FkZXItdXRpbHMgdG8gZGVmaW5lIHdoaWNoIHVybCBpcyBhIGxvY2FsIHJlcXVlc3QuXG5pbXBvcnQgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAgZnJvbSAnbG9hZGVyLXV0aWxzJ1xuY29uc3QgbG9hZGVyVXRpbHNJc1VybFJlcXVlc3RCYWNrdXA6KHVybDpzdHJpbmcpID0+IGJvb2xlYW4gPVxuICAgIGxvYWRlclV0aWxzTW9kdWxlQmFja3VwLmlzVXJsUmVxdWVzdFxucmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2xvYWRlci11dGlscycpXS5leHBvcnRzLmlzVXJsUmVxdWVzdCA9IGZ1bmN0aW9uKFxuICAgIHVybDpzdHJpbmdcbik6Ym9vbGVhbiB7XG4gICAgaWYgKHVybC5tYXRjaCgvXlthLXpdKzouKy8pKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gbG9hZGVyVXRpbHNJc1VybFJlcXVlc3RCYWNrdXAuYXBwbHkoXG4gICAgICAgIGxvYWRlclV0aWxzTW9kdWxlQmFja3VwLCBhcmd1bWVudHMpXG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gaW5pdGlhbGlzYXRpb25cbi8vIC8gcmVnaW9uIGRldGVybWluZSBsaWJyYXJ5IG5hbWVcbmxldCBsaWJyYXJ5TmFtZTpzdHJpbmdcbmlmICgnbGlicmFyeU5hbWUnIGluIGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5saWJyYXJ5TmFtZSlcbiAgICBsaWJyYXJ5TmFtZSA9IGNvbmZpZ3VyYXRpb24ubGlicmFyeU5hbWVcbmVsc2UgaWYgKE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpLmxlbmd0aCA+IDEpXG4gICAgbGlicmFyeU5hbWUgPSAnW25hbWVdJ1xuZWxzZSB7XG4gICAgbGlicmFyeU5hbWUgPSBjb25maWd1cmF0aW9uLm5hbWVcbiAgICBpZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuc2VsZiA9PT0gJ3ZhcicpXG4gICAgICAgIGxpYnJhcnlOYW1lID0gVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRWYXJpYWJsZU5hbWUobGlicmFyeU5hbWUpXG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gcGx1Z2luc1xuY29uc3QgcGx1Z2luSW5zdGFuY2VzOkFycmF5PE9iamVjdD4gPSBbXG4gICAgbmV3IHdlYnBhY2sub3B0aW1pemUuT2NjdXJyZW5jZU9yZGVyUGx1Z2luKHRydWUpXVxuLy8gLy8gcmVnaW9uIGRlZmluZSBtb2R1bGVzIHRvIGlnbm9yZVxuZm9yIChjb25zdCBpZ25vcmVQYXR0ZXJuOnN0cmluZyBvZiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pZ25vcmVQYXR0ZXJuKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLklnbm9yZVBsdWdpbihuZXcgUmVnRXhwKGlnbm9yZVBhdHRlcm4pKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGdlbmVyYXRlIGh0bWwgZmlsZVxubGV0IGh0bWxBdmFpbGFibGU6Ym9vbGVhbiA9IGZhbHNlXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGRETEwnKVxuICAgIGZvciAobGV0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbClcbiAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVTeW5jKGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnN1YnN0cmluZyhcbiAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmxhc3RJbmRleE9mKCchJykgKyAxXG4gICAgICAgICkpKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUgPT09XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlID1cbiAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUubGFzdEluZGV4T2YoJyEnKSArIDEpXG4gICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5IVE1MKGh0bWxDb25maWd1cmF0aW9uKSlcbiAgICAgICAgICAgIGh0bWxBdmFpbGFibGUgPSB0cnVlXG4gICAgICAgIH1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGdlbmVyYXRlIGZhdmljb25zXG5pZiAoaHRtbEF2YWlsYWJsZSAmJiBjb25maWd1cmF0aW9uLmZhdmljb24gJiYgSGVscGVyLmlzRmlsZVN5bmMoXG4gICAgY29uZmlndXJhdGlvbi5mYXZpY29uLmxvZ29cbikpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuRmF2aWNvbihjb25maWd1cmF0aW9uLmZhdmljb24pKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gcHJvdmlkZSBvZmZsaW5lIGZ1bmN0aW9uYWxpdHlcbmlmIChodG1sQXZhaWxhYmxlICYmIGNvbmZpZ3VyYXRpb24ub2ZmbGluZSkge1xuICAgIGlmICghWydzZXJ2ZScsICd0ZXN0SW5Ccm93c2VyJ10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkpIHtcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0KVxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5vZmZsaW5lLmV4Y2x1ZGVzLnB1c2gocGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICApICsgYCouY3NzPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT0qYClcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0KVxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5vZmZsaW5lLmV4Y2x1ZGVzLnB1c2gocGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5qYXZhU2NyaXB0XG4gICAgICAgICAgICApICsgYCouanM/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PSpgKVxuICAgIH1cbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PZmZsaW5lKGNvbmZpZ3VyYXRpb24ub2ZmbGluZSkpXG59XG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBvcGVucyBicm93c2VyIGF1dG9tYXRpY2FsbHlcbmlmIChjb25maWd1cmF0aW9uLmRldmVsb3BtZW50Lm9wZW5Ccm93c2VyICYmIChodG1sQXZhaWxhYmxlICYmIFtcbiAgICAnc2VydmUnLCAndGVzdEluQnJvd3Nlcidcbl0uaW5jbHVkZXMoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKSkpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuT3BlbkJyb3dzZXIoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZGV2ZWxvcG1lbnQub3BlbkJyb3dzZXIpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gcHJvdmlkZSBidWlsZCBlbnZpcm9ubWVudFxuaWYgKGNvbmZpZ3VyYXRpb24uYnVpbGQuZGVmaW5pdGlvbnMpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGVmaW5lUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLmRlZmluaXRpb25zKSlcbmlmIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcm92aWRlKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLlByb3ZpZGVQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByb3ZpZGUpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gbW9kdWxlcy9hc3NldHNcbi8vIC8vLyByZWdpb24gcGVyZm9ybSBqYXZhU2NyaXB0IG1pbmlmaWNhdGlvbi9vcHRpbWlzYXRpb25cbmlmIChjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIudWdsaWZ5SlMpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2sub3B0aW1pemUuVWdsaWZ5SnNQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci51Z2xpZnlKUykpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGFwcGx5IG1vZHVsZSBwYXR0ZXJuXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgIGNvbXBpbGVyLnBsdWdpbignZW1pdCcsIChcbiAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcmVxdWVzdDpzdHJpbmcgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgaWYgKGNvbXBpbGF0aW9uLmFzc2V0cy5oYXNPd25Qcm9wZXJ0eShyZXF1ZXN0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IHJlcXVlc3QucmVwbGFjZSgvXFw/W14/XSskLywgJycpXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgICAgICBpZiAodHlwZSAmJiBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXSAmJiAhKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAuZXhjbHVkZUZpbGVQYXRoUmVndWxhckV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICApKS50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2U6P3N0cmluZyA9IGNvbXBpbGF0aW9uLmFzc2V0c1tyZXF1ZXN0XS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbcmVxdWVzdF0gPSBuZXcgV2VicGFja1Jhd1NvdXJjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXS5wYXR0ZXJuLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9cXHsxXFx9L2csIHNvdXJjZS5yZXBsYWNlKC9cXCQvZywgJyQkJCcpKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKClcbiAgICB9KVxufX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGluLXBsYWNlIGNvbmZpZ3VyZWQgYXNzZXRzIGluIHRoZSBtYWluIGh0bWwgZmlsZVxuaWYgKGh0bWxBdmFpbGFibGUgJiYgIVsnc2VydmUnLCAndGVzdEluQnJvd3NlciddLmluY2x1ZGVzKFxuICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICBjb21waWxlci5wbHVnaW4oJ2VtaXQnLCAoXG4gICAgICAgICAgICBjb21waWxhdGlvbjpPYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5maWxlcy5odG1sWzBdLmZpbGVuYW1lIGluIGNvbXBpbGF0aW9uLmFzc2V0cyAmJiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQgfHxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdFxuICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICBkb20uZW52KGNvbXBpbGF0aW9uLmFzc2V0c1tjb25maWd1cmF0aW9uLmZpbGVzLmh0bWxbXG4gICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICBdLmZpbGVuYW1lXS5zb3VyY2UoKSwgKGVycm9yOj9FcnJvciwgd2luZG93Ok9iamVjdCk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsUHJlZml4OnN0cmluZyA9IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKCdbY29udGVudGhhc2hdJywgJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9tTm9kZTpEb21Ob2RlID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYGxpbmtbaHJlZl49XCIke3VybFByZWZpeH1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXNzZXQ6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChhc3NldCBpbiBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhc3NldC5zdGFydHNXaXRoKHVybFByZWZpeCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluUGxhY2VEb21Ob2RlOkRvbU5vZGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLnRleHRDb250ZW50ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0XS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUGxhY2VEb21Ob2RlLCBkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkb21Ob2RlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IFRoaXMgZG9lc24ndCBwcmV2ZW50IHdlYnBhY2sgZnJvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGluZyB0aGlzIGZpbGUgaWYgcHJlc2VudCBpbiBhbm90aGVyIGNodW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvIHJlbW92aW5nIGl0IChhbmQgYSBwb3RlbnRpYWwgc291cmNlIG1hcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlKSBsYXRlciBpbiB0aGUgXCJkb25lXCIgaG9vay5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb21waWxhdGlvbi5hc3NldHNbYXNzZXRdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdObyByZWZlcmVuY2VkIGNhc2NhZGluZyBzdHlsZSBzaGVldCBmaWxlIGluJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgcmVzdWx0aW5nIG1hcmt1cCBmb3VuZCB3aXRoICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2VsZWN0b3I6IGxpbmtbaHJlZl49XCIke3VybFByZWZpeH1cIl1gKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsUHJlZml4OnN0cmluZyA9IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbaGFzaF0nLCAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21Ob2RlOkRvbU5vZGUgPSB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2NyaXB0W3NyY149XCIke3VybFByZWZpeH1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXNzZXQ6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChhc3NldCBpbiBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhc3NldC5zdGFydHNXaXRoKHVybFByZWZpeCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUudGV4dENvbnRlbnQgPSBjb21waWxhdGlvbi5hc3NldHNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUucmVtb3ZlQXR0cmlidXRlKCdzcmMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IFRoaXMgZG9lc24ndCBwcmV2ZW50IHdlYnBhY2sgZnJvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGluZyB0aGlzIGZpbGUgaWYgcHJlc2VudCBpbiBhbm90aGVyIGNodW5rXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvIHJlbW92aW5nIGl0IChhbmQgYSBwb3RlbnRpYWwgc291cmNlIG1hcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlKSBsYXRlciBpbiB0aGUgXCJkb25lXCIgaG9vay5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb21waWxhdGlvbi5hc3NldHNbYXNzZXRdXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdObyByZWZlcmVuY2VkIGphdmFTY3JpcHQgZmlsZSBpbiByZXN1bHRpbmcgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXJrdXAgZm91bmQgd2l0aCBzZWxlY3RvcjogJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBzY3JpcHRbc3JjXj1cIiR7dXJsUHJlZml4fVwiXWApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW2NvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbFtcbiAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgXS5maWxlbmFtZV0gPSBuZXcgV2VicGFja1Jhd1NvdXJjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1tjb25maWd1cmF0aW9uLmZpbGVzLmh0bWxbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAgICAgXS5maWxlbmFtZV0uc291cmNlKCkucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXihcXHMqPCFkb2N0eXBlW14+XSs/PlxccyopW1xcc1xcU10qJC9pLCAnJDEnXG4gICAgICAgICAgICAgICAgICAgICAgICApICsgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUwpXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfSlcbiAgICAgICAgY29tcGlsZXIucGx1Z2luKCdhZnRlci1lbWl0JywgKFxuICAgICAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbFswXS5maWxlbmFtZSBpbiBjb21waWxhdGlvbi5hc3NldHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXNzZXRGaWxlUGF0aCA9IEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KVxuICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVN5bmMoYXNzZXRGaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnVubGlua1N5bmMoYXNzZXRGaWxlUGF0aClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0RmlsZVBhdGhUZW1wbGF0ZSA9IEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0KVxuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFxuICAgICAgICAgICAgICAgICAgICAgICAgLmhhc093blByb3BlcnR5KGNodW5rTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhc3NldEZpbGVQYXRoOnN0cmluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0RmlsZVBhdGhUZW1wbGF0ZSwgeydbbmFtZV0nOiBjaHVua05hbWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlU3luYyhhc3NldEZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmtTeW5jKGFzc2V0RmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZTpzdHJpbmcgb2YgW1xuICAgICAgICAgICAgICAgICAgICAnamF2YVNjcmlwdCcsICdjYXNjYWRpbmdTdHlsZVNoZWV0J1xuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlU3lzdGVtLnJlYWRkaXJTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldFt0eXBlXVxuICAgICAgICAgICAgICAgICAgICApLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ucm1kaXJTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH0pXG4gICAgfX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHJlbW92ZSBjaHVua3MgaWYgYSBjb3JyZXNwb25kaW5nIGRsbCBwYWNrYWdlIGV4aXN0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkRExMJylcbiAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZClcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgKSkge1xuICAgICAgICAgICAgY29uc3QgbWFuaWZlc3RGaWxlUGF0aDpzdHJpbmcgPVxuICAgICAgICAgICAgICAgIGAke2NvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZX0vJHtjaHVua05hbWV9LmAgK1xuICAgICAgICAgICAgICAgIGBkbGwtbWFuaWZlc3QuanNvbmBcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIG1hbmlmZXN0RmlsZVBhdGhcbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gSGVscGVyLnJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgICksIHsnW25hbWVdJzogY2h1bmtOYW1lfSlcbiAgICAgICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5BZGRBc3NldEhUTUxQbHVnaW4oe1xuICAgICAgICAgICAgICAgICAgICBmaWxlcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVTb3VyY2VtYXA6IEhlbHBlci5pc0ZpbGVTeW5jKGAke2ZpbGVQYXRofS5tYXBgKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRsbFJlZmVyZW5jZVBsdWdpbih7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBtYW5pZmVzdDogcmVxdWlyZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0RmlsZVBhdGgpfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gZ2VuZXJhdGUgY29tbW9uIGNodW5rc1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkRExMJylcbiAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgb2YgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uY29tbW9uQ2h1bmtJRHMpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpXG4gICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5vcHRpbWl6ZS5Db21tb25zQ2h1bmtQbHVnaW4oe1xuICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgIG1pbkNodW5rczogSW5maW5pdHksXG4gICAgICAgICAgICAgICAgbmFtZTogY2h1bmtOYW1lLFxuICAgICAgICAgICAgICAgIG1pblNpemU6IDBcbiAgICAgICAgICAgIH0pKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBtYXJrIGVtcHR5IGphdmFTY3JpcHQgbW9kdWxlcyBhcyBkdW1teVxuaWYgKCFjb25maWd1cmF0aW9uLm5lZWRlZC5qYXZhU2NyaXB0KVxuICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0ID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmphdmFTY3JpcHQsICcuX19kdW1teV9fLmNvbXBpbGVkLmpzJylcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gZXh0cmFjdCBjYXNjYWRpbmcgc3R5bGUgc2hlZXRzXG5wbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5FeHRyYWN0VGV4dCh7XG4gICAgYWxsQ2h1bmtzOiB0cnVlLCBkaXNhYmxlOlxuICAgICAgICAhY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgZmlsZW5hbWU6IGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0ID8gcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICkgOiBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9KSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gcGVyZm9ybXMgaW1wbGljaXQgZXh0ZXJuYWwgbG9naWNcbmlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzID09PSAnX19pbXBsaWNpdF9fJylcbiAgICAvKlxuICAgICAgICBXZSBvbmx5IHdhbnQgdG8gcHJvY2VzcyBtb2R1bGVzIGZyb20gbG9jYWwgY29udGV4dCBpbiBsaWJyYXJ5IG1vZGUsXG4gICAgICAgIHNpbmNlIGEgY29uY3JldGUgcHJvamVjdCB1c2luZyB0aGlzIGxpYnJhcnkgc2hvdWxkIGNvbWJpbmUgYWxsIGFzc2V0c1xuICAgICAgICAoYW5kIGRlZHVwbGljYXRlIHRoZW0pIGZvciBvcHRpbWFsIGJ1bmRsaW5nIHJlc3VsdHMuIE5PVEU6IE9ubHkgbmF0aXZlXG4gICAgICAgIGphdmFTY3JpcHQgYW5kIGpzb24gbW9kdWxlcyB3aWxsIGJlIG1hcmtlZCBhcyBleHRlcm5hbCBkZXBlbmRlbmN5LlxuICAgICovXG4gICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwubW9kdWxlcyA9IChcbiAgICAgICAgY29udGV4dDpzdHJpbmcsIHJlcXVlc3Q6c3RyaW5nLCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnJlcGxhY2UoL14hKy8sICcnKVxuICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICByZXF1ZXN0ID0gcGF0aC5yZWxhdGl2ZShjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgcmVxdWVzdClcbiAgICAgICAgZm9yIChcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyBvZlxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMuY29uY2F0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzKVxuICAgICAgICApXG4gICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhmaWxlUGF0aC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICBsZXQgcmVzb2x2ZWRSZXF1ZXN0Oj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lRXh0ZXJuYWxSZXF1ZXN0KFxuICAgICAgICAgICAgcmVxdWVzdCwgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGNvbnRleHQsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoXG4gICAgICAgICAgICApKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKVxuICAgICAgICAgICAgKSwgY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcywgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLCBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmltcGxpY2l0LnBhdHRlcm4uaW5jbHVkZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmltcGxpY2l0LnBhdHRlcm4uZXhjbHVkZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5leHRlcm5hbExpYnJhcnkubm9ybWFsLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmV4dGVybmFsTGlicmFyeS5keW5hbWljKVxuICAgICAgICBpZiAocmVzb2x2ZWRSZXF1ZXN0KSB7XG4gICAgICAgICAgICBpZiAoWyd2YXInLCAndW1kJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWxcbiAgICAgICAgICAgICkgJiYgcmVxdWVzdCBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCA9IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RdXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwgPT09ICd2YXInKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCA9IFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsICcwLTlhLXpBLVpfJFxcXFwuJylcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhcbiAgICAgICAgICAgICAgICBudWxsLCByZXNvbHZlZFJlcXVlc3QsIGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpXG4gICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBidWlsZCBkbGwgcGFja2FnZXNcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZERMTCcpIHtcbiAgICBsZXQgZGxsQ2h1bmtJREV4aXN0czpib29sZWFuID0gZmFsc2VcbiAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZClcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgKSlcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5kbGxDaHVua0lEcy5pbmNsdWRlcyhjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGRsbENodW5rSURFeGlzdHMgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgIGlmIChkbGxDaHVua0lERXhpc3RzKSB7XG4gICAgICAgIGxpYnJhcnlOYW1lID0gJ1tuYW1lXURMTFBhY2thZ2UnXG4gICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRsbFBsdWdpbih7XG4gICAgICAgICAgICBwYXRoOiBgJHtjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9L1tuYW1lXS5kbGwtbWFuaWZlc3QuanNvbmAsXG4gICAgICAgICAgICBuYW1lOiBsaWJyYXJ5TmFtZVxuICAgICAgICB9KSlcbiAgICB9IGVsc2VcbiAgICAgICAgY29uc29sZS53YXJuKCdObyBkbGwgY2h1bmsgaWQgZm91bmQuJylcbn1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGFwcGx5IGZpbmFsIGRvbS9qYXZhU2NyaXB0IG1vZGlmaWNhdGlvbnMvZml4ZXNcbnBsdWdpbkluc3RhbmNlcy5wdXNoKHthcHBseTogKGNvbXBpbGVyOk9iamVjdCk6dm9pZCA9PiB7XG4gICAgY29tcGlsZXIucGx1Z2luKCdlbWl0JywgKFxuICAgICAgICBjb21waWxhdGlvbjpPYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgKTp2b2lkID0+IHtcbiAgICAgICAgY29uc3QgcHJvbWlzZXM6QXJyYXk8UHJvbWlzZTxzdHJpbmc+PiA9IFtdXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBSZW1vdmluZyBzeW1ib2xzIGFmdGVyIGEgXCImXCIgaW4gaGFzaCBzdHJpbmcgaXMgbmVjZXNzYXJ5IHRvXG4gICAgICAgICAgICBtYXRjaCB0aGUgZ2VuZXJhdGVkIHJlcXVlc3Qgc3RyaW5ncyBpbiBvZmZsaW5lIHBsdWdpbi5cbiAgICAgICAgKi9cbiAgICAgICAgZm9yIChjb25zdCBodG1sQ29uZmlndXJhdGlvbiBvZiBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwpXG4gICAgICAgICAgICBpZiAoaHRtbENvbmZpZ3VyYXRpb24uZmlsZW5hbWUgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlOlByb21pc2VDYWxsYmFja0Z1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICByZWplY3Q6UHJvbWlzZUNhbGxiYWNrRnVuY3Rpb25cbiAgICAgICAgICAgICAgICApOldpbmRvdyA9PiBkb20uZW52KGNvbXBpbGF0aW9uLmFzc2V0c1tcbiAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24uZmlsZW5hbWVcbiAgICAgICAgICAgICAgICBdLnNvdXJjZSgpLCAoZXJyb3I6P0Vycm9yLCB3aW5kb3c6V2luZG93KTo/UHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGlua2FibGVzOntba2V5OnN0cmluZ106c3RyaW5nfSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdDogJ3NyYycsIGxpbms6ICdocmVmJ31cbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWdOYW1lOnN0cmluZyBpbiBsaW5rYWJsZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGlua2FibGVzLmhhc093blByb3BlcnR5KHRhZ05hbWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3RhZ05hbWV9WyR7bGlua2FibGVzW3RhZ05hbWVdfSo9XCI/YCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVwiXWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmthYmxlc1t0YWdOYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuZ2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmthYmxlc1t0YWdOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYChcXFxcPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW14mXSspLiokJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgJyQxJykpXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1todG1sQ29uZmlndXJhdGlvbi5maWxlbmFtZV0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFdlYnBhY2tSYXdTb3VyY2UoY29tcGlsYXRpb24uYXNzZXRzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBdLnNvdXJjZSgpLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL14oXFxzKjwhZG9jdHlwZVtePl0rPz5cXHMqKVtcXHNcXFNdKiQvaSwgJyQxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSArIHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub3V0ZXJIVE1MKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1todG1sQ29uZmlndXJhdGlvbi5maWxlbmFtZV0pXG4gICAgICAgICAgICAgICAgfSkpKVxuICAgICAgICBpZiAoIWNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsLnN0YXJ0c1dpdGgoJ3VtZCcpKSB7XG4gICAgICAgICAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigoKTp2b2lkID0+IGNhbGxiYWNrKCkpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidW5kbGVOYW1lOnN0cmluZyA9IChcbiAgICAgICAgICAgIHR5cGVvZiBsaWJyYXJ5TmFtZSA9PT0gJ3N0cmluZydcbiAgICAgICAgKSA/IGxpYnJhcnlOYW1lIDogbGlicmFyeU5hbWVbMF1cbiAgICAgICAgLypcbiAgICAgICAgICAgIE5PVEU6IFRoZSB1bWQgbW9kdWxlIGV4cG9ydCBkb2Vzbid0IGhhbmRsZSBjYXNlcyB3aGVyZSB0aGUgcGFja2FnZVxuICAgICAgICAgICAgbmFtZSBkb2Vzbid0IG1hdGNoIGV4cG9ydGVkIGxpYnJhcnkgbmFtZS4gVGhpcyBwb3N0IHByb2Nlc3NpbmdcbiAgICAgICAgICAgIGZpeGVzIHRoaXMgaXNzdWUuXG4gICAgICAgICovXG4gICAgICAgIGZvciAoY29uc3QgYXNzZXRSZXF1ZXN0OnN0cmluZyBpbiBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICBpZiAoYXNzZXRSZXF1ZXN0LnJlcGxhY2UoLyhbXj9dKylcXD8uKiQvLCAnJDEnKS5lbmRzV2l0aChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmphdmFTY3JpcHQub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZTpzdHJpbmcgPSBjb21waWxhdGlvbi5hc3NldHNbYXNzZXRSZXF1ZXN0XS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQ6c3RyaW5nIGluXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhhc093blByb3BlcnR5KHJlcGxhY2VtZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcocmVxdWlyZVxcXFwoKVwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkUmVndWxhckV4cHJlc3Npb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1wiKFxcXFwpKScsICdnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIGAkMScke3JlcGxhY2VtZW50fSckMmApLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyhkZWZpbmVcXFxcKFwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkUmVndWxhckV4cHJlc3Npb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidW5kbGVOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnXCIsIFxcXFxbLiopXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRSZWd1bGFyRXhwcmVzc2lvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnXCIoLipcXFxcXSwgZmFjdG9yeVxcXFwpOyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgYCQxJyR7cmVwbGFjZW1lbnR9JyQyYClcbiAgICAgICAgICAgICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICcocm9vdFxcXFxbKVwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFJlZ3VsYXJFeHByZXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnXCIoXFxcXF0gPSApJ1xuICAgICAgICAgICAgICAgICAgICApLCBcIiQxJ1wiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKGJ1bmRsZU5hbWUpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiJyQyXCJcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbYXNzZXRSZXF1ZXN0XSA9IG5ldyBXZWJwYWNrUmF3U291cmNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCk6dm9pZCA9PiBjYWxsYmFjaygpKVxuICAgIH0pXG59fSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGFkZCBhdXRvbWF0aWMgaW1hZ2UgY29tcHJlc3Npb25cbi8vIE5PVEU6IFRoaXMgcGx1Z2luIHNob3VsZCBiZSBsb2FkZWQgYXQgbGFzdCB0byBlbnN1cmUgdGhhdCBhbGwgZW1pdHRlZCBpbWFnZXNcbi8vIHJhbiB0aHJvdWdoLlxucGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuSW1hZ2VtaW4oXG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmNvbnRlbnQpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gbG9hZGVyXG5sZXQgaW1hZ2VMb2FkZXI6c3RyaW5nID0gJ3VybD8nICsgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5maWxlKVxuY29uc3QgbG9hZGVyOntcbiAgICBwcmVwcm9jZXNzb3I6e1xuICAgICAgICBjYXNjYWRpbmdTdHlsZVNoZWV0OnN0cmluZztcbiAgICAgICAgamF2YVNjcmlwdDpzdHJpbmc7XG4gICAgICAgIHB1ZzpzdHJpbmc7XG4gICAgfTtcbiAgICBodG1sOnN0cmluZztcbiAgICBjYXNjYWRpbmdTdHlsZVNoZWV0OnN0cmluZztcbiAgICBzdHlsZTpzdHJpbmc7XG4gICAgcG9zdHByb2Nlc3Nvcjp7XG4gICAgICAgIGltYWdlOnN0cmluZztcbiAgICAgICAgZm9udDp7XG4gICAgICAgICAgICBlb3Q6c3RyaW5nO1xuICAgICAgICAgICAgd29mZjpzdHJpbmc7XG4gICAgICAgICAgICB0dGY6c3RyaW5nO1xuICAgICAgICAgICAgc3ZnOnN0cmluZ1xuICAgICAgICB9O1xuICAgICAgICBkYXRhOnN0cmluZ1xuICAgIH1cbn0gPSB7XG4gICAgcHJlcHJvY2Vzc29yOiB7XG4gICAgICAgIGNhc2NhZGluZ1N0eWxlU2hlZXQ6ICdwb3N0Y3NzJyArXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgamF2YVNjcmlwdDogJ2JhYmVsPycgKyBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuYmFiZWwpLFxuICAgICAgICBwdWc6ICdwdWc/JyArIFRvb2xzLmNvbnZlcnRDaXJjdWxhck9iamVjdFRvSlNPTihcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5wdWcpXG4gICAgfSxcbiAgICBodG1sOiAnaHRtbD8nICsgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sKSxcbiAgICBjYXNjYWRpbmdTdHlsZVNoZWV0OiBgY3NzJHtjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0fWAsXG4gICAgc3R5bGU6ICdzdHlsZT8nICsgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5zdHlsZSksXG4gICAgcG9zdHByb2Nlc3Nvcjoge1xuICAgICAgICBpbWFnZTogaW1hZ2VMb2FkZXIsXG4gICAgICAgIGZvbnQ6IHtcbiAgICAgICAgICAgIGVvdDogJ3VybD8nICsgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdCksXG4gICAgICAgICAgICB3b2ZmOiAndXJsPycgKyBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZiksXG4gICAgICAgICAgICB0dGY6ICd1cmw/JyArIFRvb2xzLmNvbnZlcnRDaXJjdWxhck9iamVjdFRvSlNPTihcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYpLFxuICAgICAgICAgICAgc3ZnOiAndXJsPycgKyBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnKVxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiAndXJsPycgKyBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YSlcbiAgICB9XG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gY29uZmlndXJhdGlvblxuY29uc3Qgd2VicGFja0NvbmZpZ3VyYXRpb246V2VicGFja0NvbmZpZ3VyYXRpb24gPSB7XG4gICAgY2FjaGU6IGNvbmZpZ3VyYXRpb24uY2FjaGUubWFpbixcbiAgICBjb250ZXh0OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICBkZXZ0b29sOiBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50LnRvb2wsXG4gICAgZGV2U2VydmVyOiBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50LnNlcnZlcixcbiAgICAvLyByZWdpb24gaW5wdXRcbiAgICBlbnRyeTogY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCxcbiAgICBleHRlcm5hbHM6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMsXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczogY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgZXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUsXG4gICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGUsXG4gICAgICAgIG1vZHVsZXM6IEhlbHBlci5ub3JtYWxpemVQYXRocyhbXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2VcbiAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMpKSxcbiAgICAgICAgdW5zYWZlQ2FjaGU6IGNvbmZpZ3VyYXRpb24uY2FjaGUudW5zYWZlLFxuICAgICAgICBhbGlhc0ZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXNcbiAgICB9LFxuICAgIHJlc29sdmVMb2FkZXI6IHtcbiAgICAgICAgYWxpYXM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXMsXG4gICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMuZmlsZSxcbiAgICAgICAgbW9kdWxlRXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5sb2FkZXIuZXh0ZW5zaW9ucy5tb2R1bGUsXG4gICAgICAgIG1vZHVsZXM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICBhbGlhc0ZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXNcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBvdXRwdXRcbiAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsZW5hbWU6IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCksXG4gICAgICAgIGhhc2hGdW5jdGlvbjogY29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtLFxuICAgICAgICBsaWJyYXJ5OiBsaWJyYXJ5TmFtZSxcbiAgICAgICAgbGlicmFyeVRhcmdldDogKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAnYnVpbGRETEwnXG4gICAgICAgICkgPyAndmFyJyA6IGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LnNlbGYsXG4gICAgICAgIHBhdGg6IGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgcHVibGljUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5wdWJsaWMsXG4gICAgICAgIHBhdGhpbmZvOiBjb25maWd1cmF0aW9uLmRlYnVnLFxuICAgICAgICB1bWROYW1lZERlZmluZTogdHJ1ZVxuICAgIH0sXG4gICAgdGFyZ2V0OiBjb25maWd1cmF0aW9uLnRhcmdldFRlY2hub2xvZ3ksXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgbW9kdWxlOiB7XG4gICAgICAgIG5vUGFyc2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9ucyxcbiAgICAgICAgbG9hZGVyczogW1xuICAgICAgICAgICAgLy8gQ29udmVydCB0byBuYXRpdmUgd2ViIHR5cGVzLlxuICAgICAgICAgICAgLy8gcmVnaW9uIHNjcmlwdFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC5qcyg/OlxcPy4qKT8kLyxcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGxvYWRlci5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdCxcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoW1xuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmphdmFTY3JpcHRdLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucy5kaXJlY3RvcnlQYXRocykpLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IEhlbHBlci5zdHJpcExvYWRlcihmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICAvLyByZWdpb24gaHRtbCAodGVtcGxhdGVzKVxuICAgICAgICAgICAgLy8gTk9URTogVGhpcyBpcyBvbmx5IGZvciB0aGUgbWFpbiBlbnRyeSB0ZW1wbGF0ZS5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAnXicgKyBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFJlZ3VsYXJFeHByZXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUpXG4gICAgICAgICAgICAgICAgICAgICkgKyAnKD86XFxcXD8uKik/JCcpLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgICAgIDAsIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUubGFzdEluZGV4T2YoXG4gICAgICAgICAgICAgICAgICAgICAgICAnIScpKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXN0OiAvXFwucHVnKD86XFw/LiopPyQvLFxuICAgICAgICAgICAgICAgIGxvYWRlcjpcbiAgICAgICAgICAgICAgICAgICAgJ2ZpbGU/bmFtZT0nICsgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQudGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgKSArIGBbbmFtZV0uaHRtbD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdIWAgK1xuICAgICAgICAgICAgICAgICAgICBgZXh0cmFjdCEke2xvYWRlci5odG1sfSEke2xvYWRlci5wcmVwcm9jZXNzb3IucHVnfWAsXG4gICAgICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC50ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICBleGNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5zdHJpcExvYWRlcihodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZSkpKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gTG9hZHMgZGVwZW5kZW5jaWVzLlxuICAgICAgICAgICAgLy8gcmVnaW9uIHN0eWxlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVzdDogL1xcLmNzcyg/OlxcPy4qKT8kLyxcbiAgICAgICAgICAgICAgICBsb2FkZXI6IHBsdWdpbnMuRXh0cmFjdFRleHQuZXh0cmFjdCh7XG4gICAgICAgICAgICAgICAgICAgIGZhbGxiYWNrTG9hZGVyOiBsb2FkZXIuc3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogYCR7bG9hZGVyLmNhc2NhZGluZ1N0eWxlU2hlZXR9IWAgK1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXIucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoW1xuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHMpKSxcbiAgICAgICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGggPSBIZWxwZXIuc3RyaXBMb2FkZXIoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICApKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGh0bWwgKHRlbXBsYXRlcylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXN0OiAvXFwuaHRtbCg/OlxcPy4qKT8kLyxcbiAgICAgICAgICAgICAgICBsb2FkZXI6XG4gICAgICAgICAgICAgICAgICAgICdmaWxlP25hbWU9JyArIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LnRlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICkgKyBgW25hbWVdLltleHRdPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF0hYCArXG4gICAgICAgICAgICAgICAgICAgIGBleHRyYWN0ISR7bG9hZGVyLmh0bWx9YCxcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LnRlbXBsYXRlLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IEhlbHBlci5ub3JtYWxpemVQYXRocyhjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwubWFwKChcbiAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgICAgICApOnN0cmluZyA9PiBIZWxwZXIuc3RyaXBMb2FkZXIoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUpKSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIE9wdGltaXplIGxvYWRlZCBhc3NldHMuXG4gICAgICAgICAgICAvLyByZWdpb24gZm9udFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC5lb3QoPzpcXD8uKik/JC8sXG4gICAgICAgICAgICAgICAgbG9hZGVyOiBsb2FkZXIucG9zdHByb2Nlc3Nvci5mb250LmVvdFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC53b2ZmMj8oPzpcXD8uKik/JC8sXG4gICAgICAgICAgICAgICAgbG9hZGVyOiBsb2FkZXIucG9zdHByb2Nlc3Nvci5mb250LndvZmZcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0ZXN0OiAvXFwudHRmKD86XFw/LiopPyQvLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogbG9hZGVyLnBvc3Rwcm9jZXNzb3IuZm9udC50dGZcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0ZXN0OiAvXFwuc3ZnKD86XFw/LiopPyQvLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogbG9hZGVyLnBvc3Rwcm9jZXNzb3IuZm9udC5zdmdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBpbWFnZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC4oPzpwbmd8anBnfGljb3xnaWYpKD86XFw/LiopPyQvLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogbG9hZGVyLnBvc3Rwcm9jZXNzb3IuaW1hZ2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBkYXRhXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVzdDogLy4rLyxcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGxvYWRlci5wb3N0cHJvY2Vzc29yLmRhdGEsXG4gICAgICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5kYXRhLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW5jbHVkZXMocGF0aC5leHRuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKGZpbGVQYXRoKSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgXVxuICAgIH0sXG4gICAgcGx1Z2luczogcGx1Z2luSW5zdGFuY2VzLmNvbmNhdChuZXcgd2VicGFjay5Mb2FkZXJPcHRpb25zUGx1Z2luKHtcbiAgICAgICAgLy8gTGV0IHRoZSBcImh0bWwtbG9hZGVyXCIgYWNjZXNzIGZ1bGwgaHRtbCBtaW5pZmllciBwcm9jZXNzaW5nXG4gICAgICAgIC8vIGNvbmZpZ3VyYXRpb24uXG4gICAgICAgIGh0bWw6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5odG1sTWluaWZpZXIsXG4gICAgICAgIHBvc3Rjc3M6ICgpOkFycmF5PE9iamVjdD4gPT4gW1xuICAgICAgICAgICAgcG9zdGNzc0ltcG9ydCh7XG4gICAgICAgICAgICAgICAgYWRkRGVwZW5kZW5jeVRvOiB3ZWJwYWNrLFxuICAgICAgICAgICAgICAgIHJvb3Q6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgTk9URTogQ2hlY2tpbmcgcGF0aCBkb2Vzbid0IHdvcmsgaWYgZm9udHMgYXJlIHJlZmVyZW5jZWQgaW5cbiAgICAgICAgICAgICAgICBsaWJyYXJpZXMgcHJvdmlkZWQgaW4gYW5vdGhlciBsb2NhdGlvbiB0aGFuIHRoZSBwcm9qZWN0IGl0c2VsZlxuICAgICAgICAgICAgICAgIGxpa2UgdGhlIG5vZGVfbW9kdWxlcyBmb2xkZXIuXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgcG9zdGNzc0NTU25leHQoe2Jyb3dzZXJzOiAnPiAwJSd9KSxcbiAgICAgICAgICAgIHBvc3Rjc3NGb250UGF0aCh7Y2hlY2tQYXRoOiBmYWxzZX0pLFxuICAgICAgICAgICAgcG9zdGNzc1VSTCh7ZmlsdGVyOiAnJywgbWF4U2l6ZTogMH0pLFxuICAgICAgICAgICAgcG9zdGNzc1Nwcml0ZXMoe1xuICAgICAgICAgICAgICAgIGZpbHRlckJ5OiAoKTpQcm9taXNlPG51bGw+ID0+IG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgKTpQcm9taXNlPG51bGw+ID0+IChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmltYWdlID8gcmVzb2x2ZSA6IHJlamVjdFxuICAgICAgICAgICAgICAgICkoKSksXG4gICAgICAgICAgICAgICAgaG9va3M6IHtvblNhdmVTcHJpdGVzaGVldDogKGltYWdlOk9iamVjdCk6c3RyaW5nID0+IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3ByaXRlUGF0aCwgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQuaW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuaW1hZ2UpKX0sXG4gICAgICAgICAgICAgICAgc3R5bGVzaGVldFBhdGg6XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICBzcHJpdGVQYXRoOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmltYWdlXG4gICAgICAgICAgICB9KVxuICAgICAgICBdLFxuICAgICAgICBwdWc6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5wdWdcbiAgICB9KSlcbn1cbmlmIChjb25maWd1cmF0aW9uLmRlYnVnKVxuICAgIGNvbnNvbGUubG9nKCdVc2luZyB3ZWJwYWNrIGNvbmZpZ3VyYXRpb246JywgdXRpbC5pbnNwZWN0KFxuICAgICAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbiwge2RlcHRoOiBudWxsfSkpXG4vLyBlbmRyZWdpb25cbmV4cG9ydCBkZWZhdWx0IHdlYnBhY2tDb25maWd1cmF0aW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==