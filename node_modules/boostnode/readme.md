<!-- #!/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert 16.12.2012

License
   This library written by Torben Sickert stand under a creative commons
   naming 3.0 unported license.
   See https://creativecommons.org/licenses/by/3.0/deed.de
endregion -->

Project status
--------------

[![npm version](https://badge.fury.io/js/boostnode.svg)](https://www.npmjs.com/package/boostnode)
[![downloads](https://img.shields.io/npm/dy/boostnode.svg)](https://www.npmjs.com/package/boostnode)
[![build status](https://travis-ci.org/thaibault/boostnode.svg?branch=master)](https://travis-ci.org/thaibault/boostnode)
[![dependencies](https://img.shields.io/david/thaibault/boostnode.svg)](https://david-dm.org/thaibault/boostnode)
[![development dependencies](https://img.shields.io/david/dev/thaibault/boostnode.svg)](https://david-dm.org/thaibault/boostnode?type=dev)
[![peer dependencies](https://img.shields.io/david/peer/thaibault/boostnode.svg)](https://david-dm.org/thaibault/boostnode?type=peer)
[![documentation website](https://img.shields.io/website-up-down-green-red/https/torben.website/boostnode.svg?label=documentation-website)](https://torben.website/boostnode)

<!--|deDE:Einsatz-->
Use case
--------

boostNode is a high level python library. This library supports python2.7+ and
python3.4+ environments. And will always try to use every new cutting edge
python features! The main goal of boostNode is to support all typical use cases
for applications in a full generic, reusable and very solid way.
<!--deDE:
    boostNode ist eine sehr einfach zu verwendende intuitive python Bibliothek.
    Momentan unterstützt sie sowohl python2.7+ als auch python3.4+ Umgebungen.
    Konzept ist es durch Automatisierung immer die neusten cutting edge
    features der neusten Python Versionen in einer Bibliothek zu verwenden und
    dabei alle typischen Anwendungstypen durch rein generische Module durch
    Hochzuverlässige Bausteine zu unterstützen.
-->

<!--|deDE:Inhalt-->
Content
-------

<!--Place for automatic generated table of contents.-->
[TOC]

<!--|deDE:Merkmale-->
Features
--------

<ul>
    <li>
        Very high code quality<!--deDE:Sehr hohe Code-Qualität-->
        <ul>
            <li>
                100% platform independent reachable branch coverage tested!
                <!--deDE:
                    100% platform unabhängig erreichbare Branch-Coverage
                    getestet!
                -->
            </li>
            <li>
                Signature based type checking in development mode
                <!--deDE:
                    Signatur basiertes Type-Checking im Entwicklungsmodus
                -->
            </li>
            <li>
                Each unit(function) has a cyclomatic complexity less than 8!
                <!--deDE:
                    Jede Logikeinheit (Funktion) hat eine kleinere
                    cyclomatische Komplexität als 8!
                -->
            </li>
            <li>
                Every function, class, module or package has a simple api
                documentation.
                <!--deDE:
                    Jede Funktion, Klasse, Modul oder jedes Paket hat eine
                    einfache API-Dokumentation.
                -->
            </li>
        </ul>
    </li>
    <li>
        Always compatible<!--deDE:Immer Kompatibel-->
        <ul>
            <li>
                Always compatible to newest stable python release with latest
                features included
                <!--deDE:
                    Immer kompatibel zum neusten stabilen Python-Release
                    mit den neusten Features integriert
                -->
            </li>
            <li>
                Always compatible to last major stable python release. You can
                switch between both versions via the embedded macro languages
                (see runnabel/macro.py)
                <!--deDE:
                    Immer kompatibel zum letzten stabilen Python-Release
                    Der zu unterstützende Interpreter kann von dem Framework
                    selbst gewechselt werden (siehe runnable/macro.py).
                -->
            </li>
        </ul>
    </li>
    <li>
        Platform independent web-based gui-toolkit
        (see runnable/webToWindow.py).
        <!--deDE:
            Platformunabhängige Web-basiertes GUI-Toolkit
            (siehe runnable/webToWindow.py).
        -->
    </li>
    <li>
        Smart, very secure and multiprocessing web-server supporting gzip,
        htaccess, ssl file parsing, directory listing, thread-based and
        process-based cgi-script handling. You Can run every executable file
        as cgi-script out of the box. You don't need any sockets like FastCGI
        or WebSocket (see runnable/server.py).
        <!--deDE:
            Eleganter, sehr sicherer und Multiprozess fähiger Web-Server.
            Unterstützte werden gzip, htaccess, das Parsen von ssl Dateien,
            automatische Ordnerauflistung, Thread-basiertes und
            Prozess-basiertes cgi-Skript Handhabung. Es ist möglich jede
            ausführbare Datei als cgi-Skript auszuführen, ohne Sockets
            einrichten zu müssen (siehe runnable/server.py).
        -->
    </li>
    <li>
        Macro processor for maintaining multiple versions of text based files
        in one place (see runnable/macro.py).
        <!--deDE:
            Macroprozessor zum Verwalten mehrere text Datei basierter Versionen
            im selben Ort (siehe runnable/macro.py).
        -->
    </li>
    <li>
        File synchronisation and reflection via native and platform independent
        symbolic file linking (see runnable/synchronisation.py).
        <!--deDE:
            Dateisynchronisierung und Reflektion über native und
            platformunabhängige symbolisches Dateiverlinkung
            (siehe runnable/synchronisation.py).
        -->
    </li>
    <li>
        Many extended language feature like signature checking, joint points
        for aspect orientated programming, automatic getter or setter
        generation (see aspect/signature.py, paradigm/aspectOrientation.py or
        paradigm/objectOrientation.py).
        <!--deDE:
            Viele erweiterte Sprach-Features wie Signaturüberprüfung,
            Joint-Points für Aspekt-Orientierte-Programmierung, automatische
            Getter- und Settergenerierung (siehe aspect/signature.py,
            paradigm/aspectOrientation.py oder paradigm/objectOrientation.py).
        -->
    </li>
    <li>
        Many additional introspection features and native type extensions
        (see extension/native.py and extension/type.py).
        <!--deDE:
            Viele zusätzliche Introspektion-Features und native
            Typen-Erweiterungen
            (siehe extension/native.py und extension/type.py).
        -->
    </li>
    <li>
        Very high-level object orientated file abstraction layer with
        sandboxing support, and backup mechanisms included
        (see extension/file.py).
        <!--deDE:
            Sehr stark vereinfachte Objekt-Orientierte Dateiabstraktions
            Schicht mit eingebautem Sanboxing und Backup Mechanismus
            (siehe extension/file.py).
        -->
    </li>
    <li>
        Highlevel code file handling (see runnable/codeRunner.py). Run every
        source code without manually compiling code or tidying up.
        <!--deDE:
            Vereinfachtes einheitliche Handhabung mit diversen Code-Dateien
            (siehe runnable/codeRunner.py). Führe jeden Quellcode aus, ohne
            dabei Kompilierungs oder Aufräumarbeiten beachten zu müssen.
        -->
    </li>
    <li>
        Template engine with embedded python code in any text based file
        supporting every python syntax and additional nesteable file-include
        statement (see runnable/template.py).
        <!--deDE:
            Template-Engine welche eingebetteten Pythoncode in beliebigen
            Text-dateien erlaubt. Verschachtelte Template-Includes mit
            individueller Scope-vergabe ist möglich
            (siehe runnable/template.py).
        -->
    </li>
    <li>
        Full featured global logging mechanism handling
        (see extension/system.py).
        <!--deDE:
            Featurereiches globale Log-mechanismen (siehe extension/system.py).
        -->
    </li>
    <li>
        Very generic full featured command line argument parsing interface
        written on top of python's native "ArgumentParser" module
        (see extension/system.py and extension/output.py).
        <!--deDE:
            Sehr generischer Featurereiches
            Commandline-Argumenten-Pars-Interface, das auf Pythons nativen
            "ArgumentParser" Modul aufsetzt
            (see extension/system.py und extension/output.py).
        -->
    </li>
    <li>
        Many tools to bring the dry concept to the highest possible level.
        <!--deDE:
            Viele Tools die ein durchgänges Einhalten des dry-Konzepts
            erlauben.
        -->
    </li>
</ul>

<!--|deDE:Verwendung-->
Usage
-----

Copy this folder to your projects directory and write something like:
<!--deDE:
    Kopiere diesen Ordner in den Projektordner und verwende das Framework z.B.
    folgendermaßen:
-->

    #!/usr/bin/env python

    from boostNode.extension.file import Handler as FileHandler
    from boostNode.extension.native import Dictionary, Module, \
        PropertyInitializer, String
    from boostNode.extension.output import Buffer, Print
    from boostNode.extension.system import CommandLine, Runnable
    ## python3.4 from boostNode.extension.type import Self, SelfClass
    pass
    from boostNode.paradigm.aspectOrientation import JointPoint
    from boostNode.paradigm.objectOrientation import Class

    # some stuff using imported boostNode components...

For advanced usage see the recommended module pattern described in
"boosNode/\_\_init\_\_.py".
<!--deDE:
    Um eigene komplexere Module zu verfassen sollte man dem vorgegebenen
    Format, beschrieben in "boostNode/\_\_init\_\_.py" folgen.
-->

boostNode is able to switch itself between python2.X and python3.X.
To switch boostNode version between python3.X and python 2.X use this
command:
<!--deDE:
    boostNode ist in der Lage seine eigene Version unterstützt von Python2.X
    und Python3.X zu wechseln. Um eine Konvertierung vorzunehmen kann man
    folgenden Befehl verwenden:
-->

```bash
>>> /path/to/boostNode/runnable/macro.py -p /path/to/boostNode -e py
```

Note that you have to temporary support the needed python environment of given
boostNode version to convert to the other one. Writing own code supporting two
different interpreter version is very easy. Follow one of the two following
syntax examples:
<!--deDE:
    Zu beachten ist, dass man temporär die aktuelle Interpreter Version zur
    Verfügung stellen muss, um den Wechsel vorzunehmen. Um eigenen Code zu
    schreiben, der verschiedene Interpreterversionen unterstützt sollte man
    einen der beiden folgenden Syntax verwenden.
-->

    #!/usr/bin/env interpreterA

    ## interpreterB
    ## if True || False do {
    ##     something();
    ## }
    # Your multiline code supported by interpreterA
    if True or False do
        something()
    endif
    ##

    # Your two version of any one line code supportted by interpreterA or
    # interpreterB
    ## interpreterB functionCall();
    functionCall()

Have Fun with boostNode!
<!--deDE:Viel Spass mit boostNode!-->

<!--|deDE:Urheberrecht-->
Copyright
---------

see header in ./\_\_init\_\_.py
<!--deDE:Siehe Header in ./\_\_init\_\_.py-->

<!--|deDE:Lizenz-->
License
-------

see header in ./\_\_init\_\_.py
<!--deDE:Siehe Header in ./\_\_init\_\_.py-->

<!-- region vim modline
vim: set tabstop=4 shiftwidth=4 expandtab:
vim: foldmethod=marker foldmarker=region,endregion:
endregion -->
