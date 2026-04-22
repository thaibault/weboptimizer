#!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module weboptimizer */
'use strict';

/* !
    region header
    [Project page](https://torben.website/webOptimizer)

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
exports.log = exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _child_process = require("child_process");
var _clientnode = require("clientnode");
var _fs = require("fs");
var _promises = require("fs/promises");
var _globAll = require("glob-all");
var _path = _interopRequireWildcard(require("path"));
var _rimraf = require("rimraf");
var _configurator = require("./configurator");
var _helper = require("./helper");
var _process$env$NODE_ENV;
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t9 in e) "default" !== _t9 && {}.hasOwnProperty.call(e, _t9) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t9)) && (i.get || i.set) ? o(f, _t9, i) : f[_t9] = e[_t9]); return f; })(e, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// endregion
var log = exports.log = new _clientnode.Logger({
  name: 'weboptimizer-main-logger'
});
_clientnode.Logger.configureAllInstances({
  level: ['debug', 'development'].includes((_process$env$NODE_ENV = process.env.NODE_ENV) !== null && _process$env$NODE_ENV !== void 0 ? _process$env$NODE_ENV : '') ? 'debug' : 'warn'
});
// NOTE: Environment variables can only be strings.
process.env.UV_THREADPOOL_SIZE = '128';
/**
 * Main entry point.
 * @param context - Location from where to build current application.
 * @param currentWorkingDirectory - Current working directory to use as
 * reference.
 * @param commandLineArguments - Arguments to take into account.
 * @param webOptimizerPath - Current optimizer context path.
 * @param environment - Environment variables to take into account.
 * @returns Nothing.
 */
var main = function main(context) {
  try {
    var currentWorkingDirectory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.cwd();
    var commandLineArguments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : process.argv;
    var webOptimizerPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : __dirname;
    var environment = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : eval('process.env');
    return (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var configuration, clear, processOptions, childProcessOptions, childProcesses, processPromises, possibleArguments, closeEventHandlers, dynamicConfiguration, count, filePath, additionalArguments, _iterator, _step, file, _iterator2, _step2, _filePath, buildConfigurations, tidiedUp, tidyUp, testModuleFilePaths, _iterator7, _step7, buildConfiguration, expression, _iterator8, _step8, _loop, handleTask, finished, closeHandler, _iterator1, _step1, closeEventName, _t3, _t4, _t5, _t6, _t7, _t8;
      return _regenerator["default"].wrap(function (_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            if (environment.PATH && !environment.PATH.includes(':node_modules/.bin')) environment.PATH += ':node_modules/.bin';else environment.PATH = 'node_modules/.bin';
            configuration = (0, _configurator.load)(context, currentWorkingDirectory, commandLineArguments, webOptimizerPath, environment);
            clear = (0, _clientnode.NOOP)();
            _context3.prev = 1;
            // region controller
            processOptions = {
              cwd: configuration.path.context,
              env: environment
            };
            childProcessOptions = _objectSpread({
              shell: true,
              stdio: 'inherit'
            }, processOptions);
            childProcesses = [];
            processPromises = [];
            possibleArguments = ['build', 'build:types', 'check:types', 'clear', 'document', 'lint', 'preinstall', 'serve', 'test', 'test:browser', 'test:coverage', 'test:coverage:report', 'watch'];
            closeEventHandlers = [];
            if (!(configuration.givenCommandLineArguments.length > 2)) {
              _context3.next = 37;
              break;
            }
            // region temporary save dynamically given configurations
            // NOTE: We need a copy of given arguments array.
            dynamicConfiguration = {
              givenCommandLineArguments: configuration.givenCommandLineArguments.slice()
            };
            if (configuration.givenCommandLineArguments.length > 3 && (0, _clientnode.parseEncodedObject)(configuration.givenCommandLineArguments[configuration.givenCommandLineArguments.length - 1], configuration, 'configuration')) configuration.givenCommandLineArguments.pop();
            count = 0;
            filePath = (0, _path.resolve)(configuration.path.context, ".dynamicConfiguration-".concat(String(count), ".json"));
          case 2:
            if (!(count < _clientnode.MAXIMAL_NUMBER_OF_ITERATIONS.value)) {
              _context3.next = 5;
              break;
            }
            filePath = (0, _path.resolve)(configuration.path.context, ".dynamicConfiguration-".concat(String(count), ".json"));
            _context3.next = 3;
            return (0, _clientnode.isFile)(filePath);
          case 3:
            if (_context3.sent) {
              _context3.next = 4;
              break;
            }
            return _context3.abrupt("continue", 5);
          case 4:
            count++;
            _context3.next = 2;
            break;
          case 5:
            _context3.next = 6;
            return (0, _promises.writeFile)(filePath, JSON.stringify(dynamicConfiguration));
          case 6:
            additionalArguments = commandLineArguments.splice(3); /// region register exit handler to tidy up
            clear = function clear(error) {
              // NOTE: Close handler have to be synchronous.
              if ((0, _clientnode.isFileSync)(filePath)) (0, _fs.unlinkSync)(filePath);
              if (error) throw error;
            };
            closeEventHandlers.push(clear);
            /// endregion
            // endregion
            // region handle clear
            /*
                NOTE: Some tasks could depend on previously created artefacts
                packages so a preceding clear should not be performed in that
                cases.
                NOTE: If we have a dependency cycle we need to preserve files
                during pre-install phase.
            */
            if (!(possibleArguments.includes(configuration.givenCommandLineArguments[2]) && (!['build', 'build:types', 'lint', 'preinstall', 'test', 'test:browser', 'test:coverage', 'test:coverage:report', 'serve', 'watch'].includes(configuration.givenCommandLineArguments[2]) ||
            /*
                NOTE: If target artefacts are located next to their
                source files, we need to clear them first when running
                dev mode (watching source files and reloading build
                automatically).
            */
            ['serve', 'watch'].includes(configuration.givenCommandLineArguments[2]) && configuration.path.source.base === configuration.path.target.base))) {
              _context3.next = 20;
              break;
            }
            if (!((0, _path.resolve)(configuration.path.target.base) === (0, _path.resolve)(configuration.path.context))) {
              _context3.next = 16;
              break;
            }
            _context3.next = 7;
            return (0, _clientnode.walkDirectoryRecursively)(configuration.path.target.base, /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee(file) {
                var type, _file$stats, _t, _t2;
                return _regenerator["default"].wrap(function (_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      if (!(0, _helper.isFilePathInLocation)(file.path, configuration.path.ignore.concat(configuration.module.directoryNames, configuration.loader.directoryNames).map(function (filePath) {
                        return (0, _path.resolve)(configuration.path.context, filePath);
                      }).filter(function (filePath) {
                        return !configuration.path.context.startsWith(filePath);
                      }))) {
                        _context.next = 1;
                        break;
                      }
                      return _context.abrupt("return", false);
                    case 1:
                      _t = _regenerator["default"].keys(configuration.buildContext.types);
                    case 2:
                      if ((_t2 = _t()).done) {
                        _context.next = 7;
                        break;
                      }
                      type = _t2.value;
                      if (!new RegExp(configuration.buildContext.types[type].filePathPattern).test(file.path)) {
                        _context.next = 6;
                        break;
                      }
                      if (!((_file$stats = file.stats) !== null && _file$stats !== void 0 && _file$stats.isDirectory())) {
                        _context.next = 4;
                        break;
                      }
                      _context.next = 3;
                      return (0, _rimraf.rimraf)(file.path);
                    case 3:
                      return _context.abrupt("return", false);
                    case 4:
                      _context.next = 5;
                      return (0, _promises.unlink)(file.path);
                    case 5:
                      return _context.abrupt("continue", 7);
                    case 6:
                      _context.next = 2;
                      break;
                    case 7:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              }));
              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }());
          case 7:
            _t3 = _createForOfIteratorHelper;
            _context3.next = 8;
            return (0, _clientnode.walkDirectoryRecursively)(configuration.path.target.base, function () {
              return false;
            }, configuration.encoding);
          case 8:
            _iterator = _t3(_context3.sent);
            _context3.prev = 9;
            _iterator.s();
          case 10:
            if ((_step = _iterator.n()).done) {
              _context3.next = 12;
              break;
            }
            file = _step.value;
            if (!file.name.startsWith('npm-debug')) {
              _context3.next = 11;
              break;
            }
            _context3.next = 11;
            return (0, _promises.unlink)(file.path);
          case 11:
            _context3.next = 10;
            break;
          case 12:
            _context3.next = 14;
            break;
          case 13:
            _context3.prev = 13;
            _t4 = _context3["catch"](9);
            _iterator.e(_t4);
          case 14:
            _context3.prev = 14;
            _iterator.f();
            return _context3.finish(14);
          case 15:
            _context3.next = 17;
            break;
          case 16:
            _context3.next = 17;
            return (0, _rimraf.rimraf)(configuration.path.target.base);
          case 17:
            _context3.next = 18;
            return (0, _clientnode.isDirectory)(configuration.path.apiDocumentation);
          case 18:
            if (!_context3.sent) {
              _context3.next = 19;
              break;
            }
            _context3.next = 19;
            return (0, _rimraf.rimraf)(configuration.path.apiDocumentation);
          case 19:
            _iterator2 = _createForOfIteratorHelper(configuration.path.tidyUpOnClear);
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                _filePath = _step2.value;
                if (_filePath) if ((0, _clientnode.isFileSync)(_filePath))
                  // NOTE: Close handler have to be synchronous.
                  (0, _fs.unlinkSync)(_filePath);else if ((0, _clientnode.isDirectorySync)(_filePath)) (0, _rimraf.sync)(_filePath);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
            (0, _rimraf.sync)((0, _globAll.sync)(configuration.path.tidyUpOnClearGlobs));
          case 20:
            // endregion
            // region handle build
            buildConfigurations = (0, _helper.resolveBuildConfigurationFilePaths)(configuration.buildContext.types, configuration.path.source.asset.base, configuration.path.ignore.concat(configuration.module.directoryNames, configuration.loader.directoryNames).map(function (filePath) {
              return (0, _path.resolve)(configuration.path.context, filePath);
            }).filter(function (filePath) {
              return !configuration.path.context.startsWith(filePath);
            }), configuration["package"].main.fileNames);
            if (!['build', 'document', 'test', 'test:coverage', 'test:coverage:report'].includes(commandLineArguments[2])) {
              _context3.next = 21;
              break;
            }
            tidiedUp = false;
            tidyUp = function tidyUp() {
              /*
                  Determines all none javaScript entities which have been
                  emitted as single module to remove.
              */
              if (tidiedUp) return;
              tidiedUp = true;
              for (var _i = 0, _Object$entries = Object.entries(configuration.injection.entry.normalized); _i < _Object$entries.length; _i++) {
                var _Object$entries$_i = (0, _slicedToArray2["default"])(_Object$entries[_i], 2),
                  chunkName = _Object$entries$_i[0],
                  chunk = _Object$entries$_i[1];
                var _iterator3 = _createForOfIteratorHelper(chunk),
                  _step3;
                try {
                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                    var moduleID = _step3.value;
                    var _filePath2 = (0, _helper.determineModuleFilePath)(moduleID, configuration.module.aliases, configuration.module.replacements.normal, {
                      file: configuration.extensions.file.internal
                    }, configuration.path.context, configuration.path.source.asset.base, configuration.path.ignore, configuration.module.directoryNames, configuration["package"].main.fileNames, configuration["package"].main.propertyNames, configuration["package"].aliasPropertyNames, configuration.encoding);
                    var type = null;
                    if (_filePath2) type = (0, _helper.determineAssetType)(_filePath2, configuration.buildContext.types, configuration.path);
                    if (typeof type === 'string' && Object.prototype.hasOwnProperty.call(configuration.buildContext.types, type)) {
                      var _filePath3 = (0, _helper.renderFilePathTemplate)((0, _helper.stripLoader)(configuration.files.compose.javaScript), {
                        '[name]': chunkName
                      });
                      /*
                          NOTE: Close handler have to be
                          synchronous.
                      */
                      if (configuration.buildContext.types[type].outputExtension === 'js' && (0, _clientnode.isFileSync)(_filePath3)) (0, _fs.chmodSync)(_filePath3, '755');
                    }
                  }
                } catch (err) {
                  _iterator3.e(err);
                } finally {
                  _iterator3.f();
                }
              }
              var _iterator4 = _createForOfIteratorHelper(configuration.path.tidyUp),
                _step4;
              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var _filePath4 = _step4.value;
                  if (_filePath4) if ((0, _clientnode.isFileSync)(_filePath4))
                    // NOTE: Close handler have to be synchronous.
                    (0, _fs.unlinkSync)(_filePath4);else if ((0, _clientnode.isDirectorySync)(_filePath4)) (0, _rimraf.sync)(_filePath4);
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
              (0, _rimraf.sync)((0, _globAll.sync)(configuration.path.tidyUpGlobs));
            };
            closeEventHandlers.push(tidyUp);

            /*
                Triggers complete asset compiling and bundles them into the
                final productive output.
            */
            processPromises.push(new Promise(function (resolve, reject) {
              var commandLineArguments = (configuration.commandLine.build.arguments || []).concat(additionalArguments);
              log.info('Running "' + ("".concat(configuration.commandLine.build.command, " ") + commandLineArguments.join(' ')).trim() + '"');

              /*
                  NOTE: Take current weboptimizer's dependencies into
                  account.
              */
              if (!childProcessOptions.env) childProcessOptions.env = {};
              if (typeof childProcessOptions.env.PATH !== 'string') childProcessOptions.env.PATH = '';
              childProcessOptions.env.PATH += ": ".concat(webOptimizerPath, "/node_modules/.bin");
              var childProcess = (0, _child_process.spawn)(configuration.commandLine.build.command, commandLineArguments, childProcessOptions);
              var copyAdditionalFilesAndTidyUp = function copyAdditionalFilesAndTidyUp() {
                var _iterator5 = _createForOfIteratorHelper(configuration.files.additionalPaths),
                  _step5;
                try {
                  for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                    var _filePath5 = _step5.value;
                    var sourcePath = (0, _path.join)(configuration.path.source.base, _filePath5);
                    var targetPath = (0, _path.join)(configuration.path.target.base, _filePath5);

                    // NOTE: Close handler have to be synchronous.
                    if ((0, _clientnode.isDirectorySync)(sourcePath)) {
                      if ((0, _clientnode.isDirectorySync)(targetPath)) (0, _rimraf.sync)(targetPath);
                      (0, _clientnode.copyDirectoryRecursiveSync)(sourcePath, targetPath);
                    } else if ((0, _clientnode.isFileSync)(sourcePath)) (0, _clientnode.copyFileSync)(sourcePath, targetPath);
                  }
                } catch (err) {
                  _iterator5.e(err);
                } finally {
                  _iterator5.f();
                }
                tidyUp();
              };
              var closeHandler = (0, _clientnode.getProcessCloseHandler)(resolve, reject, null, commandLineArguments[2] === 'build' ? copyAdditionalFilesAndTidyUp : tidyUp);
              var _iterator6 = _createForOfIteratorHelper(_clientnode.CLOSE_EVENT_NAMES),
                _step6;
              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  var closeEventName = _step6.value;
                  childProcess.on(closeEventName, closeHandler);
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
              childProcesses.push(childProcess);
              return childProcesses;
            }));
            // endregion
            // region handle pre-install
            _context3.next = 34;
            break;
          case 21:
            if (!(configuration.library && configuration.givenCommandLineArguments[2] === 'preinstall')) {
              _context3.next = 34;
              break;
            }
            // Perform all file specific preprocessing stuff.
            testModuleFilePaths = [];
            if ((0, _clientnode.isPlainObject)(configuration['test:browser'].injection) && configuration['test:browser'].injection.entry) testModuleFilePaths = (0, _helper.determineModuleLocations)(configuration['test:browser'].injection.entry, configuration.module.aliases, configuration.module.replacements.normal, {
              file: configuration.extensions.file.internal
            }, configuration.path.context, configuration.path.source.asset.base, configuration.path.ignore).filePaths;
            _iterator7 = _createForOfIteratorHelper(buildConfigurations);
            _context3.prev = 22;
            _iterator7.s();
          case 23:
            if ((_step7 = _iterator7.n()).done) {
              _context3.next = 31;
              break;
            }
            buildConfiguration = _step7.value;
            expression = buildConfiguration[configuration.givenCommandLineArguments[2]].trim();
            _iterator8 = _createForOfIteratorHelper(buildConfiguration.filePaths);
            _context3.prev = 24;
            _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
              var filePath, evaluated;
              return _regenerator["default"].wrap(function (_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    filePath = _step8.value;
                    if (testModuleFilePaths.includes(filePath)) {
                      _context2.next = 2;
                      break;
                    }
                    evaluated = (0, _clientnode.evaluate)("`".concat(expression, "`"), {
                      global: global,
                      self: configuration,
                      buildConfiguration: buildConfiguration,
                      path: _path["default"],
                      additionalArguments: additionalArguments,
                      filePath: filePath
                    });
                    if (!evaluated.error) {
                      _context2.next = 1;
                      break;
                    }
                    throw new Error('Error occurred during processing given ' + "command: ".concat(evaluated.error));
                  case 1:
                    log.info("Running \"".concat(evaluated.result, "\""));
                    processPromises.push(new Promise(function (resolve, reject) {
                      return [(0, _clientnode.handleChildProcess)((0, _child_process.exec)(evaluated.result, _objectSpread({
                        encoding: configuration.encoding
                      }, processOptions), function (error) {
                        if (error) reject(error);else resolve({
                          reason: 'Finished.',
                          parameters: []
                        });
                      }))];
                    }));
                  case 2:
                  case "end":
                    return _context2.stop();
                }
              }, _loop);
            });
            _iterator8.s();
          case 25:
            if ((_step8 = _iterator8.n()).done) {
              _context3.next = 27;
              break;
            }
            return _context3.delegateYield(_loop(), "t0", 26);
          case 26:
            _context3.next = 25;
            break;
          case 27:
            _context3.next = 29;
            break;
          case 28:
            _context3.prev = 28;
            _t5 = _context3["catch"](24);
            _iterator8.e(_t5);
          case 29:
            _context3.prev = 29;
            _iterator8.f();
            return _context3.finish(29);
          case 30:
            _context3.next = 23;
            break;
          case 31:
            _context3.next = 33;
            break;
          case 32:
            _context3.prev = 32;
            _t6 = _context3["catch"](22);
            _iterator7.e(_t6);
          case 33:
            _context3.prev = 33;
            _iterator7.f();
            return _context3.finish(33);
          case 34:
            // endregion
            // region handle remaining tasks
            handleTask = function handleTask(type) {
              var tasks = Array.isArray(configuration.commandLine[type]) ? configuration.commandLine[type] : [configuration.commandLine[type]];
              var _iterator9 = _createForOfIteratorHelper(tasks),
                _step9;
              try {
                var _loop2 = function _loop2() {
                  var task = _step9.value;
                  var evaluated = (0, _clientnode.evaluate)(Object.prototype.hasOwnProperty.call(task, 'indicator') ? task.indicator : 'true', {
                    global: global,
                    self: configuration,
                    path: _path["default"]
                  });
                  if (evaluated.error) throw new Error('Error occurred during processing given task: ' + evaluated.error);
                  if (evaluated.result) processPromises.push(new Promise(function (resolve, reject) {
                    var commandLineArguments = (task.arguments || []).concat(additionalArguments);
                    log.info('Running "' + ("".concat(task.command, " ") + commandLineArguments.join(' ')).trim() + '"');
                    var childProcess = (0, _child_process.spawn)(task.command, commandLineArguments, childProcessOptions);
                    var closeHandler = (0, _clientnode.getProcessCloseHandler)(resolve, reject);
                    var _iterator0 = _createForOfIteratorHelper(_clientnode.CLOSE_EVENT_NAMES),
                      _step0;
                    try {
                      for (_iterator0.s(); !(_step0 = _iterator0.n()).done;) {
                        var closeEventName = _step0.value;
                        childProcess.on(closeEventName, closeHandler);
                      }
                    } catch (err) {
                      _iterator0.e(err);
                    } finally {
                      _iterator0.f();
                    }
                    childProcesses.push(childProcess);
                    return childProcesses;
                  }));
                };
                for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                  _loop2();
                }
              } catch (err) {
                _iterator9.e(err);
              } finally {
                _iterator9.f();
              }
            }; /// region a-/synchronous
            if (!['document', 'test', 'test:coverage', 'test:coverage:report'].includes(configuration.givenCommandLineArguments[2])) {
              _context3.next = 36;
              break;
            }
            _context3.next = 35;
            return Promise.all(processPromises);
          case 35:
            handleTask(configuration.givenCommandLineArguments[2]);
            _context3.next = 37;
            break;
          case 36:
            if (['build:types', 'check:types', 'lint', 'serve', 'test:browser'].includes(configuration.givenCommandLineArguments[2])) handleTask(configuration.givenCommandLineArguments[2]);
          case 37:
            finished = false;
            closeHandler = function closeHandler() {
              if (!finished) for (var _i2 = 0, _closeEventHandlers = closeEventHandlers; _i2 < _closeEventHandlers.length; _i2++) {
                var closeEventHandler = _closeEventHandlers[_i2];
                closeEventHandler.apply(void 0, arguments);
              }
              finished = true;
            };
            _iterator1 = _createForOfIteratorHelper(_clientnode.CLOSE_EVENT_NAMES);
            try {
              for (_iterator1.s(); !(_step1 = _iterator1.n()).done;) {
                closeEventName = _step1.value;
                process.on(closeEventName, closeHandler);
              }
            } catch (err) {
              _iterator1.e(err);
            } finally {
              _iterator1.f();
            }
            if (require.main === module && (configuration.givenCommandLineArguments.length < 3 || !possibleArguments.includes(configuration.givenCommandLineArguments[2]))) log.info("Give one of \"".concat(possibleArguments.join('", "'), "\" as command"), 'line argument. You can provide a json string as second', 'parameter to dynamically overwrite some configurations.\n');
            // endregion
            // region forward nested return codes
            _context3.prev = 38;
            _context3.next = 39;
            return Promise.all(processPromises);
          case 39:
            _context3.next = 41;
            break;
          case 40:
            _context3.prev = 40;
            _t7 = _context3["catch"](38);
            log.error(_t7);
            process.exit(_t7.returnCode);
          case 41:
            _context3.next = 44;
            break;
          case 42:
            _context3.prev = 42;
            _t8 = _context3["catch"](1);
            if (!configuration.debug) {
              _context3.next = 43;
              break;
            }
            throw _t8;
          case 43:
            log.error(_t8);
          case 44:
            return _context3.abrupt("return", clear);
          case 45:
          case "end":
            return _context3.stop();
        }
      }, _callee2, null, [[1, 42], [9, 13, 14, 15], [22, 32, 33, 34], [24, 28, 29, 30], [38, 40]]);
    }))();
  } catch (e) {
    return Promise.reject(e);
  }
};
if (require.main === module) void main();
var _default = exports["default"] = main;
