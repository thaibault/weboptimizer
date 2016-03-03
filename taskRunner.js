#!/usr/bin/env node

const spawnProcess = require('child_process').spawnSync;

if(global.process.argv[2] === 'clear')
    spawnProcess('rm', ['build', '--recursive', '--force'])
else if(global.process.argv[2] === 'build')
    spawnProcess('webpack')
    /* TODO
    if 'build/manifest.html'
        rm 'build/manifest.html'
    */
else if(global.process.argv[2] === 'server')
    spawnProcess('webpack-dev-server', ['--open', '--inline'])
else
    global.console.log(
        'Give one of "clear", "build" or "server" command line argument.')

// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
