// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module ejsLoader */
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
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loader = exports["default"] = void 0;
var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _core = require("@babel/core");
var _babelPresetMinify = _interopRequireDefault(require("babel-preset-minify"));
var _clientnode = _interopRequireWildcard(require("clientnode"));
var _ejs = _interopRequireDefault(require("ejs"));
var _fs = require("fs");
var _htmlMinifier = require("html-minifier");
var _path = require("path");
var _configurator = _interopRequireDefault(require("./configurator"));
var _helper = _interopRequireDefault(require("./helper"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// endregion
// region types
// endregion
var configuration = (0, _configurator["default"])();
/**
 * Main transformation function.
 * @param source - Input string to transform.
 *
 * @returns Transformed string.
 */
var loader = exports.loader = function loader(source) {
  var _ref,
    _this = this;
  var givenOptions = _clientnode["default"].convertSubstringInPlainObject(_clientnode["default"].extend(true, {
    compiler: {},
    compileSteps: 2,
    compress: {
      html: {},
      javaScript: {}
    },
    context: './',
    debug: false,
    extensions: {
      file: {
        external: [],
        internal: ['.js', '.json', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.eot', '.ttf', '.woff', '.woff2']
      }
    },
    module: {
      aliases: {},
      replacements: {}
    }
  }, 'getOptions' in this && this.getOptions() ? this.getOptions() : (_ref = this.query) !== null && _ref !== void 0 ? _ref : {}), /#%%%#/g, '!');
  var compile = function compile(template) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : givenOptions.compiler;
    var compileSteps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
    return function () {
      var locals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      options = _objectSpread({
        filename: template
      }, options);
      var givenLocals = [].concat(locals);
      var require = function require(request) {
        var nestedLocals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var template = request.replace(/^(.+)\?[^?]+$/, '$1');
        var queryMatch = /^[^?]+\?(.+)$/.exec(request);
        if (queryMatch) {
          var evaluated = _clientnode["default"].stringEvaluate(queryMatch[1], {
            compile: compile,
            locals: locals,
            request: request,
            source: source,
            template: template
          });
          if (evaluated.error) console.warn('Error occurred during processing given query: ' + evaluated.error);else _clientnode["default"].extend(true, nestedLocals, evaluated.result);
        }
        var nestedOptions = _clientnode["default"].copy(options);
        delete nestedOptions.client;
        nestedOptions = _clientnode["default"].extend(true, {
          encoding: configuration.encoding
        }, nestedOptions, nestedLocals.options || {}, options);
        if (nestedOptions.isString) return compile(template, nestedOptions)(nestedLocals);
        var templateFilePath = _helper["default"].determineModuleFilePath(template, givenOptions.module.aliases, givenOptions.module.replacements, {
          file: givenOptions.extensions.file.internal
        }, givenOptions.context, configuration.path.source.asset.base, configuration.path.ignore, configuration.module.directoryNames, configuration["package"].main.fileNames, configuration["package"].main.propertyNames, configuration["package"].aliasPropertyNames, configuration.encoding);
        if (templateFilePath) {
          if ('addDependency' in _this) _this.addDependency(templateFilePath);
          /*
              NOTE: If there aren't any locals options or variables and
              file doesn't seem to be an ejs template we simply load
              included file content.
          */
          if (queryMatch || templateFilePath.endsWith('.ejs')) return compile(templateFilePath, nestedOptions)(nestedLocals);
          return (0, _fs.readFileSync)(templateFilePath, {
            encoding: nestedOptions.encoding
          });
        }
        throw new Error("Given template file \"".concat(template, "\" couldn't be resolved."));
      };
      var compressHTML = function compressHTML(content) {
        var _givenOptions$compres;
        return (_givenOptions$compres = givenOptions.compress) !== null && _givenOptions$compres !== void 0 && _givenOptions$compres.html ? (0, _htmlMinifier.minify)(content, _clientnode["default"].extend(true, {
          caseSensitive: true,
          collapseInlineTagWhitespace: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          minifyCSS: true,
          minifyJS: true,
          processScripts: ['text/ng-template', 'text/x-handlebars-template'],
          removeAttributeQuotes: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          sortAttributes: true,
          sortClassName: true,
          /*
              NOTE: Avoids whitespace around placeholder in
              tags.
          */
          trimCustomFragments: true,
          useShortDoctype: true
        }, givenOptions.compress.html || {})) : content;
      };
      var result = template;
      var isString = Boolean(options.isString);
      delete options.isString;
      var stepLocals;
      var scope;
      var originalScopeNames;
      var scopeNames;
      for (var step = 1; step <= compileSteps; step += 1) {
        // On every odd compile step we have to determine the environment.
        if (step % 2) {
          // region determine scope
          var localsIndex = Math.round(step / 2) - 1;
          stepLocals = localsIndex < givenLocals.length ? givenLocals[localsIndex] : {};
          scope = {};
          if (step < 3 && 1 < compileSteps) scope = _objectSpread({
            configuration: configuration,
            Helper: _helper["default"],
            include: require,
            require: require,
            Tools: _clientnode["default"]
          }, Array.isArray(stepLocals) ? {} : stepLocals);else if (!Array.isArray(stepLocals)) scope = stepLocals;
          originalScopeNames = Array.isArray(stepLocals) ? stepLocals : Object.keys(scope);
          scopeNames = originalScopeNames.map(function (name) {
            return _clientnode["default"].stringConvertToValidVariableName(name);
          });
          // endregion
        }

        if (typeof result === 'string') {
          var filePath = isString ? options.filename : result;
          if (filePath && (0, _path.extname)(filePath) === '.js') result = (0, _clientnode.currentRequire)(filePath);else {
            if (!isString) {
              var encoding = configuration.encoding;
              if (typeof options.encoding === 'string') encoding = options.encoding;
              result = (0, _fs.readFileSync)(result, {
                encoding: encoding
              });
            }
            if (step === compileSteps) result = compressHTML(result);
            if (options.strict || !options._with)
              // NOTE: Needed to manipulate code after compiling.
              options.client = true;
            result = _ejs["default"].compile(result, options);

            /*
                Provide all scope names when "_with" options isn't
                enabled
            */
            if (options.strict || !options._with) {
              var localsName = options.localsName || 'locals';
              while (scopeNames.includes(localsName)) localsName = "_".concat(localsName);

              /* eslint-disable @typescript-eslint/no-implied-eval */
              result = (0, _construct2["default"])(Function, (0, _toConsumableArray2["default"])(scopeNames).concat([localsName, "return ".concat(result.toString(), "(") + "".concat(localsName, ",").concat(localsName, ".escapeFn,include,") + "".concat(localsName, ".rethrow)")]));
              /* eslint-enable @typescript-eslint/no-implied-eval */
            }
          }
        } else result = compressHTML(!options.strict && options._with ? result(scope, scope.escapeFn, scope.include) : result.apply(void 0, (0, _toConsumableArray2["default"])(originalScopeNames.map(function (name) {
          return scope[name];
        }).concat(!options.strict && options._with ? [] : scope))));
      }
      if (compileSteps % 2) {
        var code = "module.exports = ".concat(result.toString());
        var processed = (0, _core.transformSync)(code, {
          ast: false,
          babelrc: false,
          comments: !givenOptions.compress.javaScript,
          compact: Boolean(givenOptions.compress.javaScript),
          filename: options.filename || 'unknown',
          minified: Boolean(givenOptions.compress.javaScript),
          presets: givenOptions.compress.javaScript ? [[_babelPresetMinify["default"], givenOptions.compress.javaScript]] : [],
          sourceMaps: false,
          sourceType: 'script'
        });
        if (typeof (processed === null || processed === void 0 ? void 0 : processed.code) === 'string') code = processed.code;
        return "".concat(options.strict ? "'use strict';\n" : '').concat(code);
      }
      if (typeof result === 'string') {
        result = result.replace(new RegExp("<script +processing-workaround *" + "(?:= *(?:\" *\"|' *') *)?>([\\s\\S]*?)</ *script *>", 'ig'), '$1').replace(new RegExp("<script +processing(-+)-workaround *" + "(?:= *(?:\" *\"|' *') *)?>([\\s\\S]*?)</ *script *>", 'ig'), '<script processing$1workaround>$2</script>');
        return result;
      }
      return '';
    };
  };
  return compile(source, _objectSpread(_objectSpread({}, givenOptions.compiler), {}, {
    client: Boolean(givenOptions.compileSteps % 2),
    compileDebug: givenOptions.debug,
    debug: givenOptions.debug,
    filename: this.resourcePath || 'unknown',
    isString: true,
    localsName: 'scope'
  }), givenOptions.compileSteps)(givenOptions.locals || {});
};
var _default = exports["default"] = loader; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
