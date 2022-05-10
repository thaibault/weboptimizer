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

var _path = _interopRequireWildcard(require("path"));

var _rimraf = _interopRequireWildcard(require("rimraf"));

var _configurator = require("./configurator");

var _helper = _interopRequireDefault(require("./helper"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

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

var main = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(context) {
    var currentWorkingDirectory,
        commandLineArguments,
        webOptimizerPath,
        environment,
        _args4 = arguments;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            currentWorkingDirectory = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : process.cwd();
            commandLineArguments = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : process.argv;
            webOptimizerPath = _args4.length > 3 && _args4[3] !== undefined ? _args4[3] : __dirname;
            environment = _args4.length > 4 && _args4[4] !== undefined ? _args4[4] : eval('process.env');
            return _context4.abrupt("return", (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
              var configuration, clear;
              return _regenerator["default"].wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      configuration = (0, _configurator.load)(context, currentWorkingDirectory, commandLineArguments, webOptimizerPath, environment);
                      clear = _clientnode["default"].noop();
                      _context3.prev = 2;
                      return _context3.delegateYield( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
                        var processOptions, childProcessOptions, childProcesses, processPromises, possibleArguments, closeEventHandlers, dynamicConfiguration, count, filePath, additionalArguments, _iterator, _step, file, _iterator2, _step2, _filePath, _iterator3, _step3, filePathPattern, buildConfigurations, tidiedUp, tidyUp, testModuleFilePaths, _iterator9, _step9, buildConfiguration, expression, _iterator10, _step10, _filePath6, handleTask, finished, closeHandler, _iterator14, _step14, closeEventName;

                        return _regenerator["default"].wrap(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
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
                                  _context2.next = 74;
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

                              case 11:
                                if (!true) {
                                  _context2.next = 20;
                                  break;
                                }

                                filePath = (0, _path.resolve)(configuration.path.context, ".dynamicConfiguration-".concat(count, ".json"));
                                _context2.next = 15;
                                return _clientnode["default"].isFile(filePath);

                              case 15:
                                if (_context2.sent) {
                                  _context2.next = 17;
                                  break;
                                }

                                return _context2.abrupt("break", 20);

                              case 17:
                                count += 1;
                                _context2.next = 11;
                                break;

                              case 20:
                                _context2.next = 22;
                                return (0, _promises.writeFile)(filePath, JSON.stringify(dynamicConfiguration));

                              case 22:
                                additionalArguments = commandLineArguments.splice(3); /// region register exit handler to tidy up

                                /// region register exit handler to tidy up
                                clear = function clear(error) {
                                  // NOTE: Close handler have to be synchronous.
                                  if (_clientnode["default"].isFileSync(filePath)) (0, _fs.unlinkSync)(filePath);
                                  if (error) throw error;
                                };

                                closeEventHandlers.push(clear); /// endregion
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
                                  _context2.next = 64;
                                  break;
                                }

                                if (!((0, _path.resolve)(configuration.path.target.base) === (0, _path.resolve)(configuration.path.context))) {
                                  _context2.next = 53;
                                  break;
                                }

                                _context2.next = 29;
                                return _clientnode["default"].walkDirectoryRecursively(configuration.path.target.base, /*#__PURE__*/function () {
                                  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(file) {
                                    var type, _file$stats;

                                    return _regenerator["default"].wrap(function _callee$(_context) {
                                      while (1) {
                                        switch (_context.prev = _context.next) {
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
                                            return new Promise(function (resolve, reject) {
                                              return (0, _rimraf["default"])(file.path, {
                                                glob: false
                                              }, function (error) {
                                                return error ? reject(error) : resolve();
                                              });
                                            });

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
                                      }
                                    }, _callee);
                                  }));

                                  return function (_x2) {
                                    return _ref3.apply(this, arguments);
                                  };
                                }());

                              case 29:
                                _context2.t0 = _createForOfIteratorHelper;
                                _context2.next = 32;
                                return _clientnode["default"].walkDirectoryRecursively(configuration.path.target.base, function () {
                                  return false;
                                }, configuration.encoding);

                              case 32:
                                _context2.t1 = _context2.sent;
                                _iterator = (0, _context2.t0)(_context2.t1);
                                _context2.prev = 34;

                                _iterator.s();

                              case 36:
                                if ((_step = _iterator.n()).done) {
                                  _context2.next = 43;
                                  break;
                                }

                                file = _step.value;

                                if (!file.name.startsWith('npm-debug')) {
                                  _context2.next = 41;
                                  break;
                                }

                                _context2.next = 41;
                                return (0, _promises.unlink)(file.path);

                              case 41:
                                _context2.next = 36;
                                break;

                              case 43:
                                _context2.next = 48;
                                break;

                              case 45:
                                _context2.prev = 45;
                                _context2.t2 = _context2["catch"](34);

                                _iterator.e(_context2.t2);

                              case 48:
                                _context2.prev = 48;

                                _iterator.f();

                                return _context2.finish(48);

                              case 51:
                                _context2.next = 55;
                                break;

                              case 53:
                                _context2.next = 55;
                                return new Promise(function (resolve, reject) {
                                  return (0, _rimraf["default"])(configuration.path.target.base, {
                                    glob: false
                                  }, function (error) {
                                    return error ? reject(error) : resolve();
                                  });
                                });

                              case 55:
                                _context2.next = 57;
                                return _clientnode["default"].isDirectory(configuration.path.apiDocumentation);

                              case 57:
                                if (!_context2.sent) {
                                  _context2.next = 60;
                                  break;
                                }

                                _context2.next = 60;
                                return new Promise(function (resolve, reject) {
                                  return (0, _rimraf["default"])(configuration.path.apiDocumentation, {
                                    glob: false
                                  }, function (error) {
                                    return error ? reject(error) : resolve();
                                  });
                                });

                              case 60:
                                _iterator2 = _createForOfIteratorHelper(configuration.path.tidyUpOnClear);

                                try {
                                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                                    _filePath = _step2.value;
                                    if (_filePath) if (_clientnode["default"].isFileSync(_filePath)) // NOTE: Close handler have to be synchronous.
                                      (0, _fs.unlinkSync)(_filePath);else if (_clientnode["default"].isDirectorySync(_filePath)) (0, _rimraf.sync)(_filePath, {
                                      glob: false
                                    });
                                  }
                                } catch (err) {
                                  _iterator2.e(err);
                                } finally {
                                  _iterator2.f();
                                }

                                _iterator3 = _createForOfIteratorHelper(configuration.path.tidyUpOnClearGlobs.pattern);

                                try {
                                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                                    filePathPattern = _step3.value;
                                    if (filePathPattern) (0, _rimraf.sync)(filePathPattern, configuration.path.tidyUpOnClearGlobs.options);
                                  }
                                } catch (err) {
                                  _iterator3.e(err);
                                } finally {
                                  _iterator3.f();
                                }

                              case 64:
                                // endregion
                                // region handle build
                                buildConfigurations = _helper["default"].resolveBuildConfigurationFilePaths(configuration.buildContext.types, configuration.path.source.asset.base, configuration.path.ignore.concat(configuration.module.directoryNames, configuration.loader.directoryNames).map(function (filePath) {
                                  return (0, _path.resolve)(configuration.path.context, filePath);
                                }).filter(function (filePath) {
                                  return !configuration.path.context.startsWith(filePath);
                                }), configuration["package"].main.fileNames);

                                if (['build', 'document', 'test', 'test:coverage', 'test:coverage:report'].includes(commandLineArguments[2])) {
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

                                      var _iterator4 = _createForOfIteratorHelper(chunk),
                                          _step4;

                                      try {
                                        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                                          var moduleID = _step4.value;

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


                                            /*
                                                NOTE: Close handler have to be
                                                synchronous.
                                            */
                                            if (configuration.buildContext.types[type].outputExtension === 'js' && _clientnode["default"].isFileSync(_filePath3)) (0, _fs.chmodSync)(_filePath3, '755');
                                          }
                                        }
                                      } catch (err) {
                                        _iterator4.e(err);
                                      } finally {
                                        _iterator4.f();
                                      }
                                    }

                                    var _iterator5 = _createForOfIteratorHelper(configuration.path.tidyUp),
                                        _step5;

                                    try {
                                      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                                        var _filePath4 = _step5.value;
                                        if (_filePath4) if (_clientnode["default"].isFileSync(_filePath4)) // NOTE: Close handler have to be synchronous.
                                          (0, _fs.unlinkSync)(_filePath4);else if (_clientnode["default"].isDirectorySync(_filePath4)) (0, _rimraf.sync)(_filePath4, {
                                          glob: false
                                        });
                                      }
                                    } catch (err) {
                                      _iterator5.e(err);
                                    } finally {
                                      _iterator5.f();
                                    }

                                    var _iterator6 = _createForOfIteratorHelper(configuration.path.tidyUpGlobs.pattern),
                                        _step6;

                                    try {
                                      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                                        var _filePathPattern = _step6.value;
                                        if (_filePathPattern) (0, _rimraf.sync)(_filePathPattern, configuration.path.tidyUpOnClearGlobs.options);
                                      }
                                    } catch (err) {
                                      _iterator6.e(err);
                                    } finally {
                                      _iterator6.f();
                                    }
                                  };

                                  closeEventHandlers.push(tidyUp);
                                  /*
                                      Triggers complete asset compiling and bundles them into the
                                      final productive output.
                                  */

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

                                    /*
                                        NOTE: Take current weboptimizer's dependencies into
                                        account.
                                    */
                                    childProcessOptions.env.PATH += ":".concat(webOptimizerPath, "/node_modules/.bin");
                                    var childProcess = (0, _child_process.spawn)(configuration.commandLine.build.command, commandLineArguments, childProcessOptions);

                                    var copyAdditionalFilesAndTidyUp = function copyAdditionalFilesAndTidyUp() {
                                      var _iterator7 = _createForOfIteratorHelper(configuration.files.additionalPaths),
                                          _step7;

                                      try {
                                        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                                          var _filePath5 = _step7.value;
                                          var sourcePath = (0, _path.join)(configuration.path.source.base, _filePath5);
                                          var targetPath = (0, _path.join)(configuration.path.target.base, _filePath5); // NOTE: Close handler have to be synchronous.

                                          // NOTE: Close handler have to be synchronous.
                                          if (_clientnode["default"].isDirectorySync(sourcePath)) {
                                            if (_clientnode["default"].isDirectorySync(targetPath)) (0, _rimraf.sync)(targetPath, {
                                              glob: false
                                            });

                                            _clientnode["default"].copyDirectoryRecursiveSync(sourcePath, targetPath);
                                          } else if (_clientnode["default"].isFileSync(sourcePath)) _clientnode["default"].copyFileSync(sourcePath, targetPath);
                                        }
                                      } catch (err) {
                                        _iterator7.e(err);
                                      } finally {
                                        _iterator7.f();
                                      }

                                      tidyUp();
                                    };

                                    var closeHandler = _clientnode["default"].getProcessCloseHandler(resolve, reject, null, commandLineArguments[2] === 'build' ? copyAdditionalFilesAndTidyUp : tidyUp);

                                    var _iterator8 = _createForOfIteratorHelper(_clientnode.CloseEventNames),
                                        _step8;

                                    try {
                                      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                                        var closeEventName = _step8.value;
                                        childProcess.on(closeEventName, closeHandler);
                                      }
                                    } catch (err) {
                                      _iterator8.e(err);
                                    } finally {
                                      _iterator8.f();
                                    }

                                    childProcesses.push(childProcess);
                                    return childProcesses;
                                  })); // endregion
                                  // region handle pre-install
                                } else if (configuration.library && configuration.givenCommandLineArguments[2] === 'preinstall') {
                                  // Perform all file specific preprocessing stuff.
                                  testModuleFilePaths = [];
                                  if (_clientnode["default"].isPlainObject(configuration['test:browser'].injection) && configuration['test:browser'].injection.entry) testModuleFilePaths = _helper["default"].determineModuleLocations(configuration['test:browser'].injection.entry, configuration.module.aliases, configuration.module.replacements.normal, {
                                    file: configuration.extensions.file.internal
                                  }, configuration.path.context, configuration.path.source.asset.base, configuration.path.ignore).filePaths;
                                  _iterator9 = _createForOfIteratorHelper(buildConfigurations);

                                  try {
                                    for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                                      buildConfiguration = _step9.value;
                                      expression = buildConfiguration[configuration.givenCommandLineArguments[2]].trim();
                                      _iterator10 = _createForOfIteratorHelper(buildConfiguration.filePaths);

                                      try {
                                        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                                          _filePath6 = _step10.value;

                                          if (!testModuleFilePaths.includes(_filePath6)) {
                                            (function () {
                                              var evaluated = _clientnode["default"].stringEvaluate("`".concat(expression, "`"), {
                                                global: global,
                                                self: configuration,
                                                buildConfiguration: buildConfiguration,
                                                path: _path["default"],
                                                additionalArguments: additionalArguments,
                                                filePath: _filePath6
                                              });

                                              if (evaluated.error) throw new Error('Error occurred during processing given ' + "command: ".concat(evaluated.error));
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
                                            })();
                                          }
                                        }
                                      } catch (err) {
                                        _iterator10.e(err);
                                      } finally {
                                        _iterator10.f();
                                      }
                                    }
                                  } catch (err) {
                                    _iterator9.e(err);
                                  } finally {
                                    _iterator9.f();
                                  }
                                } // endregion
                                // region handle remaining tasks


                                // endregion
                                // region handle remaining tasks
                                handleTask = function handleTask(type) {
                                  var tasks = Array.isArray(configuration.commandLine[type]) ? configuration.commandLine[type] : [configuration.commandLine[type]];

                                  var _iterator11 = _createForOfIteratorHelper(tasks),
                                      _step11;

                                  try {
                                    var _loop = function _loop() {
                                      var task = _step11.value;

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

                                        var _iterator12 = _createForOfIteratorHelper(_clientnode.CloseEventNames),
                                            _step12;

                                        try {
                                          for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
                                            var closeEventName = _step12.value;
                                            childProcess.on(closeEventName, closeHandler);
                                          }
                                        } catch (err) {
                                          _iterator12.e(err);
                                        } finally {
                                          _iterator12.f();
                                        }

                                        childProcesses.push(childProcess);
                                        return childProcesses;
                                      }));
                                    };

                                    for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                                      _loop();
                                    }
                                  } catch (err) {
                                    _iterator11.e(err);
                                  } finally {
                                    _iterator11.f();
                                  }
                                }; /// region a-/synchronous


                                if (!['document', 'test', 'test:coverage', 'test:coverage:report'].includes(configuration.givenCommandLineArguments[2])) {
                                  _context2.next = 73;
                                  break;
                                }

                                _context2.next = 70;
                                return Promise.all(processPromises);

                              case 70:
                                handleTask(configuration.givenCommandLineArguments[2]);
                                _context2.next = 74;
                                break;

                              case 73:
                                if (['build:types', 'check:types', 'lint', 'serve', 'test:browser'].includes(configuration.givenCommandLineArguments[2])) handleTask(configuration.givenCommandLineArguments[2]);

                              case 74:
                                finished = false;

                                closeHandler = function closeHandler() {
                                  if (!finished) {
                                    var _iterator13 = _createForOfIteratorHelper(closeEventHandlers),
                                        _step13;

                                    try {
                                      for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
                                        var closeEventHandler = _step13.value;
                                        closeEventHandler.apply(void 0, arguments);
                                      }
                                    } catch (err) {
                                      _iterator13.e(err);
                                    } finally {
                                      _iterator13.f();
                                    }
                                  }

                                  finished = true;
                                };

                                _iterator14 = _createForOfIteratorHelper(_clientnode.CloseEventNames);

                                try {
                                  for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
                                    closeEventName = _step14.value;
                                    process.on(closeEventName, closeHandler);
                                  }
                                } catch (err) {
                                  _iterator14.e(err);
                                } finally {
                                  _iterator14.f();
                                }

                                if (require.main === module && (configuration.givenCommandLineArguments.length < 3 || !possibleArguments.includes(configuration.givenCommandLineArguments[2]))) console.info("Give one of \"".concat(possibleArguments.join('", "'), "\" as command ") + 'line argument. You can provide a json string as second ' + 'parameter to dynamically overwrite some configurations.\n'); // endregion
                                // region forward nested return codes

                                _context2.prev = 79;
                                _context2.next = 82;
                                return Promise.all(processPromises);

                              case 82:
                                _context2.next = 88;
                                break;

                              case 84:
                                _context2.prev = 84;
                                _context2.t3 = _context2["catch"](79);
                                console.error(_context2.t3);
                                process.exit(_context2.t3.returnCode);

                              case 88:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, _callee2, null, [[34, 45, 48, 51], [79, 84]]);
                      })(), "t0", 4);

                    case 4:
                      _context3.next = 13;
                      break;

                    case 6:
                      _context3.prev = 6;
                      _context3.t1 = _context3["catch"](2);

                      if (!configuration.debug) {
                        _context3.next = 12;
                        break;
                      }

                      throw _context3.t1;

                    case 12:
                      console.error(_context3.t1);

                    case 13:
                      return _context3.abrupt("return", clear);

                    case 14:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, _callee3, null, [[2, 6]]);
            }))());

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function main(_x) {
    return _ref.apply(this, arguments);
  };
}();

if (require.main === module) void main();
var _default = main; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

exports["default"] = _default;
