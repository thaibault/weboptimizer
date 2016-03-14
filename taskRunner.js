#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'

// region imports
import * as configuration from './configurator.compiled'
import {exec as run} from 'child_process'
import * as fileSystem from 'fs'
import path from 'path'
fileSystem.removeDirectoryRecursivelySync = require('rimraf').sync
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
// endregion
// region controller
const childProcessOptions = {cwd: path.resolve(`${__dirname}/../..`)}
let childProcess = null
if (global.process.argv.length > 2) {
    if (global.process.argv[2] === 'clear') {
        fileSystem.removeDirectoryRecursivelySync(configuration.path.target, {
            glob: false})
        process.exit()
    }
    let additionalArguments = global.process.argv.splice(3).join(' ')
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
    else if (global.process.argv[2] === 'server')
        childProcess = run(
            'webpack-dev-server ' +
            `${configuration.commandLineArguments.webpackDevServer} ` +
            additionalArguments, childProcessOptions)
    else if (global.process.argv[2] === 'lint')
        childProcess = run(
            `eslint ${configuration.commandLineArguments.eslint} ` +
            additionalArguments, childProcessOptions)
}
if (childProcess === null) {
    console.log(
        'Give one of "clear", "build", "lint" or "server" as command line ' +
        'argument.')
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
