etermines all none javaScript entities which have been
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
                    var _filePath2 = _helper["default"].determineModuleFilePath(moduleID, configuration.module.aliases, configuration.module.replacements.normal, {
                      file: configuration.extensions.file.internal
                    }, configuration.path.context, configuration.path.source.asset.base, configuration.path.ignore, configuration.module.directoryNames, configuration["package"].main.fileNames, configuration["package"].main.propertyNames, configuration["package"].aliasPropertyNames, configuration.encoding);
                    var type = null;
                    if (_filePath2) type = _helper["default"].determineAssetType(_filePath2, configuration.buildContext.types, configuration.path);
                    if (typeof type === 'string' && configuration.buildContext.types[type]) {
                      var _filePath3 = _helper["default"].renderFilePathTemplate(_helper["default"].stripLoader(configuration.files.compose.javaScript), {
                        '[name]': chunkName
                      });
                      /*
                          NOTE: Close handler have to be
                          synchronous.
                      */
                      if (configuration.buildContext.types[type].outputExtension === 'js' && _clientnode["default"].isFileSync(_filePath3)) (0, _fs.chmodSync)(_filePath3, '755');
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
                  if (_filePath4) if (_clientnode["default"].isFileSync(_filePath4))
                    // NOTE: Close handler have to be synchronous.
                    (0, _fs.unlinkSync)(_filePath4);else if (_clientnode["default"].isDirectorySync(_filePath4)) (0, _rimraf.sync)(_filePath4);
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
              console.info('Running "' + ("".concat(configuration.commandLine.build.command, " ") + commandLineArguments.join(' ')).trim() + '"');

              /*
                  NOTE: Take current weboptimizer's dependencies into
                  account.
              */
              childProcessOptions.env.PATH += ":".concat(webOptimizerPath, "/node_modules/.bin");
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
                    if (_clientnode["default"].isDirectorySync(sourcePath)) {
                      if (_clientnode["default"].isDirectorySync(targetPath)) (0, _rimraf.sync)(targetPath);
                      _clientnode["default"].copyDirectoryRecursiveSync(sourcePath, targetPath);
                    } else if (_clientnode["default"].isFileSync(sourcePath)) _clientnode["default"].copyFileSync(sourcePath, targetPath);
                  }
                } catch (err) {
                  _iterator5.e(err);
                } finally {
                  _iterator5.f();
                }
                tidyUp();
              };
              var closeHandler = _clientnode["default"].getProcessCloseHandler(resolve, reject, null, commandLineArguments[2] === 'build' ? copyAdditionalFilesAndTidyUp : tidyUp);
              var _iterator6 = _createForOfIteratorHelper(_clientnode.CloseEventNames),
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
            _context3.next = 109;
            break;
          case 74:
            if (!(configuration.library && configuration.givenCommandLineArguments[2] === 'preinstall')) {
              _context3.next = 109;
              break;
            }
            // Perform all file specific preprocessing stuff.
            testModuleFilePaths = [];
            if (_clientnode["default"].isPlainObject(configuration['test:browser'].injection) && configuration['test:browser'].injection.entry) testModuleFilePaths = _helper["default"].determineModuleLocations(configuration['test:browser'].injection.entry, configuration.module.aliases, configuration.module.replacements.normal, {
              file: configuration.extensions.file.internal
            }, configuration.path.context, configuration.path.source.asset.base, configuration.path.ignore).filePaths;
            _iterator7 = _createForOfIteratorHelper(buildConfigurations);
            _context3.prev = 78;
            _iterator7.s();
          case 80:
            if ((_step7 = _iterator7.n()).done) {
              _context3.next = 101;
              break;
            }
            buildConfiguration = _step7.value;
            expression = buildConfiguration[configuration.givenCommandLineArguments[2]].trim();
            _iterator8 = _createForOfIteratorHelper(buildConfiguration.filePaths);
            _context3.prev = 84;
            _loop = /*#__PURE__*/_regenerator["default"].mark(function _loop() {
              var filePath, evaluated;
              return _regenerator["default"].wrap(function _loop$(_context2) {
                while (1) switch (_context2.prev = _context2.next) {
                  case 0:
                    filePath = _step8.value;
                    if (testModuleFilePaths.includes(filePath)) {
                      _context2.next = 7;
                      break;
                    }
                    evaluated = _clientnode["default"].stringEvaluate("`".concat(expression, "`"), {
                      global: global,
                      self: configuration,
                      buildConfiguration: buildConfiguration,
                      path: _path["default"],
                      additionalArguments: additionalArguments,
                      filePath: filePath
                    });
                    if (!evaluated.error) {
                      _context2.next = 5;
                      break;
                    }
                    throw new Error('Error occurred during processing given ' + "command: ".concat(evaluated.error));
                  case 5:
                    console.info("Running \"".concat(evaluated.result, "\""));
                    processPromises.push(new Promise(function (resolve, reject) {
                      return [_clientnode["default"].handleChildProcess((0, _child_process.exec)(evaluated.result, _objectSpread({
                        encoding: configuration.encoding
                      }, processOptions), function (error) {
                        return error ? reject(error) : resolve({
                          reason: 'Finished.',
                          parameters: []
                        });
                      }))];
                    }));
                  case 7:
                  case "end":
                    return _context2.stop();
                }
              }, _loop);
            });
            _iterator8.s();
          case 87:
            if ((_step8 = _iterator8.n()).done) {
              _context3.next = 91;
              break;
            }
            return _context3.delegateYield(_loop(), "t3", 89);
          case 89:
            _context3.next = 87;
            break;
          case 91:
            _context3.next = 96;
            break;
          case 93:
            _context3.prev = 93;
            _context3.t4 = _context3["catch"](84);
            _iterator8.e(_context3.t4);
          case 96:
            _context3.prev = 96;
            _iterator8.f();
            return _context3.finish(96);
          case 99:
            _context3.next = 80;
            break;
          case 101:
            _context3.next = 106;
            break;
          case 103:
            _context3.prev = 103;
            _context3.t5 = _context3["catch"](78);
            _iterator7.e(_context3.t5);
          case 106:
            _context3.prev = 106;
            _iterator7.f();
            return _context3.finish(106);
          case 109:
            // endregion
            // region handle remaining tasks
            handleTask = function handleTask(type) {
              var tasks = Array.isArray(configuration.commandLine[type]) ? configuration.commandLine[type] : [configuration.commandLine[type]];
              var _iterator9 = _createForOfIteratorHelper(tasks),
                _step9;
              try {
                var _loop2 = function _loop2() {
                  var task = _step9.value;
                  var evaluated = _clientnode["default"].stringEvaluate(Object.prototype.hasOwnProperty.call(task, 'indicator') ? task.indicator : 'true', {
                    global: global,
                    self: configuration,
                    path: _path["default"]
                  });
                  if (evaluated.error) throw new Error('Error occurred during processing given task: ' + evaluated.error);
                  if (evaluated.result) processPromises.push(new Promise(function (resolve, reject) {
                    var commandLineArguments = (task.arguments || []).concat(additionalArguments);
                    console.info('Running "' + ("".concat(task.command, " ") + commandLineArguments.join(' ')).trim() + '"');
                    var childProcess = (0, _child_process.spawn)(task.command, commandLineArguments, childProcessOptions);
                    var closeHandler = _clientnode["default"].getProcessCloseHandler(resolve, reject);
                    var _iterator10 = _createForOfIteratorHelper(_clientnode.CloseEventNames),
                      _step10;
                    try {
                      for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                        var closeEventName = _step10.value;
                        childProcess.on(closeEventName, closeHandler);
                      }
                    } catch (err) {
                      _iterator10.e(err);
                    } finally {
                      _iterator10.f();
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
              _context3.next = 116;
              break;
            }
            _context3.next = 113;
            return Promise.all(processPromises);
          case 113:
            handleTask(configuration.givenCommandLineArguments[2]);
            _context3.next = 117;
            break;
          case 116:
            if (['build:types', 'check:types', 'lint', 'serve', 'test:browser'].includes(configuration.givenCommandLineArguments[2])) handleTask(configuration.givenCommandLineArguments[2]);
          case 117:
            finished = false;
            closeHandler = function closeHandler() {
              if (!finished) for (var _i2 = 0, _closeEventHandlers = closeEventHandlers; _i2 < _closeEventHandlers.length; _i2++) {
                var closeEventHandler = _closeEventHandlers[_i2];
                closeEventHandler.apply(void 0, arguments);
              }
              finished = true;
            };
            _iterator11 = _createForOfIteratorHelper(_clientnode.CloseEventNames);
            try {
              for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                closeEventName = _step11.value;
                process.on(closeEventName, closeHandler);
              }
            } catch (err) {
              _iterator11.e(err);
            } finally {
              _iterator11.f();
            }
            if (require.main === module && (configuration.givenCommandLineArguments.length < 3 || !possibleArguments.includes(configuration.givenCommandLineArguments[2]))) console.info("Give one of \"".concat(possibleArguments.join('", "'), "\" as command ") + 'line argument. You can provide a json string as second ' + 'parameter to dynamically overwrite some configurations.\n');
            // endregion
            // region forward nested return codes
            _context3.prev = 122;
            _context3.next = 125;
            return Promise.all(processPromises);
          case 125:
            _context3.next = 131;
            break;
          case 127:
            _context3.prev = 127;
            _context3.t6 = _context3["catch"](122);
            console.error(_context3.t6);
            process.exit(_context3.t6.returnCode);
          case 131:
            _context3.next = 140;
            break;
          case 133:
            _context3.prev = 133;
            _context3.t7 = _context3["catch"](2);
            if (!configuration.debug) {
              _context3.next = 139;
              break;
            }
            throw _context3.t7;
          case 139:
            console.error(_context3.t7);
          case 140:
            return _context3.abrupt("return", clear);
          case 141:
          case "end":
            return _context3.stop();
        }
      }, _callee2, null, [[2, 133], [37, 48, 51, 54], [78, 103, 106, 109], [84, 93, 96, 99], [122, 127]]);
    }))();
  } catch (e) {
    return Promise.reject(e);
  }
};
if (require.main === module) void main();
var _default = exports["default"] = main; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
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
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _child_process = require("child_process");
var _clientnode = _interopRequireWildcard(require("clientnode"));
var _fs = require("fs");
var _promises = require("fs/promises");
var _globAll = require("glob-all");
var _path = _interopRequireWildcard(require("path"));
var _rimraf = require("rimraf");
var _configurator = require("./configurator");
var _helper = _interopRequireDefault(require("./helper"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2["default"])(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// endregion
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
 *
 * @returns Nothing.
 */
var main = function main(context) {
  try {
    var currentWorkingDirectory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : process.cwd();
    var commandLineArguments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : process.argv;
    var webOptimizerPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : __dirname;
    var environment = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : eval('process.env');
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var configuration, clear, processOptions, childProcessOptions, childProcesses, processPromises, possibleArguments, closeEventHandlers, dynamicConfiguration, count, filePath, additionalArguments, _iterator, _step, file, _iterator2, _step2, _filePath, buildConfigurations, tidiedUp, tidyUp, testModuleFilePaths, _iterator7, _step7, buildConfiguration, expression, _iterator8, _step8, _loop, handleTask, finished, closeHandler, _iterator11, _step11, closeEventName;
      return _regenerator["default"].wrap(function _callee2$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            configuration = (0, _configurator.load)(context, currentWorkingDirectory, commandLineArguments, webOptimizerPath, environment);
            clear = _clientnode["default"].noop();
            _context3.prev = 2;
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
            possibleArguments = ['build', 'build:types', 'clear', 'document', 'lint', 'preinstall', 'serve', 'test', 'test:browser', 'test:coverage', 'test:coverage:report', 'check:types'];
            closeEventHandlers = [];
            if (!(configuration.givenCommandLineArguments.length > 2)) {
              _context3.next = 117;
              break;
            }
            // region temporary save dynamically given configurations
            // NOTE: We need a copy of given arguments array.
            dynamicConfiguration = {
              givenCommandLineArguments: configuration.givenCommandLineArguments.slice()
            };
            if (configuration.givenCommandLineArguments.length > 3 && _clientnode["default"].stringParseEncodedObject(configuration.givenCommandLineArguments[configuration.givenCommandLineArguments.length - 1], configuration, 'configuration')) configuration.givenCommandLineArguments.pop();
            count = 0;
            filePath = (0, _path.resolve)(configuration.path.context, ".dynamicConfiguration-".concat(count, ".json"));
          case 14:
            if (!true) {
              _context3.next = 23;
              break;
            }
            filePath = (0, _path.resolve)(configuration.path.context, ".dynamicConfiguration-".concat(count, ".json"));
            _context3.next = 18;
            return _clientnode["default"].isFile(filePath);
          case 18:
            if (_context3.sent) {
              _context3.next = 20;
              break;
            }
            return _context3.abrupt("break", 23);
          case 20:
            count += 1;
            _context3.next = 14;
            break;
          case 23:
            _context3.next = 25;
            return (0, _promises.writeFile)(filePath, JSON.stringify(dynamicConfiguration));
          case 25:
            additionalArguments = commandLineArguments.splice(3); /// region register exit handler to tidy up
            clear = function clear(error) {
              // NOTE: Close handler have to be synchronous.
              if (_clientnode["default"].isFileSync(filePath)) (0, _fs.unlinkSync)(filePath);
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
            if (!(!['build', 'build:types', 'preinstall', 'serve', 'test', 'test:browser', 'test:coverage', 'test:coverage:report'].includes(configuration.givenCommandLineArguments[2]) && possibleArguments.includes(configuration.givenCommandLineArguments[2]))) {
              _context3.next = 66;
              break;
            }
            if (!((0, _path.resolve)(configuration.path.target.base) === (0, _path.resolve)(configuration.path.context))) {
              _context3.next = 56;
              break;
            }
            _context3.next = 32;
            return _clientnode["default"].walkDirectoryRecursively(configuration.path.target.base, /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(file) {
                var type, _file$stats;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) switch (_context.prev = _context.next) {
                    case 0:
                      if (!_helper["default"].isFilePathInLocation(file.path, configuration.path.ignore.concat(configuration.module.directoryNames, configuration.loader.directoryNames).map(function (filePath) {
                        return (0, _path.resolve)(configuration.path.context, filePath);
                      }).filter(function (filePath) {
                        return !configuration.path.context.startsWith(filePath);
                      }))) {
                        _context.next = 2;
                        break;
                      }
                      return _context.abrupt("return", false);
                    case 2:
                      _context.t0 = _regenerator["default"].keys(configuration.buildContext.types);
                    case 3:
                      if ((_context.t1 = _context.t0()).done) {
                        _context.next = 15;
                        break;
                      }
                      type = _context.t1.value;
                      if (!new RegExp(configuration.buildContext.types[type].filePathPattern).test(file.path)) {
                        _context.next = 13;
                        break;
                      }
                      if (!((_file$stats = file.stats) !== null && _file$stats !== void 0 && _file$stats.isDirectory())) {
                        _context.next = 10;
                        break;
                      }
                      _context.next = 9;
                      return (0, _rimraf.rimraf)(file.path);
                    case 9:
                      return _context.abrupt("return", false);
                    case 10:
                      _context.next = 12;
                      return (0, _promises.unlink)(file.path);
                    case 12:
                      return _context.abrupt("break", 15);
                    case 13:
                      _context.next = 3;
                      break;
                    case 15:
                    case "end":
                      return _context.stop();
                  }
                }, _callee);
              }));
              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }());
          case 32:
            _context3.t0 = _createForOfIteratorHelper;
            _context3.next = 35;
            return _clientnode["default"].walkDirectoryRecursively(configuration.path.target.base, function () {
              return false;
            }, configuration.encoding);
          case 35:
            _context3.t1 = _context3.sent;
            _iterator = (0, _context3.t0)(_context3.t1);
            _context3.prev = 37;
            _iterator.s();
          case 39:
            if ((_step = _iterator.n()).done) {
              _context3.next = 46;
              break;
            }
            file = _step.value;
            if (!file.name.startsWith('npm-debug')) {
              _context3.next = 44;
              break;
            }
            _context3.next = 44;
            return (0, _promises.unlink)(file.path);
          case 44:
            _context3.next = 39;
            break;
          case 46:
            _context3.next = 51;
            break;
          case 48:
            _context3.prev = 48;
            _context3.t2 = _context3["catch"](37);
            _iterator.e(_context3.t2);
          case 51:
            _context3.prev = 51;
            _iterator.f();
            return _context3.finish(51);
          case 54:
            _context3.next = 58;
            break;
          case 56:
            _context3.next = 58;
            return (0, _rimraf.rimraf)(configuration.path.target.base);
          case 58:
            _context3.next = 60;
            return _clientnode["default"].isDirectory(configuration.path.apiDocumentation);
          case 60:
            if (!_context3.sent) {
              _context3.next = 63;
              break;
            }
            _context3.next = 63;
            return (0, _rimraf.rimraf)(configuration.path.apiDocumentation);
          case 63:
            _iterator2 = _createForOfIteratorHelper(configuration.path.tidyUpOnClear);
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                _filePath = _step2.value;
                if (_filePath) if (_clientnode["default"].isFileSync(_filePath))
                  // NOTE: Close handler have to be synchronous.
                  (0, _fs.unlinkSync)(_filePath);else if (_clientnode["default"].isDirectorySync(_filePath)) (0, _rimraf.sync)(_filePath);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
            (0, _rimraf.sync)((0, _globAll.sync)(configuration.path.tidyUpOnClearGlobs));
          case 66:
            // endregion
            // region handle build
            buildConfigurations = _helper["default"].resolveBuildConfigurationFilePaths(configuration.buildContext.types, configuration.path.source.asset.base, configuration.path.ignore.concat(configuration.module.directoryNames, configuration.loader.directoryNames).map(function (filePath) {
              return (0, _path.resolve)(configuration.path.context, filePath);
            }).filter(function (filePath) {
              return !configuration.path.context.startsWith(filePath);
            }), configuration["package"].main.fileNames);
            if (!['build', 'document', 'test', 'test:coverage', 'test:coverage:report'].includes(commandLineArguments[2])) {
              _context3.next = 74;
              break;
            }
            tidiedUp = false;
            tidyUp = function tidyUp() {
              /*
                  D