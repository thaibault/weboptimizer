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

require.cache[require.resolve('html-loader')].exports = function () {
  _clientnode["default"].extend(true, this.options, module, this.options);

  for (var _len = arguments.length, parameter = new Array(_len), _key = 0; _key < _len; _key++) {
    parameter[_key] = arguments[_key];
  }

  return _htmlLoader["default"].call.apply(_htmlLoader["default"], [this].concat(parameter));
}; // Monkey-Patch loader-utils to define which url is a local request.


var loaderUtilsIsUrlRequestBackup = _loaderUtils["default"].isUrlRequest;

require.cache[require.resolve('loader-utils')].exports.isUrlRequest = function (url) {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQVlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTs7QUFVQTs7QUFDQTs7QUFDQTs7QUF1QkE7O0FBQ0E7O0FBQ0E7O0FBc0JBOztBQU1BOztBQUNBOztBQUtBOztBQVFBOztBQTFFQSxJQUFJO0FBQ0E7QUFDQSxNQUFJLGNBQXVCLEdBQUcsT0FBTyxDQUFDLFNBQUQsQ0FBckM7QUFDSCxDQUhELENBR0UsT0FBTyxLQUFQLEVBQWMsQ0FBRTtBQUNsQjs7O0FBSUE7QUFDQSxJQUFJO0FBQ0E7QUFDQSxNQUFJLGdCQUF5QixHQUFHLE9BQU8sQ0FBQyxvQkFBRCxDQUF2QztBQUNILENBSEQsQ0FHRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUNsQixJQUFJO0FBQ0E7QUFDQSxNQUFJLGVBQXdCLEdBQUcsT0FBTyxDQUFDLGtCQUFELENBQXRDO0FBQ0gsQ0FIRCxDQUdFLE9BQU8sS0FBUCxFQUFjLENBQUU7O0FBQ2xCLElBQUk7QUFDQTtBQUNBLE1BQUksYUFBc0IsR0FBRyxPQUFPLENBQUMsZ0JBQUQsQ0FBcEM7QUFDSCxDQUhELENBR0UsT0FBTyxLQUFQLEVBQWMsQ0FBRTs7QUFDbEIsSUFBSTtBQUNBO0FBQ0EsTUFBSSxjQUF1QixHQUFHLE9BQU8sQ0FBQyxpQkFBRCxDQUFyQztBQUNILENBSEQsQ0FHRSxPQUFPLEtBQVAsRUFBYyxDQUFFOztBQUNsQixJQUFJO0FBQ0E7QUFDQSxNQUFJLFVBQW1CLEdBQUcsT0FBTyxDQUFDLGFBQUQsQ0FBakM7QUFDSCxDQUhELENBR0UsT0FBTyxLQUFQLEVBQWMsQ0FBRTtBQUNsQjs7O0FBS0EsSUFBTSx5QkFBK0MsR0FBRztBQUNwRCxFQUFBLFdBQVcsRUFBRSw2QkFEdUM7QUFFcEQsRUFBQSxJQUFJLEVBQUUscUJBRjhDO0FBR3BELEVBQUEsY0FBYyxFQUFFLHlCQUhvQztBQUlw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SSx5QkFBYyxpQkFBbEIsRUFBcUM7QUFDakMsRUFBQSxPQUFPLENBQUMsSUFBUixDQUNJLCtCQURKLEVBRUksaUJBQUssT0FBTCxDQUFhLHdCQUFiLEVBQTRCO0FBQUMsSUFBQSxLQUFLLEVBQUU7QUFBUixHQUE1QixDQUZKO0FBSUEsRUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLDZEQUFiO0FBQ0EsRUFBQSxPQUFPLENBQUMsSUFBUixDQUNJLDhCQURKLEVBRUksaUJBQUssT0FBTCxDQUFhLG9CQUFiLEVBQW1DO0FBQUMsSUFBQSxLQUFLLEVBQUU7QUFBUixHQUFuQyxDQUZKO0FBSUgsQyxDQUNEOzs7ZUFDZSxvQixFQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6IndlYnBhY2tDb25maWd1cmF0b3IuY29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zXG4gICAgbmFtaW5nIDMuMCB1bnBvcnRlZCBsaWNlbnNlLlxuICAgIFNlZSBodHRwczovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IHR5cGUge0RvbU5vZGUsIFBsYWluT2JqZWN0LCBQcm9jZWR1cmVGdW5jdGlvbiwgV2luZG93fSBmcm9tICdjbGllbnRub2RlJ1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tdmFyICovXG50cnkge1xuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIHZhciBwb3N0Y3NzQ1NTbmFubzpGdW5jdGlvbiA9IHJlcXVpcmUoJ2Nzc25hbm8nKVxufSBjYXRjaCAoZXJyb3IpIHt9XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXZhciAqL1xuaW1wb3J0IHtKU0RPTSBhcyBET019IGZyb20gJ2pzZG9tJ1xuaW1wb3J0IHtwcm9taXNlcyBhcyBmaWxlU3lzdGVtfSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby12YXIgKi9cbnRyeSB7XG4gICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgdmFyIHBvc3Rjc3NQcmVzZXRFTlY6RnVuY3Rpb24gPSByZXF1aXJlKCdwb3N0Y3NzLXByZXNldC1lbnYnKVxufSBjYXRjaCAoZXJyb3IpIHt9XG50cnkge1xuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIHZhciBwb3N0Y3NzRm9udFBhdGg6RnVuY3Rpb24gPSByZXF1aXJlKCdwb3N0Y3NzLWZvbnRwYXRoJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxudHJ5IHtcbiAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICB2YXIgcG9zdGNzc0ltcG9ydDpGdW5jdGlvbiA9IHJlcXVpcmUoJ3Bvc3Rjc3MtaW1wb3J0Jylcbn0gY2F0Y2ggKGVycm9yKSB7fVxudHJ5IHtcbiAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICB2YXIgcG9zdGNzc1Nwcml0ZXM6RnVuY3Rpb24gPSByZXF1aXJlKCdwb3N0Y3NzLXNwcml0ZXMnKVxufSBjYXRjaCAoZXJyb3IpIHt9XG50cnkge1xuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIHZhciBwb3N0Y3NzVVJMOkZ1bmN0aW9uID0gcmVxdWlyZSgncG9zdGNzcy11cmwnKVxufSBjYXRjaCAoZXJyb3IpIHt9XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXZhciAqL1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcbmltcG9ydCB3ZWJwYWNrIGZyb20gJ3dlYnBhY2snXG5pbXBvcnQge1Jhd1NvdXJjZSBhcyBXZWJwYWNrUmF3U291cmNlfSBmcm9tICd3ZWJwYWNrLXNvdXJjZXMnXG5cbmNvbnN0IHBsdWdpbk5hbWVSZXNvdXJjZU1hcHBpbmc6e1trZXk6c3RyaW5nXTpzdHJpbmd9ID0ge1xuICAgIEJhYmVsTWluaWZ5OiAnYmFiZWwtbWluaWZ5LXdlYnBhY2stcGx1Z2luJyxcbiAgICBIVE1MOiAnaHRtbC13ZWJwYWNrLXBsdWdpbicsXG4gICAgTWluaUNTU0V4dHJhY3Q6ICdtaW5pLWNzcy1leHRyYWN0LXBsdWdpbicsXG4gICAgQWRkQXNzZXRIVE1MUGx1Z2luOiAnYWRkLWFzc2V0LWh0bWwtd2VicGFjay1wbHVnaW4nLFxuICAgIE9wZW5Ccm93c2VyOiAnb3Blbi1icm93c2VyLXdlYnBhY2stcGx1Z2luJyxcbiAgICBGYXZpY29uOiAnZmF2aWNvbnMtd2VicGFjay1wbHVnaW4nLFxuICAgIEltYWdlbWluOiAnaW1hZ2VtaW4td2VicGFjay1wbHVnaW4nLFxuICAgIE9mZmxpbmU6ICdvZmZsaW5lLXBsdWdpbidcbn1cbmNvbnN0IHBsdWdpbnM6T2JqZWN0ID0ge31cbmZvciAoY29uc3QgbmFtZTpzdHJpbmcgaW4gcGx1Z2luTmFtZVJlc291cmNlTWFwcGluZylcbiAgICBpZiAocGx1Z2luTmFtZVJlc291cmNlTWFwcGluZy5oYXNPd25Qcm9wZXJ0eShuYW1lKSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgcGx1Z2luc1tuYW1lXSA9IHJlcXVpcmUocGx1Z2luTmFtZVJlc291cmNlTWFwcGluZ1tuYW1lXSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5pZiAocGx1Z2lucy5JbWFnZW1pbilcbiAgICBwbHVnaW5zLkltYWdlbWluID0gcGx1Z2lucy5JbWFnZW1pbi5kZWZhdWx0XG5cbmltcG9ydCBlanNMb2FkZXIgZnJvbSAnLi9lanNMb2FkZXIuY29tcGlsZWQnXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuaW1wb3J0IHR5cGUge1xuICAgIEhUTUxDb25maWd1cmF0aW9uLCBQbHVnaW5Db25maWd1cmF0aW9uLCBXZWJwYWNrQ29uZmlndXJhdGlvblxufSBmcm9tICcuL3R5cGUnXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG5cbi8vIC8gcmVnaW9uIG1vbmtleSBwYXRjaGVzXG4vLyBNb25rZXktUGF0Y2ggaHRtbCBsb2FkZXIgdG8gcmV0cmlldmUgaHRtbCBsb2FkZXIgb3B0aW9ucyBzaW5jZSB0aGVcbi8vIFwid2VicGFjay1odG1sLXBsdWdpblwiIGRvZXNuJ3QgcHJlc2VydmUgdGhlIG9yaWdpbmFsIGxvYWRlciBpbnRlcmZhY2UuXG5pbXBvcnQgaHRtbExvYWRlck1vZHVsZUJhY2t1cCBmcm9tICdodG1sLWxvYWRlcidcbnJlcXVpcmUuY2FjaGVbcmVxdWlyZS5yZXNvbHZlKCdodG1sLWxvYWRlcicpXS5leHBvcnRzID0gZnVuY3Rpb24oXG4gICAgLi4ucGFyYW1ldGVyOkFycmF5PGFueT5cbik6YW55IHtcbiAgICBUb29scy5leHRlbmQodHJ1ZSwgdGhpcy5vcHRpb25zLCBtb2R1bGUsIHRoaXMub3B0aW9ucylcbiAgICByZXR1cm4gaHRtbExvYWRlck1vZHVsZUJhY2t1cC5jYWxsKHRoaXMsIC4uLnBhcmFtZXRlcilcbn1cbi8vIE1vbmtleS1QYXRjaCBsb2FkZXItdXRpbHMgdG8gZGVmaW5lIHdoaWNoIHVybCBpcyBhIGxvY2FsIHJlcXVlc3QuXG5pbXBvcnQgbG9hZGVyVXRpbHNNb2R1bGVCYWNrdXAgZnJvbSAnbG9hZGVyLXV0aWxzJ1xuY29uc3QgbG9hZGVyVXRpbHNJc1VybFJlcXVlc3RCYWNrdXA6KHVybDpzdHJpbmcpID0+IGJvb2xlYW4gPVxuICAgIGxvYWRlclV0aWxzTW9kdWxlQmFja3VwLmlzVXJsUmVxdWVzdFxucmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2xvYWRlci11dGlscycpXS5leHBvcnRzLmlzVXJsUmVxdWVzdCA9IChcbiAgICB1cmw6c3RyaW5nLCAuLi5hZGRpdGlvbmFsUGFyYW1ldGVyOkFycmF5PGFueT5cbik6Ym9vbGVhbiA9PiB7XG4gICAgaWYgKHVybC5tYXRjaCgvXlthLXpdKzouKy8pKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gbG9hZGVyVXRpbHNJc1VybFJlcXVlc3RCYWNrdXAuYXBwbHkoXG4gICAgICAgIGxvYWRlclV0aWxzTW9kdWxlQmFja3VwLCBbdXJsXS5jb25jYXQoYWRkaXRpb25hbFBhcmFtZXRlcikpXG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gaW5pdGlhbGlzYXRpb25cbi8vIC8gcmVnaW9uIGRldGVybWluZSBsaWJyYXJ5IG5hbWVcbmxldCBsaWJyYXJ5TmFtZTpzdHJpbmdcbmlmICgnbGlicmFyeU5hbWUnIGluIGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5saWJyYXJ5TmFtZSlcbiAgICBsaWJyYXJ5TmFtZSA9IGNvbmZpZ3VyYXRpb24ubGlicmFyeU5hbWVcbmVsc2UgaWYgKE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQpLmxlbmd0aCA+IDEpXG4gICAgbGlicmFyeU5hbWUgPSAnW25hbWVdJ1xuZWxzZSB7XG4gICAgbGlicmFyeU5hbWUgPSBjb25maWd1cmF0aW9uLm5hbWVcbiAgICBpZiAoWydhc3NpZ24nLCAnZ2xvYmFsJywgJ3RoaXMnLCAndmFyJywgJ3dpbmRvdyddLmluY2x1ZGVzKFxuICAgICAgICBjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmXG4gICAgKSlcbiAgICAgICAgbGlicmFyeU5hbWUgPSBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShsaWJyYXJ5TmFtZSlcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyAvIHJlZ2lvbiBwbHVnaW5zXG5jb25zdCBwbHVnaW5JbnN0YW5jZXM6QXJyYXk8T2JqZWN0PiA9IFtcbiAgICBuZXcgd2VicGFjay5vcHRpbWl6ZS5PY2N1cnJlbmNlT3JkZXJQbHVnaW4odHJ1ZSlcbl1cbi8vIC8vIHJlZ2lvbiBkZWZpbmUgbW9kdWxlcyB0byBpZ25vcmVcbmZvciAoY29uc3QgaWdub3JlUGF0dGVybjpzdHJpbmcgb2YgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaWdub3JlUGF0dGVybilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5JZ25vcmVQbHVnaW4obmV3IFJlZ0V4cChpZ25vcmVQYXR0ZXJuKSkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBkZWZpbmUgbW9kdWxlcyB0byByZXBsYWNlXG5mb3IgKGNvbnN0IHNvdXJjZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbClcbiAgICBpZiAoY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbC5oYXNPd25Qcm9wZXJ0eShzb3VyY2UpKSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaDpSZWdFeHAgPSBuZXcgUmVnRXhwKHNvdXJjZSlcbiAgICAgICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suTm9ybWFsTW9kdWxlUmVwbGFjZW1lbnRQbHVnaW4oXG4gICAgICAgICAgICBzZWFyY2gsIChyZXNvdXJjZTp7cmVxdWVzdDpzdHJpbmd9KTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5yZXF1ZXN0ID0gcmVzb3VyY2UucmVxdWVzdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICBzZWFyY2gsIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWxbc291cmNlXSlcbiAgICAgICAgICAgIH0pKVxuICAgIH1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGdlbmVyYXRlIGh0bWwgZmlsZVxubGV0IGh0bWxBdmFpbGFibGU6Ym9vbGVhbiA9IGZhbHNlXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGQ6ZGxsJylcbiAgICBmb3IgKGNvbnN0IGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbClcbiAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5IVE1MKFRvb2xzLmV4dGVuZChcbiAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgICB7dGVtcGxhdGU6IGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3R9XG4gICAgICAgICAgICApKSlcbiAgICAgICAgICAgIGh0bWxBdmFpbGFibGUgPSB0cnVlXG4gICAgICAgIH1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGdlbmVyYXRlIGZhdmljb25zXG5pZiAoXG4gICAgaHRtbEF2YWlsYWJsZSAmJlxuICAgIGNvbmZpZ3VyYXRpb24uZmF2aWNvbiAmJlxuICAgIHBsdWdpbnMuRmF2aWNvbiAmJlxuICAgIFRvb2xzLmlzRmlsZVN5bmMoY29uZmlndXJhdGlvbi5mYXZpY29uLmxvZ28pXG4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuRmF2aWNvbihjb25maWd1cmF0aW9uLmZhdmljb24pKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gcHJvdmlkZSBvZmZsaW5lIGZ1bmN0aW9uYWxpdHlcbmlmIChodG1sQXZhaWxhYmxlICYmIGNvbmZpZ3VyYXRpb24ub2ZmbGluZSAmJiBwbHVnaW5zLk9mZmxpbmUpIHtcbiAgICBpZiAoIVsnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkpXG4gICAgICAgIGZvciAoY29uc3QgdHlwZTpBcnJheTxzdHJpbmc+IG9mIFtcbiAgICAgICAgICAgIFsnY2FzY2FkaW5nU3R5bGVTaGVldCcsICdjc3MnXSxcbiAgICAgICAgICAgIFsnamF2YVNjcmlwdCcsICdqcyddXG4gICAgICAgIF0pXG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pblBsYWNlW3R5cGVbMF1dKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlczpBcnJheTxzdHJpbmc+ID0gT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZVt0eXBlWzBdXSlcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWU6c3RyaW5nIG9mIG1hdGNoZXMpXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ub2ZmbGluZS5leGNsdWRlcy5wdXNoKHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVbMF1dXG4gICAgICAgICAgICAgICAgICAgICkgKyBgJHtuYW1lfS4ke3R5cGVbMV19PyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT0qYClcbiAgICAgICAgICAgIH1cbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PZmZsaW5lKGNvbmZpZ3VyYXRpb24ub2ZmbGluZSkpXG59XG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBvcGVucyBicm93c2VyIGF1dG9tYXRpY2FsbHlcbmlmIChjb25maWd1cmF0aW9uLmRldmVsb3BtZW50Lm9wZW5Ccm93c2VyICYmIChodG1sQXZhaWxhYmxlICYmIFtcbiAgICAnc2VydmUnLCAndGVzdDpicm93c2VyJ1xuXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PcGVuQnJvd3NlcihcbiAgICAgICAgY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5vcGVuQnJvd3NlcikpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBwcm92aWRlIGJ1aWxkIGVudmlyb25tZW50XG5pZiAoY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQuZGVmaW5pdGlvbnMpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGVmaW5lUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC5kZWZpbml0aW9ucykpXG5pZiAoY29uZmlndXJhdGlvbi5tb2R1bGUucHJvdmlkZSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Qcm92aWRlUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcm92aWRlKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIG1vZHVsZXMvYXNzZXRzXG4vLyAvLy8gcmVnaW9uIHBlcmZvcm0gamF2YVNjcmlwdCBtaW5pZmljYXRpb24vb3B0aW1pc2F0aW9uXG5pZiAoXG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5ICYmXG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5LmJ1bmRsZVxuKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKE9iamVjdC5rZXlzKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuYmFiZWxNaW5pZnkuYnVuZGxlXG4gICAgKS5sZW5ndGggP1xuICAgICAgICBuZXcgcGx1Z2lucy5CYWJlbE1pbmlmeShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5iYWJlbE1pbmlmeS5idW5kbGUudHJhbnNmb3JtIHx8IHt9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmJhYmVsTWluaWZ5LmJ1bmRsZS5wbHVnaW4gfHwge31cbiAgICAgICAgKSA6XG4gICAgICAgIG5ldyBwbHVnaW5zLkJhYmVsTWluaWZ5KClcbiAgICApXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGFwcGx5IG1vZHVsZSBwYXR0ZXJuXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpPYmplY3QpOnZvaWQgPT4ge1xuICAgIGNvbXBpbGVyLmhvb2tzLmVtaXQudGFwKCdhcHBseU1vZHVsZVBhdHRlcm4nLCAoXG4gICAgICAgIGNvbXBpbGF0aW9uOk9iamVjdFxuICAgICk6dm9pZCA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcmVxdWVzdDpzdHJpbmcgaW4gY29tcGlsYXRpb24uYXNzZXRzKVxuICAgICAgICAgICAgaWYgKGNvbXBpbGF0aW9uLmFzc2V0cy5oYXNPd25Qcm9wZXJ0eShyZXF1ZXN0KSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyA9IHJlcXVlc3QucmVwbGFjZSgvXFw/W14/XSskLywgJycpXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZTo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgpXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0eXBlICYmXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdICYmXG4gICAgICAgICAgICAgICAgICAgICEobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmV4Y2x1ZGVGaWxlUGF0aFJlZ3VsYXJFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICkpLnRlc3QoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZTo/c3RyaW5nID0gY29tcGlsYXRpb24uYXNzZXRzW3JlcXVlc3RdLnNvdXJjZSgpXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1tyZXF1ZXN0XSA9IG5ldyBXZWJwYWNrUmF3U291cmNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdLnBhdHRlcm4ucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgL1xcezFcXH0vZywgc291cmNlLnJlcGxhY2UoL1xcJC9nLCAnJCQkJykpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICB9KVxufX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGluLXBsYWNlIGNvbmZpZ3VyZWQgYXNzZXRzIGluIHRoZSBtYWluIGh0bWwgZmlsZVxuaWYgKGh0bWxBdmFpbGFibGUgJiYgIVsnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4pKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKHthcHBseTogKGNvbXBpbGVyOk9iamVjdCk6dm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoc1RvUmVtb3ZlOkFycmF5PHN0cmluZz4gPSBbXVxuICAgICAgICBjb21waWxlci5ob29rcy5jb21waWxhdGlvbi50YXAoJ2luUGxhY2VIVE1MQXNzZXRzJywgKFxuICAgICAgICAgICAgY29tcGlsYXRpb246T2JqZWN0XG4gICAgICAgICk6dm9pZCA9PlxuICAgICAgICAgICAgY29tcGlsYXRpb24uaG9va3MuaHRtbFdlYnBhY2tQbHVnaW5BZnRlckh0bWxQcm9jZXNzaW5nLnRhcEFzeW5jKFxuICAgICAgICAgICAgICAgICdpblBsYWNlSFRNTEFzc2V0cycsXG4gICAgICAgICAgICAgICAgKGRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOkZ1bmN0aW9uKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgICAgICApLmxlbmd0aCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZywgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBIZWxwZXIuaW5QbGFjZUNTU0FuZEphdmFTY3JpcHRBc3NldFJlZmVyZW5jZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaHRtbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5odG1sID0gcmVzdWx0LmNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aHNUb1JlbW92ZS5jb25jYXQocmVzdWx0LmZpbGVQYXRoc1RvUmVtb3ZlKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRhdGEpXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgIGNvbXBpbGVyLmhvb2tzLmFmdGVyRW1pdC50YXBBc3luYyhcbiAgICAgICAgICAgICdyZW1vdmVJblBsYWNlSFRNTEFzc2V0RmlsZXMnLCBhc3luYyAoXG4gICAgICAgICAgICAgICAgZGF0YTpPYmplY3QsIGNhbGxiYWNrOlByb2NlZHVyZUZ1bmN0aW9uXG4gICAgICAgICAgICApOlByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwcm9taXNlczpBcnJheTxQcm9taXNlPHZvaWQ+PiA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoOnN0cmluZyBvZiBmaWxlUGF0aHNUb1JlbW92ZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKGF3YWl0IFRvb2xzLmlzRmlsZShwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2goZmlsZVN5c3RlbS51bmxpbmsocGF0aCkuY2F0Y2goXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAgICAgICAgICAgICBwcm9taXNlcyA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZTpzdHJpbmcgb2YgWydqYXZhU2NyaXB0JywgJ2Nhc2NhZGluZ1N0eWxlU2hlZXQnXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChmaWxlU3lzdGVtLnJlYWRkaXIoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVdLFxuICAgICAgICAgICAgICAgICAgICAgICAge2VuY29kaW5nOiBjb25maWd1cmF0aW9uLmVuY29kaW5nfVxuICAgICAgICAgICAgICAgICAgICApLnRoZW4oYXN5bmMgKGZpbGVzOkFycmF5PHN0cmluZz4pOlByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBmaWxlU3lzdGVtLnJtZGlyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVdKVxuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgICB9KVxuICAgIH19KVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiByZW1vdmUgY2h1bmtzIGlmIGEgY29ycmVzcG9uZGluZyBkbGwgcGFja2FnZSBleGlzdHNcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gIT09ICdidWlsZDpkbGwnKVxuICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICApKSB7XG4gICAgICAgICAgICBjb25zdCBtYW5pZmVzdEZpbGVQYXRoOnN0cmluZyA9XG4gICAgICAgICAgICAgICAgYCR7Y29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlfS8ke2NodW5rTmFtZX0uYCArXG4gICAgICAgICAgICAgICAgYGRsbC1tYW5pZmVzdC5qc29uYFxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZGxsTWFuaWZlc3RGaWxlUGF0aHMuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgbWFuaWZlc3RGaWxlUGF0aFxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSBIZWxwZXIucmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgKSwgeydbbmFtZV0nOiBjaHVua05hbWV9KVxuICAgICAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkFkZEFzc2V0SFRNTFBsdWdpbih7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZVNvdXJjZW1hcDogVG9vbHMuaXNGaWxlU3luYyhgJHtmaWxlUGF0aH0ubWFwYClcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EbGxSZWZlcmVuY2VQbHVnaW4oe1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3Q6IHJlcXVpcmUobWFuaWZlc3RGaWxlUGF0aCl9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBtYXJrIGVtcHR5IGphdmFTY3JpcHQgbW9kdWxlcyBhcyBkdW1teVxuaWYgKCFjb25maWd1cmF0aW9uLm5lZWRlZC5qYXZhU2NyaXB0KVxuICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5qYXZhU2NyaXB0ID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LmphdmFTY3JpcHQsICcuX19kdW1teV9fLmNvbXBpbGVkLmpzJylcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gZXh0cmFjdCBjYXNjYWRpbmcgc3R5bGUgc2hlZXRzXG5pZiAoY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQgJiYgcGx1Z2lucy5NaW5pQ1NTRXh0cmFjdClcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5NaW5pQ1NTRXh0cmFjdCh7XG4gICAgICAgIGNodW5rczogJ1tuYW1lXS5jc3MnLFxuICAgICAgICBmaWxlbmFtZTogcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0KVxuICAgIH0pKVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBwZXJmb3JtcyBpbXBsaWNpdCBleHRlcm5hbCBsb2dpY1xuaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMgPT09ICdfX2ltcGxpY2l0X18nKVxuICAgIC8qXG4gICAgICAgIFdlIG9ubHkgd2FudCB0byBwcm9jZXNzIG1vZHVsZXMgZnJvbSBsb2NhbCBjb250ZXh0IGluIGxpYnJhcnkgbW9kZSxcbiAgICAgICAgc2luY2UgYSBjb25jcmV0ZSBwcm9qZWN0IHVzaW5nIHRoaXMgbGlicmFyeSBzaG91bGQgY29tYmluZSBhbGwgYXNzZXRzXG4gICAgICAgIChhbmQgZGUtZHVwbGljYXRlIHRoZW0pIGZvciBvcHRpbWFsIGJ1bmRsaW5nIHJlc3VsdHMuIE5PVEU6IE9ubHkgbmF0aXZlXG4gICAgICAgIGphdmFTY3JpcHQgYW5kIGpzb24gbW9kdWxlcyB3aWxsIGJlIG1hcmtlZCBhcyBleHRlcm5hbCBkZXBlbmRlbmN5LlxuICAgICovXG4gICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwubW9kdWxlcyA9IGFzeW5jIChcbiAgICAgICAgY29udGV4dDpzdHJpbmcsIHJlcXVlc3Q6c3RyaW5nLCBjYWxsYmFjazpGdW5jdGlvblxuICAgICk6UHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnJlcGxhY2UoL14hKy8sICcnKVxuICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKCcvJykpXG4gICAgICAgICAgICByZXF1ZXN0ID0gcGF0aC5yZWxhdGl2ZShjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgcmVxdWVzdClcbiAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2YgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMpXG4gICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhmaWxlUGF0aC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyByZWdpb24gcGF0dGVybiBiYXNlZCBhbGlhc2luZ1xuICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZmlsZTogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuZXh0ZXJuYWwsXG4gICAgICAgICAgICAgICAgbW9kdWxlOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMubW9kdWxlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nXG4gICAgICAgIClcbiAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICBjb25zdCBwYXR0ZXJuOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbFxuICAgICAgICAgICAgICAgICAgICAuYWxpYXNlc1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlcy5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm4pICYmXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4uc3RhcnRzV2l0aCgnXicpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZ3VsYXJFeHByZXNzaW9uOlJlZ0V4cCA9IG5ldyBSZWdFeHAocGF0dGVybilcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlZ3VsYXJFeHByZXNzaW9uLnRlc3QoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbWF0Y2g6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW3BhdHRlcm5dXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudFJlZ3VsYXJFeHByZXNzaW9uOlJlZ0V4cCA9IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0Q29uZmlndXJhdGlvbilbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0OnN0cmluZyA9IHRhcmdldENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0Q29uZmlndXJhdGlvbilbMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuc3RhcnRzV2l0aCgnPycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnN1YnN0cmluZygxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFsaWFzZWRSZXF1ZXN0OnN0cmluZyA9IHJlcXVlc3QucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRSZWd1bGFyRXhwcmVzc2lvbiwgdGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGlhc2VkUmVxdWVzdCAhPT0gcmVxdWVzdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBCb29sZWFuKEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWFzZWRSZXF1ZXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZXh0ZXJuYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMubW9kdWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxhY2VtZW50UmVndWxhckV4cHJlc3Npb24sIHRhcmdldClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgY29uc3QgcmVzb2x2ZWRSZXF1ZXN0Oj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lRXh0ZXJuYWxSZXF1ZXN0KFxuICAgICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5pbXBsaWNpdC5wYXR0ZXJuLmluY2x1ZGUsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5pbXBsaWNpdC5wYXR0ZXJuLmV4Y2x1ZGUsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuZXh0ZXJuYWxMaWJyYXJ5Lm5vcm1hbCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5leHRlcm5hbExpYnJhcnkuZHluYW1pYyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgKVxuICAgICAgICBpZiAocmVzb2x2ZWRSZXF1ZXN0KSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAgICAgJ2FtZCcsICdjb21tb25qcycsICdjb21tb25qczInLCAncm9vdCddXG4gICAgICAgICAgICBsZXQgcmVzdWx0OlBsYWluT2JqZWN0fHN0cmluZyA9IHJlc29sdmVkUmVxdWVzdFxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXMuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIC8vIHJlZ2lvbiBub3JtYWwgYWxpYXMgcmVwbGFjZW1lbnRcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7ZGVmYXVsdDogcmVxdWVzdH1cbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBdID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXk6c3RyaW5nIG9mIGtleXMpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1tyZXF1ZXN0XVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgXSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXk6c3RyaW5nIG9mIGtleXMpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1tyZXF1ZXN0XShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCwga2V5KVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBdID09PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1tyZXF1ZXN0XSlcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmhhc093blByb3BlcnR5KCdkZWZhdWx0JykpXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5OnN0cmluZyBvZiBrZXlzKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuaGFzT3duUHJvcGVydHkoa2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHJlc3VsdC5kZWZhdWx0XG4gICAgICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0Lmhhc093blByb3BlcnR5KCdyb290JykpXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgcmVzdWx0LnJvb3QgPSBbXS5jb25jYXQocmVzdWx0LnJvb3QpLm1hcCgoXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6c3RyaW5nXG4gICAgICAgICAgICAgICAgKTpzdHJpbmcgPT4gVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRWYXJpYWJsZU5hbWUobmFtZSkpXG4gICAgICAgICAgICBjb25zdCBleHBvcnRGb3JtYXQ6c3RyaW5nID0gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZXhwb3J0Rm9ybWF0LmV4dGVybmFsIHx8XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuc2VsZlxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgZXhwb3J0Rm9ybWF0ID09PSAndW1kJyB8fCB0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA6XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFtleHBvcnRGb3JtYXRdLFxuICAgICAgICAgICAgICAgIGV4cG9ydEZvcm1hdFxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpXG4gICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBidWlsZCBkbGwgcGFja2FnZXNcbmlmIChjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnKSB7XG4gICAgbGV0IGRsbENodW5rRXhpc3RzOmJvb2xlYW4gPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkKVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgIGNodW5rTmFtZVxuICAgICAgICApKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmRsbENodW5rTmFtZXMuaW5jbHVkZXMoY2h1bmtOYW1lKSlcbiAgICAgICAgICAgICAgICBkbGxDaHVua0V4aXN0cyA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkZWxldGUgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgaWYgKGRsbENodW5rRXhpc3RzKSB7XG4gICAgICAgIGxpYnJhcnlOYW1lID0gJ1tuYW1lXURMTFBhY2thZ2UnXG4gICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkRsbFBsdWdpbih7XG4gICAgICAgICAgICBwYXRoOiBgJHtjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2V9L1tuYW1lXS5kbGwtbWFuaWZlc3QuanNvbmAsXG4gICAgICAgICAgICBuYW1lOiBsaWJyYXJ5TmFtZVxuICAgICAgICB9KSlcbiAgICB9IGVsc2VcbiAgICAgICAgY29uc29sZS53YXJuKCdObyBkbGwgY2h1bmsgaWQgZm91bmQuJylcbn1cbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGFwcGx5IGZpbmFsIGRvbS9qYXZhU2NyaXB0L2Nhc2NhZGluZ1N0eWxlU2hlZXQgbW9kaWZpY2F0aW9ucy9maXhlc1xuaWYgKGh0bWxBdmFpbGFibGUpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2goe2FwcGx5OiAoXG4gICAgICAgIGNvbXBpbGVyOk9iamVjdFxuICAgICk6dm9pZCA9PiBjb21waWxlci5ob29rcy5jb21waWxhdGlvbi50YXAoJ2NvbXBpbGF0aW9uJywgKFxuICAgICAgICBjb21waWxhdGlvbjpPYmplY3RcbiAgICApOnZvaWQgPT4ge1xuICAgICAgICBjb21waWxhdGlvbi5ob29rcy5odG1sV2VicGFja1BsdWdpbkFsdGVyQXNzZXRUYWdzLnRhcEFzeW5jKFxuICAgICAgICAgICAgJ3JlbW92ZUR1bW15SFRNTFRhZ3MnLFxuICAgICAgICAgICAgKGRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOkZ1bmN0aW9uKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZ3M6QXJyYXk8UGxhaW5PYmplY3Q+IG9mIFtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5ib2R5LCBkYXRhLmhlYWRcbiAgICAgICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnOlBsYWluT2JqZWN0IG9mIHRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgvXlxcLl9fZHVtbXlfXyhcXC4uKik/JC8udGVzdChwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5hdHRyaWJ1dGVzLnNyYyB8fCB0YWcuYXR0cmlidXRlcy5ocmVmIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldHM6QXJyYXk8c3RyaW5nPiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucGx1Z2luLmFzc2V0SnNvbilcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6bnVtYmVyID0gMFxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXNzZXRSZXF1ZXN0OnN0cmluZyBvZiBhc3NldHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eXFwuX19kdW1teV9fKFxcLi4qKT8kLy50ZXN0KHBhdGguYmFzZW5hbWUoXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldHMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICBpbmRleCArPSAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRhdGEucGx1Z2luLmFzc2V0SnNvbiA9IEpTT04uc3RyaW5naWZ5KGFzc2V0cylcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgY29tcGlsYXRpb24uaG9va3MuaHRtbFdlYnBhY2tQbHVnaW5BZnRlckh0bWxQcm9jZXNzaW5nLnRhcEFzeW5jKFxuICAgICAgICAgICAgJ3Bvc3RQcm9jZXNzSFRNTCcsXG4gICAgICAgICAgICAoZGF0YTpQbGFpbk9iamVjdCwgY2FsbGJhY2s6RnVuY3Rpb24pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gcHJldmVudCBjcmVhdGluZyBuYXRpdmUgXCJzdHlsZVwiIGRvbSBub2Rlc1xuICAgICAgICAgICAgICAgICAgICB0byBwcmV2ZW50IGpzZG9tIGZyb20gcGFyc2luZyB0aGUgZW50aXJlIGNhc2NhZGluZyBzdHlsZVxuICAgICAgICAgICAgICAgICAgICBzaGVldC4gV2hpY2ggaXMgZXJyb3IgcHJ1bmUgYW5kIHZlcnkgcmVzb3VyY2UgaW50ZW5zaXZlLlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3Qgc3R5bGVDb250ZW50czpBcnJheTxzdHJpbmc+ID0gW11cbiAgICAgICAgICAgICAgICBkYXRhLmh0bWwgPSBkYXRhLmh0bWwucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLyg8c3R5bGVbXj5dKj4pKFtcXHNcXFNdKj8pKDxcXC9zdHlsZVtePl0qPikvZ2ksXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGFnOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICApOnN0cmluZyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZUNvbnRlbnRzLnB1c2goY29udGVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtzdGFydFRhZ30ke2VuZFRhZ31gXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgbGV0IGRvbTpET01cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byB0cmFuc2xhdGUgdGVtcGxhdGUgZGVsaW1pdGVyIHRvIGh0bWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBhdGlibGUgc2VxdWVuY2VzIGFuZCB0cmFuc2xhdGUgaXQgYmFjayBsYXRlciB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZvaWQgdW5leHBlY3RlZCBlc2NhcGUgc2VxdWVuY2VzIGluIHJlc3VsdGluZyBodG1sLlxuICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBkb20gPSBuZXcgRE9NKFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5odG1sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLzwlL2csICcjIysjKyMrIyMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8lPi9nLCAnIyMtIy0jLSMjJylcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvciwgZGF0YSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbGlua2FibGVzOntba2V5OnN0cmluZ106c3RyaW5nfSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGluazogJ2hyZWYnLFxuICAgICAgICAgICAgICAgICAgICBzY3JpcHQ6ICdzcmMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnTmFtZTpzdHJpbmcgaW4gbGlua2FibGVzKVxuICAgICAgICAgICAgICAgICAgICBpZiAobGlua2FibGVzLmhhc093blByb3BlcnR5KHRhZ05hbWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkb21Ob2RlOkRvbU5vZGUgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb20ud2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3RhZ05hbWV9WyR7bGlua2FibGVzW3RhZ05hbWVdfSo9XCI/YCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09XCJdYClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBSZW1vdmluZyBzeW1ib2xzIGFmdGVyIGEgXCImXCIgaW4gaGFzaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgaXMgbmVjZXNzYXJ5IHRvIG1hdGNoIHRoZSBnZW5lcmF0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCBzdHJpbmdzIGluIG9mZmxpbmUgcGx1Z2luLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmthYmxlc1t0YWdOYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5nZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZXNbdGFnTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgKFxcXFw/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PWAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1teJl0rKS4qJCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgJyQxJykpXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byByZXN0b3JlIHRlbXBsYXRlIGRlbGltaXRlciBhbmQgc3R5bGVcbiAgICAgICAgICAgICAgICAgICAgY29udGVudHMuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBkYXRhLmh0bWwgPSBkb20uc2VyaWFsaXplKClcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyMjXFwrI1xcKyNcXCsjIy9nLCAnPCUnKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyMtIy0jLSMjL2csICclPicpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPHN0eWxlW14+XSo+KVtcXHNcXFNdKj8oPFxcL3N0eWxlW14+XSo+KS9naSwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICApOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7c3RhcnRUYWd9JHtzdHlsZUNvbnRlbnRzLnNoaWZ0KCl9JHtlbmRUYWd9YClcbiAgICAgICAgICAgICAgICAvLyByZWdpb24gcG9zdCBjb21waWxhdGlvblxuICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxGaWxlU3BlY2lmaWNhdGlvbjpQbGFpbk9iamVjdCBvZlxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxGaWxlU3BlY2lmaWNhdGlvbi5maWxlbmFtZSA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucGx1Z2luLm9wdGlvbnMuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlckNvbmZpZ3VyYXRpb246UGxhaW5PYmplY3Qgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sRmlsZVNwZWNpZmljYXRpb24udGVtcGxhdGUudXNlXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29wdGlvbnMnKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLm9wdGlvbnMuaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29tcGlsZVN0ZXBzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBsb2FkZXJDb25maWd1cmF0aW9uLm9wdGlvbnMuY29tcGlsZVN0ZXBzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9PT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaHRtbCA9IGVqc0xvYWRlci5iaW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29wdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZVN0ZXBzOiBodG1sRmlsZVNwZWNpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50ZW1wbGF0ZS5wb3N0Q29tcGlsZVN0ZXBzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKShkYXRhLmh0bWwpXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIH0pfSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGFkZCBhdXRvbWF0aWMgaW1hZ2UgY29tcHJlc3Npb25cbi8vIE5PVEU6IFRoaXMgcGx1Z2luIHNob3VsZCBiZSBsb2FkZWQgYXQgbGFzdCB0byBlbnN1cmUgdGhhdCBhbGwgZW1pdHRlZCBpbWFnZXNcbi8vIHJhbiB0aHJvdWdoLlxuaWYgKHBsdWdpbnMuSW1hZ2VtaW4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuSW1hZ2VtaW4oXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5jb250ZW50KSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGNvbnRleHQgcmVwbGFjZW1lbnRzXG5mb3IgKFxuICAgIGNvbnN0IGNvbnRleHRSZXBsYWNlbWVudDpBcnJheTxzdHJpbmc+IG9mXG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLmNvbnRleHRcbilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Db250ZXh0UmVwbGFjZW1lbnRQbHVnaW4oXG4gICAgICAgIC4uLmNvbnRleHRSZXBsYWNlbWVudC5tYXAoKHZhbHVlOnN0cmluZyk6YW55ID0+IChuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAnY29uZmlndXJhdGlvbicsICdfX2Rpcm5hbWUnLCAnX19maWxlbmFtZScsIGByZXR1cm4gJHt2YWx1ZX1gXG4gICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICApKShjb25maWd1cmF0aW9uLCBfX2Rpcm5hbWUsIF9fZmlsZW5hbWUpKSkpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBjb25zb2xpZGF0ZSBkdXBsaWNhdGVkIG1vZHVsZSByZXF1ZXN0c1xucGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suTm9ybWFsTW9kdWxlUmVwbGFjZW1lbnRQbHVnaW4oXG4gICAgLygoPzpefFxcLylub2RlX21vZHVsZXNcXC8uKyl7Mn0vLFxuICAgIChyZXNvdXJjZTp7cmVxdWVzdDpzdHJpbmc7cmVzb3VyY2U6c3RyaW5nO30pOnZvaWQgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXROYW1lOnN0cmluZyA9IHJlc291cmNlLnJlcXVlc3QgPyAncmVxdWVzdCcgOiAncmVzb3VyY2UnXG4gICAgICAgIGNvbnN0IHRhcmdldFBhdGg6c3RyaW5nID0gcmVzb3VyY2VbdGFyZ2V0TmFtZV1cbiAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmModGFyZ2V0UGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VEZXNjcmlwdG9yOj9QbGFpbk9iamVjdCA9XG4gICAgICAgICAgICAgICAgSGVscGVyLmdldENsb3Nlc3RQYWNrYWdlRGVzY3JpcHRvcih0YXJnZXRQYXRoKVxuICAgICAgICAgICAgaWYgKHBhY2thZ2VEZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aFByZWZpeGVzOkFycmF5PHN0cmluZz4gPSB0YXJnZXRQYXRoLm1hdGNoKFxuICAgICAgICAgICAgICAgICAgICAvKCg/Ol58Lio/XFwvKW5vZGVfbW9kdWxlc1xcLykvZylcbiAgICAgICAgICAgICAgICAvLyBBdm9pZCBmaW5kaW5nIHRoZSBzYW1lIGFydGVmYWN0LlxuICAgICAgICAgICAgICAgIHBhdGhQcmVmaXhlcy5wb3AoKVxuICAgICAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoUHJlZml4OnN0cmluZyBvZiBwYXRoUHJlZml4ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gMClcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhQcmVmaXhlc1tpbmRleF0gPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFByZWZpeGVzW2luZGV4IC0gMV0sIHBhdGhQcmVmaXgpXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aFN1ZmZpeDpzdHJpbmcgPSB0YXJnZXRQYXRoLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC8oPzpefC4qXFwvKW5vZGVfbW9kdWxlc1xcLyguKyQpLywgJyQxJylcbiAgICAgICAgICAgICAgICBsZXQgcmVkdW5kYW50UmVxdWVzdDo/UGxhaW5PYmplY3QgPSBudWxsXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoUHJlZml4OnN0cmluZyBvZiBwYXRoUHJlZml4ZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWx0ZXJuYXRlVGFyZ2V0UGF0aDpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoUHJlZml4LCBwYXRoU3VmZml4KVxuICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhhbHRlcm5hdGVUYXJnZXRQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWx0ZXJuYXRlUGFja2FnZURlc2NyaXB0b3I6UGxhaW5PYmplY3QgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5nZXRDbG9zZXN0UGFja2FnZURlc2NyaXB0b3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0ZVRhcmdldFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFja2FnZURlc2NyaXB0b3IuY29uZmlndXJhdGlvbi52ZXJzaW9uID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsdGVybmF0ZVBhY2thZ2VEZXNjcmlwdG9yLmNvbmZpZ3VyYXRpb24udmVyc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgQ29uc29saWRhdGUgbW9kdWxlIHJlcXVlc3QgXCIke3RhcmdldFBhdGh9XCIgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGB0byBcIiR7YWx0ZXJuYXRlVGFyZ2V0UGF0aH1cIi5gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlW3RhcmdldE5hbWVdID0gYWx0ZXJuYXRlVGFyZ2V0UGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVkdW5kYW50UmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogYWx0ZXJuYXRlVGFyZ2V0UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogYWx0ZXJuYXRlUGFja2FnZURlc2NyaXB0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jb25maWd1cmF0aW9uLnZlcnNpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlZHVuZGFudFJlcXVlc3QpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICdJbmNsdWRpbmcgZGlmZmVyZW50IHZlcnNpb25zIG9mIHNhbWUgcGFja2FnZSBcIicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCR7cGFja2FnZURlc2NyaXB0b3IuY29uZmlndXJhdGlvbi5uYW1lfVwiLiBNb2R1bGUgXCJgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3RhcmdldFBhdGh9XCIgKHZlcnNpb24gYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtwYWNrYWdlRGVzY3JpcHRvci5jb25maWd1cmF0aW9uLnZlcnNpb259KSBoYXMgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgcmVkdW5kYW5jaWVzIHdpdGggXCIke3JlZHVuZGFudFJlcXVlc3QucGF0aH1cIiAoYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgdmVyc2lvbiAke3JlZHVuZGFudFJlcXVlc3QudmVyc2lvbn0pLmBcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLyBlbmRyZWdpb25cbi8vIC8gcmVnaW9uIGxvYWRlciBoZWxwZXJcbmNvbnN0IGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llczpGdW5jdGlvbiA9IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4ge1xuICAgIGZpbGVQYXRoID0gSGVscGVyLnN0cmlwTG9hZGVyKGZpbGVQYXRoKVxuICAgIHJldHVybiBIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgIGZpbGVQYXRoLFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpXG4gICAgICAgIClcbiAgICApXG59XG5jb25zdCBnZW5lcmF0ZUxvYWRlcjpGdW5jdGlvbiA9IChcbiAgICBsb2FkZXJDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0XG4pOlBsYWluT2JqZWN0ID0+ICh7XG4gICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBldmFsdWF0ZShcbiAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5leGNsdWRlIHx8ICdmYWxzZScsIGZpbGVQYXRoKSxcbiAgICBpbmNsdWRlOlxuICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUgJiZcbiAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0KSB8fFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmJhc2UsXG4gICAgdGVzdDogbmV3IFJlZ0V4cChldmFsdWF0ZShcbiAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi50ZXN0LCBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCkpLFxuICAgIHVzZTogZXZhbHVhdGUobG9hZGVyQ29uZmlndXJhdGlvbi51c2UpXG59KVxuY29uc3QgbG9hZGVyOk9iamVjdCA9IHt9XG5jb25zdCBzY29wZTpPYmplY3QgPSB7XG4gICAgY29uZmlndXJhdGlvbixcbiAgICBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMsXG4gICAgbG9hZGVyLFxuICAgIHJlcXVpcmU6IGV2YWwoJ3JlcXVpcmUnKVxufVxuY29uc3QgZXZhbHVhdGU6RnVuY3Rpb24gPSAoY29kZTpzdHJpbmcsIGZpbGVQYXRoOnN0cmluZyk6YW55ID0+IChuZXcgRnVuY3Rpb24oXG4gICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgJ2ZpbGVQYXRoJywgLi4uT2JqZWN0LmtleXMoc2NvcGUpLCBgcmV0dXJuICR7Y29kZX1gXG4vLyBJZ25vcmVUeXBlQ2hlY2tcbikpKGZpbGVQYXRoLCAuLi5PYmplY3QudmFsdWVzKHNjb3BlKSlcbmNvbnN0IGluY2x1ZGluZ1BhdGhzOkFycmF5PHN0cmluZz4gPSBIZWxwZXIubm9ybWFsaXplUGF0aHMoW1xuICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuamF2YVNjcmlwdFxuXS5jb25jYXQoY29uZmlndXJhdGlvbi5tb2R1bGUubG9jYXRpb25zLmRpcmVjdG9yeVBhdGhzKSlcblRvb2xzLmV4dGVuZChsb2FkZXIsIHtcbiAgICAvLyBDb252ZXJ0IHRvIGNvbXBhdGlibGUgbmF0aXZlIHdlYiB0eXBlcy5cbiAgICAvLyByZWdpb24gZ2VuZXJpYyB0ZW1wbGF0ZVxuICAgIGVqczoge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbC5jb25jYXQoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aClcbiAgICAgICAgKS5pbmNsdWRlcyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgICgoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5leGNsdWRlID09PSBudWxsKSA/XG4gICAgICAgICAgICAgICAgZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmV4Y2x1ZGUsIGZpbGVQYXRoKSksXG4gICAgICAgIGluY2x1ZGU6IGluY2x1ZGluZ1BhdGhzLFxuICAgICAgICB0ZXN0OiAvXig/IS4rXFwuaHRtbFxcLmVqcyQpLitcXC5lanMkL2ksXG4gICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgIHtsb2FkZXI6ICdmaWxlP25hbWU9W3BhdGhdW25hbWVdJyArIChCb29sZWFuKFxuICAgICAgICAgICAgICAgIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLm9wdGlvbnMgfHwge1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgICAgICB9KS5jb21waWxlU3RlcHMgJSAyXG4gICAgICAgICAgICApID8gJy5qcycgOiAnJykgKyBgPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gfSxcbiAgICAgICAgICAgIHtsb2FkZXI6ICdleHRyYWN0J30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHNjcmlwdFxuICAgIHNjcmlwdDoge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IGV2YWx1YXRlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuZXhjbHVkZSwgZmlsZVBhdGhcbiAgICAgICAgKSxcbiAgICAgICAgaW5jbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6YW55ID0gZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuaW5jbHVkZSwgZmlsZVBhdGgpXG4gICAgICAgICAgICBpZiAoW251bGwsIHVuZGVmaW5lZF0uaW5jbHVkZXMocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaW5jbHVkZVBhdGg6c3RyaW5nIG9mIGluY2x1ZGluZ1BhdGhzKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGguc3RhcnRzV2l0aChpbmNsdWRlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4ocmVzdWx0KVxuICAgICAgICB9LFxuICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQucmVndWxhckV4cHJlc3Npb24sICdpJ1xuICAgICAgICApLFxuICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlXG4gICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0Lm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5hZGRpdGlvbmFsLnBvc3QubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBodG1sIHRlbXBsYXRlXG4gICAgaHRtbDoge1xuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIG9ubHkgZm9yIHRoZSBtYWluIGVudHJ5IHRlbXBsYXRlLlxuICAgICAgICBtYWluOiB7XG4gICAgICAgICAgICB0ZXN0OiBuZXcgUmVnRXhwKCdeJyArIFRvb2xzLnN0cmluZ0VzY2FwZVJlZ3VsYXJFeHByZXNzaW9ucyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLmZpbGVQYXRoXG4gICAgICAgICAgICApICsgJyg/OlxcXFw/LiopPyQnKSxcbiAgICAgICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTC50ZW1wbGF0ZS51c2VcbiAgICAgICAgfSxcbiAgICAgICAgZWpzOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWwuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpXG4gICAgICAgICAgICApLmluY2x1ZGVzKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgICAgICgoY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwuZXhjbHVkZSA9PT0gbnVsbCkgP1xuICAgICAgICAgICAgICAgICAgICBmYWxzZSA6IGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwuZXhjbHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoKSksXG4gICAgICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LnRlbXBsYXRlLFxuICAgICAgICAgICAgdGVzdDogL1xcLmh0bWxcXC5lanMoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiAnZmlsZT9uYW1lPScgKyBwYXRoLmpvaW4ocGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQudGVtcGxhdGVcbiAgICAgICAgICAgICAgICAgICAgKSwgJ1tuYW1lXScgKyAoQm9vbGVhbihcbiAgICAgICAgICAgICAgICAgICAgICAgIChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNvbXBpbGVTdGVwcyAlIDJcbiAgICAgICAgICAgICAgICAgICAgKSA/ICcuanMnIDogJycpICsgYD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdYClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChCb29sZWFuKChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucyB8fCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkuY29tcGlsZVN0ZXBzICUgMikgPyBbXSA6IFtcbiAgICAgICAgICAgICAgICAgICAge2xvYWRlcjogJ2V4dHJhY3QnfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWwub3B0aW9ucyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgaHRtbDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBIZWxwZXIubm9ybWFsaXplUGF0aHMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5kZWZhdWx0SFRNTFxuICAgICAgICAgICAgICAgICkubWFwKChodG1sQ29uZmlndXJhdGlvbjpIVE1MQ29uZmlndXJhdGlvbik6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICAgICAgKS5pbmNsdWRlcyhmaWxlUGF0aCkgfHxcbiAgICAgICAgICAgICAgICAoKGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuZXhjbHVkZSA9PT0gbnVsbCkgP1xuICAgICAgICAgICAgICAgICAgICB0cnVlIDpcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5leGNsdWRlLCBmaWxlUGF0aCkpLFxuICAgICAgICAgICAgaW5jbHVkZTogY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC50ZW1wbGF0ZSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5odG1sKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5hZGRpdGlvbmFsLnByZS5jb25jYXQoXG4gICAgICAgICAgICAgICAge2xvYWRlcjogJ2ZpbGU/bmFtZT0nICsgcGF0aC5qb2luKHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICksIGBbbmFtZV0uW2V4dF0/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PVtoYXNoXWApfSxcbiAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmFkZGl0aW9uYWwucG9zdC5tYXAoZXZhbHVhdGUpKVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyBMb2FkIGRlcGVuZGVuY2llcy5cbiAgICAvLyByZWdpb24gc3R5bGVcbiAgICBzdHlsZToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICApID8gaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0LmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgaW5jbHVkZTogaW5jbHVkaW5nUGF0aHMsXG4gICAgICAgIHRlc3Q6IC9cXC5zP2Nzcyg/OlxcPy4qKT8kL2ksXG4gICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXQuYWRkaXRpb25hbFxuICAgICAgICAgICAgLnByZS5jb25jYXQoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnN0eWxlLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuc3R5bGUub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogVG9vbHMuZXh0ZW5kKHRydWUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkZW50OiAncG9zdGNzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbHVnaW5zOiAoKTpBcnJheTxPYmplY3Q+ID0+IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzSW1wb3J0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRGVwZW5kZW5jeVRvOiB3ZWJwYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQuYWRkaXRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGx1Z2lucy5wcmUubWFwKGV2YWx1YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzUHJlc2V0RU5WKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXNjYWRpbmdTdHlsZVNoZWV0LnBvc3Rjc3NQcmVzZXRFbnYpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IENoZWNraW5nIHBhdGggZG9lc24ndCB3b3JrIGlmIGZvbnRzIGFyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VkIGluIGxpYnJhcmllcyBwcm92aWRlZCBpbiBhbm90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uIHRoYW4gdGhlIHByb2plY3QgaXRzZWxmIGxpa2UgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0ZvbnRQYXRoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tQYXRoOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3R5cGU6ICd3b2ZmMicsIGV4dDogJ3dvZmYyJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dHlwZTogJ3dvZmYnLCBleHQ6ICd3b2ZmJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NVUkwoe3VybDogJ3JlYmFzZSd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzU3ByaXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckJ5OiAoKTpQcm9taXNlPG51bGw+ID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOlByb21pc2U8bnVsbD4gPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5pbWFnZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUgOiByZWplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvb2tzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNhdmVTcHJpdGVzaGVldDogKGltYWdlOk9iamVjdCk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5zcHJpdGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLnJlbGF0aXZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5pbWFnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5pbWFnZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlc2hlZXRQYXRoOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXNjYWRpbmdTdHlsZVNoZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcHJpdGVQYXRoOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5pbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3NvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FzY2FkaW5nU3R5bGVTaGVldC5hZGRpdGlvbmFsLnBsdWdpbnMucG9zdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKGV2YWx1YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuY3NzbmFubyA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NDU1NuYW5vKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmNzc25hbm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IFtdKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICAgICAgICAgICAgICAgICAgLm9wdGlvbnMgfHwge30pXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldFxuICAgICAgICAgICAgICAgICAgICAuYWRkaXRpb25hbC5wb3N0Lm1hcChldmFsdWF0ZSkpXG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyBPcHRpbWl6ZSBsb2FkZWQgYXNzZXRzLlxuICAgIC8vIHJlZ2lvbiBmb250XG4gICAgZm9udDoge1xuICAgICAgICBlb3Q6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICAgICAgdGVzdDogL1xcLmVvdCg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3Qub3B0aW9ucyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LmVvdC5hZGRpdGlvbmFsLnBvc3QubWFwKFxuICAgICAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHN2Zzoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICB0ZXN0OiAvXFwuc3ZnKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5vcHRpb25zIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuc3ZnLmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgdHRmOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC50dGYoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYuYWRkaXRpb25hbC5wcmUubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlXG4gICAgICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLm9wdGlvbnMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC50dGYuYWRkaXRpb25hbC5wb3N0Lm1hcChcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9LFxuICAgICAgICB3b2ZmOiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuZXhjbHVkZSwgZmlsZVBhdGhcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgdGVzdDogL1xcLndvZmYyPyg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuYWRkaXRpb25hbC5wcmUubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlXG4gICAgICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYuYWRkaXRpb25hbC5wb3N0Lm1hcChcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gaW1hZ2VcbiAgICBpbWFnZToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5leGNsdWRlID09PSBudWxsXG4gICAgICAgICkgPyBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgIGV2YWx1YXRlKGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuaW1hZ2UsXG4gICAgICAgIHRlc3Q6IC9cXC4oPzpwbmd8anBnfGljb3xnaWYpKD86XFw/LiopPyQvaSxcbiAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuYWRkaXRpb25hbC5wcmUubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UubG9hZGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5maWxlIHx8IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmFkZGl0aW9uYWwucG9zdC5tYXAoZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGRhdGFcbiAgICBkYXRhOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIHBhdGguZXh0bmFtZShIZWxwZXIuc3RyaXBMb2FkZXIoZmlsZVBhdGgpKVxuICAgICAgICAgICAgKSB8fCAoKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuZXhjbHVkZSwgZmlsZVBhdGgpKSxcbiAgICAgICAgdGVzdDogLy4rLyxcbiAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuYWRkaXRpb25hbC5wb3N0Lm1hcChldmFsdWF0ZSkpXG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxufSlcbmlmIChcbiAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuY2FzY2FkaW5nU3R5bGVTaGVldCAmJlxuICAgIHBsdWdpbnMuTWluaUNTU0V4dHJhY3Rcbikge1xuICAgIC8qXG4gICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gcmVtb3ZlIHRoZSBjbGllbnQgc2lkZSBqYXZhc2NyaXB0IGhtciBzdHlsZSBsb2FkZXJcbiAgICAgICAgZmlyc3QuXG4gICAgKi9cbiAgICBsb2FkZXIuc3R5bGUudXNlLnNoaWZ0KClcbiAgICBsb2FkZXIuc3R5bGUudXNlLnVuc2hpZnQocGx1Z2lucy5NaW5pQ1NTRXh0cmFjdC5sb2FkZXIpXG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gZW5kcmVnaW9uXG5mb3IgKGNvbnN0IHBsdWdpbkNvbmZpZ3VyYXRpb246UGx1Z2luQ29uZmlndXJhdGlvbiBvZiBjb25maWd1cmF0aW9uLnBsdWdpbnMpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IChldmFsKCdyZXF1aXJlJykocGx1Z2luQ29uZmlndXJhdGlvbi5uYW1lLm1vZHVsZSlbXG4gICAgICAgIHBsdWdpbkNvbmZpZ3VyYXRpb24ubmFtZS5pbml0aWFsaXplclxuICAgIF0pKC4uLnBsdWdpbkNvbmZpZ3VyYXRpb24ucGFyYW1ldGVyKSlcbi8vIHJlZ2lvbiBjb25maWd1cmF0aW9uXG5sZXQgY3VzdG9tQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHt9XG5pZiAoY29uZmlndXJhdGlvbi5wYXRoLmNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5wYXRoLmNvbmZpZ3VyYXRpb24uanNvbilcbiAgICB0cnkge1xuICAgICAgICBjdXN0b21Db25maWd1cmF0aW9uID0gcmVxdWlyZShjb25maWd1cmF0aW9uLnBhdGguY29uZmlndXJhdGlvbi5qc29uKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuZXhwb3J0IGNvbnN0IHdlYnBhY2tDb25maWd1cmF0aW9uOldlYnBhY2tDb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kKFxuICAgIHRydWUsXG4gICAge1xuICAgICAgICBiYWlsOiB0cnVlLFxuICAgICAgICBjYWNoZTogY29uZmlndXJhdGlvbi5jYWNoZS5tYWluLFxuICAgICAgICBjb250ZXh0OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgZGV2dG9vbDogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC50b29sLFxuICAgICAgICBkZXZTZXJ2ZXI6IGNvbmZpZ3VyYXRpb24uZGV2ZWxvcG1lbnQuc2VydmVyLFxuICAgICAgICAvLyByZWdpb24gaW5wdXRcbiAgICAgICAgZW50cnk6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQsXG4gICAgICAgIGV4dGVybmFsczogY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwubW9kdWxlcyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgYWxpYXM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICBhbGlhc0ZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLFxuICAgICAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIG1haW5GaWxlczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgbW9kdWxlRXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLm1vZHVsZSxcbiAgICAgICAgICAgIG1vZHVsZXM6IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyksXG4gICAgICAgICAgICBzeW1saW5rczogZmFsc2UsXG4gICAgICAgICAgICB1bnNhZmVDYWNoZTogY29uZmlndXJhdGlvbi5jYWNoZS51bnNhZmVcbiAgICAgICAgfSxcbiAgICAgICAgcmVzb2x2ZUxvYWRlcjoge1xuICAgICAgICAgICAgYWxpYXM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXMsXG4gICAgICAgICAgICBhbGlhc0ZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMuZmlsZSxcbiAgICAgICAgICAgIG1haW5GaWVsZHM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBtYWluRmlsZXM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMubW9kdWxlLFxuICAgICAgICAgICAgbW9kdWxlczogY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBzeW1saW5rczogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIC8vIHJlZ2lvbiBvdXRwdXRcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICBmaWxlbmFtZTogcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgaGFzaEZ1bmN0aW9uOiBjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG0sXG4gICAgICAgICAgICBsaWJyYXJ5OiBsaWJyYXJ5TmFtZSxcbiAgICAgICAgICAgIGxpYnJhcnlUYXJnZXQ6IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnXG4gICAgICAgICAgICApID8gJ3ZhcicgOiBjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmLFxuICAgICAgICAgICAgcGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgcHVibGljUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5wdWJsaWMsXG4gICAgICAgICAgICB1bWROYW1lZERlZmluZTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwZXJmb3JtYW5jZTogY29uZmlndXJhdGlvbi5wZXJmb3JtYW5jZUhpbnRzLFxuICAgICAgICB0YXJnZXQ6IGNvbmZpZ3VyYXRpb24udGFyZ2V0VGVjaG5vbG9neSxcbiAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIG1vZGU6IGNvbmZpZ3VyYXRpb24uZGVidWcgPyAnZGV2ZWxvcG1lbnQnIDogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIHJ1bGVzOiBjb25maWd1cmF0aW9uLm1vZHVsZS5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICAgICAgZ2VuZXJhdGVMb2FkZXJcbiAgICAgICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAgICAgIGxvYWRlci5lanMsXG4gICAgICAgICAgICAgICAgbG9hZGVyLnNjcmlwdCxcbiAgICAgICAgICAgICAgICBsb2FkZXIuaHRtbC5tYWluLCBsb2FkZXIuaHRtbC5lanMsIGxvYWRlci5odG1sLmh0bWwsXG4gICAgICAgICAgICAgICAgbG9hZGVyLnN0eWxlLFxuICAgICAgICAgICAgICAgIGxvYWRlci5mb250LmVvdCwgbG9hZGVyLmZvbnQuc3ZnLCBsb2FkZXIuZm9udC50dGYsXG4gICAgICAgICAgICAgICAgbG9hZGVyLmZvbnQud29mZixcbiAgICAgICAgICAgICAgICBsb2FkZXIuaW1hZ2UsXG4gICAgICAgICAgICAgICAgbG9hZGVyLmRhdGEsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuYWRkaXRpb25hbC5wb3N0Lm1hcChnZW5lcmF0ZUxvYWRlcilcbiAgICAgICAgICAgIClcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZTogY29uZmlndXJhdGlvbi5ub2RlRW52aXJvbm1lbnQsXG4gICAgICAgIG9wdGltaXphdGlvbjoge1xuICAgICAgICAgICAgbWluaW1pemU6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5taW5pbWl6ZSxcbiAgICAgICAgICAgIG1pbmltaXplcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLm1pbmltaXplcixcbiAgICAgICAgICAgIC8vIHJlZ2lvbiBjb21tb24gY2h1bmtzXG4gICAgICAgICAgICBzcGxpdENodW5rczogKFxuICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLmluamVjdGlvbi5jaHVua3MgfHxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnRhcmdldFRlY2hub2xvZ3kgIT09ICd3ZWInIHx8XG4gICAgICAgICAgICAgICAgWydidWlsZDpkbGwnLCAndGVzdCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApID9cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlR3JvdXBzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbmRvcnM6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IDogVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua3M6ICdhbGwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVHcm91cHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZW5kb3JzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rczogKG1vZHVsZTpPYmplY3QpOmJvb2xlYW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCAhPT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbmFtZTpzdHJpbmcgb2YgT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gJyonIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lID09PSBtb2R1bGUubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiAtMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldXNlRXhpc3RpbmdDaHVuazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdDogL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uY2h1bmtzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIH0sXG4gICAgICAgIHBsdWdpbnM6IHBsdWdpbkluc3RhbmNlc1xuICAgIH0sXG4gICAgY29uZmlndXJhdGlvbi53ZWJwYWNrLFxuICAgIGN1c3RvbUNvbmZpZ3VyYXRpb25cbilcbmlmIChcbiAgICAhQXJyYXkuaXNBcnJheShjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnMpIHx8XG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUuc2tpcFBhcnNlUmVndWxhckV4cHJlc3Npb25zLmxlbmd0aFxuKVxuICAgIHdlYnBhY2tDb25maWd1cmF0aW9uLm1vZHVsZS5ub1BhcnNlID1cbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuc2tpcFBhcnNlUmVndWxhckV4cHJlc3Npb25zXG5pZiAoXG4gICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbmZpZ3VyYXRpb24gJiZcbiAgICBjb25maWd1cmF0aW9uLnBhdGguY29uZmlndXJhdGlvbi5qYXZhU2NyaXB0XG4pIHtcbiAgICBsZXQgcmVzdWx0Ok9iamVjdFxuICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IHJlcXVpcmUoY29uZmlndXJhdGlvbi5wYXRoLmNvbmZpZ3VyYXRpb24uamF2YVNjcmlwdClcbiAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICBpZiAocmVzdWx0KVxuICAgICAgICBpZiAocmVzdWx0Lmhhc093blByb3BlcnR5KCdyZXBsYWNlV2ViT3B0aW1pemVyJykpXG4gICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgIHdlYnBhY2tDb25maWd1cmF0aW9uID0gd2VicGFja0NvbmZpZ3VyYXRpb24ucmVwbGFjZVdlYk9wdGltaXplclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBUb29scy5leHRlbmQodHJ1ZSwgd2VicGFja0NvbmZpZ3VyYXRpb24sIHJlc3VsdClcbn1cbmlmIChjb25maWd1cmF0aW9uLnNob3dDb25maWd1cmF0aW9uKSB7XG4gICAgY29uc29sZS5pbmZvKFxuICAgICAgICAnVXNpbmcgaW50ZXJuYWwgY29uZmlndXJhdGlvbjonLFxuICAgICAgICB1dGlsLmluc3BlY3QoY29uZmlndXJhdGlvbiwge2RlcHRoOiBudWxsfSlcbiAgICApXG4gICAgY29uc29sZS5pbmZvKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgY29uc29sZS5pbmZvKFxuICAgICAgICAnVXNpbmcgd2VicGFjayBjb25maWd1cmF0aW9uOicsXG4gICAgICAgIHV0aWwuaW5zcGVjdCh3ZWJwYWNrQ29uZmlndXJhdGlvbiwge2RlcHRoOiBudWxsfSlcbiAgICApXG59XG4vLyBlbmRyZWdpb25cbmV4cG9ydCBkZWZhdWx0IHdlYnBhY2tDb25maWd1cmF0aW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==