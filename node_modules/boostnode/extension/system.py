#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''
    This module provides classes for handling issues with the operating \
    system or command line.
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

import argparse
import atexit
# # python3.5
# # import builtins
# # from collections import Iterable
import __builtin__ as builtins
# #
from copy import copy
import doctest
try:
    import fcntl
except builtins.ImportError:
    fcntl = None
import importlib
import inspect
import logging
import multiprocessing
import os
import re as regularExpression
import signal
import socket
import struct
import subprocess
import sys
from tempfile import mkdtemp as make_temporary_directory
import time
import traceback
# # python3.5
# # from types import FunctionType as Function
# # from types import MethodType as Method
# # from types import FrameType as Frame
pass
# #

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

# # python3.5
# # from boostnode import ENCODING
from boostnode import ENCODING, convert_to_string, convert_to_unicode
# #
from boostnode.extension.file import Handler as FileHandler
from boostnode.extension.native import Dictionary, Module, Object
from boostnode.extension.native import String as String
from boostnode.extension.output import Buffer, Logger, Print
# # python3.5
# # from boostnode.extension.type import Null, Self, SelfClass, SelfClassObject
from boostnode.extension.type import Null
# #
from boostnode.paradigm.aspectOrientation import FunctionDecorator, JointPoint

# # python3.5
# # pass
sys.argv = builtins.list(map(lambda argument: convert_to_unicode(argument),
     sys.argv))
# #

# endregion


# region abstract classes

# # python3.5 class Runnable:
class Runnable(builtins.object):

    '''
        Abstract class (interface) for implementing reusable classes which \
        acts directly as an command line interface to provide their features \
        platform independent.

        Arguments and keywords are forwarded to the protected "_initialize()" \
        method.
    '''

    # region properties

    __termination_lock = multiprocessing.Lock()
    '''
        This lock is acquired at startup und will be released as soon the \
        runnable receives a termination signal.
    '''

    # endregion

    # region static methods

    # # region public

    # # # region special

    @JointPoint(builtins.classmethod)
# # python3.5     def __repr__(cls: SelfClass) -> builtins.str:
    def __repr__(cls):
        '''
            Generic representation method.

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self): pass

            >>> repr(A()) # doctest: +ELLIPSIS
            'Object of "A" implementing a command line runnable interface t...'
        '''
        return (
            'Object of "%s" implementing a command line runnable interface to '
            'be usable outside this python environment.' % cls.__name__)

    # # # endregion

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def run(
# #         cls: SelfClass, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> SelfClassObject:
    def run(cls, *arguments, **keywords):
# #
        '''
            Method for an explicit run of a class implementing this abstract \
            class (interface).

            Arguments and keywords are forwarded to current instance
            initializer.

            Examples:

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'

            >>> class A(Runnable):
            ...     @JointPoint
            ...     def _run(self, a): Print(a)
            >>> a = A.run('A')
            >>> __test_buffer__.content
            'A\\n'

            >>> class B(Runnable):
            ...     def _run(self, a): Print(a)
            >>> b = B.run('B')
            >>> __test_buffer__.content
            'A\\nB\\n'
        '''
        arguments += Null,
        return cls(*arguments, **keywords)

    # # endregion

        # region protected

        # # region has to be implemented

    @JointPoint(builtins.classmethod)
# # python3.5     def _run(cls: SelfClass) -> None:
    def _run(cls):
        '''
            Abstract method to force runnable classes to implement their \
            entry point if running through command line interface.

            Examples:

            >>> class A(Runnable): pass
            >>> A.run() # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            NotImplementedError: Method "_run" wasn't implemented by "A" a...
        '''
        raise Object.determine_abstract_method_exception(
            abstract_class_name=Runnable.__name__, class_name=cls.__name__)

    @JointPoint(builtins.classmethod)
# # python3.5     def _initialize(cls: SelfClass) -> None:
    def _initialize(cls):
        '''
            Abstract methods to force runnable classes to implement their \
            entry point if running through this python environment.

            Examples:

            >>> class A(Runnable): pass
            >>> A() # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            NotImplementedError: Method "_initialize" wasn't implemented by ...
        '''
        raise Object.determine_abstract_method_exception(
            abstract_class_name=Runnable.__name__, class_name=cls.__name__)

        # # endregion

# # python3.5
# #     pass
    @JointPoint(builtins.classmethod)
    def _get_potential_wrapped_method(cls, method, all=False):
        '''
            Unpacks a wrapped method if necessary.

            Examples:

            >>> sys.flags.optimize == 1 or (Runnable._run.__wrapped__ ==
            ...     Runnable._get_potential_wrapped_method(Runnable._run))
            True
        '''
        methods = []
        while builtins.hasattr(method, '__wrapped__'):
            methods.append(method)
            method = method.__wrapped__
        methods.append(method)
        return methods if all else method
# #

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _command_line_arguments_to_dictionary(
# #         cls: SelfClass, namespace: argparse.Namespace
# #     ) -> builtins.dict:
    def _command_line_arguments_to_dictionary(self, namespace):
# #
        '''
            This method converts command line arguments generated by python's \
            native "argparse" to "builtins.dict".

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self): pass
            >>> class Namespace(argparse.Namespace):
            ...     a = 5
            ...     b = ['hans']
            ...     _c = 'hans'
            >>> A()._command_line_arguments_to_dictionary(
            ...     Namespace()
            ... ) # doctest: +ELLIPSIS
            {...'b': ('hans',)...}
        '''
        result = {}
        for name in builtins.dir(namespace):
            if name not in builtins.dir(argparse.Namespace):
                value = builtins.getattr(namespace, name)
                if builtins.isinstance(value, builtins.list):
                    value = builtins.tuple(value)
                result[name] = value
        return result

        # endregion

    # endregion

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __init__(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> None:
    def __init__(self, *arguments, **keywords):
# #
        '''A generic initializer for Runnable class implementations.'''

        # # # region properties

        '''
            Saves a cli-command for shutting down the runnable implementation.
        '''
        self.stop_order = 'stop'
        '''Saves a cli-command for restarting the runnable implementation.'''
        self.restart_order = 'restart'
        '''
            Currently given inputs via command line during "wait_for_order()" \
            is running.
        '''
        self._given_order = ''
        '''
            This properties saves the initial given arguments to handle a \
            reinitialisation by given restart order.
        '''
        self._initial_arguments = ()
        self._initial_keywords = {}
        '''
            This property saves a reference to the concrete runnable \
            implementation.
        '''
        self._childrens_module = inspect.getmodule(self.__class__)
        '''
            Saves given terminations signals to boost termination if signals }
            comes second time.
        '''
        self._given_termination_signals = builtins.set()
        '''This lock prevents form triggering the stop method twice.'''
        self.__stop_lock = multiprocessing.Lock()

        # # # endregion

        run = False
        if builtins.len(arguments) and arguments[-1] is Null:
            arguments = arguments[:-1]
            run = True
        if((self._called_through_generic_interface(
            this_initializer_context=inspect.stack()[0]
        ) and self._childrens_module.__name__ == '__main__' and
        not self._in_test_mode()) or run):
            self._initial_arguments = arguments
            self._initial_keywords = keywords
            self._handle_module_running(arguments, keywords)
        else:
            self._initialize(*arguments, **keywords)

    # # # endregion

    @JointPoint
# # python3.5     def wait_for_order(self: Self) -> Self:
    def wait_for_order(self):
        '''
            Handler for waiting till a server stop order comes through the \
            command line interface.
        '''
        self._given_order = ''
        try:
            while self._given_order not in (
                self.stop_order, self.restart_order
            ):
                given_input_explanation = ''
                if self._given_order:
                    given_input_explanation = ' (not "%s")' % self._given_order
# # python3.5
# #                 self._given_order = builtins.input(
# #                     'Write "%s" or "%s"%s for shutting down or restarting '
# #                     '"%s":\n' %
# #                     (self.stop_order, self.restart_order,
# #                      given_input_explanation, self.__class__.__name__))
                self._given_order = builtins.raw_input(
                    'Write "%s" or "%s"%s for shutting down or restarting '
                    '"%s":\n' %
                    (self.stop_order, self.restart_order,
                     given_input_explanation, self.__class__.__name__))
# #
        except(builtins.IOError, builtins.EOFError):
            __logger__.info(
                'We have lost standard input. Receiving a stop order via '
                'standard input is impossible from now on. Use a termination '
                'signal instead.')
            try:
                self.__class__.__termination_lock.acquire()
            except builtins.OSError:
                pass
        except(builtins.KeyboardInterrupt):
            __logger__.debug('Standard input stream was interrupted.')
        return self

    @JointPoint
# # python3.5
# #     def stop(
# #         self: Self, *arguments, reason='', given_signal_number=None,
# #         force_stopping=False, **keywords
# #     ) -> Self:
    def stop(self, *arguments, **keywords):
# #
        '''
            This method should usually be overwritten to handle cleanup jobs.

            **reason**              - Reason why we should stop

            **given_signal_number** - Termination signal number

            **force_stopping**      - Indicates whether we should enforce \
                                      termination process

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self): pass

            >>> A().stop() # doctest: +ELLIPSIS
            Object of "A" implementing a command line runnable interface to...

            >>> A().stop(reason='testing') # doctest: +ELLIPSIS
            Object of "A" implementing a command line runnable interface to...

            >>> A().stop(signal_number=2) # doctest: +ELLIPSIS
            Object of "A" implementing a command line runnable interface to...
        '''
# # python3.5
# #         pass
        keywords_dictionary = Dictionary(keywords)
        reason, keywords = keywords_dictionary.pop_from_keywords(
            name='reason', default_value='')
        given_signal_number, keywords = \
        keywords_dictionary.pop_from_keywords(
            name='given_signal_number')
        force_stopping, keywords = keywords_dictionary.pop_from_keywords(
            name='force_stopping', default_value=False)
# #
        if not reason:
            reason = 'program trigger or normal termination'
            if given_signal_number is not None:
                reason = 'signal number %d' % given_signal_number
        __logger__.debug(
            'Closing "%s" caused by %s.', self.__class__.__name__, reason)
        if force_stopping:
            __logger__.warning(
                'Closing "%s" was enforced caused by polling stop signals',
                self.__class__.__name__)
        return self

    @JointPoint(atexit.register)
# # python3.5
# #     def trigger_stop(
# #         self=None, *arguments: builtins.object, exit=True,
# #         force_stopping=None, signal_name=None,
# #         **keywords: builtins.object
# #     ) -> Self:
    def trigger_stop(self=None, *arguments, **keywords):
# #
        '''
            Method for cleaning up running workers.

            Arguments and keywords are forwarded to the "stop()" method.

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self): pass
            >>> a = A()

            >>> a.trigger_stop() # doctest: +ELLIPSIS
            Object of "A" implementing a command line runnable interface to...

            >>> a.trigger_stop(
            ...     exit=False, force_stopping=True
            ... ) # doctest: +ELLIPSIS
            Object of "A" implementing a command line runnable interface to...

            >>> a._given_order = a.stop_order
            >>> a.trigger_stop(
            ...     exit=False, force_stopping=True
            ... ) # doctest: +ELLIPSIS
            Object of "A" implementing a command line runnable interface to...
        '''
# # python3.5
# #         pass
        keywords_dictionary = Dictionary(keywords)
        exit, keywords = keywords_dictionary.pop_from_keywords(
            name='exit', default_value=True)
        force_stopping, keywords = keywords_dictionary.pop_from_keywords(
            name='force_stopping')
        signal_name, keywords = keywords_dictionary.pop_from_keywords(
            name='signal_name', default_value=False)
# #
        if self is not None:
            force_stopping = self._handle_termination_enforcement(
                force_stopping, signal_name, arguments, keywords)
            if(force_stopping or not self._in_test_mode() and
               self.__stop_lock.acquire(False)):
                reason = ''
                if self._given_order and self._given_order in (
                    self.stop_order, self.restart_order
                ):
                    reason = 'given order "%s"' % self._given_order
                self.stop(
                    *arguments, reason=reason, force_stopping=force_stopping,
                    **keywords)
                self._handle_given_order(arguments, exit)
        return self

    # # endregion

    # # region protected

    # # # region boolean

    @JointPoint
# # python3.5
# #     def _called_through_generic_interface(
# #         self: Self, this_initializer_context: builtins.tuple
# #     ) -> builtins.bool:
    def _called_through_generic_interface(self, this_initializer_context):
# #
        '''
            Indicates if current context was called via generic module \
            command line interface.

            Examples:

            >>> class A(Runnable):
            ...     def __init__(self):
            ...         super(self.__class__, self).__init__()
            ...     def _initialize(self): pass
            >>> A() # doctest: +ELLIPSIS
            Object of "A" implementing a command line runnable interface to ...
        '''
        this_module = inspect.getmodule(this_initializer_context[0])
        joint_point_module = inspect.getmodule(JointPoint)
        this_initializer_skipped = False
        for context in inspect.stack():
            if this_initializer_skipped:
                '''
                    Check if this context was initially triggered through \
                    this module API. If so we assume that this generic API \
                    was used.
                '''
                context_module = inspect.getmodule(context[0])
                if context_module is this_module:
                    return True
                '''
                    Skip joint point trigger and super calls in overwritten \
                    initialisation methods to keep on searching otherwise \
                    there are function call within the stack which doesn't \
                    come directly through this generic API.
                '''
                if not (context[3] == this_initializer_context[3] or
                    context_module is joint_point_module
                ):
                    return False
            elif this_initializer_context[0] is context[0]:
                this_initializer_skipped = True
        return False

    @JointPoint
# # python3.5     def _in_test_mode(self: Self) -> builtins.bool:
    def _in_test_mode(self):
        '''
            Checks if this module is running in a testing context.

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self): pass
            >>> A()._in_test_mode()
            True
        '''
        return (
            ('__test_mode__' in builtins.globals() and __test_mode__) or
            ('__test_mode__' in builtins.dir(self._childrens_module) and
             self._childrens_module.__test_mode__))

    # # # endregion

    @JointPoint
# # python3.5
# #     def _handle_termination_enforcement(
# #         self: Self, force_stopping: (builtins.bool, builtins.type(None)),
# #         signal_name: (builtins.str, builtins.type(None)),
# #         arguments: builtins.tuple, keywords: builtins.dict
# #     ) -> builtins.bool:
    def _handle_termination_enforcement(
        self, force_stopping, signal_name, arguments, keywords
    ):
# #
        '''
            Determines if application termination should be enforced. Enforce \
            termination if we have given a stop signal a second time.

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self): pass
            >>> a = A()

            >>> a._handle_termination_enforcement(True, 'SIGINT', (), {})
            True

            >>> a._handle_termination_enforcement(None, 'SIGINT', (), {})
            True

            >>> a._handle_termination_enforcement(None, 'UNKNOWN', (), {})
            False

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> a._handle_termination_enforcement(None, 'SIGINT', (), {})
            False
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...Sending a second "SIGINT" signal ...ce to stop ungracefully...'

            >>> a._handle_termination_enforcement(None, 'SIGINT', (), {})
            True
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...Application will be enforced to stop now...'
        '''
        if signal_name in Platform.TERMINATION_SIGNALS:
            if(signal_name in self._given_termination_signals and
               force_stopping is None):
                force_stopping = True
                self._given_termination_signals.remove(signal_name)
                __logger__.warning('Application will be enforced to stop now.')
            else:
                __logger__.info(
                    'Sending a second "%s" signal will enforce to stop '
                    'ungracefully.', signal_name)
                self._given_termination_signals.add(signal_name)
        if force_stopping is None:
            force_stopping = False
        return force_stopping

    @JointPoint
# # python3.5
# #     def _handle_given_order(
# #         self: Self, arguments: builtins.tuple, exit: builtins.bool
# #     ) -> Self:
    def _handle_given_order(self, arguments, exit):
# #
        '''
            Handles given order via command line standard input.

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self): pass
            >>> a = A()

            >>> a._handle_given_order((), True)
            Traceback (most recent call last):
            ...
            SystemExit

            >>> a._given_order = a.restart_order
            >>> a._handle_given_order((), True) # doctest: +ELLIPSIS
            Traceback (most recent call last):
            ...
            NotImplementedError: Method "_run" wasn't implemented by "A" and...
        '''
        if self._given_order == self.restart_order:
            __logger__.debug(
                'Restart "%s" with arguments "%s" and keywords "%s".',
                self.__class__.__name__,
                '", "'.join(self._initial_arguments),
                builtins.str(self._initial_keywords))
            self.__class__.run(
                *self._initial_arguments, **self._initial_keywords)
        else:
            self._terminate(arguments, exit)
        return self

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _terminate(
# #         cls: SelfClass, arguments: builtins.tuple, exit: builtins.bool
# #     ) -> SelfClass:
    def _terminate(cls, arguments, exit):
# #
        '''
            Termines current runnable and all child threads.

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self): pass

            >>> __test_globals__['__test_mode__'] = False
            >>> A()._terminate((), True)
            Traceback (most recent call last):
            ...
            ValueError: semaphore or lock released too many times
            >>> __test_globals__['__test_mode__'] = True

            >>> A()._terminate((signal.SIGINT,), True)
            Traceback (most recent call last):
            ...
            SystemExit: 130

            >>> A()._terminate((), False) # doctest: +ELLIPSIS
            <class '...A'>
        '''
        if not __test_mode__:
            cls.__termination_lock.release()
        if builtins.len(arguments) and arguments[0] == signal.SIGINT:
            sys.exit(130)
        elif exit:
            '''
                NOTE: "sys.exit()" has to be called to terminate all child \
                threads.
            '''
            sys.exit()
        return cls

    @JointPoint
# # python3.5
# #     def _handle_module_running(
# #         self: Self, arguments: builtins.tuple, keywords: builtins.dict
# #     ) -> Self:
    def _handle_module_running(self, arguments, keywords):
# #
        '''
            Handle the running interface for current module.

            Examples:

            >>> class A(Runnable):
            ...     def _run(self): raise IOError('test')
            ...     def _initialize(self): pass
            >>> __test_globals__['__test_mode__'] = False

            >>> A()._handle_module_running((), {})
            Traceback (most recent call last):
            ...
            SystemExit: 1

            >>> class A(Runnable):
            ...     def _run(self): sys.exit(2)
            ...     def _initialize(self): pass
            >>> A()._handle_module_running((), {})
            Traceback (most recent call last):
            ...
            SystemExit: 2

            >>> __test_globals__['__test_mode__'] = True
        '''
        if not self._in_test_mode():
            self.__class__.__termination_lock.acquire()
            '''
                NOTE: We have to reassign signal handlers, because old \
                handlers are garbage collected after a soft restart.
            '''
            for signal_number in Platform.termination_signal_numbers:
                for termination_signal in Platform.TERMINATION_SIGNALS:
                    if signal_number == builtins.getattr(
                        signal, termination_signal
                    ):
                        signal.signal(
                            signal_number,
                            lambda *arguments, **keywords: self.trigger_stop(
                                *arguments, signal_name=termination_signal,
                                given_signal_number=signal_number, **keywords))
        try:
            self._run(*arguments, **keywords)
        except builtins.BaseException as exception:
            self._handle_module_exception(exception)
        finally:
            '''
                NOTE: We have to wait until exception stop all contexts to \
                make sure that the whole traceback could be printed before \
                termination.
            '''
            self.trigger_stop(exit=False)
        return self

    @JointPoint
# # python3.5
# #     def _handle_module_exception(
# #         self: Self, exception: builtins.BaseException
# #     ) -> None:
    def _handle_module_exception(self, exception):
# #
        '''
            Handles exceptions during module running.

            Examples:

            >>> class A(Runnable):
            ...     def _run(self): raise IOError('test')
            ...     def _initialize(self): pass
            >>> class E(Exception):
            ...     code = 130

            >>> A()._handle_module_exception(E())
            Traceback (most recent call last):
            ...
            SystemExit: 130
        '''
        if builtins.hasattr(exception, 'code') and exception.code in (0, 130):
            sys.exit(exception.code)
        elif(self._in_test_mode() or sys.flags.debug or
             self._childrens_module.__logger__.isEnabledFor(logging.DEBUG)
             ):
            raise
        else:
# # python3.5
# #             exception_traceback = traceback.extract_tb(
# #                 exception.__traceback__)
            exception_traceback = traceback.extract_tb(sys.exc_info()[2])
# #
            exception_traceback.reverse()
            for context in exception_traceback:
                if FileHandler(
                    context[0]
                )._path == self._childrens_module.__file_path__:
                    break
# # python3.5
# #             __logger__.critical(
# #                 'Line {line_number}: {exception_name}: '
# #                 '{exception_message}\n'
# #                 'Type "'
# #                 '{program_file_path} --help" for additional '
# #                 'informations.'.format(
# #                     line_number=context[1],
# #                     exception_name=exception.__class__.__name__,
# #                     exception_message=builtins.str(exception),
# #                     program_file_path=sys.argv[0]))
            __logger__.critical(
                'Line {line_number}: {exception_name}: '
                '{exception_message}\n'
                'Type "'
                '{program_file_path} --help" for additional '
                'informations.'.format(
                    line_number=context[1],
                    exception_name=exception.__class__.__name__,
                    exception_message=convert_to_unicode(exception),
                    program_file_path=sys.argv[0]))
# #
            if builtins.hasattr(exception, 'code'):
                sys.exit(exception.code)
            sys.exit(1)

    # # endregion

    # endregion

# endregion


# region classes

# # python3.5 class Platform:
class Platform(builtins.object):

    '''Handles issues dealing with the underlying operating system.'''

    # region properties

    TERMINATION_SIGNALS = 'SIGTERM', 'SIGINT', 'SIGHUP'
    '''
        Saves a list of process signal codes which should bring the \
        application down.
    '''
    UNIX_OPEN_APPLICATIONS = (
        'openPath', 'gnome-open', 'kde-open', 'gvfs-open', 'exo-open',
        'xdg-open', 'gedit', 'mousepad', 'gvim', 'vim', 'emacs', 'nano', 'vi',
        'less', 'cat')
    '''Saves a list of known unix commands to open a specified file.'''
    operating_system = 'unknown'
    '''Saves the current operating system type.'''
    terminate_thread = False
    '''
        Saves an indicating value whether a currently running thread should \
        be terminated on next possibility.
    '''
    pause_thread = False
    '''
        Saves an indicating value whether a currently running thread should \
        be paused on next possibility. By setting this value back to "True" \
        paused threads will continue their work.
    '''
    termination_signal_numbers = []
    '''Holds all process termination signal numbers.'''
    process_lock_directory = None
    '''Saves a location for storing files indicating process locks.'''

    # endregion

    # region static methods

    # # region public

    # # # region special

    @JointPoint(builtins.classmethod)
# # python3.5     def __init__(cls: SelfClass) -> None:
    def __init__(cls):
        '''
            Determines the operating system.

            Examples:

            >>> os = Platform().operating_system
            >>> os == Platform.operating_system
            True
            >>> os # doctest: +SKIP
            'posix'
        '''
        for termination_signal in cls.TERMINATION_SIGNALS:
            if(builtins.hasattr(signal, termination_signal) and
               builtins.getattr(signal, termination_signal) not in
               cls.termination_signal_numbers):
                cls.termination_signal_numbers.append(builtins.getattr(
                    signal, termination_signal))
        if 'nt' == os.name:
            cls.operating_system = 'windows'
        elif 'darvin' == sys.platform:
            cls.operating_system = 'macintosh'
        elif sys.platform.startswith('linux'):
            cls.operating_system = 'linux'
        elif 'posix' == os.name:
            cls.operating_system = 'posix'

    @JointPoint(builtins.classmethod)
# # python3.5     def __repr__(cls: SelfClass) -> builtins.str:
    def __repr__(cls):
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> repr(Platform()) # doctest: +ELLIPSIS
            'Object of "Platform" on operating system "...".'
        '''
        return 'Object of "{class_name}" on operating system '\
               '"{operating_system}".'.format(
                   class_name=cls.__name__,
                   operating_system=cls.operating_system)

    # # # endregion

    # # # region change computer status

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def check_computer_reachability(
# #         cls: SelfClass, host: builtins.str, timeout_in_seconds=3, port=22
# #     ) -> builtins.bool:
    def check_computer_reachability(
        cls, host, timeout_in_seconds=3, port=22
    ):
# #
        '''
            Checks if a remote computer is available by pinging it.

            **host**               - host to check

            **timeout_in_seconds** - timeout until an unreachable host will \
                                     be assumed

            **port**               - port to check

            Examples:

            >>> isinstance(
            ...     Platform.check_computer_reachability('localhost'), bool)
            True
        '''
        check_computer_reachability_socket = socket.socket(
            socket.AF_INET, socket.SOCK_STREAM)
        check_computer_reachability_socket.settimeout(timeout_in_seconds)
        try:
            check_computer_reachability_socket.connect((host, 22))
        except socket.error:
            return False
        finally:
            check_computer_reachability_socket.close()
        return True

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def make_computer_ready(
# #         cls: SelfClass, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.tuple:
    def make_computer_ready(cls, *arguments, **keywords):
# #
        '''
            Wakes a remote computer and ensure that it is ready by pinging \
            till it answers.

            Arguments and keywords are forwarded to "change_computer_status()"
            method.

            Examples:

            >>> Platform.make_computer_ready(
            ...     'localhost', 'ff:ff:ff:ff:ff:ff', '192.169.0.255',
            ...     number_of_tries=0)
            (False, False)

            >>> Platform.make_computer_ready(
            ...     'localhost', 'ff:ff:ff:ff:ff:ff', '192.169.0.255',
            ...     number_of_tries=1)
            (False, True)

            >>> Platform.make_computer_ready(
            ...     'localhost', 'ffffffffffff', '192.169.0.255',
            ...     number_of_tries=1)
            (False, True)
        '''
        return cls.change_computer_status(
            *arguments, handler=cls.wake_computer, **keywords)

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def change_computer_status(
# #         cls: SelfClass, host: builtins.str, mac_address: builtins.str,
# #         broadcast: builtins.str, handler: (Method, Function), down=False,
# #         number_of_tries=10
# #     ) -> builtins.tuple:
    def change_computer_status(
        cls, host, mac_address, broadcast, handler, down=False,
        number_of_tries=10
    ):
# #
        '''
            Shuts down or boot a computer and ensure that is is available \
            after boot or not available if it should be shut down.

            **host**            - host to change

            **mac_address**     - mac address of host to change

            **broadcast**       - broadcast address

            **handler**         - function to execute to change computer's \
                                  status

            **down**            - indicates whether we should check again \
                                  reachability or none reachability after \
                                  performing "handler()"

            **number_of_tries** - number of tries to run given "handler()"

            Returns a tuple: first value indicates whether it was successful \
            and second is "True" if computer status was needed to be changed \
            and "False" otherwise.
        '''
        __logger__.info('Try to reach "%s". Please wait.', host)
        counter = 1
        timeout_in_seconds = 0
        maximum_timeout_in_seconds = 60
        while counter <= number_of_tries and not (
            down or cls.check_computer_reachability(
                host, timeout_in_seconds
            )) or (down and cls.check_computer_reachability(
                host, timeout_in_seconds)):
            counter += 1
            handler(mac_address, broadcast)
            __logger__.info(
                '%d. try to reach "%s" with timeout of %d seconds.', counter,
                host, timeout_in_seconds)
            time.sleep(timeout_in_seconds)
            timeout_in_seconds = builtins.min(
                timeout_in_seconds + 1, maximum_timeout_in_seconds)
        return counter <= number_of_tries, counter > 1

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def wake_computer(
# #         cls: SelfClass, mac_address: builtins.str, broadcast: builtins.str
# #     ) -> builtins.bool:
    def wake_computer(cls, mac_address, broadcast):
# #
        '''
            Wakes up a remote computer using a magic package \
            (wake-on-lan-package).

            **mac_address** - physical address of computer to wake

            **broadcast**    - broadcast address

            Returns "True" if no socket error occurs and "False" otherwise.

            Examples:

            >>> isinstance(
            ...     Platform.wake_computer('ffffffffffff', '192.168.178.255'),
            ...     bool)
            True

            >>> isinstance(
            ...     Platform.wake_computer(
            ...         'ff:ff:ff:ff:ff:ff', '192.168.178.255'),
            ...     bool)
            True

            >>> Platform.wake_computer('ffffffffffff', 'not_existing')
            False

            >>> isinstance(
            ...     Platform.wake_computer(
            ...         '0F-0F-DF-0F-BF-EF', '192.168.0.255'),
            ...     bool)
            True

            >>> Platform.wake_computer(
            ...     'fffff', '192.168.178.255'
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boosteNode.extension.system.SystemError: Incorrect MAC-address ...
        '''
        '''Check mac-address format and try to compensate if necessary.'''
        if builtins.len(mac_address) == 12 + 5:
            sep = mac_address[2]
            mac_address = mac_address.replace(sep, '')
        elif builtins.len(mac_address) != 12:
            raise __exception__('Incorrect MAC-address format given.')
        '''Pad the synchronization stream.'''
        data = b'FFFFFFFFFFFF' + (mac_address * 20).encode(ENCODING)
        send_data = b''
        '''Split up the hex values and pack.'''
        for counter in builtins.range(0, builtins.len(data), 2):
            send_data += struct.pack(
                'B', builtins.int(data[counter:counter + 2], 16))
        '''Broadcast it to the network.'''
        try:
            wake_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            wake_socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
            wake_socket.sendto(send_data, (broadcast, 7))
        except socket.error:
            return False
        finally:
            wake_socket.close()
        return True

    # # # endregion

    # # # region thread handling

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def check_thread(cls, waiting_delay_in_seconds=2) -> builtins.bool:
    def check_thread(cls, waiting_delay_in_seconds=2):
# #
        '''
            Checks whether the current thread should be paused or terminated.

            **waiting_delay_in_seconds** - time between checking if thread is \
                                           currently running

            If thread should be terminated "True" will be given back. In case \
            of pausing the current thread stay in the current function call \
            still a continue event is triggered and "False" will be given back.

            Examples:

            >>> Platform.check_thread()
            False

            >>> Platform.terminate_thread = True
            >>> Platform.check_thread()
            True

            >>> Platform.terminate_thread = False
            >>> Platform.check_thread()
            False

            >>> Platform.pause_thread = True
            >>> Platform.terminate_thread = True
            >>> Platform.check_thread()
            True

            >>> Platform.pause_thread = False
            >>> Platform.terminate_thread = False
        '''
        while cls.pause_thread or cls.terminate_thread:
            if cls.terminate_thread:
                return True
            time.sleep(waiting_delay_in_seconds)
        return False

    # # # endregion

    # # # region process handling

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def set_process_lock(cls: SelfClass, description='') -> builtins.bool:
    def set_process_lock(cls, description=''):
# #
        '''
            Sets a global lock. Creates a file with given name prefix of \
            "description".

            **description** - an identifying description

            Examples:

            >>> lock_file = FileHandler(
            ...     Platform.process_lock_directory.path + 'set_process_lock')
            >>> lock_file.is_file()
            False
            >>> Platform.set_process_lock('set_process')
            True
            >>> lock_file.is_file()
            True
            >>> Platform.clear_process_lock('set_process')
            True

            >>> Platform.set_process_lock()
            True
            >>> Platform.set_process_lock()
            False
            >>> bool(FileHandler(
            ...     Platform.process_lock_directory.path + '_lock'))
            True
            >>> Platform.clear_process_lock()
            True
        '''
        lock_file = FileHandler(
            location=cls._initialize_process_lock(
            ).process_lock_directory.path + description + '_lock')
        if lock_file:
            return False
        lock_file.content = ''
        return True

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def clear_process_lock(
# #         cls: SelfClass, description=''
# #     ) -> builtins.bool:
    def clear_process_lock(cls, description=''):
# #
        '''
            Removes a prior setted lock file.

            **description** - the process identification

            Examples:

            >>> file = FileHandler(
            ...     Platform.process_lock_directory.path +
            ...     'clear_process_lock')
            >>> file.content = ''
            >>> Platform.clear_process_lock('clear_process')
            True
            >>> file.is_file()
            False

            >>> Platform.set_process_lock('clear_process')
            True
            >>> Platform.clear_process_lock('clear_process')
            True
            >>> Platform.check_process_lock('clear_process')
            False
        '''
        return FileHandler(
            location=cls._initialize_process_lock(
            ).process_lock_directory.path + description + '_lock'
        ).remove_file()

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def check_process_lock(
# #         cls: SelfClass, description=''
# #     ) -> builtins.bool:
    def check_process_lock(cls, description=''):
# #
        '''
            Checks if a lock file with given description exists. NOTE: \
            Calling this function doesn't prevent you from race conditions.

            **description** - the process identification

            Examples:

            >>> Platform.set_process_lock('check_process')
            True
            >>> Platform.check_process_lock('check_process')
            True
            >>> Platform.clear_process_lock('check_process')
            True
        '''
        return FileHandler(
            location=cls._initialize_process_lock(
            ).process_lock_directory.path + description + '_lock'
        ).is_file()

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def run(
# #         cls: SelfClass, command: Iterable, command_arguments=None,
# #         error=True, shell=False, native_shell=False, log=False,
# #         no_blocking=False, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.dict:
    def run(
        cls, command, command_arguments=None, error=True, shell=False,
        native_shell=False, log=False, no_blocking=False, *arguments,
        **keywords
    ):
# #
        '''
            Runs a command natively on the current operating system using the \
            command line. Result will be given back as tuple. First element \
            is standard and second error output.

            **command**           - A command line interface command \
                                    optionally with arguments.

            **command_arguments** - A list of arguments passing through the \
                                    command line interface.

            **error**             - If "False" exceptions by running command \
                                    are kept back.

            **shell**             - Simulate a shell if "True".

            **native_shell**      - Disable output piping by python and run \
                                    command in systems native process.

            **log**               - If "True" standard output will be logged \
                                    with level "info" and error output with \
                                    level "warning".

            **no_blocking**       - If "True" resulting output won't be a \
                                    string. You will get an python "IOBuffer" \
                                    like object. NOTE: If buffer is empty and \
                                    you try to read from buffer an exception \
                                    will occur.

            All following arguments are given through python's native
            "subprocess.Popen()" class initialisation.

            Examples:

            >>> Platform.run(command='ls') # doctest: +SKIP
            {...'standard_output': ...}

            >>> Platform.run(
            ...     command=('ls', 'chmod +x test.py'), shell=True
            ... ) # doctest: +SKIP
            {...'standard_output': ...}

            >>> Platform.run(
            ...     command='not', command_arguments=('existing',),
            ...     error=False, shell=True
            ... ) # doctest: +ELLIPSIS
            {...'standard_output': ...}

            >>> Platform.run(
            ...     command='not', command_arguments=('existing',),
            ...     error=False, shell=True
            ... ) # doctest: +ELLIPSIS
            {...'standard_output': ...}

            >>> Platform.run(
            ...     command=('not_existing', 'also_not_existing'),
            ...     command_arguments=('existing',), error=False, log=True,
            ...     shell=True
            ... ) # doctest: +ELLIPSIS
            {...'standard_output': ...}

            >>> Platform.run(
            ...     command='not_existing', shell=True, error=False
            ... ) # doctest: +ELLIPSIS
            {...'standard_output': ...}

            >>> Platform.run(
            ...     command='not_existing', shell=True, error=False, log=True
            ... ) # doctest: +ELLIPSIS
            {...'standard_output': ...}

            >>> try:
            ...     Platform.run(
            ...         command='not', command_arguments=('existing',))
            ... except:
            ...     True
            True

            >>> Platform.run(
            ...     command='not', command_arguments=('existing',),
            ...     shell=True, error=False
            ... ) # doctest: +ELLIPSIS
            {...'return_code': ...}
        '''
        if command_arguments is None:
            command_arguments = []
# # python3.5
# #         if builtins.isinstance(command, builtins.str):
# #             result = cls._run_one_command(
# #                 command, command_arguments, error, shell, native_shell,
# #                 no_blocking, *arguments, **keywords)
        if builtins.isinstance(command, (builtins.unicode, builtins.str)):
            result = cls._run_one_command(
                convert_to_unicode(command), command_arguments, error,
                shell, native_shell, no_blocking, *arguments, **keywords)
# #
        else:
            result = cls._run_multiple_commands(
                commands=command, command_arguments=command_arguments,
                error=error, shell=shell, native_shell=native_shell,
                *arguments, **keywords)
        if log and not (native_shell or no_blocking):
            cls._log_command_result(result)
        return result

    @JointPoint(builtins.classmethod)
    # NOTE: "location" can't get file handler signature type. It isn't loaded
    # yet.
# # python3.5
# #     def open(cls: SelfClass, location: builtins.object) -> builtins.dict:
    def open(cls, location):
# #
        '''
            Opens the current file with its default user preference \
            application.

            On Unix, the return value is the exit state of the process \
            encoded in the format specified for wait(). Note that "POSIX" \
            does not specify the meaning of the return value of the C \
            system() function, so the return value of the Python function is \
            system-dependent. On Windows, the return value is that returned \
            by the system shell after running command. The shell is given by \
            the Windows environment variable "COMSPEC": it is usually \
            "cmd.exe", which returns the exit status of the command run; on \
            systems using a non-native shell, consult your shell documentation.

            **location** - location to open

            Examples:

            >>> Platform.open('/path/to/file') # doctest: +SKIP

            >>> Platform.open(FileHandler('/path/to/file')) # doctest: +SKIP
        '''
        file = FileHandler(location, must_exist=True)
        if builtins.hasattr(os, 'startfile'):
            return os.startfile(file)
        shell_file = String(file._path).shell_validated
        for unix_application_name in cls.UNIX_OPEN_APPLICATIONS:
            result = Platform.run(
                command=unix_application_name, command_arguments=(shell_file,))
            if result['return_code'] == 0:
                break
        return result

    # # # endregion

    # # endregion

    # # region protected

    @JointPoint(builtins.classmethod)
# # python3.5     def _initialize_process_lock(cls: SelfClass) -> SelfClass:
    def _initialize_process_lock(cls):
        '''Creates a unique temporary process lock file directory location.'''
        if Platform.process_lock_directory is None:
            Platform.process_lock_directory = FileHandler(
                location=make_temporary_directory())
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _log_command_result(
# #         cls: SelfClass, result: builtins.dict
# #     ) -> builtins.dict:
    def _log_command_result(cls, result):
# #
        '''Logs the result of an invoked and given subprocess output.'''
        if builtins.isinstance(result['standard_output'], builtins.list):
            for index, standard_output in builtins.enumerate(
                result['standard_output']
            ):
                cls._log_command_result({
                    'standard_output': standard_output,
                    'error_output': result['error_output'][index]})
        else:
            if result['standard_output']:
                __logger__.info(result['standard_output'])
            if result['error_output']:
                __logger__.warning(result['error_output'])
        return result

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _run_one_command(
# #         cls: SelfClass, command: Iterable, command_arguments: Iterable,
# #         error: builtins.bool, shell: builtins.bool,
# #         native_shell: builtins.bool, no_blocking: builtins.bool,
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> builtins.dict:
    def _run_one_command(
        cls, command, command_arguments, error, shell, native_shell,
        no_blocking, *arguments, **keywords
    ):
# #
        '''
            Runs a command line command in its own process.

            Examples:

            >>> Platform._run_one_command(
            ...     'not_existing', (), True, False, False, False
            ... ) # doctest: +SKIP
        '''
        result = {'standard_output': '', 'error_output': '', 'return_code': 1}
# # python3.5
# #         command = ' '.join([command] + builtins.list(
# #             command_arguments))
        command = ' '.join([command] + builtins.list(builtins.map(
            lambda value: convert_to_unicode(value), command_arguments)))
# #
        if native_shell:
            result['return_code'] = os.system(command)
            if error and result['return_code'] != 0:
                sys.exit(result['return_code'])
        else:
# # python3.5
# #             with subprocess.Popen(
# #                 command if shell else command.split(), *arguments,
# #                 shell=shell, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
# #                 stderr=subprocess.PIPE, **keywords
# #             ) as process_handler:
# #                 result = cls._communicate_to_process_handler(
# #                     process_handler, no_blocking)
            process_handler = subprocess.Popen(
                command if shell else command.split(), *arguments,
                shell=shell, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                stderr=subprocess.PIPE, **keywords)
            result = cls._communicate_to_process_handler(
                process_handler, no_blocking)
# #
            if error and result['return_code'] != 0:
                raise __exception__(
                    'Command "%s" returns a none zero return code (%d).',
                    command, result['return_code'])
        return result

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _communicate_to_process_handler(
# #         cls: SelfClass, process_handler: subprocess.Popen,
# #         no_blocking: builtins.bool
# #     ) -> builtins.dict:
    def _communicate_to_process_handler(cls, process_handler, no_blocking):
# #
        '''
            Handle communication with a given process. It returns all api \
            informations about the given process.
        '''
        if fcntl and no_blocking:
            fcntl.fcntl(
                process_handler.stdout.fileno(), fcntl.F_SETFL, os.O_NONBLOCK)
            fcntl.fcntl(
                process_handler.stderr.fileno(), fcntl.F_SETFL, os.O_NONBLOCK)
            result = {
                'standard_output': process_handler.stdout,
                'error_output': process_handler.stderr}
        else:
            result = process_handler.communicate()
# # python3.5
# #             result = {
# #                 'standard_output': result[0].decode(
# #                     String(result[0]).encoding),
# #                 'error_output': result[1].decode(
# #                     String(result[1]).encoding)}
            result = {
                'standard_output': convert_to_unicode(result[0]),
                'error_output': convert_to_unicode(result[1])}
# #
            result['return_code'] = process_handler.returncode
        return result

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _run_multiple_commands(
# #         cls: SelfClass, commands: Iterable, command_arguments: Iterable,
# #         error: builtins.bool, shell: builtins.bool,
# #         native_shell: builtins.bool, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> builtins.dict:
    def _run_multiple_commands(
        cls, commands, command_arguments, error, shell, native_shell,
        *arguments, **keywords
    ):
# #
        '''Runs a list of command line commands as its own process.'''
        result = {'standard_output': [], 'error_output': [], 'return_code': []}
        for sub_command in commands:
            sub_result = cls.run(
                command=sub_command, command_arguments=command_arguments,
                error=error, shell=shell, native_shell=native_shell,
                *arguments, **keywords)
            result['standard_output'].append(sub_result['standard_output'])
            result['error_output'].append(sub_result['error_output'])
            result['return_code'].append(sub_result['return_code'])
        return result

    # # endregion

    # endregion


# # python3.5 class CommandLine:
class CommandLine(builtins.object):

    '''
        Defines which possibilities are supported for boolean interactive \
        command line user inputs.
    '''

    # region properties

    ORIGINAL_ARGUMENTS = copy(sys.argv)
    '''Saves an unmodified list of given command line arguments.'''
    POSITIVE_INPUTS = 'y', 'yes', 'positive'
    '''
        These strings are accepted to answer question via standard in
        positively.
    '''
    NEGATIVE_INPUTS = 'n', 'no', 'not', 'negative'
    '''
        These strings are accepted to answer question via standard in
        negatively.
    '''
    EPILOG = 'powered by thaibault'
    '''Output on every information request for applications.'''
    USAGE = ('\n  %(prog)s [positional arguments] [optional arguments]\n\n'
             ' Type "%(prog)s --help" for more informations.')
    '''Small overview about the right using of this program.'''
    ARGUMENT_DEFAULT = None
    '''Set the global default value for arguments.'''
    PREFIX_CHARS = '-'
    '''The set of characters that prefix optional arguments.'''
    FROMFILE_PREFIX_CHARS = '@'
    '''
        The set of characters that prefix files from which additional \
        arguments should be read.
    '''
    CONFLICT_HANDLER = 'resolve'
    '''
        Usually unnecessary, defines strategy to resolve conflicting \
        optionals.
    '''
    DEFAULT_ARGUMENTS = (
        {'arguments': ('-x', '--version'),
         'specification': {
             'action': 'version',
             'version': {'execute': '__version_string__'},
             'help': 'Show current program version.',
             'dest': 'version'}},
        {'arguments': ('-l', '--log-level'),
         'specification': {
             'action': 'store',
             'default': 'critical',
             'type': builtins.str,
             'choices': (
                'debug', 'text-debug', 'info', 'text-info', 'warning',
                'text-warning', 'error', 'text-error', 'critical',
                'text-critical'),
             'help': {'execute':
                      '"Defines log level of current program '
                      'instance. (Available level: \\"%s\\"). You can prefix '
                      'each log level with \\"text-\\" to disable escape '
                      'sequences." % "\\", \\"".join(__default_arguments__[1]'
                      '["specification"]["choices"])'},
             'dest': 'log_level',
             'metavar': 'LOG_LEVEL'}})
    '''Defines standard arguments for every command line interface program.'''
    DEFAULT_CALLER_ARGUMENTS = (
        {'arguments': ('-c', '--module-object',),
         'specification': {
             'action': 'store',
             'default': {'execute': 'default_caller'},
             'type': builtins.str,
             'choices': {'execute': 'objects'},
             'help': {'execute':
                      '"Select a callable module object to run or test. '
                      '(Objects: \\"%s\\")" % "\\", \\"".join(objects)'},
             'dest': 'module_object',
             'metavar': 'CALLABLE_MODULE_OBJECT'}},
        {'arguments': ('-t', '--test'),
         'specification': {
             'action': 'store_true',
             'default': False,
             'help': 'Test current module or given callable.',
             'dest': 'test'}},
        {'arguments': ('-v', '--verbose-test'),
         'specification': {
             'action': 'store_true',
             'default': False,
             'help': 'Test current module or given callable verbosely.',
             'dest': 'verbose_test'}},
        {'arguments': ('-m', '--meta-help'),
         'specification': {
             'action': 'store_true',
             'default': False,
             'help': 'Shows this help message.',
             'dest': 'meta_help'}})
    '''Defines standard arguments for every meta command line interface.'''
    PACKAGE_INTERFACE_ARGUMENTS = (
        {'arguments': ('commands',),
         'specification': {
             'action': 'store',
             'default': '',
             'type': builtins.str,
             'choices': ('all', 'test', 'clear', 'document', 'lint'),
             # 'required': True,
             'help': {'execute':
                      '"Select commands for performing action with this '
                      'package. (Command: \\"%s\\")" % '
                      '"\\", \\"".join(choices)'},
             'metavar': 'COMMAND'}},)
    '''Defines arguments for performing actions on python packages.'''
    DEFAULT_TEMP_FILE_PATTERNS = (
        '^temp_.+$', '^__pycache__$', '^.+\.pyc$', '^.+~$')
    '''
        Defines all file name patterns which should be deleted after running
        tests.
    '''
    current_argument_parser = None
    '''Saves the newest command line argument parser instance.'''

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

            >>> CommandLine.current_argument_parser = None
            >>> repr(CommandLine())
            'Object of "CommandLine" with parser "None".'
        '''
        return 'Object of "{class_name}" with parser "{parser}".'.format(
            class_name=cls.__name__,
            parser=builtins.repr(cls.current_argument_parser))

    # # # endregion

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def argument_parser(
# #         cls: SelfClass, arguments=(), module_name=__name__, scope={},
# #         meta=False, description='', version='', default=True,
# #         *additional_arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> argparse.Namespace:
    def argument_parser(
        cls, arguments=(), module_name=__name__, scope={}, meta=False,
        description='', version='', default=True, *additional_arguments,
        **keywords
    ):
# #
        '''
            Represents a basic argument parsing for command line interface \
            inputs. It's used as default pattern for many interface concepts.

            **arguments**   - arguments for the command line

            **module_name** - module name wich provides the command line

            **scope**       - scope for rendering advanced command line \
                              arguments

            **meta**        - indicates if generated argument parser should \
                              ignore additional unknown arguments

            **description** - command line interface showing description

            **version**     - version description

            **default**     - indicates whether some default arguments should \
                              be added

            Additional arguments are forwarded to python's native \
            "argparse.ArgumentParser()" initializer. \
            Additional keywords are forwarded to \
            "_determine_argument_parser_keywords()" method.

            Examples:

            >>> log_level = Logger.level
            >>> del sys.argv[1:]
            >>> docstring_backup = sys.modules[__name__].__doc__
            >>> sys.argv += '--long', 'hans'

            >>> CommandLine.argument_parser((
            ...     {'arguments': ('-s', '--long'),
            ...      'specification': {'action': 'store', 'type': str}},))
            Namespace(log_level='critical', long='hans')

            >>> sys.modules[__name__].__doc__ = None
            >>> CommandLine.argument_parser((
            ...     {'arguments': ('-s', '--long'),
            ...      'specification': {'action': 'store', 'type': str}},))
            Namespace(log_level='critical', long='hans')

            >>> sys.argv = copy(CommandLine.ORIGINAL_ARGUMENTS)
            >>> sys.modules[__name__].__doc__ = docstring_backup
            >>> Logger.change_all(level=log_level) # doctest: +ELLIPSIS
            <class ...boostnode.extension.output.Logger...>
        '''
        version = cls._get_version(version, module_name)
        description = cls._get_description(description, module_name, version)
        '''
            NOTE: We have to copy scope to avoid changing the mutable default \
            value in this function signature.
        '''
        scope = copy(scope)
        scope.update({
            '__version_string__': version,
            '__default_arguments__': cls.DEFAULT_ARGUMENTS,
            'type': builtins.type})
        cls.current_argument_parser = argparse.ArgumentParser(
            *additional_arguments, **cls._determine_argument_parser_keywords(
                keywords, meta, description))
        default_arguments = [] if not default else cls.DEFAULT_ARGUMENTS
        cls._add_command_line_arguments(arguments, default_arguments, scope)
        if meta:
            arguments_split = cls.current_argument_parser.parse_known_args()
            arguments = arguments_split[0]
            sys.argv = [sys.argv[0]] + arguments_split[1]
        else:
            arguments = cls.current_argument_parser.parse_args()
        cls.handle_log_level(arguments)
        if sys.modules[module_name].__doc__ is None:
            __logger__.warning(
                'There is no module level docstring available (It should be '
                'used as description for this module if running with "help" '
                'flag).')
        return arguments

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def handle_log_level(
# #         cls: SelfClass, arguments: argparse.Namespace
# #     ) -> SelfClass:
    def handle_log_level(cls, arguments):
# #
        '''
            Handles log level in a generic way. If given command line \
            arguments contains a log level all logger levels will be setted \
            to this level.

            **arguments** - command line arguments
        '''
        if(builtins.hasattr(arguments, 'log_level') and
           arguments.log_level is not None):
            # TODO check new branches.
            if arguments.log_level.startswith('text-'):
                arguments.log_level = arguments.log_level[builtins.len(
                    'text-'
                ):]
                Logger.change_all(
                    level=(arguments.log_level,), colored_format=(None,))
            else:
                Logger.change_all(level=(arguments.log_level,))
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def boolean_input(
# #         cls: SelfClass, question: builtins.str, extra=()
# #     ) -> (builtins.bool, builtins.str):
    def boolean_input(cls, question, extra=()):
# #
        '''
            This methods implements a handy way to get "yes" or "no" answers \
            from the user via command line.

            **question** - Question to ask via command line interface

            **extra**    - Additional states to ask for.

            Examples:

            >>> CommandLine.boolean_input(
            ...     question='All right? {boolean_arguments}: '
            ... ) # doctest: +SKIP
            All right? (Choose one of: y, n...)
        '''
# # python3.5         input_string = builtins.input(question.format(
        input_string = builtins.raw_input(question.format(
            boolean_arguments='(Choose one of: {choices})'.format(
                choices=', '.join(
                    cls.POSITIVE_INPUTS + extra + cls.NEGATIVE_INPUTS)))
        ).lower()
        if input_string in extra:
            return input_string
        if input_string in cls.POSITIVE_INPUTS:
            return True
        if input_string in cls.NEGATIVE_INPUTS:
            return False
        return cls.boolean_input(question, extra)

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def determine_wrapped_objects(
# #         cls: SelfClass, scope: (builtins.type, builtins.object),
# #         only_module_level=True
# #     ) -> builtins.dict:
    def determine_wrapped_objects(cls, scope, only_module_level=True):
# #
        '''
            Returns all aspect orientated wrapped methods in given module.

            **scope**             - scope to check again objects

            **only_module_level** - indicates whether imported object should \
                                    be ignored

            Examples:

            >>> import boostnode.extension.system

            >>> sys.flags.optimize == 1 or (
            ...     'CommandLine.determine_wrapped_objects' in
            ...     CommandLine.determine_wrapped_objects(
            ...         boostnode.extension.system))
            True

            >>> @JointPoint
            ... def a(): pass
            >>> class A: pass
            >>> A.a = a
            >>> sys.flags.optimize == 1 or (
            ...     'a' in CommandLine.determine_wrapped_objects(
            ...         A, only_module_level=False))
            True
        '''
        objects = {}
        '''Iterate classes and functions.'''
        for name, object in scope.__dict__.items():
            '''Exclude included objects.'''
            if not only_module_level or inspect.getmodule(object) is scope:
                if builtins.isinstance(object, FunctionDecorator):
                    objects[name] = object.__func__
                objects = cls._determine_nested_wrapped_objects(
                    object, objects, name)
        return objects

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def generic_package_interface(
# #         cls: SelfClass, name=__name__, frame=inspect.currentframe(),
# #         command_line_arguments=(),
# #         linter='pep8 --repeat --ignore=E112', documenter='pydoc3.4',
# #         documenter_arguments=('-w',), documentation_path='documentation',
# #         clear_old_documentation=True, documentation_file_extension='html',
# #         temp_file_patterns=None, exclude_packages=()
# #     ) -> (builtins.tuple, builtins.bool):
    def generic_package_interface(
        cls, name=__name__, frame=inspect.currentframe(),
        command_line_arguments=(), linter='pep8 --repeat --ignore=E112',
        documenter='pydoc2', documenter_arguments=('-w',),
        documentation_path='documentation', clear_old_documentation=True,
        documentation_file_extension='html', temp_file_patterns=None,
        exclude_packages=()
    ):
# #
        '''
            Provides a command-line interface like a makefile. Supported \
            features are linting, generate documentation, testing and \
            removing temporary files.

            **name**                         - package name

            **frame**                        - frame bounded to package scope

            **command_line_arguments**       - additional command line \
                                               arguments

            **linter**                       - linter program name to use

            **documenter**                   - api documentation program name

            **documenter_arguments**         - command line arguments for \
                                               given documenter

            **documentation_path**           - path to put generated api \
                                               documentation

            **clear_old_documentation**      - indicates whether to delete \
                                               old documentation files

            **documentation_file_extension** - documentation file extension \
                                               to search for moving

            **temp_file_patterns**           - file patterns to tidy up

            **exclude_packages**             - sub packages to ignore

            Examples:

            >>> CommandLine.generic_package_interface(
            ...     name='not__main__', frame=inspect.currentframe())
            False

            >>> CommandLine.generic_package_interface(
            ...     name='not__main__', frame=inspect.currentframe(),
            ...     temp_file_patterns=())
            False
        '''
        if temp_file_patterns is None:
            temp_file_patterns = cls.DEFAULT_TEMP_FILE_PATTERNS
        if name == '__main__' and CommandLine.generic_module_interface(
            module=Module.extend(name, frame), default_caller=False
        ):
            all, arguments, current_working_directory_backup = \
                cls._package_start_helper(name, frame, command_line_arguments)
            try:
                module_names = cls._handle_packages_in_package(
                    current_working_directory_backup, frame,
                    command_line_arguments, exclude_packages
                )._get_modules(name)
                cls._test_lint_document_modules(
                    all, arguments, module_names, temp_file_patterns, linter,
                    documentation_path, clear_old_documentation, documenter,
                    documenter_arguments, documentation_file_extension, frame,
                    current_working_directory_backup)
            finally:
                '''Tidy up.'''
                cls._restore_current_directory(
                    clear=all or 'clear' in arguments.commands,
                    current_directory=current_working_directory_backup,
                    temp_file_patterns=temp_file_patterns)
            return all, arguments, current_working_directory_backup
        return False

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def generic_module_interface(
# #         cls: SelfClass, module: builtins.dict,
# #         temp_file_patterns=None, test=False, default_caller=None,
# #         caller_arguments=(), caller_keywords={}
# #     ) -> builtins.bool:
    def generic_module_interface(
        cls, module, temp_file_patterns=None, test=False,
        default_caller=None, caller_arguments=(), caller_keywords={}
    ):
# #
        '''
            Provides a generic command line interface for modules. Things \
            like unit testing or calling objects in module are provided. \
            Returns "True" if module handling was needed and "False" if some \
            action has ran.

            **module**             - module object to provide an interface for

            **temp_file_patterns** - temporary file patterns to delete

            **test**               - indicates whether this module should be \
                                     tested or not

            **default_caller**     - default callable object in given module

            **caller_arguments**   - arguments for given caller to forward

            **caller_keywords**    - keywords for given caller to forward

            Examples:

            >>> CommandLine.generic_module_interface(
            ...     module={'name': 'hans'}, temp_file_patterns=()
            ... ) # doctest: +ELLIPSIS
            True
        '''
        if temp_file_patterns is None:
            temp_file_patterns = cls.DEFAULT_TEMP_FILE_PATTERNS
        if module['name'] == '__main__' or test:
            callable_object_names, default_caller_name = \
                cls._determine_callable_objects(module, default_caller, test)
            given_arguments = cls.argument_parser(
                arguments=cls.DEFAULT_CALLER_ARGUMENTS,
                scope={
                    'objects': callable_object_names,
                    'default_caller': default_caller_name},
                meta=True, default=False)
            if given_arguments.meta_help:
                cls.current_argument_parser.print_help()
            elif given_arguments.verbose_test or given_arguments.test or test:
                '''We have to check if a callable name was given explicitly.'''
                cls.test_module(
                    module, temp_file_patterns,
                    verbose=given_arguments.verbose_test,
                    test_only_callable_name=given_arguments.module_object if \
                        cls.is_explicit_argument(
                            given_arguments,
                            specification=cls.DEFAULT_CALLER_ARGUMENTS,
                            name='module_object'
                        ) else None)
            elif given_arguments.module_object is not False:
                '''
                    NOTE: We have to copy caller keywords to avoid changing \
                    the mutable default value in this function signature.
                '''
                cls._call_module_object(
                    module, callable_object_names,
                    object_name=given_arguments.module_object,
                    caller_arguments=caller_arguments,
                    caller_keywords=copy(caller_keywords))
            else:
                return True
            return False
        return True

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def is_explicit_argument(
# #         cls: SelfClass, given_arguments: argparse.Namespace,
# #         specification: Iterable, name: builtins.str
# #     ) -> builtins.bool:
    def is_explicit_argument(cls, given_arguments, specification, name):
# #
        '''
            Guesses if given argument name was explicitly provided in given \
            parsed arguments.

            **given_arguments** - parsed command line arguments provided by \
                                  the application executer.

            **specification**   - argument specification to refer to

            **name**            - command argument to check for

            Returns "True" if given command line argument was given explicitly
            (not by specified default value) and "False" otherwise.

            NOTE: This is not absolutely safe since a boolean argument could \
            be provided as value to an another optional argument or \
            arguments could be provided via sub arguments.

            Examples:

            TODO finish.

            >>> class Mockup:
            ...     test = True
            ...     key = 'value'
            >>> specification = ({
            ...     'arguments': ['--test'], 'specification': {'dest': 'test'}
            ... }, {'arguments': ['--key'], 'specification': {'dest': 'key'}})

            >>> CommandLine.is_explicit_argument(Mockup, specification, 'test')
            False

            >>> original_arguments_backup = copy(
            ...     CommandLine.ORIGINAL_ARGUMENTS)

            >>> CommandLine.ORIGINAL_ARGUMENTS.append('--test')
            >>> CommandLine.is_explicit_argument(Mockup, specification, 'test')
            True

            >>> Mockup.test = False
            >>> CommandLine.is_explicit_argument(Mockup, specification, 'test')
            True

            >>> CommandLine.is_explicit_argument(Mockup, specification, 'key')
            False

            >>> CommandLine.ORIGINAL_ARGUMENTS.append('--key')
            >>> CommandLine.is_explicit_argument(Mockup, specification, 'key')
            False

            >>> CommandLine.ORIGINAL_ARGUMENTS.append('2')
            >>> CommandLine.is_explicit_argument(Mockup, specification, 'key')
            False

            >>> CommandLine.ORIGINAL_ARGUMENTS[-1] = 'value'
            >>> CommandLine.is_explicit_argument(Mockup, specification, 'key')
            True

            >>> CommandLine.ORIGINAL_ARGUMENTS = original_arguments_backup
        '''
        # TODO check branches
        if builtins.hasattr(given_arguments, name):
            for argument in specification:
                if argument['specification']['dest'] == name:
                    for argument_version in argument['arguments']:
# # python3.5
# #                         if(builtins.isinstance(builtins.getattr(
# #                             given_arguments, name
# #                         ), builtins.bool) and
# #                         argument_version in cls.ORIGINAL_ARGUMENTS[1:] or
# #                         '%s %s' % (argument_version, builtins.str(
# #                             builtins.getattr(given_arguments, name)
# #                         )) in ' '.join(cls.ORIGINAL_ARGUMENTS[1:])):
                        if(builtins.isinstance(builtins.getattr(
                            given_arguments, name
                        ), builtins.bool) and
                        argument_version in cls.ORIGINAL_ARGUMENTS[1:] or
                        '%s %s' % (argument_version, convert_to_unicode(
                            builtins.getattr(given_arguments, name)
                        )) in ' '.join(cls.ORIGINAL_ARGUMENTS[1:])):
# #
                            return True
        return False

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def test_module(
# #         cls: SelfClass, module: builtins.dict,
# #         temp_file_patterns: Iterable, verbose=False,
# #         test_only_callable_name=None
# #     ) -> SelfClass:
    def test_module(
        cls, module, temp_file_patterns, verbose,
        test_only_callable_name=None
    ):
# #
        '''
            Test a given module's doctests.

            **module**                  - module object to test

            **temp_file_patterns**      - temporary file patterns to delete

            **verbose**                 - indicates whether testing output \
                                          should be verbose.

            **test_only_callable_name** - if provided only given callable \
                                          name will be checked.
        '''
        module = cls._extend_module_for_testing(module)
        '''Backup old runtime environment.'''
        platform_process_lock_directory_backup = \
            Platform.process_lock_directory
        default_print_buffer_backup = Print.default_buffer
        log_level_backup = Logger.level
        logger_buffer_backup = Logger.buffer
        '''Set test environment.'''
        Platform.process_lock_directory = module['scope'].__test_folder__
        Print.default_buffer = module['scope'].__test_buffer__
        Logger.change_all(
            level=('info',), buffer=(module['scope'].__test_buffer__,))
# # python3.5
# #         # TODO check new branches.
# #         if test_only_callable_name is None:
# #             doctest.testmod(
# #                 module['scope'], verbose=verbose,
# #                 optionflags=doctest.DONT_ACCEPT_TRUE_FOR_1 |
# #                 doctest.REPORT_ONLY_FIRST_FAILURE | doctest.FAIL_FAST)
# #         else:
# #             doctest.run_docstring_examples(
# #                 builtins.getattr(module['scope'], test_only_callable_name),
# #                 module['scope'].__dict__, verbose=verbose,
# #                 name=test_only_callable_name,
# #                 optionflags=doctest.DONT_ACCEPT_TRUE_FOR_1 |
# #                 doctest.REPORT_ONLY_FIRST_FAILURE | doctest.FAIL_FAST)
        native_output_checker = doctest.OutputChecker.check_output

        def check_output(
            output_checker_instance, want, got, *arguments, **keywords
        ):
            '''
                Monkey patch to support sames unicode string representing \
                in python2.X and python3.X.
            '''
            '''
                NOTE: This only works for trivial outputs and can destroy \
                valid outputs.
            '''
            for suffix in ("'", '"', '\\"', "\\'"):
                got = got.replace('u%s' % suffix, suffix)
            got = got.replace('"unicode"', '"str"')
            return native_output_checker(
                output_checker_instance, want, got, *arguments, **keywords)
        doctest.OutputChecker.check_output = check_output
        # TODO check new branches.
        if test_only_callable_name is None:
            doctest.testmod(
                module['scope'], verbose=verbose,
                optionflags=doctest.DONT_ACCEPT_TRUE_FOR_1 |
                doctest.REPORT_ONLY_FIRST_FAILURE)
        else:
            doctest.run_docstring_examples(
                builtins.getattr(module['scope'], test_only_callable_name),
                module['scope'].__dict__, verbose=verbose,
                name=test_only_callable_name,
                optionflags=doctest.DONT_ACCEPT_TRUE_FOR_1 |
                doctest.REPORT_ONLY_FIRST_FAILURE)
# #
        '''Recover old runtime environment.'''
        Logger.change_all(level=log_level_backup, buffer=logger_buffer_backup)
        Print.default_buffer = default_print_buffer_backup
        Platform.process_lock_directory = \
            platform_process_lock_directory_backup
        if not sys.flags.debug:
            cls._clear_temp_files(temp_file_patterns)
            module['scope'].__test_folder__.remove_deep()
        return cls

    # # endregion

    # # region protected

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _extend_module_for_testing(
# #         cls: SelfClass, module: builtins.dict
# #     ) -> builtins.dict:
    def _extend_module_for_testing(cls, module):
# #
        '''Extend given module with some globals usable for testing.'''
        global FileHandler, Buffer
        context_path = Module.get_context_path(__file_path__)
        '''
            NOTE: The identical module could be loaded under different \
            relative context paths. So we have to make sure that testing \
            critical objects are instances from the identical class.
        '''
        if Module.get_context_path(module['scope'].__file_path__).startswith(
            context_path[:context_path.rfind('.')]
        ):
            if FileHandler.__name__ in module['scope'].__dict__:
                FileHandler = module['scope'].__dict__[FileHandler.__name__]
            elif Buffer.__name__ in module['scope'].__dict__:
                Buffer = module['scope'].__dict__[Buffer.__name__]
        module['scope'].__test_folder__ = FileHandler(
            location=make_temporary_directory(suffix=module['scope'].__name__))
        module['scope'].__test_buffer__ = Buffer()
        module['scope'].__test__ = cls.determine_wrapped_objects(
            scope=module['scope'])
# # python3.5         module['scope'].__name__ = '__main__'
        module['scope'].__name__ = builtins.str('__main__')
        module['scope'].__test_mode__ = True
        module['scope'].__test_globals__ = module['scope'].__dict__
        return module

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _determine_nested_wrapped_objects(
# #         cls: SelfClass, object: (builtins.object, builtins.type),
# #         objects: builtins.dict, name: builtins.str
# #     ) -> builtins.dict:
    def _determine_nested_wrapped_objects(cls, object, objects, name):
# #
        '''
            Determines nested wrapped objects and appends them to given list \
            of objects.
        '''
        if builtins.hasattr(object, '__dict__'):
            for sub_name, sub_object in object.__dict__.items():
                '''Iterate inner functions.'''
                if builtins.isinstance(sub_object, FunctionDecorator):
                    objects['%s.%s' % (name, sub_name)] = \
                        sub_object.__func__
        return objects

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _determine_argument_parser_keywords(
# #         cls: SelfClass, keywords: builtins.dict, meta: builtins.bool,
# #         description: builtins.str
# #     ) -> builtins.dict:
    def _determine_argument_parser_keywords(
        cls, keywords, meta, description
    ):
# #
        '''
            Determines keyword arguments given to python's native command \
            line argument parser.
        '''
        determined_keywords = {
            'description': description,
            'epilog': cls.EPILOG,
            'add_help': not meta,
            'argument_default': cls.ARGUMENT_DEFAULT,
            'prefix_chars': cls.PREFIX_CHARS,
            'fromfile_prefix_chars': cls.FROMFILE_PREFIX_CHARS,
            'conflict_handler': cls.CONFLICT_HANDLER,
            'usage': cls.USAGE}
        determined_keywords.update(keywords)
        return determined_keywords

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _validate_command_line_argument(
# #         cls: SelfClass, argument: builtins.dict, arguments: Iterable
# #     ) -> SelfClass:
    def _validate_command_line_argument(cls, argument, arguments):
# #
        '''
            Checks command line arguments for redundant option names.

            Examples:

            >>> CommandLine._validate_command_line_argument({
            ...     'arguments': ('-a', '--abba'),
            ...     'specification': {'dest': 'abba'}},
            ...     ({'arguments': ('-a', '--baab'),
            ...       'specification': {'dest': 'abba'}},)
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.SystemError: Argu..."abba" with... "-a".
        '''
        for other_argument in builtins.list(
            cls.DEFAULT_CALLER_ARGUMENTS
        ) + builtins.list(
            cls.DEFAULT_ARGUMENTS
        ) + builtins.list(arguments):
            if(other_argument['arguments'][0] == argument['arguments'][0] and
               (builtins.len(argument['arguments']) != builtins.len(
                    other_argument['arguments']) or
                builtins.len(argument['arguments']) > 1 and
                other_argument['arguments'][1] != argument['arguments'][1])
               ):
                raise __exception__(
                    'Argument "%s" shadows argument "%s" with shortcut '
                    '"%s".', argument['specification']['dest'],
                    other_argument['specification']['dest'],
                    argument['arguments'][0])
        return cls._validate_command_line_argument_again_help_argument(
            argument)

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _validate_command_line_argument_again_help_argument(
# #         cls: SelfClass, argument: builtins.dict
# #     ) -> SelfClass:
    def _validate_command_line_argument_again_help_argument(cls, argument):
# #
        '''
            Checks if given command line argument specification collides with \
            default help command line argument.

            Examples:

            >>> command_line = CommandLine
            >>> (command_line.
            ...  _validate_command_line_argument_again_help_argument)({
            ...     'arguments': ('-h', '--hans'),
            ...     'specification': {'dest': 'hans'}}
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.SystemError: Argument "hans"..."help".
        '''
        if(argument['arguments'][0] == '-h' or
           builtins.len(argument['arguments']) > 1 and
           argument['arguments'][1] == '--help'):
            raise __exception__(
                'Argument "%s" shadows default argument "help".',
                argument['specification']['dest'])
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _handle_initializer_default_values(
# #         cls: SelfClass, scope: builtins.dict
# #     ) -> builtins.dict:
    def _handle_initializer_default_values(cls, scope):
# #
        '''
            Determines the default value from the runnable module's \
            "_initialize" method forced to be defined by the "Runnable" \
            implementation.

            Examples:

            >>> class A(Runnable):
            ...     def _initialize(self, a=1, b=2):
            ...         print(CommandLine._handle_initializer_default_values({
            ...             'self': self, '__name__': 'a'}))
            >>> a = A() # doctest: +ELLIPSIS
            {...'__initializer_default_value__': 1...}

            >>> class A(Runnable):
            ...     def _initialize(self, b=1):
            ...         print(CommandLine._handle_initializer_default_values({
            ...             'self': self, '__name__': 'a'}))
            >>> a = A() # doctest: +ELLIPSIS
            {...'__initializer_default_value__': ...}

            >>> class A(Runnable):
            ...     @JointPoint
            ...     def _initialize(self, a):
            ...         print(CommandLine._handle_initializer_default_values({
            ...             'self': self, '__name__': 'a'}))
            >>> a = A(2) # doctest: +ELLIPSIS
            {...'__initializer_default_value__': ...}

            >>> class A(Runnable):
            ...     def _initialize(self, b=None):
            ...         print(CommandLine._handle_initializer_default_values({
            ...             'self': self, '__name__': 'b'}))
            >>> a = A() # doctest: +ELLIPSIS
            {...'__initializer_default_value__': ...}
        '''
        scope['__initializer_default_value__'] = ''
        if 'self' in scope:
            '''Unpack initializer method.'''
            initializer = scope['self']._initialize
            while builtins.hasattr(initializer, '__wrapped__'):
                initializer = initializer.__wrapped__
# # python3.5
# #             parameters = inspect.signature(initializer).parameters
# #             if scope['__name__'] in parameters:
# #                 if(parameters[scope['__name__']].default is
# #                    inspect.Parameter.empty):
# #                     if builtins.type(
# #                         parameters[scope['__name__']].annotation
# #                     ) is builtins.type:
# #                         '''
# #                             Set default value to default value of \
# #                             specified parameter type.
# #                         '''
# #                         scope['__initializer_default_value__'] = \
# #                             parameters[scope['__name__']].annotation()
# #                 else:
# #                     scope['__initializer_default_value__'] = \
# #                         parameters[scope['__name__']].default
            argument_specification = inspect.getargspec(initializer)
            if argument_specification.defaults:
                parameters = builtins.dict(builtins.zip(
                    argument_specification.args[builtins.len(
                        argument_specification.args
                    ) - builtins.len(argument_specification.defaults):],
                    argument_specification.defaults))
                if scope['__name__'] in parameters:
                    '''
                        Set default value to default value of specified \
                        parameter type.
                    '''
                    scope['__initializer_default_value__'] = \
                        parameters[scope['__name__']]
# #
            if scope['__initializer_default_value__'] is None:
                scope['__initializer_default_value__'] = ''
        return scope

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _add_command_line_arguments(
# #         cls: SelfClass, arguments: Iterable, default_arguments: Iterable,
# #         scope: builtins.dict
# #     ) -> SelfClass:
    def _add_command_line_arguments(
        cls, arguments, default_arguments, scope
    ):
# #
        '''
            Adds command line arguments to python's native command line \
            argument parser.

            Examples:

            >>> CommandLine._add_command_line_arguments(({
            ...     'arguments': ('-a', '--hans'),
            ...     'specification': {'dest': 'hans',
            ...                       'help': {'execute': 'fails'}}},),
            ...     (), {}) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.SystemError: During rendering argume...
        '''
        for argument in builtins.list(arguments) + builtins.list(
            default_arguments
        ):
            cls._validate_command_line_argument(argument, arguments)
            scope['__name__'] = argument['arguments'][0]
            if 'dest' in argument['specification']:
                scope['__name__'] = argument['specification']['dest']
            scope = cls._handle_initializer_default_values(scope)
            argument['specification'] = cls._render_command_line_argument(
                argument=argument['specification'], scope=scope)
            for keyword, value in argument['specification'].items():
                argument['specification'][keyword] = \
                    cls._render_command_line_argument(
                        argument=value, scope=scope, keyword=keyword)
            cls.current_argument_parser.add_argument(
                *argument['arguments'], **argument['specification'])
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _call_module_object(
# #         cls: SelfClass, module: builtins.dict,
# #         callable_object_names: Iterable, object_name: builtins.str,
# #         caller_arguments: Iterable, caller_keywords: builtins.dict
# #     ) -> SelfClass:
    def _call_module_object(
        cls, module, callable_object_names, object_name, caller_arguments,
        caller_keywords
    ):
# #
        '''
            Calls a suitable module object to provide an entry point for \
            modules supporting a command line interface.

            Examples:

            >>> class Scope:
            ...     def hans(self): return 'hans'
            >>> sys.argv = [sys.argv[0], 'hans', 'peter']
            >>> CommandLine._call_module_object(
            ...     {'scope': Scope()}, ('hans',), 'hans', (), {}
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> class Scope:
            ...     def hans(self): return 'hans'
            >>> sys.argv = [sys.argv[0]]
            >>> CommandLine._call_module_object(
            ...     {'scope': Scope()}, ('hans',), 'hans', (), {}
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> sys.argv = copy(CommandLine.ORIGINAL_ARGUMENTS)
        '''
        if builtins.len(sys.argv) > 2 and sys.argv[1] in callable_object_names:
            sys.argv = [sys.argv[0]] + sys.argv[2:]
        builtins.getattr(module['scope'], object_name)(
            *caller_arguments, **caller_keywords)
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _determine_callable_objects(
# #         cls: SelfClass, module: builtins.dict,
# #         default_caller: (builtins.str, builtins.bool, builtins.type(None)),
# #         test: builtins.bool
# #     ) -> builtins.tuple:
    def _determine_callable_objects(cls, module, default_caller, test):
# #
        '''
            Determines all callable objects and a default caller in given \
            module. Both are given back in one tuple.

            Examples:

            >>> from types import ModuleType

            >>> class A(ModuleType): pass

            >>> if sys.version_info.major < 3:
            ...     CommandLine._determine_callable_objects(
            ...         {'scope': A(str('A')), 'name': 'A'}, None, True)
            ... else:
            ...     CommandLine._determine_callable_objects(
            ...         {'scope': A('A'), 'name': 'A'}, None, True)
            ((), None)

            >>> if sys.version_info.major < 3:
            ...     CommandLine._determine_callable_objects(
            ...         {'scope': A(str('A')), 'name': 'A'}, None, False)
            ... else:
            ...     CommandLine._determine_callable_objects(
            ...         {'scope': A('A'), 'name': 'A'}, None, False
            ...     ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boosteNode.extension.system.SystemError: No callable objects in ...

            >>> class A(ModuleType):
            ...     def a(self): pass
            >>> if sys.version_info.major < 3:
            ...     a = A(str('A'))
            ... else:
            ...     a = A('A')
            >>> CommandLine._determine_callable_objects(
            ...     {'scope': a, 'name': 'A'}, 'a', True
            ... ) == ((), 'a')
            True
        '''
        callable_objects = builtins.tuple(Module.get_defined_callables(
            object=module['scope']))
        if callable_objects or default_caller is False:
            default_caller = Module.determine_caller(
                caller=default_caller, callable_objects=callable_objects)
            if builtins.isinstance(default_caller, builtins.tuple):
                default_caller = default_caller[0]
        else:
            message = 'No callable objects in "{name}" ({scope}).'.format(
                name=module['name'], scope=module['scope'])
            if test:
                __logger__.info(message)
            else:
                raise __exception__(message)
        return builtins.tuple(
            builtins.dict(callable_objects).keys()
        ), default_caller

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _test_lint_document_modules(
# #         cls: SelfClass, all: builtins.bool, arguments: argparse.Namespace,
# #         module_names: Iterable, temp_file_patterns: Iterable,
# #         linter: builtins.str, documentation_path: builtins.str,
# #         clear_old_documentation: builtins.bool,
# #         documenter: builtins.str, documenter_arguments: Iterable,
# #         documentation_file_extension: builtins.str, frame: Frame,
# #         current_working_directory_backup: builtins.str
# #     ) -> SelfClass:
    def _test_lint_document_modules(
        cls, all, arguments, module_names, temp_file_patterns, linter,
        documentation_path, clear_old_documentation, documenter,
        documenter_arguments, documentation_file_extension, frame,
        current_working_directory_backup
    ):
# #
        '''
            Test, lints and documents given modules if corresponding command \
            line flags are set.

            Examples:

            >>> class A(argparse.Namespace): commands = ()
            >>> CommandLine._test_lint_document_modules(
            ...     False, A(), (), (), '', '', True, '', (),
            ...     '', inspect.currentframe(), ''
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>
        '''
        if all or 'test' in arguments.commands:
            cls._test_modules(module_names, temp_file_patterns)
        if all or 'lint' in arguments.commands:
            cls._lint_modules(linter, module_names)
        if all or 'document' in arguments.commands:
            cls._document_modules(
                documentation_path, clear_old_documentation,
                module_names, documenter, documenter_arguments,
                documentation_file_extension
            )._put_documentations_together(
                documentation_path, frame,
                current_working_directory_backup,
                documentation_file_extension)
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _get_modules(cls: SelfClass, name: builtins.str) -> builtins.list:
    def _get_modules(cls, name):
# #
        '''
            Get all module names in given package name.

            Examples:

            >>> CommandLine._get_modules('__main__')
            ['__init__']

            >>> __module_name__ in CommandLine._get_modules(
            ...     'boostnode.extension')
            True
        '''
        module_names = []
        if(builtins.hasattr(sys.modules[name], '__all__') and
           sys.modules[name].__all__):
            module_names = sys.modules[name].__all__
        else:
            __logger__.info('No modules found.')
        module_names.append('__init__')
        return module_names

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _get_version(
# #         cls: SelfClass, version: builtins.str, module_name: builtins.str
# #     ) -> builtins.str:
    def _get_version(cls, version, module_name):
# #
        '''
            Generates a version string by for a given module name. If \
            "version" is not empty it will be given back untouched.

            Examples:

            >>> CommandLine._get_version('version', '__main__')
            'version'

            >>> CommandLine._get_version('', '__main__') # doctest: +ELLIPSIS
            'System ... stable'
        '''
        if version:
            return version
        return '{program} {version} {status}'.format(
            program=String(
                sys.modules[module_name].__module_name__
            ).camel_case_capitalize.content,
            version=sys.modules[module_name].__version__,
            status=sys.modules[module_name].__status__)

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _get_description(
# #         cls: SelfClass, description: (builtins.str, builtins.type(None)),
# #         module_name: builtins.str, version: builtins.str
# #     ) -> builtins.str:
    def _get_description(cls, description, module_name, version):
# #
        '''
            Generates a description string for given module. If description \
            is not empty it will be given back untouched.

            Examples:

            >>> CommandLine._get_description(
            ...     'description', '__main__', 'version')
            'description'

            >>> CommandLine._get_description(
            ...     '', '__main__', 'version'
            ... ) # doctest: +ELLIPSIS
            'version - ...'

            >>> CommandLine._get_description(None, 'hans', '1.0')
            ''
        '''
        if description is None:
            return ''
        if not description:
            description = '{version}'
            if sys.modules[module_name].__doc__ is not None:
                description += ' - ' + sys.modules[module_name].__doc__
# # python3.5
# #         match = regularExpression.compile(
# #             '((?:.|\n)*)\n.+\n *=+\n(?:.|\n)*'
# #         ).fullmatch(description)
        match = regularExpression.compile(
            '((?:.|\n)*)\n.+\n *=+\n(?:.|\n)*$'
        ).match(description)
# #
        description = match.group(1) if match else description
        return description.format(version=version)

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _put_documentations_together(
# #         cls: SelfClass, documentation_path: builtins.str,
# #         frame: Frame,
# #         current_working_directory_backup: builtins.str,
# #         documentation_file_extension: builtins.str
# #     ) -> SelfClass:
    def _put_documentations_together(
        cls, documentation_path, frame, current_working_directory_backup,
        documentation_file_extension
    ):
# #
        '''
            Moves all documentation files in sub packages to root package.

            Examples:

            >>> CommandLine._put_documentations_together(
            ...     __test_folder__.path, inspect.currentframe(), os.getcwd(),
            ...     'not_existing'
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>
        '''
        meta_documentation = FileHandler(
            location=documentation_path, make_directory=True)
        '''
            In this way sub packages deletes their documentations too before \
            they will be copied to root package directory.
        '''
        for package, initializer in cls._get_packages(
            current_working_directory_backup, frame
        ):
            package_documentation = FileHandler(
                location=package.path + documentation_path)
            if package_documentation:
                for file in package_documentation:
                    if file.extension == documentation_file_extension:
                        '''
                            This two statements have to be in this order to \
                            prevent overwriting files.
                        '''
                        file.name = package.basename + '.' + file.name
                        file.directory = meta_documentation
                package_documentation.remove_directory()
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _document_modules(
# #         cls: SelfClass, documentation_path: builtins.str,
# #         clear_old_documentation: builtins.bool, module_names: Iterable,
# #         documenter: builtins.str, documenter_arguments: Iterable,
# #         documentation_file_extension: builtins.str
# #     ) -> SelfClass:
    def _document_modules(
        cls, documentation_path, clear_old_documentation, module_names,
        documenter, documenter_arguments, documentation_file_extension
    ):
# #
        '''
            Documents given modules with given documenter in given \
            documentation location.

            Examples:

            >>> CommandLine._document_modules(
            ...     __test_folder__.path, True, (), '', (), 'not_existing'
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> CommandLine._document_modules(
            ...     __test_folder__.path, False, (), '', (), 'not_existing'
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>
        '''
        documentation = FileHandler(
            location=documentation_path, make_directory=True)
        if clear_old_documentation:
            documentation.clear_directory()
# # python3.5
# #         __logger__.info(
# #             'Document modules "{modules}" with "{documenter}".'.format(
# #                 modules='", "'.join(module_names), documenter=documenter))
# #         Module.execute_program_for_modules(
# #             program_type='documenter', program=documenter,
# #             modules=module_names, arguments=documenter_arguments,
# #             error=False)
        for file in FileHandler():
            if file.extension == documentation_file_extension:
                file.directory = documentation.path
# #
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _lint_modules(
# #         cls: SelfClass, linter: builtins.str, module_names: Iterable
# #     ) -> SelfClass:
    def _lint_modules(cls, linter, module_names):
# #
        '''
            Lints given modules with given linter.

            Examples:

            >>> CommandLine._lint_modules('', ()) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> CommandLine._lint_modules(
            ...     'not_existing', ()
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>
        '''
        __logger__.info(
            'Lint modules "{modules}" with "{linter}".'.format(
                modules='", "'.join(module_names), linter=linter))
        result = Module.execute_program_for_modules(
            program_type='linter', program=linter, modules=module_names,
            log=False, error=False)
        if result[0].strip():
            __logger__.warning(result[0].strip())
        if result[1].strip():
            __logger__.warning(result[1].strip())
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _test_modules(
# #         cls: SelfClass, module_names: Iterable,
# #         temp_file_patterns: Iterable
# #     ) -> SelfClass:
    def _test_modules(cls, module_names, temp_file_patterns):
# #
        '''
            Handle modules in given package.

            Examples:

            >>> CommandLine._test_modules((), ()) # doctest: +ELLIPSIS
            <class ...CommandLine...>
        '''
        for module_name in module_names:
            __logger__.info('Test module "%s".', module_name)
            main_module_reference_backup = sys.modules['__main__']
            module = importlib.import_module(module_name)
            module = importlib.import_module(
                Module.get_context_path(path=inspect.getsourcefile(module)))
            sys.modules['__main__'] = module
            cls.generic_module_interface(
                module=Module.extend(name=module_name, module=module),
                temp_file_patterns=temp_file_patterns, test=True)
            sys.modules['__main__'] = main_module_reference_backup
            sys.argv = copy(cls.ORIGINAL_ARGUMENTS)
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _handle_packages_in_package(
# #         cls: SelfClass, current_working_directory_backup: builtins.str,
# #         frame: Frame, command_line_arguments: Iterable,
# #         exclude_packages: Iterable
# #     ) -> SelfClass:
    def _handle_packages_in_package(
        cls, current_working_directory_backup, frame,
        command_line_arguments, exclude_packages
    ):
# #
        '''
            Handle packages in current directory or package.

            Examples:

            >>> CommandLine._handle_packages_in_package(
            ...     os.getcwd(), inspect.currentframe(), (), ()
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> CommandLine._handle_packages_in_package(
            ...     os.getcwd(), inspect.currentframe(),
            ...     ({'arguments': ('a',)},), ()
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> sys.argv.append('a')
            >>> CommandLine._handle_packages_in_package(
            ...     os.getcwd(), inspect.currentframe(),
            ...     ({'arguments': ('a')},), ()
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> sys.argv = copy(CommandLine.ORIGINAL_ARGUMENTS)
        '''
        new_command_line_arguments = sys.argv[1:]
        for record in command_line_arguments:
            for argument in record['arguments']:
                while argument in new_command_line_arguments:
                    del new_command_line_arguments[
                        new_command_line_arguments.index(argument)]
        for package, initializer in cls._get_packages(
            current_working_directory_backup, frame
        ):
            if package.basename not in builtins.map(
                lambda package: package.__name__, exclude_packages
            ):
                __logger__.info(
                    'Run "{package}" with initializer "{code_manager}" and'
                    ' arguments "{arguments}".'.format(
                        package=package.basename,
                        code_manager=initializer.path,
                        arguments='", "'.join(new_command_line_arguments)))
                Platform.run(
                    command=initializer.path, native_shell=True,
                    command_arguments=new_command_line_arguments)
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _package_start_helper(
# #         cls: SelfClass, name: builtins.str, frame: Frame,
# #         command_line_arguments: Iterable
# #     ) -> builtins.tuple:
    def _package_start_helper(cls, name, frame, command_line_arguments):
# #
        '''
            This method does some starting routine for initializing a package \
            interface.

            Examples:

            >>> current_working_directory_backup = FileHandler(os.getcwd())

            >>> CommandLine._package_start_helper(
            ...     '__main__', inspect.currentframe(), ()
            ... ) # doctest: +SKIP

            >>> current_working_directory_backup.change_working_directory(
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
        '''
        arguments = cls._package_argument_parser(
            name, frame, command_line_arguments)
        current_working_directory_backup = os.getcwd()
        FileHandler(location=sys.argv[0]).change_working_directory()
        return (
            'all' in arguments.commands, arguments,
            current_working_directory_backup)

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _restore_current_directory(
# #         cls: SelfClass, clear: builtins.bool, temp_file_patterns: Iterable,
# #         current_directory=None
# #     ) -> SelfClass:
    def _restore_current_directory(
        cls, clear, temp_file_patterns, current_directory=None
    ):
# #
        '''
            Restores former directory state. This method deletes e.g. \
            temporary binary file and test files.

            Examples:

            >>> current_working_directory_backup = FileHandler(os.getcwd())

            >>> CommandLine._restore_current_directory(
            ...     clear=False, temp_file_patterns=()
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> CommandLine._restore_current_directory(
            ...     clear=False, temp_file_patterns=(),
            ...     current_directory=__test_folder__.path
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>

            >>> current_working_directory_backup.change_working_directory(
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...

            >>> test_folder = FileHandler(
            ...     'temp_restore_current_directory', make_directory=True)
            >>> FileHandler(test_folder.path + 'file').content = 'hans'
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> CommandLine._restore_current_directory(
            ...     clear=True, temp_file_patterns=('^temp_.*$',)
            ... ) # doctest: +ELLIPSIS
            <class ...CommandLine...>
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...Delete temporary files in "..." which matches "...".\\n'
            >>> test_folder.is_element()
            False

            >>> current_working_directory_backup.change_working_directory(
            ... ) # doctest: +ELLIPSIS
            Object of "Handler" with path "...
        '''
        if clear:
            cls._clear_temp_files(temp_file_patterns)
        if current_directory is not None:
            FileHandler(location=current_directory).change_working_directory()
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _clear_temp_files(
# #         cls: SelfClass, temp_file_patterns: Iterable
# #     ) -> SelfClass:
    def _clear_temp_files(cls, temp_file_patterns):
# #
        '''
            Clears all temporary files in current directory.

            **temp_file_patterns** - Defines wich file name matches a \
                                     temporary file.
        '''
        current_working_directory = FileHandler()
        __logger__.info(
            'Delete temporary files in "{path}" which matches '
            '"{pattern}".'.format(
                path=current_working_directory.path, pattern='", "'.join(
                    temp_file_patterns)))
        current_working_directory.delete_file_patterns(*temp_file_patterns)
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _get_packages(
# #         cls: SelfClass, current_working_directory_backup: builtins.str,
# #         frame: Frame
# #     ) -> builtins.list:
    def _get_packages(cls, current_working_directory_backup, frame):
# #
        '''
            Returns all sub packages found in the current package.

            Examples:

            >>> CommandLine._get_packages(
            ...     __test_folder__.path, inspect.currentframe())
            []
        '''
        if(os.getcwd() == current_working_directory_backup or
           FileHandler(location=frame.f_code.co_filename)
           .is_referenced_via_absolute_path()):
            current_working_directory_backup = ''
        else:
            current_working_directory_backup += os.sep
        initialize_file = FileHandler(
            location=current_working_directory_backup +
            frame.f_code.co_filename, respect_root_path=False)
        packages = []
        for file in FileHandler(
            location=initialize_file.directory, must_exist=True
        ):
            if Module.is_package(path=file.path):
                packages.append((file, FileHandler(
                    location=file.path + initialize_file.name)))
        return packages

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _package_argument_parser(
# #         cls: SelfClass, name: builtins.str, frame: Frame,
# #         command_line_arguments: Iterable
# #     ) -> argparse.Namespace:
    def _package_argument_parser(cls, name, frame, command_line_arguments):
# #
        '''
            Returns a meta parser specialized for package interfaces.

            Examples:

            >>> CommandLine._package_argument_parser(
            ...     name=__name__, frame=inspect.currentframe()
            ... ) # doctest: +SKIP
            Namespace(...)
        '''
        Logger.change_all(level=('info',))
        package_name = Module.get_package_name(frame)
        choices = cls.PACKAGE_INTERFACE_ARGUMENTS[0]['specification']['choices']
        return cls.argument_parser(
            version='{package} {version} {status}'.format(
                package=String(package_name).camel_case_capitalize.content,
                version=sys.modules[name].__version__,
                status=sys.modules[name].__status__),
            module_name=name,
            arguments=cls.PACKAGE_INTERFACE_ARGUMENTS + command_line_arguments,
            scope={'choices': choices})

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _render_command_line_argument(
# #         cls: SelfClass, argument: builtins.object, scope: builtins.dict,
# #         keyword='specification'
# #     ) -> builtins.object:
    def _render_command_line_argument(
        cls, argument, scope, keyword='specification'
    ):
# #
        '''
            If a given argument property is marked as executable respectively \
            dynamic it's value will be determined.

            Examples:

            >>> CommandLine._render_command_line_argument(
            ...     {'execute': 'value'}, {'value': 'hans'})
            'hans'

            >>> CommandLine._render_command_line_argument(
            ...     {'execute': 'value'}, {}
            ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
            Traceback (most recent call last):
            ...
            boostnode.extension.native.SystemError: During rendering argumen...

            >>> CommandLine._render_command_line_argument('peter', {})
            'peter'
        '''
        if(builtins.isinstance(argument, builtins.dict) and
           'execute' in argument):
            try:
                return builtins.eval(argument['execute'], scope)
            except builtins.BaseException as exception:
# # python3.5
# #                 raise __exception__(
# #                     'During rendering argument "%s". Error "%s" occurs for'
# #                     ' "%s".', builtins.str(argument['execute']),
# #                     builtins.str(exception), keyword)
                raise __exception__(
                    'During rendering argument "%s". Error "%s" occurs for'
                    ' "%s".', convert_to_unicode(argument['execute']),
                    convert_to_unicode(exception), keyword)
# #
        return argument

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
Module.default(
    name=__name__, frame=inspect.currentframe(), default_caller=False)

# endregion

# region vim modline
# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:
# endregion
