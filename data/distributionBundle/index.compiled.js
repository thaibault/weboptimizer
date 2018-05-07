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
                            var childProcessOptions, childProcesses, processPromises, possibleArguments, closeEventHandlers, dynamicConfiguration, count, filePath, additionalArguments, _loop, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _filePath, buildConfigurations, tidiedUp, tidyUp, testModuleFilePaths, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, buildConfiguration, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _filePath6, handleTask, finished, closeHandler, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, closeEventName;

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
                                                _context3.next = 146;
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
                                                _context3.next = 85;
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
                                            _iteratorNormalCompletion2 = true;
                                            _didIteratorError2 = false;
                                            _iteratorError2 = undefined;
                                            _context3.prev = 69;

                                            for (_iterator2 = (0, _getIterator3.default)(_configurator2.default.path.tidyUpOnClear); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                                _filePath = _step2.value;

                                                if (_filePath) if (_clientnode2.default.isFileSync(_filePath))
                                                    // NOTE: Close handler have to be synchronous.
                                                    fileSystem.unlinkSync(_filePath);else if (_clientnode2.default.isDirectorySync(_filePath)) _rimraf2.default.sync(_filePath, { glob: false });
                                            }_context3.next = 77;
                                            break;

                                        case 73:
                                            _context3.prev = 73;
                                            _context3.t4 = _context3['catch'](69);
                                            _didIteratorError2 = true;
                                            _iteratorError2 = _context3.t4;

                                        case 77:
                                            _context3.prev = 77;
                                            _context3.prev = 78;

                                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                                _iterator2.return();
                                            }

                                        case 80:
                                            _context3.prev = 80;

                                            if (!_didIteratorError2) {
                                                _context3.next = 83;
                                                break;
                                            }

                                            throw _iteratorError2;

                                        case 83:
                                            return _context3.finish(80);

                                        case 84:
                                            return _context3.finish(77);

                                        case 85:
                                            // endregion
                                            buildConfigurations = _helper2.default.resolveBuildConfigurationFilePaths(_configurator2.default.build.types, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
                                                return _path2.default.resolve(_configurator2.default.path.context, filePath);
                                            }).filter(function (filePath) {
                                                return !_configurator2.default.path.context.startsWith(filePath);
                                            }), _configurator2.default.package.main.fileNames);

                                            if (!['build', 'build:dll', 'document', 'test'].includes(process.argv[2])) {
                                                _context3.next = 93;
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
                                                        var _iteratorNormalCompletion3 = true;
                                                        var _didIteratorError3 = false;
                                                        var _iteratorError3 = undefined;

                                                        try {
                                                            for (var _iterator3 = (0, _getIterator3.default)(_configurator2.default.injection.internal.normalized[chunkName]), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                                                var moduleID = _step3.value;

                                                                var _filePath2 = _helper2.default.determineModuleFilePath(moduleID, _configurator2.default.module.aliases, _configurator2.default.module.replacements.normal, _configurator2.default.extensions, _configurator2.default.path.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore, _configurator2.default.module.directoryNames, _configurator2.default.package.main.fileNames, _configurator2.default.package.main.propertyNames, _configurator2.default.package.aliasPropertyNames, _configurator2.default.encoding);
                                                                var type = void 0;
                                                                if (_filePath2) type = _helper2.default.determineAssetType(_filePath2, _configurator2.default.build.types, _configurator2.default.path);
                                                                if (typeof type === 'string' && _configurator2.default.build.types[type]) {
                                                                    var _filePath3 = _helper2.default.renderFilePathTemplate(_helper2.default.stripLoader(_configurator2.default.files.compose.javaScript), { '[name]': chunkName });
                                                                    /*
                                                                        NOTE: Close handler have to be
                                                                        synchronous.
                                                                    */
                                                                    if (_configurator2.default.build.types[type].outputExtension === 'js' && _clientnode2.default.isFileSync(_filePath3)) fileSystem.chmodSync(_filePath3, '755');
                                                                }
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
                                                    }
                                                }var _iteratorNormalCompletion4 = true;
                                                var _didIteratorError4 = false;
                                                var _iteratorError4 = undefined;

                                                try {
                                                    for (var _iterator4 = (0, _getIterator3.default)(_configurator2.default.path.tidyUp), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                                        var _filePath4 = _step4.value;

                                                        if (_filePath4) if (_clientnode2.default.isFileSync(_filePath4))
                                                            // NOTE: Close handler have to be synchronous.
                                                            fileSystem.unlinkSync(_filePath4);else if (_clientnode2.default.isDirectorySync(_filePath4)) _rimraf2.default.sync(_filePath4, { glob: false });
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
                                                    var _iteratorNormalCompletion5 = true;
                                                    var _didIteratorError5 = false;
                                                    var _iteratorError5 = undefined;

                                                    try {
                                                        for (var _iterator5 = (0, _getIterator3.default)(_configurator2.default.files.additionalPaths), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                                            var _filePath5 = _step5.value;

                                                            var sourcePath = _path2.default.join(_configurator2.default.path.source.base, _filePath5);
                                                            var targetPath = _path2.default.join(_configurator2.default.path.target.base, _filePath5);
                                                            // NOTE: Close handler have to be synchronous.
                                                            if (_clientnode2.default.isDirectorySync(sourcePath)) {
                                                                if (_clientnode2.default.isDirectorySync(targetPath)) _rimraf2.default.sync(targetPath, { glob: false });
                                                                _clientnode2.default.copyDirectoryRecursiveSync(sourcePath, targetPath);
                                                            } else if (_clientnode2.default.isFileSync(sourcePath)) _clientnode2.default.copyFileSync(sourcePath, targetPath);
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

                                                    tidyUp.apply(undefined, arguments);
                                                };
                                                var closeHandler = _clientnode2.default.getProcessCloseHandler(resolve, reject, null, process.argv[2] === 'build' ? copyAdditionalFilesAndTidyUp : tidyUp);
                                                var _iteratorNormalCompletion6 = true;
                                                var _didIteratorError6 = false;
                                                var _iteratorError6 = undefined;

                                                try {
                                                    for (var _iterator6 = (0, _getIterator3.default)(_clientnode2.default.closeEventNames), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                                        var closeEventName = _step6.value;

                                                        childProcess.on(closeEventName, closeHandler);
                                                    }
                                                } catch (err) {
                                                    _didIteratorError6 = true;
                                                    _iteratorError6 = err;
                                                } finally {
                                                    try {
                                                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                                            _iterator6.return();
                                                        }
                                                    } finally {
                                                        if (_didIteratorError6) {
                                                            throw _iteratorError6;
                                                        }
                                                    }
                                                }

                                                childProcesses.push(childProcess);
                                            }));
                                            // endregion
                                            // region handle preinstall
                                            _context3.next = 138;
                                            break;

                                        case 93:
                                            if (!(_configurator2.default.library && _configurator2.default.givenCommandLineArguments[2] === 'preinstall')) {
                                                _context3.next = 138;
                                                break;
                                            }

                                            // Perform all file specific preprocessing stuff.
                                            testModuleFilePaths = _helper2.default.determineModuleLocations(_configurator2.default['test:browser'].injection.internal, _configurator2.default.module.aliases, _configurator2.default.module.replacements.normal, _configurator2.default.extensions, _configurator2.default.path.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore).filePaths;
                                            _iteratorNormalCompletion7 = true;
                                            _didIteratorError7 = false;
                                            _iteratorError7 = undefined;
                                            _context3.prev = 98;
                                            _iterator7 = (0, _getIterator3.default)(buildConfigurations);

                                        case 100:
                                            if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                                                _context3.next = 124;
                                                break;
                                            }

                                            buildConfiguration = _step7.value;
                                            _iteratorNormalCompletion8 = true;
                                            _didIteratorError8 = false;
                                            _iteratorError8 = undefined;
                                            _context3.prev = 105;

                                            for (_iterator8 = (0, _getIterator3.default)(buildConfiguration.filePaths); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                                _filePath6 = _step8.value;

                                                if (!testModuleFilePaths.includes(_filePath6)) {
                                                    (function () {
                                                        var evaluationFunction = function evaluationFunction(global, self, buildConfiguration, path, additionalArguments, filePath
                                                        // IgnoreTypeCheck
                                                        ) {
                                                            return new Function('global', 'self', 'buildConfiguration', 'path', 'additionalArguments', 'filePath', 'return `' + buildConfiguration[_configurator2.default.givenCommandLineArguments[2]].trim() + '`')(global, self, buildConfiguration, path, additionalArguments, filePath);
                                                        };
                                                        var command = evaluationFunction(global, _configurator2.default, buildConfiguration, _path2.default, additionalArguments, _filePath6);
                                                        console.info('Running "' + command + '"');
                                                        processPromises.push(new _promise2.default(function (resolve, reject) {
                                                            return _clientnode2.default.handleChildProcess((0, _child_process.exec)(command, childProcessOptions, function (error) {
                                                                return error ? reject(error) : resolve();
                                                            }));
                                                        }));
                                                    })();
                                                }
                                            }_context3.next = 113;
                                            break;

                                        case 109:
                                            _context3.prev = 109;
                                            _context3.t5 = _context3['catch'](105);
                                            _didIteratorError8 = true;
                                            _iteratorError8 = _context3.t5;

                                        case 113:
                                            _context3.prev = 113;
                                            _context3.prev = 114;

                                            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                                                _iterator8.return();
                                            }

                                        case 116:
                                            _context3.prev = 116;

                                            if (!_didIteratorError8) {
                                                _context3.next = 119;
                                                break;
                                            }

                                            throw _iteratorError8;

                                        case 119:
                                            return _context3.finish(116);

                                        case 120:
                                            return _context3.finish(113);

                                        case 121:
                                            _iteratorNormalCompletion7 = true;
                                            _context3.next = 100;
                                            break;

                                        case 124:
                                            _context3.next = 130;
                                            break;

                                        case 126:
                                            _context3.prev = 126;
                                            _context3.t6 = _context3['catch'](98);
                                            _didIteratorError7 = true;
                                            _iteratorError7 = _context3.t6;

                                        case 130:
                                            _context3.prev = 130;
                                            _context3.prev = 131;

                                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                                _iterator7.return();
                                            }

                                        case 133:
                                            _context3.prev = 133;

                                            if (!_didIteratorError7) {
                                                _context3.next = 136;
                                                break;
                                            }

                                            throw _iteratorError7;

                                        case 136:
                                            return _context3.finish(133);

                                        case 137:
                                            return _context3.finish(130);

                                        case 138:
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
                                                        var _iteratorNormalCompletion10 = true;
                                                        var _didIteratorError10 = false;
                                                        var _iteratorError10 = undefined;

                                                        try {
                                                            for (var _iterator10 = (0, _getIterator3.default)(_clientnode2.default.closeEventNames), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                                                                var closeEventName = _step10.value;

                                                                childProcess.on(closeEventName, closeHandler);
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

                                                        childProcesses.push(childProcess);
                                                    }));
                                                };

                                                var _iteratorNormalCompletion9 = true;
                                                var _didIteratorError9 = false;
                                                var _iteratorError9 = undefined;

                                                try {
                                                    for (var _iterator9 = (0, _getIterator3.default)(tasks), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                                                        var task = _step9.value;

                                                        _loop2(task);
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
                                            };
                                            // / region a-/synchronous


                                            if (!['document', 'test'].includes(_configurator2.default.givenCommandLineArguments[2])) {
                                                _context3.next = 145;
                                                break;
                                            }

                                            _context3.next = 142;
                                            return _promise2.default.all(processPromises);

                                        case 142:
                                            handleTask(_configurator2.default.givenCommandLineArguments[2]);
                                            _context3.next = 146;
                                            break;

                                        case 145:
                                            if (['lint', 'test:browser', 'check:type', 'serve'].includes(_configurator2.default.givenCommandLineArguments[2])) handleTask(_configurator2.default.givenCommandLineArguments[2]);

                                        case 146:
                                            finished = false;

                                            closeHandler = function closeHandler() {
                                                if (!finished) {
                                                    var _iteratorNormalCompletion11 = true;
                                                    var _didIteratorError11 = false;
                                                    var _iteratorError11 = undefined;

                                                    try {
                                                        for (var _iterator11 = (0, _getIterator3.default)(closeEventHandlers), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                                                            var closeEventHandler = _step11.value;

                                                            closeEventHandler.apply(undefined, arguments);
                                                        }
                                                    } catch (err) {
                                                        _didIteratorError11 = true;
                                                        _iteratorError11 = err;
                                                    } finally {
                                                        try {
                                                            if (!_iteratorNormalCompletion11 && _iterator11.return) {
                                                                _iterator11.return();
                                                            }
                                                        } finally {
                                                            if (_didIteratorError11) {
                                                                throw _iteratorError11;
                                                            }
                                                        }
                                                    }
                                                }finished = true;
                                            };

                                            _iteratorNormalCompletion12 = true;
                                            _didIteratorError12 = false;
                                            _iteratorError12 = undefined;
                                            _context3.prev = 151;

                                            for (_iterator12 = (0, _getIterator3.default)(_clientnode2.default.closeEventNames); !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                                                closeEventName = _step12.value;

                                                process.on(closeEventName, closeHandler);
                                            }_context3.next = 159;
                                            break;

                                        case 155:
                                            _context3.prev = 155;
                                            _context3.t7 = _context3['catch'](151);
                                            _didIteratorError12 = true;
                                            _iteratorError12 = _context3.t7;

                                        case 159:
                                            _context3.prev = 159;
                                            _context3.prev = 160;

                                            if (!_iteratorNormalCompletion12 && _iterator12.return) {
                                                _iterator12.return();
                                            }

                                        case 162:
                                            _context3.prev = 162;

                                            if (!_didIteratorError12) {
                                                _context3.next = 165;
                                                break;
                                            }

                                            throw _iteratorError12;

                                        case 165:
                                            return _context3.finish(162);

                                        case 166:
                                            return _context3.finish(159);

                                        case 167:
                                            if (require.main === module && (_configurator2.default.givenCommandLineArguments.length < 3 || !possibleArguments.includes(_configurator2.default.givenCommandLineArguments[2]))) console.info('Give one of "' + possibleArguments.join('", "') + '" as command ' + 'line argument. You can provide a json string as second ' + 'parameter to dynamically overwrite some configurations.\n');
                                            // endregion
                                            // region forward nested return codes
                                            _context3.prev = 168;
                                            _context3.next = 171;
                                            return _promise2.default.all(processPromises);

                                        case 171:
                                            _context3.next = 176;
                                            break;

                                        case 173:
                                            _context3.prev = 173;
                                            _context3.t8 = _context3['catch'](168);

                                            process.exit(_context3.t8.returnCode);

                                        case 176:
                                        case 'end':
                                            return _context3.stop();
                                    }
                                }
                            }, _callee2, undefined, [[31, 45, 49, 57], [50,, 52, 56], [69, 73, 77, 85], [78,, 80, 84], [98, 126, 130, 138], [105, 109, 113, 121], [114,, 116, 120], [131,, 133, 137], [151, 155, 159, 167], [160,, 162, 166], [168, 173]]);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBUixDQUNJLGtCQUFnQixrQkFBa0IsSUFBbEIsQ0FBdUIsTUFBdkIsQ0FBaEIscUJBQ0EseURBREEsR0FFQSwyREFISjtBQUlKO0FBQ0E7QUEzYUs7QUFBQTtBQUFBLG1EQTZhSyxrQkFBUSxHQUFSLENBQVksZUFBWixDQTdhTDs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQSthRCxvREFBUSxJQUFSLENBQWEsYUFBTSxVQUFuQjs7QUEvYUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQSw2QkFtYkQsdUJBQWMsS0FuYmI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFzYkQsZ0NBQVEsS0FBUjs7QUF0YkM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBUDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFOO0FBeWJBLElBQUksUUFBUSxJQUFSLEtBQWlCLE1BQXJCLEVBQ0ksT0FBTyxLQUFQLENBQWEsVUFBQyxLQUFELEVBQXNCO0FBQy9CLFVBQU0sS0FBTjtBQUNILENBRkQ7a0JBR1csSTtBQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImluZGV4LmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHtcbiAgICBDaGlsZFByb2Nlc3MsIGV4ZWMgYXMgZXhlY0NoaWxkUHJvY2Vzcywgc3Bhd24gYXMgc3Bhd25DaGlsZFByb2Nlc3Ncbn0gZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHR5cGUge0ZpbGUsIFBsYWluT2JqZWN0fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkgZnJvbSAncmltcmFmJ1xuXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG5pbXBvcnQgdHlwZSB7UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb259IGZyb20gJy4vdHlwZSdcbi8vIGVuZHJlZ2lvblxuLy8gTk9URTogU3BlY2lmaWVzIG51bWJlciBvZiBhbGxvd2VkIHRocmVhZHMgdG8gc3Bhd24uXG4vLyBJZ25vcmVUeXBlQ2hlY2tcbnByb2Nlc3MuZW52LlVWX1RIUkVBRFBPT0xfU0laRSA9IDEyOFxuY29uc3QgbWFpbiA9IGFzeW5jICgpOlByb21pc2U8YW55PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmVnaW9uIGNvbnRyb2xsZXJcbiAgICAgICAgY29uc3QgY2hpbGRQcm9jZXNzT3B0aW9uczpPYmplY3QgPSB7XG4gICAgICAgICAgICBjd2Q6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgZW52OiBwcm9jZXNzLmVudixcbiAgICAgICAgICAgIHNoZWxsOiB0cnVlLFxuICAgICAgICAgICAgc3RkaW86ICdpbmhlcml0J1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNoaWxkUHJvY2Vzc2VzOkFycmF5PENoaWxkUHJvY2Vzcz4gPSBbXVxuICAgICAgICBjb25zdCBwcm9jZXNzUHJvbWlzZXM6QXJyYXk8UHJvbWlzZTxhbnk+PiA9IFtdXG4gICAgICAgIGNvbnN0IHBvc3NpYmxlQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgICAgICAgICAnYnVpbGQnLCAnYnVpbGQ6ZGxsJywgJ2NsZWFyJywgJ2RvY3VtZW50JywgJ2xpbnQnLCAncHJlaW5zdGFsbCcsXG4gICAgICAgICAgICAnc2VydmUnLCAndGVzdCcsICd0ZXN0OmJyb3dzZXInLCAnY2hlY2s6dHlwZSddXG4gICAgICAgIGNvbnN0IGNsb3NlRXZlbnRIYW5kbGVyczpBcnJheTxGdW5jdGlvbj4gPSBbXVxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIC8vIHJlZ2lvbiB0ZW1wb3Jhcnkgc2F2ZSBkeW5hbWljYWxseSBnaXZlbiBjb25maWd1cmF0aW9uc1xuICAgICAgICAgICAgLy8gTk9URTogV2UgbmVlZCBhIGNvcHkgb2YgZ2l2ZW4gYXJndW1lbnRzIGFycmF5LlxuICAgICAgICAgICAgbGV0IGR5bmFtaWNDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0ge2dpdmVuQ29tbWFuZExpbmVBcmd1bWVudHM6XG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLnNsaWNlKCl9XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDMgJiZcbiAgICAgICAgICAgICAgICBUb29scy5zdHJpbmdQYXJzZUVuY29kZWRPYmplY3QoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1tcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgJ2NvbmZpZ3VyYXRpb24nKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5wb3AoKVxuICAgICAgICAgICAgbGV0IGNvdW50Om51bWJlciA9IDBcbiAgICAgICAgICAgIGxldCBmaWxlUGF0aDpzdHJpbmcgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgYC5keW5hbWljQ29uZmlndXJhdGlvbi0ke2NvdW50fS5qc29uYClcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgZmlsZVBhdGggPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICBgLmR5bmFtaWNDb25maWd1cmF0aW9uLSR7Y291bnR9Lmpzb25gKVxuICAgICAgICAgICAgICAgIGlmICghKGF3YWl0IFRvb2xzLmlzRmlsZShmaWxlUGF0aCkpKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNvdW50ICs9IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb24pOnZvaWQgPT5cbiAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLndyaXRlRmlsZShmaWxlUGF0aCwgSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgICAgICAgICAgIGR5bmFtaWNDb25maWd1cmF0aW9uXG4gICAgICAgICAgICAgICAgKSwgKGVycm9yOj9FcnJvcik6dm9pZCA9PiBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKCkpKVxuICAgICAgICAgICAgY29uc3QgYWRkaXRpb25hbEFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gcHJvY2Vzcy5hcmd2LnNwbGljZSgzKVxuICAgICAgICAgICAgLy8gLyByZWdpb24gcmVnaXN0ZXIgZXhpdCBoYW5kbGVyIHRvIHRpZHkgdXBcbiAgICAgICAgICAgIGNsb3NlRXZlbnRIYW5kbGVycy5wdXNoKChlcnJvcjo/RXJyb3IpOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE5PVEU6IENsb3NlIGhhbmRsZXIgaGF2ZSB0byBiZSBzeW5jaHJvbm91cy5cbiAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0udW5saW5rU3luYyhmaWxlUGF0aClcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy8gLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSBjbGVhclxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBOT1RFOiBTb21lIHRhc2tzIGNvdWxkIGRlcGVuZCBvbiBwcmV2aW91c2x5IGNyZWF0ZWQgZGxsXG4gICAgICAgICAgICAgICAgcGFja2FnZXMgc28gYSBjbGVhbiBzaG91bGQgbm90IGJlIHBlcmZvcm1lZCBpbiB0aGF0IGNhc2UuXG4gICAgICAgICAgICAgICAgTk9URTogSWYgd2UgaGF2ZSBhIGRlcGVuZGVuY3kgY3ljbGUgd2UgbmVlZCB0byBwcmVzZXJ2ZSBmaWxlc1xuICAgICAgICAgICAgICAgIGR1cmluZyBwcmVpbnN0YWxsIHBoYXNlLlxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICghW1xuICAgICAgICAgICAgICAgICdidWlsZCcsICdwcmVpbnN0YWxsJywgJ3NlcnZlJywgJ3Rlc3QnLCAndGVzdDpicm93c2VyJ1xuICAgICAgICAgICAgXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pICYmXG4gICAgICAgICAgICBwb3NzaWJsZUFyZ3VtZW50cy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICBpZiAocGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2VcbiAgICAgICAgICAgICAgICApID09PSBwYXRoLnJlc29sdmUoY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZXMgYWxsIGNvbXBpbGVkIGZpbGVzLlxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHkoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIGFzeW5jIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOkZpbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICk6UHJvbWlzZTw/ZmFsc2U+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnBhdGgsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZTpzdHJpbmcgaW4gY29uZmlndXJhdGlvbi5idWlsZC50eXBlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ldyBSZWdFeHAoY29uZmlndXJhdGlvbi5idWlsZC50eXBlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5maWxlUGF0aFBhdHRlcm4pLnRlc3QoZmlsZS5wYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUuc3RhdHMgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXRzLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnBhdGgsIHtnbG9iOiBmYWxzZX0sIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBmaWxlU3lzdGVtLnVubGluayhmaWxlLnBhdGgsIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjo/RXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTpGaWxlIG9mIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBUb29scy53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCk6ZmFsc2UgPT4gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5uYW1lLmxlbmd0aCA+ICcuZGxsLW1hbmlmZXN0Lmpzb24nLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUubmFtZS5lbmRzV2l0aCgnLmRsbC1tYW5pZmVzdC5qc29uJykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLm5hbWUuc3RhcnRzV2l0aCgnbnBtLWRlYnVnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBmaWxlU3lzdGVtLnVubGluayhmaWxlLnBhdGgsIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IGVycm9yID8gcmVqZWN0KGVycm9yKSA6IHJlc29sdmUoKSkpXG4gICAgICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIHtnbG9iOiBmYWxzZX0sIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjo/RXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKCkpKVxuICAgICAgICAgICAgICAgIGlmIChhd2FpdCBUb29scy5pc0RpcmVjdG9yeShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmFwaURvY3VtZW50YXRpb25cbiAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmFwaURvY3VtZW50YXRpb24sIHtnbG9iOiBmYWxzZX0sIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjo/RXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKCkpKVxuICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgb2YgY29uZmlndXJhdGlvbi5wYXRoLnRpZHlVcE9uQ2xlYXJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmtTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseS5zeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwge2dsb2I6IGZhbHNlfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSBidWlsZFxuICAgICAgICAgICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9XG4gICAgICAgICAgICAgICAgSGVscGVyLnJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yeU5hbWVzXG4gICAgICAgICAgICAgICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSksXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcylcbiAgICAgICAgICAgIGlmIChbJ2J1aWxkJywgJ2J1aWxkOmRsbCcsICdkb2N1bWVudCcsICd0ZXN0J10uaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgcHJvY2Vzcy5hcmd2WzJdXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgbGV0IHRpZGllZFVwOmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnN0IHRpZHlVcDpGdW5jdGlvbiA9ICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgRGV0ZXJtaW5lcyBhbGwgbm9uZSBqYXZhU2NyaXB0IGVudGl0aWVzIHdoaWNoIGhhdmUgYmVlblxuICAgICAgICAgICAgICAgICAgICAgICAgZW1pdHRlZCBhcyBzaW5nbGUgbW9kdWxlIHRvIHJlbW92ZS5cbiAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpZGllZFVwKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgIHRpZGllZFVwID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oYXNPd25Qcm9wZXJ0eShjaHVua05hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBtb2R1bGVJRDpzdHJpbmcgb2YgY29uZmlndXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRbY2h1bmtOYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVJRCwgY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5yZXBsYWNlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm5vcm1hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4uZmlsZU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWxpYXNQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZW5jb2RpbmcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0eXBlOj9zdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9IEhlbHBlci5kZXRlcm1pbmVBc3NldFR5cGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNbdHlwZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5yZW5kZXJGaWxlUGF0aFRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLCB7J1tuYW1lXSc6IGNodW5rTmFtZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PVEU6IENsb3NlIGhhbmRsZXIgaGF2ZSB0byBiZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN5bmNocm9ub3VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5pc0ZpbGVTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0uY2htb2RTeW5jKGZpbGVQYXRoLCAnNzU1JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aDo/c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24ucGF0aC50aWR5VXApXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0udW5saW5rU3luYyhmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMoZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseS5zeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIHtnbG9iOiBmYWxzZX0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNsb3NlRXZlbnRIYW5kbGVycy5wdXNoKHRpZHlVcClcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBUcmlnZ2VycyBjb21wbGV0ZSBhc3NldCBjb21waWxpbmcgYW5kIGJ1bmRsZXMgdGhlbSBpbnRvIHRoZVxuICAgICAgICAgICAgICAgICAgICBmaW5hbCBwcm9kdWN0aXZlIG91dHB1dC5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHByb2Nlc3NQcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZExpbmVBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmUuYnVpbGQuYXJndW1lbnRzIHx8IFtdXG4gICAgICAgICAgICAgICAgICAgICkuY29uY2F0KGFkZGl0aW9uYWxBcmd1bWVudHMpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnUnVubmluZyBcIicgKyAoXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lLmJ1aWxkLmNvbW1hbmR9IGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZExpbmVBcmd1bWVudHMuam9pbignICcpXG4gICAgICAgICAgICAgICAgICAgICkudHJpbSgpICsgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRQcm9jZXNzOkNoaWxkUHJvY2VzcyA9IHNwYXduQ2hpbGRQcm9jZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5jb21tYW5kTGluZS5idWlsZC5jb21tYW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZExpbmVBcmd1bWVudHMsIGNoaWxkUHJvY2Vzc09wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvcHlBZGRpdGlvbmFsRmlsZXNBbmRUaWR5VXA6RnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5wYXJhbWV0ZXI6QXJyYXk8YW55PlxuICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmFkZGl0aW9uYWxQYXRoc1xuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc291cmNlUGF0aDpzdHJpbmcgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYmFzZSwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0UGF0aDpzdHJpbmcgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogQ2xvc2UgaGFuZGxlciBoYXZlIHRvIGJlIHN5bmNocm9ub3VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0RpcmVjdG9yeVN5bmMoc291cmNlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyh0YXJnZXRQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5LnN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UGF0aCwge2dsb2I6IGZhbHNlfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuY29weURpcmVjdG9yeVJlY3Vyc2l2ZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VQYXRoLCB0YXJnZXRQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoVG9vbHMuaXNGaWxlU3luYyhzb3VyY2VQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuY29weUZpbGVTeW5jKHNvdXJjZVBhdGgsIHRhcmdldFBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWR5VXAoLi4ucGFyYW1ldGVyKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlSGFuZGxlcjpGdW5jdGlvbiA9IFRvb2xzLmdldFByb2Nlc3NDbG9zZUhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlLCByZWplY3QsIG51bGwsIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmFyZ3ZbMl0gPT09ICdidWlsZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICkgPyBjb3B5QWRkaXRpb25hbEZpbGVzQW5kVGlkeVVwIDogdGlkeVVwKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNsb3NlRXZlbnROYW1lOnN0cmluZyBvZiBUb29scy5jbG9zZUV2ZW50TmFtZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Mub24oY2xvc2VFdmVudE5hbWUsIGNsb3NlSGFuZGxlcilcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzZXMucHVzaChjaGlsZFByb2Nlc3MpXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBoYW5kbGUgcHJlaW5zdGFsbFxuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxpYnJhcnkgJiZcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdwcmVpbnN0YWxsJ1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgLy8gUGVyZm9ybSBhbGwgZmlsZSBzcGVjaWZpYyBwcmVwcm9jZXNzaW5nIHN0dWZmLlxuICAgICAgICAgICAgICAgIGNvbnN0IHRlc3RNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9XG4gICAgICAgICAgICAgICAgICAgIEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uWyd0ZXN0OmJyb3dzZXInXS5pbmplY3Rpb24uaW50ZXJuYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzLm5vcm1hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucywgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICkuZmlsZVBhdGhzXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBidWlsZENvbmZpZ3VyYXRpb24gb2YgYnVpbGRDb25maWd1cmF0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2YgYnVpbGRDb25maWd1cmF0aW9uLmZpbGVQYXRocylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGVzdE1vZHVsZUZpbGVQYXRocy5pbmNsdWRlcyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbDpPYmplY3QsIHNlbGY6UGxhaW5PYmplY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDp0eXBlb2YgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbEFyZ3VtZW50czpBcnJheTxzdHJpbmc+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnN0cmluZyA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2dsb2JhbCcsICdzZWxmJywgJ2J1aWxkQ29uZmlndXJhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGF0aCcsICdhZGRpdGlvbmFsQXJndW1lbnRzJywgJ2ZpbGVQYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdyZXR1cm4gYCcgKyBidWlsZENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXS50cmltKCkgKyAnYCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbCwgc2VsZiwgYnVpbGRDb25maWd1cmF0aW9uLCBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbEFyZ3VtZW50cywgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZDpzdHJpbmcgPSBldmFsdWF0aW9uRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbCwgY29uZmlndXJhdGlvbiwgYnVpbGRDb25maWd1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoLCBhZGRpdGlvbmFsQXJndW1lbnRzLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oYFJ1bm5pbmcgXCIke2NvbW1hbmR9XCJgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NQcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IFRvb2xzLmhhbmRsZUNoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhlY0NoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQsIGNoaWxkUHJvY2Vzc09wdGlvbnMsIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjo/RXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICAvLyByZWdpb24gaGFuZGxlIHJlbWFpbmluZyB0YXNrc1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlVGFzayA9ICh0eXBlOnN0cmluZyk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHRhc2tzOkFycmF5PE9iamVjdD5cbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdKSlcbiAgICAgICAgICAgICAgICAgICAgdGFza3MgPSBjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0YXNrcyA9IFtjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdXVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdGFzazpPYmplY3Qgb2YgdGFza3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZhbHVhdGlvbkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsOk9iamVjdCwgc2VsZjpQbGFpbk9iamVjdCwgcGF0aDp0eXBlb2YgcGF0aFxuICAgICAgICAgICAgICAgICAgICApOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdnbG9iYWwnLCAnc2VsZicsICdwYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmV0dXJuICcgKyAodGFzay5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2luZGljYXRvcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApID8gdGFzay5pbmRpY2F0b3IgOiAndHJ1ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICApKGdsb2JhbCwgc2VsZiwgcGF0aClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2YWx1YXRpb25GdW5jdGlvbihnbG9iYWwsIGNvbmZpZ3VyYXRpb24sIHBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tYW5kTGluZUFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXNrLmFyZ3VtZW50cyB8fCBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuY29uY2F0KGFkZGl0aW9uYWxBcmd1bWVudHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdSdW5uaW5nIFwiJyArIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGFzay5jb21tYW5kfSBgICsgY29tbWFuZExpbmVBcmd1bWVudHMuam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLnRyaW0oKSArICdcIicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRQcm9jZXNzOkNoaWxkUHJvY2VzcyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwYXduQ2hpbGRQcm9jZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5jb21tYW5kLCBjb21tYW5kTGluZUFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzc09wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2VIYW5kbGVyOkZ1bmN0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuZ2V0UHJvY2Vzc0Nsb3NlSGFuZGxlcihyZXNvbHZlLCByZWplY3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvc2VFdmVudE5hbWU6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmNsb3NlRXZlbnROYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzLm9uKGNsb3NlRXZlbnROYW1lLCBjbG9zZUhhbmRsZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzZXMucHVzaChjaGlsZFByb2Nlc3MpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAvIHJlZ2lvbiBhLS9zeW5jaHJvbm91c1xuICAgICAgICAgICAgaWYgKFsnZG9jdW1lbnQnLCAndGVzdCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb2Nlc3NQcm9taXNlcylcbiAgICAgICAgICAgICAgICBoYW5kbGVUYXNrKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSlcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoW1xuICAgICAgICAgICAgICAgICdsaW50JywgJ3Rlc3Q6YnJvd3NlcicsICdjaGVjazp0eXBlJywgJ3NlcnZlJ1xuICAgICAgICAgICAgXS5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKVxuICAgICAgICAgICAgICAgIGhhbmRsZVRhc2soY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKVxuICAgICAgICAgICAgLy8gLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICB9XG4gICAgICAgIGxldCBmaW5pc2hlZDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgY29uc3QgY2xvc2VIYW5kbGVyID0gKC4uLnBhcmFtZXRlcjpBcnJheTxhbnk+KTp2b2lkID0+IHtcbiAgICAgICAgICAgIGlmICghZmluaXNoZWQpXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjbG9zZUV2ZW50SGFuZGxlcjpGdW5jdGlvbiBvZiBjbG9zZUV2ZW50SGFuZGxlcnMpXG4gICAgICAgICAgICAgICAgICAgIGNsb3NlRXZlbnRIYW5kbGVyKC4uLnBhcmFtZXRlcilcbiAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudE5hbWU6c3RyaW5nIG9mIFRvb2xzLmNsb3NlRXZlbnROYW1lcylcbiAgICAgICAgICAgIHByb2Nlc3Mub24oY2xvc2VFdmVudE5hbWUsIGNsb3NlSGFuZGxlcilcbiAgICAgICAgaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlICYmIChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPCAzIHx8XG4gICAgICAgICAgICAhcG9zc2libGVBcmd1bWVudHMuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKVxuICAgICAgICApKVxuICAgICAgICAgICAgY29uc29sZS5pbmZvKFxuICAgICAgICAgICAgICAgIGBHaXZlIG9uZSBvZiBcIiR7cG9zc2libGVBcmd1bWVudHMuam9pbignXCIsIFwiJyl9XCIgYXMgY29tbWFuZCBgICtcbiAgICAgICAgICAgICAgICAnbGluZSBhcmd1bWVudC4gWW91IGNhbiBwcm92aWRlIGEganNvbiBzdHJpbmcgYXMgc2Vjb25kICcgK1xuICAgICAgICAgICAgICAgICdwYXJhbWV0ZXIgdG8gZHluYW1pY2FsbHkgb3ZlcndyaXRlIHNvbWUgY29uZmlndXJhdGlvbnMuXFxuJylcbiAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgIC8vIHJlZ2lvbiBmb3J3YXJkIG5lc3RlZCByZXR1cm4gY29kZXNcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb2Nlc3NQcm9taXNlcylcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHByb2Nlc3MuZXhpdChlcnJvci5yZXR1cm5Db2RlKVxuICAgICAgICB9XG4gICAgICAgIC8vIGVuZHJlZ2lvblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uLmRlYnVnKVxuICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICB9XG59XG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpXG4gICAgbWFpbigpLmNhdGNoKChlcnJvcjpFcnJvcik6dm9pZCA9PiB7XG4gICAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbmV4cG9ydCBkZWZhdWx0IG1haW5cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19