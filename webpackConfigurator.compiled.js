#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict';
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.webpackConfiguration = void 0;

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _readOnlyError2 = _interopRequireDefault(require("@babel/runtime/helpers/readOnlyError"));

var _clientnode = _interopRequireDefault(require("clientnode"));

var _jsdom = require("jsdom");

var _fs = require("fs");

var _path2 = _interopRequireDefault(require("path"));

var _util = _interopRequireDefault(require("util"));

var _webpack = _interopRequireDefault(require("webpack"));

var _webpackSources = require("webpack-sources");

var _ejsLoader = _interopRequireDefault(require("./ejsLoader.compiled"));

var _configurator = _interopRequireDefault(require("./configurator.compiled"));

var _helper = _interopRequireDefault(require("./helper.compiled"));

var _htmlLoader = _interopRequireDefault(require("html-loader"));

var _loaderUtils = _interopRequireDefault(require("loader-utils"));

try {
  // IgnoreTypeCheck
  var postcssCSSnano = require('cssnano');
} catch (error) {}
/* eslint-enable no-var */


/* eslint-disable no-var */
try {
  // IgnoreTypeCheck
  var postcssPresetENV = require('postcss-preset-env');
} catch (error) {}

try {
  // IgnoreTypeCheck
  var postcssFontPath = require('postcss-fontpath');
} catch (error) {}

try {
  // IgnoreTypeCheck
  var postcssImport = require('postcss-import');
} catch (error) {}

try {
  // IgnoreTypeCheck
  var postcssSprites = require('postcss-sprites');
} catch (error) {}

try {
  // IgnoreTypeCheck
  var postcssURL = require('postcss-url');
} catch (error) {}
/* eslint-enable no-var */


var pluginNameResourceMapping = {
  BabelMinify: 'babel-minify-webpack-plugin',
  HTML: 'html-webpack-plugin',
  MiniCSSExtract: 'mini-css-extract-plugin',
  AddAssetHTMLPlugin: 'add-asset-html-webpack-plugin',
  OpenBrowser: 'open-browser-webpack-plugin',
  Favicon: 'favicons-webpack-plugin',
  Imagemin: 'imagemin-webpack-plugin',
  Offline: 'offline-plugin'
};
var plugins = {};

for (var name in pluginNameResourceMapping) {
  if (pluginNameResourceMapping.hasOwnProperty(name)) try {
    // IgnoreTypeCheck
    plugins[name] = require(pluginNameResourceMapping[name]);
  } catch (error) {}
}

if (plugins.Imagemin) plugins.Imagemin = plugins.Imagemin["default"];

if ('cache' in require && require.cache && require.resolve('html-loader') in require.cache) {
  require.cache[require.resolve('html-loader')].exports = function () {
    _clientnode["default"].extend(true, this.options, module, this.options);

    for (var _len = arguments.length, parameter = new Array(_len), _key = 0; _key < _len; _key++) {
      parameter[_key] = arguments[_key];
    }

    return _htmlLoader["default"].call.apply(_htmlLoader["default"], [this].concat(parameter));
  };
} // Monkey-Patch loader-utils to define which url is a local request.


var loaderUtilsIsUrlRequestBackup = _loaderUtils["default"].isUrlRequest;
if ('cache' in require && require.cache && require.resolve('loader-utils') in require.cache) require.cache[require.resolve('loader-utils')].exports.isUrlRequest = function (url) {
  if (url.match(/^[a-z]+:.+/)) return false;

  for (var _len2 = arguments.length, additionalParameter = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    additionalParameter[_key2 - 1] = arguments[_key2];
  }

  return loaderUtilsIsUrlRequestBackup.apply(_loaderUtils["default"], [url].concat(additionalParameter));
}; // / endregion
// endregion
// region initialisation
// / region determine library name

var libraryName;
if ('libraryName' in _configurator["default"] && _configurator["default"].libraryName) libraryName = _configurator["default"].libraryName;else if (Object.keys(_configurator["default"].injection.entry.normalized).length > 1) libraryName = '[name]';else {
  libraryName = _configurator["default"].name;
  if (['assign', 'global', 'this', 'var', 'window'].includes(_configurator["default"].exportFormat.self)) libraryName = _clientnode["default"].stringConvertToValidVariableName(libraryName);
} // / endregion
// / region plugins

var pluginInstances = [new _webpack["default"].optimize.OccurrenceOrderPlugin(true)]; // // region define modules to ignore

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = _configurator["default"].injection.ignorePattern[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var ignorePattern = _step.value;
    pluginInstances.push(new _webpack["default"].IgnorePlugin(new RegExp(ignorePattern)));
  } // // endregion
  // // region define modules to replace

} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator["return"] != null) {
      _iterator["return"]();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

var _loop = function _loop(source) {
  if (_configurator["default"].module.replacements.normal.hasOwnProperty(source)) {
    var search = new RegExp(source);
    pluginInstances.push(new _webpack["default"].NormalModuleReplacementPlugin(search, function (resource) {
      resource.request = resource.request.replace(search, _configurator["default"].module.replacements.normal[source]);
    }));
  }
};

for (var source in _configurator["default"].module.replacements.normal) {
  _loop(source);
} // // endregion
// // region generate html file


var htmlAvailable = false;

if (_configurator["default"].givenCommandLineArguments[2] !== 'build:dll') {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = _configurator["default"].files.html[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var htmlConfiguration = _step2.value;

      if (_clientnode["default"].isFileSync(htmlConfiguration.template.filePath)) {
        pluginInstances.push(new plugins.HTML(_clientnode["default"].extend({}, htmlConfiguration, {
          template: htmlConfiguration.template.request
        })));
        htmlAvailable = true;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }
} // // endregion
// // region generate favicons


if (htmlAvailable && _configurator["default"].favicon && plugins.Favicon && _clientnode["default"].isFileSync(_configurator["default"].favicon.logo)) pluginInstances.push(new plugins.Favicon(_configurator["default"].favicon)); // // endregion
// // region provide offline functionality

if (htmlAvailable && _configurator["default"].offline && plugins.Offline) {
  if (!['serve', 'test:browser'].includes(_configurator["default"].givenCommandLineArguments[2])) {
    for (var _i = 0, _arr = [['cascadingStyleSheet', 'css'], ['javaScript', 'js']]; _i < _arr.length; _i++) {
      var type = _arr[_i];

      if (_configurator["default"].inPlace[type[0]]) {
        var matches = Object.keys(_configurator["default"].inPlace[type[0]]);

        for (var _i2 = 0, _matches = matches; _i2 < _matches.length; _i2++) {
          var _name = _matches[_i2];

          _configurator["default"].offline.excludes.push(_path2["default"].relative(_configurator["default"].path.target.base, _configurator["default"].path.target.asset[type[0]]) + "".concat(_name, ".").concat(type[1], "?").concat(_configurator["default"].hashAlgorithm, "=*"));
        }
      }
    }
  }

  pluginInstances.push(new plugins.Offline(_configurator["default"].offline));
} // // endregion
// // region opens browser automatically


if (_configurator["default"].development.openBrowser && htmlAvailable && ['serve', 'test:browser'].includes(_configurator["default"].givenCommandLineArguments[2])) pluginInstances.push(new plugins.OpenBrowser(_configurator["default"].development.openBrowser)); // // endregion
// // region provide build environment

if (_configurator["default"].buildContext.definitions) pluginInstances.push(new _webpack["default"].DefinePlugin(_configurator["default"].buildContext.definitions));
if (_configurator["default"].module.provide) pluginInstances.push(new _webpack["default"].ProvidePlugin(_configurator["default"].module.provide)); // // endregion
// // region modules/assets
// /// region perform javaScript minification/optimisation

if (_configurator["default"].module.optimizer.babelMinify && _configurator["default"].module.optimizer.babelMinify.bundle) pluginInstances.push(Object.keys(_configurator["default"].module.optimizer.babelMinify.bundle).length ? new plugins.BabelMinify(_configurator["default"].module.optimizer.babelMinify.bundle.transform || {}, _configurator["default"].module.optimizer.babelMinify.bundle.plugin || {}) : new plugins.BabelMinify()); // /// endregion
// /// region apply module pattern

pluginInstances.push({
  apply: function apply(compiler) {
    compiler.hooks.emit.tap('applyModulePattern', function (compilation) {
      for (var request in compilation.assets) {
        if (compilation.assets.hasOwnProperty(request)) {
          var filePath = request.replace(/\?[^?]+$/, '');

          var _type = _helper["default"].determineAssetType(filePath, _configurator["default"].buildContext.types, _configurator["default"].path);

          if (_type && _configurator["default"].assetPattern[_type] && !new RegExp(_configurator["default"].assetPattern[_type].excludeFilePathRegularExpression).test(filePath)) {
            var source = compilation.assets[request].source();
            if (typeof source === 'string') compilation.assets[request] = new _webpackSources.RawSource(_configurator["default"].assetPattern[_type].pattern.replace(/\{1\}/g, source.replace(/\$/g, '$$$')));
          }
        }
      }
    });
  }
}); // /// endregion
// /// region in-place configured assets in the main html file

if (htmlAvailable && !['serve', 'test:browser'].includes(_configurator["default"].givenCommandLineArguments[2])) pluginInstances.push({
  apply: function apply(compiler) {
    var filePathsToRemove = [];
    compiler.hooks.compilation.tap('inPlaceHTMLAssets', function (compilation) {
      return compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync('inPlaceHTMLAssets', function (data, callback) {
        if (_configurator["default"].inPlace.cascadingStyleSheet && Object.keys(_configurator["default"].inPlace.cascadingStyleSheet).length || _configurator["default"].inPlace.javaScript && Object.keys(_configurator["default"].inPlace.javaScript).length) try {
          var result = _helper["default"].inPlaceCSSAndJavaScriptAssetReferences(data.html, _configurator["default"].inPlace.cascadingStyleSheet, _configurator["default"].inPlace.javaScript, _configurator["default"].path.target.base, _configurator["default"].files.compose.cascadingStyleSheet, _configurator["default"].files.compose.javaScript, compilation.assets);

          data.html = result.content;
          filePathsToRemove.concat(result.filePathsToRemove);
        } catch (error) {
          return callback(error, data);
        }
        callback(null, data);
      });
    });
    compiler.hooks.afterEmit.tapAsync('removeInPlaceHTMLAssetFiles',
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2["default"])(
      /*#__PURE__*/
      _regenerator["default"].mark(function _callee2(data, callback) {
        var promises, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _path, _loop2, _i3, _arr2;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                promises = [];
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context2.prev = 4;
                _iterator3 = filePathsToRemove[Symbol.iterator]();

              case 6:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context2.next = 15;
                  break;
                }

                _path = _step3.value;
                _context2.next = 10;
                return _clientnode["default"].isFile(_path);

              case 10:
                if (!_context2.sent) {
                  _context2.next = 12;
                  break;
                }

                promises.push(_fs.promises.unlink(_path)["catch"](console.error));

              case 12:
                _iteratorNormalCompletion3 = true;
                _context2.next = 6;
                break;

              case 15:
                _context2.next = 21;
                break;

              case 17:
                _context2.prev = 17;
                _context2.t0 = _context2["catch"](4);
                _didIteratorError3 = true;
                _iteratorError3 = _context2.t0;

              case 21:
                _context2.prev = 21;
                _context2.prev = 22;

                if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                  _iterator3["return"]();
                }

              case 24:
                _context2.prev = 24;

                if (!_didIteratorError3) {
                  _context2.next = 27;
                  break;
                }

                throw _iteratorError3;

              case 27:
                return _context2.finish(24);

              case 28:
                return _context2.finish(21);

              case 29:
                _context2.next = 31;
                return Promise.all(promises);

              case 31:
                promises = [];

                _loop2 = function _loop2() {
                  var type = _arr2[_i3];
                  promises.push(_fs.promises.readdir(_configurator["default"].path.target.asset[type], {
                    encoding: _configurator["default"].encoding
                  }).then(
                  /*#__PURE__*/
                  function () {
                    var _ref2 = (0, _asyncToGenerator2["default"])(
                    /*#__PURE__*/
                    _regenerator["default"].mark(function _callee(files) {
                      return _regenerator["default"].wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              if (!(files.length === 0)) {
                                _context.next = 3;
                                break;
                              }

                              _context.next = 3;
                              return _fs.promises.rmdir(_configurator["default"].path.target.asset[type]);

                            case 3:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee);
                    }));

                    return function (_x3) {
                      return _ref2.apply(this, arguments);
                    };
                  }()));
                };

                for (_i3 = 0, _arr2 = ['javaScript', 'cascadingStyleSheet']; _i3 < _arr2.length; _i3++) {
                  _loop2();
                }

                _context2.next = 36;
                return Promise.all(promises);

              case 36:
                callback();

              case 37:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[4, 17, 21, 29], [22,, 24, 28]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  }
}); // /// endregion
// /// region remove chunks if a corresponding dll package exists

if (_configurator["default"].givenCommandLineArguments[2] !== 'build:dll') for (var chunkName in _configurator["default"].injection.entry.normalized) {
  if (_configurator["default"].injection.entry.normalized.hasOwnProperty(chunkName)) {
    var manifestFilePath = "".concat(_configurator["default"].path.target.base, "/").concat(chunkName, ".") + "dll-manifest.json";

    if (_configurator["default"].dllManifestFilePaths.includes(manifestFilePath)) {
      delete _configurator["default"].injection.entry.normalized[chunkName];

      var filePath = _helper["default"].renderFilePathTemplate(_helper["default"].stripLoader(_configurator["default"].files.compose.javaScript), {
        '[name]': chunkName
      });

      pluginInstances.push(new plugins.AddAssetHTMLPlugin({
        filepath: filePath,
        hash: true,
        includeSourcemap: _clientnode["default"].isFileSync("".concat(filePath, ".map"))
      }));
      pluginInstances.push(new _webpack["default"].DllReferencePlugin({
        context: _configurator["default"].path.context,
        manifest: require(manifestFilePath)
      }));
    }
  }
} // /// endregion
// /// region mark empty javaScript modules as dummy

if (!_configurator["default"].needed.javaScript) _configurator["default"].files.compose.javaScript = _path2["default"].resolve(_configurator["default"].path.target.asset.javaScript, '.__dummy__.compiled.js'); // /// endregion
// /// region extract cascading style sheets

if (_configurator["default"].files.compose.cascadingStyleSheet && plugins.MiniCSSExtract) pluginInstances.push(new plugins.MiniCSSExtract({
  chunks: '[name].css',
  filename: _path2["default"].relative(_configurator["default"].path.target.base, _configurator["default"].files.compose.cascadingStyleSheet)
})); // /// endregion
// /// region performs implicit external logic

if (_configurator["default"].injection.external.modules === '__implicit__')
  /*
      We only want to process modules from local context in library mode,
      since a concrete project using this library should combine all assets
      (and de-duplicate them) for optimal bundling results. NOTE: Only native
      javaScript and json modules will be marked as external dependency.
  */
  _configurator["default"].injection.external.modules =
  /*#__PURE__*/
  function () {
    var _ref3 = (0, _asyncToGenerator2["default"])(
    /*#__PURE__*/
    _regenerator["default"].mark(function _callee3(context, request, callback) {
      var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _filePath, filePath, pattern, regularExpression, match, targetConfiguration, replacementRegularExpression, target, aliasedRequest, resolvedRequest, keys, result, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _key3, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _key4, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _key5, exportFormat;

      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              request = request.replace(/^!+/, '');
              if (request.startsWith('/')) request = _path2["default"].relative(_configurator["default"].path.context, request);
              _iteratorNormalCompletion4 = true;
              _didIteratorError4 = false;
              _iteratorError4 = undefined;
              _context3.prev = 5;
              _iterator4 = _configurator["default"].module.directoryNames[Symbol.iterator]();

            case 7:
              if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                _context3.next = 16;
                break;
              }

              _filePath = _step4.value;

              if (!request.startsWith(_filePath)) {
                _context3.next = 13;
                break;
              }

              request = request.substring(_filePath.length);
              if (request.startsWith('/')) request = request.substring(1);
              return _context3.abrupt("break", 16);

            case 13:
              _iteratorNormalCompletion4 = true;
              _context3.next = 7;
              break;

            case 16:
              _context3.next = 22;
              break;

            case 18:
              _context3.prev = 18;
              _context3.t0 = _context3["catch"](5);
              _didIteratorError4 = true;
              _iteratorError4 = _context3.t0;

            case 22:
              _context3.prev = 22;
              _context3.prev = 23;

              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }

            case 25:
              _context3.prev = 25;

              if (!_didIteratorError4) {
                _context3.next = 28;
                break;
              }

              throw _iteratorError4;

            case 28:
              return _context3.finish(25);

            case 29:
              return _context3.finish(22);

            case 30:
              // region pattern based aliasing
              filePath = _helper["default"].determineModuleFilePath(request, {}, {}, {
                file: _configurator["default"].extensions.file.external,
                module: _configurator["default"].extensions.module
              }, _configurator["default"].path.context, context, _configurator["default"].path.ignore, _configurator["default"].module.directoryNames, _configurator["default"]["package"].main.fileNames, _configurator["default"]["package"].main.propertyNames, _configurator["default"]["package"].aliasPropertyNames, _configurator["default"].encoding);

              if (!filePath) {
                _context3.next = 48;
                break;
              }

              _context3.t1 = _regenerator["default"].keys(_configurator["default"].injection.external.aliases);

            case 33:
              if ((_context3.t2 = _context3.t1()).done) {
                _context3.next = 48;
                break;
              }

              pattern = _context3.t2.value;

              if (!(_configurator["default"].injection.external.aliases.hasOwnProperty(pattern) && pattern.startsWith('^'))) {
                _context3.next = 46;
                break;
              }

              regularExpression = new RegExp(pattern);

              if (!regularExpression.test(filePath)) {
                _context3.next = 46;
                break;
              }

              match = false;
              targetConfiguration = _configurator["default"].injection.external.aliases[pattern];
              replacementRegularExpression = new RegExp(Object.keys(targetConfiguration)[0]);
              target = targetConfiguration[Object.keys(targetConfiguration)[0]];

              if (target.startsWith('?')) {
                target = target.substring(1);
                aliasedRequest = request.replace(replacementRegularExpression, target);
                if (aliasedRequest !== request) match = Boolean(_helper["default"].determineModuleFilePath(aliasedRequest, {}, {}, {
                  file: _configurator["default"].extensions.file.external,
                  module: _configurator["default"].extensions.module
                }, _configurator["default"].path.context, context, _configurator["default"].path.ignore, _configurator["default"].module.directoryNames, _configurator["default"]["package"].main.fileNames, _configurator["default"]["package"].main.propertyNames, _configurator["default"]["package"].aliasPropertyNames, _configurator["default"].encoding));
              } else match = true;

              if (!match) {
                _context3.next = 46;
                break;
              }

              request = request.replace(replacementRegularExpression, target);
              return _context3.abrupt("break", 48);

            case 46:
              _context3.next = 33;
              break;

            case 48:
              // endregion
              resolvedRequest = _helper["default"].determineExternalRequest(request, _configurator["default"].path.context, context, _configurator["default"].injection.entry.normalized, _configurator["default"].module.directoryNames, _configurator["default"].module.aliases, _configurator["default"].module.replacements.normal, _configurator["default"].extensions, _configurator["default"].path.source.asset.base, _configurator["default"].path.ignore, _configurator["default"].module.directoryNames, _configurator["default"]["package"].main.fileNames, _configurator["default"]["package"].main.propertyNames, _configurator["default"]["package"].aliasPropertyNames, _configurator["default"].injection.external.implicit.pattern.include, _configurator["default"].injection.external.implicit.pattern.exclude, _configurator["default"].inPlace.externalLibrary.normal, _configurator["default"].inPlace.externalLibrary.dynamic, _configurator["default"].encoding);

              if (!resolvedRequest) {
                _context3.next = 122;
                break;
              }

              keys = ['amd', 'commonjs', 'commonjs2', 'root'];
              result = resolvedRequest;

              if (!_configurator["default"].injection.external.aliases.hasOwnProperty(request)) {
                _context3.next = 119;
                break;
              }

              // region normal alias replacement
              result = {
                "default": request
              };

              if (!(typeof _configurator["default"].injection.external.aliases[request] === 'string')) {
                _context3.next = 76;
                break;
              }

              _iteratorNormalCompletion5 = true;
              _didIteratorError5 = false;
              _iteratorError5 = undefined;
              _context3.prev = 58;

              for (_iterator5 = keys[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                _key3 = _step5.value;
                result[_key3] = _configurator["default"].injection.external.aliases[request];
              }

              _context3.next = 66;
              break;

            case 62:
              _context3.prev = 62;
              _context3.t3 = _context3["catch"](58);
              _didIteratorError5 = true;
              _iteratorError5 = _context3.t3;

            case 66:
              _context3.prev = 66;
              _context3.prev = 67;

              if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                _iterator5["return"]();
              }

            case 69:
              _context3.prev = 69;

              if (!_didIteratorError5) {
                _context3.next = 72;
                break;
              }

              throw _iteratorError5;

            case 72:
              return _context3.finish(69);

            case 73:
              return _context3.finish(66);

            case 74:
              _context3.next = 99;
              break;

            case 76:
              if (!(typeof _configurator["default"].injection.external.aliases[request] === 'function')) {
                _context3.next = 98;
                break;
              }

              _iteratorNormalCompletion6 = true;
              _didIteratorError6 = false;
              _iteratorError6 = undefined;
              _context3.prev = 80;

              for (_iterator6 = keys[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                _key4 = _step6.value;
                result[_key4] = _configurator["default"].injection.external.aliases[request](request, _key4);
              }

              _context3.next = 88;
              break;

            case 84:
              _context3.prev = 84;
              _context3.t4 = _context3["catch"](80);
              _didIteratorError6 = true;
              _iteratorError6 = _context3.t4;

            case 88:
              _context3.prev = 88;
              _context3.prev = 89;

              if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                _iterator6["return"]();
              }

            case 91:
              _context3.prev = 91;

              if (!_didIteratorError6) {
                _context3.next = 94;
                break;
              }

              throw _iteratorError6;

            case 94:
              return _context3.finish(91);

            case 95:
              return _context3.finish(88);

            case 96:
              _context3.next = 99;
              break;

            case 98:
              if (_configurator["default"].injection.external.aliases[request] !== null && (0, _typeof2["default"])(_configurator["default"].injection.external.aliases[request]) === 'object') _clientnode["default"].extend(result, _configurator["default"].injection.external.aliases[request]);

            case 99:
              if (!result.hasOwnProperty('default')) {
                _context3.next = 119;
                break;
              }

              _iteratorNormalCompletion7 = true;
              _didIteratorError7 = false;
              _iteratorError7 = undefined;
              _context3.prev = 103;

              for (_iterator7 = keys[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                _key5 = _step7.value;
                if (!result.hasOwnProperty(_key5)) result[_key5] = result["default"];
              }

              _context3.next = 111;
              break;

            case 107:
              _context3.prev = 107;
              _context3.t5 = _context3["catch"](103);
              _didIteratorError7 = true;
              _iteratorError7 = _context3.t5;

            case 111:
              _context3.prev = 111;
              _context3.prev = 112;

              if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
                _iterator7["return"]();
              }

            case 114:
              _context3.prev = 114;

              if (!_didIteratorError7) {
                _context3.next = 117;
                break;
              }

              throw _iteratorError7;

            case 117:
              return _context3.finish(114);

            case 118:
              return _context3.finish(111);

            case 119:
              if (result.hasOwnProperty('root')) // IgnoreTypeCheck
                result.root = [].concat(result.root).map(function (name) {
                  return _clientnode["default"].stringConvertToValidVariableName(name);
                });
              exportFormat = _configurator["default"].exportFormat.external || _configurator["default"].exportFormat.self;
              return _context3.abrupt("return", callback(null, exportFormat === 'umd' || typeof result === 'string' ? result : result[exportFormat], exportFormat));

            case 122:
              return _context3.abrupt("return", callback());

            case 123:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[5, 18, 22, 30], [23,, 25, 29], [58, 62, 66, 74], [67,, 69, 73], [80, 84, 88, 96], [89,, 91, 95], [103, 107, 111, 119], [112,, 114, 118]]);
    }));

    return function (_x4, _x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }(); // /// endregion
// /// region build dll packages

if (_configurator["default"].givenCommandLineArguments[2] === 'build:dll') {
  var dllChunkExists = false;

  for (var _chunkName in _configurator["default"].injection.entry.normalized) {
    if (_configurator["default"].injection.entry.normalized.hasOwnProperty(_chunkName)) if (_configurator["default"].injection.dllChunkNames.includes(_chunkName)) dllChunkExists = true;else delete _configurator["default"].injection.entry.normalized[_chunkName];
  }

  if (dllChunkExists) {
    libraryName = '[name]DLLPackage';
    pluginInstances.push(new _webpack["default"].DllPlugin({
      path: "".concat(_configurator["default"].path.target.base, "/[name].dll-manifest.json"),
      name: libraryName
    }));
  } else console.warn('No dll chunk id found.');
} // /// endregion
// // endregion
// // region apply final dom/javaScript/cascadingStyleSheet modifications/fixes


if (htmlAvailable) pluginInstances.push({
  apply: function apply(compiler) {
    return compiler.hooks.compilation.tap('compilation', function (compilation) {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('removeDummyHTMLTags', function (data, callback) {
        for (var _i4 = 0, _arr3 = [data.body, data.head]; _i4 < _arr3.length; _i4++) {
          var tags = _arr3[_i4];
          var _index = 0;
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = tags[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var tag = _step9.value;
              if (/^\.__dummy__(\..*)?$/.test(_path2["default"].basename(tag.attributes.src || tag.attributes.href || ''))) tags.splice(_index, 1);
              _index += 1;
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                _iterator9["return"]();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }
        }

        var assets = JSON.parse(data.plugin.assetJson);
        var index = 0;
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = assets[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var assetRequest = _step8.value;
            if (/^\.__dummy__(\..*)?$/.test(_path2["default"].basename(assetRequest))) assets.splice(index, 1);
            index += 1;
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
              _iterator8["return"]();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        data.plugin.assetJson = JSON.stringify(assets);
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
          return "".concat(startTag).concat(endTag);
        });
        var dom;

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

        var linkables = {
          link: 'href',
          script: 'src'
        };

        for (var tagName in linkables) {
          if (linkables.hasOwnProperty(tagName)) {
            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
              for (var _iterator10 = dom.window.document.querySelectorAll("".concat(tagName, "[").concat(linkables[tagName], "*=\"?") + "".concat(_configurator["default"].hashAlgorithm, "=\"]"))[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                var domNode = _step10.value;

                /*
                    NOTE: Removing symbols after a "&" in hash
                    string is necessary to match the generated
                    request strings in offline plugin.
                */
                domNode.setAttribute(linkables[tagName], domNode.getAttribute(linkables[tagName]).replace(new RegExp("(\\?".concat(_configurator["default"].hashAlgorithm, "=") + '[^&]+).*$'), '$1'));
              }
            } catch (err) {
              _didIteratorError10 = true;
              _iteratorError10 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
                  _iterator10["return"]();
                }
              } finally {
                if (_didIteratorError10) {
                  throw _iteratorError10;
                }
              }
            }
          }
        }
        /*
            NOTE: We have to restore template delimiter and style
            contents.
        */


        data.html = dom.serialize().replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>').replace(/(<style[^>]*>)[\s\S]*?(<\/style[^>]*>)/gi, function (match, startTag, endTag) {
          return "".concat(startTag).concat(styleContents.shift()).concat(endTag);
        }); // region post compilation

        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = _configurator["default"].files.html[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var htmlFileSpecification = _step11.value;

            if (htmlFileSpecification.filename === data.plugin.options.filename) {
              var _iteratorNormalCompletion12 = true;
              var _didIteratorError12 = false;
              var _iteratorError12 = undefined;

              try {
                for (var _iterator12 = htmlFileSpecification.template.use[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                  var loaderConfiguration = _step12.value;
                  if (loaderConfiguration.hasOwnProperty('options') && loaderConfiguration.options.hasOwnProperty('compileSteps') && typeof loaderConfiguration.options.compileSteps === 'number') data.html = _ejsLoader["default"].bind(_clientnode["default"].extend(true, {}, {
                    options: loaderConfiguration.options || {}
                  }, {
                    options: {
                      compileSteps: htmlFileSpecification.template.postCompileSteps
                    }
                  }))(data.html);
                }
              } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
                    _iterator12["return"]();
                  }
                } finally {
                  if (_didIteratorError12) {
                    throw _iteratorError12;
                  }
                }
              }

              break;
            }
          } // endregion

        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
              _iterator11["return"]();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }

        callback(null, data);
      });
    });
  }
}); // // endregion
// // region add automatic image compression
// NOTE: This plugin should be loaded at last to ensure that all emitted images
// ran through.

if (plugins.Imagemin) pluginInstances.push(new plugins.Imagemin(_configurator["default"].module.optimizer.image.content)); // // endregion
// // region context replacements

var _iteratorNormalCompletion13 = true;
var _didIteratorError13 = false;
var _iteratorError13 = undefined;

try {
  for (var _iterator13 = _configurator["default"].module.replacements.context[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
    var contextReplacement = _step13.value;
    pluginInstances.push((0, _construct2["default"])(_webpack["default"].ContextReplacementPlugin, (0, _toConsumableArray2["default"])(contextReplacement.map(function (value) {
      return new Function('configuration', '__dirname', '__filename', "return ".concat(value) // IgnoreTypeCheck
      )(_configurator["default"], __dirname, __filename);
    }))));
  } // // endregion
  // // region consolidate duplicated module requests

} catch (err) {
  _didIteratorError13 = true;
  _iteratorError13 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
      _iterator13["return"]();
    }
  } finally {
    if (_didIteratorError13) {
      throw _iteratorError13;
    }
  }
}

pluginInstances.push(new _webpack["default"].NormalModuleReplacementPlugin(/((?:^|\/)node_modules\/.+){2}/, function (resource) {
  var targetName = resource.request ? 'request' : 'resource';
  var targetPath = resource[targetName];

  if (_clientnode["default"].isFileSync(targetPath)) {
    var packageDescriptor = _helper["default"].getClosestPackageDescriptor(targetPath);

    if (packageDescriptor) {
      // IgnoreTypeCheck
      var pathPrefixes = targetPath.match(/((?:^|.*?\/)node_modules\/)/g); // Avoid finding the same artefact.

      pathPrefixes.pop();
      var index = 0;
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = pathPrefixes[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var pathPrefix = _step14.value;
          if (index > 0) pathPrefixes[index] = _path2["default"].resolve(pathPrefixes[index - 1], pathPrefix);
          index += 1;
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14["return"] != null) {
            _iterator14["return"]();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }

      var pathSuffix = targetPath.replace(/(?:^|.*\/)node_modules\/(.+$)/, '$1');
      var redundantRequest = null;
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = pathPrefixes[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var _pathPrefix = _step15.value;

          var alternateTargetPath = _path2["default"].resolve(_pathPrefix, pathSuffix);

          if (_clientnode["default"].isFileSync(alternateTargetPath)) {
            var alternatePackageDescriptor = _helper["default"].getClosestPackageDescriptor(alternateTargetPath);

            if (packageDescriptor.configuration.version === alternatePackageDescriptor.configuration.version) {
              console.info("Consolidate module request \"".concat(targetPath, "\" ") + "to \"".concat(alternateTargetPath, "\"."));
              resource[targetName] = alternateTargetPath;
              return;
            } else redundantRequest = {
              path: alternateTargetPath,
              version: alternatePackageDescriptor.configuration.version
            };
          }
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15["return"] != null) {
            _iterator15["return"]();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }

      if (redundantRequest) console.warn('Including different versions of same package "' + "".concat(packageDescriptor.configuration.name, "\". Module \"") + "".concat(targetPath, "\" (version ") + "".concat(packageDescriptor.configuration.version, ") has ") + "redundancies with \"".concat(redundantRequest.path, "\" (") + "version ".concat(redundantRequest.version, ")."));
    }
  }
})); // // endregion
// / endregion
// / region loader helper

var isFilePathInDependencies = function isFilePathInDependencies(filePath) {
  filePath = _helper["default"].stripLoader(filePath);
  return _helper["default"].isFilePathInLocation(filePath, _configurator["default"].path.ignore.concat(_configurator["default"].module.directoryNames, _configurator["default"].loader.directoryNames).map(function (filePath) {
    return _path2["default"].resolve(_configurator["default"].path.context, filePath);
  }).filter(function (filePath) {
    return !_configurator["default"].path.context.startsWith(filePath);
  }));
};

var generateLoader = function generateLoader(loaderConfiguration) {
  return {
    exclude: function exclude(filePath) {
      return evaluate(loaderConfiguration.exclude || 'false', filePath);
    },
    include: loaderConfiguration.include && evaluate(loaderConfiguration.include, _configurator["default"].path.context) || _configurator["default"].path.source.base,
    test: new RegExp(evaluate(loaderConfiguration.test, _configurator["default"].path.context)),
    use: evaluate(loaderConfiguration.use)
  };
};

var loader = {};
var scope = {
  configuration: _configurator["default"],
  isFilePathInDependencies: isFilePathInDependencies,
  loader: loader,
  require: eval('require')
};

var evaluate = function evaluate(code, filePath) {
  return (0, _construct2["default"])(Function, [// IgnoreTypeCheck
  'filePath'].concat((0, _toConsumableArray2["default"])(Object.keys(scope)), ["return ".concat(code) // IgnoreTypeCheck
  ])).apply(void 0, [filePath].concat((0, _toConsumableArray2["default"])(Object.values(scope))));
};

var includingPaths = _helper["default"].normalizePaths([_configurator["default"].path.source.asset.javaScript].concat(_configurator["default"].module.locations.directoryPaths));

_clientnode["default"].extend(loader, {
  // Convert to compatible native web types.
  // region generic template
  ejs: {
    exclude: function exclude(filePath) {
      return _helper["default"].normalizePaths(_configurator["default"].files.html.concat(_configurator["default"].files.defaultHTML).map(function (htmlConfiguration) {
        return htmlConfiguration.template.filePath;
      })).includes(filePath) || (_configurator["default"].module.preprocessor.ejs.exclude === null ? false : evaluate(_configurator["default"].module.preprocessor.ejs.exclude, filePath));
    },
    include: includingPaths,
    test: /^(?!.+\.html\.ejs$).+\.ejs$/i,
    use: _configurator["default"].module.preprocessor.ejs.additional.pre.map(evaluate).concat({
      loader: 'file?name=[path][name]' + (Boolean((_configurator["default"].module.preprocessor.ejs.options || {
        compileSteps: 2
      }).compileSteps % 2) ? '.js' : '') + "?".concat(_configurator["default"].hashAlgorithm, "=[hash]")
    }, {
      loader: 'extract'
    }, {
      loader: _configurator["default"].module.preprocessor.ejs.loader,
      options: _configurator["default"].module.preprocessor.ejs.options || {}
    }, _configurator["default"].module.preprocessor.ejs.additional.post.map(evaluate))
  },
  // endregion
  // region script
  script: {
    exclude: function exclude(filePath) {
      return evaluate(_configurator["default"].module.preprocessor.javaScript.exclude, filePath);
    },
    include: function include(filePath) {
      var result = evaluate(_configurator["default"].module.preprocessor.javaScript.include, filePath);

      if ([null, undefined].includes(result)) {
        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
          for (var _iterator16 = includingPaths[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var includePath = _step16.value;
            if (filePath.startsWith(includePath)) return true;
          }
        } catch (err) {
          _didIteratorError16 = true;
          _iteratorError16 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion16 && _iterator16["return"] != null) {
              _iterator16["return"]();
            }
          } finally {
            if (_didIteratorError16) {
              throw _iteratorError16;
            }
          }
        }

        return false;
      }

      return Boolean(result);
    },
    test: new RegExp(_configurator["default"].module.preprocessor.javaScript.regularExpression, 'i'),
    use: _configurator["default"].module.preprocessor.javaScript.additional.pre.map(evaluate).concat({
      loader: _configurator["default"].module.preprocessor.javaScript.loader,
      options: _configurator["default"].module.preprocessor.javaScript.options || {}
    }, _configurator["default"].module.preprocessor.javaScript.additional.post.map(evaluate))
  },
  // endregion
  // region html template
  html: {
    // NOTE: This is only for the main entry template.
    main: {
      test: new RegExp('^' + _clientnode["default"].stringEscapeRegularExpressions(_configurator["default"].files.defaultHTML.template.filePath) + '(?:\\?.*)?$'),
      use: _configurator["default"].files.defaultHTML.template.use
    },
    ejs: {
      exclude: function exclude(filePath) {
        return _helper["default"].normalizePaths(_configurator["default"].files.html.concat(_configurator["default"].files.defaultHTML).map(function (htmlConfiguration) {
          return htmlConfiguration.template.filePath;
        })).includes(filePath) || (_configurator["default"].module.preprocessor.html.exclude === null ? false : evaluate(_configurator["default"].module.preprocessor.html.exclude, filePath));
      },
      include: _configurator["default"].path.source.asset.template,
      test: /\.html\.ejs(?:\?.*)?$/i,
      use: _configurator["default"].module.preprocessor.html.additional.pre.map(evaluate).concat({
        loader: 'file?name=' + _path2["default"].join(_path2["default"].relative(_configurator["default"].path.target.asset.base, _configurator["default"].path.target.asset.template), '[name]' + (Boolean((_configurator["default"].module.preprocessor.html.options || {
          compileSteps: 2
        }).compileSteps % 2) ? '.js' : '') + "?".concat(_configurator["default"].hashAlgorithm, "=[hash]"))
      }, Boolean((_configurator["default"].module.preprocessor.html.options || {
        compileSteps: 2
      }).compileSteps % 2) ? [] : [{
        loader: 'extract'
      }, {
        loader: _configurator["default"].module.html.loader,
        options: _configurator["default"].module.html.options || {}
      }], {
        loader: _configurator["default"].module.preprocessor.html.loader,
        options: _configurator["default"].module.preprocessor.html.options || {}
      }, _configurator["default"].module.preprocessor.html.additional.post.map(evaluate))
    },
    html: {
      exclude: function exclude(filePath) {
        return _helper["default"].normalizePaths(_configurator["default"].files.html.concat(_configurator["default"].files.defaultHTML).map(function (htmlConfiguration) {
          return htmlConfiguration.template.filePath;
        })).includes(filePath) || (_configurator["default"].module.html.exclude === null ? true : evaluate(_configurator["default"].module.html.exclude, filePath));
      },
      include: _configurator["default"].path.source.asset.template,
      test: /\.html(?:\?.*)?$/i,
      use: _configurator["default"].module.html.additional.pre.concat({
        loader: 'file?name=' + _path2["default"].join(_path2["default"].relative(_configurator["default"].path.target.base, _configurator["default"].path.target.asset.template), "[name].[ext]?".concat(_configurator["default"].hashAlgorithm, "=[hash]"))
      }, {
        loader: 'extract'
      }, {
        loader: _configurator["default"].module.html.loader,
        options: _configurator["default"].module.html.options || {}
      }, _configurator["default"].module.html.additional.post.map(evaluate))
    }
  },
  // endregion
  // Load dependencies.
  // region style
  style: {
    exclude: function exclude(filePath) {
      return _configurator["default"].module.cascadingStyleSheet.exclude === null ? isFilePathInDependencies(filePath) : evaluate(_configurator["default"].module.cascadingStyleSheet.exclude, filePath);
    },
    include: includingPaths,
    test: /\.s?css(?:\?.*)?$/i,
    use: _configurator["default"].module.preprocessor.cascadingStyleSheet.additional.pre.concat({
      loader: _configurator["default"].module.style.loader,
      options: _configurator["default"].module.style.options || {}
    }, {
      loader: _configurator["default"].module.cascadingStyleSheet.loader,
      options: _configurator["default"].module.cascadingStyleSheet.options || {}
    }, {
      loader: _configurator["default"].module.preprocessor.cascadingStyleSheet.loader,
      options: _clientnode["default"].extend(true, {
        ident: 'postcss',
        plugins: function plugins() {
          return [postcssImport({
            addDependencyTo: _webpack["default"],
            root: _configurator["default"].path.context
          })].concat(_configurator["default"].module.preprocessor.cascadingStyleSheet.additional.plugins.pre.map(evaluate), postcssPresetENV(_configurator["default"].module.preprocessor.cascadingStyleSheet.postcssPresetEnv),
          /*
              NOTE: Checking path doesn't work if fonts are
              referenced in libraries provided in another
              location than the project itself like the
              "node_modules" folder.
          */
          postcssFontPath({
            checkPath: false,
            formats: [{
              type: 'woff2',
              ext: 'woff2'
            }, {
              type: 'woff',
              ext: 'woff'
            }]
          }), postcssURL({
            url: 'rebase'
          }), postcssSprites({
            filterBy: function filterBy() {
              return new Promise(function (resolve, reject) {
                return (_configurator["default"].files.compose.image ? resolve : reject)();
              });
            },
            hooks: {
              onSaveSpritesheet: function onSaveSpritesheet(image) {
                return _path2["default"].join(image.spritePath, _path2["default"].relative(_configurator["default"].path.target.asset.image, _configurator["default"].files.compose.image));
              }
            },
            stylesheetPath: _configurator["default"].path.source.asset.cascadingStyleSheet,
            spritePath: _configurator["default"].path.source.asset.image
          }), _configurator["default"].module.preprocessor.cascadingStyleSheet.additional.plugins.post.map(evaluate), _configurator["default"].module.optimizer.cssnano ? postcssCSSnano(_configurator["default"].module.optimizer.cssnano) : []);
        }
      }, _configurator["default"].module.preprocessor.cascadingStyleSheet.options || {})
    }, _configurator["default"].module.preprocessor.cascadingStyleSheet.additional.post.map(evaluate))
  },
  // endregion
  // Optimize loaded assets.
  // region font
  font: {
    eot: {
      exclude: function exclude(filePath) {
        return _configurator["default"].module.optimizer.font.eot.exclude === null ? false : evaluate(_configurator["default"].module.optimizer.font.eot.exclude, filePath);
      },
      test: /\.eot(?:\?.*)?$/i,
      use: _configurator["default"].module.optimizer.font.eot.additional.pre.map(evaluate).concat({
        loader: _configurator["default"].module.optimizer.font.eot.loader,
        options: _configurator["default"].module.optimizer.font.eot.options || {}
      }, _configurator["default"].module.optimizer.font.eot.additional.post.map(evaluate))
    },
    svg: {
      exclude: function exclude(filePath) {
        return _configurator["default"].module.optimizer.font.svg.exclude === null ? false : evaluate(_configurator["default"].module.optimizer.font.svg.exclude, filePath);
      },
      test: /\.svg(?:\?.*)?$/i,
      use: _configurator["default"].module.optimizer.font.svg.additional.pre.map(evaluate).concat({
        loader: _configurator["default"].module.optimizer.font.svg.loader,
        options: _configurator["default"].module.optimizer.font.svg.options || {}
      }, _configurator["default"].module.optimizer.font.svg.additional.post.map(evaluate))
    },
    ttf: {
      exclude: function exclude(filePath) {
        return _configurator["default"].module.optimizer.font.ttf.exclude === null ? false : evaluate(_configurator["default"].module.optimizer.font.ttf.exclude, filePath);
      },
      test: /\.ttf(?:\?.*)?$/i,
      use: _configurator["default"].module.optimizer.font.ttf.additional.pre.map(evaluate).concat({
        loader: _configurator["default"].module.optimizer.font.ttf.loader,
        options: _configurator["default"].module.optimizer.font.ttf.options || {}
      }, _configurator["default"].module.optimizer.font.ttf.additional.post.map(evaluate))
    },
    woff: {
      exclude: function exclude(filePath) {
        return _configurator["default"].module.optimizer.font.woff.exclude === null ? false : evaluate(_configurator["default"].module.optimizer.font.woff.exclude, filePath);
      },
      test: /\.woff2?(?:\?.*)?$/i,
      use: _configurator["default"].module.optimizer.font.woff.additional.pre.map(evaluate).concat({
        loader: _configurator["default"].module.optimizer.font.woff.loader,
        options: _configurator["default"].module.optimizer.font.woff.options || {}
      }, _configurator["default"].module.optimizer.font.woff.additional.post.map(evaluate))
    }
  },
  // endregion
  // region image
  image: {
    exclude: function exclude(filePath) {
      return _configurator["default"].module.optimizer.image.exclude === null ? isFilePathInDependencies(filePath) : evaluate(_configurator["default"].module.optimizer.image.exclude, filePath);
    },
    include: _configurator["default"].path.source.asset.image,
    test: /\.(?:png|jpg|ico|gif)(?:\?.*)?$/i,
    use: _configurator["default"].module.optimizer.image.additional.pre.map(evaluate).concat({
      loader: _configurator["default"].module.optimizer.image.loader,
      options: _configurator["default"].module.optimizer.image.file || {}
    }, _configurator["default"].module.optimizer.image.additional.post.map(evaluate))
  },
  // endregion
  // region data
  data: {
    exclude: function exclude(filePath) {
      return _configurator["default"].extensions.file.internal.includes(_path2["default"].extname(_helper["default"].stripLoader(filePath))) || (_configurator["default"].module.optimizer.data.exclude === null ? isFilePathInDependencies(filePath) : evaluate(_configurator["default"].module.optimizer.data.exclude, filePath));
    },
    test: /.+/,
    use: _configurator["default"].module.optimizer.data.additional.pre.map(evaluate).concat({
      loader: _configurator["default"].module.optimizer.data.loader,
      options: _configurator["default"].module.optimizer.data.options || {}
    }, _configurator["default"].module.optimizer.data.additional.post.map(evaluate))
  } // endregion

});

if (_configurator["default"].files.compose.cascadingStyleSheet && plugins.MiniCSSExtract) {
  /*
      NOTE: We have to remove the client side javascript hmr style loader
      first.
  */
  loader.style.use.shift();
  loader.style.use.unshift(plugins.MiniCSSExtract.loader);
} // / endregion
// endregion


var _iteratorNormalCompletion17 = true;
var _didIteratorError17 = false;
var _iteratorError17 = undefined;

try {
  for (var _iterator17 = _configurator["default"].plugins[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
    var pluginConfiguration = _step17.value;
    pluginInstances.push((0, _construct2["default"])(eval('require')(pluginConfiguration.name.module)[pluginConfiguration.name.initializer], (0, _toConsumableArray2["default"])(pluginConfiguration.parameter)));
  } // region configuration

} catch (err) {
  _didIteratorError17 = true;
  _iteratorError17 = err;
} finally {
  try {
    if (!_iteratorNormalCompletion17 && _iterator17["return"] != null) {
      _iterator17["return"]();
    }
  } finally {
    if (_didIteratorError17) {
      throw _iteratorError17;
    }
  }
}

var customConfiguration = {};
if (_configurator["default"].path.configuration && _configurator["default"].path.configuration.json) try {
  customConfiguration = require(_configurator["default"].path.configuration.json);
} catch (error) {}

var webpackConfiguration = _clientnode["default"].extend(true, {
  bail: true,
  cache: _configurator["default"].cache.main,
  context: _configurator["default"].path.context,
  devtool: _configurator["default"].development.tool,
  devServer: _configurator["default"].development.server,
  // region input
  entry: _configurator["default"].injection.entry.normalized,
  externals: _configurator["default"].injection.external.modules,
  resolve: {
    alias: _configurator["default"].module.aliases,
    aliasFields: _configurator["default"]["package"].aliasPropertyNames,
    extensions: _configurator["default"].extensions.file.internal,
    mainFields: _configurator["default"]["package"].main.propertyNames,
    mainFiles: _configurator["default"]["package"].main.fileNames,
    moduleExtensions: _configurator["default"].extensions.module,
    modules: _helper["default"].normalizePaths(_configurator["default"].module.directoryNames),
    symlinks: false,
    unsafeCache: _configurator["default"].cache.unsafe
  },
  resolveLoader: {
    alias: _configurator["default"].loader.aliases,
    aliasFields: _configurator["default"]["package"].aliasPropertyNames,
    extensions: _configurator["default"].loader.extensions.file,
    mainFields: _configurator["default"]["package"].main.propertyNames,
    mainFiles: _configurator["default"]["package"].main.fileNames,
    moduleExtensions: _configurator["default"].loader.extensions.module,
    modules: _configurator["default"].loader.directoryNames,
    symlinks: false
  },
  // endregion
  // region output
  output: {
    filename: _path2["default"].relative(_configurator["default"].path.target.base, _configurator["default"].files.compose.javaScript),
    hashFunction: _configurator["default"].hashAlgorithm,
    library: libraryName,
    libraryTarget: _configurator["default"].givenCommandLineArguments[2] === 'build:dll' ? 'var' : _configurator["default"].exportFormat.self,
    path: _configurator["default"].path.target.base,
    publicPath: _configurator["default"].path.target["public"],
    umdNamedDefine: true
  },
  performance: _configurator["default"].performanceHints,
  target: _configurator["default"].targetTechnology,
  // endregion
  mode: _configurator["default"].debug ? 'development' : 'production',
  module: {
    rules: _configurator["default"].module.additional.pre.map(generateLoader).concat(loader.ejs, loader.script, loader.html.main, loader.html.ejs, loader.html.html, loader.style, loader.font.eot, loader.font.svg, loader.font.ttf, loader.font.woff, loader.image, loader.data, _configurator["default"].module.additional.post.map(generateLoader))
  },
  node: _configurator["default"].nodeEnvironment,
  optimization: {
    minimize: _configurator["default"].module.optimizer.minimize,
    minimizer: _configurator["default"].module.optimizer.minimizer,
    // region common chunks
    splitChunks: !_configurator["default"].injection.chunks || _configurator["default"].targetTechnology !== 'web' || ['build:dll', 'test'].includes(_configurator["default"].givenCommandLineArguments[2]) ? {
      cacheGroups: {
        "default": false,
        vendors: false
      }
    } : _clientnode["default"].extend(true, {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          chunks: function chunks(module) {
            if ((0, _typeof2["default"])(_configurator["default"].inPlace.javaScript) === 'object' && _configurator["default"].inPlace.javaScript !== null) {
              for (var _i5 = 0, _Object$keys = Object.keys(_configurator["default"].inPlace.javaScript); _i5 < _Object$keys.length; _i5++) {
                var _name2 = _Object$keys[_i5];
                if (_name2 === '*' || _name2 === module.name) return false;
              }
            }

            return true;
          },
          priority: -10,
          reuseExistingChunk: true,
          test: /[\\/]node_modules[\\/]/
        }
      }
    }, _configurator["default"].injection.chunks) // endregion

  },
  plugins: pluginInstances
}, _configurator["default"].webpack, customConfiguration);

exports.webpackConfiguration = webpackConfiguration;
if (!Array.isArray(_configurator["default"].module.skipParseRegularExpressions) || _configurator["default"].module.skipParseRegularExpressions.length) webpackConfiguration.module.noParse = _configurator["default"].module.skipParseRegularExpressions;

if (_configurator["default"].path.configuration && _configurator["default"].path.configuration.javaScript) {
  var result;

  try {
    result = require(_configurator["default"].path.configuration.javaScript);
  } catch (error) {}

  if (result) if (result.hasOwnProperty('replaceWebOptimizer')) // IgnoreTypeCheck
    exports.webpackConfiguration = webpackConfiguration = ((0, _readOnlyError2["default"])("webpackConfiguration"), webpackConfiguration.replaceWebOptimizer);else _clientnode["default"].extend(true, webpackConfiguration, result);
}

if (_configurator["default"].showConfiguration) {
  console.info('Using internal configuration:', _util["default"].inspect(_configurator["default"], {
    depth: null
  }));
  console.info('-----------------------------------------------------------');
  console.info('Using webpack configuration:', _util["default"].inspect(webpackConfiguration, {
    depth: null
  }));
} // endregion


var _default = webpackConfiguration; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

exports["default"] = _default;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQVlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTs7QUFVQTs7QUFDQTs7QUFDQTs7QUF1QkE7O0FBQ0E7O0FBQ0E7O0FBc0JBOztBQU1BOztBQUNBOztBQUtBOztBQWNBOztBQWhGQSxJQUFJO0FBQ0E7QUFDQSxNQUFJLGNBQXVCLEdBQUcsT0FBTyxDQUFDLFNBQUQsQ0FBckM7QUFDSCxDQUhELENBR0UsT0FBTyxLQUFQLEVBQWMsQ0FBRTtBQUNsQjs7O0FBSUE7QUFDQSxJQUFJO0FBQ0E7QUFDQSxNQUFJLGdCQUF5QixHQUFHLE9BQU8sQ0FBQyxvQkFBRCxDQUF2QztBQUNILENBSEQsQ0FHRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUNsQixJQUFJO0FBQ0E7QUFDQSxNQUFJLGVBQXdCLEdBQUcsT0FBTyxDQUFDLGtCQUFELENBQXRDO0FBQ0gsQ0FIRCxDQUdFLE9BQU8sS0FBUCxFQUFjLENBQUU7O0FBQ2xCLElBQUk7QUFDQTtBQUNBLE1BQUksYUFBc0IsR0FBRyxPQUFPLENBQUMsZ0JBQUQsQ0FBcEM7QUFDSCxDQUhELENBR0UsT0FBTyxLQUFQLEVBQWMsQ0FBRTs7QUFDbEIsSUFBSTtBQUNBO0FBQ0EsTUFBSSxjQUF1QixHQUFHLE9BQU8sQ0FBQyxpQkFBRCxDQUFyQztBQUNILENBSEQsQ0FHRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUNsQixJQUFJO0FBQ0E7QUFDQSxNQUFJLFVBQW1CLEdBQUcsT0FBTyxDQUFDLGFBQUQsQ0FBakM7QUFDSCxDQUhELENBR0UsT0FBTyxLQUFQLEVBQWMsQ0FBRTtBQUNsQjs7O0FBS0EsSUFBTSx5QkFBK0MsR0FBRztBQUNwRCxFQUFBLFdBQVcsRUFBRSw2QkFEdUM7QUFFcEQsRUFBQSxJQUFJLEVBQUUscUJBRjhDO0FBR3BELEVBQUEsY0FBYyxFQUFFLHlCQUhvQztBQUlwRCxFQUFBLGtCQUFrQixFQUFFLCtCQUpnQztBQUtwRCxFQUFBLFdBQVcsRUFBRSw2QkFMdUM7QUFNcEQsRUFBQSxPQUFPLEVBQUUseUJBTjJDO0FBT3BELEVBQUEsUUFBUSxFQUFFLHlCQVAwQztBQVFwRCxFQUFBLE9BQU8sRUFBRTtBQVIyQyxDQUF4RDtBQVVBLElBQU0sT0FBYyxHQUFHLEVBQXZCOztBQUNBLEtBQUssSUFBTSxJQUFYLElBQTBCLHlCQUExQjtBQUNJLE1BQUkseUJBQXlCLENBQUMsY0FBMUIsQ0FBeUMsSUFBekMsQ0FBSixFQUNJLElBQUk7QUFDQTtBQUNBLElBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUCxHQUFnQixPQUFPLENBQUMseUJBQXlCLENBQUMsSUFBRCxDQUExQixDQUF2QjtBQUNILEdBSEQsQ0FHRSxPQUFPLEtBQVAsRUFBYyxDQUFFO0FBTDFCOztBQU1BLElBQUksT0FBTyxDQUFDLFFBQVosRUFDSSxPQUFPLENBQUMsUUFBUixHQUFtQixPQUFPLENBQUMsUUFBUixXQUFuQjs7QUFlSixJQUNJLFdBQVcsT0FBWCxJQUNBLE9BQU8sQ0FBQyxLQURSLElBRUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsYUFBaEIsS0FBa0MsT0FBTyxDQUFDLEtBSDlDLEVBSUU7QUFDRSxFQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWMsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsYUFBaEIsQ0FBZCxFQUE4QyxPQUE5QyxHQUF3RCxZQUVsRDtBQUNGLDJCQUFNLE1BQU4sQ0FBYSxJQUFiLEVBQW1CLEtBQUssT0FBeEIsRUFBaUMsTUFBakMsRUFBeUMsS0FBSyxPQUE5Qzs7QUFERSxzQ0FEQyxTQUNEO0FBREMsTUFBQSxTQUNEO0FBQUE7O0FBRUYsV0FBTyx1QkFBdUIsSUFBdkIsZ0NBQTRCLElBQTVCLFNBQXFDLFNBQXJDLEVBQVA7QUFDSCxHQUxEO0FBTUgsQyxDQUNEOzs7QUFFQSxJQUFNLDZCQUFxRCxHQUN2RCx3QkFBd0IsWUFENUI7QUFFQSxJQUNJLFdBQVcsT0FBWCxJQUNBLE9BQU8sQ0FBQyxLQURSLElBRUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsY0FBaEIsS0FBbUMsT0FBTyxDQUFDLEtBSC9DLEVBS0ksT0FBTyxDQUFDLEtBQVIsQ0FBYyxPQUFPLENBQUMsT0FBUixDQUFnQixjQUFoQixDQUFkLEVBQStDLE9BQS9DLENBQXVELFlBQXZELEdBQXNFLFVBQ2xFLEdBRGtFLEVBRXpEO0FBQ1QsTUFBSSxHQUFHLENBQUMsS0FBSixDQUFVLFlBQVYsQ0FBSixFQUNJLE9BQU8sS0FBUDs7QUFGSyxxQ0FETSxtQkFDTjtBQURNLElBQUEsbUJBQ047QUFBQTs7QUFHVCxTQUFPLDZCQUE2QixDQUFDLEtBQTlCLENBQ0gsdUJBREcsRUFDc0IsQ0FBQyxHQUFELEVBQU0sTUFBTixDQUFhLG1CQUFiLENBRHRCLENBQVA7QUFFSCxDQVBELEMsQ0FRSjtBQUNBO0FBQ0E7QUFDQTs7QUFDQSxJQUFJLFdBQUo7QUFDQSxJQUFJLGlCQUFpQix3QkFBakIsSUFBa0MseUJBQWMsV0FBcEQsRUFDSSxXQUFXLEdBQUcseUJBQWMsV0FBNUIsQ0FESixLQUVLLElBQUksTUFBTSxDQUFDLElBQVAsQ0FBWSx5QkFBYyxTQUFkLENBQXdCLEtBQXhCLENBQThCLFVBQTFDLEVBQXNELE1BQXRELEdBQStELENBQW5FLEVBQ0QsV0FBVyxHQUFHLFFBQWQsQ0FEQyxLQUVBO0FBQ0QsRUFBQSxXQUFXLEdBQUcseUJBQWMsSUFBNUI7QUFDQSxNQUFJLENBQUMsUUFBRCxFQUFXLFFBQVgsRUFBcUIsTUFBckIsRUFBNkIsS0FBN0IsRUFBb0MsUUFBcEMsRUFBOEMsUUFBOUMsQ0FDQSx5QkFBYyxZQUFkLENBQTJCLElBRDNCLENBQUosRUFHSSxXQUFXLEdBQUcsdUJBQU0sZ0NBQU4sQ0FBdUMsV0FBdkMsQ0FBZDtBQUNQLEMsQ0FDRDtBQUNBOztBQUNBLElBQU0sZUFBNkIsR0FBRyxDQUNsQyxJQUFJLG9CQUFRLFFBQVIsQ0FBaUIscUJBQXJCLENBQTJDLElBQTNDLENBRGtDLENBQXRDLEMsQ0FHQTs7Ozs7OztBQUNBLHVCQUFtQyx5QkFBYyxTQUFkLENBQXdCLGFBQTNEO0FBQUEsUUFBVyxhQUFYO0FBQ0ksSUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBSSxvQkFBUSxZQUFaLENBQXlCLElBQUksTUFBSixDQUFXLGFBQVgsQ0FBekIsQ0FBckI7QUFESixHLENBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBQ1csTTtBQUNQLE1BQUkseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxNQUFsQyxDQUF5QyxjQUF6QyxDQUF3RCxNQUF4RCxDQUFKLEVBQXFFO0FBQ2pFLFFBQU0sTUFBYSxHQUFHLElBQUksTUFBSixDQUFXLE1BQVgsQ0FBdEI7QUFDQSxJQUFBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFJLG9CQUFRLDZCQUFaLENBQ2pCLE1BRGlCLEVBQ1QsVUFBQyxRQUFELEVBQW9DO0FBQ3hDLE1BQUEsUUFBUSxDQUFDLE9BQVQsR0FBbUIsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsT0FBakIsQ0FDZixNQURlLEVBQ1AseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxNQUFsQyxDQUF5QyxNQUF6QyxDQURPLENBQW5CO0FBRUgsS0FKZ0IsQ0FBckI7QUFLSDs7O0FBUkwsS0FBSyxJQUFNLE1BQVgsSUFBNEIseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxNQUE5RDtBQUFBLFFBQVcsTUFBWDtBQUFBLEMsQ0FTQTtBQUNBOzs7QUFDQSxJQUFJLGFBQXFCLEdBQUcsS0FBNUI7O0FBQ0EsSUFBSSx5QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxNQUErQyxXQUFuRDtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNJLDBCQUFrRCx5QkFBYyxLQUFkLENBQW9CLElBQXRFO0FBQUEsVUFBVyxpQkFBWDs7QUFDSSxVQUFJLHVCQUFNLFVBQU4sQ0FBaUIsaUJBQWlCLENBQUMsUUFBbEIsQ0FBMkIsUUFBNUMsQ0FBSixFQUEyRDtBQUN2RCxRQUFBLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFJLE9BQU8sQ0FBQyxJQUFaLENBQWlCLHVCQUFNLE1BQU4sQ0FDbEMsRUFEa0MsRUFFbEMsaUJBRmtDLEVBR2xDO0FBQUMsVUFBQSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsUUFBbEIsQ0FBMkI7QUFBdEMsU0FIa0MsQ0FBakIsQ0FBckI7QUFLQSxRQUFBLGFBQWEsR0FBRyxJQUFoQjtBQUNIO0FBUkw7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQyxDQVVBO0FBQ0E7OztBQUNBLElBQ0ksYUFBYSxJQUNiLHlCQUFjLE9BRGQsSUFFQSxPQUFPLENBQUMsT0FGUixJQUdBLHVCQUFNLFVBQU4sQ0FBaUIseUJBQWMsT0FBZCxDQUFzQixJQUF2QyxDQUpKLEVBTUksZUFBZSxDQUFDLElBQWhCLENBQXFCLElBQUksT0FBTyxDQUFDLE9BQVosQ0FBb0IseUJBQWMsT0FBbEMsQ0FBckIsRSxDQUNKO0FBQ0E7O0FBQ0EsSUFBSSxhQUFhLElBQUkseUJBQWMsT0FBL0IsSUFBMEMsT0FBTyxDQUFDLE9BQXRELEVBQStEO0FBQzNELE1BQUksQ0FBQyxDQUFDLE9BQUQsRUFBVSxjQUFWLEVBQTBCLFFBQTFCLENBQ0QseUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsQ0FEQyxDQUFMO0FBR0ksNEJBQWlDLENBQzdCLENBQUMscUJBQUQsRUFBd0IsS0FBeEIsQ0FENkIsRUFFN0IsQ0FBQyxZQUFELEVBQWUsSUFBZixDQUY2QixDQUFqQztBQUFLLFVBQU0sSUFBa0IsV0FBeEI7O0FBSUQsVUFBSSx5QkFBYyxPQUFkLENBQXNCLElBQUksQ0FBQyxDQUFELENBQTFCLENBQUosRUFBb0M7QUFDaEMsWUFBTSxPQUFxQixHQUFHLE1BQU0sQ0FBQyxJQUFQLENBQzFCLHlCQUFjLE9BQWQsQ0FBc0IsSUFBSSxDQUFDLENBQUQsQ0FBMUIsQ0FEMEIsQ0FBOUI7O0FBRUEscUNBQTBCLE9BQTFCO0FBQUssY0FBTSxLQUFXLGdCQUFqQjs7QUFDRCxtQ0FBYyxPQUFkLENBQXNCLFFBQXRCLENBQStCLElBQS9CLENBQW9DLGtCQUFLLFFBQUwsQ0FDaEMseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQURNLEVBRWhDLHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsSUFBSSxDQUFDLENBQUQsQ0FBcEMsQ0FGZ0MsY0FHN0IsS0FINkIsY0FHckIsSUFBSSxDQUFDLENBQUQsQ0FIaUIsY0FHVix5QkFBYyxhQUhKLE9BQXBDO0FBREo7QUFLSDtBQVpMO0FBSEo7O0FBZ0JBLEVBQUEsZUFBZSxDQUFDLElBQWhCLENBQXFCLElBQUksT0FBTyxDQUFDLE9BQVosQ0FBb0IseUJBQWMsT0FBbEMsQ0FBckI7QUFDSCxDLENBQ0Q7QUFDQTs7O0FBQ0EsSUFBSSx5QkFBYyxXQUFkLENBQTBCLFdBQTFCLElBQTBDLGFBQWEsSUFBSSxDQUMzRCxPQUQyRCxFQUNsRCxjQURrRCxFQUU3RCxRQUY2RCxDQUVwRCx5QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQUZvRCxDQUEvRCxFQUdJLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFJLE9BQU8sQ0FBQyxXQUFaLENBQ2pCLHlCQUFjLFdBQWQsQ0FBMEIsV0FEVCxDQUFyQixFLENBRUo7QUFDQTs7QUFDQSxJQUFJLHlCQUFjLFlBQWQsQ0FBMkIsV0FBL0IsRUFDSSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBSSxvQkFBUSxZQUFaLENBQ2pCLHlCQUFjLFlBQWQsQ0FBMkIsV0FEVixDQUFyQjtBQUVKLElBQUkseUJBQWMsTUFBZCxDQUFxQixPQUF6QixFQUNJLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFJLG9CQUFRLGFBQVosQ0FDakIseUJBQWMsTUFBZCxDQUFxQixPQURKLENBQXJCLEUsQ0FFSjtBQUNBO0FBQ0E7O0FBQ0EsSUFDSSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLFdBQS9CLElBQ0EseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixXQUEvQixDQUEyQyxNQUYvQyxFQUlJLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixNQUFNLENBQUMsSUFBUCxDQUNqQix5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLFdBQS9CLENBQTJDLE1BRDFCLEVBRW5CLE1BRm1CLEdBR2pCLElBQUksT0FBTyxDQUFDLFdBQVosQ0FDSSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLFdBQS9CLENBQTJDLE1BQTNDLENBQWtELFNBQWxELElBQStELEVBRG5FLEVBRUkseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixXQUEvQixDQUEyQyxNQUEzQyxDQUFrRCxNQUFsRCxJQUE0RCxFQUZoRSxDQUhpQixHQU9qQixJQUFJLE9BQU8sQ0FBQyxXQUFaLEVBUEosRSxDQVNKO0FBQ0E7O0FBQ0EsZUFBZSxDQUFDLElBQWhCLENBQXFCO0FBQUMsRUFBQSxLQUFLLEVBQUUsZUFBQyxRQUFELEVBQTBCO0FBQ25ELElBQUEsUUFBUSxDQUFDLEtBQVQsQ0FBZSxJQUFmLENBQW9CLEdBQXBCLENBQXdCLG9CQUF4QixFQUE4QyxVQUMxQyxXQUQwQyxFQUVwQztBQUNOLFdBQUssSUFBTSxPQUFYLElBQTZCLFdBQVcsQ0FBQyxNQUF6QztBQUNJLFlBQUksV0FBVyxDQUFDLE1BQVosQ0FBbUIsY0FBbkIsQ0FBa0MsT0FBbEMsQ0FBSixFQUFnRDtBQUM1QyxjQUFNLFFBQWUsR0FBRyxPQUFPLENBQUMsT0FBUixDQUFnQixVQUFoQixFQUE0QixFQUE1QixDQUF4Qjs7QUFDQSxjQUFNLEtBQVksR0FBRyxtQkFBTyxrQkFBUCxDQUNqQixRQURpQixFQUVqQix5QkFBYyxZQUFkLENBQTJCLEtBRlYsRUFHakIseUJBQWMsSUFIRyxDQUFyQjs7QUFJQSxjQUNJLEtBQUksSUFDSix5QkFBYyxZQUFkLENBQTJCLEtBQTNCLENBREEsSUFFQSxDQUFFLElBQUksTUFBSixDQUNFLHlCQUFjLFlBQWQsQ0FBMkIsS0FBM0IsRUFDSyxnQ0FGUCxDQUFELENBR0UsSUFIRixDQUdPLFFBSFAsQ0FITCxFQU9FO0FBQ0UsZ0JBQU0sTUFBYyxHQUFHLFdBQVcsQ0FBQyxNQUFaLENBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBQXZCO0FBQ0EsZ0JBQUksT0FBTyxNQUFQLEtBQWtCLFFBQXRCLEVBQ0ksV0FBVyxDQUFDLE1BQVosQ0FBbUIsT0FBbkIsSUFBOEIsSUFBSSx5QkFBSixDQUMxQix5QkFBYyxZQUFkLENBQTJCLEtBQTNCLEVBQWlDLE9BQWpDLENBQXlDLE9BQXpDLENBQ0ksUUFESixFQUNjLE1BQU0sQ0FBQyxPQUFQLENBQWUsS0FBZixFQUFzQixLQUF0QixDQURkLENBRDBCLENBQTlCO0FBR1A7QUFDSjtBQXJCTDtBQXNCSCxLQXpCRDtBQTBCSDtBQTNCb0IsQ0FBckIsRSxDQTRCQTtBQUNBOztBQUNBLElBQUksYUFBYSxJQUFJLENBQUMsQ0FBQyxPQUFELEVBQVUsY0FBVixFQUEwQixRQUExQixDQUNsQix5QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQURrQixDQUF0QixFQUdJLGVBQWUsQ0FBQyxJQUFoQixDQUFxQjtBQUFDLEVBQUEsS0FBSyxFQUFFLGVBQUMsUUFBRCxFQUEwQjtBQUNuRCxRQUFNLGlCQUErQixHQUFHLEVBQXhDO0FBQ0EsSUFBQSxRQUFRLENBQUMsS0FBVCxDQUFlLFdBQWYsQ0FBMkIsR0FBM0IsQ0FBK0IsbUJBQS9CLEVBQW9ELFVBQ2hELFdBRGdEO0FBQUEsYUFHaEQsV0FBVyxDQUFDLEtBQVosQ0FBa0Isb0NBQWxCLENBQXVELFFBQXZELENBQ0ksbUJBREosRUFFSSxVQUFDLElBQUQsRUFBbUIsUUFBbkIsRUFBOEM7QUFDMUMsWUFDSSx5QkFBYyxPQUFkLENBQXNCLG1CQUF0QixJQUNBLE1BQU0sQ0FBQyxJQUFQLENBQ0kseUJBQWMsT0FBZCxDQUFzQixtQkFEMUIsRUFFRSxNQUhGLElBSUEseUJBQWMsT0FBZCxDQUFzQixVQUF0QixJQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVkseUJBQWMsT0FBZCxDQUFzQixVQUFsQyxFQUE4QyxNQU5sRCxFQVFJLElBQUk7QUFDQSxjQUFNLE1BRUwsR0FBRyxtQkFBTyxzQ0FBUCxDQUNBLElBQUksQ0FBQyxJQURMLEVBRUEseUJBQWMsT0FBZCxDQUFzQixtQkFGdEIsRUFHQSx5QkFBYyxPQUFkLENBQXNCLFVBSHRCLEVBSUEseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQUoxQixFQUtBLHlCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FDSyxtQkFOTCxFQU9BLHlCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFQNUIsRUFRQSxXQUFXLENBQUMsTUFSWixDQUZKOztBQVlBLFVBQUEsSUFBSSxDQUFDLElBQUwsR0FBWSxNQUFNLENBQUMsT0FBbkI7QUFDQSxVQUFBLGlCQUFpQixDQUFDLE1BQWxCLENBQXlCLE1BQU0sQ0FBQyxpQkFBaEM7QUFDSCxTQWZELENBZUUsT0FBTyxLQUFQLEVBQWM7QUFDWixpQkFBTyxRQUFRLENBQUMsS0FBRCxFQUFRLElBQVIsQ0FBZjtBQUNIO0FBQ0wsUUFBQSxRQUFRLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FBUjtBQUNILE9BOUJMLENBSGdEO0FBQUEsS0FBcEQ7QUFrQ0EsSUFBQSxRQUFRLENBQUMsS0FBVCxDQUFlLFNBQWYsQ0FBeUIsUUFBekIsQ0FDSSw2QkFESjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUNBQ21DLGtCQUMzQixJQUQyQixFQUNkLFFBRGM7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUd2QixnQkFBQSxRQUh1QixHQUdTLEVBSFQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDZCQUlELGlCQUpDOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBSWhCLGdCQUFBLEtBSmdCO0FBQUE7QUFBQSx1QkFLYix1QkFBTSxNQUFOLENBQWEsS0FBYixDQUxhOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBTW5CLGdCQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsYUFBVyxNQUFYLENBQWtCLEtBQWxCLFdBQ1YsT0FBTyxDQUFDLEtBREUsQ0FBZDs7QUFObUI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsdUJBU3JCLE9BQU8sQ0FBQyxHQUFSLENBQVksUUFBWixDQVRxQjs7QUFBQTtBQVUzQixnQkFBQSxRQUFRLEdBQUcsRUFBWDs7QUFWMkI7QUFZdkIsc0JBQU0sSUFBVyxhQUFqQjtBQUVBLGtCQUFBLFFBQVEsQ0FBQyxJQUFULENBQWMsYUFBVyxPQUFYLENBQ1YseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxJQUFoQyxDQURVLEVBRVY7QUFBQyxvQkFBQSxRQUFRLEVBQUUseUJBQWM7QUFBekIsbUJBRlUsRUFHWixJQUhZO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpREFHUCxpQkFBTyxLQUFQO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQ0FDQyxLQUFLLENBQUMsTUFBTixLQUFpQixDQURsQjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLHFDQUVPLGFBQVcsS0FBWCxDQUNGLHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsSUFBaEMsQ0FERSxDQUZQOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUhPOztBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUFkO0FBZHVCOztBQVczQixzQ0FDeUIsQ0FBQyxZQUFELEVBQWUscUJBQWYsQ0FEekI7QUFBQTtBQUFBOztBQVgyQjtBQUFBLHVCQXNCckIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxRQUFaLENBdEJxQjs7QUFBQTtBQXVCM0IsZ0JBQUEsUUFBUTs7QUF2Qm1CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BRG5DOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBMEJIO0FBOURvQixDQUFyQixFLENBK0RKO0FBQ0E7O0FBQ0EsSUFBSSx5QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxNQUErQyxXQUFuRCxFQUNJLEtBQUssSUFBTSxTQUFYLElBQStCLHlCQUFjLFNBQWQsQ0FBd0IsS0FBeEIsQ0FBOEIsVUFBN0Q7QUFDSSxNQUFJLHlCQUFjLFNBQWQsQ0FBd0IsS0FBeEIsQ0FBOEIsVUFBOUIsQ0FBeUMsY0FBekMsQ0FDQSxTQURBLENBQUosRUFFRztBQUNDLFFBQU0sZ0JBQXVCLEdBQ3pCLFVBQUcseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQUE3QixjQUFxQyxTQUFyQyw0QkFESjs7QUFHQSxRQUFJLHlCQUFjLG9CQUFkLENBQW1DLFFBQW5DLENBQ0EsZ0JBREEsQ0FBSixFQUVHO0FBQ0MsYUFBTyx5QkFBYyxTQUFkLENBQXdCLEtBQXhCLENBQThCLFVBQTlCLENBQXlDLFNBQXpDLENBQVA7O0FBQ0EsVUFBTSxRQUFlLEdBQUcsbUJBQU8sc0JBQVAsQ0FDcEIsbUJBQU8sV0FBUCxDQUNJLHlCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFEaEMsQ0FEb0IsRUFHakI7QUFBQyxrQkFBVTtBQUFYLE9BSGlCLENBQXhCOztBQUlBLE1BQUEsZUFBZSxDQUFDLElBQWhCLENBQXFCLElBQUksT0FBTyxDQUFDLGtCQUFaLENBQStCO0FBQ2hELFFBQUEsUUFBUSxFQUFFLFFBRHNDO0FBRWhELFFBQUEsSUFBSSxFQUFFLElBRjBDO0FBR2hELFFBQUEsZ0JBQWdCLEVBQUUsdUJBQU0sVUFBTixXQUFvQixRQUFwQjtBQUg4QixPQUEvQixDQUFyQjtBQUtBLE1BQUEsZUFBZSxDQUFDLElBQWhCLENBQXFCLElBQUksb0JBQVEsa0JBQVosQ0FBK0I7QUFDaEQsUUFBQSxPQUFPLEVBQUUseUJBQWMsSUFBZCxDQUFtQixPQURvQjtBQUVoRCxRQUFBLFFBQVEsRUFBRSxPQUFPLENBQUMsZ0JBQUQ7QUFGK0IsT0FBL0IsQ0FBckI7QUFHSDtBQUNKO0FBeEJMLEMsQ0F5Qko7QUFDQTs7QUFDQSxJQUFJLENBQUMseUJBQWMsTUFBZCxDQUFxQixVQUExQixFQUNJLHlCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsVUFBNUIsR0FBeUMsa0JBQUssT0FBTCxDQUNyQyx5QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLFVBREssRUFDTyx3QkFEUCxDQUF6QyxDLENBRUo7QUFDQTs7QUFDQSxJQUFJLHlCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsbUJBQTVCLElBQW1ELE9BQU8sQ0FBQyxjQUEvRCxFQUNJLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFJLE9BQU8sQ0FBQyxjQUFaLENBQTJCO0FBQzVDLEVBQUEsTUFBTSxFQUFFLFlBRG9DO0FBRTVDLEVBQUEsUUFBUSxFQUFFLGtCQUFLLFFBQUwsQ0FDTix5QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBRHBCLEVBRU4seUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUE0QixtQkFGdEI7QUFGa0MsQ0FBM0IsQ0FBckIsRSxDQU1KO0FBQ0E7O0FBQ0EsSUFBSSx5QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLEtBQTZDLGNBQWpEO0FBQ0k7Ozs7OztBQU1BLDJCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsT0FBakM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlDQUEyQyxrQkFDdkMsT0FEdUMsRUFDdkIsT0FEdUIsRUFDUCxRQURPO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFHdkMsY0FBQSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsS0FBaEIsRUFBdUIsRUFBdkIsQ0FBVjtBQUNBLGtCQUFJLE9BQU8sQ0FBQyxVQUFSLENBQW1CLEdBQW5CLENBQUosRUFDSSxPQUFPLEdBQUcsa0JBQUssUUFBTCxDQUFjLHlCQUFjLElBQWQsQ0FBbUIsT0FBakMsRUFBMEMsT0FBMUMsQ0FBVjtBQUxtQztBQUFBO0FBQUE7QUFBQTtBQUFBLDJCQU1ULHlCQUFjLE1BQWQsQ0FBcUIsY0FOWjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU01QixjQUFBLFNBTjRCOztBQUFBLG1CQU8vQixPQUFPLENBQUMsVUFBUixDQUFtQixTQUFuQixDQVArQjtBQUFBO0FBQUE7QUFBQTs7QUFRL0IsY0FBQSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsU0FBUSxDQUFDLE1BQTNCLENBQVY7QUFDQSxrQkFBSSxPQUFPLENBQUMsVUFBUixDQUFtQixHQUFuQixDQUFKLEVBQ0ksT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFSLENBQWtCLENBQWxCLENBQVY7QUFWMkI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQWF2QztBQUNNLGNBQUEsUUFkaUMsR0FjZCxtQkFBTyx1QkFBUCxDQUNyQixPQURxQixFQUVyQixFQUZxQixFQUdyQixFQUhxQixFQUlyQjtBQUNJLGdCQUFBLElBQUksRUFBRSx5QkFBYyxVQUFkLENBQXlCLElBQXpCLENBQThCLFFBRHhDO0FBRUksZ0JBQUEsTUFBTSxFQUFFLHlCQUFjLFVBQWQsQ0FBeUI7QUFGckMsZUFKcUIsRUFRckIseUJBQWMsSUFBZCxDQUFtQixPQVJFLEVBU3JCLE9BVHFCLEVBVXJCLHlCQUFjLElBQWQsQ0FBbUIsTUFWRSxFQVdyQix5QkFBYyxNQUFkLENBQXFCLGNBWEEsRUFZckIsb0NBQXNCLElBQXRCLENBQTJCLFNBWk4sRUFhckIsb0NBQXNCLElBQXRCLENBQTJCLGFBYk4sRUFjckIsb0NBQXNCLGtCQWRELEVBZXJCLHlCQUFjLFFBZk8sQ0FkYzs7QUFBQSxtQkErQm5DLFFBL0JtQztBQUFBO0FBQUE7QUFBQTs7QUFBQSwwREFpQ1AseUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUNuQixPQWxDMEI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFpQ3pCLGNBQUEsT0FqQ3lCOztBQUFBLG9CQXFDM0IseUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUFqQyxDQUF5QyxjQUF6QyxDQUNJLE9BREosS0FFQSxPQUFPLENBQUMsVUFBUixDQUFtQixHQUFuQixDQXZDMkI7QUFBQTtBQUFBO0FBQUE7O0FBeUNyQixjQUFBLGlCQXpDcUIsR0F5Q00sSUFBSSxNQUFKLENBQVcsT0FBWCxDQXpDTjs7QUFBQSxtQkEwQ3ZCLGlCQUFpQixDQUFDLElBQWxCLENBQXVCLFFBQXZCLENBMUN1QjtBQUFBO0FBQUE7QUFBQTs7QUEyQ25CLGNBQUEsS0EzQ21CLEdBMkNILEtBM0NHO0FBNENqQixjQUFBLG1CQTVDaUIsR0E2Q25CLHlCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsT0FBakMsQ0FBeUMsT0FBekMsQ0E3Q21CO0FBOENqQixjQUFBLDRCQTlDaUIsR0E4Q3FCLElBQUksTUFBSixDQUN4QyxNQUFNLENBQUMsSUFBUCxDQUFZLG1CQUFaLEVBQWlDLENBQWpDLENBRHdDLENBOUNyQjtBQWdEbkIsY0FBQSxNQWhEbUIsR0FnREgsbUJBQW1CLENBQ25DLE1BQU0sQ0FBQyxJQUFQLENBQVksbUJBQVosRUFBaUMsQ0FBakMsQ0FEbUMsQ0FoRGhCOztBQW1EdkIsa0JBQUksTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FBSixFQUE0QjtBQUN4QixnQkFBQSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVAsQ0FBaUIsQ0FBakIsQ0FBVDtBQUNNLGdCQUFBLGNBRmtCLEdBRU0sT0FBTyxDQUFDLE9BQVIsQ0FDMUIsNEJBRDBCLEVBQ0ksTUFESixDQUZOO0FBSXhCLG9CQUFJLGNBQWMsS0FBSyxPQUF2QixFQUNJLEtBQUssR0FBRyxPQUFPLENBQUMsbUJBQU8sdUJBQVAsQ0FDWixjQURZLEVBRVosRUFGWSxFQUdaLEVBSFksRUFJWjtBQUNJLGtCQUFBLElBQUksRUFBRSx5QkFBYyxVQUFkLENBQXlCLElBQXpCLENBQ0QsUUFGVDtBQUdJLGtCQUFBLE1BQU0sRUFBRSx5QkFBYyxVQUFkLENBQXlCO0FBSHJDLGlCQUpZLEVBU1oseUJBQWMsSUFBZCxDQUFtQixPQVRQLEVBVVosT0FWWSxFQVdaLHlCQUFjLElBQWQsQ0FBbUIsTUFYUCxFQVlaLHlCQUFjLE1BQWQsQ0FBcUIsY0FaVCxFQWFaLG9DQUFzQixJQUF0QixDQUEyQixTQWJmLEVBY1osb0NBQXNCLElBQXRCLENBQTJCLGFBZGYsRUFlWixvQ0FBc0Isa0JBZlYsRUFnQloseUJBQWMsUUFoQkYsQ0FBRCxDQUFmO0FBa0JQLGVBdkJELE1Bd0JJLEtBQUssR0FBRyxJQUFSOztBQTNFbUIsbUJBNEVuQixLQTVFbUI7QUFBQTtBQUFBO0FBQUE7O0FBNkVuQixjQUFBLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBUixDQUNOLDRCQURNLEVBQ3dCLE1BRHhCLENBQVY7QUE3RW1COztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQW1GdkM7QUFDTSxjQUFBLGVBcEZpQyxHQW9GUCxtQkFBTyx3QkFBUCxDQUM1QixPQUQ0QixFQUU1Qix5QkFBYyxJQUFkLENBQW1CLE9BRlMsRUFHNUIsT0FINEIsRUFJNUIseUJBQWMsU0FBZCxDQUF3QixLQUF4QixDQUE4QixVQUpGLEVBSzVCLHlCQUFjLE1BQWQsQ0FBcUIsY0FMTyxFQU01Qix5QkFBYyxNQUFkLENBQXFCLE9BTk8sRUFPNUIseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxNQVBOLEVBUTVCLHlCQUFjLFVBUmMsRUFTNUIseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxJQVRKLEVBVTVCLHlCQUFjLElBQWQsQ0FBbUIsTUFWUyxFQVc1Qix5QkFBYyxNQUFkLENBQXFCLGNBWE8sRUFZNUIsb0NBQXNCLElBQXRCLENBQTJCLFNBWkMsRUFhNUIsb0NBQXNCLElBQXRCLENBQTJCLGFBYkMsRUFjNUIsb0NBQXNCLGtCQWRNLEVBZTVCLHlCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsUUFBakMsQ0FBMEMsT0FBMUMsQ0FBa0QsT0FmdEIsRUFnQjVCLHlCQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsUUFBakMsQ0FBMEMsT0FBMUMsQ0FBa0QsT0FoQnRCLEVBaUI1Qix5QkFBYyxPQUFkLENBQXNCLGVBQXRCLENBQXNDLE1BakJWLEVBa0I1Qix5QkFBYyxPQUFkLENBQXNCLGVBQXRCLENBQXNDLE9BbEJWLEVBbUI1Qix5QkFBYyxRQW5CYyxDQXBGTzs7QUFBQSxtQkF5R25DLGVBekdtQztBQUFBO0FBQUE7QUFBQTs7QUEwRzdCLGNBQUEsSUExRzZCLEdBMEdSLENBQ3ZCLEtBRHVCLEVBQ2hCLFVBRGdCLEVBQ0osV0FESSxFQUNTLE1BRFQsQ0ExR1E7QUE0Ry9CLGNBQUEsTUE1RytCLEdBNEdILGVBNUdHOztBQUFBLG1CQTZHL0IseUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUFqQyxDQUF5QyxjQUF6QyxDQUNBLE9BREEsQ0E3RytCO0FBQUE7QUFBQTtBQUFBOztBQWdIL0I7QUFDQSxjQUFBLE1BQU0sR0FBRztBQUFDLDJCQUFTO0FBQVYsZUFBVDs7QUFqSCtCLG9CQW1IM0IsT0FBTyx5QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLENBQ0gsT0FERyxDQUFQLEtBRU0sUUFySHFCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXVIM0IsZ0NBQXlCLElBQXpCO0FBQVcsZ0JBQUEsS0FBWDtBQUNJLGdCQUFBLE1BQU0sQ0FBQyxLQUFELENBQU4sR0FDSSx5QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLENBQXlDLE9BQXpDLENBREo7QUFESjs7QUF2SDJCO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG9CQTJIM0IsT0FBTyx5QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLENBQ0gsT0FERyxDQUFQLEtBRU0sVUE3SHFCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQStIM0IsZ0NBQXlCLElBQXpCO0FBQVcsZ0JBQUEsS0FBWDtBQUNJLGdCQUFBLE1BQU0sQ0FBQyxLQUFELENBQU4sR0FDSSx5QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLENBQXlDLE9BQXpDLEVBQ0ksT0FESixFQUNhLEtBRGIsQ0FESjtBQURKOztBQS9IMkI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBbUkxQixrQkFDRCx5QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLENBQ0ksT0FESixNQUVNLElBRk4sSUFHQSx5QkFBTyx5QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLE9BQWpDLENBQ0gsT0FERyxDQUFQLE1BRU0sUUFOTCxFQVFELHVCQUFNLE1BQU4sQ0FDSSxNQURKLEVBRUkseUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQUFqQyxDQUF5QyxPQUF6QyxDQUZKOztBQTNJMkI7QUFBQSxtQkE4STNCLE1BQU0sQ0FBQyxjQUFQLENBQXNCLFNBQXRCLENBOUkyQjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUErSTNCLGdDQUF5QixJQUF6QjtBQUFXLGdCQUFBLEtBQVg7QUFDSSxvQkFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFQLENBQXNCLEtBQXRCLENBQUwsRUFDSSxNQUFNLENBQUMsS0FBRCxDQUFOLEdBQWMsTUFBTSxXQUFwQjtBQUZSOztBQS9JMkI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFvSm5DLGtCQUFJLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQXRCLENBQUosRUFDSTtBQUNBLGdCQUFBLE1BQU0sQ0FBQyxJQUFQLEdBQWMsR0FBRyxNQUFILENBQVUsTUFBTSxDQUFDLElBQWpCLEVBQXVCLEdBQXZCLENBQTJCLFVBQ3JDLElBRHFDO0FBQUEseUJBRTdCLHVCQUFNLGdDQUFOLENBQXVDLElBQXZDLENBRjZCO0FBQUEsaUJBQTNCLENBQWQ7QUFHRSxjQUFBLFlBeko2QixHQTBKL0IseUJBQWMsWUFBZCxDQUEyQixRQUEzQixJQUNBLHlCQUFjLFlBQWQsQ0FBMkIsSUEzSkk7QUFBQSxnREE2SjVCLFFBQVEsQ0FDWCxJQURXLEVBRVgsWUFBWSxLQUFLLEtBQWpCLElBQTBCLE9BQU8sTUFBUCxLQUFrQixRQUE1QyxHQUNJLE1BREosR0FFSSxNQUFNLENBQUMsWUFBRCxDQUpDLEVBS1gsWUFMVyxDQTdKb0I7O0FBQUE7QUFBQSxnREFxS2hDLFFBQVEsRUFyS3dCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEtBQTNDOztBQUFBO0FBQUE7QUFBQTtBQUFBLE0sQ0F1S0o7QUFDQTs7QUFDQSxJQUFJLHlCQUFjLHlCQUFkLENBQXdDLENBQXhDLE1BQStDLFdBQW5ELEVBQWdFO0FBQzVELE1BQUksY0FBc0IsR0FBRyxLQUE3Qjs7QUFDQSxPQUFLLElBQU0sVUFBWCxJQUErQix5QkFBYyxTQUFkLENBQXdCLEtBQXhCLENBQThCLFVBQTdEO0FBQ0ksUUFBSSx5QkFBYyxTQUFkLENBQXdCLEtBQXhCLENBQThCLFVBQTlCLENBQXlDLGNBQXpDLENBQ0EsVUFEQSxDQUFKLEVBR0ksSUFBSSx5QkFBYyxTQUFkLENBQXdCLGFBQXhCLENBQXNDLFFBQXRDLENBQStDLFVBQS9DLENBQUosRUFDSSxjQUFjLEdBQUcsSUFBakIsQ0FESixLQUdJLE9BQU8seUJBQWMsU0FBZCxDQUF3QixLQUF4QixDQUE4QixVQUE5QixDQUF5QyxVQUF6QyxDQUFQO0FBUFo7O0FBUUEsTUFBSSxjQUFKLEVBQW9CO0FBQ2hCLElBQUEsV0FBVyxHQUFHLGtCQUFkO0FBQ0EsSUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBSSxvQkFBUSxTQUFaLENBQXNCO0FBQ3ZDLE1BQUEsSUFBSSxZQUFLLHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFBL0IsOEJBRG1DO0FBRXZDLE1BQUEsSUFBSSxFQUFFO0FBRmlDLEtBQXRCLENBQXJCO0FBSUgsR0FORCxNQU9JLE9BQU8sQ0FBQyxJQUFSLENBQWEsd0JBQWI7QUFDUCxDLENBQ0Q7QUFDQTtBQUNBOzs7QUFDQSxJQUFJLGFBQUosRUFDSSxlQUFlLENBQUMsSUFBaEIsQ0FBcUI7QUFBQyxFQUFBLEtBQUssRUFBRSxlQUN6QixRQUR5QjtBQUFBLFdBRW5CLFFBQVEsQ0FBQyxLQUFULENBQWUsV0FBZixDQUEyQixHQUEzQixDQUErQixhQUEvQixFQUE4QyxVQUNwRCxXQURvRCxFQUU5QztBQUNOLE1BQUEsV0FBVyxDQUFDLEtBQVosQ0FBa0IsK0JBQWxCLENBQWtELFFBQWxELENBQ0kscUJBREosRUFFSSxVQUFDLElBQUQsRUFBbUIsUUFBbkIsRUFBOEM7QUFDMUMsa0NBQXNDLENBQ2xDLElBQUksQ0FBQyxJQUQ2QixFQUN2QixJQUFJLENBQUMsSUFEa0IsQ0FBdEMsNkJBRUc7QUFGRSxjQUFNLElBQXVCLGFBQTdCO0FBR0QsY0FBSSxNQUFZLEdBQUcsQ0FBbkI7QUFERDtBQUFBO0FBQUE7O0FBQUE7QUFFQyxrQ0FBOEIsSUFBOUIsbUlBQW9DO0FBQUEsa0JBQXpCLEdBQXlCO0FBQ2hDLGtCQUFJLHVCQUF1QixJQUF2QixDQUE0QixrQkFBSyxRQUFMLENBQzVCLEdBQUcsQ0FBQyxVQUFKLENBQWUsR0FBZixJQUFzQixHQUFHLENBQUMsVUFBSixDQUFlLElBQXJDLElBQTZDLEVBRGpCLENBQTVCLENBQUosRUFHSSxJQUFJLENBQUMsTUFBTCxDQUFZLE1BQVosRUFBbUIsQ0FBbkI7QUFDSixjQUFBLE1BQUssSUFBSSxDQUFUO0FBQ0g7QUFSRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBU0Y7O0FBQ0QsWUFBTSxNQUFvQixHQUFHLElBQUksQ0FBQyxLQUFMLENBQ3pCLElBQUksQ0FBQyxNQUFMLENBQVksU0FEYSxDQUE3QjtBQUVBLFlBQUksS0FBWSxHQUFHLENBQW5CO0FBZjBDO0FBQUE7QUFBQTs7QUFBQTtBQWdCMUMsZ0NBQWtDLE1BQWxDLG1JQUEwQztBQUFBLGdCQUEvQixZQUErQjtBQUN0QyxnQkFBSSx1QkFBdUIsSUFBdkIsQ0FBNEIsa0JBQUssUUFBTCxDQUM1QixZQUQ0QixDQUE1QixDQUFKLEVBR0ksTUFBTSxDQUFDLE1BQVAsQ0FBYyxLQUFkLEVBQXFCLENBQXJCO0FBQ0osWUFBQSxLQUFLLElBQUksQ0FBVDtBQUNIO0FBdEJ5QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXVCMUMsUUFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLFNBQVosR0FBd0IsSUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFmLENBQXhCO0FBQ0EsUUFBQSxRQUFRLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FBUjtBQUNILE9BM0JMO0FBNEJBLE1BQUEsV0FBVyxDQUFDLEtBQVosQ0FBa0Isb0NBQWxCLENBQXVELFFBQXZELENBQ0ksaUJBREosRUFFSSxVQUFDLElBQUQsRUFBbUIsUUFBbkIsRUFBOEM7QUFDMUM7Ozs7O0FBS0EsWUFBTSxhQUEyQixHQUFHLEVBQXBDO0FBQ0EsUUFBQSxJQUFJLENBQUMsSUFBTCxHQUFZLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixDQUNSLDRDQURRLEVBRVIsVUFDSSxLQURKLEVBRUksUUFGSixFQUdJLE9BSEosRUFJSSxNQUpKLEVBS1k7QUFDUixVQUFBLGFBQWEsQ0FBQyxJQUFkLENBQW1CLE9BQW5CO0FBQ0EsMkJBQVUsUUFBVixTQUFxQixNQUFyQjtBQUNILFNBVk8sQ0FBWjtBQVdBLFlBQUksR0FBSjs7QUFDQSxZQUFJO0FBQ0E7Ozs7O0FBS0EsVUFBQSxHQUFHLEdBQUcsSUFBSSxZQUFKLENBQ0YsSUFBSSxDQUFDLElBQUwsQ0FDSyxPQURMLENBQ2EsS0FEYixFQUNvQixXQURwQixFQUVLLE9BRkwsQ0FFYSxLQUZiLEVBRW9CLFdBRnBCLENBREUsQ0FBTjtBQUtILFNBWEQsQ0FXRSxPQUFPLEtBQVAsRUFBYztBQUNaLGlCQUFPLFFBQVEsQ0FBQyxLQUFELEVBQVEsSUFBUixDQUFmO0FBQ0g7O0FBQ0QsWUFBTSxTQUErQixHQUFHO0FBQ3BDLFVBQUEsSUFBSSxFQUFFLE1BRDhCO0FBRXBDLFVBQUEsTUFBTSxFQUFFO0FBRjRCLFNBQXhDOztBQUlBLGFBQUssSUFBTSxPQUFYLElBQTZCLFNBQTdCO0FBQ0ksY0FBSSxTQUFTLENBQUMsY0FBVixDQUF5QixPQUF6QixDQUFKO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0kscUNBRUksR0FBRyxDQUFDLE1BQUosQ0FBVyxRQUFYLENBQW9CLGdCQUFwQixDQUNJLFVBQUcsT0FBSCxjQUFjLFNBQVMsQ0FBQyxPQUFELENBQXZCLHVCQUNHLHlCQUFjLGFBRGpCLFNBREosQ0FGSjtBQUFBLG9CQUNVLE9BRFY7O0FBTUk7Ozs7O0FBS0EsZ0JBQUEsT0FBTyxDQUFDLFlBQVIsQ0FDSSxTQUFTLENBQUMsT0FBRCxDQURiLEVBRUksT0FBTyxDQUFDLFlBQVIsQ0FDSSxTQUFTLENBQUMsT0FBRCxDQURiLEVBRUUsT0FGRixDQUVVLElBQUksTUFBSixDQUNOLGNBQU8seUJBQWMsYUFBckIsU0FDQSxXQUZNLENBRlYsRUFLRyxJQUxILENBRko7QUFYSjtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURKO0FBcUJBOzs7Ozs7QUFJQSxRQUFBLElBQUksQ0FBQyxJQUFMLEdBQVksR0FBRyxDQUFDLFNBQUosR0FDUCxPQURPLENBQ0MsZUFERCxFQUNrQixJQURsQixFQUVQLE9BRk8sQ0FFQyxZQUZELEVBRWUsSUFGZixFQUdQLE9BSE8sQ0FHQywwQ0FIRCxFQUc2QyxVQUNqRCxLQURpRCxFQUVqRCxRQUZpRCxFQUdqRCxNQUhpRDtBQUFBLDJCQUs5QyxRQUw4QyxTQUtuQyxhQUFhLENBQUMsS0FBZCxFQUxtQyxTQUtYLE1BTFc7QUFBQSxTQUg3QyxDQUFaLENBOUQwQyxDQXVFMUM7O0FBdkUwQztBQUFBO0FBQUE7O0FBQUE7QUF3RTFDLGlDQUVJLHlCQUFjLEtBQWQsQ0FBb0IsSUFGeEI7QUFBQSxnQkFDVSxxQkFEVjs7QUFJSSxnQkFDSSxxQkFBcUIsQ0FBQyxRQUF0QixLQUNBLElBQUksQ0FBQyxNQUFMLENBQVksT0FBWixDQUFvQixRQUZ4QixFQUdFO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ0UsdUNBRUkscUJBQXFCLENBQUMsUUFBdEIsQ0FBK0IsR0FGbkM7QUFBQSxzQkFDVSxtQkFEVjtBQUlJLHNCQUNJLG1CQUFtQixDQUFDLGNBQXBCLENBQ0ksU0FESixLQUVBLG1CQUFtQixDQUFDLE9BQXBCLENBQTRCLGNBQTVCLENBQ0ksY0FESixDQUZBLElBS0EsT0FBTyxtQkFBbUIsQ0FBQyxPQUFwQixDQUE0QixZQUFuQyxLQUNRLFFBUFosRUFTSSxJQUFJLENBQUMsSUFBTCxHQUFZLHNCQUFVLElBQVYsQ0FDUix1QkFBTSxNQUFOLENBQ0ksSUFESixFQUVJLEVBRkosRUFHSTtBQUFDLG9CQUFBLE9BQU8sRUFDSixtQkFBbUIsQ0FBQyxPQUFwQixJQUErQjtBQURuQyxtQkFISixFQU1JO0FBQUMsb0JBQUEsT0FBTyxFQUFFO0FBQ04sc0JBQUEsWUFBWSxFQUFFLHFCQUFxQixDQUM5QixRQURTLENBQ0E7QUFGUjtBQUFWLG1CQU5KLENBRFEsRUFZVixJQUFJLENBQUMsSUFaSyxDQUFaO0FBYlI7QUFERjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTJCRTtBQUNIO0FBbkNMLFdBeEUwQyxDQTRHMUM7O0FBNUcwQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTZHMUMsUUFBQSxRQUFRLENBQUMsSUFBRCxFQUFPLElBQVAsQ0FBUjtBQUNILE9BaEhMO0FBa0hILEtBakpTLENBRm1CO0FBQUE7QUFBUixDQUFyQixFLENBb0pKO0FBQ0E7QUFDQTtBQUNBOztBQUNBLElBQUksT0FBTyxDQUFDLFFBQVosRUFDSSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBSSxPQUFPLENBQUMsUUFBWixDQUNqQix5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLEtBQS9CLENBQXFDLE9BRHBCLENBQXJCLEUsQ0FFSjtBQUNBOzs7Ozs7O0FBQ0EseUJBRUkseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxPQUZ0QztBQUFBLFFBQ1Usa0JBRFY7QUFJSSxJQUFBLGVBQWUsQ0FBQyxJQUFoQiw2QkFBeUIsb0JBQVEsd0JBQWpDLHNDQUNPLGtCQUFrQixDQUFDLEdBQW5CLENBQXVCLFVBQUMsS0FBRDtBQUFBLGFBQXVCLElBQUksUUFBSixDQUM3QyxlQUQ2QyxFQUM1QixXQUQ0QixFQUNmLFlBRGUsbUJBQ1MsS0FEVCxFQUVqRDtBQUZpRCxPQUFELENBRzdDLHdCQUg2QyxFQUc5QixTQUg4QixFQUduQixVQUhtQixDQUF0QjtBQUFBLEtBQXZCLENBRFA7QUFKSixHLENBU0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBSSxvQkFBUSw2QkFBWixDQUNqQiwrQkFEaUIsRUFFakIsVUFBQyxRQUFELEVBQXFEO0FBQ2pELE1BQU0sVUFBaUIsR0FBRyxRQUFRLENBQUMsT0FBVCxHQUFtQixTQUFuQixHQUErQixVQUF6RDtBQUNBLE1BQU0sVUFBaUIsR0FBRyxRQUFRLENBQUMsVUFBRCxDQUFsQzs7QUFDQSxNQUFJLHVCQUFNLFVBQU4sQ0FBaUIsVUFBakIsQ0FBSixFQUFrQztBQUM5QixRQUFNLGlCQUE4QixHQUNoQyxtQkFBTywyQkFBUCxDQUFtQyxVQUFuQyxDQURKOztBQUVBLFFBQUksaUJBQUosRUFBdUI7QUFDbkI7QUFDQSxVQUFNLFlBQTBCLEdBQUcsVUFBVSxDQUFDLEtBQVgsQ0FDL0IsOEJBRCtCLENBQW5DLENBRm1CLENBSW5COztBQUNBLE1BQUEsWUFBWSxDQUFDLEdBQWI7QUFDQSxVQUFJLEtBQVksR0FBRyxDQUFuQjtBQU5tQjtBQUFBO0FBQUE7O0FBQUE7QUFPbkIsK0JBQWdDLFlBQWhDLHdJQUE4QztBQUFBLGNBQW5DLFVBQW1DO0FBQzFDLGNBQUksS0FBSyxHQUFHLENBQVosRUFDSSxZQUFZLENBQUMsS0FBRCxDQUFaLEdBQXNCLGtCQUFLLE9BQUwsQ0FDbEIsWUFBWSxDQUFDLEtBQUssR0FBRyxDQUFULENBRE0sRUFDTyxVQURQLENBQXRCO0FBRUosVUFBQSxLQUFLLElBQUksQ0FBVDtBQUNIO0FBWmtCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYW5CLFVBQU0sVUFBaUIsR0FBRyxVQUFVLENBQUMsT0FBWCxDQUN0QiwrQkFEc0IsRUFDVyxJQURYLENBQTFCO0FBRUEsVUFBSSxnQkFBNkIsR0FBRyxJQUFwQztBQWZtQjtBQUFBO0FBQUE7O0FBQUE7QUFnQm5CLCtCQUFnQyxZQUFoQyx3SUFBOEM7QUFBQSxjQUFuQyxXQUFtQzs7QUFDMUMsY0FBTSxtQkFBMEIsR0FBRyxrQkFBSyxPQUFMLENBQy9CLFdBRCtCLEVBQ25CLFVBRG1CLENBQW5DOztBQUVBLGNBQUksdUJBQU0sVUFBTixDQUFpQixtQkFBakIsQ0FBSixFQUEyQztBQUN2QyxnQkFBTSwwQkFBc0MsR0FDeEMsbUJBQU8sMkJBQVAsQ0FDSSxtQkFESixDQURKOztBQUdBLGdCQUNJLGlCQUFpQixDQUFDLGFBQWxCLENBQWdDLE9BQWhDLEtBQ0EsMEJBQTBCLENBQUMsYUFBM0IsQ0FBeUMsT0FGN0MsRUFHRTtBQUNFLGNBQUEsT0FBTyxDQUFDLElBQVIsQ0FDSSx1Q0FBK0IsVUFBL0IsMEJBQ08sbUJBRFAsUUFESjtBQUlBLGNBQUEsUUFBUSxDQUFDLFVBQUQsQ0FBUixHQUF1QixtQkFBdkI7QUFDQTtBQUNILGFBVkQsTUFXSSxnQkFBZ0IsR0FBRztBQUNmLGNBQUEsSUFBSSxFQUFFLG1CQURTO0FBRWYsY0FBQSxPQUFPLEVBQUUsMEJBQTBCLENBQzlCLGFBREksQ0FDVTtBQUhKLGFBQW5CO0FBS1A7QUFDSjtBQXhDa0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUF5Q25CLFVBQUksZ0JBQUosRUFDSSxPQUFPLENBQUMsSUFBUixDQUNJLDZEQUNHLGlCQUFpQixDQUFDLGFBQWxCLENBQWdDLElBRG5DLCtCQUVHLFVBRkgsOEJBR0csaUJBQWlCLENBQUMsYUFBbEIsQ0FBZ0MsT0FIbkMsNENBSXNCLGdCQUFnQixDQUFDLElBSnZDLDhCQUtXLGdCQUFnQixDQUFDLE9BTDVCLE9BREo7QUFRUDtBQUNKO0FBQ0osQ0E1RGdCLENBQXJCLEUsQ0E4REE7QUFDQTtBQUNBOztBQUNBLElBQU0sd0JBQWlDLEdBQUcsU0FBcEMsd0JBQW9DLENBQUMsUUFBRCxFQUE2QjtBQUNuRSxFQUFBLFFBQVEsR0FBRyxtQkFBTyxXQUFQLENBQW1CLFFBQW5CLENBQVg7QUFDQSxTQUFPLG1CQUFPLG9CQUFQLENBQ0gsUUFERyxFQUVILHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsTUFBMUIsQ0FDSSx5QkFBYyxNQUFkLENBQXFCLGNBRHpCLEVBRUkseUJBQWMsTUFBZCxDQUFxQixjQUZ6QixFQUdFLEdBSEYsQ0FHTSxVQUFDLFFBQUQ7QUFBQSxXQUE0QixrQkFBSyxPQUFMLENBQzlCLHlCQUFjLElBQWQsQ0FBbUIsT0FEVyxFQUNGLFFBREUsQ0FBNUI7QUFBQSxHQUhOLEVBS0UsTUFMRixDQUtTLFVBQUMsUUFBRDtBQUFBLFdBQ0wsQ0FBQyx5QkFBYyxJQUFkLENBQW1CLE9BQW5CLENBQTJCLFVBQTNCLENBQXNDLFFBQXRDLENBREk7QUFBQSxHQUxULENBRkcsQ0FBUDtBQVdILENBYkQ7O0FBY0EsSUFBTSxjQUF1QixHQUFHLFNBQTFCLGNBQTBCLENBQzVCLG1CQUQ0QjtBQUFBLFNBRWQ7QUFDZCxJQUFBLE9BQU8sRUFBRSxpQkFBQyxRQUFEO0FBQUEsYUFBNkIsUUFBUSxDQUMxQyxtQkFBbUIsQ0FBQyxPQUFwQixJQUErQixPQURXLEVBQ0YsUUFERSxDQUFyQztBQUFBLEtBREs7QUFHZCxJQUFBLE9BQU8sRUFDSCxtQkFBbUIsQ0FBQyxPQUFwQixJQUNBLFFBQVEsQ0FDSixtQkFBbUIsQ0FBQyxPQURoQixFQUN5Qix5QkFBYyxJQUFkLENBQW1CLE9BRDVDLENBRFIsSUFHQSx5QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBUGhCO0FBUWQsSUFBQSxJQUFJLEVBQUUsSUFBSSxNQUFKLENBQVcsUUFBUSxDQUNyQixtQkFBbUIsQ0FBQyxJQURDLEVBQ0sseUJBQWMsSUFBZCxDQUFtQixPQUR4QixDQUFuQixDQVJRO0FBVWQsSUFBQSxHQUFHLEVBQUUsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEdBQXJCO0FBVkMsR0FGYztBQUFBLENBQWhDOztBQWNBLElBQU0sTUFBYSxHQUFHLEVBQXRCO0FBQ0EsSUFBTSxLQUFZLEdBQUc7QUFDakIsRUFBQSxhQUFhLEVBQWIsd0JBRGlCO0FBRWpCLEVBQUEsd0JBQXdCLEVBQXhCLHdCQUZpQjtBQUdqQixFQUFBLE1BQU0sRUFBTixNQUhpQjtBQUlqQixFQUFBLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBRDtBQUpJLENBQXJCOztBQU1BLElBQU0sUUFBaUIsR0FBRyxTQUFwQixRQUFvQixDQUFDLElBQUQsRUFBYyxRQUFkO0FBQUEsU0FBc0MsNEJBQUssUUFBTCxHQUM1RDtBQUNBLFlBRjRELDZDQUU3QyxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVosQ0FGNkMscUJBRWYsSUFGZSxFQUdoRTtBQUhnRSxxQkFJN0QsUUFKNkQsNkNBSWhELE1BQU0sQ0FBQyxNQUFQLENBQWMsS0FBZCxDQUpnRCxHQUF0QztBQUFBLENBQTFCOztBQUtBLElBQU0sY0FBNEIsR0FBRyxtQkFBTyxjQUFQLENBQXNCLENBQ3ZELHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsVUFEdUIsRUFFekQsTUFGeUQsQ0FFbEQseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixjQUZtQixDQUF0QixDQUFyQzs7QUFHQSx1QkFBTSxNQUFOLENBQWEsTUFBYixFQUFxQjtBQUNqQjtBQUNBO0FBQ0EsRUFBQSxHQUFHLEVBQUU7QUFDRCxJQUFBLE9BQU8sRUFBRSxpQkFBQyxRQUFEO0FBQUEsYUFBNkIsbUJBQU8sY0FBUCxDQUNsQyx5QkFBYyxLQUFkLENBQW9CLElBQXBCLENBQXlCLE1BQXpCLENBQ0kseUJBQWMsS0FBZCxDQUFvQixXQUR4QixFQUVFLEdBRkYsQ0FFTSxVQUFDLGlCQUFEO0FBQUEsZUFDRixpQkFBaUIsQ0FBQyxRQUFsQixDQUEyQixRQUR6QjtBQUFBLE9BRk4sQ0FEa0MsRUFLcEMsUUFMb0MsQ0FLM0IsUUFMMkIsTUFNaEMseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxHQUFsQyxDQUFzQyxPQUF0QyxLQUFrRCxJQUFuRCxHQUNHLEtBREgsR0FFRyxRQUFRLENBQ0oseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxHQUFsQyxDQUFzQyxPQURsQyxFQUMyQyxRQUQzQyxDQVJzQixDQUE3QjtBQUFBLEtBRFI7QUFXRCxJQUFBLE9BQU8sRUFBRSxjQVhSO0FBWUQsSUFBQSxJQUFJLEVBQUUsOEJBWkw7QUFhRCxJQUFBLEdBQUcsRUFBRSx5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLEdBQWxDLENBQXNDLFVBQXRDLENBQWlELEdBQWpELENBQXFELEdBQXJELENBQ0QsUUFEQyxFQUVILE1BRkcsQ0FHRDtBQUFDLE1BQUEsTUFBTSxFQUFFLDRCQUE0QixPQUFPLENBQ3hDLENBQUMseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxHQUFsQyxDQUFzQyxPQUF0QyxJQUFpRDtBQUM5QyxRQUFBLFlBQVksRUFBRTtBQURnQyxPQUFsRCxFQUVHLFlBRkgsR0FFa0IsQ0FIc0IsQ0FBUCxHQUlqQyxLQUppQyxHQUl6QixFQUpILGVBSWEseUJBQWMsYUFKM0I7QUFBVCxLQUhDLEVBUUQ7QUFBQyxNQUFBLE1BQU0sRUFBRTtBQUFULEtBUkMsRUFTRDtBQUNJLE1BQUEsTUFBTSxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsR0FBbEMsQ0FBc0MsTUFEbEQ7QUFFSSxNQUFBLE9BQU8sRUFBRSx5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLEdBQWxDLENBQXNDLE9BQXRDLElBQWlEO0FBRjlELEtBVEMsRUFhRCx5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLEdBQWxDLENBQXNDLFVBQXRDLENBQWlELElBQWpELENBQXNELEdBQXRELENBQ0ksUUFESixDQWJDO0FBYkosR0FIWTtBQWdDakI7QUFDQTtBQUNBLEVBQUEsTUFBTSxFQUFFO0FBQ0osSUFBQSxPQUFPLEVBQUUsaUJBQUMsUUFBRDtBQUFBLGFBQTZCLFFBQVEsQ0FDMUMseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxVQUFsQyxDQUE2QyxPQURILEVBQ1ksUUFEWixDQUFyQztBQUFBLEtBREw7QUFJSixJQUFBLE9BQU8sRUFBRSxpQkFBQyxRQUFELEVBQTZCO0FBQ2xDLFVBQU0sTUFBVSxHQUFHLFFBQVEsQ0FDdkIseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxVQUFsQyxDQUE2QyxPQUR0QixFQUMrQixRQUQvQixDQUEzQjs7QUFFQSxVQUFJLENBQUMsSUFBRCxFQUFPLFNBQVAsRUFBa0IsUUFBbEIsQ0FBMkIsTUFBM0IsQ0FBSixFQUF3QztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNwQyxpQ0FBaUMsY0FBakM7QUFBQSxnQkFBVyxXQUFYO0FBQ0ksZ0JBQUksUUFBUSxDQUFDLFVBQVQsQ0FBb0IsV0FBcEIsQ0FBSixFQUNJLE9BQU8sSUFBUDtBQUZSO0FBRG9DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBSXBDLGVBQU8sS0FBUDtBQUNIOztBQUNELGFBQU8sT0FBTyxDQUFDLE1BQUQsQ0FBZDtBQUNILEtBZEc7QUFlSixJQUFBLElBQUksRUFBRSxJQUFJLE1BQUosQ0FDRix5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLFVBQWxDLENBQTZDLGlCQUQzQyxFQUM4RCxHQUQ5RCxDQWZGO0FBa0JKLElBQUEsR0FBRyxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsVUFBbEMsQ0FBNkMsVUFBN0MsQ0FBd0QsR0FBeEQsQ0FBNEQsR0FBNUQsQ0FDRCxRQURDLEVBRUgsTUFGRyxDQUdEO0FBQ0ksTUFBQSxNQUFNLEVBQUUseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxVQUFsQyxDQUE2QyxNQUR6RDtBQUVJLE1BQUEsT0FBTyxFQUNILHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsVUFBbEMsQ0FBNkMsT0FBN0MsSUFBd0Q7QUFIaEUsS0FIQyxFQVFELHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsVUFBbEMsQ0FBNkMsVUFBN0MsQ0FBd0QsSUFBeEQsQ0FBNkQsR0FBN0QsQ0FDSSxRQURKLENBUkM7QUFsQkQsR0FsQ1M7QUErRGpCO0FBQ0E7QUFDQSxFQUFBLElBQUksRUFBRTtBQUNGO0FBQ0EsSUFBQSxJQUFJLEVBQUU7QUFDRixNQUFBLElBQUksRUFBRSxJQUFJLE1BQUosQ0FBVyxNQUFNLHVCQUFNLDhCQUFOLENBQ25CLHlCQUFjLEtBQWQsQ0FBb0IsV0FBcEIsQ0FBZ0MsUUFBaEMsQ0FBeUMsUUFEdEIsQ0FBTixHQUViLGFBRkUsQ0FESjtBQUlGLE1BQUEsR0FBRyxFQUFFLHlCQUFjLEtBQWQsQ0FBb0IsV0FBcEIsQ0FBZ0MsUUFBaEMsQ0FBeUM7QUFKNUMsS0FGSjtBQVFGLElBQUEsR0FBRyxFQUFFO0FBQ0QsTUFBQSxPQUFPLEVBQUUsaUJBQUMsUUFBRDtBQUFBLGVBQTZCLG1CQUFPLGNBQVAsQ0FDbEMseUJBQWMsS0FBZCxDQUFvQixJQUFwQixDQUF5QixNQUF6QixDQUNJLHlCQUFjLEtBQWQsQ0FBb0IsV0FEeEIsRUFFRSxHQUZGLENBRU0sVUFBQyxpQkFBRDtBQUFBLGlCQUNGLGlCQUFpQixDQUFDLFFBQWxCLENBQTJCLFFBRHpCO0FBQUEsU0FGTixDQURrQyxFQUtwQyxRQUxvQyxDQUszQixRQUwyQixNQU1oQyx5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLE9BQXZDLEtBQW1ELElBQXBELEdBQ0csS0FESCxHQUNXLFFBQVEsQ0FDWix5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLE9BRDNCLEVBRVosUUFGWSxDQVBjLENBQTdCO0FBQUEsT0FEUjtBQVdELE1BQUEsT0FBTyxFQUFFLHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsUUFYeEM7QUFZRCxNQUFBLElBQUksRUFBRSx3QkFaTDtBQWFELE1BQUEsR0FBRyxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsSUFBbEMsQ0FBdUMsVUFBdkMsQ0FBa0QsR0FBbEQsQ0FBc0QsR0FBdEQsQ0FDRCxRQURDLEVBRUgsTUFGRyxDQUdEO0FBQ0ksUUFBQSxNQUFNLEVBQUUsZUFBZSxrQkFBSyxJQUFMLENBQVUsa0JBQUssUUFBTCxDQUM3Qix5QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLElBREgsRUFFN0IseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxRQUZILENBQVYsRUFHcEIsWUFBWSxPQUFPLENBQ2xCLENBQUMseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxJQUFsQyxDQUF1QyxPQUF2QyxJQUFrRDtBQUMvQyxVQUFBLFlBQVksRUFBRTtBQURpQyxTQUFuRCxFQUVHLFlBRkgsR0FFa0IsQ0FIQSxDQUFQLEdBSVgsS0FKVyxHQUlILEVBSlQsZUFJbUIseUJBQWMsYUFKakMsWUFIb0I7QUFEM0IsT0FIQyxFQWFBLE9BQU8sQ0FBQyxDQUNMLHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsSUFBbEMsQ0FBdUMsT0FBdkMsSUFBa0Q7QUFDOUMsUUFBQSxZQUFZLEVBQUU7QUFEZ0MsT0FEN0MsRUFJUCxZQUpPLEdBSVEsQ0FKVCxDQUFQLEdBSXFCLEVBSnJCLEdBSTBCLENBQ3ZCO0FBQUMsUUFBQSxNQUFNLEVBQUU7QUFBVCxPQUR1QixFQUV2QjtBQUNJLFFBQUEsTUFBTSxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBMEIsTUFEdEM7QUFFSSxRQUFBLE9BQU8sRUFBRSx5QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLE9BQTFCLElBQXFDO0FBRmxELE9BRnVCLENBakIxQixFQXdCRDtBQUNJLFFBQUEsTUFBTSxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsSUFBbEMsQ0FBdUMsTUFEbkQ7QUFFSSxRQUFBLE9BQU8sRUFBRSx5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLE9BQXZDLElBQ0w7QUFIUixPQXhCQyxFQTZCRCx5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLElBQWxDLENBQXVDLFVBQXZDLENBQWtELElBQWxELENBQXVELEdBQXZELENBQ0ksUUFESixDQTdCQztBQWJKLEtBUkg7QUFxREYsSUFBQSxJQUFJLEVBQUU7QUFDRixNQUFBLE9BQU8sRUFBRSxpQkFBQyxRQUFEO0FBQUEsZUFBNkIsbUJBQU8sY0FBUCxDQUNsQyx5QkFBYyxLQUFkLENBQW9CLElBQXBCLENBQXlCLE1BQXpCLENBQ0kseUJBQWMsS0FBZCxDQUFvQixXQUR4QixFQUVFLEdBRkYsQ0FFTSxVQUFDLGlCQUFEO0FBQUEsaUJBQ0YsaUJBQWlCLENBQUMsUUFBbEIsQ0FBMkIsUUFEekI7QUFBQSxTQUZOLENBRGtDLEVBS3BDLFFBTG9DLENBSzNCLFFBTDJCLE1BTWhDLHlCQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBMEIsT0FBMUIsS0FBc0MsSUFBdkMsR0FDRyxJQURILEdBRUcsUUFBUSxDQUFDLHlCQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBMEIsT0FBM0IsRUFBb0MsUUFBcEMsQ0FSc0IsQ0FBN0I7QUFBQSxPQURQO0FBVUYsTUFBQSxPQUFPLEVBQUUseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxRQVZ2QztBQVdGLE1BQUEsSUFBSSxFQUFFLG1CQVhKO0FBWUYsTUFBQSxHQUFHLEVBQUUseUJBQWMsTUFBZCxDQUFxQixJQUFyQixDQUEwQixVQUExQixDQUFxQyxHQUFyQyxDQUF5QyxNQUF6QyxDQUNEO0FBQUMsUUFBQSxNQUFNLEVBQUUsZUFBZSxrQkFBSyxJQUFMLENBQVUsa0JBQUssUUFBTCxDQUM5Qix5QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBREksRUFFOUIseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxRQUZGLENBQVYseUJBR0wseUJBQWMsYUFIVDtBQUF4QixPQURDLEVBS0Q7QUFBQyxRQUFBLE1BQU0sRUFBRTtBQUFULE9BTEMsRUFNRDtBQUNJLFFBQUEsTUFBTSxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsSUFBckIsQ0FBMEIsTUFEdEM7QUFFSSxRQUFBLE9BQU8sRUFBRSx5QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLE9BQTFCLElBQXFDO0FBRmxELE9BTkMsRUFVRCx5QkFBYyxNQUFkLENBQXFCLElBQXJCLENBQTBCLFVBQTFCLENBQXFDLElBQXJDLENBQTBDLEdBQTFDLENBQThDLFFBQTlDLENBVkM7QUFaSDtBQXJESixHQWpFVztBQStJakI7QUFDQTtBQUNBO0FBQ0EsRUFBQSxLQUFLLEVBQUU7QUFDSCxJQUFBLE9BQU8sRUFBRSxpQkFBQyxRQUFEO0FBQUEsYUFDTCx5QkFBYyxNQUFkLENBQXFCLG1CQUFyQixDQUF5QyxPQUF6QyxLQUFxRCxJQURuQixHQUVsQyx3QkFBd0IsQ0FBQyxRQUFELENBRlUsR0FHbEMsUUFBUSxDQUNKLHlCQUFjLE1BQWQsQ0FBcUIsbUJBQXJCLENBQXlDLE9BRHJDLEVBQzhDLFFBRDlDLENBSEg7QUFBQSxLQUROO0FBTUgsSUFBQSxPQUFPLEVBQUUsY0FOTjtBQU9ILElBQUEsSUFBSSxFQUFFLG9CQVBIO0FBUUgsSUFBQSxHQUFHLEVBQUUseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxtQkFBbEMsQ0FBc0QsVUFBdEQsQ0FDQSxHQURBLENBQ0ksTUFESixDQUVHO0FBQ0ksTUFBQSxNQUFNLEVBQUUseUJBQWMsTUFBZCxDQUFxQixLQUFyQixDQUEyQixNQUR2QztBQUVJLE1BQUEsT0FBTyxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsS0FBckIsQ0FBMkIsT0FBM0IsSUFBc0M7QUFGbkQsS0FGSCxFQU1HO0FBQ0ksTUFBQSxNQUFNLEVBQUUseUJBQWMsTUFBZCxDQUFxQixtQkFBckIsQ0FBeUMsTUFEckQ7QUFFSSxNQUFBLE9BQU8sRUFDSCx5QkFBYyxNQUFkLENBQXFCLG1CQUFyQixDQUF5QyxPQUF6QyxJQUFvRDtBQUg1RCxLQU5ILEVBV0c7QUFDSSxNQUFBLE1BQU0sRUFDRix5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLG1CQUFsQyxDQUNLLE1BSGI7QUFJSSxNQUFBLE9BQU8sRUFBRSx1QkFBTSxNQUFOLENBQWEsSUFBYixFQUFtQjtBQUN4QixRQUFBLEtBQUssRUFBRSxTQURpQjtBQUV4QixRQUFBLE9BQU8sRUFBRTtBQUFBLGlCQUFvQixDQUN6QixhQUFhLENBQUM7QUFDVixZQUFBLGVBQWUsRUFBRSxtQkFEUDtBQUVWLFlBQUEsSUFBSSxFQUFFLHlCQUFjLElBQWQsQ0FBbUI7QUFGZixXQUFELENBRFksRUFLM0IsTUFMMkIsQ0FNekIseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUNLLG1CQURMLENBQ3lCLFVBRHpCLENBRUssT0FGTCxDQUVhLEdBRmIsQ0FFaUIsR0FGakIsQ0FFcUIsUUFGckIsQ0FOeUIsRUFTekIsZ0JBQWdCLENBQ1oseUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUNLLG1CQURMLENBQ3lCLGdCQUZiLENBVFM7QUFZekI7Ozs7OztBQU1BLFVBQUEsZUFBZSxDQUFDO0FBQ1osWUFBQSxTQUFTLEVBQUUsS0FEQztBQUVaLFlBQUEsT0FBTyxFQUFFLENBQ0w7QUFBQyxjQUFBLElBQUksRUFBRSxPQUFQO0FBQWdCLGNBQUEsR0FBRyxFQUFFO0FBQXJCLGFBREssRUFFTDtBQUFDLGNBQUEsSUFBSSxFQUFFLE1BQVA7QUFBZSxjQUFBLEdBQUcsRUFBRTtBQUFwQixhQUZLO0FBRkcsV0FBRCxDQWxCVSxFQXlCekIsVUFBVSxDQUFDO0FBQUMsWUFBQSxHQUFHLEVBQUU7QUFBTixXQUFELENBekJlLEVBMEJ6QixjQUFjLENBQUM7QUFDWCxZQUFBLFFBQVEsRUFBRTtBQUFBLHFCQUNOLElBQUksT0FBSixDQUFZLFVBQ1IsT0FEUSxFQUNVLE1BRFY7QUFBQSx1QkFFTyxDQUNmLHlCQUFjLEtBQWQsQ0FBb0IsT0FBcEIsQ0FBNEIsS0FBNUIsR0FDSSxPQURKLEdBQ2MsTUFGQyxHQUZQO0FBQUEsZUFBWixDQURNO0FBQUEsYUFEQztBQVFYLFlBQUEsS0FBSyxFQUFFO0FBQ0gsY0FBQSxpQkFBaUIsRUFBRSwyQkFBQyxLQUFEO0FBQUEsdUJBQ2Ysa0JBQUssSUFBTCxDQUNJLEtBQUssQ0FBQyxVQURWLEVBRUksa0JBQUssUUFBTCxDQUNJLHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FDSyxLQUZULEVBR0kseUJBQWMsS0FBZCxDQUFvQixPQUFwQixDQUNLLEtBSlQsQ0FGSixDQURlO0FBQUE7QUFEaEIsYUFSSTtBQWtCWCxZQUFBLGNBQWMsRUFDVix5QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQ0ssbUJBcEJFO0FBcUJYLFlBQUEsVUFBVSxFQUNOLHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0M7QUF0QnpCLFdBQUQsQ0ExQlcsRUFrRHpCLHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FDSyxtQkFETCxDQUN5QixVQUR6QixDQUNvQyxPQURwQyxDQUM0QyxJQUQ1QyxDQUVLLEdBRkwsQ0FFUyxRQUZULENBbER5QixFQXFEekIseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixPQUEvQixHQUNJLGNBQWMsQ0FDVix5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLE9BRHJCLENBRGxCLEdBR1EsRUF4RGlCLENBQXBCO0FBQUE7QUFGZSxPQUFuQixFQTREVCx5QkFBYyxNQUFkLENBQXFCLFlBQXJCLENBQWtDLG1CQUFsQyxDQUNLLE9BREwsSUFDZ0IsRUE3RFA7QUFKYixLQVhILEVBOEVHLHlCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FBa0MsbUJBQWxDLENBQ0ssVUFETCxDQUNnQixJQURoQixDQUNxQixHQURyQixDQUN5QixRQUR6QixDQTlFSDtBQVJGLEdBbEpVO0FBMk9qQjtBQUNBO0FBQ0E7QUFDQSxFQUFBLElBQUksRUFBRTtBQUNGLElBQUEsR0FBRyxFQUFFO0FBQ0QsTUFBQSxPQUFPLEVBQUUsaUJBQUMsUUFBRDtBQUFBLGVBQ0wseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQUF4QyxLQUFvRCxJQURsQixHQUVsQyxLQUZrQyxHQUdsQyxRQUFRLENBQ0oseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQURwQyxFQUM2QyxRQUQ3QyxDQUhIO0FBQUEsT0FEUjtBQU1ELE1BQUEsSUFBSSxFQUFFLGtCQU5MO0FBT0QsTUFBQSxHQUFHLEVBQUUseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxVQUF4QyxDQUFtRCxHQUFuRCxDQUF1RCxHQUF2RCxDQUNELFFBREMsRUFFSCxNQUZHLENBR0Q7QUFDSSxRQUFBLE1BQU0sRUFBRSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE1BRHBEO0FBRUksUUFBQSxPQUFPLEVBQUUseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQUF4QyxJQUNMO0FBSFIsT0FIQyxFQVFELHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsVUFBeEMsQ0FBbUQsSUFBbkQsQ0FBd0QsR0FBeEQsQ0FDSSxRQURKLENBUkM7QUFQSixLQURIO0FBbUJGLElBQUEsR0FBRyxFQUFFO0FBQ0QsTUFBQSxPQUFPLEVBQUUsaUJBQUMsUUFBRDtBQUFBLGVBQ0wseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQUF4QyxLQUFvRCxJQURsQixHQUVsQyxLQUZrQyxHQUdsQyxRQUFRLENBQ0oseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQURwQyxFQUM2QyxRQUQ3QyxDQUhIO0FBQUEsT0FEUjtBQU1ELE1BQUEsSUFBSSxFQUFFLGtCQU5MO0FBT0QsTUFBQSxHQUFHLEVBQUUseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxVQUF4QyxDQUFtRCxHQUFuRCxDQUF1RCxHQUF2RCxDQUNELFFBREMsRUFFSCxNQUZHLENBR0Q7QUFDSSxRQUFBLE1BQU0sRUFBRSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLE1BRHBEO0FBRUksUUFBQSxPQUFPLEVBQUUseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxPQUF4QyxJQUNMO0FBSFIsT0FIQyxFQVFELHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsVUFBeEMsQ0FBbUQsSUFBbkQsQ0FBd0QsR0FBeEQsQ0FDSSxRQURKLENBUkM7QUFQSixLQW5CSDtBQXFDRixJQUFBLEdBQUcsRUFBRTtBQUNELE1BQUEsT0FBTyxFQUFFLGlCQUFDLFFBQUQ7QUFBQSxlQUNMLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FBeEMsS0FBb0QsSUFEbEIsR0FFbEMsS0FGa0MsR0FHbEMsUUFBUSxDQUNKLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FEcEMsRUFDNkMsUUFEN0MsQ0FISDtBQUFBLE9BRFI7QUFNRCxNQUFBLElBQUksRUFBRSxrQkFOTDtBQU9ELE1BQUEsR0FBRyxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsVUFBeEMsQ0FBbUQsR0FBbkQsQ0FBdUQsR0FBdkQsQ0FDRCxRQURDLEVBRUgsTUFGRyxDQUdEO0FBQ0ksUUFBQSxNQUFNLEVBQUUseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixJQUEvQixDQUFvQyxHQUFwQyxDQUF3QyxNQURwRDtBQUVJLFFBQUEsT0FBTyxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsR0FBcEMsQ0FBd0MsT0FBeEMsSUFDTDtBQUhSLE9BSEMsRUFRRCx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLEdBQXBDLENBQXdDLFVBQXhDLENBQW1ELElBQW5ELENBQXdELEdBQXhELENBQ0ksUUFESixDQVJDO0FBUEosS0FyQ0g7QUF1REYsSUFBQSxJQUFJLEVBQUU7QUFDRixNQUFBLE9BQU8sRUFBRSxpQkFBQyxRQUFEO0FBQUEsZUFDTCx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLElBQXBDLENBQXlDLE9BQXpDLEtBQXFELElBRG5CLEdBRWxDLEtBRmtDLEdBR2xDLFFBQVEsQ0FDSix5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLElBQXBDLENBQXlDLE9BRHJDLEVBQzhDLFFBRDlDLENBSEg7QUFBQSxPQURQO0FBT0YsTUFBQSxJQUFJLEVBQUUscUJBUEo7QUFRRixNQUFBLEdBQUcsRUFBRSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLElBQXBDLENBQXlDLFVBQXpDLENBQW9ELEdBQXBELENBQXdELEdBQXhELENBQ0QsUUFEQyxFQUVILE1BRkcsQ0FHRDtBQUNJLFFBQUEsTUFBTSxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsSUFBcEMsQ0FBeUMsTUFEckQ7QUFFSSxRQUFBLE9BQU8sRUFDSCx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLElBQXBDLENBQXlDLE9BQXpDLElBQW9EO0FBSDVELE9BSEMsRUFRRCx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLElBQXBDLENBQXlDLFVBQXpDLENBQW9ELElBQXBELENBQXlELEdBQXpELENBQ0ksUUFESixDQVJDO0FBUkg7QUF2REosR0E5T1c7QUF5VGpCO0FBQ0E7QUFDQSxFQUFBLEtBQUssRUFBRTtBQUNILElBQUEsT0FBTyxFQUFFLGlCQUFDLFFBQUQ7QUFBQSxhQUNMLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsS0FBL0IsQ0FBcUMsT0FBckMsS0FBaUQsSUFEZixHQUVsQyx3QkFBd0IsQ0FBQyxRQUFELENBRlUsR0FHbEMsUUFBUSxDQUFDLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsS0FBL0IsQ0FBcUMsT0FBdEMsRUFBK0MsUUFBL0MsQ0FISDtBQUFBLEtBRE47QUFLSCxJQUFBLE9BQU8sRUFBRSx5QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLEtBTHRDO0FBTUgsSUFBQSxJQUFJLEVBQUUsa0NBTkg7QUFPSCxJQUFBLEdBQUcsRUFBRSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLEtBQS9CLENBQXFDLFVBQXJDLENBQWdELEdBQWhELENBQW9ELEdBQXBELENBQ0QsUUFEQyxFQUVILE1BRkcsQ0FHRDtBQUNJLE1BQUEsTUFBTSxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsS0FBL0IsQ0FBcUMsTUFEakQ7QUFFSSxNQUFBLE9BQU8sRUFBRSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLEtBQS9CLENBQXFDLElBQXJDLElBQTZDO0FBRjFELEtBSEMsRUFPRCx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLEtBQS9CLENBQXFDLFVBQXJDLENBQWdELElBQWhELENBQXFELEdBQXJELENBQXlELFFBQXpELENBUEM7QUFQRixHQTNUVTtBQTJVakI7QUFDQTtBQUNBLEVBQUEsSUFBSSxFQUFFO0FBQ0YsSUFBQSxPQUFPLEVBQUUsaUJBQUMsUUFBRDtBQUFBLGFBQ0wseUJBQWMsVUFBZCxDQUF5QixJQUF6QixDQUE4QixRQUE5QixDQUF1QyxRQUF2QyxDQUNJLGtCQUFLLE9BQUwsQ0FBYSxtQkFBTyxXQUFQLENBQW1CLFFBQW5CLENBQWIsQ0FESixNQUdJLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsT0FBcEMsS0FBZ0QsSUFEOUMsR0FFRix3QkFBd0IsQ0FBQyxRQUFELENBRnRCLEdBR0YsUUFBUSxDQUNKLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsT0FEaEMsRUFDeUMsUUFEekMsQ0FMWixDQURLO0FBQUEsS0FEUDtBQVNGLElBQUEsSUFBSSxFQUFFLElBVEo7QUFVRixJQUFBLEdBQUcsRUFBRSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLFVBQXBDLENBQStDLEdBQS9DLENBQW1ELEdBQW5ELENBQ0QsUUFEQyxFQUVILE1BRkcsQ0FHRDtBQUNJLE1BQUEsTUFBTSxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsSUFBL0IsQ0FBb0MsTUFEaEQ7QUFFSSxNQUFBLE9BQU8sRUFBRSx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLE9BQXBDLElBQStDO0FBRjVELEtBSEMsRUFPRCx5QkFBYyxNQUFkLENBQXFCLFNBQXJCLENBQStCLElBQS9CLENBQW9DLFVBQXBDLENBQStDLElBQS9DLENBQW9ELEdBQXBELENBQXdELFFBQXhELENBUEM7QUFWSCxHQTdVVyxDQWdXakI7O0FBaFdpQixDQUFyQjs7QUFrV0EsSUFDSSx5QkFBYyxLQUFkLENBQW9CLE9BQXBCLENBQTRCLG1CQUE1QixJQUNBLE9BQU8sQ0FBQyxjQUZaLEVBR0U7QUFDRTs7OztBQUlBLEVBQUEsTUFBTSxDQUFDLEtBQVAsQ0FBYSxHQUFiLENBQWlCLEtBQWpCO0FBQ0EsRUFBQSxNQUFNLENBQUMsS0FBUCxDQUFhLEdBQWIsQ0FBaUIsT0FBakIsQ0FBeUIsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsTUFBaEQ7QUFDSCxDLENBQ0Q7QUFDQTs7Ozs7Ozs7QUFDQSx5QkFBc0QseUJBQWMsT0FBcEU7QUFBQSxRQUFXLG1CQUFYO0FBQ0ksSUFBQSxlQUFlLENBQUMsSUFBaEIsNkJBQTBCLElBQUksQ0FBQyxTQUFELENBQUosQ0FBZ0IsbUJBQW1CLENBQUMsSUFBcEIsQ0FBeUIsTUFBekMsRUFDdEIsbUJBQW1CLENBQUMsSUFBcEIsQ0FBeUIsV0FESCxDQUExQixzQ0FFTSxtQkFBbUIsQ0FBQyxTQUYxQjtBQURKLEcsQ0FJQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFJLG1CQUErQixHQUFHLEVBQXRDO0FBQ0EsSUFBSSx5QkFBYyxJQUFkLENBQW1CLGFBQW5CLElBQW9DLHlCQUFjLElBQWQsQ0FBbUIsYUFBbkIsQ0FBaUMsSUFBekUsRUFDSSxJQUFJO0FBQ0EsRUFBQSxtQkFBbUIsR0FBRyxPQUFPLENBQUMseUJBQWMsSUFBZCxDQUFtQixhQUFuQixDQUFpQyxJQUFsQyxDQUE3QjtBQUNILENBRkQsQ0FFRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUNmLElBQU0sb0JBQXlDLEdBQUcsdUJBQU0sTUFBTixDQUNyRCxJQURxRCxFQUVyRDtBQUNJLEVBQUEsSUFBSSxFQUFFLElBRFY7QUFFSSxFQUFBLEtBQUssRUFBRSx5QkFBYyxLQUFkLENBQW9CLElBRi9CO0FBR0ksRUFBQSxPQUFPLEVBQUUseUJBQWMsSUFBZCxDQUFtQixPQUhoQztBQUlJLEVBQUEsT0FBTyxFQUFFLHlCQUFjLFdBQWQsQ0FBMEIsSUFKdkM7QUFLSSxFQUFBLFNBQVMsRUFBRSx5QkFBYyxXQUFkLENBQTBCLE1BTHpDO0FBTUk7QUFDQSxFQUFBLEtBQUssRUFBRSx5QkFBYyxTQUFkLENBQXdCLEtBQXhCLENBQThCLFVBUHpDO0FBUUksRUFBQSxTQUFTLEVBQUUseUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxPQVJoRDtBQVNJLEVBQUEsT0FBTyxFQUFFO0FBQ0wsSUFBQSxLQUFLLEVBQUUseUJBQWMsTUFBZCxDQUFxQixPQUR2QjtBQUVMLElBQUEsV0FBVyxFQUFFLG9DQUFzQixrQkFGOUI7QUFHTCxJQUFBLFVBQVUsRUFBRSx5QkFBYyxVQUFkLENBQXlCLElBQXpCLENBQThCLFFBSHJDO0FBSUwsSUFBQSxVQUFVLEVBQUUsb0NBQXNCLElBQXRCLENBQTJCLGFBSmxDO0FBS0wsSUFBQSxTQUFTLEVBQUUsb0NBQXNCLElBQXRCLENBQTJCLFNBTGpDO0FBTUwsSUFBQSxnQkFBZ0IsRUFBRSx5QkFBYyxVQUFkLENBQXlCLE1BTnRDO0FBT0wsSUFBQSxPQUFPLEVBQUUsbUJBQU8sY0FBUCxDQUNMLHlCQUFjLE1BQWQsQ0FBcUIsY0FEaEIsQ0FQSjtBQVNMLElBQUEsUUFBUSxFQUFFLEtBVEw7QUFVTCxJQUFBLFdBQVcsRUFBRSx5QkFBYyxLQUFkLENBQW9CO0FBVjVCLEdBVGI7QUFxQkksRUFBQSxhQUFhLEVBQUU7QUFDWCxJQUFBLEtBQUssRUFBRSx5QkFBYyxNQUFkLENBQXFCLE9BRGpCO0FBRVgsSUFBQSxXQUFXLEVBQUUsb0NBQXNCLGtCQUZ4QjtBQUdYLElBQUEsVUFBVSxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsVUFBckIsQ0FBZ0MsSUFIakM7QUFJWCxJQUFBLFVBQVUsRUFBRSxvQ0FBc0IsSUFBdEIsQ0FBMkIsYUFKNUI7QUFLWCxJQUFBLFNBQVMsRUFBRSxvQ0FBc0IsSUFBdEIsQ0FBMkIsU0FMM0I7QUFNWCxJQUFBLGdCQUFnQixFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsVUFBckIsQ0FBZ0MsTUFOdkM7QUFPWCxJQUFBLE9BQU8sRUFBRSx5QkFBYyxNQUFkLENBQXFCLGNBUG5CO0FBUVgsSUFBQSxRQUFRLEVBQUU7QUFSQyxHQXJCbkI7QUErQkk7QUFDQTtBQUNBLEVBQUEsTUFBTSxFQUFFO0FBQ0osSUFBQSxRQUFRLEVBQUUsa0JBQUssUUFBTCxDQUNOLHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFEcEIsRUFFTix5QkFBYyxLQUFkLENBQW9CLE9BQXBCLENBQTRCLFVBRnRCLENBRE47QUFJSixJQUFBLFlBQVksRUFBRSx5QkFBYyxhQUp4QjtBQUtKLElBQUEsT0FBTyxFQUFFLFdBTEw7QUFNSixJQUFBLGFBQWEsRUFDVCx5QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxNQUErQyxXQURwQyxHQUVYLEtBRlcsR0FFSCx5QkFBYyxZQUFkLENBQTJCLElBUm5DO0FBU0osSUFBQSxJQUFJLEVBQUUseUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQVQ1QjtBQVVKLElBQUEsVUFBVSxFQUFFLHlCQUFjLElBQWQsQ0FBbUIsTUFBbkIsVUFWUjtBQVdKLElBQUEsY0FBYyxFQUFFO0FBWFosR0FqQ1o7QUE4Q0ksRUFBQSxXQUFXLEVBQUUseUJBQWMsZ0JBOUMvQjtBQStDSSxFQUFBLE1BQU0sRUFBRSx5QkFBYyxnQkEvQzFCO0FBZ0RJO0FBQ0EsRUFBQSxJQUFJLEVBQUUseUJBQWMsS0FBZCxHQUFzQixhQUF0QixHQUFzQyxZQWpEaEQ7QUFrREksRUFBQSxNQUFNLEVBQUU7QUFDSixJQUFBLEtBQUssRUFBRSx5QkFBYyxNQUFkLENBQXFCLFVBQXJCLENBQWdDLEdBQWhDLENBQW9DLEdBQXBDLENBQ0gsY0FERyxFQUVMLE1BRkssQ0FHSCxNQUFNLENBQUMsR0FISixFQUlILE1BQU0sQ0FBQyxNQUpKLEVBS0gsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUxULEVBS2UsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUwzQixFQUtnQyxNQUFNLENBQUMsSUFBUCxDQUFZLElBTDVDLEVBTUgsTUFBTSxDQUFDLEtBTkosRUFPSCxNQUFNLENBQUMsSUFBUCxDQUFZLEdBUFQsRUFPYyxNQUFNLENBQUMsSUFBUCxDQUFZLEdBUDFCLEVBTytCLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FQM0MsRUFRSCxNQUFNLENBQUMsSUFBUCxDQUFZLElBUlQsRUFTSCxNQUFNLENBQUMsS0FUSixFQVVILE1BQU0sQ0FBQyxJQVZKLEVBV0gseUJBQWMsTUFBZCxDQUFxQixVQUFyQixDQUFnQyxJQUFoQyxDQUFxQyxHQUFyQyxDQUF5QyxjQUF6QyxDQVhHO0FBREgsR0FsRFo7QUFpRUksRUFBQSxJQUFJLEVBQUUseUJBQWMsZUFqRXhCO0FBa0VJLEVBQUEsWUFBWSxFQUFFO0FBQ1YsSUFBQSxRQUFRLEVBQUUseUJBQWMsTUFBZCxDQUFxQixTQUFyQixDQUErQixRQUQvQjtBQUVWLElBQUEsU0FBUyxFQUFFLHlCQUFjLE1BQWQsQ0FBcUIsU0FBckIsQ0FBK0IsU0FGaEM7QUFHVjtBQUNBLElBQUEsV0FBVyxFQUNQLENBQUMseUJBQWMsU0FBZCxDQUF3QixNQUF6QixJQUNBLHlCQUFjLGdCQUFkLEtBQW1DLEtBRG5DLElBRUEsQ0FBQyxXQUFELEVBQWMsTUFBZCxFQUFzQixRQUF0QixDQUNJLHlCQUFjLHlCQUFkLENBQXdDLENBQXhDLENBREosQ0FIUyxHQU9UO0FBQ0ksTUFBQSxXQUFXLEVBQUU7QUFDVCxtQkFBUyxLQURBO0FBRVQsUUFBQSxPQUFPLEVBQUU7QUFGQTtBQURqQixLQVBTLEdBWUwsdUJBQU0sTUFBTixDQUNBLElBREEsRUFFQTtBQUNJLE1BQUEsTUFBTSxFQUFFLEtBRFo7QUFFSSxNQUFBLFdBQVcsRUFBRTtBQUNULFFBQUEsT0FBTyxFQUFFO0FBQ0wsVUFBQSxNQUFNLEVBQUUsZ0JBQUMsTUFBRCxFQUEyQjtBQUMvQixnQkFDSSx5QkFBTyx5QkFBYyxPQUFkLENBQXNCLFVBQTdCLE1BQ1EsUUFEUixJQUVBLHlCQUFjLE9BQWQsQ0FBc0IsVUFBdEIsS0FDSSxJQUpSO0FBTUksK0NBQTBCLE1BQU0sQ0FBQyxJQUFQLENBQ3RCLHlCQUFjLE9BQWQsQ0FBc0IsVUFEQSxDQUExQjtBQUFLLG9CQUFNLE1BQVcsb0JBQWpCO0FBR0Qsb0JBQ0ksTUFBSSxLQUFLLEdBQVQsSUFDQSxNQUFJLEtBQUssTUFBTSxDQUFDLElBRnBCLEVBSUksT0FBTyxLQUFQO0FBUFI7QUFOSjs7QUFjQSxtQkFBTyxJQUFQO0FBQ0gsV0FqQkk7QUFrQkwsVUFBQSxRQUFRLEVBQUUsQ0FBQyxFQWxCTjtBQW1CTCxVQUFBLGtCQUFrQixFQUFFLElBbkJmO0FBb0JMLFVBQUEsSUFBSSxFQUFFO0FBcEJEO0FBREE7QUFGakIsS0FGQSxFQTZCQSx5QkFBYyxTQUFkLENBQXdCLE1BN0J4QixDQWhCRSxDQStDVjs7QUEvQ1UsR0FsRWxCO0FBbUhJLEVBQUEsT0FBTyxFQUFFO0FBbkhiLENBRnFELEVBdUhyRCx5QkFBYyxPQXZIdUMsRUF3SHJELG1CQXhIcUQsQ0FBbEQ7OztBQTBIUCxJQUNJLENBQUMsS0FBSyxDQUFDLE9BQU4sQ0FBYyx5QkFBYyxNQUFkLENBQXFCLDJCQUFuQyxDQUFELElBQ0EseUJBQWMsTUFBZCxDQUFxQiwyQkFBckIsQ0FBaUQsTUFGckQsRUFJSSxvQkFBb0IsQ0FBQyxNQUFyQixDQUE0QixPQUE1QixHQUNJLHlCQUFjLE1BQWQsQ0FBcUIsMkJBRHpCOztBQUVKLElBQ0kseUJBQWMsSUFBZCxDQUFtQixhQUFuQixJQUNBLHlCQUFjLElBQWQsQ0FBbUIsYUFBbkIsQ0FBaUMsVUFGckMsRUFHRTtBQUNFLE1BQUksTUFBSjs7QUFDQSxNQUFJO0FBQ0EsSUFBQSxNQUFNLEdBQUcsT0FBTyxDQUFDLHlCQUFjLElBQWQsQ0FBbUIsYUFBbkIsQ0FBaUMsVUFBbEMsQ0FBaEI7QUFDSCxHQUZELENBRUUsT0FBTyxLQUFQLEVBQWMsQ0FBRTs7QUFDbEIsTUFBSSxNQUFKLEVBQ0ksSUFBSSxNQUFNLENBQUMsY0FBUCxDQUFzQixxQkFBdEIsQ0FBSixFQUNJO0FBQ0EsbUNBQUEsb0JBQW9CLDZEQUFHLG9CQUFvQixDQUFDLG1CQUF4QixDQUFwQixDQUZKLEtBSUksdUJBQU0sTUFBTixDQUFhLElBQWIsRUFBbUIsb0JBQW5CLEVBQXlDLE1BQXpDO0FBQ1g7O0FBQ0QsSUFBSSx5QkFBYyxpQkFBbEIsRUFBcUM7QUFDakMsRUFBQSxPQUFPLENBQUMsSUFBUixDQUNJLCtCQURKLEVBRUksaUJBQUssT0FBTCxDQUFhLHdCQUFiLEVBQTRCO0FBQUMsSUFBQSxLQUFLLEVBQUU7QUFBUixHQUE1QixDQUZKO0FBSUEsRUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLDZEQUFiO0FBQ0EsRUFBQSxPQUFPLENBQUMsSUFBUixDQUNJLDhCQURKLEVBRUksaUJBQUssT0FBTCxDQUFhLG9CQUFiLEVBQW1DO0FBQUMsSUFBQSxLQUFLLEVBQUU7QUFBUixHQUFuQyxDQUZKO0FBSUgsQyxDQUNEOzs7ZUFDZSxvQixFQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6IndlYnBhY2tDb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zXG4gICAgbmFtaW5nIDMuMCB1bnBvcnRlZCBsaWNlbnNlLlxuICAgIFNlZSBodHRwczovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IHR5cGUge0RvbU5vZGUsIFBsYWluT2JqZWN0LCBQcm9jZWR1cmVGdW5jdGlvbiwgV2luZG93fSBmcm9tICdjbGllbnRub2RlJ1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tdmFyICovXG50cnkge1xuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIHZhciBwb3N0Y3NzQ1NTbmFubzpGdW5jdGlvbiA9IHJlcXVpcmUoJ2Nzc25hbm8nKVxufSBjYXRjaCAoZXJyb3IpIHt9XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXZhciAqL1xuaW1wb3J0IHtKU0RPTSBhcyBET019IGZyb20gJ2pzZG9tJ1xuaW1wb3J0IHtwcm9taXNlcyBhcyBmaWxlU3lzdGVtfSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby12YXIgKi9cbnRyeSB7XG4gICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgdmFyIHBvc3Rjc3NQcmVzZXRFTlY6RnVuY3Rpb24gPSByZXF1aXJlKCdwb3N0Y3NzLXByZXNldC1lbnYnKVxufSBjYXRjaCAoZXJyb3IpIHt9XG50cnkge1xuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIHZhciBwb3N0Y3NzRm9udFBhdGg6RnVuY3Rpb24gPSByZXF1aXJlKCdwb3N0Y3NzLWZvbnRwYXRoJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxudHJ5IHtcbiAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICB2YXIgcG9zdGNzc0ltcG9ydDpGdW5jdGlvbiA9IHJlcXVpcmUoJ3Bvc3Rjc3MtaW1wb3J0Jylcbn0gY2F0Y2ggKGVycm9yKSB7fVxudHJ5IHtcbiAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICB2YXIgcG9zdGNzc1Nwcml0ZXM6RnVuY3Rpb24gPSByZXF1aXJlKCdwb3N0Y3NzLXNwcml0ZXMnKVxufSBjYXRjaCAoZXJyb3IpIHt9XG50cnkge1xuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIHZhciBwb3N0Y3NzVVJMOkZ1bmN0aW9uID0gcmVxdWlyZSgncG9zdGNzcy11cmwnKVxufSBjYXRjaCAoZXJyb3IpIHt9XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXZhciAqL1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCB3ZWJwYWNrIGZyb20gJ3dlYnBhY2snXG5pbXBvcnQge1Jhd1NvdXJjZSBhcyBXZWJwYWNrUmF3U291cmNlfSBmcm9tICd3ZWJwYWNrLXNvdXJjZXMnXG5cbmNvbnN0IHBsdWdpbk5hbWVSZXNvdXJjZU1hcHBpbmc6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xuICAgIEJhYmVsTWluaWZ5OiAnYmFiZWwtbWluaWZ5LXdlYnBhY2stcGx1Z2luJyxcbiAgICBIVE1MOiAnaHRtbC13ZWJwYWNrLXBsdWdpbicsXG4gICAgTWluaUNTU0V4dHJhY3Q6ICdtaW5pLWNzcy1leHRyYWN0LXBsdWdpbicsXG4gICAgQWRkQXNzZXRIVE1MUGx1Z2luOiAnYWRkLWFzc2V0LWh0bWwtd2VicGFjay1wbHVnaW4nLFxuICAgIE9wZW5Ccm93c2VyOiAnb3Blbi1icm93c2VyLXdlYnBhY2stcGx1Z2luJyxcbiAgICBGYXZpY29uOiAnZmF2aWNvbnMtd2VicGFjay1wbHVnaW4nLFxuICAgIEltYWdlbWluOiAnaW1hZ2VtaW4td2VicGFjay1wbHVnaW4nLFxuICAgIE9mZmxpbmU6ICdvZmZsaW5lLXBsdWdpbidcbn1cbmNvbnN0IHBsdWdpbnM6T2JqZWN0ID0ge31cbmZvciAoY29uc3QgbmFtZTpzdHJpbmcgaW4gcGx1Z2luTmFtZVJlc291cmNlTWFwcGluZylcbiAgICBpZiAocGx1Z2luTmFtZVJlc291cmNlTWFwcGluZy5oYXNPd25Qcm9wZXJ0eShuYW1lKSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgcGx1Z2luc1tuYW1lXSA9IHJlcXVpcmUocGx1Z2luTmFtZVJlc291cmNlTWFwcGluZ1tuYW1lXSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5pZiAocGx1Z2lucy5JbWFnZW1pbilcbiAgICBwbHVnaW5zLkltYWdlbWluID0gcGx1Z2lucy5JbWFnZW1pbi5kZWZhdWx0XG5cbmltcG9ydCBlanNMb2FkZXIgZnJvbSAnLi9lanNMb2FkZXIuY29tcGlsZWQnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IHR5cGUge1xuICAgIEhUTUxDb25maWd1cmF0aW9uLCBQbHVnaW5Db25maWd1cmF0aW9uLCBXZWJwYWNrQ29uZmlndXJhdGlvblxufSBmcm9tICcuL3R5cGUnXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG5cbi8vIC8gcmVnaW9uIG1vbmtleSBwYXRjaGVzXG4vLyBNb25rZXktUGF0Y2ggaHRtbCBsb2FkZXIgdG8gcmV0cmlldmUgaHRtbCBsb2FkZXIgb3B0aW9ucyBzaW5jZSB0aGVcbi8vIFwid2VicGFjay1odG1sLXBsdWdpblwiIGRvZXNuJ3QgcHJlc2VydmUgdGhlIG9yaWdpbmFsIGxvYWRlciBpbnRlcmZhY2UuXG5pbXBvcnQgaHRtbExvYWRlck1vZHVsZUJhY2t1cCBmcm9tICdodG1sLWxvYWRlcidcbmlmIChcbiAgICAnY2FjaGUnIGluIHJlcXVpcmUgJiZcbiAgICByZXF1aXJlLmNhY2hlICYmXG4gICAgcmVxdWlyZS5yZXNvbHZlKCdodG1sLWxvYWRlcicpIGluIHJlcXVpcmUuY2FjaGVcbikge1xuICAgIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKCdodG1sLWxvYWRlcicpXS5leHBvcnRzID0gZnVuY3Rpb24oXG4gICAgICAgIC4uLnBhcmFtZXRlcjpBcnJheTxhbnk+XG4gICAgKTphbnkge1xuICAgICAgICBUb29scy5leHRlbmQodHJ1ZSwgdGhpcy5vcHRpb25zLCBtb2R1bGUsIHRoaXMub3B0aW9ucylcbiAgICAgICAgcmV0dXJuIGh0bWxMb2FkZXJNb2R1bGVCYWNrdXAuY2FsbCh0aGlzLCAuLi5wYXJhbWV0ZXIpXG4gICAgfVxufVxuLy8gTW9ua2V5LVBhdGNoIGxvYWRlci11dGlscyB0byBkZWZpbmUgd2hpY2ggdXJsIGlzIGEgbG9jYWwgcmVxdWVzdC5cbmltcG9ydCBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cCBmcm9tICdsb2FkZXItdXRpbHMnXG5jb25zdCBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cDoodXJsOnN0cmluZykgPT4gYm9vbGVhbiA9XG4gICAgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAuaXNVcmxSZXF1ZXN0XG5pZiAoXG4gICAgJ2NhY2hlJyBpbiByZXF1aXJlICYmXG4gICAgcmVxdWlyZS5jYWNoZSAmJlxuICAgIHJlcXVpcmUucmVzb2x2ZSgnbG9hZGVyLXV0aWxzJykgaW4gcmVxdWlyZS5jYWNoZVxuKVxuICAgIHJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKCdsb2FkZXItdXRpbHMnKV0uZXhwb3J0cy5pc1VybFJlcXVlc3QgPSAoXG4gICAgICAgIHVybDpzdHJpbmcsIC4uLmFkZGl0aW9uYWxQYXJhbWV0ZXI6QXJyYXk8YW55PlxuICAgICk6Ym9vbGVhbiA9PiB7XG4gICAgICAgIGlmICh1cmwubWF0Y2goL15bYS16XSs6LisvKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICByZXR1cm4gbG9hZGVyVXRpbHNJc1VybFJlcXVlc3RCYWNrdXAuYXBwbHkoXG4gICAgICAgICAgICBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cCwgW3VybF0uY29uY2F0KGFkZGl0aW9uYWxQYXJhbWV0ZXIpKVxuICAgIH1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBpbml0aWFsaXNhdGlvblxuLy8gLyByZWdpb24gZGV0ZXJtaW5lIGxpYnJhcnkgbmFtZVxubGV0IGxpYnJhcnlOYW1lOnN0cmluZ1xuaWYgKCdsaWJyYXJ5TmFtZScgaW4gY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmxpYnJhcnlOYW1lKVxuICAgIGxpYnJhcnlOYW1lID0gY29uZmlndXJhdGlvbi5saWJyYXJ5TmFtZVxuZWxzZSBpZiAoT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZCkubGVuZ3RoID4gMSlcbiAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV0nXG5lbHNlIHtcbiAgICBsaWJyYXJ5TmFtZSA9IGNvbmZpZ3VyYXRpb24ubmFtZVxuICAgIGlmIChbJ2Fzc2lnbicsICdnbG9iYWwnLCAndGhpcycsICd2YXInLCAnd2luZG93J10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LnNlbGZcbiAgICApKVxuICAgICAgICBsaWJyYXJ5TmFtZSA9IFRvb2xzLnN0cmluZ0NvbnZlcnRUb1ZhbGlkVmFyaWFibGVOYW1lKGxpYnJhcnlOYW1lKVxufVxuLy8gLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIHBsdWdpbnNcbmNvbnN0IHBsdWdpbkluc3RhbmNlczpBcnJheTxPYmplY3Q+ID0gW1xuICAgIG5ldyB3ZWJwYWNrLm9wdGltaXplLk9jY3VycmVuY2VPcmRlclBsdWdpbih0cnVlKVxuXVxuLy8gLy8gcmVnaW9uIGRlZmluZSBtb2R1bGVzIHRvIGlnbm9yZVxuZm9yIChjb25zdCBpZ25vcmVQYXR0ZXJuOnN0cmluZyBvZiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pZ25vcmVQYXR0ZXJuKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLklnbm9yZVBsdWdpbihuZXcgUmVnRXhwKGlnbm9yZVBhdHRlcm4pKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGRlZmluZSBtb2R1bGVzIHRvIHJlcGxhY2VcbmZvciAoY29uc3Qgc291cmNlOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsKVxuICAgIGlmIChjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLmhhc093blByb3BlcnR5KHNvdXJjZSkpIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoOlJlZ0V4cCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Ob3JtYWxNb2R1bGVSZXBsYWNlbWVudFBsdWdpbihcbiAgICAgICAgICAgIHNlYXJjaCwgKHJlc291cmNlOntyZXF1ZXN0OnN0cmluZ30pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLnJlcXVlc3QgPSByZXNvdXJjZS5yZXF1ZXN0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaCwgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbFtzb3VyY2VdKVxuICAgICAgICAgICAgfSkpXG4gICAgfVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgaHRtbCBmaWxlXG5sZXQgaHRtbEF2YWlsYWJsZTpib29sZWFuID0gZmFsc2VcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gIT09ICdidWlsZDpkbGwnKVxuICAgIGZvciAoY29uc3QgaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24gb2YgY29uZmlndXJhdGlvbi5maWxlcy5odG1sKVxuICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aCkpIHtcbiAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkhUTUwoVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICAgIHt0ZW1wbGF0ZTogaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUucmVxdWVzdH1cbiAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgaHRtbEF2YWlsYWJsZSA9IHRydWVcbiAgICAgICAgfVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgZmF2aWNvbnNcbmlmIChcbiAgICBodG1sQXZhaWxhYmxlICYmXG4gICAgY29uZmlndXJhdGlvbi5mYXZpY29uICYmXG4gICAgcGx1Z2lucy5GYXZpY29uICYmXG4gICAgVG9vbHMuaXNGaWxlU3luYyhjb25maWd1cmF0aW9uLmZhdmljb24ubG9nbylcbilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5GYXZpY29uKGNvbmZpZ3VyYXRpb24uZmF2aWNvbikpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBwcm92aWRlIG9mZmxpbmUgZnVuY3Rpb25hbGl0eVxuaWYgKGh0bWxBdmFpbGFibGUgJiYgY29uZmlndXJhdGlvbi5vZmZsaW5lICYmIHBsdWdpbnMuT2ZmbGluZSkge1xuICAgIGlmICghWydzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgKSlcbiAgICAgICAgZm9yIChjb25zdCB0eXBlOkFycmF5PHN0cmluZz4gb2YgW1xuICAgICAgICAgICAgWydjYXNjYWRpbmdTdHlsZVNoZWV0JywgJ2NzcyddLFxuICAgICAgICAgICAgWydqYXZhU2NyaXB0JywgJ2pzJ11cbiAgICAgICAgXSlcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluUGxhY2VbdHlwZVswXV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzOkFycmF5PHN0cmluZz4gPSBPYmplY3Qua2V5cyhcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlW3R5cGVbMF1dKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZTpzdHJpbmcgb2YgbWF0Y2hlcylcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5vZmZsaW5lLmV4Y2x1ZGVzLnB1c2gocGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZVswXV1cbiAgICAgICAgICAgICAgICAgICAgKSArIGAke25hbWV9LiR7dHlwZVsxXX0/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PSpgKVxuICAgICAgICAgICAgfVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLk9mZmxpbmUoY29uZmlndXJhdGlvbi5vZmZsaW5lKSlcbn1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIG9wZW5zIGJyb3dzZXIgYXV0b21hdGljYWxseVxuaWYgKGNvbmZpZ3VyYXRpb24uZGV2ZWxvcG1lbnQub3BlbkJyb3dzZXIgJiYgKGh0bWxBdmFpbGFibGUgJiYgW1xuICAgICdzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXG5dLmluY2x1ZGVzKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSkpKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLk9wZW5Ccm93c2VyKFxuICAgICAgICBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50Lm9wZW5Ccm93c2VyKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIHByb3ZpZGUgYnVpbGQgZW52aXJvbm1lbnRcbmlmIChjb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC5kZWZpbml0aW9ucylcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EZWZpbmVQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LmRlZmluaXRpb25zKSlcbmlmIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcm92aWRlKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLlByb3ZpZGVQbHVnaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByb3ZpZGUpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gbW9kdWxlcy9hc3NldHNcbi8vIC8vLyByZWdpb24gcGVyZm9ybSBqYXZhU2NyaXB0IG1pbmlmaWNhdGlvbi9vcHRpbWlzYXRpb25cbmlmIChcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkgJiZcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlXG4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goT2JqZWN0LmtleXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeS5idW5kbGVcbiAgICApLmxlbmd0aCA/XG4gICAgICAgIG5ldyBwbHVnaW5zLkJhYmVsTWluaWZ5KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5LmJ1bmRsZS50cmFuc2Zvcm0gfHwge30sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlLnBsdWdpbiB8fCB7fVxuICAgICAgICApIDpcbiAgICAgICAgbmV3IHBsdWdpbnMuQmFiZWxNaW5pZnkoKVxuICAgIClcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gYXBwbHkgbW9kdWxlIHBhdHRlcm5cbnBsdWdpbkluc3RhbmNlcy5wdXNoKHthcHBseTogKGNvbXBpbGVyOk9iamVjdCk6dm9pZCA9PiB7XG4gICAgY29tcGlsZXIuaG9va3MuZW1pdC50YXAoJ2FwcGx5TW9kdWxlUGF0dGVybicsIChcbiAgICAgICAgY29tcGlsYXRpb246T2JqZWN0XG4gICAgKTp2b2lkID0+IHtcbiAgICAgICAgZm9yIChjb25zdCByZXF1ZXN0OnN0cmluZyBpbiBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICBpZiAoY29tcGlsYXRpb24uYXNzZXRzLmhhc093blByb3BlcnR5KHJlcXVlc3QpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID0gcmVxdWVzdC5yZXBsYWNlKC9cXD9bXj9dKyQvLCAnJylcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV0gJiZcbiAgICAgICAgICAgICAgICAgICAgIShuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZXhjbHVkZUZpbGVQYXRoUmVndWxhckV4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgKSkudGVzdChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc291cmNlOj9zdHJpbmcgPSBjb21waWxhdGlvbi5hc3NldHNbcmVxdWVzdF0uc291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzW3JlcXVlc3RdID0gbmV3IFdlYnBhY2tSYXdTb3VyY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV0ucGF0dGVybi5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXFx7MVxcfS9nLCBzb3VyY2UucmVwbGFjZSgvXFwkL2csICckJCQnKSkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgIH0pXG59fSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gaW4tcGxhY2UgY29uZmlndXJlZCBhc3NldHMgaW4gdGhlIG1haW4gaHRtbCBmaWxlXG5pZiAoaHRtbEF2YWlsYWJsZSAmJiAhWydzZXJ2ZScsICd0ZXN0OmJyb3dzZXInXS5pbmNsdWRlcyhcbiAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbikpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoY29tcGlsZXI6T2JqZWN0KTp2b2lkID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbXBpbGVyLmhvb2tzLmNvbXBpbGF0aW9uLnRhcCgnaW5QbGFjZUhUTUxBc3NldHMnLCAoXG4gICAgICAgICAgICBjb21waWxhdGlvbjpPYmplY3RcbiAgICAgICAgKTp2b2lkID0+XG4gICAgICAgICAgICBjb21waWxhdGlvbi5ob29rcy5odG1sV2VicGFja1BsdWdpbkFmdGVySHRtbFByb2Nlc3NpbmcudGFwQXN5bmMoXG4gICAgICAgICAgICAgICAgJ2luUGxhY2VIVE1MQXNzZXRzJyxcbiAgICAgICAgICAgICAgICAoZGF0YTpQbGFpbk9iamVjdCwgY2FsbGJhY2s6RnVuY3Rpb24pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICkubGVuZ3RoIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQpLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDp7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6c3RyaW5nLCBmaWxlUGF0aHNUb1JlbW92ZTpBcnJheTxzdHJpbmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IEhlbHBlci5pblBsYWNlQ1NTQW5kSmF2YVNjcmlwdEFzc2V0UmVmZXJlbmNlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5odG1sLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmh0bWwgPSByZXN1bHQuY29udGVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoc1RvUmVtb3ZlLmNvbmNhdChyZXN1bHQuZmlsZVBhdGhzVG9SZW1vdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgZGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgY29tcGlsZXIuaG9va3MuYWZ0ZXJFbWl0LnRhcEFzeW5jKFxuICAgICAgICAgICAgJ3JlbW92ZUluUGxhY2VIVE1MQXNzZXRGaWxlcycsIGFzeW5jIChcbiAgICAgICAgICAgICAgICBkYXRhOk9iamVjdCwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICAgICAgICAgICk6UHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21pc2VzOkFycmF5PFByb21pc2U8dm9pZD4+ID0gW11cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhdGg6c3RyaW5nIG9mIGZpbGVQYXRoc1RvUmVtb3ZlKVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXdhaXQgVG9vbHMuaXNGaWxlKHBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChmaWxlU3lzdGVtLnVubGluayhwYXRoKS5jYXRjaChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgICAgIHByb21pc2VzID0gW11cbiAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlOnN0cmluZyBvZiBbJ2phdmFTY3JpcHQnLCAnY2FzY2FkaW5nU3R5bGVTaGVldCddXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKGZpbGVTeXN0ZW0ucmVhZGRpcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7ZW5jb2Rpbmc6IGNvbmZpZ3VyYXRpb24uZW5jb2Rpbmd9XG4gICAgICAgICAgICAgICAgICAgICkudGhlbihhc3luYyAoZmlsZXM6QXJyYXk8c3RyaW5nPik6UHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0ucm1kaXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0pXG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgIH0pXG4gICAgfX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHJlbW92ZSBjaHVua3MgaWYgYSBjb3JyZXNwb25kaW5nIGRsbCBwYWNrYWdlIGV4aXN0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkOmRsbCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hbmlmZXN0RmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9LyR7Y2h1bmtOYW1lfS5gICtcbiAgICAgICAgICAgICAgICBgZGxsLW1hbmlmZXN0Lmpzb25gXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5kbGxNYW5pZmVzdEZpbGVQYXRocy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBtYW5pZmVzdEZpbGVQYXRoXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICApLCB7J1tuYW1lXSc6IGNodW5rTmFtZX0pXG4gICAgICAgICAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuQWRkQXNzZXRIVE1MUGx1Z2luKHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZXBhdGg6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBpbmNsdWRlU291cmNlbWFwOiBUb29scy5pc0ZpbGVTeW5jKGAke2ZpbGVQYXRofS5tYXBgKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRsbFJlZmVyZW5jZVBsdWdpbih7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICBtYW5pZmVzdDogcmVxdWlyZShtYW5pZmVzdEZpbGVQYXRoKX0pKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIG1hcmsgZW1wdHkgamF2YVNjcmlwdCBtb2R1bGVzIGFzIGR1bW15XG5pZiAoIWNvbmZpZ3VyYXRpb24ubmVlZGVkLmphdmFTY3JpcHQpXG4gICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQuamF2YVNjcmlwdCwgJy5fX2R1bW15X18uY29tcGlsZWQuanMnKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBleHRyYWN0IGNhc2NhZGluZyBzdHlsZSBzaGVldHNcbmlmIChjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuY2FzY2FkaW5nU3R5bGVTaGVldCAmJiBwbHVnaW5zLk1pbmlDU1NFeHRyYWN0KVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLk1pbmlDU1NFeHRyYWN0KHtcbiAgICAgICAgY2h1bmtzOiAnW25hbWVdLmNzcycsXG4gICAgICAgIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQpXG4gICAgfSkpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHBlcmZvcm1zIGltcGxpY2l0IGV4dGVybmFsIGxvZ2ljXG5pZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwubW9kdWxlcyA9PT0gJ19faW1wbGljaXRfXycpXG4gICAgLypcbiAgICAgICAgV2Ugb25seSB3YW50IHRvIHByb2Nlc3MgbW9kdWxlcyBmcm9tIGxvY2FsIGNvbnRleHQgaW4gbGlicmFyeSBtb2RlLFxuICAgICAgICBzaW5jZSBhIGNvbmNyZXRlIHByb2plY3QgdXNpbmcgdGhpcyBsaWJyYXJ5IHNob3VsZCBjb21iaW5lIGFsbCBhc3NldHNcbiAgICAgICAgKGFuZCBkZS1kdXBsaWNhdGUgdGhlbSkgZm9yIG9wdGltYWwgYnVuZGxpbmcgcmVzdWx0cy4gTk9URTogT25seSBuYXRpdmVcbiAgICAgICAgamF2YVNjcmlwdCBhbmQganNvbiBtb2R1bGVzIHdpbGwgYmUgbWFya2VkIGFzIGV4dGVybmFsIGRlcGVuZGVuY3kuXG4gICAgKi9cbiAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzID0gYXN5bmMgKFxuICAgICAgICBjb250ZXh0OnN0cmluZywgcmVxdWVzdDpzdHJpbmcsIGNhbGxiYWNrOkZ1bmN0aW9uXG4gICAgKTpQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3QucmVwbGFjZSgvXiErLywgJycpXG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoJy8nKSlcbiAgICAgICAgICAgIHJlcXVlc3QgPSBwYXRoLnJlbGF0aXZlKGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCByZXF1ZXN0KVxuICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoOnN0cmluZyBvZiBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcylcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3Quc3Vic3RyaW5nKGZpbGVQYXRoLmxlbmd0aClcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIC8vIHJlZ2lvbiBwYXR0ZXJuIGJhc2VkIGFsaWFzaW5nXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmaWxlOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZS5leHRlcm5hbCxcbiAgICAgICAgICAgICAgICBtb2R1bGU6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgKVxuICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdHRlcm46c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsXG4gICAgICAgICAgICAgICAgICAgIC5hbGlhc2VzXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybikgJiZcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybi5zdGFydHNXaXRoKCdeJylcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVndWxhckV4cHJlc3Npb246UmVnRXhwID0gbmV3IFJlZ0V4cChwYXR0ZXJuKVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVndWxhckV4cHJlc3Npb24udGVzdChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbcGF0dGVybl1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50UmVndWxhckV4cHJlc3Npb246UmVnRXhwID0gbmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXRDb25maWd1cmF0aW9uKVswXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXQ6c3RyaW5nID0gdGFyZ2V0Q29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXRDb25maWd1cmF0aW9uKVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldC5zdGFydHNXaXRoKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWxpYXNlZFJlcXVlc3Q6c3RyaW5nID0gcmVxdWVzdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudFJlZ3VsYXJFeHByZXNzaW9uLCB0YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsaWFzZWRSZXF1ZXN0ICE9PSByZXF1ZXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IEJvb2xlYW4oSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlZFJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5leHRlcm5hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3QucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRSZWd1bGFyRXhwcmVzc2lvbiwgdGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICBjb25zdCByZXNvbHZlZFJlcXVlc3Q6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVFeHRlcm5hbFJlcXVlc3QoXG4gICAgICAgICAgICByZXF1ZXN0LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmltcGxpY2l0LnBhdHRlcm4uaW5jbHVkZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmltcGxpY2l0LnBhdHRlcm4uZXhjbHVkZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5leHRlcm5hbExpYnJhcnkubm9ybWFsLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmV4dGVybmFsTGlicmFyeS5keW5hbWljLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZ1xuICAgICAgICApXG4gICAgICAgIGlmIChyZXNvbHZlZFJlcXVlc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleXM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICAgICAnYW1kJywgJ2NvbW1vbmpzJywgJ2NvbW1vbmpzMicsICdyb290J11cbiAgICAgICAgICAgIGxldCByZXN1bHQ6UGxhaW5PYmplY3R8c3RyaW5nID0gcmVzb2x2ZWRSZXF1ZXN0XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlcy5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVnaW9uIG5vcm1hbCBhbGlhcyByZXBsYWNlbWVudFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtkZWZhdWx0OiByZXF1ZXN0fVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIF0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleTpzdHJpbmcgb2Yga2V5cylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW3JlcXVlc3RdXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBdID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleTpzdHJpbmcgb2Yga2V5cylcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW3JlcXVlc3RdKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LCBrZXkpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIF0gIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIF0gPT09ICdvYmplY3QnXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBUb29scy5leHRlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW3JlcXVlc3RdKVxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuaGFzT3duUHJvcGVydHkoJ2RlZmF1bHQnKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXk6c3RyaW5nIG9mIGtleXMpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5oYXNPd25Qcm9wZXJ0eShrZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gcmVzdWx0LmRlZmF1bHRcbiAgICAgICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXN1bHQuaGFzT3duUHJvcGVydHkoJ3Jvb3QnKSlcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICByZXN1bHQucm9vdCA9IFtdLmNvbmNhdChyZXN1bHQucm9vdCkubWFwKChcbiAgICAgICAgICAgICAgICAgICAgbmFtZTpzdHJpbmdcbiAgICAgICAgICAgICAgICApOnN0cmluZyA9PiBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShuYW1lKSlcbiAgICAgICAgICAgIGNvbnN0IGV4cG9ydEZvcm1hdDpzdHJpbmcgPSAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwgfHxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmXG4gICAgICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBleHBvcnRGb3JtYXQgPT09ICd1bWQnIHx8IHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnID9cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0IDpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2V4cG9ydEZvcm1hdF0sXG4gICAgICAgICAgICAgICAgZXhwb3J0Rm9ybWF0XG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKClcbiAgICB9XG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGJ1aWxkIGRsbCBwYWNrYWdlc1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ2J1aWxkOmRsbCcpIHtcbiAgICBsZXQgZGxsQ2h1bmtFeGlzdHM6Ym9vbGVhbiA9IGZhbHNlXG4gICAgZm9yIChjb25zdCBjaHVua05hbWU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICkpXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZGxsQ2h1bmtOYW1lcy5pbmNsdWRlcyhjaHVua05hbWUpKVxuICAgICAgICAgICAgICAgIGRsbENodW5rRXhpc3RzID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICBpZiAoZGxsQ2h1bmtFeGlzdHMpIHtcbiAgICAgICAgbGlicmFyeU5hbWUgPSAnW25hbWVdRExMUGFja2FnZSdcbiAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGxsUGx1Z2luKHtcbiAgICAgICAgICAgIHBhdGg6IGAke2NvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZX0vW25hbWVdLmRsbC1tYW5pZmVzdC5qc29uYCxcbiAgICAgICAgICAgIG5hbWU6IGxpYnJhcnlOYW1lXG4gICAgICAgIH0pKVxuICAgIH0gZWxzZVxuICAgICAgICBjb25zb2xlLndhcm4oJ05vIGRsbCBjaHVuayBpZCBmb3VuZC4nKVxufVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gYXBwbHkgZmluYWwgZG9tL2phdmFTY3JpcHQvY2FzY2FkaW5nU3R5bGVTaGVldCBtb2RpZmljYXRpb25zL2ZpeGVzXG5pZiAoaHRtbEF2YWlsYWJsZSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChcbiAgICAgICAgY29tcGlsZXI6T2JqZWN0XG4gICAgKTp2b2lkID0+IGNvbXBpbGVyLmhvb2tzLmNvbXBpbGF0aW9uLnRhcCgnY29tcGlsYXRpb24nLCAoXG4gICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdFxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGNvbXBpbGF0aW9uLmhvb2tzLmh0bWxXZWJwYWNrUGx1Z2luQWx0ZXJBc3NldFRhZ3MudGFwQXN5bmMoXG4gICAgICAgICAgICAncmVtb3ZlRHVtbXlIVE1MVGFncycsXG4gICAgICAgICAgICAoZGF0YTpQbGFpbk9iamVjdCwgY2FsbGJhY2s6RnVuY3Rpb24pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnczpBcnJheTxQbGFpbk9iamVjdD4gb2YgW1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmJvZHksIGRhdGEuaGVhZFxuICAgICAgICAgICAgICAgIF0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4Om51bWJlciA9IDBcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWc6UGxhaW5PYmplY3Qgb2YgdGFncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC9eXFwuX19kdW1teV9fKFxcLi4qKT8kLy50ZXN0KHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnLmF0dHJpYnV0ZXMuc3JjIHx8IHRhZy5hdHRyaWJ1dGVzLmhyZWYgfHwgJydcbiAgICAgICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3Muc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0czpBcnJheTxzdHJpbmc+ID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5wbHVnaW4uYXNzZXRKc29uKVxuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFJlcXVlc3Q6c3RyaW5nIG9mIGFzc2V0cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoL15cXC5fX2R1bW15X18oXFwuLiopPyQvLnRlc3QocGF0aC5iYXNlbmFtZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0UmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0cy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGF0YS5wbHVnaW4uYXNzZXRKc29uID0gSlNPTi5zdHJpbmdpZnkoYXNzZXRzKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpXG4gICAgICAgICAgICB9KVxuICAgICAgICBjb21waWxhdGlvbi5ob29rcy5odG1sV2VicGFja1BsdWdpbkFmdGVySHRtbFByb2Nlc3NpbmcudGFwQXN5bmMoXG4gICAgICAgICAgICAncG9zdFByb2Nlc3NIVE1MJyxcbiAgICAgICAgICAgIChkYXRhOlBsYWluT2JqZWN0LCBjYWxsYmFjazpGdW5jdGlvbik6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byBwcmV2ZW50IGNyZWF0aW5nIG5hdGl2ZSBcInN0eWxlXCIgZG9tIG5vZGVzXG4gICAgICAgICAgICAgICAgICAgIHRvIHByZXZlbnQganNkb20gZnJvbSBwYXJzaW5nIHRoZSBlbnRpcmUgY2FzY2FkaW5nIHN0eWxlXG4gICAgICAgICAgICAgICAgICAgIHNoZWV0LiBXaGljaCBpcyBlcnJvciBwcnVuZSBhbmQgdmVyeSByZXNvdXJjZSBpbnRlbnNpdmUuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBjb25zdCBzdHlsZUNvbnRlbnRzOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICAgICAgICAgIGRhdGEuaHRtbCA9IGRhdGEuaHRtbC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAvKDxzdHlsZVtePl0qPikoW1xcc1xcU10qPykoPFxcL3N0eWxlW14+XSo+KS9naSxcbiAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRUYWc6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICk6c3RyaW5nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlQ29udGVudHMucHVzaChjb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke3N0YXJ0VGFnfSR7ZW5kVGFnfWBcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBsZXQgZG9tOkRPTVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHRyYW5zbGF0ZSB0ZW1wbGF0ZSBkZWxpbWl0ZXIgdG8gaHRtbFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGF0aWJsZSBzZXF1ZW5jZXMgYW5kIHRyYW5zbGF0ZSBpdCBiYWNrIGxhdGVyIHRvXG4gICAgICAgICAgICAgICAgICAgICAgICBhdm9pZCB1bmV4cGVjdGVkIGVzY2FwZSBzZXF1ZW5jZXMgaW4gcmVzdWx0aW5nIGh0bWwuXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGRvbSA9IG5ldyBET00oXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmh0bWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvPCUvZywgJyMjKyMrIysjIycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyU+L2csICcjIy0jLSMtIyMnKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBkYXRhKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBsaW5rYWJsZXM6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xuICAgICAgICAgICAgICAgICAgICBsaW5rOiAnaHJlZicsXG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdDogJ3NyYydcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWdOYW1lOnN0cmluZyBpbiBsaW5rYWJsZXMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rYWJsZXMuaGFzT3duUHJvcGVydHkodGFnTmFtZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGU6RG9tTm9kZSBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbS53aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGFnTmFtZX1bJHtsaW5rYWJsZXNbdGFnTmFtZV19Kj1cIj9gICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IFJlbW92aW5nIHN5bWJvbHMgYWZ0ZXIgYSBcIiZcIiBpbiBoYXNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyBpcyBuZWNlc3NhcnkgdG8gbWF0Y2ggdGhlIGdlbmVyYXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0IHN0cmluZ3MgaW4gb2ZmbGluZSBwbHVnaW4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua2FibGVzW3RhZ05hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb21Ob2RlLmdldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmthYmxlc1t0YWdOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAoXFxcXD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09YCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnW14mXSspLiokJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCAnJDEnKSlcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHJlc3RvcmUgdGVtcGxhdGUgZGVsaW1pdGVyIGFuZCBzdHlsZVxuICAgICAgICAgICAgICAgICAgICBjb250ZW50cy5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGRhdGEuaHRtbCA9IGRvbS5zZXJpYWxpemUoKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyNcXCsjXFwrI1xcKyMjL2csICc8JScpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8jIy0jLSMtIyMvZywgJyU+JylcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg8c3R5bGVbXj5dKj4pW1xcc1xcU10qPyg8XFwvc3R5bGVbXj5dKj4pL2dpLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRhZzpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRUYWc6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtzdGFydFRhZ30ke3N0eWxlQ29udGVudHMuc2hpZnQoKX0ke2VuZFRhZ31gKVxuICAgICAgICAgICAgICAgIC8vIHJlZ2lvbiBwb3N0IGNvbXBpbGF0aW9uXG4gICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaHRtbEZpbGVTcGVjaWZpY2F0aW9uOlBsYWluT2JqZWN0IG9mXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbEZpbGVTcGVjaWZpY2F0aW9uLmZpbGVuYW1lID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wbHVnaW4ub3B0aW9ucy5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZGVyQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxGaWxlU3BlY2lmaWNhdGlvbi50ZW1wbGF0ZS51c2VcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnb3B0aW9ucycpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb21waWxlU3RlcHMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9ucy5jb21waWxlU3RlcHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID09PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5odG1sID0gZWpzTG9hZGVyLmJpbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5leHRlbmQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IGh0bWxGaWxlU3BlY2lmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRlbXBsYXRlLnBvc3RDb21waWxlU3RlcHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKGRhdGEuaHRtbClcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfSl9KVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gYWRkIGF1dG9tYXRpYyBpbWFnZSBjb21wcmVzc2lvblxuLy8gTk9URTogVGhpcyBwbHVnaW4gc2hvdWxkIGJlIGxvYWRlZCBhdCBsYXN0IHRvIGVuc3VyZSB0aGF0IGFsbCBlbWl0dGVkIGltYWdlc1xuLy8gcmFuIHRocm91Z2guXG5pZiAocGx1Z2lucy5JbWFnZW1pbilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5JbWFnZW1pbihcbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmNvbnRlbnQpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gY29udGV4dCByZXBsYWNlbWVudHNcbmZvciAoXG4gICAgY29uc3QgY29udGV4dFJlcGxhY2VtZW50OkFycmF5PHN0cmluZz4gb2ZcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMuY29udGV4dFxuKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkNvbnRleHRSZXBsYWNlbWVudFBsdWdpbihcbiAgICAgICAgLi4uY29udGV4dFJlcGxhY2VtZW50Lm1hcCgodmFsdWU6c3RyaW5nKTphbnkgPT4gKG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICdjb25maWd1cmF0aW9uJywgJ19fZGlybmFtZScsICdfX2ZpbGVuYW1lJywgYHJldHVybiAke3ZhbHVlfWBcbiAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICkpKGNvbmZpZ3VyYXRpb24sIF9fZGlybmFtZSwgX19maWxlbmFtZSkpKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGNvbnNvbGlkYXRlIGR1cGxpY2F0ZWQgbW9kdWxlIHJlcXVlc3RzXG5wbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Ob3JtYWxNb2R1bGVSZXBsYWNlbWVudFBsdWdpbihcbiAgICAvKCg/Ol58XFwvKW5vZGVfbW9kdWxlc1xcLy4rKXsyfS8sXG4gICAgKHJlc291cmNlOntyZXF1ZXN0OnN0cmluZztyZXNvdXJjZTpzdHJpbmc7fSk6dm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldE5hbWU6c3RyaW5nID0gcmVzb3VyY2UucmVxdWVzdCA/ICdyZXF1ZXN0JyA6ICdyZXNvdXJjZSdcbiAgICAgICAgY29uc3QgdGFyZ2V0UGF0aDpzdHJpbmcgPSByZXNvdXJjZVt0YXJnZXROYW1lXVxuICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyh0YXJnZXRQYXRoKSkge1xuICAgICAgICAgICAgY29uc3QgcGFja2FnZURlc2NyaXB0b3I6P1BsYWluT2JqZWN0ID1cbiAgICAgICAgICAgICAgICBIZWxwZXIuZ2V0Q2xvc2VzdFBhY2thZ2VEZXNjcmlwdG9yKHRhcmdldFBhdGgpXG4gICAgICAgICAgICBpZiAocGFja2FnZURlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoUHJlZml4ZXM6QXJyYXk8c3RyaW5nPiA9IHRhcmdldFBhdGgubWF0Y2goXG4gICAgICAgICAgICAgICAgICAgIC8oKD86XnwuKj9cXC8pbm9kZV9tb2R1bGVzXFwvKS9nKVxuICAgICAgICAgICAgICAgIC8vIEF2b2lkIGZpbmRpbmcgdGhlIHNhbWUgYXJ0ZWZhY3QuXG4gICAgICAgICAgICAgICAgcGF0aFByZWZpeGVzLnBvcCgpXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4Om51bWJlciA9IDBcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhdGhQcmVmaXg6c3RyaW5nIG9mIHBhdGhQcmVmaXhlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFByZWZpeGVzW2luZGV4XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoUHJlZml4ZXNbaW5kZXggLSAxXSwgcGF0aFByZWZpeClcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoU3VmZml4OnN0cmluZyA9IHRhcmdldFBhdGgucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLyg/Ol58LipcXC8pbm9kZV9tb2R1bGVzXFwvKC4rJCkvLCAnJDEnKVxuICAgICAgICAgICAgICAgIGxldCByZWR1bmRhbnRSZXF1ZXN0Oj9QbGFpbk9iamVjdCA9IG51bGxcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhdGhQcmVmaXg6c3RyaW5nIG9mIHBhdGhQcmVmaXhlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbHRlcm5hdGVUYXJnZXRQYXRoOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhQcmVmaXgsIHBhdGhTdWZmaXgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKGFsdGVybmF0ZVRhcmdldFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbHRlcm5hdGVQYWNrYWdlRGVzY3JpcHRvcjpQbGFpbk9iamVjdCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmdldENsb3Nlc3RQYWNrYWdlRGVzY3JpcHRvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRlVGFyZ2V0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlRGVzY3JpcHRvci5jb25maWd1cmF0aW9uLnZlcnNpb24gPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRlUGFja2FnZURlc2NyaXB0b3IuY29uZmlndXJhdGlvbi52ZXJzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBDb25zb2xpZGF0ZSBtb2R1bGUgcmVxdWVzdCBcIiR7dGFyZ2V0UGF0aH1cIiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHRvIFwiJHthbHRlcm5hdGVUYXJnZXRQYXRofVwiLmBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VbdGFyZ2V0TmFtZV0gPSBhbHRlcm5hdGVUYXJnZXRQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWR1bmRhbnRSZXF1ZXN0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBhbHRlcm5hdGVUYXJnZXRQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBhbHRlcm5hdGVQYWNrYWdlRGVzY3JpcHRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmZpZ3VyYXRpb24udmVyc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVkdW5kYW50UmVxdWVzdClcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0luY2x1ZGluZyBkaWZmZXJlbnQgdmVyc2lvbnMgb2Ygc2FtZSBwYWNrYWdlIFwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtwYWNrYWdlRGVzY3JpcHRvci5jb25maWd1cmF0aW9uLm5hbWV9XCIuIE1vZHVsZSBcImAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGFyZ2V0UGF0aH1cIiAodmVyc2lvbiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3BhY2thZ2VEZXNjcmlwdG9yLmNvbmZpZ3VyYXRpb24udmVyc2lvbn0pIGhhcyBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGByZWR1bmRhbmNpZXMgd2l0aCBcIiR7cmVkdW5kYW50UmVxdWVzdC5wYXRofVwiIChgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGB2ZXJzaW9uICR7cmVkdW5kYW50UmVxdWVzdC52ZXJzaW9ufSkuYFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4pKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gbG9hZGVyIGhlbHBlclxuY29uc3QgaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzOkZ1bmN0aW9uID0gKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgZmlsZVBhdGggPSBIZWxwZXIuc3RyaXBMb2FkZXIoZmlsZVBhdGgpXG4gICAgcmV0dXJuIEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aClcbiAgICAgICAgKVxuICAgIClcbn1cbmNvbnN0IGdlbmVyYXRlTG9hZGVyOkZ1bmN0aW9uID0gKFxuICAgIGxvYWRlckNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3Rcbik6UGxhaW5PYmplY3QgPT4gKHtcbiAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IGV2YWx1YXRlKFxuICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmV4Y2x1ZGUgfHwgJ2ZhbHNlJywgZmlsZVBhdGgpLFxuICAgIGluY2x1ZGU6XG4gICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uaW5jbHVkZSAmJlxuICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24uaW5jbHVkZSwgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQpIHx8XG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYmFzZSxcbiAgICB0ZXN0OiBuZXcgUmVnRXhwKGV2YWx1YXRlKFxuICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLnRlc3QsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0KSksXG4gICAgdXNlOiBldmFsdWF0ZShsb2FkZXJDb25maWd1cmF0aW9uLnVzZSlcbn0pXG5jb25zdCBsb2FkZXI6T2JqZWN0ID0ge31cbmNvbnN0IHNjb3BlOk9iamVjdCA9IHtcbiAgICBjb25maWd1cmF0aW9uLFxuICAgIGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llcyxcbiAgICBsb2FkZXIsXG4gICAgcmVxdWlyZTogZXZhbCgncmVxdWlyZScpXG59XG5jb25zdCBldmFsdWF0ZTpGdW5jdGlvbiA9IChjb2RlOnN0cmluZywgZmlsZVBhdGg6c3RyaW5nKTphbnkgPT4gKG5ldyBGdW5jdGlvbihcbiAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAnZmlsZVBhdGgnLCAuLi5PYmplY3Qua2V5cyhzY29wZSksIGByZXR1cm4gJHtjb2RlfWBcbi8vIElnbm9yZVR5cGVDaGVja1xuKSkoZmlsZVBhdGgsIC4uLk9iamVjdC52YWx1ZXMoc2NvcGUpKVxuY29uc3QgaW5jbHVkaW5nUGF0aHM6QXJyYXk8c3RyaW5nPiA9IEhlbHBlci5ub3JtYWxpemVQYXRocyhbXG4gICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5qYXZhU2NyaXB0XG5dLmNvbmNhdChjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHMpKVxuVG9vbHMuZXh0ZW5kKGxvYWRlciwge1xuICAgIC8vIENvbnZlcnQgdG8gY29tcGF0aWJsZSBuYXRpdmUgd2ViIHR5cGVzLlxuICAgIC8vIHJlZ2lvbiBnZW5lcmljIHRlbXBsYXRlXG4gICAgZWpzOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICApLm1hcCgoaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24pOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICApLmluY2x1ZGVzKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgKChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmV4Y2x1ZGUgPT09IG51bGwpID9cbiAgICAgICAgICAgICAgICBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuZXhjbHVkZSwgZmlsZVBhdGgpKSxcbiAgICAgICAgaW5jbHVkZTogaW5jbHVkaW5nUGF0aHMsXG4gICAgICAgIHRlc3Q6IC9eKD8hLitcXC5odG1sXFwuZWpzJCkuK1xcLmVqcyQvaSxcbiAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlXG4gICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAge2xvYWRlcjogJ2ZpbGU/bmFtZT1bcGF0aF1bbmFtZV0nICsgKEJvb2xlYW4oXG4gICAgICAgICAgICAgICAgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMub3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICAgICAgICAgIH0pLmNvbXBpbGVTdGVwcyAlIDJcbiAgICAgICAgICAgICkgPyAnLmpzJyA6ICcnKSArIGA/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVtoYXNoXWB9LFxuICAgICAgICAgICAge2xvYWRlcjogJ2V4dHJhY3QnfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuYWRkaXRpb25hbC5wb3N0Lm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gc2NyaXB0XG4gICAgc2NyaXB0OiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gZXZhbHVhdGUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5leGNsdWRlLCBmaWxlUGF0aFxuICAgICAgICApLFxuICAgICAgICBpbmNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDphbnkgPSBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5pbmNsdWRlLCBmaWxlUGF0aClcbiAgICAgICAgICAgIGlmIChbbnVsbCwgdW5kZWZpbmVkXS5pbmNsdWRlcyhyZXN1bHQpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpbmNsdWRlUGF0aDpzdHJpbmcgb2YgaW5jbHVkaW5nUGF0aHMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aC5zdGFydHNXaXRoKGluY2x1ZGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQm9vbGVhbihyZXN1bHQpXG4gICAgICAgIH0sXG4gICAgICAgIHRlc3Q6IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5yZWd1bGFyRXhwcmVzc2lvbiwgJ2knXG4gICAgICAgICksXG4gICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuYWRkaXRpb25hbC5wcmUubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGh0bWwgdGVtcGxhdGVcbiAgICBodG1sOiB7XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgb25seSBmb3IgdGhlIG1haW4gZW50cnkgdGVtcGxhdGUuXG4gICAgICAgIG1haW46IHtcbiAgICAgICAgICAgIHRlc3Q6IG5ldyBSZWdFeHAoJ14nICsgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUuZmlsZVBhdGhcbiAgICAgICAgICAgICkgKyAnKD86XFxcXD8uKik/JCcpLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLnVzZVxuICAgICAgICB9LFxuICAgICAgICBlanM6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbC5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAgICAgICAgICAgICApLm1hcCgoaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24pOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aClcbiAgICAgICAgICAgICkuaW5jbHVkZXMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAgICAgKChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5leGNsdWRlID09PSBudWxsKSA/XG4gICAgICAgICAgICAgICAgICAgIGZhbHNlIDogZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5leGNsdWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgpKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQudGVtcGxhdGUsXG4gICAgICAgICAgICB0ZXN0OiAvXFwuaHRtbFxcLmVqcyg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6ICdmaWxlP25hbWU9JyArIHBhdGguam9pbihwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICApLCAnW25hbWVdJyArIChCb29sZWFuKFxuICAgICAgICAgICAgICAgICAgICAgICAgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLm9wdGlvbnMgfHwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY29tcGlsZVN0ZXBzICUgMlxuICAgICAgICAgICAgICAgICAgICApID8gJy5qcycgOiAnJykgKyBgPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKEJvb2xlYW4oKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVTdGVwczogMlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKS5jb21waWxlU3RlcHMgJSAyKSA/IFtdIDogW1xuICAgICAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwuYWRkaXRpb25hbC5wb3N0Lm1hcChcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9LFxuICAgICAgICBodG1sOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgICAgICApLmluY2x1ZGVzKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgICAgICgoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5leGNsdWRlID09PSBudWxsKSA/XG4gICAgICAgICAgICAgICAgICAgIHRydWUgOlxuICAgICAgICAgICAgICAgICAgICBldmFsdWF0ZShjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmV4Y2x1ZGUsIGZpbGVQYXRoKSksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LnRlbXBsYXRlLFxuICAgICAgICAgICAgdGVzdDogL1xcLmh0bWwoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmFkZGl0aW9uYWwucHJlLmNvbmNhdChcbiAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZmlsZT9uYW1lPScgKyBwYXRoLmpvaW4ocGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LnRlbXBsYXRlXG4gICAgICAgICAgICAgICAgKSwgYFtuYW1lXS5bZXh0XT8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdYCl9LFxuICAgICAgICAgICAgICAgIHtsb2FkZXI6ICdleHRyYWN0J30sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuYWRkaXRpb25hbC5wb3N0Lm1hcChldmFsdWF0ZSkpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIExvYWQgZGVwZW5kZW5jaWVzLlxuICAgIC8vIHJlZ2lvbiBzdHlsZVxuICAgIHN0eWxlOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5leGNsdWRlID09PSBudWxsXG4gICAgICAgICkgPyBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICBpbmNsdWRlOiBpbmNsdWRpbmdQYXRocyxcbiAgICAgICAgdGVzdDogL1xcLnM/Y3NzKD86XFw/LiopPyQvaSxcbiAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldC5hZGRpdGlvbmFsXG4gICAgICAgICAgICAucHJlLmNvbmNhdChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuc3R5bGUubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5zdHlsZS5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0Lm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBUb29scy5leHRlbmQodHJ1ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRlbnQ6ICdwb3N0Y3NzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbnM6ICgpOkFycmF5PE9iamVjdD4gPT4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NJbXBvcnQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGREZXBlbmRlbmN5VG86IHdlYnBhY2ssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3Q6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0uY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3NvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FzY2FkaW5nU3R5bGVTaGVldC5hZGRpdGlvbmFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wbHVnaW5zLnByZS5tYXAoZXZhbHVhdGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NQcmVzZXRFTlYoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3NvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQucG9zdGNzc1ByZXNldEVudiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogQ2hlY2tpbmcgcGF0aCBkb2Vzbid0IHdvcmsgaWYgZm9udHMgYXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZmVyZW5jZWQgaW4gbGlicmFyaWVzIHByb3ZpZGVkIGluIGFub3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24gdGhhbiB0aGUgcHJvamVjdCBpdHNlbGYgbGlrZSB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJub2RlX21vZHVsZXNcIiBmb2xkZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzRm9udFBhdGgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja1BhdGg6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dHlwZTogJ3dvZmYyJywgZXh0OiAnd29mZjInfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0eXBlOiAnd29mZicsIGV4dDogJ3dvZmYnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc1VSTCh7dXJsOiAncmViYXNlJ30pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NTcHJpdGVzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnk6ICgpOlByb21pc2U8bnVsbD4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6UHJvbWlzZTxudWxsPiA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmltYWdlID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSA6IHJlamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9va3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZVNwcml0ZXNoZWV0OiAoaW1hZ2U6T2JqZWN0KTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLnNwcml0ZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmltYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmltYWdlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzaGVldFBhdGg6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwcml0ZVBhdGg6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmltYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXNjYWRpbmdTdHlsZVNoZWV0LmFkZGl0aW9uYWwucGx1Z2lucy5wb3N0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZXZhbHVhdGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5jc3NuYW5vID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0NTU25hbm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuY3NzbmFub1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogW10pXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgICAgICAub3B0aW9ucyB8fCB7fSlcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgIC5hZGRpdGlvbmFsLnBvc3QubWFwKGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIE9wdGltaXplIGxvYWRlZCBhc3NldHMuXG4gICAgLy8gcmVnaW9uIGZvbnRcbiAgICBmb250OiB7XG4gICAgICAgIGVvdDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICB0ZXN0OiAvXFwuZW90KD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5vcHRpb25zIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgc3ZnOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5zdmcoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcuYWRkaXRpb25hbC5wcmUubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlXG4gICAgICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLm9wdGlvbnMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcuYWRkaXRpb25hbC5wb3N0Lm1hcChcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9LFxuICAgICAgICB0dGY6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICAgICAgdGVzdDogL1xcLnR0Zig/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYub3B0aW9ucyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5hZGRpdGlvbmFsLnBvc3QubWFwKFxuICAgICAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHdvZmY6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5leGNsdWRlLCBmaWxlUGF0aFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB0ZXN0OiAvXFwud29mZjI/KD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5hZGRpdGlvbmFsLnBvc3QubWFwKFxuICAgICAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBpbWFnZVxuICAgIGltYWdlOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgKSA/IGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgZXZhbHVhdGUoY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5pbWFnZSxcbiAgICAgICAgdGVzdDogL1xcLig/OnBuZ3xqcGd8aWNvfGdpZikoPzpcXD8uKik/JC9pLFxuICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmZpbGUgfHwge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuYWRkaXRpb25hbC5wb3N0Lm1hcChldmFsdWF0ZSkpXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gZGF0YVxuICAgIGRhdGE6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW50ZXJuYWwuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgcGF0aC5leHRuYW1lKEhlbHBlci5zdHJpcExvYWRlcihmaWxlUGF0aCkpXG4gICAgICAgICAgICApIHx8ICgoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llcyhmaWxlUGF0aCkgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICB0ZXN0OiAvLisvLFxuICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlXG4gICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5hZGRpdGlvbmFsLnBvc3QubWFwKGV2YWx1YXRlKSlcbiAgICB9XG4gICAgLy8gZW5kcmVnaW9uXG59KVxuaWYgKFxuICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0ICYmXG4gICAgcGx1Z2lucy5NaW5pQ1NTRXh0cmFjdFxuKSB7XG4gICAgLypcbiAgICAgICAgTk9URTogV2UgaGF2ZSB0byByZW1vdmUgdGhlIGNsaWVudCBzaWRlIGphdmFzY3JpcHQgaG1yIHN0eWxlIGxvYWRlclxuICAgICAgICBmaXJzdC5cbiAgICAqL1xuICAgIGxvYWRlci5zdHlsZS51c2Uuc2hpZnQoKVxuICAgIGxvYWRlci5zdHlsZS51c2UudW5zaGlmdChwbHVnaW5zLk1pbmlDU1NFeHRyYWN0LmxvYWRlcilcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbmZvciAoY29uc3QgcGx1Z2luQ29uZmlndXJhdGlvbjpQbHVnaW5Db25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24ucGx1Z2lucylcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgKGV2YWwoJ3JlcXVpcmUnKShwbHVnaW5Db25maWd1cmF0aW9uLm5hbWUubW9kdWxlKVtcbiAgICAgICAgcGx1Z2luQ29uZmlndXJhdGlvbi5uYW1lLmluaXRpYWxpemVyXG4gICAgXSkoLi4ucGx1Z2luQ29uZmlndXJhdGlvbi5wYXJhbWV0ZXIpKVxuLy8gcmVnaW9uIGNvbmZpZ3VyYXRpb25cbmxldCBjdXN0b21Db25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0ge31cbmlmIChjb25maWd1cmF0aW9uLnBhdGguY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLnBhdGguY29uZmlndXJhdGlvbi5qc29uKVxuICAgIHRyeSB7XG4gICAgICAgIGN1c3RvbUNvbmZpZ3VyYXRpb24gPSByZXF1aXJlKGNvbmZpZ3VyYXRpb24ucGF0aC5jb25maWd1cmF0aW9uLmpzb24pXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5leHBvcnQgY29uc3Qgd2VicGFja0NvbmZpZ3VyYXRpb246V2VicGFja0NvbmZpZ3VyYXRpb24gPSBUb29scy5leHRlbmQoXG4gICAgdHJ1ZSxcbiAgICB7XG4gICAgICAgIGJhaWw6IHRydWUsXG4gICAgICAgIGNhY2hlOiBjb25maWd1cmF0aW9uLmNhY2hlLm1haW4sXG4gICAgICAgIGNvbnRleHQ6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICBkZXZ0b29sOiBjb25maWd1cmF0aW9uLmRldmVsb3BtZW50LnRvb2wsXG4gICAgICAgIGRldlNlcnZlcjogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5zZXJ2ZXIsXG4gICAgICAgIC8vIHJlZ2lvbiBpbnB1dFxuICAgICAgICBlbnRyeTogY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZCxcbiAgICAgICAgZXh0ZXJuYWxzOiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhbGlhczogY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgIGFsaWFzRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgZXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW50ZXJuYWwsXG4gICAgICAgICAgICBtYWluRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgbWFpbkZpbGVzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICBtb2R1bGVFeHRlbnNpb25zOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMubW9kdWxlLFxuICAgICAgICAgICAgbW9kdWxlczogSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzKSxcbiAgICAgICAgICAgIHN5bWxpbmtzOiBmYWxzZSxcbiAgICAgICAgICAgIHVuc2FmZUNhY2hlOiBjb25maWd1cmF0aW9uLmNhY2hlLnVuc2FmZVxuICAgICAgICB9LFxuICAgICAgICByZXNvbHZlTG9hZGVyOiB7XG4gICAgICAgICAgICBhbGlhczogY29uZmlndXJhdGlvbi5sb2FkZXIuYWxpYXNlcyxcbiAgICAgICAgICAgIGFsaWFzRmllbGRzOiBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgZXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5sb2FkZXIuZXh0ZW5zaW9ucy5maWxlLFxuICAgICAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIG1haW5GaWxlczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgbW9kdWxlRXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5sb2FkZXIuZXh0ZW5zaW9ucy5tb2R1bGUsXG4gICAgICAgICAgICBtb2R1bGVzOiBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIHN5bWxpbmtzOiBmYWxzZVxuICAgICAgICB9LFxuICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgLy8gcmVnaW9uIG91dHB1dFxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgIGZpbGVuYW1lOiBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCksXG4gICAgICAgICAgICBoYXNoRnVuY3Rpb246IGNvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobSxcbiAgICAgICAgICAgIGxpYnJhcnk6IGxpYnJhcnlOYW1lLFxuICAgICAgICAgICAgbGlicmFyeVRhcmdldDogKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ2J1aWxkOmRsbCdcbiAgICAgICAgICAgICkgPyAndmFyJyA6IGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LnNlbGYsXG4gICAgICAgICAgICBwYXRoOiBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICBwdWJsaWNQYXRoOiBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LnB1YmxpYyxcbiAgICAgICAgICAgIHVtZE5hbWVkRGVmaW5lOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHBlcmZvcm1hbmNlOiBjb25maWd1cmF0aW9uLnBlcmZvcm1hbmNlSGludHMsXG4gICAgICAgIHRhcmdldDogY29uZmlndXJhdGlvbi50YXJnZXRUZWNobm9sb2d5LFxuICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgbW9kZTogY29uZmlndXJhdGlvbi5kZWJ1ZyA/ICdkZXZlbG9wbWVudCcgOiAncHJvZHVjdGlvbicsXG4gICAgICAgIG1vZHVsZToge1xuICAgICAgICAgICAgcnVsZXM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZUxvYWRlclxuICAgICAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICAgICAgbG9hZGVyLmVqcyxcbiAgICAgICAgICAgICAgICBsb2FkZXIuc2NyaXB0LFxuICAgICAgICAgICAgICAgIGxvYWRlci5odG1sLm1haW4sIGxvYWRlci5odG1sLmVqcywgbG9hZGVyLmh0bWwuaHRtbCxcbiAgICAgICAgICAgICAgICBsb2FkZXIuc3R5bGUsXG4gICAgICAgICAgICAgICAgbG9hZGVyLmZvbnQuZW90LCBsb2FkZXIuZm9udC5zdmcsIGxvYWRlci5mb250LnR0ZixcbiAgICAgICAgICAgICAgICBsb2FkZXIuZm9udC53b2ZmLFxuICAgICAgICAgICAgICAgIGxvYWRlci5pbWFnZSxcbiAgICAgICAgICAgICAgICBsb2FkZXIuZGF0YSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5hZGRpdGlvbmFsLnBvc3QubWFwKGdlbmVyYXRlTG9hZGVyKVxuICAgICAgICAgICAgKVxuICAgICAgICB9LFxuICAgICAgICBub2RlOiBjb25maWd1cmF0aW9uLm5vZGVFbnZpcm9ubWVudCxcbiAgICAgICAgb3B0aW1pemF0aW9uOiB7XG4gICAgICAgICAgICBtaW5pbWl6ZTogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLm1pbmltaXplLFxuICAgICAgICAgICAgbWluaW1pemVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIubWluaW1pemVyLFxuICAgICAgICAgICAgLy8gcmVnaW9uIGNvbW1vbiBjaHVua3NcbiAgICAgICAgICAgIHNwbGl0Q2h1bmtzOiAoXG4gICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmNodW5rcyB8fFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24udGFyZ2V0VGVjaG5vbG9neSAhPT0gJ3dlYicgfHxcbiAgICAgICAgICAgICAgICBbJ2J1aWxkOmRsbCcsICd0ZXN0J10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkgP1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2FjaGVHcm91cHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVuZG9yczogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gOiBUb29scy5leHRlbmQoXG4gICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rczogJ2FsbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWNoZUdyb3Vwczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlbmRvcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtzOiAobW9kdWxlOk9iamVjdCk6Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0ICE9PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lOnN0cmluZyBvZiBPYmplY3Qua2V5cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lID09PSAnKicgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPT09IG1vZHVsZS5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IC0xMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV1c2VFeGlzdGluZ0NodW5rOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0OiAvW1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL10vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5jaHVua3NcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgfSxcbiAgICAgICAgcGx1Z2luczogcGx1Z2luSW5zdGFuY2VzXG4gICAgfSxcbiAgICBjb25maWd1cmF0aW9uLndlYnBhY2ssXG4gICAgY3VzdG9tQ29uZmlndXJhdGlvblxuKVxuaWYgKFxuICAgICFBcnJheS5pc0FycmF5KGNvbmZpZ3VyYXRpb24ubW9kdWxlLnNraXBQYXJzZVJlZ3VsYXJFeHByZXNzaW9ucykgfHxcbiAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnMubGVuZ3RoXG4pXG4gICAgd2VicGFja0NvbmZpZ3VyYXRpb24ubW9kdWxlLm5vUGFyc2UgPVxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnNcbmlmIChcbiAgICBjb25maWd1cmF0aW9uLnBhdGguY29uZmlndXJhdGlvbiAmJlxuICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb25maWd1cmF0aW9uLmphdmFTY3JpcHRcbikge1xuICAgIGxldCByZXN1bHQ6T2JqZWN0XG4gICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gcmVxdWlyZShjb25maWd1cmF0aW9uLnBhdGguY29uZmlndXJhdGlvbi5qYXZhU2NyaXB0KVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIGlmIChyZXN1bHQpXG4gICAgICAgIGlmIChyZXN1bHQuaGFzT3duUHJvcGVydHkoJ3JlcGxhY2VXZWJPcHRpbWl6ZXInKSlcbiAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgd2VicGFja0NvbmZpZ3VyYXRpb24gPSB3ZWJwYWNrQ29uZmlndXJhdGlvbi5yZXBsYWNlV2ViT3B0aW1pemVyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFRvb2xzLmV4dGVuZCh0cnVlLCB3ZWJwYWNrQ29uZmlndXJhdGlvbiwgcmVzdWx0KVxufVxuaWYgKGNvbmZpZ3VyYXRpb24uc2hvd0NvbmZpZ3VyYXRpb24pIHtcbiAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICdVc2luZyBpbnRlcm5hbCBjb25maWd1cmF0aW9uOicsXG4gICAgICAgIHV0aWwuaW5zcGVjdChjb25maWd1cmF0aW9uLCB7ZGVwdGg6IG51bGx9KVxuICAgIClcbiAgICBjb25zb2xlLmluZm8oJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJylcbiAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICdVc2luZyB3ZWJwYWNrIGNvbmZpZ3VyYXRpb246JyxcbiAgICAgICAgdXRpbC5pbnNwZWN0KHdlYnBhY2tDb25maWd1cmF0aW9uLCB7ZGVwdGg6IG51bGx9KVxuICAgIClcbn1cbi8vIGVuZHJlZ2lvblxuZXhwb3J0IGRlZmF1bHQgd2VicGFja0NvbmZpZ3VyYXRpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19