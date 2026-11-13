<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

License
-------

This library written by Torben Sickert stands under a creative commons naming
4.0 international license.
See https://creativecommons.org/licenses/by/4.0/deed.de
endregion -->

<!--|deDE:Projektstatus-->
<!--|frFR:Statut du projet-->
Project Status
--------------

[![npm](https://img.shields.io/npm/v/weboptimizer?color=%23d55e5d&label=npm%20package%20version&logoColor=%23d55e5d&style=for-the-badge)](https://www.npmjs.com/package/weboptimizer)
[![npm downloads](https://img.shields.io/npm/dy/weboptimizer.svg?style=for-the-badge)](https://www.npmjs.com/package/weboptimizer)

[![build](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/build.yaml?style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/build.yaml)
[![build push package](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/build-package-and-push.yaml?label=build%20push%20package&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/build-package-and-push.yaml)

[![check types](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/check-types.yaml?label=check%20types&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/check-types.yaml)
[![lint](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/lint.yaml?label=lint&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/lint.yaml)
[![test](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/test-coverage-report.yaml?label=test&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/test-coverage-report.yaml)

[![code coverage](https://img.shields.io/coverallsCoverage/github/thaibault/weboptimizer?label=code%20coverage&style=for-the-badge)](https://coveralls.io/github/thaibault/weboptimizer)

[![deploy web documentation](https://img.shields.io/github/actions/workflow/status/thaibault/weboptimizer/deploy-web-documentation.yaml?label=deploy%20web%20documentation&style=for-the-badge)](https://github.com/thaibault/weboptimizer/actions/workflows/deploy-web-documentation.yaml)
[![web documentation](https://img.shields.io/website-up-down-green-red/https/tsickert.com/weboptimizer.svg?label=web-documentation&style=for-the-badge)](https://tsickert.com/weboptimizer)

[![Open in CodeSandbox](https://img.shields.io/badge/Open%20in-CodeSandbox-blue?style=for-the-badge&logo=codesandbox)](https://githubbox.com/thaibault/weboptimizer)

<!--|deDE:Einsatzmöglichkeiten-->
<!--|frFR:Cas d'utilisation-->
Use case
--------

One development tool for web and Node.js projects instead of a hand-written
webpack, Babel, TypeScript, Jest, ESLint and PostCSS setup. weboptimizer
brings working defaults for all of them: it builds libraries and web
applications from TypeScript, JavaScript, CSS and EJS templates, runs a
development server, tests, type checks, linting and documentation. Everything
you want to change is configured in your "package.json".
<!--deDE:
    Ein Entwicklungswerkzeug für Web- und Node.js-Projekte statt einer
    handgeschriebenen Konfiguration aus webpack, Babel, TypeScript, Jest,
    ESLint und PostCSS. weboptimizer bringt für all diese funktionierende
    Voreinstellungen mit: Es baut Bibliotheken und Webanwendungen aus
    TypeScript, JavaScript, CSS und EJS-Templates, betreibt einen
    Entwicklungsserver und führt Tests, Typprüfung, Linting und
    Dokumentationserzeugung aus. Alles, was Sie ändern möchten, wird in Ihrer
    "package.json" konfiguriert.
-->
<!--frFR:
    Un seul outil de développement pour les projets web et Node.js au lieu
    d'une configuration écrite à la main avec webpack, Babel, TypeScript,
    Jest, ESLint et PostCSS. weboptimizer fournit pour tous des réglages par
    défaut fonctionnels: il construit des bibliothèques et des applications
    web à partir de TypeScript, JavaScript, CSS et de templates EJS, exécute
    un serveur de développement, des tests, la vérification des types, le
    linting et la génération de documentation. Tout ce que vous souhaitez
    modifier se configure dans votre "package.json".
-->

<div class="wd-table-of-contents">
    <h2 id="content">Content<!--deDE:Inhalt--><!--frFR:Contenu--></h2>
    <!--wd-table-of-contents-->
</div>

<!--|deDE:Schnellstart-->
<!--|frFR:Démarrage rapide-->
Quick start
-----------

A TypeScript library with tests:
<!--deDE:Eine TypeScript-Bibliothek mit Tests:-->
<!--frFR:Une bibliothèque TypeScript avec des tests:-->

```bash
npm install --save-dev weboptimizer core-js jest @types/webpack-env
```

```JSON
{
  "name": "greeter",
  "type": "module",
  "main": "dist/index.js",
  "files": ["dist"],
  "scripts": {
    "build": "weboptimizer build",
    "check:types": "weboptimizer check:types",
    "clear": "weboptimizer clear",
    "test": "weboptimizer test",
    "watch": "weboptimizer build --watch"
  },
  "webOptimizer": {
    "path": {
      "source": {"base": "src/"},
      "target": {"base": "dist/"}
    }
  }
}
```

```TypeScript
// src/index.ts
export const greet = (name: string): string => `Hello ${name}!`

export default greet
```

```TypeScript
// src/test.ts
import {expect, test} from '@jest/globals'

import greet from './index'

test('greet', (): void => {
    expect(greet('World')).toStrictEqual('Hello World!')
})
```

"npm run build" writes "dist/index.js", "npm test" builds the tests and runs
them with Jest.
<!--deDE:
    "npm run build" schreibt "dist/index.js", "npm test" baut die Tests und
    führt sie mit Jest aus.
-->
<!--frFR:
    "npm run build" écrit "dist/index.js", "npm test" construit les tests et
    les exécute avec Jest.
-->

<!--|deDE:Bibliotheken und Anwendungen-->
<!--|frFR:Bibliothèques et applications-->
Libraries and applications
--------------------------

weboptimizer distinguishes two kinds of projects. Many defaults depend on it:
<!--deDE:
    weboptimizer unterscheidet zwei Arten von Projekten. Viele
    Voreinstellungen hängen davon ab:
-->
<!--frFR:
    weboptimizer distingue deux types de projets. De nombreux réglages par
    défaut en dépendent:
-->

- Library (default): Every source file is compiled on its own, imported
  packages stay external. Without a "path" configuration the output is placed
  next to the sources, therefore the quick start sets "src/" and "dist/".<!--deDE:Bibliothek (Standard): Jede Quelldatei wird einzeln kompiliert, importierte Pakete bleiben extern. Ohne "path"-Konfiguration landet die Ausgabe neben den Quellen, deshalb setzt der Schnellstart "src/" und "dist/".--><!--frFR:Bibliothèque (par défaut): Chaque fichier source est compilé séparément, les paquets importés restent externes. Sans configuration "path", la sortie est placée à côté des sources, c'est pourquoi le démarrage rapide définit "src/" et "dist/".-->
- Application ("library": false): Everything including dependencies is
  bundled from "src/" into "dist/" together with an "index.html". Stylesheets
  belong into "src/cascadingStyleSheet/", images into "src/image/" and fonts
  into "src/font/". An own "src/index.html.ejs" replaces the default page.<!--deDE:Anwendung ("library": false): Alles einschließlich der Abhängigkeiten wird aus "src/" zusammen mit einer "index.html" nach "dist/" gebündelt. Stylesheets gehören nach "src/cascadingStyleSheet/", Bilder nach "src/image/" und Schriften nach "src/font/". Eine eigene "src/index.html.ejs" ersetzt die Standardseite.--><!--frFR:Application ("library": false): Tout, dépendances comprises, est regroupé depuis "src/" dans "dist/" avec un "index.html". Les feuilles de style vont dans "src/cascadingStyleSheet/", les images dans "src/image/" et les polices dans "src/font/". Un "src/index.html.ejs" personnel remplace la page par défaut.-->

```JSON
{
  "scripts": {
    "build": "weboptimizer build",
    "serve": "weboptimizer serve"
  },
  "webOptimizer": {
    "library": false
  }
}
```

<!--|deDE:Befehle-->
<!--|frFR:Commandes-->
Commands
--------

- "build": Builds the project. Further arguments go to webpack, e.g.
  "weboptimizer build --watch" rebuilds on every change.<!--deDE:"build": Baut das Projekt. Weitere Argumente gehen an webpack, z. B. baut "weboptimizer build --watch" bei jeder Änderung neu.--><!--frFR:"build": Construit le projet. Les arguments supplémentaires sont transmis à webpack, par exemple "weboptimizer build --watch" reconstruit à chaque modification.-->
- "serve": Starts a development server on port 8080 which reloads the page
  on changes.<!--deDE:"serve": Startet einen Entwicklungsserver auf Port 8080, der die Seite bei Änderungen neu lädt.--><!--frFR:"serve": Démarre un serveur de développement sur le port 8080 qui recharge la page à chaque modification.-->
- "test": Builds all files named "test" and runs them with Jest in Node.js.
  For a simulated browser set "commandLine.test.environments" to ["jsdom"].
  "test:coverage" adds a coverage report.<!--deDE:"test": Baut alle Dateien namens "test" und führt sie mit Jest in Node.js aus. Für einen simulierten Browser setzen Sie "commandLine.test.environments" auf ["jsdom"]. "test:coverage" ergänzt einen Abdeckungsbericht.--><!--frFR:"test": Construit tous les fichiers nommés "test" et les exécute avec Jest dans Node.js. Pour un navigateur simulé, définissez "commandLine.test.environments" à ["jsdom"]. "test:coverage" ajoute un rapport de couverture.-->
- "test:browser": Serves the tests to run them in a real browser.<!--deDE:"test:browser": Stellt die Tests bereit, um sie in einem echten Browser auszuführen.--><!--frFR:"test:browser": Sert les tests pour les exécuter dans un vrai navigateur.-->
- "check:types" and "build:types": Checks the TypeScript types or writes
  declaration files.<!--deDE:"check:types" und "build:types": Prüft die TypeScript-Typen oder schreibt Deklarationsdateien.--><!--frFR:"check:types" et "build:types": Vérifie les types TypeScript ou écrit les fichiers de déclaration.-->
- "lint": Checks scripts with ESLint and stylesheets with Stylelint.<!--deDE:"lint": Prüft Skripte mit ESLint und Stylesheets mit Stylelint.--><!--frFR:"lint": Vérifie les scripts avec ESLint et les feuilles de style avec Stylelint.-->
- "document": Generates API documentation with JSDoc.<!--deDE:"document": Erzeugt API-Dokumentation mit JSDoc.--><!--frFR:"document": Génère la documentation de l'API avec JSDoc.-->
- "clear": Removes all build output.<!--deDE:"clear": Entfernt alle Build-Ausgaben.--><!--frFR:"clear": Supprime toutes les sorties de construction.-->

<!--|deDE:Optionale Funktionen-->
<!--|frFR:Fonctionnalités optionnelles-->
### Optional features

Features beyond building scripts need additional packages:
<!--deDE:
    Funktionen über das Bauen von Skripten hinaus benötigen zusätzliche
    Pakete:
-->
<!--frFR:
    Les fonctionnalités au-delà de la construction de scripts nécessitent
    des paquets supplémentaires:
-->

- Stylesheets: "css-loader", "style-loader", "mini-css-extract-plugin",
  "postcss-loader", "postcss-import", "postcss-preset-env", "postcss-url",
  "postcss-fontpath" and "cssnano".<!--deDE:Stylesheets: "css-loader", "style-loader", "mini-css-extract-plugin", "postcss-loader", "postcss-import", "postcss-preset-env", "postcss-url", "postcss-fontpath" und "cssnano".--><!--frFR:Feuilles de style: "css-loader", "style-loader", "mini-css-extract-plugin", "postcss-loader", "postcss-import", "postcss-preset-env", "postcss-url", "postcss-fontpath" et "cssnano".-->
- Development server: "webpack-dev-server".<!--deDE:Entwicklungsserver: "webpack-dev-server".--><!--frFR:Serveur de développement: "webpack-dev-server".-->
- Linting: "eslint", "@eslint/js", "eslint-config-google",
  "eslint-plugin-jsdoc", "typescript-eslint", "@stylistic/eslint-plugin" and
  "globals", for stylesheets "stylelint" and "stylelint-config-standard".<!--deDE:Linting: "eslint", "@eslint/js", "eslint-config-google", "eslint-plugin-jsdoc", "typescript-eslint", "@stylistic/eslint-plugin" und "globals", für Stylesheets "stylelint" und "stylelint-config-standard".--><!--frFR:Linting: "eslint", "@eslint/js", "eslint-config-google", "eslint-plugin-jsdoc", "typescript-eslint", "@stylistic/eslint-plugin" et "globals", pour les feuilles de style "stylelint" et "stylelint-config-standard".-->
- Favicons from "src/image/favicon.png": "favicons-webpack-plugin".<!--deDE:Favicons aus "src/image/favicon.png": "favicons-webpack-plugin".--><!--frFR:Favicons à partir de "src/image/favicon.png": "favicons-webpack-plugin".-->
- Image compression: "image-minimizer-webpack-plugin" and "imagemin".<!--deDE:Bildkomprimierung: "image-minimizer-webpack-plugin" und "imagemin".--><!--frFR:Compression des images: "image-minimizer-webpack-plugin" et "imagemin".-->
- Offline support via service worker: "workbox-webpack-plugin".<!--deDE:Offline-Unterstützung per Service Worker: "workbox-webpack-plugin".--><!--frFR:Prise en charge hors ligne via service worker: "workbox-webpack-plugin".-->
- API documentation: "jsdoc".<!--deDE:API-Dokumentation: "jsdoc".--><!--frFR:Documentation de l'API: "jsdoc".-->

<!--|deDE:Konfiguration-->
<!--|frFR:Configuration-->
Configuration
-------------

All settings live under the key "webOptimizer" in your "package.json" and are
merged into the defaults, which you find under "configuration" in
weboptimizer's own "package.json". Keys like "#" or "#1" are comments:
<!--deDE:
    Alle Einstellungen stehen unter dem Schlüssel "webOptimizer" in Ihrer
    "package.json" und werden mit den Voreinstellungen zusammengeführt, die
    Sie unter "configuration" in der "package.json" von weboptimizer finden.
    Schlüssel wie "#" oder "#1" sind Kommentare:
-->
<!--frFR:
    Tous les réglages se trouvent sous la clé "webOptimizer" de votre
    "package.json" et sont fusionnés avec les réglages par défaut, que vous
    trouvez sous "configuration" dans le "package.json" de weboptimizer. Les
    clés comme "#" ou "#1" sont des commentaires:
-->

```JSON
{
  "webOptimizer": {
    "#": "Serve on another port.",
    "development": {
      "server": {"port": 9000}
    },
    "generic": {
      "supportedBrowsers": ["last 2 versions", "> 1%"]
    }
  }
}
```

The sections "debug", "document", "test" and "test:browser" are merged in
only for the corresponding command or for debug mode. Debug mode leaves
stylesheets and HTML unminified and is enabled via "debug": true or the
environment variable "NODE_ENV=development".
<!--deDE:
    Die Abschnitte "debug", "document", "test" und "test:browser" werden nur
    beim jeweiligen Befehl bzw. im Debug-Modus eingemischt. Der Debug-Modus
    lässt Stylesheets und HTML unminifiziert und wird über "debug": true
    oder die Umgebungsvariable "NODE_ENV=development" aktiviert.
-->
<!--frFR:
    Les sections "debug", "document", "test" et "test:browser" ne sont
    intégrées que pour la commande correspondante ou en mode débogage. Le
    mode débogage laisse les feuilles de style et le HTML non minifiés et
    s'active via "debug": true ou la variable d'environnement
    "NODE_ENV=development".
-->

<!--|deDE:Berechnete Werte-->
<!--|frFR:Valeurs calculées-->
### Computed values

Values can be JavaScript expressions with "__evaluate__" or function bodies
with "__execute__". "self" is the whole configuration, further available are
e.g. "currentPath", "path", "fs", "webOptimizerPath" and the helpers of
[clientnode](https://tsickert.com/clientnode) like "string" or "array".
Values inside "path" have to be plain strings:
<!--deDE:
    Werte können JavaScript-Ausdrücke mit "__evaluate__" oder
    Funktionsrümpfe mit "__execute__" sein. "self" ist die gesamte
    Konfiguration, außerdem verfügbar sind z. B. "currentPath", "path",
    "fs", "webOptimizerPath" und die Hilfsfunktionen von
    [clientnode](https://tsickert.com/clientnode) wie "string" oder
    "array". Werte innerhalb von "path" müssen einfache Zeichenketten sein:
-->
<!--frFR:
    Les valeurs peuvent être des expressions JavaScript avec "__evaluate__"
    ou des corps de fonction avec "__execute__". "self" est la configuration
    entière, sont aussi disponibles par exemple "currentPath", "path", "fs",
    "webOptimizerPath" et les utilitaires de
    [clientnode](https://tsickert.com/clientnode) comme "string" ou "array".
    Les valeurs dans "path" doivent être de simples chaînes de caractères:
-->

```JSON
{
  "webOptimizer": {
    "libraryName": {"__evaluate__": "`${self.name}-library`"}
  }
}
```

<!--|deDE:Kommandozeile-->
<!--|frFR:Ligne de commande-->
### Command line

The last argument of a command can be a JavaScript object which overrides
the configuration. "__reference__" merges in named sections of your
configuration (or JSON files), which is handy for build variants:
<!--deDE:
    Das letzte Argument eines Befehls kann ein JavaScript-Objekt sein, das
    die Konfiguration überschreibt. "__reference__" mischt benannte
    Abschnitte Ihrer Konfiguration (oder JSON-Dateien) ein, was sich für
    Build-Varianten anbietet:
-->
<!--frFR:
    Le dernier argument d'une commande peut être un objet JavaScript qui
    remplace la configuration. "__reference__" intègre des sections nommées
    de votre configuration (ou des fichiers JSON), ce qui est pratique pour
    les variantes de construction:
-->

```JSON
{
  "scripts": {
    "build:bundle": "weboptimizer build '{__reference__: \"target:bundle\"}'"
  },
  "webOptimizer": {
    "target:bundle": {
      "inPlace": {"externalLibrary": {"normal": true}},
      "path": {"target": {"base": "dist/bundle/"}}
    }
  }
}
```

```bash
npx weboptimizer serve '{development: {server: {port: 9000}}}'
```

If your toolchain can not pass such characters, encode the object as base64:
<!--deDE:
    Kann Ihre Toolchain solche Zeichen nicht übergeben, kodieren Sie das
    Objekt als Base64:
-->
<!--frFR:
    Si votre chaîne d'outils ne peut pas transmettre de tels caractères,
    encodez l'objet en base64:
-->

```bash
npx weboptimizer build \
    "$(printf '%s' "{path: {target: {base: 'out/'}}}" | base64)"
```

<!--|deDE:Editor-Integration-->
<!--|frFR:Intégration dans l'éditeur-->
### Editor integration

Point your editor's ESLint integration to the project's "eslint" package
and to the configuration
"node_modules/weboptimizer/dist/eslint.config.js". TypeScript
configurations can extend "./node_modules/weboptimizer/tsconfig.json".
<!--deDE:
    Richten Sie die ESLint-Integration Ihres Editors auf das
    "eslint"-Paket des Projekts und auf die Konfiguration
    "node_modules/weboptimizer/dist/eslint.config.js" aus.
    TypeScript-Konfigurationen können
    "./node_modules/weboptimizer/tsconfig.json" erweitern.
-->
<!--frFR:
    Faites pointer l'intégration ESLint de votre éditeur vers le paquet
    "eslint" du projet et vers la configuration
    "node_modules/weboptimizer/dist/eslint.config.js". Les configurations
    TypeScript peuvent étendre "./node_modules/weboptimizer/tsconfig.json".
-->

<!--|deDE:Entwicklung-->
<!--|frFR:Développement-->
Development
-----------

```bash
yarn install
yarn build
yarn test
```
