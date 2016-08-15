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

- Complete and flexible configured Wrapper for webpack with many automatically
  determined pre configuration.
- Completely adaptable for your needs.
- Specially and automatically targets library and web bundle building out of
  the box.
- Only one configuration file (your already existing package.json) for all
  needed customisations.
- Many needed uses-cases are preconfigured and mostly works out of the box for
  your project.
    - **API-Documentation** generation
    - Polymorphic **testing** on dom in browsers and/or in node through
      webOptimizer/browserAPI
    - **Linting** and **TypeChecking** with Flow
    - Preconfigured **preprocessing** for CSS (PostCSS), JavaScript (Babel, Flow)
    - Preconfigured **postprocessing* for CSS (Minification),
      JavaScript (Minification), Images (Compression)
    - Various pre configured and adaptable implemented concepts for building
      development-, production-, testing- and/or vendor **bundles**.
    - Support for building **libraries** with well defined (UMD) external
      dependencies (preconfigred extensable weback configuration)
    - Support for building and **shimming** a whole package managed application
      structure to build for various target environments like browsers or node
      (preconfigred extensable weback configuration)
    - Generic management for dealing with **DLL-Bundle** to speed up any workflows:
      Each (pre-)defined chunk can be outsourced to a DLL-Bundle in a complete
      delclarative and generic way.
    - Many development helper:
        - Preconfigured local webserver with preconfigured websocket
          connections to **automatically refresh** you browser when any asset has
          changed (webpack-dev-server).
        - Preconfigured **hot module replacement** integration to update parts
          of your library/application with no siteeffects in a generic way
          without event the need to refresh your browser

<!--|deDE:Installation-->
Installation
------------

    #!JSON

    ...
    "dependencies": {
        ...
        "webOptimizer": "git+ssh://git@github.com/thaibault/webOptimizer.git",
        ...
    },
    ...

Update your packages via npm and have fun:

    npm update

<!-- region modline
vim: set tabstop=4 shiftwidth=4 expandtab:
vim: foldmethod=marker foldmarker=region,endregion:
endregion -->
