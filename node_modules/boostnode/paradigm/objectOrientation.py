#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''
    This module implements features like getter and setter methods for \
    implementing object orientated code.
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
'''
    The concept

    Interface class is a high level interface support for interaction with \
    objects. This class transmits a full object oriented way to handle object \
    oriented concepts fast and efficient.

    Getter and setter

    If you let transmit your class from the "Class" class you can use a \
    getter or setter method for every property you need. A user of your class \
    doesn't have to know which property has its own getter/setter, an \
    universal getter/setter or nothing of them. A user can always try to \
    access any property defined with an underscore at the beginning of the \
    class with no underscore. If it's necessary to use a function to get or \
    set the property it will be executed, otherwise not. If no explicit or \
    general getter/setter is provided, the property still takes inaccessible. \
    Properties which should be accessible and doesn't need any getter or \
    setter method can be implemented without any underscore. Doing that way \
    saves your application performance because no needless function calls are \
    done.

    Getter/setter examples:

    >>> def get_example(self):
    ...     """
    ...         A special getter method for protected property "_example" which
    ...         only should read by "value = object.example".
    ...
    ...         Returns the actual value of "self._example".
    ...     """
    ...     """Do something depending on "self._example"."""
    ...     self.__dict__['_example'] += '_special_modified'
    ...     return self.__dict__['_example']

    >>> def set_example(self, value):
    ...     """
    ...         A special setter method for protected property "_example" which
    ...         should only be accessed by "object.example = some_value".
    ...
    ...         "value" The new value for "self._example".
    ...
    ...         Returns the new value of "self._example".
    ...     """
    ...     """Do something depending on "self._example"."""
    ...     self.__dict__['_example'] = value
    ...     return value

    >>> def get(self, name: builtins.str):
    ...     """
    ...         General getter method for all properties with no special getter
    ...         method.
    ...
    ...         "name" The property name which should be returned.
    ...
    ...         Returns the current value of the given property.
    ...     """
    ...     """Do something general depending on properties."""
    ...     self.__dict__[name] += '_general_modified'
    ...     return self.__dict__[name]

    >>> def set(self, name: builtins.str, value):
    ...     """
    ...         General setter method for all properties with no special setter
    ...         method.
    ...
    ...         "name" The property name which should be overwritten.
    ...         "value" The new value for the given property name.
    ...
    ...         Returns the new value of the given property.
    ...     """
    ...     """Do something general depending on properties."""
    ...     self.__dict__[name] = value
    ...     return value
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
import inspect
import os
import sys
# # python3.5
# # from types import MethodType as Method
pass
# #

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

# endregion


# region abstract classes

# # python3.5 class Class:
class Class(builtins.object):

    '''
        The main class which is intended for passing on other class. It \
        serves a scope for one application to minimize conflicts with other \
        classes in the global scope.
    '''

    # region static methods

    # # region public

    # # # region special

    @builtins.classmethod
# # python3.5     def __repr__(cls: builtins.type) -> builtins.str:
    def __repr__(cls):
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> repr(Class())
            'Object of "Class".'
        '''
        return 'Object of "%s".' % cls.__name__

    @builtins.classmethod
# # python3.5     def __str__(cls: builtins.type) -> builtins.str:
    def __str__(cls):
        '''
            Is triggered if the current object is tried to be converted into \
            a string object.

            It returns the output buffer as string.

            Examples:

            >>> str(Class())
            'Class'
        '''
        return cls.__name__

    # # # endregion

    # # # region decorator

    @builtins.classmethod
# # python3.5
# #     def pseudo_property(cls: builtins.object, function: Method) -> Method:
    def pseudo_property(cls, function):
# #
        '''
            Attaches a property to given function for indicating that given \
            function handles read access to corresponding property.

            **function** - Function which should act as property.

            Returns given function to be usable as decorator.
        '''
        function.pseudo_property = True
        return function

        # # endregion

    # # endregion

    # endregion

    # region dynamic methods

    # # region public method

    # # # region special

# # python3.5
# #     def __getattr__(
# #         self: builtins.object, name: builtins.str
# #     ) -> builtins.object:
    def __getattr__(self, name):
# #
        '''
            Is triggered if a property was tried to be read but is \
            inaccessible.

            **name** - is the inaccessible property name.

            Should return the current value of the given property name \
            depends on its getter method. Returns "None" if no getter method \
            is accessible.

            Examples:

            >>> class TestA(Class):
            ...     _a = 'hans'
            ...     _b = 5
            ...     def __init__(self, c=2): self._c = c
            ...     def get_a(self): return self._a
            ...     def get_c(self): return 2 * self._c
            >>> TestA().a
            'hans'
            >>> TestA().b # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            AttributeError: Property "b" doesn't exist in given instance of ...
            >>> TestA().c
            4

            >>> class TestB(Class):
            ...     _a = ''
            ...     def __init__(self):
            ...         self._a = 'hans'
            ...         self._b = 'also hans'
            ...     def get(self, name):
            ...         if name in ('_a', '_b'):
            ...             return self.__dict__[name]
            ...         return None
            >>> TestB().b
            'also hans'
            >>> TestB().c # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            AttributeError: Property "c" doesn't exist in given instance of ...
        '''
        internal_name = '_%s' % name
        getter_name = 'get%s' % internal_name
        special_method = None
        if self.is_method(name=getter_name):
            special_method = builtins.getattr(self, getter_name)
        if(self.is_property(internal_name) or special_method is not None and
           builtins.hasattr(special_method, 'pseudo_property')):
            if special_method is not None:
                return special_method()
            elif self.is_method(name='get'):
                return self.get(internal_name)
        raise builtins.AttributeError(
             'Property "%s" doesn\'t exist in given instance of "%s".' %
            (name, self.__class__.__name__))

# # python3.5
# #     def __setattr__(
# #         self, name: builtins.str, value: builtins.object
# #     ) -> builtins.object:
    def __setattr__(self, name, value):
# #
        '''
            Is triggered if a property was tried to overwrite but is \
            inaccessible.

            **name**  - is the inaccessible property name.

            **value** - is the new value for the given property name.

            Returns the new value of the given property name depending on the \
            presence of setter method otherwise "None" is returned.

            Examples:

            >>> class TestA(Class):
            ...     _a = 'hans'
            ...     def set_a(self, value):
            ...         self._a = 'Not only ' + value + '. Also hans.'
            >>> test_a = TestA()
            >>> test_a.a = 'peter'
            >>> test_a._a
            'Not only peter. Also hans.'
            >>> class TestB(Class):
            ...     _a = ''
            ...     _b = ''
            ...     def __init__(self):
            ...         self._a = 'hans'
            ...         self._b = 'also hans'
            ...     def set(self, name, value):
            ...         if name in ('_a', '_b'):
            ...             self.__dict__[name] = 'hans and ' + value
            >>> test_b = TestB()
            >>> test_b.a = 'peter'
            >>> test_b._a
            'hans and peter'
        '''
        if not self._set_attribute_helper(name, value):
            if name in self.__class__.__dict__:
                builtins.setattr(self.__class__, name, value)
            else:
                self.__dict__[name] = value
        return value

    # # # endregion

    # # # region boolean

# # python3.5     def is_method(self, name: builtins.str) -> builtins.bool:
    def is_method(self, name):
        '''
            Determines if the given class attribute is a callable method or \
            something else.

            **name** - function name to check

            Returns "True" if the given attribute is a method or "False" \
            otherwise.

            Examples:

            >>> Class().is_method('is_method')
            True
            >>> class A(Class): pass
            >>> A().is_method('is_method')
            True
            >>> Class().is_method('not existing')
            False
        '''
        if name in self.__class__.__dict__ and self._is_callable(
            self.__class__.__dict__[name]
        ) or name in self.__dict__ and self._is_callable(self.__dict__[name]):
            return True
        for base_class in self.__class__.__bases__:
            if name in base_class.__dict__ and self._is_callable(
                base_class.__dict__[name]
            ):
                return True
        return False

# # python3.5     def is_property(self, name: builtins.str) -> builtins.bool:
    def is_property(self, name):
        '''
            Determines if the given class attribute is a property or \
            something else.

            **name** - property name to check

            Returns "True" if the given attribute is a property or "False" \
            otherwise.

            Examples:

            >>> Class().is_property('is_property')
            False
            >>> Class.test = 'A'
            >>> Class().is_property('test')
            True
            >>> class A(Class): pass
            >>> A().is_property('test')
            True
        '''
        if name in self.__class__.__dict__ and not self._is_callable(
            self.__class__.__dict__[name]
        ) or name in self.__dict__ and not self._is_callable(
            self.__dict__[name]
        ):
            return True
        for base_class in self.__class__.__bases__:
            if(name in base_class.__dict__ and
               not self._is_callable(base_class.__dict__[name])):
                return True
        return False

    # # # endregion

    # # endregion

    # # region protected

# # python3.5
# #     def _is_callable(self, object: builtins.object) -> builtins.bool:
    def _is_callable(self, object):
# #
        '''Indicates if given method is a callable or a callable wrapper.'''
        return (
            builtins.callable(object) or
            builtins.isinstance(object, builtins.classmethod) or
            builtins.isinstance(object, builtins.staticmethod))

# # python3.5
# #     def _set_attribute_helper(
# #         self, name: builtins.str, value: builtins.object
# #     ) -> builtins.bool:
    def _set_attribute_helper(self, name, value):
# #
        '''
            Helper method for "self.__setattr__()". Does the actual overwrite \
            process on the given property.

            **name** - is the inaccessible property name.

            **value** - is the new value for the given property name.

            Returns "True" if the given property was successful overwritten \
            or "False" otherwise.
        '''
        name = '_%s' % name
        setter_name = 'set%s' % name
        if self.is_method(name=setter_name):
            builtins.getattr(self, setter_name)(value)
            return True
        elif self.is_method(name='set'):
            self.set(name, value)
            return True
        return False

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
