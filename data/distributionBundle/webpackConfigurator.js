// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module webpackConfigurator */
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
exports.webpackConfiguration = exports.optionalRequire = exports["default"] = void 0;
var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _clientnode = _interopRequireDefault(require("clientnode"));
var _jsdom = require("jsdom");
var _path = require("path");
var _util = _interopRequireDefault(require("util"));
var _webpack = require("webpack");
var _webpackSources = require("webpack-sources");
var _configurator = _interopRequireDefault(require("./configurator"));
var _helper = _interopRequireDefault(require("./helper"));
var _ejsLoader = _interopRequireDefault(require("./ejsLoader"));
var _optionalRequire,
  _this = void 0,
  _configuration$path$c,
  _configuration$cache,
  _configuration$cache2,
  _configuration$path$c2;
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
/// region optional imports
// NOTE: Has to be defined here to ensure to resolve from here.
var currentRequire =
/*
    typeof __non_webpack_require__ === 'function' ?
        __non_webpack_require__ :
*/
eval("typeof require === 'undefined' ? null : require");
var optionalRequire = function optionalRequire(id) {
  try {
    return currentRequire ? currentRequire(id) : null;
  } catch (error) {
    return null;
  }
};
exports.optionalRequire = optionalRequire;
var postcssCSSnano = optionalRequire('cssnano');
var postcssFontpath = optionalRequire('postcss-fontpath');
var postcssImport = optionalRequire('postcss-import');
var postcssSprites = optionalRequire('postcss-sprites');
var updateRule = (_optionalRequire = optionalRequire('postcss-sprites/lib/core')) === null || _optionalRequire === void 0 ? void 0 : _optionalRequire.updateRule;
var postcssURL = optionalRequire('postcss-url');
/// endregion
var pluginNameResourceMapping = {
  HTML: 'html-webpack-plugin',
  MiniCSSExtract: 'mini-css-extract-plugin',
  Favicon: 'favicons-webpack-plugin',
  ImageMinimizer: 'image-minimizer-webpack-plugin',
  Offline: 'workbox-webpack-plugin',
  Terser: 'terser-webpack-plugin'
};
var plugins = {};
for (var _i = 0, _Object$entries = Object.entries(pluginNameResourceMapping); _i < _Object$entries.length; _i++) {
  var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
    name = _Object$entries$_i[0],
    alias = _Object$entries$_i[1];
  var plugin = optionalRequire(alias);
  if (plugin) plugins[name] = plugin;else console.debug("Optional webpack plugin \"".concat(name, "\" not available."));
}
if (plugins.Offline) {
  plugins.GenerateServiceWorker = plugins.Offline.GenerateSW;
  plugins.InjectManifest = plugins.Offline.InjectManifest;
}
// endregion
var configuration = (0, _configurator["default"])();
var _module = configuration.module;
// region initialisation
/// region determine library name
var libraryName;
if (configuration.libraryName) libraryName = configuration.libraryName;else if (Object.keys(configuration.injection.entry.normalized).length > 1) libraryName = '[name]';else {
  libraryName = configuration.name;
  if (['assign', 'global', 'this', 'var', 'window'].includes(configuration.exportFormat.self)) libraryName = _clientnode["default"].stringConvertToValidVariableName(libraryName);
}
if (libraryName === '*') libraryName = ['assign', 'global', 'this', 'var', 'window'].includes(configuration.exportFormat.self) ? Object.keys(configuration.injection.entry.normalized).map(function (name) {
  return _clientnode["default"].stringConvertToValidVariableName(name);
}) : undefined;
/// endregion
/// region plugins
var pluginInstances = [];
//// region define modules to ignore
var _iterator = _createForOfIteratorHelper([].concat(configuration.injection.ignorePattern)),
  _step;
try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var pattern = _step.value;
    if (typeof pattern.contextRegExp === 'string') pattern.contextRegExp = new RegExp(pattern.contextRegExp);
    if (typeof pattern.resourceRegExp === 'string') pattern.resourceRegExp = new RegExp(pattern.resourceRegExp);
    pluginInstances.push(new _webpack.IgnorePlugin(pattern));
  }
  //// endregion
  //// region define modules to replace
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}
var _loop = function _loop() {
  var _Object$entries2$_i = (0, _slicedToArray2["default"])(_Object$entries2[_i2], 2),
    source = _Object$entries2$_i[0],
    replacement = _Object$entries2$_i[1];
  var search = new RegExp(source);
  pluginInstances.push(new _webpack.NormalModuleReplacementPlugin(search, function (resource) {
    resource.request = resource.request.replace(search, replacement);
  }));
};
for (var _i2 = 0, _Object$entries2 = Object.entries(_module.replacements.normal); _i2 < _Object$entries2.length; _i2++) {
  _loop();
}
//// endregion
//// region generate html file
var htmlAvailable = false;
var _iterator2 = _createForOfIteratorHelper(configuration.files.html),
  _step2;
try {
  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
    var htmlConfiguration = _step2.value;
    if (_clientnode["default"].isFileSync(htmlConfiguration.template.filePath)) {
      pluginInstances.push(new plugins.HTML(_objectSpread(_objectSpread({}, htmlConfiguration), {}, {
        template: htmlConfiguration.template.request
      })));
      htmlAvailable = true;
    }
  }
  //// endregion
  //// region generate favicons
} catch (err) {
  _iterator2.e(err);
} finally {
  _iterator2.f();
}
if (htmlAvailable && configuration.favicon && plugins.Favicon && _clientnode["default"].isFileSync(configuration.favicon.logo)) pluginInstances.push(new plugins.Favicon(configuration.favicon));
//// endregion
//// region provide offline functionality
if (htmlAvailable && configuration.offline && plugins.Offline) {
  if (!['serve', 'test:browser'].includes(configuration.givenCommandLineArguments[2])) for (var _i3 = 0, _Object$entries3 = Object.entries({
      cascadingStyleSheet: 'css',
      javaScript: 'js'
    }); _i3 < _Object$entries3.length; _i3++) {
    var _Object$entries3$_i = (0, _slicedToArray2["default"])(_Object$entries3[_i3], 2),
      _name = _Object$entries3$_i[0],
      extension = _Object$entries3$_i[1];
    var type = _name;
    if (configuration.inPlace[type]) {
      var matches = Object.keys(configuration.inPlace[type]);
      if (!Array.isArray(configuration.offline.common.excludeChunks)) configuration.offline.common.excludeChunks = [];
      for (var _i4 = 0, _matches = matches; _i4 < _matches.length; _i4++) {
        var _name2 = _matches[_i4];
        configuration.offline.common.excludeChunks.push((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset[type]) + "".concat(_name2, ".").concat(extension, "?").concat(configuration.hashAlgorithm, "=*"));
      }
    }
  }
  if ([].concat(configuration.offline.use).includes('injectionManifest')) pluginInstances.push(new plugins.InjectManifest(_clientnode["default"].extend(true, configuration.offline.common, configuration.offline.injectionManifest)));
  if ([].concat(configuration.offline.use).includes('generateServiceWorker')) pluginInstances.push(new plugins.GenerateServiceWorker(_clientnode["default"].extend(true, configuration.offline.common, configuration.offline.serviceWorker)));
}
//// endregion
//// region provide build environment
if (configuration.buildContext.definitions) pluginInstances.push(new _webpack.DefinePlugin(configuration.buildContext.definitions));
if (_module.provide) pluginInstances.push(new _webpack.ProvidePlugin(_module.provide));
//// endregion
//// region modules/assets
///// region apply module pattern
pluginInstances.push({
  apply: function apply(compiler) {
    compiler.hooks.emit.tap('applyModulePattern', function (compilation) {
      for (var _i5 = 0, _Object$entries4 = Object.entries(compilation.assets); _i5 < _Object$entries4.length; _i5++) {
        var _Object$entries4$_i = (0, _slicedToArray2["default"])(_Object$entries4[_i5], 2),
          request = _Object$entries4$_i[0],
          asset = _Object$entries4$_i[1];
        var filePath = request.replace(/\?[^?]+$/, '');
        var _type2 = _helper["default"].determineAssetType(filePath, configuration.buildContext.types, configuration.path);
        if (_type2 && configuration.assetPattern[_type2] && new RegExp(configuration.assetPattern[_type2].includeFilePathRegularExpression).test(filePath) && !new RegExp(configuration.assetPattern[_type2].excludeFilePathRegularExpression).test(filePath)) {
          var source = asset.source();
          if (typeof source === 'string') compilation.assets[request] = new _webpackSources.RawSource(configuration.assetPattern[_type2].pattern.replace(/\{1\}/g, source.replace(/\$/g, '$$$')));
        }
      }
    });
  }
});
///// endregion
///// region in-place configured assets in the main html file
/*
    TODO

    /
        NOTE: We have to translate template delimiter to html compatible
        sequences and translate it back later to avoid unexpected escape
        sequences in resulting html.
    /
    const window:DOMWindow = (new DOM(
        content
            .replace(/<%/g, '##+#+#+##')
            .replace(/%>/g, '##-#-#-##')
    )).window

    ->

    .replace(/##\+#\+#\+##/g, '<%')
    .replace(/##-#-#-##/g, '%>')
*/

if (htmlAvailable && !['serve', 'test:browser'].includes(configuration.givenCommandLineArguments[2]) && configuration.inPlace.cascadingStyleSheet && Object.keys(configuration.inPlace.cascadingStyleSheet).length || configuration.inPlace.javaScript && Object.keys(configuration.inPlace.javaScript).length) pluginInstances.push({
  apply: function apply(compiler) {
    var publicPath = compiler.options.output.publicPath || '';
    if (publicPath && !publicPath.endsWith('/')) publicPath += '/';
    compiler.hooks.compilation.tap('inPlaceHTMLAssets', function (compilation) {
      var hooks = plugins.HTML.getHooks(compilation);
      var inPlacedAssetNames = [];
      hooks.alterAssetTagGroups.tap('inPlaceHTMLAssets', function (assets) {
        var inPlace = function inPlace(type, tag) {
          var settings;
          var url = false;
          if (tag.tagName === 'script') {
            settings = configuration.inPlace.javaScript;
            url = tag.attributes.src;
          } else if (tag.tagName === 'style') {
            settings = configuration.inPlace.cascadingStyleSheet;
            url = tag.attributes.href;
          }
          if (!(url && typeof url === 'string')) return tag;
          var name = publicPath ? url.replace(publicPath, '') : url;
          if (compilation.assets[name] && settings[type] && [].concat(settings[type]).some(function (pattern) {
            return new RegExp(pattern).test(name);
          })) {
            var newAttributes = _objectSpread({}, tag.attributes);
            delete newAttributes.href;
            delete newAttributes.src;
            inPlacedAssetNames.push(name);
            return _objectSpread(_objectSpread({}, tag), {}, {
              attributes: newAttributes,
              innerHTML: compilation.assets[name].source(),
              tagName: 'script'
            });
          }
          return tag;
        };
        assets.headTags = assets.headTags.map(inPlace.bind(_this, 'head'));
        assets.bodyTags = assets.bodyTags.map(inPlace.bind(_this, 'body'));
        return assets;
      });

      // NOTE: Avoid if you still want to emit the runtime chunks:
      hooks.afterEmit.tap('inPlaceHTMLAssets', function (asset) {
        var _iterator3 = _createForOfIteratorHelper(inPlacedAssetNames),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _name3 = _step3.value;
            delete compilation.assets[_name3];
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        return asset;
      });
    });
  }
});
///// endregion
///// region mark empty javaScript modules as dummy
if (!(configuration.needed.javaScript || configuration.needed.javaScriptExtension || configuration.needed.typeScript || configuration.needed.typeScriptExtension)) configuration.files.compose.javaScript = (0, _path.resolve)(configuration.path.target.asset.javaScript, '.__dummy__.compiled.js');
///// endregion
///// region extract cascading style sheets
var cssOutputPath = configuration.files.compose.cascadingStyleSheet;
if (cssOutputPath && plugins.MiniCSSExtract) pluginInstances.push(new plugins.MiniCSSExtract({
  filename: typeof cssOutputPath === 'string' ? (0, _path.relative)(configuration.path.target.base, cssOutputPath) : cssOutputPath
}));
///// endregion
///// region performs implicit external logic
if (configuration.injection.external.modules === '__implicit__')
  /*
      We only want to process modules from local context in library mode,
      since a concrete project using this library should combine all assets
      (and de-duplicate them) for optimal bundling results.
      NOTE: Only native java script and json modules will be marked as
      external dependency.
  */
  configuration.injection.external.modules = function (_ref, callback) {
    var context = _ref.context,
      request = _ref.request;
    if (typeof request !== 'string') return callback();
    request = request.replace(/^!+/, '');
    if (request.startsWith('/')) request = (0, _path.relative)(configuration.path.context, request);
    var _iterator4 = _createForOfIteratorHelper(_module.directoryNames),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var _filePath = _step4.value;
        if (request.startsWith(_filePath)) {
          request = request.substring(_filePath.length);
          if (request.startsWith('/')) request = request.substring(1);
          break;
        }
      }
      // region pattern based aliasing
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
    var filePath = _helper["default"].determineModuleFilePath(request, {}, {}, {
      file: configuration.extensions.file.external
    }, configuration.path.context, context, configuration.path.ignore, _module.directoryNames, configuration["package"].main.fileNames, configuration["package"].main.propertyNames, configuration["package"].aliasPropertyNames, configuration.encoding);
    if (filePath) for (var _i6 = 0, _Object$entries5 = Object.entries(configuration.injection.external.aliases); _i6 < _Object$entries5.length; _i6++) {
      var _Object$entries5$_i = (0, _slicedToArray2["default"])(_Object$entries5[_i6], 2),
        pattern = _Object$entries5$_i[0],
        targetConfiguration = _Object$entries5$_i[1];
      if (pattern.startsWith('^')) {
        var regularExpression = new RegExp(pattern);
        if (regularExpression.test(filePath)) {
          var match = false;
          var firstKey = Object.keys(targetConfiguration)[0];
          var target = targetConfiguration[firstKey];
          if (typeof target !== 'string') break;
          var replacementRegularExpression = new RegExp(firstKey);
          if (target.startsWith('?')) {
            target = target.substring(1);
            var aliasedRequest = request.replace(replacementRegularExpression, target);
            if (aliasedRequest !== request) match = Boolean(_helper["default"].determineModuleFilePath(aliasedRequest, {}, {}, {
              file: configuration.extensions.file.external
            }, configuration.path.context, context, configuration.path.ignore, _module.directoryNames, configuration["package"].main.fileNames, configuration["package"].main.propertyNames, configuration["package"].aliasPropertyNames, configuration.encoding));
          } else match = true;
          if (match) {
            request = request.replace(replacementRegularExpression, target);
            break;
          }
        }
      }
    }
    // endregion
    var resolvedRequest = _helper["default"].determineExternalRequest(request, configuration.path.context, context, configuration.injection.entry.normalized, _module.directoryNames, _module.aliases, _module.replacements.normal, configuration.extensions, configuration.path.source.asset.base, configuration.path.ignore, _module.directoryNames, configuration["package"].main.fileNames, configuration["package"].main.propertyNames, configuration["package"].aliasPropertyNames, configuration.injection.external.implicit.pattern.include, configuration.injection.external.implicit.pattern.exclude, configuration.inPlace.externalLibrary.normal, configuration.inPlace.externalLibrary.dynamic, configuration.encoding);
    if (resolvedRequest) {
      var keys = ['amd', 'commonjs', 'commonjs2', 'root'];
      var result = resolvedRequest;
      if (Object.prototype.hasOwnProperty.call(configuration.injection.external.aliases, request)) {
        // region normal alias replacement
        result = {
          "default": request
        };
        if (typeof configuration.injection.external.aliases[request] === 'string') {
          var _iterator5 = _createForOfIteratorHelper(keys),
            _step5;
          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var key = _step5.value;
              result[key] = configuration.injection.external.aliases[request];
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
        } else if (typeof configuration.injection.external.aliases[request] === 'function') {
          var _iterator6 = _createForOfIteratorHelper(keys),
            _step6;
          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var _key2 = _step6.value;
              result[_key2] = configuration.injection.external.aliases[request](request, _key2);
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
        } else if (configuration.injection.external.aliases[request] !== null && (0, _typeof2["default"])(configuration.injection.external.aliases[request]) === 'object') _clientnode["default"].extend(result, configuration.injection.external.aliases[request]);
        if (Object.prototype.hasOwnProperty.call(result, 'default')) {
          var _iterator7 = _createForOfIteratorHelper(keys),
            _step7;
          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              var _key3 = _step7.value;
              if (!Object.prototype.hasOwnProperty.call(result, _key3)) result[_key3] = result["default"];
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
          }
        }
        // endregion
      }

      if (typeof result !== 'string' && Object.prototype.hasOwnProperty.call(result, 'root')) result.root = [].concat(result.root).map(function (name) {
        return _clientnode["default"].stringConvertToValidVariableName(name);
      });
      var exportFormat = configuration.exportFormat.external || configuration.exportFormat.self;
      return callback(undefined, exportFormat === 'umd' || typeof result === 'string' ? result : result[exportFormat], exportFormat);
    }
    return callback();
  };
///// endregion
//// endregion
//// region apply final cascadingStyleSheet/dom/javaScript modifications/fixes
if (htmlAvailable) pluginInstances.push({
  apply: function apply(compiler) {
    return compiler.hooks.compilation.tap('WebOptimizer', function (compilation) {
      plugins.HTML.getHooks(compilation).beforeEmit.tap('WebOptimizerPostProcessHTML', function (data) {
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
          return data;
        }
        var linkables = {
          link: 'href',
          script: 'src'
        };
        for (var _i7 = 0, _Object$entries6 = Object.entries(linkables); _i7 < _Object$entries6.length; _i7++) {
          var _Object$entries6$_i = (0, _slicedToArray2["default"])(_Object$entries6[_i7], 2),
            tagName = _Object$entries6$_i[0],
            attributeName = _Object$entries6$_i[1];
          for (var _i8 = 0, _Array$from = Array.from(dom.window.document.querySelectorAll("".concat(tagName, "[").concat(attributeName, "*=\"?") + "".concat(configuration.hashAlgorithm, "=\"]"))); _i8 < _Array$from.length; _i8++) {
            var domNode = _Array$from[_i8];
            /*
                NOTE: Removing symbols after a "&" in hash
                string is necessary to match the generated
                request strings in offline plugin.
            */
            domNode.setAttribute(attributeName, domNode.getAttribute(attributeName).replace(new RegExp('(\\?' + "".concat(configuration.hashAlgorithm, "=") + '[^&]+).*$'), '$1'));
          }
        }
        /*
            NOTE: We have to restore template delimiter and style
            contents.
        */
        data.html = dom.serialize().replace(/##\+#\+#\+##/g, '<%').replace(/##-#-#-##/g, '%>').replace(/(<style[^>]*>)[\s\S]*?(<\/style[^>]*>)/gi, function (match, startTag, endTag) {
          return "".concat(startTag).concat(styleContents.shift()) + endTag;
        });
        // region post compilation
        var _iterator8 = _createForOfIteratorHelper(configuration.files.html),
          _step8;
        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
            var htmlFileSpecification = _step8.value;
            if (htmlFileSpecification.filename === data.plugin.options.filename) {
              var _iterator9 = _createForOfIteratorHelper([].concat(htmlFileSpecification.template.use)),
                _step9;
              try {
                for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                  var _loaderConfiguration$;
                  var loaderConfiguration = _step9.value;
                  if ((_loaderConfiguration$ = loaderConfiguration.options) !== null && _loaderConfiguration$ !== void 0 && _loaderConfiguration$.compileSteps && typeof loaderConfiguration.options.compileSteps === 'number') data.html = _ejsLoader["default"].bind({
                    query: _clientnode["default"].extend(true, loaderConfiguration.options || {}, htmlFileSpecification.template.postCompileOptions)
                  })(data.html);
                }
              } catch (err) {
                _iterator9.e(err);
              } finally {
                _iterator9.f();
              }
              break;
            }
          }
          // endregion
        } catch (err) {
          _iterator8.e(err);
        } finally {
          _iterator8.f();
        }
        return data;
      });
    });
  }
});
//// endregion
//// region context replacements
var _iterator10 = _createForOfIteratorHelper(_module.replacements.context),
  _step10;
try {
  for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
    var contextReplacement = _step10.value;
    pluginInstances.push((0, _construct2["default"])(_webpack.ContextReplacementPlugin, (0, _toConsumableArray2["default"])(contextReplacement.map(function (value) {
      var evaluated = _clientnode["default"].stringEvaluate(value, {
        configuration: configuration,
        __dirname: __dirname,
        __filename: __filename
      });
      if (evaluated.error) throw new Error('Error occurred during processing given context ' + "replacement: ".concat(evaluated.error));
      return evaluated.result;
    }))));
  }
  //// endregion
  //// region consolidate duplicated module requests
  /*
      NOTE: Redundancies usually occur when symlinks aren't converted to their
      real paths since real paths can be de-duplicated by webpack but if two
      linked modules share the same transitive dependency webpack wont recognize
      them as same dependency.
  */
} catch (err) {
  _iterator10.e(err);
} finally {
  _iterator10.f();
}
if (_module.enforceDeduplication) {
  var absoluteContextPath = (0, _path.resolve)(configuration.path.context);
  var consolidator = function consolidator(result) {
    var targetPath = result.createData.resource;
    if (targetPath && /((?:^|\/)node_modules\/.+)/.test(targetPath) && (!targetPath.startsWith(absoluteContextPath) || /((?:^|\/)node_modules\/.+){2}/.test(targetPath)) && _clientnode["default"].isFileSync(targetPath)) {
      var packageDescriptor = _helper["default"].getClosestPackageDescriptor(targetPath);
      if (packageDescriptor) {
        var pathPrefixes;
        var pathSuffix;
        if (targetPath.startsWith(absoluteContextPath)) {
          var _matches2 = targetPath.match(/((?:^|.*?\/)node_modules\/)/g);
          if (_matches2 === null) return;
          pathPrefixes = Array.from(_matches2);
          /*
              Remove last one to avoid replacing with the already set
              path.
          */
          pathPrefixes.pop();
          var index = 0;
          var _iterator11 = _createForOfIteratorHelper(pathPrefixes),
            _step11;
          try {
            for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
              var pathPrefix = _step11.value;
              if (index > 0) pathPrefixes[index] = (0, _path.resolve)(pathPrefixes[index - 1], pathPrefix);
              index += 1;
            }
          } catch (err) {
            _iterator11.e(err);
          } finally {
            _iterator11.f();
          }
          pathSuffix = targetPath.replace(/(?:^|.*\/)node_modules\/(.+$)/, '$1');
        } else {
          pathPrefixes = [(0, _path.resolve)(absoluteContextPath, 'node_modules')];
          // Find longest common prefix.
          var _index = 0;
          while (_index < absoluteContextPath.length && absoluteContextPath.charAt(_index) === targetPath.charAt(_index)) {
            _index += 1;
          }
          pathSuffix = targetPath.substring(_index).replace(/^.*\/node_modules\//, '');
        }
        var redundantRequest = null;
        var _iterator12 = _createForOfIteratorHelper(pathPrefixes),
          _step12;
        try {
          for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
            var _pathPrefix = _step12.value;
            var alternateTargetPath = (0, _path.resolve)(_pathPrefix, pathSuffix);
            if (_clientnode["default"].isFileSync(alternateTargetPath)) {
              var otherPackageDescriptor = _helper["default"].getClosestPackageDescriptor(alternateTargetPath);
              if (otherPackageDescriptor) {
                if (packageDescriptor.configuration.version === otherPackageDescriptor.configuration.version) {
                  console.info('\nConsolidate module request "' + "".concat(targetPath, "\" to \"") + "".concat(alternateTargetPath, "\"."));
                  /*
                      NOTE: Only overwriting
                      "result.createData.resource" like
                      implemented in
                      "NormaleModuleReplacementPlugin" does
                      not always work.
                  */
                  result.request = result.createData.rawRequest = result.createData.request = result.createData.resource = result.createData.userRequest = alternateTargetPath;
                  return;
                }
                redundantRequest = {
                  path: alternateTargetPath,
                  version: otherPackageDescriptor.configuration.version
                };
              }
            }
          }
        } catch (err) {
          _iterator12.e(err);
        } finally {
          _iterator12.f();
        }
        if (redundantRequest) console.warn('\nIncluding different versions of same package "' + "".concat(packageDescriptor.configuration.name, "\". Module \"") + "".concat(targetPath, "\" (version ") + "".concat(packageDescriptor.configuration.version, ") has ") + "redundancies with \"".concat(redundantRequest.path, "\" (") + "version ".concat(redundantRequest.version, ")."));
      }
    }
  };
  pluginInstances.push({
    apply: function apply(compiler) {
      return compiler.hooks.normalModuleFactory.tap('WebOptimizerModuleConsolidation', function (nmf) {
        return nmf.hooks.afterResolve.tap('WebOptimizerModuleConsolidation', consolidator);
      });
    }
  });
}
/*
new NormalModuleReplacementPlugin(
    /.+/,
    (result:{
        context:string
        createData:{resource:string}
        request:string
    }):void => {
        const isResource:boolean = Boolean(result.createData.resource)
        const targetPath:string = isResource ?
            result.createData.resource :
            resolve(result.context, result.request)
        if (
            targetPath &&
            /((?:^|\/)node_modules\/.+){2}/.test(targetPath) &&
            Tools.isFileSync(targetPath)
        ) {
            const packageDescriptor:null|PackageDescriptor =
                Helper.getClosestPackageDescriptor(targetPath)
            if (packageDescriptor) {
                const pathPrefixes:null|RegExpMatchArray = targetPath.match(
                    /((?:^|.*?\/)node_modules\/)/g
                )
                if (pathPrefixes === null)
                    return
                // Avoid finding the same artefact.
                pathPrefixes.pop()
                let index:number = 0
                for (const pathPrefix of pathPrefixes) {
                    if (index > 0)
                        pathPrefixes[index] =
                            resolve(pathPrefixes[index - 1], pathPrefix)
                    index += 1
                }
                const pathSuffix:string =
                    targetPath.replace(/(?:^|.*\/)node_modules\/(.+$)/, '$1')
                let redundantRequest:null|PlainObject = null
                for (const pathPrefix of pathPrefixes) {
                    const alternateTargetPath:string =
                        resolve(pathPrefix, pathSuffix)
                    if (Tools.isFileSync(alternateTargetPath)) {
                        const otherPackageDescriptor:null|PackageDescriptor =
                            Helper.getClosestPackageDescriptor(
                                alternateTargetPath
                            )
                        if (otherPackageDescriptor) {
                            if (
                                packageDescriptor.configuration.version ===
                                otherPackageDescriptor.configuration.version
                            ) {
                                console.info(
                                    '\nConsolidate module request "' +
                                    `${targetPath}" to "` +
                                    `${alternateTargetPath}".`
                                )
                                result.createData.resource =
                                    alternateTargetPath
                                result.request = alternateTargetPath
                                return
                            }
                            redundantRequest = {
                                path: alternateTargetPath,
                                version:
                                    otherPackageDescriptor.configuration
                                        .version
                            }
                        }
                    }
                }
                if (redundantRequest)
                    console.warn(
                        '\nIncluding different versions of same package "' +
                        `${packageDescriptor.configuration.name}". Module "` +
                        `${targetPath}" (version ` +
                        `${packageDescriptor.configuration.version}) has ` +
                        `redundancies with "${redundantRequest.path}" (` +
                        `version ${redundantRequest.version}).`
                    )
            }
        }
    }
))*/
//// endregion
/// endregion
/// region loader helper
var isFilePathInDependencies = function isFilePathInDependencies(filePath) {
  filePath = _helper["default"].stripLoader(filePath);
  return _helper["default"].isFilePathInLocation(filePath, configuration.path.ignore.concat(_module.directoryNames, configuration.loader.directoryNames).map(function (filePath) {
    return (0, _path.resolve)(configuration.path.context, filePath);
  }).filter(function (filePath) {
    return !configuration.path.context.startsWith(filePath);
  }));
};
var loader = {};
var scope = {
  configuration: configuration,
  isFilePathInDependencies: isFilePathInDependencies,
  loader: loader,
  require: currentRequire
};
var evaluate = function evaluate(object) {
  var filePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : configuration.path.context;
  if (typeof object === 'string') {
    var evaluated = _clientnode["default"].stringEvaluate(object, _objectSpread({
      filePath: filePath
    }, scope));
    if (evaluated.error) throw new Error('Error occurred during processing given expression: ' + evaluated.error);
    return evaluated.result;
  }
  return object;
};
var evaluateMapper = function evaluateMapper(value) {
  return evaluate(value);
};
var evaluateAdditionalLoaderConfiguration = function evaluateAdditionalLoaderConfiguration(loaderConfiguration) {
  return {
    exclude: function exclude(filePath) {
      return Boolean(evaluate(loaderConfiguration.exclude, filePath));
    },
    include: loaderConfiguration.include && evaluate(loaderConfiguration.include) || configuration.path.source.base,
    test: new RegExp(evaluate(loaderConfiguration.test)),
    use: evaluate(loaderConfiguration.use)
  };
};
var includingPaths = _helper["default"].normalizePaths([configuration.path.source.asset.javaScript].concat(_module.locations.directoryPaths));
var cssUse = _module.preprocessor.cascadingStyleSheet.additional.pre.map(evaluateMapper).concat({
  loader: _module.style.loader,
  options: _module.style.options || {}
}, {
  loader: _module.cascadingStyleSheet.loader,
  options: _module.cascadingStyleSheet.options || {}
}, _module.preprocessor.cascadingStyleSheet.loader ? {
  loader: _module.preprocessor.cascadingStyleSheet.loader,
  options: _clientnode["default"].extend(true, optionalRequire('postcss') ? {
    postcssOptions: {
      /*
          NOTE: Some plugins like "postcss-import" are
          not yet ported to postcss 8. Let the final
          consumer decide which distribution suites most.
      */
      plugins: [].concat(postcssImport ? postcssImport({
        root: configuration.path.context
      }) : [], _module.preprocessor.cascadingStyleSheet.additional.plugins.pre.map(evaluateMapper),
      /*
          NOTE: Checking path doesn't work if fonts
          are referenced in libraries provided in
          another location than the project itself
          like the "node_modules" folder.
      */
      postcssFontpath ? postcssFontpath({
        checkPath: false,
        formats: [{
          ext: 'woff2',
          type: 'woff2'
        }, {
          ext: 'woff',
          type: 'woff'
        }]
      }) : [], postcssURL ? postcssURL({
        url: 'rebase'
      }) : [], postcssSprites ? postcssSprites({
        filterBy: function filterBy() {
          return new Promise(function (resolve, reject) {
            return (configuration.files.compose.image ? resolve : reject)();
          });
        },
        hooks: {
          onSaveSpritesheet: function onSaveSpritesheet(image) {
            return (0, _path.join)(image.spritePath, (0, _path.relative)(configuration.path.target.asset.image, configuration.files.compose.image));
          },
          /*
              Reset this token due to a
              sprite bug with
              "background-image" declaration
              which do not refer to an image
              (e.g. linear gradient instead).
          */
          onUpdateRule: function onUpdateRule(rule, token, image) {
            if (token.value.includes(token.text)) updateRule(rule, token, image);else token.cloneAfter({
              type: 'decl',
              prop: 'background-image',
              value: token.value
            });
          }
        },
        stylesheetPath: configuration.path.source.asset.cascadingStyleSheet,
        spritePath: configuration.path.source.asset.image
      }) : [], _module.preprocessor.cascadingStyleSheet.additional.plugins.post.map(evaluateMapper), _module.optimizer.cssnano && postcssCSSnano ? postcssCSSnano(_module.optimizer.cssnano) : [])
    }
  } : {}, _module.preprocessor.cascadingStyleSheet.options || {})
} : [], _module.preprocessor.cascadingStyleSheet.additional.post.map(evaluateMapper));
var genericLoader = {
  // Convert to compatible native web types.
  // region generic template
  ejs: {
    exclude: function exclude(filePath) {
      return _helper["default"].normalizePaths(configuration.files.html.concat(configuration.files.defaultHTML).map(function (htmlConfiguration) {
        return htmlConfiguration.template.filePath;
      })).includes(filePath) || _module.preprocessor.ejs.exclude === null ? false : Boolean(evaluate(_module.preprocessor.ejs.exclude, filePath));
    },
    include: includingPaths,
    test: /^(?!.+\.html\.ejs$).+\.ejs$/i,
    use: _module.preprocessor.ejs.additional.pre.map(evaluateMapper).concat({
      loader: 'file?name=[path][name]' + ((_clientnode["default"].isPlainObject(_module.preprocessor.ejs.options) ? _module.preprocessor.ejs.options : {
        compileSteps: 2
      }).compileSteps % 2 ? '.js' : '') + "?".concat(configuration.hashAlgorithm, "=[contenthash]")
    }, {
      loader: 'extract'
    }, {
      loader: _module.preprocessor.ejs.loader,
      options: _module.preprocessor.ejs.options || {}
    }, _module.preprocessor.ejs.additional.post.map(evaluateMapper))
  },
  // endregion
  // region script
  script: {
    exclude: function exclude(filePath) {
      return Boolean(evaluate(_module.preprocessor.javaScript.exclude, filePath));
    },
    include: function include(filePath) {
      var result = evaluate(_module.preprocessor.javaScript.include, filePath);
      if ([null, undefined].includes(result)) {
        var _iterator13 = _createForOfIteratorHelper(includingPaths),
          _step13;
        try {
          for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
            var includePath = _step13.value;
            if (filePath.startsWith(includePath)) return true;
          }
        } catch (err) {
          _iterator13.e(err);
        } finally {
          _iterator13.f();
        }
        return false;
      }
      return Boolean(result);
    },
    test: new RegExp(_module.preprocessor.javaScript.regularExpression, 'i'),
    use: _module.preprocessor.javaScript.additional.pre.map(evaluateMapper).concat({
      loader: _module.preprocessor.javaScript.loader,
      options: _module.preprocessor.javaScript.options || {}
    }, _module.preprocessor.javaScript.additional.post.map(evaluateMapper))
  },
  // endregion
  // region html template
  html: {
    // NOTE: This is only for the main entry template.
    main: {
      test: new RegExp('^' + _clientnode["default"].stringEscapeRegularExpressions(configuration.files.defaultHTML.template.filePath) + '(?:\\?.*)?$'),
      use: configuration.files.defaultHTML.template.use
    },
    ejs: {
      exclude: function exclude(filePath) {
        return _helper["default"].normalizePaths(configuration.files.html.concat(configuration.files.defaultHTML).map(function (htmlConfiguration) {
          return htmlConfiguration.template.filePath;
        })).includes(filePath) || (_module.preprocessor.html.exclude === null ? false : Boolean(evaluate(_module.preprocessor.html.exclude, filePath)));
      },
      include: configuration.path.source.asset.template,
      test: /\.html\.ejs(?:\?.*)?$/i,
      use: _module.preprocessor.html.additional.pre.map(evaluateMapper).concat({
        loader: 'file?name=' + (0, _path.join)((0, _path.relative)(configuration.path.target.asset.base, configuration.path.target.asset.template), '[name]' + ((_clientnode["default"].isPlainObject(_module.preprocessor.html.options) ? _module.preprocessor.html.options : {
          compileSteps: 2
        }).compileSteps % 2 ? '.js' : '') + "?".concat(configuration.hashAlgorithm, "=[contenthash]"))
      }, (_clientnode["default"].isPlainObject(_module.preprocessor.html.options) ? _module.preprocessor.html.options : {
        compileSteps: 2
      }).compileSteps % 2 ? [] : [{
        loader: 'extract'
      }, {
        loader: _module.html.loader,
        options: _module.html.options || {}
      }], {
        loader: _module.preprocessor.html.loader,
        options: _module.preprocessor.html.options || {}
      }, _module.preprocessor.html.additional.post.map(evaluateMapper))
    },
    html: {
      exclude: function exclude(filePath) {
        return _helper["default"].normalizePaths(configuration.files.html.concat(configuration.files.defaultHTML).map(function (htmlConfiguration) {
          return htmlConfiguration.template.filePath;
        })).includes(filePath) || (_module.html.exclude === null ? true : Boolean(evaluate(_module.html.exclude, filePath)));
      },
      include: configuration.path.source.asset.template,
      test: /\.html(?:\?.*)?$/i,
      use: _module.html.additional.pre.map(evaluateMapper).concat({
        loader: 'file?name=' + (0, _path.join)((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset.template), "[name][ext]?".concat(configuration.hashAlgorithm, "=") + '[contenthash]')
      }, {
        loader: 'extract'
      }, {
        loader: _module.html.loader,
        options: _module.html.options || {}
      }, _module.html.additional.post.map(evaluateMapper))
    }
  },
  // endregion
  // Load dependencies.
  // region style
  style: {
    exclude: function exclude(filePath) {
      return _module.cascadingStyleSheet.exclude === null ? isFilePathInDependencies(filePath) : Boolean(evaluate(_module.cascadingStyleSheet.exclude, filePath));
    },
    include: function include(filePath) {
      var result = evaluate(_module.cascadingStyleSheet.include, filePath);
      if ([null, undefined].includes(result)) {
        var _iterator14 = _createForOfIteratorHelper(includingPaths),
          _step14;
        try {
          for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
            var includePath = _step14.value;
            if (filePath.startsWith(includePath)) return true;
          }
        } catch (err) {
          _iterator14.e(err);
        } finally {
          _iterator14.f();
        }
        return false;
      }
      return Boolean(result);
    },
    test: /\.s?css(?:\?.*)?$/i,
    use: cssUse
  },
  // endregion
  // Optimize loaded assets.
  // region font
  font: {
    eot: {
      exclude: function exclude(filePath) {
        return _module.optimizer.font.eot.exclude === null ? false : Boolean(evaluate(_module.optimizer.font.eot.exclude, filePath));
      },
      generator: {
        filename: (0, _path.join)((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset.font), '[name][ext]') + "?".concat(configuration.hashAlgorithm, "=[contenthash]")
      },
      test: /\.eot(?:\?.*)?$/i,
      type: 'asset/resource',
      parser: {
        dataUrlCondition: {
          maxSize: configuration.inPlace.otherMaximumFileSizeLimitInByte
        }
      },
      use: _module.optimizer.font.eot.loader.map(evaluateMapper)
    },
    svg: {
      exclude: function exclude(filePath) {
        return _module.optimizer.font.svg.exclude === null ? false : Boolean(evaluate(_module.optimizer.font.svg.exclude, filePath));
      },
      include: configuration.path.source.asset.font,
      generator: {
        filename: (0, _path.join)((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset.font), '[name][ext]') + "?".concat(configuration.hashAlgorithm, "=[contenthash]")
      },
      mimetype: 'image/svg+xml',
      parser: {
        dataUrlCondition: {
          maxSize: configuration.inPlace.otherMaximumFileSizeLimitInByte
        }
      },
      test: /\.svg(?:\?.*)?$/i,
      type: 'asset/resource',
      use: _module.optimizer.font.svg.loader.map(evaluateMapper)
    },
    ttf: {
      exclude: function exclude(filePath) {
        return _module.optimizer.font.ttf.exclude === null ? false : Boolean(evaluate(_module.optimizer.font.ttf.exclude, filePath));
      },
      generator: {
        filename: (0, _path.join)((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset.font), '[name][ext]') + "?".concat(configuration.hashAlgorithm, "=[contenthash]")
      },
      test: /\.ttf(?:\?.*)?$/i,
      type: 'asset/resource',
      mimetype: 'application/octet-stream',
      parser: {
        dataUrlCondition: {
          maxSize: configuration.inPlace.otherMaximumFileSizeLimitInByte
        }
      },
      use: _module.optimizer.font.ttf.loader.map(evaluateMapper)
    },
    woff: {
      exclude: function exclude(filePath) {
        return _module.optimizer.font.woff.exclude === null ? false : Boolean(evaluate(_module.optimizer.font.woff.exclude, filePath));
      },
      generator: {
        filename: (0, _path.join)((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset.font), '[name][ext]') + "?".concat(configuration.hashAlgorithm, "=[contenthash]")
      },
      test: /\.woff2?(?:\?.*)?$/i,
      type: 'asset/resource',
      parser: {
        dataUrlCondition: {
          maxSize: configuration.inPlace.otherMaximumFileSizeLimitInByte
        }
      },
      use: _module.optimizer.font.woff.loader.map(evaluateMapper)
    }
  },
  // endregion
  // region image
  image: {
    exclude: function exclude(filePath) {
      return _module.optimizer.image.exclude === null ? isFilePathInDependencies(filePath) : Boolean(evaluate(_module.optimizer.image.exclude, filePath));
    },
    generator: {
      filename: (0, _path.join)((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset.image), '[name][ext]') + "?".concat(configuration.hashAlgorithm, "=[contenthash]")
    },
    include: configuration.path.source.asset.image,
    test: /\.(?:gif|ico|jpg|png|svg)(?:\?.*)?$/i,
    type: 'asset/resource',
    parser: {
      dataUrlCondition: {
        maxSize: configuration.inPlace.otherMaximumFileSizeLimitInByte
      }
    },
    use: _module.optimizer.image.loader.map(evaluateMapper)
  },
  // endregion
  // region data
  data: {
    exclude: function exclude(filePath) {
      if (typeof filePath !== 'string') return false;
      return configuration.extensions.file.internal.includes((0, _path.extname)(_helper["default"].stripLoader(filePath))) || (_module.optimizer.data.exclude === null ? isFilePathInDependencies(filePath) : Boolean(evaluate(_module.optimizer.data.exclude, filePath)));
    },
    generator: {
      filename: (0, _path.join)((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset.data), '[name][ext]') + "?".concat(configuration.hashAlgorithm, "=[contenthash]")
    },
    test: /.+/,
    type: 'asset/resource',
    parser: {
      dataUrlCondition: {
        maxSize: configuration.inPlace.otherMaximumFileSizeLimitInByte
      }
    },
    use: _module.optimizer.data.loader.map(evaluateMapper)
  }
  // endregion
};

_clientnode["default"].extend(loader, genericLoader);
if (configuration.files.compose.cascadingStyleSheet && plugins.MiniCSSExtract) {
  /*
      NOTE: We have to remove the client side javascript hmr style loader
      first.
  */
  loader.style.use.shift();
  loader.style.use.unshift({
    loader: plugins.MiniCSSExtract.loader
  });
}
/// endregion
/// region apply runtime dev helper
/*
    NOTE: Disable automatic injection to avoid injection in all chunks and as
    last module which would shadow main module (e.g. index).
    So we inject live reload and hot module replacement manually.
*/
if (htmlAvailable && configuration.debug && configuration.development.server.liveReload && !configuration.injection.entry.normalized.developmentHandler && ['serve', 'test:browser'].includes(configuration.givenCommandLineArguments[2])) {
  configuration.injection.entry.normalized.developmentHandler = ['webpack-dev-server/client/index.js?live-reload=true&hot=' + "".concat(configuration.development.server.hot ? 'true' : 'false', "&http") + "".concat(configuration.development.server.https ? 's' : '', "://") + "".concat(configuration.development.server.host, ":") + "".concat(configuration.development.server.port)];
  if (configuration.development.server.hot) {
    configuration.injection.entry.normalized.developmentHandler.push('webpack/hot/dev-server.js');
    configuration.development.server.hot = false;
    pluginInstances.push(new _webpack.HotModuleReplacementPlugin());
  }
}
/// endregion
// endregion
// region plugins
var _iterator15 = _createForOfIteratorHelper(configuration.plugins),
  _step15;
try {
  for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
    var pluginConfiguration = _step15.value;
    var _plugin = optionalRequire(pluginConfiguration.name.module);
    if (_plugin) pluginInstances.push((0, _construct2["default"])(_plugin[pluginConfiguration.name.initializer], (0, _toConsumableArray2["default"])(pluginConfiguration.parameters)));else console.warn("Configured plugin module \"".concat(pluginConfiguration.name.module, "\" ") + 'could not be loaded.');
  }
  // endregion
  // region minimizer and image compression
  // NOTE: This plugin should be loaded at last to ensure that all emitted images
  // ran through.
} catch (err) {
  _iterator15.e(err);
} finally {
  _iterator15.f();
}
if (!_module.optimizer.minimizer) {
  _module.optimizer.minimizer = [];
  if (plugins.Terser)
    /*
        HTML-Templates shouldn't be transformed via terser to avoid html
        webpack plugin throwing to not get markup as intermediate result.
    */
    _module.optimizer.minimizer.push(new plugins.Terser({
      exclude: /\\.html(?:\\.js)?(?:\\?.*)?$/,
      extractComments: false,
      parallel: true
    }));
  if (plugins.ImageMinimizer) _module.optimizer.minimizer.push(new plugins.ImageMinimizer(_clientnode["default"].extend(true, {
    minimizer: {
      implementation: plugins.ImageMinimizer.imageminMinify
    }
  }, _module.optimizer.image.content)));
}
// endregion
// region configuration
var customConfiguration = {};
if ((_configuration$path$c = configuration.path.configuration) !== null && _configuration$path$c !== void 0 && _configuration$path$c.json) try {
  require.resolve(configuration.path.configuration.json);
  try {
    customConfiguration = currentRequire(configuration.path.configuration.json);
  } catch (error) {
    console.debug('Importing provided json webpack configuration file path ' + "under \"".concat(configuration.path.configuration.json, "\" failed: ") + _clientnode["default"].represent(error));
  }
} catch (error) {
  console.debug('Optional configuration file "' + "".concat(configuration.path.configuration.json, "\" not available."));
}
var webpackConfiguration = _clientnode["default"].extend(true, {
  bail: !configuration.givenCommandLineArguments.includes('--watch'),
  context: configuration.path.context,
  devtool: configuration.development.tool,
  devServer: configuration.development.server,
  experiments: {
    topLevelAwait: true
  },
  // region input
  entry: configuration.injection.entry.normalized,
  externals: configuration.injection.external.modules,
  resolve: {
    alias: _module.aliases,
    aliasFields: configuration["package"].aliasPropertyNames,
    extensions: configuration.extensions.file.internal,
    mainFields: configuration["package"].main.propertyNames,
    mainFiles: configuration["package"].main.fileNames,
    modules: _helper["default"].normalizePaths(_module.directoryNames),
    symlinks: _module.resolveSymlinks,
    unsafeCache: Boolean((_configuration$cache = configuration.cache) === null || _configuration$cache === void 0 ? void 0 : _configuration$cache.unsafe)
  },
  resolveLoader: {
    alias: configuration.loader.aliases,
    aliasFields: configuration["package"].aliasPropertyNames,
    extensions: configuration.loader.extensions.file,
    mainFields: configuration["package"].main.propertyNames,
    mainFiles: configuration["package"].main.fileNames,
    modules: configuration.loader.directoryNames,
    symlinks: configuration.loader.resolveSymlinks
  },
  // endregion
  // region output
  output: {
    assetModuleFilename: (0, _path.join)((0, _path.relative)(configuration.path.target.base, configuration.path.target.asset.base), '[name][ext]') + "?".concat(configuration.hashAlgorithm, "=[chunkhash]"),
    filename: (0, _path.relative)(configuration.path.target.base, configuration.files.compose.javaScript),
    globalObject: configuration.exportFormat.globalObject,
    hashFunction: configuration.hashAlgorithm,
    library: {
      name: libraryName,
      type: configuration.exportFormat.self,
      umdNamedDefine: true
    },
    path: configuration.path.target.base,
    publicPath: configuration.path.target["public"]
  },
  performance: configuration.performanceHints,
  /*
      NOTE: Live-reload is not working if target technology is not set to
      "web". Webpack boilerplate code may not support target
      technologies.
  */
  target: configuration.targetTechnology.boilerplate,
  // endregion
  mode: configuration.debug ? 'development' : 'production',
  module: {
    rules: _module.additional.pre.map(evaluateAdditionalLoaderConfiguration).concat(loader.ejs, loader.script, loader.html.main, loader.html.ejs, loader.html.html, loader.style, loader.font.eot, loader.font.svg, loader.font.ttf, loader.font.woff, loader.image, loader.data, _module.additional.post.map(evaluateAdditionalLoaderConfiguration))
  },
  node: configuration.nodeEnvironment,
  optimization: _objectSpread({
    chunkIds: configuration.debug ? 'named' : 'total-size',
    moduleIds: configuration.debug ? 'named' : 'size',
    // region common chunks
    splitChunks: _clientnode["default"].extend(true, !configuration.injection.chunks || configuration.targetTechnology.payload === 'node' || configuration.givenCommandLineArguments[2] === 'test' ? {
      cacheGroups: {
        "default": false,
        defaultVendors: false
      }
    } : {
      chunks: 'all',
      cacheGroups: {
        defaultVendors: {
          chunks: function chunks(chunk) {
            if ((0, _typeof2["default"])(configuration.inPlace.javaScript) === 'object' && configuration.inPlace.javaScript !== null) for (var _i9 = 0, _Object$keys = Object.keys(configuration.inPlace.javaScript); _i9 < _Object$keys.length; _i9++) {
              var _name4 = _Object$keys[_i9];
              if (_name4 === '*' || _name4 === chunk.name) return false;
            }
            return true;
          },
          priority: -10,
          reuseExistingChunk: true,
          test: /[\\/]node_modules[\\/]/
        }
      }
    }, configuration.injection.chunks)
  }, _clientnode["default"].mask(_module.optimizer, {
    exclude: {
      babelMinify: true,
      cssnano: true,
      data: true,
      font: true,
      htmlMinifier: true,
      image: true
    }
  })),
  plugins: pluginInstances
}, (_configuration$cache2 = configuration.cache) !== null && _configuration$cache2 !== void 0 && _configuration$cache2.main ? {
  cache: configuration.cache.main
} : {}, configuration.webpack, customConfiguration);
exports.webpackConfiguration = webpackConfiguration;
if (configuration.nodeENV !== null) webpackConfiguration.optimization.nodeEnv = configuration.nodeENV;
if (!Array.isArray(_module.skipParseRegularExpressions) || _module.skipParseRegularExpressions.length) webpackConfiguration.module.noParse = _module.skipParseRegularExpressions;
if ((_configuration$path$c2 = configuration.path.configuration) !== null && _configuration$path$c2 !== void 0 && _configuration$path$c2.javaScript) try {
  require.resolve(configuration.path.configuration.javaScript);
  var result = optionalRequire(configuration.path.configuration.javaScript);
  if (_clientnode["default"].isPlainObject(result)) {
    if (Object.prototype.hasOwnProperty.call(result, 'replaceWebOptimizer')) exports.webpackConfiguration = webpackConfiguration = result.replaceWebOptimizer;else _clientnode["default"].extend(true, webpackConfiguration, result);
  } else console.debug('Failed to load given JavaScript configuration file path "' + "".concat(configuration.path.configuration.javaScript, "\"."));
} catch (error) {
  console.debug('Optional configuration file script "' + "".concat(configuration.path.configuration.javaScript, "\" not available."));
}
if (configuration.showConfiguration) {
  console.info('Using internal configuration:', _util["default"].inspect(configuration, {
    depth: null
  }));
  console.info('-----------------------------------------------------------');
  console.info('Using webpack configuration:', _util["default"].inspect(webpackConfiguration, {
    depth: null
  }));
}
// endregion
var _default = webpackConfiguration; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
exports["default"] = _default;
