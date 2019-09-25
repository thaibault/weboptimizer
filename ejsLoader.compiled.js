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

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _babelCore = require("babel-core");

var _babelPresetMinify = _interopRequireDefault(require("babel-preset-minify"));

var _babelPluginTransformWith = _interopRequireDefault(require("babel-plugin-transform-with"));

var _clientnode = _interopRequireDefault(require("clientnode"));

var _ejs = _interopRequireDefault(require("ejs"));

var _fs = _interopRequireDefault(require("fs"));

var _htmlMinifier = require("html-minifier");

var loaderUtils = _interopRequireWildcard(require("loader-utils"));

var _path = _interopRequireDefault(require("path"));

var _configurator = _interopRequireDefault(require("./configurator.compiled"));

var _helper = _interopRequireDefault(require("./helper.compiled"));

// endregion
module.exports = function (source) {
  var _this = this;

  if ('cachable' in this && this.cacheable) this.cacheable();

  var query = _clientnode["default"].convertSubstringInPlainObject(_clientnode["default"].extend(true, {
    compress: {
      html: {},
      javaScript: {}
    },
    context: './',
    extensions: {
      file: ['.js', '.json', '.css', '.svg', '.png', '.jpg', '.gif', '.ico', '.html', '.eot', '.ttf', '.woff', '.woff2'],
      module: []
    },
    module: {
      aliases: {},
      replacements: {}
    },
    compileSteps: 2
  }, this.options || {}, 'query' in this ? loaderUtils.getOptions(this) || {} : {}), /#%%%#/g, '!');

  var compile = function compile(template) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : query.compiler;
    var compileSteps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
    return function () {
      var locals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      options = _clientnode["default"].extend(true, {
        filename: template
      }, options);

      var require = function require(request) {
        var nestedLocals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var template = request.replace(/^(.+)\?[^?]+$/, '$1');
        var queryMatch = request.match(/^[^?]+\?(.+)$/);

        if (queryMatch) {
          var evaluationFunction = function evaluationFunction(request, template, source, compile, locals) {
            return new Function('request', 'template', 'source', 'compile', 'locals', "return ".concat(queryMatch[1]))(request, template, source, compile, locals);
          };

          nestedLocals = _clientnode["default"].extend(true, nestedLocals, evaluationFunction(request, template, source, compile, locals));
        }

        var nestedOptions = _clientnode["default"].copy(options);

        delete nestedOptions.client;
        nestedOptions = _clientnode["default"].extend(true, {
          encoding: _configurator["default"].encoding
        }, nestedOptions, nestedLocals.options || {});
        if (nestedOptions.isString) return compile(template, nestedOptions)(nestedLocals);

        var templateFilePath = _helper["default"].determineModuleFilePath(template, query.module.aliases, query.module.replacements, {
          file: query.extensions.file.internal,
          module: query.extensions.module
        }, query.context, _configurator["default"].path.source.asset.base, _configurator["default"].path.ignore, _configurator["default"].module.directoryNames, _configurator["default"]["package"].main.fileNames, _configurator["default"]["package"].main.propertyNames, _configurator["default"]["package"].aliasPropertyNames, _configurator["default"].encoding);

        if (templateFilePath) {
          if ('query' in _this) _this.addDependency(templateFilePath);
          /*
              NOTE: If there aren't any locals options or variables and
              file doesn't seem to be an ejs template we simply load
              included file content.
          */

          if (queryMatch || templateFilePath.endsWith('.ejs')) return compile(templateFilePath, nestedOptions)(nestedLocals); // IgnoreTypeCheck

          return _fs["default"].readFileSync(templateFilePath, nestedOptions);
        }

        throw new Error("Given template file \"".concat(template, "\" couldn't be resolved."));
      };

      var compressHTML = function compressHTML(content) {
        return query.compress.html ? (0, _htmlMinifier.minify)(content, _clientnode["default"].extend(true, {
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
          // NOTE: Avoids whitespace around placeholder in tags.
          trimCustomFragments: true,
          useShortDoctype: true
        }, query.compress.html)) : content;
      };

      var remainingSteps = compileSteps;
      var result = template;
      var isString = options.isString;
      delete options.isString;

      while (remainingSteps > 0) {
        if (typeof result === 'string') {
          var filePath = isString && options.filename || result;
          if (filePath && _path["default"].extname(filePath) === '.js') result = eval('require')(filePath);else {
            if (!isString) {
              var encoding = _configurator["default"].encoding;
              if ('encoding' in options) encoding = options.encoding;
              result = _fs["default"].readFileSync(result, {
                encoding: encoding
              });
            }

            if (remainingSteps === 1) result = compressHTML(result);
            result = _ejs["default"].compile(result, options);
          }
        } else result = compressHTML(result(_clientnode["default"].extend(true, {
          configuration: _configurator["default"],
          Helper: _helper["default"],
          include: require,
          require: require,
          Tools: _clientnode["default"]
        }, locals)));

        remainingSteps -= 1;
      }

      if (Boolean(compileSteps % 2)) return "'use strict';\n" + (0, _babelCore.transform)("module.exports = ".concat(result.toString(), ";"), {
        ast: false,
        babelrc: false,
        comments: !Boolean(query.compress.javaScript),
        compact: Boolean(query.compress.javaScript),
        filename: options.filename || 'unknown',
        minified: Boolean(query.compress.javaScript),
        plugins: [_babelPluginTransformWith["default"]],
        presets: query.compress.javaScript ? [[_babelPresetMinify["default"], query.compress.javaScript]] : [],
        sourceMaps: false,
        sourceType: 'script'
      }).code;
      result = result // IgnoreTypeCheck
      .replace(new RegExp("<script +processing-workaround *(?:= *(?:\" *\"|' *') *)?>" + '([\\s\\S]*?)</ *script *>', 'ig'), '$1').replace(new RegExp("<script +processing(-+)-workaround *(?:= *(?:\" *\"|' *') *)?" + '>([\\s\\S]*?)</ *script *>', 'ig'), '<script processing$1workaround>$2</script>'); // IgnoreTypeCheck

      return result;
    };
  };

  return compile(source, {
    client: Boolean(query.compileSteps % 2),
    compileDebug: this.debug || false,
    debug: this.debug || false,
    filename: 'query' in this ? loaderUtils.getRemainingRequest(this).replace(/^!/, '') : this.filename || null,
    isString: true
  }, query.compileSteps)(query.locals || {});
}; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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WUFBTixHQUFxQixDQUF0QixDQURuQjtBQUVJLElBQUEsWUFBWSxFQUFFLEtBQUssS0FBTCxJQUFjLEtBRmhDO0FBR0ksSUFBQSxLQUFLLEVBQUUsS0FBSyxLQUFMLElBQWMsS0FIekI7QUFJSSxJQUFBLFFBQVEsRUFBRSxXQUFXLElBQVgsR0FBa0IsV0FBVyxDQUFDLG1CQUFaLENBQ3hCLElBRHdCLEVBRTFCLE9BRjBCLENBRWxCLElBRmtCLEVBRVosRUFGWSxDQUFsQixHQUVZLEtBQUssUUFBTCxJQUFpQixJQU4zQztBQU9JLElBQUEsUUFBUSxFQUFFO0FBUGQsR0FGVSxFQVdWLEtBQUssQ0FBQyxZQVhJLENBQVAsQ0FZTCxLQUFLLENBQUMsTUFBTixJQUFnQixFQVpYLENBQVA7QUFhSCxDQS9NRCxDLENBZ05BO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImVqc0xvYWRlci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnNcbiAgICBuYW1pbmcgMy4wIHVucG9ydGVkIGxpY2Vuc2UuXG4gICAgU2VlIGh0dHBzOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQge3RyYW5zZm9ybSBhcyBiYWJlbFRyYW5zZm9ybX0gZnJvbSAnYmFiZWwtY29yZSdcbmltcG9ydCBiYWJlbE1pbmlmeVByZXNldCBmcm9tICdiYWJlbC1wcmVzZXQtbWluaWZ5J1xuaW1wb3J0IHRyYW5zZm9ybVdpdGggZnJvbSAnYmFiZWwtcGx1Z2luLXRyYW5zZm9ybS13aXRoJ1xuaW1wb3J0IFRvb2xzIGZyb20gJ2NsaWVudG5vZGUnXG5pbXBvcnQgZWpzIGZyb20gJ2VqcydcbmltcG9ydCBmaWxlU3lzdGVtIGZyb20gJ2ZzJ1xuaW1wb3J0IHttaW5pZnkgYXMgbWluaWZ5SFRNTH0gZnJvbSAnaHRtbC1taW5pZmllcidcbmltcG9ydCAqIGFzIGxvYWRlclV0aWxzIGZyb20gJ2xvYWRlci11dGlscydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yLmNvbXBpbGVkJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIHR5cGVzXG50eXBlIFRlbXBsYXRlRnVuY3Rpb24gPSAobG9jYWxzOk9iamVjdCkgPT4gc3RyaW5nXG50eXBlIENvbXBpbGVGdW5jdGlvbiA9IChcbiAgICB0ZW1wbGF0ZTpzdHJpbmcsIG9wdGlvbnM6T2JqZWN0LCBjb21waWxlU3RlcHM/Om51bWJlclxuKSA9PiBUZW1wbGF0ZUZ1bmN0aW9uXG4vLyBlbmRyZWdpb25cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc291cmNlOnN0cmluZyk6c3RyaW5nIHtcbiAgICBpZiAoJ2NhY2hhYmxlJyBpbiB0aGlzICYmIHRoaXMuY2FjaGVhYmxlKVxuICAgICAgICB0aGlzLmNhY2hlYWJsZSgpXG4gICAgY29uc3QgcXVlcnk6T2JqZWN0ID0gVG9vbHMuY29udmVydFN1YnN0cmluZ0luUGxhaW5PYmplY3QoXG4gICAgICAgIFRvb2xzLmV4dGVuZChcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbDoge30sXG4gICAgICAgICAgICAgICAgICAgIGphdmFTY3JpcHQ6IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb250ZXh0OiAnLi8nLFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJy5qcycsICcuanNvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAnLmNzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnLnN2ZycsICcucG5nJywgJy5qcGcnLCAnLmdpZicsICcuaWNvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICcuaHRtbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnLmVvdCcsICcudHRmJywgJy53b2ZmJywgJy53b2ZmMidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBbXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlbWVudHM6IHt9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb21waWxlU3RlcHM6IDJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMgfHwge30sXG4gICAgICAgICAgICAncXVlcnknIGluIHRoaXMgPyBsb2FkZXJVdGlscy5nZXRPcHRpb25zKHRoaXMpIHx8IHt9IDoge31cbiAgICAgICAgKSxcbiAgICAgICAgLyMlJSUjL2csXG4gICAgICAgICchJ1xuICAgIClcbiAgICBjb25zdCBjb21waWxlOkNvbXBpbGVGdW5jdGlvbiA9IChcbiAgICAgICAgdGVtcGxhdGU6c3RyaW5nLFxuICAgICAgICBvcHRpb25zOk9iamVjdCA9IHF1ZXJ5LmNvbXBpbGVyLFxuICAgICAgICBjb21waWxlU3RlcHM6bnVtYmVyID0gMlxuICAgICk6VGVtcGxhdGVGdW5jdGlvbiA9PiAobG9jYWxzOk9iamVjdCA9IHt9KTpzdHJpbmcgPT4ge1xuICAgICAgICBvcHRpb25zID0gVG9vbHMuZXh0ZW5kKHRydWUsIHtmaWxlbmFtZTogdGVtcGxhdGV9LCBvcHRpb25zKVxuICAgICAgICBjb25zdCByZXF1aXJlOkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgcmVxdWVzdDpzdHJpbmcsIG5lc3RlZExvY2FsczpPYmplY3QgPSB7fVxuICAgICAgICApOnN0cmluZyA9PiB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZTpzdHJpbmcgPSByZXF1ZXN0LnJlcGxhY2UoL14oLispXFw/W14/XSskLywgJyQxJylcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5TWF0Y2g6P0FycmF5PHN0cmluZz4gPSByZXF1ZXN0Lm1hdGNoKC9eW14/XStcXD8oLispJC8pXG4gICAgICAgICAgICBpZiAocXVlcnlNYXRjaCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdDpzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOnN0cmluZywgc291cmNlOnN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZTpDb21waWxlRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsczpPYmplY3RcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICApOk9iamVjdCA9PiBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICdyZXF1ZXN0JyxcbiAgICAgICAgICAgICAgICAgICAgJ3RlbXBsYXRlJyxcbiAgICAgICAgICAgICAgICAgICAgJ3NvdXJjZScsXG4gICAgICAgICAgICAgICAgICAgICdjb21waWxlJyxcbiAgICAgICAgICAgICAgICAgICAgJ2xvY2FscycsXG4gICAgICAgICAgICAgICAgICAgIGByZXR1cm4gJHtxdWVyeU1hdGNoWzFdfWBcbiAgICAgICAgICAgICAgICApKHJlcXVlc3QsIHRlbXBsYXRlLCBzb3VyY2UsIGNvbXBpbGUsIGxvY2FscylcbiAgICAgICAgICAgICAgICBuZXN0ZWRMb2NhbHMgPSBUb29scy5leHRlbmQoXG4gICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG5lc3RlZExvY2FscyxcbiAgICAgICAgICAgICAgICAgICAgZXZhbHVhdGlvbkZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCwgdGVtcGxhdGUsIHNvdXJjZSwgY29tcGlsZSwgbG9jYWxzKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBuZXN0ZWRPcHRpb25zOk9iamVjdCA9IFRvb2xzLmNvcHkob3B0aW9ucylcbiAgICAgICAgICAgIGRlbGV0ZSBuZXN0ZWRPcHRpb25zLmNsaWVudFxuICAgICAgICAgICAgbmVzdGVkT3B0aW9ucyA9IFRvb2xzLmV4dGVuZChcbiAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgIHtlbmNvZGluZzogY29uZmlndXJhdGlvbi5lbmNvZGluZ30sXG4gICAgICAgICAgICAgICAgbmVzdGVkT3B0aW9ucyxcbiAgICAgICAgICAgICAgICBuZXN0ZWRMb2NhbHMub3B0aW9ucyB8fCB7fVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaWYgKG5lc3RlZE9wdGlvbnMuaXNTdHJpbmcpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGUodGVtcGxhdGUsIG5lc3RlZE9wdGlvbnMpKG5lc3RlZExvY2FscylcbiAgICAgICAgICAgIGNvbnN0IHRlbXBsYXRlRmlsZVBhdGg6P3N0cmluZyA9IEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICBxdWVyeS5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICBxdWVyeS5tb2R1bGUucmVwbGFjZW1lbnRzLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogcXVlcnkuZXh0ZW5zaW9ucy5maWxlLmludGVybmFsLFxuICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IHF1ZXJ5LmV4dGVuc2lvbnMubW9kdWxlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBxdWVyeS5jb250ZXh0LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5hbGlhc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlRmlsZVBhdGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3F1ZXJ5JyBpbiB0aGlzKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZERlcGVuZGVuY3kodGVtcGxhdGVGaWxlUGF0aClcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBOT1RFOiBJZiB0aGVyZSBhcmVuJ3QgYW55IGxvY2FscyBvcHRpb25zIG9yIHZhcmlhYmxlcyBhbmRcbiAgICAgICAgICAgICAgICAgICAgZmlsZSBkb2Vzbid0IHNlZW0gdG8gYmUgYW4gZWpzIHRlbXBsYXRlIHdlIHNpbXBseSBsb2FkXG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVkIGZpbGUgY29udGVudC5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChxdWVyeU1hdGNoIHx8IHRlbXBsYXRlRmlsZVBhdGguZW5kc1dpdGgoJy5lanMnKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBpbGUodGVtcGxhdGVGaWxlUGF0aCwgbmVzdGVkT3B0aW9ucykoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXN0ZWRMb2NhbHMpXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVTeXN0ZW0ucmVhZEZpbGVTeW5jKHRlbXBsYXRlRmlsZVBhdGgsIG5lc3RlZE9wdGlvbnMpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEdpdmVuIHRlbXBsYXRlIGZpbGUgXCIke3RlbXBsYXRlfVwiIGNvdWxkbid0IGJlIHJlc29sdmVkLmApXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29tcHJlc3NIVE1MOkZ1bmN0aW9uID0gKGNvbnRlbnQ6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgIHF1ZXJ5LmNvbXByZXNzLmh0bWwgPyBtaW5pZnlIVE1MKGNvbnRlbnQsIFRvb2xzLmV4dGVuZChcbiAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZVNlbnNpdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VJbmxpbmVUYWdXaGl0ZXNwYWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZVdoaXRlc3BhY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnNlcnZhdGl2ZUNvbGxhcHNlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtaW5pZnlDU1M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1pbmlmeUpTOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzU2NyaXB0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3RleHQvbmctdGVtcGxhdGUnLCAndGV4dC94LWhhbmRsZWJhcnMtdGVtcGxhdGUnXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUF0dHJpYnV0ZVF1b3RlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQ29tbWVudHM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVJlZHVuZGFudEF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVNjcmlwdFR5cGVBdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVTdHlsZUxpbmtUeXBlQXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc29ydEF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHNvcnRDbGFzc05hbWU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IEF2b2lkcyB3aGl0ZXNwYWNlIGFyb3VuZCBwbGFjZWhvbGRlciBpbiB0YWdzLlxuICAgICAgICAgICAgICAgICAgICB0cmltQ3VzdG9tRnJhZ21lbnRzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB1c2VTaG9ydERvY3R5cGU6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHF1ZXJ5LmNvbXByZXNzLmh0bWxcbiAgICAgICAgICAgICkpIDogY29udGVudFxuICAgICAgICBsZXQgcmVtYWluaW5nU3RlcHM6bnVtYmVyID0gY29tcGlsZVN0ZXBzXG4gICAgICAgIGxldCByZXN1bHQ6VGVtcGxhdGVGdW5jdGlvbnxzdHJpbmcgPSB0ZW1wbGF0ZVxuICAgICAgICBjb25zdCBpc1N0cmluZzpib29sZWFuID0gb3B0aW9ucy5pc1N0cmluZ1xuICAgICAgICBkZWxldGUgb3B0aW9ucy5pc1N0cmluZ1xuICAgICAgICB3aGlsZSAocmVtYWluaW5nU3RlcHMgPiAwKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID0gaXNTdHJpbmcgJiYgb3B0aW9ucy5maWxlbmFtZSB8fCByZXN1bHRcbiAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGggJiYgcGF0aC5leHRuYW1lKGZpbGVQYXRoKSA9PT0gJy5qcycpXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGV2YWwoJ3JlcXVpcmUnKShmaWxlUGF0aClcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1N0cmluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVuY29kaW5nOnN0cmluZyA9IGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgnZW5jb2RpbmcnIGluIG9wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RpbmcgPSBvcHRpb25zLmVuY29kaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBmaWxlU3lzdGVtLnJlYWRGaWxlU3luYyhyZXN1bHQsIHtlbmNvZGluZ30pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ1N0ZXBzID09PSAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY29tcHJlc3NIVE1MKHJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZWpzLmNvbXBpbGUocmVzdWx0LCBvcHRpb25zKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGNvbXByZXNzSFRNTChyZXN1bHQoVG9vbHMuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB7Y29uZmlndXJhdGlvbiwgSGVscGVyLCBpbmNsdWRlOiByZXF1aXJlLCByZXF1aXJlLCBUb29sc30sXG4gICAgICAgICAgICAgICAgICAgIGxvY2Fsc1xuICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgcmVtYWluaW5nU3RlcHMgLT0gMVxuICAgICAgICB9XG4gICAgICAgIGlmIChCb29sZWFuKGNvbXBpbGVTdGVwcyAlIDIpKVxuICAgICAgICAgICAgcmV0dXJuIGAndXNlIHN0cmljdCc7XFxuYCArIGJhYmVsVHJhbnNmb3JtKFxuICAgICAgICAgICAgICAgIGBtb2R1bGUuZXhwb3J0cyA9ICR7cmVzdWx0LnRvU3RyaW5nKCl9O2AsIHtcbiAgICAgICAgICAgICAgICAgICAgYXN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYmFiZWxyYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnRzOiAhQm9vbGVhbihxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICAgICAgY29tcGFjdDogQm9vbGVhbihxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IG9wdGlvbnMuZmlsZW5hbWUgfHwgJ3Vua25vd24nLFxuICAgICAgICAgICAgICAgICAgICBtaW5pZmllZDogQm9vbGVhbihxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0KSxcbiAgICAgICAgICAgICAgICAgICAgcGx1Z2luczogW3RyYW5zZm9ybVdpdGhdLFxuICAgICAgICAgICAgICAgICAgICBwcmVzZXRzOiBxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0ID8gW1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhYmVsTWluaWZ5UHJlc2V0LCBxdWVyeS5jb21wcmVzcy5qYXZhU2NyaXB0XG4gICAgICAgICAgICAgICAgICAgIF1dIDogW10sXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZU1hcHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2VUeXBlOiAnc2NyaXB0J1xuICAgICAgICAgICAgICAgIH0pLmNvZGVcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0XG4gICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgYDxzY3JpcHQgK3Byb2Nlc3Npbmctd29ya2Fyb3VuZCAqKD86PSAqKD86XCIgKlwifCcgKicpICopPz5gICtcbiAgICAgICAgICAgICAgICAnKFtcXFxcc1xcXFxTXSo/KTwvICpzY3JpcHQgKj4nLCAnaWcnXG4gICAgICAgICAgICApLCAnJDEnKVxuICAgICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICBgPHNjcmlwdCArcHJvY2Vzc2luZygtKyktd29ya2Fyb3VuZCAqKD86PSAqKD86XCIgKlwifCcgKicpICopP2AgK1xuICAgICAgICAgICAgICAgICc+KFtcXFxcc1xcXFxTXSo/KTwvICpzY3JpcHQgKj4nLFxuICAgICAgICAgICAgICAgICdpZydcbiAgICAgICAgICAgICksICc8c2NyaXB0IHByb2Nlc3NpbmckMXdvcmthcm91bmQ+JDI8L3NjcmlwdD4nKVxuICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZShcbiAgICAgICAgc291cmNlLFxuICAgICAgICB7XG4gICAgICAgICAgICBjbGllbnQ6IEJvb2xlYW4ocXVlcnkuY29tcGlsZVN0ZXBzICUgMiksXG4gICAgICAgICAgICBjb21waWxlRGVidWc6IHRoaXMuZGVidWcgfHwgZmFsc2UsXG4gICAgICAgICAgICBkZWJ1ZzogdGhpcy5kZWJ1ZyB8fCBmYWxzZSxcbiAgICAgICAgICAgIGZpbGVuYW1lOiAncXVlcnknIGluIHRoaXMgPyBsb2FkZXJVdGlscy5nZXRSZW1haW5pbmdSZXF1ZXN0KFxuICAgICAgICAgICAgICAgIHRoaXNcbiAgICAgICAgICAgICkucmVwbGFjZSgvXiEvLCAnJykgOiB0aGlzLmZpbGVuYW1lIHx8IG51bGwsXG4gICAgICAgICAgICBpc1N0cmluZzogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBxdWVyeS5jb21waWxlU3RlcHNcbiAgICApKHF1ZXJ5LmxvY2FscyB8fCB7fSlcbn1cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19