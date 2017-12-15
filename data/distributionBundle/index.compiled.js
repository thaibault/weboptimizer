#!/usr/bin/env node


// -*- coding: utf-8 -*-
'use strict';
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons naming
    3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _child_process = require('child_process');

var _clientnode = require('clientnode');

var _clientnode2 = _interopRequireDefault(_clientnode);

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _configurator = require('./configurator.compiled');

var _configurator2 = _interopRequireDefault(_configurator);

var _helper = require('./helper.compiled');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}
// endregion
// NOTE: Specifies number of allowed threads to spawn.
// IgnoreTypeCheck
process.env.UV_THREADPOOL_SIZE = 128;
var main = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.prev = 0;
                        return _context4.delegateYield( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                            var childProcessOptions, childProcesses, processPromises, possibleArguments, closeEventHandlers, dynamicConfiguration, count, filePath, additionalArguments, _loop, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, buildConfigurations, tidiedUp, tidyUp, testModuleFilePaths, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, buildConfiguration, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _filePath5, handleTask, finished, closeHandler, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, closeEventName;

                            return _regenerator2.default.wrap(function _callee2$(_context3) {
                                while (1) {
                                    switch (_context3.prev = _context3.next) {
                                        case 0:
                                            // region controller
                                            childProcessOptions = {
                                                cwd: _configurator2.default.path.context,
                                                env: process.env,
                                                shell: true,
                                                stdio: 'inherit'
                                            };
                                            childProcesses = [];
                                            processPromises = [];
                                            possibleArguments = ['build', 'build:dll', 'clear', 'document', 'lint', 'preinstall', 'serve', 'test', 'test:browser', 'check:type'];
                                            closeEventHandlers = [];

                                            if (!(_configurator2.default.givenCommandLineArguments.length > 2)) {
                                                _context3.next = 127;
                                                break;
                                            }

                                            // region temporary save dynamically given configurations
                                            dynamicConfiguration = { givenCommandLineArguments: _configurator2.default.givenCommandLineArguments.slice() };

                                            if (_configurator2.default.givenCommandLineArguments.length > 3 && _clientnode2.default.stringParseEncodedObject(_configurator2.default.givenCommandLineArguments[_configurator2.default.givenCommandLineArguments.length - 1], _configurator2.default, 'configuration')) _configurator2.default.givenCommandLineArguments.pop();
                                            count = 0;
                                            filePath = _path2.default.resolve(_configurator2.default.path.context, '.dynamicConfiguration-' + count + '.json');

                                        case 10:
                                            if (!true) {
                                                _context3.next = 19;
                                                break;
                                            }

                                            filePath = _path2.default.resolve(_configurator2.default.path.context, '.dynamicConfiguration-' + count + '.json');
                                            _context3.next = 14;
                                            return _clientnode2.default.isFile(filePath);

                                        case 14:
                                            if (_context3.sent) {
                                                _context3.next = 16;
                                                break;
                                            }

                                            return _context3.abrupt('break', 19);

                                        case 16:
                                            count += 1;
                                            _context3.next = 10;
                                            break;

                                        case 19:
                                            _context3.next = 21;
                                            return new _promise2.default(function (resolve, reject) {
                                                return fileSystem.writeFile(filePath, (0, _stringify2.default)(dynamicConfiguration), function (error) {
                                                    return error ? reject(error) : resolve();
                                                });
                                            });

                                        case 21:
                                            additionalArguments = process.argv.splice(3);
                                            // / region register exit handler to tidy up

                                            closeEventHandlers.push(function (error) {
                                                // NOTE: Close handler have to be synchronous.
                                                if (_clientnode2.default.isFileSync(filePath)) fileSystem.unlinkSync(filePath);
                                                if (error) throw error;
                                            });
                                            // / endregion
                                            // endregion
                                            // region handle clear
                                            /*
                                                NOTE: Some tasks could depend on previously created dll
                                                packages so a clean should not be performed in that case.
                                                NOTE: If we have a dependency cycle we need to preserve files
                                                during preinstall phase.
                                            */

                                            if (!(!['build', 'preinstall', 'serve', 'test', 'test:browser'].includes(_configurator2.default.givenCommandLineArguments[2]) && possibleArguments.includes(_configurator2.default.givenCommandLineArguments[2]))) {
                                                _context3.next = 66;
                                                break;
                                            }

                                            if (!(_path2.default.resolve(_configurator2.default.path.target.base) === _path2.default.resolve(_configurator2.default.path.context))) {
                                                _context3.next = 59;
                                                break;
                                            }

                                            _context3.next = 27;
                                            return _clientnode2.default.walkDirectoryRecursively(_configurator2.default.path.target.base, function () {
                                                var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(file) {
                                                    var type;
                                                    return _regenerator2.default.wrap(function _callee$(_context) {
                                                        while (1) {
                                                            switch (_context.prev = _context.next) {
                                                                case 0:
                                                                    if (!_helper2.default.isFilePathInLocation(file.path, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
                                                                        return _path2.default.resolve(_configurator2.default.path.context, filePath);
                                                                    }).filter(function (filePath) {
                                                                        return !_configurator2.default.path.context.startsWith(filePath);
                                                                    }))) {
                                                                        _context.next = 2;
                                                                        break;
                                                                    }

                                                                    return _context.abrupt('return', false);

                                                                case 2:
                                                                    _context.t0 = _regenerator2.default.keys(_configurator2.default.build.types);

                                                                case 3:
                                                                    if ((_context.t1 = _context.t0()).done) {
                                                                        _context.next = 15;
                                                                        break;
                                                                    }

                                                                    type = _context.t1.value;

                                                                    if (!new RegExp(_configurator2.default.build.types[type].filePathPattern).test(file.path)) {
                                                                        _context.next = 13;
                                                                        break;
                                                                    }

                                                                    if (!(file.stats && file.stats.isDirectory())) {
                                                                        _context.next = 10;
                                                                        break;
                                                                    }

                                                                    _context.next = 9;
                                                                    return new _promise2.default(function (resolve, reject) {
                                                                        return (0, _rimraf2.default)(file.path, { glob: false }, function (error) {
                                                                            return error ? reject(error) : resolve();
                                                                        });
                                                                    });

                                                                case 9:
                                                                    return _context.abrupt('return', false);

                                                                case 10:
                                                                    _context.next = 12;
                                                                    return new _promise2.default(function (resolve, reject) {
                                                                        return fileSystem.unlink(file.path, function (error) {
                                                                            return error ? reject(error) : resolve();
                                                                        });
                                                                    });

                                                                case 12:
                                                                    return _context.abrupt('break', 15);

                                                                case 13:
                                                                    _context.next = 3;
                                                                    break;

                                                                case 15:
                                                                case 'end':
                                                                    return _context.stop();
                                                            }
                                                        }
                                                    }, _callee, undefined);
                                                }));

                                                return function (_x) {
                                                    return _ref2.apply(this, arguments);
                                                };
                                            }());

                                        case 27:
                                            _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop(file) {
                                                return _regenerator2.default.wrap(function _loop$(_context2) {
                                                    while (1) {
                                                        switch (_context2.prev = _context2.next) {
                                                            case 0:
                                                                if (!(file.name.length > '.dll-manifest.json'.length && file.name.endsWith('.dll-manifest.json') || file.name.startsWith('npm-debug'))) {
                                                                    _context2.next = 3;
                                                                    break;
                                                                }

                                                                _context2.next = 3;
                                                                return new _promise2.default(function (resolve, reject) {
                                                                    return fileSystem.unlink(file.path, function (error) {
                                                                        return error ? reject(error) : resolve();
                                                                    });
                                                                });

                                                            case 3:
                                                            case 'end':
                                                                return _context2.stop();
                                                        }
                                                    }
                                                }, _loop, undefined);
                                            });
                                            _iteratorNormalCompletion = true;
                                            _didIteratorError = false;
                                            _iteratorError = undefined;
                                            _context3.prev = 31;
                                            _context3.t0 = _getIterator3.default;
                                            _context3.next = 35;
                                            return _clientnode2.default.walkDirectoryRecursively(_configurator2.default.path.target.base, function () {
                                                return false;
                                            }, _configurator2.default.encoding);

                                        case 35:
                                            _context3.t1 = _context3.sent;
                                            _iterator = (0, _context3.t0)(_context3.t1);

                                        case 37:
                                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                                _context3.next = 43;
                                                break;
                                            }

                                            file = _step.value;
                                            return _context3.delegateYield(_loop(file), 't2', 40);

                                        case 40:
                                            _iteratorNormalCompletion = true;
                                            _context3.next = 37;
                                            break;

                                        case 43:
                                            _context3.next = 49;
                                            break;

                                        case 45:
                                            _context3.prev = 45;
                                            _context3.t3 = _context3['catch'](31);
                                            _didIteratorError = true;
                                            _iteratorError = _context3.t3;

                                        case 49:
                                            _context3.prev = 49;
                                            _context3.prev = 50;

                                            if (!_iteratorNormalCompletion && _iterator.return) {
                                                _iterator.return();
                                            }

                                        case 52:
                                            _context3.prev = 52;

                                            if (!_didIteratorError) {
                                                _context3.next = 55;
                                                break;
                                            }

                                            throw _iteratorError;

                                        case 55:
                                            return _context3.finish(52);

                                        case 56:
                                            return _context3.finish(49);

                                        case 57:
                                            _context3.next = 61;
                                            break;

                                        case 59:
                                            _context3.next = 61;
                                            return new _promise2.default(function (resolve, reject) {
                                                return (0, _rimraf2.default)(_configurator2.default.path.target.base, { glob: false }, function (error) {
                                                    return error ? reject(error) : resolve();
                                                });
                                            });

                                        case 61:
                                            _context3.next = 63;
                                            return _clientnode2.default.isDirectory(_configurator2.default.path.apiDocumentation);

                                        case 63:
                                            if (!_context3.sent) {
                                                _context3.next = 66;
                                                break;
                                            }

                                            _context3.next = 66;
                                            return new _promise2.default(function (resolve, reject) {
                                                return (0, _rimraf2.default)(_configurator2.default.path.apiDocumentation, { glob: false }, function (error) {
                                                    return error ? reject(error) : resolve();
                                                });
                                            });

                                        case 66:
                                            // endregion
                                            buildConfigurations = _helper2.default.resolveBuildConfigurationFilePaths(_configurator2.default.build.types, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
                                                return _path2.default.resolve(_configurator2.default.path.context, filePath);
                                            }).filter(function (filePath) {
                                                return !_configurator2.default.path.context.startsWith(filePath);
                                            }), _configurator2.default.package.main.fileNames);

                                            if (!['build', 'build:dll', 'document', 'test'].includes(process.argv[2])) {
                                                _context3.next = 74;
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
                                                for (var chunkName in _configurator2.default.injection.internal.normalized) {
                                                    if (_configurator2.default.injection.internal.normalized.hasOwnProperty(chunkName)) {
                                                        var _iteratorNormalCompletion2 = true;
                                                        var _didIteratorError2 = false;
                                                        var _iteratorError2 = undefined;

                                                        try {
                                                            for (var _iterator2 = (0, _getIterator3.default)(_configurator2.default.injection.internal.normalized[chunkName]), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                                                var moduleID = _step2.value;

                                                                var _filePath = _helper2.default.determineModuleFilePath(moduleID, _configurator2.default.module.aliases, _configurator2.default.module.replacements.normal, _configurator2.default.extensions, _configurator2.default.path.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore, _configurator2.default.module.directoryNames, _configurator2.default.package.main.fileNames, _configurator2.default.package.main.propertyNames, _configurator2.default.package.aliasPropertyNames, _configurator2.default.encoding);
                                                                var type = void 0;
                                                                if (_filePath) type = _helper2.default.determineAssetType(_filePath, _configurator2.default.build.types, _configurator2.default.path);
                                                                if (typeof type === 'string' && _configurator2.default.build.types[type]) {
                                                                    var _filePath2 = _helper2.default.renderFilePathTemplate(_helper2.default.stripLoader(_configurator2.default.files.compose.javaScript), { '[name]': chunkName });
                                                                    /*
                                                                        NOTE: Close handler have to be
                                                                        synchronous.
                                                                    */
                                                                    if (_configurator2.default.build.types[type].outputExtension === 'js' && _clientnode2.default.isFileSync(_filePath2)) fileSystem.chmodSync(_filePath2, '755');
                                                                }
                                                            }
                                                        } catch (err) {
                                                            _didIteratorError2 = true;
                                                            _iteratorError2 = err;
                                                        } finally {
                                                            try {
                                                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                                                    _iterator2.return();
                                                                }
                                                            } finally {
                                                                if (_didIteratorError2) {
                                                                    throw _iteratorError2;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }var _iteratorNormalCompletion3 = true;
                                                var _didIteratorError3 = false;
                                                var _iteratorError3 = undefined;

                                                try {
                                                    for (var _iterator3 = (0, _getIterator3.default)(_configurator2.default.path.tidyUp), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                                        var _filePath3 = _step3.value;

                                                        if (_filePath3 && _clientnode2.default.isFileSync(_filePath3))
                                                            // NOTE: Close handler have to be synchronous.
                                                            fileSystem.unlinkSync(_filePath3);
                                                    }
                                                } catch (err) {
                                                    _didIteratorError3 = true;
                                                    _iteratorError3 = err;
                                                } finally {
                                                    try {
                                                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                                            _iterator3.return();
                                                        }
                                                    } finally {
                                                        if (_didIteratorError3) {
                                                            throw _iteratorError3;
                                                        }
                                                    }
                                                }
                                            };

                                            closeEventHandlers.push(tidyUp);
                                            /*
                                                Triggers complete asset compiling and bundles them into the
                                                final productive output.
                                            */
                                            processPromises.push(new _promise2.default(function (resolve, reject) {
                                                var commandLineArguments = (_configurator2.default.commandLine.build.arguments || []).concat(additionalArguments);
                                                console.info('Running "' + (_configurator2.default.commandLine.build.command + ' ' + commandLineArguments.join(' ')).trim() + '"');
                                                var childProcess = (0, _child_process.spawn)(_configurator2.default.commandLine.build.command, commandLineArguments, childProcessOptions);
                                                var copyAdditionalFilesAndTidyUp = function copyAdditionalFilesAndTidyUp() {
                                                    var _iteratorNormalCompletion4 = true;
                                                    var _didIteratorError4 = false;
                                                    var _iteratorError4 = undefined;

                                                    try {
                                                        for (var _iterator4 = (0, _getIterator3.default)(_configurator2.default.files.additionalPaths), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                                            var _filePath4 = _step4.value;

                                                            var sourcePath = _path2.default.join(_configurator2.default.path.source.base, _filePath4);
                                                            var targetPath = _path2.default.join(_configurator2.default.path.target.base, _filePath4);
                                                            // NOTE: Close handler have to be synchronous.
                                                            if (_clientnode2.default.isDirectorySync(sourcePath)) {
                                                                if (_clientnode2.default.isDirectorySync(targetPath)) _rimraf2.default.sync(targetPath, { glob: false });
                                                                _clientnode2.default.copyDirectoryRecursiveSync(sourcePath, targetPath);
                                                            } else if (_clientnode2.default.isFileSync(sourcePath)) _clientnode2.default.copyFileSync(sourcePath, targetPath);
                                                        }
                                                    } catch (err) {
                                                        _didIteratorError4 = true;
                                                        _iteratorError4 = err;
                                                    } finally {
                                                        try {
                                                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                                                _iterator4.return();
                                                            }
                                                        } finally {
                                                            if (_didIteratorError4) {
                                                                throw _iteratorError4;
                                                            }
                                                        }
                                                    }

                                                    tidyUp.apply(undefined, arguments);
                                                };
                                                var closeHandler = _clientnode2.default.getProcessCloseHandler(resolve, reject, null, process.argv[2] === 'build' ? copyAdditionalFilesAndTidyUp : tidyUp);
                                                var _iteratorNormalCompletion5 = true;
                                                var _didIteratorError5 = false;
                                                var _iteratorError5 = undefined;

                                                try {
                                                    for (var _iterator5 = (0, _getIterator3.default)(_clientnode2.default.closeEventNames), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                                        var closeEventName = _step5.value;

                                                        childProcess.on(closeEventName, closeHandler);
                                                    }
                                                } catch (err) {
                                                    _didIteratorError5 = true;
                                                    _iteratorError5 = err;
                                                } finally {
                                                    try {
                                                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                                            _iterator5.return();
                                                        }
                                                    } finally {
                                                        if (_didIteratorError5) {
                                                            throw _iteratorError5;
                                                        }
                                                    }
                                                }

                                                childProcesses.push(childProcess);
                                            }));
                                            // endregion
                                            // region handle preinstall
                                            _context3.next = 119;
                                            break;

                                        case 74:
                                            if (!(_configurator2.default.library && _configurator2.default.givenCommandLineArguments[2] === 'preinstall')) {
                                                _context3.next = 119;
                                                break;
                                            }

                                            // Perform all file specific preprocessing stuff.
                                            testModuleFilePaths = _helper2.default.determineModuleLocations(_configurator2.default['test:browser'].injection.internal, _configurator2.default.module.aliases, _configurator2.default.module.replacements.normal, _configurator2.default.extensions, _configurator2.default.path.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore).filePaths;
                                            _iteratorNormalCompletion6 = true;
                                            _didIteratorError6 = false;
                                            _iteratorError6 = undefined;
                                            _context3.prev = 79;
                                            _iterator6 = (0, _getIterator3.default)(buildConfigurations);

                                        case 81:
                                            if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                                                _context3.next = 105;
                                                break;
                                            }

                                            buildConfiguration = _step6.value;
                                            _iteratorNormalCompletion7 = true;
                                            _didIteratorError7 = false;
                                            _iteratorError7 = undefined;
                                            _context3.prev = 86;

                                            for (_iterator7 = (0, _getIterator3.default)(buildConfiguration.filePaths); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                                                _filePath5 = _step7.value;

                                                if (!testModuleFilePaths.includes(_filePath5)) {
                                                    (function () {
                                                        var evaluationFunction = function evaluationFunction(global, self, buildConfiguration, path, additionalArguments, filePath
                                                        // IgnoreTypeCheck
                                                        ) {
                                                            return new Function('global', 'self', 'buildConfiguration', 'path', 'additionalArguments', 'filePath', 'return `' + buildConfiguration[_configurator2.default.givenCommandLineArguments[2]].trim() + '`')(global, self, buildConfiguration, path, additionalArguments, filePath);
                                                        };
                                                        var command = evaluationFunction(global, _configurator2.default, buildConfiguration, _path2.default, additionalArguments, _filePath5);
                                                        console.info('Running "' + command + '"');
                                                        processPromises.push(new _promise2.default(function (resolve, reject) {
                                                            return _clientnode2.default.handleChildProcess((0, _child_process.exec)(command, childProcessOptions, function (error) {
                                                                return error ? reject(error) : resolve();
                                                            }));
                                                        }));
                                                    })();
                                                }
                                            }_context3.next = 94;
                                            break;

                                        case 90:
                                            _context3.prev = 90;
                                            _context3.t4 = _context3['catch'](86);
                                            _didIteratorError7 = true;
                                            _iteratorError7 = _context3.t4;

                                        case 94:
                                            _context3.prev = 94;
                                            _context3.prev = 95;

                                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                                _iterator7.return();
                                            }

                                        case 97:
                                            _context3.prev = 97;

                                            if (!_didIteratorError7) {
                                                _context3.next = 100;
                                                break;
                                            }

                                            throw _iteratorError7;

                                        case 100:
                                            return _context3.finish(97);

                                        case 101:
                                            return _context3.finish(94);

                                        case 102:
                                            _iteratorNormalCompletion6 = true;
                                            _context3.next = 81;
                                            break;

                                        case 105:
                                            _context3.next = 111;
                                            break;

                                        case 107:
                                            _context3.prev = 107;
                                            _context3.t5 = _context3['catch'](79);
                                            _didIteratorError6 = true;
                                            _iteratorError6 = _context3.t5;

                                        case 111:
                                            _context3.prev = 111;
                                            _context3.prev = 112;

                                            if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                                _iterator6.return();
                                            }

                                        case 114:
                                            _context3.prev = 114;

                                            if (!_didIteratorError6) {
                                                _context3.next = 117;
                                                break;
                                            }

                                            throw _iteratorError6;

                                        case 117:
                                            return _context3.finish(114);

                                        case 118:
                                            return _context3.finish(111);

                                        case 119:
                                            // endregion
                                            // region handle remaining tasks
                                            handleTask = function handleTask(type) {
                                                var tasks = void 0;
                                                if (Array.isArray(_configurator2.default.commandLine[type])) tasks = _configurator2.default.commandLine[type];else tasks = [_configurator2.default.commandLine[type]];

                                                var _loop2 = function _loop2(task) {
                                                    var evaluationFunction = function evaluationFunction(global, self, path
                                                    // IgnoreTypeCheck
                                                    ) {
                                                        return new Function('global', 'self', 'path', 'return ' + (task.hasOwnProperty('indicator') ? task.indicator : 'true'))(global, self, path);
                                                    };
                                                    if (evaluationFunction(global, _configurator2.default, _path2.default)) processPromises.push(new _promise2.default(function (resolve, reject) {
                                                        var commandLineArguments = (task.arguments || []).concat(additionalArguments);
                                                        console.info('Running "' + (task.command + ' ' + commandLineArguments.join(' ')).trim() + '"');
                                                        var childProcess = (0, _child_process.spawn)(task.command, commandLineArguments, childProcessOptions);
                                                        var closeHandler = _clientnode2.default.getProcessCloseHandler(resolve, reject);
                                                        var _iteratorNormalCompletion9 = true;
                                                        var _didIteratorError9 = false;
                                                        var _iteratorError9 = undefined;

                                                        try {
                                                            for (var _iterator9 = (0, _getIterator3.default)(_clientnode2.default.closeEventNames), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                                                var closeEventName = _step9.value;

                                                                childProcess.on(closeEventName, closeHandler);
                                                            }
                                                        } catch (err) {
                                                            _didIteratorError9 = true;
                                                            _iteratorError9 = err;
                                                        } finally {
                                                            try {
                                                                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                                                    _iterator9.return();
                                                                }
                                                            } finally {
                                                                if (_didIteratorError9) {
                                                                    throw _iteratorError9;
                                                                }
                                                            }
                                                        }

                                                        childProcesses.push(childProcess);
                                                    }));
                                                };

                                                var _iteratorNormalCompletion8 = true;
                                                var _didIteratorError8 = false;
                                                var _iteratorError8 = undefined;

                                                try {
                                                    for (var _iterator8 = (0, _getIterator3.default)(tasks), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                                        var task = _step8.value;

                                                        _loop2(task);
                                                    }
                                                } catch (err) {
                                                    _didIteratorError8 = true;
                                                    _iteratorError8 = err;
                                                } finally {
                                                    try {
                                                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                                            _iterator8.return();
                                                        }
                                                    } finally {
                                                        if (_didIteratorError8) {
                                                            throw _iteratorError8;
                                                        }
                                                    }
                                                }
                                            };
                                            // / region a-/synchronous


                                            if (!['document', 'test'].includes(_configurator2.default.givenCommandLineArguments[2])) {
                                                _context3.next = 126;
                                                break;
                                            }

                                            _context3.next = 123;
                                            return _promise2.default.all(processPromises);

                                        case 123:
                                            handleTask(_configurator2.default.givenCommandLineArguments[2]);
                                            _context3.next = 127;
                                            break;

                                        case 126:
                                            if (['lint', 'test:browser', 'check:type', 'serve'].includes(_configurator2.default.givenCommandLineArguments[2])) handleTask(_configurator2.default.givenCommandLineArguments[2]);

                                        case 127:
                                            finished = false;

                                            closeHandler = function closeHandler() {
                                                if (!finished) {
                                                    var _iteratorNormalCompletion10 = true;
                                                    var _didIteratorError10 = false;
                                                    var _iteratorError10 = undefined;

                                                    try {
                                                        for (var _iterator10 = (0, _getIterator3.default)(closeEventHandlers), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                                            var closeEventHandler = _step10.value;

                                                            closeEventHandler.apply(undefined, arguments);
                                                        }
                                                    } catch (err) {
                                                        _didIteratorError10 = true;
                                                        _iteratorError10 = err;
                                                    } finally {
                                                        try {
                                                            if (!_iteratorNormalCompletion10 && _iterator10.return) {
                                                                _iterator10.return();
                                                            }
                                                        } finally {
                                                            if (_didIteratorError10) {
                                                                throw _iteratorError10;
                                                            }
                                                        }
                                                    }
                                                }finished = true;
                                            };

                                            _iteratorNormalCompletion11 = true;
                                            _didIteratorError11 = false;
                                            _iteratorError11 = undefined;
                                            _context3.prev = 132;

                                            for (_iterator11 = (0, _getIterator3.default)(_clientnode2.default.closeEventNames); !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                                closeEventName = _step11.value;

                                                process.on(closeEventName, closeHandler);
                                            }_context3.next = 140;
                                            break;

                                        case 136:
                                            _context3.prev = 136;
                                            _context3.t6 = _context3['catch'](132);
                                            _didIteratorError11 = true;
                                            _iteratorError11 = _context3.t6;

                                        case 140:
                                            _context3.prev = 140;
                                            _context3.prev = 141;

                                            if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                                _iterator11.return();
                                            }

                                        case 143:
                                            _context3.prev = 143;

                                            if (!_didIteratorError11) {
                                                _context3.next = 146;
                                                break;
                                            }

                                            throw _iteratorError11;

                                        case 146:
                                            return _context3.finish(143);

                                        case 147:
                                            return _context3.finish(140);

                                        case 148:
                                            if (require.main === module && (_configurator2.default.givenCommandLineArguments.length < 3 || !possibleArguments.includes(_configurator2.default.givenCommandLineArguments[2]))) console.info('Give one of "' + possibleArguments.join('", "') + '" as command ' + 'line argument. You can provide a json string as second ' + 'parameter to dynamically overwrite some configurations.\n');
                                            // endregion
                                            // region forward nested return codes
                                            _context3.prev = 149;
                                            _context3.next = 152;
                                            return _promise2.default.all(processPromises);

                                        case 152:
                                            _context3.next = 157;
                                            break;

                                        case 154:
                                            _context3.prev = 154;
                                            _context3.t7 = _context3['catch'](149);

                                            process.exit(_context3.t7.returnCode);

                                        case 157:
                                        case 'end':
                                            return _context3.stop();
                                    }
                                }
                            }, _callee2, undefined, [[31, 45, 49, 57], [50,, 52, 56], [79, 107, 111, 119], [86, 90, 94, 102], [95,, 97, 101], [112,, 114, 118], [132, 136, 140, 148], [141,, 143, 147], [149, 154]]);
                        })(), 't0', 2);

                    case 2:
                        _context4.next = 11;
                        break;

                    case 4:
                        _context4.prev = 4;
                        _context4.t1 = _context4['catch'](0);

                        if (!_configurator2.default.debug) {
                            _context4.next = 10;
                            break;
                        }

                        throw _context4.t1;

                    case 10:
                        console.error(_context4.t1);

                    case 11:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee3, undefined, [[0, 4]]);
    }));

    return function main() {
        return _ref.apply(this, arguments);
    };
}();
if (require.main === module) main().catch(function (error) {
    throw error;
});
exports.default = main;
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQVdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBOztBQUdBOzs7O0FBRUE7O0lBQVksVTs7QUFDWjs7OztBQUNBOzs7O0FBTUE7Ozs7QUFDQTs7Ozs7Ozs7QUFOQTtBQUNBLElBQUk7QUFDQSxZQUFRLDZCQUFSO0FBQ0gsQ0FGRCxDQUVFLE9BQU8sS0FBUCxFQUFjLENBQUU7QUFLbEI7QUFDQTtBQUNBO0FBQ0EsUUFBUSxHQUFSLENBQVksa0JBQVosR0FBaUMsR0FBakM7QUFDQSxJQUFNO0FBQUEsd0ZBQU87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUVMO0FBQ00sK0RBSEQsR0FHOEI7QUFDL0IscURBQUssdUJBQWMsSUFBZCxDQUFtQixPQURPO0FBRS9CLHFEQUFLLFFBQVEsR0FGa0I7QUFHL0IsdURBQU8sSUFId0I7QUFJL0IsdURBQU87QUFKd0IsNkNBSDlCO0FBU0MsMERBVEQsR0FTc0MsRUFUdEM7QUFVQywyREFWRCxHQVV1QyxFQVZ2QztBQVdDLDZEQVhELEdBV21DLENBQ3BDLE9BRG9DLEVBQzNCLFdBRDJCLEVBQ2QsT0FEYyxFQUNMLFVBREssRUFDTyxNQURQLEVBQ2UsWUFEZixFQUVwQyxPQUZvQyxFQUUzQixNQUYyQixFQUVuQixjQUZtQixFQUVILFlBRkcsQ0FYbkM7QUFjQyw4REFkRCxHQWNzQyxFQWR0Qzs7QUFBQSxrREFlRCx1QkFBYyx5QkFBZCxDQUF3QyxNQUF4QyxHQUFpRCxDQWZoRDtBQUFBO0FBQUE7QUFBQTs7QUFnQkQ7QUFFSSxnRUFsQkgsR0FrQnNDLEVBQUMsMkJBQ3BDLHVCQUFjLHlCQUFkLENBQXdDLEtBQXhDLEVBRG1DLEVBbEJ0Qzs7QUFvQkQsZ0RBQ0ksdUJBQWMseUJBQWQsQ0FBd0MsTUFBeEMsR0FBaUQsQ0FBakQsSUFDQSxxQkFBTSx3QkFBTixDQUNJLHVCQUFjLHlCQUFkLENBQ0ksdUJBQWMseUJBQWQsQ0FBd0MsTUFBeEMsR0FBaUQsQ0FEckQsQ0FESiwwQkFHbUIsZUFIbkIsQ0FGSixFQU9JLHVCQUFjLHlCQUFkLENBQXdDLEdBQXhDO0FBQ0EsaURBNUJILEdBNEJrQixDQTVCbEI7QUE2Qkcsb0RBN0JILEdBNkJxQixlQUFLLE9BQUwsQ0FDbEIsdUJBQWMsSUFBZCxDQUFtQixPQURELDZCQUVPLEtBRlAsV0E3QnJCOztBQUFBO0FBQUEsaURBZ0NNLElBaENOO0FBQUE7QUFBQTtBQUFBOztBQWlDRyx1REFBVyxlQUFLLE9BQUwsQ0FDUCx1QkFBYyxJQUFkLENBQW1CLE9BRFosNkJBRWtCLEtBRmxCLFdBQVg7QUFqQ0g7QUFBQSxtREFvQ2UscUJBQU0sTUFBTixDQUFhLFFBQWIsQ0FwQ2Y7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTs7QUFBQTtBQXNDRyxxREFBUyxDQUFUO0FBdENIO0FBQUE7O0FBQUE7QUFBQTtBQUFBLG1EQXdDSyxzQkFBWSxVQUFDLE9BQUQsRUFBbUIsTUFBbkI7QUFBQSx1REFDZCxXQUFXLFNBQVgsQ0FBcUIsUUFBckIsRUFBK0IseUJBQzNCLG9CQUQyQixDQUEvQixFQUVHLFVBQUMsS0FBRDtBQUFBLDJEQUF1QixRQUFRLE9BQU8sS0FBUCxDQUFSLEdBQXdCLFNBQS9DO0FBQUEsaURBRkgsQ0FEYztBQUFBLDZDQUFaLENBeENMOztBQUFBO0FBNENLLCtEQTVDTCxHQTRDeUMsUUFBUSxJQUFSLENBQWEsTUFBYixDQUFvQixDQUFwQixDQTVDekM7QUE2Q0Q7O0FBQ0EsK0RBQW1CLElBQW5CLENBQXdCLFVBQUMsS0FBRCxFQUF1QjtBQUMzQztBQUNBLG9EQUFJLHFCQUFNLFVBQU4sQ0FBaUIsUUFBakIsQ0FBSixFQUNJLFdBQVcsVUFBWCxDQUFzQixRQUF0QjtBQUNKLG9EQUFJLEtBQUosRUFDSSxNQUFNLEtBQU47QUFDUCw2Q0FORDtBQU9BO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBeERDLGtEQThERyxDQUFDLENBQ0QsT0FEQyxFQUNRLFlBRFIsRUFDc0IsT0FEdEIsRUFDK0IsTUFEL0IsRUFDdUMsY0FEdkMsRUFFSCxRQUZHLENBRU0sdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsQ0FGTixDQUFELElBR0osa0JBQWtCLFFBQWxCLENBQ0ksdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsQ0FESixDQWpFQztBQUFBO0FBQUE7QUFBQTs7QUFBQSxrREFvRU8sZUFBSyxPQUFMLENBQ0EsdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixJQUQxQixNQUVFLGVBQUssT0FBTCxDQUFhLHVCQUFjLElBQWQsQ0FBbUIsT0FBaEMsQ0F0RVQ7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxtREF3RWEscUJBQU0sd0JBQU4sQ0FDRix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBRHhCO0FBQUEscUlBQzhCLGlCQUM1QixJQUQ0QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx5RUFHeEIsaUJBQU8sb0JBQVAsQ0FDQSxLQUFLLElBREwsRUFDVyx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLE1BQTFCLENBQ1AsdUJBQWMsTUFBZCxDQUFxQixjQURkLEVBRVAsdUJBQWMsTUFBZCxDQUFxQixjQUZkLEVBR1QsR0FIUyxDQUdMLFVBQUMsUUFBRDtBQUFBLCtFQUE0QixlQUFLLE9BQUwsQ0FDOUIsdUJBQWMsSUFBZCxDQUFtQixPQURXLEVBQ0YsUUFERSxDQUE1QjtBQUFBLHFFQUhLLEVBS1QsTUFMUyxDQUtGLFVBQUMsUUFBRDtBQUFBLCtFQUNMLENBQUMsdUJBQWMsSUFBZCxDQUFtQixPQUFuQixDQUEyQixVQUEzQixDQUNHLFFBREgsQ0FESTtBQUFBLHFFQUxFLENBRFgsQ0FId0I7QUFBQTtBQUFBO0FBQUE7O0FBQUEscUdBYWpCLEtBYmlCOztBQUFBO0FBQUEsNkdBZUgsdUJBQWMsS0FBZCxDQUFvQixLQWZqQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWVsQix3RUFma0I7O0FBQUEseUVBaUJwQixJQUFJLE1BQUosQ0FBVyx1QkFBYyxLQUFkLENBQW9CLEtBQXBCLENBQ1gsSUFEVyxFQUViLGVBRkUsRUFFZSxJQUZmLENBRW9CLEtBQUssSUFGekIsQ0FqQm9CO0FBQUE7QUFBQTtBQUFBOztBQUFBLDBFQXFCaEIsS0FBSyxLQUFMLElBQ0EsS0FBSyxLQUFMLENBQVcsV0FBWCxFQXRCZ0I7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSwyRUF3QlYsc0JBQVksVUFDZCxPQURjLEVBQ0ksTUFESjtBQUFBLCtFQUVSLHNCQUNOLEtBQUssSUFEQyxFQUNLLEVBQUMsTUFBTSxLQUFQLEVBREwsRUFDb0IsVUFDdEIsS0FEc0I7QUFBQSxtRkFFaEIsUUFBUSxPQUNkLEtBRGMsQ0FBUixHQUVOLFNBSnNCO0FBQUEseUVBRHBCLENBRlE7QUFBQSxxRUFBWixDQXhCVTs7QUFBQTtBQUFBLHFHQWdDVCxLQWhDUzs7QUFBQTtBQUFBO0FBQUEsMkVBa0NkLHNCQUFZLFVBQ2QsT0FEYyxFQUNJLE1BREo7QUFBQSwrRUFFUixXQUFXLE1BQVgsQ0FBa0IsS0FBSyxJQUF2QixFQUE2QixVQUNuQyxLQURtQztBQUFBLG1GQUU3QixRQUFRLE9BQU8sS0FBUCxDQUFSLEdBQXdCLFNBRks7QUFBQSx5RUFBN0IsQ0FGUTtBQUFBLHFFQUFaLENBbENjOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlEQUQ5Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQSxnREF4RWI7O0FBQUE7QUFBQSwyR0FxSGlCLElBckhqQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0VBNkhlLEtBQUssSUFBTCxDQUFVLE1BQVYsR0FBbUIscUJBQXFCLE1BQXhDLElBQ0EsS0FBSyxJQUFMLENBQVUsUUFBVixDQUFtQixvQkFBbkIsQ0FEQSxJQUVBLEtBQUssSUFBTCxDQUFVLFVBQVYsQ0FBcUIsV0FBckIsQ0EvSGY7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSx1RUFpSXFCLHNCQUFZLFVBQ2QsT0FEYyxFQUNJLE1BREo7QUFBQSwyRUFFUixXQUFXLE1BQVgsQ0FBa0IsS0FBSyxJQUF2QixFQUE2QixVQUNuQyxLQURtQztBQUFBLCtFQUU3QixRQUFRLE9BQU8sS0FBUCxDQUFSLEdBQXdCLFNBRks7QUFBQSxxRUFBN0IsQ0FGUTtBQUFBLGlFQUFaLENBaklyQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1EQXNIcUIscUJBQU0sd0JBQU4sQ0FDRix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBRHhCLEVBRUY7QUFBQSx1REFBWSxLQUFaO0FBQUEsNkNBRkUsRUFHRix1QkFBYyxRQUhaLENBdEhyQjs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFxSGlCLGdEQXJIakI7QUFBQSxpRkFxSGlCLElBckhqQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsbURBdUlhLHNCQUFZLFVBQ2QsT0FEYyxFQUNJLE1BREo7QUFBQSx1REFFUixzQkFDTix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBRHBCLEVBQzBCLEVBQUMsTUFBTSxLQUFQLEVBRDFCLEVBQ3lDLFVBQzNDLEtBRDJDO0FBQUEsMkRBRXJDLFFBQVEsT0FBTyxLQUFQLENBQVIsR0FBd0IsU0FGYTtBQUFBLGlEQUR6QyxDQUZRO0FBQUEsNkNBQVosQ0F2SWI7O0FBQUE7QUFBQTtBQUFBLG1EQTZJYSxxQkFBTSxXQUFOLENBQ04sdUJBQWMsSUFBZCxDQUFtQixnQkFEYixDQTdJYjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsbURBZ0phLHNCQUFZLFVBQ2QsT0FEYyxFQUNJLE1BREo7QUFBQSx1REFFUixzQkFDTix1QkFBYyxJQUFkLENBQW1CLGdCQURiLEVBQytCLEVBQUMsTUFBTSxLQUFQLEVBRC9CLEVBQzhDLFVBQ2hELEtBRGdEO0FBQUEsMkRBRTFDLFFBQVEsT0FBTyxLQUFQLENBQVIsR0FBd0IsU0FGa0I7QUFBQSxpREFEOUMsQ0FGUTtBQUFBLDZDQUFaLENBaEpiOztBQUFBO0FBdUpEO0FBRU0sK0RBekpMLEdBMEpHLGlCQUFPLGtDQUFQLENBQ0ksdUJBQWMsS0FBZCxDQUFvQixLQUR4QixFQUVJLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUIsQ0FBZ0MsSUFGcEMsRUFHSSx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLE1BQTFCLENBQ0ksdUJBQWMsTUFBZCxDQUFxQixjQUR6QixFQUVJLHVCQUFjLE1BQWQsQ0FBcUIsY0FGekIsRUFHRSxHQUhGLENBR00sVUFBQyxRQUFEO0FBQUEsdURBQTRCLGVBQUssT0FBTCxDQUM5Qix1QkFBYyxJQUFkLENBQW1CLE9BRFcsRUFDRixRQURFLENBQTVCO0FBQUEsNkNBSE4sRUFLRSxNQUxGLENBS1MsVUFBQyxRQUFEO0FBQUEsdURBQ0wsQ0FBQyx1QkFBYyxJQUFkLENBQW1CLE9BQW5CLENBQTJCLFVBQTNCLENBQXNDLFFBQXRDLENBREk7QUFBQSw2Q0FMVCxDQUhKLEVBVUksdUJBQWMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixTQVYvQixDQTFKSDs7QUFBQSxpREFxS0csQ0FBQyxPQUFELEVBQVUsV0FBVixFQUF1QixVQUF2QixFQUFtQyxNQUFuQyxFQUEyQyxRQUEzQyxDQUNBLFFBQVEsSUFBUixDQUFhLENBQWIsQ0FEQSxDQXJLSDtBQUFBO0FBQUE7QUFBQTs7QUF3S08sb0RBeEtQLEdBd0swQixLQXhLMUI7O0FBeUtTLGtEQXpLVCxHQXlLMkIsU0FBbEIsTUFBa0IsR0FBVztBQUMvQjs7OztBQUlBLG9EQUFJLFFBQUosRUFDSTtBQUNKLDJEQUFXLElBQVg7QUFDQSxxREFDSSxJQUFNLFNBRFYsSUFFSSx1QkFBYyxTQUFkLENBQXdCLFFBQXhCLENBQWlDLFVBRnJDO0FBSUksd0RBQUksdUJBQWMsU0FBZCxDQUF3QixRQUF4QixDQUFpQyxVQUFqQyxDQUNDLGNBREQsQ0FDZ0IsU0FEaEIsQ0FBSjtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUdJLDZHQUE4Qix1QkFDekIsU0FEeUIsQ0FDZixRQURlLENBQ04sVUFETSxDQUNLLFNBREwsQ0FBOUIsaUhBRUU7QUFBQSxvRUFGUyxRQUVUOztBQUNFLG9FQUFNLFlBQ0YsaUJBQU8sdUJBQVAsQ0FDSSxRQURKLEVBQ2MsdUJBQWMsTUFBZCxDQUFxQixPQURuQyxFQUVJLHVCQUFjLE1BQWQsQ0FBcUIsWUFBckIsQ0FDSyxNQUhULEVBSUksdUJBQWMsVUFKbEIsRUFLSSx1QkFBYyxJQUFkLENBQW1CLE9BTHZCLEVBTUksdUJBQWMsSUFBZCxDQUFtQixNQUFuQixDQUEwQixLQUExQixDQUFnQyxJQU5wQyxFQU9JLHVCQUFjLElBQWQsQ0FBbUIsTUFQdkIsRUFRSSx1QkFBYyxNQUFkLENBQXFCLGNBUnpCLEVBU0ksdUJBQWMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixTQVQvQixFQVVJLHVCQUFjLE9BQWQsQ0FBc0IsSUFBdEIsQ0FDSyxhQVhULEVBWUksdUJBQWMsT0FBZCxDQUNLLGtCQWJULEVBY0ksdUJBQWMsUUFkbEIsQ0FESjtBQWdCQSxvRUFBSSxhQUFKO0FBQ0Esb0VBQUksU0FBSixFQUNJLE9BQU8saUJBQU8sa0JBQVAsQ0FDSCxTQURHLEVBQ08sdUJBQWMsS0FBZCxDQUFvQixLQUQzQixFQUVILHVCQUFjLElBRlgsQ0FBUDtBQUdKLG9FQUNJLE9BQU8sSUFBUCxLQUFnQixRQUFoQixJQUNBLHVCQUFjLEtBQWQsQ0FBb0IsS0FBcEIsQ0FBMEIsSUFBMUIsQ0FGSixFQUdFO0FBQ0Usd0VBQU0sYUFDRixpQkFBTyxzQkFBUCxDQUNJLGlCQUFPLFdBQVAsQ0FDSSx1QkFBYyxLQUFkLENBQW9CLE9BQXBCLENBQ0ssVUFGVCxDQURKLEVBSU8sRUFBQyxVQUFVLFNBQVgsRUFKUCxDQURKO0FBTUE7Ozs7QUFJQSx3RUFDSSx1QkFBYyxLQUFkLENBQW9CLEtBQXBCLENBQ0ksSUFESixFQUVFLGVBRkYsS0FFc0IsSUFGdEIsSUFHQSxxQkFBTSxVQUFOLENBQWlCLFVBQWpCLENBSkosRUFNSSxXQUFXLFNBQVgsQ0FBcUIsVUFBckIsRUFBK0IsS0FBL0I7QUFDUDtBQUNKO0FBakRMO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUpKLGlEQVIrQjtBQUFBO0FBQUE7O0FBQUE7QUE4RC9CLHFHQUErQix1QkFBYyxJQUFkLENBQW1CLE1BQWxEO0FBQUEsNERBQVcsVUFBWDs7QUFDSSw0REFBSSxjQUFZLHFCQUFNLFVBQU4sQ0FBaUIsVUFBakIsQ0FBaEI7QUFDSTtBQUNBLHVFQUFXLFVBQVgsQ0FBc0IsVUFBdEI7QUFIUjtBQTlEK0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWtFbEMsNkNBM09KOztBQTRPRywrREFBbUIsSUFBbkIsQ0FBd0IsTUFBeEI7QUFDQTs7OztBQUlBLDREQUFnQixJQUFoQixDQUFxQixzQkFBWSxVQUM3QixPQUQ2QixFQUNYLE1BRFcsRUFFdkI7QUFDTixvREFBTSx1QkFBcUMsQ0FDdkMsdUJBQWMsV0FBZCxDQUEwQixLQUExQixDQUFnQyxTQUFoQyxJQUE2QyxFQUROLEVBRXpDLE1BRnlDLENBRWxDLG1CQUZrQyxDQUEzQztBQUdBLHdEQUFRLElBQVIsQ0FBYSxjQUFjLENBQ3BCLHVCQUFjLFdBQWQsQ0FBMEIsS0FBMUIsQ0FBZ0MsT0FBbkMsU0FDQSxxQkFBcUIsSUFBckIsQ0FBMEIsR0FBMUIsQ0FGdUIsRUFHekIsSUFIeUIsRUFBZCxHQUdGLEdBSFg7QUFJQSxvREFBTSxlQUE0QiwwQkFDOUIsdUJBQWMsV0FBZCxDQUEwQixLQUExQixDQUFnQyxPQURGLEVBRTlCLG9CQUY4QixFQUVSLG1CQUZRLENBQWxDO0FBR0Esb0RBQU0sK0JBQXdDLFNBQXhDLDRCQUF3QyxHQUVwQztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNOLHlHQUVJLHVCQUFjLEtBQWQsQ0FBb0IsZUFGeEIsaUhBR0U7QUFBQSxnRUFGUSxVQUVSOztBQUNFLGdFQUFNLGFBQW9CLGVBQUssSUFBTCxDQUN0Qix1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLElBREosRUFDVSxVQURWLENBQTFCO0FBRUEsZ0VBQU0sYUFBb0IsZUFBSyxJQUFMLENBQ3RCLHVCQUFjLElBQWQsQ0FBbUIsTUFBbkIsQ0FBMEIsSUFESixFQUNVLFVBRFYsQ0FBMUI7QUFFQTtBQUNBLGdFQUFJLHFCQUFNLGVBQU4sQ0FBc0IsVUFBdEIsQ0FBSixFQUF1QztBQUNuQyxvRUFBSSxxQkFBTSxlQUFOLENBQXNCLFVBQXRCLENBQUosRUFDSSxpQkFBMkIsSUFBM0IsQ0FDSSxVQURKLEVBQ2dCLEVBQUMsTUFBTSxLQUFQLEVBRGhCO0FBRUoscUZBQU0sMEJBQU4sQ0FDSSxVQURKLEVBQ2dCLFVBRGhCO0FBRUgsNkRBTkQsTUFNTyxJQUFJLHFCQUFNLFVBQU4sQ0FBaUIsVUFBakIsQ0FBSixFQUNILHFCQUFNLFlBQU4sQ0FBbUIsVUFBbkIsRUFBK0IsVUFBL0I7QUFDUDtBQWxCSztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW1CTjtBQUNILGlEQXRCRDtBQXVCQSxvREFBTSxlQUF3QixxQkFBTSxzQkFBTixDQUMxQixPQUQwQixFQUNqQixNQURpQixFQUNULElBRFMsRUFFdEIsUUFBUSxJQUFSLENBQWEsQ0FBYixNQUFvQixPQURELEdBRW5CLDRCQUZtQixHQUVZLE1BSFQsQ0FBOUI7QUFsQ007QUFBQTtBQUFBOztBQUFBO0FBc0NOLHFHQUFvQyxxQkFBTSxlQUExQztBQUFBLDREQUFXLGNBQVg7O0FBQ0kscUVBQWEsRUFBYixDQUFnQixjQUFoQixFQUFnQyxZQUFoQztBQURKO0FBdENNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBd0NOLCtEQUFlLElBQWYsQ0FBb0IsWUFBcEI7QUFDSCw2Q0EzQ29CLENBQXJCO0FBNENKO0FBQ0E7QUE5UkM7QUFBQTs7QUFBQTtBQUFBLGtEQWdTRyx1QkFBYyxPQUFkLElBQ0EsdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsTUFBK0MsWUFqU2xEO0FBQUE7QUFBQTtBQUFBOztBQW1TRztBQUNNLCtEQXBTVCxHQXFTTyxpQkFBTyx3QkFBUCxDQUNJLHVCQUFjLGNBQWQsRUFBOEIsU0FBOUIsQ0FBd0MsUUFENUMsRUFFSSx1QkFBYyxNQUFkLENBQXFCLE9BRnpCLEVBR0ksdUJBQWMsTUFBZCxDQUFxQixZQUFyQixDQUFrQyxNQUh0QyxFQUlJLHVCQUFjLFVBSmxCLEVBSThCLHVCQUFjLElBQWQsQ0FBbUIsT0FKakQsRUFLSSx1QkFBYyxJQUFkLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWdDLElBTHBDLEVBTUksdUJBQWMsSUFBZCxDQUFtQixNQU52QixFQU9FLFNBNVNUO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxvRkE2U29DLG1CQTdTcEM7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUE2U2MsOERBN1NkO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBOFNPLHlGQUE4QixtQkFBbUIsU0FBakQ7QUFBVywwREFBWDs7QUFDSSxvREFBSSxDQUFDLG9CQUFvQixRQUFwQixDQUE2QixVQUE3QixDQUFMLEVBQTZDO0FBQUE7QUFDekMsNERBQU0scUJBQXFCLFNBQXJCLGtCQUFxQixDQUN2QixNQUR1QixFQUNSLElBRFEsRUFFdkIsa0JBRnVCLEVBR3ZCLElBSHVCLEVBSXZCLG1CQUp1QixFQUt2QjtBQUVBO0FBUHVCO0FBQUEsbUVBUXZCLElBQUksUUFBSixDQUNJLFFBREosRUFDYyxNQURkLEVBQ3NCLG9CQUR0QixFQUVJLE1BRkosRUFFWSxxQkFGWixFQUVtQyxVQUZuQyxFQUdJLGFBQWEsbUJBQ1QsdUJBQ0sseUJBREwsQ0FDK0IsQ0FEL0IsQ0FEUyxFQUdYLElBSFcsRUFBYixHQUdXLEdBTmYsRUFRSSxNQVJKLEVBUVksSUFSWixFQVFrQixrQkFSbEIsRUFRc0MsSUFSdEMsRUFTSSxtQkFUSixFQVN5QixRQVR6QixDQVJ1QjtBQUFBLHlEQUEzQjtBQWtCQSw0REFBTSxVQUFpQixtQkFDbkIsTUFEbUIsMEJBQ0ksa0JBREosa0JBRWIsbUJBRmEsRUFFUSxVQUZSLENBQXZCO0FBR0EsZ0VBQVEsSUFBUixlQUF5QixPQUF6QjtBQUNBLHdFQUFnQixJQUFoQixDQUFxQixzQkFBWSxVQUM3QixPQUQ2QixFQUNYLE1BRFc7QUFBQSxtRUFFdkIscUJBQU0sa0JBQU4sQ0FDTix5QkFDSSxPQURKLEVBQ2EsbUJBRGIsRUFDa0MsVUFDMUIsS0FEMEI7QUFBQSx1RUFFcEIsUUFBUSxPQUFPLEtBQVAsQ0FBUixHQUF3QixTQUZKO0FBQUEsNkRBRGxDLENBRE0sQ0FGdUI7QUFBQSx5REFBWixDQUFyQjtBQXZCeUM7QUErQjVDO0FBaENMLDZDQTlTUDtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBZ1ZEO0FBQ0E7QUFDTSxzREFsVkwsR0FrVmtCLFNBQWIsVUFBYSxDQUFDLElBQUQsRUFBc0I7QUFDckMsb0RBQUksY0FBSjtBQUNBLG9EQUFJLE1BQU0sT0FBTixDQUFjLHVCQUFjLFdBQWQsQ0FBMEIsSUFBMUIsQ0FBZCxDQUFKLEVBQ0ksUUFBUSx1QkFBYyxXQUFkLENBQTBCLElBQTFCLENBQVIsQ0FESixLQUdJLFFBQVEsQ0FBQyx1QkFBYyxXQUFkLENBQTBCLElBQTFCLENBQUQsQ0FBUjs7QUFMaUMsNkVBTTFCLElBTjBCO0FBT2pDLHdEQUFNLHFCQUFxQixTQUFyQixrQkFBcUIsQ0FDdkIsTUFEdUIsRUFDUixJQURRLEVBQ1U7QUFFakM7QUFIdUI7QUFBQSwrREFJdkIsSUFBSSxRQUFKLENBQ0ksUUFESixFQUNjLE1BRGQsRUFDc0IsTUFEdEIsRUFFSSxhQUFhLEtBQUssY0FBTCxDQUNULFdBRFMsSUFFVCxLQUFLLFNBRkksR0FFUSxNQUZyQixDQUZKLEVBS0UsTUFMRixFQUtVLElBTFYsRUFLZ0IsSUFMaEIsQ0FKdUI7QUFBQSxxREFBM0I7QUFVQSx3REFBSSxtQkFBbUIsTUFBbkIseUNBQUosRUFDSSxnQkFBZ0IsSUFBaEIsQ0FBcUIsc0JBQVksVUFDN0IsT0FENkIsRUFDWCxNQURXLEVBRXZCO0FBQ04sNERBQU0sdUJBQXFDLENBQ3ZDLEtBQUssU0FBTCxJQUFrQixFQURxQixFQUV6QyxNQUZ5QyxDQUVsQyxtQkFGa0MsQ0FBM0M7QUFHQSxnRUFBUSxJQUFSLENBQWEsY0FBYyxDQUNwQixLQUFLLE9BQVIsU0FBcUIscUJBQXFCLElBQXJCLENBQ2pCLEdBRGlCLENBREUsRUFHekIsSUFIeUIsRUFBZCxHQUdGLEdBSFg7QUFJQSw0REFBTSxlQUNGLDBCQUNJLEtBQUssT0FEVCxFQUNrQixvQkFEbEIsRUFFSSxtQkFGSixDQURKO0FBSUEsNERBQU0sZUFDRixxQkFBTSxzQkFBTixDQUE2QixPQUE3QixFQUFzQyxNQUF0QyxDQURKO0FBWk07QUFBQTtBQUFBOztBQUFBO0FBY04sNkdBRUkscUJBQU0sZUFGVjtBQUFBLG9FQUNVLGNBRFY7O0FBSUksNkVBQWEsRUFBYixDQUFnQixjQUFoQixFQUFnQyxZQUFoQztBQUpKO0FBZE07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFtQk4sdUVBQWUsSUFBZixDQUFvQixZQUFwQjtBQUNILHFEQXRCb0IsQ0FBckI7QUFsQjZCOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQU1yQyxxR0FBMEIsS0FBMUIsaUhBQWlDO0FBQUEsNERBQXRCLElBQXNCOztBQUFBLCtEQUF0QixJQUFzQjtBQW1DaEM7QUF6Q29DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUEwQ3hDLDZDQTVYQTtBQTZYRDs7O0FBN1hDLGlEQThYRyxDQUFDLFVBQUQsRUFBYSxNQUFiLEVBQXFCLFFBQXJCLENBQ0EsdUJBQWMseUJBQWQsQ0FBd0MsQ0FBeEMsQ0FEQSxDQTlYSDtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLG1EQWlZUyxrQkFBUSxHQUFSLENBQVksZUFBWixDQWpZVDs7QUFBQTtBQWtZRyx1REFBVyx1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQUFYO0FBbFlIO0FBQUE7O0FBQUE7QUFtWU0sZ0RBQUksQ0FDUCxNQURPLEVBQ0MsY0FERCxFQUNpQixZQURqQixFQUMrQixPQUQvQixFQUVULFFBRlMsQ0FFQSx1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQUZBLENBQUosRUFHSCxXQUFXLHVCQUFjLHlCQUFkLENBQXdDLENBQXhDLENBQVg7O0FBdFlIO0FBMFlELG9EQTFZQyxHQTBZa0IsS0ExWWxCOztBQTJZQyx3REEzWUQsR0EyWWdCLFNBQWYsWUFBZSxHQUFrQztBQUNuRCxvREFBSSxDQUFDLFFBQUw7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDSSwwR0FBeUMsa0JBQXpDO0FBQUEsZ0VBQVcsaUJBQVg7O0FBQ0k7QUFESjtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpREFHQSxXQUFXLElBQVg7QUFDSCw2Q0FoWkk7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBaVpMLDBGQUFvQyxxQkFBTSxlQUExQztBQUFXLDhEQUFYOztBQUNJLHdEQUFRLEVBQVIsQ0FBVyxjQUFYLEVBQTJCLFlBQTNCO0FBREosNkNBalpLO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTs7QUFBQTtBQUFBOztBQUFBO0FBbVpMLGdEQUFJLFFBQVEsSUFBUixLQUFpQixNQUFqQixLQUNBLHVCQUFjLHlCQUFkLENBQXdDLE1BQXhDLEdBQWlELENBQWpELElBQ0EsQ0FBQyxrQkFBa0IsUUFBbEIsQ0FDRyx1QkFBYyx5QkFBZCxDQUF3QyxDQUF4QyxDQURILENBRkQsQ0FBSixFQUtJLFFBQVEsSUFBUixDQUNJLGtCQUFnQixrQkFBa0IsSUFBbEIsQ0FBdUIsTUFBdkIsQ0FBaEIscUJBQ0EseURBREEsR0FFQSwyREFISjtBQUlKO0FBQ0E7QUE3Wks7QUFBQTtBQUFBLG1EQStaSyxrQkFBUSxHQUFSLENBQVksZUFBWixDQS9aTDs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQWlhRCxvREFBUSxJQUFSLENBQWEsYUFBTSxVQUFuQjs7QUFqYUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQSw2QkFxYUQsdUJBQWMsS0FyYWI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUF3YUQsZ0NBQVEsS0FBUjs7QUF4YUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBUDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFOO0FBMmFBLElBQUksUUFBUSxJQUFSLEtBQWlCLE1BQXJCLEVBQ0ksT0FBTyxLQUFQLENBQWEsVUFBQyxLQUFELEVBQXNCO0FBQy9CLFVBQU0sS0FBTjtBQUNILENBRkQ7a0JBR1csSTtBQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImluZGV4LmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHtcbiAgICBDaGlsZFByb2Nlc3MsIGV4ZWMgYXMgZXhlY0NoaWxkUHJvY2Vzcywgc3Bhd24gYXMgc3Bhd25DaGlsZFByb2Nlc3Ncbn0gZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHR5cGUge0ZpbGUsIFBsYWluT2JqZWN0fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkgZnJvbSAncmltcmFmJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IGNvbmZpZ3VyYXRpb24gZnJvbSAnLi9jb25maWd1cmF0b3IuY29tcGlsZWQnXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuaW1wb3J0IHR5cGUge1Jlc29sdmVkQnVpbGRDb25maWd1cmF0aW9ufSBmcm9tICcuL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vIE5PVEU6IFNwZWNpZmllcyBudW1iZXIgb2YgYWxsb3dlZCB0aHJlYWRzIHRvIHNwYXduLlxuLy8gSWdub3JlVHlwZUNoZWNrXG5wcm9jZXNzLmVudi5VVl9USFJFQURQT09MX1NJWkUgPSAxMjhcbmNvbnN0IG1haW4gPSBhc3luYyAoKTpQcm9taXNlPGFueT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJlZ2lvbiBjb250cm9sbGVyXG4gICAgICAgIGNvbnN0IGNoaWxkUHJvY2Vzc09wdGlvbnM6T2JqZWN0ID0ge1xuICAgICAgICAgICAgY3dkOiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgIGVudjogcHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCdcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3NlczpBcnJheTxDaGlsZFByb2Nlc3M+ID0gW11cbiAgICAgICAgY29uc3QgcHJvY2Vzc1Byb21pc2VzOkFycmF5PFByb21pc2U8YW55Pj4gPSBbXVxuICAgICAgICBjb25zdCBwb3NzaWJsZUFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJ2J1aWxkJywgJ2J1aWxkOmRsbCcsICdjbGVhcicsICdkb2N1bWVudCcsICdsaW50JywgJ3ByZWluc3RhbGwnLFxuICAgICAgICAgICAgJ3NlcnZlJywgJ3Rlc3QnLCAndGVzdDpicm93c2VyJywgJ2NoZWNrOnR5cGUnXVxuICAgICAgICBjb25zdCBjbG9zZUV2ZW50SGFuZGxlcnM6QXJyYXk8RnVuY3Rpb24+ID0gW11cbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAvLyByZWdpb24gdGVtcG9yYXJ5IHNhdmUgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvbnNcbiAgICAgICAgICAgIC8vIE5PVEU6IFdlIG5lZWQgYSBjb3B5IG9mIGdpdmVuIGFyZ3VtZW50cyBhcnJheS5cbiAgICAgICAgICAgIGxldCBkeW5hbWljQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHtnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOlxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5zbGljZSgpfVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAzICYmXG4gICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nUGFyc2VFbmNvZGVkT2JqZWN0KFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sICdjb25maWd1cmF0aW9uJylcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMucG9wKClcbiAgICAgICAgICAgIGxldCBjb3VudDpudW1iZXIgPSAwXG4gICAgICAgICAgICBsZXQgZmlsZVBhdGg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmApXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgYC5keW5hbWljQ29uZmlndXJhdGlvbi0ke2NvdW50fS5qc29uYClcbiAgICAgICAgICAgICAgICBpZiAoIShhd2FpdCBUb29scy5pc0ZpbGUoZmlsZVBhdGgpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjb3VudCArPSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uKTp2b2lkID0+XG4gICAgICAgICAgICAgICAgZmlsZVN5c3RlbS53cml0ZUZpbGUoZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAgICBkeW5hbWljQ29uZmlndXJhdGlvblxuICAgICAgICAgICAgICAgICksIChlcnJvcjo/RXJyb3IpOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgIGNvbnN0IGFkZGl0aW9uYWxBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IHByb2Nlc3MuYXJndi5zcGxpY2UoMylcbiAgICAgICAgICAgIC8vIC8gcmVnaW9uIHJlZ2lzdGVyIGV4aXQgaGFuZGxlciB0byB0aWR5IHVwXG4gICAgICAgICAgICBjbG9zZUV2ZW50SGFuZGxlcnMucHVzaCgoZXJyb3I6P0Vycm9yKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnVubGlua1N5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIC8gZW5kcmVnaW9uXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBoYW5kbGUgY2xlYXJcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgTk9URTogU29tZSB0YXNrcyBjb3VsZCBkZXBlbmQgb24gcHJldmlvdXNseSBjcmVhdGVkIGRsbFxuICAgICAgICAgICAgICAgIHBhY2thZ2VzIHNvIGEgY2xlYW4gc2hvdWxkIG5vdCBiZSBwZXJmb3JtZWQgaW4gdGhhdCBjYXNlLlxuICAgICAgICAgICAgICAgIE5PVEU6IElmIHdlIGhhdmUgYSBkZXBlbmRlbmN5IGN5Y2xlIHdlIG5lZWQgdG8gcHJlc2VydmUgZmlsZXNcbiAgICAgICAgICAgICAgICBkdXJpbmcgcHJlaW5zdGFsbCBwaGFzZS5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoIVtcbiAgICAgICAgICAgICAgICAnYnVpbGQnLCAncHJlaW5zdGFsbCcsICdzZXJ2ZScsICd0ZXN0JywgJ3Rlc3Q6YnJvd3NlcidcbiAgICAgICAgICAgIF0uaW5jbHVkZXMoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKSAmJlxuICAgICAgICAgICAgcG9zc2libGVBcmd1bWVudHMuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlXG4gICAgICAgICAgICAgICAgKSA9PT0gcGF0aC5yZXNvbHZlKGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmVzIGFsbCBjb21waWxlZCBmaWxlcy5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgVG9vbHMud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCBhc3luYyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTpGaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICApOlByb21pc2U8P2ZhbHNlPiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXcgUmVnRXhwKGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0uZmlsZVBhdGhQYXR0ZXJuKS50ZXN0KGZpbGUucGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXRzICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cy5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCB7Z2xvYjogZmFsc2V9LCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjo/RXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IGVycm9yID8gcmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IHJlc29sdmUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZmlsZVN5c3RlbS51bmxpbmsoZmlsZS5wYXRoLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6RmlsZSBvZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVG9vbHMud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpOmZhbHNlID0+IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUubmFtZS5sZW5ndGggPiAnLmRsbC1tYW5pZmVzdC5qc29uJy5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLm5hbWUuZW5kc1dpdGgoJy5kbGwtbWFuaWZlc3QuanNvbicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5uYW1lLnN0YXJ0c1dpdGgoJ25wbS1kZWJ1ZycpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZmlsZVN5c3RlbS51bmxpbmsoZmlsZS5wYXRoLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKCkpKVxuICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCB7Z2xvYjogZmFsc2V9LCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgICAgICBpZiAoYXdhaXQgVG9vbHMuaXNEaXJlY3RvcnkoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5hcGlEb2N1bWVudGF0aW9uXG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5hcGlEb2N1bWVudGF0aW9uLCB7Z2xvYjogZmFsc2V9LCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSBidWlsZFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9XG4gICAgICAgICAgICAgICAgSGVscGVyLnJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICAgICAgICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSksXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcylcbiAgICAgICAgICAgIGlmIChbJ2J1aWxkJywgJ2J1aWxkOmRsbCcsICdkb2N1bWVudCcsICd0ZXN0J10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5hcmd2WzJdXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRpZGllZFVwOmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnN0IHRpZHlVcDpGdW5jdGlvbiA9ICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgRGV0ZXJtaW5lcyBhbGwgbm9uZSBqYXZhU2NyaXB0IGVudGl0aWVzIHdoaWNoIGhhdmUgYmVlblxuICAgICAgICAgICAgICAgICAgICAgICAgZW1pdHRlZCBhcyBzaW5nbGUgbW9kdWxlIHRvIHJlbW92ZS5cbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpZGllZFVwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIHRpZGllZFVwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2YgY29uZmlndXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCwgY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm5vcm1hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0eXBlOj9zdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNbdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCB7J1tuYW1lXSc6IGNodW5rTmFtZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IENsb3NlIGhhbmRsZXIgaGF2ZSB0byBiZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bmNocm9ub3VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5pc0ZpbGVTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0uY2htb2RTeW5jKGZpbGVQYXRoLCAnNzU1JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aDo/c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24ucGF0aC50aWR5VXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGggJiYgVG9vbHMuaXNGaWxlU3luYyhmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogQ2xvc2UgaGFuZGxlciBoYXZlIHRvIGJlIHN5bmNocm9ub3VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0udW5saW5rU3luYyhmaWxlUGF0aClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2xvc2VFdmVudEhhbmRsZXJzLnB1c2godGlkeVVwKVxuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIFRyaWdnZXJzIGNvbXBsZXRlIGFzc2V0IGNvbXBpbGluZyBhbmQgYnVuZGxlcyB0aGVtIGludG8gdGhlXG4gICAgICAgICAgICAgICAgICAgIGZpbmFsIHByb2R1Y3RpdmUgb3V0cHV0LlxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tYW5kTGluZUFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5jb21tYW5kTGluZS5idWlsZC5hcmd1bWVudHMgfHwgW11cbiAgICAgICAgICAgICAgICAgICAgKS5jb25jYXQoYWRkaXRpb25hbEFyZ3VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdSdW5uaW5nIFwiJyArIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke2NvbmZpZ3VyYXRpb24uY29tbWFuZExpbmUuYnVpbGQuY29tbWFuZH0gYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kTGluZUFyZ3VtZW50cy5qb2luKCcgJylcbiAgICAgICAgICAgICAgICAgICAgKS50cmltKCkgKyAnXCInKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3M6Q2hpbGRQcm9jZXNzID0gc3Bhd25DaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lLmJ1aWxkLmNvbW1hbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kTGluZUFyZ3VtZW50cywgY2hpbGRQcm9jZXNzT3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29weUFkZGl0aW9uYWxGaWxlc0FuZFRpZHlVcDpGdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnBhcmFtZXRlcjpBcnJheTxhbnk+XG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZmlsZXMuYWRkaXRpb25hbFBhdGhzXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VQYXRoOnN0cmluZyA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5iYXNlLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRQYXRoOnN0cmluZyA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhzb3VyY2VQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKHRhcmdldFBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkuc3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoLCB7Z2xvYjogZmFsc2V9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5jb3B5RGlyZWN0b3J5UmVjdXJzaXZlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVBhdGgsIHRhcmdldFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChUb29scy5pc0ZpbGVTeW5jKHNvdXJjZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5jb3B5RmlsZVN5bmMoc291cmNlUGF0aCwgdGFyZ2V0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpZHlVcCguLi5wYXJhbWV0ZXIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2VIYW5kbGVyOkZ1bmN0aW9uID0gVG9vbHMuZ2V0UHJvY2Vzc0Nsb3NlSGFuZGxlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUsIHJlamVjdCwgbnVsbCwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuYXJndlsyXSA9PT0gJ2J1aWxkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKSA/IGNvcHlBZGRpdGlvbmFsRmlsZXNBbmRUaWR5VXAgOiB0aWR5VXApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudE5hbWU6c3RyaW5nIG9mIFRvb2xzLmNsb3NlRXZlbnROYW1lcylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzcy5vbihjbG9zZUV2ZW50TmFtZSwgY2xvc2VIYW5kbGVyKVxuICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Nlcy5wdXNoKGNoaWxkUHJvY2VzcylcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSBwcmVpbnN0YWxsXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubGlicmFyeSAmJlxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ3ByZWluc3RhbGwnXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBQZXJmb3JtIGFsbCBmaWxlIHNwZWNpZmljIHByZXByb2Nlc3Npbmcgc3R1ZmYuXG4gICAgICAgICAgICAgICAgY29uc3QgdGVzdE1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID1cbiAgICAgICAgICAgICAgICAgICAgSGVscGVyLmRldGVybWluZU1vZHVsZUxvY2F0aW9ucyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25bJ3Rlc3Q6YnJvd3NlciddLmluamVjdGlvbi5pbnRlcm5hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHMubm9ybWFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLCBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgKS5maWxlUGF0aHNcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbiBvZiBidWlsZENvbmZpZ3VyYXRpb25zKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoOnN0cmluZyBvZiBidWlsZENvbmZpZ3VyYXRpb24uZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXN0TW9kdWxlRmlsZVBhdGhzLmluY2x1ZGVzKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsOk9iamVjdCwgc2VsZjpQbGFpbk9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOnR5cGVvZiBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQXJndW1lbnRzOkFycmF5PHN0cmluZz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoOnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ2xvYmFsJywgJ3NlbGYnLCAnYnVpbGRDb25maWd1cmF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwYXRoJywgJ2FkZGl0aW9uYWxBcmd1bWVudHMnLCAnZmlsZVBhdGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JldHVybiBgJyArIGJ1aWxkQ29uZmlndXJhdGlvbltcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLnRyaW0oKSArICdgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLCBzZWxmLCBidWlsZENvbmZpZ3VyYXRpb24sIHBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQXJndW1lbnRzLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tYW5kOnN0cmluZyA9IGV2YWx1YXRpb25GdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLCBjb25maWd1cmF0aW9uLCBidWlsZENvbmZpZ3VyYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgsIGFkZGl0aW9uYWxBcmd1bWVudHMsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgUnVubmluZyBcIiR7Y29tbWFuZH1cImApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gVG9vbHMuaGFuZGxlQ2hpbGRQcm9jZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGVjQ2hpbGRQcm9jZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZCwgY2hpbGRQcm9jZXNzT3B0aW9ucywgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBoYW5kbGUgcmVtYWluaW5nIHRhc2tzXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVUYXNrID0gKHR5cGU6c3RyaW5nKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgdGFza3M6QXJyYXk8T2JqZWN0PlxuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmVbdHlwZV0pKVxuICAgICAgICAgICAgICAgICAgICB0YXNrcyA9IGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmVbdHlwZV1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRhc2tzID0gW2NvbmZpZ3VyYXRpb24uY29tbWFuZExpbmVbdHlwZV1dXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YXNrOk9iamVjdCBvZiB0YXNrcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWw6T2JqZWN0LCBzZWxmOlBsYWluT2JqZWN0LCBwYXRoOnR5cGVvZiBwYXRoXG4gICAgICAgICAgICAgICAgICAgICk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2dsb2JhbCcsICdzZWxmJywgJ3BhdGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdyZXR1cm4gJyArICh0YXNrLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaW5kaWNhdG9yJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgPyB0YXNrLmluZGljYXRvciA6ICd0cnVlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICkoZ2xvYmFsLCBzZWxmLCBwYXRoKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZhbHVhdGlvbkZ1bmN0aW9uKGdsb2JhbCwgY29uZmlndXJhdGlvbiwgcGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1hbmRMaW5lQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suYXJndW1lbnRzIHx8IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5jb25jYXQoYWRkaXRpb25hbEFyZ3VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ1J1bm5pbmcgXCInICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHt0YXNrLmNvbW1hbmR9IGAgKyBjb21tYW5kTGluZUFyZ3VtZW50cy5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkudHJpbSgpICsgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3M6Q2hpbGRQcm9jZXNzID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bhd25DaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXNrLmNvbW1hbmQsIGNvbW1hbmRMaW5lQXJndW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzT3B0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUhhbmRsZXI6RnVuY3Rpb24gPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5nZXRQcm9jZXNzQ2xvc2VIYW5kbGVyKHJlc29sdmUsIHJlamVjdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUV2ZW50TmFtZTpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuY2xvc2VFdmVudE5hbWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Mub24oY2xvc2VFdmVudE5hbWUsIGNsb3NlSGFuZGxlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Nlcy5wdXNoKGNoaWxkUHJvY2VzcylcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIC8gcmVnaW9uIGEtL3N5bmNocm9ub3VzXG4gICAgICAgICAgICBpZiAoWydkb2N1bWVudCcsICd0ZXN0J10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvY2Vzc1Byb21pc2VzKVxuICAgICAgICAgICAgICAgIGhhbmRsZVRhc2soY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKVxuICAgICAgICAgICAgfSBlbHNlIGlmIChbXG4gICAgICAgICAgICAgICAgJ2xpbnQnLCAndGVzdDpicm93c2VyJywgJ2NoZWNrOnR5cGUnLCAnc2VydmUnXG4gICAgICAgICAgICBdLmluY2x1ZGVzKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSkpXG4gICAgICAgICAgICAgICAgaGFuZGxlVGFzayhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pXG4gICAgICAgICAgICAvLyAvIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpbmlzaGVkOmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICBjb25zdCBjbG9zZUhhbmRsZXIgPSAoLi4ucGFyYW1ldGVyOkFycmF5PGFueT4pOnZvaWQgPT4ge1xuICAgICAgICAgICAgaWYgKCFmaW5pc2hlZClcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNsb3NlRXZlbnRIYW5kbGVyOkZ1bmN0aW9uIG9mIGNsb3NlRXZlbnRIYW5kbGVycylcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VFdmVudEhhbmRsZXIoLi4ucGFyYW1ldGVyKVxuICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBjbG9zZUV2ZW50TmFtZTpzdHJpbmcgb2YgVG9vbHMuY2xvc2VFdmVudE5hbWVzKVxuICAgICAgICAgICAgcHJvY2Vzcy5vbihjbG9zZUV2ZW50TmFtZSwgY2xvc2VIYW5kbGVyKVxuICAgICAgICBpZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUgJiYgKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA8IDMgfHxcbiAgICAgICAgICAgICFwb3NzaWJsZUFyZ3VtZW50cy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pXG4gICAgICAgICkpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgICAgICAgYEdpdmUgb25lIG9mIFwiJHtwb3NzaWJsZUFyZ3VtZW50cy5qb2luKCdcIiwgXCInKX1cIiBhcyBjb21tYW5kIGAgK1xuICAgICAgICAgICAgICAgICdsaW5lIGFyZ3VtZW50LiBZb3UgY2FuIHByb3ZpZGUgYSBqc29uIHN0cmluZyBhcyBzZWNvbmQgJyArXG4gICAgICAgICAgICAgICAgJ3BhcmFtZXRlciB0byBkeW5hbWljYWxseSBvdmVyd3JpdGUgc29tZSBjb25maWd1cmF0aW9ucy5cXG4nKVxuICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgLy8gcmVnaW9uIGZvcndhcmQgbmVzdGVkIHJldHVybiBjb2Rlc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvY2Vzc1Byb21pc2VzKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgcHJvY2Vzcy5leGl0KGVycm9yLnJldHVybkNvZGUpXG4gICAgICAgIH1cbiAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZGVidWcpXG4gICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgIH1cbn1cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSlcbiAgICBtYWluKCkuY2F0Y2goKGVycm9yOkVycm9yKTp2b2lkID0+IHtcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxuZXhwb3J0IGRlZmF1bHQgbWFpblxuLy8gcmVnaW9uIHZpbSBtb2RsaW5lXG4vLyB2aW06IHNldCB0YWJzdG9wPTQgc2hpZnR3aWR0aD00IGV4cGFuZHRhYjpcbi8vIHZpbTogZm9sZG1ldGhvZD1tYXJrZXIgZm9sZG1hcmtlcj1yZWdpb24sZW5kcmVnaW9uOlxuLy8gZW5kcmVnaW9uXG4iXX0=