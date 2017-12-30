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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SixFQUtJLFFBQVEsSUFBUixDQUNJLGtCQUFnQixrQkFBa0IsSUFBbEIsQ0FBdUIsTUFBdkIsQ0FBaEIscUJBQ0EseURBREEsR0FFQSwyREFISjtBQUlKO0FBQ0E7QUEzYUs7QUFBQTtBQUFBLG1EQTZhSyxrQkFBUSxHQUFSLENBQVksZUFBWixDQTdhTDs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQSthRCxvREFBUSxJQUFSLENBQWEsYUFBTSxVQUFuQjs7QUEvYUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQSw2QkFtYkQsdUJBQWMsS0FuYmI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7O0FBQUE7QUFzYkQsZ0NBQVEsS0FBUjs7QUF0YkM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBUDs7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFOO0FBeWJBLElBQUksUUFBUSxJQUFSLEtBQWlCLE1BQXJCLEVBQ0ksT0FBTyxLQUFQLENBQWEsVUFBQyxLQUFELEVBQXNCO0FBQy9CLFVBQU0sS0FBTjtBQUNILENBRkQ7a0JBR1csSTtBQUNmO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImluZGV4LmNvbXBpbGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHtcbiAgICBDaGlsZFByb2Nlc3MsIGV4ZWMgYXMgZXhlY0NoaWxkUHJvY2Vzcywgc3Bhd24gYXMgc3Bhd25DaGlsZFByb2Nlc3Ncbn0gZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCBUb29scyBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0IHR5cGUge0ZpbGUsIFBsYWluT2JqZWN0fSBmcm9tICdjbGllbnRub2RlJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkgZnJvbSAncmltcmFmJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IGNvbmZpZ3VyYXRpb24gZnJvbSAnLi9jb25maWd1cmF0b3IuY29tcGlsZWQnXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuaW1wb3J0IHR5cGUge1Jlc29sdmVkQnVpbGRDb25maWd1cmF0aW9ufSBmcm9tICcuL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vIE5PVEU6IFNwZWNpZmllcyBudW1iZXIgb2YgYWxsb3dlZCB0aHJlYWRzIHRvIHNwYXduLlxuLy8gSWdub3JlVHlwZUNoZWNrXG5wcm9jZXNzLmVudi5VVl9USFJFQURQT09MX1NJWkUgPSAxMjhcbmNvbnN0IG1haW4gPSBhc3luYyAoKTpQcm9taXNlPGFueT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJlZ2lvbiBjb250cm9sbGVyXG4gICAgICAgIGNvbnN0IGNoaWxkUHJvY2Vzc09wdGlvbnM6T2JqZWN0ID0ge1xuICAgICAgICAgICAgY3dkOiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgIGVudjogcHJvY2Vzcy5lbnYsXG4gICAgICAgICAgICBzaGVsbDogdHJ1ZSxcbiAgICAgICAgICAgIHN0ZGlvOiAnaW5oZXJpdCdcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3NlczpBcnJheTxDaGlsZFByb2Nlc3M+ID0gW11cbiAgICAgICAgY29uc3QgcHJvY2Vzc1Byb21pc2VzOkFycmF5PFByb21pc2U8YW55Pj4gPSBbXVxuICAgICAgICBjb25zdCBwb3NzaWJsZUFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gW1xuICAgICAgICAgICAgJ2J1aWxkJywgJ2J1aWxkOmRsbCcsICdjbGVhcicsICdkb2N1bWVudCcsICdsaW50JywgJ3ByZWluc3RhbGwnLFxuICAgICAgICAgICAgJ3NlcnZlJywgJ3Rlc3QnLCAndGVzdDpicm93c2VyJywgJ2NoZWNrOnR5cGUnXVxuICAgICAgICBjb25zdCBjbG9zZUV2ZW50SGFuZGxlcnM6QXJyYXk8RnVuY3Rpb24+ID0gW11cbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAvLyByZWdpb24gdGVtcG9yYXJ5IHNhdmUgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvbnNcbiAgICAgICAgICAgIC8vIE5PVEU6IFdlIG5lZWQgYSBjb3B5IG9mIGdpdmVuIGFyZ3VtZW50cyBhcnJheS5cbiAgICAgICAgICAgIGxldCBkeW5hbWljQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHtnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOlxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5zbGljZSgpfVxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAzICYmXG4gICAgICAgICAgICAgICAgVG9vbHMuc3RyaW5nUGFyc2VFbmNvZGVkT2JqZWN0KFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24sICdjb25maWd1cmF0aW9uJylcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMucG9wKClcbiAgICAgICAgICAgIGxldCBjb3VudDpudW1iZXIgPSAwXG4gICAgICAgICAgICBsZXQgZmlsZVBhdGg6c3RyaW5nID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgIGAuZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmApXG4gICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgICAgIGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAgYC5keW5hbWljQ29uZmlndXJhdGlvbi0ke2NvdW50fS5qc29uYClcbiAgICAgICAgICAgICAgICBpZiAoIShhd2FpdCBUb29scy5pc0ZpbGUoZmlsZVBhdGgpKSlcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjb3VudCArPSAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uKTp2b2lkID0+XG4gICAgICAgICAgICAgICAgZmlsZVN5c3RlbS53cml0ZUZpbGUoZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KFxuICAgICAgICAgICAgICAgICAgICBkeW5hbWljQ29uZmlndXJhdGlvblxuICAgICAgICAgICAgICAgICksIChlcnJvcjo/RXJyb3IpOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgIGNvbnN0IGFkZGl0aW9uYWxBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IHByb2Nlc3MuYXJndi5zcGxpY2UoMylcbiAgICAgICAgICAgIC8vIC8gcmVnaW9uIHJlZ2lzdGVyIGV4aXQgaGFuZGxlciB0byB0aWR5IHVwXG4gICAgICAgICAgICBjbG9zZUV2ZW50SGFuZGxlcnMucHVzaCgoZXJyb3I6P0Vycm9yKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmUgc3luY2hyb25vdXMuXG4gICAgICAgICAgICAgICAgaWYgKFRvb2xzLmlzRmlsZVN5bmMoZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnVubGlua1N5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIC8gZW5kcmVnaW9uXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBoYW5kbGUgY2xlYXJcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgTk9URTogU29tZSB0YXNrcyBjb3VsZCBkZXBlbmQgb24gcHJldmlvdXNseSBjcmVhdGVkIGRsbFxuICAgICAgICAgICAgICAgIHBhY2thZ2VzIHNvIGEgY2xlYW4gc2hvdWxkIG5vdCBiZSBwZXJmb3JtZWQgaW4gdGhhdCBjYXNlLlxuICAgICAgICAgICAgICAgIE5PVEU6IElmIHdlIGhhdmUgYSBkZXBlbmRlbmN5IGN5Y2xlIHdlIG5lZWQgdG8gcHJlc2VydmUgZmlsZXNcbiAgICAgICAgICAgICAgICBkdXJpbmcgcHJlaW5zdGFsbCBwaGFzZS5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAoIVtcbiAgICAgICAgICAgICAgICAnYnVpbGQnLCAncHJlaW5zdGFsbCcsICdzZXJ2ZScsICd0ZXN0JywgJ3Rlc3Q6YnJvd3NlcidcbiAgICAgICAgICAgIF0uaW5jbHVkZXMoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKSAmJlxuICAgICAgICAgICAgcG9zc2libGVBcmd1bWVudHMuaW5jbHVkZXMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlXG4gICAgICAgICAgICAgICAgKSA9PT0gcGF0aC5yZXNvbHZlKGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmVzIGFsbCBjb21waWxlZCBmaWxlcy5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgVG9vbHMud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCBhc3luYyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZTpGaWxlXG4gICAgICAgICAgICAgICAgICAgICAgICApOlByb21pc2U8P2ZhbHNlPiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEhlbHBlci5pc0ZpbGVQYXRoSW5Mb2NhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXcgUmVnRXhwKGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0uZmlsZVBhdGhQYXR0ZXJuKS50ZXN0KGZpbGUucGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnN0YXRzICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5zdGF0cy5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5wYXRoLCB7Z2xvYjogZmFsc2V9LCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjo/RXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IGVycm9yID8gcmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IHJlc29sdmUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZmlsZVN5c3RlbS51bmxpbmsoZmlsZS5wYXRoLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6RmlsZSBvZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgVG9vbHMud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpOmZhbHNlID0+IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUubmFtZS5sZW5ndGggPiAnLmRsbC1tYW5pZmVzdC5qc29uJy5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLm5hbWUuZW5kc1dpdGgoJy5kbGwtbWFuaWZlc3QuanNvbicpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5uYW1lLnN0YXJ0c1dpdGgoJ25wbS1kZWJ1ZycpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZmlsZVN5c3RlbS51bmxpbmsoZmlsZS5wYXRoLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOj9FcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBlcnJvciA/IHJlamVjdChlcnJvcikgOiByZXNvbHZlKCkpKVxuICAgICAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCB7Z2xvYjogZmFsc2V9LCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgICAgICBpZiAoYXdhaXQgVG9vbHMuaXNEaXJlY3RvcnkoXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5hcGlEb2N1bWVudGF0aW9uXG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpGdW5jdGlvbiwgcmVqZWN0OkZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5hcGlEb2N1bWVudGF0aW9uLCB7Z2xvYjogZmFsc2V9LCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpKSlcbiAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDo/c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24ucGF0aC50aWR5VXBPbkNsZWFyXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNGaWxlU3luYyhmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogQ2xvc2UgaGFuZGxlciBoYXZlIHRvIGJlIHN5bmNocm9ub3VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0udW5saW5rU3luYyhmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKFRvb2xzLmlzRGlyZWN0b3J5U3luYyhmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkuc3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIHtnbG9iOiBmYWxzZX0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgICAgIC8vIHJlZ2lvbiBoYW5kbGUgYnVpbGRcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkQ29uZmlndXJhdGlvbnM6UmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb24gPVxuICAgICAgICAgICAgICAgIEhlbHBlci5yZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICAgICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpbi5maWxlTmFtZXMpXG4gICAgICAgICAgICBpZiAoWydidWlsZCcsICdidWlsZDpkbGwnLCAnZG9jdW1lbnQnLCAndGVzdCddLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIHByb2Nlc3MuYXJndlsyXVxuICAgICAgICAgICAgKSkge1xuICAgICAgICAgICAgICAgIGxldCB0aWRpZWRVcDpib29sZWFuID0gZmFsc2VcbiAgICAgICAgICAgICAgICBjb25zdCB0aWR5VXA6RnVuY3Rpb24gPSAoKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgIERldGVybWluZXMgYWxsIG5vbmUgamF2YVNjcmlwdCBlbnRpdGllcyB3aGljaCBoYXZlIGJlZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZWQgYXMgc2luZ2xlIG1vZHVsZSB0byByZW1vdmUuXG4gICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aWRpZWRVcClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICB0aWRpZWRVcCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rTmFtZTpzdHJpbmcgaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGFzT3duUHJvcGVydHkoY2h1bmtOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6P3N0cmluZyA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQsIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUucmVwbGFjZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5ub3JtYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yeU5hbWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2UubWFpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhY2thZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFsaWFzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmVuY29kaW5nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHlwZTo/c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIucmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnN0cmlwTG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmphdmFTY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgeydbbmFtZV0nOiBjaHVua05hbWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOT1RFOiBDbG9zZSBoYW5kbGVyIGhhdmUgdG8gYmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzeW5jaHJvbm91cy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZC50eXBlc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0ub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuaXNGaWxlU3luYyhmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLmNobW9kU3luYyhmaWxlUGF0aCwgJzc1NScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGg6P3N0cmluZyBvZiBjb25maWd1cmF0aW9uLnBhdGgudGlkeVVwKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0ZpbGVTeW5jKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogQ2xvc2UgaGFuZGxlciBoYXZlIHRvIGJlIHN5bmNocm9ub3VzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnVubGlua1N5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHkuc3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoLCB7Z2xvYjogZmFsc2V9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjbG9zZUV2ZW50SGFuZGxlcnMucHVzaCh0aWR5VXApXG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgVHJpZ2dlcnMgY29tcGxldGUgYXNzZXQgY29tcGlsaW5nIGFuZCBidW5kbGVzIHRoZW0gaW50byB0aGVcbiAgICAgICAgICAgICAgICAgICAgZmluYWwgcHJvZHVjdGl2ZSBvdXRwdXQuXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBwcm9jZXNzUHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1hbmRMaW5lQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lLmJ1aWxkLmFyZ3VtZW50cyB8fCBbXVxuICAgICAgICAgICAgICAgICAgICApLmNvbmNhdChhZGRpdGlvbmFsQXJndW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ1J1bm5pbmcgXCInICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7Y29uZmlndXJhdGlvbi5jb21tYW5kTGluZS5idWlsZC5jb21tYW5kfSBgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lQXJndW1lbnRzLmpvaW4oJyAnKVxuICAgICAgICAgICAgICAgICAgICApLnRyaW0oKSArICdcIicpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUHJvY2VzczpDaGlsZFByb2Nlc3MgPSBzcGF3bkNoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmUuYnVpbGQuY29tbWFuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lQXJndW1lbnRzLCBjaGlsZFByb2Nlc3NPcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb3B5QWRkaXRpb25hbEZpbGVzQW5kVGlkeVVwOkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucGFyYW1ldGVyOkFycmF5PGFueT5cbiAgICAgICAgICAgICAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5hZGRpdGlvbmFsUGF0aHNcbiAgICAgICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZVBhdGg6c3RyaW5nID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmJhc2UsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFBhdGg6c3RyaW5nID0gcGF0aC5qb2luKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IENsb3NlIGhhbmRsZXIgaGF2ZSB0byBiZSBzeW5jaHJvbm91cy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoVG9vbHMuaXNEaXJlY3RvcnlTeW5jKHNvdXJjZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChUb29scy5pc0RpcmVjdG9yeVN5bmModGFyZ2V0UGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseS5zeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhdGgsIHtnbG9iOiBmYWxzZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmNvcHlEaXJlY3RvcnlSZWN1cnNpdmVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlUGF0aCwgdGFyZ2V0UGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFRvb2xzLmlzRmlsZVN5bmMoc291cmNlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmNvcHlGaWxlU3luYyhzb3VyY2VQYXRoLCB0YXJnZXRQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGlkeVVwKC4uLnBhcmFtZXRlcilcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9zZUhhbmRsZXI6RnVuY3Rpb24gPSBUb29scy5nZXRQcm9jZXNzQ2xvc2VIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSwgcmVqZWN0LCBudWxsLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5hcmd2WzJdID09PSAnYnVpbGQnXG4gICAgICAgICAgICAgICAgICAgICAgICApID8gY29weUFkZGl0aW9uYWxGaWxlc0FuZFRpZHlVcCA6IHRpZHlVcClcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjbG9zZUV2ZW50TmFtZTpzdHJpbmcgb2YgVG9vbHMuY2xvc2VFdmVudE5hbWVzKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzLm9uKGNsb3NlRXZlbnROYW1lLCBjbG9zZUhhbmRsZXIpXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzc2VzLnB1c2goY2hpbGRQcm9jZXNzKVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgLy8gZW5kcmVnaW9uXG4gICAgICAgICAgICAvLyByZWdpb24gaGFuZGxlIHByZWluc3RhbGxcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5saWJyYXJ5ICYmXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdID09PSAncHJlaW5zdGFsbCdcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIFBlcmZvcm0gYWxsIGZpbGUgc3BlY2lmaWMgcHJlcHJvY2Vzc2luZyBzdHVmZi5cbiAgICAgICAgICAgICAgICBjb25zdCB0ZXN0TW9kdWxlRmlsZVBhdGhzOkFycmF5PHN0cmluZz4gPVxuICAgICAgICAgICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvblsndGVzdDpicm93c2VyJ10uaW5qZWN0aW9uLmludGVybmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLnJlcGxhY2VtZW50cy5ub3JtYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmV4dGVuc2lvbnMsIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZVxuICAgICAgICAgICAgICAgICAgICApLmZpbGVQYXRoc1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYnVpbGRDb25maWd1cmF0aW9uIG9mIGJ1aWxkQ29uZmlndXJhdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGg6c3RyaW5nIG9mIGJ1aWxkQ29uZmlndXJhdGlvbi5maWxlUGF0aHMpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRlc3RNb2R1bGVGaWxlUGF0aHMuaW5jbHVkZXMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZhbHVhdGlvbkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWw6T2JqZWN0LCBzZWxmOlBsYWluT2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb246UGxhaW5PYmplY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6dHlwZW9mIHBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxBcmd1bWVudHM6QXJyYXk8c3RyaW5nPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdnbG9iYWwnLCAnc2VsZicsICdidWlsZENvbmZpZ3VyYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BhdGgnLCAnYWRkaXRpb25hbEFyZ3VtZW50cycsICdmaWxlUGF0aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmV0dXJuIGAnICsgYnVpbGRDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0udHJpbSgpICsgJ2AnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWwsIHNlbGYsIGJ1aWxkQ29uZmlndXJhdGlvbiwgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxBcmd1bWVudHMsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQ6c3RyaW5nID0gZXZhbHVhdGlvbkZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWwsIGNvbmZpZ3VyYXRpb24sIGJ1aWxkQ29uZmlndXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aCwgYWRkaXRpb25hbEFyZ3VtZW50cywgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGBSdW5uaW5nIFwiJHtjb21tYW5kfVwiYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmU6RnVuY3Rpb24sIHJlamVjdDpGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiBUb29scy5oYW5kbGVDaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWNDaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kLCBjaGlsZFByb2Nlc3NPcHRpb25zLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6P0Vycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4gZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAgICAgLy8gcmVnaW9uIGhhbmRsZSByZW1haW5pbmcgdGFza3NcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZVRhc2sgPSAodHlwZTpzdHJpbmcpOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB0YXNrczpBcnJheTxPYmplY3Q+XG4gICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29uZmlndXJhdGlvbi5jb21tYW5kTGluZVt0eXBlXSkpXG4gICAgICAgICAgICAgICAgICAgIHRhc2tzID0gY29uZmlndXJhdGlvbi5jb21tYW5kTGluZVt0eXBlXVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgdGFza3MgPSBbY29uZmlndXJhdGlvbi5jb21tYW5kTGluZVt0eXBlXV1cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHRhc2s6T2JqZWN0IG9mIHRhc2tzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbDpPYmplY3QsIHNlbGY6UGxhaW5PYmplY3QsIHBhdGg6dHlwZW9mIHBhdGhcbiAgICAgICAgICAgICAgICAgICAgKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ2xvYmFsJywgJ3NlbGYnLCAncGF0aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JldHVybiAnICsgKHRhc2suaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpbmRpY2F0b3InXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA/IHRhc2suaW5kaWNhdG9yIDogJ3RydWUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKShnbG9iYWwsIHNlbGYsIHBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmFsdWF0aW9uRnVuY3Rpb24oZ2xvYmFsLCBjb25maWd1cmF0aW9uLCBwYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NQcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOkZ1bmN0aW9uLCByZWplY3Q6RnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZExpbmVBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5hcmd1bWVudHMgfHwgW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLmNvbmNhdChhZGRpdGlvbmFsQXJndW1lbnRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnUnVubmluZyBcIicgKyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3Rhc2suY29tbWFuZH0gYCArIGNvbW1hbmRMaW5lQXJndW1lbnRzLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKS50cmltKCkgKyAnXCInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUHJvY2VzczpDaGlsZFByb2Nlc3MgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGF3bkNoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suY29tbWFuZCwgY29tbWFuZExpbmVBcmd1bWVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3NPcHRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlSGFuZGxlcjpGdW5jdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvb2xzLmdldFByb2Nlc3NDbG9zZUhhbmRsZXIocmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb3NlRXZlbnROYW1lOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb29scy5jbG9zZUV2ZW50TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzcy5vbihjbG9zZUV2ZW50TmFtZSwgY2xvc2VIYW5kbGVyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzc2VzLnB1c2goY2hpbGRQcm9jZXNzKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gLyByZWdpb24gYS0vc3luY2hyb25vdXNcbiAgICAgICAgICAgIGlmIChbJ2RvY3VtZW50JywgJ3Rlc3QnXS5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9jZXNzUHJvbWlzZXMpXG4gICAgICAgICAgICAgICAgaGFuZGxlVGFzayhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFtcbiAgICAgICAgICAgICAgICAnbGludCcsICd0ZXN0OmJyb3dzZXInLCAnY2hlY2s6dHlwZScsICdzZXJ2ZSdcbiAgICAgICAgICAgIF0uaW5jbHVkZXMoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKSlcbiAgICAgICAgICAgICAgICBoYW5kbGVUYXNrKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSlcbiAgICAgICAgICAgIC8vIC8gZW5kcmVnaW9uXG4gICAgICAgICAgICAvLyBlbmRyZWdpb25cbiAgICAgICAgfVxuICAgICAgICBsZXQgZmluaXNoZWQ6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgIGNvbnN0IGNsb3NlSGFuZGxlciA9ICguLi5wYXJhbWV0ZXI6QXJyYXk8YW55Pik6dm9pZCA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpbmlzaGVkKVxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudEhhbmRsZXI6RnVuY3Rpb24gb2YgY2xvc2VFdmVudEhhbmRsZXJzKVxuICAgICAgICAgICAgICAgICAgICBjbG9zZUV2ZW50SGFuZGxlciguLi5wYXJhbWV0ZXIpXG4gICAgICAgICAgICBmaW5pc2hlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGNsb3NlRXZlbnROYW1lOnN0cmluZyBvZiBUb29scy5jbG9zZUV2ZW50TmFtZXMpXG4gICAgICAgICAgICBwcm9jZXNzLm9uKGNsb3NlRXZlbnROYW1lLCBjbG9zZUhhbmRsZXIpXG4gICAgICAgIGlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSAmJiAoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoIDwgMyB8fFxuICAgICAgICAgICAgIXBvc3NpYmxlQXJndW1lbnRzLmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSlcbiAgICAgICAgKSlcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgICAgICAgICBgR2l2ZSBvbmUgb2YgXCIke3Bvc3NpYmxlQXJndW1lbnRzLmpvaW4oJ1wiLCBcIicpfVwiIGFzIGNvbW1hbmQgYCArXG4gICAgICAgICAgICAgICAgJ2xpbmUgYXJndW1lbnQuIFlvdSBjYW4gcHJvdmlkZSBhIGpzb24gc3RyaW5nIGFzIHNlY29uZCAnICtcbiAgICAgICAgICAgICAgICAncGFyYW1ldGVyIHRvIGR5bmFtaWNhbGx5IG92ZXJ3cml0ZSBzb21lIGNvbmZpZ3VyYXRpb25zLlxcbicpXG4gICAgICAgIC8vIGVuZHJlZ2lvblxuICAgICAgICAvLyByZWdpb24gZm9yd2FyZCBuZXN0ZWQgcmV0dXJuIGNvZGVzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9jZXNzUHJvbWlzZXMpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBwcm9jZXNzLmV4aXQoZXJyb3IucmV0dXJuQ29kZSlcbiAgICAgICAgfVxuICAgICAgICAvLyBlbmRyZWdpb25cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5kZWJ1ZylcbiAgICAgICAgICAgIHRocm93IGVycm9yXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgfVxufVxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKVxuICAgIG1haW4oKS5jYXRjaCgoZXJyb3I6RXJyb3IpOnZvaWQgPT4ge1xuICAgICAgICB0aHJvdyBlcnJvclxuICAgIH0pXG5leHBvcnQgZGVmYXVsdCBtYWluXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==