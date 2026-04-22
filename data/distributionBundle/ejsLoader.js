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
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = exports.loader = exports["default"] = void 0;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _core = require("@babel/core");
var _babelPresetMinify = _interopRequireDefault(require("babel-preset-minify"));
var _clientnode = require("clientnode");
var _ejs = _interopRequireDefault(require("ejs"));
var _fs = require("fs");
var _htmlMinifier = require("html-minifier");
var _path = require("path");
var _configurator = _interopRequireDefault(require("./configurator"));
var _helper = require("./helper");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// endregion
// region types

// endregion
var configuration = (0, _configurator["default"])();
var log = exports.log = new _clientnode.Logger({
  name: 'weboptimizer-ejs-loader-logger'
});
/**
 * Main transformation function.
 * @param source - Input string to transform.
 * @returns Transformed string.
 */
var loader = exports.loader = function loader(source) {
  var _ref,
    _this = this,
    _givenOptions$compile;
  var givenOptions = (0, _clientnode.convertSubstringInPlainObject)((0, _clientnode.extend)(true, {
    compiler: {
      localsName: '_'
    },
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
  }, this.getOptions ? this.getOptions() : (_ref = this.query) !== null && _ref !== void 0 ? _ref : {}), /#%%%#/g, '!');
  var _compile = function compile(template) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : givenOptions.compiler;
    var compileSteps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
    return function () {
      var locals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      options = _objectSpread({
        filename: template
      }, options);
      var givenLocals = [].concat(locals);
      var require = function require(request) {
        var _givenOptions$module, _givenOptions$module2, _givenOptions$extensi;
        var nestedLocals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var template = request.replace(/^(.+)\?[^?]+$/, '$1');
        var queryMatch = /^[^?]+\?(.+)$/.exec(request);
        if (queryMatch) {
          var evaluated = (0, _clientnode.evaluate)(queryMatch[1], {
            compile: _compile,
            locals: locals,
            request: request,
            source: source,
            template: template
          });
          if (evaluated.error) log.warn('Error occurred during processing given query:', evaluated.error);else if (evaluated.result) (0, _clientnode.extend)(true, nestedLocals, evaluated.result);
        }
        var nestedOptions = (0, _clientnode.copy)(options);
        delete nestedOptions.client;
        nestedOptions = (0, _clientnode.extend)(true, {
          encoding: configuration.encoding
        }, nestedOptions, nestedLocals.options || {}, options !== null && options !== void 0 ? options : {});
        if (nestedOptions.isString) return _compile(template, nestedOptions)(nestedLocals);
        var templateFilePath = (0, _helper.determineModuleFilePath)(template, (_givenOptions$module = givenOptions.module) === null || _givenOptions$module === void 0 ? void 0 : _givenOptions$module.aliases, (_givenOptions$module2 = givenOptions.module) === null || _givenOptions$module2 === void 0 ? void 0 : _givenOptions$module2.replacements, {
          file: ((_givenOptions$extensi = givenOptions.extensions) === null || _givenOptions$extensi === void 0 ? void 0 : _givenOptions$extensi.file.internal) || []
        }, givenOptions.context, configuration.path.source.asset.base, configuration.path.ignore, configuration.module.directoryNames, configuration["package"].main.fileNames, configuration["package"].main.propertyNames, configuration["package"].aliasPropertyNames, configuration.encoding);
        if (templateFilePath) {
          if (_this.addDependency) _this.addDependency(templateFilePath);
          /*
              NOTE: If there aren't any locals options or variables and
              file doesn't seem to be an ejs template we simply load
              included file content.
          */
          if (queryMatch || templateFilePath.endsWith('.ejs')) return _compile(templateFilePath, nestedOptions)(nestedLocals);
          return (0, _fs.readFileSync)(templateFilePath, {
            encoding: nestedOptions.encoding
          });
        }
        throw new Error("Given template file \"".concat(template, "\" couldn't be resolved."));
      };
      var compressHTML = function compressHTML(content) {
        var _givenOptions$compres;
        return (0, _htmlMinifier.minify)(content, (0, _clientnode.extend)(true, {
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
        }, ((_givenOptions$compres = givenOptions.compress) === null || _givenOptions$compres === void 0 ? void 0 : _givenOptions$compres.html) || {}));
      };
      var result = template;
      var isString = Boolean(options.isString);
      delete options.isString;

      // NOTE: Needed to have standalone useable js code afterwards.
      if (compileSteps % 2) options.client = true;
      var stepLocals;
      var scope = {};
      for (var step = 1; step <= compileSteps; step += 1) {
        // On every odd compile step we have to determine the environment.
        if (step % 2) {
          // region determine scope
          var localsIndex = Math.round(step / 2) - 1;
          stepLocals = localsIndex < givenLocals.length ? givenLocals[localsIndex] : {};
          scope = {};
          if (step < 3 && 1 < compileSteps) scope = _objectSpread(_objectSpread({}, _clientnode.UTILITY_SCOPE), {}, {
            configuration: configuration,
            include: require,
            require: require
          }, Array.isArray(stepLocals) ? {} : stepLocals);else if (!Array.isArray(stepLocals)) scope = stepLocals;
          // endregion
        }
        if (typeof result === 'string') {
          var filePath = isString ? options.filename : result;
          if (filePath && (0, _path.extname)(filePath) === '.js' && _clientnode.currentRequire) result = (0, _clientnode.currentRequire)(filePath);else {
            var _givenOptions$compres2;
            if (!isString) {
              var encoding = configuration.encoding;
              if (typeof options.encoding === 'string') encoding = options.encoding;
              result = (0, _fs.readFileSync)(result, {
                encoding: encoding
              });
            }
            if (step === compileSteps && (_givenOptions$compres2 = givenOptions.compress) !== null && _givenOptions$compres2 !== void 0 && _givenOptions$compres2.html) result = compressHTML(result);
            if (step === compileSteps && compileSteps % 2) {
              /*
                  We have to use the templace class directly to get
                  the generated source code.
               */
              var templateInstance = new _ejs["default"].Template(template, options);
              templateInstance.compile();
              var compiledSourceCode = templateInstance.source;
              result = "\n                            module.exports = function(\n                                ".concat(options.localsName, "\n                            ) {\n                                var escapeFn = function(value) {\n                                    return String(value)\n                                        .replace(\n                                            /[&<>\"']/g,\n                                            function(char) {\n                                                return {\n                                                    '&': '&amp;',\n                                                    '<': '&lt;',\n                                                    '>': '&gt;',\n                                                    '\"': '&quot;',\n                                                    \"'\": \"&#39;\"\n                                                }[char]\n                                            }\n                                        )\n                                };\n                                var include = function() {\n                                    throw new Error('Include not implemented.')\n                                };\n                                var rethrow = function rethrow(\n                                    err, str, flnm, lineno, esc\n                                ) {\n                                    var lines = str.split('\\n');\n                                    var start = Math.max(lineno - 3, 0);\n                                    var end = Math.min(\n                                        lines.length, lineno + 3\n                                    );\n                                    var filename = esc(flnm);\n                                    // Error context\n                                    var context = lines\n                                        .slice(start, end)\n                                        .map(function (line, i) {\n                                            var curr = i + start + 1;\n                                            return (\n                                                curr == lineno ?\n                                                    ' >> ' :\n                                                    '    '\n                                                ) +\n                                                curr +\n                                                '| ' +\n                                                line;\n                                        })\n                                        .join('\\n');\n                                    // Alter exception message\n                                    err.path = filename;\n                                    err.message =\n                                        (filename || 'ejs') +\n                                        ':' +\n                                        lineno +\n                                        '\\n' +\n                                        context +\n                                        '\\n\\n' +\n                                        err.message;\n                                    throw err;\n                                };\n                                ").concat(compiledSourceCode, "\n                            };\n                        ").trim();
            } else result = _ejs["default"].compile(result, options);
          }
        } else {
          var _givenOptions$compres3;
          result = result(scope);
          if ((_givenOptions$compres3 = givenOptions.compress) !== null && _givenOptions$compres3 !== void 0 && _givenOptions$compres3.html) result = compressHTML(result);
        }
      }
      if (compileSteps % 2) {
        var _givenOptions$compres4, _givenOptions$compres5, _givenOptions$compres6, _givenOptions$compres7;
        var processed = (0, _core.transformSync)(result, {
          ast: false,
          babelrc: false,
          comments: !((_givenOptions$compres4 = givenOptions.compress) !== null && _givenOptions$compres4 !== void 0 && _givenOptions$compres4.javaScript),
          compact: Boolean((_givenOptions$compres5 = givenOptions.compress) === null || _givenOptions$compres5 === void 0 ? void 0 : _givenOptions$compres5.javaScript),
          filename: options.filename || 'unknown',
          minified: Boolean((_givenOptions$compres6 = givenOptions.compress) === null || _givenOptions$compres6 === void 0 ? void 0 : _givenOptions$compres6.javaScript),
          presets: (_givenOptions$compres7 = givenOptions.compress) !== null && _givenOptions$compres7 !== void 0 && _givenOptions$compres7.javaScript ? [[_babelPresetMinify["default"], givenOptions.compress.javaScript]] : [],
          sourceMaps: false,
          sourceType: 'script'
        });
        if (typeof (processed === null || processed === void 0 ? void 0 : processed.code) === 'string') result = processed.code;
        return "".concat(options.strict ? "'use strict';\n" : '').concat(result);
      }
      if (typeof result === 'string') {
        result = result.replace(new RegExp("<script +processing-workaround *" + "(?: = *(?: \" *\"|' *') *)?>([\\s\\S]*?)</ *script *>", 'ig'), '$1').replace(new RegExp("<script +processing(-+)-workaround *" + "(?: = *(?: \" *\"|' *') *)?>([\\s\\S]*?)</ *script *>", 'ig'), '<script processing$1workaround>$2</script>');
        return result;
      }
      return '';
    };
  };
  return _compile(source, _objectSpread(_objectSpread({}, givenOptions.compiler), {}, {
    client: Boolean(((_givenOptions$compile = givenOptions.compileSteps) !== null && _givenOptions$compile !== void 0 ? _givenOptions$compile : 2) % 2),
    compileDebug: givenOptions.debug,
    debug: givenOptions.debug,
    filename: this.resourcePath || 'unknown',
    isString: true
  }), givenOptions.compileSteps)(givenOptions.locals || {});
};
var _default = exports["default"] = loader;
