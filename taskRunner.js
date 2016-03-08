#!/usr/bin/env node
// -*- coding: utf-8 -*-
'use strict'
// TODO convert to es2015
// region imports
import {exec as run} from 'child_process'
import extend from 'extend'
import * as fileSystem from 'fs'
fileSystem.removeDirectoryRecursivelySync = require('rimraf').sync
import path from 'path'
const defaultConfiguration = require('defaultConfiguration.json')
const packageConfiguration = require('../../package.json').webOptimizer || {}
// endregion
// region configuration
const processOptions = {cwd: path.resolve(__dirname + '/../..')}
configuration = extend(true, defaultConfiguration, packageConfiguration)
if(!packageConfiguration.targetPath)
    packageConfiguration.targetPath = 'build'
if(!packageConfiguration.targetPath)
    packageConfiguration.targetPath = 'build'
if(!packageConfiguration.commandLineArguments)
    packageConfiguration.commandLineArguments = {}
if(!packageConfiguration.commandLineArguments.webpack)
    packageConfiguration.commandLineArguments.webpack = ''
if(!packageConfiguration.commandLineArguments.webpackDevServer)
    packageConfiguration.commandLineArguments.webpackDevServer = ''
// endregion
// region controller
let childProcess = null
if(global.process.argv[2] === 'clear') {
    fileSystem.removeDirectoryRecursivelySync(
        packageConfiguration.targetPath, {glob: false})
    process.exit()
}
if(global.process.argv[2] === 'build')
    childProcess = run(
        `webpack --config ${__dirname}/webpackConfiguration.compiled.js ` +
        packageConfiguration.commandLineArguments.webpack, processOptions, (
            error
        ) => {
            if(!error)
                fileSystem.access(
                    `${packageConfiguration.targetPath}/manifest.html`,
                    fileSystem.F_OK, (error) => {
                        if(!error)
                            fileSystem.unlink(
                                packageConfiguration.targetPath +
                                '/manifest.html')
                    })
    })
else if(global.process.argv[2] === 'server')
    childProcess = run(
        'webpack-dev-server --config ' +
        `${__dirname}/webpackConfiguration.compiled.js ` +
        packageConfiguration.commandLineArguments.webpackDevServer,
        processOptions)
else if(global.process.argv[2] === 'lint')
    childProcess = run(
        `eslint --config ${__dirname}/eslintConfiguration.json ` +
        packageConfiguration.commandLineArguments.eslint + ' ',
        processOptions)
else {
    console.log(
        'Give one of "clear", "build", "lint" or "server" as command line ' +
        'argument.')
    process.exit()
}
// endregion
// region handle child process communication
childProcess.stdout.on('data', (data) => { process.stdout.write(data) })
childProcess.stderr.on('data', (data) => { process.stderr.write(data) })
childProcess.on('close', (returnCode) => {
    if(returnCode !== 0)
        console.error(`Task exited with error code ${returnCode}`)
})
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
