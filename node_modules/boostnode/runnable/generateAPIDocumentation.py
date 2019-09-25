#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''This module provides an easy way to generate a python api documentation.'''

# # python3.5
# # pass
from __future__ import absolute_import, division, print_function, \
    unicode_literals
# #

'''
    For conventions see "boostnode/__init__.py" on \
    https://github.com/thaibault/boostnode
'''

__author__ = 'Torben Sickert'
__copyright__ = 'see boostnode/__init__.py'
__credits__ = 'Torben Sickert',
__license__ = 'see boostnode/__init__.py'
__maintainer__ = 'Torben Sickert'
__maintainer_email__ = 'info["~at~"]torben.website'
__status__ = 'stable'
__version__ = '1.0'

# # python3.5
# # import builtins
import __builtin__ as builtins
# #
import inspect
import os
import re as regularExpression
import sys

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

from boostnode import __get_all_modules__
from boostnode.extension.file import Handler as FileHandler
from boostnode.extension.native import Module
from boostnode.extension.system import Platform
from boostnode.paradigm.aspectOrientation import JointPoint

# endregion


@JointPoint
# # python3.5 def main() -> None:
def main():
    '''Generates a python api documentation website.'''
    if FileHandler('documentation').is_directory():
        current_working_directory = FileHandler()
        index_file = FileHandler('documentation/source/index.rst')
        modules_to_document = '\ninit'
        FileHandler(
            location='%sinit.rst' % index_file.directory.path
        ).content = (
            (79 * '=') + '\n{name}\n' + (79 * '=') + '\n\n.. automodule::' +
            ' {name}\n    :members:'
        ).format(name=current_working_directory.name)
        for file in FileHandler():
            if Module.is_package(file.path):
                modules_to_document += '\n    %s' % file.name
                FileHandler(location='%s%s.rst' % (
                    index_file.directory.path, file.name
                )).content = (
                    (79 * '=') + '\n{name}.{package}\n' +
                    (79 * '=') + '\n\n.. automodule:: {name}.{package}\n'
                    '    :members:'
                ).format(
                    name=current_working_directory.name, package=file.name)
                for module in __get_all_modules__(file.path):
                    modules_to_document += '\n    %s.%s' % (file.name, module)
                    FileHandler(location='%s%s.%s.rst' % (
                        index_file.directory.path, file.name, module
                    )).content = (
                        (79 * '=') + '\n{name}.{package}.{module}\n' +
                        (79 * '=') + '\n\n.. automodule:: {name}.{package}.'
                        '{module}\n    :members:'
                    ).format(
                        name=current_working_directory.name,
                        package=file.name, module=module)
        index_file.content = regularExpression.compile(
            '\n    ([a-z][a-zA-Z]+\n)+$', regularExpression.DOTALL
        ).sub(modules_to_document, index_file.content)
        Platform.run('/usr/bin/env git add --all', error=False, log=True)
        FileHandler('documentation').change_working_directory()
        makefile = FileHandler('Makefile')
# # python3.5         FileHandler('MakefilePython3').copy(makefile)
        FileHandler('MakefilePython2').copy(makefile)
        Platform.run(
            command='make html', native_shell=True, error=False, log=True)
        makefile.remove_file()
        FileHandler('build/html').path = '../apiDocumentation'
        FileHandler('build').remove_deep()

# region footer

'''
    Preset some variables given by introspection letting the linter know what \
    globale variables are available.
'''
__logger__ = __exception__ = __module_name__ = __file_path__ = \
    __test_mode__ = __test_buffer__ = __test_folder__ = __test_globals__ = None
'''
    Extends this module with some magic environment variables to provide \
    better introspection support. A generic command line interface for some \
    code preprocessing tools is provided by default.
'''
Module.default(name=__name__, frame=inspect.currentframe())

# endregion

# region vim modline
# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:
# endregion
