#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''
    This module provides an interpreter to run a simple macro language \
    written in text-files. Converts special commented version depending code \
    snippets in given location to another given version. This code \
    transformation can always be made in both directions.
'''

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
# # from collections import Iterable
import __builtin__ as builtins
import codecs
# #
import inspect
import os
import re as regularExpression
import sys

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

# # python3.5
# # from boostnode import ENCODING
from boostnode import ENCODING, convert_to_string, convert_to_unicode
# #
from boostnode.extension.file import Handler as FileHandler
from boostnode.extension.native import Module, InstancePropertyInitializer
from boostnode.extension.native import String as String
from boostnode.extension.system import CommandLine, Runnable
# # python3.5 from boostnode.extension.type import Self
pass
from boostnode.paradigm.aspectOrientation import JointPoint
from boostnode.paradigm.objectOrientation import Class

# endregion


# region classes

class Replace(Class, Runnable):

    '''
        Parse source code and replace version depended code snippets with the \
        correct given version code snippets.

        NOTE: "(?s...)" is equivalent to regular expression flag \
        "regularExpression.DOTALL".
        NOTE: That alternate version in one line regular expression pattern \
        could be empty.

        **location**                 - Location to execute macro processing.

        **skip_self_file**           - If setted to "True" and this script \
                                       file is part of "location" this file \
                                       will be ignored.

        **extension**                - File extensions to handle. Others will \
                                       be excluded.

        **first_line_regex_pattern** - Regular expression pattern to \
                                       determine current version of given \
                                       text file.

        **one_line_regex_pattern**   - One line regular expression syntax to \
                                       replace.

        **more_line_regex_pattern**  - More line regular expression syntax to \
                                       replace.

        **encoding**                 - Encoding to use.

        **dry**                      - Indicates whether a dry run with \
                                       producing log output should be done.

        **_exclude_locations**       - Locations to exclude.

        **_new_version**             - Version description to convert to.

        Examples:

        >>> Replace(
        ...     location='non_existing_file'
        ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
        Traceback (most recent call last):
        ...
        boostnode.extension.native.FileError: Invalid path "...non_exist...

        >>> __test_globals__['__test_mode__'] = False
        >>> file = FileHandler(__test_folder__.path + '_initialize')
        >>> file.content = '#!/bin/python2.7\\n\\n# # python3.5 a\\nb\\n'
        >>> Replace(file) # doctest: +ELLIPSIS
        Object of "Replace" with file "..._initialize" to convert to "py...
        >>> __test_globals__['__test_mode__'] = True
    '''

    # region properties

    COMMAND_LINE_ARGUMENTS = (
        {'arguments': ('-p', '--path'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Defines files to convert. A directory or file path is '
                     'supported.',
             'dest': 'location',
             'metavar': 'PATH'}},
        {'arguments': ('-n', '--new-version'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Defines new version of converted files.',
             'dest': '_new_version',
             'metavar': 'VERSION'}},
        {'arguments': ('-s', '--skip-self-file'),
         'specification': {
             'action': 'store_true',
             'default': {'execute': '__initializer_default_value__'},
             'help': 'Determines if this file should be ignored for running '
                     'any macros.',
             'dest': 'skip_self_file'}},
        {'arguments': ('-y', '--dry'),
         'specification': {
             'action': 'store_true',
             'default': {'execute': '__initializer_default_value__'},
             'help': 'Define if there really should be done something.',
             'dest': 'dry'}},
        {'arguments': ('-e', '--extension'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'If setted only files with given extension will "
                            '''be parsed (default: "%s").' % '''
                            "__initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'extension',
             'metavar': 'FILE_EXTENSION'}},
        {'arguments': ('-a', '--exclude-locations'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Select locations which should be ignored. %s "
                            "doesn\\'t touch these files.' "
                            '% module_name.capitalize()'},
             'dest': '_exclude_locations',
             'metavar': 'PATHS'}},
        {'arguments': ('-f', '--first-line-regex-pattern'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines line pattern to determine current "
                            '''version of file to parse (default: "%s").' %'''
                            "__initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'first_line_regex_pattern',
             'metavar': 'REGEX'}},
        {'arguments': ('-o', '--one-line-regex-pattern'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines line to determine current version of "
                            '''file to parse (default: "%s").' % '''
                            "__initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'one_line_regex_pattern',
             'metavar': 'REGEX'}},
        {'arguments': ('-r', '--more-line-regex-pattern'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines line to determine current version of "
                            '''file to parse (default: "%s").' % '''
                            "__initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'more_line_regex_pattern',
             'metavar': 'REGEX'}},
        {'arguments': ('-g', '--encoding'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Define which encoding should be used (default: "
                            '''"%s").' % __initializer_default_value__.'''
                            "replace('%', '%%')"},
             'dest': 'encoding',
             'metavar': 'ENCODING'}})
    '''Defines options for manipulating the programs default behavior.'''

    # endregion

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> repr(Replace(
            ...     location=__file_path__, _new_version='python3.5'
            ... )) # doctest: +ELLIPSIS
            '...Replace...file "...macro.py" to ...to "python3.5".'
        '''
        return (
            'Object of "{class_name}" with {type} "{path}" to convert to '
            '"{new_version}".'.format(
                class_name=self.__class__.__name__,
                type=self.location.type, path=self.location.path,
                new_version=self._new_version))

    # # # endregion

    # # # region setter

    @JointPoint
# # python3.5
# #     def set_new_version(self: Self, version: builtins.str) -> builtins.str:
    def set_new_version(self, version):
# #
        '''
            Checks if an explicit new version was given or a useful should be \
            determined.

            **version** - New version of current text file. Could be \
                          "__determine_useful__" if it should be guessed.

            Returns new version.

            Examples:

            >>> replace = Replace(location=__file_path__)

            >>> replace.set_new_version(version='python3.5')
            'python3.5'

            >>> replace.new_version = '__determine_useful__'
            >>> replace._new_version # doctest: +ELLIPSIS
            'python...'

            >>> file = FileHandler(
            ...     location=__test_folder__.path + 'set_new_version')
            >>> file.content = (
            ...     '#!/usr/bin/env version\\n\\n# # alternate_version hans\\n'
            ...     'peter\\n')
            >>> replace = Replace(file)._convert_path()
            >>> replace.new_version = '__determine_useful__'
            >>> replace._new_version
            'version'

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> replace.location = __test_folder__
            >>> replace._exclude_locations = [__test_folder__]
            >>> replace.new_version = '__determine_useful__'
            >>> replace._new_version
            ''
        '''
        self._new_version = version
        if version == '__determine_useful__':
            self._new_version = self._determine_useful_version_in_location(
                location=self.location)
            if not self._new_version:
                __logger__.warning('No new version found to convert to.')
        return self._new_version

    @JointPoint
# # python3.5
# #     def set_exclude_locations(
# #         self: Self, paths: Iterable
# #     ) -> builtins.list:
    def set_exclude_locations(self, paths):
# #
        '''
            Converts all paths setted to "_exclude_locations" via string to \
            high level file objects.

            **paths** - A list of paths to exclude from processing the macro.

            Returns a list of file objects to ignore.

            Examples:

            >>> replace = Replace(location=__file_path__)

            >>> replace.exclude_locations = [
            ...     __file_path__, FileHandler('not_existing')]
            >>> replace._exclude_locations # doctest: +ELLIPSIS
            [Object of "Handler" with path "...macro.py" (type: file).]
        '''
        self._exclude_locations = []
        for path in paths:
            file = FileHandler(location=path)
            if file:
                self._exclude_locations.append(file)
        return self._exclude_locations

    # # # endregion

    # # endregion

    # # region protected

    # # # region runnable implementation

    @JointPoint
# # python3.5     def _run(self: Self) -> Self:
    def _run(self):
        '''
            Entry point for command line call of this program. Validates the \
            given input. Gives usage info or raises exception if the given \
            inputs don't make sense.

            Examples:

            >>> from copy import copy
            >>> sys_argv_backup = copy(sys.argv)

            >>> sys.argv[1:] = ['--path', __file_path__, '--skip-self-file']
            >>> Replace.run() # doctest: +ELLIPSIS
            Object of "Replace" with file "..." to convert to "...".

            >>> sys.arv = sys_argv_backup
        '''
        command_line_arguments = CommandLine.argument_parser(
            arguments=self.COMMAND_LINE_ARGUMENTS, module_name=__name__,
            scope={'os': os, 'module_name': __module_name__, 'self': self})
        return self._initialize(**self._command_line_arguments_to_dictionary(
            namespace=command_line_arguments))

    @JointPoint(InstancePropertyInitializer)
# # python3.5
# #     def _initialize(
# #         self: Self, location=None, skip_self_file=False, extension='',
# #         first_line_regex_pattern='(?P<constant_version_pattern>^#!.*?'
# #                                  '(?P<current_version>[a-zA-Z0-9\.]+))\n',
# #         one_line_regex_pattern='\n(?P<prefix># #) '
# #                                '(?P<alternate_version>[^\n ]+) ?'
# #                                '(?P<alternate_text>.*)\n'
# #                                '(?P<current_text>.*)(?:\n|\Z)',
# #         more_line_regex_pattern='(?s)\n(?P<prefix># #) '
# #                                 '(?P<alternate_version>[^ ]+)\n'
# #                                 '(?P<alternate_text>'
# #                                 '(?:(?:# # .*?\n)|'  # in brackets
# #                                 '(?:# #\n))+'  # in brackets
# #                                 ')(?P<current_text>.*?\n)# #(?:\n|\Z)',
# #         encoding=ENCODING, dry=False, _exclude_locations=(),
# #         _new_version='__determine_useful__', **keywords: builtins.object
# #     ) -> Self:
    def _initialize(
        self, location=None, skip_self_file=False, extension='',
        first_line_regex_pattern='(?P<constant_version_pattern>^#!.*?'
                                 '(?P<current_version>[a-zA-Z0-9\.]+))\n',
        one_line_regex_pattern='\n(?P<prefix># #) '
                               '(?P<alternate_version>[^\n ]+) ?'
                               '(?P<alternate_text>.*)\n'
                               '(?P<current_text>.*)\n',
        more_line_regex_pattern='(?s)\n(?P<prefix># #) '
                                '(?P<alternate_version>[^ ]+)\n'
                                '(?P<alternate_text>'
                                '(?:(?:# # .*?\n)|'  # in brackets
                                '(?:# #\n))+'  # in brackets
                                ')(?P<current_text>.*?\n)# #(?:\n|\Z)',
        encoding=ENCODING, dry=False, _exclude_locations=(),
        _new_version='__determine_useful__', **keywords
    ):
# #
        '''Triggers the conversion process with given arguments.'''

        # # # region properties

        '''Current location for deep code parsing.'''
        self.location = FileHandler(
            self.location, encoding=self.encoding, must_exist=True)
        '''NOTE: This additional declaration is needed to trigger setter.'''
        self.exclude_locations = self._exclude_locations
        '''
            New version to convert given files to. NOTE: This property can \
            only determined after all properties are set. This additional \
            declaration is needed to trigger setter.
        '''
        self.new_version = self._new_version
        '''Version of the giving source files.'''
        self._current_version = ''

        # # # endregion

        if not __test_mode__ and self._new_version:
            self._convert_path()
        return self

    # # # endregion

    # # # region boolean

    @JointPoint
# # python3.5
# #     def _in_exclude_location(
# #         self: Self, location: FileHandler
# #     ) -> builtins.bool:
    def _in_exclude_location(self, location):
# #
        '''
            Returns "True" if given location is in one of initially defined \
            exclude locations.

            Examples:

            >>> replace = Replace(location=__file_path__)

            >>> replace._exclude_locations = [__test_folder__]
            >>> replace._in_exclude_location(FileHandler(__test_folder__))
            True

            >>> replace._exclude_locations = [
            ...     FileHandler(__test_folder__.path + '_in_exclude_location')]
            >>> replace._in_exclude_location(FileHandler(__test_folder__))
            False
        '''
        for file in self._exclude_locations:
            if location == file or (file.is_directory() and location in file):
                __logger__.info(
                    'Ignore exclude location "%s".', location.path)
                return True
        return False

    # # # endregion

    # # # region core concern

    @JointPoint
# # python3.5
# #     def _determine_useful_version_in_location(
# #         self: Self, location: FileHandler
# #     ) -> builtins.str:
    def _determine_useful_version_in_location(self, location):
# #
        '''
            Determines a useful version for replacing if nothing explicit was \
            given.

            Examples:

            >>> folder = FileHandler(
            ...     location=__test_folder__.path +
            ...     '_determine_useful_version_in_location/sub')
            >>> folder.make_directories()
            True
            >>> file = FileHandler(location=folder.path + 'file')
            >>> file.content = 'hans\\n# # new_version peter\\nklaus\\n'
            >>> replace = Replace(location=__file_path__)

            >>> replace._exclude_locations = [file]
            >>> replace._determine_useful_version_in_location(location=folder)
            ''

            >>> replace._exclude_locations = []
            >>> replace.extension = 'not_existing'
            >>> replace._determine_useful_version_in_location(location=file)
            ''
        '''
        if not self._in_exclude_location(location):
            version = self._determine_useful_version_in_location_helper(
                location)
            if version:
                return version
        if location == self.location:
            __logger__.info('No macros found.')
        return ''

    @JointPoint
# # python3.5
# #     def _determine_useful_version_in_file(
# #         self: Self, file: FileHandler
# #     ) -> builtins.str:
    def _determine_useful_version_in_file(self, file):
# #
        '''
            Searches for first version replacement in macro language as good \
            guess for new version if no new version was defined explicitly.

            Examples:

            >>> replace = Replace(location=__file_path__)
            >>> file = FileHandler(
            ...     __test_folder__.path + '_determine_useful_version_in_file')
            >>> file.content = 'ä'
            >>> replace.encoding = 'ascii'

            >>> replace._determine_useful_version_in_file(file)
            ''
        '''
        content = file.get_content(encoding=self.encoding)
        match = regularExpression.compile(self.one_line_regex_pattern).search(
            content)
        if match is None:
            match = regularExpression.compile(
                self.more_line_regex_pattern
            ).search(content)
        if match:
            __logger__.info(
                'Detected "%s" as new version.',
                match.group('alternate_version'))
            return match.group('alternate_version')
        return ''

    @JointPoint
# # python3.5     def _convert_path(self: Self) -> Self:
    def _convert_path(self):
        '''
            Converts the given path to the specified format.

            Examples:

            >>> file = FileHandler(__test_folder__.path + '_convert_path')
            >>> file.content = ''
            >>> replace = Replace(location=file, _new_version='python2.7')
            >>> replace._exclude_locations = [file]

            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..._convert_path" to convert to "...

            >>> replace.location = __test_folder__
            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with directory "..." to convert to "...".

            >>> file.content = 'hans'
            >>> Replace(
            ...     file, _new_version='python3.5'
            ... )._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..._convert_path" to convert to ...

            >>> replace.location = file
            >>> replace._exclude_locations = []
            >>> file.content = ('#!/usr/bin/python3.5\\n'
            ...                 '\\n'
            ...                 '# # python2.7 hans\\n'
            ...                 'AB\\n')
            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..._convert_path" to convert to ...
            >>> file.content
            '#!/usr/bin/python2.7\\n\\n# # python3.5 AB\\nhans\\n'

            >>> file.content = ('#!/bin/python3.5\\n'
            ...                 '\\n'
            ...                 '# # python2.7\\n'
            ...                 '# # A\\n'
            ...                 'C\\n'
            ...                 'D\\n'
            ...                 '# #\\n')
            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..." to convert to "python2.7".
            >>> file.content
            '#!/bin/python2.7\\n\\n# # python3.5\\n# # C\\n# # D\\nA\\n# #\\n'

            >>> file.content = ('#!/bin/python2.7\\n'
            ...                 '\\n'
            ...                 '# # python3.5\\n'
            ...                 '# # A\\n'
            ...                 'B\\n'
            ...                 '#\\n'
            ...                 '# #\\n')
            >>> replace = Replace(
            ...     location=__test_folder__.path + '_convert_path',
            ...     _new_version='python3.5')
            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..." to convert to "python3.5".
            >>> file.content
            '#!/bin/python3.5\\n\\n# # python2.7\\n# # B\\n# # #\\nA\\n# #\\n'

            >>> file.content = ('#!/bin/python3.5\\n'
            ...                 '\\n'
            ...                 '# # python2.7\\n'
            ...                 '# # A\\n'
            ...                 '# #\\n'
            ...                 '# # B\\n'
            ...                 'B\\n'
            ...                 '# #\\n')
            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..." to convert to "python3.5".
            >>> file.content # doctest: +ELLIPSIS
            '#!/bin/python3.5\\n\\n# # python2.7\\n# # A\\n# #\\n# # B\\nB...'

            >>> file.content = ('#!/bin/python2.7\\n'
            ...                 '\\n'
            ...                 '# # python3.5\\n'
            ...                 '# # A\\n'
            ...                 'B\\n'
            ...                 '\\n'
            ...                 'C\\n'
            ...                 '# #\\n')
            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..." to convert to "python3.5".
            >>> file.content # doctest: +ELLIPSIS
            '#!/bin/python3.5\\n\\n# # python2.7\\n# # B\\n# #\\n# # C\\nA\...'

            >>> file.content = ('#!/bin/python2.7\\n'
            ...                 '\\n'
            ...                 '# # python3.5\\n'
            ...                 'A\\n')
            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..." to convert to "python3.5".
            >>> file.content
            '#!/bin/python3.5\\n\\n# # python2.7 A\\n\\n'

            >>> file.content = ('#!/bin/python2.7\\n'
            ...                 '\\n'
            ...                 '# # python3.5 A\\n'
            ...                 '\\n')
            >>> replace._convert_path() # doctest: +ELLIPSIS
            Object of "Replace" with file "..." to convert to "python3.5".
            >>> file.content
            '#!/bin/python3.5\\n\\n# # python2.7\\nA\\n'
        '''
        if not self._in_exclude_location(location=self.location):
            if(self.location.is_file() and (
                not self.extension or
                self.location.extension == self.extension)
               ):
                self._convert_file(file=self.location)
            else:
                self._convert_directory(directory=self.location)
        return self

    @JointPoint
# # python3.5
# #     def _convert_directory(self: Self, directory: FileHandler) -> Self:
    def _convert_directory(self, directory):
# #
        '''
            Walks through a whole directory and its substructure to convert \
            its text based files between different versions of marked \
            code-snippets.

            **directory** - the directory location with text-files which \
                            should be converted.

            Examples:

            >>> folder = FileHandler(
            ...     __test_folder__.path + '_convert_directory',
            ...     make_directory=True)
            >>> replace = Replace(location=__test_folder__)

            >>> replace._convert_directory(
            ...     __test_folder__
            ... ) # doctest: +ELLIPSIS
            Object of "Replace" with directory "..." to convert to "...".

            >>> replace.extension = 'not_existing'
            >>> FileHandler(folder.path + 'file').content = ''
            >>> replace._convert_directory(
            ...     __test_folder__
            ... ) # doctest: +ELLIPSIS
            Object of "Replace" with directory "..." to convert to "...".
        '''
        for file in directory:
            __logger__.debug('Check "%s".', file.path)
            if not self._in_exclude_location(location=file):
                if file.is_directory(allow_link=False):
                    self._convert_directory(directory=file)
                elif file.is_file(allow_link=False) and (
                    not self.extension or file.extension == self.extension
                ):
                    self._convert_file(file)
        return self

    @JointPoint
# # python3.5     def _convert_file(self: Self, file: FileHandler) -> Self:
    def _convert_file(self, file):
        '''
            Opens a given file and parses its content and convert it through \
            different versions of code snippets.

            **file** - the file to be converted.

            Examples:

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> Replace(
            ...     location=__file_path__, skip_self_file=True
            ... )._convert_file(
            ...     FileHandler(__file_path__)
            ... ) # doctest: +ELLIPSIS
            Object of "Replace" with file "...macro..." to convert to "...".
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...Skip self file...'
        '''
        self_file = FileHandler(
            location=inspect.currentframe().f_code.co_filename,
            respect_root_path=False)
        if self.skip_self_file and self_file == file:
            __logger__.info('Skip self file "%s".', self_file)
        else:
            self._convert_file_content(file)
        return self

    @JointPoint
# # python3.5
# #     def _convert_file_content(self: Self, file: FileHandler) -> Self:
    def _convert_file_content(self, file):
# #
        '''
            Converts source code of given file to new version.

            Examples:

            >>> file = FileHandler(
            ...     __test_folder__.path + '_convert_file_content')
            >>> replace = Replace(__test_folder__, encoding='ascii')

            >>> file.set_content('ä', encoding='latin_1') # doctest: +ELLIPSIS
            Object of "Handler" with path "..._convert_file_content" and ...
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'

            >>> replace._convert_file_content(file) # doctest: +ELLIPSIS
            Object of "Replace" with directory "..." to convert to "...".
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '... decode file "..._file_content" with given encoding "ascii"...'

            >>> file.set_content(
            ...     'a\\nä', encoding='latin_1'
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "..._convert_file_content" and ...
            >>> replace._convert_file_content(file) # doctest: +ELLIPSIS
            Object of "Replace" with directory "..." to convert to "...".
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...decode file "..._file_content" with given encoding "ascii"...'

            >>> file.content = '#!/usr/bin/env python3.5\\na'
            >>> replace.dry = True
            >>> replace._convert_file_content(file) # doctest: +ELLIPSIS
            Object of "Replace" with directory "..." to convert to "...".
        '''
# # python3.5         with builtins.open(
        with codecs.open(
            file.path, mode='r', encoding=self.encoding
        ) as file_handler:
            try:
                first_line = file_handler.readline()
            except builtins.UnicodeDecodeError:
                __logger__.warning(
                    'Can\'t decode file "%s" with given encoding "%s".',
                    file.path, self.encoding)
                return self
# # python3.5
# #             match = regularExpression.compile(
# #                 self.first_line_regex_pattern
# #             ).fullmatch(first_line)
            match = regularExpression.compile(
                '(?:%s)$' % self.first_line_regex_pattern
            ).match(first_line)
# #
            if match is None:
                __logger__.warning(
                    '"%s" hasn\'t path to version in first line.', file.path)
                return self
            self._current_version = match.group('current_version')
            new_interpreter = match.group('constant_version_pattern').replace(
                self._current_version, self._new_version)
            first_line = match.group().replace(
                match.group('constant_version_pattern'), new_interpreter)
            '''
                NOTE: Calling "read()" twice is necessary to work around a \
                python bug. First call only reads a part of corresponding \
                file. \
                NOTE: Catching an encoding error here isn't necessary, \
                because former "readline()" call has already loaded the full \
                file into buffer. An encoding error would already be throne.
            '''
            file_content = file_handler.read() + file_handler.read()
        __logger__.info(
            'Convert "{path}" from "{current_version}" to '
            '"{new_version}".'.format(
                path=file.path, current_version=self._current_version,
                new_version=self._new_version))
        file_content = '%s%s' % (first_line, regularExpression.compile(
            self.more_line_regex_pattern
        ).sub(self._replace_alternate_lines, file_content))
        if not self.dry:
            file.content = regularExpression.compile(
                self.one_line_regex_pattern
            ).sub(self._replace_alternate_line, file_content)
        return self

    @JointPoint
# # python3.5
# #     def _replace_alternate_lines(
# #         self: Self, match: type(regularExpression.compile('').match(''))
# #     ) -> builtins.str:
    def _replace_alternate_lines(self, match):
# #
        '''
            Replaces various numbers of code lines with its corresponding \
            code line in another version.

            **match** - is a regular expression match object with all needed \
                        infos about the current code snippet and its \
                        corresponding.
        '''
        if match.group('alternate_version') == self._new_version:
            '''
                "str.replace()" has to run over "current_text" twice. Two \
                consecutive lines with whitespace at the end of line aren't \
                matched in first run.
            '''
            return (
                '\n{prefix} {current_version}\n{prefix} {current_text}\n'
                '{alternate_text}{prefix}\n'.format(
                    prefix=match.group('prefix'),
                    current_version=self._current_version,
                    current_text=match.group('current_text').replace(
                        '\n', '\n%s ' % match.group('prefix')
                    )[:-builtins.len(match.group('prefix')) - 2].replace(
                        '\n%s \n' % match.group('prefix'),
                        '\n%s\n' % match.group('prefix')
                    ).replace(
                        '\n%s \n' % match.group('prefix'),
                        '\n%s\n' % match.group('prefix')
                    ).rstrip(), alternate_text=regularExpression.compile(
                        '\n%s ?' % String(match.group(
                            'prefix'
                        )).regex_validated.content
                    ).sub('\n', match.group(
                        'alternate_text'
                    ))[builtins.len(match.group('prefix')) + 1:]))
        return match.group()

    @JointPoint
# # python3.5
# #     def _replace_alternate_line(
# #         self: Self, match: type(regularExpression.compile('').match(''))
# #     ) -> builtins.str:
    def _replace_alternate_line(self, match):
# #
        '''
            Replaces one code line with its corresponding code line in \
            another version.

            **match** - is a regular expression match object with all needed \
                        infos about the current code snippet and its \
                        corresponding alternative.
        '''
        if match.group('alternate_version') == self._new_version:
            current_text = match.group('current_text')
            if current_text:
                current_text = ' ' + current_text
            return (
                '\n{prefix} {current_version}{current_text}\n{alternate_text}'
                '\n'.format(
                    prefix=match.group('prefix'),
                    current_version=self._current_version,
                    current_text=current_text,
                    alternate_text=match.group('alternate_text')))
        return match.group()

    @JointPoint
# # python3.5
# #     def _determine_useful_version_in_location_helper(
# #         self: Self, location: FileHandler
# #     ) -> builtins.str:
    def _determine_useful_version_in_location_helper(self, location):
# #
        '''
            Searches in files in given locations the first occurrences of a \
            useful conversion format.
        '''
        if location.is_directory():
            for sub_location in location:
                version = self._determine_useful_version_in_location(
                    location=sub_location)
                if version:
                    return version
        elif not self.extension or location.extension == self.extension:
            version = self._determine_useful_version_in_file(file=location)
            if version:
                return version
        return ''

    # # # endregion

    # # endregion

    # endregion

# endregion

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
