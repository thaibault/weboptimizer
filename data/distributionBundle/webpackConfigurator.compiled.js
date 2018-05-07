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

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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

var plugins = require('webpack-load-plugins')();
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */


plugins.BabelMinify = plugins.babelMinify;
plugins.HTML = plugins.html;
plugins.MiniCSSExtract = require('mini-css-extract-plugin');
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
var pluginInstances = [new _webpack2.default.optimize.OccurrenceOrderPlugin(true)];
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
        compiler.hooks.emit.tap('applyModulePattern', function (compilation) {
            for (var _request in compilation.assets) {
                if (compilation.assets.hasOwnProperty(_request)) {
                    var filePath = _request.replace(/\?[^?]+$/, '');
                    var _type = _helper2.default.determineAssetType(filePath, _configurator2.default.build.types, _configurator2.default.path);
                    if (_type && _configurator2.default.assetPattern[_type] && !new RegExp(_configurator2.default.assetPattern[_type].excludeFilePathRegularExpression).test(filePath)) {
                        var source = compilation.assets[_request].source();
                        if (typeof source === 'string') compilation.assets[_request] = new _webpackSources.RawSource(_configurator2.default.assetPattern[_type].pattern.replace(/\{1\}/g, source.replace(/\$/g, '$$$')));
                    }
                }
            }
        });
    } });
// /// endregion
// /// region in-place configured assets in the main html file
if (htmlAvailable && !['serve', 'test:browser'].includes(_configurator2.default.givenCommandLineArguments[2])) pluginInstances.push({ apply: function apply(compiler) {
        var filePathsToRemove = [];
        compiler.hooks.compilation.tap('inPlaceHTMLAssets', function (compilation) {
            return compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync('inPlaceHTMLAssets', function (data, callback) {
                if (_configurator2.default.inPlace.cascadingStyleSheet && (0, _keys2.default)(_configurator2.default.inPlace.cascadingStyleSheet).length || _configurator2.default.inPlace.javaScript && (0, _keys2.default)(_configurator2.default.inPlace.javaScript).length) try {
                    var result = _helper2.default.inPlaceCSSAndJavaScriptAssetReferences(data.html, _configurator2.default.inPlace.cascadingStyleSheet, _configurator2.default.inPlace.javaScript, _configurator2.default.path.target.base, _configurator2.default.files.compose.cascadingStyleSheet, _configurator2.default.files.compose.javaScript, compilation.assets);
                    data.html = result.content;
                    filePathsToRemove.concat(result.filePathsToRemove);
                } catch (error) {
                    return callback(error, data);
                }
                callback(null, data);
            });
        });
        compiler.hooks.afterEmit.tapAsync('removeInPlaceHTMLAssetFiles', function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data, callback) {
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
// /// region mark empty javaScript modules as dummy
if (!_configurator2.default.needed.javaScript) _configurator2.default.files.compose.javaScript = _path3.default.resolve(_configurator2.default.path.target.asset.javaScript, '.__dummy__.compiled.js');
// /// endregion
// /// region extract cascading style sheets
if (_configurator2.default.files.compose.cascadingStyleSheet) pluginInstances.push(new plugins.MiniCSSExtract({
    chunks: '[name].css',
    filename: _path3.default.relative(_configurator2.default.path.target.base, _configurator2.default.files.compose.cascadingStyleSheet)
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
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = (0, _getIterator3.default)(_configurator2.default.module.directoryNames.concat(_configurator2.default.loader.directoryNames)), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var _filePath = _step5.value;

                if (request.startsWith(_filePath)) {
                    request = request.substring(_filePath.length);
                    if (request.startsWith('/')) request = request.substring(1);
                    break;
                }
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
    var dllChunkExists = false;
    for (var _chunkName in _configurator2.default.injection.internal.normalized) {
        if (_configurator2.default.injection.internal.normalized.hasOwnProperty(_chunkName)) if (_configurator2.default.injection.dllChunkNames.includes(_chunkName)) dllChunkExists = true;else delete _configurator2.default.injection.internal.normalized[_chunkName];
    }if (dllChunkExists) {
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
if (htmlAvailable) pluginInstances.push({ apply: function apply(compiler) {
        return compiler.hooks.compilation.tap('compilation', function (compilation) {
            compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('removeDummyHTMLTags', function (data, callback) {
                var _arr3 = [data.body, data.head];

                for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
                    var tags = _arr3[_i3];
                    var _index = 0;
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;

                    try {
                        for (var _iterator7 = (0, _getIterator3.default)(tags), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var tag = _step7.value;

                            if (/^\.__dummy__(\..*)?$/.test(_path3.default.basename(tag.attributes.src || tag.attributes.href || ''))) tags.splice(_index, 1);
                            _index += 1;
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
                }
                var assets = JSON.parse(data.plugin.assetJson);
                var index = 0;
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = (0, _getIterator3.default)(assets), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var assetRequest = _step6.value;

                        if (/^\.__dummy__(\..*)?$/.test(_path3.default.basename(assetRequest))) assets.splice(index, 1);
                        index += 1;
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

                data.plugin.assetJson = (0, _stringify2.default)(assets);
                callback(null, data);
            });
            compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync('postProcessHTML', function (data, callback) {
                /*
                    NOTE: We have to prevent creating native "style" dom nodes
                    to prevent jsdom from parsing the entire cascading style
                    sheet. Which is error prune and very resource intensive.
                */
                var styleContents = [];
                data.html = data.html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style[^>]*>)/gi, function (match, startTag, content, endTag) {
                    styleContents.push(content);
                    return '' + startTag + endTag;
                });
                var dom = void 0;
                var window = void 0;
                try {
                    /*
                        NOTE: We have to translate template delimiter to html
                        compatible sequences and translate it back later to
                        avoid unexpected escape sequences in resulting html.
                    */
                    dom = new _jsdom.JSDOM(data.html.replace(/<%/g, '##+#+#+##').replace(/%>/g, '##-#-#-##'));
                } catch (error) {
                    return callback(error, data);
                }
                window = dom.window;
                var linkables = {
                    link: 'href',
                    script: 'src'
                };
                for (var tagName in linkables) {
                    if (linkables.hasOwnProperty(tagName)) {
                        var _iteratorNormalCompletion8 = true;
                        var _didIteratorError8 = false;
                        var _iteratorError8 = undefined;

                        try {
                            for (var _iterator8 = (0, _getIterator3.default)(window.document.querySelectorAll(tagName + '[' + linkables[tagName] + '*="?' + (_configurator2.default.hashAlgorithm + '="]'))), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                var domNode = _step8.value;

                                /*
                                    NOTE: Removing symbols after a "&" in hash
                                    string is necessary to match the generated
                                    request strings in offline plugin.
                                */
                                domNode.setAttribute(linkables[tagName], domNode.getAttribute(linkables[tagName]).replace(new RegExp('(\\?' + _configurator2.default.hashAlgorithm + '=' + '[^&]+).*$'), '$1'));
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
                } /*
                      NOTE: We have to restore template delimiter and style
                      contents.
                  */
                data.html = dom.serialize().replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>').replace(/(<style[^>]*>)[\s\S]*?(<\/style[^>]*>)/gi, function (match, startTag, endTag) {
                    return '' + startTag + styleContents.shift() + endTag;
                });
                // region post compilation
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = (0, _getIterator3.default)(_configurator2.default.files.html), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var htmlFileSpecification = _step9.value;

                        if (htmlFileSpecification.filename === data.plugin.options.filename) {
                            var _iteratorNormalCompletion10 = true;
                            var _didIteratorError10 = false;
                            var _iteratorError10 = undefined;

                            try {
                                for (var _iterator10 = (0, _getIterator3.default)(htmlFileSpecification.template.use), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                    var loaderConfiguration = _step10.value;

                                    if (loaderConfiguration.hasOwnProperty('options') && loaderConfiguration.options.hasOwnProperty('compileSteps') && typeof loaderConfiguration.options.compileSteps === 'number') data.html = _ejsLoader2.default.bind(_clientnode2.default.extendObject(true, {}, {
                                        options: loaderConfiguration.options || {}
                                    }, { options: {
                                            compileSteps: htmlFileSpecification.template.postCompileSteps
                                        } }))(data.html);
                                }
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

                            break;
                        }
                    } // endregion
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

                callback(null, data);
            });
        });
    } });
/*
    NOTE: The umd module export doesn't handle cases where the package name
    doesn't match exported library name. This post processing fixes this issue.
*/
if (_configurator2.default.exportFormat.external.startsWith('umd')) pluginInstances.push({ apply: function apply(compiler) {
        return compiler.hooks.emit.tapAsync('fixLibraryNameExports', function (compilation, callback) {
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
var _iteratorNormalCompletion11 = true;
var _didIteratorError11 = false;
var _iteratorError11 = undefined;

try {
    for (var _iterator11 = (0, _getIterator3.default)(_configurator2.default.module.replacements.context), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
        var contextReplacement = _step11.value;

        pluginInstances.push(new (Function.prototype.bind.apply(_webpack2.default.ContextReplacementPlugin, [null].concat((0, _toConsumableArray3.default)(contextReplacement.map(function (value) {
            return new Function('configuration', '__dirname', '__filename', 'return ' + value
            // IgnoreTypeCheck
            )(_configurator2.default, __dirname, __filename);
        })))))());
    } // // endregion
    // / endregion
    // / region loader helper
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
                    })].concat(_configurator2.default.module.optimizer.cssnano ? (0, _cssnano2.default)(_configurator2.default.module.optimizer.cssnano) : []);
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
    /*
        NOTE: We have to remove the client side javascript hmr style loader
        first.
    */
    loader.style.use.shift();
    loader.style.use.unshift(plugins.MiniCSSExtract.loader);
}
// / endregion
// endregion
var _iteratorNormalCompletion12 = true;
var _didIteratorError12 = false;
var _iteratorError12 = undefined;

try {
    for (var _iterator12 = (0, _getIterator3.default)(_configurator2.default.plugins), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
        var pluginConfiguration = _step12.value;

        pluginInstances.push(new (Function.prototype.bind.apply(eval('require')(pluginConfiguration.name.module)[pluginConfiguration.name.initializer], [null].concat((0, _toConsumableArray3.default)(pluginConfiguration.parameter))))());
    } // region configuration
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
        umdNamedDefine: true
    },
    performance: _configurator2.default.performanceHints,
    target: _configurator2.default.targetTechnology,
    // endregion
    mode: _configurator2.default.debug ? 'development' : 'production',
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
    optimization: {
        minimize: _configurator2.default.module.optimizer.uglify,
        // region common chunks
        splitChunks: !_configurator2.default.injection.chunks || _configurator2.default.targetTechnology !== 'web' || ['build:dll', 'test'].includes(_configurator2.default.givenCommandLineArguments[2]) ? {
            cacheGroups: {
                default: false,
                vendors: false
            }
        } : _clientnode2.default.extendObject(true, {
            chunks: 'all',
            cacheGroups: {
                vendors: {
                    chunks: function chunks(module) {
                        if ((0, _typeof3.default)(_configurator2.default.inPlace.javaScript) === 'object' && _configurator2.default.inPlace.javaScript !== null) {
                            var _iteratorNormalCompletion13 = true;
                            var _didIteratorError13 = false;
                            var _iteratorError13 = undefined;

                            try {
                                for (var _iterator13 = (0, _getIterator3.default)((0, _keys2.default)(_configurator2.default.inPlace.javaScript)), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                                    var _name = _step13.value;

                                    if (_name === '*' || _name === module.name) return false;
                                }
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
                        }return true;
                    },
                    priority: -10,
                    reuseExistingChunk: true,
                    test: /[\\/]node_modules[\\/]/
                }
            }
        }, _configurator2.default.injection.chunks)
        // endregion
    },
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FBV0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTs7OztBQUlBOzs7O0FBQ0E7O0FBQ0E7O0lBQVksVTs7QUFDWjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7O0FBV0E7Ozs7QUFNQTs7OztBQUNBOzs7O0FBS0E7Ozs7QUFRQTs7Ozs7Ozs7QUFoQ0EsSUFBTSxVQUFVLFFBQVEsc0JBQVIsR0FBaEI7QUFaQTs7QUFGQTs7O0FBaUJBLFFBQVEsV0FBUixHQUFzQixRQUFRLFdBQTlCO0FBQ0EsUUFBUSxJQUFSLEdBQWUsUUFBUSxJQUF2QjtBQUNBLFFBQVEsY0FBUixHQUF5QixRQUFRLHlCQUFSLENBQXpCO0FBQ0EsUUFBUSxrQkFBUixHQUE2QixRQUFRLCtCQUFSLENBQTdCO0FBQ0EsUUFBUSxXQUFSLEdBQXNCLFFBQVEsV0FBOUI7QUFDQSxRQUFRLE9BQVIsR0FBa0IsUUFBUSx5QkFBUixDQUFsQjtBQUNBLFFBQVEsUUFBUixHQUFtQixRQUFRLHlCQUFSLEVBQW1DLE9BQXREO0FBQ0EsUUFBUSxPQUFSLEdBQWtCLFFBQVEsZ0JBQVIsQ0FBbEI7QUFPQTs7QUFKQTs7O0FBUUE7QUFDQTtBQUNBOztBQUVBLFFBQVEsS0FBUixDQUFjLFFBQVEsT0FBUixDQUFnQixhQUFoQixDQUFkLEVBQThDLE9BQTlDLEdBQXdELFlBRWxEO0FBQ0YseUJBQU0sWUFBTixDQUFtQixJQUFuQixFQUF5QixLQUFLLE9BQTlCLEVBQXVDLE1BQXZDLEVBQStDLEtBQUssT0FBcEQ7O0FBREUsc0NBREMsU0FDRDtBQURDLGlCQUNEO0FBQUE7O0FBRUYsV0FBTyxxQkFBdUIsSUFBdkIsOEJBQTRCLElBQTVCLFNBQXFDLFNBQXJDLEVBQVA7QUFD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QUFBQTtBQUFBLHlCQWFBLE9BQU8sSUFBUDtBQUNILHFCQWhCSTtBQWlCTCw4QkFBVSxDQUFDLEVBakJOO0FBa0JMLHdDQUFvQixJQWxCZjtBQW1CTCwwQkFBTTtBQW5CRDtBQURBO0FBRlgsU0FETixFQTBCRyx1QkFBYyxTQUFkLENBQXdCLE1BMUIzQjtBQTJCUjtBQTFDVSxLQXpFdUM7QUFxSHJELGFBQVM7QUFySDRDLENBQWxEO0FBdUhQLElBQ0ksQ0FBQyxNQUFNLE9BQU4sQ0FBYyx1QkFBYyxNQUFkLENBQXFCLDJCQUFuQyxDQUFELElBQ0EsdUJBQWMsTUFBZCxDQUFxQiwyQkFBckIsQ0FBaUQsTUFGckQsRUFJSSxxQkFBcUIsTUFBckIsQ0FBNEIsT0FBNUIsR0FDSSx1QkFBYyxNQUFkLENBQXFCLDJCQUR6QjtBQUVKLElBQUksdUJBQWMsaUJBQWxCLEVBQXFDO0FBQ2pDLFlBQVEsSUFBUixDQUFhLCtCQUFiLEVBQThDLGVBQUssT0FBTCxDQUFhLHNCQUFiLEVBQTRCO0FBQ3RFLGVBQU8sSUFEK0QsRUFBNUIsQ0FBOUM7QUFFQSxZQUFRLElBQVIsQ0FBYSw2REFBYjtBQUNBLFlBQVEsSUFBUixDQUFhLDhCQUFiLEVBQTZDLGVBQUssT0FBTCxDQUN6QyxvQkFEeUMsRUFDbkIsRUFBQyxPQUFPLElBQVIsRUFEbUIsQ0FBN0M7QUFFSDtBQUNEO2tCQUNlLG9CO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoid2VicGFja0NvbmZpZ3VyYXRvci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuLy8gQGZsb3dcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9ucyBuYW1pbmdcbiAgICAzLjAgdW5wb3J0ZWQgbGljZW5zZS4gc2VlIGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCB0eXBlIHtEb21Ob2RlLCBQbGFpbk9iamVjdCwgUHJvY2VkdXJlRnVuY3Rpb24sIFdpbmRvd30gZnJvbSAnY2xpZW50bm9kZSdcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCBwb3N0Y3NzQ1NTbmFubyBmcm9tICdjc3NuYW5vJ1xuaW1wb3J0IHtKU0RPTSBhcyBET019IGZyb20gJ2pzZG9tJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcG9zdGNzc0NTU25leHQgZnJvbSAncG9zdGNzcy1jc3NuZXh0J1xuaW1wb3J0IHBvc3Rjc3NGb250UGF0aCBmcm9tICdwb3N0Y3NzLWZvbnRwYXRoJ1xuaW1wb3J0IHBvc3Rjc3NJbXBvcnQgZnJvbSAncG9zdGNzcy1pbXBvcnQnXG5pbXBvcnQgcG9zdGNzc1Nwcml0ZXMgZnJvbSAncG9zdGNzcy1zcHJpdGVzJ1xuaW1wb3J0IHBvc3Rjc3NVUkwgZnJvbSAncG9zdGNzcy11cmwnXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IHdlYnBhY2sgZnJvbSAnd2VicGFjaydcbmNvbnN0IHBsdWdpbnMgPSByZXF1aXJlKCd3ZWJwYWNrLWxvYWQtcGx1Z2lucycpKClcbmltcG9ydCB7UmF3U291cmNlIGFzIFdlYnBhY2tSYXdTb3VyY2V9IGZyb20gJ3dlYnBhY2stc291cmNlcydcblxucGx1Z2lucy5CYWJlbE1pbmlmeSA9IHBsdWdpbnMuYmFiZWxNaW5pZnlcbnBsdWdpbnMuSFRNTCA9IHBsdWdpbnMuaHRtbFxucGx1Z2lucy5NaW5pQ1NTRXh0cmFjdCA9IHJlcXVpcmUoJ21pbmktY3NzLWV4dHJhY3QtcGx1Z2luJylcbnBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luID0gcmVxdWlyZSgnYWRkLWFzc2V0LWh0bWwtd2VicGFjay1wbHVnaW4nKVxucGx1Z2lucy5PcGVuQnJvd3NlciA9IHBsdWdpbnMub3BlbkJyb3dzZXJcbnBsdWdpbnMuRmF2aWNvbiA9IHJlcXVpcmUoJ2Zhdmljb25zLXdlYnBhY2stcGx1Z2luJylcbnBsdWdpbnMuSW1hZ2VtaW4gPSByZXF1aXJlKCdpbWFnZW1pbi13ZWJwYWNrLXBsdWdpbicpLmRlZmF1bHRcbnBsdWdpbnMuT2ZmbGluZSA9IHJlcXVpcmUoJ29mZmxpbmUtcGx1Z2luJylcblxuaW1wb3J0IGVqc0xvYWRlciBmcm9tICcuL2Vqc0xvYWRlci5jb21waWxlZCdcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgdHlwZSB7XG4gICAgSFRNTENvbmZpZ3VyYXRpb24sIFBsdWdpbkNvbmZpZ3VyYXRpb24sIFdlYnBhY2tDb25maWd1cmF0aW9uXG59IGZyb20gJy4vdHlwZSdcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yLmNvbXBpbGVkJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcblxuLy8gLyByZWdpb24gbW9ua2V5IHBhdGNoZXNcbi8vIE1vbmtleS1QYXRjaCBodG1sIGxvYWRlciB0byByZXRyaWV2ZSBodG1sIGxvYWRlciBvcHRpb25zIHNpbmNlIHRoZVxuLy8gXCJ3ZWJwYWNrLWh0bWwtcGx1Z2luXCIgZG9lc24ndCBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgbG9hZGVyIGludGVyZmFjZS5cbmltcG9ydCBodG1sTG9hZGVyTW9kdWxlQmFja3VwIGZyb20gJ2h0bWwtbG9hZGVyJ1xucmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2h0bWwtbG9hZGVyJyldLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgICAuLi5wYXJhbWV0ZXI6QXJyYXk8YW55PlxuKTphbnkge1xuICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB0aGlzLm9wdGlvbnMsIG1vZHVsZSwgdGhpcy5vcHRpb25zKVxuICAgIHJldHVybiBodG1sTG9hZGVyTW9kdWxlQmFja3VwLmNhbGwodGhpcywgLi4ucGFyYW1ldGVyKVxufVxuLy8gTW9ua2V5LVBhdGNoIGxvYWRlci11dGlscyB0byBkZWZpbmUgd2hpY2ggdXJsIGlzIGEgbG9jYWwgcmVxdWVzdC5cbmltcG9ydCBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cCBmcm9tICdsb2FkZXItdXRpbHMnXG5jb25zdCBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cDoodXJsOnN0cmluZykgPT4gYm9vbGVhbiA9XG4gICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAuaXNVcmxSZXF1ZXN0XG5yZXF1aXJlLmNhY2hlW3JlcXVpcmUucmVzb2x2ZSgnbG9hZGVyLXV0aWxzJyldLmV4cG9ydHMuaXNVcmxSZXF1ZXN0ID0gKFxuICAgIHVybDpzdHJpbmcsIC4uLmFkZGl0aW9uYWxQYXJhbWV0ZXI6QXJyYXk8YW55PlxuKTpib29sZWFuID0+IHtcbiAgICBpZiAodXJsLm1hdGNoKC9eW2Etel0rOi4rLykpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIHJldHVybiBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cC5hcHBseShcbiAgICAgICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAsIFt1cmxdLmNvbmNhdChhZGRpdGlvbmFsUGFyYW1ldGVyKSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBpbml0aWFsaXNhdGlvblxuLy8gLyByZWdpb24gZGV0ZXJtaW5lIGxpYnJhcnkgbmFtZVxubGV0IGxpYnJhcnlOYW1lOnN0cmluZ1xuaWYgKCdsaWJyYXJ5TmFtZScgaW4gY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmxpYnJhcnlOYW1lKVxuICAgIGxpYnJhcnlOYW1lID0gY29uZmlndXJhdGlvbi5saWJyYXJ5TmFtZVxuZWxzZSBpZiAoT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCkubGVuZ3RoID4gMSlcbiAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV0nXG5lbHNlIHtcbiAgICBsaWJyYXJ5TmFtZSA9IGNvbmZpZ3VyYXRpb24ubmFtZVxuICAgIGlmIChjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmID09PSAndmFyJylcbiAgICAgICAgbGlicmFyeU5hbWUgPSBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShsaWJyYXJ5TmFtZSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBwbHVnaW5zXG5jb25zdCBwbHVnaW5JbnN0YW5jZXM6QXJyYXk8T2JqZWN0PiA9IFtcbiAgICBuZXcgd2VicGFjay5vcHRpbWl6ZS5PY2N1cnJlbmNlT3JkZXJQbHVnaW4odHJ1ZSlcbl1cbi8vIC8vIHJlZ2lvbiBkZWZpbmUgbW9kdWxlcyB0byBpZ25vcmVcbmZvciAoY29uc3QgaWdub3JlUGF0dGVybjpzdHJpbmcgb2YgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaWdub3JlUGF0dGVybilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5JZ25vcmVQbHVnaW4obmV3IFJlZ0V4cChpZ25vcmVQYXR0ZXJuKSkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBkZWZpbmUgbW9kdWxlcyB0byByZXBsYWNlXG5mb3IgKGNvbnN0IHNvdXJjZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbClcbiAgICBpZiAoY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbC5oYXNPd25Qcm9wZXJ0eShzb3VyY2UpKSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaDpSZWdFeHAgPSBuZXcgUmVnRXhwKHNvdXJjZSlcbiAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suTm9ybWFsTW9kdWxlUmVwbGFjZW1lbnRQbHVnaW4oXG4gICAgICAgICAgICBzZWFyY2gsIChyZXNvdXJjZTp7cmVxdWVzdDpzdHJpbmd9KTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5yZXF1ZXN0ID0gcmVzb3VyY2UucmVxdWVzdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gsIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWxbc291cmNlXSlcbiAgICAgICAgICAgIH0pKVxuICAgIH1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGdlbmVyYXRlIGh0bWwgZmlsZVxubGV0IGh0bWxBdmFpbGFibGU6Ym9vbGVhbiA9IGZhbHNlXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGQ6ZGxsJylcbiAgICBmb3IgKGxldCBodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbiBvZiBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwpXG4gICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKSkge1xuICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuSFRNTChUb29scy5leHRlbmRPYmplY3QoXG4gICAgICAgICAgICAgICAge30sIGh0bWxDb25maWd1cmF0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5yZXF1ZXN0fSkpKVxuICAgICAgICAgICAgaHRtbEF2YWlsYWJsZSA9IHRydWVcbiAgICAgICAgfVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgZmF2aWNvbnNcbmlmIChodG1sQXZhaWxhYmxlICYmIGNvbmZpZ3VyYXRpb24uZmF2aWNvbiAmJiBUb29scy5pc0ZpbGVTeW5jKFxuICAgIGNvbmZpZ3VyYXRpb24uZmF2aWNvbi5sb2dvXG4pKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkZhdmljb24oY29uZmlndXJhdGlvbi5mYXZpY29uKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIHByb3ZpZGUgb2ZmbGluZSBmdW5jdGlvbmFsaXR5XG5pZiAoaHRtbEF2YWlsYWJsZSAmJiBjb25maWd1cmF0aW9uLm9mZmxpbmUpIHtcbiAgICBpZiAoIVsnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkpXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpQbGFpbk9iamVjdCBvZiBbXG4gICAgICAgICAgICBbJ2Nhc2NhZGluZ1N0eWxlU2hlZXQnLCAnY3NzJ10sXG4gICAgICAgICAgICBbJ2phdmFTY3JpcHQnLCAnanMnXVxuICAgICAgICBdKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5QbGFjZVt0eXBlWzBdXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXM6QXJyYXk8c3RyaW5nPiA9IE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2VbdHlwZVswXV0pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lOnN0cmluZyBvZiBtYXRjaGVzKVxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm9mZmxpbmUuZXhjbHVkZXMucHVzaChwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldFt0eXBlWzBdXVxuICAgICAgICAgICAgICAgICAgICApICsgYCR7bmFtZX0uJHt0eXBlWzFdfT8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09KmApXG4gICAgICAgICAgICB9XG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuT2ZmbGluZShjb25maWd1cmF0aW9uLm9mZmxpbmUpKVxufVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gb3BlbnMgYnJvd3NlciBhdXRvbWF0aWNhbGx5XG5pZiAoY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5vcGVuQnJvd3NlciAmJiAoaHRtbEF2YWlsYWJsZSAmJiBbXG4gICAgJ3NlcnZlJywgJ3Rlc3Q6YnJvd3Nlcidcbl0uaW5jbHVkZXMoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKSkpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuT3BlbkJyb3dzZXIoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZGV2ZWxvcG1lbnQub3BlbkJyb3dzZXIpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gcHJvdmlkZSBidWlsZCBlbnZpcm9ubWVudFxuaWYgKGNvbmZpZ3VyYXRpb24uYnVpbGQuZGVmaW5pdGlvbnMpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGVmaW5lUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLmRlZmluaXRpb25zKSlcbmlmIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcm92aWRlKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLlByb3ZpZGVQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByb3ZpZGUpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gbW9kdWxlcy9hc3NldHNcbi8vIC8vLyByZWdpb24gcGVyZm9ybSBqYXZhU2NyaXB0IG1pbmlmaWNhdGlvbi9vcHRpbWlzYXRpb25cbmlmIChcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkgJiZcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlXG4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goT2JqZWN0LmtleXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeS5idW5kbGVcbiAgICApLmxlbmd0aCA/XG4gICAgICAgIG5ldyBwbHVnaW5zLkJhYmVsTWluaWZ5KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5LmJ1bmRsZS50cmFuc2Zvcm0gfHwge30sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlLnBsdWdpbiB8fCB7fSxcbiAgICAgICAgKSA6IG5ldyBwbHVnaW5zLkJhYmVsTWluaWZ5KCkpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGFwcGx5IG1vZHVsZSBwYXR0ZXJuXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgIGNvbXBpbGVyLmhvb2tzLmVtaXQudGFwKCdhcHBseU1vZHVsZVBhdHRlcm4nLCAoXG4gICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdFxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcmVxdWVzdDpzdHJpbmcgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgaWYgKGNvbXBpbGF0aW9uLmFzc2V0cy5oYXNPd25Qcm9wZXJ0eShyZXF1ZXN0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IHJlcXVlc3QucmVwbGFjZSgvXFw/W14/XSskLywgJycpXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgICAgICBpZiAodHlwZSAmJiBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXSAmJiAhKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAuZXhjbHVkZUZpbGVQYXRoUmVndWxhckV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICApKS50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2U6P3N0cmluZyA9IGNvbXBpbGF0aW9uLmFzc2V0c1tyZXF1ZXN0XS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbcmVxdWVzdF0gPSBuZXcgV2VicGFja1Jhd1NvdXJjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXS5wYXR0ZXJuLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC9cXHsxXFx9L2csIHNvdXJjZS5yZXBsYWNlKC9cXCQvZywgJyQkJCcpKSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgfSlcbn19KVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBpbi1wbGFjZSBjb25maWd1cmVkIGFzc2V0cyBpbiB0aGUgbWFpbiBodG1sIGZpbGVcbmlmIChodG1sQXZhaWxhYmxlICYmICFbJ3NlcnZlJywgJ3Rlc3Q6YnJvd3NlciddLmluY2x1ZGVzKFxuICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgICAgICBjb25zdCBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgY29tcGlsZXIuaG9va3MuY29tcGlsYXRpb24udGFwKCdpblBsYWNlSFRNTEFzc2V0cycsIChcbiAgICAgICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdFxuICAgICAgICApOnZvaWQgPT5cbiAgICAgICAgICAgIGNvbXBpbGF0aW9uLmhvb2tzLmh0bWxXZWJwYWNrUGx1Z2luQWZ0ZXJIdG1sUHJvY2Vzc2luZy50YXBBc3luYyhcbiAgICAgICAgICAgICAgICAnaW5QbGFjZUhUTUxBc3NldHMnLFxuICAgICAgICAgICAgICAgIChkYXRhOlBsYWluT2JqZWN0LCBjYWxsYmFjazpQcm9jZWR1cmVGdW5jdGlvbik6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICAgICAgICAgICAgICAgICAgKS5sZW5ndGggfHwgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZywgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBIZWxwZXIuaW5QbGFjZUNTU0FuZEphdmFTY3JpcHRBc3NldFJlZmVyZW5jZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaHRtbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5odG1sID0gcmVzdWx0LmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZS5jb25jYXQocmVzdWx0LmZpbGVQYXRoc1RvUmVtb3ZlKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgIGNvbXBpbGVyLmhvb2tzLmFmdGVyRW1pdC50YXBBc3luYyhcbiAgICAgICAgICAgICdyZW1vdmVJblBsYWNlSFRNTEFzc2V0RmlsZXMnLCBhc3luYyAoXG4gICAgICAgICAgICAgICAgZGF0YTpPYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgICAgICAgICApOlByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwcm9taXNlczpBcnJheTxQcm9taXNlPHZvaWQ+PiA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoOnN0cmluZyBvZiBmaWxlUGF0aHNUb1JlbW92ZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF3YWl0IFRvb2xzLmlzRmlsZShwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmU6RnVuY3Rpb24pOnZvaWQgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnVubGluayhwYXRoLCAoZXJyb3I6P0Vycm9yKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpKVxuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgICAgIHByb21pc2VzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2phdmFTY3JpcHQnLCAnY2FzY2FkaW5nU3R5bGVTaGVldCddXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogV29ya2Fyb3VuZCBzaW5jZSBmbG93IG1pc3NlcyB0aGUgdGhyZWUgcGFyYW1ldGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInJlYWRkaXJcIiBzaWduYXR1cmUuXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiAoZmlsZVN5c3RlbS5yZWFkZGlyOkZ1bmN0aW9uKShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgKGVycm9yOj9FcnJvciwgZmlsZXM6QXJyYXk8c3RyaW5nPik6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0ucm1kaXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVdLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpKVxuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgIH0pXG4gICAgfX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHJlbW92ZSBjaHVua3MgaWYgYSBjb3JyZXNwb25kaW5nIGRsbCBwYWNrYWdlIGV4aXN0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkOmRsbCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hbmlmZXN0RmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9LyR7Y2h1bmtOYW1lfS5gICtcbiAgICAgICAgICAgICAgICBgZGxsLW1hbmlmZXN0Lmpzb25gXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBtYW5pZmVzdEZpbGVQYXRoXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICApLCB7J1tuYW1lXSc6IGNodW5rTmFtZX0pXG4gICAgICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZXBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlU291cmNlbWFwOiBUb29scy5pc0ZpbGVTeW5jKGAke2ZpbGVQYXRofS5tYXBgKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRsbFJlZmVyZW5jZVBsdWdpbih7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBtYW5pZmVzdDogcmVxdWlyZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hbmlmZXN0RmlsZVBhdGgpfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gbWFyayBlbXB0eSBqYXZhU2NyaXB0IG1vZHVsZXMgYXMgZHVtbXlcbmlmICghY29uZmlndXJhdGlvbi5uZWVkZWQuamF2YVNjcmlwdClcbiAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5qYXZhU2NyaXB0LCAnLl9fZHVtbXlfXy5jb21waWxlZC5qcycpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGV4dHJhY3QgY2FzY2FkaW5nIHN0eWxlIHNoZWV0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLk1pbmlDU1NFeHRyYWN0KHtcbiAgICAgICAgY2h1bmtzOiAnW25hbWVdLmNzcycsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQpXG4gICAgfSkpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHBlcmZvcm1zIGltcGxpY2l0IGV4dGVybmFsIGxvZ2ljXG5pZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwubW9kdWxlcyA9PT0gJ19faW1wbGljaXRfXycpXG4gICAgLypcbiAgICAgICAgV2Ugb25seSB3YW50IHRvIHByb2Nlc3MgbW9kdWxlcyBmcm9tIGxvY2FsIGNvbnRleHQgaW4gbGlicmFyeSBtb2RlLFxuICAgICAgICBzaW5jZSBhIGNvbmNyZXRlIHByb2plY3QgdXNpbmcgdGhpcyBsaWJyYXJ5IHNob3VsZCBjb21iaW5lIGFsbCBhc3NldHNcbiAgICAgICAgKGFuZCBkZWR1cGxpY2F0ZSB0aGVtKSBmb3Igb3B0aW1hbCBidW5kbGluZyByZXN1bHRzLiBOT1RFOiBPbmx5IG5hdGl2ZVxuICAgICAgICBqYXZhU2NyaXB0IGFuZCBqc29uIG1vZHVsZXMgd2lsbCBiZSBtYXJrZWQgYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAqL1xuICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMgPSAoXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nLCByZXF1ZXN0OnN0cmluZywgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICApOnZvaWQgPT4ge1xuICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5yZXBsYWNlKC9eISsvLCAnJylcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgcmVxdWVzdCA9IHBhdGgucmVsYXRpdmUoY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIHJlcXVlc3QpXG4gICAgICAgIGZvciAoXG4gICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2ZcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lcylcbiAgICAgICAgKVxuICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoZmlsZVBhdGgubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgbGV0IHJlc29sdmVkUmVxdWVzdDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUV4dGVybmFsUmVxdWVzdChcbiAgICAgICAgICAgIHJlcXVlc3QsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBjb250ZXh0LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aFxuICAgICAgICAgICAgKSkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aClcbiAgICAgICAgICAgICksIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLCBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuaW1wbGljaXQucGF0dGVybi5pbmNsdWRlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuaW1wbGljaXQucGF0dGVybi5leGNsdWRlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmV4dGVybmFsTGlicmFyeS5ub3JtYWwsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuZXh0ZXJuYWxMaWJyYXJ5LmR5bmFtaWMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nKVxuICAgICAgICBpZiAocmVzb2x2ZWRSZXF1ZXN0KSB7XG4gICAgICAgICAgICBpZiAoWyd2YXInLCAndW1kJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWxcbiAgICAgICAgICAgICkgJiYgcmVxdWVzdCBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCA9IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RdXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwgPT09ICd2YXInKVxuICAgICAgICAgICAgICAgIHJlc29sdmVkUmVxdWVzdCA9IFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFJlcXVlc3QsICcwLTlhLXpBLVpfJFxcXFwuJylcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhcbiAgICAgICAgICAgICAgICBudWxsLCByZXNvbHZlZFJlcXVlc3QsIGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpXG4gICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBidWlsZCBkbGwgcGFja2FnZXNcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnKSB7XG4gICAgbGV0IGRsbENodW5rRXhpc3RzOmJvb2xlYW4gPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICApKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmRsbENodW5rTmFtZXMuaW5jbHVkZXMoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBkbGxDaHVua0V4aXN0cyA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgaWYgKGRsbENodW5rRXhpc3RzKSB7XG4gICAgICAgIGxpYnJhcnlOYW1lID0gJ1tuYW1lXURMTFBhY2thZ2UnXG4gICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRsbFBsdWdpbih7XG4gICAgICAgICAgICBwYXRoOiBgJHtjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9L1tuYW1lXS5kbGwtbWFuaWZlc3QuanNvbmAsXG4gICAgICAgICAgICBuYW1lOiBsaWJyYXJ5TmFtZVxuICAgICAgICB9KSlcbiAgICB9IGVsc2VcbiAgICAgICAgY29uc29sZS53YXJuKCdObyBkbGwgY2h1bmsgaWQgZm91bmQuJylcbn1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGFwcGx5IGZpbmFsIGRvbS9qYXZhU2NyaXB0L2Nhc2NhZGluZ1N0eWxlU2hlZXQgbW9kaWZpY2F0aW9ucy9maXhlc1xuaWYgKGh0bWxBdmFpbGFibGUpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoXG4gICAgICAgIGNvbXBpbGVyOk9iamVjdFxuICAgICk6dm9pZCA9PiBjb21waWxlci5ob29rcy5jb21waWxhdGlvbi50YXAoJ2NvbXBpbGF0aW9uJywgKFxuICAgICAgICBjb21waWxhdGlvbjpPYmplY3RcbiAgICApOnZvaWQgPT4ge1xuICAgICAgICBjb21waWxhdGlvbi5ob29rcy5odG1sV2VicGFja1BsdWdpbkFsdGVyQXNzZXRUYWdzLnRhcEFzeW5jKFxuICAgICAgICAgICAgJ3JlbW92ZUR1bW15SFRNTFRhZ3MnLFxuICAgICAgICAgICAgKGRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZ3M6QXJyYXk8UGxhaW5PYmplY3Q+IG9mIFtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5ib2R5LCBkYXRhLmhlYWRcbiAgICAgICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnOlBsYWluT2JqZWN0IG9mIHRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgvXlxcLl9fZHVtbXlfXyhcXC4uKik/JC8udGVzdChwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5hdHRyaWJ1dGVzLnNyYyB8fCB0YWcuYXR0cmlidXRlcy5ocmVmIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldHM6QXJyYXk8c3RyaW5nPiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucGx1Z2luLmFzc2V0SnNvbilcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXRSZXF1ZXN0OnN0cmluZyBvZiBhc3NldHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eXFwuX19kdW1teV9fKFxcLi4qKT8kLy50ZXN0KHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldHMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGEucGx1Z2luLmFzc2V0SnNvbiA9IEpTT04uc3RyaW5naWZ5KGFzc2V0cylcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgY29tcGlsYXRpb24uaG9va3MuaHRtbFdlYnBhY2tQbHVnaW5BZnRlckh0bWxQcm9jZXNzaW5nLnRhcEFzeW5jKFxuICAgICAgICAgICAgJ3Bvc3RQcm9jZXNzSFRNTCcsXG4gICAgICAgICAgICAoZGF0YTpQbGFpbk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb24pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gcHJldmVudCBjcmVhdGluZyBuYXRpdmUgXCJzdHlsZVwiIGRvbSBub2Rlc1xuICAgICAgICAgICAgICAgICAgICB0byBwcmV2ZW50IGpzZG9tIGZyb20gcGFyc2luZyB0aGUgZW50aXJlIGNhc2NhZGluZyBzdHlsZVxuICAgICAgICAgICAgICAgICAgICBzaGVldC4gV2hpY2ggaXMgZXJyb3IgcHJ1bmUgYW5kIHZlcnkgcmVzb3VyY2UgaW50ZW5zaXZlLlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3Qgc3R5bGVDb250ZW50czpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgICAgICAgICBkYXRhLmh0bWwgPSBkYXRhLmh0bWwucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLyg8c3R5bGVbXj5dKj4pKFtcXHNcXFNdKj8pKDxcXC9zdHlsZVtePl0qPikvZ2ksIChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGFnOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICApOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZUNvbnRlbnRzLnB1c2goY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtzdGFydFRhZ30ke2VuZFRhZ31gXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgbGV0IGRvbTpET01cbiAgICAgICAgICAgICAgICBsZXQgd2luZG93OldpbmRvd1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHRyYW5zbGF0ZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgdG8gaHRtbFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGF0aWJsZSBzZXF1ZW5jZXMgYW5kIHRyYW5zbGF0ZSBpdCBiYWNrIGxhdGVyIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICBhdm9pZCB1bmV4cGVjdGVkIGVzY2FwZSBzZXF1ZW5jZXMgaW4gcmVzdWx0aW5nIGh0bWwuXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGRvbSA9IG5ldyBET00oXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmh0bWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPCUvZywgJyMjKyMrIysjIycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyU+L2csICcjIy0jLSMtIyMnKSlcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGRhdGEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdpbmRvdyA9IGRvbS53aW5kb3dcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5rYWJsZXM6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xuICAgICAgICAgICAgICAgICAgICBsaW5rOiAnaHJlZicsXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdDogJ3NyYydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWdOYW1lOnN0cmluZyBpbiBsaW5rYWJsZXMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rYWJsZXMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0YWdOYW1lfVske2xpbmthYmxlc1t0YWdOYW1lXX0qPVwiP2AgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVwiXWApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogUmVtb3Zpbmcgc3ltYm9scyBhZnRlciBhIFwiJlwiIGluIGhhc2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nIGlzIG5lY2Vzc2FyeSB0byBtYXRjaCB0aGUgZ2VuZXJhdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3Qgc3RyaW5ncyBpbiBvZmZsaW5lIHBsdWdpbi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZXNbdGFnTmFtZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuZ2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2FibGVzW3RhZ05hbWVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYChcXFxcPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdbXiZdKykuKiQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksICckMScpKVxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gcmVzdG9yZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgYW5kIHN0eWxlXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzLlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZGF0YS5odG1sID0gZG9tLnNlcmlhbGl6ZSgpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8jI1xcKyNcXCsjXFwrIyMvZywgJzwlJylcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyMjLSMtIy0jIy9nLCAnJT4nKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKDxzdHlsZVtePl0qPilbXFxzXFxTXSo/KDxcXC9zdHlsZVtePl0qPikvZ2ksIChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGFnOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRhZzpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3N0YXJ0VGFnfSR7c3R5bGVDb250ZW50cy5zaGlmdCgpfSR7ZW5kVGFnfWApXG4gICAgICAgICAgICAgICAgLy8gcmVnaW9uIHBvc3QgY29tcGlsYXRpb25cbiAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBodG1sRmlsZVNwZWNpZmljYXRpb246UGxhaW5PYmplY3Qgb2ZcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sRmlsZVNwZWNpZmljYXRpb24uZmlsZW5hbWUgPT09XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnBsdWdpbi5vcHRpb25zLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FkZXJDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0IG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbEZpbGVTcGVjaWZpY2F0aW9uLnRlbXBsYXRlLnVzZVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvcHRpb25zJykgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbXBpbGVTdGVwcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zLmNvbXBpbGVTdGVwc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPT09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmh0bWwgPSBlanNMb2FkZXIuYmluZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmV4dGVuZE9iamVjdCh0cnVlLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge29wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IGh0bWxGaWxlU3BlY2lmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGVtcGxhdGUucG9zdENvbXBpbGVTdGVwc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0pKShkYXRhLmh0bWwpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH0pfSlcbi8qXG4gICAgTk9URTogVGhlIHVtZCBtb2R1bGUgZXhwb3J0IGRvZXNuJ3QgaGFuZGxlIGNhc2VzIHdoZXJlIHRoZSBwYWNrYWdlIG5hbWVcbiAgICBkb2Vzbid0IG1hdGNoIGV4cG9ydGVkIGxpYnJhcnkgbmFtZS4gVGhpcyBwb3N0IHByb2Nlc3NpbmcgZml4ZXMgdGhpcyBpc3N1ZS5cbiovXG5pZiAoY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwuc3RhcnRzV2l0aCgndW1kJykpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoXG4gICAgICAgIGNvbXBpbGVyOk9iamVjdFxuICAgICk6dm9pZCA9PiBjb21waWxlci5ob29rcy5lbWl0LnRhcEFzeW5jKCdmaXhMaWJyYXJ5TmFtZUV4cG9ydHMnLCAoXG4gICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICApOnZvaWQgPT4ge1xuICAgICAgICBjb25zdCBidW5kbGVOYW1lOnN0cmluZyA9IChcbiAgICAgICAgICAgIHR5cGVvZiBsaWJyYXJ5TmFtZSA9PT0gJ3N0cmluZydcbiAgICAgICAgKSA/IGxpYnJhcnlOYW1lIDogbGlicmFyeU5hbWVbMF1cbiAgICAgICAgZm9yIChjb25zdCBhc3NldFJlcXVlc3Q6c3RyaW5nIGluIGNvbXBpbGF0aW9uLmFzc2V0cylcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHMuaGFzT3duUHJvcGVydHkoYXNzZXRSZXF1ZXN0KSAmJlxuICAgICAgICAgICAgICAgIGFzc2V0UmVxdWVzdC5yZXBsYWNlKC8oW14/XSspXFw/LiokLywgJyQxJykuZW5kc1dpdGgoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMuamF2YVNjcmlwdC5vdXRwdXRFeHRlbnNpb24pXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBsZXQgc291cmNlOnN0cmluZyA9IGNvbXBpbGF0aW9uLmFzc2V0c1thc3NldFJlcXVlc3RdLnNvdXJjZSgpXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudDpzdHJpbmcgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhhc093blByb3BlcnR5KHJlcGxhY2VtZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IHNvdXJjZS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcocmVxdWlyZVxcXFwoKVtcIlxcJ10nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNlc1tyZXBsYWNlbWVudF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICdbXCJcXCddKFxcXFwpKScsICdnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIGAkMScke3JlcGxhY2VtZW50fSckMmApLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoJyhkZWZpbmVcXFxcKFtcIlxcJ10nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidW5kbGVOYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICsgJ1tcIlxcJ10sIFxcXFxbLiopW1wiXFwnXScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hbGlhc2VzW3JlcGxhY2VtZW50XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICdbXCJcXCddKC4qXFxcXF0sIGZhY3RvcnlcXFxcKTspJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCBgJDEnJHtyZXBsYWNlbWVudH0nJDJgKVxuICAgICAgICAgICAgICAgICAgICBzb3VyY2UgPSBzb3VyY2UucmVwbGFjZShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgJyhyb290XFxcXFspW1wiXFwnXScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1bmRsZU5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnW1wiXFwnXShcXFxcXSA9ICknXG4gICAgICAgICAgICAgICAgICAgICksIGAkMSdgICsgVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRWYXJpYWJsZU5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBidW5kbGVOYW1lXG4gICAgICAgICAgICAgICAgICAgICkgKyBgJyQyYClcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW2Fzc2V0UmVxdWVzdF0gPSBuZXcgV2VicGFja1Jhd1NvdXJjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKClcbiAgICB9KX0pXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBhZGQgYXV0b21hdGljIGltYWdlIGNvbXByZXNzaW9uXG4vLyBOT1RFOiBUaGlzIHBsdWdpbiBzaG91bGQgYmUgbG9hZGVkIGF0IGxhc3QgdG8gZW5zdXJlIHRoYXQgYWxsIGVtaXR0ZWQgaW1hZ2VzXG4vLyByYW4gdGhyb3VnaC5cbnBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkltYWdlbWluKFxuICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5jb250ZW50KSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGNvbnRleHQgcmVwbGFjZW1lbnRzXG5mb3IgKFxuICAgIGNvbnN0IGNvbnRleHRSZXBsYWNlbWVudDpBcnJheTxzdHJpbmc+IG9mXG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLmNvbnRleHRcbilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Db250ZXh0UmVwbGFjZW1lbnRQbHVnaW4oXG4gICAgICAgIC4uLmNvbnRleHRSZXBsYWNlbWVudC5tYXAoKHZhbHVlOnN0cmluZyk6YW55ID0+IChuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAnY29uZmlndXJhdGlvbicsICdfX2Rpcm5hbWUnLCAnX19maWxlbmFtZScsIGByZXR1cm4gJHt2YWx1ZX1gXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICApKShjb25maWd1cmF0aW9uLCBfX2Rpcm5hbWUsIF9fZmlsZW5hbWUpKSkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBsb2FkZXIgaGVscGVyXG5jb25zdCBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXM6RnVuY3Rpb24gPSAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IHtcbiAgICBmaWxlUGF0aCA9IEhlbHBlci5zdHJpcExvYWRlcihmaWxlUGF0aClcbiAgICByZXR1cm4gSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICBmaWxlUGF0aCwgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpXG59XG5jb25zdCBsb2FkZXI6T2JqZWN0ID0ge31cbmNvbnN0IHNjb3BlOk9iamVjdCA9IHtcbiAgICBjb25maWd1cmF0aW9uLFxuICAgIGxvYWRlcixcbiAgICBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXNcbn1cbmNvbnN0IGV2YWx1YXRlOkZ1bmN0aW9uID0gKGNvZGU6c3RyaW5nLCBmaWxlUGF0aDpzdHJpbmcpOmFueSA9PiAobmV3IEZ1bmN0aW9uKFxuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICdmaWxlUGF0aCcsIC4uLk9iamVjdC5rZXlzKHNjb3BlKSwgYHJldHVybiAke2NvZGV9YFxuLy8gSWdub3JlVHlwZUNoZWNrXG4pKShmaWxlUGF0aCwgLi4uT2JqZWN0LnZhbHVlcyhzY29wZSkpXG5Ub29scy5leHRlbmRPYmplY3QobG9hZGVyLCB7XG4gICAgLy8gQ29udmVydCB0byBjb21wYXRpYmxlIG5hdGl2ZSB3ZWIgdHlwZXMuXG4gICAgLy8gcmVnaW9uIGdlbmVyaWMgdGVtcGxhdGVcbiAgICBlanM6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgICkuaW5jbHVkZXMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuZXhjbHVkZSA9PT0gbnVsbCkgP1xuICAgICAgICAgICAgICAgIGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICBpbmNsdWRlOiBIZWxwZXIubm9ybWFsaXplUGF0aHMoW1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5iYXNlXG4gICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmxvY2F0aW9ucy5kaXJlY3RvcnlQYXRocykpLFxuICAgICAgICB0ZXN0OiAvXig/IS4rXFwuaHRtbFxcLmVqcyQpLitcXC5lanMkL2ksXG4gICAgICAgIHVzZTogW1xuICAgICAgICAgICAge2xvYWRlcjogJ2ZpbGU/bmFtZT1bcGF0aF1bbmFtZV0nICsgKEJvb2xlYW4oXG4gICAgICAgICAgICAgICAgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMub3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICAgICAgICAgIH0pLmNvbXBpbGVTdGVwcyAlIDJcbiAgICAgICAgICAgICkgPyAnLmpzJyA6ICcnKSArIGA/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVtoYXNoXWB9LFxuICAgICAgICAgICAge2xvYWRlcjogJ2V4dHJhY3QnfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfVxuICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHNjcmlwdFxuICAgIHNjcmlwdDoge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgKSA/IGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuZXhjbHVkZSwgZmlsZVBhdGhcbiAgICAgICAgICAgICksXG4gICAgICAgIGluY2x1ZGU6IEhlbHBlci5ub3JtYWxpemVQYXRocyhbXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmphdmFTY3JpcHRcbiAgICAgICAgXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUubG9jYXRpb25zLmRpcmVjdG9yeVBhdGhzKSksXG4gICAgICAgIHRlc3Q6IC9cXC5qcyg/OlxcPy4qKT8kL2ksXG4gICAgICAgIHVzZTogW3tcbiAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQubG9hZGVyLFxuICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQub3B0aW9ucyB8fCB7fVxuICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuYWRkaXRpb25hbC5tYXAoXG4gICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gaHRtbCB0ZW1wbGF0ZVxuICAgIGh0bWw6IHtcbiAgICAgICAgLy8gTk9URTogVGhpcyBpcyBvbmx5IGZvciB0aGUgbWFpbiBlbnRyeSB0ZW1wbGF0ZS5cbiAgICAgICAgbWFpbjoge1xuICAgICAgICAgICAgdGVzdDogbmV3IFJlZ0V4cCgnXicgKyBUb29scy5zdHJpbmdFc2NhcGVSZWd1bGFyRXhwcmVzc2lvbnMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS5maWxlUGF0aFxuICAgICAgICAgICAgKSArICcoPzpcXFxcPy4qKT8kJyksXG4gICAgICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUudXNlXG4gICAgICAgIH0sXG4gICAgICAgIGVqczoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICAgICAgKS5pbmNsdWRlcyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmV4Y2x1ZGUgPT09IG51bGwpID9cbiAgICAgICAgICAgICAgICAgICAgZmFsc2UgOiBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmV4Y2x1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCkpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC50ZW1wbGF0ZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5odG1sXFwuZWpzKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW1xuICAgICAgICAgICAgICAgIHtsb2FkZXI6ICdmaWxlP25hbWU9JyArIHBhdGguam9pbihwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQudGVtcGxhdGVcbiAgICAgICAgICAgICAgICApLCAnW25hbWVdJyArIChCb29sZWFuKFxuICAgICAgICAgICAgICAgICAgICAoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgICAgICAgICAgfSkuY29tcGlsZVN0ZXBzICUgMlxuICAgICAgICAgICAgICAgICkgPyAnLmpzJyA6ICcnKSArIGA/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVtoYXNoXWApfVxuICAgICAgICAgICAgXS5jb25jYXQoKEJvb2xlYW4oKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLm9wdGlvbnMgfHwge1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLmNvbXBpbGVTdGVwcyAlIDIpID9cbiAgICAgICAgICAgICAgICBbXSA6XG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApLCB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSkuY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgaHRtbDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICAgICAgKS5pbmNsdWRlcyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuZXhjbHVkZSA9PT0gbnVsbCkgP1xuICAgICAgICAgICAgICAgICAgICB0cnVlIDpcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC50ZW1wbGF0ZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5odG1sKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogW1xuICAgICAgICAgICAgICAgIHtsb2FkZXI6ICdmaWxlP25hbWU9JyArIHBhdGguam9pbihwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQudGVtcGxhdGVcbiAgICAgICAgICAgICAgICApLCBgW25hbWVdLltleHRdPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gKX0sXG4gICAgICAgICAgICAgICAge2xvYWRlcjogJ2V4dHJhY3QnfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuYWRkaXRpb25hbC5tYXAoZXZhbHVhdGUpKVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyBMb2FkIGRlcGVuZGVuY2llcy5cbiAgICAvLyByZWdpb24gc3R5bGVcbiAgICBzdHlsZToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICApID8gaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0LmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgaW5jbHVkZTogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICBdLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHMpKSxcbiAgICAgICAgdGVzdDogL1xcLnM/Y3NzKD86XFw/LiopPyQvaSxcbiAgICAgICAgdXNlOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5zdHlsZS5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuc3R5bGUub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgIC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogVG9vbHMuZXh0ZW5kT2JqZWN0KHRydWUsIHtcbiAgICAgICAgICAgICAgICAgICAgaWRlbnQ6ICdwb3N0Y3NzJyxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luczogKCk6QXJyYXk8T2JqZWN0PiA9PiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzSW1wb3J0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGREZXBlbmRlbmN5VG86IHdlYnBhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0NTU25leHQoe2Jyb3dzZXJzOiAnPiAwJSd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogQ2hlY2tpbmcgcGF0aCBkb2Vzbid0IHdvcmsgaWYgZm9udHMgYXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlZCBpbiBsaWJyYXJpZXMgcHJvdmlkZWQgaW4gYW5vdGhlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uIHRoYW4gdGhlIHByb2plY3QgaXRzZWxmIGxpa2UgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJub2RlX21vZHVsZXNcIiBmb2xkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0ZvbnRQYXRoKHtjaGVja1BhdGg6IGZhbHNlfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzVVJMKHt1cmw6ICdyZWJhc2UnfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzU3ByaXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnk6ICgpOlByb21pc2U8bnVsbD4gPT4gbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOlByb21pc2U8bnVsbD4gPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuaW1hZ2UgPyByZXNvbHZlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBob29rczoge29uU2F2ZVNwcml0ZXNoZWV0OiAoaW1hZ2U6T2JqZWN0KTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKGltYWdlLnNwcml0ZVBhdGgsIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmltYWdlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlc2hlZXRQYXRoOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXNjYWRpbmdTdHlsZVNoZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZVBhdGg6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmNzc25hbm8gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NDU1NuYW5vKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuY3NzbmFub1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBbXSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgIC5vcHRpb25zIHx8IHt9KVxuICAgICAgICAgICAgfVxuICAgICAgICBdLmNvbmNhdChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0LmFkZGl0aW9uYWxcbiAgICAgICAgICAgICAgICAubWFwKGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIE9wdGltaXplIGxvYWRlZCBhc3NldHMuXG4gICAgLy8gcmVnaW9uIGZvbnRcbiAgICBmb250OiB7XG4gICAgICAgIGVvdDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5lb3QoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3Qub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHN2Zzoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5zdmcoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHR0Zjoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC50dGYoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHdvZmY6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5leGNsdWRlLCBmaWxlUGF0aFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguYmFzZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC53b2ZmMj8oPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBbe1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5hZGRpdGlvbmFsLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBpbWFnZVxuICAgIGltYWdlOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgKSA/IGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgZXZhbHVhdGUoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5pbWFnZSxcbiAgICAgICAgdGVzdDogL1xcLig/OnBuZ3xqcGd8aWNvfGdpZikoPzpcXD8uKik/JC9pLFxuICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5sb2FkZXIsXG4gICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuZmlsZSB8fCB7fVxuICAgICAgICB9XS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmFkZGl0aW9uYWwubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGRhdGFcbiAgICBkYXRhOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIHBhdGguZXh0bmFtZShIZWxwZXIuc3RyaXBMb2FkZXIoZmlsZVBhdGgpKVxuICAgICAgICAgICAgKSB8fCAoKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuZXhjbHVkZSwgZmlsZVBhdGgpKSxcbiAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5kYXRhLFxuICAgICAgICB0ZXN0OiAvLisvLFxuICAgICAgICB1c2U6IFt7XG4gICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmxvYWRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLm9wdGlvbnMgfHwge31cbiAgICAgICAgfV0uY29uY2F0KGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmFkZGl0aW9uYWwubWFwKGV2YWx1YXRlKSlcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG59KVxuaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KSB7XG4gICAgLypcbiAgICAgICAgTk9URTogV2UgaGF2ZSB0byByZW1vdmUgdGhlIGNsaWVudCBzaWRlIGphdmFzY3JpcHQgaG1yIHN0eWxlIGxvYWRlclxuICAgICAgICBmaXJzdC5cbiAgICAqL1xuICAgIGxvYWRlci5zdHlsZS51c2Uuc2hpZnQoKVxuICAgIGxvYWRlci5zdHlsZS51c2UudW5zaGlmdChwbHVnaW5zLk1pbmlDU1NFeHRyYWN0LmxvYWRlcilcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbmZvciAoY29uc3QgcGx1Z2luQ29uZmlndXJhdGlvbjpQbHVnaW5Db25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24ucGx1Z2lucylcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgKGV2YWwoJ3JlcXVpcmUnKShwbHVnaW5Db25maWd1cmF0aW9uLm5hbWUubW9kdWxlKVtcbiAgICAgICAgcGx1Z2luQ29uZmlndXJhdGlvbi5uYW1lLmluaXRpYWxpemVyXG4gICAgXSkoLi4ucGx1Z2luQ29uZmlndXJhdGlvbi5wYXJhbWV0ZXIpKVxuLy8gcmVnaW9uIGNvbmZpZ3VyYXRpb25cbmV4cG9ydCBjb25zdCB3ZWJwYWNrQ29uZmlndXJhdGlvbjpXZWJwYWNrQ29uZmlndXJhdGlvbiA9IHtcbiAgICBiYWlsOiB0cnVlLFxuICAgIGNhY2hlOiBjb25maWd1cmF0aW9uLmNhY2hlLm1haW4sXG4gICAgY29udGV4dDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgZGV2dG9vbDogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC50b29sLFxuICAgIGRldlNlcnZlcjogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5zZXJ2ZXIsXG4gICAgLy8gcmVnaW9uIGlucHV0XG4gICAgZW50cnk6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWQsXG4gICAgZXh0ZXJuYWxzOiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzLFxuICAgIHJlc29sdmU6IHtcbiAgICAgICAgYWxpYXM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgIGFsaWFzRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICBleHRlbnNpb25zOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbCxcbiAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGUsXG4gICAgICAgIG1vZHVsZXM6IEhlbHBlci5ub3JtYWxpemVQYXRocyhjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyksXG4gICAgICAgIHVuc2FmZUNhY2hlOiBjb25maWd1cmF0aW9uLmNhY2hlLnVuc2FmZVxuICAgIH0sXG4gICAgcmVzb2x2ZUxvYWRlcjoge1xuICAgICAgICBhbGlhczogY29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlcyxcbiAgICAgICAgYWxpYXNGaWVsZHM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMuZmlsZSxcbiAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMubW9kdWxlLFxuICAgICAgICBtb2R1bGVzOiBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIG91dHB1dFxuICAgIG91dHB1dDoge1xuICAgICAgICBmaWxlbmFtZTogcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0KSxcbiAgICAgICAgaGFzaEZ1bmN0aW9uOiBjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG0sXG4gICAgICAgIGxpYnJhcnk6IGxpYnJhcnlOYW1lLFxuICAgICAgICBsaWJyYXJ5VGFyZ2V0OiAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnXG4gICAgICAgICkgPyAndmFyJyA6IGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LnNlbGYsXG4gICAgICAgIHBhdGg6IGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgcHVibGljUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5wdWJsaWMsXG4gICAgICAgIHVtZE5hbWVkRGVmaW5lOiB0cnVlXG4gICAgfSxcbiAgICBwZXJmb3JtYW5jZTogY29uZmlndXJhdGlvbi5wZXJmb3JtYW5jZUhpbnRzLFxuICAgIHRhcmdldDogY29uZmlndXJhdGlvbi50YXJnZXRUZWNobm9sb2d5LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIG1vZGU6IGNvbmZpZ3VyYXRpb24uZGVidWcgPyAnZGV2ZWxvcG1lbnQnIDogJ3Byb2R1Y3Rpb24nLFxuICAgIG1vZHVsZToge1xuICAgICAgICBydWxlczogY29uZmlndXJhdGlvbi5tb2R1bGUuYWRkaXRpb25hbC5tYXAoKFxuICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdFxuICAgICAgICApOlBsYWluT2JqZWN0ID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5leGNsdWRlIHx8ICdmYWxzZScsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgICAgICBpbmNsdWRlOiBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUgJiYgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uaW5jbHVkZSwgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHRcbiAgICAgICAgICAgICAgICApIHx8IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYmFzZSxcbiAgICAgICAgICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLnRlc3QsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0KSksXG4gICAgICAgICAgICAgICAgdXNlOiBldmFsdWF0ZShsb2FkZXJDb25maWd1cmF0aW9uLnVzZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY29uY2F0KFtcbiAgICAgICAgICAgIGxvYWRlci5lanMsXG4gICAgICAgICAgICBsb2FkZXIuc2NyaXB0LFxuICAgICAgICAgICAgbG9hZGVyLmh0bWwubWFpbiwgbG9hZGVyLmh0bWwuZWpzLCBsb2FkZXIuaHRtbC5odG1sLFxuICAgICAgICAgICAgbG9hZGVyLnN0eWxlLFxuICAgICAgICAgICAgbG9hZGVyLmZvbnQuZW90LCBsb2FkZXIuZm9udC5zdmcsIGxvYWRlci5mb250LnR0ZixcbiAgICAgICAgICAgIGxvYWRlci5mb250LndvZmYsXG4gICAgICAgICAgICBsb2FkZXIuaW1hZ2UsXG4gICAgICAgICAgICBsb2FkZXIuZGF0YVxuICAgICAgICBdKVxuICAgIH0sXG4gICAgbm9kZTogY29uZmlndXJhdGlvbi5ub2RlRW52aXJvbm1lbnQsXG4gICAgb3B0aW1pemF0aW9uOiB7XG4gICAgICAgIG1pbmltaXplOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIudWdsaWZ5LFxuICAgICAgICAvLyByZWdpb24gY29tbW9uIGNodW5rc1xuICAgICAgICBzcGxpdENodW5rczogKFxuICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmNodW5rcyB8fFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi50YXJnZXRUZWNobm9sb2d5ICE9PSAnd2ViJyB8fFxuICAgICAgICAgICAgWydidWlsZDpkbGwnLCAndGVzdCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICAgICAgICAgKVxuICAgICAgICApID9cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjYWNoZUdyb3Vwczoge1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdmVuZG9yczogZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IDogVG9vbHMuZXh0ZW5kT2JqZWN0KFxuICAgICAgICAgICAgICAgIHRydWUsIHtcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtzOiAnYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgY2FjaGVHcm91cHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbmRvcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua3M6IChtb2R1bGU6T2JqZWN0KTpib29sZWFuID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0ID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCAhPT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWU6c3RyaW5nIG9mIE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gJyonIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPT09IG1vZHVsZS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiAtMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV1c2VFeGlzdGluZ0NodW5rOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3Q6IC9bXFxcXC9dbm9kZV9tb2R1bGVzW1xcXFwvXS9cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmNodW5rcylcbiAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgfSxcbiAgICBwbHVnaW5zOiBwbHVnaW5JbnN0YW5jZXNcbn1cbmlmIChcbiAgICAhQXJyYXkuaXNBcnJheShjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnMpIHx8XG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUuc2tpcFBhcnNlUmVndWxhckV4cHJlc3Npb25zLmxlbmd0aFxuKVxuICAgIHdlYnBhY2tDb25maWd1cmF0aW9uLm1vZHVsZS5ub1BhcnNlID1cbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuc2tpcFBhcnNlUmVndWxhckV4cHJlc3Npb25zXG5pZiAoY29uZmlndXJhdGlvbi5zaG93Q29uZmlndXJhdGlvbikge1xuICAgIGNvbnNvbGUuaW5mbygnVXNpbmcgaW50ZXJuYWwgY29uZmlndXJhdGlvbjonLCB1dGlsLmluc3BlY3QoY29uZmlndXJhdGlvbiwge1xuICAgICAgICBkZXB0aDogbnVsbH0pKVxuICAgIGNvbnNvbGUuaW5mbygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgIGNvbnNvbGUuaW5mbygnVXNpbmcgd2VicGFjayBjb25maWd1cmF0aW9uOicsIHV0aWwuaW5zcGVjdChcbiAgICAgICAgd2VicGFja0NvbmZpZ3VyYXRpb24sIHtkZXB0aDogbnVsbH0pKVxufVxuLy8gZW5kcmVnaW9uXG5leHBvcnQgZGVmYXVsdCB3ZWJwYWNrQ29uZmlndXJhdGlvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=