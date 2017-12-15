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

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

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

/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
try {
    require('source-map-support/register');
} catch (error) {}
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
            return compilation.plugin('html-webpack-plugin-after-html-processing', function () {
                var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(htmlPluginData, callback) {
                    var result;
                    return _regenerator2.default.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    if (!(_configurator2.default.inPlace.cascadingStyleSheet && (0, _keys2.default)(_configurator2.default.inPlace.cascadingStyleSheet).length || _configurator2.default.inPlace.javaScript && (0, _keys2.default)(_configurator2.default.inPlace.javaScript).length)) {
                                        _context.next = 12;
                                        break;
                                    }

                                    _context.prev = 1;
                                    _context.next = 4;
                                    return _helper2.default.inPlaceCSSAndJavaScriptAssetReferences(htmlPluginData.html, _configurator2.default.inPlace.cascadingStyleSheet, _configurator2.default.inPlace.javaScript, _configurator2.default.path.target.base, _configurator2.default.files.compose.cascadingStyleSheet, _configurator2.default.files.compose.javaScript, compilation.assets);

                                case 4:
                                    result = _context.sent;

                                    htmlPluginData.html = result.content;
                                    filePathsToRemove.concat(result.filePathsToRemove);
                                    _context.next = 12;
                                    break;

                                case 9:
                                    _context.prev = 9;
                                    _context.t0 = _context['catch'](1);
                                    return _context.abrupt('return', callback(_context.t0, htmlPluginData));

                                case 12:
                                    callback(null, htmlPluginData);

                                case 13:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, undefined, [[1, 9]]);
                }));

                return function (_x, _x2) {
                    return _ref.apply(this, arguments);
                };
            }());
        });
        compiler.plugin('after-emit', function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(compilation, callback) {
                var promises, _loop2, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _path, _loop3, _arr2, _i2, _type2;

                return _regenerator2.default.wrap(function _callee2$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                promises = [];
                                _loop2 = /*#__PURE__*/_regenerator2.default.mark(function _loop2(_path) {
                                    return _regenerator2.default.wrap(function _loop2$(_context2) {
                                        while (1) {
                                            switch (_context2.prev = _context2.next) {
                                                case 0:
                                                    _context2.next = 2;
                                                    return _clientnode2.default.isFile(_path);

                                                case 2:
                                                    if (!_context2.sent) {
                                                        _context2.next = 4;
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
                                                    return _context2.stop();
                                            }
                                        }
                                    }, _loop2, undefined);
                                });
                                _iteratorNormalCompletion4 = true;
                                _didIteratorError4 = false;
                                _iteratorError4 = undefined;
                                _context3.prev = 5;
                                _iterator4 = (0, _getIterator3.default)(filePathsToRemove);

                            case 7:
                                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context3.next = 13;
                                    break;
                                }

                                _path = _step4.value;
                                return _context3.delegateYield(_loop2(_path), 't0', 10);

                            case 10:
                                _iteratorNormalCompletion4 = true;
                                _context3.next = 7;
                                break;

                            case 13:
                                _context3.next = 19;
                                break;

                            case 15:
                                _context3.prev = 15;
                                _context3.t1 = _context3['catch'](5);
                                _didIteratorError4 = true;
                                _iteratorError4 = _context3.t1;

                            case 19:
                                _context3.prev = 19;
                                _context3.prev = 20;

                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }

                            case 22:
                                _context3.prev = 22;

                                if (!_didIteratorError4) {
                                    _context3.next = 25;
                                    break;
                                }

                                throw _iteratorError4;

                            case 25:
                                return _context3.finish(22);

                            case 26:
                                return _context3.finish(19);

                            case 27:
                                _context3.next = 29;
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
                                }_context3.next = 35;
                                return _promise2.default.all(promises);

                            case 35:
                                callback();

                            case 36:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee2, undefined, [[5, 15, 19, 27], [20,, 22, 26]]);
            }));

            return function (_x3, _x4) {
                return _ref2.apply(this, arguments);
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
// // region apply final dom/javaScript modifications/fixes
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
                var window = void 0;
                try {
                    window = new _jsdom.JSDOM(htmlPluginData.html.replace(/<%/g, '##+#+#+##').replace(/%>/g, '##-#-#-##')).window;
                } catch (error) {
                    return callback(error, htmlPluginData);
                }
                var linkables = {
                    script: 'src', link: 'href' };
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
                }htmlPluginData.html = htmlPluginData.html.replace(/^(\s*<!doctype [^>]+?>\s*)[\s\S]*$/i, '$1') + window.document.documentElement.outerHTML.replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>');
                //  region post compilation
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
                    })];
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBOzs7O0FBSUE7O0FBQ0E7O0lBQVksVTs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFLQTs7OztBQUNBOzs7O0FBRUE7O0FBV0E7Ozs7QUFNQTs7OztBQUNBOzs7O0FBS0E7Ozs7QUFRQTs7Ozs7Ozs7QUF0Q0E7O0FBVEE7O0FBRkE7QUFZQSxJQUFJO0FBQ0EsWUFBUSw2QkFBUjtBQUNILENBRkQsQ0FFRSxPQUFPLEtBQVAsRUFBYyxDQUFFO0FBR2xCLElBQU0sVUFBVSxRQUFRLHNCQUFSLEdBQWhCOzs7QUFHQSxRQUFRLFdBQVIsR0FBc0IsUUFBUSxXQUE5QjtBQUNBLFFBQVEsSUFBUixHQUFlLFFBQVEsSUFBdkI7QUFDQSxRQUFRLFdBQVIsR0FBc0IsUUFBUSxXQUE5QjtBQUNBLFFBQVEsa0JBQVIsR0FBNkIsUUFBUSwrQkFBUixDQUE3QjtBQUNBLFFBQVEsV0FBUixHQUFzQixRQUFRLFdBQTlCO0FBQ0EsUUFBUSxPQUFSLEdBQWtCLFFBQVEseUJBQVIsQ0FBbEI7QUFDQSxRQUFRLFFBQVIsR0FBbUIsUUFBUSx5QkFBUixFQUFtQyxPQUF0RDtBQUNBLFFBQVEsT0FBUixHQUFrQixRQUFRLGdCQUFSLENBQWxCO0FBT0E7O0FBSkE7OztBQVFBO0FBQ0E7QUFDQTs7QUFFQSxRQUFRLEtBQVIsQ0FBYyxRQUFRLE9BQVIsQ0FBZ0IsYUFBaEIsQ0FBZCxFQUE4QyxPQUE5QyxHQUF3RCxZQUVsRDtBQUNGLHlCQUFNLFlBQU4sQ0FBbUIsSUFBbkIsRUFBeUIsS0FBSyxPQUE5QixFQUF1QyxNQUF2QyxFQUErQyxLQUFLLE9BQXBEOztBQURFLHNDQURDLFNBQ0Q7QUFEQyxpQkFDRDtBQUFBOztBQUVGLFdBQU8scUJBQXVCLElBQXZCLDhCQUE0QixJQUE1QixTQUFxQyxTQUFyQyxFQUFQO0FBQ0gsQ0FMRDtBQU1BOztBQUVBLElBQU0sZ0NBQ0Ysc0JBQXdCLFlBRDVCO0FBRUEsUUFBUSxLQUFSLENBQWMsUUFBUSxPQUFSLENBQWdCLGNBQWhCLENBQWQsRUFBK0MsT0FBL0MsQ0FBdUQsWUFBdkQsR0FBc0UsVUFDbEUsR0FEa0UsRUFFekQ7QUFBQSx1Q0FETSxtQkFDTjtBQURNLDJCQUNOO0FBQUE7O0FBQ1QsUUFBSSxJQUFJLEtBQUosQ0FBVSxZQUFWLENBQUosRUFDSSxPQUFPLEtBQVA7QUFDSixXQUFPLDhCQUE4QixLQUE5Qix3QkFDc0IsQ0FBQyxHQUFELEVBQU0sTUFBTixDQUFhLG1CQUFiLENBRHRCLENBQVA7QUFFSCxDQVBEO0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLG9CQUFKO0FBQ0EsSUFBSSwyQ0FBa0MsdUJBQWMsV0FBcEQsRUFDSSxjQUFjLHVCQUFjLFdBQTVCLENBREosS0FFSyxJQUFJLG9CQUFZLHVCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsVUFBN0MsRUFBeUQsTUFBekQsR0FBa0UsQ0FBdEUsRUFDRCxjQUFjLFFBQWQsQ0FEQyxLQUVBO0FBQ0Qsa0JBQWMsdUJBQWMsSUFBNUI7QUFDQSxRQUFJLHVCQUFjLFlBQWQsQ0FBMkIsSUFBM0IsS0FBb0MsS0FBeEMsRUFDSSxjQUFjLHFCQUFNLGdDQUFOLENBQXVDLFdBQXZDLENBQWQ7QUFDUDtBQUNEO0FBQ0E7QUFDQSxJQUFNLGtCQUFnQyxDQUNsQyxJQUFJLGtCQUFRLG9CQUFaLEVBRGtDLEVBRWxDLElBQUksa0JBQVEsUUFBUixDQUFpQixxQkFBckIsQ0FBMkMsSUFBM0MsQ0FGa0MsQ0FBdEM7QUFJQSxJQUFJLHVCQUFjLEtBQWxCLEVBQ0ksZ0JBQWdCLElBQWhCLENBQXFCLElBQUksa0JBQVEsa0JBQVosRUFBckI7QUFDSjs7Ozs7O0FBQ0Esb0RBQW1DLHVCQUFjLFNBQWQsQ0FBd0IsYUFBM0Q7QUFBQSxZQUFXLGFBQVg7O0FBQ0ksd0JBQWdCLElBQWhCLENBQXFCLElBQUksa0JBQVEsWUFBWixDQUF5QixJQUFJLE1BQUosQ0FBVyxhQUFYLENBQXpCLENBQXJCO0FBREosSyxDQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBQ1csTTtBQUNQLFFBQUksdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxNQUFsQyxDQUF5QyxjQUF6QyxDQUF3RCxNQUF4RCxDQUFKLEVBQXFFO0FBQ2pFLFlBQU0sU0FBZ0IsSUFBSSxNQUFKLENBQVcsTUFBWCxDQUF0QjtBQUNBLHdCQUFnQixJQUFoQixDQUFxQixJQUFJLGtCQUFRLDZCQUFaLENBQ2pCLE1BRGlCLEVBQ1QsVUFBQyxRQUFELEVBQW9DO0FBQ3hDLHFCQUFTLE9BQVQsR0FBbUIsU0FBUyxPQUFULENBQWlCLE9BQWpCLENBQ2YsTUFEZSxFQUNQLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsTUFBbEMsQ0FBeUMsTUFBekMsQ0FETyxDQUFuQjtBQUVILFNBSmdCLENBQXJCO0FBS0g7OztBQVJMLEtBQUssSUFBTSxNQUFYLElBQTRCLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsTUFBOUQ7QUFBQSxVQUFXLE1BQVg7QUFBQSxDLENBU0E7QUFDQTtBQUNBLElBQUksZ0JBQXdCLEtBQTVCO0FBQ0EsSUFBSSx1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxNQUErQyxXQUFuRDtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNJLHlEQUFnRCx1QkFBYyxLQUFkLENBQW9CLElBQXBFO0FBQUEsZ0JBQVMsaUJBQVQ7O0FBQ0ksZ0JBQUkscUJBQU0sVUFBTixDQUFpQixrQkFBa0IsUUFBbEIsQ0FBMkIsUUFBNUMsQ0FBSixFQUEyRDtBQUN2RCxnQ0FBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxRQUFRLElBQVosQ0FBaUIscUJBQU0sWUFBTixDQUNsQyxFQURrQyxFQUM5QixpQkFEOEIsRUFDWDtBQUNuQiw4QkFBVSxrQkFBa0IsUUFBbEIsQ0FBMkIsT0FEbEIsRUFEVyxDQUFqQixDQUFyQjtBQUdBLGdDQUFnQixJQUFoQjtBQUNIO0FBTkw7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQyxDQVFBO0FBQ0E7QUFDQSxJQUFJLGlCQUFpQix1QkFBYyxPQUEvQixJQUEwQyxxQkFBTSxVQUFOLENBQzFDLHVCQUFjLE9BQWQsQ0FBc0IsSUFEb0IsQ0FBOUMsRUFHSSxnQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxRQUFRLE9BQVosQ0FBb0IsdUJBQWMsT0FBbEMsQ0FBckI7QUFDSjtBQUNBO0FBQ0EsSUFBSSxpQkFBaUIsdUJBQWMsT0FBbkMsRUFBNEM7QUFDeEMsUUFBSSxDQUFDLENBQUMsT0FBRCxFQUFVLGNBQVYsRUFBMEIsUUFBMUIsQ0FDRCx1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQURDLENBQUw7QUFBQSxtQkFHbUMsQ0FDM0IsQ0FBQyxxQkFBRCxFQUF3QixLQUF4QixDQUQyQixFQUUzQixDQUFDLFlBQUQsRUFBZSxJQUFmLENBRjJCLENBSG5DOztBQUdJO0FBQUssZ0JBQU0sZUFBTjtBQUlELGdCQUFJLHVCQUFjLE9BQWQsQ0FBc0IsS0FBSyxDQUFMLENBQXRCLENBQUosRUFBb0M7QUFDaEMsb0JBQU0sVUFBd0Isb0JBQzFCLHVCQUFjLE9BQWQsQ0FBc0IsS0FBSyxDQUFMLENBQXRCLENBRDBCLENBQTlCO0FBRGdDO0FBQUE7QUFBQTs7QUFBQTtBQUdoQyxxRUFBMEIsT0FBMUI7QUFBQSw0QkFBVyxJQUFYOztBQUNJLCtDQUFjLE9BQWQsQ0FBc0IsUUFBdEIsQ0FBK0IsSUFBL0IsQ0FBb0MsZUFBSyxRQUFMLENBQ2hDLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFETSxFQUVoQyx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLEtBQUssQ0FBTCxDQUFoQyxDQUZnQyxLQUc3QixJQUg2QixTQUdyQixLQUFLLENBQUwsQ0FIcUIsU0FHVix1QkFBYyxhQUhKLFFBQXBDO0FBREo7QUFIZ0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVFuQztBQVpMO0FBSEosS0FnQkEsZ0JBQWdCLElBQWhCLENBQXFCLElBQUksUUFBUSxPQUFaLENBQW9CLHVCQUFjLE9BQWxDLENBQXJCO0FBQ0g7QUFDRDtBQUNBO0FBQ0EsSUFBSSx1QkFBYyxXQUFkLENBQTBCLFdBQTFCLElBQTBDLGlCQUFpQixDQUMzRCxPQUQyRCxFQUNsRCxjQURrRCxFQUU3RCxRQUY2RCxDQUVwRCx1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQUZvRCxDQUEvRCxFQUdJLGdCQUFnQixJQUFoQixDQUFxQixJQUFJLFFBQVEsV0FBWixDQUNqQix1QkFBYyxXQUFkLENBQTBCLFdBRFQsQ0FBckI7QUFFSjtBQUNBO0FBQ0EsSUFBSSx1QkFBYyxLQUFkLENBQW9CLFdBQXhCLEVBQ0ksZ0JBQWdCLElBQWhCLENBQXFCLElBQUksa0JBQVEsWUFBWixDQUNqQix1QkFBYyxLQUFkLENBQW9CLFdBREgsQ0FBckI7QUFFSixJQUFJLHVCQUFjLE1BQWQsQ0FBcUIsT0FBekIsRUFDSSxnQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxrQkFBUSxhQUFaLENBQ2pCLHVCQUFjLE1BQWQsQ0FBcUIsT0FESixDQUFyQjtBQUVKO0FBQ0E7QUFDQTtBQUNBLElBQ0ksdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixXQUEvQixJQUNBLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsV0FBL0IsQ0FBMkMsTUFGL0MsRUFJSSxnQkFBZ0IsSUFBaEIsQ0FBcUIsb0JBQ2pCLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsV0FBL0IsQ0FBMkMsTUFEMUIsRUFFbkIsTUFGbUIsR0FHakIsSUFBSSxRQUFRLFdBQVosQ0FDSSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLFdBQS9CLENBQTJDLE1BQTNDLENBQWtELFNBQWxELElBQStELEVBRG5FLEVBRUksdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixXQUEvQixDQUEyQyxNQUEzQyxDQUFrRCxNQUFsRCxJQUE0RCxFQUZoRSxDQUhpQixHQU1iLElBQUksUUFBUSxXQUFaLEVBTlI7QUFPSjtBQUNBO0FBQ0EsZ0JBQWdCLElBQWhCLENBQXFCLEVBQUMsT0FBTyxlQUFDLFFBQUQsRUFBMEI7QUFDbkQsaUJBQVMsTUFBVCxDQUFnQixNQUFoQixFQUF3QixVQUNwQixXQURvQixFQUNBLFFBREEsRUFFZDtBQUNOLGlCQUFLLElBQU0sUUFBWCxJQUE2QixZQUFZLE1BQXpDO0FBQ0ksb0JBQUksWUFBWSxNQUFaLENBQW1CLGNBQW5CLENBQWtDLFFBQWxDLENBQUosRUFBZ0Q7QUFDNUMsd0JBQU0sV0FBa0IsU0FBUSxPQUFSLENBQWdCLFVBQWhCLEVBQTRCLEVBQTVCLENBQXhCO0FBQ0Esd0JBQU0sUUFBZSxpQkFBTyxrQkFBUCxDQUNqQixRQURpQixFQUNQLHVCQUFjLEtBQWQsQ0FBb0IsS0FEYixFQUNvQix1QkFBYyxJQURsQyxDQUFyQjtBQUVBLHdCQUFJLFNBQVEsdUJBQWMsWUFBZCxDQUEyQixLQUEzQixDQUFSLElBQTRDLENBQUUsSUFBSSxNQUFKLENBQzlDLHVCQUFjLFlBQWQsQ0FBMkIsS0FBM0IsRUFDSyxnQ0FGeUMsQ0FBRCxDQUc5QyxJQUg4QyxDQUd6QyxRQUh5QyxDQUFqRCxFQUdtQjtBQUNmLDRCQUFNLFNBQWlCLFlBQVksTUFBWixDQUFtQixRQUFuQixFQUE0QixNQUE1QixFQUF2QjtBQUNBLDRCQUFJLE9BQU8sTUFBUCxLQUFrQixRQUF0QixFQUNJLFlBQVksTUFBWixDQUFtQixRQUFuQixJQUE4Qiw4QkFDMUIsdUJBQWMsWUFBZCxDQUEyQixLQUEzQixFQUFpQyxPQUFqQyxDQUF5QyxPQUF6QyxDQUNJLFFBREosRUFDYyxPQUFPLE9BQVAsQ0FBZSxLQUFmLEVBQXNCLEtBQXRCLENBRGQsQ0FEMEIsQ0FBOUI7QUFHUDtBQUNKO0FBZkwsYUFnQkE7QUFDSCxTQXBCRDtBQXFCSCxLQXRCb0IsRUFBckI7QUF1QkE7QUFDQTtBQUNBLElBQUksaUJBQWlCLENBQUMsQ0FBQyxPQUFELEVBQVUsY0FBVixFQUEwQixRQUExQixDQUNsQix1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQURrQixDQUF0QixFQUdJLGdCQUFnQixJQUFoQixDQUFxQixFQUFDLE9BQU8sZUFBQyxRQUFELEVBQTBCO0FBQ25ELFlBQU0sb0JBQWtDLEVBQXhDO0FBQ0EsaUJBQVMsTUFBVCxDQUFnQixhQUFoQixFQUErQixVQUFDLFdBQUQ7QUFBQSxtQkFDM0IsWUFBWSxNQUFaLENBQ0ksMkNBREo7QUFBQSxvR0FDaUQsaUJBQ3pDLGNBRHlDLEVBQ2IsUUFEYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQ0FJckMsdUJBQWMsT0FBZCxDQUFzQixtQkFBdEIsSUFDQSxvQkFDSSx1QkFBYyxPQUFkLENBQXNCLG1CQUQxQixFQUVFLE1BSEYsSUFHWSx1QkFBYyxPQUFkLENBQXNCLFVBQXRCLElBQ1osb0JBQVksdUJBQWMsT0FBZCxDQUFzQixVQUFsQyxFQUE4QyxNQVJUO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSwyQ0FjN0IsaUJBQU8sc0NBQVAsQ0FDSSxlQUFlLElBRG5CLEVBRUksdUJBQWMsT0FBZCxDQUFzQixtQkFGMUIsRUFHSSx1QkFBYyxPQUFkLENBQXNCLFVBSDFCLEVBSUksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQUo5QixFQUtJLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FDSyxtQkFOVCxFQU9JLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFQaEMsRUFRSSxZQUFZLE1BUmhCLENBZDZCOztBQUFBO0FBVzNCLDBDQVgyQjs7QUF1QmpDLG1EQUFlLElBQWYsR0FBc0IsT0FBTyxPQUE3QjtBQUNBLHNEQUFrQixNQUFsQixDQUF5QixPQUFPLGlCQUFoQztBQXhCaUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQSxxRUEwQjFCLHNCQUFnQixjQUFoQixDQTFCMEI7O0FBQUE7QUE0QnpDLDZDQUFTLElBQVQsRUFBZSxjQUFmOztBQTVCeUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBRGpEOztBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQUQyQjtBQUFBLFNBQS9CO0FBZ0NBLGlCQUFTLE1BQVQsQ0FBZ0IsWUFBaEI7QUFBQSxpR0FBOEIsa0JBQzFCLFdBRDBCLEVBQ04sUUFETTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR3RCLHdDQUhzQixHQUdVLEVBSFY7QUFBQSxpR0FJZixLQUplO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDJEQUtaLHFCQUFNLE1BQU4sQ0FBYSxLQUFiLENBTFk7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNbEIsNkRBQVMsSUFBVCxDQUFjLHNCQUFZLFVBQUMsT0FBRDtBQUFBLCtEQUN0QixXQUFXLE1BQVgsQ0FBa0IsS0FBbEIsRUFBd0IsVUFBQyxLQUFELEVBQXVCO0FBQzNDLGdFQUFJLEtBQUosRUFDSSxRQUFRLEtBQVIsQ0FBYyxLQUFkO0FBQ0o7QUFDSCx5REFKRCxDQURzQjtBQUFBLHFEQUFaLENBQWQ7O0FBTmtCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3RUFJQSxpQkFKQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUlmLHFDQUplO0FBQUEsc0VBSWYsS0FKZTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx1Q0FZcEIsa0JBQVEsR0FBUixDQUFZLFFBQVosQ0Fab0I7O0FBQUE7QUFhMUIsMkNBQVcsRUFBWDs7QUFiMEIseURBY2YsTUFkZTtBQWlCdEIsNkNBQVMsSUFBVCxDQUFjLHNCQUFZLFVBQ3RCLE9BRHNCLEVBQ0osTUFESTtBQUFBLCtDQU1mLFdBQVcsT0FBWixDQUNOLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsTUFBaEMsQ0FETSxFQUVOLHVCQUFjLFFBRlIsRUFHTixVQUFDLEtBQUQsRUFBZSxLQUFmLEVBQTRDO0FBQ3hDLGdEQUFJLEtBQUosRUFBVztBQUNQLHVEQUFPLEtBQVA7QUFDQTtBQUNIO0FBQ0QsZ0RBQUksTUFBTSxNQUFOLEtBQWlCLENBQXJCLEVBQ0ksV0FBVyxLQUFYLENBQ0ksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxNQUFoQyxDQURKLEVBQzJDLFVBQ25DLEtBRG1DO0FBQUEsdURBRTdCLFFBQVEsT0FBTyxLQUFQLENBQVIsR0FBd0IsU0FGSztBQUFBLDZDQUQzQyxFQURKLEtBTUk7QUFDUCx5Q0FmSyxDQU5nQjtBQUFBLHFDQUFaLENBQWQ7QUFqQnNCOztBQUFBLHdDQWNBLENBQ3RCLFlBRHNCLEVBQ1IscUJBRFEsQ0FkQTtBQWMxQjtBQUFXLDBDQUFYOztBQUFBLDJDQUFXLE1BQVg7QUFBQSxpQ0FkMEI7QUFBQSx1Q0F1Q3BCLGtCQUFRLEdBQVIsQ0FBWSxRQUFaLENBdkNvQjs7QUFBQTtBQXdDMUI7O0FBeEMwQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUE5Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQTBDSCxLQTVFb0IsRUFBckI7QUE2RUo7QUFDQTtBQUNBLElBQUksdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsTUFBK0MsV0FBbkQsRUFDSSxLQUFLLElBQU0sU0FBWCxJQUErQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBQWhFO0FBQ0ksUUFBSSx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBQWpDLENBQTRDLGNBQTVDLENBQ0EsU0FEQSxDQUFKLEVBRUc7QUFDQyxZQUFNLG1CQUNDLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFBN0IsU0FBcUMsU0FBckMsNEJBREo7QUFHQSxZQUFJLHVCQUFjLG9CQUFkLENBQW1DLFFBQW5DLENBQ0EsZ0JBREEsQ0FBSixFQUVHO0FBQ0MsbUJBQU8sdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQUFqQyxDQUE0QyxTQUE1QyxDQUFQO0FBQ0EsZ0JBQU0sV0FBa0IsaUJBQU8sc0JBQVAsQ0FDcEIsaUJBQU8sV0FBUCxDQUNJLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFEaEMsQ0FEb0IsRUFHakIsRUFBQyxVQUFVLFNBQVgsRUFIaUIsQ0FBeEI7QUFJQSw0QkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxRQUFRLGtCQUFaLENBQStCO0FBQ2hELDBCQUFVLFFBRHNDO0FBRWhELHNCQUFNLElBRjBDO0FBR2hELGtDQUFrQixxQkFBTSxVQUFOLENBQW9CLFFBQXBCO0FBSDhCLGFBQS9CLENBQXJCO0FBS0EsNEJBQWdCLElBQWhCLENBQXFCLElBQUksa0JBQVEsa0JBQVosQ0FBK0I7QUFDaEQseUJBQVMsdUJBQWMsSUFBZCxDQUFtQixPQURvQixFQUNYLFVBQVUsUUFDM0MsZ0JBRDJDLENBREMsRUFBL0IsQ0FBckI7QUFHSDtBQUNKO0FBeEJMLEMsQ0F5Qko7QUFDQTtBQUNBLElBQUksdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsTUFBK0MsV0FBbkQ7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSx5REFBK0IsdUJBQWMsU0FBZCxDQUF3QixjQUF2RDtBQUFBLGdCQUFXLFVBQVg7O0FBQ0ksZ0JBQUksdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQUFqQyxDQUE0QyxjQUE1QyxDQUNBLFVBREEsQ0FBSixFQUdJLGdCQUFnQixJQUFoQixDQUFxQixJQUFJLGtCQUFRLFFBQVIsQ0FBaUIsa0JBQXJCLENBQXdDO0FBQ3pELHVCQUFPLEtBRGtEO0FBRXpELDBCQUFVLEtBRitDO0FBR3pELDBCQUFVLGVBQUssUUFBTCxDQUNOLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFEcEIsRUFFTix1QkFBYyxLQUFkLENBQW9CLE9BQXBCLENBQTRCLFVBRnRCLENBSCtDO0FBTXpELDJCQUFXLFFBTjhDO0FBT3pELHNCQUFNLFVBUG1EO0FBUXpELHlCQUFTO0FBUmdELGFBQXhDLENBQXJCO0FBSlI7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQyxDQWVBO0FBQ0E7QUFDQSxJQUFJLENBQUMsdUJBQWMsTUFBZCxDQUFxQixVQUExQixFQUNJLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFBNUIsR0FBeUMsZUFBSyxPQUFMLENBQ3JDLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsVUFESyxFQUNPLHdCQURQLENBQXpDO0FBRUo7QUFDQTtBQUNBLElBQUksdUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUE0QixtQkFBaEMsRUFDSSxnQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxRQUFRLFdBQVosQ0FBd0I7QUFDekMsZUFBVyxJQUQ4QixFQUN4QixVQUFVLGVBQUssUUFBTCxDQUN2Qix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBREgsRUFFdkIsdUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUE0QixtQkFGTDtBQURjLENBQXhCLENBQXJCO0FBS0o7QUFDQTtBQUNBLElBQUksdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUFqQyxLQUE2QyxjQUFqRDtBQUNJOzs7Ozs7QUFNQSwyQkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLEdBQTJDLFVBQ3ZDLE9BRHVDLEVBQ3ZCLE9BRHVCLEVBQ1AsUUFETyxFQUVqQztBQUNOLGtCQUFVLFFBQVEsT0FBUixDQUFnQixLQUFoQixFQUF1QixFQUF2QixDQUFWO0FBQ0EsWUFBSSxRQUFRLFVBQVIsQ0FBbUIsR0FBbkIsQ0FBSixFQUNJLFVBQVUsZUFBSyxRQUFMLENBQWMsdUJBQWMsSUFBZCxDQUFtQixPQUFqQyxFQUEwQyxPQUExQyxDQUFWO0FBSEU7QUFBQTtBQUFBOztBQUFBO0FBSU4sNkRBRUksdUJBQWMsTUFBZCxDQUFxQixjQUFyQixDQUFvQyxNQUFwQyxDQUNJLHVCQUFjLE1BQWQsQ0FBcUIsY0FEekIsQ0FGSjtBQUFBLG9CQUNVLFNBRFY7O0FBS0ksb0JBQUksUUFBUSxVQUFSLENBQW1CLFNBQW5CLENBQUosRUFBa0M7QUFDOUIsOEJBQVUsUUFBUSxTQUFSLENBQWtCLFVBQVMsTUFBM0IsQ0FBVjtBQUNBLHdCQUFJLFFBQVEsVUFBUixDQUFtQixHQUFuQixDQUFKLEVBQ0ksVUFBVSxRQUFRLFNBQVIsQ0FBa0IsQ0FBbEIsQ0FBVjtBQUNKO0FBQ0g7QUFWTDtBQUpNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBZU4sWUFBSSxrQkFBMEIsaUJBQU8sd0JBQVAsQ0FDMUIsT0FEMEIsRUFDakIsdUJBQWMsSUFBZCxDQUFtQixPQURGLEVBQ1csT0FEWCxFQUUxQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBRlAsRUFHMUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixNQUExQixDQUNJLHVCQUFjLE1BQWQsQ0FBcUIsY0FEekIsRUFFSSx1QkFBYyxNQUFkLENBQXFCLGNBRnpCLEVBR0UsR0FIRixDQUdNLFVBQUMsUUFBRDtBQUFBLG1CQUE0QixlQUFLLE9BQUwsQ0FDOUIsdUJBQWMsSUFBZCxDQUFtQixPQURXLEVBQ0YsUUFERSxDQUE1QjtBQUFBLFNBSE4sRUFLRyxNQUxILENBS1UsVUFBQyxRQUFEO0FBQUEsbUJBQ04sQ0FBQyx1QkFBYyxJQUFkLENBQW1CLE9BQW5CLENBQTJCLFVBQTNCLENBQXNDLFFBQXRDLENBREs7QUFBQSxTQUxWLENBSDBCLEVBVXZCLHVCQUFjLE1BQWQsQ0FBcUIsT0FWRSxFQVcxQix1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLE1BWFIsRUFXZ0IsdUJBQWMsVUFYOUIsRUFZMUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxJQVpOLEVBWVksdUJBQWMsSUFBZCxDQUFtQixNQVovQixFQWExQix1QkFBYyxNQUFkLENBQXFCLGNBYkssRUFjMUIsdUJBQWMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixTQWRELEVBZTFCLHVCQUFjLE9BQWQsQ0FBc0IsSUFBdEIsQ0FBMkIsYUFmRCxFQWdCMUIsdUJBQWMsT0FBZCxDQUFzQixrQkFoQkksRUFpQjFCLHVCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsUUFBakMsQ0FBMEMsT0FBMUMsQ0FBa0QsT0FqQnhCLEVBa0IxQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFFBQWpDLENBQTBDLE9BQTFDLENBQWtELE9BbEJ4QixFQW1CMUIsdUJBQWMsT0FBZCxDQUFzQixlQUF0QixDQUFzQyxNQW5CWixFQW9CMUIsdUJBQWMsT0FBZCxDQUFzQixlQUF0QixDQUFzQyxPQXBCWixFQXFCMUIsdUJBQWMsUUFyQlksQ0FBOUI7QUFzQkEsWUFBSSxlQUFKLEVBQXFCO0FBQ2pCLGdCQUFJLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxRQUFmLENBQ0EsdUJBQWMsWUFBZCxDQUEyQixRQUQzQixLQUVDLFdBQVcsdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUZqRCxFQUdJLGtCQUFrQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLENBQ2QsT0FEYyxDQUFsQjtBQUVKLGdCQUFJLHVCQUFjLFlBQWQsQ0FBMkIsUUFBM0IsS0FBd0MsS0FBNUMsRUFDSSxrQkFBa0IscUJBQU0sZ0NBQU4sQ0FDZCxlQURjLEVBQ0csZ0JBREgsQ0FBbEI7QUFFSixtQkFBTyxTQUNILElBREcsRUFDRyxlQURILEVBQ29CLHVCQUFjLFlBQWQsQ0FBMkIsUUFEL0MsQ0FBUDtBQUVIO0FBQ0QsZUFBTyxVQUFQO0FBQ0gsS0FwREQ7QUFxREo7QUFDQTtBQUNBLElBQUksdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsTUFBK0MsV0FBbkQsRUFBZ0U7QUFDNUQsUUFBSSxtQkFBMkIsS0FBL0I7QUFDQSxTQUFLLElBQU0sV0FBWCxJQUErQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBQWhFO0FBQ0ksWUFBSSx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBQWpDLENBQTRDLGNBQTVDLENBQ0EsV0FEQSxDQUFKLEVBR0ksSUFBSSx1QkFBYyxTQUFkLENBQXdCLFdBQXhCLENBQW9DLFFBQXBDLENBQTZDLFdBQTdDLENBQUosRUFDSSxtQkFBbUIsSUFBbkIsQ0FESixLQUdJLE9BQU8sdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQUFqQyxDQUE0QyxXQUE1QyxDQUFQO0FBUFosS0FRQSxJQUFJLGdCQUFKLEVBQXNCO0FBQ2xCLHNCQUFjLGtCQUFkO0FBQ0Esd0JBQWdCLElBQWhCLENBQXFCLElBQUksa0JBQVEsU0FBWixDQUFzQjtBQUN2QyxrQkFBUyx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBQW5DLDhCQUR1QztBQUV2QyxrQkFBTTtBQUZpQyxTQUF0QixDQUFyQjtBQUlILEtBTkQsTUFPSSxRQUFRLElBQVIsQ0FBYSx3QkFBYjtBQUNQO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLElBQWhCLENBQXFCLEVBQUMsT0FBTyxlQUFDLFFBQUQ7QUFBQSxlQUEwQixTQUFTLE1BQVQsQ0FDbkQsYUFEbUQsRUFDcEMsVUFBQyxXQUFELEVBQTZCO0FBQ3hDLHdCQUFZLE1BQVosQ0FBbUIsc0NBQW5CLEVBQTJELFVBQ3ZELGNBRHVELEVBQzNCLFFBRDJCLEVBRWpEO0FBQUEsNEJBQ2dDLENBQ2xDLGVBQWUsSUFEbUIsRUFDYixlQUFlLElBREYsQ0FEaEM7O0FBQ04sNkRBRUc7QUFGRSx3QkFBTSxpQkFBTjtBQUdELHdCQUFJLFNBQWUsQ0FBbkI7QUFERDtBQUFBO0FBQUE7O0FBQUE7QUFFQyx5RUFBOEIsSUFBOUIsaUhBQW9DO0FBQUEsZ0NBQXpCLEdBQXlCOztBQUNoQyxnQ0FBSSx1QkFBdUIsSUFBdkIsQ0FBNEIsZUFBSyxRQUFMLENBQzVCLElBQUksVUFBSixDQUFlLEdBQWYsSUFBc0IsSUFBSSxVQUFKLENBQWUsSUFBckMsSUFBNkMsRUFEakIsQ0FBNUIsQ0FBSixFQUdJLEtBQUssTUFBTCxDQUFZLE1BQVosRUFBbUIsQ0FBbkI7QUFDSixzQ0FBUyxDQUFUO0FBQ0g7QUFSRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU0Y7QUFDRCxvQkFBTSxTQUF1QixLQUFLLEtBQUwsQ0FDekIsZUFBZSxNQUFmLENBQXNCLFNBREcsQ0FBN0I7QUFFQSxvQkFBSSxRQUFlLENBQW5CO0FBZk07QUFBQTtBQUFBOztBQUFBO0FBZ0JOLHFFQUFrQyxNQUFsQyxpSEFBMEM7QUFBQSw0QkFBL0IsWUFBK0I7O0FBQ3RDLDRCQUFJLHVCQUF1QixJQUF2QixDQUE0QixlQUFLLFFBQUwsQ0FBYyxZQUFkLENBQTVCLENBQUosRUFDSSxPQUFPLE1BQVAsQ0FBYyxLQUFkLEVBQXFCLENBQXJCO0FBQ0osaUNBQVMsQ0FBVDtBQUNIO0FBcEJLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBcUJOLCtCQUFlLE1BQWYsQ0FBc0IsU0FBdEIsR0FBa0MseUJBQWUsTUFBZixDQUFsQztBQUNBLHlCQUFTLElBQVQsRUFBZSxjQUFmO0FBQ0gsYUF6QkQ7QUEwQkEsd0JBQVksTUFBWixDQUFtQiwyQ0FBbkIsRUFBZ0UsVUFDNUQsY0FENEQsRUFDaEMsUUFEZ0MsRUFFcEQ7QUFDUixvQkFBSSxlQUFKO0FBQ0Esb0JBQUk7QUFDQSw2QkFBVSxpQkFBUSxlQUFlLElBQWYsQ0FBb0IsT0FBcEIsQ0FDZCxLQURjLEVBQ1AsV0FETyxFQUVoQixPQUZnQixDQUVSLEtBRlEsRUFFRCxXQUZDLENBQVIsQ0FBRCxDQUV1QixNQUZoQztBQUdILGlCQUpELENBSUUsT0FBTyxLQUFQLEVBQWM7QUFDWiwyQkFBTyxTQUFTLEtBQVQsRUFBZ0IsY0FBaEIsQ0FBUDtBQUNIO0FBQ0Qsb0JBQU0sWUFBa0M7QUFDcEMsNEJBQVEsS0FENEIsRUFDckIsTUFBTSxNQURlLEVBQXhDO0FBRUEscUJBQUssSUFBTSxPQUFYLElBQTZCLFNBQTdCO0FBQ0ksd0JBQUksVUFBVSxjQUFWLENBQXlCLE9BQXpCLENBQUo7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSw2RUFFSSxPQUFPLFFBQVAsQ0FBZ0IsZ0JBQWhCLENBQ08sT0FBSCxTQUFjLFVBQVUsT0FBVixDQUFkLGFBQ0csdUJBQWMsYUFEakIsU0FESixDQUZKO0FBQUEsb0NBQ1UsT0FEVjs7QUFNSTs7Ozs7QUFLQSx3Q0FBUSxZQUFSLENBQ0ksVUFBVSxPQUFWLENBREosRUFFSSxRQUFRLFlBQVIsQ0FDSSxVQUFVLE9BQVYsQ0FESixFQUVFLE9BRkYsQ0FFVSxJQUFJLE1BQUosQ0FDTixTQUFPLHVCQUFjLGFBQXJCLFNBQ0EsV0FGTSxDQUZWLEVBS0csSUFMSCxDQUZKO0FBWEo7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFESixpQkFxQkEsZUFBZSxJQUFmLEdBQXNCLGVBQWUsSUFBZixDQUFvQixPQUFwQixDQUNsQixxQ0FEa0IsRUFDcUIsSUFEckIsSUFFbEIsT0FBTyxRQUFQLENBQWdCLGVBQWhCLENBQWdDLFNBQWhDLENBQTBDLE9BQTFDLENBQ0ksZUFESixFQUNxQixJQURyQixFQUVFLE9BRkYsQ0FFVSxZQUZWLEVBRXdCLElBRnhCLENBRko7QUFLQTtBQXJDUTtBQUFBO0FBQUE7O0FBQUE7QUFzQ1Isc0VBRUksdUJBQWMsS0FBZCxDQUFvQixJQUZ4QjtBQUFBLDRCQUNVLHFCQURWOztBQUlJLDRCQUNJLHNCQUFzQixRQUF0QixLQUNBLGVBQWUsTUFBZixDQUFzQixPQUF0QixDQUE4QixRQUZsQyxFQUdFO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0Usa0ZBRUksc0JBQXNCLFFBQXRCLENBQStCLEdBRm5DO0FBQUEsd0NBQ1UsbUJBRFY7O0FBSUksd0NBQ0ksb0JBQW9CLGNBQXBCLENBQW1DLFNBQW5DLEtBQ0Esb0JBQW9CLE9BQXBCLENBQTRCLGNBQTVCLENBQ0ksY0FESixDQURBLElBSUEsT0FBTyxvQkFBb0IsT0FBcEIsQ0FBNEIsWUFBbkMsS0FDUSxRQU5aLEVBUUksZUFBZSxJQUFmLEdBQXNCLG9CQUFVLElBQVYsQ0FDbEIscUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QixFQUF6QixFQUE2QjtBQUN6QixpREFBUyxvQkFBb0IsT0FBcEIsSUFBK0I7QUFEZixxQ0FBN0IsRUFFRyxFQUFDLFNBQVM7QUFDVCwwREFBYyxzQkFDVCxRQURTLENBQ0E7QUFGTCx5Q0FBVixFQUZILENBRGtCLEVBTWIsZUFBZSxJQU5GLENBQXRCO0FBWlI7QUFERjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW9CRTtBQUNIO0FBNUJMLHFCQXRDUSxDQW1FUjtBQW5FUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW9FUix5QkFBUyxJQUFULEVBQWUsY0FBZjtBQUNILGFBdkVEO0FBd0VILFNBcEdrRCxDQUExQjtBQUFBLEtBQVIsRUFBckI7QUFxR0E7Ozs7QUFJQSxJQUFJLHVCQUFjLFlBQWQsQ0FBMkIsUUFBM0IsQ0FBb0MsVUFBcEMsQ0FBK0MsS0FBL0MsQ0FBSixFQUNJLGdCQUFnQixJQUFoQixDQUFxQixFQUFDLE9BQU8sZUFBQyxRQUFEO0FBQUEsZUFBMEIsU0FBUyxNQUFULENBQ25ELE1BRG1ELEVBQzNDLFVBQUMsV0FBRCxFQUFxQixRQUFyQixFQUF5RDtBQUM3RCxnQkFBTSxhQUNGLE9BQU8sV0FBUCxLQUF1QixRQURELEdBRXRCLFdBRnNCLEdBRVIsWUFBWSxDQUFaLENBRmxCO0FBR0EsaUJBQUssSUFBTSxZQUFYLElBQWtDLFlBQVksTUFBOUM7QUFDSSxvQkFDSSxZQUFZLE1BQVosQ0FBbUIsY0FBbkIsQ0FBa0MsWUFBbEMsS0FDQSxhQUFhLE9BQWIsQ0FBcUIsY0FBckIsRUFBcUMsSUFBckMsRUFBMkMsUUFBM0MsQ0FDSSx1QkFBYyxLQUFkLENBQW9CLEtBQXBCLENBQTBCLFVBQTFCLENBQXFDLGVBRHpDLENBRkosRUFJRTtBQUNFLHdCQUFJLFNBQ0EsWUFBWSxNQUFaLENBQW1CLFlBQW5CLEVBQWlDLE1BQWpDLEVBREo7QUFFQSx3QkFBSSxPQUFPLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDNUIsNkJBQ0ksSUFBTSxXQURWLElBRUksdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUZyQztBQUlJLGdDQUFJLHVCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsT0FBakMsQ0FDQyxjQURELENBQ2dCLFdBRGhCLENBQUosRUFHSSxTQUFTLE9BQU8sT0FBUCxDQUFlLElBQUksTUFBSixDQUNwQixzQkFDQSxxQkFBTSw4QkFBTixDQUNJLHVCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FDSyxPQURMLENBQ2EsV0FEYixDQURKLENBREEsR0FJSSxZQUxnQixFQUtGLEdBTEUsQ0FBZixXQU1BLFdBTkEsV0FNa0IsT0FObEIsQ0FPTCxJQUFJLE1BQUosQ0FBVyxvQkFDUCxxQkFBTSw4QkFBTixDQUNJLFVBREosQ0FETyxHQUdILG9CQUhHLEdBSVAscUJBQU0sOEJBQU4sQ0FDSSx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQ0ssT0FETCxDQUNhLFdBRGIsQ0FESixDQUpPLEdBT0gsMkJBUFIsQ0FQSyxXQWVJLFdBZkosVUFBVDtBQVBSLHlCQXVCQSxTQUFTLE9BQU8sT0FBUCxDQUFlLElBQUksTUFBSixDQUNwQixtQkFDQSxxQkFBTSw4QkFBTixDQUNJLFVBREosQ0FEQSxHQUdJLGVBSmdCLENBQWYsRUFLTixTQUFRLHFCQUFNLGdDQUFOLENBQ1AsVUFETyxDQUFSLFNBTE0sQ0FBVDtBQVFBLG9DQUFZLE1BQVosQ0FBbUIsWUFBbkIsSUFDSSw4QkFBcUIsTUFBckIsQ0FESjtBQUVIO0FBQ0o7QUEzQ0wsYUE0Q0E7QUFDSCxTQWxEa0QsQ0FBMUI7QUFBQSxLQUFSLEVBQXJCO0FBbURKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLElBQWhCLENBQXFCLElBQUksUUFBUSxRQUFaLENBQ2pCLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsS0FBL0IsQ0FBcUMsT0FEcEIsQ0FBckI7QUFFQTtBQUNBOzs7Ozs7QUFDQSxzREFFSSx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLE9BRnRDO0FBQUEsWUFDVSxrQkFEVjs7QUFJSSx3QkFBZ0IsSUFBaEIsb0NBQXlCLGtCQUFRLHdCQUFqQyxpREFDTyxtQkFBbUIsR0FBbkIsQ0FBdUIsVUFBQyxLQUFEO0FBQUEsbUJBQXVCLElBQUksUUFBSixDQUM3QyxlQUQ2QyxFQUM1QixXQUQ0QixFQUNmLFlBRGUsY0FDUztBQUMxRDtBQUZpRCxhQUFELHlCQUc5QixTQUg4QixFQUduQixVQUhtQixDQUF0QjtBQUFBLFNBQXZCLENBRFA7QUFKSixLLENBU0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSwyQkFBb0MsU0FBcEMsd0JBQW9DLENBQUMsUUFBRCxFQUE2QjtBQUNuRSxlQUFXLGlCQUFPLFdBQVAsQ0FBbUIsUUFBbkIsQ0FBWDtBQUNBLFdBQU8saUJBQU8sb0JBQVAsQ0FDSCxRQURHLEVBQ08sdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixNQUExQixDQUNOLHVCQUFjLE1BQWQsQ0FBcUIsY0FEZixFQUVOLHVCQUFjLE1BQWQsQ0FBcUIsY0FGZixFQUdSLEdBSFEsQ0FHSixVQUFDLFFBQUQ7QUFBQSxlQUE0QixlQUFLLE9BQUwsQ0FDOUIsdUJBQWMsSUFBZCxDQUFtQixPQURXLEVBQ0YsUUFERSxDQUE1QjtBQUFBLEtBSEksRUFLUixNQUxRLENBS0QsVUFBQyxRQUFEO0FBQUEsZUFDTCxDQUFDLHVCQUFjLElBQWQsQ0FBbUIsT0FBbkIsQ0FBMkIsVUFBM0IsQ0FBc0MsUUFBdEMsQ0FESTtBQUFBLEtBTEMsQ0FEUCxDQUFQO0FBUUgsQ0FWRDtBQVdBLElBQU0sU0FBZ0IsRUFBdEI7QUFDQSxJQUFNLFFBQWU7QUFDakIseUNBRGlCO0FBRWpCLGtCQUZpQjtBQUdqQjtBQUhpQixDQUFyQjtBQUtBLElBQU0sV0FBb0IsU0FBcEIsUUFBb0IsQ0FBQyxJQUFELEVBQWMsUUFBZDtBQUFBLFdBQXNDLG1DQUFLLFFBQUw7QUFDNUQ7QUFDQSxjQUY0RCxvQ0FFN0Msb0JBQVksS0FBWixDQUY2QyxnQkFFZjtBQUNqRDtBQUhnRSw2QkFJN0QsUUFKNkQsMENBSWhELHNCQUFjLEtBQWQsQ0FKZ0QsR0FBdEM7QUFBQSxDQUExQjtBQUtBLHFCQUFNLFlBQU4sQ0FBbUIsTUFBbkIsRUFBMkI7QUFDdkI7QUFDQTtBQUNBLFNBQUs7QUFDRCxpQkFBUyxpQkFBQyxRQUFEO0FBQUEsbUJBQTZCLGlCQUFPLGNBQVAsQ0FDbEMsdUJBQWMsS0FBZCxDQUFvQixJQUFwQixDQUF5QixNQUF6QixDQUNJLHVCQUFjLEtBQWQsQ0FBb0IsV0FEeEIsRUFFRSxHQUZGLENBRU0sVUFBQyxpQkFBRDtBQUFBLHVCQUNGLGtCQUFrQixRQUFsQixDQUEyQixRQUR6QjtBQUFBLGFBRk4sQ0FEa0MsRUFLcEMsUUFMb0MsQ0FLM0IsUUFMMkIsTUFNaEMsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxHQUFsQyxDQUFzQyxPQUF0QyxLQUFrRCxJQUFuRCxHQUEyRCxLQUEzRCxHQUNHLFNBQ0ksdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxHQUFsQyxDQUFzQyxPQUQxQyxFQUNtRCxRQURuRCxDQVA4QixDQUE3QjtBQUFBLFNBRFI7QUFVRCxpQkFBUyxpQkFBTyxjQUFQLENBQXNCLENBQzNCLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFEQyxFQUU3QixNQUY2QixDQUV0Qix1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLGNBRlQsQ0FBdEIsQ0FWUjtBQWFELGNBQU0sOEJBYkw7QUFjRCxhQUFLLENBQ0QsRUFBQyxRQUFRLDRCQUE0QixRQUNqQyxDQUFDLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsR0FBbEMsQ0FBc0MsT0FBdEMsSUFBaUQ7QUFDOUMsOEJBQWM7QUFEZ0MsYUFBbEQsRUFFRyxZQUZILEdBRWtCLENBSGUsSUFJakMsS0FKaUMsR0FJekIsRUFKSCxXQUlhLHVCQUFjLGFBSjNCLGFBQVQsRUFEQyxFQU1ELEVBQUMsUUFBUSxTQUFULEVBTkMsRUFPRDtBQUNJLG9CQUFRLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsR0FBbEMsQ0FBc0MsTUFEbEQ7QUFFSSxxQkFBUyx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLEdBQWxDLENBQXNDLE9BQXRDLElBQWlEO0FBRjlELFNBUEMsRUFXSCxNQVhHLENBV0ksdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxHQUFsQyxDQUFzQyxVQUF0QyxDQUFpRCxHQUFqRCxDQUNMLFFBREssQ0FYSjtBQWRKLEtBSGtCO0FBK0J2QjtBQUNBO0FBQ0EsWUFBUTtBQUNKLGlCQUFTLGlCQUFDLFFBQUQ7QUFBQSxtQkFDTCx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLFVBQWxDLENBQTZDLE9BQTdDLEtBQXlELElBRHZCLEdBRWxDLHlCQUF5QixRQUF6QixDQUZrQyxHQUdsQyxTQUNJLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsVUFBbEMsQ0FBNkMsT0FEakQsRUFDMEQsUUFEMUQsQ0FISztBQUFBLFNBREw7QUFPSixpQkFBUyxpQkFBTyxjQUFQLENBQXNCLENBQzNCLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsVUFETCxFQUU3QixNQUY2QixDQUV0Qix1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLGNBRlQsQ0FBdEIsQ0FQTDtBQVVKLGNBQU0saUJBVkY7QUFXSixhQUFLLENBQUM7QUFDRixvQkFBUSx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLFVBQWxDLENBQTZDLE1BRG5EO0FBRUYscUJBQVMsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxVQUFsQyxDQUE2QyxPQUE3QyxJQUF3RDtBQUYvRCxTQUFELEVBR0YsTUFIRSxDQUdLLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsVUFBbEMsQ0FBNkMsVUFBN0MsQ0FBd0QsR0FBeEQsQ0FDTixRQURNLENBSEw7QUFYRCxLQWpDZTtBQWtEdkI7QUFDQTtBQUNBLFVBQU07QUFDRjtBQUNBLGNBQU07QUFDRixrQkFBTSxJQUFJLE1BQUosQ0FBVyxNQUFNLHFCQUFNLDhCQUFOLENBQ25CLHVCQUFjLEtBQWQsQ0FBb0IsV0FBcEIsQ0FBZ0MsUUFBaEMsQ0FBeUMsUUFEdEIsQ0FBTixHQUViLGFBRkUsQ0FESjtBQUlGLGlCQUFLLHVCQUFjLEtBQWQsQ0FBb0IsV0FBcEIsQ0FBZ0MsUUFBaEMsQ0FBeUM7QUFKNUMsU0FGSjtBQVFGLGFBQUs7QUFDRCxxQkFBUyxpQkFBQyxRQUFEO0FBQUEsdUJBQTZCLGlCQUFPLGNBQVAsQ0FDbEMsdUJBQWMsS0FBZCxDQUFvQixJQUFwQixDQUF5QixNQUF6QixDQUNJLHVCQUFjLEtBQWQsQ0FBb0IsV0FEeEIsRUFFRSxHQUZGLENBRU0sVUFBQyxpQkFBRDtBQUFBLDJCQUNGLGtCQUFrQixRQUFsQixDQUEyQixRQUR6QjtBQUFBLGlCQUZOLENBRGtDLEVBS3BDLFFBTG9DLENBSzNCLFFBTDJCLE1BTWhDLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsSUFBbEMsQ0FBdUMsT0FBdkMsS0FBbUQsSUFBcEQsR0FDRyxLQURILEdBQ1csU0FDSix1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLE9BRG5DLEVBRUosUUFGSSxDQVBzQixDQUE3QjtBQUFBLGFBRFI7QUFXRCxxQkFBUyx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLFFBWHhDO0FBWUQsa0JBQU0sd0JBWkw7QUFhRCxpQkFBSyxDQUNELEVBQUMsUUFBUSxlQUFlLGVBQUssSUFBTCxDQUFVLGVBQUssUUFBTCxDQUM5Qix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLElBREYsRUFFOUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxRQUZGLENBQVYsRUFHckIsWUFBWSxRQUNYLENBQUMsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxJQUFsQyxDQUF1QyxPQUF2QyxJQUFrRDtBQUMvQyxrQ0FBYztBQURpQyxpQkFBbkQsRUFFRyxZQUZILEdBRWtCLENBSFAsSUFJWCxLQUpXLEdBSUgsRUFKVCxXQUltQix1QkFBYyxhQUpqQyxhQUhxQixDQUF4QixFQURDLEVBU0gsTUFURyxDQVNLLFFBQVEsQ0FDZCx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLE9BQXZDLElBQWtEO0FBQzlDLDhCQUFjO0FBRGdDLGFBRHBDLEVBSWhCLFlBSmdCLEdBSUQsQ0FKUCxJQUlZLEVBSlosR0FLTixDQUNJLEVBQUMsUUFBUSxTQUFULEVBREosRUFFSTtBQUNJLHdCQUFRLHVCQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBMEIsTUFEdEM7QUFFSSx5QkFBUyx1QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLE9BQTFCLElBQXFDO0FBRmxELGFBRkosQ0FkQyxFQXFCRjtBQUNDLHdCQUFRLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsSUFBbEMsQ0FBdUMsTUFEaEQ7QUFFQyx5QkFBUyx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLE9BQXZDLElBQWtEO0FBRjVELGFBckJFLEVBd0JGLE1BeEJFLENBd0JLLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsSUFBbEMsQ0FBdUMsVUFBdkMsQ0FBa0QsR0FBbEQsQ0FDTixRQURNLENBeEJMO0FBYkosU0FSSDtBQWdERixjQUFNO0FBQ0YscUJBQVMsaUJBQUMsUUFBRDtBQUFBLHVCQUE2QixpQkFBTyxjQUFQLENBQ2xDLHVCQUFjLEtBQWQsQ0FBb0IsSUFBcEIsQ0FBeUIsTUFBekIsQ0FDSSx1QkFBYyxLQUFkLENBQW9CLFdBRHhCLEVBRUUsR0FGRixDQUVNLFVBQUMsaUJBQUQ7QUFBQSwyQkFDRixrQkFBa0IsUUFBbEIsQ0FBMkIsUUFEekI7QUFBQSxpQkFGTixDQURrQyxFQUtwQyxRQUxvQyxDQUszQixRQUwyQixNQU1oQyx1QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLE9BQTFCLEtBQXNDLElBQXZDLEdBQStDLElBQS9DLEdBQ0csU0FBUyx1QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLE9BQW5DLEVBQTRDLFFBQTVDLENBUDhCLENBQTdCO0FBQUEsYUFEUDtBQVNGLHFCQUFTLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsUUFUdkM7QUFVRixrQkFBTSxtQkFWSjtBQVdGLGlCQUFLLENBQ0QsRUFBQyxRQUFRLGVBQWUsZUFBSyxJQUFMLENBQVUsZUFBSyxRQUFMLENBQzlCLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFESSxFQUU5Qix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLFFBRkYsQ0FBVixvQkFHTCx1QkFBYyxhQUhULGFBQXhCLEVBREMsRUFLRCxFQUFDLFFBQVEsU0FBVCxFQUxDLEVBTUQ7QUFDSSx3QkFBUSx1QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLE1BRHRDO0FBRUkseUJBQVMsdUJBQWMsTUFBZCxDQUFxQixJQUFyQixDQUEwQixPQUExQixJQUFxQztBQUZsRCxhQU5DLEVBVUgsTUFWRyxDQVVJLHVCQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBMEIsVUFBMUIsQ0FBcUMsR0FBckMsQ0FBeUMsUUFBekMsQ0FWSjtBQVhIO0FBaERKLEtBcERpQjtBQTRIdkI7QUFDQTtBQUNBO0FBQ0EsV0FBTztBQUNILGlCQUFTLGlCQUFDLFFBQUQ7QUFBQSxtQkFDTCx1QkFBYyxNQUFkLENBQXFCLG1CQUFyQixDQUF5QyxPQUF6QyxLQUFxRCxJQURuQixHQUVsQyx5QkFBeUIsUUFBekIsQ0FGa0MsR0FHbEMsU0FDSSx1QkFBYyxNQUFkLENBQXFCLG1CQUFyQixDQUF5QyxPQUQ3QyxFQUNzRCxRQUR0RCxDQUhLO0FBQUEsU0FETjtBQU1ILGlCQUFTLGlCQUFPLGNBQVAsQ0FBc0IsQ0FDM0IsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxtQkFETCxFQUU3QixNQUY2QixDQUV0Qix1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLGNBRlQsQ0FBdEIsQ0FOTjtBQVNILGNBQU0sb0JBVEg7QUFVSCxhQUFLLENBQ0Q7QUFDSSxvQkFBUSx1QkFBYyxNQUFkLENBQXFCLEtBQXJCLENBQTJCLE1BRHZDO0FBRUkscUJBQVMsdUJBQWMsTUFBZCxDQUFxQixLQUFyQixDQUEyQixPQUEzQixJQUFzQztBQUZuRCxTQURDLEVBS0Q7QUFDSSxvQkFBUSx1QkFBYyxNQUFkLENBQXFCLG1CQUFyQixDQUF5QyxNQURyRDtBQUVJLHFCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsbUJBQXJCLENBQXlDLE9BQXpDLElBQW9EO0FBRmpFLFNBTEMsRUFTRDtBQUNJLG9CQUFRLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsbUJBQWxDLENBQ0gsTUFGVDtBQUdJLHFCQUFTLHFCQUFNLFlBQU4sQ0FBbUIsSUFBbkIsRUFBeUI7QUFDOUIsdUJBQU8sU0FEdUI7QUFFOUIseUJBQVM7QUFBQSwyQkFBb0IsQ0FDekIsNkJBQWM7QUFDViwwREFEVTtBQUVWLDhCQUFNLHVCQUFjLElBQWQsQ0FBbUI7QUFGZixxQkFBZCxDQUR5QixFQUt6Qiw4QkFBZSxFQUFDLFVBQVUsTUFBWCxFQUFmLENBTHlCO0FBTXpCOzs7Ozs7QUFNQSxtREFBZ0IsRUFBQyxXQUFXLEtBQVosRUFBaEIsQ0FaeUIsRUFhekIsMEJBQVcsRUFBQyxLQUFLLFFBQU4sRUFBWCxDQWJ5QixFQWN6Qiw4QkFBZTtBQUNYLGtDQUFVO0FBQUEsbUNBQW9CLHNCQUFZLFVBQ3RDLE9BRHNDLEVBQ3BCLE1BRG9CO0FBQUEsdUNBRXZCLENBQ2YsdUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUE0QixLQUE1QixHQUFvQyxPQUFwQyxHQUNBLE1BRmUsR0FGdUI7QUFBQSw2QkFBWixDQUFwQjtBQUFBLHlCQURDO0FBT1gsK0JBQU8sRUFBQyxtQkFBbUIsMkJBQUMsS0FBRDtBQUFBLHVDQUN2QixlQUFLLElBQUwsQ0FBVSxNQUFNLFVBQWhCLEVBQTRCLGVBQUssUUFBTCxDQUN4Qix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLEtBRFIsRUFFeEIsdUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUE0QixLQUZKLENBQTVCLENBRHVCO0FBQUE7QUFBcEIseUJBUEk7QUFZWCx3Q0FBZ0IsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUNYLG1CQWJNO0FBY1gsb0NBQVksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQztBQWRqQyxxQkFBZixDQWR5QixDQUFwQjtBQUFBO0FBRnFCLGFBQXpCLEVBa0NULHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsbUJBQWxDLENBQ0ssT0FETCxJQUNnQixFQW5DUDtBQUhiLFNBVEMsRUFpREgsTUFqREcsQ0FrREQsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxtQkFBbEMsQ0FBc0QsVUFBdEQsQ0FDSyxHQURMLENBQ1MsUUFEVCxDQWxEQztBQVZGLEtBL0hnQjtBQThMdkI7QUFDQTtBQUNBO0FBQ0EsVUFBTTtBQUNGLGFBQUs7QUFDRCxxQkFBUyxpQkFBQyxRQUFEO0FBQUEsdUJBQ0wsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQUF4QyxLQUFvRCxJQURsQixHQUVsQyxLQUZrQyxHQUdsQyxTQUNJLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FENUMsRUFDcUQsUUFEckQsQ0FISztBQUFBLGFBRFI7QUFNRCxxQkFBUyx1QkFBYyxJQUFkLENBQW1CLElBTjNCO0FBT0Qsa0JBQU0sa0JBUEw7QUFRRCxpQkFBSyxDQUFDO0FBQ0Ysd0JBQVEsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxNQUQ5QztBQUVGLHlCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FBeEMsSUFBbUQ7QUFGMUQsYUFBRCxFQUdGLE1BSEUsQ0FHSyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLFVBQXhDLENBQW1ELEdBQW5ELENBQ04sUUFETSxDQUhMO0FBUkosU0FESDtBQWVGLGFBQUs7QUFDRCxxQkFBUyxpQkFBQyxRQUFEO0FBQUEsdUJBQ0wsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQUF4QyxLQUFvRCxJQURsQixHQUVsQyxLQUZrQyxHQUdsQyxTQUNJLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FENUMsRUFDcUQsUUFEckQsQ0FISztBQUFBLGFBRFI7QUFNRCxxQkFBUyx1QkFBYyxJQUFkLENBQW1CLElBTjNCO0FBT0Qsa0JBQU0sa0JBUEw7QUFRRCxpQkFBSyxDQUFDO0FBQ0Ysd0JBQVEsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxNQUQ5QztBQUVGLHlCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FBeEMsSUFBbUQ7QUFGMUQsYUFBRCxFQUdGLE1BSEUsQ0FHSyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLFVBQXhDLENBQW1ELEdBQW5ELENBQ04sUUFETSxDQUhMO0FBUkosU0FmSDtBQTZCRixhQUFLO0FBQ0QscUJBQVMsaUJBQUMsUUFBRDtBQUFBLHVCQUNMLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FBeEMsS0FBb0QsSUFEbEIsR0FFbEMsS0FGa0MsR0FHbEMsU0FDSSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE9BRDVDLEVBQ3FELFFBRHJELENBSEs7QUFBQSxhQURSO0FBTUQscUJBQVMsdUJBQWMsSUFBZCxDQUFtQixJQU4zQjtBQU9ELGtCQUFNLGtCQVBMO0FBUUQsaUJBQUssQ0FBQztBQUNGLHdCQUFRLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsTUFEOUM7QUFFRix5QkFBUyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE9BQXhDLElBQW1EO0FBRjFELGFBQUQsRUFHRixNQUhFLENBR0ssdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxVQUF4QyxDQUFtRCxHQUFuRCxDQUNOLFFBRE0sQ0FITDtBQVJKLFNBN0JIO0FBMkNGLGNBQU07QUFDRixxQkFBUyxpQkFBQyxRQUFEO0FBQUEsdUJBQ0wsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxJQUFwQyxDQUF5QyxPQUF6QyxLQUFxRCxJQURuQixHQUVsQyxLQUZrQyxHQUdsQyxTQUNJLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsQ0FBeUMsT0FEN0MsRUFDc0QsUUFEdEQsQ0FISztBQUFBLGFBRFA7QUFPRixxQkFBUyx1QkFBYyxJQUFkLENBQW1CLElBUDFCO0FBUUYsa0JBQU0scUJBUko7QUFTRixpQkFBSyxDQUFDO0FBQ0Ysd0JBQVEsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxJQUFwQyxDQUF5QyxNQUQvQztBQUVGLHlCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsQ0FBeUMsT0FBekMsSUFBb0Q7QUFGM0QsYUFBRCxFQUdGLE1BSEUsQ0FHSyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLElBQXBDLENBQXlDLFVBQXpDLENBQW9ELEdBQXBELENBQ04sUUFETSxDQUhMO0FBVEg7QUEzQ0osS0FqTWlCO0FBNFB2QjtBQUNBO0FBQ0EsV0FBTztBQUNILGlCQUFTLGlCQUFDLFFBQUQ7QUFBQSxtQkFDTCx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLEtBQS9CLENBQXFDLE9BQXJDLEtBQWlELElBRGYsR0FFbEMseUJBQXlCLFFBQXpCLENBRmtDLEdBR2xDLFNBQVMsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixLQUEvQixDQUFxQyxPQUE5QyxFQUF1RCxRQUF2RCxDQUhLO0FBQUEsU0FETjtBQUtILGlCQUFTLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsS0FMdEM7QUFNSCxjQUFNLGtDQU5IO0FBT0gsYUFBSyxDQUFDO0FBQ0Ysb0JBQVEsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixLQUEvQixDQUFxQyxNQUQzQztBQUVGLHFCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsS0FBL0IsQ0FBcUMsSUFBckMsSUFBNkM7QUFGcEQsU0FBRCxFQUdGLE1BSEUsQ0FHSyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLEtBQS9CLENBQXFDLFVBQXJDLENBQWdELEdBQWhELENBQ04sUUFETSxDQUhMO0FBUEYsS0E5UGdCO0FBMlF2QjtBQUNBO0FBQ0EsVUFBTTtBQUNGLGlCQUFTLGlCQUFDLFFBQUQ7QUFBQSxtQkFDTCx1QkFBYyxVQUFkLENBQXlCLElBQXpCLENBQThCLFFBQTlCLENBQXVDLFFBQXZDLENBQ0ksZUFBSyxPQUFMLENBQWEsaUJBQU8sV0FBUCxDQUFtQixRQUFuQixDQUFiLENBREosTUFHSSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLE9BQXBDLEtBQWdELElBRDlDLEdBRUYseUJBQXlCLFFBQXpCLENBRkUsR0FHRixTQUNJLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsT0FEeEMsRUFDaUQsUUFEakQsQ0FMSixDQURLO0FBQUEsU0FEUDtBQVNGLGlCQUFTLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsSUFUdkM7QUFVRixjQUFNLElBVko7QUFXRixhQUFLLENBQUM7QUFDRixvQkFBUSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLE1BRDFDO0FBRUYscUJBQVMsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxPQUFwQyxJQUErQztBQUZ0RCxTQUFELEVBR0YsTUFIRSxDQUdLLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsVUFBcEMsQ0FBK0MsR0FBL0MsQ0FBbUQsUUFBbkQsQ0FITDtBQUtUO0FBaEJNLEtBN1FpQixFQUEzQjtBQStSQSxJQUFJLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsbUJBQWhDLEVBQXFEO0FBQ2pELFdBQU8sS0FBUCxDQUFhLEdBQWIsQ0FBaUIsS0FBakI7QUFDQSxXQUFPLEtBQVAsQ0FBYSxHQUFiLEdBQW1CLFFBQVEsV0FBUixDQUFvQixPQUFwQixDQUE0QixFQUFDLEtBQUssT0FBTyxLQUFQLENBQWEsR0FBbkIsRUFBNUIsQ0FBbkI7QUFDSDtBQUNEO0FBQ0E7Ozs7OztBQUNBLHNEQUFzRCx1QkFBYyxPQUFwRTtBQUFBLFlBQVcsbUJBQVg7O0FBQ0ksd0JBQWdCLElBQWhCLG9DQUEwQixLQUFLLFNBQUwsRUFBZ0Isb0JBQW9CLElBQXBCLENBQXlCLE1BQXpDLEVBQ3RCLG9CQUFvQixJQUFwQixDQUF5QixXQURILENBQTFCLGlEQUVNLG9CQUFvQixTQUYxQjtBQURKLEssQ0FJQTs7Ozs7Ozs7Ozs7Ozs7OztBQUNPLElBQU0sc0RBQTRDO0FBQ3JELFVBQU0sSUFEK0M7QUFFckQsV0FBTyx1QkFBYyxLQUFkLENBQW9CLElBRjBCO0FBR3JELGFBQVMsdUJBQWMsSUFBZCxDQUFtQixPQUh5QjtBQUlyRCxhQUFTLHVCQUFjLFdBQWQsQ0FBMEIsSUFKa0I7QUFLckQsZUFBVyx1QkFBYyxXQUFkLENBQTBCLE1BTGdCO0FBTXJEO0FBQ0EsV0FBTyx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBUGE7QUFRckQsZUFBVyx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BUlM7QUFTckQsYUFBUztBQUNMLGVBQU8sdUJBQWMsTUFBZCxDQUFxQixPQUR2QjtBQUVMLHFCQUFhLHVCQUFjLE9BQWQsQ0FBc0Isa0JBRjlCO0FBR0wsb0JBQVksdUJBQWMsVUFBZCxDQUF5QixJQUF6QixDQUE4QixRQUhyQztBQUlMLG9CQUFZLHVCQUFjLE9BQWQsQ0FBc0IsSUFBdEIsQ0FBMkIsYUFKbEM7QUFLTCxtQkFBVyx1QkFBYyxPQUFkLENBQXNCLElBQXRCLENBQTJCLFNBTGpDO0FBTUwsMEJBQWtCLHVCQUFjLFVBQWQsQ0FBeUIsTUFOdEM7QUFPTCxpQkFBUyxpQkFBTyxjQUFQLENBQXNCLHVCQUFjLE1BQWQsQ0FBcUIsY0FBM0MsQ0FQSjtBQVFMLHFCQUFhLHVCQUFjLEtBQWQsQ0FBb0I7QUFSNUIsS0FUNEM7QUFtQnJELG1CQUFlO0FBQ1gsZUFBTyx1QkFBYyxNQUFkLENBQXFCLE9BRGpCO0FBRVgscUJBQWEsdUJBQWMsT0FBZCxDQUFzQixrQkFGeEI7QUFHWCxvQkFBWSx1QkFBYyxNQUFkLENBQXFCLFVBQXJCLENBQWdDLElBSGpDO0FBSVgsb0JBQVksdUJBQWMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixhQUo1QjtBQUtYLG1CQUFXLHVCQUFjLE9BQWQsQ0FBc0IsSUFBdEIsQ0FBMkIsU0FMM0I7QUFNWCwwQkFBa0IsdUJBQWMsTUFBZCxDQUFxQixVQUFyQixDQUFnQyxNQU52QztBQU9YLGlCQUFTLHVCQUFjLE1BQWQsQ0FBcUI7QUFQbkIsS0FuQnNDO0FBNEJyRDtBQUNBO0FBQ0EsWUFBUTtBQUNKLGtCQUFVLGVBQUssUUFBTCxDQUNOLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFEcEIsRUFFTix1QkFBYyxLQUFkLENBQW9CLE9BQXBCLENBQTRCLFVBRnRCLENBRE47QUFJSixzQkFBYyx1QkFBYyxhQUp4QjtBQUtKLGlCQUFTLFdBTEw7QUFNSix1QkFDSSx1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxNQUErQyxXQURwQyxHQUVYLEtBRlcsR0FFSCx1QkFBYyxZQUFkLENBQTJCLElBUm5DO0FBU0osY0FBTSx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBVDVCO0FBVUosb0JBQVksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixNQVZsQztBQVdKLGtCQUFVLHVCQUFjLEtBWHBCO0FBWUosd0JBQWdCO0FBWlosS0E5QjZDO0FBNENyRCxpQkFBYSx1QkFBYyxnQkE1QzBCO0FBNkNyRCxZQUFRLHVCQUFjLGdCQTdDK0I7QUE4Q3JEO0FBQ0EsWUFBUTtBQUNKLGVBQU8sdUJBQWMsTUFBZCxDQUFxQixVQUFyQixDQUFnQyxHQUFoQyxDQUFvQyxVQUN2QyxtQkFEdUMsRUFFMUI7QUFDYixtQkFBTztBQUNILHlCQUFTLGlCQUFDLFFBQUQ7QUFBQSwyQkFBNkIsU0FDbEMsb0JBQW9CLE9BQXBCLElBQStCLE9BREcsRUFDTSxRQUROLENBQTdCO0FBQUEsaUJBRE47QUFHSCx5QkFBUyxvQkFBb0IsT0FBcEIsSUFBK0IsU0FDcEMsb0JBQW9CLE9BRGdCLEVBQ1AsdUJBQWMsSUFBZCxDQUFtQixPQURaLENBQS9CLElBRUosdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQUw1QjtBQU1ILHNCQUFNLElBQUksTUFBSixDQUFXLFNBQ2Isb0JBQW9CLElBRFAsRUFDYSx1QkFBYyxJQUFkLENBQW1CLE9BRGhDLENBQVgsQ0FOSDtBQVFILHFCQUFLLFNBQVMsb0JBQW9CLEdBQTdCO0FBUkYsYUFBUDtBQVVILFNBYk0sRUFhSixNQWJJLENBYUcsQ0FDTixPQUFPLEdBREQsRUFFTixPQUFPLE1BRkQsRUFHTixPQUFPLElBQVAsQ0FBWSxJQUhOLEVBR1ksT0FBTyxJQUFQLENBQVksR0FIeEIsRUFHNkIsT0FBTyxJQUFQLENBQVksSUFIekMsRUFJTixPQUFPLEtBSkQsRUFLTixPQUFPLElBQVAsQ0FBWSxHQUxOLEVBS1csT0FBTyxJQUFQLENBQVksR0FMdkIsRUFLNEIsT0FBTyxJQUFQLENBQVksR0FMeEMsRUFNTixPQUFPLElBQVAsQ0FBWSxJQU5OLEVBT04sT0FBTyxLQVBELEVBUU4sT0FBTyxJQVJELENBYkg7QUFESCxLQS9DNkM7QUF3RXJELFVBQU0sdUJBQWMsZUF4RWlDO0FBeUVyRCxhQUFTO0FBekU0QyxDQUFsRDtBQTJFUCxJQUNJLENBQUMsTUFBTSxPQUFOLENBQWMsdUJBQWMsTUFBZCxDQUFxQiwyQkFBbkMsQ0FBRCxJQUNBLHVCQUFjLE1BQWQsQ0FBcUIsMkJBQXJCLENBQWlELE1BRnJELEVBSUkscUJBQXFCLE1BQXJCLENBQTRCLE9BQTVCLEdBQ0ksdUJBQWMsTUFBZCxDQUFxQiwyQkFEekI7QUFFSixJQUFJLHVCQUFjLGlCQUFsQixFQUFxQztBQUNqQyxZQUFRLElBQVIsQ0FBYSwrQkFBYixFQUE4QyxlQUFLLE9BQUwseUJBQTRCO0FBQ3RFLGVBQU8sSUFEK0QsRUFBNUIsQ0FBOUM7QUFFQSxZQUFRLElBQVIsQ0FBYSw2REFBYjtBQUNBLFlBQVEsSUFBUixDQUFhLDhCQUFiLEVBQTZDLGVBQUssT0FBTCxDQUN6QyxvQkFEeUMsRUFDbkIsRUFBQyxPQUFPLElBQVIsRUFEbUIsQ0FBN0M7QUFFSDtBQUNEO2tCQUNlLG9CO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoid2VicGFja0NvbmZpZ3VyYXRvci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCB0eXBlIHtEb21Ob2RlLCBQbGFpbk9iamVjdCwgUHJvY2VkdXJlRnVuY3Rpb24sIFdpbmRvd30gZnJvbSAnY2xpZW50bm9kZSdcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCB7SlNET00gYXMgRE9NfSBmcm9tICdqc2RvbSdcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHBvc3Rjc3NDU1NuZXh0IGZyb20gJ3Bvc3Rjc3MtY3NzbmV4dCdcbmltcG9ydCBwb3N0Y3NzRm9udFBhdGggZnJvbSAncG9zdGNzcy1mb250cGF0aCdcbmltcG9ydCBwb3N0Y3NzSW1wb3J0IGZyb20gJ3Bvc3Rjc3MtaW1wb3J0J1xuaW1wb3J0IHBvc3Rjc3NTcHJpdGVzIGZyb20gJ3Bvc3Rjc3Mtc3ByaXRlcydcbmltcG9ydCBwb3N0Y3NzVVJMIGZyb20gJ3Bvc3Rjc3MtdXJsJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgd2VicGFjayBmcm9tICd3ZWJwYWNrJ1xuY29uc3QgcGx1Z2lucyA9IHJlcXVpcmUoJ3dlYnBhY2stbG9hZC1wbHVnaW5zJykoKVxuaW1wb3J0IHtSYXdTb3VyY2UgYXMgV2VicGFja1Jhd1NvdXJjZX0gZnJvbSAnd2VicGFjay1zb3VyY2VzJ1xuXG5wbHVnaW5zLkJhYmVsTWluaWZ5ID0gcGx1Z2lucy5iYWJlbE1pbmlmeVxucGx1Z2lucy5IVE1MID0gcGx1Z2lucy5odG1sXG5wbHVnaW5zLkV4dHJhY3RUZXh0ID0gcGx1Z2lucy5leHRyYWN0VGV4dFxucGx1Z2lucy5BZGRBc3NldEhUTUxQbHVnaW4gPSByZXF1aXJlKCdhZGQtYXNzZXQtaHRtbC13ZWJwYWNrLXBsdWdpbicpXG5wbHVnaW5zLk9wZW5Ccm93c2VyID0gcGx1Z2lucy5vcGVuQnJvd3NlclxucGx1Z2lucy5GYXZpY29uID0gcmVxdWlyZSgnZmF2aWNvbnMtd2VicGFjay1wbHVnaW4nKVxucGx1Z2lucy5JbWFnZW1pbiA9IHJlcXVpcmUoJ2ltYWdlbWluLXdlYnBhY2stcGx1Z2luJykuZGVmYXVsdFxucGx1Z2lucy5PZmZsaW5lID0gcmVxdWlyZSgnb2ZmbGluZS1wbHVnaW4nKVxuXG5pbXBvcnQgZWpzTG9hZGVyIGZyb20gJy4vZWpzTG9hZGVyLmNvbXBpbGVkJ1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCB0eXBlIHtcbiAgICBIVE1MQ29uZmlndXJhdGlvbiwgUGx1Z2luQ29uZmlndXJhdGlvbiwgV2VicGFja0NvbmZpZ3VyYXRpb25cbn0gZnJvbSAnLi90eXBlJ1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IGNvbmZpZ3VyYXRpb24gZnJvbSAnLi9jb25maWd1cmF0b3IuY29tcGlsZWQnXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuXG4vLyAvIHJlZ2lvbiBtb25rZXkgcGF0Y2hlc1xuLy8gTW9ua2V5LVBhdGNoIGh0bWwgbG9hZGVyIHRvIHJldHJpZXZlIGh0bWwgbG9hZGVyIG9wdGlvbnMgc2luY2UgdGhlXG4vLyBcIndlYnBhY2staHRtbC1wbHVnaW5cIiBkb2Vzbid0IHByZXNlcnZlIHRoZSBvcmlnaW5hbCBsb2FkZXIgaW50ZXJmYWNlLlxuaW1wb3J0IGh0bWxMb2FkZXJNb2R1bGVCYWNrdXAgZnJvbSAnaHRtbC1sb2FkZXInXG5yZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSgnaHRtbC1sb2FkZXInKV0uZXhwb3J0cyA9IGZ1bmN0aW9uKFxuICAgIC4uLnBhcmFtZXRlcjpBcnJheTxhbnk+XG4pOmFueSB7XG4gICAgVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHRoaXMub3B0aW9ucywgbW9kdWxlLCB0aGlzLm9wdGlvbnMpXG4gICAgcmV0dXJuIGh0bWxMb2FkZXJNb2R1bGVCYWNrdXAuY2FsbCh0aGlzLCAuLi5wYXJhbWV0ZXIpXG59XG4vLyBNb25rZXktUGF0Y2ggbG9hZGVyLXV0aWxzIHRvIGRlZmluZSB3aGljaCB1cmwgaXMgYSBsb2NhbCByZXF1ZXN0LlxuaW1wb3J0IGxvYWRlclV0aWxzTW9kdWxlQmFja3VwIGZyb20gJ2xvYWRlci11dGlscydcbmNvbnN0IGxvYWRlclV0aWxzSXNVcmxSZXF1ZXN0QmFja3VwOih1cmw6c3RyaW5nKSA9PiBib29sZWFuID1cbiAgICBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cC5pc1VybFJlcXVlc3RcbnJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKCdsb2FkZXItdXRpbHMnKV0uZXhwb3J0cy5pc1VybFJlcXVlc3QgPSAoXG4gICAgdXJsOnN0cmluZywgLi4uYWRkaXRpb25hbFBhcmFtZXRlcjpBcnJheTxhbnk+XG4pOmJvb2xlYW4gPT4ge1xuICAgIGlmICh1cmwubWF0Y2goL15bYS16XSs6LisvKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIGxvYWRlclV0aWxzSXNVcmxSZXF1ZXN0QmFja3VwLmFwcGx5KFxuICAgICAgICBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cCwgW3VybF0uY29uY2F0KGFkZGl0aW9uYWxQYXJhbWV0ZXIpKVxufVxuLy8gLyBlbmRyZWdpb25cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGluaXRpYWxpc2F0aW9uXG4vLyAvIHJlZ2lvbiBkZXRlcm1pbmUgbGlicmFyeSBuYW1lXG5sZXQgbGlicmFyeU5hbWU6c3RyaW5nXG5pZiAoJ2xpYnJhcnlOYW1lJyBpbiBjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24ubGlicmFyeU5hbWUpXG4gICAgbGlicmFyeU5hbWUgPSBjb25maWd1cmF0aW9uLmxpYnJhcnlOYW1lXG5lbHNlIGlmIChPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkKS5sZW5ndGggPiAxKVxuICAgIGxpYnJhcnlOYW1lID0gJ1tuYW1lXSdcbmVsc2Uge1xuICAgIGxpYnJhcnlOYW1lID0gY29uZmlndXJhdGlvbi5uYW1lXG4gICAgaWYgKGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LnNlbGYgPT09ICd2YXInKVxuICAgICAgICBsaWJyYXJ5TmFtZSA9IFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKGxpYnJhcnlOYW1lKVxufVxuLy8gLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIHBsdWdpbnNcbmNvbnN0IHBsdWdpbkluc3RhbmNlczpBcnJheTxPYmplY3Q+ID0gW1xuICAgIG5ldyB3ZWJwYWNrLk5vRW1pdE9uRXJyb3JzUGx1Z2luKCksXG4gICAgbmV3IHdlYnBhY2sub3B0aW1pemUuT2NjdXJyZW5jZU9yZGVyUGx1Z2luKHRydWUpXG5dXG5pZiAoY29uZmlndXJhdGlvbi5kZWJ1ZylcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5OYW1lZE1vZHVsZXNQbHVnaW4oKSlcbi8vIC8vIHJlZ2lvbiBkZWZpbmUgbW9kdWxlcyB0byBpZ25vcmVcbmZvciAoY29uc3QgaWdub3JlUGF0dGVybjpzdHJpbmcgb2YgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaWdub3JlUGF0dGVybilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5JZ25vcmVQbHVnaW4obmV3IFJlZ0V4cChpZ25vcmVQYXR0ZXJuKSkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBkZWZpbmUgbW9kdWxlcyB0byByZXBsYWNlXG5mb3IgKGNvbnN0IHNvdXJjZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbClcbiAgICBpZiAoY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbC5oYXNPd25Qcm9wZXJ0eShzb3VyY2UpKSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaDpSZWdFeHAgPSBuZXcgUmVnRXhwKHNvdXJjZSlcbiAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suTm9ybWFsTW9kdWxlUmVwbGFjZW1lbnRQbHVnaW4oXG4gICAgICAgICAgICBzZWFyY2gsIChyZXNvdXJjZTp7cmVxdWVzdDpzdHJpbmd9KTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5yZXF1ZXN0ID0gcmVzb3VyY2UucmVxdWVzdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gsIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWxbc291cmNlXSlcbiAgICAgICAgICAgIH0pKVxuICAgIH1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGdlbmVyYXRlIGh0bWwgZmlsZVxubGV0IGh0bWxBdmFpbGFibGU6Ym9vbGVhbiA9IGZhbHNlXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGQ6ZGxsJylcbiAgICBmb3IgKGxldCBodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbiBvZiBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwpXG4gICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKSkge1xuICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuSFRNTChUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICAgICAge30sIGh0bWxDb25maWd1cmF0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5yZXF1ZXN0fSkpKVxuICAgICAgICAgICAgaHRtbEF2YWlsYWJsZSA9IHRydWVcbiAgICAgICAgfVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgZmF2aWNvbnNcbmlmIChodG1sQXZhaWxhYmxlICYmIGNvbmZpZ3VyYXRpb24uZmF2aWNvbiAmJiBUb29scy5pc0ZpbGVTeW5jKFxuICAgIGNvbmZpZ3VyYXRpb24uZmF2aWNvbi5sb2dvXG4pKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkZhdmljb24oY29uZmlndXJhdGlvbi5mYXZpY29uKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIHByb3ZpZGUgb2ZmbGluZSBmdW5jdGlvbmFsaXR5XG5pZiAoaHRtbEF2YWlsYWJsZSAmJiBjb25maWd1cmF0aW9uLm9mZmxpbmUpIHtcbiAgICBpZiAoIVsnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkpXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpQbGFpbk9iamVjdCBvZiBbXG4gICAgICAgICAgICBbJ2Nhc2NhZGluZ1N0eWxlU2hlZXQnLCAnY3NzJ10sXG4gICAgICAgICAgICBbJ2phdmFTY3JpcHQnLCAnanMnXVxuICAgICAgICBdKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5QbGFjZVt0eXBlWzBdXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXM6QXJyYXk8c3RyaW5nPiA9IE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2VbdHlwZVswXV0pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lOnN0cmluZyBvZiBtYXRjaGVzKVxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm9mZmxpbmUuZXhjbHVkZXMucHVzaChwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldFt0eXBlWzBdXVxuICAgICAgICAgICAgICAgICAgICApICsgYCR7bmFtZX0uJHt0eXBlWzFdfT8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09KmApXG4gICAgICAgICAgICB9XG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuT2ZmbGluZShjb25maWd1cmF0aW9uLm9mZmxpbmUpKVxufVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gb3BlbnMgYnJvd3NlciBhdXRvbWF0aWNhbGx5XG5pZiAoY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5vcGVuQnJvd3NlciAmJiAoaHRtbEF2YWlsYWJsZSAmJiBbXG4gICAgJ3NlcnZlJywgJ3Rlc3Q6YnJvd3Nlcidcbl0uaW5jbHVkZXMoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKSkpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuT3BlbkJyb3dzZXIoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZGV2ZWxvcG1lbnQub3BlbkJyb3dzZXIpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gcHJvdmlkZSBidWlsZCBlbnZpcm9ubWVudFxuaWYgKGNvbmZpZ3VyYXRpb24uYnVpbGQuZGVmaW5pdGlvbnMpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGVmaW5lUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLmRlZmluaXRpb25zKSlcbmlmIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcm92aWRlKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLlByb3ZpZGVQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByb3ZpZGUpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gbW9kdWxlcy9hc3NldHNcbi8vIC8vLyByZWdpb24gcGVyZm9ybSBqYXZhU2NyaXB0IG1pbmlmaWNhdGlvbi9vcHRpbWlzYXRpb25cbmlmIChcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkgJiZcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlXG4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goT2JqZWN0LmtleXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeS5idW5kbGVcbiAgICApLmxlbmd0aCA/XG4gICAgICAgIG5ldyBwbHVnaW5zLkJhYmVsTWluaWZ5KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5LmJ1bmRsZS50cmFuc2Zvcm0gfHwge30sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlLnBsdWdpbiB8fCB7fSxcbiAgICAgICAgKSA6IG5ldyBwbHVnaW5zLkJhYmVsTWluaWZ5KCkpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGFwcGx5IG1vZHVsZSBwYXR0ZXJuXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgIGNvbXBpbGVyLnBsdWdpbignZW1pdCcsIChcbiAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcmVxdWVzdDpzdHJpbmcgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgaWYgKGNvbXBpbGF0aW9uLmFzc2V0cy5oYXNPd25Qcm9wZXJ0eShyZXF1ZXN0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IHJlcXVlc3QucmVwbGFjZSgvXFw/W14/XSskLywgJycpXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgICAgICBpZiAodHlwZSAmJiBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXSAmJiAhKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAuZXhjbHVkZUZpbGVQYXRoUmVndWxhckV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICApKS50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2U6P3N0cmluZyA9IGNvbXBpbGF0aW9uLmFzc2V0c1tyZXF1ZXN0XS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbcmVxdWVzdF0gPSBuZXcgV2VicGFja1Jhd1NvdXJjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXS5wYXR0ZXJuLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9cXHsxXFx9L2csIHNvdXJjZS5yZXBsYWNlKC9cXCQvZywgJyQkJCcpKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKClcbiAgICB9KVxufX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGluLXBsYWNlIGNvbmZpZ3VyZWQgYXNzZXRzIGluIHRoZSBtYWluIGh0bWwgZmlsZVxuaWYgKGh0bWxBdmFpbGFibGUgJiYgIVsnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4pKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKHthcHBseTogKGNvbXBpbGVyOk9iamVjdCk6dm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb21waWxlci5wbHVnaW4oJ2NvbXBpbGF0aW9uJywgKGNvbXBpbGF0aW9uOk9iamVjdCk6dm9pZCA9PlxuICAgICAgICAgICAgY29tcGlsYXRpb24ucGx1Z2luKFxuICAgICAgICAgICAgICAgICdodG1sLXdlYnBhY2stcGx1Z2luLWFmdGVyLWh0bWwtcHJvY2Vzc2luZycsIGFzeW5jIChcbiAgICAgICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgKTpQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgICAgICApLmxlbmd0aCB8fCBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQpLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDp7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6c3RyaW5nLCBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IGF3YWl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5pblBsYWNlQ1NTQW5kSmF2YVNjcmlwdEFzc2V0UmVmZXJlbmNlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLmh0bWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sID0gcmVzdWx0LmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZS5jb25jYXQocmVzdWx0LmZpbGVQYXRoc1RvUmVtb3ZlKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBodG1sUGx1Z2luRGF0YSlcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgY29tcGlsZXIucGx1Z2luKCdhZnRlci1lbWl0JywgYXN5bmMgKFxuICAgICAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOlByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAgICAgbGV0IHByb21pc2VzOkFycmF5PFByb21pc2U8dm9pZD4+ID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgcGF0aDpzdHJpbmcgb2YgZmlsZVBhdGhzVG9SZW1vdmUpXG4gICAgICAgICAgICAgICAgaWYgKGF3YWl0IFRvb2xzLmlzRmlsZShwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZTpGdW5jdGlvbik6dm9pZCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmsocGF0aCwgKGVycm9yOj9FcnJvcik6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpKVxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgICBwcm9taXNlcyA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFtcbiAgICAgICAgICAgICAgICAnamF2YVNjcmlwdCcsICdjYXNjYWRpbmdTdHlsZVNoZWV0J1xuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogV29ya2Fyb3VuZCBzaW5jZSBmbG93IG1pc3NlcyB0aGUgdGhyZWUgcGFyYW1ldGVyXG4gICAgICAgICAgICAgICAgICAgIFwicmVhZGRpclwiIHNpZ25hdHVyZS5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICk6dm9pZCA9PiAoZmlsZVN5c3RlbS5yZWFkZGlyOkZ1bmN0aW9uKShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldFt0eXBlXSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZyxcbiAgICAgICAgICAgICAgICAgICAgKGVycm9yOj9FcnJvciwgZmlsZXM6QXJyYXk8c3RyaW5nPik6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ucm1kaXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0sIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICB9KSkpXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfSlcbiAgICB9fSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gcmVtb3ZlIGNodW5rcyBpZiBhIGNvcnJlc3BvbmRpbmcgZGxsIHBhY2thZ2UgZXhpc3RzXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGQ6ZGxsJylcbiAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZClcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgKSkge1xuICAgICAgICAgICAgY29uc3QgbWFuaWZlc3RGaWxlUGF0aDpzdHJpbmcgPVxuICAgICAgICAgICAgICAgIGAke2NvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZX0vJHtjaHVua05hbWV9LmAgK1xuICAgICAgICAgICAgICAgIGBkbGwtbWFuaWZlc3QuanNvbmBcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIG1hbmlmZXN0RmlsZVBhdGhcbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gSGVscGVyLnJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgICksIHsnW25hbWVdJzogY2h1bmtOYW1lfSlcbiAgICAgICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5BZGRBc3NldEhUTUxQbHVnaW4oe1xuICAgICAgICAgICAgICAgICAgICBmaWxlcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVTb3VyY2VtYXA6IFRvb2xzLmlzRmlsZVN5bmMoYCR7ZmlsZVBhdGh9Lm1hcGApXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGxsUmVmZXJlbmNlUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIG1hbmlmZXN0OiByZXF1aXJlKFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3RGaWxlUGF0aCl9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBnZW5lcmF0ZSBjb21tb24gY2h1bmtzXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGQ6ZGxsJylcbiAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgb2YgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uY29tbW9uQ2h1bmtJRHMpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpXG4gICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5vcHRpbWl6ZS5Db21tb25zQ2h1bmtQbHVnaW4oe1xuICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgIG1pbkNodW5rczogSW5maW5pdHksXG4gICAgICAgICAgICAgICAgbmFtZTogY2h1bmtOYW1lLFxuICAgICAgICAgICAgICAgIG1pblNpemU6IDBcbiAgICAgICAgICAgIH0pKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBtYXJrIGVtcHR5IGphdmFTY3JpcHQgbW9kdWxlcyBhcyBkdW1teVxuaWYgKCFjb25maWd1cmF0aW9uLm5lZWRlZC5qYXZhU2NyaXB0KVxuICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0ID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmphdmFTY3JpcHQsICcuX19kdW1teV9fLmNvbXBpbGVkLmpzJylcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gZXh0cmFjdCBjYXNjYWRpbmcgc3R5bGUgc2hlZXRzXG5pZiAoY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuRXh0cmFjdFRleHQoe1xuICAgICAgICBhbGxDaHVua3M6IHRydWUsIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQpXG4gICAgfSkpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHBlcmZvcm1zIGltcGxpY2l0IGV4dGVybmFsIGxvZ2ljXG5pZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwubW9kdWxlcyA9PT0gJ19faW1wbGljaXRfXycpXG4gICAgLypcbiAgICAgICAgV2Ugb25seSB3YW50IHRvIHByb2Nlc3MgbW9kdWxlcyBmcm9tIGxvY2FsIGNvbnRleHQgaW4gbGlicmFyeSBtb2RlLFxuICAgICAgICBzaW5jZSBhIGNvbmNyZXRlIHByb2plY3QgdXNpbmcgdGhpcyBsaWJyYXJ5IHNob3VsZCBjb21iaW5lIGFsbCBhc3NldHNcbiAgICAgICAgKGFuZCBkZWR1cGxpY2F0ZSB0aGVtKSBmb3Igb3B0aW1hbCBidW5kbGluZyByZXN1bHRzLiBOT1RFOiBPbmx5IG5hdGl2ZVxuICAgICAgICBqYXZhU2NyaXB0IGFuZCBqc29uIG1vZHVsZXMgd2lsbCBiZSBtYXJrZWQgYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAqL1xuICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMgPSAoXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nLCByZXF1ZXN0OnN0cmluZywgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICApOnZvaWQgPT4ge1xuICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5yZXBsYWNlKC9eISsvLCAnJylcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgcmVxdWVzdCA9IHBhdGgucmVsYXRpdmUoY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIHJlcXVlc3QpXG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2ZcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lcylcbiAgICAgICAgKVxuICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoZmlsZVBhdGgubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgbGV0IHJlc29sdmVkUmVxdWVzdDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUV4dGVybmFsUmVxdWVzdChcbiAgICAgICAgICAgIHJlcXVlc3QsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBjb250ZXh0LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aFxuICAgICAgICAgICAgKSkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aClcbiAgICAgICAgICAgICksIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLCBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuaW1wbGljaXQucGF0dGVybi5pbmNsdWRlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuaW1wbGljaXQucGF0dGVybi5leGNsdWRlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmV4dGVybmFsTGlicmFyeS5ub3JtYWwsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuZXh0ZXJuYWxMaWJyYXJ5LmR5bmFtaWMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nKVxuICAgICAgICBpZiAocmVzb2x2ZWRSZXF1ZXN0KSB7XG4gICAgICAgICAgICBpZiAoWyd2YXInLCAndW1kJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWxcbiAgICAgICAgICAgICkgJiYgcmVxdWVzdCBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCA9IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RdXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwgPT09ICd2YXInKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCA9IFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsICcwLTlhLXpBLVpfJFxcXFwuJylcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhcbiAgICAgICAgICAgICAgICBudWxsLCByZXNvbHZlZFJlcXVlc3QsIGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpXG4gICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBidWlsZCBkbGwgcGFja2FnZXNcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnKSB7XG4gICAgbGV0IGRsbENodW5rSURFeGlzdHM6Ym9vbGVhbiA9IGZhbHNlXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZGxsQ2h1bmtJRHMuaW5jbHVkZXMoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBkbGxDaHVua0lERXhpc3RzID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICBpZiAoZGxsQ2h1bmtJREV4aXN0cykge1xuICAgICAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV1ETExQYWNrYWdlJ1xuICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EbGxQbHVnaW4oe1xuICAgICAgICAgICAgcGF0aDogYCR7Y29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlfS9bbmFtZV0uZGxsLW1hbmlmZXN0Lmpzb25gLFxuICAgICAgICAgICAgbmFtZTogbGlicmFyeU5hbWVcbiAgICAgICAgfSkpXG4gICAgfSBlbHNlXG4gICAgICAgIGNvbnNvbGUud2FybignTm8gZGxsIGNodW5rIGlkIGZvdW5kLicpXG59XG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBhcHBseSBmaW5hbCBkb20vamF2YVNjcmlwdCBtb2RpZmljYXRpb25zL2ZpeGVzXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4gY29tcGlsZXIucGx1Z2luKFxuICAgICdjb21waWxhdGlvbicsIChjb21waWxhdGlvbjpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICBjb21waWxhdGlvbi5wbHVnaW4oJ2h0bWwtd2VicGFjay1wbHVnaW4tYWx0ZXItYXNzZXQtdGFncycsIChcbiAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhOlBsYWluT2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCB0YWdzOkFycmF5PFBsYWluT2JqZWN0PiBvZiBbXG4gICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEuYm9keSwgaHRtbFBsdWdpbkRhdGEuaGVhZFxuICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWc6UGxhaW5PYmplY3Qgb2YgdGFncykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoL15cXC5fX2R1bW15X18oXFwuLiopPyQvLnRlc3QocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5hdHRyaWJ1dGVzLnNyYyB8fCB0YWcuYXR0cmlidXRlcy5ocmVmIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFncy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBhc3NldHM6QXJyYXk8c3RyaW5nPiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEucGx1Z2luLmFzc2V0SnNvbilcbiAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0UmVxdWVzdDpzdHJpbmcgb2YgYXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKC9eXFwuX19kdW1teV9fKFxcLi4qKT8kLy50ZXN0KHBhdGguYmFzZW5hbWUoYXNzZXRSZXF1ZXN0KSkpXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEucGx1Z2luLmFzc2V0SnNvbiA9IEpTT04uc3RyaW5naWZ5KGFzc2V0cylcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICB9KVxuICAgICAgICBjb21waWxhdGlvbi5wbHVnaW4oJ2h0bWwtd2VicGFjay1wbHVnaW4tYWZ0ZXItaHRtbC1wcm9jZXNzaW5nJywgKFxuICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgICAgICk6V2luZG93ID0+IHtcbiAgICAgICAgICAgIGxldCB3aW5kb3c6V2luZG93XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdyA9IChuZXcgRE9NKGh0bWxQbHVnaW5EYXRhLmh0bWwucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLzwlL2csICcjIysjKyMrIyMnXG4gICAgICAgICAgICAgICAgKS5yZXBsYWNlKC8lPi9nLCAnIyMtIy0jLSMjJykpKS53aW5kb3dcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBodG1sUGx1Z2luRGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxpbmthYmxlczp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7XG4gICAgICAgICAgICAgICAgc2NyaXB0OiAnc3JjJywgbGluazogJ2hyZWYnfVxuICAgICAgICAgICAgZm9yIChjb25zdCB0YWdOYW1lOnN0cmluZyBpbiBsaW5rYWJsZXMpXG4gICAgICAgICAgICAgICAgaWYgKGxpbmthYmxlcy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGFnTmFtZX1bJHtsaW5rYWJsZXNbdGFnTmFtZV19Kj1cIj9gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVwiXWApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogUmVtb3Zpbmcgc3ltYm9scyBhZnRlciBhIFwiJlwiIGluIGhhc2ggc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgbmVjZXNzYXJ5IHRvIG1hdGNoIHRoZSBnZW5lcmF0ZWQgcmVxdWVzdCBzdHJpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gb2ZmbGluZSBwbHVnaW4uXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2FibGVzW3RhZ05hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuZ2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZXNbdGFnTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYChcXFxcPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1teJl0rKS4qJCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCAnJDEnKSlcbiAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLmh0bWwgPSBodG1sUGx1Z2luRGF0YS5odG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgL14oXFxzKjwhZG9jdHlwZSBbXj5dKz8+XFxzKilbXFxzXFxTXSokL2ksICckMSdcbiAgICAgICAgICAgICkgKyB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvIyNcXCsjXFwrI1xcKyMjL2csICc8JSdcbiAgICAgICAgICAgICAgICApLnJlcGxhY2UoLyMjLSMtIy0jIy9nLCAnJT4nKVxuICAgICAgICAgICAgLy8gIHJlZ2lvbiBwb3N0IGNvbXBpbGF0aW9uXG4gICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxGaWxlU3BlY2lmaWNhdGlvbjpQbGFpbk9iamVjdCBvZlxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgaHRtbEZpbGVTcGVjaWZpY2F0aW9uLmZpbGVuYW1lID09PVxuICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5wbHVnaW4ub3B0aW9ucy5maWxlbmFtZVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVyQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbEZpbGVTcGVjaWZpY2F0aW9uLnRlbXBsYXRlLnVzZVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnb3B0aW9ucycpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29tcGlsZVN0ZXBzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zLmNvbXBpbGVTdGVwc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sID0gZWpzTG9hZGVyLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IGh0bWxGaWxlU3BlY2lmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50ZW1wbGF0ZS5wb3N0Q29tcGlsZVN0ZXBzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19KSkoaHRtbFBsdWdpbkRhdGEuaHRtbClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICB9KVxuICAgIH0pfSlcbi8qXG4gICAgTk9URTogVGhlIHVtZCBtb2R1bGUgZXhwb3J0IGRvZXNuJ3QgaGFuZGxlIGNhc2VzIHdoZXJlIHRoZSBwYWNrYWdlIG5hbWVcbiAgICBkb2Vzbid0IG1hdGNoIGV4cG9ydGVkIGxpYnJhcnkgbmFtZS4gVGhpcyBwb3N0IHByb2Nlc3NpbmcgZml4ZXMgdGhpcyBpc3N1ZS5cbiovXG5pZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwuc3RhcnRzV2l0aCgndW1kJykpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoY29tcGlsZXI6T2JqZWN0KTp2b2lkID0+IGNvbXBpbGVyLnBsdWdpbihcbiAgICAgICAgJ2VtaXQnLCAoY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvbik6dm9pZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBidW5kbGVOYW1lOnN0cmluZyA9IChcbiAgICAgICAgICAgICAgICB0eXBlb2YgbGlicmFyeU5hbWUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICApID8gbGlicmFyeU5hbWUgOiBsaWJyYXJ5TmFtZVswXVxuICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFJlcXVlc3Q6c3RyaW5nIGluIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0cy5oYXNPd25Qcm9wZXJ0eShhc3NldFJlcXVlc3QpICYmXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0UmVxdWVzdC5yZXBsYWNlKC8oW14/XSspXFw/LiokLywgJyQxJykuZW5kc1dpdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmphdmFTY3JpcHQub3V0cHV0RXh0ZW5zaW9uKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc291cmNlOnN0cmluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbYXNzZXRSZXF1ZXN0XS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQ6c3RyaW5nIGluXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oYXNPd25Qcm9wZXJ0eShyZXBsYWNlbWVudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnKHJlcXVpcmVcXFxcKClbXCJcXCddJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFsaWFzZXNbcmVwbGFjZW1lbnRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1tcIlxcJ10oXFxcXCkpJywgJ2cnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIGAkMScke3JlcGxhY2VtZW50fSckMmApLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKCcoZGVmaW5lXFxcXChbXCJcXCddJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidW5kbGVOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICdbXCJcXCddLCBcXFxcWy4qKVtcIlxcJ10nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNlc1tyZXBsYWNlbWVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1tcIlxcJ10oLipcXFxcXSwgZmFjdG9yeVxcXFwpOyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCBgJDEnJHtyZXBsYWNlbWVudH0nJDJgKVxuICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlID0gc291cmNlLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnKHJvb3RcXFxcWylbXCJcXCddJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidW5kbGVOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICdbXCJcXCddKFxcXFxdID0gKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICksIGAkMSdgICsgVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRWYXJpYWJsZU5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVuZGxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSArIGAnJDJgKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0UmVxdWVzdF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBXZWJwYWNrUmF3U291cmNlKHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfSl9KVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gYWRkIGF1dG9tYXRpYyBpbWFnZSBjb21wcmVzc2lvblxuLy8gTk9URTogVGhpcyBwbHVnaW4gc2hvdWxkIGJlIGxvYWRlZCBhdCBsYXN0IHRvIGVuc3VyZSB0aGF0IGFsbCBlbWl0dGVkIGltYWdlc1xuLy8gcmFuIHRocm91Z2guXG5wbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5JbWFnZW1pbihcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuY29udGVudCkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBjb250ZXh0IHJlcGxhY2VtZW50c1xuZm9yIChcbiAgICBjb25zdCBjb250ZXh0UmVwbGFjZW1lbnQ6QXJyYXk8c3RyaW5nPiBvZlxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5jb250ZXh0XG4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suQ29udGV4dFJlcGxhY2VtZW50UGx1Z2luKFxuICAgICAgICAuLi5jb250ZXh0UmVwbGFjZW1lbnQubWFwKCh2YWx1ZTpzdHJpbmcpOmFueSA9PiAobmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgJ2NvbmZpZ3VyYXRpb24nLCAnX19kaXJuYW1lJywgJ19fZmlsZW5hbWUnLCBgcmV0dXJuICR7dmFsdWV9YFxuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgKSkoY29uZmlndXJhdGlvbiwgX19kaXJuYW1lLCBfX2ZpbGVuYW1lKSkpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gbG9hZGVyIGhlbHBlclxuY29uc3QgaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzOkZ1bmN0aW9uID0gKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgZmlsZVBhdGggPSBIZWxwZXIuc3RyaXBMb2FkZXIoZmlsZVBhdGgpXG4gICAgcmV0dXJuIEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpKVxufVxuY29uc3QgbG9hZGVyOk9iamVjdCA9IHt9XG5jb25zdCBzY29wZTpPYmplY3QgPSB7XG4gICAgY29uZmlndXJhdGlvbixcbiAgICBsb2FkZXIsXG4gICAgaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzXG59XG5jb25zdCBldmFsdWF0ZTpGdW5jdGlvbiA9IChjb2RlOnN0cmluZywgZmlsZVBhdGg6c3RyaW5nKTphbnkgPT4gKG5ldyBGdW5jdGlvbihcbiAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAnZmlsZVBhdGgnLCAuLi5PYmplY3Qua2V5cyhzY29wZSksIGByZXR1cm4gJHtjb2RlfWBcbi8vIElnbm9yZVR5cGVDaGVja1xuKSkoZmlsZVBhdGgsIC4uLk9iamVjdC52YWx1ZXMoc2NvcGUpKVxuVG9vbHMuZXh0ZW5kT2JqZWN0KGxvYWRlciwge1xuICAgIC8vIENvbnZlcnQgdG8gY29tcGF0aWJsZSBuYXRpdmUgd2ViIHR5cGVzLlxuICAgIC8vIHJlZ2lvbiBnZW5lcmljIHRlbXBsYXRlXG4gICAgZWpzOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICApLm1hcCgoaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24pOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICApLmluY2x1ZGVzKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgKChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmV4Y2x1ZGUgPT09IG51bGwpID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmV4Y2x1ZGUsIGZpbGVQYXRoKSksXG4gICAgICAgIGluY2x1ZGU6IEhlbHBlci5ub3JtYWxpemVQYXRocyhbXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmJhc2VcbiAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUubG9jYXRpb25zLmRpcmVjdG9yeVBhdGhzKSksXG4gICAgICAgIHRlc3Q6IC9eKD8hLitcXC5odG1sXFwuZWpzJCkuK1xcLmVqcyQvaSxcbiAgICAgICAgdXNlOiBbXG4gICAgICAgICAgICB7bG9hZGVyOiAnZmlsZT9uYW1lPVtwYXRoXVtuYW1lXScgKyAoQm9vbGVhbihcbiAgICAgICAgICAgICAgICAoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5vcHRpb25zIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZVN0ZXBzOiAyXG4gICAgICAgICAgICAgICAgfSkuY29tcGlsZVN0ZXBzICUgMlxuICAgICAgICAgICAgKSA/ICcuanMnIDogJycpICsgYD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdYH0sXG4gICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gc2NyaXB0XG4gICAgc2NyaXB0OiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICApID8gaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5leGNsdWRlLCBmaWxlUGF0aFxuICAgICAgICAgICAgKSxcbiAgICAgICAgaW5jbHVkZTogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuamF2YVNjcmlwdFxuICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHMpKSxcbiAgICAgICAgdGVzdDogL1xcLmpzKD86XFw/LiopPyQvaSxcbiAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5sb2FkZXIsXG4gICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5vcHRpb25zIHx8IHt9XG4gICAgICAgIH1dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBodG1sIHRlbXBsYXRlXG4gICAgaHRtbDoge1xuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIG9ubHkgZm9yIHRoZSBtYWluIGVudHJ5IHRlbXBsYXRlLlxuICAgICAgICBtYWluOiB7XG4gICAgICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKCdeJyArIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoXG4gICAgICAgICAgICApICsgJyg/OlxcXFw/LiopPyQnKSxcbiAgICAgICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS51c2VcbiAgICAgICAgfSxcbiAgICAgICAgZWpzOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgICAgICApLmluY2x1ZGVzKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgICAgICgoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwuZXhjbHVkZSA9PT0gbnVsbCkgP1xuICAgICAgICAgICAgICAgICAgICBmYWxzZSA6IGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwuZXhjbHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoKSksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LnRlbXBsYXRlLFxuICAgICAgICAgICAgdGVzdDogL1xcLmh0bWxcXC5lanMoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbXG4gICAgICAgICAgICAgICAge2xvYWRlcjogJ2ZpbGU/bmFtZT0nICsgcGF0aC5qb2luKHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICksICdbbmFtZV0nICsgKEJvb2xlYW4oXG4gICAgICAgICAgICAgICAgICAgIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICAgICAgICAgICAgICB9KS5jb21waWxlU3RlcHMgJSAyXG4gICAgICAgICAgICAgICAgKSA/ICcuanMnIDogJycpICsgYD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdYCl9XG4gICAgICAgICAgICBdLmNvbmNhdCgoQm9vbGVhbigoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkuY29tcGlsZVN0ZXBzICUgMikgPyBbXSA6XG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApLCB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSkuY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgaHRtbDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICAgICAgKS5pbmNsdWRlcyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuZXhjbHVkZSA9PT0gbnVsbCkgPyB0cnVlIDpcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC50ZW1wbGF0ZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5odG1sKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW1xuICAgICAgICAgICAgICAgIHtsb2FkZXI6ICdmaWxlP25hbWU9JyArIHBhdGguam9pbihwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQudGVtcGxhdGVcbiAgICAgICAgICAgICAgICApLCBgW25hbWVdLltleHRdPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gKX0sXG4gICAgICAgICAgICAgICAge2xvYWRlcjogJ2V4dHJhY3QnfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuYWRkaXRpb25hbC5tYXAoZXZhbHVhdGUpKVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyBMb2FkIGRlcGVuZGVuY2llcy5cbiAgICAvLyByZWdpb24gc3R5bGVcbiAgICBzdHlsZToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICApID8gaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0LmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgaW5jbHVkZTogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHMpKSxcbiAgICAgICAgdGVzdDogL1xcLnM/Y3NzKD86XFw/LiopPyQvaSxcbiAgICAgICAgdXNlOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5zdHlsZS5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuc3R5bGUub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgIC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnQ6ICdwb3N0Y3NzJyxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luczogKCk6QXJyYXk8T2JqZWN0PiA9PiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzSW1wb3J0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGREZXBlbmRlbmN5VG86IHdlYnBhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0NTU25leHQoe2Jyb3dzZXJzOiAnPiAwJSd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogQ2hlY2tpbmcgcGF0aCBkb2Vzbid0IHdvcmsgaWYgZm9udHMgYXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZCBpbiBsaWJyYXJpZXMgcHJvdmlkZWQgaW4gYW5vdGhlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uIHRoYW4gdGhlIHByb2plY3QgaXRzZWxmIGxpa2UgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJub2RlX21vZHVsZXNcIiBmb2xkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0ZvbnRQYXRoKHtjaGVja1BhdGg6IGZhbHNlfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzVVJMKHt1cmw6ICdyZWJhc2UnfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzU3ByaXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnk6ICgpOlByb21pc2U8bnVsbD4gPT4gbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOlByb21pc2U8bnVsbD4gPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuaW1hZ2UgPyByZXNvbHZlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob29rczoge29uU2F2ZVNwcml0ZXNoZWV0OiAoaW1hZ2U6T2JqZWN0KTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKGltYWdlLnNwcml0ZVBhdGgsIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmltYWdlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlc2hlZXRQYXRoOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXNjYWRpbmdTdHlsZVNoZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZVBhdGg6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgIC5vcHRpb25zIHx8IHt9KVxuICAgICAgICAgICAgfVxuICAgICAgICBdLmNvbmNhdChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0LmFkZGl0aW9uYWxcbiAgICAgICAgICAgICAgICAubWFwKGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIE9wdGltaXplIGxvYWRlZCBhc3NldHMuXG4gICAgLy8gcmVnaW9uIGZvbnRcbiAgICBmb250OiB7XG4gICAgICAgIGVvdDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5lb3QoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3Qub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHN2Zzoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5zdmcoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHR0Zjoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC50dGYoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHdvZmY6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5leGNsdWRlLCBmaWxlUGF0aFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC53b2ZmMj8oPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBpbWFnZVxuICAgIGltYWdlOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgKSA/IGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgZXZhbHVhdGUoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5pbWFnZSxcbiAgICAgICAgdGVzdDogL1xcLig/OnBuZ3xqcGd8aWNvfGdpZikoPzpcXD8uKik/JC9pLFxuICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5sb2FkZXIsXG4gICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuZmlsZSB8fCB7fVxuICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGRhdGFcbiAgICBkYXRhOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIHBhdGguZXh0bmFtZShIZWxwZXIuc3RyaXBMb2FkZXIoZmlsZVBhdGgpKVxuICAgICAgICAgICAgKSB8fCAoKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuZXhjbHVkZSwgZmlsZVBhdGgpKSxcbiAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5kYXRhLFxuICAgICAgICB0ZXN0OiAvLisvLFxuICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmxvYWRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLm9wdGlvbnMgfHwge31cbiAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmFkZGl0aW9uYWwubWFwKGV2YWx1YXRlKSlcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG59KVxuaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KSB7XG4gICAgbG9hZGVyLnN0eWxlLnVzZS5zaGlmdCgpXG4gICAgbG9hZGVyLnN0eWxlLnVzZSA9IHBsdWdpbnMuRXh0cmFjdFRleHQuZXh0cmFjdCh7dXNlOiBsb2FkZXIuc3R5bGUudXNlfSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbmZvciAoY29uc3QgcGx1Z2luQ29uZmlndXJhdGlvbjpQbHVnaW5Db25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24ucGx1Z2lucylcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgKGV2YWwoJ3JlcXVpcmUnKShwbHVnaW5Db25maWd1cmF0aW9uLm5hbWUubW9kdWxlKVtcbiAgICAgICAgcGx1Z2luQ29uZmlndXJhdGlvbi5uYW1lLmluaXRpYWxpemVyXG4gICAgXSkoLi4ucGx1Z2luQ29uZmlndXJhdGlvbi5wYXJhbWV0ZXIpKVxuLy8gcmVnaW9uIGNvbmZpZ3VyYXRpb25cbmV4cG9ydCBjb25zdCB3ZWJwYWNrQ29uZmlndXJhdGlvbjpXZWJwYWNrQ29uZmlndXJhdGlvbiA9IHtcbiAgICBiYWlsOiB0cnVlLFxuICAgIGNhY2hlOiBjb25maWd1cmF0aW9uLmNhY2hlLm1haW4sXG4gICAgY29udGV4dDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgZGV2dG9vbDogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC50b29sLFxuICAgIGRldlNlcnZlcjogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5zZXJ2ZXIsXG4gICAgLy8gcmVnaW9uIGlucHV0XG4gICAgZW50cnk6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQsXG4gICAgZXh0ZXJuYWxzOiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgIGFsaWFzRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICBleHRlbnNpb25zOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbCxcbiAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGUsXG4gICAgICAgIG1vZHVsZXM6IEhlbHBlci5ub3JtYWxpemVQYXRocyhjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyksXG4gICAgICAgIHVuc2FmZUNhY2hlOiBjb25maWd1cmF0aW9uLmNhY2hlLnVuc2FmZVxuICAgIH0sXG4gICAgcmVzb2x2ZUxvYWRlcjoge1xuICAgICAgICBhbGlhczogY29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlcyxcbiAgICAgICAgYWxpYXNGaWVsZHM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMuZmlsZSxcbiAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMubW9kdWxlLFxuICAgICAgICBtb2R1bGVzOiBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIG91dHB1dFxuICAgIG91dHB1dDoge1xuICAgICAgICBmaWxlbmFtZTogcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0KSxcbiAgICAgICAgaGFzaEZ1bmN0aW9uOiBjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG0sXG4gICAgICAgIGxpYnJhcnk6IGxpYnJhcnlOYW1lLFxuICAgICAgICBsaWJyYXJ5VGFyZ2V0OiAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnXG4gICAgICAgICkgPyAndmFyJyA6IGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LnNlbGYsXG4gICAgICAgIHBhdGg6IGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgcHVibGljUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5wdWJsaWMsXG4gICAgICAgIHBhdGhpbmZvOiBjb25maWd1cmF0aW9uLmRlYnVnLFxuICAgICAgICB1bWROYW1lZERlZmluZTogdHJ1ZVxuICAgIH0sXG4gICAgcGVyZm9ybWFuY2U6IGNvbmZpZ3VyYXRpb24ucGVyZm9ybWFuY2VIaW50cyxcbiAgICB0YXJnZXQ6IGNvbmZpZ3VyYXRpb24udGFyZ2V0VGVjaG5vbG9neSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICBtb2R1bGU6IHtcbiAgICAgICAgcnVsZXM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFkZGl0aW9uYWwubWFwKChcbiAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3RcbiAgICAgICAgKTpQbGFpbk9iamVjdCA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uZXhjbHVkZSB8fCAnZmFsc2UnLCBmaWxlUGF0aCksXG4gICAgICAgICAgICAgICAgaW5jbHVkZTogbG9hZGVyQ29uZmlndXJhdGlvbi5pbmNsdWRlICYmIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0XG4gICAgICAgICAgICAgICAgKSB8fCBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmJhc2UsXG4gICAgICAgICAgICAgICAgdGVzdDogbmV3IFJlZ0V4cChldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi50ZXN0LCBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCkpLFxuICAgICAgICAgICAgICAgIHVzZTogZXZhbHVhdGUobG9hZGVyQ29uZmlndXJhdGlvbi51c2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNvbmNhdChbXG4gICAgICAgICAgICBsb2FkZXIuZWpzLFxuICAgICAgICAgICAgbG9hZGVyLnNjcmlwdCxcbiAgICAgICAgICAgIGxvYWRlci5odG1sLm1haW4sIGxvYWRlci5odG1sLmVqcywgbG9hZGVyLmh0bWwuaHRtbCxcbiAgICAgICAgICAgIGxvYWRlci5zdHlsZSxcbiAgICAgICAgICAgIGxvYWRlci5mb250LmVvdCwgbG9hZGVyLmZvbnQuc3ZnLCBsb2FkZXIuZm9udC50dGYsXG4gICAgICAgICAgICBsb2FkZXIuZm9udC53b2ZmLFxuICAgICAgICAgICAgbG9hZGVyLmltYWdlLFxuICAgICAgICAgICAgbG9hZGVyLmRhdGFcbiAgICAgICAgXSlcbiAgICB9LFxuICAgIG5vZGU6IGNvbmZpZ3VyYXRpb24ubm9kZUVudmlyb25tZW50LFxuICAgIHBsdWdpbnM6IHBsdWdpbkluc3RhbmNlc1xufVxuaWYgKFxuICAgICFBcnJheS5pc0FycmF5KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9ucykgfHxcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnMubGVuZ3RoXG4pXG4gICAgd2VicGFja0NvbmZpZ3VyYXRpb24ubW9kdWxlLm5vUGFyc2UgPVxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnNcbmlmIChjb25maWd1cmF0aW9uLnNob3dDb25maWd1cmF0aW9uKSB7XG4gICAgY29uc29sZS5pbmZvKCdVc2luZyBpbnRlcm5hbCBjb25maWd1cmF0aW9uOicsIHV0aWwuaW5zcGVjdChjb25maWd1cmF0aW9uLCB7XG4gICAgICAgIGRlcHRoOiBudWxsfSkpXG4gICAgY29uc29sZS5pbmZvKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgY29uc29sZS5pbmZvKCdVc2luZyB3ZWJwYWNrIGNvbmZpZ3VyYXRpb246JywgdXRpbC5pbnNwZWN0KFxuICAgICAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbiwge2RlcHRoOiBudWxsfSkpXG59XG4vLyBlbmRyZWdpb25cbmV4cG9ydCBkZWZhdWx0IHdlYnBhY2tDb25maWd1cmF0aW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==