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
exports.webpackConfiguration = undefined;

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _cssnano = require('cssnano');

var _cssnano2 = _interopRequireDefault(_cssnano);

var _jsdom = require('jsdom');

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

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

var _ejsLoader = require('./ejsLoader.compiled');

var _ejsLoader2 = _interopRequireDefault(_ejsLoader);

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
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */

var plugins = require('webpack-load-plugins')();


plugins.BabelMinify = plugins.babelMinify;
plugins.HTML = plugins.html;
plugins.ExtractText = plugins.extractText;
plugins.AddAssetHTMLPlugin = require('add-asset-html-webpack-plugin');
plugins.OpenBrowser = plugins.openBrowser;
plugins.Favicon = require('favicons-webpack-plugin');
plugins.Imagemin = require('imagemin-webpack-plugin').default;
plugins.Offline = require('offline-plugin');
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */


// / region monkey patches
// Monkey-Patch html loader to retrieve html loader options since the
// "webpack-html-plugin" doesn't preserve the original loader interface.

require.cache[require.resolve('html-loader')].exports = function () {
    _clientnode2.default.extendObject(true, this.options, module, this.options);

    for (var _len = arguments.length, parameter = Array(_len), _key = 0; _key < _len; _key++) {
        parameter[_key] = arguments[_key];
    }

    return _htmlLoader2.default.call.apply(_htmlLoader2.default, [this].concat(parameter));
};
// Monkey-Patch loader-utils to define which url is a local request.

var loaderUtilsIsUrlRequestBackup = _loaderUtils2.default.isUrlRequest;
require.cache[require.resolve('loader-utils')].exports.isUrlRequest = function (url) {
    for (var _len2 = arguments.length, additionalParameter = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        additionalParameter[_key2 - 1] = arguments[_key2];
    }

    if (url.match(/^[a-z]+:.+/)) return false;
    return loaderUtilsIsUrlRequestBackup.apply(_loaderUtils2.default, [url].concat(additionalParameter));
};
// / endregion
// endregion
// region initialisation
// / region determine library name
var libraryName = void 0;
if ('libraryName' in _configurator2.default && _configurator2.default.libraryName) libraryName = _configurator2.default.libraryName;else if ((0, _keys2.default)(_configurator2.default.injection.internal.normalized).length > 1) libraryName = '[name]';else {
    libraryName = _configurator2.default.name;
    if (_configurator2.default.exportFormat.self === 'var') libraryName = _clientnode2.default.stringConvertToValidVariableName(libraryName);
}
// / endregion
// / region plugins
var pluginInstances = [new _webpack2.default.NoEmitOnErrorsPlugin(), new _webpack2.default.optimize.OccurrenceOrderPlugin(true)];
if (_configurator2.default.debug) pluginInstances.push(new _webpack2.default.NamedModulesPlugin());
// // region define modules to ignore
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = (0, _getIterator3.default)(_configurator2.default.injection.ignorePattern), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var ignorePattern = _step.value;

        pluginInstances.push(new _webpack2.default.IgnorePlugin(new RegExp(ignorePattern)));
    } // // endregion
    // // region define modules to replace
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

var _loop = function _loop(source) {
    if (_configurator2.default.module.replacements.normal.hasOwnProperty(source)) {
        var search = new RegExp(source);
        pluginInstances.push(new _webpack2.default.NormalModuleReplacementPlugin(search, function (resource) {
            resource.request = resource.request.replace(search, _configurator2.default.module.replacements.normal[source]);
        }));
    }
};

for (var source in _configurator2.default.module.replacements.normal) {
    _loop(source);
} // // endregion
// // region generate html file
var htmlAvailable = false;
if (_configurator2.default.givenCommandLineArguments[2] !== 'build:dll') {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(_configurator2.default.files.html), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var htmlConfiguration = _step2.value;

            if (_clientnode2.default.isFileSync(htmlConfiguration.template.filePath)) {
                pluginInstances.push(new plugins.HTML(_clientnode2.default.extendObject({}, htmlConfiguration, {
                    template: htmlConfiguration.template.request })));
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
if (htmlAvailable && _configurator2.default.favicon && _clientnode2.default.isFileSync(_configurator2.default.favicon.logo)) pluginInstances.push(new plugins.Favicon(_configurator2.default.favicon));
// // endregion
// // region provide offline functionality
if (htmlAvailable && _configurator2.default.offline) {
    if (!['serve', 'test:browser'].includes(_configurator2.default.givenCommandLineArguments[2])) {
        var _arr = [['cascadingStyleSheet', 'css'], ['javaScript', 'js']];

        for (var _i = 0; _i < _arr.length; _i++) {
            var type = _arr[_i];
            if (_configurator2.default.inPlace[type[0]]) {
                var matches = (0, _keys2.default)(_configurator2.default.inPlace[type[0]]);
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = (0, _getIterator3.default)(matches), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var name = _step3.value;

                        _configurator2.default.offline.excludes.push(_path3.default.relative(_configurator2.default.path.target.base, _configurator2.default.path.target.asset[type[0]]) + (name + '.' + type[1] + '?' + _configurator2.default.hashAlgorithm + '=*'));
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
            }
        }
    }pluginInstances.push(new plugins.Offline(_configurator2.default.offline));
}
// // endregion
// // region opens browser automatically
if (_configurator2.default.development.openBrowser && htmlAvailable && ['serve', 'test:browser'].includes(_configurator2.default.givenCommandLineArguments[2])) pluginInstances.push(new plugins.OpenBrowser(_configurator2.default.development.openBrowser));
// // endregion
// // region provide build environment
if (_configurator2.default.build.definitions) pluginInstances.push(new _webpack2.default.DefinePlugin(_configurator2.default.build.definitions));
if (_configurator2.default.module.provide) pluginInstances.push(new _webpack2.default.ProvidePlugin(_configurator2.default.module.provide));
// // endregion
// // region modules/assets
// /// region perform javaScript minification/optimisation
if (_configurator2.default.module.optimizer.babelMinify && _configurator2.default.module.optimizer.babelMinify.bundle) pluginInstances.push((0, _keys2.default)(_configurator2.default.module.optimizer.babelMinify.bundle).length ? new plugins.BabelMinify(_configurator2.default.module.optimizer.babelMinify.bundle.transform || {}, _configurator2.default.module.optimizer.babelMinify.bundle.plugin || {}) : new plugins.BabelMinify());
// /// endregion
// /// region apply module pattern
pluginInstances.push({ apply: function apply(compiler) {
        compiler.plugin('emit', function (compilation, callback) {
            for (var _request in compilation.assets) {
                if (compilation.assets.hasOwnProperty(_request)) {
                    var filePath = _request.replace(/\?[^?]+$/, '');
                    var _type = _helper2.default.determineAssetType(filePath, _configurator2.default.build.types, _configurator2.default.path);
                    if (_type && _configurator2.default.assetPattern[_type] && !new RegExp(_configurator2.default.assetPattern[_type].excludeFilePathRegularExpression).test(filePath)) {
                        var source = compilation.assets[_request].source();
                        if (typeof source === 'string') compilation.assets[_request] = new _webpackSources.RawSource(_configurator2.default.assetPattern[_type].pattern.replace(/\{1\}/g, source.replace(/\$/g, '$$$')));
                    }
                }
            }callback();
        });
    } });
// /// endregion
// /// region in-place configured assets in the main html file
if (htmlAvailable && !['serve', 'test:browser'].includes(_configurator2.default.givenCommandLineArguments[2])) pluginInstances.push({ apply: function apply(compiler) {
        var filePathsToRemove = [];
        compiler.plugin('compilation', function (compilation) {
            return compilation.plugin('html-webpack-plugin-after-html-processing', function (htmlPluginData, callback) {
                if (_configurator2.default.inPlace.cascadingStyleSheet && (0, _keys2.default)(_configurator2.default.inPlace.cascadingStyleSheet).length || _configurator2.default.inPlace.javaScript && (0, _keys2.default)(_configurator2.default.inPlace.javaScript).length) try {
                    var result = _helper2.default.inPlaceCSSAndJavaScriptAssetReferences(htmlPluginData.html, _configurator2.default.inPlace.cascadingStyleSheet, _configurator2.default.inPlace.javaScript, _configurator2.default.path.target.base, _configurator2.default.files.compose.cascadingStyleSheet, _configurator2.default.files.compose.javaScript, compilation.assets);
                    htmlPluginData.html = result.content;
                    filePathsToRemove.concat(result.filePathsToRemove);
                } catch (error) {
                    return callback(error, htmlPluginData);
                }
                callback(null, htmlPluginData);
            });
        });
        compiler.plugin('after-emit', function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(compilation, callback) {
                var promises, _loop2, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _path, _loop3, _arr2, _i2, _type2;

                return _regenerator2.default.wrap(function _callee$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                promises = [];
                                _loop2 = /*#__PURE__*/_regenerator2.default.mark(function _loop2(_path) {
                                    return _regenerator2.default.wrap(function _loop2$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    _context.next = 2;
                                                    return _clientnode2.default.isFile(_path);

                                                case 2:
                                                    if (!_context.sent) {
                                                        _context.next = 4;
                                                        break;
                                                    }

                                                    promises.push(new _promise2.default(function (resolve) {
                                                        return fileSystem.unlink(_path, function (error) {
                                                            if (error) console.error(error);
                                                            resolve();
                                                        });
                                                    }));

                                                case 4:
                                                case 'end':
                                                    return _context.stop();
                                            }
                                        }
                                    }, _loop2, undefined);
                                });
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context2.prev = 5;
                                _iterator4 = (0, _getIterator3.default)(filePathsToRemove);

                            case 7:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context2.next = 13;
                                    break;
                                }

                                _path = _step4.value;
                                return _context2.delegateYield(_loop2(_path), 't0', 10);

                            case 10:
                                _iteratorNormalCompletion4 = true;
                                _context2.next = 7;
                                break;

                            case 13:
                                _context2.next = 19;
                                break;

                            case 15:
                                _context2.prev = 15;
                                _context2.t1 = _context2['catch'](5);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context2.t1;

                            case 19:
                                _context2.prev = 19;
                                _context2.prev = 20;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 22:
                                _context2.prev = 22;

                                if (!_didIteratorError4) {
                                    _context2.next = 25;
                                    break;
                                }

                                throw _iteratorError4;

                            case 25:
                                return _context2.finish(22);

                            case 26:
                                return _context2.finish(19);

                            case 27:
                                _context2.next = 29;
                                return _promise2.default.all(promises);

                            case 29:
                                promises = [];

                                _loop3 = function _loop3(_type2) {
                                    promises.push(new _promise2.default(function (resolve, reject) {
                                        return fileSystem.readdir(_configurator2.default.path.target.asset[_type2], _configurator2.default.encoding, function (error, files) {
                                            if (error) {
                                                reject(error);
                                                return;
                                            }
                                            if (files.length === 0) fileSystem.rmdir(_configurator2.default.path.target.asset[_type2], function (error) {
                                                return error ? reject(error) : resolve();
                                            });else resolve();
                                        });
                                    }));
                                };

                                _arr2 = ['javaScript', 'cascadingStyleSheet'];
                                for (_i2 = 0; _i2 < _arr2.length; _i2++) {
                                    _type2 = _arr2[_i2];

                                    _loop3(_type2);
                                }_context2.next = 35;
                                return _promise2.default.all(promises);

                            case 35:
                                callback();

                            case 36:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee, undefined, [[5, 15, 19, 27], [20,, 22, 26]]);
            }));

            return function (_x, _x2) {
                return _ref.apply(this, arguments);
            };
        }());
    } });
// /// endregion
// /// region remove chunks if a corresponding dll package exists
if (_configurator2.default.givenCommandLineArguments[2] !== 'build:dll') for (var chunkName in _configurator2.default.injection.internal.normalized) {
    if (_configurator2.default.injection.internal.normalized.hasOwnProperty(chunkName)) {
        var manifestFilePath = _configurator2.default.path.target.base + '/' + chunkName + '.' + 'dll-manifest.json';
        if (_configurator2.default.dllManifestFilePaths.includes(manifestFilePath)) {
            delete _configurator2.default.injection.internal.normalized[chunkName];
            var filePath = _helper2.default.renderFilePathTemplate(_helper2.default.stripLoader(_configurator2.default.files.compose.javaScript), { '[name]': chunkName });
            pluginInstances.push(new plugins.AddAssetHTMLPlugin({
                filepath: filePath,
                hash: true,
                includeSourcemap: _clientnode2.default.isFileSync(filePath + '.map')
            }));
            pluginInstances.push(new _webpack2.default.DllReferencePlugin({
                context: _configurator2.default.path.context, manifest: require(manifestFilePath) }));
        }
    }
} // /// endregion
// /// region generate common chunks
if (_configurator2.default.givenCommandLineArguments[2] !== 'build:dll') {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = (0, _getIterator3.default)(_configurator2.default.injection.commonChunkIDs), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _chunkName = _step5.value;

            if (_configurator2.default.injection.internal.normalized.hasOwnProperty(_chunkName)) pluginInstances.push(new _webpack2.default.optimize.CommonsChunkPlugin({
                async: false,
                children: false,
                filename: _path3.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.javaScript),
                minChunks: Infinity,
                name: _chunkName,
                minSize: 0
            }));
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
} // /// endregion
// /// region mark empty javaScript modules as dummy
if (!_configurator2.default.needed.javaScript) _configurator2.default.files.compose.javaScript = _path3.default.resolve(_configurator2.default.path.target.asset.javaScript, '.__dummy__.compiled.js');
// /// endregion
// /// region extract cascading style sheets
if (_configurator2.default.files.compose.cascadingStyleSheet) pluginInstances.push(new plugins.ExtractText({
    allChunks: true, filename: _path3.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.cascadingStyleSheet)
}));
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
        if (request.startsWith('/')) request = _path3.default.relative(_configurator2.default.path.context, request);
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = (0, _getIterator3.default)(_configurator2.default.module.directoryNames.concat(_configurator2.default.loader.directoryNames)), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var _filePath = _step6.value;

                if (request.startsWith(_filePath)) {
                    request = request.substring(_filePath.length);
                    if (request.startsWith('/')) request = request.substring(1);
                    break;
                }
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

        var resolvedRequest = _helper2.default.determineExternalRequest(request, _configurator2.default.path.context, context, _configurator2.default.injection.internal.normalized, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
            return _path3.default.resolve(_configurator2.default.path.context, filePath);
        }).filter(function (filePath) {
            return !_configurator2.default.path.context.startsWith(filePath);
        }), _configurator2.default.module.aliases, _configurator2.default.module.replacements.normal, _configurator2.default.extensions, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore, _configurator2.default.module.directoryNames, _configurator2.default.package.main.fileNames, _configurator2.default.package.main.propertyNames, _configurator2.default.package.aliasPropertyNames, _configurator2.default.injection.external.implicit.pattern.include, _configurator2.default.injection.external.implicit.pattern.exclude, _configurator2.default.inPlace.externalLibrary.normal, _configurator2.default.inPlace.externalLibrary.dynamic, _configurator2.default.encoding);
        if (resolvedRequest) {
            if (['var', 'umd'].includes(_configurator2.default.exportFormat.external) && request in _configurator2.default.injection.external.aliases) resolvedRequest = _configurator2.default.injection.external.aliases[request];
            if (_configurator2.default.exportFormat.external === 'var') resolvedRequest = _clientnode2.default.stringConvertToValidVariableName(resolvedRequest, '0-9a-zA-Z_$\\.');
            return callback(null, resolvedRequest, _configurator2.default.exportFormat.external);
        }
        return callback();
    };
// /// endregion
// /// region build dll packages
if (_configurator2.default.givenCommandLineArguments[2] === 'build:dll') {
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
// // region apply final dom/javaScript/cascadingStyleSheet modifications/fixes
pluginInstances.push({ apply: function apply(compiler) {
        return compiler.plugin('compilation', function (compilation) {
            compilation.plugin('html-webpack-plugin-alter-asset-tags', function (htmlPluginData, callback) {
                var _arr3 = [htmlPluginData.body, htmlPluginData.head];

                for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
                    var tags = _arr3[_i3];
                    var _index = 0;
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = (0, _getIterator3.default)(tags), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var tag = _step8.value;

                            if (/^\.__dummy__(\..*)?$/.test(_path3.default.basename(tag.attributes.src || tag.attributes.href || ''))) tags.splice(_index, 1);
                            _index += 1;
                        }
                    } catch (err) {
                        _didIteratorError8 = true;
                        _iteratorError8 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                _iterator8.return();
                            }
                        } finally {
                            if (_didIteratorError8) {
                                throw _iteratorError8;
                            }
                        }
                    }
                }
                var assets = JSON.parse(htmlPluginData.plugin.assetJson);
                var index = 0;
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = (0, _getIterator3.default)(assets), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var assetRequest = _step7.value;

                        if (/^\.__dummy__(\..*)?$/.test(_path3.default.basename(assetRequest))) assets.splice(index, 1);
                        index += 1;
                    }
                } catch (err) {
                    _didIteratorError7 = true;
                    _iteratorError7 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }
                    } finally {
                        if (_didIteratorError7) {
                            throw _iteratorError7;
                        }
                    }
                }

                htmlPluginData.plugin.assetJson = (0, _stringify2.default)(assets);
                callback(null, htmlPluginData);
            });
            compilation.plugin('html-webpack-plugin-after-html-processing', function (htmlPluginData, callback) {
                /*
                    NOTE: We have to prevent creating native "style" dom nodes to
                    prevent jsdom from parsing the entire cascading style sheet.
                    Which is error prune and very resource intensive.
                */
                var styleContents = [];
                htmlPluginData.html = htmlPluginData.html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style[^>]*>)/gi, function (match, startTag, content, endTag) {
                    styleContents.push(content);
                    return '' + startTag + endTag;
                });
                var window = void 0;
                try {
                    /*
                        NOTE: We have to translate template delimiter to html
                        compatible sequences and translate it back later to avoid
                        unexpected escape sequences in resulting html.
                    */
                    window = new _jsdom.JSDOM(htmlPluginData.html.replace(/<%/g, '##+#+#+##').replace(/%>/g, '##-#-#-##')).window;
                } catch (error) {
                    return callback(error, htmlPluginData);
                }
                var linkables = {
                    link: 'href',
                    script: 'src'
                };
                for (var tagName in linkables) {
                    if (linkables.hasOwnProperty(tagName)) {
                        var _iteratorNormalCompletion9 = true;
                        var _didIteratorError9 = false;
                        var _iteratorError9 = undefined;

                        try {
                            for (var _iterator9 = (0, _getIterator3.default)(window.document.querySelectorAll(tagName + '[' + linkables[tagName] + '*="?' + (_configurator2.default.hashAlgorithm + '="]'))), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                var domNode = _step9.value;

                                /*
                                    NOTE: Removing symbols after a "&" in hash string
                                    is necessary to match the generated request strings
                                    in offline plugin.
                                */
                                domNode.setAttribute(linkables[tagName], domNode.getAttribute(linkables[tagName]).replace(new RegExp('(\\?' + _configurator2.default.hashAlgorithm + '=' + '[^&]+).*$'), '$1'));
                            }
                        } catch (err) {
                            _didIteratorError9 = true;
                            _iteratorError9 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                    _iterator9.return();
                                }
                            } finally {
                                if (_didIteratorError9) {
                                    throw _iteratorError9;
                                }
                            }
                        }
                    }
                } // NOTE: We have to restore template delimiter and style contents.
                htmlPluginData.html = htmlPluginData.html.replace(/^(\s*<!doctype [^>]+?>\s*)[\s\S]*$/i, '$1') + window.document.documentElement.outerHTML.replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>').replace(/(<style[^>]*>)[\s\S]*?(<\/style[^>]*>)/gi, function (match, startTag, endTag) {
                    return '' + startTag + styleContents.shift() + endTag;
                });
                // region post compilation
                var _iteratorNormalCompletion10 = true;
                var _didIteratorError10 = false;
                var _iteratorError10 = undefined;

                try {
                    for (var _iterator10 = (0, _getIterator3.default)(_configurator2.default.files.html), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                        var htmlFileSpecification = _step10.value;

                        if (htmlFileSpecification.filename === htmlPluginData.plugin.options.filename) {
                            var _iteratorNormalCompletion11 = true;
                            var _didIteratorError11 = false;
                            var _iteratorError11 = undefined;

                            try {
                                for (var _iterator11 = (0, _getIterator3.default)(htmlFileSpecification.template.use), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                    var loaderConfiguration = _step11.value;

                                    if (loaderConfiguration.hasOwnProperty('options') && loaderConfiguration.options.hasOwnProperty('compileSteps') && typeof loaderConfiguration.options.compileSteps === 'number') htmlPluginData.html = _ejsLoader2.default.bind(_clientnode2.default.extendObject(true, {}, {
                                        options: loaderConfiguration.options || {}
                                    }, { options: {
                                            compileSteps: htmlFileSpecification.template.postCompileSteps
                                        } }))(htmlPluginData.html);
                                }
                            } catch (err) {
                                _didIteratorError11 = true;
                                _iteratorError11 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                        _iterator11.return();
                                    }
                                } finally {
                                    if (_didIteratorError11) {
                                        throw _iteratorError11;
                                    }
                                }
                            }

                            break;
                        }
                    } // endregion
                } catch (err) {
                    _didIteratorError10 = true;
                    _iteratorError10 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                        }
                    } finally {
                        if (_didIteratorError10) {
                            throw _iteratorError10;
                        }
                    }
                }

                callback(null, htmlPluginData);
            });
        });
    } });
/*
    NOTE: The umd module export doesn't handle cases where the package name
    doesn't match exported library name. This post processing fixes this issue.
*/
if (_configurator2.default.exportFormat.external.startsWith('umd')) pluginInstances.push({ apply: function apply(compiler) {
        return compiler.plugin('emit', function (compilation, callback) {
            var bundleName = typeof libraryName === 'string' ? libraryName : libraryName[0];
            for (var assetRequest in compilation.assets) {
                if (compilation.assets.hasOwnProperty(assetRequest) && assetRequest.replace(/([^?]+)\?.*$/, '$1').endsWith(_configurator2.default.build.types.javaScript.outputExtension)) {
                    var source = compilation.assets[assetRequest].source();
                    if (typeof source === 'string') {
                        for (var replacement in _configurator2.default.injection.external.aliases) {
                            if (_configurator2.default.injection.external.aliases.hasOwnProperty(replacement)) source = source.replace(new RegExp('(require\\()["\']' + _clientnode2.default.stringEscapeRegularExpressions(_configurator2.default.injection.external.aliases[replacement]) + '["\'](\\))', 'g'), '$1\'' + replacement + '\'$2').replace(new RegExp('(define\\(["\']' + _clientnode2.default.stringEscapeRegularExpressions(bundleName) + '["\'], \\[.*)["\']' + _clientnode2.default.stringEscapeRegularExpressions(_configurator2.default.injection.external.aliases[replacement]) + '["\'](.*\\], factory\\);)'), '$1\'' + replacement + '\'$2');
                        }source = source.replace(new RegExp('(root\\[)["\']' + _clientnode2.default.stringEscapeRegularExpressions(bundleName) + '["\'](\\] = )'), '$1\'' + _clientnode2.default.stringConvertToValidVariableName(bundleName) + '\'$2');
                        compilation.assets[assetRequest] = new _webpackSources.RawSource(source);
                    }
                }
            }callback();
        });
    } });
// // endregion
// // region add automatic image compression
// NOTE: This plugin should be loaded at last to ensure that all emitted images
// ran through.
pluginInstances.push(new plugins.Imagemin(_configurator2.default.module.optimizer.image.content));
// // endregion
// // region context replacements
var _iteratorNormalCompletion12 = true;
var _didIteratorError12 = false;
var _iteratorError12 = undefined;

try {
    for (var _iterator12 = (0, _getIterator3.default)(_configurator2.default.module.replacements.context), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
        var contextReplacement = _step12.value;

        pluginInstances.push(new (Function.prototype.bind.apply(_webpack2.default.ContextReplacementPlugin, [null].concat((0, _toConsumableArray3.default)(contextReplacement.map(function (value) {
            return new Function('configuration', '__dirname', '__filename', 'return ' + value
            // IgnoreTypeCheck
            )(_configurator2.default, __dirname, __filename);
        })))))());
    } // // endregion
    // / endregion
    // / region loader helper
} catch (err) {
    _didIteratorError12 = true;
    _iteratorError12 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion12 && _iterator12.return) {
            _iterator12.return();
        }
    } finally {
        if (_didIteratorError12) {
            throw _iteratorError12;
        }
    }
}

var isFilePathInDependencies = function isFilePathInDependencies(filePath) {
    filePath = _helper2.default.stripLoader(filePath);
    return _helper2.default.isFilePathInLocation(filePath, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
        return _path3.default.resolve(_configurator2.default.path.context, filePath);
    }).filter(function (filePath) {
        return !_configurator2.default.path.context.startsWith(filePath);
    }));
};
var loader = {};
var scope = {
    configuration: _configurator2.default,
    loader: loader,
    isFilePathInDependencies: isFilePathInDependencies
};
var evaluate = function evaluate(code, filePath) {
    return new (Function.prototype.bind.apply(Function, [null].concat([
    // IgnoreTypeCheck
    'filePath'], (0, _toConsumableArray3.default)((0, _keys2.default)(scope)), ['return ' + code
    // IgnoreTypeCheck
    ])))().apply(undefined, [filePath].concat((0, _toConsumableArray3.default)((0, _values2.default)(scope))));
};
_clientnode2.default.extendObject(loader, {
    // Convert to compatible native web types.
    // region generic template
    ejs: {
        exclude: function exclude(filePath) {
            return _helper2.default.normalizePaths(_configurator2.default.files.html.concat(_configurator2.default.files.defaultHTML).map(function (htmlConfiguration) {
                return htmlConfiguration.template.filePath;
            })).includes(filePath) || (_configurator2.default.module.preprocessor.ejs.exclude === null ? false : evaluate(_configurator2.default.module.preprocessor.ejs.exclude, filePath));
        },
        include: _helper2.default.normalizePaths([_configurator2.default.path.source.base].concat(_configurator2.default.module.locations.directoryPaths)),
        test: /^(?!.+\.html\.ejs$).+\.ejs$/i,
        use: [{ loader: 'file?name=[path][name]' + (Boolean((_configurator2.default.module.preprocessor.ejs.options || {
                compileSteps: 2
            }).compileSteps % 2) ? '.js' : '') + ('?' + _configurator2.default.hashAlgorithm + '=[hash]') }, { loader: 'extract' }, {
            loader: _configurator2.default.module.preprocessor.ejs.loader,
            options: _configurator2.default.module.preprocessor.ejs.options || {}
        }].concat(_configurator2.default.module.preprocessor.ejs.additional.map(evaluate))
    },
    // endregion
    // region script
    script: {
        exclude: function exclude(filePath) {
            return _configurator2.default.module.preprocessor.javaScript.exclude === null ? isFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.preprocessor.javaScript.exclude, filePath);
        },
        include: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.javaScript].concat(_configurator2.default.module.locations.directoryPaths)),
        test: /\.js(?:\?.*)?$/i,
        use: [{
            loader: _configurator2.default.module.preprocessor.javaScript.loader,
            options: _configurator2.default.module.preprocessor.javaScript.options || {}
        }].concat(_configurator2.default.module.preprocessor.javaScript.additional.map(evaluate))
    },
    // endregion
    // region html template
    html: {
        // NOTE: This is only for the main entry template.
        main: {
            test: new RegExp('^' + _clientnode2.default.stringEscapeRegularExpressions(_configurator2.default.files.defaultHTML.template.filePath) + '(?:\\?.*)?$'),
            use: _configurator2.default.files.defaultHTML.template.use
        },
        ejs: {
            exclude: function exclude(filePath) {
                return _helper2.default.normalizePaths(_configurator2.default.files.html.concat(_configurator2.default.files.defaultHTML).map(function (htmlConfiguration) {
                    return htmlConfiguration.template.filePath;
                })).includes(filePath) || (_configurator2.default.module.preprocessor.html.exclude === null ? false : evaluate(_configurator2.default.module.preprocessor.html.exclude, filePath));
            },
            include: _configurator2.default.path.source.asset.template,
            test: /\.html\.ejs(?:\?.*)?$/i,
            use: [{ loader: 'file?name=' + _path3.default.join(_path3.default.relative(_configurator2.default.path.target.asset.base, _configurator2.default.path.target.asset.template), '[name]' + (Boolean((_configurator2.default.module.preprocessor.html.options || {
                    compileSteps: 2
                }).compileSteps % 2) ? '.js' : '') + ('?' + _configurator2.default.hashAlgorithm + '=[hash]')) }].concat(Boolean((_configurator2.default.module.preprocessor.html.options || {
                compileSteps: 2
            }).compileSteps % 2) ? [] : [{ loader: 'extract' }, {
                loader: _configurator2.default.module.html.loader,
                options: _configurator2.default.module.html.options || {}
            }], {
                loader: _configurator2.default.module.preprocessor.html.loader,
                options: _configurator2.default.module.preprocessor.html.options || {}
            }).concat(_configurator2.default.module.preprocessor.html.additional.map(evaluate))
        },
        html: {
            exclude: function exclude(filePath) {
                return _helper2.default.normalizePaths(_configurator2.default.files.html.concat(_configurator2.default.files.defaultHTML).map(function (htmlConfiguration) {
                    return htmlConfiguration.template.filePath;
                })).includes(filePath) || (_configurator2.default.module.html.exclude === null ? true : evaluate(_configurator2.default.module.html.exclude, filePath));
            },
            include: _configurator2.default.path.source.asset.template,
            test: /\.html(?:\?.*)?$/i,
            use: [{ loader: 'file?name=' + _path3.default.join(_path3.default.relative(_configurator2.default.path.target.base, _configurator2.default.path.target.asset.template), '[name].[ext]?' + _configurator2.default.hashAlgorithm + '=[hash]') }, { loader: 'extract' }, {
                loader: _configurator2.default.module.html.loader,
                options: _configurator2.default.module.html.options || {}
            }].concat(_configurator2.default.module.html.additional.map(evaluate))
        }
    },
    // endregion
    // Load dependencies.
    // region style
    style: {
        exclude: function exclude(filePath) {
            return _configurator2.default.module.cascadingStyleSheet.exclude === null ? isFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.cascadingStyleSheet.exclude, filePath);
        },
        include: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.cascadingStyleSheet].concat(_configurator2.default.module.locations.directoryPaths)),
        test: /\.s?css(?:\?.*)?$/i,
        use: [{
            loader: _configurator2.default.module.style.loader,
            options: _configurator2.default.module.style.options || {}
        }, {
            loader: _configurator2.default.module.cascadingStyleSheet.loader,
            options: _configurator2.default.module.cascadingStyleSheet.options || {}
        }, {
            loader: _configurator2.default.module.preprocessor.cascadingStyleSheet.loader,
            options: _clientnode2.default.extendObject(true, {
                ident: 'postcss',
                plugins: function plugins() {
                    return [(0, _postcssImport2.default)({
                        addDependencyTo: _webpack2.default,
                        root: _configurator2.default.path.context
                    }), (0, _postcssCssnext2.default)({ browsers: '> 0%' }),
                    /*
                        NOTE: Checking path doesn't work if fonts are
                        referenced in libraries provided in another
                        location than the project itself like the
                        "node_modules" folder.
                    */
                    (0, _postcssFontpath2.default)({ checkPath: false }), (0, _postcssUrl2.default)({ url: 'rebase' }), (0, _postcssSprites2.default)({
                        filterBy: function filterBy() {
                            return new _promise2.default(function (resolve, reject) {
                                return (_configurator2.default.files.compose.image ? resolve : reject)();
                            });
                        },
                        hooks: { onSaveSpritesheet: function onSaveSpritesheet(image) {
                                return _path3.default.join(image.spritePath, _path3.default.relative(_configurator2.default.path.target.asset.image, _configurator2.default.files.compose.image));
                            }
                        },
                        stylesheetPath: _configurator2.default.path.source.asset.cascadingStyleSheet,
                        spritePath: _configurator2.default.path.source.asset.image
                    })].concat(_configurator2.default.module.optimizer.cssnano ? (0, _cssnano2.default)() : []);
                }
            }, _configurator2.default.module.preprocessor.cascadingStyleSheet.options || {})
        }].concat(_configurator2.default.module.preprocessor.cascadingStyleSheet.additional.map(evaluate))
    },
    // endregion
    // Optimize loaded assets.
    // region font
    font: {
        eot: {
            exclude: function exclude(filePath) {
                return _configurator2.default.module.optimizer.font.eot.exclude === null ? false : evaluate(_configurator2.default.module.optimizer.font.eot.exclude, filePath);
            },
            include: _configurator2.default.path.base,
            test: /\.eot(?:\?.*)?$/i,
            use: [{
                loader: _configurator2.default.module.optimizer.font.eot.loader,
                options: _configurator2.default.module.optimizer.font.eot.options || {}
            }].concat(_configurator2.default.module.optimizer.font.eot.additional.map(evaluate))
        },
        svg: {
            exclude: function exclude(filePath) {
                return _configurator2.default.module.optimizer.font.svg.exclude === null ? false : evaluate(_configurator2.default.module.optimizer.font.svg.exclude, filePath);
            },
            include: _configurator2.default.path.base,
            test: /\.svg(?:\?.*)?$/i,
            use: [{
                loader: _configurator2.default.module.optimizer.font.svg.loader,
                options: _configurator2.default.module.optimizer.font.svg.options || {}
            }].concat(_configurator2.default.module.optimizer.font.svg.additional.map(evaluate))
        },
        ttf: {
            exclude: function exclude(filePath) {
                return _configurator2.default.module.optimizer.font.ttf.exclude === null ? false : evaluate(_configurator2.default.module.optimizer.font.ttf.exclude, filePath);
            },
            include: _configurator2.default.path.base,
            test: /\.ttf(?:\?.*)?$/i,
            use: [{
                loader: _configurator2.default.module.optimizer.font.ttf.loader,
                options: _configurator2.default.module.optimizer.font.ttf.options || {}
            }].concat(_configurator2.default.module.optimizer.font.ttf.additional.map(evaluate))
        },
        woff: {
            exclude: function exclude(filePath) {
                return _configurator2.default.module.optimizer.font.woff.exclude === null ? false : evaluate(_configurator2.default.module.optimizer.font.woff.exclude, filePath);
            },
            include: _configurator2.default.path.base,
            test: /\.woff2?(?:\?.*)?$/i,
            use: [{
                loader: _configurator2.default.module.optimizer.font.woff.loader,
                options: _configurator2.default.module.optimizer.font.woff.options || {}
            }].concat(_configurator2.default.module.optimizer.font.woff.additional.map(evaluate))
        }
    },
    // endregion
    // region image
    image: {
        exclude: function exclude(filePath) {
            return _configurator2.default.module.optimizer.image.exclude === null ? isFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.optimizer.image.exclude, filePath);
        },
        include: _configurator2.default.path.source.asset.image,
        test: /\.(?:png|jpg|ico|gif)(?:\?.*)?$/i,
        use: [{
            loader: _configurator2.default.module.optimizer.image.loader,
            options: _configurator2.default.module.optimizer.image.file || {}
        }].concat(_configurator2.default.module.optimizer.image.additional.map(evaluate))
    },
    // endregion
    // region data
    data: {
        exclude: function exclude(filePath) {
            return _configurator2.default.extensions.file.internal.includes(_path3.default.extname(_helper2.default.stripLoader(filePath))) || (_configurator2.default.module.optimizer.data.exclude === null ? isFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.optimizer.data.exclude, filePath));
        },
        include: _configurator2.default.path.source.asset.data,
        test: /.+/,
        use: [{
            loader: _configurator2.default.module.optimizer.data.loader,
            options: _configurator2.default.module.optimizer.data.options || {}
        }].concat(_configurator2.default.module.optimizer.data.additional.map(evaluate))
        // endregion
    } });
if (_configurator2.default.files.compose.cascadingStyleSheet) {
    loader.style.use.shift();
    loader.style.use = plugins.ExtractText.extract({ use: loader.style.use });
}
// / endregion
// endregion
var _iteratorNormalCompletion13 = true;
var _didIteratorError13 = false;
var _iteratorError13 = undefined;

try {
    for (var _iterator13 = (0, _getIterator3.default)(_configurator2.default.plugins), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
        var pluginConfiguration = _step13.value;

        pluginInstances.push(new (Function.prototype.bind.apply(eval('require')(pluginConfiguration.name.module)[pluginConfiguration.name.initializer], [null].concat((0, _toConsumableArray3.default)(pluginConfiguration.parameter))))());
    } // region configuration
} catch (err) {
    _didIteratorError13 = true;
    _iteratorError13 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion13 && _iterator13.return) {
            _iterator13.return();
        }
    } finally {
        if (_didIteratorError13) {
            throw _iteratorError13;
        }
    }
}

var webpackConfiguration = exports.webpackConfiguration = {
    bail: true,
    cache: _configurator2.default.cache.main,
    context: _configurator2.default.path.context,
    devtool: _configurator2.default.development.tool,
    devServer: _configurator2.default.development.server,
    // region input
    entry: _configurator2.default.injection.internal.normalized,
    externals: _configurator2.default.injection.external.modules,
    resolve: {
        alias: _configurator2.default.module.aliases,
        aliasFields: _configurator2.default.package.aliasPropertyNames,
        extensions: _configurator2.default.extensions.file.internal,
        mainFields: _configurator2.default.package.main.propertyNames,
        mainFiles: _configurator2.default.package.main.fileNames,
        moduleExtensions: _configurator2.default.extensions.module,
        modules: _helper2.default.normalizePaths(_configurator2.default.module.directoryNames),
        unsafeCache: _configurator2.default.cache.unsafe
    },
    resolveLoader: {
        alias: _configurator2.default.loader.aliases,
        aliasFields: _configurator2.default.package.aliasPropertyNames,
        extensions: _configurator2.default.loader.extensions.file,
        mainFields: _configurator2.default.package.main.propertyNames,
        mainFiles: _configurator2.default.package.main.fileNames,
        moduleExtensions: _configurator2.default.loader.extensions.module,
        modules: _configurator2.default.loader.directoryNames
    },
    // endregion
    // region output
    output: {
        filename: _path3.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.javaScript),
        hashFunction: _configurator2.default.hashAlgorithm,
        library: libraryName,
        libraryTarget: _configurator2.default.givenCommandLineArguments[2] === 'build:dll' ? 'var' : _configurator2.default.exportFormat.self,
        path: _configurator2.default.path.target.base,
        publicPath: _configurator2.default.path.target.public,
        pathinfo: _configurator2.default.debug,
        umdNamedDefine: true
    },
    performance: _configurator2.default.performanceHints,
    target: _configurator2.default.targetTechnology,
    // endregion
    module: {
        rules: _configurator2.default.module.additional.map(function (loaderConfiguration) {
            return {
                exclude: function exclude(filePath) {
                    return evaluate(loaderConfiguration.exclude || 'false', filePath);
                },
                include: loaderConfiguration.include && evaluate(loaderConfiguration.include, _configurator2.default.path.context) || _configurator2.default.path.source.base,
                test: new RegExp(evaluate(loaderConfiguration.test, _configurator2.default.path.context)),
                use: evaluate(loaderConfiguration.use)
            };
        }).concat([loader.ejs, loader.script, loader.html.main, loader.html.ejs, loader.html.html, loader.style, loader.font.eot, loader.font.svg, loader.font.ttf, loader.font.woff, loader.image, loader.data])
    },
    node: _configurator2.default.nodeEnvironment,
    plugins: pluginInstances
};
if (!Array.isArray(_configurator2.default.module.skipParseRegularExpressions) || _configurator2.default.module.skipParseRegularExpressions.length) webpackConfiguration.module.noParse = _configurator2.default.module.skipParseRegularExpressions;
if (_configurator2.default.showConfiguration) {
    console.info('Using internal configuration:', _util2.default.inspect(_configurator2.default, {
        depth: null }));
    console.info('-----------------------------------------------------------');
    console.info('Using webpack configuration:', _util2.default.inspect(webpackConfiguration, { depth: null }));
}
// endregion
exports.default = webpackConfiguration;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBOzs7O0FBSUE7Ozs7QUFDQTs7QUFDQTs7SUFBWSxVOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUtBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFXQTs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFLQTs7OztBQVFBOzs7Ozs7OztBQXRDQTtBQUNBLElBQUk7QUFDQSxZQUFRLDZCQUFSO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7QUFibEI7O0FBRkE7O0FBa0JBLElBQU0sVUFBVSxRQUFRLHNCQUFSLEdBQWhCOzs7QUFHQSxRQUFRLFdBQVIsR0FBc0IsUUFBUSxXQUE5QjtBQUNBLFFBQVEsSUFBUixHQUFlLFFBQVEsSUFBdkI7QUFDQSxRQUFRLFdBQVIsR0FBc0IsUUFBUSxXQUE5QjtBQUNBLFFBQVEsa0JBQVIsR0FBNkIsUUFBUSwrQkFBUixDQUE3QjtBQUNBLFFBQVEsV0FBUixHQUFzQixRQUFRLFdBQTlCO0FBQ0EsUUFBUSxPQUFSLEdBQWtCLFFBQVEseUJBQVIsQ0FBbEI7QUFDQSxRQUFRLFFBQVIsR0FBbUIsUUFBUSx5QkFBUixFQUFtQyxPQUF0RDtBQUNBLFFBQVEsT0FBUixHQUFrQixRQUFRLGdCQUFSLENBQWxCO0FBT0E7O0FBSkE7OztBQVFBO0FBQ0E7QUFDQTs7QUFFQSxRQUFRLEtBQVIsQ0FBYyxRQUFRLE9BQVIsQ0FBZ0IsYUFBaEIsQ0FBZCxFQUE4QyxPQUE5QyxHQUF3RCxZQUVsRDtBQUNGLHlCQUFNLFlBQU4sQ0FBbUIsSUFBbkIsRUFBeUIsS0FBSyxPQUE5QixFQUF1QyxNQUF2QyxFQUErQyxLQUFLLE9BQXBEOztBQURFLHNDQURDLFNBQ0Q7QUFEQyxpQkFDRDtBQUFB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QUFxQztBQUNqQyxZQUFRLElBQVIsQ0FBYSwrQkFBYixFQUE4QyxlQUFLLE9BQUwseUJBQTRCO0FBQ3RFLGVBQU8sSUFEK0QsRUFBNUIsQ0FBOUM7QUFFQSxZQUFRLElBQVIsQ0FBYSw2REFBYjtBQUNBLFlBQVEsSUFBUixDQUFhLDhCQUFiLEVBQTZDLGVBQUssT0FBTCxDQUN6QyxvQkFEeUMsRUFDbkIsRUFBQyxPQUFPLElBQVIsRUFEbUIsQ0FBN0M7QUFFSDtBQUNEO2tCQUNlLG9CO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoid2VicGFja0NvbmZpZ3VyYXRvci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCB0eXBlIHtEb21Ob2RlLCBQbGFpbk9iamVjdCwgUHJvY2VkdXJlRnVuY3Rpb24sIFdpbmRvd30gZnJvbSAnY2xpZW50bm9kZSdcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCBwb3N0Y3NzQ1NTbmFubyBmcm9tICdjc3NuYW5vJ1xuaW1wb3J0IHtKU0RPTSBhcyBET019IGZyb20gJ2pzZG9tJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcG9zdGNzc0NTU25leHQgZnJvbSAncG9zdGNzcy1jc3NuZXh0J1xuaW1wb3J0IHBvc3Rjc3NGb250UGF0aCBmcm9tICdwb3N0Y3NzLWZvbnRwYXRoJ1xuaW1wb3J0IHBvc3Rjc3NJbXBvcnQgZnJvbSAncG9zdGNzcy1pbXBvcnQnXG5pbXBvcnQgcG9zdGNzc1Nwcml0ZXMgZnJvbSAncG9zdGNzcy1zcHJpdGVzJ1xuaW1wb3J0IHBvc3Rjc3NVUkwgZnJvbSAncG9zdGNzcy11cmwnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCB3ZWJwYWNrIGZyb20gJ3dlYnBhY2snXG5jb25zdCBwbHVnaW5zID0gcmVxdWlyZSgnd2VicGFjay1sb2FkLXBsdWdpbnMnKSgpXG5pbXBvcnQge1Jhd1NvdXJjZSBhcyBXZWJwYWNrUmF3U291cmNlfSBmcm9tICd3ZWJwYWNrLXNvdXJjZXMnXG5cbnBsdWdpbnMuQmFiZWxNaW5pZnkgPSBwbHVnaW5zLmJhYmVsTWluaWZ5XG5wbHVnaW5zLkhUTUwgPSBwbHVnaW5zLmh0bWxcbnBsdWdpbnMuRXh0cmFjdFRleHQgPSBwbHVnaW5zLmV4dHJhY3RUZXh0XG5wbHVnaW5zLkFkZEFzc2V0SFRNTFBsdWdpbiA9IHJlcXVpcmUoJ2FkZC1hc3NldC1odG1sLXdlYnBhY2stcGx1Z2luJylcbnBsdWdpbnMuT3BlbkJyb3dzZXIgPSBwbHVnaW5zLm9wZW5Ccm93c2VyXG5wbHVnaW5zLkZhdmljb24gPSByZXF1aXJlKCdmYXZpY29ucy13ZWJwYWNrLXBsdWdpbicpXG5wbHVnaW5zLkltYWdlbWluID0gcmVxdWlyZSgnaW1hZ2VtaW4td2VicGFjay1wbHVnaW4nKS5kZWZhdWx0XG5wbHVnaW5zLk9mZmxpbmUgPSByZXF1aXJlKCdvZmZsaW5lLXBsdWdpbicpXG5cbmltcG9ydCBlanNMb2FkZXIgZnJvbSAnLi9lanNMb2FkZXIuY29tcGlsZWQnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IHR5cGUge1xuICAgIEhUTUxDb25maWd1cmF0aW9uLCBQbHVnaW5Db25maWd1cmF0aW9uLCBXZWJwYWNrQ29uZmlndXJhdGlvblxufSBmcm9tICcuL3R5cGUnXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG5cbi8vIC8gcmVnaW9uIG1vbmtleSBwYXRjaGVzXG4vLyBNb25rZXktUGF0Y2ggaHRtbCBsb2FkZXIgdG8gcmV0cmlldmUgaHRtbCBsb2FkZXIgb3B0aW9ucyBzaW5jZSB0aGVcbi8vIFwid2VicGFjay1odG1sLXBsdWdpblwiIGRvZXNuJ3QgcHJlc2VydmUgdGhlIG9yaWdpbmFsIGxvYWRlciBpbnRlcmZhY2UuXG5pbXBvcnQgaHRtbExvYWRlck1vZHVsZUJhY2t1cCBmcm9tICdodG1sLWxvYWRlcidcbnJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKCdodG1sLWxvYWRlcicpXS5leHBvcnRzID0gZnVuY3Rpb24oXG4gICAgLi4ucGFyYW1ldGVyOkFycmF5PGFueT5cbik6YW55IHtcbiAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwgdGhpcy5vcHRpb25zLCBtb2R1bGUsIHRoaXMub3B0aW9ucylcbiAgICByZXR1cm4gaHRtbExvYWRlck1vZHVsZUJhY2t1cC5jYWxsKHRoaXMsIC4uLnBhcmFtZXRlcilcbn1cbi8vIE1vbmtleS1QYXRjaCBsb2FkZXItdXRpbHMgdG8gZGVmaW5lIHdoaWNoIHVybCBpcyBhIGxvY2FsIHJlcXVlc3QuXG5pbXBvcnQgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAgZnJvbSAnbG9hZGVyLXV0aWxzJ1xuY29uc3QgbG9hZGVyVXRpbHNJc1VybFJlcXVlc3RCYWNrdXA6KHVybDpzdHJpbmcpID0+IGJvb2xlYW4gPVxuICAgIGxvYWRlclV0aWxzTW9kdWxlQmFja3VwLmlzVXJsUmVxdWVzdFxucmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2xvYWRlci11dGlscycpXS5leHBvcnRzLmlzVXJsUmVxdWVzdCA9IChcbiAgICB1cmw6c3RyaW5nLCAuLi5hZGRpdGlvbmFsUGFyYW1ldGVyOkFycmF5PGFueT5cbik6Ym9vbGVhbiA9PiB7XG4gICAgaWYgKHVybC5tYXRjaCgvXlthLXpdKzouKy8pKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gbG9hZGVyVXRpbHNJc1VybFJlcXVlc3RCYWNrdXAuYXBwbHkoXG4gICAgICAgIGxvYWRlclV0aWxzTW9kdWxlQmFja3VwLCBbdXJsXS5jb25jYXQoYWRkaXRpb25hbFBhcmFtZXRlcikpXG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gaW5pdGlhbGlzYXRpb25cbi8vIC8gcmVnaW9uIGRldGVybWluZSBsaWJyYXJ5IG5hbWVcbmxldCBsaWJyYXJ5TmFtZTpzdHJpbmdcbmlmICgnbGlicmFyeU5hbWUnIGluIGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5saWJyYXJ5TmFtZSlcbiAgICBsaWJyYXJ5TmFtZSA9IGNvbmZpZ3VyYXRpb24ubGlicmFyeU5hbWVcbmVsc2UgaWYgKE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpLmxlbmd0aCA+IDEpXG4gICAgbGlicmFyeU5hbWUgPSAnW25hbWVdJ1xuZWxzZSB7XG4gICAgbGlicmFyeU5hbWUgPSBjb25maWd1cmF0aW9uLm5hbWVcbiAgICBpZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuc2VsZiA9PT0gJ3ZhcicpXG4gICAgICAgIGxpYnJhcnlOYW1lID0gVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRWYXJpYWJsZU5hbWUobGlicmFyeU5hbWUpXG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gcGx1Z2luc1xuY29uc3QgcGx1Z2luSW5zdGFuY2VzOkFycmF5PE9iamVjdD4gPSBbXG4gICAgbmV3IHdlYnBhY2suTm9FbWl0T25FcnJvcnNQbHVnaW4oKSxcbiAgICBuZXcgd2VicGFjay5vcHRpbWl6ZS5PY2N1cnJlbmNlT3JkZXJQbHVnaW4odHJ1ZSlcbl1cbmlmIChjb25maWd1cmF0aW9uLmRlYnVnKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLk5hbWVkTW9kdWxlc1BsdWdpbigpKVxuLy8gLy8gcmVnaW9uIGRlZmluZSBtb2R1bGVzIHRvIGlnbm9yZVxuZm9yIChjb25zdCBpZ25vcmVQYXR0ZXJuOnN0cmluZyBvZiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pZ25vcmVQYXR0ZXJuKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLklnbm9yZVBsdWdpbihuZXcgUmVnRXhwKGlnbm9yZVBhdHRlcm4pKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGRlZmluZSBtb2R1bGVzIHRvIHJlcGxhY2VcbmZvciAoY29uc3Qgc291cmNlOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsKVxuICAgIGlmIChjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLmhhc093blByb3BlcnR5KHNvdXJjZSkpIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoOlJlZ0V4cCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Ob3JtYWxNb2R1bGVSZXBsYWNlbWVudFBsdWdpbihcbiAgICAgICAgICAgIHNlYXJjaCwgKHJlc291cmNlOntyZXF1ZXN0OnN0cmluZ30pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLnJlcXVlc3QgPSByZXNvdXJjZS5yZXF1ZXN0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaCwgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbFtzb3VyY2VdKVxuICAgICAgICAgICAgfSkpXG4gICAgfVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgaHRtbCBmaWxlXG5sZXQgaHRtbEF2YWlsYWJsZTpib29sZWFuID0gZmFsc2VcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gIT09ICdidWlsZDpkbGwnKVxuICAgIGZvciAobGV0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbClcbiAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5IVE1MKFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgICAgICB7fSwgaHRtbENvbmZpZ3VyYXRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3R9KSkpXG4gICAgICAgICAgICBodG1sQXZhaWxhYmxlID0gdHJ1ZVxuICAgICAgICB9XG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBnZW5lcmF0ZSBmYXZpY29uc1xuaWYgKGh0bWxBdmFpbGFibGUgJiYgY29uZmlndXJhdGlvbi5mYXZpY29uICYmIFRvb2xzLmlzRmlsZVN5bmMoXG4gICAgY29uZmlndXJhdGlvbi5mYXZpY29uLmxvZ29cbikpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuRmF2aWNvbihjb25maWd1cmF0aW9uLmZhdmljb24pKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gcHJvdmlkZSBvZmZsaW5lIGZ1bmN0aW9uYWxpdHlcbmlmIChodG1sQXZhaWxhYmxlICYmIGNvbmZpZ3VyYXRpb24ub2ZmbGluZSkge1xuICAgIGlmICghWydzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgKSlcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOlBsYWluT2JqZWN0IG9mIFtcbiAgICAgICAgICAgIFsnY2FzY2FkaW5nU3R5bGVTaGVldCcsICdjc3MnXSxcbiAgICAgICAgICAgIFsnamF2YVNjcmlwdCcsICdqcyddXG4gICAgICAgIF0pXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pblBsYWNlW3R5cGVbMF1dKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlczpBcnJheTxzdHJpbmc+ID0gT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZVt0eXBlWzBdXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWU6c3RyaW5nIG9mIG1hdGNoZXMpXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ub2ZmbGluZS5leGNsdWRlcy5wdXNoKHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVbMF1dXG4gICAgICAgICAgICAgICAgICAgICkgKyBgJHtuYW1lfS4ke3R5cGVbMV19PyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT0qYClcbiAgICAgICAgICAgIH1cbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PZmZsaW5lKGNvbmZpZ3VyYXRpb24ub2ZmbGluZSkpXG59XG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBvcGVucyBicm93c2VyIGF1dG9tYXRpY2FsbHlcbmlmIChjb25maWd1cmF0aW9uLmRldmVsb3BtZW50Lm9wZW5Ccm93c2VyICYmIChodG1sQXZhaWxhYmxlICYmIFtcbiAgICAnc2VydmUnLCAndGVzdDpicm93c2VyJ1xuXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PcGVuQnJvd3NlcihcbiAgICAgICAgY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5vcGVuQnJvd3NlcikpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBwcm92aWRlIGJ1aWxkIGVudmlyb25tZW50XG5pZiAoY29uZmlndXJhdGlvbi5idWlsZC5kZWZpbml0aW9ucylcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EZWZpbmVQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGQuZGVmaW5pdGlvbnMpKVxuaWYgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByb3ZpZGUpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suUHJvdmlkZVBsdWdpbihcbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJvdmlkZSkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBtb2R1bGVzL2Fzc2V0c1xuLy8gLy8vIHJlZ2lvbiBwZXJmb3JtIGphdmFTY3JpcHQgbWluaWZpY2F0aW9uL29wdGltaXNhdGlvblxuaWYgKFxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeSAmJlxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeS5idW5kbGVcbilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChPYmplY3Qua2V5cyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5LmJ1bmRsZVxuICAgICkubGVuZ3RoID9cbiAgICAgICAgbmV3IHBsdWdpbnMuQmFiZWxNaW5pZnkoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlLnRyYW5zZm9ybSB8fCB7fSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeS5idW5kbGUucGx1Z2luIHx8IHt9LFxuICAgICAgICApIDogbmV3IHBsdWdpbnMuQmFiZWxNaW5pZnkoKSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gYXBwbHkgbW9kdWxlIHBhdHRlcm5cbnBsdWdpbkluc3RhbmNlcy5wdXNoKHthcHBseTogKGNvbXBpbGVyOk9iamVjdCk6dm9pZCA9PiB7XG4gICAgY29tcGlsZXIucGx1Z2luKCdlbWl0JywgKFxuICAgICAgICBjb21waWxhdGlvbjpPYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgKTp2b2lkID0+IHtcbiAgICAgICAgZm9yIChjb25zdCByZXF1ZXN0OnN0cmluZyBpbiBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICBpZiAoY29tcGlsYXRpb24uYXNzZXRzLmhhc093blByb3BlcnR5KHJlcXVlc3QpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gcmVxdWVzdC5yZXBsYWNlKC9cXD9bXj9dKyQvLCAnJylcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwgY29uZmlndXJhdGlvbi5idWlsZC50eXBlcywgY29uZmlndXJhdGlvbi5wYXRoKVxuICAgICAgICAgICAgICAgIGlmICh0eXBlICYmIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdICYmICEobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIC5leGNsdWRlRmlsZVBhdGhSZWd1bGFyRXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICkpLnRlc3QoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZTo/c3RyaW5nID0gY29tcGlsYXRpb24uYXNzZXRzW3JlcXVlc3RdLnNvdXJjZSgpXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1tyZXF1ZXN0XSA9IG5ldyBXZWJwYWNrUmF3U291cmNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdLnBhdHRlcm4ucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgL1xcezFcXH0vZywgc291cmNlLnJlcGxhY2UoL1xcJC9nLCAnJCQkJykpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soKVxuICAgIH0pXG59fSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gaW4tcGxhY2UgY29uZmlndXJlZCBhc3NldHMgaW4gdGhlIG1haW4gaHRtbCBmaWxlXG5pZiAoaHRtbEF2YWlsYWJsZSAmJiAhWydzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbikpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoY29tcGlsZXI6T2JqZWN0KTp2b2lkID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbXBpbGVyLnBsdWdpbignY29tcGlsYXRpb24nLCAoY29tcGlsYXRpb246T2JqZWN0KTp2b2lkID0+XG4gICAgICAgICAgICBjb21waWxhdGlvbi5wbHVnaW4oXG4gICAgICAgICAgICAgICAgJ2h0bWwtd2VicGFjay1wbHVnaW4tYWZ0ZXItaHRtbC1wcm9jZXNzaW5nJywgKFxuICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YTpQbGFpbk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICkubGVuZ3RoIHx8IGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCkubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDpzdHJpbmcsIGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ID0gSGVscGVyLmluUGxhY2VDU1NBbmRKYXZhU2NyaXB0QXNzZXRSZWZlcmVuY2VzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sID0gcmVzdWx0LmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZS5jb25jYXQocmVzdWx0LmZpbGVQYXRoc1RvUmVtb3ZlKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBodG1sUGx1Z2luRGF0YSlcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgY29tcGlsZXIucGx1Z2luKCdhZnRlci1lbWl0JywgYXN5bmMgKFxuICAgICAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOlByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAgICAgbGV0IHByb21pc2VzOkFycmF5PFByb21pc2U8dm9pZD4+ID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgcGF0aDpzdHJpbmcgb2YgZmlsZVBhdGhzVG9SZW1vdmUpXG4gICAgICAgICAgICAgICAgaWYgKGF3YWl0IFRvb2xzLmlzRmlsZShwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZTpGdW5jdGlvbik6dm9pZCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmsocGF0aCwgKGVycm9yOj9FcnJvcik6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpKVxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgICBwcm9taXNlcyA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFsnamF2YVNjcmlwdCcsICdjYXNjYWRpbmdTdHlsZVNoZWV0J10pXG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IFdvcmthcm91bmQgc2luY2UgZmxvdyBtaXNzZXMgdGhlIHRocmVlIHBhcmFtZXRlclxuICAgICAgICAgICAgICAgICAgICBcInJlYWRkaXJcIiBzaWduYXR1cmUuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICApOnZvaWQgPT4gKGZpbGVTeXN0ZW0ucmVhZGRpcjpGdW5jdGlvbikoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmcsXG4gICAgICAgICAgICAgICAgICAgIChlcnJvcjo/RXJyb3IsIGZpbGVzOkFycmF5PHN0cmluZz4pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnJtZGlyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVdLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjo/RXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgICAgICAgICAgfSkpKVxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH0pXG4gICAgfX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHJlbW92ZSBjaHVua3MgaWYgYSBjb3JyZXNwb25kaW5nIGRsbCBwYWNrYWdlIGV4aXN0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkOmRsbCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hbmlmZXN0RmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9LyR7Y2h1bmtOYW1lfS5gICtcbiAgICAgICAgICAgICAgICBgZGxsLW1hbmlmZXN0Lmpzb25gXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBtYW5pZmVzdEZpbGVQYXRoXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICApLCB7J1tuYW1lXSc6IGNodW5rTmFtZX0pXG4gICAgICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZXBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlU291cmNlbWFwOiBUb29scy5pc0ZpbGVTeW5jKGAke2ZpbGVQYXRofS5tYXBgKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRsbFJlZmVyZW5jZVBsdWdpbih7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBtYW5pZmVzdDogcmVxdWlyZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0RmlsZVBhdGgpfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gZ2VuZXJhdGUgY29tbW9uIGNodW5rc1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkOmRsbCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmNvbW1vbkNodW5rSURzKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICApKVxuICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2sub3B0aW1pemUuQ29tbW9uc0NodW5rUGx1Z2luKHtcbiAgICAgICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICBtaW5DaHVua3M6IEluZmluaXR5LFxuICAgICAgICAgICAgICAgIG5hbWU6IGNodW5rTmFtZSxcbiAgICAgICAgICAgICAgICBtaW5TaXplOiAwXG4gICAgICAgICAgICB9KSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gbWFyayBlbXB0eSBqYXZhU2NyaXB0IG1vZHVsZXMgYXMgZHVtbXlcbmlmICghY29uZmlndXJhdGlvbi5uZWVkZWQuamF2YVNjcmlwdClcbiAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5qYXZhU2NyaXB0LCAnLl9fZHVtbXlfXy5jb21waWxlZC5qcycpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGV4dHJhY3QgY2FzY2FkaW5nIHN0eWxlIHNoZWV0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkV4dHJhY3RUZXh0KHtcbiAgICAgICAgYWxsQ2h1bmtzOiB0cnVlLCBmaWxlbmFtZTogcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KVxuICAgIH0pKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBwZXJmb3JtcyBpbXBsaWNpdCBleHRlcm5hbCBsb2dpY1xuaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMgPT09ICdfX2ltcGxpY2l0X18nKVxuICAgIC8qXG4gICAgICAgIFdlIG9ubHkgd2FudCB0byBwcm9jZXNzIG1vZHVsZXMgZnJvbSBsb2NhbCBjb250ZXh0IGluIGxpYnJhcnkgbW9kZSxcbiAgICAgICAgc2luY2UgYSBjb25jcmV0ZSBwcm9qZWN0IHVzaW5nIHRoaXMgbGlicmFyeSBzaG91bGQgY29tYmluZSBhbGwgYXNzZXRzXG4gICAgICAgIChhbmQgZGVkdXBsaWNhdGUgdGhlbSkgZm9yIG9wdGltYWwgYnVuZGxpbmcgcmVzdWx0cy4gTk9URTogT25seSBuYXRpdmVcbiAgICAgICAgamF2YVNjcmlwdCBhbmQganNvbiBtb2R1bGVzIHdpbGwgYmUgbWFya2VkIGFzIGV4dGVybmFsIGRlcGVuZGVuY3kuXG4gICAgKi9cbiAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzID0gKFxuICAgICAgICBjb250ZXh0OnN0cmluZywgcmVxdWVzdDpzdHJpbmcsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgKTp2b2lkID0+IHtcbiAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3QucmVwbGFjZSgvXiErLywgJycpXG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgIHJlcXVlc3QgPSBwYXRoLnJlbGF0aXZlKGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCByZXF1ZXN0KVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nIG9mXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcy5jb25jYXQoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXMpXG4gICAgICAgIClcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKGZpbGVQYXRoLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIGxldCByZXNvbHZlZFJlcXVlc3Q6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgICAgICByZXF1ZXN0LCBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgY29udGV4dCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGhcbiAgICAgICAgICAgICkpLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpXG4gICAgICAgICAgICApLCBjb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCwgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLCBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmltcGxpY2l0LnBhdHRlcm4uaW5jbHVkZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmltcGxpY2l0LnBhdHRlcm4uZXhjbHVkZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5leHRlcm5hbExpYnJhcnkubm9ybWFsLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmV4dGVybmFsTGlicmFyeS5keW5hbWljLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZylcbiAgICAgICAgaWYgKHJlc29sdmVkUmVxdWVzdCkge1xuICAgICAgICAgICAgaWYgKFsndmFyJywgJ3VtZCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsXG4gICAgICAgICAgICApICYmIHJlcXVlc3QgaW4gY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlcylcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QgPSBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0XVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsID09PSAndmFyJylcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QgPSBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCAnMC05YS16QS1aXyRcXFxcLicpXG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgbnVsbCwgcmVzb2x2ZWRSZXF1ZXN0LCBjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5leHRlcm5hbClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2soKVxuICAgIH1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gYnVpbGQgZGxsIHBhY2thZ2VzXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAnYnVpbGQ6ZGxsJykge1xuICAgIGxldCBkbGxDaHVua0lERXhpc3RzOmJvb2xlYW4gPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICApKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmRsbENodW5rSURzLmluY2x1ZGVzKGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgZGxsQ2h1bmtJREV4aXN0cyA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgaWYgKGRsbENodW5rSURFeGlzdHMpIHtcbiAgICAgICAgbGlicmFyeU5hbWUgPSAnW25hbWVdRExMUGFja2FnZSdcbiAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGxsUGx1Z2luKHtcbiAgICAgICAgICAgIHBhdGg6IGAke2NvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZX0vW25hbWVdLmRsbC1tYW5pZmVzdC5qc29uYCxcbiAgICAgICAgICAgIG5hbWU6IGxpYnJhcnlOYW1lXG4gICAgICAgIH0pKVxuICAgIH0gZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4oJ05vIGRsbCBjaHVuayBpZCBmb3VuZC4nKVxufVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gYXBwbHkgZmluYWwgZG9tL2phdmFTY3JpcHQvY2FzY2FkaW5nU3R5bGVTaGVldCBtb2RpZmljYXRpb25zL2ZpeGVzXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4gY29tcGlsZXIucGx1Z2luKFxuICAgICdjb21waWxhdGlvbicsIChjb21waWxhdGlvbjpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICBjb21waWxhdGlvbi5wbHVnaW4oJ2h0bWwtd2VicGFjay1wbHVnaW4tYWx0ZXItYXNzZXQtdGFncycsIChcbiAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhOlBsYWluT2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCB0YWdzOkFycmF5PFBsYWluT2JqZWN0PiBvZiBbXG4gICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEuYm9keSwgaHRtbFBsdWdpbkRhdGEuaGVhZFxuICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWc6UGxhaW5PYmplY3Qgb2YgdGFncykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoL15cXC5fX2R1bW15X18oXFwuLiopPyQvLnRlc3QocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5hdHRyaWJ1dGVzLnNyYyB8fCB0YWcuYXR0cmlidXRlcy5ocmVmIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFncy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBhc3NldHM6QXJyYXk8c3RyaW5nPiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEucGx1Z2luLmFzc2V0SnNvbilcbiAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0UmVxdWVzdDpzdHJpbmcgb2YgYXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKC9eXFwuX19kdW1teV9fKFxcLi4qKT8kLy50ZXN0KHBhdGguYmFzZW5hbWUoYXNzZXRSZXF1ZXN0KSkpXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEucGx1Z2luLmFzc2V0SnNvbiA9IEpTT04uc3RyaW5naWZ5KGFzc2V0cylcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICB9KVxuICAgICAgICBjb21waWxhdGlvbi5wbHVnaW4oJ2h0bWwtd2VicGFjay1wbHVnaW4tYWZ0ZXItaHRtbC1wcm9jZXNzaW5nJywgKFxuICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgICAgICk6V2luZG93ID0+IHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byBwcmV2ZW50IGNyZWF0aW5nIG5hdGl2ZSBcInN0eWxlXCIgZG9tIG5vZGVzIHRvXG4gICAgICAgICAgICAgICAgcHJldmVudCBqc2RvbSBmcm9tIHBhcnNpbmcgdGhlIGVudGlyZSBjYXNjYWRpbmcgc3R5bGUgc2hlZXQuXG4gICAgICAgICAgICAgICAgV2hpY2ggaXMgZXJyb3IgcHJ1bmUgYW5kIHZlcnkgcmVzb3VyY2UgaW50ZW5zaXZlLlxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IHN0eWxlQ29udGVudHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sID0gaHRtbFBsdWdpbkRhdGEuaHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIC8oPHN0eWxlW14+XSo+KShbXFxzXFxTXSo/KSg8XFwvc3R5bGVbXj5dKj4pL2dpLCAoXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgICAgICk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGVDb250ZW50cy5wdXNoKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtzdGFydFRhZ30ke2VuZFRhZ31gXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGxldCB3aW5kb3c6V2luZG93XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gdHJhbnNsYXRlIHRlbXBsYXRlIGRlbGltaXRlciB0byBodG1sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBhdGlibGUgc2VxdWVuY2VzIGFuZCB0cmFuc2xhdGUgaXQgYmFjayBsYXRlciB0byBhdm9pZFxuICAgICAgICAgICAgICAgICAgICB1bmV4cGVjdGVkIGVzY2FwZSBzZXF1ZW5jZXMgaW4gcmVzdWx0aW5nIGh0bWwuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB3aW5kb3cgPSAobmV3IERPTShcbiAgICAgICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEuaHRtbFxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwlL2csICcjIysjKyMrIyMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyU+L2csICcjIy0jLSMtIyMnKVxuICAgICAgICAgICAgICAgICkpLndpbmRvd1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbGlua2FibGVzOntba2V5OnN0cmluZ106c3RyaW5nfSA9IHtcbiAgICAgICAgICAgICAgICBsaW5rOiAnaHJlZicsXG4gICAgICAgICAgICAgICAgc2NyaXB0OiAnc3JjJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCB0YWdOYW1lOnN0cmluZyBpbiBsaW5rYWJsZXMpXG4gICAgICAgICAgICAgICAgaWYgKGxpbmthYmxlcy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGFnTmFtZX1bJHtsaW5rYWJsZXNbdGFnTmFtZV19Kj1cIj9gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVwiXWApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogUmVtb3Zpbmcgc3ltYm9scyBhZnRlciBhIFwiJlwiIGluIGhhc2ggc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgbmVjZXNzYXJ5IHRvIG1hdGNoIHRoZSBnZW5lcmF0ZWQgcmVxdWVzdCBzdHJpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gb2ZmbGluZSBwbHVnaW4uXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2FibGVzW3RhZ05hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuZ2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZXNbdGFnTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYChcXFxcPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1teJl0rKS4qJCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCAnJDEnKSlcbiAgICAgICAgICAgIC8vIE5PVEU6IFdlIGhhdmUgdG8gcmVzdG9yZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgYW5kIHN0eWxlIGNvbnRlbnRzLlxuICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEuaHRtbCA9IGh0bWxQbHVnaW5EYXRhLmh0bWxcbiAgICAgICAgICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgL14oXFxzKjwhZG9jdHlwZSBbXj5dKz8+XFxzKilbXFxzXFxTXSokL2ksICckMSdcbiAgICAgICAgICAgICAgICApICsgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUxcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyMjXFwrI1xcKyNcXCsjIy9nLCAnPCUnKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyMtIy0jLSMjL2csICclPicpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPHN0eWxlW14+XSo+KVtcXHNcXFNdKj8oPFxcL3N0eWxlW14+XSo+KS9naSwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICApOnN0cmluZyA9PiBgJHtzdGFydFRhZ30ke3N0eWxlQ29udGVudHMuc2hpZnQoKX0ke2VuZFRhZ31gKVxuICAgICAgICAgICAgLy8gcmVnaW9uIHBvc3QgY29tcGlsYXRpb25cbiAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbEZpbGVTcGVjaWZpY2F0aW9uOlBsYWluT2JqZWN0IG9mXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBodG1sRmlsZVNwZWNpZmljYXRpb24uZmlsZW5hbWUgPT09XG4gICAgICAgICAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLnBsdWdpbi5vcHRpb25zLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZXJDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0IG9mXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sRmlsZVNwZWNpZmljYXRpb24udGVtcGxhdGUudXNlXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KCdvcHRpb25zJykgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb21waWxlU3RlcHMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBsb2FkZXJDb25maWd1cmF0aW9uLm9wdGlvbnMuY29tcGlsZVN0ZXBzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID09PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLmh0bWwgPSBlanNMb2FkZXIuYmluZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2FkZXJDb25maWd1cmF0aW9uLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge29wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogaHRtbEZpbGVTcGVjaWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRlbXBsYXRlLnBvc3RDb21waWxlU3RlcHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0pKShodG1sUGx1Z2luRGF0YS5odG1sKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgaHRtbFBsdWdpbkRhdGEpXG4gICAgICAgIH0pXG4gICAgfSl9KVxuLypcbiAgICBOT1RFOiBUaGUgdW1kIG1vZHVsZSBleHBvcnQgZG9lc24ndCBoYW5kbGUgY2FzZXMgd2hlcmUgdGhlIHBhY2thZ2UgbmFtZVxuICAgIGRvZXNuJ3QgbWF0Y2ggZXhwb3J0ZWQgbGlicmFyeSBuYW1lLiBUaGlzIHBvc3QgcHJvY2Vzc2luZyBmaXhlcyB0aGlzIGlzc3VlLlxuKi9cbmlmIChjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5leHRlcm5hbC5zdGFydHNXaXRoKCd1bWQnKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4gY29tcGlsZXIucGx1Z2luKFxuICAgICAgICAnZW1pdCcsIChjb21waWxhdGlvbjpPYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1bmRsZU5hbWU6c3RyaW5nID0gKFxuICAgICAgICAgICAgICAgIHR5cGVvZiBsaWJyYXJ5TmFtZSA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICkgPyBsaWJyYXJ5TmFtZSA6IGxpYnJhcnlOYW1lWzBdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0UmVxdWVzdDpzdHJpbmcgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzLmhhc093blByb3BlcnR5KGFzc2V0UmVxdWVzdCkgJiZcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRSZXF1ZXN0LnJlcGxhY2UoLyhbXj9dKylcXD8uKiQvLCAnJDEnKS5lbmRzV2l0aChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMuamF2YVNjcmlwdC5vdXRwdXRFeHRlbnNpb24pXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzb3VyY2U6c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1thc3NldFJlcXVlc3RdLnNvdXJjZSgpXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudDpzdHJpbmcgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhhc093blByb3BlcnR5KHJlcGxhY2VtZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcocmVxdWlyZVxcXFwoKVtcIlxcJ10nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNlc1tyZXBsYWNlbWVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnW1wiXFwnXShcXFxcKSknLCAnZydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgYCQxJyR7cmVwbGFjZW1lbnR9JyQyYCkucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoJyhkZWZpbmVcXFxcKFtcIlxcJ10nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1tcIlxcJ10sIFxcXFxbLiopW1wiXFwnXScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hbGlhc2VzW3JlcGxhY2VtZW50XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnW1wiXFwnXSguKlxcXFxdLCBmYWN0b3J5XFxcXCk7KSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIGAkMScke3JlcGxhY2VtZW50fSckMmApXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcocm9vdFxcXFxbKVtcIlxcJ10nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1tcIlxcJ10oXFxcXF0gPSApJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSwgYCQxJ2AgKyBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidW5kbGVOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICApICsgYCckMmApXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbYXNzZXRSZXF1ZXN0XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFdlYnBhY2tSYXdTb3VyY2Uoc291cmNlKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICB9KX0pXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBhZGQgYXV0b21hdGljIGltYWdlIGNvbXByZXNzaW9uXG4vLyBOT1RFOiBUaGlzIHBsdWdpbiBzaG91bGQgYmUgbG9hZGVkIGF0IGxhc3QgdG8gZW5zdXJlIHRoYXQgYWxsIGVtaXR0ZWQgaW1hZ2VzXG4vLyByYW4gdGhyb3VnaC5cbnBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkltYWdlbWluKFxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5jb250ZW50KSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGNvbnRleHQgcmVwbGFjZW1lbnRzXG5mb3IgKFxuICAgIGNvbnN0IGNvbnRleHRSZXBsYWNlbWVudDpBcnJheTxzdHJpbmc+IG9mXG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLmNvbnRleHRcbilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Db250ZXh0UmVwbGFjZW1lbnRQbHVnaW4oXG4gICAgICAgIC4uLmNvbnRleHRSZXBsYWNlbWVudC5tYXAoKHZhbHVlOnN0cmluZyk6YW55ID0+IChuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAnY29uZmlndXJhdGlvbicsICdfX2Rpcm5hbWUnLCAnX19maWxlbmFtZScsIGByZXR1cm4gJHt2YWx1ZX1gXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICApKShjb25maWd1cmF0aW9uLCBfX2Rpcm5hbWUsIF9fZmlsZW5hbWUpKSkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBsb2FkZXIgaGVscGVyXG5jb25zdCBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXM6RnVuY3Rpb24gPSAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IHtcbiAgICBmaWxlUGF0aCA9IEhlbHBlci5zdHJpcExvYWRlcihmaWxlUGF0aClcbiAgICByZXR1cm4gSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICBmaWxlUGF0aCwgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpXG59XG5jb25zdCBsb2FkZXI6T2JqZWN0ID0ge31cbmNvbnN0IHNjb3BlOk9iamVjdCA9IHtcbiAgICBjb25maWd1cmF0aW9uLFxuICAgIGxvYWRlcixcbiAgICBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXNcbn1cbmNvbnN0IGV2YWx1YXRlOkZ1bmN0aW9uID0gKGNvZGU6c3RyaW5nLCBmaWxlUGF0aDpzdHJpbmcpOmFueSA9PiAobmV3IEZ1bmN0aW9uKFxuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICdmaWxlUGF0aCcsIC4uLk9iamVjdC5rZXlzKHNjb3BlKSwgYHJldHVybiAke2NvZGV9YFxuLy8gSWdub3JlVHlwZUNoZWNrXG4pKShmaWxlUGF0aCwgLi4uT2JqZWN0LnZhbHVlcyhzY29wZSkpXG5Ub29scy5leHRlbmRPYmplY3QobG9hZGVyLCB7XG4gICAgLy8gQ29udmVydCB0byBjb21wYXRpYmxlIG5hdGl2ZSB3ZWIgdHlwZXMuXG4gICAgLy8gcmVnaW9uIGdlbmVyaWMgdGVtcGxhdGVcbiAgICBlanM6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgICkuaW5jbHVkZXMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuZXhjbHVkZSA9PT0gbnVsbCkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuZXhjbHVkZSwgZmlsZVBhdGgpKSxcbiAgICAgICAgaW5jbHVkZTogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYmFzZVxuICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHMpKSxcbiAgICAgICAgdGVzdDogL14oPyEuK1xcLmh0bWxcXC5lanMkKS4rXFwuZWpzJC9pLFxuICAgICAgICB1c2U6IFtcbiAgICAgICAgICAgIHtsb2FkZXI6ICdmaWxlP25hbWU9W3BhdGhdW25hbWVdJyArIChCb29sZWFuKFxuICAgICAgICAgICAgICAgIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLm9wdGlvbnMgfHwge1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgICAgICB9KS5jb21waWxlU3RlcHMgJSAyXG4gICAgICAgICAgICApID8gJy5qcycgOiAnJykgKyBgPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gfSxcbiAgICAgICAgICAgIHtsb2FkZXI6ICdleHRyYWN0J30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBzY3JpcHRcbiAgICBzY3JpcHQ6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5leGNsdWRlID09PSBudWxsXG4gICAgICAgICkgPyBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmV4Y2x1ZGUsIGZpbGVQYXRoXG4gICAgICAgICAgICApLFxuICAgICAgICBpbmNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoW1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5qYXZhU2NyaXB0XG4gICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucy5kaXJlY3RvcnlQYXRocykpLFxuICAgICAgICB0ZXN0OiAvXFwuanMoPzpcXD8uKik/JC9pLFxuICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmxvYWRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0Lm9wdGlvbnMgfHwge31cbiAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGh0bWwgdGVtcGxhdGVcbiAgICBodG1sOiB7XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgb25seSBmb3IgdGhlIG1haW4gZW50cnkgdGVtcGxhdGUuXG4gICAgICAgIG1haW46IHtcbiAgICAgICAgICAgIHRlc3Q6IG5ldyBSZWdFeHAoJ14nICsgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUuZmlsZVBhdGhcbiAgICAgICAgICAgICkgKyAnKD86XFxcXD8uKik/JCcpLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLnVzZVxuICAgICAgICB9LFxuICAgICAgICBlanM6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbC5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAgICAgICAgICAgICApLm1hcCgoaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24pOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aClcbiAgICAgICAgICAgICkuaW5jbHVkZXMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAgICAgKChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5leGNsdWRlID09PSBudWxsKSA/XG4gICAgICAgICAgICAgICAgICAgIGZhbHNlIDogZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5leGNsdWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgpKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQudGVtcGxhdGUsXG4gICAgICAgICAgICB0ZXN0OiAvXFwuaHRtbFxcLmVqcyg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IFtcbiAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZmlsZT9uYW1lPScgKyBwYXRoLmpvaW4ocGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LnRlbXBsYXRlXG4gICAgICAgICAgICAgICAgKSwgJ1tuYW1lXScgKyAoQm9vbGVhbihcbiAgICAgICAgICAgICAgICAgICAgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLm9wdGlvbnMgfHwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZVN0ZXBzOiAyXG4gICAgICAgICAgICAgICAgICAgIH0pLmNvbXBpbGVTdGVwcyAlIDJcbiAgICAgICAgICAgICAgICApID8gJy5qcycgOiAnJykgKyBgPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gKX1cbiAgICAgICAgICAgIF0uY29uY2F0KChCb29sZWFuKChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZVN0ZXBzOiAyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKS5jb21waWxlU3RlcHMgJSAyKSA/IFtdIDpcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIHtsb2FkZXI6ICdleHRyYWN0J30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICksIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9KS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9LFxuICAgICAgICBodG1sOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgICAgICApLmluY2x1ZGVzKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgICAgICgoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5leGNsdWRlID09PSBudWxsKSA/IHRydWUgOlxuICAgICAgICAgICAgICAgICAgICBldmFsdWF0ZShjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmV4Y2x1ZGUsIGZpbGVQYXRoKSksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LnRlbXBsYXRlLFxuICAgICAgICAgICAgdGVzdDogL1xcLmh0bWwoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbXG4gICAgICAgICAgICAgICAge2xvYWRlcjogJ2ZpbGU/bmFtZT0nICsgcGF0aC5qb2luKHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICksIGBbbmFtZV0uW2V4dF0/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVtoYXNoXWApfSxcbiAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5hZGRpdGlvbmFsLm1hcChldmFsdWF0ZSkpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIExvYWQgZGVwZW5kZW5jaWVzLlxuICAgIC8vIHJlZ2lvbiBzdHlsZVxuICAgIHN0eWxlOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5leGNsdWRlID09PSBudWxsXG4gICAgICAgICkgPyBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICBpbmNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoW1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucy5kaXJlY3RvcnlQYXRocykpLFxuICAgICAgICB0ZXN0OiAvXFwucz9jc3MoPzpcXD8uKik/JC9pLFxuICAgICAgICB1c2U6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnN0eWxlLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5zdHlsZS5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICAgICAgLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge1xuICAgICAgICAgICAgICAgICAgICBpZGVudDogJ3Bvc3Rjc3MnLFxuICAgICAgICAgICAgICAgICAgICBwbHVnaW5zOiAoKTpBcnJheTxPYmplY3Q+ID0+IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NJbXBvcnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZERlcGVuZGVuY3lUbzogd2VicGFjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzQ1NTbmV4dCh7YnJvd3NlcnM6ICc+IDAlJ30pLFxuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBDaGVja2luZyBwYXRoIGRvZXNuJ3Qgd29yayBpZiBmb250cyBhcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VkIGluIGxpYnJhcmllcyBwcm92aWRlZCBpbiBhbm90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gdGhhbiB0aGUgcHJvamVjdCBpdHNlbGYgbGlrZSB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5vZGVfbW9kdWxlc1wiIGZvbGRlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzRm9udFBhdGgoe2NoZWNrUGF0aDogZmFsc2V9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NVUkwoe3VybDogJ3JlYmFzZSd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NTcHJpdGVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJCeTogKCk6UHJvbWlzZTxudWxsPiA9PiBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6UHJvbWlzZTxudWxsPiA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5pbWFnZSA/IHJlc29sdmUgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvb2tzOiB7b25TYXZlU3ByaXRlc2hlZXQ6IChpbWFnZTpPYmplY3QpOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4oaW1hZ2Uuc3ByaXRlUGF0aCwgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQuaW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuaW1hZ2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzaGVldFBhdGg6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5pbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuY3NzbmFubyA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0NTU25hbm8oKSA6IFtdKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICAgICAgLm9wdGlvbnMgfHwge30pXG4gICAgICAgICAgICB9XG4gICAgICAgIF0uY29uY2F0KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXQuYWRkaXRpb25hbFxuICAgICAgICAgICAgICAgIC5tYXAoZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gT3B0aW1pemUgbG9hZGVkIGFzc2V0cy5cbiAgICAvLyByZWdpb24gZm9udFxuICAgIGZvbnQ6IHtcbiAgICAgICAgZW90OiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlLFxuICAgICAgICAgICAgdGVzdDogL1xcLmVvdCg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgc3ZnOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlLFxuICAgICAgICAgICAgdGVzdDogL1xcLnN2Zyg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgdHRmOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlLFxuICAgICAgICAgICAgdGVzdDogL1xcLnR0Zig/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgd29mZjoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmV4Y2x1ZGUsIGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5iYXNlLFxuICAgICAgICAgICAgdGVzdDogL1xcLndvZmYyPyg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH1dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGltYWdlXG4gICAgaW1hZ2U6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICApID8gaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICBldmFsdWF0ZShjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmltYWdlLFxuICAgICAgICB0ZXN0OiAvXFwuKD86cG5nfGpwZ3xpY298Z2lmKSg/OlxcPy4qKT8kL2ksXG4gICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmxvYWRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5maWxlIHx8IHt9XG4gICAgICAgIH1dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZGF0YVxuICAgIGRhdGE6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW50ZXJuYWwuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKEhlbHBlci5zdHJpcExvYWRlcihmaWxlUGF0aCkpXG4gICAgICAgICAgICApIHx8ICgoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmRhdGEsXG4gICAgICAgIHRlc3Q6IC8uKy8sXG4gICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEubG9hZGVyLFxuICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEub3B0aW9ucyB8fCB7fVxuICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuYWRkaXRpb25hbC5tYXAoZXZhbHVhdGUpKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbn0pXG5pZiAoY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQpIHtcbiAgICBsb2FkZXIuc3R5bGUudXNlLnNoaWZ0KClcbiAgICBsb2FkZXIuc3R5bGUudXNlID0gcGx1Z2lucy5FeHRyYWN0VGV4dC5leHRyYWN0KHt1c2U6IGxvYWRlci5zdHlsZS51c2V9KVxufVxuLy8gLyBlbmRyZWdpb25cbi8vIGVuZHJlZ2lvblxuZm9yIChjb25zdCBwbHVnaW5Db25maWd1cmF0aW9uOlBsdWdpbkNvbmZpZ3VyYXRpb24gb2YgY29uZmlndXJhdGlvbi5wbHVnaW5zKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyAoZXZhbCgncmVxdWlyZScpKHBsdWdpbkNvbmZpZ3VyYXRpb24ubmFtZS5tb2R1bGUpW1xuICAgICAgICBwbHVnaW5Db25maWd1cmF0aW9uLm5hbWUuaW5pdGlhbGl6ZXJcbiAgICBdKSguLi5wbHVnaW5Db25maWd1cmF0aW9uLnBhcmFtZXRlcikpXG4vLyByZWdpb24gY29uZmlndXJhdGlvblxuZXhwb3J0IGNvbnN0IHdlYnBhY2tDb25maWd1cmF0aW9uOldlYnBhY2tDb25maWd1cmF0aW9uID0ge1xuICAgIGJhaWw6IHRydWUsXG4gICAgY2FjaGU6IGNvbmZpZ3VyYXRpb24uY2FjaGUubWFpbixcbiAgICBjb250ZXh0OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICBkZXZ0b29sOiBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50LnRvb2wsXG4gICAgZGV2U2VydmVyOiBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50LnNlcnZlcixcbiAgICAvLyByZWdpb24gaW5wdXRcbiAgICBlbnRyeTogY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCxcbiAgICBleHRlcm5hbHM6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMsXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczogY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgYWxpYXNGaWVsZHM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLFxuICAgICAgICBtYWluRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICBtYWluRmlsZXM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgbW9kdWxlRXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLm1vZHVsZSxcbiAgICAgICAgbW9kdWxlczogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzKSxcbiAgICAgICAgdW5zYWZlQ2FjaGU6IGNvbmZpZ3VyYXRpb24uY2FjaGUudW5zYWZlXG4gICAgfSxcbiAgICByZXNvbHZlTG9hZGVyOiB7XG4gICAgICAgIGFsaWFzOiBjb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzLFxuICAgICAgICBhbGlhc0ZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgZXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5sb2FkZXIuZXh0ZW5zaW9ucy5maWxlLFxuICAgICAgICBtYWluRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICBtYWluRmlsZXM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgbW9kdWxlRXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5sb2FkZXIuZXh0ZW5zaW9ucy5tb2R1bGUsXG4gICAgICAgIG1vZHVsZXM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gb3V0cHV0XG4gICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQpLFxuICAgICAgICBoYXNoRnVuY3Rpb246IGNvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobSxcbiAgICAgICAgbGlicmFyeTogbGlicmFyeU5hbWUsXG4gICAgICAgIGxpYnJhcnlUYXJnZXQ6IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ2J1aWxkOmRsbCdcbiAgICAgICAgKSA/ICd2YXInIDogY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuc2VsZixcbiAgICAgICAgcGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICBwdWJsaWNQYXRoOiBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LnB1YmxpYyxcbiAgICAgICAgcGF0aGluZm86IGNvbmZpZ3VyYXRpb24uZGVidWcsXG4gICAgICAgIHVtZE5hbWVkRGVmaW5lOiB0cnVlXG4gICAgfSxcbiAgICBwZXJmb3JtYW5jZTogY29uZmlndXJhdGlvbi5wZXJmb3JtYW5jZUhpbnRzLFxuICAgIHRhcmdldDogY29uZmlndXJhdGlvbi50YXJnZXRUZWNobm9sb2d5LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIG1vZHVsZToge1xuICAgICAgICBydWxlczogY29uZmlndXJhdGlvbi5tb2R1bGUuYWRkaXRpb25hbC5tYXAoKFxuICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdFxuICAgICAgICApOlBsYWluT2JqZWN0ID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5leGNsdWRlIHx8ICdmYWxzZScsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUgJiYgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uaW5jbHVkZSwgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHRcbiAgICAgICAgICAgICAgICApIHx8IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYmFzZSxcbiAgICAgICAgICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLnRlc3QsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0KSksXG4gICAgICAgICAgICAgICAgdXNlOiBldmFsdWF0ZShsb2FkZXJDb25maWd1cmF0aW9uLnVzZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY29uY2F0KFtcbiAgICAgICAgICAgIGxvYWRlci5lanMsXG4gICAgICAgICAgICBsb2FkZXIuc2NyaXB0LFxuICAgICAgICAgICAgbG9hZGVyLmh0bWwubWFpbiwgbG9hZGVyLmh0bWwuZWpzLCBsb2FkZXIuaHRtbC5odG1sLFxuICAgICAgICAgICAgbG9hZGVyLnN0eWxlLFxuICAgICAgICAgICAgbG9hZGVyLmZvbnQuZW90LCBsb2FkZXIuZm9udC5zdmcsIGxvYWRlci5mb250LnR0ZixcbiAgICAgICAgICAgIGxvYWRlci5mb250LndvZmYsXG4gICAgICAgICAgICBsb2FkZXIuaW1hZ2UsXG4gICAgICAgICAgICBsb2FkZXIuZGF0YVxuICAgICAgICBdKVxuICAgIH0sXG4gICAgbm9kZTogY29uZmlndXJhdGlvbi5ub2RlRW52aXJvbm1lbnQsXG4gICAgcGx1Z2luczogcGx1Z2luSW5zdGFuY2VzXG59XG5pZiAoXG4gICAgIUFycmF5LmlzQXJyYXkoY29uZmlndXJhdGlvbi5tb2R1bGUuc2tpcFBhcnNlUmVndWxhckV4cHJlc3Npb25zKSB8fFxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9ucy5sZW5ndGhcbilcbiAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbi5tb2R1bGUubm9QYXJzZSA9XG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9uc1xuaWYgKGNvbmZpZ3VyYXRpb24uc2hvd0NvbmZpZ3VyYXRpb24pIHtcbiAgICBjb25zb2xlLmluZm8oJ1VzaW5nIGludGVybmFsIGNvbmZpZ3VyYXRpb246JywgdXRpbC5pbnNwZWN0KGNvbmZpZ3VyYXRpb24sIHtcbiAgICAgICAgZGVwdGg6IG51bGx9KSlcbiAgICBjb25zb2xlLmluZm8oJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICBjb25zb2xlLmluZm8oJ1VzaW5nIHdlYnBhY2sgY29uZmlndXJhdGlvbjonLCB1dGlsLmluc3BlY3QoXG4gICAgICAgIHdlYnBhY2tDb25maWd1cmF0aW9uLCB7ZGVwdGg6IG51bGx9KSlcbn1cbi8vIGVuZHJlZ2lvblxuZXhwb3J0IGRlZmF1bHQgd2VicGFja0NvbmZpZ3VyYXRpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19