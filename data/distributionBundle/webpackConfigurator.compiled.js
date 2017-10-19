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

var _babiliWebpackPlugin = require('babili-webpack-plugin');

var _babiliWebpackPlugin2 = _interopRequireDefault(_babiliWebpackPlugin);

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

for (var source in _configurator2.default.module.replacements.normal) {
    if (_configurator2.default.module.replacements.normal.hasOwnProperty(source)) pluginInstances.push(new _webpack2.default.NormalModuleReplacementPlugin(new RegExp(source), _configurator2.default.module.replacements.normal[source]));
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
if (_configurator2.default.module.optimizer.babelMinify) pluginInstances.push(new _babiliWebpackPlugin2.default(_configurator2.default.module.optimizer.babelMinify));
// /// endregion
// /// region apply module pattern
pluginInstances.push({ apply: function apply(compiler) {
        compiler.plugin('emit', function (compilation, callback) {
            for (var request in compilation.assets) {
                if (compilation.assets.hasOwnProperty(request)) {
                    var filePath = request.replace(/\?[^?]+$/, '');
                    var _type = _helper2.default.determineAssetType(filePath, _configurator2.default.build.types, _configurator2.default.path);
                    if (_type && _configurator2.default.assetPattern[_type] && !new RegExp(_configurator2.default.assetPattern[_type].excludeFilePathRegularExpression).test(filePath)) {
                        var _source = compilation.assets[request].source();
                        if (typeof _source === 'string') compilation.assets[request] = new _webpackSources.RawSource(_configurator2.default.assetPattern[_type].pattern.replace(/\{1\}/g, _source.replace(/\$/g, '$$$')));
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
                var promises, _loop, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _path, _loop2, _arr2, _i2, _type2;

                return _regenerator2.default.wrap(function _callee2$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                promises = [];
                                _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop(_path) {
                                    return _regenerator2.default.wrap(function _loop$(_context2) {
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
                                    }, _loop, undefined);
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
                                return _context3.delegateYield(_loop(_path), 't0', 10);

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

                                _loop2 = function _loop2(_type2) {
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

                                    _loop2(_type2);
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
                                        options: loaderConfiguration.options
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
                    var _source2 = compilation.assets[assetRequest].source();
                    if (typeof _source2 === 'string') {
                        for (var replacement in _configurator2.default.injection.external.aliases) {
                            if (_configurator2.default.injection.external.aliases.hasOwnProperty(replacement)) _source2 = _source2.replace(new RegExp('(require\\()"' + _clientnode2.default.stringEscapeRegularExpressions(_configurator2.default.injection.external.aliases[replacement]) + '"(\\))', 'g'), '$1\'' + replacement + '\'$2').replace(new RegExp('(define\\("' + _clientnode2.default.stringEscapeRegularExpressions(bundleName) + '", \\[.*)"' + _clientnode2.default.stringEscapeRegularExpressions(_configurator2.default.injection.external.aliases[replacement]) + '"(.*\\], factory\\);)'), '$1\'' + replacement + '\'$2');
                        }_source2 = _source2.replace(new RegExp('(root\\[)"' + _clientnode2.default.stringEscapeRegularExpressions(bundleName) + '"(\\] = )'), '$1\'' + _clientnode2.default.stringConvertToValidVariableName(bundleName) + '\'$2');
                        compilation.assets[assetRequest] = new _webpackSources.RawSource(_source2);
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

var rejectFilePathInDependencies = function rejectFilePathInDependencies(filePath) {
    filePath = _helper2.default.stripLoader(filePath);
    return _helper2.default.isFilePathInLocation(filePath, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
        return _path3.default.resolve(_configurator2.default.path.context, filePath);
    }).filter(function (filePath) {
        return !_configurator2.default.path.context.startsWith(filePath);
    }));
};
var loader = {};
var evaluate = function evaluate(code, filePath) {
    return new Function('configuration', 'filePath', 'loader', 'rejectFilePathInDependencies', 'return ' + code
    // IgnoreTypeCheck
    )(_configurator2.default, filePath, loader, rejectFilePathInDependencies);
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
        use: [{ loader: 'file?name=[path][name]' + (Boolean(_configurator2.default.module.preprocessor.ejs.options.compileSteps % 2) ? '.js' : '') + ('?' + _configurator2.default.hashAlgorithm + '=[hash]') }, { loader: 'extract' }, {
            loader: _configurator2.default.module.preprocessor.ejs.loader,
            options: _configurator2.default.module.preprocessor.ejs.options
        }].concat(_configurator2.default.module.preprocessor.ejs.additional.map(evaluate))
    },
    // endregion
    // region script
    script: {
        exclude: function exclude(filePath) {
            return _configurator2.default.module.preprocessor.javaScript.exclude === null ? rejectFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.preprocessor.javaScript.exclude, filePath);
        },
        include: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.javaScript].concat(_configurator2.default.module.locations.directoryPaths)),
        test: /\.js(?:\?.*)?$/i,
        use: [{
            loader: _configurator2.default.module.preprocessor.javaScript.loader,
            options: _configurator2.default.module.preprocessor.javaScript.options
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
            use: [{ loader: 'file?name=' + _path3.default.join(_path3.default.relative(_configurator2.default.path.target.asset.base, _configurator2.default.path.target.asset.template), '[name]' + (Boolean(_configurator2.default.module.preprocessor.html.options.compileSteps % 2) ? '.js' : '') + ('?' + _configurator2.default.hashAlgorithm + '=[hash]')) }].concat(Boolean(_configurator2.default.module.preprocessor.html.options.compileSteps % 2) ? [] : [{ loader: 'extract' }, {
                loader: _configurator2.default.module.html.loader,
                options: _configurator2.default.module.html.options
            }], {
                loader: _configurator2.default.module.preprocessor.html.loader,
                options: _configurator2.default.module.preprocessor.html.options
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
                options: _configurator2.default.module.html.options
            }].concat(_configurator2.default.module.html.additional.map(evaluate))
        }
    },
    // endregion
    // Load dependencies.
    // region style
    style: {
        exclude: function exclude(filePath) {
            return _configurator2.default.module.cascadingStyleSheet.exclude === null ? rejectFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.cascadingStyleSheet.exclude, filePath);
        },
        include: _helper2.default.normalizePaths([_configurator2.default.path.source.asset.cascadingStyleSheet].concat(_configurator2.default.module.locations.directoryPaths)),
        test: /\.s?css(?:\?.*)?$/i,
        use: [{
            loader: _configurator2.default.module.style.loader,
            options: _configurator2.default.module.style.options
        }, {
            loader: _configurator2.default.module.cascadingStyleSheet.loader,
            options: _configurator2.default.module.cascadingStyleSheet.options
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
            }, _configurator2.default.module.preprocessor.cascadingStyleSheet.options)
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
                options: _configurator2.default.module.optimizer.font.eot.options
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
                options: _configurator2.default.module.optimizer.font.svg.options
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
                options: _configurator2.default.module.optimizer.font.ttf.options
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
                options: _configurator2.default.module.optimizer.font.woff.options
            }].concat(_configurator2.default.module.optimizer.font.woff.additional.map(evaluate))
        }
    },
    // endregion
    // region image
    image: {
        exclude: function exclude(filePath) {
            return _configurator2.default.module.optimizer.image.exclude === null ? rejectFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.optimizer.image.exclude, filePath);
        },
        include: _configurator2.default.path.source.asset.image,
        test: /\.(?:png|jpg|ico|gif)(?:\?.*)?$/i,
        use: [{
            loader: _configurator2.default.module.optimizer.image.loader,
            options: _configurator2.default.module.optimizer.image.file
        }].concat(_configurator2.default.module.optimizer.image.additional.map(evaluate))
    },
    // endregion
    // region data
    data: {
        exclude: function exclude(filePath) {
            return _configurator2.default.extensions.file.internal.includes(_path3.default.extname(_helper2.default.stripLoader(filePath))) || (_configurator2.default.module.optimizer.data.exclude === null ? rejectFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.optimizer.data.exclude, filePath));
        },
        include: _configurator2.default.path.source.asset.data,
        test: /.+/,
        use: [{
            loader: _configurator2.default.module.optimizer.data.loader,
            options: _configurator2.default.module.optimizer.data.options
        }].concat(_configurator2.default.module.optimizer.data.additional.map(evaluate))
        // endregion
    } });
if (_configurator2.default.files.compose.cascadingStyleSheet) {
    loader.style.use.shift();
    loader.style.use = plugins.ExtractText.extract({ use: loader.style.use });
}
// / endregion
// endregion
// region configuration
var webpackConfiguration = {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBSUE7O0FBQ0E7O0lBQVksVTs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFLQTs7OztBQUNBOzs7O0FBRUE7O0FBVUE7Ozs7QUFFQTs7OztBQUNBOzs7O0FBS0E7Ozs7QUFRQTs7Ozs7Ozs7QUFqQ0E7O0FBVEE7O0FBRkE7QUFZQSxJQUFJO0FBQ0EsWUFBUSw2QkFBUjtBQUNILENBRkQsQ0FFRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUdsQixJQUFNLFVBQVUsUUFBUSxzQkFBUixHQUFoQjs7O0FBR0EsUUFBUSxJQUFSLEdBQWUsUUFBUSxJQUF2QjtBQUNBLFFBQVEsV0FBUixHQUFzQixRQUFRLFdBQTlCO0FBQ0EsUUFBUSxrQkFBUixHQUE2QixRQUFRLCtCQUFSLENBQTdCO0FBQ0EsUUFBUSxXQUFSLEdBQXNCLFFBQVEsV0FBOUI7QUFDQSxRQUFRLE9BQVIsR0FBa0IsUUFBUSx5QkFBUixDQUFsQjtBQUNBLFFBQVEsUUFBUixHQUFtQixRQUFRLHlCQUFSLEVBQW1DLE9BQXREO0FBQ0EsUUFBUSxPQUFSLEdBQWtCLFFBQVEsZ0JBQVIsQ0FBbEI7O0FBT0E7QUFDQTtBQUNBOztBQUVBLFFBQVEsS0FBUixDQUFjLFFBQVEsT0FBUixDQUFnQixhQUFoQixDQUFkLEVBQThDLE9BQTlDLEdBQXdELFlBRWxEO0FBQ0YseUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QixLQUFLLE9BQTlCLEVBQXVDLE1BQXZDLEVBQStDLEtBQUssT0FBcEQ7O0FBREUsc0NBREMsU0FDRDtBQURDLGlCQUNEO0FBQUE7O0FBRUYsV0FBTyxxQkFBdUIsSUFBdkIsOEJBQTRCLElBQTVCLFNBQXFDLFNBQXJD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LEVBR04sT0FBTyxJQUFQLENBQVksSUFITixFQUdZLE9BQU8sSUFBUCxDQUFZLEdBSHhCLEVBRzZCLE9BQU8sSUFBUCxDQUFZLElBSHpDLEVBSU4sT0FBTyxLQUpELEVBS04sT0FBTyxJQUFQLENBQVksR0FMTixFQUtXLE9BQU8sSUFBUCxDQUFZLEdBTHZCLEVBSzRCLE9BQU8sSUFBUCxDQUFZLEdBTHhDLEVBTU4sT0FBTyxJQUFQLENBQVksSUFOTixFQU9OLE9BQU8sS0FQRCxFQVFOLE9BQU8sSUFSRCxDQWJIO0FBREgsS0EvQ3NDO0FBd0U5QyxVQUFNLHVCQUFjLGVBeEUwQjtBQXlFOUMsYUFBUztBQXpFcUMsQ0FBbEQ7QUEyRUEsSUFDSSxDQUFDLE1BQU0sT0FBTixDQUFjLHVCQUFjLE1BQWQsQ0FBcUIsMkJBQW5DLENBQUQsSUFDQSx1QkFBYyxNQUFkLENBQXFCLDJCQUFyQixDQUFpRCxNQUZyRCxFQUlJLHFCQUFxQixNQUFyQixDQUE0QixPQUE1QixHQUNJLHVCQUFjLE1BQWQsQ0FBcUIsMkJBRHpCO0FBRUosSUFBSSx1QkFBYyxpQkFBbEIsRUFBcUM7QUFDakMsWUFBUSxJQUFSLENBQWEsK0JBQWIsRUFBOEMsZUFBSyxPQUFMLHlCQUE0QjtBQUN0RSxlQUFPLElBRCtELEVBQTVCLENBQTlDO0FBRUEsWUFBUSxJQUFSLENBQWEsNkRBQWI7QUFDQSxZQUFRLElBQVIsQ0FBYSw4QkFBYixFQUE2QyxlQUFLLE9BQUwsQ0FDekMsb0JBRHlDLEVBQ25CLEVBQUMsT0FBTyxJQUFSLEVBRG1CLENBQTdDO0FBRUg7QUFDRDtrQkFDZSxvQjtBQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6IndlYnBhY2tDb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgQmFiZWxNaW5pZnlQbHVnaW4gZnJvbSAnYmFiaWxpLXdlYnBhY2stcGx1Z2luJ1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IHR5cGUge0RvbU5vZGUsIFBsYWluT2JqZWN0LCBQcm9jZWR1cmVGdW5jdGlvbiwgV2luZG93fSBmcm9tICdjbGllbnRub2RlJ1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IHtKU0RPTSBhcyBET019IGZyb20gJ2pzZG9tJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcG9zdGNzc0NTU25leHQgZnJvbSAncG9zdGNzcy1jc3NuZXh0J1xuaW1wb3J0IHBvc3Rjc3NGb250UGF0aCBmcm9tICdwb3N0Y3NzLWZvbnRwYXRoJ1xuaW1wb3J0IHBvc3Rjc3NJbXBvcnQgZnJvbSAncG9zdGNzcy1pbXBvcnQnXG5pbXBvcnQgcG9zdGNzc1Nwcml0ZXMgZnJvbSAncG9zdGNzcy1zcHJpdGVzJ1xuaW1wb3J0IHBvc3Rjc3NVUkwgZnJvbSAncG9zdGNzcy11cmwnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCB3ZWJwYWNrIGZyb20gJ3dlYnBhY2snXG5jb25zdCBwbHVnaW5zID0gcmVxdWlyZSgnd2VicGFjay1sb2FkLXBsdWdpbnMnKSgpXG5pbXBvcnQge1Jhd1NvdXJjZSBhcyBXZWJwYWNrUmF3U291cmNlfSBmcm9tICd3ZWJwYWNrLXNvdXJjZXMnXG5cbnBsdWdpbnMuSFRNTCA9IHBsdWdpbnMuaHRtbFxucGx1Z2lucy5FeHRyYWN0VGV4dCA9IHBsdWdpbnMuZXh0cmFjdFRleHRcbnBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luID0gcmVxdWlyZSgnYWRkLWFzc2V0LWh0bWwtd2VicGFjay1wbHVnaW4nKVxucGx1Z2lucy5PcGVuQnJvd3NlciA9IHBsdWdpbnMub3BlbkJyb3dzZXJcbnBsdWdpbnMuRmF2aWNvbiA9IHJlcXVpcmUoJ2Zhdmljb25zLXdlYnBhY2stcGx1Z2luJylcbnBsdWdpbnMuSW1hZ2VtaW4gPSByZXF1aXJlKCdpbWFnZW1pbi13ZWJwYWNrLXBsdWdpbicpLmRlZmF1bHRcbnBsdWdpbnMuT2ZmbGluZSA9IHJlcXVpcmUoJ29mZmxpbmUtcGx1Z2luJylcblxuaW1wb3J0IGVqc0xvYWRlciBmcm9tICcuL2Vqc0xvYWRlci5jb21waWxlZCdcbmltcG9ydCB0eXBlIHtIVE1MQ29uZmlndXJhdGlvbiwgV2VicGFja0NvbmZpZ3VyYXRpb259IGZyb20gJy4vdHlwZSdcbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yLmNvbXBpbGVkJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcblxuLy8gLyByZWdpb24gbW9ua2V5IHBhdGNoZXNcbi8vIE1vbmtleS1QYXRjaCBodG1sIGxvYWRlciB0byByZXRyaWV2ZSBodG1sIGxvYWRlciBvcHRpb25zIHNpbmNlIHRoZVxuLy8gXCJ3ZWJwYWNrLWh0bWwtcGx1Z2luXCIgZG9lc24ndCBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgbG9hZGVyIGludGVyZmFjZS5cbmltcG9ydCBodG1sTG9hZGVyTW9kdWxlQmFja3VwIGZyb20gJ2h0bWwtbG9hZGVyJ1xucmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2h0bWwtbG9hZGVyJyldLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgICAuLi5wYXJhbWV0ZXI6QXJyYXk8YW55PlxuKTphbnkge1xuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB0aGlzLm9wdGlvbnMsIG1vZHVsZSwgdGhpcy5vcHRpb25zKVxuICAgIHJldHVybiBodG1sTG9hZGVyTW9kdWxlQmFja3VwLmNhbGwodGhpcywgLi4ucGFyYW1ldGVyKVxufVxuLy8gTW9ua2V5LVBhdGNoIGxvYWRlci11dGlscyB0byBkZWZpbmUgd2hpY2ggdXJsIGlzIGEgbG9jYWwgcmVxdWVzdC5cbmltcG9ydCBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cCBmcm9tICdsb2FkZXItdXRpbHMnXG5jb25zdCBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cDoodXJsOnN0cmluZykgPT4gYm9vbGVhbiA9XG4gICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAuaXNVcmxSZXF1ZXN0XG5yZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSgnbG9hZGVyLXV0aWxzJyldLmV4cG9ydHMuaXNVcmxSZXF1ZXN0ID0gKFxuICAgIHVybDpzdHJpbmcsIC4uLmFkZGl0aW9uYWxQYXJhbWV0ZXI6QXJyYXk8YW55PlxuKTpib29sZWFuID0+IHtcbiAgICBpZiAodXJsLm1hdGNoKC9eW2Etel0rOi4rLykpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cC5hcHBseShcbiAgICAgICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAsIFt1cmxdLmNvbmNhdChhZGRpdGlvbmFsUGFyYW1ldGVyKSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBpbml0aWFsaXNhdGlvblxuLy8gLyByZWdpb24gZGV0ZXJtaW5lIGxpYnJhcnkgbmFtZVxubGV0IGxpYnJhcnlOYW1lOnN0cmluZ1xuaWYgKCdsaWJyYXJ5TmFtZScgaW4gY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmxpYnJhcnlOYW1lKVxuICAgIGxpYnJhcnlOYW1lID0gY29uZmlndXJhdGlvbi5saWJyYXJ5TmFtZVxuZWxzZSBpZiAoT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCkubGVuZ3RoID4gMSlcbiAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV0nXG5lbHNlIHtcbiAgICBsaWJyYXJ5TmFtZSA9IGNvbmZpZ3VyYXRpb24ubmFtZVxuICAgIGlmIChjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmID09PSAndmFyJylcbiAgICAgICAgbGlicmFyeU5hbWUgPSBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShsaWJyYXJ5TmFtZSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBwbHVnaW5zXG5jb25zdCBwbHVnaW5JbnN0YW5jZXM6QXJyYXk8T2JqZWN0PiA9IFtcbiAgICBuZXcgd2VicGFjay5Ob0VtaXRPbkVycm9yc1BsdWdpbigpLFxuICAgIG5ldyB3ZWJwYWNrLm9wdGltaXplLk9jY3VycmVuY2VPcmRlclBsdWdpbih0cnVlKVxuXVxuaWYgKGNvbmZpZ3VyYXRpb24uZGVidWcpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suTmFtZWRNb2R1bGVzUGx1Z2luKCkpXG4vLyAvLyByZWdpb24gZGVmaW5lIG1vZHVsZXMgdG8gaWdub3JlXG5mb3IgKGNvbnN0IGlnbm9yZVBhdHRlcm46c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmlnbm9yZVBhdHRlcm4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suSWdub3JlUGx1Z2luKG5ldyBSZWdFeHAoaWdub3JlUGF0dGVybikpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZGVmaW5lIG1vZHVsZXMgdG8gcmVwbGFjZVxuZm9yIChjb25zdCBzb3VyY2U6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwpXG4gICAgaWYgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwuaGFzT3duUHJvcGVydHkoc291cmNlKSlcbiAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suTm9ybWFsTW9kdWxlUmVwbGFjZW1lbnRQbHVnaW4oXG4gICAgICAgICAgICBuZXcgUmVnRXhwKHNvdXJjZSksXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsW3NvdXJjZV0pKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgaHRtbCBmaWxlXG5sZXQgaHRtbEF2YWlsYWJsZTpib29sZWFuID0gZmFsc2VcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gIT09ICdidWlsZDpkbGwnKVxuICAgIGZvciAobGV0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbClcbiAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5IVE1MKFRvb2xzLmV4dGVuZE9iamVjdChcbiAgICAgICAgICAgICAgICB7fSwgaHRtbENvbmZpZ3VyYXRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3R9KSkpXG4gICAgICAgICAgICBodG1sQXZhaWxhYmxlID0gdHJ1ZVxuICAgICAgICB9XG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBnZW5lcmF0ZSBmYXZpY29uc1xuaWYgKGh0bWxBdmFpbGFibGUgJiYgY29uZmlndXJhdGlvbi5mYXZpY29uICYmIFRvb2xzLmlzRmlsZVN5bmMoXG4gICAgY29uZmlndXJhdGlvbi5mYXZpY29uLmxvZ29cbikpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuRmF2aWNvbihjb25maWd1cmF0aW9uLmZhdmljb24pKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gcHJvdmlkZSBvZmZsaW5lIGZ1bmN0aW9uYWxpdHlcbmlmIChodG1sQXZhaWxhYmxlICYmIGNvbmZpZ3VyYXRpb24ub2ZmbGluZSkge1xuICAgIGlmICghWydzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgKSlcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOlBsYWluT2JqZWN0IG9mIFtcbiAgICAgICAgICAgIFsnY2FzY2FkaW5nU3R5bGVTaGVldCcsICdjc3MnXSxcbiAgICAgICAgICAgIFsnamF2YVNjcmlwdCcsICdqcyddXG4gICAgICAgIF0pXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pblBsYWNlW3R5cGVbMF1dKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlczpBcnJheTxzdHJpbmc+ID0gT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZVt0eXBlWzBdXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWU6c3RyaW5nIG9mIG1hdGNoZXMpXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ub2ZmbGluZS5leGNsdWRlcy5wdXNoKHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVbMF1dXG4gICAgICAgICAgICAgICAgICAgICkgKyBgJHtuYW1lfS4ke3R5cGVbMV19PyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT0qYClcbiAgICAgICAgICAgIH1cbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PZmZsaW5lKGNvbmZpZ3VyYXRpb24ub2ZmbGluZSkpXG59XG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBvcGVucyBicm93c2VyIGF1dG9tYXRpY2FsbHlcbmlmIChjb25maWd1cmF0aW9uLmRldmVsb3BtZW50Lm9wZW5Ccm93c2VyICYmIChodG1sQXZhaWxhYmxlICYmIFtcbiAgICAnc2VydmUnLCAndGVzdDpicm93c2VyJ1xuXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PcGVuQnJvd3NlcihcbiAgICAgICAgY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5vcGVuQnJvd3NlcikpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBwcm92aWRlIGJ1aWxkIGVudmlyb25tZW50XG5pZiAoY29uZmlndXJhdGlvbi5idWlsZC5kZWZpbml0aW9ucylcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EZWZpbmVQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGQuZGVmaW5pdGlvbnMpKVxuaWYgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByb3ZpZGUpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suUHJvdmlkZVBsdWdpbihcbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJvdmlkZSkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBtb2R1bGVzL2Fzc2V0c1xuLy8gLy8vIHJlZ2lvbiBwZXJmb3JtIGphdmFTY3JpcHQgbWluaWZpY2F0aW9uL29wdGltaXNhdGlvblxuaWYgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgQmFiZWxNaW5pZnlQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeSkpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGFwcGx5IG1vZHVsZSBwYXR0ZXJuXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgIGNvbXBpbGVyLnBsdWdpbignZW1pdCcsIChcbiAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcmVxdWVzdDpzdHJpbmcgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgaWYgKGNvbXBpbGF0aW9uLmFzc2V0cy5oYXNPd25Qcm9wZXJ0eShyZXF1ZXN0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IHJlcXVlc3QucmVwbGFjZSgvXFw/W14/XSskLywgJycpXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgICAgICBpZiAodHlwZSAmJiBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXSAmJiAhKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAuZXhjbHVkZUZpbGVQYXRoUmVndWxhckV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICApKS50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2U6P3N0cmluZyA9IGNvbXBpbGF0aW9uLmFzc2V0c1tyZXF1ZXN0XS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbcmVxdWVzdF0gPSBuZXcgV2VicGFja1Jhd1NvdXJjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXS5wYXR0ZXJuLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9cXHsxXFx9L2csIHNvdXJjZS5yZXBsYWNlKC9cXCQvZywgJyQkJCcpKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKClcbiAgICB9KVxufX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGluLXBsYWNlIGNvbmZpZ3VyZWQgYXNzZXRzIGluIHRoZSBtYWluIGh0bWwgZmlsZVxuaWYgKGh0bWxBdmFpbGFibGUgJiYgIVsnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4pKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKHthcHBseTogKGNvbXBpbGVyOk9iamVjdCk6dm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb21waWxlci5wbHVnaW4oJ2NvbXBpbGF0aW9uJywgKGNvbXBpbGF0aW9uOk9iamVjdCk6dm9pZCA9PlxuICAgICAgICAgICAgY29tcGlsYXRpb24ucGx1Z2luKFxuICAgICAgICAgICAgICAgICdodG1sLXdlYnBhY2stcGx1Z2luLWFmdGVyLWh0bWwtcHJvY2Vzc2luZycsIGFzeW5jIChcbiAgICAgICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgKTpQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgICAgICApLmxlbmd0aCB8fCBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQpLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDp7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6c3RyaW5nLCBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IGF3YWl0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5pblBsYWNlQ1NTQW5kSmF2YVNjcmlwdEFzc2V0UmVmZXJlbmNlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLmh0bWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sID0gcmVzdWx0LmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZS5jb25jYXQocmVzdWx0LmZpbGVQYXRoc1RvUmVtb3ZlKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBodG1sUGx1Z2luRGF0YSlcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgY29tcGlsZXIucGx1Z2luKCdhZnRlci1lbWl0JywgYXN5bmMgKFxuICAgICAgICAgICAgY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOlByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAgICAgbGV0IHByb21pc2VzOkFycmF5PFByb21pc2U8dm9pZD4+ID0gW11cbiAgICAgICAgICAgIGZvciAoY29uc3QgcGF0aDpzdHJpbmcgb2YgZmlsZVBhdGhzVG9SZW1vdmUpXG4gICAgICAgICAgICAgICAgaWYgKGF3YWl0IFRvb2xzLmlzRmlsZShwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZTpGdW5jdGlvbik6dm9pZCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmsocGF0aCwgKGVycm9yOj9FcnJvcik6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpKVxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgICBwcm9taXNlcyA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIG9mIFtcbiAgICAgICAgICAgICAgICAnamF2YVNjcmlwdCcsICdjYXNjYWRpbmdTdHlsZVNoZWV0J1xuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogV29ya2Fyb3VuZCBzaW5jZSBmbG93IG1pc3NlcyB0aGUgdGhyZWUgcGFyYW1ldGVyXG4gICAgICAgICAgICAgICAgICAgIFwicmVhZGRpclwiIHNpZ25hdHVyZS5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICk6dm9pZCA9PiAoZmlsZVN5c3RlbS5yZWFkZGlyOkZ1bmN0aW9uKShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldFt0eXBlXSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZyxcbiAgICAgICAgICAgICAgICAgICAgKGVycm9yOj9FcnJvciwgZmlsZXM6QXJyYXk8c3RyaW5nPik6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ucm1kaXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0sIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICB9KSkpXG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfSlcbiAgICB9fSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gcmVtb3ZlIGNodW5rcyBpZiBhIGNvcnJlc3BvbmRpbmcgZGxsIHBhY2thZ2UgZXhpc3RzXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGQ6ZGxsJylcbiAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZClcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgKSkge1xuICAgICAgICAgICAgY29uc3QgbWFuaWZlc3RGaWxlUGF0aDpzdHJpbmcgPVxuICAgICAgICAgICAgICAgIGAke2NvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZX0vJHtjaHVua05hbWV9LmAgK1xuICAgICAgICAgICAgICAgIGBkbGwtbWFuaWZlc3QuanNvbmBcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmRsbE1hbmlmZXN0RmlsZVBhdGhzLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIG1hbmlmZXN0RmlsZVBhdGhcbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gSGVscGVyLnJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgICksIHsnW25hbWVdJzogY2h1bmtOYW1lfSlcbiAgICAgICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5BZGRBc3NldEhUTUxQbHVnaW4oe1xuICAgICAgICAgICAgICAgICAgICBmaWxlcGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVTb3VyY2VtYXA6IFRvb2xzLmlzRmlsZVN5bmMoYCR7ZmlsZVBhdGh9Lm1hcGApXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGxsUmVmZXJlbmNlUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIG1hbmlmZXN0OiByZXF1aXJlKFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3RGaWxlUGF0aCl9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBnZW5lcmF0ZSBjb21tb24gY2h1bmtzXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGQ6ZGxsJylcbiAgICBmb3IgKGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgb2YgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uY29tbW9uQ2h1bmtJRHMpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpXG4gICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5vcHRpbWl6ZS5Db21tb25zQ2h1bmtQbHVnaW4oe1xuICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgICAgIG1pbkNodW5rczogSW5maW5pdHksXG4gICAgICAgICAgICAgICAgbmFtZTogY2h1bmtOYW1lLFxuICAgICAgICAgICAgICAgIG1pblNpemU6IDBcbiAgICAgICAgICAgIH0pKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBtYXJrIGVtcHR5IGphdmFTY3JpcHQgbW9kdWxlcyBhcyBkdW1teVxuaWYgKCFjb25maWd1cmF0aW9uLm5lZWRlZC5qYXZhU2NyaXB0KVxuICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0ID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmphdmFTY3JpcHQsICcuX19kdW1teV9fLmNvbXBpbGVkLmpzJylcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gZXh0cmFjdCBjYXNjYWRpbmcgc3R5bGUgc2hlZXRzXG5pZiAoY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuRXh0cmFjdFRleHQoe1xuICAgICAgICBhbGxDaHVua3M6IHRydWUsIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQpXG4gICAgfSkpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHBlcmZvcm1zIGltcGxpY2l0IGV4dGVybmFsIGxvZ2ljXG5pZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwubW9kdWxlcyA9PT0gJ19faW1wbGljaXRfXycpXG4gICAgLypcbiAgICAgICAgV2Ugb25seSB3YW50IHRvIHByb2Nlc3MgbW9kdWxlcyBmcm9tIGxvY2FsIGNvbnRleHQgaW4gbGlicmFyeSBtb2RlLFxuICAgICAgICBzaW5jZSBhIGNvbmNyZXRlIHByb2plY3QgdXNpbmcgdGhpcyBsaWJyYXJ5IHNob3VsZCBjb21iaW5lIGFsbCBhc3NldHNcbiAgICAgICAgKGFuZCBkZWR1cGxpY2F0ZSB0aGVtKSBmb3Igb3B0aW1hbCBidW5kbGluZyByZXN1bHRzLiBOT1RFOiBPbmx5IG5hdGl2ZVxuICAgICAgICBqYXZhU2NyaXB0IGFuZCBqc29uIG1vZHVsZXMgd2lsbCBiZSBtYXJrZWQgYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAqL1xuICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMgPSAoXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nLCByZXF1ZXN0OnN0cmluZywgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICApOnZvaWQgPT4ge1xuICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5yZXBsYWNlKC9eISsvLCAnJylcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgcmVxdWVzdCA9IHBhdGgucmVsYXRpdmUoY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIHJlcXVlc3QpXG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2ZcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lcylcbiAgICAgICAgKVxuICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoZmlsZVBhdGgubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgbGV0IHJlc29sdmVkUmVxdWVzdDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUV4dGVybmFsUmVxdWVzdChcbiAgICAgICAgICAgIHJlcXVlc3QsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBjb250ZXh0LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aFxuICAgICAgICAgICAgKSkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aClcbiAgICAgICAgICAgICksIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLCBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuaW1wbGljaXQucGF0dGVybi5pbmNsdWRlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuaW1wbGljaXQucGF0dGVybi5leGNsdWRlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmV4dGVybmFsTGlicmFyeS5ub3JtYWwsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuZXh0ZXJuYWxMaWJyYXJ5LmR5bmFtaWMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nKVxuICAgICAgICBpZiAocmVzb2x2ZWRSZXF1ZXN0KSB7XG4gICAgICAgICAgICBpZiAoWyd2YXInLCAndW1kJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWxcbiAgICAgICAgICAgICkgJiYgcmVxdWVzdCBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCA9IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RdXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwgPT09ICd2YXInKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCA9IFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsICcwLTlhLXpBLVpfJFxcXFwuJylcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhcbiAgICAgICAgICAgICAgICBudWxsLCByZXNvbHZlZFJlcXVlc3QsIGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpXG4gICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBidWlsZCBkbGwgcGFja2FnZXNcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnKSB7XG4gICAgbGV0IGRsbENodW5rSURFeGlzdHM6Ym9vbGVhbiA9IGZhbHNlXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZGxsQ2h1bmtJRHMuaW5jbHVkZXMoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBkbGxDaHVua0lERXhpc3RzID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICBpZiAoZGxsQ2h1bmtJREV4aXN0cykge1xuICAgICAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV1ETExQYWNrYWdlJ1xuICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EbGxQbHVnaW4oe1xuICAgICAgICAgICAgcGF0aDogYCR7Y29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlfS9bbmFtZV0uZGxsLW1hbmlmZXN0Lmpzb25gLFxuICAgICAgICAgICAgbmFtZTogbGlicmFyeU5hbWVcbiAgICAgICAgfSkpXG4gICAgfSBlbHNlXG4gICAgICAgIGNvbnNvbGUud2FybignTm8gZGxsIGNodW5rIGlkIGZvdW5kLicpXG59XG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBhcHBseSBmaW5hbCBkb20vamF2YVNjcmlwdCBtb2RpZmljYXRpb25zL2ZpeGVzXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4gY29tcGlsZXIucGx1Z2luKFxuICAgICdjb21waWxhdGlvbicsIChjb21waWxhdGlvbjpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICBjb21waWxhdGlvbi5wbHVnaW4oJ2h0bWwtd2VicGFjay1wbHVnaW4tYWx0ZXItYXNzZXQtdGFncycsIChcbiAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhOlBsYWluT2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgZm9yIChjb25zdCB0YWdzOkFycmF5PFBsYWluT2JqZWN0PiBvZiBbXG4gICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEuYm9keSwgaHRtbFBsdWdpbkRhdGEuaGVhZFxuICAgICAgICAgICAgXSkge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWc6UGxhaW5PYmplY3Qgb2YgdGFncykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoL15cXC5fX2R1bW15X18oXFwuLiopPyQvLnRlc3QocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5hdHRyaWJ1dGVzLnNyYyB8fCB0YWcuYXR0cmlidXRlcy5ocmVmIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFncy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBhc3NldHM6QXJyYXk8c3RyaW5nPiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEucGx1Z2luLmFzc2V0SnNvbilcbiAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGFzc2V0UmVxdWVzdDpzdHJpbmcgb2YgYXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKC9eXFwuX19kdW1teV9fKFxcLi4qKT8kLy50ZXN0KHBhdGguYmFzZW5hbWUoYXNzZXRSZXF1ZXN0KSkpXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEucGx1Z2luLmFzc2V0SnNvbiA9IEpTT04uc3RyaW5naWZ5KGFzc2V0cylcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICB9KVxuICAgICAgICBjb21waWxhdGlvbi5wbHVnaW4oJ2h0bWwtd2VicGFjay1wbHVnaW4tYWZ0ZXItaHRtbC1wcm9jZXNzaW5nJywgKFxuICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgICAgICk6V2luZG93ID0+IHtcbiAgICAgICAgICAgIGxldCB3aW5kb3c6V2luZG93XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdyA9IChuZXcgRE9NKGh0bWxQbHVnaW5EYXRhLmh0bWwucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLzwlL2csICcjIysjKyMrIyMnXG4gICAgICAgICAgICAgICAgKS5yZXBsYWNlKC8lPi9nLCAnIyMtIy0jLSMjJykpKS53aW5kb3dcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBodG1sUGx1Z2luRGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxpbmthYmxlczp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7XG4gICAgICAgICAgICAgICAgc2NyaXB0OiAnc3JjJywgbGluazogJ2hyZWYnfVxuICAgICAgICAgICAgZm9yIChjb25zdCB0YWdOYW1lOnN0cmluZyBpbiBsaW5rYWJsZXMpXG4gICAgICAgICAgICAgICAgaWYgKGxpbmthYmxlcy5oYXNPd25Qcm9wZXJ0eSh0YWdOYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGFnTmFtZX1bJHtsaW5rYWJsZXNbdGFnTmFtZV19Kj1cIj9gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVwiXWApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogUmVtb3Zpbmcgc3ltYm9scyBhZnRlciBhIFwiJlwiIGluIGhhc2ggc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXMgbmVjZXNzYXJ5IHRvIG1hdGNoIHRoZSBnZW5lcmF0ZWQgcmVxdWVzdCBzdHJpbmdzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW4gb2ZmbGluZSBwbHVnaW4uXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2FibGVzW3RhZ05hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuZ2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZXNbdGFnTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYChcXFxcPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1teJl0rKS4qJCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCAnJDEnKSlcbiAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLmh0bWwgPSBodG1sUGx1Z2luRGF0YS5odG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgL14oXFxzKjwhZG9jdHlwZSBbXj5dKz8+XFxzKilbXFxzXFxTXSokL2ksICckMSdcbiAgICAgICAgICAgICkgKyB3aW5kb3cuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm91dGVySFRNTC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvIyNcXCsjXFwrI1xcKyMjL2csICc8JSdcbiAgICAgICAgICAgICAgICApLnJlcGxhY2UoLyMjLSMtIy0jIy9nLCAnJT4nKVxuICAgICAgICAgICAgLy8gIHJlZ2lvbiBwb3N0IGNvbXBpbGF0aW9uXG4gICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxGaWxlU3BlY2lmaWNhdGlvbjpQbGFpbk9iamVjdCBvZlxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgaHRtbEZpbGVTcGVjaWZpY2F0aW9uLmZpbGVuYW1lID09PVxuICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5wbHVnaW4ub3B0aW9ucy5maWxlbmFtZVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVyQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbEZpbGVTcGVjaWZpY2F0aW9uLnRlbXBsYXRlLnVzZVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eSgnb3B0aW9ucycpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29tcGlsZVN0ZXBzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zLmNvbXBpbGVTdGVwc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sID0gZWpzTG9hZGVyLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IGh0bWxGaWxlU3BlY2lmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50ZW1wbGF0ZS5wb3N0Q29tcGlsZVN0ZXBzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19KSkoaHRtbFBsdWdpbkRhdGEuaHRtbClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGh0bWxQbHVnaW5EYXRhKVxuICAgICAgICB9KVxuICAgIH0pfSlcbi8qXG4gICAgTk9URTogVGhlIHVtZCBtb2R1bGUgZXhwb3J0IGRvZXNuJ3QgaGFuZGxlIGNhc2VzIHdoZXJlIHRoZSBwYWNrYWdlIG5hbWVcbiAgICBkb2Vzbid0IG1hdGNoIGV4cG9ydGVkIGxpYnJhcnkgbmFtZS4gVGhpcyBwb3N0IHByb2Nlc3NpbmcgZml4ZXMgdGhpcyBpc3N1ZS5cbiovXG5pZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwuc3RhcnRzV2l0aCgndW1kJykpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoY29tcGlsZXI6T2JqZWN0KTp2b2lkID0+IGNvbXBpbGVyLnBsdWdpbihcbiAgICAgICAgJ2VtaXQnLCAoY29tcGlsYXRpb246T2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvbik6dm9pZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBidW5kbGVOYW1lOnN0cmluZyA9IChcbiAgICAgICAgICAgICAgICB0eXBlb2YgbGlicmFyeU5hbWUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgICApID8gbGlicmFyeU5hbWUgOiBsaWJyYXJ5TmFtZVswXVxuICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFJlcXVlc3Q6c3RyaW5nIGluIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0cy5oYXNPd25Qcm9wZXJ0eShhc3NldFJlcXVlc3QpICYmXG4gICAgICAgICAgICAgICAgICAgIGFzc2V0UmVxdWVzdC5yZXBsYWNlKC8oW14/XSspXFw/LiokLywgJyQxJykuZW5kc1dpdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLmphdmFTY3JpcHQub3V0cHV0RXh0ZW5zaW9uXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNvdXJjZTpzdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0UmVxdWVzdF0uc291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50OnN0cmluZyBpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGFzT3duUHJvcGVydHkocmVwbGFjZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyhyZXF1aXJlXFxcXCgpXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNlc1tyZXBsYWNlbWVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnXCIoXFxcXCkpJywgJ2cnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIGAkMScke3JlcGxhY2VtZW50fSckMmApLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUmVnRXhwKCcoZGVmaW5lXFxcXChcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVuZGxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnXCIsIFxcXFxbLiopXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNlc1tyZXBsYWNlbWVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1wiKC4qXFxcXF0sIGZhY3RvcnlcXFxcKTspJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgYCQxJyR7cmVwbGFjZW1lbnR9JyQyYClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyhyb290XFxcXFspXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1wiKFxcXFxdID0gKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICksIGAkMSdgICsgVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRWYXJpYWJsZU5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVuZGxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgKSArIGAnJDJgKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0UmVxdWVzdF0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBXZWJwYWNrUmF3U291cmNlKHNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgfSl9KVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gYWRkIGF1dG9tYXRpYyBpbWFnZSBjb21wcmVzc2lvblxuLy8gTk9URTogVGhpcyBwbHVnaW4gc2hvdWxkIGJlIGxvYWRlZCBhdCBsYXN0IHRvIGVuc3VyZSB0aGF0IGFsbCBlbWl0dGVkIGltYWdlc1xuLy8gcmFuIHRocm91Z2guXG5wbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5JbWFnZW1pbihcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuY29udGVudCkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBjb250ZXh0IHJlcGxhY2VtZW50c1xuZm9yIChcbiAgICBjb25zdCBjb250ZXh0UmVwbGFjZW1lbnQ6QXJyYXk8c3RyaW5nPiBvZlxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5jb250ZXh0XG4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suQ29udGV4dFJlcGxhY2VtZW50UGx1Z2luKFxuICAgICAgICAuLi5jb250ZXh0UmVwbGFjZW1lbnQubWFwKCh2YWx1ZTpzdHJpbmcpOmFueSA9PiAobmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgJ2NvbmZpZ3VyYXRpb24nLCAnX19kaXJuYW1lJywgJ19fZmlsZW5hbWUnLCBgcmV0dXJuICR7dmFsdWV9YFxuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgKSkoY29uZmlndXJhdGlvbiwgX19kaXJuYW1lLCBfX2ZpbGVuYW1lKSkpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gbG9hZGVyIGhlbHBlclxuY29uc3QgcmVqZWN0RmlsZVBhdGhJbkRlcGVuZGVuY2llczpGdW5jdGlvbiA9IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4ge1xuICAgIGZpbGVQYXRoID0gSGVscGVyLnN0cmlwTG9hZGVyKGZpbGVQYXRoKVxuICAgIHJldHVybiBIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgIGZpbGVQYXRoLCBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSlcbn1cbmNvbnN0IGxvYWRlcjpPYmplY3QgPSB7fVxuY29uc3QgZXZhbHVhdGU6RnVuY3Rpb24gPSAoY29kZTpzdHJpbmcsIGZpbGVQYXRoOnN0cmluZyk6YW55ID0+IChuZXcgRnVuY3Rpb24oXG4gICAgJ2NvbmZpZ3VyYXRpb24nLCAnZmlsZVBhdGgnLCAnbG9hZGVyJywgJ3JlamVjdEZpbGVQYXRoSW5EZXBlbmRlbmNpZXMnLFxuICAgIGByZXR1cm4gJHtjb2RlfWBcbi8vIElnbm9yZVR5cGVDaGVja1xuKSkoY29uZmlndXJhdGlvbiwgZmlsZVBhdGgsIGxvYWRlciwgcmVqZWN0RmlsZVBhdGhJbkRlcGVuZGVuY2llcylcblRvb2xzLmV4dGVuZE9iamVjdChsb2FkZXIsIHtcbiAgICAvLyBDb252ZXJ0IHRvIGNvbXBhdGlibGUgbmF0aXZlIHdlYiB0eXBlcy5cbiAgICAvLyByZWdpb24gZ2VuZXJpYyB0ZW1wbGF0ZVxuICAgIGVqczoge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbC5jb25jYXQoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aClcbiAgICAgICAgKS5pbmNsdWRlcyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgICgoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5leGNsdWRlID09PSBudWxsKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICBpbmNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoW1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5iYXNlXG4gICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucy5kaXJlY3RvcnlQYXRocykpLFxuICAgICAgICB0ZXN0OiAvXig/IS4rXFwuaHRtbFxcLmVqcyQpLitcXC5lanMkL2ksXG4gICAgICAgIHVzZTogW1xuICAgICAgICAgICAge2xvYWRlcjogJ2ZpbGU/bmFtZT1bcGF0aF1bbmFtZV0nICsgKEJvb2xlYW4oXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5vcHRpb25zLmNvbXBpbGVTdGVwcyAlIDJcbiAgICAgICAgICAgICkgPyAnLmpzJyA6ICcnKSArIGA/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVtoYXNoXWB9LFxuICAgICAgICAgICAge2xvYWRlcjogJ2V4dHJhY3QnfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMub3B0aW9uc1xuICAgICAgICAgICAgfVxuICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHNjcmlwdFxuICAgIHNjcmlwdDoge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgKSA/IHJlamVjdEZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmV4Y2x1ZGUsIGZpbGVQYXRoXG4gICAgICAgICAgICApLFxuICAgICAgICBpbmNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoW1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5qYXZhU2NyaXB0XG4gICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucy5kaXJlY3RvcnlQYXRocykpLFxuICAgICAgICB0ZXN0OiAvXFwuanMoPzpcXD8uKik/JC9pLFxuICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgLmxvYWRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgLm9wdGlvbnNcbiAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGh0bWwgdGVtcGxhdGVcbiAgICBodG1sOiB7XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgb25seSBmb3IgdGhlIG1haW4gZW50cnkgdGVtcGxhdGUuXG4gICAgICAgIG1haW46IHtcbiAgICAgICAgICAgIHRlc3Q6IG5ldyBSZWdFeHAoJ14nICsgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUuZmlsZVBhdGhcbiAgICAgICAgICAgICkgKyAnKD86XFxcXD8uKik/JCcpLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLnVzZVxuICAgICAgICB9LFxuICAgICAgICBlanM6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbC5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAgICAgICAgICAgICApLm1hcCgoaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24pOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aClcbiAgICAgICAgICAgICkuaW5jbHVkZXMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAgICAgKChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5leGNsdWRlID09PSBudWxsKSA/XG4gICAgICAgICAgICAgICAgICAgIGZhbHNlIDogZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5leGNsdWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgpKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQudGVtcGxhdGUsXG4gICAgICAgICAgICB0ZXN0OiAvXFwuaHRtbFxcLmVqcyg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IFtcbiAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZmlsZT9uYW1lPScgKyBwYXRoLmpvaW4ocGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LnRlbXBsYXRlXG4gICAgICAgICAgICAgICAgKSwgJ1tuYW1lXScgKyAoQm9vbGVhbihcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucy5jb21waWxlU3RlcHNcbiAgICAgICAgICAgICAgICAgICAgJSAyXG4gICAgICAgICAgICAgICAgKSA/ICcuanMnIDogJycpICsgYD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdYCl9XG4gICAgICAgICAgICBdLmNvbmNhdCgoQm9vbGVhbihcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zLmNvbXBpbGVTdGVwcyAlIDJcbiAgICAgICAgICAgICkgPyBbXSA6XG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApLCB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9uc1xuICAgICAgICAgICAgfSkuY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgaHRtbDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICAgICAgKS5pbmNsdWRlcyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuZXhjbHVkZSA9PT0gbnVsbCkgPyB0cnVlIDpcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC50ZW1wbGF0ZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5odG1sKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW1xuICAgICAgICAgICAgICAgIHtsb2FkZXI6ICdmaWxlP25hbWU9JyArIHBhdGguam9pbihwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQudGVtcGxhdGVcbiAgICAgICAgICAgICAgICApLCBgW25hbWVdLltleHRdPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gKX0sXG4gICAgICAgICAgICAgICAge2xvYWRlcjogJ2V4dHJhY3QnfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwub3B0aW9uc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuYWRkaXRpb25hbC5tYXAoZXZhbHVhdGUpKVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyBMb2FkIGRlcGVuZGVuY2llcy5cbiAgICAvLyByZWdpb24gc3R5bGVcbiAgICBzdHlsZToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICApID8gcmVqZWN0RmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgIGluY2x1ZGU6IEhlbHBlci5ub3JtYWxpemVQYXRocyhbXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUubG9jYXRpb25zLmRpcmVjdG9yeVBhdGhzKSksXG4gICAgICAgIHRlc3Q6IC9cXC5zP2Nzcyg/OlxcPy4qKT8kL2ksXG4gICAgICAgIHVzZTogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuc3R5bGUubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnN0eWxlLm9wdGlvbnNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0LmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0Lm9wdGlvbnNcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICAgICAgICAgICAgICAubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50OiAncG9zdGNzcycsXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbnM6ICgpOkFycmF5PE9iamVjdD4gPT4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0ltcG9ydCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRGVwZW5kZW5jeVRvOiB3ZWJwYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Q6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NDU1NuZXh0KHticm93c2VyczogJz4gMCUnfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IENoZWNraW5nIHBhdGggZG9lc24ndCB3b3JrIGlmIGZvbnRzIGFyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZWQgaW4gbGlicmFyaWVzIHByb3ZpZGVkIGluIGFub3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiB0aGFuIHRoZSBwcm9qZWN0IGl0c2VsZiBsaWtlIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NGb250UGF0aCh7Y2hlY2tQYXRoOiBmYWxzZX0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc1VSTCh7dXJsOiAncmViYXNlJ30pLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc1Nwcml0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckJ5OiAoKTpQcm9taXNlPG51bGw+ID0+IG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTpQcm9taXNlPG51bGw+ID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmltYWdlID8gcmVzb2x2ZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9va3M6IHtvblNhdmVTcHJpdGVzaGVldDogKGltYWdlOk9iamVjdCk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihpbWFnZS5zcHJpdGVQYXRoLCBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5pbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5pbWFnZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXNoZWV0UGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGVQYXRoOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldC5vcHRpb25zKVxuICAgICAgICAgICAgfVxuICAgICAgICBdLmNvbmNhdChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0LmFkZGl0aW9uYWxcbiAgICAgICAgICAgICAgICAubWFwKGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIE9wdGltaXplIGxvYWRlZCBhc3NldHMuXG4gICAgLy8gcmVnaW9uIGZvbnRcbiAgICBmb250OiB7XG4gICAgICAgIGVvdDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5lb3QoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3Qub3B0aW9uc1xuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHN2Zzoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5zdmcoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcub3B0aW9uc1xuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHR0Zjoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC50dGYoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYub3B0aW9uc1xuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHdvZmY6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5leGNsdWRlLCBmaWxlUGF0aFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC53b2ZmMj8oPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5vcHRpb25zXG4gICAgICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBpbWFnZVxuICAgIGltYWdlOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgKSA/IHJlamVjdEZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgIGV2YWx1YXRlKGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuaW1hZ2UsXG4gICAgICAgIHRlc3Q6IC9cXC4oPzpwbmd8anBnfGljb3xnaWYpKD86XFw/LiopPyQvaSxcbiAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UubG9hZGVyLFxuICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmZpbGVcbiAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBkYXRhXG4gICAgZGF0YToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbC5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBwYXRoLmV4dG5hbWUoSGVscGVyLnN0cmlwTG9hZGVyKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICkgfHwgKChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gcmVqZWN0RmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmRhdGEsXG4gICAgICAgIHRlc3Q6IC8uKy8sXG4gICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEubG9hZGVyLFxuICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEub3B0aW9uc1xuICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuYWRkaXRpb25hbC5tYXAoZXZhbHVhdGUpKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbn0pXG5pZiAoY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQpIHtcbiAgICBsb2FkZXIuc3R5bGUudXNlLnNoaWZ0KClcbiAgICBsb2FkZXIuc3R5bGUudXNlID0gcGx1Z2lucy5FeHRyYWN0VGV4dC5leHRyYWN0KHt1c2U6IGxvYWRlci5zdHlsZS51c2V9KVxufVxuLy8gLyBlbmRyZWdpb25cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGNvbmZpZ3VyYXRpb25cbmNvbnN0IHdlYnBhY2tDb25maWd1cmF0aW9uOldlYnBhY2tDb25maWd1cmF0aW9uID0ge1xuICAgIGJhaWw6IHRydWUsXG4gICAgY2FjaGU6IGNvbmZpZ3VyYXRpb24uY2FjaGUubWFpbixcbiAgICBjb250ZXh0OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICBkZXZ0b29sOiBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50LnRvb2wsXG4gICAgZGV2U2VydmVyOiBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50LnNlcnZlcixcbiAgICAvLyByZWdpb24gaW5wdXRcbiAgICBlbnRyeTogY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCxcbiAgICBleHRlcm5hbHM6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMsXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczogY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgYWxpYXNGaWVsZHM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLFxuICAgICAgICBtYWluRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICBtYWluRmlsZXM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgbW9kdWxlRXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLm1vZHVsZSxcbiAgICAgICAgbW9kdWxlczogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzKSxcbiAgICAgICAgdW5zYWZlQ2FjaGU6IGNvbmZpZ3VyYXRpb24uY2FjaGUudW5zYWZlXG4gICAgfSxcbiAgICByZXNvbHZlTG9hZGVyOiB7XG4gICAgICAgIGFsaWFzOiBjb25maWd1cmF0aW9uLmxvYWRlci5hbGlhc2VzLFxuICAgICAgICBhbGlhc0ZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgZXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5sb2FkZXIuZXh0ZW5zaW9ucy5maWxlLFxuICAgICAgICBtYWluRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICBtYWluRmlsZXM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgbW9kdWxlRXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5sb2FkZXIuZXh0ZW5zaW9ucy5tb2R1bGUsXG4gICAgICAgIG1vZHVsZXM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gb3V0cHV0XG4gICAgb3V0cHV0OiB7XG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQpLFxuICAgICAgICBoYXNoRnVuY3Rpb246IGNvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobSxcbiAgICAgICAgbGlicmFyeTogbGlicmFyeU5hbWUsXG4gICAgICAgIGxpYnJhcnlUYXJnZXQ6IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ2J1aWxkOmRsbCdcbiAgICAgICAgKSA/ICd2YXInIDogY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuc2VsZixcbiAgICAgICAgcGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICBwdWJsaWNQYXRoOiBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LnB1YmxpYyxcbiAgICAgICAgcGF0aGluZm86IGNvbmZpZ3VyYXRpb24uZGVidWcsXG4gICAgICAgIHVtZE5hbWVkRGVmaW5lOiB0cnVlXG4gICAgfSxcbiAgICBwZXJmb3JtYW5jZTogY29uZmlndXJhdGlvbi5wZXJmb3JtYW5jZUhpbnRzLFxuICAgIHRhcmdldDogY29uZmlndXJhdGlvbi50YXJnZXRUZWNobm9sb2d5LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIG1vZHVsZToge1xuICAgICAgICBydWxlczogY29uZmlndXJhdGlvbi5tb2R1bGUuYWRkaXRpb25hbC5tYXAoKFxuICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdFxuICAgICAgICApOlBsYWluT2JqZWN0ID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5leGNsdWRlIHx8ICdmYWxzZScsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUgJiYgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uaW5jbHVkZSwgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHRcbiAgICAgICAgICAgICAgICApIHx8IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYmFzZSxcbiAgICAgICAgICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLnRlc3QsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0KSksXG4gICAgICAgICAgICAgICAgdXNlOiBldmFsdWF0ZShsb2FkZXJDb25maWd1cmF0aW9uLnVzZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY29uY2F0KFtcbiAgICAgICAgICAgIGxvYWRlci5lanMsXG4gICAgICAgICAgICBsb2FkZXIuc2NyaXB0LFxuICAgICAgICAgICAgbG9hZGVyLmh0bWwubWFpbiwgbG9hZGVyLmh0bWwuZWpzLCBsb2FkZXIuaHRtbC5odG1sLFxuICAgICAgICAgICAgbG9hZGVyLnN0eWxlLFxuICAgICAgICAgICAgbG9hZGVyLmZvbnQuZW90LCBsb2FkZXIuZm9udC5zdmcsIGxvYWRlci5mb250LnR0ZixcbiAgICAgICAgICAgIGxvYWRlci5mb250LndvZmYsXG4gICAgICAgICAgICBsb2FkZXIuaW1hZ2UsXG4gICAgICAgICAgICBsb2FkZXIuZGF0YVxuICAgICAgICBdKVxuICAgIH0sXG4gICAgbm9kZTogY29uZmlndXJhdGlvbi5ub2RlRW52aXJvbm1lbnQsXG4gICAgcGx1Z2luczogcGx1Z2luSW5zdGFuY2VzXG59XG5pZiAoXG4gICAgIUFycmF5LmlzQXJyYXkoY29uZmlndXJhdGlvbi5tb2R1bGUuc2tpcFBhcnNlUmVndWxhckV4cHJlc3Npb25zKSB8fFxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9ucy5sZW5ndGhcbilcbiAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbi5tb2R1bGUubm9QYXJzZSA9XG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9uc1xuaWYgKGNvbmZpZ3VyYXRpb24uc2hvd0NvbmZpZ3VyYXRpb24pIHtcbiAgICBjb25zb2xlLmluZm8oJ1VzaW5nIGludGVybmFsIGNvbmZpZ3VyYXRpb246JywgdXRpbC5pbnNwZWN0KGNvbmZpZ3VyYXRpb24sIHtcbiAgICAgICAgZGVwdGg6IG51bGx9KSlcbiAgICBjb25zb2xlLmluZm8oJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICBjb25zb2xlLmluZm8oJ1VzaW5nIHdlYnBhY2sgY29uZmlndXJhdGlvbjonLCB1dGlsLmluc3BlY3QoXG4gICAgICAgIHdlYnBhY2tDb25maWd1cmF0aW9uLCB7ZGVwdGg6IG51bGx9KSlcbn1cbi8vIGVuZHJlZ2lvblxuZXhwb3J0IGRlZmF1bHQgd2VicGFja0NvbmZpZ3VyYXRpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19