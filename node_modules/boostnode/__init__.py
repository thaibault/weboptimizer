#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

"""
    Offers a higher level for common tasks. Most of the modules are written \
    on top of python's native implementations.

    Package meta informations
    =========================

    Copyright Torben Sickert 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons \
    naming 3.0 unported license. \
    see https://creativecommons.org/licenses/by/3.0/deed.de

    Additional conventions beside pep8 (bcX := boostnode convention number X)
    -------------------------------------------------------------------------

    - bc1 Only use utf-8 file encoding and unix line feeds (\\n)
        - bad: text...\\r\\n or text...\\r
        - good: text...\\n

    - bc2 Don't use tabulators instead of whitespaces. Always indent with 4 \
          whitespaces.

    - bc3 Capitalized variables are constant and shouldn't be mutable.

    - bc4 Properties with preceding underscores shouldn't be accessed from \
          the outer scope. They could accessed in inherited objects \
          (protected attributes).

    - bc5 Property with two preceding underscore shouldn't be accessed from \
          any location then the object itself (private attributes).

    - bc6 Always use one whitespace between except or return statements and \
          preceding statements.

    >>> try:
    ...     pass
    ... except (...):
    ...     pass

    or

    >>> return {}

    instead of

    >>> try:
    ...     pass
    ... except(...):
    ...     pass

    or

    >>> return{}

    - bc7 Do not use more chars then 79 in one line.

    - bc8 Use short and/or long description doc-strings for all definitions.

    - bc9 Write doctest for each unit it is possible and try to reach 100% \
          path coverage.

    - bc10 Sorting imports as following: \
        1. Standard libraries, \
        2. Published third party libraries, \
        3. Your own unpublished libraries, \
        4. Your own modules or packages, \
        5. Sort import names alphabetically and separate the previous defined \
           parts with blank lines.

    - bc11 Use builtin names with the "builtins." prefix.

    - bc12 Don't use any abbreviations.

    - bc13 Use smaller or equal cyclomatic complexity to eight.

    - bc14 Use the modules pattern described below.

    - bc15 Use the area statement syntax to structure your code and make it \
           possible to fold them in many IDE's (see Structure of meta \
           documenting below). If you are forced to indent an area nearer to \
           left border as in the logic of meta structuring use one "#" for \
           each less of indention.

    - bc16 If a module could offer a usable command line interface to provide \
           their functionality directly for other programs (maybe not written \
           in python) implement the "Runnable" interface from \
           "boostnode.extension.system.Runnable".

    - bc17 Make every script or package standalone runnable. That means you \
           should use relative import references or append your own import \
           path which is dynamically generated.

    - bc18 Always think that code is more red than written.

    - bc19 By choosing witch quotes to use follow this priority. \
        1. Single quote (') \
        2. Double quote (") \
        3. Triple single quote (''') \
        4. Triple double quote (three times ") \

    - bc20 Always write a static class property via the class reference \
           like: "self.__class__.static_property". Don't use any implicit \
           references like "self.static_property".

    - bc21 Always read for object properties directly, no matter if they are \
           static or dynamic. Use "self.static_property" instead of \
           "self.__class__.static_property".

    - bc22 Indent function parameter which doesn't match in one line like:

    >>> def function_name(
    ...     parameter1, parameter2, parameter3,
    ...     parameter4='default_value'
    ... ):
    ...     return {'a': 5}

    instead of:

    >>> def function_name(parameter1,
    ...                   parameter2,
    ...                   parameter3,
    ...                   parameter4='default_value'
    ... ):
    ...     return {'a': 5}

    - bc23 Indent function call brackets like:

    >>> function_name(
    ...     'parameter1', 'parameter2', 'parameter3'
    ... ).get('a')
    5

    instead of:

    >>> function_name(
    ...     'parameter1', 'parameter2', 'parameter3').get('a')
    5

    Structure of meta documenting classes. (see bc14)
    -------------------------------------------------

    >>> # region header
    ...
    ... import sys
    ... # ...
    ...
    ... # endregion
    ...
    ... # region function
    ...
    ... def a: pass
    ... def b: pass
    ...
    ... # endregion
    ...
    ... # region abstract classes
    ...
    ... class A:
    ...
    ...     '''Class level description'''
    ...
    ...     # region properties
    ...
    ...     '''Description for public constant.'''
    ...     A = 4
    ...     '''Description for protected constant.'''
    ...     _B = 'example'
    ...     '''Description for private constant.'''
    ...     __B = 'private'
    ...     '''Description for public static property.'''
    ...     a = 2
    ...     '''Description for protected static property.'''
    ...     _b = 2
    ...     '''Description for private static property.'''
    ...     __b = 5
    ...
    ...     # endregion
    ...
    ...     # region static methods
    ...
    ...     # # region public
    ...
    ...     # ...
    ...
    ...                 # - region compensate right indention
    ...
    ...     # ...
    ...
    ...             # endregion
    ...
    ...     # ...
    ...
    ...     # # endregion
    ...
    ...     # endregion
    ...
    ...     # region dynamic methods
    ...
    ...     # # region public
    ...
    ...     # # # region special
    ...
    ...     def __init__(self):
    ...         '''Initializer's docstring.'''
    ...
    ...         # # region properties
    ...
    ...         a = 5
    ...         '''Description for public dynamic property.'''
    ...         _a = 4
    ...         '''Description for protected dynamic property.'''
    ...         __b = 'privat'
    ...         '''Description for private dynamic property.'''
    ...
    ...         # # endregion
    ...
    ...     # # # endregion
    ...
    ...     # ...
    ...
    ...     # # endregion
    ...
    ...     # endregion
    ...
    ...     # region protected
    ...
    ...     # ...
    ...
    ...     # endregion
    ...
    ... # endregion
    ...
    ... # region classes
    ...
    ... class B:
    ...
    ...    '''Class level documentation.'''
    ...
    ...    pass
    ...    # ...
    ...
    ... # endregion
    ...
    ... # region footer
    ...
    ... if __name__ == '__main__':
    ...     pass
    ...     # ...
    ...
    ... # endregion # doctest: +SKIP

    Structure of dependencies
    -------------------------

    0.  builtins
    1.  boostnode.extension.type
    2.  boostnode.aspect.signature
    3.  boostnode.paradigm.objectOrientation
    4.  boostnode.paradigm.aspectOrientation
    5.  boostnode.extension.native
    6.  boostnode.extension.file
    7.  boostnode.extension.output
    8.  boostnode.extension.system
    9.  boostnode.*
    10. yourOwnModulesOrPackages.*

    This means that a module in level "i" could only import a full module in \
    its header in level "j" if "j < i" holds. If your try to import a module \
    from a higher level ("j < i") you could try to use the \
    "from ... import ..." statement in the needed context dependent scope.

    Module pattern (see bc14)
    -------------------------

    >>> #!/usr/bin/env python3.5
    ... # -*- coding: utf-8 -*-
    ...
    ... # region header
    ...
    ... '''
    ...     Module documentation which should be useable as help message for \\
    ...     modules which supports command line interfaces \\
    ...     (see Runnable implementation interface).
    ... '''
    ... '''
    ...     For conventions see "boostnode/__init__.py" on \\
    ...     https://github.com/thaibault/boostnode
    ... '''
    ...
    ... __author__ = 'FULL NAME'
    ... __copyright__ = 'see boostnode/__init__.py'
    ... __credits__ = 'FIRST NAME', 'SECOND NAME', ...
    ... __license__ = 'see boostnode/__init__.py'
    ... __maintainer__ = 'FULL NAME'
    ... __maintainer_email__ = 'EMAIL ADDRESS'
    ... __status__ = 'e.g. "Beta"'
    ... __version__ = 'e.g. 0.9'
    ...
    ... # # python2.7 import __builtin__ as builtins
    ... import builtins
    ... import inspect
    ...
    ... sys.path.append(os.path.abspath(sys.path[0] + 2 * ('..' + os.sep)))
    ... '''see bc17'''
    ...
    ... # # python2.7 from boostnode import convert_to_unicode
    ... pass
    ... from boostnode.extension.file import Handler as FileHandler
    ...
    ... # endregion
    ...
    ...
    ... # region functions
    ...
    ... def main():
    ...     '''Description of this method.'''
    ...     pass
    ...
    ... # endregion
    ...
    ... # region classes
    ...
    ... class testClass:
    ...
    ...     '''Description of this class.'''
    ...
    ...     def __init__(self):
    ...         '''Description of the initializer method.'''
    ...         print('A class was initialized.')
    ...
    ... # endregion
    ...
    ... # region footer
    ...
    ... '''
    ...     Preset some variables given by introspection letting the linter \\
    ...     know what globale variables are available.
    ... '''
    ... __logger__ = __exception__ = __module_name__ = __file_path__ = \\
    ...    __test_mode__ = __test_buffer__ = __test_folder__ = \\
    ...    __test_globals__ = None
    ... '''
    ...     Extends this module with some magic environment variables to \\
    ...     provide better introspection support. A generic command line \\
    ...     interface for some code preprocessing tools is provided by default.
    ... '''
    ... # Module.default(name=__name__, frame=inspect.currentframe())
    ...
    ... # endregion # doctest: +SKIP
    '\\n    Module documentation which should be useable as help message fo...'
"""

# # python3.5
# # pass
from __future__ import absolute_import, division, print_function, \
    unicode_literals
# #

__author__ = 'Torben Sickert'
__copyright__ = 'see module level docstring'
__credits__ = 'Torben Sickert',
__license__ = 'see module level docstring'
__maintainer__ = 'Torben Sickert'
__maintainer_email__ = 'info["~at~"]torben.website'
__status__ = 'stable'
__version__ = '1.0'

# # python3.5
# # import builtins
import __builtin__ as builtins
from collections import Iterable
from copy import deepcopy
# #
import inspect
import logging
import os
import sys

'''Make boostnode packages and modules importable via relative paths.'''
if sys.path[0]:
    sys.path.append(os.path.abspath(sys.path[0] + os.sep + '..'))
else:
    sys.path[0] = os.path.abspath(sys.path[0] + os.sep + '..')

# endregion

# region flags

sys.dont_write_bytecode = True
'''Don't generate cached byte code files for imported modules.'''

# endregion

# region constants

ENCODING = 'utf_8'
'''Defines the global default encoding.'''

# endregion

# region functions

# # python3.5
# # pass
'''
    Handling "builtins.str" and "builtins.unicode" in python2.7.X needs \
    some much attention. Because different API's uses different types. \
    The main development goes to "builtins.unicode" so working with \
    boostnode means you should use them.

    Every content which could contain a "builtins.str" type and may have \
    non ascii-characters should be converted via the \
    "boostnode.convert_to_unicode()" method.
'''


def convert_type_to_unicode(object):
    '''Converts a generic string representable object to unicode.'''
    if builtins.hasattr(object, '__unicode__'):
        return object.__unicode__()
    elif builtins.hasattr(object, '__str__'):
        try:
            object = object.__str__()
        except builtins.UnicodeEncodeError:
            if builtins.isinstance(object, Iterable):
                for index, item in builtins.enumerate(object):
                    object[index] = convert_to_unicode(item)
                object = object.__str__()
            else:
                raise
        if builtins.isinstance(object, builtins.unicode):
            return object
        return builtins.unicode(object, ENCODING)
    return builtins.unicode(object)


def convert_to_unicode(object):
    '''
        Converts given object to its unicode string representation like \
        python's native "builtins.str()" method.
    '''
    if builtins.isinstance(object, builtins.Exception):
        if builtins.hasattr(object, '__unicode__'):
            return object.__unicode__()
        if builtins.hasattr(object, 'message'):
            object = object.message
    if builtins.isinstance(object, builtins.unicode):
        '''
            NOTE: To force specified encoding we should encode and than \
            decode here.
        '''
        return object
    if builtins.isinstance(object, builtins.str):
        return builtins.unicode(object, ENCODING)
    if not builtins.isinstance(object, builtins.type):
        return convert_type_to_unicode(object)
    '''
        NOTE: We have to avoid using an explicit encoding to mimic python \
        native "builtins.str()" method behavior for getting a string \
        representation.
    '''
    return builtins.unicode(object)


def convert_to_string(object):
    '''
        Converts given object to its str string representation like \
        python's native "builtins.str()" method.
    '''
    '''NOTE: We check for string type to boost already converted values.'''
    if builtins.isinstance(object, builtins.str):
        return object
    return convert_to_unicode(object).encode(ENCODING)
# #


# # python3.5 def __get_all_modules__(path=sys.path[0]) -> builtins.list:
def __get_all_modules__(path=convert_to_unicode(sys.path[0])):
    '''
        This method provides a generic way to determine all modules in \
        current package or folder. It is useful for "__init__.py" files.

        **path** - Current working directory.

        Examples:

        >>> __get_all_modules__() # doctest: +ELLIPSIS
        [...]

        >>> from boostnode.extension.file import Handler as FileHandler

        >>> location = FileHandler(
        ...     __test_folder__.path + '__get_all_modules__',
        ...     make_directory=True)
        >>> a = FileHandler(location.path + 'a.py')
        >>> a.content = ''
        >>> FileHandler(
        ...     location.path + 'b.pyc', make_directory=True
        ... ) # doctest: +ELLIPSIS
        Object of "Handler" with path "...__get_all_modu...b.pyc..." (type: ...

        >>> __get_all_modules__(__test_folder__.path + '__get_all_modules__')
        ['a']

        >>> a.remove_file()
        True
        >>> __get_all_modules__(__test_folder__.path + '__get_all_modules__')
        []

        >>> __get_all_modules__('')
        ['highPerformanceModification']
    '''
# # python3.5
# #     if not path:
# #         path = os.getcwd()
# #     return builtins.list(builtins.set(builtins.map(
# #         lambda name: name[:name.rfind('.')],
# #         builtins.filter(
# #             lambda name: (
# #                 (name.endswith('.py') or name.endswith('.pyc')) and
# #                 not name.startswith('__init__.') and os.path.isfile(
# #                     '%s%s%s' % (path, os.sep, name))),
# #             os.listdir(
# #                 path[:-(builtins.len(os.path.basename(path)) + 1)] if
# #                 os.path.isfile(path) else path)))))
    if not path:
        path = os.getcwd()
    return builtins.list(builtins.set(builtins.map(
        lambda name: name[:name.rfind('.')],
        builtins.filter(
            lambda name: (
                (name.endswith('.py') or name.endswith('.pyc')) and
                not name.startswith('__init__.') and os.path.isfile(
                    convert_to_string('%s%s%s' % (path, os.sep, name)))),
            builtins.map(
                lambda name: convert_to_unicode(name), os.listdir(
                    path[:-(builtins.len(os.path.basename(path)) + 1)] if
                    os.path.isfile(path) else path))))))
# #

# endregion

# region classes

if not builtins.getattr(builtins, "WindowsError", None):
    class WindowsError(builtins.OSError):
        pass

# endregion


# region variables

__all__ = __get_all_modules__()
'''Determine all modules in this folder via introspection.'''

# endregion

# region aspects

'''
    The function "__get_all_modules__()" has to be defined before importing \
    any modules from this package.
'''
if __name__ != '__main__':
    from boostnode.aspect.signature import add_check as add_signature_check
    from boostnode.extension.native import Module

# # python3.5
# #     pass
    builtins.reload(sys)
    sys.setdefaultencoding(ENCODING)
# #
    try:
        '''
            Add signature checking for all functions and methods with joint \
            points in this package.
        '''
        add_signature_check(point_cut='%s\..*' % Module.get_package_name(
            frame=inspect.currentframe()))
    except WindowsError as exception:
# # python3.5
# #         logging.error(
# #             'Running subprocesses on windows without being administrator '
# #             "isn't possible. %s: %s", exception.__class__.__name__,
# #             builtins.str(exception))
        logging.error(
            'Running subprocesses on windows without being administrator '
            "isn't possible. %s: %s", exception.__class__.__name__,
            convert_to_unicode(exception))
# #
        sys.exit(1)

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
    from boostnode.extension.system import CommandLine
    CommandLine.generic_package_interface(
        name=__name__, frame=inspect.currentframe())

# endregion

# region vim modline
# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:
# endregion
