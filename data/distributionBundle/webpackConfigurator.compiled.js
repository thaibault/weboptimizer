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
if (_configurator2.default.buildDefinition) pluginInstances.push(new _webpack2.default.DefinePlugin(_configurator2.default.buildDefinition));
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
                    var type = _helper2.default.determineAssetType(filePath, _configurator2.default.build, _configurator2.default.path);
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
pluginInstances.push(new plugins.ExtractText(_configurator2.default.files.compose.cascadingStyleSheet ? _path2.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.cascadingStyleSheet) : _configurator2.default.path.target.base, { allChunks: true, disable: !_configurator2.default.files.compose.cascadingStyleSheet }));
// /// endregion
// /// region performs implicit external logic
if (_configurator2.default.injection.external === '__implicit__')
    /*
        We only want to process modules from local context in library mode,
        since a concrete project using this library should combine all assets
        (and deduplicate them) for optimal bundling results. NOTE: Only native
        javaScript and json modules will be marked as external dependency.
    */
    _configurator2.default.injection.external = function (context, request, callback) {
        request = request.replace(/^!+/, '');
        if (request.startsWith('/')) request = _path2.default.relative(_configurator2.default.path.context, request);
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = _configurator2.default.module.directories.concat(_configurator2.default.loader.directories)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
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

        var resolvedRequest = _helper2.default.determineExternalRequest(request, _configurator2.default.path.context, context, _configurator2.default.injection.internal.normalized, _configurator2.default.path.ignore.concat(_configurator2.default.module.directories, _configurator2.default.loader.directories).map(function (filePath) {
            return _path2.default.resolve(_configurator2.default.path.context, filePath);
        }).filter(function (filePath) {
            return !_configurator2.default.path.context.startsWith(filePath);
        }), _configurator2.default.module.aliases, _configurator2.default.knownExtensions, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore, _configurator2.default.injection.implicitExternalIncludePattern, _configurator2.default.injection.implicitExternalExcludePattern, _configurator2.default.inPlace.externalLibrary.normal, _configurator2.default.inPlace.externalLibrary.dynamic);
        if (resolvedRequest) {
            if (['var', 'umd'].includes(_configurator2.default.exportFormat.external) && request in _configurator2.default.injection.externalAliases) resolvedRequest = _configurator2.default.injection.externalAliases[request];
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
                if (assetRequest.replace(/([^?]+)\?.*$/, '$1').endsWith(_configurator2.default.build.javaScript.outputExtension)) {
                    var source = compilation.assets[assetRequest].source();
                    if (typeof source === 'string') {
                        for (var replacement in _configurator2.default.injection.externalAliases) {
                            if (_configurator2.default.injection.externalAliases.hasOwnProperty(replacement)) source = source.replace(new RegExp('(require\\()"' + _clientnode2.default.stringConvertToValidRegularExpression(_configurator2.default.injection.externalAliases[replacement]) + '"(\\))', 'g'), '$1\'' + replacement + '\'$2').replace(new RegExp('(define\\("' + _clientnode2.default.stringConvertToValidRegularExpression(bundleName) + '", \\[.*)"' + _clientnode2.default.stringConvertToValidRegularExpression(_configurator2.default.injection.externalAliases[replacement]) + '"(.*\\], factory\\);)'), '$1\'' + replacement + '\'$2');
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
    context: _configurator2.default.path.context,
    debug: _configurator2.default.debug,
    devtool: _configurator2.default.development.tool,
    devServer: _configurator2.default.development.server,
    // region input
    entry: _configurator2.default.injection.internal.normalized,
    externals: _configurator2.default.injection.external,
    resolveLoader: {
        alias: _configurator2.default.loader.aliases,
        extensions: _configurator2.default.loader.extensions,
        modulesDirectories: _configurator2.default.loader.directories
    },
    resolve: {
        alias: _configurator2.default.module.aliases,
        extensions: _configurator2.default.knownExtensions,
        root: [_configurator2.default.path.source.asset.base],
        modulesDirectories: _configurator2.default.module.directories
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
        noParse: _configurator2.default.module.skipParseRegularExpression,
        preLoaders: [
        // Convert to native web types.
        // region script
        {
            test: /\.js(?:\?.*)?$/,
            loader: loader.preprocessor.javaScript,
            include: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.javaScript].concat(_configurator2.default.module.locations.directoryPaths)),
            exclude: function exclude(filePath) {
                filePath = _helper2.default.stripLoader(filePath);
                return _helper2.default.isFilePathInLocation(filePath, _configurator2.default.path.ignore.concat(_configurator2.default.module.directories, _configurator2.default.loader.directories).map(function (filePath) {
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
        }
        // endregion
        ],
        loaders: [
        // Loads dependencies.
        // region style
        {
            test: /\.css(?:\?.*)?$/,
            loader: plugins.ExtractText.extract(loader.style, loader.cascadingStyleSheet + '!' + loader.preprocessor.cascadingStyleSheet),
            include: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.cascadingStyleSheet].concat(_configurator2.default.module.locations.directoryPaths)),
            exclude: function exclude(filePath) {
                filePath = _helper2.default.stripLoader(filePath);
                return _helper2.default.isFilePathInLocation(filePath, _configurator2.default.path.ignore.concat(_configurator2.default.module.directories, _configurator2.default.loader.directories).map(function (filePath) {
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
        }
        // endregion
        ],
        postLoaders: [
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
                return _configurator2.default.knownExtensions.includes(_path2.default.extname(_helper2.default.stripLoader(filePath)));
            }
        }
        // endregion
        ]
    },
    postcss: function postcss() {
        return [(0, _postcssImport2.default)({
            addDependencyTo: _webpack2.default,
            root: _configurator2.default.path.context
        }),
        /*
            NOTE: Checking path doesn't work if fonts are referenced in
            libraries provided in another location than the project itself like
            the node_modules folder.
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
    html: _configurator2.default.module.optimizer.htmlMinifier,
    // Let the "html-loader" access full html minifier processing
    // configuration.
    pug: _configurator2.default.module.preprocessor.pug,
    plugins: pluginInstances
};
if (_configurator2.default.debug) console.log('Using webpack configuration:', _util2.default.inspect(webpackConfiguration, { depth: null }));
// endregion
exports.default = webpackConfiguration;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0E7Ozs7OztBQUNBOzs7O0FBQ0E7O0lBQVksRzs7QUFDWjs7SUFBWSxVOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUtBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFjQTs7OztBQUNBOzs7O0FBS0E7Ozs7QUFNQTs7Ozs7Ozs7QUFqQ0E7QUFDQSxJQUFJO0FBQ0EsWUFBUSw2QkFBUjtBQUNILENBRkQsQ0FFRSxPQUFPLEtBQVAsRUFBYyxDQUFFO0FBR2xCLElBQU0sVUFBVSxRQUFRLHNCQUFSLEdBQWhCOzs7QUFHQSxRQUFRLElBQVIsR0FBZSxRQUFRLElBQXZCO0FBQ0EsUUFBUSxXQUFSLEdBQXNCLFFBQVEsV0FBOUI7QUFDQSxRQUFRLGtCQUFSLEdBQTZCLFFBQVEsK0JBQVIsQ0FBN0I7QUFDQSxRQUFRLFdBQVIsR0FBc0IsUUFBUSxXQUE5QjtBQUNBLFFBQVEsT0FBUixHQUFrQixRQUFRLHlCQUFSLENBQWxCO0FBQ0EsUUFBUSxRQUFSLEdBQW1CLFFBQVEseUJBQVIsRUFBbUMsT0FBdEQ7QUFDQSxRQUFRLE9BQVIsR0FBa0IsUUFBUSxnQkFBUixDQUFsQjs7QUFTQTtBQUNBO0FBQ0E7O0FBRUEsUUFBUSxLQUFSLENBQWMsUUFBUSxPQUFSLENBQWdCLGFBQWhCLENBQWQsRUFBOEMsT0FBOUMsR0FBd0QsWUFBZTtBQUNuRSx5QkFBTSxZQUFOLENBQW1CLElBQW5CLEVBQXlCLEtBQUssT0FBOUIsRUFBdUMsTUFBdkMsRUFBK0MsS0FBSyxPQUFwRDtBQUNBLFdBQU8scUJBQXVCLEtBQXZCLENBQTZCLElBQTdCLEVBQW1DLFNBQW5DLENBQVA7QUFDSCxDQUhEO0FBSUE7O0FBRUEsSUFBTSxnQ0FDRixzQkFBd0IsWUFENUI7QUFFQSxRQUFRLEtBQVIsQ0FBYyxRQUFRLE9BQVIsQ0FB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LEVBQUMsbUJBQW1CLDJCQUFDLEtBQUQ7QUFBQSwyQkFBeUIsZUFBSyxJQUFMLENBQ2hELE1BQU0sVUFEMEMsRUFDOUIsZUFBSyxRQUFMLENBQ2QsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxLQURsQixFQUVkLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FGZCxDQUQ4QixDQUF6QjtBQUFBLGlCQUFwQixFQU5JO0FBVVgsNEJBQ0ksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxtQkFYekI7QUFZWCx3QkFBWSx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDO0FBWmpDLFNBQWYsQ0FieUIsQ0FBcEI7QUFBQSxLQXJLcUM7QUFpTTlDLFVBQU0sdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixZQWpNUztBQWtNOUM7QUFDQTtBQUNBLFNBQUssdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxHQXBNTztBQXFNOUMsYUFBUztBQXJNcUMsQ0FBbEQ7QUF1TUEsSUFBSSx1QkFBYyxLQUFsQixFQUNJLFFBQVEsR0FBUixDQUFZLDhCQUFaLEVBQTRDLGVBQUssT0FBTCxDQUN4QyxvQkFEd0MsRUFDbEIsRUFBQyxPQUFPLElBQVIsRUFEa0IsQ0FBNUM7QUFFSjtrQkFDZSxvQjtBQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6IndlYnBhY2tDb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgKiBhcyBkb20gZnJvbSAnanNkb20nXG5pbXBvcnQgKiBhcyBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwb3N0Y3NzQ1NTbmV4dCBmcm9tICdwb3N0Y3NzLWNzc25leHQnXG5pbXBvcnQgcG9zdGNzc0ZvbnRQYXRoIGZyb20gJ3Bvc3Rjc3MtZm9udHBhdGgnXG5pbXBvcnQgcG9zdGNzc0ltcG9ydCBmcm9tICdwb3N0Y3NzLWltcG9ydCdcbmltcG9ydCBwb3N0Y3NzU3ByaXRlcyBmcm9tICdwb3N0Y3NzLXNwcml0ZXMnXG5pbXBvcnQgcG9zdGNzc1VSTCBmcm9tICdwb3N0Y3NzLXVybCdcbi8vIE5PVEU6IE9ubHkgbmVlZGVkIGZvciBkZWJ1Z2dpbmcgdGhpcyBmaWxlLlxudHJ5IHtcbiAgICByZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInKVxufSBjYXRjaCAoZXJyb3IpIHt9XG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IHdlYnBhY2sgZnJvbSAnd2VicGFjaydcbmNvbnN0IHBsdWdpbnMgPSByZXF1aXJlKCd3ZWJwYWNrLWxvYWQtcGx1Z2lucycpKClcbmltcG9ydCB7UmF3U291cmNlIGFzIFdlYnBhY2tSYXdTb3VyY2V9IGZyb20gJ3dlYnBhY2stc291cmNlcydcblxucGx1Z2lucy5IVE1MID0gcGx1Z2lucy5odG1sXG5wbHVnaW5zLkV4dHJhY3RUZXh0ID0gcGx1Z2lucy5leHRyYWN0VGV4dFxucGx1Z2lucy5BZGRBc3NldEhUTUxQbHVnaW4gPSByZXF1aXJlKCdhZGQtYXNzZXQtaHRtbC13ZWJwYWNrLXBsdWdpbicpXG5wbHVnaW5zLk9wZW5Ccm93c2VyID0gcGx1Z2lucy5vcGVuQnJvd3NlclxucGx1Z2lucy5GYXZpY29uID0gcmVxdWlyZSgnZmF2aWNvbnMtd2VicGFjay1wbHVnaW4nKVxucGx1Z2lucy5JbWFnZW1pbiA9IHJlcXVpcmUoJ2ltYWdlbWluLXdlYnBhY2stcGx1Z2luJykuZGVmYXVsdFxucGx1Z2lucy5PZmZsaW5lID0gcmVxdWlyZSgnb2ZmbGluZS1wbHVnaW4nKVxuXG5pbXBvcnQgdHlwZSB7XG4gICAgRG9tTm9kZSwgSFRNTENvbmZpZ3VyYXRpb24sIFByb2NlZHVyZUZ1bmN0aW9uLCBQcm9taXNlQ2FsbGJhY2tGdW5jdGlvbixcbiAgICBXZWJwYWNrQ29uZmlndXJhdGlvbiwgV2luZG93XG59IGZyb20gJy4vdHlwZSdcbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yLmNvbXBpbGVkJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcblxuLy8gLyByZWdpb24gbW9ua2V5IHBhdGNoZXNcbi8vIE1vbmtleS1QYXRjaCBodG1sIGxvYWRlciB0byByZXRyaWV2ZSBodG1sIGxvYWRlciBvcHRpb25zIHNpbmNlIHRoZVxuLy8gXCJ3ZWJwYWNrLWh0bWwtcGx1Z2luXCIgZG9lc24ndCBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgbG9hZGVyIGludGVyZmFjZS5cbmltcG9ydCBodG1sTG9hZGVyTW9kdWxlQmFja3VwIGZyb20gJ2h0bWwtbG9hZGVyJ1xucmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2h0bWwtbG9hZGVyJyldLmV4cG9ydHMgPSBmdW5jdGlvbigpOmFueSB7XG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHRoaXMub3B0aW9ucywgbW9kdWxlLCB0aGlzLm9wdGlvbnMpXG4gICAgcmV0dXJuIGh0bWxMb2FkZXJNb2R1bGVCYWNrdXAuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuLy8gTW9ua2V5LVBhdGNoIGxvYWRlci11dGlscyB0byBkZWZpbmUgd2hpY2ggdXJsIGlzIGEgbG9jYWwgcmVxdWVzdC5cbmltcG9ydCBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cCBmcm9tICdsb2FkZXItdXRpbHMnXG5jb25zdCBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cDoodXJsOnN0cmluZykgPT4gYm9vbGVhbiA9XG4gICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAuaXNVcmxSZXF1ZXN0XG5yZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSgnbG9hZGVyLXV0aWxzJyldLmV4cG9ydHMuaXNVcmxSZXF1ZXN0ID0gZnVuY3Rpb24oXG4gICAgdXJsOnN0cmluZ1xuKTpib29sZWFuIHtcbiAgICBpZiAodXJsLm1hdGNoKC9eW2Etel0rOi4rLykpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cC5hcHBseShcbiAgICAgICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAsIGFyZ3VtZW50cylcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBpbml0aWFsaXNhdGlvblxuLy8gLyByZWdpb24gZGV0ZXJtaW5lIGxpYnJhcnkgbmFtZVxubGV0IGxpYnJhcnlOYW1lOnN0cmluZ1xuaWYgKCdsaWJyYXJ5TmFtZScgaW4gY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmxpYnJhcnlOYW1lKVxuICAgIGxpYnJhcnlOYW1lID0gY29uZmlndXJhdGlvbi5saWJyYXJ5TmFtZVxuZWxzZSBpZiAoT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCkubGVuZ3RoID4gMSlcbiAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV0nXG5lbHNlIHtcbiAgICBsaWJyYXJ5TmFtZSA9IGNvbmZpZ3VyYXRpb24ubmFtZVxuICAgIGlmIChjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmID09PSAndmFyJylcbiAgICAgICAgbGlicmFyeU5hbWUgPSBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShsaWJyYXJ5TmFtZSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBwbHVnaW5zXG5jb25zdCBwbHVnaW5JbnN0YW5jZXM6QXJyYXk8T2JqZWN0PiA9IFtcbiAgICBuZXcgd2VicGFjay5vcHRpbWl6ZS5PY2N1cnJlbmNlT3JkZXJQbHVnaW4odHJ1ZSldXG4vLyAvLyByZWdpb24gZGVmaW5lIG1vZHVsZXMgdG8gaWdub3JlXG5mb3IgKGNvbnN0IGlnbm9yZVBhdHRlcm46c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmlnbm9yZVBhdHRlcm4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suSWdub3JlUGx1Z2luKG5ldyBSZWdFeHAoaWdub3JlUGF0dGVybikpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgaHRtbCBmaWxlXG5sZXQgaHRtbEF2YWlsYWJsZTpib29sZWFuID0gZmFsc2VcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gIT09ICdidWlsZERMTCcpXG4gICAgZm9yIChsZXQgaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24gb2YgY29uZmlndXJhdGlvbi5maWxlcy5odG1sKVxuICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVN5bmMoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuc3Vic3RyaW5nKFxuICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUubGFzdEluZGV4T2YoJyEnKSArIDFcbiAgICAgICAgKSkpIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZSA9PT1cbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUgPVxuICAgICAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5zdWJzdHJpbmcoXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5sYXN0SW5kZXhPZignIScpICsgMSlcbiAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkhUTUwoaHRtbENvbmZpZ3VyYXRpb24pKVxuICAgICAgICAgICAgaHRtbEF2YWlsYWJsZSA9IHRydWVcbiAgICAgICAgfVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgZmF2aWNvbnNcbmlmIChodG1sQXZhaWxhYmxlICYmIGNvbmZpZ3VyYXRpb24uZmF2aWNvbiAmJiBIZWxwZXIuaXNGaWxlU3luYyhcbiAgICBjb25maWd1cmF0aW9uLmZhdmljb24ubG9nb1xuKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5GYXZpY29uKGNvbmZpZ3VyYXRpb24uZmF2aWNvbikpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBwcm92aWRlIG9mZmxpbmUgZnVuY3Rpb25hbGl0eVxuaWYgKGh0bWxBdmFpbGFibGUgJiYgY29uZmlndXJhdGlvbi5vZmZsaW5lKSB7XG4gICAgaWYgKCFbJ3NlcnZlJywgJ3Rlc3RJbkJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgKSkge1xuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQpXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm9mZmxpbmUuZXhjbHVkZXMucHVzaChwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICkgKyBgKi5jc3M/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PSpgKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQpXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm9mZmxpbmUuZXhjbHVkZXMucHVzaChwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmphdmFTY3JpcHRcbiAgICAgICAgICAgICkgKyBgKi5qcz8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09KmApXG4gICAgfVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLk9mZmxpbmUoY29uZmlndXJhdGlvbi5vZmZsaW5lKSlcbn1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIG9wZW5zIGJyb3dzZXIgYXV0b21hdGljYWxseVxuaWYgKGNvbmZpZ3VyYXRpb24uZGV2ZWxvcG1lbnQub3BlbkJyb3dzZXIgJiYgKGh0bWxBdmFpbGFibGUgJiYgW1xuICAgICdzZXJ2ZScsICd0ZXN0SW5Ccm93c2VyJ1xuXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PcGVuQnJvd3NlcihcbiAgICAgICAgY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5vcGVuQnJvd3NlcikpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBwcm92aWRlIGJ1aWxkIGVudmlyb25tZW50XG5pZiAoY29uZmlndXJhdGlvbi5idWlsZERlZmluaXRpb24pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGVmaW5lUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkRGVmaW5pdGlvbikpXG5pZiAoY29uZmlndXJhdGlvbi5tb2R1bGUucHJvdmlkZSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Qcm92aWRlUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcm92aWRlKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIG1vZHVsZXMvYXNzZXRzXG4vLyAvLy8gcmVnaW9uIHBlcmZvcm0gamF2YVNjcmlwdCBtaW5pZmljYXRpb24vb3B0aW1pc2F0aW9uXG5pZiAoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLnVnbGlmeUpTKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLm9wdGltaXplLlVnbGlmeUpzUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIudWdsaWZ5SlMpKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBhcHBseSBtb2R1bGUgcGF0dGVyblxucGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoY29tcGlsZXI6T2JqZWN0KTp2b2lkID0+IHtcbiAgICBjb21waWxlci5wbHVnaW4oJ2VtaXQnLCAoXG4gICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICApOnZvaWQgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHJlcXVlc3Q6c3RyaW5nIGluIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgIGlmIChjb21waWxhdGlvbi5hc3NldHMuaGFzT3duUHJvcGVydHkocmVxdWVzdCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSByZXF1ZXN0LnJlcGxhY2UoL1xcP1teP10rJC8sICcnKVxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGU6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCBjb25maWd1cmF0aW9uLmJ1aWxkLCBjb25maWd1cmF0aW9uLnBhdGgpXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgJiYgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV0gJiYgIShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgLmV4Y2x1ZGVGaWxlUGF0aFJlZ3VsYXJFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgKSkudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc291cmNlOj9zdHJpbmcgPSBjb21waWxhdGlvbi5hc3NldHNbcmVxdWVzdF0uc291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW3JlcXVlc3RdID0gbmV3IFdlYnBhY2tSYXdTb3VyY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV0ucGF0dGVybi5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXFx7MVxcfS9nLCBzb3VyY2UucmVwbGFjZSgvXFwkL2csICckJCQnKSkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBjYWxsYmFjaygpXG4gICAgfSlcbn19KVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBpbi1wbGFjZSBjb25maWd1cmVkIGFzc2V0cyBpbiB0aGUgbWFpbiBodG1sIGZpbGVcbmlmIChodG1sQXZhaWxhYmxlICYmICFbJ3NlcnZlJywgJ3Rlc3RJbkJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbikpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoY29tcGlsZXI6T2JqZWN0KTp2b2lkID0+IHtcbiAgICAgICAgY29tcGlsZXIucGx1Z2luKCdlbWl0JywgKFxuICAgICAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbFswXS5maWxlbmFtZSBpbiBjb21waWxhdGlvbi5hc3NldHMgJiYgKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0IHx8XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHRcbiAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgZG9tLmVudihjb21waWxhdGlvbi5hc3NldHNbY29uZmlndXJhdGlvbi5maWxlcy5odG1sW1xuICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgXS5maWxlbmFtZV0uc291cmNlKCksIChlcnJvcjo/RXJyb3IsIHdpbmRvdzpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybFByZWZpeDpzdHJpbmcgPSBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgnW2NvbnRlbnRoYXNoXScsICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSA9IHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBsaW5rW2hyZWZePVwiJHt1cmxQcmVmaXh9XCJdYClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFzc2V0OnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoYXNzZXQgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXQuc3RhcnRzV2l0aCh1cmxQcmVmaXgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpblBsYWNlRG9tTm9kZTpEb21Ob2RlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZS50ZXh0Q29udGVudCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1thc3NldF0uc291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblBsYWNlRG9tTm9kZSwgZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBUaGlzIGRvZXNuJ3QgcHJldmVudCB3ZWJwYWNrIGZyb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpbmcgdGhpcyBmaWxlIGlmIHByZXNlbnQgaW4gYW5vdGhlciBjaHVua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyByZW1vdmluZyBpdCAoYW5kIGEgcG90ZW50aWFsIHNvdXJjZSBtYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSkgbGF0ZXIgaW4gdGhlIFwiZG9uZVwiIGhvb2suXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTm8gcmVmZXJlbmNlZCBjYXNjYWRpbmcgc3R5bGUgc2hlZXQgZmlsZSBpbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHJlc3VsdGluZyBtYXJrdXAgZm91bmQgd2l0aCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHNlbGVjdG9yOiBsaW5rW2hyZWZePVwiJHt1cmxQcmVmaXh9XCJdYClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybFByZWZpeDpzdHJpbmcgPSBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW2hhc2hdJywgJycpKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9tTm9kZTpEb21Ob2RlID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYHNjcmlwdFtzcmNePVwiJHt1cmxQcmVmaXh9XCJdYClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFzc2V0OnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoYXNzZXQgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXNzZXQuc3RhcnRzV2l0aCh1cmxQcmVmaXgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnRleHRDb250ZW50ID0gY29tcGlsYXRpb24uYXNzZXRzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0uc291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZSgnc3JjJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBUaGlzIGRvZXNuJ3QgcHJldmVudCB3ZWJwYWNrIGZyb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRpbmcgdGhpcyBmaWxlIGlmIHByZXNlbnQgaW4gYW5vdGhlciBjaHVua1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbyByZW1vdmluZyBpdCAoYW5kIGEgcG90ZW50aWFsIHNvdXJjZSBtYXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZSkgbGF0ZXIgaW4gdGhlIFwiZG9uZVwiIGhvb2suXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0XVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTm8gcmVmZXJlbmNlZCBqYXZhU2NyaXB0IGZpbGUgaW4gcmVzdWx0aW5nICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWFya3VwIGZvdW5kIHdpdGggc2VsZWN0b3I6ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2NyaXB0W3NyY149XCIke3VybFByZWZpeH1cIl1gKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1tjb25maWd1cmF0aW9uLmZpbGVzLmh0bWxbXG4gICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgIF0uZmlsZW5hbWVdID0gbmV3IFdlYnBhY2tSYXdTb3VyY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbY29uZmlndXJhdGlvbi5maWxlcy5odG1sW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgICAgIF0uZmlsZW5hbWVdLnNvdXJjZSgpLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgL14oXFxzKjwhZG9jdHlwZVtePl0rPz5cXHMqKVtcXHNcXFNdKiQvaSwgJyQxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSArIHdpbmRvdy5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQub3V0ZXJIVE1MKVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH0pXG4gICAgICAgIGNvbXBpbGVyLnBsdWdpbignYWZ0ZXItZW1pdCcsIChcbiAgICAgICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmZpbGVzLmh0bWxbMF0uZmlsZW5hbWUgaW4gY29tcGlsYXRpb24uYXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0RmlsZVBhdGggPSBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuY2FzY2FkaW5nU3R5bGVTaGVldClcbiAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVTeW5jKGFzc2V0RmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmtTeW5jKGFzc2V0RmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhc3NldEZpbGVQYXRoVGVtcGxhdGUgPSBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdClcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXNzZXRGaWxlUGF0aDpzdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NldEZpbGVQYXRoVGVtcGxhdGUsIHsnW25hbWVdJzogY2h1bmtOYW1lfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVN5bmMoYXNzZXRGaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0udW5saW5rU3luYyhhc3NldEZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFtcbiAgICAgICAgICAgICAgICAgICAgJ2phdmFTY3JpcHQnLCAnY2FzY2FkaW5nU3R5bGVTaGVldCdcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVN5c3RlbS5yZWFkZGlyU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgKS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnJtZGlyU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVdKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICB9KVxuICAgIH19KVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiByZW1vdmUgY2h1bmtzIGlmIGEgY29ycmVzcG9uZGluZyBkbGwgcGFja2FnZSBleGlzdHNcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gIT09ICdidWlsZERMTCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hbmlmZXN0RmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9LyR7Y2h1bmtOYW1lfS5gICtcbiAgICAgICAgICAgICAgICBgZGxsLW1hbmlmZXN0Lmpzb25gXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBtYW5pZmVzdEZpbGVQYXRoXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICApLCB7J1tuYW1lXSc6IGNodW5rTmFtZX0pXG4gICAgICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZXBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlU291cmNlbWFwOiBIZWxwZXIuaXNGaWxlU3luYyhgJHtmaWxlUGF0aH0ubWFwYClcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EbGxSZWZlcmVuY2VQbHVnaW4oe1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgbWFuaWZlc3Q6IHJlcXVpcmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdEZpbGVQYXRoKX0pKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGdlbmVyYXRlIGNvbW1vbiBjaHVua3NcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gIT09ICdidWlsZERMTCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmNvbW1vbkNodW5rSURzKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICApKVxuICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2sub3B0aW1pemUuQ29tbW9uc0NodW5rUGx1Z2luKHtcbiAgICAgICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICBtaW5DaHVua3M6IEluZmluaXR5LFxuICAgICAgICAgICAgICAgIG5hbWU6IGNodW5rTmFtZSxcbiAgICAgICAgICAgICAgICBtaW5TaXplOiAwXG4gICAgICAgICAgICB9KSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gbWFyayBlbXB0eSBqYXZhU2NyaXB0IG1vZHVsZXMgYXMgZHVtbXlcbmlmICghY29uZmlndXJhdGlvbi5uZWVkZWQuamF2YVNjcmlwdClcbiAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5qYXZhU2NyaXB0LCAnLl9fZHVtbXlfXy5jb21waWxlZC5qcycpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGV4dHJhY3QgY2FzY2FkaW5nIHN0eWxlIHNoZWV0c1xucGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuRXh0cmFjdFRleHQoXG4gICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQgPyBwYXRoLnJlbGF0aXZlKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgKSA6IGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwge2FsbENodW5rczogdHJ1ZSwgZGlzYWJsZTpcbiAgICAgICAgIWNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0fSkpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHBlcmZvcm1zIGltcGxpY2l0IGV4dGVybmFsIGxvZ2ljXG5pZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwgPT09ICdfX2ltcGxpY2l0X18nKVxuICAgIC8qXG4gICAgICAgIFdlIG9ubHkgd2FudCB0byBwcm9jZXNzIG1vZHVsZXMgZnJvbSBsb2NhbCBjb250ZXh0IGluIGxpYnJhcnkgbW9kZSxcbiAgICAgICAgc2luY2UgYSBjb25jcmV0ZSBwcm9qZWN0IHVzaW5nIHRoaXMgbGlicmFyeSBzaG91bGQgY29tYmluZSBhbGwgYXNzZXRzXG4gICAgICAgIChhbmQgZGVkdXBsaWNhdGUgdGhlbSkgZm9yIG9wdGltYWwgYnVuZGxpbmcgcmVzdWx0cy4gTk9URTogT25seSBuYXRpdmVcbiAgICAgICAgamF2YVNjcmlwdCBhbmQganNvbiBtb2R1bGVzIHdpbGwgYmUgbWFya2VkIGFzIGV4dGVybmFsIGRlcGVuZGVuY3kuXG4gICAgKi9cbiAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbCA9IChcbiAgICAgICAgY29udGV4dDpzdHJpbmcsIHJlcXVlc3Q6c3RyaW5nLCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnJlcGxhY2UoL14hKy8sICcnKVxuICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICByZXF1ZXN0ID0gcGF0aC5yZWxhdGl2ZShjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgcmVxdWVzdClcbiAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2YgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3JpZXMuY29uY2F0KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3JpZXNcbiAgICAgICAgKSlcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKGZpbGVQYXRoLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIGxldCByZXNvbHZlZFJlcXVlc3Q6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgICAgICByZXF1ZXN0LCBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgY29udGV4dCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcmllcyxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3Rvcmllc1xuICAgICAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGhcbiAgICAgICAgICAgICkpLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpXG4gICAgICAgICAgICApLCBjb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLCBjb25maWd1cmF0aW9uLmtub3duRXh0ZW5zaW9ucyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmltcGxpY2l0RXh0ZXJuYWxJbmNsdWRlUGF0dGVybixcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmltcGxpY2l0RXh0ZXJuYWxFeGNsdWRlUGF0dGVybixcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5leHRlcm5hbExpYnJhcnkubm9ybWFsLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmV4dGVybmFsTGlicmFyeS5keW5hbWljKVxuICAgICAgICBpZiAocmVzb2x2ZWRSZXF1ZXN0KSB7XG4gICAgICAgICAgICBpZiAoWyd2YXInLCAndW1kJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWxcbiAgICAgICAgICAgICkgJiYgcmVxdWVzdCBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbEFsaWFzZXMpXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0ID0gY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWxBbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0XVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsID09PSAndmFyJylcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QgPSBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCAnMC05YS16QS1aXyRcXFxcLicpXG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgbnVsbCwgcmVzb2x2ZWRSZXF1ZXN0LCBjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5leHRlcm5hbClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2soKVxuICAgIH1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gYnVpbGQgZGxsIHBhY2thZ2VzXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAnYnVpbGRETEwnKSB7XG4gICAgbGV0IGRsbENodW5rSURFeGlzdHM6Ym9vbGVhbiA9IGZhbHNlXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZGxsQ2h1bmtJRHMuaW5jbHVkZXMoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBkbGxDaHVua0lERXhpc3RzID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICBpZiAoZGxsQ2h1bmtJREV4aXN0cykge1xuICAgICAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV1ETExQYWNrYWdlJ1xuICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EbGxQbHVnaW4oe1xuICAgICAgICAgICAgcGF0aDogYCR7Y29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlfS9bbmFtZV0uZGxsLW1hbmlmZXN0Lmpzb25gLFxuICAgICAgICAgICAgbmFtZTogbGlicmFyeU5hbWVcbiAgICAgICAgfSkpXG4gICAgfSBlbHNlXG4gICAgICAgIGNvbnNvbGUud2FybignTm8gZGxsIGNodW5rIGlkIGZvdW5kLicpXG59XG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBhcHBseSBmaW5hbCBkb20vamF2YVNjcmlwdCBtb2RpZmljYXRpb25zL2ZpeGVzXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgIGNvbXBpbGVyLnBsdWdpbignZW1pdCcsIChcbiAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHByb21pc2VzOkFycmF5PFByb21pc2U8c3RyaW5nPj4gPSBbXVxuICAgICAgICAvKlxuICAgICAgICAgICAgTk9URTogUmVtb3Zpbmcgc3ltYm9scyBhZnRlciBhIFwiJlwiIGluIGhhc2ggc3RyaW5nIGlzIG5lY2Vzc2FyeSB0b1xuICAgICAgICAgICAgbWF0Y2ggdGhlIGdlbmVyYXRlZCByZXF1ZXN0IHN0cmluZ3MgaW4gb2ZmbGluZSBwbHVnaW4uXG4gICAgICAgICovXG4gICAgICAgIGZvciAoY29uc3QgaHRtbENvbmZpZ3VyYXRpb24gb2YgY29uZmlndXJhdGlvbi5maWxlcy5odG1sKVxuICAgICAgICAgICAgaWYgKGh0bWxDb25maWd1cmF0aW9uLmZpbGVuYW1lIGluIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpQcm9taXNlQ2FsbGJhY2tGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0OlByb21pc2VDYWxsYmFja0Z1bmN0aW9uXG4gICAgICAgICAgICAgICAgKTpXaW5kb3cgPT4gZG9tLmVudihjb21waWxhdGlvbi5hc3NldHNbXG4gICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgXS5zb3VyY2UoKSwgKGVycm9yOj9FcnJvciwgd2luZG93OldpbmRvdyk6P1Byb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmthYmxlczp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQ6ICdzcmMnLCBsaW5rOiAnaHJlZid9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnTmFtZTpzdHJpbmcgaW4gbGlua2FibGVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmthYmxlcy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21Ob2RlOkRvbU5vZGUgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0YWdOYW1lfVske2xpbmthYmxlc1t0YWdOYW1lXX0qPVwiP2AgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZXNbdGFnTmFtZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLmdldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZXNbdGFnTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAoXFxcXD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09YCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1teJl0rKS4qJCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksICckMScpKVxuICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbaHRtbENvbmZpZ3VyYXRpb24uZmlsZW5hbWVdID1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBXZWJwYWNrUmF3U291cmNlKGNvbXBpbGF0aW9uLmFzc2V0c1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgXS5zb3VyY2UoKS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9eKFxccyo8IWRvY3R5cGVbXj5dKz8+XFxzKilbXFxzXFxTXSokL2ksICckMSdcbiAgICAgICAgICAgICAgICAgICAgICAgICkgKyB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbaHRtbENvbmZpZ3VyYXRpb24uZmlsZW5hbWVdKVxuICAgICAgICAgICAgICAgIH0pKSlcbiAgICAgICAgaWYgKCFjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5leHRlcm5hbC5zdGFydHNXaXRoKCd1bWQnKSkge1xuICAgICAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCk6dm9pZCA9PiBjYWxsYmFjaygpKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYnVuZGxlTmFtZTpzdHJpbmcgPSAoXG4gICAgICAgICAgICB0eXBlb2YgbGlicmFyeU5hbWUgPT09ICdzdHJpbmcnXG4gICAgICAgICkgPyBsaWJyYXJ5TmFtZSA6IGxpYnJhcnlOYW1lWzBdXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBUaGUgdW1kIG1vZHVsZSBleHBvcnQgZG9lc24ndCBoYW5kbGUgY2FzZXMgd2hlcmUgdGhlIHBhY2thZ2VcbiAgICAgICAgICAgIG5hbWUgZG9lc24ndCBtYXRjaCBleHBvcnRlZCBsaWJyYXJ5IG5hbWUuIFRoaXMgcG9zdCBwcm9jZXNzaW5nXG4gICAgICAgICAgICBmaXhlcyB0aGlzIGlzc3VlLlxuICAgICAgICAqL1xuICAgICAgICBmb3IgKGNvbnN0IGFzc2V0UmVxdWVzdDpzdHJpbmcgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgaWYgKGFzc2V0UmVxdWVzdC5yZXBsYWNlKC8oW14/XSspXFw/LiokLywgJyQxJykuZW5kc1dpdGgoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZC5qYXZhU2NyaXB0Lm91dHB1dEV4dGVuc2lvblxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIGxldCBzb3VyY2U6c3RyaW5nID0gY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0UmVxdWVzdF0uc291cmNlKClcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50OnN0cmluZyBpblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWxBbGlhc2VzXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbEFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGFzT3duUHJvcGVydHkocmVwbGFjZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyhyZXF1aXJlXFxcXCgpXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRSZWd1bGFyRXhwcmVzc2lvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsQWxpYXNlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICdcIihcXFxcKSknLCAnZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCBgJDEnJHtyZXBsYWNlbWVudH0nJDJgKS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcoZGVmaW5lXFxcXChcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFJlZ3VsYXJFeHByZXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVuZGxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1wiLCBcXFxcWy4qKVwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkUmVndWxhckV4cHJlc3Npb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbEFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnXCIoLipcXFxcXSwgZmFjdG9yeVxcXFwpOyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgYCQxJyR7cmVwbGFjZW1lbnR9JyQyYClcbiAgICAgICAgICAgICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICcocm9vdFxcXFxbKVwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFJlZ3VsYXJFeHByZXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnXCIoXFxcXF0gPSApJ1xuICAgICAgICAgICAgICAgICAgICApLCBcIiQxJ1wiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKGJ1bmRsZU5hbWUpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiJyQyXCJcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbYXNzZXRSZXF1ZXN0XSA9IG5ldyBXZWJwYWNrUmF3U291cmNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCk6dm9pZCA9PiBjYWxsYmFjaygpKVxuICAgIH0pXG59fSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGFkZCBhdXRvbWF0aWMgaW1hZ2UgY29tcHJlc3Npb25cbi8vIE5PVEU6IFRoaXMgcGx1Z2luIHNob3VsZCBiZSBsb2FkZWQgYXQgbGFzdCB0byBlbnN1cmUgdGhhdCBhbGwgZW1pdHRlZCBpbWFnZXNcbi8vIHJhbiB0aHJvdWdoLlxucGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuSW1hZ2VtaW4oXG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmNvbnRlbnQpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gbG9hZGVyXG5sZXQgaW1hZ2VMb2FkZXI6c3RyaW5nID0gJ3VybD8nICsgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5maWxlKVxuY29uc3QgbG9hZGVyOntcbiAgICBwcmVwcm9jZXNzb3I6e1xuICAgICAgICBjYXNjYWRpbmdTdHlsZVNoZWV0OnN0cmluZztcbiAgICAgICAgamF2YVNjcmlwdDpzdHJpbmc7XG4gICAgICAgIHB1ZzpzdHJpbmc7XG4gICAgfTtcbiAgICBodG1sOnN0cmluZztcbiAgICBjYXNjYWRpbmdTdHlsZVNoZWV0OnN0cmluZztcbiAgICBzdHlsZTpzdHJpbmc7XG4gICAgcG9zdHByb2Nlc3Nvcjp7XG4gICAgICAgIGltYWdlOnN0cmluZztcbiAgICAgICAgZm9udDp7XG4gICAgICAgICAgICBlb3Q6c3RyaW5nO1xuICAgICAgICAgICAgd29mZjpzdHJpbmc7XG4gICAgICAgICAgICB0dGY6c3RyaW5nO1xuICAgICAgICAgICAgc3ZnOnN0cmluZ1xuICAgICAgICB9O1xuICAgICAgICBkYXRhOnN0cmluZ1xuICAgIH1cbn0gPSB7XG4gICAgcHJlcHJvY2Vzc29yOiB7XG4gICAgICAgIGNhc2NhZGluZ1N0eWxlU2hlZXQ6ICdwb3N0Y3NzJyArXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgamF2YVNjcmlwdDogJ2JhYmVsPycgKyBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuYmFiZWwpLFxuICAgICAgICBwdWc6ICdwdWc/JyArIFRvb2xzLmNvbnZlcnRDaXJjdWxhck9iamVjdFRvSlNPTihcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5wdWcpXG4gICAgfSxcbiAgICBodG1sOiAnaHRtbD8nICsgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sKSxcbiAgICBjYXNjYWRpbmdTdHlsZVNoZWV0OiBgY3NzJHtjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0fWAsXG4gICAgc3R5bGU6ICdzdHlsZT8nICsgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5zdHlsZSksXG4gICAgcG9zdHByb2Nlc3Nvcjoge1xuICAgICAgICBpbWFnZTogaW1hZ2VMb2FkZXIsXG4gICAgICAgIGZvbnQ6IHtcbiAgICAgICAgICAgIGVvdDogJ3VybD8nICsgVG9vbHMuY29udmVydENpcmN1bGFyT2JqZWN0VG9KU09OKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdCksXG4gICAgICAgICAgICB3b2ZmOiAndXJsPycgKyBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZiksXG4gICAgICAgICAgICB0dGY6ICd1cmw/JyArIFRvb2xzLmNvbnZlcnRDaXJjdWxhck9iamVjdFRvSlNPTihcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYpLFxuICAgICAgICAgICAgc3ZnOiAndXJsPycgKyBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnKVxuICAgICAgICB9LFxuICAgICAgICBkYXRhOiAndXJsPycgKyBUb29scy5jb252ZXJ0Q2lyY3VsYXJPYmplY3RUb0pTT04oXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YSlcbiAgICB9XG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gY29uZmlndXJhdGlvblxuY29uc3Qgd2VicGFja0NvbmZpZ3VyYXRpb246V2VicGFja0NvbmZpZ3VyYXRpb24gPSB7XG4gICAgY29udGV4dDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgZGVidWc6IGNvbmZpZ3VyYXRpb24uZGVidWcsXG4gICAgZGV2dG9vbDogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC50b29sLFxuICAgIGRldlNlcnZlcjogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5zZXJ2ZXIsXG4gICAgLy8gcmVnaW9uIGlucHV0XG4gICAgZW50cnk6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQsXG4gICAgZXh0ZXJuYWxzOiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbCxcbiAgICByZXNvbHZlTG9hZGVyOiB7XG4gICAgICAgIGFsaWFzOiBjb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzLFxuICAgICAgICBleHRlbnNpb25zOiBjb25maWd1cmF0aW9uLmxvYWRlci5leHRlbnNpb25zLFxuICAgICAgICBtb2R1bGVzRGlyZWN0b3JpZXM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yaWVzXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICAgIGFsaWFzOiBjb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICBleHRlbnNpb25zOiBjb25maWd1cmF0aW9uLmtub3duRXh0ZW5zaW9ucyxcbiAgICAgICAgcm9vdDogWyhjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2U6c3RyaW5nKV0sXG4gICAgICAgIG1vZHVsZXNEaXJlY3RvcmllczogY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3JpZXNcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBvdXRwdXRcbiAgICBvdXRwdXQ6IHtcbiAgICAgICAgZmlsZW5hbWU6IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCksXG4gICAgICAgIGhhc2hGdW5jdGlvbjogY29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtLFxuICAgICAgICBsaWJyYXJ5OiBsaWJyYXJ5TmFtZSxcbiAgICAgICAgbGlicmFyeVRhcmdldDogKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAnYnVpbGRETEwnXG4gICAgICAgICkgPyAndmFyJyA6IGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LnNlbGYsXG4gICAgICAgIHBhdGg6IGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgcHVibGljUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5wdWJsaWMsXG4gICAgICAgIHBhdGhpbmZvOiBjb25maWd1cmF0aW9uLmRlYnVnLFxuICAgICAgICB1bWROYW1lZERlZmluZTogdHJ1ZVxuICAgIH0sXG4gICAgdGFyZ2V0OiBjb25maWd1cmF0aW9uLnRhcmdldFRlY2hub2xvZ3ksXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgbW9kdWxlOiB7XG4gICAgICAgIG5vUGFyc2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9uLFxuICAgICAgICBwcmVMb2FkZXJzOiBbXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRvIG5hdGl2ZSB3ZWIgdHlwZXMuXG4gICAgICAgICAgICAvLyByZWdpb24gc2NyaXB0XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVzdDogL1xcLmpzKD86XFw/LiopPyQvLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogbG9hZGVyLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LFxuICAgICAgICAgICAgICAgIGluY2x1ZGU6IEhlbHBlci5ub3JtYWxpemVQYXRocyhbXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuamF2YVNjcmlwdF0uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUubG9jYXRpb25zLmRpcmVjdG9yeVBhdGhzKSksXG4gICAgICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gSGVscGVyLnN0cmlwTG9hZGVyKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yaWVzXG4gICAgICAgICAgICAgICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBodG1sICh0ZW1wbGF0ZXMpXG4gICAgICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIG9ubHkgZm9yIHRoZSBtYWluIGVudHJ5IHRlbXBsYXRlLlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlc3Q6IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICdeJyArIFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkUmVndWxhckV4cHJlc3Npb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgKSArICcoPzpcXFxcPy4qKT8kJyksXG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgMCwgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS5sYXN0SW5kZXhPZihcbiAgICAgICAgICAgICAgICAgICAgICAgICchJykpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC5wdWcoPzpcXD8uKik/JC8sXG4gICAgICAgICAgICAgICAgbG9hZGVyOlxuICAgICAgICAgICAgICAgICAgICAnZmlsZT9uYW1lPScgKyBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICApICsgYFtuYW1lXS5odG1sPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF0hYCArXG4gICAgICAgICAgICAgICAgICAgIGBleHRyYWN0ISR7bG9hZGVyLmh0bWx9ISR7bG9hZGVyLnByZXByb2Nlc3Nvci5wdWd9YCxcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LnRlbXBsYXRlLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IEhlbHBlci5ub3JtYWxpemVQYXRocyhjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlKSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgXSxcbiAgICAgICAgbG9hZGVyczogW1xuICAgICAgICAgICAgLy8gTG9hZHMgZGVwZW5kZW5jaWVzLlxuICAgICAgICAgICAgLy8gcmVnaW9uIHN0eWxlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVzdDogL1xcLmNzcyg/OlxcPy4qKT8kLyxcbiAgICAgICAgICAgICAgICBsb2FkZXI6IHBsdWdpbnMuRXh0cmFjdFRleHQuZXh0cmFjdChcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyLnN0eWxlLFxuICAgICAgICAgICAgICAgICAgICBgJHtsb2FkZXIuY2FzY2FkaW5nU3R5bGVTaGVldH0hYCArXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlci5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldCksXG4gICAgICAgICAgICAgICAgaW5jbHVkZTogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUubG9jYXRpb25zLmRpcmVjdG9yeVBhdGhzKSksXG4gICAgICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gSGVscGVyLnN0cmlwTG9hZGVyKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yaWVzXG4gICAgICAgICAgICAgICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgKSkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBodG1sICh0ZW1wbGF0ZXMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVzdDogL1xcLmh0bWwoPzpcXD8uKik/JC8sXG4gICAgICAgICAgICAgICAgbG9hZGVyOlxuICAgICAgICAgICAgICAgICAgICAnZmlsZT9uYW1lPScgKyBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICApICsgYFtuYW1lXS5bZXh0XT8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdIWAgK1xuICAgICAgICAgICAgICAgICAgICBgZXh0cmFjdCEke2xvYWRlci5odG1sfWAsXG4gICAgICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC50ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICBleGNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoY29uZmlndXJhdGlvbi5maWxlcy5odG1sLm1hcCgoXG4gICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uXG4gICAgICAgICAgICAgICAgKTpzdHJpbmcgPT4gSGVscGVyLnN0cmlwTG9hZGVyKGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlKSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgXSxcbiAgICAgICAgcG9zdExvYWRlcnM6IFtcbiAgICAgICAgICAgIC8vIE9wdGltaXplIGxvYWRlZCBhc3NldHMuXG4gICAgICAgICAgICAvLyByZWdpb24gZm9udFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC5lb3QoPzpcXD8uKik/JC8sXG4gICAgICAgICAgICAgICAgbG9hZGVyOiBsb2FkZXIucG9zdHByb2Nlc3Nvci5mb250LmVvdFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC53b2ZmMj8oPzpcXD8uKik/JC8sXG4gICAgICAgICAgICAgICAgbG9hZGVyOiBsb2FkZXIucG9zdHByb2Nlc3Nvci5mb250LndvZmZcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0ZXN0OiAvXFwudHRmKD86XFw/LiopPyQvLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogbG9hZGVyLnBvc3Rwcm9jZXNzb3IuZm9udC50dGZcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0ZXN0OiAvXFwuc3ZnKD86XFw/LiopPyQvLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogbG9hZGVyLnBvc3Rwcm9jZXNzb3IuZm9udC5zdmdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBpbWFnZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRlc3Q6IC9cXC4oPzpwbmd8anBnfGljb3xnaWYpKD86XFw/LiopPyQvLFxuICAgICAgICAgICAgICAgIGxvYWRlcjogbG9hZGVyLnBvc3Rwcm9jZXNzb3IuaW1hZ2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBkYXRhXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVzdDogLy4rLyxcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGxvYWRlci5wb3N0cHJvY2Vzc29yLmRhdGEsXG4gICAgICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5kYXRhLFxuICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5rbm93bkV4dGVuc2lvbnMuaW5jbHVkZXMocGF0aC5leHRuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKGZpbGVQYXRoKSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgXVxuICAgIH0sXG4gICAgcG9zdGNzczogKCk6QXJyYXk8T2JqZWN0PiA9PiBbXG4gICAgICAgIHBvc3Rjc3NJbXBvcnQoe1xuICAgICAgICAgICAgYWRkRGVwZW5kZW5jeVRvOiB3ZWJwYWNrLFxuICAgICAgICAgICAgcm9vdDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHRcbiAgICAgICAgfSksXG4gICAgICAgIC8qXG4gICAgICAgICAgICBOT1RFOiBDaGVja2luZyBwYXRoIGRvZXNuJ3Qgd29yayBpZiBmb250cyBhcmUgcmVmZXJlbmNlZCBpblxuICAgICAgICAgICAgbGlicmFyaWVzIHByb3ZpZGVkIGluIGFub3RoZXIgbG9jYXRpb24gdGhhbiB0aGUgcHJvamVjdCBpdHNlbGYgbGlrZVxuICAgICAgICAgICAgdGhlIG5vZGVfbW9kdWxlcyBmb2xkZXIuXG4gICAgICAgICovXG4gICAgICAgIHBvc3Rjc3NDU1NuZXh0KHticm93c2VyczogJz4gMCUnfSksXG4gICAgICAgIHBvc3Rjc3NGb250UGF0aCh7Y2hlY2tQYXRoOiBmYWxzZX0pLFxuICAgICAgICBwb3N0Y3NzVVJMKHtmaWx0ZXI6ICcnLCBtYXhTaXplOiAwfSksXG4gICAgICAgIHBvc3Rjc3NTcHJpdGVzKHtcbiAgICAgICAgICAgIGZpbHRlckJ5OiAoKTpQcm9taXNlPG51bGw+ID0+IG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICk6UHJvbWlzZTxudWxsPiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmltYWdlID8gcmVzb2x2ZSA6IHJlamVjdFxuICAgICAgICAgICAgKSgpKSxcbiAgICAgICAgICAgIGhvb2tzOiB7b25TYXZlU3ByaXRlc2hlZXQ6IChpbWFnZTpPYmplY3QpOnN0cmluZyA9PiBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgaW1hZ2Uuc3ByaXRlUGF0aCwgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5pbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmltYWdlKSl9LFxuICAgICAgICAgICAgc3R5bGVzaGVldFBhdGg6XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5jYXNjYWRpbmdTdHlsZVNoZWV0LFxuICAgICAgICAgICAgc3ByaXRlUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5pbWFnZVxuICAgICAgICB9KVxuICAgIF0sXG4gICAgaHRtbDogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmh0bWxNaW5pZmllcixcbiAgICAvLyBMZXQgdGhlIFwiaHRtbC1sb2FkZXJcIiBhY2Nlc3MgZnVsbCBodG1sIG1pbmlmaWVyIHByb2Nlc3NpbmdcbiAgICAvLyBjb25maWd1cmF0aW9uLlxuICAgIHB1ZzogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLnB1ZyxcbiAgICBwbHVnaW5zOiBwbHVnaW5JbnN0YW5jZXNcbn1cbmlmIChjb25maWd1cmF0aW9uLmRlYnVnKVxuICAgIGNvbnNvbGUubG9nKCdVc2luZyB3ZWJwYWNrIGNvbmZpZ3VyYXRpb246JywgdXRpbC5pbnNwZWN0KFxuICAgICAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbiwge2RlcHRoOiBudWxsfSkpXG4vLyBlbmRyZWdpb25cbmV4cG9ydCBkZWZhdWx0IHdlYnBhY2tDb25maWd1cmF0aW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==