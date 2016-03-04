#!/usr/bin/env node
// -*- coding: utf-8 -*-

'use strict'

// region imports
const run = require('child_process').exec
const fileSystem = require('fs')
const path = require('path')
const packageConfiguration = require('../../package.json').webOptimizer || {}
// endregion

const processOptions = {cwd: path.resolve(__dirname + '/../..')}
if(!packageConfiguration.targetPath)
    packageConfiguration.targetPath = 'build'
if(!packageConfiguration.commandLineArguments)
    packageConfiguration.commandLineArguments = {}
if(!packageConfiguration.commandLineArguments.webpack)
    packageConfiguration.commandLineArguments.webpack = ''
if(!packageConfiguration.commandLineArguments.webpackDevServer)
    packageConfiguration.commandLineArguments.webpackDevServer = ''

let process = null
if(global.process.argv[2] === 'clear')
    process = run(
        `rm ${packageConfiguration.targetPath} --recursive --force`,
        processOptions)
else if(global.process.argv[2] === 'build')
    process = run(
        `webpack --config ${__dirname}/webpack.config.js` +
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
    process = run(
        `webpack-dev-server --config ${__dirname}/webpack.config.js ` +
        packageConfiguration.commandLineArguments.webpackDevServer,
        processOptions)
else
    console.log(
        'Give one of "clear", "build" or "server" command line argument.')

process.stdout.on('data', (data) => {
    console.log(`Standart output: ${data}`)
})
process.stderr.on('data', (data) => { console.error(`Error ourput: ${data}`) })
process.on('close', (returnCode) => {
    if(returnCode !== 0)
        console.error(`Task exited with error code ${returnCode}`)
})

// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
