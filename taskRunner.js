#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'

// region imports
import configuration from './configurator.compiled'
import {exec as run} from 'child_process'
import extend from 'extend'
import * as fileSystem from 'fs'
import path from 'path'
fileSystem.removeDirectoryRecursivelySync = require('rimraf').sync
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
// endregion
// region helper functions
path.walkDirectoryRecursivelySync = (directoryPath, callback = (
    /* filePath, stat */
) => {}) => {
    fileSystem.readdirSync(directoryPath).forEach(fileName => {
        const filePath = path.resolve(directoryPath, fileName)
        const stat = fileSystem.statSync(filePath)
        if (callback(filePath, stat) !== false && stat && stat.isDirectory())
            path.walkDirectoryRecursivelySync(filePath, callback)
    })
}
// endregion
// region controller
const childProcessOptions = {cwd: path.resolve(__dirname, '../..')}
let childProcess = null
if (global.process.argv.length > 2) {
    if (global.process.argv[2] === 'clear') {
        if (path.resolve(configuration.path.target) === path.resolve(
            __dirname, '../../'
        ))
            path.walkDirectoryRecursivelySync(configuration.path.target, (
                filePath, stat
            ) => {
                for (let pathToIgnore of configuration.path.ignore)
                    if (filePath.startsWith(path.resolve(
                        __dirname, '../../', pathToIgnore
                    )))
                        return false
                if (stat.isFile() && path.extname(path.basename(
                    filePath, path.extname(filePath)
                )) === '.compiled')
                    fileSystem.unlink(filePath)
            })
        else
            fileSystem.removeDirectoryRecursivelySync(
                configuration.path.target, {glob: false})
        process.exit()
    }
    let additionalArguments = global.process.argv.splice(3).join(' ')
    if (configuration.library) {
        if (['preinstall', 'build'].indexOf(global.process.argv[2]) !== -1) {
            let buildConfigurations = []
            let index = 0
            global.Object.keys(configuration.build).forEach(extension => {
                buildConfigurations.push(extend(
                    true, {filePaths: []}, configuration.build.default,
                    configuration.build[extension]))
                path.walkDirectoryRecursivelySync(path.join(
                    configuration.path.asset.source,
                    configuration.path.asset.javaScript
                ), (filePath, stat) => {
                    if (stat.isFile() && path.extname(filePath).substring(
                        1
                    ) === extension) {
                        for (let pathToIgnore of configuration.path.ignore)
                            if (filePath.startsWith(path.resolve(
                                __dirname, '../../', pathToIgnore
                            )))
                                return false
                        buildConfigurations[index].filePaths.push(filePath)
                    }
                })
                index += 1
            })
            /*
                NOTE: We have to loop twice since generated files from further
                loops shouldn't be taken into account in later loops.
            */
            for (let buildConfiguration of buildConfigurations)
                for (let filePath of buildConfiguration.filePaths)
                    childProcess = run(new global.Function(
                        'global', 'self', 'webOptimizerPath',
                        'currentPath', 'path', 'additionalArguments',
                        'filePath', 'return `' +
                        `${buildConfiguration[global.process.argv[2]]}\``
                    )(global, configuration, __dirname, global.process.cwd(
                    ), path, additionalArguments, filePath),
                    childProcessOptions)
        }
    } else
        if (global.process.argv[2] === 'build')
            childProcess = run(
                `${configuration.commandLine.build} ${additionalArguments}`,
                childProcessOptions, error => {
                    if (!error) {
                        let manifestFilePath = path.join(
                            configuration.path.target, path.basename(
                                configuration.path.manifest, '.appcache'
                            ) + '.html')
                        fileSystem.access(
                            manifestFilePath, fileSystem.F_OK, error => {
                                if (!error)
                                    fileSystem.unlink(manifestFilePath)
                            })
                    }
                })
        else if (global.process.argv[2] === 'serve')
            childProcess = run(
                `${configuration.commandLine.serve} ${additionalArguments}`,
                childProcessOptions)
    if (global.process.argv[2] === 'lint')
        childProcess = run(
            `${configuration.commandLine.lint} ${additionalArguments}`,
            childProcessOptions)
    else if (global.process.argv[2] === 'test')
        childProcess = run(
            `${configuration.commandLine.test} ${additionalArguments}`,
            childProcessOptions)
}
if (childProcess === null) {
    if (configuration.library)
        console.log(
            'Give one of "build", "clear", "lint", "test" or "preinstall" as' +
            ' command line argument.\n')
    else
        console.log(
            'Give one of "build", "clear", "lint", "serve", "test" or ' +
            '"preinstall" as command line argument.\n')
    process.exit()
}
// endregion
// region handle child process communication
childProcess.stdout.on('data', data => {
    process.stdout.write(data)
})
childProcess.stderr.on('data', data => {
    process.stderr.write(data)
})
childProcess.on('close', returnCode => {
    if (returnCode !== 0)
        console.error(`Task exited with error code ${returnCode}`)
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
