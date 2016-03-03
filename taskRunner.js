#!/usr/bin/env node

const run = require('child_process').exec

const resultHandler = function(errorCode, standardOutput, errorOutput) {
    if(errorCode !== 0 && errorCode !== null)
        console.log('Operation failed (return code ' + returnCode + ')')
    console.error(errorOutput)
    console.log(standardOutput)
}

if(global.process.argv[2] === 'clear')
    run('rm build --recursive --force', resultHandler)
else if(global.process.argv[2] === 'build')
    run('webpack --config ' + __dirname + '/webpack.config.js', resultHandler)
    /* TODO
    if 'build/manifest.html'
        rm 'build/manifest.html'
    */
else if(global.process.argv[2] === 'server')
    run('webpack-dev-server --open --inline', resultHandler)
else
    global.console.log(
        'Give one of "clear", "build" or "server" command line argument.')

// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
