#!/usr/bin/env node
// -*- coding: utf-8 -*-
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

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _child_process = require("child_process");

var _clientnode = _interopRequireDefault(require("clientnode"));

var _fs = _interopRequireWildcard(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _configurator = _interopRequireDefault(require("./configurator"));

var _helper = _interopRequireDefault(require("./helper"));

process.env.UV_THREADPOOL_SIZE = 128;
/**
 * Main entry point.
 * @returns Nothing.
 */

var main =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3() {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            return _context3.delegateYield(
            /*#__PURE__*/
            _regenerator["default"].mark(function _callee2() {
              var childProcessOptions, childProcesses, processPromises, possibleArguments, closeEventHandlers, dynamicConfiguration, count, filePath, additionalArguments, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _filePath, buildConfigurations, tidiedUp, tidyUp, testModuleFilePaths, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, buildConfiguration, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _filePath6, handleTask, finished, closeHandler, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, closeEventName;

              return _regenerator["default"].wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      // region controller
                      childProcessOptions = {
                        cwd: _configurator["default"].path.context,
                        env: process.env,
                        shell: true,
                        stdio: 'inherit'
                      };
                      childProcesses = [];
                      processPromises = [];
                      possibleArguments = ['build', 'build:dll', 'clear', 'document', 'lint', 'preinstall', 'serve', 'test', 'test:browser', 'check:types'];
                      closeEventHandlers = [];

                      if (!(_configurator["default"].givenCommandLineArguments.length > 2)) {
                        _context2.next = 146;
                        break;
                      }

                      // region temporary save dynamically given configurations
                      // NOTE: We need a copy of given arguments array.
                      dynamicConfiguration = {
                        givenCommandLineArguments: _configurator["default"].givenCommandLineArguments.slice()
                      };
                      if (_configurator["default"].givenCommandLineArguments.length > 3 && _clientnode["default"].stringParseEncodedObject(_configurator["default"].givenCommandLineArguments[_configurator["default"].givenCommandLineArguments.length - 1], _configurator["default"], 'configuration')) _configurator["default"].givenCommandLineArguments.pop();
                      count = 0;
                      filePath = _path["default"].resolve(_configurator["default"].path.context, ".dynamicConfiguration-".concat(count, ".json"));

                    case 10:
                      if (!true) {
                        _context2.next = 19;
                        break;
                      }

                      filePath = _path["default"].resolve(_configurator["default"].path.context, ".dynamicConfiguration-".concat(count, ".json"));
                      _context2.next = 14;
                      return _clientnode["default"].isFile(filePath);

                    case 14:
                      if (_context2.sent) {
                        _context2.next = 16;
                        break;
                      }

                      return _context2.abrupt("break", 19);

                    case 16:
                      count += 1;
                      _context2.next = 10;
                      break;

                    case 19:
                      _context2.next = 21;
                      return _fs.promises.writeFile(filePath, JSON.stringify(dynamicConfiguration));

                    case 21:
                      additionalArguments = process.argv.splice(3); // / region register exit handler to tidy up

                      closeEventHandlers.push(function (error) {
                        // NOTE: Close handler have to be synchronous.
                        if (_clientnode["default"].isFileSync(filePath)) _fs["default"].unlinkSync(filePath);
                        if (error) throw error;
                      }); // / endregion
                      // endregion
                      // region handle clear

                      /*
                          NOTE: Some tasks could depend on previously created dll
                          packages so a clean should not be performed in that case.
                          NOTE: If we have a dependency cycle we need to preserve files
                          during pre-install phase.
                      */

                      if (!(!['build', 'preinstall', 'serve', 'test', 'test:browser'].includes(_configurator["default"].givenCommandLineArguments[2]) && possibleArguments.includes(_configurator["default"].givenCommandLineArguments[2]))) {
                        _context2.next = 85;
                        break;
                      }

                      if (!(_path["default"].resolve(_configurator["default"].path.target.base) === _path["default"].resolve(_configurator["default"].path.context))) {
                        _context2.next = 59;
                        break;
                      }

                      _context2.next = 27;
                      return _clientnode["default"].walkDirectoryRecursively(_configurator["default"].path.target.base,
                      /*#__PURE__*/
                      function () {
                        var _ref2 = (0, _asyncToGenerator2["default"])(
                        /*#__PURE__*/
                        _regenerator["default"].mark(function _callee(file) {
                          var type;
                          return _regenerator["default"].wrap(function _callee$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  if (!_helper["default"].isFilePathInLocation(file.path, _configurator["default"].path.ignore.concat(_configurator["default"].module.directoryNames, _configurator["default"].loader.directoryNames).map(function (filePath) {
                                    return _path["default"].resolve(_configurator["default"].path.context, filePath);
                                  }).filter(function (filePath) {
                                    return !_configurator["default"].path.context.startsWith(filePath);
                                  }))) {
                                    _context.next = 2;
                                    break;
                                  }

                                  return _context.abrupt("return", false);

                                case 2:
                                  _context.t0 = _regenerator["default"].keys(_configurator["default"].buildContext.types);

                                case 3:
                                  if ((_context.t1 = _context.t0()).done) {
                                    _context.next = 15;
                                    break;
                                  }

                                  type = _context.t1.value;

                                  if (!new RegExp(_configurator["default"].buildContext.types[type].filePathPattern).test(file.path)) {
                                    _context.next = 13;
                                    break;
                                  }

                                  if (!(file.stats && file.stats.isDirectory())) {
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
                                  return _fs.promises.unlink(file.path);

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

                        return function (_x) {
                          return _ref2.apply(this, arguments);
                        };
                      }());

                    case 27:
                      _iteratorNormalCompletion = true;
                      _didIteratorError = false;
                      _iteratorError = undefined;
                      _context2.prev = 30;
                      _context2.next = 33;
                      return _clientnode["default"].walkDirectoryRecursively(_configurator["default"].path.target.base, function () {
                        return false;
                      }, _configurator["default"].encoding);

                    case 33:
                      _context2.t0 = Symbol.iterator;
                      _iterator = _context2.sent[_context2.t0]();

                    case 35:
                      if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context2.next = 43;
                        break;
                      }

                      file = _step.value;

                      if (!(file.name.length > '.dll-manifest.json'.length && file.name.endsWith('.dll-manifest.json') || file.name.startsWith('npm-debug'))) {
                        _context2.next = 40;
                        break;
                      }

                      _context2.next = 40;
                      return _fs.promises.unlink(file.path);

                    case 40:
                      _iteratorNormalCompletion = true;
                      _context2.next = 35;
                      break;

                    case 43:
                      _context2.next = 49;
                      break;

                    case 45:
                      _context2.prev = 45;
                      _context2.t1 = _context2["catch"](30);
                      _didIteratorError = true;
                      _iteratorError = _context2.t1;

                    case 49:
                      _context2.prev = 49;
                      _context2.prev = 50;

                      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                        _iterator["return"]();
                      }

                    case 52:
                      _context2.prev = 52;

                      if (!_didIteratorError) {
                        _context2.next = 55;
                        break;
                      }

                      throw _iteratorError;

                    case 55:
                      return _context2.finish(52);

                    case 56:
                      return _context2.finish(49);

                    case 57:
                      _context2.next = 61;
                      break;

                    case 59:
                      _context2.next = 61;
                      return new Promise(function (resolve, reject) {
                        return (0, _rimraf["default"])(_configurator["default"].path.target.base, {
                          glob: false
                        }, function (error) {
                          return error ? reject(error) : resolve();
                        });
                      });

                    case 61:
                      _context2.next = 63;
                      return _clientnode["default"].isDirectory(_configurator["default"].path.apiDocumentation);

                    case 63:
                      if (!_context2.sent) {
                        _context2.next = 66;
                        break;
                      }

                      _context2.next = 66;
                      return new Promise(function (resolve, reject) {
                        return (0, _rimraf["default"])(_configurator["default"].path.apiDocumentation, {
                          glob: false
                        }, function (error) {
                          return error ? reject(error) : resolve();
                        });
                      });

                    case 66:
                      _iteratorNormalCompletion2 = true;
                      _didIteratorError2 = false;
                      _iteratorError2 = undefined;
                      _context2.prev = 69;

                      for (_iterator2 = _configurator["default"].path.tidyUpOnClear[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        _filePath = _step2.value;
                        if (_filePath) if (_clientnode["default"].isFileSync(_filePath)) // NOTE: Close handler have to be synchronous.
                          _fs["default"].unlinkSync(_filePath);else if (_clientnode["default"].isDirectorySync(_filePath)) _rimraf["default"].sync(_filePath, {
                          glob: false
                        });
                      }

                      _context2.next = 77;
                      break;

                    case 73:
                      _context2.prev = 73;
                      _context2.t2 = _context2["catch"](69);
                      _didIteratorError2 = true;
                      _iteratorError2 = _context2.t2;

                    case 77:
                      _context2.prev = 77;
                      _context2.prev = 78;

                      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                        _iterator2["return"]();
                      }

                    case 80:
                      _context2.prev = 80;

                      if (!_didIteratorError2) {
                        _context2.next = 83;
                        break;
                      }

                      throw _iteratorError2;

                    case 83:
                      return _context2.finish(80);

                    case 84:
                      return _context2.finish(77);

                    case 85:
                      // endregion
                      // region handle build
                      buildConfigurations = _helper["default"].resolveBuildConfigurationFilePaths(_configurator["default"].buildContext.types, _configurator["default"].path.source.asset.base, _configurator["default"].path.ignore.concat(_configurator["default"].module.directoryNames, _configurator["default"].loader.directoryNames).map(function (filePath) {
                        return _path["default"].resolve(_configurator["default"].path.context, filePath);
                      }).filter(function (filePath) {
                        return !_configurator["default"].path.context.startsWith(filePath);
                      }), _configurator["default"]["package"].main.fileNames);

                      if (!['build', 'build:dll', 'document', 'test'].includes(process.argv[2])) {
                        _context2.next = 93;
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

                        for (var chunkName in _configurator["default"].injection.entry.normalized) {
                          if (_configurator["default"].injection.entry.normalized.hasOwnProperty(chunkName)) {
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                              for (var _iterator3 = _configurator["default"].injection.entry.normalized[chunkName][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var moduleID = _step3.value;

                                var _filePath2 = _helper["default"].determineModuleFilePath(moduleID, _configurator["default"].module.aliases, _configurator["default"].module.replacements.normal, {
                                  file: _configurator["default"].extensions.file.internal,
                                  module: _configurator["default"].extensions.module
                                }, _configurator["default"].path.context, _configurator["default"].path.source.asset.base, _configurator["default"].path.ignore, _configurator["default"].module.directoryNames, _configurator["default"]["package"].main.fileNames, _configurator["default"]["package"].main.propertyNames, _configurator["default"]["package"].aliasPropertyNames, _configurator["default"].encoding);

                                var type = void 0;
                                if (_filePath2) type = _helper["default"].determineAssetType(_filePath2, _configurator["default"].buildContext.types, _configurator["default"].path);

                                if (typeof type === 'string' && _configurator["default"].buildContext.types[type]) {
                                  var _filePath3 = _helper["default"].renderFilePathTemplate(_helper["default"].stripLoader(_configurator["default"].files.compose.javaScript), {
                                    '[name]': chunkName
                                  });
                                  /*
                                      NOTE: Close handler have to be
                                      synchronous.
                                  */


                                  if (_configurator["default"].buildContext.types[type].outputExtension === 'js' && _clientnode["default"].isFileSync(_filePath3)) _fs["default"].chmodSync(_filePath3, '755');
                                }
                              }
                            } catch (err) {
                              _didIteratorError3 = true;
                              _iteratorError3 = err;
                            } finally {
                              try {
                                if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                                  _iterator3["return"]();
                                }
                              } finally {
                                if (_didIteratorError3) {
                                  throw _iteratorError3;
                                }
                              }
                            }
                          }
                        }

                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                          for (var _iterator4 = _configurator["default"].path.tidyUp[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var _filePath4 = _step4.value;
                            if (_filePath4) if (_clientnode["default"].isFileSync(_filePath4)) // NOTE: Close handler have to be synchronous.
                              _fs["default"].unlinkSync(_filePath4);else if (_clientnode["default"].isDirectorySync(_filePath4)) _rimraf["default"].sync(_filePath4, {
                              glob: false
                            });
                          }
                        } catch (err) {
                          _didIteratorError4 = true;
                          _iteratorError4 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                              _iterator4["return"]();
                            }
                          } finally {
                            if (_didIteratorError4) {
                              throw _iteratorError4;
                            }
                          }
                        }
                      };

                      closeEventHandlers.push(tidyUp);
                      /*
                          Triggers complete asset compiling and bundles them into the
                          final productive output.
                      */

                      processPromises.push(new Promise(function (resolve, reject) {
                        var commandLineArguments = (_configurator["default"].commandLine.build.arguments || []).concat(additionalArguments);
                        console.info('Running "' + ("".concat(_configurator["default"].commandLine.build.command, " ") + commandLineArguments.join(' ')).trim() + '"');
                        var childProcess = (0, _child_process.spawn)(_configurator["default"].commandLine.build.command, commandLineArguments, childProcessOptions);

                        var copyAdditionalFilesAndTidyUp = function copyAdditionalFilesAndTidyUp() {
                          var _iteratorNormalCompletion5 = true;
                          var _didIteratorError5 = false;
                          var _iteratorError5 = undefined;

                          try {
                            for (var _iterator5 = _configurator["default"].files.additionalPaths[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                              var _filePath5 = _step5.value;

                              var sourcePath = _path["default"].join(_configurator["default"].path.source.base, _filePath5);

                              var targetPath = _path["default"].join(_configurator["default"].path.target.base, _filePath5); // NOTE: Close handler have to be synchronous.


                              if (_clientnode["default"].isDirectorySync(sourcePath)) {
                                if (_clientnode["default"].isDirectorySync(targetPath)) _rimraf["default"].sync(targetPath, {
                                  glob: false
                                });

                                _clientnode["default"].copyDirectoryRecursiveSync(sourcePath, targetPath);
                              } else if (_clientnode["default"].isFileSync(sourcePath)) _clientnode["default"].copyFileSync(sourcePath, targetPath);
                            }
                          } catch (err) {
                            _didIteratorError5 = true;
                            _iteratorError5 = err;
                          } finally {
                            try {
                              if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                                _iterator5["return"]();
                              }
                            } finally {
                              if (_didIteratorError5) {
                                throw _iteratorError5;
                              }
                            }
                          }

                          tidyUp.apply(void 0, arguments);
                        };

                        var closeHandler = _clientnode["default"].getProcessCloseHandler(resolve, reject, null, process.argv[2] === 'build' ? copyAdditionalFilesAndTidyUp : tidyUp);

                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                          for (var _iterator6 = _clientnode["default"].closeEventNames[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            var closeEventName = _step6.value;
                            childProcess.on(closeEventName, closeHandler);
                          }
                        } catch (err) {
                          _didIteratorError6 = true;
                          _iteratorError6 = err;
                        } finally {
                          try {
                            if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                              _iterator6["return"]();
                            }
                          } finally {
                            if (_didIteratorError6) {
                              throw _iteratorError6;
                            }
                          }
                        }

                        childProcesses.push(childProcess);
                      })); // endregion
                      // region handle preinstall

                      _context2.next = 138;
                      break;

                    case 93:
                      if (!(_configurator["default"].library && _configurator["default"].givenCommandLineArguments[2] === 'preinstall')) {
                        _context2.next = 138;
                        break;
                      }

                      // Perform all file specific preprocessing stuff.
                      testModuleFilePaths = _helper["default"].determineModuleLocations(_configurator["default"]['test:browser'].injection.entry, _configurator["default"].module.aliases, _configurator["default"].module.replacements.normal, {
                        file: _configurator["default"].extensions.file.internal,
                        module: _configurator["default"].extensions.module
                      }, _configurator["default"].path.context, _configurator["default"].path.source.asset.base, _configurator["default"].path.ignore).filePaths;
                      _iteratorNormalCompletion7 = true;
                      _didIteratorError7 = false;
                      _iteratorError7 = undefined;
                      _context2.prev = 98;
                      _iterator7 = buildConfigurations[Symbol.iterator]();

                    case 100:
                      if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                        _context2.next = 124;
                        break;
                      }

                      buildConfiguration = _step7.value;
                      _iteratorNormalCompletion8 = true;
                      _didIteratorError8 = false;
                      _iteratorError8 = undefined;
                      _context2.prev = 105;

                      for (_iterator8 = buildConfiguration.filePaths[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                        _filePath6 = _step8.value;

                        if (!testModuleFilePaths.includes(_filePath6)) {
                          (function () {
                            var evaluationFunction = function evaluationFunction(global, self, buildConfiguration, path, additionalArguments, filePath) {
                              return new Function('global', 'self', 'buildConfiguration', 'path', 'additionalArguments', 'filePath', 'return `' + buildConfiguration[_configurator["default"].givenCommandLineArguments[2]].trim() + '`')(global, self, buildConfiguration, path, additionalArguments, filePath);
                            };

                            var command = evaluationFunction(global, _configurator["default"], buildConfiguration, _path["default"], additionalArguments, _filePath6);
                            console.info("Running \"".concat(command, "\""));
                            processPromises.push(new Promise(function (resolve, reject) {
                              return _clientnode["default"].handleChildProcess((0, _child_process.exec)(command, childProcessOptions, function (error) {
                                return error ? reject(error) : resolve();
                              }));
                            }));
                          })();
                        }
                      }

                      _context2.next = 113;
                      break;

                    case 109:
                      _context2.prev = 109;
                      _context2.t3 = _context2["catch"](105);
                      _didIteratorError8 = true;
                      _iteratorError8 = _context2.t3;

                    case 113:
                      _context2.prev = 113;
                      _context2.prev = 114;

                      if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                        _iterator8["return"]();
                      }

                    case 116:
                      _context2.prev = 116;

                      if (!_didIteratorError8) {
                        _context2.next = 119;
                        break;
                      }

                      throw _iteratorError8;

                    case 119:
                      return _context2.finish(116);

                    case 120:
                      return _context2.finish(113);

                    case 121:
                      _iteratorNormalCompletion7 = true;
                      _context2.next = 100;
                      break;

                    case 124:
                      _context2.next = 130;
                      break;

                    case 126:
                      _context2.prev = 126;
                      _context2.t4 = _context2["catch"](98);
                      _didIteratorError7 = true;
                      _iteratorError7 = _context2.t4;

                    case 130:
                      _context2.prev = 130;
                      _context2.prev = 131;

                      if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
                        _iterator7["return"]();
                      }

                    case 133:
                      _context2.prev = 133;

                      if (!_didIteratorError7) {
                        _context2.next = 136;
                        break;
                      }

                      throw _iteratorError7;

                    case 136:
                      return _context2.finish(133);

                    case 137:
                      return _context2.finish(130);

                    case 138:
                      // endregion
                      // region handle remaining tasks
                      handleTask = function handleTask(type) {
                        var tasks;
                        if (Array.isArray(_configurator["default"].commandLine[type])) tasks = _configurator["default"].commandLine[type];else tasks = [_configurator["default"].commandLine[type]];
                        var _iteratorNormalCompletion9 = true;
                        var _didIteratorError9 = false;
                        var _iteratorError9 = undefined;

                        try {
                          var _loop = function _loop() {
                            var task = _step9.value;

                            var evaluationFunction = function evaluationFunction(global, self, path) {
                              return new Function('global', 'self', 'path', 'return ' + (task.hasOwnProperty('indicator') ? task.indicator : 'true'))(global, self, path);
                            };

                            if (evaluationFunction(global, _configurator["default"], _path["default"])) processPromises.push(new Promise(function (resolve, reject) {
                              var commandLineArguments = (task.arguments || []).concat(additionalArguments);
                              console.info('Running "' + ("".concat(task.command, " ") + commandLineArguments.join(' ')).trim() + '"');
                              var childProcess = (0, _child_process.spawn)(task.command, commandLineArguments, childProcessOptions);

                              var closeHandler = _clientnode["default"].getProcessCloseHandler(resolve, reject);

                              var _iteratorNormalCompletion10 = true;
                              var _didIteratorError10 = false;
                              var _iteratorError10 = undefined;

                              try {
                                for (var _iterator10 = _clientnode["default"].closeEventNames[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                  var closeEventName = _step10.value;
                                  childProcess.on(closeEventName, closeHandler);
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

                              childProcesses.push(childProcess);
                            }));
                          };

                          for (var _iterator9 = tasks[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            _loop();
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
                      }; // / region a-/synchronous


                      if (!['document', 'test'].includes(_configurator["default"].givenCommandLineArguments[2])) {
                        _context2.next = 145;
                        break;
                      }

                      _context2.next = 142;
                      return Promise.all(processPromises);

                    case 142:
                      handleTask(_configurator["default"].givenCommandLineArguments[2]);
                      _context2.next = 146;
                      break;

                    case 145:
                      if (['check:types', 'lint', 'serve', 'test:browser'].includes(_configurator["default"].givenCommandLineArguments[2])) handleTask(_configurator["default"].givenCommandLineArguments[2]);

                    case 146:
                      finished = false;

                      closeHandler = function closeHandler() {
                        if (!finished) {
                          var _iteratorNormalCompletion11 = true;
                          var _didIteratorError11 = false;
                          var _iteratorError11 = undefined;

                          try {
                            for (var _iterator11 = closeEventHandlers[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                              var closeEventHandler = _step11.value;
                              closeEventHandler.apply(void 0, arguments);
                            }
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
                        }

                        finished = true;
                      };

                      _iteratorNormalCompletion12 = true;
                      _didIteratorError12 = false;
                      _iteratorError12 = undefined;
                      _context2.prev = 151;

                      for (_iterator12 = _clientnode["default"].closeEventNames[Symbol.iterator](); !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                        closeEventName = _step12.value;
                        process.on(closeEventName, closeHandler);
                      }

                      _context2.next = 159;
                      break;

                    case 155:
                      _context2.prev = 155;
                      _context2.t5 = _context2["catch"](151);
                      _didIteratorError12 = true;
                      _iteratorError12 = _context2.t5;

                    case 159:
                      _context2.prev = 159;
                      _context2.prev = 160;

                      if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
                        _iterator12["return"]();
                      }

                    case 162:
                      _context2.prev = 162;

                      if (!_didIteratorError12) {
                        _context2.next = 165;
                        break;
                      }

                      throw _iteratorError12;

                    case 165:
                      return _context2.finish(162);

                    case 166:
                      return _context2.finish(159);

                    case 167:
                      if (require.main === module && (_configurator["default"].givenCommandLineArguments.length < 3 || !possibleArguments.includes(_configurator["default"].givenCommandLineArguments[2]))) console.info("Give one of \"".concat(possibleArguments.join('", "'), "\" as command ") + 'line argument. You can provide a json string as second ' + 'parameter to dynamically overwrite some configurations.\n'); // endregion
                      // region forward nested return codes

                      _context2.prev = 168;
                      _context2.next = 171;
                      return Promise.all(processPromises);

                    case 171:
                      _context2.next = 176;
                      break;

                    case 173:
                      _context2.prev = 173;
                      _context2.t6 = _context2["catch"](168);
                      process.exit(_context2.t6.returnCode);

                    case 176:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2, null, [[30, 45, 49, 57], [50,, 52, 56], [69, 73, 77, 85], [78,, 80, 84], [98, 126, 130, 138], [105, 109, 113, 121], [114,, 116, 120], [131,, 133, 137], [151, 155, 159, 167], [160,, 162, 166], [168, 173]]);
            })(), "t0", 2);

          case 2:
            _context3.next = 11;
            break;

          case 4:
            _context3.prev = 4;
            _context3.t1 = _context3["catch"](0);

            if (!_configurator["default"].debug) {
              _context3.next = 10;
              break;
            }

            throw _context3.t1;

          case 10:
            console.error(_context3.t1);

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 4]]);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

if (require.main === module) main();
var _default = main; // region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

exports["default"] = _default;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTs7QUFBQTs7QUFBQTtBQThkRCxZQUFBLE9BQU8sQ0FBQyxLQUFSOztBQTlkQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFIOztBQUFBLGtCQUFKLElBQUk7QUFBQTtBQUFBO0FBQUEsR0FBVjs7QUFpZUEsSUFBSSxPQUFPLENBQUMsSUFBUixLQUFpQixNQUFyQixFQUNJLElBQUk7ZUFDTyxJLEVBQ2Y7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBbUHJvamVjdCBwYWdlXShodHRwczovL3RvcmJlbi53ZWJzaXRlL3dlYk9wdGltaXplcilcblxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9uc1xuICAgIG5hbWluZyAzLjAgdW5wb3J0ZWQgbGljZW5zZS5cbiAgICBTZWUgaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB7XG4gICAgQ2hpbGRQcm9jZXNzLCBleGVjIGFzIGV4ZWNDaGlsZFByb2Nlc3MsIHNwYXduIGFzIHNwYXduQ2hpbGRQcm9jZXNzXG59IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgVG9vbHMsIHtGaWxlLCBQbGFpbk9iamVjdH0gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCBzeW5jaHJvbm91c0ZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQge3Byb21pc2VzIGFzIGZpbGVTeXN0ZW19IGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseSBmcm9tICdyaW1yYWYnXG5cbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlcidcbmltcG9ydCB7UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb259IGZyb20gJy4vdHlwZSdcbi8vIGVuZHJlZ2lvblxuLy8gTk9URTogU3BlY2lmaWVzIG51bWJlciBvZiBhbGxvd2VkIHRocmVhZHMgdG8gc3Bhd24uXG5wcm9jZXNzLmVudi5VVl9USFJFQURQT09MX1NJWkUgPSAxMjhcbi8qKlxuICogTWFpbiBlbnRyeSBwb2ludC5cbiAqIEByZXR1cm5zIE5vdGhpbmcuXG4gKi9cbmNvbnN0IG1haW4gPSBhc3luYyAoKTpQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZWdpb24gY29udHJvbGxlclxuICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3NPcHRpb25zOlJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG4gICAgICAgICAgICBjd2Q6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgZW52OiBwcm9jZXNzLmVudixcbiAgICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgICAgc3RkaW86ICdpbmhlcml0J1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoaWxkUHJvY2Vzc2VzOkFycmF5PENoaWxkUHJvY2Vzcz4gPSBbXVxuICAgICAgICBjb25zdCBwcm9jZXNzUHJvbWlzZXM6QXJyYXk8UHJvbWlzZTxhbnk+PiA9IFtdXG4gICAgICAgIGNvbnN0IHBvc3NpYmxlQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnYnVpbGQnLCAnYnVpbGQ6ZGxsJyxcbiAgICAgICAgICAgICdjbGVhcicsXG4gICAgICAgICAgICAnZG9jdW1lbnQnLFxuICAgICAgICAgICAgJ2xpbnQnLFxuICAgICAgICAgICAgJ3ByZWluc3RhbGwnLFxuICAgICAgICAgICAgJ3NlcnZlJyxcbiAgICAgICAgICAgICd0ZXN0JyxcbiAgICAgICAgICAgICd0ZXN0OmJyb3dzZXInLFxuICAgICAgICAgICAgJ2NoZWNrOnR5cGVzJ1xuICAgICAgICBdXG4gICAgICAgIGNvbnN0IGNsb3NlRXZlbnRIYW5kbGVyczpBcnJheTxGdW5jdGlvbj4gPSBbXVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIC8vIHJlZ2lvbiB0ZW1wb3Jhcnkgc2F2ZSBkeW5hbWljYWxseSBnaXZlbiBjb25maWd1cmF0aW9uc1xuICAgICAgICAgICAgLy8gTk9URTogV2UgbmVlZCBhIGNvcHkgb2YgZ2l2ZW4gYXJndW1lbnRzIGFycmF5LlxuICAgICAgICAgICAgY29uc3QgZHluYW1pY0NvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QgPSB7XG4gICAgICAgICAgICAgICAgZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50czpcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLnNsaWNlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoID4gMyAmJlxuICAgICAgICAgICAgICAgIFRvb2xzLnN0cmluZ1BhcnNlRW5jb2RlZE9iamVjdChcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzW1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLCAnY29uZmlndXJhdGlvbicpXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLnBvcCgpXG4gICAgICAgICAgICBsZXQgY291bnQgPSAwXG4gICAgICAgICAgICBsZXQgZmlsZVBhdGg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmBcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICBgLmR5bmFtaWNDb25maWd1cmF0aW9uLSR7Y291bnR9Lmpzb25gXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGlmICghKGF3YWl0IFRvb2xzLmlzRmlsZShmaWxlUGF0aCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0ud3JpdGVGaWxlKFxuICAgICAgICAgICAgICAgIGZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShkeW5hbWljQ29uZmlndXJhdGlvbikpXG4gICAgICAgICAgICBjb25zdCBhZGRpdGlvbmFsQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSBwcm9jZXNzLmFyZ3Yuc3BsaWNlKDMpXG4gICAgICAgICAgICAvLyAvIHJlZ2lvbiByZWdpc3RlciBleGl0IGhhbmRsZXIgdG8gdGlkeSB1cFxuICAgICAgICAgICAgY2xvc2VFdmVudEhhbmRsZXJzLnB1c2goKGVycm9yOkVycm9yKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICBzeW5jaHJvbm91c0ZpbGVTeXN0ZW0udW5saW5rU3luYyhmaWxlUGF0aClcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy8gLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSBjbGVhclxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBOT1RFOiBTb21lIHRhc2tzIGNvdWxkIGRlcGVuZCBvbiBwcmV2aW91c2x5IGNyZWF0ZWQgZGxsXG4gICAgICAgICAgICAgICAgcGFja2FnZXMgc28gYSBjbGVhbiBzaG91bGQgbm90IGJlIHBlcmZvcm1lZCBpbiB0aGF0IGNhc2UuXG4gICAgICAgICAgICAgICAgTk9URTogSWYgd2UgaGF2ZSBhIGRlcGVuZGVuY3kgY3ljbGUgd2UgbmVlZCB0byBwcmVzZXJ2ZSBmaWxlc1xuICAgICAgICAgICAgICAgIGR1cmluZyBwcmUtaW5zdGFsbCBwaGFzZS5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIVtcbiAgICAgICAgICAgICAgICAgICAgJ2J1aWxkJywgJ3ByZWluc3RhbGwnLCAnc2VydmUnLCAndGVzdCcsICd0ZXN0OmJyb3dzZXInXG4gICAgICAgICAgICAgICAgXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pICYmXG4gICAgICAgICAgICAgICAgcG9zc2libGVBcmd1bWVudHMuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSkgPT09XG4gICAgICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShjb25maWd1cmF0aW9uLnBhdGguY29udGV4dClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlcyBhbGwgY29tcGlsZWQgZmlsZXMuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFRvb2xzLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jIChmaWxlOkZpbGUpOlByb21pc2U8ZmFsc2V8dW5kZWZpbmVkPiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgaW4gY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXcgUmVnRXhwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5maWxlUGF0aFBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS50ZXN0KGZpbGUucGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXRzICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cy5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Z2xvYjogZmFsc2V9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXJyb3I6RXJyb3IpOnZvaWQgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgZmlsZVN5c3RlbS51bmxpbmsoZmlsZS5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlIG9mIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCk6ZmFsc2UgPT4gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLm5hbWUubGVuZ3RoID4gJy5kbGwtbWFuaWZlc3QuanNvbicubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5uYW1lLmVuZHNXaXRoKCcuZGxsLW1hbmlmZXN0Lmpzb24nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUubmFtZS5zdGFydHNXaXRoKCducG0tZGVidWcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0udW5saW5rKGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtnbG9iOiBmYWxzZX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAoZXJyb3I6RXJyb3IpOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBUb29scy5pc0RpcmVjdG9yeShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5hcGlEb2N1bWVudGF0aW9uKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmFwaURvY3VtZW50YXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2dsb2I6IGZhbHNlfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXJyb3I6RXJyb3IpOnZvaWQgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGNvbmZpZ3VyYXRpb24ucGF0aC50aWR5VXBPbkNsZWFyKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogQ2xvc2UgaGFuZGxlciBoYXZlIHRvIGJlIHN5bmNocm9ub3VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bmNocm9ub3VzRmlsZVN5c3RlbS51bmxpbmtTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseS5zeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwge2dsb2I6IGZhbHNlfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSBidWlsZFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9XG4gICAgICAgICAgICAgICAgSGVscGVyLnJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICAgICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXNcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBpZiAoWydidWlsZCcsICdidWlsZDpkbGwnLCAnZG9jdW1lbnQnLCAndGVzdCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIHByb2Nlc3MuYXJndlsyXVxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIGxldCB0aWRpZWRVcCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgY29uc3QgdGlkeVVwOkZ1bmN0aW9uID0gKCk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICBEZXRlcm1pbmVzIGFsbCBub25lIGphdmFTY3JpcHQgZW50aXRpZXMgd2hpY2ggaGF2ZSBiZWVuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVkIGFzIHNpbmdsZSBtb2R1bGUgdG8gcmVtb3ZlLlxuICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAodGlkaWVkVXApXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICAgICAgdGlkaWVkVXAgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVua05hbWUgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uZW50cnkubm9ybWFsaXplZFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6bnVsbHxzdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUZpbGVQYXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5ub3JtYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmludGVybmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1vZHVsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHR5cGU6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIucmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmphdmFTY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeydbbmFtZV0nOiBjaHVua05hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW5jaHJvbm91cy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmlzRmlsZVN5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3luY2hyb25vdXNGaWxlU3lzdGVtLmNobW9kU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsICc3NTUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGNvbmZpZ3VyYXRpb24ucGF0aC50aWR5VXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bmNocm9ub3VzRmlsZVN5c3RlbS51bmxpbmtTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5LnN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwge2dsb2I6IGZhbHNlfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2xvc2VFdmVudEhhbmRsZXJzLnB1c2godGlkeVVwKVxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIFRyaWdnZXJzIGNvbXBsZXRlIGFzc2V0IGNvbXBpbGluZyBhbmQgYnVuZGxlcyB0aGVtIGludG8gdGhlXG4gICAgICAgICAgICAgICAgICAgIGZpbmFsIHByb2R1Y3RpdmUgb3V0cHV0LlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tYW5kTGluZUFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5jb21tYW5kTGluZS5idWlsZC5hcmd1bWVudHMgfHwgW11cbiAgICAgICAgICAgICAgICAgICAgKS5jb25jYXQoYWRkaXRpb25hbEFyZ3VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1J1bm5pbmcgXCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lLmJ1aWxkLmNvbW1hbmR9IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lQXJndW1lbnRzLmpvaW4oJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKS50cmltKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1wiJ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUHJvY2VzczpDaGlsZFByb2Nlc3MgPSBzcGF3bkNoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmUuYnVpbGQuY29tbWFuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lQXJndW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzT3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvcHlBZGRpdGlvbmFsRmlsZXNBbmRUaWR5VXA6RnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5wYXJhbWV0ZXI6QXJyYXk8YW55PlxuICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aCBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuYWRkaXRpb25hbFBhdGhzXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VQYXRoOnN0cmluZyA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5iYXNlLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRQYXRoOnN0cmluZyA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhzb3VyY2VQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKHRhcmdldFBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkuc3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoLCB7Z2xvYjogZmFsc2V9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5jb3B5RGlyZWN0b3J5UmVjdXJzaXZlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVBhdGgsIHRhcmdldFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChUb29scy5pc0ZpbGVTeW5jKHNvdXJjZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5jb3B5RmlsZVN5bmMoc291cmNlUGF0aCwgdGFyZ2V0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpZHlVcCguLi5wYXJhbWV0ZXIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2VIYW5kbGVyOkZ1bmN0aW9uID0gVG9vbHMuZ2V0UHJvY2Vzc0Nsb3NlSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgKHByb2Nlc3MuYXJndlsyXSA9PT0gJ2J1aWxkJykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcHlBZGRpdGlvbmFsRmlsZXNBbmRUaWR5VXAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpZHlVcFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudE5hbWUgb2YgVG9vbHMuY2xvc2VFdmVudE5hbWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzLm9uKGNsb3NlRXZlbnROYW1lLCBjbG9zZUhhbmRsZXIpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzc2VzLnB1c2goY2hpbGRQcm9jZXNzKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICAvLyByZWdpb24gaGFuZGxlIHByZWluc3RhbGxcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5saWJyYXJ5ICYmXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAncHJlaW5zdGFsbCdcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIFBlcmZvcm0gYWxsIGZpbGUgc3BlY2lmaWMgcHJlcHJvY2Vzc2luZyBzdHVmZi5cbiAgICAgICAgICAgICAgICBjb25zdCB0ZXN0TW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblsndGVzdDpicm93c2VyJ10uaW5qZWN0aW9uLmVudHJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW50ZXJuYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMubW9kdWxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICkuZmlsZVBhdGhzXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBidWlsZENvbmZpZ3VyYXRpb24gb2YgYnVpbGRDb25maWd1cmF0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBidWlsZENvbmZpZ3VyYXRpb24uZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXN0TW9kdWxlRmlsZVBhdGhzLmluY2x1ZGVzKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsOlJlY29yZDxzdHJpbmcsIGFueT4sIHNlbGY6UGxhaW5PYmplY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDp0eXBlb2YgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbEFyZ3VtZW50czpBcnJheTxzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ2xvYmFsJywgJ3NlbGYnLCAnYnVpbGRDb25maWd1cmF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwYXRoJywgJ2FkZGl0aW9uYWxBcmd1bWVudHMnLCAnZmlsZVBhdGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JldHVybiBgJyArIGJ1aWxkQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLnRyaW0oKSArICdgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLCBzZWxmLCBidWlsZENvbmZpZ3VyYXRpb24sIHBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQXJndW1lbnRzLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tYW5kOnN0cmluZyA9IGV2YWx1YXRpb25GdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLCBjb25maWd1cmF0aW9uLCBidWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgsIGFkZGl0aW9uYWxBcmd1bWVudHMsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgUnVubmluZyBcIiR7Y29tbWFuZH1cImApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOkNoaWxkUHJvY2VzcyA9PiBUb29scy5oYW5kbGVDaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWNDaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlcnJvcjpFcnJvcik6dm9pZCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBoYW5kbGUgcmVtYWluaW5nIHRhc2tzXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVUYXNrID0gKHR5cGU6c3RyaW5nKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGFza3M6QXJyYXk8UmVjb3JkPHN0cmluZywgYW55Pj5cbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdKSlcbiAgICAgICAgICAgICAgICAgICAgdGFza3MgPSBjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0YXNrcyA9IFtjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdXVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFzayBvZiB0YXNrcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWw6UmVjb3JkPHN0cmluZywgYW55Piwgc2VsZjpQbGFpbk9iamVjdCwgcGF0aDp0eXBlb2YgcGF0aFxuICAgICAgICAgICAgICAgICAgICApOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ2xvYmFsJywgJ3NlbGYnLCAncGF0aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JldHVybiAnICsgKHRhc2suaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbmRpY2F0b3InXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA/IHRhc2suaW5kaWNhdG9yIDogJ3RydWUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKShnbG9iYWwsIHNlbGYsIHBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmFsdWF0aW9uRnVuY3Rpb24oZ2xvYmFsLCBjb25maWd1cmF0aW9uLCBwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NQcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZExpbmVBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5hcmd1bWVudHMgfHwgW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLmNvbmNhdChhZGRpdGlvbmFsQXJndW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnUnVubmluZyBcIicgKyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3Rhc2suY29tbWFuZH0gYCArIGNvbW1hbmRMaW5lQXJndW1lbnRzLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS50cmltKCkgKyAnXCInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUHJvY2VzczpDaGlsZFByb2Nlc3MgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGF3bkNoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suY29tbWFuZCwgY29tbWFuZExpbmVBcmd1bWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3NPcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlSGFuZGxlcjpGdW5jdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmdldFByb2Nlc3NDbG9zZUhhbmRsZXIocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudE5hbWUgb2YgVG9vbHMuY2xvc2VFdmVudE5hbWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Mub24oY2xvc2VFdmVudE5hbWUsIGNsb3NlSGFuZGxlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Nlcy5wdXNoKGNoaWxkUHJvY2VzcylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIC8gcmVnaW9uIGEtL3N5bmNocm9ub3VzXG4gICAgICAgICAgICBpZiAoWydkb2N1bWVudCcsICd0ZXN0J10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvY2Vzc1Byb21pc2VzKVxuICAgICAgICAgICAgICAgIGhhbmRsZVRhc2soY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChbXG4gICAgICAgICAgICAgICAgJ2NoZWNrOnR5cGVzJywgJ2xpbnQnLCAnc2VydmUnLCAndGVzdDpicm93c2VyJ1xuICAgICAgICAgICAgXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKVxuICAgICAgICAgICAgICAgIGhhbmRsZVRhc2soY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKVxuICAgICAgICAgICAgLy8gLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICB9XG4gICAgICAgIGxldCBmaW5pc2hlZCA9IGZhbHNlXG4gICAgICAgIGNvbnN0IGNsb3NlSGFuZGxlciA9ICguLi5wYXJhbWV0ZXI6QXJyYXk8YW55Pik6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpbmlzaGVkKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudEhhbmRsZXIgb2YgY2xvc2VFdmVudEhhbmRsZXJzKVxuICAgICAgICAgICAgICAgICAgICBjbG9zZUV2ZW50SGFuZGxlciguLi5wYXJhbWV0ZXIpXG4gICAgICAgICAgICBmaW5pc2hlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGNsb3NlRXZlbnROYW1lIG9mIFRvb2xzLmNsb3NlRXZlbnROYW1lcylcbiAgICAgICAgICAgIHByb2Nlc3Mub24oY2xvc2VFdmVudE5hbWUsIGNsb3NlSGFuZGxlcilcbiAgICAgICAgaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlICYmIChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPCAzIHx8XG4gICAgICAgICAgICAhcG9zc2libGVBcmd1bWVudHMuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKVxuICAgICAgICApKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICAgIGBHaXZlIG9uZSBvZiBcIiR7cG9zc2libGVBcmd1bWVudHMuam9pbignXCIsIFwiJyl9XCIgYXMgY29tbWFuZCBgICtcbiAgICAgICAgICAgICAgICAnbGluZSBhcmd1bWVudC4gWW91IGNhbiBwcm92aWRlIGEganNvbiBzdHJpbmcgYXMgc2Vjb25kICcgK1xuICAgICAgICAgICAgICAgICdwYXJhbWV0ZXIgdG8gZHluYW1pY2FsbHkgb3ZlcndyaXRlIHNvbWUgY29uZmlndXJhdGlvbnMuXFxuJ1xuICAgICAgICAgICAgKVxuICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgLy8gcmVnaW9uIGZvcndhcmQgbmVzdGVkIHJldHVybiBjb2Rlc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvY2Vzc1Byb21pc2VzKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KGVycm9yLnJldHVybkNvZGUpXG4gICAgICAgIH1cbiAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZGVidWcpXG4gICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgIH1cbn1cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSlcbiAgICBtYWluKClcbmV4cG9ydCBkZWZhdWx0IG1haW5cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19