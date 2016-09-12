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

var _child_process = require('child_process');

var _fs = require('fs');

var fileSystem = _interopRequireWildcard(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rimraf = require('rimraf');

var _configurator = require('./configurator.compiled');

var _configurator2 = _interopRequireDefault(_configurator);

var _helper = require('./helper.compiled');

var _helper2 = _interopRequireDefault(_helper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register');
} catch (error) {}

// endregion
// region controller
var childProcessOptions = {
    cwd: _configurator2.default.path.context,
    env: process.env,
    shell: true,
    stdio: 'inherit'
};
var closeEventNames = ['exit', 'close', 'uncaughtException', 'SIGINT', 'SIGTERM', 'SIGQUIT'];
var childProcesses = [];
var processPromises = [];
var possibleArguments = ['build', 'buildDLL', 'clear', 'document', 'lint', 'preinstall', 'serve', 'test', 'testInBrowser', 'typeCheck'];
var closeEventHandlers = [];
if (_configurator2.default.givenCommandLineArguments.length > 2) {
    (function () {
        // region temporary save dynamically given configurations
        var dynamicConfiguration = { givenCommandLineArguments: _configurator2.default.givenCommandLineArguments.slice() };
        if (_configurator2.default.givenCommandLineArguments.length > 3 && _helper2.default.parseEncodedObject(_configurator2.default.givenCommandLineArguments[_configurator2.default.givenCommandLineArguments.length - 1], _configurator2.default, 'configuration')) _configurator2.default.givenCommandLineArguments.pop();
        var count = 0;
        var filePath = _configurator2.default.path.context + '.' + ('dynamicConfiguration-' + count + '.json');
        while (true) {
            filePath = _configurator2.default.path.context + '.dynamicConfiguration-' + (count + '.json');
            if (!_helper2.default.isFileSync(filePath)) break;
            count += 1;
        }
        fileSystem.writeFileSync(filePath, JSON.stringify(dynamicConfiguration));
        var additionalArguments = process.argv.splice(3);
        // / region register exit handler to tidy up
        closeEventHandlers.push(function (error) {
            try {
                fileSystem.unlinkSync(filePath);
            } catch (error) {}
            if (error) throw error;
            return error;
        });
        // / endregion
        // endregion
        // region handle clear
        /*
            NOTE: A build,serve or test in browser could depend on previously
            created dll packages so a clean should not be performed in that case.
            NOTE: If we have dependency cycle it needed to preserve files during
            preinstall phase.
        */
        if (!['build', 'preinstall', 'serve', 'test', 'testInBrowser'].includes(_configurator2.default.givenCommandLineArguments[2]) && possibleArguments.includes(_configurator2.default.givenCommandLineArguments[2])) {
            if (_path2.default.resolve(_configurator2.default.path.target.base) === _path2.default.resolve(_configurator2.default.path.context)) {
                // Removes all compiled files.
                _helper2.default.walkDirectoryRecursivelySync(_configurator2.default.path.target.base, function (filePath, stat) {
                    if (_helper2.default.isFilePathInLocation(filePath, _configurator2.default.path.ignore.concat(_configurator2.default.module.directories, _configurator2.default.loader.directories).map(function (filePath) {
                        return _path2.default.resolve(_configurator2.default.path.context, filePath);
                    }).filter(function (filePath) {
                        return !_configurator2.default.path.context.startsWith(filePath);
                    }))) return false;
                    for (var type in _configurator2.default.build) {
                        if (new RegExp(_configurator2.default.build[type].fileNamePattern).test(filePath)) {
                            if (stat.isDirectory()) {
                                (0, _rimraf.sync)(filePath, {
                                    glob: false });
                                return false;
                            }
                            fileSystem.unlinkSync(filePath);
                            break;
                        }
                    }
                });
                fileSystem.readdirSync(_configurator2.default.path.target.base).forEach(function (fileName) {
                    if (fileName.length > '.dll-manifest.json'.length && fileName.endsWith('.dll-manifest.json') || fileName.startsWith('npm-debug')) fileSystem.unlinkSync(_path2.default.resolve(_configurator2.default.path.target.base, fileName));
                });
            } else (0, _rimraf.sync)(_configurator2.default.path.target.base, {
                glob: false });
            try {
                (0, _rimraf.sync)(_configurator2.default.path.apiDocumentation, { glob: false });
            } catch (error) {}
        }
        // endregion
        // region handle build
        var buildConfigurations = _helper2.default.resolveBuildConfigurationFilePaths(_configurator2.default.build, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore.concat(_configurator2.default.module.directories, _configurator2.default.loader.directories).map(function (filePath) {
            return _path2.default.resolve(_configurator2.default.path.context, filePath);
        }).filter(function (filePath) {
            return !_configurator2.default.path.context.startsWith(filePath);
        }));
        if (['build', 'buildDLL', 'document', 'test'].includes(process.argv[2])) {
            (function () {
                var tidiedUp = false;
                var tidyUp = function tidyUp() {
                    /*
                        Determines all none javaScript entities which have been emitted
                        as single javaScript module to remove.
                    */
                    if (tidiedUp) return;
                    tidiedUp = true;
                    for (var chunkName in _configurator2.default.injection.internal.normalized) {
                        if (_configurator2.default.injection.internal.normalized.hasOwnProperty(chunkName)) {
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = _configurator2.default.injection.internal.normalized[chunkName][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var _moduleID = _step.value;

                                    var type = _helper2.default.determineAssetType(
                                    // IgnoreTypeCheck
                                    _helper2.default.determineModuleFilePath(_moduleID, _configurator2.default.module.aliases, _configurator2.default.knownExtensions, _configurator2.default.path.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore), _configurator2.default.build, _configurator2.default.path);
                                    if (typeof type === 'string' && _configurator2.default.build[type]) {
                                        var _filePath = _helper2.default.renderFilePathTemplate(_helper2.default.stripLoader(_configurator2.default.files.compose.javaScript, { '[name]': chunkName }));
                                        if (_configurator2.default.build[type].outputExtension === 'js' && _helper2.default.isFileSync(_filePath)) fileSystem.chmodSync(_filePath, '755');
                                    }
                                }
                            } catch (err) {
                                _didIteratorError = true;
                                _iteratorError = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion && _iterator.return) {
                                        _iterator.return();
                                    }
                                } finally {
                                    if (_didIteratorError) {
                                        throw _iteratorError;
                                    }
                                }
                            }
                        }
                    }var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = _configurator2.default.path.tidyUp[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _filePath2 = _step2.value;

                            if (_filePath2) try {
                                fileSystem.unlinkSync(_filePath2);
                            } catch (error) {}
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
                };
                closeEventHandlers.push(tidyUp);
                /*
                    Triggers complete asset compiling and bundles them into the final
                    productive output.
                */
                processPromises.push(new Promise(function (resolve, reject) {
                    var commandLineArguments = (_configurator2.default.commandLine.build.arguments || []).concat(additionalArguments);
                    console.log('Running "' + (_configurator2.default.commandLine.build.command + ' ' + commandLineArguments.join(' ')).trim() + '"');
                    var childProcess = (0, _child_process.spawn)(_configurator2.default.commandLine.build.command, commandLineArguments, childProcessOptions);
                    var copyAdditionalFilesAndTidyUp = function copyAdditionalFilesAndTidyUp() {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = _configurator2.default.files.additionalPaths[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var _filePath3 = _step3.value;

                                var sourcePath = _path2.default.join(_configurator2.default.path.source.base, _filePath3);
                                try {
                                    if (fileSystem.lstatSync(sourcePath).isDirectory()) _helper2.default.copyDirectoryRecursiveSync(sourcePath, _configurator2.default.path.target.base);else _helper2.default.copyFileSync(sourcePath, _configurator2.default.path.target.base);
                                } catch (error) {
                                    break;
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

                        tidyUp();
                    };
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = closeEventNames[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var closeEventName = _step4.value;

                            childProcess.on(closeEventName, _helper2.default.getProcessCloseHandler(resolve, reject, closeEventName, process.argv[2] === 'build' ? copyAdditionalFilesAndTidyUp : tidyUp));
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

                    childProcesses.push(childProcess);
                }));
                // endregion
                // region handle preinstall
            })();
        } else if (_configurator2.default.library && _configurator2.default.givenCommandLineArguments[2] === 'preinstall') {
            // Perform all file specific preprocessing stuff.
            var testModuleFilePaths = _helper2.default.determineModuleLocations(_configurator2.default.testInBrowser.injection.internal, _configurator2.default.module.aliases, _configurator2.default.knownExtensions, _configurator2.default.path.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore).filePaths;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                var _loop = function _loop() {
                    var buildConfiguration = _step5.value;
                    var _iteratorNormalCompletion6 = true;
                    var _didIteratorError6 = false;
                    var _iteratorError6 = undefined;

                    try {
                        var _loop2 = function _loop2() {
                            var filePath = _step6.value;

                            if (!testModuleFilePaths.includes(filePath)) {
                                (function () {
                                    var evaluationFunction = function evaluationFunction(global, self, buildConfiguration, path, additionalArguments, filePath
                                    // IgnoreTypeCheck
                                    ) {
                                        return new Function('global', 'self', 'buildConfiguration', 'path', 'additionalArguments', 'filePath', 'return `' + buildConfiguration[_configurator2.default.givenCommandLineArguments[2]].trim() + '`')(global, self, buildConfiguration, path, additionalArguments, filePath);
                                    };
                                    processPromises.push(new Promise(function (resolve, reject) {
                                        var command = evaluationFunction(global, _configurator2.default, buildConfiguration, _path2.default, additionalArguments, filePath);
                                        console.log('Running "' + command + '"');
                                        _helper2.default.handleChildProcess((0, _child_process.exec)(command, childProcessOptions, function (error) {
                                            if (error) reject(error);else resolve('exit');
                                        }));
                                    }));
                                })();
                            }
                        };

                        for (var _iterator6 = buildConfiguration.filePaths[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            _loop2();
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
                };

                for (var _iterator5 = buildConfigurations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    _loop();
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
        }
        // endregion
        // region handle remaining tasks
        var handleTask = function handleTask(type) {
            var tasks = void 0;
            if (Array.isArray(_configurator2.default.commandLine[type])) tasks = _configurator2.default.commandLine[type];else tasks = [_configurator2.default.commandLine[type]];
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                var _loop3 = function _loop3() {
                    var task = _step7.value;

                    var evaluationFunction = function evaluationFunction(global, self, path
                    // IgnoreTypeCheck
                    ) {
                        return new Function('global', 'self', 'path', 'return ' + (task.hasOwnProperty('indicator') ? task.indicator : 'true'))(global, self, path);
                    };
                    if (evaluationFunction(global, _configurator2.default, _path2.default)) processPromises.push(new Promise(function (resolve, reject) {
                        var commandLineArguments = (task.arguments || []).concat(additionalArguments);
                        console.log('Running "' + (task.command + ' ' + commandLineArguments.join(' ')).trim() + '"');
                        var childProcess = (0, _child_process.spawn)(task.command, commandLineArguments, childProcessOptions);
                        var _iteratorNormalCompletion8 = true;
                        var _didIteratorError8 = false;
                        var _iteratorError8 = undefined;

                        try {
                            for (var _iterator8 = closeEventNames[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                                var closeEventName = _step8.value;

                                childProcess.on(closeEventName, _helper2.default.getProcessCloseHandler(resolve, reject, closeEventName));
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

                        childProcesses.push(childProcess);
                    }));
                };

                for (var _iterator7 = tasks[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    _loop3();
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        };
        // / region synchronous
        if (['document', 'test'].includes(_configurator2.default.givenCommandLineArguments[2])) Promise.all(processPromises).then(function () {
            return handleTask(_configurator2.default.givenCommandLineArguments[2]);
        });
        // / endregion
        // / region asynchronous
        else if (['lint', 'testInBrowser', 'typeCheck', 'serve'].includes(_configurator2.default.givenCommandLineArguments[2])) handleTask(_configurator2.default.givenCommandLineArguments[2]);
        // / endregion
        // endregion
    })();
}
var finished = false;
var closeHandler = function closeHandler() {
    if (!finished) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
            for (var _iterator9 = closeEventHandlers[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                var _closeEventHandler = _step9.value;

                _closeEventHandler.apply(this, arguments);
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
    }finished = true;
};
var _iteratorNormalCompletion10 = true;
var _didIteratorError10 = false;
var _iteratorError10 = undefined;

try {
    for (var _iterator10 = closeEventNames[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
        var closeEventName = _step10.value;

        process.on(closeEventName, closeHandler);
    } // IgnoreTypeCheck
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

if (require.main === module && (_configurator2.default.givenCommandLineArguments.length < 3 || !possibleArguments.includes(_configurator2.default.givenCommandLineArguments[2]))) console.log('Give one of "' + possibleArguments.join('", "') + '" as command line ' + 'argument. You can provide a json string as second parameter to ' + 'dynamically overwrite some configurations.\n');
// endregion
// region forward nested return codes
Promise.all(processPromises).catch(function (error) {
    return process.exit(
    // IgnoreTypeCheck
    error.returnCode);
});
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

//# sourceMappingURL=data:application/json;base64,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Y29tcGlsZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG4vLyBAZmxvd1xuLy8gLSotIGNvZGluZzogdXRmLTggLSotXG4ndXNlIHN0cmljdCdcbi8qICFcbiAgICByZWdpb24gaGVhZGVyXG4gICAgQ29weXJpZ2h0IFRvcmJlbiBTaWNrZXJ0IChpbmZvW1wifmF0flwiXXRvcmJlbi53ZWJzaXRlKSAxNi4xMi4yMDEyXG5cbiAgICBMaWNlbnNlXG4gICAgLS0tLS0tLVxuXG4gICAgVGhpcyBsaWJyYXJ5IHdyaXR0ZW4gYnkgVG9yYmVuIFNpY2tlcnQgc3RhbmQgdW5kZXIgYSBjcmVhdGl2ZSBjb21tb25zIG5hbWluZ1xuICAgIDMuMCB1bnBvcnRlZCBsaWNlbnNlLiBzZWUgaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnkvMy4wL2RlZWQuZGVcbiAgICBlbmRyZWdpb25cbiovXG4vLyByZWdpb24gaW1wb3J0c1xuaW1wb3J0IHtcbiAgICBDaGlsZFByb2Nlc3MsIGV4ZWMgYXMgZXhlY0NoaWxkUHJvY2Vzcywgc3Bhd24gYXMgc3Bhd25DaGlsZFByb2Nlc3Ncbn0gZnJvbSAnY2hpbGRfcHJvY2VzcydcbmltcG9ydCAqIGFzIGZpbGVTeXN0ZW0gZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHtzeW5jIGFzIHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luY30gZnJvbSAncmltcmFmJ1xuLy8gTk9URTogT25seSBuZWVkZWQgZm9yIGRlYnVnZ2luZyB0aGlzIGZpbGUuXG50cnkge1xuICAgIHJlcXVpcmUoJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlcicpXG59IGNhdGNoIChlcnJvcikge31cblxuaW1wb3J0IGNvbmZpZ3VyYXRpb24gZnJvbSAnLi9jb25maWd1cmF0b3IuY29tcGlsZWQnXG5pbXBvcnQgSGVscGVyIGZyb20gJy4vaGVscGVyLmNvbXBpbGVkJ1xuaW1wb3J0IHR5cGUge1xuICAgIFBsYWluT2JqZWN0LCBQcm9taXNlQ2FsbGJhY2tGdW5jdGlvbiwgUmVzb2x2ZWRCdWlsZENvbmZpZ3VyYXRpb25cbn0gZnJvbSAnLi90eXBlJ1xuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gY29udHJvbGxlclxuY29uc3QgY2hpbGRQcm9jZXNzT3B0aW9uczpPYmplY3QgPSB7XG4gICAgY3dkOiBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICBlbnY6IHByb2Nlc3MuZW52LFxuICAgIHNoZWxsOiB0cnVlLFxuICAgIHN0ZGlvOiAnaW5oZXJpdCdcbn1cbmNvbnN0IGNsb3NlRXZlbnROYW1lczpBcnJheTxzdHJpbmc+ID0gW1xuICAgICdleGl0JywgJ2Nsb3NlJywgJ3VuY2F1Z2h0RXhjZXB0aW9uJywgJ1NJR0lOVCcsICdTSUdURVJNJywgJ1NJR1FVSVQnXVxuY29uc3QgY2hpbGRQcm9jZXNzZXM6QXJyYXk8Q2hpbGRQcm9jZXNzPiA9IFtdXG5jb25zdCBwcm9jZXNzUHJvbWlzZXM6QXJyYXk8UHJvbWlzZTxhbnk+PiA9IFtdXG5jb25zdCBwb3NzaWJsZUFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gW1xuICAgICdidWlsZCcsICdidWlsZERMTCcsICdjbGVhcicsICdkb2N1bWVudCcsICdsaW50JywgJ3ByZWluc3RhbGwnLCAnc2VydmUnLFxuICAgICd0ZXN0JywgJ3Rlc3RJbkJyb3dzZXInLCAndHlwZUNoZWNrJ11cbmNvbnN0IGNsb3NlRXZlbnRIYW5kbGVyczpBcnJheTxGdW5jdGlvbj4gPSBbXVxuaWYgKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgLy8gcmVnaW9uIHRlbXBvcmFyeSBzYXZlIGR5bmFtaWNhbGx5IGdpdmVuIGNvbmZpZ3VyYXRpb25zXG4gICAgLy8gTk9URTogV2UgbmVlZCBhIGNvcHkgb2YgZ2l2ZW4gYXJndW1lbnRzIGFycmF5LlxuICAgIGxldCBkeW5hbWljQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCA9IHtnaXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzOlxuICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMuc2xpY2UoKX1cbiAgICBpZiAoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPiAzICYmXG4gICAgICAgIEhlbHBlci5wYXJzZUVuY29kZWRPYmplY3QoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCAtIDFdLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbiwgJ2NvbmZpZ3VyYXRpb24nKVxuICAgIClcbiAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLnBvcCgpXG4gICAgbGV0IGNvdW50Om51bWJlciA9IDBcbiAgICBsZXQgZmlsZVBhdGg6c3RyaW5nID0gYCR7Y29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHR9LmAgK1xuICAgICAgICBgZHluYW1pY0NvbmZpZ3VyYXRpb24tJHtjb3VudH0uanNvbmBcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBmaWxlUGF0aCA9IGAke2NvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0fS5keW5hbWljQ29uZmlndXJhdGlvbi1gICtcbiAgICAgICAgICAgIGAke2NvdW50fS5qc29uYFxuICAgICAgICBpZiAoIUhlbHBlci5pc0ZpbGVTeW5jKGZpbGVQYXRoKSlcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNvdW50ICs9IDFcbiAgICB9XG4gICAgZmlsZVN5c3RlbS53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBKU09OLnN0cmluZ2lmeShkeW5hbWljQ29uZmlndXJhdGlvbikpXG4gICAgY29uc3QgYWRkaXRpb25hbEFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gcHJvY2Vzcy5hcmd2LnNwbGljZSgzKVxuICAgIC8vIC8gcmVnaW9uIHJlZ2lzdGVyIGV4aXQgaGFuZGxlciB0byB0aWR5IHVwXG4gICAgY2xvc2VFdmVudEhhbmRsZXJzLnB1c2goZnVuY3Rpb24oZXJyb3I6P0Vycm9yKTo/RXJyb3Ige1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmtTeW5jKGZpbGVQYXRoKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgICAgcmV0dXJuIGVycm9yXG4gICAgfSlcbiAgICAvLyAvIGVuZHJlZ2lvblxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBoYW5kbGUgY2xlYXJcbiAgICAvKlxuICAgICAgICBOT1RFOiBBIGJ1aWxkLHNlcnZlIG9yIHRlc3QgaW4gYnJvd3NlciBjb3VsZCBkZXBlbmQgb24gcHJldmlvdXNseVxuICAgICAgICBjcmVhdGVkIGRsbCBwYWNrYWdlcyBzbyBhIGNsZWFuIHNob3VsZCBub3QgYmUgcGVyZm9ybWVkIGluIHRoYXQgY2FzZS5cbiAgICAgICAgTk9URTogSWYgd2UgaGF2ZSBkZXBlbmRlbmN5IGN5Y2xlIGl0IG5lZWRlZCB0byBwcmVzZXJ2ZSBmaWxlcyBkdXJpbmdcbiAgICAgICAgcHJlaW5zdGFsbCBwaGFzZS5cbiAgICAqL1xuICAgIGlmICghWydidWlsZCcsICdwcmVpbnN0YWxsJywgJ3NlcnZlJywgJ3Rlc3QnLCAndGVzdEluQnJvd3NlciddLmluY2x1ZGVzKFxuICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICApICYmIHBvc3NpYmxlQXJndW1lbnRzLmluY2x1ZGVzKFxuICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICApKSB7XG4gICAgICAgIGlmIChwYXRoLnJlc29sdmUoY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKSA9PT0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHRcbiAgICAgICAgKSkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlcyBhbGwgY29tcGlsZWQgZmlsZXMuXG4gICAgICAgICAgICBIZWxwZXIud2Fsa0RpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIChcbiAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGg6c3RyaW5nLCBzdGF0Ok9iamVjdFxuICAgICAgICAgICAgICAgICk6P2Jvb2xlYW4gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoSGVscGVyLmlzRmlsZVBhdGhJbkxvY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVBhdGgsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmUuY29uY2F0KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmRpcmVjdG9yaWVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ubG9hZGVyLmRpcmVjdG9yaWVzXG4gICAgICAgICAgICAgICAgICAgICAgICApLm1hcCgoZmlsZVBhdGg6c3RyaW5nKTpzdHJpbmcgPT4gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICkuZmlsdGVyKChmaWxlUGF0aDpzdHJpbmcpOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQuc3RhcnRzV2l0aChmaWxlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlOnN0cmluZyBpbiBjb25maWd1cmF0aW9uLmJ1aWxkKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ldyBSZWdFeHAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZFt0eXBlXS5maWxlTmFtZVBhdHRlcm5cbiAgICAgICAgICAgICAgICAgICAgICAgICkudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhmaWxlUGF0aCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYjogZmFsc2V9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmtTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGZpbGVTeXN0ZW0ucmVhZGRpclN5bmMoY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKS5mb3JFYWNoKChcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTpzdHJpbmdcbiAgICAgICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5sZW5ndGggPiAnLmRsbC1tYW5pZmVzdC5qc29uJy5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuZW5kc1dpdGgoJy5kbGwtbWFuaWZlc3QuanNvbicpIHx8XG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLnN0YXJ0c1dpdGgoJ25wbS1kZWJ1ZycpXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnVubGlua1N5bmMocGF0aC5yZXNvbHZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlLCBmaWxlTmFtZSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgIHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIHtcbiAgICAgICAgICAgICAgICBnbG9iOiBmYWxzZX0pXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZW1vdmVEaXJlY3RvcnlSZWN1cnNpdmVseVN5bmMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmFwaURvY3VtZW50YXRpb24sIHtnbG9iOiBmYWxzZX0pXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gaGFuZGxlIGJ1aWxkXG4gICAgY29uc3QgYnVpbGRDb25maWd1cmF0aW9uczpSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvbiA9XG4gICAgICAgIEhlbHBlci5yZXNvbHZlQnVpbGRDb25maWd1cmF0aW9uRmlsZVBhdGhzKFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5idWlsZCwgY29uZmlndXJhdGlvbi5wYXRoLnNvdXJjZS5hc3NldC5iYXNlLFxuICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3JpZXMsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3JpZXNcbiAgICAgICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSkpXG4gICAgaWYgKFsnYnVpbGQnLCAnYnVpbGRETEwnLCAnZG9jdW1lbnQnLCAndGVzdCddLmluY2x1ZGVzKHByb2Nlc3MuYXJndlsyXSkpIHtcbiAgICAgICAgbGV0IHRpZGllZFVwOmJvb2xlYW4gPSBmYWxzZVxuICAgICAgICBjb25zdCB0aWR5VXA6RnVuY3Rpb24gPSAoKTp2b2lkID0+IHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgRGV0ZXJtaW5lcyBhbGwgbm9uZSBqYXZhU2NyaXB0IGVudGl0aWVzIHdoaWNoIGhhdmUgYmVlbiBlbWl0dGVkXG4gICAgICAgICAgICAgICAgYXMgc2luZ2xlIGphdmFTY3JpcHQgbW9kdWxlIHRvIHJlbW92ZS5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBpZiAodGlkaWVkVXApXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB0aWRpZWRVcCA9IHRydWVcbiAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgY29uc3QgY2h1bmtOYW1lOnN0cmluZyBpblxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uaW5qZWN0aW9uLmludGVybmFsLm5vcm1hbGl6ZWRcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZC5oYXNPd25Qcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgICAgY2h1bmtOYW1lXG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZUlEOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFtjaHVua05hbWVdXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHlwZTo/c3RyaW5nID0gSGVscGVyLmRldGVybWluZUFzc2V0VHlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlRmlsZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZUlELCBjb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmtub3duRXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIGNvbmZpZ3VyYXRpb24uYnVpbGQsIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiYgY29uZmlndXJhdGlvbi5idWlsZFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZVBhdGg6c3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLnJlbmRlckZpbGVQYXRoVGVtcGxhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuc3RyaXBMb2FkZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5jb21wb3NlLmphdmFTY3JpcHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeydbbmFtZV0nOiBjaHVua05hbWV9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5idWlsZFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0ub3V0cHV0RXh0ZW5zaW9uID09PSAnanMnICYmIEhlbHBlci5pc0ZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0uY2htb2RTeW5jKGZpbGVQYXRoLCAnNzU1JylcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlUGF0aDo/c3RyaW5nIG9mIGNvbmZpZ3VyYXRpb24ucGF0aC50aWR5VXApXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS51bmxpbmtTeW5jKGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgICAgfVxuICAgICAgICBjbG9zZUV2ZW50SGFuZGxlcnMucHVzaCh0aWR5VXApXG4gICAgICAgIC8qXG4gICAgICAgICAgICBUcmlnZ2VycyBjb21wbGV0ZSBhc3NldCBjb21waWxpbmcgYW5kIGJ1bmRsZXMgdGhlbSBpbnRvIHRoZSBmaW5hbFxuICAgICAgICAgICAgcHJvZHVjdGl2ZSBvdXRwdXQuXG4gICAgICAgICovXG4gICAgICAgIHByb2Nlc3NQcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgIHJlc29sdmU6UHJvbWlzZUNhbGxiYWNrRnVuY3Rpb24sIHJlamVjdDpQcm9taXNlQ2FsbGJhY2tGdW5jdGlvblxuICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZExpbmVBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lLmJ1aWxkLmFyZ3VtZW50cyB8fCBbXVxuICAgICAgICAgICAgKS5jb25jYXQoYWRkaXRpb25hbEFyZ3VtZW50cylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSdW5uaW5nIFwiJyArIChcbiAgICAgICAgICAgICAgICBgJHtjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lLmJ1aWxkLmNvbW1hbmR9IGAgK1xuICAgICAgICAgICAgICAgIGNvbW1hbmRMaW5lQXJndW1lbnRzLmpvaW4oJyAnKVxuICAgICAgICAgICAgKS50cmltKCkgKyAnXCInKVxuICAgICAgICAgICAgY29uc3QgY2hpbGRQcm9jZXNzOkNoaWxkUHJvY2VzcyA9IHNwYXduQ2hpbGRQcm9jZXNzKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmUuYnVpbGQuY29tbWFuZCwgY29tbWFuZExpbmVBcmd1bWVudHMsXG4gICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzT3B0aW9ucylcbiAgICAgICAgICAgIGNvbnN0IGNvcHlBZGRpdGlvbmFsRmlsZXNBbmRUaWR5VXA6RnVuY3Rpb24gPSAoKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgb2ZcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5maWxlcy5hZGRpdGlvbmFsUGF0aHNcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc291cmNlUGF0aDpzdHJpbmcgPSBwYXRoLmpvaW4oXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmJhc2UsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVTeXN0ZW0ubHN0YXRTeW5jKHNvdXJjZVBhdGgpLmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmNvcHlEaXJlY3RvcnlSZWN1cnNpdmVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VQYXRoLCBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmNvcHlGaWxlU3luYyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlUGF0aCwgY29uZmlndXJhdGlvbi5wYXRoLnRhcmdldC5iYXNlKVxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aWR5VXAoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBjbG9zZUV2ZW50TmFtZTpzdHJpbmcgb2YgY2xvc2VFdmVudE5hbWVzKVxuICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzcy5vbihjbG9zZUV2ZW50TmFtZSwgSGVscGVyLmdldFByb2Nlc3NDbG9zZUhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUsIHJlamVjdCwgY2xvc2VFdmVudE5hbWUsIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3MuYXJndlsyXSA9PT0gJ2J1aWxkJ1xuICAgICAgICAgICAgICAgICAgICApID8gY29weUFkZGl0aW9uYWxGaWxlc0FuZFRpZHlVcCA6IHRpZHlVcCkpXG4gICAgICAgICAgICBjaGlsZFByb2Nlc3Nlcy5wdXNoKGNoaWxkUHJvY2VzcylcbiAgICAgICAgfSkpXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGhhbmRsZSBwcmVpbnN0YWxsXG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgY29uZmlndXJhdGlvbi5saWJyYXJ5ICYmXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSA9PT0gJ3ByZWluc3RhbGwnXG4gICAgKSB7XG4gICAgICAgIC8vIFBlcmZvcm0gYWxsIGZpbGUgc3BlY2lmaWMgcHJlcHJvY2Vzc2luZyBzdHVmZi5cbiAgICAgICAgY29uc3QgdGVzdE1vZHVsZUZpbGVQYXRoczpBcnJheTxzdHJpbmc+ID1cbiAgICAgICAgICAgIEhlbHBlci5kZXRlcm1pbmVNb2R1bGVMb2NhdGlvbnMoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi50ZXN0SW5Ccm93c2VyLmluamVjdGlvbi5pbnRlcm5hbCxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5hbGlhc2VzLCBjb25maWd1cmF0aW9uLmtub3duRXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsIGNvbmZpZ3VyYXRpb24ucGF0aC5pZ25vcmVcbiAgICAgICAgICAgICkuZmlsZVBhdGhzXG4gICAgICAgIGZvciAoY29uc3QgYnVpbGRDb25maWd1cmF0aW9uIG9mIGJ1aWxkQ29uZmlndXJhdGlvbnMpXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoOnN0cmluZyBvZiBidWlsZENvbmZpZ3VyYXRpb24uZmlsZVBhdGhzKVxuICAgICAgICAgICAgICAgIGlmICghdGVzdE1vZHVsZUZpbGVQYXRocy5pbmNsdWRlcyhmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZhbHVhdGlvbkZ1bmN0aW9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsOk9iamVjdCwgc2VsZjpQbGFpbk9iamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkQ29uZmlndXJhdGlvbjpQbGFpbk9iamVjdCwgcGF0aDp0eXBlb2YgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiwgZmlsZVBhdGg6c3RyaW5nXG4gICAgICAgICAgICAgICAgICAgICk6c3RyaW5nID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZ2xvYmFsJywgJ3NlbGYnLCAnYnVpbGRDb25maWd1cmF0aW9uJywgJ3BhdGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhZGRpdGlvbmFsQXJndW1lbnRzJywgJ2ZpbGVQYXRoJywgJ3JldHVybiBgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLnRyaW0oKSArICdgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWwsIHNlbGYsIGJ1aWxkQ29uZmlndXJhdGlvbiwgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQXJndW1lbnRzLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpQcm9taXNlQ2FsbGJhY2tGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdDpQcm9taXNlQ2FsbGJhY2tGdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZDpzdHJpbmcgPSBldmFsdWF0aW9uRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsLCBjb25maWd1cmF0aW9uLCBidWlsZENvbmZpZ3VyYXRpb24sIHBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbEFyZ3VtZW50cywgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUnVubmluZyBcIiR7Y29tbWFuZH1cImApXG4gICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuaGFuZGxlQ2hpbGRQcm9jZXNzKGV4ZWNDaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZCwgY2hpbGRQcm9jZXNzT3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXJyb3I6P0Vycm9yKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCdleGl0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgfVxuICAgIH1cbiAgICAvLyBlbmRyZWdpb25cbiAgICAvLyByZWdpb24gaGFuZGxlIHJlbWFpbmluZyB0YXNrc1xuICAgIGNvbnN0IGhhbmRsZVRhc2sgPSAodHlwZTpzdHJpbmcpOnZvaWQgPT4ge1xuICAgICAgICBsZXQgdGFza3M6QXJyYXk8T2JqZWN0PlxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdKSlcbiAgICAgICAgICAgIHRhc2tzID0gY29uZmlndXJhdGlvbi5jb21tYW5kTGluZVt0eXBlXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0YXNrcyA9IFtjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdXVxuICAgICAgICBmb3IgKGNvbnN0IHRhc2s6T2JqZWN0IG9mIHRhc2tzKSB7XG4gICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgZ2xvYmFsOk9iamVjdCwgc2VsZjpQbGFpbk9iamVjdCwgcGF0aDp0eXBlb2YgcGF0aFxuICAgICAgICAgICAgKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgICAgICAgICAgICAgbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAnZ2xvYmFsJywgJ3NlbGYnLCAncGF0aCcsXG4gICAgICAgICAgICAgICAgICAgICdyZXR1cm4gJyArICh0YXNrLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luZGljYXRvcidcbiAgICAgICAgICAgICAgICAgICAgKSA/IHRhc2suaW5kaWNhdG9yIDogJ3RydWUnKVxuICAgICAgICAgICAgICAgICkoZ2xvYmFsLCBzZWxmLCBwYXRoKVxuICAgICAgICAgICAgaWYgKGV2YWx1YXRpb25GdW5jdGlvbihnbG9iYWwsIGNvbmZpZ3VyYXRpb24sIHBhdGgpKVxuICAgICAgICAgICAgICAgIHByb2Nlc3NQcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZTpQcm9taXNlQ2FsbGJhY2tGdW5jdGlvbixcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0OlByb21pc2VDYWxsYmFja0Z1bmN0aW9uXG4gICAgICAgICAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFuZExpbmVBcmd1bWVudHM6QXJyYXk8c3RyaW5nPiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suYXJndW1lbnRzIHx8IFtdXG4gICAgICAgICAgICAgICAgICAgICkuY29uY2F0KGFkZGl0aW9uYWxBcmd1bWVudHMpXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSdW5uaW5nIFwiJyArIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGAke3Rhc2suY29tbWFuZH0gJHtjb21tYW5kTGluZUFyZ3VtZW50cy5qb2luKCcgJyl9YFxuICAgICAgICAgICAgICAgICAgICApLnRyaW0oKSArICdcIicpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUHJvY2VzczpDaGlsZFByb2Nlc3MgPSBzcGF3bkNoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhc2suY29tbWFuZCwgY29tbWFuZExpbmVBcmd1bWVudHMsIGNoaWxkUHJvY2Vzc09wdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNsb3NlRXZlbnROYW1lOnN0cmluZyBvZiBjbG9zZUV2ZW50TmFtZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Mub24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VFdmVudE5hbWUsIEhlbHBlci5nZXRQcm9jZXNzQ2xvc2VIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlLCByZWplY3QsIGNsb3NlRXZlbnROYW1lKSlcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRQcm9jZXNzZXMucHVzaChjaGlsZFByb2Nlc3MpXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gLyByZWdpb24gc3luY2hyb25vdXNcbiAgICBpZiAoWydkb2N1bWVudCcsICd0ZXN0J10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkpXG4gICAgICAgIFByb21pc2UuYWxsKHByb2Nlc3NQcm9taXNlcykudGhlbigoKTp2b2lkID0+IGhhbmRsZVRhc2soXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pKVxuICAgIC8vIC8gZW5kcmVnaW9uXG4gICAgLy8gLyByZWdpb24gYXN5bmNocm9ub3VzXG4gICAgZWxzZSBpZiAoWydsaW50JywgJ3Rlc3RJbkJyb3dzZXInLCAndHlwZUNoZWNrJywgJ3NlcnZlJ10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkpXG4gICAgICAgIGhhbmRsZVRhc2soY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdKVxuICAgIC8vIC8gZW5kcmVnaW9uXG4gICAgLy8gZW5kcmVnaW9uXG59XG5sZXQgZmluaXNoZWQ6Ym9vbGVhbiA9IGZhbHNlXG5jb25zdCBjbG9zZUhhbmRsZXIgPSBmdW5jdGlvbigpOnZvaWQge1xuICAgIGlmICghZmluaXNoZWQpXG4gICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudEhhbmRsZXI6RnVuY3Rpb24gb2YgY2xvc2VFdmVudEhhbmRsZXJzKVxuICAgICAgICAgICAgY2xvc2VFdmVudEhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIGZpbmlzaGVkID0gdHJ1ZVxufVxuZm9yIChjb25zdCBjbG9zZUV2ZW50TmFtZTpzdHJpbmcgb2YgY2xvc2VFdmVudE5hbWVzKVxuICAgIHByb2Nlc3Mub24oY2xvc2VFdmVudE5hbWUsIGNsb3NlSGFuZGxlcilcbi8vIElnbm9yZVR5cGVDaGVja1xuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlICYmIChcbiAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoIDwgMyB8fFxuICAgICFwb3NzaWJsZUFyZ3VtZW50cy5pbmNsdWRlcyhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pXG4pKVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgR2l2ZSBvbmUgb2YgXCIke3Bvc3NpYmxlQXJndW1lbnRzLmpvaW4oJ1wiLCBcIicpfVwiIGFzIGNvbW1hbmQgbGluZSBgICtcbiAgICAgICAgJ2FyZ3VtZW50LiBZb3UgY2FuIHByb3ZpZGUgYSBqc29uIHN0cmluZyBhcyBzZWNvbmQgcGFyYW1ldGVyIHRvICcgK1xuICAgICAgICAnZHluYW1pY2FsbHkgb3ZlcndyaXRlIHNvbWUgY29uZmlndXJhdGlvbnMuXFxuJylcbi8vIGVuZHJlZ2lvblxuLy8gcmVnaW9uIGZvcndhcmQgbmVzdGVkIHJldHVybiBjb2Rlc1xuUHJvbWlzZS5hbGwocHJvY2Vzc1Byb21pc2VzKS5jYXRjaCgoZXJyb3I6RXJyb3IpOnZvaWQgPT4gcHJvY2Vzcy5leGl0KFxuICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgIGVycm9yLnJldHVybkNvZGUpKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gdmltIG1vZGxpbmVcbi8vIHZpbTogc2V0IHRhYnN0b3A9NCBzaGlmdHdpZHRoPTQgZXhwYW5kdGFiOlxuLy8gdmltOiBmb2xkbWV0aG9kPW1hcmtlciBmb2xkbWFya2VyPXJlZ2lvbixlbmRyZWdpb246XG4vLyBlbmRyZWdpb25cbiJdfQ==