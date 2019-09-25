#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''
    This module provides classes for dealing with python's way to transport \
    strings to any output stream.
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
from copy import copy
import inspect
import logging
# # python3.5 from logging import getLoggerClass, getLogger, LogRecord
from logging import getLoggerClass, getLogger
from logging import StreamHandler as LoggingStreamHandler
from logging import Formatter as LoggingFormatter
import multiprocessing
import os
import sys
import threading
# # python3.5 import queue as native_queue
import Queue as native_queue

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

# # python3.5 pass
from boostnode import convert_to_string, convert_to_unicode
from boostnode.extension.file import Handler as FileHandler
from boostnode.extension.native import Module
# # python3.5 from boostnode.extension.type import Self, SelfClass
pass
from boostnode.paradigm.aspectOrientation import JointPoint
from boostnode.paradigm.objectOrientation import Class

# endregion

# region constants

SET_ATTRIBUTE_MODE = '\033[%dm'

RESET_ATTRIBUTE_MODE = 0
BOLD = 1
DIM = 2
ITALIC = 3
UNDERLINE = 4
BLINK = 5
BLINK_RAPID = 6
REVERSE = 7
HIDDEN = 8
CROSSED_OUT = 9
DEFAULT_FONT = 10
FONT_1 = 11
FONT_2 = 12
FONT_3 = 13
FONT_4 = 14
FONT_5 = 15
FONT_6 = 16
FONT_7 = 17
FRAKTUR_HARDLY = 20
BOLD_OFF = 21
BOLD_INTENSITY_OFF = 22
ITALIC_OFF = 23
UNDERLINE_OFF = 24
BLINK_OFF = 25
RESERVERD_1 = 26
REVERSE_OFF = 27
REVEAL_OFF = 28
CROSSED_OUT_OFF = 29
COLOR = {
    'foreground': {
        'black': 30,
        'red': 31,
        'green': 32,
        'yellow': 33,
        'blue': 34,
        'magenta': 35,
        'cyan': 36,
        'white': 37,
        'extended': 38,
        'fallback': 39
    }, 'background': {
        'black': 40,
        'red': 41,
        'green': 42,
        'yellow': 43,
        'blue': 44,
        'magenta': 45,
        'cyan': 46,
        'white': 47,
        'extended': 48,
        'fallback': 49
    }
}
HIGH_COLOR = {
    'foreground': {
        'black': 90,
        'red': 91,
        'green': 92,
        'yellow': 93,
        'blue': 94,
        'magenta': 95,
        'cyan': 96,
        'white': 97
    }, 'background': {
        'black': 100,
        'red': 101,
        'green': 102,
        'yellow': 103,
        'blue': 104,
        'magenta': 105,
        'cyan': 106,
        'white': 107
    }
}
RESERVED_2 = 50
FRAMED = 51
ENCIRCLED = 52
OVERLINED = 53
FRAMED_ENCIRCLED_OFF = 54
OVERLINED_OFF = 55
RESERVED_3 = 56
RESERVED_4 = 57
RESERVED_5 = 58
RESERVED_6 = 59
IDEOGRAM_UNDERLINE = 60
IDEOGRAM_DOUBLE_UNDERLINE = 61
IDEOGRAM_OVERLINE = 62
IDEOGRAM_DOUBLE_OVERLINE = 63
IDEOGRAM_STRESS_MARKING = 64
IDEOGRAM_OFF = 65

# endregion


# region classes

class Buffer(Class, LoggingStreamHandler):

    '''
        This class represents a layer for writing and reading to an output \
        buffer realized as file, queue or variable.

        **file**                    - a file path or file handler to use as \
                                      buffer

        **queue**                   - a queue object to use as buffer

        **support_multiprocessing** - indicates whether buffer read and write \
                                      requests should be multiprocessing save

        Examples:

        >>> buffer = Buffer(file=__test_folder__.path + 'Buffer')
        >>> buffer.clear() # doctest: +ELLIPSIS
        '...'
        >>> print('hans', file=buffer, end='+')
        >>> buffer.content
        'hans+'
    '''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __init__(
# #         self: Self, file=None, queue=None, support_multiprocessing=False
# #     ) -> None:
    def __init__(
        self, file=None, queue=None, support_multiprocessing=False,
        force_string=False
    ):
# #
        '''
            Saves the file path in the current instance. If "file" is "None" \
            an instance variable is used as buffer.

            Examples:

            >>> Buffer(
            ...     file=__test_folder__.path + '__init__'
            ... ).file # doctest: +ELLIPSIS
            Object of "Handler" with path "...__init__" ...

            >>> Buffer(
            ...     queue=True, support_multiprocessing=True
            ... ).queue # doctest: +ELLIPSIS
            <multiprocessing.queues.Queue object at ...>
        '''
# # python3.5         pass
        self.force_string = force_string
        '''Saves the last written input.'''
        self.last_written = ''
        if support_multiprocessing:
            self._lock = multiprocessing.Lock()
        '''Saves the file handler instance for writing content into.'''
        self.file = None
        '''Saves the queue instance for writing content into.'''
        self.queue = None
        if queue is not None:
            self.queue = native_queue.Queue()
            if support_multiprocessing:
                self.queue = multiprocessing.Queue()
            if(builtins.isinstance(queue, native_queue.Queue) or
               support_multiprocessing and
               builtins.isinstance(queue, multiprocessing.queues.Queue)):
                self.queue = queue
        elif file is not None:
            self.file = FileHandler(location=file)
        '''
            A lock object to guarantee that no other thread read from buffer \
            during truncating or writing.
        '''
        self._lock = threading.Lock()
        '''Saves the current buffer content.'''
# # python3.5
# #         self._content = ''
        self._content = builtins.str() if self.force_string else ''
# #

    @JointPoint
# # python3.5     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> repr(Buffer())
            'Object of "Buffer" (memory buffered) with content "".'

            >>> buffer = Buffer(file=__test_folder__.path + '__repr__')
            >>> buffer.write('hans') # doctest: +ELLIPSIS
            Object of "Buffer" (file buffered with "...__repr__" (type: file...

            >>> repr(Buffer(queue=True))
            'Object of "Buffer" (queue buffered) with content "".'

            >>> repr(Buffer(queue=native_queue.Queue()))
            'Object of "Buffer" (queue buffered) with content "".'
        '''
        buffer_type = 'memory'
        type_addition = ''
        if self.file:
            buffer_type = 'file'
            type_addition = ' with "%s"' % builtins.repr(self.file)
        elif self.queue:
            buffer_type = 'queue'
# # python3.5
# #         pass
        if self.force_string:
            return (
                'Object of "{class_name}" ({type} buffered{type_addition})'
                ' with content "{content}".'.format(
                    class_name=self.__class__.__name__,
                    type=buffer_type, type_addition=type_addition,
                    content=convert_to_unicode(self.content)))
# #
        return (
            'Object of "{class_name}" ({type} buffered{type_addition}) '
            'with content "{content}".'.format(
                class_name=self.__class__.__name__, type=buffer_type,
                type_addition=type_addition, content=self.content))

    @JointPoint
# # python3.5     def __str__(self: Self) -> builtins.str:
    def __str__(self):
        '''
            Invokes if this object is tried to interpreted as string.

            Examples:

            >>> str(Buffer().write('test'))
            'test'
        '''
        return self.content

    @JointPoint
# # python3.5     def __bool__(self: Self) -> builtins.bool:
    def __nonzero__(self):
        '''
            Invokes if this object is tried to interpreted as boolean.

            Examples:

            >>> bool(Buffer().write('test'))
            True

            >>> bool(Buffer())
            False
        '''
        return builtins.bool(self.content)

    # # # endregion

    # # endregion

    # # region getter

    @JointPoint
# # python3.5     def get_content(self: Self) -> builtins.str:
    def get_content(self):
        '''
            Getter for the current content.

            Examples:

            >>> Buffer().write('test').content
            'test'

            >>> Buffer(queue=True).write('test').content
            'test'
        '''
        with self._lock:
            if self.file is not None:
                self._content = self.file.content
            elif self.queue:
                self._content = ''
                temp_buffer = []
                while not self.queue.empty():
# # python3.5
# #                     temp_buffer.append(self.queue.get())
                    temp_buffer.append(convert_to_unicode(
                        self.queue.get()))
# #
                    self._content += temp_buffer[-1]
                for content in temp_buffer:
                    self.queue.put(content)
# # python3.5
# #         pass
        if self.force_string and builtins.isinstance(
            self._content, builtins.unicode
        ):
            self._content = convert_to_string(self._content)
# #
        return self._content

    # # endregion

    @JointPoint
# # python3.5     def write(self: Self, content: builtins.str) -> Self:
    def write(self, content):
        '''
            Writes content to the current output buffer file. If the current \
            given file "Buffer.file" doesn't exists it will be created.

            **content** - content to write into current buffer instance

            Examples:

            >>> buffer = Buffer(file=__test_folder__.path + 'write')
            >>> buffer.clear() # doctest: +ELLIPSIS
            '...'
            >>> buffer.write('hans') # doctest: +ELLIPSIS
            Object of "Buffer" (file buffered with "...write...nt "hans".
            >>> buffer.content
            'hans'

            >>> buffer = Buffer()
            >>> buffer.write('hans')
            Object of "Buffer" (memory buffered) with content "hans".
            >>> buffer.content
            'hans'
        '''
# # python3.5
# #         pass
        if self.force_string and builtins.isinstance(
            content, builtins.unicode
        ):
            content = convert_to_string(content)
# #
        with self._lock:
            self.last_written = content
            if self.file is not None:
                self.file.content += self.last_written
            elif self.queue:
                self.queue.put(self.last_written)
            else:
                self._content += self.last_written
        return self

    @JointPoint
# # python3.5     def flush(self: Self) -> Self:
    def flush(self):
        '''
            Flush methods usually called to guarantee that all objects putted \
            to "write()" are materialized on their provided media. This \
            implementation exists only for compatibility reasons.

            Examples:

            >>> Buffer().flush()
            Object of "Buffer" (memory buffered) with content "".
        '''
        return self

    @JointPoint
# # python3.5     def clear(self: Self, delete=True) -> builtins.str:
    def clear(self, delete=True):
        '''
            Removes the current output buffer content.

            **delete** - indicates whether a file buffer should be deleted or \
                         truncated

            Examples:

            >>> buffer = Buffer(file=__test_folder__.path + 'clear')

            >>> buffer.clear() # doctest: +ELLIPSIS
            '...'
            >>> buffer.write('hans') # doctest: +ELLIPSIS
            Objec...(file buffered with "...clear...with content "hans".

            >>> buffer.clear(False)
            'hans'
            >>> buffer.content
            ''

            >>> buffer = Buffer()
            >>> buffer.write('hans')
            Object of "Buffer" (memory buffered) with content "hans".
            >>> buffer.clear()
            'hans'
            >>> buffer.content
            ''

            >>> buffer = Buffer(queue=True)

            >>> buffer.clear()
            ''

            >>> buffer.write('hans')
            Object of "Buffer" (queue buffered) with content "hans".
            >>> buffer.write('hans')
            Object of "Buffer" (queue buffered) with content "hanshans".
            >>> buffer.clear()
            'hanshans'
            >>> buffer.content
            ''
        '''
        with self._lock:
            if self.file is not None:
                content = self.file.content
                if delete:
                    self.file.remove_file()
                else:
                    self.file.content = ''
            elif self.queue:
                content = ''
                while not self.queue.empty():
                    content += self.queue.get()
            else:
                content = self._content
                self._content = ''
# # python3.5
# #         pass
        if self.force_string:
            self._content = builtins.str()
            content = convert_to_string(content)
# #
        return content

    # endregion


class Print(Class):

    '''
        Provides a high level printing class on top of pythons native print \
        function.

        **output**    - are the strings which should be printed or saved.

        **codewords** - represents all possible optional arguments.
            "codeword['start']"
            "codeword['separator']"
            "codeword['end']"
            "codeword['flush']"
            "codeword['buffer']" could be any instance as buffer which \
                                 implements a "write()" method.

        Returns the given string or the last element if an iterable object \
        was given.
    '''

    # region properties

    replace = False
    '''Indicates whether last line should be replaced.'''
    start = ''
    '''Print this string before every first argument to every "put()" call.'''
    separator = ' '
    '''Print this string between every given element to one "put()" call.'''
    end = '\n'
    '''Print this string after every last argument to every "put()" call.'''
    default_buffer = sys.stdout
    '''
        Redirect print output to this buffer if no buffer is defined for \
        current instance.
    '''

    # endregion

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __init__(
# #         self: Self, *output: builtins.object, **codewords: builtins.object
# #     ) -> None:
    def __init__(self, *output, **codewords):
# #
        '''
            Writes something to the output buffer or prints to standard \
            output.

            Examples:

            >>> buffer = Buffer()

            >>> Print(native_queue.Queue(), buffer=buffer) # doctest: +ELLIPSIS
            Object of "Print" with "...

            >>> queue1 = native_queue.Queue()
            >>> queue2 = native_queue.Queue()
            >>> queue1.put('hans')
            >>> queue2.put('hans')
            >>> Print(
            ...     queue1, queue2, buffer=buffer, flush=True
            ... ) # doctest: +ELLIPSIS
            Object of "Print" with "...

            >>> Print.default_buffer = Buffer()
            >>> Print('hans', 'hans again') # doctest: +ELLIPSIS
            Object of "Print" with "Object of "Buffer" (mem... "hans hans again
            ".".

            >>> buffer = Buffer()
            >>> Print(
            ...     'hans,', 'peter', end=' and klaus', sep=' ', buffer=buffer
            ... ) # doctest: +ELLIPSIS
            Object of "Print" with "Object of "Buffer" (memory buffered...".".

            >>> buffer # doctest: +ELLIPSIS
            Object ... (memory buffered) with content "hans, peter and klaus".
        '''
        keywords = {
            'replace': self.__class__.replace,
            'start': self.__class__.start,
            'separator': self.__class__.separator,
            'end': self.__class__.end,
            'buffer': self.__class__.default_buffer,
            'flush': codewords.get('replace', False)}
        keywords.update(codewords)
        '''Redirect print output to this buffer.'''
        self.buffer = keywords['buffer']
        output = builtins.list(output)
        for index, out in builtins.enumerate(output):
            if builtins.isinstance(out, native_queue.Queue):
                result = ''
                while not out.empty():
                    if index != 0 and keywords['separator']:
# # python3.5
# #                         result += builtins.str(keywords['separator'])
# #                     result += out.get()
                        result += convert_to_unicode(
                            keywords['separator'])
                    result += convert_to_unicode(out.get())
# #
                output[index] = result
            elif index == 0:
# # python3.5                 output[index] = builtins.str(out)
                output[index] = convert_to_unicode(out)
            else:
# # python3.5
# #                 output[index] = '%s%s' % (builtins.str(
# #                     keywords['separator']
# #                 ), builtins.str(out))
                output[index] = '%s%s' % (convert_to_unicode(
                    keywords['separator']
                ), convert_to_unicode(out))
# #
        line_replace = '\033[1A\r\033[2K' if keywords['replace'] else ''
        output = [keywords['start'], line_replace] + output + [keywords['end']]
# # python3.5
# #         builtins.print(
# #             *output, sep='', end='', file=keywords['buffer'],
# #             flush=keywords['flush'])
        builtins.print(*filter(lambda content: convert_to_string(
            content
        ), output), sep='', end='', file=keywords['buffer'])
        if keywords['flush']:
            sys.stdout.flush()
# #

    @JointPoint
# # python3.5     def __str__(self: Self) -> builtins.str:
    def __str__(self):
        '''
            Is triggered if this object should be converted to string.

            Examples:

            >>> str(Print('peter', buffer=Buffer()))
            'peter\\n'

            >>> print = Print('', buffer=Buffer())
            >>> print.buffer = None
            >>> str(print)
            ''
        '''
        if builtins.isinstance(self.buffer, Buffer):
# # python3.5             return builtins.str(self.buffer)
            return convert_to_unicode(self.buffer)
        return ''

    @JointPoint
# # python3.5     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> repr(Print(buffer=Buffer())) # doctest: +ELLIPSIS
            'Object of "Print" with "Object of "Buffer"..." and default "Ob...'
        '''
        return 'Object of "{class_name}" with "{buffer}" and default '\
               '"{default_buffer}".'.format(
                   class_name=self.__class__.__name__,
                   buffer=builtins.repr(self.buffer),
                   default_buffer=builtins.repr(self.__class__.default_buffer))

    # # # endregion

    # # endregion

    # endregion


class ColoredLoggingFormatter(LoggingFormatter):

    '''
        Wraps python's native logging formatter to support level specific \
        colors.
    '''

    COLOR_TO_LEVEL_MAPPING = {
        'DEBUG': 'blue',
        'INFO': 'green',
        'WARNING': 'yellow',
        'CRITICAL': 'magenta',
        'ERROR': 'red'
    }
    '''Defines the level to color mapping.'''

    @JointPoint
# # python3.5     def format(self: Self, record: LogRecord) -> builtins.str:
    def format(self, record):
        '''Appends the level specified color to the logging output.'''
        levelname = record.levelname
        if levelname in self.COLOR_TO_LEVEL_MAPPING:
            record.levelname = (
                SET_ATTRIBUTE_MODE % RESET_ATTRIBUTE_MODE
            ) + (
                SET_ATTRIBUTE_MODE % COLOR['foreground'][
                    self.COLOR_TO_LEVEL_MAPPING[levelname]
                ]
            ) + levelname + (SET_ATTRIBUTE_MODE % RESET_ATTRIBUTE_MODE)
        '''
            Take this method type by another instance of this class via \
            introspection.
        '''
        return builtins.getattr(builtins.super(
            self.__class__, self
        ), inspect.stack()[0][3])(record)


class Logger(Class):

    '''
        This class provides handling with all components dealing with logger \
        object. It stores all logger components in a single data structure.
    '''

    # region properties

    level = 'critical',
    '''Defines the default logging level for new created logger handler.'''
    colored_format = (SET_ATTRIBUTE_MODE % COLOR['foreground']['cyan']) + (
        '%(asctime)s - %(name)s' + (
            SET_ATTRIBUTE_MODE % RESET_ATTRIBUTE_MODE
        ) + ' - %(levelname)s - %(message)s'),
    '''Colored output format.'''
    format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    '''Output format.'''
    terminator = '\n',
    '''Suffix in each logging output.'''
    buffer = sys.stdout,
    '''Output buffer for all logging outputs.'''
    instances = []
    '''Saves all logging handler instances.'''

    # endregion

    # region static methods

    # # region public

    # # # region special

    @JointPoint(builtins.classmethod)
# # python3.5     def __str__(cls: SelfClass) -> builtins.str:
    def __str__(cls):
        '''
            Is triggered if a "Logger" object should be converted to string.

            Examples:

            >>> str(Logger())
            ''

            >>> logger_backup = Logger.buffer
            >>> Logger.buffer = Buffer(),
            >>> str(Logger()) # doctest: +ELLIPSIS
            ''
            >>> Logger.buffer = logger_backup
        '''
        result = ''
        for buffer in cls.buffer:
            if builtins.isinstance(buffer, Buffer):
# # python3.5                 result += builtins.str(buffer)
                result += convert_to_unicode(buffer)
        return result

    @JointPoint(builtins.classmethod)
# # python3.5     def __repr__(cls: SelfClass) -> builtins.str:
    def __repr__(cls):
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> repr(Logger()) # doctest: +ELLIPSIS
            'Object of "Logger" with logger "...

            >>> logger1 = Logger.get()
            >>> repr(Logger()) # doctest: +ELLIPSIS
            'Object of "Logger" with logger "...

            >>> logger1 = Logger.get()
            >>> logger2 = Logger.get('hans')
            >>> repr(Logger()) # doctest: +ELLIPSIS
            'Object of "Logger" with logger "... and ...
        '''
        handler_string = formatter_string = ''
        for index, logger in builtins.enumerate(cls.instances):
            start = ', "'
            end = '"'
            if index + 1 == builtins.len(cls.instances):
                start = ' and "'
                end = ''
            if index == 0:
                start = ''
            handler_string += start + builtins.repr(logger.handlers[0]) + end
            formatter_string += start + builtins.repr(
                logger.handlers[0].formatter
            ) + end
# # python3.5
# #         return (
# #             'Object of "{class_name}" with logger "{handler}", formatter '
# #             '"{formatter}" and buffer "{buffer}".'.format(
# #                 class_name=cls.__name__, handler=handler_string,
# #                 formatter=formatter_string,
# #                 buffer=builtins.str(cls.buffer)))
        return (
            'Object of "{class_name}" with logger "{handler}", formatter '
            '"{formatter}" and buffer "{buffer}".'.format(
                class_name=cls.__name__, handler=handler_string,
                formatter=formatter_string,
                buffer=convert_to_unicode(cls.buffer)))
# #

    # # # endregion

    @JointPoint(builtins.classmethod)
# # python3.5     def flush(cls: SelfClass) -> SelfClass:
    def flush(cls):
        '''
            Flushes all buffers in all logger handlers.

            Examples:

            >>> Logger.flush() # doctest: +ELLIPSIS
            <class '...Logger'>
        '''
        for logger in cls.instances:
            for handler in logger.handlers:
                handler.stream.flush()
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def get(
# #         cls: SelfClass, name=__name__, level=(), buffer=(), terminator=(),
# #         colored_format=(), format=()
# #     ) -> getLoggerClass():
    def get(
        cls, name=__name__, level=(), buffer=(), terminator=(),
        colored_format=(), format=()
    ):
# #
        '''
            Returns a new or existing instance of a logger with given \
            properties. If a logger was already registered under given name \
            the existing instance is given back and a new instance otherwise.

            **name**           - logger name to get

            **level**          - sets levels for all logger

            **buffer**         - sets buffers for all logger

            **terminator**     - sets an ending char for each log message in \
                                 each logger

            **colored_format** - sets templates for colored logging messages \
                                 in returned logger, if "None" is given \
                                 normal format will be used instead.

            **format**         - sets templates for logging messages in each \
                                 logger

            Examples:

            >>> logger_a = Logger.get('test', buffer=(__test_buffer__,))
            >>> logger_b = Logger.get('test')
            >>> logger_c = Logger.get('test', buffer=(__test_buffer__,))
            >>> logger_a is logger_b
            True

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> logger_a.critical('Log some information.')
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '... - test... - ...CRITICAL... - Log some information.\\n'
        '''
        for logger in builtins.filter(
            lambda logger: logger.name == name, cls.instances
        ):
            if level or buffer or terminator or colored_format or format:
                cls.instances[cls.instances.index(
                    logger
                )] = cls._generate_logger(
                    name, level, buffer, terminator, colored_format, format)
            return logger
        cls.instances.append(cls._generate_logger(
            name, level, buffer, terminator, colored_format, format))
        return cls.instances[-1]

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def change_all(
# #         cls: SelfClass, level=(), buffer=(), terminator=(),
# #         colored_format=(), format=()
# #     ) -> SelfClass:
    def change_all(
        cls, level=(), buffer=(), terminator=(), colored_format=(),
        format=()
    ):
# #
        '''
            This method changes the given properties to all created logger \
            instances and saves the given properties as default properties \
            for future created logger instances.

            Note that every argument except buffer setted to "None" will not \
            edit this logger component. If you don't want to change buffer \
            leave it by its default value.

            **level**          - sets levels for all logger

            **buffer**         - sets buffers for all logger

            **terminator**     - sets an ending char for each log message in \
                                 each logger

            **colored_format** - sets templates for colored logging messages \
                                 in returned logger

            **format**         - sets templates for logging messages in each \
                                 logger

            Examples:

            >>> Logger.change_all() # doctest: +ELLIPSIS
            <class ...Logger...>
        '''
        cls._set_properties(level, buffer, terminator, colored_format, format)
        for logger in cls.instances:
# # python3.5             new_handler = logger.handlers.copy()
            new_handler = copy(logger.handlers)
            if buffer:
                new_handler = []
                for new_buffer in cls.buffer:
                    new_handler.append(LoggingStreamHandler(stream=new_buffer))
            for handler, level, terminator, colored_format, format in \
            builtins.zip(
                new_handler, cls.level, cls.terminator, cls.colored_format,
                cls.format
            ):
                # TODO check new branches.
                if colored_format is None:
                    handler.setFormatter(LoggingFormatter(format))
                else:
                    handler.setFormatter(ColoredLoggingFormatter(
                        colored_format))
                handler.terminator = terminator
                handler.setLevel(level.upper())
            for handler in logger.handlers:
                logger.removeHandler(handler)
            for handler in new_handler:
                logger.addHandler(handler)
            logger.setLevel(builtins.getattr(logging, cls.level[0].upper()))
        return cls

    # # endregion

    # # region protected

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _set_properties(
# #         cls: SelfClass, level: builtins.tuple, buffer: builtins.tuple,
# #         terminator: builtins.tuple, colored_format: builtins.tuple,
# #         format: builtins.tuple
# #     ) -> SelfClass:
    def _set_properties(
        cls, level, buffer, terminator, colored_format, format
    ):
# #
        '''
            This method sets the class properties.

            Examples:

            >>> Logger._set_properties(
            ...     level=Logger.level, buffer=Logger.buffer,
            ...     terminator=Logger.terminator,
            ...     colored_format=Logger.colored_format, format=Logger.format
            ... ) # doctest: +ELLIPSIS
            <class '...Logger'>
        '''
        # TODO check branches.
        scope = builtins.locals()
        for name in builtins.filter(lambda name: scope[name], (
            'level', 'buffer', 'terminator', 'colored_format', 'format'
        )):
            builtins.setattr(cls, name, scope[name])
        return cls

    @JointPoint(builtins.classmethod)
# # python3.5
# #     def _generate_logger(
# #         cls: SelfClass, name: builtins.str, level: builtins.tuple,
# #         buffer: builtins.tuple, terminator: builtins.tuple,
# #         colored_format: builtins.tuple, format: builtins.tuple
# #     ) -> getLoggerClass():
    def _generate_logger(
        cls, name, level, buffer, terminator, colored_format, format
    ):
# #
        '''
            Creates a new logger instance by initializing all its components \
            with given arguments or default properties saved as class \
            properties.

            Examples:

            >>> Logger._generate_logger(
            ...     'test', ('info',), (Buffer(),), ('',), (''), ('',)
            ... ) # doctest: +ELLIPSIS
            <logging.Logger object at ...>
        '''
        # TODO check branches.
        properties = []
        for property_name in (
            'level', 'buffer', 'terminator', 'colored_format', 'format'
        ):
            properties.append(
                builtins.locals()[property_name] if builtins.locals()[
                    property_name
                ] else builtins.getattr(cls, property_name))
        for handler in getLogger(name).handlers:
            getLogger(name).removeHandler(handler)
        logger = getLogger(name)
        logger.propagate = False
        for _level, _buffer, _terminator, _colored_format, _format in \
        builtins.zip(properties[0], properties[1], properties[2], properties[3], properties[4]):
            handler = LoggingStreamHandler(stream=_buffer)
            handler.terminator = _terminator
            handler.setLevel(_level.upper())
            # TODO check new branches
            if _colored_format is None:
                handler.setFormatter(LoggingFormatter(_format))
            else:
                handler.setFormatter(ColoredLoggingFormatter(_colored_format))
            logger.addHandler(handler)
        '''
            Set meta logger level to first given level (level is first \
            property).
        '''
        logger.setLevel(builtins.getattr(logging, properties[0][0].upper()))
        return logger

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
