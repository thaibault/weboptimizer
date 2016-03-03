#!/usr/bin/env node

const run = require('child_process').exec
const fileSystem = require('fs')
const path = require('path')
const targetPath = path.normalize(__dirname + '/../../' + (require(
    '../../package.json'
).targetPath || 'build'))

const resultHandler = (errorCode, standardOutput, errorOutput) => {
    if(errorCode !== 0 && errorCode !== null)
        console.log('Operation failed (return code ' + errorCode + ')')
    if(errorOutput)
        console.error(errorOutput)
    if(standardOutput)
        console.log(standardOutput)
}

if(global.process.argv[2] === 'clear')
    run('rm ' + targetPath + ' --recursive --force', resultHandler)
else if(global.process.argv[2] === 'build') {
    run('webpack --config ' + __dirname + '/webpack.config.js', (
        errorCode
    ) => {
        if(errorCode === 0 || errorCode === null)
            fileSystem.access(
                targetPath + '/manifest.html', fileSystem.F_OK, (error) => {
                    if(!error)
                        fileSystem.unlink(targetPath + '/manifest.html')
                })
        resultHandler.apply(this, arguments)
    })
} else if(global.process.argv[2] === 'server')
    run('webpack-dev-server --open --inline', resultHandler)
else
    global.console.log(
        'Give one of "clear", "build" or "server" command line argument.')

// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
