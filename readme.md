<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*- -->

<!-- region header
Copyright Torben Sickert 16.12.2012

License
-------

This library written by Torben Sickert stand under a creative commons naming
3.0 unported license. see http://creativecommons.org/licenses/by/3.0/deed.de
endregion -->

Use case
--------

The main goal of This plugin is providing an generic module bundler and
workflow for all you development use cases in any project related to the web
or node.

Content
-------

<!--Place for automatic generated table of contents.-->
[TOC]

Features
--------

- Complete and flexible configured Wrapper for **webpack** with many automatically
  determined pre configuration.
- **Completely** adaptable for your needs.
- Targets **library** and **web** bundle building out of the box.
- Only one configuration file (your already existing **package.json**) for all
  needed customisations.
- Many needed uses-cases are **preconfigured** and mostly works out of the box for
  your project.
    - **API-Documentation** generation
    - Image **sprite** handling. Combine your images and never create sprites by
      hand again.
    - Polymorphic **testing** on dom in browsers and/or in node through
      weboptimizer/browserAPI
    - **Linting** and **TypeChecking** with Flow
    - Preconfigured **preprocessing** for CSS (PostCSS), JavaScript (Babel, Flow)
    - Preconfigured **postprocessing** for CSS (Minification),
      JavaScript (Minification), Images (Compression)
    - Various pre configured and adaptable implemented concepts for building
      development-, production-, testing- and/or vendor **bundles**.
    - Support for building **libraries** with well defined (UMD) external
      dependencies (preconfigred extendable weback configuration)
    - Support for building and **shimming** a whole package managed application
      structure to build for various target environments like browsers or node
      (preconfigred extensable weback configuration)
    - Generic management for dealing with **DLL-Bundle** to speed up any
      workflows: Each (pre-)defined chunk can be outsourced to a DLL-Bundle in
      a complete delclarative and generic way.
    - Generic support for all known **favicon** types using only one png file as
      source (watching, compressing and auto-generating is integrated)
    - Brings **offline** support though service worker and/or html5 manifest to
      your application without any manual intervention needed!
    - Many development helper:
        - Automatic watching and (re-)building any assets thorugh cross
          platform file watching
        - Preconfigured local webserver with websocket connections to
          **livereload** you browser when any asset has changed
          (webpack-dev-server).
        - Preconfigured **hot module replacement** integration to update parts
          of your library/application with no siteeffects in a generic way
          without event the need to refresh your browser
        - Automaticaly watch and integrate any **css updates** trough hot module
          replacements in app which will be shiped through the development
          server.

Installation
------------

Edit your **package.json** to add **one** dependency:

    #!JSON

    ...
    "dependencies": {
        ...
        "weboptimizer": "latest",
        ...
    },
    ...

Update your **packages** via npm and have fun:

    npm update

Configuration
-------------

First you should specify some tasks/use-cases you want to have in you project.
You can do this in your package.json. All supported scripts and some usefull
compostitions are listed below:

    #!JSON

    ...
    "scripts": {
        ...
        "build": "webOptimizer build",
        "buildDLL": "webOptimizer buildDLL",
        "buildDebugWithDLL": "webOptimizer buildDLL -debug && webOptimizer build -debug",
        "buildWithStats": "webOptimizer build --profile --json >/tmp/stat.json && echo 'Results successfully written to \"/tmp/stat.json\".'",
        "clear": "webOptimizer clear",
        "document": "webOptimizer document",
        "lint": "webOptimizer typeCheck && webOptimizer lint",
        "postinstall": "webOptimizer build",
        "preinstall": "webOptimizer preinstall",
        "serve": "webOptimizer serve",
        "start": "npm run serve",
        "test": "webOptimizer test",
        "testInBrowser": "webOptimizer testInBrowser",
        "watch": "webOptimizer build --watch",
        "watchDLL": "webOptimizer buildDLL --watch"
        ...
    },
    ...

You can easily run any specified script via npm's command lint interface:

    #!bash

    npm run build -debug
    npm run lint
    npm run watch -debug
    npm run serve
    ...

If you want to configure your app for example to change any of the expected
default source, target, asset or build paths do it in your **package.json**:

    #!JSON

    ...
    "webOptimizer": {
        ...
        "path": {
            ...
            "apiDocumentation": "apiDocumentation/",
            "source": {
                ...
                "asset": {
                    ...
                    "cascadingStyleSheet": "cascadingStyleSheet/",
                    "data": "data/",
                    "favicon": "favicon.png",
                    "font": "font/",
                    "image": "image/",
                    "javaScript": "javaScript/",
                    "publicTarget": "",
                    "template": "template/"
                    ..
                },
                ...
            },
            "ignore": ["node_modules", ".git"],
            "manifest": "manifest.appcache",
            "target": {
                ...
                "base": "build/",
                ...
            },
            "tidyUp": ["crap"],
            ...
        },
        ...
    },
    ...

It's recommended to first specify if you're writing a library (preserve
external dependencies note managed within current project) or an application
(everything should be bundled including external libraries) since many
preconfigurations are targeting on this two different use cases. Anyway you can
customize each coonfiguration by hand in each case.

    #!JSON

    ...
    "webOptimizer": {
        ...
        "library": false,
        ...
    },
    ...

You can even reference any value or evaluate any configuration value
dynamically though a small evaluation mechanism:


    #!JSON

    ...
    "webOptimizer": {
        ...
        "path": {
            ...
            "source": {
                ...
                "base": "/",
                "asset": {
                    ...
                    "cascadingStyleSheet": "cascadingStyleSheet/",
                    "template": {
                        "__evaluate__": "self.debug ? '' : self.path.source.base"
                    },
                    ...
                },
                ...
            },
            ...
        },
        ...
        "offline": {
            ...
            "externals": [
                ...
                {"__evaluate__": "self.path.source.asset.cascadingStyleSheet"},
                "onlineAvailable.txt",
                ...
            ],
            ...
        },
        ...
    },
    ...

You can even execute script to determine a value:

    #!JSON

    ...
    "webOptimizer": {
        ...
        "path": {
            ...
            "source": {
                ...
                "base": "/",
                "asset": {
                    ...
                    "template": {
                        "__execute__": "test = self.path.source.base; if (test.endsWith('js')) return 'bar/';return 'foo/'"
                    },
                    ...
                },
                ...
            },
            ...
        },
        ...
    },
    ...

For all availbale configuration possibilties pleas have a look at the *
**package.json** file in this project since these values a extended on runtime.

Additionally its even possible to overwrite any value on runtime via a
complete generic command line interface: The last argument should evaluate to
a javaScript object witch will be used as source for exending the default
behavoir. Any JavaScript will be supported:

    #!JSON

    npm run build '{module: {optimizer: uglifyJS: {compress: {warnings": false}}}}'

If you're using webOptimizer in a toolchain were none printable or none unicode
compatible symbols should be used (for example content which should replace
placeholder) you can encode your javaScript expression as base64 code:

    #!bash

    npm run build '{module:{preprocessor:{pug:{locals:{name:'häns'}}}}}'

    # is the same as:

    npm run build 'e21vZHVsZTp7cHJlcHJvY2Vzc29yOntwdWc6e2xvY2Fsczp7bmFtZTonaMOkbnMnfX19fX0='

There is a static helper instance provided to each evaluation or execution
context within the package.json (see the API-Documentation, link above, for
more details):

    #!JSON

    ...
    "webOptimizer": {
        ...
        "libraryName": {"__evaluate__": helper.isPlainObject(self.name) ? helper.convertToValidVariableName(self.name) : 'random'},
        ...
    },
    ...

<!-- region modline
vim: set tabstop=4 shiftwidth=4 expandtab:
vim: foldmethod=marker foldmarker=region,endregion:
endregion -->
