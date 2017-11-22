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
if (_configurator2.default.module.optimizer.babelMinify.bundle) pluginInstances.push((0, _keys2.default)(_configurator2.default.module.optimizer.babelMinify.bundle).length ? new plugins.BabelMinify(_configurator2.default.module.optimizer.babelMinify.bundle) : new plugins.BabelMinify());
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
            return _configurator2.default.module.preprocessor.javaScript.exclude === null ? rejectFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.preprocessor.javaScript.exclude, filePath);
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
            return _configurator2.default.module.cascadingStyleSheet.exclude === null ? rejectFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.cascadingStyleSheet.exclude, filePath);
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
            return _configurator2.default.module.optimizer.image.exclude === null ? rejectFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.optimizer.image.exclude, filePath);
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
            return _configurator2.default.extensions.file.internal.includes(_path3.default.extname(_helper2.default.stripLoader(filePath))) || (_configurator2.default.module.optimizer.data.exclude === null ? rejectFilePathInDependencies(filePath) : evaluate(_configurator2.default.module.optimizer.data.exclude, filePath));
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0E7Ozs7QUFJQTs7QUFDQTs7SUFBWSxVOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUtBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFXQTs7OztBQU1BOzs7O0FBQ0E7Ozs7QUFLQTs7OztBQVFBOzs7Ozs7OztBQXRDQTs7QUFUQTs7QUFGQTtBQVlBLElBQUk7QUFDQSxZQUFRLDZCQUFSO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7QUFHbEIsSUFBTSxVQUFVLFFBQVEsc0JBQVIsR0FBaEI7OztBQUdBLFFBQVEsV0FBUixHQUFzQixRQUFRLFdBQTlCO0FBQ0EsUUFBUSxJQUFSLEdBQWUsUUFBUSxJQUF2QjtBQUNBLFFBQVEsV0FBUixHQUFzQixRQUFRLFdBQTlCO0FBQ0EsUUFBUSxrQkFBUixHQUE2QixRQUFRLCtCQUFSLENBQTdCO0FBQ0EsUUFBUSxXQUFSLEdBQXNCLFFBQVEsV0FBOUI7QUFDQSxRQUFRLE9BQVIsR0FBa0IsUUFBUSx5QkFBUixDQUFsQjtBQUNBLFFBQVEsUUFBUixHQUFtQixRQUFRLHlCQUFSLEVBQW1DLE9BQXREO0FBQ0EsUUFBUSxPQUFSLEdBQWtCLFFBQVEsZ0JBQVIsQ0FBbEI7QUFPQTs7QUFKQTs7O0FBUUE7QUFDQTtBQUNBOztBQUVBLFFBQVEsS0FBUixDQUFjLFFBQVEsT0FBUixDQUFnQixhQUFoQixDQUFkLEVBQThDLE9BQTlDLEdBQXdELFlBRWxEO0FBQ0YseUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QixLQUFLLE9BQTlCLEVBQXVDLE1BQXZDLEVBQStDLEtBQUssT0FBcEQ7O0FBREUsc0NBREMsU0FDRDtBQURDLGlCQUNEO0FBQUE7O0FBRUYsV0FBTyxxQkFBdUIsSUFBdkIsOEJBQTRCLElBQTVCLFNBQXFDLFNBQXJDLEVBQVA7QUFDSCxDQUxEO0FBTUE7O0FBRUEsSUFBTSxnQ0FDRixzQkFBd0IsWUFENUI7QUFFQSxRQUFRLEtBQVIsQ0FBYyxRQUFRLE9BQVIsQ0FBZ0IsY0FBaEIsQ0FBZCxFQUErQyxPQUEvQyxDQUF1RCxZQUF2RCxHQUFzRSxVQUNsRSxHQURrRSxFQUV6RDtBQUFBLHVDQURNLG1CQUNOO0FBRE0sMkJBQ047QUFBQTs7QUFDVCxRQUFJLElBQUksS0FBSixDQUFVLFlBQVYsQ0FBSixFQUNJLE9BQU8sS0FBUDtBQUNKLFdBQU8sOEJBQThCLEtBQTlCLHdCQUNzQixDQUFDLEdBQUQsRUFBTSxNQUFOLENBQWEsbUJBQWIsQ0FEdEIsQ0FBUDtBQUVILENBUEQ7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksb0JBQUo7QUFDQSxJQUFJLDJDQUFrQyx1QkFBYyxXQUFwRCxFQUNJLGNBQWMsdUJBQWMsV0FBNUIsQ0FESixLQUVLLElBQUksb0JBQVksdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQUE3QyxFQUF5RCxNQUF6RCxHQUFrRSxDQUF0RSxFQUNELGNBQWMsUUFBZCxDQURDLEtBRUE7QUFDRCxrQkFBYyx1QkFBYyxJQUE1QjtBQUNBLFFBQUksdUJBQWMsWUFBZCxDQUEyQixJQUEzQixLQUFvQyxLQUF4QyxFQUNJLGNBQWMscUJBQU0sZ0NBQU4sQ0FBdUMsV0FBdkMsQ0FBZDtBQUNQO0FBQ0Q7QUFDQTtBQUNBLElBQU0sa0JBQWdDLENBQ2xDLElBQUksa0JBQVEsb0JBQVosRUFEa0MsRUFFbEMsSUFBSSxrQkFBUSxRQUFSLENBQWlCLHFCQUFyQixDQUEyQyxJQUEzQyxDQUZrQyxDQUF0QztBQUlBLElBQUksdUJBQWMsS0FBbEIsRUFDSSxnQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxrQkFBUSxrQkFBWixFQUFyQjtBQUNKOzs7Ozs7QUFDQSxvREFBbUMsdUJBQWMsU0FBZCxDQUF3QixhQUEzRDtBQUFBLFlBQVcsYUFBWDs7QUFDSSx3QkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxrQkFBUSxZQUFaLENBQXlCLElBQUksTUFBSixDQUFXLGFBQVgsQ0FBekIsQ0FBckI7QUFESixLLENBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OzsyQkFDVyxNO0FBQ1AsUUFBSSx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLE1BQWxDLENBQXlDLGNBQXpDLENBQXdELE1BQXhELENBQUosRUFBcUU7QUFDakUsWUFBTSxTQUFnQixJQUFJLE1BQUosQ0FBVyxNQUFYLENBQXRCO0FBQ0Esd0JBQWdCLElBQWhCLENBQXFCLElBQUksa0JBQVEsNkJBQVosQ0FDakIsTUFEaUIsRUFDVCxVQUFDLFFBQUQsRUFBb0M7QUFDeEMscUJBQVMsT0FBVCxHQUFtQixTQUFTLE9BQVQsQ0FBaUIsT0FBakIsQ0FDZixNQURlLEVBQ1AsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxNQUFsQyxDQUF5QyxNQUF6QyxDQURPLENBQW5CO0FBRUgsU0FKZ0IsQ0FBckI7QUFLSDs7O0FBUkwsS0FBSyxJQUFNLE1BQVgsSUFBNEIsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxNQUE5RDtBQUFBLFVBQVcsTUFBWDtBQUFBLEMsQ0FTQTtBQUNBO0FBQ0EsSUFBSSxnQkFBd0IsS0FBNUI7QUFDQSxJQUFJLHVCQUFjLHlCQUFkLENBQXdDLENBQXhDLE1BQStDLFdBQW5EO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0kseURBQWdELHVCQUFjLEtBQWQsQ0FBb0IsSUFBcEU7QUFBQSxnQkFBUyxpQkFBVDs7QUFDSSxnQkFBSSxxQkFBTSxVQUFOLENBQWlCLGtCQUFrQixRQUFsQixDQUEyQixRQUE1QyxDQUFKLEVBQTJEO0FBQ3ZELGdDQUFnQixJQUFoQixDQUFxQixJQUFJLFFBQVEsSUFBWixDQUFpQixxQkFBTSxZQUFOLENBQ2xDLEVBRGtDLEVBQzlCLGlCQUQ4QixFQUNYO0FBQ25CLDhCQUFVLGtCQUFrQixRQUFsQixDQUEyQixPQURsQixFQURXLENBQWpCLENBQXJCO0FBR0EsZ0NBQWdCLElBQWhCO0FBQ0g7QUFOTDtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxDLENBUUE7QUFDQTtBQUNBLElBQUksaUJBQWlCLHVCQUFjLE9BQS9CLElBQTBDLHFCQUFNLFVBQU4sQ0FDMUMsdUJBQWMsT0FBZCxDQUFzQixJQURvQixDQUE5QyxFQUdJLGdCQUFnQixJQUFoQixDQUFxQixJQUFJLFFBQVEsT0FBWixDQUFvQix1QkFBYyxPQUFsQyxDQUFyQjtBQUNKO0FBQ0E7QUFDQSxJQUFJLGlCQUFpQix1QkFBYyxPQUFuQyxFQUE0QztBQUN4QyxRQUFJLENBQUMsQ0FBQyxPQUFELEVBQVUsY0FBVixFQUEwQixRQUExQixDQUNELHVCQUFjLHlCQUFkLENBQXdDLENBQXhDLENBREMsQ0FBTDtBQUFBLG1CQUdtQyxDQUMzQixDQUFDLHFCQUFELEVBQXdCLEtBQXhCLENBRDJCLEVBRTNCLENBQUMsWUFBRCxFQUFlLElBQWYsQ0FGMkIsQ0FIbkM7O0FBR0k7QUFBSyxnQkFBTSxlQUFOO0FBSUQsZ0JBQUksdUJBQWMsT0FBZCxDQUFzQixLQUFLLENBQUwsQ0FBdEIsQ0FBSixFQUFvQztBQUNoQyxvQkFBTSxVQUF3QixvQkFDMUIsdUJBQWMsT0FBZCxDQUFzQixLQUFLLENBQUwsQ0FBdEIsQ0FEMEIsQ0FBOUI7QUFEZ0M7QUFBQTtBQUFBOztBQUFBO0FBR2hDLHFFQUEwQixPQUExQjtBQUFBLDRCQUFXLElBQVg7O0FBQ0ksK0NBQWMsT0FBZCxDQUFzQixRQUF0QixDQUErQixJQUEvQixDQUFvQyxlQUFLLFFBQUwsQ0FDaEMsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQURNLEVBRWhDLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsS0FBSyxDQUFMLENBQWhDLENBRmdDLEtBRzdCLElBSDZCLFNBR3JCLEtBQUssQ0FBTCxDQUhxQixTQUdWLHVCQUFjLGFBSEosUUFBcEM7QUFESjtBQUhnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBUW5DO0FBWkw7QUFISixLQWdCQSxnQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxRQUFRLE9BQVosQ0FBb0IsdUJBQWMsT0FBbEMsQ0FBckI7QUFDSDtBQUNEO0FBQ0E7QUFDQSxJQUFJLHVCQUFjLFdBQWQsQ0FBMEIsV0FBMUIsSUFBMEMsaUJBQWlCLENBQzNELE9BRDJELEVBQ2xELGNBRGtELEVBRTdELFFBRjZELENBRXBELHVCQUFjLHlCQUFkLENBQXdDLENBQXhDLENBRm9ELENBQS9ELEVBR0ksZ0JBQWdCLElBQWhCLENBQXFCLElBQUksUUFBUSxXQUFaLENBQ2pCLHVCQUFjLFdBQWQsQ0FBMEIsV0FEVCxDQUFyQjtBQUVKO0FBQ0E7QUFDQSxJQUFJLHVCQUFjLEtBQWQsQ0FBb0IsV0FBeEIsRUFDSSxnQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxrQkFBUSxZQUFaLENBQ2pCLHVCQUFjLEtBQWQsQ0FBb0IsV0FESCxDQUFyQjtBQUVKLElBQUksdUJBQWMsTUFBZCxDQUFxQixPQUF6QixFQUNJLGdCQUFnQixJQUFoQixDQUFxQixJQUFJLGtCQUFRLGFBQVosQ0FDakIsdUJBQWMsTUFBZCxDQUFxQixPQURKLENBQXJCO0FBRUo7QUFDQTtBQUNBO0FBQ0EsSUFBSSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLFdBQS9CLENBQTJDLE1BQS9DLEVBQ0ksZ0JBQWdCLElBQWhCLENBQXFCLG9CQUNqQix1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLFdBQS9CLENBQTJDLE1BRDFCLEVBRW5CLE1BRm1CLEdBR2pCLElBQUksUUFBUSxXQUFaLENBQ0ksdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixXQUEvQixDQUEyQyxNQUQvQyxDQUhpQixHQUtiLElBQUksUUFBUSxXQUFaLEVBTFI7QUFNSjtBQUNBO0FBQ0EsZ0JBQWdCLElBQWhCLENBQXFCLEVBQUMsT0FBTyxlQUFDLFFBQUQsRUFBMEI7QUFDbkQsaUJBQVMsTUFBVCxDQUFnQixNQUFoQixFQUF3QixVQUNwQixXQURvQixFQUNBLFFBREEsRUFFZDtBQUNOLGlCQUFLLElBQU0sUUFBWCxJQUE2QixZQUFZLE1BQXpDO0FBQ0ksb0JBQUksWUFBWSxNQUFaLENBQW1CLGNBQW5CLENBQWtDLFFBQWxDLENBQUosRUFBZ0Q7QUFDNUMsd0JBQU0sV0FBa0IsU0FBUSxPQUFSLENBQWdCLFVBQWhCLEVBQTRCLEVBQTVCLENBQXhCO0FBQ0Esd0JBQU0sUUFBZSxpQkFBTyxrQkFBUCxDQUNqQixRQURpQixFQUNQLHVCQUFjLEtBQWQsQ0FBb0IsS0FEYixFQUNvQix1QkFBYyxJQURsQyxDQUFyQjtBQUVBLHdCQUFJLFNBQVEsdUJBQWMsWUFBZCxDQUEyQixLQUEzQixDQUFSLElBQTRDLENBQUUsSUFBSSxNQUFKLENBQzlDLHVCQUFjLFlBQWQsQ0FBMkIsS0FBM0IsRUFDSyxnQ0FGeUMsQ0FBRCxDQUc5QyxJQUg4QyxDQUd6QyxRQUh5QyxDQUFqRCxFQUdtQjtBQUNmLDRCQUFNLFNBQWlCLFlBQVksTUFBWixDQUFtQixRQUFuQixFQUE0QixNQUE1QixFQUF2QjtBQUNBLDRCQUFJLE9BQU8sTUFBUCxLQUFrQixRQUF0QixFQUNJLFlBQVksTUFBWixDQUFtQixRQUFuQixJQUE4Qiw4QkFDMUIsdUJBQWMsWUFBZCxDQUEyQixLQUEzQixFQUFpQyxPQUFqQyxDQUF5QyxPQUF6QyxDQUNJLFFBREosRUFDYyxPQUFPLE9BQVAsQ0FBZSxLQUFmLEVBQXNCLEtBQXRCLENBRGQsQ0FEMEIsQ0FBOUI7QUFHUDtBQUNKO0FBZkwsYUFnQkE7QUFDSCxTQXBCRDtBQXFCSCxLQXRCb0IsRUFBckI7QUF1QkE7QUFDQTtBQUNBLElBQUksaUJBQWlCLENBQUMsQ0FBQyxPQUFELEVBQVUsY0FBVixFQUEwQixRQUExQixDQUNsQix1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQURrQixDQUF0QixFQUdJLGdCQUFnQixJQUFoQixDQUFxQixFQUFDLE9BQU8sZUFBQyxRQUFELEVBQTBCO0FBQ25ELFlBQU0sb0JBQWtDLEVBQXhDO0FBQ0EsaUJBQVMsTUFBVCxDQUFnQixhQUFoQixFQUErQixVQUFDLFdBQUQ7QUFBQSxtQkFDM0IsWUFBWSxNQUFaLENBQ0ksMkNBREo7QUFBQSxvR0FDaUQsaUJBQ3pDLGNBRHlDLEVBQ2IsUUFEYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQ0FJckMsdUJBQWMsT0FBZCxDQUFzQixtQkFBdEIsSUFDQSxvQkFDSSx1QkFBYyxPQUFkLENBQXNCLG1CQUQxQixFQUVFLE1BSEYsSUFHWSx1QkFBYyxPQUFkLENBQXNCLFVBQXRCLElBQ1osb0JBQVksdUJBQWMsT0FBZCxDQUFzQixVQUFsQyxFQUE4QyxNQVJUO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSwyQ0FjN0IsaUJBQU8sc0NBQVAsQ0FDSSxlQUFlLElBRG5CLEVBRUksdUJBQWMsT0FBZCxDQUFzQixtQkFGMUIsRUFHSSx1QkFBYyxPQUFkLENBQXNCLFVBSDFCLEVBSUksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQUo5QixFQUtJLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FDSyxtQkFOVCxFQU9JLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFQaEMsRUFRSSxZQUFZLE1BUmhCLENBZDZCOztBQUFBO0FBVzNCLDBDQVgyQjs7QUF1QmpDLG1EQUFlLElBQWYsR0FBc0IsT0FBTyxPQUE3QjtBQUNBLHNEQUFrQixNQUFsQixDQUF5QixPQUFPLGlCQUFoQztBQXhCaUM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQSxxRUEwQjFCLHNCQUFnQixjQUFoQixDQTFCMEI7O0FBQUE7QUE0QnpDLDZDQUFTLElBQVQsRUFBZSxjQUFmOztBQTVCeUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBRGpEOztBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQUQyQjtBQUFBLFNBQS9CO0FBZ0NBLGlCQUFTLE1BQVQsQ0FBZ0IsWUFBaEI7QUFBQSxpR0FBOEIsa0JBQzFCLFdBRDBCLEVBQ04sUUFETTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR3RCLHdDQUhzQixHQUdVLEVBSFY7QUFBQSxpR0FJZixLQUplO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDJEQUtaLHFCQUFNLE1BQU4sQ0FBYSxLQUFiLENBTFk7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNbEIsNkRBQVMsSUFBVCxDQUFjLHNCQUFZLFVBQUMsT0FBRDtBQUFBLCtEQUN0QixXQUFXLE1BQVgsQ0FBa0IsS0FBbEIsRUFBd0IsVUFBQyxLQUFELEVBQXVCO0FBQzNDLGdFQUFJLEtBQUosRUFDSSxRQUFRLEtBQVIsQ0FBYyxLQUFkO0FBQ0o7QUFDSCx5REFKRCxDQURzQjtBQUFBLHFEQUFaLENBQWQ7O0FBTmtCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3RUFJQSxpQkFKQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUlmLHFDQUplO0FBQUEsc0VBSWYsS0FKZTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSx1Q0FZcEIsa0JBQVEsR0FBUixDQUFZLFFBQVosQ0Fab0I7O0FBQUE7QUFhMUIsMkNBQVcsRUFBWDs7QUFiMEIseURBY2YsTUFkZTtBQWlCdEIsNkNBQVMsSUFBVCxDQUFjLHNCQUFZLFVBQ3RCLE9BRHNCLEVBQ0osTUFESTtBQUFBLCtDQU1mLFdBQVcsT0FBWixDQUNOLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsTUFBaEMsQ0FETSxFQUVOLHVCQUFjLFFBRlIsRUFHTixVQUFDLEtBQUQsRUFBZSxLQUFmLEVBQTRDO0FBQ3hDLGdEQUFJLEtBQUosRUFBVztBQUNQLHVEQUFPLEtBQVA7QUFDQTtBQUNIO0FBQ0QsZ0RBQUksTUFBTSxNQUFOLEtBQWlCLENBQXJCLEVBQ0ksV0FBVyxLQUFYLENBQ0ksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxNQUFoQyxDQURKLEVBQzJDLFVBQ25DLEtBRG1DO0FBQUEsdURBRTdCLFFBQVEsT0FBTyxLQUFQLENBQVIsR0FBd0IsU0FGSztBQUFBLDZDQUQzQyxFQURKLEtBTUk7QUFDUCx5Q0FmSyxDQU5nQjtBQUFBLHFDQUFaLENBQWQ7QUFqQnNCOztBQUFBLHdDQWNBLENBQ3RCLFlBRHNCLEVBQ1IscUJBRFEsQ0FkQTtBQWMxQjtBQUFXLDBDQUFYOztBQUFBLDJDQUFXLE1BQVg7QUFBQSxpQ0FkMEI7QUFBQSx1Q0F1Q3BCLGtCQUFRLEdBQVIsQ0FBWSxRQUFaLENBdkNvQjs7QUFBQTtBQXdDMUI7O0FBeEMwQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUE5Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQTBDSCxLQTVFb0IsRUFBckI7QUE2RUo7QUFDQTtBQUNBLElBQUksdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsTUFBK0MsV0FBbkQsRUFDSSxLQUFLLElBQU0sU0FBWCxJQUErQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBQWhFO0FBQ0ksUUFBSSx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBQWpDLENBQTRDLGNBQTVDLENBQ0EsU0FEQSxDQUFKLEVBRUc7QUFDQyxZQUFNLG1CQUNDLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFBN0IsU0FBcUMsU0FBckMsNEJBREo7QUFHQSxZQUFJLHVCQUFjLG9CQUFkLENBQW1DLFFBQW5DLENBQ0EsZ0JBREEsQ0FBSixFQUVHO0FBQ0MsbUJBQU8sdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQUFqQyxDQUE0QyxTQUE1QyxDQUFQO0FBQ0EsZ0JBQU0sV0FBa0IsaUJBQU8sc0JBQVAsQ0FDcEIsaUJBQU8sV0FBUCxDQUNJLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFEaEMsQ0FEb0IsRUFHakIsRUFBQyxVQUFVLFNBQVgsRUFIaUIsQ0FBeEI7QUFJQSw0QkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxRQUFRLGtCQUFaLENBQStCO0FBQ2hELDBCQUFVLFFBRHNDO0FBRWhELHNCQUFNLElBRjBDO0FBR2hELGtDQUFrQixxQkFBTSxVQUFOLENBQW9CLFFBQXBCO0FBSDhCLGFBQS9CLENBQXJCO0FBS0EsNEJBQWdCLElBQWhCLENBQXFCLElBQUksa0JBQVEsa0JBQVosQ0FBK0I7QUFDaEQseUJBQVMsdUJBQWMsSUFBZCxDQUFtQixPQURvQixFQUNYLFVBQVUsUUFDM0MsZ0JBRDJDLENBREMsRUFBL0IsQ0FBckI7QUFHSDtBQUNKO0FBeEJMLEMsQ0F5Qko7QUFDQTtBQUNBLElBQUksdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsTUFBK0MsV0FBbkQ7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSx5REFBK0IsdUJBQWMsU0FBZCxDQUF3QixjQUF2RDtBQUFBLGdCQUFXLFVBQVg7O0FBQ0ksZ0JBQUksdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQUFqQyxDQUE0QyxjQUE1QyxDQUNBLFVBREEsQ0FBSixFQUdJLGdCQUFnQixJQUFoQixDQUFxQixJQUFJLGtCQUFRLFFBQVIsQ0FBaUIsa0JBQXJCLENBQXdDO0FBQ3pELHVCQUFPLEtBRGtEO0FBRXpELDBCQUFVLEtBRitDO0FBR3pELDBCQUFVLGVBQUssUUFBTCxDQUNOLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFEcEIsRUFFTix1QkFBYyxLQUFkLENBQW9CLE9BQXBCLENBQTRCLFVBRnRCLENBSCtDO0FBTXpELDJCQUFXLFFBTjhDO0FBT3pELHNCQUFNLFVBUG1EO0FBUXpELHlCQUFTO0FBUmdELGFBQXhDLENBQXJCO0FBSlI7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQyxDQWVBO0FBQ0E7QUFDQSxJQUFJLENBQUMsdUJBQWMsTUFBZCxDQUFxQixVQUExQixFQUNJLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFBNUIsR0FBeUMsZUFBSyxPQUFMLENBQ3JDLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsVUFESyxFQUNPLHdCQURQLENBQXpDO0FBRUo7QUFDQTtBQUNBLElBQUksdUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUE0QixtQkFBaEMsRUFDSSxnQkFBZ0IsSUFBaEIsQ0FBcUIsSUFBSSxRQUFRLFdBQVosQ0FBd0I7QUFDekMsZUFBVyxJQUQ4QixFQUN4QixVQUFVLGVBQUssUUFBTCxDQUN2Qix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBREgsRUFFdkIsdUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUE0QixtQkFGTDtBQURjLENBQXhCLENBQXJCO0FBS0o7QUFDQTtBQUNBLElBQUksdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUFqQyxLQUE2QyxjQUFqRDtBQUNJOzs7Ozs7QUFNQSwyQkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLEdBQTJDLFVBQ3ZDLE9BRHVDLEVBQ3ZCLE9BRHVCLEVBQ1AsUUFETyxFQUVqQztBQUNOLGtCQUFVLFFBQVEsT0FBUixDQUFnQixLQUFoQixFQUF1QixFQUF2QixDQUFWO0FBQ0EsWUFBSSxRQUFRLFVBQVIsQ0FBbUIsR0FBbkIsQ0FBSixFQUNJLFVBQVUsZUFBSyxRQUFMLENBQWMsdUJBQWMsSUFBZCxDQUFtQixPQUFqQyxFQUEwQyxPQUExQyxDQUFWO0FBSEU7QUFBQTtBQUFBOztBQUFBO0FBSU4sNkRBRUksdUJBQWMsTUFBZCxDQUFxQixjQUFyQixDQUFvQyxNQUFwQyxDQUNJLHVCQUFjLE1BQWQsQ0FBcUIsY0FEekIsQ0FGSjtBQUFBLG9CQUNVLFNBRFY7O0FBS0ksb0JBQUksUUFBUSxVQUFSLENBQW1CLFNBQW5CLENBQUosRUFBa0M7QUFDOUIsOEJBQVUsUUFBUSxTQUFSLENBQWtCLFVBQVMsTUFBM0IsQ0FBVjtBQUNBLHdCQUFJLFFBQVEsVUFBUixDQUFtQixHQUFuQixDQUFKLEVBQ0ksVUFBVSxRQUFRLFNBQVIsQ0FBa0IsQ0FBbEIsQ0FBVjtBQUNKO0FBQ0g7QUFWTDtBQUpNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBZU4sWUFBSSxrQkFBMEIsaUJBQU8sd0JBQVAsQ0FDMUIsT0FEMEIsRUFDakIsdUJBQWMsSUFBZCxDQUFtQixPQURGLEVBQ1csT0FEWCxFQUUxQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBRlAsRUFHMUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixNQUExQixDQUNJLHVCQUFjLE1BQWQsQ0FBcUIsY0FEekIsRUFFSSx1QkFBYyxNQUFkLENBQXFCLGNBRnpCLEVBR0UsR0FIRixDQUdNLFVBQUMsUUFBRDtBQUFBLG1CQUE0QixlQUFLLE9BQUwsQ0FDOUIsdUJBQWMsSUFBZCxDQUFtQixPQURXLEVBQ0YsUUFERSxDQUE1QjtBQUFBLFNBSE4sRUFLRyxNQUxILENBS1UsVUFBQyxRQUFEO0FBQUEsbUJBQ04sQ0FBQyx1QkFBYyxJQUFkLENBQW1CLE9BQW5CLENBQTJCLFVBQTNCLENBQXNDLFFBQXRDLENBREs7QUFBQSxTQUxWLENBSDBCLEVBVXZCLHVCQUFjLE1BQWQsQ0FBcUIsT0FWRSxFQVcxQix1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLE1BWFIsRUFXZ0IsdUJBQWMsVUFYOUIsRUFZMUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxJQVpOLEVBWVksdUJBQWMsSUFBZCxDQUFtQixNQVovQixFQWExQix1QkFBYyxNQUFkLENBQXFCLGNBYkssRUFjMUIsdUJBQWMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixTQWRELEVBZTFCLHVCQUFjLE9BQWQsQ0FBc0IsSUFBdEIsQ0FBMkIsYUFmRCxFQWdCMUIsdUJBQWMsT0FBZCxDQUFzQixrQkFoQkksRUFpQjFCLHVCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsUUFBakMsQ0FBMEMsT0FBMUMsQ0FBa0QsT0FqQnhCLEVBa0IxQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFFBQWpDLENBQTBDLE9BQTFDLENBQWtELE9BbEJ4QixFQW1CMUIsdUJBQWMsT0FBZCxDQUFzQixlQUF0QixDQUFzQyxNQW5CWixFQW9CMUIsdUJBQWMsT0FBZCxDQUFzQixlQUF0QixDQUFzQyxPQXBCWixFQXFCMUIsdUJBQWMsUUFyQlksQ0FBOUI7QUFzQkEsWUFBSSxlQUFKLEVBQXFCO0FBQ2pCLGdCQUFJLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxRQUFmLENBQ0EsdUJBQWMsWUFBZCxDQUEyQixRQUQzQixLQUVDLFdBQVcsdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUZqRCxFQUdJLGtCQUFrQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLENBQ2QsT0FEYyxDQUFsQjtBQUVKLGdCQUFJLHVCQUFjLFlBQWQsQ0FBMkIsUUFBM0IsS0FBd0MsS0FBNUMsRUFDSSxrQkFBa0IscUJBQU0sZ0NBQU4sQ0FDZCxlQURjLEVBQ0csZ0JBREgsQ0FBbEI7QUFFSixtQkFBTyxTQUNILElBREcsRUFDRyxlQURILEVBQ29CLHVCQUFjLFlBQWQsQ0FBMkIsUUFEL0MsQ0FBUDtBQUVIO0FBQ0QsZUFBTyxVQUFQO0FBQ0gsS0FwREQ7QUFxREo7QUFDQTtBQUNBLElBQUksdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsTUFBK0MsV0FBbkQsRUFBZ0U7QUFDNUQsUUFBSSxtQkFBMkIsS0FBL0I7QUFDQSxTQUFLLElBQU0sV0FBWCxJQUErQix1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBQWhFO0FBQ0ksWUFBSSx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBQWpDLENBQTRDLGNBQTVDLENBQ0EsV0FEQSxDQUFKLEVBR0ksSUFBSSx1QkFBYyxTQUFkLENBQXdCLFdBQXhCLENBQW9DLFFBQXBDLENBQTZDLFdBQTdDLENBQUosRUFDSSxtQkFBbUIsSUFBbkIsQ0FESixLQUdJLE9BQU8sdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQUFqQyxDQUE0QyxXQUE1QyxDQUFQO0FBUFosS0FRQSxJQUFJLGdCQUFKLEVBQXNCO0FBQ2xCLHNCQUFjLGtCQUFkO0FBQ0Esd0JBQWdCLElBQWhCLENBQXFCLElBQUksa0JBQVEsU0FBWixDQUFzQjtBQUN2QyxrQkFBUyx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBQW5DLDhCQUR1QztBQUV2QyxrQkFBTTtBQUZpQyxTQUF0QixDQUFyQjtBQUlILEtBTkQsTUFPSSxRQUFRLElBQVIsQ0FBYSx3QkFBYjtBQUNQO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLElBQWhCLENBQXFCLEVBQUMsT0FBTyxlQUFDLFFBQUQ7QUFBQSxlQUEwQixTQUFTLE1BQVQsQ0FDbkQsYUFEbUQsRUFDcEMsVUFBQyxXQUFELEVBQTZCO0FBQ3hDLHdCQUFZLE1BQVosQ0FBbUIsc0NBQW5CLEVBQTJELFVBQ3ZELGNBRHVELEVBQzNCLFFBRDJCLEVBRWpEO0FBQUEsNEJBQ2dDLENBQ2xDLGVBQWUsSUFEbUIsRUFDYixlQUFlLElBREYsQ0FEaEM7O0FBQ04sNkRBRUc7QUFGRSx3QkFBTSxpQkFBTjtBQUdELHdCQUFJLFNBQWUsQ0FBbkI7QUFERDtBQUFBO0FBQUE7O0FBQUE7QUFFQyx5RUFBOEIsSUFBOUIsaUhBQW9DO0FBQUEsZ0NBQXpCLEdBQXlCOztBQUNoQyxnQ0FBSSx1QkFBdUIsSUFBdkIsQ0FBNEIsZUFBSyxRQUFMLENBQzVCLElBQUksVUFBSixDQUFlLEdBQWYsSUFBc0IsSUFBSSxVQUFKLENBQWUsSUFBckMsSUFBNkMsRUFEakIsQ0FBNUIsQ0FBSixFQUdJLEtBQUssTUFBTCxDQUFZLE1BQVosRUFBbUIsQ0FBbkI7QUFDSixzQ0FBUyxDQUFUO0FBQ0g7QUFSRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU0Y7QUFDRCxvQkFBTSxTQUF1QixLQUFLLEtBQUwsQ0FDekIsZUFBZSxNQUFmLENBQXNCLFNBREcsQ0FBN0I7QUFFQSxvQkFBSSxRQUFlLENBQW5CO0FBZk07QUFBQTtBQUFBOztBQUFBO0FBZ0JOLHFFQUFrQyxNQUFsQyxpSEFBMEM7QUFBQSw0QkFBL0IsWUFBK0I7O0FBQ3RDLDRCQUFJLHVCQUF1QixJQUF2QixDQUE0QixlQUFLLFFBQUwsQ0FBYyxZQUFkLENBQTVCLENBQUosRUFDSSxPQUFPLE1BQVAsQ0FBYyxLQUFkLEVBQXFCLENBQXJCO0FBQ0osaUNBQVMsQ0FBVDtBQUNIO0FBcEJLO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBcUJOLCtCQUFlLE1BQWYsQ0FBc0IsU0FBdEIsR0FBa0MseUJBQWUsTUFBZixDQUFsQztBQUNBLHlCQUFTLElBQVQsRUFBZSxjQUFmO0FBQ0gsYUF6QkQ7QUEwQkEsd0JBQVksTUFBWixDQUFtQiwyQ0FBbkIsRUFBZ0UsVUFDNUQsY0FENEQsRUFDaEMsUUFEZ0MsRUFFcEQ7QUFDUixvQkFBSSxlQUFKO0FBQ0Esb0JBQUk7QUFDQSw2QkFBVSxpQkFBUSxlQUFlLElBQWYsQ0FBb0IsT0FBcEIsQ0FDZCxLQURjLEVBQ1AsV0FETyxFQUVoQixPQUZnQixDQUVSLEtBRlEsRUFFRCxXQUZDLENBQVIsQ0FBRCxDQUV1QixNQUZoQztBQUdILGlCQUpELENBSUUsT0FBTyxLQUFQLEVBQWM7QUFDWiwyQkFBTyxTQUFTLEtBQVQsRUFBZ0IsY0FBaEIsQ0FBUDtBQUNIO0FBQ0Qsb0JBQU0sWUFBa0M7QUFDcEMsNEJBQVEsS0FENEIsRUFDckIsTUFBTSxNQURlLEVBQXhDO0FBRUEscUJBQUssSUFBTSxPQUFYLElBQTZCLFNBQTdCO0FBQ0ksd0JBQUksVUFBVSxjQUFWLENBQXlCLE9BQXpCLENBQUo7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSw2RUFFSSxPQUFPLFFBQVAsQ0FBZ0IsZ0JBQWhCLENBQ08sT0FBSCxTQUFjLFVBQVUsT0FBVixDQUFkLGFBQ0csdUJBQWMsYUFEakIsU0FESixDQUZKO0FBQUEsb0NBQ1UsT0FEVjs7QUFNSTs7Ozs7QUFLQSx3Q0FBUSxZQUFSLENBQ0ksVUFBVSxPQUFWLENBREosRUFFSSxRQUFRLFlBQVIsQ0FDSSxVQUFVLE9BQVYsQ0FESixFQUVFLE9BRkYsQ0FFVSxJQUFJLE1BQUosQ0FDTixTQUFPLHVCQUFjLGFBQXJCLFNBQ0EsV0FGTSxDQUZWLEVBS0csSUFMSCxDQUZKO0FBWEo7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFESixpQkFxQkEsZUFBZSxJQUFmLEdBQXNCLGVBQWUsSUFBZixDQUFvQixPQUFwQixDQUNsQixxQ0FEa0IsRUFDcUIsSUFEckIsSUFFbEIsT0FBTyxRQUFQLENBQWdCLGVBQWhCLENBQWdDLFNBQWhDLENBQTBDLE9BQTFDLENBQ0ksZUFESixFQUNxQixJQURyQixFQUVFLE9BRkYsQ0FFVSxZQUZWLEVBRXdCLElBRnhCLENBRko7QUFLQTtBQXJDUTtBQUFBO0FBQUE7O0FBQUE7QUFzQ1Isc0VBRUksdUJBQWMsS0FBZCxDQUFvQixJQUZ4QjtBQUFBLDRCQUNVLHFCQURWOztBQUlJLDRCQUNJLHNCQUFzQixRQUF0QixLQUNBLGVBQWUsTUFBZixDQUFzQixPQUF0QixDQUE4QixRQUZsQyxFQUdFO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0Usa0ZBRUksc0JBQXNCLFFBQXRCLENBQStCLEdBRm5DO0FBQUEsd0NBQ1UsbUJBRFY7O0FBSUksd0NBQ0ksb0JBQW9CLGNBQXBCLENBQW1DLFNBQW5DLEtBQ0Esb0JBQW9CLE9BQXBCLENBQTRCLGNBQTVCLENBQ0ksY0FESixDQURBLElBSUEsT0FBTyxvQkFBb0IsT0FBcEIsQ0FBNEIsWUFBbkMsS0FDUSxRQU5aLEVBUUksZUFBZSxJQUFmLEdBQXNCLG9CQUFVLElBQVYsQ0FDbEIscUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QixFQUF6QixFQUE2QjtBQUN6QixpREFBUyxvQkFBb0IsT0FBcEIsSUFBK0I7QUFEZixxQ0FBN0IsRUFFRyxFQUFDLFNBQVM7QUFDVCwwREFBYyxzQkFDVCxRQURTLENBQ0E7QUFGTCx5Q0FBVixFQUZILENBRGtCLEVBTWIsZUFBZSxJQU5GLENBQXRCO0FBWlI7QUFERjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW9CRTtBQUNIO0FBNUJMLHFCQXRDUSxDQW1FUjtBQW5FUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW9FUix5QkFBUyxJQUFULEVBQWUsY0FBZjtBQUNILGFBdkVEO0FBd0VILFNBcEdrRCxDQUExQjtBQUFBLEtBQVIsRUFBckI7QUFxR0E7Ozs7QUFJQSxJQUFJLHVCQUFjLFlBQWQsQ0FBMkIsUUFBM0IsQ0FBb0MsVUFBcEMsQ0FBK0MsS0FBL0MsQ0FBSixFQUNJLGdCQUFnQixJQUFoQixDQUFxQixFQUFDLE9BQU8sZUFBQyxRQUFEO0FBQUEsZUFBMEIsU0FBUyxNQUFULENBQ25ELE1BRG1ELEVBQzNDLFVBQUMsV0FBRCxFQUFxQixRQUFyQixFQUF5RDtBQUM3RCxnQkFBTSxhQUNGLE9BQU8sV0FBUCxLQUF1QixRQURELEdBRXRCLFdBRnNCLEdBRVIsWUFBWSxDQUFaLENBRmxCO0FBR0EsaUJBQUssSUFBTSxZQUFYLElBQWtDLFlBQVksTUFBOUM7QUFDSSxvQkFDSSxZQUFZLE1BQVosQ0FBbUIsY0FBbkIsQ0FBa0MsWUFBbEMsS0FDQSxhQUFhLE9BQWIsQ0FBcUIsY0FBckIsRUFBcUMsSUFBckMsRUFBMkMsUUFBM0MsQ0FDSSx1QkFBYyxLQUFkLENBQW9CLEtBQXBCLENBQTBCLFVBQTFCLENBQXFDLGVBRHpDLENBRkosRUFJRTtBQUNFLHdCQUFJLFNBQ0EsWUFBWSxNQUFaLENBQW1CLFlBQW5CLEVBQWlDLE1BQWpDLEVBREo7QUFFQSx3QkFBSSxPQUFPLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDNUIsNkJBQ0ksSUFBTSxXQURWLElBRUksdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUZyQztBQUlJLGdDQUFJLHVCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsT0FBakMsQ0FDQyxjQURELENBQ2dCLFdBRGhCLENBQUosRUFHSSxTQUFTLE9BQU8sT0FBUCxDQUFlLElBQUksTUFBSixDQUNwQixzQkFDQSxxQkFBTSw4QkFBTixDQUNJLHVCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FDSyxPQURMLENBQ2EsV0FEYixDQURKLENBREEsR0FJSSxZQUxnQixFQUtGLEdBTEUsQ0FBZixXQU1BLFdBTkEsV0FNa0IsT0FObEIsQ0FPTCxJQUFJLE1BQUosQ0FBVyxvQkFDUCxxQkFBTSw4QkFBTixDQUNJLFVBREosQ0FETyxHQUdILG9CQUhHLEdBSVAscUJBQU0sOEJBQU4sQ0FDSSx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQ0ssT0FETCxDQUNhLFdBRGIsQ0FESixDQUpPLEdBT0gsMkJBUFIsQ0FQSyxXQWVJLFdBZkosVUFBVDtBQVBSLHlCQXVCQSxTQUFTLE9BQU8sT0FBUCxDQUFlLElBQUksTUFBSixDQUNwQixtQkFDQSxxQkFBTSw4QkFBTixDQUNJLFVBREosQ0FEQSxHQUdJLGVBSmdCLENBQWYsRUFLTixTQUFRLHFCQUFNLGdDQUFOLENBQ1AsVUFETyxDQUFSLFNBTE0sQ0FBVDtBQVFBLG9DQUFZLE1BQVosQ0FBbUIsWUFBbkIsSUFDSSw4QkFBcUIsTUFBckIsQ0FESjtBQUVIO0FBQ0o7QUEzQ0wsYUE0Q0E7QUFDSCxTQWxEa0QsQ0FBMUI7QUFBQSxLQUFSLEVBQXJCO0FBbURKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLElBQWhCLENBQXFCLElBQUksUUFBUSxRQUFaLENBQ2pCLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsS0FBL0IsQ0FBcUMsT0FEcEIsQ0FBckI7QUFFQTtBQUNBOzs7Ozs7QUFDQSxzREFFSSx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLE9BRnRDO0FBQUEsWUFDVSxrQkFEVjs7QUFJSSx3QkFBZ0IsSUFBaEIsb0NBQXlCLGtCQUFRLHdCQUFqQyxpREFDTyxtQkFBbUIsR0FBbkIsQ0FBdUIsVUFBQyxLQUFEO0FBQUEsbUJBQXVCLElBQUksUUFBSixDQUM3QyxlQUQ2QyxFQUM1QixXQUQ0QixFQUNmLFlBRGUsY0FDUztBQUMxRDtBQUZpRCxhQUFELHlCQUc5QixTQUg4QixFQUduQixVQUhtQixDQUF0QjtBQUFBLFNBQXZCLENBRFA7QUFKSixLLENBU0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSwrQkFBd0MsU0FBeEMsNEJBQXdDLENBQUMsUUFBRCxFQUE2QjtBQUN2RSxlQUFXLGlCQUFPLFdBQVAsQ0FBbUIsUUFBbkIsQ0FBWDtBQUNBLFdBQU8saUJBQU8sb0JBQVAsQ0FDSCxRQURHLEVBQ08sdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixNQUExQixDQUNOLHVCQUFjLE1BQWQsQ0FBcUIsY0FEZixFQUVOLHVCQUFjLE1BQWQsQ0FBcUIsY0FGZixFQUdSLEdBSFEsQ0FHSixVQUFDLFFBQUQ7QUFBQSxlQUE0QixlQUFLLE9BQUwsQ0FDOUIsdUJBQWMsSUFBZCxDQUFtQixPQURXLEVBQ0YsUUFERSxDQUE1QjtBQUFBLEtBSEksRUFLUixNQUxRLENBS0QsVUFBQyxRQUFEO0FBQUEsZUFDTCxDQUFDLHVCQUFjLElBQWQsQ0FBbUIsT0FBbkIsQ0FBMkIsVUFBM0IsQ0FBc0MsUUFBdEMsQ0FESTtBQUFBLEtBTEMsQ0FEUCxDQUFQO0FBUUgsQ0FWRDtBQVdBLElBQU0sU0FBZ0IsRUFBdEI7QUFDQSxJQUFNLFdBQW9CLFNBQXBCLFFBQW9CLENBQUMsSUFBRCxFQUFjLFFBQWQ7QUFBQSxXQUF1QyxJQUFJLFFBQUosQ0FDN0QsZUFENkQsRUFDNUMsVUFENEMsRUFDaEMsUUFEZ0MsRUFDdEIsOEJBRHNCLGNBRW5EO0FBQ2Q7QUFIaUUsS0FBRCx5QkFJOUMsUUFKOEMsRUFJcEMsTUFKb0MsRUFJNUIsNEJBSjRCLENBQXRDO0FBQUEsQ0FBMUI7QUFLQSxxQkFBTSxZQUFOLENBQW1CLE1BQW5CLEVBQTJCO0FBQ3ZCO0FBQ0E7QUFDQSxTQUFLO0FBQ0QsaUJBQVMsaUJBQUMsUUFBRDtBQUFBLG1CQUE2QixpQkFBTyxjQUFQLENBQ2xDLHVCQUFjLEtBQWQsQ0FBb0IsSUFBcEIsQ0FBeUIsTUFBekIsQ0FDSSx1QkFBYyxLQUFkLENBQW9CLFdBRHhCLEVBRUUsR0FGRixDQUVNLFVBQUMsaUJBQUQ7QUFBQSx1QkFDRixrQkFBa0IsUUFBbEIsQ0FBMkIsUUFEekI7QUFBQSxhQUZOLENBRGtDLEVBS3BDLFFBTG9DLENBSzNCLFFBTDJCLE1BTWhDLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsR0FBbEMsQ0FBc0MsT0FBdEMsS0FBa0QsSUFBbkQsR0FBMkQsS0FBM0QsR0FDRyxTQUNJLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsR0FBbEMsQ0FBc0MsT0FEMUMsRUFDbUQsUUFEbkQsQ0FQOEIsQ0FBN0I7QUFBQSxTQURSO0FBVUQsaUJBQVMsaUJBQU8sY0FBUCxDQUFzQixDQUMzQix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBREMsRUFFN0IsTUFGNkIsQ0FFdEIsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixjQUZULENBQXRCLENBVlI7QUFhRCxjQUFNLDhCQWJMO0FBY0QsYUFBSyxDQUNELEVBQUMsUUFBUSw0QkFBNEIsUUFDakMsQ0FBQyx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLEdBQWxDLENBQXNDLE9BQXRDLElBQWlEO0FBQzlDLDhCQUFjO0FBRGdDLGFBQWxELEVBRUcsWUFGSCxHQUVrQixDQUhlLElBSWpDLEtBSmlDLEdBSXpCLEVBSkgsV0FJYSx1QkFBYyxhQUozQixhQUFULEVBREMsRUFNRCxFQUFDLFFBQVEsU0FBVCxFQU5DLEVBT0Q7QUFDSSxvQkFBUSx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLEdBQWxDLENBQXNDLE1BRGxEO0FBRUkscUJBQVMsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxHQUFsQyxDQUFzQyxPQUF0QyxJQUFpRDtBQUY5RCxTQVBDLEVBV0gsTUFYRyxDQVdJLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsR0FBbEMsQ0FBc0MsVUFBdEMsQ0FBaUQsR0FBakQsQ0FDTCxRQURLLENBWEo7QUFkSixLQUhrQjtBQStCdkI7QUFDQTtBQUNBLFlBQVE7QUFDSixpQkFBUyxpQkFBQyxRQUFEO0FBQUEsbUJBQ0wsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxVQUFsQyxDQUE2QyxPQUE3QyxLQUF5RCxJQUR2QixHQUVsQyw2QkFBNkIsUUFBN0IsQ0FGa0MsR0FHbEMsU0FDSSx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLFVBQWxDLENBQTZDLE9BRGpELEVBQzBELFFBRDFELENBSEs7QUFBQSxTQURMO0FBT0osaUJBQVMsaUJBQU8sY0FBUCxDQUFzQixDQUMzQix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLFVBREwsRUFFN0IsTUFGNkIsQ0FFdEIsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixjQUZULENBQXRCLENBUEw7QUFVSixjQUFNLGlCQVZGO0FBV0osYUFBSyxDQUFDO0FBQ0Ysb0JBQVEsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxVQUFsQyxDQUE2QyxNQURuRDtBQUVGLHFCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsVUFBbEMsQ0FBNkMsT0FBN0MsSUFBd0Q7QUFGL0QsU0FBRCxFQUdGLE1BSEUsQ0FHSyx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLFVBQWxDLENBQTZDLFVBQTdDLENBQXdELEdBQXhELENBQ04sUUFETSxDQUhMO0FBWEQsS0FqQ2U7QUFrRHZCO0FBQ0E7QUFDQSxVQUFNO0FBQ0Y7QUFDQSxjQUFNO0FBQ0Ysa0JBQU0sSUFBSSxNQUFKLENBQVcsTUFBTSxxQkFBTSw4QkFBTixDQUNuQix1QkFBYyxLQUFkLENBQW9CLFdBQXBCLENBQWdDLFFBQWhDLENBQXlDLFFBRHRCLENBQU4sR0FFYixhQUZFLENBREo7QUFJRixpQkFBSyx1QkFBYyxLQUFkLENBQW9CLFdBQXBCLENBQWdDLFFBQWhDLENBQXlDO0FBSjVDLFNBRko7QUFRRixhQUFLO0FBQ0QscUJBQVMsaUJBQUMsUUFBRDtBQUFBLHVCQUE2QixpQkFBTyxjQUFQLENBQ2xDLHVCQUFjLEtBQWQsQ0FBb0IsSUFBcEIsQ0FBeUIsTUFBekIsQ0FDSSx1QkFBYyxLQUFkLENBQW9CLFdBRHhCLEVBRUUsR0FGRixDQUVNLFVBQUMsaUJBQUQ7QUFBQSwyQkFDRixrQkFBa0IsUUFBbEIsQ0FBMkIsUUFEekI7QUFBQSxpQkFGTixDQURrQyxFQUtwQyxRQUxvQyxDQUszQixRQUwyQixNQU1oQyx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLE9BQXZDLEtBQW1ELElBQXBELEdBQ0csS0FESCxHQUNXLFNBQ0osdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxJQUFsQyxDQUF1QyxPQURuQyxFQUVKLFFBRkksQ0FQc0IsQ0FBN0I7QUFBQSxhQURSO0FBV0QscUJBQVMsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxRQVh4QztBQVlELGtCQUFNLHdCQVpMO0FBYUQsaUJBQUssQ0FDRCxFQUFDLFFBQVEsZUFBZSxlQUFLLElBQUwsQ0FBVSxlQUFLLFFBQUwsQ0FDOUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxJQURGLEVBRTlCLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsUUFGRixDQUFWLEVBR3JCLFlBQVksUUFDWCxDQUFDLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsSUFBbEMsQ0FBdUMsT0FBdkMsSUFBa0Q7QUFDL0Msa0NBQWM7QUFEaUMsaUJBQW5ELEVBRUcsWUFGSCxHQUVrQixDQUhQLElBSVgsS0FKVyxHQUlILEVBSlQsV0FJbUIsdUJBQWMsYUFKakMsYUFIcUIsQ0FBeEIsRUFEQyxFQVNILE1BVEcsQ0FTSyxRQUFRLENBQ2QsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxJQUFsQyxDQUF1QyxPQUF2QyxJQUFrRDtBQUM5Qyw4QkFBYztBQURnQyxhQURwQyxFQUloQixZQUpnQixHQUlELENBSlAsSUFJWSxFQUpaLEdBS04sQ0FDSSxFQUFDLFFBQVEsU0FBVCxFQURKLEVBRUk7QUFDSSx3QkFBUSx1QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLE1BRHRDO0FBRUkseUJBQVMsdUJBQWMsTUFBZCxDQUFxQixJQUFyQixDQUEwQixPQUExQixJQUFxQztBQUZsRCxhQUZKLENBZEMsRUFxQkY7QUFDQyx3QkFBUSx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLE1BRGhEO0FBRUMseUJBQVMsdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxJQUFsQyxDQUF1QyxPQUF2QyxJQUFrRDtBQUY1RCxhQXJCRSxFQXdCRixNQXhCRSxDQXdCSyx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLFVBQXZDLENBQWtELEdBQWxELENBQ04sUUFETSxDQXhCTDtBQWJKLFNBUkg7QUFnREYsY0FBTTtBQUNGLHFCQUFTLGlCQUFDLFFBQUQ7QUFBQSx1QkFBNkIsaUJBQU8sY0FBUCxDQUNsQyx1QkFBYyxLQUFkLENBQW9CLElBQXBCLENBQXlCLE1BQXpCLENBQ0ksdUJBQWMsS0FBZCxDQUFvQixXQUR4QixFQUVFLEdBRkYsQ0FFTSxVQUFDLGlCQUFEO0FBQUEsMkJBQ0Ysa0JBQWtCLFFBQWxCLENBQTJCLFFBRHpCO0FBQUEsaUJBRk4sQ0FEa0MsRUFLcEMsUUFMb0MsQ0FLM0IsUUFMMkIsTUFNaEMsdUJBQWMsTUFBZCxDQUFxQixJQUFyQixDQUEwQixPQUExQixLQUFzQyxJQUF2QyxHQUErQyxJQUEvQyxHQUNHLFNBQVMsdUJBQWMsTUFBZCxDQUFxQixJQUFyQixDQUEwQixPQUFuQyxFQUE0QyxRQUE1QyxDQVA4QixDQUE3QjtBQUFBLGFBRFA7QUFTRixxQkFBUyx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLFFBVHZDO0FBVUYsa0JBQU0sbUJBVko7QUFXRixpQkFBSyxDQUNELEVBQUMsUUFBUSxlQUFlLGVBQUssSUFBTCxDQUFVLGVBQUssUUFBTCxDQUM5Qix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBREksRUFFOUIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxRQUZGLENBQVYsb0JBR0wsdUJBQWMsYUFIVCxhQUF4QixFQURDLEVBS0QsRUFBQyxRQUFRLFNBQVQsRUFMQyxFQU1EO0FBQ0ksd0JBQVEsdUJBQWMsTUFBZCxDQUFxQixJQUFyQixDQUEwQixNQUR0QztBQUVJLHlCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBMEIsT0FBMUIsSUFBcUM7QUFGbEQsYUFOQyxFQVVILE1BVkcsQ0FVSSx1QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLFVBQTFCLENBQXFDLEdBQXJDLENBQXlDLFFBQXpDLENBVko7QUFYSDtBQWhESixLQXBEaUI7QUE0SHZCO0FBQ0E7QUFDQTtBQUNBLFdBQU87QUFDSCxpQkFBUyxpQkFBQyxRQUFEO0FBQUEsbUJBQ0wsdUJBQWMsTUFBZCxDQUFxQixtQkFBckIsQ0FBeUMsT0FBekMsS0FBcUQsSUFEbkIsR0FFbEMsNkJBQTZCLFFBQTdCLENBRmtDLEdBR2xDLFNBQ0ksdUJBQWMsTUFBZCxDQUFxQixtQkFBckIsQ0FBeUMsT0FEN0MsRUFDc0QsUUFEdEQsQ0FISztBQUFBLFNBRE47QUFNSCxpQkFBUyxpQkFBTyxjQUFQLENBQXNCLENBQzNCLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsbUJBREwsRUFFN0IsTUFGNkIsQ0FFdEIsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixjQUZULENBQXRCLENBTk47QUFTSCxjQUFNLG9CQVRIO0FBVUgsYUFBSyxDQUNEO0FBQ0ksb0JBQVEsdUJBQWMsTUFBZCxDQUFxQixLQUFyQixDQUEyQixNQUR2QztBQUVJLHFCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsS0FBckIsQ0FBMkIsT0FBM0IsSUFBc0M7QUFGbkQsU0FEQyxFQUtEO0FBQ0ksb0JBQVEsdUJBQWMsTUFBZCxDQUFxQixtQkFBckIsQ0FBeUMsTUFEckQ7QUFFSSxxQkFBUyx1QkFBYyxNQUFkLENBQXFCLG1CQUFyQixDQUF5QyxPQUF6QyxJQUFvRDtBQUZqRSxTQUxDLEVBU0Q7QUFDSSxvQkFBUSx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLG1CQUFsQyxDQUNILE1BRlQ7QUFHSSxxQkFBUyxxQkFBTSxZQUFOLENBQW1CLElBQW5CLEVBQXlCO0FBQzlCLHVCQUFPLFNBRHVCO0FBRTlCLHlCQUFTO0FBQUEsMkJBQW9CLENBQ3pCLDZCQUFjO0FBQ1YsMERBRFU7QUFFViw4QkFBTSx1QkFBYyxJQUFkLENBQW1CO0FBRmYscUJBQWQsQ0FEeUIsRUFLekIsOEJBQWUsRUFBQyxVQUFVLE1BQVgsRUFBZixDQUx5QjtBQU16Qjs7Ozs7O0FBTUEsbURBQWdCLEVBQUMsV0FBVyxLQUFaLEVBQWhCLENBWnlCLEVBYXpCLDBCQUFXLEVBQUMsS0FBSyxRQUFOLEVBQVgsQ0FieUIsRUFjekIsOEJBQWU7QUFDWCxrQ0FBVTtBQUFBLG1DQUFvQixzQkFBWSxVQUN0QyxPQURzQyxFQUNwQixNQURvQjtBQUFBLHVDQUV2QixDQUNmLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBNUIsR0FBb0MsT0FBcEMsR0FDQSxNQUZlLEdBRnVCO0FBQUEsNkJBQVosQ0FBcEI7QUFBQSx5QkFEQztBQU9YLCtCQUFPLEVBQUMsbUJBQW1CLDJCQUFDLEtBQUQ7QUFBQSx1Q0FDdkIsZUFBSyxJQUFMLENBQVUsTUFBTSxVQUFoQixFQUE0QixlQUFLLFFBQUwsQ0FDeEIsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxLQURSLEVBRXhCLHVCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FGSixDQUE1QixDQUR1QjtBQUFBO0FBQXBCLHlCQVBJO0FBWVgsd0NBQWdCLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FDWCxtQkFiTTtBQWNYLG9DQUFZLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0M7QUFkakMscUJBQWYsQ0FkeUIsQ0FBcEI7QUFBQTtBQUZxQixhQUF6QixFQWtDVCx1QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLG1CQUFsQyxDQUNLLE9BREwsSUFDZ0IsRUFuQ1A7QUFIYixTQVRDLEVBaURILE1BakRHLENBa0RELHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsbUJBQWxDLENBQXNELFVBQXRELENBQ0ssR0FETCxDQUNTLFFBRFQsQ0FsREM7QUFWRixLQS9IZ0I7QUE4THZCO0FBQ0E7QUFDQTtBQUNBLFVBQU07QUFDRixhQUFLO0FBQ0QscUJBQVMsaUJBQUMsUUFBRDtBQUFBLHVCQUNMLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FBeEMsS0FBb0QsSUFEbEIsR0FFbEMsS0FGa0MsR0FHbEMsU0FDSSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE9BRDVDLEVBQ3FELFFBRHJELENBSEs7QUFBQSxhQURSO0FBTUQscUJBQVMsdUJBQWMsSUFBZCxDQUFtQixJQU4zQjtBQU9ELGtCQUFNLGtCQVBMO0FBUUQsaUJBQUssQ0FBQztBQUNGLHdCQUFRLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsTUFEOUM7QUFFRix5QkFBUyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE9BQXhDLElBQW1EO0FBRjFELGFBQUQsRUFHRixNQUhFLENBR0ssdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxVQUF4QyxDQUFtRCxHQUFuRCxDQUNOLFFBRE0sQ0FITDtBQVJKLFNBREg7QUFlRixhQUFLO0FBQ0QscUJBQVMsaUJBQUMsUUFBRDtBQUFBLHVCQUNMLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FBeEMsS0FBb0QsSUFEbEIsR0FFbEMsS0FGa0MsR0FHbEMsU0FDSSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE9BRDVDLEVBQ3FELFFBRHJELENBSEs7QUFBQSxhQURSO0FBTUQscUJBQVMsdUJBQWMsSUFBZCxDQUFtQixJQU4zQjtBQU9ELGtCQUFNLGtCQVBMO0FBUUQsaUJBQUssQ0FBQztBQUNGLHdCQUFRLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsTUFEOUM7QUFFRix5QkFBUyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE9BQXhDLElBQW1EO0FBRjFELGFBQUQsRUFHRixNQUhFLENBR0ssdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxVQUF4QyxDQUFtRCxHQUFuRCxDQUNOLFFBRE0sQ0FITDtBQVJKLFNBZkg7QUE2QkYsYUFBSztBQUNELHFCQUFTLGlCQUFDLFFBQUQ7QUFBQSx1QkFDTCx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE9BQXhDLEtBQW9ELElBRGxCLEdBRWxDLEtBRmtDLEdBR2xDLFNBQ0ksdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQUQ1QyxFQUNxRCxRQURyRCxDQUhLO0FBQUEsYUFEUjtBQU1ELHFCQUFTLHVCQUFjLElBQWQsQ0FBbUIsSUFOM0I7QUFPRCxrQkFBTSxrQkFQTDtBQVFELGlCQUFLLENBQUM7QUFDRix3QkFBUSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE1BRDlDO0FBRUYseUJBQVMsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQUF4QyxJQUFtRDtBQUYxRCxhQUFELEVBR0YsTUFIRSxDQUdLLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsVUFBeEMsQ0FBbUQsR0FBbkQsQ0FDTixRQURNLENBSEw7QUFSSixTQTdCSDtBQTJDRixjQUFNO0FBQ0YscUJBQVMsaUJBQUMsUUFBRDtBQUFBLHVCQUNMLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsQ0FBeUMsT0FBekMsS0FBcUQsSUFEbkIsR0FFbEMsS0FGa0MsR0FHbEMsU0FDSSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLElBQXBDLENBQXlDLE9BRDdDLEVBQ3NELFFBRHRELENBSEs7QUFBQSxhQURQO0FBT0YscUJBQVMsdUJBQWMsSUFBZCxDQUFtQixJQVAxQjtBQVFGLGtCQUFNLHFCQVJKO0FBU0YsaUJBQUssQ0FBQztBQUNGLHdCQUFRLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsQ0FBeUMsTUFEL0M7QUFFRix5QkFBUyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLElBQXBDLENBQXlDLE9BQXpDLElBQW9EO0FBRjNELGFBQUQsRUFHRixNQUhFLENBR0ssdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxJQUFwQyxDQUF5QyxVQUF6QyxDQUFvRCxHQUFwRCxDQUNOLFFBRE0sQ0FITDtBQVRIO0FBM0NKLEtBak1pQjtBQTRQdkI7QUFDQTtBQUNBLFdBQU87QUFDSCxpQkFBUyxpQkFBQyxRQUFEO0FBQUEsbUJBQ0wsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixLQUEvQixDQUFxQyxPQUFyQyxLQUFpRCxJQURmLEdBRWxDLDZCQUE2QixRQUE3QixDQUZrQyxHQUdsQyxTQUFTLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsS0FBL0IsQ0FBcUMsT0FBOUMsRUFBdUQsUUFBdkQsQ0FISztBQUFBLFNBRE47QUFLSCxpQkFBUyx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLEtBTHRDO0FBTUgsY0FBTSxrQ0FOSDtBQU9ILGFBQUssQ0FBQztBQUNGLG9CQUFRLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsS0FBL0IsQ0FBcUMsTUFEM0M7QUFFRixxQkFBUyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLEtBQS9CLENBQXFDLElBQXJDLElBQTZDO0FBRnBELFNBQUQsRUFHRixNQUhFLENBR0ssdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixLQUEvQixDQUFxQyxVQUFyQyxDQUFnRCxHQUFoRCxDQUNOLFFBRE0sQ0FITDtBQVBGLEtBOVBnQjtBQTJRdkI7QUFDQTtBQUNBLFVBQU07QUFDRixpQkFBUyxpQkFBQyxRQUFEO0FBQUEsbUJBQ0wsdUJBQWMsVUFBZCxDQUF5QixJQUF6QixDQUE4QixRQUE5QixDQUF1QyxRQUF2QyxDQUNJLGVBQUssT0FBTCxDQUFhLGlCQUFPLFdBQVAsQ0FBbUIsUUFBbkIsQ0FBYixDQURKLE1BR0ksdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxPQUFwQyxLQUFnRCxJQUQ5QyxHQUVGLDZCQUE2QixRQUE3QixDQUZFLEdBR0YsU0FDSSx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLE9BRHhDLEVBQ2lELFFBRGpELENBTEosQ0FESztBQUFBLFNBRFA7QUFTRixpQkFBUyx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLElBVHZDO0FBVUYsY0FBTSxJQVZKO0FBV0YsYUFBSyxDQUFDO0FBQ0Ysb0JBQVEsdUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxNQUQxQztBQUVGLHFCQUFTLHVCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsT0FBcEMsSUFBK0M7QUFGdEQsU0FBRCxFQUdGLE1BSEUsQ0FHSyx1QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLFVBQXBDLENBQStDLEdBQS9DLENBQW1ELFFBQW5ELENBSEw7QUFLVDtBQWhCTSxLQTdRaUIsRUFBM0I7QUErUkEsSUFBSSx1QkFBYyxLQUFkLENBQW9CLE9BQXBCLENBQTRCLG1CQUFoQyxFQUFxRDtBQUNqRCxXQUFPLEtBQVAsQ0FBYSxHQUFiLENBQWlCLEtBQWpCO0FBQ0EsV0FBTyxLQUFQLENBQWEsR0FBYixHQUFtQixRQUFRLFdBQVIsQ0FBb0IsT0FBcEIsQ0FBNEIsRUFBQyxLQUFLLE9BQU8sS0FBUCxDQUFhLEdBQW5CLEVBQTVCLENBQW5CO0FBQ0g7QUFDRDtBQUNBOzs7Ozs7QUFDQSxzREFBc0QsdUJBQWMsT0FBcEU7QUFBQSxZQUFXLG1CQUFYOztBQUNJLHdCQUFnQixJQUFoQixvQ0FBMEIsS0FBSyxTQUFMLEVBQWdCLG9CQUFvQixJQUFwQixDQUF5QixNQUF6QyxFQUN0QixvQkFBb0IsSUFBcEIsQ0FBeUIsV0FESCxDQUExQixpREFFTSxvQkFBb0IsU0FGMUI7QUFESixLLENBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDTyxJQUFNLHNEQUE0QztBQUNyRCxVQUFNLElBRCtDO0FBRXJELFdBQU8sdUJBQWMsS0FBZCxDQUFvQixJQUYwQjtBQUdyRCxhQUFTLHVCQUFjLElBQWQsQ0FBbUIsT0FIeUI7QUFJckQsYUFBUyx1QkFBYyxXQUFkLENBQTBCLElBSmtCO0FBS3JELGVBQVcsdUJBQWMsV0FBZCxDQUEwQixNQUxnQjtBQU1yRDtBQUNBLFdBQU8sdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQVBhO0FBUXJELGVBQVcsdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQVJTO0FBU3JELGFBQVM7QUFDTCxlQUFPLHVCQUFjLE1BQWQsQ0FBcUIsT0FEdkI7QUFFTCxxQkFBYSx1QkFBYyxPQUFkLENBQXNCLGtCQUY5QjtBQUdMLG9CQUFZLHVCQUFjLFVBQWQsQ0FBeUIsSUFBekIsQ0FBOEIsUUFIckM7QUFJTCxvQkFBWSx1QkFBYyxPQUFkLENBQXNCLElBQXRCLENBQTJCLGFBSmxDO0FBS0wsbUJBQVcsdUJBQWMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixTQUxqQztBQU1MLDBCQUFrQix1QkFBYyxVQUFkLENBQXlCLE1BTnRDO0FBT0wsaUJBQVMsaUJBQU8sY0FBUCxDQUFzQix1QkFBYyxNQUFkLENBQXFCLGNBQTNDLENBUEo7QUFRTCxxQkFBYSx1QkFBYyxLQUFkLENBQW9CO0FBUjVCLEtBVDRDO0FBbUJyRCxtQkFBZTtBQUNYLGVBQU8sdUJBQWMsTUFBZCxDQUFxQixPQURqQjtBQUVYLHFCQUFhLHVCQUFjLE9BQWQsQ0FBc0Isa0JBRnhCO0FBR1gsb0JBQVksdUJBQWMsTUFBZCxDQUFxQixVQUFyQixDQUFnQyxJQUhqQztBQUlYLG9CQUFZLHVCQUFjLE9BQWQsQ0FBc0IsSUFBdEIsQ0FBMkIsYUFKNUI7QUFLWCxtQkFBVyx1QkFBYyxPQUFkLENBQXNCLElBQXRCLENBQTJCLFNBTDNCO0FBTVgsMEJBQWtCLHVCQUFjLE1BQWQsQ0FBcUIsVUFBckIsQ0FBZ0MsTUFOdkM7QUFPWCxpQkFBUyx1QkFBYyxNQUFkLENBQXFCO0FBUG5CLEtBbkJzQztBQTRCckQ7QUFDQTtBQUNBLFlBQVE7QUFDSixrQkFBVSxlQUFLLFFBQUwsQ0FDTix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBRHBCLEVBRU4sdUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUE0QixVQUZ0QixDQUROO0FBSUosc0JBQWMsdUJBQWMsYUFKeEI7QUFLSixpQkFBUyxXQUxMO0FBTUosdUJBQ0ksdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsTUFBK0MsV0FEcEMsR0FFWCxLQUZXLEdBRUgsdUJBQWMsWUFBZCxDQUEyQixJQVJuQztBQVNKLGNBQU0sdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQVQ1QjtBQVVKLG9CQUFZLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsTUFWbEM7QUFXSixrQkFBVSx1QkFBYyxLQVhwQjtBQVlKLHdCQUFnQjtBQVpaLEtBOUI2QztBQTRDckQsaUJBQWEsdUJBQWMsZ0JBNUMwQjtBQTZDckQsWUFBUSx1QkFBYyxnQkE3QytCO0FBOENyRDtBQUNBLFlBQVE7QUFDSixlQUFPLHVCQUFjLE1BQWQsQ0FBcUIsVUFBckIsQ0FBZ0MsR0FBaEMsQ0FBb0MsVUFDdkMsbUJBRHVDLEVBRTFCO0FBQ2IsbUJBQU87QUFDSCx5QkFBUyxpQkFBQyxRQUFEO0FBQUEsMkJBQTZCLFNBQ2xDLG9CQUFvQixPQUFwQixJQUErQixPQURHLEVBQ00sUUFETixDQUE3QjtBQUFBLGlCQUROO0FBR0gseUJBQVMsb0JBQW9CLE9BQXBCLElBQStCLFNBQ3BDLG9CQUFvQixPQURnQixFQUNQLHVCQUFjLElBQWQsQ0FBbUIsT0FEWixDQUEvQixJQUVKLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFMNUI7QUFNSCxzQkFBTSxJQUFJLE1BQUosQ0FBVyxTQUNiLG9CQUFvQixJQURQLEVBQ2EsdUJBQWMsSUFBZCxDQUFtQixPQURoQyxDQUFYLENBTkg7QUFRSCxxQkFBSyxTQUFTLG9CQUFvQixHQUE3QjtBQVJGLGFBQVA7QUFVSCxTQWJNLEVBYUosTUFiSSxDQWFHLENBQ04sT0FBTyxHQURELEVBRU4sT0FBTyxNQUZELEVBR04sT0FBTyxJQUFQLENBQVksSUFITixFQUdZLE9BQU8sSUFBUCxDQUFZLEdBSHhCLEVBRzZCLE9BQU8sSUFBUCxDQUFZLElBSHpDLEVBSU4sT0FBTyxLQUpELEVBS04sT0FBTyxJQUFQLENBQVksR0FMTixFQUtXLE9BQU8sSUFBUCxDQUFZLEdBTHZCLEVBSzRCLE9BQU8sSUFBUCxDQUFZLEdBTHhDLEVBTU4sT0FBTyxJQUFQLENBQVksSUFOTixFQU9OLE9BQU8sS0FQRCxFQVFOLE9BQU8sSUFSRCxDQWJIO0FBREgsS0EvQzZDO0FBd0VyRCxVQUFNLHVCQUFjLGVBeEVpQztBQXlFckQsYUFBUztBQXpFNEMsQ0FBbEQ7QUEyRVAsSUFDSSxDQUFDLE1BQU0sT0FBTixDQUFjLHVCQUFjLE1BQWQsQ0FBcUIsMkJBQW5DLENBQUQsSUFDQSx1QkFBYyxNQUFkLENBQXFCLDJCQUFyQixDQUFpRCxNQUZyRCxFQUlJLHFCQUFxQixNQUFyQixDQUE0QixPQUE1QixHQUNJLHVCQUFjLE1BQWQsQ0FBcUIsMkJBRHpCO0FBRUosSUFBSSx1QkFBYyxpQkFBbEIsRUFBcUM7QUFDakMsWUFBUSxJQUFSLENBQWEsK0JBQWIsRUFBOEMsZUFBSyxPQUFMLHlCQUE0QjtBQUN0RSxlQUFPLElBRCtELEVBQTVCLENBQTlDO0FBRUEsWUFBUSxJQUFSLENBQWEsNkRBQWI7QUFDQSxZQUFRLElBQVIsQ0FBYSw4QkFBYixFQUE2QyxlQUFLLE9BQUwsQ0FDekMsb0JBRHlDLEVBQ25CLEVBQUMsT0FBTyxJQUFSLEVBRG1CLENBQTdDO0FBRUg7QUFDRDtrQkFDZSxvQjtBQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6IndlYnBhY2tDb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgdHlwZSB7RG9tTm9kZSwgUGxhaW5PYmplY3QsIFByb2NlZHVyZUZ1bmN0aW9uLCBXaW5kb3d9IGZyb20gJ2NsaWVudG5vZGUnXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQge0pTRE9NIGFzIERPTX0gZnJvbSAnanNkb20nXG5pbXBvcnQgKiBhcyBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBwb3N0Y3NzQ1NTbmV4dCBmcm9tICdwb3N0Y3NzLWNzc25leHQnXG5pbXBvcnQgcG9zdGNzc0ZvbnRQYXRoIGZyb20gJ3Bvc3Rjc3MtZm9udHBhdGgnXG5pbXBvcnQgcG9zdGNzc0ltcG9ydCBmcm9tICdwb3N0Y3NzLWltcG9ydCdcbmltcG9ydCBwb3N0Y3NzU3ByaXRlcyBmcm9tICdwb3N0Y3NzLXNwcml0ZXMnXG5pbXBvcnQgcG9zdGNzc1VSTCBmcm9tICdwb3N0Y3NzLXVybCdcbi8vIE5PVEU6IE9ubHkgbmVlZGVkIGZvciBkZWJ1Z2dpbmcgdGhpcyBmaWxlLlxudHJ5IHtcbiAgICByZXF1aXJlKCdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInKVxufSBjYXRjaCAoZXJyb3IpIHt9XG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IHdlYnBhY2sgZnJvbSAnd2VicGFjaydcbmNvbnN0IHBsdWdpbnMgPSByZXF1aXJlKCd3ZWJwYWNrLWxvYWQtcGx1Z2lucycpKClcbmltcG9ydCB7UmF3U291cmNlIGFzIFdlYnBhY2tSYXdTb3VyY2V9IGZyb20gJ3dlYnBhY2stc291cmNlcydcblxucGx1Z2lucy5CYWJlbE1pbmlmeSA9IHBsdWdpbnMuYmFiZWxNaW5pZnlcbnBsdWdpbnMuSFRNTCA9IHBsdWdpbnMuaHRtbFxucGx1Z2lucy5FeHRyYWN0VGV4dCA9IHBsdWdpbnMuZXh0cmFjdFRleHRcbnBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luID0gcmVxdWlyZSgnYWRkLWFzc2V0LWh0bWwtd2VicGFjay1wbHVnaW4nKVxucGx1Z2lucy5PcGVuQnJvd3NlciA9IHBsdWdpbnMub3BlbkJyb3dzZXJcbnBsdWdpbnMuRmF2aWNvbiA9IHJlcXVpcmUoJ2Zhdmljb25zLXdlYnBhY2stcGx1Z2luJylcbnBsdWdpbnMuSW1hZ2VtaW4gPSByZXF1aXJlKCdpbWFnZW1pbi13ZWJwYWNrLXBsdWdpbicpLmRlZmF1bHRcbnBsdWdpbnMuT2ZmbGluZSA9IHJlcXVpcmUoJ29mZmxpbmUtcGx1Z2luJylcblxuaW1wb3J0IGVqc0xvYWRlciBmcm9tICcuL2Vqc0xvYWRlci5jb21waWxlZCdcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgdHlwZSB7XG4gICAgSFRNTENvbmZpZ3VyYXRpb24sIFBsdWdpbkNvbmZpZ3VyYXRpb24sIFdlYnBhY2tDb25maWd1cmF0aW9uXG59IGZyb20gJy4vdHlwZSdcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yLmNvbXBpbGVkJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcblxuLy8gLyByZWdpb24gbW9ua2V5IHBhdGNoZXNcbi8vIE1vbmtleS1QYXRjaCBodG1sIGxvYWRlciB0byByZXRyaWV2ZSBodG1sIGxvYWRlciBvcHRpb25zIHNpbmNlIHRoZVxuLy8gXCJ3ZWJwYWNrLWh0bWwtcGx1Z2luXCIgZG9lc24ndCBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgbG9hZGVyIGludGVyZmFjZS5cbmltcG9ydCBodG1sTG9hZGVyTW9kdWxlQmFja3VwIGZyb20gJ2h0bWwtbG9hZGVyJ1xucmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2h0bWwtbG9hZGVyJyldLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgICAuLi5wYXJhbWV0ZXI6QXJyYXk8YW55PlxuKTphbnkge1xuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB0aGlzLm9wdGlvbnMsIG1vZHVsZSwgdGhpcy5vcHRpb25zKVxuICAgIHJldHVybiBodG1sTG9hZGVyTW9kdWxlQmFja3VwLmNhbGwodGhpcywgLi4ucGFyYW1ldGVyKVxufVxuLy8gTW9ua2V5LVBhdGNoIGxvYWRlci11dGlscyB0byBkZWZpbmUgd2hpY2ggdXJsIGlzIGEgbG9jYWwgcmVxdWVzdC5cbmltcG9ydCBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cCBmcm9tICdsb2FkZXItdXRpbHMnXG5jb25zdCBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cDoodXJsOnN0cmluZykgPT4gYm9vbGVhbiA9XG4gICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAuaXNVcmxSZXF1ZXN0XG5yZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSgnbG9hZGVyLXV0aWxzJyldLmV4cG9ydHMuaXNVcmxSZXF1ZXN0ID0gKFxuICAgIHVybDpzdHJpbmcsIC4uLmFkZGl0aW9uYWxQYXJhbWV0ZXI6QXJyYXk8YW55PlxuKTpib29sZWFuID0+IHtcbiAgICBpZiAodXJsLm1hdGNoKC9eW2Etel0rOi4rLykpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cC5hcHBseShcbiAgICAgICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAsIFt1cmxdLmNvbmNhdChhZGRpdGlvbmFsUGFyYW1ldGVyKSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBpbml0aWFsaXNhdGlvblxuLy8gLyByZWdpb24gZGV0ZXJtaW5lIGxpYnJhcnkgbmFtZVxubGV0IGxpYnJhcnlOYW1lOnN0cmluZ1xuaWYgKCdsaWJyYXJ5TmFtZScgaW4gY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmxpYnJhcnlOYW1lKVxuICAgIGxpYnJhcnlOYW1lID0gY29uZmlndXJhdGlvbi5saWJyYXJ5TmFtZVxuZWxzZSBpZiAoT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCkubGVuZ3RoID4gMSlcbiAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV0nXG5lbHNlIHtcbiAgICBsaWJyYXJ5TmFtZSA9IGNvbmZpZ3VyYXRpb24ubmFtZVxuICAgIGlmIChjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmID09PSAndmFyJylcbiAgICAgICAgbGlicmFyeU5hbWUgPSBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShsaWJyYXJ5TmFtZSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBwbHVnaW5zXG5jb25zdCBwbHVnaW5JbnN0YW5jZXM6QXJyYXk8T2JqZWN0PiA9IFtcbiAgICBuZXcgd2VicGFjay5Ob0VtaXRPbkVycm9yc1BsdWdpbigpLFxuICAgIG5ldyB3ZWJwYWNrLm9wdGltaXplLk9jY3VycmVuY2VPcmRlclBsdWdpbih0cnVlKVxuXVxuaWYgKGNvbmZpZ3VyYXRpb24uZGVidWcpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suTmFtZWRNb2R1bGVzUGx1Z2luKCkpXG4vLyAvLyByZWdpb24gZGVmaW5lIG1vZHVsZXMgdG8gaWdub3JlXG5mb3IgKGNvbnN0IGlnbm9yZVBhdHRlcm46c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmlnbm9yZVBhdHRlcm4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suSWdub3JlUGx1Z2luKG5ldyBSZWdFeHAoaWdub3JlUGF0dGVybikpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZGVmaW5lIG1vZHVsZXMgdG8gcmVwbGFjZVxuZm9yIChjb25zdCBzb3VyY2U6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwpXG4gICAgaWYgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwuaGFzT3duUHJvcGVydHkoc291cmNlKSkge1xuICAgICAgICBjb25zdCBzZWFyY2g6UmVnRXhwID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLk5vcm1hbE1vZHVsZVJlcGxhY2VtZW50UGx1Z2luKFxuICAgICAgICAgICAgc2VhcmNoLCAocmVzb3VyY2U6e3JlcXVlc3Q6c3RyaW5nfSk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2UucmVxdWVzdCA9IHJlc291cmNlLnJlcXVlc3QucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoLCBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsW3NvdXJjZV0pXG4gICAgICAgICAgICB9KSlcbiAgICB9XG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBnZW5lcmF0ZSBodG1sIGZpbGVcbmxldCBodG1sQXZhaWxhYmxlOmJvb2xlYW4gPSBmYWxzZVxuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkOmRsbCcpXG4gICAgZm9yIChsZXQgaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24gb2YgY29uZmlndXJhdGlvbi5maWxlcy5odG1sKVxuICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aCkpIHtcbiAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkhUTUwoVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgICAgIHt9LCBodG1sQ29uZmlndXJhdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdH0pKSlcbiAgICAgICAgICAgIGh0bWxBdmFpbGFibGUgPSB0cnVlXG4gICAgICAgIH1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGdlbmVyYXRlIGZhdmljb25zXG5pZiAoaHRtbEF2YWlsYWJsZSAmJiBjb25maWd1cmF0aW9uLmZhdmljb24gJiYgVG9vbHMuaXNGaWxlU3luYyhcbiAgICBjb25maWd1cmF0aW9uLmZhdmljb24ubG9nb1xuKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5GYXZpY29uKGNvbmZpZ3VyYXRpb24uZmF2aWNvbikpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBwcm92aWRlIG9mZmxpbmUgZnVuY3Rpb25hbGl0eVxuaWYgKGh0bWxBdmFpbGFibGUgJiYgY29uZmlndXJhdGlvbi5vZmZsaW5lKSB7XG4gICAgaWYgKCFbJ3NlcnZlJywgJ3Rlc3Q6YnJvd3NlciddLmluY2x1ZGVzKFxuICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICApKVxuICAgICAgICBmb3IgKGNvbnN0IHR5cGU6UGxhaW5PYmplY3Qgb2YgW1xuICAgICAgICAgICAgWydjYXNjYWRpbmdTdHlsZVNoZWV0JywgJ2NzcyddLFxuICAgICAgICAgICAgWydqYXZhU2NyaXB0JywgJ2pzJ11cbiAgICAgICAgXSlcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluUGxhY2VbdHlwZVswXV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzOkFycmF5PHN0cmluZz4gPSBPYmplY3Qua2V5cyhcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlW3R5cGVbMF1dKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZTpzdHJpbmcgb2YgbWF0Y2hlcylcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5vZmZsaW5lLmV4Y2x1ZGVzLnB1c2gocGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZVswXV1cbiAgICAgICAgICAgICAgICAgICAgKSArIGAke25hbWV9LiR7dHlwZVsxXX0/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PSpgKVxuICAgICAgICAgICAgfVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLk9mZmxpbmUoY29uZmlndXJhdGlvbi5vZmZsaW5lKSlcbn1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIG9wZW5zIGJyb3dzZXIgYXV0b21hdGljYWxseVxuaWYgKGNvbmZpZ3VyYXRpb24uZGV2ZWxvcG1lbnQub3BlbkJyb3dzZXIgJiYgKGh0bWxBdmFpbGFibGUgJiYgW1xuICAgICdzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXG5dLmluY2x1ZGVzKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSkpKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLk9wZW5Ccm93c2VyKFxuICAgICAgICBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50Lm9wZW5Ccm93c2VyKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIHByb3ZpZGUgYnVpbGQgZW52aXJvbm1lbnRcbmlmIChjb25maWd1cmF0aW9uLmJ1aWxkLmRlZmluaXRpb25zKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRlZmluZVBsdWdpbihcbiAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZC5kZWZpbml0aW9ucykpXG5pZiAoY29uZmlndXJhdGlvbi5tb2R1bGUucHJvdmlkZSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Qcm92aWRlUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcm92aWRlKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIG1vZHVsZXMvYXNzZXRzXG4vLyAvLy8gcmVnaW9uIHBlcmZvcm0gamF2YVNjcmlwdCBtaW5pZmljYXRpb24vb3B0aW1pc2F0aW9uXG5pZiAoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5LmJ1bmRsZSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChPYmplY3Qua2V5cyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5LmJ1bmRsZVxuICAgICkubGVuZ3RoID9cbiAgICAgICAgbmV3IHBsdWdpbnMuQmFiZWxNaW5pZnkoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlXG4gICAgICAgICkgOiBuZXcgcGx1Z2lucy5CYWJlbE1pbmlmeSgpKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBhcHBseSBtb2R1bGUgcGF0dGVyblxucGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoY29tcGlsZXI6T2JqZWN0KTp2b2lkID0+IHtcbiAgICBjb21waWxlci5wbHVnaW4oJ2VtaXQnLCAoXG4gICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICApOnZvaWQgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHJlcXVlc3Q6c3RyaW5nIGluIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgIGlmIChjb21waWxhdGlvbi5hc3NldHMuaGFzT3duUHJvcGVydHkocmVxdWVzdCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSByZXF1ZXN0LnJlcGxhY2UoL1xcP1teP10rJC8sICcnKVxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGU6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLCBjb25maWd1cmF0aW9uLnBhdGgpXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgJiYgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV0gJiYgIShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgLmV4Y2x1ZGVGaWxlUGF0aFJlZ3VsYXJFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgKSkudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc291cmNlOj9zdHJpbmcgPSBjb21waWxhdGlvbi5hc3NldHNbcmVxdWVzdF0uc291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW3JlcXVlc3RdID0gbmV3IFdlYnBhY2tSYXdTb3VyY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV0ucGF0dGVybi5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXFx7MVxcfS9nLCBzb3VyY2UucmVwbGFjZSgvXFwkL2csICckJCQnKSkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBjYWxsYmFjaygpXG4gICAgfSlcbn19KVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBpbi1wbGFjZSBjb25maWd1cmVkIGFzc2V0cyBpbiB0aGUgbWFpbiBodG1sIGZpbGVcbmlmIChodG1sQXZhaWxhYmxlICYmICFbJ3NlcnZlJywgJ3Rlc3Q6YnJvd3NlciddLmluY2x1ZGVzKFxuICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29tcGlsZXIucGx1Z2luKCdjb21waWxhdGlvbicsIChjb21waWxhdGlvbjpPYmplY3QpOnZvaWQgPT5cbiAgICAgICAgICAgIGNvbXBpbGF0aW9uLnBsdWdpbihcbiAgICAgICAgICAgICAgICAnaHRtbC13ZWJwYWNrLXBsdWdpbi1hZnRlci1odG1sLXByb2Nlc3NpbmcnLCBhc3luYyAoXG4gICAgICAgICAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhOlBsYWluT2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICAgICAgICAgICk6UHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICAgICAgICAgICAgICAgICAgKS5sZW5ndGggfHwgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZywgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBhd2FpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuaW5QbGFjZUNTU0FuZEphdmFTY3JpcHRBc3NldFJlZmVyZW5jZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXNjYWRpbmdTdHlsZVNoZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEuaHRtbCA9IHJlc3VsdC5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmUuY29uY2F0KHJlc3VsdC5maWxlUGF0aHNUb1JlbW92ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBodG1sUGx1Z2luRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgaHRtbFBsdWdpbkRhdGEpXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgIGNvbXBpbGVyLnBsdWdpbignYWZ0ZXItZW1pdCcsIGFzeW5jIChcbiAgICAgICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICAgICAgKTpQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9taXNlczpBcnJheTxQcm9taXNlPHZvaWQ+PiA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHBhdGg6c3RyaW5nIG9mIGZpbGVQYXRoc1RvUmVtb3ZlKVxuICAgICAgICAgICAgICAgIGlmIChhd2FpdCBUb29scy5pc0ZpbGUocGF0aCkpXG4gICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmU6RnVuY3Rpb24pOnZvaWQgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0udW5saW5rKHBhdGgsIChlcnJvcjo/RXJyb3IpOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKSlcbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgcHJvbWlzZXMgPSBbXVxuICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBvZiBbXG4gICAgICAgICAgICAgICAgJ2phdmFTY3JpcHQnLCAnY2FzY2FkaW5nU3R5bGVTaGVldCdcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IFdvcmthcm91bmQgc2luY2UgZmxvdyBtaXNzZXMgdGhlIHRocmVlIHBhcmFtZXRlclxuICAgICAgICAgICAgICAgICAgICBcInJlYWRkaXJcIiBzaWduYXR1cmUuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICApOnZvaWQgPT4gKGZpbGVTeXN0ZW0ucmVhZGRpcjpGdW5jdGlvbikoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0sXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmcsXG4gICAgICAgICAgICAgICAgICAgIChlcnJvcjo/RXJyb3IsIGZpbGVzOkFycmF5PHN0cmluZz4pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnJtZGlyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVdLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjo/RXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgICAgICAgICAgfSkpKVxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH0pXG4gICAgfX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHJlbW92ZSBjaHVua3MgaWYgYSBjb3JyZXNwb25kaW5nIGRsbCBwYWNrYWdlIGV4aXN0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkOmRsbCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hbmlmZXN0RmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9LyR7Y2h1bmtOYW1lfS5gICtcbiAgICAgICAgICAgICAgICBgZGxsLW1hbmlmZXN0Lmpzb25gXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBtYW5pZmVzdEZpbGVQYXRoXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICApLCB7J1tuYW1lXSc6IGNodW5rTmFtZX0pXG4gICAgICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZXBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlU291cmNlbWFwOiBUb29scy5pc0ZpbGVTeW5jKGAke2ZpbGVQYXRofS5tYXBgKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRsbFJlZmVyZW5jZVBsdWdpbih7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBtYW5pZmVzdDogcmVxdWlyZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0RmlsZVBhdGgpfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gZ2VuZXJhdGUgY29tbW9uIGNodW5rc1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkOmRsbCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmNvbW1vbkNodW5rSURzKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICApKVxuICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2sub3B0aW1pemUuQ29tbW9uc0NodW5rUGx1Z2luKHtcbiAgICAgICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IGZhbHNlLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICBtaW5DaHVua3M6IEluZmluaXR5LFxuICAgICAgICAgICAgICAgIG5hbWU6IGNodW5rTmFtZSxcbiAgICAgICAgICAgICAgICBtaW5TaXplOiAwXG4gICAgICAgICAgICB9KSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gbWFyayBlbXB0eSBqYXZhU2NyaXB0IG1vZHVsZXMgYXMgZHVtbXlcbmlmICghY29uZmlndXJhdGlvbi5uZWVkZWQuamF2YVNjcmlwdClcbiAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5qYXZhU2NyaXB0LCAnLl9fZHVtbXlfXy5jb21waWxlZC5qcycpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGV4dHJhY3QgY2FzY2FkaW5nIHN0eWxlIHNoZWV0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkV4dHJhY3RUZXh0KHtcbiAgICAgICAgYWxsQ2h1bmtzOiB0cnVlLCBmaWxlbmFtZTogcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KVxuICAgIH0pKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBwZXJmb3JtcyBpbXBsaWNpdCBleHRlcm5hbCBsb2dpY1xuaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMgPT09ICdfX2ltcGxpY2l0X18nKVxuICAgIC8qXG4gICAgICAgIFdlIG9ubHkgd2FudCB0byBwcm9jZXNzIG1vZHVsZXMgZnJvbSBsb2NhbCBjb250ZXh0IGluIGxpYnJhcnkgbW9kZSxcbiAgICAgICAgc2luY2UgYSBjb25jcmV0ZSBwcm9qZWN0IHVzaW5nIHRoaXMgbGlicmFyeSBzaG91bGQgY29tYmluZSBhbGwgYXNzZXRzXG4gICAgICAgIChhbmQgZGVkdXBsaWNhdGUgdGhlbSkgZm9yIG9wdGltYWwgYnVuZGxpbmcgcmVzdWx0cy4gTk9URTogT25seSBuYXRpdmVcbiAgICAgICAgamF2YVNjcmlwdCBhbmQganNvbiBtb2R1bGVzIHdpbGwgYmUgbWFya2VkIGFzIGV4dGVybmFsIGRlcGVuZGVuY3kuXG4gICAgKi9cbiAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzID0gKFxuICAgICAgICBjb250ZXh0OnN0cmluZywgcmVxdWVzdDpzdHJpbmcsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgKTp2b2lkID0+IHtcbiAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3QucmVwbGFjZSgvXiErLywgJycpXG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgIHJlcXVlc3QgPSBwYXRoLnJlbGF0aXZlKGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCByZXF1ZXN0KVxuICAgICAgICBmb3IgKFxuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nIG9mXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcy5jb25jYXQoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXMpXG4gICAgICAgIClcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKGZpbGVQYXRoLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIGxldCByZXNvbHZlZFJlcXVlc3Q6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgICAgICByZXF1ZXN0LCBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgY29udGV4dCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGhcbiAgICAgICAgICAgICkpLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpXG4gICAgICAgICAgICApLCBjb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCwgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLCBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmltcGxpY2l0LnBhdHRlcm4uaW5jbHVkZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmltcGxpY2l0LnBhdHRlcm4uZXhjbHVkZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5leHRlcm5hbExpYnJhcnkubm9ybWFsLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmV4dGVybmFsTGlicmFyeS5keW5hbWljLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZylcbiAgICAgICAgaWYgKHJlc29sdmVkUmVxdWVzdCkge1xuICAgICAgICAgICAgaWYgKFsndmFyJywgJ3VtZCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsXG4gICAgICAgICAgICApICYmIHJlcXVlc3QgaW4gY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlcylcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QgPSBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0XVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsID09PSAndmFyJylcbiAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QgPSBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRSZXF1ZXN0LCAnMC05YS16QS1aXyRcXFxcLicpXG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgbnVsbCwgcmVzb2x2ZWRSZXF1ZXN0LCBjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5leHRlcm5hbClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbGJhY2soKVxuICAgIH1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gYnVpbGQgZGxsIHBhY2thZ2VzXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAnYnVpbGQ6ZGxsJykge1xuICAgIGxldCBkbGxDaHVua0lERXhpc3RzOmJvb2xlYW4gPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICApKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmRsbENodW5rSURzLmluY2x1ZGVzKGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgZGxsQ2h1bmtJREV4aXN0cyA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgaWYgKGRsbENodW5rSURFeGlzdHMpIHtcbiAgICAgICAgbGlicmFyeU5hbWUgPSAnW25hbWVdRExMUGFja2FnZSdcbiAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGxsUGx1Z2luKHtcbiAgICAgICAgICAgIHBhdGg6IGAke2NvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZX0vW25hbWVdLmRsbC1tYW5pZmVzdC5qc29uYCxcbiAgICAgICAgICAgIG5hbWU6IGxpYnJhcnlOYW1lXG4gICAgICAgIH0pKVxuICAgIH0gZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4oJ05vIGRsbCBjaHVuayBpZCBmb3VuZC4nKVxufVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gYXBwbHkgZmluYWwgZG9tL2phdmFTY3JpcHQgbW9kaWZpY2F0aW9ucy9maXhlc1xucGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoY29tcGlsZXI6T2JqZWN0KTp2b2lkID0+IGNvbXBpbGVyLnBsdWdpbihcbiAgICAnY29tcGlsYXRpb24nLCAoY29tcGlsYXRpb246T2JqZWN0KTp2b2lkID0+IHtcbiAgICAgICAgY29tcGlsYXRpb24ucGx1Z2luKCdodG1sLXdlYnBhY2stcGx1Z2luLWFsdGVyLWFzc2V0LXRhZ3MnLCAoXG4gICAgICAgICAgICBodG1sUGx1Z2luRGF0YTpQbGFpbk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdGFnczpBcnJheTxQbGFpbk9iamVjdD4gb2YgW1xuICAgICAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLmJvZHksIGh0bWxQbHVnaW5EYXRhLmhlYWRcbiAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnOlBsYWluT2JqZWN0IG9mIHRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eXFwuX19kdW1teV9fKFxcLi4qKT8kLy50ZXN0KHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWcuYXR0cmlidXRlcy5zcmMgfHwgdGFnLmF0dHJpYnV0ZXMuaHJlZiB8fCAnJ1xuICAgICAgICAgICAgICAgICAgICApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3Muc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYXNzZXRzOkFycmF5PHN0cmluZz4gPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLnBsdWdpbi5hc3NldEpzb24pXG4gICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFJlcXVlc3Q6c3RyaW5nIG9mIGFzc2V0cykge1xuICAgICAgICAgICAgICAgIGlmICgvXlxcLl9fZHVtbXlfXyhcXC4uKik/JC8udGVzdChwYXRoLmJhc2VuYW1lKGFzc2V0UmVxdWVzdCkpKVxuICAgICAgICAgICAgICAgICAgICBhc3NldHMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhLnBsdWdpbi5hc3NldEpzb24gPSBKU09OLnN0cmluZ2lmeShhc3NldHMpXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBodG1sUGx1Z2luRGF0YSlcbiAgICAgICAgfSlcbiAgICAgICAgY29tcGlsYXRpb24ucGx1Z2luKCdodG1sLXdlYnBhY2stcGx1Z2luLWFmdGVyLWh0bWwtcHJvY2Vzc2luZycsIChcbiAgICAgICAgICAgIGh0bWxQbHVnaW5EYXRhOlBsYWluT2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvblxuICAgICAgICApOldpbmRvdyA9PiB7XG4gICAgICAgICAgICBsZXQgd2luZG93OldpbmRvd1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cgPSAobmV3IERPTShodG1sUGx1Z2luRGF0YS5odG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC88JS9nLCAnIyMrIysjKyMjJ1xuICAgICAgICAgICAgICAgICkucmVwbGFjZSgvJT4vZywgJyMjLSMtIy0jIycpKSkud2luZG93XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgaHRtbFBsdWdpbkRhdGEpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsaW5rYWJsZXM6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xuICAgICAgICAgICAgICAgIHNjcmlwdDogJ3NyYycsIGxpbms6ICdocmVmJ31cbiAgICAgICAgICAgIGZvciAoY29uc3QgdGFnTmFtZTpzdHJpbmcgaW4gbGlua2FibGVzKVxuICAgICAgICAgICAgICAgIGlmIChsaW5rYWJsZXMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21Ob2RlOkRvbU5vZGUgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3RhZ05hbWV9WyR7bGlua2FibGVzW3RhZ05hbWVdfSo9XCI/YCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1cIl1gKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IFJlbW92aW5nIHN5bWJvbHMgYWZ0ZXIgYSBcIiZcIiBpbiBoYXNoIHN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIG5lY2Vzc2FyeSB0byBtYXRjaCB0aGUgZ2VuZXJhdGVkIHJlcXVlc3Qgc3RyaW5nc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIG9mZmxpbmUgcGx1Z2luLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmthYmxlc1t0YWdOYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLmdldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2FibGVzW3RhZ05hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAoXFxcXD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09YCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbXiZdKykuKiQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgJyQxJykpXG4gICAgICAgICAgICBodG1sUGx1Z2luRGF0YS5odG1sID0gaHRtbFBsdWdpbkRhdGEuaHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgIC9eKFxccyo8IWRvY3R5cGUgW14+XSs/PlxccyopW1xcc1xcU10qJC9pLCAnJDEnXG4gICAgICAgICAgICApICsgd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vdXRlckhUTUwucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLyMjXFwrI1xcKyNcXCsjIy9nLCAnPCUnXG4gICAgICAgICAgICAgICAgKS5yZXBsYWNlKC8jIy0jLSMtIyMvZywgJyU+JylcbiAgICAgICAgICAgIC8vICByZWdpb24gcG9zdCBjb21waWxhdGlvblxuICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sRmlsZVNwZWNpZmljYXRpb246UGxhaW5PYmplY3Qgb2ZcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGh0bWxGaWxlU3BlY2lmaWNhdGlvbi5maWxlbmFtZSA9PT1cbiAgICAgICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEucGx1Z2luLm9wdGlvbnMuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlckNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3Qgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxGaWxlU3BlY2lmaWNhdGlvbi50ZW1wbGF0ZS51c2VcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkoJ29wdGlvbnMnKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbXBpbGVTdGVwcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9ucy5jb21waWxlU3RlcHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPT09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbFBsdWdpbkRhdGEuaHRtbCA9IGVqc0xvYWRlci5iaW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5leHRlbmRPYmplY3QodHJ1ZSwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB7b3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZVN0ZXBzOiBodG1sRmlsZVNwZWNpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGVtcGxhdGUucG9zdENvbXBpbGVTdGVwc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fSkpKGh0bWxQbHVnaW5EYXRhLmh0bWwpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCBodG1sUGx1Z2luRGF0YSlcbiAgICAgICAgfSlcbiAgICB9KX0pXG4vKlxuICAgIE5PVEU6IFRoZSB1bWQgbW9kdWxlIGV4cG9ydCBkb2Vzbid0IGhhbmRsZSBjYXNlcyB3aGVyZSB0aGUgcGFja2FnZSBuYW1lXG4gICAgZG9lc24ndCBtYXRjaCBleHBvcnRlZCBsaWJyYXJ5IG5hbWUuIFRoaXMgcG9zdCBwcm9jZXNzaW5nIGZpeGVzIHRoaXMgaXNzdWUuXG4qL1xuaWYgKGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsLnN0YXJ0c1dpdGgoJ3VtZCcpKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKHthcHBseTogKGNvbXBpbGVyOk9iamVjdCk6dm9pZCA9PiBjb21waWxlci5wbHVnaW4oXG4gICAgICAgICdlbWl0JywgKGNvbXBpbGF0aW9uOk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb24pOnZvaWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVuZGxlTmFtZTpzdHJpbmcgPSAoXG4gICAgICAgICAgICAgICAgdHlwZW9mIGxpYnJhcnlOYW1lID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgKSA/IGxpYnJhcnlOYW1lIDogbGlicmFyeU5hbWVbMF1cbiAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXRSZXF1ZXN0OnN0cmluZyBpbiBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHMuaGFzT3duUHJvcGVydHkoYXNzZXRSZXF1ZXN0KSAmJlxuICAgICAgICAgICAgICAgICAgICBhc3NldFJlcXVlc3QucmVwbGFjZSgvKFteP10rKVxcPy4qJC8sICckMScpLmVuZHNXaXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZC50eXBlcy5qYXZhU2NyaXB0Lm91dHB1dEV4dGVuc2lvbilcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNvdXJjZTpzdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0UmVxdWVzdF0uc291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50OnN0cmluZyBpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGFzT3duUHJvcGVydHkocmVwbGFjZW1lbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyhyZXF1aXJlXFxcXCgpW1wiXFwnXScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hbGlhc2VzW3JlcGxhY2VtZW50XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICdbXCJcXCddKFxcXFwpKScsICdnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCBgJDEnJHtyZXBsYWNlbWVudH0nJDJgKS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFJlZ0V4cCgnKGRlZmluZVxcXFwoW1wiXFwnXScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVuZGxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnW1wiXFwnXSwgXFxcXFsuKilbXCJcXCddJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFsaWFzZXNbcmVwbGFjZW1lbnRdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICdbXCJcXCddKC4qXFxcXF0sIGZhY3RvcnlcXFxcKTspJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgYCQxJyR7cmVwbGFjZW1lbnR9JyQyYClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyhyb290XFxcXFspW1wiXFwnXScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVuZGxlTmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnW1wiXFwnXShcXFxcXSA9ICknXG4gICAgICAgICAgICAgICAgICAgICAgICApLCBgJDEnYCArIFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICkgKyBgJyQyYClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1thc3NldFJlcXVlc3RdID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgV2VicGFja1Jhd1NvdXJjZShzb3VyY2UpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH0pfSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGFkZCBhdXRvbWF0aWMgaW1hZ2UgY29tcHJlc3Npb25cbi8vIE5PVEU6IFRoaXMgcGx1Z2luIHNob3VsZCBiZSBsb2FkZWQgYXQgbGFzdCB0byBlbnN1cmUgdGhhdCBhbGwgZW1pdHRlZCBpbWFnZXNcbi8vIHJhbiB0aHJvdWdoLlxucGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuSW1hZ2VtaW4oXG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmNvbnRlbnQpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gY29udGV4dCByZXBsYWNlbWVudHNcbmZvciAoXG4gICAgY29uc3QgY29udGV4dFJlcGxhY2VtZW50OkFycmF5PHN0cmluZz4gb2ZcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMuY29udGV4dFxuKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkNvbnRleHRSZXBsYWNlbWVudFBsdWdpbihcbiAgICAgICAgLi4uY29udGV4dFJlcGxhY2VtZW50Lm1hcCgodmFsdWU6c3RyaW5nKTphbnkgPT4gKG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICdjb25maWd1cmF0aW9uJywgJ19fZGlybmFtZScsICdfX2ZpbGVuYW1lJywgYHJldHVybiAke3ZhbHVlfWBcbiAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICkpKGNvbmZpZ3VyYXRpb24sIF9fZGlybmFtZSwgX19maWxlbmFtZSkpKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGxvYWRlciBoZWxwZXJcbmNvbnN0IHJlamVjdEZpbGVQYXRoSW5EZXBlbmRlbmNpZXM6RnVuY3Rpb24gPSAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IHtcbiAgICBmaWxlUGF0aCA9IEhlbHBlci5zdHJpcExvYWRlcihmaWxlUGF0aClcbiAgICByZXR1cm4gSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICBmaWxlUGF0aCwgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpXG59XG5jb25zdCBsb2FkZXI6T2JqZWN0ID0ge31cbmNvbnN0IGV2YWx1YXRlOkZ1bmN0aW9uID0gKGNvZGU6c3RyaW5nLCBmaWxlUGF0aDpzdHJpbmcpOmFueSA9PiAobmV3IEZ1bmN0aW9uKFxuICAgICdjb25maWd1cmF0aW9uJywgJ2ZpbGVQYXRoJywgJ2xvYWRlcicsICdyZWplY3RGaWxlUGF0aEluRGVwZW5kZW5jaWVzJyxcbiAgICBgcmV0dXJuICR7Y29kZX1gXG4vLyBJZ25vcmVUeXBlQ2hlY2tcbikpKGNvbmZpZ3VyYXRpb24sIGZpbGVQYXRoLCBsb2FkZXIsIHJlamVjdEZpbGVQYXRoSW5EZXBlbmRlbmNpZXMpXG5Ub29scy5leHRlbmRPYmplY3QobG9hZGVyLCB7XG4gICAgLy8gQ29udmVydCB0byBjb21wYXRpYmxlIG5hdGl2ZSB3ZWIgdHlwZXMuXG4gICAgLy8gcmVnaW9uIGdlbmVyaWMgdGVtcGxhdGVcbiAgICBlanM6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgICkuaW5jbHVkZXMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuZXhjbHVkZSA9PT0gbnVsbCkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuZXhjbHVkZSwgZmlsZVBhdGgpKSxcbiAgICAgICAgaW5jbHVkZTogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYmFzZVxuICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHMpKSxcbiAgICAgICAgdGVzdDogL14oPyEuK1xcLmh0bWxcXC5lanMkKS4rXFwuZWpzJC9pLFxuICAgICAgICB1c2U6IFtcbiAgICAgICAgICAgIHtsb2FkZXI6ICdmaWxlP25hbWU9W3BhdGhdW25hbWVdJyArIChCb29sZWFuKFxuICAgICAgICAgICAgICAgIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLm9wdGlvbnMgfHwge1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgICAgICB9KS5jb21waWxlU3RlcHMgJSAyXG4gICAgICAgICAgICApID8gJy5qcycgOiAnJykgKyBgPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gfSxcbiAgICAgICAgICAgIHtsb2FkZXI6ICdleHRyYWN0J30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBzY3JpcHRcbiAgICBzY3JpcHQ6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5leGNsdWRlID09PSBudWxsXG4gICAgICAgICkgPyByZWplY3RGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5leGNsdWRlLCBmaWxlUGF0aFxuICAgICAgICAgICAgKSxcbiAgICAgICAgaW5jbHVkZTogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuamF2YVNjcmlwdFxuICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHMpKSxcbiAgICAgICAgdGVzdDogL1xcLmpzKD86XFw/LiopPyQvaSxcbiAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5sb2FkZXIsXG4gICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5vcHRpb25zIHx8IHt9XG4gICAgICAgIH1dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBodG1sIHRlbXBsYXRlXG4gICAgaHRtbDoge1xuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIG9ubHkgZm9yIHRoZSBtYWluIGVudHJ5IHRlbXBsYXRlLlxuICAgICAgICBtYWluOiB7XG4gICAgICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKCdeJyArIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoXG4gICAgICAgICAgICApICsgJyg/OlxcXFw/LiopPyQnKSxcbiAgICAgICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS51c2VcbiAgICAgICAgfSxcbiAgICAgICAgZWpzOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgICAgICApLmluY2x1ZGVzKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgICAgICgoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwuZXhjbHVkZSA9PT0gbnVsbCkgP1xuICAgICAgICAgICAgICAgICAgICBmYWxzZSA6IGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwuZXhjbHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoKSksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LnRlbXBsYXRlLFxuICAgICAgICAgICAgdGVzdDogL1xcLmh0bWxcXC5lanMoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbXG4gICAgICAgICAgICAgICAge2xvYWRlcjogJ2ZpbGU/bmFtZT0nICsgcGF0aC5qb2luKHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICksICdbbmFtZV0nICsgKEJvb2xlYW4oXG4gICAgICAgICAgICAgICAgICAgIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICAgICAgICAgICAgICB9KS5jb21waWxlU3RlcHMgJSAyXG4gICAgICAgICAgICAgICAgKSA/ICcuanMnIDogJycpICsgYD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdYCl9XG4gICAgICAgICAgICBdLmNvbmNhdCgoQm9vbGVhbigoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICkuY29tcGlsZVN0ZXBzICUgMikgPyBbXSA6XG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApLCB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSkuY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgaHRtbDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICAgICAgKS5pbmNsdWRlcyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuZXhjbHVkZSA9PT0gbnVsbCkgPyB0cnVlIDpcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC50ZW1wbGF0ZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5odG1sKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW1xuICAgICAgICAgICAgICAgIHtsb2FkZXI6ICdmaWxlP25hbWU9JyArIHBhdGguam9pbihwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQudGVtcGxhdGVcbiAgICAgICAgICAgICAgICApLCBgW25hbWVdLltleHRdPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gKX0sXG4gICAgICAgICAgICAgICAge2xvYWRlcjogJ2V4dHJhY3QnfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuYWRkaXRpb25hbC5tYXAoZXZhbHVhdGUpKVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyBMb2FkIGRlcGVuZGVuY2llcy5cbiAgICAvLyByZWdpb24gc3R5bGVcbiAgICBzdHlsZToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICApID8gcmVqZWN0RmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgIGluY2x1ZGU6IEhlbHBlci5ub3JtYWxpemVQYXRocyhbXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUubG9jYXRpb25zLmRpcmVjdG9yeVBhdGhzKSksXG4gICAgICAgIHRlc3Q6IC9cXC5zP2Nzcyg/OlxcPy4qKT8kL2ksXG4gICAgICAgIHVzZTogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuc3R5bGUubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnN0eWxlLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0LmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0Lm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICAgICAgICAgICAgICAubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7XG4gICAgICAgICAgICAgICAgICAgIGlkZW50OiAncG9zdGNzcycsXG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbnM6ICgpOkFycmF5PE9iamVjdD4gPT4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0ltcG9ydCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRGVwZW5kZW5jeVRvOiB3ZWJwYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Q6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NDU1NuZXh0KHticm93c2VyczogJz4gMCUnfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IENoZWNraW5nIHBhdGggZG9lc24ndCB3b3JrIGlmIGZvbnRzIGFyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZWQgaW4gbGlicmFyaWVzIHByb3ZpZGVkIGluIGFub3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbiB0aGFuIHRoZSBwcm9qZWN0IGl0c2VsZiBsaWtlIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NGb250UGF0aCh7Y2hlY2tQYXRoOiBmYWxzZX0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc1VSTCh7dXJsOiAncmViYXNlJ30pLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc1Nwcml0ZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckJ5OiAoKTpQcm9taXNlPG51bGw+ID0+IG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTpQcm9taXNlPG51bGw+ID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmltYWdlID8gcmVzb2x2ZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9va3M6IHtvblNhdmVTcHJpdGVzaGVldDogKGltYWdlOk9iamVjdCk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihpbWFnZS5zcHJpdGVQYXRoLCBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5pbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5pbWFnZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXNoZWV0UGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGVQYXRoOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICAgICAgICAgICAgICAub3B0aW9ucyB8fCB7fSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgXS5jb25jYXQoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldC5hZGRpdGlvbmFsXG4gICAgICAgICAgICAgICAgLm1hcChldmFsdWF0ZSkpXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyBPcHRpbWl6ZSBsb2FkZWQgYXNzZXRzLlxuICAgIC8vIHJlZ2lvbiBmb250XG4gICAgZm9udDoge1xuICAgICAgICBlb3Q6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsXG4gICAgICAgICAgICB0ZXN0OiAvXFwuZW90KD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90Lm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH1dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9LFxuICAgICAgICBzdmc6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsXG4gICAgICAgICAgICB0ZXN0OiAvXFwuc3ZnKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH1dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9LFxuICAgICAgICB0dGY6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsXG4gICAgICAgICAgICB0ZXN0OiAvXFwudHRmKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH1dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9LFxuICAgICAgICB3b2ZmOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuZXhjbHVkZSwgZmlsZVBhdGhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLmJhc2UsXG4gICAgICAgICAgICB0ZXN0OiAvXFwud29mZjI/KD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gaW1hZ2VcbiAgICBpbWFnZToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5leGNsdWRlID09PSBudWxsXG4gICAgICAgICkgPyByZWplY3RGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICBldmFsdWF0ZShjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmltYWdlLFxuICAgICAgICB0ZXN0OiAvXFwuKD86cG5nfGpwZ3xpY298Z2lmKSg/OlxcPy4qKT8kL2ksXG4gICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmxvYWRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5maWxlIHx8IHt9XG4gICAgICAgIH1dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZGF0YVxuICAgIGRhdGE6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW50ZXJuYWwuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKEhlbHBlci5zdHJpcExvYWRlcihmaWxlUGF0aCkpXG4gICAgICAgICAgICApIHx8ICgoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IHJlamVjdEZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuZXhjbHVkZSwgZmlsZVBhdGgpKSxcbiAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5kYXRhLFxuICAgICAgICB0ZXN0OiAvLisvLFxuICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmxvYWRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLm9wdGlvbnMgfHwge31cbiAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmFkZGl0aW9uYWwubWFwKGV2YWx1YXRlKSlcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG59KVxuaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KSB7XG4gICAgbG9hZGVyLnN0eWxlLnVzZS5zaGlmdCgpXG4gICAgbG9hZGVyLnN0eWxlLnVzZSA9IHBsdWdpbnMuRXh0cmFjdFRleHQuZXh0cmFjdCh7dXNlOiBsb2FkZXIuc3R5bGUudXNlfSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbmZvciAoY29uc3QgcGx1Z2luQ29uZmlndXJhdGlvbjpQbHVnaW5Db25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24ucGx1Z2lucylcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgKGV2YWwoJ3JlcXVpcmUnKShwbHVnaW5Db25maWd1cmF0aW9uLm5hbWUubW9kdWxlKVtcbiAgICAgICAgcGx1Z2luQ29uZmlndXJhdGlvbi5uYW1lLmluaXRpYWxpemVyXG4gICAgXSkoLi4ucGx1Z2luQ29uZmlndXJhdGlvbi5wYXJhbWV0ZXIpKVxuLy8gcmVnaW9uIGNvbmZpZ3VyYXRpb25cbmV4cG9ydCBjb25zdCB3ZWJwYWNrQ29uZmlndXJhdGlvbjpXZWJwYWNrQ29uZmlndXJhdGlvbiA9IHtcbiAgICBiYWlsOiB0cnVlLFxuICAgIGNhY2hlOiBjb25maWd1cmF0aW9uLmNhY2hlLm1haW4sXG4gICAgY29udGV4dDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgZGV2dG9vbDogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC50b29sLFxuICAgIGRldlNlcnZlcjogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5zZXJ2ZXIsXG4gICAgLy8gcmVnaW9uIGlucHV0XG4gICAgZW50cnk6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQsXG4gICAgZXh0ZXJuYWxzOiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgIGFsaWFzRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICBleHRlbnNpb25zOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbCxcbiAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGUsXG4gICAgICAgIG1vZHVsZXM6IEhlbHBlci5ub3JtYWxpemVQYXRocyhjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyksXG4gICAgICAgIHVuc2FmZUNhY2hlOiBjb25maWd1cmF0aW9uLmNhY2hlLnVuc2FmZVxuICAgIH0sXG4gICAgcmVzb2x2ZUxvYWRlcjoge1xuICAgICAgICBhbGlhczogY29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlcyxcbiAgICAgICAgYWxpYXNGaWVsZHM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMuZmlsZSxcbiAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMubW9kdWxlLFxuICAgICAgICBtb2R1bGVzOiBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIG91dHB1dFxuICAgIG91dHB1dDoge1xuICAgICAgICBmaWxlbmFtZTogcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0KSxcbiAgICAgICAgaGFzaEZ1bmN0aW9uOiBjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG0sXG4gICAgICAgIGxpYnJhcnk6IGxpYnJhcnlOYW1lLFxuICAgICAgICBsaWJyYXJ5VGFyZ2V0OiAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnXG4gICAgICAgICkgPyAndmFyJyA6IGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LnNlbGYsXG4gICAgICAgIHBhdGg6IGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgcHVibGljUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5wdWJsaWMsXG4gICAgICAgIHBhdGhpbmZvOiBjb25maWd1cmF0aW9uLmRlYnVnLFxuICAgICAgICB1bWROYW1lZERlZmluZTogdHJ1ZVxuICAgIH0sXG4gICAgcGVyZm9ybWFuY2U6IGNvbmZpZ3VyYXRpb24ucGVyZm9ybWFuY2VIaW50cyxcbiAgICB0YXJnZXQ6IGNvbmZpZ3VyYXRpb24udGFyZ2V0VGVjaG5vbG9neSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICBtb2R1bGU6IHtcbiAgICAgICAgcnVsZXM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFkZGl0aW9uYWwubWFwKChcbiAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3RcbiAgICAgICAgKTpQbGFpbk9iamVjdCA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uZXhjbHVkZSB8fCAnZmFsc2UnLCBmaWxlUGF0aCksXG4gICAgICAgICAgICAgICAgaW5jbHVkZTogbG9hZGVyQ29uZmlndXJhdGlvbi5pbmNsdWRlICYmIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0XG4gICAgICAgICAgICAgICAgKSB8fCBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmJhc2UsXG4gICAgICAgICAgICAgICAgdGVzdDogbmV3IFJlZ0V4cChldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi50ZXN0LCBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCkpLFxuICAgICAgICAgICAgICAgIHVzZTogZXZhbHVhdGUobG9hZGVyQ29uZmlndXJhdGlvbi51c2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNvbmNhdChbXG4gICAgICAgICAgICBsb2FkZXIuZWpzLFxuICAgICAgICAgICAgbG9hZGVyLnNjcmlwdCxcbiAgICAgICAgICAgIGxvYWRlci5odG1sLm1haW4sIGxvYWRlci5odG1sLmVqcywgbG9hZGVyLmh0bWwuaHRtbCxcbiAgICAgICAgICAgIGxvYWRlci5zdHlsZSxcbiAgICAgICAgICAgIGxvYWRlci5mb250LmVvdCwgbG9hZGVyLmZvbnQuc3ZnLCBsb2FkZXIuZm9udC50dGYsXG4gICAgICAgICAgICBsb2FkZXIuZm9udC53b2ZmLFxuICAgICAgICAgICAgbG9hZGVyLmltYWdlLFxuICAgICAgICAgICAgbG9hZGVyLmRhdGFcbiAgICAgICAgXSlcbiAgICB9LFxuICAgIG5vZGU6IGNvbmZpZ3VyYXRpb24ubm9kZUVudmlyb25tZW50LFxuICAgIHBsdWdpbnM6IHBsdWdpbkluc3RhbmNlc1xufVxuaWYgKFxuICAgICFBcnJheS5pc0FycmF5KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9ucykgfHxcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnMubGVuZ3RoXG4pXG4gICAgd2VicGFja0NvbmZpZ3VyYXRpb24ubW9kdWxlLm5vUGFyc2UgPVxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnNcbmlmIChjb25maWd1cmF0aW9uLnNob3dDb25maWd1cmF0aW9uKSB7XG4gICAgY29uc29sZS5pbmZvKCdVc2luZyBpbnRlcm5hbCBjb25maWd1cmF0aW9uOicsIHV0aWwuaW5zcGVjdChjb25maWd1cmF0aW9uLCB7XG4gICAgICAgIGRlcHRoOiBudWxsfSkpXG4gICAgY29uc29sZS5pbmZvKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgY29uc29sZS5pbmZvKCdVc2luZyB3ZWJwYWNrIGNvbmZpZ3VyYXRpb246JywgdXRpbC5pbnNwZWN0KFxuICAgICAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbiwge2RlcHRoOiBudWxsfSkpXG59XG4vLyBlbmRyZWdpb25cbmV4cG9ydCBkZWZhdWx0IHdlYnBhY2tDb25maWd1cmF0aW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==