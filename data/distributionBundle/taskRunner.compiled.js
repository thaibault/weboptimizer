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
                    if (_helper2.default.isFilePathInLocation(filePath, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
                        return _path2.default.resolve(_configurator2.default.path.context, filePath);
                    }).filter(function (filePath) {
                        return !_configurator2.default.path.context.startsWith(filePath);
                    }))) return false;
                    for (var type in _configurator2.default.build.types) {
                        if (new RegExp(_configurator2.default.build.types[type].filePathPattern).test(filePath)) {
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
        var buildConfigurations = _helper2.default.resolveBuildConfigurationFilePaths(_configurator2.default.build.types, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore.concat(_configurator2.default.module.directoryNames, _configurator2.default.loader.directoryNames).map(function (filePath) {
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
                                    _helper2.default.determineModuleFilePath(_moduleID, _configurator2.default.module.aliases, _configurator2.default.extensions, _configurator2.default.path.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore, _configurator2.default.module.directoryNames, _configurator2.default.package.main.fileNames, _configurator2.default.package.main.propertyNames, _configurator2.default.package.aliasPropertyNames), _configurator2.default.build.types, _configurator2.default.path);
                                    if (typeof type === 'string' && _configurator2.default.build.types[type]) {
                                        var _filePath = _helper2.default.renderFilePathTemplate(_helper2.default.stripLoader(_configurator2.default.files.compose.javaScript), { '[name]': chunkName });
                                        if (_configurator2.default.build.types[type].outputExtension === 'js' && _helper2.default.isFileSync(_filePath)) fileSystem.chmodSync(_filePath, '755');
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
                                if (_helper2.default.isDirectorySync(sourcePath)) _helper2.default.copyDirectoryRecursiveSync(sourcePath, _configurator2.default.path.target.base);else if (_helper2.default.isFileSync(sourcePath)) _helper2.default.copyFileSync(sourcePath, _configurator2.default.path.target.base);
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
            var testModuleFilePaths = _helper2.default.determineModuleLocations(_configurator2.default.testInBrowser.injection.internal, _configurator2.default.module.aliases, _configurator2.default.extensions, _configurator2.default.path.context, _configurator2.default.path.source.asset.base, _configurator2.default.path.ignore).filePaths;
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

//# sourceMappingURL=data:application/json;base64,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QSw4Q0FISjtBQUlKO0FBQ0E7QUFDQSxRQUFRLEdBQVIsQ0FBWSxlQUFaLEVBQTZCLEtBQTdCLENBQW1DLFVBQUMsS0FBRDtBQUFBLFdBQXNCLFFBQVEsSUFBUjtBQUNyRDtBQUNBLFVBQU0sVUFGK0MsQ0FBdEI7QUFBQSxDQUFuQztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoidGFza1J1bm5lci5jb21waWxlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbi8vIEBmbG93XG4vLyAtKi0gY29kaW5nOiB1dGYtOCAtKi1cbid1c2Ugc3RyaWN0J1xuLyogIVxuICAgIHJlZ2lvbiBoZWFkZXJcbiAgICBDb3B5cmlnaHQgVG9yYmVuIFNpY2tlcnQgKGluZm9bXCJ+YXR+XCJddG9yYmVuLndlYnNpdGUpIDE2LjEyLjIwMTJcblxuICAgIExpY2Vuc2VcbiAgICAtLS0tLS0tXG5cbiAgICBUaGlzIGxpYnJhcnkgd3JpdHRlbiBieSBUb3JiZW4gU2lja2VydCBzdGFuZCB1bmRlciBhIGNyZWF0aXZlIGNvbW1vbnMgbmFtaW5nXG4gICAgMy4wIHVucG9ydGVkIGxpY2Vuc2UuIHNlZSBodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS8zLjAvZGVlZC5kZVxuICAgIGVuZHJlZ2lvblxuKi9cbi8vIHJlZ2lvbiBpbXBvcnRzXG5pbXBvcnQge1xuICAgIENoaWxkUHJvY2VzcywgZXhlYyBhcyBleGVjQ2hpbGRQcm9jZXNzLCBzcGF3biBhcyBzcGF3bkNoaWxkUHJvY2Vzc1xufSBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0ICogYXMgZmlsZVN5c3RlbSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQge3N5bmMgYXMgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jfSBmcm9tICdyaW1yYWYnXG4vLyBOT1RFOiBPbmx5IG5lZWRlZCBmb3IgZGVidWdnaW5nIHRoaXMgZmlsZS5cbnRyeSB7XG4gICAgcmVxdWlyZSgnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJylcbn0gY2F0Y2ggKGVycm9yKSB7fVxuXG5pbXBvcnQgY29uZmlndXJhdGlvbiBmcm9tICcuL2NvbmZpZ3VyYXRvci5jb21waWxlZCdcbmltcG9ydCBIZWxwZXIgZnJvbSAnLi9oZWxwZXIuY29tcGlsZWQnXG5pbXBvcnQgdHlwZSB7XG4gICAgUGxhaW5PYmplY3QsIFByb21pc2VDYWxsYmFja0Z1bmN0aW9uLCBSZXNvbHZlZEJ1aWxkQ29uZmlndXJhdGlvblxufSBmcm9tICcuL3R5cGUnXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiBjb250cm9sbGVyXG5jb25zdCBjaGlsZFByb2Nlc3NPcHRpb25zOk9iamVjdCA9IHtcbiAgICBjd2Q6IGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgIGVudjogcHJvY2Vzcy5lbnYsXG4gICAgc2hlbGw6IHRydWUsXG4gICAgc3RkaW86ICdpbmhlcml0J1xufVxuY29uc3QgY2xvc2VFdmVudE5hbWVzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgJ2V4aXQnLCAnY2xvc2UnLCAndW5jYXVnaHRFeGNlcHRpb24nLCAnU0lHSU5UJywgJ1NJR1RFUk0nLCAnU0lHUVVJVCddXG5jb25zdCBjaGlsZFByb2Nlc3NlczpBcnJheTxDaGlsZFByb2Nlc3M+ID0gW11cbmNvbnN0IHByb2Nlc3NQcm9taXNlczpBcnJheTxQcm9taXNlPGFueT4+ID0gW11cbmNvbnN0IHBvc3NpYmxlQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSBbXG4gICAgJ2J1aWxkJywgJ2J1aWxkRExMJywgJ2NsZWFyJywgJ2RvY3VtZW50JywgJ2xpbnQnLCAncHJlaW5zdGFsbCcsICdzZXJ2ZScsXG4gICAgJ3Rlc3QnLCAndGVzdEluQnJvd3NlcicsICd0eXBlQ2hlY2snXVxuY29uc3QgY2xvc2VFdmVudEhhbmRsZXJzOkFycmF5PEZ1bmN0aW9uPiA9IFtdXG5pZiAoY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDIpIHtcbiAgICAvLyByZWdpb24gdGVtcG9yYXJ5IHNhdmUgZHluYW1pY2FsbHkgZ2l2ZW4gY29uZmlndXJhdGlvbnNcbiAgICAvLyBOT1RFOiBXZSBuZWVkIGEgY29weSBvZiBnaXZlbiBhcmd1bWVudHMgYXJyYXkuXG4gICAgbGV0IGR5bmFtaWNDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0ID0ge2dpdmVuQ29tbWFuZExpbmVBcmd1bWVudHM6XG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5zbGljZSgpfVxuICAgIGlmIChcbiAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzLmxlbmd0aCA+IDMgJiZcbiAgICAgICAgSGVscGVyLnBhcnNlRW5jb2RlZE9iamVjdChcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1tcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLCAnY29uZmlndXJhdGlvbicpXG4gICAgKVxuICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHMucG9wKClcbiAgICBsZXQgY291bnQ6bnVtYmVyID0gMFxuICAgIGxldCBmaWxlUGF0aDpzdHJpbmcgPSBgJHtjb25maWd1cmF0aW9uLnBhdGguY29udGV4dH0uYCArXG4gICAgICAgIGBkeW5hbWljQ29uZmlndXJhdGlvbi0ke2NvdW50fS5qc29uYFxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGZpbGVQYXRoID0gYCR7Y29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHR9LmR5bmFtaWNDb25maWd1cmF0aW9uLWAgK1xuICAgICAgICAgICAgYCR7Y291bnR9Lmpzb25gXG4gICAgICAgIGlmICghSGVscGVyLmlzRmlsZVN5bmMoZmlsZVBhdGgpKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgY291bnQgKz0gMVxuICAgIH1cbiAgICBmaWxlU3lzdGVtLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIEpTT04uc3RyaW5naWZ5KGR5bmFtaWNDb25maWd1cmF0aW9uKSlcbiAgICBjb25zdCBhZGRpdGlvbmFsQXJndW1lbnRzOkFycmF5PHN0cmluZz4gPSBwcm9jZXNzLmFyZ3Yuc3BsaWNlKDMpXG4gICAgLy8gLyByZWdpb24gcmVnaXN0ZXIgZXhpdCBoYW5kbGVyIHRvIHRpZHkgdXBcbiAgICBjbG9zZUV2ZW50SGFuZGxlcnMucHVzaChmdW5jdGlvbihlcnJvcjo/RXJyb3IpOj9FcnJvciB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaWxlU3lzdGVtLnVubGlua1N5bmMoZmlsZVBhdGgpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICB0aHJvdyBlcnJvclxuICAgICAgICByZXR1cm4gZXJyb3JcbiAgICB9KVxuICAgIC8vIC8gZW5kcmVnaW9uXG4gICAgLy8gZW5kcmVnaW9uXG4gICAgLy8gcmVnaW9uIGhhbmRsZSBjbGVhclxuICAgIC8qXG4gICAgICAgIE5PVEU6IEEgYnVpbGQsc2VydmUgb3IgdGVzdCBpbiBicm93c2VyIGNvdWxkIGRlcGVuZCBvbiBwcmV2aW91c2x5XG4gICAgICAgIGNyZWF0ZWQgZGxsIHBhY2thZ2VzIHNvIGEgY2xlYW4gc2hvdWxkIG5vdCBiZSBwZXJmb3JtZWQgaW4gdGhhdCBjYXNlLlxuICAgICAgICBOT1RFOiBJZiB3ZSBoYXZlIGRlcGVuZGVuY3kgY3ljbGUgaXQgbmVlZGVkIHRvIHByZXNlcnZlIGZpbGVzIGR1cmluZ1xuICAgICAgICBwcmVpbnN0YWxsIHBoYXNlLlxuICAgICovXG4gICAgaWYgKCFbJ2J1aWxkJywgJ3ByZWluc3RhbGwnLCAnc2VydmUnLCAndGVzdCcsICd0ZXN0SW5Ccm93c2VyJ10uaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkgJiYgcG9zc2libGVBcmd1bWVudHMuaW5jbHVkZXMoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICkpIHtcbiAgICAgICAgaWYgKHBhdGgucmVzb2x2ZShjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UpID09PSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dFxuICAgICAgICApKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmVzIGFsbCBjb21waWxlZCBmaWxlcy5cbiAgICAgICAgICAgIEhlbHBlci53YWxrRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwgKFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDpzdHJpbmcsIHN0YXQ6T2JqZWN0XG4gICAgICAgICAgICAgICAgKTo/Ym9vbGVhbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNGaWxlUGF0aEluTG9jYXRpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aCwgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5sb2FkZXIuZGlyZWN0b3J5TmFtZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICkubWFwKChmaWxlUGF0aDpzdHJpbmcpOnN0cmluZyA9PiBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgKS5maWx0ZXIoKGZpbGVQYXRoOnN0cmluZyk6Ym9vbGVhbiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjb25maWd1cmF0aW9uLnBhdGguY29udGV4dC5zdGFydHNXaXRoKGZpbGVQYXRoKSlcbiAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHR5cGU6c3RyaW5nIGluIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3IFJlZ0V4cChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW3R5cGVdLmZpbGVQYXRoUGF0dGVyblxuICAgICAgICAgICAgICAgICAgICAgICAgKS50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKGZpbGVQYXRoLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iOiBmYWxzZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnVubGlua1N5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgZmlsZVN5c3RlbS5yZWFkZGlyU3luYyhjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UpLmZvckVhY2goKFxuICAgICAgICAgICAgICAgIGZpbGVOYW1lOnN0cmluZ1xuICAgICAgICAgICAgKTp2b2lkID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lLmxlbmd0aCA+ICcuZGxsLW1hbmlmZXN0Lmpzb24nLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICBmaWxlTmFtZS5lbmRzV2l0aCgnLmRsbC1tYW5pZmVzdC5qc29uJykgfHxcbiAgICAgICAgICAgICAgICAgICAgZmlsZU5hbWUuc3RhcnRzV2l0aCgnbnBtLWRlYnVnJylcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW0udW5saW5rU3luYyhwYXRoLnJlc29sdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGgudGFyZ2V0LmJhc2UsIGZpbGVOYW1lKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgcmVtb3ZlRGlyZWN0b3J5UmVjdXJzaXZlbHlTeW5jKGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSwge1xuICAgICAgICAgICAgICAgIGdsb2I6IGZhbHNlfSlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlbW92ZURpcmVjdG9yeVJlY3Vyc2l2ZWx5U3luYyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguYXBpRG9jdW1lbnRhdGlvbiwge2dsb2I6IGZhbHNlfSlcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBoYW5kbGUgYnVpbGRcbiAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb25zOlJlc29sdmVkQnVpbGRDb25maWd1cmF0aW9uID1cbiAgICAgICAgSGVscGVyLnJlc29sdmVCdWlsZENvbmZpZ3VyYXRpb25GaWxlUGF0aHMoXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzLCBjb25maWd1cmF0aW9uLnBhdGguc291cmNlLmFzc2V0LmJhc2UsXG4gICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguaWdub3JlLmNvbmNhdChcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLm1vZHVsZS5kaXJlY3RvcnlOYW1lcyxcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmxvYWRlci5kaXJlY3RvcnlOYW1lc1xuICAgICAgICAgICAgKS5tYXAoKGZpbGVQYXRoOnN0cmluZyk6c3RyaW5nID0+IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLnBhdGguY29udGV4dCwgZmlsZVBhdGgpXG4gICAgICAgICAgICApLmZpbHRlcigoZmlsZVBhdGg6c3RyaW5nKTpib29sZWFuID0+XG4gICAgICAgICAgICAgICAgIWNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LnN0YXJ0c1dpdGgoZmlsZVBhdGgpKSlcbiAgICBpZiAoWydidWlsZCcsICdidWlsZERMTCcsICdkb2N1bWVudCcsICd0ZXN0J10uaW5jbHVkZXMocHJvY2Vzcy5hcmd2WzJdKSkge1xuICAgICAgICBsZXQgdGlkaWVkVXA6Ym9vbGVhbiA9IGZhbHNlXG4gICAgICAgIGNvbnN0IHRpZHlVcDpGdW5jdGlvbiA9ICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBEZXRlcm1pbmVzIGFsbCBub25lIGphdmFTY3JpcHQgZW50aXRpZXMgd2hpY2ggaGF2ZSBiZWVuIGVtaXR0ZWRcbiAgICAgICAgICAgICAgICBhcyBzaW5nbGUgamF2YVNjcmlwdCBtb2R1bGUgdG8gcmVtb3ZlLlxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmICh0aWRpZWRVcClcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIHRpZGllZFVwID0gdHJ1ZVxuICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICBjb25zdCBjaHVua05hbWU6c3RyaW5nIGluXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5pbmplY3Rpb24uaW50ZXJuYWwubm9ybWFsaXplZFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkLmhhc093blByb3BlcnR5KFxuICAgICAgICAgICAgICAgICAgICBjaHVua05hbWVcbiAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICBmb3IgKFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kdWxlSUQ6c3RyaW5nIG9mXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmluamVjdGlvbi5pbnRlcm5hbC5ub3JtYWxpemVkW2NodW5rTmFtZV1cbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlOj9zdHJpbmcgPSBIZWxwZXIuZGV0ZXJtaW5lQXNzZXRUeXBlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5kZXRlcm1pbmVNb2R1bGVGaWxlUGF0aChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlSUQsIGNvbmZpZ3VyYXRpb24ubW9kdWxlLmFsaWFzZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZXh0ZW5zaW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmNvbnRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuZGlyZWN0b3J5TmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGFja2FnZS5tYWluLmZpbGVOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLm1haW4ucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5wYWNrYWdlLmFsaWFzUHJvcGVydHlOYW1lc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksIGNvbmZpZ3VyYXRpb24uYnVpbGQudHlwZXMsIGNvbmZpZ3VyYXRpb24ucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlUGF0aDpzdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIucmVuZGVyRmlsZVBhdGhUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5zdHJpcExvYWRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmNvbXBvc2UuamF2YVNjcmlwdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSwgeydbbmFtZV0nOiBjaHVua05hbWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLmJ1aWxkLnR5cGVzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXS5vdXRwdXRFeHRlbnNpb24gPT09ICdqcycgJiYgSGVscGVyLmlzRmlsZVN5bmMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVQYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbS5jaG1vZFN5bmMoZmlsZVBhdGgsICc3NTUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoOj9zdHJpbmcgb2YgY29uZmlndXJhdGlvbi5wYXRoLnRpZHlVcClcbiAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlU3lzdGVtLnVubGlua1N5bmMoZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgICAgICB9XG4gICAgICAgIGNsb3NlRXZlbnRIYW5kbGVycy5wdXNoKHRpZHlVcClcbiAgICAgICAgLypcbiAgICAgICAgICAgIFRyaWdnZXJzIGNvbXBsZXRlIGFzc2V0IGNvbXBpbGluZyBhbmQgYnVuZGxlcyB0aGVtIGludG8gdGhlIGZpbmFsXG4gICAgICAgICAgICBwcm9kdWN0aXZlIG91dHB1dC5cbiAgICAgICAgKi9cbiAgICAgICAgcHJvY2Vzc1Byb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgcmVzb2x2ZTpQcm9taXNlQ2FsbGJhY2tGdW5jdGlvbiwgcmVqZWN0OlByb21pc2VDYWxsYmFja0Z1bmN0aW9uXG4gICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb21tYW5kTGluZUFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmUuYnVpbGQuYXJndW1lbnRzIHx8IFtdXG4gICAgICAgICAgICApLmNvbmNhdChhZGRpdGlvbmFsQXJndW1lbnRzKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1J1bm5pbmcgXCInICsgKFxuICAgICAgICAgICAgICAgIGAke2NvbmZpZ3VyYXRpb24uY29tbWFuZExpbmUuYnVpbGQuY29tbWFuZH0gYCArXG4gICAgICAgICAgICAgICAgY29tbWFuZExpbmVBcmd1bWVudHMuam9pbignICcpXG4gICAgICAgICAgICApLnRyaW0oKSArICdcIicpXG4gICAgICAgICAgICBjb25zdCBjaGlsZFByb2Nlc3M6Q2hpbGRQcm9jZXNzID0gc3Bhd25DaGlsZFByb2Nlc3MoXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5jb21tYW5kTGluZS5idWlsZC5jb21tYW5kLCBjb21tYW5kTGluZUFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3NPcHRpb25zKVxuICAgICAgICAgICAgY29uc3QgY29weUFkZGl0aW9uYWxGaWxlc0FuZFRpZHlVcDpGdW5jdGlvbiA9ICgpOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgIGZvciAoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoOnN0cmluZyBvZlxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmF0aW9uLmZpbGVzLmFkZGl0aW9uYWxQYXRoc1xuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VQYXRoOnN0cmluZyA9IHBhdGguam9pbihcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYmFzZSwgZmlsZVBhdGgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChIZWxwZXIuaXNEaXJlY3RvcnlTeW5jKHNvdXJjZVBhdGgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgSGVscGVyLmNvcHlEaXJlY3RvcnlSZWN1cnNpdmVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVBhdGgsIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSlcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoSGVscGVyLmlzRmlsZVN5bmMoc291cmNlUGF0aCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBIZWxwZXIuY29weUZpbGVTeW5jKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVBhdGgsIGNvbmZpZ3VyYXRpb24ucGF0aC50YXJnZXQuYmFzZSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGlkeVVwKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudE5hbWU6c3RyaW5nIG9mIGNsb3NlRXZlbnROYW1lcylcbiAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Mub24oY2xvc2VFdmVudE5hbWUsIEhlbHBlci5nZXRQcm9jZXNzQ2xvc2VIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlLCByZWplY3QsIGNsb3NlRXZlbnROYW1lLCAoXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzLmFyZ3ZbMl0gPT09ICdidWlsZCdcbiAgICAgICAgICAgICAgICAgICAgKSA/IGNvcHlBZGRpdGlvbmFsRmlsZXNBbmRUaWR5VXAgOiB0aWR5VXApKVxuICAgICAgICAgICAgY2hpbGRQcm9jZXNzZXMucHVzaChjaGlsZFByb2Nlc3MpXG4gICAgICAgIH0pKVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBoYW5kbGUgcHJlaW5zdGFsbFxuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGNvbmZpZ3VyYXRpb24ubGlicmFyeSAmJlxuICAgICAgICBjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0gPT09ICdwcmVpbnN0YWxsJ1xuICAgICkge1xuICAgICAgICAvLyBQZXJmb3JtIGFsbCBmaWxlIHNwZWNpZmljIHByZXByb2Nlc3Npbmcgc3R1ZmYuXG4gICAgICAgIGNvbnN0IHRlc3RNb2R1bGVGaWxlUGF0aHM6QXJyYXk8c3RyaW5nPiA9XG4gICAgICAgICAgICBIZWxwZXIuZGV0ZXJtaW5lTW9kdWxlTG9jYXRpb25zKFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24udGVzdEluQnJvd3Nlci5pbmplY3Rpb24uaW50ZXJuYWwsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbi5tb2R1bGUuYWxpYXNlcywgY29uZmlndXJhdGlvbi5leHRlbnNpb25zLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5jb250ZXh0LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24ucGF0aC5zb3VyY2UuYXNzZXQuYmFzZSwgY29uZmlndXJhdGlvbi5wYXRoLmlnbm9yZVxuICAgICAgICAgICAgKS5maWxlUGF0aHNcbiAgICAgICAgZm9yIChjb25zdCBidWlsZENvbmZpZ3VyYXRpb24gb2YgYnVpbGRDb25maWd1cmF0aW9ucylcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGg6c3RyaW5nIG9mIGJ1aWxkQ29uZmlndXJhdGlvbi5maWxlUGF0aHMpXG4gICAgICAgICAgICAgICAgaWYgKCF0ZXN0TW9kdWxlRmlsZVBhdGhzLmluY2x1ZGVzKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldmFsdWF0aW9uRnVuY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWw6T2JqZWN0LCBzZWxmOlBsYWluT2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRDb25maWd1cmF0aW9uOlBsYWluT2JqZWN0LCBwYXRoOnR5cGVvZiBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbEFyZ3VtZW50czpBcnJheTxzdHJpbmc+LCBmaWxlUGF0aDpzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgKTpzdHJpbmcgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElnbm9yZVR5cGVDaGVja1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdnbG9iYWwnLCAnc2VsZicsICdidWlsZENvbmZpZ3VyYXRpb24nLCAncGF0aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZGl0aW9uYWxBcmd1bWVudHMnLCAnZmlsZVBhdGgnLCAncmV0dXJuIGAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWlsZENvbmZpZ3VyYXRpb25bXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0udHJpbSgpICsgJ2AnXG4gICAgICAgICAgICAgICAgICAgICAgICApKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbCwgc2VsZiwgYnVpbGRDb25maWd1cmF0aW9uLCBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxBcmd1bWVudHMsIGZpbGVQYXRoKVxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlOlByb21pc2VDYWxsYmFja0Z1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0OlByb21pc2VDYWxsYmFja0Z1bmN0aW9uXG4gICAgICAgICAgICAgICAgICAgICk6dm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tYW5kOnN0cmluZyA9IGV2YWx1YXRpb25GdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWwsIGNvbmZpZ3VyYXRpb24sIGJ1aWxkQ29uZmlndXJhdGlvbiwgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQXJndW1lbnRzLCBmaWxlUGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBSdW5uaW5nIFwiJHtjb21tYW5kfVwiYClcbiAgICAgICAgICAgICAgICAgICAgICAgIEhlbHBlci5oYW5kbGVDaGlsZFByb2Nlc3MoZXhlY0NoaWxkUHJvY2VzcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kLCBjaGlsZFByb2Nlc3NPcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlcnJvcjo/RXJyb3IpOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoJ2V4aXQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICB9XG4gICAgfVxuICAgIC8vIGVuZHJlZ2lvblxuICAgIC8vIHJlZ2lvbiBoYW5kbGUgcmVtYWluaW5nIHRhc2tzXG4gICAgY29uc3QgaGFuZGxlVGFzayA9ICh0eXBlOnN0cmluZyk6dm9pZCA9PiB7XG4gICAgICAgIGxldCB0YXNrczpBcnJheTxPYmplY3Q+XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZ3VyYXRpb24uY29tbWFuZExpbmVbdHlwZV0pKVxuICAgICAgICAgICAgdGFza3MgPSBjb25maWd1cmF0aW9uLmNvbW1hbmRMaW5lW3R5cGVdXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhc2tzID0gW2NvbmZpZ3VyYXRpb24uY29tbWFuZExpbmVbdHlwZV1dXG4gICAgICAgIGZvciAoY29uc3QgdGFzazpPYmplY3Qgb2YgdGFza3MpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2YWx1YXRpb25GdW5jdGlvbiA9IChcbiAgICAgICAgICAgICAgICBnbG9iYWw6T2JqZWN0LCBzZWxmOlBsYWluT2JqZWN0LCBwYXRoOnR5cGVvZiBwYXRoXG4gICAgICAgICAgICApOmJvb2xlYW4gPT5cbiAgICAgICAgICAgICAgICAvLyBJZ25vcmVUeXBlQ2hlY2tcbiAgICAgICAgICAgICAgICBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICdnbG9iYWwnLCAnc2VsZicsICdwYXRoJyxcbiAgICAgICAgICAgICAgICAgICAgJ3JldHVybiAnICsgKHRhc2suaGFzT3duUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5kaWNhdG9yJ1xuICAgICAgICAgICAgICAgICAgICApID8gdGFzay5pbmRpY2F0b3IgOiAndHJ1ZScpXG4gICAgICAgICAgICAgICAgKShnbG9iYWwsIHNlbGYsIHBhdGgpXG4gICAgICAgICAgICBpZiAoZXZhbHVhdGlvbkZ1bmN0aW9uKGdsb2JhbCwgY29uZmlndXJhdGlvbiwgcGF0aCkpXG4gICAgICAgICAgICAgICAgcHJvY2Vzc1Byb21pc2VzLnB1c2gobmV3IFByb21pc2UoKFxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlOlByb21pc2VDYWxsYmFja0Z1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICByZWplY3Q6UHJvbWlzZUNhbGxiYWNrRnVuY3Rpb25cbiAgICAgICAgICAgICAgICApOnZvaWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tYW5kTGluZUFyZ3VtZW50czpBcnJheTxzdHJpbmc+ID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5hcmd1bWVudHMgfHwgW11cbiAgICAgICAgICAgICAgICAgICAgKS5jb25jYXQoYWRkaXRpb25hbEFyZ3VtZW50cylcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1J1bm5pbmcgXCInICsgKFxuICAgICAgICAgICAgICAgICAgICAgICAgYCR7dGFzay5jb21tYW5kfSAke2NvbW1hbmRMaW5lQXJndW1lbnRzLmpvaW4oJyAnKX1gXG4gICAgICAgICAgICAgICAgICAgICkudHJpbSgpICsgJ1wiJylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRQcm9jZXNzOkNoaWxkUHJvY2VzcyA9IHNwYXduQ2hpbGRQcm9jZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay5jb21tYW5kLCBjb21tYW5kTGluZUFyZ3VtZW50cywgY2hpbGRQcm9jZXNzT3B0aW9uc1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY2xvc2VFdmVudE5hbWU6c3RyaW5nIG9mIGNsb3NlRXZlbnROYW1lcylcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkUHJvY2Vzcy5vbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZUV2ZW50TmFtZSwgSGVscGVyLmdldFByb2Nlc3NDbG9zZUhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUsIHJlamVjdCwgY2xvc2VFdmVudE5hbWUpKVxuICAgICAgICAgICAgICAgICAgICBjaGlsZFByb2Nlc3Nlcy5wdXNoKGNoaWxkUHJvY2VzcylcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyAvIHJlZ2lvbiBzeW5jaHJvbm91c1xuICAgIGlmIChbJ2RvY3VtZW50JywgJ3Rlc3QnXS5pbmNsdWRlcyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgKSlcbiAgICAgICAgUHJvbWlzZS5hbGwocHJvY2Vzc1Byb21pc2VzKS50aGVuKCgpOnZvaWQgPT4gaGFuZGxlVGFzayhcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSkpXG4gICAgLy8gLyBlbmRyZWdpb25cbiAgICAvLyAvIHJlZ2lvbiBhc3luY2hyb25vdXNcbiAgICBlbHNlIGlmIChbJ2xpbnQnLCAndGVzdEluQnJvd3NlcicsICd0eXBlQ2hlY2snLCAnc2VydmUnXS5pbmNsdWRlcyhcbiAgICAgICAgY29uZmlndXJhdGlvbi5naXZlbkNvbW1hbmRMaW5lQXJndW1lbnRzWzJdXG4gICAgKSlcbiAgICAgICAgaGFuZGxlVGFzayhjb25maWd1cmF0aW9uLmdpdmVuQ29tbWFuZExpbmVBcmd1bWVudHNbMl0pXG4gICAgLy8gLyBlbmRyZWdpb25cbiAgICAvLyBlbmRyZWdpb25cbn1cbmxldCBmaW5pc2hlZDpib29sZWFuID0gZmFsc2VcbmNvbnN0IGNsb3NlSGFuZGxlciA9IGZ1bmN0aW9uKCk6dm9pZCB7XG4gICAgaWYgKCFmaW5pc2hlZClcbiAgICAgICAgZm9yIChjb25zdCBjbG9zZUV2ZW50SGFuZGxlcjpGdW5jdGlvbiBvZiBjbG9zZUV2ZW50SGFuZGxlcnMpXG4gICAgICAgICAgICBjbG9zZUV2ZW50SGFuZGxlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgZmluaXNoZWQgPSB0cnVlXG59XG5mb3IgKGNvbnN0IGNsb3NlRXZlbnROYW1lOnN0cmluZyBvZiBjbG9zZUV2ZW50TmFtZXMpXG4gICAgcHJvY2Vzcy5vbihjbG9zZUV2ZW50TmFtZSwgY2xvc2VIYW5kbGVyKVxuLy8gSWdub3JlVHlwZUNoZWNrXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUgJiYgKFxuICAgIGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50cy5sZW5ndGggPCAzIHx8XG4gICAgIXBvc3NpYmxlQXJndW1lbnRzLmluY2x1ZGVzKGNvbmZpZ3VyYXRpb24uZ2l2ZW5Db21tYW5kTGluZUFyZ3VtZW50c1syXSlcbikpXG4gICAgY29uc29sZS5sb2coXG4gICAgICAgIGBHaXZlIG9uZSBvZiBcIiR7cG9zc2libGVBcmd1bWVudHMuam9pbignXCIsIFwiJyl9XCIgYXMgY29tbWFuZCBsaW5lIGAgK1xuICAgICAgICAnYXJndW1lbnQuIFlvdSBjYW4gcHJvdmlkZSBhIGpzb24gc3RyaW5nIGFzIHNlY29uZCBwYXJhbWV0ZXIgdG8gJyArXG4gICAgICAgICdkeW5hbWljYWxseSBvdmVyd3JpdGUgc29tZSBjb25maWd1cmF0aW9ucy5cXG4nKVxuLy8gZW5kcmVnaW9uXG4vLyByZWdpb24gZm9yd2FyZCBuZXN0ZWQgcmV0dXJuIGNvZGVzXG5Qcm9taXNlLmFsbChwcm9jZXNzUHJvbWlzZXMpLmNhdGNoKChlcnJvcjpFcnJvcik6dm9pZCA9PiBwcm9jZXNzLmV4aXQoXG4gICAgLy8gSWdub3JlVHlwZUNoZWNrXG4gICAgZXJyb3IucmV0dXJuQ29kZSkpXG4vLyBlbmRyZWdpb25cbi8vIHJlZ2lvbiB2aW0gbW9kbGluZVxuLy8gdmltOiBzZXQgdGFic3RvcD00IHNoaWZ0d2lkdGg9NCBleHBhbmR0YWI6XG4vLyB2aW06IGZvbGRtZXRob2Q9bWFya2VyIGZvbGRtYXJrZXI9cmVnaW9uLGVuZHJlZ2lvbjpcbi8vIGVuZHJlZ2lvblxuIl19