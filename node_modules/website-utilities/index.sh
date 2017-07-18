#!/usr/bin/env bash
# -*- coding: utf-8 -*-
# region header
# Copyright Torben Sickert 16.12.2012

# License
#    This library written by Torben Sickert stand under a creative commons
#    naming 3.0 unported license.
#    see http://creativecommons.org/licenses/by/3.0/deed.de
# endregion
exit 0
# TODO implement in js.
set -o errexit
if [[ $(git branch | grep '* master') ]]; then
    echo 'Build new web page.'
    npm run build
    if [[ $(git branch | grep 'gh-pages') ]]; then
        echo 'Checkout distribution branch.'
        git checkout gh-pages
        source='build/'
    else
        source="../$(basename "$(pwd)")/build/"
        pushd "../$(ls ../ | grep '.github.io')"
    fi
    echo 'Update page data.'
    rsync "$source" ./ $ILU_RSYNC_DEFAULT_ARGUMENTS --exclude='.*' \
        --exclude='node_modules' --exclude="$source" --exclude='CNAME' \
        --exclude='readme.md'
    rm --recursive --force "$source"
    echo 'Upload compiled webpage'
    git pull
    git add --all
    git commit --message 'Automatic page build update.'
    git push
    if [[ $(git branch | grep 'gh-pages') ]]; then
        echo 'Switch back to master branch.'
        git checkout master
    else
        echo 'Switch back to source directory.'
        popd
    fi
fi
set +o errexit
# region vim modline
# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:
# endregion
