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

var _configurator = _interopRequireDefault(require("./configurator.compiled"));

var _helper = _interopRequireDefault(require("./helper.compiled"));

process.env.UV_THREADPOOL_SIZE = 128;
/**
 * Main entry point.
 * @returns Noting.
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
                      possibleArguments = ['build', 'build:dll', 'clear', 'document', 'lint', 'preinstall', 'serve', 'test', 'test:browser', 'check:type'];
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
                              return (// IgnoreTypeCheck
                                new Function('global', 'self', 'buildConfiguration', 'path', 'additionalArguments', 'filePath', 'return `' + buildConfiguration[_configurator["default"].givenCommandLineArguments[2]].trim() + '`')(global, self, buildConfiguration, path, additionalArguments, filePath)
                              );
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
                              return (// IgnoreTypeCheck
                                new Function('global', 'self', 'path', 'return ' + (task.hasOwnProperty('indicator') ? task.indicator : 'true'))(global, self, path)
                              );
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
                      if (['lint', 'test:browser', 'check:type', 'serve'].includes(_configurator["default"].givenCommandLineArguments[2])) handleTask(_configurator["default"].givenCommandLineArguments[2]);

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUE7O0FBQUEsaUJBdWNELHlCQUFjLEtBdmNiO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBMGNELFlBQUEsT0FBTyxDQUFDLEtBQVI7O0FBMWNDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQUg7O0FBQUEsa0JBQUosSUFBSTtBQUFBO0FBQUE7QUFBQSxHQUFWOztBQTZjQSxJQUFJLE9BQU8sQ0FBQyxJQUFSLEtBQWlCLE1BQXJCLEVBQ0ksSUFBSTtlQUNPLEksRUFDZjtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJpbmRleC5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBbUHJvamVjdCBwYWdlXShodHRwczovL3RvcmJlbi53ZWJzaXRlL3dlYk9wdGltaXplcilcblxuICAgIENvcHlyaWdodCBUb3JiZW4gU2lja2VydCAoaW5mb1tcIn5hdH5cIl10b3JiZW4ud2Vic2l0ZSkgMTYuMTIuMjAxMlxuXG4gICAgTGljZW5zZVxuICAgIC0tLS0tLS1cblxuICAgIFRoaXMgbGlicmFyeSB3cml0dGVuIGJ5IFRvcmJlbiBTaWNrZXJ0IHN0YW5kIHVuZGVyIGEgY3JlYXRpdmUgY29tbW9uc1xuICAgIG5hbWluZyAzLjAgdW5wb3J0ZWQgbGljZW5zZS5cbiAgICBTZWUgaHR0cHM6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LzMuMC9kZWVkLmRlXG4gICAgZW5kcmVnaW9uXG4qL1xuLy8gcmVnaW9uIGltcG9ydHNcbmltcG9ydCB7XG4gICAgQ2hpbGRQcm9jZXNzLCBleGVjIGFzIGV4ZWNDaGlsZFByb2Nlc3MsIHNwYXduIGFzIHNwYXduQ2hpbGRQcm9jZXNzXG59IGZyb20gJ2NoaWxkX3Byb2Nlc3MnXG5pbXBvcnQgVG9vbHMgZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCB0eXBlIHtGaWxlLCBQbGFpbk9iamVjdH0gZnJvbSAnY2xpZW50bm9kZSdcbmltcG9ydCBzeW5jaHJvbm91c0ZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQge3Byb21pc2VzIGFzIGZpbGVTeXN0ZW19IGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseSBmcm9tICdyaW1yYWYnXG5cbmltcG9ydCBjb25maWd1cmF0aW9uIGZyb20gJy4vY29uZmlndXJhdG9yLmNvbXBpbGVkJ1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL2hlbHBlci5jb21waWxlZCdcbmltcG9ydCB0eXBlIHtSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbn0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyBOT1RFOiBTcGVjaWZpZXMgbnVtYmVyIG9mIGFsbG93ZWQgdGhyZWFkcyB0byBzcGF3bi5cbi8vIElnbm9yZVR5cGVDaGVja1xucHJvY2Vzcy5lbnYuVVZfVEhSRUFEUE9PTF9TSVpFID0gMTI4XG4vKipcbiAqIE1haW4gZW50cnkgcG9pbnQuXG4gKiBAcmV0dXJucyBOb3RpbmcuXG4gKi9cbmNvbnN0IG1haW4gPSBhc3luYyAoKTpQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZWdpb24gY29udHJvbGxlclxuICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3NPcHRpb25zOk9iamVjdCA9IHtcbiAgICAgICAgICAgIGN3ZDogY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICBlbnY6IHByb2Nlc3MuZW52LFxuICAgICAgICAgICAgc2hlbGw6IHRydWUsXG4gICAgICAgICAgICBzdGRpbzogJ2luaGVyaXQnXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2hpbGRQcm9jZXNzZXM6QXJyYXk8Q2hpbGRQcm9jZXNzPiA9IFtdXG4gICAgICAgIGNvbnN0IHByb2Nlc3NQcm9taXNlczpBcnJheTxQcm9taXNlPGFueT4+ID0gW11cbiAgICAgICAgY29uc3QgcG9zc2libGVBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgICdidWlsZCcsICdidWlsZDpkbGwnLFxuICAgICAgICAgICAgJ2NsZWFyJyxcbiAgICAgICAgICAgICdkb2N1bWVudCcsXG4gICAgICAgICAgICAnbGludCcsXG4gICAgICAgICAgICAncHJlaW5zdGFsbCcsXG4gICAgICAgICAgICAnc2VydmUnLFxuICAgICAgICAgICAgJ3Rlc3QnLFxuICAgICAgICAgICAgJ3Rlc3Q6YnJvd3NlcicsXG4gICAgICAgICAgICAnY2hlY2s6dHlwZSdcbiAgICAgICAgXVxuICAgICAgICBjb25zdCBjbG9zZUV2ZW50SGFuZGxlcnM6QXJyYXk8RnVuY3Rpb24+ID0gW11cbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAvLyByZWdpb24gdGVtcG9yYXJ5IHNhdmUgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvbnNcbiAgICAgICAgICAgIC8vIE5PVEU6IFdlIG5lZWQgYSBjb3B5IG9mIGdpdmVuIGFyZ3VtZW50cyBhcnJheS5cbiAgICAgICAgICAgIGNvbnN0IGR5bmFtaWNDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0ge1xuICAgICAgICAgICAgICAgIGdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHM6XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5zbGljZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDMgJiZcbiAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdQYXJzZUVuY29kZWRPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgJ2NvbmZpZ3VyYXRpb24nKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5wb3AoKVxuICAgICAgICAgICAgbGV0IGNvdW50Om51bWJlciA9IDBcbiAgICAgICAgICAgIGxldCBmaWxlUGF0aDpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgYC5keW5hbWljQ29uZmlndXJhdGlvbi0ke2NvdW50fS5qc29uYFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICBmaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmBcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgaWYgKCEoYXdhaXQgVG9vbHMuaXNGaWxlKGZpbGVQYXRoKSkpXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY291bnQgKz0gMVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgZmlsZVN5c3RlbS53cml0ZUZpbGUoXG4gICAgICAgICAgICAgICAgZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGR5bmFtaWNDb25maWd1cmF0aW9uKSlcbiAgICAgICAgICAgIGNvbnN0IGFkZGl0aW9uYWxBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IHByb2Nlc3MuYXJndi5zcGxpY2UoMylcbiAgICAgICAgICAgIC8vIC8gcmVnaW9uIHJlZ2lzdGVyIGV4aXQgaGFuZGxlciB0byB0aWR5IHVwXG4gICAgICAgICAgICBjbG9zZUV2ZW50SGFuZGxlcnMucHVzaCgoZXJyb3I6P0Vycm9yKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICBzeW5jaHJvbm91c0ZpbGVTeXN0ZW0udW5saW5rU3luYyhmaWxlUGF0aClcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy8gLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSBjbGVhclxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBOT1RFOiBTb21lIHRhc2tzIGNvdWxkIGRlcGVuZCBvbiBwcmV2aW91c2x5IGNyZWF0ZWQgZGxsXG4gICAgICAgICAgICAgICAgcGFja2FnZXMgc28gYSBjbGVhbiBzaG91bGQgbm90IGJlIHBlcmZvcm1lZCBpbiB0aGF0IGNhc2UuXG4gICAgICAgICAgICAgICAgTk9URTogSWYgd2UgaGF2ZSBhIGRlcGVuZGVuY3kgY3ljbGUgd2UgbmVlZCB0byBwcmVzZXJ2ZSBmaWxlc1xuICAgICAgICAgICAgICAgIGR1cmluZyBwcmUtaW5zdGFsbCBwaGFzZS5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIVtcbiAgICAgICAgICAgICAgICAgICAgJ2J1aWxkJywgJ3ByZWluc3RhbGwnLCAnc2VydmUnLCAndGVzdCcsICd0ZXN0OmJyb3dzZXInXG4gICAgICAgICAgICAgICAgXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pICYmXG4gICAgICAgICAgICAgICAgcG9zc2libGVBcmd1bWVudHMuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5yZXNvbHZlKGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSkgPT09XG4gICAgICAgICAgICAgICAgICAgIHBhdGgucmVzb2x2ZShjb25maWd1cmF0aW9uLnBhdGguY29udGV4dClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlcyBhbGwgY29tcGlsZWQgZmlsZXMuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFRvb2xzLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwgYXN5bmMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6RmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgKTpQcm9taXNlPD9mYWxzZT4gPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucGF0aCwgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlOnN0cmluZyBpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkQ29udGV4dC50eXBlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLmZpbGVQYXRoUGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnRlc3QoZmlsZS5wYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuc3RhdHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXRzLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnBhdGgsIHtnbG9iOiBmYWxzZX0sIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0udW5saW5rKGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlOkZpbGUgb2YgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IFRvb2xzLndhbGtEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKTpmYWxzZSA9PiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5lbmNvZGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLm5hbWUubGVuZ3RoID4gJy5kbGwtbWFuaWZlc3QuanNvbicubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5uYW1lLmVuZHNXaXRoKCcuZGxsLW1hbmlmZXN0Lmpzb24nKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUubmFtZS5zdGFydHNXaXRoKCducG0tZGVidWcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVTeXN0ZW0udW5saW5rKGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwge2dsb2I6IGZhbHNlfSwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKSkpXG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBUb29scy5pc0RpcmVjdG9yeShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5hcGlEb2N1bWVudGF0aW9uKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5hcGlEb2N1bWVudGF0aW9uLCB7Z2xvYjogZmFsc2V9LCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24ucGF0aC50aWR5VXBPbkNsZWFyXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogQ2xvc2UgaGFuZGxlciBoYXZlIHRvIGJlIHN5bmNocm9ub3VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bmNocm9ub3VzRmlsZVN5c3RlbS51bmxpbmtTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseS5zeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwge2dsb2I6IGZhbHNlfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSBidWlsZFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9XG4gICAgICAgICAgICAgICAgSGVscGVyLnJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICAgICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMpXG4gICAgICAgICAgICBpZiAoWydidWlsZCcsICdidWlsZDpkbGwnLCAnZG9jdW1lbnQnLCAndGVzdCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIHByb2Nlc3MuYXJndlsyXVxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIGxldCB0aWRpZWRVcDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgICAgICAgICBjb25zdCB0aWR5VXA6RnVuY3Rpb24gPSAoKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIERldGVybWluZXMgYWxsIG5vbmUgamF2YVNjcmlwdCBlbnRpdGllcyB3aGljaCBoYXZlIGJlZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWQgYXMgc2luZ2xlIG1vZHVsZSB0byByZW1vdmUuXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aWRpZWRVcClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICB0aWRpZWRVcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmVudHJ5Lm5vcm1hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmluamVjdGlvbi5lbnRyeS5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQsIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5ub3JtYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMuZmlsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmludGVybmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1vZHVsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0eXBlOj9zdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGRDb250ZXh0LnR5cGVzW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIucmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmphdmFTY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgeydbbmFtZV0nOiBjaHVua05hbWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW5jaHJvbm91cy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZENvbnRleHQudHlwZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLm91dHB1dEV4dGVuc2lvbiA9PT0gJ2pzJyAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmlzRmlsZVN5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3luY2hyb25vdXNGaWxlU3lzdGVtLmNobW9kU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsICc3NTUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgb2YgY29uZmlndXJhdGlvbi5wYXRoLnRpZHlVcClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IENsb3NlIGhhbmRsZXIgaGF2ZSB0byBiZSBzeW5jaHJvbm91cy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3luY2hyb25vdXNGaWxlU3lzdGVtLnVubGlua1N5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkuc3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCB7Z2xvYjogZmFsc2V9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjbG9zZUV2ZW50SGFuZGxlcnMucHVzaCh0aWR5VXApXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgVHJpZ2dlcnMgY29tcGxldGUgYXNzZXQgY29tcGlsaW5nIGFuZCBidW5kbGVzIHRoZW0gaW50byB0aGVcbiAgICAgICAgICAgICAgICAgICAgZmluYWwgcHJvZHVjdGl2ZSBvdXRwdXQuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBwcm9jZXNzUHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1hbmRMaW5lQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lLmJ1aWxkLmFyZ3VtZW50cyB8fCBbXVxuICAgICAgICAgICAgICAgICAgICApLmNvbmNhdChhZGRpdGlvbmFsQXJndW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ1J1bm5pbmcgXCInICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7Y29uZmlndXJhdGlvbi5jb21tYW5kTGluZS5idWlsZC5jb21tYW5kfSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lQXJndW1lbnRzLmpvaW4oJyAnKVxuICAgICAgICAgICAgICAgICAgICApLnRyaW0oKSArICdcIicpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUHJvY2VzczpDaGlsZFByb2Nlc3MgPSBzcGF3bkNoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmUuYnVpbGQuY29tbWFuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lQXJndW1lbnRzLCBjaGlsZFByb2Nlc3NPcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5QWRkaXRpb25hbEZpbGVzQW5kVGlkeVVwOkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucGFyYW1ldGVyOkFycmF5PGFueT5cbiAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5hZGRpdGlvbmFsUGF0aHNcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZVBhdGg6c3RyaW5nID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmJhc2UsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFBhdGg6c3RyaW5nID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IENsb3NlIGhhbmRsZXIgaGF2ZSB0byBiZSBzeW5jaHJvbm91cy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKHNvdXJjZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0RpcmVjdG9yeVN5bmModGFyZ2V0UGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseS5zeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhdGgsIHtnbG9iOiBmYWxzZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmNvcHlEaXJlY3RvcnlSZWN1cnNpdmVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlUGF0aCwgdGFyZ2V0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFRvb2xzLmlzRmlsZVN5bmMoc291cmNlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmNvcHlGaWxlU3luYyhzb3VyY2VQYXRoLCB0YXJnZXRQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGlkeVVwKC4uLnBhcmFtZXRlcilcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUhhbmRsZXI6RnVuY3Rpb24gPSBUb29scy5nZXRQcm9jZXNzQ2xvc2VIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSwgcmVqZWN0LCBudWxsLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5hcmd2WzJdID09PSAnYnVpbGQnXG4gICAgICAgICAgICAgICAgICAgICAgICApID8gY29weUFkZGl0aW9uYWxGaWxlc0FuZFRpZHlVcCA6IHRpZHlVcClcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjbG9zZUV2ZW50TmFtZTpzdHJpbmcgb2YgVG9vbHMuY2xvc2VFdmVudE5hbWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzLm9uKGNsb3NlRXZlbnROYW1lLCBjbG9zZUhhbmRsZXIpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzc2VzLnB1c2goY2hpbGRQcm9jZXNzKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICAvLyByZWdpb24gaGFuZGxlIHByZWluc3RhbGxcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5saWJyYXJ5ICYmXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAncHJlaW5zdGFsbCdcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIFBlcmZvcm0gYWxsIGZpbGUgc3BlY2lmaWMgcHJlcHJvY2Vzc2luZyBzdHVmZi5cbiAgICAgICAgICAgICAgICBjb25zdCB0ZXN0TW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblsndGVzdDpicm93c2VyJ10uaW5qZWN0aW9uLmVudHJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTogY29uZmlndXJhdGlvbi5leHRlbnNpb25zLmZpbGUuaW50ZXJuYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlOiBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMubW9kdWxlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICkuZmlsZVBhdGhzXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBidWlsZENvbmZpZ3VyYXRpb24gb2YgYnVpbGRDb25maWd1cmF0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2YgYnVpbGRDb25maWd1cmF0aW9uLmZpbGVQYXRocylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGVzdE1vZHVsZUZpbGVQYXRocy5pbmNsdWRlcyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbDpPYmplY3QsIHNlbGY6UGxhaW5PYmplY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDp0eXBlb2YgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbEFyZ3VtZW50czpBcnJheTxzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2dsb2JhbCcsICdzZWxmJywgJ2J1aWxkQ29uZmlndXJhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGF0aCcsICdhZGRpdGlvbmFsQXJndW1lbnRzJywgJ2ZpbGVQYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdyZXR1cm4gYCcgKyBidWlsZENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXS50cmltKCkgKyAnYCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbCwgc2VsZiwgYnVpbGRDb25maWd1cmF0aW9uLCBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbEFyZ3VtZW50cywgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZDpzdHJpbmcgPSBldmFsdWF0aW9uRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbCwgY29uZmlndXJhdGlvbiwgYnVpbGRDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLCBhZGRpdGlvbmFsQXJndW1lbnRzLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFJ1bm5pbmcgXCIke2NvbW1hbmR9XCJgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NQcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTpDaGlsZFByb2Nlc3MgPT4gVG9vbHMuaGFuZGxlQ2hpbGRQcm9jZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGVjQ2hpbGRQcm9jZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZCwgY2hpbGRQcm9jZXNzT3B0aW9ucywgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBoYW5kbGUgcmVtYWluaW5nIHRhc2tzXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVUYXNrID0gKHR5cGU6c3RyaW5nKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGFza3M6QXJyYXk8T2JqZWN0PlxuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmVbdHlwZV0pKVxuICAgICAgICAgICAgICAgICAgICB0YXNrcyA9IGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmVbdHlwZV1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRhc2tzID0gW2NvbmZpZ3VyYXRpb24uY29tbWFuZExpbmVbdHlwZV1dXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YXNrOk9iamVjdCBvZiB0YXNrcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWw6T2JqZWN0LCBzZWxmOlBsYWluT2JqZWN0LCBwYXRoOnR5cGVvZiBwYXRoXG4gICAgICAgICAgICAgICAgICAgICk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2dsb2JhbCcsICdzZWxmJywgJ3BhdGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdyZXR1cm4gJyArICh0YXNrLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5kaWNhdG9yJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgPyB0YXNrLmluZGljYXRvciA6ICd0cnVlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICkoZ2xvYmFsLCBzZWxmLCBwYXRoKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZhbHVhdGlvbkZ1bmN0aW9uKGdsb2JhbCwgY29uZmlndXJhdGlvbiwgcGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1hbmRMaW5lQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suYXJndW1lbnRzIHx8IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5jb25jYXQoYWRkaXRpb25hbEFyZ3VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ1J1bm5pbmcgXCInICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0YXNrLmNvbW1hbmR9IGAgKyBjb21tYW5kTGluZUFyZ3VtZW50cy5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkudHJpbSgpICsgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3M6Q2hpbGRQcm9jZXNzID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bhd25DaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXNrLmNvbW1hbmQsIGNvbW1hbmRMaW5lQXJndW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzT3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUhhbmRsZXI6RnVuY3Rpb24gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5nZXRQcm9jZXNzQ2xvc2VIYW5kbGVyKHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUV2ZW50TmFtZTpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuY2xvc2VFdmVudE5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Mub24oY2xvc2VFdmVudE5hbWUsIGNsb3NlSGFuZGxlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Nlcy5wdXNoKGNoaWxkUHJvY2VzcylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIC8gcmVnaW9uIGEtL3N5bmNocm9ub3VzXG4gICAgICAgICAgICBpZiAoWydkb2N1bWVudCcsICd0ZXN0J10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvY2Vzc1Byb21pc2VzKVxuICAgICAgICAgICAgICAgIGhhbmRsZVRhc2soY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChbXG4gICAgICAgICAgICAgICAgJ2xpbnQnLCAndGVzdDpicm93c2VyJywgJ2NoZWNrOnR5cGUnLCAnc2VydmUnXG4gICAgICAgICAgICBdLmluY2x1ZGVzKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSkpXG4gICAgICAgICAgICAgICAgaGFuZGxlVGFzayhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pXG4gICAgICAgICAgICAvLyAvIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpbmlzaGVkOmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICBjb25zdCBjbG9zZUhhbmRsZXIgPSAoLi4ucGFyYW1ldGVyOkFycmF5PGFueT4pOnZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKCFmaW5pc2hlZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNsb3NlRXZlbnRIYW5kbGVyOkZ1bmN0aW9uIG9mIGNsb3NlRXZlbnRIYW5kbGVycylcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VFdmVudEhhbmRsZXIoLi4ucGFyYW1ldGVyKVxuICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBjbG9zZUV2ZW50TmFtZTpzdHJpbmcgb2YgVG9vbHMuY2xvc2VFdmVudE5hbWVzKVxuICAgICAgICAgICAgcHJvY2Vzcy5vbihjbG9zZUV2ZW50TmFtZSwgY2xvc2VIYW5kbGVyKVxuICAgICAgICBpZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUgJiYgKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA8IDMgfHxcbiAgICAgICAgICAgICFwb3NzaWJsZUFyZ3VtZW50cy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pXG4gICAgICAgICkpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgICAgICAgYEdpdmUgb25lIG9mIFwiJHtwb3NzaWJsZUFyZ3VtZW50cy5qb2luKCdcIiwgXCInKX1cIiBhcyBjb21tYW5kIGAgK1xuICAgICAgICAgICAgICAgICdsaW5lIGFyZ3VtZW50LiBZb3UgY2FuIHByb3ZpZGUgYSBqc29uIHN0cmluZyBhcyBzZWNvbmQgJyArXG4gICAgICAgICAgICAgICAgJ3BhcmFtZXRlciB0byBkeW5hbWljYWxseSBvdmVyd3JpdGUgc29tZSBjb25maWd1cmF0aW9ucy5cXG4nXG4gICAgICAgICAgICApXG4gICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAvLyByZWdpb24gZm9yd2FyZCBuZXN0ZWQgcmV0dXJuIGNvZGVzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9jZXNzUHJvbWlzZXMpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoZXJyb3IucmV0dXJuQ29kZSlcbiAgICAgICAgfVxuICAgICAgICAvLyBlbmRyZWdpb25cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5kZWJ1ZylcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgfVxufVxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKVxuICAgIG1haW4oKVxuZXhwb3J0IGRlZmF1bHQgbWFpblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=