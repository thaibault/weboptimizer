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

var _ejsLoader = _interopRequireDefault(require("./ejsLoader"));

var _configurator = _interopRequireDefault(require("./configurator"));

var _helper = _interopRequireDefault(require("./helper"));

var _htmlLoader = _interopRequireDefault(require("html-loader"));

var _loaderUtils = _interopRequireDefault(require("loader-utils"));

try {
  var postcssCSSnano = require('cssnano');
} catch (error) {}
/* eslint-enable no-var */


/* eslint-disable no-var */
try {
  var postcssPresetENV = require('postcss-preset-env');
} catch (error) {}

try {
  var postcssFontPath = require('postcss-fontpath');
} catch (error) {}

try {
  var postcssImport = require('postcss-import');
} catch (error) {}

try {
  var postcssSprites = require('postcss-sprites');
} catch (error) {}

try {
  var postcssURL = require('postcss-url');
} catch (error) {}
/* eslint-enable no-var */


var pluginNameResourceMapping = {
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
  if (Object.prototype.hasOwnProperty.call(pluginNameResourceMapping, name)) try {
    plugins[name] = require(pluginNameResourceMapping[name]);
  } catch (error) {}
}

if (plugins.Imagemin) plugins.Imagemin = plugins.Imagemin["default"];
if ('cache' in require && require.cache && require.resolve('html-loader') in require.cache) require.cache[require.resolve('html-loader')].exports = function () {
  _clientnode["default"].extend(true, this.options, module, this.options);

  for (var _len = arguments.length, parameter = new Array(_len), _key = 0; _key < _len; _key++) {
    parameter[_key] = arguments[_key];
  }

  return _htmlLoader["default"].call.apply(_htmlLoader["default"], [this].concat(parameter));
}; // Monkey-Patch loader-utils to define which url is a local request.

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
  if (Object.prototype.hasOwnProperty.call(_configurator["default"].module.replacements.normal, source)) {
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
// /// region apply module pattern

pluginInstances.push({
  apply: function apply(compiler) {
    compiler.hooks.emit.tap('applyModulePattern', function (compilation) {
      for (var request in compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(compilation.assets, request)) {
          var filePath = request.replace(/\?[^?]+$/, '');

          var _type = _helper["default"].determineAssetType(filePath, _configurator["default"].buildContext.types, _configurator["default"].path);

          if (_type && _configurator["default"].assetPattern[_type] && !new RegExp(_configurator["default"].assetPattern[_type].excludeFilePathRegularExpression).test(filePath)) {
            var _source = compilation.assets[request].source();

            if (typeof _source === 'string') compilation.assets[request] = new _webpackSources.RawSource(_configurator["default"].assetPattern[_type].pattern.replace(/\{1\}/g, _source.replace(/\$/g, '$$$')));
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
  if (Object.prototype.hasOwnProperty.call(_configurator["default"].injection.entry.normalized, chunkName)) {
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

if (!(_configurator["default"].needed.javaScript || _configurator["default"].needed.typeScript)) _configurator["default"].files.compose.javaScript = _path2["default"].resolve(_configurator["default"].path.target.asset.javaScript, '.__dummy__.compiled.js'); // /// endregion
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

              if (!(Object.prototype.hasOwnProperty.call(_configurator["default"].injection.external.aliases, pattern) && pattern.startsWith('^'))) {
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

              if (!Object.prototype.hasOwnProperty.call(_configurator["default"].injection.external.aliases, request)) {
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
              if (!Object.prototype.hasOwnProperty.call(result, 'default')) {
                _context3.next = 119;
                break;
              }

              _iteratorNormalCompletion7 = true;
              _didIteratorError7 = false;
              _iteratorError7 = undefined;
              _context3.prev = 103;

              for (_iterator7 = keys[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                _key5 = _step7.value;
                if (!Object.prototype.hasOwnProperty.call(result, _key5)) result[_key5] = result["default"];
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
              if (Object.prototype.hasOwnProperty.call(result, 'root')) result.root = [].concat(result.root).map(function (name) {
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
    if (Object.prototype.hasOwnProperty.call(_configurator["default"].injection.entry.normalized, _chunkName)) if (_configurator["default"].injection.dllChunkNames.includes(_chunkName)) dllChunkExists = true;else delete _configurator["default"].injection.entry.normalized[_chunkName];
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
          if (Object.prototype.hasOwnProperty.call(linkables, tagName)) {
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
                  if (Object.prototype.hasOwnProperty.call(loaderConfiguration, 'options') && Object.prototype.hasOwnProperty.call(loaderConfiguration.options, 'compileSteps') && typeof loaderConfiguration.options.compileSteps === 'number') data.html = _ejsLoader["default"].bind(_clientnode["default"].extend(true, {}, {
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
      return new Function('configuration', '__dirname', '__filename', "return ".concat(value))(_configurator["default"], __dirname, __filename);
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
      var redundantRequest;
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

var evaluateLoaderConfiguration = function evaluateLoaderConfiguration(loaderConfiguration) {
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
  return (0, _construct2["default"])(Function, ['filePath'].concat((0, _toConsumableArray2["default"])(Object.keys(scope)), ["return ".concat(code)])).apply(void 0, [filePath].concat((0, _toConsumableArray2["default"])(Object.values(scope))));
};

var includingPaths = _helper["default"].normalizePaths([_configurator["default"].path.source.asset.javaScript].concat(_configurator["default"].module.locations.directoryPaths));

_clientnode["default"].extend(loader, {
  // Convert to compatible native web types.
  // region generic template
  ejs: {
    exclude: function exclude(filePath) {
      return _helper["default"].normalizePaths(_configurator["default"].files.html.concat(_configurator["default"].files.defaultHTML).map(function (htmlConfiguration) {
        return htmlConfiguration.template.filePath;
      })).includes(filePath) || _configurator["default"].module.preprocessor.ejs.exclude === null ? false : evaluate(_configurator["default"].module.preprocessor.ejs.exclude, filePath);
    },
    include: includingPaths,
    test: /^(?!.+\.html\.ejs$).+\.ejs$/i,
    use: _configurator["default"].module.preprocessor.ejs.additional.pre.map(evaluate).concat({
      loader: 'file?name=[path][name]' + ((_configurator["default"].module.preprocessor.ejs.options || {
        compileSteps: 2
      }).compileSteps % 2 ? '.js' : '') + "?".concat(_configurator["default"].hashAlgorithm, "=[hash]")
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
        loader: 'file?name=' + _path2["default"].join(_path2["default"].relative(_configurator["default"].path.target.asset.base, _configurator["default"].path.target.asset.template), '[name]' + ((_configurator["default"].module.preprocessor.html.options || {
          compileSteps: 2
        }).compileSteps % 2 ? '.js' : '') + "?".concat(_configurator["default"].hashAlgorithm, "=[hash]"))
      }, (_configurator["default"].module.preprocessor.html.options || {
        compileSteps: 2
      }).compileSteps % 2 ? [] : [{
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
    rules: _configurator["default"].module.additional.pre.map(evaluateLoaderConfiguration).concat(loader.ejs, loader.script, loader.html.main, loader.html.ejs, loader.html.html, loader.style, loader.font.eot, loader.font.svg, loader.font.ttf, loader.font.woff, loader.image, loader.data, _configurator["default"].module.additional.post.map(evaluateLoaderConfiguration))
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

  if (result) if (Object.prototype.hasOwnProperty.call(result, 'replaceWebOptimizer')) exports.webpackConfiguration = webpackConfiguration = ((0, _readOnlyError2["default"])("webpackConfiguration"), webpackConfiguration.replaceWebOptimizer);else _clientnode["default"].extend(true, webpackConfiguration, result);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2tDb25maWd1cmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQVlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQTs7QUFNQTs7QUFDQTs7QUFDQTs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBcUJBOztBQU1BOztBQUNBOztBQUlBOztBQWFBOztBQXZFQSxJQUFJO0FBQ0EsTUFBSSxjQUF1QixHQUFHLE9BQU8sQ0FBQyxTQUFELENBQXJDO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7QUFDbEI7OztBQUlBO0FBQ0EsSUFBSTtBQUNBLE1BQUksZ0JBQXlCLEdBQUcsT0FBTyxDQUFDLG9CQUFELENBQXZDO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7O0FBQ2xCLElBQUk7QUFDQSxNQUFJLGVBQXdCLEdBQUcsT0FBTyxDQUFDLGtCQUFELENBQXRDO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7O0FBQ2xCLElBQUk7QUFDQSxNQUFJLGFBQXNCLEdBQUcsT0FBTyxDQUFDLGdCQUFELENBQXBDO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7O0FBQ2xCLElBQUk7QUFDQSxNQUFJLGNBQXVCLEdBQUcsT0FBTyxDQUFDLGlCQUFELENBQXJDO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7O0FBQ2xCLElBQUk7QUFDQSxNQUFJLFVBQW1CLEdBQUcsT0FBTyxDQUFDLGFBQUQsQ0FBakM7QUFDSCxDQUZELENBRUUsT0FBTyxLQUFQLEVBQWMsQ0FBRTtBQUNsQjs7O0FBS0EsSUFBTSx5QkFBK0MsR0FBRztBQUNwRCxFQUFBLElBQUksRUFBRSxxQkFEOEM7QUFFcEQsRUFBQSxjQUFjLEVBQUUseUJBRm9DO0FBR3BELEVBQUEsa0JBQWtCLEVBQUUsK0JBSGdDO0FBSXBELEVBQUEsV0FBVyxFQUFFLDZCQUp1QztBQUtw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YixFQUFtQixvQkFBbkIsRUFBeUMsTUFBekM7QUFDWDs7QUFDRCxJQUFJLHlCQUFjLGlCQUFsQixFQUFxQztBQUNqQyxFQUFBLE9BQU8sQ0FBQyxJQUFSLENBQ0ksK0JBREosRUFFSSxpQkFBSyxPQUFMLENBQWEsd0JBQWIsRUFBNEI7QUFBQyxJQUFBLEtBQUssRUFBRTtBQUFSLEdBQTVCLENBRko7QUFJQSxFQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsNkRBQWI7QUFDQSxFQUFBLE9BQU8sQ0FBQyxJQUFSLENBQ0ksOEJBREosRUFFSSxpQkFBSyxPQUFMLENBQWEsb0JBQWIsRUFBbUM7QUFBQyxJQUFBLEtBQUssRUFBRTtBQUFSLEdBQW5DLENBRko7QUFJSCxDLENBQ0Q7OztlQUNlLG9CLEVBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoid2VicGFja0NvbmZpZ3VyYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIC0qLSBjb2Rpbmc6IHV0Zi04IC0qLVxuJ3VzZSBzdHJpY3QnXG4vKiAhXG4gICAgcmVnaW9uIGhlYWRlclxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9uc1xuICAgIG5hbWluZyAzLjAgdW5wb3J0ZWQgbGljZW5zZS5cbiAgICBTZWUgaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCBUb29scywge0RvbU5vZGUsIFBsYWluT2JqZWN0LCBQcm9jZWR1cmVGdW5jdGlvbn0gZnJvbSAnY2xpZW50bm9kZSdcbi8qIGVzbGludC1kaXNhYmxlIG5vLXZhciAqL1xudHJ5IHtcbiAgICB2YXIgcG9zdGNzc0NTU25hbm86RnVuY3Rpb24gPSByZXF1aXJlKCdjc3NuYW5vJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuLyogZXNsaW50LWVuYWJsZSBuby12YXIgKi9cbmltcG9ydCB7SlNET00gYXMgRE9NfSBmcm9tICdqc2RvbSdcbmltcG9ydCB7cHJvbWlzZXMgYXMgZmlsZVN5c3RlbX0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuLyogZXNsaW50LWRpc2FibGUgbm8tdmFyICovXG50cnkge1xuICAgIHZhciBwb3N0Y3NzUHJlc2V0RU5WOkZ1bmN0aW9uID0gcmVxdWlyZSgncG9zdGNzcy1wcmVzZXQtZW52Jylcbn0gY2F0Y2ggKGVycm9yKSB7fVxudHJ5IHtcbiAgICB2YXIgcG9zdGNzc0ZvbnRQYXRoOkZ1bmN0aW9uID0gcmVxdWlyZSgncG9zdGNzcy1mb250cGF0aCcpXG59IGNhdGNoIChlcnJvcikge31cbnRyeSB7XG4gICAgdmFyIHBvc3Rjc3NJbXBvcnQ6RnVuY3Rpb24gPSByZXF1aXJlKCdwb3N0Y3NzLWltcG9ydCcpXG59IGNhdGNoIChlcnJvcikge31cbnRyeSB7XG4gICAgdmFyIHBvc3Rjc3NTcHJpdGVzOkZ1bmN0aW9uID0gcmVxdWlyZSgncG9zdGNzcy1zcHJpdGVzJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxudHJ5IHtcbiAgICB2YXIgcG9zdGNzc1VSTDpGdW5jdGlvbiA9IHJlcXVpcmUoJ3Bvc3Rjc3MtdXJsJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuLyogZXNsaW50LWVuYWJsZSBuby12YXIgKi9cbmltcG9ydCB1dGlsIGZyb20gJ3V0aWwnXG5pbXBvcnQgd2VicGFjayBmcm9tICd3ZWJwYWNrJ1xuaW1wb3J0IHtSYXdTb3VyY2UgYXMgV2VicGFja1Jhd1NvdXJjZX0gZnJvbSAnd2VicGFjay1zb3VyY2VzJ1xuXG5jb25zdCBwbHVnaW5OYW1lUmVzb3VyY2VNYXBwaW5nOntba2V5OnN0cmluZ106c3RyaW5nfSA9IHtcbiAgICBIVE1MOiAnaHRtbC13ZWJwYWNrLXBsdWdpbicsXG4gICAgTWluaUNTU0V4dHJhY3Q6ICdtaW5pLWNzcy1leHRyYWN0LXBsdWdpbicsXG4gICAgQWRkQXNzZXRIVE1MUGx1Z2luOiAnYWRkLWFzc2V0LWh0bWwtd2VicGFjay1wbHVnaW4nLFxuICAgIE9wZW5Ccm93c2VyOiAnb3Blbi1icm93c2VyLXdlYnBhY2stcGx1Z2luJyxcbiAgICBGYXZpY29uOiAnZmF2aWNvbnMtd2VicGFjay1wbHVnaW4nLFxuICAgIEltYWdlbWluOiAnaW1hZ2VtaW4td2VicGFjay1wbHVnaW4nLFxuICAgIE9mZmxpbmU6ICdvZmZsaW5lLXBsdWdpbidcbn1cbmNvbnN0IHBsdWdpbnM6UmVjb3JkPHN0cmluZywgYW55PiA9IHt9XG5mb3IgKGNvbnN0IG5hbWUgaW4gcGx1Z2luTmFtZVJlc291cmNlTWFwcGluZylcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHBsdWdpbk5hbWVSZXNvdXJjZU1hcHBpbmcsIG5hbWUpKVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcGx1Z2luc1tuYW1lXSA9IHJlcXVpcmUocGx1Z2luTmFtZVJlc291cmNlTWFwcGluZ1tuYW1lXSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG5pZiAocGx1Z2lucy5JbWFnZW1pbilcbiAgICBwbHVnaW5zLkltYWdlbWluID0gcGx1Z2lucy5JbWFnZW1pbi5kZWZhdWx0XG5cblxuaW1wb3J0IGVqc0xvYWRlciBmcm9tICcuL2Vqc0xvYWRlcidcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQge1xuICAgIEhUTUxDb25maWd1cmF0aW9uLCBQbHVnaW5Db25maWd1cmF0aW9uLCBXZWJwYWNrQ29uZmlndXJhdGlvblxufSBmcm9tICcuL3R5cGUnXG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvcidcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXInXG4vLyAvIHJlZ2lvbiBtb25rZXkgcGF0Y2hlc1xuLy8gTW9ua2V5LVBhdGNoIGh0bWwgbG9hZGVyIHRvIHJldHJpZXZlIGh0bWwgbG9hZGVyIG9wdGlvbnMgc2luY2UgdGhlXG4vLyBcIndlYnBhY2staHRtbC1wbHVnaW5cIiBkb2Vzbid0IHByZXNlcnZlIHRoZSBvcmlnaW5hbCBsb2FkZXIgaW50ZXJmYWNlLlxuaW1wb3J0IGh0bWxMb2FkZXJNb2R1bGVCYWNrdXAgZnJvbSAnaHRtbC1sb2FkZXInXG5pZiAoXG4gICAgJ2NhY2hlJyBpbiByZXF1aXJlICYmXG4gICAgcmVxdWlyZS5jYWNoZSAmJlxuICAgIHJlcXVpcmUucmVzb2x2ZSgnaHRtbC1sb2FkZXInKSBpbiByZXF1aXJlLmNhY2hlXG4pXG4gICAgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2h0bWwtbG9hZGVyJyldLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgICAgICAgLi4ucGFyYW1ldGVyOkFycmF5PGFueT5cbiAgICApOmFueSB7XG4gICAgICAgIFRvb2xzLmV4dGVuZCh0cnVlLCB0aGlzLm9wdGlvbnMsIG1vZHVsZSwgdGhpcy5vcHRpb25zKVxuICAgICAgICByZXR1cm4gaHRtbExvYWRlck1vZHVsZUJhY2t1cC5jYWxsKHRoaXMsIC4uLnBhcmFtZXRlcilcbiAgICB9XG4vLyBNb25rZXktUGF0Y2ggbG9hZGVyLXV0aWxzIHRvIGRlZmluZSB3aGljaCB1cmwgaXMgYSBsb2NhbCByZXF1ZXN0LlxuaW1wb3J0IGxvYWRlclV0aWxzTW9kdWxlQmFja3VwIGZyb20gJ2xvYWRlci11dGlscydcbmNvbnN0IGxvYWRlclV0aWxzSXNVcmxSZXF1ZXN0QmFja3VwOih1cmw6c3RyaW5nKSA9PiBib29sZWFuID1cbiAgICBsb2FkZXJVdGlsc01vZHVsZUJhY2t1cC5pc1VybFJlcXVlc3RcbmlmIChcbiAgICAnY2FjaGUnIGluIHJlcXVpcmUgJiZcbiAgICByZXF1aXJlLmNhY2hlICYmXG4gICAgcmVxdWlyZS5yZXNvbHZlKCdsb2FkZXItdXRpbHMnKSBpbiByZXF1aXJlLmNhY2hlXG4pXG4gICAgcmVxdWlyZS5jYWNoZVtyZXF1aXJlLnJlc29sdmUoJ2xvYWRlci11dGlscycpXS5leHBvcnRzLmlzVXJsUmVxdWVzdCA9IChcbiAgICAgICAgdXJsOnN0cmluZywgLi4uYWRkaXRpb25hbFBhcmFtZXRlcjpBcnJheTxhbnk+XG4gICAgKTpib29sZWFuID0+IHtcbiAgICAgICAgaWYgKHVybC5tYXRjaCgvXlthLXpdKzouKy8pKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIHJldHVybiBsb2FkZXJVdGlsc0lzVXJsUmVxdWVzdEJhY2t1cC5hcHBseShcbiAgICAgICAgICAgIGxvYWRlclV0aWxzTW9kdWxlQmFja3VwLCBbdXJsXS5jb25jYXQoYWRkaXRpb25hbFBhcmFtZXRlcikpXG4gICAgfVxuLy8gLyBlbmRyZWdpb25cbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGluaXRpYWxpc2F0aW9uXG4vLyAvIHJlZ2lvbiBkZXRlcm1pbmUgbGlicmFyeSBuYW1lXG5sZXQgbGlicmFyeU5hbWU6c3RyaW5nXG5pZiAoJ2xpYnJhcnlOYW1lJyBpbiBjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24ubGlicmFyeU5hbWUpXG4gICAgbGlicmFyeU5hbWUgPSBjb25maWd1cmF0aW9uLmxpYnJhcnlOYW1lXG5lbHNlIGlmIChPYmplY3Qua2V5cyhjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkKS5sZW5ndGggPiAxKVxuICAgIGxpYnJhcnlOYW1lID0gJ1tuYW1lXSdcbmVsc2Uge1xuICAgIGxpYnJhcnlOYW1lID0gY29uZmlndXJhdGlvbi5uYW1lXG4gICAgaWYgKFsnYXNzaWduJywgJ2dsb2JhbCcsICd0aGlzJywgJ3ZhcicsICd3aW5kb3cnXS5pbmNsdWRlcyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuc2VsZlxuICAgICkpXG4gICAgICAgIGxpYnJhcnlOYW1lID0gVG9vbHMuc3RyaW5nQ29udmVydFRvVmFsaWRWYXJpYWJsZU5hbWUobGlicmFyeU5hbWUpXG59XG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gcGx1Z2luc1xuY29uc3QgcGx1Z2luSW5zdGFuY2VzOkFycmF5PFJlY29yZDxzdHJpbmcsIGFueT4+ID0gW1xuICAgIG5ldyB3ZWJwYWNrLm9wdGltaXplLk9jY3VycmVuY2VPcmRlclBsdWdpbih0cnVlKVxuXVxuLy8gLy8gcmVnaW9uIGRlZmluZSBtb2R1bGVzIHRvIGlnbm9yZVxuZm9yIChjb25zdCBpZ25vcmVQYXR0ZXJuIG9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmlnbm9yZVBhdHRlcm4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suSWdub3JlUGx1Z2luKG5ldyBSZWdFeHAoaWdub3JlUGF0dGVybikpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZGVmaW5lIG1vZHVsZXMgdG8gcmVwbGFjZVxuZm9yIChjb25zdCBzb3VyY2UgaW4gY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbClcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLCBzb3VyY2VcbiAgICApKSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Ob3JtYWxNb2R1bGVSZXBsYWNlbWVudFBsdWdpbihcbiAgICAgICAgICAgIHNlYXJjaCwgKHJlc291cmNlOntyZXF1ZXN0OnN0cmluZ30pOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIHJlc291cmNlLnJlcXVlc3QgPSByZXNvdXJjZS5yZXF1ZXN0LnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaCwgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbFtzb3VyY2VdKVxuICAgICAgICAgICAgfSkpXG4gICAgfVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gZ2VuZXJhdGUgaHRtbCBmaWxlXG5sZXQgaHRtbEF2YWlsYWJsZSA9IGZhbHNlXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdICE9PSAnYnVpbGQ6ZGxsJylcbiAgICBmb3IgKGNvbnN0IGh0bWxDb25maWd1cmF0aW9uIG9mIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbClcbiAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoaHRtbENvbmZpZ3VyYXRpb24udGVtcGxhdGUuZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5IVE1MKFRvb2xzLmV4dGVuZChcbiAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgICB7dGVtcGxhdGU6IGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLnJlcXVlc3R9XG4gICAgICAgICAgICApKSlcbiAgICAgICAgICAgIGh0bWxBdmFpbGFibGUgPSB0cnVlXG4gICAgICAgIH1cbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIGdlbmVyYXRlIGZhdmljb25zXG5pZiAoXG4gICAgaHRtbEF2YWlsYWJsZSAmJlxuICAgIGNvbmZpZ3VyYXRpb24uZmF2aWNvbiAmJlxuICAgIHBsdWdpbnMuRmF2aWNvbiAmJlxuICAgIFRvb2xzLmlzRmlsZVN5bmMoY29uZmlndXJhdGlvbi5mYXZpY29uLmxvZ28pXG4pXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuRmF2aWNvbihjb25maWd1cmF0aW9uLmZhdmljb24pKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gcHJvdmlkZSBvZmZsaW5lIGZ1bmN0aW9uYWxpdHlcbmlmIChodG1sQXZhaWxhYmxlICYmIGNvbmZpZ3VyYXRpb24ub2ZmbGluZSAmJiBwbHVnaW5zLk9mZmxpbmUpIHtcbiAgICBpZiAoIVsnc2VydmUnLCAndGVzdDpicm93c2VyJ10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkpXG4gICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbXG4gICAgICAgICAgICBbJ2Nhc2NhZGluZ1N0eWxlU2hlZXQnLCAnY3NzJ10sXG4gICAgICAgICAgICBbJ2phdmFTY3JpcHQnLCAnanMnXVxuICAgICAgICBdKVxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5QbGFjZVt0eXBlWzBdXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoZXM6QXJyYXk8c3RyaW5nPiA9IE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2VbdHlwZVswXV0pXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIG1hdGNoZXMpXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ub2ZmbGluZS5leGNsdWRlcy5wdXNoKHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0W3R5cGVbMF1dXG4gICAgICAgICAgICAgICAgICAgICkgKyBgJHtuYW1lfS4ke3R5cGVbMV19PyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT0qYClcbiAgICAgICAgICAgIH1cbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PZmZsaW5lKGNvbmZpZ3VyYXRpb24ub2ZmbGluZSkpXG59XG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBvcGVucyBicm93c2VyIGF1dG9tYXRpY2FsbHlcbmlmIChjb25maWd1cmF0aW9uLmRldmVsb3BtZW50Lm9wZW5Ccm93c2VyICYmIChodG1sQXZhaWxhYmxlICYmIFtcbiAgICAnc2VydmUnLCAndGVzdDpicm93c2VyJ1xuXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5PcGVuQnJvd3NlcihcbiAgICAgICAgY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC5vcGVuQnJvd3NlcikpXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBwcm92aWRlIGJ1aWxkIGVudmlyb25tZW50XG5pZiAoY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQuZGVmaW5pdGlvbnMpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHdlYnBhY2suRGVmaW5lUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC5kZWZpbml0aW9ucykpXG5pZiAoY29uZmlndXJhdGlvbi5tb2R1bGUucHJvdmlkZSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5Qcm92aWRlUGx1Z2luKFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcm92aWRlKSlcbi8vIC8vIGVuZHJlZ2lvblxuLy8gLy8gcmVnaW9uIG1vZHVsZXMvYXNzZXRzXG4vLyAvLy8gcmVnaW9uIGFwcGx5IG1vZHVsZSBwYXR0ZXJuXG5wbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpSZWNvcmQ8c3RyaW5nLCBhbnk+KTp2b2lkID0+IHtcbiAgICBjb21waWxlci5ob29rcy5lbWl0LnRhcChcbiAgICAgICAgJ2FwcGx5TW9kdWxlUGF0dGVybicsXG4gICAgICAgIChjb21waWxhdGlvbjpSZWNvcmQ8c3RyaW5nLCBhbnk+KTp2b2lkID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmVxdWVzdCBpbiBjb21waWxhdGlvbi5hc3NldHMpXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzLCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSByZXF1ZXN0LnJlcGxhY2UoL1xcP1teP10rJC8sICcnKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlOm51bGx8c3RyaW5nID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYXNzZXRQYXR0ZXJuW3R5cGVdICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5hc3NldFBhdHRlcm5bdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmV4Y2x1ZGVGaWxlUGF0aFJlZ3VsYXJFeHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApKS50ZXN0KGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZTpzdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1tyZXF1ZXN0XS5zb3VyY2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VyY2UgPT09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmFzc2V0c1tyZXF1ZXN0XSA9IG5ldyBXZWJwYWNrUmF3U291cmNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmFzc2V0UGF0dGVyblt0eXBlXS5wYXR0ZXJuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvXFx7MVxcfS9nLCBzb3VyY2UucmVwbGFjZSgvXFwkL2csICckJCQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIClcbn19KVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBpbi1wbGFjZSBjb25maWd1cmVkIGFzc2V0cyBpbiB0aGUgbWFpbiBodG1sIGZpbGVcbmlmIChodG1sQXZhaWxhYmxlICYmICFbJ3NlcnZlJywgJ3Rlc3Q6YnJvd3NlciddLmluY2x1ZGVzKFxuICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuKSlcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaCh7YXBwbHk6IChjb21waWxlcjpSZWNvcmQ8c3RyaW5nLCBhbnk+KTp2b2lkID0+IHtcbiAgICAgICAgY29uc3QgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgIGNvbXBpbGVyLmhvb2tzLmNvbXBpbGF0aW9uLnRhcCgnaW5QbGFjZUhUTUxBc3NldHMnLCAoXG4gICAgICAgICAgICBjb21waWxhdGlvbjpSZWNvcmQ8c3RyaW5nLCBhbnk+XG4gICAgICAgICk6dm9pZCA9PlxuICAgICAgICAgICAgY29tcGlsYXRpb24uaG9va3MuaHRtbFdlYnBhY2tQbHVnaW5BZnRlckh0bWxQcm9jZXNzaW5nLnRhcEFzeW5jKFxuICAgICAgICAgICAgICAgICdpblBsYWNlSFRNTEFzc2V0cycsXG4gICAgICAgICAgICAgICAgKGRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOkZ1bmN0aW9uKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmNhc2NhZGluZ1N0eWxlU2hlZXQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0XG4gICAgICAgICAgICAgICAgICAgICAgICApLmxlbmd0aCB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0KS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZzsgZmlsZVBhdGhzVG9SZW1vdmU6QXJyYXk8c3RyaW5nPjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9ID0gSGVscGVyLmluUGxhY2VDU1NBbmRKYXZhU2NyaXB0QXNzZXRSZWZlcmVuY2VzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmh0bWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5jYXNjYWRpbmdTdHlsZVNoZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuamF2YVNjcmlwdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXNjYWRpbmdTdHlsZVNoZWV0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsYXRpb24uYXNzZXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaHRtbCA9IHJlc3VsdC5jb250ZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGhzVG9SZW1vdmUuY29uY2F0KHJlc3VsdC5maWxlUGF0aHNUb1JlbW92ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yLCBkYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICBjb21waWxlci5ob29rcy5hZnRlckVtaXQudGFwQXN5bmMoXG4gICAgICAgICAgICAncmVtb3ZlSW5QbGFjZUhUTUxBc3NldEZpbGVzJywgYXN5bmMgKFxuICAgICAgICAgICAgICAgIGRhdGE6UmVjb3JkPHN0cmluZywgYW55PiwgY2FsbGJhY2s6UHJvY2VkdXJlRnVuY3Rpb25cbiAgICAgICAgICAgICk6UHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHByb21pc2VzOkFycmF5PFByb21pc2U8dm9pZD4+ID0gW11cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgZmlsZVBhdGhzVG9SZW1vdmUpXG4gICAgICAgICAgICAgICAgICAgIGlmIChhd2FpdCBUb29scy5pc0ZpbGUocGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKGZpbGVTeXN0ZW0udW5saW5rKHBhdGgpLmNhdGNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAgICAgICAgICAgcHJvbWlzZXMgPSBbXVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdHlwZSBvZiBbJ2phdmFTY3JpcHQnLCAnY2FzY2FkaW5nU3R5bGVTaGVldCddKVxuICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKGZpbGVTeXN0ZW0ucmVhZGRpcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7ZW5jb2Rpbmc6IGNvbmZpZ3VyYXRpb24uZW5jb2Rpbmd9XG4gICAgICAgICAgICAgICAgICAgICkudGhlbihhc3luYyAoZmlsZXM6QXJyYXk8c3RyaW5nPik6UHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0ucm1kaXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRbdHlwZV0pXG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICAgIH0pXG4gICAgfX0pXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIHJlbW92ZSBjaHVua3MgaWYgYSBjb3JyZXNwb25kaW5nIGRsbCBwYWNrYWdlIGV4aXN0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSAhPT0gJ2J1aWxkOmRsbCcpXG4gICAgZm9yIChjb25zdCBjaHVua05hbWUgaW4gY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZClcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQsIGNodW5rTmFtZVxuICAgICAgICApKSB7XG4gICAgICAgICAgICBjb25zdCBtYW5pZmVzdEZpbGVQYXRoOnN0cmluZyA9XG4gICAgICAgICAgICAgICAgYCR7Y29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlfS8ke2NodW5rTmFtZX0uYCArXG4gICAgICAgICAgICAgICAgYGRsbC1tYW5pZmVzdC5qc29uYFxuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZGxsTWFuaWZlc3RGaWxlUGF0aHMuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgbWFuaWZlc3RGaWxlUGF0aFxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPSBIZWxwZXIucmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgKSwgeydbbmFtZV0nOiBjaHVua05hbWV9KVxuICAgICAgICAgICAgICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyBwbHVnaW5zLkFkZEFzc2V0SFRNTFBsdWdpbih7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVwYXRoOiBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZVNvdXJjZW1hcDogVG9vbHMuaXNGaWxlU3luYyhgJHtmaWxlUGF0aH0ubWFwYClcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EbGxSZWZlcmVuY2VQbHVnaW4oe1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgbWFuaWZlc3Q6IHJlcXVpcmUobWFuaWZlc3RGaWxlUGF0aCl9KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuLy8gLy8vIGVuZHJlZ2lvblxuLy8gLy8vIHJlZ2lvbiBtYXJrIGVtcHR5IGphdmFTY3JpcHQgbW9kdWxlcyBhcyBkdW1teVxuaWYgKCEoY29uZmlndXJhdGlvbi5uZWVkZWQuamF2YVNjcmlwdCB8fCBjb25maWd1cmF0aW9uLm5lZWRlZC50eXBlU2NyaXB0KSlcbiAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC5qYXZhU2NyaXB0LCAnLl9fZHVtbXlfXy5jb21waWxlZC5qcycpXG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGV4dHJhY3QgY2FzY2FkaW5nIHN0eWxlIHNoZWV0c1xuaWYgKGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5jYXNjYWRpbmdTdHlsZVNoZWV0ICYmIHBsdWdpbnMuTWluaUNTU0V4dHJhY3QpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IHBsdWdpbnMuTWluaUNTU0V4dHJhY3Qoe1xuICAgICAgICBjaHVua3M6ICdbbmFtZV0uY3NzJyxcbiAgICAgICAgZmlsZW5hbWU6IHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuY2FzY2FkaW5nU3R5bGVTaGVldClcbiAgICB9KSlcbi8vIC8vLyBlbmRyZWdpb25cbi8vIC8vLyByZWdpb24gcGVyZm9ybXMgaW1wbGljaXQgZXh0ZXJuYWwgbG9naWNcbmlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5tb2R1bGVzID09PSAnX19pbXBsaWNpdF9fJylcbiAgICAvKlxuICAgICAgICBXZSBvbmx5IHdhbnQgdG8gcHJvY2VzcyBtb2R1bGVzIGZyb20gbG9jYWwgY29udGV4dCBpbiBsaWJyYXJ5IG1vZGUsXG4gICAgICAgIHNpbmNlIGEgY29uY3JldGUgcHJvamVjdCB1c2luZyB0aGlzIGxpYnJhcnkgc2hvdWxkIGNvbWJpbmUgYWxsIGFzc2V0c1xuICAgICAgICAoYW5kIGRlLWR1cGxpY2F0ZSB0aGVtKSBmb3Igb3B0aW1hbCBidW5kbGluZyByZXN1bHRzLiBOT1RFOiBPbmx5IG5hdGl2ZVxuICAgICAgICBqYXZhU2NyaXB0IGFuZCBqc29uIG1vZHVsZXMgd2lsbCBiZSBtYXJrZWQgYXMgZXh0ZXJuYWwgZGVwZW5kZW5jeS5cbiAgICAqL1xuICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLm1vZHVsZXMgPSBhc3luYyAoXG4gICAgICAgIGNvbnRleHQ6c3RyaW5nLCByZXF1ZXN0OnN0cmluZywgY2FsbGJhY2s6RnVuY3Rpb25cbiAgICApOlByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5yZXBsYWNlKC9eISsvLCAnJylcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgcmVxdWVzdCA9IHBhdGgucmVsYXRpdmUoY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIHJlcXVlc3QpXG4gICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMpXG4gICAgICAgICAgICBpZiAocmVxdWVzdC5zdGFydHNXaXRoKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QgPSByZXF1ZXN0LnN1YnN0cmluZyhmaWxlUGF0aC5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhcnRzV2l0aCgnLycpKVxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gcmVxdWVzdC5zdWJzdHJpbmcoMSlcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyByZWdpb24gcGF0dGVybiBiYXNlZCBhbGlhc2luZ1xuICAgICAgICBjb25zdCBmaWxlUGF0aDpudWxsfHN0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgIHJlcXVlc3QsXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpbGU6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlLmV4dGVybmFsLFxuICAgICAgICAgICAgICAgIG1vZHVsZTogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLm1vZHVsZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZ1xuICAgICAgICApXG4gICAgICAgIGlmIChmaWxlUGF0aClcbiAgICAgICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBpbiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzKVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlcywgcGF0dGVyblxuICAgICAgICAgICAgICAgICAgICApICYmXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4uc3RhcnRzV2l0aCgnXicpXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZ3VsYXJFeHByZXNzaW9uID0gbmV3IFJlZ0V4cChwYXR0ZXJuKVxuICAgICAgICAgICAgICAgICAgICBpZiAocmVndWxhckV4cHJlc3Npb24udGVzdChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtYXRjaCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW3BhdHRlcm5dXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudFJlZ3VsYXJFeHByZXNzaW9uID0gbmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXRDb25maWd1cmF0aW9uKVswXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXQ6c3RyaW5nID0gdGFyZ2V0Q29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXRDb25maWd1cmF0aW9uKVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldC5zdGFydHNXaXRoKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQuc3Vic3RyaW5nKDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWxpYXNlZFJlcXVlc3Q6c3RyaW5nID0gcmVxdWVzdC5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudFJlZ3VsYXJFeHByZXNzaW9uLCB0YXJnZXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFsaWFzZWRSZXF1ZXN0ICE9PSByZXF1ZXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IEJvb2xlYW4oSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpYXNlZFJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5leHRlcm5hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5tb2R1bGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IHJlcXVlc3QucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGFjZW1lbnRSZWd1bGFyRXhwcmVzc2lvbiwgdGFyZ2V0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICBjb25zdCByZXNvbHZlZFJlcXVlc3Q6bnVsbHxzdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lRXh0ZXJuYWxSZXF1ZXN0KFxuICAgICAgICAgICAgcmVxdWVzdCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5pbXBsaWNpdC5wYXR0ZXJuLmluY2x1ZGUsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5pbXBsaWNpdC5wYXR0ZXJuLmV4Y2x1ZGUsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluUGxhY2UuZXh0ZXJuYWxMaWJyYXJ5Lm5vcm1hbCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5leHRlcm5hbExpYnJhcnkuZHluYW1pYyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgKVxuICAgICAgICBpZiAocmVzb2x2ZWRSZXF1ZXN0KSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAgICAgJ2FtZCcsICdjb21tb25qcycsICdjb21tb25qczInLCAncm9vdCddXG4gICAgICAgICAgICBsZXQgcmVzdWx0OlBsYWluT2JqZWN0fHN0cmluZyA9IHJlc29sdmVkUmVxdWVzdFxuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzLCByZXF1ZXN0XG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVnaW9uIG5vcm1hbCBhbGlhcyByZXBsYWNlbWVudFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtkZWZhdWx0OiByZXF1ZXN0fVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIF0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbcmVxdWVzdF1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmV4dGVybmFsLmFsaWFzZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIF0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1tyZXF1ZXN0XShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCwga2V5KVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBdICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBjb25maWd1cmF0aW9uLmluamVjdGlvbi5leHRlcm5hbC5hbGlhc2VzW1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICBdID09PSAnb2JqZWN0J1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwuYWxpYXNlc1tyZXF1ZXN0XSlcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJlc3VsdCwgJ2RlZmF1bHQnKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJlc3VsdCwga2V5KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHJlc3VsdC5kZWZhdWx0XG4gICAgICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJlc3VsdCwgJ3Jvb3QnKSlcbiAgICAgICAgICAgICAgICByZXN1bHQucm9vdCA9IFtdLmNvbmNhdChyZXN1bHQucm9vdCkubWFwKChcbiAgICAgICAgICAgICAgICAgICAgbmFtZTpzdHJpbmdcbiAgICAgICAgICAgICAgICApOnN0cmluZyA9PiBUb29scy5zdHJpbmdDb252ZXJ0VG9WYWxpZFZhcmlhYmxlTmFtZShuYW1lKSlcbiAgICAgICAgICAgIGNvbnN0IGV4cG9ydEZvcm1hdDpzdHJpbmcgPSAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHBvcnRGb3JtYXQuZXh0ZXJuYWwgfHxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmXG4gICAgICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBleHBvcnRGb3JtYXQgPT09ICd1bWQnIHx8IHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnID9cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0IDpcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2V4cG9ydEZvcm1hdF0sXG4gICAgICAgICAgICAgICAgZXhwb3J0Rm9ybWF0XG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKClcbiAgICB9XG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLy8gcmVnaW9uIGJ1aWxkIGRsbCBwYWNrYWdlc1xuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ2J1aWxkOmRsbCcpIHtcbiAgICBsZXQgZGxsQ2h1bmtFeGlzdHMgPSBmYWxzZVxuICAgIGZvciAoY29uc3QgY2h1bmtOYW1lIGluIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQpXG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkLCBjaHVua05hbWVcbiAgICAgICAgKSlcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5kbGxDaHVua05hbWVzLmluY2x1ZGVzKGNodW5rTmFtZSkpXG4gICAgICAgICAgICAgICAgZGxsQ2h1bmtFeGlzdHMgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZGVsZXRlIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgIGlmIChkbGxDaHVua0V4aXN0cykge1xuICAgICAgICBsaWJyYXJ5TmFtZSA9ICdbbmFtZV1ETExQYWNrYWdlJ1xuICAgICAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgd2VicGFjay5EbGxQbHVnaW4oe1xuICAgICAgICAgICAgcGF0aDogYCR7Y29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlfS9bbmFtZV0uZGxsLW1hbmlmZXN0Lmpzb25gLFxuICAgICAgICAgICAgbmFtZTogbGlicmFyeU5hbWVcbiAgICAgICAgfSkpXG4gICAgfSBlbHNlXG4gICAgICAgIGNvbnNvbGUud2FybignTm8gZGxsIGNodW5rIGlkIGZvdW5kLicpXG59XG4vLyAvLy8gZW5kcmVnaW9uXG4vLyAvLyBlbmRyZWdpb25cbi8vIC8vIHJlZ2lvbiBhcHBseSBmaW5hbCBkb20vamF2YVNjcmlwdC9jYXNjYWRpbmdTdHlsZVNoZWV0IG1vZGlmaWNhdGlvbnMvZml4ZXNcbmlmIChodG1sQXZhaWxhYmxlKVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKHthcHBseTogKFxuICAgICAgICBjb21waWxlcjpSZWNvcmQ8c3RyaW5nLCBhbnk+XG4gICAgKTp2b2lkID0+IGNvbXBpbGVyLmhvb2tzLmNvbXBpbGF0aW9uLnRhcCgnY29tcGlsYXRpb24nLCAoXG4gICAgICAgIGNvbXBpbGF0aW9uOlJlY29yZDxzdHJpbmcsIGFueT5cbiAgICApOnZvaWQgPT4ge1xuICAgICAgICBjb21waWxhdGlvbi5ob29rcy5odG1sV2VicGFja1BsdWdpbkFsdGVyQXNzZXRUYWdzLnRhcEFzeW5jKFxuICAgICAgICAgICAgJ3JlbW92ZUR1bW15SFRNTFRhZ3MnLFxuICAgICAgICAgICAgKGRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOkZ1bmN0aW9uKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZ3Mgb2YgW2RhdGEuYm9keSwgZGF0YS5oZWFkXSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFnIG9mIHRhZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgvXlxcLl9fZHVtbXlfXyhcXC4uKik/JC8udGVzdChwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5hdHRyaWJ1dGVzLnNyYyB8fCB0YWcuYXR0cmlidXRlcy5ocmVmIHx8ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICApKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldHM6QXJyYXk8c3RyaW5nPiA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucGx1Z2luLmFzc2V0SnNvbilcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBhc3NldFJlcXVlc3Qgb2YgYXNzZXRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgvXlxcLl9fZHVtbXlfXyhcXC4uKik/JC8udGVzdChwYXRoLmJhc2VuYW1lKFxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRSZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXRzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkYXRhLnBsdWdpbi5hc3NldEpzb24gPSBKU09OLnN0cmluZ2lmeShhc3NldHMpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIGNvbXBpbGF0aW9uLmhvb2tzLmh0bWxXZWJwYWNrUGx1Z2luQWZ0ZXJIdG1sUHJvY2Vzc2luZy50YXBBc3luYyhcbiAgICAgICAgICAgICdwb3N0UHJvY2Vzc0hUTUwnLFxuICAgICAgICAgICAgKGRhdGE6UGxhaW5PYmplY3QsIGNhbGxiYWNrOkZ1bmN0aW9uKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBOT1RFOiBXZSBoYXZlIHRvIHByZXZlbnQgY3JlYXRpbmcgbmF0aXZlIFwic3R5bGVcIiBkb20gbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgdG8gcHJldmVudCBqc2RvbSBmcm9tIHBhcnNpbmcgdGhlIGVudGlyZSBjYXNjYWRpbmcgc3R5bGVcbiAgICAgICAgICAgICAgICAgICAgc2hlZXQuIFdoaWNoIGlzIGVycm9yIHBydW5lIGFuZCB2ZXJ5IHJlc291cmNlIGludGVuc2l2ZS5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0eWxlQ29udGVudHM6QXJyYXk8c3RyaW5nPiA9IFtdXG4gICAgICAgICAgICAgICAgZGF0YS5odG1sID0gZGF0YS5odG1sLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAgIC8oPHN0eWxlW14+XSo+KShbXFxzXFxTXSo/KSg8XFwvc3R5bGVbXj5dKj4pL2dpLFxuICAgICAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFRhZzpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRhZzpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgKTpzdHJpbmcgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVDb250ZW50cy5wdXNoKGNvbnRlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7c3RhcnRUYWd9JHtlbmRUYWd9YFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGxldCBkb206RE9NXG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IFdlIGhhdmUgdG8gdHJhbnNsYXRlIHRlbXBsYXRlIGRlbGltaXRlciB0byBodG1sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wYXRpYmxlIHNlcXVlbmNlcyBhbmQgdHJhbnNsYXRlIGl0IGJhY2sgbGF0ZXIgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgIGF2b2lkIHVuZXhwZWN0ZWQgZXNjYXBlIHNlcXVlbmNlcyBpbiByZXN1bHRpbmcgaHRtbC5cbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZG9tID0gbmV3IERPTShcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaHRtbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC88JS9nLCAnIyMrIysjKyMjJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJT4vZywgJyMjLSMtIy0jIycpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IsIGRhdGEpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmthYmxlczp7W2tleTpzdHJpbmddOnN0cmluZ30gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbms6ICdocmVmJyxcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0OiAnc3JjJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhZ05hbWUgaW4gbGlua2FibGVzKVxuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgbGlua2FibGVzLCB0YWdOYW1lXG4gICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRvbU5vZGUgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb20ud2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3RhZ05hbWV9WyR7bGlua2FibGVzW3RhZ05hbWVdfSo9XCI/YCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09XCJdYClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBSZW1vdmluZyBzeW1ib2xzIGFmdGVyIGEgXCImXCIgaW4gaGFzaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgaXMgbmVjZXNzYXJ5IHRvIG1hdGNoIHRoZSBnZW5lcmF0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCBzdHJpbmdzIGluIG9mZmxpbmUgcGx1Z2luLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmthYmxlc1t0YWdOYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tTm9kZS5nZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZXNbdGFnTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgKFxcXFw/JHtjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG19PWAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1teJl0rKS4qJCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgJyQxJykpXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgTk9URTogV2UgaGF2ZSB0byByZXN0b3JlIHRlbXBsYXRlIGRlbGltaXRlciBhbmQgc3R5bGVcbiAgICAgICAgICAgICAgICAgICAgY29udGVudHMuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBkYXRhLmh0bWwgPSBkb20uc2VyaWFsaXplKClcbiAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyMjXFwrI1xcKyNcXCsjIy9nLCAnPCUnKVxuICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvIyMtIy0jLSMjL2csICclPicpXG4gICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oPHN0eWxlW14+XSo+KVtcXHNcXFNdKj8oPFxcL3N0eWxlW14+XSo+KS9naSwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUYWc6c3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGFnOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICApOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7c3RhcnRUYWd9JHtzdHlsZUNvbnRlbnRzLnNoaWZ0KCl9JHtlbmRUYWd9YClcbiAgICAgICAgICAgICAgICAvLyByZWdpb24gcG9zdCBjb21waWxhdGlvblxuICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxGaWxlU3BlY2lmaWNhdGlvbiBvZlxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmh0bWxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxGaWxlU3BlY2lmaWNhdGlvbi5maWxlbmFtZSA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucGx1Z2luLm9wdGlvbnMuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvYWRlckNvbmZpZ3VyYXRpb24gb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sRmlsZVNwZWNpZmljYXRpb24udGVtcGxhdGUudXNlXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLCAnb3B0aW9ucydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLm9wdGlvbnMsICdjb21waWxlU3RlcHMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbXBpbGVTdGVwcyA9PT1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuaHRtbCA9IGVqc0xvYWRlci5iaW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29wdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24ub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcGlsZVN0ZXBzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbEZpbGVTcGVjaWZpY2F0aW9uLnRlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBvc3RDb21waWxlU3RlcHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKGRhdGEuaHRtbClcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBkYXRhKVxuICAgICAgICAgICAgfVxuICAgICAgICApXG4gICAgfSl9KVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gYWRkIGF1dG9tYXRpYyBpbWFnZSBjb21wcmVzc2lvblxuLy8gTk9URTogVGhpcyBwbHVnaW4gc2hvdWxkIGJlIGxvYWRlZCBhdCBsYXN0IHRvIGVuc3VyZSB0aGF0IGFsbCBlbWl0dGVkIGltYWdlc1xuLy8gcmFuIHRocm91Z2guXG5pZiAocGx1Z2lucy5JbWFnZW1pbilcbiAgICBwbHVnaW5JbnN0YW5jZXMucHVzaChuZXcgcGx1Z2lucy5JbWFnZW1pbihcbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmNvbnRlbnQpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gY29udGV4dCByZXBsYWNlbWVudHNcbmZvciAoY29uc3QgY29udGV4dFJlcGxhY2VtZW50IG9mIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5jb250ZXh0KVxuICAgIHBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLkNvbnRleHRSZXBsYWNlbWVudFBsdWdpbihcbiAgICAgICAgLi4uY29udGV4dFJlcGxhY2VtZW50Lm1hcCgodmFsdWU6c3RyaW5nKTphbnkgPT4gKG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICdjb25maWd1cmF0aW9uJywgJ19fZGlybmFtZScsICdfX2ZpbGVuYW1lJywgYHJldHVybiAke3ZhbHVlfWBcbiAgICAgICAgKSkoY29uZmlndXJhdGlvbiwgX19kaXJuYW1lLCBfX2ZpbGVuYW1lKSkpKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvLyByZWdpb24gY29uc29saWRhdGUgZHVwbGljYXRlZCBtb2R1bGUgcmVxdWVzdHNcbnBsdWdpbkluc3RhbmNlcy5wdXNoKG5ldyB3ZWJwYWNrLk5vcm1hbE1vZHVsZVJlcGxhY2VtZW50UGx1Z2luKFxuICAgIC8oKD86XnxcXC8pbm9kZV9tb2R1bGVzXFwvLispezJ9LyxcbiAgICAocmVzb3VyY2U6e3JlcXVlc3Q6c3RyaW5nO3Jlc291cmNlOnN0cmluZ30pOnZvaWQgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXROYW1lOnN0cmluZyA9IHJlc291cmNlLnJlcXVlc3QgPyAncmVxdWVzdCcgOiAncmVzb3VyY2UnXG4gICAgICAgIGNvbnN0IHRhcmdldFBhdGg6c3RyaW5nID0gcmVzb3VyY2VbdGFyZ2V0TmFtZV1cbiAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmModGFyZ2V0UGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VEZXNjcmlwdG9yOm51bGx8UGxhaW5PYmplY3QgPVxuICAgICAgICAgICAgICAgIEhlbHBlci5nZXRDbG9zZXN0UGFja2FnZURlc2NyaXB0b3IodGFyZ2V0UGF0aClcbiAgICAgICAgICAgIGlmIChwYWNrYWdlRGVzY3JpcHRvcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhQcmVmaXhlczpBcnJheTxzdHJpbmc+ID0gdGFyZ2V0UGF0aC5tYXRjaChcbiAgICAgICAgICAgICAgICAgICAgLygoPzpefC4qP1xcLylub2RlX21vZHVsZXNcXC8pL2cpXG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgZmluZGluZyB0aGUgc2FtZSBhcnRlZmFjdC5cbiAgICAgICAgICAgICAgICBwYXRoUHJlZml4ZXMucG9wKClcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSAwXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoUHJlZml4IG9mIHBhdGhQcmVmaXhlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aFByZWZpeGVzW2luZGV4XSA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoUHJlZml4ZXNbaW5kZXggLSAxXSwgcGF0aFByZWZpeClcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBwYXRoU3VmZml4OnN0cmluZyA9IHRhcmdldFBhdGgucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgLyg/Ol58LipcXC8pbm9kZV9tb2R1bGVzXFwvKC4rJCkvLCAnJDEnKVxuICAgICAgICAgICAgICAgIGxldCByZWR1bmRhbnRSZXF1ZXN0OlBsYWluT2JqZWN0XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoUHJlZml4IG9mIHBhdGhQcmVmaXhlcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbHRlcm5hdGVUYXJnZXRQYXRoOnN0cmluZyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGhQcmVmaXgsIHBhdGhTdWZmaXgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKGFsdGVybmF0ZVRhcmdldFBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbHRlcm5hdGVQYWNrYWdlRGVzY3JpcHRvcjpQbGFpbk9iamVjdCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmdldENsb3Nlc3RQYWNrYWdlRGVzY3JpcHRvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRlVGFyZ2V0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWNrYWdlRGVzY3JpcHRvci5jb25maWd1cmF0aW9uLnZlcnNpb24gPT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0ZXJuYXRlUGFja2FnZURlc2NyaXB0b3IuY29uZmlndXJhdGlvbi52ZXJzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBDb25zb2xpZGF0ZSBtb2R1bGUgcmVxdWVzdCBcIiR7dGFyZ2V0UGF0aH1cIiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYHRvIFwiJHthbHRlcm5hdGVUYXJnZXRQYXRofVwiLmBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VbdGFyZ2V0TmFtZV0gPSBhbHRlcm5hdGVUYXJnZXRQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWR1bmRhbnRSZXF1ZXN0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBhbHRlcm5hdGVUYXJnZXRQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiBhbHRlcm5hdGVQYWNrYWdlRGVzY3JpcHRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmZpZ3VyYXRpb24udmVyc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmVkdW5kYW50UmVxdWVzdClcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0luY2x1ZGluZyBkaWZmZXJlbnQgdmVyc2lvbnMgb2Ygc2FtZSBwYWNrYWdlIFwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtwYWNrYWdlRGVzY3JpcHRvci5jb25maWd1cmF0aW9uLm5hbWV9XCIuIE1vZHVsZSBcImAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGFyZ2V0UGF0aH1cIiAodmVyc2lvbiBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3BhY2thZ2VEZXNjcmlwdG9yLmNvbmZpZ3VyYXRpb24udmVyc2lvbn0pIGhhcyBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGByZWR1bmRhbmNpZXMgd2l0aCBcIiR7cmVkdW5kYW50UmVxdWVzdC5wYXRofVwiIChgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGB2ZXJzaW9uICR7cmVkdW5kYW50UmVxdWVzdC52ZXJzaW9ufSkuYFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4pKVxuLy8gLy8gZW5kcmVnaW9uXG4vLyAvIGVuZHJlZ2lvblxuLy8gLyByZWdpb24gbG9hZGVyIGhlbHBlclxuY29uc3QgaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzOkZ1bmN0aW9uID0gKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgZmlsZVBhdGggPSBIZWxwZXIuc3RyaXBMb2FkZXIoZmlsZVBhdGgpXG4gICAgcmV0dXJuIEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aClcbiAgICAgICAgKVxuICAgIClcbn1cbmNvbnN0IGV2YWx1YXRlTG9hZGVyQ29uZmlndXJhdGlvbjpGdW5jdGlvbiA9IChcbiAgICBsb2FkZXJDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0XG4pOlBsYWluT2JqZWN0ID0+ICh7XG4gICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiBldmFsdWF0ZShcbiAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi5leGNsdWRlIHx8ICdmYWxzZScsIGZpbGVQYXRoKSxcbiAgICBpbmNsdWRlOlxuICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUgJiZcbiAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICBsb2FkZXJDb25maWd1cmF0aW9uLmluY2x1ZGUsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0KSB8fFxuICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmJhc2UsXG4gICAgdGVzdDogbmV3IFJlZ0V4cChldmFsdWF0ZShcbiAgICAgICAgbG9hZGVyQ29uZmlndXJhdGlvbi50ZXN0LCBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCkpLFxuICAgIHVzZTogZXZhbHVhdGUobG9hZGVyQ29uZmlndXJhdGlvbi51c2UpXG59KVxuY29uc3QgbG9hZGVyOlJlY29yZDxzdHJpbmcsIGFueT4gPSB7fVxuY29uc3Qgc2NvcGU6UmVjb3JkPHN0cmluZywgYW55PiA9IHtcbiAgICBjb25maWd1cmF0aW9uLFxuICAgIGlzRmlsZVBhdGhJbkRlcGVuZGVuY2llcyxcbiAgICBsb2FkZXIsXG4gICAgcmVxdWlyZTogZXZhbCgncmVxdWlyZScpXG59XG5jb25zdCBldmFsdWF0ZTpGdW5jdGlvbiA9IChjb2RlOnN0cmluZywgZmlsZVBhdGg6c3RyaW5nKTphbnkgPT5cbiAgICAobmV3IEZ1bmN0aW9uKCdmaWxlUGF0aCcsIC4uLk9iamVjdC5rZXlzKHNjb3BlKSwgYHJldHVybiAke2NvZGV9YCkpKFxuICAgICAgICBmaWxlUGF0aCwgLi4uT2JqZWN0LnZhbHVlcyhzY29wZSlcbiAgICApXG5jb25zdCBpbmNsdWRpbmdQYXRoczpBcnJheTxzdHJpbmc+ID1cbiAgICBIZWxwZXIubm9ybWFsaXplUGF0aHMoW2NvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuamF2YVNjcmlwdF0uY29uY2F0KFxuICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5sb2NhdGlvbnMuZGlyZWN0b3J5UGF0aHNcbiAgICApKVxuVG9vbHMuZXh0ZW5kKGxvYWRlciwge1xuICAgIC8vIENvbnZlcnQgdG8gY29tcGF0aWJsZSBuYXRpdmUgd2ViIHR5cGVzLlxuICAgIC8vIHJlZ2lvbiBnZW5lcmljIHRlbXBsYXRlXG4gICAgZWpzOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MXG4gICAgICAgICAgICApLm1hcCgoaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24pOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICApLmluY2x1ZGVzKGZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgKGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5lanMuZXhjbHVkZSA9PT0gbnVsbCkgP1xuICAgICAgICAgICAgICAgIGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgIGluY2x1ZGU6IGluY2x1ZGluZ1BhdGhzLFxuICAgICAgICB0ZXN0OiAvXig/IS4rXFwuaHRtbFxcLmVqcyQpLitcXC5lanMkL2ksXG4gICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmVqcy5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2FkZXI6ICdmaWxlP25hbWU9W3BhdGhdW25hbWVdJyArXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLm9wdGlvbnMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tcGlsZVN0ZXBzOiAyfVxuICAgICAgICAgICAgICAgICAgICAgICAgKS5jb21waWxlU3RlcHMgJSAyID8gJy5qcycgOiAnJ1xuICAgICAgICAgICAgICAgICAgICApICtcbiAgICAgICAgICAgICAgICAgICAgYD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdYFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtsb2FkZXI6ICdleHRyYWN0J30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuZWpzLmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIHNjcmlwdFxuICAgIHNjcmlwdDoge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IGV2YWx1YXRlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuZXhjbHVkZSwgZmlsZVBhdGhcbiAgICAgICAgKSxcbiAgICAgICAgaW5jbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6YW55ID0gZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuaW5jbHVkZSwgZmlsZVBhdGgpXG4gICAgICAgICAgICBpZiAoW251bGwsIHVuZGVmaW5lZF0uaW5jbHVkZXMocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaW5jbHVkZVBhdGggb2YgaW5jbHVkaW5nUGF0aHMpXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aC5zdGFydHNXaXRoKGluY2x1ZGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQm9vbGVhbihyZXN1bHQpXG4gICAgICAgIH0sXG4gICAgICAgIHRlc3Q6IG5ldyBSZWdFeHAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5yZWd1bGFyRXhwcmVzc2lvbiwgJ2knXG4gICAgICAgICksXG4gICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQuYWRkaXRpb25hbC5wcmUubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuamF2YVNjcmlwdC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmphdmFTY3JpcHQub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5qYXZhU2NyaXB0LmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGh0bWwgdGVtcGxhdGVcbiAgICBodG1sOiB7XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgb25seSBmb3IgdGhlIG1haW4gZW50cnkgdGVtcGxhdGUuXG4gICAgICAgIG1haW46IHtcbiAgICAgICAgICAgIHRlc3Q6IG5ldyBSZWdFeHAoJ14nICsgVG9vbHMuc3RyaW5nRXNjYXBlUmVndWxhckV4cHJlc3Npb25zKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUwudGVtcGxhdGUuZmlsZVBhdGhcbiAgICAgICAgICAgICkgKyAnKD86XFxcXD8uKik/JCcpLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLmZpbGVzLmRlZmF1bHRIVE1MLnRlbXBsYXRlLnVzZVxuICAgICAgICB9LFxuICAgICAgICBlanM6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gSGVscGVyLm5vcm1hbGl6ZVBhdGhzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuaHRtbC5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAgICAgICAgICAgICApLm1hcCgoaHRtbENvbmZpZ3VyYXRpb246SFRNTENvbmZpZ3VyYXRpb24pOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICBodG1sQ29uZmlndXJhdGlvbi50ZW1wbGF0ZS5maWxlUGF0aClcbiAgICAgICAgICAgICkuaW5jbHVkZXMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAgICAgKChjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5leGNsdWRlID09PSBudWxsKSA/XG4gICAgICAgICAgICAgICAgICAgIGZhbHNlIDogZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5leGNsdWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgpKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQudGVtcGxhdGUsXG4gICAgICAgICAgICB0ZXN0OiAvXFwuaHRtbFxcLmVqcyg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6XG4gICAgICAgICAgICAgICAgICAgICAgICAnZmlsZT9uYW1lPScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVsYXRpdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5hc3NldC50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tuYW1lXScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmh0bWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub3B0aW9ucyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbXBpbGVTdGVwczogMn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5jb21waWxlU3RlcHMgJSAyID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcuanMnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYD8ke2NvbmZpZ3VyYXRpb24uaGFzaEFsZ29yaXRobX09W2hhc2hdYFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuaHRtbC5vcHRpb25zIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y29tcGlsZVN0ZXBzOiAyfVxuICAgICAgICAgICAgICAgICAgICApLmNvbXBpbGVTdGVwcyAlIDIgP1xuICAgICAgICAgICAgICAgICAgICAgICAgW10gOlxuICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsb2FkZXI6ICdleHRyYWN0J30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnByZXByb2Nlc3Nvci5odG1sLmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgaHRtbDoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgIEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5odG1sLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuZGVmYXVsdEhUTUxcbiAgICAgICAgICAgICAgICAgICAgKS5tYXAoKGh0bWxDb25maWd1cmF0aW9uOkhUTUxDb25maWd1cmF0aW9uKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb25maWd1cmF0aW9uLnRlbXBsYXRlLmZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICkuaW5jbHVkZXMoZmlsZVBhdGgpIHx8XG4gICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAoY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5leGNsdWRlID09PSBudWxsKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2YWx1YXRlKGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuZXhjbHVkZSwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIGluY2x1ZGU6IGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQudGVtcGxhdGUsXG4gICAgICAgICAgICB0ZXN0OiAvXFwuaHRtbCg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmh0bWwuYWRkaXRpb25hbC5wcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOlxuICAgICAgICAgICAgICAgICAgICAgICAgICdmaWxlP25hbWU9JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmFzc2V0LnRlbXBsYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgW25hbWVdLltleHRdPyR7Y29uZmlndXJhdGlvbi5oYXNoQWxnb3JpdGhtfT1baGFzaF1gXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7bG9hZGVyOiAnZXh0cmFjdCd9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUuaHRtbC5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5odG1sLmFkZGl0aW9uYWwucG9zdC5tYXAoZXZhbHVhdGUpXG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIExvYWQgZGVwZW5kZW5jaWVzLlxuICAgIC8vIHJlZ2lvbiBzdHlsZVxuICAgIHN0eWxlOiB7XG4gICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5leGNsdWRlID09PSBudWxsXG4gICAgICAgICkgPyBpc0ZpbGVQYXRoSW5EZXBlbmRlbmNpZXMoZmlsZVBhdGgpIDpcbiAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmNhc2NhZGluZ1N0eWxlU2hlZXQuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICBpbmNsdWRlOiBpbmNsdWRpbmdQYXRocyxcbiAgICAgICAgdGVzdDogL1xcLnM/Y3NzKD86XFw/LiopPyQvaSxcbiAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3IuY2FzY2FkaW5nU3R5bGVTaGVldC5hZGRpdGlvbmFsXG4gICAgICAgICAgICAucHJlLmNvbmNhdChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuc3R5bGUubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5zdHlsZS5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUuY2FzY2FkaW5nU3R5bGVTaGVldC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5jYXNjYWRpbmdTdHlsZVNoZWV0Lm9wdGlvbnMgfHwge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBUb29scy5leHRlbmQodHJ1ZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRlbnQ6ICdwb3N0Y3NzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsdWdpbnM6ICgpOkFycmF5PFJlY29yZDxzdHJpbmcsIGFueT4+ID0+IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzSW1wb3J0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkRGVwZW5kZW5jeVRvOiB3ZWJwYWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQuYWRkaXRpb25hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGx1Z2lucy5wcmUubWFwKGV2YWx1YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzUHJlc2V0RU5WKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYXNjYWRpbmdTdHlsZVNoZWV0LnBvc3Rjc3NQcmVzZXRFbnYpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IENoZWNraW5nIHBhdGggZG9lc24ndCB3b3JrIGlmIGZvbnRzIGFyZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWZlcmVuY2VkIGluIGxpYnJhcmllcyBwcm92aWRlZCBpbiBhbm90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uIHRoYW4gdGhlIHByb2plY3QgaXRzZWxmIGxpa2UgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibm9kZV9tb2R1bGVzXCIgZm9sZGVyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zdGNzc0ZvbnRQYXRoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tQYXRoOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3R5cGU6ICd3b2ZmMicsIGV4dDogJ3dvZmYyJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dHlwZTogJ3dvZmYnLCBleHQ6ICd3b2ZmJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3Rjc3NVUkwoe3VybDogJ3JlYmFzZSd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzU3ByaXRlcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckJ5OiAoKTpQcm9taXNlPG51bGw+ID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOlByb21pc2U8bnVsbD4gPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuY29tcG9zZS5pbWFnZSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUgOiByZWplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvb2tzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNhdmVTcHJpdGVzaGVldDogKGltYWdlOlJlY29yZDxzdHJpbmcsIGFueT4pOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3ByaXRlUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYXNzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW1hZ2UpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXNoZWV0UGF0aDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2FzY2FkaW5nU3R5bGVTaGVldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ByaXRlUGF0aDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5wcmVwcm9jZXNzb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhc2NhZGluZ1N0eWxlU2hlZXQuYWRkaXRpb25hbC5wbHVnaW5zLnBvc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChldmFsdWF0ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmNzc25hbm8gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0Y3NzQ1NTbmFubyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5jc3NuYW5vXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBbXSlcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vcHRpb25zIHx8IHt9KVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucHJlcHJvY2Vzc29yLmNhc2NhZGluZ1N0eWxlU2hlZXRcbiAgICAgICAgICAgICAgICAgICAgLmFkZGl0aW9uYWwucG9zdC5tYXAoZXZhbHVhdGUpKVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gT3B0aW1pemUgbG9hZGVkIGFzc2V0cy5cbiAgICAvLyByZWdpb24gZm9udFxuICAgIGZvbnQ6IHtcbiAgICAgICAgZW90OiB7XG4gICAgICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICAgICAgKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICBldmFsdWF0ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmV4Y2x1ZGUsIGZpbGVQYXRoKSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC5lb3QoPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QuYWRkaXRpb25hbC5wcmUubWFwKFxuICAgICAgICAgICAgICAgIGV2YWx1YXRlXG4gICAgICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90LmxvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQuZW90Lm9wdGlvbnMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5lb3QuYWRkaXRpb25hbC5wb3N0Lm1hcChcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGUpKVxuICAgICAgICB9LFxuICAgICAgICBzdmc6IHtcbiAgICAgICAgICAgIGV4Y2x1ZGU6IChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT4gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICAgICAgdGVzdDogL1xcLnN2Zyg/OlxcPy4qKT8kL2ksXG4gICAgICAgICAgICB1c2U6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC5zdmcub3B0aW9ucyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAge31cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnN2Zy5hZGRpdGlvbmFsLnBvc3QubWFwKFxuICAgICAgICAgICAgICAgICAgICBldmFsdWF0ZSkpXG4gICAgICAgIH0sXG4gICAgICAgIHR0Zjoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmV4Y2x1ZGUgPT09IG51bGxcbiAgICAgICAgICAgICkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5leGNsdWRlLCBmaWxlUGF0aCksXG4gICAgICAgICAgICB0ZXN0OiAvXFwudHRmKD86XFw/LiopPyQvaSxcbiAgICAgICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5sb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LnR0Zi5vcHRpb25zIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICB7fVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQudHRmLmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfSxcbiAgICAgICAgd29mZjoge1xuICAgICAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gZmFsc2UgOlxuICAgICAgICAgICAgICAgIGV2YWx1YXRlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmV4Y2x1ZGUsIGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIHRlc3Q6IC9cXC53b2ZmMj8oPzpcXD8uKik/JC9pLFxuICAgICAgICAgICAgdXNlOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgICAgICBldmFsdWF0ZVxuICAgICAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5mb250LndvZmYubG9hZGVyLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmZvbnQud29mZi5vcHRpb25zIHx8IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZm9udC53b2ZmLmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgICAgIGV2YWx1YXRlKSlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGltYWdlXG4gICAgaW1hZ2U6IHtcbiAgICAgICAgZXhjbHVkZTogKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PiAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuZXhjbHVkZSA9PT0gbnVsbFxuICAgICAgICApID8gaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICBldmFsdWF0ZShjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuZXhjbHVkZSwgZmlsZVBhdGgpLFxuICAgICAgICBpbmNsdWRlOiBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmltYWdlLFxuICAgICAgICB0ZXN0OiAvXFwuKD86cG5nfGpwZ3xpY298Z2lmKSg/OlxcPy4qKT8kL2ksXG4gICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmFkZGl0aW9uYWwucHJlLm1hcChcbiAgICAgICAgICAgIGV2YWx1YXRlXG4gICAgICAgICkuY29uY2F0KFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvYWRlcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmltYWdlLmxvYWRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuaW1hZ2UuZmlsZSB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5pbWFnZS5hZGRpdGlvbmFsLnBvc3QubWFwKGV2YWx1YXRlKSlcbiAgICB9LFxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBkYXRhXG4gICAgZGF0YToge1xuICAgICAgICBleGNsdWRlOiAoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZS5pbnRlcm5hbC5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBwYXRoLmV4dG5hbWUoSGVscGVyLnN0cmlwTG9hZGVyKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICkgfHwgKChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5leGNsdWRlID09PSBudWxsXG4gICAgICAgICAgICApID8gaXNGaWxlUGF0aEluRGVwZW5kZW5jaWVzKGZpbGVQYXRoKSA6XG4gICAgICAgICAgICAgICAgZXZhbHVhdGUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmV4Y2x1ZGUsIGZpbGVQYXRoKSksXG4gICAgICAgIHRlc3Q6IC8uKy8sXG4gICAgICAgIHVzZTogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEuYWRkaXRpb25hbC5wcmUubWFwKFxuICAgICAgICAgICAgZXZhbHVhdGVcbiAgICAgICAgKS5jb25jYXQoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9hZGVyOiBjb25maWd1cmF0aW9uLm1vZHVsZS5vcHRpbWl6ZXIuZGF0YS5sb2FkZXIsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLmRhdGEub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5kYXRhLmFkZGl0aW9uYWwucG9zdC5tYXAoZXZhbHVhdGUpKVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbn0pXG5pZiAoXG4gICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmNhc2NhZGluZ1N0eWxlU2hlZXQgJiYgcGx1Z2lucy5NaW5pQ1NTRXh0cmFjdFxuKSB7XG4gICAgLypcbiAgICAgICAgTk9URTogV2UgaGF2ZSB0byByZW1vdmUgdGhlIGNsaWVudCBzaWRlIGphdmFzY3JpcHQgaG1yIHN0eWxlIGxvYWRlclxuICAgICAgICBmaXJzdC5cbiAgICAqL1xuICAgIGxvYWRlci5zdHlsZS51c2Uuc2hpZnQoKVxuICAgIGxvYWRlci5zdHlsZS51c2UudW5zaGlmdChwbHVnaW5zLk1pbmlDU1NFeHRyYWN0LmxvYWRlcilcbn1cbi8vIC8gZW5kcmVnaW9uXG4vLyBlbmRyZWdpb25cbmZvciAoY29uc3QgcGx1Z2luQ29uZmlndXJhdGlvbiBvZiBjb25maWd1cmF0aW9uLnBsdWdpbnMpXG4gICAgcGx1Z2luSW5zdGFuY2VzLnB1c2gobmV3IChldmFsKCdyZXF1aXJlJykocGx1Z2luQ29uZmlndXJhdGlvbi5uYW1lLm1vZHVsZSlbXG4gICAgICAgIHBsdWdpbkNvbmZpZ3VyYXRpb24ubmFtZS5pbml0aWFsaXplclxuICAgIF0pKC4uLnBsdWdpbkNvbmZpZ3VyYXRpb24ucGFyYW1ldGVyKSlcbi8vIHJlZ2lvbiBjb25maWd1cmF0aW9uXG5sZXQgY3VzdG9tQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHt9XG5pZiAoY29uZmlndXJhdGlvbi5wYXRoLmNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5wYXRoLmNvbmZpZ3VyYXRpb24uanNvbilcbiAgICB0cnkge1xuICAgICAgICBjdXN0b21Db25maWd1cmF0aW9uID0gcmVxdWlyZShjb25maWd1cmF0aW9uLnBhdGguY29uZmlndXJhdGlvbi5qc29uKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuZXhwb3J0IGNvbnN0IHdlYnBhY2tDb25maWd1cmF0aW9uOldlYnBhY2tDb25maWd1cmF0aW9uID0gVG9vbHMuZXh0ZW5kKFxuICAgIHRydWUsXG4gICAge1xuICAgICAgICBiYWlsOiB0cnVlLFxuICAgICAgICBjYWNoZTogY29uZmlndXJhdGlvbi5jYWNoZS5tYWluLFxuICAgICAgICBjb250ZXh0OiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgZGV2dG9vbDogY29uZmlndXJhdGlvbi5kZXZlbG9wbWVudC50b29sLFxuICAgICAgICBkZXZTZXJ2ZXI6IGNvbmZpZ3VyYXRpb24uZGV2ZWxvcG1lbnQuc2VydmVyLFxuICAgICAgICAvLyByZWdpb24gaW5wdXRcbiAgICAgICAgZW50cnk6IGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWQsXG4gICAgICAgIGV4dGVybmFsczogY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZXh0ZXJuYWwubW9kdWxlcyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgYWxpYXM6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICBhbGlhc0ZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLFxuICAgICAgICAgICAgbWFpbkZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIG1haW5GaWxlczogY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgbW9kdWxlRXh0ZW5zaW9uczogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLm1vZHVsZSxcbiAgICAgICAgICAgIG1vZHVsZXM6IEhlbHBlci5ub3JtYWxpemVQYXRocyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyksXG4gICAgICAgICAgICBzeW1saW5rczogZmFsc2UsXG4gICAgICAgICAgICB1bnNhZmVDYWNoZTogY29uZmlndXJhdGlvbi5jYWNoZS51bnNhZmVcbiAgICAgICAgfSxcbiAgICAgICAgcmVzb2x2ZUxvYWRlcjoge1xuICAgICAgICAgICAgYWxpYXM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmFsaWFzZXMsXG4gICAgICAgICAgICBhbGlhc0ZpZWxkczogY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMuZmlsZSxcbiAgICAgICAgICAgIG1haW5GaWVsZHM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLnByb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICBtYWluRmlsZXM6IGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgIG1vZHVsZUV4dGVuc2lvbnM6IGNvbmZpZ3VyYXRpb24ubG9hZGVyLmV4dGVuc2lvbnMubW9kdWxlLFxuICAgICAgICAgICAgbW9kdWxlczogY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICBzeW1saW5rczogZmFsc2VcbiAgICAgICAgfSxcbiAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIC8vIHJlZ2lvbiBvdXRwdXRcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICBmaWxlbmFtZTogcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQpLFxuICAgICAgICAgICAgaGFzaEZ1bmN0aW9uOiBjb25maWd1cmF0aW9uLmhhc2hBbGdvcml0aG0sXG4gICAgICAgICAgICBsaWJyYXJ5OiBsaWJyYXJ5TmFtZSxcbiAgICAgICAgICAgIGxpYnJhcnlUYXJnZXQ6IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdidWlsZDpkbGwnXG4gICAgICAgICAgICApID8gJ3ZhcicgOiBjb25maWd1cmF0aW9uLmV4cG9ydEZvcm1hdC5zZWxmLFxuICAgICAgICAgICAgcGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgcHVibGljUGF0aDogY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5wdWJsaWMsXG4gICAgICAgICAgICB1bWROYW1lZERlZmluZTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBwZXJmb3JtYW5jZTogY29uZmlndXJhdGlvbi5wZXJmb3JtYW5jZUhpbnRzLFxuICAgICAgICB0YXJnZXQ6IGNvbmZpZ3VyYXRpb24udGFyZ2V0VGVjaG5vbG9neSxcbiAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIG1vZGU6IGNvbmZpZ3VyYXRpb24uZGVidWcgPyAnZGV2ZWxvcG1lbnQnIDogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICBtb2R1bGU6IHtcbiAgICAgICAgICAgIHJ1bGVzOiBjb25maWd1cmF0aW9uLm1vZHVsZS5hZGRpdGlvbmFsLnByZS5tYXAoXG4gICAgICAgICAgICAgICAgZXZhbHVhdGVMb2FkZXJDb25maWd1cmF0aW9uXG4gICAgICAgICAgICApLmNvbmNhdChcbiAgICAgICAgICAgICAgICBsb2FkZXIuZWpzLFxuICAgICAgICAgICAgICAgIGxvYWRlci5zY3JpcHQsXG4gICAgICAgICAgICAgICAgbG9hZGVyLmh0bWwubWFpbiwgbG9hZGVyLmh0bWwuZWpzLCBsb2FkZXIuaHRtbC5odG1sLFxuICAgICAgICAgICAgICAgIGxvYWRlci5zdHlsZSxcbiAgICAgICAgICAgICAgICBsb2FkZXIuZm9udC5lb3QsIGxvYWRlci5mb250LnN2ZywgbG9hZGVyLmZvbnQudHRmLFxuICAgICAgICAgICAgICAgIGxvYWRlci5mb250LndvZmYsXG4gICAgICAgICAgICAgICAgbG9hZGVyLmltYWdlLFxuICAgICAgICAgICAgICAgIGxvYWRlci5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFkZGl0aW9uYWwucG9zdC5tYXAoXG4gICAgICAgICAgICAgICAgICAgIGV2YWx1YXRlTG9hZGVyQ29uZmlndXJhdGlvbilcbiAgICAgICAgICAgIClcbiAgICAgICAgfSxcbiAgICAgICAgbm9kZTogY29uZmlndXJhdGlvbi5ub2RlRW52aXJvbm1lbnQsXG4gICAgICAgIG9wdGltaXphdGlvbjoge1xuICAgICAgICAgICAgbWluaW1pemU6IGNvbmZpZ3VyYXRpb24ubW9kdWxlLm9wdGltaXplci5taW5pbWl6ZSxcbiAgICAgICAgICAgIG1pbmltaXplcjogY29uZmlndXJhdGlvbi5tb2R1bGUub3B0aW1pemVyLm1pbmltaXplcixcbiAgICAgICAgICAgIC8vIHJlZ2lvbiBjb21tb24gY2h1bmtzXG4gICAgICAgICAgICBzcGxpdENodW5rczogKFxuICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLmluamVjdGlvbi5jaHVua3MgfHxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnRhcmdldFRlY2hub2xvZ3kgIT09ICd3ZWInIHx8XG4gICAgICAgICAgICAgICAgWydidWlsZDpkbGwnLCAndGVzdCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApID9cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlR3JvdXBzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbmRvcnM6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IDogVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua3M6ICdhbGwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVHcm91cHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZW5kb3JzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rczogKG1vZHVsZTpSZWNvcmQ8c3RyaW5nLCBhbnk+KTpib29sZWFuID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlndXJhdGlvbi5pblBsYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qYXZhU2NyaXB0ID09PVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pblBsYWNlLmphdmFTY3JpcHQgIT09XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgT2JqZWN0LmtleXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5QbGFjZS5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gJyonIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lID09PSBtb2R1bGUubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiAtMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldXNlRXhpc3RpbmdDaHVuazogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdDogL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uY2h1bmtzXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIH0sXG4gICAgICAgIHBsdWdpbnM6IHBsdWdpbkluc3RhbmNlc1xuICAgIH0sXG4gICAgY29uZmlndXJhdGlvbi53ZWJwYWNrLFxuICAgIGN1c3RvbUNvbmZpZ3VyYXRpb25cbilcbmlmIChcbiAgICAhQXJyYXkuaXNBcnJheShjb25maWd1cmF0aW9uLm1vZHVsZS5za2lwUGFyc2VSZWd1bGFyRXhwcmVzc2lvbnMpIHx8XG4gICAgY29uZmlndXJhdGlvbi5tb2R1bGUuc2tpcFBhcnNlUmVndWxhckV4cHJlc3Npb25zLmxlbmd0aFxuKVxuICAgIHdlYnBhY2tDb25maWd1cmF0aW9uLm1vZHVsZS5ub1BhcnNlID1cbiAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuc2tpcFBhcnNlUmVndWxhckV4cHJlc3Npb25zXG5pZiAoXG4gICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbmZpZ3VyYXRpb24gJiZcbiAgICBjb25maWd1cmF0aW9uLnBhdGguY29uZmlndXJhdGlvbi5qYXZhU2NyaXB0XG4pIHtcbiAgICBsZXQgcmVzdWx0OlJlY29yZDxzdHJpbmcsIGFueT5cbiAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSByZXF1aXJlKGNvbmZpZ3VyYXRpb24ucGF0aC5jb25maWd1cmF0aW9uLmphdmFTY3JpcHQpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgaWYgKHJlc3VsdClcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChcbiAgICAgICAgICAgIHJlc3VsdCwgJ3JlcGxhY2VXZWJPcHRpbWl6ZXInXG4gICAgICAgICkpXG4gICAgICAgICAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbiA9IHdlYnBhY2tDb25maWd1cmF0aW9uLnJlcGxhY2VXZWJPcHRpbWl6ZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgVG9vbHMuZXh0ZW5kKHRydWUsIHdlYnBhY2tDb25maWd1cmF0aW9uLCByZXN1bHQpXG59XG5pZiAoY29uZmlndXJhdGlvbi5zaG93Q29uZmlndXJhdGlvbikge1xuICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgJ1VzaW5nIGludGVybmFsIGNvbmZpZ3VyYXRpb246JyxcbiAgICAgICAgdXRpbC5pbnNwZWN0KGNvbmZpZ3VyYXRpb24sIHtkZXB0aDogbnVsbH0pXG4gICAgKVxuICAgIGNvbnNvbGUuaW5mbygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKVxuICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgJ1VzaW5nIHdlYnBhY2sgY29uZmlndXJhdGlvbjonLFxuICAgICAgICB1dGlsLmluc3BlY3Qod2VicGFja0NvbmZpZ3VyYXRpb24sIHtkZXB0aDogbnVsbH0pXG4gICAgKVxufVxuLy8gZW5kcmVnaW9uXG5leHBvcnQgZGVmYXVsdCB3ZWJwYWNrQ29uZmlndXJhdGlvblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=