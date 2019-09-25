#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''
    Extension is a high level interface for interaction with pythons native \
    builtins. This class provides a full object oriented way to handle string \
    objects. Besides a number of new supported interactions with strings it \
    offers all core file system methods by the pythons native "builtins.str" \
    object.
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
# # from base64 import b64encode as base64_encode
# # import builtins
import __builtin__ as builtins
# #
from cgi import FieldStorage as CGIFieldStorage
from collections import deque
from collections import Iterable as NativeIterable
from copy import copy, deepcopy
from datetime import datetime as NativeDateTime
from datetime import time as NativeTime
from datetime import date as NativeDate
from datetime import timedelta as NativeTimeDelta
import encodings
import functools
from hashlib import sha224
import inspect
import os
import re as regularExpression
import sys
from time import mktime as make_time
from types import FrameType as Frame
from types import FunctionType as Function
from types import GeneratorType as Generator
from types import MethodType as Method
from types import ModuleType

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

import boostnode
# # python3.5
# # from boostnode import ENCODING
# # from boostnode.extension.type import Self, SelfClass, SelfClassObject
from boostnode import ENCODING, convert_to_string, convert_to_unicode
# #
from boostnode.extension.type import Null
from boostnode.paradigm.aspectOrientation import FunctionDecorator, JointPoint
from boostnode.paradigm.objectOrientation import Class

# endregion

# TODO handle utc
# TODO check branches

# region classes

class EnsureNewMutableDefaultObject(FunctionDecorator):

    '''
        Handles the problem with non native mutuable objects as default \
        parameter. Normally all function/method calls shares the same mutual \
        object. This function decorator ensures a new instance for each call.

        Examples:

        Normal Problem illustration:

        >>> class A:
        ...     def __init__(self, a={}): self.a = a

        >>> a = A()
        >>> a.a
        {}

        >>> a.a[2] = 3
        >>> A().a
        {2: 3}

        Solution with default value copy.

        >>> class A:
        ...     def __init__(self, a={}): self.a = a
        ...     __init__ = EnsureNewMutableDefaultObject(__init__)

        >>> a = A()
        >>> a.a
        {}

        >>> a.a[2] = 3
        >>> A().a
        {}

        >>> class A:
        ...     def __init__(self, a={}): self.a = a
        ...     __init__ = EnsureNewMutableDefaultObject(__init__)

        >>> a = A()
        >>> a.a
        {}

        >>> a.a[2] = 3
        >>> A(a={2: 1}).a
        {2: 1}

        >>> class A:
        ...     def a(self, a, b=3, c={}, d={2}): self.c = c
        ...     def __init__(self): pass
        ...     __init__.__func__ = a
        ...     __init__ = EnsureNewMutableDefaultObject(__init__)

        >>> a = A(2)
        >>> a.c
        {}

        >>> a.c[2] = 3
        >>> A(2).c
        {}
    '''

    # region properties

    IMMUTABLE_OBJECTS = (
        builtins.tuple, builtins.bool, builtins.str, builtins.int,
        builtins.float, Function, Method)
    '''
        Defines all argument names which will be ignored by generating \
        instance properties.
    '''

    # endregion

    # region dynamic methods

    # # region public

    @JointPoint
# # python3.5
# #     def get_wrapper_function(self: Self) -> (Function, Method):
    def get_wrapper_function(self):
# #
        '''This methods returns the wrapped function.'''
        @functools.wraps(self.__func__)
        def wrapper_function(*arguments, **keywords):
            '''
                Wrapper function for coping mutable default values.

                Given arguments and keywords are forwarded to wrapped function.
            '''
            '''Unpack wrapper methods.'''
            while builtins.hasattr(self.__func__, '__func__'):
                self.__func__ = self.__func__.__func__
            arguments = self._determine_arguments(arguments)
            '''
                We have to bind variables to recognize keyword arguments \
                which are given as positional arguments.
            '''
# # python3.5
# #             signature = inspect.signature(self.__func__)
# #             given_arguments = signature.bind(*arguments, **keywords).arguments
# #             for name, parameter in signature.parameters.items():
# #                 '''
# #                     Ignore given, immutable or arguments without a default \
# #                     value.
# #                 '''
# #                 if not (
# #                     parameter.default in (parameter.empty, None, Null) or
# #                     name in given_arguments or builtins.isinstance(
# #                         parameter.default, self.IMMUTABLE_OBJECTS)
# #                 ):
# #                     keywords[name] = copy(parameter.default)
            argument_specification = inspect.getargspec(self.__func__)
            if argument_specification.defaults:
                for name, default_parameter in builtins.zip(
                    argument_specification.args[builtins.len(
                        argument_specification.args
                    ) - builtins.len(argument_specification.defaults):],
                    argument_specification.defaults
                ):
                    '''
                        NOTE: This python2.X backport works only for \
                        explicitly given arguments via keyword.
                    '''
                    if not (
                        default_parameter in (None, Null) or
                        name in keywords and
                        keywords[name] != default_parameter or
                        builtins.isinstance(
                            default_parameter, self.IMMUTABLE_OBJECTS)
                    ):
                        keywords[name] = copy(default_parameter)
# #
            return self.__func__(*arguments, **keywords)
# # python3.5         pass
        wrapper_function.__wrapped__ = self.__func__
        return wrapper_function

        # endregion

    # endregion


class ClassPropertyInitializer(FunctionDecorator):

    '''
        Decorator class for automatically setting instance properties for \
        corresponding arguments of wrapped function.

        Examples:

        >>> class A:
        ...     def a(self): pass
        ...     def __init__(self): pass
        ...     __init__.__func__ = a
        ...     __init__ = ClassPropertyInitializer(__init__)

        >>> A() # doctest: +ELLIPSIS
        <__main__.A ... at ...>
    '''

    # region properties

    EXCLUDED_ARGUMENT_NAMES = 'cls',
    '''
        Defines all argument names which will be ignored by generating \
        instance properties.
    '''

    # endregion

    # region dynamic methods

    # # region public

    @JointPoint
# # python3.5
# #     def get_wrapper_function(self: Self) -> (Function, Method):
    def get_wrapper_function(self):
# #
        '''This methods returns the wrapped function.'''
        @functools.wraps(self.__func__)
        def wrapper_function(*arguments, **keywords):
            '''
                Wrapper function for initializing instance properties.

                Given arguments and keywords are forwarded to wrapped function.
            '''
            '''Unpack wrapper methods.'''
            while builtins.hasattr(self.__func__, '__func__'):
                self.__func__ = self.__func__.__func__
            arguments = self._determine_arguments(arguments)
            for name, value in inspect.getcallargs(
                self.__func__, *arguments, **keywords
            ).items():
                if name not in self.EXCLUDED_ARGUMENT_NAMES:
                    if 'self' in self.EXCLUDED_ARGUMENT_NAMES:
                        builtins.setattr(self.object, name, value)
                    else:
                        builtins.setattr(self.class_object, name, value)
            return self.__func__(*arguments, **keywords)
# # python3.5         pass
        wrapper_function.__wrapped__ = self.__func__
        return wrapper_function

    # # endregion

    # endregion


class InstancePropertyInitializer(ClassPropertyInitializer):

    '''
        Decorator class for automatically setting instance properties for \
        corresponding arguments of wrapped function.

        This methods returns the wrapped function.

        Examples:

        >>> class A:
        ...     def a(self): pass
        ...     def __init__(self): pass
        ...     __init__.__func__ = a
        ...     __init__ = InstancePropertyInitializer(__init__)

        >>> A() # doctest: +ELLIPSIS
        <__main__.A ... at ...>
    '''

    # region properties

    EXCLUDED_ARGUMENT_NAMES = 'self',
    '''
        Defines all argument names which will be ignored by generating \
        instance properties.
    '''

    # endregion


# # python3.5 class Model:
class Model(builtins.object):

    '''Represents an abstract data holding class for an orm based model.'''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
        '''
            Describes the model as string.

            Examples:

            >>> class UserModel(Model): pass
            >>> repr(UserModel())
            'UserModel'

            NOTE: Python2.X gives another string representation as python3.X

            >>> class UserModel(Model):
            ...     def __init__(self): self.a = 'hans'
            >>> repr(UserModel()) # doctest: +ELLIPSIS
            'UserModel with properties "a": "...".'

            >>> class UserModel(Model):
            ...     def __init__(self):
            ...         self.c = True
            ...         self.a = 'hans'
            ...         self.b = 5
            ...         self._b = 5
            >>> repr(UserModel()) # doctest: +ELLIPSIS
            '... with properties "a": "...hans...", "b": "5" and "c": "True".'
        '''
        if self.__dict__:
            property_descriptions = ''
            index = 1
            names = builtins.tuple(builtins.filter(
                lambda name: not name.startswith('_'), self.__dict__))
            for name in builtins.sorted(names):
                value = self.__dict__[name]
                if index != 1:
                    if index == builtins.len(names):
                        property_descriptions += ' and '
                    else:
                        property_descriptions += ', '
                    value = builtins.repr(value)
                property_descriptions += '"%s": "%s"' % (name, value)
                index += 1
            return '%s with properties %s.' % (
                self.__class__.__name__, property_descriptions)
        return self.__class__.__name__

    # # # endregion

    # # # region getter

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_dictionary(
# #         self: Self, key_wrapper=lambda key, value: key,
# #         value_wrapper=lambda key, value: value,
# #         prefix_filter=('password', 'session', 'login', 'user'),
# #         property_names=(), filter=lambda key, value: True
# #     ) -> builtins.dict:
    def get_dictionary(
        self, key_wrapper=lambda key, value: key,
        value_wrapper=lambda key, value: value,
        prefix_filter=('password', 'session', 'login', 'user'),
        property_names=(), filter=lambda key, value: True
    ):
# #
        '''
            Returns the dictionary representation of the model instance. All \
            properties with prefixed underscore will be ignored.

            **key_wrapper**    - A function to call for manipulating each \
                                 key in returned dictionary.

            **value_wrapper**  - A function to call for manipulating each \
                                 value in returned dictionary.

            **prefix_filter**  - Indicates whether all columns with the \
                                 specified prefixes will be filtered.

            **property_names** - A list of column names to export. If empty \
                                 (default) all columns will be given back.

            **filter**         - An indicator function to filter specified \
                                 properties.

            Returns the rendered dictionary.

            Examples:

            >>> Model().get_dictionary()
            {}

            >>> class User(Model): pass
            >>> User().get_dictionary()
            {}

            >>> class User(Model): pass
            >>> user = User()
            >>> user.a = 5
            >>> user.b = 'hans'
            >>> user._a = 4
            >>> user.get_dictionary() == {'a': 5, 'b': 'hans'}
            True

            >>> user = User()
            >>> user.a = 5
            >>> user.password = 'secret'
            >>> user.get_dictionary() == {'a': 5}
            True
            >>> user.get_dictionary(prefix_filter=()) == {
            ...     'a': 5, 'password': 'secret'}
            True

            >>> user = User()
            >>> user.a = 1
            >>> user.b = 2
            >>> user.get_dictionary(property_names=('a',)) == {'a': 1}
            True

            >>> user = User()
            >>> user.a = 1
            >>> user.b = 2
            >>> user.get_dictionary(
            ...     filter=lambda key, value: key == 'b'
            ... ) == {'b': 2}
            True

            >>> user = User()
            >>> user.hans_peter = 5
            >>> user.get_dictionary() == {'hans_peter': 5}
            True

            >>> class Column: name = 'a'
            >>> class Table: columns = [Column]
            >>> class User(Model): pass
            >>> user = User()
            >>> user.__table__ = Table
            >>> user.a = 3
            >>> user.get_dictionary() == {'a': 3}
            True
        '''
        result = {}
        if not property_names:
            if '__table__' in self.__dict__:
                property_names = builtins.tuple(builtins.map(
                    lambda column: column.name, self.__table__.columns))
            else:
                def property_filter(name):
                    if name.startswith('_'):
                        return False
                    for prefix in prefix_filter:
                        if name.startswith(prefix_filter):
                            return False
                    return True
                property_names = builtins.tuple(builtins.filter(
                    property_filter, self.__dict__))
        for name in property_names:
            value = builtins.getattr(self, name)
            if filter(name, value):
                key = key_wrapper(key=name, value=value)
                result[key] = value_wrapper(key, value)
        return result

    # # # endregion

    # # endregion

    # endregion

    # region static

    # # region public

    @JointPoint(builtins.staticmethod)
# # python3.5
# #     def validate_property(
# #         model_instance: builtins.object, name: builtins.str,
# #         value: builtins.object,
# #         information_determiner=lambda model_instance,
# #         name: builtins.getattr(model_instance, '_%s_information' % name)
# #     ):
    def validate_property(
        model_instance, name, value,
        information_determiner=lambda model_instance,
        name: builtins.getattr(
            model_instance, '_%sInformation' % name)):
# #
        '''
            Intercepts each property set of any derived model.

            Examples:

            >>> class A(Model):
            ...     _aInformation = {
            ...         'minimumLength': 5, 'maximumLength': 10,
            ...         'pattern': '[^a]+$'}
            ...     def set_a(self, value):
            ...         return self.validate_property(self, 'a', value)
            >>> a = A()

            >>> a.set_a('peter')
            'peter'

            >>> a.set_a('hans') # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            ValueError: Property "a" of model "A" has minimum length 5 ...

            >>> a.set_a('hansHans') # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            ValueError: Property "a" of model "A" has pattern "...

            >>> a.set_a('hansHansHans') # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            ValueError: Property "a" of model "A" has maximum length 10 but...

            >>> class A(Model):
            ...     _aInformation = {'minimum': 3, 'maximum': 10}
            ...     def set_a(self, value):
            ...         return self.validate_property(self, 'a', value)
            >>> a = A()

            >>> a.set_a(5)
            5

            >>> a.set_a(2) # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            ValueError: Property "a" of model "A" is too small (2) 3 is the ...

            >>> a.set_a(11) # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            ValueError: Property "a" of model "A" is too high (11) 10 is the...

            >>> a.set_a(None)

            >>> a.set_a({})
            {}
        '''
        if value is not None:
            '''
                NOTE: If value is "None" a database check again nullable \
                values will handle this.
            '''
            property_information = information_determiner(model_instance, name)
            if builtins.isinstance(value, (builtins.float, builtins.int)):
                model_instance._validate_number_property(
                    name, value, property_information)
# # python3.5
# #             elif builtins.isinstance(value, builtins.str):
            elif builtins.isinstance(value, (
                builtins.unicode, builtins.str
            )):
# #
                model_instance._validate_string_property(
                    name, value, property_information)
        return value

    # # endregion

    # # region protect ed

    @JointPoint(builtins.classmethod)
    def _validate_number_property(cls, name, value, property_information):
        '''Validates a model property witch represents a number.'''
        if('minimum' in property_information and
           value < property_information['minimum']):
            raise builtins.ValueError(
                'Property "%s" of model "%s" is too small (%d) %d is '
                'the smallest possible value.' % (
                    name, cls.__name__, value,
                    property_information['minimum']))
        if('maximum' in property_information and
           value > property_information['maximum']):
            raise builtins.ValueError(
                'Property "%s" of model "%s" is too high (%d) %d is '
                'the highest possible value.' % (
                    name, cls.__name__, value,
                    property_information['maximum']))
        return cls

    @JointPoint(builtins.classmethod)
    def _validate_string_property(cls, name, value, property_information):
        '''Validates a model property witch represents a string.'''
        if 'minimumLength' in property_information and builtins.len(
            value
        ) < property_information['minimumLength']:
            raise builtins.ValueError(
                'Property "%s" of model "%s" has minimum length %d '
                'but given value "%s" has length %d.' % (
                    name, cls.__name__, property_information['minimumLength'],
                    value, builtins.len(value)))
        if 'maximumLength' in property_information and builtins.len(
            value
        ) > property_information['maximumLength']:
            raise builtins.ValueError(
                'Property "%s" of model "%s" has maximum length %d '
                'but given value "%s" has length %d.' % (
                    name, cls.__name__, property_information['maximumLength'],
                    value, builtins.len(value)))
# # python3.5
# #         if 'pattern' in property_information and regularExpression.compile(
# #             property_information['pattern']
# #         ).fullmatch(value) is None:
        if 'pattern' in property_information and regularExpression.compile(
            '(?:%s)$' % property_information['pattern']
        ).match(value) is None:
# #
            raise builtins.ValueError(
                'Property "%s" of model "%s" has pattern "%s" but '
                'given value "%s" doesn\'t match.' % (
                    name, cls.__name__, property_information['pattern'],
                    value))
        return cls

    # # endregion

    # endregion


# # python3.5 class Copyable:
class Copyable(builtins.object):

    '''
        Represents copyable and deep copyable objects. Provides generic \
        copy and recursive deep copy methods.
    '''

    # region dynamic methods

    # # region public

    # # # region special

    # NOTE We can't specify the type of the "self" parameter since python's
    # native "copy()" methods calls this method as static classmethod.
    @JointPoint
# # python3.5     def __copy__(self) -> SelfClassObject:
    def __copy__(self):
        '''
            Triggers if python native copy method is used on current object.

            Examples:

            >>> class Test(Copyable):
            ...     @InstancePropertyInitializer
            ...     def __init__(self, test): pass

            >>> test = Test(5)
            >>> test_copy = copy(test)
            >>> test_copy.test = 4
            >>> test.test
            5
            >>> test_copy.test
            4

            >>> class Test(Copyable):
            ...     @InstancePropertyInitializer
            ...     def __init__(self, test): pass
            >>> test = Test([5])
            >>> test_copy = copy(test)
            >>> test_copy.test[0] = 4
            >>> test.test
            [4]
            >>> test_copy.test
            [4]
        '''
        return self._copy(self.__dict__)

    @JointPoint
# # python3.5
# #     def __deepcopy__(self: Self, memory: builtins.dict) -> SelfClassObject:
    def __deepcopy__(self, memory):
# #
        '''
            Triggers if python native deep copy method is used on current \
            object.

            Examples:

            >>> class Test(Copyable):
            ...     @InstancePropertyInitializer
            ...     def __init__(self, test): pass
            >>> test = Test([5])
            >>> test_copy = deepcopy(test)
            >>> test_copy.test[0] = 4
            >>> test.test
            [5]
            >>> test_copy.test
            [4]
        '''
        return self._copy(deepcopy(self.__dict__, memory))

    @JointPoint
# # python3.5
# #     def _copy(self: Self, scope: builtins.dict) -> SelfClassObject:
    def _copy(self, scope):
# #
        '''Creates and returns a new copy of current instance.'''
        initializer = self.__class__.__init__
        while builtins.hasattr(initializer, '__wrapped__'):
            initializer = initializer.__wrapped__
# # python3.5
# #         parameter_names = inspect.signature(initializer).parameters.keys()
        parameter_names = inspect.getargspec(initializer).args
# #
        return self.__class__(**builtins.dict(builtins.filter(
            lambda mapping: mapping[0] in parameter_names, scope.items())))

    # # # endregion

    # # endregion

    # endregion


class AuthenticationModel(Model):

    '''Represents a model with authentication methods.'''

    # region properties

    _passwordInformation = {
        'minimumLength': 4, 'maximumLength': 100, 'pattern': '.{4}.*',
        'pepper': 'a1b2c3d4e3f5g6h7i8j9k0l1m2n3o4p5x6y7z',
        'salt': {'length': 32}
    }
    passwordSalt = ''
    passwordHash = ''

    # endregion

    # region dynamic methods

    # # region public

    # # # region pass word handler

    @JointPoint(Class.pseudo_property)
    def get_password(self):
        '''
            Getter for the password hash.

            Examples:

            >>> authentication_model = AuthenticationModel()

            >>> authentication_model.get_password()
            ''

            >>> authentication_model.set_password('hans')
            >>> authentication_model.get_password() # doctest: +ELLIPSIS
            '...'

            >>> authentication_model.set_password('han') # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            ValueError: Property "password" of model "..." has minimum lengt...
        '''
        return self.passwordHash

    @JointPoint
    def set_password(self, value):
        '''
            Password setter which provides automatic salt and hash generation.
        '''
        self.validate_property(self, 'password', value)
# # python3.5
# #         self.passwordSalt = base64_encode(os.urandom(
# #             self._passwordInformation['salt']['length']
# #         )).decode(ENCODING)
# #         self.passwordHash = sha224(
# #             ('%s%s%s' % (
# #                 value, self._passwordInformation['pepper'],
# #                 self.passwordSalt
# #             )).encode(ENCODING)
# #         ).hexdigest()
        self.passwordSalt = os.urandom(
            self._passwordInformation['salt']['length']
        ).encode('base_64')
        self.passwordHash = sha224(
            '%s%s%s' % (
                value, self._passwordInformation['pepper'],
                self.passwordSalt)
        ).hexdigest()
# #

    @JointPoint
    def hasPassword(self, value):
        '''
            Checks if given password matches the saved hashed one.

            Examples:

            >>> authentication_model = AuthenticationModel()
            >>> authentication_model.set_password('hans')

            >>> authentication_model.hasPassword('hans')
            True

            >>> authentication_model.hasPassword('peter')
            False
        '''
# # python3.5
# #         return self.passwordHash == sha224(
# #             ('%s%s%s' % (
# #                 value, self._passwordInformation['pepper'],
# #                 self.passwordSalt
# #             )).encode(ENCODING)
# #         ).hexdigest()
        return self.passwordHash == sha224(
            '%s%s%s' % (
                value, self._passwordInformation['pepper'],
                self.passwordSalt)
        ).hexdigest()
# #

    # # # endregion

    # # endregion

    # endregion


class Object(Class):

    '''
        This class extends all native python classes.

        **content** - Object value to save.
    '''

    # region properties

# # python3.5
# #     NONE_CONVERTABLE_ITERABLES = {
# #         builtins.str, builtins.bytes, CGIFieldStorage}
    NONE_CONVERTABLE_ITERABLES = {
        builtins.unicode, builtins.bytes, builtins.str, CGIFieldStorage}
# #
    DATE_TIME_CONVERTER = {
        NativeDateTime: lambda content: (
            make_time(content.timetuple()) + content.microsecond / \
            1000 ** 2
        ),
        NativeDate: lambda content: make_time(content.timetuple()),
        NativeTime: lambda content: (
            60.0 ** 2 * content.hour + 60 * content.minute +
            content.second + content.microsecond / 1000 ** 2
        ),
        NativeTimeDelta: lambda content: content.total_seconds()
    }

    # endregion

    # region static methods

    # # region public

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def determine_abstract_method_exception(
# #         cls: SelfClass, abstract_class_name: builtins.str, class_name=None
# #     ) -> builtins.NotImplementedError:
    def determine_abstract_method_exception(
        cls, abstract_class_name, class_name=None
    ):
# #
        '''
            Generates a suitable exception for raising if a method is called \
            initially indented to be overwritten.

            **abstract_class_name** - Class name of super class.

            **class_name**          - Class name which initiates the exception.

            Returns generated exception.

            Examples:

            >>> class A(Object):
            ...     @classmethod
            ...     def abstract_method(cls):
            ...         raise cls.determine_abstract_method_exception(
            ...             A.__name__)
            >>> class B(A): pass
            >>> B.abstract_method() # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            NotImplementedError: Method "abstract_method" wasn't implemented...

            >>> class A:
            ...     @classmethod
            ...     def abstract_method(cls):
            ...         raise Object.determine_abstract_method_exception(
            ...             A.__name__, cls.__name__)
            >>> class B(A): pass
            >>> B.abstract_method() # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            NotImplementedError: Method "..." wasn't implemented...
        '''
        '''
            NOTE: fetch third frame "inspect.stack()[2]" \
                0: this \
                1: Decorator wrapper \
                2: caller
        '''
        if class_name is None:
            class_name = cls.__name__
        stack_level = 1 if sys.flags.optimize else 2
        return builtins.NotImplementedError(
            'Method "{name}" wasn\'t implemented by "{class_name}" and is '
            'necessary for abstract class "{abstract_class}".'.format(
                name=inspect.stack()[stack_level][3], class_name=class_name,
                abstract_class=abstract_class_name))

    # # endregion

    # endregion

    # region dynamic methods

    # # region public

    # # # region special

# # python3.5
# #     def __init__(
# #         self: Self, content=None,
# #         *arguments: (builtins.object, builtins.type),
# #         **keywords: (builtins.object, builtins.type)
# #     ) -> None:
    def __init__(self, content=None, *arguments, **keywords):
# #
        '''
            Generates a new high level wrapper around given object.

            Examples:

            >>> object = Object('hans')

            >>> object
            Object of "str" ('hans').
            >>> object.content
            'hans'

            >>> object = Object(object)
            >>> object
            Object of "str" ('hans').
            >>> object.content
            'hans'

            >>> object = Object()
            >>> object.compatible_type is None
            True
            >>> object.content is None
            True
        '''
        from boostnode.extension.file import Handler as FileHandler

        # # # region properties

        self.__class__.NONE_CONVERTABLE_ITERABLES.add(FileHandler)
        if builtins.isinstance(content, self.__class__):
            content = content.content
        '''
            NOTE: This property shouldn't be set via an instance property \
            initializer since there nondeterministic problems in \
            multiprocessing application.
        '''
        self.content = content
        '''Saves a copy of currently saved object.'''
        self._content_copy = {}

        # # # endregion

    @JointPoint
# # python3.5     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
        '''Invokes if this object should describe itself by a string.'''
        return 'Object of "{class_name}" ({content}).'.format(
            class_name=self.content.__class__.__name__,
            content=builtins.repr(self.content))

    @JointPoint
# # python3.5     def __str__(self: Self) -> builtins.str:
    def __str__(self):
        '''
            Is triggered if this object should be converted to string.

            Examples:

            >>> str(Object(['hans']))
            "['hans']"
        '''
# # python3.5         return builtins.str(self.content)
        return convert_to_unicode(self.content)

    @JointPoint
# # python3.5
# #     def __eq__(
# #         self: Self, other: (builtins.object, builtins.type)
# #     ) -> builtins.bool:
    def __eq__(self, other):
# #
        '''
            Is triggered if this object should be compared to another

            Examples:

            >>> Object('hans') == Object('hans')
            True

            >>> Object('hans') == Object(2)
            False

            >>> Object('hans') == 2
            False
        '''
        if builtins.isinstance(other, self.__class__):
            return self.content == other.content
        return False

    # # # endregion

    # # # region boolean

    @JointPoint
# # python3.5     def is_convertable_iterable(self: Self) -> builtins.bool:
    def is_convertable_iterable(self):
        '''
            Checks if current iterable is convertable.

            Examples:

            >>> Object(True).is_convertable_iterable()
            False
        '''
        return builtins.isinstance(
            self.content, NativeIterable
        ) and not builtins.isinstance(self.content, builtins.tuple(
            self.NONE_CONVERTABLE_ITERABLES))

    @JointPoint
# # python3.5     def is_hashable(self: Self) -> builtins.bool:
    def is_hashable(self):
        '''
            Checks if current iterable is immutable.

            Examples:

            >>> Object(True).is_hashable()
            True

            >>> class A(list): pass
            >>> Object(content=A).is_hashable()
            True

            >>> Object(A()).is_hashable()
            False

            >>> A.__hash__ = lambda: True
            >>> Object(A).is_hashable()
            True

            >>> A.__hash__ = True
            >>> Object(A()).is_hashable()
            False

            >>> Object(type).is_hashable()
            True

            >>> Object('').is_hashable()
            True

            >>> Object('s').is_hashable()
            True

            >>> Object(4).is_hashable()
            True

            >>> Object([]).is_hashable()
            False

            >>> Object(()).is_hashable()
            True
        '''
        try:
            builtins.hash(self.content)
        except builtins.TypeError:
            return False
        else:
            return True

    # # # endregion

    # # # region getter

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_compatible_type(
# #         self: Self, none_evaluation=True, boolean_evaluation=True,
# #         number_evaluation=False
# #     ) -> (builtins.object, builtins.type):
    def get_compatible_type(
        self, none_evaluation=True, boolean_evaluation=True,
        number_evaluation=False
    ):
# #
        '''
            Converts data to python cross platform compatible data objects.

            Examples:

            >>> isinstance(Object(NativeDateTime(
            ...     1970, 1, 1, 0, 0
            ... )).compatible_type, float)
            True

            >>> isinstance(Object(NativeDate(
            ...     1970, 1, 1
            ... )).compatible_type, float)
            True

            >>> isinstance(Object(NativeTime(
            ...     1, 1, 1, 0
            ... )).compatible_type, float)
            True

            >>> isinstance(Object(NativeTimeDelta(
            ...     1, 1
            ... )).compatible_type, float)
            True

            >>> Object('hans').compatible_type
            'hans'

            >>> Object(1).compatible_type
            1

            >>> Object(None).compatible_type is None
            True

            >>> Object(.1).compatible_type
            0.1

            >>> Object(False).compatible_type
            False

            >>> Object(True).compatible_type
            True

            >>> Object({'A'}).compatible_type == str(['A'])
            True

            >>> Object(('A',)).compatible_type == str(['A'])
            True

            >>> from boostnode.extension.file import Handler as FileHandler
            >>> Object(FileHandler()).compatible_type # doctest: +ELLIPSIS
            {...}

            >>> backup = FileHandler.EXPORTABLE_ATTRIBUTES
            >>> FileHandler.EXPORTABLE_ATTRIBUTES = {}
            >>> Object(FileHandler()).compatible_type
            {}
            >>> FileHandler.EXPORTABLE_ATTRIBUTES = backup

            >>> Object(CGIFieldStorage()).compatible_type
            {}
        '''
        from boostnode.extension.file import Handler as FileHandler

        for date_time_type, converter in builtins.filter(
            lambda item: builtins.isinstance(self.content, item[0]),
            self.DATE_TIME_CONVERTER.items()
        ):
            return converter(self.content)
        if builtins.isinstance(self.content, CGIFieldStorage):
            return self._get_compatible_cgi_field_storage_type()
        if builtins.isinstance(self.content, FileHandler):
            result = {}
            for name in FileHandler.EXPORTABLE_ATTRIBUTES:
                result[name] = builtins.getattr(self.content, name)
            return result
        content = self._handle_aggressive_evaluation(
            none_evaluation, boolean_evaluation, number_evaluation)
        if builtins.isinstance(content, (builtins.set, builtins.tuple)):
            content = builtins.list(content)
        if not builtins.isinstance(content, (
            builtins.int, builtins.float, builtins.type(None)
        )):
# # python3.5             return builtins.str(content)
            return convert_to_unicode(content)
        return content

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_known_type(
# #         self: Self, description=None, strict=None,
# #         none_evaluation=True, boolean_evaluation=True,
# #         number_evaluation=True
# #     ) -> (builtins.object, builtins.type):
    def get_known_type(
        self, description=None, strict=None, none_evaluation=True,
        boolean_evaluation=True, number_evaluation=True
    ):
# #
        '''
            Converts interpretable data to python specific data objects.

            **description**        - Additional information how given input \
                                     should be interpreted. Possible inputs \
                                     could be: "date_time", "*_date_time", \
                                     "*DateTime*, "date", "*_date", "*Date", \
                                     "time", "*_time", "*Time", \
                                     "phone_number", "*_phone_number", \
                                     "*PhoneNumber", "zip_code", \
                                     "*_zip_code", "*ZipCode", "time_delta", \
                                     "*_time_delta", "*TimeDelta"

            **strict**             - If evaluates to true and a description \
                                     is given and exception will be raised if \
                                     current value couldn't be interpreted. \
                                     If evaluates to "None" current value \
                                     will be returned if evaluations fails. \
                                     If strict evaluates to false "None" will \
                                     be given back if current value couldn't \
                                     be interpreted.

            **none_evaluation**    - Tries to evaluate to a none value.

            **boolean_evaluation** - Tries to evaluate to a boolean.

            **number_evaluation**  - Tries to evaluate to a number.

            Examples:

            >>> Object().known_type is None
            True

            >>> Object(0).get_known_type(
            ...     'date_time'
            ... ) == NativeDateTime.fromtimestamp(0)
            True

            >>> Object(0).get_known_type('date') == NativeDate.fromtimestamp(0)
            True

            >>> Object(0).get_known_type('time') == NativeTime(0)
            True

            >>> Object(0).get_known_type('time_delta') == NativeTimeDelta(0)
            True

            >>> Object(0).known_type
            0

            >>> Object(True).known_type
            True

            >>> Object('ap9c').get_known_type('phone_number')
            '9'

            >>> Object('abc').get_known_type('zip_code', strict=True)
            Traceback (most recent call last):
            ...
            NativeError: "abc" couldn't be interpreted as "ZipCode".

            >>> Object('abc').get_known_type('zip_code')
            'abc'

            >>> Object('abc').get_known_type('zip_code', strict=False) is None
            True

            >>> Object('ap9c').known_type
            'ap9c'

            >>> Object('9').known_type
            9

            >>> Object('9').get_known_type(number_evaluation=False)
            '9'

            >>> Object('true').known_type
            True

            >>> Object('true').get_known_type(boolean_evaluation=False)
            'true'

            >>> Object('false').known_type
            False

            >>> Object('false').get_known_type(boolean_evaluation=False)
            'false'

            >>> Object('none').known_type is None
            True

            >>> Object('none').get_known_type(none_evaluation=False)
            'none'
        '''
        if self.content is None:
            return self.content
# # python3.5
# #         if builtins.isinstance(description, builtins.str):
        if builtins.isinstance(description, (
            builtins.unicode, builtins.str
        )):
# #
            try:
                result = self._create_known_type(description)
                if result is not None:
                    return result
            except __exception__:
                if strict:
                    raise
                return self.content if strict is None else None
        return self._handle_aggressive_evaluation(
            none_evaluation, boolean_evaluation, number_evaluation)

    # # # endregion

    @JointPoint
# # python3.5
# #     def calculate_patch(
# #         self: Self, value: (builtins.object, builtins.type),
# #         null_value=Null
# #     ) -> (builtins.object, builtins.type):
    def calculate_patch(self, value, null_value=Null):
# #
        '''
            Returns the difference between content and given value in a
            recursive manner.

            **value**      - value to compare with current content.

            **null_value** - placeholder for equal values in both given values
                             to compare (defaults to
                             "boostnode.extension.type.Null").

            Returns the difference between content and given value.

            Examples:

            >>> Object(1).calculate_patch(value=2)
            2

            >>> Object(None).calculate_patch(value=None) # doctest: +ELLIPSIS
            <class boostnode.extension.type.Null at ...>

            >>> Object(1).calculate_patch(value=1, null_value=2)
            2

            >>> Object([]).calculate_patch(value=[], null_value=None) is None
            True

            >>> Object([]).calculate_patch(value=2, null_value=None)
            2

            >>> Object(2).calculate_patch(value=[], null_value=None)
            []

            >>> Object([1, 2]).calculate_patch(
            ...     value=[1, 2], null_value=None
            ... ) is None
            True

            >>> Object([1, 2]).calculate_patch(
            ...     value=[1, 2, 3], null_value=None)
            [1, 2, 3]

            >>> Object([1, 2, 3]).calculate_patch(
            ...     value=[1, 2, 4], null_value=None)
            [None, None, 4]

            >>> Object([1, 2, [1, 2]]).calculate_patch(
            ...     value=[1, 2, [1, 2]], null_value=None
            ... ) is None
            True

            >>> Object([1, 2, [1, 2]]).calculate_patch(
            ...     value=[1, 2, [1, 3]], null_value=None)
            [None, None, [None, 3]]

            >>> Object({'a': 1, 'b': 2}).calculate_patch(
            ...     value={'a': 1, 'b': 2}, null_value=None
            ... ) is None
            True

            >>> Object({'a': 1, 'b': 2}).calculate_patch(
            ...     value={'a': 1, 'b': 3}, null_value=None)
            {'b': 3}

            >>> Object({'a': 1, 'b': [2]}).calculate_patch(
            ...     value={'a': 1, 'b': [2]}, null_value=None
            ... ) is None
            True

            >>> Object({'a': 1, 'b': [2]}).calculate_patch(
            ...     value={'a': 1, 'b': [3]}, null_value=None)
            {'b': [3]}

            >>> Object({'a': 1, 'b': [2]}).calculate_patch(
            ...     value={'c': 1, 'b': [3]}, null_value=None)
            {'c': 1, 'b': [3]}

            >>> Object({'a': 1, 'b': [2]}).calculate_patch(
            ...     value={'c': 1}, null_value=None)
            {'c': 1}

            >>> Object({'b': {'a': [2]}}).calculate_patch(
            ...     value={'b': {'a': [1, 2]}}, null_value=None)
            {'b': {'a': [1, 2]}}

            >>> Object({'a': {'b': 2}}).calculate_patch(
            ...     value={'a': {'b': None}})
            {'a': {'b': None}}

            >>> Object({'b': 2}).calculate_patch(
            ...     value={'b': None}, null_value=None)

            >>> Object(['b', 2]).calculate_patch(
            ...     value=['b', None], null_value=None)
        '''
        if builtins.type(self.content) != builtins.type(value):
            return value
# # python3.5
# #         if builtins.isinstance(
# #             value, NativeIterable
# #         ) and not builtins.isinstance(value, builtins.str):
        if builtins.isinstance(
            value, NativeIterable
        ) and not builtins.isinstance(value, builtins.unicode):
# #
            result = builtins.type(value)()
            has_content = False
            if builtins.isinstance(value, builtins.list):
                if builtins.len(self.content) != builtins.len(value):
                    return value
                for index, sub_value in builtins.enumerate(value):
                    if builtins.isinstance(sub_value, NativeIterable):
                        sub_result = Object(
                            self.content[index]
                        ).calculate_patch(sub_value, null_value)
                        if sub_result != null_value:
                            has_content = True
                        result.append(sub_result)
                    elif(
                        sub_value == null_value or
                        sub_value == self.content[index]
                    ):
                        result.append(null_value)
                    else:
                        has_content = True
                        result.append(sub_value)
            else:
                if builtins.isinstance(value, builtins.dict):
                    iterator = value.items()
                else:
                    iterator = value
                for key, sub_value in iterator:
                    if key in self.content:
# # python3.5
# #                         if builtins.isinstance(
# #                             sub_value, NativeIterable
# #                         ) and not builtins.isinstance(
# #                             sub_value, builtins.str
# #                         ):
                        if builtins.isinstance(
                            sub_value, NativeIterable
                        ) and not builtins.isinstance(
                            sub_value, builtins.unicode
                        ):
# #
                            sub_result = Object(
                                self.content[key]
                            ).calculate_patch(sub_value, null_value)
                            if sub_result != null_value:
                                has_content = True
                                result[key] = sub_result
                        elif(
                            sub_value != null_value and
                            sub_value != self.content[key]
                        ):
                            has_content = True
                            result[key] = sub_value
                    else:
                        has_content = True
                        result[key] = sub_value
            if not has_content:
                return null_value
            return result
        if self.content == value:
            return null_value
        return value

    @JointPoint
# # python3.5     def copy(self: Self) -> builtins.dict:
    def copy(self):
        '''
            Copies a given object's attributes and returns them.

            Examples:

            >>> class A: pass
            >>> a = A()
            >>> a.string = 'hans'
            >>> object_copy = Object(a).copy()
            >>> for key, value in object_copy.items():
            ...     if 'string' == key:
            ...         print(value)
            hans

            >>> class B: hans = 'A'
            >>> object = Object(B())
            >>> object_copy = object.copy()
            >>> object.content.hans = 'B'
            >>> object.content.hans
            'B'
            >>> object_copy['hans']
            'A'
        '''
        self._content_copy = {}
        for attribute_name in builtins.dir(self.content):
            attribute = builtins.getattr(self.content, attribute_name)
            if not ((attribute_name.startswith('__') and
                     attribute_name.endswith('__')) or
                    builtins.callable(attribute)):
                self._content_copy[attribute_name] = copy(
                    builtins.getattr(self.content, attribute_name))
        return self._content_copy

    @JointPoint
# # python3.5     def restore(self: Self) -> (builtins.object, builtins.type):
    def restore(self):
        '''
            Restores a given object's attributes by a given copy are last \
            copied item.

            Examples:

            >>> class A: pass
            >>> A.string = 'hans'
            >>> object = Object(A)
            >>> object.copy()
            {'string': 'hans'}
            >>> A.string = 'peter'
            >>> object.restore() # doctest: +ELLIPSIS
            <class ...A...>
            >>> A.string
            'hans'

            >>> class A:
            ...     hans = 'A'
            ...     __special__ = 'B'
            >>> object = Object(A())
            >>> object_copy = object.copy()
            >>> object.content.hans = 'B'
            >>> object.content.hans
            'B'
            >>> object.restore().hans
            'A'
        '''
        for attribute, value in self._content_copy.items():
            builtins.setattr(self.content, attribute, value)
        return self.content

    @JointPoint
# # python3.5     def is_binary(self: Self) -> builtins.bool:
    def is_binary(self):
        '''
            Determines if given data is binary.

            Examples:

            >>> Object('A').is_binary()
            False

            >>> if sys.version_info.major < 3:
            ...     Object(chr(1)).is_binary()
            ... else:
            ...     Object(bytes('A', 'utf_8')).is_binary()
            True

            >>> if sys.version_info.major < 3:
            ...     Object(unicode('hans')).is_binary()
            ... else:
            ...     Object('hans').is_binary()
            False
        '''
# # python3.5
# #         return builtins.isinstance(self.content, builtins.bytes)
        '''
            NOTE: This is a dirty workaround to handle python2.7 lack of \
            differentiation between "string" and "bytes" objects.
        '''
        content = self.content
        if builtins.isinstance(content, builtins.unicode):
            content = content.encode(ENCODING)
        text_chars = builtins.str().join(builtins.map(
            builtins.chr,
            builtins.range(7, 14) + [27] + builtins.range(0x20, 0x100)))
        return builtins.hasattr(content, 'translate') and builtins.bool(
            content.translate(None, text_chars))
# #

    # # endregion

    # # region protected

    @JointPoint
# # python3.5
# #     def _get_compatible_cgi_field_storage_type(self: Self) -> (
# #         builtins.object, builtins.type
# #     ):
    def _get_compatible_cgi_field_storage_type(self):
# #
        '''
            Convert form field values and potential binary data into a simple \
            dictionary.
        '''
        try:
            result = {}
            for name in self.content:
                result[name] = []
                if builtins.hasattr(
                    self.content[name], 'file'
                ) and self.content[name].filename:
                    result[name].append('__binary_file_data__')
                elif builtins.isinstance(self.content[name], builtins.list):
                    for value in self.content[name]:
                        result[name].append(
                            self._get_compatible_cgi_file_or_value(value))
                else:
                    result[name].append(self.content[name].value)
            return result
        except builtins.TypeError:
            if builtins.hasattr(
                self.content, 'file'
            ) and self.content.filename:
                return {self.content.filename: '__binary_file_data__'}
            return {name: value.value}

    @JointPoint
# # python3.5
# #     def _get_compatible_cgi_file_or_value(
# #         self, value: CGIFieldStorage
# #     ) -> builtins.object:
    def _get_compatible_cgi_file_or_value(self, value):
# #
        '''
            Returns a compatible value for given field storage value. If \
            binary data detected an indicator string will be returned.
        '''
        if builtins.hasattr(value, 'file') and value.filename:
            return '__binary_file_data__'
        return value.value

    @JointPoint
# # python3.5
# #     def _create_known_type(self: Self, description: (
# #         builtins.str, builtins.type(None)
# #     )) -> (
# #         NativeDateTime, NativeDate, NativeTime, NativeTimeDelta,
# #         builtins.str, builtins.type(None)
# #     ):
    def _create_known_type(self, description):
# #
        '''Creates a known type depending on given description.'''
        for type_description in (
            'date_time', 'date', 'time', 'phone_number', 'zip_code',
            'time_delta'
        ):
            class_name = String(
                type_description
            ).delimited_to_camel_case.camel_case_capitalize.content
            if description in [
                class_name, type_description
            ] or description.endswith(
                '_%s' % type_description
            ) or description.endswith(class_name) or description == '%s%s' % (
                class_name[0].lower(), class_name[1:]
            ):
                return builtins.globals()[class_name](self.content).content

    @JointPoint
# # python3.5
# #     def _handle_aggressive_evaluation(
# #         self: Self, none_evaluation: builtins.bool,
# #         boolean_evaluation: builtins.bool, number_evaluation: builtins.bool
# #     ) -> (
# #         builtins.str, builtins.int, builtins.float, builtins.bool
# #     ):
    def _handle_aggressive_evaluation(
        self, none_evaluation, boolean_evaluation, number_evaluation
    ):
        '''Handles semantic conversion to boolean or numeric values.'''
# # python3.5
# #         if none_evaluation and builtins.isinstance(
# #             self.content, builtins.str
# #         ) and self.content.lower() == 'none':
        if none_evaluation and builtins.isinstance(self.content, (
            builtins.unicode, builtins.str
        )) and self.content.lower() == 'none':
# #
            return None
# # python3.5
# #         if boolean_evaluation and builtins.isinstance(
# #             self.content, builtins.str
# #         ):
        if boolean_evaluation and builtins.isinstance(self.content, (
            builtins.unicode, builtins.str
        )):
# #
            if self.content.lower() == 'true':
                return True
            if self.content.lower() == 'false':
                return False
# # python3.5
# #         if number_evaluation and builtins.isinstance(
# #             self.content, builtins.str
# #         ):
# #             return String(self.content).number
        if number_evaluation and builtins.isinstance(self.content, (
            builtins.unicode, builtins.str
        )):
            number = String(self.content).number
            if builtins.isinstance(number, builtins.str):
                return convert_to_unicode(number)
            return number
# #
        return self.content

    # # endregion

    # endregion


class String(Object, builtins.str):

    '''
        The string class inherits besides the interface class all pythons \
        native string methods. NOTE: This class has to implement inherited \
        special methods like "__str__()" and "__len__()" because they have to \
        use the "content" property which could be manipulated by not \
        inherited methods.

        **content** - Content to be saved as string.

        NOTE: A children of python's native string doesn't need an explicit \
        "__bytes__" implementation.

        Examples:

        >>> if sys.version_info.major < 3:
        ...     bytes(String('hans')) == b'hans'
        ... else:
        ...     bytes(String('hans'), ENCODING) == b'hans'
        True

        >>> if sys.version_info.major < 3:
        ...     bytes(String()) == b''
        ... else:
        ...     bytes(String(), ENCODING) == b''
        True
    '''

    # region properties

    IMPORTANT_ENCODINGS = 'ascii', 'utf_8', 'latin_1', 'utf_16'
    '''
        Defines generally important encodings. Which should be tried at first.
    '''
    NON_STANDARD_SPECIAL_URL_SEQUENCES = {
        '%1000': '#', '%1001': '&', '%1002': '=', '%1003': '%', '%1004': '+'}
    '''All chars wich should be handle during dealing with web urls.'''
    SPECIAL_SHELL_SEQUENCES = (
        '"', "'", '`', '(', ')', ' ', '&', '$', '-')
    '''
        All chars which should be observed by handling with shell command. \
        Note that the escape sequence must not be defined.
    '''
    SPECIAL_REGEX_SEQUENCES = (
        '-', '[', ']', '(', ')', '^', '$', '*', '+', '.', '{', '}')
    '''
        All chars which should be observed by handling with regex sequences. \
        Note that the escape sequence must not be defined.
    '''
    SPECIAL_URL_SEQUENCES = {
        '+': ' ', '%20': ' ', '%22': '"', '%2F': '/', '%7E': '~',
        '%C3%A4': 'ÃÂ¤', '%C3%84': 'ÃÂ',
        '%C3%B6': 'ÃÂ¶', '%C3%96': 'ÃÂ',
        '%C3%BC': 'ÃÂ¼', '%C3%9C': 'ÃÂ'}
    '''All chars wich should be observed by handling with url sequences.'''
    SPECIAL_HTML_SEQUENCES = {
        # Note only needed in very old browsers.
        # '&': '&amp;',
        # ' ': '&nbsp;',
        # Note: is only shown if word is to long.
        # '"soft hyphen"': '&shy;',
        "'": '&apos;', 'ÃÂ´': '&acute;', 'ÃÂ¯': '&macr;',

        '<': '&lt;', '>': '&gt;',

        'ÃÂº': '&ordm;', 'ÃÂ¹': '&sup1;', 'ÃÂ²': '&sup2;', 'ÃÂ³': '&sup3;',

        'ÃÂ¼': '&frac14;', 'ÃÂ½': '&frac12;', 'ÃÂ¾': '&frac34;',

        'ÃÂ': '&Agrave;', 'ÃÂ': '&Aacute;', 'ÃÂ': '&Acirc;', 'ÃÂ': '&Atilde;',
        'ÃÂ': '&Auml;', 'ÃÂ': '&Aring;', 'ÃÂ': '&AElig;',

        'ÃÂ': '&Egrave;', 'ÃÂ': '&Eacute;', 'ÃÂ': '&Ecirc;', 'ÃÂ': '&Euml;',

        'ÃÂ': '&Igrave;', 'ÃÂ': '&Iacute;', 'ÃÂ': '&Icirc;', 'ÃÂ': '&Iuml;',

        'ÃÂ': '&Ograve;', 'ÃÂ': '&Oacute;', 'ÃÂ': '&Ocirc;', 'ÃÂ': '&Otilde;',
        'ÃÂ': '&Ouml;', 'ÃÂ': '&Oslash;',

        'ÃÂ': '&Ugrave;', 'ÃÂ': '&Uacute;', 'ÃÂ': '&Ucirc;', 'ÃÂ': '&Uuml;',

        'ÃÂ ': '&agrave;', 'ÃÂ¡': '&aacute;', 'ÃÂ¢': '&acirc;', 'ÃÂ£': '&atilde;',
        'ÃÂ¤': '&auml;', 'ÃÂ¥': '&aring;', 'ÃÂ¦': '&aelig;',

        'ÃÂ¨': '&egrave;', 'ÃÂ©': '&eacute;', 'ÃÂª': '&ecirc;', 'ÃÂ«': '&euml;',

        'ÃÂ¬': '&igrave;', 'ÃÂ­': '&iacute;', 'ÃÂ®': '&icirc;', 'ÃÂ¯': '&iuml;',

        'ÃÂ²': '&ograve;', 'ÃÂ³': '&oacute;', 'ÃÂ´': '&ocirc;', 'ÃÂµ': '&otilde;',
        'ÃÂ¶': '&ouml;', 'ÃÂ¸': '&oslash;',

        'ÃÂ¹': '&ugrave;', 'ÃÂº': '&uacute;', 'ÃÂ»': '&ucirc;', 'ÃÂ¼': '&uuml;',

        'ÃÂ½': '&yacute;', 'ÃÂ¿': '&yuml;',

        'ÃÂ¡': '&iexcl;',
        'ÃÂ¢': '&cent;',
        'ÃÂ£': '&pound;',
        'ÃÂ¤': '&curren;',
        'ÃÂ¥': '&yen;',
        'ÃÂ¦': '&brvbar;',
        'ÃÂ§': '&sect;',
        'ÃÂ¨': '&uml;',
        'ÃÂ©': '&copy;',
        'ÃÂª': '&ordf;',
        'ÃÂ«': '&laquo;',
        'ÃÂ¬': '&not;',
        'ÃÂ®': '&reg;',
        'ÃÂ°': '&deg;',
        'ÃÂ±': '&plusmn;',
        'ÃÂµ': '&micro;',
        'ÃÂ¶': '&para;',
        'ÃÂ·': '&middot;',
        'ÃÂ¸': '&cedil;',
        'ÃÂ»': '&raquo;',
        'ÃÂ¿': '&iquest;',
        'ÃÂ': '&times;',
        'ÃÂ·': '&divide;',
        'ÃÂ': '&Ccedil;',
        'ÃÂ': '&ETH;',
        'ÃÂ': '&Ntilde;',
        'ÃÂ': '&Yacute;',
        'ÃÂ': '&THORN;',
        'ÃÂ': '&szlig;',
        'ÃÂ§': '&ccedil;',
        'ÃÂ°': '&eth;',
        'ÃÂ±': '&ntilde;',
        'ÃÂ¾': '&thorn;'}
    '''All chars wich should be observed by handling with html sequences.'''
    abbreviations = (
        'html', 'id', 'url', 'en', 'us', 'de', 'api', 'href', 'js', 'css')
    '''Saves a mapping of typical shortcut words to improve camel casing.'''

    # endregion

    # region static methods

    # # region public

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5
# #     def get_escaping_replace_dictionary(
# #         cls: SelfClass, sequence: NativeIterable,
# #         escape_sequence='\{symbole}'
# #     ) -> builtins.dict:
    def get_escaping_replace_dictionary(
        cls, sequence, escape_sequence='\{symbole}'
    ):
# #
        '''
            Creates a replacement dictionary form a given iterable. Every \
            element will be associated with its escaped version. This method \
            is useful for using before give "self.replace()" a dictionary.

            **sequence**        - is an iterable with elements to be escaped.

            **escape_sequence** - is an escape sequence for each element from \
                                  "sequence".

            Returns the generated dictionary.

            Examples:

            >>> String.get_escaping_replace_dictionary(
            ...     ('"', 'a', 'b')
            ... ) == {'a': '\\\\a', '"': '\\\\"', 'b': '\\\\b'}
            True

            >>> String.get_escaping_replace_dictionary(
            ...     ('A', 'B', 'C'), escape_sequence='[{symbole}]'
            ... ) == {'A': '[A]', 'B': '[B]', 'C': '[C]'}
            True
        '''
        escaping_dictionary = {}
        for element in sequence:
            escaping_dictionary[element] = escape_sequence.format(
                symbole=element)
        return escaping_dictionary

    # # endregion

    # endregion

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __init__(
# #         self: Self, content=None, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> None:
    def __init__(self, content=None, *arguments, **keywords):
# #
        '''
            Initialize a new "String" object.

            Examples:

            >>> String('hans').content
            'hans'

            >>> String().content
            ''

            >>> String(['A', 5]).content
            "['A', 5]"

            >>> String().encoding == String.IMPORTANT_ENCODINGS[0]
            True

            >>> String('hans').encoding == String.IMPORTANT_ENCODINGS[0]
            True

            >>> String('hans').encoding == String.IMPORTANT_ENCODINGS[0]
            True

            >>> String(b'hans').encoding == String.IMPORTANT_ENCODINGS[0]
            True

            >>> if sys.version_info.major < 3:
            ...     False
            ... else:
            ...     String(
            ...         'ä'.encode('latin1')
            ...     ).encoding  == String.IMPORTANT_ENCODINGS[0]
            False
        '''

        # # # region properties

        '''Saves the current line for the "readline()" method.'''
        self._current_line_number = 0
        '''The main string property. It saves the current string.'''
        if content is None:
            content = ''
        self.encoding = self.IMPORTANT_ENCODINGS[0]
# # python3.5
# #         if builtins.isinstance(content, builtins.bytes):
# #             self.encoding, content = self._determine_encoding(content)
# #         self.content = builtins.str(content)
        '''
            NOTE: We don't support automatic encoding detection for python2.X \
            because it would be too expensive if we can't distinguish \
            between bytes and strings.
        '''
        self.content = convert_to_unicode(content)
# #

        # # # endregion

    @JointPoint
# # python3.5     def __len__(self: Self) -> builtins.int:
    def __len__(self):
        '''
            Triggers if the pythons native "builtins.len()" function tries to \
            handle current instance. Returns the number of symbols given in \
            the current string representation of this object.

            Examples:

            >>> len(String())
            0

            >>> len(String('hans'))
            4
        '''
# # python3.5         return builtins.len(self.__str__())
        return builtins.len(self.__unicode__())

    @JointPoint
# # python3.5     def __str__(self: Self) -> builtins.str:
    def __unicode__(self):
        '''
            Triggers if the current object should be directly interpreted as \
            pythons native string implementation.

            Examples:

            >>> str(String('hans'))
            'hans'

            >>> str(String())
            ''
        '''
        return self.content

    @JointPoint
# # python3.5     def __bool__(self: Self) -> builtins.bool:
    def __nonzero__(self):
        '''
            Triggers if the current object should be interpreted as a boolean \
            value directly.

            Examples:

            >>> not String()
            True

            >>> not String('hans')
            False

            >>> bool(String('hans'))
            True
        '''
        return builtins.bool(self.content)

    @JointPoint
# # python3.5
# #     def __eq__(self: Self, other: (
# #         SelfClassObject, builtins.str, builtins.object
# #     )) -> builtins.bool:
    def __eq__(self, other):
# #
        '''
            Is triggered if this object should be compared to another

            Examples:

            >>> String('hans') == String('hans')
            True

            >>> String('hans') == str('hans')
            True

            >>> String('hans') == 5
            False
        '''
        if builtins.isinstance(other, Object):
            return self.content == other.content
        return self.content == other

    # # # endregion

    # # # region getter

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_escape_sequences_to_html(self: Self) -> Self:
    def get_escape_sequences_to_html(self):
# #
        '''
            Transforms given text input with shell escape sequences to a \
            valid html snippet.

            Examples:

            >>> from boostnode.extension.output import SET_ATTRIBUTE_MODE
            >>> SET_OUTPUT_ATTRIBUTE_MODE = SET_ATTRIBUTE_MODE
            >>> from boostnode.extension.output import RESET_ATTRIBUTE_MODE
            >>> RESET_OUTPUT_ATTRIBUTE_MODE = RESET_ATTRIBUTE_MODE
            >>> from boostnode.extension.output import COLOR as OUTPUT_COLOR
            >>> from boostnode.extension.output import HIDDEN as OUTPUT_HIDDEN

            >>> String('hans ' + (
            ...     SET_OUTPUT_ATTRIBUTE_MODE %
            ...         OUTPUT_COLOR['foreground']['red']
            ... ) + 'peter' + SET_OUTPUT_ATTRIBUTE_MODE %
            ...     RESET_OUTPUT_ATTRIBUTE_MODE
            ... ).escape_sequences_to_html.content
            'hans <span style="color: red">peter</span>'

            >>> String('hans ' + (
            ...     SET_OUTPUT_ATTRIBUTE_MODE % OUTPUT_HIDDEN
            ... ) + 'peter' + SET_OUTPUT_ATTRIBUTE_MODE %
            ...     RESET_OUTPUT_ATTRIBUTE_MODE
            ... ).escape_sequences_to_html.content
            'hans <span style="visibility: hidden">peter</span>'

            >>> String('hans ' + (
            ...     SET_OUTPUT_ATTRIBUTE_MODE % 9999
            ... ) + 'peter' + SET_OUTPUT_ATTRIBUTE_MODE %
            ...     RESET_OUTPUT_ATTRIBUTE_MODE
            ... ).escape_sequences_to_html.content
            'hans <span class="console-output-mode-9999">peter</span>'

            >>> String('hans <pre>TEST</pre>').escape_sequences_to_html.content
            'hans &lt;pre&gt;TEST&lt;/pre&gt;'
        '''
        from boostnode.extension.output import SET_ATTRIBUTE_MODE as \
            SET_OUTPUT_ATTRIBUTE_MODE
        from boostnode.extension.output import RESET_ATTRIBUTE_MODE as \
            RESET_OUTPUT_ATTRIBUTE_MODE
        from boostnode.extension.output import COLOR as OUTPUT_COLOR
        from boostnode.extension.output import HIGH_COLOR as \
            HIGH_OUTPUT_COLOR
        from boostnode.extension.output import HIDDEN as OUTPUT_HIDDEN
        from boostnode.extension.output import BOLD as OUTPUT_BOLD
        from boostnode.extension.output import DIM as OUTPUT_DIM
        from boostnode.extension.output import ITALIC as OUTPUT_ITALIC
        from boostnode.extension.output import UNDERLINE as OUTPUT_UNDERLINE
        from boostnode.extension.output import BLINK as OUTPUT_BLINK
        from boostnode.extension.output import REVERSE as OUTPUT_REVERSE
        from boostnode.extension.output import CROSSED_OUT as \
            OUTPUT_CROSSED_OUT
        from boostnode.extension.output import DEFAULT_FONT as \
            OUTPUT_DEFAULT_FONT
        from boostnode.extension.output import FONT_1 as OUTPUT_FONT_1
        from boostnode.extension.output import FONT_2 as OUTPUT_FONT_2
        from boostnode.extension.output import FONT_3 as OUTPUT_FONT_3
        from boostnode.extension.output import FONT_4 as OUTPUT_FONT_4
        from boostnode.extension.output import FONT_5 as OUTPUT_FONT_5
        from boostnode.extension.output import FONT_6 as OUTPUT_FONT_6
        from boostnode.extension.output import FONT_7 as OUTPUT_FONT_7
        from boostnode.extension.output import FRAKTUR_HARDLY as \
            OUTPUT_FRAKTUR_HARDLY
        from boostnode.extension.output import BOLD_OFF as OUTPUT_BOLD_OFF
        from boostnode.extension.output import BOLD_INTENSITY_OFF as \
            OUTPUT_BOLD_INTENSITY_OFF
        from boostnode.extension.output import ITALIC_OFF as OUTPUT_ITALIC_OFF
        from boostnode.extension.output import UNDERLINE_OFF as \
            OUTPUT_UNDERLINE_OFF
        from boostnode.extension.output import BLINK_OFF as OUTPUT_BLINK_OFF
        from boostnode.extension.output import RESERVERD_1 as \
            OUTPUT_RESERVERD_1
        from boostnode.extension.output import REVERSE_OFF as \
            OUTPUT_REVERSE_OFF
        from boostnode.extension.output import REVEAL_OFF as OUTPUT_REVEAL_OFF
        from boostnode.extension.output import CROSSED_OUT_OFF as \
            OUTPUT_CROSSED_OUT_OFF
        from boostnode.extension.output import RESERVED_2 as OUTPUT_RESERVED_2
        from boostnode.extension.output import FRAMED as OUTPUT_FRAMED
        from boostnode.extension.output import ENCIRCLED as OUTPUT_ENCIRCLED
        from boostnode.extension.output import OVERLINED as OUTPUT_OVERLINED
        from boostnode.extension.output import FRAMED_ENCIRCLED_OFF as \
            OUTPUT_FRAMED_ENCIRCLED_OFF
        from boostnode.extension.output import OVERLINED_OFF as \
            OUTPUT_OVERLINED_OFF
        from boostnode.extension.output import RESERVED_3 as OUTPUT_RESERVED_3
        from boostnode.extension.output import RESERVED_4 as OUTPUT_RESERVED_4
        from boostnode.extension.output import RESERVED_5 as OUTPUT_RESERVED_5
        from boostnode.extension.output import RESERVED_6 as OUTPUT_RESERVED_6
        from boostnode.extension.output import IDEOGRAM_UNDERLINE as \
            OUTPUT_IDEOGRAM_UNDERLINE
        from boostnode.extension.output import IDEOGRAM_DOUBLE_UNDERLINE as \
            OUTPUT_IDEOGRAM_DOUBLE_UNDERLINE
        from boostnode.extension.output import IDEOGRAM_OVERLINE as \
            OUTPUT_IDEOGRAM_OVERLINE
        from boostnode.extension.output import IDEOGRAM_DOUBLE_OVERLINE as \
            OUTPUT_IDEOGRAM_DOUBLE_OVERLINE
        from boostnode.extension.output import IDEOGRAM_STRESS_MARKING as \
            OUTPUT_IDEOGRAM_STRESS_MARKING
        from boostnode.extension.output import IDEOGRAM_OFF as \
            OUTPUT_IDEOGRAM_OFF

        def replace_handler(match):
            '''Replaces each console sequence with corresponding html code.'''
            mode = builtins.int(match.group('mode'))
            if mode in (
                RESET_OUTPUT_ATTRIBUTE_MODE, OUTPUT_UNDERLINE_OFF,
                OUTPUT_BLINK_OFF, OUTPUT_REVEAL_OFF, OUTPUT_CROSSED_OUT_OFF,
                OUTPUT_IDEOGRAM_OFF, OUTPUT_FRAMED_ENCIRCLED_OFF,
                OUTPUT_OVERLINED_OFF
            ):
                return '</span>'
            mapping = {
                OUTPUT_HIDDEN: 'visibility: hidden',
                OUTPUT_BOLD: 'font-weight: bold',
                OUTPUT_DIM: 'opacity: .5',
                OUTPUT_ITALIC: 'font-style: italic',
                OUTPUT_UNDERLINE: 'text-decoration: underline',
                OUTPUT_BLINK: 'text-decoration: blink',
                OUTPUT_CROSSED_OUT: 'text-decoration: line-through',
                OUTPUT_DEFAULT_FONT: 'font-family: initial',
                OUTPUT_FRAKTUR_HARDLY: 'font-family: UnifrakturCook',
                OUTPUT_BOLD_OFF: 'font-weight: normal',
                OUTPUT_BOLD_INTENSITY_OFF: 'font-weight: normal',
                OUTPUT_ITALIC_OFF: 'font-style: normal',
                OUTPUT_FRAMED: 'border: 1px solid',
                OUTPUT_ENCIRCLED:
                    'border-radius: 50%; text-align: center; border: 1px '
                    'solid',
                OUTPUT_OVERLINED: 'text-decoration: overline',
                OUTPUT_IDEOGRAM_UNDERLINE: 'text-decoration: underline',
                OUTPUT_IDEOGRAM_DOUBLE_UNDERLINE: 'border-bottom: 1px double',
                OUTPUT_IDEOGRAM_OVERLINE: 'text-decoration: overline',
                OUTPUT_IDEOGRAM_DOUBLE_OVERLINE: 'border-top: 1px double',
                OUTPUT_IDEOGRAM_STRESS_MARKING:
                    'font-weight: bold, color: red'}
            if mode in mapping:
                return '<span style="%s">' % mapping[mode]
            for type, directive_prefix in {
                'foreground': '', 'background': 'background-'
            }.items():
                for color, color_mode in OUTPUT_COLOR[type].items():
                    if mode == color_mode:
                        return '<span style="%scolor: %s">' % (
                            directive_prefix, color.lower())
            return '<span class="console-output-mode-%d">' % mode
        self.content = regularExpression.compile(self.__class__(
            SET_OUTPUT_ATTRIBUTE_MODE
        ).regex_validated.substitute('%d', '(?P<mode>[0-9]+)').content
        ).sub(replace_handler, self.html_validated.content)
        return self

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_number(self: Self, default=None, slice=False):
    def get_number(self, default=None, slice=False):
        '''
            Returns a number representation of current string content if \
            possible. If no conversion is possible given default value will \
            be returned. If given default value is "None" current string \
            will be returned.

            **default** - Fall-back value

            **slice**   - If "True" non numbers will be removed

            Examples:

            >>> String().number
            ''

            >>> String('hans').number
            'hans'

            >>> String('5').number
            5

            >>> String('5.5').number
            5.5

            >>> String('hans').get_number(default=5)
            5

            >>> String('hans').number
            'hans'

            >>> String('hans').get_number(default='test', slice=True)
            'test'

            >>> String('ha4ns').get_number(slice=True)
            4

            >>> String(4).get_number(slice=True)
            4

            >>> String(4).number
            4
        '''
        if slice:
            self.content = regularExpression.compile('[^0-9]+').sub(
                '', self.content)
        try:
            return builtins.int(self.content)
        except(builtins.TypeError, builtins.ValueError):
            try:
                return builtins.float(self.content)
            except(builtins.TypeError, builtins.ValueError):
                if default is None:
                    return self.content
                return default

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_camel_case_capitalize(self: Self) -> Self:
    def get_camel_case_capitalize(self):
        '''
            Acts like pythons native "builtins.str.capitalize()" method but \
            preserves camel case characters.

            Examples:

            >>> String().camel_case_capitalize.content
            ''

            >>> String('haNs').get_camel_case_capitalize().content
            'HaNs'
        '''
        if self.content:
            self.content = self.content[0].upper() + self.content[1:]
        return self

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_delimited_to_camel_case(
# #         self: Self, delimiter='_', abbreviations=None,
# #         preserve_wrong_formatted_abbreviations=False
# #     ) -> Self:
    def get_delimited_to_camel_case(
        self, delimiter='_', abbreviations=None,
        preserve_wrong_formatted_abbreviations=False
    ):
# #
        '''
            Converts a delimited string to its camel case representation.

            **delimiter**                              - Delimiter string

            **abbreviations**                          - Collection of \
                                                         shortcut words to \
                                                         represent upper cased.

            **preserve_wrong_formatted_abbreviations** - If set to "True" \
                                                         wrong formatted \
                                                         camel case \
                                                         abbreviations will \
                                                         be ignored.

            Returns the modified string instance.

            Examples:

            >>> String().delimited_to_camel_case.content
            ''

            >>> String('hans_peter').delimited_to_camel_case.content
            'hansPeter'

            >>> String('hans__peter').delimited_to_camel_case.content
            'hans_Peter'

            >>> String('HansPeter').delimited_to_camel_case.content
            'HansPeter'

            >>> String('Hans_Peter').delimited_to_camel_case.content
            'HansPeter'

            >>> String('_Hans_Peter').delimited_to_camel_case.content
            '_HansPeter'

            >>> String('_').delimited_to_camel_case.content
            '_'

            >>> String('hans_peter').get_delimited_to_camel_case('-').content
            'hans_peter'

            >>> String('hans-peter').get_delimited_to_camel_case('-').content
            'hansPeter'

            >>> String('hans-id').get_delimited_to_camel_case('-').content
            'hansID'

            >>> String('url-hans-id').get_delimited_to_camel_case(
            ...     '-', abbreviations=('hans',)
            ... ).content
            'urlHANSId'

            >>> String('url-hans-1').get_delimited_to_camel_case('-').content
            'urlHans1'

            >>> String('hansUrl1').get_delimited_to_camel_case(
            ...     abbreviations=('url',),
            ...     preserve_wrong_formatted_abbreviations=True
            ... ).content
            'hansUrl1'

            >>> String('hans_url').get_delimited_to_camel_case(
            ...     abbreviations=('url',),
            ...     preserve_wrong_formatted_abbreviations=True
            ... ).content
            'hansURL'

            >>> String('hans_Url').get_delimited_to_camel_case(
            ...     abbreviations=('url',),
            ...     preserve_wrong_formatted_abbreviations=True
            ... ).content
            'hansUrl'

            >>> String('hans_Url').get_delimited_to_camel_case(
            ...     abbreviations=('url',),
            ...     preserve_wrong_formatted_abbreviations=False
            ... ).content
            'hansURL'
        '''
        if abbreviations is None:
            abbreviations = self.abbreviations
        '''NOTE: This is only for performance improvements.'''
        if delimiter in self.SPECIAL_REGEX_SEQUENCES:
            delimiter = self.__class__(delimiter).regex_validated.content
        if preserve_wrong_formatted_abbreviations:
            abbreviations = '|'.join(abbreviations)
        else:
            abbreviations = '|'.join(builtins.map(
                lambda abbreviation: '%s|%s' % (
                    abbreviation.capitalize(), abbreviation),
                abbreviations))
        self.content = regularExpression.compile(
            '(?!^)(?P<before>%s)(?P<abbreviation>%s)(?P<after>%s|$)' % (
                delimiter, abbreviations, delimiter)
        ).sub(
            lambda match: '%s%s%s' % (
                match.group('before'),
                match.group('abbreviation').upper(),
                match.group('after')
            ), self.content)
        self.content = regularExpression.compile(
            '(?!^)%s(?P<first_letter>[a-zA-Z0-9])' % delimiter
        ).sub(
            lambda match: match.group('first_letter').upper(),
            self.content)
        return self

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_camel_case_to_delimited(
# #         self: Self, delimiter='_', abbreviations=None
# #     ) -> Self:
    def get_camel_case_to_delimited(
        self, delimiter='_', abbreviations=None
    ):
# #
        '''
            Converts a camel cased string to its delimited string version.

            **delimiter**     - Delimiter string

            **abbreviations** - Collection of shortcut words to represent \
                                upper cased.

            Returns the modified string instance.

            Examples:

            >>> String().camel_case_to_delimited.content
            ''

            >>> String('hansPeter').camel_case_to_delimited.content
            'hans_peter'

            >>> String('hans_peter').camel_case_to_delimited.content
            'hans_peter'

            >>> String('hansPeter').get_camel_case_to_delimited('-').content
            'hans-peter'

            >>> String('hansPeter').get_camel_case_to_delimited('+').content
            'hans+peter'

            >>> String('Hans').camel_case_to_delimited.content
            'hans'

            >>> String('hansAPIURL').get_camel_case_to_delimited(
            ...     abbreviations=('api', 'url')
            ... ).content
            'hans_api_url'
        '''
        if abbreviations is None:
            abbreviations = self.abbreviations
        escaped_delimiter = self.__class__(delimiter).regex_validated.content
        abbreviations = '|'.join(builtins.map(
            lambda abbreviation: abbreviation.upper(), abbreviations))
        self.content = regularExpression.compile(
            '(%s)(%s)' % (abbreviations, abbreviations)
        ).sub('\\1%s\\2' % delimiter, self.content)
        self.content = regularExpression.compile(
            '([^%s])([A-Z][a-z]+)' % escaped_delimiter
        ).sub('\\1%s\\2' % delimiter, self.content)
        self.content = regularExpression.compile(
            '([a-z0-9])([A-Z])'
        ).sub('\\1%s\\2' % delimiter, self.content).lower()
        return self

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_delimited(
# #         self: Self, delimiter='-', search_pattern='a-zA-Z'
# #     ) -> Self:
    def get_delimited(self, delimiter='-', search_pattern='a-zA-Z'):
# #
        '''
            Replaces all typical delimiting chars with given delimiter.

            **delimiter**      - Delimiter string

            **search_pattern** - Patterns not to delimit

            Returns the modified string instance.

            Examples:

            >>> String().delimited.content
            ''

            >>> String('a b').delimited.content
            'a-b'

            >>> String('a b_').delimited.content
            'a-b'

            >>> String('ab').delimited.content
            'ab'

            >>> String(' ').delimited.content
            ''

            >>> String('   a ').delimited.content
            'a'

            >>> String(' -  a _').delimited.content
            'a'

            >>> String('\\na').delimited.content
            'a'

            >>> String('Get in touch').delimited.content
            'Get-in-touch'

            >>> String("I'm cool").delimited.content
            'I-m-cool'
        '''
        return self.substitute(
            '^[^{pattern}]*(.*?)[^{pattern}]*$'.format(
                pattern=search_pattern
            ), '\\1'
        ).substitute('[^%s]+' % search_pattern, delimiter)

    # # # # region validation

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_shell_validated(self: Self) -> Self:
    def get_shell_validated(self):
        '''
            Validates the current string for using as a command in shell. \
            Special shell command chars will be escaped.

            Examples:

            >>> String(
            ...     'a new folder with special signs "&"'
            ... ).shell_validated # doctest: +ELLIPSIS
            Object of "str" ('a\\\\ new...ial\\\\ signs\\\\ \\\\"\\\\&\\\\"').

            >>> String('').shell_validated.content
            ''

            >>> if sys.version_info.major < 3:
            ...     True
            ... else:
            ...     String(
            ...         """[\"'`()&$ -]"""
            ...     ).shell_validated.content == (
            ...         '[\\\\"\\\\\\'\\\\`\\\\(\\\\)\\\\&\\\\$\\\\ \\\\-]')
            True
        '''
        '''The escape sequence must be escaped at first.'''
        self.replace('\\', '\\\\')
        return self.replace(
            search=self.__class__.get_escaping_replace_dictionary(
                self.SPECIAL_SHELL_SEQUENCES))

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_html_validated(self: Self) -> Self:
    def get_html_validated(self):
# #
        '''
            Validates current string for using as snippet in a html document.

            Examples:

            >>> String('<html></html>').html_validated.content
            '&lt;html&gt;&lt;/html&gt;'
        '''
        return self.replace(self.SPECIAL_HTML_SEQUENCES)

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_regex_validated(self: Self, exclude_symbols=()) -> Self:
    def get_regex_validated(self, exclude_symbols=()):
        '''
            Validates the current string for using in a regular expression \
            pattern. Special regular expression chars will be escaped.

            **exclude_symbols** - Escapes each regular expression special \
                                  character.

            Examples:

            >>> String("that's no regex: .*$").regex_validated
            Object of "str" ("that's no regex: \\\\.\\\\*\\\\$").

            >>> String().get_regex_validated(exclude_symbols=()).content
            ''

            >>> String('-\[]()^$*+.}-').get_regex_validated(('}',)).content
            '\\\\-\\\\\\\\\\\\[\\\\]\\\\(\\\\)\\\\^\\\\$\\\\*\\\\+\\\\.}\\\\-'

            >>> String('-\[]()^$*+.{}-').get_regex_validated(
            ...     ('[', ']', '(', ')', '^', '$', '*', '+', '.', '{')
            ... ).content
            '\\\\-\\\\\\\\[]()^$*+.{\\\\}\\\\-'

            >>> String('-').get_regex_validated(('\\\\',)).content
            '\\\\-'
        '''
        '''NOTE: This is only for performance improvements.'''
        if builtins.len(
            self.content
        ) == 1 and self.content not in self.SPECIAL_REGEX_SEQUENCES:
            return self
        '''The escape sequence must also be escaped; but at first.'''
        if '\\' not in exclude_symbols:
            self.replace('\\', '\\\\')
        return self.replace(
            search=self.__class__.get_escaping_replace_dictionary(
                builtins.tuple(
                    builtins.set(self.SPECIAL_REGEX_SEQUENCES) -
                    builtins.set(exclude_symbols))))

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_format_validated(self: Self) -> Self:
    def get_format_validated(self):
        '''
            Validates the current string for using in a string with \
            placeholder like "{name}". It will be escaped to not interpreted \
            as placeholder like "\{name\}".

            Examples:

            >>> String("that's no {placeholder}").format_validated
            Object of "str" ("that's no \\\\{placeholder\\\\}").

            >>> String().format_validated.content
            ''
        '''
        self.content = regularExpression.compile('{([a-z]+)}').sub(
            '\{\\1\}', self.content)
        return self

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_url_validated(self: Self) -> Self:
    def get_url_validated(self):
        '''
            Validates a given url by escaping special chars.

            Examples:

            >>> String(
            ...     'here%20is%20no%20%22url%22%20present!+'
            ... ).url_validated
            Object of "str" ('here is no "url" present! ').

            >>> String('').url_validated.content
            ''

            >>> if sys.version_info.major < 3:
            ...     True
            ... else:
            ...     String(
            ...         '[+%20%22%2F%7E%C3%A4%C3%84%C3%B6]'
            ...     ).url_validated.content == '[  "/~ÃÂ¤ÃÂÃÂ¶]'
            True

            >>> if sys.version_info.major < 3:
            ...     True
            ... else:
            ...     String(
            ...         '[%C3%96%C3%BC%C3%9C]'
            ...     ).url_validated.content == '[ÃÂÃÂ¼ÃÂ]'
            True
        '''
        search = self.SPECIAL_URL_SEQUENCES
        search.update(self.NON_STANDARD_SPECIAL_URL_SEQUENCES)
        return self.replace(search)

        # # # endregion

    # # # endregion

    @JointPoint
# # python3.5
# #     def find_python_code_end_bracket(
# #         self: Self
# #     ) -> (builtins.int, builtins.bool):
    def find_python_code_end_bracket(self):
# #
        '''
            Searches for the next not escaped closing end clamped in current \
            string interpreted as python code.

            Examples:

            >>> string = 'hans () peter)'
            >>> String(
            ...     'hans () peter)'
            ... ).find_python_code_end_bracket() == string.rfind(')')
            True

            >>> String().find_python_code_end_bracket()
            False
        '''
        brackets = skip = index = 0
        quote = False
        for char in self.content:
            result = self._handle_char_to_find_end_bracket(
                index, char, quote, skip, brackets)
            if builtins.isinstance(result, builtins.int):
                return result
            index, char, quote, skip, brackets = result
        return False

    @JointPoint
# # python3.5
# #     def replace(
# #         self: Self, search: (builtins.str, builtins.dict),
# #         replace='', *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> Self:
    def replace(self, search, replace='', *arguments, **keywords):
# #
        '''
            Implements the pythons native string method "str.replace()" in an \
            object orientated way. This method serves additionally \
            dictionaries as "search" parameter for multiple replacements. If \
            you use dictionaries, the second parameter "replace" becomes \
            useless.

            **search**  - search sequence

            **replace** - string to replace with given search sequence

            Additional arguments and keywords are forwarded to pythons native \
            "str.replace()" method.

            Return a copy of the string with all occurrences of substring old \
            replaced by new. If an optional argument count is given, only the \
            first count occurrences are replaced.

            Examples:

            >>> String('hans').replace('ans', 'ut')
            Object of "str" ('hut').

            >>> String().replace('hans', 'peter')
            Object of "str" ('').

            >>> String().replace('hans', 'peter').content
            ''

            >>> String('hans').replace('hans', 'peter').content
            'peter'
        '''
        if builtins.isinstance(search, builtins.dict):
            for search_string, replacement in search.items():
                # NOTE: This more elegant version is too expensive.
                # '''Take this method name via introspection.'''
                # self.content = builtins.getattr(
                #     self.__class__(self.content), inspect.stack()[0][3]
                # )(search_string, replacement, *arguments, **keywords).content
                self.content = self.__class__(self.content).replace(
                    search_string, replacement, *arguments, **keywords
                ).content
        else:
# # python3.5
# #             self.content = self.content.replace(
# #                 builtins.str(search), builtins.str(replace),
# #                 *arguments, **keywords)
            self.content = convert_to_unicode(
                self.content
            ).replace(convert_to_unicode(search), convert_to_unicode(
                replace
            ), *arguments, **keywords).encode(ENCODING)
# #
        return self

    @JointPoint
# # python3.5
# #     def substitute(
# #         self: Self, search: (builtins.str, builtins.dict), replace=None,
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> Self:
    def substitute(self, search, replace=None, *arguments, **keywords):
# #
        '''
            Implements the pythons native "regularExpression.sub()" method in \
            an object oriented way. This method serves additionally \
            dictionaries as "search" parameter for multiple replacements. If \
            you use dictionaries, the second parameter "replace" becomes \
            useless.

            **search**  - regular expression search pattern

            **replace** - string or function to replace with given search
                          sequence

            Additional arguments and keywords are forwarded to python's \
            native "regularExpression.sub()" method.

            Return the string obtained by replacing the leftmost \
            non-overlapping occurrences of pattern in string by the \
            replacement "replace". If the pattern isn't found, string is \
            returned unchanged. "replace" can be a string or a function;

            If "replace" is a string, any backslash escapes in it are \
            processed. That means "\n" is converted to a single newline \
            character, "\r" is converted to a linefeed, and so forth. Unknown \
            escapes such as "\j" are left alone. Backreferences, such as \
            "\6", are replaced with the substring matched by group 6 in the \
            pattern.

            If "replace" is a function, it is called for every \
            non-overlapping occurrence of pattern. The function takes a \
            single match object argument, and returns the replacement string.

            The pattern may be a string or an RE object. The optional \
            argument count is the maximum number of pattern occurrences to be \
            replaced; count must be a non-negative integer. If omitted or \
            zero, all occurrences will be replaced. Empty matches for the \
            pattern are replaced only when not adjacent to a previous match, \
            so sub('x*', '-', 'abc') returns '-a-b-c-'.

            In addition to character escapes and back references as described \
            above, "\g<name>" will use the substring matched by the group \
            named name, as defined by the "(?P<name>...)" syntax. \
            "\g<number>" uses the corresponding group number; "\g<2>" is \
            therefore equivalent to "\2", but isn't ambiguous in a \
            replacement such as "\g<2>0". "\20" would be interpreted as a \
            reference to group 20, not a reference to group 2 followed by the \
            literal character "0". The backreference "\g<0>" substitutes in \
            the entire substring matched by the regularExpression.

            Examples:

            >>> String('hans').substitute('([^a]+)', ' jau-suffix ')
            Object of "str" (' jau-suffix a jau-suffix ').

            >>> String('hans').substitute('n', 'l')
            Object of "str" ('hals').

            >>> String().substitute('n', 'l').content
            ''

            >>> String('hans').substitute('hans', 'peter').content
            'peter'

            >>> String('hans').substitute({'hans': 'peter'}).content
            'peter'
        '''
        if builtins.isinstance(search, builtins.dict):
            for search_string, replacement in search.items():
                self.content = regularExpression.compile(search_string).sub(
                    replacement, self.content, *arguments, **keywords)
        else:
            self.content = regularExpression.compile(search).sub(
                replace, self.content, *arguments, **keywords)
        return self

    @JointPoint
# # python3.5
# #     def substitute_n(
# #         self: Self, search: (builtins.str, builtins.dict), replace='',
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> builtins.tuple:
    def substitute_n(self, search, replace='', *arguments, **keywords):
# #
        '''
            Implements the pythons native "regularExpression.subn()" method \
            in an object oriented way. This method serves additionally \
            dictionaries as "search" parameter for multiple replacements. If \
            you use dictionaries, the second parameter "replace" becomes \
            useless.

            Perform the same operation as "regularExpression.sub()", but \
            returns a tuple: ("new_string", "number_of_subs_made").

            **search**  - regular expression search pattern

            **replace** - string to replace with given search sequence

            Additional arguments and keywords are forwarded to pythons's \
            native "regularExpression.subn()" method.

            Examples:

            >>> result = String().substitute_n('a')
            >>> result[0].content
            ''
            >>> result[1]
            0

            >>> result = String('hans').substitute_n({'a': 'b', 'n': 'c'})
            >>> result[0].content
            'hbcs'
            >>> result[1]
            2
        '''
        if builtins.isinstance(search, builtins.dict):
            number_of_replaces = 0
            for search_string, replacement in search.items():
# # python3.5
# #                 self.content, temp_number_of_replaces = \
# #                 regularExpression.compile(builtins.str(
# #                     search_string
# #                 )).subn(builtins.str(
# #                     replacement
# #                 ), self.content, *arguments, **keywords)
                self.content, temp_number_of_replaces = \
                regularExpression.compile(convert_to_unicode(
                    search_string
                )).subn(convert_to_unicode(
                    replacement
                ), self.content, *arguments, **keywords)
# #
                number_of_replaces += temp_number_of_replaces
        else:
# # python3.5
# #             self.content, number_of_replaces = regularExpression.compile(
# #                 builtins.str(search)
# #             ).subn(builtins.str(
# #                 replace
# #             ), self.content, *arguments, **keywords)
            self.content, number_of_replaces = regularExpression.compile(
                convert_to_unicode(search)
            ).subn(convert_to_unicode(
                replace
            ), self.content, *arguments, **keywords)
# #
        return self, number_of_replaces

    @JointPoint
# # python3.5     def readline(self: Self) -> (SelfClassObject, builtins.bool):
    def readline(self):
        '''
            Implements the pythons native "bz2.BZ2File.readline()" method in \
            an object oriented way.

            Return the next line from the string, as a string object, \
            retaining newline.

            Returns "False" on EOF.

            Examples:

            >>> string = String('hans\\npeter\\nklaus and sally\\n')
            >>> string.readline()
            Object of "str" ('hans').
            >>> string.readline()
            Object of "str" ('peter').
            >>> string.readline().content
            'klaus and sally'
            >>> string.readline()
            False

            >>> String('hans').readline()
            Object of "str" ('hans').

            >>> string = String('hans')
            >>> string.readline().content
            'hans'
            >>> string.readline()
            False
        '''
        self._current_line_number += 1
        if builtins.len(self.readlines()) >= self._current_line_number:
            return self.__class__(
                self.readlines()[self._current_line_number - 1])
        return False

    @JointPoint
# # python3.5
# #     def readlines(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.list:
    def readlines(self, *arguments, **keywords):
# #
        '''
            Implements the pythons native "builtins.str.splitlines()" method \
            in an object oriented way.

            Additional arguments and keywords are forwarded to python's \
            native "str.splitlines()" method.

            Return a list of all lines in a string, breaking at line \
            boundaries. Line breaks are not included in the resulting list \
            unless "keepends" is given and "True".

            Examples:

            >>> lines = String('hans\\npeter\\nklaus and sally\\n')
            >>> lines.readlines(True)
            ['hans\\n', 'peter\\n', 'klaus and sally\\n']

            >>> lines.readlines()
            ['hans', 'peter', 'klaus and sally']

            >>> String('hans').readlines()
            ['hans']

            >>> String().readlines()
            []
        '''
        return self.content.splitlines(*arguments, **keywords)

    @JointPoint
# # python3.5     def delete_variables_from_regex(self: Self) -> Self:
    def delete_variables_from_regex(self):
        '''
            Removes python supported variables in regular expression strings. \
            This method is useful if a python regular expression should be \
            given to another regular expression engine which doesn't support \
            variables.

            Examples:

            >>> String('^--(?P<name>.+)--$').delete_variables_from_regex()
            Object of "str" ('^--(.+)--$').

            >>> String(
            ...     '^--(?P<a>.+)--(?P<b>.+)--$'
            ... ).delete_variables_from_regex()
            Object of "str" ('^--(.+)--(.+)--$').
        '''
        return self.substitute_n(
            '\(\?P<[a-z]+>(?P<pattern>.+?)\)', '(\g<pattern>)'
        )[0]

    # # endregion

    # # region protected

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def _determine_encoding(self: Self, content) -> builtins.tuple:
    def _determine_encoding(self, content):
# #
        '''
            Guesses the encoding used in current string (bytes). Encodings \
            are checked in alphabetic order.
        '''
        if content:
            for encoding in builtins.list(
                self.IMPORTANT_ENCODINGS
            ) + builtins.sorted(builtins.filter(
                lambda encoding: encoding not in self.IMPORTANT_ENCODINGS,
                builtins.set(encodings.aliases.aliases.values())
            )):
                try:
                    content = content.decode(encoding)
                except builtins.UnicodeDecodeError:
                    pass
                else:
                    return encoding, content
        return self.IMPORTANT_ENCODINGS[0], content

    # # # region find python code end bracket helper

    @JointPoint
# # python3.5
# #     def _handle_char_to_find_end_bracket(
# #         self: Self, index: builtins.int, char: builtins.str,
# #         quote: (builtins.str, builtins.bool), skip: builtins.int,
# #         brackets: builtins.int
# #     ) -> (builtins.tuple, builtins.int):
    def _handle_char_to_find_end_bracket(
        self, index, char, quote, skip, brackets
    ):
# #
        '''
            Helper method for "find_python_code_end_bracket()".

            Examples:

            >>> String()._handle_char_to_find_end_bracket(
            ...     0, '\\\\', True, 0, 0)
            (1, '\\\\', True, 1, 0)

            >>> String()._handle_char_to_find_end_bracket(
            ...     1, 'a', True, 1, 0)
            (2, 'a', True, 0, 0)

            >>> String()._handle_char_to_find_end_bracket(
            ...     1, 'a', True, 0, 0)
            (2, 'a', True, 0, 0)

            >>> String()._handle_char_to_find_end_bracket(
            ...     1, '"', True, 0, 0)
            (2, '"', True, 0, 0)

            >>> String()._handle_char_to_find_end_bracket(
            ...     1, '(', True, 0, 0)
            (2, '(', True, 0, 0)

            >>> String()._handle_char_to_find_end_bracket(
            ...     1, '"', False, 0, 0)
            (2, '"', '"', 0, 0)
        '''
        if char == '\\':
            '''Handle escape sequences.'''
            skip = 1
        elif skip:
            skip -= 1
        elif quote:
            char, quote, skip = self._handle_quotes_to_find_end_bracket(
                index, char, quote, skip)
        elif char == ')':
            '''Handle ending brackets.'''
            if brackets:
                brackets -= 1
            else:
                return index
        elif char in ('"', "'"):
            quote, skip = self._handle_start_quotes_to_find_end_bracket(
                index, char, quote, skip)
        elif char == '(':
            '''Handle opening brackets.'''
            brackets += 1
        return index + 1, char, quote, skip, brackets

    @JointPoint
# # python3.5
# #     def _handle_start_quotes_to_find_end_bracket(
# #         self: Self, index: builtins.int, char: builtins.str,
# #         quote: (builtins.str, builtins.bool), skip: builtins.int
# #     ) -> builtins.tuple:
    def _handle_start_quotes_to_find_end_bracket(
        self, index, char, quote, skip
    ):
# #
        '''
            Helper method for "find_python_code_end_bracket()".

            Examples:

            >>> String('aaa')._handle_start_quotes_to_find_end_bracket(
            ...     0, 'a', True, 0)
            ('aaa', 2)
        '''
        if self.content[index:index + 3] == 3 * char:
            quote = char * 3
            skip = 2
        else:
            quote = char
        return quote, skip

    @JointPoint
# # python3.5
# #     def _handle_quotes_to_find_end_bracket(
# #         self: Self, index: builtins.int, char: builtins.str,
# #         quote: (builtins.str, builtins.bool), skip: builtins.int
# #     ) -> builtins.tuple:
    def _handle_quotes_to_find_end_bracket(self, index, char, quote, skip):
# #
        '''
            Helper method for "find_python_code_end_bracket()".

            Examples:

            >>> String()._handle_quotes_to_find_end_bracket(0, '"', '"', 0)
            ('"', False, 0)

            >>> String('aaa')._handle_quotes_to_find_end_bracket(
            ...     0, 'a', 'aaa', 0)
            ('a', False, 2)
        '''
        if char == quote:
            quote = False
        elif self.content[index:index + 3] == quote:
            skip = 2
            quote = False
        return char, quote, skip

    # # # endregion

    # # endregion

    # endregion


class Iterable(Object):

    '''
        This class extends the native iterable object.

        **content** - content for iterable object
    '''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __hash__(self: Self) -> builtins.int:
    def __hash__(self):
        '''
            Invokes if this object should describe itself by a hash value.

            Examples:

            >>> isinstance(hash(Iterable({'a': 'hans'})), int)
            True
        '''
        return builtins.hash(self.immutable)

    @JointPoint
# # python3.5
# #     def __getitem__(
# #         self: Self, key: (builtins.object, builtins.type)
# #     ) -> (builtins.object, builtins.type):
    def __getitem__(self, key):
# #
        '''
            Invokes if this object should returns current value stored at \
            given key.

            **key** - iterable key to get.

            Returns the requested iterable value.

            Examples:

            >>> Iterable({'a': 'hans'})['a']
            'hans'

            >>> Iterable((1, 2))[1]
            2
        '''
        return self.content[key]

    # # # endregion

    # # # region getter methods

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_rendered(self: Self, mapping={}, **keywords: (
# #         builtins.type, builtins.object
# #     )) -> builtins.list:
    def get_rendered(self, mapping={}, **keywords):
# #
        '''
            Renders current data wich are marked with the corresponding \
            special key against given mapping recursively.

            Examples:

            TODO
        '''
        if builtins.isinstance(self.content, builtins.dict):
            keys = builtins.tuple(self.content.keys())
            if builtins.len(keys) and keys[0] == '__execute__':
                return self._parse(
                    object=builtins.tuple(self.content.values())[0],
                    mapping=mapping, **keywords)
            '''
                NOTE: We sort nested dictionaries to the end to have a breath \
                first search.
            '''
            for key, value in self.content.items():
                if builtins.isinstance(value, (builtins.dict, builtins.list)):
                    self.content[key] = Iterable(content=value).get_rendered(
                        mapping=mapping, **keywords)
        elif builtins.isinstance(self.content, builtins.list):
            for index, value in builtins.enumerate(self.content):
                if builtins.isinstance(value, (builtins.dict, builtins.list)):
                    self.content[index] = Iterable(content=value).get_rendered(
                        mapping=mapping, **keywords)
        return self.content

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_immutable(self: Self, exclude=(), path=[]) -> builtins.tuple:
    def get_immutable(self, exclude=(), path=[]):
# #
        '''
            Generates an immutable copy of the current iterable. Mutable \
            iterables are generally translated to sorted tuples.

            **exclude** - A tuple of keys to ignore in resulting immutable.

            **path**    - A list of keys to mark current context in nested \
                          structures.

            Examples:

            >>> Iterable({'a': 'A', 'b': 'B'}).get_immutable(exclude=('a',))
            (('b', 'B'),)

            >>> Iterable({'a': 'A', 'b': {'c': 2}}).get_immutable(
            ...     exclude=(['b', 'c'],))
            (('a', 'A'), ('b', ()))

            >>> Iterable({5: 'hans'}).immutable
            ((5, 'hans'),)

            >>> Iterable([5, 'hans']).immutable
            (5, 'hans')
        '''
        if builtins.isinstance(self.content, builtins.dict):
            return self._convert_to_immutable(
                path=path, items=self.content.items(), exclude=exclude)
        return self._convert_to_immutable(path=path, items=builtins.enumerate(
            self.content
        ), exclude=exclude, explicit_keys=False)

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_compatible_types(
# #         self: Self, *arguments: (builtins.object, builtins.type),
# #         **keywords: (builtins.object, builtins.type)
# #     ) -> (builtins.object, builtins.type):
    def get_compatible_types(self, *arguments, **keywords):
# #
        '''
            Converts iterable where each type will be converted to a cross \
            system compatible type. The result is serialiseable (e.g. to \
            json). This method provides the same interface as "convert()".

            Examples:

            >>> Iterable({}).compatible_types.content
            {}

            >>> Iterable({2: 2}).compatible_types.content
            {2: 2}
        '''
# # python3.5
# #         return self.convert(
# #             *arguments, key_wrapper=lambda key,
# #             value: self._convert_to_compatible_type(
# #                 String(key).get_delimited_to_camel_case(
# #                     preserve_wrong_formatted_abbreviations=True
# #                 ).content if builtins.isinstance(
# #                     key, builtins.str
# #                 ) else key
# #             ), value_wrapper=self._convert_to_compatible_type, **keywords)
        return self.convert(
            *arguments, key_wrapper=lambda key,
            value: self._convert_to_compatible_type(
                String(key).get_delimited_to_camel_case(
                    preserve_wrong_formatted_abbreviations=True
                ).content if builtins.isinstance(
                    key, (builtins.unicode, builtins.str)
                ) else key
            ), value_wrapper=self._convert_to_compatible_type, **keywords)
# #

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_known_types(
# #         self: Self, *arguments: (builtins.object, builtins.type),
# #         strict=True, **keywords: (builtins.object, builtins.type)
# #     ) -> (builtins.object, builtins.type):
    def get_known_types(self, *arguments, **keywords):
# #
        '''
            Converts iterable where each type will be tried to converted to \
            a native python type. This method provides the same interface as \
            "convert()".

            **strict** - If set to "False" a non convertible value will be \
                         given back as it is. If set to "True" an exception \
                         will be raised and if set to "None" "None" will be \
                         given back for none convertible values.

            Examples:

            >>> Iterable({'value': '12.234'}).known_types.content
            {'value': 12.234}
        '''
# # python3.5
# #         return self.convert(
# #             *arguments,
# #             key_wrapper=lambda key, value: self._convert_to_known_type(
# #                 String(
# #                     key
# #                 ).camel_case_to_delimited.content if builtins.isinstance(
# #                     key, builtins.str
# #                 ) else key, strict=True if strict is None else strict
# #             ), value_wrapper=lambda key, value:
# #                self._convert_to_known_type(key, value, strict), **keywords)
        strict, keywords = Dictionary(keywords).pop_from_keywords(
            name='strict', default_value=True)
        return self.convert(
            *arguments,
            key_wrapper=lambda key, value: self._convert_to_known_type(
                String(
                    key
                ).camel_case_to_delimited.content if builtins.isinstance(
                    key, (builtins.unicode, builtins.str)
                ) else key, strict=True if strict is None else strict
            ), value_wrapper=lambda key, value:
                self._convert_to_known_type(key, value, strict), **keywords)
# #

    # # # endregion

    # # # region boolean

    @JointPoint
# # python3.5
# #     def is_in_pattern(self: Self, value: builtins.str) -> (
# #         builtins.str, builtins.bool
# #     ):
    def is_in_pattern(self, value):
# #
        '''
            Checks if given value matches current list interpreted as regular \
            expressions.

            **value** - String to check if it matches on pattern.

            Returns the matching pattern if matches an "False" otherwise.

            Examples:

            >>> Iterable(('a', 'b')).is_in_pattern('a')
            'a'

            >>> Iterable(('a', 'b')).is_in_pattern('c')
            False

            >>> Iterable(()).is_in_pattern('a')
            False
        '''
# # python3.5
# #         for pattern in builtins.filter(
# #             lambda pattern: regularExpression.compile(pattern).fullmatch(
# #                 value
# #             ), self.content
# #         ):
        for pattern in builtins.filter(
            lambda pattern: regularExpression.compile(
                '(?:%s)$' % pattern
            ).match(value), self.content
        ):
# #
            return pattern
        return False

    # # # endregion

    @JointPoint
# # python3.5
# #     def convert(
# #         self: Self, key_wrapper=lambda key, value: key,
# #         value_wrapper=lambda key, value: value,
# #         no_wrap_indicator='__no_wrapping__',
# #         remove_no_wrap_indicator=True, filter=lambda key, value: True
# #     ) -> Self:
    def convert(
        self, key_wrapper=lambda key, value: key,
        value_wrapper=lambda key, value: value,
        no_wrap_indicator='__no_wrapping__',
        remove_no_wrap_indicator=True, filter=lambda key, value: True
    ):
# #
        '''
            Converts all keys or values and nested keys or values with given \
            callback functions.

            **key_wrapper**              - Function to convert each visited key

            **value_wrapper**            - Function to convert each visited \
                                           value

            **no_wrap_indicator**        - Key name to skip conversion for \
                                           corresponding value

            **remove_no_wrap_indicator** - Removes wrap indicator und leaves \
                                           its value untouched.

            **filter**                   - Function to filter properties from \
                                           given iterable.

            Examples:

            >>> Iterable({}).convert().content
            {}

            >>> Iterable(['a']).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content
            ['_a_']

            >>> Iterable({'a', 'b'}).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content == {'_a_', '_b_'}
            True

            >>> Iterable({'a', 'b'}).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value,
            ...     filter=lambda key, value: value == 'a'
            ... ).content == {'_a_'}
            True

            >>> input = {'hans': 'peter', 5: 3}
            >>> Iterable(input).convert().content == input
            True

            >>> Iterable({'a': 'b', 'b': ['a']}).convert(
            ...     key_wrapper=lambda key, value: '_%s_' % key
            ... ).content == {'_a_': 'b', '_b_': ['a']}
            True

            >>> Iterable({'a': 'b', 'b': ['a']}).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content == {'a': '_b_', 'b': ['_a_']}
            True

            >>> Iterable({'a': 'b', 'b': ['a']}).convert(
            ...     key_wrapper=lambda key, value: '_%s_' % key,
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content == {'_a_': '_b_', '_b_': ['_a_']}
            True

            >>> Iterable({'a': {'a', 'b'}}).convert(
            ...     key_wrapper=lambda key, value: '_%s_' % key,
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content == {'_a_': {'_a_', '_b_'}}
            True

            >>> Iterable(
            ...     {'a': {'b'}, 'b': {'a': [{'a': 'b'}, ['a']]}}
            ... ).convert(
            ...     key_wrapper=lambda key, value: '_%s_' % key,
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content == {
            ...     '_a_': {'_b_'}, '_b_': {'_a_': [{'_a_': '_b_'}, ['_a_']]}}
            True

            >>> Iterable(
            ...     {'a': {'b'}, 'b': range(2)}
            ... ).convert(
            ...     key_wrapper=lambda key, value: '_%s_' % key,
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content == {'_a_': {'_b_'}, '_b_': ['_0_', '_1_']}
            True

            >>> Iterable({'key': {'__no_wrapping__': 'value'}}).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content
            {'key': 'value'}

            >>> Iterable({'key': {'__no_wrapping__': 'value'}}).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content
            {'key': 'value'}

            >>> Iterable(
            ...     {'a': {'__no_wrapping__': {'b': '1'}, 'b': 2}, 'b': 5}
            ... ).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value
            ... ).content == {'a': {'b': '_2_'}, 'b': '_5_'}
            True

            >>> Iterable({'key': {'__no_wrapping__': 'value'}}).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value,
            ...     remove_no_wrap_indicator=False
            ... ).content
            {'key': {'__no_wrapping__': 'value'}}

            >>> Iterable({'key': {'__no_wrapping__': 'value'}}).convert(
            ...     value_wrapper=lambda key, value: '_%s_' % value,
            ...     no_wrap_indicator=''
            ... ).content
            {'key': {'__no_wrapping__': '_value_'}}

            >>> Iterable({'__no_wrapping__': {'A': 2}}).convert(
            ...     key_wrapper=lambda key, value: key.lower(),
            ...     remove_no_wrap_indicator=True
            ... ).content
            {'A': 2}

            >>> Iterable({'B': {'__no_wrapping__': {'A': 2}}}).convert(
            ...     key_wrapper=lambda key, value: key.lower(),
            ...     remove_no_wrap_indicator=True
            ... ).content
            {'b': {'A': 2}}

            >>> Iterable({'A': 1, 'B': 2}).convert(
            ...     key_wrapper=lambda key, value: key.lower(),
            ...     remove_no_wrap_indicator=True,
            ...     filter=lambda key, value: value == 2
            ... ).content
            {'b': 2}

            >>> Iterable([1, 2]).convert(
            ...     filter=lambda key, value: value == 2
            ... ).content
            [2]
        '''
        if builtins.isinstance(self.content, builtins.dict):
            return self._convert_dictionary(
                key_wrapper, value_wrapper, no_wrap_indicator,
                remove_no_wrap_indicator, filter)
        if builtins.isinstance(self.content, builtins.set):
            self.content = self._convert_set(
                key_wrapper, value_wrapper, no_wrap_indicator,
                remove_no_wrap_indicator, filter)
            return self
# # python3.5
# #         if builtins.isinstance(self.content, builtins.range):
# #             self.content = builtins.list(self.content)
        pass
# #
        try:
            was_tuple = False
            if builtins.isinstance(self.content, builtins.tuple):
                was_tuple = True
                self.content = builtins.list(self.content)
            '''
                NOTE: We can't sort nested list structures to the end because \
                the ordering is part of the structure itself.
            '''
            key = 0
            '''
                NOTE: We have to copy to avoid double convert of some keys or \
                values.
            '''
            for value in copy(self.content):
                if filter(key, value):
                    self._convert_value(
                        key, key, value, key_wrapper, value_wrapper,
                        no_wrap_indicator, remove_no_wrap_indicator, filter)
                    key += 1
                else:
                    del self.content[key]
            if was_tuple:
                self.content = builtins.tuple(self.content)
        except builtins.TypeError as exception:
            '''
                NOTE: We have visited a non indexable value (e.g. an uploaded \
                file).
            '''
# # python3.5
# #             __logger__.debug(
# #                 '%s: %s (%s)', exception.__class__.__name__,
# #                 builtins.str(exception), builtins.type(self.content))
            __logger__.debug(
                '%s: %s (%s)', exception.__class__.__name__,
                convert_to_unicode(exception), builtins.type(self.content))
# #
        return self

    # # endregion

    # # region protected methods

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _parse(cls: SelfClass, object: (
# #         builtins.type, builtins.object
# #     ), mapping: builtins.dict, **keywords: (
# #         builtins.type, builtins.object
# #     )) -> builtins.str:
    def _parse(cls, object, mapping, **keywords):
# #
        '''
            Renders given object against given mapping.

            Examples:

            TODO
        '''
        from boostnode.runnable.template import DEFAULT_CODE_DELIMITER
        from boostnode.runnable.template import Parser

        return Parser(regularExpression.compile(
            '(^|[^\\\\])\\\\([^\\\\]|$)'
        ).sub('\\1\\\\\\2', object).replace('%s%s' % (
            DEFAULT_CODE_DELIMITER['left'],
            DEFAULT_CODE_DELIMITER['right_escaped']
        ), '%s%s%s' % (
            DEFAULT_CODE_DELIMITER['left'],
            DEFAULT_CODE_DELIMITER['right_escaped'],
            DEFAULT_CODE_DELIMITER['right_escaped']
        )), string=True,
        serializer=lambda object, converter: cls._serialize(
            object, converter, mapping=mapping, **keywords
        )).render(mapping=mapping, **keywords).output

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _serialize(
# #         self: Self, object: (builtins.type, builtins.object),
# #         converter: (Function, Method), mapping: builtins.dict,
# #         **keywords: (builtins.type, builtins.object)
# #     ) -> builtins.str:
    def _serialize(cls, object, converter, mapping, **keywords):
# #
        '''
            Retrieves nested keys to render if marked.

            Examples:

            TODO
        '''
        if builtins.isinstance(object, builtins.dict):
            keys = tuple(object.keys())
            if builtins.len(keys) and keys[0] == '__execute__':
                return converter(cls._parse(
                    object=builtins.tuple(object.values())[0], mapping=mapping,
                    **keywords))
        return converter(object)

    @JointPoint
# # python3.5
# #     def _convert_value(
# #         self: Self, old_key, key, value, key_wrapper: (Function, Method),
# #         value_wrapper: (Function, Method), no_wrap_indicator: builtins.str,
# #         remove_no_wrap_indicator: builtins.bool, filter: (Function, Method)
# #     ) -> Self:
    def _convert_value(
        self, old_key, key, value, key_wrapper, value_wrapper,
        no_wrap_indicator, remove_no_wrap_indicator, filter
    ):
# #
        '''Converts given key value pair in current iterable.'''
        if Object(content=value).is_convertable_iterable():
            new_value = Iterable(content=value).convert(
                key_wrapper, value_wrapper, no_wrap_indicator,
                remove_no_wrap_indicator, filter
            ).content
            if old_key != key and key in self.content and builtins.hasattr(
                new_value, 'update'
            ):
                '''If new key already exists try to merge old and new data.'''
                if builtins.hasattr(self, 'update'):
                    self.content[key] = self.__class__(
                        self.content[key]
                    ).update(new_value).content
                elif builtins.hasattr(self.content[key], 'update'):
                    self.content[key].update(new_value)
                else:
                    self.content[key] = new_value
            else:
                self.content[key] = new_value
        else:
            self.content[key] = value_wrapper(key, value)
        return self

    @JointPoint
# # python3.5
# #     def _convert_to_immutable(
# #         self: Self, path, items: NativeIterable, exclude: builtins.tuple,
# #         explicit_keys=True
# #     ) -> builtins.tuple:
    def _convert_to_immutable(
        self, path, items, exclude, explicit_keys=True
    ):
# #
        '''
            Converts given iterable into an immutable tuple.

            Examples:

            >>> Iterable({})._convert_to_immutable([], {2: 2}.items(), ())
            ((2, 2),)

            >>> Iterable({})._convert_to_immutable([], {}.items(), ())
            ()

            >>> Iterable({})._convert_to_immutable([], {2: [1, 2]}.items(), ())
            ((2, (1, 2)),)

            >>> Iterable({})._convert_to_immutable([], {2: [2, 1]}.items(), ())
            ((2, (1, 2)),)

            >>> Iterable({})._convert_to_immutable(
            ...     [], {2: [2, 1]}.items(), (2,))
            ()

            >>> Iterable({})._convert_to_immutable([], {
            ...     2: [2, 1], 'a': [1]
            ... }.items(), (2,))
            (('a', (1,)),)

            >>> Iterable({})._convert_to_immutable([], {
            ...     'b': [2, 1], 'a': [1]
            ... }.items(), ())
            (('a', (1,)), ('b', (1, 2)))
        '''
        result = []
        for key, value in builtins.filter(lambda item: not builtins.tuple(
            builtins.filter(lambda excluded_item: builtins.isinstance(
                excluded_item, builtins.list
            ) and (path + [item[0]]) == excluded_item or
            item[0] == excluded_item, exclude)
        ), items):
            '''
                NOTE: We can't use self class by introspection here because \
                these class was may be derived to some concrete iterable.
            '''
            if not Object(content=value).is_hashable():
                value = Iterable(content=value).get_immutable(
                    exclude, path=path + [key])
            result.append((key, value) if explicit_keys else value)
        return builtins.tuple(builtins.sorted(result, key=builtins.str))

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _convert_to_compatible_type(
# #         cls: SelfClass, key: (builtins.object, builtins.type), value=Null
# #     ) -> (builtins.object, builtins.type):
    def _convert_to_compatible_type(cls, key, value=Null):
# #
        '''
            Converts data to python cross platform compatible data objects.

            Examples:

            >>> Iterable({})._convert_to_compatible_type('key')
            'key'

            >>> Iterable({})._convert_to_compatible_type('key', 'value')
            'value'
        '''
        if value is Null:
            value = key
        return Object(content=value).compatible_type

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _convert_to_known_type(
# #         cls: SelfClass, key: (builtins.object, builtins.type), value=Null,
# #         strict=True
# #     ) -> (builtins.object, builtins.type):
    def _convert_to_known_type(cls, key, value=Null, strict=True):
# #
        '''
            Converts interpretable data to python specific data objects.

            Examples:

            >>> Iterable({})._convert_to_known_type('key')
            'key'

            >>> Iterable({})._convert_to_known_type('key', 'value')
            'value'
        '''
        return Object(content=key if value is Null else value).get_known_type(
            description=None if value is Null else key, strict=strict)

    @JointPoint
# # python3.5
# #     def _convert_dictionary(
# #         self: Self, key_wrapper: (Function, Method),
# #         value_wrapper: (Function, Method), no_wrap_indicator: builtins.str,
# #         remove_no_wrap_indicator: builtins.bool, filter: (Function, Method)
# #     ) -> Self:
    def _convert_dictionary(
        self, key_wrapper, value_wrapper, no_wrap_indicator,
        remove_no_wrap_indicator, filter
    ):
# #
        '''
            Converts all keys or values and nested keys or values with given \
            callback function in a given dictionary.
        '''
        convertable_iterables = []
        sorted_content = []
        for key, value in self.content.items():
            if Object(content=value).is_convertable_iterable():
                convertable_iterables.append((key, value))
            else:
                sorted_content.append((key, value))
        sorted_content += convertable_iterables
        for key, value in sorted_content:
            if key == no_wrap_indicator:
                if remove_no_wrap_indicator:
                    if builtins.len(self.content) > 1:
                        del self.content[key]
                        value.update(self.content)
                        self.content = value
                        continue
                    self.content = value
                return self
            if filter(key, value):
                old_key = key
                key = key_wrapper(key, value)
                self._convert_value(
                    old_key, key, value, key_wrapper, value_wrapper,
                    no_wrap_indicator, remove_no_wrap_indicator, filter)
                if key != old_key:
                    del self.content[old_key]
            else:
                del self.content[key]
        return self

    @JointPoint
# # python3.5
# #     def _convert_set(
# #         self: Self, key_wrapper: (Function, Method),
# #         value_wrapper: (Function, Method), no_wrap_indicator: builtins.str,
# #         remove_no_wrap_indicator: builtins.bool, filter: (Function, Method)
# #     ) -> builtins.set:
    def _convert_set(
        self, key_wrapper, value_wrapper, no_wrap_indicator,
        remove_no_wrap_indicator, filter
    ):
# #
        '''
            Converts all values and nested keys or values with given callback \
            function in a given set.

            Examples:

            >>> Iterable({(1,)})._convert_set(
            ...     lambda key, value: key, lambda key, value: value, '',
            ...     False, lambda key, value: True
            ... ) == {(1,)}
            True
        '''
        convertable_iterables = []
        sorted_content = []
        for value in builtins.filter(
            lambda value: filter(None, value), self.content
        ):
            if Object(content=value).is_convertable_iterable():
                convertable_iterables.append(value)
            else:
                sorted_content.append(value)
        sorted_content += convertable_iterables
        new_set = builtins.set()
        for value in sorted_content:
            if Object(content=value).is_convertable_iterable():
                '''
                    NOTE: We can't use self class by introspection here \
                    because these class has may be derived to some concrete \
                    iterable.
                '''
                value = Iterable(content=value).convert(
                    key_wrapper, value_wrapper, no_wrap_indicator,
                    remove_no_wrap_indicator, filter
                ).content
            new_set.add(value_wrapper(key=None, value=value))
        return new_set

        # endregion

    # endregion


class Dictionary(Iterable, builtins.dict):

    '''
        This class extends the native dictionary object.

        **content** - content for dictionary object

        Additional arguments and keywords are forwarded to python's native \
        "dict()" method.
    '''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __init__(
# #         self: Self, content=None, **keywords: builtins.object
# #     ) -> None:
    def __init__(self, content=None, **keywords):
# #
        '''
            Generates a new high level wrapper around given object.

            Examples:

            >>> Dictionary((('hans', 5), (4, 3))) # doctest: +ELLIPSIS
            Object of "dict" (...hans...5...).

            >>> Dictionary() # doctest: +ELLIPSIS
            Object of "dict" ({}).
        '''

        # # # region properties

        '''The main property. It saves the current dictionary.'''
        if builtins.isinstance(content, self.__class__):
            content = content.content
        elif content is None:
            content = {}
        self.content = builtins.dict(content)

        # # # endregion

    # # # endregion

    # # # region getter

    @JointPoint(Class.pseudo_property)
# # python3.5
# #     def get_topological_sorted(self: Self) -> builtins.list:
    def get_topological_sorted(self):
# #
        '''
            Determines a topological sorted list of current dictionary \
            interpreted as graph.

            Examples:

            TODO
        '''
        order, enter, state = deque(), set(self.content), {}

        def dfs(node):
            state[node] = False
            for k in self.content.get(node, ()):
                sk = state.get(k, None)
                # TODO
                if sk is False:
                    raise __exception__('Given graph has a cycle.')
                if sk is True:
                    continue
                enter.discard(k)
                dfs(k)
            order.appendleft(node)
            state[node] = True
        while enter:
            dfs(enter.pop())
        self.content = builtins.list(order)
        return self

    # # # endregion

    @JointPoint
# # python3.5
# #     def pop_from_keywords(
# #         self: Self, name: builtins.str, default_value=None
# #     ) -> builtins.tuple:
    def pop_from_keywords(self, name, default_value=None):
# #
        '''
            Get a keyword element as it would be set by a default value. If \
            name is present in current saved dictionary its value will be \
            returned in a tuple with currently saved dictionary. The \
            corresponding data will be erased from dictionary.

            **name**          - key to get from current dictionary instance

            **default_value** - value to return if requested key isn't \
                                present in current dictionary instance.

            Returns a tuple with requested value as first item and internal \
            dictionary as second.

            Examples:

            >>> dictionary = Dictionary({'hans': 'peter', 5: 3})
            >>> dictionary.pop_from_keywords('hans', 5)
            ('peter', {5: 3})

            >>> dictionary.pop_from_keywords('hans', 5)
            (5, {5: 3})

            >>> Dictionary({5: 3}).pop_from_keywords('hans', True)
            (True, {5: 3})
        '''
        if name in self.content:
            result = self.content[name]
            del self.content[name]
            return result, self.content
        return default_value, self.content

    @JointPoint
# # python3.5
# #     def update(
# #         self: Self, other: (SelfClassObject, builtins.dict),
# #         prepend_list_indicator='__prepend__',
# #         append_list_indicator='__append__'
# #     ) -> Self:
    def update(
        self, other, prepend_list_indicator='__prepend__',
        append_list_indicator='__append__'
    ):
# #
        '''
            Performs a recursive update.

            Examples:

            >>> Dictionary({'a': 1}).update({'b': 2}).content == {
            ...     'a': 1, 'b': 2}
            True

            >>> Dictionary({'a': 1}).update(Dictionary({'b': 2})).content == {
            ...     'a': 1, 'b': 2}
            True

            >>> Dictionary({'a': 1}).update(Dictionary({'a': 2})).content
            {'a': 2}

            >>> Dictionary({'a': {'a': 1}}).update(Dictionary(
            ...     {'a': 1}
            ... )).content
            {'a': 1}

            >>> Dictionary({'a': {'a': 1}}).update(Dictionary(
            ...     {'a': {'b': 2}}
            ... )).content == {'a': {'a': 1, 'b': 2}}
            True

            >>> Dictionary({'a': {'a': 1}}).update(Dictionary(
            ...     {'a': {'a': 2}}
            ... )).content
            {'a': {'a': 2}}

            >>> Dictionary({'a': [1, 2, 3]}).update(
            ...     other={'a': {'__append__': [4]}}
            ... ).content
            {'a': [1, 2, 3, 4]}

            >>> Dictionary({'a': 1}).update(
            ...     other={'a': {'__append__': [4]}}
            ... ).content
            {'a': {'__append__': [4]}}

            >>> Dictionary({'a': {'__append__': [4]}}).update(
            ...     other={'a': {'__append__': [3]}}
            ... ).content
            {'a': [4, 3]}

            >>> Dictionary({'a': {'__append__': [4]}}).update(
            ...     other={'a': [3]}
            ... ).content
            {'a': [3, 4]}

            >>> Dictionary({'a': {'__append__': 4}}).update(
            ...     other={'a': [3]}
            ... ).content
            {'a': [3]}
        '''
        '''
            NOTE: We can't use self class by introspection here because these \
            class has may be derived to some concrete iterable.
        '''
        for key, value in Dictionary(other).content.items():
            if key in self.content:
                if self._update_with_iterable(
                    key, value, prepend_list_indicator, append_list_indicator
                ):
                    continue
            self.content[key] = value
        return self

    # # endregion

    # # region protected

    @JointPoint
# # python3.5
# #     def _update_with_iterable(
# #         self: Self, key: (builtins.object, builtins.type),
# #         value: (builtins.object, builtins.type),
# #         prepend_list_indicator: builtins.str,
# #         append_list_indicator: builtins.str
# #     ) -> builtins.bool:
    def _update_with_iterable(
        self, key, value, prepend_list_indicator, append_list_indicator
    ):
# #
        '''
            Performs a recursive update on current key with given value \
            interpreted as an iterable.

            Examples:

            >>> Dictionary({1: {}})._update_with_iterable(1, {}, '', '')
            True
        '''
        if builtins.isinstance(value, (builtins.dict, self.__class__)):
            nested_prepend_value = value.get(prepend_list_indicator)
            nested_append_value = value.get(append_list_indicator)
            if builtins.isinstance(
                nested_append_value, builtins.list
            ) or builtins.isinstance(
                nested_prepend_value, builtins.list
            ):
                if self._update_dictionary_with_list(
                    key, nested_prepend_value, nested_append_value,
                    prepend_list_indicator, append_list_indicator
                ):
                    return True
            elif builtins.isinstance(self.content[key], builtins.dict):
                '''
                    NOTE: We can't use self class by introspection here \
                    because these class has may be derived to some concrete \
                    iterable.
                '''
                self.content[key] = Dictionary(self.content[key]).update(
                    other=value
                ).content
                return True
        elif builtins.isinstance(value, builtins.list):
            if self._update_list_with_dictionary(
                key, value, prepend_list_indicator,
                append_list_indicator
            ):
                return True
        return False

    @JointPoint
# # python3.5
# #     def _update_dictionary_with_list(
# #         self: Self, key: (builtins.object, builtins.type),
# #         nested_preprend_value: (builtins.object, builtins.type),
# #         nested_append_value: (builtins.object, builtins.type),
# #         prepend_list_indicator: builtins.str,
# #         append_list_indicator: builtins.str
# #     ) -> builtins.bool:
    def _update_dictionary_with_list(
        self, key, nested_prepend_value, nested_append_value,
        prepend_list_indicator, append_list_indicator
    ):
# #
        '''
            Performs a recursive update on given key with given value (coming \
            from a list) in current dictionary. If "True" is returned \
            current value should be skipped.
        '''
        if builtins.isinstance(self.content[key], builtins.list):
            if nested_append_value:
                self.content[key] += nested_append_value
            else:
                self.content[key] = nested_prepend_value + self.content[key]
            return True
        elif builtins.isinstance(self.content[key], (
            builtins.dict, self.__class__
        )):
            if nested_append_value:
                self.content[key] = (self.content[key].get(
                    append_list_indicator
                ) or self.content[key].get(prepend_list_indicator)
                ) + nested_append_value
            else:
                self.content[key] = nested_prepend_value + (
                    self.content[key].get(append_list_indicator) or
                    self.content[key].get(prepend_list_indicator))
            return True
        return False

    @JointPoint
# # python3.5
# #     def _update_list_with_dictionary(
# #         self: Self, key: (builtins.object, builtins.type),
# #         value: (builtins.object, builtins.type),
# #         prepend_list_indicator: builtins.str,
# #         append_list_indicator: builtins.str
# #     ) -> builtins.bool:
    def _update_list_with_dictionary(
        self, key, value, prepend_list_indicator, append_list_indicator
    ):
# #
        '''
            Performs a recursive update on given key with given value (coming \
            from a dictionary) in current dictionary (where a list should \
            be). If "True" is returned current value should be skipped.

            Examples:

            >>> Dictionary({1: 2})._update_list_with_dictionary(1, 2, '', '')
            False

            >>> Dictionary({1: {'a': []}})._update_list_with_dictionary(
            ...     1, [], 'a', '')
            True
        '''
        if builtins.isinstance(self.content[key], builtins.dict):
            nested_source_prepend_value = self.content[key].get(
                prepend_list_indicator)
            nested_source_append_value = self.content[key].get(
                append_list_indicator)
            if builtins.isinstance(nested_source_append_value, builtins.list):
                self.content[key] = value + nested_source_append_value
                return True
            elif builtins.isinstance(
                nested_source_prepend_value, builtins.list
            ):
                self.content[key] = nested_source_prepend_value + value
                return True
        return False

    # # endregion

    # endregion


class Module(Object):

    '''This class adds some features for dealing with modules.'''

    # region properties

# # python3.5
# #     HIDDEN_BUILTIN_CALLABLES = ()
    HIDDEN_BUILTIN_CALLABLES = (
        'GFileDescriptorBased', 'GInitiallyUnowned',
        'GPollableInputStream', 'GPollableOutputStream')
# #
    '''Stores all magically defined globals.'''
    PREFERRED_ENTRY_POINT_FUNCTION_NAMES = (
        'main', 'init', 'initialize', 'run', 'start')
    '''
        Stores a priority order of preferred callable name as starting point \
        in a initialized module.
    '''

    # endregion

    # region static methods

    # # region public

    # # # region special

    @JointPoint(builtins.classmethod)
# # python3.5     def __repr__(cls: SelfClass) -> builtins.str:
    def __repr__(cls):
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> repr(Module()) # doctest: +ELLIPSIS
            'Object of "Module" with hidden builtin callables "..." saved.'
        '''
        return 'Object of "{class_name}" with hidden builtin callables '\
               '"{hidden_builtin_callables}" saved.'.format(
                   class_name=cls.__name__,
                   hidden_builtin_callables='", "'.join(
                       cls.HIDDEN_BUILTIN_CALLABLES))

    # # # endregion

    # # # region getter

    # NOTE: This method couldn't have a joint point for avoiding to have cyclic
    # dependencies.
    @builtins.classmethod
    @Class.pseudo_property
# # python3.5
# #     def get_context_path(
# #         cls: SelfClass, path=None, frame=inspect.currentframe(),
# #     ) -> builtins.str:
    def get_context_path(cls, path=None, frame=inspect.currentframe()):
# #
        '''
            Determines the package and module level context path to a given \
            context or file.

            **path**  - relative or absolute context or file path to normalize

            **frame** - stack frame to analyse again context

            Returns the normalized context path.

            Examples:

            >>> Module.get_context_path(
            ...     frame=inspect.currentframe()
            ... ) # doctest: +ELLIPSIS
            '...boostnode.extension...doctest...Module'

            >>> Module.get_context_path(path='./native') # doctest: +ELLIPSIS
            '...boostnode.extension.native'

            >>> Module.get_context_path(path='.') # doctest: +ELLIPSIS
            '...boostnode.extension'
        '''
        if path is None:
            path = frame.f_code.co_filename
        path = os.path.abspath(os.path.normpath(path))
        context_path = os.path.basename(path)
        if '.' in context_path:
            context_path = context_path[:context_path.rfind('.')]
        while cls.is_package(path=path[:path.rfind(os.sep)]):
            path = path[:path.rfind(os.sep)]
            context_path = '%s.%s' % (os.path.basename(path), context_path)
        return context_path

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5
# #     def get_name(
# #         cls: SelfClass, frame=None, module=None, extension=False,
# #         path=False
# #     ) -> builtins.str:
    def get_name(
        cls, frame=None, module=None, extension=False, path=False
    ):
# #
        '''
            Returns name of the given context "frame". If no frame is defined \
            this module's context will be selected. If "base" is set "True" \
            the modules name is given back without any file extension.

            **frame**     - Frame of module to determine

            **module**    - module to determine the name of

            **extension** - Indicates whether the modules file name extension \
                            should be returned as well

            **path**      - Indicates whether the modules file path should be \
                            returned as well

            Examples:

            >>> Module().name
            'native'

            >>> Module.get_name(extension=True)
            'native.py'

            >>> Module.get_name(path=True) # doctest: +ELLIPSIS
            '...boostnode...extension...native'

            >>> Module.get_name(path=True, extension=True) # doctest: +ELLIPSIS
            '...boostnode...extension...native.py'
        '''
        file = cls._get_module_file(frame, module)
        if path and extension:
            return file.path
        if extension:
            return file.name
        if path:
            return file.directory.path + file.basename
        return file.basename

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5
# #     def get_package_name(
# #         cls: SelfClass, frame=inspect.currentframe(), path=False
# #     ) -> builtins.str:
    def get_package_name(cls, frame=inspect.currentframe(), path=False):
# #
        '''
            Determines package context of given frame. If current context \
            isn't in any package context an empty string is given back.

            **frame** - frame of the package name to inspect

            **path**  - path to package

            Examples:

            >>> Module().package_name
            'extension'

            >>> Module.get_package_name(path=True) # doctest: +ELLIPSIS
            '...boostnode...extension...'

            >>> Module.get_package_name(
            ...     frame=inspect.currentframe(), path=True
            ... ) # doctest: +ELLIPSIS
            '...boostnode...extension...'
        '''
        from boostnode.extension.file import Handler as FileHandler

        file = FileHandler(
            location=frame.f_code.co_filename, respect_root_path=True)
        '''
            NOTE: If file doesn't exists we could be in a frozen executable \
            context.
        '''
        if cls.is_package(path=file.directory.path) or not file:
            if not file:
                file = FileHandler(
                    location=sys.argv[0], respect_root_path=True)
            if path:
                return file.directory.path
            return file.directory.name
        return ''

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5
# #     def get_file_path(
# #         cls: SelfClass, context_path: builtins.str, only_source_files=False
# #     ) -> (builtins.str, builtins.bool):
    def get_file_path(
        cls, context_path, only_source_files=False
    ):
# #
        '''
            Returns the path to given context path.

            **context_path**      - the context path to a module to determine

            **only_source_files** - ignores compiled python modules

            Examples:

            >>> Module.get_file_path('doctest') # doctest: +ELLIPSIS
            '...doctest.py...'

            >>> Module.get_file_path(
            ...     'doctest', only_source_files=True) # doctest: +ELLIPSIS
            '...doctest.py'

            >>> Module.get_file_path('module_that_does_not_exists')
            False

            >>> Module.get_file_path('')
            False
        '''
        from boostnode.extension.file import Handler as FileHandler

        if context_path:
            for search_path in sys.path:
                location = FileHandler(
                    location=search_path, respect_root_path=False)
                if location.is_directory():
                    location = cls._search_library_file(
                        location, context_path, only_source_files)
                    if location:
                        return location
        return False

    # # # endregion

    # # # region boolean

    @builtins.classmethod
# # python3.5
# #     def is_package(cls: SelfClass, path: builtins.str) -> builtins.bool:
    def is_package(cls, path):
# #
        '''
            Checks if given location is pointed to a python package.

            **path** - given location

            Examples:

            >>> Module.is_package(__file_path__)
            False
        '''
        if os.path.isdir(path):
            for file_name in os.listdir(path):
                basename = os.path.basename(file_name)
                if '.' in basename:
                    basename = basename[:basename.rfind('.')]
                if(os.path.isfile(path + os.sep + file_name) and
                   basename == '__init__' and
                   file_name[file_name.rfind('.') + 1:] in
                   ('py', 'pyc', 'pyw')):
                    return True
        return False

    # # # endregion

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def determine_caller(
# #         cls: SelfClass, callable_objects: NativeIterable, caller=None
# #     ) -> (
# #         builtins.bool, builtins.str, builtins.tuple, builtins.type(None)
# #     ):
    def determine_caller(cls, callable_objects, caller=None):
# #
        '''
            Searches for a useful caller object in given module objects via \
            "module_objects".

            **callable_objects** - available caller objects

            **caller**           - if provided this value will be returned

            Examples:

            >>> Module.determine_caller([]) is None
            True

            >>> Module.determine_caller((('A', object), ('B', object)), 'B')
            'B'

            >>> Module.determine_caller(
            ...     (('A', object), ('B', object)), None
            ... ) == ('A', object)
            True

            >>> Module.determine_caller(
            ...     (('A', object), ('Main', object)), None
            ... ) == ('Main', object)
            True

            >>> Module.determine_caller(['A'], False)
            False

            >>> Module.determine_caller(
            ...     [('AError', object), ('A', object)], None
            ... ) == ('A', object)
            True
        '''
        if not (caller or caller is False):
            for object_name, object in callable_objects:
                if(object_name.lower() in
                   cls.PREFERRED_ENTRY_POINT_FUNCTION_NAMES):
                    return object_name, object
            if builtins.len(builtins.tuple(callable_objects)):
                index = 0
                while(builtins.len(callable_objects) > index + 1 and
                      callable_objects[index][0].endswith('Error')):
                    index += 1
                return callable_objects[index]
        return caller

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5
# #     def get_defined_callables(
# #         cls: SelfClass, *arguments: (builtins.type, builtins.object),
# #         **keywords: (builtins.type, builtins.object)
# #     ) -> Generator:
    def get_defined_callables(cls, *arguments, **keywords):
# #
        '''
            Takes a module and gives a list of callables explicit defined in \
            this module. Arguments and keywords are forwarded to the \
            "get_defined_objects()" method.

            Examples:

            >>> tuple(Module.get_defined_callables(
            ...     sys.modules['__main__']
            ... )) # doctest: +ELLIPSIS
            (...'Module'...)

            >>> class A:
            ...     a = 'hans'
            ...     def b(): pass
            ...     def __A__(): pass
            >>> tuple(
            ...     Module.get_defined_callables(A, only_module_level=False)
            ... ) == (('b', A.b),)
            True

            >>> @JointPoint
            ... def b(): pass
            >>> temporary_object = object
            >>> a = A()
            >>> a.b = b
            >>> tuple(
            ...     Module.get_defined_callables(a, only_module_level=False)
            ... ) # doctest: +ELLIPSIS
            (('b', ...),)
        '''
        for object_name, object in cls.get_defined_objects(
            *arguments, **keywords
        ):
            if builtins.callable(object):
                yield object_name, object

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5
# #     def get_defined_objects(
# #         cls: SelfClass, object: (
# #             builtins.type, builtins.object, builtins.dict
# #         ), only_module_level=True
# #     ) -> Generator:
    def get_defined_objects(cls, object, only_module_level=True):
# #
        '''
            Takes a module and gives a list of objects explicit defined in \
            this module.

            **scope**             - scope to search for callables

            **only_module_level** - indicates whether imported modules should \
                                    be used.

            Examples:

            >>> tuple(Module.get_defined_objects(
            ...     sys.modules['__main__']
            ... )) # doctest: +ELLIPSIS
            (...'Module'...)

            >>> class A:
            ...     a = 'hans'
            ...     def b(): pass
            ...     def __A__(): pass
            >>> set(
            ...     Module.get_defined_objects(A, only_module_level=False)
            ... ) == {('b', A.b), ('a', 'hans')}
            True

            >>> def b(): pass
            >>> temporary_object = object
            >>> a = A()
            >>> a.b = b
            >>> set(
            ...     Module.get_defined_objects(a, only_module_level=False)
            ... ) == {('b', a.b), ('a', 'hans')}
            True
        '''
        scope, only_module_level = cls._determine_scope(
            object, only_module_level)
        for object_name, defined_object in scope.items():
            defined_object = cls._determine_object(defined_object)
            if(not (object_name.startswith('__') and
                    object_name.endswith('__')) and
               not (inspect.ismodule(defined_object) or
                    object_name in cls.HIDDEN_BUILTIN_CALLABLES or
                    inspect.isbuiltin(defined_object) or
                    object_name in sys.modules or
                    object_name in sys.builtin_module_names or
                    (only_module_level and inspect.getmodule(defined_object) !=
                        object))):
# # python3.5
# #                 yield object_name, defined_object
                if object_name != 'String':
                    yield object_name, defined_object
# #

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def execute_program_for_modules(
# #         cls: SelfClass, program_type: builtins.str, program: builtins.str,
# #         modules: NativeIterable, arguments=(), extension='py',
# #         delimiter=', ', log=True, **keywords: builtins.object
# #     ) -> builtins.tuple:
    def execute_program_for_modules(
        cls, program_type, program, modules, arguments=(),
        extension='py', delimiter=', ', log=True, **keywords
    ):
# #
        '''
            Runs a given program for every given module. Returns "False" if \
            no modules were found or given program isn't installed.

            **program_type** - program description to show in standard output

            **program**      - program name to run

            **modules**      - module file to hand over given program

            **arguments**    - command line arguments for given program

            **extension**    - extension to use for module files

            **delimiter**    - delimiter to show between resulting standard \
                               outputs

            **log**          - indicates whether logging should be enabled

            Additional keywords are forwarded to
            "boostnode.system.Platform.run()".

            Examples:

            >>> import boostnode.extension

            >>> Module.execute_program_for_modules(
            ...     'linter', 'pyflakes', boostnode.extension.__all__
            ... ) # doctest: +SKIP
            [(..., ...), ...]

            >>> Module.execute_program_for_modules(
            ...     'program', 'not_existing', boostnode.extension.__all__,
            ...     error=False, shell=True
            ... ) # doctest: +ELLIPSIS
            ('', ...)

            >>> Module.execute_program_for_modules(
            ...     'program', 'ls', boostnode.extension.__all__,
            ...     error=False
            ... ) # doctest: +ELLIPSIS
            (..., ...)
        '''
        from boostnode.extension.file import Handler as FileHandler
        from boostnode.extension.system import Platform

        results = []
        for module in modules:
            module_file = FileHandler(location=module + os.extsep + extension)
            results.append(Platform.run(
                command=program, command_arguments=builtins.list(
                    arguments
                ) + [module_file.path], log=log, **keywords))
        result = ['', '']
        first_standard_output = first_error_output = True
        for result_element in results:
            if result_element['standard_output'].strip():
                if not first_standard_output:
                    result[0] += delimiter
                result[0] += result_element['standard_output'].strip()
                first_standard_output = False
            if result_element['error_output'].strip():
                if not first_error_output:
                    result[1] += delimiter
                result[1] += result_element['error_output'].strip()
                first_error_output = False
        return builtins.tuple(result)

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def extend(
# #         cls: SelfClass, name=__name__, frame=None, module=None,
# #         post_extend_others=True
# #     ) -> builtins.dict:
    def extend(
        cls, name=__name__, frame=None, module=None,
        post_extend_others=True
    ):
# #
        '''
            Extends a given scope of an module for useful things like own \
            exception class, a logger instance, variable to indicate if \
            module is running in test mode and a variable that saves the \
            current module name.

            **name**               - name to use for module to extend

            **frame**              - frame to determine modules name and file \
                                     path

            **module**             - module to extend

            **post_extend_others** - indicates whether to check for resolved \
                                     dependencies of other modules and extend \
                                     them if possible.

            Returns a dictionary with new module's scope and module name.

            Examples:

            >>> Module.extend() # doctest: +ELLIPSIS
            {...native...}
            >>> __logger__ # doctest: +ELLIPSIS
            <logging.Logger object at 0x...>
            >>> __exception__ # doctest: +ELLIPSIS
            <class '...NativeError'>
            >>> __module_name__
            'native'
            >>> raise __exception__(
            ...     '%s', 'hans'
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            NativeError: hans

            >>> Module.extend(
            ...     __name__, module=sys.modules['doctest']
            ... ) # doctest: +ELLIPSIS
            {...'name': 'doctest'...}
        '''
        from boostnode.extension.output import Logger
        if module is None:
            module = sys.modules[name]
        else:
            name = module.__name__
        module.__logger__ = Logger.get(name)
        if(not builtins.hasattr(module, '__module_name__') or
           module.__module_name__ is None):
            module.__module_name__ = cls.get_name(frame, module)
# # python3.5
# #         module.__exception__ = builtins.type('%sError' % String(
# #             module.__module_name__
# #         ).camel_case_capitalize.content, (builtins.Exception,), {
# #             '__init__': lambda self, message,
# #             *arguments: builtins.Exception.__init__(
# #                 self, message % arguments
# #             ) if arguments else builtins.Exception.__init__(
# #                 self, message)})
        module.__exception__ = builtins.type(builtins.str('%sError' % String(
            module.__module_name__
        ).camel_case_capitalize.content), (builtins.Exception,), {
            '__init__': lambda self, message,
            *arguments: builtins.Exception.__init__(
                self, message % arguments
            ) if arguments else builtins.Exception.__init__(
                self, message)})
# #
        module.__test_mode__ = False
        module.__file_path__ = cls.get_name(
            frame, module, path=True, extension=True)
        '''Extend imported modules which couldn't be extended yet.'''
        if post_extend_others:
            for imported_name, imported_module in sys.modules.items():
                if('%s.' % imported_name.startswith(boostnode.__name__) and
                   builtins.hasattr(imported_module, '__module_name__') and
                   imported_module.__module_name__ is None):
                    '''Take this method via introspection.'''
                    builtins.getattr(cls, inspect.stack()[0][3])(
                        name=imported_name, module=imported_module,
                        post_extend_others=False)
        return {'name': name, 'scope': module}

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def default(
# #         cls: SelfClass, name: builtins.str, frame: Frame,
# #         default_caller=None, caller_arguments=(), caller_keywords={}
# #     ) -> SelfClass:
    def default(
        cls, name, frame, default_caller=None, caller_arguments=(),
        caller_keywords={}
    ):
# #
        '''
            Serves a common way to extend a given module. The given module's \
            scope will be extended and a common meta command line interface \
            is provided to test or run objects in given module.

            **name**             - module name to extend

            **frame**            - frame of module to extend

            **default_caller**   - a default caller to run after extending \
                                   module

            **caller_arguments** - arguments to forwarded to given default \
                                   caller

            **caller_keywords**  - keywords to forwarded to given default \
                                   caller

            Examples:

            >>> command_line_arguments_save = copy(sys.argv)
            >>> sys.argv += ['--module-object', Module.__name__]
            >>> if not 'native' in sys.modules:
            ...     sys.modules['native'] = sys.modules[__name__]
            >>> Module.default(
            ...     'native', inspect.currentframe()
            ... ) # doctest: +ELLIPSIS
            <class '...Module'>
            >>> sys.argv = command_line_arguments_save
        '''
        from boostnode.extension.system import CommandLine
        '''
            NOTE: We have to copy caller keywords to avoid changing the \
            mutable default value in this function signature.
        '''
        CommandLine.generic_module_interface(
            module=cls.extend(name, frame),
            default_caller=default_caller, caller_arguments=caller_arguments,
            caller_keywords=copy(caller_keywords))
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def default_package(
# #         cls: SelfClass, name: builtins.str, frame: Frame,
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> (builtins.tuple, builtins.bool):
    def default_package(
        cls, name, frame, command_line_arguments=(), *arguments, **keywords
    ):
# #
        '''
            Serves a common way to extend a given package. The given \
            package's scope will be extended and a common meta command line \
            interface is provided to test, lint or document modules.

            **name**                   - package name to extend

            **frame**                  - frame of package to extend

            **command_line_arguments** - additional command line arguments

            Additional arguments and keywords are forwarded to
            "...extension.system.CommandLine.generic_package_interface()".

            Examples:

            >>> Module.default_package(
            ...     'not_existing', inspect.currentframe())
            Traceback (most recent call last):
            ...
            KeyError: 'not_existing'

            >>> Module.default_package('doctest', inspect.currentframe())
            False
        '''
        from boostnode.extension.system import CommandLine
        cls.extend(name, frame)
        return CommandLine.generic_package_interface(
            name, frame, *arguments, **keywords)

    # # endregion

    # # region protected

    @JointPoint(builtins.classmethod)
# # python3.5     def _determine_scope(cls, object, only_module_level):
    def _determine_scope(cls, object, only_module_level):
        '''
            Determines needed scope to find module objects.

            Examples:

            >>> Module._determine_scope({}, True)
            ({}, False)
        '''
        if builtins.isinstance(object, builtins.dict):
            scope = object
            only_module_level = False
        else:
            scope = {}
            for object_name in builtins.dir(object):
# # python3.5                 pass
                object_name = convert_to_unicode(object_name)
                scope[object_name] = builtins.getattr(
                    object, object_name, None)
        return scope, only_module_level

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _determine_object(
# #         cls: SelfClass, object: (builtins.type, builtins.object)
# #     ) -> (builtins.object, builtins.type):
    def _determine_object(cls, object):
# #
        '''Determines a potentially wrapped object.'''
        if(builtins.isinstance(JointPoint, builtins.type) and
           builtins.isinstance(object, JointPoint)):
            return object.__func__
        return object

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _get_module_file(
# #         cls: SelfClass, frame: (builtins.type(None), Frame),
# #         module: (builtins.type(None), ModuleType)
# #     ) -> (Class, builtins.bool):
    def _get_module_file(cls, frame, module):
# #
        '''
            Determines the file of a given module or frame context.

            Examples:

            >>> Module._get_module_file(
            ...     inspect.currentframe(), None
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "..." and initially given path "...
        '''
        from boostnode.extension.file import Handler as FileHandler

        file = False
        if module:
            file = FileHandler(
                location=inspect.getsourcefile(module),
                respect_root_path=False)
        if not file:
            if frame is None:
                frame = inspect.currentframe()
            file = FileHandler(
                location=frame.f_code.co_filename, respect_root_path=False)
        if not file:
            file = FileHandler(
                location=sys.argv[0], respect_root_path=False)
        return file

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _search_library_file(
# #         cls: SelfClass, location: Class, context_path: builtins.str,
# #         only_source_files: builtins.bool
# #     ) -> (builtins.str, builtins.bool):
    def _search_library_file(
        cls, location, context_path, only_source_files=False
    ):
# #
        '''
            Searches for full path to a given context path in given locations.
        '''
        for sub_module in context_path.split('.'):
            found_last_sub_module = False
            for sub_location in location:
                if(sub_location.basename == sub_module and
                   not (only_source_files and
                        sub_location.extension in ('pyc', 'pyo', 'pyd'))):
                    found_last_sub_module = True
                    location = sub_location
                    break
            if not found_last_sub_module:
                return False
        return sub_location.path

    # # endregion

    # endregion


class Time(Object):

    '''This class adds some features for dealing with times.'''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __init__(self: Self, content=None) -> None:
    def __init__(self, content=None):
        '''
            Generates a new high level wrapper for times.

            Examples:

            >>> Time().content == NativeTime()
            True

            >>> Time(5)
            Object of "time" (datetime.time(0, 0, 5)).

            >>> Time()
            Object of "time" (datetime.time(0, 0)).

            >>> Time(NativeTime(0, 0)).content
            datetime.time(0, 0)

            >>> Time('08').content
            datetime.time(0, 0, 8)

            >>> Time('08:30').content
            datetime.time(8, 30)

            >>> Time('08:30+1:0').content
            datetime.time(9, 30)

            >>> Time('1.1.1970 10').content
            datetime.time(10, 0)

            >>> Time('abc')
            Traceback (most recent call last):
            ...
            NativeError: "abc" couldn't be interpreted as "Time".

            >>> Time({})
            Traceback (most recent call last):
            ...
            NativeError: "{}" couldn't be interpreted as "Time".
        '''
        self.content = None
        if content is None:
            self.content = NativeTime()
        elif builtins.isinstance(content, NativeTime):
            self.content = content
        else:
            content = String(content).get_number(default=content)
            if builtins.isinstance(content, (builtins.int, builtins.float)):
                hours = builtins.int(content / 60 ** 2)
                hours_in_seconds = hours * 60 ** 2
                minutes = builtins.int((content - hours_in_seconds) / 60)
                minutes_in_seconds = minutes * 60
                seconds = builtins.int(
                    content - hours_in_seconds - minutes_in_seconds)
                microseconds = builtins.int((
                    content - hours_in_seconds - minutes_in_seconds - seconds
                ) * 1000 ** 2)
                self.content = NativeTime(
                    hour=hours, minute=minutes, second=seconds,
                    microsecond=microseconds)
# # python3.5
# #             elif builtins.isinstance(content, builtins.str):
# #                 timezone_pattern = regularExpression.compile('(.+)\+(.+)')
# #                 timezone_match = timezone_pattern.fullmatch(content)
            elif builtins.isinstance(content, (
                builtins.unicode, builtins.str
            )):
                timezone_pattern = regularExpression.compile('(.+)\+(.+)$')
                timezone_match = timezone_pattern.match(content)
# #
                self._interpret_time(
                    content=timezone_pattern.sub(
                        '\\1', content
                    ) if timezone_match else content,
                    timezone_match=timezone_match)
            if self.content is None:
                self.content = self.derive_date_time(content)

    # # # endregion

    # # endregion

    # # region protected

    @JointPoint
# # python3.5
# #     def _interpret_time(
# #         self: Self, content: builtins.str, timezone_match: (
# #             builtins.type(None),
# #             builtins.type(regularExpression.compile('').match(''))
# #         )) -> Self:
    def _interpret_time(self, content, timezone_match):
# #
        '''Interprets given content string as time.'''
        for time_format in (
            '%X', '%H:%M:%S:%f', '%H:%M:%S', '%H:%M', '%H'
        ):
            try:
                content = NativeDateTime.strptime(content, time_format)
            except builtins.ValueError:
                pass
            else:
                # TODO this makes no sense when dealing with utc.
                if timezone_match and False:
                    content += TimeDelta(
                        timezone_match.group(2)
                    ).content
                self.content = content.time()
                return self
        return self

    # # endregion

    # endregion

    # region static methods

    # # region public

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def derive_date_time(
# #         cls: SelfClass, content, property_name='time', type_name=None
# #     ) -> (builtins.type(None), NativeTime, NativeDate):
    def derive_date_time(
        cls, content, property_name='time', type_name=None
    ):
# #
        '''
            If nothing could be determined try to interpret a date time \
            representation.
        '''
        try:
            content = DateTime(content).content
        except __exception__:
            if type_name is None:
                type_name = cls.__name__
# # python3.5
# #             raise __exception__(
# #                 '"%s" couldn\'t be interpreted as "%s".', content,
# #                 type_name
# #             ) from None
            raise __exception__(
                '"%s" couldn\'t be interpreted as "%s".', content,
                type_name)
# #
        else:
            return builtins.getattr(content, property_name)()

    # # endregion

    # endregion


class DateTime(Object):

    '''This class adds some features for dealing with date times.'''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __init__(self: Self, content=None) -> None:
    def __init__(self, content=None):
        '''
            Generates a new high level wrapper for date times.

            Examples:

            >>> DateTime().content.replace(
            ...     second=0, microsecond=0
            ... ) == NativeDateTime.now().replace(second=0, microsecond=0)
            True

            >>> DateTime(NativeDateTime(1970, 1, 1, 0, 0)).content
            datetime.datetime(1970, 1, 1, 0, 0)

            >>> DateTime(1.2).content == DateTime('1.2').content
            True

            >>> DateTime(1).content == DateTime('1').content
            True

            >>> DateTime('1.1.1970').content
            datetime.datetime(1970, 1, 1, 0, 0)

            >>> DateTime('1.1.1970 10').content
            datetime.datetime(1970, 1, 1, 10, 0)

            >>> DateTime('1.1.1970 10:30').content
            datetime.datetime(1970, 1, 1, 10, 30)

            >>> DateTime('1.1.1970 10:30:30').content
            datetime.datetime(1970, 1, 1, 10, 30, 30)

            >>> DateTime(123456).content
            datetime.datetime(1970, 1, 2, 11, 17, 36)

            >>> DateTime('2014-11-26 08:30:00').content
            datetime.datetime(2014, 11, 26, 8, 30)

            >>> DateTime('2014-11-26T08:30:00').content
            datetime.datetime(2014, 11, 26, 8, 30)

            >>> DateTime('2014-11-26T08:30:00+01:00').content
            datetime.datetime(2014, 11, 26, 9, 30)

            >>> DateTime('2014-11-10T08:30:00+01:00').content
            datetime.datetime(2014, 11, 10, 9, 30)

            >>> DateTime('1.1.1970 08:30:00').content
            datetime.datetime(1970, 1, 1, 8, 30)

            >>> DateTime(NativeDateTime(1970, 1, 1, 8, 30)).content
            datetime.datetime(1970, 1, 1, 8, 30)

            >>> DateTime('abc').content
            Traceback (most recent call last):
            ...
            NativeError: "abc" couldn't be interpreted as "DateTime".

            >>> DateTime('1+1+1970 08+30+00').content # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            NativeError: "1+1+1970 08+30+00" couldn't be interpreted as "...".
        '''
        self.content = None
        if content is None:
            self.content = NativeDateTime.now()
        elif builtins.isinstance(content, NativeDateTime):
            self.content = content
        elif builtins.isinstance(content, (builtins.int, builtins.float)):
            self.content = NativeDateTime.fromtimestamp(content)
        else:
            converted_value = String(content).number
            if builtins.isinstance(converted_value, (
                builtins.int, builtins.float
            )):
                self.content = NativeDateTime.fromtimestamp(converted_value)
                '''
                    We make a simple precheck to determine if it could be a \
                    date like representation. Idea: There should be at least \
                    some numbers and separators.
                '''
# # python3.5
# #             elif builtins.isinstance(
# #                 content, builtins.str
# #             ) and builtins.len(regularExpression.compile(
# #                 '[^a-zA-Z]'
# #             ).sub('', content)) < 3 and builtins.len(
# #                 regularExpression.compile('[0-9]{1,4}[^0-9]').findall(
# #                     content)
# #             ) > 1:
# #                 timezone_pattern = regularExpression.compile('(.+)\+(.+)')
# #                 timezone_match = timezone_pattern.fullmatch(content)
            elif builtins.isinstance(content, (
                builtins.unicode, builtins.str
            )) and builtins.len(regularExpression.compile(
                '[^a-zA-Z]'
            ).sub('', content)) < 3 and builtins.len(
                regularExpression.compile('[0-9]{1,4}[^0-9]').findall(
                    content)
            ) > 1:
                content = Date.slice_weekday(content)
                timezone_pattern = regularExpression.compile('(.+)\+(.+)$')
                timezone_match = timezone_pattern.match(content)
# #
                self._interpret_date_time(
                    content=timezone_pattern.sub(
                        '\\1', content
                    ) if timezone_match else content,
                    timezone_match=timezone_match)
            if self.content is None:
                raise __exception__(
                    '"%s" couldn\'t be interpreted as "%s".', content,
                    self.__class__.__name__)

    # # # endregion

    # # endregion

    # # region protected

    @JointPoint
# # python3.5
# #     def _interpret_date_time(
# #         self: Self, content: builtins.str, timezone_match: (
# #             builtins.type(None),
# #             builtins.type(regularExpression.compile('').match(''))
# #         )) -> Self:
    def _interpret_date_time(self, content, timezone_match):
# #
        '''Interprets given content string as date time.'''
        for time_delimiter in ('T', ' ', ''):
            for delimiter in ('/', '.', ':', '-'):
                for year_format in (
                    ('', '{delimiter}%y'), ('', '{delimiter}%Y'),
                    ('%y{delimiter}', ''), ('%Y{delimiter}', '')
                ):
                    for time_format in ('%X', '%H:%M:%S', '%H:%M', '%H', ''):
                        for ms_format in ('', ':%f'):
                            for date_time_format in (
                                '%c', '{first_year}%m{delimiter}%d{last_year}'
                                '{time_delimiter}{time}{microsecond}',
                                '{first_year}%d{delimiter}%m{last_year}'
                                '{time_delimiter}{time}{microsecond}',
                                '{first_year}%w{delimiter}%m{last_year}'
                                '{time_delimiter}{time}{microsecond}'
                            ):
                                try:
                                    self.content = NativeDateTime.strptime(
                                        content, date_time_format.format(
                                            delimiter=delimiter,
                                            time_delimiter=time_delimiter,
                                            first_year=year_format[
                                                0
                                            ].format(delimiter=delimiter),
                                            last_year=year_format[
                                                1
                                            ].format(delimiter=delimiter),
                                            microsecond=ms_format,
                                            time=time_format))
                                except builtins.ValueError:
                                    pass
                                else:
                                    # TODO this makes no sense when dealing with utc.
                                    if timezone_match and False:
                                        self.content += TimeDelta(
                                            timezone_match.group(2)
                                        ).content
                                    return self
        return self

    # # endregion

    # endregion


class Date(Object):

    '''This class adds some features for dealing with date times.'''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __init__(self: Self, content=None) -> None:
    def __init__(self, content=None, **keywords):
        '''
            Generates a new high level wrapper for dates.

            Examples:

            >>> Date().content == NativeDate.today()
            True

            >>> Date(NativeDate(1970, 1, 1)).content
            datetime.date(1970, 1, 1)

            >>> Date(12345) == Date('12345')
            True

            >>> Date('1.1.1970').content
            datetime.date(1970, 1, 1)

            >>> Date('Mo. 1.1.1970').content
            datetime.date(1970, 1, 1)

            >>> Date('Mo. 1/1/1970').content
            datetime.date(1970, 1, 1)

            >>> Date('1.1.1970 10:30:30').content
            datetime.date(1970, 1, 1)

            >>> Date('abc').content
            Traceback (most recent call last):
            ...
            NativeError: "abc" couldn't be interpreted as "Date".

            >>> Date({}).content
            Traceback (most recent call last):
            ...
            NativeError: "{}" couldn't be interpreted as "Date".
        '''
        self.content = None
        if content is None:
            self.content = NativeDate.today()
        elif builtins.isinstance(content, NativeDate):
            self.content = content
        elif builtins.isinstance(content, (builtins.int, builtins.float)):
            self.content = NativeDate.fromtimestamp(content)
        else:
            converted_value = String(content).number
            if builtins.isinstance(converted_value, (
                builtins.int, builtins.float
            )):
                self.content = NativeDate.fromtimestamp(converted_value)
                '''
                    We make a simple precheck to determine if it could be a \
                    date like representation. Idea: There should be at least \
                    some numbers, separators and not too much non-numeric \
                    symbols.
                '''
# # python3.5
# #             elif builtins.isinstance(content, builtins.str):
            elif builtins.isinstance(content, (
                builtins.unicode, builtins.str
            )):
# #
                self._interpret_date_string(content)
            if self.content is None:
                raise __exception__(
                    '"%s" couldn\'t be interpreted as "%s".', content,
                    self.__class__.__name__)

    # # # endregion

    # # endregion

    # # region protected

    @JointPoint
# # python3.5
# #     def _interpret_date_string(self: Self, content: builtins.str) -> Self:
    def _interpret_date_string(self, content):
# #
        content = self.slice_weekday(content)
# # python3.5
# #         if builtins.len(regularExpression.compile('[^a-zA-Z]').sub(
# #             '', content
# #         )) < 3 and builtins.len(regularExpression.compile(
# #             '[0-9]{1,4}[^0-9]'
# #         ).findall(content)) > 1:
        if builtins.len(regularExpression.compile('[^a-zA-Z]').sub(
            '', content
        )) < 3 and builtins.len(regularExpression.compile(
            '[0-9]{1,4}[^0-9]'
        ).findall(content)) > 1:
# #
            self._interpret_date(content)
        if self.content is None:
            self.content = Time.derive_date_time(
                content, property_name='date',
                type_name=self.__class__.__name__)
        return self

    @JointPoint
# # python3.5
# #     def _interpret_date(self: Self, content: builtins.str) -> Self:
    def _interpret_date(self, content):
# #
        '''Interprets given content string as date.'''
        for delimiter in ('/', '.', ':', '-'):
            for year_format in (
                ('', '{delimiter}%y'), ('', '{delimiter}%Y'),
                ('%y{delimiter}', ''), ('%Y{delimiter}', '')
            ):
                for date_format in (
                    '%x', '{first_year}%d{delimiter}%m{last_year}',
                    '{first_year}%m{delimiter}%d{last_year}',
                    '{first_year}%w{delimiter}%m{last_year}'
                ):
                    try:
# # python3.5
# #                         self.content = NativeDate.fromtimestamp(
# #                             NativeDateTime.strptime(
# #                                 content, date_format.format(
# #                                     delimiter=delimiter,
# #                                     first_year=year_format[0].format(
# #                                         delimiter=delimiter),
# #                                     last_year=year_format[1].format(
# #                                         delimiter=delimiter)
# #                                 )).timestamp())
                        self.content = NativeDate.fromtimestamp(
                            make_time(NativeDateTime.strptime(
                                content, date_format.format(
                                    delimiter=delimiter,
                                        first_year=year_format[0].format(
                                            delimiter=delimiter),
                                        last_year=year_format[1].format(
                                            delimiter=delimiter)
                                    )).timetuple()))
# #
                    except builtins.ValueError:
                        pass
                    else:
                        return self
        return self

    # # endregion

    # endregion

    # region static methods

    # # region public

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def slice_weekday(
# #         cls: SelfClass, content: builtins.str
# #     ) -> builtins.str:
    def slice_weekday(cls, content):
# #
        '''Slice weekday from given date representation.'''
# # python3.5
# #         weekday_pattern = regularExpression.compile('[A-Za-z]{2}\. (.+)')
# #         weekday_match = weekday_pattern.fullmatch(content)
        weekday_pattern = regularExpression.compile('[A-Za-z]{2}\. (.+)$')
        weekday_match = weekday_pattern.match(content)
# #
        if weekday_match:
            return weekday_pattern.sub('\\1', content)
        return content

    # # endregion

    # endregion


class TimeDelta(Object):

    '''This class adds some features for dealing with date times.'''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __init__(self: Self, content=None) -> None:
    def __init__(self, content=None):
        '''
            Generates a new high level wrapper for dates.

            Examples:

            >>> TimeDelta().content == NativeTimeDelta()
            True

            >>> TimeDelta(NativeTimeDelta(0, 12345)).content
            datetime.timedelta(0, 12345)

            >>> TimeDelta(12345).content
            datetime.timedelta(0, 12345)

            >>> TimeDelta('1').content
            datetime.timedelta(0, 1)

            >>> TimeDelta('.5').content == TimeDelta(.5).content
            True

            >>> TimeDelta('2:2').content
            datetime.timedelta(0, 7320)

            >>> TimeDelta('10:00') == TimeDelta(10 * 60 ** 2)
            True

            >>> TimeDelta('abc')
            Traceback (most recent call last):
            ...
            NativeError: "abc" couldn't be interpreted as "TimeDelta".
        '''
        if content is None:
            self.content = NativeTimeDelta()
        elif builtins.isinstance(content, NativeTimeDelta):
            self.content = content
        elif builtins.isinstance(content, (builtins.int, builtins.float)):
            self.content = NativeTimeDelta(seconds=content)
        else:
            converted_value = String(content).number
            if builtins.isinstance(converted_value, (
                builtins.int, builtins.float
            )):
                self.content = NativeTimeDelta(seconds=converted_value)
            else:
                try:
                    content = Time(content).content
                except __exception__:
# # python3.5
# #                     raise __exception__(
# #                         '"%s" couldn\'t be interpreted as "%s".', content,
# #                         self.__class__.__name__
# #                     ) from None
                    raise __exception__(
                        '"%s" couldn\'t be interpreted as "%s".', content,
                        self.__class__.__name__)
# #
                else:
                    self.content = NativeTimeDelta(
                        hours=content.hour, minutes=content.minute,
                        seconds=content.second,
                        microseconds=content.microsecond)

    # # # endregion

    # # endregion

    # endregion


class PhoneNumber(Object):

    '''This class adds some features for dealing with phone numbers.'''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __init__(self: Self, content=None) -> None:
    def __init__(self, content):
        '''
            Generates a new high level wrapper phone numbers.

            Examples:

            >>> PhoneNumber('+49 (0) 176-12 34-56').content
            '0049-176-1234-56'

            >>> PhoneNumber('+49(0)176 12-34 56').content
            '0049-176-123456'

            >>> PhoneNumber('+49 176 12 34 56').content
            '0049-176-123456'

            >>> PhoneNumber('+49-176-12 34 56').content
            '0049-176-123456'

            >>> PhoneNumber('0172/12555433').content
            '0172-12555433'

            >>> PhoneNumber('0176 12 34 56').content
            '0176-123456'

            >>> PhoneNumber('01761 234 56').content
            '01761-23456'

            >>> PhoneNumber(12345).content
            '12345'

            >>> PhoneNumber('').content
            Traceback (most recent call last):
            ...
            NativeError: "" couldn't be interpreted as "PhoneNumber".

            >>> PhoneNumber('+49 (178) 12 34 56').content
            '0049-178-123456'

            >>> PhoneNumber('+49(178)123456').content
            '0049-178-123456'

            >>> PhoneNumber('+49(178)12345-6').content
            '0049-178-12345-6'

            >>> PhoneNumber('+49 (178) 123 45-6').content
            '0049-178-12345-6'

            >>> PhoneNumber('').content
            Traceback (most recent call last):
            ...
            NativeError: "" couldn't be interpreted as "PhoneNumber".

            >>> PhoneNumber('06132-77-0').content
            '06132-77-0'

            >>> PhoneNumber('06132-77-0 ').content
            '06132-77-0'

            >>> PhoneNumber('06132-77-0a').content
            '06132-770'

            >>> PhoneNumber('06132-77-0a ').content
            '06132-770'

            >>> PhoneNumber('  06132-77-0a ').content
            '06132-770'

            >>> PhoneNumber('  061 32-77-0a ').content
            '06132-770'

            >>> PhoneNumber('  061 32-77-0 ').content
            '06132-77-0'

            >>> PhoneNumber('  0061 32-77-0 ').content
            '0061-32-77-0'

            >>> PhoneNumber('  +61 32-77-0 ').content
            '0061-32-77-0'

            >>> PhoneNumber('05661-711677').content
            '05661-711677'

            >>> PhoneNumber('0174/5661677').content
            '0174-5661677'

            >>> PhoneNumber('+49 (0) 174 / 566 16 77').content
            '0049-174-5661677'

            >>> PhoneNumber('+49 (174) 566 16 77').content
            '0049-174-5661677'

            >>> PhoneNumber(' +49 (174) 566 16 77 ').content
            '0049-174-5661677'

            >>> PhoneNumber('02 91 / 14 55').content
            '0291-1455'

            >>> PhoneNumber('03677842375').content
            '03677842375'
        '''
# # python3.5
# #         if(builtins.isinstance(content, (builtins.str, builtins.int)) and
# #            regularExpression.compile('[0-9]+').search(builtins.str(
# #                content
# #           ))):
        if builtins.isinstance(content, (
            builtins.unicode, builtins.str, builtins.int
        )) and regularExpression.compile('[0-9]+').search(
            convert_to_unicode(content)
        ):
            content = convert_to_unicode(content)
# #
            '''Normalize country code prefix.'''
# # python3.5
# #             self.content = regularExpression.compile('^[^0-9]*\+(.+)$').sub(
# #                 '00\\1', builtins.str(content).strip())
            self.content = regularExpression.compile(
                '^[^0-9]*\+(.+)$'
            ).sub('00\\1', convert_to_unicode(content).strip())
# #
            separator_pattern = '(?:[ /\\-]+)'
            '''Remove unneeded area code zero in brackets.'''
            self.content = regularExpression.compile(
                '^(.+?){separator}?\(0\){separator}?(.+)$'.format(
                    separator=separator_pattern)
            ).sub('\\1-\\2', self.content)
            '''Remove unneeded area code brackets.'''
            self.content = regularExpression.compile(
                '^(.+?){separator}?\((.+)\){separator}?(.+)$'.format(
                    separator=separator_pattern)
            ).sub('\\1-\\2-\\3', self.content)
            '''Remove separators which doesn't mark semantics.'''
            compiled_pattern = regularExpression.compile(
                '^(?P<country_code>00[0-9]+){separator}(?P<area_code>[0-9]+)'
                '{separator}(?P<number>.+)$'.format(
                    separator=separator_pattern))
            if compiled_pattern.match(self.content):
                '''Country code and area code matched.'''
                self.content = compiled_pattern.sub(
                    lambda match: '%s-%s-%s' % (
                        match.group('country_code'), match.group('area_code'),
                        self._preserve_only_last_separator(match.group(
                            'number'))
                    ), self.content)
            else:
                '''One prefix code matched.'''
                compiled_pattern = regularExpression.compile(
                    '^(?P<prefix_code>[0-9 ]+)[/-](?P<number>.+)$')
                if compiled_pattern.match(self.content):
                    '''Prefer "/" or "-" over " " as area code separator.'''
                    self.content = compiled_pattern.sub(
                        lambda match: '%s-%s' % (
                            match.group('prefix_code').replace(' ', ''),
                            self._preserve_only_last_separator(match.group(
                                'number'))
                    ), self.content)
                else:
                    self.content = regularExpression.compile(
                        '^(?P<prefix_code>[0-9]+)%s(?P<number>.+)$' %
                        separator_pattern
                    ).sub(lambda match: '%s-%s' % (
                        match.group('prefix_code'),
                        self._preserve_only_last_separator(match.group('number'))
                    ), self.content)
            self.content = regularExpression.compile('[^0-9-]+').sub(
                '', self.content)
        else:
            raise __exception__(
                '"%s" couldn\'t be interpreted as "%s".', content,
                self.__class__.__name__)

    # # # endregion

    # # endregion

    # endregion

    # region static methods

    # # region protected

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _preserve_only_last_separator(cls: SelfClass, number: builtins.str):
    def _preserve_only_last_separator(cls, number):
# #
        '''
            Slices all none numbers but preserves last separator.

            Examples:

            >>> PhoneNumber._preserve_only_last_separator('12-34-56')
            '1234-56'

            >>> PhoneNumber._preserve_only_last_separator('12 34 56')
            '123456'

            >>> PhoneNumber._preserve_only_last_separator('123456')
            '123456'
        '''
        compiled_pattern = regularExpression.compile(
            '^(?P<base_number>.*[0-9].*)-'
            '(?P<direct_dialing_number_suffix>[0-9]+)$')
        if compiled_pattern.match(number):
            return compiled_pattern.sub(lambda match: '%s-%s' % (
                regularExpression.compile('[^0-9]+').sub('', match.group(
                    'base_number'
                )), match.group('direct_dialing_number_suffix')), number)
        return regularExpression.compile('[^0-9]+').sub('', number)

    # # endregion

    # endregion


class ZipCode(Object):

    '''This class adds some features for dealing with zip codes.'''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __init__(self: Self, content=None) -> None:
    def __init__(self, content):
        '''
            Generates a new high level wrapper zip codes.

            Examples:

            >>> ZipCode('12345').content
            '12345'

            >>> ZipCode(12345).content
            '12345'

            >>> ZipCode('abc')
            Traceback (most recent call last):
            ...
            NativeError: "abc" couldn't be interpreted as "ZipCode".
        '''
# # python3.5
# #         if builtins.isinstance(content, (
# #             builtins.str, builtins.int
# #         )) and regularExpression.compile('[0-9]+').search(builtins.str(
# #             content
# #         )):
# #             self.content = regularExpression.compile('[^0-9]+').sub(
# #                 '', builtins.str(content))
        if builtins.isinstance(content, (
            builtins.unicode, builtins.str, builtins.int
        )) and regularExpression.compile('[0-9]+').search(
            convert_to_unicode(content)
        ):
            self.content = regularExpression.compile('[^0-9]+').sub(
                '', convert_to_unicode(content))
# #
        else:
            raise __exception__(
                '"%s" couldn\'t be interpreted as "%s".', content,
                self.__class__.__name__)

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
    Module.default(
        name=__name__, frame=inspect.currentframe(), default_caller=False)

# endregion

# region vim modline
# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:
# endregion
