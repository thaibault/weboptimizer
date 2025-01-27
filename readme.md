<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

License
-------

This library written by Torben Sickert stand under a creative commons naming
3.0 unported license. See https://creativecommons.org/licenses/by/3.0/deed.de
endregion -->

Project status
--------------

[![npm](https://img.shields.io/npm/v/weboptimizer?color=%23d55e5d&label=npm%20package%20version&logoColor=%23d55e5d&style=for-the-badge)](https://www.npmjs.com/package/weboptimizer)
[![npm downloads](https://img.shields.io/npm/dy/weboptimizer.svg?style=for-the-badge)](https://www.npmjs.com/package/weboptimizer)

[![build](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/build.yaml?style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/build.yaml)
[![build push package](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/build-package-and-push.yaml?label=build%20push%20package&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/build-package-and-push.yaml)

[![check types](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/check-types.yaml?label=check%20types&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/check-types.yaml)
[![lint](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/lint.yaml?label=lint&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/lint.yaml)
[![test](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/test-coverage-report.yaml?label=test&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/test-coverage-report.yaml)

[![code coverage](https://img.shields.io/coverallsCoverage/github/thaibault/weboptimizer?label=code%20coverage&style=for-the-badge)](https://coveralls.io/github/thaibault/weboptimizer)

[![documentation website](https://img.shields.io/website-up-down-green-red/https/torben.website/weboptimizer.svg?label=documentation-website&style=for-the-badge)](https://torben.website/weboptimizer)

[![Try out](https://img.shields.io/badge/Try%20it%20on%20runkit-%2345cc11?style=for-the-badge)](https://npm.runkit.com/weboptimizer)

Use case
--------

The main goal of This plugin is providing a generic module bundler and
workflow for all your development use cases in any project related to the web
or node. All native web types like html, css and JavaScript are supported
natively in their latest language specification through preconfigured
transpiler.

<!--Place for automatic generated table of contents.-->
<div class="doc-toc" style="display:none">
    <!--|deDE:Inhalt-->
    <h2 id="content">Content</h2>
</div>

Features
--------

- Complete and flexible configured wrapper for **webpack5+** with many
  automatically determined pre configurations.
- Completely **adaptable** for your needs.
- Targets **library** and **web** bundle building out of the box.
- Only one configuration file (your already existing **package.json**) for all
  needed customisations needed.
- Many **uses-cases** are preconfigured and mostly works out of the box for
  your project:
    - Preconfigured **preprocessing** for css (PostCSS), javaScript (Babel,
      Flow) and any generic text (template) file (in ejs) with any number of
      precompile/render steps for optimal runtime performance.
    - Preconfigured **postprocessing** for css (Minification),
      JavaScript (Minification), Images (Compression)
    - Image **sprite** handling: Combine your images and never manage sprites
      by hand again.
    - Polymorphic **testing** on dom in browsers and/or node through
      weboptimizer/browser
    - **Linting** and **TypeChecking** with Flow on css and javaScript
    - Automatic **API-Documentation** generation for javaScript
    - Various pre configured and adaptable implemented concepts for building
      development-, production-, testing-, errorhandler and/or vendor
      **bundles**.
    - Support for building **libraries** with well defined (UMD, AMD,
      commonjs...) external, dependencies (preconfigured extendable weback
      configuration)
    - Support for building and **shimming** a whole package managed application
      structure to build for various target environments like browsers or node
      (preconfigured extendable weback configuration)
    - Generic support for all known **favicon** types using only one png file as
      source (watching, compressing and auto-generating integrated)
    - Brings **offline** support though service worker to your application
      without any needed manual intervention!
    - Many development helper:
        - Automatic watching and (re-)building on any assets through cross
          platform **file watching**
        - Preconfigured local webserver with websocket connections to
          **livereload** you browser when any asset has changed
          (webpack-dev-server).
        - Preconfigured **hot module replacement** integration to update parts
          of your library/application with no siteeffects in a generic way
          without even the need to refresh your browser
        - Automaticaly watch and integrate any **css updates** trough hot
          module replacements in app which will be shiped through the
          development server.

Installation
------------

Edit your **package.json** to add **one** dependency:

```JSON
...
"dependencies": {
    ...
    "weboptimizer": "latest",
    ...
},
...
```

Update your **packages** via npm and have fun:

    npm update

Configuration
-------------

First you should specify some tasks/use-cases you want to use in you project.
You can do this in your **package.json**. All supported scripts and some useful
compositions are listed below:

```JSON
...
"scripts": {
    ...
    "build": "weboptimizer build",
    "build:stats": "weboptimizer build --profile --json >/tmp/stat.json && echo 'Results successfully written to \"/tmp/stat.json\".'",
    "check": "yarn check:types; yarn lint",
    "check:types": "weboptimizer check:types",
    "clear": "weboptimizer clear",
    "document": "weboptimizer document",
    "lint": "weboptimizer lint",
    "postinstall": "weboptimizer build",
    "preinstall": "weboptimizer preinstall",
    "serve": "weboptimizer serve",
    "start": "npm run serve",
    "test": "weboptimizer test",
    "test:browser": "weboptimizer test:browser",
    "watch": "weboptimizer build --watch",
    ...
},
...
```

You can easily run any specified script via npm's command lint interface:

```bash
npm run build -debug
npm run lint
npm run watch -debug
npm run serve
...
```

If you want to configure your application to change any of the expected
default source, target, asset or build paths do it in your **package.json**:

```JSON
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
```

It's recommended to first specify if you're writing a library (preserve
external dependencies not managed within current project) or an application
(everything should be bundled including external libraries) since many
preconfigurations are targeting on this two different use cases. Anyway you can
customize each configuration preset by hand.

```JSON
...
"webOptimizer": {
    ...
    "library": false,
    ...
},
...
```

You can even reference any value or evaluate any configuration value
dynamically though a complete javaScript compatible evaluation mechanism:

```JSON
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
```

You can even execute scripts to determine a value:

``JSON
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
```

For all available configuration possibilities please have a look at the
**package.json** file in this project since these values will be extended on
runtime.

Additionally its even possible to overwrite any value on runtime via a
complete generic command line interface: The last argument should evaluate to
a javaScript object which will be used as source for extending the default
behavior. Any javaScript will be supported:

    npm run build '{module:{preprocessor:{javaScript:{loader:"babel"}}}}'

If you're using weboptimizer in a toolchain were none printable or none unicode
compatible symbols should be used (for example content which should replace
placeholder) you can encode your javaScript expression as base64 code:

    npm run build '{module:{preprocessor:{ejs:{locals:{name:'häns'}}}}}'

    # is the same as:

    npm run build 'e21vZHVsZTp7cHJlcHJvY2Vzc29yOntwdWc6e2xvY2Fsczp7bmFtZTonaMOkbnMnfX19fX0='

There is a static tool [clientnode](https://torben.website/clientNode) and
helper instance provided to each evaluation or execution context within the
package.json (see the API-Documentation, link above, for more details):

```JSON
...
"webOptimizer": {
    ...
    "libraryName": {"__evaluate__": indicator.isPlainObject(self.name) ? helper.stripLoader(self.request) : 'random'},
    ...
},
...
```

### WebStorm

#### Eslint

1. Set eslint package to project specific one:
    /PATH/TO/PROJECT/node_modules/eslint
2. Set Working directory:
    /PATH/TO/PROJECT
3. Set configuration file path:
    /PATH/TO/PROJECT/node_modules/weboptimizer/eslint.config.mjs
