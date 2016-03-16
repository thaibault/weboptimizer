#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'

// region imports
import configuration from './configurator.compiled'
import {exec as run} from 'child_process'
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
const childProcessOptions = {cwd: path.resolve(`${__dirname}/../..`)}
let childProcess = null
if (global.process.argv.length > 2) {
    if (global.process.argv[2] === 'clear') {
        // TODO check if target is root!
        fileSystem.removeDirectoryRecursivelySync(configuration.path.target, {
            glob: false})
        process.exit()
    }
    let additionalArguments = global.process.argv.splice(3).join(' ')
    if (configuration.library)
        if (['preinstall', 'build'].indexOf(global.process.argv[2]) !== -1) {
            let filePaths = []
            path.walkDirectoryRecursivelySync(
                configuration.path.asset.javaScript, filePath => {
                    for (let pathToIgnore of configuration.path.ignore)
                        if (filePath.startsWith(path.resolve(
                            `${__dirname}/../../`, pathToIgnore
                        )))
                            return
                    console.log(filePath)
                    filePaths.push(filePath)
                })
            // TODO with filePaths
            if (false)
                if (global.process.argv[2] === 'preinstall')
                    childProcess = run(
                        `touch ${filePaths.join(' ')}` + additionalArguments,
                        childProcessOptions)
                else if (global.process.argv[2] === 'build')
                    childProcess = run(
                        "arguments='--presets es2015 --source-maps inline --out-file' && babel index.js $arguments index.compiled.js")
        }
    else {
        if (global.process.argv[2] === 'build')
            childProcess = run(
                `webpack ${configuration.commandLineArguments.webpack} ` +
                additionalArguments, childProcessOptions, error => {
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
                'webpack-dev-server ' +
                `${configuration.commandLineArguments.webpackDevServer} ` +
                additionalArguments, childProcessOptions)
    }
    if (global.process.argv[2] === 'lint')
        childProcess = run(
            `eslint ${configuration.commandLineArguments.eslint} ` +
            additionalArguments, childProcessOptions)
    else if (global.process.argv[2] === 'test')
        childProcess = run(
            'webpack-dev-server ' +
            `${configuration.commandLineArguments.webpackDevServerTest} ` +
            additionalArguments, childProcessOptions)
}
if (childProcess === null) {
    if (configuration.library)
        console.log(
            'Give one of "build", "clear", "lint", "serve", "test" or ' +
            '"preinstall" as command line argument.\n')
    else
        console.log(
            'Give one of "build", "clear", "lint", "test" or "preinstall" as' +
            ' command line argument.\n')
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
