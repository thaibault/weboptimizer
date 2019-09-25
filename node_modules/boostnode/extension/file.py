#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''
    This module is a high level interface for interaction with file systems. \
    This class provides a full object oriented way to handle file system \
    objects. Besides a number of new supported interactions with the file \
    systems it offers all core file-system methods by the pythons native \
    "shutil" and "os" module as wrapper methods.
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

# # python3.5 import builtins
import __builtin__ as builtins
import ctypes
# # python3.5 from collections import Iterable
import codecs
from copy import deepcopy
import hashlib
import inspect
import mimetypes
import os
import re as regularExpression
import shutil
import stat
import sys
# # python3.5
# # from types import FunctionType as Function
# # from types import GeneratorType as Generator
# # from types import MethodType as Method
pass
# #

from distutils.dir_util import copy_tree as copy_to_existing_directory

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

# # python3.5
# # from boostnode import ENCODING
# # from boostnode.extension.native import Object, Iterable, String
# # from boostnode.extension.type import Self, SelfClass, SelfClassObject
from boostnode import ENCODING, convert_to_string, convert_to_unicode
from boostnode.extension.native import Object, Iterable, String, Dictionary
from boostnode.extension.type import Self
# #
from boostnode.paradigm.aspectOrientation import JointPoint
from boostnode.paradigm.objectOrientation import Class

# endregion


# region classes

class Handler(Class):

    '''
        The main class for initializing new file system objects to handle \
        them in an object oriented way.
    '''

    # region properties

    EXPORTABLE_ATTRIBUTES = (
        'path', 'name', 'type', 'timestamp', 'size', 'human_readable_size')
    EXPORTABLE_FILE_ATTRIBUTES = (
        'basename', 'encoding', 'extension', 'hash', 'extension_suffix',
        'mime_type')
    '''Attributes which results in platform independent value types.'''
    REGULAR_EXPRESSION_SIZE_FORMAT = '([0-9]+\.?[0-9]{{0,2}})\s*({units})'
    '''Pattern for supported formats to handle size of file system elements.'''
    FORMATS = {
        'Byte': {
            'notations': ('byte', 'b'),
            'decimal_factor': 1,
            'binary_factor': 1,
            'useful_range': (0, 1024)
        }, 'Kilobyte': {
            'notations': (
                'kb', 'kib',
                'kilobyte', 'kibibyte',
                'kbyte', 'kibyte',
                'kilob', 'kibib'),
            'decimal_factor': 10 ** 3,
            'binary_factor': 2 ** 10,
            'useful_range': (1024 + 1, 1024 ** 2)
        }, 'Megabyte': {
            'notations': (
                'mb', 'mib',
                'megabyte', 'mebibyte',
                'mbyte', 'mibyte',
                'megab', 'mebib'),
            'decimal_factor': 10 ** 6,
            'binary_factor': 2 ** 20,
            'useful_range': ((1024 ** 2) + 1, 1024 ** 3)
        }, 'Gigabyte': {
            'notations': (
                'gb', 'gib',
                'gigabyte', 'gibibyte',
                'gbyte', 'gibyte',
                'gigab', 'gibib'),
            'decimal_factor': 10 ** 9,
            'binary_factor': 2 ** 30,
            'useful_range': ((1024 ** 3) + 1, 1024 ** 4)
        }, 'Terabyte': {
            'notations': (
                'tb', 'tib',
                'terabyte', 'tebibyte',
                'tbyte', 'tibyte',
                'terab', 'tebib'),
            'decimal_factor': 10 ** 12,
            'binary_factor': 2 ** 40,
            'useful_range': ((1024 ** 4) + 1, 1024 ** 5)
        }, 'Petabyte': {
            'notations': (
                'pb', 'pib',
                'petabyte', 'pebibyte',
                'pbyte', 'pibyte',
                'petab', 'pebib'),
            'decimal_factor': 10 ** 15,
            'binary_factor': 2 ** 50,
            'useful_range': ((1024 ** 5) + 1, 1024 ** 6)
        }, 'Exabyte': {
            'notations': (
                'eb', 'eib',
                'exabyte', 'exbibyte',
                'ebyte', 'eibyte',
                'exab', 'exib'),
            'decimal_factor': 10 ** 18,
            'binary_factor': 2 ** 60,
            'useful_range': ((1024 ** 6) + 1, 1024 ** 7)
        }, 'Zettabyte': {
            'notations': (
                'zb', 'zib',
                'zettabyte', 'zebibyte',
                'zbyte', 'zibyte',
                'zettab', 'zebib'),
            'decimal_factor': 10 ** 21,
            'binary_factor': 2 ** 70,
            'useful_range': ((1024 ** 7) + 1, 1024 ** 8)
        }, 'Yottabyte': {
            'notations': (
                'yb', 'yib',
                'yottabyte', 'yobibyte',
                'ybyte', 'yibyte',
                'yottab', 'yobib'),
            'decimal_factor': 10 ** 24,
            'binary_factor': 2 ** 80,
            'useful_range': ((1024 ** 8) + 1, None)}}
    '''Supported formats to handle the size of file.'''
    BLOCK_SIZE_IN_BYTE = 4096
    '''Defines the size of an empty folder, a symbolic link or empty file.'''
    MAX_FILE_NAME_LENGTH = 255
    '''
        Defines the maximum number of chars containing in a file (or \
        directory) name.
    '''
    DECIMAL = False
    '''
        Defines the default format of current operating system for \
        calculating with file sizes.
    '''
    MAX_PATH_LENGTH = 32767
    '''Defines the maximum number of signs in a file path.'''
    MAX_SIZE_NUMBER_LENGTH = 24  # 10^21 byte = 1 Yottabyte (-1 byte)
    '''Defines the maximum number of digits for the biggest file-size.'''
    MEDIA_MIME_TYPE_PATTERN = 'audio/.+', 'video/.+'
    '''Defines all mime-types describing a media file.'''
    PORTABLE_DEFAULT_LINK_PATTERN = (
        "#!/bin/bash\n\n# {label} portable link file\n\nsize={size}\ntarget='"
        "{path}'\n\n'{executable_path}' --open \"$target\"")
    '''
        This file pattern is used for all files which should easily open the \
        referenced file with a useful program. You shouldn't use placeholder \
        more than once. Because portable-file-checks could be fail. For bash \
        functionality you can declare a bash variable and use how often you \
        need. Internal bash variable pattern: "$bash_variable".
    '''
    PORTABLE_WINDOWS_DEFAULT_LINK_PATTERN = (
        "{label} portable link file\n\n$size={size}\ntarget='"
        "{path}'\n\n'{executable_path}' --open \"$target\"")
    '''Sames as "PORTABLE_DEFAULT_LINK_PATTERN" for windows only.'''
    PORTABLE_MEDIA_LINK_PATTERN = (
        '[playlist]\n\nFile1=$path\nTitle1=$name\nLength1=$size\n\n$label '
        'portable link file')
    '''
        This file pattern is used for all media files which should easily \
        open the referenced media with a useful program on the one hand and \
        behave like a real media file on the other hand (e.g. in drag and \
        drop them into a media player's gui). Like in \
        "PORTABLE_DEFAULT_LINK_PATTERN" you shouldn't use placeholders twice.
    '''
# # python3.5     _root_path = os.sep
    _root_path = convert_to_string(os.sep)
    '''
        Defines a virtual root path for all methods. Through these class \
        objects aren't locations except in "_root_path" available.
    '''

    # endregion

    # region static methods

    # # region public

    # # # region getter

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5     def get_root(cls: SelfClass) -> SelfClassObject:
    def get_root(cls):
        '''Returns a file object referencing to the virtual root path.'''
        return cls(
            location=cls._root_path, respect_root_path=False,
            output_with_root_prefix=True)

    # # # endregion

    # # # region setter

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5
# #     def set_root(
# #         cls: SelfClass, location: (SelfClassObject, builtins.str),
# #         make_directory=False
# #     ) -> SelfClass:
    def set_root(cls, location, make_directory=False):
# #
        '''
            Normalizes root path.

            **location**       - Location to set for new sandbox path.

            **make_directory** - If set to "True" given location will be \
                                 created if not exists.

            Returns current class.

            Examples:

            >>> root_backup = Handler.get_root()

            >>> Handler.set_root(
            ...     __test_folder__.path + 'set_root', make_directory=True
            ... ) # doctest: +ELLIPSIS
            <class '...Handler'>
            >>> Handler.get_root().path # doctest: +ELLIPSIS
            '...'

            >>> Handler.set_root(root_backup) # doctest: +ELLIPSIS
            <class '...Handler'>
        '''
        cls._root_path = cls(
            location, respect_root_path=False, output_with_root_prefix=True,
            make_directory=make_directory, must_exist=True
        ).path
        return cls

    # # # endregion

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def convert_size_format(
# #         cls: SelfClass, size: (builtins.int, builtins.float),
# #         format='byte', decimal=None, formats=None
# #     ) -> builtins.float:
    def convert_size_format(
        cls, size, format='byte', decimal=None, formats=None
    ):
# #
        '''
            Converts between file size formats.

            **format**  - Determines the returning file size unit.

            **decimal** - Determines if the decimal or binary interpretation \
                          should be used.

            **formats** - If provided this formats will be used instead of \
                          "cls.FORMATS".

            Returns computed size.

            Examples:

            >>> Handler.convert_size_format(size=100, decimal=True)
            100.0

            >>> Handler.convert_size_format(
            ...     size=1024, format='kb', decimal=True)
            1.024

            >>> Handler.convert_size_format(
            ...     size=2 * 1024 ** 2, format='MB', decimal=False)
            2.0

            >>> Handler.convert_size_format(size=0)
            0.0

            >>> Handler.convert_size_format(size=5.2, formats={})
            5.2
        '''
        size = builtins.float(size)
        if decimal is None:
            decimal = cls.DECIMAL
        if formats is None:
            formats = cls.FORMATS
        factor_type = 'decimal_factor' if decimal else 'binary_factor'
        for name, properties in formats.items():
            for notation in properties['notations']:
                if format.lower() == notation:
                    return size / properties[factor_type]
        return size

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def determine_size_from_string(
# #         cls: SelfClass, size_and_unit: builtins.str, format='byte',
# #         decimal=None
# #     ) -> (builtins.float, builtins.bool):
    def determine_size_from_string(
        cls, size_and_unit, format='byte', decimal=None
    ):
# #
        '''
            Becomes a size with unit as string. And gives it as float or \
            "False" (if given string hasn't match any number with a useful \
            measure) back.

            **size_and_unit** - Given size with unit as string.

            **format**        - Format to returns.

            **decimal**       - Indicates whether decimal computation should \
                                be used.

            Returns size if determined otherwise "False".

            Examples:

            >>> Handler.determine_size_from_string(size_and_unit='10 MB')
            10485760.0

            >>> Handler.determine_size_from_string(
            ...     size_and_unit='2KB', format='MB')
            0.001953125

            >>> Handler.determine_size_from_string(size_and_unit='2 byte')
            2.0

            >>> Handler.determine_size_from_string(
            ...     size_and_unit='2 bte', decimal=True)
            False
        '''
        if decimal is None:
            decimal = cls.DECIMAL
# # python3.5
# #         match = regularExpression.compile(
# #             cls.REGULAR_EXPRESSION_SIZE_FORMAT.format(
# #                 units=cls.determine_regex_units(formats=cls.FORMATS)
# #             )).fullmatch(size_and_unit.lower())
        match = regularExpression.compile('(?:%s)$' %
            cls.REGULAR_EXPRESSION_SIZE_FORMAT.format(
                units=cls.determine_regex_units(formats=cls.FORMATS)
            )).match(size_and_unit.lower())
# #
        if match:
            return cls.convert_size_format(
                size=cls.determine_byte_from_other(
                    size=builtins.float(match.group(1)),
                    given_format=match.group(2),
                    decimal=decimal),
                format=format, decimal=decimal, formats=cls.FORMATS)
        return False

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def determine_byte_from_other(
# #         cls: SelfClass, size: builtins.float, formats=None,
# #         given_format='byte', decimal=None
# #     ) -> builtins.float:
    def determine_byte_from_other(
        cls, size, formats=None, given_format='byte', decimal=None
    ):
# #
        '''
            Converts a given size format to byte format.

            **size**         - Size to convert.

            **given_format** - Input format.

            **decimal**      - Indicates whether decimal or binary \
                               computation should be used.

            Returns computed size.

            Examples:

            >>> Handler.DECIMAL = False

            >>> Handler.determine_byte_from_other(size=10.0, given_format='MB')
            10485760.0

            >>> Handler.determine_byte_from_other(size=10.0, formats={})
            10.0
        '''
        if formats is None:
            formats = cls.FORMATS
        if decimal is None:
            decimal = cls.DECIMAL
        factor_type = 'decimal_factor' if decimal else 'binary_factor'
        for name, properties in formats.items():
            for notation in properties['notations']:
                if given_format.lower() == notation:
                    return size * properties[factor_type]
        return size

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def determine_regex_units(
# #         cls: SelfClass, formats=None
# #     ) -> builtins.str:
    def determine_regex_units(cls, formats=None):
# #
        '''
            Returns a regular expression for validation if a given size \
            format is valid. The pattern is created depending on the given \
            size formats as dictionary.

            **formats** - Formats to use. Defaults to "cls.FORMATS".

            Examples:

            >>> Handler.determine_regex_units(
            ...     Handler.FORMATS
            ... ) # doctest: +ELLIPSIS
            '...tb...

            >>> Handler.determine_regex_units() # doctest: +ELLIPSIS
            '...tb...
        '''
        if formats is None:
            formats = cls.FORMATS
        units = ''
        for name, properties in formats.items():
            if units:
                units += '|'
            units += '|'.join(properties['notations'])
        return units

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def determine_special_path_values(
# #         cls: SelfClass, operating_system=''
# #     ) -> builtins.tuple:
    def determine_special_path_values(cls, operating_system=''):
# #
        '''
            Gives all platform dependent symbols for special file system \
            locations.

            **operating_system** - If not provided operating system will be \
                                   determined.

            Examples:

            >>> Handler.determine_special_path_values(operating_system='unix')
            ('~',)

            >>> Handler.determine_special_path_values() # doctest: +ELLIPSIS
            (...)

            >>> Handler.determine_special_path_values('windows')
            ()
        '''
        from boostnode.extension.system import Platform
        if not operating_system:
            operating_system = Platform().operating_system
        if operating_system == 'windows':
            return ()
        return '~',

    # # endregion

    # # region protected

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _sort_directory_to_end(
# #         cls: SelfClass, files: Iterable, recursive_in_link: builtins.bool
# #     ) -> builtins.list:
    def _sort_directory_to_end(cls, files, recursive_in_link):
# #
        '''
            Sorts the given list of files. Files come first and folders later.

            Examples:

            >>> current_location = Handler()
            >>> temporary_file = Handler(
            ...     __test_folder__.path + '_sort_directory_to_end')
            >>> temporary_file.content = 'A'
            >>> [temporary_file,
            ...  current_location] == Handler._sort_directory_to_end([
            ...     current_location, temporary_file],
            ...     False)
            True

            >>> Handler._sort_directory_to_end([], True)
            []
        '''
        sorted_files = []
        for file in files:
            if file.is_directory(allow_link=recursive_in_link):
                sorted_files.append(file)
            else:
                sorted_files.reverse()
                sorted_files.append(file)
                sorted_files.reverse()
        return sorted_files

    # # endregion

    # endregion

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __init__(
# #         self: Self, location=None, make_directory=False, must_exist=False,
# #         encoding='', respect_root_path=True, output_with_root_prefix=False,
# #         has_extension=True, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> None:
    def __init__(
        self, location=None, make_directory=False, must_exist=False,
        encoding='', respect_root_path=True, output_with_root_prefix=False,
        has_extension=True, *arguments, **keywords
    ):
# #
        '''
            Initialize a new instance of a given file system object by path.

            **location**                - is path or "Handler" referencing to \
                                          file object.

            **make_directory**          - Make directory of path object if \
                                          given location doesn't exists. \
            **must_exist**              - Throws an exception if the given \
                                          path doesn't exists if this \
                                          argument is "True".

            **encoding**                - Define encoding for reading and \
                                          writing files.

            **respect_root_path**       - Defines if a previous statically \
                                          defined virtual root path should be \
                                          considered.

            **output_with_root_prefix** - Defines if "get_path()" returns a \
                                          path with or without root path \
                                          prefixed.

            **has_extension**           - Defines whether path interpretation \
                                          should assume a file extension.

            Every additional argument or keyword will be forwarded to the \
            "make_directory()" method if "make_directory" is set to "True".

            Examples:

            >>> root_backup = Handler.get_root()

            >>> Handler(
            ...     location=__test_folder__.path + '__init__not_existing',
            ...     must_exist=True
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.FileError: Invalid path...not_existin...

            >>> handler = Handler(
            ...     location=__test_folder__.path + '__init__not_existing',
            ...     make_directory=True)
            >>> handler # doctest: +ELLIPSIS
            Object of "Handler" with path "...__init__not_existing..."...
            >>> os.path.isdir(handler.path)
            True

            >>> Handler(
            ...     location=__test_folder__.path + '__init__not_existing2'
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...init__not_existing2...(type: u...

            >>> Handler(location=__file_path__).basename
            'file'

            >>> Handler(location='/not//real').path # doctest: +ELLIPSIS
            '...not...real'

            >>> Handler(location=Handler()).path # doctest: +ELLIPSIS
            '...boostnode...extension...'

            >>> Handler.set_root(
            ...     __test_folder__.path + '__init__root_directory',
            ...     make_directory=True
            ... ) # doctest: +ELLIPSIS
            <class '...Handler'>

            >>> location = Handler('/__init__a')
            >>> location.path # doctest: +ELLIPSIS
            '...__init__a...'
            >>> location._path # doctest: +ELLIPSIS
            '...__init__root_directory...__init__a...'

            >>> location = Handler(
            ...     __test_folder__.path  + '__init__root_directory/a',
            ...     respect_root_path=False)
            >>> location.path # doctest: +ELLIPSIS
            '...a'
            >>> location._path # doctest: +ELLIPSIS
            '...__init__root_directory...a...'

            >>> Handler(
            ...     __test_folder__.path + '__init__a',
            ...     respect_root_path=False, must_exist=True
            ... ) # doctest: +ELLIPSIS +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.FileError: Invalid path "...__init__a...

            >>> Handler.set_root(root_backup) # doctest: +ELLIPSIS
            <class '...Handler'>
        '''

        # # # region properties

        '''
            Properties to realize an iteration over all elements in a given \
            directory.
        '''
        self._current_element_index = 0
        self._next_element_index = 0
        '''Defines the encoding for writing and reading text-based files.'''
        if not encoding:
            encoding = ENCODING
        self._encoding = encoding
        self._respect_root_path = respect_root_path
        self._output_with_root_prefix = output_with_root_prefix
        '''Saves the initially given path without any transformations.'''
        self._initialized_path = self._initialize_location(location)
        self._initialize_path()
        self._prepend_root_path()
        self._handle_path_existence(
            location, make_directory, must_exist, arguments, keywords
        )._initialize_platform_dependencies()
        '''Indicates if current file object has an file extension.'''
        if(builtins.len(self.name) and '.' not in self.name[1:] or
           self.is_directory()):
            self._has_extension = False
        else:
            self._has_extension = has_extension

        # # # endregion

    @JointPoint
# # python3.5     def __copy__(self: Self) -> Generator:
    def __copy__(self):
        '''
            Invokes if the current object is tried to copy.

            Returns a copy of this object.

            Examples:

            >>> from copy import copy
            >>> copy(Handler()) # doctest: +ELLIPSIS
            Object of "Handler" with path "..." (type: directory).
        '''
        return self.__class__(
            location=self.path, encoding=self._encoding,
            respect_root_path=self._respect_root_path,
            output_with_root_prefix=self._output_with_root_prefix,
            has_extension=self._has_extension)

    @JointPoint
# # python3.5     def __iter__(self: Self) -> Generator:
    def __iter__(self):
        '''
            Invokes if the current object is tried to iterate.

            Returns an iterator object.

            Examples:

            >>> for file in Handler(location='.'):
            ...     print('"' + str(file) + '"') # doctest: +ELLIPSIS
            "...file.py..."
        '''
        return (element for element in self.list())

    @JointPoint
# # python3.5     def __bool__(self: Self) -> builtins.bool:
    def __nonzero__(self):
        '''
            Invokes when the object is tried to convert in a boolean value.

            Examples:

            >>> bool(Handler())
            True

            >>> bool(Handler(
            ...     location=__test_folder__.path +
            ...     'nonzero_not_existing_file'))
            False

            >>> bool(Handler(location=__file_path__))
            True

            >>> bool(__test_folder__)
            True
        '''
        return self.is_element()

    @JointPoint
# # python3.5
# #     def __eq__(self: Self, other: builtins.object) -> builtins.bool:
    def __eq__(self, other):
# #
        '''
            Invokes if a comparison of two "Handler" objects is done.

            **other** - Another file handler or file path to be checked again \
                        current file object.

            Returns the boolean result.

            Examples:

            >>> Handler(
            ...     location=__test_folder__.path + '__eq__a/b'
            ... ) == Handler(
            ...     location=__test_folder__.path + '__eq__a//b/')
            True

            >>> Handler(
            ...     location=__test_folder__.path + '__eq__a/b'
            ... ) == Handler(
            ...     location=__test_folder__.path + '__eq__a/b/c')
            False

            >>> __test_folder__.path + '__eq__a/b' == Handler(
            ...     location=__test_folder__.path + '__eq__a/b')
            False
        '''
        if builtins.isinstance(other, self.__class__):
            return self._path == other._path
        return False

    @JointPoint
# # python3.5     def __hash__(self: Self) -> builtins.int:
    def __hash__(self):
        '''
            Returns a hash value for current path as string.

            Examples:

            >>> isinstance(hash(Handler()), int)
            True
        '''
        return builtins.hash(self._path)

    @JointPoint
# # python3.5
# #     def __getitem__(self: Self, key: builtins.int) -> SelfClassObject:
    def __getitem__(self, key):
# #
        '''
            Triggers if an element is tried to get with the "[]" operator.

            **key** - Defines which object in current directory should be \
                      returned.

            Returns the requested file object.

            Examples:

            >>> Handler()[0] # doctest: +ELLIPSIS
            Object of "Handler" with path "..." (...).
        '''
        return builtins.tuple(self.list())[key]

    @JointPoint
# # python3.5
# #     def __delitem__(self: Self, key: builtins.int) -> builtins.bool:
    def __delitem__(self, key):
# #
        '''
            Deletes the specified item from the file system.

            **key** - Defines which object in current directory should be \
                      deleted.

            Examples:

            >>> directory = Handler(
            ...     __test_folder__.path + '__delitem__', make_directory=True)
            >>> file = Handler(directory.path + 'file')
            >>> file.content = ''
            >>> file.is_file()
            True
            >>> del directory[0]
        '''
        return self[key].remove_deep()

    @JointPoint
# # python3.5
# #     def __contains__(
# #         self: Self, item: (SelfClassObject, builtins.str)
# #     ) -> builtins.bool:
    def __contains__(self, item):
# #
        '''
            Is triggered if you want to determine if an object is in a \
            "Handler" object.

            **item** - Checks if given file object or file path is present in \
                       current directory.

            Returns the boolean result.

            Examples:

            >>> Handler(location=__file_path__) in Handler(
            ...     location=__file_path__
            ... ).directory
            True

            >>> Handler(
            ...     location=__test_folder__.path + 'contains_not_existing.py',
            ... ) in Handler()
            False

            >>> 'not_existing_file' in Handler()
            False

            >>> __file_path__ in Handler()
            True
        '''
        if builtins.isinstance(item, self.__class__):
            return item in self.list()
        else:
            for element in self:
                if item in (element._path, element.relative_path):
                    return True
        return False

    @JointPoint
# # python3.5     def __len__(self: Self) -> builtins.int:
    def __len__(self):
        '''
            Is triggered if you use the pythons native "builtins.len()" \
            function on a "Handler" object.

            Returns the number of objects in current directory or size of \
            currently pointing to file.

            Examples:

            >>> len(Handler(
            ...     location=__test_folder__.path +
            ...     'len_not_existing_location'))
            0

            >>> len(Handler(location=__file_path__)) > 1
            True

            >>> len(Handler(Handler().directory.path)) > 1
            True
        '''
        if self.is_directory():
            '''
                NOTE: We have to call "list()" explicit to avoid an endless \
                recursion.
            '''
            return builtins.len(builtins.list(self.list()))
        elif self.is_file():
            return builtins.int(self.size)
        return 0

    @JointPoint
# # python3.5     def __str__(self: Self) -> builtins.str:
    def __str__(self):
        '''
            Is triggered if this object should be converted to string.

            Returns the computed string version.

            Examples:

            >>> str(Handler(location=__file_path__)) # doctest: +ELLIPSIS
            '...file.py'
        '''
        return self.path

    @JointPoint
# # python3.5     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
        '''
            Invokes if this object should describe itself by a string.

            Returns the computed string.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> repr(Handler(location=__file_path__)) # doctest: +ELLIPSIS
            'Object of "Handler" with path "...file.py" ... (type: file).'

            >>> link = Handler(
            ...     __test_folder__.path + '__repr__link')
            >>> if Platform().operating_system == 'windows':
            ...     repr(link)
            ... else:
            ...     created = Handler(
            ...         location=__file_path__
            ...     ).make_symbolic_link(link)
            ...     repr(link) # doctest: +ELLIPSIS
            'Object of "Handler" with path ...'
        '''
        type = 'type: %s' % self.type
        if self.is_symbolic_link():
            type = 'link to "{path}"'.format(path=self.read_symbolic_link())
        return 'Object of "{class_name}" with path "{path}" and initially '\
            'given path "{given_path}" ({type}).'.format(
                class_name=self.__class__.__name__, path=self.path,
                given_path=self._initialized_path, type=type)

    # # # endregion

    # # # region getter

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_hash(self: Self, algorithm='md5') -> builtins.str:
    def get_hash(self, algorithm='md5'):
        '''
            Returns encoding for current file handler. If no encoding was set \
            "boostnode.ENCODING" is default.

            Examples:

            >>> Handler(location=__file_path__).hash # doctest: +ELLIPSIS
            '...'
        '''
# # python3.5
# #         return builtins.getattr(hashlib, algorithm)(builtins.open(
# #             self._path, 'rb'
# #         ).read()).hexdigest()
        return builtins.getattr(hashlib, algorithm)(builtins.open(
            convert_to_string(self._path), 'rb'
        ).read()).hexdigest()
# #

    @JointPoint
# # python3.5     def get_encoding(self: Self) -> builtins.str:
    def get_encoding(self):
        '''
            Returns encoding for current file handler. If no encoding was set \
            "boostnode.ENCODING" is default.

            Examples:

            >>> Handler().encoding
            'utf_8'

            >>> Handler().get_encoding()
            'utf_8'

            >>> handler = Handler(
            ...     __test_folder__.path + 'get_encoding'
            ... ).set_content('test', encoding='ascii') # doctest: +ELLIPSIS
            >>> handler.encoding
            'ascii'
        '''
        return self._encoding

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_extension(self: Self) -> builtins.str:
    def get_extension(self):
        '''
            Returns the current file extension or an empty string if current \
            file hasn't an extension separated by a dot, current handler \
            points to a none existing file object or a directory.

            Examples:

            >>> Handler().extension
            ''

            >>> Handler().get_extension()
            ''

            >>> Handler(location=__file_path__).extension
            'py'
        '''
        if self._has_extension:
            return self.name[builtins.len(self.basename) + 1:]
        return ''

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_timestamp(self: Self) -> builtins.float:
    def get_timestamp(self):
        '''
            Getter method for time of last modification of the file system \
            object referenced by "Handler".

            Examples:

            >>> isinstance(Handler(location=__file_path__).timestamp, float)
            True
        '''
# # python3.5         return os.stat(self._path).st_mtime
        return os.stat(convert_to_string(self._path)).st_mtime

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_number_of_lines(self: Self) -> builtins.int:
    def get_number_of_lines(self):
        '''
            Returns the number of lines in the file content referenced by the \
            "Handler" object.

            Examples:

            >>> file = Handler(__test_folder__.path + 'get_lines_test1')

            >>> file.content = 'a\\nb\\nc\\n'
            >>> file.number_of_lines
            3

            >>> file.content = ' '
            >>> file.number_of_lines
            1

            >>> file.content = ''
            >>> file.number_of_lines
            0

            >>> file.content = 'a\\nb\\nca\\nb\\nc'
            >>> file.get_number_of_lines()
            5
        '''
        lines = 0
# # python3.5
# #         with builtins.open(self._path, mode='r') as file:
        with builtins.open(convert_to_string(
            self._path
        ), mode='r') as file:
# #
            for line in file:
                lines += 1
        return lines

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_size(
# #         self: Self, limit=0, follow_link=True,
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> builtins.float:
    def get_size(self, limit=0, follow_link=True, *arguments, **keywords):
# #
        '''
            Calculates the used space for this object by the first request of \
            the property "size". If the current handler points to none \
            existing file on file system zero will be returned. This method \
            has the additionally all parameters as \
            "self.convert_size_format()".

            **limit**       - Break and return current calculated size if \
                              limit is reached or doesn't if limit is 0. \
                              Limit is interpreted in bytes.

            **follow_link** - Indicates whether to walk into links to \
                              aggregate size.

            Each additional argument or keyword will be forwarded to the \
            "self.convert_size_format()" method.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> test_size = Handler(__test_folder__.path + 'get_size')
            >>> test_size.content = ' '
            >>> test_size.size
            1.0

            >>> test_size.content = ''
            >>> test_size.size
            0.0

            >>> test_size.get_size()
            0.0

            >>> test_size.get_size(limit=1000, follow_link=False)
            0.0

            >>> size = Handler(location='.').get_size(100)
            >>> size > 100
            True
            >>> isinstance(size, float)
            True

            >>> size = Handler(location='.').get_size(0)
            >>> size > 0
            True
            >>> isinstance(size, float)
            True

            >>> size = Handler(location='.').get_size(limit=200)
            >>> size > 200
            True
            >>> isinstance(size, float)
            True

            >>> size = Handler(location='.').size
            >>> size > 0
            True
            >>> isinstance(size, float)
            True

            >>> size = Handler('/').get_size(0)
            >>> size > 0
            True

            >>> size = Handler('/').get_size(limit=1)
            >>> size > 0
            True

            >>> link = Handler(__test_folder__.path + 'get_size_link')
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     created = Handler().make_symbolic_link(link)
            ...     size = link.get_size(1, follow_link=False)
            ...     size > 0
            True
        '''
        size = 0
# # python3.5         if os.path.ismount(self._path):
        if os.path.ismount(convert_to_string(self._path)):
            size = self.disk_used_space
        elif self.is_directory(allow_link=follow_link):
            size = self.BLOCK_SIZE_IN_BYTE
            for file in self:
                if not limit or size < limit:
                    recursive_keywords = deepcopy(keywords)
                    recursive_keywords['format'] = 'byte'
                    '''
                        Take this method type by another instance of this \
                        class via introspection.
                    '''
                    size += builtins.getattr(
                        file, inspect.stack()[0][3]
                    )(
                        limit, follow_link=False, *arguments,
                        **recursive_keywords
                    ) + self.BLOCK_SIZE_IN_BYTE
        elif self.is_symbolic_link() and not follow_link:
            size = self.BLOCK_SIZE_IN_BYTE
        else:
# # python3.5             size = os.path.getsize(self._path)
            size = os.path.getsize(convert_to_string(self._path))
        return builtins.float(self.convert_size_format(
            size, *arguments, **keywords))

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_dummy_size(self: Self, label='') -> builtins.int:
    def get_dummy_size(self, label=''):
        '''
            Calculates the potential dummy size for a portable link pointing \
            to this object.

            **label** - Is the actual used label for marking the text based \
                        portable link files.

            Examples:

            >>> isinstance(Handler(location=__file_path__).get_dummy_size(
            ...     label='LinkFile'), int)
            True

            >>> isinstance(
            ...     Handler(location=__file_path__).dummy_size,
            ...     int)
            True

            >>> isinstance(Handler().dummy_size, int)
            True
        '''
        if self.is_file():
            return builtins.len(self.portable_link_content % label)
        return 0

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_human_readable_size(self: Self, size=None) -> builtins.str:
    def get_human_readable_size(self, size=None):
# #
        '''
            Represents a given file size in byte as human readable string.

            **size** - If a size is given size of current file object will be \
                       ignored and that size will be used.

            Examples:

            >>> Handler.DECIMAL = False

            >>> a = Handler(
            ...     __test_folder__.path + 'get_human_readable_size_a',
            ...     make_directory=True)
            >>> b = Handler(__test_folder__.path + 'get_human_readable_size_a')
            >>> a.human_readable_size == str(b.get_size(format='kb')) + ' kb'
            True

            >>> Handler().get_human_readable_size(size=100)
            '100.0 byte'

            >>> Handler().get_human_readable_size(size=(1024 ** 1) + 1)
            '1.0 kb'

            >>> Handler().get_human_readable_size(size=(1024 ** 2) + 1)
            '1.0 mb'

            >>> Handler().get_human_readable_size(size=(1024 ** 3) + 1)
            '1.0 gb'

            >>> Handler().get_human_readable_size(size=5 * (1024 ** 3) + 1)
            '5.0 gb'

            >>> Handler().get_human_readable_size(size=(1024 ** 4) + 1)
            '1.0 tb'

            >>> Handler().get_human_readable_size(size=(1024 ** 5) + 1)
            '1.0 pb'

            >>> Handler().get_human_readable_size(size=(1024 ** 6) + 1)
            '1.0 eb'

            >>> Handler().get_human_readable_size(size=(1024 ** 7) + 1)
            '1.0 zb'

            >>> Handler().get_human_readable_size(size=(1024 ** 8) + 1)
            '1.0 yb'

            >>> Handler().get_human_readable_size(size=3 * (1024 ** 8) + 1)
            '3.0 yb'

            >>> handler = Handler()
            >>> from copy import copy
            >>> formats_backup = copy(handler.FORMATS)
            >>> handler.FORMATS = {}
            >>> handler.get_human_readable_size(size=3) # doctest: +ELLIPSIS
            '3... byte'
            >>> handler.FORMATS = formats_backup
        '''
        if size is None:
            size = self.size
        for name, properties in self.FORMATS.items():
            if(size >= properties['useful_range'][0] and
               (properties['useful_range'][1] is None or
                size <= properties['useful_range'][1])
               ):
                return '%s %s' % (builtins.str(builtins.round(
                    self.__class__.convert_size_format(
                        size, format=properties['notations'][0]
                    ), 2)
                ), properties['notations'][0])
        return '%s byte' % builtins.str(builtins.round(size, 2))

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_type(self: Self) -> builtins.str:
    def get_type(self):
        '''
            Determines the type of the current object.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> Handler(location=__file_path__).type
            'file'

            >>> Handler().type
            'directory'

            >>> test_type = Handler(__test_folder__.path + 'get_type')
            >>> test_type.type
            'undefined'

            >>> test_type.content = 'hans'
            >>> test_type.type
            'file'

            >>> test_type.content = 'hans'
            >>> test_type.get_type()
            'file'

            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     created = test_type.make_symbolic_link(
            ...         __test_folder__.path + 'get_type_link')
            ...     Handler(
            ...         __test_folder__.path + 'get_type_link'
            ...     ).type == 'symbolicLink'
            True

            >>> target = Handler(__test_folder__.path + 'get_type_link')
            >>> test_type.make_portable_link(
            ...     __test_folder__.path + 'get_type_link', force=True)
            True
            >>> target.type
            'portableLink'
        '''
        if self.is_portable_link():
            return 'portableLink'
        if self.is_symbolic_link():
            return 'symbolicLink'
        if self.is_directory():
            return 'directory'
        if self.is_file():
            return 'file'
        return 'undefined'

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_mime_type(
# #         self: Self, default_type='text', default_subtype='plain', web=False
# #     ) -> builtins.str:
    def get_mime_type(
        self, default_type='text', default_subtype='plain', web=False
    ):
# #
        '''
            Determines the mime-type of the current object.

            **default_type** - Defines the returned fallback mime type if it \
                               couldn't be determined.

            **web**          - If web is set to "True" fallback mime type is \
                               "application/octet-stream".

            Returns the current object mime-type. The format is \
            "type/subtype".

            Examples:

            >>> Handler(location=__file_path__).mime_type # doctest: +ELLIPSIS
            'text/...python'

            >>> Handler(
            ...     location=__file_path__
            ... ).get_mime_type() # doctest: +ELLIPSIS
            'text/...python'

            >>> Handler().mime_type
            ''

            >>> handler = Handler(
            ...     location=__test_folder__.path +
            ...     'get_mime_type.unknownType')
            >>> handler.content = ''
            >>> handler.mime_type
            'text/x-unknownType'

            >>> handler.get_mime_type(web=True)
            'application/octet-stream'

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'get_mime_type.html')
            >>> handler.content = ''
            >>> handler.mime_type
            'text/html'

            >>> handler = Handler(location=__test_folder__.path + '.html')
            >>> handler.get_mime_type(web=True)
            'text/html'
        '''
        mime_type = mimetypes.guess_type(self._path)[0]
        if builtins.isinstance(mime_type, builtins.str):
# # python3.5             return mime_type
            return convert_to_unicode(mime_type)
        if web:
            if self.name in ('.html', '.htm'):
                return 'text/html'
            return 'application/octet-stream'
        if self.is_file():
            subtype = default_subtype
            if self.extension:
                subtype = 'x-' + self.extension
            return default_type + '/' + subtype
        return ''

    @JointPoint
# # python3.5
# #     def get_path(
# #         self: Self, location=None, respect_root_path=None,
# #         output_with_root_prefix=None
# #     ) -> builtins.str:
    def get_path(
        self, location=None, respect_root_path=None,
        output_with_root_prefix=None
    ):
# #
        '''
            Determines path of current "Handler" object or returns the path \
            of a given "Handler" instance.

            **location**                - If a handle object is provided the \
                                          saved path will be given back.

            **respect_root_path**       - Indicates whether we check the \
                                          sandbox feature for this request.

            **output_with_root_prefix** - Indicates whether we should prefix \
                                          the resulting path with the path to \
                                          sandbox.

            Examples:

            >>> Handler(location=__file_path__).path # doctest: +ELLIPSIS
            '...file.py'

            >>> Handler(location=__file_path__).get_path(
            ...     location=__test_folder__.path + 'get_path/path/'
            ... ) # doctest: +ELLIPSIS
            '...get_path...path...'
        '''
        taken_output_with_root_prefix = output_with_root_prefix
        if output_with_root_prefix is None:
            taken_output_with_root_prefix = self._output_with_root_prefix
        if location is None:
            if not self._path.endswith(os.sep) and self.is_directory():
                self._path += os.sep
            '''
                NOTE: If the given file was initialized without respect to \
                current root path the content of "_path" could be smaller \
                than the root path. So simply return the internal path in \
                this case.
            '''
            if(taken_output_with_root_prefix or not self._path.startswith(
                self.__class__._root_path)
               ):
                return self._path
            return self._path[builtins.len(
                self.__class__._root_path
            ) - builtins.len(os.sep):]
        return self._get_path(
            location, respect_root_path,
            output_with_root_prefix=taken_output_with_root_prefix)

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_relative_path(
# #         self: Self, *arguments: builtins.object, context=None,
# #         **keywords: builtins.object
# #     ) -> builtins.str:
    def get_relative_path(self, context=None, *arguments, **keywords):
# #
        '''
            Returns the relative path of current "Handler" object depending \
            on the current location.

            **context** - If provided the relative path will be determined \
                          relative to this context. If nothing or "None" is \
                          given current directory will be used.

            Additional arguments or keywords will be forwarded to \
            "os.path.relpath()".

            Examples:

            >>> Handler(
            ...     location=__file_path__
            ... ).relative_path # doctest: +ELLIPSIS
            '...file.py'

            >>> Handler().relative_path
            '.'

            >>> Handler().relative_path
            '.'

            >>> Handler().get_relative_path()
            '.'

            >>> Handler(
            ...     location='../../'
            ... ).relative_path == '..' + os.sep + '..'
            True

            >>> Handler(
            ...     location='../../'
            ... ).get_relative_path(context='../')
            '..'
        '''
        if context is None:
# # python3.5
# #             return os.path.relpath(self._path, *arguments, **keywords)
# #         return os.path.relpath(
# #             self._path, *arguments,
# #             start=self.__class__(location=context)._path, **keywords)
            return convert_to_unicode(os.path.relpath(convert_to_string(
                self._path
            ), *arguments, **keywords))
        return convert_to_unicode(os.path.relpath(
            convert_to_string(self._path), *arguments,
            start=self.__class__(location=context)._path, **keywords))
# #

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_directory(
# #         self: Self, output_with_root_prefix=None
# #     ) -> SelfClassObject:
    def get_directory(self, output_with_root_prefix=None):
# #
        '''
            Determines the current path of the Directory object without file.

            **output_with_root_prefix** - Indicates whether the path to \
                                          sandbox should set as prefix.

            Examples:

            >>> root_backup = Handler.get_root()

            >>> Handler(
            ...     location=__file_path__
            ... ).directory.path # doctest: +ELLIPSIS
            '...boostnode...extension...'

            >>> Handler(
            ...     location=__file_path__
            ... ).get_directory().path # doctest: +ELLIPSIS
            '...boostnode...extension...'

            >>> same = True
            >>> for handler in Handler():
            ...     if handler.directory.path != Handler()[0].directory.path:
            ...         same = False
            ...         break
            >>> same
            True

            >>> Handler.set_root(__test_folder__.path) # doctest: +ELLIPSIS
            <class '...Handler'>
            >>> Handler('/').directory.path == os.sep
            True

            >>> Handler.set_root(root_backup) # doctest: +ELLIPSIS
            <class '...Handler'>
        '''
        directory_path = self.get_path(
            output_with_root_prefix=output_with_root_prefix)
        subtrahend = builtins.len(self.get_name(
            output_with_root_prefix=output_with_root_prefix))
        if directory_path.endswith(os.sep) and builtins.len(
            directory_path
        ) > builtins.len(os.sep):
            subtrahend += builtins.len(os.sep)
        if subtrahend:
            return self.__class__(location=directory_path[:-subtrahend])
        return self.__class__(location=directory_path)

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_name(
# #         self: Self, *arguments: builtins.object,
# #         output_with_root_prefix=None, force_windows_behavior=False,
# #         **keywords: builtins.object
# #     ) -> builtins.str:
    def get_name(self, *arguments, **keywords):
# #
        '''
            Determines the current file name without directory path. Same \
            possible parameters as native python method "os.path.name()".

            **output_with_root_prefix** - Indicates if determined name should \
                                          be stripped from a path prefixed \
                                          with path to current sandbox.

            **force_windows_behavior**  - If set to "True" windows behavior \
                                          will be forced.

            Returns the determined file object name.

            Examples:

            >>> Handler(location=__file_path__).name
            'file.py'

            >>> Handler().name
            'extension'

            >>> Handler().get_name()
            'extension'

            >>> handler = Handler('C:')
            >>> handler._path = 'C:'
            >>> handler.get_name(
            ...     force_windows_behavior=True)
            'C:'
        '''
        from boostnode.extension.system import Platform
# # python3.5
# #         pass
        keywords_dictionary = Dictionary(content=keywords)
        output_with_root_prefix, keywords = \
        keywords_dictionary.pop_from_keywords(
            name='output_with_root_prefix')
        force_windows_behavior, keywords = \
        keywords_dictionary.pop_from_keywords(
            name='force_windows_behavior', default_value=False)
# #
        path = self.get_path(output_with_root_prefix=output_with_root_prefix)
        if builtins.len(path) and path.endswith(os.sep):
            path = path[:-builtins.len(os.sep)]
# # python3.5
# #         if((Platform().operating_system == 'windows' or
# #             force_windows_behavior) and regularExpression.compile(
# #                 '[A-Za-z]:'
# #             ).fullmatch(path)
# #            ):
        if((Platform().operating_system == 'windows' or
            force_windows_behavior) and regularExpression.compile(
                '[A-Za-z]:$'
            ).match(path)):
# #
            return path
# # python3.5
# #         return os.path.basename(path, *arguments, **keywords)
        return convert_to_unicode(os.path.basename(convert_to_string(
            path
        ), *arguments, **keywords))
# #

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_basename(
# #         self: Self, *arguments: builtins.object,
# #         output_with_root_prefix=None, **keywords: builtins.object
# #     ) -> builtins.str:
    def get_basename(self, *arguments, **keywords):
# #
        '''
            Determines the current file name without directory path and file \
            extension. Same possible parameters as native python method \
            "os.path.name()".

            **output_with_root_prefix** - Indicates if determined name should \
                                          be stripped from a path prefixed \
                                          with path to current sandbox.

            Additional arguments and keywords will be forwarded to \
            "os.path.name()".

            Examples:

            >>> Handler(location=__file_path__).basename
            'file'

            >>> Handler().basename
            'extension'

            >>> Handler().get_basename()
            'extension'
        '''
# # python3.5
# #         pass
        output_with_root_prefix, keywords = Dictionary(
            content=keywords
        ).pop_from_keywords(name='output_with_root_prefix')
# #
        if self._has_extension:
# # python3.5
# #             return os.path.splitext(os.path.basename(
# #                 self.get_path(
# #                     output_with_root_prefix=output_with_root_prefix
# #                 ), *arguments, **keywords)
# #             )[0]
            return convert_to_unicode(os.path.splitext(os.path.basename(
                convert_to_string(self.get_path(
                    output_with_root_prefix=output_with_root_prefix
                ), *arguments, **keywords)
            ))[0])
# #
        return self.name

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_free_space(self: Self) -> builtins.int:
    def get_free_space(self):
        '''
            Return free space of folder or drive (in bytes).

            Examples:

            >>> file_area_space = round(Handler(
            ...     location=__file_path__
            ... ).free_space, 2)
            >>> directory_space = round(Handler().free_space, 2)
            >>> isinstance(file_area_space, type(directory_space))
            True

            >>> isinstance(
            ...     Handler(location='../').free_space,
            ...     (long, int) if 'long' in dir(builtins) else int)
            True

            >>> isinstance(
            ...     Handler(location='../').get_free_space(),
            ...     (long, int) if 'long' in dir(builtins) else int)
            True
        '''
        return self._get_platform_dependent_free_and_total_space()[0]

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_disk_used_space(self: Self) -> builtins.int:
    def get_disk_used_space(self):
        '''Determines used space of current path containing disk.'''
        disk_status = self._get_platform_dependent_free_and_total_space()
        return disk_status[1] - disk_status[0]

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_content(
# #         self: Self, mode='r', strict=False, offset=0, limit=-1, whence=0,
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> (builtins.str, builtins.bytes, Generator):
    def get_content(
        self, mode='r', strict=False, offset=0, limit=-1, whence=0,
        *arguments, **keywords):
# #
        '''
            Returns the file content of a text-file. Accepts all arguments \
            python's native "builtins.open()" or "codecs.open()" accepts. If \
            current file doesn't exists an empty string will be returned. \
            Note that this method shouldn't be used for binary files. If \
            current handler points to an directory containing files will be \
            returned as list.

            **mode**   - Mode for opening current file (if not pointing to a \
                         directory).

            **strict** - Indicates whether encoding should through an \
                         exception.

            **offset** - Offset for part of file to get (default: 0).

            **limit**  - Maximal content till offset to retrieve -1 (default) \
                         means to read to the end.

            **whence** - This is optional and defaults to 0 which means \
                         absolute file positioning, other values are 1 which \
                         means seek relative to the current position and 2 \
                         means seek relative to the file's end.

            Every additional argument or keyword will be forwarded to \
            "builtins.open()".

            Examples:

            >>> Handler(location=__file_path__).content # doctest: +ELLIPSIS
            '#!/...python...'

            >>> handler = Handler(location=__file_path__)
            >>> handler.get_content(
            ...     mode='r', encoding='utf_8'
            ... ) # doctest: +ELLIPSIS
            '#!/...python...'

            >>> handler._encoding
            'utf_8'

            >>> Handler(location=__file_path__, encoding='utf_8').get_content(
            ...     mode='r'
            ... ) # doctest: +ELLIPSIS
            '#!/...python...'

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'get_content_not_existing')

            >>> handler.get_content(
            ...     strict=True
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.FileError: ...
            >>> handler.get_content()
            ''

            >>> Handler().content # doctest: +ELLIPSIS
            <generator object list at 0x...>

            >>> Handler().get_content(mode='r') # doctest: +ELLIPSIS
            <generator object list at 0x...>

            >>> handler = Handler(__test_folder__.path + 'get_content')

            >>> handler.content = ''
            >>> handler.get_content(mode='r+b') == b''
            True

            >>> handler.content = ' äüöß hans'

            >>> handler.get_content(
            ...     encoding='ascii', strict=True
            ... ) # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            UnicodeDecodeError: 'ascii' codec can't decode byte ...

            >>> handler.content
            '  hans'

            >>> handler.content = 'hans'

            >>> handler.get_content(offset=1)
            'ans'

            >>> handler.get_content(offset=1, limit=1)
            'a'

            >>> handler.get_content(offset=1, limit=2)
            'an'

            >>> handler.get_content(offset=1, limit=-1)
            'ans'

            >>> handler.get_content(offset=-2, whence=2)
            'ns'

            >>> handler.get_content(offset=-2, limit=1, whence=2)
            'n'

            >>> handler.get_content(offset=-5, limit=1, whence=2)
            ''

            >>> handler.get_content(offset=-5, limit=4, whence=2)
            'han'

            >>> handler.get_content(offset=0, limit=-1) == handler.get_content(
            ...     offset=0, limit=-1)
            True
        '''
        if self.is_file():
            self._path = self._get_ending_delimter_trimmed()
            if 'b' in mode:
# # python3.5
# #                 with builtins.open(
# #                     self._path, mode, *arguments, **keywords
# #                 ) as file:
                with builtins.open(
                    convert_to_string(self._path), mode, *arguments,
                    **keywords
                ) as file:
# #
                    difference = self._apply_safe_offset(offset, whence, file)
                    if limit == -1:
                        return file.read()
                    return file.read(limit - difference)
            else:
                if 'encoding' in keywords:
                    self._encoding = keywords['encoding']
                else:
                    keywords['encoding'] = self._encoding
                errors = 'strict' if strict else 'ignore'
# # python3.5
# #                 with builtins.open(
# #                     self._path, mode, *arguments, errors=errors, **keywords
# #                 ) as file:
                with codecs.open(
                    convert_to_string(self._path), mode, *arguments,
                    errors=errors, **keywords
                ) as file:
# #
                    difference = self._apply_safe_offset(offset, whence, file)
                    if limit == -1:
# # python3.5
# #                         return file.read()
# #                     return file.read(limit)
                        return convert_to_unicode(file.read())
                    return convert_to_unicode(file.read(limit - difference))
# #
        elif self.is_directory():
            return self.list()
        if strict:
            raise __exception__(
                'Could only get content of file or directory (not "%s").',
                self.path)
        return ''

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_portable_link_pattern(
# #         self: Self, force_windows_behavior=False
# #     ) -> builtins.str:
    def get_portable_link_pattern(self, force_windows_behavior=False):
# #
        '''
            Determines the portable link file content pattern. With the file \
            independent placeholder "executable_path" replaced.

            **force_windows_behavior** - If set to "True" this method will \
                                         force windows behavior on none \
                                         windows operating systems.

            Examples:

            >>> Handler().portable_link_pattern # doctest: +ELLIPSIS
            '...portable ...'

            >>> Handler().get_portable_link_pattern(
            ...     force_windows_behavior=True
            ... ) # doctest: +ELLIPSIS
            '...portable ...'

            >>> handler = Handler(location=__file_path__)
            >>> handler.portable_link_pattern # doctest: +ELLIPSIS
            '...portable ...'

            >>> Handler(
            ...     location=__test_folder__.path +
            ...         'get_portable_link_pattern_media.mp3'
            ... ).portable_link_pattern # doctest: +ELLIPSIS
            '[playlist]\\n\\nFile1=...'
        '''
        from boostnode.extension.system import Platform
        pattern = self.PORTABLE_DEFAULT_LINK_PATTERN
        if Platform().operating_system == 'windows' or force_windows_behavior:
            pattern = self.PORTABLE_WINDOWS_DEFAULT_LINK_PATTERN
        if self.is_media():
            pattern = self.PORTABLE_MEDIA_LINK_PATTERN
        return pattern.format(
            executable_path=os.path.abspath(sys.argv[0]),
            label='{label}', size='{size}', path='{path}')

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_portable_regex_link_pattern(self: Self) -> builtins.str:
    def get_portable_regex_link_pattern(self):
# #
        '''
            Determines the portable regular expression link file content \
            pattern. All placeholder will be replaced with a useful regular \
            expression pattern to check given file contents against the \
            portable link pattern.

            Examples:

            >>> Handler().portable_regex_link_pattern # doctest: +ELLIPSIS
            '...portable...'

            >>> Handler().get_portable_regex_link_pattern(
            ...     ) # doctest: +ELLIPSIS
            '...portable...'
        '''
        return String(self.portable_link_pattern).get_regex_validated(
            exclude_symbols=('{', '}', '-')
        ).content.format(
            size='(?P<size>[0-9]+)', label='(?P<label>.*?)',
            path='(?P<path>.*?)')

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_portable_link_content(
# #         self: Self, label='%s', relative=None, target_path=''
# #     ) -> builtins.str:
    def get_portable_link_content(
        self, label='%s', relative=None, target_path=''
    ):
# #
        '''
            Returns the final portable link content depending on the current \
            file referenced by "self.path".

            **label**       - Label for better distinction with other \
                              text-based files.

            **relative**    - triggers if target should be referenced \
                              relative path. If "True" relative path will be \
                              determined from current working directory, if a \
                              path or Handler object is provided this \
                              location will be used as context to determine \
                              relative path, if "Self" is provided target \
                              location will be used as context and if "False" \
                              (default) path will be referenced absolute.

            **target_path** - this method is only needed if relative is \
                              setted to "Self".

            Examples:

            >>> Handler().portable_link_content # doctest: +ELLIPSIS
            '...portable...'

            >>> Handler().get_portable_link_content(
            ...     label='test-label (%s)') # doctest: +ELLIPSIS
            '...test-label (%s)...'
        '''
        return self.portable_link_pattern.format(
            label=label, size=builtins.int(self.size),
            path=self._determine_relative_path(
                relative, target_path
            ).replace('%', '%%'),
            name=self.name.replace('%', '%%'))

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_extension_suffix(self: Self) -> builtins.str:
    def get_extension_suffix(self):
        '''
            Returns the extension of a file or directory (empty string). The \
            difference to "self.get_extension()" is that the delimiter point \
            is added if necessary.

            Examples:

            >>> Handler().extension_suffix
            ''

            >>> Handler().get_extension_suffix()
            ''

            >>> handler = Handler(__test_folder__.path + 'test.ext')
            >>> handler.content = 'test'
            >>> handler.get_extension_suffix()
            '.ext'

            >>> Handler(__test_folder__.path + 'test.ext').extension_suffix
            '.ext'

            >>> Handler(__test_folder__.path + 'test').extension_suffix
            ''
        '''
        return (os.extsep + self.extension) if self._has_extension else ''

    # # # endregion

    # # # region setter

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def set_timestamp(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def set_timestamp(self, *arguments, **keywords):
# #
        '''
            Sets the modification time of current file object to current \
            time. If it was permitted and successful "True" will be returned \
            and "False" otherwise.

            Additional arguments or keywords will be forwarded to "os.utime()".

            Examples:

            >>> import time
            >>> directory = Handler(
            ...     __test_folder__.path + 'touch', make_directory=True)
            >>> old_timestamp = directory.timestamp
            >>> time.sleep(0.01) # doctest: +SKIP

            >>> directory.timestamp = None
            >>> old_timestamp != directory.timestamp # doctest: +SKIP
            True

            >>> directory.timestamp = 1330, 1332

            >>> directory.set_timestamp(None)
            True

            >>> directory.set_timestamp()
            True

            >>> os_utime_backup = os.utime
            >>> del os.utime
            >>> directory.set_timestamp()
            False
            >>> os.utime = os_utime_backup
        '''
# # python3.5         pass
        if not arguments: arguments = None,
        try:
# # python3.5
# #             os.utime(self._path, *arguments, **keywords)
            os.utime(convert_to_string(self._path), *arguments, **keywords)
# #
        except(builtins.AttributeError, builtins.NotImplementedError):
            return False
        return True

    @JointPoint
# # python3.5
# #     def set_encoding(
# #         self: Self, encoding: builtins.str, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> Self:
    def set_encoding(self, encoding, *arguments, **keywords):
# #
        '''
            Set encoding for a text-base file if current instance refers to \
            one. This method serves as wrapper method for "set_content()".

            **encoding** - Encoding description.

            Additional arguments and keywords will be forwarded to \
            "self.set_content()".

            Examples:

            >>> test_file = Handler(
            ...     __test_folder__.path + 'set_encoding_test_encoding')
            >>> test_file.content = 'hans and peter'

            >>> test_file.encoding = 'utf_8'

            >>> test_file.set_encoding('utf_8') # doctest: +ELLIPSIS
            Object of "Handler" with path "..." ...
        '''
        return self.set_content(
            content=self.content, encoding=encoding, *arguments, **keywords)

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def set_content(
# #         self: Self, content: (builtins.str, builtins.bytes), mode=None,
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> Self:
    def set_content(self, content, mode=None, *arguments, **keywords):
# #
        '''
            Returns the file content of a text-file. Accepts all arguments \
            python's native "builtins.open()" or "codecs.open()" accepts. If \
            current file doesn't exists an empty string will be returned. \
            Note that this method shouldn't be used for binary files. If \
            current handler points to an directory containing files will be \
            returned as list.

            **content** - Content to write in current file.

            **mode**    - File mode used for writing in file.

            Additional arguments and keywords are forwarded to \
            "builtins.open()".

            Examples:

            >>> handler = Handler(__test_folder__.path + 'set_content_file')
            >>> handler.content = 'hans'
            >>> handler.content
            'hans'

            >>> with open(handler.path, mode='r') as file:
            ...     file.read()
            'hans'

            >>> handler.content = 'A'
            >>> with open(handler.path, mode='r') as file:
            ...     file.read()
            'A'

            >>> handler.content += 'A'
            >>> with open(handler.path, mode='r') as file:
            ...     file.read()
            'AA'

            >>> handler.content
            'AA'

            >>> handler.set_content('AA') # doctest: +ELLIPSIS
            Object of "Handler" with path "..." ...

            >>> handler.set_content('hans', mode='w') # doctest: +ELLIPSIS
            Object of "Handler" with path "..." ...

            >>> handler.set_content(b'hans', mode='w+b') # doctest: +ELLIPSIS
            Object of "Handler" with path "..." ...

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.set_content('hans')
            ... else:
            ...     handler.set_content(b'hans') # doctest: +ELLIPSIS
            Object of "Handler" with path "..." ...
            >>> # #
            >>> handler.content
            'hans'

            >>> Handler().set_content('AA') # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.FileError: Set content is only ...

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.content = str(chr(1))
            ... else:
            ...     handler.content = bytes(
            ...         chr(1), ENCODING
            ...     ) # doctest: +ELLIPSIS
            >>> # #
        '''
        mode = self._prepare_content_status(mode, content)
        self._path = self._get_ending_delimter_trimmed()
        if 'b' in mode:
            with builtins.open(
                self._path, mode, *arguments, **keywords
            ) as file_handler:
                file_handler.write(content)
        else:
            if 'encoding' not in keywords:
                keywords['encoding'] = self._encoding
            else:
                self._encoding = keywords['encoding']
# # python3.5
# #             with builtins.open(
# #                 self._path, mode, *arguments, **keywords
# #             ) as file_handler:
# #                 file_handler.write(content)
            with codecs.open(
                convert_to_string(self._path), mode, *arguments, **keywords
            ) as file_handler:
                if not builtins.isinstance(content, builtins.unicode):
                    content = convert_to_unicode(content)
                file_handler.write(content)
# #
        return self

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def set_directory(
# #         self: Self, location: (SelfClassObject, builtins.str),
# #         *arguments: builtins.object, respect_root_path=None,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def set_directory(self, location, *arguments, **keywords):
# #
        '''
            This function could be understand as wrapper method for "move()".

            **location** - New directory location for current file object.

            Additional arguments and keywords are forwarded to "self.move()".

            Examples:

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'set_directory',
            ...     make_directory=True)

            >>> handler.directory = (
            ...     __test_folder__.path + 'set_directory_edited')
            >>> handler.is_directory()
            True
            >>> handler.name
            'set_directory'
            >>> handler.directory.path # doctest: +ELLIPSIS
            '...set_directory_edited...'

            >>> new_location = Handler(
            ...     location=__test_folder__.path + 'set_directory2')
            >>> handler.directory = new_location
            >>> handler.is_directory()
            True
            >>> handler.name
            'set_directory'
            >>> handler.directory.path # doctest: +ELLIPSIS
            '...set_directory2...'
            >>> new_location.is_directory()
            True

            >>> new_location = Handler(
            ...     location=__test_folder__.path + 'set_directory3')
            >>> handler.set_directory(new_location)
            True
            >>> handler.name
            'set_directory'
            >>> handler.directory.path # doctest: +ELLIPSIS
            '...set_directory3...'
            >>> new_location.is_directory()
            True
        '''
# # python3.5
# #         pass
        respect_root_path, keywords = Dictionary(
            content=keywords
        ).pop_from_keywords(name='respect_root_path')
# #
        return self.move(
            target=self.get_path(
                location, respect_root_path
            ) + os.sep + self.name, *arguments, **keywords)

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def set_name(
# #         self: Self, name: builtins.str, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def set_name(self, name, *arguments, **keywords):
# #
        '''
            This function could be understand as wrapper method for "move()".

            **name** - New name for current file object.

            Additional arguments and keywords are forwarded to "self.move()".

            Examples:

            >>> handler = Handler(
            ...     __test_folder__.path + 'set_name', make_directory=True)
            >>> handler.name = 'set_name_edited'
            >>> handler.is_directory()
            True
            >>> handler.name
            'set_name_edited'

            >>> handler.set_name('set_name_edited2')
            True
            >>> handler.is_directory()
            True
            >>> handler.name
            'set_name_edited2'

            >>> handler = Handler(__test_folder__.path + 'set_name.e')
            >>> handler.content = 'A'
            >>> handler.name = 'set_name.ext'
            >>> handler.is_file()
            True
            >>> handler.name
            'set_name.ext'
            >>> handler.basename
            'set_name'
        '''
        return self.move(
            target=self.directory.path + name, *arguments, **keywords)

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def set_basename(
# #         self: Self, basename: builtins.str, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def set_basename(self, basename, *arguments, **keywords):
# #
        '''
            This function could be understand as wrapper method for \
            "set_name()".

            **basename** - New basename.

            Additional arguments and keywords are forwarded to \
            "self.set_name()".

            Examples:

            >>> handler = Handler(
            ...     __test_folder__.path + 'set_basename3',
            ...     make_directory=True)
            >>> handler.basename = 'set_basename_edited3'
            >>> handler.name
            'set_basename_edited3'

            >>> handler = Handler(
            ...     __test_folder__.path + 'set_basename4',
            ...     make_directory=True)
            >>> handler.set_basename('set_basename_edited4')
            True
            >>> handler.basename
            'set_basename_edited4'

            >>> handler = Handler(__test_folder__.path + 'set_basename5.e')
            >>> handler.content = 'A'
            >>> handler.basename = 'set_basename_edited5'
            >>> handler.name
            'set_basename_edited5.e'
            >>> handler.basename
            'set_basename_edited5'
        '''
        return self.set_name(
            name=basename + self.extension_suffix, *arguments, **keywords)

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def set_extension(
# #         self: Self, extension: builtins.str, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def set_extension(self, extension, *arguments, **keywords):
# #
        '''
            This function could be understand as wrapper method for \
            "set_name()".

            **extension** - New file extension.

            Additional arguments and keywords are forwarded to "self.name()".

            Examples:

            >>> handler = Handler(__test_folder__.path + 'set_extension.ext')
            >>> handler.content = 'A'
            >>> handler.extension
            'ext'
            >>> handler.extension = 'mp3'
            >>> handler.is_file()
            True
            >>> handler.name
            'set_extension.mp3'
            >>> handler.extension
            'mp3'

            >>> handler.set_extension('wav')
            True
            >>> handler.extension
            'wav'

            >>> handler.set_extension('')
            True
        '''
        if extension:
            self._has_extension = True
            return self.set_name(
                name=self.basename + os.extsep + extension, *arguments,
                **keywords)
        return self.is_element()

    @JointPoint
# # python3.5
# #     def set_path(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def set_path(self, *arguments, **keywords):
# #
        '''
            Serves as wrapper function for the "move" method.

            Additional arguments and keywords are forwarded to "self.move()".

            Examples:

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'set_path',
            ...     make_directory=True)
            >>> handler.path = __test_folder__.path + 'set_path_moved'
            >>> Handler(
            ...     location=__test_folder__.path + 'set_path_moved'
            ... ).is_directory()
            True

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'set_path2',
            ...     make_directory=True)
            >>> handler.set_path(
            ...     target=__test_folder__.path + 'set_path_moved2')
            True
            >>> Handler(
            ...     location=__test_folder__.path + 'set_path_moved2'
            ... ).is_directory()
            True
        '''
        return self.move(*arguments, **keywords)

    # # # endregion

    # # # region boolean

    @JointPoint
# # python3.5
# #     def is_same_file(
# #         self: Self, other_location: SelfClassObject
# #     ) -> builtins.bool:
    def is_same_file(self, other_location):
# #
        '''
            A simple replacement of the os.path.samefile() function not \
            existing on the windows platform.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> Handler().is_same_file(Handler())
            True

            >>> if Platform().operating_system != 'windows':
            ...     same_file_backup = os.path.samefile
            ...     del os.path.samefile
            >>> Handler().is_same_file(Handler())
            True
            >>> if Platform().operating_system != 'windows':
            ...     os.path.samefile = same_file_backup
        '''
        other_location = self.__class__(location=other_location)
        try:
# # python3.5
# #             return os.path.samefile(self._path, other_location._path)
            return os.path.samefile(
                convert_to_string(self._path), other_location._path)
# #
        except builtins.AttributeError:
            return self == other_location

    @JointPoint
# # python3.5
# #     def is_directory(
# #         self: Self, allow_link=True, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def is_directory(self, allow_link=True, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.path.isdir()" method in an \
            object oriented way and adds the "link" parameter.

            **link** - triggers if symbolic links to directories also \
                       evaluates to "True".

            Returns "True" if path is an existing directory.

            Examples:

            >>> Handler().is_directory()
            True

            >>> Handler(location=__file_path__).is_directory()
            False

            >>> Handler(
            ...     location=__test_folder__.path + 'ä_is_directory',
            ...     make_directory=True
            ... ).is_directory()
            True
        '''
        if allow_link:
# # python3.5
# #             return os.path.isdir(self._path, *arguments, **keywords)
            return os.path.isdir(convert_to_string(
                self._path
            ), *arguments, **keywords)
# #
        return not self.is_symbolic_link() and\
            self.is_directory(allow_link=True, *arguments, **keywords)

    @JointPoint
# # python3.5
# #     def is_file(
# #         self: Self, allow_link=True, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def is_file(self, allow_link=True, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.path.isfile()" method in an \
            object oriented way. And adds the "link" parameter.

            **link** - triggers if symbolic links also evaluates to "True".

            Returns "True" if path is an existing regular file.

            Examples:

            >>> Handler(location=__file_path__).is_file()
            True

            >>> Handler().is_file()
            False

            >>> Handler().is_file(allow_link=False)
            False
        '''
        path = self._get_ending_delimter_trimmed()
        if allow_link:
# # python3.5             pass
            path = convert_to_string(path)
            return (
                os.path.isfile(path, *arguments, **keywords) or
                os.path.islink(path, *arguments, **keywords))
        return (
            not self.is_symbolic_link() and
            self.is_file(allow_link=True, *arguments, **keywords))

    @JointPoint
# # python3.5
# #     def is_symbolic_link(
# #         self: Self, allow_portable_link=True, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def is_symbolic_link(
        self, allow_portable_link=True, *arguments, **keywords
    ):
# #
        '''
            Implements the pythons native "os.path.islink()" method in an \
            object oriented way and adds the "portable_link" parameter.

            **portable_link** - triggers if portable links also evaluates to \
                                "True".

            Returns "True" if path refers to a directory entry that is a link \
            file. Always "False" for symbolic links if they are not \
            supported.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> target = Handler(__test_folder__.path + 'is_symbolic_link')
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     created = Handler(
            ...         location=__file_path__
            ...     ).make_symbolic_link(target, force=True)
            ...     target.is_symbolic_link()
            True

            >>> file = Handler(__test_folder__.path + 'is_symbolic_link_not')
            >>> file.content = ''
            >>> file.is_symbolic_link()
            False

            >>> file = Handler(
            ...     __test_folder__.path + 'is_symbolic_link_not2',
            ...     make_directory=True)
            >>> file.is_symbolic_link()
            False

            >>> file = Handler(
            ...     location=__test_folder__.path + 'is_symbolic_link_not3')
            >>> Handler(location=__file_path__).make_portable_link(
            ...     target=file, force=True)
            True

            >>> file.is_symbolic_link(allow_portable_link=False)
            False

            >>> file.is_symbolic_link()
            True
        '''
        path = self._get_ending_delimter_trimmed()
        if allow_portable_link:
            return (
                self.is_symbolic_link(allow_portable_link=False) or
                self.is_portable_link())
# # python3.5
# #         return os.path.islink(path, *arguments, **keywords)
        return os.path.islink(convert_to_string(
            path
        ), *arguments, **keywords)
# #

    @JointPoint
# # python3.5
# #     def is_referenced_via_absolute_path(
# #         self: Self, location=None
# #     ) -> builtins.bool:
    def is_referenced_via_absolute_path(self, location=None):
# #
        '''
            Determines if the given path is an absolute one.

            **location** - is path or "Handler" object pointing to target \
                           destination.

            Returns "False" if the given path is a relative one or "True" \
            otherwise.

            Examples:

            >>> Handler().is_referenced_via_absolute_path(
            ...     location=__file_path__)
            True

            >>> Handler().is_referenced_via_absolute_path(location='.')
            False

            >>> Handler(
            ...     location=__file_path__).is_referenced_via_absolute_path()
            True

            >>> Handler().is_referenced_via_absolute_path(location='/')
            True

            >>> Handler().is_referenced_via_absolute_path(location=Handler())
            False
        '''
        if location is None:
            location = self._initialized_path
        elif builtins.isinstance(location, self.__class__):
            return location.is_referenced_via_absolute_path()
# # python3.5         return os.path.isabs(location)
        return os.path.isabs(convert_to_string(location))

    @JointPoint
# # python3.5     def is_media(self: Self) -> builtins.bool:
    def is_media(self):
        '''
            Determines if the current location referenced to a media file.

            Returns "True" if the current location points to a media file or \
            "False" otherwise.

            Examples:

            >>> Handler(location=__file_path__).is_media()
            False

            >>> Handler().is_media()
            False

            >>> Handler(
            ...     location=__test_folder__.path + 'is_media_audio.mp3'
            ... ).is_media() # doctest: +SKIP
            True
        '''
        return Iterable(self.MEDIA_MIME_TYPE_PATTERN).is_in_pattern(
            value=self.mime_type)

    @JointPoint
# # python3.5     def is_portable_link(self: Self) -> builtins.bool:
    def is_portable_link(self):
        '''
            Checks if the current location points to a portable link.

            Returns "True" id the current location is a portable link or \
            "False" otherwise.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> Handler(location=__file_path__).is_portable_link()
            False

            >>> handler = Handler(__test_folder__.path + 'is_portable_link')
            >>> if Platform().operating_system == 'windows':
            ...     False
            ... else:
            ...     created = Handler(
            ...         location=__file_path__
            ...     ).make_symbolic_link(handler)
            ...     handler.is_portable_link()
            False

            >>> Handler().is_portable_link()
            False

            >>> Handler(
            ...     __test_folder__.path + 'is_portable_link_not_existing'
            ... ).is_portable_link()
            False

            >>> Handler(location=__file_path__).make_portable_link(
            ...     target=handler, force=True)
            True
            >>> handler.is_portable_link()
            True

            >>> handler.set_content(
            ...     10 * 'ä', encoding='latin1'
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> handler.is_portable_link()
            False
        '''
        path = self._get_ending_delimter_trimmed()
# # python3.5         if os.path.isfile(path):
        if os.path.isfile(convert_to_string(path)):
            maximum_length = (
                builtins.len(self.portable_link_pattern) +
                self.MAX_PATH_LENGTH + self.MAX_SIZE_NUMBER_LENGTH +
                # Maximum label line length + Maximum name length.
                120 + self.MAX_FILE_NAME_LENGTH)
            try:
# # python3.5
# #                 with builtins.open(
# #                     path, mode='r', encoding=ENCODING, errors='strict'
# #                 ) as file:
                with codecs.open(
                    convert_to_string(path), mode='r', encoding=ENCODING,
                    errors='strict'
                ) as file:
# #
                    file_content = file.read(maximum_length + 1).strip()
            except(builtins.IOError, builtins.TypeError,
                   builtins.UnicodeDecodeError):
                pass
            else:
# # python3.5
# #                 return (
# #                     builtins.len(file_content) <= maximum_length and
# #                     builtins.bool(regularExpression.compile(
# #                         self.portable_regex_link_pattern
# #                     ).fullmatch(file_content)))
                return (
                    builtins.len(file_content) <= maximum_length and
                    builtins.bool(regularExpression.compile(
                        '(?:%s)$' % self.portable_regex_link_pattern
                    ).match(file_content)))
# #
        return False

    @JointPoint
# # python3.5     def is_element(self: Self) -> builtins.bool:
    def is_element(self):
        '''
            Determines if the current object path is a valid resource on the \
            file system.

            Returns "True" if the current location is a valid file system \
            object or "False" otherwise.

            Examples:

            >>> Handler().is_element()
            True

            >>> Handler(location=__file_path__).is_element()
            True

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'is_element',
            ...     make_directory=True)
            >>> handler.is_element()
            True

            >>> handler.remove_deep()
            True

            >>> handler.is_element()
            False

            >>> Handler(
            ...     __test_folder__.path + 'is_element_not_existing'
            ... ).is_element()
            False
        '''
# # python3.5
# #         return os.path.exists(self._path) or self.is_symbolic_link()
        return os.path.exists(convert_to_string(
            self._path
        )) or self.is_symbolic_link()
# #

    @JointPoint
# # python3.5     def is_device_file(self: Self) -> builtins.bool:
    def is_device_file(self):
        '''
            Determines if the current object path is a device file like a \
            socket or pipe.

            Returns "True" if the current location is a device file or \
            "False" otherwise.

            Examples:

            >>> Handler().is_device_file()
            False

            >>> Handler(location=__file_path__).is_device_file()
            False

            >>> Handler(
            ...     location=__test_folder__.path + 'is_device_file',
            ...     make_directory=True
            ... ).is_device_file()
            False

            >>> Handler(
            ...     __test_folder__.path + 'is_device_file_not_existing'
            ... ).is_device_file()
            False
        '''
        return self.is_element() and not (
            self.is_file() or self.is_directory())

    # # # endregion

    @JointPoint
# # python3.5
# #     def backup(
# #         self: Self, name_wrapper=(
# #             '<%file.basename%>_backup<%file.extension_suffix%>'),
# #         backup_if_exists=True, compare_content=True
# #     ) -> Self:
    def backup(
        self,
        name_wrapper='<%file.basename%>_backup<%file.extension_suffix%>',
        backup_if_exists=True, compare_content=True
    ):
# #
        '''
            Creates a backup of current file object in same location.

            **name_wrapper**     - A template formating the backup file name.

            **backup_if_exists** - Indicates if a backup should be make even \
                                   if there is already a file object with \
                                   given backup name and content (if \
                                   "compare_content" is set).

            **compare_content**  - Compares content of directories and files \
                                   instead simply check again file names.

            Examples:

            >>> handler = Handler(__test_folder__.path + 'backup')
            >>> handler.content = ''
            >>> template = '<%file.basename%>_b<%file.extension_suffix%>'

            >>> handler.backup(template) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> Handler(__test_folder__.path + 'backup_b').is_file()
            True

            >>> handler.backup(template) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> Handler(__test_folder__.path + 'backup_b_b').is_file()
            True

            >>> handler.backup(
            ...     template, backup_if_exists=False
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> Handler(__test_folder__.path + 'backup_b_b_b').is_file()
            False

            >>> handler.content = 'A'
            >>> handler.backup(
            ...     template, backup_if_exists=False
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> Handler(__test_folder__.path + 'backup_b_b_b').is_file()
            True

            >>> handler.content = 'B'
            >>> handler.backup(
            ...     template, backup_if_exists=False, compare_content=False
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> Handler(__test_folder__.path + 'backup_b_b_b_b').is_file()
            False
        '''
        from boostnode.runnable.template import Parser as TemplateParser

        backup = self
        while True:
            earlier_backup = backup
            backup = self.__class__(
                location=self.directory.path + TemplateParser(
                    template=name_wrapper, string=True
                ).render(file=backup).output)
            '''
                Iterate till we have wrapped file name which doesn't exist yet.
            '''
            if not backup:
                '''Check if a new created backup would be redundant.'''
# # python3.5
# #                 if(earlier_backup != self and not backup_if_exists and
# #                    (not compare_content or self.is_equivalent(
# #                        other=earlier_backup))):
                if(not (earlier_backup == self) and
                   not backup_if_exists and (
                       not compare_content or self.is_equivalent(
                           other=earlier_backup))):
# #
                    return self
                self.copy(target=backup)
                break
        return self

    @JointPoint
# # python3.5
# #     def is_equivalent(
# #         self: Self, other: (SelfClassObject, builtins.str)
# #     ) -> builtins.bool:
    def is_equivalent(self, other):
# #
        '''
            Returns "True" if given file object contains likewise content as \
            current file object.

            **other** - The file object to compare.

            Examples:

            >>> handler = Handler(
            ...     __test_folder__.path + 'is_equivalent',
            ...     make_directory=True)
            >>> handler.is_equivalent(handler)
            True

            >>> __test_folder__.is_equivalent(__test_folder__.path + 'test')
            False

            >>> __test_folder__.is_equivalent(Handler(
            ...     __test_folder__.path + 'test', make_directory=True))
            False

            >>> a = Handler(__test_folder__.path + 'a', make_directory=True)
            >>> b = Handler(__test_folder__.path + 'b', make_directory=True)
            >>> a_file = Handler(__test_folder__.path + 'a/test')
            >>> a_file.content = 'hans'
            >>> b_file = Handler(__test_folder__.path + 'b/test')
            >>> b_file.content = 'hans'

            >>> a.is_equivalent(b)
            True

            >>> a_file.is_equivalent(b_file)
            True

            >>> b_file.content = 'peter'
            >>> a_file.is_equivalent(b_file)
            False

            >>> a_file.is_equivalent(a)
            False
        '''
        other = self.__class__(location=other)
        if self.is_file() and other.is_file():
            return self.content == other.content
        elif(self.is_directory() and other.is_directory() and
             self._is_equivalent_folder(other)):
            return True
        return False

    @JointPoint
# # python3.5     def change_working_directory(self: Self) -> Self:
    def change_working_directory(self):
        '''
            Changes the current working directory to the instance saved \
            location.

            Examples:

            >>> current_working_directory = os.getcwd()
            >>> current_working_directory # doctest: +ELLIPSIS
            '...boostnode...extension'

            >>> test_folder = Handler(
            ...     __test_folder__.path + 'change', make_directory=True)
            >>> test_folder.change_working_directory() # doctest: +ELLIPSIS
            Object of "Handler" with path "...change..." (type: directory)...
            >>> os.getcwd() # doctest: +ELLIPSIS
            '...change...'
            >>> test_folder.path[:-len(os.sep)] == os.getcwd()
            True
            >>> test_folder.directory.path[:-len(os.sep)] != os.getcwd()
            True

            >>> Handler(
            ...     current_working_directory
            ... ).change_working_directory() # doctest: +ELLIPSIS
            Object of "Handler" with path "..." (type: directory).

            >>> undefined_object = Handler(__test_folder__.path + 'change/a')
            >>> undefined_object.change_working_directory(
            ...     ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...change..." (type: undefined)...
            >>> os.getcwd() # doctest: +ELLIPSIS
            '...change...'
            >>> undefined_object.directory.path[:-len(os.sep)] == os.getcwd()
            True
            >>> undefined_object.path[:-len(os.sep)] != os.getcwd()
            True

            >>> Handler(
            ...     current_working_directory
            ... ).change_working_directory() # doctest: +ELLIPSIS
            Object of "Handler" with path "..." (type: directory).

            >>> file = Handler(__test_folder__.path + 'change/a')
            >>> file.content = ''
            >>> file.change_working_directory() # doctest: +ELLIPSIS
            Object of "Handler" with path "...change..." (type: file)...
            >>> os.getcwd() # doctest: +ELLIPSIS
            '...change...'
            >>> file.directory.path[:-len(os.sep)] == os.getcwd()
            True
            >>> file.path[:-len(os.sep)] != os.getcwd()
            True

            >>> Handler(
            ...     current_working_directory
            ... ).change_working_directory() # doctest: +ELLIPSIS
            Object of "Handler" with path "..." (type: directory).
        '''
        if self.is_directory():
# # python3.5             os.chdir(self._path)
            os.chdir(convert_to_string(self._path))
        else:
            '''Take this method name via introspection.'''
            builtins.getattr(self.directory, inspect.stack()[0][3])()
        return self

    @JointPoint
# # python3.5
# #     def list(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> Generator:
    def list(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.listdir()" method in an object \
            oriented way.

            Return a list containing "Handler" objects of entries in the \
            directory given by the object path. The list is in arbitrary \
            order. It does not include the special entries '.' and '..' even \
            if they are present in the directory.

            Additional arguments and keywords are forwarded to "os.listdir()".

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> Handler().list() # doctest: +ELLIPSIS
            <generator object list at ...>

            >>> for handler in Handler(): # doctest: +ELLIPSIS
            ...     print('"' + str(handler) + '"')
            "...file.py..."

            >>> not_existing_file = Handler(
            ...     __test_folder__.path + 'list_not_existing')
            >>> not_existing_file.list() # doctest: +ELLIPSIS
            <generator object list at ...>
            >>> len(not_existing_file)
            0
            >>> list(not_existing_file.list())
            []

            >>> existing_file = Handler(__test_folder__.path + 'list_file')
            >>> existing_file.content = ''
            >>> existing_file.list() # doctest: +ELLIPSIS
            <generator object list at ...>
            >>> len(existing_file)
            0
            >>> list(existing_file.list())
            []
            >>> existing_file.content = 'a\\nb\\nc'
            >>> existing_file.list() # doctest: +ELLIPSIS
            <generator object list at ...>
            >>> len(existing_file) == len(existing_file.content)
            True
            >>> len(list(existing_file))
            3
            >>> list(existing_file.list())
            ['a\\n', 'b\\n', 'c']

            >>> not_accessible_file = Handler(
            ...     __test_folder__.path + 'list_not_accessible',
            ...     make_directory=True)
            >>> not_accessible_file.change_right(000) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> if sys.version_info.major < 3:
            ...     convert_to_unicode(list(__test_folder__))
            ... else:
            ...     str(list(__test_folder__)) # doctest: +ELLIPSIS
            '[...]'
            >>> not_accessible_file.remove_directory()
            True

            >>> not_accessible_file.content = ''
            >>> not_accessible_file.change_right(000) # doctest: +ELLIPSIS
            Object of "Handler" with path "...

            >>> if sys.version_info.major < 3:
            ...     convert_to_unicode(list(__test_folder__))
            ... else:
            ...     str(list(__test_folder__)) # doctest: +ELLIPSIS
            '[...]'
            >>> not_accessible_file.remove_file()
            True

            >>> if Platform().operating_system == 'windows':
            ...     len(Handler('/')) > 0
            ... else:
            ...     True
            True
        '''
        from boostnode.extension.system import Platform

        if self:
            if self._path == '\\' and Platform().operating_system == 'windows':
                yield self._list_windows_root()
            elif self.is_directory():
                try:
# # python3.5
# #                     for file_name in os.listdir(
# #                         self._path, *arguments, **keywords
# #                     ):
                    for file_name in os.listdir(convert_to_string(
                        self._path
                    ), *arguments, **keywords):
                        file_name = convert_to_unicode(file_name)
# #
                        try:
                            yield self.__class__(
                                location='%s%s' % (self.path, file_name))
                        except(builtins.IOError, builtins.OSError):
                            pass
                except builtins.OSError:
                    pass
            else:
# # python3.5
# #                 with builtins.open(self._path, 'r') as file:
                with builtins.open(convert_to_string(
                    self._path
                ), 'r') as file:
# #
                    for line in file:
                        yield line

    @JointPoint
# # python3.5
# #     def remove_directory(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def remove_directory(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.rmdir()" method in an object \
            oriented way.

            Remove (delete) the directory path. Works only if the directory \
            is empty, otherwise, "builtins.OSError" is raised. To remove \
            whole directory trees, "remove_deep" or "shutil.rmtree()" can be \
            used.

            Returns "True" if deleting was successful or no file exists and \
            "False" otherwise.

            Additional arguments or keywords a forwarded to "os.rmdir()".

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> handler = Handler(
            ...     __test_folder__.path + 'remove_directory',
            ...     make_directory=True)

            >>> handler.remove_directory()
            True

            >>> handler.remove_directory()
            False

            >>> handler.content = ''
            >>> handler.remove_directory()
            False
            >>> handler.remove_file()
            True

            >>> handler.make_directory()
            True
            >>> handler.change_right(000) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> handler.remove_directory()
            True

            >>> handler.make_directory()
            True
            >>> file = Handler(handler.path + 'file', make_directory=True)
            >>> handler.change_right(100) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> file.change_right(000) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> if Platform().operating_system == 'windows':
            ...     False
            ... else:
            ...     file.remove_directory()
            False
            >>> handler.change_right(700) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> file.remove_directory()
            True
        '''
        if self.is_directory():
            try:
# # python3.5
# #                 os.rmdir(self._path, *arguments, **keywords)
# #             except(builtins.PermissionError, builtins.OSError):
                os.rmdir(
                    convert_to_string(self._path), *arguments, **keywords)
            except builtins.OSError:
# #
                try:
# # python3.5
# #                     self.change_right(
# #                         right=os.stat(self._path).st_mode | stat.S_IWRITE,
# #                         octal=False)
# #                     os.rmdir(self._path, *arguments, **keywords)
# #                 except(builtins.PermissionError, builtins.OSError):
                    self.change_right(
                        right=os.stat(convert_to_string(
                            self._path
                        )).st_mode | stat.S_IWRITE,
                        octal=False)
                    os.rmdir(convert_to_string(
                        self._path
                    ), *arguments, **keywords)
                except builtins.OSError:
# #
                    return False
                else:
                    return True
            else:
                return True
        return False

    @JointPoint
# # python3.5
# #     def move(
# #         self: Self, target: (SelfClassObject, builtins.str),
# #         *arguments: builtins.object, respect_root_path=None,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def move(self, target, *arguments, **keywords):
# #
        '''
            Implements the pythons native "shutil.move()" method in an object \
            oriented way.

            Recursively move a file or directory to another location. If the \
            destination is on the current file system, then simply use \
            "rename". Otherwise, copy current path (with "self.copy()" \
            method) to the target and then remove current path.

            **target** - Path or "Handler" object pointing to target \
                         destination.

            Additional arguments or keywords a forwarded to "shutil.move()".

            Examples:

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'move',
            ...     make_directory=True)
            >>> target = Handler(location=__test_folder__.path + 'move2')
            >>> handler.move(target)
            True
            >>> target.is_directory()
            True

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'move_file')
            >>> handler.content = ''
            >>> target = Handler(
            ...     location=__test_folder__.path + 'move_file2')
            >>> handler.move(target)
            True
            >>> target.is_file()
            True

            >>> Handler(
            ...     location=__test_folder__.path + 'move_not_existing'
            ... ).move(__test_folder__.path + 'move_target_not_existing2')
            False
        '''
# # python3.5
# #         pass
        respect_root_path, keywords = Dictionary(
            content=keywords
        ).pop_from_keywords(name='respect_root_path')
# #
        target = self.get_path(
            location=target, respect_root_path=respect_root_path,
            output_with_root_prefix=True)
        if self:
            shutil.move(self._path, dst=target, *arguments, **keywords)
        return self._set_path(path=target)

    @JointPoint
# # python3.5
# #     def remove_deep(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def remove_deep(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "shutil.rmtree()" method in an \
            object oriented way.

            Delete an entire directory tree; path must point to a valid \
            location (but not a symbolic link). If "ignore_errors" is true, \
            errors resulting from failed removals will be ignored; if false \
            or omitted, such errors are handled by calling a handler \
            specified by "onerror" or, if that is omitted, they raise an \
            exception. If "onerror" is provided, it must be a callable that \
            accepts three parameters: "function", "path", and "excinfo". The \
            first parameter, function, is the function which raised the \
            exception; it will be one of pythons native methods: \
            "os.path.islink()", "os.listdir", "os.remove" or "os.rmdir". The \
            second parameter "path" will be the path name passed to function. \
            The third parameter "excinfo" will be the exception information \
            returned by pythons native "sys.exc_info()" method. Exceptions \
            raised by "onerror" will not be caught.

            Additional arguments or keywords a forwarded to "shutil.rmtree()".

            Returns "True" if remove was successful and "False" otherwise.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> root = Handler(
            ...     location=__test_folder__.path + 'remove_deep',
            ...     make_directory=True)
            >>> Handler(
            ...     location=__test_folder__.path + 'remove_deep/sub_dir',
            ...     make_directory=True) # doctest: +ELLIPSIS
            Object of "Handler" with path "...remove_deep...sub_dir..."...
            >>> root.remove_deep()
            True
            >>> root.is_directory()
            False

            >>> root.remove_deep()
            False

            >>> root.content = ''
            >>> root.remove_deep()
            True

            >>> root.make_directory()
            True
            >>> file = Handler(root.path + 'file', make_directory=True)
            >>> root.change_right(000) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> if Platform().operating_system == 'windows':
            ...     False
            ... else:
            ...     file.remove_deep()
            False
        '''
        if self.is_directory(allow_link=False):
            try:
                shutil.rmtree(convert_to_string(self._path), *arguments, **keywords)
# # python3.5
# #             except builtins.PermissionError:
# #                 shutil.rmtree(self._path, *arguments, **keywords)
                shutil.rmtree(convert_to_string(
                    self._path
                ), *arguments, **keywords)
            except builtins.OSError:
# #
                try:
# # python3.5
# #                     self.change_right(
# #                         right=os.stat(self._path).st_mode | stat.S_IWRITE,
# #                         octal=False)
# #                     shutil.rmtree(self._path, *arguments, **keywords)
# #                 except builtins.PermissionError:
                    self.change_right(
                        right=os.stat(convert_to_string(
                            self._path
                        )).st_mode | stat.S_IWRITE, octal=False)
                    shutil.rmtree(convert_to_string(
                        self._path
                    ), *arguments, **keywords)
                except builtins.OSError:
# #
                    return False
                else:
                    return True
            else:
                return True
        return self.remove_file()

    @JointPoint
# # python3.5
# #     def remove_file(
# #         self: Self, *arguments: builtins.object,
# #         force_windows_behavior=False, **keywords: builtins.object
# #     ) -> builtins.bool:
    def remove_file(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.remove()" method in an object \
            oriented way.

            Remove (delete) the file path. This is the same function as \
            pythons native "os.remove()"; the unlink name is its traditional \
            Unix name.

            **force_windows_behavior** - Indicates whether windows behavior \
                                         should be used on other operating \
                                         systems than windows.

            Additional arguments or keywords a forwarded to "os.remove()".

            Returns "True" if file was deleted successfully and "False" \
            otherwise.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> Handler(location=__file_path__).copy(
            ...     target=__test_folder__.path + 'remove_file')
            True

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'remove_file')
            >>> handler.is_file()
            True

            >>> handler.remove_file()
            True
            >>> handler.is_file()
            False

            >>> handler.remove_file()
            False

            >>> handler.make_directory()
            True
            >>> file = Handler(handler.path + 'file')
            >>> file.content = ''
            >>> file.change_right(000) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> file.remove_file()
            True

            >>> Handler().remove_file()
            False

            >>> source = Handler(
            ...     __test_folder__.path +
            ...     'remove_file_soft_link_windows_source',
            ...     make_directory=True)
            >>> target = Handler(
            ...     __test_folder__.path +
            ...     'remove_file_soft_link_windows_target')
            >>> if Platform().operating_system == 'windows':
            ...     False
            ... else:
            ...     created = source.make_symbolic_link(target)
            ...     target.remove_file(force_windows_behavior=True)
            False

            >>> file = Handler(
            ...     __test_folder__.path + 'remove_file_without_permission',
            ...     make_directory=True)
            >>> nested_file = Handler(file.path + 'file')
            >>> nested_file.content = 'test'
            >>> file.change_right(500) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> nested_file.remove_file()
            False
        '''
        from boostnode.extension.system import Platform
# # python3.5
# #         pass
        force_windows_behavior, keywords = Dictionary(
            content=keywords
        ).pop_from_keywords(
            name='force_windows_behavior', default_value=False)
# #
        if self.is_file():
            if(self.is_symbolic_link(allow_portable_link=False) and
               self.is_directory() and (
                   Platform().operating_system == 'windows' or
                   force_windows_behavior)):
                return self.remove_directory()
            try:
                self._path = self._get_ending_delimter_trimmed()
# # python3.5
# #                 os.remove(self._path, *arguments, **keywords)
# #             except builtins.PermissionError:
                os.remove(
                    convert_to_string(self._path), *arguments, **keywords)
            except builtins.OSError:
# #
                try:
# # python3.5
# #                     self.change_right(
# #                         right=os.stat(self._path).st_mode | stat.S_IWRITE,
# #                         octal=False)
# #                     os.remove(self._path, *arguments, **keywords)
# #                 except builtins.PermissionError:
                    self.change_right(
                        right=os.stat(convert_to_string(
                            self._path
                        )).st_mode | stat.S_IWRITE, octal=False)
                    os.remove(convert_to_string(
                        self._path
                    ), *arguments, **keywords)
                except builtins.OSError:
# #
                    return False
                else:
                    return True
            else:
                return True
        return False

    @JointPoint
# # python3.5
# #     def change_right(
# #         self: Self, right, octal=True, recursive=False, allow_link=True
# #     ) -> Self:
    def change_right(
        self, right, octal=True, recursive=False, allow_link=True
    ):
# #
        '''
            Implements the pythons native "os.chmod()" method in an object \
            oriented way.

            Change the mode of path to the numeric mode. "mode" may take one \
            of the following values (as defined in the stat module) or \
            bitwise combinations of them:

            stat.S_ISUID, stat.S_ISGID, stat.S_ENFMT, stat.S_ISVTX, \
            stat.S_IREAD, stat.S_IWRITE, stat.S_IEXEC, stat.S_IRWXU, \
            stat.S_IRUSR, stat.S_IWUSR, stat.S_IXUSR, stat.S_IRWXG, \
            stat.S_IRGRP, stat.S_IWGRP, stat.S_IXGRP, stat.S_IRWXO, \
            stat.S_IROTH, stat.S_IWOTH, stat.S_IXOTH

            **right**      - Is the new right for the current object's path \
                             location.

            **octal**      - Indicates whether we provide an octal number or \
                             a constant combination from "stat.*".

            **recursive**  - Indicates whether rights should be set \
                             recursively.

            **allow_link** - Indicates whether links should be followed.

            Examples:

            >>> handler = Handler(__test_folder__.path + 'change_right')
            >>> Handler(location=__file_path__).copy(target=handler)
            True
            >>> handler.change_right(right=766) # doctest: +ELLIPSIS
            Object of "Handler" with path "...change_right...

            >>> handler.change_right(
            ...     stat.S_IWUSR | stat.S_IXUSR, octal=False, recursive=True
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...change_right...

            >>> handler = Handler(
            ...     __test_folder__.path + 'change_right_folder',
            ...     make_directory=True)
            >>> handler.change_right(right=766) # doctest: +ELLIPSIS
            Object of "Handler" with path "...change_right_folder..." ...

            >>> handler.change_right(
            ...     stat.S_IWRITE | stat.S_IREAD, octal=False, recursive=True
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...change_right...
        '''
        if octal:
# # python3.5
# #             os.chmod(self._path, builtins.eval('0o%d' % right))
            os.chmod(convert_to_string(self._path), builtins.eval(
                '0o%d' % right))
# #
        else:
# # python3.5
# #             os.chmod(self._path, right)
            os.chmod(convert_to_string(self._path), right)
# #
        if self.is_directory(allow_link) and recursive:
            '''Take this method name via introspection.'''
            self.iterate_directory(
                function=inspect.stack()[0][3], right=right, octal=octal,
                recursive=recursive, allow_link=allow_link)
        return self

    @JointPoint
# # python3.5
# #     def copy(
# #         self: Self, target: (SelfClassObject, builtins.str),
# #         *arguments: builtins.object, right=None, octal=True,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def copy(self, target, *arguments, **keywords):
# #
        '''
            Implements the pythons native "shutil.copy2()" method and \
            "shutil.copytree()" in an object orientated way.

            Copy the current file to the file or directory "target". If \
            current location is a directory, a file with the same name is \
            created (or overwritten) in the directory specified. Permission \
            bits are copied.

            **target** - Path or "Handler" object pointing to target \
                         destination.

            Additional arguments or keywords a forwarded to "shutil.copy2()".

            Returns "True" if the copy process was successful or "False" \
            otherwise.

            Examples:

            >>> target = Handler(
            ...     location=__test_folder__.path + 'copy_file.py')
            >>> Handler(location=__file_path__).copy(target)
            True
            >>> target.is_file()
            True

            >>> target = Handler(
            ...     location=__test_folder__.path + 'copy_directory2')
            >>> Handler(
            ...     __test_folder__.path + 'copy_directory',
            ...     make_directory=True
            ... ).copy(target)
            True
            >>> target.is_directory()
            True

            >>> target.copy(
            ...     __test_folder__.path + 'copy_directory3', right=777)
            True
        '''
# # python3.5
# #         pass
        default_keywords = Dictionary(content=keywords)
        right, keywords = default_keywords.pop_from_keywords(name='right')
        octal, keywords = default_keywords.pop_from_keywords(
            name='octal', default_value=True)
# #
        target = self.__class__(location=target)
        if self.is_file():
            shutil.copy2(self._path, target._path, *arguments, **keywords)
        # TODO test
        elif target.is_directory():
            copy_to_existing_directory(self._path, target._path)
        else:
            shutil.copytree(self._path, target._path)
        if right is not None:
            target.change_right(right, octal)
        return target.type == self.type

    @JointPoint
# # python3.5
# #     def make_new_directory(
# #         self: Self, wrapper_pattern='{file_name}_temp'
# #     ) -> SelfClassObject:
    def make_new_directory(self, wrapper_pattern='{file_name}_temp'):
# #
        '''
            Makes a new directory in each case. E.g. if current directory \
            name already exists. The given wrapper pattern is used as long \
            resulting name is unique. The handler which creates the folder \
            will be given back.

            **wrapper_pattern** - A template describing how the current \
                                  object should be renamed if current file \
                                  object already exists. The template has the \
                                  current file name as placeholder (usable \
                                  with {file_name}).

            Returns the new created file object.

            Examples:

            >>> handler = Handler(__test_folder__.path + 'make_new_directory')

            >>> handler.make_new_directory().path # doctest: +ELLIPSIS
            '...make_new_directory...'

            >>> handler.make_new_directory().path # doctest: +ELLIPSIS
            '...make_new_directory_temp...'

            >>> handler.make_new_directory().path # doctest: +ELLIPSIS
            '...make_new_directory_temp_temp...'

            >>> handler.make_new_directory(
            ...     wrapper_pattern='{file_name}_t'
            ... ).path # doctest: +ELLIPSIS
            '...make_new_directory_t...'
        '''
        location = self.__class__(self)
        while location:
            path = location.directory.path + wrapper_pattern.format(
                file_name=location.name)
            location = self.__class__(location=path)
        location.make_directory()
        return location

    @JointPoint
# # python3.5
# #     def make_directory(
# #         self: Self, *arguments: builtins.object, right=700, octal=True,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def make_directory(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.mkdir()" method in an object \
            oriented way.

            Create a directory named path with numeric mode. The default mode \
            is "700" (octal). If the directory already exists, \
            "builtins.OSError" is raised.

            **right** - new right for the current object's path location.

            **octal** - Indicates whether given right should be interpreted \
                        as octal number.

            Additional arguments or keywords are forwarded to "os.mkdir()".

            Returns "True" if the creation process was successful or "False" \
            otherwise.

            Examples:

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'make_directory')

            >>> handler.is_element()
            False
            >>> handler.make_directory()
            True
            >>> handler.is_directory()
            True

            >>> handler.remove_directory()
            True
            >>> handler.make_directory(right=777)
            True
        '''
# # python3.5
# #         os.mkdir(self._path, *arguments, **keywords)
        default_keywords = Dictionary(content=keywords)
        right, keywords = default_keywords.pop_from_keywords(
            name='right', default_value=700)
        octal, keywords = default_keywords.pop_from_keywords(
            name='octal', default_value=True)
        os.mkdir(convert_to_string(self._path), *arguments, **keywords)
# #
        self.change_right(right, octal)
        return self.is_directory()

    @JointPoint
# # python3.5
# #     def make_symbolic_link(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def make_symbolic_link(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.symlink()" method in an object \
            oriented way. The optional parameter "force" is added.

            Create a symbolic link pointing to current location named by \
            given "target" variable. On windows, symbolic link version takes \
            an additional optional parameter, target_is_directory, which \
            defaults to "False". On windows, a symbolic link represents a \
            file or a directory, and does not morph to the target \
            dynamically. For this reason, when creating a symbolic link on \
            Windows, if the target is not already present, the symbolic link \
            will default to being a file symbolic link. If \
            "target_is_directory" is set to "True", the symbolic link will be \
            created as a directory symbolic link. This parameter is ignored \
            if the target exists (and the symbolic link is created with the \
            same type as the target). Symbolic link support was introduced in \
            Windows 6.0 (Vista). The native python "os.symlink()" method will \
            raise a "builtins.NotImplementedError" on Windows versions \
            earlier than 6.0.

            Note: The "CreateSymbolicLinkPrivilege" is required in order to \
            successfully create symbolic links. This privilege is not \
            typically granted to regular users but is available to accounts \
            which can escalate privileges to the administrator level. Either \
            obtaining the privilege or running your application as an \
            administrator are ways to successfully create symbolic links. \
            "builtins.OSError" is raised when the function is called by an \
            unprivileged user.

            **force**    - triggers if symbolic links with not existing \
                           referenced files should be made. If target exists \
                           it will be overwritten if set to "True".

            **relative** - triggers if target should be referenced via \
                           relative path. If "True" relative path will be \
                           determined from current working directory, if a \
                           path or Handler object is provided this location \
                           will be used as context to determine relative \
                           path, if "Self" is provided target location will \
                           be used as context and if "False" (default) path \
                           will be referenced absolute.

            Returns "True" if creation was successful and "False" otherwise.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> target = Handler(
            ...     __test_folder__.path + 'make_symbolic_link_target')
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     created = Handler(
            ...         location=__test_folder__.path +
            ...             'make_symbolic_link_directory_source',
            ...         make_directory=True
            ...     ).make_symbolic_link(target, force=True)
            ...     target.is_symbolic_link()
            True

            >>> target = Handler(
            ...     __test_folder__.path + 'make_symbolic_link_target')
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     source = Handler(
            ...         location=__test_folder__.path +
            ...             'make_symbolic_link_file_source')
            ...     source.content = ''
            ...     created = source.make_symbolic_link(target, force=True)
            ...     target.is_symbolic_link()
            True
        '''
        return self._make_link(*arguments, symbolic=True, **keywords)

    @JointPoint
# # python3.5
# #     def make_hardlink(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def make_hardlink(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.link()" method in an object \
            oriented way. The optional parameter "force" is added.

            **force** - Indicates if hard links with not existing referenced \
                        files should be made. If target exists it will be \
                        overwritten if set to "True".

            Returns "True" if creation was successful and "False" otherwise.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> target = Handler(
            ...     __test_folder__.path + 'make_hardlink_target')
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     source = Handler(
            ...         location=__test_folder__.path + 'make_hardlink_source')
            ...     source.content = ''
            ...     created = source.make_hardlink(target, force=True)
            ...     target.is_file()
            True
        '''
        return self._make_link(*arguments, symbolic=False, **keywords)

    @JointPoint
# # python3.5
# #     def read_symbolic_link(
# #         self: Self, as_object=False, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> (builtins.str, SelfClassObject):
    def read_symbolic_link(self, as_object=False, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.readlink()" method in an object \
            oriented way. Additional support for portable text-based \
            link-files is added.

            Return a string representing the path to which the symbolic link \
            points. The result may be either an absolute or relative \
            pathname; if it is relative, it may be converted to an absolute \
            pathname using pythons native "os.path.join()" method as \
            "os.path.join(os.path.dirname(path), result)". If the path is a \
            string object, the result will also be a string object, and the \
            call may raise an "builtins.UnicodeDecodeError". If the path is a \
            bytes object, the result will be a bytes object. You can use the \
            optional "as_object" parameter for getting a Handler object. This \
            is very useful if you don't know if the resulting path is either \
            a relative or an absolute one.

            Additional arguments and keywords will be forwarded to \
            "os.readlink()"..

            Returns the path referenced by the link file.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> source = Handler(location=__file_path__)
            >>> target = Handler(__test_folder__.path + 'read_symbolic_link')
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     created = source.make_symbolic_link(target, force=True)
            ...     target.read_symbolic_link() == __file_path__
            True

            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     target.read_symbolic_link(as_object=True) == source
            True

            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     target.remove_file()
            True
            >>> if Platform().operating_system == 'windows':
            ...     target
            ... else:
            ...     created = Handler('../').make_symbolic_link(
            ...         target, relative=True)
            ...     target.read_symbolic_link(
            ...         as_object=True
            ...     ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
        '''
        path = self._get_ending_delimter_trimmed()
        if self.is_symbolic_link(allow_portable_link=False):
# # python3.5
# #             link = os.readlink(path, *arguments, **keywords)
            link = convert_to_unicode(os.readlink(convert_to_string(
                path
            ), *arguments, **keywords))
# #
        else:
            link = self.read_portable_link()
# # python3.5
# #         if not link.endswith(os.sep) and os.path.isdir(link):
        if not link.endswith(os.sep) and os.path.isdir(
            convert_to_string(link)
        ):
# #
            link += os.sep
        if not self.is_referenced_via_absolute_path(location=link):
            link = self.__class__(location=self.directory.path + link)
        link = self.__class__(location=link)
        if as_object:
            return link
        return link.path

    @JointPoint
# # python3.5
# #     def deep_copy(
# #         self: Self, target: (SelfClassObject, builtins.str),
# #         symbolic_links=True, *arguments: builtins.object,
# #         respect_root_path=None, **keywords: builtins.object
# #     ) -> Self:
    def deep_copy(
        self, target, symbolic_links=True, *arguments, **keywords
    ):
# #
        '''
            Implements the pythons native "shutil.copytree()" method in an \
            object oriented way.

            Recursively copy an entire directory tree rooted at current \
            location. The destination directory, named by given parameter \
            "target", must not already exist; it will be created as well as \
            missing parent directories. Permissions and times of directories \
            are copied with pythons native method "shutil.copystat()", \
            individual files are copied using pythons native "shutil.copy2()" \
            method. If given parameter "symbolic_links" is "True", symbolic \
            links in the source tree are represented as symbolic links in the \
            new tree; if false, the contents of the linked files are copied \
            to the new tree. When "symbolic_links" is "False", e.g. if the \
            file pointed by the symbolic link doesn't exist, a exception will \
            be added in the list of errors raised in a error exception at the \
            end of the copy process. You can set the optional \
            "ignore_dangling_symlinks" flag to "True" if you want to silence \
            this exception. Notice that this option has no effect on \
            platforms that don't support pythons native "os.symlink()" \
            method. If ignore is given, it must be a callable that will \
            receive as its arguments the directory being visited by pythons \
            native method "shutil.copytree", and a list of its contents, as \
            returned by pythons "os.listdir" method. Since "shutil.copytree" \
            is called recursively, the ignore callable will be called once \
            for each directory that is copied. The callable must return a \
            sequence of directory and file names relative to the current \
            directory (i.e. a subset of the items in its second argument); \
            these names will then be ignored in the copy process. Pythons \
            native method "shutil.ignore_patterns()" can be used to create \
            such a callable that ignores names based on glob-style patterns. \
            If exception(s) occur, an error is raised with a list of reasons. \
            If parameter "copy_function" is given, it must be a callable that \
            will be used to copy each file. It will be called with the source \
            path and the target path as arguments. By default, pythons native \
            "shutil.copy2()" is used, but any function that supports the \
            ame signature (like pythons "shutil.copy()") can be used.

            **target**         - Target location for coping current file \
                                 object.

            **symbolic_links** - Indicates whether symbolic links should be \
                                 followed.

            Examples:

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'deep_copy',
            ...     make_directory=True)
            >>> Handler(
            ...     location=handler.path + 'sub_dir',
            ...     make_directory=True
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...deep_copy...sub_di..." (type: ...
            >>> Handler(
            ...     location=handler.path + 'second_sub_dir',
            ...     make_directory=True
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...deep_copy...second_sub_di...

            >>> target = Handler(__test_folder__.path + 'deep_copy_dir')
            >>> handler.deep_copy(target) # doctest: +ELLIPSIS
            Object of "Handler" with path "...deep_copy..." (type: directory).
            >>> Handler(location=target.path + 'sub_dir').is_directory()
            True
            >>> Handler(target.path + '/second_sub_dir').is_directory()
            True
        '''
# # python3.5
# #         pass
        respect_root_path, keywords = Dictionary(
            content=keywords
        ).pop_from_keywords(name='respect_root_path')
# #
        shutil.copytree(
            src=self._path, dst=self.get_path(
                location=target, respect_root_path=respect_root_path,
                output_with_root_prefix=True),
            symlinks=symbolic_links, *arguments, **keywords)
        return self

    @JointPoint
# # python3.5
# #     def make_directories(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def make_directories(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "os.makedirs()" method in an object \
            oriented way.

            Recursive directory creation function. Like pythons native \
            "os.mkdir()" method, but creates all intermediate-level \
            directories needed to contain the leaf directory. If the target \
            directory with the same mode as specified already exists, raises \
            an "builtins.OSError" exception if given parameter "exist_ok" is \
            "False", otherwise no exception is raised. If the directory \
            cannot be created in other cases, raises an "builtins.OSError" \
            exception. The default mode is "0o770" (octal). On some systems, \
            "mode" is ignored. Where it is used, the current "umask" value is \
            first masked out. Note "make_directories()" will become confused \
            if the path elements to create include parent directory.

            Additional arguments and keywords are forwarded to "os.makedirs()".

            Examples:

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'dir/sub_dir/sub_sub_dir')
            >>> handler.make_directories()
            True
            >>> handler.path # doctest: +ELLIPSIS
            '...dir...sub_dir...sub_sub_dir...'
            >>> handler.is_directory()
            True

            >>> handler = Handler(location=__test_folder__.path + 'dir')
            >>> handler.make_directories()
            True
            >>> handler.path # doctest: +ELLIPSIS
            '...dir...'
            >>> handler.is_directory()
            True
        '''
        if not self:
# # python3.5
# #             os.makedirs(self._path, *arguments, **keywords)
            os.makedirs(
                convert_to_string(self._path), *arguments, **keywords)
# #
        return self.is_directory()

    @JointPoint
# # python3.5
# #     def make_portable_link(
# #         self: Self, target: (SelfClassObject, builtins.str),
# #         force=False, label='',
# #         *arguments: (builtins.object, builtins.type),
# #         **keywords: (builtins.object, builtins.type)
# #     ) -> builtins.bool:
    def make_portable_link(
        self, target, force=False, label='', *arguments, **keywords
    ):
# #
        '''
            Creates a portable link on the current location referencing on \
            the given path ("target").

            **target** - A path or file object interpreted as target location.

            **force**  - Means to trigger if a file on the target location \
                         should be overwritten.

            **label**  - Is a useful label to distinguish portable linked \
                         files from other text-based files. Default is setted \
                         to the current class description.

            Additional arguments and keywords are forwarded to \
            "self.get_portable_link_content()".

            Examples:

            >>> target = Handler(
            ...     location=__test_folder__.path + 'link.py')
            >>> Handler(location=__file_path__).make_portable_link(
            ...     target, force=True)
            True
            >>> target.content # doctest: +ELLIPSIS
            '...portable...'

            >>> target = Handler(
            ...     location=__test_folder__.path + 'directory_link')
            >>> Handler(
            ...     __test_folder__.path + 'directory', make_directory=True
            ... ).make_portable_link(target, force=True)
            True
            >>> target.content # doctest: +ELLIPSIS
            '...portable...'

            >>> target = Handler(location=__test_folder__.path + 'link')
            >>> Handler(location=__file_path__).make_portable_link(
            ...     target, force=True, label='hans')
            True
            >>> target.content # doctest: +ELLIPSIS
            '...portable...'
        '''
        target = self.__class__(location=target)
        if target and force:
            target.remove_deep()
        if not label:
            label = self.__class__.__name__
        target.content = self.get_portable_link_content(
            label, target_path=target._path, *arguments, **keywords)
        return target.is_portable_link()

    @JointPoint
# # python3.5
# #     def read_portable_link(
# #         self: Self, as_object=False
# #     ) -> (builtins.str, SelfClassObject):
    def read_portable_link(self, as_object=False):
# #
        '''
            Reads the referenced path of a given portable link file.

            **as_object** - Indicates whether the resulting file should be \
                            returned as string or file handler.

            Examples:

            >>> target = Handler(
            ...     location=__test_folder__.path + 'read_portable_link')

            >>> handler = Handler(location=__file_path__).make_portable_link(
            ...     target, force=True)
            >>> target.read_portable_link(as_object=True) == Handler(
            ...     __file_path__)
            True

            >>> target.remove_file()
            True
            >>> handler = Handler(
            ...     __test_folder__.path + 'read_portable_link_directory',
            ...     make_directory=True
            ... ).make_portable_link(target, force=True)
            >>> target.read_portable_link(as_object=True) # doctest: +ELLIPSIS
            Object of ...read_portable_link_directory...

            >>> Handler().read_portable_link(
            ...     ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.FileError: ...
        '''
        if self.is_portable_link():
# # python3.5
# #             path = regularExpression.compile(
# #                 self.portable_regex_link_pattern
# #             ).fullmatch(self.content.strip()).group('path')
            path = regularExpression.compile(
                '(?:%s)$' % self.portable_regex_link_pattern
            ).match(self.content.strip()).group('path')
# #
            path = path[builtins.len(
                self.__class__._root_path
            ) - builtins.len(os.sep):]
            if as_object:
                return self.__class__(location=path)
            return path
        raise __exception__('"%s" isn\'t a portable link.', self._path)

    @JointPoint
# # python3.5     def clear_directory(self: Self) -> builtins.bool:
    def clear_directory(self):
        '''
            Deletes the contents of the current directory location without \
            deleting the current location itself.

            Returns "True" if deletion was successful or "False" otherwise.

            Examples:

            >>> handler = Handler(
            ...     location=__test_folder__.path + 'dir', make_directory=True)

            >>> sub_handler = Handler(
            ...     location=__test_folder__.path + 'dir/sub_dir',
            ...     make_directory=True)
            >>> handler.clear_directory()
            True
            >>> sub_handler.is_element()
            False
            >>> handler.is_directory()
            True

            >>> handler.clear_directory()
            False
        '''
        if builtins.len(self):
            self.iterate_directory(self.remove_deep.__name__)
            return not builtins.len(self)
        return False

    @JointPoint
# # python3.5
# #     def iterate_directory(
# #         self: Self, function: (builtins.str, Function, Method, JointPoint),
# #         recursive=False, recursive_in_link=True,
# #         deep_first=False, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def iterate_directory(
        self, function, recursive=False, recursive_in_link=True,
        deep_first=False, *arguments, **keywords
    ):
# #
        '''
            Apply a given function or method to the current directory path. \
            If the optional parameter "recursive" is set to "True" the given \
            function is applied to to all subdirectories of the current path. \
            If the given parameter "function" is a string, a new instance of \
            "Directory" will be created for each object. If "function" \
            represents a local method the current scope will be accessible in \
            the given method.

            **function**          - If is a string, a new instance is created \
                                    otherwise not.

            **recursive**         - Indicates whether iteration should be \
                                    recursive.

            **recursive_in_link** - Indicates whether links should be followed.

            **deep_first**        - Indicates whether breath first or deep \
                                    first recursive tree traversal should be \
                                    used.

            Additional arguments or keywords will be forwarded to given \
            function.

            Returns "False" if any call of "function" returns "False" or \
            current thread was terminated and "True" otherwise.

            If function call returns "False" further iterations in current \
            dimension will be stopped. If function's return value is "None", \
            current file object is a directory and recursion is enabled the \
            iteration will not enter current directory (NOTE: this makes only \
            sense if you disable deep first search!).

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> Handler().iterate_directory(function=lambda file: file)
            True

            >>> Handler().iterate_directory(function=lambda file: False)
            False

            >>> elements = []

            >>> Handler().iterate_directory(
            ...     function=lambda file: elements.append(file.name))
            True
            >>> elements # doctest: +ELLIPSIS
            [...'file.py'...]

            >>> Handler().iterate_directory(
            ...     lambda file: elements.append(file.name), deep_first=False)
            True

            >>> Platform.terminate_thread = True
            >>> Handler().iterate_directory(lambda file: True)
            False
            >>> Platform.terminate_thread = False

            >>> Handler(
            ...     Handler(__file_path__).directory.path + '../'
            ... ).iterate_directory(
            ...     lambda file: True, deep_first=False,
            ...     recursive=True)
            True

        '''
        from boostnode.extension.system import Platform
        files = self._sort_directory_to_end(self.list(), recursive_in_link)
        if deep_first:
            files.reverse()
        for file in files:
            if Platform.check_thread():
                return False
            if deep_first and recursive and file.is_directory(
                allow_link=recursive_in_link
            ):
                '''
                    Take this method type by another instance of this class \
                    via introspection.
                '''
                builtins.getattr(file, inspect.stack()[0][3])(
                    function, recursive, recursive_in_link, deep_first,
                    *arguments, **keywords)
# # python3.5
# #             if builtins.isinstance(function, builtins.str):
            if builtins.isinstance(function, (
                builtins.unicode, builtins.str
            )):
# #
                result = builtins.getattr(file, function)(
                    *arguments, **keywords)
            else:
                result = function(file, *arguments, **keywords)
            if result is False:
                return False
            if not deep_first and recursive and result is not None and \
            file.is_directory(allow_link=recursive_in_link):
                '''
                    Take this method type by another instance of this class \
                    via introspection.
                '''
                builtins.getattr(file, inspect.stack()[0][3])(
                    function, recursive, recursive_in_link, deep_first,
                    *arguments, **keywords)
        return True

    @JointPoint
# # python3.5
# #     def delete_file_patterns(self: Self, *patterns: builtins.str) -> Self:
    def delete_file_patterns(self, *patterns):
# #
        '''
            Removes files with filenames matching the given patterns. This \
            method search recursively for matching file names.

            Each argument will be interpreted as file name pattern to delete.

            Examples:

            >>> handler = Handler(
            ...     __test_folder__.path + 'delete_file_patterns',
            ...     make_directory=True)
            >>> a_a = Handler(handler.path + 'a.a')
            >>> a_a.content = 'A'
            >>> a_b = Handler(handler.path + 'a.b')
            >>> a_b.content = 'A'
            >>> b_b = Handler(handler.path + 'b.b')
            >>> b_b.content = 'A'
            >>> a_c = Handler(handler.path + 'a.c')
            >>> a_c.content = 'A'

            >>> handler.delete_file_patterns(
            ...     '.+\.b', 'a\.c'
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...delete_file_patterns..."...

            >>> a_a.is_file()
            True
            >>> a_b.is_file()
            False
            >>> b_b.is_file()
            False
            >>> a_c.is_file()
            False
        '''
        for file in builtins.filter(lambda file: Iterable(
            patterns
        ).is_in_pattern(value=file.name), self):
            file.remove_deep()
        return self

    # # endregion

    # # region protected

    @JointPoint
# # python3.5
# #     def _apply_safe_offset(
# #         self: Self, offset: builtins.int, whence: builtins.int,
# #         file: builtins.file
# #     ) -> builtins.int:
    def _apply_safe_offset(self, offset, whence, file):
# #
        '''Apply given offset to given file handler.'''
        difference = 0
        if offset != 0:
            try:
                file.seek(offset, whence)
            except builtins.IOError:
                '''
                    If file is to short for given range, set pointer to the \
                    nearest valid position.
                '''
                if whence == 2:
                    difference = -1 * offset - builtins.int(self.size)
                    file.seek(offset + difference, whence)
                else:
                    difference = offset - builtins.int(self.size)
                    file.seek(offset - difference, whence)
        return difference

    @JointPoint
# # python3.5     def _list_windows_root(self: Self) -> Generator:
    def _list_windows_root(self):
        '''List partitions on windows root file systems.'''
        for letter_number in builtins.range(
                builtins.ord('A'), builtins.ord('Z') + 1):
            path = '%s:\\' % builtins.chr(letter_number)
# # python3.5
# #             if os.path.exists(path):
            if os.path.exists(convert_to_string(path)):
# #
                yield self.__class__(location=path)

    @JointPoint
# # python3.5
# #     def _prepare_content_status(
# #         self: Self, mode: (builtins.str, builtins.type(None)),
# #         content: (builtins.str, builtins.bytes)
# #     ) -> builtins.str:
    def _prepare_content_status(self, mode, content):
# #
        '''Initializes a file for changing its content,'''
        if self.is_element() and not self.is_file():
            raise __exception__(
                'Set content is only possible for files and not for "%s" '
                '(%s).', self.path, self.type)
        if mode is None:
            mode = 'w'
            if Object(content).is_binary():
                mode = 'w+b'
        return mode

    @JointPoint
# # python3.5
# #     def _get_ending_delimter_trimmed(self: Self) -> builtins.str:
    def _get_ending_delimter_trimmed(self):
# #
        '''Removes all ending path delimiters from given path.'''
        path = self._path
        while path.endswith(os.sep):
            path = path[:-builtins.len(os.sep)]
        return path

    @JointPoint
# # python3.5
# #     def _get_path(
# #         self: Self, location: (SelfClassObject, builtins.str),
# #         respect_root_path: (builtins.bool, builtins.type(None)),
# #         output_with_root_prefix: (builtins.bool, builtins.type(None))
# #     ) -> builtins.str:
    def _get_path(
        self, location, respect_root_path, output_with_root_prefix
    ):
# #
        '''
            This method is used as helper method for "get_path()". It deals \
            the case where an explicit location was given.

            Examples:

            >>> Handler()._get_path(os.sep, True, False) # doctest: +ELLIPSIS
            '...'
        '''
        taken_respect_root_path = respect_root_path
        if respect_root_path is None:
            taken_respect_root_path = self._respect_root_path
        if not builtins.isinstance(location, self.__class__):
            location = self.__class__(
                location, respect_root_path=taken_respect_root_path,
                output_with_root_prefix=output_with_root_prefix)
        return location.get_path(
            respect_root_path=taken_respect_root_path,
            output_with_root_prefix=output_with_root_prefix)

    @JointPoint
# # python3.5
# #     def _make_link(
# #         self: Self, target: (SelfClassObject, builtins.str),
# #         symbolic: builtins.bool, *arguments: builtins.object, force=False,
# #         relative=None, **keywords: builtins.object
# #     ) -> builtins.bool:
    def _make_link(
        self, target, symbolic, *arguments, **keywords
    ):
# #
        '''
            Makes hard or symbolic links and handles the optional force option.

            Examples:

            >>> target = Handler(
            ...     __test_folder__.path + '_make_link', make_directory=True)
            >>> Handler()._make_link(target, symbolic=True)
            False
        '''
# # python3.5
# #         pass
        keywords_dictionary = Dictionary(content=keywords)
        force, keywords = keywords_dictionary.pop_from_keywords(
            name='force', default_value=False)
        relative, keywords = keywords_dictionary.pop_from_keywords(
            name='relative')
# #
        target = self.__class__(location=target)
        if force:
            return self._make_forced_link(
                symbolic, target, relative, *arguments, **keywords)
        elif target:
            __logger__.warning(
                'Link from "{path}" to "{target_path}" wasn\'t created '
                'because "{target_path}" already exists.'.format(
                    path=self.path, target_path=target.path))
            return False
        return self._make_platform_dependent_link(
            symbolic, target, relative, *arguments, **keywords)

    @JointPoint
# # python3.5
# #     def _is_equivalent_folder(
# #         self: Self, other: SelfClassObject, second_round=False
# #     ) -> builtins.bool:
    def _is_equivalent_folder(self, other, second_round=False):
# #
        '''
            Returns "True" if given folder contains likewise content. Serves \
            as helper method.

            Examples:

            >>> target = Handler(
            ...     __test_folder__.path + '_is_equivalent_folder')

            >>> Handler().copy(target)
            True
            >>> del target[0]
            >>> target._is_equivalent_folder(Handler())
            False

            >>> target.remove_deep()
            True
            >>> Handler().copy(target)
            True
            >>> del target[0]
            >>> target[0].content = ''
            >>> Handler()._is_equivalent_folder(target)
            False
        '''
        for file in self:
            same_so_far = False
            for other_file in other:
                if(file.name == other_file.name and
                   file.type == other_file.type):
                    if file.is_equivalent(other=other_file):
                        same_so_far = True
                        break
                    else:
                        return False
            if not same_so_far:
                return False
        '''We have to check the other way around.'''
        return second_round or other._is_equivalent_folder(
            self, second_round=True)

    @JointPoint
# # python3.5     def _prepend_root_path(self: Self) -> builtins.str:
    def _prepend_root_path(self):
        '''
            Prepends root path prefix to current file path.

            Examples:

            >>> root_backup = Handler.get_root()

            >>> Handler.set_root(
            ...     location='/not/existing/'
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.FileError: Invalid path "..." ...

            >>> Handler.set_root(root_backup) # doctest: +ELLIPSIS
            <class '...Handler'>

            >>> Handler()._prepend_root_path() # doctest: +ELLIPSIS
            '...'

            >>> handler = Handler()
            >>> handler._path = 'hans'
            >>> handler._prepend_root_path() # doctest: +ELLIPSIS
            '/hans'
        '''
        from boostnode.extension.system import Platform
        '''
            Prepend root path to given path location, if it wasn't given as \
            location in root path.
        '''
        if(self._respect_root_path and (self._initialized_path.startswith(
                self.__class__._root_path[:-builtins.len(os.sep)]) or
            not self._path.startswith(
                self.__class__._root_path[:-builtins.len(os.sep)])) and not
            ('windows' == Platform().operating_system and
             regularExpression.compile('[a-zA-Z]:\\').match(self._path) and
             self.__class__._root_path == os.sep)):
            if self._path.startswith(os.sep):
                self._path = self.__class__._root_path[:-builtins.len(
                    os.sep
                )] + self._path
            else:
                self._path = self.__class__._root_path + self._path
        return self._path

    @JointPoint
# # python3.5
# #     def _handle_path_existence(
# #         self: Self,
# #         location: (builtins.str, SelfClassObject, builtins.type(None)),
# #         make_directory: builtins.bool, must_exist: builtins.bool,
# #         arguments: builtins.tuple, keywords: builtins.dict
# #     ) -> Self:
    def _handle_path_existence(
        self, location, make_directory, must_exist, arguments, keywords
    ):
# #
        '''
            Make initial existence like it was specified on initialisation.

            Examples:

            >>> Handler(
            ...     __test_folder__.path +
            ...     '_handle_path_existence_not_existing'
            ... )._handle_path_existence(Handler(
            ...     __test_folder__.path +
            ...     '_handle_path_existence_not_existing'
            ... ), False, True, (), {}) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.FileError: Invalid path...
        '''
        if make_directory and not self:
            self.make_directory(*arguments, **keywords)
        if not self._set_path(path=self._path) and must_exist:
            if builtins.isinstance(location, self.__class__):
                location = location._path
            raise __exception__(
                'Invalid path "{path}" for an object of "{class_name}". Given '
                'path was "{given_path}".'.format(
                    path=self.path, class_name=self.__class__.__name__,
                    given_path=location))
        return self

    @JointPoint
# # python3.5     def _initialize_path(self: Self) -> builtins.str:
    def _initialize_path(self):
        '''
            Normalizes reference to file object.

            Examples:

            >>> Handler()._initialize_path() # doctest: +ELLIPSIS
            '...boostnode...extension'

            >>> Handler('~')._initialize_path() # doctest: +ELLIPSIS
            '...'

            >>> Handler('test/~')._initialize_path() # doctest: +ELLIPSIS
            '...test...~'

            >>> Handler(
            ...     '///test//hans/~'
            ... )._initialize_path() # doctest: +ELLIPSIS
            '...test...hans...~'
        '''
        self._path = self._initialized_path
# # python3.5
# #         self._path = os.path.normpath(os.path.expanduser(self._path))
# #         if regularExpression.compile('[a-zA-Z]:').fullmatch(
# #             self._initialized_path
# #         ):
        self._path = convert_to_unicode(os.path.normpath(
            os.path.expanduser(convert_to_string(self._path))))
        if regularExpression.compile('[a-zA-Z]:$').match(
            self._initialized_path
        ):
# #
            self._path += os.sep
        if not self.is_referenced_via_absolute_path():
# # python3.5
# #             self._path = os.path.abspath(self._path)
            self._path = convert_to_unicode(os.path.abspath(
                convert_to_string(self._path)))
# #
        return self._path

    @JointPoint
# # python3.5
# #     def _initialize_location(
# #         self: Self,
# #         location: (SelfClassObject, builtins.str, builtins.type(None))
# #     ) -> builtins.str:
    def _initialize_location(self, location):
# #
        '''
            Normalizes a given file object reference to "builtins.str". If \
            "None" is given current directory path is returned.

            Examples:

            >>> Handler()._initialize_location(None)
            '.'

            >>> Handler()._initialize_location(Handler()) == Handler()._path
            True
        '''
        if location is None:
# # python3.5             location = os.curdir
            location = convert_to_unicode(os.curdir)
        elif builtins.isinstance(location, self.__class__):
            if self._respect_root_path:
                location = location.path
            else:
                location = location._path
# # python3.5         return location
        return convert_to_unicode(location)

    @JointPoint
# # python3.5
# #     def _set_path(self: Self, path: builtins.str) -> builtins.bool:
    def _set_path(self, path):
# #
        '''
            Sets path for the currently used "Handler" object in an convinced \
            platform independent way.

            Returns "True" if the given path exists on the file system or \
            "False" otherwise.

            Examples:

            >>> Handler()._set_path(path=__file_path__)
            True

            >>> Handler()._set_path(
            ...     path=__test_folder__.path + 'set_path_not_existing_file')
            False

            >>> handler = Handler()
            >>> handler._set_path(path='.')
            True
            >>> handler.path # doctest: +ELLIPSIS
            '...boostnode...'
        '''
# # python3.5
# #         self._path = os.path.normpath(path)
# #         if not self.is_referenced_via_absolute_path():
# #             self._path = os.path.abspath(self._path)
        self._path = convert_to_unicode(os.path.normpath(
            convert_to_string(path)))
        if not self.is_referenced_via_absolute_path():
            self._path = convert_to_unicode(os.path.abspath(
                convert_to_string(self._path)))
        self.path
# #
        return self.is_element()

    @JointPoint
# # python3.5
# #     def _make_forced_link(
# #         self: Self, symbolic: builtins.bool, target: SelfClassObject,
# #         relative: (builtins.object, builtins.type),
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> builtins.bool:
    def _make_forced_link(
        self, symbolic, target, relative, *arguments, **keywords
    ):
# #
        '''
            Creates a symbolic link whether their exists already a file with \
            given link location or link target doesn't exist.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> Handler()._make_forced_link(
            ...     True, Handler(), False
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.FileError: ...

            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     Handler(
            ...         __test_folder__.path + '_make_forced_link_not_existing'
            ...     )._make_forced_link(
            ...         True, Handler(
            ...             __test_folder__.path + '_make_forced_link_target'),
            ...         False)
            True

            >>> target = Handler(
            ...     __test_folder__.path + '_make_forced_link_target',
            ...     make_directory=True)
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     Handler(
            ...         __test_folder__.path + '_make_forced_link_source',
            ...         make_directory=True
            ...     )._make_forced_link(True, target, False)
            True

            >>> source = Handler(
            ...     __test_folder__.path + '_make_forced_link_source',
            ...     make_directory=True)
            >>> nested_target = Handler(
            ...     target.path + 'file', make_directory=True)
            >>> target.change_right(500) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
            >>> if Platform().operating_system == 'windows':
            ...     False
            ... else:
            ...     source._make_forced_link(True, nested_target, False)
            False
            >>> target.change_right(777) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
        '''
        if self == target:
            raise __exception__(
                'It isn\'t possible to link to itself ("%s").', self.path)
        if target:
            if not target.remove_deep():
                return False
        if not self:
            '''
                Create a necessary dummy path to create symbolic links \
                pointing to nothing.
            '''
            path = ''
            for path_part in self._path[self._path.find(os.sep) + 1:].split(
                os.sep
            ):
                path += os.sep + path_part
                path_object = self.__class__(location=path)
                if not path_object:
                    break
            self.make_directories()
            successfull = self._make_platform_dependent_link(
                symbolic, target, relative, *arguments, **keywords)
            '''Delete everything we temporary created before.'''
            path_object.remove_deep()
            return successfull
        return self._make_platform_dependent_link(
            symbolic, target, relative, *arguments, **keywords)

    # # # region handle platform dependencies

    @JointPoint
# # python3.5
# #     def _make_platform_dependent_link(
# #         self: Self, symbolic: builtins.bool, target: SelfClassObject,
# #         relative: (builtins.object, builtins.type),
# #         *arguments: builtins.object, force_windows_behavior=False,
# #         **keywords: builtins.object
# #     ) -> builtins.bool:
    def _make_platform_dependent_link(
        self, symbolic, target, relative, *arguments, **keywords
    ):
# #
        '''
            Handles platform dependent stuff by creating a symbolic link.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> handler = Handler(
            ...     __test_folder__.path + '_make_platform_dependent_link')

            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     Handler()._make_platform_dependent_link(
            ...         symbolic=True, target=handler, relative=False)
            True

            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     handler.remove_file()
            True
            >>> handler._path += os.sep
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     Handler()._make_platform_dependent_link(
            ...         symbolic=True, target=handler, relative=True)
            True

            >>> handler = Handler(
            ...     __test_folder__.path +
            ...     '_make_platform_dependent_link_windows')
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     Handler()._make_platform_dependent_link(
            ...         symbolic=True, target=handler, relative=True,
            ...         force_windows_behavior=True)
            True

            >>> os_symlink_backup = os.symlink
            >>> del os.symlink
            >>> handler = Handler(
            ...     __test_folder__.path +
            ...     '_make_platform_dependent_link_fallback')
            >>> if Platform().operating_system == 'windows':
            ...     True
            ... else:
            ...     Handler()._make_platform_dependent_link(
            ...         symbolic=True, target=handler, relative=True,
            ...         force_windows_behavior=True)
            True
            >>> os.symlink = os_symlink_backup
        '''
        from boostnode.extension.system import Platform
# # python3.5
# #         pass
        force_windows_behavior, keywords = Dictionary(
            content=keywords
        ).pop_from_keywords(
            name='force_windows_behavior', default_value=False)
# #
        target_path = target._path
        if target._path.endswith(os.sep):
            target_path = target._path[:-builtins.len(os.sep)]
        source_path = self._determine_relative_path(relative, target_path)
        if source_path.endswith(os.sep):
            source_path = source_path[:-builtins.len(os.sep)]
        if symbolic:
            try:
                if(Platform().operating_system == 'windows' or
                   force_windows_behavior):
# # python3.5
# #                     os.symlink(
# #                         source_path, target_path,
# #                         target_is_directory=self.is_directory())
# #                 else:
# #                     os.symlink(source_path, target_path)
                    create_symbolic_link = \
                        ctypes.windll.kernel32.CreateSymbolicLinkW
                    create_symbolic_link.argtypes = (
                        ctypes.c_wchar_p, ctypes.c_wchar_p,
                        ctypes.c_uint32)
                    create_symbolic_link.restype = ctypes.c_ubyte
                    if create_symbolic_link(
                        convert_to_string(target_path),
                        convert_to_string(source_path),
                        self.is_directory()
                    ) == 0:
                        raise ctypes.WinError()
                else:
                    os.symlink(
                        convert_to_string(source_path),
                        convert_to_string(target_path))
# #
            except(builtins.AttributeError, builtins.NotImplementedError):
                return self.make_portable_link(target, *arguments, **keywords)
            else:
                return target.is_symbolic_link()
# # python3.5
# #         os.link(source_path, target_path)
        os.link(
            convert_to_string(source_path),
            convert_to_string(target_path))
# #
        return target.is_file()

    @JointPoint
# # python3.5
# #     def _determine_relative_path(
# #         self: Self, relative: (builtins.object, builtins.type),
# #         target_path: builtins.str
# #     ) -> builtins.str:
    def _determine_relative_path(self, relative, target_path):
# #
        '''
            Determines relative path depending on given requirements defined \
            by "relative".

            Examples:

            >>> Handler()._determine_relative_path(
            ...     Self, './'
            ... ) # doctest: +ELLIPSIS
            '...'

            >>> Handler()._determine_relative_path(Handler(), './')
            '.'
        '''
        if relative:
            if relative is Self:
                '''
                    NOTE: "target_path" is one level to deep because \
                    references are saved in parent directory.
                '''
                return self.get_relative_path(
                    context=self.__class__(
                        location=target_path, respect_root_path=False
                    ).directory.path)
# # python3.5
# #             if builtins.isinstance(relative, (
# #                 builtins.str, self.__class__
# #             )):
            if builtins.isinstance(relative, (
                builtins.unicode, self.__class__
            )):
# #
                return self.get_relative_path(context=relative)
            return self.relative_path
        return self._path

    @JointPoint
# # python3.5
# #     def _determine_get_windows_disk_free_space_function(
# #         self: Self
# #     ) -> ctypes._CFuncPtr:
    def _determine_get_windows_disk_free_space_function(self):
# #
        '''
            Determines windows internal method to get disk free space.

            Examples:

            >>> from boostnode.extension.system import Platform

            >>> if Platform().operating_system == 'windows':
            ...     Handler()._determine_get_windows_disk_free_space_function()
            ... else:
            ...     Handler # doctest: +ELLIPSIS
            <...>
        '''
        if(sys.version_info >= (3,) or
           builtins.isinstance(self._path, builtins.unicode)):
            return ctypes.windll.kernel32.GetDiskFreeSpaceExW
        return ctypes.windll.kernel32.GetDiskFreeSpaceExA

    @JointPoint
# # python3.5
# #     def _get_platform_dependent_free_and_total_space(
# #         self: Self
# #     ) -> (builtins.bool, builtins.tuple):
    def _get_platform_dependent_free_and_total_space(self):
# #
        '''
            Handles platform dependent stuff by determining free and total \
            space on given file system location.

            Examples:

            >>> isinstance(
            ...     Handler()._get_platform_dependent_free_and_total_space(),
            ...     builtins.tuple)
            True

            >>> Handler(
            ...     'not_existing'
            ... )._get_platform_dependent_free_and_total_space()
            False
        '''
        os_statvfs = self._initialize_platform_dependencies()
# # python3.5
# #         if os.path.isfile(self._path) or os.path.isdir(self._path):
        if os.path.isfile(convert_to_string(self._path)) or os.path.isdir(
            convert_to_string(self._path)
        ):
# #
            if os_statvfs is not None:
                return (
                    os_statvfs.f_bavail * self.BLOCK_SIZE_IN_BYTE,
                    os_statvfs.f_blocks * self.BLOCK_SIZE_IN_BYTE)
            if builtins.hasattr(ctypes, 'windll'):
                path = self._path
                if self.is_file():
                    path = self.directory.path
                free_bytes = ctypes.c_ulonglong(0)
                total_bytes = ctypes.c_ulonglong(0)
# # python3.5
# #                 self._determine_get_windows_disk_free_space_function()(
# #                     ctypes.c_wchar_p(path), None, ctypes.pointer(
# #                         total_bytes),
# #                     ctypes.pointer(free_bytes))
                self._determine_get_windows_disk_free_space_function()(
                    ctypes.c_wchar_p(
                        convert_to_string(path)
                    ), None, ctypes.pointer(total_bytes),
                    ctypes.pointer(free_bytes))
# #
                return free_bytes.value, total_bytes.value
        return False

    @JointPoint
# NOTE return type only available in unix like systems:
# -> (posix.statvfs_result, builtins.type(None))
# # python3.5
# #     def _initialize_platform_dependencies(
# #         self: Self, force_macintosh_behavior=False
# #     ):
    def _initialize_platform_dependencies(
        self, force_macintosh_behavior=False
    ):
# #
        '''
            Handles platform specified stuff like determining i-Node size.

            Examples:

            >>> Handler()._initialize_platform_dependencies(
            ...     ).__class__ # doctest: +ELLIPSIS
            <...>

            >>> Handler()._initialize_platform_dependencies(
            ...     True).__class__ # doctest: +ELLIPSIS
            <...>
        '''
        from boostnode.extension.system import Platform
        os_statvfs = None
# # python3.5
# #         if((os.path.isfile(self._path) or os.path.isdir(self._path)) and
# #            builtins.hasattr(os, 'statvfs')):
# #             os_statvfs = os.statvfs(self._path)
        if((os.path.isfile(convert_to_string(self._path)) or
           os.path.isdir(convert_to_string(self._path))) and
           builtins.hasattr(os, 'statvfs')):
            os_statvfs = os.statvfs(convert_to_string(self._path))
# #
            self.__class__.BLOCK_SIZE_IN_BYTE = os_statvfs.f_bsize
            self.__class__.MAX_FILE_NAME_LENGTH = os_statvfs.f_namemax
            if(Platform().operating_system == 'macintosh' or
               force_macintosh_behavior):
                self.__class__.DECIMAL = True
        return os_statvfs

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
if __name__ == '__main__':
    from boostnode.extension.native import Module
    Module.default(
        name=__name__, frame=inspect.currentframe(), default_caller=False)

# endregion

# region vim modline
# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:
# endregion
